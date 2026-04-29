import {
  AFFINITY_ADVANTAGES, CLASS, STATUS_EFFECT, FORMATION_ROW,
  DAMAGE_FORMULA, AFFINITY_DAMAGE_MULTIPLIER, ABILITY_POWER_MULTIPLIER_RANGES, ULTIMATE_CHARGE
} from '../data/constants.js';
import StatusEffectManager from './StatusEffectManager.js';
import BondManager from './BondManager.js';
import ABILITY_DEFINITIONS from '../data/abilityDefinitions.js';

export default class BattleEngine {
  constructor({ playerSquad, enemySquad, onEvent }) {
    this.onEvent = onEvent || (() => {});
    this.tick = 0;
    this.running = false;

    this.playerFormation = { FRONT: [], BACK: [] };
    this.enemyFormation  = { FRONT: [], BACK: [] };

    const activeHeroDefIds = playerSquad.map(entry => entry.hero.heroDefId).filter(Boolean);

    for (const entry of playerSquad) {
      const stats = entry.hero.computeStats();
      const bondBonus = BondManager.getHeroBondBonus(entry.hero.heroDefId, activeHeroDefIds);
      const boostedStats = {
        hp: Math.floor(stats.hp * (1 + bondBonus)),
        defense: Math.floor(stats.defense * (1 + bondBonus)),
        damage: Math.floor(stats.damage * (1 + bondBonus))
      };
      const combatant = {
        id: entry.hero.id, name: entry.hero.name, heroClass: entry.hero.heroClass,
        affinity: entry.hero.affinity, range: entry.hero.range || 'melee',
        hp: boostedStats.hp, maxHp: boostedStats.hp,
        stats: boostedStats, ultimateCharge: 0, ultimateReadyNotified: false,
        abilityIds: entry.hero.normalAbilityIds || [],
        ultimateAbilityId: entry.hero.ultimateAbilityId,
        ultimateAbilityId2: entry.hero.ultimateAbilityId2 || null,
        isPlayer: true, row: entry.row, bondBonus
      };
      this.playerFormation[entry.row].push(combatant);
    }

    for (const e of enemySquad) {
      const combatant = {
        ...e,
        hp: e.stats.hp,
        maxHp: e.stats.hp,
        ultimateCharge: e.ultimateCharge || 0,
        ultimateReadyNotified: false,
        isPlayer: false
      };
      this.enemyFormation[e.row].push(combatant);
    }

    StatusEffectManager.clear();
  }

  start() { this.running = true; }

  step() {
    if (!this.running) return;
    this.tick++;

    const allCombatants = this._allCombatants();
    for (const c of allCombatants) {
      if (StatusEffectManager.hasEffect(c.id, STATUS_EFFECT.BURNING)) {
        const effects = StatusEffectManager.getActiveEffects(c.id).filter(e => e.type === STATUS_EFFECT.BURNING);
        for (const e of effects) this._dealDamage(null, c, e.magnitude);
      }
    }
    StatusEffectManager.tick();

    for (const c of this._allCombatants()) {
      if (c.hp <= 0) continue;
      if (StatusEffectManager.hasEffect(c.id, STATUS_EFFECT.FREEZE)) {
        this.onEvent({ type: 'actionSkipped', heroId: c.id, reason: STATUS_EFFECT.FREEZE });
        continue;
      }

      this._chargeUltimate(c, ULTIMATE_CHARGE.PASSIVE_PER_SECOND);
      const abilityId = c.abilityIds[this.tick % c.abilityIds.length];
      const ability = ABILITY_DEFINITIONS.find(a => a.id === abilityId);
      if (!ability) continue;
      const targets = this._selectTargets(c, ability);
      for (const target of targets) {
        if (this._isHealingAbility(c, ability, target)) {
          const heal = this._calculateHealing(c, ability);
          this._heal(c, target, heal);
          continue;
        }
        if (this._isSupportAbility(c, target)) {
          this.onEvent({ type: 'support', casterId: c.id, targetId: target.id, abilityId: ability.id });
          continue;
        }
        const dmg = this._calculateDamage(c, target, ability);
        this._dealDamage(c, target, dmg);
        if (ability.statusEffect) {
          StatusEffectManager.apply({ type: ability.statusEffect, targetId: target.id, duration: 2, magnitude: Math.floor(dmg * 0.3), sourceHeroId: c.id });
          this.onEvent({ type: 'statusApplied', targetId: target.id, effect: ability.statusEffect });
        }
      }
      if (!StatusEffectManager.hasEffect(c.id, STATUS_EFFECT.FREEZE)) {
        this._chargeAllies(c.isPlayer, ULTIMATE_CHARGE.ALLY_CAST_BONUS);
      }
      this._autoTriggerUltimateIfNeeded(c.id);
    }

    const result = this.checkBattleEnd();
    if (result) {
      this.running = false;
      this.onEvent({ type: 'battleEnd', result });
    }
    this.onEvent({ type: 'tick', tick: this.tick, state: this.getState() });
  }

  triggerUltimate(heroId, slot = 'primary') {
    const c = this._findCombatant(heroId);
    if (!c || c.ultimateCharge < ULTIMATE_CHARGE.COST) return false;
    const abilityId = slot === 'secondary' && c.ultimateAbilityId2 ? c.ultimateAbilityId2 : c.ultimateAbilityId;
    const ability = ABILITY_DEFINITIONS.find(a => a.id === abilityId);
    if (!ability) return false;
    c.ultimateCharge = Math.max(0, c.ultimateCharge - ULTIMATE_CHARGE.COST);
    const targets = this._selectTargets(c, ability);
    for (const target of targets) {
      if (this._isHealingAbility(c, ability, target)) {
        const heal = this._calculateHealing(c, ability);
        this._heal(c, target, heal);
        continue;
      }
      if (this._isSupportAbility(c, target)) {
        this.onEvent({ type: 'support', casterId: c.id, targetId: target.id, abilityId: ability.id });
        continue;
      }
      const dmg = this._calculateDamage(c, target, ability);
      this._dealDamage(c, target, dmg);
    }
    c.ultimateReadyNotified = c.ultimateCharge >= ULTIMATE_CHARGE.READY;
    this.onEvent({ type: 'ultimateTriggered', heroId, abilityId, slot });
    return true;
  }

  _chargeAllies(isPlayer, amount) {
    const formation = isPlayer ? this.playerFormation : this.enemyFormation;
    const allies = [...formation.FRONT, ...formation.BACK].filter(c => c.hp > 0);
    for (const ally of allies) this._chargeUltimate(ally, amount);
  }

  _chargeUltimate(combatant, amount) {
    if (amount <= 0) return;
    const before = combatant.ultimateCharge;
    combatant.ultimateCharge = Math.min(ULTIMATE_CHARGE.AUTO_TRIGGER, combatant.ultimateCharge + amount);
    if (before < ULTIMATE_CHARGE.READY && combatant.ultimateCharge >= ULTIMATE_CHARGE.READY && !combatant.ultimateReadyNotified) {
      combatant.ultimateReadyNotified = true;
      this.onEvent({ type: 'ultimateReady', id: combatant.id, slot: 'primary' });
      if (combatant.ultimateAbilityId2) this.onEvent({ type: 'ultimateReady', id: combatant.id, slot: 'secondary' });
    }
  }

  _autoTriggerUltimateIfNeeded(heroId) {
    const c = this._findCombatant(heroId);
    if (!c || c.ultimateCharge < ULTIMATE_CHARGE.AUTO_TRIGGER) return;
    this.triggerUltimate(heroId);
    this.onEvent({ type: 'ultimateAutoTriggered', heroId });
  }

  _calculateDamage(attacker, target, ability) {
    const attackerDmg = attacker.stats?.damage || 0;
    const abilityPowerMultiplier = this._resolveAbilityPowerMultiplier(ability);

    let rawDamage = attackerDmg * abilityPowerMultiplier;

    const defenderDef = target.stats?.defense || 0;
    let reducedDamage = rawDamage * (1 - (defenderDef / (defenderDef + DAMAGE_FORMULA.defenseMitigationConstant)));

    const adv = AFFINITY_ADVANTAGES[attacker.affinity];
    let affinityMultiplier = AFFINITY_DAMAGE_MULTIPLIER.NEUTRAL;
    if (adv) {
      if (adv.strongVs === target.affinity) affinityMultiplier = AFFINITY_DAMAGE_MULTIPLIER.STRONG;
      else if (adv.weakVs === target.affinity) affinityMultiplier = AFFINITY_DAMAGE_MULTIPLIER.WEAK;
    }

    if (StatusEffectManager.hasEffect(attacker.id, STATUS_EFFECT.BLIND)) reducedDamage *= 0.5;

    return Math.max(1, Math.floor(reducedDamage * affinityMultiplier));
  }

  _calculateHealing(attacker, ability) {
    const attackerDmg = attacker.stats?.damage || 0;
    const multiplier = this._resolveAbilityPowerMultiplier(ability, true);
    return Math.max(1, Math.floor(attackerDmg * multiplier));
  }

  _isHealingAbility(attacker, ability, target) {
    return ability.abilityClass === CLASS.HEALER && attacker.isPlayer === target.isPlayer;
  }

  _isSupportAbility(attacker, target) {
    return attacker.isPlayer === target.isPlayer;
  }

  _resolveAbilityPowerMultiplier(ability, isHeal = false) {
    const baseMultiplier = Math.max(0, (ability?.scalingBase || 10) / 20);
    if (isHeal) {
      return this._clamp(baseMultiplier, ABILITY_POWER_MULTIPLIER_RANGES.HEAL);
    }
    const isAoe = ability?.targetLogic === 'all_enemies';
    const isUltimate = ability?.type === 'ultimate';
    const range = isUltimate
      ? (isAoe ? ABILITY_POWER_MULTIPLIER_RANGES.ULTIMATE_AOE : ABILITY_POWER_MULTIPLIER_RANGES.ULTIMATE_SINGLE)
      : (isAoe ? ABILITY_POWER_MULTIPLIER_RANGES.NORMAL_AOE : ABILITY_POWER_MULTIPLIER_RANGES.NORMAL_SINGLE);
    return this._clamp(baseMultiplier, range);
  }

  _clamp(value, range) {
    return Math.min(range.max, Math.max(range.min, value));
  }

  _heal(healer, target, amount) {
    target.hp = Math.min(target.maxHp, target.hp + amount);
    this.onEvent({ type: 'heal', healerId: healer?.id || null, targetId: target.id, amount, finalHp: target.hp, maxHp: target.maxHp });
  }

  _dealDamage(attacker, target, amount) {
    target.hp = Math.max(0, target.hp - amount);
    this.onEvent({ type: 'damage', attackerId: attacker?.id || null, targetId: target.id, amount, finalHp: target.hp, maxHp: target.maxHp });
    if (target.hp <= 0) this._handleDefeat(target);
  }

  _handleDefeat(combatant) {
    this.onEvent({ type: 'heroDefeated', id: combatant.id, isPlayer: combatant.isPlayer });
    const formation = combatant.isPlayer ? this.playerFormation : this.enemyFormation;
    for (const row of Object.keys(formation)) {
      const idx = formation[row].findIndex(c => c.id === combatant.id);
      if (idx >= 0) formation[row].splice(idx, 1);
    }
    if (formation.FRONT.length === 0 && formation.BACK.length > 0) {
      this.onEvent({ type: 'rowWiped', isPlayer: combatant.isPlayer });
      const meleeBack = formation.BACK.filter(c => c.range === 'melee');
      for (const c of meleeBack) {
        formation.FRONT.push(c);
        formation.BACK.splice(formation.BACK.indexOf(c), 1);
      }
    }
  }

  _selectTargets(attacker, ability) {
    const isPlayer = attacker.isPlayer;
    const targetFormation = isPlayer ? this.enemyFormation : this.playerFormation;

    if (StatusEffectManager.hasEffect(attacker.id, STATUS_EFFECT.ROOT)) {
      const available = [...(targetFormation.FRONT.length ? targetFormation.FRONT : targetFormation.BACK)];
      return available.length ? [available[0]] : [];
    }

    const frontEmpty   = targetFormation.FRONT.length === 0;
    const canHitBack   = frontEmpty || attacker.heroClass === CLASS.ASSASSIN || ability.targetLogic === 'back_row_enemy';
    const validFront   = targetFormation.FRONT.filter(c => c.hp > 0);
    const validBack    = targetFormation.BACK.filter(c => c.hp > 0);
    const availableTargets = canHitBack ? [...validFront, ...validBack] : (validFront.length ? validFront : validBack);

    if (!availableTargets.length) return [];

    switch (ability.targetLogic) {
      case 'all_enemies':
        return availableTargets;
      case 'lowest_hp_enemy':
        return [availableTargets.sort((a, b) => a.hp - b.hp)[0]];
      case 'back_row_enemy':
        return validBack.length
          ? [validBack[Math.floor(Math.random() * validBack.length)]]
          : (validFront.length ? [validFront[0]] : []);
      case 'front_row_enemy':
        return validFront.length
          ? [validFront[Math.floor(Math.random() * validFront.length)]]
          : (validBack.length ? [validBack[0]] : []);
      case 'all_allies': {
        const allies = isPlayer
          ? [...this.playerFormation.FRONT, ...this.playerFormation.BACK]
          : [...this.enemyFormation.FRONT, ...this.enemyFormation.BACK];
        return allies.filter(c => c.hp > 0);
      }
      case 'lowest_hp_ally': {
        const allies  = isPlayer
          ? [...this.playerFormation.FRONT, ...this.playerFormation.BACK]
          : [...this.enemyFormation.FRONT,  ...this.enemyFormation.BACK];
        const living = allies.filter(c => c.hp > 0);
        return living.length ? [living.sort((a, b) => a.hp - b.hp)[0]] : [];
      }
      default:
        return [availableTargets[Math.floor(Math.random() * availableTargets.length)]];
    }
  }

  checkBattleEnd() {
    const playerAlive = [...this.playerFormation.FRONT, ...this.playerFormation.BACK].some(c => c.hp > 0);
    const enemyAlive  = [...this.enemyFormation.FRONT,  ...this.enemyFormation.BACK].some(c => c.hp > 0);
    if (!enemyAlive) return 'player_win';
    if (!playerAlive) return 'enemy_win';
    return null;
  }

  getState() {
    return { playerFormation: this.playerFormation, enemyFormation: this.enemyFormation, tick: this.tick };
  }

  _allCombatants() {
    return [
      ...this.playerFormation.FRONT, ...this.playerFormation.BACK,
      ...this.enemyFormation.FRONT,  ...this.enemyFormation.BACK
    ].filter(c => c.hp > 0);
  }

  _findCombatant(id) {
    return this._allCombatants().find(c => c.id === id) || null;
  }
}

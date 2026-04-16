import { AFFINITY_ADVANTAGES, CLASS, STATUS_EFFECT, FORMATION_ROW } from '../data/constants.js';
import StatusEffectManager from './StatusEffectManager.js';
import ABILITY_DEFINITIONS from '../data/abilityDefinitions.js';

export default class BattleEngine {
  constructor({ playerSquad, enemySquad, onEvent }) {
    this.onEvent = onEvent || (() => {});
    this.tick = 0;
    this.running = false;

    this.playerFormation = { FRONT: [], BACK: [] };
    this.enemyFormation  = { FRONT: [], BACK: [] };

    for (const entry of playerSquad) {
      const combatant = {
        id: entry.hero.id, name: entry.hero.name, heroClass: entry.hero.heroClass,
        affinity: entry.hero.affinity, range: entry.hero.range || 'melee',
        hp: entry.hero.computeStats().hp, maxHp: entry.hero.computeStats().hp,
        stats: entry.hero.computeStats(), ultimateCharge: 0,
        abilityIds: entry.hero.normalAbilityIds || [],
        ultimateAbilityId: entry.hero.ultimateAbilityId,
        isPlayer: true, row: entry.row
      };
      this.playerFormation[entry.row].push(combatant);
    }

    for (const e of enemySquad) {
      const combatant = { ...e, hp: e.stats.hp, maxHp: e.stats.hp, ultimateCharge: e.ultimateCharge || 0, isPlayer: false };
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
      const abilityId = c.abilityIds[this.tick % c.abilityIds.length];
      const ability = ABILITY_DEFINITIONS.find(a => a.id === abilityId);
      if (!ability) continue;
      const targets = this._selectTargets(c, ability);
      for (const target of targets) {
        const dmg = this._calculateDamage(c, target, ability.scalingBase);
        this._dealDamage(c, target, dmg);
        if (ability.statusEffect) {
          StatusEffectManager.apply({ type: ability.statusEffect, targetId: target.id, duration: 2, magnitude: Math.floor(dmg * 0.3), sourceHeroId: c.id });
          this.onEvent({ type: 'statusApplied', targetId: target.id, effect: ability.statusEffect });
        }
      }
      const chargeAmount = StatusEffectManager.hasEffect(c.id, STATUS_EFFECT.FREEZE) ? 0 : 15;
      this._chargeUltimate(c, chargeAmount);
    }

    const result = this.checkBattleEnd();
    if (result) {
      this.running = false;
      this.onEvent({ type: 'battleEnd', result });
    }
    this.onEvent({ type: 'tick', tick: this.tick, state: this.getState() });
  }

  triggerUltimate(heroId) {
    const c = this._findCombatant(heroId);
    if (!c || c.ultimateCharge < 100) return false;
    c.ultimateCharge = 0;
    const ability = ABILITY_DEFINITIONS.find(a => a.id === c.ultimateAbilityId);
    if (!ability) return false;
    const targets = this._selectTargets(c, ability);
    for (const target of targets) {
      const dmg = this._calculateDamage(c, target, ability.scalingBase * 2);
      this._dealDamage(c, target, dmg);
    }
    this.onEvent({ type: 'ultimateTriggered', heroId, abilityId: c.ultimateAbilityId });
    return true;
  }

  _chargeUltimate(combatant, amount) {
    combatant.ultimateCharge = Math.min(100, combatant.ultimateCharge + amount);
    if (combatant.ultimateCharge >= 100) {
      this.onEvent({ type: 'ultimateReady', id: combatant.id });
    }
  }

  _calculateDamage(attacker, target, baseDamage) {
    let dmg = baseDamage + (attacker.stats?.damage || 0);

    const adv = AFFINITY_ADVANTAGES[attacker.affinity];
    if (adv) {
      if (adv.strongVs === target.affinity) dmg *= 1.5;
      else if (adv.weakVs === target.affinity) dmg *= 0.75;
    }

    const shadowLight = new Set(['SHADOW', 'LIGHT']);
    if (shadowLight.has(attacker.affinity) && shadowLight.has(target.affinity)) dmg *= 1.5;

    if (StatusEffectManager.hasEffect(attacker.id, STATUS_EFFECT.BLIND)) dmg *= 0.5;

    const def = target.stats?.defense || 0;
    dmg = Math.max(1, Math.floor(dmg - def * 0.5));
    return dmg;
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

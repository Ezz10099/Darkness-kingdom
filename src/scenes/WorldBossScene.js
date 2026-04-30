import GameState from '../systems/GameState.js';
import HeroManager from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import BattleEngine from '../systems/BattleEngine.js';
import WorldBossManager, { TIER_CONFIG } from '../systems/WorldBossManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import { CURRENCY } from '../data/constants.js';
import { SIMPLE_UI, addScreenBg, addHeader, addPanel, addButton, addLabel } from '../ui/SimpleUI.js';

const W = 480;
const H = 854;
const TIER_KEYS = ['EASY', 'NORMAL', 'HARD'];
const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER: 0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
};

export default class WorldBossScene extends Phaser.Scene {
  constructor() { super('WorldBoss'); }

  create() {
    this._engine = null;
    this._battleTimer = null;
    this._sprites = {};
    this._ultBtns = [];
    this._logText = null;
    this._logBuf = [];
    this._tier = 'EASY';
    this._damageDealt = 0;
    this._dmgLabel = null;
    this._root = this.add.container(0, 0);
    this._showBossHub();
  }

  _reset() {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    this._root.removeAll(true);
    this._sprites = {};
    this._ultBtns = [];
    this._logBuf = [];
    this._logText = null;
    this._dmgLabel = null;
    this._damageDealt = 0;
  }

  _log(msg) {
    this._logBuf.push(msg);
    if (this._logBuf.length > 4) this._logBuf.shift();
    if (this._logText) this._logText.setText(this._logBuf.join('\n'));
  }

  _showBossHub() {
    this._reset();
    const c = this._root;
    const cfg = TIER_CONFIG[this._tier];
    const state = WorldBossManager.tierState[this._tier];
    const attempts = WorldBossManager.getAttemptsRemaining();
    const maxAtt = WorldBossManager.getMaxAttempts();
    const hasHeroes = HeroManager.getAllHeroes().length > 0;
    const squadEntries = GameState.getBattleSquadEntries();
    const squadNames = squadEntries.map(e => HeroManager.getHero(e.heroId)?.name).filter(Boolean);
    const canFight = attempts > 0 && hasHeroes;

    addScreenBg(this, c);
    addHeader(this, c, 'WORLD BOSS', () => this.scene.start('MainHub'));

    TIER_KEYS.forEach((key, i) => {
      const tc = TIER_CONFIG[key];
      const selected = key === this._tier;
      addButton(this, c, W / 2 + (i - 1) * 120, 104, 110, 38, selected ? `[${tc.label}]` : tc.label, () => {
        this._tier = key;
        this._showBossHub();
      });
    });

    addPanel(this, c, W / 2, 190, W - 40, 86);
    addLabel(this, c, W / 2, 160, 'BOSS HP', 12, SIMPLE_UI.muted);
    addLabel(this, c, W / 2, 188, `${state.currentHp.toLocaleString()} / ${cfg.persistentHp.toLocaleString()}`, 14, cfg.colorStr);
    addLabel(this, c, W / 2, 218, `Battle HP ${cfg.battleHp.toLocaleString()} · DEF ${cfg.defense} · DMG ${cfg.damage}`, 11, SIMPLE_UI.text);

    addPanel(this, c, W / 2, 292, W - 40, 94);
    addLabel(this, c, W / 2, 260, `Attempts: ${attempts}/${maxAtt}`, 14, attempts > 0 ? SIMPLE_UI.good : SIMPLE_UI.danger);
    addLabel(this, c, W / 2, 286, state.highestDamage > 0 ? `Best damage: ${state.highestDamage.toLocaleString()}` : 'Best damage: none', 12, SIMPLE_UI.gold);
    addLabel(this, c, W / 2, 314, `SQUAD ${squadEntries.length}/5: ${(squadNames.join(', ') || 'none').slice(0, 46)}`, 10, '#99ccff');

    const previewGold = Math.floor(150 * cfg.rewardMult);
    const previewCrys = Math.floor(5 * cfg.rewardMult);
    addPanel(this, c, W / 2, 396, W - 40, 64);
    addLabel(this, c, W / 2, 380, 'FULL CLEAR REWARD', 11, SIMPLE_UI.muted);
    addLabel(this, c, W / 2, 406, `+${previewGold} Gold  +${previewCrys} Crystals`, 12, SIMPLE_UI.gold);

    addButton(this, c, W / 2, 490, 280, 64, canFight ? 'ATTACK' : (attempts === 0 ? 'NO ATTEMPTS' : 'NO HEROES'), () => this._startAttack(), canFight);

    const last = WorldBossManager.lastBattleResult;
    if (last && last.tierKey === this._tier) {
      addLabel(this, c, W / 2, 570, `Last: ${last.damageDealt.toLocaleString()} damage`, 12, SIMPLE_UI.muted);
      addLabel(this, c, W / 2, 594, `+${last.reward.gold} Gold  +${last.reward.crystals} Crystals`, 12, SIMPLE_UI.gold);
    }
  }

  _startAttack() {
    const enemySquad = WorldBossManager.generateBossSquad(this._tier);
    const playerSquad = GameState.getBattleSquadEntries()
      .map(entry => {
        const hero = HeroManager.getHero(entry.heroId);
        return hero ? { hero, row: entry.row } : null;
      })
      .filter(Boolean);

    this._engine = new BattleEngine({ playerSquad, enemySquad, onEvent: ev => this._onBattleEvent(ev) });
    this._engine.start();
    this._showBattleView();
    this._battleTimer = this.time.addEvent({ delay: 900, loop: true, callback: () => { if (this._engine?.running) this._engine.step(); } });
  }

  _showBattleView() {
    this._reset();
    const c = this._root;
    const cfg = TIER_CONFIG[this._tier];
    addScreenBg(this, c);
    addHeader(this, c, `${cfg.label.toUpperCase()} WORLD BOSS`, () => this._showBossHub());
    addLabel(this, c, W / 2, 110, 'BOSS', 11, SIMPLE_UI.danger);
    addLabel(this, c, W / 2, 465, 'YOUR SQUAD', 11, '#66ccff');
    this._dmgLabel = addLabel(this, c, W / 2, 295, 'Damage dealt: 0', 13, cfg.colorStr);
    addPanel(this, c, W / 2, 335, W - 16, 110);
    this._logText = addLabel(this, c, W / 2, 335, '', 12, SIMPLE_UI.muted);

    const enemies = [...this._engine.enemyFormation.FRONT, ...this._engine.enemyFormation.BACK];
    const heroes = [...this._engine.playerFormation.FRONT, ...this._engine.playerFormation.BACK];
    this._drawRow(enemies, 175, c);
    this._drawRow(heroes, 535, c);
    this._drawUltBtns(heroes, c);
  }

  _drawRow(combatants, cy, c) {
    if (!combatants.length) return;
    const slotW = Math.min(82, (W - 36) / combatants.length);
    const barW = slotW - 10;
    const startX = (W - slotW * combatants.length) / 2 + slotW / 2;
    combatants.forEach((com, i) => {
      const x = startX + i * slotW;
      const bg = this.add.rectangle(x, cy, slotW - 6, 62, CLASS_COLORS[com.heroClass] || 0x445566).setStrokeStyle(1, 0xcccccc);
      c.add(bg);
      addLabel(this, c, x, cy - 38, com.name.slice(0, 8), 10, SIMPLE_UI.text);
      c.add(this.add.rectangle(x, cy + 38, barW, 8, 0x440000));
      const hpBar = this.add.rectangle(x - barW / 2, cy + 38, barW, 8, 0x22cc55).setOrigin(0, 0.5);
      const hpTxt = addLabel(this, c, x, cy + 50, `${com.hp}`, 9, '#aaffaa');
      c.add(hpBar);
      this._sprites[com.id] = { bg, hpBar, barMaxW: barW, hpTxt };
    });
  }

  _drawUltBtns(heroes, c) {
    if (!heroes.length) return;
    const btnW = Math.min(88, (W - 16) / heroes.length);
    const startX = (W - btnW * heroes.length) / 2 + btnW / 2;
    heroes.forEach((hero, i) => {
      const x = startX + i * btnW;
      const hasDual = Boolean(hero.ultimateAbilityId2);
      const bg = this.add.rectangle(x, hasDual ? 632 : 640, btnW - 6, hasDual ? 22 : 50, 0x1a0530).setStrokeStyle(1, 0x5511aa).setInteractive({ useHandCursor: true }).on('pointerup', () => this._engine?.triggerUltimate(hero.id, 'primary'));
      const chgTxt = addLabel(this, c, x, hasDual ? 632 : 644, '0%', 11, '#887799');
      c.add(bg);
      addLabel(this, c, x, hasDual ? 618 : 626, hero.name.slice(0, 5), 10, '#cc88ff');
      this._ultBtns.push({ heroId: hero.id, slot: 'primary', bg, chgTxt });
      if (hasDual) {
        const bg2 = this.add.rectangle(x, 656, btnW - 6, 22, 0x1a0530).setStrokeStyle(1, 0x7744cc).setInteractive({ useHandCursor: true }).on('pointerup', () => this._engine?.triggerUltimate(hero.id, 'secondary'));
        const chgTxt2 = addLabel(this, c, x, 656, '0%', 11, '#aa99dd');
        c.add(bg2);
        this._ultBtns.push({ heroId: hero.id, slot: 'secondary', bg: bg2, chgTxt: chgTxt2 });
      }
    });
  }

  _onBattleEvent(ev) {
    switch (ev.type) {
      case 'damage': {
        const sp = this._sprites[ev.targetId];
        if (sp) {
          const pct = Math.max(0, ev.finalHp / ev.maxHp);
          sp.hpBar.setDisplaySize(sp.barMaxW * pct, 8);
          sp.hpBar.setFillStyle(pct > 0.5 ? 0x22cc55 : pct > 0.25 ? 0xffaa00 : 0xff2200);
          sp.hpTxt.setText(`${ev.finalHp}`);
        }
        if (ev.targetId.startsWith('wb_')) {
          this._damageDealt += ev.amount;
          if (this._dmgLabel) {
            const cfg = TIER_CONFIG[this._tier];
            this._dmgLabel.setText(`Damage dealt: ${Math.min(this._damageDealt, cfg.battleHp).toLocaleString()}`);
          }
        }
        this._log(`-${ev.amount} dmg`);
        break;
      }
      case 'heroDefeated': {
        const sp = this._sprites[ev.id];
        if (sp) { sp.bg.setFillStyle(0x222222); sp.hpTxt.setText('x'); }
        break;
      }
      case 'ultimateReady': {
        const btn = this._ultBtns.find(b => b.heroId === ev.id && b.slot === (ev.slot || 'primary'));
        if (btn) { btn.bg.setFillStyle(0x5500bb); btn.chgTxt.setText('ULT'); }
        break;
      }
      case 'ultimateTriggered': {
        this._ultBtns.filter(b => b.heroId === ev.heroId).forEach(btn => { btn.bg.setFillStyle(0x1a0530); btn.chgTxt.setText('0%'); });
        this._log('ULTIMATE!');
        break;
      }
      case 'statusApplied': this._log(ev.effect + '!'); break;
      case 'tick': {
        const all = [...ev.state.playerFormation.FRONT, ...ev.state.playerFormation.BACK];
        this._ultBtns.forEach(btn => {
          const com = all.find(x => x.id === btn.heroId);
          if (com && com.ultimateCharge < 100) btn.chgTxt.setText(`${com.ultimateCharge}%`);
        });
        break;
      }
      case 'battleEnd': this._onBattleEnd(ev.result); break;
    }
  }

  _onBattleEnd(result) {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    const c = this._root;
    const cfg = TIER_CONFIG[this._tier];
    const isWin = result === 'player_win';
    const battleResult = WorldBossManager.recordAttempt(this._tier, this._damageDealt);

    c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.82));
    addLabel(this, c, W / 2, 200, isWin ? 'VICTORY!' : 'DEFEATED', 36, isWin ? SIMPLE_UI.gold : SIMPLE_UI.danger);
    addLabel(this, c, W / 2, 268, `Damage dealt: ${battleResult.damageDealt.toLocaleString()}`, 16, cfg.colorStr);
    addLabel(this, c, W / 2, 316, `+${battleResult.reward.gold} Gold  +${battleResult.reward.crystals} Crystals`, 15, SIMPLE_UI.gold);

    let y = 360;
    if (battleResult.newMilestones.length > 0) {
      addLabel(this, c, W / 2, y, 'MILESTONE BONUS', 13, SIMPLE_UI.gold);
      y += 24;
      battleResult.newMilestones.forEach(pct => {
        const mr = WorldBossManager.getMilestoneReward(pct, this._tier);
        addLabel(this, c, W / 2, y, `${Math.round(pct * 100)}% +${mr.gold}G +${mr.crystals}C${mr.shards ? ` +${mr.shards}S` : ''}`, 11, SIMPLE_UI.text);
        y += 20;
      });
    }
    if (battleResult.bossDefeated) {
      addLabel(this, c, W / 2, y + 8, 'WORLD BOSS DEFEATED', 15, SIMPLE_UI.gold);
      y += 36;
    }

    addButton(this, c, W / 2, Math.max(y + 55, 510), 260, 58, 'COLLECT', () => this._collectAndReturn(battleResult));
    addLabel(this, c, W / 2, Math.max(y + 105, 560), `${WorldBossManager.getAttemptsRemaining()} attempts remaining`, 12, SIMPLE_UI.muted);
    AchievementManager.showPopups(this);
  }

  _collectAndReturn(battleResult) {
    CurrencyManager.add(CURRENCY.GOLD, battleResult.reward.gold);
    CurrencyManager.add(CURRENCY.CRYSTALS, battleResult.reward.crystals);
    battleResult.newMilestones.forEach(pct => {
      const mr = WorldBossManager.getMilestoneReward(pct, this._tier);
      CurrencyManager.add(CURRENCY.GOLD, mr.gold);
      CurrencyManager.add(CURRENCY.CRYSTALS, mr.crystals);
      if (mr.shards) CurrencyManager.add(CURRENCY.AWAKENING_SHARDS, mr.shards);
    });
    DailyCodexManager.increment('ATTACK_BOSS');
    DailyCodexManager.increment('BOSS_TWICE');
    GameState.save();
    this._showBossHub();
  }
}

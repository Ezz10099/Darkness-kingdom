import GameState        from '../systems/GameState.js';
import HeroManager      from '../systems/HeroManager.js';
import CurrencyManager  from '../systems/CurrencyManager.js';
import BattleEngine     from '../systems/BattleEngine.js';
import WorldBossManager, { TIER_CONFIG } from '../systems/WorldBossManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import { CLASS_DEFAULTS, CURRENCY } from '../data/constants.js';

const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER:  0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
};

const TIER_KEYS = ['EASY', 'NORMAL', 'HARD'];

export default class WorldBossScene extends Phaser.Scene {
  constructor() { super('WorldBoss'); }

  create() {
    this._engine          = null;
    this._battleTimer     = null;
    this._sprites         = {};
    this._ultBtns         = [];
    this._logText         = null;
    this._logBuf          = [];
    this._tier            = 'EASY';
    this._damageDealt     = 0;
    this._dmgLabel        = null;
    this._root            = this.add.container(0, 0);
    this._showBossHub();
  }

  // ─── UTILITIES ──────────────────────────────────────────────────────────────

  _reset() {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    this._root.removeAll(true);
    this._sprites = {}; this._ultBtns = []; this._logBuf = []; this._logText = null;
    this._dmgLabel = null; this._damageDealt = 0;
  }

  _log(msg) {
    this._logBuf.push(msg);
    if (this._logBuf.length > 4) this._logBuf.shift();
    if (this._logText) this._logText.setText(this._logBuf.join('\n'));
  }

  // ─── HUB ────────────────────────────────────────────────────────────────────

  _showBossHub() {
    this._reset();
    const c = this._root, W = 480;
    const cfg      = TIER_CONFIG[this._tier];
    const state    = WorldBossManager.tierState[this._tier];
    const attempts = WorldBossManager.getAttemptsRemaining();
    const maxAtt   = WorldBossManager.getMaxAttempts();
    const hasHeroes = HeroManager.getAllHeroes().length > 0;
    const canFight  = attempts > 0 && hasHeroes;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));

    // Title + back
    c.add(this.add.text(W / 2, 34, 'WORLD BOSS', { font: '24px monospace', fill: '#ff6644' }).setOrigin(0.5));
    c.add(this.add.text(30, 34, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub')));

    // Tier tabs
    const tabW = 110, tabY = 90;
    TIER_KEYS.forEach((key, i) => {
      const tx   = W / 2 + (i - 1) * (tabW + 8);
      const tc   = TIER_CONFIG[key];
      const sel  = key === this._tier;
      const bg   = this.add.rectangle(tx, tabY, tabW, 36, sel ? tc.colorHex : 0x1a1a2e)
        .setStrokeStyle(2, sel ? tc.colorHex : 0x3a3a5a)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => { this._tier = key; this._showBossHub(); });
      c.add(bg);
      c.add(this.add.text(tx, tabY, tc.label, {
        font: '15px monospace', fill: sel ? '#ffffff' : '#888888'
      }).setOrigin(0.5));
    });

    // Boss HP bar
    const barW = 380, barH = 28, barY = 170;
    const hpPct = state.currentHp / cfg.persistentHp;
    c.add(this.add.text(W / 2, barY - 20, 'WORLD BOSS HP', { font: '12px monospace', fill: '#888888' }).setOrigin(0.5));
    c.add(this.add.rectangle(W / 2, barY, barW, barH, 0x330000).setStrokeStyle(1, 0x660000));
    const barFill = this.add.rectangle(W / 2 - barW / 2, barY, barW * hpPct, barH, cfg.colorHex).setOrigin(0, 0.5);
    c.add(barFill);
    c.add(this.add.text(W / 2, barY, state.currentHp.toLocaleString() + ' / ' + cfg.persistentHp.toLocaleString(), {
      font: '11px monospace', fill: '#ffffff'
    }).setOrigin(0.5));

    // Milestone pip marks
    for (const pct of [0.25, 0.5, 0.75]) {
      const px = W / 2 - barW / 2 + barW * pct;
      c.add(this.add.rectangle(px, barY, 2, barH + 6, 0xffffff).setAlpha(0.4));
    }

    // Stats panel
    const panelY = 240;
    c.add(this.add.rectangle(W / 2, panelY, 380, 80, 0x0d0d22).setStrokeStyle(1, 0x3a1a4a));
    c.add(this.add.text(W / 2, panelY - 25, 'BOSS STATS', { font: '11px monospace', fill: '#886699' }).setOrigin(0.5));
    c.add(this.add.text(W / 2 - 80, panelY - 8, 'Battle HP: ' + cfg.battleHp.toLocaleString(), { font: '13px monospace', fill: '#ff9988' }).setOrigin(0.5));
    c.add(this.add.text(W / 2 + 80, panelY - 8, 'Defense: '   + cfg.defense,                  { font: '13px monospace', fill: '#88ccff' }).setOrigin(0.5));
    c.add(this.add.text(W / 2 - 80, panelY + 14, 'Damage: '   + cfg.damage,                   { font: '13px monospace', fill: '#ffaa44' }).setOrigin(0.5));
    c.add(this.add.text(W / 2 + 80, panelY + 14, 'Affinity: Shadow',                           { font: '13px monospace', fill: '#cc88ff' }).setOrigin(0.5));

    // Attempts + record
    c.add(this.add.text(W / 2, 320,
      'Attempts today: ' + (maxAtt - attempts) + ' / ' + maxAtt + ' used',
      { font: '15px monospace', fill: attempts > 0 ? '#aaddff' : '#ff6666' }).setOrigin(0.5));
    if (state.highestDamage > 0) {
      c.add(this.add.text(W / 2, 348,
        'Best damage: ' + state.highestDamage.toLocaleString(),
        { font: '13px monospace', fill: '#ffd700' }).setOrigin(0.5));
    }

    // Reward preview
    const previewGold = Math.floor(150 * cfg.rewardMult);
    const previewCrys = Math.floor(5   * cfg.rewardMult);
    c.add(this.add.text(W / 2, 385,
      'Reward (full clear): +' + previewGold + ' Gold  +' + previewCrys + ' Crystals',
      { font: '12px monospace', fill: '#888888' }).setOrigin(0.5));

    // ATTACK button
    const btnY    = 455;
    const btnC    = canFight ? 0x3a0000 : 0x1a1a2a;
    const btnBord = canFight ? 0xff4444 : 0x333333;
    const btnFill = canFight ? '#ff6644' : '#555555';
    const btnLbl  = canFight ? '\u2694  ATTACK' : (attempts === 0 ? 'NO ATTEMPTS LEFT' : 'NO HEROES');
    const atkBg   = this.add.rectangle(W / 2, btnY, 280, 72, btnC).setStrokeStyle(2, btnBord);
    c.add(atkBg);
    c.add(this.add.text(W / 2, btnY, btnLbl, { font: '24px monospace', fill: btnFill }).setOrigin(0.5));

    if (canFight) {
      atkBg.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => atkBg.setFillStyle(0x220000))
        .on('pointerout',  () => atkBg.setFillStyle(0x3a0000))
        .on('pointerup',   () => this._startAttack());
    }

    // Last result
    const last = WorldBossManager.lastBattleResult;
    if (last && last.tierKey === this._tier) {
      const lY = btnY + 100;
      c.add(this.add.text(W / 2, lY,
        'Last: ' + last.damageDealt.toLocaleString() + ' dmg dealt',
        { font: '13px monospace', fill: '#666688' }).setOrigin(0.5));
      c.add(this.add.text(W / 2, lY + 20,
        '+' + last.reward.gold + ' Gold  +' + last.reward.crystals + ' Crystals',
        { font: '12px monospace', fill: '#ffd700' }).setOrigin(0.5));
    }
  }

  // ─── BATTLE ─────────────────────────────────────────────────────────────────

  _startAttack() {
    const enemySquad  = WorldBossManager.generateBossSquad(this._tier);
    const playerSquad = HeroManager.getAllHeroes().map(h => ({
      hero: h, row: CLASS_DEFAULTS[h.heroClass]?.defaultRow || 'FRONT'
    }));

    this._engine = new BattleEngine({
      playerSquad,
      enemySquad,
      onEvent: ev => this._onBattleEvent(ev)
    });
    this._engine.start();
    this._showBattleView();
    this._battleTimer = this.time.addEvent({
      delay: 900, loop: true,
      callback: () => { if (this._engine?.running) this._engine.step(); }
    });
  }

  _showBattleView() {
    this._reset();
    const c = this._root, W = 480;
    const cfg = TIER_CONFIG[this._tier];

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 26, cfg.label.toUpperCase() + '  WORLD BOSS',
      { font: '16px monospace', fill: cfg.colorStr }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 70,  'BOSS',       { font: '11px monospace', fill: '#ff7766' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 470, 'YOUR SQUAD', { font: '11px monospace', fill: '#66ccff' }).setOrigin(0.5));

    c.add(this.add.rectangle(W / 2, 335, W - 16, 110, 0x0c0c1e).setStrokeStyle(1, 0x2a1a4a));
    this._logText = this.add.text(W / 2, 335, '',
      { font: '12px monospace', fill: '#bbbbbb', align: 'center' }).setOrigin(0.5);
    this._dmgLabel = this.add.text(W / 2, 295, 'Damage dealt: 0',
      { font: '13px monospace', fill: cfg.colorStr }).setOrigin(0.5);
    c.add(this._dmgLabel);
    c.add(this._logText);

    const enemies = [...this._engine.enemyFormation.FRONT, ...this._engine.enemyFormation.BACK];
    const heroes  = [...this._engine.playerFormation.FRONT, ...this._engine.playerFormation.BACK];
    this._drawRow(enemies, 160, c);
    this._drawRow(heroes,  530, c);
    this._drawUltBtns(heroes, c);
  }

  _drawRow(combatants, cy, c) {
    if (!combatants.length) return;
    const W = 480, slotW = Math.min(82, (W - 36) / combatants.length), barW = slotW - 10;
    const startX = (W - slotW * combatants.length) / 2 + slotW / 2;

    combatants.forEach((com, i) => {
      const x  = startX + i * slotW;
      const bg = this.add.rectangle(x, cy, slotW - 6, 62, CLASS_COLORS[com.heroClass] || 0x445566)
        .setStrokeStyle(1, 0xcccccc);
      c.add(bg);
      c.add(this.add.text(x, cy - 38, com.name.slice(0, 8),
        { font: '10px monospace', fill: '#ffffff' }).setOrigin(0.5));
      c.add(this.add.rectangle(x, cy + 38, barW, 8, 0x440000));
      const hpBar = this.add.rectangle(x - barW / 2, cy + 38, barW, 8, 0x22cc55).setOrigin(0, 0.5);
      const hpTxt = this.add.text(x, cy + 50, '' + com.hp,
        { font: '9px monospace', fill: '#aaffaa' }).setOrigin(0.5);
      c.add(hpBar); c.add(hpTxt);
      this._sprites[com.id] = { bg, hpBar, barMaxW: barW, hpTxt };
    });
  }

  _drawUltBtns(heroes, c) {
    if (!heroes.length) return;
    const W = 480, btnW = Math.min(88, (W - 16) / heroes.length);
    const startX = (W - btnW * heroes.length) / 2 + btnW / 2;
    heroes.forEach((hero, i) => {
      const x  = startX + i * btnW;
      const bg = this.add.rectangle(x, 640, btnW - 6, 50, 0x1a0530)
        .setStrokeStyle(1, 0x5511aa).setInteractive({ useHandCursor: true })
        .on('pointerup', () => { if (this._engine) this._engine.triggerUltimate(hero.id); });
      const chgTxt = this.add.text(x, 644, '0%', { font: '11px monospace', fill: '#887799' }).setOrigin(0.5);
      c.add(bg);
      c.add(this.add.text(x, 626, hero.name.slice(0, 5), { font: '10px monospace', fill: '#cc88ff' }).setOrigin(0.5));
      c.add(chgTxt);
      this._ultBtns.push({ heroId: hero.id, bg, chgTxt });
    });
  }

  // ─── BATTLE EVENTS ───────────────────────────────────────────────────────────

  _onBattleEvent(ev) {
    switch (ev.type) {
      case 'damage': {
        const sp = this._sprites[ev.targetId];
        if (sp) {
          const pct = Math.max(0, ev.finalHp / ev.maxHp);
          sp.hpBar.setDisplaySize(sp.barMaxW * pct, 8);
          sp.hpBar.setFillStyle(pct > 0.5 ? 0x22cc55 : pct > 0.25 ? 0xffaa00 : 0xff2200);
          sp.hpTxt.setText('' + ev.finalHp);
        }
        if (ev.targetId.startsWith('wb_')) {
          this._damageDealt += ev.amount;
          if (this._dmgLabel) {
            const cfg = TIER_CONFIG[this._tier];
            this._dmgLabel.setText('Damage dealt: ' + Math.min(this._damageDealt, cfg.battleHp).toLocaleString());
          }
        }
        this._log('-' + ev.amount + ' dmg');
        break;
      }
      case 'heroDefeated': {
        const sp = this._sprites[ev.id];
        if (sp) { sp.bg.setFillStyle(0x222222); sp.hpTxt.setText('\u2715'); }
        break;
      }
      case 'ultimateReady': {
        const btn = this._ultBtns.find(b => b.heroId === ev.id);
        if (btn) { btn.bg.setFillStyle(0x5500bb); btn.chgTxt.setText('\u25b6ULT').setStyle({ fill: '#ffaaff' }); }
        break;
      }
      case 'ultimateTriggered': {
        const btn = this._ultBtns.find(b => b.heroId === ev.heroId);
        if (btn) { btn.bg.setFillStyle(0x1a0530); btn.chgTxt.setText('0%').setStyle({ fill: '#887799' }); }
        this._log('ULTIMATE!');
        break;
      }
      case 'statusApplied':
        this._log(ev.effect + '!');
        break;
      case 'tick': {
        const all = [...ev.state.playerFormation.FRONT, ...ev.state.playerFormation.BACK];
        for (const btn of this._ultBtns) {
          const com = all.find(x => x.id === btn.heroId);
          if (com && com.ultimateCharge < 100) btn.chgTxt.setText(com.ultimateCharge + '%');
        }
        break;
      }
      case 'battleEnd':
        this._onBattleEnd(ev.result);
        break;
    }
  }

  // ─── RESULTS ────────────────────────────────────────────────────────────────

  _onBattleEnd(result) {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    const W    = 480;
    const c    = this._root;
    const cfg  = TIER_CONFIG[this._tier];
    const isWin = result === 'player_win';
    const battleResult = WorldBossManager.recordAttempt(this._tier, this._damageDealt);

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x000000).setAlpha(0.82));
    c.add(this.add.text(W / 2, 200, isWin ? 'VICTORY!' : 'DEFEATED',
      { font: '38px monospace', fill: isWin ? '#ffaa44' : '#ff4444', align: 'center' }).setOrigin(0.5));

    c.add(this.add.text(W / 2, 268, 'Damage dealt: ' + battleResult.damageDealt.toLocaleString(),
      { font: '18px monospace', fill: cfg.colorStr }).setOrigin(0.5));

    // Base reward
    c.add(this.add.text(W / 2, 316,
      '+' + battleResult.reward.gold + ' Gold   +' + battleResult.reward.crystals + ' Crystals',
      { font: '16px monospace', fill: '#ffd700' }).setOrigin(0.5));

    // Milestone rewards
    let mY = 360;
    if (battleResult.newMilestones.length > 0) {
      c.add(this.add.text(W / 2, mY, '\u2605 MILESTONE BONUS!', { font: '14px monospace', fill: '#ffaa44' }).setOrigin(0.5));
      mY += 22;
      for (const pct of battleResult.newMilestones) {
        const mr = WorldBossManager.getMilestoneReward(pct, this._tier);
        let txt = Math.round(pct * 100) + '% - +' + mr.gold + ' Gold  +' + mr.crystals + ' Crystals';
        if (mr.shards) txt += '  +' + mr.shards + ' Shards';
        c.add(this.add.text(W / 2, mY, txt, { font: '12px monospace', fill: '#ffcc66' }).setOrigin(0.5));
        mY += 18;
      }
    }

    // Boss defeated banner
    if (battleResult.bossDefeated) {
      c.add(this.add.text(W / 2, mY + 10, '\u2605 WORLD BOSS DEFEATED! \u2605',
        { font: '16px monospace', fill: '#ff66ff' }).setOrigin(0.5));
      mY += 30;
    }

    // Collect button
    const colY = Math.max(mY + 50, 510);
    const cBtn = this.add.rectangle(W / 2, colY, 260, 64, 0x200040)
      .setStrokeStyle(2, 0xcc44ff).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this._collectAndReturn(battleResult));
    c.add(cBtn);
    c.add(this.add.text(W / 2, colY, 'COLLECT', { font: '22px monospace', fill: '#cc88ff' }).setOrigin(0.5));

    // Attempts remaining
    const attLeft = WorldBossManager.getAttemptsRemaining();
    c.add(this.add.text(W / 2, colY + 50,
      attLeft + ' attempt' + (attLeft !== 1 ? 's' : '') + ' remaining today',
      { font: '13px monospace', fill: '#888888' }).setOrigin(0.5));

    AchievementManager.showPopups(this);
  }

  _collectAndReturn(battleResult) {
    CurrencyManager.add(CURRENCY.GOLD,     battleResult.reward.gold);
    CurrencyManager.add(CURRENCY.CRYSTALS, battleResult.reward.crystals);

    for (const pct of battleResult.newMilestones) {
      const mr = WorldBossManager.getMilestoneReward(pct, this._tier);
      CurrencyManager.add(CURRENCY.GOLD,     mr.gold);
      CurrencyManager.add(CURRENCY.CRYSTALS, mr.crystals);
      if (mr.shards) CurrencyManager.add(CURRENCY.AWAKENING_SHARDS, mr.shards);
    }

    DailyCodexManager.increment('ATTACK_BOSS');
    DailyCodexManager.increment('BOSS_TWICE');
    GameState.save();
    this._showBossHub();
  }
}

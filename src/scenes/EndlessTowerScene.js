import GameState from '../systems/GameState.js';
import HeroManager from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import BattleEngine from '../systems/BattleEngine.js';
import EndlessTowerManager from '../systems/EndlessTowerManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import { CLASS_DEFAULTS, CURRENCY } from '../data/constants.js';

const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER:  0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
};

export default class EndlessTowerScene extends Phaser.Scene {
  constructor() { super('EndlessTower'); }

  create() {
    this._engine      = null;
    this._battleTimer = null;
    this._sprites     = {};
    this._ultBtns     = [];
    this._logText     = null;
    this._logBuf      = [];
    this._curFloor    = null;
    this._root        = this.add.container(0, 0);
    this._showTowerHub();
  }

  // ─── UTILITIES ──────────────────────────────────────────────────────────────

  _reset() {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    this._root.removeAll(true);
    this._sprites = {}; this._ultBtns = []; this._logBuf = []; this._logText = null;
  }

  _log(msg) {
    this._logBuf.push(msg);
    if (this._logBuf.length > 4) this._logBuf.shift();
    if (this._logText) this._logText.setText(this._logBuf.join('\n'));
  }

  // ─── TOWER HUB ──────────────────────────────────────────────────────────────

  _showTowerHub() {
    this._reset();
    const c = this._root, W = 480;
    const floor      = EndlessTowerManager.currentFloor;
    const best       = EndlessTowerManager.highestFloor;
    const reward     = EndlessTowerManager.getFloorReward(floor);
    const isMilestone = floor % 10 === 0;
    const enemies    = EndlessTowerManager.generateEnemySquad(floor);
    const hasHeroes  = HeroManager.getAllHeroes().length > 0;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));

    c.add(this.add.text(W / 2, 40, 'ENDLESS TOWER', {
      font: '24px monospace', fill: '#cc88ff'
    }).setOrigin(0.5));
    c.add(this.add.text(30, 40, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub')));

    // Floor number
    c.add(this.add.text(W / 2, 130, 'FLOOR  ' + floor, {
      font: '40px monospace', fill: '#ffffff'
    }).setOrigin(0.5));

    if (best > 0) {
      c.add(this.add.text(W / 2, 178, 'Best: Floor ' + best, {
        font: '14px monospace', fill: '#888888'
      }).setOrigin(0.5));
    }

    // Reward preview
    const rY = 260;
    c.add(this.add.rectangle(W / 2, rY, 380, isMilestone ? 100 : 72, 0x0d0d22)
      .setStrokeStyle(1, 0x3a1a5a));
    c.add(this.add.text(W / 2, rY - 26, 'FLOOR REWARD', {
      font: '11px monospace', fill: '#886699'
    }).setOrigin(0.5));
    c.add(this.add.text(W / 2, rY - 6, '+' + reward.gold + ' Gold', {
      font: '16px monospace', fill: '#ffd700'
    }).setOrigin(0.5));
    if (reward.crystals > 0) {
      c.add(this.add.text(W / 2, rY + 16, '+' + reward.crystals + ' Crystals', {
        font: '14px monospace', fill: '#aaddff'
      }).setOrigin(0.5));
    }
    if (isMilestone) {
      c.add(this.add.text(W / 2, rY + 36, '\u2605 +' + reward.shards + ' Awakening Shards Chest!', {
        font: '13px monospace', fill: '#ffaa44'
      }).setOrigin(0.5));
    }

    // Enemy names preview
    const previewY = isMilestone ? 358 : 332;
    c.add(this.add.text(W / 2, previewY,
      'Enemies: ' + enemies.map(e => e.name).join(', '), {
        font: '12px monospace', fill: '#ff9988'
      }).setOrigin(0.5));

    // CLIMB button
    const climbY = previewY + 90;
    const climbColor = hasHeroes ? 0x2a0050 : 0x1a1a2a;
    const climbBorder = hasHeroes ? 0xcc44ff : 0x333333;
    const climbBg = this.add.rectangle(W / 2, climbY, 280, 72, climbColor)
      .setStrokeStyle(2, climbBorder);
    c.add(climbBg);
    c.add(this.add.text(W / 2, climbY, '\u2694  CLIMB', {
      font: '26px monospace', fill: hasHeroes ? '#cc88ff' : '#555555'
    }).setOrigin(0.5));

    if (hasHeroes) {
      climbBg.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => climbBg.setFillStyle(0x180030))
        .on('pointerout',  () => climbBg.setFillStyle(0x2a0050))
        .on('pointerup',   () => this._startClimb(floor));
    }

    // Last reward info
    const last = EndlessTowerManager.lastReward;
    if (last) {
      const lastY = climbY + 100;
      c.add(this.add.text(W / 2, lastY, 'Last cleared: Floor ' + last.floor, {
        font: '13px monospace', fill: '#666688'
      }).setOrigin(0.5));
      let lastStr = '+' + last.gold + ' Gold';
      if (last.crystals > 0) lastStr += '  +' + last.crystals + ' Crystals';
      if (last.shards   > 0) lastStr += '  +' + last.shards + ' Shards';
      c.add(this.add.text(W / 2, lastY + 22, lastStr, {
        font: '12px monospace', fill: '#ffd700'
      }).setOrigin(0.5));
    }
  }

  // ─── BATTLE ─────────────────────────────────────────────────────────────────

  _startClimb(floor) {
    this._curFloor    = floor;
    const enemySquad  = EndlessTowerManager.generateEnemySquad(floor);
    const playerSquad = HeroManager.getAllHeroes().map(h => ({
      hero: h, row: CLASS_DEFAULTS[h.heroClass]?.defaultRow || 'FRONT'
    }));

    this._engine = new BattleEngine({
      playerSquad,
      enemySquad,
      onEvent: ev => this._onBattleEvent(ev)
    });
    this._engine.start();
    this._showBattleView(floor);
    this._battleTimer = this.time.addEvent({
      delay: 900, loop: true,
      callback: () => { if (this._engine?.running) this._engine.step(); }
    });
  }

  _showBattleView(floor) {
    this._reset();
    const c = this._root, W = 480;
    const isBoss = floor % 10 === 0;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 26,
      (isBoss ? '\u2605 BOSS  ' : '') + 'FLOOR ' + floor,
      { font: '16px monospace', fill: isBoss ? '#ffaa44' : '#cc88ff' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 70,  'ENEMIES',    { font: '11px monospace', fill: '#ff7766' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 470, 'YOUR SQUAD', { font: '11px monospace', fill: '#66ccff' }).setOrigin(0.5));

    c.add(this.add.rectangle(W / 2, 335, W - 16, 110, 0x0c0c1e).setStrokeStyle(1, 0x2a1a4a));
    this._logText = this.add.text(W / 2, 335, '',
      { font: '12px monospace', fill: '#bbbbbb', align: 'center' }).setOrigin(0.5);
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
      c.add(this.add.text(x, cy - 38, com.name.slice(0, 6),
        { font: '11px monospace', fill: '#ffffff' }).setOrigin(0.5));
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
    const W = 480, isWin = result === 'player_win';
    const c = this._root;
    const floor = this._curFloor;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x000000).setAlpha(0.78));
    c.add(this.add.text(W / 2, 260, isWin ? 'FLOOR ' + floor + '\nCLEARED!' : 'DEFEATED',
      { font: '36px monospace', fill: isWin ? '#cc88ff' : '#ff4444', align: 'center' }).setOrigin(0.5));

    if (isWin) {
      const reward = EndlessTowerManager.getFloorReward(floor);
      let rewardStr = '+' + reward.gold + ' Gold';
      if (reward.crystals > 0) rewardStr += '  +' + reward.crystals + ' Crystals';
      if (reward.shards   > 0) rewardStr += '\n\u2605 +' + reward.shards + ' Awakening Shards';
      c.add(this.add.text(W / 2, 360, rewardStr,
        { font: '17px monospace', fill: '#ffd700', align: 'center' }).setOrigin(0.5));

      const cBtn = this.add.rectangle(W / 2, 460, 260, 62, 0x200040)
        .setStrokeStyle(2, 0xcc44ff).setInteractive({ useHandCursor: true })
        .on('pointerup', () => this._collectAndContinue(floor));
      c.add(cBtn);
      c.add(this.add.text(W / 2, 460, 'COLLECT', { font: '22px monospace', fill: '#cc88ff' }).setOrigin(0.5));
    } else {
      const rBtn = this.add.rectangle(W / 2, 380, 240, 62, 0x2e0b0b)
        .setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true })
        .on('pointerup', () => this._startClimb(floor));
      const mBtn = this.add.rectangle(W / 2, 460, 240, 62, 0x110022)
        .setStrokeStyle(1, 0x551188).setInteractive({ useHandCursor: true })
        .on('pointerup', () => this._showTowerHub());
      c.add(rBtn);
      c.add(this.add.text(W / 2, 380, 'RETRY', { font: '22px monospace', fill: '#ff6666' }).setOrigin(0.5));
      c.add(mBtn);
      c.add(this.add.text(W / 2, 460, 'TOWER HUB', { font: '22px monospace', fill: '#aa66ff' }).setOrigin(0.5));
    }
  }

  _collectAndContinue(floor) {
    const reward = EndlessTowerManager.getFloorReward(floor);
    CurrencyManager.add(CURRENCY.GOLD, reward.gold);
    if (reward.crystals > 0) CurrencyManager.add(CURRENCY.CRYSTALS, reward.crystals);
    if (reward.shards   > 0) CurrencyManager.add(CURRENCY.AWAKENING_SHARDS, reward.shards);
    EndlessTowerManager.recordFloorClear(floor);
    DailyCodexManager.increment('CLIMB_ENDLESS');
    GameState.save();
    this._showTowerHub();
  }
}

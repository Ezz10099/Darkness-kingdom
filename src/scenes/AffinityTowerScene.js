import GameState from '../systems/GameState.js';
import HeroManager from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import BattleEngine from '../systems/BattleEngine.js';
import AffinityTowerManager from '../systems/AffinityTowerManager.js';
import { CLASS_DEFAULTS, CURRENCY } from '../data/constants.js';

const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER:  0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
};

const TOWER_CONFIG = {
  FIRE:   { color: 0xff5533, dark: 0x3a0a00, label: 'FIRE TOWER'   },
  ICE:    { color: 0x44aaff, dark: 0x001a3a, label: 'ICE TOWER'    },
  EARTH:  { color: 0x44cc44, dark: 0x001a00, label: 'EARTH TOWER'  },
  SHADOW: { color: 0xaa33ff, dark: 0x1a0033, label: 'SHADOW TOWER' },
  LIGHT:  { color: 0xffdd33, dark: 0x2a1a00, label: 'LIGHT TOWER'  },
};

export default class AffinityTowerScene extends Phaser.Scene {
  constructor() { super('AffinityTower'); }

  init(data) {
    this._affinity = data?.affinity || 'FIRE';
  }

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

  _cfg() { return TOWER_CONFIG[this._affinity]; }

  // ─── TOWER HUB ──────────────────────────────────────────────────────────────

  _showTowerHub() {
    this._reset();
    const c      = this._root;
    const W      = 480;
    const aff    = this._affinity;
    const cfg    = this._cfg();
    const tower  = AffinityTowerManager.getTower(aff);
    const floor  = tower.currentFloor;
    const best   = tower.highestFloor;
    const reward = AffinityTowerManager.getFloorReward(aff, floor);
    const isBoss = floor % 10 === 0;
    const enemies   = AffinityTowerManager.generateEnemySquad(aff, floor);
    const allHeroes = HeroManager.getAllHeroes();
    const hasHeroes = allHeroes.length > 0;
    const bonusHeroes = allHeroes.filter(h => h.affinity === aff);

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));

    // Header
    c.add(this.add.text(W / 2, 40, cfg.label, {
      font: '22px monospace', fill: '#' + cfg.color.toString(16).padStart(6, '0')
    }).setOrigin(0.5));
    c.add(this.add.text(30, 40, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('AffinityTowerSelection')));

    // Floor counter
    c.add(this.add.text(W / 2, 130, 'FLOOR  ' + floor, {
      font: '40px monospace', fill: '#ffffff'
    }).setOrigin(0.5));

    if (isBoss) {
      c.add(this.add.text(W / 2, 92, '\u2605 BOSS FLOOR', {
        font: '14px monospace', fill: '#ffaa44'
      }).setOrigin(0.5));
    }

    // Leaderboard stub
    c.add(this.add.text(W / 2, 174,
      best > 0 ? 'Your highest: Floor ' + best : 'Not yet climbed',
      { font: '13px monospace', fill: '#666688' }
    ).setOrigin(0.5));

    // Affinity bonus indicator
    const bonusY = 218;
    const bonusColor = bonusHeroes.length > 0 ? 0x1a2a0a : 0x0d0d22;
    const bonusBorder = bonusHeroes.length > 0 ? cfg.color : 0x333333;
    c.add(this.add.rectangle(W / 2, bonusY, 380, 44, bonusColor)
      .setStrokeStyle(1, bonusBorder));
    if (bonusHeroes.length > 0) {
      c.add(this.add.text(W / 2, bonusY,
        '\u2605 AFFINITY BONUS: ' + bonusHeroes.map(h => h.name).join(', ') + ' +50%',
        { font: '11px monospace', fill: '#' + cfg.color.toString(16).padStart(6, '0'), wordWrap: { width: 360 }, align: 'center' }
      ).setOrigin(0.5));
    } else {
      c.add(this.add.text(W / 2, bonusY,
        'No ' + aff + ' heroes — no bonus active',
        { font: '11px monospace', fill: '#555555' }
      ).setOrigin(0.5));
    }

    // Reward preview
    const rY = 300;
    const rHeight = reward.isMilestone ? 116 : (reward.shards > 0 ? 100 : 76);
    c.add(this.add.rectangle(W / 2, rY, 380, rHeight, 0x0d0d22)
      .setStrokeStyle(1, 0x3a1a5a));
    c.add(this.add.text(W / 2, rY - rHeight / 2 + 12, 'FLOOR REWARD', {
      font: '11px monospace', fill: '#886699'
    }).setOrigin(0.5));
    c.add(this.add.text(W / 2, rY - rHeight / 2 + 30, '+' + reward.gold + ' Gold', {
      font: '16px monospace', fill: '#ffd700'
    }).setOrigin(0.5));
    if (reward.crystals > 0) {
      c.add(this.add.text(W / 2, rY - rHeight / 2 + 50, '+' + reward.crystals + ' Crystals', {
        font: '14px monospace', fill: '#aaddff'
      }).setOrigin(0.5));
    }
    if (reward.shards > 0) {
      c.add(this.add.text(W / 2, rY - rHeight / 2 + 70, '\u2605 +' + reward.shards + ' Awakening Shards', {
        font: '13px monospace', fill: '#ffaa44'
      }).setOrigin(0.5));
    }
    if (reward.isMilestone) {
      const ms = AffinityTowerManager.getMilestoneReward(floor);
      if (ms) {
        c.add(this.add.text(W / 2, rY - rHeight / 2 + 90, '\u2728 MILESTONE: ' + ms.bonus + ' +' + ms.crystals + ' Crystals', {
          font: '12px monospace', fill: '#ffffaa'
        }).setOrigin(0.5));
        c.add(this.add.text(W / 2, rY - rHeight / 2 + 108, 'Title Unlocked: "' + ms.title + '"', {
          font: '11px monospace', fill: '#ffffaa'
        }).setOrigin(0.5));
      }
    }

    // Enemy preview
    const previewY = rY + rHeight / 2 + 24;
    c.add(this.add.text(W / 2, previewY,
      'Enemies: ' + enemies.map(e => e.name).join(', '),
      { font: '12px monospace', fill: '#ff9988' }
    ).setOrigin(0.5));

    // CLIMB button
    const climbY = previewY + 80;
    const climbBg = this.add.rectangle(W / 2, climbY, 280, 72,
      hasHeroes ? cfg.dark : 0x1a1a2a)
      .setStrokeStyle(2, hasHeroes ? cfg.color : 0x333333);
    c.add(climbBg);
    c.add(this.add.text(W / 2, climbY, '\u2694  CLIMB', {
      font: '26px monospace',
      fill: hasHeroes ? '#' + cfg.color.toString(16).padStart(6, '0') : '#555555'
    }).setOrigin(0.5));

    if (hasHeroes) {
      climbBg.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => climbBg.setFillStyle(0x050505))
        .on('pointerout',  () => climbBg.setFillStyle(cfg.dark))
        .on('pointerup',   () => this._startClimb(floor));
    }

    // Last reward
    const last = tower.lastReward;
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
    this._curFloor       = floor;
    const aff            = this._affinity;
    const enemySquad     = AffinityTowerManager.generateEnemySquad(aff, floor);
    const rawSquad       = HeroManager.getAllHeroes().map(h => ({
      hero: h, row: CLASS_DEFAULTS[h.heroClass]?.defaultRow || 'FRONT'
    }));
    const playerSquad    = AffinityTowerManager.applyAffinityBonus(rawSquad, aff);

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
    const c      = this._root;
    const W      = 480;
    const cfg    = this._cfg();
    const isBoss = floor % 10 === 0;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 26,
      (isBoss ? '\u2605 BOSS  ' : '') + cfg.label + '  FLOOR ' + floor,
      { font: '14px monospace', fill: '#' + cfg.color.toString(16).padStart(6, '0') }
    ).setOrigin(0.5));
    c.add(this.add.text(W / 2, 70,  'ENEMIES',    { font: '11px monospace', fill: '#ff7766' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 470, 'YOUR SQUAD', { font: '11px monospace', fill: '#66ccff' }).setOrigin(0.5));

    // Show affinity bonus heroes in battle view
    const allHeroes = HeroManager.getAllHeroes();
    const bonusHeroes = allHeroes.filter(h => h.affinity === this._affinity);
    if (bonusHeroes.length > 0) {
      c.add(this.add.text(W / 2, 50,
        '\u2605 ' + bonusHeroes.map(h => h.name).join(', ') + ' +50%',
        { font: '10px monospace', fill: '#' + cfg.color.toString(16).padStart(6, '0') }
      ).setOrigin(0.5));
    }

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
    const W     = 480;
    const isWin = result === 'player_win';
    const c     = this._root;
    const floor = this._curFloor;
    const cfg   = this._cfg();

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x000000).setAlpha(0.78));
    c.add(this.add.text(W / 2, 220, isWin ? 'FLOOR ' + floor + '\nCLEARED!' : 'DEFEATED',
      { font: '36px monospace', fill: isWin ? '#' + cfg.color.toString(16).padStart(6, '0') : '#ff4444', align: 'center' }
    ).setOrigin(0.5));

    if (isWin) {
      const reward = AffinityTowerManager.getFloorReward(this._affinity, floor);
      let rewardStr = '+' + reward.gold + ' Gold';
      if (reward.crystals > 0) rewardStr += '  +' + reward.crystals + ' Crystals';
      if (reward.shards   > 0) rewardStr += '\n\u2605 +' + reward.shards + ' Awakening Shards';
      c.add(this.add.text(W / 2, 330, rewardStr,
        { font: '17px monospace', fill: '#ffd700', align: 'center' }
      ).setOrigin(0.5));

      if (reward.isMilestone) {
        const ms = AffinityTowerManager.getMilestoneReward(floor);
        if (ms) {
          c.add(this.add.rectangle(W / 2, 400, 380, 60, 0x1a1a00).setStrokeStyle(1, 0xffdd33));
          c.add(this.add.text(W / 2, 392, '\u2728 MILESTONE REACHED!', {
            font: '14px monospace', fill: '#ffffaa'
          }).setOrigin(0.5));
          c.add(this.add.text(W / 2, 412, ms.bonus + '  +' + ms.crystals + ' Crystals', {
            font: '12px monospace', fill: '#ffeeaa'
          }).setOrigin(0.5));
        }
      }

      const collectY = reward.isMilestone ? 470 : 430;
      const cBtn = this.add.rectangle(W / 2, collectY, 260, 62, 0x200040)
        .setStrokeStyle(2, cfg.color).setInteractive({ useHandCursor: true })
        .on('pointerup', () => this._collectAndContinue(floor));
      c.add(cBtn);
      c.add(this.add.text(W / 2, collectY, 'COLLECT', { font: '22px monospace', fill: '#' + cfg.color.toString(16).padStart(6, '0') }).setOrigin(0.5));
    } else {
      const rBtn = this.add.rectangle(W / 2, 360, 240, 62, 0x2e0b0b)
        .setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true })
        .on('pointerup', () => this._startClimb(floor));
      const mBtn = this.add.rectangle(W / 2, 440, 240, 62, 0x110022)
        .setStrokeStyle(1, cfg.color).setInteractive({ useHandCursor: true })
        .on('pointerup', () => this._showTowerHub());
      c.add(rBtn);
      c.add(this.add.text(W / 2, 360, 'RETRY',    { font: '22px monospace', fill: '#ff6666' }).setOrigin(0.5));
      c.add(mBtn);
      c.add(this.add.text(W / 2, 440, 'TOWER HUB', { font: '22px monospace', fill: '#' + cfg.color.toString(16).padStart(6, '0') }).setOrigin(0.5));
    }
  }

  _collectAndContinue(floor) {
    const aff    = this._affinity;
    const reward = AffinityTowerManager.getFloorReward(aff, floor);
    CurrencyManager.add(CURRENCY.GOLD, reward.gold);
    if (reward.crystals > 0) CurrencyManager.add(CURRENCY.CRYSTALS, reward.crystals);
    if (reward.shards   > 0) CurrencyManager.add(CURRENCY.AWAKENING_SHARDS, reward.shards);
    if (reward.isMilestone) {
      const ms = AffinityTowerManager.getMilestoneReward(floor);
      if (ms?.crystals) CurrencyManager.add(CURRENCY.CRYSTALS, ms.crystals);
    }
    AffinityTowerManager.recordFloorClear(aff, floor);
    GameState.save();
    this._showTowerHub();
  }
}

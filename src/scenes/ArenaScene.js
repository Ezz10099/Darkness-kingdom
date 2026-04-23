import GameState from '../systems/GameState.js';
import HeroManager from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import BattleEngine from '../systems/BattleEngine.js';
import ArenaManager, { RANK_CONFIG } from '../systems/ArenaManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import { CURRENCY } from '../data/constants.js';

const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER:  0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255,
};

export default class ArenaScene extends Phaser.Scene {
  constructor() { super('Arena'); }

  create() {
    this._engine = null;
    this._battleTimer = null;
    this._sprites = {};
    this._ultBtns = [];
    this._logText = null;
    this._logBuf = [];
    this._selectedOpponent = null;
    this._root = this.add.container(0, 0);
    this._showArenaHub();
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

  // ─── ARENA HUB ──────────────────────────────────────────────────────────────

  _showArenaHub() {
    this._reset();
    const c = this._root, W = 480;
    const rankCfg   = ArenaManager.getRankConfig();
    const attempts  = ArenaManager.getAttemptsRemaining();
    const maxAtt    = ArenaManager.getMaxAttempts();
    const tokens    = CurrencyManager.get(CURRENCY.ARENA_TOKENS);
    const history   = ArenaManager.battleHistory;
    const opponents = ArenaManager.getOpponents();
    const hasHeroes = HeroManager.getAllHeroes().length > 0;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));

    c.add(this.add.text(W / 2, 40, 'ARENA', {
      font: '24px monospace', fill: '#ffaa44',
    }).setOrigin(0.5));
    c.add(this.add.text(30, 40, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub')));
    c.add(this.add.text(W - 20, 40, 'SHOP >', { font: '14px monospace', fill: '#ffaa44' })
      .setOrigin(1, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('ArenaShop')));

    c.add(this.add.text(W / 2, 90, rankCfg.label + ' Rank', {
      font: '22px monospace', fill: rankCfg.colorStr,
    }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 120, tokens + ' Arena Tokens', {
      font: '14px monospace', fill: '#ffaa44',
    }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 144, 'Attempts: ' + attempts + ' / ' + maxAtt, {
      font: '14px monospace', fill: attempts > 0 ? '#aaffaa' : '#ff6666',
    }).setOrigin(0.5));

    let nextY = 180;

    if (history.length > 0) {
      c.add(this.add.text(W / 2, nextY, 'RECENT BATTLES', {
        font: '11px monospace', fill: '#886699',
      }).setOrigin(0.5));
      nextY += 20;
      for (const h of history) {
        const col = h.result === 'WIN' ? '#44cc44' : '#cc4444';
        const rs  = h.rankChange > 0 ? '+' + h.rankChange : String(h.rankChange);
        c.add(this.add.text(W / 2, nextY,
          h.result + '  ' + h.opponentName + '  ' + rs + '  +' + h.tokens + 'T', {
            font: '12px monospace', fill: col,
          }).setOrigin(0.5));
        nextY += 22;
      }
      nextY += 10;
    }

    c.add(this.add.text(W / 2, nextY, 'CHALLENGERS', {
      font: '13px monospace', fill: '#cccccc',
    }).setOrigin(0.5));
    nextY += 28;

    if (!hasHeroes) {
      c.add(this.add.text(W / 2, nextY + 20, 'Need heroes in your roster', {
        font: '14px monospace', fill: '#666666',
      }).setOrigin(0.5));
    } else if (attempts <= 0) {
      c.add(this.add.text(W / 2, nextY + 20, 'No attempts remaining today', {
        font: '14px monospace', fill: '#ff6666',
      }).setOrigin(0.5));
    } else {
      for (const opp of opponents) {
        const oy     = nextY + 44;
        const oppCfg = RANK_CONFIG[opp.rankName];
        const diffCol = opp.difficulty === 'hard' ? '#ff6666' : opp.difficulty === 'easy' ? '#66cc66' : '#ffcc44';

        const bg = this.add.rectangle(W / 2, oy, W - 40, 78, 0x111122)
          .setStrokeStyle(1, 0x334466).setInteractive({ useHandCursor: true });
        c.add(bg);

        c.add(this.add.text(28, oy - 24, opp.name, { font: '15px monospace', fill: '#ffffff' }));
        c.add(this.add.text(28, oy - 4, oppCfg.label + '  ' + opp.difficulty.toUpperCase(), {
          font: '12px monospace', fill: oppCfg.colorStr,
        }));
        c.add(this.add.text(28, oy + 18, opp.squad.map(h => h.name).join(', ').slice(0, 26), {
          font: '10px monospace', fill: '#888888',
        }));

        const fBtn = this.add.rectangle(W - 56, oy, 76, 40, 0x1a0a2a)
          .setStrokeStyle(1, 0xaa44ff).setInteractive({ useHandCursor: true });
        c.add(fBtn);
        c.add(this.add.text(W - 56, oy, 'FIGHT', { font: '13px monospace', fill: '#cc88ff' }).setOrigin(0.5));

        bg.on('pointerup',     () => this._startBattle(opp));
        fBtn.on('pointerdown', () => fBtn.setFillStyle(0x0d0520));
        fBtn.on('pointerout',  () => fBtn.setFillStyle(0x1a0a2a));
        fBtn.on('pointerup',   () => this._startBattle(opp));

        nextY += 90;
      }
    }
  }

  // ─── BATTLE ─────────────────────────────────────────────────────────────────

  _startBattle(opponent) {
    if (!ArenaManager.canAttempt()) return;
    this._selectedOpponent = opponent;

    const playerSquad = GameState.getBattleSquadEntries()
      .map(entry => {
        const hero = HeroManager.getHero(entry.heroId);
        return hero ? { hero, row: entry.row } : null;
      })
      .filter(Boolean);

    this._engine = new BattleEngine({
      playerSquad,
      enemySquad: opponent.squad,
      onEvent: ev => this._onBattleEvent(ev),
    });
    this._engine.start();
    this._showBattleView(opponent);
    this._battleTimer = this.time.addEvent({
      delay: 900, loop: true,
      callback: () => { if (this._engine?.running) this._engine.step(); },
    });
  }

  _showBattleView(opponent) {
    this._reset();
    const c = this._root, W = 480;
    const rankCfg = RANK_CONFIG[opponent.rankName];

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 26, 'ARENA  vs  ' + opponent.name, {
      font: '15px monospace', fill: '#ffaa44',
    }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 48, rankCfg.label, {
      font: '12px monospace', fill: rankCfg.colorStr,
    }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 70, 'OPPONENT', { font: '11px monospace', fill: '#ff7766' }).setOrigin(0.5));
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

    const entry = ArenaManager.recordBattle(this._selectedOpponent.id, isWin);
    CurrencyManager.add(CURRENCY.ARENA_TOKENS, entry.tokens);
    DailyCodexManager.increment('ARENA_FIGHTS');
    if (isWin) DailyCodexManager.increment('WIN_ARENA');
    GameState.save();

    const newRankCfg = ArenaManager.getRankConfig();
    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x000000).setAlpha(0.78));
    c.add(this.add.text(W / 2, 220, isWin ? 'VICTORY!' : 'DEFEATED', {
      font: '40px monospace', fill: isWin ? '#ffaa44' : '#ff4444',
    }).setOrigin(0.5));

    const rankStr = entry.rankChange > 0 ? ' (+1)' : entry.rankChange < 0 ? ' (-1)' : '';
    c.add(this.add.text(W / 2, 300, 'Rank: ' + newRankCfg.label + rankStr, {
      font: '18px monospace', fill: newRankCfg.colorStr,
    }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 340, '+' + entry.tokens + ' Arena Tokens', {
      font: '17px monospace', fill: '#ffaa44',
    }).setOrigin(0.5));

    const dBtn = this.add.rectangle(W / 2, 430, 260, 62, isWin ? 0x1a0a00 : 0x0d0520)
      .setStrokeStyle(2, isWin ? 0xffaa44 : 0x5511aa)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this._showArenaHub());
    c.add(dBtn);
    c.add(this.add.text(W / 2, 430, 'BACK TO ARENA', {
      font: '20px monospace', fill: isWin ? '#ffaa44' : '#aa66ff',
    }).setOrigin(0.5));

    AchievementManager.showPopups(this);
  }
}

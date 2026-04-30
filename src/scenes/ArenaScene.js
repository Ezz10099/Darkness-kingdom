import GameState from '../systems/GameState.js';
import HeroManager from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import BattleEngine from '../systems/BattleEngine.js';
import ArenaManager, { RANK_CONFIG } from '../systems/ArenaManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import { CURRENCY } from '../data/constants.js';
import { SIMPLE_UI, addScreenBg, addHeader, addPanel, addButton, addLabel } from '../ui/SimpleUI.js';

const W = 480;
const H = 854;
const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER: 0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
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

  _reset() {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    this._root.removeAll(true);
    this._sprites = {};
    this._ultBtns = [];
    this._logBuf = [];
    this._logText = null;
  }

  _log(msg) {
    this._logBuf.push(msg);
    if (this._logBuf.length > 4) this._logBuf.shift();
    if (this._logText) this._logText.setText(this._logBuf.join('\n'));
  }

  _showArenaHub() {
    this._reset();
    const c = this._root;
    const rankCfg = ArenaManager.getRankConfig();
    const attempts = ArenaManager.getAttemptsRemaining();
    const maxAtt = ArenaManager.getMaxAttempts();
    const tokens = CurrencyManager.get(CURRENCY.ARENA_TOKENS);
    const history = ArenaManager.battleHistory;
    const opponents = ArenaManager.getOpponents();
    const hasHeroes = HeroManager.getAllHeroes().length > 0;
    const squadEntries = GameState.getBattleSquadEntries();
    const squadNames = squadEntries.map(e => HeroManager.getHero(e.heroId)?.name).filter(Boolean);

    addScreenBg(this, c);
    addHeader(this, c, 'ARENA', () => this.scene.start('MainHub'), 'SHOP', () => this.scene.start('ArenaShop'));

    addPanel(this, c, W / 2, 126, W - 32, 86);
    addLabel(this, c, W / 2, 100, `${rankCfg.label} Rank`, 18, rankCfg.colorStr);
    addLabel(this, c, W / 2, 126, `${tokens} Arena Tokens`, 12, SIMPLE_UI.gold);
    addLabel(this, c, W / 2, 148, `Attempts: ${attempts}/${maxAtt}`, 12, attempts > 0 ? SIMPLE_UI.good : SIMPLE_UI.danger);

    addPanel(this, c, W / 2, 192, W - 32, 34);
    addLabel(this, c, W / 2, 192, `SQUAD ${squadEntries.length}/5: ${(squadNames.join(', ') || 'none').slice(0, 48)}`, 10, '#99ccff');

    let y = 242;
    if (history.length > 0) {
      addLabel(this, c, W / 2, y, 'RECENT BATTLES', 12, SIMPLE_UI.muted);
      y += 28;
      history.slice(0, 3).forEach(h => {
        addLabel(this, c, W / 2, y, `${h.result} ${h.opponentName} ${h.rankChange > 0 ? '+' : ''}${h.rankChange} +${h.tokens}T`, 11, h.result === 'WIN' ? SIMPLE_UI.good : SIMPLE_UI.danger);
        y += 22;
      });
      y += 14;
    }

    addLabel(this, c, W / 2, y, 'CHALLENGERS', 14, SIMPLE_UI.gold);
    y += 48;

    if (!hasHeroes) {
      addLabel(this, c, W / 2, y, 'Need heroes in your roster.', 14, SIMPLE_UI.muted);
      return;
    }
    if (attempts <= 0) {
      addLabel(this, c, W / 2, y, 'No attempts remaining today.', 14, SIMPLE_UI.danger);
      return;
    }

    opponents.forEach(opp => {
      const oppCfg = RANK_CONFIG[opp.rankName];
      addPanel(this, c, W / 2, y, W - 40, 78);
      addLabel(this, c, 30, y - 22, opp.name, 14, SIMPLE_UI.text, 0);
      addLabel(this, c, 30, y, `${oppCfg.label} · ${opp.difficulty.toUpperCase()}`, 11, oppCfg.colorStr, 0);
      addLabel(this, c, 30, y + 20, opp.squad.map(h => h.name).join(', ').slice(0, 32), 9, SIMPLE_UI.muted, 0);
      addButton(this, c, W - 58, y, 78, 40, 'FIGHT', () => this._startBattle(opp));
      y += 92;
    });
  }

  _startBattle(opponent) {
    if (!ArenaManager.canAttempt()) return;
    this._selectedOpponent = opponent;
    const frozen = ArenaManager.freezeSquadFromEntries(GameState.getBattleSquadEntries(), id => HeroManager.getHero(id));
    const playerSquad = frozen.map(snapshot => ({
      hero: {
        id: snapshot.id,
        name: snapshot.name,
        heroClass: snapshot.heroClass,
        affinity: snapshot.affinity,
        range: snapshot.range,
        normalAbilityIds: snapshot.abilityIds,
        ultimateAbilityId: snapshot.ultimateAbilityId,
        ultimateAbilityId2: snapshot.ultimateAbilityId2,
        computeStats: () => ({ ...snapshot.stats })
      },
      row: snapshot.row
    }));

    this._engine = new BattleEngine({ playerSquad, enemySquad: opponent.squad, onEvent: ev => this._onBattleEvent(ev) });
    this._engine.start();
    this._showBattleView(opponent);
    this._battleTimer = this.time.addEvent({ delay: 900, loop: true, callback: () => { if (this._engine?.running) this._engine.step(); } });
  }

  _showBattleView(opponent) {
    this._reset();
    const c = this._root;
    const rankCfg = RANK_CONFIG[opponent.rankName];
    addScreenBg(this, c);
    addHeader(this, c, `ARENA vs ${opponent.name}`, () => this._showArenaHub());
    addLabel(this, c, W / 2, 76, rankCfg.label, 12, rankCfg.colorStr);
    addLabel(this, c, W / 2, 110, 'OPPONENT', 11, SIMPLE_UI.danger);
    addLabel(this, c, W / 2, 465, 'YOUR SQUAD', 11, '#66ccff');
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
      addLabel(this, c, x, cy - 38, com.name.slice(0, 6), 10, SIMPLE_UI.text);
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
    const isWin = result === 'player_win';
    const c = this._root;
    const entry = ArenaManager.recordBattle(this._selectedOpponent.id, isWin);
    CurrencyManager.add(CURRENCY.ARENA_TOKENS, entry.tokens);
    DailyCodexManager.increment('ARENA_FIGHTS');
    if (isWin) DailyCodexManager.increment('WIN_ARENA');
    GameState.save();

    const newRankCfg = ArenaManager.getRankConfig();
    c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.78));
    addLabel(this, c, W / 2, 220, isWin ? 'VICTORY!' : 'DEFEATED', 36, isWin ? SIMPLE_UI.gold : SIMPLE_UI.danger);
    addLabel(this, c, W / 2, 300, `Rank: ${newRankCfg.label}${entry.rankChange > 0 ? ' (+1)' : entry.rankChange < 0 ? ' (-1)' : ''}`, 16, newRankCfg.colorStr);
    addLabel(this, c, W / 2, 340, `+${entry.tokens} Arena Tokens`, 16, SIMPLE_UI.gold);
    addButton(this, c, W / 2, 430, 260, 58, 'BACK TO ARENA', () => this._showArenaHub());
    AchievementManager.showPopups(this);
  }
}

import GameState from '../systems/GameState.js';
import HeroManager, { HeroInstance } from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import BattleEngine from '../systems/BattleEngine.js';
import AchievementManager from '../systems/AchievementManager.js';
import ElderTreeManager from '../systems/ElderTreeManager.js';
import BondManager from '../systems/BondManager.js';
import STAGE_DEFINITIONS, { getCampaignRegions } from '../data/stageDefinitions.js';
import HERO_DEFINITIONS from '../data/heroDefinitions.js';
import { CLASS_DEFAULTS, CURRENCY } from '../data/constants.js';
import createVerticalScroll from '../ui/ScrollPane.js';
import { SIMPLE_UI, addScreenBg, addHeader, addFooter, addPanel, addButton, addLabel } from '../ui/SimpleUI.js';

const W = 480;
const H = 854;
const CENTER_TOP = 100;
const CENTER_H = 620;
const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER: 0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
};

export default class CampaignScene extends Phaser.Scene {
  constructor() { super('Campaign'); }

  create() {
    this._engine = null;
    this._battleTimer = null;
    this._sprites = {};
    this._ultBtns = [];
    this._logText = null;
    this._logBuf = [];
    this._curStage = null;
    this._selectedRegion = 1;
    this._scroll = null;
    this._root = this.add.container(0, 0);
    this._showStageSelect();
  }

  _reset() {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    if (this._scroll) { this._scroll.destroy(); this._scroll = null; }
    this._root.removeAll(true);
    this._sprites = {};
    this._ultBtns = [];
    this._logBuf = [];
    this._logText = null;
  }

  _stageIdx(id) { return STAGE_DEFINITIONS.findIndex(s => s.id === id); }
  _lastClearedIdx() {
    const id = GameState.campaignProgress.stageCleared;
    return id ? this._stageIdx(id) : -1;
  }

  _showStageSelect() {
    this._reset();
    const c = this._root;
    const lastIdx = this._lastClearedIdx();
    const regions = getCampaignRegions();
    const nextStage = STAGE_DEFINITIONS[Math.max(0, Math.min(lastIdx + 1, STAGE_DEFINITIONS.length - 1))];
    const unlockedRegion = Math.max(1, nextStage?.region || 1);
    const stages = STAGE_DEFINITIONS.filter(s => s.region === this._selectedRegion);

    addScreenBg(this, c);
    addHeader(this, c, 'CAMPAIGN', () => this.scene.start('MainHub'), 'FORMATION', () => this._showFormationEditor());
    addFooter(this, c);

    regions.forEach((region, i) => {
      const x = 62 + i * 88;
      const enabled = region.region <= unlockedRegion;
      const selected = region.region === this._selectedRegion;
      addButton(this, c, x, 82, 78, 30, selected ? `[R${region.region}]` : `R${region.region}`, () => {
        this._selectedRegion = region.region;
        this._showStageSelect();
      }, enabled);
    });

    addPanel(this, c, W / 2, 410, W - 32, CENTER_H, 0x10101c);
    addLabel(this, c, W / 2, 128, `REGION ${this._selectedRegion} MAP ASSET AREA`, 13, SIMPLE_UI.muted);

    const list = this.add.container(0, 0);
    c.add(list);
    stages.forEach((stage, i) => {
      const globalIdx = this._stageIdx(stage.id);
      const cleared = globalIdx <= lastIdx;
      const unlocked = globalIdx <= lastIdx + 1;
      const y = 16 + i * 64;
      this._drawStageRow(list, stage, y, { cleared, unlocked });
    });
    this._scroll = createVerticalScroll(this, list, {
      x: 0,
      y: 150,
      width: W,
      height: 520,
      contentHeight: 40 + stages.length * 64
    });

    addLabel(this, c, 24, 780, `Cleared: ${Math.max(0, lastIdx + 1)} / ${STAGE_DEFINITIONS.length}`, 12, SIMPLE_UI.text, 0);
    addLabel(this, c, 24, 806, `Gold: ${CurrencyManager.get(CURRENCY.GOLD).toLocaleString()}`, 12, SIMPLE_UI.gold, 0);
    addLabel(this, c, 24, 832, 'Tap unlocked stage to battle. Cleared stages can skip.', 10, SIMPLE_UI.muted, 0);
  }

  _drawStageRow(container, stage, y, { cleared, unlocked }) {
    const rowY = y + 30;
    addPanel(this, container, W / 2, rowY, W - 40, 54, unlocked ? 0x151525 : 0x101016);
    addLabel(this, container, 36, rowY, cleared ? 'OK' : unlocked ? 'GO' : 'LOCK', 10, cleared ? SIMPLE_UI.good : unlocked ? SIMPLE_UI.gold : SIMPLE_UI.muted, 0);
    addLabel(this, container, 92, rowY - 10, `${stage.id}  ${stage.name}`, 12, unlocked ? SIMPLE_UI.text : SIMPLE_UI.muted, 0);
    addLabel(this, container, 92, rowY + 12, `Reward: +${stage.rewards.gold} Gold, +${stage.rewards.xp} XP`, 10, SIMPLE_UI.muted, 0);

    if (unlocked && !cleared) {
      addButton(this, container, W - 56, rowY, 74, 34, 'BATTLE', () => this._showFormationEditor(stage));
    } else if (cleared) {
      addButton(this, container, W - 56, rowY, 74, 34, `${this._getStageSkipCost(stage)}g`, () => this._skipStage(stage));
    }
  }

  _getStageSkipCost(stage) {
    const base = Math.max(20, Math.floor(stage.rewards.gold * 0.25));
    return Math.max(1, Math.floor(base * ElderTreeManager.getSkipCostMult()));
  }

  _skipStage(stage) {
    const cost = this._getStageSkipCost(stage);
    if (!CurrencyManager.spend(CURRENCY.GOLD, cost)) return;
    CurrencyManager.add(CURRENCY.GOLD, stage.rewards.gold);
    HeroManager.getAllHeroes().forEach(h => h.addXP(stage.rewards.xp));
    GameState.save();
    this._showStageSelect();
  }

  _showFormationEditor(stage = null, draftSelected = null) {
    this._reset();
    const c = this._root;
    const heroes = HeroManager.getAllHeroes().slice().sort((a, b) => a.id.localeCompare(b.id));
    const saved = GameState.getBattleSquadEntries();
    const selected = (draftSelected || saved).slice();
    const squadKey = arr => arr.map(e => `${e.heroId}:${e.row}`).sort().join('|');
    const changed = squadKey(selected) !== squadKey(saved);
    const countByRow = () => ({ FRONT: selected.filter(e => e.row === 'FRONT').length, BACK: selected.filter(e => e.row === 'BACK').length });
    const isSelected = id => selected.some(e => e.heroId === id);

    const toggleHero = hero => {
      const idx = selected.findIndex(e => e.heroId === hero.id);
      if (idx >= 0) { selected.splice(idx, 1); return this._showFormationEditor(stage, selected); }
      if (selected.length >= 5) return;
      const defaultRow = CLASS_DEFAULTS[hero.heroClass]?.defaultRow || 'FRONT';
      const counts = countByRow();
      const row = counts[defaultRow] < 3 ? defaultRow : (defaultRow === 'FRONT' ? 'BACK' : 'FRONT');
      if (counts[row] >= 3) return;
      selected.push({ heroId: hero.id, row });
      this._showFormationEditor(stage, selected);
    };
    const toggleRow = hero => {
      const entry = selected.find(e => e.heroId === hero.id);
      if (!entry) return;
      const next = entry.row === 'FRONT' ? 'BACK' : 'FRONT';
      if (countByRow()[next] >= 3) return;
      entry.row = next;
      this._showFormationEditor(stage, selected);
    };

    addScreenBg(this, c);
    addHeader(this, c, 'FORMATION', () => this._showStageSelect());
    addFooter(this, c);
    const counts = countByRow();
    addLabel(this, c, W / 2, 76, `Selected ${selected.length}/5 · FRONT ${counts.FRONT}/3 · BACK ${counts.BACK}/3`, 11, SIMPLE_UI.muted);
    addLabel(this, c, W / 2, 98, changed ? 'UNSAVED CHANGES' : 'SAVED', 10, changed ? SIMPLE_UI.gold : SIMPLE_UI.good);

    const bondIds = selected.map(e => HeroManager.getHero(e.heroId)?.heroDefId).filter(Boolean);
    const bonds = BondManager.getActiveBonds(bondIds);
    addLabel(this, c, W / 2, 122, bonds.length ? bonds.map(b => `${b.name} +${Math.round(b.bonus * 100)}%`).join(' | ') : 'No active bonds', 10, '#99ddff');

    const list = this.add.container(0, 0);
    c.add(list);
    heroes.forEach((hero, i) => {
      const y = 16 + i * 54;
      const picked = isSelected(hero.id);
      const row = selected.find(e => e.heroId === hero.id)?.row || '-';
      addPanel(this, list, W / 2, y + 24, W - 40, 46, picked ? 0x15251a : 0x151525);
      addLabel(this, list, 32, y + 16, hero.name, 12, SIMPLE_UI.text, 0);
      addLabel(this, list, 32, y + 34, hero.heroClass, 10, SIMPLE_UI.muted, 0);
      addButton(this, list, W - 118, y + 24, 74, 30, picked ? 'REMOVE' : 'ADD', () => toggleHero(hero));
      addButton(this, list, W - 42, y + 24, 58, 30, row, () => toggleRow(hero), picked);
    });
    this._scroll = createVerticalScroll(this, list, { x: 0, y: 145, width: W, height: 560, contentHeight: 40 + heroes.length * 54 });

    addButton(this, c, W / 2, 772, 220, 42, stage ? 'SAVE + BATTLE' : 'SAVE', () => {
      GameState.setActiveSquad(selected);
      if (stage) this._startBattle(stage);
      else this._showStageSelect();
    });
    addButton(this, c, W / 2, 822, 220, 30, 'CLEAR SQUAD', () => this._showFormationEditor(stage, []));
  }

  _startBattle(stage) {
    this._curStage = stage;
    const squad = GameState.getBattleSquadEntries()
      .map(entry => {
        const hero = HeroManager.getHero(entry.heroId);
        return hero ? { hero, row: entry.row } : null;
      })
      .filter(Boolean);
    this._engine = new BattleEngine({ playerSquad: squad, enemySquad: stage.enemies, onEvent: ev => this._onBattleEvent(ev) });
    this._engine.start();
    this._showBattleView(stage);
    this._battleTimer = this.time.addEvent({ delay: 900, loop: true, callback: () => { if (this._engine?.running) this._engine.step(); } });
  }

  _showBattleView(stage) {
    this._reset();
    const c = this._root;
    addScreenBg(this, c);
    addHeader(this, c, `${stage.id} — ${stage.name}`, () => this._showStageSelect());
    addLabel(this, c, W / 2, 110, 'ENEMIES', 11, SIMPLE_UI.danger);
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
      const charge = addLabel(this, c, x, hasDual ? 632 : 644, '0%', 11, '#887799');
      c.add(bg);
      addLabel(this, c, x, hasDual ? 618 : 626, hero.name.slice(0, 5), 10, '#cc88ff');
      this._ultBtns.push({ heroId: hero.id, slot: 'primary', bg, chgTxt: charge });
      if (hasDual) {
        const bg2 = this.add.rectangle(x, 656, btnW - 6, 22, 0x1a0530).setStrokeStyle(1, 0x7744cc).setInteractive({ useHandCursor: true }).on('pointerup', () => this._engine?.triggerUltimate(hero.id, 'secondary'));
        const charge2 = addLabel(this, c, x, 656, '0%', 11, '#aa99dd');
        c.add(bg2);
        this._ultBtns.push({ heroId: hero.id, slot: 'secondary', bg: bg2, chgTxt: charge2 });
      }
    });
  }

  _log(msg) {
    this._logBuf.push(msg);
    if (this._logBuf.length > 4) this._logBuf.shift();
    if (this._logText) this._logText.setText(this._logBuf.join('\n'));
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
    c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.78));
    addLabel(this, c, W / 2, 300, isWin ? 'VICTORY!' : 'DEFEATED', 36, isWin ? SIMPLE_UI.good : SIMPLE_UI.danger);

    if (isWin) {
      const stage = this._curStage;
      addLabel(this, c, W / 2, 370, `+${stage.rewards.gold} Gold  +${stage.rewards.xp} XP`, 16, SIMPLE_UI.gold);
      if ((stage.milestoneRewards || []).length) {
        addLabel(this, c, W / 2, 410, stage.milestoneRewards.map(m => `* ${m.hint}`).join('\n'), 12, SIMPLE_UI.gold);
      }
      addButton(this, c, W / 2, 490, 240, 58, 'COLLECT', () => this._collectAndContinue(stage));
    } else {
      addButton(this, c, W / 2, 410, 240, 58, 'RETRY', () => this._startBattle(this._curStage));
      addButton(this, c, W / 2, 490, 240, 58, 'MAP', () => this._showStageSelect());
    }
  }

  _collectAndContinue(stage) {
    CurrencyManager.add(CURRENCY.GOLD, stage.rewards.gold);
    HeroManager.getAllHeroes().forEach(h => h.addXP(stage.rewards.xp));

    if (this._stageIdx(stage.id) > this._lastClearedIdx()) {
      GameState.campaignProgress.stageCleared = stage.id;
      GameState.campaignProgress.regionCleared = Math.max(GameState.campaignProgress.regionCleared || 0, stage.region || 0);
      (stage.milestoneRewards || []).forEach(m => this._applyMilestone(m));
      if (stage.region) AchievementManager.checkRegionReached(stage.region);
    }
    GameState.save();
    this._showStageSelect();
    AchievementManager.showPopups(this);
  }

  _applyMilestone(m) {
    if (m.type === 'giftHero') {
      const def = HERO_DEFINITIONS.find(d => d.id === m.heroDefId);
      if (def && !HeroManager.getAllHeroes().find(h => h.heroDefId === def.id)) {
        HeroManager.addHero(new HeroInstance({
          heroDefId: def.id, name: def.name, title: def.title,
          heroClass: def.heroClass, affinity: def.affinity,
          rarity: def.rarity, originRarity: def.rarity,
          baseStats: def.baseStats,
          normalAbilityIds: def.normalAbilityIds,
          ultimateAbilityId: def.ultimateAbilityId,
          ultimateAbilityId2: def.ultimateAbilityId2 || null
        }));
      }
    }
    if (m.type === 'unlockSystem') GameState.addUnlockedSystem(m.system);
  }
}

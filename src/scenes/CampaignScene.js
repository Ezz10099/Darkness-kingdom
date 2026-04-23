import GameState from '../systems/GameState.js';
import HeroManager, { HeroInstance } from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import BattleEngine from '../systems/BattleEngine.js';
import AchievementManager from '../systems/AchievementManager.js';
import BondManager from '../systems/BondManager.js';
import STAGE_DEFINITIONS, { getCampaignRegions } from '../data/stageDefinitions.js';
import HERO_DEFINITIONS from '../data/heroDefinitions.js';
import { CLASS_DEFAULTS, CURRENCY } from '../data/constants.js';

const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER:  0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
};

export default class CampaignScene extends Phaser.Scene {
  constructor() { super('Campaign'); }

  create() {
    this._engine      = null;
    this._battleTimer = null;
    this._sprites     = {};   // combatantId → { bg, hpBar, barMaxW, hpTxt }
    this._ultBtns     = [];   // { heroId, bg, chgTxt }
    this._logText     = null;
    this._logBuf      = [];
    this._curStage    = null;
    this._selectedRegion = 1;
    this._root        = this.add.container(0, 0);
    this._showStageSelect();
  }

  // ─── UTILITIES ──────────────────────────────────────────────────────────────

  _reset() {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    this._root.removeAll(true);
    this._sprites = {}; this._ultBtns = []; this._logBuf = []; this._logText = null;
  }

  _stageIdx(id)      { return STAGE_DEFINITIONS.findIndex(s => s.id === id); }
  _lastClearedIdx()  {
    const lc = GameState.campaignProgress.stageCleared;
    return lc ? this._stageIdx(lc) : -1;
  }

  _log(msg) {
    this._logBuf.push(msg);
    if (this._logBuf.length > 4) this._logBuf.shift();
    if (this._logText) this._logText.setText(this._logBuf.join('\n'));
  }

  // ─── STAGE SELECT ───────────────────────────────────────────────────────────

  _showStageSelect() {
    this._reset();
    const c = this._root;
    const W = 480;
    const lastIdx = this._lastClearedIdx();
    const allRegions = getCampaignRegions();

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 40, 'CAMPAIGN', { font: '24px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(30, 40, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub')));
    const formationBtn = this.add.rectangle(W - 58, 40, 94, 24, 0x1a1a33).setStrokeStyle(1, 0x887744)
      .setInteractive({ useHandCursor: true }).on('pointerup', () => this._showFormationEditor());
    c.add(formationBtn);
    c.add(this.add.text(W - 58, 40, 'FORMATION', { font: '10px monospace', fill: '#ffd700' }).setOrigin(0.5));

    const unlockedRegion = Math.max(1, STAGE_DEFINITIONS[Math.max(0, Math.min(lastIdx + 1, STAGE_DEFINITIONS.length - 1))]?.region || 1);
    allRegions.forEach((regionCfg, idx) => {
      const x = 48 + idx * 96;
      const isActive = regionCfg.region === this._selectedRegion;
      const isUnlocked = regionCfg.region <= unlockedRegion;
      const bg = this.add.rectangle(x, 78, 86, 28, isActive ? 0x332200 : 0x1a1a33)
        .setStrokeStyle(1, isUnlocked ? 0x887744 : 0x444466)
        .setAlpha(isUnlocked ? 1 : 0.4);
      c.add(bg);
      c.add(this.add.text(x, 78, `R${regionCfg.region}`, { font: '12px monospace', fill: '#ffd700' }).setOrigin(0.5).setAlpha(isUnlocked ? 1 : 0.4));
      if (isUnlocked) {
        bg.setInteractive({ useHandCursor: true }).on('pointerup', () => {
          this._selectedRegion = regionCfg.region;
          this._showStageSelect();
        });
      }
    });

    const stageList = STAGE_DEFINITIONS.filter(stage => stage.region === this._selectedRegion);
    stageList.forEach((stage, localIdx) => {
      const globalIdx = this._stageIdx(stage.id);
      const cleared = globalIdx <= lastIdx;
      const unlocked = globalIdx <= lastIdx + 1;
      const y = 128 + localIdx * 34;
      const bgColor = cleared ? 0x0a260a : 0x111128;
      const alpha = unlocked ? 1 : 0.4;

      const bg = this.add.rectangle(W / 2, y, 436, 28, bgColor)
        .setStrokeStyle(1, cleared ? 0x44bb44 : 0x333366)
        .setAlpha(alpha);
      c.add(bg);

      const icon = cleared ? '✓' : (unlocked ? '▶' : '🔒');
      c.add(this.add.text(38, y, `${icon} ${stage.id} ${stage.name}`,
        { font: '12px monospace', fill: cleared ? '#66ff66' : '#ffffff' })
        .setOrigin(0, 0.5).setAlpha(alpha));
      c.add(this.add.text(392, y, `+${stage.rewards.gold}g`, { font: '11px monospace', fill: '#ffd700' }).setOrigin(1, 0.5).setAlpha(alpha));

      if (unlocked && !cleared) {
        bg.setInteractive({ useHandCursor: true }).on('pointerup', () => this._showFormationEditor(stage));
      }
      if (cleared) {
        const skipCost = this._getStageSkipCost(stage);
        const skipBtn = this.add.rectangle(430, y, 44, 18, 0x2e2400).setStrokeStyle(1, 0xaa8833);
        c.add(skipBtn);
        c.add(this.add.text(430, y, `${skipCost}g`, { font: '9px monospace', fill: '#ffdd88' }).setOrigin(0.5));
        skipBtn.setInteractive({ useHandCursor: true }).on('pointerup', () => this._skipStage(stage));
      }
    });
  }

  _getStageSkipCost(stage) {
    const base = Math.max(20, Math.floor(stage.rewards.gold * 0.25));
    return Math.floor(base);
  }

  _skipStage(stage) {
    const cost = this._getStageSkipCost(stage);
    if (!CurrencyManager.spend(CURRENCY.GOLD, cost)) return;
    CurrencyManager.add(CURRENCY.GOLD, stage.rewards.gold);
    HeroManager.getAllHeroes().forEach(h => h.addXP(stage.rewards.xp));
    GameState.save();
    this._showStageSelect();
  }

  // ─── BATTLE ─────────────────────────────────────────────────────────────────

  _showFormationEditor(stage = null, draftSelected = null) {
    this._reset();
    const c = this._root, W = 480;
    const heroes = HeroManager.getAllHeroes().slice().sort((a, b) => a.id.localeCompare(b.id));
    const selected = (draftSelected || GameState.getBattleSquadEntries()).slice();

    const countByRow = () => ({
      FRONT: selected.filter(e => e.row === 'FRONT').length,
      BACK: selected.filter(e => e.row === 'BACK').length
    });
    const isSelected = heroId => selected.some(e => e.heroId === heroId);

    const toggleHero = (hero) => {
      const idx = selected.findIndex(e => e.heroId === hero.id);
      if (idx >= 0) { selected.splice(idx, 1); this._showFormationEditor(stage, selected); return; }
      if (selected.length >= 5) return;
      const defaultRow = CLASS_DEFAULTS[hero.heroClass]?.defaultRow || 'FRONT';
      const counts = countByRow();
      const row = counts[defaultRow] < 3 ? defaultRow : (defaultRow === 'FRONT' ? 'BACK' : 'FRONT');
      if (counts[row] >= 3) return;
      selected.push({ heroId: hero.id, row });
      this._showFormationEditor(stage, selected);
    };

    const toggleRow = (hero) => {
      const idx = selected.findIndex(e => e.heroId === hero.id);
      if (idx < 0) return;
      const current = selected[idx];
      const nextRow = current.row === 'FRONT' ? 'BACK' : 'FRONT';
      const counts = countByRow();
      if (counts[nextRow] >= 3) return;
      current.row = nextRow;
      this._showFormationEditor(stage, selected);
    };

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 34, 'FORMATION', { font: '24px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(22, 34, '< MAP', { font: '14px monospace', fill: '#aaaaaa' }).setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true }).on('pointerup', () => this._showStageSelect()));
    const counts = countByRow();
    c.add(this.add.text(W / 2, 64,
      `Selected ${selected.length}/5  FRONT ${counts.FRONT}/3  BACK ${counts.BACK}/3`,
      { font: '11px monospace', fill: '#bbbbdd' }).setOrigin(0.5));

    const activeHeroDefIds = selected
      .map(entry => HeroManager.getHero(entry.heroId)?.heroDefId)
      .filter(Boolean);
    const activeBonds = BondManager.getActiveBonds(activeHeroDefIds);
    const bondLine = activeBonds.length
      ? `BONDS: ${activeBonds.map(b => `${b.name} (+${Math.round(b.bonus * 100)}%)`).join('  |  ')}`
      : 'BONDS: none active';
    c.add(this.add.text(W / 2, 82, bondLine, { font: '10px monospace', fill: '#99ddff' }).setOrigin(0.5));

    heroes.forEach((hero, i) => {
      const y = 122 + i * 38;
      const picked = isSelected(hero.id);
      const pickedEntry = selected.find(e => e.heroId === hero.id);
      const row = pickedEntry?.row || '-';
      const rowColor = row === 'FRONT' ? '#ffb088' : row === 'BACK' ? '#88bbff' : '#666688';
      const card = this.add.rectangle(W / 2, y, 444, 32, picked ? 0x1c2c1c : 0x121226)
        .setStrokeStyle(1, picked ? 0x44bb44 : 0x333366)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => toggleHero(hero));
      c.add(card);
      c.add(this.add.text(30, y, hero.name, { font: '12px monospace', fill: '#ffffff' }).setOrigin(0, 0.5));
      c.add(this.add.text(250, y, hero.heroClass, { font: '10px monospace', fill: '#bbbbbb' }).setOrigin(0.5));
      const rowBtn = this.add.rectangle(408, y, 62, 22, picked ? 0x22334d : 0x222222).setStrokeStyle(1, 0x555577);
      c.add(rowBtn);
      c.add(this.add.text(408, y, row, { font: '10px monospace', fill: rowColor }).setOrigin(0.5));
      if (picked) rowBtn.setInteractive({ useHandCursor: true }).on('pointerup', (pointer, lx, ly, ev) => {
        if (ev?.stopPropagation) ev.stopPropagation();
        toggleRow(hero);
      });
    });

    const saveBtn = this.add.rectangle(W / 2, 778, 220, 44, 0x213321).setStrokeStyle(1, 0x44bb44)
      .setInteractive({ useHandCursor: true }).on('pointerup', () => {
        GameState.setActiveSquad(selected);
        if (stage) this._startBattle(stage);
        else this._showStageSelect();
      });
    c.add(saveBtn);
    c.add(this.add.text(W / 2, 778, stage ? 'SAVE + BATTLE' : 'SAVE', { font: '14px monospace', fill: '#99ff99' }).setOrigin(0.5));
  }

  _startBattle(stage) {
    this._curStage = stage;
    const squad = GameState.getBattleSquadEntries()
      .map(entry => {
        const hero = HeroManager.getHero(entry.heroId);
        return hero ? { hero, row: entry.row } : null;
      })
      .filter(Boolean);
    this._engine = new BattleEngine({
      playerSquad: squad,
      enemySquad:  stage.enemies,
      onEvent:     ev => this._onBattleEvent(ev)
    });
    this._engine.start();
    this._showBattleView(stage);
    this._battleTimer = this.time.addEvent({
      delay: 900, loop: true,
      callback: () => { if (this._engine?.running) this._engine.step(); }
    });
  }

  _showBattleView(stage) {
    this._reset();
    const c = this._root, W = 480;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 26, `${stage.id} — ${stage.name}`,
      { font: '15px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 70, 'ENEMIES',    { font: '11px monospace', fill: '#ff7766' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 470, 'YOUR SQUAD', { font: '11px monospace', fill: '#66ccff' }).setOrigin(0.5));

    // Battle log
    c.add(this.add.rectangle(W / 2, 335, W - 16, 110, 0x0c0c1e).setStrokeStyle(1, 0x2a2a4a));
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
      const hpTxt = this.add.text(x, cy + 50, `${com.hp}`,
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
          sp.hpTxt.setText(`${ev.finalHp}`);
        }
        this._log(`-${ev.amount} dmg`);
        break;
      }
      case 'heroDefeated': {
        const sp = this._sprites[ev.id];
        if (sp) { sp.bg.setFillStyle(0x222222); sp.hpTxt.setText('✕'); }
        break;
      }
      case 'ultimateReady': {
        const btn = this._ultBtns.find(b => b.heroId === ev.id);
        if (btn) { btn.bg.setFillStyle(0x5500bb); btn.chgTxt.setText('▶ULT').setStyle({ fill: '#ffaaff' }); }
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
          if (com && com.ultimateCharge < 100) btn.chgTxt.setText(`${com.ultimateCharge}%`);
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

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x000000).setAlpha(0.78));
    c.add(this.add.text(W / 2, 300, isWin ? 'VICTORY!' : 'DEFEATED',
      { font: '38px monospace', fill: isWin ? '#66ff66' : '#ff4444' }).setOrigin(0.5));

    if (isWin) {
      const s = this._curStage;
      c.add(this.add.text(W / 2, 370, `+${s.rewards.gold} Gold  +${s.rewards.xp} XP`,
        { font: '17px monospace', fill: '#ffd700' }).setOrigin(0.5));
      if (s.milestoneRewards.length) {
        c.add(this.add.text(W / 2, 410,
          s.milestoneRewards.map(m => '★ ' + m.hint).join('\n'),
          { font: '13px monospace', fill: '#ffaa44', align: 'center' }).setOrigin(0.5));
      }
      const cBtn = this.add.rectangle(W / 2, 490, 240, 62, 0x0b2e0b)
        .setStrokeStyle(2, 0x44ff44).setInteractive({ useHandCursor: true })
        .on('pointerup', () => this._collectAndContinue(s));
      c.add(cBtn);
      c.add(this.add.text(W / 2, 490, 'COLLECT', { font: '22px monospace', fill: '#66ff66' }).setOrigin(0.5));
    } else {
      const rBtn = this.add.rectangle(W / 2, 410, 240, 62, 0x2e0b0b)
        .setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true })
        .on('pointerup', () => this._startBattle(this._curStage));
      const mBtn = this.add.rectangle(W / 2, 490, 240, 62, 0x111130)
        .setStrokeStyle(1, 0x4444aa).setInteractive({ useHandCursor: true })
        .on('pointerup', () => this._showStageSelect());
      c.add(rBtn);
      c.add(this.add.text(W / 2, 410, 'RETRY', { font: '22px monospace', fill: '#ff6666' }).setOrigin(0.5));
      c.add(mBtn);
      c.add(this.add.text(W / 2, 490, 'MAP', { font: '22px monospace', fill: '#aaaaff' }).setOrigin(0.5));
    }
  }

  _collectAndContinue(stage) {
    CurrencyManager.add(CURRENCY.GOLD, stage.rewards.gold);
    HeroManager.getAllHeroes().forEach(h => h.addXP(stage.rewards.xp));

    if (this._stageIdx(stage.id) > this._lastClearedIdx()) {
      GameState.campaignProgress.stageCleared = stage.id;
      GameState.campaignProgress.regionCleared = Math.max(GameState.campaignProgress.regionCleared || 0, stage.region || 0);
      stage.milestoneRewards.forEach(m => this._applyMilestone(m));
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
          rarity: def.rarity, originRarity: def.rarity, baseStats: def.baseStats,
          normalAbilityIds: def.normalAbilityIds,
          ultimateAbilityId: def.ultimateAbilityId, ultimateAbilityId2: def.ultimateAbilityId2 || null
        }));
      }
    }
    if (m.type === 'unlockSystem') GameState.addUnlockedSystem(m.system);
  }
}

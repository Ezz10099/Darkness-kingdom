import GameState from '../systems/GameState.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import IdleManager from '../systems/IdleManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import LoginStreakManager from '../systems/LoginStreakManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import HeroManager from '../systems/HeroManager.js';
import { CURRENCY } from '../data/constants.js';
import { SIMPLE_UI, addScreenBg, addPanel, addButton, addLabel } from '../ui/SimpleUI.js';

const W = 480;
const H = 854;
const TOP_H = 78;
const BOTTOM_H = 92;
const CENTER_TOP = TOP_H + 12;
const CENTER_H = H - TOP_H - BOTTOM_H - 24;

const NAV_TABS = ['Campaign', 'Heroes', 'Summon', 'Guild', 'More'];

export default class MainHubScene extends Phaser.Scene {
  constructor() {
    super('MainHub');
    this._selectedTab = 'Campaign';
    this._pendingIdleGold = 0;
    this._currencyTexts = {};
    this._dotTargets = {};
  }

  create(data = {}) {
    this._selectedTab = data.tab || 'Campaign';
    this._currencyTexts = {};
    this._dotTargets = {};

    addScreenBg(this, null);
    this._centerRoot = this.add.container(0, 0);
    this._navRoot = this.add.container(0, 0);

    this._drawTopBar();
    this._drawSideShortcuts();
    this._drawBottomNav();
    this._drawTabContent();

    this.time.addEvent({ delay: 500, loop: true, callback: this._refreshUI, callbackScope: this });
    this.time.addEvent({ delay: 1000, loop: true, callback: this._idleTick, callbackScope: this });
    this.time.addEvent({ delay: 30000, loop: true, callback: () => GameState.save() });
    this._refreshUI();

    if (LoginStreakManager.canClaimToday()) {
      this.time.delayedCall(120, () => this.scene.start('LoginStreak', { returnScene: 'MainHub' }));
    }
    AchievementManager.showPopups(this);
  }

  _drawTopBar() {
    addPanel(this, null, W / 2, TOP_H / 2, W, TOP_H, SIMPLE_UI.panel);
    this._usernameText = addLabel(this, null, 18, 20, 'Risen Ruler', 13, SIMPLE_UI.text, 0);
    this._powerText = addLabel(this, null, 18, 42, 'Power 0', 11, SIMPLE_UI.muted, 0);

    const defs = [
      { key: CURRENCY.GOLD, label: 'G' },
      { key: CURRENCY.PREMIUM_CRYSTALS, label: 'A' },
      { key: CURRENCY.CRYSTALS, label: 'S' }
    ];
    defs.forEach((def, i) => {
      const x = 230 + i * 58;
      addPanel(this, null, x, 38, 52, 24, 0x151525);
      addLabel(this, null, x - 18, 38, def.label, 10, SIMPLE_UI.gold);
      this._currencyTexts[def.key] = addLabel(this, null, x + 6, 38, '0', 10, SIMPLE_UI.text);
    });
    addButton(this, null, 448, 38, 44, 28, 'SET', () => this.scene.start('Settings'));
  }

  _drawSideShortcuts() {
    const shortcuts = [
      { x: 42, y: 170, label: 'EVENTS', scene: 'Achievement', dotKey: 'events' },
      { x: 42, y: 226, label: 'CODEX', scene: 'DailyCodex', dotKey: 'codex' },
      { x: 438, y: 170, label: 'ARENA', scene: 'Arena' },
      { x: 438, y: 226, label: 'SHOP', scene: 'GuildShop', dotKey: 'offers' }
    ];
    shortcuts.forEach(item => {
      addButton(this, null, item.x, item.y, 64, 34, item.label, () => {
        const gate = this._getSceneUnlock(item.scene);
        this._startSceneOrLocked(item.scene, gate?.unlockKey, gate?.lockedMsg);
      });
      if (item.dotKey) this._dotTargets[item.dotKey] = this.add.circle(item.x + 26, item.y - 15, 5, 0xff4444).setVisible(false);
    });
  }

  _drawBottomNav() {
    this._navRoot.removeAll(true);
    addPanel(this, this._navRoot, W / 2, H - BOTTOM_H / 2, W, BOTTOM_H, SIMPLE_UI.panel);
    NAV_TABS.forEach((tab, i) => {
      const x = 48 + i * 96;
      const selected = tab === this._selectedTab;
      addButton(this, this._navRoot, x, H - 48, 82, 44, tab.toUpperCase(), () => this._selectTab(tab), true);
      if (selected) this._navRoot.add(this.add.rectangle(x, H - 20, 54, 3, SIMPLE_UI.borderActive));
      if (tab === 'Summon') this._dotTargets.summon = this.add.circle(x + 32, H - 68, 5, 0xff4444).setVisible(false);
      if (tab === 'Summon') this._navRoot.add(this._dotTargets.summon);
    });
  }

  _selectTab(tabKey) {
    this._selectedTab = tabKey;
    this._drawBottomNav();
    this._drawTabContent();
    this._refreshUI();
  }

  _drawTabContent() {
    this._centerRoot.removeAll(true);
    addPanel(this, this._centerRoot, W / 2, CENTER_TOP + CENTER_H / 2, W - 32, CENTER_H, SIMPLE_UI.panelSoft);
    if (this._selectedTab === 'Campaign') this._drawCampaignTab(this._centerRoot);
    else if (this._selectedTab === 'Heroes') this._drawHeroesTab(this._centerRoot);
    else if (this._selectedTab === 'Summon') this._drawSummonTab(this._centerRoot);
    else if (this._selectedTab === 'Guild') this._drawGuildTab(this._centerRoot);
    else this._drawMoreTab(this._centerRoot);
  }

  _drawTabHeader(c, title, subtitle) {
    addLabel(this, c, W / 2, CENTER_TOP + 32, title, 22, SIMPLE_UI.gold);
    addLabel(this, c, W / 2, CENTER_TOP + 58, subtitle, 11, SIMPLE_UI.muted);
  }

  _drawCampaignTab(c) {
    this._drawTabHeader(c, 'CAMPAIGN', 'placeholder map area');
    addPanel(this, c, W / 2, 350, 360, 300, 0x10101c);
    addLabel(this, c, W / 2, 235, 'CHAPTER BACKGROUND ASSET HERE', 12, SIMPLE_UI.muted);
    const nodes = [{ x: 130, y: 410, t: '1-1' }, { x: 190, y: 365, t: '1-2' }, { x: 255, y: 330, t: '1-3' }, { x: 325, y: 285, t: 'BOSS' }];
    nodes.forEach((n, i) => {
      if (i > 0) c.add(this.add.line(0, 0, nodes[i - 1].x, nodes[i - 1].y, n.x, n.y, 0x666677).setOrigin(0));
      c.add(this.add.circle(n.x, n.y, 18, 0x222238).setStrokeStyle(1, SIMPLE_UI.borderActive));
      addLabel(this, c, n.x, n.y, n.t, 9, SIMPLE_UI.text);
    });
    addLabel(this, c, W / 2, 548, `Last cleared: ${GameState.campaignProgress.stageCleared || 'none'}`, 12, SIMPLE_UI.muted);
    addButton(this, c, W / 2, 594, 230, 42, 'OPEN CAMPAIGN', () => this.scene.start('Campaign'));
  }

  _drawHeroesTab(c) {
    this._drawTabHeader(c, 'HEROES', 'roster and upgrades');
    const heroes = HeroManager.getAllHeroes();
    const squad = GameState.getBattleSquadEntries?.() || [];
    addPanel(this, c, W / 2, 300, 360, 150, 0x10101c);
    addLabel(this, c, W / 2, 260, `${heroes.length} heroes owned`, 16, SIMPLE_UI.gold);
    addLabel(this, c, W / 2, 292, `Battle squad: ${squad.length}/5`, 13, SIMPLE_UI.text);
    addButton(this, c, W / 2, 450, 230, 42, 'OPEN ROSTER', () => this.scene.start('Roster'));
    addButton(this, c, W / 2, 502, 230, 36, 'GEAR FORGE', () => this.scene.start('GearForge'));
  }

  _drawSummonTab(c) {
    this._drawTabHeader(c, 'SUMMON', 'summon portal placeholder');
    addPanel(this, c, W / 2, 330, 220, 220, 0x10101c);
    addLabel(this, c, W / 2, 330, 'PORTAL ASSET HERE', 15, SIMPLE_UI.muted);
    addButton(this, c, W / 2, 506, 230, 42, 'OPEN SUMMON', () => this.scene.start('Summon'));
  }

  _drawGuildTab(c) {
    this._drawTabHeader(c, 'GUILD', 'guild systems');
    const unlocked = GameState.isUnlocked('GUILD');
    addPanel(this, c, W / 2, 330, 360, 170, 0x10101c);
    addLabel(this, c, W / 2, 310, unlocked ? 'Guild available' : 'Guild locked', 16, unlocked ? SIMPLE_UI.gold : SIMPLE_UI.muted);
    addButton(this, c, W / 2, 500, 230, 42, unlocked ? 'OPEN GUILD' : 'LOCKED', () => this._startSceneOrLocked('Guild', 'GUILD', 'Unlocks after Region 3'), unlocked);
    addButton(this, c, W / 2, 552, 230, 36, 'GUILD SHOP', () => this._startSceneOrLocked('GuildShop', 'GUILD', 'Unlocks after Region 3'), unlocked);
  }

  _drawMoreTab(c) {
    this._drawTabHeader(c, 'MORE', 'secondary systems');
    const items = [
      { label: 'Arena', scene: 'Arena' }, { label: 'Towers', scene: 'AffinityTowerSelection' },
      { label: 'World Boss', scene: 'WorldBoss' }, { label: 'Codex', scene: 'DailyCodex' },
      { label: 'Abyss Tree', scene: 'ElderTree' }, { label: 'Settings', scene: 'Settings' }
    ];
    items.forEach((item, i) => {
      const x = 150 + (i % 2) * 180;
      const y = 240 + Math.floor(i / 2) * 96;
      addButton(this, c, x, y, 150, 64, item.label.toUpperCase(), () => {
        const gate = this._getSceneUnlock(item.scene);
        this._startSceneOrLocked(item.scene, gate?.unlockKey, gate?.lockedMsg);
      });
    });
  }

  _startSceneOrLocked(scene, unlockKey, lockedMsg) {
    if (unlockKey && !GameState.isUnlocked(unlockKey)) return this._showToast(lockedMsg || 'Locked');
    this.scene.start(scene);
  }

  _getSceneUnlock(scene) {
    return {
      Arena: { unlockKey: 'ARENA', lockedMsg: 'Unlocks after Region 2' },
      Guild: { unlockKey: 'GUILD', lockedMsg: 'Unlocks after Region 3' },
      GuildShop: { unlockKey: 'GUILD', lockedMsg: 'Unlocks after Region 3' },
      AffinityTowerSelection: { unlockKey: 'AFFINITY_TOWERS', lockedMsg: 'Unlocks after Region 3' },
      EndlessTower: { unlockKey: 'FULL_ENDLESS_CONTENT', lockedMsg: 'Unlocks after Region 5' }
    }[scene] || null;
  }

  _isCodexNotifiable() {
    const tasks = DailyCodexManager.getTasks();
    return tasks.some(t => t.completed) || (DailyCodexManager.isAllDailyComplete() && !DailyCodexManager.dailyChestClaimed);
  }

  _updateNotificationDots() {
    const candidates = [
      { key: 'codex', show: this._isCodexNotifiable(), dot: this._dotTargets.codex },
      { key: 'summon', show: LoginStreakManager.canClaimToday(), dot: this._dotTargets.summon },
      { key: 'events', show: LoginStreakManager.canClaimToday(), dot: this._dotTargets.events },
      { key: 'offers', show: CurrencyManager.get(CURRENCY.PREMIUM_CRYSTALS) < 100, dot: this._dotTargets.offers }
    ];
    const active = candidates.filter(c => c.show).slice(0, 4).map(c => c.key);
    candidates.forEach(c => c.dot?.setVisible(active.includes(c.key)));
  }

  _idleTick() {
    IdleManager.tick(1000, GameState.campaignProgress, GameState.activeSquad);
    const rate = IdleManager.getRate(GameState.campaignProgress);
    this._pendingIdleGold = Math.min(this._pendingIdleGold + rate, rate * 120);
  }

  _refreshUI() {
    this._currencyTexts[CURRENCY.GOLD]?.setText(this._compact(CurrencyManager.get(CURRENCY.GOLD)));
    this._currencyTexts[CURRENCY.PREMIUM_CRYSTALS]?.setText(this._compact(CurrencyManager.get(CURRENCY.PREMIUM_CRYSTALS)));
    this._currencyTexts[CURRENCY.CRYSTALS]?.setText(this._compact(CurrencyManager.get(CURRENCY.CRYSTALS)));
    this._usernameText?.setText(GameState.playerName || 'Risen Ruler');
    this._powerText?.setText(`Power ${this._compact(this._getTeamPower())}`);
    this._updateNotificationDots();
  }

  _getTeamPower() {
    if (typeof GameState.getTeamPower === 'function') return GameState.getTeamPower() || 0;
    return (GameState.getActiveSquadEntries?.() || []).reduce((total, entry) => {
      const hero = HeroManager.getHero(entry.heroId);
      if (!hero?.computeStats) return total;
      const stats = hero.computeStats();
      return total + (stats.damage || 0) + (stats.defense || 0) + Math.floor((stats.hp || 0) / 10);
    }, 0);
  }

  _compact(value) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return `${Math.floor(value)}`;
  }

  _showToast(message) {
    const toast = this.add.text(W / 2, H - 128, message, { font: '14px monospace', fill: SIMPLE_UI.text, backgroundColor: '#000000cc', padding: { x: 10, y: 6 } }).setOrigin(0.5).setDepth(1000);
    this.tweens.add({ targets: toast, y: toast.y - 14, alpha: 0, duration: 700, onComplete: () => toast.destroy() });
  }
}

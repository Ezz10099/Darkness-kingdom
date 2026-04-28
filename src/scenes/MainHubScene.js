import GameState from '../systems/GameState.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import IdleManager from '../systems/IdleManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import LoginStreakManager from '../systems/LoginStreakManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import HeroManager from '../systems/HeroManager.js';
import { CURRENCY } from '../data/constants.js';
import { ARCANE_THEME, addArcaneBackdrop, createPanel, createArcaneButton } from '../ui/ArcaneUI.js';

const W = 480;
const H = 854;
const OUTER_PADDING = 16;

const ICONS = {
  settings: '✦',
  gold: '◍',
  gems: '◆',
  tickets: '◈',
  energy: 'ϟ',
  adventure: '⚔',
  heroes: '⛨',
  academy: '⌂',
  summon: '✹',
  guild: '⛊',
  friends: '☉',
  arena: '⚔',
  rankings: '♛',
  chat: '✉',
  quests: '☰',
  mail: '✉',
  events: '✦',
  pass: '⬢',
  offers: '◉'
};

export default class MainHubScene extends Phaser.Scene {
  constructor() {
    super('MainHub');
    this._heroSprites = [];
    this._pendingIdleGold = 0;
    this._dotTargets = {};
    this._resourceTexts = [];
  }

  create() {
    addArcaneBackdrop(this, W, H);
    this._drawCenterScene();
    this._drawTopBar();
    this._drawSideButtons();
    this._drawBottomNav();

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
    const topBarHeight = 72;
    const y = topBarHeight / 2 + 6;
    createPanel(this, {
      x: W / 2,
      y,
      width: W - (OUTER_PADDING * 2),
      height: topBarHeight,
      fill: 0x120c22,
      border: 0x89613f,
      withInner: false
    });

    this._avatarRing = this.add.circle(OUTER_PADDING + 28, y, 24, 0x2a1d45, 0.95).setStrokeStyle(2, 0xc69d63, 1);
    this._avatarCore = this.add.circle(OUTER_PADDING + 28, y, 16, 0x4e2f72, 0.8).setStrokeStyle(1, 0xe3bf80, 0.8);
    this._avatarOnline = this.add.circle(OUTER_PADDING + 44, y + 17, 4, 0x58ffb2, 0.95)
      .setStrokeStyle(1, 0xdffff0, 0.8);
    this.tweens.add({ targets: this._avatarOnline, alpha: 0.35, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.inOut' });

    this._levelBadge = this.add.circle(OUTER_PADDING + 14, y + 18, 9, 0x4a316b, 1).setStrokeStyle(1, 0xe5be7e, 0.9);
    this._levelText = this.add.text(OUTER_PADDING + 14, y + 18, '1', { font: '10px monospace', fill: ARCANE_THEME.colors.textPrimary }).setOrigin(0.5);

    this._usernameText = this.add.text(OUTER_PADDING + 58, y - 14, 'Arcanist', { font: '14px monospace', fill: ARCANE_THEME.colors.textPrimary });
    this._powerText = this.add.text(OUTER_PADDING + 58, y + 6, 'Power 0', { font: '12px monospace', fill: ARCANE_THEME.colors.textSecondary });

    const currencyDefs = [
      { key: CURRENCY.GOLD, icon: ICONS.gold, tint: '#ffd27b', short: 'gold' },
      { key: CURRENCY.PREMIUM_CRYSTALS, icon: ICONS.gems, tint: '#d3a2ff', short: 'gems' },
      { key: CURRENCY.CRYSTALS, icon: ICONS.tickets, tint: '#bba8ff', short: 'tickets' },
      { key: CURRENCY.AWAKENING_SHARDS, icon: ICONS.energy, tint: '#7ecfff', short: 'energy' }
    ];

    this._currencyTexts = {};
    let cx = 250;
    currencyDefs.forEach(def => {
      const holder = this.add.container(cx, y);
      const chip = this.add.rectangle(0, 0, 52, 24, 0x1c1230, 0.95).setStrokeStyle(1, 0x8f6947, 0.9);
      const chipGlow = this.add.rectangle(0, 0, 52, 24, 0x7837b3, 0.08);
      const icon = this.add.text(-17, 0, def.icon, { font: '12px serif', fill: def.tint }).setOrigin(0.5);
      const value = this.add.text(1, 0, '0', { font: '11px monospace', fill: ARCANE_THEME.colors.textPrimary }).setOrigin(0.5);
      const plus = this.add.rectangle(24, 0, 14, 14, 0x3a264f, 1).setStrokeStyle(1, 0xc79e67, 0.8).setInteractive({ useHandCursor: true });
      const plusText = this.add.text(24, 0, '+', { font: '10px monospace', fill: '#ffe4b8' }).setOrigin(0.5);
      plus.on('pointerup', () => this._showToast(`${def.short} sources`));
      holder.add([chip, chipGlow, icon, value, plus, plusText]);
      this._currencyTexts[def.key] = value;
      cx += 52;
    });

    this._makeIconButton({ x: W - OUTER_PADDING - 20, y, label: ICONS.settings, scene: 'Settings' });
  }

  _drawCenterScene() {
    const centerY = 420;
    this.add.ellipse(W / 2, centerY, W + 120, H - 260, 0x0f0b1d, 0.85);
    this.add.ellipse(W / 2, centerY - 120, W + 140, 320, 0x25143c, 0.24);
    this.add.ellipse(W / 2, centerY + 20, W + 70, 250, 0x4d2b66, 0.2);

    const clouds = this.add.ellipse(W / 2, 250, 420, 110, 0x8d63cf, 0.11);
    this.tweens.add({ targets: clouds, x: W / 2 + 8, yoyo: true, duration: 5000, repeat: -1, ease: 'Sine.inOut' });

    this._drawBuilding({ x: 88, y: 438, label: 'Campaign Gate', scene: 'Campaign', color: 0x64315c, icon: ICONS.adventure });
    this._drawBuilding({ x: 188, y: 356, label: 'Summon Portal', scene: 'Summon', color: 0x6a3e9d, pulse: true, dotKey: 'summon', icon: ICONS.summon });
    this._drawBuilding({ x: 298, y: 350, label: 'Academy Tower', scene: 'AffinityTowerSelection', color: 0x3f326b, icon: ICONS.academy });
    this._drawBuilding({ x: 392, y: 435, label: 'Guild Hall', scene: 'Guild', color: 0x523245, icon: ICONS.guild });

    this._heroLayer = this.add.container(0, 0);
    this._buildIdleHeroAnimations();
    this._drawResourceStrip();
  }

  _drawBuilding({ x, y, label, scene, color, pulse = false, dotKey = null, icon = '◆' }) {
    const pad = this.add.container(x, y);
    const glow = this.add.circle(0, 0, 36, color, 0.3);
    const body = this.add.circle(0, 0, 24, color, 0.9).setStrokeStyle(2, 0xc79d62, 0.9);
    const inner = this.add.circle(0, 0, 14, 0x140c22, 0.55).setStrokeStyle(1, 0xd2b070, 0.7);
    const iconText = this.add.text(0, -1, icon, { font: '13px serif', fill: '#f7e0bd' }).setOrigin(0.5);
    const title = this.add.text(0, 35, label, { font: '11px monospace', fill: ARCANE_THEME.colors.textPrimary, align: 'center' }).setOrigin(0.5);
    pad.add([glow, body, inner, iconText, title]);

    if (pulse) {
      this.tweens.add({ targets: glow, scaleX: 1.22, scaleY: 1.22, alpha: 0.12, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: iconText, alpha: 0.5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    body.setInteractive({ useHandCursor: true });
    body.on('pointerup', () => this.scene.start(scene));

    const dot = this.add.circle(x + 20, y - 20, 5, ARCANE_THEME.colors.danger).setVisible(false);
    if (dotKey) this._dotTargets[dotKey] = dot;
  }

  _drawResourceStrip() {
    const panel = createPanel(this, {
      x: W / 2,
      y: 540,
      width: 312,
      height: 34,
      fill: 0x0f0a1c,
      border: 0x8d6940,
      withInner: false
    });

    const defs = [
      { key: CURRENCY.GOLD, icon: ICONS.gold, tint: '#ffd27b' },
      { key: CURRENCY.PREMIUM_CRYSTALS, icon: ICONS.gems, tint: '#d3a2ff' },
      { key: CURRENCY.CRYSTALS, icon: ICONS.tickets, tint: '#bba8ff' }
    ];

    this._resourceTexts = defs.map((def, index) => {
      const x = -98 + (index * 98);
      panel.add(this.add.text(x, 0, def.icon, { font: '13px serif', fill: def.tint }).setOrigin(0.5));
      return panel.add(this.add.text(x + 24, 0, '0', {
        font: '14px monospace',
        fill: ARCANE_THEME.colors.textPrimary
      }).setOrigin(0.5));
    });
  }

  _drawSideButtons() {
    const leftButtons = [
      { icon: ICONS.friends, label: 'Friends', toast: 'Friends' },
      { icon: ICONS.arena, label: 'Arena', scene: 'Arena' },
      { icon: ICONS.rankings, label: 'Ranks', scene: 'EndlessTower' },
      { icon: ICONS.chat, label: 'Chat', toast: 'Chat' }
    ];

    const rightButtons = [
      { icon: ICONS.quests, label: 'Quests', scene: 'DailyCodex', dotKey: 'codex' },
      { icon: ICONS.mail, label: 'Mail', toast: 'Mail' },
      { icon: ICONS.events, label: 'Events', scene: 'Achievement', large: true, dotKey: 'events', timer: '02:19' },
      { icon: ICONS.pass, label: 'Pass', toast: 'Battle Pass' },
      { icon: ICONS.offers, label: 'Offers', scene: 'GuildShop', dotKey: 'offers' }
    ];

    leftButtons.forEach((item, idx) => {
      this._makeSideButton({ x: OUTER_PADDING + 26, y: 322 + (idx * 56), ...item });
    });

    rightButtons.forEach((item, idx) => {
      this._makeSideButton({ x: W - OUTER_PADDING - 26, y: 296 + (idx * 56), ...item });
    });
  }

  _makeSideButton({ x, y, icon, label, scene, toast, large = false, dotKey = null, timer = null }) {
    const size = large ? 56 : 46;
    const circle = this.add.circle(x, y, size / 2, 0x201335, 0.92).setStrokeStyle(2, 0xba915a, 0.95);
    const ring = this.add.circle(x, y, (size / 2) - 6, 0x0f0a1b, 0.6).setStrokeStyle(1, 0x9a7548, 0.8);
    const iconText = this.add.text(x, y - 1, icon, { font: `${large ? 22 : 16}px serif`, fill: '#f5dfbc' }).setOrigin(0.5);
    const title = this.add.text(x, y + (large ? 38 : 32), label, {
      font: '10px monospace',
      fill: ARCANE_THEME.colors.textSecondary
    }).setOrigin(0.5);

    const hit = this.add.zone(x, y, size + 16, size + 16).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => this.tweens.add({ targets: [circle, ring, iconText], scale: 1.03, duration: 110, yoyo: true }));
    hit.on('pointerup', () => {
      if (scene) this.scene.start(scene);
      else this._showToast(toast || 'Soon');
    });

    if (timer) {
      const timerPlate = this.add.rectangle(x, y + (large ? 22 : 18), 30, 11, 0x2f1b44, 0.95).setStrokeStyle(1, 0xc89f65, 0.8);
      const timerText = this.add.text(x, y + (large ? 22 : 18), timer, { font: '8px monospace', fill: '#ffdbad' }).setOrigin(0.5);
      this.tweens.add({ targets: timerText, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
      timerPlate.setDepth(circle.depth + 1);
      timerText.setDepth(circle.depth + 2);
    }

    if (dotKey) {
      const dot = this.add.circle(x + (size / 2) - 7, y - (size / 2) + 7, 5, ARCANE_THEME.colors.danger).setVisible(false);
      this._dotTargets[dotKey] = dot;
    }
  }

  _drawBottomNav() {
    const navHeight = 92;
    const y = H - (navHeight / 2);
    createPanel(this, {
      x: W / 2,
      y,
      width: W - (OUTER_PADDING * 2),
      height: navHeight,
      fill: 0x140e25,
      border: 0x9a7340,
      withInner: true
    });

    const items = [
      { label: 'Adventure', icon: ICONS.adventure, scene: 'Campaign', x: 62 },
      { label: 'Heroes', icon: ICONS.heroes, scene: 'Roster', x: 142 },
      { label: 'Academy', icon: ICONS.academy, scene: 'AffinityTowerSelection', x: 222 },
      { label: 'Summon', icon: ICONS.summon, scene: 'Summon', x: 302, center: true, dotKey: 'summon' },
      { label: 'Guild', icon: ICONS.guild, scene: 'Guild', x: 382 }
    ];

    items.forEach(item => {
      const buttonY = item.center ? y - 28 : y + 2;
      const radius = item.center ? 34 : 25;
      const ring = this.add.circle(item.x, buttonY, radius, item.center ? 0x3c2168 : 0x241639, 0.98)
        .setStrokeStyle(2, item.center ? 0xd2ab6d : 0xa37d4a, 1);
      const core = this.add.circle(item.x, buttonY, radius - (item.center ? 9 : 7), 0x110a20, 0.7)
        .setStrokeStyle(1, 0x8f6841, 0.8);
      const icon = this.add.text(item.x, buttonY - 7, item.icon, { font: `${item.center ? 22 : 17}px serif`, fill: '#f5dfbc' }).setOrigin(0.5);
      const text = this.add.text(item.x, buttonY + (item.center ? 18 : 16), item.label, {
        font: `${item.center ? 11 : 10}px monospace`,
        fill: ARCANE_THEME.colors.textPrimary
      }).setOrigin(0.5);

      const hit = this.add.zone(item.x, buttonY, radius * 2 + 10, radius * 2 + 10).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.tweens.add({ targets: [ring, core, icon], scale: 1.03, duration: 110, yoyo: true }));
      hit.on('pointerup', () => this.scene.start(item.scene));

      if (item.center) {
        this.tweens.add({ targets: ring, alpha: 0.78, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }

      if (item.dotKey) {
        const dot = this.add.circle(item.x + radius - 8, buttonY - radius + 8, 5, ARCANE_THEME.colors.danger).setVisible(false);
        this._dotTargets[item.dotKey] = dot;
      }
    });
  }

  _buildIdleHeroAnimations() {
    this._heroLayer.removeAll(true);
    this._heroSprites = [];

    const heroBaseX = W / 2;
    const heroBaseY = 470;
    const aura = this.add.circle(heroBaseX, heroBaseY, 44, 0x7d42d6, 0.2);
    const body = this.add.circle(heroBaseX, heroBaseY, 30, 0x301f4f, 1).setStrokeStyle(2, 0xe0b774, 0.9);
    const helm = this.add.text(heroBaseX, heroBaseY - 2, '⛨', { font: '20px serif', fill: '#f8dcb1' }).setOrigin(0.5);
    this._heroLayer.add([aura, body, helm]);

    for (let i = 0; i < 6; i++) {
      const orb = this.add.circle(
        heroBaseX + Phaser.Math.Between(-78, 78),
        heroBaseY - Phaser.Math.Between(30, 110),
        Phaser.Math.Between(2, 4),
        0xc28bff,
        0.7
      );
      this._heroLayer.add(orb);
      this._heroSprites.push(orb);
      this.tweens.add({
        targets: orb,
        y: orb.y - Phaser.Math.Between(18, 52),
        alpha: 0.15,
        duration: Phaser.Math.Between(1800, 2600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }

    this.tweens.add({ targets: body, scaleY: 1.03, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: helm, y: heroBaseY - 5, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: aura, scale: 1.08, alpha: 0.14, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  _makeIconButton({ x, y, label, scene }) {
    const { root } = createArcaneButton(this, {
      x,
      y,
      width: 36,
      height: 36,
      label,
      font: '16px serif',
      onClick: () => this.scene.start(scene)
    });
    return root;
  }

  _isCodexNotifiable() {
    const tasks = DailyCodexManager.getTasks();
    const hasCompletedTask = tasks.some(t => t.completed);
    const allDone = DailyCodexManager.isAllDailyComplete();
    const hasUnclaimedChest = allDone && !DailyCodexManager.dailyChestClaimed;
    const visitTask = tasks.find(t => t.taskId === 'VISIT_CODEX');
    const resetPing = !visitTask || visitTask.progress === 0;
    return hasCompletedTask || hasUnclaimedChest || resetPing;
  }

  _isSummonNotifiable() {
    return LoginStreakManager.canClaimToday();
  }

  _updateNotificationDots() {
    const candidates = [
      { key: 'codex', show: this._isCodexNotifiable(), dot: this._dotTargets.codex },
      { key: 'summon', show: this._isSummonNotifiable(), dot: this._dotTargets.summon },
      { key: 'events', show: LoginStreakManager.canClaimToday(), dot: this._dotTargets.events },
      { key: 'offers', show: CurrencyManager.get(CURRENCY.PREMIUM_CRYSTALS) < 100, dot: this._dotTargets.offers }
    ];

    const active = candidates.filter(c => c.show).slice(0, 4);
    const activeKeys = new Set(active.map(a => a.key));
    candidates.forEach(candidate => {
      if (candidate.dot) candidate.dot.setVisible(activeKeys.has(candidate.key));
    });
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
    this._currencyTexts[CURRENCY.AWAKENING_SHARDS]?.setText(this._compact(CurrencyManager.get(CURRENCY.AWAKENING_SHARDS)));

    if (this._resourceTexts.length >= 3) {
      this._resourceTexts[0].setText(this._compact(CurrencyManager.get(CURRENCY.GOLD)));
      this._resourceTexts[1].setText(this._compact(CurrencyManager.get(CURRENCY.PREMIUM_CRYSTALS)));
      this._resourceTexts[2].setText(this._compact(CurrencyManager.get(CURRENCY.CRYSTALS)));
    }

    this._levelText.setText(String(GameState.playerLevel || 1));
    this._usernameText.setText(GameState.playerName || 'Arcanist');
    this._powerText.setText(`Power ${this._compact(this._getTeamPower())}`);
    this._updateNotificationDots();
  }

  _getTeamPower() {
    if (typeof GameState.getTeamPower === 'function') {
      const statePower = GameState.getTeamPower();
      return Number.isFinite(statePower) ? statePower : 0;
    }

    const entries = GameState.getActiveSquadEntries?.() || [];
    if (!entries.length) return 0;

    return entries.reduce((total, entry) => {
      const hero = HeroManager.getHero(entry.heroId);
      if (!hero?.computeStats) return total;
      const stats = hero.computeStats();
      const heroPower = (stats.damage || 0) + (stats.defense || 0) + Math.floor((stats.hp || 0) / 10);
      return total + heroPower;
    }, 0);
  }

  _compact(value) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return `${Math.floor(value)}`;
  }

  _showToast(message) {
    const toast = this.add.text(W / 2, H - 128, message, {
      font: '14px monospace',
      fill: ARCANE_THEME.colors.textPrimary,
      backgroundColor: '#160f2acc',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: toast,
      y: toast.y - 14,
      alpha: 0,
      duration: 700,
      ease: 'Quad.Out',
      onComplete: () => toast.destroy()
    });
  }
}

import GameState from '../systems/GameState.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import IdleManager from '../systems/IdleManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import LoginStreakManager from '../systems/LoginStreakManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import { CURRENCY } from '../data/constants.js';
import { ARCANE_THEME, addArcaneBackdrop, createPanel, createArcaneButton } from '../ui/ArcaneUI.js';

const W = 480;
const H = 854;
const OUTER_PADDING = 16;

export default class MainHubScene extends Phaser.Scene {
  constructor() {
    super('MainHub');
    this._heroSprites = [];
    this._pendingIdleGold = 0;
    this._dotTargets = {};
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
    createPanel(this, { x: W / 2, y, width: W - (OUTER_PADDING * 2), height: topBarHeight, fill: 0x120c22, border: 0x89613f, withInner: false });

    this._avatarRing = this.add.circle(OUTER_PADDING + 28, y, 24, 0x2a1d45, 0.95).setStrokeStyle(2, 0xc69d63, 1);
    this._avatarOnline = this.add.circle(OUTER_PADDING + 44, y + 17, 4, 0x58ffb2, 0.95)
      .setStrokeStyle(1, 0xdffff0, 0.8);
    this.tweens.add({ targets: this._avatarOnline, alpha: 0.35, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.inOut' });
    this._levelBadge = this.add.circle(OUTER_PADDING + 14, y + 18, 9, 0x4a316b, 1).setStrokeStyle(1, 0xe5be7e, 0.9);
    this._levelText = this.add.text(OUTER_PADDING + 14, y + 18, '1', { font: '10px monospace', fill: ARCANE_THEME.colors.textPrimary }).setOrigin(0.5);

    this._usernameText = this.add.text(OUTER_PADDING + 58, y - 14, 'PlayerName', { font: '14px monospace', fill: ARCANE_THEME.colors.textPrimary });
    this._powerText = this.add.text(OUTER_PADDING + 58, y + 6, 'Combat 0', { font: '12px monospace', fill: ARCANE_THEME.colors.textSecondary });

    const currencyY = y;
    const currencyDefs = [
      { key: CURRENCY.GOLD, icon: '🪙', tint: '#ffd27b', short: 'gold' },
      { key: CURRENCY.PREMIUM_CRYSTALS, icon: '💎', tint: '#d3a2ff', short: 'gems' },
      { key: CURRENCY.CRYSTALS, icon: '🎟️', tint: '#bba8ff', short: 'tickets' },
      { key: CURRENCY.AWAKENING_SHARDS, icon: '⚡', tint: '#7ecfff', short: 'energy' }
    ];

    this._currencyTexts = {};
    let cx = 250;
    currencyDefs.forEach(def => {
      const holder = this.add.container(cx, currencyY);
      const chip = this.add.rectangle(0, 0, 50, 24, 0x1c1230, 0.95).setStrokeStyle(1, 0x8f6947, 0.9);
      const icon = this.add.text(-17, 0, def.icon, { font: '12px sans-serif', fill: def.tint }).setOrigin(0.5);
      const value = this.add.text(0, 0, '0', { font: '11px monospace', fill: ARCANE_THEME.colors.textPrimary }).setOrigin(0.5);
      const plus = this.add.rectangle(24, 0, 14, 14, 0x3a264f, 1).setStrokeStyle(1, 0xc79e67, 0.8)
        .setInteractive({ useHandCursor: true });
      const plusText = this.add.text(24, 0, '+', { font: '10px monospace', fill: '#ffe4b8' }).setOrigin(0.5);
      plus.on('pointerup', () => this._showToast(`${def.short} sources`));
      holder.add([chip, icon, value, plus, plusText]);
      this._currencyTexts[def.key] = value;
      cx += 52;
    });

    this._makeIconButton({ x: W - OUTER_PADDING - 20, y, label: '⚙', scene: 'Settings' });
  }

  _drawCenterScene() {
    const centerY = 420;
    this.add.ellipse(W / 2, centerY, W + 120, H - 260, 0x0f0b1d, 0.85);
    this.add.ellipse(W / 2, centerY - 120, W + 140, 320, 0x25143c, 0.24);
    this.add.ellipse(W / 2, centerY + 20, W + 70, 250, 0x4d2b66, 0.2);

    const clouds = this.add.ellipse(W / 2, 250, 420, 110, 0x8d63cf, 0.11);
    this.tweens.add({ targets: clouds, x: W / 2 + 8, yoyo: true, duration: 5000, repeat: -1, ease: 'Sine.inOut' });

    this._drawBuilding({ x: 88, y: 438, label: 'Campaign Gate', scene: 'Campaign', color: 0x64315c });
    this._drawBuilding({ x: 188, y: 356, label: 'Summon Portal', scene: 'Summon', color: 0x6a3e9d, pulse: true, dotKey: 'summon' });
    this._drawBuilding({ x: 298, y: 350, label: 'Academy Tower', scene: 'AffinityTowerSelection', color: 0x3f326b });
    this._drawBuilding({ x: 392, y: 435, label: 'Guild Hall', scene: 'Guild', color: 0x523245 });

    this._heroLayer = this.add.container(0, 0);
    this._buildIdleHeroAnimations();
  }

  _drawBuilding({ x, y, label, scene, color, pulse = false, dotKey = null }) {
    const pad = this.add.container(x, y);
    const glow = this.add.circle(0, 0, 36, color, 0.3);
    const body = this.add.circle(0, 0, 24, color, 0.9).setStrokeStyle(2, 0xc79d62, 0.9);
    const title = this.add.text(0, 35, label, { font: '11px monospace', fill: ARCANE_THEME.colors.textPrimary, align: 'center' }).setOrigin(0.5);
    pad.add([glow, body, title]);

    if (pulse) {
      this.tweens.add({ targets: glow, scaleX: 1.22, scaleY: 1.22, alpha: 0.12, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    body.setInteractive({ useHandCursor: true });
    body.on('pointerup', () => this.scene.start(scene));

    const dot = this.add.circle(x + 20, y - 20, 5, ARCANE_THEME.colors.danger).setVisible(false);
    if (dotKey) this._dotTargets[dotKey] = dot;
  }

  _drawSideButtons() {
    const leftButtons = [
      { label: '👥', toast: 'Friends' },
      { label: '⚔️', scene: 'Arena' },
      { label: '🏆', scene: 'EndlessTower' },
      { label: '💬', toast: 'Chat' }
    ];

    const rightButtons = [
      { label: '📜', scene: 'DailyCodex', dotKey: 'codex' },
      { label: '✉️', toast: 'Mail' },
      { label: '🎉', scene: 'Achievement', large: true, dotKey: 'events' },
      { label: '🎫', toast: 'Battle Pass' },
      { label: '🛍️', scene: 'GuildShop', dotKey: 'offers' }
    ];

    leftButtons.forEach((item, idx) => {
      this._makeSideButton({ x: OUTER_PADDING + 22, y: 322 + (idx * 56), ...item });
    });

    rightButtons.forEach((item, idx) => {
      this._makeSideButton({ x: W - OUTER_PADDING - 22, y: 296 + (idx * 56), ...item });
    });
  }

  _makeSideButton({ x, y, label, scene, toast, large = false, dotKey = null }) {
    const size = large ? 52 : 42;
    const circle = this.add.circle(x, y, size / 2, 0x201335, 0.92).setStrokeStyle(2, 0xba915a, 0.95);
    const icon = this.add.text(x, y, label, { font: `${large ? 20 : 16}px sans-serif` }).setOrigin(0.5);
    const hit = this.add.zone(x, y, size, size).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: [circle, icon], duration: 220, paused: true });
    hit.on('pointerdown', () => this.tweens.add({ targets: [circle, icon], scale: 1.03, duration: 110, yoyo: true }));
    hit.on('pointerup', () => {
      if (scene) this.scene.start(scene);
      else this._showToast(toast || 'Soon');
    });

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
      { label: 'Adventure', icon: '🗺️', scene: 'Campaign', x: 62 },
      { label: 'Heroes', icon: '🛡️', scene: 'Roster', x: 142 },
      { label: 'Academy', icon: '🏰', scene: 'AffinityTowerSelection', x: 222 },
      { label: 'Summon', icon: '🔮', scene: 'Summon', x: 302, center: true, dotKey: 'summon' },
      { label: 'Guild', icon: '🛡️', scene: 'Guild', x: 382 }
    ];

    items.forEach(item => {
      const buttonY = item.center ? y - 28 : y + 2;
      const radius = item.center ? 34 : 25;
      const ring = this.add.circle(item.x, buttonY, radius, item.center ? 0x3c2168 : 0x241639, 0.98)
        .setStrokeStyle(2, item.center ? 0xd2ab6d : 0xa37d4a, 1);
      const icon = this.add.text(item.x, buttonY - 7, item.icon, { font: `${item.center ? 20 : 16}px sans-serif` }).setOrigin(0.5);
      const text = this.add.text(item.x, buttonY + (item.center ? 18 : 16), item.label, {
        font: `${item.center ? 11 : 10}px monospace`,
        fill: ARCANE_THEME.colors.textPrimary
      }).setOrigin(0.5);

      const hit = this.add.zone(item.x, buttonY, radius * 2, radius * 2).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.tweens.add({ targets: [ring, icon], scale: 1.03, duration: 110, yoyo: true }));
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
    const body = this.add.circle(heroBaseX, heroBaseY, 30, 0x301f4f, 1).setStrokeStyle(2, 0xe0b774, 0.9);
    const aura = this.add.circle(heroBaseX, heroBaseY, 44, 0x7d42d6, 0.2);
    this._heroLayer.add([aura, body]);

    for (let i = 0; i < 4; i++) {
      const orb = this.add.circle(heroBaseX + Phaser.Math.Between(-60, 60), heroBaseY - Phaser.Math.Between(40, 90), 4, 0xc28bff, 0.7);
      this._heroLayer.add(orb);
      this._heroSprites.push(orb);
      this.tweens.add({
        targets: orb,
        y: orb.y - Phaser.Math.Between(18, 42),
        alpha: 0.15,
        duration: Phaser.Math.Between(1800, 2600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }

    this.tweens.add({ targets: body, scaleY: 1.03, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: aura, scale: 1.08, alpha: 0.14, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  _makeIconButton({ x, y, label, scene }) {
    const { root } = createArcaneButton(this, {
      x,
      y,
      width: 36,
      height: 36,
      label,
      font: '16px sans-serif',
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

    this._levelText.setText(String(GameState.playerLevel || 1));
    this._usernameText.setText(GameState.playerName || 'Arcanist');
    this._powerText.setText(`Combat ${this._compact(GameState.getTeamPower())}`);
    this._updateNotificationDots();
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

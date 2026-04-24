import GameState from '../systems/GameState.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import IdleManager from '../systems/IdleManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import LoginStreakManager from '../systems/LoginStreakManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import { CURRENCY } from '../data/constants.js';

const W = 480;
const H = 854;
const BTN_COLOR = 0x1a1a3a;
const BTN_COLOR_DOWN = 0x0d0d1f;

export default class MainHubScene extends Phaser.Scene {
  constructor() {
    super('MainHub');
    this._heroSprites = [];
    this._pendingIdleGold = 0;
    this._lastCollectAt = 0;
    this._collectCooldownMs = 15000;
    this._moreExpanded = false;
    this._dotTargets = {};
  }

  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x080818);
    this._drawHeader();
    this._drawIdleScene();
    this._drawCurrencyBar();
    this._drawPrimaryActions();
    this._drawGridNav();
    this._drawMoreMenu();

    this.time.addEvent({ delay: 500, loop: true, callback: this._refreshUI, callbackScope: this });
    this.time.addEvent({ delay: 1000, loop: true, callback: this._idleTick, callbackScope: this });
    this.time.addEvent({ delay: 30000, loop: true, callback: () => GameState.save() });
    this._refreshUI();

    if (LoginStreakManager.canClaimToday()) {
      this.time.delayedCall(120, () => this.scene.start('LoginStreak', { returnScene: 'MainHub' }));
    }

    AchievementManager.showPopups(this);
  }

  _drawHeader() {
    this.add.rectangle(W / 2, 34, W - 14, 52, 0x121230).setStrokeStyle(1, 0x2e2e5a);
    this._makeIconButton({ x: 34, y: 34, label: '⚙', scene: 'Settings' });
    this._makeIconButton({ x: W - 34, y: 34, label: '👤', scene: 'Roster' });
    this.add.text(W / 2, 34, 'ARCANE ACADEMY', {
      font: '20px monospace', fill: '#ffd66a'
    }).setOrigin(0.5);
  }

  _drawIdleScene() {
    this._artRect = this.add.rectangle(W / 2, 216, W - 24, 290, 0x10182a)
      .setStrokeStyle(2, 0x2b4a6e);
    this.add.text(W / 2, 95, 'ACADEMY COURTYARD', {
      font: '14px monospace', fill: '#9ed7ff'
    }).setOrigin(0.5);
    this.add.ellipse(W / 2, 216, 360, 180, 0x26425d, 0.55).setStrokeStyle(1, 0x4f83b8, 0.6);
    this._heroLayer = this.add.container(0, 0);
    this._buildIdleHeroAnimations();
  }

  _drawCurrencyBar() {
    const y = 378;
    this.add.rectangle(W / 2, y, W - 24, 88, 0x141428).setStrokeStyle(1, 0x36365a);
    this._marksText = this.add.text(24, y - 27, '💛 Marks: 0', { font: '16px monospace', fill: '#ffe08a' });
    this._lumensText = this.add.text(250, y - 27, '✨ Lumens: 0', { font: '16px monospace', fill: '#dcb6ff' });
    this._etherText = this.add.text(24, y + 4, '🔵 Ether: 0', { font: '16px monospace', fill: '#8ed8ff' });
    this._resonanceText = this.add.text(250, y + 4, '🌀 Resonance: 0', { font: '16px monospace', fill: '#d1c9ff' });
  }

  _drawPrimaryActions() {
    const y = 445;
    this._collectBtn = this._makeNavButton({
      x: 126,
      y,
      width: 214,
      height: 50,
      label: 'COLLECT IDLE GOLD',
      onClick: () => this._collectIdleGold()
    });

    this._campaignBtn = this._makeNavButton({
      x: 354,
      y,
      width: 214,
      height: 50,
      label: 'CAMPAIGN',
      onClick: () => this.scene.start('Campaign')
    });
  }

  _drawGridNav() {
    const rows = [
      [
        { label: 'SUMMON', scene: 'Summon', dotKey: 'summon' },
        { label: 'ROSTER', scene: 'Roster' },
        { label: 'FORGE', scene: 'GearForge' }
      ],
      [
        { label: 'TOWER', scene: 'EndlessTower' },
        { label: 'ARENA', scene: 'Arena' },
        { label: 'GUILD BOSS', scene: 'WorldBoss' }
      ],
      [
        { label: 'CODEX', scene: 'DailyCodex', dotKey: 'codex' },
        { label: 'ELDER TREE', scene: 'ElderTree' },
        { label: 'MORE▼', action: () => this._toggleMoreMenu() }
      ]
    ];

    rows.forEach((row, rowIndex) => {
      row.forEach((item, colIndex) => {
        const x = 82 + (colIndex * 158);
        const y = 520 + (rowIndex * 66);
        const button = this._makeNavButton({
          x,
          y,
          width: 146,
          height: 50,
          label: item.label,
          scene: item.scene,
          onClick: item.action
        });
        if (item.dotKey && button?.dot) this._dotTargets[item.dotKey] = button.dot;
      });
    });
  }

  _drawMoreMenu() {
    const x = W / 2;
    const y = 760;
    this._morePanel = this.add.container(0, 0).setVisible(false);
    const bg = this.add.rectangle(x, y, W - 40, 160, 0x111125, 0.98).setStrokeStyle(1, 0x505088);
    this._morePanel.add(bg);

    const items = [
      { label: 'Achievements', scene: 'Achievement' },
      { label: 'Guild', scene: 'Guild' },
      { label: 'Affinity Towers', scene: 'AffinityTowerSelection' },
      { label: 'Awakening Altar', scene: 'AwakenAltar' },
      { label: 'Login Streak', scene: 'LoginStreak', data: { returnScene: 'MainHub' } },
      { label: 'Settings', scene: 'Settings' }
    ];

    items.forEach((item, idx) => {
      const tx = 66 + ((idx % 2) * 190);
      const ty = 704 + (Math.floor(idx / 2) * 44);
      const text = this.add.text(tx, ty, `• ${item.label}`, {
        font: '16px monospace', fill: '#d9e0ff'
      }).setInteractive({ useHandCursor: true });
      text.on('pointerup', () => this.scene.start(item.scene, item.data));
      this._morePanel.add(text);
    });
  }

  _buildIdleHeroAnimations() {
    this._heroLayer.removeAll(true);
    this._heroSprites = [];
    const squad = GameState.getActiveSquadEntries();
    const count = Math.max(1, squad.length);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const x = W / 2 + Math.cos(angle) * 120;
      const y = 216 + Math.sin(angle) * 64;
      const color = squad[i] ? 0x8ed8ff : 0x4d5a7a;
      const hero = this.add.circle(x, y, squad[i] ? 8 : 6, color, squad[i] ? 1 : 0.5)
        .setStrokeStyle(1, 0xffffff, 0.6);
      this._heroLayer.add(hero);
      this._heroSprites.push(hero);

      this.tweens.add({
        targets: hero,
        x: x + Phaser.Math.Between(-18, 18),
        y: y + Phaser.Math.Between(-12, 12),
        duration: Phaser.Math.Between(1200, 2600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }
  }

  _makeIconButton({ x, y, label, scene }) {
    const bg = this.add.circle(x, y, 16, 0x1a1a3a).setStrokeStyle(1, 0x4f4f92);
    this.add.text(x, y, label, { font: '16px sans-serif', fill: '#ffffff' }).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => bg.setFillStyle(BTN_COLOR_DOWN))
      .on('pointerup', () => {
        bg.setFillStyle(BTN_COLOR);
        this.scene.start(scene);
      })
      .on('pointerout', () => bg.setFillStyle(BTN_COLOR));
  }

  _makeNavButton({ x, y, width, height, label, scene, onClick }) {
    const unlockByScene = {
      Summon: 'BASIC_SUMMON',
      Arena: 'ARENA',
      AffinityTowerSelection: 'AFFINITY_TOWERS',
      Guild: 'GUILD'
    };

    const unlockKey = scene ? unlockByScene[scene] : null;
    const sceneExists = !scene || this.scene.manager.getScene(scene) !== null;
    const isUnlocked = !unlockKey || GameState.isUnlocked(unlockKey);
    const active = sceneExists && isUnlocked;

    const bg = this.add.rectangle(x, y, width, height, BTN_COLOR)
      .setStrokeStyle(1, active ? 0x3f4f81 : 0x2f2f2f)
      .setAlpha(active ? 1 : 0.45);
    this.add.text(x, y, label, {
      font: `${label.length > 11 ? 14 : 16}px monospace`,
      fill: '#ffffff'
    }).setOrigin(0.5).setAlpha(active ? 1 : 0.55);

    const dot = this.add.circle(x + (width / 2) - 12, y - (height / 2) + 10, 5, 0xff3040).setVisible(false);

    if (!active) return { bg, dot };
    bg.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => bg.setFillStyle(BTN_COLOR_DOWN))
      .on('pointerup', () => {
        bg.setFillStyle(BTN_COLOR);
        if (onClick) onClick();
        else if (scene) this.scene.start(scene);
      })
      .on('pointerout', () => bg.setFillStyle(BTN_COLOR));

    return { bg, dot };
  }

  _toggleMoreMenu() {
    this._moreExpanded = !this._moreExpanded;
    this._morePanel.setVisible(this._moreExpanded);
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

  _isCollectNotifiable() {
    return this._pendingIdleGold >= 10 && (Date.now() - this._lastCollectAt) >= this._collectCooldownMs;
  }

  _updateNotificationDots() {
    const candidates = [
      { key: 'collect', show: this._isCollectNotifiable(), dot: this._collectBtn?.dot },
      { key: 'codex', show: this._isCodexNotifiable(), dot: this._dotTargets.codex },
      { key: 'summon', show: this._isSummonNotifiable(), dot: this._dotTargets.summon }
    ];

    const active = candidates.filter(c => c.show).slice(0, 3);
    const activeKeys = new Set(active.map(a => a.key));
    candidates.forEach(candidate => {
      if (candidate.dot) candidate.dot.setVisible(activeKeys.has(candidate.key));
    });
  }

  _collectIdleGold() {
    if (!this._isCollectNotifiable()) return;
    const payout = Math.max(10, Math.floor(this._pendingIdleGold));
    CurrencyManager.add(CURRENCY.GOLD, payout);
    DailyCodexManager.increment('COLLECT_IDLE');
    this._pendingIdleGold = 0;
    this._lastCollectAt = Date.now();
    this._refreshUI();
  }

  _idleTick() {
    IdleManager.tick(1000, GameState.campaignProgress, GameState.activeSquad);
    const rate = IdleManager.getRate(GameState.campaignProgress);
    this._pendingIdleGold = Math.min(this._pendingIdleGold + rate, rate * 120);
  }

  _refreshUI() {
    this._marksText.setText(`💛 Marks: ${CurrencyManager.get(CURRENCY.GOLD).toLocaleString()}`);
    this._lumensText.setText(`✨ Lumens: ${CurrencyManager.get(CURRENCY.PREMIUM_CRYSTALS).toLocaleString()}`);
    this._etherText.setText(`🔵 Ether: ${CurrencyManager.get(CURRENCY.CRYSTALS).toLocaleString()}`);
    this._resonanceText.setText(`🌀 Resonance: ${CurrencyManager.get(CURRENCY.AWAKENING_SHARDS).toLocaleString()}`);
    this._updateNotificationDots();
  }
}

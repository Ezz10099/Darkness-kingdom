import GameState from '../systems/GameState.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import { CURRENCY } from '../data/constants.js';
import createVerticalScroll from '../ui/ScrollPane.js';

const W = 480;
const H = 854;
const HEADER_H = 92;

export default class DailyCodexScene extends Phaser.Scene {
  constructor() { super('DailyCodex'); }

  create() {
    this._root = this.add.container(0, 0);
    this._scroll = null;
    DailyCodexManager.increment('VISIT_CODEX');
    GameState.save();
    this._build();
  }

  _msToHM(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h + 'h ' + m + 'm';
  }

  _reset() {
    if (this._scroll) { this._scroll.destroy(); this._scroll = null; }
    this._root.removeAll(true);
  }

  _build() {
    this._reset();
    const c = this._root;
    const tasks = DailyCodexManager.getTasks();
    const weekly = DailyCodexManager.getWeeklyTask();
    const allDone = DailyCodexManager.isAllDailyComplete();
    const chestClaimed = DailyCodexManager.dailyChestClaimed;
    const weeklyDone = weekly?.completed || false;
    const weekClaimed = DailyCodexManager.weeklyChestClaimed;

    c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a));
    c.add(this.add.rectangle(W / 2, HEADER_H / 2, W, HEADER_H, 0x0d0d22).setStrokeStyle(1, 0x333366));
    c.add(this.add.text(W / 2, 32, 'DAILY CODEX', { font: '24px monospace', fill: '#ffdd88' }).setOrigin(0.5));
    c.add(this.add.text(24, 32, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('MainHub')));
    c.add(this.add.text(W / 2, 64, 'Resets in ' + this._msToHM(DailyCodexManager.msUntilDailyReset()),
      { font: '11px monospace', fill: '#777799' }).setOrigin(0.5));

    const list = this.add.container(0, 0);
    c.add(list);
    let y = 18;
    list.add(this.add.text(W / 2, y, 'DAILY TASKS', { font: '13px monospace', fill: '#ffdd88' }).setOrigin(0.5));
    y += 48;
    tasks.forEach(task => {
      this._drawTaskRow(task, y, list);
      y += 82;
    });

    this._drawChestButton(allDone, chestClaimed, y + 8, list);
    y += 86;

    list.add(this.add.rectangle(W / 2, y, W - 30, 1, 0x333355));
    list.add(this.add.text(W / 2, y + 24, 'WEEKLY MISSION', { font: '13px monospace', fill: '#cc88ff' }).setOrigin(0.5));
    y += 68;
    if (weekly) {
      this._drawTaskRow(weekly, y, list);
      y += 82;
      this._drawWeeklyButton(weeklyDone, weekClaimed, y + 8, list);
      y += 86;
    }

    this._scroll = createVerticalScroll(this, list, {
      x: 0,
      y: HEADER_H,
      width: W,
      height: H - HEADER_H,
      contentHeight: y + 40
    });
  }

  _drawTaskRow(task, rowY, c) {
    const done = task.completed;
    const bgColor = done ? 0x0a1a0a : 0x0d0d22;
    const border = done ? 0x44aa44 : 0x2a2a4a;
    const barPct = task.target > 0 ? Math.min(1, task.progress / task.target) : 0;
    const barW = 340;

    const rowBg = this.add.rectangle(W / 2, rowY, W - 30, 68, bgColor)
      .setStrokeStyle(1, border)
      .setInteractive({ useHandCursor: true });
    c.add(rowBg);
    c.add(this.add.text(42, rowY - 10, done ? '✓' : '□', {
      font: done ? '22px monospace' : '16px monospace', fill: done ? '#44cc44' : '#444466'
    }).setOrigin(0.5));
    c.add(this.add.text(62, rowY - 12, task.label, {
      font: '13px monospace', fill: done ? '#66cc66' : '#cccccc', wordWrap: { width: 310 }
    }).setOrigin(0, 0.5));
    c.add(this.add.text(W - 28, rowY - 12, task.progress + '/' + task.target, {
      font: '12px monospace', fill: done ? '#44cc44' : '#888888'
    }).setOrigin(1, 0.5));
    const barStartX = 62;
    c.add(this.add.rectangle(barStartX + barW / 2, rowY + 18, barW, 6, 0x1a1a2e));
    if (barPct > 0) c.add(this.add.rectangle(barStartX, rowY + 18, barW * barPct, 6, done ? 0x44aa44 : 0x4466cc).setOrigin(0, 0.5));

    if (task.scene && task.scene !== 'DailyCodex') {
      c.add(this.add.text(W - 26, rowY + 18, '>', { font: '11px monospace', fill: '#555577' }).setOrigin(0.5));
      rowBg.on('pointerup', (pointer) => {
        if (!this._scroll?.isTap(pointer)) return;
        this.scene.start(task.scene);
      });
    }
  }

  _drawChestButton(allDone, claimed, y, c) {
    const canClaim = allDone && !claimed;
    const color = canClaim ? 0x1a2a00 : 0x0d0d1a;
    const border = canClaim ? 0x88cc44 : (claimed ? 0x446644 : 0x333333);
    const label = claimed ? '✓ Codex Chest Claimed'
      : canClaim ? '★ CLAIM CODEX CHEST'
        : 'Complete all tasks to claim chest';
    const fill = canClaim ? '#99ff44' : (claimed ? '#446644' : '#555555');
    const btn = this.add.rectangle(W / 2, y, W - 40, 56, color).setStrokeStyle(2, border);
    c.add(btn);
    if (canClaim) {
      const reward = DailyCodexManager.getDailyChestReward();
      c.add(this.add.text(W / 2, y - 11, label, { font: '15px monospace', fill }).setOrigin(0.5));
      c.add(this.add.text(W / 2, y + 13, `+${reward.gold} Gold  +${reward.crystals} Crystals  +${reward.shards} Shards`,
        { font: '11px monospace', fill: '#aaffaa' }).setOrigin(0.5));
      btn.setInteractive({ useHandCursor: true }).on('pointerup', (pointer) => {
        if (!this._scroll?.isTap(pointer)) return;
        this._claimDailyChest();
      });
    } else {
      c.add(this.add.text(W / 2, y, label, { font: claimed ? '14px monospace' : '12px monospace', fill }).setOrigin(0.5));
    }
  }

  _drawWeeklyButton(done, claimed, y, c) {
    const canClaim = done && !claimed;
    const color = canClaim ? 0x1a0030 : 0x0d0d1a;
    const border = canClaim ? 0xcc44ff : (claimed ? 0x664488 : 0x333333);
    const label = claimed ? '✓ Weekly Reward Claimed'
      : canClaim ? '✨ CLAIM WEEKLY REWARD'
        : 'Complete weekly mission to claim';
    const fill = canClaim ? '#cc88ff' : (claimed ? '#664488' : '#555555');
    const btn = this.add.rectangle(W / 2, y, W - 40, 56, color).setStrokeStyle(2, border);
    c.add(btn);
    if (canClaim) {
      const reward = DailyCodexManager.getWeeklyChestReward();
      c.add(this.add.text(W / 2, y - 10, label, { font: '15px monospace', fill }).setOrigin(0.5));
      c.add(this.add.text(W / 2, y + 13, `+${reward.premiumCrystals} Premium Crystals`,
        { font: '12px monospace', fill: '#ddaaff' }).setOrigin(0.5));
      btn.setInteractive({ useHandCursor: true }).on('pointerup', (pointer) => {
        if (!this._scroll?.isTap(pointer)) return;
        this._claimWeeklyChest();
      });
    } else {
      c.add(this.add.text(W / 2, y, label, { font: claimed ? '14px monospace' : '12px monospace', fill }).setOrigin(0.5));
    }
  }

  _claimDailyChest() {
    const reward = DailyCodexManager.claimDailyChest();
    if (!reward) return;
    CurrencyManager.add(CURRENCY.GOLD, reward.gold);
    CurrencyManager.add(CURRENCY.CRYSTALS, reward.crystals);
    CurrencyManager.add(CURRENCY.AWAKENING_SHARDS, reward.shards);
    GameState.save();
    this._showRewardPopup('CODEX CHEST', `+${reward.gold} Gold\n+${reward.crystals} Crystals\n+${reward.shards} Awakening Shards`, '#99ff44');
  }

  _claimWeeklyChest() {
    const reward = DailyCodexManager.claimWeeklyChest();
    if (!reward) return;
    CurrencyManager.add(CURRENCY.PREMIUM_CRYSTALS, reward.premiumCrystals);
    GameState.save();
    this._showRewardPopup('WEEKLY REWARD', `+${reward.premiumCrystals} Premium Crystals`, '#cc88ff');
  }

  _showRewardPopup(title, body, color) {
    const overlay = this.add.container(0, 0).setDepth(10);
    overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setAlpha(0.76));
    overlay.add(this.add.rectangle(W / 2, 400, W - 60, 260, 0x0d0d22).setStrokeStyle(2, 0xffdd88));
    overlay.add(this.add.text(W / 2, 300, title, { font: '22px monospace', fill: '#ffdd88' }).setOrigin(0.5));
    overlay.add(this.add.text(W / 2, 395, body, { font: '18px monospace', fill: color, align: 'center' }).setOrigin(0.5));
    const btn = this.add.rectangle(W / 2, 498, 220, 54, 0x200040)
      .setStrokeStyle(2, 0xffdd88).setInteractive({ useHandCursor: true })
      .on('pointerup', () => { overlay.destroy(); this._build(); });
    overlay.add(btn);
    overlay.add(this.add.text(W / 2, 498, 'CONTINUE', { font: '18px monospace', fill: '#ffdd88' }).setOrigin(0.5));
  }
}

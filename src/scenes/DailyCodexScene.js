import GameState from '../systems/GameState.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import { CURRENCY } from '../data/constants.js';

export default class DailyCodexScene extends Phaser.Scene {
  constructor() { super('DailyCodex'); }

  create() {
    this._W = 480;
    this._root = this.add.container(0, 0);
    // Mark the visit task complete as soon as the codex is opened
    DailyCodexManager.increment('VISIT_CODEX');
    GameState.save();
    this._build();
  }

  // ─── UTILITIES ───────────────────────────────────────────────────────────────

  _msToHM(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h + 'h ' + m + 'm';
  }

  _reset() {
    this._root.removeAll(true);
  }

  // ─── MAIN BUILD ──────────────────────────────────────────────────────────────

  _build() {
    this._reset();
    const c = this._root, W = this._W;
    const tasks       = DailyCodexManager.getTasks();
    const weekly      = DailyCodexManager.getWeeklyTask();
    const allDone     = DailyCodexManager.isAllDailyComplete();
    const chestClaimed = DailyCodexManager.dailyChestClaimed;
    const weeklyDone  = weekly?.completed || false;
    const weekClaimed = DailyCodexManager.weeklyChestClaimed;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));

    // Header
    c.add(this.add.text(W / 2, 36, 'DAILY CODEX', {
      font: '24px monospace', fill: '#ffdd88'
    }).setOrigin(0.5));
    c.add(this.add.text(30, 36, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub')));

    const resetMs = DailyCodexManager.msUntilDailyReset();
    c.add(this.add.text(W / 2, 62, 'Resets in ' + this._msToHM(resetMs), {
      font: '11px monospace', fill: '#666666'
    }).setOrigin(0.5));

    // ── DAILY TASKS ──
    c.add(this.add.text(W / 2, 88, 'DAILY TASKS', {
      font: '13px monospace', fill: '#ffdd88'
    }).setOrigin(0.5));

    const rowSpacing = 80;
    tasks.forEach((task, i) => {
      const rowY = 118 + i * rowSpacing;
      this._drawTaskRow(task, rowY, c, W);
    });

    // ── CLAIM CODEX CHEST ──
    const chestY = 118 + tasks.length * rowSpacing + 14;
    this._drawChestButton(allDone, chestClaimed, chestY, c, W);

    // ── WEEKLY SECTION ──
    const divY = chestY + 64;
    c.add(this.add.rectangle(W / 2, divY, W - 30, 1, 0x333355));
    c.add(this.add.text(W / 2, divY + 18, 'WEEKLY MISSION', {
      font: '13px monospace', fill: '#cc88ff'
    }).setOrigin(0.5));

    if (weekly) {
      const weekRowY = divY + 60;
      this._drawTaskRow(weekly, weekRowY, c, W);
      const weekBtnY = weekRowY + 70;
      this._drawWeeklyButton(weeklyDone, weekClaimed, weekBtnY, c, W);
    }
  }

  // ─── TASK ROW ────────────────────────────────────────────────────────────────

  _drawTaskRow(task, rowY, c, W) {
    const done    = task.completed;
    const bgColor = done ? 0x0a1a0a : 0x0d0d22;
    const border  = done ? 0x44aa44 : 0x2a2a4a;
    const barPct  = task.target > 0 ? Math.min(1, task.progress / task.target) : 0;
    const barW    = 340;

    // Row background
    const rowBg = this.add.rectangle(W / 2, rowY, W - 30, 68, bgColor)
      .setStrokeStyle(1, border)
      .setInteractive({ useHandCursor: true });
    c.add(rowBg);

    // Checkmark or progress fraction
    if (done) {
      c.add(this.add.text(42, rowY - 10, '\u2713', {
        font: '22px monospace', fill: '#44cc44'
      }).setOrigin(0.5));
    } else {
      c.add(this.add.text(42, rowY - 10, '\u25a1', {
        font: '16px monospace', fill: '#444466'
      }).setOrigin(0.5));
    }

    // Task label
    c.add(this.add.text(62, rowY - 12, task.label, {
      font: '13px monospace', fill: done ? '#66cc66' : '#cccccc',
      wordWrap: { width: 310 }
    }).setOrigin(0, 0.5));

    // Progress fraction
    c.add(this.add.text(W - 28, rowY - 12, task.progress + '/' + task.target, {
      font: '12px monospace', fill: done ? '#44cc44' : '#888888'
    }).setOrigin(1, 0.5));

    // Progress bar track
    const barStartX = 62;
    c.add(this.add.rectangle(barStartX + barW / 2, rowY + 18, barW, 6, 0x1a1a2e));
    if (barPct > 0) {
      const fillColor = done ? 0x44aa44 : 0x4466cc;
      c.add(this.add.rectangle(barStartX, rowY + 18, barW * barPct, 6, fillColor).setOrigin(0, 0.5));
    }

    // Navigate icon + click handler (skip for 'DailyCodex' self-navigation)
    if (task.scene && task.scene !== 'DailyCodex') {
      c.add(this.add.text(W - 26, rowY + 18, '>', {
        font: '11px monospace', fill: '#555577'
      }).setOrigin(0.5));

      rowBg.on('pointerdown', () => rowBg.setFillStyle(0x050510))
           .on('pointerout',  () => rowBg.setFillStyle(bgColor))
           .on('pointerup',   () => this.scene.start(task.scene));
    }
  }

  // ─── DAILY CHEST BUTTON ──────────────────────────────────────────────────────

  _drawChestButton(allDone, claimed, y, c, W) {
    const canClaim = allDone && !claimed;
    const color    = canClaim ? 0x1a2a00 : 0x0d0d1a;
    const border   = canClaim ? 0x88cc44 : (claimed ? 0x446644 : 0x333333);
    const label    = claimed  ? '\u2713 Codex Chest Claimed'
                   : canClaim ? '\u2605 CLAIM CODEX CHEST'
                   : 'Complete all tasks to claim chest';
    const fill     = canClaim ? '#99ff44' : (claimed ? '#446644' : '#444444');

    const btn = this.add.rectangle(W / 2, y, W - 40, 52, color)
      .setStrokeStyle(2, border);
    c.add(btn);

    if (canClaim) {
      const reward = DailyCodexManager.getDailyChestReward();
      c.add(this.add.text(W / 2, y - 10, label, {
        font: '15px monospace', fill
      }).setOrigin(0.5));
      c.add(this.add.text(W / 2, y + 12,
        '+' + reward.gold + ' Gold  +' + reward.crystals + ' Crystals  +' + reward.shards + ' Shards',
        { font: '11px monospace', fill: '#aaffaa' }
      ).setOrigin(0.5));

      btn.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => btn.setFillStyle(0x0a1500))
        .on('pointerout',  () => btn.setFillStyle(color))
        .on('pointerup',   () => this._claimDailyChest());
    } else {
      c.add(this.add.text(W / 2, y, label, {
        font: claimed ? '14px monospace' : '12px monospace', fill
      }).setOrigin(0.5));
    }
  }

  // ─── WEEKLY BUTTON ───────────────────────────────────────────────────────────

  _drawWeeklyButton(done, claimed, y, c, W) {
    const canClaim = done && !claimed;
    const color    = canClaim ? 0x1a0030 : 0x0d0d1a;
    const border   = canClaim ? 0xcc44ff : (claimed ? 0x664488 : 0x333333);
    const label    = claimed  ? '\u2713 Weekly Reward Claimed'
                   : canClaim ? '\u2728 CLAIM WEEKLY REWARD'
                   : 'Complete weekly mission to claim';
    const fill     = canClaim ? '#cc88ff' : (claimed ? '#664488' : '#444444');

    const btn = this.add.rectangle(W / 2, y, W - 40, 52, color)
      .setStrokeStyle(2, border);
    c.add(btn);

    if (canClaim) {
      const reward = DailyCodexManager.getWeeklyChestReward();
      c.add(this.add.text(W / 2, y - 10, label, {
        font: '15px monospace', fill
      }).setOrigin(0.5));
      c.add(this.add.text(W / 2, y + 12,
        '+' + reward.premiumCrystals + ' Premium Crystals',
        { font: '12px monospace', fill: '#ddaaff' }
      ).setOrigin(0.5));

      btn.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => btn.setFillStyle(0x0d0020))
        .on('pointerout',  () => btn.setFillStyle(color))
        .on('pointerup',   () => this._claimWeeklyChest());
    } else {
      c.add(this.add.text(W / 2, y, label, {
        font: claimed ? '14px monospace' : '12px monospace', fill
      }).setOrigin(0.5));
    }
  }

  // ─── CLAIM HANDLERS ──────────────────────────────────────────────────────────

  _claimDailyChest() {
    const reward = DailyCodexManager.claimDailyChest();
    if (!reward) return;
    CurrencyManager.add(CURRENCY.GOLD,             reward.gold);
    CurrencyManager.add(CURRENCY.CRYSTALS,         reward.crystals);
    CurrencyManager.add(CURRENCY.AWAKENING_SHARDS, reward.shards);
    GameState.save();
    this._showRewardPopup(
      'CODEX CHEST',
      '+' + reward.gold + ' Gold\n+' + reward.crystals + ' Crystals\n+' + reward.shards + ' Awakening Shards',
      '#99ff44'
    );
  }

  _claimWeeklyChest() {
    const reward = DailyCodexManager.claimWeeklyChest();
    if (!reward) return;
    CurrencyManager.add(CURRENCY.PREMIUM_CRYSTALS, reward.premiumCrystals);
    GameState.save();
    this._showRewardPopup(
      'WEEKLY REWARD',
      '+' + reward.premiumCrystals + ' Premium Crystals',
      '#cc88ff'
    );
  }

  // ─── POPUP ───────────────────────────────────────────────────────────────────

  _showRewardPopup(title, body, color) {
    const W = this._W;
    const overlay = this.add.container(0, 0).setDepth(10);

    overlay.add(this.add.rectangle(W / 2, 427, W, 854, 0x000000).setAlpha(0.76));
    overlay.add(this.add.rectangle(W / 2, 400, W - 60, 260, 0x0d0d22)
      .setStrokeStyle(2, 0xffdd88));

    overlay.add(this.add.text(W / 2, 300, title, {
      font: '22px monospace', fill: '#ffdd88'
    }).setOrigin(0.5));

    overlay.add(this.add.text(W / 2, 395, body, {
      font: '18px monospace', fill: color, align: 'center'
    }).setOrigin(0.5));

    const btn = this.add.rectangle(W / 2, 498, 220, 54, 0x200040)
      .setStrokeStyle(2, 0xffdd88)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        overlay.destroy();
        this._build();
      });
    overlay.add(btn);
    overlay.add(this.add.text(W / 2, 498, 'CONTINUE', {
      font: '18px monospace', fill: '#ffdd88'
    }).setOrigin(0.5));
  }
}

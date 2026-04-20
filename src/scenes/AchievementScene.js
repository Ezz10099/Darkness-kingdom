import AchievementManager, { ACHIEVEMENTS } from '../systems/AchievementManager.js';

const CATEGORIES  = ['Progression', 'Collection', 'Combat', 'Gear', 'Social'];
const CARD_W      = 224;
const CARD_H      = 76;
const CARD_GAP    = 8;
const COL_COUNT   = 2;
const HEADER_H    = 88;

export default class AchievementScene extends Phaser.Scene {
  constructor() { super('Achievement'); }

  create() {
    const W = 480, H = 854;
    this._scrollY   = 0;
    this._dragStart = null;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);

    this._buildHeader(W);

    // Scrollable content container (header has depth 10+ so it covers scrolled content naturally)
    this._cont = this.add.container(0, HEADER_H);
    this._buildContent(W);

    // Drag-to-scroll
    this.input.on('pointerdown', p => { this._dragStart = { py: p.y, sy: this._scrollY }; });
    this.input.on('pointermove', p => {
      if (!p.isDown || !this._dragStart) return;
      this._applyScroll(this._dragStart.sy + (p.y - this._dragStart.py));
    });
    this.input.on('pointerup', () => { this._dragStart = null; });

    // Show any queued achievement popups
    AchievementManager.showPopups(this);
  }

  _buildHeader(W) {
    this.add.rectangle(W / 2, HEADER_H / 2, W, HEADER_H, 0x0d0d22).setDepth(10);
    this.add.text(W / 2, 26, 'ACHIEVEMENTS', { font: '22px monospace', fill: '#ffd700' })
      .setOrigin(0.5).setDepth(11);
    this.add.text(18, 26, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setDepth(11)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub'));

    const completed     = ACHIEVEMENTS.filter(a => AchievementManager.isCompleted(a.id));
    const crystalsEarned = completed.reduce((s, a) => s + a.reward, 0);
    this.add.text(W / 2, 58,
      completed.length + ' / ' + ACHIEVEMENTS.length + ' unlocked  \u2022  +' + crystalsEarned + ' PC earned',
      { font: '12px monospace', fill: '#887799' }).setOrigin(0.5).setDepth(11);

    this.add.rectangle(W / 2, HEADER_H - 1, W, 2, 0x333366).setDepth(10);
  }

  _buildContent(W) {
    let y = 14;
    const padX = (W - COL_COUNT * CARD_W - (COL_COUNT - 1) * CARD_GAP) / 2;

    for (const cat of CATEGORIES) {
      const items = ACHIEVEMENTS.filter(a => a.category === cat);

      // Category header bar
      const bar = this.add.rectangle(W / 2, y + 13, W - 16, 26, 0x15102a)
        .setStrokeStyle(1, 0x443366);
      const hdr = this.add.text(W / 2, y + 13, cat.toUpperCase(),
        { font: '12px monospace', fill: '#aa88cc' }).setOrigin(0.5);
      this._cont.add([bar, hdr]);
      y += 32;

      // 2-column grid
      for (let row = 0; row < Math.ceil(items.length / COL_COUNT); row++) {
        for (let col = 0; col < COL_COUNT; col++) {
          const idx = row * COL_COUNT + col;
          if (idx >= items.length) break;
          this._drawCard(items[idx], padX + col * (CARD_W + CARD_GAP), y);
        }
        y += CARD_H + 6;
      }
      y += 12;
    }

    this._contentHeight = y + 10;
  }

  _drawCard(ach, x, y) {
    const done     = AchievementManager.isCompleted(ach.id);
    const bgColor  = done ? 0x1a0a2e : 0x0f0f1e;
    const border   = done ? 0x9944dd : 0x2a2a44;
    const nameCol  = done ? '#ffd700' : '#555577';
    const descCol  = done ? '#9999bb' : '#3a3a55';
    const rwdCol   = done ? '#88ccff' : '#333355';
    const icon     = done ? '\u2713' : '\u25cb';
    const iconCol  = done ? '#55ee55' : '#333355';

    const bg      = this.add.rectangle(x + CARD_W / 2, y + CARD_H / 2, CARD_W, CARD_H, bgColor)
      .setStrokeStyle(1, border);
    const iconTxt = this.add.text(x + 8,  y + 10, icon,
      { font: '14px monospace', fill: iconCol });
    const nameTxt = this.add.text(x + 22, y + 10, ach.label,
      { font: '11px monospace', fill: nameCol });
    const rwdTxt  = this.add.text(x + CARD_W - 6, y + 10, '+' + ach.reward + ' PC',
      { font: '10px monospace', fill: rwdCol }).setOrigin(1, 0);
    const descTxt = this.add.text(x + 8, y + 32, ach.desc,
      { font: '9px monospace', fill: descCol, wordWrap: { width: CARD_W - 14 } });

    this._cont.add([bg, iconTxt, nameTxt, rwdTxt, descTxt]);
  }

  _applyScroll(newY) {
    const maxScroll  = Math.max(0, this._contentHeight - (854 - HEADER_H));
    this._scrollY    = Phaser.Math.Clamp(newY, -maxScroll, 0);
    this._cont.y     = HEADER_H + this._scrollY;
  }
}

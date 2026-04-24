import ElderTreeManager, { TREE_NODES } from '../systems/ElderTreeManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import GameState from '../systems/GameState.js';
import { CURRENCY, CURRENCY_LABEL } from '../data/constants.js';

const HEADER_H  = 90;
const CARD_H    = 80;
const CARD_GAP  = 6;
const SECTIONS  = ['ECONOMY', 'ACADEMY'];

export default class ElderTreeScene extends Phaser.Scene {
  constructor() { super('ElderTree'); }

  create() {
    const W = 480, H = 854;
    this._scrollY   = 0;
    this._dragStart = null;
    this._popup     = null;

    this.add.rectangle(W / 2, H / 2, W, H, 0x050e07);

    this._buildHeader(W);

    this._cont = this.add.container(0, HEADER_H);
    this._buildContent(W);

    this.input.on('pointerdown', p => { this._dragStart = { py: p.y, sy: this._scrollY }; });
    this.input.on('pointermove', p => {
      if (!p.isDown || !this._dragStart || this._popup) return;
      this._applyScroll(this._dragStart.sy + (p.y - this._dragStart.py));
    });
    this.input.on('pointerup', () => { this._dragStart = null; });
  }

  _buildHeader(W) {
    this.add.rectangle(W / 2, HEADER_H / 2, W, HEADER_H, 0x060f08).setDepth(10);
    this.add.text(W / 2, 26, '\u2767 ELDER TREE', { font: '22px monospace', fill: '#66ff88' })
      .setOrigin(0.5).setDepth(11);
    this.add.text(18, 26, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setDepth(11)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub'));

    const purchased = TREE_NODES.filter(n => ElderTreeManager.isPurchased(n.id)).length;
    this.add.text(W / 2, 58,
      purchased + ' / ' + TREE_NODES.length + ' nodes purchased',
      { font: '12px monospace', fill: '#558866' }).setOrigin(0.5).setDepth(11);

    this._goldLabel = this.add.text(W - 16, 58,
      `${CURRENCY_LABEL.GOLD}: ` + CurrencyManager.get(CURRENCY.GOLD).toLocaleString(),
      { font: '11px monospace', fill: '#ffd700' }).setOrigin(1, 0.5).setDepth(11);

    this.add.rectangle(W / 2, HEADER_H - 1, W, 2, 0x224422).setDepth(10);
  }

  _buildContent(W) {
    this._cont.removeAll(true);
    let y = 12;

    for (const section of SECTIONS) {
      const nodes = TREE_NODES.filter(n => n.section === section);
      const academyLocked = section === 'ACADEMY' && !ElderTreeManager.isAcademyUnlocked();

      // Section header
      const bar = this.add.rectangle(W / 2, y + 14, W - 16, 28, 0x0c200f)
        .setStrokeStyle(1, 0x335533);
      const hdr = this.add.text(W / 2, y + 14, section,
        { font: '13px monospace', fill: '#66cc88' }).setOrigin(0.5);
      this._cont.add([bar, hdr]);
      y += 36;

      if (academyLocked) {
        const lockMsg = this.add.text(W / 2, y + 8, 'Unlocks after Region 3 completion',
          { font: '10px monospace', fill: '#776644' }).setOrigin(0.5);
        this._cont.add(lockMsg);
        y += 20;
      }

      for (const node of nodes) {
        this._drawCard(node, y, W);
        y += CARD_H + CARD_GAP;
      }
      y += 14;
    }

    this._contentHeight = y + 10;
  }

  _drawCard(node, y, W) {
    const owned   = ElderTreeManager.isPurchased(node.id);
    const canBuy  = ElderTreeManager.canPurchase(node.id);
    const prereqMet = !node.requires || ElderTreeManager.isPurchased(node.requires);
    const academyLocked = node.section === 'ACADEMY' && !ElderTreeManager.isAcademyUnlocked();
    const locked  = !owned && (!prereqMet || academyLocked);

    const bgColor = owned ? 0x0a2e10 : locked ? 0x0d0d0d : 0x0f1e12;
    const border  = owned ? 0x33aa55 : locked ? 0x222222 : canBuy ? 0x44cc66 : 0x2a3a2a;
    const alpha   = locked ? 0.5 : 1;

    // Card background
    const bg = this.add.rectangle(W / 2, y + CARD_H / 2, W - 20, CARD_H, bgColor)
      .setStrokeStyle(1, border).setAlpha(alpha);
    this._cont.add(bg);

    // Chain indent for nodes that have prerequisites
    const indX = node.requires ? 28 : 16;
    if (node.requires) {
      const indent = this.add.text(16, y + CARD_H / 2 - 2, '\u2514',
        { font: '14px monospace', fill: '#335533' }).setOrigin(0, 0.5).setAlpha(alpha);
      this._cont.add(indent);
    }

    // Label
    const nameCol = owned ? '#66ff88' : locked ? '#444444' : '#ccffdd';
    const name = this.add.text(indX, y + 12, node.label,
      { font: '13px monospace', fill: nameCol }).setAlpha(alpha);
    this._cont.add(name);

    // Description
    const descCol = owned ? '#88bb99' : locked ? '#333333' : '#779988';
    const desc = this.add.text(indX, y + 34, node.desc,
      { font: '10px monospace', fill: descCol }).setAlpha(alpha);
    this._cont.add(desc);

    // Cost
    const costCol = owned ? '#556655' : locked ? '#333333' : canBuy ? '#ffd700' : '#887744';
    const costTxt = this.add.text(indX, y + 54, owned ? 'Purchased' : `${node.cost.toLocaleString()} ${CURRENCY_LABEL.GOLD}`,
      { font: '10px monospace', fill: costCol }).setAlpha(alpha);
    this._cont.add(costTxt);

    // Status badge / purchase button
    if (owned) {
      const badge = this.add.text(W - 26, y + CARD_H / 2, '\u2713 OWNED',
        { font: '11px monospace', fill: '#33cc55' }).setOrigin(1, 0.5);
      this._cont.add(badge);
    } else if (!locked) {
      const btnColor = canBuy ? 0x1a4a22 : 0x111811;
      const btnBorder = canBuy ? 0x44cc66 : 0x334433;
      const btnTxt   = canBuy ? 'BUY' : `NEED ${CURRENCY_LABEL.GOLD.toUpperCase()}`;
      const btnTxtCol = canBuy ? '#55ff77' : '#445544';

      const btn = this.add.rectangle(W - 50, y + CARD_H / 2, 72, 36, btnColor)
        .setStrokeStyle(1, btnBorder);
      const bTxt = this.add.text(W - 50, y + CARD_H / 2, btnTxt,
        { font: '10px monospace', fill: btnTxtCol }).setOrigin(0.5);
      this._cont.add([btn, bTxt]);

      if (canBuy) {
        btn.setInteractive({ useHandCursor: true })
          .on('pointerdown', () => btn.setFillStyle(0x0d2e14))
          .on('pointerout',  () => btn.setFillStyle(0x1a4a22))
          .on('pointerup',   () => this._showConfirm(node));
      }
    } else {
      const lock = this.add.text(W - 26, y + CARD_H / 2, '\uD83D\uDD12',
        { font: '14px monospace', fill: '#444444' }).setOrigin(1, 0.5);
      this._cont.add(lock);
    }
  }

  _showConfirm(node) {
    if (this._popup) return;
    const W = 480;

    const overlay = this.add.container(W / 2, 427).setDepth(200);
    this._popup = overlay;

    overlay.add(this.add.rectangle(0, 0, W, 854, 0x000000).setAlpha(0.7));
    overlay.add(this.add.rectangle(0, 0, 380, 200, 0x0c1e10).setStrokeStyle(2, 0x44cc66));
    overlay.add(this.add.text(0, -72, 'Purchase Node?',
      { font: '16px monospace', fill: '#66ff88' }).setOrigin(0.5));
    overlay.add(this.add.text(0, -44, node.label,
      { font: '18px monospace', fill: '#ffffff' }).setOrigin(0.5));
    overlay.add(this.add.text(0, -16, node.desc,
      { font: '12px monospace', fill: '#aaccaa' }).setOrigin(0.5));
    overlay.add(this.add.text(0, 14, `Cost: ${node.cost.toLocaleString()} ${CURRENCY_LABEL.GOLD}`,
      { font: '14px monospace', fill: '#ffd700' }).setOrigin(0.5));

    // Confirm button
    const ok = this.add.rectangle(-70, 62, 120, 44, 0x1a4a22).setStrokeStyle(2, 0x44cc66)
      .setInteractive({ useHandCursor: true });
    ok.on('pointerup', () => {
      const bought = ElderTreeManager.purchase(node.id);
      this._closePopup();
      if (bought) {
        GameState.save();
        this._goldLabel.setText(`${CURRENCY_LABEL.GOLD}: ` + CurrencyManager.get(CURRENCY.GOLD).toLocaleString());
        this._buildContent(W);
      }
    });
    const cancel = this.add.rectangle(70, 62, 120, 44, 0x2e0a0a).setStrokeStyle(2, 0xaa3333)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this._closePopup());

    overlay.add([ok, cancel]);
    overlay.add(this.add.text(-70, 62, 'CONFIRM', { font: '14px monospace', fill: '#55ff77' }).setOrigin(0.5));
    overlay.add(this.add.text( 70, 62, 'CANCEL',  { font: '14px monospace', fill: '#ff6666' }).setOrigin(0.5));
  }

  _closePopup() {
    if (this._popup) { this._popup.destroy(); this._popup = null; }
  }

  _applyScroll(newY) {
    const maxScroll = Math.max(0, this._contentHeight - (854 - HEADER_H));
    this._scrollY   = Phaser.Math.Clamp(newY, -maxScroll, 0);
    this._cont.y    = HEADER_H + this._scrollY;
  }
}

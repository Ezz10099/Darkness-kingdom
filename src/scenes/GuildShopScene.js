import CurrencyManager from '../systems/CurrencyManager.js';
import GameState from '../systems/GameState.js';
import GuildManager from '../systems/GuildManager.js';
import GuildShopManager from '../systems/GuildShopManager.js';
import { CURRENCY } from '../data/constants.js';
import createVerticalScroll from '../ui/ScrollPane.js';

const W = 480;
const H = 854;
const HEADER_H = 112;
const CARD_H = 188;

export default class GuildShopScene extends Phaser.Scene {
  constructor() { super('GuildShop'); }

  create() {
    this._root = this.add.container(0, 0);
    this._scroll = null;
    this._showShop();
  }

  _reset() {
    if (this._scroll) { this._scroll.destroy(); this._scroll = null; }
    this._root.removeAll(true);
  }

  _showShop() {
    this._reset();
    const c = this._root;
    c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a));
    c.add(this.add.rectangle(W / 2, HEADER_H / 2, W, HEADER_H, 0x0d0d22).setStrokeStyle(1, 0x333366));
    c.add(this.add.text(W / 2, 32, 'GUILD SHOP', { font: '24px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(24, 32, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('Guild')));
    const coins = CurrencyManager.get(CURRENCY.GUILD_COINS);
    const items = GuildShopManager.getItems();
    const refreshes = GuildManager.getGuildShopRefreshesPerDay();
    c.add(this.add.text(W / 2, 66, '★ ' + coins.toLocaleString() + ' Guild Coins', { font: '16px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 92, 'Refresh: ' + refreshes + 'x/day · ' + items.length + ' total items',
      { font: '11px monospace', fill: '#777799' }).setOrigin(0.5));

    const list = this.add.container(0, 0);
    c.add(list);
    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ix = 122 + col * 238;
      const iy = 24 + row * 210 + CARD_H / 2;
      this._drawItemCard(list, item, ix, iy, coins);
    });
    const contentHeight = 48 + Math.ceil(items.length / 2) * 210;
    this._scroll = createVerticalScroll(this, list, { x: 0, y: HEADER_H, width: W, height: H - HEADER_H, contentHeight });
  }

  _drawItemCard(c, item, ix, iy, coins) {
    c.add(this.add.rectangle(ix, iy, 222, CARD_H, 0x111122).setStrokeStyle(1, 0x334466));
    const typeStr = item.type === 'gear' ? item.slot : item.subtype.toUpperCase();
    const typeColor = item.type === 'gear' ? '#7799cc' : '#ccaa44';
    c.add(this.add.text(ix, iy - CARD_H / 2 + 14, typeStr, { font: '10px monospace', fill: typeColor }).setOrigin(0.5));
    c.add(this.add.text(ix, iy - CARD_H / 2 + 32, item.rarity || item.subtype, { font: '11px monospace', fill: item.rarityColor }).setOrigin(0.5));
    c.add(this.add.text(ix, iy - CARD_H / 2 + 56, item.name, { font: '13px monospace', fill: item.rarityColor, wordWrap: { width: 200 }, align: 'center' }).setOrigin(0.5));
    c.add(this.add.text(ix, iy - CARD_H / 2 + 84, item.desc, { font: '10px monospace', fill: '#888888', wordWrap: { width: 200 }, align: 'center' }).setOrigin(0.5));
    c.add(this.add.text(ix, iy - CARD_H / 2 + 114, item.cost + ' Coins', { font: '12px monospace', fill: '#ffd700' }).setOrigin(0.5));

    const purchased = item.purchased;
    const owned = Boolean(item.owned);
    const canAfford = !purchased && coins >= item.cost;
    const btnC = purchased ? 0x111111 : (canAfford ? 0x0d1a00 : 0x111111);
    const btnBrd = purchased ? 0x333333 : (canAfford ? 0x44cc44 : 0x333333);
    const btnLbl = purchased ? (owned ? 'OWNED' : 'SOLD') : 'BUY';
    const btnClr = purchased ? (owned ? '#88cc88' : '#444444') : (canAfford ? '#44cc44' : '#555555');
    const buyBg = this.add.rectangle(ix, iy - CARD_H / 2 + 150, 150, 36, btnC).setStrokeStyle(1, btnBrd);
    c.add(buyBg);
    c.add(this.add.text(ix, iy - CARD_H / 2 + 150, btnLbl, { font: '14px monospace', fill: btnClr }).setOrigin(0.5));
    if (!purchased && canAfford) {
      buyBg.setInteractive({ useHandCursor: true }).on('pointerup', (pointer) => {
        if (!this._scroll?.isTap(pointer)) return;
        this._buy(item.id);
      });
    }
  }

  _buy(itemId) {
    const result = GuildShopManager.buyItem(itemId);
    if (!result.ok) return;
    GameState.save();
    this._showShop();
  }
}

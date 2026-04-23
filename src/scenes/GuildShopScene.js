import CurrencyManager  from '../systems/CurrencyManager.js';
import GameState        from '../systems/GameState.js';
import GuildManager     from '../systems/GuildManager.js';
import GuildShopManager from '../systems/GuildShopManager.js';
import { CURRENCY }     from '../data/constants.js';

export default class GuildShopScene extends Phaser.Scene {
  constructor() { super('GuildShop'); }

  create() {
    this._root = this.add.container(0, 0);
    this._showShop();
  }

  _showShop() {
    const c = this._root, W = 480;
    c.removeAll(true);

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 36, 'GUILD SHOP', { font: '24px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(30, 36, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('Guild')));

    const coins = CurrencyManager.get(CURRENCY.GUILD_COINS);
    c.add(this.add.text(W / 2, 72,
      '\u2605 ' + coins.toLocaleString() + ' Guild Coins',
      { font: '16px monospace', fill: '#ffd700' }).setOrigin(0.5));
    const items = GuildShopManager.getItems();
    const refreshes = GuildManager.getGuildShopRefreshesPerDay();
    c.add(this.add.text(W / 2, 94,
      `Refresh: ${refreshes}x/day  \u2022  ${items.length} total items`,
    c.add(this.add.text(W / 2, 94,
      `Rotates daily  \u2022  ${items.length} total items`,
      { font: '11px monospace', fill: '#555577' }).setOrigin(0.5));

    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ix  = 122 + col * 238;
      const iy  = 178 + row * 210;

      const cardH = 188;
      c.add(this.add.rectangle(ix, iy, 222, cardH, 0x111122).setStrokeStyle(1, 0x334466));

      // Type label
      const typeStr  = item.type === 'gear' ? item.slot : item.subtype.toUpperCase();
      const typeColor = item.type === 'gear' ? '#7799cc' : '#ccaa44';
      c.add(this.add.text(ix, iy - cardH / 2 + 14, typeStr,
        { font: '10px monospace', fill: typeColor }).setOrigin(0.5));

      // Rarity badge
      c.add(this.add.text(ix, iy - cardH / 2 + 32, item.rarity || item.subtype,
        { font: '11px monospace', fill: item.rarityColor }).setOrigin(0.5));

      // Name
      c.add(this.add.text(ix, iy - cardH / 2 + 56, item.name,
        { font: '13px monospace', fill: item.rarityColor, wordWrap: { width: 200 }, align: 'center' }).setOrigin(0.5));

      // Desc
      c.add(this.add.text(ix, iy - cardH / 2 + 84, item.desc,
        { font: '10px monospace', fill: '#888888', wordWrap: { width: 200 }, align: 'center' }).setOrigin(0.5));

      // Cost
      c.add(this.add.text(ix, iy - cardH / 2 + 114, item.cost + ' Coins',
        { font: '12px monospace', fill: '#ffd700' }).setOrigin(0.5));

      // Buy button
      const purchased = item.purchased;
      const canAfford = !purchased && coins >= item.cost;
      const btnC   = purchased ? 0x111111 : (canAfford ? 0x0d1a00 : 0x111111);
      const btnBrd = purchased ? 0x333333 : (canAfford ? 0x44cc44 : 0x333333);
      const btnLbl = purchased ? 'SOLD' : 'BUY';
      const btnClr = purchased ? '#444444' : (canAfford ? '#44cc44' : '#555555');

      const buyBg = this.add.rectangle(ix, iy - cardH / 2 + 150, 150, 36, btnC)
        .setStrokeStyle(1, btnBrd);
      c.add(buyBg);
      c.add(this.add.text(ix, iy - cardH / 2 + 150, btnLbl,
        { font: '14px monospace', fill: btnClr }).setOrigin(0.5));

      if (!purchased && canAfford) {
        buyBg.setInteractive({ useHandCursor: true })
          .on('pointerdown', () => buyBg.setFillStyle(0x071000))
          .on('pointerout',  () => buyBg.setFillStyle(0x0d1a00))
          .on('pointerup',   () => this._buy(item.id));
      }
    });
  }

  _buy(itemId) {
    const result = GuildShopManager.buyItem(itemId);
    if (!result.ok) return;
    GameState.save();
    this._showShop();
  }
}

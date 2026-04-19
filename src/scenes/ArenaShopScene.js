import CurrencyManager from '../systems/CurrencyManager.js';
import GameState from '../systems/GameState.js';
import { CURRENCY } from '../data/constants.js';

const SHOP_ITEMS = [
  {
    id: 'cosmetic_banner',
    name: 'Arcane Banner',
    desc: 'Cosmetic arena title (stub)',
    cost: 200,
    color: '#cc88ff',
  },
  {
    id: 'hero_shard_pack',
    name: 'Hero Shard Pack',
    desc: '+50 Awakening Shards',
    cost: 350,
    color: '#ffaa44',
  },
  {
    id: 'rare_crystal_pack',
    name: 'Crystal Coffer',
    desc: '+100 Crystals',
    cost: 500,
    color: '#aaddff',
  },
];

export default class ArenaShopScene extends Phaser.Scene {
  constructor() { super('ArenaShop'); }

  create() {
    this._root = this.add.container(0, 0);
    this._showShop();
  }

  _showShop() {
    const c = this._root, W = 480;
    c.removeAll(true);

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 40, 'ARENA SHOP', {
      font: '24px monospace', fill: '#ffaa44',
    }).setOrigin(0.5));
    c.add(this.add.text(30, 40, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('Arena')));

    const tokens = CurrencyManager.get(CURRENCY.ARENA_TOKENS);
    c.add(this.add.text(W / 2, 82, tokens + ' Arena Tokens', {
      font: '16px monospace', fill: '#ffaa44',
    }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 112, 'ITEMS FOR SALE', {
      font: '13px monospace', fill: '#886699',
    }).setOrigin(0.5));

    SHOP_ITEMS.forEach((item, i) => {
      const iy = 200 + i * 130;
      c.add(this.add.rectangle(W / 2, iy, W - 40, 110, 0x111122)
        .setStrokeStyle(1, 0x334466));
      c.add(this.add.text(28, iy - 32, item.name, { font: '16px monospace', fill: item.color }));
      c.add(this.add.text(28, iy - 8,  item.desc, { font: '12px monospace', fill: '#888888' }));
      c.add(this.add.text(28, iy + 18, item.cost + ' Tokens', { font: '13px monospace', fill: '#ffaa44' }));

      const canAfford = tokens >= item.cost;
      const buyBtn = this.add.rectangle(W - 66, iy, 84, 44, canAfford ? 0x1a0a00 : 0x111111)
        .setStrokeStyle(1, canAfford ? 0xffaa44 : 0x333333).setInteractive({ useHandCursor: true });
      c.add(buyBtn);
      c.add(this.add.text(W - 66, iy, 'BUY', {
        font: '15px monospace', fill: canAfford ? '#ffaa44' : '#444444',
      }).setOrigin(0.5));

      if (canAfford) {
        buyBtn.on('pointerdown', () => buyBtn.setFillStyle(0x0d0500));
        buyBtn.on('pointerout',  () => buyBtn.setFillStyle(0x1a0a00));
        buyBtn.on('pointerup',   () => this._buyItem(item));
      }
    });
  }

  _buyItem(item) {
    if (!CurrencyManager.spend(CURRENCY.ARENA_TOKENS, item.cost)) return;
    if (item.id === 'hero_shard_pack')   CurrencyManager.add(CURRENCY.AWAKENING_SHARDS, 50);
    if (item.id === 'rare_crystal_pack') CurrencyManager.add(CURRENCY.CRYSTALS, 100);
    GameState.save();
    this._showShop();
  }
}

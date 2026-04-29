import CurrencyManager from '../systems/CurrencyManager.js';
import GameState from '../systems/GameState.js';
import HeroManager, { HeroInstance } from '../systems/HeroManager.js';
import HERO_DEFINITIONS from '../data/heroDefinitions.js';
import { CURRENCY } from '../data/constants.js';
import createVerticalScroll from '../ui/ScrollPane.js';

const W = 480;
const H = 854;
const HEADER_H = 116;

const SHOP_ITEMS = [
  { id: 'hero_arena_valtora', name: 'Valtora Duelcrest', desc: 'Exclusive Arena Hero (EPIC)', cost: 1200, color: '#ffcc66' },
  { id: 'hero_arena_nox', name: 'Nox Chainveil', desc: 'Exclusive Arena Hero (EPIC)', cost: 1200, color: '#cc88ff' },
  { id: 'hero_shard_pack', name: 'Hero Shard Pack', desc: '+50 Awakening Shards', cost: 350, color: '#ffaa44' },
  { id: 'rare_crystal_pack', name: 'Crystal Coffer', desc: '+100 Crystals', cost: 500, color: '#aaddff' }
];

export default class ArenaShopScene extends Phaser.Scene {
  constructor() { super('ArenaShop'); }

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
    const tokens = CurrencyManager.get(CURRENCY.ARENA_TOKENS);
    c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a));
    c.add(this.add.rectangle(W / 2, HEADER_H / 2, W, HEADER_H, 0x0d0d22).setStrokeStyle(1, 0x333366));
    c.add(this.add.text(W / 2, 34, 'ARENA SHOP', { font: '24px monospace', fill: '#ffaa44' }).setOrigin(0.5));
    c.add(this.add.text(24, 34, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('Arena')));
    c.add(this.add.text(W / 2, 72, tokens + ' Arena Tokens', { font: '16px monospace', fill: '#ffaa44' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 98, 'EXCLUSIVE HEROES + MATERIALS', { font: '13px monospace', fill: '#886699' }).setOrigin(0.5));

    const list = this.add.container(0, 0);
    c.add(list);
    SHOP_ITEMS.forEach((item, i) => this._drawItem(list, item, 28 + i * 130, tokens));
    this._scroll = createVerticalScroll(this, list, { x: 0, y: HEADER_H, width: W, height: H - HEADER_H, contentHeight: 40 + SHOP_ITEMS.length * 130 });
  }

  _drawItem(c, item, y, tokens) {
    const iy = y + 55;
    c.add(this.add.rectangle(W / 2, iy, W - 40, 110, 0x111122).setStrokeStyle(1, 0x334466));
    c.add(this.add.text(28, iy - 32, item.name, { font: '16px monospace', fill: item.color }));
    c.add(this.add.text(28, iy - 8, item.desc, { font: '12px monospace', fill: '#888888' }));
    c.add(this.add.text(28, iy + 18, item.cost + ' Tokens', { font: '13px monospace', fill: '#ffaa44' }));

    const alreadyOwned = item.id.startsWith('hero_') && HeroManager.getAllHeroes().some(h => h.heroDefId === item.id);
    const canAfford = tokens >= item.cost && !alreadyOwned;
    const buyBtn = this.add.rectangle(W - 66, iy, 84, 44, canAfford ? 0x1a0a00 : 0x111111)
      .setStrokeStyle(1, canAfford ? 0xffaa44 : 0x333333);
    c.add(buyBtn);
    c.add(this.add.text(W - 66, iy, alreadyOwned ? 'OWNED' : 'BUY', {
      font: '15px monospace', fill: canAfford ? '#ffaa44' : '#444444'
    }).setOrigin(0.5));
    if (canAfford) buyBtn.setInteractive({ useHandCursor: true }).on('pointerup', () => this._buyItem(item));
  }

  _buyItem(item) {
    if (!CurrencyManager.spend(CURRENCY.ARENA_TOKENS, item.cost)) return;
    if (item.id.startsWith('hero_')) {
      const def = HERO_DEFINITIONS.find(h => h.id === item.id);
      if (def && !HeroManager.getAllHeroes().some(h => h.heroDefId === def.id)) {
        HeroManager.addHero(new HeroInstance({
          heroDefId: def.id, name: def.name, title: def.title || null,
          heroClass: def.heroClass, affinity: def.affinity, rarity: def.rarity, originRarity: def.rarity,
          baseStats: def.baseStats, normalAbilityIds: def.normalAbilityIds,
          ultimateAbilityId: def.ultimateAbilityId, ultimateAbilityId2: def.ultimateAbilityId2 || null
        }));
      }
    }
    if (item.id === 'hero_shard_pack') CurrencyManager.add(CURRENCY.AWAKENING_SHARDS, 50);
    if (item.id === 'rare_crystal_pack') CurrencyManager.add(CURRENCY.CRYSTALS, 100);
    GameState.save();
    this._showShop();
  }
}

import { RARITY, AFFINITY, CURRENCY, RARITY_ORDER } from '../data/constants.js';
import CurrencyManager from './CurrencyManager.js';
import HeroManager, { HeroInstance } from './HeroManager.js';
import ElderTreeManager from './ElderTreeManager.js';

const SHARD_VALUES = {
  COMMON: 1, UNCOMMON: 2, RARE: 5, EPIC: 15, LEGENDARY: 50, MYTHIC: 150, ASCENDED: 300
};

const BANNER_RATES = {
  BASIC: {
    COMMON:   { unobtained: 55,  obtained: 30  },
    UNCOMMON: { unobtained: 28,  obtained: 15  },
    RARE:     { unobtained: 14,  obtained: 8   },
    EPIC:     { unobtained: 3,   obtained: 1.5 }
  },
  ADVANCED: {
    RARE:      { unobtained: 50, obtained: 28 },
    EPIC:      { unobtained: 35, obtained: 18 },
    LEGENDARY: { unobtained: 14, obtained: 6  }
  }
};

const SummonManager = {
  pityCounters: { BASIC: 0, ADVANCED: 0 },
  wishlist: new Set(),
  wishlistMaxSize: 3,

  _pickRarity(bannerType, ownedDefIds) {
    const rates = BANNER_RATES[bannerType];
    const pool = {};
    for (const [rarity, rate] of Object.entries(rates)) {
      const owned = ownedDefIds.some(id => {
        const h = HeroManager.getAllHeroes().find(h => h.heroDefId === id && h.rarity === rarity);
        return !!h;
      });
      pool[rarity] = owned ? rate.obtained : rate.unobtained;
    }

    const counter = this.pityCounters[bannerType];
    if (bannerType === 'BASIC') {
      if (counter >= 30) return 'EPIC';
      if (counter >= 25 && pool.EPIC) pool.EPIC *= (1 + 10 * (counter - 25));
    }
    if (bannerType === 'ADVANCED') {
      if (counter >= 80) return 'LEGENDARY';
      if (counter >= 60 && pool.LEGENDARY) pool.LEGENDARY *= (1 + 10 * (counter - 60));
    }

    const total = Object.values(pool).reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (const [rarity, weight] of Object.entries(pool)) {
      rand -= weight;
      if (rand <= 0) return rarity;
    }
    return Object.keys(pool)[0];
  },

  _pickHeroFromPool(rarity, heroPool) {
    const eligible = heroPool.filter(d => d.rarity === rarity);
    const weighted = eligible.map(def => ({
      def,
      w: (def.affinity === 'LIGHT' || def.affinity === 'SHADOW') ? 0.5 : 1
    }));
    const total = weighted.reduce((a, b) => a + b.w, 0);
    let rand = Math.random() * total;
    for (const { def, w } of weighted) {
      rand -= w;
      if (rand <= 0) return def;
    }
    return weighted[0]?.def || null;
  },

  pull(bannerType, heroPool) {
    const ownedDefIds = HeroManager.getAllHeroes().map(h => h.heroDefId);
    const rarity = this._pickRarity(bannerType, ownedDefIds);

    let pickedDef = null;
    if (this.wishlist.size > 0) {
      const wishlistPool = heroPool.filter(d => this.wishlist.has(d.id) && d.rarity === rarity);
      if (wishlistPool.length > 0 && Math.random() < 0.7) {
        pickedDef = wishlistPool[Math.floor(Math.random() * wishlistPool.length)];
      }
    }
    if (!pickedDef) pickedDef = this._pickHeroFromPool(rarity, heroPool);
    if (!pickedDef) return null;

    const isNew = !ownedDefIds.includes(pickedDef.id);
    this.pityCounters[bannerType]++;
    if ((bannerType === 'BASIC' && rarity === 'EPIC') || (bannerType === 'ADVANCED' && rarity === 'LEGENDARY')) {
      this.pityCounters[bannerType] = 0;
    }

    return { heroDefId: pickedDef.id, rarity, affinity: pickedDef.affinity, isNew, def: pickedDef };
  },

  pullMulti(bannerType, heroPool, count) {
    const results = [];
    for (let i = 0; i < count; i++) results.push(this.pull(bannerType, heroPool));
    return results.filter(Boolean);
  },

  handleResult(result) {
    if (!result) return;
    const { heroDefId, rarity, isNew, def } = result;
    if (!isNew) {
      const baseShards = SHARD_VALUES[rarity] || 1;
      const shards = Math.floor(baseShards * (1 + ElderTreeManager.getShardBonus()));
      CurrencyManager.add(CURRENCY.AWAKENING_SHARDS, shards);
      const existing = HeroManager.getAllHeroes().find(h => h.heroDefId === heroDefId);
      if (existing) existing.awakeningShards += shards;
    } else {
      const hero = new HeroInstance({
        heroDefId, name: def.name, title: def.title || null,
        heroClass: def.heroClass || def.class, affinity: def.affinity,
        rarity: def.rarity, originRarity: def.rarity,
        baseStats: def.baseStats,
        normalAbilityIds:   def.normalAbilityIds   || [],
        ultimateAbilityId:  def.ultimateAbilityId  || null,
        ultimateAbilityId2: def.ultimateAbilityId2 || null
      });
      HeroManager.addHero(hero);
    }
  },

  toJSON() { return { pityCounters: this.pityCounters, wishlist: [...this.wishlist] }; },

  fromJSON(data) {
    if (data.pityCounters) this.pityCounters = data.pityCounters;
    if (data.wishlist) this.wishlist = new Set(data.wishlist);
  }
};

export default SummonManager;

import CurrencyManager from './CurrencyManager.js';
import { CURRENCY } from '../data/constants.js';
import GuildManager from './GuildManager.js';

const GEAR_POOL = [
  { id: 'gs_iron_sword',     name: 'Iron Sword',       type: 'gear', slot: 'WEAPON',    rarity: 'COMMON',    desc: '+15 DMG',           cost: 80,   rarityColor: '#aaaaaa' },
  { id: 'gs_wool_robe',      name: 'Wool Robe',         type: 'gear', slot: 'ROBE',      rarity: 'COMMON',    desc: '+80 HP',            cost: 80,   rarityColor: '#aaaaaa' },
  { id: 'gs_copper_ring',    name: 'Copper Ring',       type: 'gear', slot: 'ACCESSORY', rarity: 'COMMON',    desc: '+4 DEF',            cost: 80,   rarityColor: '#aaaaaa' },
  { id: 'gs_silver_blade',   name: 'Silver Blade',      type: 'gear', slot: 'WEAPON',    rarity: 'UNCOMMON',  desc: '+30 DMG',           cost: 200,  rarityColor: '#44cc44' },
  { id: 'gs_enchanted_robe', name: 'Enchanted Robe',    type: 'gear', slot: 'ROBE',      rarity: 'UNCOMMON',  desc: '+180 HP',           cost: 200,  rarityColor: '#44cc44' },
  { id: 'gs_arcane_amulet',  name: 'Arcane Amulet',     type: 'gear', slot: 'ACCESSORY', rarity: 'RARE',      desc: '+10 DEF  +20 DMG',  cost: 450,  rarityColor: '#4488ff' },
  { id: 'gs_runed_blade',    name: 'Runed Blade',       type: 'gear', slot: 'WEAPON',    rarity: 'RARE',      desc: '+60 DMG',           cost: 450,  rarityColor: '#4488ff' },
  { id: 'gs_shadowweave',    name: 'Shadowweave Robe',  type: 'gear', slot: 'ROBE',      rarity: 'EPIC',      desc: '+400 HP  +15 DEF',  cost: 900,  rarityColor: '#aa44ff' },
  { id: 'gs_voidreaper',     name: 'Voidreaper',        type: 'gear', slot: 'WEAPON',    rarity: 'EPIC',      desc: '+120 DMG',          cost: 900,  rarityColor: '#aa44ff' },
  { id: 'gs_arcane_sigil',   name: 'Arcane Sigil',      type: 'gear', slot: 'SIGIL',     rarity: 'EPIC',      desc: '+100 DMG  +200 HP', cost: 1000, rarityColor: '#aa44ff' },
  { id: 'gs_legend_sword',   name: 'Legendary Sword',   type: 'gear', slot: 'WEAPON',    rarity: 'LEGENDARY', desc: '+200 DMG',          cost: 2000, rarityColor: '#ffaa00' },
  { id: 'gs_legend_robe',    name: 'Legendary Robe',    type: 'gear', slot: 'ROBE',      rarity: 'LEGENDARY', desc: '+800 HP  +30 DEF',  cost: 2000, rarityColor: '#ffaa00' },
];

const COSMETIC_POOL = [
  { id: 'gc_star_scholar',  name: 'Star Scholar',   type: 'cosmetic', subtype: 'title',  desc: 'Title: Star Scholar',    cost: 150, rarityColor: '#ffdd44' },
  { id: 'gc_shadow_veil',   name: 'Shadow Veil',    type: 'cosmetic', subtype: 'visual', desc: 'Visual: Dark aura',       cost: 220, rarityColor: '#aa44ff' },
  { id: 'gc_flame_cloak',   name: 'Flame Cloak',    type: 'cosmetic', subtype: 'visual', desc: 'Visual: Flame cloak',     cost: 220, rarityColor: '#ff6644' },
  { id: 'gc_arcane_master', name: 'Arcane Master',  type: 'cosmetic', subtype: 'title',  desc: 'Title: Arcane Master',   cost: 350, rarityColor: '#4488ff' },
  { id: 'gc_frost_shimmer', name: 'Frost Shimmer',  type: 'cosmetic', subtype: 'visual', desc: 'Visual: Frost shimmer',   cost: 280, rarityColor: '#88ddff' },
  { id: 'gc_guild_champ',   name: 'Guild Champion', type: 'cosmetic', subtype: 'title',  desc: 'Title: Guild Champion',  cost: 500, rarityColor: '#ffd700' },
  { id: 'gc_ember_aura',    name: 'Ember Aura',     type: 'cosmetic', subtype: 'visual', desc: 'Visual: Ember aura',      cost: 320, rarityColor: '#ff8844' },
  { id: 'gc_void_walker',   name: 'Void Walker',    type: 'cosmetic', subtype: 'title',  desc: 'Title: Void Walker',     cost: 600, rarityColor: '#884488' },
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getDaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function getHalfDaySeed() {
  const d = new Date();
  const half = d.getUTCHours() < 12 ? 0 : 1;
  return (d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate()) * 10 + half;
}

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDailyRotation(daySeed) {
  const rand = seededRandom(daySeed);
  const gear = shuffle(GEAR_POOL, rand);
  const cosmetic = shuffle(COSMETIC_POOL, rand);
  const out = [...gear.slice(0, 3), ...cosmetic.slice(0, 3)];
  const extraSlots = GuildManager.getGuildShopExtraSlots();
  if (extraSlots > 0) {
    out.push(...shuffle([...gear.slice(3), ...cosmetic.slice(3)], rand).slice(0, extraSlots));
  }
  return out;
}

const GuildShopManager = {
  purchasedToday: [],
  lastShopDate:   null, // tracks current rotation key (day or half-day)

  _rotationKey() {
    const d = new Date().toISOString().slice(0, 10);
    if (GuildManager.getGuildShopRefreshesPerDay() < 2) return d;
    return d + (new Date().getUTCHours() < 12 ? '-A' : '-B');
  },

  _checkDailyReset() {
    const key = this._rotationKey();
    if (this.lastShopDate !== key) {
      this.purchasedToday = [];
      this.lastShopDate   = key;
    }
  },

  getRotation() {
    return generateDailyRotation(
      GuildManager.getGuildShopRefreshesPerDay() < 2 ? getDaySeed() : getHalfDaySeed()
    );
  },

  getItems() {
    this._checkDailyReset();
    return this.getRotation().map(item => ({
      ...item,
      purchased: this.purchasedToday.includes(item.id),
    }));
  },

  buyItem(itemId) {
    this._checkDailyReset();
    const rotation = this.getRotation();
    const item = rotation.find(i => i.id === itemId);
    if (!item)                              return { ok: false, reason: 'Item not found' };
    if (this.purchasedToday.includes(itemId)) return { ok: false, reason: 'Already purchased today' };
    if (!CurrencyManager.spend(CURRENCY.GUILD_COINS, item.cost))
      return { ok: false, reason: 'Need ' + item.cost + ' Guild Coins' };
    this.purchasedToday.push(itemId);
    return { ok: true, item };
  },

  toJSON() {
    return { purchasedToday: this.purchasedToday, lastShopDate: this.lastShopDate };
  },

  fromJSON(data) {
    if (!data) return;
    this.purchasedToday = data.purchasedToday || [];
    this.lastShopDate   = data.lastShopDate   || null;
    this._checkDailyReset();
  },
};

export default GuildShopManager;

import { GEAR_SLOT, RARITY, RARITY_ORDER, CURRENCY } from '../data/constants.js';
import CurrencyManager from './CurrencyManager.js';
import HeroManager from './HeroManager.js';
import AchievementManager from './AchievementManager.js';
import ElderTreeManager from './ElderTreeManager.js';
import DailyCodexManager from './DailyCodexManager.js';

const RARITY_MULT = {
  COMMON: 1, UNCOMMON: 1.5, RARE: 2.5, EPIC: 4, LEGENDARY: 6, MYTHIC: 10, ASCENDED: 15
};

const SLOT_STAT_FOCUS = {
  WEAPON:    { damage: 1.0, defense: 0,   hp: 0   },
  ROBE:      { damage: 0,   defense: 1.0, hp: 0   },
  ACCESSORY: { damage: 0,   defense: 0,   hp: 1.0 },
  RELIC:     { damage: 0.6, defense: 0.6, hp: 0   },
  SIGIL:     { damage: 0.3, defense: 0.3, hp: 0.3 }
};

class GearInstance {
  constructor(data) {
    this.id        = data.id || crypto.randomUUID();
    this.defId     = data.defId || null;
    this.name      = data.name || 'Unknown Gear';
    this.slot      = data.slot;
    this.rarity    = data.rarity;
    this.level     = data.level || 0;
    this.equippedTo = data.equippedTo || null;

    const base  = 20 * RARITY_MULT[this.rarity];
    const focus = SLOT_STAT_FOCUS[this.slot];
    this.statBonus = data.statBonus || {
      damage:  Math.floor(base * focus.damage),
      defense: Math.floor(base * focus.defense),
      hp:      Math.floor(base * focus.hp)
    };
  }

  upgradeCost() {
    const base = Math.floor(100 * (this.level + 1) * RARITY_MULT[this.rarity]);
    return Math.floor(base * ElderTreeManager.getGearCostMult());
  }

  upgrade() {
    if (!CurrencyManager.spend(CURRENCY.GOLD, this.upgradeCost())) return false;
    this.level++;
    const factor = 1 + (this.level * 0.1);
    const base   = 20 * RARITY_MULT[this.rarity];
    const focus  = SLOT_STAT_FOCUS[this.slot];
    this.statBonus = {
      damage:  Math.floor(base * focus.damage  * factor),
      defense: Math.floor(base * focus.defense * factor),
      hp:      Math.floor(base * focus.hp      * factor)
    };
    DailyCodexManager.increment('UPGRADE_GEAR');
    return true;
  }

  salvageValue() { return Math.floor(50 * RARITY_MULT[this.rarity] * (this.level + 1)); }

  toJSON() {
    return {
      id: this.id, defId: this.defId, name: this.name, slot: this.slot,
      rarity: this.rarity, level: this.level, equippedTo: this.equippedTo,
      statBonus: this.statBonus
    };
  }

  static fromJSON(data) { return new GearInstance(data); }
}

const GearManager = {
  _inventory: new Map(),

  addGear(instance)  {
    this._inventory.set(instance.id, instance);
    AchievementManager.checkGearObtained(instance.rarity);
  },
  getGear(id)        { return this._inventory.get(id) || null; },
  getAllGear()        { return [...this._inventory.values()]; },

  equip(gearId, heroId, slot) {
    const gear = this.getGear(gearId);
    const hero = HeroManager.getHero(heroId);
    if (!gear || !hero) return false;
    const existingGearId = hero.gear[slot];
    if (existingGearId) this.unequip(existingGearId);
    gear.equippedTo = heroId;
    hero.gear[slot] = gearId;
    AchievementManager.checkGearEquipped(hero);
    return true;
  },

  unequip(gearId) {
    const gear = this.getGear(gearId);
    if (!gear || !gear.equippedTo) return false;
    const hero = HeroManager.getHero(gear.equippedTo);
    if (hero) {
      for (const slot of Object.keys(hero.gear)) {
        if (hero.gear[slot] === gearId) hero.gear[slot] = null;
      }
    }
    gear.equippedTo = null;
    return true;
  },

  transfer(gearId, newHeroId) {
    this.unequip(gearId);
    return this.equip(gearId, newHeroId, this.getGear(gearId)?.slot);
  },

  salvage(gearId) {
    const gear = this.getGear(gearId);
    if (!gear || gear.equippedTo) return false;
    CurrencyManager.add(CURRENCY.GOLD, gear.salvageValue());
    this._inventory.delete(gearId);
    return true;
  },

  getHeroGear(heroId) {
    const hero = HeroManager.getHero(heroId);
    if (!hero) return [];
    return Object.values(hero.gear).filter(Boolean).map(id => this.getGear(id)).filter(Boolean);
  },

  toJSON()  { return this.getAllGear().map(g => g.toJSON()); },
  fromJSON(arr) { this._inventory.clear(); (arr || []).forEach(d => this.addGear(GearInstance.fromJSON(d))); }
};

export { GearInstance };
export default GearManager;

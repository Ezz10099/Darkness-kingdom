import {
  RARITY_CONFIG, RARITY_ORDER, ASCENSION_CEILING, CURRENCY,
  CLASS_BASE_STATS, RARITY_STAT_MULTIPLIER
} from '../data/constants.js';
import CurrencyManager from './CurrencyManager.js';
import AchievementManager from './AchievementManager.js';

class HeroInstance {
  constructor(data) {
    this.id               = data.id || crypto.randomUUID();
    this.heroDefId        = data.heroDefId;
    this.name             = data.name;
    this.title            = data.title || null;
    this.heroClass        = data.heroClass;
    this.affinity         = data.affinity;
    this.rarity           = data.rarity;
    this.originRarity     = data.originRarity || data.rarity;
    this.level            = data.level || 1;
    this.stars            = data.stars || 1;
    this.xp               = data.xp || 0;
    this.baseStats        = data.baseStats || { hp: 100, defense: 20, damage: 25 };
    this.gear             = data.gear || { WEAPON: null, ROBE: null, ACCESSORY: null, RELIC: null, SIGIL: null };
    this.awakeningShards  = data.awakeningShards || 0;
    this._goldInvested    = data._goldInvested || 0;
    // Ability IDs (set from heroDefinition at creation time)
    this.normalAbilityIds   = data.normalAbilityIds   || [];
    this.ultimateAbilityId  = data.ultimateAbilityId  || null;
    this.ultimateAbilityId2 = data.ultimateAbilityId2 || null; // Legendary only
  }

  xpThreshold()        { return 100 * this.level; }
  currentStarLevelCap(){ return this.stars * 10; }

  computeStats() {
    const classBase  = CLASS_BASE_STATS[this.heroClass] || this.baseStats;
    const rarityMult = RARITY_STAT_MULTIPLIER[this.rarity] || 1;
    const levelStep  = Math.max(0, this.level - 1);

    const baseHp     = classBase.hp * rarityMult;
    const baseDef    = classBase.defense * rarityMult;
    const baseDmg    = classBase.damage * rarityMult;

    const levelHp    = baseHp * (1.02 ** levelStep);
    const levelDef   = baseDef * (1.018 ** levelStep);
    const levelDmg   = baseDmg * (1.022 ** levelStep);

    const starMult   = 1 + (Math.max(1, this.stars) - 1) * 0.15;
    const titleBonus = this.title ? 1.05 : 1.0;

    return {
      hp:      Math.floor(levelHp * starMult * titleBonus),
      defense: Math.floor(levelDef * starMult * titleBonus),
      damage:  Math.floor(levelDmg * starMult * titleBonus)
    };
  }

  canLevelUp()  { return this.xp >= this.xpThreshold() && this.level < this.currentStarLevelCap(); }

  levelUp(goldCost) {
    if (!this.canLevelUp()) return false;
    if (!CurrencyManager.spend(CURRENCY.GOLD, goldCost)) return false;
    const spentXp = this.xpThreshold();
    this._goldInvested += goldCost;
    this.xp = Math.max(0, this.xp - spentXp);
    this.level++;
    return true;
  }

  canStarUp()   { return this.level >= this.currentStarLevelCap() && this.stars < RARITY_CONFIG[this.rarity].maxStars; }

  starUp(shardCost) {
    if (!this.canStarUp()) return false;
    if (this.awakeningShards < shardCost) return false;
    this.awakeningShards -= shardCost;
    this.stars++;
    return true;
  }

  canAscend() {
    const ceiling = ASCENSION_CEILING[this.originRarity];
    if (!ceiling) return false;
    return RARITY_ORDER[this.rarity] < RARITY_ORDER[ceiling] && this.awakeningShards >= 50;
  }

  ascend() {
    if (!this.canAscend()) return false;
    const rarityKeys = Object.keys(RARITY_ORDER).sort((a, b) => RARITY_ORDER[a] - RARITY_ORDER[b]);
    this.rarity = rarityKeys[RARITY_ORDER[this.rarity] + 1];
    this.awakeningShards -= 50;
    AchievementManager.checkHeroAscended();
    return true;
  }

  reset(goldFee) {
    if (!CurrencyManager.spend(CURRENCY.GOLD, goldFee)) return null;
    const refundedGold = this._goldInvested;
    CurrencyManager.add(CURRENCY.GOLD, refundedGold);
    this.level = 1; this.xp = 0; this._goldInvested = 0;
    return { refundedGold };
  }

  addXP(amount) { this.xp += amount; }

  toJSON() {
    return {
      id: this.id, heroDefId: this.heroDefId, name: this.name, title: this.title,
      heroClass: this.heroClass, affinity: this.affinity, rarity: this.rarity,
      originRarity: this.originRarity, level: this.level, stars: this.stars, xp: this.xp,
      baseStats: this.baseStats, gear: this.gear, awakeningShards: this.awakeningShards,
      _goldInvested: this._goldInvested,
      normalAbilityIds: this.normalAbilityIds,
      ultimateAbilityId: this.ultimateAbilityId,
      ultimateAbilityId2: this.ultimateAbilityId2
    };
  }

  static fromJSON(data) { return new HeroInstance(data); }
}

const HeroManager = {
  _heroes: new Map(),
  addHero(instance)  {
    this._heroes.set(instance.id, instance);
    AchievementManager.checkHeroAdded(this.getAllHeroes());
  },
  getHero(id)        { return this._heroes.get(id) || null; },
  removeHero(id)     { this._heroes.delete(id); },
  getAllHeroes()      { return [...this._heroes.values()]; },
  toJSON()           { return this.getAllHeroes().map(h => h.toJSON()); },
  fromJSON(arr)      { this._heroes.clear(); (arr || []).forEach(d => this.addHero(HeroInstance.fromJSON(d))); }
};

export { HeroInstance };
export default HeroManager;

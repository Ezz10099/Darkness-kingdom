import SaveManager from './SaveManager.js';
import CurrencyManager from './CurrencyManager.js';
import HeroManager, { HeroInstance } from './HeroManager.js';
import GearManager from './GearManager.js';
import SummonManager from './SummonManager.js';
import IdleManager from './IdleManager.js';
import HERO_DEFINITIONS from '../data/heroDefinitions.js';

const GameState = {
  activeSquad: [],
  campaignProgress: { regionCleared: 0, stageCleared: null },
  unlockedSystems: new Set(),
  sessionStartTime: null,
  lastSaveTime: null,

  init() {
    this.sessionStartTime = Date.now();
    const save = SaveManager.load();
    if (save) {
      this.fromJSON(save);
      IdleManager.processOffline(save.lastSaveTime, this.campaignProgress);
    } else {
      this._seedDefaults();
    }
  },

  _seedDefaults() {
    this.activeSquad = [];
    this.campaignProgress = { regionCleared: 0, stageCleared: null };
    this.unlockedSystems = new Set();
    this.lastSaveTime = Date.now();
    // Grant starter hero
    const starterDef = HERO_DEFINITIONS.find(d => d.id === 'hero_kael');
    if (starterDef) {
      HeroManager.addHero(new HeroInstance({
        heroDefId:          starterDef.id,
        name:               starterDef.name,
        title:              starterDef.title,
        heroClass:          starterDef.heroClass,
        affinity:           starterDef.affinity,
        rarity:             starterDef.rarity,
        originRarity:       starterDef.rarity,
        baseStats:          starterDef.baseStats,
        normalAbilityIds:   starterDef.normalAbilityIds,
        ultimateAbilityId:  starterDef.ultimateAbilityId,
        ultimateAbilityId2: starterDef.ultimateAbilityId2 || null
      }));
    }
    this.save();
  },

  save() { SaveManager.save(this.toJSON()); },

  addUnlockedSystem(name) { this.unlockedSystems.add(name); this.save(); },

  isUnlocked(name) { return this.unlockedSystems.has(name); },

  toJSON() {
    return {
      activeSquad:       this.activeSquad,
      campaignProgress:  this.campaignProgress,
      unlockedSystems:   [...this.unlockedSystems],
      currencies:        CurrencyManager.toJSON(),
      heroes:            HeroManager.toJSON(),
      gear:              GearManager.toJSON(),
      summon:            SummonManager.toJSON(),
      lastSaveTime:      Date.now()
    };
  },

  fromJSON(data) {
    this.activeSquad       = data.activeSquad || [];
    this.campaignProgress  = data.campaignProgress || { regionCleared: 0, stageCleared: null };
    this.unlockedSystems   = new Set(data.unlockedSystems || []);
    this.lastSaveTime      = data.lastSaveTime || Date.now();
    if (data.currencies) CurrencyManager.fromJSON(data.currencies);
    if (data.heroes)     HeroManager.fromJSON(data.heroes);
    if (data.gear)       GearManager.fromJSON(data.gear);
    if (data.summon)     SummonManager.fromJSON(data.summon);
  }
};

export default GameState;

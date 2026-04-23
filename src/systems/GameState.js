import SaveManager from './SaveManager.js';
import CurrencyManager from './CurrencyManager.js';
import HeroManager, { HeroInstance } from './HeroManager.js';
import GearManager from './GearManager.js';
import SummonManager from './SummonManager.js';
import IdleManager from './IdleManager.js';
import EndlessTowerManager from './EndlessTowerManager.js';
import WorldBossManager from './WorldBossManager.js';
import ArenaManager from './ArenaManager.js';
import AffinityTowerManager from './AffinityTowerManager.js';
import DailyCodexManager from './DailyCodexManager.js';
import GuildManager from './GuildManager.js';
import GuildShopManager from './GuildShopManager.js';
import AcademyGroundsManager from './AcademyGroundsManager.js';
import AchievementManager from './AchievementManager.js';
import ElderTreeManager from './ElderTreeManager.js';
import HERO_DEFINITIONS from '../data/heroDefinitions.js';
import { CLASS_DEFAULTS, CURRENCY, FORMATION_ROW } from '../data/constants.js';

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
      IdleManager.processOffline(save.lastSaveTime, this.campaignProgress, this.activeSquad);
    } else {
      this._seedDefaults();
    }
  },

  _seedDefaults() {
    this.activeSquad      = [];
    this.campaignProgress = { regionCleared: 0, stageCleared: null };
    this.unlockedSystems  = new Set();
    this.lastSaveTime     = Date.now();
    // Starting currencies for early progression spend
    CurrencyManager.add(CURRENCY.CRYSTALS, 500);
    CurrencyManager.add(CURRENCY.PREMIUM_CRYSTALS, 300);
    // Grant starter hero
    const starterDef = HERO_DEFINITIONS.find(d => d.id === 'hero_kael');
    if (starterDef) {
      HeroManager.addHero(new HeroInstance({
        heroDefId: starterDef.id, name: starterDef.name, title: starterDef.title,
        heroClass: starterDef.heroClass, affinity: starterDef.affinity,
        rarity: starterDef.rarity, originRarity: starterDef.rarity,
        baseStats: starterDef.baseStats,
        normalAbilityIds: starterDef.normalAbilityIds,
        ultimateAbilityId: starterDef.ultimateAbilityId,
        ultimateAbilityId2: starterDef.ultimateAbilityId2 || null
      }));
    }
    this.save();
  },

  save() { SaveManager.save(this.toJSON()); },

  addUnlockedSystem(name) { this.unlockedSystems.add(name); this.save(); },
  isUnlocked(name)        { return this.unlockedSystems.has(name); },

  _normalizeSquadEntry(entry) {
    if (!entry) return null;
    const heroId = typeof entry === 'string' ? entry : entry.heroId;
    if (!heroId) return null;
    const hero = HeroManager.getHero(heroId);
    if (!hero) return null;
    const defaultRow = CLASS_DEFAULTS[hero.heroClass]?.defaultRow || FORMATION_ROW.FRONT;
    const rawRow = typeof entry === 'object' ? entry.row : null;
    const row = (rawRow === FORMATION_ROW.FRONT || rawRow === FORMATION_ROW.BACK)
      ? rawRow
      : defaultRow;
    return { heroId, row };
  },

  getActiveSquadEntries() {
    const normalized = (this.activeSquad || [])
      .map(entry => this._normalizeSquadEntry(entry))
      .filter(Boolean);
    const used = new Set();
    const rowCount = { FRONT: 0, BACK: 0 };
    const out = [];
    for (const entry of normalized) {
      if (used.has(entry.heroId)) continue;
      if (out.length >= 5) break;
      if (rowCount[entry.row] >= 3) continue;
      used.add(entry.heroId);
      rowCount[entry.row]++;
      out.push(entry);
    }
    return out;
  },

  setActiveSquad(entries) {
    this.activeSquad = entries;
    this.activeSquad = this.getActiveSquadEntries();
    this.save();
  },

  getBattleSquadEntries() {
    const valid = this.getActiveSquadEntries();
    if (valid.length) return valid;
    const heroes = HeroManager.getAllHeroes().slice().sort((a, b) => a.id.localeCompare(b.id));
    const fallback = [];
    const rowCount = { FRONT: 0, BACK: 0 };
    for (const hero of heroes) {
      if (fallback.length >= 5) break;
      const defaultRow = CLASS_DEFAULTS[hero.heroClass]?.defaultRow || FORMATION_ROW.FRONT;
      const row = rowCount[defaultRow] < 3
        ? defaultRow
        : (defaultRow === FORMATION_ROW.FRONT ? FORMATION_ROW.BACK : FORMATION_ROW.FRONT);
      if (rowCount[row] >= 3) continue;
      rowCount[row]++;
      fallback.push({ heroId: hero.id, row });
    }
    return fallback;
  },

  toJSON() {
    return {
      activeSquad:      this.activeSquad,
      campaignProgress: this.campaignProgress,
      unlockedSystems:  [...this.unlockedSystems],
      currencies:       CurrencyManager.toJSON(),
      heroes:           HeroManager.toJSON(),
      gear:             GearManager.toJSON(),
      summon:           SummonManager.toJSON(),
      endlessTower:     EndlessTowerManager.toJSON(),
      worldBoss:        WorldBossManager.toJSON(),
      arena:            ArenaManager.toJSON(),
      affinityTower:    AffinityTowerManager.toJSON(),
      dailyCodex:       DailyCodexManager.toJSON(),
      guild:            GuildManager.toJSON(),
      guildShop:        GuildShopManager.toJSON(),
      academyGrounds:   AcademyGroundsManager.toJSON(),
      achievements:     AchievementManager.toJSON(),
      elderTree:        ElderTreeManager.toJSON(),
      lastSaveTime:     Date.now()
    };
  },

  fromJSON(data) {
    this.activeSquad      = data.activeSquad      || [];
    this.campaignProgress = data.campaignProgress || { regionCleared: 0, stageCleared: null };
    this.unlockedSystems  = new Set(data.unlockedSystems || []);
    this.lastSaveTime     = data.lastSaveTime     || Date.now();
    // Achievements loaded first so hero/gear load checks don't re-trigger completed ones
    if (data.achievements) AchievementManager.fromJSON(data.achievements);
    if (data.currencies)   CurrencyManager.fromJSON(data.currencies);
    if (data.heroes)       HeroManager.fromJSON(data.heroes);
    if (data.gear)         GearManager.fromJSON(data.gear);
    if (data.summon)       SummonManager.fromJSON(data.summon);
    if (data.endlessTower) EndlessTowerManager.fromJSON(data.endlessTower);
    if (data.worldBoss)    WorldBossManager.fromJSON(data.worldBoss);
    if (data.arena)         ArenaManager.fromJSON(data.arena);
    if (data.affinityTower) AffinityTowerManager.fromJSON(data.affinityTower);
    if (data.dailyCodex)    DailyCodexManager.fromJSON(data.dailyCodex);
    if (data.guild)          GuildManager.fromJSON(data.guild);
    if (data.guildShop)      GuildShopManager.fromJSON(data.guildShop);
    if (data.academyGrounds) AcademyGroundsManager.fromJSON(data.academyGrounds);
    if (!data.achievements)  AchievementManager.fromJSON(null);
    if (data.elderTree)      ElderTreeManager.fromJSON(data.elderTree);
    // Migration: grant starter crystals to existing saves that lack them
    if (CurrencyManager.get(CURRENCY.CRYSTALS) === 0) {
      CurrencyManager.add(CURRENCY.CRYSTALS, 500);
    }
    if (CurrencyManager.get(CURRENCY.PREMIUM_CRYSTALS) === 0) {
      CurrencyManager.add(CURRENCY.PREMIUM_CRYSTALS, 300);
    }
    // Normalize squad after heroes are loaded so selected hero IDs resolve correctly.
    this.activeSquad = this.getActiveSquadEntries();
  }
};

export default GameState;

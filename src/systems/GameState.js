import SaveManager from './SaveManager.js';
import CurrencyManager from './CurrencyManager.js';
import IdleManager from './IdleManager.js';

const GameState = {
  heroRoster: [],
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
    this.heroRoster = [];
    this.activeSquad = [];
    this.campaignProgress = { regionCleared: 0, stageCleared: null };
    this.unlockedSystems = new Set();
    this.lastSaveTime = Date.now();
  },

  save() { SaveManager.save(this.toJSON()); },

  addUnlockedSystem(name) { this.unlockedSystems.add(name); this.save(); },

  isUnlocked(name) { return this.unlockedSystems.has(name); },

  toJSON() {
    return {
      heroRoster: this.heroRoster,
      activeSquad: this.activeSquad,
      campaignProgress: this.campaignProgress,
      unlockedSystems: [...this.unlockedSystems],
      currencies: CurrencyManager.toJSON(),
      lastSaveTime: Date.now()
    };
  },

  fromJSON(data) {
    this.heroRoster = data.heroRoster || [];
    this.activeSquad = data.activeSquad || [];
    this.campaignProgress = data.campaignProgress || { regionCleared: 0, stageCleared: null };
    this.unlockedSystems = new Set(data.unlockedSystems || []);
    this.lastSaveTime = data.lastSaveTime || Date.now();
    if (data.currencies) CurrencyManager.fromJSON(data.currencies);
  }
};

export default GameState;

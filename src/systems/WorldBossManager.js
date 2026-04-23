import AchievementManager from './AchievementManager.js';
import ElderTreeManager from './ElderTreeManager.js';

const TIER_CONFIG = {
  EASY: {
    label: 'Easy', colorHex: 0x44cc44, colorStr: '#44cc44',
    persistentHp: 10000, battleHp: 2000,
    defense: 10, damage: 18,
    rewardMult: 1.0
  },
  NORMAL: {
    label: 'Normal', colorHex: 0xffaa00, colorStr: '#ffaa00',
    persistentHp: 30000, battleHp: 4500,
    defense: 25, damage: 40,
    rewardMult: 2.5
  },
  HARD: {
    label: 'Hard', colorHex: 0xff3333, colorStr: '#ff3333',
    persistentHp: 80000, battleHp: 10000,
    defense: 50, damage: 85,
    rewardMult: 6.0
  },
};

const MAX_ATTEMPTS = 3;
const MILESTONE_PCTS = [0.25, 0.50, 0.75, 1.00];

const WorldBossManager = {
  tierState: {
    EASY:   { currentHp: 10000, highestDamage: 0, milestonesCleared: [] },
    NORMAL: { currentHp: 30000, highestDamage: 0, milestonesCleared: [] },
    HARD:   { currentHp: 80000, highestDamage: 0, milestonesCleared: [] },
  },
  attemptsUsed: 0,
  lastResetDate: null,
  lastBattleResult: null,

  _todayStr() {
    return new Date().toISOString().slice(0, 10);
  },

  _checkDailyReset() {
    const today = this._todayStr();
    if (this.lastResetDate !== today) {
      this.attemptsUsed = 0;
      this.lastResetDate = today;
    }
  },

  getAttemptsRemaining() {
    this._checkDailyReset();
    return Math.max(0, this.getMaxAttempts() - this.attemptsUsed);
  },

  getMaxAttempts() {
    return MAX_ATTEMPTS + ElderTreeManager.getWorldBossAttemptBonus();
  },

  canAttempt() {
    return this.getAttemptsRemaining() > 0;
  },

  getTierConfig(tierKey) {
    return TIER_CONFIG[tierKey];
  },

  generateBossSquad(tierKey) {
    const cfg = TIER_CONFIG[tierKey];
    return [{
      id: `wb_${tierKey.toLowerCase()}`,
      name: 'World Boss',
      heroClass: 'WARRIOR',
      affinity: 'SHADOW',
      range: 'melee',
      row: 'FRONT',
      stats: { hp: cfg.battleHp, defense: cfg.defense, damage: cfg.damage },
      abilityIds: ['wa_slash', 'wa_shield_bash'],
      ultimateAbilityId: 'wa_berserker_surge',
      ultimateCharge: 0,
    }];
  },

  getMilestoneReward(pct, tierKey) {
    const mult = TIER_CONFIG[tierKey].rewardMult;
    if (pct >= 1.00) return { gold: Math.floor(1000 * mult), crystals: Math.floor(30 * mult), shards: 3 };
    if (pct >= 0.75) return { gold: Math.floor(500  * mult), crystals: Math.floor(15 * mult) };
    if (pct >= 0.50) return { gold: Math.floor(250  * mult), crystals: Math.floor(8  * mult) };
    if (pct >= 0.25) return { gold: Math.floor(100  * mult), crystals: Math.floor(3  * mult) };
    return { gold: 0, crystals: 0 };
  },

  recordAttempt(tierKey, rawDamage) {
    this._checkDailyReset();
    this.attemptsUsed = Math.min(this.getMaxAttempts(), this.attemptsUsed + 1);

    const cfg   = TIER_CONFIG[tierKey];
    const state = this.tierState[tierKey];
    const damage = Math.min(rawDamage, cfg.battleHp);

    if (damage > state.highestDamage) state.highestDamage = damage;

    const prevHp = state.currentHp;
    state.currentHp = Math.max(0, state.currentHp - damage);

    const maxHp        = cfg.persistentHp;
    const prevDepleted = (maxHp - prevHp)            / maxHp;
    const newDepleted  = (maxHp - state.currentHp)   / maxHp;

    const newMilestones = [];
    for (const pct of MILESTONE_PCTS) {
      const mKey = String(pct);
      if (newDepleted >= pct && prevDepleted < pct && !state.milestonesCleared.includes(mKey)) {
        state.milestonesCleared.push(mKey);
        newMilestones.push(pct);
      }
    }

    const bossDefeated = state.currentHp <= 0;
    if (bossDefeated) {
      AchievementManager.checkWorldBossDefeated(tierKey);
      state.currentHp = maxHp;
      state.milestonesCleared = [];
    }

    const ratio    = Math.min(1, damage / cfg.battleHp);
    const gold     = Math.floor(150 * cfg.rewardMult * Math.max(ratio, 0.05));
    const crystals = Math.floor(5   * cfg.rewardMult * Math.max(ratio, 0.02));

    this.lastBattleResult = { tierKey, damageDealt: damage, reward: { gold, crystals }, newMilestones, bossDefeated };
    return this.lastBattleResult;
  },

  toJSON() {
    return {
      tierState:         this.tierState,
      attemptsUsed:      this.attemptsUsed,
      lastResetDate:     this.lastResetDate,
      lastBattleResult:  this.lastBattleResult,
    };
  },

  fromJSON(data) {
    if (!data) return;
    this.attemptsUsed     = data.attemptsUsed     || 0;
    this.lastResetDate    = data.lastResetDate     || null;
    this.lastBattleResult = data.lastBattleResult  || null;
    if (data.tierState) {
      for (const key of Object.keys(TIER_CONFIG)) {
        if (data.tierState[key]) {
          this.tierState[key] = { ...this.tierState[key], ...data.tierState[key] };
        }
      }
    }
  },
};

export { TIER_CONFIG, MAX_ATTEMPTS };
export default WorldBossManager;

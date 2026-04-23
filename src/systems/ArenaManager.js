import HERO_DEFINITIONS from '../data/heroDefinitions.js';
import { CLASS_DEFAULTS } from '../data/constants.js';
import AchievementManager from './AchievementManager.js';
import ElderTreeManager from './ElderTreeManager.js';

export const RANK_TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

export const RANK_CONFIG = {
  BRONZE:   { label: 'Bronze',   colorStr: '#cd7f32', statMult: 1.0,  tokenWin: 30,  tokenLoss: 5  },
  SILVER:   { label: 'Silver',   colorStr: '#c0c0c0', statMult: 1.5,  tokenWin: 50,  tokenLoss: 8  },
  GOLD:     { label: 'Gold',     colorStr: '#ffd700', statMult: 2.2,  tokenWin: 80,  tokenLoss: 12 },
  PLATINUM: { label: 'Platinum', colorStr: '#00ffcc', statMult: 3.0,  tokenWin: 120, tokenLoss: 18 },
  DIAMOND:  { label: 'Diamond',  colorStr: '#88ddff', statMult: 4.0,  tokenWin: 180, tokenLoss: 25 },
};

export const MAX_ATTEMPTS = 5;

const OPPONENT_NAMES = [
  'Stormcaller', 'Ironclad', 'Shadowbane', 'Flamewielder', 'Frostmancer',
  'Earthshaker', 'Voidwalker', 'Lightshard', 'Ashenblood', 'Crystalthorn',
  'Runehunter', 'Duskblade', 'Thornwall', 'Emberveil', 'Glacialheart',
];

const ArenaManager = {
  rank: 0,
  attemptsRemaining: MAX_ATTEMPTS,
  lastResetDate: null,
  battleHistory: [],
  _cachedOpponents: null,
  _cachedForRank: -1,

  _todayStr() {
    return new Date().toISOString().slice(0, 10);
  },

  _checkDailyReset() {
    const today = this._todayStr();
    if (this.lastResetDate !== today) {
      this.attemptsRemaining = MAX_ATTEMPTS + ElderTreeManager.getArenaAttemptBonus();
      this.lastResetDate = today;
      this._cachedOpponents = null;
    }
  },

  getRankName() {
    return RANK_TIERS[this.rank];
  },

  getRankConfig() {
    return RANK_CONFIG[this.getRankName()];
  },

  getAttemptsRemaining() {
    this._checkDailyReset();
    return this.attemptsRemaining;
  },

  getMaxAttempts() {
    return MAX_ATTEMPTS + ElderTreeManager.getArenaAttemptBonus();
  },

  canAttempt() {
    return this.getAttemptsRemaining() > 0;
  },

  getOpponents() {
    this._checkDailyReset();
    if (!this._cachedOpponents || this._cachedForRank !== this.rank) {
      this._cachedOpponents = this._generateOpponents();
      this._cachedForRank = this.rank;
    }
    return this._cachedOpponents;
  },

  _generateOpponents() {
    const count = 3 + Math.floor(Math.random() * 3);
    const opponents = [];
    const usedNames = new Set();
    const minRank = Math.max(0, this.rank - 2);
    const maxRank = Math.min(RANK_TIERS.length - 1, this.rank + 2);

    for (let i = 0; i < count; i++) {
      const opRank = minRank + Math.floor(Math.random() * (maxRank - minRank + 1));
      let name;
      let tries = 0;
      do {
        name = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)];
        tries++;
      } while (usedNames.has(name) && tries < OPPONENT_NAMES.length);
      usedNames.add(name);

      const diff = opRank > this.rank ? 'hard' : opRank < this.rank ? 'easy' : 'even';
      opponents.push({
        id: 'arena_opp_' + i,
        name,
        rankIndex: opRank,
        rankName: RANK_TIERS[opRank],
        squad: this._generateSquad(opRank, i),
        difficulty: diff,
      });
    }
    return opponents;
  },

  _generateSquad(rankIndex, oppIndex) {
    const mult = Object.values(RANK_CONFIG)[rankIndex].statMult;
    const heroCount = 2 + Math.floor(Math.random() * 2);
    const defs = [...HERO_DEFINITIONS].sort(() => Math.random() - 0.5).slice(0, heroCount);
    return defs.map((def, j) => {
      const row = CLASS_DEFAULTS[def.heroClass]?.defaultRow || 'FRONT';
      return {
        id: `arena_h${oppIndex}_${j}`,
        name: def.name,
        heroClass: def.heroClass,
        affinity: def.affinity,
        range: row === 'BACK' ? 'ranged' : 'melee',
        row,
        stats: {
          hp:      Math.floor(def.baseStats.hp      * mult),
          defense: Math.floor(def.baseStats.defense * mult),
          damage:  Math.floor(def.baseStats.damage  * mult),
        },
        abilityIds: def.normalAbilityIds,
        ultimateAbilityId: def.ultimateAbilityId,
        ultimateCharge: 0,
      };
    });
  },

  recordBattle(opponentId, playerWon) {
    this._checkDailyReset();
    const opp = this._cachedOpponents?.find(o => o.id === opponentId);
    const rankCfg = this.getRankConfig();

    this.attemptsRemaining = Math.max(0, this.attemptsRemaining - 1);

    const prevRank = this.rank;
    if (playerWon) {
      this.rank = Math.min(RANK_TIERS.length - 1, this.rank + 1);
      AchievementManager.checkArenaWin();
    } else {
      this.rank = Math.max(0, this.rank - 1);
    }
    const rankChange = this.rank - prevRank;
    const tokenReward = playerWon ? rankCfg.tokenWin : rankCfg.tokenLoss;

    const entry = {
      opponentName: opp?.name || 'Unknown',
      result: playerWon ? 'WIN' : 'LOSS',
      rankChange,
      tokens: tokenReward,
    };
    this.battleHistory.unshift(entry);
    if (this.battleHistory.length > 3) this.battleHistory.pop();
    this._cachedOpponents = null;

    return entry;
  },

  toJSON() {
    return {
      rank:              this.rank,
      attemptsRemaining: this.attemptsRemaining,
      lastResetDate:     this.lastResetDate,
      battleHistory:     this.battleHistory,
    };
  },

  fromJSON(data) {
    if (!data) return;
    this.rank              = data.rank              ?? 0;
    this.attemptsRemaining = data.attemptsRemaining ?? MAX_ATTEMPTS;
    this.lastResetDate     = data.lastResetDate     || null;
    this.battleHistory     = data.battleHistory     || [];
  },
};

export default ArenaManager;

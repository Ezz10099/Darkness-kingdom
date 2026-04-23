import CurrencyManager from './CurrencyManager.js';
import { CURRENCY } from '../data/constants.js';
import AchievementManager from './AchievementManager.js';
import ElderTreeManager from './ElderTreeManager.js';

export const GUILD_CREATION_COST = 5000;
export const MAX_MEMBERS = 30;
export const ATTACKS_PER_DAY = 3;
export const BASE_ATTACK_COOLDOWN_SECS = 30 * 60;

export const BOSS_TIERS = [
  { tier: 1, label: 'Tier I',   bossHp: 10000,  battleHp: 2000,  defense: 8,  damage: 15,  coinsPerKill: 50  },
  { tier: 2, label: 'Tier II',  bossHp: 25000,  battleHp: 4000,  defense: 18, damage: 30,  coinsPerKill: 120 },
  { tier: 3, label: 'Tier III', bossHp: 60000,  battleHp: 8000,  defense: 30, damage: 50,  coinsPerKill: 280 },
  { tier: 4, label: 'Tier IV',  bossHp: 150000, battleHp: 15000, defense: 50, damage: 80,  coinsPerKill: 600 },
  { tier: 5, label: 'Tier V',   bossHp: 400000, battleHp: 30000, defense: 80, damage: 120, coinsPerKill: 1200 },
];

// XP needed to advance from level N to N+1
export const GUILD_XP_TABLE = [
  0,       // unused (index 0)
  1000,    // 1→2
  2500,    // 2→3
  5000,    // 3→4
  8000,    // 4→5
  15000,   // 5→6
  25000,   // 6→7
  40000,   // 7→8
  60000,   // 8→9
  90000,   // 9→10
  130000,  // 10→11
  180000,  // 11→12
  250000,  // 12→13
  350000,  // 13→14
  500000,  // 14→15
  700000,  // 15→16
  1000000, // 16→17
  1400000, // 17→18
  2000000, // 18→19
  3000000, // 19→20
  4500000, // 20→21
  7000000, // 21→22
  10000000,// 22→23
  15000000,// 23→24
  20000000,// 24→25
  30000000,// 25→26
  45000000,// 26→27
  65000000,// 27→28
  100000000,// 28→29
  150000000,// 29→30
];

export const LEVEL_PERKS = {
  5:  'Boss Tier II unlocked',
  10: 'Boss Tier III unlocked',
  20: 'Boss Tier IV unlocked',
  30: 'Boss Tier V unlocked',
};

const OPEN_GUILDS = [
  { name: 'Arcane Order',    level: 7,  memberCount: 18 },
  { name: 'Shadow Pact',     level: 4,  memberCount: 12 },
  { name: 'Crystal Vanguard',level: 11, memberCount: 25 },
  { name: 'Iron Phoenix',    level: 3,  memberCount: 8  },
  { name: 'Ember Watch',     level: 6,  memberCount: 20 },
];

const GuildManager = {
  guild: null,
  bossState: {
    currentHp:     BOSS_TIERS[0].bossHp,
    tierIndex:     0,
    attacksUsed:   0,
    lastAttackAt:  0,
    lastResetDate: null,
    lastResult:    null,
  },

  _todayStr() { return new Date().toISOString().slice(0, 10); },

  _checkDailyReset() {
    const today = this._todayStr();
    if (this.bossState.lastResetDate !== today) {
      this.bossState.attacksUsed = 0;
      this.bossState.lastAttackAt = 0;
      this.bossState.lastResetDate = today;
    }
  },

  hasGuild() { return this.guild !== null; },

  getOpenGuilds() { return OPEN_GUILDS; },

  createGuild(name) {
    if (this.guild) return { ok: false, reason: 'Already in a guild' };
    const trimmed = (name || '').trim();
    if (trimmed.length < 3) return { ok: false, reason: 'Name must be 3+ characters' };
    if (!CurrencyManager.spend(CURRENCY.GOLD, GUILD_CREATION_COST))
      return { ok: false, reason: 'Need ' + GUILD_CREATION_COST.toLocaleString() + ' Gold' };
    this.guild = { name: trimmed, level: 1, xp: 0, memberCount: 1, isOwner: true };
    AchievementManager.checkGuildJoined();
    return { ok: true };
  },

  joinGuild(guildName, level, memberCount) {
    if (this.guild) return { ok: false, reason: 'Already in a guild' };
    this.guild = { name: guildName, level: level || 1, xp: 0, memberCount: (memberCount || 5) + 1, isOwner: false };
    AchievementManager.checkGuildJoined();
    return { ok: true };
  },

  leaveGuild() { this.guild = null; },

  getLevel()  { return this.guild ? this.guild.level : 0; },
  getXP()     { return this.guild ? this.guild.xp    : 0; },

  getXPToNextLevel() {
    if (!this.guild || this.guild.level >= 30) return Infinity;
    return GUILD_XP_TABLE[this.guild.level] || Infinity;
  },

  _addXP(amount) {
    if (!this.guild || this.guild.level >= 30) return;
    this.guild.xp += amount;
    while (this.guild.level < 30) {
      const needed = GUILD_XP_TABLE[this.guild.level];
      if (!needed || this.guild.xp < needed) break;
      this.guild.xp -= needed;
      this.guild.level++;
      AchievementManager.checkGuildLevel(this.guild.level);
    }
  },

  // +1% Guild Coin earnings per guild level
  getCoinBonus() { return this.guild ? this.guild.level / 100 : 0; },

  getMaxUnlockedTierIndex() {
    if (!this.guild) return 0;
    const lv = this.guild.level;
    if (lv >= 30) return 4;
    if (lv >= 20) return 3;
    if (lv >= 10) return 2;
    if (lv >= 5)  return 1;
    return 0;
  },

  getCurrentTierConfig() { return BOSS_TIERS[this.bossState.tierIndex]; },

  getAttacksRemaining() {
    this._checkDailyReset();
    return Math.max(0, ATTACKS_PER_DAY - this.bossState.attacksUsed);
  },

  getAttackCooldownSecs() {
    return Math.floor(BASE_ATTACK_COOLDOWN_SECS * ElderTreeManager.getGuildCooldownMult());
  },

  getCooldownRemainingSecs(nowMs = Date.now()) {
    this._checkDailyReset();
    if (!this.bossState.lastAttackAt || this.getAttacksRemaining() <= 0) return 0;
    const elapsed = (nowMs - this.bossState.lastAttackAt) / 1000;
    return Math.max(0, Math.ceil(this.getAttackCooldownSecs() - elapsed));
  },

  canAttackNow(nowMs = Date.now()) {
    return this.getAttacksRemaining() > 0 && this.getCooldownRemainingSecs(nowMs) <= 0;
  },

  generateBossSquad() {
    const cfg = this.getCurrentTierConfig();
    return [{
      id:               `gb_t${cfg.tier}`,
      name:             'Guild Boss',
      heroClass:        'WARRIOR',
      affinity:         'SHADOW',
      range:            'melee',
      row:              'FRONT',
      stats:            { hp: cfg.battleHp, defense: cfg.defense, damage: cfg.damage },
      abilityIds:       ['wa_slash', 'wa_shield_bash'],
      ultimateAbilityId:'wa_berserker_surge',
      ultimateCharge:   0,
    }];
  },

  recordAttack(rawDamage) {
    this._checkDailyReset();
    this.bossState.attacksUsed = Math.min(ATTACKS_PER_DAY, this.bossState.attacksUsed + 1);
    this.bossState.lastAttackAt = Date.now();

    const cfg    = this.getCurrentTierConfig();
    const damage = Math.min(rawDamage, cfg.battleHp);

    this.bossState.currentHp = Math.max(0, this.bossState.currentHp - damage);

    const bossDefeated = this.bossState.currentHp <= 0;
    let tierAdvanced   = false;

    const xpGained    = Math.max(1, Math.floor((damage / cfg.bossHp) * 1000 * cfg.tier));
    const coinMult    = (1 + this.getCoinBonus()) * ElderTreeManager.getGuildCoinMult();
    const coinsEarned = Math.max(1, Math.floor((damage / cfg.battleHp) * cfg.coinsPerKill * coinMult));

    if (bossDefeated) {
      const maxTier = this.getMaxUnlockedTierIndex();
      if (this.bossState.tierIndex < maxTier) {
        this.bossState.tierIndex++;
        tierAdvanced = true;
      }
      this.bossState.currentHp = BOSS_TIERS[this.bossState.tierIndex].bossHp;
    }

    this._addXP(xpGained);
    CurrencyManager.add(CURRENCY.GUILD_COINS, coinsEarned);

    AchievementManager.checkGuildBossAttack(rawDamage);
    this.bossState.lastResult = { damage, bossDefeated, tierAdvanced, xpGained, coinsEarned };
    return this.bossState.lastResult;
  },

  toJSON() {
    return {
      guild: this.guild,
      bossState: {
        currentHp:     this.bossState.currentHp,
        tierIndex:     this.bossState.tierIndex,
        attacksUsed:   this.bossState.attacksUsed,
        lastAttackAt:  this.bossState.lastAttackAt,
        lastResetDate: this.bossState.lastResetDate,
        lastResult:    this.bossState.lastResult,
      },
    };
  },

  fromJSON(data) {
    if (!data) return;
    this.guild = data.guild || null;
    if (data.bossState) {
      this.bossState = {
        currentHp:     data.bossState.currentHp     ?? BOSS_TIERS[0].bossHp,
        tierIndex:     data.bossState.tierIndex      ?? 0,
        attacksUsed:   data.bossState.attacksUsed    ?? 0,
        lastAttackAt:  data.bossState.lastAttackAt   ?? 0,
        lastResetDate: data.bossState.lastResetDate  ?? null,
        lastResult:    data.bossState.lastResult     ?? null,
      };
    }
  },
};

export default GuildManager;

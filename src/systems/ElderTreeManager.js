import CurrencyManager from './CurrencyManager.js';
import { CURRENCY } from '../data/constants.js';
import AchievementManager from './AchievementManager.js';

export const TREE_NODES = [
  // Economy Branch (Layer 1)
  {
    id: 'eco_1', label: 'E1 • Gold Harvest I', section: 'ECONOMY',
    desc: '+10% Gold from all sources',
    cost: 2000, requires: null,
  },
  {
    id: 'eco_2', label: 'E2 • Gold Harvest II', section: 'ECONOMY',
    desc: '+20% Gold from all sources',
    cost: 5000, requires: 'eco_1',
  },
  {
    id: 'eco_3', label: 'E3 • Resonance Study', section: 'ECONOMY',
    desc: '+30% Awakening Shard drop rate',
    cost: 8000, requires: 'eco_2',
  },
  {
    id: 'eco_4', label: 'E4 • Forgemaster', section: 'ECONOMY',
    desc: 'Reduced Gear upgrade cost -15%',
    cost: 12000, requires: 'eco_3',
  },
  {
    id: 'eco_5', label: 'E5 • Codex Insight', section: 'ECONOMY',
    desc: '+15% Daily Codex chest quality',
    cost: 18000, requires: 'eco_4',
  },
  {
    id: 'eco_6', label: 'E6 • Swift Advance', section: 'ECONOMY',
    desc: 'Reduced stage skip cost -20%',
    cost: 25000, requires: 'eco_5',
  },
  {
    id: 'eco_7', label: 'E7 • Deep Roots I', section: 'ECONOMY',
    desc: 'Idle cap: 16h → 22h',
    cost: 35000, requires: 'eco_6',
  },
  {
    id: 'eco_8', label: 'E8 • Deep Roots II', section: 'ECONOMY',
    desc: 'Idle cap: 22h → 28h',
    cost: 55000, requires: 'eco_7',
  },
  {
    id: 'eco_9', label: 'E9 • Deep Roots III', section: 'ECONOMY',
    desc: 'Idle cap: 28h → 35h',
    cost: 80000, requires: 'eco_8',
  },
  {
    id: 'eco_10', label: 'E10 • Deep Roots IV', section: 'ECONOMY',
    desc: 'Idle cap: 35h → 45h (hard cap)',
    cost: 120000, requires: 'eco_9',
  },
  // War Council branch (mid-game progression quality-of-life)
  {
    id: 'war_council_arena_attempt', label: 'A1 • War Council', section: 'WAR_COUNCIL',
    desc: '+1 Arena attempt per day',
    cost: 30000, requires: null,
  },
  {
    id: 'war_council_training', label: 'A2 • Lecture Cycle', section: 'WAR_COUNCIL',
    desc: '+25% Reserve Training passive XP rate',
    cost: 45000, requires: 'war_council_arena_attempt',
  },
  {
    id: 'war_council_guild_cooldown', label: 'A3 • Raid Logistics', section: 'WAR_COUNCIL',
    desc: 'Guild Boss attack cooldown -30 min',
    cost: 60000, requires: 'war_council_training',
  },
  {
    id: 'war_council_guild_coin', label: 'A4 • Guild Diplomacy', section: 'WAR_COUNCIL',
    desc: '+20% Guild Coin earnings',
    cost: 80000, requires: 'war_council_guild_cooldown',
  },
  {
    id: 'war_council_wishlist_slot', label: 'A5 • Curator Privilege', section: 'WAR_COUNCIL',
    desc: '+1 Wishlist slot',
    cost: 100000, requires: 'war_council_guild_coin',
  },
  {
    id: 'war_council_world_boss_attempt', label: 'A6 • Rift Study', section: 'WAR_COUNCIL',
    desc: '+1 World Boss attempt per day',
    cost: 150000, requires: 'war_council_wishlist_slot',
  },
];

const ElderTreeManager = {
  _purchased: new Set(),

  getAll()        { return TREE_NODES; },
  isPurchased(id) { return this._purchased.has(id); },

  canPurchase(id) {
    const node = TREE_NODES.find(n => n.id === id);
    if (!node || this._purchased.has(id)) return false;
    if (node.section === 'WAR_COUNCIL' && !this.isWarCouncilUnlocked()) return false;
    if (node.requires && !this._purchased.has(node.requires)) return false;
    return CurrencyManager.get(CURRENCY.GOLD) >= node.cost;
  },

  purchase(id) {
    const node = TREE_NODES.find(n => n.id === id);
    if (!node || this._purchased.has(id)) return false;
    if (node.section === 'WAR_COUNCIL' && !this.isWarCouncilUnlocked()) return false;
    if (node.requires && !this._purchased.has(node.requires)) return false;
    if (!CurrencyManager.spend(CURRENCY.GOLD, node.cost)) return false;
    this._purchased.add(id);
    return true;
  },

  isWarCouncilUnlocked() {
    return AchievementManager.isCompleted('prog_region_3');
  },

  // ── Bonus getters ─────────────────────────────────────────────────────────

  getGoldBonus() {
    if (this._purchased.has('eco_2')) return 0.20;
    if (this._purchased.has('eco_1')) return 0.10;
    return 0;
  },

  getShardBonus() {
    return this._purchased.has('eco_3') ? 0.30 : 0;
  },

  getGearCostMult() {
    return this._purchased.has('eco_4') ? 0.85 : 1;
  },

  getCodexQualityBonus() {
    return this._purchased.has('eco_5') ? 0.15 : 0;
  },

  getSkipCostMult() {
    return this._purchased.has('eco_6') ? 0.80 : 1;
  },

  getIdleCapSecs() {
    if (this._purchased.has('eco_10')) return 45 * 3600;
    if (this._purchased.has('eco_9')) return 35 * 3600;
    if (this._purchased.has('eco_8')) return 28 * 3600;
    if (this._purchased.has('eco_7')) return 22 * 3600;
    return 16 * 3600;
  },

  getArenaAttemptBonus() {
    return this._purchased.has('war_council_arena_attempt') ? 1 : 0;
  },

  getReserveTrainingXpMult() {
    return this._purchased.has('war_council_training') ? 1.25 : 1;
  },

  getGuildCoinMult() {
    return this._purchased.has('war_council_guild_coin') ? 1.20 : 1;
  },

  getGuildCooldownMult() {
    return this._purchased.has('war_council_guild_cooldown') ? 0 : 1;
  },

  getWishlistMaxSizeBonus() {
    return this._purchased.has('war_council_wishlist_slot') ? 1 : 0;
  },

  getWorldBossAttemptBonus() {
    return this._purchased.has('war_council_world_boss_attempt') ? 1 : 0;
  },

  toJSON()  { return { purchased: [...this._purchased] }; },
  fromJSON(data) {
    if (!data) return;
    const migrated = new Set(data.purchased || []);
    const legacyToNew = [
      ['eco_gold', 'eco_1'],
      ['eco_shard', 'eco_3'],
      ['eco_codex', 'eco_5'],
      ['eco_gear_1', 'eco_4'],
      ['eco_gear_2', 'eco_4'],
      ['eco_gear_3', 'eco_4'],
      ['eco_skip_1', 'eco_6'],
      ['eco_skip_2', 'eco_6'],
      ['eco_idle_1', 'eco_7'],
      ['eco_idle_2', 'eco_8'],
      ['eco_idle_3', 'eco_9'],
      ['eco_idle_4', 'eco_10'],
      ['academy_arena_attempt', 'war_council_arena_attempt'],
      ['academy_training', 'war_council_training'],
      ['academy_guild_cooldown', 'war_council_guild_cooldown'],
      ['academy_guild_coin', 'war_council_guild_coin'],
      ['academy_wishlist_slot', 'war_council_wishlist_slot'],
      ['academy_world_boss_attempt', 'war_council_world_boss_attempt'],
      ['academy_training_1', 'war_council_training'],
      ['academy_training_2', 'war_council_training']
    ];
    legacyToNew.forEach(([oldId, newId]) => {
      if (migrated.has(oldId)) migrated.add(newId);
    });
    this._purchased = new Set(
      [...migrated].filter(id => TREE_NODES.some(n => n.id === id))
    );
  },
};

export default ElderTreeManager;

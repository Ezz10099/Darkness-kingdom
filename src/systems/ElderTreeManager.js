import CurrencyManager from './CurrencyManager.js';
import { CURRENCY } from '../data/constants.js';

export const TREE_NODES = [
  // Economy (no prerequisites)
  {
    id: 'eco_gold',   label: 'Gold Harvest',     section: 'ECONOMY',
    desc: '+10% Gold from all sources',
    cost: 10000, requires: null,
  },
  {
    id: 'eco_shard',  label: 'Shard Flow',        section: 'ECONOMY',
    desc: '+15% Awakening Shard drops',
    cost: 25000, requires: null,
  },
  {
    id: 'eco_codex',  label: 'Codex Insight',     section: 'ECONOMY',
    desc: '+5% Daily Codex reward quality',
    cost: 15000, requires: null,
  },
  // Gear cost chain
  {
    id: 'eco_gear_1', label: 'Forge Mastery I',   section: 'GEAR COSTS',
    desc: '-5% Gear upgrade cost',
    cost: 20000, requires: null,
  },
  {
    id: 'eco_gear_2', label: 'Forge Mastery II',  section: 'GEAR COSTS',
    desc: '-5% Gear upgrade cost (total -10%)',
    cost: 40000, requires: 'eco_gear_1',
  },
  {
    id: 'eco_gear_3', label: 'Forge Mastery III', section: 'GEAR COSTS',
    desc: '-5% Gear upgrade cost (total -15%)',
    cost: 70000, requires: 'eco_gear_2',
  },
  // Stage skip chain
  {
    id: 'eco_skip_1', label: 'Swift Advance I',   section: 'CAMPAIGN',
    desc: '-10% stage skip cost',
    cost: 12000, requires: null,
  },
  {
    id: 'eco_skip_2', label: 'Swift Advance II',  section: 'CAMPAIGN',
    desc: '-10% stage skip cost (total -20%)',
    cost: 30000, requires: 'eco_skip_1',
  },
  // Idle cap chain (base: 16 h)
  {
    id: 'eco_idle_1', label: 'Deep Roots I',      section: 'IDLE CAP',
    desc: 'Offline cap: 16h \u2192 22h',
    cost: 18000, requires: null,
  },
  {
    id: 'eco_idle_2', label: 'Deep Roots II',     section: 'IDLE CAP',
    desc: 'Offline cap: 22h \u2192 28h',
    cost: 35000, requires: 'eco_idle_1',
  },
  {
    id: 'eco_idle_3', label: 'Deep Roots III',    section: 'IDLE CAP',
    desc: 'Offline cap: 28h \u2192 35h',
    cost: 60000, requires: 'eco_idle_2',
  },
  {
    id: 'eco_idle_4', label: 'Deep Roots IV',     section: 'IDLE CAP',
    desc: 'Offline cap: 35h \u2192 45h',
    cost: 90000, requires: 'eco_idle_3',
  },
  // Academy branch (mid-game progression quality-of-life)
  {
    id: 'academy_arena_attempt', label: 'War Council', section: 'ACADEMY',
    desc: '+1 Arena attempt per day',
    cost: 85000, requires: null,
  },
  {
    id: 'academy_training_1', label: 'Lecture Cycle I', section: 'ACADEMY',
    desc: '+10% Academy Grounds passive XP rate',
    cost: 60000, requires: null,
  },
  {
    id: 'academy_training_2', label: 'Lecture Cycle II', section: 'ACADEMY',
    desc: '+10% Academy Grounds passive XP rate (total +20%)',
    cost: 110000, requires: 'academy_training_1',
  },
  {
    id: 'academy_guild_coin', label: 'Guild Diplomacy', section: 'ACADEMY',
    desc: '+10% Guild Coin earnings',
    cost: 95000, requires: null,
  },
  {
    id: 'academy_guild_cooldown', label: 'Raid Logistics', section: 'ACADEMY',
    desc: 'Guild Boss attack cooldown reduced',
    cost: 125000, requires: null,
  },
  {
    id: 'academy_wishlist_slot', label: 'Curator Privilege', section: 'ACADEMY',
    desc: '+1 Wishlist slot',
    cost: 120000, requires: null,
  },
  {
    id: 'academy_world_boss_attempt', label: 'Rift Study', section: 'ACADEMY',
    desc: '+1 World Boss attempt per day',
    cost: 180000, requires: 'academy_training_2',
  },
];

const ElderTreeManager = {
  _purchased: new Set(),

  getAll()        { return TREE_NODES; },
  isPurchased(id) { return this._purchased.has(id); },

  canPurchase(id) {
    const node = TREE_NODES.find(n => n.id === id);
    if (!node || this._purchased.has(id)) return false;
    if (node.requires && !this._purchased.has(node.requires)) return false;
    return CurrencyManager.get(CURRENCY.GOLD) >= node.cost;
  },

  purchase(id) {
    const node = TREE_NODES.find(n => n.id === id);
    if (!node || this._purchased.has(id)) return false;
    if (node.requires && !this._purchased.has(node.requires)) return false;
    if (!CurrencyManager.spend(CURRENCY.GOLD, node.cost)) return false;
    this._purchased.add(id);
    return true;
  },

  // ── Bonus getters ─────────────────────────────────────────────────────────

  getGoldBonus() {
    return this._purchased.has('eco_gold') ? 0.10 : 0;
  },

  getShardBonus() {
    return this._purchased.has('eco_shard') ? 0.15 : 0;
  },

  getGearCostMult() {
    let disc = 0;
    if (this._purchased.has('eco_gear_1')) disc += 0.05;
    if (this._purchased.has('eco_gear_2')) disc += 0.05;
    if (this._purchased.has('eco_gear_3')) disc += 0.05;
    return 1 - disc;
  },

  getCodexQualityBonus() {
    return this._purchased.has('eco_codex') ? 0.05 : 0;
  },

  getSkipCostMult() {
    let disc = 0;
    if (this._purchased.has('eco_skip_1')) disc += 0.10;
    if (this._purchased.has('eco_skip_2')) disc += 0.10;
    return 1 - disc;
  },

  getIdleCapSecs() {
    if (this._purchased.has('eco_idle_4')) return 45 * 3600;
    if (this._purchased.has('eco_idle_3')) return 35 * 3600;
    if (this._purchased.has('eco_idle_2')) return 28 * 3600;
    if (this._purchased.has('eco_idle_1')) return 22 * 3600;
    return 16 * 3600;
  },

  getArenaAttemptBonus() {
    return this._purchased.has('academy_arena_attempt') ? 1 : 0;
  },

  getAcademyXpMult() {
    let bonus = 0;
    if (this._purchased.has('academy_training_1')) bonus += 0.10;
    if (this._purchased.has('academy_training_2')) bonus += 0.10;
    return 1 + bonus;
  },

  getGuildCoinMult() {
    return this._purchased.has('academy_guild_coin') ? 1.10 : 1;
  },

  getGuildCooldownMult() {
    return this._purchased.has('academy_guild_cooldown') ? 0.67 : 1;
  },

  getWishlistMaxSizeBonus() {
    return this._purchased.has('academy_wishlist_slot') ? 1 : 0;
  },

  getWorldBossAttemptBonus() {
    return this._purchased.has('academy_world_boss_attempt') ? 1 : 0;
  },

  toJSON()  { return { purchased: [...this._purchased] }; },
  fromJSON(data) {
    if (!data) return;
    this._purchased = new Set(data.purchased || []);
  },
};

export default ElderTreeManager;

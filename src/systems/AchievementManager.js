import CurrencyManager from './CurrencyManager.js';
import { CURRENCY } from '../data/constants.js';

export const ACHIEVEMENTS = [
  // Progression
  { id: 'prog_first_hero',      label: 'First Steps',        desc: 'Summon your first hero',                          category: 'Progression', reward: 10  },
  { id: 'prog_first_legendary', label: 'Legendary Find',     desc: 'Pull a Legendary rarity hero',                    category: 'Progression', reward: 30  },
  { id: 'prog_first_ascended',  label: 'Ascension',          desc: 'Ascend a hero for the first time',                category: 'Progression', reward: 100 },
  { id: 'prog_region_3',        label: 'Explorer',           desc: 'Reach Region 3 in Campaign',                      category: 'Progression', reward: 50  },
  { id: 'prog_region_5',        label: 'Conqueror',          desc: 'Reach Region 5 in Campaign',                      category: 'Progression', reward: 100 },
  { id: 'prog_endless_100',     label: 'Tower Marathon',     desc: 'Clear 100 Endless Tower floors',                  category: 'Progression', reward: 80  },
  { id: 'prog_affinity_50',     label: 'Affinity Pioneer',   desc: 'Clear Floor 50 in any Affinity Tower',            category: 'Progression', reward: 60  },
  // Collection
  { id: 'col_10_heroes',        label: 'Collector I',        desc: 'Own 10 heroes',                                   category: 'Collection',  reward: 20  },
  { id: 'col_25_heroes',        label: 'Collector II',       desc: 'Own 25 heroes',                                   category: 'Collection',  reward: 40  },
  { id: 'col_50_heroes',        label: 'Collector III',      desc: 'Own 50 heroes',                                   category: 'Collection',  reward: 80  },
  { id: 'col_full_affinity',    label: 'Affinity Roster',    desc: 'Complete a full affinity roster',                 category: 'Collection',  reward: 60  },
  { id: 'col_full_class',       label: 'Class Master',       desc: 'Own one hero of every class',                     category: 'Collection',  reward: 60  },
  // Combat
  { id: 'com_arena_10',         label: 'Arena Veteran',      desc: 'Win 10 Arena matches',                            category: 'Combat',      reward: 30  },
  { id: 'com_world_boss_hard',  label: 'Boss Slayer',        desc: 'Defeat the World Boss on Hard',                   category: 'Combat',      reward: 50  },
  { id: 'com_guild_1m',         label: 'Megaton Strike',     desc: 'Deal 1,000,000+ damage in one Guild Boss attack', category: 'Combat',      reward: 50  },
  // Gear
  { id: 'gear_full_set',        label: 'Fully Equipped',     desc: 'Equip all 5 gear slots on one hero',              category: 'Gear',        reward: 20  },
  { id: 'gear_legendary',       label: 'Legendary Armament', desc: 'Obtain a Legendary gear piece',                   category: 'Gear',        reward: 40  },
  { id: 'gear_mythic',          label: 'Mythic Armament',    desc: 'Obtain a Mythic gear piece',                      category: 'Gear',        reward: 80  },
  // Social
  { id: 'soc_join_guild',       label: 'Guild Member',       desc: 'Join or create a guild',                          category: 'Social',      reward: 10  },
  { id: 'soc_guild_boss_10',    label: 'Guild Veteran',      desc: 'Participate in 10 Guild Boss attacks',            category: 'Social',      reward: 20  },
  { id: 'soc_guild_level_10',   label: 'Guild Champion',     desc: 'Reach Guild Level 10',                            category: 'Social',      reward: 50  },
];

const AchievementManager = {
  _completed:      new Set(),
  _progress:       { arenaWins: 0, guildBossAttacks: 0 },
  _pendingUnlocks: [],

  getAll()        { return ACHIEVEMENTS; },
  isCompleted(id) { return this._completed.has(id); },

  consumeUnlocks() {
    const pending = [...this._pendingUnlocks];
    this._pendingUnlocks = [];
    return pending;
  },

  _complete(id) {
    if (this._completed.has(id)) return;
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return;
    this._completed.add(id);
    CurrencyManager.add(CURRENCY.PREMIUM_CRYSTALS, def.reward);
    this._pendingUnlocks.push(def);
  },

  // heroes = HeroManager.getAllHeroes() passed in to avoid circular import
  checkHeroAdded(heroes) {
    if (heroes.length >= 1)  this._complete('prog_first_hero');
    if (heroes.length >= 10) this._complete('col_10_heroes');
    if (heroes.length >= 25) this._complete('col_25_heroes');
    if (heroes.length >= 50) this._complete('col_50_heroes');
    const affinities = new Set(heroes.map(h => h.affinity));
    if (['FIRE', 'ICE', 'EARTH', 'SHADOW', 'LIGHT'].every(a => affinities.has(a)))
      this._complete('col_full_affinity');
    const classes = new Set(heroes.map(h => h.heroClass));
    if (['WARRIOR', 'TANK', 'MAGE', 'ARCHER', 'HEALER', 'ASSASSIN'].every(cl => classes.has(cl)))
      this._complete('col_full_class');
    if (heroes.some(h => ['LEGENDARY', 'MYTHIC', 'ASCENDED'].includes(h.rarity)))
      this._complete('prog_first_legendary');
  },

  checkHeroAscended() { this._complete('prog_first_ascended'); },

  checkRegionReached(region) {
    if (region >= 3) this._complete('prog_region_3');
    if (region >= 5) this._complete('prog_region_5');
  },

  checkEndlessFloor(floor) {
    if (floor >= 100) this._complete('prog_endless_100');
  },

  checkAffinityFloor(floor) {
    if (floor >= 50) this._complete('prog_affinity_50');
  },

  checkArenaWin() {
    this._progress.arenaWins++;
    if (this._progress.arenaWins >= 10) this._complete('com_arena_10');
  },

  checkWorldBossDefeated(tierKey) {
    if (tierKey === 'HARD') this._complete('com_world_boss_hard');
  },

  checkGuildJoined() { this._complete('soc_join_guild'); },

  checkGuildBossAttack(rawDamage) {
    this._progress.guildBossAttacks++;
    if (this._progress.guildBossAttacks >= 10) this._complete('soc_guild_boss_10');
    if (rawDamage >= 1000000) this._complete('com_guild_1m');
  },

  checkGuildLevel(level) {
    if (level >= 10) this._complete('soc_guild_level_10');
  },

  // hero = HeroInstance with .gear slots
  checkGearEquipped(hero) {
    if (!hero) return;
    if (['WEAPON', 'ROBE', 'ACCESSORY', 'RELIC', 'SIGIL'].every(slot => hero.gear[slot]))
      this._complete('gear_full_set');
  },

  checkGearObtained(rarity) {
    if (rarity === 'LEGENDARY') this._complete('gear_legendary');
    if (rarity === 'MYTHIC')    this._complete('gear_mythic');
  },

  // Show all pending unlock popups on the given Phaser scene
  showPopups(scene) {
    const unlocks = this.consumeUnlocks();
    unlocks.forEach((def, i) => {
      scene.time.delayedCall(i * 600, () => _drawPopup(scene, def));
    });
  },

  toJSON() {
    return {
      completed: [...this._completed],
      progress:  { ...this._progress },
    };
  },

  fromJSON(data) {
    if (!data) return;
    this._completed      = new Set(data.completed || []);
    this._progress       = { arenaWins: 0, guildBossAttacks: 0, ...(data.progress || {}) };
    this._pendingUnlocks = [];
  },
};

function _drawPopup(scene, def) {
  const W = 480;
  const grp = scene.add.container(W / 2, 130).setDepth(9999);
  grp.add(scene.add.rectangle(0, 0, 430, 88, 0x100520).setStrokeStyle(2, 0xcc88ff));
  grp.add(scene.add.text(0, -22, 'Achievement Unlocked!', { font: '13px monospace', fill: '#cc88ff' }).setOrigin(0.5));
  grp.add(scene.add.text(0, 2, def.label, { font: '18px monospace', fill: '#ffd700' }).setOrigin(0.5));
  grp.add(scene.add.text(0, 25, '+' + def.reward + ' Premium Crystals', { font: '13px monospace', fill: '#aaddff' }).setOrigin(0.5));
  scene.time.delayedCall(3000, () => { if (grp.active) grp.destroy(); });
}

export default AchievementManager;

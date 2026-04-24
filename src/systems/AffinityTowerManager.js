import HeroManager, { HeroInstance } from './HeroManager.js';
import HERO_DEFINITIONS from '../data/heroDefinitions.js';
import AchievementManager from './AchievementManager.js';
const AFFINITIES = ['FIRE', 'ICE', 'EARTH', 'SHADOW', 'LIGHT'];

const ENEMY_NAMES = ['Warden', 'Sentinel', 'Mystic', 'Guardian', 'Specter', 'Titan', 'Zealot', 'Phantom'];

const ARCHETYPES = [
  { heroClass: 'WARRIOR', range: 'melee',  row: 'FRONT', abilityIds: ['wa_slash', 'wa_shield_bash'], ultimateAbilityId: 'wa_berserker_surge', hpM: 1.1,  defM: 1.0, dmgM: 1.0 },
  { heroClass: 'ARCHER',  range: 'ranged', row: 'BACK',  abilityIds: ['ar_swift_shot'],              ultimateAbilityId: 'ar_rain_of_arrows',   hpM: 0.8,  defM: 0.7, dmgM: 1.1 },
  { heroClass: 'MAGE',    range: 'ranged', row: 'BACK',  abilityIds: ['mg_arcane_bolt'],             ultimateAbilityId: 'mg_void_burst',       hpM: 0.75, defM: 0.6, dmgM: 1.3 },
  { heroClass: 'TANK',    range: 'melee',  row: 'FRONT', abilityIds: ['tk_provoke'],                ultimateAbilityId: 'tk_bulwark',          hpM: 1.8,  defM: 1.8, dmgM: 0.7 },
];

const MILESTONE_FLOORS = [50, 100, 200, 500];
const MILESTONE_HERO_GIFTS = Object.freeze({
  200: 'hero_archmage_eloris', // exclusive gift placeholder
  500: 'hero_dusk'    // exclusive rare gift placeholder
});

const _defaultTower = () => ({
  highestFloor: 0, currentFloor: 1, lastReward: null, milestonesClaimed: []
});

const AffinityTowerManager = {
  towers: {
    FIRE:   _defaultTower(),
    ICE:    _defaultTower(),
    EARTH:  _defaultTower(),
    SHADOW: _defaultTower(),
    LIGHT:  _defaultTower(),
  },

  getTower(affinity) {
    return this.towers[affinity];
  },

  generateEnemySquad(affinity, floor) {
    const isBoss  = floor % 10 === 0;
    const mult    = isBoss ? 1.7 : 1.0;
    const baseHp  = Math.floor((85 + floor * 20) * mult);
    const baseDef = Math.floor((7  + floor * 1.3) * mult);
    const baseDmg = Math.floor((11 + floor * 2.0) * mult);
    const count   = Math.min(4, 1 + Math.floor((floor - 1) / 5));
    const enemies = [];

    for (let i = 0; i < count; i++) {
      const arch = ARCHETYPES[i % ARCHETYPES.length];
      // Final slot in a 4-enemy wave cycles affinity for variety
      const enemyAff = (count === 4 && i === 3)
        ? AFFINITIES[(floor + i) % AFFINITIES.length]
        : affinity;
      const prefix = (isBoss && i === 0) ? 'Boss ' : '';
      enemies.push({
        id:                `at_${affinity}_f${floor}_e${i}`,
        name:              prefix + ENEMY_NAMES[(floor + i) % ENEMY_NAMES.length],
        heroClass:         arch.heroClass,
        affinity:          enemyAff,
        range:             arch.range,
        row:               arch.row,
        stats: {
          hp:      Math.floor(baseHp  * arch.hpM),
          defense: Math.floor(baseDef * arch.defM),
          damage:  Math.floor(baseDmg * arch.dmgM),
        },
        abilityIds:        arch.abilityIds,
        ultimateAbilityId: arch.ultimateAbilityId,
        ultimateCharge:    0,
      });
    }
    return enemies;
  },

  // Returns modified squad where affinity-matched heroes have +50% stats.
  // Wraps the hero object so BattleEngine's computeStats() call returns boosted values.
  applyAffinityBonus(playerSquad, towerAffinity) {
    return playerSquad.map(entry => {
      if (entry.hero.affinity !== towerAffinity) return entry;
      const base = entry.hero.computeStats();
      const boostedHero = {
        id:               entry.hero.id,
        name:             entry.hero.name,
        heroClass:        entry.hero.heroClass,
        affinity:         entry.hero.affinity,
        range:            entry.hero.range,
        normalAbilityIds: entry.hero.normalAbilityIds,
        ultimateAbilityId: entry.hero.ultimateAbilityId,
        computeStats: () => ({
          hp:      Math.round(base.hp      * 1.5),
          defense: Math.round(base.defense * 1.5),
          damage:  Math.round(base.damage  * 1.5),
        }),
      };
      return { ...entry, hero: boostedHero };
    });
  },

  getFloorReward(affinity, floor) {
    const tower       = this.getTower(affinity);
    const gold        = 30 + floor * 18;
    const crystals    = Math.floor(floor / 4);
    const shards      = (floor % 10 === 0) ? Math.floor(floor / 8) : 0;
    const isMilestone = MILESTONE_FLOORS.includes(floor) && !tower.milestonesClaimed.includes(floor);
    return { gold, crystals, shards, isMilestone };
  },

  getMilestoneReward(floor) {
    const map = {
      50:  { title: 'Tower Climber', bonus: 'Rare Hero Shard x5',   crystals: 100  },
      100: { title: 'Peak Seeker',   bonus: 'Epic Hero Shard x3',   crystals: 250  },
      200: { title: 'Sky Walker',    bonus: 'Legendary Shard x1',   crystals: 500  },
      500: { title: 'Tower Legend',  bonus: 'Mythic Shard x1',      crystals: 1000 },
    };
    return map[floor] || null;
  },

  recordFloorClear(affinity, floor) {
    const tower  = this.getTower(affinity);
    const reward = this.getFloorReward(affinity, floor);
    tower.lastReward   = { floor, ...reward };
    if (floor > tower.highestFloor) tower.highestFloor = floor;
    AchievementManager.checkAffinityFloor(floor);
    tower.currentFloor = floor + 1;
    if (reward.isMilestone && !tower.milestonesClaimed.includes(floor)) {
      tower.milestonesClaimed.push(floor);
      this._grantMilestoneHero(floor);
    }
  },

  _grantMilestoneHero(floor) {
    const heroDefId = MILESTONE_HERO_GIFTS[floor];
    if (!heroDefId) return;
    if (HeroManager.getAllHeroes().some(h => h.heroDefId === heroDefId)) return;
    const def = HERO_DEFINITIONS.find(h => h.id === heroDefId);
    if (!def) return;
    HeroManager.addHero(new HeroInstance({
      heroDefId: def.id, name: def.name, title: def.title,
      heroClass: def.heroClass, affinity: def.affinity,
      rarity: def.rarity, originRarity: def.rarity,
      baseStats: def.baseStats,
      normalAbilityIds: def.normalAbilityIds,
      ultimateAbilityId: def.ultimateAbilityId,
      ultimateAbilityId2: def.ultimateAbilityId2 || null
    }));
  },

  toJSON() {
    const towers = {};
    for (const aff of AFFINITIES) {
      const t = this.towers[aff];
      towers[aff] = {
        highestFloor:      t.highestFloor,
        currentFloor:      t.currentFloor,
        lastReward:        t.lastReward,
        milestonesClaimed: [...t.milestonesClaimed],
      };
    }
    return { towers };
  },

  fromJSON(data) {
    if (!data) return;
    for (const aff of AFFINITIES) {
      if (data.towers?.[aff]) {
        const d = data.towers[aff];
        this.towers[aff] = {
          highestFloor:      d.highestFloor      || 0,
          currentFloor:      d.currentFloor      || 1,
          lastReward:        d.lastReward        || null,
          milestonesClaimed: d.milestonesClaimed || [],
        };
      }
    }
  },
};

export default AffinityTowerManager;

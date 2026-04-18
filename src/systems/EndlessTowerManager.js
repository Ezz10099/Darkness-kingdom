const AFFINITIES = ['FIRE', 'ICE', 'EARTH', 'SHADOW', 'LIGHT'];
const ENEMY_NAMES = ['Guard', 'Scout', 'Mystic', 'Warden', 'Sentinel', 'Specter', 'Titan', 'Phantom'];

const ARCHETYPES = [
  { heroClass: 'WARRIOR', range: 'melee',  row: 'FRONT', abilityIds: ['wa_slash', 'wa_shield_bash'], ultimateAbilityId: 'wa_berserker_surge', hpM: 1.1, defM: 1.0, dmgM: 1.0 },
  { heroClass: 'ARCHER',  range: 'ranged', row: 'BACK',  abilityIds: ['ar_swift_shot'],              ultimateAbilityId: 'ar_rain_of_arrows',   hpM: 0.8, defM: 0.7, dmgM: 1.1 },
  { heroClass: 'MAGE',    range: 'ranged', row: 'BACK',  abilityIds: ['mg_arcane_bolt'],             ultimateAbilityId: 'mg_void_burst',       hpM: 0.75, defM: 0.6, dmgM: 1.3 },
  { heroClass: 'TANK',    range: 'melee',  row: 'FRONT', abilityIds: ['tk_provoke'],                ultimateAbilityId: 'tk_bulwark',          hpM: 1.8,  defM: 1.8, dmgM: 0.7 },
];

const EndlessTowerManager = {
  highestFloor: 0,
  currentFloor: 1,
  lastReward:   null,

  generateEnemySquad(floor) {
    const isBoss = floor % 10 === 0;
    const mult   = isBoss ? 1.6 : 1.0;
    const baseHp  = Math.floor((80  + floor * 18) * mult);
    const baseDef = Math.floor((6   + floor * 1.2) * mult);
    const baseDmg = Math.floor((10  + floor * 1.8) * mult);
    const count   = Math.min(4, 1 + Math.floor((floor - 1) / 5));
    const enemies = [];

    for (let i = 0; i < count; i++) {
      const arch     = ARCHETYPES[i % ARCHETYPES.length];
      const affinity = AFFINITIES[(floor + i) % AFFINITIES.length];
      const prefix   = (isBoss && i === 0) ? 'Boss ' : '';
      enemies.push({
        id:              `et_f${floor}_e${i}`,
        name:            prefix + ENEMY_NAMES[(floor + i) % ENEMY_NAMES.length],
        heroClass:       arch.heroClass,
        affinity,
        range:           arch.range,
        row:             arch.row,
        stats: {
          hp:      Math.floor(baseHp  * arch.hpM),
          defense: Math.floor(baseDef * arch.defM),
          damage:  Math.floor(baseDmg * arch.dmgM),
        },
        abilityIds:       arch.abilityIds,
        ultimateAbilityId: arch.ultimateAbilityId,
        ultimateCharge:   0,
      });
    }
    return enemies;
  },

  getFloorReward(floor) {
    const gold     = 25 + floor * 15;
    const crystals = Math.floor(floor / 5);
    const shards   = (floor % 10 === 0) ? Math.floor(floor / 10) : 0;
    return { gold, crystals, shards };
  },

  recordFloorClear(floor) {
    const reward      = this.getFloorReward(floor);
    this.lastReward   = { floor, ...reward };
    if (floor > this.highestFloor) this.highestFloor = floor;
    this.currentFloor = floor + 1;
  },

  toJSON() {
    return {
      highestFloor: this.highestFloor,
      currentFloor: this.currentFloor,
      lastReward:   this.lastReward,
    };
  },

  fromJSON(data) {
    if (!data) return;
    this.highestFloor = data.highestFloor || 0;
    this.currentFloor = data.currentFloor || 1;
    this.lastReward   = data.lastReward   || null;
  },
};

export default EndlessTowerManager;

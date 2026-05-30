export const CLASS = Object.freeze({
  WARRIOR: 'WARRIOR', TANK: 'TANK', MAGE: 'MAGE',
  ARCHER: 'ARCHER', HEALER: 'HEALER', ASSASSIN: 'ASSASSIN'
});

export const AFFINITY = Object.freeze({
  FIRE: 'FIRE', ICE: 'ICE', EARTH: 'EARTH', SHADOW: 'SHADOW', LIGHT: 'LIGHT'
});

export const RARITY = Object.freeze({
  COMMON: 'COMMON', UNCOMMON: 'UNCOMMON', RARE: 'RARE',
  EPIC: 'EPIC', LEGENDARY: 'LEGENDARY', MYTHIC: 'MYTHIC', ASCENDED: 'ASCENDED'
});

export const RARITY_ORDER = Object.freeze({
  COMMON: 0, UNCOMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, MYTHIC: 5, ASCENDED: 6
});

export const GEAR_SLOT = Object.freeze({
  WEAPON: 'WEAPON', ROBE: 'ROBE', ACCESSORY: 'ACCESSORY', RELIC: 'RELIC', SIGIL: 'SIGIL'
});

export const CURRENCY = Object.freeze({
  GOLD: 'GOLD', CRYSTALS: 'CRYSTALS', PREMIUM_CRYSTALS: 'PREMIUM_CRYSTALS',
  AWAKENING_SHARDS: 'AWAKENING_SHARDS', ARENA_TOKENS: 'ARENA_TOKENS', GUILD_COINS: 'GUILD_COINS'
});

export const CURRENCY_LABEL = Object.freeze({
  GOLD: 'Crown Marks',
  CRYSTALS: 'Ether Shards',
  PREMIUM_CRYSTALS: 'Lumens',
  AWAKENING_SHARDS: 'Resonance',
  ARENA_TOKENS: 'Glory Tokens',
  GUILD_COINS: 'Covenant Coins'
});

export const STATUS_EFFECT = Object.freeze({
  BURNING: 'BURNING', FREEZE: 'FREEZE', ROOT: 'ROOT', BLIND: 'BLIND'
});

export const FORMATION_ROW = Object.freeze({ FRONT: 'FRONT', BACK: 'BACK' });

export const RARITY_CONFIG = Object.freeze({
  COMMON:    { maxStars: 3, maxLevel: 40 },
  UNCOMMON:  { maxStars: 4, maxLevel: 50 },
  RARE:      { maxStars: 5, maxLevel: 60 },
  EPIC:      { maxStars: 6, maxLevel: 70 },
  LEGENDARY: { maxStars: 7, maxLevel: 80 },
  MYTHIC:    { maxStars: 8, maxLevel: 90 },
  ASCENDED:  { maxStars: 9, maxLevel: 100 }
});

export const AFFINITY_ADVANTAGES = Object.freeze({
  FIRE:   { strongVs: 'EARTH',  weakVs: 'ICE',    statusEffect: 'BURNING' },
  ICE:    { strongVs: 'FIRE',   weakVs: 'EARTH',  statusEffect: 'FREEZE'  },
  EARTH:  { strongVs: 'ICE',    weakVs: 'FIRE',   statusEffect: 'ROOT'    },
  SHADOW: { strongVs: 'LIGHT',  weakVs: 'LIGHT',  statusEffect: 'BLIND'   },
  LIGHT:  { strongVs: 'SHADOW', weakVs: 'SHADOW', statusEffect: 'BLIND'   }
});

export const TITLE_AFFINITY_BONUS = Object.freeze({
  FIRE:   { hp: 1.00, defense: 1.00, damage: 1.07 },
  ICE:    { hp: 1.00, defense: 1.07, damage: 1.00 },
  EARTH:  { hp: 1.07, defense: 1.00, damage: 1.00 },
  SHADOW: { hp: 1.00, defense: 1.03, damage: 1.04 },
  LIGHT:  { hp: 1.03, defense: 1.04, damage: 1.00 }
});


export const CLASS_BASE_STATS = Object.freeze({
  TANK:     { hp: 1200, defense: 120, damage: 80 },
  WARRIOR:  { hp: 900,  defense: 90,  damage: 110 },
  HEALER:   { hp: 800,  defense: 80,  damage: 70 },
  MAGE:     { hp: 600,  defense: 60,  damage: 160 },
  ARCHER:   { hp: 700,  defense: 65,  damage: 150 },
  ASSASSIN: { hp: 550,  defense: 55,  damage: 190 }
});

export const RARITY_STAT_MULTIPLIER = Object.freeze({
  COMMON: 1.0,
  UNCOMMON: 1.15,
  RARE: 1.35,
  EPIC: 1.65,
  LEGENDARY: 2.1,
  MYTHIC: 2.8,
  ASCENDED: 3.8
});

export const LEVEL_STAT_GROWTH = Object.freeze({
  hp: 0.02,
  defense: 0.018,
  damage: 0.022
});

export const STAR_STAT_BONUS_PER_STAR = 0.15;

export const DAMAGE_FORMULA = Object.freeze({
  defenseMitigationConstant: 500
});

export const AFFINITY_DAMAGE_MULTIPLIER = Object.freeze({
  STRONG: 1.3,
  NEUTRAL: 1.0,
  WEAK: 0.75
});

export const ABILITY_POWER_MULTIPLIER_RANGES = Object.freeze({
  LIGHT_AUTO: Object.freeze({ min: 0.5, max: 0.8 }),
  NORMAL_SINGLE: Object.freeze({ min: 1.2, max: 1.8 }),
  NORMAL_AOE: Object.freeze({ min: 0.7, max: 1.0 }),
  ULTIMATE_SINGLE: Object.freeze({ min: 2.5, max: 4.0 }),
  ULTIMATE_AOE: Object.freeze({ min: 1.2, max: 2.0 }),
  HEAL: Object.freeze({ min: 1.5, max: 2.5 })
});

export const ULTIMATE_CHARGE = Object.freeze({
  COST: 100,
  READY: 100,
  AUTO_TRIGGER: 150,
  PASSIVE_PER_SECOND: 5,
  ALLY_CAST_BONUS: 20
});
export const CLASS_DEFAULTS = Object.freeze({
  WARRIOR:  { defaultRow: 'FRONT', statProfile: 'balanced'        },
  TANK:     { defaultRow: 'FRONT', statProfile: 'high_hp_def'     },
  MAGE:     { defaultRow: 'BACK',  statProfile: 'high_dmg_fragile' },
  ARCHER:   { defaultRow: 'BACK',  statProfile: 'ranged_dmg'      },
  HEALER:   { defaultRow: 'BACK',  statProfile: 'support'         },
  ASSASSIN: { defaultRow: 'FRONT', statProfile: 'burst'           }
});

export const ASCENSION_CEILING = Object.freeze({
  COMMON:    'RARE',
  UNCOMMON:  'EPIC',
  RARE:      'LEGENDARY',
  EPIC:      'MYTHIC',
  LEGENDARY: 'ASCENDED',
  MYTHIC:    null,
  ASCENDED:  null
});

export default {
  CLASS, AFFINITY, RARITY, RARITY_ORDER, GEAR_SLOT, CURRENCY,
  CURRENCY_LABEL, STATUS_EFFECT, FORMATION_ROW, RARITY_CONFIG, AFFINITY_ADVANTAGES,
  TITLE_AFFINITY_BONUS,
  CLASS_BASE_STATS, RARITY_STAT_MULTIPLIER, LEVEL_STAT_GROWTH, STAR_STAT_BONUS_PER_STAR,
  DAMAGE_FORMULA, AFFINITY_DAMAGE_MULTIPLIER, ABILITY_POWER_MULTIPLIER_RANGES,
  ULTIMATE_CHARGE, CLASS_DEFAULTS, ASCENSION_CEILING
};

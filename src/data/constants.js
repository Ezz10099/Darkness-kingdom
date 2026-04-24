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
  GOLD: 'Arcane Marks',
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
  FIRE:   { strongVs: 'ICE',    weakVs: 'LIGHT',  statusEffect: 'BURNING' },
  ICE:    { strongVs: 'EARTH',  weakVs: 'FIRE',   statusEffect: 'FREEZE'  },
  EARTH:  { strongVs: 'SHADOW', weakVs: 'ICE',    statusEffect: 'ROOT'    },
  SHADOW: { strongVs: 'LIGHT',  weakVs: 'EARTH',  statusEffect: 'BLIND'   },
  LIGHT:  { strongVs: 'FIRE',   weakVs: 'SHADOW', statusEffect: 'BLIND'   }
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
  CLASS_BASE_STATS, RARITY_STAT_MULTIPLIER, CLASS_DEFAULTS, ASCENSION_CEILING
};

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
  FIRE:   { strongVs: 'EARTH',  weakVs: 'ICE',    statusEffect: 'BURNING' },
  ICE:    { strongVs: 'FIRE',   weakVs: 'EARTH',   statusEffect: 'FREEZE'  },
  EARTH:  { strongVs: 'ICE',    weakVs: 'FIRE',    statusEffect: 'ROOT'    },
  SHADOW: { strongVs: 'LIGHT',  weakVs: 'LIGHT',   statusEffect: 'BLIND'   },
  LIGHT:  { strongVs: 'SHADOW', weakVs: 'SHADOW',  statusEffect: 'BLIND'   }
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
  CLASS_DEFAULTS, ASCENSION_CEILING
};

// Static hero pool — used by SummonManager and _seedDefaults starter grant.
// normalAbilityIds: auto-cast in battle. ultimateAbilityId: player-triggered.
// Legendary heroes have title and two ultimates; ultimateAbilityId = first one (second TBD in BattleScene).

const HERO_DEFINITIONS = [

  // ── COMMON ────────────────────────────────────────────────────────────────
  {
    id: 'hero_kael', name: 'Kael', title: null,
    heroClass: 'WARRIOR', affinity: 'FIRE', rarity: 'COMMON',
    baseStats: { hp: 120, defense: 25, damage: 30 },
    normalAbilityIds: ['wa_slash', 'aff_burning_touch'],
    ultimateAbilityId: 'wa_berserker_surge'
  },
  {
    id: 'hero_brynn', name: 'Brynn', title: null,
    heroClass: 'TANK', affinity: 'EARTH', rarity: 'COMMON',
    baseStats: { hp: 180, defense: 40, damage: 15 },
    normalAbilityIds: ['tk_fortify', 'aff_earthen_grip'],
    ultimateAbilityId: 'tk_bulwark'
  },

  // ── UNCOMMON ──────────────────────────────────────────────────────────────
  {
    id: 'hero_sylva', name: 'Sylva', title: null,
    heroClass: 'ARCHER', affinity: 'ICE', rarity: 'UNCOMMON',
    baseStats: { hp: 100, defense: 18, damage: 40 },
    normalAbilityIds: ['ar_swift_shot', 'aff_glacial_spike'],
    ultimateAbilityId: 'ar_rain_of_arrows'
  },
  {
    id: 'hero_torr', name: 'Torr', title: null,
    heroClass: 'WARRIOR', affinity: 'EARTH', rarity: 'UNCOMMON',
    baseStats: { hp: 130, defense: 28, damage: 28 },
    normalAbilityIds: ['wa_slash', 'wa_shield_bash'],
    ultimateAbilityId: 'wa_berserker_surge'
  },

  // ── RARE ──────────────────────────────────────────────────────────────────
  {
    id: 'hero_mira', name: 'Mira', title: null,
    heroClass: 'MAGE', affinity: 'FIRE', rarity: 'RARE',
    baseStats: { hp: 80, defense: 15, damage: 45 },
    normalAbilityIds: ['mg_arcane_bolt', 'aff_burning_touch'],
    ultimateAbilityId: 'mg_void_burst'
  },
  {
    id: 'hero_dusk', name: 'Dusk', title: null,
    heroClass: 'ASSASSIN', affinity: 'SHADOW', rarity: 'RARE',
    baseStats: { hp: 85, defense: 15, damage: 55 },
    normalAbilityIds: ['as_shadow_step', 'aff_shadow_veil'],
    ultimateAbilityId: 'as_death_mark'
  },
  {
    id: 'hero_lena', name: 'Lena', title: null,
    heroClass: 'HEALER', affinity: 'LIGHT', rarity: 'RARE',
    baseStats: { hp: 110, defense: 22, damage: 18 },
    normalAbilityIds: ['hl_mending_light', 'aff_light_burst'],
    ultimateAbilityId: 'hl_radiant_wave'
  },

  // ── EPIC ──────────────────────────────────────────────────────────────────
  {
    id: 'hero_zoran', name: 'Zoran', title: null,
    heroClass: 'MAGE', affinity: 'ICE', rarity: 'EPIC',
    baseStats: { hp: 85, defense: 16, damage: 50 },
    normalAbilityIds: ['mg_arcane_bolt', 'mg_frost_lance', 'aff_glacial_spike'],
    ultimateAbilityId: 'mg_void_burst'
  },
  {
    id: 'hero_cerin', name: 'Cerin', title: null,
    heroClass: 'TANK', affinity: 'EARTH', rarity: 'EPIC',
    baseStats: { hp: 200, defense: 50, damage: 18 },
    normalAbilityIds: ['tk_fortify', 'tk_provoke', 'aff_earthen_grip'],
    ultimateAbilityId: 'tk_bulwark'
  },

  // ── LEGENDARY ─────────────────────────────────────────────────────────────
  {
    id: 'hero_aethon', name: 'Aethon', title: 'the Radiant',
    heroClass: 'WARRIOR', affinity: 'LIGHT', rarity: 'LEGENDARY',
    baseStats: { hp: 150, defense: 35, damage: 40 },
    normalAbilityIds: ['wa_slash', 'wa_shield_bash', 'aff_light_burst'],
    ultimateAbilityId: 'wa_berserker_surge',
    ultimateAbilityId2: 'wa_iron_resolve'
  },
  {
    id: 'hero_nyara', name: 'Nyara', title: 'the Ashen Crown',
    heroClass: 'MAGE', affinity: 'FIRE', rarity: 'LEGENDARY',
    baseStats: { hp: 90, defense: 18, damage: 60 },
    normalAbilityIds: ['mg_arcane_bolt', 'aff_burning_touch'],
    ultimateAbilityId: 'mg_void_burst',
    ultimateAbilityId2: 'mg_timerift'
  }
];

export default HERO_DEFINITIONS;

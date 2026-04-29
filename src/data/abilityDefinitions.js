import { CLASS, AFFINITY, STATUS_EFFECT } from '../data/constants.js';

export const ABILITY_DEFINITIONS = [
  // ── WARRIOR ─────────────────────────────────────────────────────────────────
  {
    id: 'wa_slash', name: 'Slash', abilityClass: CLASS.WARRIOR, affinity: null,
    type: 'normal', scalingBase: 22, scalingPerRarity: 7, statusEffect: null,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Delivers a swift sword strike to a random enemy.'
  },
  {
    id: 'wa_shield_bash', name: 'Shield Bash', abilityClass: CLASS.WARRIOR, affinity: null,
    type: 'normal', scalingBase: 18, scalingPerRarity: 6, statusEffect: null,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Slams the shield into a random enemy, dealing blunt damage.'
  },
  {
    id: 'wa_berserker_surge', name: 'Berserker Surge', abilityClass: CLASS.WARRIOR, affinity: null,
    type: 'ultimate', scalingBase: 15, scalingPerRarity: 5, statusEffect: null,
    targetLogic: 'all_enemies', requiresLegendary: false,
    description: 'Enters a frenzied state and slams all enemies with reduced but rapid strikes.'
  },
  {
    id: 'wa_iron_resolve', name: 'Iron Resolve', abilityClass: CLASS.WARRIOR, affinity: null,
    type: 'ultimate', scalingBase: 30, scalingPerRarity: 10, statusEffect: null,
    targetLogic: 'random_enemy', requiresLegendary: true,
    description: 'Channels unwavering will into a heavy retaliatory blow against a random enemy.'
  },

  // ── TANK ────────────────────────────────────────────────────────────────────
  {
    id: 'tk_fortify', name: 'Fortify', abilityClass: CLASS.TANK, affinity: null,
    type: 'normal', scalingBase: 10, scalingPerRarity: 5, statusEffect: null,
    targetLogic: 'lowest_hp_ally', requiresLegendary: false,
    description: 'Braces defensively to reinforce the most wounded ally without dealing damage.'
  },
  {
    id: 'tk_provoke', name: 'Provoke', abilityClass: CLASS.TANK, affinity: null,
    type: 'normal', scalingBase: 12, scalingPerRarity: 5, statusEffect: null,
    targetLogic: 'front_row_enemy', requiresLegendary: false,
    description: 'Slams into a front-row enemy to disrupt their formation.'
  },
  {
    id: 'tk_bulwark', name: 'Bulwark', abilityClass: CLASS.TANK, affinity: null,
    type: 'ultimate', scalingBase: 20, scalingPerRarity: 8, statusEffect: null,
    targetLogic: 'lowest_hp_ally', requiresLegendary: false,
    description: 'Projects a bulwark onto the most wounded ally as a defensive support action.'
  },
  {
    id: 'tk_aegis_nova', name: 'Aegis Nova', abilityClass: CLASS.TANK, affinity: null,
    type: 'ultimate', scalingBase: 25, scalingPerRarity: 10, statusEffect: null,
    targetLogic: 'lowest_hp_ally', requiresLegendary: true,
    description: 'Radiates protective energy to reinforce the most wounded ally without dealing damage.'
  },

  // ── MAGE ────────────────────────────────────────────────────────────────────
  {
    id: 'mg_arcane_bolt', name: 'Arcane Bolt', abilityClass: CLASS.MAGE, affinity: null,
    type: 'normal', scalingBase: 28, scalingPerRarity: 9, statusEffect: null,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Fires a concentrated bolt of arcane energy at a random enemy.'
  },
  {
    id: 'mg_frost_lance', name: 'Frost Lance', abilityClass: CLASS.MAGE, affinity: AFFINITY.ICE,
    type: 'normal', scalingBase: 24, scalingPerRarity: 8, statusEffect: STATUS_EFFECT.FREEZE,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Hurls a lance of ice at a random enemy, dealing damage and applying Freeze.'
  },
  {
    id: 'mg_void_burst', name: 'Void Burst', abilityClass: CLASS.MAGE, affinity: null,
    type: 'ultimate', scalingBase: 20, scalingPerRarity: 9, statusEffect: null,
    targetLogic: 'back_row_enemy', requiresLegendary: false,
    description: 'Tears open a void rift targeting the back row, dealing heavy arcane damage.'
  },
  {
    id: 'mg_timerift', name: 'Timerift', abilityClass: CLASS.MAGE, affinity: AFFINITY.ICE,
    type: 'ultimate', scalingBase: 18, scalingPerRarity: 8, statusEffect: STATUS_EFFECT.FREEZE,
    targetLogic: 'all_enemies', requiresLegendary: true,
    description: 'Warps time itself to freeze every enemy in place simultaneously.'
  },

  // ── ARCHER ──────────────────────────────────────────────────────────────────
  {
    id: 'ar_swift_shot', name: 'Swift Shot', abilityClass: CLASS.ARCHER, affinity: null,
    type: 'normal', scalingBase: 20, scalingPerRarity: 7, statusEffect: null,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Looses a quick arrow at a random enemy with pinpoint accuracy.'
  },
  {
    id: 'ar_piercing_arrow', name: 'Piercing Arrow', abilityClass: CLASS.ARCHER, affinity: null,
    type: 'normal', scalingBase: 26, scalingPerRarity: 8, statusEffect: null,
    targetLogic: 'back_row_enemy', requiresLegendary: false,
    description: 'Fires a heavy arrow that punches through the front line to strike a back-row enemy.'
  },
  {
    id: 'ar_rain_of_arrows', name: 'Rain of Arrows', abilityClass: CLASS.ARCHER, affinity: null,
    type: 'ultimate', scalingBase: 16, scalingPerRarity: 6, statusEffect: null,
    targetLogic: 'all_enemies', requiresLegendary: false,
    description: 'Launches a volley of arrows that rains down on every enemy simultaneously.'
  },
  {
    id: 'ar_phantom_volley', name: 'Phantom Volley', abilityClass: CLASS.ARCHER, affinity: null,
    type: 'ultimate', scalingBase: 32, scalingPerRarity: 11, statusEffect: null,
    targetLogic: 'all_enemies', requiresLegendary: true,
    description: 'Summons spectral arrows that ignore row position and strike all enemies with devastating force.'
  },

  // ── HEALER ──────────────────────────────────────────────────────────────────
  {
    id: 'hl_mending_light', name: 'Mending Light', abilityClass: CLASS.HEALER, affinity: null,
    type: 'normal', scalingBase: 24, scalingPerRarity: 8, statusEffect: null,
    targetLogic: 'lowest_hp_ally', requiresLegendary: false,
    description: 'Channels restorative energy into the most wounded ally, recovering their HP.'
  },
  {
    id: 'hl_purify', name: 'Purify', abilityClass: CLASS.HEALER, affinity: null,
    type: 'normal', scalingBase: 14, scalingPerRarity: 5, statusEffect: null,
    targetLogic: 'lowest_hp_ally', requiresLegendary: false,
    description: 'Restores a small amount of health to the most wounded ally.'
  },
  {
    id: 'hl_radiant_wave', name: 'Radiant Wave', abilityClass: CLASS.HEALER, affinity: null,
    type: 'ultimate', scalingBase: 18, scalingPerRarity: 7, statusEffect: null,
    targetLogic: 'all_allies', requiresLegendary: false,
    description: 'Sends a wave of holy light over all allies, restoring their HP.'
  },
  {
    id: 'hl_resurrection_hymn', name: 'Resurrection Hymn', abilityClass: CLASS.HEALER, affinity: null,
    type: 'ultimate', scalingBase: 40, scalingPerRarity: 12, statusEffect: null,
    targetLogic: 'all_allies', requiresLegendary: true,
    description: 'Sings a divine hymn that restores massive HP to all allies.'
  },

  // ── ASSASSIN ────────────────────────────────────────────────────────────────
  {
    id: 'as_shadow_step', name: 'Shadow Step', abilityClass: CLASS.ASSASSIN, affinity: null,
    type: 'normal', scalingBase: 30, scalingPerRarity: 10, statusEffect: null,
    targetLogic: 'back_row_enemy', requiresLegendary: false,
    description: 'Teleports behind the enemy lines to deliver a high-damage strike to a back-row target.'
  },
  {
    id: 'as_rupture', name: 'Rupture', abilityClass: CLASS.ASSASSIN, affinity: null,
    type: 'normal', scalingBase: 26, scalingPerRarity: 9, statusEffect: null,
    targetLogic: 'back_row_enemy', requiresLegendary: false,
    description: 'Drives a blade into a critical point on a back-row enemy, causing a deep wound.'
  },
  {
    id: 'as_death_mark', name: 'Death Mark', abilityClass: CLASS.ASSASSIN, affinity: null,
    type: 'ultimate', scalingBase: 50, scalingPerRarity: 15, statusEffect: null,
    targetLogic: 'lowest_hp_enemy', requiresLegendary: false,
    description: 'Marks the lowest-HP enemy and strikes for massive damage.'
  },
  {
    id: 'as_voidwalk', name: 'Voidwalk', abilityClass: CLASS.ASSASSIN, affinity: null,
    type: 'ultimate', scalingBase: 35, scalingPerRarity: 12, statusEffect: null,
    targetLogic: 'back_row_enemy', requiresLegendary: true,
    description: 'Phases through the void and strikes a back-row enemy with devastating force.'
  },

  // ── AFFINITY ────────────────────────────────────────────────────────────────
  {
    id: 'aff_burning_touch', name: 'Burning Touch', abilityClass: null, affinity: AFFINITY.FIRE,
    type: 'normal', scalingBase: 20, scalingPerRarity: 7, statusEffect: STATUS_EFFECT.BURNING,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Ignites a random enemy with searing flames, applying the Burning status.'
  },
  {
    id: 'aff_glacial_spike', name: 'Glacial Spike', abilityClass: null, affinity: AFFINITY.ICE,
    type: 'normal', scalingBase: 20, scalingPerRarity: 7, statusEffect: STATUS_EFFECT.FREEZE,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Drives an ice spike through a random enemy, chilling them with Freeze.'
  },
  {
    id: 'aff_earthen_grip', name: 'Earthen Grip', abilityClass: null, affinity: AFFINITY.EARTH,
    type: 'normal', scalingBase: 18, scalingPerRarity: 6, statusEffect: STATUS_EFFECT.ROOT,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Erupts stone tendrils from the ground, Rooting a random enemy in place.'
  },
  {
    id: 'aff_shadow_veil', name: 'Shadow Veil', abilityClass: null, affinity: AFFINITY.SHADOW,
    type: 'normal', scalingBase: 18, scalingPerRarity: 6, statusEffect: STATUS_EFFECT.BLIND,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Shrouds a random enemy in darkness, inflicting Blind and dealing shadow damage.'
  },
  {
    id: 'aff_light_burst', name: 'Light Burst', abilityClass: null, affinity: AFFINITY.LIGHT,
    type: 'normal', scalingBase: 22, scalingPerRarity: 7, statusEffect: STATUS_EFFECT.BLIND,
    targetLogic: 'random_enemy', requiresLegendary: false,
    description: 'Releases a blinding flash of holy light that damages and Blinds a random enemy.'
  }
];

export default ABILITY_DEFINITIONS;

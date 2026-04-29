// Bond Links are lore pairings/trios independent of class/affinity.
// bonusByActiveMembers remains for global/stat-system compatibility.
// perHeroBonusByActiveMembers + bonusDescription preserve asymmetric design intent.

const BOND_DEFINITIONS = [
  {
    id: 'bond_branded_pair',
    name: 'The Branded Pair',
    memberHeroDefIds: ['hero_cinder_vale', 'hero_pyreth_the_branded'],
    bonusByActiveMembers: { 2: 0.12 },
    perHeroBonusByActiveMembers: {
      2: {
        hero_cinder_vale: 0.12,
        hero_pyreth_the_branded: 0.12
      }
    },
    bonusDescription: 'Cinder Vale and Pyreth gain +12% to HP, defense, and damage'
  },
  {
    id: 'bond_hearthbound',
    name: 'The Hearthbound',
    memberHeroDefIds: ['hero_pyreth_the_branded', 'hero_sera_ashveil'],
    bonusByActiveMembers: { 2: 0.175 },
    perHeroBonusByActiveMembers: {
      2: {
        hero_pyreth_the_branded: 0.20,
        hero_sera_ashveil: 0.15
      }
    },
    bonusDescription: 'Pyreth gains +20% to HP, defense, and damage; Sera gains +15% to HP, defense, and damage'
  },
  {
    id: 'bond_cold_front',
    name: 'The Cold Front',
    memberHeroDefIds: ['hero_frost_warden_kael', 'hero_yssa_driftborn'],
    bonusByActiveMembers: { 2: 0.165 },
    perHeroBonusByActiveMembers: {
      2: {
        hero_frost_warden_kael: 0.18,
        hero_yssa_driftborn: 0.15
      }
    },
    bonusDescription: 'Kael gains +18% to HP, defense, and damage; Yssa gains +15% to HP, defense, and damage'
  },
  {
    id: 'bond_unbroken',
    name: 'The Unbroken',
    memberHeroDefIds: ['hero_stone_sentinel_gorr', 'hero_briar_thornguard'],
    bonusByActiveMembers: { 2: 0.15 },
    perHeroBonusByActiveMembers: {
      2: {
        hero_stone_sentinel_gorr: 0.15,
        hero_briar_thornguard: 0.15
      }
    },
    bonusDescription: 'Stone Sentinel Gorr and Briar Thornguard gain +15% to HP, defense, and damage'
  },
  {
    id: 'bond_eclipse',
    name: 'The Eclipse',
    memberHeroDefIds: ['hero_dusk', 'hero_vesper'],
    bonusByActiveMembers: { 2: 0.225 },
    perHeroBonusByActiveMembers: {
      2: {
        hero_dusk: 0.25,
        hero_vesper: 0.20
      }
    },
    bonusDescription: 'Dusk gains +25% to HP, defense, and damage; Vesper gains +20% to HP, defense, and damage'
  },
  {
    id: 'bond_founders_bond',
    name: "The Founders' Bond",
    memberHeroDefIds: ['hero_lumen_solis', 'hero_crest_of_dawning', 'hero_archmage_eloris'],
    bonusByActiveMembers: { 3: 0.20 },
    perHeroBonusByActiveMembers: {
      3: {
        hero_lumen_solis: 0.20,
        hero_crest_of_dawning: 0.20,
        hero_archmage_eloris: 0.20
      }
    },
    bonusDescription: 'All three gain +20% to all stats when deployed together'
  }
];

export default BOND_DEFINITIONS;

// Bond Links are lore pairings/trios independent of class/affinity.
// Bonus scales by how many members are fielded simultaneously.

const BOND_DEFINITIONS = [
  {
    id: 'bond_academy_rivals',
    name: 'Academy Rivals',
    memberHeroDefIds: ['hero_kael', 'hero_torr'],
    bonusByActiveMembers: { 2: 0.08 }
  },
  {
    id: 'bond_headmaster_lineage',
    name: 'Headmaster Lineage',
    memberHeroDefIds: ['hero_aethon', 'hero_nyara'],
    bonusByActiveMembers: { 2: 0.10 }
  },
  {
    id: 'bond_shadow_light_duo',
    name: 'Dusk and Dawn',
    memberHeroDefIds: ['hero_dusk', 'hero_lena', 'hero_sylva'],
    bonusByActiveMembers: { 2: 0.05, 3: 0.12 }
  }
];

export default BOND_DEFINITIONS;

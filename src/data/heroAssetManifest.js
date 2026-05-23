import HERO_DEFINITIONS from './heroDefinitions.js';

export const HERO_ASSET_MANIFEST = HERO_DEFINITIONS.flatMap(({ id }) => ([
  { key: `hero_portrait_${id}`, path: `assets/heroes/portraits/${id}_portrait.png` },
  { key: `hero_full_${id}`, path: `assets/heroes/full/${id}_full.png` },
  { key: `hero_battle_${id}`, path: `assets/heroes/battle/${id}_battle.png` }
]));

export default HERO_ASSET_MANIFEST;

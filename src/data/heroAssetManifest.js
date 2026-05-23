import HERO_DEFINITIONS from './heroDefinitions.js';

const ROOTS = {
  portrait: 'assets/heroes/portraits',
  full: 'assets/heroes/full',
  battle: 'assets/heroes/battle'
};

export function getHeroAssetBundle(heroId) {
  return {
    portraitKey: `hero_portrait_${heroId}`,
    portraitPath: `${ROOTS.portrait}/${heroId}_portrait.png`,
    fullKey: `hero_full_${heroId}`,
    fullPath: `${ROOTS.full}/${heroId}_full.png`,
    battleKey: `hero_battle_${heroId}`,
    battlePath: `${ROOTS.battle}/${heroId}_battle.png`
  };
}

export const HERO_ASSET_MANIFEST = HERO_DEFINITIONS.flatMap(({ id }) => {
  const bundle = getHeroAssetBundle(id);
  return [
    { key: bundle.portraitKey, path: bundle.portraitPath },
    { key: bundle.fullKey, path: bundle.fullPath },
    { key: bundle.battleKey, path: bundle.battlePath }
  ];
});

export default HERO_ASSET_MANIFEST;

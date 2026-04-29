import GameState from '../systems/GameState.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import HeroManager from '../systems/HeroManager.js';
import SaveManager from '../systems/SaveManager.js';
import IMAGE_ASSET_MANIFEST from '../data/assetManifest.js';
import { CURRENCY } from '../data/constants.js';

const REQUIRED_SCENES = [
  'Boot', 'Preload', 'Onboarding', 'MainHub', 'Campaign', 'Roster', 'Summon',
  'EndlessTower', 'WorldBoss', 'Arena', 'ArenaShop', 'AffinityTowerSelection',
  'AffinityTower', 'DailyCodex', 'Guild', 'GuildShop', 'Achievement', 'ElderTree',
  'AwakenAltar', 'LoginStreak', 'Settings', 'GearForge'
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getActiveSceneKeys(game) {
  if (!game?.scene?.scenes) return [];
  return game.scene.scenes
    .filter(scene => scene?.scene?.isActive?.())
    .map(scene => scene.scene.key);
}

function getAvailableSceneKeys(game) {
  if (!game?.scene?.keys) return [];
  return Object.keys(game.scene.keys).sort();
}

function verifyCheck(name, pass, detail = '') {
  return { name, pass: Boolean(pass), detail };
}

export function installDevConsole(game) {
  if (typeof window === 'undefined') return null;

  const DK = {
    game,

    help() {
      return {
        message: 'Darkness Kingdoms dev console is ready.',
        commands: [
          'DK.verify() - run core state/scene/asset checks',
          'DK.state() - show save/state summary',
          'DK.currencies() - show currency amounts',
          'DK.heroes() - show hero summary table',
          'DK.unlocks() - show unlocked systems',
          'DK.assets() - verify manifest textures are loaded',
          'DK.scenes() - show registered and active scenes',
          'DK.go("MainHub") - jump to a scene for testing',
          'DK.save() - force save current state',
          'DK.resetSave("RESET") - delete local save and reload page'
        ]
      };
    },

    verify() {
      const sceneKeys = getAvailableSceneKeys(game);
      const activeScenes = getActiveSceneKeys(game);
      const squad = asArray(GameState.getActiveSquadEntries?.());
      const battleSquad = asArray(GameState.getBattleSquadEntries?.());
      const rowCounts = battleSquad.reduce((acc, entry) => {
        acc[entry.row] = (acc[entry.row] || 0) + 1;
        return acc;
      }, {});
      const assetResults = this.assets(false);
      const missingScenes = REQUIRED_SCENES.filter(key => !sceneKeys.includes(key));
      const missingAssets = assetResults.filter(item => !item.loaded).map(item => item.key);

      const checks = [
        verifyCheck('Phaser game exists', Boolean(game), 'window.DK.game'),
        verifyCheck('Scene manager ready', Boolean(game?.scene), 'game.scene'),
        verifyCheck('Required scenes registered', missingScenes.length === 0, missingScenes.length ? missingScenes.join(', ') : 'all present'),
        verifyCheck('At least one active scene', activeScenes.length > 0, activeScenes.join(', ') || 'none'),
        verifyCheck('GameState initialized', Boolean(GameState.campaignProgress), JSON.stringify(GameState.campaignProgress)),
        verifyCheck('Currency manager readable', Object.values(CURRENCY).every(key => Number.isFinite(CurrencyManager.get(key))), 'all currency keys readable'),
        verifyCheck('Hero manager readable', Array.isArray(HeroManager.getAllHeroes()), `${HeroManager.getAllHeroes().length} heroes`),
        verifyCheck('Active squad valid size', squad.length <= 5, `${squad.length}/5`),
        verifyCheck('Battle squad valid size', battleSquad.length <= 5, `${battleSquad.length}/5`),
        verifyCheck('Battle squad row caps valid', (rowCounts.FRONT || 0) <= 3 && (rowCounts.BACK || 0) <= 3, JSON.stringify(rowCounts)),
        verifyCheck('Manifest textures loaded', missingAssets.length === 0, missingAssets.length ? missingAssets.join(', ') : 'all loaded')
      ];

      const ok = checks.every(check => check.pass);
      console.table(checks);
      return { ok, checks };
    },

    state() {
      return {
        firstSession: GameState.firstSession,
        campaignProgress: GameState.campaignProgress,
        unlockedSystems: [...(GameState.unlockedSystems || [])],
        activeSquad: GameState.getActiveSquadEntries?.() || [],
        battleSquad: GameState.getBattleSquadEntries?.() || [],
        heroCount: HeroManager.getAllHeroes().length,
        currencies: CurrencyManager.toJSON()
      };
    },

    currencies() {
      const rows = Object.values(CURRENCY).map(key => ({ key, amount: CurrencyManager.get(key) }));
      console.table(rows);
      return rows;
    },

    heroes() {
      const rows = HeroManager.getAllHeroes().map(hero => ({
        id: hero.id,
        defId: hero.heroDefId,
        name: hero.name,
        class: hero.heroClass,
        affinity: hero.affinity,
        rarity: hero.rarity,
        level: hero.level,
        stars: hero.stars,
        xp: hero.xp
      }));
      console.table(rows);
      return rows;
    },

    unlocks() {
      const rows = [...(GameState.unlockedSystems || [])].sort();
      console.table(rows.map(key => ({ unlocked: key })));
      return rows;
    },

    isUnlocked(key) {
      return GameState.isUnlocked(key);
    },

    assets(print = true) {
      const rows = IMAGE_ASSET_MANIFEST.map(({ key, path }) => ({
        key,
        path,
        loaded: Boolean(game?.textures?.exists?.(key))
      }));
      if (print) console.table(rows);
      return rows;
    },

    scenes() {
      const result = {
        active: getActiveSceneKeys(game),
        registered: getAvailableSceneKeys(game)
      };
      console.table(result.registered.map(key => ({
        scene: key,
        active: result.active.includes(key)
      })));
      return result;
    },

    go(sceneKey) {
      if (!game?.scene?.keys?.[sceneKey]) {
        console.warn(`Scene not found: ${sceneKey}`);
        return false;
      }
      const active = getActiveSceneKeys(game)[0];
      if (active && game.scene.keys[active]?.scene?.start) {
        game.scene.keys[active].scene.start(sceneKey);
      } else {
        game.scene.start(sceneKey);
      }
      return true;
    },

    save() {
      GameState.save();
      return 'Saved current GameState.';
    },

    resetSave(confirmText) {
      if (confirmText !== 'RESET') {
        return 'Refused. Run DK.resetSave("RESET") to delete local save and reload.';
      }
      SaveManager.deleteSave();
      window.location.reload();
      return 'Save deleted. Reloading.';
    }
  };

  window.DK = DK;
  window.__DK_GAME__ = game;
  console.info('Darkness Kingdoms dev console ready. Run DK.help() or DK.verify().');
  return DK;
}

export default installDevConsole;

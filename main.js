import BootScene          from './src/scenes/BootScene.js';
import PreloadScene       from './src/scenes/PreloadScene.js';
import MainHubScene       from './src/scenes/MainHubScene.js';
import CampaignScene      from './src/scenes/CampaignScene.js';
import RosterScene        from './src/scenes/RosterScene.js';
import SummonScene        from './src/scenes/SummonScene.js';
import EndlessTowerScene  from './src/scenes/EndlessTowerScene.js';
import WorldBossScene     from './src/scenes/WorldBossScene.js';
import ArenaScene         from './src/scenes/ArenaScene.js';
import ArenaShopScene               from './src/scenes/ArenaShopScene.js';
import AffinityTowerSelectionScene  from './src/scenes/AffinityTowerSelectionScene.js';
import AffinityTowerScene           from './src/scenes/AffinityTowerScene.js';
import DailyCodexScene              from './src/scenes/DailyCodexScene.js';
import GuildScene                   from './src/scenes/GuildScene.js';
import GuildShopScene               from './src/scenes/GuildShopScene.js';
import AchievementScene             from './src/scenes/AchievementScene.js';
import ElderTreeScene               from './src/scenes/ElderTreeScene.js';
import AwakenAltarScene             from './src/scenes/AwakenAltarScene.js';
import SettingsScene                from './src/scenes/SettingsScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 854,
  backgroundColor: '#0a0a1a',
  parent: 'game-container',
  scene: [BootScene, PreloadScene, MainHubScene, CampaignScene, RosterScene, SummonScene, EndlessTowerScene, WorldBossScene, ArenaScene, ArenaShopScene, AffinityTowerSelectionScene, AffinityTowerScene, DailyCodexScene, GuildScene, GuildShopScene, AchievementScene, ElderTreeScene, AwakenAltarScene, SettingsScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    orientation: Phaser.Scale.Orientation.PORTRAIT
  }
});

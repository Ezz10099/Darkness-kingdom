import BootScene from './src/scenes/BootScene.js';
import PreloadScene from './src/scenes/PreloadScene.js';
import MainHubScene from './src/scenes/MainHubScene.js';
import GameState from './src/systems/GameState.js';
import HeroManager from './src/systems/HeroManager.js';
import CurrencyManager from './src/systems/CurrencyManager.js';
import GearManager from './src/systems/GearManager.js';
import SummonManager from './src/systems/SummonManager.js';

// Expose systems globally so they are accessible from the browser console
window.GameState = GameState;
window.HeroManager = HeroManager;
window.CurrencyManager = CurrencyManager;
window.GearManager = GearManager;
window.SummonManager = SummonManager;

new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 854,
  backgroundColor: '#0a0a1a',
  parent: 'game-container',
  scene: [BootScene, PreloadScene, MainHubScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    orientation: Phaser.Scale.Orientation.PORTRAIT
  }
});

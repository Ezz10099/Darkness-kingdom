import GameState from '../systems/GameState.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import IdleManager from '../systems/IdleManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import LoginStreakManager from '../systems/LoginStreakManager.js';

const BTN_COLOR      = 0x1a1a3a;
const BTN_COLOR_DOWN = 0x0d0d1f;
const BTN_W = 380;
const BTN_H = 70;

export default class MainHubScene extends Phaser.Scene {
  constructor() { super('MainHub'); }

  create() {
    const W = 480, H = 854;
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);
    this.add.text(W / 2, 42, 'ARCANE ACADEMY', {
      font: '26px monospace', fill: '#ffd700'
    }).setOrigin(0.5);

    // Currency display
    this._goldText    = this.add.text(20, 90,  'Gold: 0',         { font: '16px monospace', fill: '#ffffff' });
    this._crystalText = this.add.text(20, 112, 'Crystals: 0',     { font: '16px monospace', fill: '#aaddff' });
    this._premText    = this.add.text(20, 134, 'Prem.Crystals: 0',{ font: '13px monospace', fill: '#cc88ff' });
    this._rateText    = this.add.text(20, 154, '+0/s',            { font: '13px monospace', fill: '#888888' });

    // Nav buttons
    const navItems = [
      { label: '\u2694  CAMPAIGN',        scene: 'Campaign'              },
      { label: '\u221e  ENDLESS TOWER',   scene: 'EndlessTower'          },
      { label: '\u2605  WORLD BOSS',      scene: 'WorldBoss'             },
      { label: '\u2663  ARENA',           scene: 'Arena'                 },
      { label: '\u2734  SUMMON',          scene: 'Summon'                },
      { label: '\u2691  ROSTER',          scene: 'Roster'                },
      { label: '\u2692  GEAR FORGE',      scene: 'GearForge'             },
      { label: '\u2726  AWAKENING ALTAR', scene: 'AwakenAltar'           },
      { label: '\u25c6  AFFINITY TOWERS', scene: 'AffinityTowerSelection'},
      { label: '\u2295  DAILY CODEX',     scene: 'DailyCodex'            },
      { label: '\u26e8  GUILD',           scene: 'Guild'                 },
      { label: '\u2767  ELDER TREE',      scene: 'ElderTree'             },
      { label: '\u2318  ACHIEVEMENTS',    scene: 'Achievement'           },
      { label: '\u2699  SETTINGS',        scene: 'Settings'              },
    ];
    const startY = 188;
    const spacing = 46;
    navItems.forEach((item, i) => this._makeNavButton({ ...item, y: startY + (i * spacing) }, W));

    // Timers
    this.time.addEvent({ delay: 500,   loop: true, callback: this._refreshUI,  callbackScope: this });
    this.time.addEvent({ delay: 1000,  loop: true, callback: this._idleTick,   callbackScope: this });
    this.time.addEvent({ delay: 30000, loop: true, callback: () => GameState.save() });
    this._refreshUI();

    if (LoginStreakManager.canClaimToday()) {
      this.time.delayedCall(120, () => this.scene.start('LoginStreak', { returnScene: 'MainHub' }));
    }

    // Show any achievement popups queued from other scenes
    AchievementManager.showPopups(this);
  }

  _makeNavButton({ label, y, scene }, W) {
    const sceneExists = this.scene.manager.getScene(scene) !== null;
    const unlockByScene = {
      Summon: 'BASIC_SUMMON',
      Arena: 'ARENA',
      AffinityTowerSelection: 'AFFINITY_TOWERS',
      Guild: 'GUILD'
    };
    const unlockKey = unlockByScene[scene];
    const isUnlocked = !unlockKey || GameState.isUnlocked(unlockKey);
    const alpha = sceneExists && isUnlocked ? 1 : 0.45;

    const bg = this.add.rectangle(W / 2, y, BTN_W, BTN_H, BTN_COLOR)
      .setStrokeStyle(1, 0x3a3a6a)
      .setAlpha(alpha);

    this.add.text(W / 2, y, label, {
      font: '20px monospace', fill: '#ffffff'
    }).setOrigin(0.5).setAlpha(alpha);

    if (!sceneExists || !isUnlocked) return;

    bg.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => bg.setFillStyle(BTN_COLOR_DOWN))
      .on('pointerup',   () => { bg.setFillStyle(BTN_COLOR); this.scene.start(scene); })
      .on('pointerout',  () => bg.setFillStyle(BTN_COLOR));
  }

  _idleTick() {
    IdleManager.tick(1000, GameState.campaignProgress, GameState.activeSquad);
  }

  _refreshUI() {
    this._goldText.setText('Gold: '          + CurrencyManager.get('GOLD').toLocaleString());
    this._crystalText.setText('Crystals: '   + CurrencyManager.get('CRYSTALS').toLocaleString());
    this._premText.setText('Prem.Crystals: ' + CurrencyManager.get('PREMIUM_CRYSTALS').toLocaleString());
    this._rateText.setText('+' + IdleManager.getRate(GameState.campaignProgress).toFixed(1) + '/s');
  }
}

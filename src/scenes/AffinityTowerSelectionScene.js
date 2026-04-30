import AffinityTowerManager from '../systems/AffinityTowerManager.js';
import { createVerticalScroll } from '../ui/ScrollPane.js';

const TOWER_CONFIG = {
  FIRE:   { label: 'FIRE TOWER',   symbol: '[F]', bg: 0x3a0a00, border: 0xff5533, textColor: '#ff7755' },
  ICE:    { label: 'ICE TOWER',    symbol: '[I]', bg: 0x001a3a, border: 0x44aaff, textColor: '#66ccff' },
  EARTH:  { label: 'EARTH TOWER',  symbol: '[E]', bg: 0x001a00, border: 0x44cc44, textColor: '#66ee66' },
  SHADOW: { label: 'SHADOW TOWER', symbol: '[S]', bg: 0x1a0033, border: 0xaa33ff, textColor: '#cc66ff' },
  LIGHT:  { label: 'LIGHT TOWER',  symbol: '[L]', bg: 0x2a1a00, border: 0xffdd33, textColor: '#ffee77' },
};

const AFFINITIES = ['FIRE', 'ICE', 'EARTH', 'SHADOW', 'LIGHT'];

export default class AffinityTowerSelectionScene extends Phaser.Scene {
  constructor() { super('AffinityTowerSelection'); }

  create() {
    const W = 480, H = 854;
    this._scrollApi = null;
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);

    this.add.text(W / 2, 36, 'AFFINITY TOWERS', {
      font: '24px monospace', fill: '#ffdd88'
    }).setOrigin(0.5);

    this.add.text(30, 36, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub'));

    this.add.text(W / 2, 70, 'Affinity-matched heroes gain +50% stats', {
      font: '12px monospace', fill: '#888888'
    }).setOrigin(0.5);

    const list = this.add.container(0, 0);
    AFFINITIES.forEach((aff, idx) => {
      this._makeTowerCard(aff, TOWER_CONFIG[aff], 120 + (idx * 120), W, list);
    });
    this._scrollApi = createVerticalScroll(this, list, {
      x: 0, y: 112, width: W, height: H - 120, contentHeight: 120 + (AFFINITIES.length * 120)
    });
  }

  _makeTowerCard(affinity, cfg, y, W, list) {
    const tower   = AffinityTowerManager.getTower(affinity);
    const highest = tower.highestFloor;
    const current = tower.currentFloor;

    // Card background
    const bg = this.add.rectangle(W / 2, y, 440, 100, cfg.bg)
      .setStrokeStyle(2, cfg.border)
      .setInteractive({ useHandCursor: true });
    list.add(bg);

    // Tower label
    list.add(this.add.text(60, y - 28, cfg.symbol + ' ' + cfg.label, {
      font: '17px monospace', fill: cfg.textColor
    }).setOrigin(0, 0.5));

    // Floor info
    const floorStr = highest > 0
      ? 'Best: Floor ' + highest + '   Next: Floor ' + current
      : 'Floor 1  (not started)';
    list.add(this.add.text(60, y - 4, floorStr, {
      font: '12px monospace', fill: '#bbbbbb'
    }).setOrigin(0, 0.5));

    const top = AffinityTowerManager.getLeaderboard(affinity)[0];
    list.add(this.add.text(60, y + 20, `Leaderboard: ${top.name} F${top.floor}  |  You F${highest}`, {
      font: '11px monospace', fill: '#8888aa'
    }).setOrigin(0, 0.5));

    // ENTER button
    const enterBg = this.add.rectangle(W - 70, y, 90, 44, 0x000000)
      .setStrokeStyle(2, cfg.border)
      .setInteractive({ useHandCursor: true });
    list.add(enterBg);
    list.add(this.add.text(W - 70, y, 'ENTER', {
      font: '13px monospace', fill: cfg.textColor
    }).setOrigin(0.5));

    const onEnter = () => this.scene.start('AffinityTower', { affinity });

    bg.on('pointerup', onEnter)
      .on('pointerdown', () => bg.setAlpha(0.7))
      .on('pointerout',  () => bg.setAlpha(1.0));

    enterBg.on('pointerup', onEnter)
      .on('pointerdown', () => enterBg.setFillStyle(0x1a1a1a))
      .on('pointerout',  () => enterBg.setFillStyle(0x000000));
  }
}

import { SIMPLE_UI, addScreenBg, addPanel, addButton, addLabel } from '../ui/SimpleUI.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() { super('Settings'); }

  create() {
    const W = 480;
    const H = 854;
    const c = this.add.container(0, 0);
    addScreenBg(this, c, W, H);
    addPanel(this, c, W / 2, 44, W - 20, 64, SIMPLE_UI.panel);
    addLabel(this, c, W / 2, 44, 'SETTINGS', 24, SIMPLE_UI.gold);
    addButton(this, c, 58, 44, 96, 34, 'BACK', () => this.scene.start('MainHub'));

    addPanel(this, c, W / 2, 220, 444, 280, SIMPLE_UI.panelAlt);
    addLabel(this, c, W / 2, 132, 'CONFIGURATION', 14, SIMPLE_UI.textDim);
    c.add(this.add.text(W / 2, 230,
      'Placeholder settings screen.\n\nFuture toggles:\n- Audio\n- Notifications\n- Accessibility\n- Input options',
      { font: '14px monospace', fill: '#d8d8e8', align: 'center', lineSpacing: 8 }
    ).setOrigin(0.5, 0));
  }
}

export default class SettingsScene extends Phaser.Scene {
  constructor() { super('Settings'); }

  create() {
    const W = 480;
    const H = 854;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);

    this.add.rectangle(W / 2, 44, W, 88, 0x12122a);
    this.add.text(W / 2, 44, '\u2699 SETTINGS', {
      font: '24px monospace',
      fill: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(18, 44, '< BACK', {
      font: '14px monospace',
      fill: '#aaaaaa'
    })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub'));

    this.add.rectangle(W / 2, 250, 420, 220, 0x101024).setStrokeStyle(1, 0x2e2e55);
    this.add.text(W / 2, 210, 'SETTINGS SCENE ONLINE', {
      font: '16px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(W / 2, 260,
      'MainHub navigation now points to a\nregistered Phaser scene.\n\nUse this screen for future toggles\n(audio, notifications, accessibility, etc.).',
      {
        font: '13px monospace',
        fill: '#99aacc',
        align: 'center'
      }
    ).setOrigin(0.5);
  }
}

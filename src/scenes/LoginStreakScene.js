import GameState from '../systems/GameState.js';
import LoginStreakManager from '../systems/LoginStreakManager.js';

export default class LoginStreakScene extends Phaser.Scene {
  constructor() { super('LoginStreak'); }

  init(data) {
    this._returnScene = data?.returnScene || 'MainHub';
  }

  create() {
    const W = 480;
    const claim = LoginStreakManager.claimToday();
    GameState.save();

    this.add.rectangle(W / 2, 427, W, 854, 0x000000).setAlpha(0.84);
    this.add.rectangle(W / 2, 430, W - 38, 620, 0x101028).setStrokeStyle(2, 0x6655aa);
    this.add.text(W / 2, 154, 'LOGIN STREAK', { font: '26px monospace', fill: '#ffdd88' }).setOrigin(0.5);
    this.add.text(W / 2, 194, `Day ${LoginStreakManager.streakDays}`, { font: '19px monospace', fill: '#ffffff' }).setOrigin(0.5);

    const milestones = LoginStreakManager.getMilestones();
    milestones.forEach((m, i) => {
      const y = 260 + i * 92;
      const bg = m.claimed ? 0x173017 : m.reached ? 0x2f2a10 : 0x181828;
      const br = m.claimed ? 0x66cc88 : m.reached ? 0xddbb66 : 0x444466;
      this.add.rectangle(W / 2, y, 380, 72, bg).setStrokeStyle(1, br);
      this.add.text(72, y - 10, `DAY ${m.day}`, { font: '13px monospace', fill: '#ffdd88' });
      this.add.text(72, y + 12, `+${m.premiumCrystals} Premium Crystals`, { font: '12px monospace', fill: '#cc99ff' });
      this.add.text(W - 70, y, m.claimed ? 'CLAIMED' : (m.reached ? 'READY' : 'LOCKED'),
        { font: '11px monospace', fill: m.claimed ? '#66cc88' : m.reached ? '#ffdd88' : '#666688' }).setOrigin(0.5);
    });

    if (claim?.rewardedMilestones?.length) {
      const txt = claim.rewardedMilestones.map(r => `Day ${r.day}: +${r.premiumCrystals}`).join('  ');
      this.add.text(W / 2, 560, `Claimed today — ${txt}`, { font: '11px monospace', fill: '#99ffcc', align: 'center' }).setOrigin(0.5);
    } else {
      this.add.text(W / 2, 560, 'Claimed today — no milestone reward', { font: '11px monospace', fill: '#8888aa' }).setOrigin(0.5);
    }

    const btn = this.add.rectangle(W / 2, 690, 260, 64, 0x1d3d1d).setStrokeStyle(2, 0x66dd88)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start(this._returnScene));
    this.add.text(W / 2, 690, 'CONTINUE', { font: '22px monospace', fill: '#aaffcc' }).setOrigin(0.5);
    btn.on('pointerdown', () => btn.setFillStyle(0x112611)).on('pointerout', () => btn.setFillStyle(0x1d3d1d));
  }
}

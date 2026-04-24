import GameState from '../systems/GameState.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import HeroManager, { HeroInstance } from '../systems/HeroManager.js';
import HERO_DEFINITIONS from '../data/heroDefinitions.js';
import { CURRENCY } from '../data/constants.js';

export default class OnboardingScene extends Phaser.Scene {
  constructor() { super('Onboarding'); }

  create() {
    this._W = 480;
    this._H = 854;
    this._stepCont = this.add.container(0, 0);
    this._tapZone = null;

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this._showStep1();
  }

  _clearStep() {
    this._stepCont.removeAll(true);
    if (this._tapZone) {
      this._tapZone.destroy();
      this._tapZone = null;
    }
    this.time.removeAllEvents();
  }

  _setTapAdvance(callback) {
    this._tapZone = this.add.rectangle(this._W / 2, this._H / 2, this._W, this._H, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => callback());
  }

  _showStep1() {
    this._clearStep();
    const c = this._stepCont;
    c.add(this.add.rectangle(240, 427, 480, 854, 0x0a0a1a));
    c.add(this.add.rectangle(240, 330, 380, 220, 0x15253f, 0.35).setStrokeStyle(1, 0x334466, 0.8));
    c.add(this.add.text(240, 360,
      'The Academy has stood for centuries.\nToday, it needs a champion.',
      { font: '18px monospace', fill: '#ffd700', align: 'center' }).setOrigin(0.5));
    c.add(this.add.text(240, 435, '[ TAP TO SKIP ]',
      { font: '11px monospace', fill: '#888888' }).setOrigin(0.5));

    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      this._showStep2();
    };
    this._setTapAdvance(advance);
    this.time.delayedCall(3000, advance);
  }

  _showStep2() {
    this._clearStep();
    const c = this._stepCont;
    const def = HERO_DEFINITIONS.find(d => d.id === 'hero_cinder_vale');
    c.add(this.add.rectangle(240, 427, 480, 854, 0x090916));
    c.add(this.add.rectangle(240, 320, 340, 250, 0x111128).setStrokeStyle(2, 0xaa6622));
    c.add(this.add.text(240, 240, def?.name || 'Cinder Vale',
      { font: '20px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(240, 285, `CLASS: ${def?.heroClass || 'Unknown'}`,
      { font: '14px monospace', fill: '#66ccff' }).setOrigin(0.5));
    c.add(this.add.text(240, 315, `AFFINITY: ${def?.affinity || 'Unknown'}`,
      { font: '14px monospace', fill: '#ff8888' }).setOrigin(0.5));
    c.add(this.add.text(240, 345, `RARITY: ${def?.rarity || 'Unknown'}`,
      { font: '14px monospace', fill: '#cc88ff' }).setOrigin(0.5));

    const btn = this.add.rectangle(240, 520, 300, 64, 0x29104a)
      .setStrokeStyle(2, 0xcc88ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this._showStep3());
    c.add(btn);
    c.add(this.add.text(240, 520, '[ SEND TO BATTLE ]',
      { font: '16px monospace', fill: '#ffffff' }).setOrigin(0.5));
    this.tweens.add({ targets: btn, alpha: { from: 1, to: 0.6 }, duration: 400, yoyo: true, repeat: -1 });
  }

  _showStep3() {
    this._clearStep();
    const c = this._stepCont;
    c.add(this.add.rectangle(240, 427, 480, 854, 0x0b0b1f));
    c.add(this.add.text(240, 120, 'STAGE 1-1',
      { font: '24px monospace', fill: '#ffd700' }).setOrigin(0.5));

    const tipBg = this.add.rectangle(240, 56, 420, 60, 0x000000, 0.65);
    const tipTx = this.add.text(240, 56,
      'Your hero fights automatically.\nWatch their HP bar.',
      { font: '13px monospace', fill: '#dddddd', align: 'center' }).setOrigin(0.5);
    c.add(tipBg); c.add(tipTx);
    this.time.delayedCall(2000, () => { tipBg.destroy(); tipTx.destroy(); });

    c.add(this.add.text(100, 320, 'Enemy HP',
      { font: '13px monospace', fill: '#ff7777' }));
    const hpBg = this.add.rectangle(240, 360, 300, 28, 0x330000).setStrokeStyle(1, 0xaa3333);
    const hp = this.add.rectangle(240 - 150, 360, 300, 24, 0xff3333).setOrigin(0, 0.5);
    c.add(hpBg); c.add(hp);

    this.tweens.add({
      targets: hp,
      scaleX: 0,
      duration: 2500,
      onComplete: () => this._showUltimatePrompt(c)
    });
  }

  _showUltimatePrompt(c) {
    const glow = this.add.circle(240, 540, 38, 0xffd700, 0.22).setStrokeStyle(2, 0xffd700, 0.8);
    const txt = this.add.text(240, 602, 'ULTIMATE READY — TAP NOW!',
      { font: '16px monospace', fill: '#ffd700' }).setOrigin(0.5);
    c.add(glow); c.add(txt);
    this.tweens.add({ targets: glow, alpha: { from: 0.2, to: 0.85 }, duration: 380, yoyo: true, repeat: -1 });

    const tap = this.add.rectangle(240, 427, 480, 854, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        tap.destroy();
        glow.destroy();
        txt.destroy();
        this._showBattleWin(c);
      });
  }

  _showBattleWin(c) {
    const flash = this.add.rectangle(240, 427, 480, 854, 0xffffff, 0.9);
    c.add(flash);
    this.tweens.add({ targets: flash, alpha: 0, duration: 240, onComplete: () => flash.destroy() });
    c.add(this.add.text(240, 430, 'ENEMY DEFEATED!',
      { font: '30px monospace', fill: '#ffd700' }).setOrigin(0.5));

    CurrencyManager.add(CURRENCY.GOLD, 500);
    GameState.save();

    this.time.delayedCall(1200, () => {
      c.add(this.add.rectangle(240, 620, 360, 130, 0x121224).setStrokeStyle(1, 0x6666aa));
      c.add(this.add.text(240, 592, '+ 500 Arcane Marks  + 120 XP',
        { font: '15px monospace', fill: '#66ff66' }).setOrigin(0.5));
      c.add(this.add.text(240, 640,
        'Idle rewards now active. Come back later to collect.',
        { font: '11px monospace', fill: '#999999', align: 'center' }).setOrigin(0.5));

      let advanced = false;
      const advance = () => {
        if (advanced) return;
        advanced = true;
        this._showStep4();
      };
      const tap = this.add.rectangle(240, 427, 480, 854, 0x000000, 0.001)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', advance);
      this.time.delayedCall(2000, () => { tap.destroy(); advance(); });
    });
  }

  _showStep4() {
    this._clearStep();
    const c = this._stepCont;
    const giftedDef = HERO_DEFINITIONS.find(d => d.rarity === 'UNCOMMON' && d.id !== 'hero_cinder_vale');

    c.add(this.add.rectangle(240, 427, 480, 854, 0x0c1024));
    c.add(this.add.text(240, 130, 'Stage 1-2 complete!',
      { font: '22px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(240, 170, 'A new hero joins your Academy.',
      { font: '15px monospace', fill: '#dddddd' }).setOrigin(0.5));

    if (giftedDef) {
      HeroManager.addHero(new HeroInstance({
        heroDefId: giftedDef.id,
        name: giftedDef.name,
        title: giftedDef.title,
        heroClass: giftedDef.heroClass,
        affinity: giftedDef.affinity,
        rarity: giftedDef.rarity,
        originRarity: giftedDef.rarity,
        baseStats: giftedDef.baseStats,
        normalAbilityIds: giftedDef.normalAbilityIds,
        ultimateAbilityId: giftedDef.ultimateAbilityId,
        ultimateAbilityId2: giftedDef.ultimateAbilityId2 || null
      }));
    }

    const card = this.add.rectangle(240, 360, 320, 180, 0x18182f).setStrokeStyle(2, 0x44aa44);
    card.setScale(0.2);
    c.add(card);
    c.add(this.add.text(240, 330, giftedDef?.name || 'New Hero',
      { font: '20px monospace', fill: '#66ff99' }).setOrigin(0.5));
    c.add(this.add.text(240, 370, giftedDef?.heroClass || 'Unknown',
      { font: '15px monospace', fill: '#aaddff' }).setOrigin(0.5));
    this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 400, ease: 'Back.Out' });

    c.add(this.add.text(240, 470, 'Your roster grows. Two heroes, two rows.',
      { font: '12px monospace', fill: '#aaaaaa' }).setOrigin(0.5));

    this._setTapAdvance(() => this._showStep5());
  }

  _showStep5() {
    this._clearStep();
    const c = this._stepCont;
    c.add(this.add.rectangle(240, 427, 480, 854, 0x0f1224));

    const btn = this.add.rectangle(240, 360, 300, 120, 0xaa8800)
      .setStrokeStyle(2, 0xffdd66)
      .setInteractive({ useHandCursor: true });
    c.add(btn);
    c.add(this.add.text(240, 360, 'COLLECT IDLE GOLD',
      { font: '17px monospace', fill: '#2a1a00' }).setOrigin(0.5));

    btn.on('pointerup', () => {
      btn.disableInteractive();
      CurrencyManager.add(CURRENCY.GOLD, 200);
      const gain = this.add.text(240, 300, '+200 Arcane Marks',
        { font: '16px monospace', fill: '#66ff66' }).setOrigin(0.5);
      c.add(gain);
      this.tweens.add({ targets: gain, y: 250, alpha: 0, duration: 1000, onComplete: () => gain.destroy() });

      c.add(this.add.text(240, 470, 'Your Academy earns even when you rest.',
        { font: '14px monospace', fill: '#ffd700' }).setOrigin(0.5));

      let advanced = false;
      const advance = () => {
        if (advanced) return;
        advanced = true;
        this._showStep6();
      };
      const tap = this.add.rectangle(240, 427, 480, 854, 0x000000, 0.001)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', advance);
      this.time.delayedCall(1500, () => { tap.destroy(); advance(); });
    });
  }

  _showStep6() {
    this._clearStep();
    const c = this._stepCont;
    c.add(this.add.rectangle(240, 427, 480, 854, 0x120d24));
    c.add(this.add.text(240, 220, 'The Summoning Circle is ready.',
      { font: '20px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(240, 275, '↓',
      { font: '48px monospace', fill: '#cc88ff' }).setOrigin(0.5));

    const btn = this.add.rectangle(240, 430, 300, 68, 0x2a1055)
      .setStrokeStyle(2, 0xcc88ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        GameState.addUnlockedSystem('BASIC_SUMMON');
        CurrencyManager.add(CURRENCY.CRYSTALS, 100);
        GameState.save();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Summon'));
      });
    c.add(btn);
    c.add(this.add.text(240, 430, '[ ENTER SUMMON ]',
      { font: '16px monospace', fill: '#ffffff' }).setOrigin(0.5));
  }
}

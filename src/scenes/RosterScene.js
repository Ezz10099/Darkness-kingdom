import GameState from '../systems/GameState.js';
import HeroManager from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import AcademyGroundsManager from '../systems/AcademyGroundsManager.js';
import { RARITY_ORDER, RARITY_CONFIG, CURRENCY } from '../data/constants.js';

const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER:  0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
};
const RARITY_HEX = {
  COMMON: 0xaaaaaa, UNCOMMON: 0x66cc44, RARE: 0x4488ff,
  EPIC: 0xaa44ff, LEGENDARY: 0xffaa00, MYTHIC: 0xff44aa, ASCENDED: 0xff2200
};
const RARITY_STR = {
  COMMON: '#aaaaaa', UNCOMMON: '#66cc44', RARE: '#4488ff',
  EPIC: '#aa44ff', LEGENDARY: '#ffaa00', MYTHIC: '#ff44aa', ASCENDED: '#ff2200'
};
const AFF_ICON = { FIRE: '🔥', ICE: '❄', EARTH: '🌿', SHADOW: '🌑', LIGHT: '✦' };

export default class RosterScene extends Phaser.Scene {
  constructor() { super('Roster'); }

  create() {
    this._root = this.add.container(0, 0);
    this._showList();
  }

  _reset() { this._root.removeAll(true); }

  _isActive(heroId) {
    return GameState.getActiveSquadEntries().some(entry => entry.heroId === heroId);
  }

  // ─── LIST ────────────────────────────────────────────────────────────────────

  _showList() {
    this._reset();
    const c = this._root, W = 480;
    const heroes = HeroManager.getAllHeroes()
      .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]);

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 40, 'ROSTER', { font: '24px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(30, 40, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub')));
    c.add(this.add.text(W - 30, 40, `${heroes.length} heroes`,
      { font: '13px monospace', fill: '#555577' }).setOrigin(1, 0.5));

    if (!heroes.length) {
      c.add(this.add.text(W / 2, 420,
        'No heroes yet.\nClear Stage 1-1 to begin.',
        { font: '16px monospace', fill: '#666666', align: 'center' }).setOrigin(0.5));
      return;
    }

    heroes.forEach((hero, i) => this._drawCard(hero, 108 + i * 90, c));
  }

  _drawCard(hero, y, c) {
    const W = 480, stats = hero.computeStats();
    const maxStars = RARITY_CONFIG[hero.rarity].maxStars;
    const stars    = '★'.repeat(hero.stars) + '☆'.repeat(maxStars - hero.stars);
    const isActive = this._isActive(hero.id);

    const bg = this.add.rectangle(W / 2, y, 446, 80,
      CLASS_COLORS[hero.heroClass] || 0x333344)
      .setStrokeStyle(1, RARITY_HEX[hero.rarity] || 0xaaaaaa)
      .setAlpha(0.82)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => bg.setAlpha(0.55))
      .on('pointerout',  () => bg.setAlpha(0.82))
      .on('pointerup',   () => { bg.setAlpha(0.82); this._showDetail(hero); });
    c.add(bg);

    // Left column
    c.add(this.add.text(30, y - 24, `${hero.name}${hero.title ? '  ' + hero.title : ''}`,
      { font: '15px monospace', fill: '#ffffff' }).setOrigin(0, 0.5));
    c.add(this.add.text(30, y - 2,
      `${hero.heroClass}  ${AFF_ICON[hero.affinity] || hero.affinity}`,
      { font: '12px monospace', fill: '#dddddd' }).setOrigin(0, 0.5));
    c.add(this.add.text(30, y + 20, stars.slice(0, 9),
      { font: '12px monospace', fill: '#ffdd44' }).setOrigin(0, 0.5));

    // Right column
    c.add(this.add.text(W - 30, y - 24, `LV ${hero.level}`,
      { font: '15px monospace', fill: '#ffffff' }).setOrigin(1, 0.5));
    c.add(this.add.text(W - 30, y - 2, hero.rarity,
      { font: '11px monospace', fill: RARITY_STR[hero.rarity] }).setOrigin(1, 0.5));

    if (isActive) {
      c.add(this.add.text(W - 30, y + 20,
        `HP:${stats.hp} ATK:${stats.damage}`,
        { font: '10px monospace', fill: '#aaaaaa' }).setOrigin(1, 0.5));
    } else {
      // Benched hero: training label + XP progress bar
      c.add(this.add.text(W - 30, y + 20, 'TRAINING',
        { font: '10px monospace', fill: '#33ccaa' }).setOrigin(1, 0.5));
      const xpPct  = Math.min(1, hero.xp / hero.xpThreshold());
      const barL   = W / 2 - 218;
      const barW   = 436;
      c.add(this.add.rectangle(barL, y + 35, barW, 5, 0x0d2218).setOrigin(0, 0.5));
      if (xpPct > 0) {
        c.add(this.add.rectangle(barL, y + 35, Math.max(2, barW * xpPct), 5, 0x33ccaa).setOrigin(0, 0.5));
      }
    }
  }

  // ─── DETAIL ──────────────────────────────────────────────────────────────────

  _showDetail(hero) {
    this._reset();
    const c = this._root, W = 480, stats = hero.computeStats();
    const maxStars = RARITY_CONFIG[hero.rarity].maxStars;
    const stars    = '★'.repeat(hero.stars) + '☆'.repeat(maxStars - hero.stars);

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));

    // Header band
    c.add(this.add.rectangle(W / 2, 105, W, 150,
      CLASS_COLORS[hero.heroClass] || 0x333344).setAlpha(0.55));
    c.add(this.add.text(30, 38, '< ROSTER', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this._showList()));
    c.add(this.add.text(W / 2, 72, hero.name,
      { font: '28px monospace', fill: '#ffffff' }).setOrigin(0.5));
    if (hero.title) {
      c.add(this.add.text(W / 2, 100, hero.title,
        { font: '14px monospace', fill: '#ffaa44' }).setOrigin(0.5));
    }
    c.add(this.add.text(W / 2, hero.title ? 124 : 108,
      `${hero.heroClass}  |  ${hero.affinity}  |  ${hero.rarity}`,
      { font: '13px monospace', fill: RARITY_STR[hero.rarity] }).setOrigin(0.5));
    c.add(this.add.text(W / 2, hero.title ? 148 : 132,
      stars.slice(0, 9),
      { font: '15px monospace', fill: '#ffdd44' }).setOrigin(0.5));

    // Stats panel
    c.add(this.add.rectangle(W / 2, 258, 438, 100, 0x111130).setStrokeStyle(1, 0x2a2a55));
    c.add(this.add.text(W / 2, 218, 'COMBAT STATS',
      { font: '12px monospace', fill: '#6666aa' }).setOrigin(0.5));
    [
      { label: 'HP',      val: stats.hp,      x: 100 },
      { label: 'DEFENSE', val: stats.defense,  x: 240 },
      { label: 'DAMAGE',  val: stats.damage,   x: 380 }
    ].forEach(s => {
      c.add(this.add.text(s.x, 240, s.label, { font: '11px monospace', fill: '#7777aa' }).setOrigin(0.5));
      c.add(this.add.text(s.x, 268, `${s.val}`, { font: '24px monospace', fill: '#ffffff' }).setOrigin(0.5));
    });

    // Level / XP panel
    c.add(this.add.rectangle(W / 2, 368, 438, 84, 0x111130).setStrokeStyle(1, 0x2a2a55));
    c.add(this.add.text(W / 2, 337,
      `LEVEL  ${hero.level} / ${hero.currentStarLevelCap()}`,
      { font: '16px monospace', fill: '#ffffff' }).setOrigin(0.5));
    const xpPct  = Math.min(1, hero.xp / hero.xpThreshold());
    const barX   = W / 2 - 185;
    c.add(this.add.rectangle(W / 2, 360, 370, 10, 0x221144));
    if (xpPct > 0) {
      c.add(this.add.rectangle(barX, 360, Math.max(2, 370 * xpPct), 10, 0x8833ff).setOrigin(0, 0.5));
    }
    c.add(this.add.text(W / 2, 378,
      `XP ${hero.xp} / ${hero.xpThreshold()}`,
      { font: '11px monospace', fill: '#8855bb' }).setOrigin(0.5));
    c.add(this.add.text(W - 30, 396,
      `Stars ${hero.stars}★ of ${maxStars}★ max`,
      { font: '11px monospace', fill: '#666688' }).setOrigin(1, 0.5));

    // Training info for benched heroes
    const isActive = this._isActive(hero.id);
    if (!isActive) {
      const xpRate  = AcademyGroundsManager.getXpRate(GameState.campaignProgress).toFixed(1);
      const capLvl  = AcademyGroundsManager.getCapLevel(GameState.activeSquad);
      const capText = capLvl > 0 ? `cap LV${capLvl}` : 'no squad';
      c.add(this.add.text(30, 407,
        `TRAINING  +${xpRate} XP/sec`,
        { font: '9px monospace', fill: '#33ccaa' }).setOrigin(0, 0.5));
      c.add(this.add.text(W - 30, 407,
        capText,
        { font: '9px monospace', fill: '#226644' }).setOrigin(1, 0.5));
    }

    // Level up button
    this._addLevelUpBtn(hero, c, W);

    // Gear slots
    c.add(this.add.text(W / 2, 508, 'GEAR SLOTS',
      { font: '12px monospace', fill: '#6666aa' }).setOrigin(0.5));
    ['WEAPON', 'ROBE', 'ACCESSORY', 'RELIC', 'SIGIL'].forEach((slot, i) => {
      const x = 50 + i * 96;
      c.add(this.add.rectangle(x, 558, 84, 64, 0x111130).setStrokeStyle(1, 0x2a2a55));
      c.add(this.add.text(x, 536, slot.slice(0, 5),
        { font: '9px monospace', fill: '#555577' }).setOrigin(0.5));
      const equipped = hero.gear[slot];
      c.add(this.add.text(x, 558, equipped ? '⚔' : '—',
        { font: '18px monospace', fill: equipped ? '#ffdd44' : '#333355' }).setOrigin(0.5));
      c.add(this.add.text(x, 578, equipped ? 'EQP' : 'EMPTY',
        { font: '9px monospace', fill: equipped ? '#aaaaaa' : '#333355' }).setOrigin(0.5));
    });
  }

  _addLevelUpBtn(hero, c, W) {
    const cost    = hero.level * 50;
    const canLvl  = hero.canLevelUp();
    const hasGold = CurrencyManager.get(CURRENCY.GOLD) >= cost;
    const active  = canLvl && hasGold;

    let label, textColor;
    if (canLvl && hasGold) { label = `LEVEL UP  -${cost}g`;  textColor = '#66ff66'; }
    else if (canLvl)        { label = `NEED ${cost}g`;         textColor = '#ff7744'; }
    else if (hero.level >= hero.currentStarLevelCap())
                            { label = 'STAR UP TO LEVEL MORE'; textColor = '#ffdd44'; }
    else                    { label = `NEED MORE XP`;          textColor = '#555577'; }

    const btn = this.add.rectangle(W / 2, 448, 360, 54,
      active ? 0x0b3a0b : 0x141428)
      .setStrokeStyle(1, active ? 0x44ff44 : 0x333344);
    c.add(btn);
    c.add(this.add.text(W / 2, 448, label,
      { font: '14px monospace', fill: textColor }).setOrigin(0.5));

    if (active) {
      btn.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        if (hero.levelUp(cost)) { GameState.save(); this._showDetail(hero); }
      });
    }
  }
}

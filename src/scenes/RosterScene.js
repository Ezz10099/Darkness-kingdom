import GameState from '../systems/GameState.js';
import HeroManager from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import AcademyGroundsManager from '../systems/AcademyGroundsManager.js';
import { RARITY_ORDER, RARITY_CONFIG, CURRENCY } from '../data/constants.js';
import createVerticalScroll from '../ui/ScrollPane.js';

const W = 480;
const H = 854;
const HEADER_H = 86;
const CARD_H = 84;
const CARD_GAP = 10;

const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER: 0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
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
  _heroAssetKey(type, heroId) { return `hero_${type}_${heroId}`; }
  _addHeroImage(c, type, heroId, x, y, w, h) {
    const key = this._heroAssetKey(type, heroId);
    if (this.textures.exists(key)) {
      c.add(this.add.image(x, y, key).setDisplaySize(w, h));
      return true;
    }
    return false;
  }

  create() {
    this._root = this.add.container(0, 0);
    this._scroll = null;
    this._showList();
  }

  _reset() {
    if (this._scroll) { this._scroll.destroy(); this._scroll = null; }
    this._root.removeAll(true);
  }

  _isActive(heroId) {
    return GameState.getActiveSquadEntries().some(entry => entry.heroId === heroId);
  }

  _drawBase(title, backLabel = '< BACK', backAction = () => this.scene.start('MainHub')) {
    const c = this._root;
    c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a));
    c.add(this.add.rectangle(W / 2, HEADER_H / 2, W, HEADER_H, 0x0d0d22).setStrokeStyle(1, 0x333366));
    c.add(this.add.text(W / 2, 34, title, { font: '24px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(24, 34, backLabel, { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).on('pointerup', backAction));
  }

  _showList() {
    this._reset();
    const c = this._root;
    const heroes = HeroManager.getAllHeroes()
      .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]);

    this._drawBase('HEROES');
    c.add(this.add.text(W - 24, 34, `${heroes.length} heroes`, { font: '13px monospace', fill: '#777799' }).setOrigin(1, 0.5));
    c.add(this.add.text(W / 2, 64, 'Scroll roster · tap a hero for details', { font: '11px monospace', fill: '#777799' }).setOrigin(0.5));

    if (!heroes.length) {
      c.add(this.add.text(W / 2, 420, 'No heroes yet.\nClear Stage 1-1 to begin.',
        { font: '16px monospace', fill: '#666666', align: 'center' }).setOrigin(0.5));
      return;
    }

    const list = this.add.container(0, 0);
    c.add(list);
    heroes.forEach((hero, i) => this._drawCard(hero, 20 + i * (CARD_H + CARD_GAP), list));
    this._scroll = createVerticalScroll(this, list, {
      x: 0,
      y: HEADER_H,
      width: W,
      height: H - HEADER_H,
      contentHeight: 40 + heroes.length * (CARD_H + CARD_GAP)
    });
  }

  _drawCard(hero, y, c) {
    const stats = hero.computeStats();
    const maxStars = RARITY_CONFIG[hero.rarity].maxStars;
    const stars = '★'.repeat(hero.stars) + '☆'.repeat(maxStars - hero.stars);
    const isActive = this._isActive(hero.id);
    const bg = this.add.rectangle(W / 2, y + CARD_H / 2, 436, CARD_H,
      CLASS_COLORS[hero.heroClass] || 0x333344)
      .setStrokeStyle(1, RARITY_HEX[hero.rarity] || 0xaaaaaa)
      .setAlpha(0.62)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', (pointer) => {
        if (!this._scroll?.isTap(pointer)) return;
        this._showDetail(hero);
      });
    c.add(bg);

    const hasPortrait = this._addHeroImage(c, 'portrait', hero.id, 58, y + CARD_H / 2, 52, 52);
    if (!hasPortrait) {
      c.add(this.add.rectangle(58, y + CARD_H / 2, 52, 52, 0x1b1b2c).setStrokeStyle(1, 0x444466));
      c.add(this.add.text(58, y + CARD_H / 2, 'HERO', { font: '9px monospace', fill: '#777799' }).setOrigin(0.5));
    }

    c.add(this.add.text(90, y + 20, `${hero.name}${hero.title ? '  ' + hero.title : ''}`,
      { font: '15px monospace', fill: '#ffffff' }).setOrigin(0, 0.5));
    c.add(this.add.text(90, y + 42, `${hero.heroClass}  ${AFF_ICON[hero.affinity] || hero.affinity}`,
      { font: '12px monospace', fill: '#dddddd' }).setOrigin(0, 0.5));
    c.add(this.add.text(90, y + 64, stars.slice(0, 9),
      { font: '12px monospace', fill: '#ffdd44' }).setOrigin(0, 0.5));

    c.add(this.add.text(W - 30, y + 20, `LV ${hero.level}`,
      { font: '15px monospace', fill: '#ffffff' }).setOrigin(1, 0.5));
    c.add(this.add.text(W - 30, y + 42, hero.rarity,
      { font: '11px monospace', fill: RARITY_STR[hero.rarity] }).setOrigin(1, 0.5));
    c.add(this.add.text(W - 30, y + 64,
      isActive ? `HP:${stats.hp} ATK:${stats.damage}` : 'TRAINING',
      { font: '10px monospace', fill: isActive ? '#aaaaaa' : '#33ccaa' }).setOrigin(1, 0.5));
  }

  _showDetail(hero) {
    this._reset();
    const c = this._root;
    const stats = hero.computeStats();
    const maxStars = RARITY_CONFIG[hero.rarity].maxStars;
    const stars = '★'.repeat(hero.stars) + '☆'.repeat(maxStars - hero.stars);

    this._drawBase('HERO DETAIL', '< ROSTER', () => this._showList());
    c.add(this.add.rectangle(W / 2, HEADER_H + 52, W, 104,
      CLASS_COLORS[hero.heroClass] || 0x333344).setAlpha(0.55));
    c.add(this.add.text(W / 2, HEADER_H + 24, hero.name, { font: '24px monospace', fill: '#ffffff' }).setOrigin(0.5));
    if (hero.title) c.add(this.add.text(W / 2, HEADER_H + 50, hero.title, { font: '13px monospace', fill: '#ffaa44' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, HEADER_H + 74, `${hero.heroClass} | ${hero.affinity} | ${hero.rarity}`,
      { font: '12px monospace', fill: RARITY_STR[hero.rarity] }).setOrigin(0.5));
    c.add(this.add.text(W / 2, HEADER_H + 96, stars.slice(0, 9), { font: '14px monospace', fill: '#ffdd44' }).setOrigin(0.5));
    const hasFull = this._addHeroImage(c, 'full', hero.id, W / 2, HEADER_H + 205, 180, 180);
    if (!hasFull) {
      c.add(this.add.rectangle(W / 2, HEADER_H + 205, 180, 180, 0x101025).setStrokeStyle(1, 0x333355));
      c.add(this.add.text(W / 2, HEADER_H + 205, 'FULL ART\nMISSING', { font: '12px monospace', fill: '#666688', align: 'center' }).setOrigin(0.5));
    }

    const detail = this.add.container(0, 0);
    c.add(detail);
    let y = 18;

    detail.add(this.add.rectangle(W / 2, y + 52, 438, 104, 0x111130).setStrokeStyle(1, 0x2a2a55));
    detail.add(this.add.text(W / 2, y + 16, 'COMBAT STATS', { font: '12px monospace', fill: '#7777aa' }).setOrigin(0.5));
    [
      { label: 'HP', val: stats.hp, x: 100 },
      { label: 'DEFENSE', val: stats.defense, x: 240 },
      { label: 'DAMAGE', val: stats.damage, x: 380 }
    ].forEach(s => {
      detail.add(this.add.text(s.x, y + 45, s.label, { font: '11px monospace', fill: '#7777aa' }).setOrigin(0.5));
      detail.add(this.add.text(s.x, y + 73, `${s.val}`, { font: '22px monospace', fill: '#ffffff' }).setOrigin(0.5));
    });
    y += 124;

    detail.add(this.add.rectangle(W / 2, y + 48, 438, 96, 0x111130).setStrokeStyle(1, 0x2a2a55));
    detail.add(this.add.text(W / 2, y + 20, `LEVEL ${hero.level} / ${hero.currentStarLevelCap()}`,
      { font: '16px monospace', fill: '#ffffff' }).setOrigin(0.5));
    const xpPct = Math.min(1, hero.xp / hero.xpThreshold());
    detail.add(this.add.rectangle(W / 2, y + 44, 370, 10, 0x221144));
    if (xpPct > 0) detail.add(this.add.rectangle(W / 2 - 185, y + 44, Math.max(2, 370 * xpPct), 10, 0x8833ff).setOrigin(0, 0.5));
    detail.add(this.add.text(W / 2, y + 64, `XP ${hero.xp} / ${hero.xpThreshold()}`, { font: '11px monospace', fill: '#8855bb' }).setOrigin(0.5));
    detail.add(this.add.text(W / 2, y + 82, `Stars ${hero.stars}★ of ${maxStars}★ max`, { font: '11px monospace', fill: '#666688' }).setOrigin(0.5));
    y += 116;

    if (!this._isActive(hero.id)) {
      const xpRate = AcademyGroundsManager.getXpRate(GameState.campaignProgress).toFixed(1);
      const capLvl = AcademyGroundsManager.getCapLevel(GameState.activeSquad);
      detail.add(this.add.rectangle(W / 2, y + 22, 438, 44, 0x0d2218).setStrokeStyle(1, 0x226644));
      detail.add(this.add.text(W / 2, y + 22, `TRAINING +${xpRate} XP/sec · ${capLvl > 0 ? `cap LV${capLvl}` : 'no squad'}`,
        { font: '11px monospace', fill: '#33ccaa' }).setOrigin(0.5));
      y += 58;
    }

    this._addLevelUpBtn(hero, detail, y + 26);
    y += 76;

    detail.add(this.add.text(W / 2, y, 'GEAR SLOTS', { font: '12px monospace', fill: '#7777aa' }).setOrigin(0.5));
    y += 40;
    ['WEAPON', 'ROBE', 'ACCESSORY', 'RELIC', 'SIGIL'].forEach((slot, i) => {
      const rowY = y + i * 54;
      const equipped = hero.gear[slot];
      detail.add(this.add.rectangle(W / 2, rowY, 438, 44, 0x111130).setStrokeStyle(1, 0x2a2a55));
      detail.add(this.add.text(36, rowY, slot, { font: '12px monospace', fill: '#8888aa' }).setOrigin(0, 0.5));
      detail.add(this.add.text(W - 36, rowY, equipped ? 'EQUIPPED' : 'EMPTY',
        { font: '12px monospace', fill: equipped ? '#ffdd44' : '#555577' }).setOrigin(1, 0.5));
    });
    y += 5 * 54 + 30;

    this._scroll = createVerticalScroll(this, detail, {
      x: 0,
      y: HEADER_H + 306,
      width: W,
      height: H - HEADER_H - 306,
      contentHeight: y
    });
  }

  _addLevelUpBtn(hero, c, y) {
    const cost = hero.level * 50;
    const canLvl = hero.canLevelUp();
    const hasGold = CurrencyManager.get(CURRENCY.GOLD) >= cost;
    const active = canLvl && hasGold;
    const label = active ? `LEVEL UP -${cost}g`
      : canLvl ? `NEED ${cost}g`
        : hero.level >= hero.currentStarLevelCap() ? 'STAR UP TO LEVEL MORE' : 'NEED MORE XP';
    const btn = this.add.rectangle(W / 2, y, 360, 50, active ? 0x0b3a0b : 0x141428)
      .setStrokeStyle(1, active ? 0x44ff44 : 0x333344);
    c.add(btn);
    c.add(this.add.text(W / 2, y, label, { font: '14px monospace', fill: active ? '#66ff66' : '#777799' }).setOrigin(0.5));
    if (active) {
      btn.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        if (hero.levelUp(cost)) { GameState.save(); this._showDetail(hero); }
      });
    }
  }
}

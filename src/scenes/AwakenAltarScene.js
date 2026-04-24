import HeroManager from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import GameState from '../systems/GameState.js';
import { RARITY_ORDER, RARITY_CONFIG, CURRENCY, ASCENSION_CEILING, CURRENCY_LABEL } from '../data/constants.js';

const RARITY_HEX = {
  COMMON: 0xaaaaaa, UNCOMMON: 0x66cc44, RARE: 0x4488ff,
  EPIC: 0xaa44ff, LEGENDARY: 0xffaa00, MYTHIC: 0xff44aa, ASCENDED: 0xff2200
};
const RARITY_STR = {
  COMMON: '#aaaaaa', UNCOMMON: '#66cc44', RARE: '#4488ff',
  EPIC: '#aa44ff', LEGENDARY: '#ffaa00', MYTHIC: '#ff44aa', ASCENDED: '#ff2200'
};
const AFF_ICON = { FIRE: '🔥', ICE: '❄', EARTH: '🌿', SHADOW: '🌑', LIGHT: '✦' };

const RESET_FEE_RULES = Object.freeze([
  { min: 1,  max: 20,  baseFee: 500,  levelMultiplier: 5 },
  { min: 21, max: 50,  baseFee: 1000, levelMultiplier: 8 },
  { min: 51, max: 80,  baseFee: 2500, levelMultiplier: 12 },
  { min: 81, max: 100, baseFee: 5000, levelMultiplier: 18 }
]);

function resetFee(hero) {
  const lvl = Math.max(1, Number(hero.level) || 1);
  const rule = RESET_FEE_RULES.find(r => lvl >= r.min && lvl <= r.max) || RESET_FEE_RULES[RESET_FEE_RULES.length - 1];
  return rule.baseFee + ((lvl ** 2) * rule.levelMultiplier);
}

function nextRarity(hero) {
  const keys = Object.keys(RARITY_ORDER).sort((a, b) => RARITY_ORDER[a] - RARITY_ORDER[b]);
  return keys[RARITY_ORDER[hero.rarity] + 1] || null;
}

export default class AwakenAltarScene extends Phaser.Scene {
  constructor() { super('AwakenAltar'); }

  create() {
    this._root = this.add.container(0, 0);
    this._showList();
  }

  _reset() { this._root.removeAll(true); }

  // ─── LIST ────────────────────────────────────────────────────────────────────

  _showList() {
    this._reset();
    const c = this._root, W = 480;
    const heroes = HeroManager.getAllHeroes()
      .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]);

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 40, 'AWAKENING ALTAR', { font: '22px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(30, 40, '< BACK', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MainHub')));

    const shards = CurrencyManager.get(CURRENCY.AWAKENING_SHARDS);
    c.add(this.add.text(W / 2, 74, `✦ ${shards} ${CURRENCY_LABEL.AWAKENING_SHARDS}`, { font: '13px monospace', fill: '#cc88ff' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 94, 'Tap a hero to Ascend or Reset', { font: '11px monospace', fill: '#444466' }).setOrigin(0.5));

    if (!heroes.length) {
      c.add(this.add.text(W / 2, 420, 'No heroes yet.', { font: '16px monospace', fill: '#666666' }).setOrigin(0.5));
      return;
    }

    heroes.forEach((hero, i) => this._drawCard(hero, 140 + i * 82, c));
  }

  _drawCard(hero, y, c) {
    const W = 480;
    const canAsc = hero.canAscend();

    const bg = this.add.rectangle(W / 2, y, 446, 72, 0x111130)
      .setStrokeStyle(canAsc ? 2 : 1, canAsc ? 0xffaa00 : (RARITY_HEX[hero.rarity] || 0x333355))
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => bg.setAlpha(0.55))
      .on('pointerout',  () => bg.setAlpha(1))
      .on('pointerup',   () => { bg.setAlpha(1); this._showDetail(hero); });
    c.add(bg);

    c.add(this.add.text(30, y - 16, hero.name, { font: '15px monospace', fill: '#ffffff' }).setOrigin(0, 0.5));
    c.add(this.add.text(30, y + 4,  `${AFF_ICON[hero.affinity] || ''} ${hero.heroClass}  LV ${hero.level}`, { font: '11px monospace', fill: '#aaaaaa' }).setOrigin(0, 0.5));
    c.add(this.add.text(30, y + 22, hero.rarity, { font: '11px monospace', fill: RARITY_STR[hero.rarity] }).setOrigin(0, 0.5));

    if (canAsc) {
      c.add(this.add.text(W - 30, y, 'ASCEND\nREADY ✦', { font: '11px monospace', fill: '#ffaa00', align: 'right' }).setOrigin(1, 0.5));
    } else {
      c.add(this.add.text(W - 30, y - 10, `${hero.awakeningShards}✦ shards`, { font: '11px monospace', fill: '#7755aa' }).setOrigin(1, 0.5));
      c.add(this.add.text(W - 30, y + 10, `reset: ${resetFee(hero)}`, { font: '10px monospace', fill: '#555577' }).setOrigin(1, 0.5));
    }
  }

  // ─── DETAIL ──────────────────────────────────────────────────────────────────

  _showDetail(hero) {
    this._reset();
    const c = this._root, W = 480;
    const next    = nextRarity(hero);
    const ceiling = ASCENSION_CEILING[hero.originRarity];
    const atCeil  = ceiling ? RARITY_ORDER[hero.rarity] >= RARITY_ORDER[ceiling] : true;
    const fee     = resetFee(hero);

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));

    // Header
    c.add(this.add.text(30, 40, '< ALTAR', { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this._showList()));
    c.add(this.add.text(W / 2, 40, 'AWAKENING ALTAR', { font: '20px monospace', fill: '#ffd700' }).setOrigin(0.5));

    // Hero card
    c.add(this.add.rectangle(W / 2, 132, 446, 110, 0x111130).setStrokeStyle(1, RARITY_HEX[hero.rarity] || 0x333355));
    c.add(this.add.text(W / 2, 88,  hero.name, { font: '22px monospace', fill: '#ffffff' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 114, `${hero.heroClass}  ${AFF_ICON[hero.affinity] || hero.affinity}  LV ${hero.level}`, { font: '12px monospace', fill: '#aaaaaa' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 138, hero.rarity, { font: '16px monospace', fill: RARITY_STR[hero.rarity] }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 162, `${hero.awakeningShards} ${CURRENCY_LABEL.AWAKENING_SHARDS}`, { font: '12px monospace', fill: '#cc88ff' }).setOrigin(0.5));

    // ── ASCEND PANEL ──
    c.add(this.add.rectangle(W / 2, 282, 446, 130, 0x0d0d25).setStrokeStyle(1, 0x2a2a55));
    c.add(this.add.text(W / 2, 222, '— RARITY ASCENSION —', { font: '13px monospace', fill: '#ffaa00' }).setOrigin(0.5));

    if (!ceiling || atCeil) {
      c.add(this.add.text(W / 2, 282, 'MAX RARITY REACHED\nfor this hero lineage', { font: '13px monospace', fill: '#555577', align: 'center' }).setOrigin(0.5));
    } else if (hero.canAscend()) {
      c.add(this.add.text(W / 2, 252, `${hero.rarity}  →  ${next}`, { font: '16px monospace', fill: '#ffffff' }).setOrigin(0.5));
      c.add(this.add.text(W / 2, 274, `Cost: 50 ${CURRENCY_LABEL.AWAKENING_SHARDS}`, { font: '12px monospace', fill: '#cc88ff' }).setOrigin(0.5));
      this._btn(c, W / 2, 308, 320, 44, '✦  ASCEND NOW', '#ffaa00', 0x1a0d00, 0xffaa00, () => {
        if (hero.ascend()) { GameState.save(); this._ascendEffect(hero); }
      });
    } else {
      const needed = 50 - hero.awakeningShards;
      c.add(this.add.text(W / 2, 252, `${hero.rarity}  →  ${next}`, { font: '14px monospace', fill: '#555566' }).setOrigin(0.5));
      c.add(this.add.text(W / 2, 274, `Need ${needed} more shards  (have ${hero.awakeningShards} / 50)`, { font: '11px monospace', fill: '#663333' }).setOrigin(0.5));
      c.add(this.add.text(W / 2, 298, 'Get shards from duplicate pulls', { font: '10px monospace', fill: '#444455' }).setOrigin(0.5));
    }

    // ── RESET PANEL ──
    c.add(this.add.rectangle(W / 2, 460, 446, 134, 0x0d0d25).setStrokeStyle(1, 0x2a2a55));
    c.add(this.add.text(W / 2, 400, '— HERO RESET —', { font: '13px monospace', fill: '#ff6644' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 424, `Reset to Level 1  |  Fee: ${fee.toLocaleString()} ${CURRENCY_LABEL.GOLD}`, { font: '12px monospace', fill: '#aaaaaa' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 446, `Refund: ${hero._goldInvested.toLocaleString()} ${CURRENCY_LABEL.GOLD} (leveling costs)`, { font: '12px monospace', fill: '#55ee55' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 468, 'Stars, Rarity & Awakening Shards are NOT refunded', { font: '10px monospace', fill: '#664444' }).setOrigin(0.5));

    const canReset = hero.level > 1 && CurrencyManager.get(CURRENCY.GOLD) >= fee;
    const resetLabel = hero.level === 1 ? 'ALREADY LEVEL 1' : !canReset ? `NEED ${fee.toLocaleString()}` : `RESET HERO  −${fee}`;
    this._btn(c, W / 2, 500, 320, 44, resetLabel,
      canReset ? '#ff6644' : '#444455',
      canReset ? 0x1a0500 : 0x111122,
      canReset ? 0xff4422 : 0x333344,
      canReset ? () => { if (hero.reset(fee) !== null) { GameState.save(); this._resetEffect(hero); } } : null
    );

    // ── STAR UP HINT ──
    if (hero.canStarUp()) {
      c.add(this.add.rectangle(W / 2, 606, 446, 48, 0x0d0d25).setStrokeStyle(1, 0xffdd44));
      c.add(this.add.text(W / 2, 598, `★ STAR UP AVAILABLE — ${hero.stars}★ → ${hero.stars + 1}★`, { font: '11px monospace', fill: '#ffdd44' }).setOrigin(0.5));
      c.add(this.add.text(W / 2, 616, 'Use Awakening Shards in the Roster view', { font: '10px monospace', fill: '#888866' }).setOrigin(0.5));
    }
  }

  _btn(c, x, y, w, h, label, textColor, bgColor, strokeColor, onTap) {
    const btn = this.add.rectangle(x, y, w, h, bgColor).setStrokeStyle(1, strokeColor);
    c.add(btn);
    c.add(this.add.text(x, y, label, { font: '13px monospace', fill: textColor }).setOrigin(0.5));
    if (onTap) {
      btn.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => btn.setFillStyle(0x000000))
        .on('pointerout',  () => btn.setFillStyle(bgColor))
        .on('pointerup',   () => { btn.setFillStyle(bgColor); onTap(); });
    }
  }

  // ─── RESULT SCREENS ──────────────────────────────────────────────────────────

  _ascendEffect(hero) {
    this._reset();
    const c = this._root, W = 480, H = 854;
    c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a));
    c.add(this.add.rectangle(W / 2, H / 2, W, H, RARITY_HEX[hero.rarity] || 0xffaa00).setAlpha(0.12));

    c.add(this.add.text(W / 2, 280, '✦  ASCENDED  ✦', { font: '30px monospace', fill: RARITY_STR[hero.rarity] }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 336, hero.name, { font: '22px monospace', fill: '#ffffff' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 372, `is now  ${hero.rarity}`, { font: '20px monospace', fill: RARITY_STR[hero.rarity] }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 416, `${hero.awakeningShards} shards remaining`, { font: '13px monospace', fill: '#cc88ff' }).setOrigin(0.5));

    const stats = hero.computeStats();
    c.add(this.add.text(W / 2, 460, `HP ${stats.hp}  DEF ${stats.defense}  ATK ${stats.damage}`, { font: '13px monospace', fill: '#aaaaaa' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 560, 'Tap to continue', { font: '13px monospace', fill: '#444466' }).setOrigin(0.5));

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setAlpha(0.001)
      .setInteractive().on('pointerup', () => this._showDetail(hero));
  }

  _resetEffect(hero) {
    this._reset();
    const c = this._root, W = 480, H = 854;
    c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a));

    c.add(this.add.text(W / 2, 310, 'HERO RESET', { font: '28px monospace', fill: '#ff6644' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 360, hero.name, { font: '20px monospace', fill: '#ffffff' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 398, 'returned to Level 1', { font: '14px monospace', fill: '#888888' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 434, `Leveling ${CURRENCY_LABEL.GOLD} refunded`, { font: '13px monospace', fill: '#55ee55' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 458, 'Stars, Rarity & Awakening Shards unchanged', { font: '12px monospace', fill: '#665544' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 560, 'Tap to continue', { font: '13px monospace', fill: '#444466' }).setOrigin(0.5));

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setAlpha(0.001)
      .setInteractive().on('pointerup', () => this._showDetail(hero));
  }
}

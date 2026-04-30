import GameState from '../systems/GameState.js';
import SummonManager, { BANNER_RATES } from '../systems/SummonManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import HERO_DEFINITIONS from '../data/heroDefinitions.js';
import { CURRENCY, CURRENCY_LABEL } from '../data/constants.js';
import { SIMPLE_UI, addScreenBg, addHeader, addPanel, addButton, addLabel } from '../ui/SimpleUI.js';

const W = 480;
const H = 854;

const RARITY_STR = {
  COMMON: '#888888', UNCOMMON: '#44aa44', RARE: '#4488ff',
  EPIC: '#aa44ff', LEGENDARY: '#ffaa00', MYTHIC: '#ff4444', ASCENDED: '#ff88ff'
};

const BANNER_POOLS = {
  BASIC: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC'],
  ADVANCED: ['RARE', 'EPIC', 'LEGENDARY']
};

const SUMMONABLE_HERO_DEFINITIONS = HERO_DEFINITIONS.filter(d => d.source !== 'ARENA_SHOP');

const BANNERS = {
  BASIC: {
    key: 'BASIC', label: 'BASIC', unlockKey: 'BASIC_SUMMON',
    currency: CURRENCY.CRYSTALS, currencyLabel: CURRENCY_LABEL.CRYSTALS,
    cost1: 100, cost10: 900, pityMax: 30, pityLabel: 'Epic pity'
  },
  ADVANCED: {
    key: 'ADVANCED', label: 'ADVANCED', unlockKey: 'ADVANCED_SUMMON',
    currency: CURRENCY.PREMIUM_CRYSTALS, currencyLabel: CURRENCY_LABEL.PREMIUM_CRYSTALS,
    cost1: 100, cost10: 900, pityMax: 80, pityLabel: 'Legendary pity'
  }
};

export default class SummonScene extends Phaser.Scene {
  constructor() { super('Summon'); }

  create() {
    this._syncBasicSummonUnlock();
    this._activeBanner = 'BASIC';
    this._lastResults = [];
    this._wishlistPage = 0;
    this._root = this.add.container(0, 0);
    this._overlay = this.add.container(0, 0).setDepth(20);
    this._build();
  }

  _syncBasicSummonUnlock() {
    if (GameState.isUnlocked('BASIC_SUMMON')) return;
    const stageId = GameState.campaignProgress?.stageCleared;
    if (stageId === '1-5') return GameState.addUnlockedSystem('BASIC_SUMMON');
    const [r, st] = String(stageId || '').split('-').map(Number);
    if (Number.isFinite(r) && Number.isFinite(st) && (r > 1 || (r === 1 && st >= 5))) {
      GameState.addUnlockedSystem('BASIC_SUMMON');
    }
  }

  _reset() {
    this._root.removeAll(true);
    this._overlay.removeAll(true);
  }

  _build() {
    this._reset();
    addScreenBg(this, this._root);
    addHeader(this, this._root, 'SUMMON', () => this.scene.start('MainHub'), 'RATES', () => this._showRatesOverlay());
    this._drawCurrencyLine();

    if (!GameState.isUnlocked('BASIC_SUMMON')) {
      addPanel(this, this._root, W / 2, H / 2, 360, 160);
      addLabel(this, this._root, W / 2, H / 2 - 18, 'SUMMON LOCKED', 18, SIMPLE_UI.gold);
      addLabel(this, this._root, W / 2, H / 2 + 18, 'Clear Stage 1-5 to unlock.', 12, SIMPLE_UI.muted);
      return;
    }

    this._drawTabs();
    this._drawPortalPlaceholder();
    this._drawPullButtons();
    this._drawResults();
    addButton(this, this._root, W / 2, 812, 320, 42, `WISHLIST (${SummonManager.wishlist.size}/${SummonManager.getWishlistMaxSize()})`, () => this._showWishlistOverlay());
  }

  _drawCurrencyLine() {
    addLabel(this, this._root, W - 18, 64,
      `${CURRENCY_LABEL.CRYSTALS}: ${CurrencyManager.get(CURRENCY.CRYSTALS).toLocaleString()}`,
      10, '#aaddff', 1);
    addLabel(this, this._root, W - 18, 82,
      `${CURRENCY_LABEL.PREMIUM_CRYSTALS}: ${CurrencyManager.get(CURRENCY.PREMIUM_CRYSTALS).toLocaleString()}`,
      10, '#cc88ff', 1);
  }

  _drawTabs() {
    ['BASIC', 'ADVANCED'].forEach((key, i) => {
      const banner = BANNERS[key];
      const enabled = GameState.isUnlocked(banner.unlockKey);
      const selected = this._activeBanner === key;
      addButton(this, this._root, 120 + i * 240, 124, 210, 38,
        selected ? `[ ${banner.label} ]` : banner.label,
        () => {
          if (!enabled) return this._flash('Clear Region 3 to unlock');
          this._activeBanner = key;
          this._lastResults = [];
          this._build();
        }, enabled);
    });

    const banner = BANNERS[this._activeBanner];
    const pity = SummonManager.getDisplayedPityCounter(this._activeBanner);
    addLabel(this, this._root, W / 2, 160, `${banner.pityLabel}: ${pity}/${banner.pityMax}`, 11, SIMPLE_UI.muted);
  }

  _drawPortalPlaceholder() {
    addPanel(this, this._root, W / 2, 300, 340, 220, 0x10101c);
    addLabel(this, this._root, W / 2, 285, 'SUMMON PORTAL ASSET HERE', 14, SIMPLE_UI.muted);
    addLabel(this, this._root, W / 2, 315, BANNERS[this._activeBanner].label + ' BANNER', 16, SIMPLE_UI.gold);
  }

  _drawPullButtons() {
    const banner = BANNERS[this._activeBanner];
    const balance = CurrencyManager.get(banner.currency);
    const pulls = [
      { count: 1, cost: banner.cost1, x: W / 4, label: 'PULL x1' },
      { count: 10, cost: banner.cost10, x: W * 3 / 4, label: 'PULL x10' }
    ];
    pulls.forEach(pull => {
      addButton(this, this._root, pull.x, 450, 210, 58,
        `${pull.label}\n${pull.cost} ${banner.currencyLabel}`,
        () => this._doPull(banner, pull.count), balance >= pull.cost);
    });
  }

  _drawResults() {
    addPanel(this, this._root, W / 2, 615, W - 32, 210, 0x10101c);
    if (!this._lastResults.length) {
      addLabel(this, this._root, W / 2, 615, 'Results appear here.', 12, SIMPLE_UI.muted);
      return;
    }
    const cols = Math.min(5, this._lastResults.length);
    const cardW = 82;
    const startX = W / 2 - ((cols - 1) * cardW) / 2;
    this._lastResults.forEach((result, i) => {
      const x = startX + (i % cols) * cardW;
      const y = 565 + Math.floor(i / cols) * 88;
      addPanel(this, this._root, x, y, 74, 76, 0x151525);
      addLabel(this, this._root, x, y - 18, (result.def?.name || '???').slice(0, 7), 9, SIMPLE_UI.text);
      addLabel(this, this._root, x, y + 2, result.rarity.slice(0, 4), 9, RARITY_STR[result.rarity] || SIMPLE_UI.muted);
      addLabel(this, this._root, x, y + 22, result.isNew ? 'NEW' : 'SHARD', 9, result.isNew ? SIMPLE_UI.good : SIMPLE_UI.gold);
    });
  }

  _doPull(banner, count) {
    const cost = count === 1 ? banner.cost1 : banner.cost10;
    if (!CurrencyManager.spend(banner.currency, cost)) return;
    const results = count === 1
      ? [SummonManager.pull(banner.key, SUMMONABLE_HERO_DEFINITIONS)].filter(Boolean)
      : SummonManager.pullMulti(banner.key, SUMMONABLE_HERO_DEFINITIONS, count);
    results.forEach(r => SummonManager.handleResult(r));
    DailyCodexManager.increment('SUMMON_HERO');
    GameState.save();
    this._lastResults = results;
    this._build();
    AchievementManager.showPopups(this);
  }

  _showRatesOverlay() {
    this._overlay.removeAll(true);
    this._overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.86));
    addPanel(this, this._overlay, W / 2, H / 2, W - 40, 500);
    addLabel(this, this._overlay, W / 2, 190, 'SUMMON RATES', 20, SIMPLE_UI.gold);
    const rows = Object.entries(BANNER_RATES[this._activeBanner] || {});
    rows.forEach(([rarity, values], i) => {
      addLabel(this, this._overlay, 70, 245 + i * 32, rarity, 12, RARITY_STR[rarity] || SIMPLE_UI.text, 0);
      addLabel(this, this._overlay, 250, 245 + i * 32, `${values.unobtained}% new / ${values.obtained}% owned`, 12, SIMPLE_UI.text, 0);
    });
    addButton(this, this._overlay, W / 2, 620, 220, 44, 'CLOSE', () => this._overlay.removeAll(true));
  }

  _showWishlistOverlay() {
    this._overlay.removeAll(true);
    const pool = BANNER_POOLS[this._activeBanner];
    const heroes = SUMMONABLE_HERO_DEFINITIONS.filter(d => pool.includes(d.rarity));
    const pageSize = 10;
    const page = this._wishlistPage;
    const slice = heroes.slice(page * pageSize, page * pageSize + pageSize);

    this._overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.86));
    addPanel(this, this._overlay, W / 2, H / 2, W - 32, 660);
    addLabel(this, this._overlay, W / 2, 120, 'WISHLIST', 18, SIMPLE_UI.gold);

    slice.forEach((def, i) => {
      const y = 165 + i * 48;
      const active = SummonManager.wishlist.has(def.id);
      const row = addButton(this, this._overlay, W / 2, y, W - 60, 40,
        `${active ? '[x]' : '[ ]'} ${def.name} · ${def.rarity}`,
        () => {
          if (!active && SummonManager.wishlist.size >= SummonManager.getWishlistMaxSize()) return this._flash('Wishlist full');
          if (active) SummonManager.wishlist.delete(def.id);
          else SummonManager.wishlist.add(def.id);
          GameState.save();
          this._showWishlistOverlay();
        });
      row.txt.setStyle({ fill: active ? SIMPLE_UI.good : SIMPLE_UI.text });
    });

    if (page > 0) addButton(this, this._overlay, 120, 690, 120, 38, 'PREV', () => { this._wishlistPage--; this._showWishlistOverlay(); });
    if ((page + 1) * pageSize < heroes.length) addButton(this, this._overlay, 360, 690, 120, 38, 'NEXT', () => { this._wishlistPage++; this._showWishlistOverlay(); });
    addButton(this, this._overlay, W / 2, 750, 220, 42, 'CLOSE', () => { this._overlay.removeAll(true); this._build(); });
  }

  _flash(message) {
    const txt = this.add.text(W / 2, 760, message, { font: '14px monospace', fill: SIMPLE_UI.danger, backgroundColor: '#000000cc', padding: { x: 8, y: 4 } })
      .setOrigin(0.5).setDepth(30);
    this.time.delayedCall(1400, () => txt.destroy());
  }
}

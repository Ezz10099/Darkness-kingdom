import GameState from '../systems/GameState.js';
import SummonManager, { BANNER_RATES } from '../systems/SummonManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import DailyCodexManager from '../systems/DailyCodexManager.js';
import HERO_DEFINITIONS from '../data/heroDefinitions.js';
import { CURRENCY, CURRENCY_LABEL } from '../data/constants.js';
import { ARCANE_THEME, addArcaneBackdrop, createPanel, createArcaneButton } from '../ui/ArcaneUI.js';
import { addPanelImage, addUIButton } from '../ui/ArcaneAssets.js';

const RARITY_HEX = {
  COMMON: 0x888888, UNCOMMON: 0x44aa44, RARE: 0x4488ff,
  EPIC: 0xaa44ff, LEGENDARY: 0xffaa00, MYTHIC: 0xff4444, ASCENDED: 0xff88ff
};
const RARITY_STR = {
  COMMON: '#888888', UNCOMMON: '#44aa44', RARE: '#4488ff',
  EPIC: '#aa44ff', LEGENDARY: '#ffaa00', MYTHIC: '#ff4444', ASCENDED: '#ff88ff'
};

const BANNER_POOLS = {
  BASIC:    ['COMMON', 'UNCOMMON', 'RARE', 'EPIC'],
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
    const W = 480, H = 854;
    this._W = W; this._H = H;
    this._activeBanner = 'BASIC';
    this._lastResults  = [];
    this._wishlistPage = 0;
    this._flashText    = null;

    addArcaneBackdrop(this, W, H);

    // Persistent currency texts (top-right, depth above containers)
    this._crystalTxt  = this.add.text(W - 8, 10, '',
      { font: '11px monospace', fill: '#aaddff' }).setOrigin(1, 0).setDepth(5);
    this._pcrystalTxt = this.add.text(W - 8, 24, '',
      { font: '11px monospace', fill: '#cc88ff' }).setOrigin(1, 0).setDepth(5);

    this._mainCont    = this.add.container(0, 0);
    this._resultsCont = this.add.container(0, 0);
    this._overlayCont = this.add.container(0, 0).setDepth(10);

    this.time.addEvent({ delay: 500, loop: true, callback: this._refreshCurrency, callbackScope: this });
    this._refreshCurrency();
    this._build();
  }

  _syncBasicSummonUnlock() {
    if (GameState.isUnlocked('BASIC_SUMMON')) return;
    const stageId = GameState.campaignProgress?.stageCleared;
    if (stageId === '1-5') {
      GameState.addUnlockedSystem('BASIC_SUMMON');
      return;
    }
    const [r, st] = String(stageId || '').split('-').map(Number);
    if (Number.isFinite(r) && Number.isFinite(st) && (r > 1 || (r === 1 && st >= 5))) {
      GameState.addUnlockedSystem('BASIC_SUMMON');
    }
  }

  // ─── BUILD ────────────────────────────────────────────────────────────────────

  _build() {
    this._mainCont.removeAll(true);
    this._resultsCont.removeAll(true);
    this._overlayCont.removeAll(true);

    if (!GameState.isUnlocked('BASIC_SUMMON')) {
      this._buildLocked();
      return;
    }
    this._buildHeader();
    this._buildTabs();
    this._buildPityLine();
    this._buildPullButtons();
    this._buildResultsArea();
    this._buildWishlistButton();
  }

  _buildLocked() {
    const c = this._mainCont, W = this._W, H = this._H;
    c.add(addPanelImage(this, W / 2, H / 2, 'panelLarge', { displayWidth: 340, displayHeight: 170, alpha: 0.9 }));
    c.add(createPanel(this, { x: W / 2, y: H / 2, width: 340, height: 170, title: 'LOCKED' }));
    c.add(this.add.text(W / 2, H / 2 + 10,
      '\uD83D\uDD12 Summon\nUnlock by finishing Onboarding or clearing Stage 1-5',
      { font: '18px monospace', fill: ARCANE_THEME.colors.textMuted, align: 'center' }).setOrigin(0.5));
    this._addBack(c);
  }

  _buildHeader() {
    const c = this._mainCont, W = this._W;
    c.add(addPanelImage(this, W / 2, 74, 'panelLarge', { displayWidth: 452, displayHeight: 132, alpha: 0.88 }));
    c.add(this.add.rectangle(W / 2, 74, 452, 132, 0x110f1f).setAlpha(0.38));
    c.add(this.add.text(W / 2, 28, 'SUMMON',
      { font: '22px monospace', fill: ARCANE_THEME.colors.textPrimary }).setOrigin(0.5));

    const ratesBtn = this.add.text(460, 28, 'RATES ▶',
      { font: '11px monospace', fill: '#888888' })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this._showRatesOverlay());
    c.add(ratesBtn);

    this._addBack(c);
  }

  _addBack(c) {
    const backButton = createArcaneButton(this, {
      x: 58,
      y: 28,
      width: 96,
      height: 34,
      label: 'BACK',
      font: '12px monospace',
      onClick: () => this.scene.start('MainHub')
    });
    c.add(backButton.root);
  }

  _buildTabs() {
    const c = this._mainCont, W = this._W;
    c.add(this.add.rectangle(W / 2, 56, W, 1, 0x3e2956));

    ['BASIC', 'ADVANCED'].forEach((key, i) => {
      const bn      = BANNERS[key];
      const active  = this._activeBanner === key;
      const enabled = GameState.isUnlocked(bn.unlockKey);
      const x       = 120 + i * 240;
      const tabLabel = enabled ? bn.label : bn.label + ' (locked)';

      const button = createArcaneButton(this, {
        x,
        y: 82,
        width: 210,
        height: 38,
        label: tabLabel,
        enabled,
        accent: active ? ARCANE_THEME.colors.accent : ARCANE_THEME.colors.accentSoft,
        fill: active ? 0x2a1148 : 0x150f24,
        textColor: active ? '#e6c9ff' : ARCANE_THEME.colors.textMuted,
        font: '12px monospace',
        onClick: () => {
          this._activeBanner = key;
          this._lastResults  = [];
          this._wishlistPage = 0;
          this._build();
        }
      });
      c.add(addUIButton(this, x, 82, active ? 'buttonPrimary' : 'buttonSecondary', {
        displayWidth: 210,
        displayHeight: 38,
        alpha: enabled ? 0.88 : 0.66
      }));
      c.add(button.root);

      if (!enabled) {
        button.root.on('pointerup', () => this._flashMsg('Clear Region 3 to unlock'));
      }
    });

    c.add(this.add.rectangle(W / 2, 106, W, 1, 0x3e2956));
  }

  _buildPityLine() {
    const c   = this._mainCont, W = this._W;
    const bn  = BANNERS[this._activeBanner];
    const n   = SummonManager.getDisplayedPityCounter(this._activeBanner);
    c.add(this.add.text(W / 2, 120,
      `${bn.pityLabel}: ${n} / ${bn.pityMax}`,
      { font: '11px monospace', fill: '#776699' }).setOrigin(0.5));
    c.add(this.add.rectangle(W / 2, 134, W, 1, 0x3e2956));
  }

  _buildPullButtons() {
    const c       = this._mainCont, W = this._W;
    const bn      = BANNERS[this._activeBanner];
    const balance = CurrencyManager.get(bn.currency);

    [
      { count: 1,  cost: bn.cost1,  x: W / 4,     label: 'PULL x1'  },
      { count: 10, cost: bn.cost10, x: W * 3 / 4, label: 'PULL x10' }
    ].forEach(({ count, cost, x, label }) => {
      const can = balance >= cost;
      const button = createArcaneButton(this, {
        x,
        y: 170,
        width: 210,
        height: 68,
        label: `${label}
${cost} ${bn.currencyLabel}`,
        enabled: can,
        font: '14px monospace',
        textColor: can ? '#e6c9ff' : ARCANE_THEME.colors.textMuted,
        onClick: () => this._doPull(bn, count)
      });
      c.add(addUIButton(this, x, 170, can ? 'buttonPrimary' : 'buttonDanger', {
        displayWidth: 210,
        displayHeight: 68,
        alpha: 0.92
      }));
      c.add(button.root);
    });

    c.add(this.add.rectangle(W / 2, 210, W, 1, 0x3e2956));
  }

  _buildResultsArea() {
    const c       = this._resultsCont, W = this._W;
    const results = this._lastResults;

    if (!results.length) {
      c.add(this.add.text(W / 2, 490,
        'Results will appear here.',
        { font: '12px monospace', fill: '#333355' }).setOrigin(0.5));
      return;
    }

    const cols   = Math.min(results.length, 5);
    const rows   = Math.ceil(results.length / cols);
    const cardW  = results.length > 5 ? 88 : 96;
    const cardH  = 108;
    const gapY   = 128;
    const startX = (W - cols * cardW) / 2 + cardW / 2;
    // Center vertically in zone y=215 to y=780
    const zoneTop = 215, zoneBot = 780;
    const totalH  = rows * gapY;
    const startY  = zoneTop + ((zoneBot - zoneTop) - totalH) / 2 + gapY / 2;

    results.forEach((r, i) => {
      const x     = startX + (i % cols) * cardW;
      const y     = startY + Math.floor(i / cols) * gapY;
      const color = RARITY_HEX[r.rarity] || 0x555566;
      const name  = (r.def?.name || '???').slice(0, 7);

      c.add(addPanelImage(this, x, y, 'cardFrameGold', { displayWidth: cardW - 6, displayHeight: cardH, alpha: 0.92 }));
      c.add(this.add.rectangle(x, y, cardW - 6, cardH, 0x0d0d22).setStrokeStyle(2, color).setAlpha(0.5));
      c.add(this.add.rectangle(x, y - cardH / 2 + 4, cardW - 6, 8, color));
      c.add(this.add.text(x, y - 26, name,
        { font: results.length > 5 ? '10px monospace' : '12px monospace', fill: '#ffffff' })
        .setOrigin(0.5));
      c.add(this.add.text(x, y - 8, r.rarity.slice(0, 4),
        { font: '9px monospace', fill: RARITY_STR[r.rarity] }).setOrigin(0.5));

      if (r.isNew) {
        c.add(this.add.rectangle(x, y + 24, cardW - 14, 22, 0x0f2e0f).setStrokeStyle(1, 0x44ff44));
        c.add(this.add.text(x, y + 24, 'NEW!',
          { font: '10px monospace', fill: '#66ff66' }).setOrigin(0.5));
      } else {
        c.add(this.add.rectangle(x, y + 24, cardW - 14, 22, 0x2a1a06).setStrokeStyle(1, 0xaa6622));
        c.add(this.add.text(x, y + 24, '\u2605shard',
          { font: '10px monospace', fill: '#cc8833' }).setOrigin(0.5));
      }
    });
  }

  _buildWishlistButton() {
    const c       = this._mainCont, W = this._W;
    const wlCount = SummonManager.wishlist.size;
    const wlMax   = SummonManager.getWishlistMaxSize();
    c.add(this.add.rectangle(W / 2, 786, W, 1, 0x3e2956));
    const button = createArcaneButton(this, {
      x: W / 2,
      y: 815,
      width: 340,
      height: 50,
      label: `WISHLIST  (${wlCount}/${wlMax} active)`,
      textColor: ARCANE_THEME.colors.textSecondary,
      onClick: () => this._showWishlistOverlay()
    });
    c.add(button.root);
  }

  // ─── CURRENCY ─────────────────────────────────────────────────────────────────

  _refreshCurrency() {
    this._crystalTxt.setText(
      `${CURRENCY_LABEL.CRYSTALS}: ${CurrencyManager.get(CURRENCY.CRYSTALS).toLocaleString()}`
    );
    this._pcrystalTxt.setText(
      `${CURRENCY_LABEL.PREMIUM_CRYSTALS}: ${CurrencyManager.get(CURRENCY.PREMIUM_CRYSTALS).toLocaleString()}`
    );
  }

  // ─── PULL ─────────────────────────────────────────────────────────────────────

  _doPull(bn, count) {
    const cost = count === 1 ? bn.cost1 : bn.cost10;
    if (!CurrencyManager.spend(bn.currency, cost)) return;
    const results = count === 1
      ? [SummonManager.pull(bn.key, SUMMONABLE_HERO_DEFINITIONS)].filter(Boolean)
      : SummonManager.pullMulti(bn.key, SUMMONABLE_HERO_DEFINITIONS, count);
    results.forEach(r => SummonManager.handleResult(r));
    DailyCodexManager.increment('SUMMON_HERO');
    GameState.save();
    this._lastResults = results;
    this._build();
    AchievementManager.showPopups(this);
  }


  _showRatesOverlay() {
    const oc = this._overlayCont;
    oc.removeAll(true);
    const W = this._W, H = this._H;
    const rates = BANNER_RATES[this._activeBanner] || {};
    const rows = Object.entries(rates);
    const bn = BANNERS[this._activeBanner];

    oc.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88));
    oc.add(this.add.text(W / 2, 80, 'SUMMON RATES',
      { font: '22px monospace', fill: '#ffd700' }).setOrigin(0.5));
    oc.add(this.add.text(W / 2, 114, `${bn.label} Banner`,
      { font: '13px monospace', fill: '#cccccc' }).setOrigin(0.5));

    oc.add(this.add.text(60, 170, 'Rarity',
      { font: '12px monospace', fill: '#bbbbbb' }));
    oc.add(this.add.text(220, 170, '| Base Rate',
      { font: '12px monospace', fill: '#bbbbbb' }));

    rows.forEach(([rarity, values], i) => {
      const y = 204 + i * 34;
      const unob = values.unobtained;
      const obt = values.obtained;
      oc.add(this.add.text(60, y, rarity,
        { font: '12px monospace', fill: RARITY_STR[rarity] || '#aaaaaa' }));
      oc.add(this.add.text(220, y, `| ${unob}% (new) / ${obt}% (owned)`,
        { font: '12px monospace', fill: '#dddddd' }));
    });

    const pityNote = this._activeBanner === 'BASIC'
      ? 'Epic guaranteed by pull 30. Soft pity begins at pull 25.'
      : `Legendary guaranteed by pull 80. Soft pity begins at pull 60.\n10-pull guarantees at least 1 Rare.`;

    oc.add(this.add.text(W / 2, 370, pityNote,
      { font: '12px monospace', fill: '#cccccc', align: 'center' }).setOrigin(0.5));
    oc.add(this.add.text(W / 2, 450,
      'Light and Shadow affinity heroes pull at half rate within their rarity tier.',
      { font: '11px monospace', fill: '#aaaaaa', align: 'center', wordWrap: { width: 420 } }).setOrigin(0.5));

    const closeBtn = this.add.rectangle(W / 2, 770, 220, 44, 0x1a083a)
      .setStrokeStyle(1, 0x7744cc)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        this._overlayCont.removeAll(true);
        this._build();
      });
    oc.add(closeBtn);
    oc.add(this.add.text(W / 2, 770, '[ CLOSE ]',
      { font: '14px monospace', fill: '#cc88ff' }).setOrigin(0.5));
  }

  // ─── WISHLIST OVERLAY ─────────────────────────────────────────────────────────

  _showWishlistOverlay() {
    const oc = this._overlayCont;
    oc.removeAll(true);
    const W = this._W, H = this._H;

    const pool   = BANNER_POOLS[this._activeBanner];
    const heroes = SUMMONABLE_HERO_DEFINITIONS.filter(d => pool.includes(d.rarity));
    const PAGE   = 10;
    const page   = this._wishlistPage;
    const slice  = heroes.slice(page * PAGE, page * PAGE + PAGE);

    // Dim background
    oc.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setAlpha(0.78));

    // Panel background
    oc.add(this.add.rectangle(W / 2, H / 2, W - 16, 660, 0x0d0d22).setStrokeStyle(1, 0x3333aa));
    oc.add(this.add.text(W / 2, H / 2 - 310,
      'WISHLIST',
      { font: '16px monospace', fill: '#ffd700' }).setOrigin(0.5));

    const rowH   = 46;
    const startY = H / 2 - 270;

    // UP arrow
    if (page > 0) {
      oc.add(this.add.text(W / 2, startY - 20, '\u25b2 UP',
        { font: '12px monospace', fill: '#aaaacc' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerup', () => { this._wishlistPage--; this._showWishlistOverlay(); }));
    }

    slice.forEach((def, i) => {
      const y   = startY + i * rowH;
      const inWL = SummonManager.wishlist.has(def.id);
      const checkCol = inWL ? '#66ff66' : '#777788';

      const rowBg = this.add.rectangle(W / 2, y, W - 40, rowH - 4, 0x111128)
        .setStrokeStyle(1, RARITY_HEX[def.rarity] || 0x333355)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => rowBg.setFillStyle(0x07071a))
        .on('pointerout',  () => rowBg.setFillStyle(0x111128))
        .on('pointerup',   () => {
          const wlMax = SummonManager.getWishlistMaxSize();
          if (!inWL && SummonManager.wishlist.size >= wlMax) {
            this._flashMsg(`Wishlist full (${wlMax}/${wlMax})`);
            return;
          }
          inWL
            ? SummonManager.wishlist.delete(def.id)
            : SummonManager.wishlist.add(def.id);
          this._showWishlistOverlay();
        });
      oc.add(rowBg);
      oc.add(this.add.text(26, y - 8, inWL ? '[\u2713]' : '[ ]',
        { font: '11px monospace', fill: checkCol }).setOrigin(0, 0.5));
      oc.add(this.add.text(66, y - 8, def.name,
        { font: '12px monospace', fill: '#ffffff' }).setOrigin(0, 0.5));
      oc.add(this.add.text(66, y + 8, `${def.rarity}  ${def.affinity}`,
        { font: '9px monospace', fill: RARITY_STR[def.rarity] || '#aaaaaa' }).setOrigin(0, 0.5));
    });

    // DOWN arrow
    if ((page + 1) * PAGE < heroes.length) {
      const downY = startY + slice.length * rowH + 8;
      oc.add(this.add.text(W / 2, downY, '\u25bc DOWN',
        { font: '12px monospace', fill: '#aaaacc' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerup', () => { this._wishlistPage++; this._showWishlistOverlay(); }));
    }

    // Close button
    const closeBtn = this.add.rectangle(W / 2, H / 2 + 296, 200, 40, 0x1a083a)
      .setStrokeStyle(1, 0x7744cc)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => { GameState.save(); oc.removeAll(true); this._buildWishlistButton(); });
    oc.add(closeBtn);
    oc.add(this.add.text(W / 2, H / 2 + 296, 'CLOSE',
      { font: '14px monospace', fill: '#cc88ff' }).setOrigin(0.5));
  }

  // ─── FLASH ────────────────────────────────────────────────────────────────────

  _flashMsg(msg) {
    if (this._flashText) { this._flashText.destroy(); this._flashText = null; }
    this._flashText = this.add.text(this._W / 2, 756, msg,
      { font: '14px monospace', fill: '#ff4444', backgroundColor: '#000000cc',
        padding: { x: 8, y: 4 } })
      .setOrigin(0.5).setDepth(20);
    this.time.delayedCall(2000, () => {
      if (this._flashText) { this._flashText.destroy(); this._flashText = null; }
    });
  }
}

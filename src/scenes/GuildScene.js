import GameState       from '../systems/GameState.js';
import HeroManager     from '../systems/HeroManager.js';
import CurrencyManager from '../systems/CurrencyManager.js';
import BattleEngine    from '../systems/BattleEngine.js';
import GuildManager, {
  BOSS_TIERS, LEVEL_PERKS, GUILD_CREATION_COST, BASE_ATTACK_COOLDOWN_SECS
} from '../systems/GuildManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import { CURRENCY } from '../data/constants.js';

const CLASS_COLORS = {
  WARRIOR: 0xcc5522, TANK: 0x2266cc, MAGE: 0x882299,
  ARCHER:  0x228844, HEALER: 0xaaaa11, ASSASSIN: 0x222255
};

export default class GuildScene extends Phaser.Scene {
  constructor() { super('Guild'); }

  create() {
    this._engine      = null;
    this._battleTimer = null;
    this._sprites     = {};
    this._ultBtns     = [];
    this._logText     = null;
    this._logBuf      = [];
    this._dmgDealt    = 0;
    this._dmgLabel    = null;
    this._root        = this.add.container(0, 0);

    GuildManager.hasGuild() ? this._showGuildHub() : this._showJoinHub();
  }

  // ─── UTILITIES ──────────────────────────────────────────────────────────────

  _reset() {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    this._root.removeAll(true);
    this._sprites = {}; this._ultBtns = []; this._logBuf = []; this._logText = null;
    this._dmgLabel = null; this._dmgDealt = 0;
  }

  _log(msg) {
    this._logBuf.push(msg);
    if (this._logBuf.length > 4) this._logBuf.shift();
    if (this._logText) this._logText.setText(this._logBuf.join('\n'));
  }

  _mkBack(label, cb) {
    return this.add.text(30, 34, label, { font: '14px monospace', fill: '#aaaaaa' })
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', cb);
  }

  // ─── NO-GUILD HUB ───────────────────────────────────────────────────────────

  _showJoinHub() {
    this._reset();
    const c = this._root, W = 480;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 34, 'GUILD', { font: '28px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this._mkBack('< BACK', () => this.scene.start('MainHub')));

    c.add(this.add.text(W / 2, 95, 'You are not in a guild.', { font: '15px monospace', fill: '#666688' }).setOrigin(0.5));

    // Create guild
    const canCreate = CurrencyManager.get(CURRENCY.GOLD) >= GUILD_CREATION_COST;
    const cBg = this.add.rectangle(W / 2, 168, 320, 68, canCreate ? 0x1a1200 : 0x111111)
      .setStrokeStyle(2, canCreate ? 0xffd700 : 0x333333);
    c.add(cBg);
    c.add(this.add.text(W / 2, 156, '\u2691 CREATE GUILD', { font: '20px monospace', fill: canCreate ? '#ffd700' : '#555555' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 178, 'One-time cost: ' + GUILD_CREATION_COST.toLocaleString() + ' Gold',
      { font: '12px monospace', fill: '#888888' }).setOrigin(0.5));
    if (canCreate) {
      cBg.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => cBg.setFillStyle(0x0d0a00))
        .on('pointerout',  () => cBg.setFillStyle(0x1a1200))
        .on('pointerup',   () => this._promptCreate());
    }

    c.add(this.add.text(W / 2, 228, '\u2014 or join an open guild \u2014',
      { font: '12px monospace', fill: '#444466' }).setOrigin(0.5));

    GuildManager.getOpenGuilds().forEach((g, i) => {
      const gy = 285 + i * 100;
      const bg = this.add.rectangle(W / 2, gy, W - 40, 86, 0x0d0d22)
        .setStrokeStyle(1, 0x2a2a5a);
      c.add(bg);
      c.add(this.add.text(70, gy - 22, g.name,  { font: '17px monospace', fill: '#aaddff' }));
      c.add(this.add.text(70, gy,      'Level ' + g.level + '  \u2022  Members: ' + g.memberCount + '/30',
        { font: '12px monospace', fill: '#666688' }));
      c.add(this.add.text(70, gy + 18, 'Open', { font: '11px monospace', fill: '#44aa44' }));

      const jBg = this.add.rectangle(W - 70, gy, 84, 42, 0x0a1a0a).setStrokeStyle(1, 0x44aa44)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => jBg.setFillStyle(0x051005))
        .on('pointerout',  () => jBg.setFillStyle(0x0a1a0a))
        .on('pointerup',   () => this._joinGuild(g.name, g.level, g.memberCount));
      c.add(jBg);
      c.add(this.add.text(W - 70, gy, 'JOIN', { font: '15px monospace', fill: '#44aa44' }).setOrigin(0.5));
    });
  }

  _promptCreate() {
    const name = window.prompt('Enter guild name (3-20 characters):');
    if (!name) return;
    const result = GuildManager.createGuild(name);
    if (!result.ok) { window.alert(result.reason); return; }
    GameState.save();
    this._showGuildHub();
  }

  _joinGuild(name, level, memberCount) {
    const result = GuildManager.joinGuild(name, level, memberCount);
    if (!result.ok) { window.alert(result.reason); return; }
    GameState.save();
    this._showGuildHub();
  }

  // ─── GUILD HUB ──────────────────────────────────────────────────────────────

  _showGuildHub() {
    this._reset();
    const c = this._root, W = 480;
    const guild   = GuildManager.guild;
    const bs      = GuildManager.bossState;
    const cfg     = GuildManager.getCurrentTierConfig();
    const attacks = GuildManager.getAttacksRemaining();
    const maxAtt  = GuildManager.getMaxAttacksPerDay();
    const cdLeft  = GuildManager.getCooldownRemainingSecs();
    const coins   = CurrencyManager.get(CURRENCY.GUILD_COINS);
    const hasHeroes = HeroManager.getAllHeroes().length > 0;
    const canFight  = attacks > 0 && cdLeft <= 0 && hasHeroes;

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 34, 'GUILD', { font: '24px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this._mkBack('< BACK', () => this.scene.start('MainHub')));

    // Guild name + level
    c.add(this.add.text(W / 2, 76, guild.name, { font: '22px monospace', fill: '#ffd700' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 102, 'Level ' + guild.level + '  \u2022  ' + guild.memberCount + '/' + 30 + ' members',
      { font: '13px monospace', fill: '#aaaaaa' }).setOrigin(0.5));

    // XP bar
    const xpNeeded = GuildManager.getXPToNextLevel();
    const xpPct    = xpNeeded === Infinity ? 1 : Math.min(1, guild.xp / xpNeeded);
    const xpBarW = 340, xpBarH = 14, xpBarY = 126;
    c.add(this.add.rectangle(W / 2, xpBarY, xpBarW, xpBarH, 0x1a1a00).setStrokeStyle(1, 0x444400));
    c.add(this.add.rectangle(W / 2 - xpBarW / 2, xpBarY, xpBarW * xpPct, xpBarH, 0xffaa00).setOrigin(0, 0.5));
    const xpLbl = xpNeeded === Infinity ? 'MAX LEVEL'
      : guild.xp.toLocaleString() + ' / ' + xpNeeded.toLocaleString() + ' XP';
    c.add(this.add.text(W / 2, xpBarY, xpLbl, { font: '10px monospace', fill: '#ffffff' }).setOrigin(0.5));

    // Guild Coins
    c.add(this.add.text(W / 2, 152, '\u2605 Guild Coins: ' + coins.toLocaleString(),
      { font: '14px monospace', fill: '#ffd700' }).setOrigin(0.5));

    // Boss HP bar
    const bBarW = 380, bBarH = 28, bBarY = 212;
    const hpPct = bs.currentHp / cfg.bossHp;
    c.add(this.add.text(W / 2, bBarY - 22, 'GUILD BOSS \u2014 ' + cfg.label,
      { font: '14px monospace', fill: '#ff6644' }).setOrigin(0.5));
    c.add(this.add.rectangle(W / 2, bBarY, bBarW, bBarH, 0x330000).setStrokeStyle(1, 0x660000));
    c.add(this.add.rectangle(W / 2 - bBarW / 2, bBarY, bBarW * hpPct, bBarH, 0xff4422).setOrigin(0, 0.5));
    c.add(this.add.text(W / 2, bBarY,
      bs.currentHp.toLocaleString() + ' / ' + cfg.bossHp.toLocaleString(),
      { font: '11px monospace', fill: '#ffffff' }).setOrigin(0.5));

    // Boss stats row
    const panelY = 274;
    c.add(this.add.rectangle(W / 2, panelY, 380, 52, 0x0d0d22).setStrokeStyle(1, 0x3a1a4a));
    c.add(this.add.text(W / 2 - 115, panelY, 'Battle HP: ' + cfg.battleHp.toLocaleString(),
      { font: '11px monospace', fill: '#ff9988' }).setOrigin(0.5));
    c.add(this.add.text(W / 2 + 5,   panelY, 'DEF: ' + cfg.defense,
      { font: '11px monospace', fill: '#88ccff' }).setOrigin(0.5));
    c.add(this.add.text(W / 2 + 105, panelY, '+' + (GuildManager.getCoinBonus() * 100).toFixed(0) + '% Coins',
      { font: '11px monospace', fill: '#ffd700' }).setOrigin(0.5));

    // Attacks remaining
    c.add(this.add.text(W / 2, 316,
      'Attacks today: ' + (maxAtt - attacks) + ' / ' + maxAtt + ' used',
      { font: '13px monospace', fill: attacks > 0 ? '#aaddff' : '#ff6666' }).setOrigin(0.5));
    const cdBase = GuildManager.getAttackCooldownSecs();
    const cdLabel = cdLeft > 0
      ? 'Cooldown: ' + this._fmtSecs(cdLeft)
      : 'Cooldown: Ready';
    const cdNote = cdBase < BASE_ATTACK_COOLDOWN_SECS
      ? ' (reduced)'
      : '';
    c.add(this.add.text(W / 2, 334, cdLabel + cdNote,
      { font: '11px monospace', fill: cdLeft > 0 ? '#ffcc88' : '#66cc66' }).setOrigin(0.5));

    // Last result
    if (bs.lastResult) {
      const lr = bs.lastResult;
      c.add(this.add.text(W / 2, 352,
        'Last: ' + lr.damage.toLocaleString() + ' dmg  \u2605' + lr.coinsEarned + ' Coins  +' + lr.xpGained + ' XP',
        { font: '11px monospace', fill: '#555577' }).setOrigin(0.5));
    }

    // Attack button
    const atkY   = 400;
    const atkC   = canFight ? 0x3a0000 : 0x1a1a2a;
    const atkBrd = canFight ? 0xff4444 : 0x333333;
    const atkTxt = canFight
      ? '\u2694 ATTACK BOSS'
      : (attacks === 0 ? 'NO ATTACKS LEFT' : (cdLeft > 0 ? 'ON COOLDOWN' : 'NO HEROES'));
    const atkClr = canFight ? '#ff6644' : '#555555';
    const atkBg  = this.add.rectangle(W / 2, atkY, 290, 66, atkC).setStrokeStyle(2, atkBrd);
    c.add(atkBg);
    c.add(this.add.text(W / 2, atkY, atkTxt, { font: '22px monospace', fill: atkClr }).setOrigin(0.5));
    if (canFight) {
      atkBg.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => atkBg.setFillStyle(0x220000))
        .on('pointerout',  () => atkBg.setFillStyle(0x3a0000))
        .on('pointerup',   () => this._startAttack());
    }

    // Level perks
    c.add(this.add.text(W / 2, 466, 'GUILD PERKS', { font: '12px monospace', fill: '#886699' }).setOrigin(0.5));
    [5, 10, 20, 30].forEach((lv, i) => {
      const unlocked = guild.level >= lv;
      c.add(this.add.text(W / 2, 486 + i * 20,
        (unlocked ? '\u2713 ' : '\u25cb ') + 'Lv.' + lv + ': ' + LEVEL_PERKS[lv],
        { font: '11px monospace', fill: unlocked ? '#44cc44' : '#555555' }).setOrigin(0.5));
    });

    // Shop button
    const shopBg = this.add.rectangle(W / 2, 628, 270, 58, 0x0d1a00)
      .setStrokeStyle(2, 0x44cc44).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => shopBg.setFillStyle(0x071000))
      .on('pointerout',  () => shopBg.setFillStyle(0x0d1a00))
      .on('pointerup',   () => this.scene.start('GuildShop'));
    c.add(shopBg);
    c.add(this.add.text(W / 2, 628, '\u2605 GUILD SHOP', { font: '20px monospace', fill: '#44cc44' }).setOrigin(0.5));

    // Leave guild
    c.add(this.add.text(W / 2, 704, 'Leave Guild', { font: '12px monospace', fill: '#444466' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        if (window.confirm('Leave ' + guild.name + '?')) {
          GuildManager.leaveGuild();
          GameState.save();
          this._showJoinHub();
        }
      }));
  }

  // ─── BATTLE ─────────────────────────────────────────────────────────────────

  _startAttack() {
    if (!GuildManager.canAttackNow()) return;
    const enemySquad  = GuildManager.generateBossSquad();
    const playerSquad = GameState.getBattleSquadEntries()
      .map(entry => {
        const hero = HeroManager.getHero(entry.heroId);
        return hero ? { hero, row: entry.row } : null;
      })
      .filter(Boolean);

    this._engine = new BattleEngine({ playerSquad, enemySquad, onEvent: ev => this._onBattleEvent(ev) });
    this._engine.start();
    this._showBattleView();
    this._battleTimer = this.time.addEvent({
      delay: 900, loop: true,
      callback: () => { if (this._engine?.running) this._engine.step(); }
    });
  }

  _showBattleView() {
    this._reset();
    const c = this._root, W = 480;
    const cfg = GuildManager.getCurrentTierConfig();

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x0a0a1a));
    c.add(this.add.text(W / 2, 26, 'GUILD BOSS \u2014 ' + cfg.label,
      { font: '16px monospace', fill: '#ff6644' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 70,  'BOSS',       { font: '11px monospace', fill: '#ff7766' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 470, 'YOUR SQUAD', { font: '11px monospace', fill: '#66ccff' }).setOrigin(0.5));

    c.add(this.add.rectangle(W / 2, 335, W - 16, 110, 0x0c0c1e).setStrokeStyle(1, 0x2a1a4a));
    this._logText  = this.add.text(W / 2, 335, '',
      { font: '12px monospace', fill: '#bbbbbb', align: 'center' }).setOrigin(0.5);
    this._dmgLabel = this.add.text(W / 2, 295, 'Damage dealt: 0',
      { font: '13px monospace', fill: '#ff6644' }).setOrigin(0.5);
    c.add(this._dmgLabel);
    c.add(this._logText);

    const enemies = [...this._engine.enemyFormation.FRONT, ...this._engine.enemyFormation.BACK];
    const heroes  = [...this._engine.playerFormation.FRONT, ...this._engine.playerFormation.BACK];
    this._drawRow(enemies, 160, c);
    this._drawRow(heroes,  530, c);
    this._drawUltBtns(heroes, c);
  }

  _drawRow(combatants, cy, c) {
    if (!combatants.length) return;
    const W = 480, slotW = Math.min(82, (W - 36) / combatants.length), barW = slotW - 10;
    const startX = (W - slotW * combatants.length) / 2 + slotW / 2;
    combatants.forEach((com, i) => {
      const x  = startX + i * slotW;
      const bg = this.add.rectangle(x, cy, slotW - 6, 62, CLASS_COLORS[com.heroClass] || 0x445566)
        .setStrokeStyle(1, 0xcccccc);
      c.add(bg);
      c.add(this.add.text(x, cy - 38, com.name.slice(0, 8), { font: '10px monospace', fill: '#ffffff' }).setOrigin(0.5));
      c.add(this.add.rectangle(x, cy + 38, barW, 8, 0x440000));
      const hpBar = this.add.rectangle(x - barW / 2, cy + 38, barW, 8, 0x22cc55).setOrigin(0, 0.5);
      const hpTxt = this.add.text(x, cy + 50, '' + com.hp, { font: '9px monospace', fill: '#aaffaa' }).setOrigin(0.5);
      c.add(hpBar); c.add(hpTxt);
      this._sprites[com.id] = { bg, hpBar, barMaxW: barW, hpTxt };
    });
  }

  _drawUltBtns(heroes, c) {
    if (!heroes.length) return;
    const W = 480, btnW = Math.min(88, (W - 16) / heroes.length);
    const startX = (W - btnW * heroes.length) / 2 + btnW / 2;
    heroes.forEach((hero, i) => {
      const x   = startX + i * btnW;
      const bg  = this.add.rectangle(x, 640, btnW - 6, 50, 0x1a0530)
        .setStrokeStyle(1, 0x5511aa).setInteractive({ useHandCursor: true })
        .on('pointerup', () => { if (this._engine) this._engine.triggerUltimate(hero.id); });
      const chg = this.add.text(x, 644, '0%', { font: '11px monospace', fill: '#887799' }).setOrigin(0.5);
      c.add(bg);
      c.add(this.add.text(x, 626, hero.name.slice(0, 5), { font: '10px monospace', fill: '#cc88ff' }).setOrigin(0.5));
      c.add(chg);
      this._ultBtns.push({ heroId: hero.id, bg, chgTxt: chg });
    });
  }

  // ─── BATTLE EVENTS ──────────────────────────────────────────────────────────

  _onBattleEvent(ev) {
    switch (ev.type) {
      case 'damage': {
        const sp = this._sprites[ev.targetId];
        if (sp) {
          const pct = Math.max(0, ev.finalHp / ev.maxHp);
          sp.hpBar.setDisplaySize(sp.barMaxW * pct, 8);
          sp.hpBar.setFillStyle(pct > 0.5 ? 0x22cc55 : pct > 0.25 ? 0xffaa00 : 0xff2200);
          sp.hpTxt.setText('' + ev.finalHp);
        }
        if (ev.targetId.startsWith('gb_')) {
          this._dmgDealt += ev.amount;
          const cap = GuildManager.getCurrentTierConfig().battleHp;
          if (this._dmgLabel)
            this._dmgLabel.setText('Damage dealt: ' + Math.min(this._dmgDealt, cap).toLocaleString());
        }
        this._log('-' + ev.amount + ' dmg');
        break;
      }
      case 'heroDefeated': {
        const sp = this._sprites[ev.id];
        if (sp) { sp.bg.setFillStyle(0x222222); sp.hpTxt.setText('\u2715'); }
        break;
      }
      case 'ultimateReady': {
        const btn = this._ultBtns.find(b => b.heroId === ev.id);
        if (btn) { btn.bg.setFillStyle(0x5500bb); btn.chgTxt.setText('\u25b6ULT').setStyle({ fill: '#ffaaff' }); }
        break;
      }
      case 'ultimateTriggered': {
        const btn = this._ultBtns.find(b => b.heroId === ev.heroId);
        if (btn) { btn.bg.setFillStyle(0x1a0530); btn.chgTxt.setText('0%').setStyle({ fill: '#887799' }); }
        this._log('ULTIMATE!');
        break;
      }
      case 'statusApplied':
        this._log(ev.effect + '!');
        break;
      case 'tick': {
        const all = [...ev.state.playerFormation.FRONT, ...ev.state.playerFormation.BACK];
        for (const btn of this._ultBtns) {
          const com = all.find(x => x.id === btn.heroId);
          if (com && com.ultimateCharge < 100) btn.chgTxt.setText(com.ultimateCharge + '%');
        }
        break;
      }
      case 'battleEnd':
        this._onBattleEnd(ev.result);
        break;
    }
  }

  // ─── RESULTS ────────────────────────────────────────────────────────────────

  _onBattleEnd(result) {
    if (this._battleTimer) { this._battleTimer.remove(); this._battleTimer = null; }
    const W   = 480, c = this._root;
    const isWin = result === 'player_win';
    const br    = GuildManager.recordAttack(this._dmgDealt);

    c.add(this.add.rectangle(W / 2, 427, W, 854, 0x000000).setAlpha(0.82));
    c.add(this.add.text(W / 2, 180, isWin ? 'VICTORY!' : 'DEFEATED',
      { font: '38px monospace', fill: isWin ? '#ffaa44' : '#ff4444' }).setOrigin(0.5));

    c.add(this.add.text(W / 2, 246, 'Damage dealt: ' + br.damage.toLocaleString(),
      { font: '18px monospace', fill: '#ff6644' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, 282, '+' + br.coinsEarned + ' Guild Coins   +' + br.xpGained + ' Guild XP',
      { font: '15px monospace', fill: '#ffd700' }).setOrigin(0.5));

    let nextY = 330;
    if (br.bossDefeated) {
      c.add(this.add.text(W / 2, nextY, '\u2605 GUILD BOSS DEFEATED! \u2605',
        { font: '18px monospace', fill: '#ff66ff' }).setOrigin(0.5));
      nextY += 32;
      if (br.tierAdvanced) {
        c.add(this.add.text(W / 2, nextY, 'Next tier unlocked!',
          { font: '14px monospace', fill: '#ffaa00' }).setOrigin(0.5));
        nextY += 26;
      }
    }

    const newCfg = GuildManager.getCurrentTierConfig();
    c.add(this.add.text(W / 2, nextY + 6,
      'Boss HP: ' + GuildManager.bossState.currentHp.toLocaleString() + ' / ' + newCfg.bossHp.toLocaleString(),
      { font: '12px monospace', fill: '#888888' }).setOrigin(0.5));

    const attLeft = GuildManager.getAttacksRemaining();
    const cdLeft  = GuildManager.getCooldownRemainingSecs();
    c.add(this.add.text(W / 2, nextY + 28,
      attLeft + ' attack' + (attLeft !== 1 ? 's' : '') + ' remaining today',
      { font: '12px monospace', fill: '#888888' }).setOrigin(0.5));
    c.add(this.add.text(W / 2, nextY + 50,
      (cdLeft > 0 ? 'Next attack in ' + this._fmtSecs(cdLeft) : 'Next attack ready'),
      { font: '12px monospace', fill: cdLeft > 0 ? '#ffcc88' : '#66cc66' }).setOrigin(0.5));

    const colY  = 510;
    const colBg = this.add.rectangle(W / 2, colY, 260, 64, 0x200040)
      .setStrokeStyle(2, 0xcc44ff).setInteractive({ useHandCursor: true })
      .on('pointerup', () => { GameState.save(); this._showGuildHub(); });
    c.add(colBg);
    c.add(this.add.text(W / 2, colY, 'COLLECT', { font: '22px monospace', fill: '#cc88ff' }).setOrigin(0.5));

    GameState.save();
    AchievementManager.showPopups(this);
  }

  _fmtSecs(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + ':' + String(s).padStart(2, '0');
  }
}

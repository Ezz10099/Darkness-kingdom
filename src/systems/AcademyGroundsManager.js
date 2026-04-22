import HeroManager from './HeroManager.js';

// Bench heroes passively train at 15% of active squad XP rate.
// Level cap: bench hero can only catch up to the lowest active squad member's level.
const AcademyGroundsManager = {
  BASE_XP_RATE: 2,          // XP/sec per benched hero at 0 regions cleared
  MAX_OFFLINE_SECS: 57600,  // 16-hour cap (matches IdleManager)

  // Elder Tree Academy Branch stub — multiply by this to boost bench training rate
  academyBoostMultiplier: 1.0,

  getXpRate(campaignProgress) {
    const regions = campaignProgress?.regionCleared || 0;
    return this.BASE_XP_RATE * (1 + regions * 0.3) * this.academyBoostMultiplier;
  },

  _extractHeroIds(activeSquad) {
    return (activeSquad || []).map(entry => (typeof entry === 'string' ? entry : entry?.heroId)).filter(Boolean);
  },

  getBenchedHeroes(activeSquad) {
    const squadSet = new Set(this._extractHeroIds(activeSquad));
    return HeroManager.getAllHeroes().filter(h => !squadSet.has(h.id));
  },

  // Returns the minimum level among active squad members, or 0 if no squad.
  getCapLevel(activeSquad) {
    if (!activeSquad || activeSquad.length === 0) return 0;
    const members = this._extractHeroIds(activeSquad).map(id => HeroManager.getHero(id)).filter(Boolean);
    if (members.length === 0) return 0;
    return Math.min(...members.map(h => h.level));
  },

  _distributeXp(xpPerHero, activeSquad) {
    if (xpPerHero <= 0) return;
    const capLevel = this.getCapLevel(activeSquad);
    if (capLevel <= 0) return; // no active squad — no training
    for (const hero of this.getBenchedHeroes(activeSquad)) {
      if (hero.level >= capLevel) continue;
      // Cap XP at current threshold so the bar doesn't silently overflow
      const space = hero.xpThreshold() - hero.xp;
      if (space > 0) hero.addXP(Math.min(xpPerHero, space));
    }
  },

  tick(deltaMs, campaignProgress, activeSquad) {
    const xp = (this.getXpRate(campaignProgress) * deltaMs) / 1000;
    this._distributeXp(xp, activeSquad);
  },

  processOffline(lastSaveTime, campaignProgress, activeSquad) {
    if (!lastSaveTime) return 0;
    const elapsed = Math.min((Date.now() - lastSaveTime) / 1000, this.MAX_OFFLINE_SECS);
    if (elapsed <= 0) return 0;
    const xpPerHero = Math.floor(this.getXpRate(campaignProgress) * elapsed);
    if (xpPerHero > 0) this._distributeXp(xpPerHero, activeSquad);
    return xpPerHero;
  },

  toJSON() {
    return { academyBoostMultiplier: this.academyBoostMultiplier };
  },

  fromJSON(data) {
    if (data?.academyBoostMultiplier != null) {
      this.academyBoostMultiplier = data.academyBoostMultiplier;
    }
  }
};

export default AcademyGroundsManager;

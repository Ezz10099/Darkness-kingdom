import { CURRENCY } from '../data/constants.js';
import CurrencyManager from './CurrencyManager.js';
import AcademyGroundsManager from './AcademyGroundsManager.js';
import ElderTreeManager from './ElderTreeManager.js';
import HeroManager from './HeroManager.js';
import { getStageById } from '../data/stageDefinitions.js';
import DailyCodexManager from './DailyCodexManager.js';

const IdleManager = {
  BASE_RATE: 5, // fallback gold/sec when no stage is cleared

  getRate(campaignProgress) {
    const stage = getStageById(campaignProgress?.stageCleared);
    if (!stage) return this.BASE_RATE * (1 + ElderTreeManager.getGoldBonus());
    const stageGoldPerSec = Math.max(1, Math.floor(stage.rewards.gold / 10));
    return stageGoldPerSec * (1 + ElderTreeManager.getGoldBonus());
  },

  getXpRate(campaignProgress) {
    const stage = getStageById(campaignProgress?.stageCleared);
    if (!stage) return 0;
    return Math.max(1, Math.floor(stage.rewards.xp / 12));
  },

  _grantXp(xpTotal) {
    if (xpTotal <= 0) return;
    HeroManager.getAllHeroes().forEach(hero => hero.addXP(xpTotal));
  },

  tick(deltaMs, campaignProgress, activeSquad) {
    const earnedGold = (this.getRate(campaignProgress) * deltaMs) / 1000;
    const earnedXp = (this.getXpRate(campaignProgress) * deltaMs) / 1000;
    const wholeGold = Math.floor(earnedGold);
    const wholeXp = Math.floor(earnedXp);
    if (wholeGold > 0) CurrencyManager.add(CURRENCY.GOLD, wholeGold);
    if (wholeXp > 0) this._grantXp(wholeXp);
    AcademyGroundsManager.tick(deltaMs, campaignProgress, activeSquad);
    return wholeGold;
  },

  processOffline(lastSaveTime, campaignProgress, activeSquad) {
    if (!lastSaveTime) return 0;
    const capSecs = ElderTreeManager.getIdleCapSecs();
    const elapsed = Math.min((Date.now() - lastSaveTime) / 1000, capSecs);
    if (elapsed <= 0) return 0;
    const earnedGold = Math.floor(this.getRate(campaignProgress) * elapsed);
    const earnedXp = Math.floor(this.getXpRate(campaignProgress) * elapsed);
    if (earnedGold > 0) CurrencyManager.add(CURRENCY.GOLD, earnedGold);
    if (earnedXp > 0) this._grantXp(earnedXp);
    if (earnedGold > 0 || earnedXp > 0) DailyCodexManager.increment('COLLECT_IDLE');
    AcademyGroundsManager.processOffline(lastSaveTime, campaignProgress, activeSquad);
    return earnedGold;
  }
};

export default IdleManager;

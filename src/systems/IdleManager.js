import { CURRENCY } from '../data/constants.js';
import CurrencyManager from './CurrencyManager.js';
import AcademyGroundsManager from './AcademyGroundsManager.js';
import ElderTreeManager from './ElderTreeManager.js';

const IdleManager = {
  BASE_RATE: 5, // gold/sec at 0 regions cleared

  getRate(campaignProgress) {
    const regions = campaignProgress?.regionCleared || 0;
    const base = this.BASE_RATE * (1 + regions * 0.5);
    return base * (1 + ElderTreeManager.getGoldBonus());
  },

  tick(deltaMs, campaignProgress, activeSquad) {
    const earned = (this.getRate(campaignProgress) * deltaMs) / 1000;
    const whole = Math.floor(earned);
    if (whole > 0) CurrencyManager.add(CURRENCY.GOLD, whole);
    AcademyGroundsManager.tick(deltaMs, campaignProgress, activeSquad);
    return whole;
  },

  processOffline(lastSaveTime, campaignProgress, activeSquad) {
    if (!lastSaveTime) return 0;
    const capSecs = ElderTreeManager.getIdleCapSecs();
    const elapsed = Math.min((Date.now() - lastSaveTime) / 1000, capSecs);
    if (elapsed <= 0) return 0;
    const earned = Math.floor(this.getRate(campaignProgress) * elapsed);
    if (earned > 0) CurrencyManager.add(CURRENCY.GOLD, earned);
    AcademyGroundsManager.processOffline(lastSaveTime, campaignProgress, activeSquad);
    return earned;
  }
};

export default IdleManager;

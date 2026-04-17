import { CURRENCY } from '../data/constants.js';
import CurrencyManager from './CurrencyManager.js';

const IdleManager = {
  BASE_RATE: 5,          // gold/sec at 0 regions cleared
  MAX_OFFLINE_SECS: 57600, // 16 hours

  getRate(campaignProgress) {
    const regions = campaignProgress?.regionCleared || 0;
    return this.BASE_RATE * (1 + regions * 0.5);
  },

  tick(deltaMs, campaignProgress) {
    const earned = (this.getRate(campaignProgress) * deltaMs) / 1000;
    const whole = Math.floor(earned);
    if (whole > 0) CurrencyManager.add(CURRENCY.GOLD, whole);
    return whole;
  },

  processOffline(lastSaveTime, campaignProgress) {
    if (!lastSaveTime) return 0;
    const elapsed = Math.min((Date.now() - lastSaveTime) / 1000, this.MAX_OFFLINE_SECS);
    if (elapsed <= 0) return 0;
    const earned = Math.floor(this.getRate(campaignProgress) * elapsed);
    if (earned > 0) CurrencyManager.add(CURRENCY.GOLD, earned);
    return earned;
  }
};

export default IdleManager;

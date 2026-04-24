import { CURRENCY } from '../data/constants.js';
import CurrencyManager from './CurrencyManager.js';

const MILESTONE_REWARDS = Object.freeze({
  7: 150,
  14: 300,
  30: 700
});

function _todayStr() { return new Date().toISOString().slice(0, 10); }
function _dayDiff(a, b) {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((db - da) / 86400000);
}

const LoginStreakManager = {
  streakDays: 0,
  lastClaimDate: null,
  claimedMilestones: [],
  lastPopupDate: null,

  canClaimToday() {
    return this.lastClaimDate !== _todayStr();
  },

  claimToday() {
    const today = _todayStr();
    if (this.lastClaimDate === today) return null;
    if (!this.lastClaimDate) this.streakDays = 1;
    else {
      const diff = _dayDiff(this.lastClaimDate, today);
      this.streakDays = diff === 1 ? this.streakDays + 1 : 1;
    }
    this.lastClaimDate = today;
    this.lastPopupDate = today;

    const rewardedMilestones = [];
    for (const dayStr of Object.keys(MILESTONE_REWARDS)) {
      const day = Number(dayStr);
      if (this.streakDays >= day && !this.claimedMilestones.includes(day)) {
        this.claimedMilestones.push(day);
        const amount = MILESTONE_REWARDS[day];
        CurrencyManager.add(CURRENCY.PREMIUM_CRYSTALS, amount);
        rewardedMilestones.push({ day, premiumCrystals: amount });
      }
    }
    return { day: this.streakDays, rewardedMilestones };
  },

  getMilestones() {
    return Object.keys(MILESTONE_REWARDS).map(Number).map(day => ({
      day,
      premiumCrystals: MILESTONE_REWARDS[day],
      claimed: this.claimedMilestones.includes(day),
      reached: this.streakDays >= day
    }));
  },

  toJSON() {
    return {
      streakDays: this.streakDays,
      lastClaimDate: this.lastClaimDate,
      claimedMilestones: [...this.claimedMilestones],
      lastPopupDate: this.lastPopupDate
    };
  },

  fromJSON(data) {
    if (!data) return;
    this.streakDays = data.streakDays || 0;
    this.lastClaimDate = data.lastClaimDate || null;
    this.claimedMilestones = data.claimedMilestones || [];
    this.lastPopupDate = data.lastPopupDate || null;
  }
};

export { MILESTONE_REWARDS };
export default LoginStreakManager;

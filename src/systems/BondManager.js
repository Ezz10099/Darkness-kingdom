import BOND_DEFINITIONS from '../data/bondDefinitions.js';

function _countActiveMembers(bond, activeHeroDefIds) {
  const activeSet = new Set(activeHeroDefIds);
  return bond.memberHeroDefIds.reduce((n, id) => n + (activeSet.has(id) ? 1 : 0), 0);
}

function _getBondHeroBonus(bond, activeCount, heroDefId) {
  const perHeroByCount = bond.perHeroBonusByActiveMembers?.[activeCount];
  if (perHeroByCount && typeof perHeroByCount[heroDefId] === 'number') {
    return perHeroByCount[heroDefId];
  }
  return bond.bonusByActiveMembers?.[activeCount] || 0;
}

const BondManager = {
  getActiveBonds(activeHeroDefIds) {
    return BOND_DEFINITIONS
      .map(bond => {
        const activeCount = _countActiveMembers(bond, activeHeroDefIds);
        const bonus = bond.bonusByActiveMembers[activeCount] || 0;
        if (bonus <= 0) return null;
        return {
          bondId: bond.id,
          name: bond.name,
          activeCount,
          bonus,
          bonusDescription: bond.bonusDescription || null
        };
      })
      .filter(Boolean);
  },

  // Aggregate % stat bonus applied to members participating in active bonds.
  // Supports asymmetric per-hero bonuses when perHeroBonusByActiveMembers is present.
  getHeroBondBonus(heroDefId, activeHeroDefIds) {
    const activeSet = new Set(activeHeroDefIds);
    if (!activeSet.has(heroDefId)) return 0;

    let bonus = 0;
    for (const bond of BOND_DEFINITIONS) {
      if (!bond.memberHeroDefIds.includes(heroDefId)) continue;
      const activeCount = _countActiveMembers(bond, activeHeroDefIds);
      bonus += _getBondHeroBonus(bond, activeCount, heroDefId);
    }
    return bonus;
  }
};

export default BondManager;

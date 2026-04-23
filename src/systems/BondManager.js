import BOND_DEFINITIONS from '../data/bondDefinitions.js';

function _countActiveMembers(bond, activeHeroDefIds) {
  const activeSet = new Set(activeHeroDefIds);
  return bond.memberHeroDefIds.reduce((n, id) => n + (activeSet.has(id) ? 1 : 0), 0);
}

const BondManager = {
  getActiveBonds(activeHeroDefIds) {
    return BOND_DEFINITIONS
      .map(bond => {
        const activeCount = _countActiveMembers(bond, activeHeroDefIds);
        const bonus = bond.bonusByActiveMembers[activeCount] || 0;
        return bonus > 0 ? { bondId: bond.id, name: bond.name, activeCount, bonus } : null;
      })
      .filter(Boolean);
  },

  // Aggregate % stat bonus applied to all members participating in active bonds.
  getHeroBondBonus(heroDefId, activeHeroDefIds) {
    const activeSet = new Set(activeHeroDefIds);
    if (!activeSet.has(heroDefId)) return 0;

    let bonus = 0;
    for (const bond of BOND_DEFINITIONS) {
      if (!bond.memberHeroDefIds.includes(heroDefId)) continue;
      const activeCount = _countActiveMembers(bond, activeHeroDefIds);
      bonus += bond.bonusByActiveMembers[activeCount] || 0;
    }
    return bonus;
  }
};

export default BondManager;

// Campaign launch content: 5 regions, 80 total stages.
// Enemy objects are spread directly into BattleEngine combatants, so fields
// must match what BattleEngine expects: id, name, heroClass, affinity, range,
// stats {hp,defense,damage}, row, abilityIds, ultimateAbilityId, ultimateCharge.

const REGION_SCHEDULE = [
  { region: 1, name: 'The Academy Grounds',      stages: 12, unlockSystem: 'BASIC_SUMMON' },
  { region: 2, name: 'The Shattered Lowlands',   stages: 15, unlockSystem: 'ADVANCED_SUMMON' },
  { region: 3, name: 'The Thornwood',            stages: 15, unlockSystem: 'AFFINITY_TOWERS' },
  { region: 4, name: 'The Ashen Expanse',        stages: 18, unlockSystem: 'WORLD_BOSS_HARD_TIER' },
  { region: 5, name: 'The Veilspire',            stages: 20, unlockSystem: 'FULL_ENDLESS_CONTENT' }
];

const REGION_THEME_BY_ID = {
  1: 'The Academy and its surroundings.',
  2: 'War-torn plains and ancient ruins.',
  3: 'A corrupted ancient forest.',
  4: 'A vast volcanic wasteland.',
  5: 'A mysterious floating endgame realm.'
};

const ENEMY_ARCHETYPES = [
  { name: 'Guard', heroClass: 'WARRIOR', affinity: 'FIRE',  range: 'melee',  row: 'FRONT', abilityIds: ['wa_slash'],                    ultimateAbilityId: 'wa_berserker_surge' },
  { name: 'Warden', heroClass: 'TANK',   affinity: 'EARTH', range: 'melee',  row: 'FRONT', abilityIds: ['tk_provoke', 'aff_earthen_grip'], ultimateAbilityId: 'tk_bulwark' },
  { name: 'Archer', heroClass: 'ARCHER', affinity: 'ICE',   range: 'ranged', row: 'BACK',  abilityIds: ['ar_swift_shot'],               ultimateAbilityId: 'ar_rain_of_arrows' },
  { name: 'Sorc',   heroClass: 'MAGE',   affinity: 'SHADOW',range: 'ranged', row: 'BACK',  abilityIds: ['mg_arcane_bolt'],              ultimateAbilityId: 'mg_void_burst' }
];

const PRESET_STAGE_OVERRIDES = {
  '1-1': { name: 'Academy Gates', enemies: [{ ...ENEMY_ARCHETYPES[0], id: 'e_1_1_a', stats: { hp: 95, defense: 8, damage: 12 }, ultimateCharge: 0 }] },
  '1-2': { name: 'Training Yard', enemies: [
    { ...ENEMY_ARCHETYPES[0], id: 'e_1_2_a', stats: { hp: 115, defense: 10, damage: 14 }, abilityIds: ['wa_slash', 'wa_shield_bash'], ultimateCharge: 0 },
    { ...ENEMY_ARCHETYPES[2], id: 'e_1_2_b', stats: { hp: 75, defense: 6, damage: 16 }, ultimateCharge: 0 }
  ] },
  '1-3': { name: 'The East Wing', enemies: [
    { ...ENEMY_ARCHETYPES[0], id: 'e_1_3_a', stats: { hp: 145, defense: 14, damage: 18 }, abilityIds: ['wa_slash', 'aff_burning_touch'], ultimateCharge: 0 },
    { ...ENEMY_ARCHETYPES[2], id: 'e_1_3_b', stats: { hp: 90, defense: 8, damage: 20 }, abilityIds: ['ar_piercing_arrow'], ultimateCharge: 0 }
  ], milestoneRewards: [{ type: 'giftHero', heroDefId: 'hero_brynn', hint: 'Brynn joins your team!' }] },
  '1-4': { name: 'The Grand Hall', enemies: [
    { ...ENEMY_ARCHETYPES[1], id: 'e_1_4_a', stats: { hp: 230, defense: 28, damage: 14 }, ultimateCharge: 0 },
    { ...ENEMY_ARCHETYPES[3], id: 'e_1_4_b', stats: { hp: 82, defense: 8, damage: 26 }, abilityIds: ['mg_arcane_bolt', 'aff_glacial_spike'], affinity: 'ICE', ultimateCharge: 0 }
  ] },
  '1-5': { name: "Headmaster's Trial", enemies: [
    { ...ENEMY_ARCHETYPES[1], id: 'e_1_5_a', stats: { hp: 265, defense: 32, damage: 16 }, ultimateCharge: 0 },
    { ...ENEMY_ARCHETYPES[0], id: 'e_1_5_b', stats: { hp: 175, defense: 18, damage: 22 }, abilityIds: ['wa_slash', 'aff_burning_touch'], ultimateCharge: 0 },
    { ...ENEMY_ARCHETYPES[3], id: 'e_1_5_c', stats: { hp: 95, defense: 10, damage: 30 }, abilityIds: ['mg_arcane_bolt', 'aff_burning_touch'], affinity: 'FIRE', ultimateCharge: 0 }
  ], milestoneRewards: [{ type: 'giftHero', heroDefId: 'hero_sylva', hint: 'Sylva joins your team!' }] }
};

function makeEnemy(region, stage, slot, power) {
  const arch = ENEMY_ARCHETYPES[(region + stage + slot) % ENEMY_ARCHETYPES.length];
  const hpBase = 90 + power * 24;
  const defBase = 8 + Math.floor(power * 2.5);
  const dmgBase = 12 + Math.floor(power * 2.2);
  return {
    id: `e_${region}_${stage}_${String.fromCharCode(97 + slot)}`,
    name: arch.name,
    heroClass: arch.heroClass,
    affinity: arch.affinity,
    range: arch.range,
    row: arch.row,
    abilityIds: arch.abilityIds,
    ultimateAbilityId: arch.ultimateAbilityId,
    ultimateCharge: 0,
    stats: {
      hp: hpBase + slot * 16,
      defense: defBase + slot,
      damage: dmgBase + slot * 2
    }
  };
}

function makeGeneratedStage(regionCfg, stageNum) {
  const id = `${regionCfg.region}-${stageNum}`;
  const power = (regionCfg.region - 1) * 10 + stageNum;
  const enemyCount = stageNum % 6 === 0 ? 3 : stageNum % 2 === 0 ? 2 : 1;
  const enemies = Array.from({ length: enemyCount }, (_, slot) => makeEnemy(regionCfg.region, stageNum, slot, power));
  return {
    id,
    region: regionCfg.region,
    stage: stageNum,
    regionName: regionCfg.name,
    regionTheme: REGION_THEME_BY_ID[regionCfg.region],
    name: `${regionCfg.name} ${stageNum}`,
    enemies,
    rewards: {
      gold: 50 + power * 16,
      xp: 20 + power * 6
    },
    milestoneRewards: []
  };
}

const STAGE_DEFINITIONS = REGION_SCHEDULE.flatMap(regionCfg => {
  return Array.from({ length: regionCfg.stages }, (_, i) => {
    const stageNum = i + 1;
    const generated = makeGeneratedStage(regionCfg, stageNum);
    const override = PRESET_STAGE_OVERRIDES[generated.id];
    if (override) {
      return { ...generated, ...override };
    }
    if (stageNum === regionCfg.stages) {
      generated.milestoneRewards.push({
        type: 'unlockSystem',
        system: regionCfg.unlockSystem,
        hint: `${regionCfg.unlockSystem.replaceAll('_', ' ')} unlocked!`
      });
      if (regionCfg.region === 2) {
        generated.milestoneRewards.push({ type: 'unlockSystem', system: 'ARENA', hint: 'Arena unlocked!' });
      }
      if (regionCfg.region === 3) {
        generated.milestoneRewards.push({ type: 'unlockSystem', system: 'GUILD', hint: 'Guild unlocked!' });
      }
    }
    return generated;
  });
});

const STAGE_ID_MAP = new Map(STAGE_DEFINITIONS.map(stage => [stage.id, stage]));

export function getStageById(stageId) {
  return STAGE_ID_MAP.get(stageId) || null;
}

export function getCampaignRegions() {
  return REGION_SCHEDULE.map(cfg => ({ ...cfg }));
}

export default STAGE_DEFINITIONS;

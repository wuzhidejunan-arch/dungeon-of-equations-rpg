export const progressionConfig = {
  leveling: {
    baseExpToNext: 10,
    expStepPerLevel: 5,
    goldPerLevel: 30,
    hpGrowth: {
      maxHpGain: 3,
      healOnGain: 2,
    },
  },
  trainingRewards: {
    default: {
      maxHpGain: 10,
      healAmount: 10,
      goldGain: 100,
    },
    stageLevelTargets: {
      1: 3,
      2: 7,
      3: 10,
      101: 3,
      102: 7,
      103: 10,
      201: 3,
      202: 7,
      203: 10,
    },
  },
};

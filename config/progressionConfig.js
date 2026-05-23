export const progressionConfig = {
  leveling: {
    baseExpToNext: 20,
    expStepPerLevel: 10,
    goldPerLevel: 30,
    hpGrowth: {
      maxHpGain: 2,
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
    },
  },
};

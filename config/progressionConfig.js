export const progressionConfig = {
  leveling: {
    baseExpToNext: 20,
    expStepPerLevel: 10,
    goldPerLevel: 30,
    hpGrowth: {
      startAfterLevel: 10,
      evenLevelsOnly: true,
      maxHpGain: 1,
      healOnGain: 1,
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

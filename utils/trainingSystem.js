import { playerData } from '../data/playerData.js';
import { ensureLevelState, getRequiredExpForLevel } from './levelSystem.js';
import { progressionConfig } from '../config/progressionConfig.js';
import { getDifficultyConfig } from '../config/difficultySettings.js';

export const TRAINING_STAGE_IDS = [1, 2, 3];

const DEFAULT_TRAINING_STATE = {
  completedStages: [],
  activeBattleStage: null,
  lastBattleWinKey: null,
};

function getCurrentTrainingStageOrder(target = playerData) {
  const stageOrder = getDifficultyConfig(target?.difficulty)?.training?.stageOrder || TRAINING_STAGE_IDS;
  return Array.isArray(stageOrder) && stageOrder.length ? stageOrder : TRAINING_STAGE_IDS;
}

export function ensureTrainingState(target = playerData) {
  if (!target.trainingProgress || typeof target.trainingProgress !== 'object') {
    target.trainingProgress = { ...DEFAULT_TRAINING_STATE };
  }

  if (!Array.isArray(target.trainingProgress.completedStages)) {
    target.trainingProgress.completedStages = [];
  }

  if (typeof target.trainingProgress.activeBattleStage !== 'number') {
    target.trainingProgress.activeBattleStage = null;
  }

  if (typeof target.trainingProgress.lastBattleWinKey !== 'string') {
    target.trainingProgress.lastBattleWinKey = null;
  }

  return target.trainingProgress;
}

export function isTrainingStageCompleted(stageId, target = playerData) {
  const state = ensureTrainingState(target);
  return state.completedStages.includes(stageId);
}

export function isTrainingStageUnlocked(stageId, target = playerData) {
  const stageOrder = getCurrentTrainingStageOrder(target);
  const stageIndex = stageOrder.indexOf(stageId);

  if (stageIndex <= 0) {
    return true;
  }

  return isTrainingStageCompleted(stageOrder[stageIndex - 1], target);
}

export function completeTrainingStage(stageId, target = playerData) {
  const state = ensureTrainingState(target);
  ensureLevelState(target);

  if (!state.completedStages.includes(stageId)) {
    state.completedStages.push(stageId);
    state.completedStages.sort((a, b) => a - b);
  }

  const rewardConfig = progressionConfig.trainingRewards.default;
  target.gold += rewardConfig.goldGain;

  const rewardLines = [
    `Training Stage ${stageId} Clear!`,
  ];

  const targetLevel = progressionConfig.trainingRewards.stageLevelTargets[stageId] || null;
  if (targetLevel && target.level < targetLevel) {
    const levelsGained = targetLevel - target.level;
    const hpGrowth = progressionConfig.leveling.hpGrowth;
    const maxHpGain = Math.max(0, Number(hpGrowth.maxHpGain) || 0) * levelsGained;

    if (maxHpGain > 0) {
      target.maxHp += maxHpGain;
      target.hp = target.maxHp;
      rewardLines.push(`+${maxHpGain} Max HP`);
    }

    target.level = targetLevel;
    target.exp = 0;
    target.expToNext = getRequiredExpForLevel(target.level);
    rewardLines.push(`Set Lv.${targetLevel}`);
  }

  rewardLines.push(`+${rewardConfig.goldGain} Gold`);

  return { rewardLines };
}

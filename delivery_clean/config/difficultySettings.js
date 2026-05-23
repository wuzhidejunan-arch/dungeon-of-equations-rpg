import { playerData } from '../data/playerData.js';
import { beginnerDifficultyConfig } from './beginnerDifficultyConfig.js';
import { intermediateDifficultyConfig } from './intermediateDifficultyConfig.js';
import { challengeDifficultyConfig } from './challengeDifficultyConfig.js';
import { battleBuilderModes } from './battleBuilderModes.js';
import { enemyData } from '../data/enemyData.js';

const DEFAULT_BUILDER_CONFIG = Object.freeze({
  mode: battleBuilderModes.SINGLE_LINE,
  operators: ['+', '-'],
  numbersPerTurn: 4,
  maxGenerationAttempts: 300,
  operatorGlyphSet: 'classic',
  utilitySkillsBypassBuilder: false,
});

const DIFFICULTY_CONFIGS = {
  beginner: {
    key: 'beginner',
    skillIds: ['oddAttack', 'evenAttack', 'primeAttack', 'zeroGuard'],
    builder: {
      mode: battleBuilderModes.SINGLE_LINE,
      operators: ['+', '-'],
      numbersPerTurn: 4,
      maxGenerationAttempts: 300,
      operatorGlyphSet: 'classic',
      utilitySkillsBypassBuilder: false,
    },
    training: beginnerDifficultyConfig.training,
  },
  intermediate: intermediateDifficultyConfig,
  challenge: challengeDifficultyConfig,
};

export function getCurrentDifficultyKey(explicitKey = null) {
  return explicitKey || playerData.difficulty || 'beginner';
}

export function getDifficultyConfig(difficultyKey = null) {
  return DIFFICULTY_CONFIGS[getCurrentDifficultyKey(difficultyKey)] || DIFFICULTY_CONFIGS.beginner;
}

export function getDifficultySkillIds(difficultyKey = null) {
  return [...(getDifficultyConfig(difficultyKey).skillIds || DIFFICULTY_CONFIGS.beginner.skillIds)];
}

export function getDifficultyBuilderConfig(difficultyKey = null) {
  const builderConfig = getDifficultyConfig(difficultyKey).builder || DEFAULT_BUILDER_CONFIG;
  return {
    ...DEFAULT_BUILDER_CONFIG,
    ...builderConfig,
    operators: [...(builderConfig.operators || DEFAULT_BUILDER_CONFIG.operators)],
  };
}

export function getDifficultyBuilderMode(difficultyKey = null) {
  return getDifficultyBuilderConfig(difficultyKey).mode;
}

export function getDifficultyBuilderOperators(difficultyKey = null) {
  return getDifficultyBuilderConfig(difficultyKey).operators;
}

export function getDifficultyBuilderMaxGenerationAttempts(difficultyKey = null) {
  return getDifficultyBuilderConfig(difficultyKey).maxGenerationAttempts;
}

export function getDifficultyOperatorGlyphSet(difficultyKey = null) {
  return getDifficultyBuilderConfig(difficultyKey).operatorGlyphSet;
}

export function difficultyBypassesBuilderForUtilitySkills(difficultyKey = null) {
  return Boolean(getDifficultyBuilderConfig(difficultyKey).utilitySkillsBypassBuilder);
}

export function getDifficultyTrainingConfig(difficultyKey = null) {
  return getDifficultyConfig(difficultyKey).training || null;
}

export function getDifficultyDungeonEnemy(roomNumber, type = 'encounter', difficultyKey = null) {
  const config = getDifficultyConfig(difficultyKey);
  const roomConfig = config?.dungeon?.rooms?.[roomNumber] || null;
  if (!roomConfig) return null;

  if (type === 'boss') {
    const baseEnemy = enemyData[roomConfig.bossEnemyId] || null;
    if (!baseEnemy) return null;

    return baseEnemy;
  }

  const poolIds = roomConfig.encounterPoolIds || [];
  const pool = poolIds.map((id) => enemyData[id]).filter(Boolean);
  return pool.length ? pool : null;
}

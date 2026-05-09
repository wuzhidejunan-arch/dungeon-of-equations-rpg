import { beginnerDifficultyConfig } from '../config/beginnerDifficultyConfig.js';
import { getCurrentDifficultyKey, getDifficultyConfig } from '../config/difficultySettings.js';
import { trainingStageData } from '../data/trainingStages.js';

function getTrainingRoot(difficultyKey = null) {
  return getDifficultyConfig(difficultyKey)?.training || beginnerDifficultyConfig.training;
}

function getStageMeta(stageId, difficultyKey = null) {
  return getTrainingRoot(difficultyKey)?.stages?.[stageId] || null;
}

function getStageBaseData(stageId, difficultyKey = null) {
  const key = getCurrentDifficultyKey(difficultyKey);

  if (key === 'beginner') {
    return trainingStageData[stageId] || null;
  }

  return getStageMeta(stageId, difficultyKey);
}

export function getTrainingStageIds(difficultyKey = null) {
  const root = getTrainingRoot(difficultyKey);
  return root?.stageOrder || Object.keys(root?.stages || {}).map((value) => Number(value));
}

export function getTrainingStageConfig(stageId, difficultyKey = null) {
  const stageData = getStageBaseData(stageId, difficultyKey);
  const stageMeta = getStageMeta(stageId, difficultyKey);

  if (!stageData && !stageMeta) {
    return null;
  }

  return {
    ...(stageData || {}),
    ...(stageMeta || {}),
    battle: {
      ...(stageData?.battle || {}),
      ...(stageMeta?.battle || {}),
    },
  };
}

export function getTrainingStageName(stageId, difficultyKey = null) {
  return getTrainingStageConfig(stageId, difficultyKey)?.name || `Stage ${stageId}`;
}

export function getTrainingStageTutorialTitle(stageId, difficultyKey = null) {
  return getTrainingStageConfig(stageId, difficultyKey)?.tutorialTitle || `Stage ${stageId} Tutorial`;
}

export function getTrainingStageLessonPages(stageId, difficultyKey = null) {
  return getTrainingStageConfig(stageId, difficultyKey)?.lessonPages || [];
}

export function getTrainingStageQuestions(stageId, difficultyKey = null) {
  return getTrainingStageConfig(stageId, difficultyKey)?.questions || [];
}

export function getTrainingStagePassScore(stageId, difficultyKey = null) {
  return getTrainingStageConfig(stageId, difficultyKey)?.passScore || 15;
}

export function getTrainingStageBattleConfig(stageId, difficultyKey = null) {
  return getTrainingStageConfig(stageId, difficultyKey)?.battle || null;
}

export function getTrainingStageClearMessage(stageId, replacements = {}, difficultyKey = null) {
  return formatTemplate(getTrainingStageConfig(stageId, difficultyKey)?.clearMessage || `Stage ${stageId} clear.`, replacements);
}

export function getTrainingStageFailMessage(stageId, replacements = {}, difficultyKey = null) {
  return formatTemplate(getTrainingStageConfig(stageId, difficultyKey)?.failMessage || `Stage ${stageId} not cleared yet.`, replacements);
}

function formatTemplate(template, replacements = {}) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) => `${replacements?.[key] ?? ''}`);
}

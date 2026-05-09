import {
  getTrainingStageBattleConfig,
  getTrainingStageClearMessage,
  getTrainingStageConfig,
  getTrainingStageFailMessage,
  getTrainingStageIds,
  getTrainingStageLessonPages,
  getTrainingStageName,
  getTrainingStagePassScore,
  getTrainingStageQuestions,
  getTrainingStageTutorialTitle,
} from '../../engine/trainingStageController.js';

export class TrainingStageRegistry {
  getStageIds() {
    return getTrainingStageIds();
  }

  getStageConfig(stageId) {
    return getTrainingStageConfig(stageId);
  }

  getStageName(stageId) {
    return getTrainingStageName(stageId);
  }

  getStageTutorialTitle(stageId) {
    return getTrainingStageTutorialTitle(stageId);
  }

  getStageLessonPages(stageId) {
    return getTrainingStageLessonPages(stageId);
  }

  getStageQuestions(stageId) {
    return getTrainingStageQuestions(stageId);
  }

  getStagePassScore(stageId) {
    return getTrainingStagePassScore(stageId);
  }

  getStageBattleConfig(stageId) {
    return getTrainingStageBattleConfig(stageId);
  }

  getStageClearMessage(stageId, replacements = {}) {
    return getTrainingStageClearMessage(stageId, replacements);
  }

  getStageFailMessage(stageId, replacements = {}) {
    return getTrainingStageFailMessage(stageId, replacements);
  }
}

export function createTrainingStageRegistry() {
  return new TrainingStageRegistry();
}

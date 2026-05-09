import { createTrainingStageRegistry } from '../domains/training/TrainingStageRegistry.js';

export const defaultTrainingModule = {
  id: 'default-training-module',
  install({ container }) {
    if (!container.has('trainingStageRegistry')) {
      container.register('trainingStageRegistry', createTrainingStageRegistry());
    }
  },
};

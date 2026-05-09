import { createTrainingPresentationSuite } from '../domains/training/presentation/createTrainingPresentationSuite.js';

export const defaultTrainingPresentationModule = {
  id: 'default-training-presentation-module',
  install({ container }) {
    if (!container.has('trainingPresentationFactory')) {
      container.register('trainingPresentationFactory', ({ scene, stageRegistry, guideIntroPanel }) => (
        createTrainingPresentationSuite({
          scene,
          stageRegistry,
          guideIntroPanel,
          tutorialPresentationFactory: container.get('tutorialPresentationFactory'),
        })
      ));
    }
  },
};

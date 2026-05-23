import { createTutorialPresentationSuite } from '../domains/tutorial/presentation/createTutorialPresentationSuite.js';

export const defaultTutorialPresentationModule = {
  id: 'default-tutorial-presentation-module',
  install({ container }) {
    if (!container.has('tutorialPresentationFactory')) {
      container.register('tutorialPresentationFactory', ({ scene, guideIntroPanel }) => (
        createTutorialPresentationSuite({ scene, guideIntroPanel })
      ));
    }
  },
};

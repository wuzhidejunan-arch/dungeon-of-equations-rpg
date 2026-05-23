import { TrainingViewStateBuilder } from './TrainingViewStateBuilder.js';
import { TrainingRenderer } from './TrainingRenderer.js';
import { TrainingPresenter } from './TrainingPresenter.js';
import { TrainingPresentationFacade } from './TrainingPresentationFacade.js';
import { createTutorialPresentationSuite } from '../../tutorial/presentation/createTutorialPresentationSuite.js';

export function createTrainingPresentationSuite({
  scene,
  stageRegistry,
  guideIntroPanel,
  tutorialPresentationFactory = null,
}) {
  const viewStateBuilder = new TrainingViewStateBuilder();
  const renderer = new TrainingRenderer();
  const trainingPresenter = new TrainingPresenter({
    scene,
    stageRegistry,
    viewStateBuilder,
    renderer,
  });

  const tutorialSuite = tutorialPresentationFactory
    ? tutorialPresentationFactory({ scene, guideIntroPanel })
    : createTutorialPresentationSuite({ scene, guideIntroPanel });

  const tutorialOverlayPresenter = tutorialSuite?.overlayPresenter || tutorialSuite?.tutorialOverlayPresenter || null;
  const tutorialPresentation = tutorialSuite?.tutorialPresentation || null;

  const trainingPresentation = new TrainingPresentationFacade({
    trainingPresenter,
    tutorialPresentation,
    tutorialOverlayPresenter,
  });

  return {
    trainingPresenter,
    tutorialOverlayPresenter,
    tutorialPresentation,
    trainingPresentation,
    presentationFacade: trainingPresentation,
  };
}

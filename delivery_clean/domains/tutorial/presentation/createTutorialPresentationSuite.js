import { TutorialOverlayRenderer } from './TutorialOverlayRenderer.js';
import { TutorialOverlayPresenter } from './TutorialOverlayPresenter.js';
import { TutorialPresentationFacade } from './TutorialPresentationFacade.js';

export function createTutorialPresentationSuite({ scene, guideIntroPanel }) {
  const overlayRenderer = new TutorialOverlayRenderer();
  const overlayPresenter = new TutorialOverlayPresenter({
    scene,
    panel: guideIntroPanel,
    renderer: overlayRenderer,
  });

  const tutorialPresentation = new TutorialPresentationFacade({
    overlayPresenter,
  });

  return {
    overlayRenderer,
    overlayPresenter,
    tutorialPresentation,
  };
}

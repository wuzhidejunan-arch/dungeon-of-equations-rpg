export class TrainingPresentationFacade {
  constructor({ trainingPresenter, tutorialPresentation = null, tutorialOverlayPresenter = null }) {
    this.trainingPresenter = trainingPresenter;
    this.tutorialPresentation = tutorialPresentation;
    this.tutorialOverlayPresenter = tutorialOverlayPresenter || tutorialPresentation?.overlayPresenter || null;
  }

  renderCurrentMode() {
    return this.trainingPresenter.renderCurrentMode();
  }

  refresh() {
    return this.renderCurrentMode();
  }

  renderMenu() {
    return this.trainingPresenter.renderMenu();
  }

  renderLesson() {
    return this.trainingPresenter.renderLesson();
  }

  renderStage1Question() {
    return this.trainingPresenter.renderStage1Question();
  }

  renderStage2Answer() {
    return this.trainingPresenter.renderStage2Answer();
  }

  renderStage2Type() {
    return this.trainingPresenter.renderStage2Type();
  }

  renderMessage() {
    return this.trainingPresenter.renderMessage();
  }

  showGuideIntro(text) {
    return this.tutorialPresentation?.showOverlay?.(text)
      || this.tutorialOverlayPresenter?.show?.(text);
  }

  hideGuideIntro() {
    return this.tutorialPresentation?.hideOverlay?.()
      || this.tutorialOverlayPresenter?.hide?.();
  }
}

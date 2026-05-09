export class TutorialPresentationFacade {
  constructor({ overlayPresenter = null } = {}) {
    this.overlayPresenter = overlayPresenter;
  }

  showOverlay(text) {
    return this.overlayPresenter?.show?.(text);
  }

  hideOverlay() {
    return this.overlayPresenter?.hide?.();
  }
}

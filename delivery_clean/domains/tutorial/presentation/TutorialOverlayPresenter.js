export class TutorialOverlayPresenter {
  constructor({ scene, panel, renderer }) {
    this.scene = scene;
    this.panel = panel;
    this.renderer = renderer;
  }

  show(text) {
    return this.renderer.show(this.scene, this.panel, text);
  }

  hide() {
    return this.renderer.hide(this.scene, this.panel);
  }
}

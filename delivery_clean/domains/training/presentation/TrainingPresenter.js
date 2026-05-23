export class TrainingPresenter {
  constructor({ scene, stageRegistry, viewStateBuilder, renderer }) {
    this.scene = scene;
    this.stageRegistry = stageRegistry;
    this.viewStateBuilder = viewStateBuilder;
    this.renderer = renderer;
  }

  renderCurrentMode() {
    return this.refresh();
  }

  refresh() {
    const viewState = this.viewStateBuilder.build({
      scene: this.scene,
      stageRegistry: this.stageRegistry,
    });

    this.renderer.render(this.scene, viewState);
    return viewState;
  }

  renderMenu() {
    return this.renderWithBuilder('buildMenuState');
  }

  renderLesson() {
    return this.renderWithBuilder('buildLessonState');
  }

  renderStage1Question() {
    return this.renderWithBuilder('buildStage1State');
  }

  renderStage2Answer() {
    return this.renderWithBuilder('buildStage2AnswerState');
  }

  renderStage2Type() {
    return this.renderWithBuilder('buildStage2TypeState');
  }

  renderMessage() {
    return this.renderWithBuilder('buildMessageState');
  }

  renderWithBuilder(builderMethod) {
    const builder = this.viewStateBuilder?.[builderMethod];
    if (typeof builder !== 'function') {
      return this.refresh();
    }

    const viewState = builder.call(this.viewStateBuilder, {
      scene: this.scene,
      stageRegistry: this.stageRegistry,
    });
    this.renderer.render(this.scene, viewState);
    return viewState;
  }
}

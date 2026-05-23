import { BattleViewStateBuilder } from './BattleViewStateBuilder.js';
import { BattleSceneRenderer } from './BattleSceneRenderer.js';

export class BattlePresenter {
  constructor({ scene, renderer = null, viewStateBuilder = null } = {}) {
    this.scene = scene;
    this.renderer = renderer || new BattleSceneRenderer(scene);
    this.viewStateBuilder = viewStateBuilder || new BattleViewStateBuilder();
  }

  buildViewState() {
    return this.viewStateBuilder.build(this.scene);
  }

  syncStatus() {
    const viewState = this.buildViewState();
    this.renderer.refreshStatus(viewState);
    return viewState;
  }

  syncBattleStateUI(state = this.scene.menuState) {
    this.renderer.applyBattleStateUI(state);
  }

  showMainMenu() {
    const viewState = this.buildViewState();
    this.renderer.renderMainMenu(viewState);
    return viewState;
  }

  showItemMenu() {
    const viewState = this.buildViewState();
    this.renderer.renderItemMenu(viewState.items || []);
    return viewState;
  }

  showItemTargetMenu() {
    const viewState = this.buildViewState();
    this.renderer.renderItemTargetMenu(viewState.skillTargets || []);
    return viewState;
  }
}

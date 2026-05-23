import { BattleBuilderViewStateBuilder } from './BattleBuilderViewStateBuilder.js';
import { BattleBuilderRenderer } from './BattleBuilderRenderer.js';

export class BattleBuilderPresenter {
  constructor({ scene, renderer = null, viewStateBuilder = null } = {}) {
    this.scene = scene;
    this.renderer = renderer || new BattleBuilderRenderer(scene);
    this.viewStateBuilder = viewStateBuilder || new BattleBuilderViewStateBuilder();
  }

  open(actionType) {
    const viewState = this.viewStateBuilder.build(this.scene, actionType);
    this.renderer.open(viewState);
    return viewState;
  }

  close(options = {}) {
    this.renderer.close(options);
  }

  hideAfterConfirm() {
    this.renderer.hideAfterConfirm();
  }

  refreshPreview() {
    this.renderer.refreshPreview();
  }
}

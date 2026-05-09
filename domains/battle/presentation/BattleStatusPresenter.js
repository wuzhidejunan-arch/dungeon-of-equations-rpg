import { BattleViewStateBuilder } from './BattleViewStateBuilder.js';
import { BattleStatusRenderer } from './BattleStatusRenderer.js';

export class BattleStatusPresenter {
  constructor({ scene, renderer = null, viewStateBuilder = null } = {}) {
    this.scene = scene;
    this.renderer = renderer || new BattleStatusRenderer(scene);
    this.viewStateBuilder = viewStateBuilder || new BattleViewStateBuilder();
  }

  buildViewState() {
    return this.viewStateBuilder.build(this.scene);
  }

  refreshStatus() {
    const viewState = this.buildViewState();
    this.renderer.refreshStatus(viewState);
    return viewState;
  }

  renderRulePanel() {
    const viewState = this.buildViewState();
    this.renderer.renderRulePanel(viewState?.texts?.rulePanel || '');
    return viewState;
  }

  renderSkillInfo(text = '') {
    this.renderer.renderSkillInfo(text);
  }

  renderSkillOptions(skills = []) {
    this.renderer.renderSkillOptions(skills);
  }

  updateHpBars() {
    const viewState = this.buildViewState();
    this.renderer.updateHpBars(viewState);
    return viewState;
  }
}

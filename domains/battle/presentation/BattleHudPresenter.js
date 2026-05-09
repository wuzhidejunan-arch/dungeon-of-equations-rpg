import { BattleHudRenderer } from './BattleHudRenderer.js';

export class BattleHudPresenter {
  constructor({ scene, renderer = null } = {}) {
    this.scene = scene;
    this.renderer = renderer || new BattleHudRenderer(scene);
  }

  setTextNode(node, text = '') {
    this.renderer.setTextNode(node, text);
  }

  setNodesVisible(nodes = [], visible = false) {
    this.renderer.setNodesVisible(nodes, visible);
  }

  renderTextGroup(entries = []) {
    this.renderer.renderTextGroup(entries);
  }

  setButtonVisible(button, visible) {
    this.renderer.setButtonVisible(button, visible);
  }

  setBuilderVisible(visible) {
    this.renderer.setBuilderVisible(visible);
  }

  setSkillMenuVisible(visible) {
    this.renderer.setSkillMenuVisible(visible);
  }

  renderResultText(text = '', _phase = null, _payload = {}) {
    this.renderer.renderResultText(text);
  }

  renderDialogLine(text = '', _phase = null, _payload = {}) {
    const hasNext = (this.scene.dialogQueue?.length || 0) > 0;
    this.renderer.renderDialogLine(text, hasNext);
  }

  renderTipText(text = '') {
    this.renderer.renderTipText(text);
  }

  renderCommandMenu(text = '', options = {}) {
    this.renderer.renderCommandMenu(text, options);
  }

  addBattleLog(messages = []) {
    this.renderer.addBattleLog(messages);
  }
}

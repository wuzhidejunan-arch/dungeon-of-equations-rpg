const delegate = (scene, method, ...args) => scene.battleUiCoordinator?.[method]?.(...args);

export const BattleUIMixin = {
  setTextNode(node, text = '') {
    return delegate(this, 'setTextNode', node, text);
  },

  setNodesVisible(nodes = [], visible = false) {
    return delegate(this, 'setNodesVisible', nodes, visible);
  },

  renderTextGroup(entries = []) {
    return delegate(this, 'renderTextGroup', entries);
  },

  setBuilderVisible(visible) {
    return delegate(this, 'setBuilderVisible', visible);
  },

  setSkillMenuVisible(visible) {
    return delegate(this, 'setSkillMenuVisible', visible);
  },

  applyBattleStateUI(state = this.menuState) {
    return delegate(this, 'applyBattleStateUI', state);
  },

  setTurn(turn) {
    return delegate(this, 'setTurn', turn);
  },

  setResultPhase(phase, payload = {}) {
    return delegate(this, 'setResultPhase', phase, payload);
  },

  clearResultPhase() {
    return delegate(this, 'clearResultPhase');
  },

  renderResultText(text = '', phase, payload = {}) {
    return delegate(this, 'renderResultText', text, phase, payload);
  },

  renderDialogLine(text = '', phase, payload = {}) {
    return delegate(this, 'renderDialogLine', text, phase, payload);
  },

  renderTipText(text = '') {
    return delegate(this, 'renderTipText', text);
  },

  renderRulePanel() {
    return delegate(this, 'renderRulePanel');
  },

  renderCommandMenu(text = '', options = {}) {
    return delegate(this, 'renderCommandMenu', text, options);
  },

  renderSkillInfo(text = '') {
    return delegate(this, 'renderSkillInfo', text);
  },

  renderSkillOptions(skills = []) {
    return delegate(this, 'renderSkillOptions', skills);
  },

  renderBuilderHeader(skill, enemy = this.enemy) {
    return delegate(this, 'renderBuilderHeader', skill, enemy);
  },

  renderBuilderPreview(previewText = '?') {
    return delegate(this, 'renderBuilderPreview', previewText);
  },

  renderMainMenuView() {
    return delegate(this, 'renderMainMenuView');
  },

  renderItemMenuView(entries = []) {
    return delegate(this, 'renderItemMenuView', entries);
  },

  renderItemTargetMenuView() {
    return delegate(this, 'renderItemTargetMenuView');
  },

  addBattleLog(message) {
    return delegate(this, 'addBattleLog', message);
  },

  setButtonVisible(button, visible) {
    return delegate(this, 'setButtonVisible', button, visible);
  },

  updateHpBars() {
    return delegate(this, 'updateHpBars');
  },

  refreshBattleUI() {
    return delegate(this, 'refreshBattleUI');
  },
};

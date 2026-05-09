// Contract-only method groups for the battle presentation surface.
// These method names describe the stable scene-facing API that callers may
// depend on while the underlying presenters continue to evolve.
export const BATTLE_PRESENTATION_METHOD_GROUPS = Object.freeze({
  state: Object.freeze([
    'syncBattleStateUI',
    'showMainMenu',
    'showItemMenu',
    'showItemTargetMenu',
    'finalizeTurnReturn',
  ]),
  dialog: Object.freeze([
    'startBattleIntro',
    'normalizeDialogEntry',
    'showDialogSequence',
    'showNextDialogLine',
  ]),
  builder: Object.freeze([
    'openBuilder',
    'closeBuilder',
    'hideBuilderAfterConfirm',
    'refreshBuilderPreview',
  ]),
  menu: Object.freeze([
    'updateCommandCursor',
    'hideCommandCursor',
    'showSkillMenu',
    'hideSkillMenu',
    'updateSkillMenu',
  ]),
  hud: Object.freeze([
    'setTextNode',
    'setNodesVisible',
    'renderTextGroup',
    'setBuilderVisible',
    'setSkillMenuVisible',
    'renderResultText',
    'renderDialogLine',
    'renderTipText',
    'renderCommandMenu',
    'addBattleLog',
    'setButtonVisible',
  ]),
  status: Object.freeze([
    'renderRulePanel',
    'renderSkillInfo',
    'renderSkillOptions',
    'updateHpBars',
    'refreshStatus',
  ]),
});

export class BattlePresentationFacade {
  constructor({
    presenter = null,
    menuPresenter = null,
    dialogPresenter = null,
    builderPresenter = null,
    navigationPresenter = null,
    statusPresenter = null,
    hudPresenter = null,
  } = {}) {
    this.presenter = presenter;
    this.menuPresenter = menuPresenter;
    this.dialogPresenter = dialogPresenter;
    this.builderPresenter = builderPresenter;
    this.navigationPresenter = navigationPresenter;
    this.statusPresenter = statusPresenter;
    this.hudPresenter = hudPresenter;
  }

  static getMethodGroups() {
    return BATTLE_PRESENTATION_METHOD_GROUPS;
  }

  syncBattleStateUI(state) {
    return this.presenter?.syncBattleStateUI?.(state);
  }

  showMainMenu() {
    return this.presenter?.showMainMenu?.();
  }

  showItemMenu() {
    return this.presenter?.showItemMenu?.();
  }

  showItemTargetMenu() {
    return this.presenter?.showItemTargetMenu?.();
  }

  openMainMenu() {
    return this.navigationPresenter?.openMainMenu?.();
  }

  openSkillMenu() {
    return this.navigationPresenter?.openSkillMenu?.();
  }

  openItemMenu() {
    return this.navigationPresenter?.openItemMenu?.();
  }

  openItemTargetMenu() {
    return this.navigationPresenter?.openItemTargetMenu?.();
  }

  finalizeTurnReturn(options = {}) {
    return this.navigationPresenter?.finalizeTurnReturn?.(options);
  }

  startBattleIntro() {
    return this.dialogPresenter?.startBattleIntro?.();
  }

  normalizeDialogEntry(entry) {
    return this.dialogPresenter?.normalizeDialogEntry?.(entry);
  }

  showDialogSequence(lines, onComplete = null) {
    return this.dialogPresenter?.showDialogSequence?.(lines, onComplete);
  }

  showNextDialogLine() {
    return this.dialogPresenter?.showNextDialogLine?.();
  }

  openBuilder(actionType) {
    return this.builderPresenter?.open?.(actionType);
  }

  closeBuilder(options = {}) {
    return this.builderPresenter?.close?.(options);
  }

  hideBuilderAfterConfirm() {
    return this.builderPresenter?.hideAfterConfirm?.();
  }

  refreshBuilderPreview() {
    return this.builderPresenter?.refreshPreview?.();
  }

  updateCommandCursor() {
    return this.menuPresenter?.updateCommandCursor?.();
  }

  hideCommandCursor() {
    return this.menuPresenter?.hideCommandCursor?.();
  }

  showSkillMenu() {
    return this.menuPresenter?.showSkillMenu?.();
  }

  hideSkillMenu() {
    return this.menuPresenter?.hideSkillMenu?.();
  }

  updateSkillMenu() {
    return this.menuPresenter?.updateSkillMenu?.();
  }

  setTextNode(node, text = '') {
    return this.hudPresenter?.setTextNode?.(node, text);
  }

  setNodesVisible(nodes = [], visible = false) {
    return this.hudPresenter?.setNodesVisible?.(nodes, visible);
  }

  renderTextGroup(entries = []) {
    return this.hudPresenter?.renderTextGroup?.(entries);
  }

  setBuilderVisible(visible) {
    return this.hudPresenter?.setBuilderVisible?.(visible);
  }

  setSkillMenuVisible(visible) {
    return this.hudPresenter?.setSkillMenuVisible?.(visible);
  }

  renderResultText(text = '', phase = null, payload = {}) {
    return this.hudPresenter?.renderResultText?.(text, phase, payload);
  }

  renderDialogLine(text = '', phase = null, payload = {}) {
    return this.hudPresenter?.renderDialogLine?.(text, phase, payload);
  }

  renderTipText(text = '') {
    return this.hudPresenter?.renderTipText?.(text);
  }

  renderCommandMenu(text = '', options = {}) {
    return this.hudPresenter?.renderCommandMenu?.(text, options);
  }

  addBattleLog(messages = []) {
    return this.hudPresenter?.addBattleLog?.(messages);
  }

  setButtonVisible(button, visible) {
    return this.hudPresenter?.setButtonVisible?.(button, visible);
  }

  renderRulePanel() {
    return this.statusPresenter?.renderRulePanel?.();
  }

  renderSkillInfo(text = '') {
    return this.statusPresenter?.renderSkillInfo?.(text);
  }

  renderSkillOptions(skills = []) {
    return this.statusPresenter?.renderSkillOptions?.(skills);
  }

  updateHpBars() {
    return this.statusPresenter?.updateHpBars?.();
  }

  refreshStatus() {
    return this.statusPresenter?.refreshStatus?.();
  }
}

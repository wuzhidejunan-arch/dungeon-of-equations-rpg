const CONTINUE_INDICATOR_INSET_X = 78;
const CONTINUE_INDICATOR_INSET_Y = 50;

export class BattleHudRenderer {
  constructor(scene) {
    this.scene = scene;
  }

  setItemOptionRowsVisible(visible = false) {
    (this.scene.itemOptionTexts || []).forEach((node) => node?.setVisible?.(visible));
  }

  buildItemMenuRows(count = 0) {
    const config = this.scene.itemMenuRowConfig || {
      textX: 620,
      cursorX: 596,
      startY: 440,
      rowSpacing: 22,
    };

    return Array.from({ length: count }, (_, index) => ({
      textX: config.textX,
      cursorX: config.cursorX,
      y: config.startY + (index * config.rowSpacing),
    }));
  }

  renderSharedItemRows(entries = []) {
    const lines = Array.isArray(entries) ? entries : [];
    this.scene.itemMenuRowPositions = this.buildItemMenuRows(lines.length);

    (this.scene.itemOptionTexts || []).forEach((node, index) => {
      const row = this.scene.itemMenuRowPositions[index];
      const text = lines[index] || '';

      if (!row || !text) {
        node?.setVisible?.(false);
        node?.setText?.('');
        return;
      }

      node?.setPosition?.(row.textX, row.y);
      node?.setText?.(text);
      node?.setVisible?.(true);
    });
  }

  setCommandOptionRowsVisible(visible = false) {
    (this.scene.commandOptionTexts || []).forEach((node) => node?.setVisible?.(visible));
  }

  renderSharedCommandRows(text = '') {
    const lines = String(text || '').split('\n');
    (this.scene.commandOptionTexts || []).forEach((node, index) => {
      node?.setText?.(lines[index] || '');
      node?.setVisible?.(Boolean(lines[index]));
    });
  }

  setTextNode(node, text = '') {
    if (!node) return;
    node.setText(text || '');
  }

  setNodesVisible(nodes = [], visible = false) {
    nodes.filter(Boolean).forEach((node) => node.setVisible(visible));
  }

  renderTextGroup(entries = []) {
    entries.forEach(({ node, text = '' }) => this.setTextNode(node, text));
  }

  setButtonVisible(button, visible) {
    if (!button) return;
    button.background?.setVisible?.(visible);
    button.text?.setVisible?.(visible);
  }

  setBuilderVisible(visible) {
    const scene = this.scene;
    const isChained = scene.builderMode === 'chained';
    const showChallengeStep2Equals = visible && isChained && scene.difficultyKey !== 'challenge';
    this.setNodesVisible([
      scene.builderOverlay,
      scene.builderPanel,
      scene.builderTitleText,
      scene.builderGoalText,
      scene.equalsText,
      scene.resultPreviewText,
    ], visible);
    this.setNodesVisible([
      scene.builderStep1EqualsText,
      scene.builderStep1ResultText,
      scene.builderStep2CarryText,
    ], visible && isChained);
    this.setNodesVisible([
      scene.builderStep2EqualsText,
    ], showChallengeStep2Equals);

    Object.entries(scene.builderSlots || {}).forEach(([slotKey, slot]) => {
      const showSlot = isChained
        ? ['step1Left', 'step1Op', 'step1Right', 'step2Op', 'step2Right'].includes(slotKey)
        : ['left', 'op', 'right'].includes(slotKey);
      slot?.setVisible?.(visible && showSlot);
    });
    this.setButtonVisible(scene.confirmButton, visible);
    this.setButtonVisible(scene.clearButton, visible);
    this.setButtonVisible(scene.backButton, visible);
  }

  setSkillMenuVisible(visible) {
    const scene = this.scene;
    this.setNodesVisible([
      scene.skillCursorText,
      scene.skillInfoText,
      ...(scene.skillOptionTexts || []),
    ], visible);
  }

  renderResultText(text = '') {
    this.setTextNode(this.scene.resultText, text);
    this.setDialogContinueVisible(this.shouldShowDialogContinue());
  }

  renderTipText(text = '') {
    this.setTextNode(this.scene.tipText, text);
  }

  renderCommandMenu(text = '', options = {}) {
    const scene = this.scene;
    const fontSize = options.fontSize || '18px';
    const lineSpacing = options.lineSpacing ?? 18;
    const useSharedMainMenuRows = options.useSharedMainMenuRows === true;
    const useSharedItemMenuRows = options.useSharedItemMenuRows === true;

    if (useSharedMainMenuRows) {
      this.setItemOptionRowsVisible(false);
      scene.commandText?.setVisible?.(false);
      this.renderSharedCommandRows(text);
      return;
    }

    if (useSharedItemMenuRows) {
      this.setCommandOptionRowsVisible(false);
      scene.commandText?.setVisible?.(false);
      this.renderSharedItemRows(options.itemLines || []);
      return;
    }

    this.setCommandOptionRowsVisible(false);
    this.setItemOptionRowsVisible(false);
    scene.itemMenuRowPositions = [];
    const defaultPosition = scene.commandMenuTextPosition || { x: 642, y: 450 };
    const textX = Number.isFinite(options.textX) ? options.textX : defaultPosition.x;
    const textY = Number.isFinite(options.textY) ? options.textY : defaultPosition.y;
    scene.commandText?.setVisible?.(true);
    scene.commandText?.setPosition?.(textX, textY);
    scene.commandText?.setFontSize?.(fontSize);
    scene.commandText?.setLineSpacing?.(lineSpacing);
    this.setTextNode(scene.commandText, text);
  }

  renderDialogLine(text = '', hasNext = false) {
    this.renderResultText(text);
    this.setDialogContinueVisible(this.shouldShowDialogContinue(hasNext));
  }

  addBattleLog(messages = []) {
    this.setTextNode(this.scene.logText, messages.join('\n'));
  }

  getDialogContinuePanel() {
    const scene = this.scene;
    if (scene.combinedDialogBox?.visible) {
      return scene.combinedDialogBox;
    }

    return null;
  }

  positionDialogContinueIndicator() {
    const indicator = this.scene.dialogContinueText;
    const panel = this.getDialogContinuePanel();
    if (!indicator || !panel) return;

    const panelWidth = panel.displayWidth || panel.width || 0;
    const panelHeight = panel.displayHeight || panel.height || 0;
    indicator.setPosition(
      panel.x + (panelWidth / 2) - CONTINUE_INDICATOR_INSET_X,
      panel.y + (panelHeight / 2) - CONTINUE_INDICATOR_INSET_Y,
    );
  }

  shouldShowDialogContinue() {
    return Boolean(this.getDialogContinuePanel());
  }

  setDialogContinueVisible(visible = false) {
    if (visible) {
      this.positionDialogContinueIndicator();
    }
    this.scene.dialogContinueText?.setVisible?.(visible);
  }
}

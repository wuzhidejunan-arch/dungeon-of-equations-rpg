import { playerData } from '../../../data/playerData.js';
import { battleMenuStates } from '../../../data/battleStates.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import {
  buildBattleRulePanelText,
  getBattleText,
  getBattleUIValue,
  getBuilderHelperText,
  getChainBuilderHelperText,
  getEnemyPrimaryRule,
  getEnemyRuleSummaryText,
  getEntityUIText,
  getSkillDisplayName,
} from '../../../utils/battleSchema.js';

const ENEMY_NAME_MAX_WIDTH = 182;
const ENEMY_NAME_BASE_FONT_SIZE = 22;
const ENEMY_NAME_MIN_FONT_SIZE = 12;
const CONTINUE_INDICATOR_INSET_X = 78;
const CONTINUE_INDICATOR_INSET_Y = 50;

function setFittedEnemyName(node, text = '') {
  if (!node) return;

  node.setWordWrapWidth?.(0);
  node.setText(text || '');
  node.setFontSize?.(ENEMY_NAME_BASE_FONT_SIZE);

  let fontSize = ENEMY_NAME_BASE_FONT_SIZE;
  while (node.width > ENEMY_NAME_MAX_WIDTH && fontSize > ENEMY_NAME_MIN_FONT_SIZE) {
    fontSize -= 1;
    node.setFontSize?.(fontSize);
  }
}

function getGuidedIntermediateRuleText(scene) {
  if (!scene.isTrainingGuideBattle?.() || scene.difficultyKey !== 'intermediate') {
    return '';
  }

  return `Rule: Your answer must be ${getEnemyRuleSummaryText(scene.enemy)}.\nArmor blocks big damage. Use Armor Break first.`;
}

function getEnemyRulePanelText(scene) {
  const enemyRule = getEnemyPrimaryRule(scene.enemy);
  return getGuidedIntermediateRuleText(scene) || getEntityUIText(
    scene.enemy,
    'ruleText',
    getBattleUIValue('rulePrefix', `Rule: ${scene.getRuleShortText?.(enemyRule)}`, {
      rule: scene.getRuleShortText?.(enemyRule),
    }),
  );
}

export class BattleUiCoordinator {
  constructor({ scene } = {}) {
    this.scene = scene;
  }

  get presentation() {
    return this.scene.battlePresentation || null;
  }

  setTextNode(node, text = '') {
    if (this.presentation) {
      this.presentation.setTextNode(node, text);
      return;
    }

    if (!node) return;
    node.setText(text || '');
  }

  setNodesVisible(nodes = [], visible = false) {
    if (this.presentation) {
      this.presentation.setNodesVisible(nodes, visible);
      return;
    }

    nodes.filter(Boolean).forEach((node) => node.setVisible(visible));
  }

  renderTextGroup(entries = []) {
    if (this.presentation) {
      this.presentation.renderTextGroup(entries);
      return;
    }

    entries.forEach(({ node, text = '' }) => this.setTextNode(node, text));
  }

  clearLowerText() {
    const scene = this.scene;
    this.setTextNode(scene.resultText, '');
    this.setTextNode(scene.ruleText, '');
    this.setTextNode(scene.tipText, '');
    this.setTextNode(scene.commandText, '');
    (scene.commandOptionTexts || []).forEach((node) => this.setTextNode(node, ''));
    (scene.itemOptionTexts || []).forEach((node) => this.setTextNode(node, ''));
    this.setTextNode(scene.skillInfoText, '');
    (scene.skillOptionTexts || []).forEach((node) => this.setTextNode(node, ''));
  }

  setBuilderVisible(visible) {
    if (this.presentation) {
      this.presentation.setBuilderVisible(visible);
      return;
    }

    const scene = this.scene;
    const isChained = scene.builderMode === 'chained';
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
      scene.builderStep2EqualsText,
    ], visible && isChained);

    Object.entries(scene.builderSlots || {}).forEach(([slotKey, slot]) => {
      const showSlot = isChained
        ? ['step1Left', 'step1Op', 'step1Right', 'step2Op', 'step2Right'].includes(slotKey)
        : ['left', 'op', 'right'].includes(slotKey);
      slot.setVisible(visible && showSlot);
    });
    scene.setButtonVisible?.(scene.confirmButton, visible);
    scene.setButtonVisible?.(scene.clearButton, visible);
    scene.setButtonVisible?.(scene.backButton, visible);
  }

  setSkillMenuVisible(visible) {
    if (this.presentation) {
      this.presentation.setSkillMenuVisible(visible);
      return;
    }

    const scene = this.scene;
    this.setNodesVisible([
      scene.skillCursorText,
      scene.skillInfoText,
      ...(scene.skillOptionTexts || []),
    ], visible);
  }

  applyBattleStateUI(state = this.scene.menuState) {
    if (this.presentation) {
      this.presentation.syncBattleStateUI(state);
      return;
    }

    const scene = this.scene;
    const config = scene.getBattleStateConfig?.(state);
    if (!config) return;

    const groups = {
      messageBox: [scene.messageBox],
      rulePanelBox: [scene.rulePanelBox],
      skillListBox: [scene.skillListBox],
      skillPanelBox: [scene.skillPanelBox],
      commandBox: [scene.commandBox],
      combinedDialogBox: [scene.combinedDialogBox],
      resultText: [scene.resultText],
      ruleText: [scene.ruleText],
      tipText: [scene.tipText],
      commandText: [scene.commandText],
      commandOptionTexts: scene.commandOptionTexts || [],
      itemOptionTexts: scene.itemOptionTexts || [],
      dialogContinueText: [scene.dialogContinueText],
      skillCursorText: [scene.skillCursorText],
      skillInfoText: [scene.skillInfoText],
      skillOptionTexts: scene.skillOptionTexts || [],
      builderOverlay: [scene.builderOverlay],
      builderPanel: [scene.builderPanel],
      builderTitleText: [scene.builderTitleText],
      builderGoalText: [scene.builderGoalText],
      equalsText: [scene.equalsText],
      resultPreviewText: [scene.resultPreviewText],
    };

    this.clearLowerText();
    Object.values(groups).flat().filter(Boolean).forEach((node) => node.setVisible(false));

    (config.visiblePanels || []).forEach((key) => {
      this.setNodesVisible(groups[key] || [], true);
    });

    this.setBuilderVisible(state === battleMenuStates.BUILDER);

    if (config.cursor === 'command') {
      scene.updateCommandCursor?.();
    } else {
      scene.hideCommandCursor?.();
    }
  }

  setTurn(turn) {
    this.scene.currentTurn = turn;
    this.renderTipText('');
  }

  setResultPhase(phase = battleResultPhases.INFO, payload = {}) {
    this.scene.resultPhase = phase;
    this.scene.resultPhasePayload = payload || {};
  }

  clearResultPhase() {
    this.setResultPhase(battleResultPhases.NONE, {});
  }

  renderResultText(text = '', phase = battleResultPhases.INFO, payload = {}) {
    this.setResultPhase(phase, payload);

    if (this.presentation) {
      this.presentation.renderResultText(text, phase, payload);
      return;
    }

    this.setTextNode(this.scene.resultText, text);
    this.setDialogContinueVisible(this.shouldShowDialogContinue());
  }

  renderDialogLine(text = '', phase = battleResultPhases.INFO, payload = {}) {
    this.setResultPhase(phase, payload);

    if (this.presentation) {
      this.presentation.renderDialogLine(text, phase, payload);
      return;
    }

    const scene = this.scene;
    this.setTextNode(scene.resultText, text);
    this.setDialogContinueVisible(this.shouldShowDialogContinue((scene.dialogQueue?.length || 0) > 0));
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

  renderTipText(text = '') {
    if (this.presentation) {
      this.presentation.renderTipText(text);
      return;
    }

    this.setTextNode(this.scene.tipText, text);
  }

  renderRulePanel() {
    if (this.presentation) {
      this.presentation.renderRulePanel();
      return;
    }

    const scene = this.scene;
    this.setTextNode(scene.ruleText, buildBattleRulePanelText(scene, {
      ruleText: getEnemyRulePanelText(scene),
    }));
  }

  renderCommandMenu(text = '', options = {}) {
    if (this.presentation) {
      this.presentation.renderCommandMenu(text, options);
      return;
    }

    const scene = this.scene;
    const fontSize = options.fontSize || '18px';
    const lineSpacing = options.lineSpacing ?? 18;
    const useSharedItemMenuRows = options.useSharedItemMenuRows === true;

    if (useSharedItemMenuRows) {
      const itemLines = Array.isArray(options.itemLines) ? options.itemLines : [];
      const config = scene.itemMenuRowConfig || {
        textX: 620,
        cursorX: 596,
        startY: 440,
        rowSpacing: 22,
      };

      scene.commandText.setVisible(false);
      scene.itemMenuRowPositions = itemLines.map((_, index) => ({
        textX: config.textX,
        cursorX: config.cursorX,
        y: config.startY + (index * config.rowSpacing),
      }));

      (scene.itemOptionTexts || []).forEach((node, index) => {
        const row = scene.itemMenuRowPositions[index];
        const line = itemLines[index] || '';

        if (!row || !line) {
          node?.setVisible(false);
          node?.setText('');
          return;
        }

        node?.setPosition(row.textX, row.y);
        node?.setText(line);
        node?.setVisible(true);
      });
      return;
    }

    scene.commandText.setVisible(true);
    const defaultPosition = scene.commandMenuTextPosition || { x: 642, y: 450 };
    const textX = Number.isFinite(options.textX) ? options.textX : defaultPosition.x;
    const textY = Number.isFinite(options.textY) ? options.textY : defaultPosition.y;
    scene.commandText.setPosition(textX, textY);
    scene.commandText.setFontSize(fontSize);
    scene.commandText.setLineSpacing(lineSpacing);
    this.setTextNode(scene.commandText, text);
  }

  renderSkillInfo(text = '') {
    if (this.presentation) {
      this.presentation.renderSkillInfo(text);
      return;
    }

    this.setTextNode(this.scene.skillInfoText, text);
  }

  renderSkillOptions(skills = []) {
    if (this.presentation) {
      this.presentation.renderSkillOptions(skills);
      return;
    }

    (this.scene.skillOptionTexts || []).forEach((node, index) => {
      this.setTextNode(node, skills[index]?.displayName || skills[index]?.name || '');
    });
  }

  renderBuilderHeader(skill, enemy = this.scene.enemy) {
    if (!skill) return;

    const isChallengeChainedBuilder = this.scene.difficultyKey === 'challenge' && this.scene.builderMode === 'chained';
    const goalText = isChallengeChainedBuilder
      ? getChainBuilderHelperText()
      : getBuilderHelperText({ skill, enemy });

    this.renderTextGroup([
      { node: this.scene.builderTitleText, text: skill.name.toUpperCase() },
      {
        node: this.scene.builderGoalText,
        text: goalText,
      },
    ]);
  }

  renderBuilderPreview(previewText = '?') {
    if (previewText && typeof previewText === 'object') {
      this.setTextNode(this.scene.builderStep1ResultText, previewText.step1ResultText || '?');
      this.setTextNode(this.scene.builderStep2CarryText, previewText.step2CarryText || '?');
      this.setTextNode(this.scene.resultPreviewText, previewText.finalResultText || '?');
      return;
    }

    this.setTextNode(this.scene.builderStep1ResultText, '');
    this.setTextNode(this.scene.builderStep2CarryText, '');
    this.setTextNode(this.scene.resultPreviewText, previewText);
  }

  renderMainMenuView() {
    const scene = this.scene;
    if (this.presentation) {
      this.presentation.showMainMenu();
      return;
    }

    const commandText = scene.pendingBonusChoice
      ? getBattleText('commands.bonusMenu', 'SAFE HIT\nPOWER HIT')
      : getBattleText('commands.mainMenu', 'FIGHT\nBAG\nRUN');
    const promptText = scene.pendingBonusChoice
      ? getBattleText('prompts.bonusMenu', 'Choose your attack style.')
      : getBattleText('prompts.mainMenu', 'Choose Fight, Bag, or Run.');
    const phase = scene.pendingBonusChoice ? battleResultPhases.RESULT_BUFF : battleResultPhases.INFO;

    this.renderCommandMenu(commandText, {
      fontSize: '18px',
      lineSpacing: 18,
      useSharedMainMenuRows: true,
    });
    this.renderResultText(promptText, phase);
    this.renderRulePanel();
    this.renderTipText('');
    scene.updateCommandCursor?.();
  }

  renderItemMenuView(entries = []) {
    const scene = this.scene;
    if (this.presentation) {
      this.presentation.showItemMenu();
      return;
    }

    const compact = entries.length > 4;

    if (!entries.length) {
      this.renderCommandMenu(getBattleText('commands.emptyItemMenu', 'NO ITEM'), {
        fontSize: compact ? '14px' : '16px',
        lineSpacing: compact ? 6 : 10,
      });
      this.renderResultText(getBattleText('prompts.itemMenuEmpty', 'Bag is empty. Esc to go back.'), battleResultPhases.RESULT_ITEM);
      scene.updateCommandCursor?.();
      return;
    }

    const itemLines = entries.map((entry) => getBattleUIValue('itemLine', `${entry.definition?.shortLabel || entry.name} x${entry.qty}`, {
      name: entry.definition?.shortLabel || entry.name,
      qty: entry.qty,
    }));
    this.renderCommandMenu('', {
      fontSize: compact ? '14px' : '16px',
      lineSpacing: compact ? 6 : 10,
      useSharedItemMenuRows: true,
      itemLines,
    });
    this.renderResultText(getBattleText('prompts.itemMenu', 'Choose an item. Esc to go back.'), battleResultPhases.RESULT_ITEM);
    scene.updateCommandCursor?.();
  }

  renderItemTargetMenuView() {
    const scene = this.scene;
    if (this.presentation) {
      this.presentation.showItemTargetMenu();
      return;
    }

    this.renderCommandMenu(
      (scene.playerSkills || [])
        .map((skill) => {
          const ppText = skill.maxPp === null ? getBattleUIValue('skillUsesInfinite', 'INF') : `${skill.pp}/${skill.maxPp}`;
          const skillName = getSkillDisplayName(skill);
          return getBattleUIValue('skillTargetLine', `${skillName} ${ppText}`, { skill: skillName, uses: ppText });
        })
        .join('\n'),
      {
        fontSize: '14px',
        lineSpacing: 6,
        textX: scene.itemTargetMenuTextPosition?.x,
        textY: scene.itemTargetMenuTextPosition?.y,
      },
    );
    this.renderResultText(getBattleText('prompts.itemTargetMenu', 'Choose one skill. Esc to cancel.'), battleResultPhases.RESULT_ITEM);
    scene.updateCommandCursor?.();
  }

  addBattleLog(message) {
    const scene = this.scene;
    scene.battleLogs.push(message);
    if (scene.battleLogs.length > 3) scene.battleLogs.shift();

    if (this.presentation) {
      this.presentation.addBattleLog(scene.battleLogs);
      return;
    }

    this.setTextNode(scene.logText, scene.battleLogs.join('\n'));
  }

  setButtonVisible(button, visible) {
    if (this.presentation) {
      this.presentation.setButtonVisible(button, visible);
      return;
    }

    button.background.setVisible(visible);
    button.text.setVisible(visible);
  }

  updateHpBars() {
    if (this.presentation) {
      this.presentation.updateHpBars();
      return;
    }

    const scene = this.scene;
    const enemyRatio = Phaser.Math.Clamp(scene.enemyCurrentHp / scene.enemy.hp, 0, 1);
    const playerRatio = Phaser.Math.Clamp(playerData.hp / playerData.maxHp, 0, 1);

    scene.enemyHpBarFill.width = 220 * enemyRatio;
    scene.playerHpBarFill.width = 220 * playerRatio;
  }

  refreshBattleUI() {
    if (this.presentation) {
      this.presentation.refreshStatus();
      return;
    }

    const scene = this.scene;
    setFittedEnemyName(scene.enemyNameText, scene.enemy.name.toUpperCase());
    this.renderTextGroup([
      { node: scene.playerLevelText, text: `Lv ${playerData.level}` },
      { node: scene.enemyInfoText, text: `${scene.enemyCurrentHp}/${scene.enemy.hp}` },
      { node: scene.enemyBuffText, text: scene.getEnemyEffectSummaryText?.() || '' },
      { node: scene.playerInfoText, text: `${playerData.hp}/${playerData.maxHp}` },
      { node: scene.playerBuffText, text: scene.getPlayerEffectSummaryText?.() || scene.getBuffSummaryText?.() || '' },
    ]);
    this.renderRulePanel();
    this.renderTipText('');
    this.updateHpBars();
  }
}

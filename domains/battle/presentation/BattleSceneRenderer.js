import { battleMenuStates } from '../../../data/battleStates.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import { getBattleText, getBattleUIValue } from '../../../utils/battleSchema.js';

export class BattleSceneRenderer {
  constructor(scene) {
    this.scene = scene;
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

  setNodesVisible(nodes = [], visible = false) {
    nodes.filter(Boolean).forEach((node) => node.setVisible(visible));
  }

  setTextNode(node, text = '') {
    if (!node) return;
    node.setText(text || '');
  }

  renderTextGroup(entries = []) {
    entries.forEach(({ node, text = '' }) => this.setTextNode(node, text));
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
      slot.setVisible(visible && showSlot);
    });
    scene.setButtonVisible?.(scene.confirmButton, visible);
    scene.setButtonVisible?.(scene.clearButton, visible);
    scene.setButtonVisible?.(scene.backButton, visible);
  }

  setSkillMenuVisible(visible) {
    const scene = this.scene;
    this.setNodesVisible([
      scene.skillCursorText,
      scene.skillInfoText,
      ...(scene.skillOptionTexts || []),
    ], visible);
  }

  applyBattleStateUI(state = this.scene.menuState) {
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

  updateHpBars(viewState) {
    const scene = this.scene;
    scene.enemyHpBarFill.width = 220 * (viewState?.hp?.enemy?.ratio || 0);
    scene.playerHpBarFill.width = 220 * (viewState?.hp?.player?.ratio || 0);
  }

  refreshStatus(viewState) {
    const scene = this.scene;
    this.renderTextGroup([
      { node: scene.enemyNameText, text: viewState?.texts?.enemyName || '' },
      { node: scene.playerLevelText, text: viewState?.texts?.playerLevel || '' },
      { node: scene.enemyInfoText, text: viewState?.hp?.enemy?.label || '' },
      { node: scene.enemyBuffText, text: viewState?.texts?.enemyBuff || '' },
      { node: scene.playerInfoText, text: viewState?.hp?.player?.label || '' },
      { node: scene.playerBuffText, text: viewState?.texts?.playerBuff || '' },
      { node: scene.ruleText, text: viewState?.texts?.rulePanel || '' },
    ]);
    scene.renderTipText?.('');
    this.updateHpBars(viewState);
  }

  renderMainMenu(viewState) {
    const scene = this.scene;
    this.clearLowerText();
    scene.renderCommandMenu?.(viewState?.texts?.commandText || '', {
      fontSize: '18px',
      lineSpacing: 18,
      useSharedMainMenuRows: true,
    });
    scene.renderResultText?.(viewState?.texts?.promptText || '', viewState?.resultPhase || battleResultPhases.INFO);
    this.setTextNode(scene.ruleText, viewState?.texts?.rulePanel || '');
    scene.renderTipText?.('');
    scene.applyMediumChallengeCommandLowerPanelLayout?.();
    scene.updateCommandCursor?.();
  }

  renderItemMenu(entries = []) {
    const scene = this.scene;
    const compact = entries.length > 4;
    this.clearLowerText();

    if (!entries.length) {
      scene.renderCommandMenu?.(getBattleText('commands.emptyItemMenu', 'NO ITEM'), {
        fontSize: compact ? '14px' : '16px',
        lineSpacing: compact ? 6 : 10,
      });
      scene.renderResultText?.(getBattleText('prompts.itemMenuEmpty', 'Bag is empty. Esc to go back.'), battleResultPhases.RESULT_ITEM);
      scene.updateCommandCursor?.();
      return;
    }

    const itemLines = entries.map((entry) => getBattleUIValue('itemLine', `${entry.definition?.shortLabel || entry.name} x${entry.qty}`, {
      name: entry.definition?.shortLabel || entry.name,
      qty: entry.qty,
    }));
    scene.renderCommandMenu?.('', {
      fontSize: compact ? '14px' : '16px',
      lineSpacing: compact ? 6 : 10,
      useSharedItemMenuRows: true,
      itemLines,
    });
    scene.renderResultText?.(getBattleText('prompts.itemMenu', 'Choose an item. Esc to go back.'), battleResultPhases.RESULT_ITEM);
    scene.updateCommandCursor?.();
  }

  renderItemTargetMenu(skillTargets = []) {
    const scene = this.scene;
    this.clearLowerText();
    scene.renderCommandMenu?.(
      skillTargets.map((skill) => getBattleUIValue('skillTargetLine', `${skill.name} ${skill.uses}`, {
        skill: skill.name,
        uses: skill.uses,
      })).join('\n'),
      {
        fontSize: '14px',
        lineSpacing: 6,
        textX: scene.itemTargetMenuTextPosition?.x,
        textY: scene.itemTargetMenuTextPosition?.y,
      },
    );
    scene.renderResultText?.(getBattleText('prompts.itemTargetMenu', 'Choose one skill. Esc to cancel.'), battleResultPhases.RESULT_ITEM);
    scene.updateCommandCursor?.();
  }
}

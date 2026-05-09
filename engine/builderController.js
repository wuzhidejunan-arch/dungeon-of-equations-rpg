import { battleMenuStates } from '../data/battleStates.js';
import { battleResultPhases } from '../data/battlePhases.js';
import { formatBattleTemplate, getBattleText, getBattleUIText } from '../utils/battleSchema.js';
import { getSkillUnavailableReason, isSkillUsable } from '../utils/playerSkills.js';
import { getTutorialBackRestriction, formatTutorialTemplate, validateTutorialBuilderAction } from './tutorialFlowController.js';
import { battleBuilderModes } from '../config/battleBuilderModes.js';
import {
  difficultyBypassesBuilderForUtilitySkills,
  getDifficultyOperatorGlyphSet,
} from '../config/difficultySettings.js';

function usesModernOperatorGlyphs(scene) {
  return getDifficultyOperatorGlyphSet(scene?.difficultyKey) === 'modern';
}

function getChallengeOperatorGlyph(value) {
  if (value === '?' || value === '*' || value === '×') {
    return '\u00d7';
  }

  if (value === '/' || value === '繩' || value === '÷') {
    return '\u00f7';
  }

  if (value === '-') {
    return '\u2212';
  }

  if (value === '+') {
    return '+';
  }

  return null;
}

function getChallengeResultOperatorText(scene, value) {
  if (!isChainedBuilder(scene)) {
    return null;
  }

  return getChallengeOperatorGlyph(value) || `${value}`;
}

function getDisplayOperatorText(scene, value, cardType = '') {
  if (isChainedBuilder(scene)) {
    return getChallengeOperatorGlyph(value) || `${value}`;
  }

  if (usesModernOperatorGlyphs(scene)) {
    if (value === '?' || value === '*') {
      return '×';
    }

    if (value === '/' || value === '÷' || value === '繩') {
      return '÷';
    }
  }

  return `${value}`;
}

function getDisplayCardTextForScene(scene, cardType, value) {
  return getDisplayOperatorText(scene, value, cardType);
}

function formatDisplayExpression(scene, left, operator, right, result) {
  const challengeOperator = getChallengeResultOperatorText(scene, operator);
  return `${left} ${challengeOperator || getDisplayOperatorText(scene, operator)} ${right} = ${result}`;
}

function setPanelBounds(panel, x, y, width, height) {
  if (!panel) return;
  panel.setPosition?.(x, y);
  panel.setSize?.(width, height);
  panel.setDisplaySize?.(width, height);
}

export function applyBuilderLayout(scene) {
  if (isChainedBuilder(scene)) {
    setPanelBounds(scene.builderPanel, 400, 342, 676, 424);
    scene.builderTitleText?.setPosition?.(188, 166);
    scene.builderGoalText?.setPosition?.(188, 200);
    scene.builderFeedbackText?.setPosition?.(188, 236);
    scene.builderSlots.step1Left?.setPosition?.(294, 362);
    scene.builderSlots.step1Op?.setPosition?.(370, 362);
    scene.builderSlots.step1Right?.setPosition?.(446, 362);
    scene.builderSlots.step2Op?.setPosition?.(370, 434);
    scene.builderSlots.step2Right?.setPosition?.(446, 434);
    scene.builderStep1EqualsText?.setPosition?.(526, 362);
    scene.builderStep1ResultText?.setPosition?.(570, 362);
    scene.builderStep2CarryText?.setPosition?.(294, 434);
    scene.builderStep2EqualsText?.setPosition?.(526, 434);
    scene.equalsText?.setPosition?.(526, 434);
    scene.resultPreviewText?.setPosition?.(570, 434);
    scene.backButton?.background?.setPosition?.(314, 542);
    scene.backButton?.text?.setPosition?.(314, 542);
    scene.clearButton?.background?.setPosition?.(440, 542);
    scene.clearButton?.text?.setPosition?.(440, 542);
    scene.confirmButton?.background?.setPosition?.(566, 542);
    scene.confirmButton?.text?.setPosition?.(566, 542);
    return;
  }

  setPanelBounds(scene.builderPanel, 400, 320, 500, 290);
  scene.builderTitleText?.setPosition?.(260, 190);
  scene.builderGoalText?.setPosition?.(260, 228);
  scene.builderFeedbackText?.setPosition?.(260, 268);
  scene.builderSlots.step1Left?.setPosition?.(272, 336);
  scene.builderSlots.step1Op?.setPosition?.(340, 336);
  scene.builderSlots.step1Right?.setPosition?.(408, 336);
  scene.builderSlots.step2Op?.setPosition?.(340, 408);
  scene.builderSlots.step2Right?.setPosition?.(408, 408);
  scene.builderStep1EqualsText?.setPosition?.(474, 336);
  scene.builderStep1ResultText?.setPosition?.(516, 336);
  scene.builderStep2CarryText?.setPosition?.(272, 408);
  scene.builderStep2EqualsText?.setPosition?.(474, 408);
  scene.backButton?.background?.setPosition?.(315, 470);
  scene.backButton?.text?.setPosition?.(315, 470);
  scene.clearButton?.background?.setPosition?.(425, 470);
  scene.clearButton?.text?.setPosition?.(425, 470);
  scene.confirmButton?.background?.setPosition?.(530, 470);
  scene.confirmButton?.text?.setPosition?.(530, 470);
  scene.equalsText?.setPosition?.(550, 372);
  scene.resultPreviewText?.setPosition?.(594, 372);
}

function isChainedBuilder(scene) {
  return scene.builderMode === battleBuilderModes.CHAINED;
}

function getStep1Operators(scene) {
  const allowed = Array.isArray(scene.availableOperators) ? scene.availableOperators : ['?', '/', '+', '-'];
  return allowed.filter((operator) => operator === '?' || operator === '/' || operator === '+' || operator === '-');
}

function getStep2Operators(scene) {
  const allowed = Array.isArray(scene.availableOperators) ? scene.availableOperators : ['?', '/', '+', '-'];
  return allowed.filter((operator) => operator === '?' || operator === '/' || operator === '+' || operator === '-');
}

function getNextPreferredSlot(scene, card) {
  if (!isChainedBuilder(scene)) {
    if (card.cardType === 'operator') {
      return scene.builderSlots.op;
    }

    return !scene.builderSlots.left.assignedCard
      ? scene.builderSlots.left
      : !scene.builderSlots.right.assignedCard
        ? scene.builderSlots.right
        : null;
  }

  if (card.cardType === 'operator') {
    return !scene.builderSlots.step1Op.assignedCard
      ? scene.builderSlots.step1Op
      : !scene.builderSlots.step2Op.assignedCard
        ? scene.builderSlots.step2Op
        : null;
  }

  return !scene.builderSlots.step1Left.assignedCard
    ? scene.builderSlots.step1Left
    : !scene.builderSlots.step1Right.assignedCard
      ? scene.builderSlots.step1Right
      : !scene.builderSlots.step2Right.assignedCard
        ? scene.builderSlots.step2Right
        : null;
}

function getVisibleSlotKeys(scene) {
  return isChainedBuilder(scene)
    ? ['step1Left', 'step1Op', 'step1Right', 'step2Op', 'step2Right']
    : ['left', 'op', 'right'];
}

function isChallengeNormalAttackSkill(skill) {
  if (!skill) return false;
  if (skill.id === 'challengeHeavyAttack' || skill.id === 'heavyStrike' || skill.name === 'Heavy Attack' || skill.name === 'Heavy Strike') {
    return false;
  }
  return skill.category === 'attack';
}

function isChallengeHeavyAttackSkill(skill) {
  if (!skill) return false;
  return skill.id === 'challengeHeavyAttack' || skill.name === 'Heavy Attack';
}

function isChallengeUtilitySkill(skill) {
  if (!skill) return false;
  return skill.category === 'guard' || skill.category === 'buff';
}

export function shouldChallengeSkillBypassBuilder(scene, skill) {
  return difficultyBypassesBuilderForUtilitySkills(scene?.difficultyKey) && isChallengeUtilitySkill(skill);
}

function formatChallengeFeedback(lines = []) {
  const joined = Array.isArray(lines) ? lines.filter(Boolean).join('\n') : String(lines || '');
  return joined
    .replace('Challenge chain failed: ', '')
    .replace('Challenge attack missed: ', '')
    .replace('Challenge attack ready: ', '')
    .replace('Challenge chain is valid.', 'Chain valid.')
    .replace('Challenge final result matches the enemy rule:', 'Final answer matches rule:')
    .replace('Challenge final result does not match the enemy rule:', 'Final answer misses rule:')
    .replace('Step 1 is not calculated correctly.', 'Step 1 math is wrong.')
    .replace('Step 1 result is not being carried into step 2 correctly.', 'Carry into step 2 is wrong.')
    .replace('Step 2 is not calculated correctly.', 'Step 2 math is wrong.');
}

function renderChallengeBuilderFeedback(scene, lines = []) {
  const message = formatChallengeFeedback(lines);
  scene.builderFeedbackText?.setText?.(message);
  scene.builderFeedbackText?.setVisible?.(Boolean(message));
}

function showBuilderValidationFeedback(scene, message = '') {
  scene.builderFeedbackText?.setText?.(message);
  scene.builderFeedbackText?.setVisible?.(Boolean(message));
}

function commitChallengeFailedSkill(scene, skill, message) {
  if (!skill) return;

  if (!isSkillUsable(skill)) {
    scene.renderResultText(getSkillUnavailableReason(skill), battleResultPhases.INFO);
    return;
  }

  hideBuilderAfterConfirm(scene);
  scene.spendSkillUse?.(skill);
  scene.refreshBattleUI?.();
  scene.selectedSkill = null;
  scene.selectedSkillIndex = 0;
  scene.selectedAction = null;
  scene.playEnemyTurnSequence?.([
    `You used ${skill.name}.`,
    message,
    `${skill.name} failed.`,
  ]);
}

function commitChallengeUtilitySkill(scene, skill) {
  if (!skill) return;

  if (!isSkillUsable(skill)) {
    scene.renderResultText(getSkillUnavailableReason(skill), battleResultPhases.INFO);
    return;
  }

  hideBuilderAfterConfirm(scene);
  scene.spendSkillUse?.(skill);
  const effectResult = scene.applySkillRuleEffects?.(skill, {
    result: null,
    enemy: scene.enemy,
    skill,
    operationType: null,
  }) || { messages: [] };
  scene.refreshBattleUI?.();
  scene.selectedSkill = null;
  scene.selectedSkillIndex = 0;
  scene.selectedAction = null;
  scene.playEnemyTurnSequence?.([
    `You used ${skill.name}.`,
    skill.ui?.textTemplates?.success?.replace('{skill}', skill.name) || `${skill.name} works.`,
    ...(effectResult.messages || []),
  ]);
}

export function activateChallengeUtilitySkill(scene, skill) {
  if (!shouldChallengeSkillBypassBuilder(scene, skill)) {
    return false;
  }

  scene.hideSkillMenuUI?.();
  scene.hideCommandCursor?.();
  scene.builderActive = false;
  scene.selectedAction = 'attack';
  commitChallengeUtilitySkill(scene, skill);
  return true;
}

function createSlot(scene, x, y, width, height, slotType) {
  const rect = scene.add
    .rectangle(x, y, width, height, 0xffffff, 1)
    .setStrokeStyle(3, 0x1a1a1a)
    .setDepth(302)
    .setVisible(false);

  rect.slotType = slotType;
  rect.assignedCard = null;
  return rect;
}

function createActionButton(scene, x, y, width, height, label, onClick) {
  const background = scene.add
    .rectangle(x, y, width, height, 0xffffff, 1)
    .setStrokeStyle(3, 0x1a1a1a)
    .setDepth(302)
    .setVisible(false)
    .setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(x, y, label, {
      fontSize: '18px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(303)
    .setVisible(false);

  background.on('pointerup', onClick);

  return { background, text };
}

function createDraggableCard(scene, x, y, width, height, textValue, color, cardType, value) {
  const card = scene.add
    .rectangle(x, y, width, height, color, 1)
    .setStrokeStyle(3, 0x1a1a1a)
    .setDepth(305)
    .setVisible(true)
    .setInteractive({ draggable: true, useHandCursor: true });

  const label = scene.add
    .text(x, y, getDisplayCardTextForScene(scene, cardType, textValue), {
      fontSize: '22px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(306)
    .setVisible(true);

  card.label = label;
  card.cardType = cardType;
  card.value = value;
  card.homeX = x;
  card.homeY = y;
  card.assignedSlot = null;

  scene.input.setDraggable(card);

  card.on('pointerup', () => {
    if (!scene.builderActive) return;
    if (!card.assignedSlot) {
      const preferredSlot = getNextPreferredSlot(scene, card);

      if (preferredSlot) {
        assignCardToSlot(scene, card, preferredSlot);
      }
    }
  });

  return card;
}

export function createBuilderUI(scene) {
  scene.builderOverlay = scene.add
    .rectangle(400, 300, 800, 600, 0x000000, 0.14)
    .setDepth(298)
    .setVisible(false);

  scene.builderPanel = scene.add
    .rectangle(400, 320, 500, 290, 0xffffff)
    .setStrokeStyle(4, 0x1a1a1a)
    .setDepth(300)
    .setVisible(false);

  scene.builderTitleText = scene.add
    .text(260, 190, getBattleUIText('builder.title', 'Build'), {
      fontSize: '20px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setDepth(302)
    .setVisible(false);

  scene.builderGoalText = scene.add
    .text(260, 228, '', {
      fontSize: '14px',
      color: '#333333',
      wordWrap: { width: 360 },
    })
    .setDepth(302)
    .setVisible(false);

  scene.builderFeedbackText = scene.add
    .text(260, 268, '', {
      fontSize: '13px',
      color: '#1a1a1a',
      wordWrap: { width: 360 },
      lineSpacing: 4,
    })
    .setDepth(302)
    .setVisible(false);

  scene.cardsLabelText = null;

  scene.builderSlots = {
    left: createSlot(scene, 308, 372, 60, 46, 'number'),
    op: createSlot(scene, 392, 372, 60, 46, 'operator'),
    right: createSlot(scene, 476, 372, 60, 46, 'number'),
    step1Left: createSlot(scene, 272, 336, 56, 44, 'number'),
    step1Op: createSlot(scene, 340, 336, 56, 44, 'operator'),
    step1Right: createSlot(scene, 408, 336, 56, 44, 'number'),
    step2Op: createSlot(scene, 340, 408, 56, 44, 'operator'),
    step2Right: createSlot(scene, 408, 408, 56, 44, 'number'),
  };

  scene.builderStep1EqualsText = scene.add
    .text(474, 336, '=', {
      fontSize: '28px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.builderStep1ResultText = scene.add
    .text(516, 336, '?', {
      fontSize: '24px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.builderStep2CarryText = scene.add
    .text(272, 408, '?', {
      fontSize: '24px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.builderStep2EqualsText = scene.add
    .text(474, 408, '=', {
      fontSize: '28px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.equalsText = scene.add
    .text(550, 372, '=', {
      fontSize: '34px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.resultPreviewText = scene.add
    .text(594, 372, '?', {
      fontSize: '26px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.propertyPreviewText = null;

  scene.backButton = createActionButton(scene, 315, 470, 88, 40, getBattleText('builder.backButton', 'Back'), () => scene.returnToSkillMenu());
  scene.clearButton = createActionButton(scene, 425, 470, 96, 40, getBattleText('builder.clearButton', 'Clear'), () => scene.clearBuilderSlots());
  scene.confirmButton = createActionButton(scene, 530, 470, 88, 40, getBattleText('builder.okButton', 'OK'), () => scene.confirmBuilderAction());

  scene.builderHintText = null;
}

export function registerBuilderDragHandlers(scene) {
  cleanupBuilderDragHandlers(scene);

  const dragstart = (_, gameObject) => {
    if (!scene.builderActive) return;
    gameObject.setDepth(330);
  };

  const drag = (_, gameObject, dragX, dragY) => {
    if (!scene.builderActive) return;
    gameObject.x = dragX;
    gameObject.y = dragY;
    gameObject.label.x = dragX;
    gameObject.label.y = dragY;
  };

  const dragend = (pointer, gameObject) => {
    if (!scene.builderActive) return;
    tryPlaceCardInSlot(scene, pointer, gameObject);
    gameObject.setDepth(305);
  };

  scene.__builderDragHandlers = { dragstart, drag, dragend };
  scene.input.on('dragstart', dragstart);
  scene.input.on('drag', drag);
  scene.input.on('dragend', dragend);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => cleanupBuilderDragHandlers(scene));
  scene.events.once(Phaser.Scenes.Events.DESTROY, () => cleanupBuilderDragHandlers(scene));
}

export function cleanupBuilderDragHandlers(scene) {
  const handlers = scene.__builderDragHandlers;
  if (!handlers) return;
  scene.input.off('dragstart', handlers.dragstart);
  scene.input.off('drag', handlers.drag);
  scene.input.off('dragend', handlers.dragend);
  scene.__builderDragHandlers = null;
}

export function handleBuilderInput(scene) {
  if (scene.isConfirmPressed()) {
    scene.confirmBuilderAction();
    return;
  }

  if (scene.isClearPressed()) {
    scene.clearBuilderSlots();
    return;
  }

  if (scene.isBackPressed()) {
    const rule = getTutorialBackRestriction(scene, 'builder');
    if (!rule.allowed) {
      scene.renderResultText(rule.message, battleResultPhases.INFO);
      return;
    }
    scene.returnToSkillMenu();
  }
}

export function openBuilder(scene, actionType) {
  scene.selectedAction = actionType;
  scene.hideSkillMenuUI();
  scene.hideCommandCursor();
  scene.builderActive = true;
  scene.setBattleMenuState(battleMenuStates.BUILDER);
  scene.turnNumbers = scene.generateTurnNumbers();

  const chosenSkill = scene.selectedSkill || scene.playerSkills[0];

  resetBuilderSlots(scene, true);
  clearBuilderCards(scene);
  createBuilderCards(scene);
  clearBuilderSlots(scene);

  scene.renderBuilderHeader(chosenSkill, scene.enemy);
  scene.renderTipText('');
  if (isChainedBuilder(scene)) {
    setPanelBounds(scene.builderPanel, 400, 350, 720, 480);
    scene.builderTitleText?.setPosition?.(165, 154);
    scene.builderGoalText?.setPosition?.(165, 192);
    scene.builderFeedbackText?.setPosition?.(165, 232);
    scene.builderSlots.step1Left?.setPosition?.(296, 372);
    scene.builderSlots.step1Op?.setPosition?.(378, 372);
    scene.builderSlots.step1Right?.setPosition?.(460, 372);
    scene.builderSlots.step2Op?.setPosition?.(378, 458);
    scene.builderSlots.step2Right?.setPosition?.(460, 458);
    scene.builderStep1EqualsText?.setPosition?.(548, 372);
    scene.builderStep1ResultText?.setPosition?.(594, 372);
    scene.builderStep2CarryText?.setPosition?.(296, 458);
    scene.builderStep2EqualsText?.setPosition?.(548, 458);
    scene.equalsText?.setPosition?.(594, 415);
    scene.resultPreviewText?.setPosition?.(642, 415);
    scene.backButton?.background?.setPosition?.(300, 570);
    scene.backButton?.text?.setPosition?.(300, 570);
    scene.clearButton?.background?.setPosition?.(440, 570);
    scene.clearButton?.text?.setPosition?.(440, 570);
    scene.confirmButton?.background?.setPosition?.(580, 570);
    scene.confirmButton?.text?.setPosition?.(580, 570);
    scene.builderTitleText?.setText?.(`${chosenSkill.name.toUpperCase()} - CHAIN`);
    scene.builderGoalText?.setText?.('Guide: Step 1 uses × or ÷. Step 2 uses the carry with + or -.');
    scene.builderFeedbackText?.setText?.('');
    scene.builderFeedbackText?.setVisible?.(false);
  } else {
    scene.builderPanel?.setPosition?.(400, 320);
    scene.builderPanel?.setSize?.(500, 290);
    scene.builderTitleText?.setPosition?.(260, 190);
    scene.builderGoalText?.setPosition?.(260, 228);
    scene.builderFeedbackText?.setPosition?.(260, 268);
    scene.builderSlots.step1Left?.setPosition?.(272, 336);
    scene.builderSlots.step1Op?.setPosition?.(340, 336);
    scene.builderSlots.step1Right?.setPosition?.(408, 336);
    scene.builderSlots.step2Op?.setPosition?.(340, 408);
    scene.builderSlots.step2Right?.setPosition?.(408, 408);
    scene.builderStep1EqualsText?.setPosition?.(474, 336);
    scene.builderStep1ResultText?.setPosition?.(516, 336);
    scene.builderStep2CarryText?.setPosition?.(272, 408);
    scene.builderStep2EqualsText?.setPosition?.(474, 408);
    scene.backButton?.background?.setPosition?.(315, 470);
    scene.backButton?.text?.setPosition?.(315, 470);
    scene.clearButton?.background?.setPosition?.(425, 470);
    scene.clearButton?.text?.setPosition?.(425, 470);
    scene.confirmButton?.background?.setPosition?.(530, 470);
    scene.confirmButton?.text?.setPosition?.(530, 470);
    scene.equalsText?.setPosition?.(550, 372);
    scene.resultPreviewText?.setPosition?.(594, 372);
    scene.builderFeedbackText?.setText?.('');
    scene.builderFeedbackText?.setVisible?.(false);
  }

  if (isChainedBuilder(scene)) {
    scene.builderGoalText?.setText?.('Guide: Step 1 uses × or ÷. Step 2 uses the carry with + or -.');
  }

  if (isChainedBuilder(scene) && scene.difficultyKey === 'challenge') {
    scene.builderGoalText?.setText?.('Chain: use the Row 1 answer in Row 2.\nOnly the last answer counts.');
  }

  scene.renderResultText(
    formatBattleTemplate(getBattleUIText('prompts.builderStart', '{skill}! Make the right answer.'), { skill: chosenSkill.name }),
    battleResultPhases.INFO,
    { skill: chosenSkill.name },
  );
  scene.addBattleLog(getBattleText('logs.builderOpened', `Player opened ${actionType} builder.`, { action: actionType }));
}

export function closeBuilder(scene, resetAction = true) {
  scene.builderActive = false;
  scene.setBattleMenuState(battleMenuStates.MAIN);
  if (resetAction) {
    scene.selectedAction = null;
  }

  scene.builderFeedbackText?.setText?.('');
  scene.builderFeedbackText?.setVisible?.(false);
  resetBuilderSlots(scene, false);
  clearBuilderCards(scene);
  scene.showMainMenu();
  scene.refreshPreview();
}

export function hideBuilderAfterConfirm(scene) {
  scene.builderActive = false;
  scene.builderFeedbackText?.setText?.('');
  scene.builderFeedbackText?.setVisible?.(false);
  resetBuilderSlots(scene, false);
  clearBuilderCards(scene);
  scene.setBuilderVisible(false);
  scene.refreshPreview();
}

export function resetBuilderSlots(scene, visible = false) {
  const visibleSlotKeys = new Set(getVisibleSlotKeys(scene));
  Object.entries(scene.builderSlots || {}).forEach(([slotKey, slot]) => {
    slot.assignedCard = null;
    slot.setVisible(visible && visibleSlotKeys.has(slotKey));
  });
}

export function clearBuilderCards(scene) {
  scene.builderCards.forEach((card) => {
    card.destroy();
    card.label.destroy();
  });
  scene.builderCards = [];
  scene.dragObjects = [];
}

export function createBuilderCards(scene) {
  if (isChainedBuilder(scene)) {
    const numberX = 170;
    const numberStartY = 318;
    const numberGap = 58;
    const operatorX = 635;
    const operatorGap = 48;
    const operatorStartY = 292;

    scene.turnNumbers.forEach((value, index) => {
      const card = createDraggableCard(scene, numberX, numberStartY + index * numberGap, 44, 44, `${value}`, 0xffffff, 'number', value);
      scene.builderCards.push(card);
    });

    getStep1Operators(scene).forEach((value, index) => {
      const card = createDraggableCard(scene, operatorX, operatorStartY + (index * operatorGap), 44, 44, value, 0xffffff, 'operator', value);
      scene.builderCards.push(card);
    });
    return;
  }

  const numberY = 314;
  const operatorY = 314;
  const numberStartX = 290;
  const numberGap = 56;
  const operatorStartX = 515;
  const operatorGap = 58;

  scene.turnNumbers.forEach((value, index) => {
    const card = createDraggableCard(scene, numberStartX + index * numberGap, numberY, 44, 44, `${value}`, 0xffffff, 'number', value);
    scene.builderCards.push(card);
  });

  scene.availableOperators.forEach((value, index) => {
    const card = createDraggableCard(scene, operatorStartX + index * operatorGap, operatorY, 44, 44, value, 0xffffff, 'operator', value);
    scene.builderCards.push(card);
  });
}

export function tryPlaceCardInSlot(scene, pointer, card) {
  const slot = Object.values(scene.builderSlots).find((candidate) => {
    const bounds = candidate.getBounds();
    return bounds.contains(pointer.x, pointer.y) && candidate.slotType === card.cardType;
  });

  if (slot) {
    assignCardToSlot(scene, card, slot);
  } else {
    resetCardPosition(scene, card);
  }
}

export function assignCardToSlot(scene, card, slot) {
  if (card.assignedSlot === slot) {
    card.x = slot.x;
    card.y = slot.y;
    card.label.x = slot.x;
    card.label.y = slot.y;
    scene.refreshPreview();
    return;
  }

  if (card.assignedSlot) {
    card.assignedSlot.assignedCard = null;
  }

  if (slot.assignedCard) {
    resetCardPosition(scene, slot.assignedCard);
  }

  slot.assignedCard = card;
  card.assignedSlot = slot;
  card.x = slot.x;
  card.y = slot.y;
  card.label.x = slot.x;
  card.label.y = slot.y;

  scene.refreshPreview();
}

export function resetCardPosition(scene, card) {
  if (card.assignedSlot) {
    card.assignedSlot.assignedCard = null;
    card.assignedSlot = null;
  }

  card.x = card.homeX;
  card.y = card.homeY;
  card.label.x = card.homeX;
  card.label.y = card.homeY;
  scene.refreshPreview();
}

export function clearBuilderSlots(scene) {
  scene.builderCards.forEach((card) => resetCardPosition(scene, card));
  scene.refreshPreview();
}

export function returnToSkillMenu(scene) {
  closeBuilder(scene, false);
  scene.setBattleMenuState(battleMenuStates.SKILL);
  scene.showCombinedBox(false);
  scene.renderResultText(getBattleText('prompts.skillMenu', 'Choose a skill.'), battleResultPhases.INFO);
  scene.showSkillMenuUI();
  scene.updateSkillMenuUI();
}

export function refreshBuilderPreview(scene) {
  if (isChainedBuilder(scene)) {
    const step1LeftCard = scene.builderSlots.step1Left.assignedCard;
    const step1OpCard = scene.builderSlots.step1Op.assignedCard;
    const step1RightCard = scene.builderSlots.step1Right.assignedCard;

    scene.renderBuilderPreview({
      step1ResultText: '?',
      step2CarryText: '?',
      finalResultText: '?',
    });

    if (!scene.builderActive) {
      return null;
    }

    if (!step1LeftCard || !step1OpCard || !step1RightCard) {
      return null;
    }
    return null;
  }

  const leftCard = scene.builderSlots.left.assignedCard;
  const opCard = scene.builderSlots.op.assignedCard;
  const rightCard = scene.builderSlots.right.assignedCard;

  scene.renderBuilderPreview('?');

  if (!scene.builderActive) {
    return null;
  }

  if (!leftCard || !opCard || !rightCard) {
    return null;
  }

  scene.calculateExpression(leftCard.value, opCard.value, rightCard.value);
  return null;
}

export function confirmBuilderAction(scene) {
  if (isChainedBuilder(scene)) {
    const selectedSkill = scene.selectedSkill || scene.playerSkills?.[0];

    if (isChallengeUtilitySkill(selectedSkill)) {
      commitChallengeUtilitySkill(scene, selectedSkill);
      return;
    }

    const step1LeftCard = scene.builderSlots.step1Left.assignedCard;
    const step1OpCard = scene.builderSlots.step1Op.assignedCard;
    const step1RightCard = scene.builderSlots.step1Right.assignedCard;
    const step2OpCard = scene.builderSlots.step2Op.assignedCard;
    const step2RightCard = scene.builderSlots.step2Right.assignedCard;

    if (!step1LeftCard || !step1OpCard || !step1RightCard || !step2OpCard || !step2RightCard) {
      scene.renderResultText('Fill both Challenge steps first.', battleResultPhases.INFO);
      return;
    }

    const outcome = scene.resolveChainedAttackOutcome({
      step1Left: step1LeftCard.value,
      step1Operator: step1OpCard.value,
      step1Right: step1RightCard.value,
      step2Operator: step2OpCard.value,
      step2Right: step2RightCard.value,
      displayedStep1Result: scene.builderStep1ResultText?.text === '?' ? null : Number(scene.builderStep1ResultText?.text),
      displayedCarryResult: scene.builderStep2CarryText?.text === '?' ? null : Number(scene.builderStep2CarryText?.text),
    });

    if (Number(outcome.values?.finalResult) < 0) {
      showBuilderValidationFeedback(scene, 'Use a final answer of 0 or more.');
      return;
    }
    
    if (!outcome.success && outcome.outcome === 'chain_invalid') {
      commitChallengeFailedSkill(scene, selectedSkill, outcome.message);
      return;
    }

    if (isChallengeHeavyAttackSkill(selectedSkill) && Number(outcome.values?.finalResult) <= 10) {
      commitChallengeFailedSkill(scene, selectedSkill, 'Heavy Attack needs a final answer greater than 10.');
      return;
    }

    const committedStep1Expression = formatDisplayExpression(
      scene,
      step1LeftCard.value,
      step1OpCard.value,
      step1RightCard.value,
      outcome.values.step1Result,
    );
    const committedStep2Expression = formatDisplayExpression(
      scene,
      outcome.values.carriedResult,
      step2OpCard.value,
      step2RightCard.value,
      outcome.values.finalResult,
    );
    const committedChainedExpression = `${committedStep1Expression}\n${committedStep2Expression}`;

    hideBuilderAfterConfirm(scene);
    scene.resolveAttack(outcome.values.finalResult, committedChainedExpression, step2OpCard.value);
    return;
  }

  const leftCard = scene.builderSlots.left.assignedCard;
  const opCard = scene.builderSlots.op.assignedCard;
  const rightCard = scene.builderSlots.right.assignedCard;

  if (!leftCard || !opCard || !rightCard) {
    scene.renderResultText(formatTutorialTemplate(scene, 'incompleteBuilder', { rule: scene.getTrainingRequiredRuleLabel?.() || 'even' }, 'Fill all 3 slots first.'), battleResultPhases.INFO);
    return;
  }

  const result = scene.calculateExpression(leftCard.value, opCard.value, rightCard.value);

  if (result === null || Number.isNaN(result)) {
    const operatorLabel = usesModernOperatorGlyphs(scene) ? '÷' : '/';
    scene.renderResultText(`That ${operatorLabel} answer is not valid. Use exact division only.`, battleResultPhases.INFO);
    return;
  }

  if (scene.difficultyKey === 'beginner' && result < 0) {
    showBuilderValidationFeedback(scene, 'Use an answer of 0 or more.');
    return;
  }

  const expression = `${leftCard.value} ${opCard.value} ${rightCard.value} = ${result}`;
  const displayExpression = formatDisplayExpression(scene, leftCard.value, opCard.value, rightCard.value, result);
  const actionType = scene.selectedAction;

  if (actionType === 'attack') {
    const tutorialValidation = validateTutorialBuilderAction(scene, {
      skill: scene.selectedSkill,
      result,
      operator: opCard.value,
      expression: displayExpression,
    });

    if (!tutorialValidation.allowed) {
      scene.renderResultText(tutorialValidation.message, battleResultPhases.INFO);
      return;
    }
  }

  hideBuilderAfterConfirm(scene);

  if (actionType === 'attack') {
    scene.resolveAttack(result, displayExpression, opCard.value);
  }

  scene.selectedAction = null;
  scene.refreshBattleUI();
}

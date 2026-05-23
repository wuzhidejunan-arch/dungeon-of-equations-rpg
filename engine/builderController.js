import { battleMenuStates } from '../data/battleStates.js';
import { battleResultPhases } from '../data/battlePhases.js';
import {
  formatBattleTemplate,
  getBattleText,
  getBattleUIText,
  getChainBuilderHelperText,
} from '../utils/battleSchema.js';
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

  if (value === '/' || value === '÷') {
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

  if (value === '/' || value === '÷') {
    return '÷';
  }

  if (usesModernOperatorGlyphs(scene)) {
    if (value === '?' || value === '*') {
      return '×';
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
  setBuilderImageSize(panel, width, height);
}

const mathBuilderAssets = Object.freeze({
  panel: 'mathBuilderPanel',
  slotEmpty: 'mathBuilderSlotEmpty',
  tokenIdle: 'mathBuilderTokenIdle',
  tokenSelected: 'mathBuilderTokenSelected',
  buttonIdle: 'mathBuilderButtonIdle',
});

const singleLineBuilderLayout = Object.freeze({
  panel: { x: 400, y: 330, width: 660, height: 410 },
  title: { x: 400, y: 185 },
  goal: { x: 170, y: 222, width: 490 },
  feedback: { x: 170, y: 262, width: 490 },
  cards: {
    centerX: 400,
    y: 302,
    width: 54,
    height: 54,
    gap: 18,
  },
  slots: {
    width: 72,
    height: 56,
    left: { x: 260, y: 375 },
    op: { x: 350, y: 375 },
    right: { x: 440, y: 375 },
    equals: { x: 520, y: 375 },
    result: { x: 568, y: 375 },
  },
  buttons: {
    width: 112,
    height: 46,
    back: { x: 274, y: 450 },
    clear: { x: 400, y: 450 },
    confirm: { x: 526, y: 450 },
  },
});

const chainedBuilderLayout = Object.freeze({
  panel: { x: 400, y: 310, width: 720, height: 540 },
  title: { x: 400, y: 130 },
  goal: { x: 165, y: 170, width: 470 },
  feedback: { x: 165, y: 192, width: 470 },
  cards: {
    width: 50,
    height: 50,
    gap: 62,
  },
  slots: {
    width: 62,
    height: 50,
  },
  buttons: {
    width: 112,
    height: 46,
  },
});

function hasTexture(scene, key) {
  return Boolean(scene?.textures?.exists?.(key));
}

function createBuilderImageOrFallback(scene, key, x, y, width, height, fallbackFill, fallbackStroke) {
  const node = hasTexture(scene, key)
    ? scene.add.image(x, y, key).setDisplaySize(width, height)
    : scene.add.rectangle(x, y, width, height, fallbackFill, 1);

  if (!hasTexture(scene, key) && fallbackStroke) {
    node.setStrokeStyle?.(fallbackStroke.width, fallbackStroke.color);
  }

  node.builderDisplayWidth = width;
  node.builderDisplayHeight = height;
  return node;
}

function setBuilderImageSize(node, width, height) {
  node.builderDisplayWidth = width;
  node.builderDisplayHeight = height;
  node.setSize?.(width, height);
  node.setDisplaySize?.(width, height);
}

function setBuilderCardTexture(card, selected = false) {
  const textureKey = selected ? mathBuilderAssets.tokenSelected : mathBuilderAssets.tokenIdle;
  if (!card?.setTexture || !hasTexture(card.scene, textureKey)) return;
  card.setTexture(textureKey);
  card.setDisplaySize?.(card.builderDisplayWidth || 44, card.builderDisplayHeight || 44);
}

const SINGLE_LINE_BUILDER_CONTENT_OFFSET_X = -30;
const SINGLE_LINE_BUILDER_NON_BUTTON_OFFSET_Y = 15;
const CHAIN_BUILDER_EXPRESSION_OFFSET_X = -30;
const CHAIN_BUILDER_BUTTON_OFFSET_X = -30;
const CHAIN_BUILDER_OPERATOR_OFFSET_X = -30;
const CHAIN_BUILDER_CONTENT_OFFSET_Y = -50;
const CHAIN_BUILDER_BUTTON_OFFSET_Y = -32;
const BUILDER_BUTTON_TEXT_VISUAL_ADJUST_Y = -3;
function centerTextByBounds(text, targetCenterX, targetCenterY) {
  if (!text) return;
  text?.setOrigin?.(0.5, 0.5);
  text?.setPosition?.(targetCenterX, targetCenterY);
  text?.updateText?.();

  const bounds = text?.getBounds?.();
  if (!bounds) return;

  const actualCenterX = bounds.x + (bounds.width / 2);
  const actualCenterY = bounds.y + (bounds.height / 2);
  text.x += targetCenterX - actualCenterX;
  text.y += targetCenterY - actualCenterY;
}

function centerButtonTextByBounds(text, targetCenterX, targetCenterY) {
  centerTextByBounds(text, targetCenterX, targetCenterY);
  if (text) {
    text.y += BUILDER_BUTTON_TEXT_VISUAL_ADJUST_Y;
  }
}

function singleLineX(x) {
  return x + SINGLE_LINE_BUILDER_CONTENT_OFFSET_X;
}

function singleLineNonButtonY(y) {
  return y + SINGLE_LINE_BUILDER_NON_BUTTON_OFFSET_Y;
}

function chainExpressionX(x) {
  return x + CHAIN_BUILDER_EXPRESSION_OFFSET_X;
}

function chainButtonX(x) {
  return x + CHAIN_BUILDER_BUTTON_OFFSET_X;
}

function chainOperatorX(x) {
  return x + CHAIN_BUILDER_OPERATOR_OFFSET_X;
}

function chainContentY(y) {
  return y + CHAIN_BUILDER_CONTENT_OFFSET_Y;
}

function chainButtonY(y) {
  return y + CHAIN_BUILDER_BUTTON_OFFSET_Y;
}

export function applyBuilderLayout(scene) {
  if (isChainedBuilder(scene)) {
    setPanelBounds(
      scene.builderPanel,
      chainedBuilderLayout.panel.x,
      chainedBuilderLayout.panel.y,
      chainedBuilderLayout.panel.width,
      chainedBuilderLayout.panel.height,
    );
    scene.builderTitleText?.setPosition?.(chainedBuilderLayout.title.x, chainedBuilderLayout.title.y);
    scene.builderGoalText?.setPosition?.(chainedBuilderLayout.goal.x, chainedBuilderLayout.goal.y);
    scene.builderGoalText?.setWordWrapWidth?.(chainedBuilderLayout.goal.width);
    scene.builderFeedbackText?.setPosition?.(chainedBuilderLayout.feedback.x, chainedBuilderLayout.feedback.y);
    scene.builderFeedbackText?.setWordWrapWidth?.(chainedBuilderLayout.feedback.width);
    scene.builderSlots.step1Left?.setPosition?.(chainExpressionX(294), chainContentY(362));
    scene.builderSlots.step1Op?.setPosition?.(chainExpressionX(370), chainContentY(362));
    scene.builderSlots.step1Right?.setPosition?.(chainExpressionX(446), chainContentY(362));
    scene.builderSlots.step2Op?.setPosition?.(chainExpressionX(370), chainContentY(434));
    scene.builderSlots.step2Right?.setPosition?.(chainExpressionX(446), chainContentY(434));
    scene.builderStep1EqualsText?.setPosition?.(chainExpressionX(526), chainContentY(362));
    scene.builderStep1ResultText?.setPosition?.(chainExpressionX(570), chainContentY(362));
    scene.builderStep2CarryText?.setPosition?.(chainExpressionX(294), chainContentY(434));
    scene.builderStep2EqualsText?.setPosition?.(chainExpressionX(526), chainContentY(434));
    scene.equalsText?.setPosition?.(chainExpressionX(526), chainContentY(434));
    scene.resultPreviewText?.setPosition?.(chainExpressionX(570), chainContentY(434));
    scene.backButton?.background?.setPosition?.(chainButtonX(314), chainButtonY(542));
    centerButtonTextByBounds(scene.backButton?.text, chainButtonX(314), chainButtonY(542));
    scene.clearButton?.background?.setPosition?.(chainButtonX(440), chainButtonY(542));
    centerButtonTextByBounds(scene.clearButton?.text, chainButtonX(440), chainButtonY(542));
    scene.confirmButton?.background?.setPosition?.(chainButtonX(566), chainButtonY(542));
    centerButtonTextByBounds(scene.confirmButton?.text, chainButtonX(566), chainButtonY(542));
    return;
  }

  setPanelBounds(
    scene.builderPanel,
    singleLineBuilderLayout.panel.x,
    singleLineBuilderLayout.panel.y,
    singleLineBuilderLayout.panel.width,
    singleLineBuilderLayout.panel.height,
  );
  scene.builderTitleText?.setPosition?.(singleLineBuilderLayout.title.x, singleLineBuilderLayout.title.y);
  scene.builderGoalText?.setPosition?.(singleLineBuilderLayout.goal.x, singleLineBuilderLayout.goal.y);
  scene.builderGoalText?.setWordWrapWidth?.(singleLineBuilderLayout.goal.width);
  scene.builderFeedbackText?.setPosition?.(singleLineBuilderLayout.feedback.x, singleLineBuilderLayout.feedback.y);
  scene.builderFeedbackText?.setWordWrapWidth?.(singleLineBuilderLayout.feedback.width);
  scene.builderSlots.left?.setPosition?.(singleLineBuilderLayout.slots.left.x, singleLineBuilderLayout.slots.left.y);
  scene.builderSlots.op?.setPosition?.(singleLineBuilderLayout.slots.op.x, singleLineBuilderLayout.slots.op.y);
  scene.builderSlots.right?.setPosition?.(singleLineBuilderLayout.slots.right.x, singleLineBuilderLayout.slots.right.y);
  scene.builderSlots.step1Left?.setPosition?.(singleLineX(272), 336);
  scene.builderSlots.step1Op?.setPosition?.(singleLineX(340), 336);
  scene.builderSlots.step1Right?.setPosition?.(singleLineX(408), 336);
  scene.builderSlots.step2Op?.setPosition?.(singleLineX(340), 408);
  scene.builderSlots.step2Right?.setPosition?.(singleLineX(408), 408);
  scene.builderStep1EqualsText?.setPosition?.(singleLineX(474), 336);
  scene.builderStep1ResultText?.setPosition?.(singleLineX(516), 336);
  scene.builderStep2CarryText?.setPosition?.(singleLineX(272), 408);
  scene.builderStep2EqualsText?.setPosition?.(singleLineX(474), 408);
  scene.backButton?.background?.setPosition?.(singleLineBuilderLayout.buttons.back.x, singleLineBuilderLayout.buttons.back.y);
  centerButtonTextByBounds(scene.backButton?.text, singleLineBuilderLayout.buttons.back.x, singleLineBuilderLayout.buttons.back.y);
  scene.clearButton?.background?.setPosition?.(singleLineBuilderLayout.buttons.clear.x, singleLineBuilderLayout.buttons.clear.y);
  centerButtonTextByBounds(scene.clearButton?.text, singleLineBuilderLayout.buttons.clear.x, singleLineBuilderLayout.buttons.clear.y);
  scene.confirmButton?.background?.setPosition?.(singleLineBuilderLayout.buttons.confirm.x, singleLineBuilderLayout.buttons.confirm.y);
  centerButtonTextByBounds(scene.confirmButton?.text, singleLineBuilderLayout.buttons.confirm.x, singleLineBuilderLayout.buttons.confirm.y);
  scene.equalsText?.setPosition?.(singleLineBuilderLayout.slots.equals.x, singleLineBuilderLayout.slots.equals.y);
  scene.resultPreviewText?.setPosition?.(singleLineBuilderLayout.slots.result.x, singleLineBuilderLayout.slots.result.y);
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
    .replace('Challenge attack does not work: ', '')
    .replace('Challenge attack works: ', '')
    .replace('Challenge chain is valid.', 'This two-row answer works.')
    .replace('Chain valid.', 'This two-row answer works.')
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
  const rect = createBuilderImageOrFallback(
    scene,
    mathBuilderAssets.slotEmpty,
    x,
    y,
    width,
    height,
    0xffffff,
    { width: 3, color: 0x1a1a1a },
  )
    .setDepth(302)
    .setVisible(false);

  rect.slotType = slotType;
  rect.assignedCard = null;
  return rect;
}

function createActionButton(scene, x, y, width, height, label, onClick) {
  const background = createBuilderImageOrFallback(
    scene,
    mathBuilderAssets.buttonIdle,
    x,
    y,
    width,
    height,
    0xffffff,
    { width: 3, color: 0x1a1a1a },
  )
    .setDepth(302)
    .setVisible(false)
    .setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(x, y, label, {
      fontSize: '18px',
      color: '#f8e7b0',
      fontStyle: 'bold',
    })
    .setOrigin(0.5, 0.5)
    .setDepth(303)
    .setVisible(false);
  centerButtonTextByBounds(text, x, y);

  background.on('pointerup', onClick);

  return { background, text };
}

function createDraggableCard(scene, x, y, width, height, textValue, color, cardType, value) {
  const card = createBuilderImageOrFallback(
    scene,
    mathBuilderAssets.tokenIdle,
    x,
    y,
    width,
    height,
    color,
    { width: 3, color: 0x1a1a1a },
  )
    .setDepth(305)
    .setVisible(true)
    .setInteractive({ draggable: true, useHandCursor: true });

  const label = scene.add
    .text(x, y, getDisplayCardTextForScene(scene, cardType, textValue), {
      fontSize: '22px',
      color: '#f8e7b0',
      fontStyle: 'bold',
    })
    .setOrigin(0.5, 0.5)
    .setDepth(306)
    .setVisible(true);
  centerTextByBounds(label, x, y);

  card.label = label;
  card.cardType = cardType;
  card.value = value;
  card.homeX = x;
  card.homeY = y;
  card.assignedSlot = null;

  card.on('pointerover', () => setBuilderCardTexture(card, true));
  card.on('pointerout', () => {
    if (!card.__builderDragging) {
      setBuilderCardTexture(card, false);
    }
  });
  card.on('pointerup', () => {
    if (!scene.builderActive || card.__builderDragMoved) {
      card.__builderDragMoved = false;
      return;
    }

    if (!card.assignedSlot) {
      const preferredSlot = getNextPreferredSlot(scene, card);

      if (preferredSlot) {
        assignCardToSlot(scene, card, preferredSlot);
      }
    }
  });

  scene.input.setDraggable(card);

  return card;
}

export function createBuilderUI(scene) {
  scene.builderOverlay = scene.add
    .rectangle(400, 300, 800, 600, 0x000000, 0.14)
    .setDepth(298)
    .setVisible(false);

  scene.builderPanel = createBuilderImageOrFallback(
    scene,
    mathBuilderAssets.panel,
    singleLineBuilderLayout.panel.x,
    singleLineBuilderLayout.panel.y,
    singleLineBuilderLayout.panel.width,
    singleLineBuilderLayout.panel.height,
    0xffffff,
    { width: 4, color: 0x1a1a1a },
  )
    .setDepth(300)
    .setVisible(false);

  scene.builderTitleText = scene.add
    .text(singleLineBuilderLayout.title.x, singleLineBuilderLayout.title.y, getBattleUIText('builder.title', 'Build'), {
      fontSize: '30px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.builderGoalText = scene.add
    .text(singleLineBuilderLayout.goal.x, singleLineBuilderLayout.goal.y, '', {
      fontSize: '17px',
      color: '#333333',
      wordWrap: { width: singleLineBuilderLayout.goal.width },
    })
    .setDepth(302)
    .setVisible(false);

  scene.builderFeedbackText = scene.add
    .text(singleLineBuilderLayout.feedback.x, singleLineBuilderLayout.feedback.y, '', {
      fontSize: '14px',
      color: '#1a1a1a',
      wordWrap: { width: singleLineBuilderLayout.feedback.width },
      lineSpacing: 4,
    })
    .setDepth(302)
    .setVisible(false);

  scene.cardsLabelText = null;

  scene.builderSlots = {
    left: createSlot(scene, singleLineBuilderLayout.slots.left.x, singleLineBuilderLayout.slots.left.y, singleLineBuilderLayout.slots.width, singleLineBuilderLayout.slots.height, 'number'),
    op: createSlot(scene, singleLineBuilderLayout.slots.op.x, singleLineBuilderLayout.slots.op.y, singleLineBuilderLayout.slots.width, singleLineBuilderLayout.slots.height, 'operator'),
    right: createSlot(scene, singleLineBuilderLayout.slots.right.x, singleLineBuilderLayout.slots.right.y, singleLineBuilderLayout.slots.width, singleLineBuilderLayout.slots.height, 'number'),
    step1Left: createSlot(scene, singleLineX(272), 336, chainedBuilderLayout.slots.width, chainedBuilderLayout.slots.height, 'number'),
    step1Op: createSlot(scene, singleLineX(340), 336, chainedBuilderLayout.slots.width, chainedBuilderLayout.slots.height, 'operator'),
    step1Right: createSlot(scene, singleLineX(408), 336, chainedBuilderLayout.slots.width, chainedBuilderLayout.slots.height, 'number'),
    step2Op: createSlot(scene, singleLineX(340), 408, chainedBuilderLayout.slots.width, chainedBuilderLayout.slots.height, 'operator'),
    step2Right: createSlot(scene, singleLineX(408), 408, chainedBuilderLayout.slots.width, chainedBuilderLayout.slots.height, 'number'),
  };

  scene.builderStep1EqualsText = scene.add
    .text(singleLineX(474), 336, '=', {
      fontSize: '28px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.builderStep1ResultText = scene.add
    .text(singleLineX(516), 336, '?', {
      fontSize: '24px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.builderStep2CarryText = scene.add
    .text(singleLineX(272), 408, '?', {
      fontSize: '24px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.builderStep2EqualsText = scene.add
    .text(singleLineX(474), 408, '=', {
      fontSize: '28px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.equalsText = scene.add
    .text(singleLineBuilderLayout.slots.equals.x, singleLineBuilderLayout.slots.equals.y, '=', {
      fontSize: '34px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.resultPreviewText = scene.add
    .text(singleLineBuilderLayout.slots.result.x, singleLineBuilderLayout.slots.result.y, '?', {
      fontSize: '26px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setVisible(false);

  scene.propertyPreviewText = null;

  scene.backButton = createActionButton(scene, singleLineBuilderLayout.buttons.back.x, singleLineBuilderLayout.buttons.back.y, singleLineBuilderLayout.buttons.width, singleLineBuilderLayout.buttons.height, getBattleText('builder.backButton', 'Back'), () => scene.returnToSkillMenu());
  scene.clearButton = createActionButton(scene, singleLineBuilderLayout.buttons.clear.x, singleLineBuilderLayout.buttons.clear.y, singleLineBuilderLayout.buttons.width, singleLineBuilderLayout.buttons.height, getBattleText('builder.clearButton', 'Clear'), () => scene.clearBuilderSlots());
  scene.confirmButton = createActionButton(scene, singleLineBuilderLayout.buttons.confirm.x, singleLineBuilderLayout.buttons.confirm.y, singleLineBuilderLayout.buttons.width, singleLineBuilderLayout.buttons.height, getBattleText('builder.okButton', 'OK'), () => scene.confirmBuilderAction());

  scene.builderHintText = null;
}

export function registerBuilderDragHandlers(scene) {
  cleanupBuilderDragHandlers(scene);

  const dragstart = (_, gameObject) => {
    if (!scene.builderActive) return;
    gameObject.__builderDragging = true;
    gameObject.__builderDragMoved = false;
    setBuilderCardTexture(gameObject, true);
    gameObject.setDepth(330);
    gameObject.label?.setDepth?.(331);
  };

  const drag = (_, gameObject, dragX, dragY) => {
    if (!scene.builderActive) return;
    gameObject.__builderDragMoved = true;
    gameObject.x = dragX;
    gameObject.y = dragY;
    centerTextByBounds(gameObject.label, dragX, dragY);
  };

  const dragend = (pointer, gameObject) => {
    if (!scene.builderActive) return;
    tryPlaceCardInSlot(scene, pointer, gameObject);
    gameObject.__builderDragging = false;
    setBuilderCardTexture(gameObject, false);
    gameObject.setDepth(305);
    gameObject.label?.setDepth?.(306);
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
    setPanelBounds(
      scene.builderPanel,
      chainedBuilderLayout.panel.x,
      chainedBuilderLayout.panel.y,
      chainedBuilderLayout.panel.width,
      chainedBuilderLayout.panel.height,
    );
    scene.builderTitleText?.setPosition?.(chainedBuilderLayout.title.x, chainedBuilderLayout.title.y);
    scene.builderGoalText?.setPosition?.(chainedBuilderLayout.goal.x, chainedBuilderLayout.goal.y);
    scene.builderGoalText?.setWordWrapWidth?.(chainedBuilderLayout.goal.width);
    scene.builderFeedbackText?.setPosition?.(chainedBuilderLayout.feedback.x, chainedBuilderLayout.feedback.y);
    scene.builderFeedbackText?.setWordWrapWidth?.(chainedBuilderLayout.feedback.width);
    scene.builderSlots.step1Left?.setPosition?.(chainExpressionX(296), chainContentY(372));
    scene.builderSlots.step1Op?.setPosition?.(chainExpressionX(378), chainContentY(372));
    scene.builderSlots.step1Right?.setPosition?.(chainExpressionX(460), chainContentY(372));
    scene.builderSlots.step2Op?.setPosition?.(chainExpressionX(378), chainContentY(458));
    scene.builderSlots.step2Right?.setPosition?.(chainExpressionX(460), chainContentY(458));
    scene.builderStep1EqualsText?.setPosition?.(chainExpressionX(548), chainContentY(372));
    scene.builderStep1ResultText?.setPosition?.(chainExpressionX(594), chainContentY(372));
    scene.builderStep2CarryText?.setPosition?.(chainExpressionX(296), chainContentY(458));
    scene.builderStep2EqualsText?.setPosition?.(chainExpressionX(548), chainContentY(458));
    scene.equalsText?.setPosition?.(chainExpressionX(548), chainContentY(458));
    scene.resultPreviewText?.setPosition?.(chainExpressionX(594), chainContentY(458));
    scene.backButton?.background?.setPosition?.(chainButtonX(314), chainButtonY(542));
    centerButtonTextByBounds(scene.backButton?.text, chainButtonX(314), chainButtonY(542));
    scene.clearButton?.background?.setPosition?.(chainButtonX(440), chainButtonY(542));
    centerButtonTextByBounds(scene.clearButton?.text, chainButtonX(440), chainButtonY(542));
    scene.confirmButton?.background?.setPosition?.(chainButtonX(566), chainButtonY(542));
    centerButtonTextByBounds(scene.confirmButton?.text, chainButtonX(566), chainButtonY(542));
    scene.builderTitleText?.setText?.(`${chosenSkill.name.toUpperCase()} - CHAIN`);
    scene.builderGoalText?.setText?.(getChainBuilderHelperText());
    scene.builderFeedbackText?.setText?.('');
    scene.builderFeedbackText?.setVisible?.(false);
  } else {
    setPanelBounds(
      scene.builderPanel,
      singleLineBuilderLayout.panel.x,
      singleLineBuilderLayout.panel.y,
      singleLineBuilderLayout.panel.width,
      singleLineBuilderLayout.panel.height,
    );
    scene.builderTitleText?.setPosition?.(singleLineBuilderLayout.title.x, singleLineBuilderLayout.title.y);
    scene.builderGoalText?.setPosition?.(singleLineBuilderLayout.goal.x, singleLineBuilderLayout.goal.y);
    scene.builderGoalText?.setWordWrapWidth?.(singleLineBuilderLayout.goal.width);
    scene.builderFeedbackText?.setPosition?.(singleLineBuilderLayout.feedback.x, singleLineBuilderLayout.feedback.y);
    scene.builderFeedbackText?.setWordWrapWidth?.(singleLineBuilderLayout.feedback.width);
    scene.builderSlots.left?.setPosition?.(singleLineBuilderLayout.slots.left.x, singleLineBuilderLayout.slots.left.y);
    scene.builderSlots.op?.setPosition?.(singleLineBuilderLayout.slots.op.x, singleLineBuilderLayout.slots.op.y);
    scene.builderSlots.right?.setPosition?.(singleLineBuilderLayout.slots.right.x, singleLineBuilderLayout.slots.right.y);
    scene.builderSlots.step1Left?.setPosition?.(singleLineX(272), 336);
    scene.builderSlots.step1Op?.setPosition?.(singleLineX(340), 336);
    scene.builderSlots.step1Right?.setPosition?.(singleLineX(408), 336);
    scene.builderSlots.step2Op?.setPosition?.(singleLineX(340), 408);
    scene.builderSlots.step2Right?.setPosition?.(singleLineX(408), 408);
    scene.builderStep1EqualsText?.setPosition?.(singleLineX(474), 336);
    scene.builderStep1ResultText?.setPosition?.(singleLineX(516), 336);
    scene.builderStep2CarryText?.setPosition?.(singleLineX(272), 408);
    scene.builderStep2EqualsText?.setPosition?.(singleLineX(474), 408);
    scene.backButton?.background?.setPosition?.(singleLineBuilderLayout.buttons.back.x, singleLineBuilderLayout.buttons.back.y);
    centerButtonTextByBounds(scene.backButton?.text, singleLineBuilderLayout.buttons.back.x, singleLineBuilderLayout.buttons.back.y);
    scene.clearButton?.background?.setPosition?.(singleLineBuilderLayout.buttons.clear.x, singleLineBuilderLayout.buttons.clear.y);
    centerButtonTextByBounds(scene.clearButton?.text, singleLineBuilderLayout.buttons.clear.x, singleLineBuilderLayout.buttons.clear.y);
    scene.confirmButton?.background?.setPosition?.(singleLineBuilderLayout.buttons.confirm.x, singleLineBuilderLayout.buttons.confirm.y);
    centerButtonTextByBounds(scene.confirmButton?.text, singleLineBuilderLayout.buttons.confirm.x, singleLineBuilderLayout.buttons.confirm.y);
    scene.equalsText?.setPosition?.(singleLineBuilderLayout.slots.equals.x, singleLineBuilderLayout.slots.equals.y);
    scene.resultPreviewText?.setPosition?.(singleLineBuilderLayout.slots.result.x, singleLineBuilderLayout.slots.result.y);
    scene.builderFeedbackText?.setText?.('');
    scene.builderFeedbackText?.setVisible?.(false);
  }

  if (isChainedBuilder(scene)) {
    scene.builderGoalText?.setText?.(getChainBuilderHelperText());
  }

  if (isChainedBuilder(scene) && scene.difficultyKey === 'challenge') {
    scene.builderGoalText?.setText?.(getChainBuilderHelperText());
  }

  const builderStartText = scene.difficultyKey === 'beginner'
    ? 'Put numbers and + or - in the boxes. Press Enter.'
    : formatBattleTemplate(getBattleUIText('prompts.builderStart', '{skill}! Make the right answer.'), { skill: chosenSkill.name });

  scene.renderResultText(
    builderStartText,
    battleResultPhases.INFO,
    { skill: chosenSkill.name },
  );
  scene.addBattleLog(getBattleText('logs.builderOpened', `Player opened ${actionType} math boxes.`, { action: actionType }));
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
    const numberStartY = chainContentY(318);
    const numberGap = chainedBuilderLayout.cards.gap;
    const operatorX = chainOperatorX(635);
    const operatorGap = chainedBuilderLayout.cards.gap;
    const operatorStartY = chainContentY(318);

    scene.turnNumbers.forEach((value, index) => {
      const card = createDraggableCard(scene, numberX, numberStartY + index * numberGap, chainedBuilderLayout.cards.width, chainedBuilderLayout.cards.height, `${value}`, 0xffffff, 'number', value);
      scene.builderCards.push(card);
    });

    getStep1Operators(scene).forEach((value, index) => {
      const card = createDraggableCard(scene, operatorX, operatorStartY + (index * operatorGap), chainedBuilderLayout.cards.width, chainedBuilderLayout.cards.height, value, 0xffffff, 'operator', value);
      scene.builderCards.push(card);
    });
    return;
  }

  const tokenEntries = [
    ...scene.turnNumbers.map((value) => ({ text: `${value}`, type: 'number', value })),
    ...scene.availableOperators.map((value) => ({ text: value, type: 'operator', value })),
  ];
  const tokenStep = singleLineBuilderLayout.cards.width + singleLineBuilderLayout.cards.gap;
  const tokenRowWidth = (tokenEntries.length * singleLineBuilderLayout.cards.width)
    + (Math.max(tokenEntries.length - 1, 0) * singleLineBuilderLayout.cards.gap);
  const tokenStartX = singleLineBuilderLayout.cards.centerX - (tokenRowWidth / 2) + (singleLineBuilderLayout.cards.width / 2);

  tokenEntries.forEach((entry, index) => {
    const card = createDraggableCard(
      scene,
      tokenStartX + (index * tokenStep),
      singleLineBuilderLayout.cards.y,
      singleLineBuilderLayout.cards.width,
      singleLineBuilderLayout.cards.height,
      entry.text,
      0xffffff,
      entry.type,
      entry.value,
    );
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
    centerTextByBounds(card.label, slot.x, slot.y);
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
  centerTextByBounds(card.label, slot.x, slot.y);

  scene.refreshPreview();
}

export function resetCardPosition(scene, card) {
  if (card.assignedSlot) {
    card.assignedSlot.assignedCard = null;
    card.assignedSlot = null;
  }

  card.x = card.homeX;
  card.y = card.homeY;
  centerTextByBounds(card.label, card.homeX, card.homeY);
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
    scene.renderResultText('This division does not make a whole number. Try again.', battleResultPhases.INFO);
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

import { playerData } from '../../../data/playerData.js';
import { getSkillUnavailableReason, isSkillUsable } from '../../../utils/playerSkills.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import {
  formatBattleTemplate,
  getBattleLogText,
  getBattleSystemText,
  getBattleUIText,
  getEnemyPrimaryRule,
  getEnemyRuleSummaryText,
  getEntityUIText,
  getSafeBattleSkillHint,
  getSkillPrimaryRule,
  isDirectAttackSkill,
  isUtilitySkill,
  getSkillTextTemplate,
} from '../../../utils/battleSchema.js';
import {
  buildBattlePhaseLine,
  buildExpressionPhase,
  buildPropertyPhase,
  buildSkillUsesLeftPhase,
  buildFeedbackPhases,
} from '../../../engine/battleResultFormatter.js';
import { normalizeOperator } from '../../../utils/battleMath.js';
import { getRuleConfig } from '../../../utils/battleMath.js';
import { getCurrentDifficultyKey } from '../../../config/difficultySettings.js';

function getLines(phases = []) {
  return phases.map((entry) => entry.text);
}

function formatCategoryList(categories = []) {
  if (!categories.length) return 'unknown';
  if (categories.length === 1) return categories[0];
  if (categories.length === 2) return `${categories[0]} and ${categories[1]}`;
  return `${categories.slice(0, -1).join(', ')}, and ${categories[categories.length - 1]}`;
}

function getPrimaryRuleLabel(ruleId) {
  return getRuleConfig(ruleId)?.label || 'the right rule';
}

function getFriendlyRuleAnswerText(scene) {
  const summary = String(getEnemyRuleSummaryText(scene?.enemy) || '').toLowerCase();
  if (!summary) return 'the right answer';
  if (/^\d+$/.test(summary)) return `${summary} as the answer`;
  if (summary === '0') return '0 as the answer';
  const article = /^[aeiou]/.test(summary) ? 'an' : 'a';
  return `${article} ${summary} answer`;
}

function getPreferredCategory(properties = [], preferredCategory = null) {
  if (preferredCategory && properties.includes(preferredCategory)) {
    return preferredCategory;
  }
  return properties[0] || 'Unknown';
}

function buildSuccessCategoryFeedback(ctx) {
  const enemyRuleLabel = getPrimaryRuleLabel(getEnemyPrimaryRule(ctx.scene.enemy));
  const preferredCategory = getPreferredCategory(ctx.properties, enemyRuleLabel);
  const otherCategories = ctx.properties.filter((property) => property !== preferredCategory);

  if (!otherCategories.length) {
    return `Correct. Your answer was ${ctx.result}, so it is ${preferredCategory}.`;
  }

  return `Correct. Your answer was ${ctx.result}. It is ${preferredCategory}, and it is also ${formatCategoryList(otherCategories)}.`;
}

function buildEnemyRuleMismatchFeedback(ctx) {
  const neededAnswerText = getFriendlyRuleAnswerText(ctx.scene);
  return `The math is right. But this monster needs ${neededAnswerText}. Try ${neededAnswerText}.`;
}

function buildWrongAttackTypeFeedback(ctx) {
  return buildEnemyRuleMismatchFeedback(ctx);
}

function appendSafeSkillHintPhases(ctx) {
  const hint = getSafeBattleSkillHint({
    enemy: ctx.scene.enemy,
    skills: ctx.scene.playerSkills,
    difficultyKey: getDifficultyKey(ctx.scene),
  });
  if (!hint) return;

  ctx.phases.push(
    buildBattlePhaseLine(
      battleResultPhases.RESULT_SKILL_CHECK,
      hint.failureText,
      { outcome: ctx.outcome || 'failure', enemy: ctx.scene.enemy?.name || 'Enemy' },
    ),
    buildBattlePhaseLine(
      battleResultPhases.RESULT_SKILL_CHECK,
      hint.retryText,
      { outcome: ctx.outcome || 'failure', skill: hint.skillName },
    ),
  );
}

function buildResult(ctx, overrides = {}) {
  return {
    outcome: ctx.outcome || 'failure',
    resolutionState: ctx.resolutionState || 'failure',
    phases: ctx.phases,
    lines: getLines(ctx.phases),
    damage: ctx.damage || 0,
    activeBonus: ctx.activeBonus ?? null,
    resultType: ctx.resolutionState || 'failure',
    enemyShouldAct: overrides.enemyShouldAct ?? (ctx.scene.enemyCurrentHp > 0 && playerData.hp > 0),
    ...overrides,
  };
}

function markAndFinalize(ctx, resolutionState, overrides = {}) {
  ctx.resolutionState = resolutionState;
  ctx.outcome = resolutionState;
  ctx.stop = true;
  ctx.finalResult = buildResult(ctx, overrides);
  return ctx;
}

function buildOperationNeedText(skill) {
  if (skill?.operationType === 'multiply') return formatBattleOperatorDisplay('*');
  if (skill?.operationType === 'divide') return formatBattleOperatorDisplay('/');
  return null;
}

function getDifficultyKey(scene) {
  return scene?.difficultyKey || getCurrentDifficultyKey();
}

function formatBattleOperatorDisplay(operator) {
  if (operator === '*' || operator === '?' || operator === '×') {
    return '×';
  }

  if (operator === '/' || operator === '÷') {
    return '÷';
  }

  if (operator === '-') {
    return '−';
  }

  if (operator === '+') {
    return '+';
  }

  return `${operator ?? ''}`;
}

function isGuidedTutorialBattle(scene) {
  return Boolean(scene?.isTrainingGuideBattle?.());
}

function getOperationLessonLabel(skill) {
  if (skill?.operationType === 'multiply') return 'multiplication';
  if (skill?.operationType === 'divide') return 'division';
  return 'correct';
}

function getGuidedEnemyNeedText(ctx) {
  const enemyName = ctx.scene.enemy?.name || 'The enemy';
  return `${enemyName} only takes attack damage when the answer is ${getEnemyRuleSummaryText(ctx.scene.enemy)}.`;
}

function buildGuidedTeachingPhases(ctx, finalLine) {
  if (!isGuidedTutorialBattle(ctx.scene)) return [];

  return [
    buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, `You used ${ctx.skill.name}.`, { skill: ctx.skill.name }),
    buildBattlePhaseLine(
      battleResultPhases.RESULT_SKILL_CHECK,
      `This skill uses ${buildOperationNeedText(ctx.skill) || 'the right math'}.`,
      { skill: ctx.skill.name },
    ),
    buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, `Your answer was ${ctx.result}.`, { result: ctx.result }),
    buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, getGuidedEnemyNeedText(ctx), { enemy: ctx.scene.enemy?.name || 'Enemy' }),
    buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, finalLine, { skill: ctx.skill.name, result: ctx.result }),
  ];
}

function buildGuidedUtilityTeachingPhases(ctx, finalLine) {
  if (!isGuidedTutorialBattle(ctx.scene)) return [];

  return [
    buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, `You used ${ctx.skill.name}.`, { skill: ctx.skill.name }),
    buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, `This helper skill uses ${buildOperationNeedText(ctx.skill)}.`, { skill: ctx.skill.name }),
    buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, `Your answer was ${ctx.result}.`, { result: ctx.result }),
    buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, 'Helper skills can still work. Just use the right math.', { enemy: ctx.scene.enemy?.name || 'Enemy' }),
    buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, finalLine, { skill: ctx.skill.name, result: ctx.result }),
  ];
}


function prependFeedback(ctx, outcomeKey, payload = {}) {
  const feedbackPhases = buildFeedbackPhases(getDifficultyKey(ctx.scene), outcomeKey, payload);
  ctx.phases = [...feedbackPhases, ...ctx.phases];
}


export function createAttackRuleContext(scene, payload = {}) {
  const skill = payload.skill;
  const result = payload.result;
  const expression = payload.expression;
  const operator = payload.operator || null;
  const operationType = payload.operationType || normalizeOperator(operator);
  const properties = scene.getResultProperties(result);
  const propertiesText = scene.formatPropertyList(properties);
  const skillRuleId = skill?.condition?.type === 'result_rule' ? skill?.condition?.value || null : null;

  return {
    scene,
    payload,
    skill,
    result,
    expression,
    properties,
    propertiesText,
    operator,
    operationType,
    skillMatched: scene.matchesSkillRule(result, skill, operator),
    enemyMatched: scene.matchesEnemyRule(result, skill, operator),
    skillRuleId,
    skillNeedText: skill?.operationType === 'multiply'
      ? `a ${formatBattleOperatorDisplay('*')} answer`
      : skill?.operationType === 'divide'
        ? `a ${formatBattleOperatorDisplay('/')} answer`
        : skillRuleId
          ? scene.getRuleNeedText(skillRuleId)
          : 'the right answer',
    enemyRuleText: String(scene.getEnemyRuleSummary?.() || 'any').toLowerCase(),
    resultTypeText: String(propertiesText || 'unknown').toLowerCase(),
    phases: [
      buildExpressionPhase(expression, result),
      buildPropertyPhase(result, propertiesText, properties),
    ],
    outcome: 'failure',
    resolutionState: 'failure',
    damage: 0,
    activeBonus: null,
    stop: false,
  };
}

export function skillUsableRule(ctx) {
  if (ctx.stop) return ctx;

  if (!isSkillUsable(ctx.skill)) {
    ctx.phases.push(buildSkillUsesLeftPhase(ctx.skill?.name || 'Skill', getSkillUnavailableReason(ctx.skill)));
    ctx.stop = true;
    ctx.finalResult = buildResult(ctx, { enemyShouldAct: true });
  }

  return ctx;
}

export function spendSkillUseRule(ctx) {
  if (ctx.stop) return ctx;
  ctx.scene.spendSkillUse(ctx.skill);
  return ctx;
}

export function skillConditionRule(ctx) {
  if (ctx.stop) return ctx;
  if (ctx.skillMatched) return ctx;

  const expectedOperatorText = buildOperationNeedText(ctx.skill);
  const usedOperatorText = formatBattleOperatorDisplay(ctx.operator || '?');
  const isDirectAttack = isDirectAttackSkill(ctx.skill);
  const enemyRuleId = getEnemyPrimaryRule(ctx.scene.enemy);
  const skillRuleId = getSkillPrimaryRule(ctx.skill);
  const isBeginner = getDifficultyKey(ctx.scene) === 'beginner';

  prependFeedback(ctx, 'failure', { outcome: 'failure', skill: ctx.skill.name });
  ctx.phases.push(...buildGuidedTeachingPhases(ctx, isBeginner ? 'This does not work. Try again.' : 'Wrong math sign. Action failed.'));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    getSkillTextTemplate(ctx.skill, 'fail', `${ctx.skill.name} failed.`).replace('{skill}', ctx.skill.name),
    { outcome: 'failure', skill: ctx.skill.name },
  ));

  if (expectedOperatorText) {
    ctx.phases.push(buildBattlePhaseLine(
      battleResultPhases.RESULT_SKILL_CHECK,
      `${ctx.skill.name} needs ${expectedOperatorText}. You used ${usedOperatorText}. Action failed.`,
      { outcome: 'failure', skill: ctx.skill.name, result: ctx.result, operator: usedOperatorText },
    ));
  } else if (isDirectAttack && skillRuleId && enemyRuleId && skillRuleId !== enemyRuleId) {
    ctx.phases.push(buildBattlePhaseLine(
      battleResultPhases.RESULT_SKILL_CHECK,
      buildWrongAttackTypeFeedback(ctx),
      { outcome: 'failure', skill: ctx.skill.name, result: ctx.result, enemy: ctx.scene.enemy.name },
    ));
    appendSafeSkillHintPhases(ctx);
  } else if (isDirectAttack && enemyRuleId) {
    ctx.phases.push(buildBattlePhaseLine(
      battleResultPhases.RESULT_SKILL_CHECK,
      buildEnemyRuleMismatchFeedback(ctx),
      { outcome: 'failure', skill: ctx.skill.name, result: ctx.result, enemy: ctx.scene.enemy.name },
    ));
    appendSafeSkillHintPhases(ctx);
  } else {
    const failureText = isBeginner
      ? `${ctx.skill.name} needs ${ctx.skillNeedText}. Your answer was ${ctx.result}. Try again.`
      : `${ctx.skill.name} needs ${ctx.skillNeedText}. Your answer was ${ctx.result}, which is ${ctx.resultTypeText}. Action failed.`;

    ctx.phases.push(buildBattlePhaseLine(
      battleResultPhases.RESULT_SKILL_CHECK,
      failureText,
      { outcome: 'failure', skill: ctx.skill.name, result: ctx.result },
    ));
  }

  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    getSkillTextTemplate(
      ctx.skill,
      'miss',
      ctx.skill.category === 'guard' ? getBattleSystemText('noGuard', 'No guard.') : getBattleSystemText('miss', 'Miss.'),
    ).replace('{skill}', ctx.skill.name),
    { outcome: 'failure', skill: ctx.skill.name },
  ));

  const failEffects = ctx.scene.applyTriggeredEffects(ctx.scene.enemy, 'on_player_skill_failed', {
    result: ctx.result,
    enemy: ctx.scene.enemy,
    skill: ctx.skill,
    operationType: ctx.operationType,
  });
  ctx.phases.push(...failEffects.messages.map((message) => buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, message, { outcome: 'failure' })));
  ctx.scene.addBattleLog(getBattleLogText('skillFailed', `${ctx.skill.name} failed.`, { skill: ctx.skill.name }));

  return markAndFinalize(ctx, 'failure', { enemyShouldAct: true });
}

export function guardSkillRule(ctx) {
  if (ctx.stop) return ctx;
  if (ctx.skill?.category !== 'guard') return ctx;

  const { messages } = ctx.scene.applySkillRuleEffects(ctx.skill, {
    result: ctx.result,
    enemy: ctx.scene.enemy,
    skill: ctx.skill,
    operationType: ctx.operationType,
  });

  prependFeedback(ctx, 'success', { outcome: 'full_success', skill: ctx.skill.name });
  ctx.phases.push(...buildGuidedTeachingPhases(ctx, 'Action succeeded.'));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    getSkillTextTemplate(ctx.skill, 'success', `${ctx.skill.name} works.`).replace('{skill}', ctx.skill.name),
    { outcome: 'full_success', skill: ctx.skill.name },
  ));
  ctx.phases.push(...(messages.length ? messages : [getSkillTextTemplate(ctx.skill, 'ready', getBattleSystemText('guardUp', 'Guard up.'))])
    .map((message) => buildBattlePhaseLine(battleResultPhases.RESULT_BUFF, message.replace('{skill}', ctx.skill.name), { outcome: 'full_success', skill: ctx.skill.name })));
  ctx.scene.addBattleLog(getBattleLogText('skillReady', `${ctx.skill.name} is ready.`, { skill: ctx.skill.name }));

  return markAndFinalize(ctx, 'full_success', { enemyShouldAct: true });
}

export function utilitySkillRule(ctx) {
  if (ctx.stop) return ctx;
  if (!isUtilitySkill(ctx.skill)) return ctx;

  const { messages } = ctx.scene.applySkillRuleEffects(ctx.skill, {
    result: ctx.result,
    enemy: ctx.scene.enemy,
    skill: ctx.skill,
    operationType: ctx.operationType,
  });

  prependFeedback(ctx, 'success', { outcome: 'full_success', skill: ctx.skill.name });
  ctx.phases.push(...buildGuidedUtilityTeachingPhases(ctx, 'Helper skill succeeded.'));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    getSkillTextTemplate(ctx.skill, 'success', `${ctx.skill.name} works.`).replace('{skill}', ctx.skill.name),
    { outcome: 'full_success', skill: ctx.skill.name },
  ));
  ctx.phases.push(...messages.map((message) => buildBattlePhaseLine(
    battleResultPhases.RESULT_BUFF,
    message,
    { outcome: 'full_success', skill: ctx.skill.name },
  )));
  ctx.scene.addBattleLog(getBattleLogText('skillReady', `${ctx.skill.name} is ready.`, { skill: ctx.skill.name }));

  return markAndFinalize(ctx, 'full_success', { enemyShouldAct: true });
}

export function enemyGateRule(ctx) {
  if (ctx.stop) return ctx;
  if (!isDirectAttackSkill(ctx.skill)) return ctx;
  if (ctx.enemyMatched) return ctx;

  const utilityEffectResult = ctx.scene.applySkillRuleEffects(ctx.skill, {
    result: ctx.result,
    enemy: ctx.scene.enemy,
    skill: ctx.skill,
    operationType: ctx.operationType,
  }, { utilityOnly: true });

  prependFeedback(ctx, 'ineffective', { outcome: 'partial_success', skill: ctx.skill.name });
  ctx.phases.push(...buildGuidedTeachingPhases(
    ctx,
    getDifficultyKey(ctx.scene) === 'beginner'
      ? `Not yet. Try ${getFriendlyRuleAnswerText(ctx.scene)}.`
      : 'Right skill type, but the answer did not match. Action failed.',
  ));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    getSkillTextTemplate(ctx.skill, 'success', `${ctx.skill.name} works.`).replace('{skill}', ctx.skill.name),
    { outcome: 'partial_success', skill: ctx.skill.name },
  ));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    buildEnemyRuleMismatchFeedback(ctx),
    { outcome: 'partial_success', enemy: ctx.scene.enemy.name, result: ctx.result },
  ));
  appendSafeSkillHintPhases(ctx);
  ctx.phases.push(...utilityEffectResult.messages.map((message) => buildBattlePhaseLine(
    battleResultPhases.RESULT_BUFF,
    message,
    { outcome: 'partial_success', skill: ctx.skill.name },
  )));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_DAMAGE,
    'No damage. 0 dealt.',
    { damage: 0, outcome: 'partial_success' },
  ));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_DAMAGE,
    getSkillTextTemplate(ctx.skill, 'blocked', getBattleSystemText('blocked', 'Blocked.')).replace('{skill}', ctx.skill.name),
    { damage: 0, outcome: 'partial_success' },
  ));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    getEntityUIText(ctx.scene.enemy, 'blockText', `${ctx.scene.enemy.name} blocked the attack.`),
    { outcome: 'partial_success', enemy: ctx.scene.enemy.name },
  ));

  const blockedEffects = ctx.scene.applyTriggeredEffects(ctx.scene.enemy, 'on_player_attack_blocked', {
    result: ctx.result,
    enemy: ctx.scene.enemy,
    skill: ctx.skill,
    operationType: ctx.operationType,
  });
  ctx.phases.push(...blockedEffects.messages.map((message) => buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, message, { outcome: 'partial_success' })));
  ctx.scene.addBattleLog(getBattleLogText('skillBlocked', `${ctx.skill.name} was blocked.`, { skill: ctx.skill.name }));

  ctx.damage = 0;
  return markAndFinalize(ctx, 'partial_success', { enemyShouldAct: true });
}

export function successDamageRule(ctx) {
  if (ctx.stop) return ctx;
  if (!isDirectAttackSkill(ctx.skill)) return ctx;

  const { messages, results } = ctx.scene.applySkillRuleEffects(ctx.skill, {
    result: ctx.result,
    enemy: ctx.scene.enemy,
    skill: ctx.skill,
    operationType: ctx.operationType,
  });

  const damageResult = results.find((entry) => entry?.type === 'damage_enemy' || typeof entry?.amount === 'number');
  ctx.damage = Number(damageResult?.amount) || 0;
  ctx.scene.successfulAttackCount += 1;

  prependFeedback(ctx, 'success', { outcome: 'full_success', skill: ctx.skill.name });
  ctx.phases.push(...buildGuidedTeachingPhases(ctx, 'Attack succeeded.'));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    getSkillTextTemplate(ctx.skill, 'success', `${ctx.skill.name} works.`).replace('{skill}', ctx.skill.name),
    { outcome: 'full_success', skill: ctx.skill.name },
  ));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    buildSuccessCategoryFeedback(ctx),
    { outcome: 'full_success', enemy: ctx.scene.enemy.name, result: ctx.result },
  ));
  ctx.phases.push(buildBattlePhaseLine(
    battleResultPhases.RESULT_DAMAGE,
    getSkillTextTemplate(ctx.skill, 'hit', 'Hit! {amount} damage.')
      .replace('{skill}', ctx.skill.name)
      .replace('{amount}', ctx.damage),
    { damage: ctx.damage, outcome: 'full_success', skill: ctx.skill.name },
  ));
  ctx.phases.push(...messages
    .filter((message) => message !== `Hit! ${ctx.damage} damage.`)
    .map((message) => buildBattlePhaseLine(battleResultPhases.RESULT_DAMAGE, message, { damage: ctx.damage, outcome: 'full_success' })));

  if (ctx.scene.getActiveAttackMultiplier() > 1) {
    ctx.phases.push(buildBattlePhaseLine(
      battleResultPhases.RESULT_BUFF,
      formatBattleTemplate(getBattleUIText('resultText.attackBuffActive', 'Power Potion: x{multiplier} damage.'), {
        multiplier: ctx.scene.getActiveAttackMultiplier().toFixed(1),
      }),
      { multiplier: ctx.scene.getActiveAttackMultiplier() },
    ));
  }

  if (ctx.scene.nextAttackBonus === 'double') {
    ctx.phases.push(buildBattlePhaseLine(
      battleResultPhases.RESULT_BUFF,
      getBattleUIText('resultText.nextAttackDouble', 'Bonus: double damage!'),
      { bonus: 'double' },
    ));
  }

  const onHitEffects = ctx.scene.applyTriggeredEffects(ctx.scene.enemy, 'on_player_attack_hit', {
    result: ctx.result,
    enemy: ctx.scene.enemy,
    skill: ctx.skill,
    operationType: ctx.operationType,
  });
  ctx.phases.push(...onHitEffects.messages.map((message) => buildBattlePhaseLine(battleResultPhases.RESULT_DAMAGE, message, { damage: ctx.damage, outcome: 'full_success' })));
  ctx.scene.addBattleLog(getBattleLogText('skillHit', `${ctx.skill.name} hit.`, { skill: ctx.skill.name }));
  ctx.scene.addBattleLog(getBattleLogText('playerDealtDamage', `Player dealt ${ctx.damage} damage.`, { amount: ctx.damage }));

  if (ctx.skill?.category === 'attack') {
    ctx.scene.consumeAttackBuffTurn();
  }

  ctx.activeBonus = ctx.scene.nextAttackBonus;
  ctx.scene.nextAttackBonus = null;
  return markAndFinalize(ctx, 'full_success');
}

export function finalizeAttackRule(ctx) {
  if (!ctx.finalResult) {
    ctx.finalResult = buildResult(ctx);
  }
  return ctx;
}

export function getDefaultAttackRules() {
  return [
    ['skill-usable', skillUsableRule],
    ['spend-skill-use', spendSkillUseRule],
    ['skill-condition', skillConditionRule],
    ['guard-skill', guardSkillRule],
    ['utility-skill', utilitySkillRule],
    ['enemy-gate', enemyGateRule],
    ['success-damage', successDamageRule],
    ['finalize', finalizeAttackRule],
  ];
}


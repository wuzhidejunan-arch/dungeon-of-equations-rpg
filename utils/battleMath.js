import { battleRules } from '../data/battleData.js';
import { checkBattleCondition } from './battleConditions.js';

export function normalizeOperator(operator) {
  if (operator === '?' || operator === '×' || operator === '*') return 'multiply';
  if (operator === '/' || operator === '÷') return 'divide';
  if (operator === '+') return 'add';
  if (operator === '-') return 'subtract';
  return 'unknown';
}

export function calculateExpressionValue(left, operator, right) {
  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '?' || operator === '×' || operator === '*') return left * right;
  if (operator === '/' || operator === '÷') {
    if (right === 0) return null;
    if (left % right !== 0) return null;
    return left / right;
  }
  return null;
}

export function isPrimeNumber(value) {
  if (!Number.isInteger(value) || value < 2) return false;
  for (let i = 2; i <= Math.sqrt(value); i += 1) {
    if (value % i === 0) return false;
  }
  return true;
}

export function getRuleConfig(ruleId) {
  return battleRules[ruleId] || null;
}

export function matchesRule(result, ruleId, context = {}) {
  const rule = getRuleConfig(ruleId);
  if (!rule?.condition) return false;
  return checkBattleCondition({ ...context, result }, rule.condition);
}

export function getResultProperties(result) {
  if (result === 0) return ['Zero'];

  const properties = [];
  if (matchesRule(result, 'odd')) {
    properties.push('Odd');
  } else if (matchesRule(result, 'even')) {
    properties.push('Even');
  }

  if (matchesRule(result, 'prime')) {
    properties.push('Prime');
  }

  return properties;
}

export function formatPropertyList(properties) {
  if (!properties || !properties.length) return 'unknown';
  if (properties.length === 1) return properties[0];
  if (properties.length === 2) return `${properties[0]} and ${properties[1]}`;
  return `${properties.slice(0, -1).join(', ')}, and ${properties[properties.length - 1]}`;
}

export function describeResultProperty(result) {
  return getResultProperties(result)[0] || 'Unknown';
}

function normalizeCandidateOperators(operators = null) {
  if (!Array.isArray(operators) || !operators.length) {
    return ['+', '-', '×', '÷'];
  }

  const allowed = new Set(operators);
  return ['+', '-', '×', '÷'].filter((operator) => allowed.has(operator));
}

function buildCandidateExpressions(values, operators = null) {
  const candidates = [];
  const allowedOperators = normalizeCandidateOperators(operators);

  for (let i = 0; i < values.length; i += 1) {
    for (let j = 0; j < values.length; j += 1) {
      if (i === j) continue;
      for (const operator of allowedOperators) {
        const result = calculateExpressionValue(values[i], operator, values[j]);
        if (result === null || Number.isNaN(result)) continue;
        candidates.push({ left: values[i], right: values[j], operator, result, operationType: normalizeOperator(operator) });
      }
    }
  }

  return candidates;
}

export function hasCombinationForCondition(values, condition, context = {}) {
  return buildCandidateExpressions(values, context.allowedOperators).some(({ result, operationType }) => checkBattleCondition({ ...context, result, operationType }, condition));
}

export function hasCombinationForRule(values, targetRule, context = {}) {
  if (targetRule === 'exact') {
    return hasCombinationForCondition(values, { type: 'result_rule', value: 'exact', target: context.target }, context);
  }
  if (targetRule === 'multipleOf') {
    return hasCombinationForCondition(values, { type: 'result_rule', value: 'multipleOf', divisor: context.divisor }, context);
  }

  const rule = getRuleConfig(targetRule);
  return Boolean(rule?.condition) && hasCombinationForCondition(values, rule.condition, context);
}

export function hasSuccessfulSkillCombination(values, skill, enemy = null, context = {}) {
  if (!skill?.condition) return false;

  return buildCandidateExpressions(values, context.allowedOperators).some(({ result, operationType }) => {
    const fullContext = { ...context, result, skill, enemy, operationType };
    const skillOk = checkBattleCondition(fullContext, skill.condition);
    if (!skillOk) return false;
    if (skill.category === 'guard' || skill.category === 'buff' || skill.category === 'debuff') return true;
    return checkBattleCondition(fullContext, { type: 'enemy_accepts_result' });
  });
}

export function countSuccessfulSkillResultOptions(values, skill, enemy = null, context = {}) {
  if (!skill?.condition) return 0;

  const results = new Set();

  buildCandidateExpressions(values, context.allowedOperators).forEach(({ result, operationType }) => {
    const fullContext = { ...context, result, skill, enemy, operationType };
    const skillOk = checkBattleCondition(fullContext, skill.condition);
    if (!skillOk) return;

    if (skill.category === 'guard' || skill.category === 'buff' || skill.category === 'debuff') {
      results.add(`${operationType}:${result}`);
      return;
    }

    if (checkBattleCondition(fullContext, { type: 'enemy_accepts_result' })) {
      results.add(`${operationType}:${result}`);
    }
  });

  return results.size;
}

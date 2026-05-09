import { battleResultPhases } from '../data/battlePhases.js';
import { battleFeedbackSpec } from '../data/battleFeedbackSpec.js';
import { formatBattleTemplate, getBattleUIText, getBattleSystemText } from '../utils/battleSchema.js';

export function buildBattlePhaseLine(phase, text, payload = {}) {
  return { phase, text, payload };
}

export function buildExpressionPhase(expression, result) {
  return buildBattlePhaseLine(battleResultPhases.RESULT_EXPRESSION, expression, { expression, result });
}

export function buildPropertyPhase(result, propertiesText, properties = []) {
  return buildBattlePhaseLine(
    battleResultPhases.RESULT_PROPERTY,
    formatBattleTemplate(getBattleUIText('resultText.resultProperties', '{result} is {properties}.'), {
      result,
      properties: String(propertiesText || ''),
    }),
    { result, properties },
  );
}

export function buildInfoPhase(text, payload = {}) {
  return buildBattlePhaseLine(battleResultPhases.INFO, text, payload);
}

export function buildSkillUsesLeftPhase(skillName, fallback) {
  return buildBattlePhaseLine(
    battleResultPhases.RESULT_SKILL_CHECK,
    getBattleSystemText('noUsesLeft', fallback, { skill: skillName || 'Skill' }),
    { outcome: 'failed', skill: skillName || 'Skill' },
  );
}


export function getFeedbackSpec(difficultyKey = 'beginner', outcomeKey = 'success') {
  const bucket = battleFeedbackSpec[difficultyKey] || battleFeedbackSpec.beginner;
  return bucket[outcomeKey] || battleFeedbackSpec.beginner[outcomeKey] || { label: '', detail: '' };
}

export function buildFeedbackPhases(difficultyKey = 'beginner', outcomeKey = 'success', payload = {}) {
  const spec = getFeedbackSpec(difficultyKey, outcomeKey);
  const lines = [];

  if (spec.label) {
    lines.push(buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, spec.label, { ...payload, feedbackOutcome: outcomeKey }));
  }

  if (spec.detail) {
    lines.push(buildBattlePhaseLine(battleResultPhases.RESULT_SKILL_CHECK, spec.detail, { ...payload, feedbackOutcome: outcomeKey }));
  }

  return lines;
}

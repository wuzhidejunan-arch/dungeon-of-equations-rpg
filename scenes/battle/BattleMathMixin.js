import {
  calculateExpressionValue,
  countSuccessfulSkillResultOptions,
  describeResultProperty,
  formatPropertyList,
  getResultProperties,
  getRuleConfig,
  hasCombinationForRule as hasCombinationForRuleInPool,
  hasSuccessfulSkillCombination as hasSuccessfulSkillCombinationInPool,
  isPrimeNumber,
  matchesRule,
  normalizeOperator,
} from '../../utils/battleMath.js';
import { checkEnemyRuleGate, checkSkillCondition } from '../../engine/checkConditions.js';
import { getBattleTutorialConfig, getTutorialStepKey } from '../../engine/tutorialFlowController.js';
import { getEnemyAcceptedRules, getEnemyRuleSummaryText, getSkillPrimaryRule, isDirectAttackSkill } from '../../utils/battleSchema.js';

export const BattleMathMixin = {
  normalizeChallengeBuilderOperator(operator) {
    if (operator === '?' || operator === '*' || operator === '×' || operator === 'x' || operator === 'X') {
      return '?';
    }
    if (operator === '/' || operator === '÷') {
      return '/';
    }
    return operator;
  },

  calculateExpression(left, operator, right) {
    return calculateExpressionValue(left, operator, right);
  },

  calculateChainedExpression(step1Left, step1Operator, step1Right, step2Operator, step2Right) {
    const normalizedStep1Operator = this.normalizeChallengeBuilderOperator(step1Operator);
    const normalizedStep2Operator = this.normalizeChallengeBuilderOperator(step2Operator);
    const step1Result = calculateExpressionValue(step1Left, normalizedStep1Operator, step1Right);
    if (step1Result === null || Number.isNaN(step1Result)) {
      return {
        step1Result: null,
        finalResult: null,
      };
    }

    const finalResult = calculateExpressionValue(step1Result, normalizedStep2Operator, step2Right);
    return {
      step1Result,
      finalResult: finalResult === null || Number.isNaN(finalResult) ? null : finalResult,
    };
  },

  validateChainedAttackInput(payload = {}) {
    const {
      step1Left,
      step1Operator,
      step1Right,
      step2Operator,
      step2Right,
      displayedStep1Result = null,
      displayedCarryResult = null,
    } = payload;

    const normalizedStep1Operator = this.normalizeChallengeBuilderOperator(step1Operator);
    const normalizedStep2Operator = this.normalizeChallengeBuilderOperator(step2Operator);

    if (!['?', '/'].includes(normalizedStep1Operator)) {
      return {
        success: false,
        code: 'invalid_step1_operator',
        message: 'Row 1 must use × or ÷.',
      };
    }

    if (!['+', '-'].includes(normalizedStep2Operator)) {
      return {
        success: false,
        code: 'invalid_step2_operator',
        message: 'Row 2 must use + or −.',
      };
    }

    const step1Result = calculateExpressionValue(step1Left, normalizedStep1Operator, step1Right);
    if (step1Result === null || Number.isNaN(step1Result)) {
      return {
        success: false,
        code: 'invalid_step1_result',
        message: 'Step 1 is not calculated correctly.',
      };
    }

    if (displayedStep1Result !== null && displayedStep1Result !== step1Result) {
      return {
        success: false,
        code: 'wrong_step1_display',
        message: 'The Row 1 answer is wrong.',
      };
    }

    if (displayedCarryResult !== null && displayedCarryResult !== step1Result) {
      return {
        success: false,
        code: 'wrong_carry_result',
        message: 'Use the Row 1 answer again in Row 2.',
        };
      }

    const finalResult = calculateExpressionValue(step1Result, normalizedStep2Operator, step2Right);
    if (finalResult === null || Number.isNaN(finalResult)) {
      return {
        success: false,
        code: 'invalid_step2_result',
        message: 'Step 2 is not calculated correctly.',
      };
    }

    return {
      success: true,
      code: 'challenge_chain_valid',
      message: 'This two-row answer works.',
      values: {
        step1Result,
        carriedResult: step1Result,
        finalResult,
      },
    };
  },

  validateChainedFinalResultAgainstEnemy(payload = {}) {
    const validation = this.validateChainedAttackInput(payload);
    if (!validation.success) {
      return validation;
    }

    const finalResult = validation.values?.finalResult ?? null;
    const step2Operator = this.normalizeChallengeBuilderOperator(payload.step2Operator ?? null);
    const matched = this.matchesEnemyRule(finalResult, this.selectedSkill || null, step2Operator);

    return {
      success: matched,
      code: matched ? 'challenge_final_rule_match' : 'challenge_final_rule_miss',
      message: matched
        ? `Your last answer matches the rule: ${finalResult}.`
        : `Your last answer does not match the rule: ${finalResult}.`,
      values: {
        ...validation.values,
        matchedEnemyRule: matched,
      },
    };
  },

  resolveChainedAttackOutcome(payload = {}) {
    const inputValidation = this.validateChainedAttackInput(payload);
    if (!inputValidation.success) {
      return {
        success: false,
        outcome: 'chain_invalid',
        code: inputValidation.code,
        message: `This two-row answer does not work. ${inputValidation.message}`,
        values: inputValidation.values || null,
      };
    }

    const finalRuleValidation = this.validateChainedFinalResultAgainstEnemy(payload);
    if (!finalRuleValidation.success) {
      return {
        success: false,
        outcome: 'rule_miss',
        code: finalRuleValidation.code,
        message: `Challenge attack does not work: ${finalRuleValidation.message}`,
        values: finalRuleValidation.values || null,
      };
    }

    return {
      success: true,
      outcome: 'rule_match',
      code: finalRuleValidation.code,
      message: `Challenge attack works: ${finalRuleValidation.message}`,
      values: finalRuleValidation.values || null,
    };
  },

  isPrimeNumber(value) {
    return isPrimeNumber(value);
  },

  getRuleConfig(ruleId) {
    return getRuleConfig(ruleId);
  },

  matchesRule(result, ruleId) {
    return matchesRule(result, ruleId);
  },

  getResultProperties(result) {
    return getResultProperties(result);
  },

  describeResultProperty(result) {
    return describeResultProperty(result);
  },

  formatPropertyList(properties) {
    return formatPropertyList(properties);
  },

  matchesSkillRule(result, skill, operator = null) {
    return checkSkillCondition(this, skill, { result, enemy: this.enemy, chain: this.successfulAttackCount, operationType: normalizeOperator(operator) });
  },

  getRuleLabel(targetRule) {
    return getRuleConfig(targetRule)?.label || 'Any';
  },

  getRuleShortText(targetRule) {
    return getRuleConfig(targetRule)?.shortText || 'Any result';
  },

  getRuleNeedText(targetRule) {
    return getRuleConfig(targetRule)?.needText || 'the right result';
  },

  getSkillGoalText(targetRule) {
    return getRuleConfig(targetRule)?.goalText || 'Make the right result.';
  },

  matchesEnemyRule(result, skill = null, operator = null) {
    return checkEnemyRuleGate(this, skill, this.enemy, { result, operationType: normalizeOperator(operator) });
  },

  generateTurnNumbers() {
    if (this.builderMode === 'chained') {
      return [
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
      ];
    }

    const tutorialConfig = this.isTrainingGuideBattle?.() ? getBattleTutorialConfig(this) : null;
    const tutorialStepKey = tutorialConfig ? getTutorialStepKey(this) : null;
    const guidedTurnNumbers = tutorialStepKey ? tutorialConfig?.turnNumberSets?.[tutorialStepKey] : null;

    if (Array.isArray(guidedTurnNumbers) && guidedTurnNumbers.length) {
      return [...guidedTurnNumbers];
    }

    const isIntermediate = this.difficultyKey === 'intermediate';
    const targetSkill = this.selectedSkill || this.playerSkills?.[0] || null;
    const maxAttempts = Math.max(1, Number(this.builderMaxGenerationAttempts) || 300);
    let fallbackValues = isIntermediate ? null : [0, 0, 1, 2];
    let attempts = 0;

    while (true) {
      attempts += 1;
      const values = [
        Phaser.Math.Between(0, 9),
        Phaser.Math.Between(0, 9),
        Phaser.Math.Between(0, 9),
        Phaser.Math.Between(0, 9),
      ];

      const allowedOperators = Array.isArray(this.availableOperators) ? this.availableOperators : null;
      const sharedContext = {
        chain: this.successfulAttackCount,
        allowedOperators,
      };

      if (!isIntermediate) {
        const selectedSkillPossible = targetSkill
          ? hasSuccessfulSkillCombinationInPool(values, targetSkill, this.enemy, sharedContext)
          : this.hasMatchingAttackCombination(values);

        if (selectedSkillPossible) {
          return values;
        }

        if (attempts >= maxAttempts) {
          return fallbackValues || values;
        }

        continue;
      }

      const attackSkills = (this.playerSkills || []).filter((skill) => isDirectAttackSkill(skill));
      const attackOptionCount = attackSkills.reduce(
        (total, skill) => total + countSuccessfulSkillResultOptions(values, skill, this.enemy, sharedContext),
        0,
      );

      if (attackOptionCount >= 1 && attackOptionCount <= 2) {
        return values;
      }

      if (!fallbackValues && attackOptionCount >= 1) {
        fallbackValues = values;
      }

      if (attempts >= maxAttempts) {
        return fallbackValues || values;
      }
    }
  },

  getEnemyAllowedRules() {
    return getEnemyAcceptedRules(this.enemy);
  },

  getEnemyRuleSummary() {
    return getEnemyRuleSummaryText(this.enemy);
  },

  skillCanAffectEnemy(skill) {
    if (!skill) return false;
    if (!isDirectAttackSkill(skill)) return true;
    return this.getEnemyAllowedRules().includes(getSkillPrimaryRule(skill));
  },

  hasCombinationForRule(values, targetRule) {
    return hasCombinationForRuleInPool(values, targetRule);
  },

  hasMatchingAttackCombination(values) {
    const allowedOperators = Array.isArray(this.availableOperators) ? this.availableOperators : null;
    return Array.isArray(this.enemy?.rules) && this.enemy.rules.some((rule) => (
      rule?.type === 'accept_result_rule'
        ? hasCombinationForRuleInPool(values, rule.value, { allowedOperators, target: rule.target, divisor: rule.divisor })
        : false
    ));
  },

  hasSuccessfulSkillCombination(values, skill) {
    const allowedOperators = Array.isArray(this.availableOperators) ? this.availableOperators : null;
    return hasSuccessfulSkillCombinationInPool(values, skill, this.enemy, {
      chain: this.successfulAttackCount,
      allowedOperators,
    });
  },
};

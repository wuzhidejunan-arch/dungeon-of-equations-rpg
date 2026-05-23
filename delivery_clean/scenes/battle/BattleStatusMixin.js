import {
  applyBattleEffect,
  applySkillEffects,
  applyTriggeredEffects,
  resolveDamageFromFormula,
} from '../../engine/applyEffects.js';
import { formatBattleTemplate, getBattleUIText, getSkillPrimaryRule } from '../../utils/battleSchema.js';
import { persistBattleSkillLoadout } from '../../utils/playerSkills.js';

export const BattleStatusMixin = {
  getStatusCharge(statusKey) {
    return this.statusCharges[statusKey] || 0;
  },

  addStatusCharge(statusKey, amount = 1, max = null) {
    const current = this.getStatusCharge(statusKey);
    const nextValue = current + amount;
    this.statusCharges[statusKey] = max === null ? nextValue : Math.min(nextValue, max);
    return this.statusCharges[statusKey];
  },

  consumeStatusCharge(statusKey, amount = 1) {
    const current = this.getStatusCharge(statusKey);
    const nextValue = Math.max(current - amount, 0);
    this.statusCharges[statusKey] = nextValue;
    return nextValue;
  },

  applyEffect(effect, context = {}, options = {}) {
    // Canonical path for live battle scenes: use the controller-owned effect system.
    if (this.battleController?.effectSystem) {
      return this.battleController.effectSystem.apply(effect, context, options);
    }

    // Fallback retained for legacy helper-based flows that can still reach this mixin without
    // a fully initialized battle controller.
    return applyBattleEffect(this, effect, context, options);
  },

  spendSkillUse(skill) {
    if (!skill || skill.maxPp === null) {
      return;
    }

    skill.pp = Math.max(skill.pp - 1, 0);

    if (Array.isArray(this.playerSkills)) {
      persistBattleSkillLoadout(this.playerSkills);
    }
  },

  applySkillRuleEffects(skill, context = {}, options = {}) {
    // Canonical path for live battle scenes: use the controller-owned effect system.
    if (this.battleController?.effectSystem) {
      return this.battleController.effectSystem.applySkillEffects(skill, context, options);
    }

    return applySkillEffects(this, skill, context);
  },

  applyTriggeredEffects(entity, trigger, context = {}, options = {}) {
    // Canonical path for live battle scenes: use the controller-owned effect system.
    if (this.battleController?.effectSystem) {
      return this.battleController.effectSystem.applyTriggeredEffects(entity, trigger, context, options);
    }

    return applyTriggeredEffects(this, entity, trigger, context, options);
  },

  calculateSkillDamage(skill) {
    return resolveDamageFromFormula(this, skill?.damageFormula || { type: 'flat', base: 0 });
  },

  classifyAttackFailure(result, usedSkill) {
    if (!usedSkill) return 'normal';

    const ruleId = getSkillPrimaryRule(usedSkill);

    if (ruleId === 'odd' || ruleId === 'even') {
      return 'normal';
    }

    if (ruleId === 'prime' && result === 1) {
      return 'normal';
    }

    return 'clear';
  },

  getSkillFailureReason(result, propertiesText, usedSkill) {
    const skillName = usedSkill?.name || 'This move';
    return formatBattleTemplate(getBattleUIText('resultText.skillFailedBecause', '{result} is {properties}, so {skill} failed.'), {
      result,
      properties: propertiesText.toLowerCase(),
      skill: skillName,
    });
  },
};

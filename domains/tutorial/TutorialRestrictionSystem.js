import { createTutorialRestrictionContext } from './tutorialRestrictionRules.js';

export class TutorialRestrictionSystem {
  constructor({ ruleRegistry, helpers = {} } = {}) {
    this.ruleRegistry = ruleRegistry || null;
    this.helpers = helpers;
  }

  evaluate(payload = {}) {
    const ctx = createTutorialRestrictionContext({
      ...payload,
      formatter: this.helpers.formatter,
      requiredSkillName: this.helpers.getRequiredSkillName?.(payload.scene),
      requiredRuleLabel: this.helpers.getRequiredRuleLabel?.(payload.scene),
    });
    const rules = this.ruleRegistry?.getAll?.() || [];

    for (const rule of rules) {
      if (typeof rule === 'function') {
        rule(ctx);
      }
      if (ctx.stop) break;
    }

    return ctx.result;
  }
}

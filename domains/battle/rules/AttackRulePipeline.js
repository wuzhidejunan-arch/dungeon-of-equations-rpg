import { createAttackRuleContext, getDefaultAttackRules } from './attackRules.js';

export class AttackRulePipeline {
  constructor({ ruleRegistry } = {}) {
    this.ruleRegistry = ruleRegistry || null;
  }

  run(scene, payload = {}) {
    const ctx = createAttackRuleContext(scene, payload);
    const rules = this.ruleRegistry?.getAll?.() || getDefaultAttackRules().map(([, handler]) => handler);

    for (const rule of rules) {
      if (typeof rule === 'function') {
        rule(ctx);
      }
      if (ctx.stop && ctx.finalResult) {
        break;
      }
    }

    return ctx.finalResult;
  }
}

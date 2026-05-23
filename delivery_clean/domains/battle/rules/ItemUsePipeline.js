import { createItemUseRuleContext, getDefaultItemUseRules } from './itemUseRules.js';

export class ItemUsePipeline {
  constructor({ ruleRegistry } = {}) {
    this.ruleRegistry = ruleRegistry || null;
  }

  run(scene, payload = {}) {
    const ctx = createItemUseRuleContext(scene, payload);
    const rules = this.ruleRegistry?.getAll?.() || getDefaultItemUseRules().map(([, handler]) => handler);

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

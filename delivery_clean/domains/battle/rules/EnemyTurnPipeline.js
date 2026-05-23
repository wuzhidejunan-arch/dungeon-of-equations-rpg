import { createEnemyTurnRuleContext, getDefaultEnemyTurnRules } from './enemyTurnRules.js';

export class EnemyTurnPipeline {
  constructor({ ruleRegistry } = {}) {
    this.ruleRegistry = ruleRegistry || null;
  }

  run(scene, payload = {}) {
    const ctx = createEnemyTurnRuleContext(scene, payload);
    const rules = this.ruleRegistry?.getAll?.() || getDefaultEnemyTurnRules().map(([, handler]) => handler);

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

import { AttackRulePipeline } from '../rules/AttackRulePipeline.js';

export class BattleAttackSystem {
  constructor({ scene, registries = {} }) {
    this.scene = scene;
    this.registries = registries;
    this.pipeline = new AttackRulePipeline({
      ruleRegistry: registries.attackRuleRegistry || null,
    });
  }

  resolve(payload = {}) {
    return this.pipeline.run(this.scene, payload);
  }
}

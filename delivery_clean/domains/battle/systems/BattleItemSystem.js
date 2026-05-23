import { ItemUsePipeline } from '../rules/ItemUsePipeline.js';

export class BattleItemSystem {
  constructor({ scene, registries = {} }) {
    this.scene = scene;
    this.registries = registries;
    this.pipeline = new ItemUsePipeline({
      ruleRegistry: registries.itemUseRuleRegistry || null,
    });
  }

  resolve(payload = {}) {
    return this.pipeline.run(this.scene, payload);
  }
}

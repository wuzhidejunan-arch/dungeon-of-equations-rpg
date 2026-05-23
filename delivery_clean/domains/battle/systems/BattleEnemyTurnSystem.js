import { EnemyTurnPipeline } from '../rules/EnemyTurnPipeline.js';
import { chooseEnemySkill } from '../rules/enemyTurnRules.js';

export class BattleEnemyTurnSystem {
  constructor({ scene, registries = {} }) {
    this.scene = scene;
    this.registries = registries;
    this.pipeline = new EnemyTurnPipeline({
      ruleRegistry: registries.enemyTurnRuleRegistry || null,
    });
  }

  chooseSkill() {
    return chooseEnemySkill(this.scene);
  }

  resolve(payload = {}) {
    return this.pipeline.run(this.scene, payload);
  }
}


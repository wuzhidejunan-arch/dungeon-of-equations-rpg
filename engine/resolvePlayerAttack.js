import { BattleAttackSystem } from '../domains/battle/systems/BattleAttackSystem.js';

export function resolvePlayerAttack(scene, { skill, result, expression, operator = null, operationType = null }) {
  const appRegistries = scene?.game?.app?.container?.get?.('battleRegistries') || window?.gameApp?.container?.get?.('battleRegistries') || {};
  const attackSystem = new BattleAttackSystem({ scene, registries: appRegistries });
  return attackSystem.resolve({ skill, result, expression, operator, operationType });
}

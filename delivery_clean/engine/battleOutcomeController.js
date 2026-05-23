import { BattleOutcomeSystem } from '../domains/battle/systems/BattleOutcomeSystem.js';

function getOutcomeSystem(scene) {
  return scene?.battleController?.outcomeSystem || new BattleOutcomeSystem({ scene, controller: scene?.battleController || null });
}

export function resolveEnemyTurnOutcome(scene, activeBonus = null) {
  return getOutcomeSystem(scene).resolveEnemyTurnOutcome(activeBonus);
}

export function playEnemyTurnSequence(scene, playerLines = [], activeBonus = null, options = {}) {
  return getOutcomeSystem(scene).playEnemyTurnSequence(playerLines, activeBonus, options);
}

export function resolveAttack(scene, result, expression, operator = null) {
  return getOutcomeSystem(scene).resolveAttack(result, expression, operator);
}

export function winBattle(scene) {
  return getOutcomeSystem(scene).winBattle();
}

export function loseBattle(scene) {
  return getOutcomeSystem(scene).loseBattle();
}

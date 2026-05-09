import { BattleStore } from '../domains/battle/BattleStore.js';
import { createBattleState, DEFAULT_BATTLE_ACCESSORS } from '../domains/battle/BattleStateFactory.js';
import { getCurrentDifficultyKey } from '../config/difficultySettings.js';

export function createBattleSessionState(scene, data = {}) {
  return createBattleState(scene, data);
}

export function bindBattleSessionAccessors(scene, store, mapping = DEFAULT_BATTLE_ACCESSORS) {
  store.bindScene(scene, mapping);
}

export function initializeBattleSession(scene, data = {}) {
  scene.difficultyKey = data.difficultyKey || getCurrentDifficultyKey();
  const battleSession = createBattleSessionState(scene, data);
  const battleStore = new BattleStore(battleSession);

  scene.battleSession = battleSession;
  scene.battleStore = battleStore;
  bindBattleSessionAccessors(scene, battleStore);

  return battleSession;
}

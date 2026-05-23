import {
  applyDifficultyStateToPlayerData,
  createDefaultSaveRoot,
  extractDifficultyStateFromPlayerData,
  getDifficultyState,
} from './playerStateSlots.js';

let runtimeSaveRoot = null;

function getActiveDifficultyKey(targetPlayerData) {
  return targetPlayerData?.difficulty || 'beginner';
}

function ensureRuntimeSaveRoot(targetPlayerData) {
  if (!runtimeSaveRoot) {
    runtimeSaveRoot = createDefaultSaveRoot();
  }

  const activeDifficulty = getActiveDifficultyKey(targetPlayerData);
  runtimeSaveRoot.currentDifficulty = activeDifficulty;
  return runtimeSaveRoot;
}

export function getRuntimeDifficultyState(difficultyKey, targetPlayerData) {
  const activeDifficulty = getActiveDifficultyKey(targetPlayerData);
  const targetDifficulty = difficultyKey || activeDifficulty;

  if (targetDifficulty === activeDifficulty) {
    return extractDifficultyStateFromPlayerData(targetPlayerData);
  }

  const saveRoot = ensureRuntimeSaveRoot(targetPlayerData);
  return getDifficultyState(saveRoot, targetDifficulty);
}

export function saveCurrentRuntimeDifficultySlot(targetPlayerData) {
  const activeDifficulty = getActiveDifficultyKey(targetPlayerData);
  const saveRoot = ensureRuntimeSaveRoot(targetPlayerData);

  saveRoot.currentDifficulty = activeDifficulty;
  saveRoot.difficulties[activeDifficulty] = extractDifficultyStateFromPlayerData(targetPlayerData);

  return {
    difficultyKey: activeDifficulty,
    slotState: saveRoot.difficulties[activeDifficulty],
    saveRoot,
  };
}

export function switchRuntimeDifficultySlot(targetPlayerData, difficultyKey) {
  const previousDifficulty = getActiveDifficultyKey(targetPlayerData);
  const nextDifficulty = difficultyKey || previousDifficulty;
  const saveRoot = ensureRuntimeSaveRoot(targetPlayerData);

  saveRoot.currentDifficulty = previousDifficulty;
  saveRoot.difficulties[previousDifficulty] = extractDifficultyStateFromPlayerData(targetPlayerData);

  const nextState = getDifficultyState(saveRoot, nextDifficulty);
  applyDifficultyStateToPlayerData(targetPlayerData, nextState, nextDifficulty);
  saveRoot.currentDifficulty = nextDifficulty;

  return {
    previousDifficulty,
    currentDifficulty: nextDifficulty,
    slotState: nextState,
    saveRoot,
  };
}

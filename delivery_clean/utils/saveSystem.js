import { playerData } from "../data/playerData.js";
import { ensurePlayerSkillState } from "./playerSkills.js";
import { ensureLevelState } from "./levelSystem.js";
import { ensureTrainingState } from "./trainingSystem.js";
import { ensureGuideState } from "./guideSystem.js";
import {
  applyDifficultyStateToPlayerData,
  createDefaultDifficultyState,
  createDefaultSaveRoot,
  ensureSaveRootShape,
  extractDifficultyStateFromPlayerData,
  getDifficultyState,
} from "./playerStateSlots.js";

const LEGACY_SAVE_KEY = "naic_game_save";
const SAVE_ROOT_KEY = "naic_game_save_root";

// Legacy flat save helpers remain for compatibility with the current runtime playerData flow.
// Startup auto-load is intentionally not enabled yet; browser refresh should still act as a clean reset.
export function saveGame() {
  ensurePlayerSkillState();
  ensureLevelState();
  ensureTrainingState();
  ensureGuideState();
  localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(playerData));
}

export function loadGame() {
  const saveData = localStorage.getItem(LEGACY_SAVE_KEY);

  if (!saveData) return;

  const parsedData = JSON.parse(saveData);

  Object.assign(playerData, parsedData);
  ensurePlayerSkillState();
  ensureLevelState();
  ensureTrainingState();
  ensureGuideState();
}

// Future nested save-root helpers for per-difficulty save slots.
// These helpers only read/write localStorage data and do not apply into runtime playerData automatically.
export function saveRoot(saveRootData) {
  const normalizedRoot = ensureSaveRootShape(saveRootData);
  localStorage.setItem(SAVE_ROOT_KEY, JSON.stringify(normalizedRoot));
  return normalizedRoot;
}

export function loadSaveRoot() {
  const saveData = localStorage.getItem(SAVE_ROOT_KEY);

  if (!saveData) {
    return createDefaultSaveRoot();
  }

  try {
    const parsedData = JSON.parse(saveData);
    return ensureSaveRootShape(parsedData);
  } catch {
    return createDefaultSaveRoot();
  }
}

export function hasSaveRoot() {
  return Boolean(localStorage.getItem(SAVE_ROOT_KEY));
}

export function migrateFlatPlayerDataToSaveRoot(sourcePlayerData = playerData, difficultyKey = null) {
  const activeDifficulty = difficultyKey || sourcePlayerData?.difficulty || "beginner";
  const saveRoot = createDefaultSaveRoot();

  saveRoot.currentDifficulty = activeDifficulty;
  saveRoot.difficulties[activeDifficulty] = extractDifficultyStateFromPlayerData({
    ...sourcePlayerData,
    difficulty: activeDifficulty,
  });

  return ensureSaveRootShape(saveRoot);
}

export function clearSaveRoot() {
  localStorage.removeItem(SAVE_ROOT_KEY);
}

export function clearSave() {
  localStorage.removeItem(LEGACY_SAVE_KEY);
}

// Development/manual helpers for future per-difficulty slot testing.
// These are intentionally not wired into startup, scene flow, UI, or keyboard shortcuts yet.
export function saveCurrentDifficultySlot(sourcePlayerData = playerData) {
  const currentDifficulty = sourcePlayerData?.difficulty || "beginner";
  const rootData = loadSaveRoot();

  rootData.currentDifficulty = currentDifficulty;
  rootData.difficulties[currentDifficulty] = extractDifficultyStateFromPlayerData(sourcePlayerData);

  return saveRoot(rootData);
}

export function loadCurrentDifficultySlot(targetPlayerData = playerData, difficultyKey = null) {
  const targetDifficulty = difficultyKey || targetPlayerData?.difficulty || "beginner";
  const rootData = loadSaveRoot();
  const slotState = getDifficultyState(rootData, targetDifficulty);

  applyDifficultyStateToPlayerData(targetPlayerData, slotState, targetDifficulty);

  return {
    success: true,
    difficultyKey: targetDifficulty,
    slotState,
    saveRoot: rootData,
  };
}

export function clearLegacySaveOnly() {
  clearSave();
}

export function clearRootSaveOnly() {
  clearSaveRoot();
}

export function clearAllSaves() {
  clearSave();
  clearSaveRoot();
}

export function resetDifficultySlot(difficultyKey = "beginner") {
  const targetDifficulty = difficultyKey || "beginner";
  const rootData = loadSaveRoot();

  rootData.difficulties[targetDifficulty] = createDefaultDifficultyState(targetDifficulty);

  if (rootData.currentDifficulty !== "beginner" && !rootData.difficulties[rootData.currentDifficulty]) {
    rootData.currentDifficulty = "beginner";
  }

  return saveRoot(rootData);
}

export function resetAllDifficultySlots() {
  return saveRoot(createDefaultSaveRoot());
}

export function getDebugSaveSnapshot() {
  const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
  const rootRaw = localStorage.getItem(SAVE_ROOT_KEY);

  let legacyData = null;
  let rootData = null;

  try {
    legacyData = legacyRaw ? JSON.parse(legacyRaw) : null;
  } catch {
    legacyData = null;
  }

  try {
    rootData = rootRaw ? ensureSaveRootShape(JSON.parse(rootRaw)) : null;
  } catch {
    rootData = null;
  }

  return {
    keys: {
      legacy: LEGACY_SAVE_KEY,
      root: SAVE_ROOT_KEY,
    },
    hasLegacySave: Boolean(legacyRaw),
    hasRootSave: Boolean(rootRaw),
    legacyData,
    rootData,
  };
}

export function logDebugSaveSnapshot() {
  const snapshot = getDebugSaveSnapshot();
  console.log("Save Debug Snapshot", snapshot);
  return snapshot;
}

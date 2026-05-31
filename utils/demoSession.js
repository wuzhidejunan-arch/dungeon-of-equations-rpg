import { playerData } from '../data/playerData.js';

const DEMO_STORAGE_KEYS = Object.freeze([
  'naic_game_save',
  'naic_game_save_root',
]);

let demoSessionSnapshot = null;

function deepClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function getStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

function snapshotStorage() {
  const storage = getStorage();

  return DEMO_STORAGE_KEYS.map((key) => {
    const value = storage ? storage.getItem(key) : null;
    return {
      key,
      existed: value !== null,
      value,
    };
  });
}

function restoreStorage(storageSnapshot) {
  const storage = getStorage();
  if (!storage) return;

  storageSnapshot.forEach(({ key, existed, value }) => {
    if (existed) {
      storage.setItem(key, value);
      return;
    }

    storage.removeItem(key);
  });
}

export function beginDemoSession(targetPlayerData = playerData) {
  if (demoSessionSnapshot) {
    return demoSessionSnapshot;
  }

  demoSessionSnapshot = {
    playerData: deepClone(targetPlayerData),
    storage: snapshotStorage(),
  };

  return demoSessionSnapshot;
}

export function isDemoSessionActive() {
  return demoSessionSnapshot !== null;
}

export function restoreDemoSession(targetPlayerData = playerData) {
  if (!demoSessionSnapshot) {
    return false;
  }

  const playerDataSnapshot = deepClone(demoSessionSnapshot.playerData);
  Object.keys(targetPlayerData || {}).forEach((key) => {
    delete targetPlayerData[key];
  });
  Object.assign(targetPlayerData, playerDataSnapshot);

  restoreStorage(demoSessionSnapshot.storage);
  demoSessionSnapshot = null;
  return true;
}

export function clearDemoSession() {
  demoSessionSnapshot = null;
}

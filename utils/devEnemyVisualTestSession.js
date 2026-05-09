// Temporary dev/test-only battle state snapshot helpers.
// These keep enemy visual test battles from changing the player's real session progress.

let devEnemyVisualTestSnapshot = null;

function deepClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function beginDevEnemyVisualTestSession(targetPlayerData) {
  devEnemyVisualTestSnapshot = deepClone(targetPlayerData);
  return devEnemyVisualTestSnapshot;
}

export function isDevEnemyVisualTestActive() {
  return devEnemyVisualTestSnapshot !== null;
}

export function restoreDevEnemyVisualTestSession(targetPlayerData) {
  if (!devEnemyVisualTestSnapshot) {
    return false;
  }

  const snapshot = deepClone(devEnemyVisualTestSnapshot);
  Object.keys(targetPlayerData || {}).forEach((key) => {
    delete targetPlayerData[key];
  });
  Object.assign(targetPlayerData, snapshot);
  devEnemyVisualTestSnapshot = null;
  return true;
}

export function clearDevEnemyVisualTestSession() {
  devEnemyVisualTestSnapshot = null;
}

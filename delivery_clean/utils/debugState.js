export const debugState = {
  testerMode: false,
  testerItemQuantity: 100,
};

export function isTesterMode() {
  return debugState.testerMode === true;
}

export function getTesterItemQuantity() {
  return Number.isFinite(debugState.testerItemQuantity)
    ? Math.max(1, Math.floor(debugState.testerItemQuantity))
    : 100;
}

export function setTesterMode(enabled) {
  debugState.testerMode = enabled === true;
  return debugState.testerMode;
}

export function toggleTesterMode() {
  debugState.testerMode = !debugState.testerMode;
  return debugState.testerMode;
}

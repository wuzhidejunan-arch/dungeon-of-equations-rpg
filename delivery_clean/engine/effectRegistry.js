export function createEffectRegistry() {
  const handlers = new Map();

  return {
    register(type, handler) {
      handlers.set(type, handler);
      return this;
    },
    get(type) {
      return handlers.get(type) || null;
    },
    has(type) {
      return handlers.has(type);
    },
  };
}

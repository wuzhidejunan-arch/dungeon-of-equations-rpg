class BattleFeatureContext {
  constructor({ scene = null, controller = null, store = null, app = null } = {}) {
    this.scene = scene;
    this.controller = controller;
    this.store = store;
    this.app = app;
    this.stop = false;
    this.handled = false;
    this.value = undefined;
    this.shared = new Map();
  }

  set(key, value) {
    this.shared.set(key, value);
    return value;
  }

  get(key) {
    return this.shared.get(key);
  }

  markHandled(value = undefined) {
    this.handled = true;
    this.value = value;
    return value;
  }

  stopPropagation(value = this.value) {
    this.stop = true;
    this.value = value;
    return value;
  }
}

export class BattleFeatureRegistry {
  constructor() {
    this.features = [];
  }

  register(feature) {
    if (!feature?.id) {
      throw new Error('Battle feature must include an id.');
    }

    this.features.push(feature);
    this.features.sort((a, b) => (a.order || 0) - (b.order || 0));
    return feature;
  }

  getAll() {
    return [...this.features];
  }

  createContext(options = {}) {
    return new BattleFeatureContext(options);
  }

  runHook(hookName, context, payload = {}) {
    for (const feature of this.features) {
      const hook = feature?.hooks?.[hookName];
      if (typeof hook !== 'function') continue;

      hook({ context, payload, feature });
      if (context.stop) break;
    }

    return context.value;
  }
}

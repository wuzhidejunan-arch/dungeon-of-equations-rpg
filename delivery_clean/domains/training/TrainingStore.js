function getNestedValue(target, path) {
  return path.reduce((current, key) => current?.[key], target);
}

function setNestedValue(target, path, value) {
  const parent = path.slice(0, -1).reduce((current, key) => current[key], target);
  parent[path[path.length - 1]] = value;
}

export class TrainingStore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  get(path) {
    return getNestedValue(this.state, path);
  }

  set(path, value) {
    setNestedValue(this.state, path, value);
    this.notify({ type: 'set', path, value });
    return value;
  }

  patch(mutator, meta = { type: 'patch' }) {
    if (typeof mutator === 'function') {
      mutator(this.state);
      this.notify(meta);
    }
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(meta = {}) {
    for (const listener of [...this.listeners]) {
      listener(this.state, meta);
    }
  }

  bindScene(scene, mapping = {}) {
    Object.entries(mapping).forEach(([propertyName, path]) => {
      Object.defineProperty(scene, propertyName, {
        configurable: true,
        enumerable: true,
        get: () => this.get(path),
        set: (value) => {
          this.set(path, value);
        },
      });
    });
  }
}

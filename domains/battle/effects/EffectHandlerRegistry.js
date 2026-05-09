export class EffectHandlerRegistry {
  constructor(entries = []) {
    this.map = new Map(entries);
  }

  register(type, handler) {
    this.map.set(type, handler);
    return this;
  }

  get(type) {
    return this.map.get(type) || null;
  }

  has(type) {
    return this.map.has(type);
  }

  getAll() {
    return [...this.map.entries()];
  }
}

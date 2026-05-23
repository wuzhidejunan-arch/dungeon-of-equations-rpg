export class RuleRegistry {
  constructor(entries = []) {
    this.map = new Map(entries);
  }

  register(id, value) {
    this.map.set(id, value);
    return this;
  }

  get(id) {
    return this.map.get(id) || null;
  }

  has(id) {
    return this.map.has(id);
  }

  getAll() {
    return [...this.map.values()];
  }
}

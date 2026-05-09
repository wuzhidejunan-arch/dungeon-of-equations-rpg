export class ServiceContainer {
  constructor() {
    this.services = new Map();
    this.factories = new Map();
  }

  register(name, value) {
    this.services.set(name, value);
    return value;
  }

  registerFactory(name, factory) {
    this.factories.set(name, factory);
    return factory;
  }

  get(name) {
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    if (this.factories.has(name)) {
      const created = this.factories.get(name)(this);
      this.services.set(name, created);
      return created;
    }

    return null;
  }

  has(name) {
    return this.services.has(name) || this.factories.has(name);
  }
}

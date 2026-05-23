export class ModuleRegistry {
  constructor({ container, eventBus }) {
    this.container = container;
    this.eventBus = eventBus;
    this.modules = new Map();
  }

  register(moduleDefinition) {
    if (!moduleDefinition?.id) {
      throw new Error('Module must include an id.');
    }

    this.modules.set(moduleDefinition.id, moduleDefinition);
    return moduleDefinition;
  }

  installAll(context = {}) {
    const installed = new Set();
    const stack = new Set();

    const installModule = (moduleDefinition) => {
      if (!moduleDefinition?.id || installed.has(moduleDefinition.id)) return;
      if (stack.has(moduleDefinition.id)) {
        throw new Error(`Circular module dependency detected: ${moduleDefinition.id}`);
      }

      stack.add(moduleDefinition.id);
      const dependencies = Array.isArray(moduleDefinition.dependsOn) ? moduleDefinition.dependsOn : [];
      dependencies.forEach((dependencyId) => installModule(this.get(dependencyId)));

      if (typeof moduleDefinition.install === 'function') {
        moduleDefinition.install({
          container: this.container,
          eventBus: this.eventBus,
          registry: this,
          ...context,
        });
      }

      stack.delete(moduleDefinition.id);
      installed.add(moduleDefinition.id);
    };

    for (const moduleDefinition of this.modules.values()) {
      installModule(moduleDefinition);
    }
  }

  get(id) {
    return this.modules.get(id) || null;
  }
}

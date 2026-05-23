import { EventBus } from './EventBus.js';
import { ServiceContainer } from './ServiceContainer.js';
import { ModuleRegistry } from './ModuleRegistry.js';

export class GameApp {
  constructor() {
    this.eventBus = new EventBus();
    this.container = new ServiceContainer();
    this.moduleRegistry = new ModuleRegistry({
      container: this.container,
      eventBus: this.eventBus,
    });

    this.container.register('eventBus', this.eventBus);
    this.container.register('moduleRegistry', this.moduleRegistry);
    this.container.register('gameApp', this);
  }

  registerModule(moduleDefinition) {
    this.moduleRegistry.register(moduleDefinition);
    return this;
  }

  boot(context = {}) {
    this.moduleRegistry.installAll(context);
    return this;
  }
}

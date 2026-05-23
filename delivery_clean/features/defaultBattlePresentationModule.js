import { createBattlePresentationSuite } from '../domains/battle/presentation/createBattlePresentationSuite.js';

export const defaultBattlePresentationModule = {
  id: 'default-battle-presentation-module',
  install({ container }) {
    if (!container.has('battlePresentationFactory')) {
      container.register('battlePresentationFactory', {
        createForScene(scene) {
          return createBattlePresentationSuite({ scene });
        },
      });
    }
  },
};

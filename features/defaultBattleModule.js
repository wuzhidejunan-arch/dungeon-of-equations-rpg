import { createBattleRegistries } from '../domains/battle/BattleRegistries.js';

export const defaultBattleModule = {
  id: 'default-battle-module',
  install({ container }) {
    if (!container.has('battleRegistries')) {
      container.register('battleRegistries', createBattleRegistries());
    }
  },
};

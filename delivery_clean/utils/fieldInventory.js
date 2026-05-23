import { consumeItem } from './inventory.js';
import { saveGame } from './saveSystem.js';
import { getUnlockedPlayerSkillDefinitions } from './playerSkills.js';

export function useFieldItem(scene, itemName, options = {}) {
  const result = consumeItem(itemName, {
    scene,
    skills: getUnlockedPlayerSkillDefinitions(),
    targetSkillId: options.targetSkillId || null,
  });

  if (result.success) {
    if (typeof scene?.updateStatusUI === 'function') {
      scene.updateStatusUI();
    }
    if (typeof scene?.onFieldItemUsed === 'function') {
      scene.onFieldItemUsed(result, itemName);
    }
    saveGame();
  }

  return result;
}

export function createFieldInventoryContext(scene, options = {}) {
  return {
    returnScene: scene?.scene?.key || null,
    mode: options.mode || 'field',
    useItem(itemName, options = {}) {
      return useFieldItem(scene, itemName, options);
    },
    onClose() {
      if (typeof scene?.onInventoryClosed === 'function') {
        scene.onInventoryClosed();
      }
    },
  };
}

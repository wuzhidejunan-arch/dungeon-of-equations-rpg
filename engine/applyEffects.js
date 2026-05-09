import { createBattleRegistries } from '../domains/battle/BattleRegistries.js';
import { BattleEffectSystem } from '../domains/battle/systems/BattleEffectSystem.js';
import { resolveDamageFromFormula } from '../domains/battle/effects/effectUtils.js';

let fallbackSystem = null;

function getEffectSystem(scene) {
  // Canonical path: live battles should use the controller-owned effect system so effect
  // handling stays aligned with the registered battle systems.
  if (scene?.battleController?.effectSystem) {
    return scene.battleController.effectSystem;
  }

  // Compatibility fallback: some legacy helper calls still apply effects without a controller.
  // Keep this adapter until those call sites are fully routed through BattleController.
  if (!fallbackSystem) {
    fallbackSystem = new BattleEffectSystem({
      scene,
      registries: createBattleRegistries(),
    });
  }

  if (fallbackSystem.scene !== scene) {
    fallbackSystem.scene = scene;
  }

  return fallbackSystem;
}

export { resolveDamageFromFormula };

export function applyBattleEffect(scene, effect, context = {}, options = {}) {
  return getEffectSystem(scene).apply(effect, context, options);
}

export function applyEffectList(scene, effects = [], context = {}, options = {}) {
  return getEffectSystem(scene).applyList(effects, context, options);
}

export function applySkillEffects(scene, skill, context = {}) {
  return getEffectSystem(scene).applySkillEffects(skill, context);
}

export function applyTriggeredEffects(scene, entity, trigger, context = {}, options = {}) {
  return getEffectSystem(scene).applyTriggeredEffects(entity, trigger, context, options);
}

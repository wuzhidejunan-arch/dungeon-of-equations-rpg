import { playerData } from '../../../data/playerData.js';
import { getBattleSystemText } from '../../../utils/battleSchema.js';

export function resolveDamageFromFormula(scene, formula = {}, context = {}) {
  const formulaType = formula?.type || 'flat';
  let damage = 0;

  if (formulaType === 'flat') {
    damage = Number(formula.base || 0);
  } else if (formulaType === 'enemy_attack') {
    damage = Number(context.enemy?.attack ?? scene.enemy?.attack ?? formula.base ?? 0);

    const enemyAttackMultiplier = typeof scene.getActiveEnemyAttackMultiplier === 'function'
      ? scene.getActiveEnemyAttackMultiplier()
      : 1;
    if (enemyAttackMultiplier < 1) {
      damage *= enemyAttackMultiplier;
    }
  } else if (formulaType === 'base_plus_chain') {
    damage = Number(formula.base || 0) + ((Number(context.chain ?? scene.successfulAttackCount) || 0) * (Number(formula.chainScale) || 0));
  } else if (formulaType === 'result_based') {
    const result = Number(context.result || 0);
    damage = Math.abs(result) * (Number(formula.multiplier) || 1);
    if (Number.isFinite(formula.min)) damage = Math.max(damage, Number(formula.min));
    if (Number.isFinite(formula.max)) damage = Math.min(damage, Number(formula.max));
  } else {
    damage = Number(formula.base || 0);
  }

  if (formula.applyAttackBuff && scene.getActiveAttackMultiplier() > 1) {
    damage *= scene.getActiveAttackMultiplier();
  }

  const defenseMultiplier = typeof scene.getEnemyDefenseMultiplier === 'function'
    ? scene.getEnemyDefenseMultiplier()
    : 1;

  const enemyBattleModifiers = context.enemy?.battleModifiers ?? scene.enemy?.battleModifiers ?? {};
  const defenseDownActive = Boolean(scene.enemyTimedDebuffs?.defenseDown?.turns > 0);
  let innateDefenseMultiplier = Number(enemyBattleModifiers.defenseMultiplier ?? 1);

  if (enemyBattleModifiers.requireArmorBreak && !defenseDownActive) {
    innateDefenseMultiplier *= Number(enemyBattleModifiers.defenseLockMultiplier ?? 0.05);
  }
  if (defenseMultiplier > 0 && defenseMultiplier !== 1) {
    damage /= defenseMultiplier;
  }
  if (innateDefenseMultiplier > 0 && innateDefenseMultiplier !== 1) {
    damage *= innateDefenseMultiplier;
  }

  if (formula.applyNextAttackBonus && scene.nextAttackBonus === 'double') {
    damage *= 2;
  }

  return Math.max(0, Math.round(damage));
}

export function getDefaultMessage(type, amount) {
  if (type === 'damage_enemy') return getBattleSystemText('damageEnemy', `Hit! ${amount} damage.`, { amount });
  if (type === 'damage_player') return getBattleSystemText('damagePlayer', `$You took {amount} damage.`, { amount });
  return '';
}

export function formatTemplate(template, values = {}) {
  if (typeof template !== 'string' || !template) return '';
  return template.replace(/\{(\w+)\}/g, (_, key) => `${values[key] ?? ''}`);
}

export function buildEffectContext(scene, context = {}) {
  return {
    scene,
    player: context.player || playerData,
    enemy: context.enemy || scene.enemy,
    enemyCurrentHp: context.enemyCurrentHp ?? scene.enemyCurrentHp,
    chain: context.chain ?? scene.successfulAttackCount,
    activeBonus: context.activeBonus ?? scene.nextAttackBonus,
    ...context,
  };
}

import { checkBattleCondition } from '../utils/battleConditions.js';
import { getEnemyAcceptedRules, getSkillPrimaryRule } from '../utils/battleSchema.js';

export function checkSkillCondition(scene, skill, context = {}) {
  if (!skill?.condition) return false;
  return checkBattleCondition(
    {
      scene,
      enemy: context.enemy || scene.enemy,
      player: context.player || scene.playerState,
      chain: context.chain ?? scene.successfulAttackCount,
      result: context.result,
      skill,
      ...context,
    },
    skill.condition,
  );
}

export function checkEnemyRuleGate(scene, skill, enemy = scene.enemy, context = {}) {
  const allowedRules = getEnemyAcceptedRules(enemy);
  if (!allowedRules.length) return true;

  return checkBattleCondition(
    {
      scene,
      enemy,
      player: context.player || scene.playerState,
      chain: context.chain ?? scene.successfulAttackCount,
      result: context.result,
      skill,
      operationType: context.operationType || null,
      ...context,
    },
    { type: 'enemy_accepts_result' },
  );
}

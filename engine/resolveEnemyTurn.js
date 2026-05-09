import { playerData } from '../data/playerData.js';
import { battleResultPhases } from '../data/battlePhases.js';
import { applyEffectList } from './applyEffects.js';
import { formatBattleTemplate, getBattleLogText, getBattleUIText, getEnemySkills, getEntityUIText } from '../utils/battleSchema.js';

export function chooseEnemySkill(scene) {
  const skills = getEnemySkills(scene.enemy).length
    ? getEnemySkills(scene.enemy)
    : [{
      id: 'rule_hit',
      name: 'Rule Hit',
      chance: 100,
      effects: [{ type: 'damage_player', formula: { type: 'enemy_attack', base: scene.enemy.attack } }],
    }];

  const roll = Phaser.Math.Between(1, 100);
  let cumulativeChance = 0;

  for (const skill of skills) {
    cumulativeChance += skill.chance;
    if (roll <= cumulativeChance) {
      return skill;
    }
  }

  return skills[skills.length - 1];
}

// Legacy compatibility resolver. Normal live battles should go through
// BattleController -> BattleEnemyTurnSystem -> EnemyTurnPipeline. This implementation stays
// in place because older helper entry points can still call `resolveEnemyTurn(scene, ...)`
// without a fully wired controller.
function resolveEnemyTurnLegacy(scene, { activeBonus = null } = {}) {
  const enemySkill = chooseEnemySkill(scene);
  const { results } = applyEffectList(scene, enemySkill.effects || [], {
    enemy: scene.enemy,
    player: playerData,
    skill: enemySkill,
    allowZeroGuard: true,
    allowGuardBonus: activeBonus === 'guard',
    activeBonus,
  });

  const damageResult = results.find((entry) => entry?.type === 'damage_player' || typeof entry?.amount === 'number') || { amount: 0, blocked: false };
  const damage = Number(damageResult.amount) || 0;

  let line = formatBattleTemplate(
    getEntityUIText(enemySkill, 'resultText', getBattleUIText('resultText.enemyUsedSkill', '{enemy} used {skill} and dealt {amount} damage.')),
    { enemy: scene.enemy.name, skill: enemySkill.name, amount: damage },
  );

  if (damageResult.blocked) {
    line = formatBattleTemplate(getBattleUIText('resultText.enemyAttackBlocked', 'Blocked! {enemy} used {skill}, but you took no damage.'), {
      enemy: scene.enemy.name,
      skill: enemySkill.name,
    });
    scene.addBattleLog(activeBonus === 'guard'
      ? getBattleLogText('enemyAttackBlockedByGuard', 'Bonus guard blocked the enemy attack.')
      : getBattleLogText('enemyAttackBlockedByZeroGuard', 'Zero Guard blocked the enemy attack.'));
  }

  scene.addBattleLog(getBattleLogText('enemyUsedSkill', `${scene.enemy.name} used ${enemySkill.name}.`, { enemy: scene.enemy.name, skill: enemySkill.name }));
  if (damage > 0) {
    scene.addBattleLog(getBattleLogText('enemyDealtDamage', `${scene.enemy.name} dealt ${damage} damage.`, { enemy: scene.enemy.name, amount: damage }));
  }

  return {
    skill: enemySkill,
    damage,
    blocked: Boolean(damageResult.blocked),
    line,
    phases: [
      {
        phase: battleResultPhases.ENEMY_TURN,
        text: line,
        payload: { enemy: scene.enemy.name, skill: enemySkill.name, damage, blocked: Boolean(damageResult.blocked) },
      },
    ],
  };
}

export function resolveEnemyTurn(scene, options = {}) {
  // Canonical path: defer to the controller-owned enemy turn system when it exists.
  const controllerOutcome = scene?.battleController?.enemyTurnSystem?.resolve?.(options);
  if (controllerOutcome) {
    return controllerOutcome;
  }
  // Compatibility fallback for legacy callers and lightweight scene contexts.
  return resolveEnemyTurnLegacy(scene, options);
}

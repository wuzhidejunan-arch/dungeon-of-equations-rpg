import { playerData } from '../../../data/playerData.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import { applyEffectList } from '../../../engine/applyEffects.js';
import { formatBattleTemplate, getBattleLogText, getBattleUIText, getEnemySkills, getEntityUIText } from '../../../utils/battleSchema.js';

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

export function createEnemyTurnRuleContext(scene, payload = {}) {
  return {
    scene,
    payload,
    activeBonus: payload.activeBonus ?? null,
    enemySkill: null,
    effectResult: null,
    damageResult: { amount: 0, blocked: false },
    damage: 0,
    blocked: false,
    line: '',
    phases: [],
    stop: false,
    finalResult: null,
  };
}

export function skipTrainingDummyTurnRule(ctx) {
  if (ctx.stop || !ctx.scene.enemy?.isTrainingDummy) return ctx;

  const line = formatBattleTemplate(
    getEntityUIText(ctx.scene.enemy, 'waitText', '{enemy} waits and lets you practice.'),
    { enemy: ctx.scene.enemy.name },
  );

  ctx.line = line;
  ctx.damage = 0;
  ctx.blocked = false;
  ctx.phases = [{
    phase: battleResultPhases.ENEMY_TURN,
    text: line,
    payload: { enemy: ctx.scene.enemy.name, skill: null, damage: 0, blocked: false },
  }];
  ctx.scene.addBattleLog(line);
  ctx.finalResult = {
    skill: null,
    damage: 0,
    blocked: false,
    line,
    phases: ctx.phases,
  };
  ctx.stop = true;
  return ctx;
}

export function selectEnemySkillRule(ctx) {
  if (ctx.stop) return ctx;
  ctx.enemySkill = chooseEnemySkill(ctx.scene);
  return ctx;
}

export function applyEnemyEffectsRule(ctx) {
  if (ctx.stop) return ctx;

  const guardBonusActive = ctx.activeBonus === 'guard' || ctx.scene.nextAttackBonus === 'guard';
  ctx.effectResult = applyEffectList(ctx.scene, ctx.enemySkill.effects || [], {
    enemy: ctx.scene.enemy,
    player: playerData,
    skill: ctx.enemySkill,
    allowZeroGuard: true,
    allowGuardBonus: guardBonusActive,
    activeBonus: ctx.activeBonus || (ctx.scene.nextAttackBonus === 'guard' ? 'guard' : null),
  });

  ctx.damageResult = ctx.effectResult.results.find((entry) => entry?.type === 'damage_player' || typeof entry?.amount === 'number') || { amount: 0, blocked: false };
  ctx.damage = Number(ctx.damageResult.amount) || 0;
  ctx.blocked = Boolean(ctx.damageResult.blocked);
  if (ctx.damageResult.blockSource === 'guardBonus') {
    ctx.activeBonus = 'guard';
  }
  return ctx;
}

export function formatEnemyTurnRule(ctx) {
  if (ctx.stop) return ctx;

  ctx.line = formatBattleTemplate(
    getEntityUIText(ctx.enemySkill, 'resultText', getBattleUIText('resultText.enemyUsedSkill', '{enemy} used {skill}. You took {amount} damage.')),
    { enemy: ctx.scene.enemy.name, skill: ctx.enemySkill.name, amount: ctx.damage },
  );

  if (ctx.blocked) {
    ctx.line = formatBattleTemplate(getBattleUIText('resultText.enemyAttackBlocked', 'Blocked! {enemy} used {skill}, but you took no damage.'), {
      enemy: ctx.scene.enemy.name,
      skill: ctx.enemySkill.name,
    });
  }

  ctx.phases = [{
    phase: battleResultPhases.ENEMY_TURN,
    text: ctx.line,
    payload: { enemy: ctx.scene.enemy.name, skill: ctx.enemySkill.name, damage: ctx.damage, blocked: ctx.blocked },
  }];

  return ctx;
}

export function finalizeEnemyTurnRule(ctx) {
  if (ctx.stop) return ctx;

  if (ctx.blocked) {
    ctx.scene.addBattleLog(ctx.activeBonus === 'guard'
      ? getBattleLogText('enemyAttackBlockedByGuard', 'Bonus guard blocked the monster attack.')
      : getBattleLogText('enemyAttackBlockedByZeroGuard', 'Zero Guard blocked the monster attack.'));
  }

  ctx.scene.addBattleLog(getBattleLogText('enemyUsedSkill', `${ctx.scene.enemy.name} used ${ctx.enemySkill.name}.`, {
    enemy: ctx.scene.enemy.name,
    skill: ctx.enemySkill.name,
  }));

  if (ctx.damage > 0) {
    ctx.scene.addBattleLog(getBattleLogText('enemyDealtDamage', `${ctx.scene.enemy.name} dealt ${ctx.damage} damage.`, {
      enemy: ctx.scene.enemy.name,
      amount: ctx.damage,
    }));
  }

  ctx.finalResult = {
    skill: ctx.enemySkill,
    damage: ctx.damage,
    blocked: ctx.blocked,
    line: ctx.line,
    phases: ctx.phases,
  };
  ctx.stop = true;
  return ctx;
}

export function getDefaultEnemyTurnRules() {
  return [
    ['skipTrainingDummyTurn', skipTrainingDummyTurnRule],
    ['selectEnemySkill', selectEnemySkillRule],
    ['applyEnemyEffects', applyEnemyEffectsRule],
    ['formatEnemyTurn', formatEnemyTurnRule],
    ['finalizeEnemyTurn', finalizeEnemyTurnRule],
  ];
}

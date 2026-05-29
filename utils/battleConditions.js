import { isPrimeNumber } from './battleMath.js';

function normalizeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getTimedBuff(context, buffKey) {
  return context.scene?.timedBuffs?.[buffKey]
    || context.player?.timedBuffs?.[buffKey]
    || null;
}

function getEnemyTimedDebuff(context, debuffKey) {
  return context.scene?.enemyTimedDebuffs?.[debuffKey]
    || context.enemy?.timedDebuffs?.[debuffKey]
    || null;
}

function getStatusCharge(context, statusKey) {
  if (typeof context.scene?.getStatusCharge === 'function') {
    return context.scene.getStatusCharge(statusKey);
  }
  return normalizeNumber(context.statusCharges?.[statusKey], 0);
}

export function checkBattleCondition(context, condition) {
  if (!condition) return true;

  if (Array.isArray(condition.all)) {
    return condition.all.every((entry) => checkBattleCondition(context, entry));
  }

  if (Array.isArray(condition.any)) {
    return condition.any.some((entry) => checkBattleCondition(context, entry));
  }

  if (condition.not) {
    return !checkBattleCondition(context, condition.not);
  }

  const {
    result,
    chain = 0,
    enemy = null,
    skill = null,
    player = null,
    scene = null,
    operationType = context.operationType || null,
  } = context;

  switch (condition.type) {
    case 'result_rule':
      if (condition.value === 'zero') return result === 0;
      if (condition.value === 'even') return result !== 0 && result % 2 === 0;
      if (condition.value === 'odd') return Math.abs(result % 2) === 1;
      if (condition.value === 'prime') return isPrimeNumber(result);
      if (condition.value === 'exact') return normalizeNumber(result, NaN) === normalizeNumber(condition.target, NaN);
      if (condition.value === 'multipleOf') {
        const divisor = normalizeNumber(condition.divisor, NaN);
        return Number.isInteger(result) && result !== 0 && Number.isFinite(divisor) && divisor !== 0 && result % divisor === 0;
      }
      return false;

    case 'result_at_least':
      return normalizeNumber(result, Number.NEGATIVE_INFINITY) >= normalizeNumber(condition.value);

    case 'result_at_most':
      return normalizeNumber(result, Number.POSITIVE_INFINITY) <= normalizeNumber(condition.value);

    case 'result_equals':
      return normalizeNumber(result, NaN) === normalizeNumber(condition.value, NaN);

    case 'chain_at_least':
      return chain >= normalizeNumber(condition.value || 0);

    case 'chain_at_most':
      return chain <= normalizeNumber(condition.value || 0);

    case 'accept_result_rule':
      return checkBattleCondition(context, { ...condition, type: 'result_rule' });

    case 'enemy_accepts_result':
      return Array.isArray(enemy?.rules) && enemy.rules.some((rule) => checkBattleCondition(context, rule));

    case 'operation_is':
      return operationType === condition.value;

    case 'skill_category':
      return skill?.category === condition.value;

    case 'skill_id':
      return skill?.id === condition.value;

    case 'enemy_rule_is':
      return Array.isArray(enemy?.rules) && enemy.rules.some((rule) => rule?.type === 'accept_result_rule' && rule?.value === condition.value);

    case 'player_hp_at_most':
      return normalizeNumber(player?.hp, Number.POSITIVE_INFINITY) <= normalizeNumber(condition.value);

    case 'player_hp_at_least':
      return normalizeNumber(player?.hp, Number.NEGATIVE_INFINITY) >= normalizeNumber(condition.value);

    case 'enemy_hp_at_most':
      return normalizeNumber(context.enemyCurrentHp ?? enemy?.hp, Number.POSITIVE_INFINITY) <= normalizeNumber(condition.value);

    case 'enemy_hp_at_least':
      return normalizeNumber(context.enemyCurrentHp ?? enemy?.hp, Number.NEGATIVE_INFINITY) >= normalizeNumber(condition.value);

    case 'has_next_bonus':
      return (context.activeBonus ?? scene?.nextAttackBonus ?? null) === condition.value;

    case 'status_charge_at_least':
      return getStatusCharge(context, condition.status) >= normalizeNumber(condition.value, 1);

    case 'buff_active': {
      const buff = getTimedBuff(context, condition.buff);
      return normalizeNumber(buff?.turns, 0) > 0;
    }

    case 'enemy_debuff_active': {
      const debuff = getEnemyTimedDebuff(context, condition.debuff);
      return normalizeNumber(debuff?.turns, 0) > 0;
    }

    case 'enemy_debuff_inactive': {
      const debuff = getEnemyTimedDebuff(context, condition.debuff);
      return normalizeNumber(debuff?.turns, 0) <= 0;
    }

    default:
      return false;
  }
}

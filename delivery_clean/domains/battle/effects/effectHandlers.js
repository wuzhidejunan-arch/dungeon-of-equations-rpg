import { checkBattleCondition } from '../../../utils/battleConditions.js';
import { getBattleSystemText } from '../../../utils/battleSchema.js';
import { EffectHandlerRegistry } from './EffectHandlerRegistry.js';
import { formatTemplate, getDefaultMessage, resolveDamageFromFormula } from './effectUtils.js';

function resolveDamageEnemyEffect(scene, effect, fullContext, options = {}) {
  const isPreview = Boolean(options.preview);
  const amount = resolveDamageFromFormula(scene, effect.formula || {}, fullContext);

  if (!isPreview) {
    scene.enemyCurrentHp = Math.max(scene.enemyCurrentHp - amount, 0);
  }

  return {
    type: effect.type,
    success: true,
    amount,
    message: formatTemplate(effect.message, { amount }) || getDefaultMessage(effect.type, amount),
  };
}

function resolveDamagePlayerEffect(scene, effect, fullContext, options = {}) {
  const isPreview = Boolean(options.preview);
  const player = fullContext.player;
  const baseAmount = resolveDamageFromFormula(scene, effect.formula || {}, fullContext);
  let amount = baseAmount;
  let blocked = false;

  if (!isPreview && fullContext.allowZeroGuard !== false && scene.getStatusCharge('zeroGuard') > 0) {
    scene.consumeStatusCharge('zeroGuard', 1);
    amount = 0;
    blocked = true;
  }

  if (!blocked && fullContext.allowGuardBonus && (fullContext.activeBonus === 'guard' || scene.nextAttackBonus === 'guard')) {
    amount = 0;
    blocked = true;
  }

  if (!blocked) {
    const defenseMultiplier = scene.getActiveDefenseMultiplier();
    if (defenseMultiplier <= 0) {
      amount = 0;
      blocked = true;
    } else if (defenseMultiplier < 1) {
      amount = Math.max(0, Math.round(amount * defenseMultiplier));
    }
    if (!isPreview) {
      player.hp = Math.max(player.hp - amount, 0);
    }
  }

  return {
    type: effect.type,
    success: true,
    amount,
    blocked,
    message: blocked
      ? formatTemplate(effect.blockedMessage, { amount }) || 'Blocked the hit.'
      : formatTemplate(effect.message, { amount }) || getDefaultMessage(effect.type, amount),
  };
}

function resolveHealEnemyEffect(scene, effect, _fullContext, options = {}) {
  const isPreview = Boolean(options.preview);
  const amount = Number(effect.amount) || 0;
  const beforeHp = scene.enemyCurrentHp;
  const nextHp = Math.min(beforeHp + amount, scene.enemy.hp);
  const actualHeal = nextHp - beforeHp;

  if (!isPreview) {
    scene.enemyCurrentHp = nextHp;
  }

  return {
    type: effect.type,
    success: true,
    amount: actualHeal,
    message: formatTemplate(effect.message, { amount: actualHeal }) || getBattleSystemText('healEnemy', `${scene.enemy.name} recovered ${actualHeal} HP.`, { enemy: scene.enemy.name, amount: actualHeal }),
  };
}

function resolveStatusChargeEffect(scene, effect, _fullContext, options = {}) {
  const isPreview = Boolean(options.preview);

  if (isPreview) {
    return {
      type: effect.type,
      success: true,
      message: effect.status === 'zeroGuard' ? getBattleSystemText('guardUp', 'Guard up.') : `${effect.status} ready.`,
    };
  }

  const total = scene.addStatusCharge(effect.status, effect.amount || 1, effect.max ?? null);
  return {
    type: effect.type,
    success: true,
    amount: total,
    message: formatTemplate(effect.message, { total }) || (effect.status === 'zeroGuard' && total > 0 ? getBattleSystemText('guardUp', 'Guard up.') : `${effect.status} ready.`),
  };
}

function resolveSkillUseRestoreEffect(scene, effect, fullContext, options = {}) {
  const isPreview = Boolean(options.preview);
  const skills = fullContext.skills || scene.playerSkills;
  let targetSkill = null;

  if (effect.mode === 'target') {
    targetSkill = skills.find((skill) => skill.id === fullContext.targetSkillId) || null;
    if (!targetSkill) {
      return { type: effect.type, success: false, message: getBattleSystemText('chooseSkillFirst', 'Choose one skill first.') };
    }
  } else {
    const candidates = skills.filter((skill) => skill.maxPp !== null && skill.pp < skill.maxPp);
    targetSkill = candidates[0] || null;
  }

  if (!targetSkill || targetSkill.maxPp === null) {
    return { type: effect.type, success: false, message: getBattleSystemText('skillCannotRecover', 'This skill cannot recover uses.') };
  }

  if (targetSkill.pp >= targetSkill.maxPp) {
    return { type: effect.type, success: false, message: getBattleSystemText('skillAlreadyFull', `${targetSkill.name} is already full.`, { skill: targetSkill.name }) };
  }

  const nextPp = effect.amount === 'full'
    ? targetSkill.maxPp
    : Math.min(targetSkill.pp + (Number(effect.amount) || 0), targetSkill.maxPp);
  const actualRestore = nextPp - targetSkill.pp;

  if (!isPreview) {
    targetSkill.pp = nextPp;
  }

  return {
    type: effect.type,
    success: true,
    amount: actualRestore,
    message: effect.amount === 'full'
      ? getBattleSystemText('skillFullyRestored', `${targetSkill.name} is fully restored.`, { skill: targetSkill.name })
      : getBattleSystemText('skillRecoveredUses', `${targetSkill.name} recovered ${actualRestore} uses.`, { skill: targetSkill.name, amount: actualRestore }),
  };
}

function resolveTimedBuffEffect(scene, effect, _fullContext, options = {}) {
  const isPreview = Boolean(options.preview);
  const buffKey = effect.buff || 'attackBoost';
  const nextTurns = Number(effect.turns) || 0;
  const parsedMultiplier = Number(effect.multiplier);
  const nextMultiplier = Number.isNaN(parsedMultiplier) ? 1 : parsedMultiplier;

  if (!isPreview) {
    scene.timedBuffs[buffKey] = { turns: nextTurns, multiplier: nextMultiplier };
  }

  if (buffKey === 'attackBoost') {
    return {
      type: effect.type,
      success: true,
      message: formatTemplate(effect.message, { multiplier: nextMultiplier.toFixed(1), turns: nextTurns }) || getBattleSystemText('attackUp', `Attack up! x${nextMultiplier.toFixed(1)} damage for ${nextTurns} turns.`, { multiplier: nextMultiplier.toFixed(1), turns: nextTurns }),
    };
  }

  if (buffKey === 'defenseBoost') {
    const reductionPercent = Math.round((1 - nextMultiplier) * 100);
    return {
      type: effect.type,
      success: true,
      message: formatTemplate(effect.message, { reduction: reductionPercent, turns: nextTurns }) || getBattleSystemText('defenseUp', `Defense up! ${reductionPercent}% less damage for ${nextTurns} turns.`, { reduction: reductionPercent, turns: nextTurns }),
    };
  }

  return { type: effect.type, success: true, message: effect.message || getBattleSystemText('buffActive', `${buffKey} is active.`, { buff: buffKey }) };
}


function resolveTimedEnemyDebuffEffect(scene, effect, _fullContext, options = {}) {
  const isPreview = Boolean(options.preview);
  const debuffKey = effect.debuff || 'defenseDown';
  const nextTurns = Number(effect.turns) || 0;
  const parsedMultiplier = Number(effect.multiplier);
  const nextMultiplier = Number.isNaN(parsedMultiplier) ? 1 : parsedMultiplier;

  if (!isPreview) {
    scene.enemyTimedDebuffs[debuffKey] = { turns: nextTurns, multiplier: nextMultiplier };
  }

  return {
    type: effect.type,
    success: true,
    message: formatTemplate(effect.message, { multiplier: nextMultiplier.toFixed(1), turns: nextTurns }) || getBattleSystemText('debuffActive', `${debuffKey} is active.`, { debuff: debuffKey }),
  };
}

export function getDefaultEffectHandlers() {
  const registry = new EffectHandlerRegistry();

  registry
    .register('damage_enemy', resolveDamageEnemyEffect)
    .register('damage_player', resolveDamagePlayerEffect)
    .register('heal_enemy', resolveHealEnemyEffect)
    .register('addStatusCharge', resolveStatusChargeEffect)
    .register('setNextAttackBonus', (scene, effect, _fullContext, options = {}) => {
      if (!options.preview) {
        scene.nextAttackBonus = effect.bonus || null;
      }
      return { type: effect.type, success: true, message: effect.message || '' };
    })
    .register('clearNextAttackBonus', (scene, effect, _fullContext, options = {}) => {
      if (!options.preview) {
        scene.nextAttackBonus = null;
      }
      return { type: effect.type, success: true, message: effect.message || '' };
    })
    .register('healHp', (scene, effect, fullContext, options = {}) => {
      const player = fullContext.player || scene.getPlayerBattleState();
      const healAmount = effect.amount || 0;
      const beforeHp = player.hp;
      const nextHp = Math.min(beforeHp + healAmount, player.maxHp);
      const actualHeal = nextHp - beforeHp;

      if (!options.preview) {
        player.hp = nextHp;
      }

      return {
        type: effect.type,
        success: true,
        amount: actualHeal,
        message: formatTemplate(effect.message, { amount: actualHeal }) || getBattleSystemText('healPotion', `Used Potion. Recovered ${actualHeal} HP.`, { amount: actualHeal }),
      };
    })
    .register('restoreSkillUses', resolveSkillUseRestoreEffect)
    .register('addTimedBuff', resolveTimedBuffEffect)
    .register('addTimedEnemyDebuff', resolveTimedEnemyDebuffEffect)
    .register('addChainCount', (scene, effect, _fullContext, options = {}) => {
      const amount = Number(effect.amount) || 0;
      const chainConfig = scene.getChainConfig();
      const nextChain = Math.min(scene.successfulAttackCount + amount, chainConfig.maxCount);

      if (!options.preview) {
        scene.successfulAttackCount = nextChain;
      }

      return {
        type: effect.type,
        success: true,
        amount,
        message: formatTemplate(effect.message, { amount, chain: nextChain }) || getBattleSystemText('chainPlus', `Chain +${amount}.`, { amount, chain: nextChain }),
      };
    })
    .register('setChainCount', (scene, effect, _fullContext, options = {}) => {
      const nextChain = Math.max(0, Number(effect.amount) || 0);
      if (!options.preview) {
        scene.successfulAttackCount = nextChain;
      }
      return { type: effect.type, success: true, amount: nextChain, message: effect.message || '' };
    })
    .register('message', (_scene, effect, fullContext) => ({
      type: effect.type,
      success: true,
      message: formatTemplate(effect.text || effect.message, fullContext) || '',
    }));

  return registry;
}

export function shouldApplyEffect(effect, fullContext) {
  if (!effect?.condition) return true;
  return checkBattleCondition(fullContext, effect.condition);
}

export function isConditionalEffect(effect) {
  return effect?.type === 'conditional_effects';
}

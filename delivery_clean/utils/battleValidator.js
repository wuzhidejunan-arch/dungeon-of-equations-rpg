import { itemDefinitions, playerSkillDefinitions } from '../data/battleData.js';
import { enemyData } from '../data/enemyData.js';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function pushError(errors, scope, message) {
  errors.push(`[${scope}] ${message}`);
}

function validateEffect(effect, scope, errors) {
  if (!isObject(effect)) {
    pushError(errors, scope, 'effect must be an object.');
    return;
  }

  if (typeof effect.type !== 'string' || !effect.type) {
    pushError(errors, scope, 'effect.type is required.');
  }
}

export function validateSkillDefinition(skill) {
  const errors = [];
  const scope = `skill:${skill?.id || 'unknown'}`;

  if (!isObject(skill)) {
    pushError(errors, scope, 'skill must be an object.');
    return errors;
  }

  ['id', 'name', 'category', 'condition', 'ui'].forEach((key) => {
    if (!(key in skill)) pushError(errors, scope, `${key} is required.`);
  });

  if (!Array.isArray(skill.effects)) {
    pushError(errors, scope, 'effects must be an array.');
  } else {
    skill.effects.forEach((effect, index) => validateEffect(effect, `${scope}.effects[${index}]`, errors));
  }

  if ('targetRule' in skill) pushError(errors, scope, 'targetRule is no longer allowed. Use condition instead.');
  if ('allowedSkillRules' in skill) pushError(errors, scope, 'allowedSkillRules is no longer allowed.');
  if ('damage' in skill) pushError(errors, scope, 'damage is no longer allowed. Use damageFormula + effects[].');

  if (skill.category === 'attack') {
    if (!isObject(skill.damageFormula)) {
      pushError(errors, scope, 'attack skills require damageFormula.');
    }
    const hasDamageEnemy = Array.isArray(skill.effects) && skill.effects.some((effect) => effect?.type === 'damage_enemy');
    if (!hasDamageEnemy) {
      pushError(errors, scope, 'attack skills require a damage_enemy effect.');
    }
  }

  return errors;
}

function validateEnemySkillDefinition(skill, scope) {
  const errors = [];
  if (!isObject(skill)) {
    pushError(errors, scope, 'enemy skill must be an object.');
    return errors;
  }

  ['id', 'name', 'chance'].forEach((key) => {
    if (!(key in skill)) pushError(errors, scope, `${key} is required.`);
  });

  if (!Array.isArray(skill.effects) || skill.effects.length === 0) {
    pushError(errors, scope, 'enemy skill needs effects[].');
  } else {
    skill.effects.forEach((effect, index) => validateEffect(effect, `${scope}.effects[${index}]`, errors));
  }

  return errors;
}

export function validateEnemyDefinition(enemy) {
  const errors = [];
  const scope = `enemy:${enemy?.id || 'unknown'}`;

  if (!isObject(enemy)) {
    pushError(errors, scope, 'enemy must be an object.');
    return errors;
  }

  ['id', 'name', 'hp', 'rules', 'skills', 'ui'].forEach((key) => {
    if (!(key in enemy)) pushError(errors, scope, `${key} is required.`);
  });

  if ('baseDamage' in enemy) pushError(errors, scope, 'baseDamage is no longer allowed. Use skills/effects instead.');
  if ('acceptedRule' in enemy) pushError(errors, scope, 'acceptedRule is no longer allowed. Use rules[].');

  if (!Array.isArray(enemy.rules) || enemy.rules.length === 0) {
    pushError(errors, scope, 'rules must be a non-empty array.');
  }

  if (!Array.isArray(enemy.skills) || enemy.skills.length === 0) {
    pushError(errors, scope, 'skills must be a non-empty array.');
  } else {
    enemy.skills.forEach((skill, index) => {
      validateEnemySkillDefinition(skill, `${scope}.skills[${index}]`).forEach((error) => errors.push(error));
    });
  }

  return errors;
}

export function validateItemDefinition(item) {
  const errors = [];
  const scope = `item:${item?.id || item?.name || 'unknown'}`;

  if (!isObject(item)) {
    pushError(errors, scope, 'item must be an object.');
    return errors;
  }

  ['id', 'name', 'target', 'effects', 'ui'].forEach((key) => {
    if (!(key in item)) pushError(errors, scope, `${key} is required.`);
  });

  if (!Array.isArray(item.effects) || item.effects.length === 0) {
    pushError(errors, scope, 'effects must be a non-empty array.');
  } else {
    item.effects.forEach((effect, index) => validateEffect(effect, `${scope}.effects[${index}]`, errors));
  }

  return errors;
}

export function validateBattleDefinitions() {
  const errors = [];

  playerSkillDefinitions.forEach((skill) => {
    validateSkillDefinition(skill).forEach((error) => errors.push(error));
  });

  Object.values(itemDefinitions).forEach((item) => {
    validateItemDefinition(item).forEach((error) => errors.push(error));
  });

  Object.values(enemyData).forEach((enemy) => {
    validateEnemyDefinition(enemy).forEach((error) => errors.push(error));
  });

  if (errors.length) {
    const message = `Battle schema validation failed:\n${errors.join('\n')}`;
    console.error(message);
    throw new Error(message);
  }

  return true;
}

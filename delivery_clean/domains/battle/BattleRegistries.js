import { battleRules, itemDefinitions, playerSkillDefinitions } from '../../data/battleData.js';
import { createEffectRegistry } from '../../engine/effectRegistry.js';
import { RuleRegistry } from './rules/RuleRegistry.js';
import { getDefaultAttackRules } from './rules/attackRules.js';
import { getDefaultEnemyTurnRules } from './rules/enemyTurnRules.js';
import { getDefaultItemUseRules } from './rules/itemUseRules.js';
import { getDefaultTutorialRestrictionRules } from '../tutorial/tutorialRestrictionRules.js';
import { getDefaultEffectHandlers } from './effects/effectHandlers.js';

class SimpleRegistry {
  constructor(entries = []) {
    this.map = new Map(entries);
  }

  register(id, value) {
    this.map.set(id, value);
    return this;
  }

  get(id) {
    return this.map.get(id) || null;
  }

  has(id) {
    return this.map.has(id);
  }

  getAll() {
    return [...this.map.values()];
  }
}

function createConditionRegistry(ruleRegistry) {
  const conditionRegistry = new SimpleRegistry();

  ruleRegistry.getAll().forEach((rule) => {
    conditionRegistry.register(rule.id, rule.condition);
  });

  return conditionRegistry;
}

function createEffectTypeRegistry() {
  const registry = createEffectRegistry();
  const knownEffectTypes = [
    'damage_enemy',
    'damage_player',
    'healHp',
    'heal_enemy',
    'restoreSkillUses',
    'setNextAttackBonus',
    'addStatusCharge',
    'addTimedBuff',
    'addTimedEnemyDebuff',
    'addChainCount',
    'setChainCount',
    'conditional_effects',
    'message',
    'clearNextAttackBonus',
  ];

  knownEffectTypes.forEach((effectType) => {
    registry.register(effectType, { id: effectType });
  });

  return registry;
}

function createAttackRuleRegistry() {
  return new RuleRegistry(getDefaultAttackRules());
}

function createEnemyTurnRuleRegistry() {
  return new RuleRegistry(getDefaultEnemyTurnRules());
}

function createItemUseRuleRegistry() {
  return new RuleRegistry(getDefaultItemUseRules());
}

function createTutorialRestrictionRegistry() {
  return new RuleRegistry(getDefaultTutorialRestrictionRules());
}

function createEffectHandlerRegistry() {
  return getDefaultEffectHandlers();
}

export function createBattleRegistries() {
  const skillRegistry = new SimpleRegistry(playerSkillDefinitions.map((entry) => [entry.id, entry]));
  const itemRegistry = new SimpleRegistry(Object.values(itemDefinitions).map((entry) => [entry.id, entry]));
  const ruleRegistry = new SimpleRegistry(Object.values(battleRules).map((entry) => [entry.id, entry]));
  const conditionRegistry = createConditionRegistry(ruleRegistry);
  const effectTypeRegistry = createEffectTypeRegistry();
  const effectHandlerRegistry = createEffectHandlerRegistry();
  const attackRuleRegistry = createAttackRuleRegistry();
  const enemyTurnRuleRegistry = createEnemyTurnRuleRegistry();
  const itemUseRuleRegistry = createItemUseRuleRegistry();
  const tutorialRestrictionRegistry = createTutorialRestrictionRegistry();

  return {
    skillRegistry,
    itemRegistry,
    ruleRegistry,
    conditionRegistry,
    effectTypeRegistry,
    effectHandlerRegistry,
    attackRuleRegistry,
    enemyTurnRuleRegistry,
    itemUseRuleRegistry,
    tutorialRestrictionRegistry,
  };
}

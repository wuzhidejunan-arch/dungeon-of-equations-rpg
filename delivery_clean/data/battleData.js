import { battleUIText } from './battleText.js';

export const chainConfig = {
  startCount: 0,
  maxCount: 3,
  triggerCount: 3,
  defaultText: 'Chain',
};

export const battleRules = {
  even: {
    id: 'even',
    label: 'Even',
    shortText: 'Your answer must be even',
    needText: 'an even answer',
    goalText: 'Make an even answer.',
    condition: { type: 'result_rule', value: 'even' },
  },
  odd: {
    id: 'odd',
    label: 'Odd',
    shortText: 'Your answer must be odd',
    needText: 'an odd answer',
    goalText: 'Make an odd answer.',
    condition: { type: 'result_rule', value: 'odd' },
  },
  zero: {
    id: 'zero',
    label: 'Zero',
    shortText: 'Make 0',
    needText: 'an answer of 0',
    goalText: 'Make 0 to block 1 hit.',
    condition: { type: 'result_rule', value: 'zero' },
  },
  prime: {
    id: 'prime',
    label: 'Prime',
    shortText: 'Your answer must be prime',
    needText: 'a prime answer',
    goalText: 'Make a prime answer.',
    condition: { type: 'result_rule', value: 'prime' },
  },
};

const createSkill = ({
  id,
  name,
  category,
  role = category === 'attack' ? 'attack' : 'utility',
  maxPp,
  ui,
  condition,
  effects,
  damageFormula = null,
  operationType = null,
}) => ({
  id,
  name,
  type: 'skill',
  category,
  role,
  target: category === 'guard' ? 'self' : 'enemy',
  maxPp,
  ui,
  condition,
  effects,
  damageFormula,
  operationType,
});

export const beginnerSkillIds = ['oddAttack', 'evenAttack', 'primeAttack', 'zeroGuard'];
export const intermediateSkillIds = ['powerBoost', 'heavyStrike', 'armorBreak', 'weaken'];
export const challengeSkillIds = ['challengeNormalAttack', 'challengeHeavyAttack', 'challengeDefend', 'challengeSelfBuff'];

export const beginnerPlayerSkillDefinitions = [
  createSkill({
    id: 'oddAttack',
    name: 'Odd Attack',
    category: 'attack',
    maxPp: 15,
    ui: {
      showInMenu: true,
      description: 'Attack if the answer is odd.',
      menuInfo: { label: 'Type', value: 'Attack' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        miss: 'Miss.',
        hit: 'Hit! {amount} damage.',
        blocked: 'Blocked.',
      },
    },
    condition: { type: 'result_rule', value: 'odd' },
    damageFormula: { type: 'flat', base: 10, applyAttackBuff: true, applyNextAttackBonus: true },
    effects: [{ type: 'damage_enemy', formula: { type: 'flat', base: 10, applyAttackBuff: true, applyNextAttackBonus: true } }],
  }),
  createSkill({
    id: 'evenAttack',
    name: 'Even Attack',
    category: 'attack',
    maxPp: 15,
    ui: {
      showInMenu: true,
      description: 'Attack if the answer is even.',
      menuInfo: { label: 'Type', value: 'Attack' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        miss: 'Miss.',
        hit: 'Hit! {amount} damage.',
        blocked: 'Blocked.',
      },
    },
    condition: { type: 'result_rule', value: 'even' },
    damageFormula: { type: 'flat', base: 10, applyAttackBuff: true, applyNextAttackBonus: true },
    effects: [{ type: 'damage_enemy', formula: { type: 'flat', base: 10, applyAttackBuff: true, applyNextAttackBonus: true } }],
  }),
  createSkill({
    id: 'primeAttack',
    name: 'Prime Attack',
    category: 'attack',
    maxPp: 15,
    ui: {
      showInMenu: true,
      description: 'Attack if the answer is prime.',
      menuInfo: { label: 'Type', value: 'Attack' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        miss: 'Miss.',
        hit: 'Hit! {amount} damage.',
        blocked: 'Blocked.',
      },
    },
    condition: { type: 'result_rule', value: 'prime' },
    damageFormula: { type: 'flat', base: 10, applyAttackBuff: true, applyNextAttackBonus: true },
    effects: [{ type: 'damage_enemy', formula: { type: 'flat', base: 10, applyAttackBuff: true, applyNextAttackBonus: true } }],
  }),
  createSkill({
    id: 'zeroGuard',
    name: 'Zero Guard',
    category: 'guard',
    maxPp: 15,
    ui: {
      showInMenu: true,
      description: 'Guard if the answer is zero.',
      menuInfo: { label: 'Type', value: 'Guard' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        miss: 'No guard.',
        ready: 'Guard up.',
      },
    },
    condition: { type: 'result_rule', value: 'zero' },
    effects: [{ type: 'addStatusCharge', status: 'zeroGuard', amount: 1, max: 1, message: 'Guard up.' }],
  }),
];

export const intermediatePlayerSkillDefinitions = [
  createSkill({
    id: 'powerBoost',
    name: 'Power Boost',
    category: 'buff',
    role: 'utility',
    target: 'self',
    maxPp: 10,
    operationType: 'multiply',
    ui: {
      showInMenu: true,
      description: 'Use multiplication to power up your next hit.',
      menuInfo: { label: 'Type', value: 'Buff' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        ready: 'ATK up.',
        blocked: 'No damage.',
      },
    },
    condition: { type: 'operation_is', value: 'multiply' },
    effects: [{ type: 'addTimedBuff', buff: 'attackBoost', multiplier: 1.8, turns: 2, message: 'ATK up! x{multiplier} for {turns} turns.' }],
    damageFormula: null,
  }),
  createSkill({
    id: 'heavyStrike',
    name: 'Heavy Strike',
    category: 'attack',
    role: 'attack',
    maxPp: 10,
    operationType: 'multiply',
    ui: {
      showInMenu: true,
      description: 'Use multiplication to attack.',
      menuInfo: { label: 'Type', value: 'Burst' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        hit: 'Heavy hit! {amount} damage.',
        blocked: 'No damage.',
      },
    },
    condition: { type: 'operation_is', value: 'multiply' },
    damageFormula: { type: 'flat', base: 20, applyAttackBuff: true },
    effects: [{ type: 'damage_enemy', formula: { type: 'flat', base: 20, applyAttackBuff: true }, message: 'Heavy hit! {amount} damage.' }],
  }),
  createSkill({
    id: 'armorBreak',
    name: 'Armor Break',
    category: 'debuff',
    role: 'utility',
    maxPp: 10,
    operationType: 'divide',
    ui: {
      showInMenu: true,
      description: 'Use division to lower enemy DEF.',
      menuInfo: { label: 'Type', value: 'DEF Down' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        ready: 'Enemy DEF down.',
        blocked: 'No damage, but DEF fell.',
      },
    },
    condition: { type: 'operation_is', value: 'divide' },
    effects: [{ type: 'addTimedEnemyDebuff', debuff: 'defenseDown', multiplier: 0.5, turns: 3, message: 'Enemy DEF down! x{multiplier} for {turns} turns.' }],
    damageFormula: null,
  }),
  createSkill({
    id: 'weaken',
    name: 'Weaken',
    category: 'debuff',
    role: 'utility',
    maxPp: 10,
    operationType: 'divide',
    ui: {
      showInMenu: true,
      description: 'Use division to lower enemy ATK.',
      menuInfo: { label: 'Type', value: 'ATK Down' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        ready: 'Enemy ATK down.',
        blocked: 'No damage, but ATK fell.',
      },
    },
    condition: { type: 'operation_is', value: 'divide' },
    effects: [{ type: 'addTimedEnemyDebuff', debuff: 'attackDown', multiplier: 0.5, turns: 3, message: 'Enemy ATK down! x{multiplier} for {turns} turns.' }],
    damageFormula: null,
  }),
];

export const challengePlayerSkillDefinitions = [
  createSkill({
    id: 'challengeNormalAttack',
    name: 'Normal Attack',
    category: 'attack',
    maxPp: 15,
    ui: {
      showInMenu: true,
      description: 'Build a chain to attack.',
      menuInfo: { label: 'Type', value: 'Attack' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        miss: 'Miss.',
        hit: 'Hit! {amount} damage.',
        blocked: 'Blocked.',
      },
    },
    condition: { type: 'skill_category', value: 'attack' },
    damageFormula: { type: 'flat', base: 10, applyAttackBuff: true, applyNextAttackBonus: true },
    effects: [{ type: 'damage_enemy', formula: { type: 'flat', base: 10, applyAttackBuff: true, applyNextAttackBonus: true } }],
  }),
  createSkill({
    id: 'challengeHeavyAttack',
    name: 'Heavy Attack',
    category: 'attack',
    maxPp: 10,
    ui: {
      showInMenu: true,
      description: 'Build a chain. Final answer must be more than 10.',
      menuInfo: { label: 'Type', value: 'Heavy' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        miss: 'No damage.',
        hit: 'Heavy hit! {amount} damage.',
        blocked: 'No damage.',
      },
    },
    condition: { type: 'skill_category', value: 'attack' },
    damageFormula: { type: 'flat', base: 20, applyAttackBuff: true },
    effects: [{ type: 'damage_enemy', formula: { type: 'flat', base: 20, applyAttackBuff: true }, message: 'Heavy hit! {amount} damage.' }],
  }),
  createSkill({
    id: 'challengeDefend',
    name: 'Defend',
    category: 'guard',
    maxPp: 5,
    ui: {
      showInMenu: true,
      description: 'Block the next enemy attack.',
      menuInfo: { label: 'Type', value: 'Defend' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        ready: 'Defense up.',
        miss: 'No guard.',
      },
    },
    condition: { type: 'skill_category', value: 'guard' },
    effects: [{ type: 'addTimedBuff', buff: 'defenseBoost', multiplier: 0, turns: 1, message: 'Defense up! {reduction}% less damage for {turns} turn.' }],
  }),
  createSkill({
    id: 'challengeSelfBuff',
    name: 'Self Buff',
    category: 'buff',
    role: 'utility',
    maxPp: 10,
    ui: {
      showInMenu: true,
      description: 'Power up your next hit.',
      menuInfo: { label: 'Type', value: 'Buff' },
      textTemplates: {
        success: '{skill} works.',
        fail: '{skill} failed.',
        ready: 'ATK up.',
        blocked: 'No damage.',
      },
    },
    condition: { type: 'skill_category', value: 'buff' },
    effects: [{ type: 'addTimedBuff', buff: 'attackBoost', multiplier: 1.5, turns: 2, message: 'ATK up! x{multiplier} for {turns} turns.' }],
    damageFormula: null,
  }),
];

export const playerSkillDefinitions = [
  ...beginnerPlayerSkillDefinitions,
  ...intermediatePlayerSkillDefinitions,
  ...challengePlayerSkillDefinitions,
];

export const attackBonusDefinitions = {
  guard: {
    id: 'guard',
    name: 'SAFE HIT',
    resultText: 'Next turn bonus ready: attack and block.',
    logText: 'Next bonus set: attack and block.',
    effects: [{ type: 'setNextAttackBonus', bonus: 'guard' }],
  },
  double: {
    id: 'double',
    name: 'POWER HIT',
    resultText: 'Next turn bonus ready: double damage.',
    logText: 'Next bonus set: double damage.',
    effects: [{ type: 'setNextAttackBonus', bonus: 'double' }],
  },
};

const createItem = ({ name, target, shortLabel, menuLabel, canUse, failMessage, effects, chooseSkillTarget = false, ui = {} }) => ({
  id: name.toLowerCase().replace(/\s+/g, ''),
  name,
  type: 'item',
  battleUsable: true,
  target,
  shortLabel,
  menuLabel,
  chooseSkillTarget,
  canUse,
  failMessage,
  effects,
  ui,
});

export const itemDefinitions = {
  Potion: createItem({
    name: 'Potion',
    target: 'self',
    shortLabel: 'Potion',
    menuLabel: 'Potion',
    canUse: ({ player }) => player.hp < player.maxHp,
    failMessage: 'HP is already full.',
    effects: [{ type: 'healHp', amount: 8, message: 'Used Potion. Recovered {amount} HP.' }],
    ui: { resultText: 'Recover some HP.' },
  }),
  'Skill Potion': createItem({
    name: 'Skill Potion',
    target: 'skill',
    shortLabel: 'Skill Pot.',
    menuLabel: 'Skill Potion',
    chooseSkillTarget: true,
    canUse: ({ skills }) => skills.some((skill) => skill.maxPp !== null && skill.pp < skill.maxPp),
    failMessage: 'All skill uses are already full.',
    effects: [{ type: 'restoreSkillUses', mode: 'target', amount: 'full' }],
    ui: { resultText: 'Restore one skill fully.' },
  }),
  'Power Potion': createItem({
    name: 'Power Potion',
    target: 'self',
    shortLabel: 'Power Pot.',
    menuLabel: 'Power Potion',
    canUse: () => true,
    failMessage: 'This item cannot be used now.',
    effects: [{ type: 'addTimedBuff', buff: 'attackBoost', multiplier: 1.2, turns: 3, message: 'Attack up! x{multiplier} damage for {turns} turns.' }],
    ui: { resultText: 'Boost attack for 3 turns.' },
  }),
  'Defense Potion': createItem({
    name: 'Defense Potion',
    target: 'self',
    shortLabel: 'Def Pot.',
    menuLabel: 'Defense Potion',
    canUse: () => true,
    failMessage: 'This item cannot be used now.',
    effects: [{ type: 'addTimedBuff', buff: 'defenseBoost', multiplier: 0.8, turns: 3, message: 'Defense up! {reduction}% less damage for {turns} turns.' }],
    ui: { resultText: 'Reduce damage for 3 turns.' },
  }),
  'Chain Potion': createItem({
    name: 'Chain Potion',
    target: 'self',
    shortLabel: 'Chain Pot.',
    menuLabel: 'Chain Potion',
    canUse: () => true,
    failMessage: 'This item cannot be used now.',
    effects: [{ type: 'addChainCount', amount: 2, message: 'Chain +{amount}.' }],
    ui: { resultText: 'Raise chain by 2.' },
  }),
};



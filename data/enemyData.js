const createEnemySkill = ({ id, name, chance, formula, ui = {} }) => ({
  id,
  name,
  chance,
  ui,
  effects: [{ type: 'damage_player', formula, message: ui.hitText, blockedMessage: ui.blockedText }],
});

const createRuleEntry = (rule) => {
  if (rule && typeof rule === 'object' && !Array.isArray(rule)) {
    return {
      type: 'accept_result_rule',
      ...rule,
    };
  }

  return {
    type: 'accept_result_rule',
    value: rule,
  };
};

const buildDefaultRuleText = (rule) => {
  if (rule && typeof rule === 'object' && rule.value === 'exact') {
    return `Your answer must be ${rule.target}.`;
  }
  if (rule && typeof rule === 'object' && rule.value === 'multipleOf') {
    return `Your answer must be a multiple of ${rule.divisor}.`;
  }

  const label = typeof rule === 'string' ? rule : rule?.value || 'any';
  return `Your answer must be ${label}.`;
};

const createEnemy = ({
  id,
  name,
  imageKey = null,
  imageDisplay = null,
  hp,
  attack,
  goldReward,
  expReward,
  rule,
  skills,
  counterEffects = [],
  ui = {},
  battleModifiers = {},
  isTrainingDummy = false,
}) => ({
  id,
  name,
  imageKey,
  imageDisplay,
  hp,
  attack,
  goldReward,
  expReward,
  rules: [createRuleEntry(rule)],
  ui: {
    ruleText: buildDefaultRuleText(rule),
    blockText: `${name} blocked the attack.`,
    ...ui,
  },
  counterEffects,
  skills,
  battleModifiers,
  isTrainingDummy,
});

export const enemyData = {
  trainingDummy: createEnemy({
    id: 'trainingDummy',
    name: 'Number Dummy',
    imageKey: 'enemy_number_dummy',
    imageDisplay: { width: 95, height: 110, offsetX: 0, offsetY: -20 },
    hp: 18,
    attack: 2,
    goldReward: 0,
    expReward: 0,
    rule: 'even',
    isTrainingDummy: true,
    ui: { blockText: 'The bot waits for the right answer.' },
    skills: [
      createEnemySkill({ id: 'tap', name: 'Tap', chance: 100, formula: { type: 'flat', base: 2 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  slime: createEnemy({
    id: 'slime',
    name: 'Even Slime',
    imageKey: 'enemy_even_slime',
    imageDisplay: { width: 100, height: 100, offsetX: 0, offsetY: 4 },
    hp: 30,
    attack: 3,
    goldReward: 12,
    expReward: 8,
    rule: 'even',
    ui: { blockText: 'The slime jiggles away from the hit.' },
    counterEffects: [
      {
        trigger: 'on_player_attack_blocked',
        message: 'The slime jiggles away. Your answer must be even.',
        effects: [],
      },
    ],
    skills: [
      createEnemySkill({ id: 'body_slam', name: 'Body Slam', chance: 70, formula: { type: 'flat', base: 3 }, ui: { hitText: 'You took {amount} damage.', blockedText: 'Blocked the hit.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'heavy_bounce', name: 'Heavy Bounce', chance: 30, formula: { type: 'flat', base: 5 }, ui: { hitText: 'You took {amount} damage.', blockedText: 'Blocked the hit.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  bat: createEnemy({
    id: 'bat',
    name: 'Odd Bat',
    imageKey: 'enemy_odd_bat',
    imageDisplay: { width: 120, height: 90, offsetX: 0, offsetY: -30 },
    hp: 24,
    attack: 3,
    goldReward: 14,
    expReward: 10,
    rule: 'odd',
    ui: { blockText: 'The bat dodged it. Your answer must be odd.' },
    skills: [
      createEnemySkill({ id: 'wing_hit', name: 'Wing Hit', chance: 75, formula: { type: 'flat', base: 3 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'sharp_bite', name: 'Sharp Bite', chance: 25, formula: { type: 'flat', base: 5 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  boss1: createEnemy({
    id: 'boss1',
    name: 'Even Gatekeeper',
    imageKey: 'enemy_even_gatekeeper',
    imageDisplay: { width: 125, height: 125, offsetX: 0, offsetY: -12 },
    hp: 45,
    attack: 4,
    goldReward: 20,
    expReward: 14,
    rule: 'even',
    ui: { blockText: 'The gatekeeper blocks it. Your answer must be even.' },
    counterEffects: [
      {
        trigger: 'on_player_skill_failed',
        message: 'This skill needs an even answer.',
        effects: [],
      },
    ],
    skills: [
      createEnemySkill({ id: 'body_slam', name: 'Body Slam', chance: 70, formula: { type: 'flat', base: 4 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'heavy_bounce', name: 'Heavy Bounce', chance: 30, formula: { type: 'flat', base: 6 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  boss2: createEnemy({
    id: 'boss2',
    name: 'Odd Gatekeeper',
    imageKey: 'enemy_odd_gatekeeper',
    imageDisplay: { width: 170, height: 135, offsetX: 0, offsetY: -28 },
    hp: 55,
    attack: 4,
    goldReward: 25,
    expReward: 18,
    rule: 'odd',
    ui: { blockText: 'The gatekeeper dodges it. Your answer must be odd.' },
    skills: [
      createEnemySkill({ id: 'wing_cut', name: 'Wing Cut', chance: 70, formula: { type: 'flat', base: 4 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'night_dive', name: 'Night Dive', chance: 30, formula: { type: 'flat', base: 6 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  boss3: createEnemy({
    id: 'boss3',
    name: 'Prime Gatekeeper',
    imageKey: 'enemy_prime_gatekeeper',
    imageDisplay: { width: 150, height: 150, offsetX: 0, offsetY: -25 },
    hp: 70,
    attack: 5,
    goldReward: 30,
    expReward: 22,
    rule: 'prime',
    ui: { blockText: 'The gatekeeper blocks it. Your answer must be prime.' },
    skills: [
      createEnemySkill({ id: 'shield_crush', name: 'Shield Crush', chance: 70, formula: { type: 'flat', base: 5 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'rock_break', name: 'Rock Break', chance: 30, formula: { type: 'flat', base: 7 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  finalBoss: createEnemy({
    id: 'finalBoss',
    name: 'Prime Dungeon Lord',
    imageKey: 'enemy_prime_dungeon_lord',
    imageDisplay: { width: 170, height: 170, offsetX: 0, offsetY: -45 },
    hp: 100,
    attack: 6,
    goldReward: 60,
    expReward: 30,
    rule: 'prime',
    ui: { blockText: 'The lord blocks it. Your answer must be prime.' },
    counterEffects: [
      {
        trigger: 'on_player_attack_blocked',
        message: 'Your answer must be prime.',
        effects: [],
      },
    ],
    skills: [
      createEnemySkill({ id: 'dark_claw', name: 'Dark Claw', chance: 70, formula: { type: 'flat', base: 6 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'abyss_smash', name: 'Abyss Smash', chance: 30, formula: { type: 'flat', base: 8 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  intermediate_stoneShell: createEnemy({
    id: 'intermediate_stoneShell',
    name: 'Stone Shell',
    imageKey: 'enemy_intermediate_stone_shell',
    imageDisplay: { width: 110, height: 110, offsetX: 0, offsetY: -5 },
    hp: 42,
    attack: 4,
    goldReward: 19,
    expReward: 14,
    rule: 'even',
    ui: {
      ruleText: 'Your answer must be even.\nUse Armor Break to break armor.',
      blockText: 'Stone Shell blocked the damage.',
    },
    battleModifiers: {
      defenseMultiplier: 0.45,
    },
    skills: [
      createEnemySkill({ id: 'shell_bash', name: 'Shell Bash', chance: 100, formula: { type: 'flat', base: 4 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  intermediate_wildFang: createEnemy({
    id: 'intermediate_wildFang',
    name: 'Wild Fang',
    imageKey: 'enemy_intermediate_wild_fang',
    imageDisplay: { width: 110, height: 110, offsetX: 0, offsetY: -5 },
    hp: 30,
    attack: 8,
    goldReward: 22,
    expReward: 16,
    rule: 'odd',
    ui: {
      ruleText: 'Your answer must be odd.\nUse Weaken to lower enemy attack.',
      blockText: 'Wild Fang slipped away from the damage.',
    },
    skills: [
      createEnemySkill({ id: 'fang_rush', name: 'Fang Rush', chance: 100, formula: { type: 'enemy_attack' }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  intermediate_armorDummy: createEnemy({
    id: 'intermediate_armorDummy',
    name: 'Armor Dummy',
    imageKey: 'enemy_intermediate_armor_dummy',
    imageDisplay: { width: 100, height: 112, offsetX: 0, offsetY: -28 },
    hp: 20,
    attack: 4,
    goldReward: 24,
    expReward: 22,
    rule: 'even',
    isTrainingDummy: true,
    ui: {
      ruleText: 'Your answer must be even.',
      blockText: 'Armor Dummy blocked that practice hit.',
    },
    counterEffects: [
      {
        trigger: 'on_player_attack_hit',
        condition: { type: 'enemy_debuff_inactive', debuff: 'defenseDown' },
        message: 'Armor is still active. Use Armor Break first. Then use an even Heavy Strike.',
        effects: [],
      },
      {
        trigger: 'on_player_attack_blocked',
        message: 'Heavy Strike only deals damage when your answer is even. Try again.',
        effects: [],
      },
    ],
    battleModifiers: {
      requireArmorBreak: true,
      defenseLockMultiplier: 0.05,
    },
    skills: [
      createEnemySkill({ id: 'crusher_slam', name: 'Crusher Slam', chance: 100, formula: { type: 'flat', base: 4 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  intermediate_evenStoneGatekeeper: createEnemy({
    id: 'intermediate_evenStoneGatekeeper',
    name: 'Even Stone Gatekeeper',
    imageKey: 'enemy_intermediate_even_stone_gatekeeper',
    imageDisplay: { width: 140, height: 140, offsetX: 0, offsetY: -18 },
    hp: 52,
    attack: 5,
    goldReward: 20,
    expReward: 18,
    rule: 'even',
    ui: {
      ruleText: 'Your answer must be even.\nUse Armor Break to break armor.',
      blockText: 'Even Stone Gatekeeper blocked the damage.',
    },
    battleModifiers: {
      defenseMultiplier: 0.35,
      requireArmorBreak: true,
      defenseLockMultiplier: 0.4,
    },
    skills: [
      createEnemySkill({ id: 'shell_bash', name: 'Shell Bash', chance: 100, formula: { type: 'flat', base: 5 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  intermediate_oddFangGatekeeper: createEnemy({
    id: 'intermediate_oddFangGatekeeper',
    name: 'Odd Fang Gatekeeper',
    imageKey: 'enemy_intermediate_odd_fang_gatekeeper',
    imageDisplay: { width: 140, height: 130, offsetX: 0, offsetY: -35 },
    hp: 40,
    attack: 10,
    goldReward: 22,
    expReward: 20,
    rule: 'odd',
    ui: {
      ruleText: 'Your answer must be odd.\nUse Weaken to lower enemy attack.',
      blockText: 'Odd Fang Gatekeeper slipped away from the damage.',
    },
    skills: [
      createEnemySkill({ id: 'fang_rush', name: 'Fang Rush', chance: 100, formula: { type: 'enemy_attack' }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  intermediate_ironCoreGatekeeper: createEnemy({
    id: 'intermediate_ironCoreGatekeeper',
    name: 'Iron Core Gatekeeper',
    imageKey: 'enemy_intermediate_iron_core_gatekeeper',
    imageDisplay: { width: 150, height: 150, offsetX: 0, offsetY: -45 },
    hp: 58,
    attack: 6,
    goldReward: 24,
    expReward: 22,
    rule: { value: 'multipleOf', divisor: 3 },
    ui: {
      ruleText: 'Use a multiple of 3, like 3, 6, 9, or 12.',
      blockText: 'Iron Core Gatekeeper needs a multiple of 3.',
    },
    skills: [
      createEnemySkill({ id: 'core_pulse', name: 'Core Pulse', chance: 100, formula: { type: 'flat', base: 6 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  intermediate_armorCoreLord: createEnemy({
    id: 'intermediate_armorCoreLord',
    name: 'Armor Core Lord',
    imageKey: 'enemy_intermediate_armor_core_lord',
    imageDisplay: { width: 150, height: 150, offsetX: 0, offsetY: -50 },
    hp: 72,
    attack: 8,
    goldReward: 30,
    expReward: 28,
    rule: { value: 'multipleOf', divisor: 5 },
    ui: {
      ruleText: 'Use a multiple of 5, like 5, 10, 15, or 20.\nUse Armor Break to break armor.',
      blockText: 'Armor Core Lord needs a multiple of 5.',
    },
    counterEffects: [
      {
        trigger: 'on_player_attack_hit',
        condition: { type: 'enemy_debuff_inactive', debuff: 'defenseDown' },
        message: 'Armor is still active. Use Armor Break first.',
        effects: [],
      },
    ],
    battleModifiers: {
      requireArmorBreak: true,
      defenseLockMultiplier: 0.05,
    },
    skills: [
      createEnemySkill({ id: 'crusher_slam', name: 'Crusher Slam', chance: 100, formula: { type: 'flat', base: 8 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  challenge_training_scout: createEnemy({
    id: 'challenge_training_scout',
    name: 'Chain Dummy',
    imageKey: 'challenge_chain_dummy',
    imageDisplay: { width: 108, height: 120, offsetX: -2, offsetY: -30 },
    hp: 20,
    attack: 2,
    goldReward: 0,
    expReward: 0,
    rule: 'even',
    isTrainingDummy: true,
    ui: {
      ruleText: 'Only the final answer counts.\nThe final answer must be even.',
      blockText: 'Chain Dummy only checks the final answer.',
    },
    counterEffects: [
      {
        trigger: 'on_player_attack_blocked',
        message: 'The final answer missed the rule. Row 1 alone does not count.',
        effects: [],
      },
      {
        trigger: 'on_player_skill_failed',
        message: 'Heavy Attack needs a final answer greater than 10.',
        effects: [],
      },
    ],
    skills: [
      createEnemySkill({ id: 'soft_tap', name: 'Soft Tap', chance: 100, formula: { type: 'flat', base: 2 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  challenge_chainCrawler: createEnemy({
    id: 'challenge_chainCrawler',
    name: 'Chain Crawler',
    imageKey: 'challenge_chain_crawler',
    imageDisplay: { width: 130, height: 130, offsetX: 0, offsetY: -15 },
    hp: 34,
    attack: 4,
    goldReward: 22,
    expReward: 16,
    rule: 'even',
    ui: {
      ruleText: 'Only the final answer counts.\nThe final answer must be even.',
      blockText: 'Chain Crawler needs the right final answer.',
    },
    skills: [
      createEnemySkill({ id: 'chain_bounce', name: 'Chain Bounce', chance: 70, formula: { type: 'flat', base: 4 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'slime_press', name: 'Slime Press', chance: 30, formula: { type: 'flat', base: 5 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  challenge_splitwingImp: createEnemy({
    id: 'challenge_splitwingImp',
    name: 'Splitwing Imp',
    imageKey: 'challenge_splitwing_imp',
    imageDisplay: { width: 160, height: 140, offsetX: 5, offsetY: -55 },
    hp: 28,
    attack: 5,
    goldReward: 24,
    expReward: 18,
    rule: 'odd',
    ui: {
      ruleText: 'Only the final answer counts.\nThe final answer must be odd.',
      blockText: 'Splitwing Imp dodges the wrong final answer.',
    },
    skills: [
      createEnemySkill({ id: 'chain_swoop', name: 'Chain Swoop', chance: 75, formula: { type: 'flat', base: 5 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'night_peck', name: 'Night Peck', chance: 25, formula: { type: 'flat', base: 6 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  challenge_balancedSentinel: createEnemy({
    id: 'challenge_balancedSentinel',
    name: 'Balanced Sentinel',
    imageKey: 'challenge_balanced_sentinel',
    imageDisplay: { width: 150, height: 150, offsetX: 0, offsetY: -48 },
    hp: 46,
    attack: 5,
    goldReward: 24,
    expReward: 20,
    rule: 'even',
    ui: {
      ruleText: 'Only the final answer counts.\nThe final answer must be even.',
      blockText: 'Balanced Sentinel rejects the wrong final answer.',
    },
    skills: [
      createEnemySkill({ id: 'gate_bash', name: 'Gate Bash', chance: 70, formula: { type: 'flat', base: 5 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'steady_crush', name: 'Steady Crush', chance: 30, formula: { type: 'flat', base: 7 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  challenge_crookedSentinel: createEnemy({
    id: 'challenge_crookedSentinel',
    name: 'Crooked Sentinel',
    imageKey: 'challenge_crooked_sentinel',
    imageDisplay: { width: 160, height: 160, offsetX: -10, offsetY: -55 },
    hp: 52,
    attack: 6,
    goldReward: 28,
    expReward: 24,
    rule: 'odd',
    ui: {
      ruleText: 'Only the final answer counts.\nThe final answer must be odd.',
      blockText: 'Crooked Sentinel slips past the wrong final answer.',
    },
    skills: [
      createEnemySkill({ id: 'shadow_rush', name: 'Shadow Rush', chance: 70, formula: { type: 'flat', base: 6 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'sting_dive', name: 'Sting Dive', chance: 30, formula: { type: 'flat', base: 8 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  challenge_primeWarden: createEnemy({
    id: 'challenge_primeWarden',
    name: 'Prime Warden',
    imageKey: 'challenge_prime_warden',
    imageDisplay: { width: 170, height: 170, offsetX: 0, offsetY: -55 },
    hp: 60,
    attack: 7,
    goldReward: 34,
    expReward: 28,
    rule: 'prime',
    ui: {
      ruleText: 'Only the final answer counts.\nThe final answer must be prime.',
      blockText: 'Prime Warden shrugs off the wrong final answer.',
    },
    battleModifiers: {
      defenseMultiplier: 0.8,
    },
    skills: [
      createEnemySkill({ id: 'prime_crash', name: 'Prime Crash', chance: 70, formula: { type: 'flat', base: 7 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'focus_break', name: 'Focus Break', chance: 30, formula: { type: 'flat', base: 9 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),

  challenge_chainOracleLord: createEnemy({
    id: 'challenge_chainOracleLord',
    name: 'Chain Oracle Lord',
    imageKey: 'challenge_chain_oracle_lord',
    imageDisplay: { width: 195, height: 195, offsetX: 0, offsetY: -70},
    hp: 78,
    attack: 8,
    goldReward: 48,
    expReward: 34,
    rule: 'prime',
    ui: {
      ruleText: 'Only the final answer counts.\nThe final answer must be prime.',
      blockText: 'Chain Oracle Lord needs the right final answer.',
    },
    counterEffects: [
      {
        trigger: 'on_player_attack_blocked',
        message: 'The final answer missed the rule. Use both rows, then make a prime answer.',
        effects: [],
      },
      {
        trigger: 'on_player_skill_failed',
        message: 'Heavy Attack needs a final answer greater than 10.',
        effects: [],
      },
    ],
    skills: [
      createEnemySkill({ id: 'lord_slam', name: 'Lord Slam', chance: 70, formula: { type: 'flat', base: 8 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
      createEnemySkill({ id: 'dungeon_burst', name: 'Dungeon Burst', chance: 30, formula: { type: 'flat', base: 10 }, ui: { hitText: 'You took {amount} damage.', resultText: '{enemy} used {skill}. You took {amount} damage.' } }),
    ],
  }),
};

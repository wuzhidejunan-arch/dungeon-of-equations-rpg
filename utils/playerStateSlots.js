const DIFFICULTY_KEYS = ['beginner', 'intermediate', 'challenge'];
const DEFAULT_DIFFICULTY_KEY = 'beginner';
const DEFAULT_SAVE_VERSION = 1;

const DEFAULT_PLAYER_IDENTITY = Object.freeze({
  name: 'Player',
  gender: 'male',
});

const DEFAULT_STATS = Object.freeze({
  hp: 20,
  maxHp: 20,
  level: 1,
  exp: 0,
  expToNext: 16,
  gold: 100,
  pendingLevelUpMessages: [],
});

const DEFAULT_INVENTORY = Object.freeze([
  { id: 1, name: 'Potion', qty: 3 },
  { id: 2, name: 'Skill Potion', qty: 1 },
  { id: 3, name: 'Power Potion', qty: 1 },
  { id: 4, name: 'Defense Potion', qty: 1 },
  { id: 5, name: 'Chain Potion', qty: 1 },
]);

const DEFAULT_SKILLS_BY_DIFFICULTY = Object.freeze({
  beginner: Object.freeze({
    unlockedSkillIds: ['oddAttack', 'evenAttack', 'primeAttack', 'zeroGuard'],
    equippedSkillIds: ['oddAttack', 'evenAttack', 'primeAttack', 'zeroGuard'],
    skillStates: Object.freeze({
      oddAttack: Object.freeze({ pp: 15, maxPp: 15 }),
      evenAttack: Object.freeze({ pp: 15, maxPp: 15 }),
      primeAttack: Object.freeze({ pp: 15, maxPp: 15 }),
      zeroGuard: Object.freeze({ pp: 15, maxPp: 15 }),
    }),
  }),
  intermediate: Object.freeze({
    unlockedSkillIds: ['powerBoost', 'heavyStrike', 'armorBreak', 'weaken'],
    equippedSkillIds: ['powerBoost', 'heavyStrike', 'armorBreak', 'weaken'],
    skillStates: Object.freeze({
      powerBoost: Object.freeze({ pp: 10, maxPp: 10 }),
      heavyStrike: Object.freeze({ pp: 10, maxPp: 10 }),
      armorBreak: Object.freeze({ pp: 10, maxPp: 10 }),
      weaken: Object.freeze({ pp: 10, maxPp: 10 }),
    }),
  }),
  challenge: Object.freeze({
    unlockedSkillIds: ['challengeNormalAttack', 'challengeHeavyAttack', 'challengeDefend', 'challengeSelfBuff'],
    equippedSkillIds: ['challengeNormalAttack', 'challengeHeavyAttack', 'challengeDefend', 'challengeSelfBuff'],
    skillStates: Object.freeze({
      challengeNormalAttack: Object.freeze({ pp: 15, maxPp: 15 }),
      challengeHeavyAttack: Object.freeze({ pp: 10, maxPp: 10 }),
      challengeDefend: Object.freeze({ pp: 5, maxPp: 5 }),
      challengeSelfBuff: Object.freeze({ pp: 10, maxPp: 10 }),
    }),
  }),
});

const DEFAULT_POSITION = Object.freeze({
  world: Object.freeze({ x: 220, y: 290 }),
  home: Object.freeze({ x: 400, y: 500 }),
  dungeon: Object.freeze({ x: 90, y: 520 }),
});

const DEFAULT_DUNGEON_PROGRESS = Object.freeze({
  currentRoom: 1,
  boss1Defeated: false,
  boss2Defeated: false,
  boss3Defeated: false,
  finalBossDefeated: false,
  cleared: false,
});

const DEFAULT_TRAINING_PROGRESS = Object.freeze({
  completedStages: [],
  activeBattleStage: null,
  lastBattleWinKey: null,
});

const DEFAULT_TUTORIAL_PROGRESS = Object.freeze({
  currentStepId: 'home_move',
  bagOpened: false,
  tutorialDone: false,
});

const DEFAULT_WORLD_STATE = Object.freeze({
  openedChests: [],
  defeatedEnemies: [],
});

function deepClone(value) {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function normalizeDifficultyKey(difficultyKey) {
  return DIFFICULTY_KEYS.includes(difficultyKey) ? difficultyKey : DEFAULT_DIFFICULTY_KEY;
}

function cloneDefaultSkills(difficultyKey) {
  return deepClone(DEFAULT_SKILLS_BY_DIFFICULTY[normalizeDifficultyKey(difficultyKey)]);
}

function buildDifficultyState(difficultyKey) {
  return {
    ...deepClone(DEFAULT_PLAYER_IDENTITY),
    stats: deepClone(DEFAULT_STATS),
    inventory: deepClone(DEFAULT_INVENTORY),
    skills: cloneDefaultSkills(difficultyKey),
    position: deepClone(DEFAULT_POSITION),
    dungeonProgress: deepClone(DEFAULT_DUNGEON_PROGRESS),
    trainingProgress: deepClone(DEFAULT_TRAINING_PROGRESS),
    tutorialProgress: deepClone(DEFAULT_TUTORIAL_PROGRESS),
    worldState: deepClone(DEFAULT_WORLD_STATE),
  };
}

export function createDefaultDifficultyState(difficultyKey = DEFAULT_DIFFICULTY_KEY) {
  return buildDifficultyState(difficultyKey);
}

export function createDefaultSaveRoot() {
  return {
    currentDifficulty: DEFAULT_DIFFICULTY_KEY,
    global: {
      unlockedModes: {
        beginner: true,
        intermediate: false,
        challenge: false,
      },
      settings: {},
      debug: {},
      meta: {
        saveVersion: DEFAULT_SAVE_VERSION,
      },
    },
    difficulties: {
      beginner: createDefaultDifficultyState('beginner'),
      intermediate: createDefaultDifficultyState('intermediate'),
      challenge: createDefaultDifficultyState('challenge'),
    },
  };
}

export function extractDifficultyStateFromPlayerData(playerData) {
  const difficultyKey = normalizeDifficultyKey(playerData?.difficulty);
  const fallback = createDefaultDifficultyState(difficultyKey);

  return {
    name: playerData?.name ?? fallback.name,
    gender: playerData?.gender ?? fallback.gender,
    stats: {
      hp: playerData?.hp ?? fallback.stats.hp,
      maxHp: playerData?.maxHp ?? fallback.stats.maxHp,
      level: playerData?.level ?? fallback.stats.level,
      exp: playerData?.exp ?? fallback.stats.exp,
      expToNext: playerData?.expToNext ?? fallback.stats.expToNext,
      gold: playerData?.gold ?? fallback.stats.gold,
      pendingLevelUpMessages: deepClone(playerData?.pendingLevelUpMessages ?? fallback.stats.pendingLevelUpMessages),
    },
    inventory: deepClone(playerData?.inventory ?? fallback.inventory),
    skills: {
      unlockedSkillIds: deepClone(playerData?.unlockedSkillIds ?? fallback.skills.unlockedSkillIds),
      equippedSkillIds: deepClone(playerData?.equippedSkillIds ?? fallback.skills.equippedSkillIds),
      skillStates: deepClone(playerData?.skillStates ?? fallback.skills.skillStates),
    },
    position: deepClone(playerData?.position ?? fallback.position),
    dungeonProgress: deepClone(playerData?.dungeonProgress ?? fallback.dungeonProgress),
    trainingProgress: deepClone(playerData?.trainingProgress ?? fallback.trainingProgress),
    tutorialProgress: deepClone(playerData?.tutorialProgress ?? fallback.tutorialProgress),
    worldState: {
      openedChests: deepClone(playerData?.openedChests ?? fallback.worldState.openedChests),
      defeatedEnemies: deepClone(playerData?.defeatedEnemies ?? fallback.worldState.defeatedEnemies),
    },
  };
}

export function applyDifficultyStateToPlayerData(playerData, difficultyState, difficultyKey = DEFAULT_DIFFICULTY_KEY) {
  const normalizedDifficultyKey = normalizeDifficultyKey(difficultyKey);
  const fallback = createDefaultDifficultyState(normalizedDifficultyKey);
  const source = difficultyState && typeof difficultyState === 'object' ? difficultyState : fallback;

  playerData.difficulty = normalizedDifficultyKey;
  playerData.name = source.name ?? fallback.name;
  playerData.gender = source.gender ?? fallback.gender;

  playerData.hp = source.stats?.hp ?? fallback.stats.hp;
  playerData.maxHp = source.stats?.maxHp ?? fallback.stats.maxHp;
  playerData.level = source.stats?.level ?? fallback.stats.level;
  playerData.exp = source.stats?.exp ?? fallback.stats.exp;
  playerData.expToNext = source.stats?.expToNext ?? fallback.stats.expToNext;
  playerData.gold = source.stats?.gold ?? fallback.stats.gold;
  playerData.pendingLevelUpMessages = deepClone(source.stats?.pendingLevelUpMessages ?? fallback.stats.pendingLevelUpMessages);

  playerData.inventory = deepClone(source.inventory ?? fallback.inventory);
  playerData.unlockedSkillIds = deepClone(source.skills?.unlockedSkillIds ?? fallback.skills.unlockedSkillIds);
  playerData.equippedSkillIds = deepClone(source.skills?.equippedSkillIds ?? fallback.skills.equippedSkillIds);
  playerData.skillStates = deepClone(source.skills?.skillStates ?? fallback.skills.skillStates);

  playerData.position = deepClone(source.position ?? fallback.position);
  playerData.dungeonProgress = deepClone(source.dungeonProgress ?? fallback.dungeonProgress);
  playerData.trainingProgress = deepClone(source.trainingProgress ?? fallback.trainingProgress);
  playerData.tutorialProgress = deepClone(source.tutorialProgress ?? fallback.tutorialProgress);
  playerData.openedChests = deepClone(source.worldState?.openedChests ?? fallback.worldState.openedChests);
  playerData.defeatedEnemies = deepClone(source.worldState?.defeatedEnemies ?? fallback.worldState.defeatedEnemies);

  return playerData;
}

export function getDifficultyState(saveRoot, difficultyKey = DEFAULT_DIFFICULTY_KEY) {
  const normalizedDifficultyKey = normalizeDifficultyKey(difficultyKey);
  const root = ensureSaveRootShape(saveRoot);

  if (!root.difficulties[normalizedDifficultyKey]) {
    root.difficulties[normalizedDifficultyKey] = createDefaultDifficultyState(normalizedDifficultyKey);
  }

  return root.difficulties[normalizedDifficultyKey];
}

export function ensureSaveRootShape(saveData) {
  if (!saveData || typeof saveData !== 'object' || Array.isArray(saveData)) {
    return createDefaultSaveRoot();
  }

  const defaults = createDefaultSaveRoot();
  const normalized = {
    currentDifficulty: normalizeDifficultyKey(saveData.currentDifficulty || defaults.currentDifficulty),
    global: {
      unlockedModes: {
        ...defaults.global.unlockedModes,
        ...(saveData.global?.unlockedModes || {}),
      },
      settings: deepClone(saveData.global?.settings || defaults.global.settings),
      debug: deepClone(saveData.global?.debug || defaults.global.debug),
      meta: {
        ...defaults.global.meta,
        ...(saveData.global?.meta || {}),
      },
    },
    difficulties: {},
  };

  DIFFICULTY_KEYS.forEach((difficultyKey) => {
    const defaultState = createDefaultDifficultyState(difficultyKey);
    const sourceState = saveData.difficulties?.[difficultyKey];

    normalized.difficulties[difficultyKey] = {
      name: sourceState?.name ?? defaultState.name,
      gender: sourceState?.gender ?? defaultState.gender,
      stats: {
        ...deepClone(defaultState.stats),
        ...(sourceState?.stats || {}),
        pendingLevelUpMessages: deepClone(sourceState?.stats?.pendingLevelUpMessages ?? defaultState.stats.pendingLevelUpMessages),
      },
      inventory: deepClone(sourceState?.inventory ?? defaultState.inventory),
      skills: {
        unlockedSkillIds: deepClone(sourceState?.skills?.unlockedSkillIds ?? defaultState.skills.unlockedSkillIds),
        equippedSkillIds: deepClone(sourceState?.skills?.equippedSkillIds ?? defaultState.skills.equippedSkillIds),
        skillStates: deepClone(sourceState?.skills?.skillStates ?? defaultState.skills.skillStates),
      },
      position: deepClone(sourceState?.position ?? defaultState.position),
      dungeonProgress: deepClone(sourceState?.dungeonProgress ?? defaultState.dungeonProgress),
      trainingProgress: deepClone(sourceState?.trainingProgress ?? defaultState.trainingProgress),
      tutorialProgress: deepClone(sourceState?.tutorialProgress ?? defaultState.tutorialProgress),
      worldState: {
        openedChests: deepClone(sourceState?.worldState?.openedChests ?? defaultState.worldState.openedChests),
        defeatedEnemies: deepClone(sourceState?.worldState?.defeatedEnemies ?? defaultState.worldState.defeatedEnemies),
      },
    };
  });

  return normalized;
}

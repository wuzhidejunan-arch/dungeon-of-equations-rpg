import { playerData } from '../../data/playerData.js';
import { battleMenuStates } from '../../data/battleStates.js';
import { battleResultPhases } from '../../data/battlePhases.js';
import { chainConfig } from '../../data/battleData.js';
import { getDifficultyBuilderConfig } from '../../config/difficultySettings.js';

const DEFAULT_ENEMY = {
  name: 'Unknown Enemy',
  hp: 20,
  attack: 5,
  goldReward: 10,
  rules: [{ type: 'accept_result_rule', value: 'even' }],
  ui: { ruleText: 'Use Even Attack' },
  skills: [],
};

function cloneDefaultEnemy(enemy = {}) {
  return {
    ...DEFAULT_ENEMY,
    ...enemy,
    ui: {
      ...DEFAULT_ENEMY.ui,
      ...(enemy?.ui || {}),
    },
    rules: Array.isArray(enemy?.rules) ? [...enemy.rules] : [...DEFAULT_ENEMY.rules],
    skills: Array.isArray(enemy?.skills) ? [...enemy.skills] : [],
  };
}

function freezePathMapEntries(pathMap = {}) {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(pathMap).map(([key, path]) => [key, Object.freeze([...path])]),
    ),
  );
}

// Contract-only state path map for battle scene bindings.
// This is intentionally data-only so other layers can reference stable keys
// without needing to inspect scene code or mutate the path definitions.
export const BATTLE_STATE_PATHS = freezePathMapEntries({
  enemy: ['encounter', 'enemy'],
  returnScene: ['encounter', 'returnScene'],
  enemyKey: ['encounter', 'enemyKey'],
  enemyCurrentHp: ['battle', 'enemyCurrentHp'],
  battleEnded: ['battle', 'ended'],
  currentTurn: ['battle', 'currentTurn'],
  menuState: ['menu', 'state'],
  selectedAction: ['menu', 'selectedAction'],
  battleLogs: ['battle', 'logs'],
  builderActive: ['builder', 'active'],
  builderMode: ['builder', 'mode'],
  turnNumbers: ['builder', 'turnNumbers'],
  availableOperators: ['builder', 'availableOperators'],
  builderMaxGenerationAttempts: ['builder', 'maxGenerationAttempts'],
  builderCards: ['builder', 'cards'],
  builderSlots: ['builder', 'slots'],
  dragObjects: ['builder', 'dragObjects'],
  playerState: ['player', 'state'],
  successfulAttackCount: ['progress', 'successfulAttackCount'],
  pendingBonusChoice: ['progress', 'pendingBonusChoice'],
  nextAttackBonus: ['progress', 'nextAttackBonus'],
  statusCharges: ['status', 'charges'],
  timedBuffs: ['status', 'timedBuffs'],
  enemyTimedDebuffs: ['status', 'enemyTimedDebuffs'],
  playerSkills: ['player', 'skills'],
  selectedSkill: ['menu', 'selectedSkill'],
  selectedSkillIndex: ['menu', 'selectedSkillIndex'],
  commandSelectionIndex: ['menu', 'commandSelectionIndex'],
  itemSelectionIndex: ['menu', 'itemSelectionIndex'],
  itemTargetSkillIndex: ['menu', 'itemTargetSkillIndex'],
  selectedItemEntry: ['menu', 'selectedItemEntry'],
  bonusSelectionIndex: ['menu', 'bonusSelectionIndex'],
  dialogQueue: ['dialog', 'queue'],
  dialogCallback: ['dialog', 'callback'],
  resultPhase: ['dialog', 'resultPhase'],
  resultPhasePayload: ['dialog', 'resultPhasePayload'],
});

export function createBattleState(scene, data = {}) {
  const builderConfig = getDifficultyBuilderConfig(data.difficultyKey || scene.difficultyKey || null);

  return {
    encounter: {
      enemy: cloneDefaultEnemy(data.enemy),
      returnScene: data.returnScene || 'WorldScene',
      enemyKey: data.enemyKey || null,
    },
    battle: {
      enemyCurrentHp: data.enemy?.hp || DEFAULT_ENEMY.hp,
      ended: false,
      currentTurn: 'player',
      logs: [],
    },
    builder: {
      active: false,
      mode: builderConfig.mode,
      turnNumbers: [],
      availableOperators: builderConfig.operators,
      maxGenerationAttempts: builderConfig.maxGenerationAttempts,
      cards: [],
      slots: {},
      dragObjects: [],
    },
    player: {
      state: playerData,
      skills: typeof scene.buildPlayerSkills === 'function' ? scene.buildPlayerSkills(data) : [],
    },
    progress: {
      successfulAttackCount: chainConfig.startCount,
      pendingBonusChoice: false,
      nextAttackBonus: null,
    },
    status: {
      charges: { zeroGuard: 0 },
      timedBuffs: {
        attackBoost: { turns: 0, multiplier: 1 },
        defenseBoost: { turns: 0, multiplier: 1 },
      },
      enemyTimedDebuffs: {
        defenseDown: { turns: 0, multiplier: 1 },
        attackDown: { turns: 0, multiplier: 1 },
      },
    },
    menu: {
      state: battleMenuStates.MAIN,
      selectedAction: null,
      selectedSkill: null,
      selectedSkillIndex: 0,
      commandSelectionIndex: 0,
      itemSelectionIndex: 0,
      itemTargetSkillIndex: 0,
      selectedItemEntry: null,
      bonusSelectionIndex: 0,
    },
    dialog: {
      queue: [],
      callback: null,
      resultPhase: battleResultPhases.NONE,
      resultPhasePayload: {},
    },
  };
}

export const DEFAULT_BATTLE_ACCESSORS = BATTLE_STATE_PATHS;

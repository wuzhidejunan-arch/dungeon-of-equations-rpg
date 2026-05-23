import { playerData } from '../data/playerData.js';
import { playerSkillDefinitions } from '../data/battleData.js';

export const MAX_EQUIPPED_SKILLS = 4;

function getAllSkillIds() {
  return playerSkillDefinitions.map((skill) => skill.id);
}

function getSkillDefinitionMap() {
  return new Map(playerSkillDefinitions.map((skill) => [skill.id, skill]));
}

export function ensurePlayerSkillState() {
  const allIds = getAllSkillIds();

  if (!Array.isArray(playerData.unlockedSkillIds) || playerData.unlockedSkillIds.length === 0) {
    playerData.unlockedSkillIds = [...allIds];
  } else {
    const validUnlocked = playerData.unlockedSkillIds.filter((id) => allIds.includes(id));
    playerData.unlockedSkillIds = validUnlocked.length ? validUnlocked : [...allIds];
  }

  if (!Array.isArray(playerData.equippedSkillIds) || playerData.equippedSkillIds.length === 0) {
    playerData.equippedSkillIds = playerData.unlockedSkillIds.slice(0, MAX_EQUIPPED_SKILLS);
  } else {
    const equipped = playerData.equippedSkillIds.filter((id) => playerData.unlockedSkillIds.includes(id));
    playerData.equippedSkillIds = equipped.slice(0, MAX_EQUIPPED_SKILLS);
  }

  for (const id of playerData.unlockedSkillIds) {
    if (playerData.equippedSkillIds.length >= MAX_EQUIPPED_SKILLS) break;
    if (!playerData.equippedSkillIds.includes(id)) {
      playerData.equippedSkillIds.push(id);
    }
  }

  ensurePlayerSkillResources();

  return playerData;
}

export function ensurePlayerSkillResources() {
  ensureBaseSkillResourceShape();

  const definitionMap = getSkillDefinitionMap();
  const validIds = new Set(playerData.unlockedSkillIds || []);

  Object.keys(playerData.skillStates).forEach((skillId) => {
    if (!validIds.has(skillId) || !definitionMap.has(skillId)) {
      delete playerData.skillStates[skillId];
    }
  });

  for (const skillId of playerData.unlockedSkillIds || []) {
    const definition = definitionMap.get(skillId);
    if (!definition) continue;

    const state = playerData.skillStates[skillId] || {};
    const maxPp = definition.maxPp ?? null;
    let pp = state.pp;

    if (maxPp === null) {
      pp = null;
    } else if (typeof pp !== 'number' || Number.isNaN(pp)) {
      pp = maxPp;
    } else {
      pp = Math.max(0, Math.min(pp, maxPp));
    }

    playerData.skillStates[skillId] = {
      pp,
      maxPp,
    };
  }

  return playerData.skillStates;
}


function ensureSkillStateForIds(skillIds = []) {
  const definitionMap = getSkillDefinitionMap();
  ensureBaseSkillResourceShape();

  skillIds.forEach((skillId) => {
    const definition = definitionMap.get(skillId);
    if (!definition) return;

    if (playerData.skillStates[skillId]) return;
    playerData.skillStates[skillId] = {
      pp: definition.maxPp ?? null,
      maxPp: definition.maxPp ?? null,
    };
  });
}

function ensureBaseSkillResourceShape() {
  if (!playerData.skillStates || typeof playerData.skillStates !== 'object' || Array.isArray(playerData.skillStates)) {
    playerData.skillStates = {};
  }
}

export function getSkillResourceState(skillId) {
  ensurePlayerSkillState();
  return playerData.skillStates[skillId] || null;
}

export function getPlayerSkillDefinitionsWithState(skillIds = null) {
  ensurePlayerSkillState();
  const targetIds = Array.isArray(skillIds) ? skillIds : playerData.unlockedSkillIds;
  ensureSkillStateForIds(targetIds);

  return targetIds
    .map((id) => {
      const definition = playerSkillDefinitions.find((skill) => skill.id === id);
      if (!definition) return null;

      const state = getSkillResourceState(id);
      return {
        ...definition,
        pp: state?.pp ?? definition.maxPp ?? null,
        maxPp: state?.maxPp ?? definition.maxPp ?? null,
      };
    })
    .filter(Boolean);
}

export function getUnlockedPlayerSkillDefinitions() {
  return getPlayerSkillDefinitionsWithState(playerData.unlockedSkillIds);
}

export function getEquippedPlayerSkillDefinitions() {
  return getPlayerSkillDefinitionsWithState(playerData.equippedSkillIds);
}

export function createBattleSkillLoadout(skillIds = null) {
  const skills = getPlayerSkillDefinitionsWithState(skillIds || playerData.equippedSkillIds);
  return skills.map((skill) => ({ ...skill }));
}

export function isSkillEquipped(skillId) {
  ensurePlayerSkillState();
  return playerData.equippedSkillIds.includes(skillId);
}

export function isSkillUsable(skill) {
  if (!skill) return false;
  if (skill.maxPp === null) return true;
  return typeof skill.pp === 'number' && skill.pp > 0;
}

export function getSkillUnavailableReason(skill) {
  if (!skill) return 'Skill is not available.';
  if (skill.maxPp === null) return '';
  if (typeof skill.pp !== 'number' || Number.isNaN(skill.pp)) return `${skill.name} has no uses left.`;
  if (skill.pp <= 0) return `${skill.name} has no uses left.`;
  return '';
}

export function equipSkill(skillId) {
  ensurePlayerSkillState();

  if (!playerData.unlockedSkillIds.includes(skillId)) {
    return { success: false, message: 'Skill is not open yet.' };
  }

  if (playerData.equippedSkillIds.includes(skillId)) {
    return { success: true, message: 'Skill already chosen.' };
  }

  if (playerData.equippedSkillIds.length >= MAX_EQUIPPED_SKILLS) {
    return { success: false, message: `Only ${MAX_EQUIPPED_SKILLS} skills can be chosen.` };
  }

  playerData.equippedSkillIds.push(skillId);
  return { success: true, message: 'Skill chosen.' };
}

export function unequipSkill(skillId) {
  ensurePlayerSkillState();

  if (!playerData.equippedSkillIds.includes(skillId)) {
    return { success: true, message: 'Skill already removed.' };
  }

  if (playerData.equippedSkillIds.length <= 1) {
    return { success: false, message: 'Keep at least 1 skill chosen.' };
  }

  playerData.equippedSkillIds = playerData.equippedSkillIds.filter((id) => id !== skillId);
  return { success: true, message: 'Skill removed.' };
}

export function toggleEquippedSkill(skillId) {
  return isSkillEquipped(skillId) ? unequipSkill(skillId) : equipSkill(skillId);
}

function getSkillRestoreCheck(targetSkillId) {
  ensurePlayerSkillState();

  const definition = playerSkillDefinitions.find((skill) => skill.id === targetSkillId) || null;
  if (!definition) {
    return {
      success: false,
      message: 'Skill not found.',
    };
  }

  const state = getSkillResourceState(targetSkillId);
  if (!state || state.maxPp === null) {
    return {
      success: false,
      message: `${definition.name} cannot be refilled.`,
    };
  }

  if (typeof state.pp !== 'number' || Number.isNaN(state.pp)) {
    return {
      success: false,
      message: `${definition.name} cannot be refilled right now.`,
    };
  }

  if (state.pp >= state.maxPp) {
    return {
      success: false,
      state,
      definition,
      message: `${definition.name} is already full.`,
    };
  }

  return {
    success: true,
    state,
    definition,
  };
}

export function canRestoreSkillUses(targetSkillId) {
  const check = getSkillRestoreCheck(targetSkillId);
  if (!check.success) {
    return check;
  }

  const { state, definition } = check;

  return {
    success: true,
    state,
    definition,
    message: `${definition.name} can be refilled.`,
  };
}

export function applySkillUseRestore(targetSkillId, amount = 'full') {
  ensurePlayerSkillState();

  const check = canRestoreSkillUses(targetSkillId);
  if (!check.success) {
    return check;
  }

  const { state, definition } = check;

  const nextPp = amount === 'full'
    ? state.maxPp
    : Math.min(state.pp + (Number(amount) || 0), state.maxPp);
  const actualRestore = nextPp - state.pp;
  state.pp = nextPp;

  return {
    success: true,
    skillId: targetSkillId,
    skillName: definition.name,
    amount: actualRestore,
    message: amount === 'full'
      ? `${definition.name} is full again.`
      : `${definition.name} got ${actualRestore} uses back.`,
  };
}

export function persistBattleSkillLoadout(skills = []) {
  ensurePlayerSkillState();

  skills.forEach((skill) => {
    if (!skill?.id) return;

    const state = getSkillResourceState(skill.id);
    if (!state || state.maxPp === null) return;

    state.pp = Math.max(0, Math.min(skill.pp ?? state.maxPp, state.maxPp));
  });

  return playerData.skillStates;
}

export function syncBattleSkillStates(skills = []) {
  return persistBattleSkillLoadout(skills);
}

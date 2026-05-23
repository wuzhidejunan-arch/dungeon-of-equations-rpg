import { playerData } from "../data/playerData.js";
import { progressionConfig } from "../config/progressionConfig.js";

const DEFAULT_LEVEL_STATE = {
  level: 1,
  exp: 0,
  expToNext: progressionConfig.leveling.baseExpToNext,
  pendingLevelUpMessages: [],
};

export function ensureLevelState(target = playerData) {
  if (!Array.isArray(target.pendingLevelUpMessages)) {
    target.pendingLevelUpMessages = [];
  }

  if (typeof target.level !== "number" || target.level < 1) {
    target.level = DEFAULT_LEVEL_STATE.level;
  }

  if (typeof target.exp !== "number" || target.exp < 0) {
    target.exp = DEFAULT_LEVEL_STATE.exp;
  }

  if (typeof target.expToNext !== "number" || target.expToNext <= 0) {
    target.expToNext = getRequiredExpForLevel(target.level);
  }

  return target;
}

export function getRequiredExpForLevel(level) {
  const { baseExpToNext, expStepPerLevel } = progressionConfig.leveling;
  return baseExpToNext + Math.max(0, level - 1) * expStepPerLevel;
}

export function grantBattleExp(expAmount) {
  ensureLevelState(playerData);

  const gainedExp = Math.max(0, Math.floor(expAmount || 0));
  const levelUpMessages = [];

  if (gainedExp <= 0) {
    return {
      gainedExp: 0,
      leveledUp: false,
      levelUpMessages,
      previousLevel: playerData.level,
      currentLevel: playerData.level,
    };
  }

  playerData.exp += gainedExp;
  const previousLevel = playerData.level;

  while (playerData.exp >= playerData.expToNext) {
    playerData.exp -= playerData.expToNext;
    playerData.level += 1;
    applyLevelUpReward(playerData, levelUpMessages);
    playerData.expToNext = getRequiredExpForLevel(playerData.level);
  }

  if (levelUpMessages.length > 0) {
    playerData.pendingLevelUpMessages.push(...levelUpMessages);
  }

  return {
    gainedExp,
    leveledUp: levelUpMessages.length > 0,
    levelUpMessages,
    previousLevel,
    currentLevel: playerData.level,
  };
}

function applyLevelUpReward(target, levelUpMessages) {
  const { goldPerLevel, hpGrowth } = progressionConfig.leveling;
  target.gold += goldPerLevel;

  const rewardLines = [`Level Up! Lv.${target.level}`, `+${goldPerLevel} Gold`];
  const maxHpGain = Math.max(0, Number(hpGrowth.maxHpGain) || 0);
  const healOnGain = Math.max(0, Number(hpGrowth.healOnGain) || 0);

  if (maxHpGain > 0) {
    target.maxHp += maxHpGain;
    target.hp = Math.min(target.maxHp, target.hp + healOnGain);
    rewardLines.push(`+${maxHpGain} Max HP`);
  }

  levelUpMessages.push(rewardLines);
}

export function getExpRewardForEnemy(enemy) {
  if (!enemy) return 0;

  if (typeof enemy.expReward === "number") {
    return enemy.expReward;
  }

  return 8;
}

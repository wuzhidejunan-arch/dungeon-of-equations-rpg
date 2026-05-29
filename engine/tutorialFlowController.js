import {
  getCurrentDifficultyKey,
  getDifficultyConfig,
  getDifficultySkillIds,
} from '../config/difficultySettings.js';
import { TutorialRestrictionSystem } from '../domains/tutorial/TutorialRestrictionSystem.js';
import { formatTutorialTemplate as formatTemplateHelper } from '../domains/tutorial/tutorialTemplateHelper.js';
import { isTesterMode } from '../utils/debugState.js';
import { getBattleUIValue } from '../utils/battleSchema.js';
import { createBattleSkillLoadout } from '../utils/playerSkills.js';

function getDataValue(target, key) {
  return target && typeof target === 'object' ? target[key] : null;
}

function getGuidedBattleTutorialConfigForDifficulty(difficultyKey, enemyKey, returnScene) {
  if (returnScene !== 'TrainingScene') {
    return null;
  }

  const trainingConfig = getDifficultyConfig(difficultyKey)?.training || null;
  const guidedBattle = trainingConfig?.guidedBattle || null;
  return enemyKey === guidedBattle?.enemyKey ? guidedBattle : null;
}

export function getBattleTutorialConfig(target = null) {
  const enemyKey = getDataValue(target, 'enemyKey');
  const returnScene = getDataValue(target, 'returnScene');
  const difficultyKey = getCurrentDifficultyKey(getDataValue(target, 'difficultyKey'));
  return getGuidedBattleTutorialConfigForDifficulty(difficultyKey, enemyKey, returnScene);
}

export function isBattleTutorialActive(target = null) {
  return !isTesterMode() && !!getBattleTutorialConfig(target);
}

export function buildBattleSkillLoadoutForContext(target = null) {
  const difficultyKey = getCurrentDifficultyKey(getDataValue(target, 'difficultyKey'));
  const baseSkills = createBattleSkillLoadout(getDifficultySkillIds(difficultyKey));
  const config = getBattleTutorialConfig(target);

  if (!config || isTesterMode()) {
    return baseSkills;
  }

  const allowedSkillIds = Array.isArray(config.allowedSkillIds) ? config.allowedSkillIds : [];
  if (!allowedSkillIds.length) {
    return baseSkills;
  }

  const filtered = baseSkills.filter((skill) => allowedSkillIds.includes(skill.id));
  return filtered.length ? filtered : baseSkills;
}

export function getTutorialRequiredSkillId(target = null) {
  const config = getBattleTutorialConfig(target);
  if (!config) return null;

  if (config.requiredSkillStrategy === 'armor_break_then_heavy') {
    const armorBroken = Boolean(target?.enemyTimedDebuffs?.defenseDown?.turns > 0);
    return armorBroken ? 'heavyStrike' : 'armorBreak';
  }

  return config?.allowedSkillIds?.[0] || null;
}

export function getTutorialRequiredRuleLabel(target = null) {
  return getBattleTutorialConfig(target)?.requiredRuleLabel || 'even';
}

export function getTutorialStepKey(target = null) {
  const config = getBattleTutorialConfig(target);
  if (!config) return null;

  if (config.requiredSkillStrategy === 'armor_break_then_heavy') {
    const armorBroken = Boolean(target?.enemyTimedDebuffs?.defenseDown?.turns > 0);
    return armorBroken ? 'heavy_followup' : 'armor_check';
  }

  return 'guided';
}

export function validateTutorialBuilderAction(scene, payload = {}) {
  const config = getBattleTutorialConfig(scene);
  if (!config || isTesterMode()) {
    return { allowed: true, message: '' };
  }

  const skill = payload.skill || scene?.selectedSkill || null;
  const result = payload.result;
  const operator = payload.operator || null;
  const requiredRule = getTutorialRequiredRuleLabel(scene);
  const skillOk = skill?.id === getTutorialRequiredSkillId(scene);

  if (!skillOk) {
    return {
      allowed: false,
      message: formatTutorialTemplate(
        scene,
        'wrongSkill',
        { skill: getTutorialRequiredSkillName(scene), rule: requiredRule },
        'Use the right skill for this step.',
      ),
    };
  }

  const resultMatchesEnemy = scene?.matchesEnemyRule?.(result, skill, operator);
  if (resultMatchesEnemy) {
    return { allowed: true, message: '' };
  }

  return {
    allowed: false,
    message: [
      `You used ${skill?.name || 'this skill'}.`,
      `Your answer was ${result}.`,
      `This monster needs the correct answer type.`,
      formatTutorialTemplate(scene, 'wrongResult', { skill: skill?.name || 'Skill', rule: requiredRule }, 'Right skill, but the answer was wrong. Try again.'),
    ].join('\n'),
  };
}

export function formatTutorialTemplate(target, templateKey, values = {}, fallback = '') {
  const config = getBattleTutorialConfig(target);
  const template = config?.helperTexts?.[templateKey] || fallback;
  return formatTemplateHelper(template, values);
}

export function getTutorialRequiredSkillName(target = null) {
  const requiredId = getTutorialRequiredSkillId(target);
  const skill = target?.playerSkills?.find((entry) => entry.id === requiredId);
  return skill?.name || (requiredId === 'armorBreak' ? 'Armor Break' : requiredId === 'heavyStrike' ? 'Heavy Strike' : 'Even Attack');
}

export function getTutorialSkillAvailabilityNotice(target = null) {
  const config = getBattleTutorialConfig(target);
  if (!config || isTesterMode()) return '';
  return config?.helperTexts?.skillAvailabilityNotice
    || getBattleUIValue('tutorialSkillLimit', 'Tutorial step: only these skills are open now.');
}

function getTutorialRestrictionSystem(scene) {
  const registries = scene?.battleController?.registries || scene?.game?.app?.container?.get?.('battleRegistries') || {};
  if (!scene.__tutorialRestrictionSystem) {
    scene.__tutorialRestrictionSystem = new TutorialRestrictionSystem({
      ruleRegistry: registries.tutorialRestrictionRegistry || null,
      helpers: {
        formatter: formatTutorialTemplate,
        getRequiredSkillName: getTutorialRequiredSkillName,
        getRequiredRuleLabel: getTutorialRequiredRuleLabel,
      },
    });
  }
  return scene.__tutorialRestrictionSystem;
}

export function getTutorialHelperText(scene) {
  const config = getBattleTutorialConfig(scene);
  if (!config) return '';

  if (config.guideMode === 'challenge_overview') {
    if (scene.menuState === 'dialog') {
      return 'Read the battle message. It tells you if the skill worked.';
    }

    if (scene.builderActive || scene.menuState === 'builder') {
      return 'Attack skills use both rows. Use the Row 1 answer in Row 2.';
    }

    if (scene.menuState === 'skill') {
      const skill = scene.playerSkills?.[scene.selectedSkillIndex];
      if (skill?.category === 'attack') {
        return `${skill.name} uses both rows. Only the final answer counts for the rule.`;
      }

      if (skill?.category === 'guard' || skill?.category === 'buff') {
        return `${skill?.name || 'This skill'} works right away. It does not use the math boxes.`;
      }

      return 'Choose a Challenge skill. Attack skills use both rows. Defend and Self Buff work right away.';
    }

    if (scene.menuState === 'main') {
      return 'Choose Fight. Try Defend or Self Buff first. Then use an attack skill with both rows.';
    }

    return formatTutorialTemplate(scene, 'fallback', {}, 'Use Fight. Attack skills use both rows. Defend and Self Buff work right away.');
  }

  const needSkill = getTutorialRequiredSkillName(scene);
  const needRule = getTutorialRequiredRuleLabel(scene);
  const stepKey = getTutorialStepKey(scene);
  const armorBroken = stepKey === 'heavy_followup';

  if (config.requiredSkillStrategy !== 'armor_break_then_heavy') {
    if (scene.menuState === 'dialog') {
      return formatTutorialTemplate(scene, 'dialog', { skill: needSkill, rule: needRule }, 'Read the battle message. Press Enter.');
    }

    if (scene.builderActive || scene.menuState === 'builder') {
      return formatTutorialTemplate(scene, 'builder', { skill: needSkill, rule: needRule }, `Step 3: Make a ${needRule} answer using + or −. Press Enter.`);
    }

    if (scene.menuState === 'skill') {
      const skill = scene.playerSkills?.[scene.selectedSkillIndex];
      const isCorrect = skill?.id === getTutorialRequiredSkillId(scene);
      return isCorrect
        ? formatTutorialTemplate(scene, 'skillCorrect', { skill: needSkill, rule: needRule }, `Step 2: Good. Press Enter on ${needSkill}.`)
        : formatTutorialTemplate(scene, 'skillWrong', { skill: needSkill, rule: needRule }, `Step 2: Choose ${needSkill}.`);
    }

    if (scene.menuState === 'main') {
      return formatTutorialTemplate(scene, 'mainFightSelected', { skill: needSkill, rule: needRule }, 'Step 1: Choose Fight.');
    }

    return formatTutorialTemplate(scene, 'fallback', { skill: needSkill, rule: needRule }, `Choose Fight. Use ${needSkill}. Make a ${needRule} answer using + or −.`);
  }

  if (scene.menuState === 'dialog') {
    return formatTutorialTemplate(scene, 'dialog', { skill: needSkill, rule: needRule }, 'Read the message box. Press Enter.');
  }

  if (scene.builderActive || scene.menuState === 'builder') {
    if (!armorBroken) {
      return `Step 2: ${needSkill} makes the monster weaker. Use division math.`;
    }
    return `Step 3: Armor is broken. Use ${needSkill}. Make an ${needRule} answer.`;
  }

  if (scene.menuState === 'skill') {
    const skill = scene.playerSkills?.[scene.selectedSkillIndex];
    const isCorrect = skill?.id === getTutorialRequiredSkillId(scene);
    if (!armorBroken) {
      return isCorrect
        ? `Step 1: Good. Use ${needSkill} first. Press Enter.`
        : `Step 1: Start with ${needSkill}. It makes the monster weaker.`;
    }
    return isCorrect
      ? `Step 3: Good. ${needSkill} is the next attack. Press Enter.`
      : `Step 3: Armor is already broken. Now switch to ${needSkill}.`;
  }

  if (scene.menuState === 'main') {
    if (!armorBroken) {
      return 'Step 1: Choose Fight. Use Armor Break first.';
    }
    return 'Step 3: Armor is down. Choose Fight. Use Heavy Strike.';
  }

  return formatTutorialTemplate(scene, 'fallback', { skill: needSkill, rule: needRule }, `Use Fight. Then use ${needSkill}.`);
}

export function getTutorialCommandRestriction(scene, commandKey) {
  const config = getBattleTutorialConfig(scene);
  if (!config || isTesterMode()) {
    return { allowed: true, message: '' };
  }

  return getTutorialRestrictionSystem(scene).evaluate({
    scene,
    actionType: 'command',
    value: commandKey,
    config,
  });
}

export function getTutorialBackRestriction(scene, location = 'main') {
  const config = getBattleTutorialConfig(scene);
  if (!config || isTesterMode()) {
    return { allowed: true, message: '' };
  }

  return getTutorialRestrictionSystem(scene).evaluate({
    scene,
    actionType: 'back',
    value: location,
    config,
  });
}

export function getTutorialSkillRestriction(scene, skill) {
  const config = getBattleTutorialConfig(scene);
  if (!config || isTesterMode()) {
    return { allowed: true, message: '' };
  }

  return getTutorialRestrictionSystem(scene).evaluate({
    scene,
    actionType: 'skill',
    value: skill,
    config,
  });
}

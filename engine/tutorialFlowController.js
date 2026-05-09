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
        'Use the right move for this step.',
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
      `You used ${skill?.name || 'this move'}.`,
      `Your answer was ${result}.`,
      `This monster needs an ${requiredRule} answer.`,
      formatTutorialTemplate(scene, 'wrongResult', { skill: skill?.name || 'Move', rule: requiredRule }, 'Right move, but the answer was wrong. Try again.'),
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
    || getBattleUIValue('tutorialSkillLimit', 'Tutorial step: only these moves are open now.');
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
      return 'Read the answer text. It tells you if the move worked.';
    }

    if (scene.builderActive || scene.menuState === 'builder') {
      return 'Attack moves use both rows. Use the Row 1 answer in Row 2.';
    }

    if (scene.menuState === 'skill') {
      const skill = scene.playerSkills?.[scene.selectedSkillIndex];
      if (skill?.category === 'attack') {
        return `${skill.name} uses both rows. Only the last answer counts for the rule.`;
      }

      if (skill?.category === 'guard' || skill?.category === 'buff') {
        return `${skill?.name || 'This move'} works right away. It does not use the builder.`;
      }

      return 'Choose a Challenge move. Attack moves use both rows. Helper moves work right away.';
    }

    if (scene.menuState === 'main') {
      return 'Choose Fight. Try a helper move first. Then use an attack move with both rows.';
    }

    return formatTutorialTemplate(scene, 'fallback', {}, 'Use Fight. Attack moves use both rows. Helper moves work right away.');
  }

  const needSkill = getTutorialRequiredSkillName(scene);
  const needRule = getTutorialRequiredRuleLabel(scene);
  const stepKey = getTutorialStepKey(scene);
  const armorBroken = stepKey === 'heavy_followup';

  if (scene.menuState === 'dialog') {
    return formatTutorialTemplate(scene, 'dialog', { skill: needSkill, rule: needRule }, 'Read the message box. Press Enter.');
  }

  if (scene.builderActive || scene.menuState === 'builder') {
    if (!armorBroken) {
      return `Step 2: ${needSkill} is a helper move. Use correct division math. The monster rule does not stop it.`;
    }
    return `Step 3: The armor is broken. Now use ${needSkill} and make an ${needRule} answer.`;
  }

  if (scene.menuState === 'skill') {
    const skill = scene.playerSkills?.[scene.selectedSkillIndex];
    const isCorrect = skill?.id === getTutorialRequiredSkillId(scene);
    if (!armorBroken) {
      return isCorrect
        ? `Mini-step 1: Good. ${needSkill} is the setup helper move. Press Enter to continue.`
        : `Mini-step 1: Check the monster rule first. Start with ${needSkill}.`;
    }
    return isCorrect
      ? `Step 3: Good. ${needSkill} is the next attack. Press Enter.`
      : `Step 3: Armor is already broken. Now switch to ${needSkill}.`;
  }

  if (scene.menuState === 'main') {
    if (!armorBroken) {
      return 'Mini-step 1: Read the rule. Choose Fight, then use Armor Break first.';
    }
    return 'Step 3: The armor is down. Choose Fight again and use Heavy Strike.';
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

import { playerData } from '../../../data/playerData.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import {
  buildBattleRulePanelText,
  getBattleText,
  getBattleUIValue,
  getEnemyPrimaryRule,
  getEnemyRuleSummaryText,
  getEntityUIText,
  getSkillDisplayName,
  getSkillPrimaryRule,
} from '../../../utils/battleSchema.js';
import { getDifficultyTrainingConfig } from '../../../config/difficultySettings.js';

function getGuidedIntermediateRuleText(scene) {
  if (!scene.isTrainingGuideBattle?.()) {
    return '';
  }

  const guidedRulePanelVariant = getDifficultyTrainingConfig(scene.difficultyKey)?.guidedRulePanelVariant || 'default';
  if (guidedRulePanelVariant !== 'intermediate') {
    return '';
  }

  return `Rule: Your answer must be ${getEnemyRuleSummaryText(scene.enemy)}.\nUse Armor Break to break armor.`;
}

function getEnemyRulePanelText(scene) {
  if (scene.battleEnded) {
    return '';
  }

  const enemyRule = getEnemyPrimaryRule(scene.enemy);
  return getGuidedIntermediateRuleText(scene) || getEntityUIText(
    scene.enemy,
    'ruleText',
    getBattleUIValue('rulePrefix', `Rule: ${scene.getRuleShortText?.(enemyRule) || enemyRule}`, {
      rule: scene.getRuleShortText?.(enemyRule) || enemyRule,
    }),
  );
}

function formatEnemyHpLabel(scene) {
  return `${scene.enemyCurrentHp}/${scene.enemy?.hp}`;
}

function formatEnemyLevelLabel(enemy) {
  const displayLevel = enemy?.displayLevel;

  return Number.isFinite(displayLevel) ? `Lv.${displayLevel}` : '';
}

export class BattleViewStateBuilder {
  build(scene) {
    const itemEntries = typeof scene.getBattleItemEntries === 'function' ? scene.getBattleItemEntries() : [];
    const commandText = scene.pendingBonusChoice
      ? getBattleText('commands.bonusMenu', 'SAFE HIT\nPOWER HIT')
      : getBattleText('commands.mainMenu', 'FIGHT\nBAG\nRUN');
    const promptText = scene.pendingBonusChoice
      ? getBattleText('prompts.bonusMenu', 'Choose your attack style.')
      : getBattleText('prompts.mainMenu', 'Choose Fight, Bag, or Run.');
    const phase = scene.pendingBonusChoice ? battleResultPhases.RESULT_BUFF : battleResultPhases.INFO;

    return {
      state: scene.menuState,
      hp: {
        enemy: {
          current: scene.enemyCurrentHp,
          max: scene.enemy?.hp,
          ratio: Phaser.Math.Clamp((scene.enemyCurrentHp || 0) / (scene.enemy?.hp || 1), 0, 1),
          label: formatEnemyHpLabel(scene),
        },
        player: {
          current: playerData.hp,
          max: playerData.maxHp,
          ratio: Phaser.Math.Clamp((playerData.hp || 0) / (playerData.maxHp || 1), 0, 1),
          label: `${playerData.hp}/${playerData.maxHp}`,
        },
      },
      texts: {
        enemyName: (scene.enemy?.name || '').toUpperCase(),
        enemyLevel: formatEnemyLevelLabel(scene.enemy),
        playerLevel: `Lv ${playerData.level}`,
        playerInfo: `${playerData.hp}/${playerData.maxHp}`,
        enemyInfo: formatEnemyHpLabel(scene),
        playerBuff: scene.getPlayerEffectSummaryText?.() || scene.getBuffSummaryText?.() || '',
        enemyBuff: scene.getEnemyEffectSummaryText?.() || '',
        rulePanel: buildBattleRulePanelText(scene, { ruleText: getEnemyRulePanelText(scene) }),
        commandText,
        promptText,
      },
      builder: {
        preview: scene.resultPreviewText?.text || '?',
        selectedSkillRule: getSkillPrimaryRule(scene.selectedSkill),
      },
      items: itemEntries,
      skillTargets: (scene.playerSkills || []).map((skill) => {
        const ppText = skill.maxPp === null ? getBattleUIValue('skillUsesInfinite', 'INF') : `${skill.pp}/${skill.maxPp}`;
        return {
          name: getSkillDisplayName(skill),
          uses: ppText,
        };
      }),
      resultPhase: phase,
    };
  }
}

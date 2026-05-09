import { battleStateConfig } from '../data/battleStates.js';
import { battleUIText } from '../data/battleText.js';

export function formatBattleTemplate(template, values = {}) {
  if (typeof template !== 'string' || !template) return '';
  return template.replace(/\{(\w+)\}/g, (_, key) => `${values[key] ?? ''}`);
}

export function getBattleUIText(path, fallback = '') {
  if (!path) return fallback;
  const parts = String(path).split('.');
  let current = battleUIText;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return fallback;
    }
  }
  return typeof current === 'string' ? current : fallback;
}

export function getBattleStateText(state, key, fallback = '') {
  const config = battleStateConfig[state] || null;
  const textKey = config?.[key];
  if (!textKey) return fallback;
  const bucket = key === 'commandTextKey' ? 'commands' : 'prompts';
  return getBattleUIText(`${bucket}.${textKey}`, fallback);
}

export function getSkillPrimaryRule(skill) {
  if (!skill?.condition) return null;
  if (skill.condition.type === 'result_rule') return skill.condition.value || null;
  if (Array.isArray(skill.condition.all)) {
    const resultRule = skill.condition.all.find((entry) => entry?.type === 'result_rule');
    return resultRule?.value || null;
  }
  return null;
}

export function getSkillEffects(skill) {
  return Array.isArray(skill?.effects) ? skill.effects : [];
}

export function getSkillText(skill, key, fallback = '') {
  const value = skill?.ui?.[key];
  return typeof value === 'string' ? value : fallback;
}

export function getSkillTextTemplate(skill, key, fallback = '') {
  const value = skill?.ui?.textTemplates?.[key];
  return typeof value === 'string' ? value : fallback;
}

export function getEnemyAcceptedRules(enemy) {
  if (!Array.isArray(enemy?.rules)) return [];
  return enemy.rules
    .filter((rule) => rule?.type === 'accept_result_rule')
    .map((rule) => rule.value)
    .filter(Boolean);
}

export function describeEnemyRule(rule) {
  if (!rule || rule.type !== 'accept_result_rule') return '';
  if (rule.value === 'exact') {
    return `exactly ${rule.target}`;
  }
  return `${rule.value}`;
}

export function getEnemyRuleSummaryText(enemy) {
  if (!Array.isArray(enemy?.rules)) return 'Any';

  const labels = enemy.rules
    .map((rule) => describeEnemyRule(rule))
    .filter(Boolean);

  if (!labels.length) return 'Any';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

export function getEnemyPrimaryRule(enemy) {
  return getEnemyAcceptedRules(enemy)[0] || null;
}

export function getEnemySkills(enemy) {
  return Array.isArray(enemy?.skills) ? enemy.skills : [];
}

export function getEntityUIText(entity, key, fallback = '') {
  const value = entity?.ui?.[key];
  return typeof value === 'string' ? value : fallback;
}

export function getItemUIText(item, key, fallback = '') {
  const value = item?.ui?.[key];
  return typeof value === 'string' ? value : fallback;
}

export function getTriggeredEntries(entity, trigger) {
  if (!Array.isArray(entity?.counterEffects)) return [];
  return entity.counterEffects.filter((entry) => entry?.trigger === trigger);
}

export function getTriggeredEffects(entity, trigger) {
  return getTriggeredEntries(entity, trigger)
    .filter((entry) => Array.isArray(entry.effects))
    .flatMap((entry) => entry.effects);
}

export function isGuardSkill(skill) {
  return skill?.category === 'guard';
}

export function isDirectAttackSkill(skill) {
  if (!skill) return false;
  if (skill.role === 'attack') return true;
  if (skill.role === 'utility') return false;
  return skill.category === 'attack';
}

export function isUtilitySkill(skill) {
  if (!skill) return false;
  if (skill.role === 'utility') return true;
  return !isGuardSkill(skill) && !isDirectAttackSkill(skill);
}

export function getSkillOperationMarker(skill) {
  if (skill?.operationType === 'multiply') return '[\u00d7]';
  if (skill?.operationType === 'divide') return '[\u00f7]';
  return '';
}

export function formatOperatorForDisplay(operator) {
  if (operator === '*' || operator === '?' || operator === '\u00d7') {
    return '\u00d7';
  }

  if (operator === '/' || operator === '繩' || operator === '\u00f7') {
    return '\u00f7';
  }

  if (operator === '-') {
    return '\u2212';
  }

  if (operator === '+') {
    return '+';
  }

  return `${operator ?? ''}`;
}

export function getSkillOperationLabel(skill) {
  if (skill?.operationType === 'multiply') {
    return getBattleUIValue('skillOperationMultiply', 'Multiplication');
  }
  if (skill?.operationType === 'divide') {
    return getBattleUIValue('skillOperationDivide', 'Division');
  }
  if (skill?.operationType) {
    return getBattleUIValue('skillOperationOther', 'Other');
  }
  return getBattleUIValue('skillOperationNone', 'None');
}

export function getSkillRoleLabel(skill) {
  if (isGuardSkill(skill)) {
    return getBattleUIValue('skillRoleGuard', 'Guard');
  }
  if (isDirectAttackSkill(skill)) {
    return getBattleUIValue('skillRoleAttack', 'Attack');
  }
  if (isUtilitySkill(skill)) {
    return getBattleUIValue('skillRoleUtility', 'Utility');
  }
  return getBattleUIValue('skillRoleUtility', 'Utility');
}

export function getSkillDisplayName(skill, { includeMarker = true } = {}) {
  if (!skill) return '';
  const marker = includeMarker ? getSkillOperationMarker(skill) : '';
  return marker ? `${skill.name} ${marker}` : `${skill.name || ''}`;
}

export function formatInfoRows(rows = [], padSize = 10) {
  return rows
    .filter((row) => row?.label && row?.value)
    .map((row) => `${String(row.label).padEnd(padSize, ' ')} ${row.value}`)
    .join('\n');
}

function getSkillEffectSummary(skill) {
  if (skill?.category === 'guard') {
    return {
      label: getBattleUIValue('skillInfoLabelEffect', 'Effect'),
      value: getBattleUIValue('skillInfoValueBlock', 'Block next hit'),
    };
  }

  const menuInfo = skill?.ui?.menuInfo;
  if (menuInfo && typeof menuInfo.label === 'string') {
    return { label: menuInfo.label, value: `${menuInfo.value ?? ''}` };
  }

  const formula = skill?.damageFormula || null;
  if (!formula) {
    return {
      label: getBattleUIValue('skillInfoLabelEffect', 'Effect'),
      value: getBattleUIValue('skillInfoValueSpecial', 'Special'),
    };
  }

  if (formula.type === 'flat') {
    return {
      label: getBattleUIValue('skillInfoLabelDamage', 'Damage'),
      value: getBattleUIValue('skillInfoValueFlat', `${formula.base ?? 0}`, { base: formula.base ?? 0 }),
    };
  }

  if (formula.type === 'base_plus_chain') {
    const base = formula.base ?? 0;
    const chainScale = formula.chainScale ?? 0;
    return {
      label: getBattleUIValue('skillInfoLabelDamage', 'Damage'),
      value: getBattleUIValue('skillInfoValueChain', `${base}+Chainx${chainScale}`, { base, chainScale }),
    };
  }

  if (formula.type === 'result_based') {
    const mult = formula.multiplier ?? 1;
    return {
      label: getBattleUIValue('skillInfoLabelPower', 'Power'),
      value: getBattleUIValue('skillInfoValueResultBased', `Result x${mult}`, { multiplier: mult }),
    };
  }

  return {
    label: getBattleUIValue('skillInfoLabelPower', 'Power'),
    value: getBattleUIValue('skillInfoValueSpecial', 'Special'),
  };
}

export function getSkillDetailRows(skill) {
  if (!skill) return [];

  return [
    {
      label: getBattleUIValue('skillInfoLabelRole', 'Role'),
      value: getSkillRoleLabel(skill),
    },
    {
      label: getBattleUIValue('skillInfoLabelOperation', 'Operation'),
      value: getSkillOperationLabel(skill),
    },
    getSkillEffectSummary(skill),
  ];
}

export function buildBattleRulePanelText(scene, { ruleText = '' } = {}) {
  const chain = scene?.getChainConfig?.() || { defaultText: 'Chain', maxCount: 0 };
  const bonusText = scene?.nextAttackBonus === 'guard'
    ? getBattleText('ui.nextBonusGuard', '')
    : scene?.nextAttackBonus === 'double'
      ? getBattleText('ui.nextBonusDouble', '')
      : scene?.pendingBonusChoice
        ? getBattleText('ui.bonusReady', '')
        : getBattleUIValue(
          'chainCounter',
          `${chain.defaultText}: ${scene?.successfulAttackCount || 0}/${chain.maxCount || 0}`,
          {
            label: chain.defaultText,
            count: scene?.successfulAttackCount || 0,
            max: chain.maxCount || 0,
          },
        );

  return `${ruleText}\n${bonusText}`.trim();
}

export function getBattleText(path, fallback = '', values = {}) {
  return formatBattleTemplate(getBattleUIText(path, fallback), values);
}

export function getBattleLogText(key, fallback = '', values = {}) {
  return getBattleText(`logs.${key}`, fallback, values);
}

export function getBattleSystemText(key, fallback = '', values = {}) {
  return getBattleText(`system.${key}`, fallback, values);
}

export function getBattleUIValue(key, fallback = '', values = {}) {
  return getBattleText(`ui.${key}`, fallback, values);
}

export function getSkillMenuInfo(skill) {
  const [, , summaryRow = { label: '', value: '' }] = getSkillDetailRows(skill);
  return summaryRow;
}

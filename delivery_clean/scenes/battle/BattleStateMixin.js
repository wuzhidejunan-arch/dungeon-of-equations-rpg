import { chainConfig } from '../../data/battleData.js';
import { battleMenuStates, battleStateConfig } from '../../data/battleStates.js';
import { getBattleUsableItems } from '../../utils/inventory.js';
import { getBattleUIValue } from '../../utils/battleSchema.js';
import { buildBattleSkillLoadoutForContext } from '../../engine/tutorialFlowController.js';

function formatEffectLabel(label, turns) {
  return `${label} ${turns}`;
}

export const BattleStateMixin = {
  buildPlayerSkills(data = null) {
    return buildBattleSkillLoadoutForContext({
      enemyKey: data?.enemyKey || this.enemyKey || null,
      returnScene: data?.returnScene || this.returnScene || null,
    });
  },

  getChainConfig() {
    return chainConfig;
  },

  getBattleMenuStates() {
    return battleMenuStates;
  },

  getBattleStateConfig(state = this.menuState) {
    return battleStateConfig[state] || null;
  },

  setBattleMenuState(nextState) {
    this.menuState = nextState;
    if (typeof this.applyBattleStateUI === 'function') {
      this.applyBattleStateUI(nextState);
    }
    return this.menuState;
  },

  isBattleMenuState(state) {
    return this.menuState === state;
  },

  getPlayerBattleState() {
    return this.playerState || null;
  },

  getBattleItemEntries() {
    return getBattleUsableItems();
  },

  getActiveAttackMultiplier() {
    return this.timedBuffs?.attackBoost?.turns > 0 ? this.timedBuffs.attackBoost.multiplier || 1 : 1;
  },

  consumeAttackBuffTurn() {
    const buff = this.timedBuffs?.attackBoost;

    if (!buff || buff.turns <= 0) {
      return;
    }

    buff.turns = Math.max(buff.turns - 1, 0);
    if (buff.turns === 0) {
      buff.multiplier = 1;
    }
  },

  getActiveDefenseMultiplier() {
    return this.timedBuffs?.defenseBoost?.turns > 0 ? (this.timedBuffs.defenseBoost.multiplier ?? 1) : 1;
  },

  consumeDefenseBuffTurn() {
    const buff = this.timedBuffs?.defenseBoost;

    if (!buff || buff.turns <= 0) {
      return;
    }

    buff.turns = Math.max(buff.turns - 1, 0);
    if (buff.turns === 0) {
      buff.multiplier = 1;
    }
  },

  getEnemyDefenseMultiplier() {
    return this.enemyTimedDebuffs?.defenseDown?.turns > 0 ? this.enemyTimedDebuffs.defenseDown.multiplier || 1 : 1;
  },

  getActiveEnemyAttackMultiplier() {
    return this.enemyTimedDebuffs?.attackDown?.turns > 0 ? this.enemyTimedDebuffs.attackDown.multiplier || 1 : 1;
  },

  consumeEnemyDebuffTurns() {
    ['defenseDown', 'attackDown'].forEach((key) => {
      const debuff = this.enemyTimedDebuffs?.[key];
      if (!debuff || debuff.turns <= 0) return;
      debuff.turns = Math.max(debuff.turns - 1, 0);
      if (debuff.turns === 0) debuff.multiplier = 1;
    });
  },

  getPlayerEffectSummaryText() {
    const parts = [];

    if (this.timedBuffs?.attackBoost?.turns > 0) {
      const turns = this.timedBuffs.attackBoost.turns;
      parts.push(getBattleUIValue('buffAttackShort', formatEffectLabel('ATK↑', turns), { turns }));
    }

    if (this.timedBuffs?.defenseBoost?.turns > 0) {
      const turns = this.timedBuffs.defenseBoost.turns;
      parts.push(getBattleUIValue('buffDefenseShort', formatEffectLabel('DEF↑', turns), { turns }));
    }

    return parts.join(' | ');
  },

  getEnemyEffectSummaryText() {
    const parts = [];

    if (this.enemyTimedDebuffs?.defenseDown?.turns > 0) {
      const turns = this.enemyTimedDebuffs.defenseDown.turns;
      parts.push(getBattleUIValue('enemyDebuffDefenseShort', formatEffectLabel('DEF↓', turns), { turns }));
    }

    if (this.enemyTimedDebuffs?.attackDown?.turns > 0) {
      const turns = this.enemyTimedDebuffs.attackDown.turns;
      parts.push(getBattleUIValue('enemyDebuffAttackShort', formatEffectLabel('ATK↓', turns), { turns }));
    }

    return parts.join(' | ');
  },

  getBuffSummaryText() {
    return this.getPlayerEffectSummaryText();
  },
};

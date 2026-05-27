import { chainConfig } from '../../data/battleData.js';
import { battleMenuStates, battleStateConfig } from '../../data/battleStates.js';
import { getBattleUsableItems } from '../../utils/inventory.js';
import { buildBattleSkillLoadoutForContext } from '../../engine/tutorialFlowController.js';

function formatTurns(turns) {
  const safeTurns = Math.max(1, Number(turns) || 1);
  return `${safeTurns} ${safeTurns === 1 ? 'turn' : 'turns'}`;
}

function formatBattleStatusLabel(label, turns) {
  return `${label}: ${formatTurns(turns)}`;
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
      parts.push(formatBattleStatusLabel('Attack Up', turns));
    }

    const guardTurns = Math.max(
      Number(this.timedBuffs?.defenseBoost?.turns) || 0,
      Number(this.getStatusCharge?.('zeroGuard') || this.statusCharges?.zeroGuard || 0) > 0 ? 1 : 0,
      this.nextAttackBonus === 'guard' ? 1 : 0,
    );
    if (guardTurns > 0) {
      parts.push(formatBattleStatusLabel('Guard', guardTurns));
    }

    if (this.nextAttackBonus === 'double') {
      parts.push('Power: 1 hit');
    }

    return parts.slice(0, 2).join('\n');
  },

  getEnemyEffectSummaryText() {
    const parts = [];

    if (this.enemyTimedDebuffs?.attackDown?.turns > 0) {
      const turns = this.enemyTimedDebuffs.attackDown.turns;
      parts.push(formatBattleStatusLabel('Attack Down', turns));
    }

    if (this.enemyTimedDebuffs?.defenseDown?.turns > 0) {
      const turns = this.enemyTimedDebuffs.defenseDown.turns;
      parts.push(formatBattleStatusLabel('Defense Down', turns));
    }

    return parts.slice(0, 2).join('\n');
  },

  getBuffSummaryText() {
    return this.getPlayerEffectSummaryText();
  },
};

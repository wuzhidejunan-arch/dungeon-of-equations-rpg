import { battleMenuStates } from '../../data/battleStates.js';
import { battleResultPhases } from '../../data/battlePhases.js';
import { attackBonusDefinitions } from '../../data/battleData.js';
import { formatBattleTemplate, getBattleUIText } from '../../utils/battleSchema.js';

export const BattleBonusFlowMixin = {
  checkAndPromptAttackBonus() {
    const chain = this.getChainConfig();
    if (this.successfulAttackCount < chain.triggerCount || this.pendingBonusChoice || this.battleEnded) {
      return;
    }

    this.successfulAttackCount = this.getChainConfig().startCount;
    this.pendingBonusChoice = true;
    this.setBattleMenuState(battleMenuStates.MAIN);
    this.renderCommandMenu(getBattleUIText('commands.bonusMenu', 'SAFE HIT\nPOWER HIT'));
    this.renderTipText('');
    this.renderResultText(
      formatBattleTemplate(getBattleUIText('prompts.bonusReady', '{triggerCount} successful hits! Choose your next-turn bonus.'), { triggerCount: chain.triggerCount }),
      battleResultPhases.RESULT_BUFF,
      { triggerCount: chain.triggerCount },
    );
  },

  selectNextAttackBonus(bonusType) {
    const bonusDefinition = attackBonusDefinitions[bonusType];
    this.pendingBonusChoice = false;

    if (!bonusDefinition) {
      this.showMainMenu();
      return;
    }

    (bonusDefinition.effects || []).forEach((effect) => {
      this.applyEffect(effect, { skills: this.playerSkills });
    });
    this.refreshBattleUI();

    this.renderResultText(bonusDefinition.resultText, battleResultPhases.RESULT_BUFF, { bonusType });
    this.addBattleLog(bonusDefinition.logText);
    this.showMainMenu();
  },
};

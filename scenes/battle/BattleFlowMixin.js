import { battleResultPhases } from '../../data/battlePhases.js';
import { battleMenuStates } from '../../data/battleStates.js';
import { getBattleStateText } from '../../utils/battleSchema.js';

export const BattleFlowMixin = {
  updateBattleFlow() {
    if (this.battleEnded) return;

    if (this.battleController) {
      this.battleController.processCurrentInput();
      return;
    }

    this.processBattleInput?.();
  },

  resolveAttack(result, expression, operator = null) {
    if (this.battleController) {
      return this.battleController.resolveAttack(result, expression, operator);
    }
    return null;
  },

  winBattle() {
    if (this.battleController) {
      return this.battleController.winBattle();
    }
    return null;
  },

  loseBattle() {
    if (this.battleController) {
      return this.battleController.loseBattle();
    }
    return null;
  },

  returnToMainMenuWithPrompt(prompt = null, phase = battleResultPhases.INFO) {
    this.showMainMenu();
    this.renderResultText(prompt || getBattleStateText(battleMenuStates.MAIN, 'resultTextKey', 'Choose Fight, Bag, or Run.'), phase);
  },
};

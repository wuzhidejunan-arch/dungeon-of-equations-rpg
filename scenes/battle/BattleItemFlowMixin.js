import { battleReturnMenus } from '../../data/battleStates.js';
import { battleResultPhases } from '../../data/battlePhases.js';
import { consumeItem } from '../../utils/inventory.js';
import { getBattleText, getBattleUIText } from '../../utils/battleSchema.js';

export const BattleItemFlowMixin = {
  useSelectedItem() {
    const items = this.getBattleItemEntries();
    const entry = items[this.itemSelectionIndex] || null;

    if (!entry) {
      this.renderResultText(getBattleUIText('prompts.noItemSelected', 'No item here.'), battleResultPhases.RESULT_ITEM);
      this.openItemMenu();
      return;
    }

    if (entry.definition?.chooseSkillTarget) {
      this.selectedItemEntry = entry;
      this.openItemTargetMenu();
      return;
    }

    this.useItemByEntry(entry);
  },

  useItemByEntry(entry, targetSkillId = null) {
    if (!entry) {
      this.renderResultText(getBattleUIText('prompts.noItemSelected', 'No item here.'), battleResultPhases.RESULT_ITEM);
      return;
    }

    const result = this.battleController?.itemSystem?.resolve({
      entry,
      targetSkillId,
    }) || consumeItem(entry.name, {
      scene: this,
      skills: this.playerSkills,
      targetSkillId,
      applyEffect: (effect, context, options) => this.applyEffect(effect, context, options),
    });

    this.renderResultText(result.message, battleResultPhases.RESULT_ITEM);
    this.addBattleLog(result.message);
    this.refreshBattleUI();

    if (!result.success) {
      if (result.reopenMenu === 'itemTarget') {
        this.selectedItemEntry = entry;
        this.openItemTargetMenu();
      } else {
        this.openItemMenu();
      }
      return;
    }

    this.selectedItemEntry = null;
    this.itemTargetSkillIndex = 0;
    this.enemyTurn(
      result.endTurnLines || [
        { phase: battleResultPhases.RESULT_ITEM, text: result.message },
        { phase: battleResultPhases.INFO, text: getBattleText('prompts.battleEndTurn', 'Your turn ended.') },
      ],
      null,
      result.endTurnOptions || {
        returnMenu: battleReturnMenus.MAIN,
        returnPrompt: getBattleUIText('prompts.mainMenu', 'Choose Fight, Bag, or Run.'),
      },
    );
  },
};

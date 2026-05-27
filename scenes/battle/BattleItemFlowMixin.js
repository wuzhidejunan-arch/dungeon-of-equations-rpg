import { battleReturnMenus } from '../../data/battleStates.js';
import { battleResultPhases } from '../../data/battlePhases.js';
import { consumeItem } from '../../utils/inventory.js';
import { getBattleText, getBattleUIText } from '../../utils/battleSchema.js';
import { audioKeys } from '../../config/audioKeys.js';
import { playSfx } from '../../utils/sfxManager.js';

function shouldPlayPotionSfx(entry) {
  const itemName = String(entry?.name || '');
  const effects = Array.isArray(entry?.definition?.effects) ? entry.definition.effects : [];
  return /potion/i.test(itemName) || effects.some((effect) => effect?.type === 'healHp');
}

function isHealthPotionEntry(entry) {
  const itemName = String(entry?.name || entry?.definition?.name || '');
  const effects = Array.isArray(entry?.definition?.effects) ? entry.definition.effects : [];
  return itemName === 'Potion' && effects.some((effect) => effect?.type === 'healHp');
}

function playPotionSfx(scene, entry) {
  if (!shouldPlayPotionSfx(entry)) return;
  playSfx(scene, audioKeys.sfx.potion, {
    volume: 0.5,
    cooldownMs: 200,
    maxDurationMs: 1200,
    allowOverlap: false,
  });
}

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
    playPotionSfx(this, entry);

    if (isHealthPotionEntry(entry)) {
      this.setTurn('player');
      this.openMainMenu();
      this.renderResultText(result.message, battleResultPhases.RESULT_ITEM);
      this.refreshBattleUI();
      return;
    }

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

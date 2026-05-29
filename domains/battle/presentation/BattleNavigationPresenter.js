import { battleMenuStates, battleReturnMenus } from '../../../data/battleStates.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import { getBattleStateText, getBattleUIText } from '../../../utils/battleSchema.js';

export class BattleNavigationPresenter {
  constructor({ scene, presenter = null, menuPresenter = null } = {}) {
    this.scene = scene;
    this.presenter = presenter;
    this.menuPresenter = menuPresenter;
  }

  openMainMenu() {
    const scene = this.scene;
    if (scene.battleEnded) return;

    scene.setBattleMenuState(battleMenuStates.MAIN);
    scene.showCombinedBox(false);
    scene.hideSkillMenuUI?.();

    if (scene.pendingBonusChoice) {
      scene.bonusSelectionIndex = 0;
    } else {
      scene.commandSelectionIndex = 0;
    }

    this.menuPresenter?.showMainMenu?.() || this.presenter?.showMainMenu?.();
  }

  openSkillMenu() {
    const scene = this.scene;
    scene.setBattleMenuState(battleMenuStates.SKILL);
    scene.showCombinedBox(false);
    scene.selectedSkillIndex = 0;
    scene.renderResultText(
      getBattleStateText(battleMenuStates.SKILL, 'resultTextKey', 'Choose a skill.'),
      battleResultPhases.INFO,
    );
    scene.showSkillMenuUI?.();
    scene.updateSkillMenuUI?.();
  }

  openItemMenu() {
    const scene = this.scene;
    scene.setBattleMenuState(battleMenuStates.ITEM);
    scene.itemSelectionIndex = 0;
    scene.showCombinedBox(false);
    scene.hideSkillMenuUI?.();
    this.presenter?.showItemMenu?.();
  }

  openItemTargetMenu() {
    const scene = this.scene;
    scene.setBattleMenuState(battleMenuStates.ITEM_TARGET);
    scene.itemTargetSkillIndex = 0;
    scene.showCombinedBox(false);
    scene.hideSkillMenuUI?.();
    this.presenter?.showItemTargetMenu?.();
  }

  finalizeTurnReturn(options = {}) {
    const scene = this.scene;
    const returnPrompt = options.returnPrompt || getBattleUIText('prompts.mainMenu', 'Choose Fight, Bag, or Run.');
    const returnMenu = options.returnMenu || battleReturnMenus.MAIN;

    scene.setTurn('player');
    scene.refreshBattleUI();
    scene.checkAndPromptAttackBonus?.();

    if (scene.pendingBonusChoice) {
      scene.showMainMenu?.();
      return;
    }

    if (returnMenu === battleReturnMenus.SKILL) {
      this.openSkillMenu();
      scene.renderResultText(returnPrompt || getBattleUIText('prompts.skillMenu', 'Choose a skill.'), battleResultPhases.INFO);
      return;
    }

    if (returnMenu === battleReturnMenus.ITEM) {
      this.openItemMenu();
      scene.renderResultText(returnPrompt || getBattleUIText('prompts.itemMenu', 'Choose an item. Press Esc to go back.'), battleResultPhases.RESULT_ITEM);
      return;
    }

    scene.showMainMenu?.();
    scene.renderResultText(returnPrompt, battleResultPhases.INFO);
  }
}

import { battleMenuStates, battleReturnMenus } from '../data/battleStates.js';
import { battleResultPhases } from '../data/battlePhases.js';
import { getBattleStateText, getBattleUIText } from '../utils/battleSchema.js';

export function openMainMenu(scene) {
  if (scene.battleNavigationPresenter) {
    return scene.battleNavigationPresenter.openMainMenu();
  }

  if (scene.battleEnded) return;

  scene.setBattleMenuState(battleMenuStates.MAIN);
  scene.showCombinedBox(false);
  scene.hideSkillMenuUI?.();

  if (scene.pendingBonusChoice) {
    scene.bonusSelectionIndex = 0;
  } else {
    scene.commandSelectionIndex = 0;
  }

  scene.renderMainMenuView();
}

export function openSkillMenu(scene) {
  if (scene.battleNavigationPresenter) {
    return scene.battleNavigationPresenter.openSkillMenu();
  }

  scene.setBattleMenuState(battleMenuStates.SKILL);
  scene.showCombinedBox(false);
  scene.selectedSkillIndex = 0;
  scene.renderResultText(
    getBattleStateText(battleMenuStates.SKILL, 'resultTextKey', 'Choose a skill.'),
    battleResultPhases.INFO,
  );
  scene.showSkillMenuUI();
  scene.updateSkillMenuUI();
}

export function openItemMenu(scene) {
  if (scene.battleNavigationPresenter) {
    return scene.battleNavigationPresenter.openItemMenu();
  }

  const items = scene.getBattleItemEntries();

  scene.setBattleMenuState(battleMenuStates.ITEM);
  scene.itemSelectionIndex = 0;
  scene.showCombinedBox(false);
  scene.hideSkillMenuUI?.();
  scene.renderItemMenuView(items);
}

export function openItemTargetMenu(scene) {
  if (scene.battleNavigationPresenter) {
    return scene.battleNavigationPresenter.openItemTargetMenu();
  }

  scene.setBattleMenuState(battleMenuStates.ITEM_TARGET);
  scene.itemTargetSkillIndex = 0;
  scene.showCombinedBox(false);
  scene.hideSkillMenuUI?.();
  scene.renderItemTargetMenuView();
}

export function finalizeTurnReturn(scene, options = {}) {
  if (scene.battleNavigationPresenter) {
    return scene.battleNavigationPresenter.finalizeTurnReturn(options);
  }

  const returnPrompt = options.returnPrompt || getBattleUIText('prompts.mainMenu', 'What will you do?');
  const returnMenu = options.returnMenu || battleReturnMenus.MAIN;

  scene.setTurn('player');
  scene.refreshBattleUI();
  scene.checkAndPromptAttackBonus();

  if (scene.pendingBonusChoice) {
    scene.showMainMenu();
    return;
  }

  if (returnMenu === battleReturnMenus.SKILL) {
    scene.openSkillMenu();
    scene.renderResultText(returnPrompt || getBattleUIText('prompts.skillMenu', 'Choose a skill.'), battleResultPhases.INFO);
    return;
  }

  if (returnMenu === battleReturnMenus.ITEM) {
    scene.openItemMenu();
    scene.renderResultText(returnPrompt || getBattleUIText('prompts.itemMenu', 'Choose an item. Esc to go back.'), battleResultPhases.RESULT_ITEM);
    return;
  }

  scene.showMainMenu();
  scene.renderResultText(returnPrompt, battleResultPhases.INFO);
}

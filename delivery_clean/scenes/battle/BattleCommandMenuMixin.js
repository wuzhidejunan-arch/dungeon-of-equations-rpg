export const BattleCommandMenuMixin = {
  handleMainMenuInput() {
    return this.battleMenuCoordinator?.handleMainMenuInput?.() || null;
  },

  handleBonusMenuInput() {
    return this.battleMenuCoordinator?.handleBonusMenuInput?.() || null;
  },

  handleItemMenuInput() {
    return this.battleMenuCoordinator?.handleItemMenuInput?.() || null;
  },

  handleItemTargetMenuInput() {
    return this.battleMenuCoordinator?.handleItemTargetMenuInput?.() || null;
  },

  updateCommandCursor() {
    return this.battleMenuCoordinator?.updateCommandCursor?.() || null;
  },

  hideCommandCursor() {
    return this.battleMenuCoordinator?.hideCommandCursor?.() || null;
  },

  showMainMenu() {
    return this.openMainMenu();
  },
};

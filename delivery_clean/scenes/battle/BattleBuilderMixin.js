export const BattleBuilderMixin = {
  createBuilderUI() {
    return this.battleBuilderCoordinator?.createBuilderUI?.() || null;
  },

  registerDragHandlers() {
    return this.battleBuilderCoordinator?.registerDragHandlers?.() || null;
  },

  handleBuilderInput() {
    return this.battleBuilderCoordinator?.handleBuilderInput?.() || null;
  },

  openBuilder(actionType) {
    return this.battleBuilderCoordinator?.openBuilder?.(actionType) || null;
  },

  closeBuilder(resetAction = true) {
    return this.battleBuilderCoordinator?.closeBuilder?.(resetAction) || null;
  },

  hideBuilderAfterConfirm() {
    return this.battleBuilderCoordinator?.hideBuilderAfterConfirm?.() || null;
  },

  resetBuilderSlots(visible = false) {
    return this.battleBuilderCoordinator?.resetBuilderSlots?.(visible) || null;
  },

  clearBuilderCards() {
    return this.battleBuilderCoordinator?.clearBuilderCards?.() || null;
  },

  createBuilderCards() {
    return this.battleBuilderCoordinator?.createBuilderCards?.() || null;
  },

  tryPlaceCardInSlot(pointer, card) {
    return this.battleBuilderCoordinator?.tryPlaceCardInSlot?.(pointer, card) || null;
  },

  assignCardToSlot(card, slot) {
    return this.battleBuilderCoordinator?.assignCardToSlot?.(card, slot) || null;
  },

  resetCardPosition(card) {
    return this.battleBuilderCoordinator?.resetCardPosition?.(card) || null;
  },

  clearBuilderSlots() {
    return this.battleBuilderCoordinator?.clearBuilderSlots?.() || null;
  },

  returnToSkillMenu() {
    return this.battleBuilderCoordinator?.returnToSkillMenu?.() || null;
  },

  refreshPreview() {
    return this.battleBuilderCoordinator?.refreshPreview?.() || null;
  },

  confirmBuilderAction() {
    return this.battleBuilderCoordinator?.confirmBuilderAction?.() || null;
  },
};

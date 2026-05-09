export const BattleInputMixin = {
  isConfirmPressed() {
    return this.battleController?.isConfirmPressed?.() || false;
  },

  isBackPressed() {
    return this.battleController?.isBackPressed?.() || false;
  },

  isClearPressed() {
    return this.battleController?.isClearPressed?.() || false;
  },

  isDirectionPressed(direction) {
    return this.battleController?.isDirectionPressed?.(direction) || false;
  },

  moveMenuIndex(currentIndex, count, offset) {
    return this.battleController?.moveMenuIndex?.(currentIndex, count, offset) || 0;
  },

  getBattleInputHandler() {
    return this.battleController?.getCurrentInputHandler?.() || null;
  },

  processBattleInput() {
    return this.battleController?.processCurrentInput?.() || null;
  },

  processDirectionInput(mapping = {}) {
    return this.battleController?.processDirectionInput?.(mapping) || false;
  },
};

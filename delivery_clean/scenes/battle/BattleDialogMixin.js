export const BattleDialogMixin = {
  startBattleIntro() {
    return this.battleDialogCoordinator?.startBattleIntro?.() || null;
  },

  normalizeDialogEntry(entry) {
    return this.battleDialogCoordinator?.normalizeDialogEntry?.(entry) || null;
  },

  showDialogSequence(lines, onComplete = null) {
    return this.battleDialogCoordinator?.showDialogSequence?.(lines, onComplete) || null;
  },

  showNextDialogLine() {
    return this.battleDialogCoordinator?.showNextDialogLine?.() || null;
  },

  handleDialogInput() {
    return this.battleDialogCoordinator?.handleDialogInput?.() || null;
  },
};

export const BattleTurnMixin = {
  resolveEnemyTurnOutcome(activeBonus = null) {
    if (this.battleController) {
      return this.battleController.resolveEnemyTurnOutcome(activeBonus);
    }
    return null;
  },

  finalizeTurnReturn(options = {}) {
    return this.battlePresentation?.finalizeTurnReturn?.(options) || null;
  },

  playEnemyTurnSequence(playerLines = [], activeBonus = null, options = {}) {
    if (this.battleController) {
      return this.battleController.playEnemyTurnSequence(playerLines, activeBonus, options);
    }
    return null;
  },
};

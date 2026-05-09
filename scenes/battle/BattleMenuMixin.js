export const BattleMenuMixin = {
  openMainMenu() {
    return this.battleMenuCoordinator?.openMainMenu?.() || null;
  },

  openSkillMenu() {
    return this.battleMenuCoordinator?.openSkillMenu?.() || null;
  },

  openItemMenu() {
    return this.battleMenuCoordinator?.openItemMenu?.() || null;
  },

  openItemTargetMenu() {
    return this.battleMenuCoordinator?.openItemTargetMenu?.() || null;
  },
};

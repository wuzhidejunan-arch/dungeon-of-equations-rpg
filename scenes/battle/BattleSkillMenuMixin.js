export const BattleSkillMenuMixin = {
  handleSkillMenuInput() {
    return this.battleMenuCoordinator?.handleSkillMenuInput?.() || null;
  },

  moveSkillCursor(offset) {
    return this.battleMenuCoordinator?.moveSkillCursor?.(offset) || null;
  },

  showSkillMenuUI() {
    return this.battleMenuCoordinator?.showSkillMenuUI?.() || null;
  },

  hideSkillMenuUI() {
    return this.battleMenuCoordinator?.hideSkillMenuUI?.() || null;
  },

  updateSkillMenuUI() {
    return this.battleMenuCoordinator?.updateSkillMenuUI?.() || null;
  },

  selectSkill(skillIndex) {
    return this.battleMenuCoordinator?.selectSkill?.(skillIndex) || null;
  },
};

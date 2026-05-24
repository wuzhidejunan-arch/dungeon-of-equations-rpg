import {
  formatTutorialTemplate,
  getBattleTutorialConfig,
  getTutorialHelperText,
  getTutorialRequiredRuleLabel,
  getTutorialRequiredSkillId,
  getTutorialRequiredSkillName,
  isBattleTutorialActive,
} from '../../engine/tutorialFlowController.js';

export const BattleTutorialMixin = {
  isTrainingGuideBattle() {
    return isBattleTutorialActive(this);
  },

  createTrainingGuideUI() {
    this.trainingGuideBox = this.add
      .rectangle(400, 112, 520, 64, 0x0f172a, 0.92)
      .setStrokeStyle(3, 0xb9823b, 0.95)
      .setDepth(500)
      .setVisible(false);

    this.trainingGuideText = this.add
      .text(400, 112, '', {
        fontSize: '18px',
        color: '#f8e6b0',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 470 },
      })
      .setOrigin(0.5)
      .setDepth(501)
      .setVisible(false);
  },

  updateTrainingGuideUI() {
    if (!this.trainingGuideBox || !this.trainingGuideText) return;

    if (!this.isTrainingGuideBattle() || this.battleEnded) {
      this.trainingGuideBox.setVisible(false);
      this.trainingGuideText.setVisible(false);
      return;
    }

    const helper = getTutorialHelperText(this);

    this.trainingGuideBox.setVisible(true);
    this.trainingGuideText.setText(helper);
    this.trainingGuideText.setVisible(true);
  },

  getTrainingBattleConfig() {
    return getBattleTutorialConfig(this);
  },

  formatTrainingGuideText(template, values) {
    return formatTutorialTemplate(this, '', values, template);
  },

  getTrainingRequiredSkillId() {
    return getTutorialRequiredSkillId(this);
  },

  getTrainingRequiredSkillName() {
    return getTutorialRequiredSkillName(this);
  },

  getTrainingRequiredRuleLabel() {
    return getTutorialRequiredRuleLabel(this);
  },

  showTrainingGuideReminder(message) {
    this.renderResultText(message);
  },
};

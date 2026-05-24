import {
  formatTutorialTemplate,
  getBattleTutorialConfig,
  getTutorialHelperText,
  getTutorialRequiredRuleLabel,
  getTutorialRequiredSkillId,
  getTutorialRequiredSkillName,
  isBattleTutorialActive,
} from '../../engine/tutorialFlowController.js';

const LOWER_PANEL_TEXT_X = 95;

function setLowerPanelTextPositions(scene, { resultY, ruleY, tipY }) {
  scene.resultText?.setPosition?.(LOWER_PANEL_TEXT_X, resultY);
  scene.ruleText?.setPosition?.(LOWER_PANEL_TEXT_X, ruleY);
  scene.tipText?.setPosition?.(LOWER_PANEL_TEXT_X, tipY);
}

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

  applyMediumChallengeCommandLowerPanelLayout() {
    if (
      (this.difficultyKey !== 'intermediate' && this.difficultyKey !== 'challenge') ||
      this.pendingBonusChoice
    ) {
      return;
    }

    setLowerPanelTextPositions(this, { resultY: 445, ruleY: 499, tipY: 527 });
  },

  showTrainingGuideReminder(message) {
    const isGuidedBattle = this.isTrainingGuideBattle?.();

    if (
      message === 'Stay in this lesson battle.' &&
      this.difficultyKey === 'intermediate' &&
      isGuidedBattle
    ) {
      setLowerPanelTextPositions(this, { resultY: 448, ruleY: 489, tipY: 517 });
    }

    if (
      this.difficultyKey === 'intermediate' &&
      isGuidedBattle &&
      (
        message === 'Bag is locked in this lesson.\nChoose Fight.' ||
        message === 'Run is locked in this lesson.\nChoose Fight.'
      )
    ) {
      setLowerPanelTextPositions(this, { resultY: 445, ruleY: 499, tipY: 527 });
    }

    if (
      this.difficultyKey === 'challenge' &&
      isGuidedBattle &&
      (
        message === 'Bag is locked in this practice.\nChoose Fight.' ||
        message === 'Run is locked in this practice.\nChoose Fight.'
      )
    ) {
      setLowerPanelTextPositions(this, { resultY: 445, ruleY: 499, tipY: 527 });
    }

    if (
      this.difficultyKey !== 'intermediate' &&
      (
        message === 'Bag is locked in this lesson.\nChoose Fight.' ||
        message === 'Run is locked in this lesson.\nChoose Fight.'
      )
    ) {
      this.resultText?.setPosition?.(95, 452);
    }
    this.renderResultText(message);
  },
};

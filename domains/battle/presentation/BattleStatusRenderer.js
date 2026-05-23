const ENEMY_NAME_MAX_WIDTH = 182;
const ENEMY_NAME_BASE_FONT_SIZE = 22;
const ENEMY_NAME_MIN_FONT_SIZE = 12;

function setFittedEnemyName(node, text = '') {
  if (!node) return;

  node.setWordWrapWidth?.(0);
  node.setText(text || '');
  node.setFontSize?.(ENEMY_NAME_BASE_FONT_SIZE);

  let fontSize = ENEMY_NAME_BASE_FONT_SIZE;
  while (node.width > ENEMY_NAME_MAX_WIDTH && fontSize > ENEMY_NAME_MIN_FONT_SIZE) {
    fontSize -= 1;
    node.setFontSize?.(fontSize);
  }
}

export class BattleStatusRenderer {
  constructor(scene) {
    this.scene = scene;
  }

  setTextNode(node, text = '') {
    if (!node) return;
    node.setText(text || '');
  }

  renderRulePanel(text = '') {
    this.setTextNode(this.scene.ruleText, text);
  }

  renderSkillInfo(text = '') {
    this.setTextNode(this.scene.skillInfoText, text);
  }

  renderSkillOptions(skills = []) {
    (this.scene.skillOptionTexts || []).forEach((node, index) => {
      this.setTextNode(node, skills[index]?.displayName || skills[index]?.name || '');
    });
  }

  updateHpBars(viewState = {}) {
    const enemyRatio = viewState?.hp?.enemy?.ratio || 0;
    const playerRatio = viewState?.hp?.player?.ratio || 0;

    if (this.scene.enemyHpBarFill) {
      this.scene.enemyHpBarFill.width = 220 * enemyRatio;
    }

    if (this.scene.playerHpBarFill) {
      this.scene.playerHpBarFill.width = 220 * playerRatio;
    }
  }

  refreshStatus(viewState = {}) {
    setFittedEnemyName(this.scene.enemyNameText, viewState?.texts?.enemyName || '');
    this.setTextNode(this.scene.playerLevelText, viewState?.texts?.playerLevel || '');
    this.setTextNode(this.scene.enemyInfoText, viewState?.hp?.enemy?.label || '');
    this.setTextNode(this.scene.enemyBuffText, viewState?.texts?.enemyBuff || '');
    this.setTextNode(this.scene.playerInfoText, viewState?.hp?.player?.label || '');
    this.setTextNode(this.scene.playerBuffText, viewState?.texts?.playerBuff || '');
    this.renderRulePanel(viewState?.texts?.rulePanel || '');
    this.scene.renderTipText?.('');
    this.updateHpBars(viewState);
  }
}

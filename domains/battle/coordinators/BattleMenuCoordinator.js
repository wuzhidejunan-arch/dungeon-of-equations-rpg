import { isSkillUsable } from '../../../utils/playerSkills.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import { getBattleText } from '../../../utils/battleSchema.js';
import { activateChallengeUtilitySkill, shouldChallengeSkillBypassBuilder } from '../../../engine/builderController.js';
import { audioKeys } from '../../../config/audioKeys.js';
import { playSfx } from '../../../utils/sfxManager.js';

export class BattleMenuCoordinator {
  constructor({ scene }) {
    this.scene = scene;
  }

  playUiSfx(key) {
    playSfx(this.scene, key);
  }

  playMoveIfChanged(before, after) {
    if (before !== after) {
      this.playUiSfx(audioKeys.sfx.uiMove);
    }
  }

  handleMainMenuInput() {
    const scene = this.scene;
    if (scene.currentTurn !== 'player') return;

    if (scene.pendingBonusChoice) {
      this.handleBonusMenuInput();
      return;
    }

    if (scene.processDirectionInput({
      up: () => {
        const before = scene.commandSelectionIndex;
        scene.commandSelectionIndex = scene.moveMenuIndex(scene.commandSelectionIndex, 3, -1);
        this.playMoveIfChanged(before, scene.commandSelectionIndex);
        this.updateCommandCursor();
      },
      down: () => {
        const before = scene.commandSelectionIndex;
        scene.commandSelectionIndex = scene.moveMenuIndex(scene.commandSelectionIndex, 3, 1);
        this.playMoveIfChanged(before, scene.commandSelectionIndex);
        this.updateCommandCursor();
      },
    })) {
      return;
    }

    if (scene.isConfirmPressed()) {
      this.playUiSfx(audioKeys.sfx.uiConfirm);
      if (scene.commandSelectionIndex === 0) {
        this.openSkillMenu();
      } else if (scene.commandSelectionIndex === 1) {
        const rule = scene.battleController?.getTutorialCommandRestriction?.('bag') || { allowed: true, message: '' };
        if (!rule.allowed) {
          scene.showTrainingGuideReminder?.(rule.message);
        } else {
          this.openItemMenu();
        }
      } else {
        const rule = scene.battleController?.getTutorialCommandRestriction?.('run') || { allowed: true, message: '' };
        if (!rule.allowed) {
          scene.showTrainingGuideReminder?.(rule.message);
        } else {
          scene.runAway();
        }
      }
      return;
    }

    if (scene.isBackPressed()) {
      this.playUiSfx(audioKeys.sfx.uiBack);
      const rule = scene.battleController?.getTutorialBackRestriction?.('main') || { allowed: true, message: '' };
      if (!rule.allowed) {
        scene.showTrainingGuideReminder?.(rule.message);
      } else {
        scene.runAway();
      }
    }
  }

  handleBonusMenuInput() {
    const scene = this.scene;
    if (scene.processDirectionInput({
      left: () => {
        const before = scene.bonusSelectionIndex;
        scene.bonusSelectionIndex = 0;
        this.playMoveIfChanged(before, scene.bonusSelectionIndex);
        this.updateCommandCursor();
      },
      up: () => {
        const before = scene.bonusSelectionIndex;
        scene.bonusSelectionIndex = 0;
        this.playMoveIfChanged(before, scene.bonusSelectionIndex);
        this.updateCommandCursor();
      },
      right: () => {
        const before = scene.bonusSelectionIndex;
        scene.bonusSelectionIndex = 1;
        this.playMoveIfChanged(before, scene.bonusSelectionIndex);
        this.updateCommandCursor();
      },
      down: () => {
        const before = scene.bonusSelectionIndex;
        scene.bonusSelectionIndex = 1;
        this.playMoveIfChanged(before, scene.bonusSelectionIndex);
        this.updateCommandCursor();
      },
    })) {
      return;
    }

    if (scene.isConfirmPressed()) {
      this.playUiSfx(audioKeys.sfx.uiConfirm);
      if (scene.bonusSelectionIndex === 0) {
        scene.selectNextAttackBonus('guard');
      } else {
        scene.selectNextAttackBonus('double');
      }
    }
  }

  handleItemMenuInput() {
    const scene = this.scene;
    if (scene.currentTurn !== 'player') return;

    const itemCount = scene.getBattleItemEntries().length;

    if (itemCount <= 0) {
      if (scene.isConfirmPressed() || scene.isBackPressed()) {
        this.playUiSfx(scene.isBackPressed() ? audioKeys.sfx.uiBack : audioKeys.sfx.uiConfirm);
        this.openMainMenu();
      }
      return;
    }

    if (scene.processDirectionInput({
      up: () => {
        const before = scene.itemSelectionIndex;
        scene.itemSelectionIndex = scene.moveMenuIndex(scene.itemSelectionIndex, itemCount, -1);
        this.playMoveIfChanged(before, scene.itemSelectionIndex);
        this.updateCommandCursor();
      },
      down: () => {
        const before = scene.itemSelectionIndex;
        scene.itemSelectionIndex = scene.moveMenuIndex(scene.itemSelectionIndex, itemCount, 1);
        this.playMoveIfChanged(before, scene.itemSelectionIndex);
        this.updateCommandCursor();
      },
    })) {
      return;
    }

    if (scene.isConfirmPressed()) {
      this.playUiSfx(audioKeys.sfx.uiConfirm);
      scene.useSelectedItem();
      return;
    }

    if (scene.isBackPressed()) {
      this.playUiSfx(audioKeys.sfx.uiBack);
      this.openMainMenu();
    }
  }

  handleItemTargetMenuInput() {
    const scene = this.scene;
    if (scene.currentTurn !== 'player') return;

    const skillCount = scene.playerSkills.length;

    if (scene.processDirectionInput({
      up: () => {
        const before = scene.itemTargetSkillIndex;
        scene.itemTargetSkillIndex = scene.moveMenuIndex(scene.itemTargetSkillIndex, skillCount, -1);
        this.playMoveIfChanged(before, scene.itemTargetSkillIndex);
        this.updateCommandCursor();
      },
      down: () => {
        const before = scene.itemTargetSkillIndex;
        scene.itemTargetSkillIndex = scene.moveMenuIndex(scene.itemTargetSkillIndex, skillCount, 1);
        this.playMoveIfChanged(before, scene.itemTargetSkillIndex);
        this.updateCommandCursor();
      },
    })) {
      return;
    }

    if (scene.isConfirmPressed()) {
      this.playUiSfx(audioKeys.sfx.uiConfirm);
      const skill = scene.playerSkills[scene.itemTargetSkillIndex];
      if (skill && scene.selectedItemEntry) {
        scene.useItemByEntry(scene.selectedItemEntry, skill.id);
      }
      return;
    }

    if (scene.isBackPressed()) {
      this.playUiSfx(audioKeys.sfx.uiBack);
      scene.selectedItemEntry = null;
      this.openItemMenu();
    }
  }

  handleSkillMenuInput() {
    const scene = this.scene;
    if (scene.currentTurn !== 'player') return;

    if (scene.processDirectionInput({
      up: () => this.moveSkillCursor(-2),
      down: () => this.moveSkillCursor(2),
      left: () => {
        if (scene.selectedSkillIndex % 2 === 1) {
          this.moveSkillCursor(-1);
        }
      },
      right: () => {
        if (scene.selectedSkillIndex % 2 === 0) {
          this.moveSkillCursor(1);
        }
      },
    })) {
      return;
    }

    if (scene.isConfirmPressed()) {
      this.playUiSfx(audioKeys.sfx.uiConfirm);
      this.selectSkill(scene.selectedSkillIndex);
      return;
    }

    if (scene.isBackPressed()) {
      this.playUiSfx(audioKeys.sfx.uiBack);
      this.hideSkillMenuUI();
      this.openMainMenu();
    }
  }

  moveSkillCursor(offset) {
    const scene = this.scene;
    const nextIndex = scene.selectedSkillIndex + offset;

    if (nextIndex < 0 || nextIndex >= scene.playerSkills.length) {
      return;
    }

    scene.selectedSkillIndex = nextIndex;
    this.playUiSfx(audioKeys.sfx.uiMove);
    this.updateSkillMenuUI();
  }

  selectSkill(skillIndex) {
    const scene = this.scene;
    const skill = scene.playerSkills[skillIndex];
    if (!skill) return;

    if (!isSkillUsable(skill)) {
      this.playUiSfx(audioKeys.sfx.answerWrong);
      scene.renderResultText(
        'No uses left. Use a potion to restore.',
        battleResultPhases.INFO,
      );
      this.updateSkillMenuUI();
      return;
    }

    const tutorialRule = scene.battleController?.getTutorialSkillRestriction?.(skill) || { allowed: true, message: '' };
    if (!tutorialRule.allowed) {
      this.playUiSfx(audioKeys.sfx.answerWrong);
      scene.renderResultText(tutorialRule.message, battleResultPhases.INFO);
      this.updateSkillMenuUI();
      return;
    }

    scene.selectedSkill = skill;
    scene.selectedSkillIndex = skillIndex;

    if (shouldChallengeSkillBypassBuilder(scene, skill)) {
      activateChallengeUtilitySkill(scene, skill);
      return;
    }

    scene.openBuilder('attack');
  }

  updateCommandCursor() {
    const scene = this.scene;
    return scene.battlePresentation?.updateCommandCursor?.() || null;
  }

  hideCommandCursor() {
    const scene = this.scene;
    return scene.battlePresentation?.hideCommandCursor?.() || scene.commandCursorText.setVisible(false);
  }

  showSkillMenuUI() {
    const scene = this.scene;
    return scene.battlePresentation?.showSkillMenu?.() || scene.setSkillMenuVisible(true);
  }

  hideSkillMenuUI() {
    const scene = this.scene;
    return scene.battlePresentation?.hideSkillMenu?.() || scene.setSkillMenuVisible(false);
  }

  updateSkillMenuUI() {
    const scene = this.scene;
    return scene.battlePresentation?.updateSkillMenu?.() || null;
  }

  openMainMenu() {
    const scene = this.scene;
    return scene.battlePresentation?.openMainMenu?.() || null;
  }

  openSkillMenu() {
    const scene = this.scene;
    return scene.battlePresentation?.openSkillMenu?.() || null;
  }

  openItemMenu() {
    const scene = this.scene;
    return scene.battlePresentation?.openItemMenu?.() || null;
  }

  openItemTargetMenu() {
    const scene = this.scene;
    return scene.battlePresentation?.openItemTargetMenu?.() || null;
  }
}

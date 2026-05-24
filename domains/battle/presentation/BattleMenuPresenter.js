import { battleMenuStates } from '../../../data/battleStates.js';
import {
  formatInfoRows,
  getBattleUIValue,
  getSkillDetailRows,
  getSkillDisplayName,
} from '../../../utils/battleSchema.js';
import { getTutorialSkillAvailabilityNotice } from '../../../engine/tutorialFlowController.js';

export class BattleMenuPresenter {
  constructor({ scene, presenter = null } = {}) {
    this.scene = scene;
    this.presenter = presenter;
  }

  showMainMenu() {
    return this.presenter?.showMainMenu?.();
  }

  showItemMenu() {
    return this.presenter?.showItemMenu?.();
  }

  showItemTargetMenu() {
    return this.presenter?.showItemTargetMenu?.();
  }

  setSkillMenuVisible(visible) {
    this.scene.setSkillMenuVisible?.(visible);
  }

  showSkillMenu() {
    this.setSkillMenuVisible(true);
  }

  hideSkillMenu() {
    this.setSkillMenuVisible(false);
  }

  updateSkillMenu() {
    const scene = this.scene;
    const skillPositions = Array.isArray(scene.skillMenuPositions) && scene.skillMenuPositions.length
      ? scene.skillMenuPositions.map((position) => ({
        x: position.x - 24,
        y: position.y,
      }))
      : [
        { x: 116, y: 497 },
        { x: 298, y: 497 },
        { x: 116, y: 523 },
        { x: 298, y: 523 },
      ];

    const skillEntries = (scene.playerSkills || []).map((skill) => ({
      ...skill,
      displayName: getSkillDisplayName(skill),
    }));

    scene.renderSkillOptions?.(skillEntries);

    const cursorPos = skillPositions[scene.selectedSkillIndex] || skillPositions[0];
    if (scene.skillCursorText && cursorPos) {
      scene.skillCursorText.setPosition(cursorPos.x, cursorPos.y);
    }
    scene.resultText?.setPosition?.(95, 445);

    const skill = scene.playerSkills?.[scene.selectedSkillIndex];
    const tutorialNotice = getTutorialSkillAvailabilityNotice(scene);
    scene.renderTipText?.(tutorialNotice);

    if (!skill) {
      scene.renderSkillInfo?.('');
      return;
    }

    const ppText = skill.maxPp === null
      ? getBattleUIValue('skillUsesInfinite', 'INF')
      : `${skill.pp}/${skill.maxPp}`;

    const rows = [
      ...getSkillDetailRows(skill),
      { label: getBattleUIValue('skillUsesLabel', 'Left'), value: ppText },
    ];

    scene.renderSkillInfo?.(formatInfoRows(rows));
  }

  updateCommandCursor() {
    const scene = this.scene;
    const mainPositions = Array.isArray(scene.commandMenuRowPositions) && scene.commandMenuRowPositions.length
      ? scene.commandMenuRowPositions.map((row) => ({
        x: row.cursorX,
        y: row.y,
      }))
      : [];
    const layouts = {
      main: mainPositions,
      bonus: [
        { x: 590, y: 463 },
        { x: 590, y: 505 },
      ],
    };

    const buildVerticalLayout = (count) => {
      const step = count > 4 ? 24 : 28;
      return Array.from({ length: count }, (_, index) => ({
        x: 590,
        y: 450 + (index * step),
      }));
    };

    let positions = layouts.main;
    let index = scene.commandSelectionIndex;

    if (scene.pendingBonusChoice && scene.menuState === battleMenuStates.MAIN) {
      positions = layouts.bonus;
      index = scene.bonusSelectionIndex;
    } else if (scene.menuState === battleMenuStates.ITEM) {
      positions = (scene.itemMenuRowPositions || []).map((row) => ({
        x: row.cursorX,
        y: row.y,
      }));
      if (!positions.length) {
        positions = buildVerticalLayout(Math.max(scene.getBattleItemEntries?.().length || 0, 1));
      }
      index = scene.itemSelectionIndex;
    } else if (scene.menuState === battleMenuStates.ITEM_TARGET) {
      positions = buildVerticalLayout(Math.max(scene.playerSkills?.length || 0, 1));
      index = scene.itemTargetSkillIndex;
    }

    const pos = positions[index] || positions[0] || layouts.main[0];
    scene.commandCursorText?.setPosition(pos.x, pos.y);
    scene.commandCursorText?.setVisible(true);
  }

  hideCommandCursor() {
    this.scene.commandCursorText?.setVisible(false);
  }
}

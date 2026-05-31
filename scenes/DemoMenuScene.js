import { demoMenuConfig } from '../config/demoConfig.js';
import { audioKeys } from '../config/audioKeys.js';
import { getDifficultySkillIds } from '../config/difficultySettings.js';
import { GUIDE_STEP_IDS } from '../data/guideSteps.js';
import { enemyData } from '../data/enemyData.js';
import { playerData } from '../data/playerData.js';
import { beginDemoSession, restoreDemoSession } from '../utils/demoSession.js';
import { ensureGuideState } from '../utils/guideSystem.js';
import { ensurePlayerSkillState } from '../utils/playerSkills.js';
import { playSfx, preloadSfxAssets } from '../utils/sfxManager.js';
import { ensureTrainingState } from '../utils/trainingSystem.js';

const MENU_MODES = Object.freeze({
  MAIN: 'main',
  BATTLE: 'battle',
  TRAINING: 'training',
});

const DEMO_MENU_BACKGROUND_KEY = 'demoMenuBackground';
const DEMO_MENU_BACKGROUND_PATH = 'assets/images/ui/demo_menu_background.png';
const MENU_START_X = 230;
const MENU_START_Y = 180;
const MENU_LINE_GAP = 48;
const MENU_FONT_SIZE = '28px';
const SELECTOR_OFFSET_X = -42;

const MENU_TEXT_STYLE = Object.freeze({
  fontSize: MENU_FONT_SIZE,
  color: '#e5e7eb',
  fontStyle: 'bold',
});

const SELECTED_MENU_TEXT_STYLE = Object.freeze({
  fontSize: MENU_FONT_SIZE,
  color: '#facc15',
  fontStyle: 'bold',
});

export class DemoMenuScene extends Phaser.Scene {
  constructor() {
    super('DemoMenuScene');
  }

  init(data = {}) {
    this.returnScene = data.returnScene || 'StartScene';
    this.mode = Object.values(MENU_MODES).includes(data.initialMenuLayer)
      ? data.initialMenuLayer
      : MENU_MODES.MAIN;
    this.selectedIndex = 0;
  }

  preload() {
    if (!this.textures.exists(DEMO_MENU_BACKGROUND_KEY)) {
      this.load.image(DEMO_MENU_BACKGROUND_KEY, DEMO_MENU_BACKGROUND_PATH);
    }
    preloadSfxAssets(this, [audioKeys.sfx.uiMove, audioKeys.sfx.uiConfirm]);
  }

  create() {
    this.stopBattleDemoBgm();

    this.add.image(400, 300, DEMO_MENU_BACKGROUND_KEY)
      .setDisplaySize(800, 600);

    this.selectorText = this.add.text(MENU_START_X + SELECTOR_OFFSET_X, MENU_START_Y, '▶', {
      fontSize: MENU_FONT_SIZE,
      color: '#facc15',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.optionTexts = Array.from({ length: 4 }, (_, index) => this.add.text(
      MENU_START_X,
      MENU_START_Y + index * MENU_LINE_GAP,
      '',
      MENU_TEXT_STYLE,
    ).setOrigin(0, 0.5));

    this.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.renderMenu();
  }

  stopBattleDemoBgm() {
    [audioKeys.bgm.battle, audioKeys.bgm.bossBattle].forEach((bgmKey) => {
      this.sound?.stopByKey?.(bgmKey);
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keyUP)) {
      this.moveSelection(-1);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.moveSelection(1);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
      this.confirmSelection();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
      this.goBack();
    }
  }

  getCurrentMenu() {
    if (this.mode === MENU_MODES.BATTLE) {
      return {
        title: demoMenuConfig.battleTitle,
        options: demoMenuConfig.battleOptions,
      };
    }

    if (this.mode === MENU_MODES.TRAINING) {
      return {
        title: demoMenuConfig.trainingTitle,
        options: demoMenuConfig.trainingOptions,
      };
    }

    return {
      title: demoMenuConfig.title,
      options: demoMenuConfig.mainOptions,
    };
  }

  renderMenu() {
    const menu = this.getCurrentMenu();
    this.optionTexts.forEach((text, index) => {
      const option = menu.options[index];
      if (!option) {
        text.setVisible(false);
        return;
      }

      text.setText(option.label);
      text.setStyle(index === this.selectedIndex ? SELECTED_MENU_TEXT_STYLE : MENU_TEXT_STYLE);
      text.setVisible(true);
    });
    this.selectorText.setPosition(
      MENU_START_X + SELECTOR_OFFSET_X,
      MENU_START_Y + this.selectedIndex * MENU_LINE_GAP,
    );
  }

  moveSelection(delta) {
    const options = this.getCurrentMenu().options;
    const previousIndex = this.selectedIndex;
    this.selectedIndex = (this.selectedIndex + delta + options.length) % options.length;
    if (this.selectedIndex !== previousIndex) {
      playSfx(this, audioKeys.sfx.uiMove);
    }
    this.renderMenu();
  }

  confirmSelection() {
    const option = this.getCurrentMenu().options[this.selectedIndex];
    if (!option) return;

    playSfx(this, audioKeys.sfx.uiConfirm);

    if (option.action === 'battle') {
      this.mode = MENU_MODES.BATTLE;
      this.selectedIndex = 0;
      this.renderMenu();
      return;
    }

    if (option.action === 'training') {
      this.mode = MENU_MODES.TRAINING;
      this.selectedIndex = 0;
      this.renderMenu();
      return;
    }

    if (option.action === 'trainingDemo') {
      this.startTrainingDemo(option.difficultyKey);
      return;
    }

    if (option.action === 'battleDemo') {
      this.startBattleDemo(option.difficultyKey, option.enemyKey);
      return;
    }

    if (option.action === 'levelSelect') {
      restoreDemoSession();
      this.scene.start('StartScene');
      return;
    }

    if (option.action === 'back') {
      this.goBack();
      return;
    }

    if (option.action === 'placeholder') {
      this.renderMenu();
    }
  }

  startTrainingDemo(difficultyKey) {
    const selectedDifficultyKey = difficultyKey || 'beginner';
    beginDemoSession();

    this.prepareDemoRuntime(selectedDifficultyKey);

    this.scene.start('TrainingScene', {
      returnScene: 'DemoMenuScene',
      returnSceneData: {
        initialMenuLayer: MENU_MODES.TRAINING,
      },
      demoMode: true,
      demoDifficultyKey: selectedDifficultyKey,
    });
  }

  startBattleDemo(difficultyKey, enemyKey) {
    const selectedDifficultyKey = difficultyKey || 'beginner';
    const selectedEnemy = enemyData[enemyKey] || null;
    if (!selectedEnemy) {
      this.renderMenu();
      return;
    }

    beginDemoSession();
    this.prepareDemoRuntime(selectedDifficultyKey);

    this.scene.start('BattleScene', {
      demoMode: true,
      demoBattle: true,
      difficultyKey: selectedDifficultyKey,
      demoDifficultyKey: selectedDifficultyKey,
      enemy: selectedEnemy,
      enemyKey,
      returnScene: 'DemoMenuScene',
      returnSceneData: {
        initialMenuLayer: MENU_MODES.BATTLE,
        demoMode: true,
        demoBattle: true,
      },
    });
  }

  prepareDemoRuntime(difficultyKey) {
    playerData.difficulty = difficultyKey;
    playerData.hp = playerData.maxHp;
    playerData.pendingLevelUpMessages = [];
    playerData.unlockedSkillIds = getDifficultySkillIds(difficultyKey);
    playerData.equippedSkillIds = getDifficultySkillIds(difficultyKey);
    ensurePlayerSkillState();

    (playerData.equippedSkillIds || []).forEach((skillId) => {
      const state = playerData.skillStates?.[skillId];
      if (state && state.maxPp !== null) {
        state.pp = state.maxPp;
      }
    });

    const trainingState = ensureTrainingState(playerData);
    trainingState.completedStages = [];
    trainingState.activeBattleStage = null;
    trainingState.lastBattleWinKey = null;

    const guideState = ensureGuideState(playerData);
    guideState.currentStepId = GUIDE_STEP_IDS.TUTORIAL_DONE;
    guideState.tutorialDone = true;
  }

  goBack() {
    if (this.mode === MENU_MODES.MAIN) {
      restoreDemoSession();
      this.scene.start(this.returnScene);
      return;
    }

    this.mode = MENU_MODES.MAIN;
    this.selectedIndex = 0;
    this.renderMenu();
  }
}

import { BaseScene } from './BaseScene.js';
import { playerData } from '../data/playerData.js';
import { createPanel } from '../utils/ui.js';
import { TrainingController } from '../domains/training/TrainingController.js';
import { TrainingStore } from '../domains/training/TrainingStore.js';
import {
  createTrainingState,
  DEFAULT_TRAINING_ACCESSORS,
  TRAINING_MODES,
} from '../domains/training/TrainingStateFactory.js';
import { createTrainingPresentationSuite } from '../domains/training/presentation/createTrainingPresentationSuite.js';
import { audioKeys } from '../config/audioKeys.js';
import { playBgm, preloadBgmAssets } from '../utils/musicManager.js';
import { playSfx, preloadSfxAssets } from '../utils/sfxManager.js';

const TRAINING_UI_ASSETS = {
  woodButton: {
    key: 'trainingWoodButton',
    path: 'assets/ui/training/wood_button.png',
  },
  parchmentPanel: {
    key: 'trainingParchmentPanel',
    path: 'assets/ui/training/parchment_panel.png',
  },
};

export class TrainingScene extends BaseScene {
  constructor() {
    super('TrainingScene');
  }

  init(data) {
    this.trainingStore = new TrainingStore(createTrainingState(data));
    this.trainingStore.bindScene(this, DEFAULT_TRAINING_ACCESSORS);

    const app = this.game?.app || window.gameApp || null;
    this.trainingController = new TrainingController({
      scene: this,
      store: this.trainingStore,
      eventBus: app?.eventBus || null,
      stageRegistry: app?.container?.get('trainingStageRegistry') || null,
    });
  }

  preload() {
    preloadBgmAssets(this, audioKeys.bgm.normal);
    preloadSfxAssets(this);
    this.preloadResultModalAssets();
    this.load.image(TRAINING_UI_ASSETS.woodButton.key, TRAINING_UI_ASSETS.woodButton.path);
    this.load.image(TRAINING_UI_ASSETS.parchmentPanel.key, TRAINING_UI_ASSETS.parchmentPanel.path);
  }

  create() {
    playBgm(this, audioKeys.bgm.normal);

    const { width, height } = this.scale;
    const boardWidth = Math.min(width - 20, 940);
    const boardHeight = Math.min(height - 10, 630);
    const boardX = width / 2;
    const boardY = height / 2;
    const boardLeft = boardX - boardWidth / 2;
    const boardRight = boardX + boardWidth / 2;
    const boardTop = boardY - boardHeight / 2;
    const boardBottom = boardY + boardHeight / 2;
    const safeLeft = boardLeft + 110;
    const safeRight = boardRight - 110;
    const safeTop = boardTop + 95;
    const controlBarY = boardBottom - 90;
    const controlBarHeight = 58;
    const textBottom = controlBarY - (controlBarHeight / 2) - 18;
    const leftColumnX = safeLeft + 18;
    const rightColumnX = Math.min(boardX + 40, safeRight - 330);
    const focusedContentX = safeLeft + 35;

    this.trainingLayout = {
      board: {
        x: boardX,
        y: boardY,
        width: boardWidth,
        height: boardHeight,
        left: boardLeft,
        right: boardRight,
        top: boardTop,
        bottom: boardBottom,
      },
      safe: {
        left: safeLeft,
        right: safeRight,
        top: safeTop,
        bottom: textBottom,
      },
      menu: {
        markerX: safeLeft,
        listX: leftColumnX,
        listY: safeTop + 100,
        listWrapWidth: Math.min(285, Math.max(160, boardX - leftColumnX - 45)),
        detailX: rightColumnX,
        detailTitleY: safeTop + 100,
        detailBodyY: safeTop + 145,
        detailWrapWidth: Math.max(300, safeRight - rightColumnX),
      },
      focused: {
        x: focusedContentX,
        detailTitleY: safeTop + 75,
        detailBodyY: safeTop + 108,
        contentY: safeTop + 185,
        wrapWidth: Math.max(520, safeRight - focusedContentX),
      },
      controls: {
        x: boardX,
        y: controlBarY,
        textY: controlBarY - 3,
        width: Math.min(700, boardWidth - 240),
        height: controlBarHeight,
      },
    };

    this.add.rectangle(width / 2, height / 2, width, height, 0x1b120b);
    this.panel = this.add
      .image(boardX, boardY, TRAINING_UI_ASSETS.parchmentPanel.key)
      .setDisplaySize(boardWidth, boardHeight)
      .setDepth(1);

    this.titleText = this.add.text(boardX, safeTop, 'Training', {
      fontSize: '34px',
      color: '#2a1508',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    this.subText = this.add.text(boardX, safeTop + 33, 'Choose a stage', {
      fontSize: '18px',
      color: '#3a2412',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    this.listPanel = this.add.zone(leftColumnX + 90, (safeTop + textBottom) / 2, 240, textBottom - safeTop);
    this.detailPanel = this.add.zone(rightColumnX + 170, (safeTop + textBottom) / 2, 340, textBottom - safeTop);
    this.contentPanel = this.add.zone(rightColumnX + 170, (safeTop + textBottom) / 2, 340, textBottom - safeTop);
    this.controlsPanel = this.add
      .image(boardX, controlBarY, TRAINING_UI_ASSETS.woodButton.key)
      .setDisplaySize(this.trainingLayout.controls.width, controlBarHeight)
      .setDepth(1);

    this.stageListText = this.add.text(leftColumnX, this.trainingLayout.menu.listY, '', {
      fontSize: '18px',
      color: '#2f2418',
      fontStyle: 'bold',
      lineSpacing: 7,
      wordWrap: { width: this.trainingLayout.menu.listWrapWidth },
    }).setDepth(2);

    this.detailTitleText = this.add.text(rightColumnX, this.trainingLayout.menu.detailTitleY, '', {
      fontSize: '23px',
      color: '#2a1508',
      fontStyle: 'bold',
    }).setDepth(2);

    this.detailText = this.add.text(rightColumnX, this.trainingLayout.menu.detailBodyY, '', {
      fontSize: '17px',
      color: '#3a2412',
      fontStyle: 'bold',
      lineSpacing: 8,
      wordWrap: { width: this.trainingLayout.menu.detailWrapWidth },
    }).setDepth(2);

    this.contentText = this.add.text(rightColumnX, this.trainingLayout.focused.contentY, '', {
      fontSize: '17px',
      color: '#3a2412',
      fontStyle: 'bold',
      lineSpacing: 9,
      wordWrap: { width: this.trainingLayout.menu.detailWrapWidth },
    }).setDepth(2);

    this.controlsText = this.add.text(boardX, this.trainingLayout.controls.textY, '', {
      fontSize: '16px',
      color: '#ffe6a3',
      fontStyle: 'bold',
      stroke: '#3a2412',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(2);

    this.cursorText = this.add.text(this.trainingLayout.menu.markerX, this.trainingLayout.menu.listY, '▶', {
      fontSize: '18px',
      color: '#8a5a14',
      fontStyle: 'bold',
    }).setDepth(3).setVisible(false);

    this.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.setupCommonKeys();
    this.setupStatusUI();
    this.statusUI?.container?.setVisible(false);
    this.setupLevelUpUI();

    this.guideIntroPanel = createPanel(this, width / 2, height / 2, 520, 220);

    const app = this.game?.app || window.gameApp || null;
    const presentationFactory = app?.container?.get('trainingPresentationFactory');
    const presentationSuite = presentationFactory
      ? presentationFactory({
          scene: this,
          stageRegistry: this.stageRegistry,
          guideIntroPanel: this.guideIntroPanel,
        })
      : createTrainingPresentationSuite({
          scene: this,
          stageRegistry: this.stageRegistry,
          guideIntroPanel: this.guideIntroPanel,
          tutorialPresentationFactory: app?.container?.get('tutorialPresentationFactory') || null,
        });

    this.trainingPresentation = presentationSuite?.trainingPresentation || presentationSuite?.presentationFacade || null;

    this.trainingController.start();
    this.refreshUI();
  }

  update() {
    this.updateStatusUI();
    this.showPendingLevelUpNotifications();

    if (this.handleLevelUpPopupInput()) {
      return;
    }

    if (this.guideIntroActive) {
      this.handleGuideIntroInput();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyESC) || Phaser.Input.Keyboard.JustDown(this.keyB)) {
      playSfx(this, audioKeys.sfx.uiBack);
      if (this.mode === TRAINING_MODES.MENU) {
        this.trainingController.closeTraining();
      } else if (this.mode === TRAINING_MODES.MESSAGE) {
        this.trainingController.closeTraining();
      } else {
        this.mode = TRAINING_MODES.MENU;
        this.refreshUI();
      }
      return;
    }

    switch (this.mode) {
      case TRAINING_MODES.MENU:
        this.handleMenuInput();
        break;
      case TRAINING_MODES.LESSON:
      case TRAINING_MODES.MESSAGE:
        this.handleEnterContinue();
        break;
      case TRAINING_MODES.STAGE1:
        this.handleStage1Input();
        break;
      case TRAINING_MODES.STAGE2_ANSWER:
        this.handleStage2AnswerInput();
        break;
      case TRAINING_MODES.STAGE2_TYPE:
        this.handleStage2TypeInput();
        break;
    }
  }

  get stageRegistry() {
    return this.trainingController.stageRegistry;
  }

  handleMenuInput() {
    if (Phaser.Input.Keyboard.JustDown(this.keyUP)) {
      this.trainingController.moveMenuCursor(-1);
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.trainingController.moveMenuCursor(1);
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (!this.justConfirmed()) return;
    playSfx(this, audioKeys.sfx.uiConfirm);
    this.trainingController.confirmMenu();
    this.refreshUI();
  }

  handleEnterContinue() {
    if (Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
      this.trainingController.goToPreviousLessonPage();
      playSfx(this, audioKeys.sfx.uiBack);
      this.refreshUI();
      return;
    }

    if (!this.justConfirmed()) return;
    playSfx(this, audioKeys.sfx.uiConfirm);
    this.trainingController.continueCurrentFlow();
    this.refreshUI();
  }

  handleStage1Input() {
    if (!Number.isInteger(this.stageOptionIndex) || this.stageOptionIndex < 0 || this.stageOptionIndex >= 4) {
      this.trainingController.moveOptionCursor(0, 4);
      this.refreshUI();
      return;
    }

    if (this.handleOptionCursor(4)) return;
    if (!this.justConfirmed()) return;
    this.trainingController.confirmStage1Answer();
    this.refreshUI();
  }

  handleStage2AnswerInput() {
    const questions = this.stageRegistry.getStageQuestions(2);
    const question = questions[this.stage2Index];
    if (!question) return;
    if (!Array.isArray(question.options) || question.options.length <= 0) return;

    if (!Number.isInteger(this.stageOptionIndex) || this.stageOptionIndex < 0 || this.stageOptionIndex >= question.options.length) {
      this.trainingController.moveOptionCursor(0, question.options.length);
      this.refreshUI();
      return;
    }

    if (this.handleOptionCursor(question.options.length)) return;
    if (!this.justConfirmed()) return;

    this.trainingController.confirmStage2Answer();
    this.refreshUI();
  }

  handleStage2TypeInput() {
    if (!Number.isInteger(this.stageOptionIndex) || this.stageOptionIndex < 0 || this.stageOptionIndex >= 4) {
      this.trainingController.moveOptionCursor(0, 4);
      this.refreshUI();
      return;
    }

    if (this.handleOptionCursor(4)) return;
    if (!this.justConfirmed()) return;

    this.trainingController.confirmStage2Type();
    this.refreshUI();
  }

  handleOptionCursor(optionCount) {
    if (Phaser.Input.Keyboard.JustDown(this.keyUP)) {
      this.trainingController.moveOptionCursor(-1, optionCount);
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.trainingController.moveOptionCursor(1, optionCount);
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return true;
    }

    return false;
  }

  justConfirmed() {
    return (
      Phaser.Input.Keyboard.JustDown(this.keyENTER) ||
      Phaser.Input.Keyboard.JustDown(this.keySPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keyE)
    );
  }

  refreshUI() {
    this.trainingPresentation?.renderCurrentMode?.();
  }

  renderMenu() {
    this.trainingPresentation?.renderMenu?.();
  }

  renderLesson() {
    this.trainingPresentation?.renderLesson?.();
  }

  renderStage1Question() {
    this.trainingPresentation?.renderStage1Question?.();
  }

  renderStage2Answer() {
    this.trainingPresentation?.renderStage2Answer?.();
  }

  renderStage2Type() {
    this.trainingPresentation?.renderStage2Type?.();
  }

  renderMessage() {
    this.trainingPresentation?.renderMessage?.();
  }

  showGuideIntroPanel(text) {
    this.trainingPresentation?.showGuideIntro?.(text);
  }

  hideGuideIntroPanel() {
    this.trainingPresentation?.hideGuideIntro?.();
  }

  handleGuideIntroInput() {
    if (!this.justConfirmed()) return;
    this.trainingController.showNextGuideIntroMessage();
  }
}


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
  }

  create() {
    playBgm(this, audioKeys.bgm.normal);

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x08111f);
    this.panel = this.add.rectangle(width / 2, height / 2, 720, 520, 0x111827, 0.98).setStrokeStyle(2, 0x64748b);

    this.titleText = this.add.text(width / 2, 58, 'Training', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.subText = this.add.text(width / 2, 92, 'Choose a stage', {
      fontSize: '17px',
      color: '#cbd5e1',
    }).setOrigin(0.5);

    this.listPanel = this.add.rectangle(170, 322, 220, 330, 0x0f172a, 0.96).setStrokeStyle(2, 0x475569);
    this.detailPanel = this.add.rectangle(488, 208, 360, 102, 0x0f172a, 0.96).setStrokeStyle(2, 0x475569);
    this.contentPanel = this.add.rectangle(488, 373, 360, 228, 0x0f172a, 0.96).setStrokeStyle(2, 0x475569);
    this.controlsPanel = this.add.rectangle(width / 2, 544, 610, 40, 0x0f172a, 0.96).setStrokeStyle(2, 0x475569);

    this.stageListText = this.add.text(86, 176, '', {
      fontSize: '16px',
      color: '#ffffff',
      lineSpacing: 10,
      wordWrap: { width: 160 },
    });

    this.detailTitleText = this.add.text(324, 172, '', {
      fontSize: '21px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.detailText = this.add.text(324, 202, '', {
      fontSize: '15px',
      color: '#cbd5e1',
      lineSpacing: 6,
      wordWrap: { width: 332 },
    });

    this.contentText = this.add.text(324, 274, '', {
      fontSize: '16px',
      color: '#ffffff',
      lineSpacing: 8,
      wordWrap: { width: 332 },
    });

    this.controlsText = this.add.text(width / 2, 544, '', {
      fontSize: '14px',
      color: '#facc15',
      align: 'center',
    }).setOrigin(0.5);

    this.cursorText = this.add.text(74, 176, '>', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setVisible(false);

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
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.trainingController.moveMenuCursor(1);
      this.refreshUI();
      return;
    }

    if (!this.justConfirmed()) return;
    this.trainingController.confirmMenu();
    this.refreshUI();
  }

  handleEnterContinue() {
    if (Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
      this.trainingController.goToPreviousLessonPage();
      this.refreshUI();
      return;
    }

    if (!this.justConfirmed()) return;
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
      this.refreshUI();
      return true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.trainingController.moveOptionCursor(1, optionCount);
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


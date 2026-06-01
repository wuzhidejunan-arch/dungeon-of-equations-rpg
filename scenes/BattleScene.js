import { BattleBuilderMixin } from './battle/BattleBuilderMixin.js';
import { BattleDialogMixin } from './battle/BattleDialogMixin.js';
import { BattleCommandMenuMixin } from './battle/BattleCommandMenuMixin.js';
import { BattleSkillMenuMixin } from './battle/BattleSkillMenuMixin.js';
import { BattleMathMixin } from './battle/BattleMathMixin.js';
import { BattleMenuMixin } from './battle/BattleMenuMixin.js';
import { BattleStateMixin } from './battle/BattleStateMixin.js';
import { BattleBonusFlowMixin } from './battle/BattleBonusFlowMixin.js';
import { BattleEnemyFlowMixin } from './battle/BattleEnemyFlowMixin.js';
import { BattleItemFlowMixin } from './battle/BattleItemFlowMixin.js';
import { BattleFlowMixin } from './battle/BattleFlowMixin.js';
import { BattleRendererMixin } from './battle/BattleRendererMixin.js';
import { BattleLayoutMixin } from './battle/BattleLayoutMixin.js';
import { BattleStatusMixin } from './battle/BattleStatusMixin.js';
import { BattleTurnMixin } from './battle/BattleTurnMixin.js';
import { BattleInputMixin } from './battle/BattleInputMixin.js';
import { getBattleText } from '../utils/battleSchema.js';
import { battleMenuStates } from '../data/battleStates.js';
import { initializeBattleSession } from '../engine/battleSession.js';
import { BattleController } from '../domains/battle/BattleController.js';
import { BattleTutorialMixin } from './battle/BattleTutorialMixin.js';
import { persistBattleSkillLoadout } from '../utils/playerSkills.js';
import { createDebugBadge, syncDebugBadge } from '../utils/debugBadge.js';
import { BattleMenuCoordinator } from '../domains/battle/coordinators/BattleMenuCoordinator.js';
import { BattleBuilderCoordinator } from '../domains/battle/coordinators/BattleBuilderCoordinator.js';
import { BattleDialogCoordinator } from '../domains/battle/coordinators/BattleDialogCoordinator.js';
import { BattleUiCoordinator } from '../domains/battle/coordinators/BattleUiCoordinator.js';
import { isTesterMode } from '../utils/debugState.js';
import { audioKeys } from '../config/audioKeys.js';
import { playBgm } from '../utils/musicManager.js';
import { preloadBattleAssets } from '../utils/battleAssetPreloader.js';

const BOSS_BATTLE_ENEMY_KEYS = new Set(['room1_boss', 'room2_boss', 'room3_boss', 'final_boss']);
const BOSS_BATTLE_ENEMY_IDS = new Set(['boss1', 'boss2', 'boss3', 'finalBoss']);

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  preload() {
    preloadBattleAssets(this);
  }

  init(data) {
    this.returnSceneData = data?.returnSceneData || null;
    this.devEnemyVisualTest = data?.devEnemyVisualTest === true;
    initializeBattleSession(this, data);

    const app = this.game?.app || window.gameApp || null;
    const container = app?.container || null;
    // Canonical live battle execution path: BattleScene -> BattleController -> systems/rules.
    // Older helper modules still expose fallback entry points for compatibility, but normal
    // scene-driven battles should be routed through this controller instance.
    this.battleController = new BattleController({
      scene: this,
      store: this.battleStore,
      eventBus: app?.eventBus || null,
      registries: container?.get('battleRegistries') || {},
    });

    const presentationFactory = container?.get('battlePresentationFactory');
    const presentationSuite = presentationFactory?.createForScene?.(this) || {};
    this.battlePresentation = presentationSuite.battlePresentation || null;

    this.battleFeatures = container?.get('battleFeatureRegistry') || null;
    this.battleFeatureContext = this.battleFeatures?.createContext?.({
      scene: this,
      controller: this.battleController,
      store: this.battleStore,
      app,
    }) || null;

    this.battleMenuCoordinator = new BattleMenuCoordinator({ scene: this });
    this.battleBuilderCoordinator = new BattleBuilderCoordinator({ scene: this });
    this.battleDialogCoordinator = new BattleDialogCoordinator({ scene: this });
    this.battleUiCoordinator = new BattleUiCoordinator({ scene: this });
  }

  create() {
    playBgm(this, this.getBattleBgmKey());
    // Future end-of-battle summary tracking; reset for each new battle.
    this.battleSummary = {
      attempts: [],
      correct: 0,
      wrong: 0,
    };

    this.battleFeatures?.runHook?.('beforeCreate', this.battleFeatureContext, { scene: this });

    this.createBattleLayout();

    this.debugBadge = createDebugBadge(this);
    this.createBattleInputs();
    this.createTrainingGuideUI();

    this.createBuilderUI();
    this.registerDragHandlers();

    this.refreshBattleUI();
    this.setTurn('player');
    this.addBattleLog(getBattleText('logs.battleAppear', `A wild ${this.enemy.name} appeared.`, { enemy: this.enemy.name }));
    this.addBattleLog(getBattleText('logs.battleStart', 'Battle start.'));
    this.events.once('shutdown', () => {
      persistBattleSkillLoadout(this.playerSkills || []);
    });

    this.startBattleIntro();
    this.battleFeatures?.runHook?.('afterCreate', this.battleFeatureContext, { scene: this });
    this.events.once('shutdown', () => {
      this.battleFeatures?.runHook?.('onShutdown', this.battleFeatureContext, { scene: this });
    });
  }

  getBattleBgmKey() {
    if (BOSS_BATTLE_ENEMY_KEYS.has(this.enemyKey) || BOSS_BATTLE_ENEMY_IDS.has(this.enemy?.id)) {
      return audioKeys.bgm.bossBattle;
    }
    return audioKeys.bgm.battle;
  }

  update() {
    syncDebugBadge(this.debugBadge);

    this.handleBattleSummaryModalInput?.();
    this.handleTesterInstantKillShortcut();
    this.battleFeatures?.runHook?.('beforeUpdate', this.battleFeatureContext, { scene: this });
    this.updateTrainingGuideUI();
    this.updateBattleFlow();
    this.battleFeatures?.runHook?.('afterUpdate', this.battleFeatureContext, { scene: this });
  }

  handleTesterInstantKillShortcut() {
    if (!isTesterMode()) return;
    if (!this.keyK || !Phaser.Input.Keyboard.JustDown(this.keyK)) return;
    if (this.battleEnded || this.dialogueActive) return;
    if (!this.enemy || this.enemyCurrentHp <= 0) return;

    this.enemyCurrentHp = 0;
    this.prepareTesterInstantKillVictoryState();
    this.refreshBattleUI();
    this.addBattleLog('Test Mode: Enemy defeated.');
    this.winBattle();
  }

  prepareTesterInstantKillVictoryState() {
    this.battleEnded = true;
    this.feedbackDelayActive = false;
    this.dialogQueue = [];
    this.dialogCallback = null;
    this.selectedSkill = null;
    this.selectedSkillIndex = 0;
    this.selectedCommandIndex = 0;
    this.selectedItemIndex = 0;
    this.itemTargetSkillIndex = 0;
    this.pendingBonusChoice = null;
    this.builderActive = false;

    this.showCombinedBox(false);
    this.setBattleMenuState?.(battleMenuStates.END);
  }

  showCombinedBox(useCombined) {
    if (useCombined) {
      this.resultText.setPosition(82, 465);
      this.resultText.setWordWrapWidth(635);
    } else {
      this.resultText.setPosition(95, 465);
      this.resultText.setWordWrapWidth(414);
      this.ruleText?.setPosition?.(95, 506);
      this.tipText?.setPosition?.(95, 534);
      this.dialogContinueText.setVisible(false);
    }
  }









}

Object.assign(
  BattleScene.prototype,
  BattleMathMixin,
  BattleMenuMixin,
  BattleCommandMenuMixin,
  BattleSkillMenuMixin,
  BattleBuilderMixin,
  BattleStateMixin,
  BattleDialogMixin,
  BattleBonusFlowMixin,
  BattleEnemyFlowMixin,
  BattleItemFlowMixin,
  BattleFlowMixin,
  BattleRendererMixin,
  BattleLayoutMixin,
  BattleStatusMixin,
  BattleTurnMixin,
  BattleInputMixin,
  BattleTutorialMixin,
);

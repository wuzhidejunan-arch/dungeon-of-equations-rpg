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
import { playBgm, preloadBgmAssets } from '../utils/musicManager.js';
import { preloadSfxAssets } from '../utils/sfxManager.js';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  preload() {
    preloadBgmAssets(this, audioKeys.bgm.battle);
    preloadSfxAssets(this);

    if (!this.textures.exists('battleBgDungeon')) {
      this.load.image('battleBgDungeon', 'assets/images/ui/battle/battle_bg_dungeon.png');
    }

    if (!this.textures.exists('battleBlueMagicCircle')) {
      this.load.image('battleBlueMagicCircle', 'assets/images/ui/battle/blue_magic_circle.png');
    }

    if (!this.textures.exists('battleRedMagicCircle')) {
      this.load.image('battleRedMagicCircle', 'assets/images/ui/battle/red_magic_circle.png');
    }

    if (!this.textures.exists('battleStatusPanel')) {
      this.load.image('battleStatusPanel', 'assets/images/ui/battle/battle_status_panel.png');
    }

    if (!this.textures.exists('battleMessagePanel')) {
      this.load.image('battleMessagePanel', 'assets/images/ui/battle/battle_message_panel.png');
    }

    if (!this.textures.exists('battleSquarePanel')) {
      this.load.image('battleSquarePanel', 'assets/images/ui/battle/battle_square_panel.png');
    }

    if (!this.textures.exists('attackHitSpark')) {
      this.load.image('attackHitSpark', 'assets/effects/battle/attack_hit_spark.png');
    }

    if (!this.textures.exists('defenseShieldFlash')) {
      this.load.image('defenseShieldFlash', 'assets/effects/battle/defense_shield_flash.png');
    }

    if (!this.textures.exists('mathBuilderPanel')) {
      this.load.image('mathBuilderPanel', 'assets/ui/math-builder/math_panel.png');
    }

    if (!this.textures.exists('mathBuilderSlotEmpty')) {
      this.load.image('mathBuilderSlotEmpty', 'assets/ui/math-builder/slot_box_empty.png');
    }

    if (!this.textures.exists('mathBuilderTokenIdle')) {
      this.load.image('mathBuilderTokenIdle', 'assets/ui/math-builder/token_box_idle.png');
    }

    if (!this.textures.exists('mathBuilderTokenSelected')) {
      this.load.image('mathBuilderTokenSelected', 'assets/ui/math-builder/token_box_selected.png');
    }

    if (!this.textures.exists('mathBuilderButtonIdle')) {
      this.load.image('mathBuilderButtonIdle', 'assets/ui/math-builder/button_idle.png');
    }

    if (!this.textures.exists('playerBack')) {
      this.load.image('playerBack', 'assets/images/characters/player_back.png');
    }

    if (!this.textures.exists('enemy_number_dummy')) {
      this.load.image('enemy_number_dummy', 'assets/images/enemies/beginning/number_dummy.png');
    }

    if (!this.textures.exists('enemy_even_slime')) {
      this.load.image('enemy_even_slime', 'assets/images/enemies/beginning/even_slime.png');
    }

    if (!this.textures.exists('enemy_odd_bat')) {
      this.load.image('enemy_odd_bat', 'assets/images/enemies/beginning/odd_bat.png');
    }

    if (!this.textures.exists('enemy_even_gatekeeper')) {
      this.load.image('enemy_even_gatekeeper', 'assets/images/enemies/beginning/even_gatekeeper.png');
    }

    if (!this.textures.exists('enemy_odd_gatekeeper')) {
      this.load.image('enemy_odd_gatekeeper', 'assets/images/enemies/beginning/odd_gatekeeper.png');
    }

    if (!this.textures.exists('enemy_prime_gatekeeper')) {
      this.load.image('enemy_prime_gatekeeper', 'assets/images/enemies/beginning/prime_gatekeeper.png');
    }

    if (!this.textures.exists('enemy_prime_dungeon_lord')) {
      this.load.image('enemy_prime_dungeon_lord', 'assets/images/enemies/beginning/prime_dungeon_lord.png');
    }

    if (!this.textures.exists('enemy_intermediate_stone_shell')) {
      this.load.image('enemy_intermediate_stone_shell', 'assets/images/enemies/intermediate/stone_shell.png');
    }

    if (!this.textures.exists('enemy_intermediate_armor_dummy')) {
      this.load.image('enemy_intermediate_armor_dummy', 'assets/images/enemies/intermediate/armor_dummy.png');
    }

    if (!this.textures.exists('enemy_intermediate_wild_fang')) {
      this.load.image('enemy_intermediate_wild_fang', 'assets/images/enemies/intermediate/wild_fang.png');
    }

    if (!this.textures.exists('enemy_intermediate_even_stone_gatekeeper')) {
      this.load.image('enemy_intermediate_even_stone_gatekeeper', 'assets/images/enemies/intermediate/even_stone_gatekeeper.png');
    }

    if (!this.textures.exists('enemy_intermediate_odd_fang_gatekeeper')) {
      this.load.image('enemy_intermediate_odd_fang_gatekeeper', 'assets/images/enemies/intermediate/odd_fang_gatekeeper.png');
    }

    if (!this.textures.exists('enemy_intermediate_iron_core_gatekeeper')) {
      this.load.image('enemy_intermediate_iron_core_gatekeeper', 'assets/images/enemies/intermediate/iron_core_gatekeeper.png');
    }

    if (!this.textures.exists('enemy_intermediate_armor_core_lord')) {
      this.load.image('enemy_intermediate_armor_core_lord', 'assets/images/enemies/intermediate/armor_core_lord.png');
    }

    if (!this.textures.exists('challenge_chain_dummy')) {
      this.load.image('challenge_chain_dummy', 'assets/images/enemies/challenge/chain_dummy.png');
    }

    if (!this.textures.exists('challenge_chain_crawler')) {
      this.load.image('challenge_chain_crawler', 'assets/images/enemies/challenge/chain_crawler.png');
    }

    if (!this.textures.exists('challenge_splitwing_imp')) {
      this.load.image('challenge_splitwing_imp', 'assets/images/enemies/challenge/splitwing_imp.png');
    }

    if (!this.textures.exists('challenge_balanced_sentinel')) {
      this.load.image('challenge_balanced_sentinel', 'assets/images/enemies/challenge/balanced_sentinel.png');
    }

    if (!this.textures.exists('challenge_crooked_sentinel')) {
      this.load.image('challenge_crooked_sentinel', 'assets/images/enemies/challenge/crooked_sentinel.png');
    }

    if (!this.textures.exists('challenge_prime_warden')) {
      this.load.image('challenge_prime_warden', 'assets/images/enemies/challenge/prime_warden.png');
    }

    if (!this.textures.exists('challenge_chain_oracle_lord')) {
      this.load.image('challenge_chain_oracle_lord', 'assets/images/enemies/challenge/chain_oracle_lord.png');
    }
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
    playBgm(this, audioKeys.bgm.battle);

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

  update() {
    syncDebugBadge(this.debugBadge);

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
    this.refreshBattleUI();
    this.addBattleLog('Test Mode: Enemy defeated.');
    this.winBattle();
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

import { BaseScene } from "./BaseScene.js";
import { playerData } from "../data/playerData.js";
import { shopItems, npcMessages } from "../data/shopData.js";
import { itemDefinitions } from "../data/battleData.js";
import { npcDialogues } from "../data/dialogueData.js";
import {
  backgroundPreloadDungeonMapArt,
  createBasicTextures,
  EXPLORATION_PLAYER_DISPLAY_SIZE,
  PLAYER_WALK_SHEET_KEY,
  preloadWorldMapArt,
} from "../utils/textureFactory.js";
import {
  createPanel,
  hidePanel,
  hidePrompt,
  preloadHudUiAssets,
  showPanel,
  showPrompt,
  UI_GOLD_COIN_ICON_KEY,
} from "../utils/ui.js";
import { startDialogue } from "../utils/dialogueSystem.js";
import { saveGame } from "../utils/saveSystem.js";
import { addItem } from "../utils/inventory.js";
import {
  advanceGuideStep,
  ensureGuideState,
  getBlockedGuideMessage,
  getCurrentGuideStep,
  getGuideStep,
  isGuideTargetAllowed,
  isTutorialActive,
} from "../utils/guideSystem.js";
import { GUIDE_STEP_IDS } from "../data/guideSteps.js";
import { isTrainingStageCompleted } from "../utils/trainingSystem.js";
import { isTesterMode } from "../utils/debugState.js";
import { audioKeys } from "../config/audioKeys.js";
import { loadAndPlayBgmAfterRender } from "../utils/musicManager.js";
import { playSfx, preloadSfxAssets } from "../utils/sfxManager.js";

const DEBUG_WORLD_COLLISION = false;
const DEBUG_WORLD_BODY_BOUNDS = false;
const WORLD_PLAYER_DISPLAY_SIZE = Math.round(EXPLORATION_PLAYER_DISPLAY_SIZE * 0.9);
const WORLD_NPC_MAP_IMAGE_SCALE = 0.063;
const BOOK_PANEL_KEY = "uiBookPanelFrame";
const BOOK_PANEL_PATH = "assets/ui/ui_book_panel_frame.png";
const DIALOGUE_PANEL_KEY = "dialoguePanel";
const DIALOGUE_PANEL_PATH = "assets/ui/dialogue/dialogue_panel.png";
const BOOK_PANEL_LAYOUT = {
  x: 400,
  y: 300,
  width: 900,
  height: 610,
};

function getShopDisplayName(item) {
  return item?.name === "Potion" ? "Potion" : item?.name || "";
}

function getShopItemDescription(item) {
  return itemDefinitions[item?.name]?.ui?.resultText || "";
}
const BOOK_TEXT_COLORS = {
  primary: "#2f1f12",
  secondary: "#4b3522",
  accent: "#7a4d00",
};

export class WorldScene extends BaseScene {
  constructor() {
    super("WorldScene");
    this.shopOpen = false;
    this.shopSelectionIndex = 0;
    this.shopMessage = "";
    this.guideMessageActive = false;
    this.guideMessageQueue = [];
    this.guideMessageNextStep = null;
    this.promptOverrideText = "";
    this.promptOverrideUntil = 0;
  }

  init(data) {
    this.initialPlayerFacingDirection = data?.playerFacingDirection || null;
  }

  preload() {
    preloadWorldMapArt(this);
    preloadHudUiAssets(this);
    preloadSfxAssets(this);
    this.preloadResultModalAssets();
    this.load.image(BOOK_PANEL_KEY, BOOK_PANEL_PATH);
    this.load.image(DIALOGUE_PANEL_KEY, DIALOGUE_PANEL_PATH);
  }

  create() {
    this.interactTarget = null;
    this.shopOpen = false;
    ensureGuideState(playerData);

    createBasicTextures(this);

    const worldBackground = this.add.image(400, 300, "worldVillageMap");
    const backgroundScale = Math.max(800 / worldBackground.width, 600 / worldBackground.height);
    worldBackground.setScale(backgroundScale);
    worldBackground.setDepth(-20);

    const homeMapImage = this.add.image(200, 90, "mapHome");
    homeMapImage.setScale(0.16);
    homeMapImage.setDepth(-10);

    const shopMapImage = this.add.image(590, 90, "mapShop");
    shopMapImage.setScale(0.16);
    shopMapImage.setDepth(-10);

    const trainingGroundMapImage = this.add.image(600, 380, "mapTrainingGround");
    trainingGroundMapImage.setScale(0.14);
    trainingGroundMapImage.setDepth(-10);

    const dungeonMapImage = this.add.image(195, 390, "mapDungeon");
    dungeonMapImage.setScale(0.14);
    dungeonMapImage.setDepth(-10);

    const npcMapImage = this.add.image(350, 170, "mapNpc");
    npcMapImage.setScale(WORLD_NPC_MAP_IMAGE_SCALE);
    npcMapImage.setDepth(-8);

    this.player = this.physics.add.sprite(
      playerData.position.world.x,
      playerData.position.world.y,
      PLAYER_WALK_SHEET_KEY,
      1,
    );
    this.player.setDisplaySize(WORLD_PLAYER_DISPLAY_SIZE, WORLD_PLAYER_DISPLAY_SIZE);
    this.player.setDepth(-6);
    this.player.setCollideWorldBounds(true);
    if (this.initialPlayerFacingDirection) {
      this.playerFacingDirection = this.initialPlayerFacingDirection;
      this.setExplorationPlayerIdleFrame(this.player);
    }
    const playerBodyWidth = Math.round(this.player.width * 0.4);
    const playerBodyHeight = Math.round(this.player.height * 0.64);
    const playerBodyOffsetX = Math.round((this.player.width - playerBodyWidth) / 2);
    const playerBodyOffsetY = Math.round(this.player.height - playerBodyHeight - (3 / this.player.scaleY));
    this.player.body.setSize(playerBodyWidth, playerBodyHeight, true);
    this.player.body.setOffset(playerBodyOffsetX, playerBodyOffsetY);

    this.house = this.physics.add.staticSprite(220, 170, "houseTexture");
    this.shop = this.physics.add.staticSprite(580, 170, "shopTexture");
    this.house.setVisible(false);
    this.shop.setVisible(false);
    this.houseDoor = this.add.rectangle(220, 240, 34, 26, 0x3b2f2f).setStrokeStyle(2, 0xe9d8a6);
    this.houseDoor.setVisible(false);

    this.dungeonGate = this.add.rectangle(120, 500, 80, 100, 0x444444);
    this.physics.add.existing(this.dungeonGate, true);
    this.dungeonGate.setVisible(false);

    this.villager = this.add.rectangle(360, 180, 32, 40, 0xffff00);
    this.physics.add.existing(this.villager, true);
    this.villager.setVisible(false);

    this.trainingStone = this.add.rectangle(650, 420, 50, 50, 0xaa0000);
    this.physics.add.existing(this.trainingStone, true);
    this.trainingStone.setVisible(false);

    this.worldBlockers = this.physics.add.staticGroup();
    const blockerFillAlpha = DEBUG_WORLD_COLLISION ? 0.28 : 0;
    const createWorldBlocker = (x, y, width, height, debugColor = 0xff00ff) => {
      const blocker = this.add.rectangle(x, y, width, height, debugColor, blockerFillAlpha);
      if (DEBUG_WORLD_COLLISION) {
        blocker.setStrokeStyle(2, debugColor, 0.9);
      }
      this.physics.add.existing(blocker, true);
      blocker.body.updateFromGameObject();
      blocker.body.enable = true;
      this.worldBlockers.add(blocker);
      return blocker;
    };

    this.homeCollision = createWorldBlocker(200, 90, 126, 84);
    this.shopCollision = createWorldBlocker(590, 90, 122, 92);
    this.trainingCollision = createWorldBlocker(600, 380, 108, 72);
    this.dungeonCollision = createWorldBlocker(195, 390, 116, 104);
    this.npcCollision = createWorldBlocker(350, 170, 34, 60);
    this.outerTopLeftCollision = createWorldBlocker(160, 25, 320, 50, 0x16a34a);
    this.outerTopRightCollision = createWorldBlocker(640, 25, 320, 50, 0x16a34a);
    this.outerLeftCollision = createWorldBlocker(25, 300, 50, 600, 0x22c55e);
    this.outerRightCollision = createWorldBlocker(775, 300, 50, 600, 0x22c55e);
    this.outerBottomLeftCollision = createWorldBlocker(160, 575, 320, 50, 0x16a34a);
    this.outerBottomRightCollision = createWorldBlocker(640, 575, 320, 50, 0x16a34a);
    this.centralFountainCollision = createWorldBlocker(400, 300, 110, 100, 0x38bdf8);

    this.worldBlockerCollider = this.physics.add.collider(this.player, this.worldBlockers);

    if (DEBUG_WORLD_BODY_BOUNDS) {
      this.worldBodyDebugGraphics = this.add.graphics().setDepth(5000);
      this.worldBodyBoundsLogged = false;
      this.worldBodyDebugTargets = [
        { label: "homeCollision", object: this.homeCollision, color: 0xff00ff },
        { label: "shopCollision", object: this.shopCollision, color: 0x00ffff },
        { label: "trainingCollision", object: this.trainingCollision, color: 0xffff00 },
        { label: "dungeonCollision", object: this.dungeonCollision, color: 0xff8800 },
        { label: "npcCollision", object: this.npcCollision, color: 0xff4444 },
        { label: "outerTopLeftCollision", object: this.outerTopLeftCollision, color: 0x16a34a },
        { label: "outerTopRightCollision", object: this.outerTopRightCollision, color: 0x16a34a },
        { label: "outerLeftCollision", object: this.outerLeftCollision, color: 0x22c55e },
        { label: "outerRightCollision", object: this.outerRightCollision, color: 0x22c55e },
        { label: "outerBottomLeftCollision", object: this.outerBottomLeftCollision, color: 0x16a34a },
        { label: "outerBottomRightCollision", object: this.outerBottomRightCollision, color: 0x16a34a },
        { label: "centralFountainCollision", object: this.centralFountainCollision, color: 0x38bdf8 },
      ];
      console.log("[WorldScene Debug] body bounds debug enabled");
      this.logWorldBodyBoundsOnce();
      this.renderWorldBodyBoundsDebug();
    } else {
      this.worldBodyDebugGraphics = null;
      this.worldBodyBoundsLogged = true;
      this.worldBodyDebugTargets = [];
    }

    this.shopZone = this.add.zone(590, 170, 100, 40);
    this.physics.add.existing(this.shopZone, true);

    this.homeDoorZone = this.add.zone(200, 100, 90, 90);
    this.physics.add.existing(this.homeDoorZone, true);

    this.villagerZone = this.add.zone(360, 220, 90, 70);
    this.physics.add.existing(this.villagerZone, true);

    this.trainingZone = this.add.zone(600, 447, 64, 46);
    this.physics.add.existing(this.trainingZone, true);

    this.dungeonZone = this.add.zone(195, 400, 100, 120);
    this.physics.add.existing(this.dungeonZone, true);

    this.setupPrompt();
    this.setupCommonKeys();
    this.setupStatusUI();
    this.setupLevelUpUI();
    this.setupDialogueUI();

    this.keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.registerDemoMenuHotkey();

    this.createShopUI();
    this.guidePanel = createPanel(this, 400, 300, 520, 220);

    this.physics.add.overlap(this.player, this.shopZone, () => {
      this.interactTarget = "shop";
    });
    this.physics.add.overlap(this.player, this.homeDoorZone, () => {
      this.interactTarget = "homeDoor";
    });
    this.physics.add.overlap(this.player, this.villagerZone, () => {
      this.interactTarget = "villager1";
    });
    this.physics.add.overlap(this.player, this.trainingZone, () => {
      this.interactTarget = "trainingGround";
    });
    this.physics.add.overlap(this.player, this.dungeonZone, () => {
      this.interactTarget = "dungeon";
    });

    backgroundPreloadDungeonMapArt(this);
    loadAndPlayBgmAfterRender(this, audioKeys.bgm.normal);
  }

  update() {
    this.updateStatusUI();
    this.showPendingLevelUpNotifications();

    const isLocked =
      this.shopOpen ||
      this.dialogueActive ||
      this.levelUpNoticeActive ||
      this.guideMessageActive;
    this.handlePlayerMovement(this.player, 200, isLocked);

    if (this.handleDialogueInput()) {
      return;
    }

    if (this.levelUpNoticeActive) {
      return;
    }

    if (this.guideMessageActive) {
      this.handleGuideMessageInput();
      return;
    }

    if (this.shopOpen) {
      this.handleShopInput();
      return;
    }

    if (!this.inventoryOpen && Phaser.Input.Keyboard.JustDown(this.keyESC)) {
      this.scene.start("StartScene");
      return;
    }

    const nearShop = this.physics.overlap(this.player, this.shopZone);
    const nearHomeDoor = this.physics.overlap(this.player, this.homeDoorZone);
    const nearVillager = this.physics.overlap(this.player, this.villagerZone);
    const nearTraining = this.physics.overlap(this.player, this.trainingZone);
    const nearDungeon = this.physics.overlap(this.player, this.dungeonZone);

    if (DEBUG_WORLD_BODY_BOUNDS) {
      this.logWorldBodyBoundsOnce();
      this.renderWorldBodyBoundsDebug();
    }

    this.updateGuidePrompt({ nearShop, nearHomeDoor, nearVillager, nearTraining, nearDungeon });

    if (
      this.isInventoryHotkeyPressed() &&
      !this.shopOpen &&
      !this.dialogueActive
    ) {
      this.openInventory();
      saveGame();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE) && !this.dialogueActive) {
      if (this.interactTarget) {
        playSfx(this, audioKeys.sfx.uiConfirm);
      }
      this.handleWorldInteract();
    }
  }

  canOpenDemoMenu() {
    return !this.shopOpen &&
      !this.dialogueActive &&
      !this.levelUpNoticeActive &&
      !this.guideMessageActive &&
      !this.inventoryOpen;
  }

  registerDemoMenuHotkey() {
    this.demoMenuHotkeyHandler = (event) => {
      event?.preventDefault?.();
      if (!this.canOpenDemoMenu()) return;
      this.scene.start("DemoMenuScene", {
        returnScene: "WorldScene",
      });
    };
    this.input.keyboard.on("keydown-F8", this.demoMenuHotkeyHandler);
    this.events.once("shutdown", () => {
      this.input.keyboard.off("keydown-F8", this.demoMenuHotkeyHandler);
    });
  }

  logWorldBodyBoundsOnce() {
    if (this.worldBodyBoundsLogged) return;

    const playerBody = this.player?.body || null;
    const blockerStates = (this.worldBodyDebugTargets || []).map(({ label, object }) => {
      const body = object?.body || null;
      return {
        label,
        objectX: object?.x ?? null,
        objectY: object?.y ?? null,
        objectWidth: object?.width ?? null,
        objectHeight: object?.height ?? null,
        bodyX: body?.x ?? null,
        bodyY: body?.y ?? null,
        bodyWidth: body?.width ?? null,
        bodyHeight: body?.height ?? null,
        bodyEnabled: body?.enable ?? null,
      };
    });

    console.log("[WorldScene body debug]", {
      physicsWorldExists: Boolean(this.physics?.world),
      worldBlockerColliderExists: Boolean(this.worldBlockerCollider),
      worldBlockerColliderActive: this.worldBlockerCollider?.active ?? null,
      player: {
        visualX: this.player?.x ?? null,
        visualY: this.player?.y ?? null,
        displayWidth: this.player?.displayWidth ?? null,
        displayHeight: this.player?.displayHeight ?? null,
        bodyX: playerBody?.x ?? null,
        bodyY: playerBody?.y ?? null,
        bodyWidth: playerBody?.width ?? null,
        bodyHeight: playerBody?.height ?? null,
        bodyEnabled: playerBody?.enable ?? null,
      },
      blockers: blockerStates,
    });

    this.worldBodyBoundsLogged = true;
  }

  renderWorldBodyBoundsDebug() {
    if (!this.worldBodyDebugGraphics) return;

    this.worldBodyDebugGraphics.clear();

    const drawBodyRect = (body, color) => {
      if (!body) return;
      this.worldBodyDebugGraphics.lineStyle(2, color, 1);
      this.worldBodyDebugGraphics.strokeRect(body.x, body.y, body.width, body.height);
    };

    drawBodyRect(this.player?.body, 0xffffff);
    (this.worldBodyDebugTargets || []).forEach(({ object, color }) => {
      drawBodyRect(object?.body, color);
    });
  }

  updateGuidePrompt({ nearShop, nearHomeDoor, nearVillager, nearTraining, nearDungeon }) {
    if (this.isPromptOverrideActive()) {
      showPrompt(this.promptText, this.promptOverrideText);
      return;
    }

      const tutorialActive = isTutorialActive(playerData);
      const guideStep = getCurrentGuideStep(playerData);
      const guidePrompt = this.getObjectiveHintText(guideStep);

    if (!this.dialogueActive) {
      if (nearShop) {
        this.interactTarget = "shop";
      } else if (nearHomeDoor) {
        this.interactTarget = "homeDoor";
      } else if (nearVillager) {
        this.interactTarget = "villager1";
      } else if (nearTraining) {
        this.interactTarget = "trainingGround";
      } else if (nearDungeon) {
        this.interactTarget = "dungeon";
      } else {
        this.interactTarget = null;
      }
    } else {
      this.interactTarget = null;
    }

    const easyTrainingComplete =
      isTrainingStageCompleted(1, playerData) &&
      isTrainingStageCompleted(2, playerData) &&
      isTrainingStageCompleted(3, playerData);
    const useBeginnerPromptPriority =
      playerData.difficulty === "beginner" &&
      !isTesterMode() &&
      !easyTrainingComplete;

    if (useBeginnerPromptPriority) {
      const interactionPrompt = this.getWorldInteractionPrompt(this.interactTarget);
      if (interactionPrompt) {
        showPrompt(this.promptText, interactionPrompt);
        return;
      }

      const velocity = this.player?.body?.velocity || null;
      const isMoving = Boolean(velocity && (velocity.x !== 0 || velocity.y !== 0));
      showPrompt(this.promptText, isMoving ? "Go to the training ground." : "WASD to move");
      return;
    }

    if (!tutorialActive) {
      this.showDefaultPrompt();
      return;
    }

      if (guideStep.id === GUIDE_STEP_IDS.BAG_INTRO) {
        showPrompt(this.promptText, guidePrompt);
        return;
      }

    if (this.interactTarget) {
      if (isGuideTargetAllowed(this.interactTarget, playerData)) {
          const labelMap = {
            shop: "Press E to shop",
            homeDoor: "Press E to go in",
            villager1: "Press E to talk",
            trainingGround: "Press E to go in",
            dungeon: "Press E to go in",
          };
          showPrompt(this.promptText, labelMap[this.interactTarget] || guidePrompt || "Press E to go in");
        } else {
          showPrompt(this.promptText, guidePrompt || "Follow the tutorial");
        }
        return;
      }

      if (guidePrompt) {
        showPrompt(this.promptText, guidePrompt);
      } else {
        hidePrompt(this.promptText);
      }
    }

    getObjectiveHintText(guideStep) {
      const beginnerTrainingReady =
        isTrainingStageCompleted(1, playerData) &&
        isTrainingStageCompleted(2, playerData) &&
        isTrainingStageCompleted(3, playerData);

      if (
        playerData.difficulty === "beginner" &&
        guideStep?.id === GUIDE_STEP_IDS.TRAINING_STAGE_1 &&
        beginnerTrainingReady
      ) {
        return "You are ready. Try the dungeon.";
      }

      return guideStep?.prompt || "";
    }

  getWorldInteractionPrompt(targetName) {
    const promptMap = {
      shop: "Press E to shop",
      homeDoor: "Press E to go in",
      villager1: "Press E to talk",
      trainingGround: "Press E to go in",
      dungeon: "Press E to go in",
    };

    return promptMap[targetName] || "";
  }

  isPromptOverrideActive() {
    return Boolean(this.promptOverrideText) && this.promptOverrideUntil > this.time.now;
  }

  showTemporaryPrompt(message, durationMs = 1500) {
    this.promptOverrideText = String(message || "");
    this.promptOverrideUntil = this.time.now + Math.max(0, Number(durationMs) || 0);
    showPrompt(this.promptText, this.promptOverrideText);
  }

  showDefaultPrompt() {
    const interactionPrompt = this.getWorldInteractionPrompt(this.interactTarget);
    if (interactionPrompt) {
      showPrompt(this.promptText, interactionPrompt);
    } else {
      hidePrompt(this.promptText);
    }
  }

  handleWorldInteract() {
    const tutorialActive = isTutorialActive(playerData);
    const guideStep = getCurrentGuideStep(playerData);

    if (tutorialActive && this.interactTarget && !isGuideTargetAllowed(this.interactTarget, playerData)) {
      showPrompt(this.promptText, getBlockedGuideMessage(this.interactTarget, playerData));
      return;
    }

    if (this.interactTarget === "shop") {
      if (tutorialActive && guideStep.id === GUIDE_STEP_IDS.GO_SHOP) {
        advanceGuideStep(GUIDE_STEP_IDS.GO_SHOP, playerData);
        saveGame();
        this.startGuideMessageStep(GUIDE_STEP_IDS.SHOP_INTRO);
        return;
      }

      this.openShop();
      return;
    }

    if (this.interactTarget === "homeDoor") {
      playerData.position.world.x = 220;
      playerData.position.world.y = 290;
      playerData.position.home.x = 400;
      playerData.position.home.y = 500;
      saveGame();
      this.scene.start("HomeScene");
      return;
    }

    if (this.interactTarget === "villager1") {
      startDialogue(this, this.dialogueUI, npcDialogues.villager1);
      return;
    }

    if (this.interactTarget === "trainingGround") {
      if (tutorialActive && guideStep.id === GUIDE_STEP_IDS.GO_TRAINING_GROUND) {
        advanceGuideStep(GUIDE_STEP_IDS.GO_TRAINING_GROUND, playerData);
        saveGame();
      }

      playerData.position.world.x = 600;
      playerData.position.world.y = 478;
      saveGame();

      this.scene.start("TrainingScene", {
        returnScene: "WorldScene",
        returnSceneData: { playerFacingDirection: "down" },
      });
      return;
    }

    if (this.interactTarget === "dungeon") {
      const easyTrainingComplete =
        isTrainingStageCompleted(1, playerData) &&
        isTrainingStageCompleted(2, playerData) &&
        isTrainingStageCompleted(3, playerData);
      const canEnterDungeon =
        isTesterMode() ||
        playerData.difficulty !== "beginner" ||
        easyTrainingComplete;

      if (!canEnterDungeon) {
        this.showTemporaryPrompt("Finish Beginner training first.");
        return;
      }

      if (tutorialActive && guideStep.id === GUIDE_STEP_IDS.GO_DUNGEON) {
        advanceGuideStep(GUIDE_STEP_IDS.GO_DUNGEON, playerData);
        saveGame();
        this.startGuideMessageStep(GUIDE_STEP_IDS.DUNGEON_INTRO);
        return;
      }

      playerData.position.world.x = this.player.x;
      playerData.position.world.y = this.player.y;
      playerData.position.dungeon.x = 90;
      playerData.position.dungeon.y = 520;
      playerData.dungeonProgress.currentRoom = 1;

      saveGame();
      this.scene.start("DungeonScene");
    }
  }

  startGuideMessageStep(stepId) {
    const step = getGuideStep(stepId);
    if (!step?.messageQueue?.length) return;

    this.guideMessageActive = true;
    this.guideMessageQueue = [...step.messageQueue];
    this.guideMessageNextStep = step.next || null;
    this.showNextGuideMessage();
  }

  showNextGuideMessage() {
    if (!this.guideMessageQueue.length) {
      this.finishGuideMessage();
      return;
    }

    const message = this.guideMessageQueue.shift();
    showPanel(this.guidePanel, `${message}\n\nPress Enter / Space / E`);
  }

  handleGuideMessageInput() {
    if (
      Phaser.Input.Keyboard.JustDown(this.keyENTER) ||
      Phaser.Input.Keyboard.JustDown(this.keySPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keyE)
    ) {
      this.showNextGuideMessage();
    }
  }

  finishGuideMessage() {
    hidePanel(this.guidePanel);
    this.guideMessageActive = false;

    const current = getCurrentGuideStep(playerData);
    if (current.messageQueue?.length) {
      advanceGuideStep(current.id, playerData);
    }

    this.guideMessageNextStep = null;
    saveGame();
  }

  createShopUI() {
    const panelX = BOOK_PANEL_LAYOUT.x;
    const panelY = BOOK_PANEL_LAYOUT.y;
    const panelWidth = BOOK_PANEL_LAYOUT.width;
    const panelHeight = BOOK_PANEL_LAYOUT.height;
    const listBoxX = 245;
    const listBoxY = 340;
    const listBoxWidth = 300;
    const listBoxHeight = 280;
    const detailBoxX = 575;
    const detailBoxY = 340;
    const detailBoxWidth = 260;
    const detailBoxHeight = 280;
    const cursorX = 120;
    const itemNameX = 145;
    const listTitleX = 245;
    const listTitleY = 220;
    const listStartY = 265;
    const rowSpacing = 48;
    const visibleRowCount = 4;
    const detailTextX = 445;
    const detailLineYs = [265, 305, 345, 385];
    const shopMessageY = 450;
    const shopHelpY = 490;
    this.shopMessageY = shopMessageY;
    this.shopHelpY = shopHelpY;

    this.shopItemRowPositions = Array.from({ length: visibleRowCount }, (_, index) => ({
      nameX: itemNameX,
      cursorX,
      y: listStartY + (index * rowSpacing),
    }));

    this.shopDimOverlay = this.add
      .rectangle(400, 300, 800, 600, 0x000000, 0.28)
      .setScrollFactor(0)
      .setDepth(199)
      .setVisible(false);

    this.shopPanelBg = this.add
      .image(panelX, panelY, BOOK_PANEL_KEY)
      .setDisplaySize(panelWidth, panelHeight)
      .setScrollFactor(0)
      .setDepth(200)
      .setVisible(false);

    this.shopListBox = this.add
      .zone(listBoxX, listBoxY, listBoxWidth, listBoxHeight)
      .setScrollFactor(0)
      .setDepth(201)
      .setVisible(false);

    this.shopDetailBox = this.add
      .zone(detailBoxX, detailBoxY, detailBoxWidth, detailBoxHeight)
      .setScrollFactor(0)
      .setDepth(201)
      .setVisible(false);

    this.shopTitleText = this.add
      .text(400, 110, "Shop", {
        fontSize: "40px",
        color: BOOK_TEXT_COLORS.primary,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);

    this.shopPromptText = this.add
      .text(400, 145, npcMessages.shop, {
        fontSize: "19px",
        color: BOOK_TEXT_COLORS.secondary,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);

    const hasGoldIcon = this.textures.exists(UI_GOLD_COIN_ICON_KEY);
    this.shopGoldIcon = hasGoldIcon
      ? this.add
        .image(125, 196, UI_GOLD_COIN_ICON_KEY)
        .setOrigin(0, 0.5)
        .setDisplaySize(50, 40)
        .setScrollFactor(0)
        .setDepth(202)
        .setVisible(false)
      : null;

    this.shopGoldText = this.add
      .text(hasGoldIcon ? 174 : 145, 185, "", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.accent,
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);

    this.shopListTitleText = this.add
      .text(listTitleX, listTitleY, "Items", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.primary,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);

    this.shopDetailTitleText = this.add
      .text(575, 220, "Info", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.primary,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);

    this.shopCursorText = this.add
      .text(cursorX, listStartY, "▶", {
        fontSize: "22px",
        color: BOOK_TEXT_COLORS.accent,
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);

    this.shopItemNameTexts = this.shopItemRowPositions.map((row) => (
      this.add.text(row.nameX, row.y, "", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.primary,
      })
        .setScrollFactor(0)
        .setDepth(202)
        .setVisible(false)
    ));

    this.shopDetailText = this.add
      .text(detailTextX, detailLineYs[0], "", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.secondary,
        lineSpacing: 8,
        wordWrap: { width: 220 },
      })
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);
    this.shopDetailLineTexts = detailLineYs.map((lineY) => (
      this.add.text(detailTextX, lineY, "", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.secondary,
        wordWrap: { width: 230 },
      })
        .setScrollFactor(0)
        .setDepth(202)
        .setVisible(false)
    ));
    this.shopPriceIcon = hasGoldIcon
      ? this.add
        .image(detailTextX + 67, detailLineYs[1] + 9, UI_GOLD_COIN_ICON_KEY)
        .setOrigin(0, 0.5)
        .setDisplaySize(45, 35)
        .setScrollFactor(0)
        .setDepth(202)
        .setVisible(false)
      : null;
    this.shopPriceAmountText = this.add
      .text(hasGoldIcon ? detailTextX + 110 : detailTextX, detailLineYs[1], "", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.secondary,
      })
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);

    this.shopMessageText = this.add
      .text(400, shopMessageY, "", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.secondary,
        align: "center",
        wordWrap: { width: 620 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);

    this.shopHelpText = this.add
      .text(225, 474, "↑↓ Move   Enter Buy   ESC Close", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.accent,
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(202)
      .setVisible(false);
    this.shopHelpText.setPosition(400, shopHelpY);
    this.shopHelpText.setOrigin(0.5);
    this.shopHelpText.setText("Up / Down: Move   Enter: Buy   Esc: Close");
  }

  setShopUIVisible(visible) {
    [
      this.shopDimOverlay,
      this.shopPanelBg,
      this.shopListBox,
      this.shopDetailBox,
      this.shopTitleText,
      this.shopPromptText,
      this.shopGoldIcon,
      this.shopGoldText,
      this.shopListTitleText,
      this.shopDetailTitleText,
      this.shopCursorText,
      this.shopDetailText,
      this.shopPriceIcon,
      this.shopPriceAmountText,
      this.shopMessageText,
      this.shopHelpText,
    ].forEach((node) => node?.setVisible(visible));

    (this.shopItemNameTexts || []).forEach((node) => node?.setVisible(visible));
    (this.shopDetailLineTexts || []).forEach((node) => node?.setVisible(visible));
  }

  getVisibleShopItemWindow() {
    const rowCount = this.shopItemRowPositions.length || 1;
    const maxStart = Math.max(0, shopItems.length - rowCount);
    const selectedIndex = Phaser.Math.Clamp(this.shopSelectionIndex, 0, Math.max(shopItems.length - 1, 0));
    const startIndex = Phaser.Math.Clamp(selectedIndex - (rowCount - 1), 0, maxStart);
    const visibleItems = shopItems.slice(startIndex, startIndex + rowCount);
    const selectedVisibleIndex = selectedIndex - startIndex;

    return { visibleItems, selectedVisibleIndex };
  }

  handleShopInput() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.shopSelectionIndex = (this.shopSelectionIndex - 1 + shopItems.length) % shopItems.length;
      playSfx(this, audioKeys.sfx.uiMove);
      this.renderShopUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.shopSelectionIndex = (this.shopSelectionIndex + 1) % shopItems.length;
      playSfx(this, audioKeys.sfx.uiMove);
      this.renderShopUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER)) {
      playSfx(this, audioKeys.sfx.uiConfirm);
      this.buyItem(shopItems[this.shopSelectionIndex]);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
      playSfx(this, audioKeys.sfx.uiBack);
      this.closeShop();
    }
  }

  buyItem(item) {
    if (!item) return;

    if (playerData.gold < item.price) {
      this.shopMessage = `Need more gold for ${getShopDisplayName(item)}.`;
      this.renderShopUI();
      return;
    }

    playerData.gold -= item.price;
    addItem(item.name, 1);
    saveGame();
    this.updateStatusUI();
    this.showPendingLevelUpNotifications();
    playSfx(this, audioKeys.sfx.shopPurchase);

    this.shopMessage = `You bought 1 ${getShopDisplayName(item)}`;
    this.renderShopUI();
  }

  renderShopUI() {
    const selectedItem = shopItems[this.shopSelectionIndex] || shopItems[0] || null;
    const { visibleItems, selectedVisibleIndex } = this.getVisibleShopItemWindow();
    const detailLines = selectedItem
      ? [
        getShopDisplayName(selectedItem),
        this.shopPriceIcon ? "Price:" : `Price: ${selectedItem.price} gold`,
        getShopItemDescription(selectedItem),
        playerData.gold >= selectedItem.price ? "Available to Purchase" : "You need more gold",
      ]
      : ["No item."];

    this.setShopUIVisible(true);
    this.shopGoldText.setText(this.shopGoldIcon ? `${playerData.gold}` : `Gold: ${playerData.gold}`);
    this.shopDetailText.setText("");
    (this.shopDetailLineTexts || []).forEach((node, index) => {
      const text = detailLines[index] || "";
      node?.setText(text);
      node?.setVisible(Boolean(text));
    });
    this.shopPriceIcon?.setVisible(Boolean(selectedItem));
    this.shopPriceAmountText
      ?.setText(selectedItem && this.shopPriceIcon ? `${selectedItem.price}` : "")
      .setVisible(Boolean(selectedItem && this.shopPriceIcon));
    this.shopMessageText.setPosition(400, this.shopMessageY || 450);
    this.shopMessageText.setOrigin(0.5);
    this.shopMessageText.setText(this.shopMessage || "Choose an item to buy.");
    this.shopHelpText.setPosition(400, this.shopHelpY || 490);
    this.shopHelpText.setOrigin(0.5);

    (this.shopItemNameTexts || []).forEach((node, index) => {
      const item = visibleItems[index] || null;
      const row = this.shopItemRowPositions[index];

      if (!item || !row) {
        node?.setText("");
        node?.setVisible(false);
        return;
      }

      node?.setPosition(row.nameX, row.y);
      node?.setText(getShopDisplayName(item));
      node?.setVisible(true);
    });

    const selectedRow = this.shopItemRowPositions[selectedVisibleIndex] || this.shopItemRowPositions[0];
    if (selectedRow) {
      this.shopCursorText.setPosition(selectedRow.cursorX, selectedRow.y);
      this.shopCursorText.setVisible(true);
    } else {
      this.shopCursorText.setVisible(false);
    }
  }

  openShop() {
    this.shopOpen = true;
    this.shopSelectionIndex = Phaser.Math.Clamp(this.shopSelectionIndex, 0, Math.max(shopItems.length - 1, 0));
    this.shopMessage = "";
    this.renderShopUI();
  }

  closeShop() {
    this.shopOpen = false;
    this.shopMessage = "";
    this.setShopUIVisible(false);
  }
}

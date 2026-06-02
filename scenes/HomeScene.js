import { BaseScene } from "./BaseScene.js";
import { playerData } from "../data/playerData.js";
import {
  createBasicTextures,
  EXPLORATION_PLAYER_DISPLAY_SIZE,
  PLAYER_WALK_SHEET_KEY,
  preloadHomeMapArt,
} from "../utils/textureFactory.js";
import { hidePrompt, preloadHudUiAssets, showPrompt } from "../utils/ui.js";
import { saveGame } from "../utils/saveSystem.js";
import {
  advanceGuideStep,
  ensureGuideState,
  getCurrentGuideStep,
  isTutorialActive,
} from "../utils/guideSystem.js";
import { GUIDE_STEP_IDS } from "../data/guideSteps.js";
import { audioKeys } from "../config/audioKeys.js";
import { loadAndPlayBgmAfterRender } from "../utils/musicManager.js";

const WORLD_HOME_EXIT_POSITION = { x: 200, y: 166 };
const HOME_INTERIOR_ENTRY_POSITION = { x: 400, y: 500 };
const BEGINNER_HOME_OPENING_POSITION = { x: 400, y: 380 };
const DEBUG_HOME_COLLISION = false;
const GAME_OVER_PANEL_KEY = "gameOverPanel";
const GAME_OVER_PANEL_PATH = "assets/images/ui/game_over_panel.png";
const OPENING_BUBBLE_PANEL_KEY = "homeOpeningBubblePanel";
const OPENING_BUBBLE_PANEL_PATH = "assets/ui/dialogue/home_opening_bubble.png";
const OPENING_BUBBLE_LINES = [
  "Welcome, hero!",
  "Welcome to Dungeon of Equations RPG.",
  "Follow the guide in the top-left corner.",
  "Good luck clearing the dungeon!",
];
const OPENING_BUBBLE_LAYOUT = {
  width: 380,
  height: 140,
  offsetX: 120,
  offsetY: -70,
  textX: 5,
  textY: -3,
  textWrapWidth: 285,
  fontSize: "17px",
  autoAdvanceDelayMs: 4000,
};
const GAME_OVER_PANEL_X = 370;
const GAME_OVER_PANEL_Y = 300;
const GAME_OVER_PANEL_DISPLAY_WIDTH = 720;
const GAME_OVER_PANEL_DISPLAY_HEIGHT = 480;

export class HomeScene extends BaseScene {
  constructor() {
    super("HomeScene");
    this.homeGuideMovedDistance = 0;
    this.lastHomeGuidePosition = null;
  }

  init(data) {
    this.showGameOverOnCreate = data?.showGameOver === true;
    this.gameOverTitle = data?.gameOverTitle || "Game Over";
    this.gameOverMessage = data?.gameOverMessage || "Try again. You can do it.";
    this.gameOverNoticeActive = false;
  }

  preload() {
    preloadHomeMapArt(this);
    preloadHudUiAssets(this);
    if (!this.textures.exists(GAME_OVER_PANEL_KEY)) {
      this.load.image(GAME_OVER_PANEL_KEY, GAME_OVER_PANEL_PATH);
    }
    if (!this.textures.exists(OPENING_BUBBLE_PANEL_KEY)) {
      this.load.image(OPENING_BUBBLE_PANEL_KEY, OPENING_BUBBLE_PANEL_PATH);
    }
    this.preloadResultModalAssets();
  }

  create() {
    this.interactTarget = null;
    ensureGuideState(playerData);

    createBasicTextures(this);

    if (this.textures.exists("homeRoomMap")) {
      const homeBackground = this.add.image(400, 300, "homeRoomMap");
      const backgroundScale = Math.max(800 / homeBackground.width, 600 / homeBackground.height);
      homeBackground.setScale(backgroundScale);
      homeBackground.setDepth(-20);
    } else {
      this.add.rectangle(400, 300, 800, 600, 0xd8c3a5).setDepth(-20);
    }

    const homeSpawnPosition =
      playerData.difficulty === "beginner" ? BEGINNER_HOME_OPENING_POSITION : playerData.position.home;

    this.player = this.physics.add.sprite(
      homeSpawnPosition.x,
      homeSpawnPosition.y,
      PLAYER_WALK_SHEET_KEY,
      1,
    );
    this.player.setDisplaySize(EXPLORATION_PLAYER_DISPLAY_SIZE, EXPLORATION_PLAYER_DISPLAY_SIZE);
    this.player.setDepth(-4);
    this.player.setCollideWorldBounds(true);
    const playerBodyWidth = Math.round(this.player.width * 0.4);
    const playerBodyHeight = Math.round(this.player.height * 0.64);
    const playerBodyOffsetX = Math.round((this.player.width - playerBodyWidth) / 2);
    const playerBodyOffsetY = Math.round(this.player.height - playerBodyHeight - (3 / this.player.scaleY));
    this.player.body.setSize(playerBodyWidth, playerBodyHeight, true);
    this.player.body.setOffset(playerBodyOffsetX, playerBodyOffsetY);

    this.createWalls();
    this.createFurniture();
    this.createDoorZone();

    this.setupPrompt();
    this.setupCommonKeys();
    this.setupStatusUI();
    this.setupLevelUpUI();
    this.setupGameOverUI();
    this.setupOpeningBubble();

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.furnitureBlockers);

    this.physics.add.overlap(this.player, this.doorZone, () => {
      this.interactTarget = "exitHome";
    });

    this.lastHomeGuidePosition = new Phaser.Math.Vector2(this.player.x, this.player.y);

    if (this.showGameOverOnCreate) {
      this.showGameOverPopup();
    }

    loadAndPlayBgmAfterRender(this, audioKeys.bgm.normal);
  }

  setupOpeningBubble() {
    this.openingBubbleActive = false;
    this.openingBubbleIndex = 0;
    this.openingBubbleLines = OPENING_BUBBLE_LINES;
    this.openingBubbleTimer = null;
    this.events.once("shutdown", () => this.clearOpeningBubbleTimer());

    const panelItems = [];
    if (this.textures.exists(OPENING_BUBBLE_PANEL_KEY)) {
      panelItems.push(
        this.add
          .image(0, 0, OPENING_BUBBLE_PANEL_KEY)
          .setDisplaySize(OPENING_BUBBLE_LAYOUT.width, OPENING_BUBBLE_LAYOUT.height),
      );
    } else {
      panelItems.push(
        this.add
          .rectangle(
            0,
            0,
            OPENING_BUBBLE_LAYOUT.width,
            OPENING_BUBBLE_LAYOUT.height,
            0x111827,
            0.92,
          )
          .setStrokeStyle(3, 0xfacc15),
      );
    }

    this.openingBubbleText = this.add
      .text(OPENING_BUBBLE_LAYOUT.textX, OPENING_BUBBLE_LAYOUT.textY, "", {
        fontSize: OPENING_BUBBLE_LAYOUT.fontSize,
        color: "#3a2415",
        align: "center",
        wordWrap: { width: OPENING_BUBBLE_LAYOUT.textWrapWidth },
      })
      .setOrigin(0.5);

    panelItems.push(this.openingBubbleText);
    this.openingBubbleContainer = this.add
      .container(0, 0, panelItems)
      .setDepth(900)
      .setVisible(false);

    if (playerData.difficulty === "beginner" && !this.showGameOverOnCreate) {
      this.openingBubbleActive = true;
      this.openingBubbleText.setText(this.openingBubbleLines[this.openingBubbleIndex]);
      this.updateOpeningBubblePosition();
      this.openingBubbleContainer.setVisible(true);
      this.startOpeningBubbleTimer();
    }
  }

  startOpeningBubbleTimer() {
    this.clearOpeningBubbleTimer();
    if (!this.openingBubbleActive) return;

    this.openingBubbleTimer = this.time.delayedCall(OPENING_BUBBLE_LAYOUT.autoAdvanceDelayMs, () => {
      this.openingBubbleTimer = null;
      this.advanceOpeningBubbleLine();
    });
  }

  clearOpeningBubbleTimer() {
    if (!this.openingBubbleTimer) return;

    this.openingBubbleTimer.remove(false);
    this.openingBubbleTimer = null;
  }

  updateOpeningBubblePosition() {
    if (!this.openingBubbleActive || !this.openingBubbleContainer || !this.player) return;

    const halfWidth = OPENING_BUBBLE_LAYOUT.width / 2;
    const halfHeight = OPENING_BUBBLE_LAYOUT.height / 2;
    const margin = 12;
    const x = Phaser.Math.Clamp(
      this.player.x + OPENING_BUBBLE_LAYOUT.offsetX,
      halfWidth + margin,
      800 - halfWidth - margin,
    );
    const y = Phaser.Math.Clamp(
      this.player.y + OPENING_BUBBLE_LAYOUT.offsetY,
      halfHeight + margin,
      600 - halfHeight - margin,
    );

    this.openingBubbleContainer.setPosition(x, y);
  }

  hideOpeningBubble() {
    this.clearOpeningBubbleTimer();
    this.openingBubbleActive = false;
    this.openingBubbleContainer?.setVisible(false);
  }

  advanceOpeningBubbleLine() {
    if (!this.openingBubbleActive) return false;

    this.openingBubbleIndex += 1;
    if (this.openingBubbleIndex >= this.openingBubbleLines.length) {
      this.hideOpeningBubble();
      return true;
    }

    this.openingBubbleText.setText(this.openingBubbleLines[this.openingBubbleIndex]);
    this.startOpeningBubbleTimer();
    return true;
  }

  handleOpeningBubbleInput() {
    if (!this.openingBubbleActive) return false;

    const advancePressed =
      Phaser.Input.Keyboard.JustDown(this.keyENTER) ||
      Phaser.Input.Keyboard.JustDown(this.keySPACE);

    if (!advancePressed) return false;

    return this.advanceOpeningBubbleLine();
  }

  createWalls() {
    this.walls = this.physics.add.staticGroup();
    const createHomeBlocker = (group, x, y, width, height, color = 0x654321) => {
      const blocker = this.add.rectangle(
        x,
        y,
        width,
        height,
        color,
        DEBUG_HOME_COLLISION ? 0.28 : 0,
      );
      if (DEBUG_HOME_COLLISION) {
        blocker.setStrokeStyle(2, color, 0.9);
      }
      this.physics.add.existing(blocker, true);
      group.add(blocker);
      return blocker;
    };
    this.createHomeBlocker = createHomeBlocker;

    this.topWall = createHomeBlocker(this.walls, 400, 20, 800, 40);
    this.bottomWallLeft = createHomeBlocker(this.walls, 190, 580, 380, 40);
    this.bottomWallRight = createHomeBlocker(this.walls, 610, 580, 380, 40);
    this.leftWall = createHomeBlocker(this.walls, 20, 300, 40, 600);
    this.rightWall = createHomeBlocker(this.walls, 780, 300, 40, 600);

    this.doorFrame = this.add.rectangle(400, 580, 130, 20, 0x5b3a29);
    this.door = this.add.rectangle(400, 548, 72, 62, 0x3b2f2f).setStrokeStyle(3, 0xe9d8a6);
    this.doorFrame.setAlpha(DEBUG_HOME_COLLISION ? 1 : 0);
    this.door.setAlpha(DEBUG_HOME_COLLISION ? 1 : 0);
  }

  createFurniture() {
    this.furnitureBlockers = this.physics.add.staticGroup();

    this.fireplaceCollision = this.createHomeBlocker(this.furnitureBlockers, 182, 166, 164, 116, 0x8b4513);
    this.leftShelfCollision = this.createHomeBlocker(this.furnitureBlockers, 78, 317, 64, 136, 0x8b4513);
    this.leftCratesBarrelCollision = this.createHomeBlocker(this.furnitureBlockers, 92, 430, 90, 120, 0x8b4513);
    this.leftPlantCollision = this.createHomeBlocker(this.furnitureBlockers, 78, 465, 80, 108, 0x8b4513);
    this.centerChestCollision = this.createHomeBlocker(this.furnitureBlockers, 419, 235, 124, 96, 0x8b4513);
    this.bookshelfCollision = this.createHomeBlocker(this.furnitureBlockers, 514, 155, 92, 118, 0x8b4513);
    this.bedsideTableCollision = this.createHomeBlocker(this.furnitureBlockers, 589, 176, 66, 88, 0x8b4513);
    this.bedCollision = this.createHomeBlocker(this.furnitureBlockers, 646, 202, 144, 176, 0x87ceeb);
    this.rightPlantCollision = this.createHomeBlocker(this.furnitureBlockers, 735, 333, 42, 94, 0x8b4513);
    this.rightTableBarrelCollision = this.createHomeBlocker(this.furnitureBlockers, 698, 448, 102, 118, 0x8b4513);
  }

  createDoorZone() {
    this.doorZone = this.add.zone(400, 535, 120, 90);
    this.physics.add.existing(this.doorZone, true);
  }

  setupGameOverUI() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.gameOverOverlay = this.add.container(0, 0).setDepth(1100).setVisible(false);

    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45);
    const overlayItems = [shade];

    if (this.textures.exists(GAME_OVER_PANEL_KEY)) {
      const panelImage = this.add
        .image(GAME_OVER_PANEL_X, GAME_OVER_PANEL_Y, GAME_OVER_PANEL_KEY)
        .setDisplaySize(GAME_OVER_PANEL_DISPLAY_WIDTH, GAME_OVER_PANEL_DISPLAY_HEIGHT);
      overlayItems.push(panelImage);
    } else {
      const panel = this.add.rectangle(width / 2, height / 2, 460, 240, 0x111827, 0.98).setStrokeStyle(3, 0xfacc15);
      const title = this.add.text(width / 2, height / 2 - 92, this.gameOverTitle, {
        fontSize: "28px",
        color: "#facc15",
        fontStyle: "bold",
      }).setOrigin(0.5);
      const body = this.add.text(width / 2, height / 2 - 4, this.gameOverMessage, {
        fontSize: "22px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 12,
        wordWrap: { width: 380 },
      }).setOrigin(0.5);
      const footer = this.add.text(width / 2, height / 2 + 84, "Press Enter", {
        fontSize: "16px",
        color: "#cbd5e1",
      }).setOrigin(0.5);
      overlayItems.push(panel, title, body, footer);
    }

    this.gameOverOverlay.add(overlayItems);
  }

  showGameOverPopup() {
    this.gameOverNoticeActive = true;
    this.player?.setVelocity?.(0, 0);
    hidePrompt(this.promptText);
    this.gameOverOverlay?.setVisible(true);
  }

  handleGameOverPopupInput() {
    if (!this.gameOverNoticeActive) return false;

    const pressedClose =
      Phaser.Input.Keyboard.JustDown(this.keyENTER) ||
      Phaser.Input.Keyboard.JustDown(this.keySPACE);

    if (!pressedClose) return true;

    this.gameOverOverlay?.setVisible(false);
    this.gameOverNoticeActive = false;
    this.showGameOverOnCreate = false;
    return true;
  }

  update() {
    this.updateStatusUI();
    this.showPendingLevelUpNotifications();
    this.handlePlayerMovement(this.player, 200, this.levelUpNoticeActive || this.gameOverNoticeActive);

    if (this.handleDialogueInput()) {
      return;
    }

    if (this.handleGameOverPopupInput()) {
      return;
    }

    if (this.levelUpNoticeActive) {
      return;
    }

    this.updateOpeningBubblePosition();
    this.handleOpeningBubbleInput();

    this.updateHomeGuideProgress();

    const nearDoor = this.physics.overlap(this.player, this.doorZone);
    const guideStep = getCurrentGuideStep(playerData);
    const tutorialActive = isTutorialActive(playerData);

    if (nearDoor) {
      this.interactTarget = "exitHome";
      if (tutorialActive && guideStep.id === GUIDE_STEP_IDS.HOME_INTERACT) {
        showPrompt(this.promptText, "Press E to exit");
      } else {
        showPrompt(this.promptText, "Press E to exit home");
      }
    } else {
      this.interactTarget = null;
      if (
        !tutorialActive ||
        (guideStep.id !== GUIDE_STEP_IDS.HOME_MOVE && guideStep.id !== GUIDE_STEP_IDS.BAG_INTRO)
      ) {
        hidePrompt(this.promptText);
      }
    }

    if (tutorialActive) {
      if (guideStep.id === GUIDE_STEP_IDS.HOME_MOVE) {
        showPrompt(this.promptText, guideStep.prompt);
      } else if (guideStep.id === GUIDE_STEP_IDS.BAG_INTRO) {
        showPrompt(this.promptText, guideStep.prompt);
      } else if (guideStep.id === GUIDE_STEP_IDS.HOME_INTERACT && !nearDoor) {
        showPrompt(this.promptText, guideStep.prompt);
      }
    }

    if (this.isInventoryHotkeyPressed()) {
      if (this.openInventory()) {
        saveGame();
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.interactTarget === "exitHome") {
        if (tutorialActive && guideStep.id === GUIDE_STEP_IDS.HOME_INTERACT) {
          advanceGuideStep(GUIDE_STEP_IDS.HOME_INTERACT, playerData);
        }

        playerData.position.home.x = HOME_INTERIOR_ENTRY_POSITION.x;
        playerData.position.home.y = HOME_INTERIOR_ENTRY_POSITION.y;
        playerData.position.world.x = WORLD_HOME_EXIT_POSITION.x;
        playerData.position.world.y = WORLD_HOME_EXIT_POSITION.y;
        saveGame();
        this.hideOpeningBubble();
        this.scene.start("WorldScene", { playerFacingDirection: "down" });
      }
    }
  }

  updateHomeGuideProgress() {
    if (!isTutorialActive(playerData)) return;
    const guideStep = getCurrentGuideStep(playerData);
    if (guideStep.id !== GUIDE_STEP_IDS.HOME_MOVE || !this.lastHomeGuidePosition) return;

    const moved = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.lastHomeGuidePosition.x,
      this.lastHomeGuidePosition.y,
    );

    if (moved > 0) {
      this.homeGuideMovedDistance += moved;
      this.lastHomeGuidePosition.set(this.player.x, this.player.y);
    }

    if (this.homeGuideMovedDistance >= 48) {
      advanceGuideStep(GUIDE_STEP_IDS.HOME_MOVE, playerData);
      saveGame();
    }
  }
}

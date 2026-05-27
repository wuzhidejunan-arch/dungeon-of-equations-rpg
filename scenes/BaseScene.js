import { createPrompt, UI_GOLD_COIN_ICON_KEY } from "../utils/ui.js";
import { createStatusUI, refreshStatusUI } from "../utils/statusUI.js";
import { createDialogueUI, nextDialogueLine } from "../utils/dialogueSystem.js";
import { playerData } from "../data/playerData.js";
import { ensureLevelState } from "../utils/levelSystem.js";
import { markBagOpened } from "../utils/guideSystem.js";
import { createFieldInventoryContext } from "../utils/fieldInventory.js";
import { createDebugBadge, syncDebugBadge } from "../utils/debugBadge.js";
import { audioKeys } from "../config/audioKeys.js";
import { playSfx } from "../utils/sfxManager.js";
import { itemDefinitions } from "../data/battleData.js";
import { PLAYER_WALK_SHEET_KEY } from "../utils/textureFactory.js";

const PLAYER_FACING_DIRECTIONS = {
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  UP: "up",
};
const PLAYER_WALK_ANIMATIONS = {
  down: { key: "player-walk-down", frames: [0, 1, 2] },
  left: { key: "player-walk-left", frames: [3, 4, 5, 4] },
  right: { key: "player-walk-right", frames: [6, 7, 8, 7] },
  up: { key: "player-walk-up", frames: [9, 10, 11] },
};
const PLAYER_IDLE_FRAMES = {
  down: 1,
  left: 4,
  right: 7,
  up: 10,
};
const PLAYER_WALK_FRAME_RATE = 8;

const RESULT_MODAL_ASSETS = {
  frame: {
    key: "result_modal_frame",
    path: "assets/ui/result_modal_frame.png",
  },
  levelUpTitle: {
    key: "level_up_title",
    path: "assets/ui/level_up_title.png",
  },
  stageClearTitle: {
    key: "stage_clear_title",
    path: "assets/ui/stage_clear_title.png",
  },
  goldCoinIcon: {
    key: UI_GOLD_COIN_ICON_KEY,
    path: "assets/images/ui/icons/gold_coin.png",
  },
};
const GOLD_REWARD_LINE_PATTERN = /^\+(\d+)\s+Gold$/;
const LEVEL_UP_REWARD_TEXT_OFFSET_Y = -36;
const TRAINING_REWARD_TEXT_OFFSET_Y = -12;
const LEVEL_UP_GOLD_REWARD_ICON_LAYOUT = {
  iconOffsetX: -54,
  iconOffsetY: 34,
  iconWidth: 60,
  iconHeight: 50,
  amountOffsetX: 5,
  amountOffsetY: 34,
};
const TRAINING_GOLD_REWARD_ICON_LAYOUT = {
  iconOffsetX: -54,
  iconOffsetY: 75,
  iconWidth: 50,
  iconHeight: 40,
  amountOffsetX: -5,
  amountOffsetY: 75,
};

function getRewardMessageSource(rewardLines) {
  const firstLine = String(rewardLines?.[0] || "");
  return firstLine.startsWith("Training Stage ") ? "training" : "levelUp";
}

function getGoldRewardIconLayout(source) {
  return source === "training"
    ? TRAINING_GOLD_REWARD_ICON_LAYOUT
    : LEVEL_UP_GOLD_REWARD_ICON_LAYOUT;
}

function getRewardTextOffsetY(source) {
  return source === "training"
    ? TRAINING_REWARD_TEXT_OFFSET_Y
    : LEVEL_UP_REWARD_TEXT_OFFSET_Y;
}

export function preloadResultModalAssets(scene) {
  Object.values(RESULT_MODAL_ASSETS).forEach(({ key, path }) => {
    if (!scene.textures.exists(key)) {
      scene.load.image(key, path);
    }
  });
}

export class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.interactTarget = null;
    this.dialogueActive = false;
    this.dialogueIndex = 0;
    this.dialogueData = [];
    this.levelUpNoticeActive = false;
    this.inventoryOpen = false;
    this.playerFacingDirection = PLAYER_FACING_DIRECTIONS.DOWN;
  }

  setupCommonKeys() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyESC = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );
    this.keyB = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);

    if (!this.debugBadge) {
      this.debugBadge = createDebugBadge(this, { visible: false });
    }
  }

  setupPrompt() {
    this.promptText = createPrompt(this);
  }

  setupStatusUI() {
    ensureLevelState(playerData);
    this.statusUI = createStatusUI(this);
    refreshStatusUI(this.statusUI, playerData);
  }

  preloadResultModalAssets() {
    preloadResultModalAssets(this);
  }

  setupLevelUpUI() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const modalWidth = Math.min(720, width - 72);
    const modalHeight = Math.round(modalWidth * (1024 / 1536));
    const titleWidth = Math.min(680, modalWidth * 0.96);
    const titleHeight = Math.round(titleWidth * (1024 / 1536));
    const hasFrame = this.textures.exists(RESULT_MODAL_ASSETS.frame.key);
    const hasTitle = this.textures.exists(RESULT_MODAL_ASSETS.levelUpTitle.key);
    const hasGoldIcon = this.textures.exists(UI_GOLD_COIN_ICON_KEY);

    this.levelUpOverlay = this.add.container(0, 0).setDepth(1000).setVisible(false);

    const shade = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.52);
    const panel = hasFrame
      ? this.add.image(centerX, centerY, RESULT_MODAL_ASSETS.frame.key).setDisplaySize(modalWidth, modalHeight)
      : this.add.rectangle(centerX, centerY, 460, 240, 0x111827, 0.98).setStrokeStyle(3, 0xfacc15);
    const title = hasTitle
      ? this.add.image(centerX, centerY - 124, RESULT_MODAL_ASSETS.levelUpTitle.key).setDisplaySize(titleWidth, titleHeight)
      : this.add.text(centerX, centerY - 140, "Level Up!", {
        fontSize: "28px",
        color: "#facc15",
        fontStyle: "bold",
      }).setOrigin(0.5);
    const body = this.add.text(centerX, centerY + LEVEL_UP_REWARD_TEXT_OFFSET_Y, "", {
      fontSize: "27px",
      color: "#fff0b8",
      fontStyle: "bold",
      align: "center",
      lineSpacing: 16,
      stroke: "#21150c",
      strokeThickness: 4,
    }).setOrigin(0.5);
    const goldIcon = hasGoldIcon
      ? this.add
        .image(
          centerX + LEVEL_UP_GOLD_REWARD_ICON_LAYOUT.iconOffsetX,
          centerY + LEVEL_UP_GOLD_REWARD_ICON_LAYOUT.iconOffsetY,
          UI_GOLD_COIN_ICON_KEY,
        )
        .setOrigin(0, 0.5)
        .setDisplaySize(
          LEVEL_UP_GOLD_REWARD_ICON_LAYOUT.iconWidth,
          LEVEL_UP_GOLD_REWARD_ICON_LAYOUT.iconHeight,
        )
        .setVisible(false)
      : null;
    const goldAmountText = hasGoldIcon
      ? this.add.text(
        centerX + LEVEL_UP_GOLD_REWARD_ICON_LAYOUT.amountOffsetX,
        centerY + LEVEL_UP_GOLD_REWARD_ICON_LAYOUT.amountOffsetY,
        "",
        {
          fontSize: "27px",
          color: "#fff0b8",
          fontStyle: "bold",
          stroke: "#21150c",
          strokeThickness: 4,
        },
      ).setOrigin(0, 0.5).setVisible(false)
      : null;
    const footer = this.add.text(centerX, centerY + 123, "ENTER continue", {
      fontSize: "20px",
      color: "#ffe6a3",
      fontStyle: "bold",
      stroke: "#21150c",
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.levelUpOverlay.add([shade, panel, title, body, goldIcon, goldAmountText, footer].filter(Boolean));
    this.levelUpText = body;
    this.levelUpGoldIcon = goldIcon;
    this.levelUpGoldAmountText = goldAmountText;
    this.keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  showPendingLevelUpNotifications() {
    ensureLevelState(playerData);

    if (!this.levelUpOverlay || this.levelUpNoticeActive) return;
    if (!playerData.pendingLevelUpMessages.length) return;

    const lines = playerData.pendingLevelUpMessages.shift();
    const rewardLines = Array.isArray(lines) ? lines : [String(lines || "")];
    const rewardSource = getRewardMessageSource(rewardLines);
    const goldLayout = getGoldRewardIconLayout(rewardSource);
    const goldLine = rewardLines.find((line) => GOLD_REWARD_LINE_PATTERN.test(String(line || ""))) || "";
    const goldMatch = String(goldLine).match(GOLD_REWARD_LINE_PATTERN);
    const canShowGoldIcon = Boolean(goldMatch && this.textures.exists(UI_GOLD_COIN_ICON_KEY));
    const displayLines = canShowGoldIcon
      ? rewardLines.filter((line) => String(line || "") !== goldLine)
      : rewardLines;

    this.levelUpNoticeActive = true;
    this.levelUpText.setPosition(this.scale.width / 2, this.scale.height / 2 + getRewardTextOffsetY(rewardSource));
    this.levelUpText.setText(displayLines.join("\n"));
    this.levelUpGoldIcon
      ?.setPosition(
        this.scale.width / 2 + goldLayout.iconOffsetX,
        this.scale.height / 2 + goldLayout.iconOffsetY,
      )
      .setDisplaySize(goldLayout.iconWidth, goldLayout.iconHeight)
      .setVisible(canShowGoldIcon);
    this.levelUpGoldAmountText
      ?.setPosition(
        this.scale.width / 2 + goldLayout.amountOffsetX,
        this.scale.height / 2 + goldLayout.amountOffsetY,
      )
      ?.setText(canShowGoldIcon ? `+${goldMatch[1]}` : "")
      .setVisible(canShowGoldIcon);
    this.levelUpOverlay.setVisible(true);
    playSfx(this, audioKeys.sfx.levelUp);
    this.updateStatusUI();
  }

  handleLevelUpPopupInput() {
    if (!this.levelUpNoticeActive) return false;

    const pressedClose =
      Phaser.Input.Keyboard.JustDown(this.keyENTER) ||
      Phaser.Input.Keyboard.JustDown(this.keySPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keyE);

    if (!pressedClose) return true;

    this.levelUpOverlay.setVisible(false);
    this.levelUpNoticeActive = false;

    if (playerData.pendingLevelUpMessages.length > 0) {
      this.showPendingLevelUpNotifications();
    }

    return true;
  }

  updateStatusUI() {
    syncDebugBadge(this.debugBadge);

    if (!this.statusUI) return;
    refreshStatusUI(this.statusUI, playerData);
  }

  getInventoryContext() {
    return createFieldInventoryContext(this);
  }

  onInventoryClosed() {
    this.inventoryOpen = false;

    if (this.input?.keyboard) {
      this.input.keyboard.resetKeys();
    }

    this.updateStatusUI();
  }

  onFieldItemUsed(_result, itemName) {
    const itemDefinition = itemDefinitions[itemName] || null;
    const effects = Array.isArray(itemDefinition?.effects) ? itemDefinition.effects : [];
    if (/potion/i.test(String(itemName || "")) || effects.some((effect) => effect?.type === "healHp")) {
      playSfx(this, audioKeys.sfx.potion, {
        volume: 0.5,
        cooldownMs: 200,
        maxDurationMs: 1200,
        allowOverlap: false,
      });
    }
    this.updateStatusUI();
  }

  setupDialogueUI() {
    this.dialogueUI = createDialogueUI(this);
  }

  handleDialogueInput() {
    if (this.handleLevelUpPopupInput()) {
      return true;
    }

    if (
      this.dialogueActive &&
      (
        Phaser.Input.Keyboard.JustDown(this.keyENTER) ||
        Phaser.Input.Keyboard.JustDown(this.keySPACE)
      )
    ) {
      nextDialogueLine(this, this.dialogueUI);
      return true;
    }

    return false;
  }

  handlePlayerMovement(player, speed = 200, isLocked = false) {
    if (!player) return;

    player.setVelocity(0);

    if (isLocked || this.dialogueActive) {
      this.setExplorationPlayerIdleFrame(player);
      return;
    }

    const moveLeft = this.keyA?.isDown || this.cursors.left.isDown;
    const moveRight = this.keyD?.isDown || this.cursors.right.isDown;
    const moveUp = this.keyW?.isDown || this.cursors.up.isDown;
    const moveDown = this.keyS?.isDown || this.cursors.down.isDown;
    let movementDirection = null;

    if (moveLeft) {
      player.setVelocityX(-speed);
      movementDirection = PLAYER_FACING_DIRECTIONS.LEFT;
    } else if (moveRight) {
      player.setVelocityX(speed);
      movementDirection = PLAYER_FACING_DIRECTIONS.RIGHT;
    }

    if (moveUp) {
      player.setVelocityY(-speed);
      movementDirection = PLAYER_FACING_DIRECTIONS.UP;
    } else if (moveDown) {
      player.setVelocityY(speed);
      movementDirection = PLAYER_FACING_DIRECTIONS.DOWN;
    }

    if (movementDirection) {
      this.playExplorationPlayerWalkAnimation(player, movementDirection);
      playSfx(this, audioKeys.sfx.playerMove);
    } else {
      this.setExplorationPlayerIdleFrame(player);
    }
  }

  setupPlayerWalkAnimations() {
    Object.values(PLAYER_WALK_ANIMATIONS).forEach(({ key, frames }) => {
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(PLAYER_WALK_SHEET_KEY, { frames }),
        frameRate: PLAYER_WALK_FRAME_RATE,
        repeat: -1,
      });
    });
  }

  isExplorationPlayerSprite(player) {
    return player?.texture?.key === PLAYER_WALK_SHEET_KEY;
  }

  playExplorationPlayerWalkAnimation(player, direction) {
    if (!this.isExplorationPlayerSprite(player)) return;
    this.setupPlayerWalkAnimations();
    this.playerFacingDirection = direction;
    const animation = PLAYER_WALK_ANIMATIONS[direction];
    if (animation) {
      player.anims.play(animation.key, true);
    }
  }

  setExplorationPlayerIdleFrame(player) {
    if (!this.isExplorationPlayerSprite(player)) return;
    player.anims?.stop();
    const idleFrame = PLAYER_IDLE_FRAMES[this.playerFacingDirection] ?? PLAYER_IDLE_FRAMES.down;
    player.setFrame(idleFrame);
  }

  isInventoryHotkeyPressed() {
    return (
      Phaser.Input.Keyboard.JustDown(this.keyB) ||
      Phaser.Input.Keyboard.JustDown(this.keyI)
    );
  }

  openInventory() {
    if (this.dialogueActive || this.inventoryOpen) return false;

    const inventoryScene = this.scene.get('InventoryScene');
    if (inventoryScene?.scene?.isActive()) {
      return false;
    }

    markBagOpened();
    this.inventoryOpen = true;
    playSfx(this, audioKeys.sfx.uiConfirm);

    if (this.input?.keyboard) {
      this.input.keyboard.resetKeys();
    }

    this.scene.launch("InventoryScene", {
      returnScene: this.scene.key,
      context: this.getInventoryContext(),
    });

    this.scene.bringToTop('InventoryScene');
    this.scene.pause(this.scene.key);
    return true;
  }
}

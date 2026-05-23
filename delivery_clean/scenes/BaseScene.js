import { createPrompt } from "../utils/ui.js";
import { createStatusUI, refreshStatusUI } from "../utils/statusUI.js";
import { createDialogueUI, nextDialogueLine } from "../utils/dialogueSystem.js";
import { playerData } from "../data/playerData.js";
import { ensureLevelState } from "../utils/levelSystem.js";
import { markBagOpened } from "../utils/guideSystem.js";
import { createFieldInventoryContext } from "../utils/fieldInventory.js";
import { createDebugBadge, syncDebugBadge } from "../utils/debugBadge.js";

export class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.interactTarget = null;
    this.dialogueActive = false;
    this.dialogueIndex = 0;
    this.dialogueData = [];
    this.levelUpNoticeActive = false;
    this.inventoryOpen = false;
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

  setupLevelUpUI() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.levelUpOverlay = this.add.container(0, 0).setDepth(1000).setVisible(false);

    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45);
    const panel = this.add.rectangle(width / 2, height / 2, 460, 240, 0x111827, 0.98).setStrokeStyle(3, 0xfacc15);
    const title = this.add.text(width / 2, height / 2 - 92, "Level Up!", {
      fontSize: "28px",
      color: "#facc15",
      fontStyle: "bold",
    }).setOrigin(0.5);
    const body = this.add.text(width / 2, height / 2 - 4, "", {
      fontSize: "22px",
      color: "#ffffff",
      align: "center",
      lineSpacing: 12,
    }).setOrigin(0.5);
    const footer = this.add.text(width / 2, height / 2 + 84, "Press Enter", {
      fontSize: "16px",
      color: "#cbd5e1",
    }).setOrigin(0.5);

    this.levelUpOverlay.add([shade, panel, title, body, footer]);
    this.levelUpText = body;
    this.keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  showPendingLevelUpNotifications() {
    ensureLevelState(playerData);

    if (!this.levelUpOverlay || this.levelUpNoticeActive) return;
    if (!playerData.pendingLevelUpMessages.length) return;

    const lines = playerData.pendingLevelUpMessages.shift();
    this.levelUpNoticeActive = true;
    this.levelUpText.setText(Array.isArray(lines) ? lines.join("\n") : String(lines || ""));
    this.levelUpOverlay.setVisible(true);
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

  onFieldItemUsed() {
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
    player.setVelocity(0);

    if (isLocked || this.dialogueActive) return;

    const moveLeft = this.keyA?.isDown || this.cursors.left.isDown;
    const moveRight = this.keyD?.isDown || this.cursors.right.isDown;
    const moveUp = this.keyW?.isDown || this.cursors.up.isDown;
    const moveDown = this.keyS?.isDown || this.cursors.down.isDown;

    if (moveLeft) {
      player.setVelocityX(-speed);
    } else if (moveRight) {
      player.setVelocityX(speed);
    }

    if (moveUp) {
      player.setVelocityY(-speed);
    } else if (moveDown) {
      player.setVelocityY(speed);
    }
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

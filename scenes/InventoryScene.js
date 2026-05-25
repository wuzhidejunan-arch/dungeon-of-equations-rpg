import { playerData } from "../data/playerData.js";
import { itemDefinitions } from "../data/battleData.js";
import {
  MAX_EQUIPPED_SKILLS,
  ensurePlayerSkillState,
  getPlayerSkillDefinitionsWithState,
  getUnlockedPlayerSkillDefinitions,
  isSkillEquipped,
  toggleEquippedSkill,
} from "../utils/playerSkills.js";
import { consumeItem, getInventoryEntries, isFieldUsableItem } from "../utils/inventory.js";
import { saveGame } from "../utils/saveSystem.js";
import { isTesterMode } from "../utils/debugState.js";
import { getDifficultySkillIds } from "../config/difficultySettings.js";
import { audioKeys } from "../config/audioKeys.js";
import { playSfx, preloadSfxAssets } from "../utils/sfxManager.js";
import { UI_GOLD_COIN_ICON_KEY } from "../utils/ui.js";

const MODES = {
  MAIN: "main",
  ITEM: "item",
  SKILL: "skill",
  ITEM_TARGET_SKILL: "item_target_skill",
};

const BOOK_PANEL_KEY = "uiBookPanelFrame";
const BOOK_PANEL_PATH = "assets/ui/ui_book_panel_frame.png";
const GOLD_COIN_ICON_PATH = "assets/images/ui/icons/gold_coin.png";
const BOOK_PANEL_LAYOUT = {
  x: 400,
  y: 300,
  width: 900,
  height: 610,
};
const BOOK_TEXT_COLORS = {
  primary: "#2f1f12",
  secondary: "#4b3522",
  accent: "#7a4d00",
};

export class InventoryScene extends Phaser.Scene {
  constructor() {
    super("InventoryScene");
  }

  preload() {
    this.load.image(BOOK_PANEL_KEY, BOOK_PANEL_PATH);
    if (!this.textures.exists(UI_GOLD_COIN_ICON_KEY)) {
      this.load.image(UI_GOLD_COIN_ICON_KEY, GOLD_COIN_ICON_PATH);
    }
    preloadSfxAssets(this);
  }

  init(data) {
    this.returnScene = data.returnScene || "WorldScene";
    this.context = data.context || null;
    this.mode = MODES.MAIN;
    this.mainIndex = 0;
    this.itemIndex = 0;
    this.skillIndex = 0;
    this.targetSkillIndex = 0;
    this.pendingItemName = null;
  }

  create() {
    ensurePlayerSkillState();

    const { width, height } = this.scale;
    const inventoryTitleY = 110;
    const inventoryHelperY = 145;
    const inventoryLeftX = 145;
    const inventoryLeftHeaderX = 245;
    const inventorySkillUsesX = 375;
    const inventoryCursorX = 120;
    const inventoryRightX = 470;
    const inventoryRightHeaderX = 575;
    const inventoryItemRightX = 445;
    const inventoryHeaderY = 195;
    const inventoryContentStartY = 245;
    const inventorySkillStartY = 240;
    const inventoryFooterY = 490;
    const inventoryMenuTextX = inventoryLeftX;
    const inventoryMenuCursorX = inventoryCursorX;
    const inventoryMenuStartY = inventoryContentStartY;
    const inventoryMenuRowSpacing = 65;
    const inventoryItemTextX = inventoryLeftX;
    const inventoryItemCursorX = inventoryCursorX;
    const inventoryItemStartY = inventoryContentStartY;
    const inventoryItemRowSpacing = 42;
    const inventoryVisibleItemRows = 4;
    const inventorySkillTextX = inventoryLeftX;
    const inventorySkillCursorX = inventoryCursorX;
    const inventorySkillRowSpacing = 48;
    const inventoryVisibleSkillRows = 4;
    this.inventoryCursorX = inventoryCursorX;
    this.inventoryRightTextX = inventoryRightX;
    this.inventoryItemRightTextX = inventoryItemRightX;
    this.inventoryFooterY = inventoryFooterY;
    this.inventoryItemDetailLineYs = [245, 285, 325, 365];
    this.inventorySkillDetailLineYs = [245, 285, 325, 355, 395];

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.28);
    this.panel = this.add
      .image(BOOK_PANEL_LAYOUT.x, BOOK_PANEL_LAYOUT.y, BOOK_PANEL_KEY)
      .setDisplaySize(BOOK_PANEL_LAYOUT.width, BOOK_PANEL_LAYOUT.height);

    this.titleText = this.add
      .text(width / 2, inventoryTitleY, "Bag", {
        fontSize: "40px",
        color: BOOK_TEXT_COLORS.primary,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.subText = this.add
      .text(width / 2, inventoryHelperY, "", {
        fontSize: "19px",
        color: BOOK_TEXT_COLORS.secondary,
      })
      .setOrigin(0.5);

    this.leftTitleText = this.add.text(inventoryLeftHeaderX, inventoryHeaderY, "", {
      fontSize: "22px",
      color: BOOK_TEXT_COLORS.primary,
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.rightTitleText = this.add.text(inventoryRightHeaderX, inventoryHeaderY, "", {
      fontSize: "22px",
      color: BOOK_TEXT_COLORS.primary,
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.leftText = this.add.text(inventoryLeftX, inventoryContentStartY, "", {
      fontSize: "22px",
      color: BOOK_TEXT_COLORS.primary,
      lineSpacing: 12,
      wordWrap: { width: 200 },
    });

    this.rightText = this.add.text(inventoryRightX, inventoryContentStartY, "", {
      fontSize: "18px",
      color: BOOK_TEXT_COLORS.secondary,
      lineSpacing: 10,
      wordWrap: { width: 215 },
    });
    const hasGoldIcon = this.textures.exists(UI_GOLD_COIN_ICON_KEY);
    this.inventoryGoldIcon = hasGoldIcon
      ? this.add
        .image(inventoryRightX, inventoryContentStartY + 61, UI_GOLD_COIN_ICON_KEY)
        .setOrigin(0, 0.5)
        .setDisplaySize(40, 30)
        .setVisible(false)
      : null;
    this.inventoryGoldText = this.add.text(hasGoldIcon ? inventoryRightX + 45 : inventoryRightX, inventoryContentStartY + 52, "", {
      fontSize: "18px",
      color: BOOK_TEXT_COLORS.secondary,
    }).setVisible(false);
    this.rightDetailLineTexts = this.inventorySkillDetailLineYs.map((lineY) => (
      this.add.text(inventoryRightX, lineY, "", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.secondary,
        wordWrap: { width: 230 },
      }).setVisible(false)
    ));

    this.footerText = this.add
      .text(width / 2, inventoryFooterY, "", {
        fontSize: "18px",
        color: BOOK_TEXT_COLORS.accent,
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5);

    this.inventoryMenuRowPositions = Array.from({ length: 3 }, (_, index) => ({
      textX: inventoryMenuTextX,
      cursorX: inventoryMenuCursorX,
      y: inventoryMenuStartY + (index * inventoryMenuRowSpacing),
    }));
    this.inventoryMenuOptionTexts = this.inventoryMenuRowPositions.map((row) => (
      this.add.text(row.textX, row.y, "", {
        fontSize: "22px",
        color: BOOK_TEXT_COLORS.primary,
      }).setVisible(false)
    ));

    this.inventoryItemRowPositions = Array.from({ length: inventoryVisibleItemRows }, (_, index) => ({
      textX: inventoryItemTextX,
      cursorX: inventoryItemCursorX,
      y: inventoryItemStartY + (index * inventoryItemRowSpacing),
    }));
    this.inventoryItemOptionTexts = this.inventoryItemRowPositions.map((row) => (
      this.add.text(row.textX, row.y, "", {
        fontSize: "22px",
        color: BOOK_TEXT_COLORS.primary,
      }).setVisible(false)
    ));

    this.inventorySkillRowPositions = Array.from({ length: inventoryVisibleSkillRows }, (_, index) => ({
      textX: inventorySkillTextX,
      usesX: inventorySkillUsesX,
      cursorX: inventorySkillCursorX,
      y: inventorySkillStartY + (index * inventorySkillRowSpacing),
    }));
    this.inventorySkillOptionTexts = this.inventorySkillRowPositions.map((row) => (
      this.add.text(row.textX, row.y, "", {
        fontSize: "20px",
        color: BOOK_TEXT_COLORS.primary,
        wordWrap: { width: 165 },
      }).setVisible(false)
    ));
    this.inventorySkillUseTexts = this.inventorySkillRowPositions.map((row) => (
      this.add.text(inventorySkillUsesX, row.y, "", {
        fontSize: "20px",
        color: BOOK_TEXT_COLORS.primary,
        align: "right",
      }).setOrigin(1, 0).setVisible(false)
    ));

    this.cursorText = this.add.text(inventoryCursorX, inventoryContentStartY, "▶", {
      fontSize: "22px",
      color: BOOK_TEXT_COLORS.accent,
      fontStyle: "bold",
    });

    this.debugBadge = this.add
      .text(width - 12, 10, "TEST MODE", {
        fontSize: "18px",
        color: "#facc15",
        fontStyle: "bold",
        backgroundColor: "#111827",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(1, 0)
      .setDepth(3000)
      .setVisible(isTesterMode());

    this.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyB = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.refreshUI();
  }

  update() {
    if (this.debugBadge) {
      this.debugBadge.setVisible(isTesterMode());
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyB) || Phaser.Input.Keyboard.JustDown(this.keyESC)) {
      playSfx(this, audioKeys.sfx.uiBack);
      if (this.mode === MODES.MAIN) {
        this.closeInventory();
      } else if (this.mode === MODES.ITEM_TARGET_SKILL) {
        this.mode = MODES.ITEM;
        this.pendingItemName = null;
        this.refreshUI();
      } else {
        this.mode = MODES.MAIN;
        this.refreshUI();
      }
      return;
    }

    if (this.mode === MODES.MAIN) {
      this.handleMainInput();
      return;
    }

    if (this.mode === MODES.ITEM) {
      this.handleItemInput();
      return;
    }

    if (this.mode === MODES.SKILL) {
      this.handleSkillInput();
      return;
    }

    if (this.mode === MODES.ITEM_TARGET_SKILL) {
      this.handleItemTargetSkillInput();
    }
  }

  getVisibleItems() {
    return getInventoryEntries({ includeDefinitions: false, includeAllInTesterMode: true });
  }

  getSkillTargetCandidates() {
    return getUnlockedPlayerSkillDefinitions().filter((skill) => skill.maxPp !== null);
  }

  getVisibleSkills() {
    return getPlayerSkillDefinitionsWithState(getDifficultySkillIds());
  }

  handleMainInput() {
    const max = 3;

    if (Phaser.Input.Keyboard.JustDown(this.keyUP)) {
      this.mainIndex = (this.mainIndex - 1 + max) % max;
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.mainIndex = (this.mainIndex + 1) % max;
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
      playSfx(this, audioKeys.sfx.uiConfirm);
      if (this.mainIndex === 0) {
        this.mode = MODES.ITEM;
      } else if (this.mainIndex === 1) {
        this.mode = MODES.SKILL;
      } else {
        this.closeInventory();
        return;
      }

      this.refreshUI();
    }
  }

  handleItemInput() {
    const items = this.getVisibleItems();
    if (!items.length) return;

    if (Phaser.Input.Keyboard.JustDown(this.keyUP)) {
      this.itemIndex = (this.itemIndex - 1 + items.length) % items.length;
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.itemIndex = (this.itemIndex + 1) % items.length;
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
      playSfx(this, audioKeys.sfx.uiConfirm);
      const selectedItem = items[this.itemIndex];
      if (!selectedItem) return;

      const itemDef = itemDefinitions[selectedItem.name] || null;
      if (itemDef?.chooseSkillTarget) {
        this.pendingItemName = selectedItem.name;
        this.targetSkillIndex = 0;
        this.mode = MODES.ITEM_TARGET_SKILL;
        this.refreshUI();
        return;
      }

      const result = this.useSelectedItem(selectedItem.name);
      this.footerText.setText(result.message || "Cannot use this item now.");

      if (this.itemIndex >= this.getVisibleItems().length) {
        this.itemIndex = Math.max(0, this.getVisibleItems().length - 1);
      }

      this.refreshUI(false);
    }
  }

  handleSkillInput() {
    const skills = this.getVisibleSkills();
    if (!skills.length) return;

    if (Phaser.Input.Keyboard.JustDown(this.keyUP)) {
      this.skillIndex = (this.skillIndex - 1 + skills.length) % skills.length;
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.skillIndex = (this.skillIndex + 1) % skills.length;
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
      playSfx(this, audioKeys.sfx.uiConfirm);
      const skill = skills[this.skillIndex];
      const result = toggleEquippedSkill(skill.id);
      this.footerText.setText(result.message);

      if (result.success) {
        saveGame();
      }

      this.refreshUI(false);
    }
  }

  handleItemTargetSkillInput() {
    const skills = this.getSkillTargetCandidates();
    if (!skills.length) {
      this.footerText.setText("No skill can use this item.");
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyUP)) {
      this.targetSkillIndex = (this.targetSkillIndex - 1 + skills.length) % skills.length;
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.targetSkillIndex = (this.targetSkillIndex + 1) % skills.length;
      playSfx(this, audioKeys.sfx.uiMove);
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
      playSfx(this, audioKeys.sfx.uiConfirm);
      const skill = skills[this.targetSkillIndex];
      if (!skill || !this.pendingItemName) return;

      const result = this.useSelectedItem(this.pendingItemName, { targetSkillId: skill.id });
      this.footerText.setText(result.message || "Cannot use this item now.");

      if (result.success) {
        this.pendingItemName = null;
        this.mode = MODES.ITEM;
      }

      this.refreshUI(false);
    }
  }

  useSelectedItem(itemName, options = {}) {
    if (this.context && typeof this.context.useItem === "function") {
      return this.context.useItem(itemName, options);
    }

    const result = consumeItem(itemName, options);
    if (result.success) {
      saveGame();
    }
    return result;
  }

  closeInventory() {
    if (this.context && typeof this.context.onClose === "function") {
      this.context.onClose();
    }

    this.scene.stop();
    this.scene.resume(this.returnScene);
  }

  refreshUI(resetFooter = true) {
    ensurePlayerSkillState();
    this.setInventoryMenuRowsVisible(false);
    this.setInventoryItemRowsVisible(false);
    this.setInventorySkillRowsVisible(false);
    this.clearRightDetailLines();
    this.rightText.setVisible(true);
    this.inventoryGoldIcon?.setVisible(false);
    this.inventoryGoldText?.setVisible(false);

    if (this.mode === MODES.MAIN) {
      this.renderMainMenu();
    } else if (this.mode === MODES.ITEM) {
      this.renderItems();
    } else if (this.mode === MODES.SKILL) {
      this.renderSkills();
    } else {
      this.renderItemTargetSkills();
    }

    if (resetFooter) {
      this.setFooterByMode();
    }
  }

  renderMainMenu() {
    const options = ["Items", "Skills", "Back"];
    this.leftTitleText.setText("Menu");
    this.rightTitleText.setText("Player");
    this.leftText.setText("");
    this.renderInventoryMenuRows(options);
    this.rightText.setText(
      this.inventoryGoldIcon
        ? `Lv: ${playerData.level}\nEXP: ${playerData.exp}/${playerData.expToNext}\n\nHP: ${playerData.hp} / ${playerData.maxHp}\n\nChosen: ${playerData.equippedSkillIds.length}/${MAX_EQUIPPED_SKILLS}`
        : `Lv: ${playerData.level}\nEXP: ${playerData.exp}/${playerData.expToNext}\nGold: ${playerData.gold}\nHP: ${playerData.hp} / ${playerData.maxHp}\n\nChosen: ${playerData.equippedSkillIds.length}/${MAX_EQUIPPED_SKILLS}`,
    );
    this.inventoryGoldIcon?.setVisible(true);
    this.inventoryGoldText
      ?.setText(this.inventoryGoldIcon ? `${playerData.gold}` : "")
      .setVisible(Boolean(this.inventoryGoldIcon));
    this.subText.setText("Choose one");
    this.positionInventoryMenuCursor(this.mainIndex);
  }

  renderItems() {
    const items = this.getVisibleItems();
    const selectedItem = items[this.itemIndex] || null;

    this.leftTitleText.setText("Item");
    this.rightTitleText.setText("Info");
    this.subText.setText("Potion and Skill Potion can be used here.");
    this.leftText.setText("");

    if (!items.length) {
      this.cursorText.setVisible(false);
      this.leftText.setText("No item.");
      this.rightText.setText("Your bag is empty.");
      return;
    }

    const { visibleItems, selectedVisibleIndex } = this.getInventoryVisibleItemWindow(items);
    this.renderInventoryItemRows(visibleItems);
    this.positionInventoryItemCursor(selectedVisibleIndex);

    if (!selectedItem) {
      this.rightText.setText("No item.");
      return;
    }

    const itemDef = itemDefinitions[selectedItem.name] || null;
    const desc = itemDef?.ui?.resultText || "";
    const usageText = isFieldUsableItem(selectedItem.name) ? "Use: Here / Battle" : "Use: Battle only";
    const targetText = itemDef?.chooseSkillTarget ? "Pick a skill" : "No pick needed";
    this.setRightDetailLines([
      selectedItem.name,
      ...this.wrapDetailText(desc, 22).slice(0, 1),
      usageText,
      targetText,
    ].filter(Boolean), this.inventoryItemDetailLineYs, this.inventoryItemRightTextX);
  }

  renderSkills() {
    const skills = this.getVisibleSkills();
    const selectedSkill = skills[this.skillIndex] || null;
    const equippedCount = skills.filter((skill) => isSkillEquipped(skill.id)).length;

    this.leftTitleText.setText(`Skills (${equippedCount}/${MAX_EQUIPPED_SKILLS})`);
    this.rightTitleText.setText("Detail");
    this.subText.setText("Choose 4 skills to bring");
    this.leftText.setText("");

    if (!selectedSkill) {
      this.setInventorySkillRowsVisible(false);
      this.rightText.setText("No skill.");
      this.cursorText.setVisible(false);
      this.leftText.setText("No skill.");
      return;
    }

    const { visibleSkills, selectedVisibleIndex } = this.getInventoryVisibleSkillWindow(skills);
    this.renderInventorySkillRows(visibleSkills);
    this.positionInventorySkillCursor(selectedVisibleIndex);

    this.setRightDetailLines([
      `Skill: ${this.getSkillTypeLabel(selectedSkill)}`,
      "What it does:",
      ...(this.wrapDetailText(selectedSkill.ui?.description || "", 20).slice(0, 2)),
      `Uses: ${selectedSkill.maxPp === null ? "No limit" : `${selectedSkill.pp}/${selectedSkill.maxPp}`}`,
    ].slice(0, 5), this.inventorySkillDetailLineYs);
  }

  renderItemTargetSkills() {
    const skills = this.getSkillTargetCandidates();
    const selectedSkill = skills[this.targetSkillIndex] || null;
    const itemName = this.pendingItemName || "Item";

    this.leftTitleText.setText(itemName);
    this.rightTitleText.setText("Pick Skill");
    this.subText.setText("Pick a skill to refill.");

    if (!skills.length) {
      this.cursorText.setVisible(false);
      this.leftText.setText("No skill.");
      this.rightText.setText("No skill can use this item now.");
      return;
    }

    this.cursorText.setVisible(true);
    this.leftText.setText(
      skills.map((skill) => `${skill.name} ${skill.pp}/${skill.maxPp}`).join("\n\n"),
    );
    this.positionCursor(this.targetSkillIndex, 40);

    if (!selectedSkill) {
      this.rightText.setText("No skill picked.");
      return;
    }

    const statusText = selectedSkill.pp >= selectedSkill.maxPp ? "Ready: Full" : "Ready: Can refill";
    this.rightText.setText(
      [
        selectedSkill.name,
        `Uses: ${selectedSkill.pp}/${selectedSkill.maxPp}`,
        statusText,
      ].join("\n"),
    );
  }

  setFooterByMode() {
    this.footerText.setPosition(400, this.inventoryFooterY || 490);
    this.footerText.setOrigin(0.5);

    if (this.mode === MODES.MAIN) {
      this.footerText.setText("Up / Down: Move   Enter: Choose   B: Close");
      return;
    }

    if (this.mode === MODES.ITEM) {
      this.footerText.setText("Up / Down: Move   Enter: Choose   B: Back");
      return;
    }

    if (this.mode === MODES.ITEM_TARGET_SKILL) {
      this.footerText.setText("Up / Down: Move   Enter: Choose   B: Back");
      return;
    }

    this.footerText.setText("Up / Down: Move   Enter: Choose   B: Back");
  }

  positionCursor(index, lineHeight) {
    this.cursorText.setVisible(true);
    this.cursorText.setPosition(
      this.inventoryCursorX || this.leftText.x - 30,
      this.leftText.y + index * lineHeight,
    );
  }

  clearRightDetailLines() {
    (this.rightDetailLineTexts || []).forEach((node) => {
      node?.setText("");
      node?.setVisible(false);
    });
  }

  setRightDetailLines(lines = [], lineYs = this.inventorySkillDetailLineYs, textX = this.inventoryRightTextX) {
    this.rightText.setText("");
    this.rightText.setVisible(false);
    (this.rightDetailLineTexts || []).forEach((node, index) => {
      const text = lines[index] || "";
      const y = lineYs?.[index] || node.y;
      node?.setPosition(textX || 500, y);
      node?.setText(text);
      node?.setVisible(Boolean(text));
    });
  }

  wrapDetailText(text, maxChars) {
    if (!text || text.length <= maxChars) return text ? [text] : [];

    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      if (nextLine.length > maxChars && currentLine) {
        lines.push(currentLine);
        currentLine = word;
        return;
      }
      currentLine = nextLine;
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  setInventoryMenuRowsVisible(visible) {
    (this.inventoryMenuOptionTexts || []).forEach((node) => node?.setVisible(visible));
  }

  renderInventoryMenuRows(options = []) {
    (this.inventoryMenuOptionTexts || []).forEach((node, index) => {
      const row = this.inventoryMenuRowPositions[index];
      const text = options[index] || "";

      if (!row || !text) {
        node?.setText("");
        node?.setVisible(false);
        return;
      }

      node?.setPosition(row.textX, row.y);
      node?.setText(text);
      node?.setVisible(true);
    });
  }

  positionInventoryMenuCursor(index) {
    const row = this.inventoryMenuRowPositions[index] || this.inventoryMenuRowPositions[0];
    if (!row) {
      this.cursorText.setVisible(false);
      return;
    }

    this.cursorText.setVisible(true);
    this.cursorText.setPosition(row.cursorX, row.y);
  }

  setInventoryItemRowsVisible(visible) {
    (this.inventoryItemOptionTexts || []).forEach((node) => node?.setVisible(visible));
  }

  getInventoryVisibleItemWindow(items = []) {
    const rowCount = this.inventoryItemRowPositions.length || 1;
    const maxStart = Math.max(0, items.length - rowCount);
    const selectedIndex = Phaser.Math.Clamp(this.itemIndex, 0, Math.max(items.length - 1, 0));
    const startIndex = Phaser.Math.Clamp(selectedIndex - (rowCount - 1), 0, maxStart);
    const visibleItems = items.slice(startIndex, startIndex + rowCount);
    const selectedVisibleIndex = selectedIndex - startIndex;

    return { startIndex, visibleItems, selectedVisibleIndex };
  }

  renderInventoryItemRows(items = []) {
    (this.inventoryItemOptionTexts || []).forEach((node, index) => {
      const row = this.inventoryItemRowPositions[index];
      const item = items[index] || null;

      if (!row || !item) {
        node?.setText("");
        node?.setVisible(false);
        return;
      }

      node?.setPosition(row.textX, row.y);
      node?.setText(`${item.name} x${item.qty}`);
      node?.setVisible(true);
    });
  }

  positionInventoryItemCursor(index) {
    const row = this.inventoryItemRowPositions[index] || this.inventoryItemRowPositions[0];
    if (!row) {
      this.cursorText.setVisible(false);
      return;
    }

    this.cursorText.setVisible(true);
    this.cursorText.setPosition(row.cursorX, row.y);
  }

  setInventorySkillRowsVisible(visible) {
    (this.inventorySkillOptionTexts || []).forEach((node) => node?.setVisible(visible));
    (this.inventorySkillUseTexts || []).forEach((node) => node?.setVisible(visible));
  }

  getInventoryVisibleSkillWindow(skills = []) {
    const rowCount = this.inventorySkillRowPositions.length || 1;
    const maxStart = Math.max(0, skills.length - rowCount);
    const selectedIndex = Phaser.Math.Clamp(this.skillIndex, 0, Math.max(skills.length - 1, 0));
    const startIndex = Phaser.Math.Clamp(selectedIndex - (rowCount - 1), 0, maxStart);
    const visibleSkills = skills.slice(startIndex, startIndex + rowCount);
    const selectedVisibleIndex = selectedIndex - startIndex;

    return { startIndex, visibleSkills, selectedVisibleIndex };
  }

  renderInventorySkillRows(skills = []) {
    (this.inventorySkillOptionTexts || []).forEach((node, index) => {
      const usesNode = this.inventorySkillUseTexts?.[index] || null;
      const row = this.inventorySkillRowPositions[index];
      const skill = skills[index] || null;

      if (!row || !skill) {
        node?.setText("");
        node?.setVisible(false);
        usesNode?.setText("");
        usesNode?.setVisible(false);
        return;
      }

      const usesText = skill.maxPp === null ? "No limit" : `${skill.pp}/${skill.maxPp}`;
      node?.setPosition(row.textX, row.y);
      node?.setText(skill.name);
      node?.setVisible(true);
      usesNode?.setPosition(row.usesX, row.y);
      usesNode?.setText(usesText);
      usesNode?.setVisible(true);
    });
  }

  getSkillTypeLabel(skill) {
    if (!skill) return "Attack";
    if (skill.id === "challengeDefend") return "Defend";
    if (skill.category === "guard") return "Block";
    if (skill.category === "buff") return "Power Up";
    if (skill.category === "debuff") return "Weaken";
    return "Attack";
  }

  positionInventorySkillCursor(index) {
    const row = this.inventorySkillRowPositions[index] || this.inventorySkillRowPositions[0];
    if (!row) {
      this.cursorText.setVisible(false);
      return;
    }

    this.cursorText.setVisible(true);
    this.cursorText.setPosition(row.cursorX, row.y);
  }
}



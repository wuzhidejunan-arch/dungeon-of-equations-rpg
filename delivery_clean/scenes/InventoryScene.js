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

const MODES = {
  MAIN: "main",
  ITEM: "item",
  SKILL: "skill",
  ITEM_TARGET_SKILL: "item_target_skill",
};

export class InventoryScene extends Phaser.Scene {
  constructor() {
    super("InventoryScene");
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
    const inventoryMenuTextX = width / 2 - 250;
    const inventoryMenuCursorX = inventoryMenuTextX - 28;
    const inventoryMenuStartY = height / 2 - 65;
    const inventoryMenuRowSpacing = 80;
    const inventoryItemTextX = width / 2 - 250;
    const inventoryItemCursorX = inventoryItemTextX - 28;
    const inventoryItemStartY = height / 2 - 65;
    const inventoryItemRowSpacing = 48;
    const inventoryVisibleItemRows = 4;
    const inventorySkillTextX = width / 2 - 250;
    const inventorySkillCursorX = inventorySkillTextX - 28;
    const inventorySkillStartY = height / 2 - 65;
    const inventorySkillRowSpacing = 56;
    const inventoryVisibleSkillRows = 4;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.58);
    this.panel = this.add
      .rectangle(width / 2, height / 2, 620, 440, 0x111827, 0.98)
      .setStrokeStyle(2, 0x64748b);

    this.titleText = this.add
      .text(width / 2, height / 2 - 180, "Bag", {
        fontSize: "30px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.subText = this.add
      .text(width / 2, height / 2 - 145, "", {
        fontSize: "18px",
        color: "#cbd5e1",
      })
      .setOrigin(0.5);

    this.leftTitleText = this.add.text(width / 2 - 250, height / 2 - 105, "", {
      fontSize: "22px",
      color: "#f8fafc",
      fontStyle: "bold",
    });

    this.rightTitleText = this.add.text(width / 2 + 50, height / 2 - 105, "", {
      fontSize: "22px",
      color: "#f8fafc",
      fontStyle: "bold",
    });

    this.leftText = this.add.text(width / 2 - 250, height / 2 - 65, "", {
      fontSize: "22px",
      color: "#ffffff",
      lineSpacing: 12,
      wordWrap: { width: 220 },
    });

    this.rightText = this.add.text(width / 2 + 50, height / 2 - 65, "", {
      fontSize: "18px",
      color: "#cbd5e1",
      lineSpacing: 10,
      wordWrap: { width: 200 },
    });

    this.footerText = this.add
      .text(width / 2, height / 2 + 175, "", {
        fontSize: "18px",
        color: "#facc15",
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
        color: "#ffffff",
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
        color: "#ffffff",
      }).setVisible(false)
    ));

    this.inventorySkillRowPositions = Array.from({ length: inventoryVisibleSkillRows }, (_, index) => ({
      textX: inventorySkillTextX,
      cursorX: inventorySkillCursorX,
      y: inventorySkillStartY + (index * inventorySkillRowSpacing),
    }));
    this.inventorySkillOptionTexts = this.inventorySkillRowPositions.map((row) => (
      this.add.text(row.textX, row.y, "", {
        fontSize: "18px",
        color: "#ffffff",
        wordWrap: { width: 220 },
      }).setVisible(false)
    ));

    this.cursorText = this.add.text(width / 2 - 280, height / 2 - 65, ">", {
      fontSize: "22px",
      color: "#f8fafc",
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
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.mainIndex = (this.mainIndex + 1) % max;
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
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
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.itemIndex = (this.itemIndex + 1) % items.length;
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
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
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.skillIndex = (this.skillIndex + 1) % skills.length;
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
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
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.targetSkillIndex = (this.targetSkillIndex + 1) % skills.length;
      this.refreshUI();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
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
    const options = ["Item", "Skill", "Back"];
    this.leftTitleText.setText("Menu");
    this.rightTitleText.setText("Player");
    this.leftText.setText("");
    this.renderInventoryMenuRows(options);
    this.rightText.setText(
      `Lv: ${playerData.level}\nEXP: ${playerData.exp}/${playerData.expToNext}\nGold: ${playerData.gold}\nHP: ${playerData.hp} / ${playerData.maxHp}\n\nEquipped: ${playerData.equippedSkillIds.length}/${MAX_EQUIPPED_SKILLS}`,
    );
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
    const usageText = isFieldUsableItem(selectedItem.name) ? "Use: Field / Battle" : "Use: Battle only";
    const targetText = itemDef?.chooseSkillTarget ? "Pick a skill" : "No target needed";
    this.rightText.setText([selectedItem.name, desc, usageText, targetText].filter(Boolean).join("\n"));
  }

  renderSkills() {
    const skills = this.getVisibleSkills();
    const selectedSkill = skills[this.skillIndex] || null;
    const equippedCount = skills.filter((skill) => isSkillEquipped(skill.id)).length;

    this.leftTitleText.setText(`Skill (${equippedCount}/${MAX_EQUIPPED_SKILLS})`);
    this.rightTitleText.setText("Detail");
    this.subText.setText("Choose 4 moves to bring");
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

      this.rightText.setText(
        [
          `Type: ${this.getSkillTypeLabel(selectedSkill)}`,
          `What it does: ${selectedSkill.ui?.description || ""}`,
          `Uses: ${selectedSkill.maxPp === null ? "INF" : `${selectedSkill.pp}/${selectedSkill.maxPp}`}`,
          isSkillEquipped(selectedSkill.id) ? "Status: Equipped" : "Status: Not equipped",
        ].join("\n"),
      );
  }

  renderItemTargetSkills() {
    const skills = this.getSkillTargetCandidates();
    const selectedSkill = skills[this.targetSkillIndex] || null;
    const itemName = this.pendingItemName || "Item";

    this.leftTitleText.setText(itemName);
    this.rightTitleText.setText("Target");
    this.subText.setText("Choose a skill to restore.");

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
      this.rightText.setText("No target.");
      return;
    }

    const statusText = selectedSkill.pp >= selectedSkill.maxPp ? "Status: Full" : "Status: Can restore";
    this.rightText.setText(
      [
        selectedSkill.name,
        `Uses: ${selectedSkill.pp}/${selectedSkill.maxPp}`,
        statusText,
      ].join("\n"),
    );
  }

  setFooterByMode() {
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
    this.cursorText.setPosition(this.leftText.x - 28, this.leftText.y + index * lineHeight);
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
      const row = this.inventorySkillRowPositions[index];
      const skill = skills[index] || null;

      if (!row || !skill) {
        node?.setText("");
        node?.setVisible(false);
        return;
      }

      const usesText = skill.maxPp === null ? "INF" : `${skill.pp}/${skill.maxPp}`;
      const equippedMarker = isSkillEquipped(skill.id) ? "[E]" : "[ ]";
      node?.setPosition(row.textX, row.y);
      node?.setText(`${equippedMarker} ${skill.name} ${usesText}`);
      node?.setVisible(true);
    });
  }

  getSkillTypeLabel(skill) {
    if (!skill) return "Attack";
    if (skill.id === "challengeDefend") return "Defend";
    if (skill.category === "guard") return "Guard";
    if (skill.category === "buff") return "Buff";
    if (skill.category === "debuff") return "Debuff";
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



export const UI_HINT_WOOD_PLATE_KEY = "uiHintWoodPlate";
export const UI_STATUS_WOOD_PANEL_KEY = "uiStatusWoodPanel";
export const UI_GOLD_COIN_ICON_KEY = "goldCoinIcon";

const UI_HINT_WOOD_PLATE_PATH = "assets/ui/ui_hint_wood_plate.png";
const UI_STATUS_WOOD_PANEL_PATH = "assets/ui/ui_status_wood_panel.png";
const UI_GOLD_COIN_ICON_PATH = "assets/images/ui/icons/gold_coin.png";
const HINT_PLATE_WIDTH = 305;
const HINT_PLATE_HEIGHT = 58;
const HINT_PLATE_CENTER_X = 168.5;
const HINT_PLATE_CENTER_Y = 38;

export function preloadHudUiAssets(scene) {
  if (!scene.textures.exists(UI_HINT_WOOD_PLATE_KEY)) {
    scene.load.image(UI_HINT_WOOD_PLATE_KEY, UI_HINT_WOOD_PLATE_PATH);
  }
  if (!scene.textures.exists(UI_STATUS_WOOD_PANEL_KEY)) {
    scene.load.image(UI_STATUS_WOOD_PANEL_KEY, UI_STATUS_WOOD_PANEL_PATH);
  }
  if (!scene.textures.exists(UI_GOLD_COIN_ICON_KEY)) {
    scene.load.image(UI_GOLD_COIN_ICON_KEY, UI_GOLD_COIN_ICON_PATH);
  }
}

export function createPrompt(scene) {
  const hasHintPlate = scene.textures.exists(UI_HINT_WOOD_PLATE_KEY);
  const promptPlate = hasHintPlate
    ? scene.add
        .image(HINT_PLATE_CENTER_X, HINT_PLATE_CENTER_Y, UI_HINT_WOOD_PLATE_KEY)
        .setDisplaySize(HINT_PLATE_WIDTH, HINT_PLATE_HEIGHT)
        .setAlpha(0.88)
        .setScrollFactor(0)
        .setDepth(99)
        .setVisible(false)
    : null;

  const promptText = scene.add
    .text(HINT_PLATE_CENTER_X, HINT_PLATE_CENTER_Y, "", {
      fontSize: "18px",
      color: hasHintPlate ? "#f4e6c1" : "#ffffff",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: HINT_PLATE_WIDTH - 42 },
      ...(hasHintPlate
        ? {}
        : { backgroundColor: "#0f172a", padding: { x: 12, y: 6 } }),
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100)
    .setVisible(false);

  promptText.promptPlate = promptPlate;
  return promptText;
}

export function showPrompt(promptText, message) {
  promptText.setText(message);
  promptText.setVisible(true);
  promptText.promptPlate?.setVisible(true);
}

export function hidePrompt(promptText) {
  promptText.setVisible(false);
  promptText.promptPlate?.setVisible(false);
}

export function createPanel(scene, x, y, width, height, text = "") {
  const panel = scene.add
    .rectangle(x, y, width, height, 0x111827, 0.96)
    .setStrokeStyle(2, 0x64748b)
    .setScrollFactor(0)
    .setDepth(200)
    .setVisible(false);

  const panelText = scene.add
    .text(x - width / 2 + 20, y - height / 2 + 20, text, {
      fontSize: "20px",
      color: "#f8fafc",
      lineSpacing: 8,
      wordWrap: { width: width - 40 },
    })
    .setScrollFactor(0)
    .setDepth(201)
    .setVisible(false);

  return { panel, panelText };
}

export function showPanel(panelObj, message) {
  panelObj.panelText.setText(message);
  panelObj.panel.setVisible(true);
  panelObj.panelText.setVisible(true);
}

export function hidePanel(panelObj) {
  panelObj.panel.setVisible(false);
  panelObj.panelText.setVisible(false);
}

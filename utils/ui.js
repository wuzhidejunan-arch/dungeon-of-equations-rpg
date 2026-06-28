export const UI_HINT_WOOD_PLATE_KEY = "uiHintWoodPlate";
export const UI_STATUS_WOOD_PANEL_KEY = "uiStatusWoodPanel";
export const UI_GOLD_COIN_ICON_KEY = "goldCoinIcon";
export const UI_DIALOGUE_PANEL_KEY = "dialoguePanel";

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
// Beginner-guide-only manual tuning values. These do not affect shared createPanel().
export const BEGINNER_GUIDE_PANEL_LAYOUT = Object.freeze({
  // Frame: higher x moves right, higher y moves down.
  worldX: 392,
  worldY: 300,
  trainingXOffset: -8,
  trainingYOffset: -10,
  width: 760, // higher width = wider frame.
  height: 380, // higher height = taller frame.
  worldHeight: 400, // keeps the current World guide frame taller than Training.
  panelAlpha: 0.96, // lower alpha = more transparent frame.

  // Main tutorial text: offsets are from the frame center.
  mainTextOffsetX: 4, // higher x moves text right.
  mainTextOffsetY: -30, // higher y moves text down.
  worldMainTextOffsetY: -30, // keeps current World main text placement.
  mainTextFontSize: "28px", // higher font size = larger text.
  mainTextWrapInsetX: 92, // higher inset = narrower text wrapping.
  mainTextColor: "#f8e7c0",
  mainTextStrokeColor: "#2b1608",
  mainTextStrokeThickness: 2,
  mainTextAlign: "center",
  mainTextLineSpacing: 10,
  mainTextOriginX: 0.5,
  mainTextOriginY: 0,

  // Prompt text: offsets are from the frame center.
  promptTextOffsetX: 0, // higher x moves prompt right.
  promptTextOffsetY: 40, // higher y moves prompt down.
  worldPromptTextOffsetY: 58, // keeps current World prompt placement.
  promptTextFontSize: "18px", // higher font size = larger prompt.
  promptTextWrapInsetX: 56, // higher inset = narrower prompt wrapping.
  promptTextColor: "#d8c79f",
  promptTextStrokeColor: "#2b1608",
  promptTextStrokeThickness: 2,
  promptTextAlign: "center",
  promptTextAlpha: 0.82, // lower alpha = less visible prompt.
  promptTextOrigin: 0.5,

  fallbackFillColor: 0x0f172a,
  fallbackFillAlpha: 0.9,
  fallbackBorderThickness: 3,
  fallbackBorderColor: 0xb9823b,
  fallbackBorderAlpha: 0.9,
  panelDepth: 200,
  textDepth: 201,
});

// Beginner-guide-only panel. Tune BEGINNER_GUIDE_PANEL_LAYOUT without affecting shared createPanel() users.
export function createBeginnerGuidePanel(scene, x, y, width, height, text = "", overrides = {}) {
  const layout = { ...BEGINNER_GUIDE_PANEL_LAYOUT, ...overrides };
  const hasDialoguePanel = scene.textures.exists(UI_DIALOGUE_PANEL_KEY);
  const wrapWidth = width - (layout.mainTextWrapInsetX * 2);
  const promptWrapWidth = width - (layout.promptTextWrapInsetX * 2);

  const panel = hasDialoguePanel
    ? scene.add
        .image(x, y, UI_DIALOGUE_PANEL_KEY)
        .setDisplaySize(width, height)
        .setAlpha(layout.panelAlpha)
    : scene.add
        .rectangle(x, y, width, height, layout.fallbackFillColor, layout.fallbackFillAlpha)
        .setStrokeStyle(layout.fallbackBorderThickness, layout.fallbackBorderColor, layout.fallbackBorderAlpha);

  panel.setScrollFactor(0).setDepth(layout.panelDepth).setVisible(false);

  const panelText = scene.add
    .text(x + layout.mainTextOffsetX, y + layout.mainTextOffsetY, text, {
      fontSize: layout.mainTextFontSize,
      color: layout.mainTextColor,
      stroke: layout.mainTextStrokeColor,
      strokeThickness: layout.mainTextStrokeThickness,
      align: layout.mainTextAlign,
      lineSpacing: layout.mainTextLineSpacing,
      wordWrap: { width: wrapWidth },
    })
    .setOrigin(layout.mainTextOriginX, layout.mainTextOriginY)
    .setScrollFactor(0)
    .setDepth(layout.textDepth)
    .setVisible(false);

  const promptText = scene.add
    .text(x + layout.promptTextOffsetX, y + layout.promptTextOffsetY, "", {
      fontSize: layout.promptTextFontSize,
      color: layout.promptTextColor,
      stroke: layout.promptTextStrokeColor,
      strokeThickness: layout.promptTextStrokeThickness,
      align: layout.promptTextAlign,
      wordWrap: { width: promptWrapWidth },
    })
    .setOrigin(layout.promptTextOrigin)
    .setAlpha(layout.promptTextAlpha)
    .setScrollFactor(0)
    .setDepth(layout.textDepth)
    .setVisible(false);

  return { panel, panelText, promptText };
}
export function showPanel(panelObj, message) {
  const parts = String(message || "").split(/\n\s*\n/);
  const prompt = parts.length > 1 ? parts.pop() : "";
  const body = parts.join("\n\n") || String(message || "");

  panelObj.panelText.setText(body);
  panelObj.promptText?.setText(prompt);
  panelObj.panel.setVisible(true);
  panelObj.panelText.setVisible(true);
  panelObj.promptText?.setVisible(Boolean(prompt));
}

export function hidePanel(panelObj) {
  panelObj.panel.setVisible(false);
  panelObj.panelText.setVisible(false);
  panelObj.promptText?.setVisible(false);
}

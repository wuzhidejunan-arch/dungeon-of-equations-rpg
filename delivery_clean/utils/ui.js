export function createPrompt(scene) {
  return scene.add
    .text(20, 18, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#0f172a",
      padding: { x: 12, y: 6 },
    })
    .setScrollFactor(0)
    .setDepth(100)
    .setVisible(false);
}

export function showPrompt(promptText, message) {
  promptText.setText(message);
  promptText.setVisible(true);
}

export function hidePrompt(promptText) {
  promptText.setVisible(false);
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

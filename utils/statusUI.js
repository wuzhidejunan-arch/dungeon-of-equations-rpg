import { UI_STATUS_WOOD_PANEL_KEY } from "./ui.js";

const STATUS_PANEL_WIDTH = 305;
const STATUS_PANEL_HEIGHT = 122;
const STATUS_TEXT_X = 40;

export function createStatusUI(scene) {
  const container = scene.add.container(16, 58).setScrollFactor(0).setDepth(150);

  const hasStatusPanel = scene.textures.exists(UI_STATUS_WOOD_PANEL_KEY);
  const background = hasStatusPanel
    ? scene.add
        .image(0, 0, UI_STATUS_WOOD_PANEL_KEY)
        .setOrigin(0, 0)
        .setDisplaySize(STATUS_PANEL_WIDTH, STATUS_PANEL_HEIGHT)
        .setAlpha(0.88)
    : scene.add
        .rectangle(0, 0, 200, 100, 0x111827, 0.9)
        .setStrokeStyle(2, 0x475569)
        .setOrigin(0, 0);

  const hpText = scene.add.text(STATUS_TEXT_X, 21, "", {
    fontSize: "18px",
    color: "#d98f8a",
    fontStyle: "bold",
  });

  const lvText = scene.add.text(STATUS_TEXT_X, 53, "", {
    fontSize: "18px",
    color: "#d6b85c",
    fontStyle: "bold",
  });

  const goldText = scene.add.text(145, 53, "", {
    fontSize: "18px",
    color: "#d6b85c",
    fontStyle: "bold",
  });

  const expText = scene.add.text(STATUS_TEXT_X, 85, "", {
    fontSize: "18px",
    color: "#d6b85c",
    fontStyle: "bold",
  });

  container.add([background, hpText, lvText, goldText, expText]);

  return {
    container,
    hpText,
    lvText,
    goldText,
    expText,
  };
}

export function refreshStatusUI(statusUI, playerData) {
  statusUI.hpText.setText(`HP: ${playerData.hp}/${playerData.maxHp}`);
  statusUI.lvText.setText(`Lv ${playerData.level}`);
  statusUI.goldText.setText(`Gold: ${playerData.gold}`);
  statusUI.expText.setText(`EXP: ${playerData.exp}/${playerData.expToNext}`);
}

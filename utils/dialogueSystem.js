export function createDialogueUI(scene) {
  const { width, height } = scene.scale;
  const panelWidth = 860;
  const panelHeight = 360;
  const panelX = width / 2 - 5;
  const panelY = height - 105;
  const textLeft = panelX - panelWidth / 2 + 88;

  const container = scene.add
    .container(0, 0)
    .setScrollFactor(0)
    .setDepth(300)
    .setVisible(false);

  const background = scene.textures.exists("dialoguePanel")
    ? scene.add.image(panelX, panelY, "dialoguePanel").setDisplaySize(panelWidth, panelHeight)
    : scene.add
        .rectangle(panelX, panelY, panelWidth, panelHeight, 0x000000, 0.9)
        .setStrokeStyle(2, 0xffffff);

  const nameText = scene.add.text(textLeft, panelY - 45, "", {
    fontSize: "25px",
    color: "#ffd43b",
    fontStyle: "bold",
    stroke: "#2b1608",
    strokeThickness: 3,
  });

  const contentText = scene.add.text(textLeft, panelY - 2, "", {
    fontSize: "23px",
    color: "#f8e7c0",
    stroke: "#2b1608",
    strokeThickness: 2,
    wordWrap: { width: panelWidth - 120 },
  });

  const tipText = scene.add.text(panelX + panelWidth / 2 -320, panelY + panelHeight / 2 - 140, "Enter / Space: Next", {
    fontSize: "20px",
    color: "#f0d8a8",
    stroke: "#2b1608",
    strokeThickness: 2,
  });

  container.add([background, nameText, contentText, tipText]);

  return {
    container,
    nameText,
    contentText,
    tipText,
  };
}

export function startDialogue(scene, dialogueUI, dialogueData) {
  scene.dialogueActive = true;
  scene.dialogueIndex = 0;
  scene.dialogueData = dialogueData;

  dialogueUI.container.setVisible(true);
  showDialogueLine(scene, dialogueUI);
}

export function showDialogueLine(scene, dialogueUI) {
  const currentLine = scene.dialogueData[scene.dialogueIndex];

  if (!currentLine) {
    endDialogue(scene, dialogueUI);
    return;
  }

  dialogueUI.nameText.setText(currentLine.speaker || "");
  dialogueUI.contentText.setText(currentLine.text || "");
}

export function nextDialogueLine(scene, dialogueUI) {
  if (!scene.dialogueActive) return;

  scene.dialogueIndex += 1;

  if (scene.dialogueIndex >= scene.dialogueData.length) {
    endDialogue(scene, dialogueUI);
    return;
  }

  showDialogueLine(scene, dialogueUI);
}

export function endDialogue(scene, dialogueUI) {
  scene.dialogueActive = false;
  scene.dialogueIndex = 0;
  scene.dialogueData = [];
  dialogueUI.container.setVisible(false);
}

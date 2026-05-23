export function createDialogueUI(scene) {
  const { width, height } = scene.scale;

  const container = scene.add
    .container(0, 0)
    .setScrollFactor(0)
    .setDepth(300)
    .setVisible(false);

  const background = scene.add
    .rectangle(width / 2, height - 110, width - 40, 140, 0x000000, 0.9)
    .setStrokeStyle(2, 0xffffff);

  const nameText = scene.add.text(35, height - 165, "", {
    fontSize: "20px",
    color: "#ffd700",
    fontStyle: "bold",
  });

  const contentText = scene.add.text(35, height - 130, "", {
    fontSize: "22px",
    color: "#ffffff",
    wordWrap: { width: width - 80 },
  });

  const tipText = scene.add.text(width - 240, height - 35, "Enter / Space: Next", {
    fontSize: "16px",
    color: "#cccccc",
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

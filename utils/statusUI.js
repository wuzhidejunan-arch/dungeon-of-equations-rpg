export function createStatusUI(scene) {
  const container = scene.add.container(16, 54).setScrollFactor(0).setDepth(150);

  const background = scene.add
    .rectangle(0, 0, 200, 100, 0x111827, 0.9)
    .setStrokeStyle(2, 0x475569)
    .setOrigin(0, 0);

  const hpText = scene.add.text(12, 10, "", {
    fontSize: "18px",
    color: "#fca5a5",
  });

  const goldText = scene.add.text(12, 40, "", {
    fontSize: "18px",
    color: "#fcd34d",
  });

  const expText = scene.add.text(12, 70, "", {
    fontSize: "18px",
    color: "#fcd34d",
  });

  container.add([background, hpText, goldText, expText]);

  return {
    container,
    hpText,
    goldText,
    expText,
  };
}

export function refreshStatusUI(statusUI, playerData) {
  statusUI.hpText.setText(`HP: ${playerData.hp}/${playerData.maxHp}`);
  statusUI.goldText.setText(`Lv ${playerData.level}   Gold: ${playerData.gold}`);
  statusUI.expText.setText(`EXP: ${playerData.exp}/${playerData.expToNext}`);
}

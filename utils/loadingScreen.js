export function createLoadingScreen(scene, options = {}) {
  const {
    title = "Loading...",
    subtitle = "Preparing assets",
    tip = "Tip: Build the right answer to win the battle.",
    minimumVisibleMs = 500,
  } = options;
  const createdAt = scene.time?.now || 0;
  const scaleWidth = scene.scale?.width || scene.scale?.gameSize?.width;
  const scaleHeight = scene.scale?.height || scene.scale?.gameSize?.height;
  const width = Number.isFinite(scaleWidth) && scaleWidth > 0 ? scaleWidth : 800;
  const height = Number.isFinite(scaleHeight) && scaleHeight > 0 ? scaleHeight : 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const panelWidth = 520;
  const panelHeight = 230;
  const barWidth = 360;
  const barHeight = 18;

  const loadingDepth = 99999;
  const container = scene.add
    .container(0, 0)
    .setDepth(loadingDepth)
    .setAlpha(1)
    .setScrollFactor(0)
    .setVisible(true);
  const background = scene.add.rectangle(centerX, centerY, width, height, 0x07111f, 1);
  const panelShadow = scene.add.rectangle(centerX + 6, centerY + 8, panelWidth, panelHeight, 0x000000, 0.42);
  const panel = scene.add
    .rectangle(centerX, centerY, panelWidth, panelHeight, 0x101826, 0.96)
    .setStrokeStyle(4, 0xd6a84f, 0.95);
  const innerPanel = scene.add
    .rectangle(centerX, centerY, panelWidth - 24, panelHeight - 24, 0x172033, 0.72)
    .setStrokeStyle(1, 0x7a5520, 0.8);
  const titleText = scene.add
    .text(centerX, centerY - 78, title, {
      fontSize: "30px",
      color: "#ffd66b",
      fontStyle: "bold",
      fontFamily: "monospace",
      stroke: "#2a1607",
      strokeThickness: 4,
    })
    .setOrigin(0.5);
  const subtitleText = scene.add
    .text(centerX, centerY - 34, subtitle, {
      fontSize: "17px",
      color: "#f8e7c0",
      fontFamily: "monospace",
    })
    .setOrigin(0.5);
  const barBg = scene.add
    .rectangle(centerX - barWidth / 2, centerY + 14, barWidth, barHeight, 0x0b1020, 1)
    .setOrigin(0, 0.5)
    .setStrokeStyle(2, 0x9b6b26, 1);
  const barFill = scene.add
    .rectangle(centerX - barWidth / 2, centerY + 14, 0, barHeight - 4, 0x22c55e, 1)
    .setOrigin(0, 0.5);
  const percentText = scene.add
    .text(centerX, centerY + 48, "0%", {
      fontSize: "18px",
      color: "#fff4c7",
      fontStyle: "bold",
      fontFamily: "monospace",
    })
    .setOrigin(0.5);
  const tipText = scene.add
    .text(centerX, centerY + 88, tip, {
      fontSize: "15px",
      color: "#d9c89f",
      align: "center",
      fontFamily: "monospace",
      wordWrap: { width: panelWidth - 70 },
    })
    .setOrigin(0.5);

  container.add([
    background,
    panelShadow,
    panel,
    innerPanel,
    titleText,
    subtitleText,
    barBg,
    barFill,
    percentText,
    tipText,
  ]);
  container.list?.forEach((child) => child.setDepth?.(loadingDepth));
  scene.children?.bringToTop?.(container);

  const updateProgress = (value = 0) => {
    const progress = Phaser.Math.Clamp(Number(value) || 0, 0, 1);
    barFill.width = barWidth * progress;
    percentText.setText(`${Math.round(progress * 100)}%`);
  };
  let cleanedUp = false;
  let loadingComplete = false;
  let destroyTimer = null;
  const keepOnTop = () => {
    if (!cleanedUp && container?.active) {
      scene.children?.bringToTop?.(container);
    }
  };

  const destroyContainer = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    scene.load.off("progress", updateProgress);
    scene.events.off("create", finishLoading);
    scene.events.off("postupdate", keepOnTop);
    scene.events.off("shutdown", destroyContainer);
    destroyTimer?.remove?.(false);
    destroyTimer = null;

    if (container?.active) {
      container.destroy(true);
    }
  };

  const fadeThenDestroy = () => {
    if (cleanedUp) return;

    if (scene.tweens && container?.active) {
      scene.tweens.add({
        targets: container,
        alpha: 0,
        duration: 140,
        ease: "Quad.easeOut",
        onComplete: destroyContainer,
      });
      return;
    }

    destroyContainer();
  };

  function finishLoading() {
    if (cleanedUp || loadingComplete) return;
    loadingComplete = true;
    updateProgress(1);

    const elapsedMs = Math.max(0, (scene.time?.now || 0) - createdAt);
    const remainingMs = Math.max(0, minimumVisibleMs - elapsedMs);

    if (remainingMs > 0 && scene.time?.delayedCall) {
      destroyTimer = scene.time.delayedCall(remainingMs, fadeThenDestroy);
      return;
    }

    fadeThenDestroy();
  };

  scene.load.on("progress", updateProgress);
  scene.load.once("complete", finishLoading);
  scene.events.once("create", finishLoading);
  scene.events.on("postupdate", keepOnTop);
  scene.events.once("shutdown", destroyContainer);

  return container;
}

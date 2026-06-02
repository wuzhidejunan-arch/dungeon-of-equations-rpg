import { preloadBattleAssets } from '../utils/battleAssetPreloader.js';

const MINIMUM_VISIBLE_MS = 500;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export class BattleLoadingScene extends Phaser.Scene {
  constructor() {
    super('BattleLoadingScene');
    this.battleData = {};
    this.loadingStartedAt = 0;
    this.loadingUi = null;
    this.progressFill = null;
    this.percentText = null;
    this.progressBarWidth = 520;
    this.loadingDotTweens = [];
    this.loaderStarted = false;
    this.loaderComplete = false;
  }

  init(data) {
    this.battleData = data || {};
    this.loadingStartedAt = 0;
    this.loadingUi = null;
    this.progressFill = null;
    this.percentText = null;
    this.loadingDotTweens = [];
    this.loaderStarted = false;
    this.loaderComplete = false;
  }

  create() {
    const queuedFiles = preloadBattleAssets(this);

    if (queuedFiles <= 0) {
      this.scene.start('BattleScene', this.battleData);
      return;
    }

    this.loadingStartedAt = this.time.now;
    this.createLoadingUi();
    this.startBattleAssetLoading();
  }

  createLoadingUi() {
    const width = Number(this.scale.width) || CANVAS_WIDTH;
    const height = Number(this.scale.height) || CANVAS_HEIGHT;
    const centerX = width / 2;
    const centerY = height / 2;
    const barWidth = this.progressBarWidth;
    const barHeight = 18;

    this.loadingUi = this.add.container(0, 0).setDepth(99999);
    this.loadingUi.add(this.add.rectangle(centerX, centerY, width, height, 0x07111f, 1));
    this.loadingUi.add(this.add.rectangle(centerX, centerY + 2, 640, 260, 0x020617, 0.34));
    this.loadingUi.add(this.add.rectangle(centerX, centerY + 2, 560, 210, 0x111827, 0.18));

    this.loadingUi.add(
      this.add
        .text(centerX - 28, centerY - 98, 'Loading Battle', {
          fontSize: '42px',
          color: '#ffd66b',
          fontStyle: 'bold',
          fontFamily: 'monospace',
          stroke: '#2a1607',
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(100000),
    );
    this.createLoadingDots(centerX + 180, centerY - 98);

    this.loadingUi.add(
      this.add
        .text(centerX, centerY - 35, 'Preparing monsters and battle UI', {
          fontSize: '20px',
          color: '#f8e7c0',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setDepth(100000),
    );

    this.loadingUi.add(
      this.add
        .rectangle(centerX - barWidth / 2, centerY + 24, barWidth, barHeight, 0x050915, 1)
        .setOrigin(0, 0.5)
        .setStrokeStyle(1, 0x7a5520, 0.85),
    );
    this.progressFill = this.add
      .rectangle(centerX - barWidth / 2 + 2, centerY + 24, 0, barHeight - 4, 0xf0b43c, 1)
      .setOrigin(0, 0.5)
      .setDepth(100000);
    this.loadingUi.add(this.progressFill);

    this.percentText = this.add
      .text(centerX, centerY + 58, '0%', {
        fontSize: '20px',
        color: '#fff4c7',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(100000);
    this.loadingUi.add(this.percentText);

    this.loadingUi.add(
      this.add
        .text(centerX, centerY + 106, 'Tip: Use the correct math rule to deal better damage.', {
          fontSize: '17px',
          color: '#c7b78f',
          align: 'center',
          fontFamily: 'monospace',
          wordWrap: { width: 600 },
        })
        .setOrigin(0.5)
        .setDepth(100000),
    );
  }

  createLoadingDots(startX, y) {
    const dotSpacing = 16;
    const dotTargets = [0, 1, 2].map((index) => {
      const dot = this.add.circle(startX + index * dotSpacing, y + 10, 5, 0xffd66b, 1).setDepth(100000);
      this.loadingUi.add(dot);
      return dot;
    });

    const jumpDot = (index = 0) => {
      const dot = dotTargets[index];
      if (!dot?.scene) return;

      this.tweens.add({
        targets: dot,
        y,
        duration: 180,
        ease: 'Sine.easeOut',
        yoyo: true,
        onComplete: () => {
          this.time.delayedCall(70, () => jumpDot((index + 1) % dotTargets.length));
        },
      });
    };

    jumpDot();
  }

  startBattleAssetLoading() {
    if (this.loaderStarted) return;

    this.loaderStarted = true;
    this.load.on('progress', this.updateLoadingProgress, this);
    this.load.once('complete', this.completeBattleAssetLoading, this);
    this.load.start();
  }

  completeBattleAssetLoading() {
    if (this.loaderComplete) return;

    this.loaderComplete = true;
    this.load.off('progress', this.updateLoadingProgress, this);
    this.load.off('complete', this.completeBattleAssetLoading, this);
    this.updateLoadingProgress(1);

    const elapsedMs = Math.max(0, this.time.now - this.loadingStartedAt);
    const remainingMs = Math.max(0, MINIMUM_VISIBLE_MS - elapsedMs);
    this.time.delayedCall(remainingMs, () => {
      this.scene.start('BattleScene', this.battleData);
    });
  }

  updateLoadingProgress(value = 0) {
    const progress = Phaser.Math.Clamp(Number(value) || 0, 0, 1);
    if (this.progressFill) {
      this.progressFill.width = Math.max(0, (this.progressBarWidth - 4) * progress);
    }
    this.percentText?.setText(`${Math.round(progress * 100)}%`);
  }
}

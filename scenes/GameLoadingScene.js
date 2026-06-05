import { preloadFullGameAssets } from '../utils/fullGameAssetPreloader.js';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export class GameLoadingScene extends Phaser.Scene {
  constructor() {
    super('GameLoadingScene');
    this.loadingUi = null;
    this.progressFill = null;
    this.percentText = null;
    this.progressBarWidth = 520;
    this.loaderStarted = false;
    this.loaderComplete = false;
  }

  init() {
    this.loadingUi = null;
    this.progressFill = null;
    this.percentText = null;
    this.loaderStarted = false;
    this.loaderComplete = false;
  }

  create() {
    const queuedFiles = preloadFullGameAssets(this);

    if (queuedFiles <= 0) {
      this.scene.start('SaveSelectScene');
      return;
    }

    this.createLoadingUi();
    this.startStartupAssetLoading();
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
    this.loadingUi.add(this.add.rectangle(centerX, centerY + 2, 640, 260, 0x020617, 0.2));
    this.loadingUi.add(this.add.rectangle(centerX, centerY + 2, 560, 210, 0x111827, 0.1));

    this.loadingUi.add(
      this.add
        .text(centerX - 28, centerY - 98, 'Loading Game', {
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
    this.createLoadingDots(centerX + 160, centerY - 98);

    this.loadingUi.add(
      this.add
        .text(centerX, centerY - 35, 'Loading game files', {
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
        .text(centerX, centerY + 106, 'Tip: Training helps you win harder battles.', {
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

  startStartupAssetLoading() {
    if (this.loaderStarted) return;

    this.loaderStarted = true;
    this.load.on('progress', this.updateLoadingProgress, this);
    this.load.once('complete', this.completeStartupAssetLoading, this);
    this.load.start();
  }

  completeStartupAssetLoading() {
    if (this.loaderComplete) return;

    this.loaderComplete = true;
    this.load.off('progress', this.updateLoadingProgress, this);
    this.load.off('complete', this.completeStartupAssetLoading, this);
    this.updateLoadingProgress(1);
    this.scene.start('SaveSelectScene');
  }

  updateLoadingProgress(value = 0) {
    const progress = Phaser.Math.Clamp(Number(value) || 0, 0, 1);
    if (this.progressFill) {
      this.progressFill.width = Math.max(0, (this.progressBarWidth - 4) * progress);
    }
    this.percentText?.setText(`${Math.round(progress * 100)}%`);
  }
}

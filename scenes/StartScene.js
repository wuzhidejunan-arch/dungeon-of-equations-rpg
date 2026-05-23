import { ensureGuideState, isTutorialDone } from '../utils/guideSystem.js';
import { playerData } from '../data/playerData.js';
import { debugConfig } from '../config/debugConfig.js';
import { isTesterMode } from '../utils/debugState.js';
import { createDebugBadge, syncDebugBadge } from '../utils/debugBadge.js';
import { gameModes } from '../config/gameModes.js';
import { enemyData } from '../data/enemyData.js';
import { devEnemyVisualTestGroups } from '../config/devEnemyVisualTestConfig.js';
import { getRuntimeDifficultyState, switchRuntimeDifficultySlot } from '../utils/runtimeDifficultySlots.js';
import { beginDevEnemyVisualTestSession, clearDevEnemyVisualTestSession } from '../utils/devEnemyVisualTestSession.js';
import { audioKeys } from '../config/audioKeys.js';
import { playBgm, preloadBgmAssets } from '../utils/musicManager.js';

const startSceneUiAssets = Object.freeze({
  levelSelectBg: {
    key: 'startLevelSelectBg',
    path: 'assets/images/ui/start_scene/level_select_bg.png',
  },
  titleFrame: {
    key: 'startTitleFrame',
    path: 'assets/images/ui/start_scene/title_frame.png',
  },
  shieldSword: {
    key: 'startShieldSword',
    path: 'assets/images/ui/start_scene/icon_shield_sword.png',
    display: { maxWidth: 105, maxHeight: 135 },
  },
  shieldBook: {
    key: 'startShieldBook',
    path: 'assets/images/ui/start_scene/icon_shield_book.png',
    display: { maxWidth: 105, maxHeight: 135 },
  },
  shieldSkull: {
    key: 'startShieldSkull',
    path: 'assets/images/ui/start_scene/icon_shield_skull_transparent.png',
    crop: { x: 14, y: 12, width: 701, height: 947 },
    display: { width: 44, height: 56 },
  },
});

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
    this.selectedModeIndex = 0;
    this.modeCards = [];
    this.modeViews = [];
    this.enemyVisualTestActive = false;
    this.devEnemyGroupIndex = 0;
    this.devEnemyIndex = 0;
    this.returnedEnemyVisualTestState = null;
    this.lastModeCardClick = { index: -1, time: 0 };
    this.modeStartRequested = false;
  }

  init(data = {}) {
    this.returnedEnemyVisualTestState = data?.enemyVisualTestState || null;
    this.modeCards = [];
    this.modeViews = [];
    this.lastModeCardClick = { index: -1, time: 0 };
    this.modeStartRequested = false;
    this.enemyVisualTestActive = false;
  }

  preload() {
    Object.values(startSceneUiAssets).forEach(({ key, path }) => {
      this.load.image(key, path);
    });
    // Keep the first menu paint fast; BGM loads after StartScene is visible.
  }

  create() {
    const { width, height } = this.scale;
    this.input.enabled = true;
    if (this.input.keyboard) {
      this.input.keyboard.enabled = true;
    }

    this.add.rectangle(width / 2, height / 2, width, height, 0x07111f).setDepth(-20);
    this.add
      .image(width / 2, height / 2, startSceneUiAssets.levelSelectBg.key)
      .setDisplaySize(width, height)
      .setDepth(-10);
    this.add
      .rectangle(width / 2, height / 2, width, height, 0x60a5fa, 0.08)
      .setDepth(-9);
    const hasTitleFrame = this.textures.exists(startSceneUiAssets.titleFrame.key);
    if (hasTitleFrame) {
      this.add
        .image(width / 2, 92, startSceneUiAssets.titleFrame.key)
        .setCrop(156, 294, 1220, 297)
        .setDisplaySize(700, 330);
    } else {
      this.add.rectangle(width / 2, 76, 680, 88, 0x111827, 0.98).setStrokeStyle(3, 0x475569);
      this.add.rectangle(width / 2, 38, 560, 2, 0x38bdf8, 0.42);
      this.add.rectangle(width / 2, 114, 560, 2, 0xfacc15, 0.34);
      this.add.rectangle(210, 96, 72, 2, 0x38bdf8, 0.5);
      this.add.rectangle(590, 96, 72, 2, 0x38bdf8, 0.5);

      this.add
        .text(width / 2, 62, 'Dungeon Of Equations RPG', {
          fontSize: '36px',
          color: '#f8fafc',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, 95, 'Choose a level', {
          fontSize: '20px',
          color: '#cbd5e1',
        })
        .setOrigin(0.5);
    }

    const modeOffsets = [-240, 0, 240];
    this.modeViews = this.buildModeViews();
    this.modeCards = this.modeViews.map((mode, index) => this.createModeCard(width / 2 + modeOffsets[index], 308, mode, index));

    const savedIndex = this.modeViews.findIndex((mode) => mode.key === playerData.difficulty);
    this.selectedModeIndex = savedIndex >= 0 ? savedIndex : 0;
    this.refreshModeSelection();

    const controlBarY = height - 78;
    const controlBarWidth = 600;
    const controlBarHeight = 72;
    const controlSectionWidth = controlBarWidth / 3;
    const controlBarLeft = width / 2 - controlBarWidth / 2;
    const controlSectionCenters = [
      controlBarLeft + controlSectionWidth / 2,
      controlBarLeft + controlSectionWidth * 1.5,
      controlBarLeft + controlSectionWidth * 2.5,
    ];
    const controlSeparatorXs = [
      controlBarLeft + controlSectionWidth,
      controlBarLeft + controlSectionWidth * 2,
    ];
    this.controlBar = this.add
      .rectangle(width / 2, controlBarY, controlBarWidth, controlBarHeight, 0x0b1220, 0.96)
      .setStrokeStyle(4, 0x475569);

    this.controlDecorations = [
      this.add.rectangle(width / 2, controlBarY, controlBarWidth - 18, controlBarHeight - 16, 0x07111f, 0.72)
        .setStrokeStyle(1, 0x334155, 0.8),
      this.add.rectangle(width / 2, controlBarY - 31, controlBarWidth - 58, 2, 0x38bdf8, 0.18),
      this.add.rectangle(width / 2, controlBarY + 31, controlBarWidth - 58, 2, 0xfacc15, 0.14),
      this.add.rectangle(112, controlBarY - 24, 18, 2, 0x38bdf8, 0.34),
      this.add.rectangle(112, controlBarY + 24, 18, 2, 0x38bdf8, 0.26),
      this.add.rectangle(688, controlBarY - 24, 18, 2, 0x38bdf8, 0.34),
      this.add.rectangle(688, controlBarY + 24, 18, 2, 0x38bdf8, 0.26),
      this.add.rectangle(controlSectionCenters[0] - 26, controlBarY - 6, 28, 24, 0x020617, 0.48),
      this.add.rectangle(controlSectionCenters[0] + 30, controlBarY - 6, 28, 24, 0x020617, 0.48),
      this.add.rectangle(controlSectionCenters[1] + 2, controlBarY - 6, 78, 24, 0x020617, 0.48),
      this.add.rectangle(controlSectionCenters[0] - 28, controlBarY - 8, 28, 24, 0x020617, 0.9).setStrokeStyle(2, 0x38bdf8, 0.78),
      this.add.rectangle(controlSectionCenters[0] + 28, controlBarY - 8, 28, 24, 0x020617, 0.9).setStrokeStyle(2, 0x38bdf8, 0.78),
      this.add.rectangle(controlSectionCenters[1], controlBarY - 8, 78, 24, 0x020617, 0.9).setStrokeStyle(2, 0xfacc15, 0.76),
    ];

    this.controlSeparators = [
      this.add.rectangle(controlSeparatorXs[0], controlBarY, 2, 44, 0x334155, 0.48),
      this.add.rectangle(controlSeparatorXs[1], controlBarY, 2, 44, 0x334155, 0.48),
    ];

    this.controlHintTexts = [
      this.add.text(controlSectionCenters[0] - 28, controlBarY - 8, 'A', {
        fontSize: '16px',
        color: '#38bdf8',
        fontStyle: 'bold',
      }).setOrigin(0.5),
      this.add.text(controlSectionCenters[0] + 28, controlBarY - 8, 'D', {
        fontSize: '16px',
        color: '#38bdf8',
        fontStyle: 'bold',
      }).setOrigin(0.5),
      this.add.text(controlSectionCenters[0], controlBarY - 8, '/', {
        fontSize: '15px',
        color: '#cbd5e1',
        fontStyle: 'bold',
      }).setOrigin(0.5),
      this.add.text(controlSectionCenters[0], controlBarY + 15, 'Choose', {
        fontSize: '15px',
        color: '#cbd5e1',
      }).setOrigin(0.5),
      this.add.text(controlSectionCenters[1], controlBarY - 8, 'Enter', {
        fontSize: '16px',
        color: '#facc15',
        fontStyle: 'bold',
      }).setOrigin(0.5),
      this.add.text(controlSectionCenters[1], controlBarY + 15, 'Start', {
        fontSize: '15px',
        color: '#cbd5e1',
      }).setOrigin(0.5),
      this.add.text(controlSectionCenters[2], controlBarY - 8, 'Double Click', {
        fontSize: '16px',
        color: '#facc15',
        fontStyle: 'bold',
      }).setOrigin(0.5),
      this.add.text(controlSectionCenters[2], controlBarY + 15, 'Quick Start', {
        fontSize: '15px',
        color: '#cbd5e1',
      }).setOrigin(0.5),
    ];

    this.enemyVisualTestBackdrop = this.add
      .rectangle(width / 2, height / 2, width, height, 0x020617, 0.72)
      .setVisible(false)
      .setDepth(20);

    this.enemyVisualTestPanel = this.add
      .rectangle(width / 2, height / 2, 620, 350, 0x111827, 0.98)
      .setStrokeStyle(3, 0x64748b)
      .setVisible(false)
      .setDepth(21);

    this.enemyVisualTestTitleText = this.add
      .text(width / 2, height / 2 - 122, 'Enemy Visual Test', {
        fontSize: '26px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(22);

    this.enemyVisualTestInfoText = this.add
      .text(width / 2, height / 2 - 70, '', {
        fontSize: '18px',
        color: '#cbd5e1',
        align: 'center',
        lineSpacing: 10,
      })
      .setOrigin(0.5, 0)
      .setVisible(false)
      .setDepth(22);

    this.enemyVisualTestControlsText = this.add
      .text(width / 2, height / 2 + 52, 'LEFT/RIGHT: Enemy\nUP/DOWN: Group\nENTER: Test Battle\nESC: Back', {
        fontSize: '18px',
        color: '#facc15',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 14,
      })
      .setOrigin(0.5, 0)
      .setVisible(false)
      .setDepth(22);

    this.debugBadge = createDebugBadge(this);

    this.devEnemyGroups = devEnemyVisualTestGroups;
    this.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);

    this.restoreEnemyVisualTestState();
    this.refreshDevTestUi();
    this.loadStartBgmAfterRender();
  }

  loadStartBgmAfterRender() {
    const bgmKey = audioKeys.bgm.normal;

    if (this.cache.audio.exists(bgmKey)) {
      playBgm(this, bgmKey);
      return;
    }

    preloadBgmAssets(this, bgmKey);
    this.load.once('complete', () => {
      if (!this.scene.isActive('StartScene')) return;
      playBgm(this, bgmKey);
    });
    this.load.start();
  }

  getModeAccentColor(mode, index) {
    const accents = {
      beginner: 0x38bdf8,
      intermediate: 0xa78bfa,
      challenge: 0xfb923c,
    };
    return accents[mode?.key] || [0x38bdf8, 0xa78bfa, 0xfb923c][index] || 0x38bdf8;
  }

  getModeDisplayTitle(mode) {
    return `${mode?.title || ''}`.replace(/^\d+\.\s*/, '');
  }

  getModePreviewLines(mode, index) {
    const previewLines = {
      beginner: ['Use + and −', 'Start here!'],
      intermediate: ['Use × and ÷', 'After Beginner'],
      challenge: ['All math!', 'Hardest!'],
    };
    return previewLines[mode?.key] || [
      ['Use + and −', 'Start here!'],
      ['Use × and ÷', 'After Beginner'],
      ['All math!', 'Hardest!'],
    ][index] || mode?.lines || [];
  }

  getModeShieldAsset(mode, index) {
    const shields = {
      beginner: startSceneUiAssets.shieldSword,
      intermediate: startSceneUiAssets.shieldBook,
      challenge: startSceneUiAssets.shieldSkull,
    };
    return shields[mode?.key] || [startSceneUiAssets.shieldSword, startSceneUiAssets.shieldBook, startSceneUiAssets.shieldSkull][index] || null;
  }

  fitShieldIconToBox(icon, shieldAsset) {
    if (!icon || !shieldAsset?.display) return;

    if (shieldAsset.crop) {
      icon
        .setCrop(shieldAsset.crop.x, shieldAsset.crop.y, shieldAsset.crop.width, shieldAsset.crop.height)
        .setDisplaySize(shieldAsset.display.width, shieldAsset.display.height);
      return;
    }

    const sourceImage = this.textures.get(shieldAsset.key)?.getSourceImage?.();
    const sourceWidth = sourceImage?.width || icon.width || shieldAsset.display.maxWidth;
    const sourceHeight = sourceImage?.height || icon.height || shieldAsset.display.maxHeight;
    const scale = Math.min(shieldAsset.display.maxWidth / sourceWidth, shieldAsset.display.maxHeight / sourceHeight);
    icon.setDisplaySize(sourceWidth * scale, sourceHeight * scale);
  }

  createModeCard(x, y, mode, index) {
    const accentColor = this.getModeAccentColor(mode, index);
    const shieldAsset = this.getModeShieldAsset(mode, index);
    const cardWidth = 210;
    const cardHeight = 260;
    const halfWidth = cardWidth / 2;
    const halfHeight = cardHeight / 2;
    const cornerInset = 13;
    const cornerLength = 26;

    const glow = this.add
      .rectangle(x, y, cardWidth + 28, cardHeight + 28, accentColor, 0)
      .setStrokeStyle(5, accentColor, 0);

    const card = this.add
      .rectangle(x, y, cardWidth, cardHeight, 0x111827, 0.96)
      .setStrokeStyle(3, 0x475569)
      .setInteractive({ useHandCursor: true });

    const innerPanel = this.add
      .rectangle(x, y, cardWidth - 16, cardHeight - 16, 0x0b1220, 0.3)
      .setStrokeStyle(1, accentColor, 0.38);

    const headerPanel = this.add
      .rectangle(x, y - 112, cardWidth - 22, 34, accentColor, 0.14);

    const accentBar = this.add
      .rectangle(x, y - 128, cardWidth - 34, 8, accentColor, 0.78);

    const headerTrim = this.add
      .rectangle(x, y - 95, cardWidth - 50, 2, accentColor, 0.46);

    const topShade = this.add
      .rectangle(x, y - 101, cardWidth - 28, 26, accentColor, 0.08);

    const cornerMarks = [
      this.add.rectangle(x - halfWidth + cornerInset + cornerLength / 2, y - halfHeight + cornerInset, cornerLength, 2, accentColor, 0.62),
      this.add.rectangle(x - halfWidth + cornerInset, y - halfHeight + cornerInset + cornerLength / 2, 2, cornerLength, accentColor, 0.62),
      this.add.rectangle(x + halfWidth - cornerInset - cornerLength / 2, y - halfHeight + cornerInset, cornerLength, 2, accentColor, 0.62),
      this.add.rectangle(x + halfWidth - cornerInset, y - halfHeight + cornerInset + cornerLength / 2, 2, cornerLength, accentColor, 0.62),
      this.add.rectangle(x - halfWidth + cornerInset + cornerLength / 2, y + halfHeight - cornerInset, cornerLength, 2, accentColor, 0.46),
      this.add.rectangle(x - halfWidth + cornerInset, y + halfHeight - cornerInset - cornerLength / 2, 2, cornerLength, accentColor, 0.46),
      this.add.rectangle(x + halfWidth - cornerInset - cornerLength / 2, y + halfHeight - cornerInset, cornerLength, 2, accentColor, 0.46),
      this.add.rectangle(x + halfWidth - cornerInset, y + halfHeight - cornerInset - cornerLength / 2, 2, cornerLength, accentColor, 0.46),
    ];

    const edgeBolts = [
      this.add.rectangle(x - halfWidth + 18, y - halfHeight + 18, 5, 5, accentColor, 0.62).setAngle(45),
      this.add.rectangle(x + halfWidth - 18, y - halfHeight + 18, 5, 5, accentColor, 0.62).setAngle(45),
      this.add.rectangle(x - halfWidth + 18, y + halfHeight - 18, 5, 5, accentColor, 0.48).setAngle(45),
      this.add.rectangle(x + halfWidth - 18, y + halfHeight - 18, 5, 5, accentColor, 0.48).setAngle(45),
    ];

    const lockedOverlay = this.add
      .rectangle(x, y, cardWidth - 20, cardHeight - 20, 0x020617, 0)
      .setVisible(false);
    const lockedStripes = [
      this.add.rectangle(x - 52, y - 10, 150, 5, 0x000000, 0).setAngle(-18).setVisible(false),
      this.add.rectangle(x, y + 18, 150, 5, 0x000000, 0).setAngle(-18).setVisible(false),
      this.add.rectangle(x + 52, y + 46, 150, 5, 0x000000, 0).setAngle(-18).setVisible(false),
    ];

    const shieldIcon = shieldAsset && this.textures.exists(shieldAsset.key)
      ? this.add
        .image(x, y - 92, shieldAsset.key)
      : null;
    this.fitShieldIconToBox(shieldIcon, shieldAsset);

    const titleText = this.add
      .text(x, y - 45, this.getModeDisplayTitle(mode), {
        fontSize: '24px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const divider = this.add
      .rectangle(x, y - 18, 156, 2, accentColor, 0.45);

    const dividerGem = this.add
      .rectangle(x, y - 18, 8, 8, accentColor, 0.62)
      .setAngle(45);

    const bodyText = this.add
      .text(x, y + 30, this.getModePreviewLines(mode, index).join('\n'), {
        fontSize: '17px',
        color: '#e5e7eb',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 174 },
      })
      .setOrigin(0.5);

    const statusPanel = this.add
      .rectangle(x, y + 94, cardWidth - 42, 48, 0x020617, 0.46)
      .setStrokeStyle(1, accentColor, 0.22);

    const statusText = this.add
      .text(x, y + 96, mode.active ? 'Available' : mode.lockReason, {
        fontSize: '15px',
        color: mode.active ? '#93c5fd' : '#fca5a5',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: 180 },
      })
      .setOrigin(0.5);

    card.on('pointerup', (pointer) => this.handleModeCardPointerUp(index, pointer));

    return {
      glow,
      card,
      innerPanel,
      headerPanel,
      accentBar,
      headerTrim,
      topShade,
      cornerMarks,
      edgeBolts,
      lockedOverlay,
      lockedStripes,
      shieldIcon,
      divider,
      dividerGem,
      titleText,
      bodyText,
      statusPanel,
      statusText,
      mode,
      index,
    };
  }

  getModeLockReason(mode) {
    if (!mode) return '';
    if (isTesterMode()) return '';

    const beginnerTraining = getRuntimeDifficultyState('beginner', playerData)?.trainingProgress;
    const intermediateTraining = getRuntimeDifficultyState('intermediate', playerData)?.trainingProgress;
    const beginnerCompletedStages = beginnerTraining?.completedStages || [];
    const intermediateCompletedStages = intermediateTraining?.completedStages || [];

    if (mode.key === 'intermediate' && !beginnerCompletedStages.includes(3)) {
      return '🔒 Locked\nFinish Beginner\nTraining';
    }

    if (mode.key === 'challenge' && !intermediateCompletedStages.includes(103)) {
      return '🔒 Locked\nFinish Medium\nTraining';
    }

    return '';
  }

  buildModeViews() {
    return gameModes.map((mode) => {
      const lockReason = this.getModeLockReason(mode);
      return {
        ...mode,
        active: mode.active !== false && !lockReason,
        lockReason,
      };
    });
  }

  syncModeViews() {
    this.modeViews = this.buildModeViews();
    this.modeCards.forEach((entry, index) => {
      if (!this.modeViews[index]) return;
      entry.mode = this.modeViews[index];
    });
  }

  refreshModeSelection() {
    this.syncModeViews();
    this.modeCards.forEach((entry, index) => {
      const isSelected = index === this.selectedModeIndex;
      const isActive = entry.mode.active;
      const fillColor = isActive
        ? (isSelected ? 0x172033 : 0x111827)
        : (isSelected ? 0x101827 : 0x0b1220);
      const fillAlpha = isActive ? (isSelected ? 0.98 : 0.96) : (isSelected ? 0.94 : 0.88);
      const accentColor = this.getModeAccentColor(entry.mode, index);
      const strokeColor = isSelected
        ? accentColor
        : (isActive ? 0x475569 : 0x334155);
      const accentAlpha = isActive ? 0.58 : 0.24;

      entry.glow
        .setFillStyle(accentColor, isSelected ? (isActive ? 0.1 : 0.06) : 0)
        .setStrokeStyle(0, accentColor, 0);
      entry.card
        .setFillStyle(fillColor, fillAlpha)
        .setStrokeStyle(isSelected ? 4 : 3, strokeColor, isSelected ? 0.9 : 0.72);
      entry.innerPanel
        .setFillStyle(isActive ? 0x0b1220 : 0x020617, isActive ? 0.24 : 0.58)
        .setStrokeStyle(1, isActive ? accentColor : 0xfca5a5, isActive ? 0.18 : 0.16);

      entry.headerPanel.setFillStyle(accentColor, isActive ? (isSelected ? 0.28 : 0.14) : (isSelected ? 0.1 : 0.07));
      entry.accentBar.setFillStyle(accentColor, isActive ? (isSelected ? 0.96 : 0.78) : 0.32);
      entry.headerTrim.setFillStyle(isActive ? accentColor : 0x475569, isActive ? (isSelected ? 0.58 : 0.46) : (isSelected ? 0.28 : 0.2));
      entry.topShade.setFillStyle(accentColor, isActive ? (isSelected ? 0.15 : 0.08) : (isSelected ? 0.05 : 0.03));
      (entry.cornerMarks || []).forEach((mark, markIndex) => {
        mark.setFillStyle(isActive ? accentColor : 0x475569, markIndex < 4 ? accentAlpha * 0.58 : accentAlpha * 0.4);
      });
      (entry.edgeBolts || []).forEach((bolt, boltIndex) => {
        bolt.setFillStyle(isActive ? accentColor : 0x475569, boltIndex < 2 ? accentAlpha * 0.54 : accentAlpha * 0.38);
      });
      entry.lockedOverlay
        .setVisible(!isActive)
        .setFillStyle(0x020617, !isActive ? 0.36 : 0);
      (entry.lockedStripes || []).forEach((stripe) => {
        stripe
          .setVisible(!isActive)
          .setFillStyle(0x000000, !isActive ? 0.18 : 0);
      });
      entry.shieldIcon?.setAlpha(isActive ? (isSelected ? 1 : 0.9) : 0.28);
      entry.divider.setFillStyle(isActive ? accentColor : 0x475569, isActive ? (isSelected ? 0.66 : 0.45) : (isSelected ? 0.32 : 0.25));
      entry.dividerGem.setFillStyle(isActive ? accentColor : 0x475569, isActive ? (isSelected ? 0.74 : 0.62) : (isSelected ? 0.38 : 0.3));
      entry.statusPanel
        .setFillStyle(isActive ? 0x020617 : 0x1f0b12, isActive ? (isSelected ? 0.52 : 0.44) : 0.68)
        .setStrokeStyle(1, isActive ? accentColor : 0xfca5a5, isActive ? (isSelected ? 0.24 : 0.18) : (isSelected ? 0.34 : 0.3));
      entry.titleText.setText(this.getModeDisplayTitle(entry.mode));
      entry.bodyText.setAlpha(isActive ? 1 : 0.62);
      entry.statusText.setColor(isActive ? (isSelected ? '#facc15' : '#a3e635') : '#fecdd3');
      entry.statusText.setFontSize(isActive ? 15 : 13);
      entry.statusText.setLineSpacing(isActive ? 4 : 1);
      entry.statusText.setText(isActive ? 'Available' : entry.mode.lockReason);
    });
  }

  moveSelection(delta) {
    const max = this.modeViews.length;
    this.selectedModeIndex = (this.selectedModeIndex + delta + max) % max;
    this.refreshModeSelection();
  }

  selectModeCard(index) {
    if (index < 0 || index >= this.modeViews.length) return;
    this.selectedModeIndex = index;
    this.refreshModeSelection();
  }

  handleModeCardPointerUp(index, pointer) {
    if (this.enemyVisualTestActive) return;
    if (pointer && pointer.button !== 0) return;

    const now = this.time.now;
    const isDoubleClick = this.lastModeCardClick.index === index
      && now - this.lastModeCardClick.time <= 350;

    this.selectModeCard(index);
    this.lastModeCardClick = { index, time: now };

    if (isDoubleClick) {
      this.confirmSelectedMode();
    }
  }

  getSelectedDevEnemyGroup() {
    if (!Array.isArray(this.devEnemyGroups) || this.devEnemyGroups.length === 0) {
      return null;
    }

    return this.devEnemyGroups[this.devEnemyGroupIndex] || this.devEnemyGroups[0];
  }

  getSelectedDevEnemyEntry() {
    const group = this.getSelectedDevEnemyGroup();
    if (!group?.enemies?.length) {
      return null;
    }

    return group.enemies[this.devEnemyIndex] || group.enemies[0];
  }

  restoreEnemyVisualTestState() {
    const state = this.returnedEnemyVisualTestState;
    if (!state || !isTesterMode()) {
      this.returnedEnemyVisualTestState = null;
      return;
    }

    const groupIndex = this.devEnemyGroups.findIndex((group) => group.id === state.groupId);
    this.devEnemyGroupIndex = groupIndex >= 0 ? groupIndex : 0;

    const group = this.getSelectedDevEnemyGroup();
    const enemyIndex = group?.enemies?.findIndex((enemy) => enemy.key === state.enemyKey) ?? -1;
    this.devEnemyIndex = enemyIndex >= 0 ? enemyIndex : 0;
    this.enemyVisualTestActive = state.active === true;
    this.returnedEnemyVisualTestState = null;
  }

  setEnemyVisualTestActive(active) {
    this.enemyVisualTestActive = active === true && isTesterMode();
    this.refreshDevTestUi();
  }

  refreshDevTestUi() {
    const testerMode = isTesterMode();
    const visualTestOpen = testerMode && this.enemyVisualTestActive;
    const group = this.getSelectedDevEnemyGroup();
    const enemy = this.getSelectedDevEnemyEntry();

    this.enemyVisualTestBackdrop?.setVisible(visualTestOpen);
    this.enemyVisualTestPanel?.setVisible(visualTestOpen);
    this.enemyVisualTestTitleText?.setVisible(visualTestOpen);
    this.enemyVisualTestInfoText?.setVisible(visualTestOpen);
    this.enemyVisualTestControlsText?.setVisible(visualTestOpen);
    this.controlBar?.setVisible(!visualTestOpen);
    (this.controlDecorations || []).forEach((node) => node.setVisible(!visualTestOpen));
    (this.controlSeparators || []).forEach((node) => node.setVisible(!visualTestOpen));
    (this.controlHintTexts || []).forEach((node) => node.setVisible(!visualTestOpen));

    if (visualTestOpen && group && enemy) {
      this.enemyVisualTestInfoText?.setText(`Group: ${group.label}\nEnemy: ${enemy.label}\nKey: ${enemy.key}`);
    }
  }

  openEnemyVisualTest() {
    if (!isTesterMode()) return;
    this.setEnemyVisualTestActive(true);
  }

  closeEnemyVisualTest() {
    this.setEnemyVisualTestActive(false);
  }

  moveEnemyVisualTestGroup(delta) {
    const count = this.devEnemyGroups.length;
    if (!count) return;

    this.devEnemyGroupIndex = (this.devEnemyGroupIndex + delta + count) % count;
    this.devEnemyIndex = 0;
    this.refreshDevTestUi();
  }

  moveEnemyVisualTestEnemy(delta) {
    const group = this.getSelectedDevEnemyGroup();
    const count = group?.enemies?.length || 0;
    if (!count) return;

    this.devEnemyIndex = (this.devEnemyIndex + delta + count) % count;
    this.refreshDevTestUi();
  }

  startEnemyVisualTestBattle() {
    const group = this.getSelectedDevEnemyGroup();
    const selectedEnemy = this.getSelectedDevEnemyEntry();
    const enemy = selectedEnemy?.key ? enemyData[selectedEnemy.key] : null;
    if (!group || !selectedEnemy || !enemy) {
      return;
    }

    // Temporary dev/test-only battle route: snapshot player state so the visual test battle
    // can return to StartScene without changing real progress.
    clearDevEnemyVisualTestSession();
    beginDevEnemyVisualTestSession(playerData);
    switchRuntimeDifficultySlot(playerData, group.id);

    this.scene.start('BattleScene', {
      enemy,
      enemyKey: null,
      returnScene: 'StartScene',
      returnSceneData: {
        enemyVisualTestState: {
          active: true,
          groupId: group.id,
          enemyKey: selectedEnemy.key,
        },
      },
      devEnemyVisualTest: true,
    });
  }

  confirmSelectedMode() {
    if (this.modeStartRequested) return;

    this.syncModeViews();
    const selectedMode = this.modeViews[this.selectedModeIndex];
    if (!selectedMode?.active) {
      const selectedEntry = this.modeCards[this.selectedModeIndex];
      selectedEntry?.statusText?.setText(selectedMode?.lockReason || '🔒 Locked');
      return;
    }

    switchRuntimeDifficultySlot(playerData, selectedMode.key);
    ensureGuideState(playerData);

    const nextScene = isTutorialDone(playerData) || isTesterMode() ? 'WorldScene' : 'HomeScene';
    this.modeStartRequested = true;
    this.scene.start(nextScene);
  }

  update() {
    syncDebugBadge(this.debugBadge);

    if (!isTesterMode() && this.enemyVisualTestActive) {
      this.closeEnemyVisualTest();
    }

    this.refreshDevTestUi();

    if (isTesterMode() && !this.enemyVisualTestActive && Phaser.Input.Keyboard.JustDown(this.keyT)) {
      this.openEnemyVisualTest();
      return;
    }

    if (this.enemyVisualTestActive) {
      if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
        this.closeEnemyVisualTest();
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
        this.moveEnemyVisualTestEnemy(-1);
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.keyRIGHT)) {
        this.moveEnemyVisualTestEnemy(1);
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.keyUP)) {
        this.moveEnemyVisualTestGroup(-1);
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
        this.moveEnemyVisualTestGroup(1);
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.startEnemyVisualTestBattle();
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyLEFT) || Phaser.Input.Keyboard.JustDown(this.keyA)) {
      this.moveSelection(-1);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyRIGHT) || Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.moveSelection(1);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.confirmSelectedMode();
    }
  }
}

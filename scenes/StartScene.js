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
  }

  init(data = {}) {
    this.returnedEnemyVisualTestState = data?.enemyVisualTestState || null;
  }

  preload() {
    // Keep the first menu paint fast; BGM loads after StartScene is visible.
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);
    this.add.rectangle(width / 2, 74, width - 120, 82, 0x111827, 0.96).setStrokeStyle(2, 0x334155);

    this.add
      .text(width / 2, 62, 'Dungeon Of Equations RPG', {
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 95, 'Choose a level', {
        fontSize: '20px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5);

    const modeOffsets = [-240, 0, 240];
    this.modeViews = this.buildModeViews();
    this.modeCards = this.modeViews.map((mode, index) => this.createModeCard(width / 2 + modeOffsets[index], 300, mode, index));

    const savedIndex = this.modeViews.findIndex((mode) => mode.key === playerData.difficulty);
    this.selectedModeIndex = savedIndex >= 0 ? savedIndex : 0;
    this.refreshModeSelection();

    this.bottomControlsText = this.add
      .text(width / 2, height - 88, 'Left / Right: Choose   Enter: Start', {
        fontSize: '20px',
        color: '#facc15',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.bottomHelpText = this.add
      .text(
        width / 2,
        height - 48,
        debugConfig.testModeEnabled
          ? 'Move: WASD / Arrows   Talk: E   Bag: B   F11: Test'
          : 'Move: WASD / Arrows   Talk: E   Bag: B',
        {
        fontSize: '16px',
        color: '#94a3b8',
      })
      .setOrigin(0.5);

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

  createModeCard(x, y, mode, index) {
    const card = this.add.rectangle(x, y, 210, 210, 0x1f2937, 0.96).setStrokeStyle(3, 0x64748b);

    const titleText = this.add
      .text(x, y - 70, mode.title, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const bodyText = this.add
      .text(x, y + 2, mode.lines.join('\n'), {
        fontSize: '16px',
        color: '#e5e7eb',
        align: 'center',
        lineSpacing: 10,
        wordWrap: { width: 150 },
      })
      .setOrigin(0.5);

    const statusText = this.add
      .text(x, y + 74, mode.active ? 'Available' : mode.lockReason, {
        fontSize: '15px',
        color: mode.active ? '#93c5fd' : '#fca5a5',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 180 },
      })
      .setOrigin(0.5);

    return { card, titleText, bodyText, statusText, mode, index };
  }

  getModeLockReason(mode) {
    if (!mode) return '';
    if (isTesterMode()) return '';

    const beginnerTraining = getRuntimeDifficultyState('beginner', playerData)?.trainingProgress;
    const intermediateTraining = getRuntimeDifficultyState('intermediate', playerData)?.trainingProgress;
    const beginnerCompletedStages = beginnerTraining?.completedStages || [];
    const intermediateCompletedStages = intermediateTraining?.completedStages || [];

    if (mode.key === 'intermediate' && !beginnerCompletedStages.includes(3)) {
      return 'Locked\nFinish Beginner Training';
    }

    if (mode.key === 'challenge' && !intermediateCompletedStages.includes(103)) {
      return 'Locked\nFinish Medium Training';
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
        ? (isSelected ? 0x1d4ed8 : 0x1f2937)
        : 0x172033;
      const fillAlpha = isActive ? 0.96 : (isSelected ? 0.94 : 0.88);
      const strokeColor = isSelected ? 0xfacc15 : 0x64748b;

      entry.card
        .setFillStyle(fillColor, fillAlpha)
        .setStrokeStyle(3, strokeColor);

      entry.titleText.setText(entry.mode.title);
      entry.bodyText.setAlpha(isActive ? 1 : 0.52);
      entry.statusText.setColor(isActive ? (isSelected ? '#fde68a' : '#93c5fd') : '#fca5a5');
      entry.statusText.setText(isActive ? 'Available' : entry.mode.lockReason);
    });
  }

  moveSelection(delta) {
    const max = this.modeViews.length;
    this.selectedModeIndex = (this.selectedModeIndex + delta + max) % max;
    this.refreshModeSelection();
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
    this.bottomControlsText?.setVisible(!visualTestOpen);
    this.bottomHelpText?.setVisible(!visualTestOpen);

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
    this.syncModeViews();
    const selectedMode = this.modeViews[this.selectedModeIndex];
    if (!selectedMode?.active) {
      const selectedEntry = this.modeCards[this.selectedModeIndex];
      selectedEntry?.statusText?.setText(selectedMode?.lockReason || 'Locked');
      return;
    }

    switchRuntimeDifficultySlot(playerData, selectedMode.key);
    ensureGuideState(playerData);

    const nextScene = isTutorialDone(playerData) || isTesterMode() ? 'WorldScene' : 'HomeScene';
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

    if (Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
      this.moveSelection(-1);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyRIGHT)) {
      this.moveSelection(1);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.confirmSelectedMode();
    }
  }
}

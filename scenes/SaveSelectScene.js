import { audioKeys } from '../config/audioKeys.js';
import { preloadStartupAssets } from '../utils/gameAssetPreloader.js';
import { hasAnySave, loadSavedProgress, resetGame } from '../utils/saveSystem.js';
import { playSfx, preloadSfxAssets } from '../utils/sfxManager.js';

const MENU_OPTIONS = Object.freeze(['Continue', 'New Game']);
const OPTION_START_Y = 315;
const OPTION_GAP = 50;
const OPTION_HIT_WIDTH = 260;
const OPTION_HIT_HEIGHT = 40;
const BACKGROUND_KEY = 'startLevelSelectBg';

export class SaveSelectScene extends Phaser.Scene {
  constructor() {
    super('SaveSelectScene');
    this.selectedIndex = 0;
    this.optionHighlights = [];
    this.optionTexts = [];
    this.cursorText = null;
    this.keyUP = null;
    this.keyDOWN = null;
    this.keyENTER = null;
    this.keySPACE = null;
  }

  preload() {
    preloadStartupAssets(this, { includeSfx: false });
    preloadSfxAssets(this, [audioKeys.sfx.uiMove, audioKeys.sfx.uiConfirm]);
  }

  create() {
    if (!hasAnySave()) {
      this.scene.start('StartScene');
      return;
    }

    this.selectedIndex = 0;
    this.optionHighlights = [];
    this.optionTexts = [];

    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    if (this.textures.exists(BACKGROUND_KEY)) {
      const background = this.add.image(centerX, centerY, BACKGROUND_KEY);
      const scale = Math.max(width / background.width, height / background.height);
      background.setScale(scale);
    } else {
      this.add.rectangle(centerX, centerY, width, height, 0x07111f, 1);
    }
    this.add.rectangle(centerX, centerY, width, height, 0x020617, 0.58);

    this.add.text(centerX, 170, 'Saved Progress Found', {
      fontSize: '38px',
      color: '#ffd66b',
      fontStyle: 'bold',
      fontFamily: 'monospace',
      stroke: '#2a1607',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(centerX, 245, 'Continue from your save?', {
      fontSize: '21px',
      color: '#f8e7c0',
      fontFamily: 'monospace',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.optionHighlights = MENU_OPTIONS.map((_, index) => {
      const y = OPTION_START_Y + index * OPTION_GAP;
      return this.add.zone(centerX, y, OPTION_HIT_WIDTH, OPTION_HIT_HEIGHT)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.selectOption(index, true))
        .on('pointerup', (pointer) => this.handleOptionPointerUp(index, pointer));
    });

    this.optionTexts = MENU_OPTIONS.map((label, index) => {
      const y = OPTION_START_Y + index * OPTION_GAP;
      return this.add.text(centerX, y, label, {
        fontSize: '24px',
        color: '#f8e7c0',
        fontStyle: 'bold',
        fontFamily: 'monospace',
        stroke: '#0f172a',
        strokeThickness: 3,
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.selectOption(index, true))
        .on('pointerup', (pointer) => this.handleOptionPointerUp(index, pointer));
    });

    this.cursorText = this.add.text(centerX - 120, OPTION_START_Y, '▶', {
      fontSize: '24px',
      color: '#facc15',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(centerX, 445, 'New Game will reset your saved progress.', {
      fontSize: '17px',
      color: '#c7b78f',
      align: 'center',
      fontFamily: 'monospace',
      wordWrap: { width: 560 },
      stroke: '#0f172a',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.refreshSelection();
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keyUP)) {
      this.moveSelection(-1, true);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyDOWN)) {
      this.moveSelection(1, true);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER) || Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
      this.confirmSelection();
    }
  }

  moveSelection(delta, playSound = false) {
    this.selectOption((this.selectedIndex + delta + MENU_OPTIONS.length) % MENU_OPTIONS.length, playSound);
  }

  selectOption(index, playSound = false) {
    if (index < 0 || index >= MENU_OPTIONS.length) return;

    const changed = this.selectedIndex !== index;
    this.selectedIndex = index;

    if (changed && playSound) {
      playSfx(this, audioKeys.sfx.uiMove);
    }

    this.refreshSelection();
  }

  refreshSelection() {
    this.optionTexts.forEach((node, index) => {
      const selected = index === this.selectedIndex;
      node.setColor(selected ? '#facc15' : '#f8e7c0');
      node.setScale(selected ? 1.03 : 1);
      node.setShadow(2, 2, '#0f172a', selected ? 3 : 0, true, true);
    });

    const selectedNode = this.optionTexts[this.selectedIndex];
    if (selectedNode && this.cursorText) {
      this.cursorText.setPosition(selectedNode.x - 120, selectedNode.y);
    }
  }

  handleOptionPointerUp(index, pointer) {
    if (pointer && pointer.button !== 0) return;

    this.selectOption(index, false);
    this.confirmSelection();
  }

  confirmSelection() {
    playSfx(this, audioKeys.sfx.uiConfirm);

    if (this.selectedIndex === 0) {
      loadSavedProgress();
      this.scene.start('StartScene');
      return;
    }

    resetGame();
    window.location.reload();
  }
}

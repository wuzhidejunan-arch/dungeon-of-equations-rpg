import { BaseScene } from './BaseScene.js';
import { playerData } from '../data/playerData.js';
import { createBasicTextures, preloadMapArt } from '../utils/textureFactory.js';
import { hidePrompt, showPrompt } from '../utils/ui.js';
import { saveGame } from '../utils/saveSystem.js';
import { getDifficultyDungeonEnemy } from '../config/difficultySettings.js';
import { dungeonConfig } from '../config/dungeonConfig.js';
import { audioKeys } from '../config/audioKeys.js';
import { playBgm, preloadBgmAssets } from '../utils/musicManager.js';

const DEBUG_DUNGEON_COLLISION = false;
const DEBUG_DUNGEON_COORDS = false;
const DEBUG_DUNGEON_MARKERS = false;
const DUNGEON_BOSS_TEXTURE_PATHS = {
  enemy_even_gatekeeper: 'assets/images/enemies/beginning/even_gatekeeper.png',
  enemy_odd_gatekeeper: 'assets/images/enemies/beginning/odd_gatekeeper.png',
  enemy_prime_gatekeeper: 'assets/images/enemies/beginning/prime_gatekeeper.png',
  enemy_prime_dungeon_lord: 'assets/images/enemies/beginning/prime_dungeon_lord.png',
  enemy_intermediate_even_stone_gatekeeper: 'assets/images/enemies/intermediate/even_stone_gatekeeper.png',
  enemy_intermediate_odd_fang_gatekeeper: 'assets/images/enemies/intermediate/odd_fang_gatekeeper.png',
  enemy_intermediate_iron_core_gatekeeper: 'assets/images/enemies/intermediate/iron_core_gatekeeper.png',
  enemy_intermediate_armor_core_lord: 'assets/images/enemies/intermediate/armor_core_lord.png',
  challenge_balanced_sentinel: 'assets/images/enemies/challenge/balanced_sentinel.png',
  challenge_crooked_sentinel: 'assets/images/enemies/challenge/crooked_sentinel.png',
  challenge_prime_warden: 'assets/images/enemies/challenge/prime_warden.png',
  challenge_chain_oracle_lord: 'assets/images/enemies/challenge/chain_oracle_lord.png',
};

export class DungeonScene extends BaseScene {
  constructor() {
    super('DungeonScene');
  }

  init() {
    this.finalClearChoiceActive = false;
    this.finalClearChoiceSelectionIndex = 0;
  }

  preload() {
    preloadMapArt(this);
    this.preloadCurrentBossVisual();
    preloadBgmAssets(this, audioKeys.bgm.dungeon);
  }

  create() {
    playBgm(this, audioKeys.bgm.dungeon);

    this.interactTarget = null;
    this.isEnteringBattle = false;
    this.randomEncounterDistance = 0;
    this.lastEncounterAt = 0;
    this.lastPlayerPos = null;

    createBasicTextures(this);
    this.initializeRoomState();

    const dungeonBackgroundKeyByRoom = {
      1: 'dungeonMap01',
      2: 'dungeonMap02',
      3: 'dungeonMap03',
      4: 'dungeonBossMap',
    };
    this.dungeonBackgroundKey = dungeonBackgroundKeyByRoom[this.roomNumber] || 'dungeonMap01';
    this.dungeonBackground = this.add.image(400, 300, this.dungeonBackgroundKey);
    this.dungeonBackgroundScale = Math.max(800 / this.dungeonBackground.width, 600 / this.dungeonBackground.height);
    this.dungeonBackground.setScale(this.dungeonBackgroundScale);
    this.dungeonBackground.setDepth(-20);

    const dungeonSpawn = this.resolveDungeonSpawnPosition();
    this.player = this.physics.add.sprite(
      dungeonSpawn.x,
      dungeonSpawn.y,
      'playerFront',
    );
    this.player.setScale(0.07);
    this.player.setDepth(-4);
    this.player.setCollideWorldBounds(true);
    const playerBodyWidth = Math.round(this.player.width * 0.4);
    const playerBodyHeight = Math.round(this.player.height * 0.64);
    const playerBodyOffsetX = Math.round((this.player.width - playerBodyWidth) / 2);
    const playerBodyOffsetY = Math.round(this.player.height - playerBodyHeight - (3 / this.player.scaleY));
    this.player.body.setSize(playerBodyWidth, playerBodyHeight, true);
    this.player.body.setOffset(playerBodyOffsetX, playerBodyOffsetY);

    this.setupPrompt();
    this.setupCommonKeys();
    this.setupStatusUI();
    this.setupLevelUpUI();
    this.setupFinalClearModal();

    this.buildRoom();
    this.lastPlayerPos = new Phaser.Math.Vector2(this.player.x, this.player.y);

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.blockObjects);

    if (this.bossZone) {
      this.physics.add.overlap(this.player, this.bossZone, () => {
        if (this.isEnteringBattle) return;
        if (this.handleDialogueInput()) return;
        if (this.levelUpNoticeActive) return;
        if (this.isCurrentRoomBossDefeated()) return;
        this.startBossBattle();
      });
    }

    if (this.exitZone) {
      this.physics.add.overlap(this.player, this.exitZone, () => {
        this.interactTarget = 'exit';
      });
    }

    if (this.worldExitZone) {
      this.physics.add.overlap(this.player, this.worldExitZone, () => {
        this.interactTarget = 'leaveDungeon';
      });
    }

    if (this.entryExitZone) {
      this.physics.add.overlap(this.player, this.entryExitZone, () => {
        this.interactTarget = 'leaveDungeon';
      });
    }

    if (DEBUG_DUNGEON_COORDS) {
      this.setupCoordinateDebugOverlay();
      this.logDungeonCoordinateDebugOnce();
    }
  }

  initializeRoomState() {
    this.roomNumber = playerData.dungeonProgress.currentRoom || 1;
    this.roomConfig = dungeonConfig.rooms[this.roomNumber] || dungeonConfig.rooms[1];
    this.currentBossConfig = this.roomConfig.boss;
    this.selectedBossEnemy = this.getSelectedBossEnemy();
  }

  getRoomEntrySpawn(roomNumber = this.roomNumber) {
    const roomConfig = dungeonConfig.rooms[roomNumber] || dungeonConfig.rooms[1];
    const entryZone = roomConfig?.entry?.zone || dungeonConfig.shared.entryExitZone;
    return {
      x: entryZone.x,
      y: entryZone.y,
    };
  }

  getRoomForwardDoorSpawn(roomNumber = this.roomNumber) {
    const roomConfig = dungeonConfig.rooms[roomNumber] || dungeonConfig.rooms[1];
    const forwardDoorSpawn = roomConfig?.forwardDoorSpawn || dungeonConfig.shared.nextDoorSpawn || null;

    if (forwardDoorSpawn) {
      return {
        x: forwardDoorSpawn.x,
        y: forwardDoorSpawn.y,
      };
    }

    return this.getRoomEntrySpawn(roomNumber);
  }

  isSpawnPosition(position, target) {
    return position.x === target.x && position.y === target.y;
  }

  shouldUseRoomEntrySpawn() {
    const currentSpawn = playerData.position.dungeon;

    if (this.roomNumber === 1 && this.isSpawnPosition(currentSpawn, { x: 90, y: 520 })) {
      return true;
    }

    return (
      this.isSpawnPosition(currentSpawn, dungeonConfig.navigation.previousRoomSpawn)
      || this.isSpawnPosition(currentSpawn, dungeonConfig.navigation.nextRoomSpawn)
    );
  }

  resolveDungeonSpawnPosition() {
    if (!this.shouldUseRoomEntrySpawn()) {
      return {
        x: playerData.position.dungeon.x,
        y: playerData.position.dungeon.y,
      };
    }

    const entrySpawn = this.getRoomEntrySpawn();
    playerData.position.dungeon.x = entrySpawn.x;
    playerData.position.dungeon.y = entrySpawn.y;
    return entrySpawn;
  }

  buildRoom() {
    this.walls = this.physics.add.staticGroup();
    this.blockObjects = this.physics.add.staticGroup();

    this.createOuterWalls();
    this.createRoomMaze();
    this.createEntryMarker();
    this.createBossAndDoor();
  }

  preloadCurrentBossVisual() {
    const roomNumber = playerData.dungeonProgress.currentRoom || 1;
    const configRoom = dungeonConfig.rooms[roomNumber] || dungeonConfig.rooms[1];
    const fallbackBoss = configRoom?.boss?.enemy || null;
    const selectedBossEnemy = getDifficultyDungeonEnemy(roomNumber, 'boss') || fallbackBoss;
    const imageKey = selectedBossEnemy?.imageKey || null;
    const texturePath = imageKey ? DUNGEON_BOSS_TEXTURE_PATHS[imageKey] : null;

    if (imageKey && texturePath && !this.textures.exists(imageKey)) {
      this.load.image(imageKey, texturePath);
    }
  }

  getSelectedBossEnemy() {
    return getDifficultyDungeonEnemy(this.roomNumber, 'boss') || this.currentBossConfig?.enemy || null;
  }

  createStaticRect(group, x, y, width, height, color, options = {}) {
    const isWallRect = group === this.walls;
    const hideWhenNotDebug = options.hideWhenNotDebug === true;
    const defaultAlpha = (isWallRect || hideWhenNotDebug) && !DEBUG_DUNGEON_COLLISION ? 0 : 0.35;
    const rect = this.add.rectangle(
      x,
      y,
      width,
      height,
      color,
      options.alpha ?? defaultAlpha,
    );
    if ((isWallRect || hideWhenNotDebug) && DEBUG_DUNGEON_COLLISION) {
      rect.setStrokeStyle(2, color, 0.9);
    }
    this.physics.add.existing(rect, true);
    if (rect.body && typeof rect.body.updateFromGameObject === 'function') {
      rect.body.updateFromGameObject();
    }
    group.add(rect);
    return rect;
  }

  createZone(x, y, width, height) {
    const zone = this.add.zone(x, y, width, height);
    this.physics.add.existing(zone, true);
    return zone;
  }

  setupFinalClearModal() {
    this.finalClearOverlay = this.add.rectangle(400, 300, 800, 600, 0x05070d, 0.68)
      .setDepth(1200)
      .setScrollFactor(0)
      .setVisible(false);
    this.finalClearPanel = this.add.rectangle(400, 300, 560, 300, 0x0f172a, 0.97)
      .setStrokeStyle(4, 0xfacc15, 0.95)
      .setDepth(1201)
      .setScrollFactor(0)
      .setVisible(false);
    this.finalClearPanelInner = this.add.rectangle(400, 300, 540, 280, 0x172033, 0.32)
      .setStrokeStyle(1, 0xf8e08a, 0.22)
      .setDepth(1201)
      .setScrollFactor(0)
      .setVisible(false);
    this.finalClearTitleText = this.add.text(400, 214, 'Congratulations!', {
      fontSize: '32px',
      color: '#facc15',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1202).setScrollFactor(0).setVisible(false);
    this.finalClearBodyText = this.add.text(400, 268, 'You beat this level!', {
      fontSize: '22px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setDepth(1202).setScrollFactor(0).setVisible(false);
    this.finalClearOptionHighlights = [
      this.add.rectangle(400, 346, 376, 40, 0xfacc15, 0.16)
        .setStrokeStyle(2, 0xfacc15, 0.55)
        .setDepth(1201)
        .setScrollFactor(0)
        .setVisible(false),
      this.add.rectangle(400, 392, 336, 40, 0xfacc15, 0.16)
        .setStrokeStyle(2, 0xfacc15, 0.55)
        .setDepth(1201)
        .setScrollFactor(0)
        .setVisible(false),
    ];
    this.finalClearOptionTexts = [
      this.add.text(400, 346, 'Go to level choice', {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1202).setScrollFactor(0).setVisible(false),
      this.add.text(400, 392, 'Go back to the world map', {
        fontSize: '20px',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(1202).setScrollFactor(0).setVisible(false),
    ];
  }

  showFinalClearModal() {
    this.finalClearChoiceActive = true;
    this.finalClearChoiceSelectionIndex = 0;
    this.player?.setVelocity?.(0, 0);
    hidePrompt(this.promptText);
    this.clearText?.setAlpha?.(0.18);
    this.roomText?.setAlpha?.(0.18);
    [
      this.finalClearOverlay,
      this.finalClearPanel,
      this.finalClearPanelInner,
      this.finalClearTitleText,
      this.finalClearBodyText,
      ...(this.finalClearOptionHighlights || []),
      ...(this.finalClearOptionTexts || []),
    ].forEach((node) => node?.setVisible(true));
    this.updateFinalClearModalSelection();
  }

  hideFinalClearModal() {
    this.finalClearChoiceActive = false;
    [
      this.finalClearOverlay,
      this.finalClearPanel,
      this.finalClearPanelInner,
      this.finalClearTitleText,
      this.finalClearBodyText,
      ...(this.finalClearOptionHighlights || []),
      ...(this.finalClearOptionTexts || []),
    ].forEach((node) => node?.setVisible(false));
    this.clearText?.setAlpha?.(1);
    this.roomText?.setAlpha?.(1);
  }

  updateFinalClearModalSelection() {
    const selectedIndex = Phaser.Math.Clamp(this.finalClearChoiceSelectionIndex, 0, 1);
    this.finalClearChoiceSelectionIndex = selectedIndex;
    this.finalClearOptionHighlights?.forEach((node, index) => {
      node?.setVisible(index === selectedIndex);
    });
    this.finalClearOptionTexts?.forEach((node, index) => {
      node?.setColor(index === selectedIndex ? '#fde68a' : '#d1d5db');
      node?.setFontStyle(index === selectedIndex ? 'bold' : 'normal');
    });
  }

  handleFinalClearModalInput() {
    if (!this.finalClearChoiceActive) {
      return false;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up)
      || Phaser.Input.Keyboard.JustDown(this.cursors.left)
    ) {
      this.finalClearChoiceSelectionIndex = 0;
      this.updateFinalClearModalSelection();
      return true;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.down)
      || Phaser.Input.Keyboard.JustDown(this.cursors.right)
    ) {
      this.finalClearChoiceSelectionIndex = 1;
      this.updateFinalClearModalSelection();
      return true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyENTER)) {
      this.confirmFinalClearModalChoice();
      return true;
    }

    return true;
  }

  confirmFinalClearModalChoice() {
    if (this.finalClearChoiceSelectionIndex === 0) {
      saveGame();
      this.scene.start('StartScene');
      return;
    }

    playerData.position.world.x = dungeonConfig.navigation.leaveToWorld.x;
    playerData.position.world.y = dungeonConfig.navigation.leaveToWorld.y;
    saveGame();
    this.scene.start('WorldScene');
  }

  setupCoordinateDebugOverlay() {
    const { width, height } = this.scale;

    this.dungeonCoordDebugGraphics = this.add.graphics().setDepth(3000);
    this.dungeonCoordDebugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 8, y: 6 },
      fontFamily: 'monospace',
      lineSpacing: 4,
    }).setDepth(3001).setScrollFactor(0);

    this.dungeonCoordDebugGraphics.lineStyle(1, 0x6ee7ff, 0.25);

    for (let x = 0; x <= width; x += 50) {
      this.dungeonCoordDebugGraphics.beginPath();
      this.dungeonCoordDebugGraphics.moveTo(x, 0);
      this.dungeonCoordDebugGraphics.lineTo(x, height);
      this.dungeonCoordDebugGraphics.strokePath();
    }

    for (let y = 0; y <= height; y += 50) {
      this.dungeonCoordDebugGraphics.beginPath();
      this.dungeonCoordDebugGraphics.moveTo(0, y);
      this.dungeonCoordDebugGraphics.lineTo(width, y);
      this.dungeonCoordDebugGraphics.strokePath();
    }

    for (let x = 0; x <= width; x += 100) {
      this.add.text(x + 2, 2, `${x}`, {
        fontSize: '12px',
        color: '#6ee7ff',
        backgroundColor: '#00000088',
        fontFamily: 'monospace',
      }).setDepth(3001).setScrollFactor(0);
    }

    for (let y = 0; y <= height; y += 100) {
      this.add.text(2, y + 2, `${y}`, {
        fontSize: '12px',
        color: '#6ee7ff',
        backgroundColor: '#00000088',
        fontFamily: 'monospace',
      }).setDepth(3001).setScrollFactor(0);
    }

    this.input.on('pointerdown', (pointer) => {
      if (!DEBUG_DUNGEON_COORDS) return;
      console.log('[DungeonScene coord click]', {
        roomNumber: this.roomNumber,
        x: Math.round(pointer.worldX),
        y: Math.round(pointer.worldY),
      });
    });
  }

  logDungeonCoordinateDebugOnce() {
    const formatZone = (zone) => (
      zone
        ? {
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
        }
        : null
    );

    console.log('[DungeonScene coords debug]', {
      roomNumber: this.roomNumber,
      dungeonBackgroundKey: this.dungeonBackgroundKey,
      dungeonBackground: {
        x: this.dungeonBackground?.x ?? null,
        y: this.dungeonBackground?.y ?? null,
        displayWidth: this.dungeonBackground?.displayWidth ?? null,
        displayHeight: this.dungeonBackground?.displayHeight ?? null,
        scaleX: this.dungeonBackground?.scaleX ?? null,
        scaleY: this.dungeonBackground?.scaleY ?? null,
        appliedScale: this.dungeonBackgroundScale ?? null,
      },
      canvasTargetSize: {
        width: this.scale.width,
        height: this.scale.height,
      },
      outerWalls: dungeonConfig.outerWalls,
      mazeWalls: this.roomConfig?.mazeWalls || [],
      entryZone: formatZone(this.entryExitZone),
      exitZone: formatZone(this.exitZone),
      worldExitZone: formatZone(this.worldExitZone),
      bossZone: formatZone(this.bossZone),
    });
  }

  renderCoordinateDebugOverlay() {
    if (!DEBUG_DUNGEON_COORDS || !this.dungeonCoordDebugText) return;

    const pointer = this.input.activePointer;
    const mouseX = Math.round(pointer.worldX ?? pointer.x ?? 0);
    const mouseY = Math.round(pointer.worldY ?? pointer.y ?? 0);
    const playerX = Math.round(this.player?.x ?? 0);
    const playerY = Math.round(this.player?.y ?? 0);

    this.dungeonCoordDebugText.setText([
      `Room: ${this.roomNumber}`,
      `Mouse: ${mouseX}, ${mouseY}`,
      `Player: ${playerX}, ${playerY}`,
      `BG: ${this.dungeonBackgroundKey}`,
    ]);
  }

  createOuterWalls() {
    dungeonConfig.outerWalls.forEach(([x, y, w, h]) => {
      this.createStaticRect(this.walls, x, y, w, h, 0x5b5b5b);
    });
  }

  createRoomMaze() {
    const walls = this.roomConfig.mazeWalls || [];
    walls.forEach(([x, y, w, h]) => {
      this.createStaticRect(this.walls, x, y, w, h, 0x6a6a6a);
    });
  }

  createEntryMarker() {
    const marker = this.roomConfig.entry?.marker || dungeonConfig.shared.entryMarker;
    this.entryMarker = this.add.rectangle(
      marker.x,
      marker.y,
      marker.width,
      marker.height,
      marker.color,
      DEBUG_DUNGEON_MARKERS ? 0.2 : 0,
    );
    if (DEBUG_DUNGEON_MARKERS) {
      this.entryMarker.setStrokeStyle(2, marker.color, 0.4);
    }

    const entryZone = this.roomConfig.entry?.zone || dungeonConfig.shared.entryExitZone;
    this.entryExitZone = this.createZone(entryZone.x, entryZone.y, entryZone.width, entryZone.height);
  }

  createBossVisual(enemy, marker) {
    if (!enemy?.imageKey || !this.textures.exists(enemy.imageKey)) {
      return null;
    }

    const display = enemy.imageDisplay || {};
    const visualScale = this.roomNumber === 4 ? 0.9 : 0.82;
    const width = Math.round((display.width || 120) * visualScale);
    const height = Math.round((display.height || 120) * visualScale);
    const offsetX = Math.round((display.offsetX || 0) * visualScale);
    const offsetY = Math.round((display.offsetY || 0) * visualScale);

    return this.add
      .image(marker.x + offsetX, marker.y + offsetY, enemy.imageKey)
      .setDisplaySize(width, height)
      .setDepth(-5);
  }

  createBossAndDoor() {
    const defeated = this.isCurrentRoomBossDefeated();

    if (!defeated && this.currentBossConfig) {
      const marker = this.currentBossConfig.marker;
      const zone = this.currentBossConfig.zone;
      this.bossMarker = this.createStaticRect(
        this.blockObjects,
        marker.x,
        marker.y,
        marker.width,
        marker.height,
        marker.color,
        { hideWhenNotDebug: true },
      );
      this.bossVisual = this.createBossVisual(this.selectedBossEnemy, marker);
      this.bossZone = this.createZone(zone.x, zone.y, zone.width, zone.height);
    } else {
      this.bossMarker = null;
      this.bossVisual = null;
      this.bossZone = null;
    }

    if (this.roomNumber < 4) {
      if (!defeated) {
        const blockedDoor = this.roomConfig.blockedDoor;
        this.closedDoor = this.createStaticRect(
          this.blockObjects,
          blockedDoor.x,
          blockedDoor.y,
          blockedDoor.width,
          blockedDoor.height,
          blockedDoor.color,
          { hideWhenNotDebug: true },
        );
      } else {
        const marker = this.roomConfig.door.marker;
        const zone = this.roomConfig.door.zone;
        this.exitMarker = this.add.rectangle(
          marker.x,
          marker.y,
          marker.width,
          marker.height,
          marker.color,
          DEBUG_DUNGEON_MARKERS ? 0.2 : 0,
        );
        if (DEBUG_DUNGEON_MARKERS) {
          this.exitMarker.setStrokeStyle(2, marker.color, 0.45);
        }
        this.exitZone = this.createZone(zone.x, zone.y, zone.width, zone.height);
      }
    } else if (!defeated) {
      const blockedDoor = this.roomConfig.blockedDoor;
      this.finalSeal = this.createStaticRect(
        this.blockObjects,
        blockedDoor.x,
        blockedDoor.y,
        blockedDoor.width,
        blockedDoor.height,
        blockedDoor.color,
        { hideWhenNotDebug: true },
      );
    } else {
      const marker = this.roomConfig.clearExit.marker;
      const zone = this.roomConfig.clearExit.zone;
      this.worldExitMarker = this.add.rectangle(
        marker.x,
        marker.y,
        marker.width,
        marker.height,
        marker.color,
        DEBUG_DUNGEON_MARKERS ? 0.2 : 0,
      );
      if (DEBUG_DUNGEON_MARKERS) {
        this.worldExitMarker.setStrokeStyle(2, marker.color, 0.45);
      }
      this.worldExitZone = this.createZone(zone.x, zone.y, zone.width, zone.height);

      this.clearText = this.add
        .text(400, 70, 'Dungeon Cleared!', {
          fontSize: '28px',
          color: '#ffd700',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    }

    this.roomText = this.add
      .text(400, 35, `Room ${this.roomNumber}`, {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
  }

  isCurrentRoomBossDefeated() {
    if (!this.currentBossConfig) return false;
    return !!playerData.dungeonProgress[this.currentBossConfig.progressKey];
  }

  startBossBattle() {
    const difficultyBoss = getDifficultyDungeonEnemy(this.roomNumber, 'boss');
    this.startBattle(difficultyBoss || this.currentBossConfig.enemy, this.currentBossConfig.enemyKey);
  }

  startRandomEncounter() {
    const difficultyPool = getDifficultyDungeonEnemy(this.roomNumber, 'encounter');
    const pool = difficultyPool || this.roomConfig.encounterPool || dungeonConfig.rooms[1].encounterPool;
    const enemy = Phaser.Utils.Array.GetRandom(pool);
    this.startBattle(enemy, null);
  }

  startBattle(enemy, enemyKey = null) {
    if (!enemy || this.isEnteringBattle) return;

    this.isEnteringBattle = true;
    this.lastEncounterAt = this.time.now;
    this.randomEncounterDistance = 0;

    playerData.position.dungeon.x = this.player.x;
    playerData.position.dungeon.y = this.player.y;
    saveGame();

    this.scene.start('BattleScene', {
      enemy,
      returnScene: 'DungeonScene',
      enemyKey,
    });
  }

  isPlayerInEncounterSafeZone() {
    const safeChecks = [this.entryExitZone, this.exitZone, this.worldExitZone, this.bossZone].filter(Boolean);
    return safeChecks.some((zone) => this.physics.overlap(this.player, zone));
  }

  updateRandomEncounterProgress() {
    if (this.isEnteringBattle || this.dialogueActive || this.levelUpNoticeActive) return;
    if (this.isPlayerInEncounterSafeZone()) {
      this.randomEncounterDistance = 0;
      this.lastPlayerPos.set(this.player.x, this.player.y);
      return;
    }

    const moved = Phaser.Math.Distance.Between(
      this.lastPlayerPos.x,
      this.lastPlayerPos.y,
      this.player.x,
      this.player.y,
    );

    this.lastPlayerPos.set(this.player.x, this.player.y);

    if (moved <= 0) return;

    this.randomEncounterDistance += moved;

    const { cooldownMs, distanceThreshold, chancePercent, missResetDistance } = dungeonConfig.encounter;
    const cooldownActive = this.time.now - this.lastEncounterAt < cooldownMs;
    if (cooldownActive || this.randomEncounterDistance < distanceThreshold) return;

    const encounterRoll = Phaser.Math.Between(1, 100);
    if (encounterRoll <= chancePercent) {
      this.startRandomEncounter();
      return;
    }

    this.randomEncounterDistance = missResetDistance;
  }

  update() {
    this.updateStatusUI();
    this.showPendingLevelUpNotifications();

    if (DEBUG_DUNGEON_COORDS) {
      this.renderCoordinateDebugOverlay();
    }

    if (this.finalClearChoiceActive) {
      this.player.setVelocity(0, 0);
      this.handleFinalClearModalInput();
      return;
    }

    const controlsLocked = this.levelUpNoticeActive || this.inventoryOpen;
    this.handlePlayerMovement(this.player, 200, controlsLocked);

    if (this.handleDialogueInput()) {
      return;
    }

    if (this.inventoryOpen) {
      return;
    }

    this.updateRandomEncounterProgress();

    const nearNextDoor = this.exitZone ? this.physics.overlap(this.player, this.exitZone) : false;
    const nearFinalLeaveDoor = this.worldExitZone ? this.physics.overlap(this.player, this.worldExitZone) : false;
    const nearEntryLeaveDoor = this.entryExitZone ? this.physics.overlap(this.player, this.entryExitZone) : false;
    const bossDefeated = this.isCurrentRoomBossDefeated();

    if (nearEntryLeaveDoor) {
      if (this.roomNumber > 1) {
          showPrompt(this.promptText, 'Press E to go back');
          this.interactTarget = 'previousRoom';
        } else {
          showPrompt(this.promptText, 'Press E to leave the cave');
          this.interactTarget = 'leaveDungeon';
        }
      } else if (bossDefeated && nearNextDoor) {
      showPrompt(this.promptText, 'Press E to go to the next room');
        this.interactTarget = 'nextRoom';
      } else if (bossDefeated && nearFinalLeaveDoor && this.roomNumber === 4) {
      showPrompt(this.promptText, 'Press E at the door behind the boss');
        this.interactTarget = 'finalClearDoor';
      } else if (bossDefeated && this.roomNumber === 4) {
      showPrompt(this.promptText, 'Go to the door behind the boss');
        this.interactTarget = null;
      } else if (!bossDefeated) {
      showPrompt(this.promptText, this.roomNumber < 4 ? 'Beat the big monster by the door' : 'Beat the last big monster');
        this.interactTarget = null;
    } else {
      hidePrompt(this.promptText);
      this.interactTarget = null;
    }

    if (this.isInventoryHotkeyPressed()) {
      this.player.setVelocity(0, 0);
      this.openInventory();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.interactTarget === 'leaveDungeon') {
        playerData.position.world.x = dungeonConfig.navigation.leaveToWorld.x;
        playerData.position.world.y = dungeonConfig.navigation.leaveToWorld.y;
        saveGame();
        this.scene.start('WorldScene');
        return;
      }

      if (this.interactTarget === 'finalClearDoor') {
        this.showFinalClearModal();
        return;
      }

      if (this.interactTarget === 'previousRoom') {
        playerData.dungeonProgress.currentRoom -= 1;
        const previousRoomSpawn = this.getRoomForwardDoorSpawn(playerData.dungeonProgress.currentRoom);
        playerData.position.dungeon.x = previousRoomSpawn.x;
        playerData.position.dungeon.y = previousRoomSpawn.y;
        saveGame();
        this.scene.restart();
        return;
      }

      if (this.interactTarget === 'nextRoom') {
        playerData.dungeonProgress.currentRoom += 1;
        const nextRoomSpawn = this.getRoomEntrySpawn(playerData.dungeonProgress.currentRoom);
        playerData.position.dungeon.x = nextRoomSpawn.x;
        playerData.position.dungeon.y = nextRoomSpawn.y;
        saveGame();
        this.scene.restart();
      }
    }
  }
}

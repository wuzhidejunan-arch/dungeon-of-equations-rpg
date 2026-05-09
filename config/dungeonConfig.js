import { enemyData } from '../data/enemyData.js';

const SHARED_POSITIONS = {
  entryMarker: { x: 158, y: 528, width: 56, height: 56, color: 0x00aaff },
  entryExitZone: { x: 158, y: 528, width: 120, height: 96 },
  nextDoor: {
    marker: { x: 607, y: 91, width: 58, height: 44, color: 0x00ff88 },
    zone: { x: 607, y: 104, width: 132, height: 100 },
  },
  nextDoorSpawn: { x: 607, y: 168 },
  closedDoor: { x: 607, y: 92, width: 84, height: 52, color: 0x8b4513 },
  finalSeal: { x: 400, y: 72, width: 112, height: 52, color: 0x9932cc },
  worldExit: {
    marker: { x: 400, y: 72, width: 66, height: 48, color: 0xffff00 },
    zone: { x: 400, y: 92, width: 140, height: 108 },
  },
};

export const dungeonConfig = {
  encounter: {
    distanceThreshold: 130,
    chancePercent: 32,
    cooldownMs: 2500,
    missResetDistance: 80,
  },
  navigation: {
    leaveToWorld: { x: 120, y: 500 },
    previousRoomSpawn: { x: 680, y: 120 },
    nextRoomSpawn: { x: 140, y: 470 },
  },
  outerWalls: [
    [400, 20, 800, 40],
    [400, 580, 800, 40],
    [20, 300, 40, 600],
    [780, 300, 40, 600],
  ],
  rooms: {
    1: {
      label: 'Mini Boss 1',
      entry: {
        marker: SHARED_POSITIONS.entryMarker,
        zone: SHARED_POSITIONS.entryExitZone,
      },
      mazeWalls: [
        [365, 199, 198, 32],
        [170, 312, 42, 128],
        [225, 367, 148, 32],
        [553, 348, 42, 168],
      ],
      encounterPool: [enemyData.slime],
      boss: {
        enemy: enemyData.boss1,
        enemyKey: 'room1_boss',
        progressKey: 'boss1Defeated',
        marker: { x: 607, y: 136, width: 70, height: 78, color: 0xaa0000 },
        zone: { x: 607, y: 128, width: 146, height: 120 },
      },
      door: SHARED_POSITIONS.nextDoor,
      forwardDoorSpawn: SHARED_POSITIONS.nextDoorSpawn,
      blockedDoor: SHARED_POSITIONS.closedDoor,
    },
    2: {
      label: 'Mini Boss 2',
      entry: {
        marker: SHARED_POSITIONS.entryMarker,
        zone: SHARED_POSITIONS.entryExitZone,
      },
      mazeWalls: [
        [223, 221, 42, 132],
        [534, 215, 206, 32],
        [243, 378, 270, 32],
        [483, 419, 42, 132],
      ],
      encounterPool: [enemyData.slime, enemyData.bat],
      boss: {
        enemy: enemyData.boss2,
        enemyKey: 'room2_boss',
        progressKey: 'boss2Defeated',
        marker: { x: 607, y: 136, width: 70, height: 78, color: 0xaa0000 },
        zone: { x: 607, y: 128, width: 146, height: 120 },
      },
      door: SHARED_POSITIONS.nextDoor,
      forwardDoorSpawn: SHARED_POSITIONS.nextDoorSpawn,
      blockedDoor: SHARED_POSITIONS.closedDoor,
    },
    3: {
      label: 'Mini Boss 3',
      entry: {
        marker: SHARED_POSITIONS.entryMarker,
        zone: SHARED_POSITIONS.entryExitZone,
      },
      mazeWalls: [
        [159, 239, 42, 132],
        [368, 190, 214, 32],
        [318, 354, 42, 136],
        [544, 263, 42, 122],
        [590, 366, 134, 32],
      ],
      encounterPool: [enemyData.bat, enemyData.slime],
      boss: {
        enemy: enemyData.boss3,
        enemyKey: 'room3_boss',
        progressKey: 'boss3Defeated',
        marker: { x: 607, y: 136, width: 70, height: 78, color: 0xaa0000 },
        zone: { x: 607, y: 128, width: 146, height: 120 },
      },
      door: SHARED_POSITIONS.nextDoor,
      forwardDoorSpawn: SHARED_POSITIONS.nextDoorSpawn,
      blockedDoor: SHARED_POSITIONS.closedDoor,
    },
    4: {
      label: 'Final Boss',
      entry: {
        marker: { x: 400, y: 528, width: 56, height: 56, color: 0x00aaff },
        zone: { x: 400, y: 528, width: 132, height: 96 },
      },
      mazeWalls: [],
      encounterPool: [enemyData.bat, enemyData.slime],
      boss: {
        enemy: enemyData.finalBoss,
        enemyKey: 'final_boss',
        progressKey: 'finalBossDefeated',
        marker: { x: 400, y: 232, width: 92, height: 92, color: 0x800080 },
        zone: { x: 400, y: 236, width: 188, height: 160 },
      },
      blockedDoor: SHARED_POSITIONS.finalSeal,
      clearExit: SHARED_POSITIONS.worldExit,
    },
  },
  shared: SHARED_POSITIONS,
};

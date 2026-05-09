const enemyProgressFlags = {
  room1_boss: 'boss1Defeated',
  room2_boss: 'boss2Defeated',
  room3_boss: 'boss3Defeated',
  final_boss: 'finalBossDefeated',
};

export function applyBattleVictoryProgress(playerData, enemyKey = null) {
  if (!enemyKey) {
    return;
  }

  if (!Array.isArray(playerData.defeatedEnemies)) {
    playerData.defeatedEnemies = [];
  }

  if (!playerData.defeatedEnemies.includes(enemyKey)) {
    playerData.defeatedEnemies.push(enemyKey);
  }

  const progressKey = enemyProgressFlags[enemyKey];
  if (progressKey) {
    playerData.dungeonProgress[progressKey] = true;
    if (enemyKey === 'final_boss') {
      playerData.dungeonProgress.cleared = true;
    }
  }
}

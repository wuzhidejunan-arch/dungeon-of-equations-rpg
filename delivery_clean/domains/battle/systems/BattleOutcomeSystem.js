import { playerData } from '../../../data/playerData.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import { saveGame } from '../../../utils/saveSystem.js';
import { persistBattleSkillLoadout } from '../../../utils/playerSkills.js';
import { getExpRewardForEnemy, grantBattleExp } from '../../../utils/levelSystem.js';
import { ensureTrainingState } from '../../../utils/trainingSystem.js';
import { formatBattleTemplate, getBattleText, getBattleUIText } from '../../../utils/battleSchema.js';
import { applyBattleVictoryProgress } from '../../../engine/battleProgress.js';
import { resolvePlayerAttack } from '../../../engine/resolvePlayerAttack.js';
import { resolveEnemyTurn } from '../../../engine/resolveEnemyTurn.js';
import { restoreDevEnemyVisualTestSession } from '../../../utils/devEnemyVisualTestSession.js';

const HOME_RESPAWN_POSITION = Object.freeze({ x: 400, y: 500 });
const WORLD_HOME_EXIT_POSITION = Object.freeze({ x: 220, y: 290 });

function markTrainingBattleOutcome(scene, didWin) {
  if (scene.returnScene !== 'TrainingScene') return;

  const state = ensureTrainingState(playerData);
  state.lastBattleWinKey = didWin ? scene.enemyKey || null : null;
}

export class BattleOutcomeSystem {
  constructor({ scene, controller, registries = {} }) {
    this.scene = scene;
    this.controller = controller;
    this.registries = registries;
  }

  resolveEnemyTurnOutcome(activeBonus = null) {
    // Canonical path: use the controller-owned enemy turn system that runs the registered
    // rule pipeline. The imported resolver remains as a compatibility adapter for any call
    // sites that reach battle helpers without a fully wired controller (tests, legacy hooks).
    const outcome = this.controller?.enemyTurnSystem?.resolve({ activeBonus }) || resolveEnemyTurn(this.scene, { activeBonus });

    if (this.scene.getActiveDefenseMultiplier() < 1) {
      this.scene.consumeDefenseBuffTurn();
    }

    if (typeof this.scene.consumeEnemyDebuffTurns === 'function') {
      this.scene.consumeEnemyDebuffTurns();
    }

    return outcome;
  }

  playEnemyTurnSequence(playerLines = [], activeBonus = null, options = {}) {
    this.scene.setTurn('enemy');

    const keepDialogPrompt = options.keepDialogPrompt !== false;
    const returnPrompt = options.returnPrompt || getBattleUIText('prompts.mainMenu', 'Choose your move');
    const enemyOutcome = this.resolveEnemyTurnOutcome(activeBonus);

    const dialogLines = Array.isArray(playerLines) ? [...playerLines] : playerLines ? [playerLines] : [];
    dialogLines.push(...(enemyOutcome.phases || [enemyOutcome.line]));

    if (playerData.hp <= 0) {
      this.scene.showDialogSequence(dialogLines, () => this.loseBattle());
      return;
    }

    if (keepDialogPrompt) {
      dialogLines.push({ phase: battleResultPhases.INFO, text: returnPrompt });
    }

    this.scene.showDialogSequence(dialogLines, () => this.scene.finalizeTurnReturn(options));
  }

  resolveAttack(result, expression, operator = null) {
    const usedSkill = this.scene.selectedSkill || this.scene.playerSkills[0];
    // Canonical path: resolve attacks through the controller-owned attack system. The direct
    // resolver remains as a compatibility fallback while older integrations still exist.
    const resolved = this.controller?.attackSystem?.resolve({
      skill: usedSkill,
      result,
      expression,
      operator,
    }) || resolvePlayerAttack(this.scene, {
      skill: usedSkill,
      result,
      expression,
      operator,
    });

    this.scene.refreshBattleUI();
    this.scene.selectedSkill = null;
    this.scene.selectedSkillIndex = 0;

    if (this.scene.enemyCurrentHp <= 0) {
      this.scene.showDialogSequence(resolved.lines, () => this.winBattle());
      return;
    }

    if (playerData.hp <= 0) {
      this.scene.showDialogSequence(resolved.lines, () => this.loseBattle());
      return;
    }

    this.controller?.emitActionResolved({ result, expression, operator, resolved });
    this.playEnemyTurnSequence(resolved.lines, resolved.activeBonus);
  }

  winBattle() {
    this.scene.battleEnded = true;

    if (this.scene.devEnemyVisualTest) {
      this.scene.renderResultText('You beat the monster!', battleResultPhases.VICTORY);
      this.scene.addBattleLog(getBattleText('logs.enemyDefeated', `${this.scene.enemy.name} was defeated.`, { enemy: this.scene.enemy.name }));
      this.scene.refreshBattleUI();

      this.controller?.emitBattleEnded({ outcome: 'win' });

      this.scene.time.delayedCall(800, () => {
        restoreDevEnemyVisualTestSession(playerData);
        this.scene.scene.start(this.scene.returnScene || 'StartScene', this.scene.returnSceneData || undefined);
      });
      return;
    }

    const reward = this.scene.enemy.goldReward || 10;
    const expReward = getExpRewardForEnemy(this.scene.enemy);
    playerData.gold += reward;
    const expResult = grantBattleExp(expReward);

    applyBattleVictoryProgress(playerData, this.scene.enemyKey);

    this.scene.renderResultText(
      formatBattleTemplate(getBattleUIText('resultText.win', 'You beat the monster!\nYou got {reward} gold.'), { reward, expReward }),
      battleResultPhases.VICTORY,
      { reward, expReward },
    );
    this.scene.addBattleLog(getBattleText('logs.enemyDefeated', `${this.scene.enemy.name} was defeated.`, { enemy: this.scene.enemy.name }));
    this.scene.addBattleLog(getBattleText('logs.playerGainedGold', `Player gained ${reward} Gold.`, { reward }));
    this.scene.addBattleLog(`Player gained ${expReward} EXP.`);

    if (expResult.leveledUp) {
      this.scene.addBattleLog(`Level up! Now Lv.${expResult.currentLevel}.`);
    }
    this.scene.refreshBattleUI();

    this.controller?.emitBattleEnded({ outcome: 'win' });

    this.scene.time.delayedCall(800, () => {
      persistBattleSkillLoadout(this.scene.playerSkills || []);
      markTrainingBattleOutcome(this.scene, true);
      saveGame();
      this.scene.scene.start(this.scene.returnScene || 'WorldScene', this.scene.returnSceneData || undefined);
    });
  }

  loseBattle() {
    this.scene.battleEnded = true;
    this.scene.renderResultText(getBattleUIText('resultText.lose', 'You lost this battle.'), battleResultPhases.DEFEAT);
    this.scene.addBattleLog(getBattleText('logs.playerDefeated', 'Player was defeated.'));
    this.scene.refreshBattleUI();

    this.controller?.emitBattleEnded({ outcome: 'lose' });

    this.scene.time.delayedCall(800, () => {
      if (this.scene.devEnemyVisualTest) {
        restoreDevEnemyVisualTestSession(playerData);
        this.scene.scene.start(this.scene.returnScene || 'StartScene', this.scene.returnSceneData || undefined);
        return;
      }

      persistBattleSkillLoadout(this.scene.playerSkills || []);
      playerData.hp = playerData.maxHp;
      markTrainingBattleOutcome(this.scene, false);

      if (this.scene.returnScene === 'TrainingScene') {
        saveGame();
        this.scene.scene.start(this.scene.returnScene);
        return;
      }

      playerData.position.home.x = HOME_RESPAWN_POSITION.x;
      playerData.position.home.y = HOME_RESPAWN_POSITION.y;
      playerData.position.world.x = WORLD_HOME_EXIT_POSITION.x;
      playerData.position.world.y = WORLD_HOME_EXIT_POSITION.y;
      saveGame();
      this.scene.scene.start('HomeScene', {
        showGameOver: true,
        gameOverTitle: 'Game Over',
        gameOverMessage: 'Try again. You can do it.',
      });
    });
  }
}

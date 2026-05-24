import { playerData } from '../../../data/playerData.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import { battleMenuStates } from '../../../data/battleStates.js';
import { saveGame } from '../../../utils/saveSystem.js';
import { persistBattleSkillLoadout } from '../../../utils/playerSkills.js';
import { getExpRewardForEnemy, grantBattleExp } from '../../../utils/levelSystem.js';
import { ensureTrainingState } from '../../../utils/trainingSystem.js';
import { formatBattleTemplate, getBattleText, getBattleUIText } from '../../../utils/battleSchema.js';
import { applyBattleVictoryProgress } from '../../../engine/battleProgress.js';
import { resolvePlayerAttack } from '../../../engine/resolvePlayerAttack.js';
import { resolveEnemyTurn } from '../../../engine/resolveEnemyTurn.js';
import { restoreDevEnemyVisualTestSession } from '../../../utils/devEnemyVisualTestSession.js';
import { audioKeys } from '../../../config/audioKeys.js';
import { playSfx } from '../../../utils/sfxManager.js';

const HOME_RESPAWN_POSITION = Object.freeze({ x: 400, y: 500 });
const WORLD_HOME_EXIT_POSITION = Object.freeze({ x: 220, y: 290 });
const PLAYER_ATTACK_IMPACT_DELAY_MS = 240;
const ENEMY_TURN_START_DELAY_MS = 380;
const ENEMY_HP_REFRESH_DELAY_MS = 220;
const VICTORY_FOLLOWUP_DELAY_MS = 320;

function markTrainingBattleOutcome(scene, didWin) {
  if (scene.returnScene !== 'TrainingScene') return;

  const state = ensureTrainingState(playerData);
  state.lastBattleWinKey = didWin ? scene.enemyKey || null : null;
}

function isBlockedPlayerAttackOutcome(resolved) {
  if (!resolved) return false;
  const resolutionState = resolved.resolutionState || resolved.resultType || resolved.outcome || '';
  return resolutionState === 'partial_success' && Number(resolved.damage || 0) <= 0;
}

function isFailedPlayerActionOutcome(resolved) {
  if (!resolved) return false;
  const resolutionState = resolved.resolutionState || resolved.resultType || resolved.outcome || '';
  return resolutionState === 'failure';
}

function isSuccessfulPlayerActionOutcome(resolved) {
  if (!resolved) return false;
  const resolutionState = resolved.resolutionState || resolved.resultType || resolved.outcome || '';
  return resolutionState === 'full_success';
}

function getSkillEffects(skill) {
  return Array.isArray(skill?.effects) ? skill.effects : [];
}

function skillHasEffect(skill, effectType) {
  return getSkillEffects(skill).some((effect) => effect?.type === effectType);
}

function playResolvedPlayerActionSfx(scene, skill, resolved) {
  if (!isSuccessfulPlayerActionOutcome(resolved)) return;

  if (skillHasEffect(skill, 'addTimedEnemyDebuff')) {
    playSfx(scene, audioKeys.sfx.debuff, { volume: 0.45, maxDurationMs: 1000 });
    return;
  }

  if (skillHasEffect(skill, 'addTimedBuff')) {
    playSfx(scene, audioKeys.sfx.buff, { volume: 0.5, maxDurationMs: 1200 });
    return;
  }

  if (skillHasEffect(skill, 'damage_enemy') || skill?.category === 'attack' || skill?.role === 'attack') {
    playSfx(scene, audioKeys.sfx.playerAttack);
  }
}

function scheduleBattleFeedback(scene, delayMs, callback) {
  if (!scene?.time?.delayedCall || delayMs <= 0) {
    callback();
    return;
  }

  scene.time.delayedCall(delayMs, () => {
    const sceneKey = scene.sys?.settings?.key || scene.scene?.key || null;
    if (sceneKey && scene.scene?.isActive && !scene.scene.isActive(sceneKey)) {
      return;
    }
    callback();
  });
}

function lockBattleFeedback(scene) {
  scene.feedbackDelayActive = true;
  scene.setBattleMenuState?.(battleMenuStates.DIALOG);
}

function unlockBattleFeedback(scene) {
  scene.feedbackDelayActive = false;
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
    const returnPrompt = options.returnPrompt || getBattleUIText('prompts.mainMenu', 'Choose Fight, Bag, or Run.');
    const playerHpBeforeEnemyTurn = playerData.hp;
    const enemyOutcome = this.resolveEnemyTurnOutcome(activeBonus);

    if (enemyOutcome?.blocked) {
      playSfx(this.scene, audioKeys.sfx.blocked);
    } else if (playerData.hp < playerHpBeforeEnemyTurn) {
      playSfx(this.scene, audioKeys.sfx.playerHit);
    }

    scheduleBattleFeedback(this.scene, ENEMY_HP_REFRESH_DELAY_MS, () => {
      this.scene.refreshBattleUI();
    });

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
    const enemyHpBeforeAttack = this.scene.enemyCurrentHp;
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
    const enemyHpAfterAttack = this.scene.enemyCurrentHp;
    const enemyHpDecreased = enemyHpAfterAttack < enemyHpBeforeAttack;
    const enemyDefeated = enemyHpBeforeAttack > 0 && enemyHpAfterAttack <= 0;
    const playImpactFeedback = () => {
      if (isFailedPlayerActionOutcome(resolved)) {
        playSfx(this.scene, audioKeys.sfx.actionFail);
      } else if (enemyDefeated) {
        playResolvedPlayerActionSfx(this.scene, usedSkill, resolved);
        playSfx(this.scene, audioKeys.sfx.enemyDefeat);
      } else if (enemyHpDecreased) {
        playResolvedPlayerActionSfx(this.scene, usedSkill, resolved);
        playSfx(this.scene, audioKeys.sfx.enemyHit);
      } else if (isBlockedPlayerAttackOutcome(resolved)) {
        playSfx(this.scene, audioKeys.sfx.blocked);
      } else {
        playResolvedPlayerActionSfx(this.scene, usedSkill, resolved);
      }
      this.scene.refreshBattleUI();
    };

    lockBattleFeedback(this.scene);
    this.scene.selectedSkill = null;
    this.scene.selectedSkillIndex = 0;

    if (this.scene.enemyCurrentHp <= 0) {
      scheduleBattleFeedback(this.scene, PLAYER_ATTACK_IMPACT_DELAY_MS, () => {
        unlockBattleFeedback(this.scene);
        playImpactFeedback();
        this.scene.showDialogSequence(resolved.lines, () => {
          lockBattleFeedback(this.scene);
          scheduleBattleFeedback(this.scene, VICTORY_FOLLOWUP_DELAY_MS, () => this.winBattle());
        });
      });
      return;
    }

    if (playerData.hp <= 0) {
      scheduleBattleFeedback(this.scene, PLAYER_ATTACK_IMPACT_DELAY_MS, () => {
        unlockBattleFeedback(this.scene);
        playImpactFeedback();
        this.scene.showDialogSequence(resolved.lines, () => this.loseBattle());
      });
      return;
    }

    this.controller?.emitActionResolved({ result, expression, operator, resolved });
    scheduleBattleFeedback(this.scene, PLAYER_ATTACK_IMPACT_DELAY_MS, () => {
      unlockBattleFeedback(this.scene);
      playImpactFeedback();
      this.scene.showDialogSequence(resolved.lines, () => {
        lockBattleFeedback(this.scene);
        scheduleBattleFeedback(this.scene, ENEMY_TURN_START_DELAY_MS, () => {
          unlockBattleFeedback(this.scene);
          this.playEnemyTurnSequence([], resolved.activeBonus);
        });
      });
    });
  }

  winBattle() {
    this.scene.battleEnded = true;
    unlockBattleFeedback(this.scene);
    playSfx(this.scene, audioKeys.sfx.victory);

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

import { battleReturnMenus } from '../../data/battleStates.js';
import { battleResultPhases } from '../../data/battlePhases.js';
import { getBattleText, getBattleUIText } from '../../utils/battleSchema.js';
import { playerData } from '../../data/playerData.js';
import { restoreDevEnemyVisualTestSession } from '../../utils/devEnemyVisualTestSession.js';
import { audioKeys } from '../../config/audioKeys.js';
import { playSfx } from '../../utils/sfxManager.js';

const ESCAPE_RATES = {
  normal: 0.7,
  miniBoss: 0.3,
  boss: 0,
};
const ESCAPE_BLOCKED_MENU_REOPEN_DELAY_MS = 1100;
const ESCAPE_SUCCESS_RETURN_DELAY_MS = 1200;

function getEscapeCategory(enemy = null) {
  const enemyId = String(enemy?.id || '');
  const enemyName = String(enemy?.name || '');
  const label = `${enemyId} ${enemyName}`.toLowerCase();

  if (
    enemyId === 'finalBoss' ||
    label.includes('lord')
  ) {
    return 'boss';
  }

  if (
    label.includes('gatekeeper') ||
    label.includes('sentinel') ||
    label.includes('warden')
  ) {
    return 'miniBoss';
  }

  return 'normal';
}

function resolveEscapeAttempt(enemy = null) {
  const category = getEscapeCategory(enemy);
  const chance = ESCAPE_RATES[category] ?? ESCAPE_RATES.normal;

  return {
    category,
    chance,
    allowed: chance > 0,
    success: chance > 0 && Math.random() < chance,
  };
}

export const BattleEnemyFlowMixin = {
  enemyTurn(playerLines = [], activeBonus = null, options = {}) {
    this.playEnemyTurnSequence(playerLines, activeBonus, {
      returnMenu: options.returnMenu || battleReturnMenus.MAIN,
      returnPrompt: options.returnPrompt || getBattleUIText('prompts.mainMenu', 'Choose Fight, Bag, or Run.'),
      keepDialogPrompt: options.keepDialogPrompt !== false,
    });
  },

  runAway() {
    const escapeResult = resolveEscapeAttempt(this.enemy);

    if (!escapeResult.allowed) {
      const message = getBattleUIText('prompts.escapeBlocked', 'You cannot escape from this battle!');
      this.renderResultText(message, battleResultPhases.INFO);
      this.addBattleLog(message);
      this.time.delayedCall(ESCAPE_BLOCKED_MENU_REOPEN_DELAY_MS, () => {
        if (!this.battleEnded) {
          this.openMainMenu?.();
        }
      });
      return;
    }

    if (!escapeResult.success) {
      const message = getBattleUIText('prompts.escapeFailed', 'Escape failed!');
      this.addBattleLog(message);
      this.enemyTurn(
        [{ phase: battleResultPhases.INFO, text: message }],
        null,
        {
          returnMenu: battleReturnMenus.MAIN,
          returnPrompt: getBattleUIText('prompts.mainMenu', 'Choose Fight, Bag, or Run.'),
        },
      );
      return;
    }

    playSfx(this, audioKeys.sfx.run, { volume: 0.45, cooldownMs: 300, allowOverlap: false });
    this.renderResultText(getBattleUIText('prompts.runAway', 'You ran away.'));
    this.addBattleLog(getBattleText('logs.playerRanAway', 'Player ran away.'));
    this.battleEnded = true;

    this.time.delayedCall(ESCAPE_SUCCESS_RETURN_DELAY_MS, () => {
      if (this.devEnemyVisualTest) {
        restoreDevEnemyVisualTestSession(playerData);
      }
      this.scene.start(this.returnScene, this.returnSceneData || undefined);
    });
  },

  chooseEnemySkill() {
    return this.battleController?.chooseEnemySkill?.() || null;
  },
};

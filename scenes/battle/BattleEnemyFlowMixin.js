import { battleReturnMenus } from '../../data/battleStates.js';
import { getBattleText, getBattleUIText } from '../../utils/battleSchema.js';
import { playerData } from '../../data/playerData.js';
import { restoreDevEnemyVisualTestSession } from '../../utils/devEnemyVisualTestSession.js';
import { audioKeys } from '../../config/audioKeys.js';
import { playSfx } from '../../utils/sfxManager.js';

export const BattleEnemyFlowMixin = {
  enemyTurn(playerLines = [], activeBonus = null, options = {}) {
    this.playEnemyTurnSequence(playerLines, activeBonus, {
      returnMenu: options.returnMenu || battleReturnMenus.MAIN,
      returnPrompt: options.returnPrompt || getBattleUIText('prompts.mainMenu', 'Choose Fight, Bag, or Run.'),
      keepDialogPrompt: options.keepDialogPrompt !== false,
    });
  },

  runAway() {
    playSfx(this, audioKeys.sfx.run, { volume: 0.45, cooldownMs: 300, allowOverlap: false });
    this.renderResultText(getBattleUIText('prompts.runAway', 'You ran away.'));
    this.addBattleLog(getBattleText('logs.playerRanAway', 'Player ran away.'));
    this.battleEnded = true;

    this.time.delayedCall(500, () => {
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

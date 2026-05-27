import { battleMenuStates } from '../../../data/battleStates.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import {
  formatBattleTemplate,
  getBattleStateText,
  getBattleUIText,
  getSafeBattleSkillHint,
} from '../../../utils/battleSchema.js';

export class BattleDialogPresenter {
  constructor({ scene } = {}) {
    this.scene = scene;
  }

  startBattleIntro() {
    const scene = this.scene;
    const safeHint = getSafeBattleSkillHint({
      enemy: scene.enemy,
      skills: scene.playerSkills,
      difficultyKey: scene.difficultyKey,
    });
    const introLines = [
      { phase: battleResultPhases.INFO, text: formatBattleTemplate(getBattleUIText('intro.appear', 'A wild {enemy} appeared!'), { enemy: scene.enemy.name }) },
      { phase: battleResultPhases.INFO, text: getBattleUIText('prompts.battleStart', 'Battle start!') },
      { phase: battleResultPhases.INFO, text: getBattleUIText('prompts.mainMenu', 'Choose Fight, Bag, or Run.') },
    ];

    if (safeHint) {
      introLines.push(
        { phase: battleResultPhases.INFO, text: safeHint.tipText },
        { phase: battleResultPhases.INFO, text: safeHint.instructionText },
      );
    }

    this.showDialogSequence(introLines, () => {
      scene.showMainMenu?.();
      scene.renderResultText?.(getBattleStateText(battleMenuStates.MAIN, 'resultTextKey', 'Choose Fight, Bag, or Run.'), battleResultPhases.INFO);
    });
  }

  normalizeDialogEntry(entry) {
    if (typeof entry === 'string') {
      return { phase: battleResultPhases.INFO, text: entry, payload: {} };
    }

    return {
      phase: entry?.phase || battleResultPhases.INFO,
      text: String(entry?.text || ''),
      payload: entry?.payload || {},
    };
  }

  showDialogSequence(lines, onComplete = null) {
    const scene = this.scene;
    const rawEntries = Array.isArray(lines) ? lines : [lines];
    scene.dialogQueue = rawEntries.map((entry) => this.normalizeDialogEntry(entry));
    scene.dialogCallback = onComplete;
    scene.setBattleMenuState?.(battleMenuStates.DIALOG);
    scene.showCombinedBox?.(true);
    this.showNextDialogLine();
  }

  showNextDialogLine() {
    const scene = this.scene;
    if (!scene.dialogQueue?.length) {
      const callback = scene.dialogCallback;
      scene.dialogCallback = null;
      scene.setBattleMenuState?.(battleMenuStates.MAIN);
      scene.showCombinedBox?.(false);
      if (callback) callback();
      return;
    }

    const nextLine = scene.dialogQueue.shift();
    scene.renderDialogLine?.(nextLine.text, nextLine.phase, nextLine.payload);
  }
}

import { battleMenuStates } from '../../../data/battleStates.js';
import { battleResultPhases } from '../../../data/battlePhases.js';

export class BattleDialogCoordinator {
  constructor({ scene }) {
    this.scene = scene;
  }

  startBattleIntro() {
    const scene = this.scene;
    const isGuidedBattle = Boolean(scene?.isTrainingGuideBattle?.());

    if (scene.battlePresentation && !isGuidedBattle) {
      return scene.battlePresentation.startBattleIntro();
    }

    const introLines = isGuidedBattle
      ? [
          { phase: battleResultPhases.INFO, text: `A wild ${scene.enemy.name} appeared!` },
          { phase: battleResultPhases.INFO, text: 'HP means health. If HP reaches 0, you lose.' },
          { phase: battleResultPhases.INFO, text: 'Mini-step 1: Read the monster rule first.' },
          { phase: battleResultPhases.INFO, text: 'This monster starts with armor, so use Armor Break first.' },
          { phase: battleResultPhases.INFO, text: 'Next, make an even answer and read what happened.' },
          { phase: battleResultPhases.INFO, text: 'Now choose Fight.' },
        ]
      : [
          { phase: battleResultPhases.INFO, text: `A wild ${scene.enemy.name} appeared!` },
          { phase: battleResultPhases.INFO, text: 'Battle start!' },
          { phase: battleResultPhases.INFO, text: 'Choose your move' },
        ];

    this.showDialogSequence(introLines, () => {
      scene.showMainMenu();
      scene.renderResultText(isGuidedBattle ? 'Mini-step 1: Choose Fight.' : 'Choose your move', battleResultPhases.INFO);
    });
  }

  normalizeDialogEntry(entry) {
    const scene = this.scene;
    if (scene.battlePresentation) {
      return scene.battlePresentation.normalizeDialogEntry(entry);
    }

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
    if (scene.battlePresentation) {
      return scene.battlePresentation.showDialogSequence(lines, onComplete);
    }

    const rawEntries = Array.isArray(lines) ? lines : [lines];
    scene.dialogQueue = rawEntries.map((entry) => this.normalizeDialogEntry(entry));
    scene.dialogCallback = onComplete;
    scene.setBattleMenuState(battleMenuStates.DIALOG);
    scene.showCombinedBox(true);
    this.showNextDialogLine();
  }

  showNextDialogLine() {
    const scene = this.scene;
    if (scene.battlePresentation) {
      return scene.battlePresentation.showNextDialogLine();
    }

    if (!scene.dialogQueue.length) {
      const callback = scene.dialogCallback;
      scene.dialogCallback = null;
      scene.setBattleMenuState(battleMenuStates.MAIN);
      scene.showCombinedBox(false);
      if (callback) callback();
      return;
    }

    const nextLine = scene.dialogQueue.shift();
    scene.renderDialogLine(nextLine.text, nextLine.phase, nextLine.payload);
  }

  handleDialogInput() {
    const scene = this.scene;
    if (Phaser.Input.Keyboard.JustDown(scene.keyENTER)) {
      this.showNextDialogLine();
    }
  }
}

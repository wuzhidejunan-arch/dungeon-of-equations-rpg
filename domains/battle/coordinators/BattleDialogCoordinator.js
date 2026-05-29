import { battleMenuStates } from '../../../data/battleStates.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import { getBattleTutorialConfig } from '../../../engine/tutorialFlowController.js';
import { getSafeBattleSkillHint } from '../../../utils/battleSchema.js';

export class BattleDialogCoordinator {
  constructor({ scene }) {
    this.scene = scene;
  }

  startBattleIntro() {
    const scene = this.scene;
    const isGuidedBattle = Boolean(scene?.isTrainingGuideBattle?.());
    const tutorialConfig = isGuidedBattle ? getBattleTutorialConfig(scene) : null;
    const isSimpleGuidedBattle = isGuidedBattle
      && scene.difficultyKey === 'beginner'
      && tutorialConfig?.guideMode !== 'challenge_overview'
      && tutorialConfig?.requiredSkillStrategy !== 'armor_break_then_heavy';

    if (scene.battlePresentation && !isGuidedBattle) {
      return scene.battlePresentation.startBattleIntro();
    }

    const introLines = isSimpleGuidedBattle
      ? [
          { phase: battleResultPhases.INFO, text: `A wild ${scene.enemy.name} appeared!` },
          { phase: battleResultPhases.INFO, text: 'HP means health. If HP reaches 0, you lose.' },
          { phase: battleResultPhases.INFO, text: 'Step 1: Choose Fight.' },
          { phase: battleResultPhases.INFO, text: 'Step 2: Choose the correct attack skill.' },
          { phase: battleResultPhases.INFO, text: 'Step 3: Make an even number.' },
          { phase: battleResultPhases.INFO, text: 'Now choose Fight.' },
        ]
      : isGuidedBattle
      ? [
          { phase: battleResultPhases.INFO, text: `A wild ${scene.enemy.name} appeared!` },
          { phase: battleResultPhases.INFO, text: 'HP means health. If HP reaches 0, you lose.' },
          { phase: battleResultPhases.INFO, text: 'Mini-step 1: Read the monster rule first.' },
          { phase: battleResultPhases.INFO, text: 'This monster starts with armor, so use Armor Break first.' },
          { phase: battleResultPhases.INFO, text: 'Next, make an even number and read what happened.' },
          { phase: battleResultPhases.INFO, text: 'Now choose Fight.' },
        ]
      : [
          { phase: battleResultPhases.INFO, text: `A wild ${scene.enemy.name} appeared!` },
          { phase: battleResultPhases.INFO, text: 'Battle start!' },
          { phase: battleResultPhases.INFO, text: 'Choose Fight, Bag, or Run.' },
        ];

    const safeHint = getSafeBattleSkillHint({
      enemy: scene.enemy,
      skills: scene.playerSkills,
      difficultyKey: scene.difficultyKey,
    });
    if (safeHint) {
      introLines.push(
        { phase: battleResultPhases.INFO, text: safeHint.tipText },
        { phase: battleResultPhases.INFO, text: safeHint.instructionText },
      );
    }

    this.showDialogSequence(introLines, () => {
      scene.showMainMenu();
      const promptText = isSimpleGuidedBattle
        ? 'Step 1: Choose Fight.'
        : isGuidedBattle
          ? 'Mini-step 1: Choose Fight.'
          : 'Choose Fight, Bag, or Run.';
      scene.renderResultText(promptText, battleResultPhases.INFO);
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
    if (scene.feedbackDelayActive) return;
    const enterPressed = Phaser.Input.Keyboard.JustDown(scene.keyENTER);
    const guidedSpacePressed = scene.isTrainingGuideBattle?.()
      && scene.keySPACE
      && Phaser.Input.Keyboard.JustDown(scene.keySPACE);

    if (enterPressed || guidedSpacePressed) {
      scene.acknowledgeTrainingGuideDialog?.();
      this.showNextDialogLine();
    }
  }
}

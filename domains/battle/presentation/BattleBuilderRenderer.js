import { battleMenuStates } from '../../../data/battleStates.js';
import { battleResultPhases } from '../../../data/battlePhases.js';
import { getBattleText } from '../../../utils/battleSchema.js';
import { applyBuilderLayout } from '../../../engine/builderController.js';

export class BattleBuilderRenderer {
  constructor(scene) {
    this.scene = scene;
  }

  open(viewState) {
    const scene = this.scene;
    scene.selectedAction = viewState.actionType;
    scene.hideSkillMenuUI?.();
    scene.hideCommandCursor?.();
    scene.builderActive = true;
    scene.setBattleMenuState?.(battleMenuStates.BUILDER);
    scene.turnNumbers = viewState.turnNumbers || [];

    scene.resetBuilderSlots?.(true);
    scene.clearBuilderCards?.();
    scene.createBuilderCards?.();
    scene.clearBuilderSlots?.();
    applyBuilderLayout(scene);
    scene.builderFeedbackText?.setText?.('');
    scene.builderFeedbackText?.setVisible?.(false);

    scene.renderBuilderHeader?.(viewState.selectedSkill, scene.enemy);
    scene.renderTipText?.('');
    scene.renderResultText?.(viewState.promptText, battleResultPhases.INFO, { skill: viewState.selectedSkill?.name });
    scene.addBattleLog?.(getBattleText('logs.builderOpened', `Player opened ${viewState.actionType} math boxes.`, { action: viewState.actionType }));
  }

  close({ resetAction = true } = {}) {
    const scene = this.scene;
    scene.builderActive = false;
    scene.setBattleMenuState?.(battleMenuStates.MAIN);
    if (resetAction) {
      scene.selectedAction = null;
    }

    scene.resetBuilderSlots?.(false);
    scene.clearBuilderCards?.();
    scene.showMainMenu?.();
    scene.refreshPreview?.();
  }

  hideAfterConfirm() {
    const scene = this.scene;
    scene.builderActive = false;
    scene.resetBuilderSlots?.(false);
    scene.clearBuilderCards?.();
    scene.setBuilderVisible?.(false);
    scene.refreshPreview?.();
  }

  refreshPreview() {
    const scene = this.scene;

    if (scene.builderMode === 'chained') {
      const step1LeftCard = scene.builderSlots?.step1Left?.assignedCard;
      const step1OpCard = scene.builderSlots?.step1Op?.assignedCard;
      const step1RightCard = scene.builderSlots?.step1Right?.assignedCard;
      const step2OpCard = scene.builderSlots?.step2Op?.assignedCard;
      const step2RightCard = scene.builderSlots?.step2Right?.assignedCard;

      scene.renderBuilderPreview?.({
        step1ResultText: '?',
        step2CarryText: '?',
        finalResultText: '?',
      });

      if (!scene.builderActive) {
        return null;
      }

      if (!step1LeftCard || !step1OpCard || !step1RightCard) {
        return null;
      }

      const chained = scene.calculateChainedExpression?.(
        step1LeftCard.value,
        step1OpCard.value,
        step1RightCard.value,
        step2OpCard?.value,
        step2RightCard?.value,
      ) || { step1Result: null, finalResult: null };

      scene.renderBuilderPreview?.({
        step1ResultText: chained.step1Result ?? '?',
        step2CarryText: chained.step1Result ?? '?',
        finalResultText: step2OpCard && step2RightCard ? (chained.finalResult ?? '?') : '?',
      });
      return null;
    }

    const leftCard = scene.builderSlots?.left?.assignedCard;
    const opCard = scene.builderSlots?.op?.assignedCard;
    const rightCard = scene.builderSlots?.right?.assignedCard;

    scene.renderBuilderPreview?.('?');

    if (!scene.builderActive) {
      return null;
    }

    if (!leftCard || !opCard || !rightCard) {
      return null;
    }

    scene.calculateExpression?.(leftCard.value, opCard.value, rightCard.value);
    return null;
  }
}

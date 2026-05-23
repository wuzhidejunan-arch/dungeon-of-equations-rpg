import {
  assignCardToSlot,
  clearBuilderCards,
  clearBuilderSlots,
  closeBuilder,
  confirmBuilderAction,
  createBuilderCards,
  createBuilderUI,
  handleBuilderInput,
  hideBuilderAfterConfirm,
  openBuilder,
  refreshBuilderPreview,
  registerBuilderDragHandlers,
  resetBuilderSlots,
  resetCardPosition,
  returnToSkillMenu,
  tryPlaceCardInSlot,
} from '../../../engine/builderController.js';
import { battleBuilderModes } from '../../../config/battleBuilderModes.js';

export class BattleBuilderCoordinator {
  constructor({ scene }) {
    this.scene = scene;
  }

  createBuilderUI() {
    return createBuilderUI(this.scene);
  }

  registerDragHandlers() {
    return registerBuilderDragHandlers(this.scene);
  }

  handleBuilderInput() {
    return handleBuilderInput(this.scene);
  }

  openBuilder(actionType) {
    switch (this.scene.builderMode) {
      case battleBuilderModes.SINGLE_LINE:
        return this.openSingleLineBuilder(actionType);
      case battleBuilderModes.CHAINED:
        return this.openReservedChainedBuilder(actionType);
      default:
        return this.openSingleLineBuilder(actionType);
    }
  }

  openSingleLineBuilder(actionType) {
    return this.scene.battlePresentation?.openBuilder?.(actionType) || openBuilder(this.scene, actionType);
  }

  openReservedChainedBuilder(actionType) {
    return this.scene.battlePresentation?.openBuilder?.(actionType) || openBuilder(this.scene, actionType);
  }

  closeBuilder(resetAction = true) {
    return this.scene.battlePresentation?.closeBuilder?.({ resetAction }) || closeBuilder(this.scene, resetAction);
  }

  hideBuilderAfterConfirm() {
    return this.scene.battlePresentation?.hideBuilderAfterConfirm?.() || hideBuilderAfterConfirm(this.scene);
  }

  resetBuilderSlots(visible = false) {
    return resetBuilderSlots(this.scene, visible);
  }

  clearBuilderCards() {
    return clearBuilderCards(this.scene);
  }

  createBuilderCards() {
    return createBuilderCards(this.scene);
  }

  tryPlaceCardInSlot(pointer, card) {
    return tryPlaceCardInSlot(this.scene, pointer, card);
  }

  assignCardToSlot(card, slot) {
    return assignCardToSlot(this.scene, card, slot);
  }

  resetCardPosition(card) {
    return resetCardPosition(this.scene, card);
  }

  clearBuilderSlots() {
    return clearBuilderSlots(this.scene);
  }

  returnToSkillMenu() {
    return returnToSkillMenu(this.scene);
  }

  refreshPreview() {
    return this.scene.battlePresentation?.refreshBuilderPreview?.() || refreshBuilderPreview(this.scene);
  }

  confirmBuilderAction() {
    return confirmBuilderAction(this.scene);
  }
}

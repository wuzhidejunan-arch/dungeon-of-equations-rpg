import { battleMenuStates } from '../../../data/battleStates.js';
import {
  handleBuilderInput,
  handleDialogInput,
  handleItemMenuInput,
  handleItemTargetMenuInput,
  handleMainMenuInput,
  handleSkillMenuInput,
} from '../handlers/BattleInputHandlers.js';

export class BattleInputSystem {
  constructor({ scene }) {
    this.scene = scene;
  }

  resolveHandler() {
    if (this.scene.builderActive || this.scene.isBattleMenuState?.(battleMenuStates.BUILDER)) {
      return handleBuilderInput;
    }

    const handlers = {
      [battleMenuStates.DIALOG]: handleDialogInput,
      [battleMenuStates.MAIN]: handleMainMenuInput,
      [battleMenuStates.ITEM]: handleItemMenuInput,
      [battleMenuStates.ITEM_TARGET]: handleItemTargetMenuInput,
      [battleMenuStates.SKILL]: handleSkillMenuInput,
    };

    return handlers[this.scene.menuState] || null;
  }

  process() {
    const handler = this.resolveHandler();
    if (typeof handler === 'function') {
      return handler(this.scene);
    }
    return null;
  }
}

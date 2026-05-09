import { battleMenuStates } from '../data/battleStates.js';

export function isConfirmPressed(scene) {
  return Phaser.Input.Keyboard.JustDown(scene.keyENTER);
}

export function isBackPressed(scene) {
  return Phaser.Input.Keyboard.JustDown(scene.keyESC);
}

export function isClearPressed(scene) {
  return Phaser.Input.Keyboard.JustDown(scene.keyC);
}

export function isDirectionPressed(scene, direction) {
  const keyMap = {
    up: scene.keyUP,
    down: scene.keyDOWN,
    left: scene.keyLEFT,
    right: scene.keyRIGHT,
  };

  const key = keyMap[direction];
  return key ? Phaser.Input.Keyboard.JustDown(key) : false;
}

export function moveMenuIndex(_scene, currentIndex, count, offset) {
  if (!count || count <= 0) return 0;
  return (currentIndex + offset + count) % count;
}

export function getBattleInputHandler(scene) {
  if (scene.battleController?.inputSystem) {
    return scene.battleController.inputSystem.resolveHandler();
  }

  if (scene.builderActive || scene.isBattleMenuState(battleMenuStates.BUILDER)) {
    return scene.handleBuilderInput;
  }

  const handlers = {
    [battleMenuStates.DIALOG]: scene.handleDialogInput,
    [battleMenuStates.MAIN]: scene.handleMainMenuInput,
    [battleMenuStates.ITEM]: scene.handleItemMenuInput,
    [battleMenuStates.ITEM_TARGET]: scene.handleItemTargetMenuInput,
    [battleMenuStates.SKILL]: scene.handleSkillMenuInput,
  };

  return handlers[scene.menuState] || null;
}

export function processBattleInput(scene) {
  if (scene.battleController?.inputSystem) {
    return scene.battleController.inputSystem.process();
  }

  const handler = getBattleInputHandler(scene);
  if (typeof handler === 'function') {
    handler.call(scene, scene);
  }
}

export function processDirectionInput(scene, mapping = {}) {
  const checks = [
    ['up', mapping.up],
    ['down', mapping.down],
    ['left', mapping.left],
    ['right', mapping.right],
  ];

  for (const [direction, callback] of checks) {
    if (typeof callback === 'function' && isDirectionPressed(scene, direction)) {
      callback.call(scene);
      return true;
    }
  }

  return false;
}

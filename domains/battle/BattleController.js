import { BattleInputSystem } from './systems/BattleInputSystem.js';
import { BattleOutcomeSystem } from './systems/BattleOutcomeSystem.js';
import { BattleAttackSystem } from './systems/BattleAttackSystem.js';
import { BattleEnemyTurnSystem } from './systems/BattleEnemyTurnSystem.js';
import { BattleItemSystem } from './systems/BattleItemSystem.js';
import { BattleEffectSystem } from './systems/BattleEffectSystem.js';
import {
  getTutorialBackRestriction,
  getTutorialCommandRestriction,
  getTutorialSkillRestriction,
} from '../../engine/tutorialFlowController.js';

export class BattleController {
  constructor({ scene, store, eventBus, registries = {} }) {
    this.scene = scene;
    this.store = store;
    this.eventBus = eventBus;
    this.registries = registries;
    this.inputSystem = new BattleInputSystem({ scene, controller: this, registries });
    this.attackSystem = new BattleAttackSystem({ scene, registries });
    this.enemyTurnSystem = new BattleEnemyTurnSystem({ scene, registries });
    this.itemSystem = new BattleItemSystem({ scene, registries });
    this.effectSystem = new BattleEffectSystem({ scene, registries });
    this.outcomeSystem = new BattleOutcomeSystem({ scene, controller: this, registries });
    this.featureRegistry = scene?.battleFeatures || scene?.game?.app?.container?.get?.('battleFeatureRegistry') || null;
  }

  start() {
    this.featureRegistry?.runHook?.('onBattleStart', this.scene?.battleFeatureContext || this.featureRegistry?.createContext?.({ scene: this.scene, controller: this, store: this.store }), { scene: this.scene, controller: this });

    this.eventBus?.emit('battle:started', {
      scene: this.scene,
      enemyKey: this.scene.enemyKey,
      state: this.store?.getState?.(),
    });
  }

  processCurrentInput() {
    const context = this.scene?.battleFeatureContext || this.featureRegistry?.createContext?.({
      scene: this.scene,
      controller: this,
      store: this.store,
      app: this.scene?.game?.app || null,
    });

    this.featureRegistry?.runHook?.('beforeProcessInput', context, { scene: this.scene, controller: this });
    if (context?.handled) {
      return context.value;
    }

    const result = this.inputSystem.process();
    context && (context.value = result);
    this.featureRegistry?.runHook?.('afterProcessInput', context, { scene: this.scene, controller: this, result });
    return context?.value;
  }

  chooseEnemySkill() {
    return this.enemyTurnSystem?.chooseSkill?.() || null;
  }

  isConfirmPressed() {
    return Phaser.Input.Keyboard.JustDown(this.scene.keyENTER);
  }

  isBackPressed() {
    return Phaser.Input.Keyboard.JustDown(this.scene.keyESC);
  }

  isClearPressed() {
    return Phaser.Input.Keyboard.JustDown(this.scene.keyC);
  }

  isDirectionPressed(direction) {
    const keyMap = {
      up: this.scene.keyUP,
      down: this.scene.keyDOWN,
      left: this.scene.keyLEFT,
      right: this.scene.keyRIGHT,
    };

    const key = keyMap[direction];
    return key ? Phaser.Input.Keyboard.JustDown(key) : false;
  }

  moveMenuIndex(currentIndex, count, offset) {
    if (!count || count <= 0) return 0;
    return (currentIndex + offset + count) % count;
  }

  getCurrentInputHandler() {
    return this.inputSystem?.resolveHandler?.() || null;
  }


  getTutorialCommandRestriction(commandKey) {
    return getTutorialCommandRestriction(this.scene, commandKey);
  }

  getTutorialBackRestriction(location = 'main') {
    return getTutorialBackRestriction(this.scene, location);
  }

  getTutorialSkillRestriction(skill) {
    return getTutorialSkillRestriction(this.scene, skill);
  }

  processDirectionInput(mapping = {}) {
    const checks = [
      ['up', mapping.up],
      ['down', mapping.down],
      ['left', mapping.left],
      ['right', mapping.right],
    ];

    for (const [direction, callback] of checks) {
      if (typeof callback === 'function' && this.isDirectionPressed(direction)) {
        callback.call(this.scene);
        return true;
      }
    }

    return false;
  }


  resolveEnemyTurnOutcome(activeBonus = null) {
    return this.outcomeSystem.resolveEnemyTurnOutcome(activeBonus);
  }

  playEnemyTurnSequence(playerLines = [], activeBonus = null, options = {}) {
    return this.outcomeSystem.playEnemyTurnSequence(playerLines, activeBonus, options);
  }

  resolveAttack(result, expression, operator = null) {
    const context = this.scene?.battleFeatureContext || this.featureRegistry?.createContext?.({ scene: this.scene, controller: this, store: this.store, app: this.scene?.game?.app || null });
    this.featureRegistry?.runHook?.('beforeResolveAttack', context, { scene: this.scene, controller: this, result, expression, operator });
    if (context?.handled) return context.value;

    const resolved = this.outcomeSystem.resolveAttack(result, expression, operator);
    context && (context.value = resolved);
    this.featureRegistry?.runHook?.('afterResolveAttack', context, { scene: this.scene, controller: this, result, expression, operator, resolved });
    return context?.value;
  }

  winBattle() {
    const resolved = this.outcomeSystem.winBattle();
    const context = this.scene?.battleFeatureContext || this.featureRegistry?.createContext?.({ scene: this.scene, controller: this, store: this.store, app: this.scene?.game?.app || null });
    context && (context.value = resolved);
    this.featureRegistry?.runHook?.('afterWinBattle', context, { scene: this.scene, controller: this, resolved });
    return context?.value;
  }

  loseBattle() {
    const resolved = this.outcomeSystem.loseBattle();
    const context = this.scene?.battleFeatureContext || this.featureRegistry?.createContext?.({ scene: this.scene, controller: this, store: this.store, app: this.scene?.game?.app || null });
    context && (context.value = resolved);
    this.featureRegistry?.runHook?.('afterLoseBattle', context, { scene: this.scene, controller: this, resolved });
    return context?.value;
  }

  emitActionResolved(payload = {}) {
    this.eventBus?.emit('battle:actionResolved', {
      scene: this.scene,
      enemyKey: this.scene.enemyKey,
      ...payload,
    });
  }

  emitBattleEnded(payload = {}) {
    this.eventBus?.emit('battle:ended', {
      scene: this.scene,
      enemyKey: this.scene.enemyKey,
      state: this.store?.getState?.(),
      ...payload,
    });
  }
}

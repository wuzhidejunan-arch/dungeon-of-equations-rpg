import { BattleFeatureRegistry } from '../domains/battle/BattleFeatureRegistry.js';

const battleSceneStateSyncFeature = {
  id: 'battle-scene-state-sync',
  order: -100,
  hooks: {
    beforeCreate({ context }) {
      const scene = context.scene;
      if (!scene?.battleStore) return;

      scene.battleStore.bindScene(scene, {
        enemy: ['encounter', 'enemy'],
        enemyCurrentHp: ['battle', 'enemyCurrentHp'],
        battleEnded: ['battle', 'ended'],
        currentTurn: ['battle', 'currentTurn'],
        currentBattleLog: ['battle', 'logs'],
        builderActive: ['builder', 'active'],
        turnNumbers: ['builder', 'turnNumbers'],
        builderCards: ['builder', 'cards'],
        builderSlots: ['builder', 'slots'],
        builderDragObjects: ['builder', 'dragObjects'],
        playerSkills: ['player', 'skills'],
        successfulAttackCount: ['progress', 'successfulAttackCount'],
        pendingBonusChoice: ['progress', 'pendingBonusChoice'],
        nextAttackBonus: ['progress', 'nextAttackBonus'],
        charges: ['status', 'charges'],
        timedBuffs: ['status', 'timedBuffs'],
        enemyTimedDebuffs: ['status', 'enemyTimedDebuffs'],
        menuState: ['menu', 'state'],
        selectedAction: ['menu', 'selectedAction'],
        selectedSkill: ['menu', 'selectedSkill'],
        selectedSkillIndex: ['menu', 'selectedSkillIndex'],
        commandSelectionIndex: ['menu', 'commandSelectionIndex'],
        itemSelectionIndex: ['menu', 'itemSelectionIndex'],
        itemTargetSkillIndex: ['menu', 'itemTargetSkillIndex'],
        selectedItemEntry: ['menu', 'selectedItemEntry'],
        bonusSelectionIndex: ['menu', 'bonusSelectionIndex'],
        dialogQueue: ['dialog', 'queue'],
        dialogCallback: ['dialog', 'callback'],
        resultPhase: ['dialog', 'resultPhase'],
      });
    },
  },
};

const battleLifecycleBridgeFeature = {
  id: 'battle-lifecycle-bridge',
  order: 1000,
  hooks: {
    afterCreate({ context }) {
      context.scene?.battleController?.start?.();
    },
    onShutdown({ context }) {
      context.scene?.battleController?.emitBattleEnded?.({ reason: 'scene_shutdown' });
    },
  },
};

export const defaultBattleFeatureModule = {
  id: 'default-battle-feature-module',
  install({ container }) {
    if (!container.has('battleFeatureRegistry')) {
      container.register('battleFeatureRegistry', new BattleFeatureRegistry());
    }

    const registry = container.get('battleFeatureRegistry');

    if (!registry.getAll().some((feature) => feature.id === battleSceneStateSyncFeature.id)) {
      registry.register(battleSceneStateSyncFeature);
    }

    if (!registry.getAll().some((feature) => feature.id === battleLifecycleBridgeFeature.id)) {
      registry.register(battleLifecycleBridgeFeature);
    }
  },
};

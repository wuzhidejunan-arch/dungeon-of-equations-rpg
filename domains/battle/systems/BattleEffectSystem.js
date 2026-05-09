import { getSkillEffects, getTriggeredEntries } from '../../../utils/battleSchema.js';
import { playerData } from '../../../data/playerData.js';
import { EffectPipeline } from '../effects/EffectPipeline.js';
import { buildEffectContext, formatTemplate } from '../effects/effectUtils.js';
import { checkBattleCondition } from '../../../utils/battleConditions.js';

export class BattleEffectSystem {
  constructor({ scene, registries = {} }) {
    this.scene = scene;
    this.registries = registries;
    this.pipeline = new EffectPipeline({
      handlerRegistry: registries.effectHandlerRegistry || null,
    });
  }

  apply(effect, context = {}, options = {}) {
    return this.pipeline.apply(this.scene, effect, context, options);
  }

  applyList(effects = [], context = {}, options = {}) {
    return this.pipeline.applyList(this.scene, effects, context, options);
  }

  applySkillEffects(skill, context = {}, options = {}) {
    const allEffects = getSkillEffects(skill);
    const filteredEffects = allEffects.filter((effect) => {
      if (options.utilityOnly) return effect?.type !== 'damage_enemy';
      if (options.damageOnly) return effect?.type === 'damage_enemy';
      return true;
    });

    return this.applyList(filteredEffects, { skill, skills: this.scene.playerSkills, ...context }, options);
  }

  applyTriggeredEffects(entity, trigger, context = {}, options = {}) {
    const entries = getTriggeredEntries(entity, trigger);
    const messages = [];
    const results = [];

    entries.forEach((entry) => {
      const fullContext = buildEffectContext(this.scene, {
        ...context,
        trigger,
        scene: this.scene,
        enemy: context.enemy || this.scene.enemy,
        player: context.player || playerData,
      });

      if (entry.condition && !checkBattleCondition(fullContext, entry.condition)) {
        return;
      }

      if (typeof entry.message === 'string' && entry.message) {
        messages.push(formatTemplate(entry.message, fullContext));
      }

      const applied = this.applyList(entry.effects || [], fullContext, options);
      messages.push(...applied.messages);
      results.push(...applied.results);
    });

    return { messages, results };
  }
}

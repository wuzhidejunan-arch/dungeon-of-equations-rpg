import { checkBattleCondition } from '../../../utils/battleConditions.js';
import { buildEffectContext } from './effectUtils.js';
import { isConditionalEffect, shouldApplyEffect } from './effectHandlers.js';

export class EffectPipeline {
  constructor({ handlerRegistry }) {
    this.handlerRegistry = handlerRegistry;
  }

  apply(scene, effect, context = {}, options = {}) {
    if (!effect || !effect.type) return null;

    const fullContext = buildEffectContext(scene, context);
    if (!shouldApplyEffect(effect, fullContext)) {
      return null;
    }

    if (isConditionalEffect(effect)) {
      const nestedEffects = checkBattleCondition(fullContext, effect.when) ? effect.then : effect.else;
      return this.applyList(scene, nestedEffects || [], fullContext, options);
    }

    const handler = this.handlerRegistry?.get(effect.type);
    if (!handler) {
      return null;
    }

    return handler(scene, effect, fullContext, options);
  }

  applyList(scene, effects = [], context = {}, options = {}) {
    const messages = [];
    const results = [];

    effects.forEach((effect) => {
      const effectResult = this.apply(scene, effect, context, options);
      if (!effectResult) return;

      if (Array.isArray(effectResult.results)) {
        results.push(...effectResult.results);
      } else {
        results.push(effectResult);
      }

      if (Array.isArray(effectResult.messages)) {
        messages.push(...effectResult.messages.filter(Boolean));
      } else if (effectResult?.message) {
        messages.push(effectResult.message);
      }
    });

    return { messages, results };
  }
}

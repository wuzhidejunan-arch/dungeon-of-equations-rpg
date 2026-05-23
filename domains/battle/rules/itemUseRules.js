import { battleResultPhases } from '../../../data/battlePhases.js';
import { battleReturnMenus } from '../../../data/battleStates.js';
import { consumeItem } from '../../../utils/inventory.js';
import { getBattleText, getBattleUIText } from '../../../utils/battleSchema.js';

export function createItemUseRuleContext(scene, payload = {}) {
  return {
    scene,
    payload,
    entry: payload.entry || null,
    targetSkillId: payload.targetSkillId || null,
    result: null,
    response: null,
    stop: false,
    finalResult: null,
  };
}

export function validateSelectedItemRule(ctx) {
  if (ctx.stop) return ctx;

  if (ctx.entry) return ctx;

  ctx.response = {
    success: false,
    message: getBattleUIText('prompts.noItemSelected', 'No item here.'),
    phase: battleResultPhases.RESULT_ITEM,
    reopenMenu: 'item',
  };
  ctx.finalResult = ctx.response;
  ctx.stop = true;
  return ctx;
}

export function consumeBattleItemRule(ctx) {
  if (ctx.stop) return ctx;

  ctx.result = consumeItem(ctx.entry.name, {
    scene: ctx.scene,
    skills: ctx.scene.playerSkills,
    targetSkillId: ctx.targetSkillId,
    applyEffect: (effect, context, options) => ctx.scene.applyEffect(effect, context, options),
  });

  return ctx;
}

export function mapItemResponseRule(ctx) {
  if (ctx.stop) return ctx;

  const reopenMenu = ctx.result?.success
    ? null
    : ctx.entry.definition?.chooseSkillTarget
      ? 'itemTarget'
      : 'item';

  ctx.response = {
    ...(ctx.result || {}),
    phase: battleResultPhases.RESULT_ITEM,
    reopenMenu,
    endTurnLines: [
      { phase: battleResultPhases.RESULT_ITEM, text: ctx.result?.message || '' },
      { phase: battleResultPhases.INFO, text: getBattleText('prompts.battleEndTurn', 'Your turn ended.') },
    ],
    endTurnOptions: {
      returnMenu: battleReturnMenus.MAIN,
      returnPrompt: getBattleUIText('prompts.mainMenu', 'Choose Fight, Bag, or Run.'),
    },
  };

  ctx.finalResult = ctx.response;
  ctx.stop = true;
  return ctx;
}

export function getDefaultItemUseRules() {
  return [
    ['validateSelectedItem', validateSelectedItemRule],
    ['consumeBattleItem', consumeBattleItemRule],
    ['mapItemResponse', mapItemResponseRule],
  ];
}

function allow() {
  return { allowed: true, message: '' };
}

function deny(message) {
  return { allowed: false, message };
}

export function createTutorialRestrictionContext(payload = {}) {
  return {
    scene: payload.scene || null,
    actionType: payload.actionType || 'command',
    value: payload.value || null,
    config: payload.config || null,
    formatter: payload.formatter,
    requiredSkillName: payload.requiredSkillName || 'Even Attack',
    requiredRuleLabel: payload.requiredRuleLabel || 'even',
    result: allow(),
    stop: false,
  };
}

function formatMessage(ctx, key, fallback) {
  return ctx.formatter?.(ctx.scene, key, {
    skill: ctx.requiredSkillName,
    rule: ctx.requiredRuleLabel,
  }, fallback) || fallback;
}

export function noTutorialRestrictionRule(ctx) {
  if (ctx.stop) return ctx;
  if (ctx.config) return ctx;
  ctx.result = allow();
  ctx.stop = true;
  return ctx;
}

export function commandRestrictionRule(ctx) {
  if (ctx.stop || ctx.actionType !== 'command') return ctx;

  const allowedCommands = Array.isArray(ctx.config?.allowedCommands) ? ctx.config.allowedCommands : [];
  if (allowedCommands.includes(ctx.value)) {
    ctx.result = allow();
    ctx.stop = true;
    return ctx;
  }

  const key = ctx.value === 'bag' ? 'lockedBag' : 'lockedRun';
  ctx.result = deny(formatMessage(ctx, key, 'This action is locked.'));
  ctx.stop = true;
  return ctx;
}

export function backRestrictionRule(ctx) {
  if (ctx.stop || ctx.actionType !== 'back') return ctx;

  if (ctx.value === 'builder' && ctx.config?.lockBuilderBack) {
    ctx.result = deny(formatMessage(ctx, 'lockedBuilderBack', 'Stay here and finish the lesson.'));
    ctx.stop = true;
    return ctx;
  }

  if (ctx.value === 'main' && ctx.config?.lockBackToRun) {
    ctx.result = deny(formatMessage(ctx, 'lockedBack', 'Stay in the lesson battle.'));
    ctx.stop = true;
    return ctx;
  }

  ctx.result = allow();
  ctx.stop = true;
  return ctx;
}

export function skillRestrictionRule(ctx) {
  if (ctx.stop || ctx.actionType !== 'skill') return ctx;

  const allowedSkillIds = Array.isArray(ctx.config?.allowedSkillIds) ? ctx.config.allowedSkillIds : [];
  if (allowedSkillIds.includes(ctx.value?.id)) {
    ctx.result = allow();
    ctx.stop = true;
    return ctx;
  }

  ctx.result = deny(formatMessage(ctx, 'wrongSkill', 'Use the right move.'));
  ctx.stop = true;
  return ctx;
}

export function defaultAllowRule(ctx) {
  if (!ctx.stop) {
    ctx.result = allow();
    ctx.stop = true;
  }
  return ctx;
}

export function getDefaultTutorialRestrictionRules() {
  return [
    ['noTutorialRestriction', noTutorialRestrictionRule],
    ['commandRestriction', commandRestrictionRule],
    ['backRestriction', backRestrictionRule],
    ['skillRestriction', skillRestrictionRule],
    ['defaultAllow', defaultAllowRule],
  ];
}

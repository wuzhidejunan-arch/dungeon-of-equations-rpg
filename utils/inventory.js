import { playerData } from '../data/playerData.js';
import { itemDefinitions } from '../data/battleData.js';
import { getBattleSystemText, getItemUIText } from './battleSchema.js';
import { applySkillUseRestore, canRestoreSkillUses, getUnlockedPlayerSkillDefinitions } from './playerSkills.js';
import { getTesterItemQuantity, isTesterMode } from './debugState.js';

function buildRealInventoryMap() {
  return new Map((playerData.inventory || []).map((item) => [item.name, item]));
}

export function getInventoryEntries(options = {}) {
  const {
    includeDefinitions = false,
    includeAllInTesterMode = true,
  } = options;

  const realMap = buildRealInventoryMap();

  if (isTesterMode() && includeAllInTesterMode) {
    return Object.keys(itemDefinitions).map((name, index) => ({
      id: realMap.get(name)?.id ?? `tester-${index}-${name}`,
      name,
      qty: getTesterItemQuantity(),
      definition: includeDefinitions ? getItemDefinition(name) : undefined,
      source: realMap.has(name) ? 'real' : 'tester',
    }));
  }

  return (playerData.inventory || [])
    .filter((entry) => entry.qty > 0)
    .map((entry) => ({
      ...entry,
      definition: includeDefinitions ? getItemDefinition(entry.name) : undefined,
      source: 'real',
    }));
}

export function getInventoryEntry(itemName, options = {}) {
  return getInventoryEntries(options).find((entry) => entry.name === itemName) || null;
}

export function getItemQuantity(itemName) {
  const entry = getInventoryEntry(itemName, { includeAllInTesterMode: true });
  return entry?.qty || 0;
}

export function addItem(itemName, qty = 1) {
  const existingItem = playerData.inventory.find((item) => item.name === itemName);

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    playerData.inventory.push({
      id: Date.now() + Math.random(),
      name: itemName,
      qty,
    });
  }
}

export function removeItem(itemName, qty = 1) {
  if (isTesterMode()) {
    return getItemQuantity(itemName) >= qty;
  }

  const existingItem = playerData.inventory.find((item) => item.name === itemName);

  if (!existingItem) return false;
  if (existingItem.qty < qty) return false;

  existingItem.qty -= qty;

  if (existingItem.qty <= 0) {
    playerData.inventory = playerData.inventory.filter((item) => item.name !== itemName);
  }

  return true;
}

export function getItemDefinition(itemName) {
  return itemDefinitions[itemName] || null;
}

export function isFieldUsableItem(itemName) {
  const itemDefinition = getItemDefinition(itemName);
  if (!itemDefinition || !Array.isArray(itemDefinition.effects)) return false;

  return itemDefinition.effects.every((effect) => effect.type === 'healHp' || effect.type === 'restoreSkillUses');
}

export function getBattleUsableItems() {
  return getInventoryEntries({ includeDefinitions: true })
    .filter((entry) => entry.definition?.battleUsable);
}

function getSkillListForContext(context = {}) {
  return Array.isArray(context.skills) && context.skills.length
    ? context.skills
    : getUnlockedPlayerSkillDefinitions();
}

function applyFieldItemEffect(effect, fullContext, options = {}) {
  const isPreview = Boolean(options.preview);
  if (effect.type === 'healHp') {
    const healAmount = effect.amount || 0;
    const beforeHp = playerData.hp;
    const nextHp = Math.min(playerData.hp + healAmount, playerData.maxHp);
    const actualHeal = nextHp - beforeHp;

    if (actualHeal <= 0) {
      return {
        success: false,
        message: getBattleSystemText('healBlockedFullHp', 'HP is already full.'),
      };
    }

    if (!isPreview) {
      playerData.hp = nextHp;
    }

    return {
      success: true,
      message: getBattleSystemText('healPotion', `Used Potion. Recovered ${actualHeal} HP.`, { amount: actualHeal }),
    };
  }

  if (effect.type === 'restoreSkillUses') {
    const availableSkills = getSkillListForContext(fullContext);
    const targetSkillId = effect.mode === 'target'
      ? fullContext.targetSkillId || null
      : availableSkills.find((skill) => skill.maxPp !== null && skill.pp < skill.maxPp)?.id || null;

    if (!targetSkillId) {
      return {
        success: false,
        message: getBattleSystemText('chooseSkillFirst', 'Choose one skill first.'),
      };
    }

    const restored = isPreview
      ? canRestoreSkillUses(targetSkillId)
      : applySkillUseRestore(targetSkillId, effect.amount);
    return {
      success: restored.success,
      message: restored.message,
    };
  }

  return {
    success: false,
    message: getBattleSystemText('itemBattleOnly', 'This item can only be used in battle.'),
  };
}

export function consumeItem(itemName, context = {}) {
  const item = getInventoryEntry(itemName, { includeAllInTesterMode: true });

  if (!item || item.qty <= 0) {
    return {
      success: false,
      message: getBattleSystemText('itemNotAvailable', `${itemName} is not available.`, { item: itemName }),
    };
  }

  const itemDefinition = itemDefinitions[itemName];

  if (!itemDefinition || !Array.isArray(itemDefinition.effects)) {
    return {
      success: false,
      message: getBattleSystemText('itemCannotUse', 'This item cannot be used.'),
    };
  }

  const fullContext = {
    player: playerData,
    skills: getSkillListForContext(context),
    scene: context.scene || null,
    targetSkillId: context.targetSkillId || null,
  };

  if (!context.applyEffect && !isFieldUsableItem(itemName)) {
    return {
      success: false,
      message: getBattleSystemText('itemBattleOnly', 'This item can only be used in battle.'),
    };
  }

  if (typeof itemDefinition.canUse === 'function' && !itemDefinition.canUse(fullContext)) {
    return {
      success: false,
      message: itemDefinition.failMessage || 'This item cannot be used now.',
    };
  }

  const previewMessages = [];
  for (const effect of itemDefinition.effects) {
    const previewResult = context.applyEffect
      ? context.applyEffect(effect, fullContext, { preview: true })
      : applyFieldItemEffect(effect, fullContext, { preview: true });

    if (previewResult?.success === false) {
      return {
        success: false,
        message: previewResult.message || itemDefinition.failMessage || getBattleSystemText('itemCannotUseNow', 'This item cannot be used now.'),
      };
    }

    if (previewResult?.message) {
      previewMessages.push(previewResult.message);
    }
  }

  if (!removeItem(itemName, 1)) {
    return {
      success: false,
      message: getBattleSystemText('itemNotAvailable', `${itemName} is not available.`, { item: itemName }),
    };
  }

  const messages = [];

  itemDefinition.effects.forEach((effect) => {
    let effectResult = null;

    if (context.applyEffect) {
      effectResult = context.applyEffect(effect, fullContext);
    } else {
      effectResult = applyFieldItemEffect(effect, fullContext);
    }

    if (effectResult?.message) {
      messages.push(effectResult.message);
    }
  });

  return {
    success: true,
    message: messages[0] || previewMessages[0] || getItemUIText(itemDefinition, 'usedText', getBattleSystemText('itemUsed', `Used ${itemName}.`, { item: itemName })),
    messages: messages.length ? messages : previewMessages,
  };
}

export function getInventoryText() {
  const entries = getInventoryEntries({ includeAllInTesterMode: true });
  if (!entries.length) {
    return 'Bag is empty.';
  }

  return entries
    .map((item, index) => `${index + 1}. ${item.name} x${item.qty}`)
    .join('\n');
}

# Closing Refactor Notes

This pass focuses on reducing transition-layer dependence rather than adding more wrappers.

## What was cleaned up

### Battle
- Removed direct `engine/*` imports from these scene mixins:
  - `BattleEnemyFlowMixin`
  - `BattleMenuMixin`
  - `BattleTurnMixin`
  - `BattleInputMixin`
- Moved common runtime input helpers into `BattleController` so input flow now routes through the controller instead of the old router wrapper.
- Added `chooseEnemySkill()` to `BattleEnemyTurnSystem` and exported the shared selector from `enemyTurnRules`, so enemy-turn selection now has a domain entry.
- Kept the legacy engine files in place for compatibility, but they are no longer the preferred path for the mixins above.

### Training / Tutorial
- `TrainingController` now talks to the training presentation facade first for tutorial overlay display/hide.
- `TrainingScene` keeps the facade as the main UI entry and no longer stores direct presenter references as active runtime dependencies.

## Result
This does not make the project “finished,” but it does remove another batch of transition glue and makes the main runtime path more framework-first than engine-wrapper-first.

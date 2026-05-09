# Architecture Notes v14

## What changed
- Added `domains/battle/presentation/BattlePresentationFacade.js`.
- `createBattlePresentationSuite()` now builds and returns a single `battlePresentation` facade.
- `BattleScene` now treats presentation as one suite entry point first, instead of wiring every presenter as the primary path.
- `BattleBuilderMixin`, `BattleMenuMixin`, `BattleDialogMixin`, `BattleCommandMenuMixin`, `BattleSkillMenuMixin`, `BattleTurnMixin`, and `BattleUIMixin` now prefer the facade before falling back to legacy direct presenter references.

## Why this matters
The scene still had direct knowledge of many presenter names. That was better than raw mixins, but still too coupled.

The new facade makes presentation behave more like one installable subsystem:
- scene depends on one presentation entry point
- internal presenters stay swappable
- migration can continue without breaking old paths

## Current status
Battle is now layered across:
- app/module/container
- battle controller/store/systems/pipelines/registries
- effect handlers
- presentation factory + presentation facade + presenters/renderers

## Still not fully done
- Several mixins are still thin wrappers.
- Some presenter methods still reach Phaser nodes through scene references.
- Training/tutorial presentation has not been unified in the same way yet.

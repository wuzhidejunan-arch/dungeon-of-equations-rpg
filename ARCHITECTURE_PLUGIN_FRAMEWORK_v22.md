# Plugin Framework v22

## What changed

This round moves the remaining scene-side UI glue out of `BattleUIMixin` and into a dedicated coordinator.

### New piece
- `domains/battle/coordinators/BattleUiCoordinator.js`

### Updated pieces
- `scenes/BattleScene.js`
- `scenes/battle/BattleUIMixin.js`

## Why this matters

In v21, `BattleScene` already had menu, builder, and dialog coordinators, but the UI layer was still hiding a lot of scene-specific presentation orchestration inside `BattleUIMixin`.

That meant the project still had one oversized fallback mixin sitting between the scene and the newer presentation layer.

In v22:
- `BattleScene` now owns a `battleUiCoordinator` explicitly.
- `BattleUIMixin` is now a thin compatibility wrapper.
- The actual UI orchestration logic lives in one dedicated coordinator instead of a large mixin blob.

## Practical effect

You can now continue the battle refactor in a cleaner direction:
- keep the scene as a shell,
- keep the controller for battle rules,
- keep coordinators for scene-facing flow,
- keep presenters/renderers for display work,
- keep features/modules for plug-in behavior.

## What is still not fully done

This is cleaner, but not final.

Remaining work:
- remove more direct scene-state reads from engine helpers,
- move more layout/status creation logic away from mixins,
- extend the same plug-in pattern further into world/training if you want the whole project to feel consistent.

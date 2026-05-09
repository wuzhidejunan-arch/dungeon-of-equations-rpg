# v21 Plugin Framework Pass

## What changed

This pass moves more battle flow out of `BattleScene`-side mixin logic and into dedicated coordinators.

### New coordinator layer

- `domains/battle/coordinators/BattleMenuCoordinator.js`
- `domains/battle/coordinators/BattleBuilderCoordinator.js`
- `domains/battle/coordinators/BattleDialogCoordinator.js`

## Why this is better

Before v21:
- `BattleScene` still depended on large scene mixins for menu flow, dialog flow, and builder flow.
- The project had plugin hooks, but the scene still owned too much battle behavior.

After v21:
- `BattleScene` instantiates coordinator objects during `init()`.
- Mixins for menu / skill / builder / dialog are now thin delegators.
- The real behavior is concentrated in battle-domain coordinators.

## Practical effect

This means future battle features can be added with less risk because:

1. Scene-facing API stays stable.
2. Core menu / dialog / builder behavior is no longer spread across many mixins.
3. Hook-based battle features can target a more stable battle core.
4. It is now easier to swap a coordinator, wrap it, or extend it with module logic.

## Current structure direction

Recommended long-term direction:

- `Scene` = presentation shell + Phaser lifecycle
- `Coordinator` = scene-facing battle flow orchestration
- `Controller/System` = core battle logic
- `Feature Registry` = pluggable extension points
- `Presentation` = UI rendering and view updates

## Still not final

v21 is better, but not fully finished.

Remaining weak points:
- `BattleUIMixin` is still very large.
- Some utility and engine functions still directly depend on scene state.
- Training / world flow is not yet using the same level of coordinator + feature structure.

## Best next step after v21

The next strongest refactor is:

- move `BattleUIMixin` and part of layout/status rendering into a presentation coordinator or dedicated UI presenters.
- continue reducing direct scene-state mutations from legacy helpers.


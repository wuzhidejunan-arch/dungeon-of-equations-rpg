# v20 Plugin Framework Notes

## What changed

This version moves the project from "scene + mixin expansion" toward a true extension framework.

### New framework layer

- `app/ModuleRegistry.js`
  - now supports `dependsOn`
  - installs modules in dependency order
- `domains/battle/BattleFeatureRegistry.js`
  - central hook registry for battle features
  - supports ordered feature execution
  - supports stop / handled flow control
- `features/defaultBattleFeatureModule.js`
  - boots the battle feature registry
  - registers built-in lifecycle bridge features

### BattleScene role

`BattleScene` is now closer to a presentation shell:

- starts a battle session
- creates layout / UI
- delegates lifecycle hooks to `battleFeatureRegistry`
- relies on `BattleController` for battle flow

### BattleController role

`BattleController` now exposes extension points:

- `beforeProcessInput`
- `afterProcessInput`
- `beforeResolveAttack`
- `afterResolveAttack`
- `afterWinBattle`
- `afterLoseBattle`
- `onBattleStart`

This means you can add battle features without editing `BattleScene.js` every time.

## How to add a new feature

1. Create a module in `features/`
2. Register a feature into `battleFeatureRegistry`
3. Hook into lifecycle points you need
4. Register the module in `main.js`

### Minimal example

```js
export const myBattleFeatureModule = {
  id: 'my-battle-feature-module',
  dependsOn: ['default-battle-feature-module'],
  install({ container }) {
    const registry = container.get('battleFeatureRegistry');

    registry.register({
      id: 'my-battle-feature',
      order: 10,
      hooks: {
        afterResolveAttack({ context, payload }) {
          if (!payload?.resolved?.success) return;
          context.scene.addBattleLog('My feature triggered.');
        },
      },
    });
  },
};
```

## Why this is better

Before this change, adding a new battle mechanic usually meant touching:

- `BattleScene.js`
- one or more mixins
- maybe engine helpers

Now a large class of features can be inserted through modules and hooks first.

That gives you:

- lower coupling
- fewer edits to old files
- easier experimentation
- cleaner future growth for new systems, skills, UI reactions, tutorials, and battle modifiers

## Still not fully finished

This project is now framework-oriented, but not fully pure yet.

The remaining old coupling is mostly in:

- scene mixins that still contain direct scene state logic
- old utility functions that still expect scene-shaped data
- training / world systems that do not yet use the same feature-hook style

## Best next cleanup

If you want the architecture to become even more stable later, the next best move is:

- move more battle menu behavior out of mixins into domain handlers
- give training its own feature registry too
- move reusable UI reactions into presentation feature modules

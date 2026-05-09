# NAIC Framework Refactor v17

## This pass
- TrainingScene no longer owns fallback render logic for menu / lesson / stage / message screens.
- Training presentation now acts as the default rendering path, even when the container factory is unavailable.
- Added `renderCurrentMode()` to the training presentation contract so scene refresh flows through a single facade entry.
- Kept compatibility wrapper methods on `TrainingScene`, but they now delegate directly to the facade instead of containing rendering logic.

## Why it matters
This removes another chunk of scene-owned UI logic from `TrainingScene`. The scene is closer to becoming a composition root plus input surface, while training presentation owns screen rendering decisions.

## Remaining gaps
- `TrainingScene` still exposes compatibility wrapper methods for controller-facing calls.
- Tutorial presentation is still overlay-centric rather than a full tutorial flow suite.
- Training renderer still writes directly to scene nodes, so Phaser-node coupling is reduced but not fully hidden.

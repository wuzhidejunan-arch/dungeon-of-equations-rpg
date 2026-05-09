# NAIC Framework Refactor v16

## This pass

This version continues the framework migration on the training/tutorial side.

### Main structural changes

- Added an independent tutorial presentation suite:
  - `domains/tutorial/presentation/TutorialPresentationFacade.js`
  - `domains/tutorial/presentation/createTutorialPresentationSuite.js`
- Added a tutorial presentation module:
  - `features/defaultTutorialPresentationModule.js`
- Updated training presentation assembly so it now consumes a tutorial presentation factory instead of constructing tutorial overlay presentation inline.
- Expanded `TrainingPresentationFacade` with explicit scene-facing render methods:
  - `renderMenu()`
  - `renderLesson()`
  - `renderStage1Question()`
  - `renderStage2Answer()`
  - `renderStage2Type()`
  - `renderMessage()`
- Expanded `TrainingPresenter` with matching explicit render entry points.
- Updated `TrainingScene` compatibility wrappers to delegate to facade-specific methods first instead of routing everything through `refresh()`.
- Registered tutorial presentation as its own installable module in `main.js`.

## Why this matters

Before this pass, training presentation existed, but tutorial overlay presentation was still being assembled inside training presentation.
That meant tutorial UI was not yet independently installable.

Now:

- training presentation and tutorial presentation are separated more cleanly
- training presentation composes tutorial presentation through a factory/module boundary
- `TrainingScene` depends more on a facade contract and less on ad-hoc render glue

## Current status

Battle already had a stronger app/domain/presentation split.
After v16, training/tutorial are closer to that direction.

Still not fully complete:

- `TrainingScene` still contains compatibility wrapper render methods
- tutorial presentation currently focuses on overlay flow, not a full standalone tutorial suite
- some renderer details are still scene-driven

## Suggested next step

Retire more `TrainingScene` compatibility wrappers and move tutorial flow display beyond overlay-only presentation.

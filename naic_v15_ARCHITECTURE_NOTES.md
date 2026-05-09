# NAIC Framework Refactor v15

## What changed

This pass adds a training/tutorial presentation layer that mirrors the battle-side refactor pattern.

### Added
- `domains/training/presentation/TrainingViewStateBuilder.js`
- `domains/training/presentation/TrainingRenderer.js`
- `domains/training/presentation/TrainingPresenter.js`
- `domains/training/presentation/TrainingPresentationFacade.js`
- `domains/training/presentation/createTrainingPresentationSuite.js`
- `domains/tutorial/presentation/TutorialOverlayRenderer.js`
- `domains/tutorial/presentation/TutorialOverlayPresenter.js`
- `features/defaultTrainingPresentationModule.js`

### Updated
- `main.js`
- `scenes/TrainingScene.js`

## Result

TrainingScene now builds its presentation layer through a container-provided factory instead of directly owning the training UI flow.

The scene can depend on a single `trainingPresentation` facade for:
- screen refresh
- guide intro overlay show/hide

This brings training/tutorial closer to the same architecture already used on the battle side:
- controller/store for flow and state
- registry for content
- presentation factory + facade for UI orchestration

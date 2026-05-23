import { validateBattleDefinitions } from './utils/battleValidator.js';
import { gameConfig } from './config/gameConfig.js';
import { debugConfig } from './config/debugConfig.js';
import { gameScenes } from './scenes/sceneRegistry.js';
import { toggleTesterMode } from './utils/debugState.js';
import { itemDefinitions } from './data/battleData.js';
import { GameApp } from './app/GameApp.js';
import { defaultBattleModule } from './features/defaultBattleModule.js';
import { defaultTrainingModule } from './features/defaultTrainingModule.js';
import { defaultBattleFeatureModule } from './features/defaultBattleFeatureModule.js';
import { defaultBattlePresentationModule } from './features/defaultBattlePresentationModule.js';
import { defaultTrainingPresentationModule } from './features/defaultTrainingPresentationModule.js';
import { defaultTutorialPresentationModule } from './features/defaultTutorialPresentationModule.js';

const app = new GameApp();
app
  .registerModule(defaultBattleModule)
  .registerModule(defaultBattleFeatureModule)
  .registerModule(defaultTrainingModule)
  .registerModule(defaultBattlePresentationModule)
  .registerModule(defaultTutorialPresentationModule)
  .registerModule(defaultTrainingPresentationModule)
  .boot();

const config = {
  ...gameConfig,
  scene: gameScenes,
};

validateBattleDefinitions();

const game = new Phaser.Game(config);
game.app = app;
window.gameApp = app;

window.addEventListener('keydown', (event) => {
  if (event.key !== 'F11') return;

  if (!debugConfig.testModeEnabled) {
    return;
  }

  event.preventDefault();
  const enabled = toggleTesterMode();
  const itemNames = Object.keys(itemDefinitions);
  console.log(enabled ? `Tester Mode ON | Items ready: ${itemNames.length} x100` : 'Tester Mode OFF');
  game.events.emit('tester-mode-changed', enabled);
});

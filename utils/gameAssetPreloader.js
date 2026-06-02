import { preloadSfxAssets } from './sfxManager.js';

export const STARTUP_IMAGE_ASSETS = Object.freeze([
  { key: 'startLevelSelectBg', path: 'assets/images/ui/start_scene/level_select_bg.png' },
  { key: 'startTitleFrame', path: 'assets/images/ui/start_scene/title_frame.png' },
  { key: 'startShieldSword', path: 'assets/images/ui/start_scene/icon_shield_sword.png' },
  { key: 'startShieldBook', path: 'assets/images/ui/start_scene/icon_shield_book.png' },
  { key: 'startShieldSkull', path: 'assets/images/ui/start_scene/icon_shield_skull_transparent.png' },
]);

export function preloadStartupAssets(scene, options = {}) {
  const { includeSfx = true } = options;
  let queuedCount = 0;

  STARTUP_IMAGE_ASSETS.forEach(({ key, path }) => {
    if (!scene.textures.exists(key)) {
      scene.load.image(key, path);
      queuedCount += 1;
    }
  });

  if (includeSfx) {
    queuedCount += preloadSfxAssets(scene) || 0;
  }

  return queuedCount;
}

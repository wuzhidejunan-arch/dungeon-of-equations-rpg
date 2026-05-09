import { audioKeys, audioPaths } from '../config/audioKeys.js';

let currentBgmKey = null;
let currentSound = null;
let pendingUnlockRequest = null;
let unlockListenerAttached = false;

const DEFAULT_BGM_CONFIG = {
  [audioKeys.bgm.normal]: { loop: true, volume: 0.2 },
  [audioKeys.bgm.dungeon]: { loop: true, volume: 0.3 },
  [audioKeys.bgm.battle]: { loop: true, volume: 0.2 },
};

export function preloadBgmAssets(scene, keys = []) {
  if (!scene?.load || !scene?.cache?.audio) return;

  const requestedKeys = Array.isArray(keys) ? keys : [keys];
  const uniqueKeys = requestedKeys.filter((key, index) => key && requestedKeys.indexOf(key) === index);

  uniqueKeys.forEach((key) => {
    const path = audioPaths.bgm[key];
    if (!path) return;

    if (!scene.cache.audio.exists(key)) {
      scene.load.audio(key, path);
    }
  });
}

function isSceneActive(scene) {
  const sceneKey = scene?.sys?.settings?.key || null;
  return !sceneKey || scene.scene?.isActive?.(sceneKey);
}

export function loadAndPlayBgmAfterRender(scene, key, config = {}, retryCount = 0) {
  if (!scene?.load || !scene?.cache?.audio || !key) return;

  if (scene.cache.audio.exists(key)) {
    playBgm(scene, key, config);
    return;
  }

  if (scene.load.isLoading?.()) {
    if (retryCount < 40 && scene.time?.delayedCall) {
      scene.time.delayedCall(250, () => loadAndPlayBgmAfterRender(scene, key, config, retryCount + 1));
    }
    return;
  }

  preloadBgmAssets(scene, key);
  scene.load.once('complete', () => {
    if (!isSceneActive(scene)) return;
    playBgm(scene, key, config);
  });
  scene.load.start();
}

export function playBgm(scene, key, config = {}) {
  if (!scene?.sound || !key) return null;

  if (currentBgmKey === key && currentSound?.isPlaying) {
    return currentSound;
  }

  if (!scene.cache?.audio?.exists(key)) {
    return null;
  }

  if (currentSound) {
    currentSound.stop();
    currentSound.destroy();
    currentSound = null;
    currentBgmKey = null;
  }

  if (scene.sound.locked) {
    pendingUnlockRequest = { scene, key, config };

    if (!unlockListenerAttached) {
      unlockListenerAttached = true;
      scene.sound.once('unlocked', () => {
        unlockListenerAttached = false;
        const request = pendingUnlockRequest;
        pendingUnlockRequest = null;
        if (!request) return;
        playBgm(request.scene, request.key, request.config);
      });
    }

    return null;
  }

  const playbackConfig = {
    ...DEFAULT_BGM_CONFIG[key],
    ...config,
    loop: true,
  };

  try {
    currentSound = scene.sound.add(key, playbackConfig);
    currentSound.play();
    currentBgmKey = key;
    pendingUnlockRequest = null;
    return currentSound;
  } catch (_error) {
    currentBgmKey = null;
    currentSound = null;
    return null;
  }
}

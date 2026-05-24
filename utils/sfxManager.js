import { audioKeys, audioPaths } from '../config/audioKeys.js';

export const sfxDefaults = Object.freeze({
  [audioKeys.sfx.uiMove]: { volume: 0.35, cooldownMs: 80 },
  [audioKeys.sfx.uiConfirm]: { volume: 0.45, cooldownMs: 100 },
  [audioKeys.sfx.uiBack]: { volume: 0.35, cooldownMs: 100 },
  [audioKeys.sfx.answerCorrect]: { volume: 0.5, cooldownMs: 150 },
  [audioKeys.sfx.answerWrong]: { volume: 0.45, cooldownMs: 150 },
  [audioKeys.sfx.playerAttack]: { volume: 0.5, cooldownMs: 100 },
  [audioKeys.sfx.enemyHit]: { volume: 0.42, cooldownMs: 100 },
  [audioKeys.sfx.playerHit]: { volume: 0.45, cooldownMs: 120 },
  [audioKeys.sfx.blocked]: { volume: 0.45, cooldownMs: 120 },
  [audioKeys.sfx.enemyDefeat]: { volume: 0.5, cooldownMs: 220 },
  [audioKeys.sfx.victory]: { volume: 0.52, cooldownMs: 500 },
  [audioKeys.sfx.levelUp]: { volume: 0.55, cooldownMs: 500 },
  [audioKeys.sfx.playerMove]: {
    volume: 0.25,
    cooldownMs: 150,
    maxDurationMs: 300,
    allowOverlap: false,
  },
  [audioKeys.sfx.actionFail]: { volume: 0.45, cooldownMs: 150, allowOverlap: false },
});

const lastPlayedAtByKey = new Map();
const activeSoundsByKey = new Map();

function normalizeKeys(keys) {
  if (!keys) return Object.values(audioKeys.sfx);
  return Array.isArray(keys) ? keys : [keys];
}

export function preloadSfxAssets(scene, keys = null) {
  if (!scene?.load || !scene?.cache?.audio) return;

  normalizeKeys(keys).forEach((key) => {
    const path = audioPaths.sfx?.[key];
    if (!key || !path || scene.cache.audio.exists(key)) return;
    scene.load.audio(key, path);
  });
}

function getNow(scene) {
  return Number(scene?.time?.now) || Date.now();
}

function destroyManagedSound(key, sound) {
  if (activeSoundsByKey.get(key) === sound) {
    activeSoundsByKey.delete(key);
  }

  if (sound && typeof sound.destroy === 'function') {
    sound.destroy();
  }
}

export function playSfx(scene, key, options = {}) {
  if (!scene?.sound || !key) return null;
  if (!scene.cache?.audio?.exists?.(key)) return null;

  const config = {
    ...(sfxDefaults[key] || {}),
    ...options,
  };
  const now = getNow(scene);
  const cooldownMs = Math.max(0, Number(config.cooldownMs) || 0);
  const lastPlayedAt = lastPlayedAtByKey.get(key) || -Infinity;

  if (now - lastPlayedAt < cooldownMs) {
    return null;
  }

  if (config.allowOverlap === false) {
    const activeSound = activeSoundsByKey.get(key);
    if (activeSound?.isPlaying) {
      return null;
    }
  }

  try {
    const sound = scene.sound.add(key, {
      volume: Number.isFinite(config.volume) ? config.volume : 1,
    });
    sound.once?.('complete', () => destroyManagedSound(key, sound));
    sound.play();
    lastPlayedAtByKey.set(key, now);

    if (config.allowOverlap === false) {
      activeSoundsByKey.set(key, sound);
    }

    const maxDurationMs = Number(config.maxDurationMs) || 0;
    if (maxDurationMs > 0 && scene.time?.delayedCall) {
      scene.time.delayedCall(maxDurationMs, () => {
        if (sound?.isPlaying) {
          sound.stop();
        }
        destroyManagedSound(key, sound);
      });
    }

    return sound;
  } catch (error) {
    return null;
  }
}

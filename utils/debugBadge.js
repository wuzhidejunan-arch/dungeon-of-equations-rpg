import { isTesterMode } from './debugState.js';

const defaultStyle = {
  fontSize: '18px',
  color: '#facc15',
  fontStyle: 'bold',
  backgroundColor: '#111827',
  padding: { x: 8, y: 4 },
};

export function createDebugBadge(scene, options = {}) {
  const {
    x = scene.scale.width - 12,
    y = 10,
    text = 'TEST MODE',
    originX = 1,
    originY = 0,
    depth = 3000,
    visible = isTesterMode(),
    style = {},
  } = options;

  return scene.add
    .text(x, y, text, { ...defaultStyle, ...style })
    .setOrigin(originX, originY)
    .setDepth(depth)
    .setVisible(visible);
}

export function syncDebugBadge(badge) {
  if (!badge) return;
  badge.setVisible(isTesterMode());
}

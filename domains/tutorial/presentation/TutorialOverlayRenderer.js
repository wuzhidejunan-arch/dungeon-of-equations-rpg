import { hidePanel, showPanel } from '../../../utils/ui.js';

export class TutorialOverlayRenderer {
  show(scene, panel, text) {
    showPanel(panel, text);
    return text;
  }

  hide(scene, panel) {
    hidePanel(panel);
  }
}

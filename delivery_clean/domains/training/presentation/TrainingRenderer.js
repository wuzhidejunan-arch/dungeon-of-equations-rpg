export class TrainingRenderer {
  getMenuCursorY(scene, viewState) {
    const cursor = viewState?.cursor || {};
    const items = Array.isArray(cursor.menuItems) ? cursor.menuItems : [];
    const selectedIndex = Number.isInteger(cursor.menuIndex) ? cursor.menuIndex : 0;
    const lineHeight = this.getTextLineHeight(scene?.stageListText);

    let precedingLineCount = 0;
    for (let index = 0; index < selectedIndex; index += 1) {
      precedingLineCount += this.getWrappedLineCount(scene?.stageListText, items[index]);
      precedingLineCount += 1;
    }

    return (scene?.stageListText?.y || cursor.y || 0) + (precedingLineCount * lineHeight);
  }

  getTextLineHeight(textNode) {
    if (!textNode) return 0;

    const wrappedLines = textNode.getWrappedText(textNode.text || '');
    const renderedLineCount = Math.max(wrappedLines.length, 1);
    return textNode.height / renderedLineCount;
  }

  getWrappedLineCount(textNode, text = '') {
    if (!textNode) return 0;
    return Math.max(textNode.getWrappedText(text || '').length, 1);
  }

  applyLayout(scene, layoutMode = 'menu') {
    const focused = layoutMode === 'focused';

    scene.listPanel?.setVisible?.(!focused);
    scene.stageListText?.setVisible?.(!focused);

    if (focused) {
      scene.detailPanel?.setPosition?.(384, 176);
      scene.detailPanel?.setSize?.(520, 96);
      scene.contentPanel?.setPosition?.(384, 360);
      scene.contentPanel?.setSize?.(520, 272);
      scene.detailTitleText?.setPosition?.(140, 142);
      scene.detailText?.setPosition?.(140, 172);
      scene.contentText?.setPosition?.(140, 246);
      scene.detailTitleText?.setWordWrapWidth?.(488);
      scene.detailText?.setWordWrapWidth?.(488);
      scene.contentText?.setWordWrapWidth?.(488);
      scene.contentText?.setFontSize?.('17px');
      scene.contentText?.setLineSpacing?.(10);
    } else {
      // Keep the menu detail box anchored to the same top edge, but extend it
      // downward so the longest stage preview and locked note stay inside.
      scene.detailPanel?.setPosition?.(513, 322);
      scene.detailPanel?.setSize?.(440, 330);
      scene.contentPanel?.setPosition?.(488, 352);
      scene.contentPanel?.setSize?.(360, 250);
      scene.detailTitleText?.setPosition?.(324, 172);
      scene.detailText?.setPosition?.(324, 202);
      scene.contentText?.setPosition?.(324, 242);
      scene.detailTitleText?.setWordWrapWidth?.(392);
      scene.detailText?.setWordWrapWidth?.(412);
      scene.contentText?.setWordWrapWidth?.(332);
      scene.contentText?.setFontSize?.('16px');
      scene.contentText?.setLineSpacing?.(8);
    }
  }

  setNodeVisible(node, visible) {
    node?.setVisible?.(visible);
  }

  setText(node, text = '') {
    node?.setText?.(text || '');
  }

  render(scene, viewState) {
    this.applyLayout(scene, viewState?.layoutMode || 'menu');
    this.setText(scene.titleText, viewState?.header?.title || '');
    this.setText(scene.subText, viewState?.header?.subtitle || '');

    this.setNodeVisible(scene.listPanel, Boolean(viewState?.list?.visible));
    this.setNodeVisible(scene.stageListText, Boolean(viewState?.list?.visible));
    this.setText(scene.stageListText, viewState?.list?.text || '');

    this.setNodeVisible(scene.detailPanel, Boolean(viewState?.detail?.visible));
    this.setNodeVisible(scene.detailTitleText, Boolean(viewState?.detail?.visible));
    this.setNodeVisible(scene.detailText, Boolean(viewState?.detail?.visible));
    this.setText(scene.detailTitleText, viewState?.detail?.title || '');
    this.setText(scene.detailText, viewState?.detail?.text || '');

    this.setNodeVisible(scene.contentPanel, Boolean(viewState?.content?.visible));
    this.setNodeVisible(scene.contentText, Boolean(viewState?.content?.visible));
    this.setText(scene.contentText, viewState?.content?.text || '');

    this.setNodeVisible(scene.controlsPanel, true);
    this.setNodeVisible(scene.controlsText, true);
    this.setText(scene.controlsText, viewState?.controls || '');

    this.setNodeVisible(scene.cursorText, Boolean(viewState?.cursor?.visible));
    if (viewState?.cursor?.visible) {
      const cursorY = viewState?.layoutMode === 'menu'
        ? this.getMenuCursorY(scene, viewState)
        : viewState.cursor.y;
      scene.cursorText?.setPosition?.(viewState.cursor.x, cursorY);
    }
  }
}



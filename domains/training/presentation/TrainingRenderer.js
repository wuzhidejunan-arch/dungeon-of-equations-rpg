export class TrainingRenderer {
  static MENU_CURSOR_Y_OFFSET = 3;

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

    return (scene?.stageListText?.y || cursor.y || 0)
      + (precedingLineCount * lineHeight)
      + TrainingRenderer.MENU_CURSOR_Y_OFFSET;
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
    const layout = scene?.trainingLayout || {};
    const menu = layout.menu || {};
    const focusedLayout = layout.focused || {};
    const controls = layout.controls || {};

    scene.listPanel?.setVisible?.(!focused);
    scene.stageListText?.setVisible?.(!focused);
    scene.controlsPanel?.setPosition?.(controls.x || scene.controlsPanel?.x || 0, controls.y || scene.controlsPanel?.y || 0);
    scene.controlsPanel?.setDisplaySize?.(controls.width || scene.controlsPanel?.displayWidth || 0, controls.height || scene.controlsPanel?.displayHeight || 0);
    scene.controlsText?.setPosition?.(
      controls.x || scene.controlsText?.x || 0,
      controls.textY || controls.y || scene.controlsText?.y || 0,
    );

    if (focused) {
      this.setPanelBounds(scene.detailPanel, 480, 225, 620, 86);
      this.setPanelBounds(scene.contentPanel, 480, 360, 620, 290);
      scene.detailTitleText?.setPosition?.(focusedLayout.x || 210, focusedLayout.detailTitleY || 185);
      scene.detailText?.setPosition?.(focusedLayout.x || 210, focusedLayout.detailBodyY || 218);
      scene.contentText?.setPosition?.(focusedLayout.x || 210, focusedLayout.contentY || 300);
      scene.detailTitleText?.setWordWrapWidth?.(focusedLayout.wrapWidth || 580);
      scene.detailText?.setWordWrapWidth?.(focusedLayout.wrapWidth || 580);
      scene.contentText?.setWordWrapWidth?.(focusedLayout.wrapWidth || 580);
      scene.contentText?.setFontSize?.(focusedLayout.fontSize || '18px');
      scene.contentText?.setLineSpacing?.(10);
    } else {
      // Keep the menu detail box anchored to the same top edge, but extend it
      // downward so the longest stage preview and locked note stay inside.
      this.setPanelBounds(scene.detailPanel, 600, 340, 380, 300);
      this.setPanelBounds(scene.contentPanel, 600, 405, 380, 230);
      scene.stageListText?.setPosition?.(menu.listX || 220, menu.listY || 205);
      scene.stageListText?.setWordWrapWidth?.(menu.listWrapWidth || 220);
      scene.detailTitleText?.setPosition?.(menu.detailX || 520, menu.detailTitleY || 205);
      scene.detailText?.setPosition?.(menu.detailX || 520, menu.detailBodyY || 250);
      scene.contentText?.setPosition?.(menu.detailX || 520, menu.detailBodyY || 250);
      scene.detailTitleText?.setWordWrapWidth?.(menu.detailWrapWidth || 350);
      scene.detailText?.setWordWrapWidth?.(menu.detailWrapWidth || 350);
      scene.contentText?.setWordWrapWidth?.(menu.detailWrapWidth || 350);
      scene.contentText?.setFontSize?.('17px');
      scene.contentText?.setLineSpacing?.(9);
    }
  }

  setPanelBounds(node, x, y, width, height) {
    node?.setPosition?.(x, y);
    if (typeof node?.setDisplaySize === 'function') {
      node.setDisplaySize(width, height);
    } else {
      node?.setSize?.(width, height);
    }
  }

  setNodeVisible(node, visible) {
    node?.setVisible?.(visible);
  }

  setText(node, text = '') {
    node?.setText?.(text || '');
  }

  renderContentTextLayout(scene, viewState) {
    const textLayout = viewState?.content?.layout?.text || viewState?.content?.visual?.text || null;
    if (!viewState?.content?.visible || !textLayout) {
      return;
    }

    const focusedLayout = scene?.trainingLayout?.focused || {};
    const defaultTextLayout = focusedLayout?.visual?.text || {};

    scene.contentText?.setPosition?.(
      textLayout.x ?? defaultTextLayout.x ?? focusedLayout.x,
      textLayout.y ?? defaultTextLayout.y ?? focusedLayout.contentY,
    );
    scene.contentText?.setFontSize?.(
      textLayout.fontSize ?? defaultTextLayout.fontSize ?? focusedLayout.fontSize ?? '18px',
    );
    scene.contentText?.setWordWrapWidth?.(
      textLayout.wordWrapWidth ?? defaultTextLayout.wordWrapWidth ?? focusedLayout.wrapWidth,
    );
  }

  renderContentVisual(scene, viewState) {
    const visual = viewState?.content?.visual || null;
    const visualLayout = scene?.trainingLayout?.focused?.visual || {};
    const defaultImageLayout = visualLayout.image || visualLayout;
    const imageLayout = visual?.image || visual || {};
    const hasVisual = Boolean(
      viewState?.content?.visible
        && visual?.key
        && scene?.textures?.exists?.(visual.key),
    );

    if (!hasVisual) {
      this.setNodeVisible(scene.lessonVisualImage, false);
      return;
    }

    scene.lessonVisualImage
      ?.setTexture?.(visual.key)
      ?.setPosition?.(
        imageLayout.x ?? defaultImageLayout.x,
        imageLayout.y ?? defaultImageLayout.y,
      )
      ?.setDisplaySize?.(
        imageLayout.width ?? defaultImageLayout.width,
        imageLayout.height ?? defaultImageLayout.height,
      )
      ?.setVisible?.(true);
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
    this.renderContentTextLayout(scene, viewState);
    this.renderContentVisual(scene, viewState);

    this.setNodeVisible(scene.controlsPanel, true);
    this.setNodeVisible(scene.controlsText, true);
    this.setText(scene.controlsText, viewState?.controls || '');

    this.setNodeVisible(scene.cursorText, Boolean(viewState?.cursor?.visible));
    if (viewState?.cursor?.visible) {
      const cursorY = viewState?.layoutMode === 'menu'
        ? this.getMenuCursorY(scene, viewState)
        : viewState.cursor.y;
      const cursorX = viewState?.layoutMode === 'menu'
        ? (scene?.trainingLayout?.menu?.markerX || viewState.cursor.x)
        : viewState.cursor.x;
      scene.cursorText?.setPosition?.(cursorX, cursorY);
    }
  }
}



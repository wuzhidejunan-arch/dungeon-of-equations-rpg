const BATTLE_SUMMARY_TEXT_LAYOUT = {
  panel: { width: 740, height: 555 },
  resultValue: { x: 300, y: 114, fontSize: '20px' },
  enemyValue: { x: 300, y: 150, fontSize: '20px' },
  correctValue: { x: 300, y: 184, fontSize: '20px' },
  wrongValue: { x: 300, y: 220, fontSize: '20px' },
  mistakesText: { x: 84, y: 290, width: 632, height: 194, fontSize: '17px', lineSpacing: 5 },
};

const ENEMY_STATUS_LAYOUT = {
  panel: { x: 215, y: 92, width: 380, height: 148 },
  name: { x: 70, y: 60, fontSize: '20px' },
  level: { x: 320, y: 60, fontSize: '18px' },
  hpLabel: { x: 60, y: 91, fontSize: '22px' },
  hpBar: { x: 120, y: 99, width: 240, height: 13 },
  hpValue: { x: 310, y: 119, fontSize: '16px' },
  buff: { x: 120, y: 110, fontSize: '12px', lineSpacing: 2, wrapWidth: 268 },
};

const PLAYER_STATUS_LAYOUT = {
  panel: { x: 590, y: 332, width: 380, height: 148 },
  name: { x: 450, y: 300, fontSize: '22px' },
  level: { x: 680, y: 300, fontSize: '18px' },
  hpLabel: { x: 435, y: 331, fontSize: '22px' },
  hpBar: { x: 490, y: 339, width: 240, height: 13 },
  hpValue: { x: 680, y: 359, fontSize: '16px' },
  buff: { x: 490, y: 350, fontSize: '12px', lineSpacing: 2, wrapWidth: 268 },
};

export const BattleLayoutMixin = {
  createBattleLayout() {
    const { width, height } = this.scale;
    const commandMenuTextX = 642;
    const commandMenuCursorX = 618;
    const commandMenuStartY = 450;
    const commandMenuRowSpacing = 43;
    const itemTargetMenuTextX = 610;
    const itemMenuTextX = 620;
    const itemMenuCursorX = 596;
    const itemMenuStartY = 440;
    const itemMenuRowSpacing = 22;
    const skillMenuLeftX = 140;
    const skillMenuRightX = 322;
    const skillMenuStartY = 497;
    const skillMenuRowSpacing = 26;
    const bottomGroupCenterX = 400;
    const bottomPanelY = 495;
    const bottomPanelHeight = 170;
    const bottomPanelGap = 15;
    const leftPanelWidth = 540;
    const rightPanelWidth = 220;
    const commandPanelWidth = 220;
    const commandPanelHeight = 170;
    const dialogPanelWidth = leftPanelWidth + bottomPanelGap + commandPanelWidth;
    const bottomGroupLeft = bottomGroupCenterX - (dialogPanelWidth / 2);
    const leftPanelX = bottomGroupLeft + (leftPanelWidth / 2);
    const rightPanelX = bottomGroupLeft + leftPanelWidth + bottomPanelGap + (commandPanelWidth / 2);
    const dialogPanelX = bottomGroupCenterX;
    const playerStandX = 225;
    const playerStandY = 350;
    const playerCircleW = 300;
    const playerCircleH = 130;
    const enemyStandX = 550;
    const enemyStandY = 220;
    const enemyCircleW = 300;
    const enemyCircleH = 140;
    const panelDepth = 20;
    const uiTextDepth = 30;
    const colors = {
      background: 0x07111f,
      fieldFill: 0x0b1220,
      panelFill: 0x111827,
      panelFillAlt: 0x0f172a,
      panelBorder: 0x64748b,
      panelInner: 0x38bdf8,
      panelTrim: 0xb9823b,
      panelTrimDark: 0x4b3518,
      textPrimary: '#f8fafc',
      textSecondary: '#e2e8f0',
      textMuted: '#cbd5e1',
      hpTrack: 0x1f2937,
      hpFill: 0x22c55e,
      shadow: 0x020617,
      fallbackEnemy: 0x14532d,
      accentGold: 0xfacc15,
    };
    const addCornerAccents = (panel, x, y, panelWidth, panelHeight, accentColor = colors.accentGold, alpha = 0.72) => {
      const left = x - (panelWidth / 2);
      const right = x + (panelWidth / 2);
      const top = y - (panelHeight / 2);
      const bottom = y + (panelHeight / 2);
      const inset = 10;
      const length = Math.min(34, Math.max(18, panelWidth * 0.12));
      const thickness = 3;
      const trimLength = Math.max(34, Math.min(86, panelWidth * 0.26));
      const accents = [
        this.add.rectangle(x, top + 5, trimLength, 2, colors.panelTrimDark, alpha * 0.7),
        this.add.rectangle(x, bottom - 5, trimLength, 2, colors.panelTrimDark, alpha * 0.7),
        this.add.rectangle(left + 6, y, 2, Math.min(54, panelHeight * 0.42), colors.panelTrimDark, alpha * 0.56),
        this.add.rectangle(right - 6, y, 2, Math.min(54, panelHeight * 0.42), colors.panelTrimDark, alpha * 0.56),
        this.add.rectangle(left + inset, top + inset, 7, 7, accentColor, alpha * 0.86),
        this.add.rectangle(right - inset, top + inset, 7, 7, accentColor, alpha * 0.86),
        this.add.rectangle(left + inset, bottom - inset, 7, 7, accentColor, alpha * 0.86),
        this.add.rectangle(right - inset, bottom - inset, 7, 7, accentColor, alpha * 0.86),
        this.add.rectangle(left + inset + (length / 2), top + inset, length, thickness, accentColor, alpha),
        this.add.rectangle(left + inset, top + inset + (length / 2), thickness, length, accentColor, alpha),
        this.add.rectangle(right - inset - (length / 2), top + inset, length, thickness, accentColor, alpha),
        this.add.rectangle(right - inset, top + inset + (length / 2), thickness, length, accentColor, alpha),
        this.add.rectangle(left + inset + (length / 2), bottom - inset, length, thickness, accentColor, alpha),
        this.add.rectangle(left + inset, bottom - inset - (length / 2), thickness, length, accentColor, alpha),
        this.add.rectangle(right - inset - (length / 2), bottom - inset, length, thickness, accentColor, alpha),
        this.add.rectangle(right - inset, bottom - inset - (length / 2), thickness, length, accentColor, alpha),
      ];
      if (panel) {
        const originalSetVisible = panel.setVisible.bind(panel);
        accents.forEach((accent) => accent.setVisible(panel.visible));
        panel.setVisible = (visible) => {
          originalSetVisible(visible);
          accents.forEach((accent) => accent.setVisible(visible));
          return panel;
        };
      }
      return accents;
    };
    const createPanelBox = (textureKey, x, y, panelWidth, panelHeight, visible = true, fallbackFill = colors.panelFill) => {
      const panel = this.textures.exists(textureKey)
        ? this.add.image(x, y, textureKey).setDisplaySize(panelWidth, panelHeight)
        : this.add.rectangle(x, y, panelWidth, panelHeight, fallbackFill).setStrokeStyle(5, colors.panelTrim, 0.92);
      return panel.setDepth(panelDepth).setVisible(visible);
    };
    if (this.textures.exists('battleBgDungeon')) {
      this.add.image(width / 2, height / 2, 'battleBgDungeon').setDisplaySize(width, height);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, colors.background);
    }
    this.add.rectangle(width / 2, 212, width - 72, 322, colors.fieldFill, 0).setStrokeStyle(0, colors.panelBorder, 0);

    this.enemyStatusLayout = ENEMY_STATUS_LAYOUT;
    this.playerStatusLayout = PLAYER_STATUS_LAYOUT;

    this.enemyStatusBox = createPanelBox(
      'battleStatusPanel',
      ENEMY_STATUS_LAYOUT.panel.x,
      ENEMY_STATUS_LAYOUT.panel.y,
      ENEMY_STATUS_LAYOUT.panel.width,
      ENEMY_STATUS_LAYOUT.panel.height,
    );
    this.playerStatusBox = createPanelBox(
      'battleStatusPanel',
      PLAYER_STATUS_LAYOUT.panel.x,
      PLAYER_STATUS_LAYOUT.panel.y,
      PLAYER_STATUS_LAYOUT.panel.width,
      PLAYER_STATUS_LAYOUT.panel.height,
    );

    this.messageBox = createPanelBox('battleMessagePanel', leftPanelX, bottomPanelY, leftPanelWidth, bottomPanelHeight, false);
    this.rulePanelBox = this.add.rectangle(leftPanelX, bottomPanelY, leftPanelWidth, bottomPanelHeight, 0xffffff, 0).setStrokeStyle(0, 0x1a1a1a, 0).setDepth(panelDepth).setVisible(false);
    this.skillListBox = createPanelBox('battleMessagePanel', 274, 566, 506, 78, false, colors.panelFillAlt);
    this.skillPanelBox = createPanelBox('battleMessagePanel', leftPanelX, bottomPanelY, leftPanelWidth, bottomPanelHeight, false);
    this.commandBox = createPanelBox('battleSquarePanel', rightPanelX, bottomPanelY, commandPanelWidth, commandPanelHeight, false);
    this.combinedDialogBox = createPanelBox('battleMessagePanel', dialogPanelX, bottomPanelY, dialogPanelWidth, bottomPanelHeight, false);

    this.enemyNameText = this.add.text(ENEMY_STATUS_LAYOUT.name.x, ENEMY_STATUS_LAYOUT.name.y, '', { fontSize: ENEMY_STATUS_LAYOUT.name.fontSize, color: colors.textPrimary, fontStyle: 'bold' });
    this.enemyLevelText = this.add.text(ENEMY_STATUS_LAYOUT.level.x, ENEMY_STATUS_LAYOUT.level.y, 'Lv5', { fontSize: ENEMY_STATUS_LAYOUT.level.fontSize, color: colors.textSecondary, fontStyle: 'bold' });
    this.enemyHpLabel = this.add.text(ENEMY_STATUS_LAYOUT.hpLabel.x, ENEMY_STATUS_LAYOUT.hpLabel.y, 'HP', { fontSize: ENEMY_STATUS_LAYOUT.hpLabel.fontSize, color: colors.textPrimary, fontStyle: 'bold' });
    this.enemyHpBarBg = this.add.rectangle(ENEMY_STATUS_LAYOUT.hpBar.x, ENEMY_STATUS_LAYOUT.hpBar.y, ENEMY_STATUS_LAYOUT.hpBar.width, ENEMY_STATUS_LAYOUT.hpBar.height, colors.hpTrack).setOrigin(0, 0.5);
    this.enemyHpBarFill = this.add.rectangle(ENEMY_STATUS_LAYOUT.hpBar.x, ENEMY_STATUS_LAYOUT.hpBar.y, ENEMY_STATUS_LAYOUT.hpBar.width, ENEMY_STATUS_LAYOUT.hpBar.height, colors.hpFill).setOrigin(0, 0.5);
    this.enemyInfoText = this.add.text(ENEMY_STATUS_LAYOUT.hpValue.x, ENEMY_STATUS_LAYOUT.hpValue.y, '', { fontSize: ENEMY_STATUS_LAYOUT.hpValue.fontSize, color: colors.textSecondary, fontStyle: 'bold' });
    this.enemyBuffText = this.add.text(ENEMY_STATUS_LAYOUT.buff.x, ENEMY_STATUS_LAYOUT.buff.y, '', {
      fontSize: ENEMY_STATUS_LAYOUT.buff.fontSize,
      color: '#fca5a5',
      fontStyle: 'bold',
      lineSpacing: ENEMY_STATUS_LAYOUT.buff.lineSpacing,
      wordWrap: { width: ENEMY_STATUS_LAYOUT.buff.wrapWidth },
    });

    this.playerNameText = this.add.text(PLAYER_STATUS_LAYOUT.name.x, PLAYER_STATUS_LAYOUT.name.y, 'PLAYER', { fontSize: PLAYER_STATUS_LAYOUT.name.fontSize, color: colors.textPrimary, fontStyle: 'bold' });
    this.playerLevelText = this.add.text(PLAYER_STATUS_LAYOUT.level.x, PLAYER_STATUS_LAYOUT.level.y, '', { fontSize: PLAYER_STATUS_LAYOUT.level.fontSize, color: colors.textSecondary, fontStyle: 'bold' });
    this.playerHpLabel = this.add.text(PLAYER_STATUS_LAYOUT.hpLabel.x, PLAYER_STATUS_LAYOUT.hpLabel.y, 'HP', { fontSize: PLAYER_STATUS_LAYOUT.hpLabel.fontSize, color: colors.textPrimary, fontStyle: 'bold' });
    this.playerHpBarBg = this.add.rectangle(PLAYER_STATUS_LAYOUT.hpBar.x, PLAYER_STATUS_LAYOUT.hpBar.y, PLAYER_STATUS_LAYOUT.hpBar.width, PLAYER_STATUS_LAYOUT.hpBar.height, colors.hpTrack).setOrigin(0, 0.5);
    this.playerHpBarFill = this.add.rectangle(PLAYER_STATUS_LAYOUT.hpBar.x, PLAYER_STATUS_LAYOUT.hpBar.y, PLAYER_STATUS_LAYOUT.hpBar.width, PLAYER_STATUS_LAYOUT.hpBar.height, colors.hpFill).setOrigin(0, 0.5);
    this.playerInfoText = this.add.text(PLAYER_STATUS_LAYOUT.hpValue.x, PLAYER_STATUS_LAYOUT.hpValue.y, '', { fontSize: PLAYER_STATUS_LAYOUT.hpValue.fontSize, color: colors.textSecondary, fontStyle: 'bold' });
    this.playerBuffText = this.add.text(PLAYER_STATUS_LAYOUT.buff.x, PLAYER_STATUS_LAYOUT.buff.y, '', {
      fontSize: PLAYER_STATUS_LAYOUT.buff.fontSize,
      color: '#bbf7d0',
      fontStyle: 'bold',
      lineSpacing: PLAYER_STATUS_LAYOUT.buff.lineSpacing,
      wordWrap: { width: PLAYER_STATUS_LAYOUT.buff.wrapWidth },
    });

    const enemyVisualX = enemyStandX;
    const enemyVisualY = enemyStandY - 26;
    const enemyVisualScale = 1.15;
    const enemyVisualSize = 100 * enemyVisualScale;
    const enemyHasImage = Boolean(this.enemy?.imageKey && this.textures.exists(this.enemy.imageKey));
    const enemyImageDisplay = this.enemy?.imageDisplay || null;
    const enemyImageWidth = (enemyImageDisplay?.width || 100) * enemyVisualScale;
    const enemyImageHeight = (enemyImageDisplay?.height || 100) * enemyVisualScale;
    const enemyImageOffsetX = enemyImageDisplay?.offsetX || 0;
    const enemyImageOffsetY = enemyImageDisplay?.offsetY || 0;
    const enemyShadowOffsetY = enemyImageDisplay?.shadowOffsetY || 0;

    if (this.textures.exists('battleRedMagicCircle')) {
      this.add
        .image(enemyStandX, enemyStandY + enemyShadowOffsetY, 'battleRedMagicCircle')
        .setDisplaySize(enemyCircleW, enemyCircleH)
        .setAlpha(0.82);
    }
    this.enemySpriteShadow = this.add.ellipse(enemyStandX, enemyStandY + enemyShadowOffsetY, enemyCircleW, 45, colors.shadow, 0.34);
    this.enemySpriteImage = enemyHasImage
      ? this.add
        .image(enemyVisualX + enemyImageOffsetX, enemyVisualY + enemyImageOffsetY, this.enemy.imageKey)
        .setDisplaySize(enemyImageWidth, enemyImageHeight)
      : null;
    this.enemySprite = this.add
      .rectangle(enemyVisualX, enemyVisualY, enemyVisualSize, enemyVisualSize, colors.fallbackEnemy)
      .setStrokeStyle(4, colors.panelBorder)
      .setVisible(!enemyHasImage);
    this.enemySpriteText = this.add
      .text(enemyVisualX, enemyVisualY, this.enemy.name, {
        fontSize: '18px',
        color: colors.textPrimary,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 110 },
      })
      .setOrigin(0.5)
      .setVisible(!enemyHasImage);

    const playerVisualX = playerStandX;
    const playerVisualY = playerStandY - 52;

    if (this.textures.exists('battleBlueMagicCircle')) {
      this.add
        .image(playerStandX, playerStandY, 'battleBlueMagicCircle')
        .setDisplaySize(playerCircleW, playerCircleH)
        .setAlpha(0.84);
    }
    this.playerSpriteShadow = this.add.ellipse(playerStandX, playerStandY, playerCircleW, 48, colors.shadow, 0.34);
    this.playerSprite = this.add.image(playerVisualX, playerVisualY, 'playerBack').setScale(0.16);
    this.playerSpriteText = null;

    this.commandMenuRowPositions = Array.from({ length: 3 }, (_, index) => ({
      textX: commandMenuTextX,
      cursorX: commandMenuCursorX,
      y: commandMenuStartY + (index * commandMenuRowSpacing),
    }));
    this.commandMenuTextPosition = { x: commandMenuTextX, y: commandMenuStartY };
    this.itemTargetMenuTextPosition = { x: itemTargetMenuTextX, y: commandMenuStartY };

    this.commandText = this.add.text(commandMenuTextX, commandMenuStartY, '', {
      fontSize: '17px',
      color: colors.textPrimary,
      fontStyle: 'bold',
      lineSpacing: 16,
      align: 'left',
    });

    this.commandOptionTexts = this.commandMenuRowPositions.map((row) => (
      this.add.text(row.textX, row.y, '', {
        fontSize: '17px',
        color: colors.textPrimary,
        fontStyle: 'bold',
      }).setVisible(false)
    ));

    this.commandCursorText = this.add.text(commandMenuCursorX, commandMenuStartY, '▶', {
      fontSize: '17px',
      color: '#facc15',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setVisible(false);

    this.itemMenuRowConfig = {
      textX: itemMenuTextX,
      cursorX: itemMenuCursorX,
      startY: itemMenuStartY,
      rowSpacing: itemMenuRowSpacing,
    };
    this.itemMenuRowPositions = [];
    this.itemOptionTexts = Array.from({ length: 8 }, () => (
      this.add.text(itemMenuTextX, itemMenuStartY, '', {
        fontSize: '14px',
        color: colors.textPrimary,
        fontStyle: 'bold',
        fontFamily: 'monospace',
      }).setVisible(false)
    ));

    this.dialogContinueText = this.add.text(710, 530, '▼', {
      fontSize: '23px',
      color: '#ffd43b',
      fontStyle: 'bold',
      strokeThickness: 0,
    }).setOrigin(0.5).setVisible(false);

    this.resultText = this.add.text(95, 448, '', {
      fontSize: '18px',
      color: colors.textPrimary,
      fontStyle: 'bold',
      wordWrap: { width: 414 },
      lineSpacing: 12,
    });

    this.ruleText = this.add.text(95, 506, '', {
      fontSize: '13px',
      color: colors.textSecondary,
      fontStyle: 'bold',
      wordWrap: { width: 414 },
      lineSpacing: 7,
    });

    this.tipText = this.add.text(95, 534, '', {
      fontSize: '11px',
      color: colors.textMuted,
      wordWrap: { width: 414 },
      lineSpacing: 5,
    });

    this.skillMenuPositions = [
      { x: skillMenuLeftX, y: skillMenuStartY },
      { x: skillMenuRightX, y: skillMenuStartY },
      { x: skillMenuLeftX, y: skillMenuStartY + skillMenuRowSpacing },
      { x: skillMenuRightX, y: skillMenuStartY + skillMenuRowSpacing },
    ];

    this.skillCursorText = this.add.text(116, skillMenuStartY, '▶', {
      fontSize: '17px',
      color: '#facc15',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setVisible(false);

    this.skillOptionTexts = this.skillMenuPositions.map((position) => (
      this.add.text(position.x, position.y, '', {
        fontSize: '17px',
        color: colors.textPrimary,
        fontStyle: 'bold',
        fontFamily: 'monospace',
      }).setVisible(false)
    ));

    this.skillInfoText = this.add.text(606, 454, '', {
      fontSize: '13px',
      color: colors.textSecondary,
      fontStyle: 'bold',
      lineSpacing: 10,
      fontFamily: 'monospace',
      align: 'left',
      wordWrap: { width: 142 },
    }).setVisible(false);

    [
      this.enemyNameText,
      this.enemyLevelText,
      this.enemyHpLabel,
      this.enemyHpBarBg,
      this.enemyHpBarFill,
      this.enemyInfoText,
      this.enemyBuffText,
      this.playerNameText,
      this.playerLevelText,
      this.playerHpLabel,
      this.playerHpBarBg,
      this.playerHpBarFill,
      this.playerInfoText,
      this.playerBuffText,
      this.commandText,
      this.commandCursorText,
      ...this.commandOptionTexts,
      ...this.itemOptionTexts,
      this.dialogContinueText,
      this.resultText,
      this.ruleText,
      this.tipText,
      this.skillCursorText,
      ...this.skillOptionTexts,
      this.skillInfoText,
    ].filter(Boolean).forEach((node) => node.setDepth(uiTextDepth));

    this.createBattleSummaryModal();

    this.logText = this.add.text(70, 598, '', { fontSize: '1px', color: '#ffffff' }).setVisible(false);
  },

  createBattleSummaryModal() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;
    const panelWidth = BATTLE_SUMMARY_TEXT_LAYOUT.panel.width;
    const panelHeight = BATTLE_SUMMARY_TEXT_LAYOUT.panel.height;
    const modalDepth = 1000;
    const scrollArea = {
      x: BATTLE_SUMMARY_TEXT_LAYOUT.mistakesText.x,
      y: BATTLE_SUMMARY_TEXT_LAYOUT.mistakesText.y,
      width: BATTLE_SUMMARY_TEXT_LAYOUT.mistakesText.width,
      height: BATTLE_SUMMARY_TEXT_LAYOUT.mistakesText.height,
    };
    const valueTextStyle = {
      color: '#fff4c7',
      fontStyle: 'bold',
      fontFamily: 'monospace',
      stroke: '#20140a',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true },
    };

    const overlay = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.62);
    const shadow = this.add.rectangle(centerX + 8, centerY + 8, panelWidth, panelHeight, 0x000000, 0.38);
    const panel = this.textures.exists('battleSummaryPanel')
      ? this.add.image(centerX, centerY, 'battleSummaryPanel').setDisplaySize(panelWidth, panelHeight)
      : this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0x111827, 0.98)
        .setStrokeStyle(5, 0xb9823b, 0.95);

    this.battleSummaryResultValueText = this.add.text(
      BATTLE_SUMMARY_TEXT_LAYOUT.resultValue.x,
      BATTLE_SUMMARY_TEXT_LAYOUT.resultValue.y,
      '',
      { ...valueTextStyle, fontSize: BATTLE_SUMMARY_TEXT_LAYOUT.resultValue.fontSize },
    ).setOrigin(0, 0.5);

    this.battleSummaryEnemyValueText = this.add.text(
      BATTLE_SUMMARY_TEXT_LAYOUT.enemyValue.x,
      BATTLE_SUMMARY_TEXT_LAYOUT.enemyValue.y,
      '',
      { ...valueTextStyle, fontSize: BATTLE_SUMMARY_TEXT_LAYOUT.enemyValue.fontSize },
    ).setOrigin(0, 0.5);

    this.battleSummaryCorrectValueText = this.add.text(
      BATTLE_SUMMARY_TEXT_LAYOUT.correctValue.x,
      BATTLE_SUMMARY_TEXT_LAYOUT.correctValue.y,
      '',
      { ...valueTextStyle, fontSize: BATTLE_SUMMARY_TEXT_LAYOUT.correctValue.fontSize },
    ).setOrigin(0, 0.5);

    this.battleSummaryWrongValueText = this.add.text(
      BATTLE_SUMMARY_TEXT_LAYOUT.wrongValue.x,
      BATTLE_SUMMARY_TEXT_LAYOUT.wrongValue.y,
      '',
      { ...valueTextStyle, fontSize: BATTLE_SUMMARY_TEXT_LAYOUT.wrongValue.fontSize },
    ).setOrigin(0, 0.5);

    this.battleSummaryBodyText = this.add.text(scrollArea.x, scrollArea.y, '', {
      fontSize: BATTLE_SUMMARY_TEXT_LAYOUT.mistakesText.fontSize,
      color: '#fff4d6',
      fontStyle: 'bold',
      fontFamily: 'monospace',
      lineSpacing: BATTLE_SUMMARY_TEXT_LAYOUT.mistakesText.lineSpacing,
      stroke: '#0b1220',
      strokeThickness: 3,
      wordWrap: { width: scrollArea.width },
    });

    this.battleSummaryScrollMaskShape = this.add.graphics()
      .fillStyle(0xffffff, 1)
      .fillRect(scrollArea.x, scrollArea.y, scrollArea.width, scrollArea.height)
      .setVisible(false);
    this.battleSummaryBodyText.setMask(this.battleSummaryScrollMaskShape.createGeometryMask());
    this.battleSummaryScrollArea = scrollArea;
    this.battleSummaryScrollY = 0;
    this.battleSummaryMaxScrollY = 0;

    this.battleSummaryModal = this.add.container(0, 0, [
      overlay,
      shadow,
      panel,
      this.battleSummaryResultValueText,
      this.battleSummaryEnemyValueText,
      this.battleSummaryCorrectValueText,
      this.battleSummaryWrongValueText,
      this.battleSummaryBodyText,
    ]).setDepth(modalDepth).setVisible(false);
    this.battleSummaryScrollMaskShape.setDepth(modalDepth);
    this.battleSummaryModalActive = false;
    this.battleSummaryModalOnClose = null;

    this.battleSummaryWheelHandler = (pointer, gameObjects, deltaX, deltaY, deltaZ, event) => {
      if (!this.battleSummaryModalActive) return;
      event?.preventDefault?.();
      pointer?.event?.preventDefault?.();
      this.scrollBattleSummaryModal(deltaY);
    };
    this.input?.on?.('wheel', this.battleSummaryWheelHandler);
  },

  scrollBattleSummaryModal(deltaY = 0) {
    if (!this.battleSummaryModalActive || !this.battleSummaryBodyText || !this.battleSummaryScrollArea) return;

    const scrollAmount = Math.sign(deltaY) * 28;
    const nextScrollY = this.battleSummaryScrollY + scrollAmount;
    this.setBattleSummaryScrollY(nextScrollY);
  },

  setBattleSummaryScrollY(scrollY = 0) {
    const scrollArea = this.battleSummaryScrollArea;
    if (!scrollArea || !this.battleSummaryBodyText) return;

    const maxScrollY = Math.max(0, Number(this.battleSummaryMaxScrollY) || 0);
    this.battleSummaryScrollY = Phaser.Math.Clamp(scrollY, 0, maxScrollY);
    this.battleSummaryBodyText.setY(scrollArea.y - this.battleSummaryScrollY);
  },

  updateBattleSummaryScrollBounds() {
    const scrollArea = this.battleSummaryScrollArea;
    if (!scrollArea || !this.battleSummaryBodyText) return;

    const contentHeight = this.battleSummaryBodyText.height || 0;
    this.battleSummaryMaxScrollY = Math.max(0, contentHeight - scrollArea.height);
    this.setBattleSummaryScrollY(0);
  },

  formatBattleSummaryExpression(attempt = {}) {
    const expressionText = String(attempt.expression || '').trim();
    const resultText = Number.isFinite(Number(attempt.result)) ? String(Number(attempt.result)) : '';

    if (!expressionText) {
      return resultText ? `Answer = ${resultText}` : 'Answer';
    }

    if (!resultText || expressionText.includes('=')) {
      return expressionText;
    }

    return `${expressionText} = ${resultText}`;
  },

  getBattleSummaryNeededRule(attempt = {}) {
    const reason = String(attempt.reason || '').toLowerCase();
    const skillName = String(attempt.skillName || '').toLowerCase();
    const reasonMatch = reason.match(/needs? (?:an? )?(even|odd|prime|zero)(?: answer| number)?/)
      || reason.match(/not (even|odd|prime|zero)/);

    if (reasonMatch?.[1]) return reasonMatch[1];
    if (skillName.includes('even')) return 'even';
    if (skillName.includes('odd')) return 'odd';
    if (skillName.includes('prime')) return 'prime';
    if (skillName.includes('zero')) return 'zero';
    return null;
  },

  isBattleSummaryPrimeValue(value) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 2) return false;

    for (let divisor = 2; divisor * divisor <= number; divisor += 1) {
      if (number % divisor === 0) return false;
    }
    return true;
  },

  formatBattleSummaryMistakeReason(attempt = {}) {
    const result = Number(attempt.result);
    const resultText = Number.isFinite(result) ? String(result) : 'The answer';
    const neededRule = this.getBattleSummaryNeededRule(attempt);

    if (Number.isFinite(result)) {
      if (neededRule === 'even') {
        return result % 2 !== 0
          ? `${resultText} is odd. This monster needs even.`
          : `${resultText} is not even. This monster needs even.`;
      }

      if (neededRule === 'odd') {
        return result % 2 === 0
          ? `${resultText} is even. This monster needs odd.`
          : `${resultText} is not odd. This monster needs odd.`;
      }

      if (neededRule === 'prime') {
        return this.isBattleSummaryPrimeValue(result)
          ? `${resultText} does not match this monster's rule.`
          : `${resultText} is not prime. This monster needs prime.`;
      }

      if (neededRule === 'zero') {
        return result === 0
          ? `${resultText} does not match this monster's rule.`
          : `${resultText} is not zero. This monster needs zero.`;
      }
    }

    return "The answer does not match this monster's rule.";
  },

  formatBattleSummaryText(summary = {}) {
    const attempts = Array.isArray(summary.attempts) ? summary.attempts : [];
    const mistakes = attempts.filter((attempt) => !attempt?.isCorrect);
    const lines = [];

    if (mistakes.length) {
      mistakes.forEach((attempt, index) => {
        const skillName = attempt?.skillName || 'Skill';
        const expressionText = this.formatBattleSummaryExpression(attempt);
        const reason = this.formatBattleSummaryMistakeReason(attempt);
        lines.push(`${index + 1}. ${skillName} | ${expressionText}`);
        lines.push(`   Blocked: ${reason}`);
        lines.push('');
      });
    } else {
      lines.push('None');
    }

    return lines.join('\n');
  },

  showBattleSummaryModal(summary = {}, onClose = null) {
    if (!this.battleSummaryModal) {
      this.createBattleSummaryModal();
    }

    this.battleSummaryResultValueText?.setText(summary.result || summary.resultLabel || 'Battle Ended');
    this.battleSummaryEnemyValueText?.setText(summary.enemyName || this.enemy?.name || 'Enemy');
    this.battleSummaryCorrectValueText?.setText(String(Number(summary.correct) || 0));
    this.battleSummaryWrongValueText?.setText(String(Number(summary.wrong) || 0));
    this.battleSummaryBodyText?.setText(this.formatBattleSummaryText(summary));
    this.updateBattleSummaryScrollBounds();
    this.battleSummaryModalOnClose = typeof onClose === 'function' ? onClose : null;
    this.battleSummaryModalActive = true;
    this.battleSummaryModal?.setVisible(true);
    this.battleSummaryScrollMaskShape?.setVisible(false);
  },

  hideBattleSummaryModal() {
    this.battleSummaryModal?.setVisible(false);
    this.battleSummaryModalActive = false;
    this.battleSummaryModalOnClose = null;
    this.setBattleSummaryScrollY(0);
  },

  handleBattleSummaryModalInput() {
    if (!this.battleSummaryModalActive) return false;

    const enterPressed = this.keyENTER && Phaser.Input.Keyboard.JustDown(this.keyENTER);
    const spacePressed = this.keySPACE && Phaser.Input.Keyboard.JustDown(this.keySPACE);
    if (!enterPressed && !spacePressed) return false;

    const onClose = this.battleSummaryModalOnClose;
    this.hideBattleSummaryModal();
    if (typeof onClose === 'function') {
      onClose();
    }
    return true;
  },

  createBattleInputs() {
    this.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  },

  getBattleEffectTarget(side) {
    if (side === 'enemy') {
      return this.enemySpriteImage?.visible ? this.enemySpriteImage : this.enemySprite;
    }

    if (side === 'player') {
      return this.playerSprite;
    }

    return null;
  },

  showBattleEffect(textureKey, side, options = {}) {
    if (!this.textures.exists(textureKey)) return;

    const target = this.getBattleEffectTarget(side);
    if (!target) return;

    const x = Number.isFinite(target.x) ? target.x : null;
    const y = Number.isFinite(target.y) ? target.y : null;
    if (x === null || y === null) return;

    const startScale = options.startScale ?? 0.16;
    const endScale = options.endScale ?? 0.22;
    const duration = options.duration ?? 240;
    const effect = this.add
      .image(x, y, textureKey)
      .setOrigin(0.5)
      .setScale(startScale)
      .setAlpha(options.alpha ?? 0.95)
      .setDepth(options.depth ?? 28);

    this.tweens.add({
      targets: effect,
      scale: endScale,
      alpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => effect.destroy(),
    });
  },

  showAttackHitEffect(targetSide) {
    this.showBattleEffect('attackHitSpark', targetSide, {
      startScale: 0.16,
      endScale: 0.23,
      duration: 220,
      alpha: 1,
    });
  },

  showDefenseShieldEffect(actorSide) {
    this.showBattleEffect('defenseShieldFlash', actorSide, {
      startScale: 0.14,
      endScale: 0.2,
      duration: 280,
      alpha: 0.92,
    });
  },
};

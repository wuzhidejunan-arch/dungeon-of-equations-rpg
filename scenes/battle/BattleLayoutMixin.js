export const BattleLayoutMixin = {
  createBattleLayout() {
    const { width, height } = this.scale;
    const commandMenuTextX = 642;
    const commandMenuCursorX = 618;
    const commandMenuStartY = 450;
    const commandMenuRowSpacing = 43;
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
    const enemyStatusX = 215;
    const enemyStatusY = 92;
    const enemyStatusW = 380;
    const enemyStatusH = 148;
    const playerStatusX = 590;
    const playerStatusY = 332;
    const playerStatusW = 380;
    const playerStatusH = 148;
    const hpBarWidth = 220;
    const playerStandX = 225;
    const playerStandY = 360;
    const playerCircleW = 210;
    const playerCircleH = 118;
    const enemyStandX = 585;
    const enemyStandY = 225;
    const enemyCircleW = 190;
    const enemyCircleH = 106;
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
    const getStatusLayout = (x, y, panelWidth, panelHeight) => {
      const left = x - (panelWidth / 2);
      const right = x + (panelWidth / 2);
      const top = y - (panelHeight / 2);
      return {
        nameX: left + 56,
        nameY: top + 30,
        levelX: right - 82,
        levelY: top + 30,
        hpLabelX: left + 56,
        hpLabelY: top + 64,
        hpBarX: left + 108,
        hpBarY: top + 71,
        infoX: left + 258,
        infoY: top + 96,
        buffX: left + 56,
        buffY: top + 100,
        wrapWidth: panelWidth - 112,
      };
    };

    if (this.textures.exists('battleBgDungeon')) {
      this.add.image(width / 2, height / 2, 'battleBgDungeon').setDisplaySize(width, height);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, colors.background);
    }
    this.add.rectangle(width / 2, 212, width - 72, 322, colors.fieldFill, 0).setStrokeStyle(0, colors.panelBorder, 0);

    this.enemyStatusBox = createPanelBox('battleStatusPanel', enemyStatusX, enemyStatusY, enemyStatusW, enemyStatusH);
    this.playerStatusBox = createPanelBox('battleStatusPanel', playerStatusX, playerStatusY, playerStatusW, playerStatusH);

    this.messageBox = createPanelBox('battleMessagePanel', leftPanelX, bottomPanelY, leftPanelWidth, bottomPanelHeight, false);
    this.rulePanelBox = this.add.rectangle(leftPanelX, bottomPanelY, leftPanelWidth, bottomPanelHeight, 0xffffff, 0).setStrokeStyle(0, 0x1a1a1a, 0).setDepth(panelDepth).setVisible(false);
    this.skillListBox = createPanelBox('battleMessagePanel', 274, 566, 506, 78, false, colors.panelFillAlt);
    this.skillPanelBox = createPanelBox('battleMessagePanel', leftPanelX, bottomPanelY, leftPanelWidth, bottomPanelHeight, false);
    this.commandBox = createPanelBox('battleSquarePanel', rightPanelX, bottomPanelY, commandPanelWidth, commandPanelHeight, false);
    this.combinedDialogBox = createPanelBox('battleMessagePanel', dialogPanelX, bottomPanelY, dialogPanelWidth, bottomPanelHeight, false);

    const enemyStatusLayout = getStatusLayout(enemyStatusX, enemyStatusY, enemyStatusW, enemyStatusH);
    const playerStatusLayout = getStatusLayout(playerStatusX, playerStatusY, playerStatusW, playerStatusH);

    this.enemyNameText = this.add.text(enemyStatusLayout.nameX, enemyStatusLayout.nameY, '', { fontSize: '20px', color: colors.textPrimary, fontStyle: 'bold' });
    this.enemyLevelText = this.add.text(enemyStatusLayout.levelX, enemyStatusLayout.levelY, 'Lv5', { fontSize: '17px', color: colors.textSecondary, fontStyle: 'bold' });
    this.enemyHpLabel = this.add.text(enemyStatusLayout.hpLabelX, enemyStatusLayout.hpLabelY, 'HP', { fontSize: '17px', color: colors.textPrimary, fontStyle: 'bold' });
    this.enemyHpBarBg = this.add.rectangle(enemyStatusLayout.hpBarX, enemyStatusLayout.hpBarY, hpBarWidth, 12, colors.hpTrack).setOrigin(0, 0.5);
    this.enemyHpBarFill = this.add.rectangle(enemyStatusLayout.hpBarX, enemyStatusLayout.hpBarY, hpBarWidth, 12, colors.hpFill).setOrigin(0, 0.5);
    this.enemyInfoText = this.add.text(enemyStatusLayout.infoX, enemyStatusLayout.infoY, '', { fontSize: '15px', color: colors.textSecondary, fontStyle: 'bold' });
    this.enemyBuffText = this.add.text(enemyStatusLayout.buffX, enemyStatusLayout.buffY, '', {
      fontSize: '12px',
      color: '#fca5a5',
      fontStyle: 'bold',
      lineSpacing: 2,
      wordWrap: { width: enemyStatusLayout.wrapWidth },
    });

    this.playerNameText = this.add.text(playerStatusLayout.nameX, playerStatusLayout.nameY, 'PLAYER', { fontSize: '20px', color: colors.textPrimary, fontStyle: 'bold' });
    this.playerLevelText = this.add.text(playerStatusLayout.levelX, playerStatusLayout.levelY, '', { fontSize: '17px', color: colors.textSecondary, fontStyle: 'bold' });
    this.playerHpLabel = this.add.text(playerStatusLayout.hpLabelX, playerStatusLayout.hpLabelY, 'HP', { fontSize: '17px', color: colors.textPrimary, fontStyle: 'bold' });
    this.playerHpBarBg = this.add.rectangle(playerStatusLayout.hpBarX, playerStatusLayout.hpBarY, hpBarWidth, 12, colors.hpTrack).setOrigin(0, 0.5);
    this.playerHpBarFill = this.add.rectangle(playerStatusLayout.hpBarX, playerStatusLayout.hpBarY, hpBarWidth, 12, colors.hpFill).setOrigin(0, 0.5);
    this.playerInfoText = this.add.text(playerStatusLayout.infoX, playerStatusLayout.infoY, '', { fontSize: '15px', color: colors.textSecondary, fontStyle: 'bold' });
    this.playerBuffText = this.add.text(playerStatusLayout.buffX, playerStatusLayout.buffY, '', {
      fontSize: '12px',
      color: '#bbf7d0',
      fontStyle: 'bold',
      lineSpacing: 2,
      wordWrap: { width: playerStatusLayout.wrapWidth },
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
    const playerVisualY = playerStandY - 34;

    if (this.textures.exists('battleBlueMagicCircle')) {
      this.add
        .image(playerStandX, playerStandY, 'battleBlueMagicCircle')
        .setDisplaySize(playerCircleW, playerCircleH)
        .setAlpha(0.84);
    }
    this.playerSpriteShadow = this.add.ellipse(playerStandX, playerStandY, playerCircleW, 48, colors.shadow, 0.34);
    this.playerSprite = this.add.image(playerVisualX, playerVisualY, 'playerBack').setScale(0.12);
    this.playerSpriteText = null;

    this.commandMenuRowPositions = Array.from({ length: 3 }, (_, index) => ({
      textX: commandMenuTextX,
      cursorX: commandMenuCursorX,
      y: commandMenuStartY + (index * commandMenuRowSpacing),
    }));

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

    this.logText = this.add.text(70, 598, '', { fontSize: '1px', color: '#ffffff' }).setVisible(false);
  },

  createBattleInputs() {
    this.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  },
};

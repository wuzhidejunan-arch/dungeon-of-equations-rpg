export const BattleLayoutMixin = {
  createBattleLayout() {
    const { width, height } = this.scale;
    const commandMenuTextX = 576;
    const commandMenuCursorX = 556;
    const commandMenuStartY = 468;
    const commandMenuRowSpacing = 39;
    const itemMenuTextX = 576;
    const itemMenuCursorX = 556;
    const itemMenuStartY = 468;
    const itemMenuRowSpacing = 24;
    const skillMenuLeftX = 140;
    const skillMenuRightX = 322;
    const skillMenuStartY = 522;
    const skillMenuRowSpacing = 26;
    const bottomPanelY = 513;
    const bottomPanelHeight = 146;
    const leftPanelX = 274;
    const leftPanelWidth = 506;
    const rightPanelX = 646;
    const rightPanelWidth = 202;
    const dialogPanelX = 384;
    const dialogPanelWidth = 726;

    this.add.rectangle(width / 2, height / 2, width, height, 0xe8e8e8);
    this.add.rectangle(width / 2, 212, width - 72, 322, 0xffffff).setStrokeStyle(4, 0x1a1a1a);

    this.enemyStatusBox = this.add.rectangle(170, 72, 336, 108, 0xffffff).setStrokeStyle(4, 0x1a1a1a);
    this.playerStatusBox = this.add.rectangle(620, 372, 312, 108, 0xffffff).setStrokeStyle(4, 0x1a1a1a);

    this.messageBox = this.add.rectangle(leftPanelX, bottomPanelY, leftPanelWidth, bottomPanelHeight, 0xffffff).setStrokeStyle(4, 0x1a1a1a).setVisible(false);
    this.rulePanelBox = this.add.rectangle(leftPanelX, bottomPanelY, leftPanelWidth, bottomPanelHeight, 0xffffff, 0).setStrokeStyle(0, 0x1a1a1a, 0).setVisible(false);
    this.skillListBox = this.add.rectangle(274, 566, 506, 78, 0xffffff).setStrokeStyle(4, 0x1a1a1a).setVisible(false);
    this.skillPanelBox = this.add.rectangle(leftPanelX, bottomPanelY, leftPanelWidth, bottomPanelHeight, 0xffffff).setStrokeStyle(4, 0x1a1a1a).setVisible(false);
    this.commandBox = this.add.rectangle(rightPanelX, bottomPanelY, rightPanelWidth, bottomPanelHeight, 0xffffff).setStrokeStyle(4, 0x1a1a1a).setVisible(false);
    this.combinedDialogBox = this.add
      .rectangle(dialogPanelX, bottomPanelY, dialogPanelWidth, bottomPanelHeight, 0xffffff)
      .setStrokeStyle(4, 0x1a1a1a)
      .setVisible(false);

    this.enemyNameText = this.add.text(64, 32, '', { fontSize: '22px', color: '#1a1a1a', fontStyle: 'bold' });
    this.enemyLevelText = this.add.text(264, 32, 'Lv5', { fontSize: '16px', color: '#1a1a1a', fontStyle: 'bold' });
    this.enemyHpLabel = this.add.text(64, 66, 'HP', { fontSize: '16px', color: '#1a1a1a', fontStyle: 'bold' });
    this.enemyHpBarBg = this.add.rectangle(114, 72, 180, 12, 0xcfcfcf).setOrigin(0, 0.5);
    this.enemyHpBarFill = this.add.rectangle(114, 72, 180, 12, 0x4caf50).setOrigin(0, 0.5);
    this.enemyInfoText = this.add.text(64, 84, '', { fontSize: '14px', color: '#444444' });
    this.enemyBuffText = this.add.text(64, 100, '', {
      fontSize: '9px',
      color: '#444444',
      fontStyle: 'bold',
      lineSpacing: 0,
      wordWrap: { width: 240 },
    });

    this.playerNameText = this.add.text(520, 338, 'PLAYER', { fontSize: '22px', color: '#1a1a1a', fontStyle: 'bold' });
    this.playerLevelText = this.add.text(710, 338, '', { fontSize: '18px', color: '#1a1a1a', fontStyle: 'bold' });
    this.playerHpLabel = this.add.text(520, 372, 'HP', { fontSize: '16px', color: '#1a1a1a', fontStyle: 'bold' });
    this.playerHpBarBg = this.add.rectangle(570, 378, 178, 12, 0xcfcfcf).setOrigin(0, 0.5);
    this.playerHpBarFill = this.add.rectangle(570, 378, 178, 12, 0x4caf50).setOrigin(0, 0.5);
    this.playerInfoText = this.add.text(520, 392, '', { fontSize: '13px', color: '#444444' });
    this.playerBuffText = this.add.text(520, 408, '', {
      fontSize: '9px',
      color: '#444444',
      fontStyle: 'bold',
      lineSpacing: 0,
      wordWrap: { width: 210 },
    });

    const enemyVisualX = 590;
    const enemyVisualY = 150;
    const enemyVisualSize = 100;
    const enemyHasImage = Boolean(this.enemy?.imageKey && this.textures.exists(this.enemy.imageKey));
    const enemyImageDisplay = this.enemy?.imageDisplay || null;
    const enemyImageWidth = enemyImageDisplay?.width || enemyVisualSize;
    const enemyImageHeight = enemyImageDisplay?.height || enemyVisualSize;
    const enemyImageOffsetX = enemyImageDisplay?.offsetX || 0;
    const enemyImageOffsetY = enemyImageDisplay?.offsetY || 0;
    const enemyShadowOffsetY = enemyImageDisplay?.shadowOffsetY || 0;

    this.enemySpriteShadow = this.add.ellipse(590, 176 + enemyShadowOffsetY, 170, 38, 0xd9d9d9);
    this.enemySpriteImage = enemyHasImage
      ? this.add
        .image(enemyVisualX + enemyImageOffsetX, enemyVisualY + enemyImageOffsetY, this.enemy.imageKey)
        .setDisplaySize(enemyImageWidth, enemyImageHeight)
      : null;
    this.enemySprite = this.add
      .rectangle(enemyVisualX, enemyVisualY, enemyVisualSize, enemyVisualSize, 0x4ade80)
      .setStrokeStyle(4, 0x1a1a1a)
      .setVisible(!enemyHasImage);
    this.enemySpriteText = this.add
      .text(enemyVisualX, enemyVisualY, this.enemy.name, {
        fontSize: '18px',
        color: '#1a1a1a',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 110 },
      })
      .setOrigin(0.5)
      .setVisible(!enemyHasImage);

    const playerVisualX = 220;
    const playerVisualY = 266;

    this.playerSpriteShadow = this.add.ellipse(playerVisualX, 300, 184, 42, 0xd9d9d9);
    this.playerSprite = this.add.image(playerVisualX, playerVisualY, 'playerBack').setScale(0.096);
    this.playerSpriteText = null;

    this.commandMenuRowPositions = Array.from({ length: 3 }, (_, index) => ({
      textX: commandMenuTextX,
      cursorX: commandMenuCursorX,
      y: commandMenuStartY + (index * commandMenuRowSpacing),
    }));

    this.commandText = this.add.text(commandMenuTextX, commandMenuStartY, '', {
      fontSize: '17px',
      color: '#1a1a1a',
      fontStyle: 'bold',
      lineSpacing: 16,
      align: 'left',
    });

    this.commandOptionTexts = this.commandMenuRowPositions.map((row) => (
      this.add.text(row.textX, row.y, '', {
        fontSize: '17px',
        color: '#1a1a1a',
        fontStyle: 'bold',
      }).setVisible(false)
    ));

    this.commandCursorText = this.add.text(commandMenuCursorX, commandMenuStartY, '>', {
      fontSize: '17px',
      color: '#1a1a1a',
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
        color: '#1a1a1a',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      }).setVisible(false)
    ));

    this.dialogContinueText = this.add.text(718, 564, '>', {
      fontSize: '18px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    }).setVisible(false);

    this.resultText = this.add.text(82, 456, '', {
      fontSize: '18px',
      color: '#1a1a1a',
      fontStyle: 'bold',
      wordWrap: { width: 414 },
      lineSpacing: 3,
    });

    this.ruleText = this.add.text(82, 496, '', {
      fontSize: '13px',
      color: '#1a1a1a',
      fontStyle: 'bold',
      wordWrap: { width: 414 },
      lineSpacing: 5,
    });

    this.tipText = this.add.text(82, 542, '', {
      fontSize: '11px',
      color: '#444444',
      wordWrap: { width: 414 },
      lineSpacing: 3,
    });

    this.skillMenuPositions = [
      { x: skillMenuLeftX, y: skillMenuStartY },
      { x: skillMenuRightX, y: skillMenuStartY },
      { x: skillMenuLeftX, y: skillMenuStartY + skillMenuRowSpacing },
      { x: skillMenuRightX, y: skillMenuStartY + skillMenuRowSpacing },
    ];

    this.skillCursorText = this.add.text(114, skillMenuStartY, '>', {
      fontSize: '18px',
      color: '#1a1a1a',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setVisible(false);

    this.skillOptionTexts = this.skillMenuPositions.map((position) => (
      this.add.text(position.x, position.y, '', {
        fontSize: '15px',
        color: '#1a1a1a',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      }).setVisible(false)
    ));

    this.skillInfoText = this.add.text(572, 454, '', {
      fontSize: '13px',
      color: '#1a1a1a',
      fontStyle: 'bold',
      lineSpacing: 10,
      fontFamily: 'monospace',
      align: 'left',
      wordWrap: { width: 142 },
    }).setVisible(false);

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

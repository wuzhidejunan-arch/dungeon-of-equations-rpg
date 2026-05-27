export const battleMenuStates = {
  MAIN: 'main',
  SKILL: 'skill',
  BUILDER: 'builder',
  ITEM: 'item',
  ITEM_TARGET: 'itemTarget',
  DIALOG: 'dialog',
  END: 'battleEnd',
};

export const battleReturnMenus = {
  MAIN: battleMenuStates.MAIN,
  SKILL: battleMenuStates.SKILL,
  ITEM: battleMenuStates.ITEM,
};

export const battleStateConfig = {
  [battleMenuStates.MAIN]: {
    visiblePanels: ['messageBox', 'rulePanelBox', 'commandBox', 'resultText', 'ruleText', 'tipText', 'commandText'],
    cursor: 'command',
    resultTextKey: 'mainMenu',
    commandTextKey: 'mainMenu',
  },
  [battleMenuStates.SKILL]: {
    visiblePanels: ['skillPanelBox', 'commandBox', 'resultText', 'ruleText', 'tipText', 'skillCursorText', 'skillInfoText', 'skillOptionTexts'],
    cursor: 'none',
    resultTextKey: 'skillMenu',
  },
  [battleMenuStates.BUILDER]: {
    visiblePanels: ['builderOverlay', 'builderPanel', 'builderTitleText', 'builderGoalText', 'builderFeedbackText', 'equalsText', 'resultPreviewText'],
    cursor: 'none',
  },
  [battleMenuStates.ITEM]: {
    visiblePanels: ['messageBox', 'rulePanelBox', 'commandBox', 'resultText', 'ruleText', 'tipText', 'commandText'],
    cursor: 'command',
    resultTextKey: 'itemMenu',
  },
  [battleMenuStates.ITEM_TARGET]: {
    visiblePanels: ['messageBox', 'rulePanelBox', 'commandBox', 'resultText', 'ruleText', 'tipText', 'commandText'],
    cursor: 'command',
    resultTextKey: 'itemMenu',
  },
  [battleMenuStates.DIALOG]: {
    visiblePanels: ['combinedDialogBox', 'resultText', 'dialogContinueText'],
    cursor: 'none',
  },
  [battleMenuStates.END]: {
    visiblePanels: ['messageBox', 'resultText'],
    cursor: 'none',
  },
};

export const GUIDE_STEP_IDS = {
  HOME_MOVE: 'home_move',
  HOME_INTERACT: 'home_interact',
  BAG_INTRO: 'bag_intro',
  GO_TRAINING_GROUND: 'go_training_ground',
  TRAINING_INTRO: 'training_intro',
  TRAINING_STAGE_1: 'training_stage_1',
  TRAINING_STAGE_2: 'training_stage_2',
  TRAINING_STAGE_3_INTRO: 'training_stage_3_intro',
  GO_SHOP: 'go_shop',
  SHOP_INTRO: 'shop_intro',
  GO_DUNGEON: 'go_dungeon',
  DUNGEON_INTRO: 'dungeon_intro',
  TUTORIAL_DONE: 'tutorial_done',
};

export const guideSteps = {
  [GUIDE_STEP_IDS.HOME_MOVE]: {
    id: GUIDE_STEP_IDS.HOME_MOVE,
    prompt: 'WASD to move',
    next: GUIDE_STEP_IDS.BAG_INTRO,
  },
  [GUIDE_STEP_IDS.HOME_INTERACT]: {
    id: GUIDE_STEP_IDS.HOME_INTERACT,
    prompt: 'Go to the door',
    allowedTargets: ['exitHome'],
    next: GUIDE_STEP_IDS.GO_TRAINING_GROUND,
  },
  [GUIDE_STEP_IDS.BAG_INTRO]: {
    id: GUIDE_STEP_IDS.BAG_INTRO,
    prompt: 'Press B to open your bag',
    next: GUIDE_STEP_IDS.HOME_INTERACT,
  },
  [GUIDE_STEP_IDS.GO_TRAINING_GROUND]: {
    id: GUIDE_STEP_IDS.GO_TRAINING_GROUND,
    prompt: 'Go to training',
    allowedTargets: ['trainingGround'],
    next: GUIDE_STEP_IDS.TRAINING_INTRO,
    blockedMessages: {
      shop: 'Go to training first.',
      dungeon: 'Go to training first.',
      homeDoor: 'Go to training first.',
      villager1: 'Talk later. Go to training first.',
    },
  },
  [GUIDE_STEP_IDS.TRAINING_INTRO]: {
    id: GUIDE_STEP_IDS.TRAINING_INTRO,
    messageQueue: ['This is training.', 'You will learn the basics here.'],
    next: GUIDE_STEP_IDS.TRAINING_STAGE_1,
  },
  [GUIDE_STEP_IDS.TRAINING_STAGE_1]: {
    id: GUIDE_STEP_IDS.TRAINING_STAGE_1,
    prompt: 'Clear Stage 1 in training',
    next: GUIDE_STEP_IDS.TRAINING_STAGE_2,
  },
  [GUIDE_STEP_IDS.TRAINING_STAGE_2]: {
    id: GUIDE_STEP_IDS.TRAINING_STAGE_2,
    prompt: 'Clear Stage 2 in training',
    next: GUIDE_STEP_IDS.TRAINING_STAGE_3_INTRO,
  },
  [GUIDE_STEP_IDS.TRAINING_STAGE_3_INTRO]: {
    id: GUIDE_STEP_IDS.TRAINING_STAGE_3_INTRO,
    prompt: 'Clear Stage 3 in training',
    messageQueue: ['Now use math in battle.', 'This time, use Fight and Even Attack only.'],
    next: GUIDE_STEP_IDS.GO_SHOP,
  },
  [GUIDE_STEP_IDS.GO_SHOP]: {
    id: GUIDE_STEP_IDS.GO_SHOP,
    prompt: 'Go to the shop',
    allowedTargets: ['shop'],
    blockedMessages: {
      dungeon: 'Go to the shop first.',
      trainingGround: 'Training is done. Go to the shop now.',
      homeDoor: 'Go to the shop first.',
      villager1: 'Talk later. Go to the shop first.',
    },
    next: GUIDE_STEP_IDS.SHOP_INTRO,
  },
  [GUIDE_STEP_IDS.SHOP_INTRO]: {
    id: GUIDE_STEP_IDS.SHOP_INTRO,
    messageQueue: ['This is the shop.', 'You can buy healing items here.', 'Items help you stay in battle longer.'],
    next: GUIDE_STEP_IDS.GO_DUNGEON,
  },
  [GUIDE_STEP_IDS.GO_DUNGEON]: {
    id: GUIDE_STEP_IDS.GO_DUNGEON,
    prompt: 'Go to the dungeon',
    allowedTargets: ['dungeon'],
    blockedMessages: {
      shop: 'Shop is done. Go to the dungeon.',
      trainingGround: 'Go to the dungeon now.',
      homeDoor: 'Go to the dungeon now.',
      villager1: 'Talk later. Go to the dungeon now.',
    },
    next: GUIDE_STEP_IDS.DUNGEON_INTRO,
  },
  [GUIDE_STEP_IDS.DUNGEON_INTRO]: {
    id: GUIDE_STEP_IDS.DUNGEON_INTRO,
    messageQueue: ['This is the dungeon.', 'Stronger monsters are inside.', 'Go in when you are ready.'],
    next: GUIDE_STEP_IDS.TUTORIAL_DONE,
  },
  [GUIDE_STEP_IDS.TUTORIAL_DONE]: {
    id: GUIDE_STEP_IDS.TUTORIAL_DONE,
    prompt: '',
    next: null,
  },
};

export const TRAINING_MODES = {
  MENU: 'menu',
  LESSON: 'lesson',
  STAGE1: 'stage1',
  STAGE2_ANSWER: 'stage2_answer',
  STAGE2_TYPE: 'stage2_type',
  MESSAGE: 'message',
};

export const DEFAULT_TRAINING_ACCESSORS = {
  returnScene: ['navigation', 'returnScene'],
  returnSceneData: ['navigation', 'returnSceneData'],
  demoMode: ['navigation', 'demoMode'],
  demoDifficultyKey: ['navigation', 'demoDifficultyKey'],
  mode: ['ui', 'mode'],
  menuIndex: ['ui', 'menuIndex'],
  lessonPageIndex: ['lesson', 'pageIndex'],
  currentLessonStageId: ['lesson', 'stageId'],
  currentLessonPages: ['lesson', 'pages'],
  stage1Index: ['stage1', 'questionIndex'],
  stage2Index: ['stage2', 'questionIndex'],
  stageOptionIndex: ['selection', 'optionIndex'],
  pendingStage2TypeQuestion: ['stage2', 'pendingTypeQuestion'],
  stage1CorrectCount: ['stage1', 'correctCount'],
  stage2CorrectCount: ['stage2', 'correctCount'],
  stage2CurrentAnswerCorrect: ['stage2', 'currentAnswerCorrect'],
  messageTextValue: ['message', 'text'],
  afterMessageMode: ['message', 'afterMode'],
  guideIntroActive: ['guideIntro', 'active'],
  guideIntroQueue: ['guideIntro', 'queue'],
};

export function createTrainingState(data = {}) {
  return {
    navigation: {
      returnScene: data.returnScene || 'WorldScene',
      returnSceneData: data.returnSceneData || null,
      demoMode: data.demoMode === true,
      demoDifficultyKey: data.demoDifficultyKey || null,
    },
    ui: {
      mode: TRAINING_MODES.MENU,
      menuIndex: 0,
    },
    lesson: {
      pageIndex: 0,
      stageId: null,
      pages: [],
    },
    selection: {
      optionIndex: 0,
    },
    stage1: {
      questionIndex: 0,
      correctCount: 0,
    },
    stage2: {
      questionIndex: 0,
      correctCount: 0,
      currentAnswerCorrect: false,
      pendingTypeQuestion: null,
    },
    message: {
      text: '',
      afterMode: null,
    },
    guideIntro: {
      active: false,
      queue: [],
    },
  };
}

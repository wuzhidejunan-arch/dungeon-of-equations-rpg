import { playerData } from '../../data/playerData.js';
import { enemyData } from '../../data/enemyData.js';
import { saveGame } from '../../utils/saveSystem.js';
import {
  completeTrainingStage,
  ensureTrainingState,
  isTrainingStageCompleted,
  isTrainingStageUnlocked,
} from '../../utils/trainingSystem.js';
import {
  advanceGuideStep,
  ensureGuideState,
  getCurrentGuideStep,
  isTutorialActive,
} from '../../utils/guideSystem.js';
import { GUIDE_STEP_IDS } from '../../data/guideSteps.js';
import { isTesterMode } from '../../utils/debugState.js';
import { TRAINING_MODES } from './TrainingStateFactory.js';
import { audioKeys } from '../../config/audioKeys.js';
import { playSfx } from '../../utils/sfxManager.js';
import { isPrimeNumber } from '../../utils/battleMath.js';

const TYPE_KEYS = ['zero', 'odd', 'even', 'prime'];
const BEGINNER_STAGE2_STEP_TOTAL = 20;

function getPreviousStageShortLabel(stageRegistry, stageId) {
  const stageIds = stageRegistry.getStageIds();
  const index = stageIds.indexOf(stageId);
  if (index <= 0) return 'the previous stage';
  const name = stageRegistry.getStageName(stageIds[index - 1]) || 'the previous stage';
  return name.match(/^Stage\s+\d+/i)?.[0] || name;
}

export class TrainingController {
  constructor({ scene, store, eventBus, stageRegistry }) {
    this.scene = scene;
    this.store = store;
    this.eventBus = eventBus;
    this.stageRegistry = stageRegistry;
  }

  start() {
    ensureTrainingState(playerData);
    ensureGuideState(playerData);
    this.handleReturnedBattleResult();
    this.tryStartGuideIntro();
  }

  get mode() {
    return this.store.get(['ui', 'mode']);
  }

  get isDemoMode() {
    return this.store.get(['navigation', 'demoMode']) === true;
  }

  setMode(mode) {
    this.store.set(['ui', 'mode'], mode);
  }

  setMessage(text, afterMode = TRAINING_MODES.MENU) {
    this.store.patch((state) => {
      state.message.text = text;
      state.message.afterMode = afterMode;
      state.ui.mode = TRAINING_MODES.MESSAGE;
    }, { type: 'training:message' });
  }

  resetStageProgressState() {
    this.store.patch((state) => {
      state.lesson.pageIndex = 0;
      state.selection.optionIndex = 0;
      state.stage1.correctCount = 0;
      state.stage2.correctCount = 0;
      state.stage2.currentAnswerCorrect = false;
      state.stage2.pendingTypeQuestion = null;
      state.stage1.questionIndex = 0;
      state.stage2.questionIndex = 0;
    }, { type: 'training:resetProgress' });
  }

  handleReturnedBattleResult() {
    const state = ensureTrainingState(playerData);
    const activeStageId = state.activeBattleStage;

    if (!activeStageId) {
      return;
    }

    const stageConfig = this.stageRegistry.getStageConfig(activeStageId);
    const winKey = stageConfig?.battle?.winKey || null;

    if (winKey && state.lastBattleWinKey === winKey && !isTrainingStageCompleted(activeStageId)) {
      state.lastBattleWinKey = null;
      state.activeBattleStage = null;

      if (!this.isDemoMode) {
        const reward = completeTrainingStage(activeStageId);
        playerData.pendingLevelUpMessages.push(reward.rewardLines);

        if (activeStageId === 3 && getCurrentGuideStep(playerData).id === GUIDE_STEP_IDS.TRAINING_STAGE_3_INTRO) {
          advanceGuideStep(GUIDE_STEP_IDS.TRAINING_STAGE_3_INTRO, playerData);
        }

        saveGame();
      }
      this.setMessage(this.stageRegistry.getStageClearMessage(activeStageId), TRAINING_MODES.MENU);
      this.eventBus?.emit('training:stageCompleted', { stageId: activeStageId, source: 'battle' });
      return;
    }

    state.activeBattleStage = null;
    state.lastBattleWinKey = null;
    if (!this.isDemoMode) {
      saveGame();
    }
    this.setMessage(this.stageRegistry.getStageFailMessage(activeStageId), TRAINING_MODES.MENU);
  }

  moveMenuCursor(delta) {
    const max = this.stageRegistry.getStageIds().length + 1;
    const current = this.store.get(['ui', 'menuIndex']);
    this.store.set(['ui', 'menuIndex'], (current + delta + max) % max);
  }

  confirmMenu() {
    const stageIds = this.stageRegistry.getStageIds();
    const menuIndex = this.store.get(['ui', 'menuIndex']);

    if (menuIndex === stageIds.length) {
      this.closeTraining();
      return;
    }

    const stageId = stageIds[menuIndex];
    if (!this.isDemoMode && !isTesterMode() && !isTrainingStageUnlocked(stageId)) {
      this.setMessage(
        `${this.stageRegistry.getStageName(stageId)} is locked.\n\nClear ${getPreviousStageShortLabel(this.stageRegistry, stageId)} first.`,
        TRAINING_MODES.MENU,
      );
      return;
    }

    this.resetStageProgressState();
    this.store.patch((state) => {
      state.ui.mode = TRAINING_MODES.LESSON;
      state.lesson.pages = this.stageRegistry.getStageLessonPages(stageId);
      state.lesson.stageId = stageId;
    }, { type: 'training:openLesson', stageId });
  }

  goToPreviousLessonPage() {
    if (this.mode !== TRAINING_MODES.LESSON) return;

    const lessonPageIndex = this.store.get(['lesson', 'pageIndex']);
    if (lessonPageIndex > 0) {
      this.store.set(['lesson', 'pageIndex'], lessonPageIndex - 1);
    }
  }

  continueCurrentFlow() {
    if (this.mode === TRAINING_MODES.MESSAGE) {
      const nextMode = this.store.get(['message', 'afterMode']) || TRAINING_MODES.MENU;
      this.store.patch((state) => {
        state.ui.mode = nextMode;
        state.message.afterMode = null;
      }, { type: 'training:continueMessage', nextMode });
      return;
    }

    const lessonPages = this.store.get(['lesson', 'pages']) || [];
    const lessonPageIndex = this.store.get(['lesson', 'pageIndex']);
    if (lessonPageIndex < lessonPages.length - 1) {
      this.store.set(['lesson', 'pageIndex'], lessonPageIndex + 1);
      return;
    }

    const stageId = this.store.get(['lesson', 'stageId']);
    const stageConfig = this.stageRegistry.getStageConfig(stageId);

    if (stageConfig?.questionMode === 'multiple_choice' || stageId === 1) {
      this.store.patch((state) => {
        state.stage1.questionIndex = 0;
        state.selection.optionIndex = 0;
        state.ui.mode = TRAINING_MODES.STAGE1;
      }, { type: 'training:startStage1', stageId });
      return;
    }

    if (stageConfig?.questionMode === 'answer_then_type' || stageId === 2) {
      this.store.patch((state) => {
        state.stage2.questionIndex = 0;
        state.selection.optionIndex = 0;
        state.stage2.pendingTypeQuestion = null;
        state.ui.mode = TRAINING_MODES.STAGE2_ANSWER;
      }, { type: 'training:startStage2', stageId });
      return;
    }

    if (stageConfig?.battle) {
      this.startBattleStage(stageId);
      return;
    }

    this.setMessage('This stage is not ready yet.', TRAINING_MODES.MENU);
  }

  moveOptionCursor(delta, optionCount) {
    if (!Number.isInteger(optionCount) || optionCount <= 0) {
      const current = this.store.get(['selection', 'optionIndex']);
      if (!Number.isInteger(current) || current !== 0) {
        this.store.set(['selection', 'optionIndex'], 0);
      }
      return;
    }

    const current = this.store.get(['selection', 'optionIndex']);
    const safeCurrent = Number.isInteger(current) && current >= 0 && current < optionCount ? current : 0;
    const normalizedDelta = Number.isFinite(delta) ? Math.trunc(delta) : 0;
    this.store.set(['selection', 'optionIndex'], (safeCurrent + normalizedDelta + optionCount) % optionCount);
  }

  confirmStage1Answer() {
    const stageId = this.store.get(['lesson', 'stageId']);
    const stageConfig = this.stageRegistry.getStageConfig(stageId);
    const questions = this.stageRegistry.getStageQuestions(stageId);
    const passScore = this.stageRegistry.getStagePassScore(stageId);
    const questionIndex = this.store.get(['stage1', 'questionIndex']);
    const optionIndex = this.store.get(['selection', 'optionIndex']);
    const question = questions[questionIndex];
    if (!question) return;

    const isMultipleChoiceStage = stageConfig?.questionMode === 'multiple_choice';
    const pickedValue = question.options?.[optionIndex];
    const selectedTypeKey = TYPE_KEYS[optionIndex] || null;
    const validCategories = !isMultipleChoiceStage
      ? getValidNumberCategories(question.value)
      : [];
    const selectedCategoryLabel = getCategoryLabel(selectedTypeKey);
    const correct = isMultipleChoiceStage
      ? pickedValue === question.answer
      : validCategories.includes(selectedCategoryLabel);
    playSfx(this.scene, correct ? audioKeys.sfx.answerCorrect : audioKeys.sfx.answerWrong);
    const challengeTrainingFeedback = isMultipleChoiceStage && isChallengeTrainingStage(stageId)
      ? buildChallengeTrainingFeedback(stageId, question.expression, question.answer, pickedValue, correct)
      : null;

    this.store.patch((state) => {
      if (correct) {
        state.stage1.correctCount += 1;
      }

      state.message.text = isMultipleChoiceStage
        ? (challengeTrainingFeedback
          || (correct
            ? `Correct. ${question.expression} = ${question.answer}.

Good job. You found the correct total.`
            : `Not quite. ${question.expression} = ${question.answer}, not ${pickedValue}.

Read the expression again and count carefully.`))
        : (correct
          ? buildClassificationSuccessMessage(question.value, selectedCategoryLabel, validCategories)
          : buildClassificationWrongMessage(question.value, validCategories));

      state.stage1.questionIndex += 1;
      state.selection.optionIndex = 0;
    }, { type: 'training:stage1Answered', correct, stageId });

    const nextIndex = this.store.get(['stage1', 'questionIndex']);
    const correctCount = this.store.get(['stage1', 'correctCount']);
    if (nextIndex >= questions.length) {
      const passed = correctCount >= passScore;
      const scoreLine = `You got ${correctCount}/${questions.length}. Need at least ${passScore}/${questions.length}.`;

      if (passed) {
        if (!this.isDemoMode && !isTrainingStageCompleted(stageId)) {
          const reward = completeTrainingStage(stageId);
          playerData.pendingLevelUpMessages.push(reward.rewardLines);
        }
        if (!this.isDemoMode && stageId === 1 && getCurrentGuideStep(playerData).id === GUIDE_STEP_IDS.TRAINING_STAGE_1) {
          advanceGuideStep(GUIDE_STEP_IDS.TRAINING_STAGE_1, playerData);
        }
        if (!this.isDemoMode) {
          saveGame();
        }
        playSfx(this.scene, audioKeys.sfx.victory);
        this.setMessage(`${scoreLine}

${this.stageRegistry.getStageClearMessage(stageId)}`, TRAINING_MODES.MENU);
        this.eventBus?.emit('training:stageCompleted', { stageId, source: 'quiz' });
        return;
      }

      if (!this.isDemoMode) {
        saveGame();
      }
      this.setMessage(
        `${scoreLine}

${this.stageRegistry.getStageFailMessage(stageId, { passScore, total: questions.length })}`,
        TRAINING_MODES.MENU,
      );
      return;
    }

    this.store.patch((state) => {
      state.ui.mode = TRAINING_MODES.MESSAGE;
      state.message.afterMode = TRAINING_MODES.STAGE1;
    }, { type: 'training:stage1NextQuestion', stageId });
  }

  confirmStage2Answer() {
    const questions = this.stageRegistry.getStageQuestions(2);
    const questionIndex = this.store.get(['stage2', 'questionIndex']);
    const optionIndex = this.store.get(['selection', 'optionIndex']);
    const question = questions[questionIndex];
    if (!question) return;

    const pickedValue = question.options[optionIndex];
    const correct = pickedValue === question.answer;
    playSfx(this.scene, correct ? audioKeys.sfx.answerCorrect : audioKeys.sfx.answerWrong);
    const operationText = question.expression.includes('-') ? 'subtraction' : 'addition';

    this.store.patch((state) => {
      if (correct) {
        state.stage2.correctCount += 1;
      }

      state.stage2.pendingTypeQuestion = question;
      state.stage2.currentAnswerCorrect = correct;
      state.selection.optionIndex = 0;
      state.message.text = correct
        ? `Correct. ${question.expression} = ${question.answer}.

You solved the ${operationText}.`
        : `Not quite. ${question.expression} = ${question.answer}, not ${pickedValue}.

Try ${operationText === 'addition' ? 'adding' : 'subtracting'} carefully.`;
      state.ui.mode = TRAINING_MODES.MESSAGE;
      state.message.afterMode = TRAINING_MODES.STAGE2_TYPE;
    }, { type: 'training:stage2AnswerSelected', correct });
  }

  confirmStage2Type() {
    const questions = this.stageRegistry.getStageQuestions(2);
    const passScore = this.stageRegistry.getStagePassScore(2);
    const question = this.store.get(['stage2', 'pendingTypeQuestion']);
    const optionIndex = this.store.get(['selection', 'optionIndex']);
    if (!question) return;

    const selectedTypeKey = TYPE_KEYS[optionIndex] || null;
    const selectedCategoryLabel = getCategoryLabel(selectedTypeKey);
    const validCategories = getValidNumberCategories(question.answer);
    const typeCorrect = validCategories.includes(selectedCategoryLabel);
    playSfx(this.scene, typeCorrect ? audioKeys.sfx.answerCorrect : audioKeys.sfx.answerWrong);

    this.store.patch((state) => {
      state.message.text = typeCorrect
        ? `Correct. That answer is ${selectedCategoryLabel}.`
        : 'Not quite. Check the number kind again.';

      if (typeCorrect) {
        state.stage2.correctCount += 1;
      }

      state.stage2.questionIndex += 1;
      state.stage2.pendingTypeQuestion = null;
      state.stage2.currentAnswerCorrect = false;
      state.selection.optionIndex = 0;
    }, { type: 'training:stage2TypeSelected', typeCorrect });

    const nextIndex = this.store.get(['stage2', 'questionIndex']);
    const correctCount = this.store.get(['stage2', 'correctCount']);
    if (nextIndex >= questions.length) {
      const passed = correctCount >= passScore;
      const scoreLine = `You got ${correctCount}/${BEGINNER_STAGE2_STEP_TOTAL} points. Need ${passScore}/${BEGINNER_STAGE2_STEP_TOTAL} points.`;

      if (passed) {
        if (!this.isDemoMode && !isTrainingStageCompleted(2)) {
          const reward = completeTrainingStage(2);
          playerData.pendingLevelUpMessages.push(reward.rewardLines);
        }
        if (!this.isDemoMode && getCurrentGuideStep(playerData).id === GUIDE_STEP_IDS.TRAINING_STAGE_2) {
          advanceGuideStep(GUIDE_STEP_IDS.TRAINING_STAGE_2, playerData);
        }
        if (!this.isDemoMode) {
          saveGame();
        }
        playSfx(this.scene, audioKeys.sfx.victory);
        this.setMessage(`${scoreLine}\n\n${this.stageRegistry.getStageClearMessage(2)}`, TRAINING_MODES.MENU);
        this.eventBus?.emit('training:stageCompleted', { stageId: 2, source: 'quiz' });
        return;
      }

      if (!this.isDemoMode) {
        saveGame();
      }
      this.setMessage(
        `${scoreLine}\n\n${this.stageRegistry.getStageFailMessage(2, { passScore, total: BEGINNER_STAGE2_STEP_TOTAL })}`,
        TRAINING_MODES.MENU,
      );
      return;
    }

    this.store.patch((state) => {
      state.ui.mode = TRAINING_MODES.MESSAGE;
      state.message.afterMode = TRAINING_MODES.STAGE2_ANSWER;
    }, { type: 'training:stage2NextQuestion' });
  }

  startBattleStage(stageId) {
    const state = ensureTrainingState(playerData);
    const stageBattle = this.stageRegistry.getStageBattleConfig(stageId);
    const battleKey = stageBattle?.enemyKey || `training_stage_${stageId}`;
    const enemyDataKey = stageBattle?.enemyDataKey || 'trainingDummy';

    state.activeBattleStage = stageId;
    state.lastBattleWinKey = null;
    if (!this.isDemoMode) {
      saveGame();
    }

    this.eventBus?.emit('training:stageStarted', { stageId, type: 'battle' });
    this.scene.scene.start('BattleScene', {
      enemy: enemyData[enemyDataKey] || enemyData.trainingDummy,
      enemyKey: battleKey,
      returnScene: 'TrainingScene',
      demoMode: this.isDemoMode,
      returnSceneData: {
        returnScene: this.store.get(['navigation', 'returnScene']),
        returnSceneData: this.store.get(['navigation', 'returnSceneData']),
        demoMode: this.isDemoMode,
        demoDifficultyKey: this.store.get(['navigation', 'demoDifficultyKey']),
      },
    });
  }

  closeTraining() {
    const returnScene = this.store.get(['navigation', 'returnScene']);
    const returnSceneData = this.store.get(['navigation', 'returnSceneData']) || undefined;

    if (this.mode === TRAINING_MODES.MENU) {
      if (!this.isDemoMode) {
        saveGame();
      }
      this.scene.scene.start(returnScene, returnSceneData);
      return;
    }

    if (isTutorialActive(playerData)) {
      const stepId = getCurrentGuideStep(playerData).id;
      const lockedSteps = [
        GUIDE_STEP_IDS.TRAINING_INTRO,
        GUIDE_STEP_IDS.TRAINING_STAGE_1,
        GUIDE_STEP_IDS.TRAINING_STAGE_2,
        GUIDE_STEP_IDS.TRAINING_STAGE_3_INTRO,
      ];

      if (lockedSteps.includes(stepId)) {
        this.setMessage('Finish training first.', TRAINING_MODES.MENU);
        return;
      }
    }

    if (!this.isDemoMode) {
      saveGame();
    }
    this.scene.scene.start(returnScene, returnSceneData);
  }

  tryStartGuideIntro() {
    if (this.isDemoMode) return;
    if (!isTutorialActive(playerData)) return;

    const step = getCurrentGuideStep(playerData);
    if (step.id === GUIDE_STEP_IDS.TRAINING_INTRO && step.messageQueue?.length) {
      this.store.patch((state) => {
        state.guideIntro.queue = [...step.messageQueue];
        state.guideIntro.active = true;
      }, { type: 'training:guideIntroStarted', stepId: step.id });
      this.showNextGuideIntroMessage();
      return;
    }

    if (step.id === GUIDE_STEP_IDS.TRAINING_STAGE_3_INTRO && step.messageQueue?.length && !isTrainingStageCompleted(3)) {
      this.store.patch((state) => {
        state.guideIntro.queue = [...step.messageQueue];
        state.guideIntro.active = true;
      }, { type: 'training:guideIntroStarted', stepId: step.id });
      this.showNextGuideIntroMessage();
    }
  }

  showNextGuideIntroMessage() {
    const queue = [...(this.store.get(['guideIntro', 'queue']) || [])];
    if (!queue.length) {
      this.finishGuideIntro();
      return;
    }

    const message = queue.shift();
    this.store.set(['guideIntro', 'queue'], queue);
    this.scene.trainingPresentation?.showGuideIntro?.(`${message}\n\nPress Enter / Space / E`)
      || this.scene.showGuideIntroPanel?.(`${message}\n\nPress Enter / Space / E`);
  }

  finishGuideIntro() {
    this.scene.trainingPresentation?.hideGuideIntro?.();
    this.store.set(['guideIntro', 'active'], false);

    const current = getCurrentGuideStep(playerData);
    if (current.id === GUIDE_STEP_IDS.TRAINING_INTRO) {
      advanceGuideStep(GUIDE_STEP_IDS.TRAINING_INTRO, playerData);
      if (!this.isDemoMode) {
        saveGame();
      }
    }
  }
}

function labelType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getCategoryLabel(typeKey) {
  switch (typeKey) {
    case 'zero':
      return 'Zero';
    case 'odd':
      return 'Odd';
    case 'even':
      return 'Even';
    case 'prime':
      return 'Prime';
    default:
      return '';
  }
}

function getValidNumberCategories(value) {
  if (value === 0) {
    return ['Zero'];
  }

  if (isPrimeNumber(value)) {
    return ['Prime'];
  }

  if (Math.abs(value % 2) === 1) {
    return ['Odd'];
  }

  return ['Even'];
}

function formatCategoryList(categories = []) {
  if (categories.length <= 1) {
    return categories[0] || '';
  }

  if (categories.length === 2) {
    return `${categories[0]} and ${categories[1]}`;
  }

  return `${categories.slice(0, -1).join(', ')}, and ${categories[categories.length - 1]}`;
}

function buildClassificationSuccessMessage(value, selectedCategoryLabel, validCategories = []) {
  const otherCategories = validCategories.filter((category) => category !== selectedCategoryLabel);

  if (!otherCategories.length) {
    return `Correct. ${value} is ${selectedCategoryLabel}.`;
  }

  return `Correct. ${value} is ${selectedCategoryLabel}, and it is also ${formatCategoryList(otherCategories)}.`;
}

function buildClassificationWrongMessage(value, validCategories = []) {
  return `Not quite. ${value} is ${formatCategoryList(validCategories)}.`;
}

function isChallengeTrainingStage(stageId) {
  return stageId >= 201 && stageId <= 203;
}

function buildChallengeTrainingFeedback(stageId, expression, answer, pickedValue, correct) {
  if (stageId === 201) {
    return buildChallengeStage1Feedback(expression, answer, pickedValue, correct);
  }

  if (stageId === 202) {
    return buildChallengeStage2Feedback(expression, answer, pickedValue, correct);
  }

  return null;
}

function buildChallengeStage1Feedback(expression, answer, pickedValue, correct) {
  const lines = String(expression || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines[0] || '';
  const secondLine = lines[1] || '';
  const row1Answer = extractLastNumber(firstLine) || `${answer}`;
  const cleanSecondLine = secondLine.replace(/\s*=\s*\?$/, '').trim();

  if (cleanSecondLine.startsWith('What number goes first in Row 2?')) {
    return buildChallengeFeedbackMessage([
      correct ? 'Correct.' : 'Not quite.',
      `Row 1 answer is ${row1Answer}.`,
      `Row 2 starts with ${answer}.`,
    ], pickedValue, correct);
  }

  if (cleanSecondLine.startsWith('Then ')) {
    return buildChallengeFeedbackMessage([
      correct ? 'Correct.' : 'Not quite.',
      `${cleanSecondLine.replace(/^Then\s+/, '')} = ${answer}.`,
    ], pickedValue, correct);
  }

  const row2StartMatch = cleanSecondLine.match(/^Can Row 2 start with (.+)\?$/);
  if (row2StartMatch) {
    const candidate = row2StartMatch[1].trim();
    const answerLine = `${String(answer).toLowerCase() === 'yes' ? 'Row 2 can' : 'Row 2 cannot'} start with ${candidate}.`;
    return buildChallengeFeedbackMessage([
      correct ? 'Correct.' : 'Not quite.',
      `Row 1 answer is ${row1Answer}.`,
      answerLine,
    ], pickedValue, correct);
  }

  return buildChallengeFeedbackMessage([
    correct ? 'Correct.' : 'Not quite.',
    `The answer is ${answer}.`,
  ], pickedValue, correct);
}

function buildChallengeStage2Feedback(expression, answer, pickedValue, correct) {
  const prompt = String(expression || '').trim();
  let explanation = `The answer is ${answer}.`;

  if (prompt === 'Which operator can Row 1 use?') {
    explanation = `Row 1 can use ${answer}.`;
  } else if (prompt === 'Which operator can Row 2 use?') {
    explanation = `Row 2 can use ${answer}.`;
  } else if (prompt === 'Which operator cannot go in Row 1?') {
    explanation = `${answer} cannot go in Row 1.`;
  } else if (prompt === 'Which operator cannot go in Row 2?') {
    explanation = `${answer} cannot go in Row 2.`;
  } else if (
    prompt === 'Which order is right?'
    || prompt === 'Which order follows the Challenge order?'
    || prompt === 'Choose the right Row 1 / Row 2 order.'
  ) {
    explanation = `Use ${answer}.`;
  } else if (
    prompt === 'Which row order is wrong?'
    || prompt === 'Which order breaks the Challenge order?'
    || prompt === 'Choose the wrong Row 1 / Row 2 order.'
  ) {
    explanation = `${answer} is the wrong order.`;
  }

  return buildChallengeFeedbackMessage([
    correct ? 'Correct.' : 'Not quite.',
    explanation,
  ], pickedValue, correct);
}

function buildChallengeFeedbackMessage(lines, pickedValue, correct) {
  const feedbackLines = [...lines];
  if (!correct) {
    feedbackLines.push(`You chose ${pickedValue}.`);
  }
  return feedbackLines.join('\n');
}

function extractLastNumber(text) {
  const matches = String(text || '').match(/(-?\d+)(?!.*-?\d)/);
  return matches?.[1] || '';
}

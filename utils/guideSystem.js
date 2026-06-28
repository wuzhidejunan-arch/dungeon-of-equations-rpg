import { playerData } from '../data/playerData.js';
import { GUIDE_STEP_IDS, guideSteps } from '../data/guideSteps.js';
import { isTesterMode } from './debugState.js';
import { isTrainingStageCompleted } from './trainingSystem.js';

const DEFAULT_GUIDE_STATE = {
  currentStepId: GUIDE_STEP_IDS.HOME_MOVE,
  bagOpened: false,
  tutorialDone: false,
};

function isBeginnerTutorialEnabled(target = playerData) {
  return (target?.difficulty || 'beginner') === 'beginner';
}

export function ensureGuideState(target = playerData) {
  if (!target.tutorialProgress || typeof target.tutorialProgress !== 'object') {
    target.tutorialProgress = { ...DEFAULT_GUIDE_STATE };
  }

  if (typeof target.tutorialProgress.currentStepId !== 'string') {
    target.tutorialProgress.currentStepId = DEFAULT_GUIDE_STATE.currentStepId;
  }

  if (typeof target.tutorialProgress.bagOpened !== 'boolean') {
    target.tutorialProgress.bagOpened = false;
  }

  if (typeof target.tutorialProgress.tutorialDone !== 'boolean') {
    target.tutorialProgress.tutorialDone = false;
  }

  return target.tutorialProgress;
}

function syncGuideWithTrainingCompletion(state, target = playerData) {
  if (isTesterMode() || !isBeginnerTutorialEnabled(target)) return;

  const stageCompletionSteps = [
    [GUIDE_STEP_IDS.TRAINING_STAGE_1, 1],
    [GUIDE_STEP_IDS.TRAINING_STAGE_2, 2],
    [GUIDE_STEP_IDS.TRAINING_STAGE_3_INTRO, 3],
  ];

  const match = stageCompletionSteps.find(([stepId]) => state.currentStepId === stepId);
  if (!match) return;

  const [stepId, stageId] = match;
  if (!isTrainingStageCompleted(stageId, target)) return;

  const nextStepId = guideSteps[stepId]?.next;
  if (nextStepId) {
    state.currentStepId = nextStepId;
  }
}

export function getCurrentGuideStep(target = playerData) {
  const state = ensureGuideState(target);

  if (state.currentStepId === GUIDE_STEP_IDS.BAG_INTRO && state.bagOpened) {
    state.currentStepId = guideSteps[GUIDE_STEP_IDS.BAG_INTRO].next;
  }

  syncGuideWithTrainingCompletion(state, target);

  return guideSteps[state.currentStepId] || guideSteps[GUIDE_STEP_IDS.TUTORIAL_DONE];
}

export function getGuideStep(stepId) {
  return guideSteps[stepId] || null;
}

export function isTutorialDone(target = playerData) {
  if (isTesterMode()) return true;
  if (!isBeginnerTutorialEnabled(target)) return true;
  return ensureGuideState(target).tutorialDone;
}

export function isTutorialActive(target = playerData) {
  if (isTesterMode()) return false;
  if (!isBeginnerTutorialEnabled(target)) return false;
  return !isTutorialDone(target);
}

export function setGuideStep(stepId, target = playerData) {
  const state = ensureGuideState(target);
  state.currentStepId = guideSteps[stepId] ? stepId : GUIDE_STEP_IDS.TUTORIAL_DONE;
  if (state.currentStepId === GUIDE_STEP_IDS.TUTORIAL_DONE) {
    state.tutorialDone = true;
  }
  return getCurrentGuideStep(target);
}

export function advanceGuideStep(expectedStepId = null, target = playerData) {
  const state = ensureGuideState(target);
  const current = getCurrentGuideStep(target);

  if (expectedStepId && current.id !== expectedStepId) {
    return current;
  }

  if (!current.next) {
    state.currentStepId = GUIDE_STEP_IDS.TUTORIAL_DONE;
    state.tutorialDone = true;
    return getCurrentGuideStep(target);
  }

  state.currentStepId = current.next;
  if (state.currentStepId === GUIDE_STEP_IDS.TUTORIAL_DONE) {
    state.tutorialDone = true;
  }

  return getCurrentGuideStep(target);
}

export function markBagOpened(target = playerData) {
  const state = ensureGuideState(target);
  state.bagOpened = true;
  if (state.currentStepId === GUIDE_STEP_IDS.BAG_INTRO) {
    advanceGuideStep(GUIDE_STEP_IDS.BAG_INTRO, target);
  }
}

export function isGuideTargetAllowed(targetName, target = playerData) {
  if (isTesterMode()) return true;
  const step = getCurrentGuideStep(target);
  if (!step.allowedTargets || !step.allowedTargets.length) return true;
  return step.allowedTargets.includes(targetName);
}

export function getBlockedGuideMessage(targetName, target = playerData) {
  const step = getCurrentGuideStep(target);
  return step.blockedMessages?.[targetName] || step.prompt || 'Follow the tutorial first.';
}

import { isTrainingStageCompleted, isTrainingStageUnlocked } from '../../../utils/trainingSystem.js';
import { isTesterMode } from '../../../utils/debugState.js';
import { TRAINING_MODES } from '../TrainingStateFactory.js';

const TYPE_LABELS = ['Zero', 'Odd', 'Even', 'Prime'];
const MENU_CURSOR = { x: 74, startY: 176 };
const BEGINNER_STAGE2_STEP_TOTAL = 20;

function getCompactStageLabel(stageId, stageRegistry) {
  const name = stageRegistry.getStageName(stageId) || `Stage ${stageId}`;
  return name.replace(/^Stage\s+\d+\s*-\s*/i, '');
}

function getPreviousStageShortLabel(stageId, stageRegistry) {
  const stageIds = stageRegistry.getStageIds();
  const index = stageIds.indexOf(stageId);
  if (index <= 0) return 'the previous stage';
  const name = stageRegistry.getStageName(stageIds[index - 1]) || 'the previous stage';
  return name.match(/^Stage\s+\d+/i)?.[0] || name;
}

function getStageStatusLabel(stageId) {
  if (isTrainingStageCompleted(stageId)) return 'Done';
  if (isTesterMode() || isTrainingStageUnlocked(stageId)) return 'Available';
  return 'Locked';
}

function getStageGoalText(stageId, stageRegistry) {
  const battle = stageRegistry.getStageBattleConfig(stageId);
  const hasBattle = Boolean(battle?.enemyKey || battle?.winKey || battle?.enemyDataKey);
  if (stageId === 3 && hasBattle) return 'Goal: win the practice battle using what you learned.';
  if (hasBattle) return 'Goal: beat the practice battle.';

  const questions = stageRegistry.getStageQuestions(stageId) || [];
  const passScore = stageRegistry.getStagePassScore(stageId);
  if (stageId === 2 && questions.length && passScore) {
    return `Goal: Get ${passScore} points`;
  }

  if (questions.length && passScore) {
    return `Goal: Get ${passScore} correct`;
  }

  return 'Goal: finish the lesson.';
}

function getRightCountText(correctCount, totalCount) {
  if (Number.isFinite(totalCount) && totalCount > 0) {
    return `Right: ${correctCount} / ${totalCount}`;
  }

  return `Right: ${correctCount}`;
}

function getStagePreviewText(stageId, stageRegistry) {
  const pages = stageRegistry.getStageLessonPages(stageId) || [];
  const firstPage = (pages[0] || '').replace(/\r/g, '').trim();
  if (!firstPage) return 'Open this stage to read the lesson.';

  const parts = firstPage.split(/\n\s*\n/).map((part) => part.replace(/\n/g, ' ').trim()).filter(Boolean);
  const headline = parts[0]?.replace(/^Stage\s+\d+:\s*/i, '').trim() || '';
  const summary = parts[1] || parts[0] || '';
  return headline && summary && headline !== summary
    ? `${headline}\n\n${summary}`
    : summary;
}

function buildStageMenuDescription(stageId, stageRegistry) {
  if (!stageId) {
    return {
      title: 'Exit Training',
      text: 'Go back',
    };
  }

  const status = getStageStatusLabel(stageId);
  const preview = getStagePreviewText(stageId, stageRegistry);
  const lockedNote = status === 'Locked' ? `\nClear ${getPreviousStageShortLabel(stageId, stageRegistry)} first.` : '';

  return {
    title: stageRegistry.getStageName(stageId),
    text: `${preview}\n\n${getStageGoalText(stageId, stageRegistry)}\nStatus: ${status}.${lockedNote}`.trim(),
  };
}

function buildOptionLines(options = [], selectedIndex = 0) {
  return options.map((option, index) => `${selectedIndex === index ? '▶ ' : '  '}${option}`).join('\n');
}

function shouldAppendStage1PromptEquals(stageId) {
  return stageId < 200;
}

function getLessonVisual(stageRegistry, stageId, pageIndex) {
  const visual = stageRegistry.getStageConfig(stageId)?.lessonVisuals?.[pageIndex];
  return visual?.key ? visual : null;
}

function getLessonLayout(stageRegistry, stageId, pageIndex) {
  return stageRegistry.getStageConfig(stageId)?.lessonLayouts?.[pageIndex] || null;
}

export class TrainingViewStateBuilder {
  build({ scene, stageRegistry }) {
    const mode = scene.mode;

    switch (mode) {
      case TRAINING_MODES.MENU:
        return this.buildMenuState({ scene, stageRegistry });
      case TRAINING_MODES.LESSON:
        return this.buildLessonState({ scene, stageRegistry });
      case TRAINING_MODES.STAGE1:
        return this.buildStage1State({ scene, stageRegistry });
      case TRAINING_MODES.STAGE2_ANSWER:
        return this.buildStage2AnswerState({ scene, stageRegistry });
      case TRAINING_MODES.STAGE2_TYPE:
        return this.buildStage2TypeState({ scene, stageRegistry });
      default:
        return this.buildMessageState({ scene, stageRegistry });
    }
  }

  buildMenuState({ scene, stageRegistry }) {
    const stageIds = stageRegistry.getStageIds();
    const menuItems = stageIds.map((stageId) => {
      const status = getStageStatusLabel(stageId);
      return `${getCompactStageLabel(stageId, stageRegistry)}\n[${status}]`;
    });
    menuItems.push('Back\n[Exit]');

    const selectedStageId = scene.menuIndex < stageIds.length ? stageIds[scene.menuIndex] : null;
    const detail = buildStageMenuDescription(selectedStageId, stageRegistry);

    return {
      layoutMode: 'menu',
      header: {
        title: 'Training',
        subtitle: 'Choose a stage',
      },
      list: {
        visible: true,
        text: menuItems.join('\n\n'),
      },
      detail: {
        visible: true,
        title: detail.title,
        text: detail.text,
      },
      content: {
        visible: false,
        text: '',
      },
      controls: 'UP / DOWN move   ENTER choose   ESC go back',
      cursor: {
        visible: true,
        x: MENU_CURSOR.x,
        y: MENU_CURSOR.startY,
        menuIndex: scene.menuIndex,
        menuItems,
      },
    };
  }

  buildLessonState({ scene, stageRegistry }) {
    const stageId = scene.currentLessonStageId;
    return {
      layoutMode: 'focused',
      header: {
        title: stageRegistry.getStageTutorialTitle(stageId),
        subtitle: `Lesson page ${scene.lessonPageIndex + 1} / ${scene.currentLessonPages.length}`,
      },
      list: { visible: false, text: '' },
      detail: {
        visible: true,
        title: stageRegistry.getStageName(stageId),
        text: getStageGoalText(stageId, stageRegistry),
      },
      content: {
        visible: true,
        text: scene.currentLessonPages[scene.lessonPageIndex] || '',
        visual: getLessonVisual(stageRegistry, stageId, scene.lessonPageIndex),
        layout: getLessonLayout(stageRegistry, stageId, scene.lessonPageIndex),
      },
      controls: 'LEFT go back   ENTER next   ESC stage list',
      cursor: { visible: false, x: 0, y: 0 },
    };
  }

  buildStage1State({ scene, stageRegistry }) {
    const stageId = scene.currentLessonStageId;
    const stageConfig = stageRegistry.getStageConfig(stageId);
    const questions = stageRegistry.getStageQuestions(stageId);
    const question = questions[scene.stage1Index];
    const isMultipleChoiceStage = stageConfig?.questionMode === 'multiple_choice';
    const shouldAppendPromptEquals = isMultipleChoiceStage && shouldAppendStage1PromptEquals(stageId);
    const options = isMultipleChoiceStage
      ? (question?.options || []).map((value) => `${value}`)
      : TYPE_LABELS;

    return {
      layoutMode: 'focused',
      header: {
        title: stageRegistry.getStageName(stageId),
        subtitle: `Question ${scene.stage1Index + 1} / ${questions.length}`,
      },
      list: { visible: false, text: '' },
      detail: {
        visible: true,
        title: '',
        text: `${getStageGoalText(stageId, stageRegistry)}\n${getRightCountText(scene.stage1CorrectCount, questions.length)}`,
      },
      content: {
        visible: true,
        text: question
          ? (isMultipleChoiceStage
            ? `${question.expression}${shouldAppendPromptEquals ? ' = ?' : ''}\n${buildOptionLines(options, scene.stageOptionIndex)}`
            : `Choose the number kind:\n${question.value}\n${buildOptionLines(options, scene.stageOptionIndex)}`)
          : 'No question found.',
      },
      controls: 'UP / DOWN choose    ENTER answer    ESC stage list',
      cursor: { visible: false, x: 0, y: 0 },
    };
  }

  buildStage2AnswerState({ scene, stageRegistry }) {
    const questions = stageRegistry.getStageQuestions(2);
    const question = questions[scene.stage2Index];
    return {
      layoutMode: 'focused',
      header: {
        title: 'Stage 2 - Find the Answer',
        subtitle: `Question ${scene.stage2Index + 1} / ${questions.length}`,
      },
      list: { visible: false, text: '' },
      detail: {
        visible: true,
        title: '',
        text: `${getStageGoalText(2, stageRegistry)}\n${getRightCountText(scene.stage2CorrectCount, BEGINNER_STAGE2_STEP_TOTAL)}`,
      },
      content: {
        visible: true,
        text: question
          ? `${question.expression} = ?\n${buildOptionLines(question.options || [], scene.stageOptionIndex)}`
          : 'No question found.',
      },
      controls: 'UP / DOWN choose    ENTER answer    ESC stage list',
      cursor: { visible: false, x: 0, y: 0 },
    };
  }

  buildStage2TypeState({ scene, stageRegistry }) {
    const question = scene.pendingStage2TypeQuestion;
    return {
      layoutMode: 'focused',
      header: {
        title: 'Stage 2 - Number Type',
        subtitle: 'Choose the number kind',
      },
      list: { visible: false, text: '' },
      detail: {
        visible: true,
        title: '',
        text: `${getStageGoalText(2, stageRegistry)}\n${getRightCountText(scene.stage2CorrectCount, BEGINNER_STAGE2_STEP_TOTAL)}`,
      },
      content: {
        visible: true,
        text: question
          ? `Now choose the number kind for ${question.answer}.\n${buildOptionLines(TYPE_LABELS, scene.stageOptionIndex)}`
          : 'No type question found.',
      },
      controls: 'UP / DOWN choose    ENTER answer    ESC stage list',
      cursor: { visible: false, x: 0, y: 0 },
    };
  }

  buildMessageState({ scene, stageRegistry }) {
    const stageId = scene.currentLessonStageId || 1;
    return {
      layoutMode: 'focused',
      header: {
        title: 'Training',
        subtitle: 'Result',
      },
      list: { visible: false, text: '' },
      detail: {
        visible: true,
        title: stageRegistry.getStageName(stageId),
        text: getStageGoalText(stageId, stageRegistry),
      },
      content: {
        visible: true,
        text: scene.messageTextValue || '',
      },
      controls: 'ENTER: Continue   ESC: Go back',
      cursor: { visible: false, x: 0, y: 0 },
    };
  }
}

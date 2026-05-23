import { battleBuilderModes } from './battleBuilderModes.js';

export const challengeDifficultyConfig = {
  key: 'challenge',
  skillIds: ['challengeNormalAttack', 'challengeHeavyAttack', 'challengeDefend', 'challengeSelfBuff'],
  builder: {
    mode: battleBuilderModes.CHAINED,
    operators: ['?', '/', '+', '-'],
    numbersPerTurn: 4,
    maxGenerationAttempts: 300,
    operatorGlyphSet: 'modern',
    utilitySkillsBypassBuilder: true,
  },
  training: {
    guidedRulePanelVariant: 'default',
    stageOrder: [201, 202, 203],
    stages: {
      201: {
        id: 201,
        name: 'Stage 1 - Two Rows',
        tutorialTitle: 'Challenge Stage 1',
        questionMode: 'multiple_choice',
        lessonPages: [
          `Challenge uses two rows.

First, solve Row 1.
Row 1 makes an answer.
That answer moves into Row 2.`,
          `Next, use the Row 1 answer in Row 2.
Do not pick a new first number for Row 2.`,
          `Example:
3 x 4 = 12
12 + 5 = 17

The 12 moves forward.`,
          `Practice:
First solve Row 1.
Then use that answer in Row 2.`,
          'Press Enter to start Stage 1.',
        ],
        passScore: 7,
        clearMessage: 'You beat Stage 1. You can carry the Row 1 answer into Row 2.',
        failMessage: 'Not yet. Use the Row 1 answer again in Row 2.',
        questions: [
          {
            expression: 'Row 1: 3 x 2 = 6\nWhat number goes first in Row 2?',
            options: [6, 2, 3, 5],
            answer: 6,
          },
          {
            expression: 'Row 1: 4 x 2 = 8\nThen 8 + 3 = ?',
            options: [9, 10, 11, 12],
            answer: 11,
          },
          {
            expression: 'Row 1: 6 ÷ 3 = 2\nWhat number goes first in Row 2?',
            options: ['2', '3', '6', 'Any number'],
            answer: '2',
          },
          {
            expression: 'Row 1: 5 x 2 = 10\nCan Row 2 start with 7?',
            options: ['Yes', 'No', 'Only if the rule changes', 'Only on Heavy Attack'],
            answer: 'No',
          },
          {
            expression: 'Row 1: 8 ÷ 2 = 4\nWhat number goes first in Row 2?',
            options: [2, 4, 8, 10],
            answer: 4,
          },
          {
            expression: 'Row 1: 2 x 4 = 8\nThen 8 - 3 = ?',
            options: [3, 4, 5, 6],
            answer: 5,
          },
          {
            expression: 'Row 1: 7 x 1 = 7\nWhat number goes first in Row 2?',
            options: ['1', '7', '8', 'Any number'],
            answer: '7',
          },
          {
            expression: 'Row 1: 9 ÷ 3 = 3\nCan Row 2 start with 9?',
            options: ['Yes', 'No', 'Only on Normal Attack', 'Only if Row 2 uses +'],
            answer: 'No',
          },
          {
            expression: 'Row 1: 3 x 3 = 9\nThen 9 + 2 = ?',
            options: [10, 11, 12, 13],
            answer: 11,
          },
          {
            expression: 'Row 1: 10 ÷ 5 = 2\nWhat number goes first in Row 2?',
            options: [10, 5, 2, 7],
            answer: 2,
          },
        ],
      },
      202: {
        id: 202,
        name: 'Stage 2 - Sign Order',
        tutorialTitle: 'Challenge Stage 2',
        questionMode: 'multiple_choice',
        lessonPages: [
          `Challenge has a fixed order.

Row 1 must use \u00d7 or \u00f7.`,
          `Row 2 must use + or \u2212.

Do not switch the order.`,
          `Valid pattern:
4 \u00d7 3 = 12
12 \u2212 5 = 7`,
          `Invalid pattern:
4 + 3
then \u00d7 2

+ or \u2212 cannot come first.`,
          `Practice:
Find the right order.
Spot the wrong one.`,
          'Press Enter to start Stage 2.',
        ],
        passScore: 7,
        clearMessage: 'You beat Stage 2. You know the row order.',
        failMessage: 'Not yet. Remember: Row 1 is \u00d7 or \u00f7. Row 2 is + or \u2212.',
        questions: [
          {
            expression: 'Which sign can Row 1 use?',
            options: ['+', '\u2212', '\u00d7', 'Both + and \u2212'],
            answer: '\u00d7',
          },
          {
            expression: 'Which sign can Row 2 use?',
            options: ['\u00d7', '\u00f7', '+', 'Both \u00d7 and \u00f7'],
            answer: '+',
          },
          {
            expression: 'Which order is right?',
            options: ['+ then \u00d7', '\u00d7 then \u2212', '\u2212 then \u00f7', '+ then \u2212'],
            answer: '\u00d7 then \u2212',
          },
          {
            expression: 'Which row order is wrong?',
            options: ['\u00f7 then +', '\u00d7 then \u2212', '+ then \u00d7', '\u00f7 then \u2212'],
            answer: '+ then \u00d7',
          },
          {
            expression: 'Which sign cannot go in Row 1?',
            options: ['\u00d7', '\u00f7', '+', 'Both \u00d7 and \u00f7'],
            answer: '+',
          },
          {
            expression: 'Which sign cannot go in Row 2?',
            options: ['+', '\u2212', '\u00f7', 'Both + and \u2212'],
            answer: '\u00f7',
          },
          {
            expression: 'Which order follows the Challenge order?',
            options: ['\u00d7 then +', '+ then \u00d7', '\u2212 then \u00f7', '+ then \u2212'],
            answer: '\u00d7 then +',
          },
          {
            expression: 'Which order breaks the Challenge order?',
            options: ['\u00f7 then \u2212', '\u00d7 then +', '\u2212 then \u00d7', '\u00f7 then +'],
            answer: '\u2212 then \u00d7',
          },
          {
            expression: 'Choose the right Row 1 / Row 2 order.',
            options: ['+ then \u2212', '\u00d7 then \u2212', '\u2212 then +', '+ then \u00d7'],
            answer: '\u00d7 then \u2212',
          },
          {
            expression: 'Choose the wrong Row 1 / Row 2 order.',
            options: ['\u00f7 then +', '\u00d7 then \u2212', '+ then \u2212', '\u00d7 then +'],
            answer: '+ then \u2212',
          },
        ],
      },
      203: {
        id: 203,
        name: 'Stage 3 - Battle Practice',
        tutorialTitle: 'Challenge Stage 3',
        lessonPages: [
          `Stage 3 is real Challenge practice.

This time you will use the real moves.`,
          `Only the last answer counts.
Row 1 alone does not count.`,
          `Normal Attack:
works when the last answer matches the rule.`,
          `Heavy Attack:
also needs the last answer to be more than 10.`,
          `Defend and Self Buff are helper moves.
They do not use the math builder.`,
          `In the practice battle:
try a helper move,
then use both rows for an attack move.`,
          'Press Enter to start the practice battle.',
        ],
        clearMessage: 'You beat Stage 3. You used the real Challenge moves in battle.',
        failMessage: 'Stage 3 not yet. Read the battle message and try again.',
        battle: {
          enemyDataKey: 'challenge_training_scout',
          enemyKey: 'challenge_training_scout',
          winKey: 'challenge_training_scout',
        },
      },
    },
    guidedBattle: {
      battleId: 'challenge_training_scout',
      enemyKey: 'challenge_training_scout',
      guideMode: 'challenge_overview',
      allowedCommands: ['fight'],
      allowedSkillIds: ['challengeNormalAttack', 'challengeHeavyAttack', 'challengeDefend', 'challengeSelfBuff'],
      lockBackToRun: true,
      lockBuilderBack: false,
      requiredRuleLabel: 'even',
      helperTexts: {
        lockedBag: 'Bag is locked in this practice. Choose Fight.',
        lockedRun: 'Run is locked in this lesson battle.',
        lockedBack: 'Stay in the lesson battle and try the Challenge moves.',
        fallback: 'Use Fight. Attack moves use both rows. Helper moves work right away.',
      },
    },
  },
  dungeon: {
    rooms: {
      1: {
        encounterPoolIds: ['challenge_chainCrawler'],
        bossEnemyId: 'challenge_balancedSentinel',
      },
      2: {
        encounterPoolIds: ['challenge_chainCrawler', 'challenge_splitwingImp'],
        bossEnemyId: 'challenge_crookedSentinel',
      },
      3: {
        encounterPoolIds: ['challenge_splitwingImp', 'challenge_chainCrawler'],
        bossEnemyId: 'challenge_primeWarden',
      },
      4: {
        encounterPoolIds: ['challenge_splitwingImp', 'challenge_chainCrawler'],
        bossEnemyId: 'challenge_chainOracleLord',
      },
    },
  },
};




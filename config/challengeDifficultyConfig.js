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
          `This stage has two rows.
The top row is Row 1.
The bottom row is Row 2.`,
          `Solve Row 1 first.

The Row 1 answer becomes
the first number in Row 2.`,
          `Example:

Row 1:
3 × 4 = 12

Row 2:
12 + 5 = 17`,
          `Do not choose a new first number
for Row 2.

Use the Row 1 answer.`,
          `Practice:

1. Solve Row 1.
2. Use the answer in Row 2.
3. Solve Row 2.`,
          `Now try it yourself.

Press Enter to start.`,
        ],
        lessonVisuals: {
          0: {
            key: 'challengeStage1RowLabels',
            image: { x: 320, y: 300, width: 380, height: 200 },
            text: { x: 155, y: 380, fontSize: '18px', wordWrapWidth: 330 },
          },
          1: {
            key: 'challengeStage1AnswerFlow',
            image: { x: 240, y: 320, width: 380, height: 200 },
            text: { x: 400, y: 260, fontSize: '18px', wordWrapWidth: 330 },
          },
        },
        lessonLayouts: {
          2: {
            text: { x: 155, y: 250, fontSize: '18px', wordWrapWidth: 350 },
          },
        },
        passScore: 7,
        clearMessage: 'You beat Stage 1. You can carry the Row 1 answer into Row 2.',
        failMessage: 'Not yet. Use the Row 1 answer again in Row 2.',
        questions: [
          {
            expression: 'Row 1: 3 × 2 = 6\nWhat number goes first in Row 2?',
            options: [6, 2, 3, 5],
            answer: 6,
          },
          {
            expression: 'Row 1: 4 × 2 = 8\nThen 8 + 3 = ?',
            options: [9, 10, 11, 12],
            answer: 11,
          },
          {
            expression: 'Row 1: 6 ÷ 3 = 2\nWhat number goes first in Row 2?',
            options: ['2', '3', '6', 'Any number'],
            answer: '2',
          },
          {
            expression: 'Row 1: 5 × 2 = 10\nCan Row 2 start with 7?',
            options: ['Yes', 'No', 'Only if the rule changes', 'Only on Heavy Attack'],
            answer: 'No',
          },
          {
            expression: 'Row 1: 8 ÷ 2 = 4\nWhat number goes first in Row 2?',
            options: [2, 4, 8, 10],
            answer: 4,
          },
          {
            expression: 'Row 1: 2 × 4 = 8\nThen 8 - 3 = ?',
            options: [3, 4, 5, 6],
            answer: 5,
          },
          {
            expression: 'Row 1: 7 × 1 = 7\nWhat number goes first in Row 2?',
            options: ['1', '7', '8', 'Any number'],
            answer: '7',
          },
          {
            expression: 'Row 1: 9 ÷ 3 = 3\nCan Row 2 start with 9?',
            options: ['Yes', 'No', 'Only on Normal Attack', 'Only if Row 2 uses +'],
            answer: 'No',
          },
          {
            expression: 'Row 1: 3 × 3 = 9\nThen 9 + 2 = ?',
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
        name: 'Stage 2 - Operator Order',
        tutorialTitle: 'Challenge Stage 2',
        questionMode: 'multiple_choice',
        lessonPages: [
          `This stage still has two rows.
Row 1 must use × or ÷.`,
          `Row 2 must use + or −.

Keep the operators in order.`,
          `Correct order:

Row 1:
4 × 3 = 12

Row 2:
12 − 5 = 7`,
          `Wrong order:

Row 1:
8 + 4

Row 2:
12 ÷ 3

+ or − cannot be used in Row 1.`,
          `Practice:

1. Use × or ÷ in Row 1.
2. Use + or − in Row 2.
3. Keep the operators in order.`,
          `Now try it yourself.

Press Enter to start.`,
        ],
        lessonVisuals: {
          0: {
            key: 'challengeStage2SignOrderRule',
            image: { x: 290, y: 310, width: 320, height: 180 },
            text: { x: 155, y: 400, fontSize: '18px', wordWrapWidth: 330 },
          },
        },
        lessonLayouts: {
          2: {
            text: { x: 155, y: 240, fontSize: '18px', wordWrapWidth: 350 },
          },
          3: {
            text: { x: 155, y: 230, fontSize: '18px', wordWrapWidth: 350 },
          },
        },
        passScore: 7,
        clearMessage: 'You beat Stage 2. You know the row order.',
        failMessage: 'Not yet. Remember: Row 1 is \u00d7 or \u00f7. Row 2 is + or \u2212.',
        questions: [
          {
            expression: 'Which operator can Row 1 use?',
            options: ['+', '\u2212', '\u00d7', 'Both + and \u2212'],
            answer: '\u00d7',
          },
          {
            expression: 'Which operator can Row 2 use?',
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
            expression: 'Which operator cannot go in Row 1?',
            options: ['\u00d7', '\u00f7', '+', 'Both \u00d7 and \u00f7'],
            answer: '+',
          },
          {
            expression: 'Which operator cannot go in Row 2?',
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

This time you will use the real skills.`,
          `Only the final answer counts.
Row 1 alone does not count.`,
          `Normal Attack:
works when the final answer matches the rule.`,
          `Heavy Attack:
also needs the final answer to be more than 10.`,
          `Defend and Self Buff help right away.
They do not use the math boxes.`,
          `In the practice battle:
try Defend or Self Buff first,
then use both rows for an attack skill.`,
          'Press Enter to start the practice battle.',
        ],
        clearMessage: 'You beat Stage 3. You used the real Challenge skills in battle.',
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
        lockedBag: 'Bag is locked in this practice.\nChoose Fight.',
        lockedRun: 'Run is locked in this practice.\nChoose Fight.',
        lockedBack: 'Stay in the lesson battle and try the Challenge skills.',
        fallback: 'Use Fight. Attack skills use both rows. Defend and Self Buff work right away.',
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

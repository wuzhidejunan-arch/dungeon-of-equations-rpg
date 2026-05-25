import { battleBuilderModes } from './battleBuilderModes.js';

export const intermediateDifficultyConfig = {
  key: 'intermediate',
  skillMenuLayout: 'row',
  skillIds: ['powerBoost', 'heavyStrike', 'armorBreak', 'weaken'],
  builder: {
    mode: battleBuilderModes.SINGLE_LINE,
    operators: ['*', '/'],
    numbersPerTurn: 4,
    maxGenerationAttempts: 300,
    operatorGlyphSet: 'modern',
    utilitySkillsBypassBuilder: false,
  },
  training: {
    guidedRulePanelVariant: 'intermediate',
    stageOrder: [101, 102, 103],
    stages: {
      101: {
        id: 101,
        name: 'Stage 1 - Multiply',
        tutorialTitle: 'Medium Stage 1',
        questionMode: 'multiple_choice',
        lessonPages: [
          'Stage 1: Multiply\n\nMultiplication means equal groups.',
          'Example:\n3 x 4 means 3 groups of 4.',
          '4 + 4 + 4 = 12.\nSo 3 x 4 = 12.',
          'The first number tells how many groups.\nThe second number tells how many are in each group.',
          'When you multiply,\nfind the total in all groups.',
          'Now answer practice questions.\nEach question has 4 choices.',
          'Use UP / DOWN to move.\nPress Enter to choose your answer.',
          'There are 20 questions.\nGoal: Get 15 right.',
          'Read each math problem carefully.',
          'Press Enter to start Stage 1.',
        ],
        passScore: 15,
        clearMessage: 'You beat Stage 1. You know the basics of multiplication.',
        failMessage: 'Not yet. Look at multiplication again and try again.',
        questions: [
          { expression: '2 x 3', options: [5, 6, 7, 8], answer: 6 },
          { expression: '4 x 2', options: [6, 7, 8, 9], answer: 8 },
          { expression: '3 x 5', options: [12, 15, 18, 20], answer: 15 },
          { expression: '6 x 2', options: [10, 11, 12, 14], answer: 12 },
          { expression: '5 x 4', options: [18, 19, 20, 21], answer: 20 },
          { expression: '7 x 3', options: [18, 20, 21, 24], answer: 21 },
          { expression: '8 x 2', options: [14, 15, 16, 18], answer: 16 },
          { expression: '9 x 1', options: [7, 8, 9, 10], answer: 9 },
          { expression: '10 x 2', options: [18, 19, 20, 22], answer: 20 },
          { expression: '4 x 6', options: [20, 22, 24, 26], answer: 24 },
          { expression: '3 x 7', options: [18, 20, 21, 24], answer: 21 },
          { expression: '6 x 3', options: [15, 16, 18, 21], answer: 18 },
          { expression: '7 x 4', options: [24, 26, 28, 30], answer: 28 },
          { expression: '8 x 3', options: [21, 22, 24, 27], answer: 24 },
          { expression: '9 x 2', options: [16, 18, 20, 22], answer: 18 },
          { expression: '5 x 5', options: [20, 25, 30, 35], answer: 25 },
          { expression: '11 x 2', options: [20, 21, 22, 24], answer: 22 },
          { expression: '12 x 3', options: [30, 33, 36, 39], answer: 36 },
          { expression: '4 x 7', options: [24, 26, 28, 32], answer: 28 },
          { expression: '6 x 5', options: [28, 29, 30, 31], answer: 30 },
        ],
      },
      102: {
        id: 102,
        name: 'Stage 2 - Divide',
        tutorialTitle: 'Medium Stage 2',
        questionMode: 'multiple_choice',
        lessonPages: [
          'Stage 2: Divide\n\nDivision means sharing equally.',
          'Example:\n12 ÷ 3 means share 12 into 3 equal groups.',
          'Each group gets 4.\nSo 12 ÷ 3 = 4.',
          'Ask,\n"How many are in each group?"',
          'Division is the opposite of multiplication.\nBecause 3 x 4 = 12, 12 ÷ 3 = 4.',
          'Now answer practice questions.\nEach question has 4 choices.',
          'Use UP / DOWN to move.\nPress Enter to choose your answer.',
          'There are 20 questions.\nGoal: Get 15 right.',
          'Read the numbers carefully.',
          'Press Enter to start Stage 2.',
        ],
        passScore: 15,
        clearMessage: 'You beat Stage 2. You know the basics of division.',
        failMessage: 'Not yet. Look at division again and try again.',
        questions: [
          { expression: '6 ÷ 2', options: [2, 3, 4, 5], answer: 3 },
          { expression: '12 ÷ 3', options: [2, 3, 4, 5], answer: 4 },
          { expression: '16 ÷ 4', options: [2, 4, 6, 8], answer: 4 },
          { expression: '18 ÷ 6', options: [2, 3, 4, 5], answer: 3 },
          { expression: '20 ÷ 5', options: [2, 3, 4, 6], answer: 4 },
          { expression: '21 ÷ 7', options: [2, 3, 4, 5], answer: 3 },
          { expression: '24 ÷ 6', options: [3, 4, 5, 6], answer: 4 },
          { expression: '27 ÷ 9', options: [2, 3, 4, 5], answer: 3 },
          { expression: '32 ÷ 8', options: [2, 3, 4, 5], answer: 4 },
          { expression: '36 ÷ 9', options: [2, 3, 4, 6], answer: 4 },
          { expression: '14 ÷ 2', options: [6, 7, 8, 9], answer: 7 },
          { expression: '15 ÷ 3', options: [4, 5, 6, 7], answer: 5 },
          { expression: '28 ÷ 7', options: [3, 4, 5, 6], answer: 4 },
          { expression: '40 ÷ 5', options: [6, 7, 8, 9], answer: 8 },
          { expression: '45 ÷ 9', options: [4, 5, 6, 7], answer: 5 },
          { expression: '48 ÷ 6', options: [6, 7, 8, 9], answer: 8 },
          { expression: '54 ÷ 6', options: [7, 8, 9, 10], answer: 9 },
          { expression: '56 ÷ 8', options: [6, 7, 8, 9], answer: 7 },
          { expression: '63 ÷ 7', options: [7, 8, 9, 10], answer: 9 },
          { expression: '72 ÷ 8', options: [7, 8, 9, 10], answer: 9 },
        ],
      },
      103: {
        id: 103,
        name: 'Stage 3 - Battle Practice',
        tutorialTitle: 'Medium Stage 3',
        lessonPages: [
          `Stage 3: Guided battle practice

This is a real battle.
Read the rule.
Pick the right skill.
Make the right answer.`,
          `Step 1:
Look at the monster rule first.
The rule tells you what answer you need.`,
          `Step 2:
First use Armor Break.
Armor Break makes the monster weaker.
Then use Heavy Strike.`,
          `Step 3:
Attack skills need two things:
the right skill
and the right answer.
In this lesson, Heavy Strike needs an even answer.`,
          `Step 4:
Some monsters need one answer, like 12.
If that happens, the rule box shows the number.`,
          `Step 5:
Armor blocks big damage.
First use Armor Break.
Then use Heavy Strike.`,
          `Watch the guide box.
It tells you what to do next.
Read the battle message after each action.`,
          'Press Enter to start the guided battle.',
        ],
        clearMessage: 'Medium is done! You can use these battle steps now. Try Challenge next.',
        failMessage: 'Stage 3 not yet. Read the guide messages and try again.',
        battle: {
          enemyDataKey: 'intermediate_armorDummy',
          enemyKey: 'intermediate_training_guardCrusher',
          winKey: 'intermediate_training_guardCrusher',
        },
      },
    },
    guidedBattle: {
      battleId: 'intermediate_training_guardCrusher',
      enemyKey: 'intermediate_training_guardCrusher',
      allowedCommands: ['fight'],
      allowedSkillIds: ['armorBreak', 'heavyStrike'],
      lockBackToRun: true,
      lockBuilderBack: false,
      requiredRuleLabel: 'even',
      requiredSkillStrategy: 'armor_break_then_heavy',
      helperTexts: {
        mainFightSelected: 'Step 1: Check the monster rule first. Then choose Fight.',
        mainOtherSelected: 'Use Fight only in this lesson. Bag and Run are hidden.',
        skillCorrect: 'Good. {skill} is the right skill now. Press Enter.',
        skillWrong: 'Use {skill} for this step.',
        builder: 'Make the math answer for {skill}. Armor Break makes the monster weaker. Heavy Strike needs an even answer.',
        dialog: 'Read each battle message. It tells you what happened.',
        fallback: 'Read the rule. Pick the skill. Make the answer.',
        lockedBag: 'Bag is locked in this lesson.\nChoose Fight.',
        lockedRun: 'Run is locked in this lesson.\nChoose Fight.',
        lockedBack: 'Stay in this lesson battle.',
        lockedBuilderBack: 'Finish this practice step first.',
        wrongSkill: 'Use {skill} for this step.',
        incompleteBuilder: 'Fill all 3 slots first. Then make sure your answer is even.',
        wrongResult: 'Heavy Strike needs an even answer. Try again.',
      },
      turnNumberSets: {
        armor_check: [8, 4, 3, 2],
        heavy_followup: [8, 6, 3, 2],
      },
    },
  },
  enemyTestSet: [
    'intermediate_armorDummy',
    'intermediate_stoneShell',
    'intermediate_wildFang',
    'intermediate_evenStoneGatekeeper',
    'intermediate_oddFangGatekeeper',
    'intermediate_ironCoreGatekeeper',
    'intermediate_armorCoreLord',
  ],
  dungeon: {
    rooms: {
      1: { encounterPoolIds: ['intermediate_stoneShell'], bossEnemyId: 'intermediate_evenStoneGatekeeper' },
      2: { encounterPoolIds: ['intermediate_wildFang'], bossEnemyId: 'intermediate_oddFangGatekeeper' },
      3: { encounterPoolIds: ['intermediate_stoneShell', 'intermediate_wildFang'], bossEnemyId: 'intermediate_ironCoreGatekeeper' },
      4: { encounterPoolIds: ['intermediate_wildFang', 'intermediate_stoneShell'], bossEnemyId: 'intermediate_armorCoreLord' },
    },
  },
};



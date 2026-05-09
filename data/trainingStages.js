export const trainingStageData = {
  1: {
    id: 1,
    lessonPages: [
      `Stage 1: Number Kinds\n\nLearn 4 number kinds:\nZero, odd, even, prime.`,
      `Zero means 0.\nOnly 0 is zero.`,
      `Even numbers make pairs.\n2, 4, 6, 8 are even.`,
      `Odd numbers have 1 left over.\n1, 3, 5, 7 are odd.`,
      `Prime numbers divide only by 1\nand themselves.\n2, 3, 5, 7, 11 are prime.`,
      `In this game, check zero first.\nThen check prime.\nThen check odd or even.`,
      `Here, 2 counts as prime.\nThat is the game rule.`,
      `There are 20 questions.\nUse UP / DOWN.\nPress Enter.`,
      `Goal: get 15 right.\nIf you miss one,\nthe stage keeps going.`,
      `Now sort the numbers by yourself.\nPress Enter to start.`,
    ],
    passScore: 15,
    questions: [
      { value: 0, type: 'zero' },
      { value: 11, type: 'prime' },
      { value: 8, type: 'even' },
      { value: 15, type: 'odd' },
      { value: 2, type: 'prime' },
      { value: 21, type: 'odd' },
      { value: 14, type: 'even' },
      { value: 7, type: 'prime' },
      { value: 9, type: 'odd' },
      { value: 12, type: 'even' },
      { value: 5, type: 'prime' },
      { value: 18, type: 'even' },
      { value: 1, type: 'odd' },
      { value: 17, type: 'prime' },
      { value: 6, type: 'even' },
      { value: 25, type: 'odd' },
      { value: 13, type: 'prime' },
      { value: 10, type: 'even' },
      { value: 27, type: 'odd' },
      { value: 23, type: 'prime' },
    ],
  },
  2: {
    id: 2,
    lessonPages: [
      `Stage 2: Add and Subtract\n\nNow solve + and -.`,
      'First, solve the math.',
      'Then choose the number kind.',
      `Example:\n7 - 5 = 2.\nIn this game, 2 is prime.`,
      `There are 10 questions.\nEach question has 2 steps.`,
      `Goal: get 15 right.\nEach correct step gives 1 right.`,
      `Start when you are ready.\nPress Enter.`,
    ],
    passScore: 15,
    questions: [
      { expression: '7 + 5', options: [10, 11, 12, 13], answer: 12, type: 'even' },
      { expression: '9 - 9', options: [0, 1, 2, 3], answer: 0, type: 'zero' },
      { expression: '6 + 7', options: [11, 12, 13, 14], answer: 13, type: 'prime' },
      { expression: '14 - 5', options: [8, 9, 10, 11], answer: 9, type: 'odd' },
      { expression: '10 + 8', options: [16, 17, 18, 19], answer: 18, type: 'even' },
      { expression: '3 + 2', options: [4, 5, 6, 7], answer: 5, type: 'prime' },
      { expression: '13 - 12', options: [0, 1, 2, 3], answer: 1, type: 'odd' },
      { expression: '11 + 6', options: [15, 16, 17, 18], answer: 17, type: 'prime' },
      { expression: '20 - 7', options: [11, 12, 13, 14], answer: 13, type: 'prime' },
      { expression: '4 + 11', options: [13, 14, 15, 16], answer: 15, type: 'odd' },
    ],
  },
  3: {
    id: 3,
    lessonPages: [
      `Stage 3: First Battle

This is your first battle.`,
      `Learn one new thing here.
Each monster has its own rule.`,
      `Step 1: Choose Fight.`,
      `Step 2: Choose Even Attack.`,
      `Step 3: Make an even answer.\nThen press Enter.`,
      `This monster gets hurt only by EVEN answers.
Pick the right move and make an even answer.`,
      'In this lesson, only Fight and Even Attack are open.',
      `Watch the helper box.
It shows the next step.

Press Enter to start.`,
    ],
    battle: {
      enemyKey: 'training_stage3',
      winKey: 'training_stage3',
    },
  },
};

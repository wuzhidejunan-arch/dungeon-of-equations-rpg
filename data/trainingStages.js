export const trainingStageData = {
  1: {
    id: 1,
    lessonPages: [
      `Stage 1: Types of Numbers\n\nLearn 4 types of numbers:\nZero, odd, even, prime.`,
      `Zero means none.\n0 is the only zero.\nExample: 0 apples.`,
      `Even numbers can be put in twos.\nNone is left.\nExamples: 2, 4, 6, 8.`,
      `Odd numbers can be put in twos.\nOne is left.\nExamples: 1, 3, 5, 7.`,
      `Prime numbers are bigger than 1.\nOnly 1 and the number itself can divide them evenly.\nExamples: 2, 3, 5, 7, 11.`,
      `In this game, check zero first.\nThen check prime.\nThen check odd or even.`,
      `Remember:\n1 is odd, but not prime.\n2 is prime and even.`,
      `There are 20 questions.\nUse UP / DOWN.\nPress Enter.`,
      `Goal: Get 15 correct.\nIf you miss one,\nthe stage keeps going.`,
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
      `Goal: Get 15 points.\nPart 1: Solve the math.\nPart 2: Choose the number kind.`,
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
      `Stage 3: Practice Battle

Now use what you learned.`,
      `Stage 1 taught types of numbers.
Stage 2 taught add and subtract.`,
      `Step 1: Choose Fight.`,
      `Step 2: Choose Even Attack.`,
      `Step 3: Make an even number.\nThen press Enter.`,
      `Make an even number to attack.
Even Attack works with even answers.`,
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

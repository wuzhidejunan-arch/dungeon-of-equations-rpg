export const battleFeedbackSpec = {
  beginner: {
    success: {
      label: 'Success',
      detail: 'Right skill. Right answer.',
    },
    failure: {
      label: 'Fail',
      detail: 'Skill rule not met. No damage.',
    },
    ineffective: {
      label: 'Blocked',
      detail: 'Skill worked, but the enemy rule was not met.',
    },
  },
  intermediate: {
    success: {
      label: 'Success',
      detail: 'Right skill. Full answer applied.',
    },
    failure: {
      label: 'Fail',
      detail: 'Wrong skill for this step. No damage.',
    },
    ineffective: {
      label: 'Blocked',
      detail: 'Skill worked, but the enemy rule was not met.',
    },
  },
};

export const battleFeedbackSpec = {
  beginner: {
    success: {
      label: 'Success',
      detail: 'Right skill. Right answer.',
    },
    failure: {
      label: 'Fail',
      detail: 'The skill or answer was not correct. No damage.',
    },
    ineffective: {
      label: 'Blocked',
      detail: 'Skill worked, but the monster rule was not met.',
    },
  },
  intermediate: {
    success: {
      label: 'Success',
      detail: 'Right skill. Full effect applied.',
    },
    failure: {
      label: 'Fail',
      detail: 'The skill or answer was not correct. No damage.',
    },
    ineffective: {
      label: 'Blocked',
      detail: 'Skill worked, but the monster rule was not met.',
    },
  },
};

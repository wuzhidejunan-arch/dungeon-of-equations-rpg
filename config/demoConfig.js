export const demoMenuConfig = Object.freeze({
  title: 'Demo Mode',
  mainOptions: [
    { label: 'Training Demo', action: 'training' },
    { label: 'Battle Demo', action: 'battle' },
    { label: 'Return to Level Select', action: 'levelSelect' },
  ],
  battleTitle: 'Choose Battle Demo',
  battleOptions: [
    { label: 'Beginner Battle', action: 'battleDemo', difficultyKey: 'beginner', enemyKey: 'slime' },
    { label: 'Medium Battle', action: 'battleDemo', difficultyKey: 'intermediate', enemyKey: 'intermediate_wildFang' },
    { label: 'Challenge Battle', action: 'battleDemo', difficultyKey: 'challenge', enemyKey: 'challenge_chainCrawler' },
    { label: 'Back', action: 'back' },
  ],
  trainingTitle: 'Choose Training Demo',
  trainingOptions: [
    { label: 'Beginner Training', action: 'trainingDemo', difficultyKey: 'beginner' },
    { label: 'Medium Training', action: 'trainingDemo', difficultyKey: 'intermediate' },
    { label: 'Challenge Training', action: 'trainingDemo', difficultyKey: 'challenge' },
    { label: 'Back', action: 'back' },
  ],
});

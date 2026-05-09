// Temporary dev/test-only config for previewing enemy battle sprites from StartScene.
export const devEnemyVisualTestGroups = [
  {
    id: 'beginner',
    label: 'Beginning',
    enemies: [
      { key: 'trainingDummy', label: 'Number Dummy' },
      { key: 'slime', label: 'Even Slime' },
      { key: 'bat', label: 'Odd Bat' },
      { key: 'boss1', label: 'Even Gatekeeper' },
      { key: 'boss2', label: 'Odd Gatekeeper' },
      { key: 'boss3', label: 'Prime Gatekeeper' },
      { key: 'finalBoss', label: 'Prime Dungeon Lord' },
    ],
  },
  {
    id: 'intermediate',
    label: 'Medium',
    enemies: [
      { key: 'intermediate_armorDummy', label: 'Armor Dummy' },
      { key: 'intermediate_stoneShell', label: 'Stone Shell' },
      { key: 'intermediate_wildFang', label: 'Wild Fang' },
      { key: 'intermediate_evenStoneGatekeeper', label: 'Even Stone Gatekeeper' },
      { key: 'intermediate_oddFangGatekeeper', label: 'Odd Fang Gatekeeper' },
      { key: 'intermediate_ironCoreGatekeeper', label: 'Iron Core Gatekeeper' },
      { key: 'intermediate_armorCoreLord', label: 'Armor Core Lord' },
    ],
  },
  {
    id: 'challenge',
    label: 'Challenge',
    enemies: [
      { key: 'challenge_training_scout', label: 'Challenge: Training Dummy' },
      { key: 'challenge_chainCrawler', label: 'Challenge: Chain Crawler' },
      { key: 'challenge_balancedSentinel', label: 'Challenge: Balanced Sentinel' },
      { key: 'challenge_splitwingImp', label: 'Challenge: Splitwing Imp' },
      { key: 'challenge_crookedSentinel', label: 'Challenge: Crooked Sentinel' },
      { key: 'challenge_primeWarden', label: 'Challenge: Prime Warden' },
      { key: 'challenge_chainOracleLord', label: 'Challenge: Oracle Lord' },
    ],
  },
];

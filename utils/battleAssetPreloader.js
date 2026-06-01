import { audioKeys } from '../config/audioKeys.js';
import { preloadBgmAssets } from './musicManager.js';
import { preloadSfxAssets } from './sfxManager.js';

const BATTLE_IMAGE_ASSETS = [
  { key: 'battleBgDungeon', path: 'assets/images/ui/battle/battle_bg_dungeon.png' },
  { key: 'battleBlueMagicCircle', path: 'assets/images/ui/battle/blue_magic_circle.png' },
  { key: 'battleRedMagicCircle', path: 'assets/images/ui/battle/red_magic_circle.png' },
  { key: 'battleStatusPanel', path: 'assets/images/ui/battle/battle_status_panel.png' },
  { key: 'battleMessagePanel', path: 'assets/images/ui/battle/battle_message_panel.png' },
  { key: 'battleSquarePanel', path: 'assets/images/ui/battle/battle_square_panel.png' },
  { key: 'battleSummaryPanel', path: 'assets/ui/battle_summary_panel.png' },
  { key: 'attackHitSpark', path: 'assets/effects/battle/attack_hit_spark.png' },
  { key: 'defenseShieldFlash', path: 'assets/effects/battle/defense_shield_flash.png' },
  { key: 'mathBuilderPanel', path: 'assets/ui/math-builder/math_panel.png' },
  { key: 'mathBuilderSlotEmpty', path: 'assets/ui/math-builder/slot_box_empty.png' },
  { key: 'mathBuilderTokenIdle', path: 'assets/ui/math-builder/token_box_idle.png' },
  { key: 'mathBuilderTokenSelected', path: 'assets/ui/math-builder/token_box_selected.png' },
  { key: 'mathBuilderButtonIdle', path: 'assets/ui/math-builder/button_idle.png' },
  { key: 'playerBack', path: 'assets/images/characters/player_back.png' },
  { key: 'enemy_number_dummy', path: 'assets/images/enemies/beginning/number_dummy.png' },
  { key: 'enemy_even_slime', path: 'assets/images/enemies/beginning/even_slime.png' },
  { key: 'enemy_odd_bat', path: 'assets/images/enemies/beginning/odd_bat.png' },
  { key: 'enemy_even_gatekeeper', path: 'assets/images/enemies/beginning/even_gatekeeper.png' },
  { key: 'enemy_odd_gatekeeper', path: 'assets/images/enemies/beginning/odd_gatekeeper.png' },
  { key: 'enemy_prime_gatekeeper', path: 'assets/images/enemies/beginning/prime_gatekeeper.png' },
  { key: 'enemy_prime_dungeon_lord', path: 'assets/images/enemies/beginning/prime_dungeon_lord.png' },
  { key: 'enemy_intermediate_stone_shell', path: 'assets/images/enemies/intermediate/stone_shell.png' },
  { key: 'enemy_intermediate_armor_dummy', path: 'assets/images/enemies/intermediate/armor_dummy.png' },
  { key: 'enemy_intermediate_wild_fang', path: 'assets/images/enemies/intermediate/wild_fang.png' },
  {
    key: 'enemy_intermediate_even_stone_gatekeeper',
    path: 'assets/images/enemies/intermediate/even_stone_gatekeeper.png',
  },
  {
    key: 'enemy_intermediate_odd_fang_gatekeeper',
    path: 'assets/images/enemies/intermediate/odd_fang_gatekeeper.png',
  },
  {
    key: 'enemy_intermediate_iron_core_gatekeeper',
    path: 'assets/images/enemies/intermediate/iron_core_gatekeeper.png',
  },
  { key: 'enemy_intermediate_armor_core_lord', path: 'assets/images/enemies/intermediate/armor_core_lord.png' },
  { key: 'challenge_chain_dummy', path: 'assets/images/enemies/challenge/chain_dummy.png' },
  { key: 'challenge_chain_crawler', path: 'assets/images/enemies/challenge/chain_crawler.png' },
  { key: 'challenge_splitwing_imp', path: 'assets/images/enemies/challenge/splitwing_imp.png' },
  { key: 'challenge_balanced_sentinel', path: 'assets/images/enemies/challenge/balanced_sentinel.png' },
  { key: 'challenge_crooked_sentinel', path: 'assets/images/enemies/challenge/crooked_sentinel.png' },
  { key: 'challenge_prime_warden', path: 'assets/images/enemies/challenge/prime_warden.png' },
  { key: 'challenge_chain_oracle_lord', path: 'assets/images/enemies/challenge/chain_oracle_lord.png' },
];

export function preloadBattleAssets(scene) {
  let queuedCount = 0;

  queuedCount += preloadBgmAssets(scene, [audioKeys.bgm.battle, audioKeys.bgm.bossBattle]) || 0;
  queuedCount += preloadSfxAssets(scene) || 0;

  BATTLE_IMAGE_ASSETS.forEach(({ key, path }) => {
    if (!scene.textures.exists(key)) {
      scene.load.image(key, path);
      queuedCount += 1;
    }
  });

  return queuedCount;
}

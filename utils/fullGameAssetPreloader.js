import { audioKeys } from '../config/audioKeys.js';
import { preloadBattleAssets } from './battleAssetPreloader.js';
import { preloadStartupAssets } from './gameAssetPreloader.js';
import { preloadBgmAssets } from './musicManager.js';
import {
  PLAYER_WALK_FRAME_SIZE,
  PLAYER_WALK_SHEET_KEY,
  PLAYER_WALK_SHEET_PATH,
} from './textureFactory.js';

const FULL_GAME_IMAGE_ASSETS = Object.freeze([
  { key: 'uiHintWoodPlate', path: 'assets/ui/ui_hint_wood_plate.png' },
  { key: 'uiStatusWoodPanel', path: 'assets/ui/ui_status_wood_panel.png' },
  { key: 'goldCoinIcon', path: 'assets/images/ui/icons/gold_coin.png' },
  { key: 'uiBookPanelFrame', path: 'assets/ui/ui_book_panel_frame.png' },
  { key: 'dialoguePanel', path: 'assets/ui/dialogue/dialogue_panel.png' },

  { key: 'playerFront', path: 'assets/images/characters/player_front.png' },
  { key: 'homeRoomMap', path: 'assets/images/maps/home_room_map.png' },
  { key: 'gameOverPanel', path: 'assets/images/ui/game_over_panel.png' },
  { key: 'homeOpeningBubblePanel', path: 'assets/ui/dialogue/home_opening_bubble.png' },

  { key: 'worldGrassMap', path: 'assets/images/maps/grass_map.png' },
  { key: 'worldVillageMap', path: 'assets/images/maps/world_map.png' },
  { key: 'mapHome', path: 'assets/images/map_objects/home.png' },
  { key: 'mapDungeon', path: 'assets/images/map_objects/dungeon.png' },
  { key: 'mapShop', path: 'assets/images/map_objects/shop.png' },
  { key: 'mapTrainingGround', path: 'assets/images/map_objects/training_ground.png' },
  { key: 'mapStone', path: 'assets/images/map_objects/stone.png' },
  { key: 'mapNpc', path: 'assets/images/map_objects/npc.png' },

  { key: 'dungeonMap01', path: 'assets/images/maps/dungeon_map_01.png' },
  { key: 'dungeonMap02', path: 'assets/images/maps/dungeon_map_02.png' },
  { key: 'dungeonMap03', path: 'assets/images/maps/dungeon_map_03.png' },
  { key: 'dungeonBossMap', path: 'assets/images/maps/dungeon_boss_map.png' },

  { key: 'trainingWoodButton', path: 'assets/ui/training/wood_button.png' },
  { key: 'trainingParchmentPanel', path: 'assets/ui/training/parchment_panel.png' },
  { key: 'trainingResultMascotSuccess', path: 'assets/ui/training/training_result_mascot_success.png' },
  { key: 'trainingResultMascotRetry', path: 'assets/ui/training/training_result_mascot_retry.png' },
  { key: 'beginningStage1ZeroEmpty', path: 'assets/images/training/beginning_stage1_zero_empty.png' },
  { key: 'beginningStage1EvenPairs', path: 'assets/images/training/beginning_stage1_even_pairs.png' },
  { key: 'beginningStage1OddLeftover', path: 'assets/images/training/beginning_stage1_odd_leftover.png' },
  { key: 'beginningStage1PrimeGems', path: 'assets/images/training/beginning_stage1_prime_gems.png' },
  { key: 'beginningStage2AddExample', path: 'assets/images/training/beginning_stage2_add_example.png' },
  { key: 'beginningStage2SubtractExample', path: 'assets/images/training/beginning_stage2_subtract_example.png' },
  { key: 'mediumStage1GroupsOf4', path: 'assets/images/training/medium_stage1_groups_of_4.png' },
  { key: 'mediumStage1RepeatedAddition', path: 'assets/images/training/medium_stage1_repeated_addition.png' },
  { key: 'mediumStage2Share12Into3', path: 'assets/images/training/medium_stage2_share_12_into_3.png' },
  { key: 'mediumStage2EachGroupGets4', path: 'assets/images/training/medium_stage2_each_group_gets_4.png' },
  { key: 'challengeStage1RowLabels', path: 'assets/images/training/challenge_stage1_row_labels.png' },
  { key: 'challengeStage1AnswerFlow', path: 'assets/images/training/challenge_stage1_answer_flow.png' },
  { key: 'challengeStage2SignOrderRule', path: 'assets/images/training/challenge_stage2_sign_order_rule.png' },

  { key: 'demoMenuBackground', path: 'assets/images/ui/demo_menu_background.png' },
  { key: 'result_modal_frame', path: 'assets/ui/result_modal_frame.png' },
  { key: 'level_up_title', path: 'assets/ui/level_up_title.png' },
  { key: 'stage_clear_title', path: 'assets/ui/stage_clear_title.png' },
]);

function queueImageIfMissing(scene, key, path) {
  if (scene.textures.exists(key)) {
    return 0;
  }

  scene.load.image(key, path);
  return 1;
}

function queueSpritesheetIfMissing(scene, key, path, config) {
  if (scene.textures.exists(key)) {
    return 0;
  }

  scene.load.spritesheet(key, path, config);
  return 1;
}

export function preloadFullGameAssets(scene) {
  let queuedCount = 0;

  queuedCount += preloadStartupAssets(scene, { includeSfx: false }) || 0;
  queuedCount += preloadBattleAssets(scene) || 0;
  queuedCount += preloadBgmAssets(scene, [audioKeys.bgm.normal, audioKeys.bgm.dungeon]) || 0;

  queuedCount += queueSpritesheetIfMissing(scene, PLAYER_WALK_SHEET_KEY, PLAYER_WALK_SHEET_PATH, {
    frameWidth: PLAYER_WALK_FRAME_SIZE,
    frameHeight: PLAYER_WALK_FRAME_SIZE,
  });

  FULL_GAME_IMAGE_ASSETS.forEach(({ key, path }) => {
    queuedCount += queueImageIfMissing(scene, key, path);
  });

  return queuedCount;
}

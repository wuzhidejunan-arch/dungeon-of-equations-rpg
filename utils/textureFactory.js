export function createBasicTextures(scene) {
  if (!scene.textures.exists("playerTexture")) {
    const playerGraphics = scene.add.graphics();
    playerGraphics.fillStyle(0xff0000, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture("playerTexture", 32, 32);
    playerGraphics.destroy();
  }

  if (!scene.textures.exists("obstacleTexture")) {
    const obstacleGraphics = scene.add.graphics();
    obstacleGraphics.fillStyle(0x8b5a2b, 1);
    obstacleGraphics.fillRect(0, 0, 64, 64);
    obstacleGraphics.generateTexture("obstacleTexture", 64, 64);
    obstacleGraphics.destroy();
  }

  if (!scene.textures.exists("houseTexture")) {
    const houseGraphics = scene.add.graphics();
    houseGraphics.fillStyle(0x777777, 1);
    houseGraphics.fillRect(0, 0, 140, 140);
    houseGraphics.generateTexture("houseTexture", 140, 140);
    houseGraphics.destroy();
  }

  if (!scene.textures.exists("shopTexture")) {
    const shopGraphics = scene.add.graphics();
    shopGraphics.fillStyle(0x4444aa, 1);
    shopGraphics.fillRect(0, 0, 140, 140);
    shopGraphics.generateTexture("shopTexture", 140, 140);
    shopGraphics.destroy();
  }
}

function loadImageIfMissing(scene, key, path) {
  if (!scene.textures.exists(key)) {
    scene.load.image(key, path);
  }
}

export function preloadHomeMapArt(scene) {
  loadImageIfMissing(scene, "playerFront", "assets/images/characters/player_front.png");
  loadImageIfMissing(scene, "homeRoomMap", "assets/images/maps/home_room_map.png");
}

export function preloadWorldMapArt(scene) {
  loadImageIfMissing(scene, "playerFront", "assets/images/characters/player_front.png");
  loadImageIfMissing(scene, "worldGrassMap", "assets/images/maps/grass_map.png");
  loadImageIfMissing(scene, "mapHome", "assets/images/map_objects/home.png");
  loadImageIfMissing(scene, "mapDungeon", "assets/images/map_objects/dungeon.png");
  loadImageIfMissing(scene, "mapShop", "assets/images/map_objects/shop.png");
  loadImageIfMissing(scene, "mapTrainingGround", "assets/images/map_objects/training_ground.png");
  loadImageIfMissing(scene, "mapStone", "assets/images/map_objects/stone.png");
  loadImageIfMissing(scene, "mapNpc", "assets/images/map_objects/npc.png");
}

export function preloadDungeonMapArt(scene) {
  loadImageIfMissing(scene, "playerFront", "assets/images/characters/player_front.png");
  loadImageIfMissing(scene, "dungeonMap01", "assets/images/maps/dungeon_map_01.png");
  loadImageIfMissing(scene, "dungeonMap02", "assets/images/maps/dungeon_map_02.png");
  loadImageIfMissing(scene, "dungeonMap03", "assets/images/maps/dungeon_map_03.png");
  loadImageIfMissing(scene, "dungeonBossMap", "assets/images/maps/dungeon_boss_map.png");
}

export function preloadMapArt(scene) {
  if (!scene.textures.exists("playerFront")) {
    scene.load.image("playerFront", "assets/images/characters/player_front.png");
  }

  if (!scene.textures.exists("playerBack")) {
    scene.load.image("playerBack", "assets/images/characters/player_back.png");
  }

  if (!scene.textures.exists("worldGrassMap")) {
    scene.load.image("worldGrassMap", "assets/images/maps/grass_map.png");
  }

  if (!scene.textures.exists("dungeonMap01")) {
    scene.load.image("dungeonMap01", "assets/images/maps/dungeon_map_01.png");
  }

  if (!scene.textures.exists("dungeonMap02")) {
    scene.load.image("dungeonMap02", "assets/images/maps/dungeon_map_02.png");
  }

  if (!scene.textures.exists("dungeonMap03")) {
    scene.load.image("dungeonMap03", "assets/images/maps/dungeon_map_03.png");
  }

  if (!scene.textures.exists("dungeonBossMap")) {
    scene.load.image("dungeonBossMap", "assets/images/maps/dungeon_boss_map.png");
  }

  if (!scene.textures.exists("homeRoomMap")) {
    scene.load.image("homeRoomMap", "assets/images/maps/home_room_map.png");
  }

  if (!scene.textures.exists("mapHome")) {
    scene.load.image("mapHome", "assets/images/map_objects/home.png");
  }

  if (!scene.textures.exists("mapDungeon")) {
    scene.load.image("mapDungeon", "assets/images/map_objects/dungeon.png");
  }

  if (!scene.textures.exists("mapShop")) {
    scene.load.image("mapShop", "assets/images/map_objects/shop.png");
  }

  if (!scene.textures.exists("mapTrainingGround")) {
    scene.load.image("mapTrainingGround", "assets/images/map_objects/training_ground.png");
  }

  if (!scene.textures.exists("mapStone")) {
    scene.load.image("mapStone", "assets/images/map_objects/stone.png");
  }

  if (!scene.textures.exists("mapNpc")) {
    scene.load.image("mapNpc", "assets/images/map_objects/npc.png");
  }
}

// ========================================
// TileMapGenerator — สร้างแผนที่ฟาร์มแบบ Procedural
// ========================================

import Phaser from 'phaser';
import { TileType, GAME_CONFIG } from '../types';

/** Layout ของแผนที่ (กำหนดตายตัวเพื่อให้สวย) */
function generateMapData(): number[][] {
  const { MAP_WIDTH, MAP_HEIGHT } = GAME_CONFIG;
  const map: number[][] = [];

  // เริ่มจากหญ้าทั้งหมด
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // สลับหญ้าอ่อน/เข้มแบบ checkerboard
      map[y][x] = (x + y) % 7 === 0 ? TileType.GrassDark : TileType.Grass;
    }
  }

  // === แม่น้ำ (ไหลจากบนลงล่าง ทางขวา) ===
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const riverX = 30 + Math.floor(Math.sin(y * 0.3) * 2);
    for (let dx = 0; dx < 4; dx++) {
      if (riverX + dx < MAP_WIDTH) {
        map[y][riverX + dx] = dx === 0 || dx === 3 ? TileType.Water : TileType.WaterDeep;
      }
    }
  }

  // === สะพานข้ามแม่น้ำ ===
  for (let x = 28; x <= 35 && x < MAP_WIDTH; x++) {
    map[14][x] = TileType.Bridge;
    map[15][x] = TileType.Bridge;
  }

  // === ทางเดินหลัก (แนวนอนตรงกลาง) ===
  for (let x = 0; x < 30; x++) {
    map[14][x] = TileType.DirtPath;
    map[15][x] = TileType.DirtPath;
  }

  // === ทางเดินแนวตั้ง (ลงไปฟาร์ม) ===
  for (let y = 10; y < 22; y++) {
    map[y][12] = TileType.DirtPath;
    map[y][13] = TileType.DirtPath;
  }

  // === ทางเดินไปบ้าน (ด้านซ้ายบน) ===
  for (let y = 4; y < 15; y++) {
    map[y][5] = TileType.DirtPath;
    map[y][6] = TileType.DirtPath;
  }
  for (let x = 5; x < 13; x++) {
    map[4][x] = TileType.DirtPath;
    map[5][x] = TileType.DirtPath;
  }

  // === แปลงปลูกผัก (ฝั่งซ้ายล่าง) ===
  for (let y = 18; y <= 25; y++) {
    for (let x = 3; x <= 10; x++) {
      map[y][x] = TileType.FarmSoil;
    }
  }

  // === แปลงปลูกผัก (ฝั่งขวา) ===
  for (let y = 18; y <= 23; y++) {
    for (let x = 16; x <= 23; x++) {
      map[y][x] = TileType.FarmSoil;
    }
  }

  // === ดอกไม้กระจายตามหญ้า ===
  const flowerSpots = [
    [3, 8], [7, 3], [20, 5], [25, 8], [18, 3],
    [22, 10], [8, 10], [26, 3], [15, 7], [24, 13],
    [35, 5], [37, 10], [36, 18], [38, 22], [35, 25],
  ];
  for (const [fx, fy] of flowerSpots) {
    if (fx < MAP_WIDTH && fy < MAP_HEIGHT && map[fy][fx] === TileType.Grass) {
      map[fy][fx] = Math.random() > 0.5 ? TileType.Flower1 : TileType.Flower2;
    }
  }

  // === สระน้ำเล็กๆ (มุมซ้ายบน) ===
  for (let y = 1; y <= 3; y++) {
    for (let x = 1; x <= 3; x++) {
      map[y][x] = TileType.Water;
    }
  }
  map[2][2] = TileType.WaterDeep;

  return map;
}

/** ข้อมูล Obstacle (ต้นไม้ รั้ว หิน) */
export interface ObstacleData {
  x: number;
  y: number;
  type: 'tree' | 'fence' | 'rock';
}

/** สร้าง Obstacles */
function generateObstacles(): ObstacleData[] {
  const obstacles: ObstacleData[] = [];

  // ต้นไม้กระจายรอบฟาร์ม
  const treePositions = [
    [2, 7], [8, 6], [0, 12], [1, 16],
    [15, 3], [17, 6], [22, 2], [25, 5],
    [27, 8], [27, 12], [27, 18], [27, 22],
    [0, 22], [0, 26], [14, 27], [20, 27],
    [25, 27], [35, 2], [38, 6], [36, 12],
    [38, 16], [36, 22], [38, 26], [35, 28],
  ];
  for (const [tx, ty] of treePositions) {
    obstacles.push({ x: tx, y: ty, type: 'tree' });
  }

  // รั้วรอบแปลงปลูก (ซ้ายล่าง)
  for (let x = 2; x <= 11; x++) {
    obstacles.push({ x, y: 17, type: 'fence' });
    obstacles.push({ x, y: 26, type: 'fence' });
  }
  for (let y = 17; y <= 26; y++) {
    // ทางซ้าย (ทึบ)
    obstacles.push({ x: 2, y, type: 'fence' });
    
    // ทางขวา (ติดกับทางเดิน x=11) เปิดช่องที่ y=20, 21
    if (y !== 20 && y !== 21) {
      obstacles.push({ x: 11, y, type: 'fence' });
    }
  }

  // รั้วรอบแปลงปลูก (ขวา)
  for (let x = 15; x <= 24; x++) {
    obstacles.push({ x, y: 17, type: 'fence' });
    obstacles.push({ x, y: 24, type: 'fence' });
  }
  for (let y = 17; y <= 24; y++) {
    // ทางซ้าย (ติดกับทางเดิน x=15) เปิดช่องที่ y=20, 21
    if (y !== 20 && y !== 21) {
      obstacles.push({ x: 15, y, type: 'fence' });
    }
    
    // ทางขวา (ทึบ)
    obstacles.push({ x: 24, y, type: 'fence' });
  }

  // ก้อนหิน
  const rockPositions = [
    [5, 12], [19, 9], [26, 15], [10, 28], [32, 10], [34, 20],
  ];
  for (const [rx, ry] of rockPositions) {
    obstacles.push({ x: rx, y: ry, type: 'rock' });
  }

  return obstacles;
}

/**
 * สร้าง Tilemap Layer ลงใน Scene
 */
export function createTileMap(scene: Phaser.Scene): {
  groundLayer: Phaser.GameObjects.Group;
  obstacles: Phaser.Physics.Arcade.StaticGroup;
  mapData: number[][];
} {
  const mapData = generateMapData();
  const { TILE_SIZE } = GAME_CONFIG;
  const groundLayer = scene.add.group();

  // วาง tiles ลงบนฉาก
  for (let y = 0; y < mapData.length; y++) {
    for (let x = 0; x < mapData[y].length; x++) {
      const tileIndex = mapData[y][x];
      const tile = scene.add.image(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
        'tileset',
        tileIndex
      );
      tile.setDepth(0);
      groundLayer.add(tile);
    }
  }

  // สร้าง obstacles
  const obstacleData = generateObstacles();
  const obstacles = scene.physics.add.staticGroup();

  for (const obs of obstacleData) {
    const sprite = obstacles.create(
      obs.x * TILE_SIZE + TILE_SIZE / 2,
      obs.y * TILE_SIZE + TILE_SIZE / 2,
      obs.type
    ) as Phaser.Physics.Arcade.Sprite;

    // ปรับ hitbox ให้เล็กกว่า sprite นิดหน่อย
    sprite.setSize(TILE_SIZE * 0.7, TILE_SIZE * 0.7);
    sprite.setDepth(1);
    sprite.refreshBody();
  }

  return { groundLayer, obstacles, mapData };
}

/**
 * หาตำแหน่ง farm plots จาก mapData
 */
export function findFarmPlots(mapData: number[][]): { tileX: number; tileY: number }[] {
  const plots: { tileX: number; tileY: number }[] = [];
  for (let y = 0; y < mapData.length; y++) {
    for (let x = 0; x < mapData[y].length; x++) {
      if (mapData[y][x] === TileType.FarmSoil) {
        plots.push({ tileX: x, tileY: y });
      }
    }
  }
  return plots;
}

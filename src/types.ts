// ========================================
// Shared Type Definitions for Pixel Farm 2D
// ========================================

/** ทิศทางการเดินของตัวละคร */
export enum Direction {
  Down = 'down',
  Up = 'up',
  Left = 'left',
  Right = 'right',
}

/** ชนิดของสัตว์ฟาร์ม */
export enum AnimalType {
  Chicken = 'chicken',
  Pig = 'pig',
  Cow = 'cow',
}

/** สถานะของแปลงปลูก */
export enum PlotState {
  Empty = 'empty',       // ดินว่าง
  Tilled = 'tilled',     // ไถแล้ว
  Seeded = 'seeded',     // หว่านเมล็ดแล้ว
  Watered = 'watered',   // รดน้ำแล้ว
  Growing = 'growing',   // กำลังเติบโต
  Ready = 'ready',       // พร้อมเก็บเกี่ยว
}

/** ชนิดพืช */
export enum CropType {
  Tomato = 'tomato',
  Carrot = 'carrot',
  Corn = 'corn',
  Pumpkin = 'pumpkin',
}

/** ข้อมูลแปลงปลูก */
export interface FarmPlot {
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  state: PlotState;
  crop: CropType | null;
  growthTimer: number;     // เวลาที่โตแล้ว (ms)
  growthRequired: number;  // เวลาที่ต้องโต (ms)
  watered: boolean;
}

/** ข้อมูล NPC Dialog */
export interface DialogData {
  name: string;
  lines: string[];
}

/** Inventory Item */
export interface InventoryItem {
  type: string;
  count: number;
  icon?: string;
}

/** Player State */
export interface PlayerState {
  coins: number;
  inventory: InventoryItem[];
  selectedTool: string;
}

/** Tile Types สำหรับ Tilemap */
export enum TileType {
  Grass = 0,
  GrassDark = 1,
  Dirt = 2,
  DirtPath = 3,
  Water = 4,
  WaterDeep = 5,
  Flower1 = 6,
  Flower2 = 7,
  FarmSoil = 8,
  FarmSoilWet = 9,
  Bridge = 10,
}

/** ค่าคงที่ของเกม */
export const GAME_CONFIG = {
  TILE_SIZE: 8,
  MAP_WIDTH: 40,      // จำนวน tile แนวนอน
  MAP_HEIGHT: 30,     // จำนวน tile แนวตั้ง
  PLAYER_SPEED: 40,
  ANIMAL_SPEED: 10,
  NPC_SPEED: 12,
  INTERACTION_DISTANCE: 12,
  GROWTH_TIME: {
    [CropType.Tomato]: 15000,   // 15 วินาที
    [CropType.Carrot]: 10000,   // 10 วินาที
    [CropType.Corn]: 20000,     // 20 วินาที
    [CropType.Pumpkin]: 25000,  // 25 วินาที
  },
  CROP_VALUE: {
    [CropType.Tomato]: 15,
    [CropType.Carrot]: 10,
    [CropType.Corn]: 20,
    [CropType.Pumpkin]: 35,
  },
} as const;

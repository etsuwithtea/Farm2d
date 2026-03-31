// ========================================
// SpriteGenerator — Load TinyFarm 8×8 Sprite Sheets
// Extract frames and create animations
// ========================================

import Phaser from 'phaser';
import { CropType, GAME_CONFIG } from '../types';
import animalsUrl from '../assets/TinyFarm_Animals.png';
import charsUrl from '../assets/TinyFarm_Characters.png';
import cropsUrl from '../assets/TinyFarm_Crops.png';
import itemsUrl from '../assets/TinyFarm_Items.png';
import decoUrl from '../assets/TinyFarm_MapDecorations.png';
import structUrl from '../assets/TinyFarm_Structures.png';
import tilesUrl from '../assets/TinyFarm_Tiles.png';

// ============================================================
// Sheet keys
// ============================================================
export const SHEET_KEYS = {
  animals: 'sheet-animals',
  chars: 'sheet-chars',
  crops: 'sheet-crops',
  items: 'sheet-items',
  deco: 'sheet-deco',
  struct: 'sheet-struct',
  tiles: 'sheet-tiles',
};

// ============================================================
// Preload
// ============================================================
export function preloadAssets(scene: Phaser.Scene): void {
  scene.load.image(SHEET_KEYS.animals, animalsUrl);
  scene.load.image(SHEET_KEYS.chars, charsUrl);
  scene.load.image(SHEET_KEYS.crops, cropsUrl);
  scene.load.image(SHEET_KEYS.items, itemsUrl);
  scene.load.image(SHEET_KEYS.deco, decoUrl);
  scene.load.image(SHEET_KEYS.struct, structUrl);
  scene.load.image(SHEET_KEYS.tiles, tilesUrl);
}

// ============================================================
// Helpers
// ============================================================
function getSource(scene: Phaser.Scene, key: string): CanvasImageSource {
  return scene.textures.get(key).getSourceImage() as CanvasImageSource;
}

function extractRegion(
  src: CanvasImageSource,
  sx: number, sy: number,
  sw: number, sh: number,
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = sw;
  c.height = sh;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
  return c;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

// ============================================================
// Characters — TinyFarm_Characters.png (24×192, 3 cols × 24 rows)
// 6 characters × 4 directions × 3 frames
// Layout per character: 4 rows (down, left, right, up) × 3 cols
// ============================================================
const CHAR_MAP: Record<string, number> = {
  'player': 0,
  'npc-farmer': 1,
  'npc-merchant': 2,
  'npc-elder': 3,
};

export function createCharacterSpritesheets(scene: Phaser.Scene): void {
  const src = getSource(scene, SHEET_KEYS.chars);
  for (const [key, idx] of Object.entries(CHAR_MAP)) {
    const sy = idx * 4 * 8;
    const canvas = extractRegion(src, 0, sy, 3 * 8, 4 * 8);
    scene.textures.addSpriteSheet(key, canvas as any, {
      frameWidth: 8,
      frameHeight: 8,
    });
  }
}

// ============================================================
// Animals — TinyFarm_Animals.png (128×48, 16 cols × 6 rows)
//
// CORRECTED LAYOUT from magnified analysis:
// The animals are arranged in COLUMNS, not rows.
// Each animal type occupies 2 COLUMNS, with rows being directions.
//
// Cols 0-1: Cat (orange)
// Cols 2-3: Pig (pink)
// Cols 4-5: Mouse/Rabbit (grey)
// Cols 6-7: Duck/Goose (white)
// Cols 8-9: Chicken (brown/red)
// Cols 10-11: Dark bird/Crow
// Cols 12-13: Dog/Fox (orange-brown)
// Cols 14-15: Cow/Horse (spotted)
//
// Rows 0-3: 4 direction poses (down, right, up, left)
// Rows 4-5: Extra frames
//
// We extract 2 cols × 4 rows = 8 frames per animal
// Then arrange as a 1-row strip: 2 frames per direction
// ============================================================

interface AnimalDef {
  key: string;
  startCol: number; // starting column (0-based)
}

const ANIMAL_DEFS: AnimalDef[] = [
  { key: 'cat', startCol: 0 },       // Orange cat, cols 0-1
  { key: 'pig', startCol: 2 },       // Pink pig, cols 2-3
  { key: 'duck', startCol: 6 },      // White duck/goose, cols 6-7
  { key: 'chicken', startCol: 8 },   // Brown chicken, cols 8-9
  { key: 'dog', startCol: 12 },      // Orange-brown dog, cols 12-13
  { key: 'cow', startCol: 14 },      // Cow/spotted, cols 14-15
];

export function createAnimalSpritesheets(scene: Phaser.Scene): void {
  const src = getSource(scene, SHEET_KEYS.animals);

  for (const def of ANIMAL_DEFS) {
    // Extract ONLY this animal's column (1 col) × 4 direction rows
    // Create a spritesheet with 4 frames: 4 directions × 1 frame each
    const [c, ctx] = makeCanvas(8 * 4, 8); // 4 frames wide, 1 row tall

    for (let dir = 0; dir < 4; dir++) {
      // Copy 1 frame from (startCol, dir) into the strip
      const srcX = def.startCol * 8;
      const srcY = dir * 8;
      const destX = dir * 8;
      ctx.drawImage(src, srcX, srcY, 8, 8, destX, 0, 8, 8);
    }

    scene.textures.addSpriteSheet(def.key, c as any, {
      frameWidth: 8,
      frameHeight: 8,
    });
  }
}

// ============================================================
// Tileset — TinyFarm_Tiles.png (80×48, 10 cols × 6 rows)
//
// CORRECTED from magnified analysis:
// Row 0: Green grass variants (cols 0-7), Water (cols 8-9)
// Row 1: Dark grass (cols 0-7), Deep water/dark (cols 8-9)
// Row 2: Farm soil YELLOW (cols 0-3), Light soil/sand (cols 4-6), Dark purple (cols 7-9)
// Row 3: Brown dirt/path variants
// Row 4-5: More path/terrain variants
// ============================================================
export function createTileset(scene: Phaser.Scene): void {
  const src = getSource(scene, SHEET_KEYS.tiles);

  // Map TileType index → (col, row) in TinyFarm_Tiles
  const map: [number, number][] = [
    [1, 1],  // 0: Grass (green, row 0 col 0)
    [3, 1],  // 1: GrassDark (green with speckles, row 0 col 1)
    [0, 3],  // 2: Dirt (solid orange dirt, row 2 col 0)
    [1, 3],  // 3: DirtPath (solid cyan/grey dirt, row 2 col 4)
    [8, 1],  // 4: Water (solid blue water, row 3 col 8)
    [8, 2],  // 5: WaterDeep (solid blue water, row 3 col 9)
    [5, 0],  // 6: Flower1 (grass with flowers, row 0 col 5)
    [7, 0],  // 7: Flower2 (grass with flowers, row 0 col 7)
    [1, 4],  // 8: FarmSoil (tilled orange dirt, row 3 col 1)
    [2, 4],  // 9: FarmSoilWet (tilled orange dirt, row 3 col 3)
    [5, 3],  // 10: Bridge (fallback to dirt, row 2 col 0)
  ];

  const count = 16;
  const [c, ctx] = makeCanvas(8 * count, 8);
  for (let i = 0; i < map.length; i++) {
    const [col, row] = map[i];
    ctx.drawImage(src, col * 8, row * 8, 8, 8, i * 8, 0, 8, 8);
  }
  // Fill remaining with grass
  for (let i = map.length; i < count; i++) {
    ctx.drawImage(src, 0, 0, 8, 8, i * 8, 0, 8, 8);
  }
  scene.textures.addSpriteSheet('tileset', c as any, {
    frameWidth: 8,
    frameHeight: 8,
  });
}

// ============================================================
// Obstacles & Decorations — MapDecorations + Structures
// ============================================================
export function createObstacleTextures(scene: Phaser.Scene): void {
  const deco = getSource(scene, SHEET_KEYS.deco);
  const struct = getSource(scene, SHEET_KEYS.struct);

  // Tree: 16×24 from decorations (spanning rows 0-2, cols 0-1)
  scene.textures.addImage('tree', extractRegion(deco, 0, 0, 8, 8) as any);

  // Rock: 16x16 from decorations (spanning rows 1-2, cols 2-3)
  scene.textures.addImage('rock', extractRegion(deco, 16, 8, 8, 8) as any);

  // Fences: from structures — bottom rows have various connection pieces
  // Row 14: tl, tr, h, t-junction down
  // Row 15: left-end, right-end, v, v-top
  scene.textures.addImage('fence-tl', extractRegion(struct, 0 * 8, 14 * 8, 8, 8) as any);
  scene.textures.addImage('fence-tr', extractRegion(struct, 1 * 8, 14 * 8, 8, 8) as any);
  scene.textures.addImage('fence-h',  extractRegion(struct, 2 * 8, 14 * 8, 8, 8) as any);
  scene.textures.addImage('fence-bl', extractRegion(struct, 0 * 8, 15 * 8, 8, 8) as any); // using left-end as bottom-left
  scene.textures.addImage('fence-br', extractRegion(struct, 1 * 8, 15 * 8, 8, 8) as any); // using right-end as bottom-right
  scene.textures.addImage('fence-v',  extractRegion(struct, 2 * 8, 15 * 8, 8, 8) as any);

  // House: from structures — starts at y=16 (row 2), 24x24
  scene.textures.addImage('house', extractRegion(struct, 32, 0, 16, 16) as any);

  // Barn: from structures (offset right) — starts at y=16, 24x24
  scene.textures.addImage('barn', extractRegion(struct, 32, 16, 16, 16) as any);

  // Windmill: from structures — starts at x=32, y=32, 24x24
  scene.textures.addImage('windmill', extractRegion(struct, 32, 32, 16, 24) as any);

  // Indicator (! mark) — 8×8 generated
  const [ic, ictx] = makeCanvas(8, 8);
  ictx.fillStyle = '#ffffff';
  ictx.fillRect(3, 1, 2, 4);
  ictx.fillRect(3, 6, 2, 1);
  scene.textures.addImage('indicator', ic as any);
}

// ============================================================
// Crops — TinyFarm_Crops.png (56×120, 7 cols × 15 rows)
// ============================================================
export function createCropTextures(scene: Phaser.Scene): void {
  const src = getSource(scene, SHEET_KEYS.crops);

  // Legacy Seedling (early growth) - Tile 3,0
  scene.textures.addImage('seedling', extractRegion(src, 24, 0, 8, 8) as any);

  // Define crop row positions (top row of the pair if tall)
  const cropRows: Record<string, number> = {
    [CropType.Tomato]: 4 * 8, // Row 4
    [CropType.Carrot]: 12 * 8, // Row 12
    [CropType.Corn]: 10 * 8,   // Row 10
    [CropType.Rice]: 14 * 8,   // Row 14
  };

  const cropTypes = Object.values(CropType);

  for (const type of cropTypes) {
    const rowY = cropRows[type];
    const isTall = GAME_CONFIG.CROP_HEIGHTS[type] === 16;

    for (let stage = 0; stage < 4; stage++) {
      let sx = 0;
      let sy = rowY;
      let sw = 8;
      let sh = 8;

      // Col 3: Stage 0, Col 4: Stage 1, Col 5: Stage 2, Col 6: Stage 3 (Mature)
      if (stage === 0) sx = 24;
      else if (stage === 1) sx = 32;
      else if (stage === 2) sx = 40;
      else if (stage === 3) sx = 48;

      // For tall plants, stage 2 and 3 are 8x16
      if (isTall && stage >= 2) {
        sh = 16;
      }

      const key = `crop-${type}-${stage}`;
      const region = extractRegion(src, sx, sy, sw, sh);
      scene.textures.addImage(key, region as any);

      // Extract seed icon from column 2 (x=16) and item icon from column 1 (x=8)
      if (stage === 0) {
        const seedBagKey = `seed-bag-${type}`;
        if (!scene.textures.exists(seedBagKey)) {
          scene.textures.addImage(seedBagKey, extractRegion(src, 16, rowY, 8, 8) as any);
        }
        
        const itemIconKey = `item-icon-${type}`;
        if (!scene.textures.exists(itemIconKey)) {
          scene.textures.addImage(itemIconKey, extractRegion(src, 0, rowY, 8, 8) as any);
        }
      }

      // Legacy compatibility for mature stage
      if (stage === 3) {
        scene.textures.addImage(`crop-${type}`, region as any);
      }
    }
  }
}

// ============================================================
// UI Textures — TinyFarm_Items.png (56×32, 7 cols × 4 rows)
// ============================================================
export function createUITextures(scene: Phaser.Scene): void {
  const src = getSource(scene, SHEET_KEYS.items);

  scene.textures.addImage('coin-icon', extractRegion(src, 0, 0, 8, 8) as any);

  const tools: Record<string, [number, number]> = {
    'tool-hoe': [0, 16],
    'tool-water': [16, 0],
    'tool-seed': [0, 0],
    'tool-harvest': [40, 0],
  };
  for (const [key, [sx, sy]] of Object.entries(tools)) {
    scene.textures.addImage(key, extractRegion(src, sx, sy, 8, 8) as any);
  }
}

// ============================================================
// Animations
// ============================================================

/** Character animations (3 frames per direction, 4 directions) */
export function createCharAnimations(scene: Phaser.Scene, key: string): void {
  const dirs = ['down', 'left', 'right', 'up'];
  const fpd = 3;
  for (let i = 0; i < dirs.length; i++) {
    const start = i * fpd;
    if (!scene.anims.exists(`${key}-walk-${dirs[i]}`)) {
      scene.anims.create({
        key: `${key}-walk-${dirs[i]}`,
        frames: scene.anims.generateFrameNumbers(key, {
          start,
          end: start + fpd - 1,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(`${key}-idle-${dirs[i]}`)) {
      scene.anims.create({
        key: `${key}-idle-${dirs[i]}`,
        frames: [{ key, frame: start + 1 }],
        frameRate: 1,
      });
    }
  }
}

/** Animal animations (8 frames: 4 dirs × 2 frames) */
export function createAnimalAnimations(scene: Phaser.Scene, key: string): void {
  const dirs = ['down', 'right', 'up', 'left'];
  for (let i = 0; i < dirs.length; i++) {
    const start = i;
    if (!scene.anims.exists(`${key}-walk-${dirs[i]}`)) {
      scene.anims.create({
        key: `${key}-walk-${dirs[i]}`,
        frames: [{ key, frame: start }],
        frameRate: 1,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(`${key}-idle-${dirs[i]}`)) {
      scene.anims.create({
        key: `${key}-idle-${dirs[i]}`,
        frames: [{ key, frame: start }],
        frameRate: 1,
      });
    }
  }
}

/** Legacy wrapper */
export function createAnimations(scene: Phaser.Scene, key: string): void {
  if (key === 'player' || key.startsWith('npc-')) {
    createCharAnimations(scene, key);
  } else {
    createAnimalAnimations(scene, key);
  }
}

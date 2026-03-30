// ========================================
// SpriteGenerator — สร้าง Pixel Art แบบ Procedural
// วาดตัวละคร สัตว์ NPC ทั้งหมดด้วยโค้ด
// ========================================

import Phaser from 'phaser';
import { AnimalType } from '../types';

/** สีพื้นฐานสำหรับ pixel art */
const COLORS = {
  // ตัวละครหลัก
  skin: '#ffccaa',
  skinShadow: '#e8a878',
  hair: '#5c3317',
  hairHighlight: '#7a4f2e',
  shirt: '#4a90d9',
  shirtShadow: '#3670b0',
  pants: '#3d5c8a',
  pantsShadow: '#2e4a6e',
  shoes: '#6b4226',
  eyes: '#2c3e50',
  // NPC
  npcShirt: '#e74c3c',
  npcShirtShadow: '#c0392b',
  npcHair: '#f39c12',
  npc2Shirt: '#9b59b6',
  npc2ShirtShadow: '#8e44ad',
  npc2Hair: '#e67e22',
  npc3Shirt: '#27ae60',
  npc3ShirtShadow: '#219a52',
  npc3Hair: '#2c3e50',
  // สัตว์
  chickenBody: '#ffffff',
  chickenBeak: '#ff9800',
  chickenComb: '#f44336',
  chickenFeet: '#ff9800',
  pigBody: '#ffb6c1',
  pigSnout: '#ff8fab',
  pigEars: '#ff8fab',
  cowBody: '#f5f5dc',
  cowSpots: '#5c4033',
  cowHorns: '#d4a574',
};

/**
 * วาด pixel ลงบน CanvasTexture
 */
function setPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

/**
 * วาดรูปตัวละคร (Player) — 32x32 pixel art ตัวน่ารัก
 * @param ctx - Canvas context
 * @param frame - เฟรม animation (0-3)
 * @param direction - ทิศทาง (0=down, 1=left, 2=right, 3=up)
 * @param offsetX - ตำแหน่ง X offset บน spritesheet
 * @param offsetY - ตำแหน่ง Y offset บน spritesheet
 */
function drawCharacter(
  ctx: CanvasRenderingContext2D,
  frame: number,
  direction: number,
  offsetX: number,
  offsetY: number,
  palette: {
    hair: string;
    hairHighlight: string;
    shirt: string;
    shirtShadow: string;
  }
): void {
  const px = (x: number, y: number, color: string) =>
    setPixel(ctx, offsetX + x, offsetY + y, color);

  // การขยับขา/แขนตามเฟรม
  const legOffset = frame === 1 ? -1 : frame === 3 ? 1 : 0;
  const armOffset = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  const bobY = (frame === 1 || frame === 3) ? -1 : 0;

  // === ผม (ด้านบน) ===
  for (let x = 11; x <= 20; x++) {
    px(x, 4 + bobY, palette.hair);
  }
  for (let x = 10; x <= 21; x++) {
    px(x, 5 + bobY, palette.hair);
    px(x, 6 + bobY, x % 3 === 0 ? palette.hairHighlight : palette.hair);
  }

  // === หัว (หน้า/หลัง) ===
  for (let y = 7; y <= 13; y++) {
    for (let x = 11; x <= 20; x++) {
      const isShadow = x <= 12 || y >= 12;
      px(x, y + bobY, isShadow ? COLORS.skinShadow : COLORS.skin);
    }
  }

  // === ตา & ปาก (ถ้าหันหน้า) ===
  if (direction === 0) {
    // หันลง - เห็นหน้า
    px(13, 9 + bobY, COLORS.eyes);
    px(14, 9 + bobY, COLORS.eyes);
    px(18, 9 + bobY, COLORS.eyes);
    px(17, 9 + bobY, COLORS.eyes);
    // ปาก
    px(15, 11 + bobY, '#e88');
    px(16, 11 + bobY, '#e88');
  } else if (direction === 3) {
    // หันขึ้น - เห็นหลังหัว ผมเยอะขึ้น
    for (let y = 7; y <= 12; y++) {
      for (let x = 11; x <= 20; x++) {
        px(x, y + bobY, y % 2 === 0 ? palette.hairHighlight : palette.hair);
      }
    }
  } else if (direction === 1) {
    // หันซ้าย
    px(12, 9 + bobY, COLORS.eyes);
    px(13, 9 + bobY, COLORS.eyes);
    px(12, 11 + bobY, '#e88');
  } else {
    // หันขวา
    px(18, 9 + bobY, COLORS.eyes);
    px(19, 9 + bobY, COLORS.eyes);
    px(19, 11 + bobY, '#e88');
  }

  // === ลำตัว (เสื้อ) ===
  for (let y = 14; y <= 20; y++) {
    for (let x = 10; x <= 21; x++) {
      const isShadow = x <= 12 || y >= 19;
      px(x, y + bobY, isShadow ? palette.shirtShadow : palette.shirt);
    }
  }
  // คอเสื้อ
  px(14, 14 + bobY, COLORS.skin);
  px(15, 14 + bobY, COLORS.skin);
  px(16, 14 + bobY, COLORS.skin);
  px(17, 14 + bobY, COLORS.skin);

  // === แขน ===
  const armY1 = 15 + bobY + armOffset;
  const armY2 = 18 + bobY + armOffset;
  for (let y = armY1; y <= armY2; y++) {
    px(8, y, palette.shirtShadow);
    px(9, y, palette.shirt);
    px(22, y, palette.shirt);
    px(23, y, palette.shirtShadow);
  }
  // มือ
  px(8, armY2 + 1, COLORS.skin);
  px(9, armY2 + 1, COLORS.skin);
  px(22, armY2 + 1, COLORS.skin);
  px(23, armY2 + 1, COLORS.skin);

  // === กางเกง ===
  for (let y = 21; y <= 24; y++) {
    for (let x = 11; x <= 20; x++) {
      px(x, y + bobY, x <= 15 ? COLORS.pants : COLORS.pantsShadow);
    }
  }

  // === ขา & รองเท้า ===
  const leftLegX = 12 + legOffset;
  const rightLegX = 18 - legOffset;
  for (let y = 25; y <= 27; y++) {
    px(leftLegX, y + bobY, COLORS.pants);
    px(leftLegX + 1, y + bobY, COLORS.pantsShadow);
    px(rightLegX, y + bobY, COLORS.pants);
    px(rightLegX + 1, y + bobY, COLORS.pantsShadow);
  }
  // รองเท้า
  px(leftLegX - 1, 28 + bobY, COLORS.shoes);
  px(leftLegX, 28 + bobY, COLORS.shoes);
  px(leftLegX + 1, 28 + bobY, COLORS.shoes);
  px(leftLegX + 2, 28 + bobY, COLORS.shoes);
  px(rightLegX - 1, 28 + bobY, COLORS.shoes);
  px(rightLegX, 28 + bobY, COLORS.shoes);
  px(rightLegX + 1, 28 + bobY, COLORS.shoes);
  px(rightLegX + 2, 28 + bobY, COLORS.shoes);
}

/**
 * สร้าง Player Spritesheet (4 ทิศ × 4 เฟรม = 128×128)
 */
export function generatePlayerSpritesheet(scene: Phaser.Scene): void {
  const frameW = 32;
  const frameH = 32;
  const cols = 4; // 4 frames per direction
  const rows = 4; // 4 directions (down, left, right, up)
  const canvas = document.createElement('canvas');
  canvas.width = frameW * cols;
  canvas.height = frameH * rows;
  const ctx = canvas.getContext('2d')!;

  const palette = {
    hair: COLORS.hair,
    hairHighlight: COLORS.hairHighlight,
    shirt: COLORS.shirt,
    shirtShadow: COLORS.shirtShadow,
  };

  for (let dir = 0; dir < rows; dir++) {
    for (let frame = 0; frame < cols; frame++) {
      drawCharacter(ctx, frame, dir, frame * frameW, dir * frameH, palette);
    }
  }

  scene.textures.addSpriteSheet('player', canvas as any, {
    frameWidth: frameW,
    frameHeight: frameH,
  });
}

/**
 * สร้าง NPC Spritesheets
 */
export function generateNPCSpritesheets(scene: Phaser.Scene): void {
  const npcPalettes = [
    {
      key: 'npc-farmer',
      hair: COLORS.npcHair,
      hairHighlight: '#f5b041',
      shirt: COLORS.npcShirt,
      shirtShadow: COLORS.npcShirtShadow,
    },
    {
      key: 'npc-merchant',
      hair: COLORS.npc2Hair,
      hairHighlight: '#eb984e',
      shirt: COLORS.npc2Shirt,
      shirtShadow: COLORS.npc2ShirtShadow,
    },
    {
      key: 'npc-elder',
      hair: COLORS.npc3Hair,
      hairHighlight: '#34495e',
      shirt: COLORS.npc3Shirt,
      shirtShadow: COLORS.npc3ShirtShadow,
    },
  ];

  for (const npc of npcPalettes) {
    const frameW = 32;
    const frameH = 32;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * 4;
    canvas.height = frameH * 4;
    const ctx = canvas.getContext('2d')!;

    for (let dir = 0; dir < 4; dir++) {
      for (let frame = 0; frame < 4; frame++) {
        drawCharacter(ctx, frame, dir, frame * frameW, dir * frameH, npc);
      }
    }

    scene.textures.addSpriteSheet(npc.key, canvas as any, {
      frameWidth: frameW,
      frameHeight: frameH,
    });
  }
}

/**
 * วาดไก่ 🐔
 */
function drawChicken(
  ctx: CanvasRenderingContext2D,
  frame: number,
  direction: number,
  ox: number,
  oy: number
): void {
  const px = (x: number, y: number, c: string) => setPixel(ctx, ox + x, oy + y, c);
  const bob = frame % 2 === 1 ? -1 : 0;
  const legOff = frame === 1 ? 1 : frame === 3 ? -1 : 0;

  // หงอน
  px(15, 8 + bob, COLORS.chickenComb);
  px(16, 8 + bob, COLORS.chickenComb);
  px(16, 7 + bob, COLORS.chickenComb);

  // ตัว (กลม)
  for (let y = 10; y <= 20; y++) {
    for (let x = 10; x <= 22; x++) {
      const dx = x - 16, dy = y - 15;
      if (dx * dx + dy * dy <= 40) {
        px(x, y + bob, COLORS.chickenBody);
      }
    }
  }

  // ตา
  if (direction !== 3) {
    if (direction === 1) px(11, 12 + bob, COLORS.eyes);
    else if (direction === 2) px(21, 12 + bob, COLORS.eyes);
    else { px(13, 12 + bob, COLORS.eyes); px(19, 12 + bob, COLORS.eyes); }
  }

  // ปาก
  if (direction === 0) { px(15, 15 + bob, COLORS.chickenBeak); px(16, 15 + bob, COLORS.chickenBeak); }
  else if (direction === 1) { px(9, 13 + bob, COLORS.chickenBeak); px(8, 13 + bob, COLORS.chickenBeak); }
  else if (direction === 2) { px(23, 13 + bob, COLORS.chickenBeak); px(24, 13 + bob, COLORS.chickenBeak); }

  // ขา
  px(13 + legOff, 21 + bob, COLORS.chickenFeet);
  px(13 + legOff, 22 + bob, COLORS.chickenFeet);
  px(18 - legOff, 21 + bob, COLORS.chickenFeet);
  px(18 - legOff, 22 + bob, COLORS.chickenFeet);

  // หาง
  if (direction === 0 || direction === 3) {
    px(16, 20 + bob, '#ddd');
    px(17, 21 + bob, '#ddd');
  }
}

/**
 * วาดหมู 🐷
 */
function drawPig(
  ctx: CanvasRenderingContext2D,
  frame: number,
  direction: number,
  ox: number,
  oy: number
): void {
  const px = (x: number, y: number, c: string) => setPixel(ctx, ox + x, oy + y, c);
  const bob = frame % 2 === 1 ? -1 : 0;
  const legOff = frame === 1 ? 1 : frame === 3 ? -1 : 0;

  // ตัว (วงรี)
  for (let y = 10; y <= 22; y++) {
    for (let x = 8; x <= 24; x++) {
      const dx = (x - 16) / 9, dy = (y - 16) / 7;
      if (dx * dx + dy * dy <= 1) {
        px(x, y + bob, COLORS.pigBody);
      }
    }
  }

  // หู
  px(11, 8 + bob, COLORS.pigEars);
  px(12, 8 + bob, COLORS.pigEars);
  px(12, 9 + bob, COLORS.pigEars);
  px(20, 8 + bob, COLORS.pigEars);
  px(21, 8 + bob, COLORS.pigEars);
  px(20, 9 + bob, COLORS.pigEars);

  // ตา
  if (direction !== 3) {
    if (direction === 1) px(10, 13 + bob, COLORS.eyes);
    else if (direction === 2) px(22, 13 + bob, COLORS.eyes);
    else { px(13, 13 + bob, COLORS.eyes); px(19, 13 + bob, COLORS.eyes); }
  }

  // จมูก
  if (direction === 0) {
    px(14, 16 + bob, COLORS.pigSnout); px(15, 16 + bob, COLORS.pigSnout);
    px(17, 16 + bob, COLORS.pigSnout); px(18, 16 + bob, COLORS.pigSnout);
    px(15, 17 + bob, COLORS.pigSnout); px(17, 17 + bob, COLORS.pigSnout);
  }

  // ขา (4 ขา)
  px(11 + legOff, 22 + bob, '#e8a0aa');
  px(11 + legOff, 23 + bob, '#e8a0aa');
  px(14 - legOff, 22 + bob, '#e8a0aa');
  px(14 - legOff, 23 + bob, '#e8a0aa');
  px(18 + legOff, 22 + bob, '#e8a0aa');
  px(18 + legOff, 23 + bob, '#e8a0aa');
  px(21 - legOff, 22 + bob, '#e8a0aa');
  px(21 - legOff, 23 + bob, '#e8a0aa');

  // หาง (ม้วน)
  if (direction === 0 || direction === 3) {
    px(16, 22 + bob, COLORS.pigBody);
    px(17, 21 + bob, COLORS.pigBody);
    px(18, 22 + bob, COLORS.pigBody);
  }
}

/**
 * วาดวัว 🐄
 */
function drawCow(
  ctx: CanvasRenderingContext2D,
  frame: number,
  direction: number,
  ox: number,
  oy: number
): void {
  const px = (x: number, y: number, c: string) => setPixel(ctx, ox + x, oy + y, c);
  const bob = frame % 2 === 1 ? -1 : 0;
  const legOff = frame === 1 ? 1 : frame === 3 ? -1 : 0;

  // เขา
  px(11, 6 + bob, COLORS.cowHorns);
  px(10, 7 + bob, COLORS.cowHorns);
  px(21, 6 + bob, COLORS.cowHorns);
  px(22, 7 + bob, COLORS.cowHorns);

  // ตัว (ใหญ่กว่าหมู)
  for (let y = 8; y <= 22; y++) {
    for (let x = 7; x <= 25; x++) {
      const dx = (x - 16) / 10, dy = (y - 15) / 8;
      if (dx * dx + dy * dy <= 1) {
        px(x, y + bob, COLORS.cowBody);
      }
    }
  }

  // จุดบนตัว
  const spots = [[12, 12], [18, 14], [14, 18], [20, 11], [10, 16]];
  for (const [sx, sy] of spots) {
    px(sx, sy + bob, COLORS.cowSpots);
    px(sx + 1, sy + bob, COLORS.cowSpots);
    px(sx, sy + 1 + bob, COLORS.cowSpots);
  }

  // ตา
  if (direction !== 3) {
    if (direction === 1) px(9, 12 + bob, COLORS.eyes);
    else if (direction === 2) px(23, 12 + bob, COLORS.eyes);
    else { px(12, 12 + bob, COLORS.eyes); px(20, 12 + bob, COLORS.eyes); }
  }

  // ขา
  px(10 + legOff, 22 + bob, '#d4c5a9');
  px(10 + legOff, 23 + bob, '#d4c5a9');
  px(10 + legOff, 24 + bob, '#8b7355');
  px(14 - legOff, 22 + bob, '#d4c5a9');
  px(14 - legOff, 23 + bob, '#d4c5a9');
  px(14 - legOff, 24 + bob, '#8b7355');
  px(18 + legOff, 22 + bob, '#d4c5a9');
  px(18 + legOff, 23 + bob, '#d4c5a9');
  px(18 + legOff, 24 + bob, '#8b7355');
  px(22 - legOff, 22 + bob, '#d4c5a9');
  px(22 - legOff, 23 + bob, '#d4c5a9');
  px(22 - legOff, 24 + bob, '#8b7355');
}

/**
 * สร้าง Animal Spritesheets
 */
export function generateAnimalSpritesheets(scene: Phaser.Scene): void {
  const animals: { type: AnimalType; drawFn: typeof drawChicken }[] = [
    { type: AnimalType.Chicken, drawFn: drawChicken },
    { type: AnimalType.Pig, drawFn: drawPig },
    { type: AnimalType.Cow, drawFn: drawCow },
  ];

  for (const animal of animals) {
    const frameW = 32;
    const frameH = 32;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * 4;
    canvas.height = frameH * 4;
    const ctx = canvas.getContext('2d')!;

    for (let dir = 0; dir < 4; dir++) {
      for (let frame = 0; frame < 4; frame++) {
        animal.drawFn(ctx, frame, dir, frame * frameW, dir * frameH);
      }
    }

    scene.textures.addSpriteSheet(animal.type, canvas as any, {
      frameWidth: frameW,
      frameHeight: frameH,
    });
  }
}

/**
 * สร้าง Tileset Texture (แต่ละ tile 32x32)
 */
export function generateTileset(scene: Phaser.Scene): void {
  const tileSize = 32;
  const tilesCount = 16;
  const canvas = document.createElement('canvas');
  canvas.width = tileSize * tilesCount;
  canvas.height = tileSize;
  const ctx = canvas.getContext('2d')!;

  // Helper วาดหญ้า
  const drawGrass = (ox: number, baseColor: string, darkColor: string) => {
    ctx.fillStyle = baseColor;
    ctx.fillRect(ox, 0, tileSize, tileSize);
    // เพิ่มลาย
    for (let i = 0; i < 12; i++) {
      const gx = ox + Math.floor(Math.random() * 30) + 1;
      const gy = Math.floor(Math.random() * 30) + 1;
      ctx.fillStyle = darkColor;
      ctx.fillRect(gx, gy, 1, 2);
    }
  };

  // 0: Grass — หญ้าเขียวอ่อน
  drawGrass(0, '#7ec850', '#6ab040');

  // 1: GrassDark — หญ้าเขียวเข้ม
  drawGrass(tileSize, '#5da03a', '#4d8a2e');

  // 2: Dirt — ดิน
  ctx.fillStyle = '#c4a46c';
  ctx.fillRect(tileSize * 2, 0, tileSize, tileSize);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = '#b0905c';
    const dx = tileSize * 2 + Math.floor(Math.random() * 30) + 1;
    const dy = Math.floor(Math.random() * 30) + 1;
    ctx.fillRect(dx, dy, 2, 2);
  }

  // 3: DirtPath — ทางเดิน
  ctx.fillStyle = '#d4b896';
  ctx.fillRect(tileSize * 3, 0, tileSize, tileSize);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = '#c4a880';
    const dx = tileSize * 3 + Math.floor(Math.random() * 30) + 1;
    const dy = Math.floor(Math.random() * 30) + 1;
    ctx.fillRect(dx, dy, 2, 1);
  }

  // 4: Water — น้ำ
  ctx.fillStyle = '#4a9bd9';
  ctx.fillRect(tileSize * 4, 0, tileSize, tileSize);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = '#5aaae8';
    const wx = tileSize * 4 + Math.floor(Math.random() * 28) + 2;
    const wy = Math.floor(Math.random() * 28) + 2;
    ctx.fillRect(wx, wy, 4, 1);
  }

  // 5: WaterDeep — น้ำลึก
  ctx.fillStyle = '#3580b5';
  ctx.fillRect(tileSize * 5, 0, tileSize, tileSize);

  // 6: Flower1 — ดอกไม้แดง (บนหญ้า)
  drawGrass(tileSize * 6, '#7ec850', '#6ab040');
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(tileSize * 6 + 14, 12, 4, 4);
  ctx.fillStyle = '#ffeb3b';
  ctx.fillRect(tileSize * 6 + 15, 13, 2, 2);
  // ก้าน
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(tileSize * 6 + 15, 16, 2, 6);

  // 7: Flower2 — ดอกไม้เหลืองบนหญ้า
  drawGrass(tileSize * 7, '#7ec850', '#6ab040');
  ctx.fillStyle = '#fff176';
  ctx.fillRect(tileSize * 7 + 8, 10, 4, 4);
  ctx.fillStyle = '#ffb300';
  ctx.fillRect(tileSize * 7 + 9, 11, 2, 2);
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(tileSize * 7 + 9, 14, 2, 6);

  // 8: FarmSoil — ดินเพาะปลูก
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(tileSize * 8, 0, tileSize, tileSize);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#7a5c10';
    ctx.fillRect(tileSize * 8 + 2, 4 + i * 8, 28, 2);
  }

  // 9: FarmSoilWet — ดินเปียก
  ctx.fillStyle = '#6b5010';
  ctx.fillRect(tileSize * 9, 0, tileSize, tileSize);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#5a430c';
    ctx.fillRect(tileSize * 9 + 2, 4 + i * 8, 28, 2);
  }

  // 10: Bridge — สะพาน
  ctx.fillStyle = '#a0784c';
  ctx.fillRect(tileSize * 10, 0, tileSize, tileSize);
  ctx.fillStyle = '#8b6839';
  ctx.fillRect(tileSize * 10, 0, tileSize, 4);
  ctx.fillRect(tileSize * 10, 28, tileSize, 4);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#937050';
    ctx.fillRect(tileSize * 10 + 2 + i * 8, 4, 4, 24);
  }

  // 11-15: ว่างไว้สำรอง (สีดำ)
  for (let t = 11; t < tilesCount; t++) {
    ctx.fillStyle = '#222';
    ctx.fillRect(tileSize * t, 0, tileSize, tileSize);
  }

  scene.textures.addSpriteSheet('tileset', canvas as any, {
    frameWidth: tileSize,
    frameHeight: tileSize,
  });
}

/**
 * สร้าง Obstacle Textures (ต้นไม้, รั้ว, ก้อนหิน)
 */
export function generateObstacleTextures(scene: Phaser.Scene): void {
  const size = 32;

  // === ต้นไม้ ===
  const treeCanvas = document.createElement('canvas');
  treeCanvas.width = size;
  treeCanvas.height = size;
  const tctx = treeCanvas.getContext('2d')!;
  // ลำต้น
  tctx.fillStyle = '#8B6914';
  tctx.fillRect(13, 18, 6, 14);
  tctx.fillStyle = '#7a5c10';
  tctx.fillRect(14, 18, 2, 14);
  // ใบไม้ (กลม)
  for (let y = 2; y <= 20; y++) {
    for (let x = 3; x <= 29; x++) {
      const dx = x - 16, dy = y - 11;
      if (dx * dx / 170 + dy * dy / 100 <= 1) {
        const shade = Math.random() > 0.5 ? '#2d8a4e' : '#3da862';
        tctx.fillStyle = shade;
        tctx.fillRect(x, y, 1, 1);
      }
    }
  }
  // ไฮไลท์ใบไม้
  tctx.fillStyle = '#5cdb7e';
  tctx.fillRect(10, 6, 3, 2);
  tctx.fillRect(18, 8, 4, 2);
  scene.textures.addImage('tree', treeCanvas as any);

  // === รั้ว ===
  const fenceCanvas = document.createElement('canvas');
  fenceCanvas.width = size;
  fenceCanvas.height = size;
  const fctx = fenceCanvas.getContext('2d')!;
  fctx.fillStyle = '#b8860b';
  // เสาซ้าย
  fctx.fillRect(2, 8, 4, 24);
  // เสาขวา
  fctx.fillRect(26, 8, 4, 24);
  // ราวบน
  fctx.fillRect(0, 10, 32, 4);
  // ราวล่าง
  fctx.fillRect(0, 20, 32, 4);
  // ปลายเสาแหลม
  fctx.fillStyle = '#cd9b1d';
  fctx.fillRect(3, 6, 2, 2);
  fctx.fillRect(27, 6, 2, 2);
  scene.textures.addImage('fence', fenceCanvas as any);

  // === ก้อนหิน ===
  const rockCanvas = document.createElement('canvas');
  rockCanvas.width = size;
  rockCanvas.height = size;
  const rctx = rockCanvas.getContext('2d')!;
  for (let y = 10; y <= 28; y++) {
    for (let x = 6; x <= 26; x++) {
      const dx = (x - 16) / 11, dy = (y - 20) / 10;
      if (dx * dx + dy * dy <= 1) {
        const shade = Math.random() > 0.5 ? '#888' : '#999';
        rctx.fillStyle = shade;
        rctx.fillRect(x, y, 1, 1);
      }
    }
  }
  // ไฮไลท์
  rctx.fillStyle = '#bbb';
  rctx.fillRect(10, 14, 4, 2);
  rctx.fillRect(18, 16, 3, 2);
  scene.textures.addImage('rock', rockCanvas as any);

  // === Crop icons ===
  const crops = [
    { key: 'crop-tomato', color: '#ff4444', stemColor: '#4caf50' },
    { key: 'crop-carrot', color: '#ff8c00', stemColor: '#4caf50' },
    { key: 'crop-corn', color: '#ffd700', stemColor: '#6b8e23' },
    { key: 'crop-pumpkin', color: '#ff6600', stemColor: '#4caf50' },
  ];

  for (const crop of crops) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const cctx = c.getContext('2d')!;
    // ก้าน
    cctx.fillStyle = crop.stemColor;
    cctx.fillRect(14, 6, 4, 12);
    // ใบ
    cctx.fillRect(10, 8, 4, 3);
    cctx.fillRect(18, 10, 5, 3);
    // ผล
    for (let y = 18; y <= 28; y++) {
      for (let x = 8; x <= 24; x++) {
        const dx = (x - 16) / 9, dy = (y - 23) / 6;
        if (dx * dx + dy * dy <= 1) {
          cctx.fillStyle = crop.color;
          cctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // ไฮไลท์
    cctx.fillStyle = '#fff';
    cctx.globalAlpha = 0.3;
    cctx.fillRect(11, 20, 3, 2);
    cctx.globalAlpha = 1;
    scene.textures.addImage(crop.key, c as any);
  }

  // === Seedling (ต้นอ่อน) ===
  const seedlingCanvas = document.createElement('canvas');
  seedlingCanvas.width = size;
  seedlingCanvas.height = size;
  const sctx = seedlingCanvas.getContext('2d')!;
  sctx.fillStyle = '#4caf50';
  sctx.fillRect(15, 16, 2, 8);
  sctx.fillRect(12, 14, 3, 3);
  sctx.fillRect(17, 12, 3, 3);
  sctx.fillRect(14, 10, 4, 4);
  scene.textures.addImage('seedling', seedlingCanvas as any);

  // === Interaction indicator ===
  const indicatorCanvas = document.createElement('canvas');
  indicatorCanvas.width = 16;
  indicatorCanvas.height = 16;
  const ictx = indicatorCanvas.getContext('2d')!;
  ictx.fillStyle = '#fff';
  // "!" mark
  ictx.fillRect(6, 2, 4, 8);
  ictx.fillRect(6, 12, 4, 3);
  scene.textures.addImage('indicator', indicatorCanvas as any);
}

/**
 * สร้าง UI Textures
 */
export function generateUITextures(scene: Phaser.Scene): void {
  // Coin icon
  const coinCanvas = document.createElement('canvas');
  coinCanvas.width = 16;
  coinCanvas.height = 16;
  const cctx = coinCanvas.getContext('2d')!;
  for (let y = 2; y <= 13; y++) {
    for (let x = 2; x <= 13; x++) {
      const dx = x - 8, dy = y - 8;
      if (dx * dx + dy * dy <= 36) {
        cctx.fillStyle = dx * dx + dy * dy <= 25 ? '#ffd700' : '#daa520';
        cctx.fillRect(x, y, 1, 1);
      }
    }
  }
  cctx.fillStyle = '#b8860b';
  cctx.fillRect(7, 4, 2, 8);
  cctx.fillRect(5, 5, 6, 1);
  cctx.fillRect(5, 10, 6, 1);
  scene.textures.addImage('coin-icon', coinCanvas as any);

  // Tool icons
  const tools = [
    { key: 'tool-hoe', color: '#8b4513' },
    { key: 'tool-water', color: '#4a9bd9' },
    { key: 'tool-seed', color: '#8bc34a' },
    { key: 'tool-harvest', color: '#ff9800' },
  ];

  for (const tool of tools) {
    const tc = document.createElement('canvas');
    tc.width = 24;
    tc.height = 24;
    const tctx = tc.getContext('2d')!;
    tctx.fillStyle = tool.color;
    // Simple tool shape
    tctx.fillRect(10, 2, 4, 14);
    tctx.fillRect(4, 16, 16, 6);
    tctx.fillStyle = '#666';
    tctx.fillRect(11, 2, 2, 10);
    scene.textures.addImage(tool.key, tc as any);
  }
}

/**
 * สร้าง Animations จาก Spritesheet
 */
export function createAnimations(scene: Phaser.Scene, key: string): void {
  const directions = ['down', 'left', 'right', 'up'];

  for (let i = 0; i < directions.length; i++) {
    const dir = directions[i];

    // Walk animation
    if (!scene.anims.exists(`${key}-walk-${dir}`)) {
      scene.anims.create({
        key: `${key}-walk-${dir}`,
        frames: scene.anims.generateFrameNumbers(key, {
          start: i * 4,
          end: i * 4 + 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    // Idle (ใช้เฟรมแรกของแต่ละทิศ)
    if (!scene.anims.exists(`${key}-idle-${dir}`)) {
      scene.anims.create({
        key: `${key}-idle-${dir}`,
        frames: [{ key, frame: i * 4 }],
        frameRate: 1,
      });
    }
  }
}

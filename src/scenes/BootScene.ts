// ========================================
// BootScene — โหลด TinyFarm Sprite Sheets
// พร้อม Loading Bar Animation
// ========================================

import Phaser from 'phaser';
import {
  preloadAssets,
  createCharacterSpritesheets,
  createAnimalSpritesheets,
  createTileset,
  createObstacleTextures,
  createCropTextures,
  createUITextures,
  createAnimations,
} from '../utils/SpriteGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  /** โหลด sprite sheet images */
  preload(): void {
    preloadAssets(this);
  }

  create(): void {
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(cx, cy - 80, 'Pixel Farm 2D', {
      fontSize: '28px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#7ec850',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 45, 'Explore the Farm', {
      fontSize: '14px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Loading bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333355, 1);
    barBg.fillRoundedRect(cx - 160, cy, 320, 30, 8);
    barBg.lineStyle(2, 0x4a90d9, 1);
    barBg.strokeRoundedRect(cx - 160, cy, 320, 30, 8);

    // Loading bar fill
    const barFill = this.add.graphics();

    // Loading text
    const loadText = this.add.text(cx, cy + 50, 'Building world...', {
      fontSize: '10px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#aaaadd',
    }).setOrigin(0.5);

    // Simulate loading progress
    const steps = [
      'Drawing characters...',
      'Creating farm animals...',
      'Planting trees...',
      'Building the map...',
      'Preparing tools...',
      'Almost ready...',
    ];

    let currentStep = 0;
    const totalSteps = steps.length;

    this.time.addEvent({
      delay: 300,
      repeat: totalSteps - 1,
      callback: () => {
        currentStep++;
        const progress = currentStep / totalSteps;

        barFill.clear();
        barFill.fillStyle(0x7ec850, 1);
        barFill.fillRoundedRect(
          cx - 157, cy + 3,
          314 * progress, 24,
          6
        );

        // Gradient effect
        barFill.fillStyle(0x9edf7a, 0.5);
        barFill.fillRoundedRect(
          cx - 157, cy + 3,
          314 * progress, 12,
          { tl: 6, tr: 6, bl: 0, br: 0 }
        );

        if (currentStep < steps.length) {
          loadText.setText(steps[currentStep]);
        }

        if (currentStep >= totalSteps) {
          loadText.setText('Ready to play!');
          // สร้าง assets ทั้งหมดจาก loaded sprite sheets
          this.generateAllAssets();

          this.time.delayedCall(500, () => {
            this.scene.start('MainScene');
          });
        }
      },
    });
  }

  /** สร้าง assets จาก TinyFarm sprite sheets */
  private generateAllAssets(): void {
    // 1. Tileset
    createTileset(this);

    // 2. Characters (Player + NPCs)
    createCharacterSpritesheets(this);
    createAnimations(this, 'player');

    // 3. Animals
    createAnimalSpritesheets(this);

    // 4. Obstacles & decorations
    createObstacleTextures(this);

    // 5. Crops
    createCropTextures(this);

    // 6. UI textures
    createUITextures(this);
  }
}

// ========================================
// FarmingSystem — ระบบปลูกผัก
// ไถดิน → หว่านเมล็ด → รดน้ำ → เก็บเกี่ยว
// ========================================

import Phaser from 'phaser';
import {
  FarmPlot, PlotState, CropType, TileType,
  GAME_CONFIG,
} from '../types';
import { Player } from '../entities/Player';

export class FarmingSystem {
  private scene: Phaser.Scene;
  private plots: FarmPlot[] = [];
  private plotSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private cropSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private player: Player;
  private statusText: Phaser.GameObjects.Text;
  private actionKey: Phaser.Input.Keyboard.Key;
  private toolKeys: {
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
    four: Phaser.Input.Keyboard.Key;
  };

  constructor(
    scene: Phaser.Scene,
    player: Player,
    mapData: number[][]
  ) {
    this.scene = scene;
    this.player = player;

    // สถานะข้อความ
    this.statusText = scene.add.text(
      scene.cameras.main.width / 2,
      scene.cameras.main.height - 90,
      '',
      {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(999)
      .setAlpha(0);

    // ปุ่ม E เพื่อ interact กับแปลง
    this.actionKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    // ปุ่ม 1-4 เพื่อเลือก tool
    this.toolKeys = {
      one: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      three: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      four: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    };

    // สร้างแปลงจาก map data
    this.initializePlots(mapData);
  }

  /** หา farm soil tiles จาก map data */
  private initializePlots(mapData: number[][]): void {
    const { TILE_SIZE } = GAME_CONFIG;
    for (let y = 0; y < mapData.length; y++) {
      for (let x = 0; x < mapData[y].length; x++) {
        if (mapData[y][x] === TileType.FarmSoil) {
          this.plots.push({
            x: x * TILE_SIZE + TILE_SIZE / 2,
            y: y * TILE_SIZE + TILE_SIZE / 2,
            tileX: x,
            tileY: y,
            state: PlotState.Empty,
            crop: null,
            growthTimer: 0,
            growthRequired: 0,
            watered: false,
          });
        }
      }
    }
  }

  /** หาแปลงที่ใกล้ตัว player ที่สุด */
  private getNearestPlot(): FarmPlot | null {
    const { INTERACTION_DISTANCE } = GAME_CONFIG;
    let nearest: FarmPlot | null = null;
    let minDist: number = INTERACTION_DISTANCE;

    for (const plot of this.plots) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        plot.x, plot.y
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = plot;
      }
    }
    return nearest;
  }

  /** แสดงข้อความชั่วคราว */
  private showStatus(text: string): void {
    this.statusText.setText(text).setAlpha(1);
    this.scene.tweens.add({
      targets: this.statusText,
      alpha: 0,
      delay: 1500,
      duration: 500,
    });
  }

  /** ดำเนินการกับแปลง */
  private interactWithPlot(plot: FarmPlot): void {
    const tool = this.player.playerState.selectedTool;
    const key = `${plot.tileX},${plot.tileY}`;

    switch (plot.state) {
      case PlotState.Empty:
        if (tool === 'hoe') {
          plot.state = PlotState.Tilled;
          this.showStatus('Tilled! Select seed & press E');
          this.updatePlotVisual(plot);
        } else {
          this.showStatus('Select Hoe (press 1) then E');
        }
        break;

      case PlotState.Tilled:
        if (tool === 'seed') {
          const seed = this.player.getAvailableSeed();
          if (seed) {
            this.player.useSeedForCrop(seed);
            plot.state = PlotState.Seeded;
            plot.crop = seed;
            plot.growthRequired = GAME_CONFIG.GROWTH_TIME[seed];
            this.showStatus(`Planted ${this.getCropName(seed)}! Water it!`);
            this.updatePlotVisual(plot);
          } else {
            this.showStatus('No seeds left!');
          }
        } else {
          this.showStatus('Select Seed (press 3) then E');
        }
        break;

      case PlotState.Seeded:
        if (tool === 'water') {
          plot.state = PlotState.Growing;
          plot.watered = true;
          plot.growthTimer = 0;
          this.showStatus('Watered! Wait for crops to grow...');
          this.updatePlotVisual(plot);
        } else {
          this.showStatus('Select Water (press 2) then E');
        }
        break;

      case PlotState.Growing:
        const progress = Math.floor(
          (plot.growthTimer / plot.growthRequired) * 100
        );
        this.showStatus(`Growing... ${progress}%`);
        break;

      case PlotState.Ready:
        if (tool === 'harvest' || true) {
          // Always harvestable
          const crop = plot.crop!;
          const value = GAME_CONFIG.CROP_VALUE[crop];
          this.player.addCoins(value);
          this.player.addItem(crop, 1, this.getCropEmoji(crop));
          this.showStatus(
            `Harvested ${this.getCropName(crop)}! +${value}G`
          );

          // Reset แปลง
          plot.state = PlotState.Empty;
          plot.crop = null;
          plot.growthTimer = 0;
          plot.watered = false;

          // ลบ crop sprite
          const cropSprite = this.cropSprites.get(key);
          if (cropSprite) {
            // Animation เก็บเกี่ยว
            this.scene.tweens.add({
              targets: cropSprite,
              y: cropSprite.y - 20,
              alpha: 0,
              scale: 1.5,
              duration: 400,
              onComplete: () => cropSprite.destroy(),
            });
            this.cropSprites.delete(key);
          }

          this.updatePlotVisual(plot);
        }
        break;
    }
  }

  /** อัปเดตรูปแปลง */
  private updatePlotVisual(plot: FarmPlot): void {
    const key = `${plot.tileX},${plot.tileY}`;
    const { TILE_SIZE } = GAME_CONFIG;

    // อัปเดตสี tile
    let existingSprite = this.plotSprites.get(key);
    if (!existingSprite) {
      existingSprite = this.scene.add.sprite(plot.x, plot.y, 'tileset', TileType.FarmSoil);
      existingSprite.setDepth(0.5);
      this.plotSprites.set(key, existingSprite);
    }

    switch (plot.state) {
      case PlotState.Tilled:
        existingSprite.setFrame(TileType.FarmSoil);
        // วาดเส้นไถ (เพิ่ม mini sprite)
        existingSprite.setTint(0xccaa66);
        break;
      case PlotState.Seeded:
        existingSprite.setFrame(TileType.FarmSoil);
        existingSprite.setTint(0xbb9955);
        break;
      case PlotState.Growing:
        existingSprite.setFrame(TileType.FarmSoilWet);
        existingSprite.clearTint();
        // แสดงต้นอ่อน
        if (!this.cropSprites.has(key)) {
          const seedling = this.scene.add.sprite(
            plot.x, plot.y, 'seedling'
          ).setDepth(plot.y - 1);
          this.cropSprites.set(key, seedling);
        }
        break;
      case PlotState.Ready:
        existingSprite.setFrame(TileType.FarmSoilWet);
        existingSprite.clearTint();
        break;
      case PlotState.Empty:
        existingSprite.setFrame(TileType.FarmSoil);
        existingSprite.clearTint();
        break;
    }
  }

  /** อัปเดตทุกเฟรม */
  update(delta: number): void {
    // Select tool
    if (Phaser.Input.Keyboard.JustDown(this.toolKeys.one)) {
      this.player.playerState.selectedTool = 'hoe';
      this.showStatus('Selected: Hoe');
    } else if (Phaser.Input.Keyboard.JustDown(this.toolKeys.two)) {
      this.player.playerState.selectedTool = 'water';
      this.showStatus('Selected: Watering Can');
    } else if (Phaser.Input.Keyboard.JustDown(this.toolKeys.three)) {
      this.player.playerState.selectedTool = 'seed';
      this.showStatus('Selected: Seeds');
    } else if (Phaser.Input.Keyboard.JustDown(this.toolKeys.four)) {
      this.player.playerState.selectedTool = 'harvest';
      this.showStatus('Selected: Harvest');
    }

    // ตรวจสอบ interaction
    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
      const nearPlot = this.getNearestPlot();
      if (nearPlot) {
        this.interactWithPlot(nearPlot);
      }
    }

    // อัปเดต growth timer
    for (const plot of this.plots) {
      if (plot.state === PlotState.Growing && plot.watered) {
        plot.growthTimer += delta;

        if (plot.growthTimer >= plot.growthRequired) {
          plot.state = PlotState.Ready;
          plot.growthTimer = plot.growthRequired;

          // แสดงพืชโตเต็ม
          const key = `${plot.tileX},${plot.tileY}`;
          const oldSeedling = this.cropSprites.get(key);
          if (oldSeedling) oldSeedling.destroy();

          const cropKey = `crop-${plot.crop}`;
          const cropSprite = this.scene.add.sprite(
            plot.x, plot.y, cropKey
          ).setDepth(plot.y - 1);

          // Animation โผล่ขึ้นมา
          cropSprite.setScale(0);
          this.scene.tweens.add({
            targets: cropSprite,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut',
          });

          this.cropSprites.set(key, cropSprite);
          this.updatePlotVisual(plot);
        }
      }
    }
  }

  private getCropName(crop: CropType): string {
    const names: Record<CropType, string> = {
      [CropType.Tomato]: 'Tomato',
      [CropType.Carrot]: 'Carrot',
      [CropType.Corn]: 'Corn',
      [CropType.Pumpkin]: 'Pumpkin',
    };
    return names[crop];
  }

  private getCropEmoji(crop: CropType): string {
    const emojis: Record<CropType, string> = {
      [CropType.Tomato]: '🍅',
      [CropType.Carrot]: '🥕',
      [CropType.Corn]: '🌽',
      [CropType.Pumpkin]: '🎃',
    };
    return emojis[crop];
  }
}

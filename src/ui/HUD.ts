// ========================================
// HUD — Heads-Up Display (8×8 pixel art style)
// แสดงข้อมูลเหรียญ, inventory, เครื่องมือ, controls
// ========================================

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { GAME_CONFIG, CropType } from '../types';

export class HUD {
  private scene: Phaser.Scene;
  private player: Player;
  private container: Phaser.GameObjects.Container;

  // UI Elements
  private coinText: Phaser.GameObjects.Text;
  private toolText: Phaser.GameObjects.Text;
  private controlsText: Phaser.GameObjects.Text;
  private toolBg: Phaser.GameObjects.Graphics;
  private toolIcon: Phaser.GameObjects.Image;
  private seedBg: Phaser.GameObjects.Graphics;
  private seedIcons: Record<string, Phaser.GameObjects.Image> = {};
  private seedTexts: Record<string, Phaser.GameObjects.Text> = {};

  // Mini-map
  private miniMapContainer: Phaser.GameObjects.Container;
  private miniMapBg: Phaser.GameObjects.Graphics;
  private miniMapPlayerDot: Phaser.GameObjects.Graphics;
  private fsButton: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    const cam = scene.cameras.main;
    const UI_SCALE = 1; // No scale on container for text clarity
    const REF_SCALE = 1.5; // Scale factor used to calculate positions
    this.container = scene.add.container(0, 0).setDepth(900).setScrollFactor(0);
    const viewW = cam.width;
    const viewH = cam.height;

    // === COIN DISPLAY (มุมซ้ายบน) — compact ===
    const coinBg = scene.add.graphics();
    coinBg.fillStyle(0x0a0a2e, 0.85);
    coinBg.fillRoundedRect(6 * REF_SCALE, 6 * REF_SCALE, 100 * REF_SCALE, 20 * REF_SCALE, 4);
    coinBg.lineStyle(1, 0xffd700, 0.7);
    coinBg.strokeRoundedRect(6 * REF_SCALE, 6 * REF_SCALE, 100 * REF_SCALE, 20 * REF_SCALE, 4);

    this.coinText = scene.add.text(14 * REF_SCALE, 10 * REF_SCALE, '🪙 50', {
      fontSize: '14px', // Clearly readable
      fontFamily: '"Press Start 2P", monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 2,
      resolution: 3,
    });

    // === TOOL DISPLAY (ใต้ coin) — compact ===
    this.toolBg = scene.add.graphics();
    this.drawToolBg('hoe');

    this.toolText = scene.add.text(14 * REF_SCALE, 34 * REF_SCALE, '', {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2,
      resolution: 3,
    });

    this.toolIcon = scene.add.image(115 * REF_SCALE, 39 * REF_SCALE, 'tool-hoe').setScale(1.8);

    // === SEED DISPLAY (ใต้ tool) — compact ===
    this.seedBg = scene.add.graphics();
    this.drawSeedBg();

    const cropTypes = Object.values(CropType) as CropType[];
    const startX = 14 * REF_SCALE;
    const spacing = 32 * REF_SCALE;

    cropTypes.forEach((type, index) => {
      const x = startX + index * spacing;
      const y = 63 * REF_SCALE;
      
      this.seedIcons[type] = scene.add.image(x, y, `seed-bag-${type}`).setScale(1.5);
      this.seedTexts[type] = scene.add.text(x + 10, y - 6, '0', {
        fontSize: '10px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#ffffff',
        stroke: '#000',
        strokeThickness: 2,
        resolution: 3,
      });
    });

    // === CONTROLS (มุมขวาล่าง) — smaller ===
    const ctrlW = 250;
    const ctrlH = 120;
    const controlsBg = scene.add.graphics();
    controlsBg.fillStyle(0x0a0a2e, 0.75);
    controlsBg.fillRoundedRect(viewW - ctrlW - 10, viewH - ctrlH - 10, ctrlW, ctrlH, 4);
    controlsBg.lineStyle(1, 0x4a90d9, 0.4);
    controlsBg.strokeRoundedRect(viewW - ctrlW - 10, viewH - ctrlH - 10, ctrlW, ctrlH, 4);

    this.controlsText = scene.add.text(
      viewW - ctrlW,
      viewH - ctrlH - 4,
      [
        'Controls',
        ' ',
        'WASD/Arrow : Move',
        'E : Farm',
        'SPACE : Talk NPC',
        '1 : Hoe , 2 : Water',
        '3 : Seed , 4 : Harvest',
      ].join('\n'),
      {
        fontSize: '10px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#fafafeff',
        stroke: '#000',
        strokeThickness: 1.5,
        resolution: 3,
        lineSpacing: 5,
      }
    );

    // === MINI-MAP (มุมขวาบน) — smaller ===
    const mmW = 80 * REF_SCALE;
    const mmH = 60 * REF_SCALE;
    this.miniMapContainer = scene.add.container(
      viewW - mmW - 10 * REF_SCALE, 10 * REF_SCALE
    ).setScrollFactor(0).setDepth(901);

    this.miniMapBg = scene.add.graphics();
    this.miniMapBg.fillStyle(0x000000, 0.7);
    this.miniMapBg.fillRoundedRect(0, 0, mmW, mmH, 3);
    this.miniMapBg.lineStyle(1, 0x4a90d9, 0.7);
    this.miniMapBg.strokeRoundedRect(0, 0, mmW, mmH, 3);

    const miniMapGraphics = scene.add.graphics();
    this.drawMiniMap(miniMapGraphics, mmW, mmH);

    this.miniMapPlayerDot = scene.add.graphics();

    this.miniMapContainer.add([
      this.miniMapBg,
      miniMapGraphics,
      this.miniMapPlayerDot,
    ]);

    // === FULLSCREEN BUTTON (ทางซ้ายของ Mini-map) ===
    this.fsButton = scene.add.text(viewW - mmW - 55, 15, '⛶', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#4a90d9',
      backgroundColor: '#0a0a2e',
      padding: { x: 5, y: 5 },
      stroke: '#4a90d9',
      strokeThickness: 1,
      resolution: 3,
    })
      .setInteractive({ useHandCursor: true })
      .setDepth(1000)
      .setScrollFactor(0);

    this.fsButton.on('pointerdown', () => {
      if (scene.scale.isFullscreen) {
        scene.scale.stopFullscreen();
      } else {
        scene.scale.startFullscreen();
      }
    });

    this.fsButton.on('pointerover', () => this.fsButton.setColor('#ffffff'));
    this.fsButton.on('pointerout', () => this.fsButton.setColor('#4a90d9'));

    this.container.add([
      coinBg,
      this.coinText,
      this.toolBg,
      this.toolText,
      this.toolIcon,
      this.seedBg,
      ...Object.values(this.seedIcons),
      ...Object.values(this.seedTexts),
      controlsBg,
      this.controlsText,
      this.fsButton,
    ]);
  }

  /** วาดพื้นหลัง tool indicator — compact */
  private drawToolBg(tool: string): void {
    const REF_SCALE = 1.5;
    const toolColors: Record<string, number> = {
      hoe: 0x8b4513,
      water: 0x4a9bd9,
      seed: 0x8bc34a,
      harvest: 0xff9800,
    };

    this.toolBg.clear();
    this.toolBg.fillStyle(0x0a0a2e, 0.85);
    this.toolBg.fillRoundedRect(6 * REF_SCALE, 30 * REF_SCALE, 125 * REF_SCALE, 18 * REF_SCALE, 4);
    this.toolBg.lineStyle(1, toolColors[tool] || 0x888888, 0.7);
    this.toolBg.strokeRoundedRect(6 * REF_SCALE, 30 * REF_SCALE, 125 * REF_SCALE, 18 * REF_SCALE, 4);
  }

  /** วาดพื้นหลัง seed indicator */
  private drawSeedBg(): void {
    const REF_SCALE = 1.5;
    this.seedBg.clear();
    this.seedBg.fillStyle(0x0a0a2e, 0.85);
    this.seedBg.fillRoundedRect(6 * REF_SCALE, 54 * REF_SCALE, 125 * REF_SCALE, 18 * REF_SCALE, 4);
    this.seedBg.lineStyle(1, 0x8bc34a, 0.7);
    this.seedBg.strokeRoundedRect(6 * REF_SCALE, 54 * REF_SCALE, 125 * REF_SCALE, 18 * REF_SCALE, 4);
  }

  /** วาด mini-map — ใช้ TILE_SIZE ที่ถูกต้อง */
  private drawMiniMap(g: Phaser.GameObjects.Graphics, mmW: number, mmH: number): void {
    const { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } = GAME_CONFIG;
    const innerW = mmW - 4;
    const innerH = mmH - 4;
    const scaleX = innerW / (MAP_WIDTH * TILE_SIZE);
    const scaleY = innerH / (MAP_HEIGHT * TILE_SIZE);

    // พื้นเขียว
    g.fillStyle(0x5da03a, 0.8);
    g.fillRect(2, 2, innerW, innerH);

    // แม่น้ำ
    g.fillStyle(0x4a9bd9, 0.9);
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const rx = 30 + Math.floor(Math.sin(y * 0.3) * 2);
      g.fillRect(
        2 + rx * TILE_SIZE * scaleX,
        2 + y * TILE_SIZE * scaleY,
        4 * TILE_SIZE * scaleX,
        TILE_SIZE * scaleY + 1
      );
    }

    // ทางเดิน
    g.fillStyle(0xd4b896, 0.9);
    g.fillRect(2, 2 + 14 * TILE_SIZE * scaleY, 30 * TILE_SIZE * scaleX, 2 * TILE_SIZE * scaleY);
    g.fillRect(2 + 12 * TILE_SIZE * scaleX, 2 + 10 * TILE_SIZE * scaleY, 2 * TILE_SIZE * scaleX, 12 * TILE_SIZE * scaleY);

    // แปลงปลูก
    g.fillStyle(0x8B6914, 0.9);
    g.fillRect(2 + 3 * TILE_SIZE * scaleX, 2 + 18 * TILE_SIZE * scaleY, 8 * TILE_SIZE * scaleX, 8 * TILE_SIZE * scaleY);
    g.fillRect(2 + 16 * TILE_SIZE * scaleX, 2 + 18 * TILE_SIZE * scaleY, 8 * TILE_SIZE * scaleX, 6 * TILE_SIZE * scaleY);
  }

  /** อัปเดต HUD ทุกเฟรม */
  update(): void {
    const state = this.player.playerState;

    // Coins
    this.coinText.setText(`🪙 ${state.coins}`);

    // Tool
    const toolNames: Record<string, string> = {
      hoe: 'Hoe(1)',
      water: 'Water(2)',
      seed: 'Seed(3)',
      harvest: 'Harvest(4)',
    };
    this.toolText.setText(toolNames[state.selectedTool] || state.selectedTool);
    this.drawToolBg(state.selectedTool);
    this.toolIcon.setTexture('tool-' + state.selectedTool);

    // Seed Slots (Update all 4)
    (Object.values(CropType) as CropType[]).forEach(type => {
      const seedType = `${type}_seed`;
      const item = state.inventory.find(i => i.type === seedType);
      const count = item ? item.count : 0;
      
      this.seedTexts[type].setText(`${count}`);
      // Use vegetable icon instead of bag for better recognition
      this.seedIcons[type].setTexture(`item-icon-${type}`);
      // Highlight if it's the first available seed (what player will plant next)
      const currentSeed = this.player.getAvailableSeed();
      if (type === currentSeed) {
        this.seedIcons[type].setAlpha(1).setScale(1.4);
        this.seedTexts[type].setColor('#ffd700');
      } else {
        this.seedIcons[type].setAlpha(count > 0 ? 0.7 : 0.3).setScale(1.2);
        this.seedTexts[type].setColor(count > 0 ? '#ffffff' : '#666666');
      }
    });

    // Mini-map player dot
    const { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } = GAME_CONFIG;
    const worldW = MAP_WIDTH * TILE_SIZE;
    const worldH = MAP_HEIGHT * TILE_SIZE;
    const REF_SCALE = 1.5;
    const mmW = 80 * REF_SCALE;
    const mmH = 60 * REF_SCALE;
    const innerW = mmW - 4;
    const innerH = mmH - 4;
    const dotX = 2 + (this.player.x / worldW) * innerW;
    const dotY = 2 + (this.player.y / worldH) * innerH;

    this.miniMapPlayerDot.clear();
    this.miniMapPlayerDot.fillStyle(0xff4444, 1);
    this.miniMapPlayerDot.fillCircle(dotX, dotY, 2);
    // กระพริบ
    const alpha = 0.5 + Math.sin(this.scene.time.now * 0.008) * 0.5;
    this.miniMapPlayerDot.fillStyle(0xff6666, alpha);
    this.miniMapPlayerDot.fillCircle(dotX, dotY, 3);
  }
}

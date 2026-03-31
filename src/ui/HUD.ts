// ========================================
// HUD — Heads-Up Display (8×8 pixel art style)
// แสดงข้อมูลเหรียญ, inventory, เครื่องมือ, controls
// ========================================

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { GAME_CONFIG } from '../types';

export class HUD {
  private scene: Phaser.Scene;
  private player: Player;
  private container: Phaser.GameObjects.Container;

  // UI Elements
  private coinText: Phaser.GameObjects.Text;
  private toolText: Phaser.GameObjects.Text;
  private inventoryText: Phaser.GameObjects.Text;
  private controlsText: Phaser.GameObjects.Text;
  private toolBg: Phaser.GameObjects.Graphics;
  private toolIcon: Phaser.GameObjects.Image;

  // Mini-map
  private miniMapContainer: Phaser.GameObjects.Container;
  private miniMapBg: Phaser.GameObjects.Graphics;
  private miniMapPlayerDot: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    const cam = scene.cameras.main;
    const UI_SCALE = 1.5;
    this.container = scene.add.container(0, 0).setDepth(900).setScrollFactor(0).setScale(UI_SCALE);
    const viewW = cam.width / UI_SCALE;
    const viewH = cam.height / UI_SCALE;

    // === COIN DISPLAY (มุมซ้ายบน) — compact ===
    const coinBg = scene.add.graphics();
    coinBg.fillStyle(0x0a0a2e, 0.85);
    coinBg.fillRoundedRect(6, 6, 90, 20, 4);
    coinBg.lineStyle(1, 0xffd700, 0.7);
    coinBg.strokeRoundedRect(6, 6, 90, 20, 4);

    this.coinText = scene.add.text(14, 10, '🪙 50', {
      fontSize: '8px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 1,
    });

    // === TOOL DISPLAY (ใต้ coin) — compact ===
    this.toolBg = scene.add.graphics();
    this.drawToolBg('hoe');

    this.toolText = scene.add.text(14, 34, '', {
      fontSize: '7px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 1,
    });

    this.toolIcon = scene.add.image(104, 39, 'tool-hoe').setScale(1.5);

    // === INVENTORY (ใต้ tool) — compact ===
    this.inventoryText = scene.add.text(10, 58, '', {
      fontSize: '6px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#cccccc',
      stroke: '#000',
      strokeThickness: 1,
      lineSpacing: 4,
    });

    // === CONTROLS (มุมขวาล่าง) — smaller ===
    const ctrlW = 180;
    const ctrlH = 100;
    const controlsBg = scene.add.graphics();
    controlsBg.fillStyle(0x0a0a2e, 0.75);
    controlsBg.fillRoundedRect(viewW - ctrlW - 6, viewH - ctrlH - 6, ctrlW, ctrlH, 4);
    controlsBg.lineStyle(1, 0x4a90d9, 0.4);
    controlsBg.strokeRoundedRect(viewW - ctrlW - 6, viewH - ctrlH - 6, ctrlW, ctrlH, 4);

    this.controlsText = scene.add.text(
      viewW - ctrlW,
      viewH - ctrlH - 1,
      [
        'Controls',
        ' ',
        'WASD/Arrow : Move',
        'E : Farm   ,F : Fullscr',
        'SPACE : Talk NPC',
        '1 : Hoe , 2 : Water',
        '3 : Seed , 4 : Harvest',
      ].join('\n'),
      {
        fontSize: '7px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#fafafeff',
        stroke: '#000',
        strokeThickness: 1,
        lineSpacing: 4,
      }
    );

    // === MINI-MAP (มุมขวาบน) — smaller ===
    const mmW = 80;
    const mmH = 60;
    this.miniMapContainer = scene.add.container(
      cam.width - (mmW * UI_SCALE) - 10 * UI_SCALE, 10 * UI_SCALE
    ).setScrollFactor(0).setDepth(901).setScale(UI_SCALE);

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

    this.container.add([
      coinBg,
      this.coinText,
      this.toolBg,
      this.toolText,
      this.toolIcon,
      this.inventoryText,
      controlsBg,
      this.controlsText,
    ]);
  }

  /** วาดพื้นหลัง tool indicator — compact */
  private drawToolBg(tool: string): void {
    const toolColors: Record<string, number> = {
      hoe: 0x8b4513,
      water: 0x4a9bd9,
      seed: 0x8bc34a,
      harvest: 0xff9800,
    };

    this.toolBg.clear();
    this.toolBg.fillStyle(0x0a0a2e, 0.85);
    this.toolBg.fillRoundedRect(6, 30, 110, 18, 4);
    this.toolBg.lineStyle(1, toolColors[tool] || 0x888888, 0.7);
    this.toolBg.strokeRoundedRect(6, 30, 110, 18, 4);
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

    // Inventory
    const invLines = state.inventory
      .filter(i => i.count > 0)
      .map(i => `${i.icon || '📦'}${i.count}`)
      .slice(0, 4);
    this.inventoryText.setText(invLines.join(' '));

    // Mini-map player dot
    const { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } = GAME_CONFIG;
    const worldW = MAP_WIDTH * TILE_SIZE;
    const worldH = MAP_HEIGHT * TILE_SIZE;
    const mmW = 80;
    const mmH = 60;
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

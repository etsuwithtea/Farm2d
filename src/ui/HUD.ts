// ========================================
// HUD — Heads-Up Display
// แสดงข้อมูลเหรียญ, inventory, เครื่องมือ, controls
// ========================================

import Phaser from 'phaser';
import { Player } from '../entities/Player';

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

  // Mini-map
  private miniMapContainer: Phaser.GameObjects.Container;
  private miniMapBg: Phaser.GameObjects.Graphics;
  private miniMapPlayerDot: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    const cam = scene.cameras.main;
    this.container = scene.add.container(0, 0).setDepth(900).setScrollFactor(0);

    // === COIN DISPLAY (มุมซ้ายบน) ===
    const coinBg = scene.add.graphics();
    coinBg.fillStyle(0x1a1a3e, 0.85);
    coinBg.fillRoundedRect(10, 10, 160, 36, 8);
    coinBg.lineStyle(2, 0xffd700, 0.8);
    coinBg.strokeRoundedRect(10, 10, 160, 36, 8);

    this.coinText = scene.add.text(38, 18, '🪙 50', {
      fontSize: '14px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 2,
    });

    // === TOOL DISPLAY (มุมซ้าย ใต้ coin) ===
    this.toolBg = scene.add.graphics();
    this.drawToolBg('hoe');

    this.toolText = scene.add.text(16, 56, '', {
      fontSize: '11px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2,
    });

    // === INVENTORY (มุมซ้ายกลาง) ===
    this.inventoryText = scene.add.text(16, 94, '', {
      fontSize: '9px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#cccccc',
      stroke: '#000',
      strokeThickness: 2,
      lineSpacing: 6,
    });

    // === CONTROLS (มุมขวาล่าง) ===
    const controlsBg = scene.add.graphics();
    controlsBg.fillStyle(0x1a1a3e, 0.75);
    controlsBg.fillRoundedRect(cam.width - 220, cam.height - 130, 210, 120, 8);
    controlsBg.lineStyle(1, 0x4a90d9, 0.5);
    controlsBg.strokeRoundedRect(cam.width - 220, cam.height - 130, 210, 120, 8);

    this.controlsText = scene.add.text(
      cam.width - 210,
      cam.height - 122,
      [
        '🎮 Controls:',
        'WASD/↑↓←→  เดิน',
        'E          ทำสวน',
        'SPACE      คุย NPC',
        '1 จอบ  2 น้ำ',
        '3 เมล็ด  4 เก็บ',
        'F          เต็มจอ',
      ].join('\n'),
      {
        fontSize: '9px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#aaaadd',
        stroke: '#000',
        strokeThickness: 2,
        lineSpacing: 6,
      }
    );

    // === MINI-MAP (มุมขวาบน) ===
    this.miniMapContainer = scene.add.container(
      cam.width - 130, 10
    ).setScrollFactor(0).setDepth(901);

    this.miniMapBg = scene.add.graphics();
    this.miniMapBg.fillStyle(0x000000, 0.7);
    this.miniMapBg.fillRoundedRect(0, 0, 120, 90, 6);
    this.miniMapBg.lineStyle(1, 0x4a90d9, 0.8);
    this.miniMapBg.strokeRoundedRect(0, 0, 120, 90, 6);

    // วาดแผนที่ย่อ (static — สร้างครั้งเดียว)
    const miniMapGraphics = scene.add.graphics();
    this.drawMiniMap(miniMapGraphics);

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
      this.inventoryText,
      controlsBg,
      this.controlsText,
    ]);
  }

  /** วาดพื้นหลัง tool indicator */
  private drawToolBg(tool: string): void {
    const toolColors: Record<string, number> = {
      hoe: 0x8b4513,
      water: 0x4a9bd9,
      seed: 0x8bc34a,
      harvest: 0xff9800,
    };

    this.toolBg.clear();
    this.toolBg.fillStyle(0x1a1a3e, 0.85);
    this.toolBg.fillRoundedRect(10, 50, 190, 36, 8);
    this.toolBg.lineStyle(2, toolColors[tool] || 0x888888, 0.8);
    this.toolBg.strokeRoundedRect(10, 50, 190, 36, 8);
  }

  /** วาด mini-map */
  private drawMiniMap(g: Phaser.GameObjects.Graphics): void {
    const { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } = {
      MAP_WIDTH: 40,
      MAP_HEIGHT: 30,
      TILE_SIZE: 32,
    };
    const scaleX = 116 / (MAP_WIDTH * TILE_SIZE);
    const scaleY = 86 / (MAP_HEIGHT * TILE_SIZE);

    // วาดสีเขียวเป็นพื้น
    g.fillStyle(0x5da03a, 0.8);
    g.fillRect(2, 2, 116, 86);

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
      hoe: '⛏️ จอบ (1)',
      water: '💧 บัวรดน้ำ (2)',
      seed: '🌱 เมล็ดพันธุ์ (3)',
      harvest: '🫳 เก็บเกี่ยว (4)',
    };
    this.toolText.setText(toolNames[state.selectedTool] || state.selectedTool);
    this.drawToolBg(state.selectedTool);

    // Inventory
    const invLines = state.inventory
      .filter(i => i.count > 0)
      .map(i => `${i.icon || '📦'} ${i.type}: ${i.count}`)
      .slice(0, 6);
    this.inventoryText.setText(invLines.join('\n'));

    // Mini-map player dot
    const { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } = {
      MAP_WIDTH: 40, MAP_HEIGHT: 30, TILE_SIZE: 32,
    };
    const worldW = MAP_WIDTH * TILE_SIZE;
    const worldH = MAP_HEIGHT * TILE_SIZE;
    const dotX = 2 + (this.player.x / worldW) * 116;
    const dotY = 2 + (this.player.y / worldH) * 86;

    this.miniMapPlayerDot.clear();
    this.miniMapPlayerDot.fillStyle(0xff4444, 1);
    this.miniMapPlayerDot.fillCircle(dotX, dotY, 3);
    // กระพริบ
    const alpha = 0.5 + Math.sin(this.scene.time.now * 0.008) * 0.5;
    this.miniMapPlayerDot.fillStyle(0xff6666, alpha);
    this.miniMapPlayerDot.fillCircle(dotX, dotY, 5);
  }
}

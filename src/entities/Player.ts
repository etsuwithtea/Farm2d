// ========================================
// Player — ตัวละครผู้เล่น
// ========================================

import Phaser from 'phaser';
import { Direction, GAME_CONFIG, PlayerState, CropType } from '../types';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  public facing: Direction = Direction.Down;
  public playerState: PlayerState;
  public isInteracting: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player', 0);

    // เพิ่มเข้า scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // ตั้งค่า Physics
    this.setCollideWorldBounds(true);
    this.setSize(6, 6);
    this.setOffset(1, 2);
    this.setDepth(5);

    // ตั้งค่า Input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Initial state
    this.playerState = {
      coins: 50,
      inventory: [
        { type: 'tomato_seed', count: 5, icon: '🍅' },
        { type: 'carrot_seed', count: 5, icon: '🥕' },
        { type: 'corn_seed', count: 3, icon: '🌽' },
        { type: 'rice_seed', count: 5, icon: '🌾' },
      ],
      selectedTool: 'hoe',
    };

    // เล่น idle animation เริ่มต้น
    this.play('player-idle-down');
  }

  update(): void {
    if (this.isInteracting) {
      this.setVelocity(0, 0);
      return;
    }

    const speed = GAME_CONFIG.PLAYER_SPEED;
    let vx = 0;
    let vy = 0;

    // ตรวจสอบทั้ง Arrow keys และ WASD
    const left = this.cursors.left.isDown || this.wasdKeys.A.isDown;
    const right = this.cursors.right.isDown || this.wasdKeys.D.isDown;
    const up = this.cursors.up.isDown || this.wasdKeys.W.isDown;
    const down = this.cursors.down.isDown || this.wasdKeys.S.isDown;

    if (left) {
      vx = -speed;
      this.facing = Direction.Left;
    } else if (right) {
      vx = speed;
      this.facing = Direction.Right;
    }

    if (up) {
      vy = -speed;
      if (vx === 0) this.facing = Direction.Up;
    } else if (down) {
      vy = speed;
      if (vx === 0) this.facing = Direction.Down;
    }

    // Normalize diagonal speed
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx, vy);

    // Animation
    if (vx !== 0 || vy !== 0) {
      this.play(`player-walk-${this.facing}`, true);
    } else {
      this.play(`player-idle-${this.facing}`, true);
    }

    // Depth sorting (ทำให้ตัวละครอยู่หลัง/หน้าวัตถุตาม Y)
    this.setDepth(this.y);
  }

  /** เพิ่มเหรียญ */
  addCoins(amount: number): void {
    this.playerState.coins += amount;
  }

  /** ลดเหรียญ */
  spendCoins(amount: number): boolean {
    if (this.playerState.coins >= amount) {
      this.playerState.coins -= amount;
      return true;
    }
    return false;
  }

  /** เพิ่มของเข้า inventory */
  addItem(type: string, count: number = 1, icon: string = ''): void {
    const existing = this.playerState.inventory.find(i => i.type === type);
    if (existing) {
      existing.count += count;
    } else {
      this.playerState.inventory.push({ type, count, icon });
    }
  }

  /** ใช้ของจาก inventory */
  useItem(type: string, count: number = 1): boolean {
    const item = this.playerState.inventory.find(i => i.type === type);
    if (item && item.count >= count) {
      item.count -= count;
      if (item.count <= 0) {
        this.playerState.inventory = this.playerState.inventory.filter(i => i.type !== type);
      }
      return true;
    }
    return false;
  }

  /** ตรวจสอบว่ามีเมล็ดพันธุ์ไหม */
  getAvailableSeed(): CropType | null {
    const seedMap: Record<string, CropType> = {
      'tomato_seed': CropType.Tomato,
      'carrot_seed': CropType.Carrot,
      'corn_seed': CropType.Corn,
      'rice_seed': CropType.Rice,
    };

    for (const [seedType, cropType] of Object.entries(seedMap)) {
      const item = this.playerState.inventory.find(i => i.type === seedType);
      if (item && item.count > 0) {
        return cropType;
      }
    }
    return null;
  }

  /** ใช้เมล็ดพันธุ์ */
  useSeedForCrop(crop: CropType): boolean {
    const seedType = `${crop}_seed`;
    return this.useItem(seedType);
  }
}

// ========================================
// FarmAnimal — สัตว์ฟาร์ม (ไก่, หมู, วัว)
// AI เดินสุ่มแบบ Random Wander
// ========================================

import Phaser from 'phaser';
import { AnimalType, Direction, GAME_CONFIG } from '../types';
import { createAnimations } from '../utils/SpriteGenerator';

export class FarmAnimal extends Phaser.Physics.Arcade.Sprite {
  public animalType: AnimalType;
  public facing: Direction = Direction.Down;
  private wanderTimer: Phaser.Time.TimerEvent | null = null;
  private isMoving: boolean = false;
  private homeX: number;
  private homeY: number;
  private wanderRadius: number = 100;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: AnimalType
  ) {
    super(scene, x, y, type, 0);

    this.animalType = type;
    this.homeX = x;
    this.homeY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(20, 20);
    this.setOffset(6, 10);
    this.setDepth(4);

    // สร้าง animation ถ้ายังไม่มี
    createAnimations(scene, type);

    // เริ่มเดินสุ่ม
    this.startWander();
    this.play(`${type}-idle-down`);
  }

  /** เริ่มระบบเดินสุ่ม */
  private startWander(): void {
    this.wanderTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: this.doWander,
      callbackScope: this,
      loop: true,
    });
  }

  /** เดินสุ่มไปทิศทางใดทิศทางหนึ่ง */
  private doWander(): void {
    if (!this.active) return;

    // 40% โอกาสจะหยุดนิ่ง
    if (Math.random() < 0.4) {
      this.setVelocity(0, 0);
      this.isMoving = false;
      this.play(`${this.animalType}-idle-${this.facing}`, true);
      return;
    }

    const speed = GAME_CONFIG.ANIMAL_SPEED;
    const directions = [
      { dir: Direction.Left, vx: -speed, vy: 0 },
      { dir: Direction.Right, vx: speed, vy: 0 },
      { dir: Direction.Up, vx: 0, vy: -speed },
      { dir: Direction.Down, vx: 0, vy: speed },
    ];

    // ถ้าอยู่ไกลจากบ้าน ให้เดินกลับ
    const dx = this.x - this.homeX;
    const dy = this.y - this.homeY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let chosen;
    if (dist > this.wanderRadius) {
      // เดินกลับบ้าน
      if (Math.abs(dx) > Math.abs(dy)) {
        chosen = dx > 0 ? directions[0] : directions[1]; // left or right
      } else {
        chosen = dy > 0 ? directions[2] : directions[3]; // up or down
      }
    } else {
      chosen = directions[Phaser.Math.Between(0, 3)];
    }

    this.facing = chosen.dir;
    this.setVelocity(chosen.vx, chosen.vy);
    this.isMoving = true;
    this.play(`${this.animalType}-walk-${this.facing}`, true);

    // หยุดหลังจากเดินสักพัก
    this.scene.time.delayedCall(Phaser.Math.Between(500, 1500), () => {
      if (this.active) {
        this.setVelocity(0, 0);
        this.isMoving = false;
        this.play(`${this.animalType}-idle-${this.facing}`, true);
      }
    });
  }

  update(): void {
    // Depth sorting
    this.setDepth(this.y);
  }

  destroy(fromScene?: boolean): void {
    if (this.wanderTimer) {
      this.wanderTimer.destroy();
    }
    super.destroy(fromScene);
  }
}

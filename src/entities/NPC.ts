// ========================================
// NPC — ชาวบ้านในฟาร์ม
// เดินวนและพูดคุยได้
// ========================================

import Phaser from 'phaser';
import { Direction, DialogData, GAME_CONFIG } from '../types';
import { createAnimations } from '../utils/SpriteGenerator';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  public npcName: string;
  public dialogData: DialogData;
  public facing: Direction = Direction.Down;
  private spriteKey: string;
  private wanderTimer: Phaser.Time.TimerEvent | null = null;
  private indicator: Phaser.GameObjects.Image | null = null;
  private nameTag: Phaser.GameObjects.Text | null = null;
  public isNearPlayer: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spriteKey: string,
    dialog: DialogData
  ) {
    super(scene, x, y, spriteKey, 0);

    this.spriteKey = spriteKey;
    this.npcName = dialog.name;
    this.dialogData = dialog;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(20, 20);
    this.setOffset(6, 10);
    this.setDepth(4);
    this.setImmovable(true);

    // สร้าง animation
    createAnimations(scene, spriteKey);

    // ชื่อ NPC แสดงเหนือหัว
    this.nameTag = scene.add.text(x, y - 24, dialog.name, {
      fontSize: '10px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(100);

    // สร้าง "!" indicator (ซ่อนไว้ก่อน)
    this.indicator = scene.add.image(x, y - 30, 'indicator')
      .setDepth(101)
      .setVisible(false)
      .setScale(1.5);

    // เริ่มเดินสุ่ม
    this.startWander();
    this.play(`${spriteKey}-idle-down`);
  }

  private startWander(): void {
    this.wanderTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(3000, 7000),
      callback: this.doWander,
      callbackScope: this,
      loop: true,
    });
  }

  private doWander(): void {
    if (!this.active) return;

    // 50% chance to stay idle
    if (Math.random() < 0.5) {
      this.setVelocity(0, 0);
      this.play(`${this.spriteKey}-idle-${this.facing}`, true);
      return;
    }

    const speed = GAME_CONFIG.NPC_SPEED;
    const dirs = [
      { dir: Direction.Left, vx: -speed, vy: 0 },
      { dir: Direction.Right, vx: speed, vy: 0 },
      { dir: Direction.Up, vx: 0, vy: -speed },
      { dir: Direction.Down, vx: 0, vy: speed },
    ];

    const chosen = dirs[Phaser.Math.Between(0, 3)];
    this.facing = chosen.dir;
    this.setVelocity(chosen.vx, chosen.vy);
    this.play(`${this.spriteKey}-walk-${this.facing}`, true);

    this.scene.time.delayedCall(Phaser.Math.Between(500, 2000), () => {
      if (this.active) {
        this.setVelocity(0, 0);
        this.play(`${this.spriteKey}-idle-${this.facing}`, true);
      }
    });
  }

  /** อัปเดตตำแหน่ง nameTag และ indicator */
  update(): void {
    if (this.nameTag) {
      this.nameTag.setPosition(this.x, this.y - 24);
      this.nameTag.setDepth(this.y + 1);
    }
    if (this.indicator) {
      this.indicator.setPosition(this.x, this.y - 32);
      this.indicator.setVisible(this.isNearPlayer);
      this.indicator.setDepth(this.y + 2);

      // กระพริบ
      if (this.isNearPlayer) {
        this.indicator.setAlpha(0.5 + Math.sin(this.scene.time.now * 0.008) * 0.5);
      }
    }

    this.setDepth(this.y);
  }

  destroy(fromScene?: boolean): void {
    if (this.wanderTimer) this.wanderTimer.destroy();
    if (this.nameTag) this.nameTag.destroy();
    if (this.indicator) this.indicator.destroy();
    super.destroy(fromScene);
  }
}

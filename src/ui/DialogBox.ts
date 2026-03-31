// ========================================
// DialogBox — กล่องสนทนา RPG-style (8×8 pixel art)
// แสดงข้อความทีละตัวอักษร (Typewriter Effect)
// ========================================

import Phaser from 'phaser';

export class DialogBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private dialogText: Phaser.GameObjects.Text;
  private continueText: Phaser.GameObjects.Text;

  private lines: string[] = [];
  private currentLineIndex: number = 0;
  private currentCharIndex: number = 0;
  private isTyping: boolean = false;
  private isVisible: boolean = false;
  private typeTimer: Phaser.Time.TimerEvent | null = null;

  private onComplete: (() => void) | null = null;

  // ขนาดกล่อง — เล็กลงให้เข้ากับ 8×8 pixel style
  private readonly BOX_WIDTH: number;
  private readonly BOX_HEIGHT = 64;
  private readonly BOX_X: number;
  private readonly BOX_Y: number;
  private readonly PADDING = 8;
  private readonly TYPE_SPEED = 25;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const cam = scene.cameras.main;
    this.BOX_WIDTH = Math.min(cam.width - 40, 480);
    this.BOX_X = (cam.width - this.BOX_WIDTH) / 2;
    this.BOX_Y = cam.height - this.BOX_HEIGHT - 12;

    this.container = scene.add.container(0, 0).setDepth(1000).setScrollFactor(0);

    // พื้นหลังกล่อง
    this.background = scene.add.graphics();
    this.drawBackground();

    // ชื่อ NPC — pixel-style tag
    this.nameText = scene.add.text(
      this.BOX_X + this.PADDING,
      this.BOX_Y - 10,
      '',
      {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2,
        padding: { x: 4, y: 2 },
        backgroundColor: '#1a1a3e',
      }
    ).setScrollFactor(0);

    // ข้อความ dialog
    this.dialogText = scene.add.text(
      this.BOX_X + this.PADDING + 2,
      this.BOX_Y + this.PADDING + 2,
      '',
      {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#ffffff',
        wordWrap: { width: this.BOX_WIDTH - this.PADDING * 3 },
        lineSpacing: 6,
      }
    ).setScrollFactor(0);

    // ▼ ลูกศรดำเนินต่อ
    this.continueText = scene.add.text(
      this.BOX_X + this.BOX_WIDTH - this.PADDING - 2,
      this.BOX_Y + this.BOX_HEIGHT - 12,
      '▼',
      {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#ffd700',
      }
    ).setOrigin(1, 0.5).setScrollFactor(0);

    this.container.add([
      this.background,
      this.nameText,
      this.dialogText,
      this.continueText,
    ]);

    this.hide();
  }

  /** วาดพื้นหลังกล่อง — pixel-art style with sharp corners */
  private drawBackground(): void {
    this.background.clear();

    // เงา
    this.background.fillStyle(0x000000, 0.4);
    this.background.fillRoundedRect(
      this.BOX_X + 2, this.BOX_Y + 2,
      this.BOX_WIDTH, this.BOX_HEIGHT,
      4
    );

    // กล่องหลัก
    this.background.fillStyle(0x0a0a2e, 0.95);
    this.background.fillRoundedRect(
      this.BOX_X, this.BOX_Y,
      this.BOX_WIDTH, this.BOX_HEIGHT,
      4
    );

    // ขอบนอก
    this.background.lineStyle(2, 0x4a90d9, 1);
    this.background.strokeRoundedRect(
      this.BOX_X, this.BOX_Y,
      this.BOX_WIDTH, this.BOX_HEIGHT,
      4
    );

    // ขอบใน highlight
    this.background.lineStyle(1, 0x6ab0f0, 0.2);
    this.background.strokeRoundedRect(
      this.BOX_X + 2, this.BOX_Y + 2,
      this.BOX_WIDTH - 4, this.BOX_HEIGHT - 4,
      3
    );

    this.background.setScrollFactor(0);
  }

  /** เปิดกล่องสนทนา */
  show(name: string, lines: string[], onComplete?: () => void): void {
    this.lines = lines;
    this.currentLineIndex = 0;
    this.onComplete = onComplete || null;
    this.isVisible = true;

    this.nameText.setText(name);
    this.container.setVisible(true);
    this.continueText.setVisible(false);

    this.typeLine();
  }

  /** ซ่อนกล่อง */
  hide(): void {
    this.isVisible = false;
    this.container.setVisible(false);
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = null;
    }
  }

  /** ปิดกล่องแบบบังคับ + เรียก onComplete */
  forceClose(): void {
    this.hide();
    if (this.onComplete) {
      this.onComplete();
      this.onComplete = null;
    }
  }

  /** พิมพ์ข้อความทีละตัว */
  private typeLine(): void {
    if (this.currentLineIndex >= this.lines.length) {
      this.hide();
      if (this.onComplete) this.onComplete();
      return;
    }

    this.isTyping = true;
    this.currentCharIndex = 0;
    this.dialogText.setText('');
    this.continueText.setVisible(false);

    const line = this.lines[this.currentLineIndex];

    this.typeTimer = this.scene.time.addEvent({
      delay: this.TYPE_SPEED,
      repeat: line.length - 1,
      callback: () => {
        this.currentCharIndex++;
        this.dialogText.setText(line.substring(0, this.currentCharIndex));

        if (this.currentCharIndex >= line.length) {
          this.isTyping = false;
          this.continueText.setVisible(true);
        }
      },
    });
  }

  /** กด SPACE เพื่อไปข้อความถัดไป */
  advance(): void {
    if (!this.isVisible) return;

    if (this.isTyping) {
      if (this.typeTimer) {
        this.typeTimer.destroy();
        this.typeTimer = null;
      }
      this.dialogText.setText(this.lines[this.currentLineIndex]);
      this.isTyping = false;
      this.continueText.setVisible(true);
    } else {
      this.currentLineIndex++;
      this.typeLine();
    }
  }

  /** ตรวจสอบว่ากล่องเปิดอยู่ไหม */
  get visible(): boolean {
    return this.isVisible;
  }

  /** อัปเดต animation ลูกศรกระพริบ */
  update(): void {
    if (this.isVisible && this.continueText.visible) {
      this.continueText.setAlpha(
        0.5 + Math.sin(this.scene.time.now * 0.006) * 0.5
      );
    }
  }
}

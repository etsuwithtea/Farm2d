import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // Scene นี้มีไว้เพื่อเก็บ UI elements เช่น DialogBox และ HUD
    // เพื่อไม่ให้ได้รับผลกระทบจาก camera zoom ของ MainScene
  }
}

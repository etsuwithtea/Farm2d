// ========================================
// Main Entry Point — Pixel Farm 2D
// ========================================

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';
import { UIScene } from './scenes/UIScene';

// โหลด Google Font สำหรับ Pixel Text
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// รอ Font โหลดเสร็จก่อนเริ่มเกม
document.fonts.ready.then(() => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    pixelArt: true, // สำคัญ! ให้ pixel art คมชัด
    roundPixels: true,
    backgroundColor: '#1a1a2e',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 }, // Top-down ไม่มี gravity
        debug: false,
      },
    },
    scene: [BootScene, MainScene, UIScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  new Phaser.Game(config);
});

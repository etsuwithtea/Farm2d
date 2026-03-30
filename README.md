# 🌾 Pixel Farm 2D — เดินชมฟาร์ม

เกม Pixel Art แนว Top-down เดินสำรวจฟาร์ม ปลูกผัก เลี้ยงสัตว์ คุยกับชาวบ้าน  
สร้างด้วย **Phaser.js + TypeScript + Vite**

![Pixel Farm 2D](https://img.shields.io/badge/Game-Pixel%20Farm%202D-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Phaser](https://img.shields.io/badge/Phaser-3.80-blue?style=for-the-badge)

---

## 🎮 วิธีเล่น

### การควบคุม

| ปุ่ม | การทำงาน |
|------|----------|
| `W` `A` `S` `D` หรือ `↑` `←` `↓` `→` | เดิน 4 ทิศทาง |
| `SPACE` | คุยกับ NPC (เมื่ออยู่ใกล้) / กดดำเนินบทสนทนา |
| `E` | ทำสวน (ไถ / หว่าน / รดน้ำ / เก็บเกี่ยว) |
| `1` | เลือกเครื่องมือ: ⛏️ จอบ |
| `2` | เลือกเครื่องมือ: 💧 บัวรดน้ำ |
| `3` | เลือกเครื่องมือ: 🌱 เมล็ดพันธุ์ |
| `4` | เลือกเครื่องมือ: 🫳 เก็บเกี่ยว |

### ระบบปลูกผัก 🌱

ขั้นตอนการปลูกผัก:

1. **ไถดิน** — เลือกจอบ (กด `1`) แล้วเดินไปที่แปลงดินสีน้ำตาล กด `E`
2. **หว่านเมล็ด** — เลือกเมล็ดพันธุ์ (กด `3`) แล้วกด `E` ที่แปลงที่ไถแล้ว
3. **รดน้ำ** — เลือกบัวรดน้ำ (กด `2`) แล้วกด `E`
4. **รอผักโต** — ผักจะค่อยๆ เติบโต (ดูเปอร์เซ็นต์ได้โดยกด `E` ที่แปลง)
5. **เก็บเกี่ยว** — เมื่อผักโตเต็มที่ จะปรากฏผลผลิต กด `E` เพื่อเก็บเกี่ยว

#### พืชผลที่ปลูกได้

| พืช | เวลาเติบโต | ราคาขาย |
|------|-----------|---------|
| 🍅 มะเขือเทศ | 15 วินาที | 15 🪙 |
| 🥕 แครอท | 10 วินาที | 10 🪙 |
| 🌽 ข้าวโพด | 20 วินาที | 20 🪙 |
| 🎃 ฟักทอง | 25 วินาที | 35 🪙 |

### NPC ในเกม 🧑‍🌾

- **👨‍🌾 ลุงสมชาย** — ชาวนาผู้เชี่ยวชาญ อยู่บริเวณทางเดินกลาง
- **🧑‍💼 แม่ค้าสมฤดี** — พ่อค้าเมล็ดพันธุ์ อยู่ทางขวา
- **👴 ปู่ทองดี** — ผู้อาวุโส อยู่มุมซ้ายบนใกล้สระน้ำ

เดินเข้าใกล้แล้วกด `SPACE` เพื่อเริ่มบทสนทนา!

### สัตว์ฟาร์ม 🐔🐷🐄

มีสัตว์ 3 ชนิดเดินเพ่นพ่านในฟาร์ม:
- 🐔 **ไก่** — อยู่บริเวณหญ้าด้านขวาบน
- 🐷 **หมู** — อยู่บริเวณกลาง
- 🐄 **วัว** — อยู่ฝั่งขวาของแม่น้ำ (ข้ามสะพาน)

### HUD (หน้าจอ) 📊

- **มุมซ้ายบน**: จำนวนเหรียญ 🪙
- **ใต้เหรียญ**: เครื่องมือที่เลือกอยู่
- **ด้านล่างซ้าย**: Inventory (ของในกระเป๋า)
- **มุมขวาบน**: Mini-map (จุดแดงคือตำแหน่งตัวเอง)
- **มุมขวาล่าง**: คู่มือปุ่มกด

---

## 🚀 วิธีรันเกม

### ติดตั้ง

```bash
# Clone หรือ download โปรเจค
cd Farm2d

# ติดตั้ง dependencies
npm install

# รันเกม (dev mode)
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000` 🎮

### Build สำหรับ Production

```bash
npm run build
```

ไฟล์ output จะอยู่ในโฟลเดอร์ `dist/`

---

## 🏗️ โครงสร้างโปรเจค

```
Farm2d/
├── index.html                 # Entry HTML
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── src/
    ├── main.ts                # Game bootstrap
    ├── types.ts               # Type definitions & constants
    ├── scenes/
    │   ├── BootScene.ts       # Loading screen + asset generation
    │   └── MainScene.ts       # Main gameplay scene
    ├── entities/
    │   ├── Player.ts          # Player character (movement, inventory)
    │   ├── FarmAnimal.ts      # Farm animals (AI wander)
    │   └── NPC.ts             # NPCs (dialog interaction)
    ├── world/
    │   └── TileMapGenerator.ts # Procedural map generation
    ├── systems/
    │   └── FarmingSystem.ts   # Farming mechanics
    ├── ui/
    │   ├── DialogBox.ts       # RPG dialog box (typewriter effect)
    │   └── HUD.ts             # HUD overlay (coins, tools, minimap)
    └── utils/
        └── SpriteGenerator.ts # Procedural pixel art generation
```

---

## ✨ Features

- 🎨 **Procedural Pixel Art** — ตัวละคร, สัตว์, ต้นไม้ ทุกอย่างวาดด้วยโค้ด ไม่ต้องหาไฟล์ภาพ
- 🗺️ **Procedural Tilemap** — แผนที่ฟาร์มพร้อมทางเดิน, แม่น้ำ, สะพาน
- 🚶 **4-Direction Movement** — เดิน WASD/Arrow + Diagonal normalization
- 🌾 **Farming System** — ไถดิน → หว่านเมล็ด → รดน้ำ → เก็บเกี่ยว
- 💬 **NPC Dialog** — กล่องสนทนา RPG-style พร้อม typewriter effect
- 🐔 **Farm Animals** — AI เดินสุ่มพร้อม home-radius behavior
- 📊 **HUD** — เหรียญ, เครื่องมือ, inventory, mini-map
- ✨ **Ambient Effects** — อนุภาคลอยในอากาศ
- 📷 **Camera Follow** — กล้องตามตัวละคร + pixel-perfect zoom 2x

---

## 🛠️ Tech Stack

- **[Phaser 3](https://phaser.io/)** — HTML5 Game Framework
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** — Next-gen frontend build tool

---

## 📝 License

MIT — ใช้ได้อิสระ ดัดแปลงได้ตามชอบ 🌾

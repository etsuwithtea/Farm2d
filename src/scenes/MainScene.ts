// ========================================
// MainScene — Main game scene
// All systems: map, player, animals, NPCs, farming
// ========================================

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { FarmAnimal } from '../entities/FarmAnimal';
import { NPC } from '../entities/NPC';
import { DialogBox } from '../ui/DialogBox';
import { HUD } from '../ui/HUD';
import { FarmingSystem } from '../systems/FarmingSystem';
import { createTileMap } from '../world/TileMapGenerator';
import { AnimalType, DialogData, GAME_CONFIG } from '../types';

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private animals: FarmAnimal[] = [];
  private npcs: NPC[] = [];
  private dialogBox!: DialogBox;
  private hud!: HUD;
  private farmingSystem!: FarmingSystem;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;
  private numberKeys!: {
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
    four: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
  };
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private shippingBin!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    const { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } = GAME_CONFIG;

    // === World bounds ===
    this.physics.world.setBounds(
      0, 0,
      MAP_WIDTH * TILE_SIZE,
      MAP_HEIGHT * TILE_SIZE
    );

    // === Create tile map ===
    const { obstacles, mapData } = createTileMap(this);
    this.obstacles = obstacles;

    // === Create player ===
    this.player = new Player(
      this,
      13 * TILE_SIZE,
      14 * TILE_SIZE
    );

    // Collision: Player <-> Obstacles
    this.physics.add.collider(this.player, this.obstacles);

    // === Create farm animals ===
    this.createAnimals();

    // Collision: Animals <-> Obstacles
    for (const animal of this.animals) {
      this.physics.add.collider(animal, this.obstacles);
      this.physics.add.collider(animal, this.player);
    }

    // === Create NPCs ===
    this.createNPCs();

    // Collision: NPCs <-> Obstacles
    for (const npc of this.npcs) {
      this.physics.add.collider(npc, this.obstacles);
    }

    // === Camera ===
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(
      0, 0,
      MAP_WIDTH * TILE_SIZE,
      MAP_HEIGHT * TILE_SIZE
    );
    this.cameras.main.setZoom(4); // Pixel-perfect zoom for 8x8 tiles

    // === Launch UI Scene ===
    this.scene.launch('UIScene');
    const uiScene = this.scene.get('UIScene');

    // === Dialog system ===
    this.dialogBox = new DialogBox(uiScene);
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.eKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
    this.numberKeys = {
      one: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      three: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      four: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    };

    // === Shipping Bin ===
    this.shippingBin = this.add.sprite(
      15 * TILE_SIZE + TILE_SIZE / 2,
      13 * TILE_SIZE + TILE_SIZE / 2,
      'shipping-bin'
    );
    this.physics.add.existing(this.shippingBin, true);
    this.physics.add.collider(this.player, this.shippingBin);
    this.shippingBin.setDepth(13); // Below houses, above ground


    // === Farming system ===
    this.farmingSystem = new FarmingSystem(this, this.player, mapData);

    // === HUD ===
    this.hud = new HUD(uiScene, this.player);

    // === Ambient particles ===
    this.createAmbientEffects();

    // === Welcome message ===
    this.time.delayedCall(800, () => {
      this.dialogBox.show('System', [
        'Welcome to Pixel Farm 2D!',
        'WASD/Arrows=Move  SPACE=Talk  E=Farm',
        'Press 1-4 to switch tools. Have fun!',
      ], () => {
        this.player.isInteracting = false;
      });
      this.player.isInteracting = true;

      // Safety: auto-dismiss if dialog sticks
      this.time.delayedCall(15000, () => {
        if (this.player.isInteracting && this.dialogBox.visible) {
          this.dialogBox.forceClose();
        } else if (this.player.isInteracting) {
          this.player.isInteracting = false;
        }
      });
    });

    // === Input Listeners (Mouse Click) ===
    this.input.on('pointerdown', () => {
      this.handleInteraction(false); // Called with isSpace=false
    });
  }

  /** Create farm animals */
  private createAnimals(): void {
    const { TILE_SIZE } = GAME_CONFIG;

    const animalData: { type: AnimalType; x: number; y: number }[] = [
      // Chickens (upper right grass area)
      { type: AnimalType.Chicken, x: 20 * TILE_SIZE, y: 6 * TILE_SIZE },
      { type: AnimalType.Chicken, x: 22 * TILE_SIZE, y: 8 * TILE_SIZE },
      { type: AnimalType.Chicken, x: 24 * TILE_SIZE, y: 5 * TILE_SIZE },

      // Pigs (center area)
      { type: AnimalType.Pig, x: 16 * TILE_SIZE, y: 10 * TILE_SIZE },
      { type: AnimalType.Pig, x: 18 * TILE_SIZE, y: 12 * TILE_SIZE },

      // Cows (right side of river)
      { type: AnimalType.Cow, x: 35 * TILE_SIZE, y: 8 * TILE_SIZE },
      { type: AnimalType.Cow, x: 37 * TILE_SIZE, y: 14 * TILE_SIZE },

      // Cats (near house)
      { type: AnimalType.Cat, x: 4 * TILE_SIZE, y: 4 * TILE_SIZE },
      { type: AnimalType.Cat, x: 6 * TILE_SIZE, y: 3 * TILE_SIZE },

      // Dogs (near barn)
      { type: AnimalType.Dog, x: 23 * TILE_SIZE, y: 5 * TILE_SIZE },

      // Ducks (near river/pond)
      { type: AnimalType.Duck, x: 3 * TILE_SIZE, y: 1 * TILE_SIZE }, // pond
      { type: AnimalType.Duck, x: 30 * TILE_SIZE, y: 14 * TILE_SIZE }, // river
      { type: AnimalType.Duck, x: 32 * TILE_SIZE, y: 22 * TILE_SIZE }, // river
    ];

    for (const data of animalData) {
      const animal = new FarmAnimal(this, data.x, data.y, data.type);
      this.animals.push(animal);
    }
  }

  /** Create NPCs */
  private createNPCs(): void {
    const { TILE_SIZE } = GAME_CONFIG;

    const npcData: { spriteKey: string; x: number; y: number; dialog: DialogData }[] = [
      {
        spriteKey: 'npc-farmer',
        x: 7 * TILE_SIZE,
        y: 14 * TILE_SIZE,
        dialog: {
          name: 'Old Farmer',
          lines: [
            'Hello! Welcome to our farm!',
            'We grow crops and raise animals here.',
            'Check out the farm plots below.',
            'Press E to till, sow seeds, and water.',
            'Wait a bit and harvest when ready!',
          ],
        },
      },
      {
        spriteKey: 'npc-merchant',
        x: 20 * TILE_SIZE,
        y: 14 * TILE_SIZE,
        dialog: {
          name: 'Merchant',
          lines: [
            'Want to buy some seeds?',
            'Press 1-4 to purchase seeds.',
            'Press S to sell ALL your produce!',
            '(1) Tomato 15G (2) Carrot 10G',
            '(3) Corn 20G (4) Pumpkin 35G',
          ],
        },
      },
      {
        spriteKey: 'npc-elder',
        x: 5 * TILE_SIZE,
        y: 4 * TILE_SIZE,
        dialog: {
          name: 'Village Elder',
          lines: [
            'I have farmed here for 50 years.',
            'This used to be vast grassland.',
            'Now you are here to help. Thank you!',
            'Remember to water your crops daily!',
            'And take good care of the animals!',
          ],
        },
      },
    ];

    for (const data of npcData) {
      const npc = new NPC(this, data.x, data.y, data.spriteKey, data.dialog);
      this.npcs.push(npc);
    }
  }

  /** Ambient effects (fireflies) */
  private createAmbientEffects(): void {
    const { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } = GAME_CONFIG;

    if (!this.textures.exists('particle')) {
      const particleCanvas = document.createElement('canvas');
      particleCanvas.width = 4;
      particleCanvas.height = 4;
      const pctx = particleCanvas.getContext('2d')!;
      pctx.fillStyle = '#ffffaa';
      pctx.fillRect(1, 1, 2, 2);
      this.textures.addImage('particle', particleCanvas as any);
    }

    try {
      const emitter = this.add.particles(0, 0, 'particle', {
        x: { min: 0, max: MAP_WIDTH * TILE_SIZE },
        y: { min: 0, max: MAP_HEIGHT * TILE_SIZE },
        lifespan: { min: 3000, max: 6000 },
        speed: { min: 5, max: 15 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.6, end: 0 },
        frequency: 800,
        blendMode: 'ADD',
      });
      emitter.setDepth(1000);
    } catch {
      console.warn('Particle system skipped');
    }
  }

  update(_time: number, delta: number): void {
    // Player update
    this.player.update();

    // Animals update
    for (const animal of this.animals) {
      animal.update();
    }

    // NPCs update + proximity check
    const { INTERACTION_DISTANCE } = GAME_CONFIG;
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );
      npc.isNearPlayer = dist < INTERACTION_DISTANCE;
      npc.update();
    }

    // Dialog interaction (SPACE)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleInteraction(true);
    }

    // Seed purchasing while dialog is open
    if (this.dialogBox.visible && this.player.isInteracting) {
      const activeNpc = this.npcs.find(npc => npc.isNearPlayer);
      if (activeNpc && activeNpc.dialogData.name === 'Merchant') {
        const JustDown = Phaser.Input.Keyboard.JustDown;
        if (JustDown(this.numberKeys.one)) {
          this.buySeed('tomato_seed', 15, '🍅');
        } else if (JustDown(this.numberKeys.two)) {
          this.buySeed('carrot_seed', 10, '🥕');
        } else if (JustDown(this.numberKeys.three)) {
          this.buySeed('corn_seed', 20, '🌽');
        } else if (JustDown(this.numberKeys.four)) {
          this.buySeed('pumpkin_seed', 35, '🎃');
        } else if (JustDown(this.numberKeys.S)) {
          this.sellAllProduce();
        }
      }
    }

    // Shipping bin interaction (E)
    const ePressed = Phaser.Input.Keyboard.JustDown(this.eKey);
    if (ePressed) {
      if (!this.dialogBox.visible && !this.player.isInteracting) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          this.shippingBin.x, this.shippingBin.y
        );
        if (dist < GAME_CONFIG.INTERACTION_DISTANCE + 4) {
          this.sellAllProduce();
        }
      }
    }

    // Dialog box update
    this.dialogBox.update();

    // Farming system update
    if (!this.dialogBox.visible) {
      this.farmingSystem.update(delta, ePressed);
    }

    // HUD update
    this.hud.update();
  }

  /** Handle Dialog interaction (Start or Advance) */
  private handleInteraction(isSpace: boolean): void {
    if (this.dialogBox.visible) {
      this.dialogBox.advance();
    } else if (!this.player.isInteracting) {
      // If not interacting, we can start dialog if near NPC
      // For mouse click, we only start if button was just pressed (handled by listener)
      for (const npc of this.npcs) {
        if (npc.isNearPlayer) {
          this.player.isInteracting = true;
          this.dialogBox.show(
            npc.dialogData.name,
            npc.dialogData.lines,
            () => {
              this.player.isInteracting = false;
            }
          );
          break;
        }
      }
    }
  }

  /** Buy seed function */
  private buySeed(seedId: string, cost: number, icon: string): void {
    if (this.player.spendCoins(cost)) {
      this.player.addItem(seedId, 1, icon);
      this.dialogBox.show('System', [`Bought ${icon} for ${cost}G!`], () => {
         this.player.isInteracting = false;
      });
    } else {
      this.dialogBox.show('System', [`Not enough gold! Need ${cost}G`], () => {
         this.player.isInteracting = false;
      });
    }
  }

  /** Sell produce function */
  private sellAllProduce(): void {
    const totalValue = this.player.sellProduce();
    if (totalValue > 0) {
      this.player.isInteracting = true;
      this.dialogBox.show('System', [
        `Sold all produce for ${totalValue}G!`,
        'Come back soon!'
      ], () => {
        this.player.isInteracting = false;
      });
    } else {
      // Only show if not already in dialog or specifically requested
      this.player.isInteracting = true;
      this.dialogBox.show('System', ['No produce to sell!'], () => {
        this.player.isInteracting = false;
      });
    }
  }
}

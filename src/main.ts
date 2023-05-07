import './style.scss'
import { Player } from './Player'
import { Vector2D } from './Vector2D'
import { Wall } from './DonaldTrump'
import { InputController } from './InputController'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="canvas">
  </canvas>
`

const w = 1920;
const h = 1080;

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
canvas.width = w;
canvas.height = h;
const ctx = canvas.getContext('2d')!;

class Level {
  name: string;
  width: number = w;
  height: number = h;
  previousRAF: number = 0;
  player!: Player;
  level!: {
    walls: Wall[]
  };
  inputController: InputController = new InputController();
  constructor(name: string) {
    this.name = name

    this.init();
  }

  async init() {
    await this.initLevel();

    this.player = new Player(new Vector2D(100, 100), new Vector2D(96, 96), this.inputController);
    this.update();
  }

  async initLevel() {
    await import(`./levels/${this.name}.ts`).then((levelModule: any) => {
      const level = levelModule.default;
      const walls = level.walls.map((wall: any) => {
        return new Wall(new Vector2D(wall.x, wall.y), new Vector2D(wall.w, wall.h))
      })
      this.level = {
        walls
      }
    })
  }

  update() {
    requestAnimationFrame((t: number) => {
      ctx.clearRect(0, 0, this.width, this.height);
      this.step(t - this.previousRAF);
      this.previousRAF = t;

      this.update();
    })
  }

  step(timeElapsed: number) {
    const timeElapsedS = timeElapsed / 1000;

    // this.inputController.update();
    this.player.update(timeElapsedS, this.inputController, this.level.walls);
    this.player.draw(ctx);
    this.level.walls.forEach(wall => {
      wall.draw(ctx);
    })
  }
}

const level = new Level('level_1');
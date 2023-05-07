import { Vector2D } from "./Vector2D";
import { InputController } from "./InputController";

class Player {
    position: Vector2D;
    size: Vector2D;
    velocity: Vector2D = new Vector2D(0, 0);
    onGround: boolean = false;
    inputController: InputController;
    constructor(position: Vector2D, size: Vector2D, inputController: InputController) {
        this.position = position
        this.size = size
        this.inputController = inputController

        setInterval(() => {
            this.updateFriction(this.inputController)
        }, 1000 / 150)
    }

    update(timeElapsedS: number, inputController: InputController, walls: any[]) {
        this.inputController = inputController;
        this.updatePosition(timeElapsedS, inputController, walls)
    }

    updatePosition(timeElapsedS: number, inputController: InputController, walls: any[]) {
        timeElapsedS > 0.1 && (timeElapsedS = 0.1);

        const speed = 750;
        const verticalSpeed = speed * 5;
        const acceleration = speed * 10;
        const gravity = 4000;
        const jumpForce = 30;

        const distance = this.velocity.mul(new Vector2D(timeElapsedS, timeElapsedS));
        this.position = this.position.add(distance);

        const { keys } = inputController;

        this.collisionCheck(walls);

        this.velocity.y += gravity * timeElapsedS;

        keys['a'] && (this.velocity.x -= acceleration * timeElapsedS);
        keys['d'] && (this.velocity.x += acceleration * timeElapsedS);
        keys['w'] && this.onGround && (this.velocity.y -= acceleration * timeElapsedS * jumpForce);

        this.velocity.x > speed && (this.velocity.x = speed);
        this.velocity.x < -speed && (this.velocity.x = -speed);
        this.velocity.y > verticalSpeed && (this.velocity.y = verticalSpeed);
        this.velocity.y < -verticalSpeed && (this.velocity.y = -verticalSpeed);
    }

    updateFriction(inputController: InputController) {
        const { keys } = inputController;

        if (keys['a'] || keys['d']) return;
        const friction = 0.8;
        const airFriction = 0.9;

        this.velocity.x *= this.onGround ? friction : airFriction;
    }

    collisionCheck(walls: any[]) {
        this.onGround = false;

        for (const wall of walls) {
            const collision = wall.collide({
                x: this.position.x,
                y: this.position.y,
                width: this.size.x,
                height: this.size.y
            });

            console.log(collision)

            switch (collision.direction) {
                case 'left':
                    this.position.x = wall.position.x - this.size.x;
                    this.velocity.x = 0;
                    break;
                case 'right':
                    this.position.x = wall.position.x + wall.size.x;
                    this.velocity.x = 0;
                    break;
                case 'top':
                    this.position.y = wall.position.y - this.size.y;
                    this.velocity.y = 0;
                    this.onGround = true;
                    break;
                case 'bottom':
                    this.position.y = wall.position.y + wall.size.y;
                    this.velocity.y = 0;
                    break;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'white'
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
    }
}

export { Player }
import { Vector2D } from "./Vector2D";
import { InputController } from "./InputController";
import { Animation } from "./Animation";

class Player {
    position: Vector2D;
    size: Vector2D;
    animationSize: Vector2D = new Vector2D(96, 96);
    velocity: Vector2D = new Vector2D(0, 0);
    onGround: boolean = false;
    inputController: InputController;
    animations: { [key: string]: Animation };
    currentAnimation: Animation;
    inverted: boolean = false;
    constructor(position: Vector2D, size: Vector2D, inputController: InputController, animations: { [key: string]: Animation }) {
        this.position = position
        this.size = size
        this.inputController = inputController
        this.animations = animations
        this.currentAnimation = animations.idle

        setInterval(() => {
            this.updateFriction(this.inputController)
        }, 1000 / 150)
    }

    update(timeElapsedS: number, inputController: InputController, walls: any[]) {
        this.inputController = inputController;
        this.updatePosition(timeElapsedS, inputController, walls)
    }

    updateAnimation() {
        const rounding = 100;

        this.inverted = this.velocity.x < 0;

        // idle
        if (this.velocity.x < rounding && this.velocity.x > -rounding && this.onGround) {
            this.currentAnimation = this.animations.idle;
        }

        // falling
        if (this.velocity.y > rounding && !this.onGround) {
            this.currentAnimation = this.animations.falling;
        }

        // jumping
        if (this.velocity.y < -rounding && !this.onGround) {
            this.currentAnimation = this.animations.jumping;
        }
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

        keys['a'] && !keys['d'] && (this.velocity.x -= acceleration * timeElapsedS);
        keys['d'] && !keys['a'] && (this.velocity.x += acceleration * timeElapsedS);
        keys['w'] && this.onGround && (this.velocity.y -= acceleration * timeElapsedS * jumpForce);

        this.velocity.x > speed && (this.velocity.x = speed);
        this.velocity.x < -speed && (this.velocity.x = -speed);
        this.velocity.y > verticalSpeed && (this.velocity.y = verticalSpeed);
        this.velocity.y < -verticalSpeed && (this.velocity.y = -verticalSpeed);

        this.updateAnimation();
    }

    updateFriction(inputController: InputController) {
        const { keys } = inputController;

        if ((keys['a'] || keys['d']) && !(keys['a'] && keys['d'])) return;
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
        this.currentAnimation.draw(ctx, this.position, this.size, this.animationSize, this.inverted);
    }
}

export { Player }
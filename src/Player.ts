import { Vector2D } from "./Vector2D";
import { InputController } from "./InputController";
import { Animation } from "./Animation";
import { Wall } from "./DonaldTrump";

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
    crouching: boolean = false;
    canUnCrouch: boolean = true;
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

    update(timeElapsedS: number, inputController: InputController, walls: Wall[]) {
        this.inputController = inputController;
        this.updatePosition(timeElapsedS, inputController, walls)
    }

    setAnimation(animation: Animation) {
        if (this.currentAnimation === animation) return;
        this.currentAnimation = animation;
        this.currentAnimation.reset();
    }

    updateAnimation() {
        const rounding = 100;

        this.inverted = this.velocity.x < 0;

        // idle
        if (this.velocity.x < rounding && this.velocity.x > -rounding && this.onGround) {
            this.setAnimation(this.animations.idle);
        }

        // falling
        if (this.velocity.y > rounding && !this.onGround) {
            this.setAnimation(this.animations.falling);
        }

        // jumping
        if (this.velocity.y < -rounding && !this.onGround) {
            this.setAnimation(this.animations.jumping);
        }

        // walking/running
        if (this.velocity.x > rounding && this.onGround || this.velocity.x < -rounding && this.onGround) {
            this.setAnimation(!this.inputController.keys['shift'] ? this.animations.running : this.animations.walking);

        }

        // crouching
        if (this.crouching) {
            this.setAnimation(this.animations.crouching);
        }
    }

    updateCrouching(s: boolean, walls: Wall[]) {
        const crouchingSizeDifference = 24;

        if (this.crouching) {
            const testPlayer = new Player(new Vector2D(this.position.x, this.position.y), new Vector2D(this.size.x, this.size.y), this.inputController, this.animations);
            testPlayer.position.y -= crouchingSizeDifference;
            testPlayer.size.y += crouchingSizeDifference;

            for (const wall of walls) {
                const collision = wall.collide({ x: testPlayer.position.x, y: testPlayer.position.y, width: testPlayer.size.x, height: testPlayer.size.y });

                if (collision.direction !== 'top' && collision.direction !== 'none') return false;
            }

            if (s) return true;

            this.crouching = false;
            this.position.y -= crouchingSizeDifference;
            this.size.y += crouchingSizeDifference;

            return true;
        } else {
            if (!s) return true;

            this.crouching = true;
            this.position.y += crouchingSizeDifference;
            this.size.y -= crouchingSizeDifference;
            return true;
        }
    }

    updatePosition(timeElapsedS: number, inputController: InputController, walls: any[]) {
        timeElapsedS > 0.1 && (timeElapsedS = 0.1);

        let speed = 750;
        const verticalSpeed = speed * 5;
        const acceleration = speed * 10;
        const gravity = 4000;
        const jumpForce = 30;

        const distance = this.velocity.mul(new Vector2D(timeElapsedS, timeElapsedS));
        this.position = this.position.add(distance);

        const { keys } = inputController;

        // crouching
        if (this.onGround) this.canUnCrouch = this.updateCrouching(keys['s'], walls);
        else {
            this.canUnCrouch = true;
            this.crouching = false;
        }

        this.collisionCheck(walls);

        this.velocity.y += gravity * timeElapsedS;


        if (!this.crouching) {
            if (keys['shift']) {
                speed /= 3;
            }

            keys['d'] && !keys['a'] && (this.velocity.x += acceleration * timeElapsedS);
            keys['a'] && !keys['d'] && (this.velocity.x -= acceleration * timeElapsedS);
            keys['w'] && this.onGround && (this.velocity.y -= acceleration * timeElapsedS * jumpForce);
        }


        this.velocity.x > speed && (this.velocity.x = speed);
        this.velocity.x < -speed && (this.velocity.x = -speed);
        this.velocity.y > verticalSpeed && (this.velocity.y = verticalSpeed);
        this.velocity.y < -verticalSpeed && (this.velocity.y = -verticalSpeed);

        this.updateAnimation();
    }

    updateFriction(inputController: InputController) {
        const { keys } = inputController;

        if (!this.canUnCrouch || ((keys['a'] || keys['d']) && !(keys['a'] && keys['d']) && !this.crouching)) return;
        const friction = 0.8;
        const airFriction = 0.9;
        const slidingFriction = 0.99;

        let currentFriction = friction;

        if (this.crouching) {
            currentFriction = slidingFriction;
        } else if (!this.onGround) {
            currentFriction = airFriction;
        }

        this.velocity.x *= currentFriction;

    }

    collisionCheck(walls: any[], player: Player = this) {
        player.onGround = false;

        for (const wall of walls) {
            const collision = wall.collide({
                x: player.position.x,
                y: player.position.y,
                width: player.size.x,
                height: player.size.y
            });

            switch (collision.direction) {
                case 'left':
                    if (this.crouching) {
                        player.position.x = wall.position.x - player.size.x;
                        player.velocity.x = -player.velocity.x;
                        break;
                    } else {
                        player.position.x = wall.position.x - player.size.x;
                        player.velocity.x = 0;
                        break;
                    }
                case 'right':
                    if (this.crouching) {
                        player.position.x = wall.position.x + wall.size.x;
                        player.velocity.x = -player.velocity.x;
                        break;
                    } else {
                        player.position.x = wall.position.x + wall.size.x;
                        player.velocity.x = 0;
                        break;
                    }
                case 'top':
                    player.position.y = wall.position.y - player.size.y;
                    player.velocity.y = 0;
                    player.onGround = true;
                    break;
                case 'bottom':
                    player.position.y = wall.position.y + wall.size.y;
                    player.velocity.y = 0;
                    break;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.currentAnimation.draw(ctx, this.position, this.size, this.animationSize, this.inverted);

        // ctx.strokeStyle = 'red';
        // ctx.beginPath();
        // ctx.moveTo(this.position.x, this.position.y);
        // ctx.lineTo(this.position.x + this.size.x, this.position.y);
        // ctx.lineTo(this.position.x + this.size.x, this.position.y + this.size.y);
        // ctx.lineTo(this.position.x, this.position.y + this.size.y);
        // ctx.lineTo(this.position.x, this.position.y);
        // ctx.stroke();
        // ctx.closePath();
    }
}

export { Player }
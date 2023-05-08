import { Vector2D } from "./Vector2D";

class Animation {
    size: Vector2D;
    src: string;
    startTime: number;
    frames: number[];
    totalFrameTime: number;
    constructor(size: Vector2D, src: string, frames: number[]) {
        this.size = size;
        this.src = src;
        this.frames = frames;
        this.totalFrameTime = frames.reduce((a: number, b: number) => a + b, 0);
        this.startTime = Date.now();
    }

    draw(ctx: CanvasRenderingContext2D, position: Vector2D, size: Vector2D = this.size, animationSize: Vector2D = this.size, inverted: boolean = false) {
        const time = Date.now() - this.startTime;
        const t = time % this.totalFrameTime;

        let frame = 0;
        let totalTime = 0;

        for (let i = 0; i < this.frames.length; i++) {
            totalTime += this.frames[i];
            if (t <= totalTime) {
                frame = i;
                break;
            }
        }

        const image = new Image();
        image.src = this.src.replace('{frame}', frame.toString().padStart(4, '0'));
        ctx.imageSmoothingEnabled = false;
        if (!inverted) {
            ctx.drawImage(image, position.x + size.x / 2 - animationSize.x / 2, position.y + size.y - animationSize.y, animationSize.x, animationSize.y);
        } else {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(image, -position.x - size.x / 2 - animationSize.x / 2, position.y + size.y - animationSize.y, animationSize.x, animationSize.y);
            ctx.restore();
        }
    }
}

export { Animation }
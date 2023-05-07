import { Vector2D } from './Vector2D'

class Wall {
    position: Vector2D;
    size: Vector2D;
    constructor(position: Vector2D, size: Vector2D) {
        this.position = position
        this.size = size
    }
    anyCollide(other: { x: number, y: number, width: number, height: number }) {
        return this.position.x < other.x + other.width &&
            this.position.x + this.size.x > other.x &&
            this.position.y < other.y + other.height &&
            this.position.y + this.size.y > other.y
    }

    collide(other: { x: number, y: number, width: number, height: number }) {
        const collision = {
            left: Infinity,
            right: Infinity,
            top: Infinity,
            bottom: Infinity
        }

        if (this.anyCollide(other)) {
            collision.left = Math.abs(other.x + other.width - this.position.x)
            collision.right = Math.abs(this.position.x + this.size.x - other.x)
            collision.top = Math.abs(other.y + other.height - this.position.y)
            collision.bottom = Math.abs(this.position.y + this.size.y - other.y)
        }

        const min = Math.min(collision.left, collision.right, collision.top, collision.bottom)
        if (min === Infinity) return {
            distance: Infinity,
            direction: 'none'
        }
        if (min === collision.left) {
            return {
                distance: collision.left,
                direction: 'left'
            }
        } else if (min === collision.right) {
            return {
                distance: collision.right,
                direction: 'right'
            }
        }
        else if (min === collision.top) {
            return {
                distance: collision.top,
                direction: 'top'
            }
        }
        else if (min === collision.bottom) {
            return {
                distance: collision.bottom,
                direction: 'bottom'
            }
        }

        return {
            distance: Infinity,
            direction: 'none'
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'black'
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
    }
}

export { Wall }
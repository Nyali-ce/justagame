class Vector2D {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    add(v: Vector2D): Vector2D {
        return new Vector2D(this.x + v.x, this.y + v.y)
    }

    sub(v: Vector2D): Vector2D {
        return new Vector2D(this.x - v.x, this.y - v.y)
    }

    mul(v: Vector2D): Vector2D {
        return new Vector2D(this.x * v.x, this.y * v.y)
    }

    div(v: Vector2D): Vector2D {
        return new Vector2D(this.x / v.x, this.y / v.y)
    }
}

export { Vector2D }
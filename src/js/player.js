export class Player {
    #x = 0;
    #y = 0;
    #width = 0;
    #height = 0;
    #speed = 0;

    constructor(x, y, width, height, speed) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#speed = speed;
    }

    update(dt, keys, gameField) {
        if (keys.left) this.#x -= this.#speed * dt;
        if (keys.right) this.#x += this.#speed * dt;
        if (this.#x < 0) this.#x = 0;
        if (this.#x + this.#width > gameField.width) this.#x = gameField.width - this.#width;
    }
    
    draw(ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.#x, this.#y, this.#width, this.#height);
    }

    get bounds() {
        return {
            x: this.#x,
            y: this.#y,
            width: this.#width,
            height: this.#height
        };
    }
}
export class Enemy {
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

    update(gameField) {
        this.#y += this.#speed;
        if (this.#y > gameField.height + this.#height) this.#reset(gameField);
    }

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.#x, this.#y, this.#width, this.#height);
    }

    #reset(gameField) {
        this.#x = Math.random() * (gameField.width - this.#width);
        this.#y = -this.#height;
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
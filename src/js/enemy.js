export class Enemy {
    #x = 0;
    #y = 0;
    #width = 0;
    #height = 0;
    #speed = 0;
    #hp = 0;
    #scoreValue = 0;
    #isActive = true;

    constructor(x, y, width, height, speed, hp, scoreValue) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#speed = speed;
        this.#hp = hp;
        this.#scoreValue = scoreValue;
    }

    update(dt, gameField) {
        this.#y += this.#speed * dt;
        if (this.#y > gameField.height + this.#height) this.die();
    }

    draw(ctx) {
        ctx.fillStyle = "red";
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

    get active() { return this.#isActive; }
    die() {
        if (!this.#isActive) return;
        this.#isActive = false;
    }

    takeDamage() {
        if (!this.#isActive) return false;
        this.#hp -= 1;
        if (this.#hp <= 0) {
            this.#hp = 0;
            this.die();
            return true;
        }
        return false;
    }

    get scoreValue() { return this.#scoreValue; }
}
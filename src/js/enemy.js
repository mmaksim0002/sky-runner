export class Enemy {
    #x = 0;
    #y = 0;
    #width = 0;
    #height = 0;
    #speed = 0;
    #hp = 0;
    #scoreValue = 0;
    #shootTimer = 0;
    #damageTimer = 0;
    #reloadSpeed = 0;
    #isActive = true;
    #image = null;

    constructor(x, y, width, height, speed, hp, scoreValue, image, reloadSpeed = 0) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#speed = speed;
        this.#hp = hp;
        this.#scoreValue = scoreValue;
        this.#reloadSpeed = reloadSpeed;
        this.#shootTimer = Math.random() * this.#reloadSpeed;
        this.#image = image;
    }

    update(dt, gameField, spawnBullet = () => {}) {
        this.#y += this.#speed * dt;
        if (this.#y > gameField.height + this.#height) this.die();
        if (this.#reloadSpeed > 0) {
            if (this.#shootTimer > 0) this.#shootTimer -= dt;
            if (this.#shootTimer <= 0) {
                spawnBullet(this.#x, this.#y, this.#width, this.#height, this.#speed);
                this.#shootTimer = this.#reloadSpeed;
            }
        }
        if (this.#damageTimer > 0) this.#damageTimer -= dt;
    }

    draw(ctx) {
        if (this.#image && this.#image.complete) {
            ctx.imageSmoothingEnabled = false;
            if (this.#damageTimer > 0) {
                ctx.globalAlpha = 0.5;
            }
            ctx.drawImage(this.#image, this.#x, this.#y, this.#width, this.#height);
            ctx.globalAlpha = 1;
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(this.#x, this.#y, this.#width, this.#height);
        }
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
        } else {
            this.#damageTimer = 0.15;
        }
        return false;
    }

    get scoreValue() { return this.#scoreValue; }
}
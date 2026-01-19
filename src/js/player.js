export class Player {
    static #DEFAULT_RELOAD_SPEED = 0.3;
    static #INVULNERABILITY_TIME = 1.5;
    #x = 0;
    #y = 0;
    #width = 0;
    #height = 0;
    #speed = 0;
    #lives = 3;
    #shootTimer = 0;
    #boostTimer = 0;
    #invulnerabilityTimer = 0;
    #reloadSpeed = Player.#DEFAULT_RELOAD_SPEED;
    #isActive = true;
    #isInvulnerability = false;

    constructor(x, y, width, height, speed) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#speed = speed;
    }

    update(dt, keys, gameField, spawnBullet = () => {}) {
        if (keys.left) this.#x -= this.#speed * dt;
        if (keys.right) this.#x += this.#speed * dt;
        if (this.#x < 0) this.#x = 0;
        if (this.#x + this.#width > gameField.width) this.#x = gameField.width - this.#width;
        if (this.#invulnerabilityTimer > 0) {
            this.#invulnerabilityTimer -= dt;
            if (this.#invulnerabilityTimer <= 0) this.#isInvulnerability = false;
        }
        if (this.#boostTimer > 0) { 
            this.#boostTimer -= dt;
            if (this.#boostTimer <= 0) this.#reloadSpeed = Player.#DEFAULT_RELOAD_SPEED;
        }
        if (this.#shootTimer > 0) this.#shootTimer -= dt;
        if (keys.shoot && this.#shootTimer <= 0) {
            spawnBullet(this.#x, this.#y, this.#width);
            this.#shootTimer = this.#reloadSpeed;
        }
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

    get lives() { return this.#lives; }
    get active() { return this.#isActive; }

    takeDamage() {
        if (!this.#isActive || this.#isInvulnerability) return;
        this.#lives -= 1;
        if (this.#lives <= 0) {
            this.#lives = 0;
            this.#isActive = false;
        } else {
            this.#isInvulnerability = true;
            this.#invulnerabilityTimer = Player.#INVULNERABILITY_TIME;
        }
    }

    addLife(liveCount) {
        this.#lives += liveCount;
        if (this.#lives > 3) this.#lives = 3;
    }

    applyFireBoost(value, duration) {
        if (!value || !duration) return;
        this.#boostTimer = duration;
        this.#reloadSpeed = value;
    }
}
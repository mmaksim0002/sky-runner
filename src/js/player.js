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
    #image = null;

    constructor(x, y, width, height, speed, image) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#speed = speed;
        this.#image = image;
    }

    update(dt, input, gameField, spawnBullet = () => {}) {
        if (input.touches?.active) {
            const targetX = input.touches.x - this.#width / 2;
            const dx = targetX - this.#x;
            this.#x += dx * 0.25;
        }
        if (input.keys.left) this.#x -= this.#speed * dt;
        if (input.keys.right) this.#x += this.#speed * dt;
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
        if (input.keys.shoot && this.#shootTimer <= 0) {
            spawnBullet(this.#x, this.#y, this.#width);
            this.#shootTimer = this.#reloadSpeed;
        }
    }
    
    draw(ctx) {
        if (this.#image && this.#image.complete) {
            if (this.#isInvulnerability) ctx.globalAlpha = Math.sin(this.#invulnerabilityTimer * 20) * 0.5 + 0.5;
            ctx.drawImage(this.#image, this.#x, this.#y, this.#width, this.#height);
            ctx.globalAlpha = 1;
        } else {
            ctx.fillStyle = "blue";
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
        this.onLifeAdded?.();
    }

    applyFireSpeed(value, duration) {
        if (!value || !duration) return;
        this.#boostTimer = duration;
        this.#reloadSpeed = value;
    }

    resizeY(y) {
        this.#y = y;
    }
}

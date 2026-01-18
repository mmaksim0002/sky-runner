export class Bonus {
    #x = 0;
    #y = 0;
    #width = 0;
    #height = 0;
    #speed = 0;
    #isActive = true;

    constructor(x, y, width, height, speed) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#speed = speed;
    }

    update(dt, gameField) {
        this.#y += this.#speed * dt;
        if (this.#y >= gameField.height + this.#height) this.#isActive = false;
    } 

    draw(ctx) {
        ctx.fillRect(this.#x, this.#y, this.#width, this.#height);
    }

    apply() { this.#isActive = false; }   
    get active() { return this.#isActive; }

    get bounds() {
        return {
            x: this.#x,
            y: this.#y,
            width: this.#width,
            height: this.#height
        }
    }
}

export class BonusLife extends Bonus {
    #livesCount = 1;

    apply(player) {
        super.apply();
        player.addLife(this.#livesCount);
    }

    draw(ctx) {
        ctx.fillStyle = "green";
        super.draw(ctx);
    }
}

export class BonusRapidFire extends Bonus {
    #boostValue = 0.15;
    #duration = 5;

    apply(player) {
        super.apply();
        player.applyFireBoost(this.#boostValue, this.#duration);
    }

    draw(ctx) {
        ctx.fillStyle = "yellow";
        super.draw(ctx);
    }
}
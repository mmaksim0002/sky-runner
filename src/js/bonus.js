export class Bonus {
    #x = 0;
    #y = 0;
    #width = 0;
    #height = 0;
    #speed = 0;
    #isActive = true;
    #image = null;

    constructor(x, y, width, height, speed, image) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#speed = speed;
        this.#image = image;
    }

    update(dt, gameField) {
        this.#y += this.#speed * dt;
        if (this.#y >= gameField.height + this.#height) this.#isActive = false;
    } 

    draw(ctx) {
        if (this.#image && this.#image.complete) {
            ctx.drawImage(this.#image, this.#x, this.#y, this.#width, this.#height);
            // хитбокс
            // ctx.strokeStyle = "red";
            // ctx.strokeRect(this.#x, this.#y, this.#width, this.#height);
        } else {
            ctx.fillRect(this.#x, this.#y, this.#width, this.#height);
        }
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
        player.applyFireSpeed(this.#boostValue, this.#duration);
    }

    draw(ctx) {
        ctx.fillStyle = "yellow";
        super.draw(ctx);
    }
}

export class BonusSlowFire extends Bonus {
    #slowValue = 1;
    #duration = 3;

    apply(player) {
        super.apply();
        player.applyFireSpeed(this.#slowValue, this.#duration);
    }

    draw(ctx) {
        ctx.fillStyle = "grey";
        super.draw(ctx);
    }
}

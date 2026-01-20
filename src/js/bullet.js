export class Bullet {
    #x = 0;
    #y = 0;
    #width = 0;
    #height = 0;
    #speed = 0;
    #directionDown = false;
    #isActive = true;
    #image = null;

    constructor(x, y, width, height, speed, image, directionDown = false) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#speed = speed;
        this.#directionDown = directionDown;
        this.#image = image;
    }

    update(dt, gameField) {
        if (!this.#directionDown) {
            this.#y -= this.#speed * dt;
            if (this.#y + this.#height <= 0) this.#isActive = false;
        } else {
            this.#y += this.#speed * dt;
            if (this.#y > gameField.height + this.#height) this.#isActive = false;
        }
    }

    draw(ctx) {
        if (this.#image && this.#image.complete) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.#image, this.#x, this.#y, this.#width,this.#height);
            // хитбокс
            // ctx.strokeStyle = "red";
            // ctx.strokeRect(this.#x, this.#y, this.#width, this.#height);
        } else {
            ctx.fillStyle = "grey";
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
    deactivate() { this.#isActive = false; }

}
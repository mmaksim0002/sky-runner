export class Background {
    #canvasWidth = 0;
    #canvasHeight = 0;
    #scrollSpeed = 60;
    #backgroundY = 0;

    constructor(canvasWidth, canvasHeight) {
        this.#canvasWidth = canvasWidth;
        this.#canvasHeight = canvasHeight;
    }

    update(dt) {
        this.#backgroundY += this.#scrollSpeed * dt;
        if (this.#backgroundY >= 30) this.#backgroundY = 0;
    }

    draw(ctx) {

        ctx.fillStyle = "#FDF5E6";
        ctx.fillRect(0, 0, this.#canvasWidth, this.#canvasHeight);
        ctx.strokeStyle = "#D1E5F0";
        ctx.lineWidth = 1;
        for (let y = this.#backgroundY; y < this.#canvasHeight; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.#canvasWidth, y);
            ctx.stroke();
        }

        for (let x = 0; x < this.#canvasWidth; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.#canvasHeight);
            ctx.stroke();
        }

        ctx.strokeStyle = "#FFB3B3";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, 0);
        ctx.lineTo(60, this.#canvasHeight);
        ctx.stroke();

    }

    resize(canvasWidth, canvasHeight) {
        this.#canvasWidth = canvasWidth;
        this.#canvasHeight = canvasHeight;
    }
}

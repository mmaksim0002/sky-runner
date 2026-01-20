export class Background {
    #tileImage = null;
    #tileSize = 32;
    #speed = 60;
    #offsetY = 0;
    #canvasWidth =0;
    #canvasHeight = 0;

    constructor(titleImage, canvasWidth, canvasHeight) {
        this.#tileImage = titleImage;
        this.#canvasWidth = canvasWidth;
        this.#canvasHeight = canvasHeight;
    }

    update(dt) {
        this.#offsetY += this.#speed * dt;
        if (this.#offsetY >= this.#tileSize) {
            this.#offsetY -= this.#tileSize;
        }
    }

    draw(ctx) {
        ctx.imageSmoothingEnabled = false;
        for (let y = -this.#tileSize + this.#offsetY; y < this.#canvasHeight; y += this.#tileSize) {
            for (let x = 0; x < this.#canvasWidth; x += this.#tileSize) {
                ctx.drawImage(this.#tileImage, x, y, this.#tileSize, this.#tileSize);
            }
        }
    }
}
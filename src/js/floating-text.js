export class FloatingText {
    #x =0;
    #y = 0;
    #text = null;
    #speed = 20;
    #duration = 0.6;
    #isActive = true;
    constructor(text, x, y) {
        this.#x = x;
        this.#y = y;
        this.#text = text;
    }

    update(dt) {
        this.#y -= this.#speed * dt;
        this.#duration -= dt;
        if (this.#duration <= 0) this.#isActive = false;
    }

    draw(ctx) {
        // const p = this.#duration / 0.8;
        // const scale = 1 + (1 - p) * 0.2;
        ctx.save();
        // ctx.translate(this.#x, this.#y);
        // ctx.scale(scale, scale);
        ctx.globalAlpha = Math.max(this.#duration / 0.8, 0);
        ctx.fillStyle = "#000";
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = "center";
        ctx.fillText(this.#text, this.#x, this.#y);
        ctx.restore();
    }
    get active() { return this.#isActive; }
}

export class InputHandler {
    #canvas = null;
    constructor(canvas) {
        this.keys = {
            left: false,
            right: false
        };
        this.#canvas = canvas;
        window.addEventListener('keydown', (event) => { this.#toggleKey(event.code, true); });
        window.addEventListener('keyup', (event) => { this.#toggleKey(event.code, false); });
        canvas.addEventListener('touchstart', (event) => { this.#touchHandler(event); });
        canvas.addEventListener('touchmove', (event) => { this.#touchHandler(event); });
        canvas.addEventListener('touchend', () => { this.#endTouchHandler(); });
        canvas.addEventListener('touchcancel', () => { this.#endTouchHandler(); });
    }

    #toggleKey(code, isPressed) {
        if (code === "ArrowLeft") this.keys.left = isPressed;
        if (code === "ArrowRight") this.keys.right = isPressed;
    }

    #touchHandler(event) {
        if (event.cancelable) event.preventDefault();
        const touch = event.touches[0];
        const canvasRect = this.#canvas.getBoundingClientRect();
        const x = touch.clientX - canvasRect.left;
        if (x < this.#canvas.width / 2) {
            this.keys.left = true;
            this.keys.right = false;
        } else {
            this.keys.left = false;
            this.keys.right = true;
        }
    }

    #endTouchHandler() {
        this.keys.left = false;
        this.keys.right = false;
    }
}
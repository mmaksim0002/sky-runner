export class InputHandler {
    #canvas = null;
    constructor(canvas) {
        this.keys = {
            left: false,
            right: false,
            shoot: false
        };
        this.actions = {
            pause: false,
            restart: false,
            start:false
        };
        this.touches = {
            active: false,
            x: 0
        };
        this.#canvas = canvas;
        window.addEventListener('keydown', (event) => { this.#toggleKey(event.code, true); });
        window.addEventListener('keyup', (event) => { this.#toggleKey(event.code, false); });
        canvas.addEventListener('touchstart', (event) => { this.#touchHandler(event); });
        canvas.addEventListener('touchmove', (event) => { this.#touchMove(event); });
        canvas.addEventListener('touchend', () => { this.#endTouchHandler(); });
        canvas.addEventListener('touchcancel', () => { this.#endTouchHandler(); });
    }

    #toggleKey(code, isPressed) {
        if (code === "ArrowLeft") this.keys.left = isPressed;
        if (code === "ArrowRight") this.keys.right = isPressed;
        if (code === "Space") this.keys.shoot = isPressed;
        if (!isPressed) return;
        if (code === "Escape") this.actions.pause = true;
        if (code === "Enter") this.actions.start = true;
        if (code === "KeyR") this.actions.restart = true;
    }

    #touchHandler(event) {
        if (event.cancelable) event.preventDefault();
        const touch = event.touches[0];
        const canvasRect = this.#canvas.getBoundingClientRect();
        const x = touch.clientX - canvasRect.left;
        this.touches.active = true;
        this.touches.x = x;
        this.keys.shoot = true;
    }

    #touchMove(event) {
        if (!this.touches.active) return;
        if (event.cancelable) event.preventDefault();
        const touch = event.touches[0];
        const canvasRect = this.#canvas.getBoundingClientRect();
        this.touches.x = touch.clientX - canvasRect.left;
    }

    #endTouchHandler() {
        this.touches.active = false;
        this.keys.shoot = false;
    }

    consume(action) {
        const value = this.actions[action];
        this.actions[action] = false;
        return value;
    }
}
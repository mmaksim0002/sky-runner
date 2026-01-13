const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 480;
let animationId = null;

function init() {
    // TODO: init game
    requestAnimationFrame(gameLoop);
}

function update() {
    // TODO: update logic
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // TODO: draw player, enemies and etc.
}

function gameLoop() {
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

init();

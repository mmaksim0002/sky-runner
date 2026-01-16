import { Player } from "./player.js";
import { InputHandler } from "./input.js";
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 480;
let animationId = null;
let player = null;
let input = null;
const gameField = {
    width: canvas.width,
    height: canvas.height
};

function init() {
    const playerWidth = 50;
    const playerHeight = 40;
    const playerPadding = 15;
    const playerX = (canvas.width - playerWidth) / 2;
    const playerY = canvas.height - playerHeight - playerPadding;
    const playerSpeed = 3;
    player = new Player(playerX, playerY, playerWidth, playerHeight, playerSpeed);
    input = new InputHandler(canvas);
    requestAnimationFrame(gameLoop);
}

function update() {
    player.update(input.keys, gameField);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
}

function gameLoop() {
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

init();

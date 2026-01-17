import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Enemy } from "./enemy.js";
const canvas = document.getElementById("game-canvas");
const gameOverModal = document.getElementById("game-over-modal");
const ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 480;
let animationId = null;
let player = null;
let input = null;
let enemy = null;
let isGameOver = false;
const gameField = {
    width: canvas.width,
    height: canvas.height
};

function isColliding(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
}

function gameOver() {
    cancelAnimationFrame(animationId);
    gameOverModal.classList.add("visible");
}

function init() {
    const playerWidth = 50;
    const playerHeight = 40;
    const playerPadding = 15;
    const playerX = (canvas.width - playerWidth) / 2;
    const playerY = canvas.height - playerHeight - playerPadding;
    const playerSpeed = 3;
    player = new Player(playerX, playerY, playerWidth, playerHeight, playerSpeed);
    input = new InputHandler(canvas);
    const [enemyWidth, enemyHeight] = [20, 20];
    const [enemyX, enemyY] = [Math.random() * (canvas.width - enemyWidth), -enemyHeight];
    const enemySpeed = 2;
    enemy = new Enemy(enemyX, enemyY, enemyWidth, enemyHeight, enemySpeed);
    requestAnimationFrame(gameLoop);
}

function update() {
    player.update(input.keys, gameField);
    enemy.update(gameField);
    if (isColliding(player.bounds, enemy.bounds)) isGameOver = true;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    enemy.draw(ctx);
}

function gameLoop() {
    if (isGameOver) {
        gameOver();
        return;
    }
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

init();

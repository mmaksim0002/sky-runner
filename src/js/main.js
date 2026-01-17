import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Enemy } from "./enemy.js";
import { Bullet } from "./bullet.js";
const canvas = document.getElementById("game-canvas");
const gameOverModal = document.getElementById("game-over-modal");
const ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 480;
let animationId = null;
let player = null;
let input = null;
let isGameOver = false;
let lastTime = 0;
let playerBullets = [];
let enemies = [];
let shootTimer = 0;
const RELOAD_SPEED = 0.3;
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

function spawnEnemy() {
    const [enemyWidth, enemyHeight] = [20, 20];
    const [enemyX, enemyY] = [Math.random() * (canvas.width - enemyWidth), -enemyHeight];
    const enemySpeed = 120;
    enemies.push(new Enemy(enemyX, enemyY, enemyWidth, enemyHeight, enemySpeed));
}

function init() {
    const playerWidth = 50;
    const playerHeight = 40;
    const playerPadding = 15;
    const playerX = (canvas.width - playerWidth) / 2;
    const playerY = canvas.height - playerHeight - playerPadding;
    const playerSpeed = 180;
    player = new Player(playerX, playerY, playerWidth, playerHeight, playerSpeed);
    input = new InputHandler(canvas);
    spawnEnemy();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function update(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    player.update(dt, input.keys, gameField);
    enemies.forEach(e => e.update(dt, gameField));
    playerBullets.forEach(b => b.update(dt, gameField));

    if (shootTimer > 0) shootTimer -= dt;
    if (input.keys.shoot && shootTimer <= 0) {
        const playerBounds = player.bounds;
        const bulletSpeed = 240;
        const bulletWidth = 5;
        const bulletHeight = 10;
        const bulletX = (playerBounds.x + playerBounds.width / 2) - bulletWidth / 2;
        const bulletY = playerBounds.y - bulletHeight;
        playerBullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight, bulletSpeed));
        shootTimer = RELOAD_SPEED;
    }
    enemies.forEach((e) => {
        playerBullets.forEach((b) => {
            if (isColliding(e.bounds, b.bounds) && e.active && b.active) {
                b.deactivate();
                e.die();
            }
        });
        if (isColliding(player.bounds, e.bounds) && e.active) isGameOver = true;
    });

    enemies = enemies.filter(e => e.active);
    playerBullets = playerBullets.filter(b => b.active);
    // пока что создаем врага заново здесь
    if (enemies.length === 0) spawnEnemy();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    enemies.forEach(e => e.draw(ctx));
    playerBullets.forEach(b => b.draw(ctx));
}

function gameLoop(currentTime) {
    if (isGameOver) {
        gameOver();
        return;
    }
    update(currentTime);
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

init();

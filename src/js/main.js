import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Enemy } from "./enemy.js";
import { Bullet } from "./bullet.js";
import { BonusLife, BonusRapidFire, BonusSlowFire } from "./bonus.js";
const canvas = document.getElementById("game-canvas");
const gameOverModal = document.getElementById("game-over-modal");
const scoreText = document.getElementById("game-score");
const gameOverScore = document.getElementById("game-over-score");
const gameBestScore = document.getElementById("game-over-best-score");
const livesText = document.getElementById("lives");
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
let bonuses = [];
let spawnTimer = 0;
let score = 0;
const SPAWN_TIME = 2;
const MAX_ENEMIES = 3;
const BONUS_DROP_CHANCE = 0.3;
const gameField = {
    width: canvas.width,
    height: canvas.height
};

const spawnBullet = (x, y, width) => {
    const bulletSpeed = 240;
    const bulletWidth = 5;
    const bulletHeight = 10;
    const bulletX = (x + width / 2) - bulletWidth / 2;
    const bulletY = y - bulletHeight;
    playerBullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight,  bulletSpeed));
};

function isColliding(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
}

function gameOver() {
    cancelAnimationFrame(animationId);
    let bestScore = Number(localStorage.getItem("sky-runner-best-score")) || 0;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("sky-runner-best-score", bestScore);
    }
    gameOverModal.classList.add("visible");
    gameOverScore.textContent = "Score: " + score;
    gameBestScore.textContent = "Best: " + bestScore;
}

function addEnemy(width, height, hp, scoreValue) {
    const [enemyWidth, enemyHeight] = [width, height];
    const [enemyX, enemyY] = [Math.random() * (canvas.width - enemyWidth), -enemyHeight];
    const enemySpeed = Math.random() * (180 - 60) + 60;
    enemies.push(new Enemy(enemyX, enemyY, enemyWidth, enemyHeight, enemySpeed, hp, scoreValue));
}

function spawnEnemy() {
    if (enemies.length >= MAX_ENEMIES) return;
    const chance = Math.random();
    if (chance < 0.25) {
        addEnemy(30, 30, 2, 5);
    } else {
        addEnemy(20, 20, 1, 1);
    }
}

function spawnBonus(enemy) {
    const chance = Math.random();
    if (chance < BONUS_DROP_CHANCE) {
        const types = [BonusLife, BonusRapidFire, BonusSlowFire];
        const RandomBounus = types[Math.floor(Math.random() * types.length)];
        const enemyBounds = enemy.bounds;
        const speed = 120;
        const [width, height] = [25, 25];
        const [x, y] = [enemyBounds.x, enemyBounds.y];
        bonuses.push(new RandomBounus(x, y, width, height, speed));
    }
}

function init() {
    score = 0;
    scoreText.textContent = "Score: " + score;
    const playerWidth = 50;
    const playerHeight = 40;
    const playerPadding = 15;
    const playerX = (canvas.width - playerWidth) / 2;
    const playerY = canvas.height - playerHeight - playerPadding;
    const playerSpeed = 180;
    player = new Player(playerX, playerY, playerWidth, playerHeight, playerSpeed);
    livesText.textContent = "Lives: " + player.lives;
    input = new InputHandler(canvas);
    spawnEnemy();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function update(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    player.update(dt, input.keys, gameField, spawnBullet);
    enemies.forEach(e => e.update(dt, gameField));
    playerBullets.forEach(b => b.update(dt, gameField));
    bonuses.forEach(b => b.update(dt, gameField));

    enemies.forEach((e) => {
        playerBullets.forEach((b) => {
            if (isColliding(e.bounds, b.bounds) && e.active && b.active) {
                b.deactivate();
                if (e.takeDamage()) {
                    score += e.scoreValue;
                    scoreText.textContent = "Score: " + score;
                    spawnBonus(e);
                }
            }
        });
        if (isColliding(player.bounds, e.bounds) && e.active) { 
            e.die();
            player.takeDamage();
        }
    });
    if (!player.active) isGameOver = true;
    bonuses.forEach((b) => {
        if (isColliding(player.bounds, b.bounds) && b.active) b.apply(player);
    });
    livesText.textContent = "Lives: " + player.lives;
    enemies = enemies.filter(e => e.active);
    playerBullets = playerBullets.filter(b => b.active);
    bonuses = bonuses.filter(b => b.active);
    if (spawnTimer > 0) spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnEnemy();
        spawnTimer = SPAWN_TIME;
    }
    
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    enemies.forEach(e => e.draw(ctx));
    playerBullets.forEach(b => b.draw(ctx));
    bonuses.forEach(b => b.draw(ctx));
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

import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Enemy } from "./enemy.js";
import { Bullet } from "./bullet.js";
import { BonusLife, BonusRapidFire, BonusSlowFire } from "./bonus.js";
import { Background } from "./background.js";
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
let enemiesBullets = [];
let enemies = [];
let bonuses = [];
let spawnTimer = 0;
let score = 0;
const SPAWN_TIME = 2;
const MAX_ENEMIES = 4;
const BONUS_DROP_CHANCE = 0.3;
const gameField = {
    width: canvas.width,
    height: canvas.height
};
const assets = {
    player: new Image(),
    enemy: new Image(),
    bigEnemy: new Image(),
    shootingEnemy: new Image(),
    bullet: new Image(),
    bonusLife: new Image(),
    bonusRapidFire: new Image(),
    bonusSlowFire: new Image(),
    background: new Image()
}
const bonusTypes = [
    (x, y, speed) => new BonusLife(x, y, 32, 24, speed, assets.bonusLife),
    (x, y, speed) => new BonusRapidFire(x, y, 28, 24, speed, assets.bonusRapidFire),
    (x, y, speed) => new BonusSlowFire(x, y, 24, 28, speed, assets.bonusSlowFire)
];

function load() {
    return new Promise((resolve) => {
        assets.enemy.src = "src/assets/enemy.png";
        assets.bigEnemy.src = "src/assets/big-enemy.png";
        assets.shootingEnemy.src = "src/assets/shooting-enemy.png";
        assets.bullet.src = "src/assets/bullet.png";
        assets.bonusLife.src = "src/assets/bonus-life.png";
        assets.bonusRapidFire.src = "src/assets/bonus-rapid-fire.png";
        assets.bonusSlowFire.src = "src/assets/bonus-slow-fire.png";
        assets.background.src = "src/assets/background.png";
        assets.player.src = "src/assets/player.png";
        assets.player.onload = () => resolve();
    });
}

const spawnBullet = (x, y, width) => {
    const bulletSpeed = 240;
    const bulletWidth = 8;
    const bulletHeight = 12;
    const bulletX = (x + width / 2) - bulletWidth / 2;
    const bulletY = y - bulletHeight;
    playerBullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight,  bulletSpeed, assets.bullet));
};

const spawnEnemyBullet = (x, y, width, height, speed) => {
    const bulletSpeed = speed + 60;
    const bulletWidth = 8;
    const bulletHeight = 12;
    const bulletX = (x + width / 2) - bulletWidth / 2;
    const bulletY = y + height;
    enemiesBullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight,  bulletSpeed, assets.bullet, true));
}

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

function addEnemy(width, height, hp, scoreValue, image, reloadSpeed = 0) {
    const [enemyWidth, enemyHeight] = [width, height];
    const [enemyX, enemyY] = [Math.random() * (canvas.width - enemyWidth), -enemyHeight];
    const enemySpeed = Math.random() * (180 - 60) + 60;
    enemies.push(new Enemy(enemyX, enemyY, enemyWidth, enemyHeight, enemySpeed, hp, scoreValue, image, reloadSpeed));
}

function spawnEnemy() {
    if (enemies.length >= MAX_ENEMIES) return;
    const chance = Math.random();
    if (chance < 0.1) {
        addEnemy(24, 17, 1, 3, assets.shootingEnemy, 1);
    } else if (chance < 0.35) {
        addEnemy(30, 19, 2, 5, assets.bigEnemy);
    } else {
        addEnemy(20, 17, 1, 1, assets.enemy);
    }
}

function spawnBonus(enemy) {
    const chance = Math.random();
    if (chance < BONUS_DROP_CHANCE) {
        const createBonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        const enemyBounds = enemy.bounds;
        const speed = 120;
        const [x, y] = [enemyBounds.x, enemyBounds.y];
        bonuses.push(createBonus(x, y, speed));
    }
}

let background = null;

async function init() {
    await load();
    background = new Background(assets.background, canvas.width, canvas.height);
    score = 0;
    scoreText.textContent = "Score: " + score;
    const playerWidth = 32 * 2;
    const playerHeight = 24 * 2;
    const playerPadding = 15;
    const playerX = (canvas.width - playerWidth) / 2;
    const playerY = canvas.height - playerHeight - playerPadding;
    const playerSpeed = 240;
    player = new Player(playerX, playerY, playerWidth, playerHeight, playerSpeed, assets.player);
    livesText.textContent = "Lives: " + player.lives;
    input = new InputHandler(canvas);
    spawnEnemy();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function update(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    background.update(dt);
    player.update(dt, input.keys, gameField, spawnBullet);
    enemies.forEach(e => e.update(dt, gameField, spawnEnemyBullet));
    playerBullets.forEach(b => b.update(dt, gameField));
    enemiesBullets.forEach(b => b.update(dt, gameField));
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
    enemiesBullets.forEach((b) => {
        if (isColliding(player.bounds, b.bounds) && b.active) {
            b.deactivate();
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
    enemiesBullets = enemiesBullets.filter(b => b.active);
    bonuses = bonuses.filter(b => b.active);
    if (spawnTimer > 0) spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnEnemy();
        spawnTimer = SPAWN_TIME;
    }
    
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    player.draw(ctx);
    enemies.forEach(e => e.draw(ctx));
    playerBullets.forEach(b => b.draw(ctx));
    enemiesBullets.forEach(b => b.draw(ctx));
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

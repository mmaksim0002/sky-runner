import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Enemy } from "./enemy.js";
import { Bullet } from "./bullet.js";
import { BonusLife, BonusRapidFire, BonusSlowFire } from "./bonus.js";
import { Background } from "./background.js";
import { SoundManager } from "./sound-manager.js";
import { FloatingText } from "./floating-text.js";
import { PLAYER_PLANE_BASE64 } from "./splash-icon-base64.js";
const canvas = document.getElementById("game-canvas");
const gameFieldContainer = document.getElementById("game-field");
const scoreText = document.getElementById("game-score");
const gameOverScore = document.getElementById("game-over-score");
const gameBestScore = document.getElementById("game-over-best-score");
const livesText = document.getElementById("lives");
const ctx = canvas.getContext("2d");
let player = null;
let input = null;
let lastTime = 0;
let playerBullets = [];
let enemiesBullets = [];
let enemies = [];
let bonuses = [];
let floatingTexts = [];
let spawnTimer = 0;
let score = 0;
let difficultyLevel = 0;
let difficultyTimer = 0;
let spawnTime = 2;
let maxEnemies = 4;
let background = null;
let gameState = null;
let shakeTime = 0;
let shakePower = 6;
let hitStopTime = 0;
const playerPadding = 60;
const difficultyStepTime = 30;
const BONUS_DROP_CHANCE = 0.3;
const SCALE = 1;
const BASE_SIZE = {
    PLAYER: { width: 72, height: 86 },
    ENEMY: { width: 47, height: 55 },
    BIG_ENEMY: { width: 50, height: 59 },
    SHOOTING_ENEMY: { width: 47, height: 55 },
    BULLET: { width: 11, height: 11 },
    BONUS_LIFE: { width: 32, height: 28 },
    BONUS_RAPID_FIRE: { width: 16, height: 26 },
    BONUS_SLOW_FIRE: { width: 32, height: 23 },
}
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
    bonusSlowFire: new Image()
}
const bonusTypes = [
    (x, y, speed) => new BonusLife(x, y, BASE_SIZE.BONUS_LIFE.width * SCALE, BASE_SIZE.BONUS_LIFE.height * SCALE, speed, assets.bonusLife),
    (x, y, speed) => new BonusRapidFire(x, y, BASE_SIZE.BONUS_RAPID_FIRE.width * SCALE, BASE_SIZE.BONUS_RAPID_FIRE.height * SCALE, speed, assets.bonusRapidFire),
    (x, y, speed) => new BonusSlowFire(x, y, BASE_SIZE.BONUS_SLOW_FIRE.width * SCALE, BASE_SIZE.BONUS_SLOW_FIRE.height * SCALE, speed, assets.bonusSlowFire)
];
const enemiesChance = {
    shootingEnemy: 0.1,
    bigEnemy: 0.35
};
const GAME_STATE = {
    START: "start",
    PLAYING: "playing",
    PAUSED: "paused",
    GAME_OVER: "game_over"
};
const sounds = new SoundManager();

function load() {
    return new Promise((resolve) => {
        assets.enemy.src = "src/assets/enemy.png";
        assets.bigEnemy.src = "src/assets/big-enemy.png";
        assets.shootingEnemy.src = "src/assets/shooting-enemy.png";
        assets.bullet.src = "src/assets/bullet.png";
        assets.bonusLife.src = "src/assets/bonus-life.png";
        assets.bonusRapidFire.src = "src/assets/bonus-rapid-fire.png";
        assets.bonusSlowFire.src = "src/assets/bonus-slow-fire.png";
        assets.player.src = "src/assets/player.png";
        assets.player.onload = () => resolve();
    });
}

const spawnBullet = (x, y, width) => {
    const bulletSpeed = 240;
    const bulletWidth = BASE_SIZE.BULLET.width * SCALE;
    const bulletHeight = BASE_SIZE.BULLET.height * SCALE;
    const bulletX = (x + width / 2) - bulletWidth / 2;
    const bulletY = y - bulletHeight;
    playerBullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight,  bulletSpeed, assets.bullet));
    sounds.play("shoot");
};

const spawnEnemyBullet = (x, y, width, height, speed) => {
    const bulletSpeed = speed + 60;
    const bulletWidth = BASE_SIZE.BULLET.width  * SCALE;
    const bulletHeight = BASE_SIZE.BULLET.height * SCALE;
    const bulletX = (x + width / 2) - bulletWidth / 2;
    const bulletY = y + height;
    enemiesBullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight,  bulletSpeed, assets.bullet, true));
    sounds.play("shoot", 0.05);
}

function isColliding(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
}

function startGame() {
    showHeader();
    playerBullets = [];
    enemiesBullets = [];
    enemies = [];
    bonuses = [];
    spawnTimer = 0;
    score = 0;
    difficultyLevel = 0;
    difficultyTimer = 0;
    spawnTime = 2;
    maxEnemies = 4;
    const playerWidth = BASE_SIZE.PLAYER.width * SCALE;
    const playerHeight = BASE_SIZE.PLAYER.height * SCALE;
    const playerX = (canvas.width - playerWidth) / 2;
    const playerY = canvas.height - playerHeight - playerPadding;
    const playerSpeed = 240;
    player = new Player(playerX, playerY, playerWidth, playerHeight, playerSpeed, assets.player);
    player.onLifeAdded = () => { pulseLives(); };
    spawnEnemy();
    scoreText.textContent = score;
    livesText.querySelector("span").textContent = "x" + player.lives;
    gameState = GAME_STATE.PLAYING;
    showScreen("canvas");
    lastTime = performance.now();
}

function hitStop(duration = 0.03) {
    hitStopTime = Math.max(hitStopTime, duration);
}

function updateScore(score) {
    scoreText.textContent = score;
    scoreText.classList.remove("pulse");
    void scoreText.offsetWidth;
    scoreText.classList.add("pulse");
}

function pulseLives(type = "pulse") {
    livesText.classList.remove("pulse", "hit");
    void livesText.offsetWidth;
    livesText.classList.add(type);
}

function resume() {
    if (sounds.ctx.state === "suspended") sounds.ctx.resume();
    lastTime = performance.now();
    gameState = GAME_STATE.PLAYING;
    showScreen("canvas");
}

function pause() {
    if (gameState === GAME_STATE.PLAYING) {
        gameState = GAME_STATE.PAUSED;
        showScreen("pause-screen");
        if (sounds.ctx.state === "running") sounds.ctx.suspend();
    }
}

function gameOver() {
    if (shakeTime > 0) shakeTime = 0;
    gameState = GAME_STATE.GAME_OVER;
    let bestScore = Number(localStorage.getItem("sky-runner-best-score")) || 0;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("sky-runner-best-score", bestScore);
    }
    showScreen("game-over-screen");
    gameOverScore.textContent = "Score: " + score;
    gameBestScore.textContent = "Best: " + bestScore;
}

function addEnemy(width, height, hp, scoreValue, image, reloadSpeed = 0) {
    const [enemyWidth, enemyHeight] = [width, height];
    const padding = enemyWidth / 2;
    const minX = padding;
    const maxX = canvas.width - enemyWidth - padding;
    const [enemyX, enemyY] = [Math.random() * (maxX - minX) + minX, -enemyHeight];
    const enemySpeed = Math.random() * (180 - 60) + 60;
    enemies.push(new Enemy(enemyX, enemyY, enemyWidth, enemyHeight, enemySpeed, hp, scoreValue, image, reloadSpeed));
}

function spawnEnemy() {
    if (enemies.length >= maxEnemies) return;
    const chance = Math.random();
    if (chance < enemiesChance.shootingEnemy) {
        addEnemy(BASE_SIZE.SHOOTING_ENEMY.width * SCALE, BASE_SIZE.SHOOTING_ENEMY.height * SCALE, 1, 3, assets.shootingEnemy, 1);
    } else if (chance < enemiesChance.shootingEnemy + enemiesChance.bigEnemy) {
        addEnemy(BASE_SIZE.BIG_ENEMY.width * SCALE, BASE_SIZE.BIG_ENEMY.height * SCALE, 2, 5, assets.bigEnemy);
    } else {
        addEnemy(BASE_SIZE.ENEMY.width * SCALE, BASE_SIZE.ENEMY.height * SCALE, 1, 1, assets.enemy);
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

async function init() {
    gameState = GAME_STATE.START;
    // background = new Background(canvas.width, canvas.height);
    input = new InputHandler(canvas);
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function shakeScreen(time, power) {
    [shakeTime, shakePower] = [time, power];
}

function update(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (hitStopTime > 0) {
        hitStopTime -= dt;
        return;
    }

    difficultyTimer += dt;
    if (difficultyTimer >= (difficultyLevel + 1) * difficultyStepTime) {
        difficultyLevel++;
        spawnTime -= 0.1;
        if (spawnTime < 0.8) spawnTime = 0.8;
        maxEnemies += 1
        if (maxEnemies > 6) maxEnemies = 6;
        enemiesChance.bigEnemy += 0.05;
        enemiesChance.shootingEnemy += 0.05;
        if (enemiesChance.bigEnemy >= 0.45) enemiesChance.bigEnemy = 0.45;
        if (enemiesChance.shootingEnemy >= 0.3) enemiesChance.shootingEnemy = 0.3;
    }

    background.update(dt);
    player.update(dt, input, gameField, spawnBullet);
    enemies.forEach(e => e.update(dt, gameField, spawnEnemyBullet));
    playerBullets.forEach(b => b.update(dt, gameField));
    enemiesBullets.forEach(b => b.update(dt, gameField));
    bonuses.forEach(b => b.update(dt, gameField));
    floatingTexts.forEach(t => t.update(dt));

    enemies.forEach((e) => {
        playerBullets.forEach((b) => {
            if (isColliding(e.bounds, b.bounds) && e.active && b.active) {
                b.deactivate();
                if (e.takeDamage()) {
                    hitStop(0.01);
                    score += e.scoreValue;
                    updateScore(score);
                    spawnBonus(e);
                    const floatingText = new FloatingText(`+${e.scoreValue}`, e.bounds.x + e.bounds.width / 2, e.bounds.y);
                    floatingTexts.push(floatingText);
                    sounds.play("explosion");
                }
            }
        });
        if (isColliding(player.bounds, e.bounds) && e.active) { 
            e.die();
            player.takeDamage();
            hitStop(0.05);
            shakeScreen(0.15, 6);
            pulseLives("hit");
            sounds.play("playerDamage");
        }
    });
    enemiesBullets.forEach((b) => {
        if (isColliding(player.bounds, b.bounds) && b.active) {
            b.deactivate();
            pulseLives("hit");
            player.takeDamage();
            hitStop(0.05);
            shakeScreen(0.15, 4);
            sounds.play("playerDamage");
        }
    });
    if (!player.active) gameOver();
    bonuses.forEach((b) => {
        if (isColliding(player.bounds, b.bounds) && b.active) { 
            b.apply(player);
            sounds.play("pickupBonus");
        }
    });
    livesText.querySelector("span").textContent = "x" + player.lives;
    enemies = enemies.filter(e => e.active);
    playerBullets = playerBullets.filter(b => b.active);
    enemiesBullets = enemiesBullets.filter(b => b.active);
    bonuses = bonuses.filter(b => b.active);
    floatingTexts = floatingTexts.filter(t => t.active);
    if (spawnTimer > 0) spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnEnemy();
        spawnTimer = spawnTime;
    }
    if (shakeTime > 0) shakeTime -= dt;
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    background.draw(ctx);
    if (player) player.draw(ctx);
    enemies.forEach(e => e.draw(ctx));
    floatingTexts.forEach(t => t.draw(ctx));
    playerBullets.forEach(b => b.draw(ctx));
    enemiesBullets.forEach(b => b.draw(ctx));
    bonuses.forEach(b => b.draw(ctx));
}

function draw() {
    if (shakeTime > 0) {
        const dx = (Math.random() - 0.5) * shakePower;
        const dy = (Math.random() - 0.5) * shakePower;
        ctx.save();
        ctx.translate(dx, dy);
        drawScene();
        ctx.restore();
    } else {
        drawScene();
    }
}

function gameLoop(currentTime) {
    if (gameState === GAME_STATE.START) {
        if (input.consume("start")) startGame();
    }
    if (gameState === GAME_STATE.PAUSED) {
        if (input.consume("pause")) resume();
    }
    if (gameState === GAME_STATE.GAME_OVER) {
        if (input.consume("restart")) startGame();
    }
    if (gameState === GAME_STATE.PLAYING) {
        if (input.consume("pause")) pause();
        update(currentTime);
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const container = document.getElementById("game-field");
    const containerRect = container.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    if (gameField) {
        gameField.width = containerRect.width;
        gameField.height = containerRect.height;
    }
    if (background) background.resize(canvas.width, canvas.height);
    if (player) {
        const playerY = canvas.height - player.bounds.height - playerPadding;
        player.resizeY(playerY);
    }
}

async function loadResources() {
    const splashImg = document.querySelector(".splash-img");
    const startImg = document.querySelector(".start-img");
    splashImg.src = PLAYER_PLANE_BASE64;
    startImg.src = PLAYER_PLANE_BASE64;
    resizeCanvas();
    background = new Background(canvas.width, canvas.height);
    background.update(ctx);
    background.draw(ctx);
    const loadingProgress = document.getElementById("loading-progress");
    const loadingText = document.getElementById("loading-text");
    try {
        await Promise.all([
            load(), sounds.loadAll({
                shoot: "src/assets/sounds/shoot.wav",
                explosion: "src/assets/sounds/explosion.wav",
                pickupBonus: "src/assets/sounds/pickup-bonus.wav",
                playerDamage: "src/assets/sounds/player-damage.wav",
            })
        ]);

        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
        }

        loadingProgress.style.width = "100%";
        setTimeout(() => {
            resizeCanvas();
            showScreen("start-screen");
            init();
        }, 300);
    } catch (e) {
        loadingText.textContent = "Loading error!";
        console.error(e);
    }

}

function showHeader() {
    document.querySelector(".header").style.display = "flex";
}

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("visible"));
    if (screenId === "canvas") return;
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add("visible");
}

window.addEventListener('resize', resizeCanvas);

gameFieldContainer.addEventListener('click', (e) => {
    const target = e.target;
    if (target.closest(".js-start-btn")) startGame();
    if (target.closest(".js-restart-btn")) startGame();
    if (target.closest(".js-resume-btn")) resume();
    if (target.closest(".js-pause-btn")) pause();
    if (target.closest(".js-menu-btn")) showScreen("start-screen");
});

function unlockAudio() {
    sounds.ctx.resume();
    gameFieldContainer.removeEventListener('click', unlockAudio);
}

gameFieldContainer.addEventListener('click', unlockAudio);
gameFieldContainer.addEventListener('touchstart', unlockAudio);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
});

loadResources();

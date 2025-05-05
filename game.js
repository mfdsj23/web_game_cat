const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const menuElement = document.getElementById("menu");
const startButton = document.getElementById("startButton");

// Estados do jogo
let gameRunning = false;

// Tamanho fixo do jogo
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

// Configuração do canvas
function setupCanvas() {
    const container = document.getElementById("gameContainer");
    const scale = Math.min(
        container.clientWidth / GAME_WIDTH,
        container.clientHeight / GAME_HEIGHT
    );
    
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    canvas.style.transform = `scale(${scale})`;
}
setupCanvas();
window.addEventListener("resize", setupCanvas);

// Textura de tijolos
function createBrickPattern() {
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 60;
    patternCanvas.height = 30;
    const pCtx = patternCanvas.getContext("2d");
    
    pCtx.fillStyle = "#b22222";
    pCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
    pCtx.strokeStyle = "#8b0000";
    pCtx.lineWidth = 2;
    
    for (let y = 0; y < patternCanvas.height; y += 15) {
        pCtx.beginPath();
        pCtx.moveTo(0, y);
        pCtx.lineTo(patternCanvas.width, y);
        pCtx.stroke();
    }
    
    for (let x = 0; x < patternCanvas.width; x += 30) {
        pCtx.beginPath();
        pCtx.moveTo(x, 0);
        pCtx.lineTo(x, patternCanvas.height);
        pCtx.stroke();
    }
    
    return ctx.createPattern(patternCanvas, "repeat");
}
const brickPattern = createBrickPattern();

// Elementos do jogo
const cat = {
    x: GAME_WIDTH / 2 - 40,
    y: GAME_HEIGHT - 100,
    width: 80,
    height: 60,
    speed: 8,
    moveLeft: false,
    moveRight: false
};

let fishes = [];
let score = 0;

// Funções de desenho
function drawBackground() {
    ctx.fillStyle = brickPattern;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT * 0.7);
    skyGradient.addColorStop(0, "#87CEEB");
    skyGradient.addColorStop(1, "rgba(135, 206, 235, 0)");
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.7);
}

function drawCat() {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;
    
    ctx.fillStyle = "#FFA500";
    ctx.beginPath();
    ctx.ellipse(
        cat.x + cat.width / 2,
        cat.y + cat.height / 2,
        cat.width / 2,
        cat.height / 2,
        0, 0, Math.PI * 2
    );
    ctx.fill();
    
    ctx.fillStyle = "#006400";
    ctx.beginPath();
    ctx.arc(cat.x + cat.width * 0.3, cat.y + cat.height * 0.3, 6, 0, Math.PI * 2);
    ctx.arc(cat.x + cat.width * 0.7, cat.y + cat.height * 0.3, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "pink";
    ctx.beginPath();
    ctx.moveTo(cat.x + cat.width / 2, cat.y + cat.height * 0.4);
    ctx.lineTo(cat.x + cat.width * 0.4, cat.y + cat.height * 0.5);
    ctx.lineTo(cat.x + cat.width * 0.6, cat.y + cat.height * 0.5);
    ctx.fill();
    
    ctx.restore();
}

function drawFish(x, y) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x - 35, y - 12);
    ctx.lineTo(x - 35, y + 12);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x + 15, y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Controles
function setupControls() {
    document.addEventListener("keydown", (e) => {
        if (!gameRunning) return;
        if (e.key === "ArrowLeft") cat.moveLeft = true;
        if (e.key === "ArrowRight") cat.moveRight = true;
    });

    document.addEventListener("keyup", (e) => {
        if (e.key === "ArrowLeft") cat.moveLeft = false;
        if (e.key === "ArrowRight") cat.moveRight = false;
    });

    document.getElementById("leftBtn").addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (gameRunning) cat.moveLeft = true;
    });
    document.getElementById("leftBtn").addEventListener("touchend", () => cat.moveLeft = false);

    document.getElementById("rightBtn").addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (gameRunning) cat.moveRight = true;
    });
    document.getElementById("rightBtn").addEventListener("touchend", () => cat.moveRight = false);
}
setupControls();

// Lógica do jogo
function updateCat() {
    if (cat.moveLeft && cat.x > 0) cat.x -= cat.speed;
    if (cat.moveRight && cat.x < GAME_WIDTH - cat.width) cat.x += cat.speed;
}

function spawnFish() {
    if (gameRunning && Math.random() < 0.02) {
        fishes.push({
            x: Math.random() * (GAME_WIDTH - 40),
            y: -30,
            speed: 2 + Math.random() * 3
        });
    }
}

function updateFishes() {
    for (let i = fishes.length - 1; i >= 0; i--) {
        fishes[i].y += fishes[i].speed;
        
        const catCenter = { x: cat.x + cat.width / 2, y: cat.y + cat.height / 2 };
        const fishCenter = { x: fishes[i].x, y: fishes[i].y };
        const distance = Math.sqrt(
            Math.pow(fishCenter.x - catCenter.x, 2) + 
            Math.pow(fishCenter.y - catCenter.y, 2)
        );
        
        if (distance < 30) {
            fishes.splice(i, 1);
            score++;
            scoreElement.textContent = `🐟: ${score}`;
        } else if (fishes[i].y > GAME_HEIGHT + 20) {
            fishes.splice(i, 1);
        }
    }
}

// Loop do jogo
function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawBackground();
    
    updateCat();
    spawnFish();
    updateFishes();
    
    fishes.forEach(fish => drawFish(fish.x, fish.y));
    drawCat();
    
    requestAnimationFrame(gameLoop);
}

// Iniciar jogo
function startGame() {
    gameRunning = true;
    menuElement.style.display = "none";
    score = 0;
    fishes = [];
    scoreElement.textContent = "🐟: 0";
    cat.x = GAME_WIDTH / 2 - 40;
    gameLoop();
}

startButton.addEventListener("click", startGame);

// Toque para mobile
startButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startGame();
});

// Desativa menu se o jogo já estiver rodando
if (gameRunning) {
    menuElement.style.display = "none";
}
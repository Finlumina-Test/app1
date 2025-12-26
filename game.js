// Shoot & Merge Game - Enhanced Version with Polish
// Complete playable 2048 ball shooter with sound, particles, and effects

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Demo mode detection from URL
const urlParams = new URLSearchParams(window.location.search);
const demoMode = urlParams.get('demo'); // 'gameplay' or 'gameover'

// Game constants
const GRAVITY = 0.3;
const BALL_RADIUS = 20;
const SHOOT_FORCE = 12;
const GAME_OVER_LINE = 120;
const FLOOR_Y = canvas.height - 50;

// Color scheme for numbers
const COLORS = {
    2: '#EDE0C8',
    4: '#EDF0C8',
    8: '#F2B179',
    16: '#F59563',
    32: '#F67C5F',
    64: '#F65E3B',
    128: '#EDCF72',
    256: '#EDCC61',
    512: '#EDC850',
    1024: '#EEC744',
    2048: '#EEC22E'
};

// Sound System (Web Audio API)
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.musicGain = null;
        this.sfxGain = null;
        this.enabled = true;
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.connect(this.audioContext.destination);
            this.sfxGain.gain.value = 0.3;

            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.audioContext.destination);
            this.musicGain.gain.value = 0.15;
        } catch (e) {
            console.log('Web Audio API not supported');
            this.enabled = false;
        }
    }

    playShoot() {
        if (!this.enabled || !this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);

        oscillator.frequency.value = 400;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playMerge(value) {
        if (!this.enabled || !this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);

        oscillator.frequency.value = 200 + (Math.log2(value) * 50);
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playGameOver() {
        if (!this.enabled || !this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);

        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
}

const soundSystem = new SoundSystem();

// Screen shake effect
let screenShake = { x: 0, y: 0, intensity: 0 };

function shakeScreen(intensity) {
    screenShake.intensity = intensity;
}

function updateScreenShake() {
    if (screenShake.intensity > 0) {
        screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
        screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
        screenShake.intensity *= 0.9;

        if (screenShake.intensity < 0.1) {
            screenShake.intensity = 0;
            screenShake.x = 0;
            screenShake.y = 0;
        }
    }
}

// Game state
let balls = [];
let currentBall = null;
let score = 0;
let highScore = localStorage.getItem('shootMergeHighScore') || 0;
let isGameOver = false;
let isDragging = false;
let aimStart = { x: 0, y: 0 };
let aimEnd = { x: 0, y: 0 };
let showTutorial = !localStorage.getItem('tutorialShown');
let gameStarted = false;

// Ball class
class Ball {
    constructor(x, y, value, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.vx = vx;
        this.vy = vy;
        this.radius = BALL_RADIUS;
        this.isShot = vx !== 0 || vy !== 0;
        this.canMerge = false;
        this.toDelete = false;
        this.scale = 0.8;
        this.targetScale = 1;

        if (this.isShot) {
            setTimeout(() => { this.canMerge = true; }, 100);
        } else {
            this.canMerge = true;
        }
    }

    update() {
        // Smooth scale animation
        this.scale += (this.targetScale - this.scale) * 0.1;

        if (!this.isShot) return;

        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.7;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -0.7;
        }

        // Floor collision
        if (this.y + this.radius > FLOOR_Y) {
            this.y = FLOOR_Y - this.radius;
            this.vy *= -0.6;
            this.vx *= 0.95;

            if (Math.abs(this.vy) < 0.5 && Math.abs(this.vx) < 0.5) {
                this.vy = 0;
                this.vx = 0;
            }
        }

        // Check collisions with other balls
        balls.forEach(other => {
            if (other === this || other.toDelete || this.toDelete) return;

            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.radius + other.radius;

            if (distance < minDist) {
                if (this.canMerge && other.canMerge && this.value === other.value && this.isShot) {
                    this.merge(other);
                } else {
                    const angle = Math.atan2(dy, dx);
                    const targetX = this.x + Math.cos(angle) * minDist;
                    const targetY = this.y + Math.sin(angle) * minDist;

                    const ax = (targetX - other.x) * 0.05;
                    const ay = (targetY - other.y) * 0.05;

                    this.vx -= ax;
                    this.vy -= ay;
                    other.vx += ax;
                    other.vy += ay;

                    const overlap = minDist - distance;
                    const separateX = (dx / distance) * overlap * 0.5;
                    const separateY = (dy / distance) * overlap * 0.5;

                    this.x -= separateX;
                    this.y -= separateY;
                    other.x += separateX;
                    other.y += separateY;
                }
            }
        });
    }

    merge(other) {
        if (other.toDelete) return;

        this.toDelete = true;
        other.toDelete = true;

        const newValue = this.value * 2;
        const mergeX = (this.x + other.x) / 2;
        const mergeY = (this.y + other.y) / 2;
        const newBall = new Ball(mergeX, mergeY, newValue);
        newBall.isShot = true;
        newBall.vy = -2;
        newBall.scale = 1.3;
        balls.push(newBall);

        score += newValue;
        updateScore();

        // Effects
        createMergeEffect(mergeX, mergeY, newValue);
        shakeScreen(5);
        soundSystem.playMerge(newValue);
    }

    draw() {
        const drawRadius = this.radius * this.scale;

        // Shadow
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 2, this.y + 2, drawRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Glow for high values
        if (this.value >= 128) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            const gradient = ctx.createRadialGradient(this.x, this.y, drawRadius * 0.5, this.x, this.y, drawRadius * 1.5);
            gradient.addColorStop(0, COLORS[this.value]);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, drawRadius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Ball
        ctx.fillStyle = COLORS[this.value] || '#CDC1B4';
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#bbada0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Number
        ctx.fillStyle = this.value > 4 ? '#f9f6f2' : '#776e65';
        ctx.font = 'bold ' + (this.value > 999 ? '14px' : '18px') + ' Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.value, this.x, this.y);
    }
}

// Enhanced Particle System
let particles = [];

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.life = 1;
        this.decay = 0.015;
        this.size = Math.random() * 4 + 2;
        this.color = color || 'gold';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.life -= this.decay;
        this.size *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;

        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createMergeEffect(x, y, value) {
    const color = COLORS[value] || 'gold';
    for (let i = 0; i < 25; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Initialize game
function init() {
    soundSystem.init();
    updateScore();

    // Check for demo modes
    if (demoMode === 'gameplay') {
        setupGameplayDemo();
    } else if (demoMode === 'gameover') {
        setupGameOverDemo();
    } else {
        spawnNextBall();
        if (!showTutorial) {
            gameStarted = true;
        }
    }

    gameLoop();
}

// Demo mode: Pre-populate with colorful balls almost at top
function setupGameplayDemo() {
    gameStarted = true;
    showTutorial = false;
    score = 2847; // Impressive score

    // Create balls with various values stacked nicely
    const ballPositions = [
        { x: 150, y: 580, value: 64 },
        { x: 300, y: 580, value: 128 },
        { x: 225, y: 540, value: 32 },
        { x: 150, y: 500, value: 16 },
        { x: 300, y: 500, value: 64 },
        { x: 100, y: 460, value: 256 },
        { x: 350, y: 460, value: 128 },
        { x: 225, y: 420, value: 512 },
        { x: 150, y: 380, value: 64 },
        { x: 300, y: 380, value: 32 },
        { x: 100, y: 340, value: 128 },
        { x: 350, y: 340, value: 16 },
        { x: 225, y: 300, value: 256 },
        { x: 150, y: 260, value: 8 },
        { x: 300, y: 260, value: 64 },
        { x: 225, y: 220, value: 32 },
        { x: 150, y: 180, value: 128 },
        { x: 300, y: 180, value: 16 },
        { x: 225, y: 140, value: 4 }, // Close to danger line!
    ];

    ballPositions.forEach(pos => {
        const ball = new Ball(pos.x, pos.y, pos.value);
        ball.hasBeenShot = true;
        ball.canMerge = true;
        balls.push(ball);
    });

    // Spawn next ball ready to shoot
    spawnNextBall();
    updateScore();
}

// Demo mode: Show game over screen
function setupGameOverDemo() {
    gameStarted = true;
    showTutorial = false;
    score = 3542; // High score for screenshot
    highScore = 4128; // Previous high score

    // Create some balls
    const ballPositions = [
        { x: 225, y: 100, value: 256 }, // Above danger line
        { x: 150, y: 150, value: 128 },
        { x: 300, y: 200, value: 64 },
    ];

    ballPositions.forEach(pos => {
        const ball = new Ball(pos.x, pos.y, pos.value);
        ball.hasBeenShot = true;
        ball.canMerge = true;
        balls.push(ball);
    });

    updateScore();

    // Trigger game over after a short delay
    setTimeout(() => {
        triggerGameOver();
    }, 500);
}

function spawnNextBall() {
    if (isGameOver) return;

    const possibleValues = [2, 2, 2, 4, 4, 8];
    const value = possibleValues[Math.floor(Math.random() * possibleValues.length)];
    currentBall = new Ball(canvas.width / 2, canvas.height - 30, value);
}

// Input handling
canvas.addEventListener('mousedown', startAim);
canvas.addEventListener('mousemove', updateAim);
canvas.addEventListener('mouseup', shoot);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    canvas.dispatchEvent(new MouseEvent('mouseup'));
});

function startAim(e) {
    if (isGameOver || !currentBall) return;

    if (showTutorial) {
        showTutorial = false;
        gameStarted = true;
        localStorage.setItem('tutorialShown', 'true');
    }

    const rect = canvas.getBoundingClientRect();
    aimStart.x = e.clientX - rect.left;
    aimStart.y = e.clientY - rect.top;
    isDragging = true;
}

function updateAim(e) {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    aimEnd.x = e.clientX - rect.left;
    aimEnd.y = e.clientY - rect.top;
}

function shoot() {
    if (!isDragging || !currentBall) return;

    isDragging = false;

    const dx = aimEnd.x - aimStart.x;
    const dy = aimEnd.y - aimStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) return;

    const angle = Math.atan2(dy, dx);
    const vx = -Math.cos(angle) * SHOOT_FORCE;
    const vy = -Math.sin(angle) * SHOOT_FORCE;

    if (vy > -2) return;

    currentBall.vx = vx;
    currentBall.vy = vy;
    currentBall.isShot = true;
    setTimeout(() => { currentBall.canMerge = true; }, 100);

    balls.push(currentBall);
    currentBall = null;

    soundSystem.playShoot();

    setTimeout(spawnNextBall, 500);
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('shootMergeHighScore', highScore);
    }
}

function checkGameOver() {
    for (let ball of balls) {
        if (ball.y - ball.radius < GAME_OVER_LINE) {
            if (Math.abs(ball.vx) < 1 && Math.abs(ball.vy) < 1) {
                triggerGameOver();
                return;
            }
        }
    }
}

function triggerGameOver() {
    if (isGameOver) return;

    isGameOver = true;
    soundSystem.playGameOver();
    shakeScreen(15);

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalBest').textContent = highScore;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    balls = [];
    particles = [];
    score = 0;
    isGameOver = false;
    isDragging = false;
    currentBall = null;
    gameStarted = true;

    document.getElementById('gameOver').style.display = 'none';
    updateScore();
    spawnNextBall();
}

// Draw everything
function draw() {
    ctx.save();
    ctx.translate(screenShake.x, screenShake.y);

    // Clear canvas
    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game over line
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, GAME_OVER_LINE);
    ctx.lineTo(canvas.width, GAME_OVER_LINE);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw floor
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);

    // Draw particles (behind balls)
    particles.forEach(p => p.draw());

    // Draw balls
    balls.forEach(ball => ball.draw());

    // Draw current ball
    if (currentBall) {
        currentBall.draw();
    }

    // Draw aim line
    if (isDragging && currentBall && gameStarted) {
        const dx = aimEnd.x - aimStart.x;
        const dy = aimEnd.y - aimStart.y;

        ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(currentBall.x, currentBall.y);

        let px = currentBall.x;
        let py = currentBall.y;
        let pvx = -Math.cos(Math.atan2(dy, dx)) * SHOOT_FORCE;
        let pvy = -Math.sin(Math.atan2(dy, dx)) * SHOOT_FORCE;

        for (let i = 0; i < 30; i++) {
            pvy += GRAVITY;
            px += pvx;
            py += pvy;

            ctx.lineTo(px, py);

            if (py > FLOOR_Y || px < 0 || px > canvas.width) break;
        }

        ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.restore();

    // Draw tutorial overlay
    if (showTutorial) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('How to Play', canvas.width / 2, 150);

        ctx.font = '18px Arial';
        ctx.fillText('1. Drag to aim', canvas.width / 2, 200);
        ctx.fillText('2. Release to shoot', canvas.width / 2, 240);
        ctx.fillText('3. Match numbers to merge', canvas.width / 2, 280);
        ctx.fillText('4. Don\'t let balls reach the red line!', canvas.width / 2, 320);

        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Click anywhere to start!', canvas.width / 2, 400);

        // Animated arrow
        const arrowY = 500 + Math.sin(Date.now() / 200) * 10;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, arrowY);
        ctx.lineTo(canvas.width / 2 - 15, arrowY - 20);
        ctx.lineTo(canvas.width / 2 + 15, arrowY - 20);
        ctx.fill();
    }
}

function update() {
    if (isGameOver || !gameStarted) return;

    balls.forEach(ball => ball.update());
    balls = balls.filter(ball => !ball.toDelete);

    particles.forEach(p => p.update());
    particles = particles.filter(p => p.life > 0);

    updateScreenShake();

    if (balls.length > 3) {
        checkGameOver();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
init();

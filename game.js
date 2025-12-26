// Shoot & Merge Game - HTML5 Canvas Version
// Complete playable 2048 ball shooter game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.3;
const BALL_RADIUS = 20;
const SHOOT_FORCE = 12;
const GAME_OVER_LINE = 120;
const FLOOR_Y = canvas.height - 50;

// Color scheme for numbers (matching Unity version)
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

// Game state
let balls = [];
let currentBall = null;
let score = 0;
let highScore = localStorage.getItem('shootMergeHighScore') || 0;
let isGameOver = false;
let isDragging = false;
let aimStart = { x: 0, y: 0 };
let aimEnd = { x: 0, y: 0 };

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

        // Enable merge after short delay
        if (this.isShot) {
            setTimeout(() => { this.canMerge = true; }, 100);
        } else {
            this.canMerge = true;
        }
    }

    update() {
        if (!this.isShot) return;

        // Apply gravity
        this.vy += GRAVITY;

        // Update position
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

            // Stop if moving very slowly
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
                // Check for merge
                if (this.canMerge && other.canMerge && this.value === other.value && this.isShot) {
                    this.merge(other);
                } else {
                    // Collision response
                    const angle = Math.atan2(dy, dx);
                    const targetX = this.x + Math.cos(angle) * minDist;
                    const targetY = this.y + Math.sin(angle) * minDist;

                    const ax = (targetX - other.x) * 0.05;
                    const ay = (targetY - other.y) * 0.05;

                    this.vx -= ax;
                    this.vy -= ay;
                    other.vx += ax;
                    other.vy += ay;

                    // Separate balls
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

        // Mark for deletion
        this.toDelete = true;
        other.toDelete = true;

        // Create new ball with doubled value
        const newValue = this.value * 2;
        const mergeX = (this.x + other.x) / 2;
        const mergeY = (this.y + other.y) / 2;
        const newBall = new Ball(mergeX, mergeY, newValue);
        newBall.isShot = true;
        newBall.vy = -2; // Small upward bounce
        balls.push(newBall);

        // Update score
        score += newValue;
        updateScore();

        // Visual feedback
        createMergeEffect(mergeX, mergeY, newValue);
    }

    draw() {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(this.x + 2, this.y + 2, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ball
        ctx.fillStyle = COLORS[this.value] || '#CDC1B4';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
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

// Particle effects
let particles = [];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 215, 0, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createMergeEffect(x, y, value) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y));
    }
}

// Initialize game
function init() {
    updateScore();
    spawnNextBall();
    gameLoop();
}

// Spawn new ball for shooting
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

    if (distance < 10) return; // Minimum drag distance

    // Calculate shoot direction (opposite of drag)
    const angle = Math.atan2(dy, dx);
    const vx = -Math.cos(angle) * SHOOT_FORCE;
    const vy = -Math.sin(angle) * SHOOT_FORCE;

    // Make sure we shoot upward
    if (vy > -2) return;

    currentBall.vx = vx;
    currentBall.vy = vy;
    currentBall.isShot = true;
    setTimeout(() => { currentBall.canMerge = true; }, 100);

    balls.push(currentBall);
    currentBall = null;

    // Spawn next ball after delay
    setTimeout(spawnNextBall, 500);
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('shootMergeHighScore', highScore);
    }
}

// Check game over
function checkGameOver() {
    for (let ball of balls) {
        if (ball.y - ball.radius < GAME_OVER_LINE) {
            // Check if ball is relatively still
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

    document.getElementById('gameOver').style.display = 'none';
    updateScore();
    spawnNextBall();
}

// Draw everything
function draw() {
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

    // Draw balls
    balls.forEach(ball => ball.draw());

    // Draw current ball
    if (currentBall) {
        currentBall.draw();
    }

    // Draw aim line
    if (isDragging && currentBall) {
        const dx = aimEnd.x - aimStart.x;
        const dy = aimEnd.y - aimStart.y;

        // Draw trajectory
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(currentBall.x, currentBall.y);

        // Draw predicted path
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

    // Draw particles
    particles.forEach(p => p.draw());
}

// Update game state
function update() {
    if (isGameOver) return;

    // Update balls
    balls.forEach(ball => ball.update());

    // Remove merged balls
    balls = balls.filter(ball => !ball.toDelete);

    // Update particles
    particles.forEach(p => p.update());
    particles = particles.filter(p => p.life > 0);

    // Check game over
    if (balls.length > 3) {
        checkGameOver();
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
init();

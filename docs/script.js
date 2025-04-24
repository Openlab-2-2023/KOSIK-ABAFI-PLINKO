const canvas = document.getElementById("defaultcanvas");
const ctx = canvas.getContext("2d");

const scaleFactor = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

// Peg settings
let pegRadius = 8;
const spacingX = 60;
const spacingY = 60;
let rows = 11;
let cols = 11;
const offset = spacingX / 2;
const yOffset = 100;
const xOffset = 120;
let gravity = 0.25;

const multipliers = [100, 50, 8, 2, 0.6, 0.6, 0.6, 2, 8, 50, 100];

// Ball array
let balls = [];

// Balance system
let balance = 1000;
const balanceDisplay = document.getElementById("balance");
const drop = document.getElementById("drop");
const betInput = document.getElementById("betInput");

// Update balance text
function updateBalanceDisplay() {
    balanceDisplay.textContent = "Balance: " + balance;
}
updateBalanceDisplay();

// Create new ball
function createBall() {
    return {
        x: getRandomXPosition(),
        y: yOffset - 150,
        speed: 6,
        direction: 1,
        radius: 15,
        angle: Math.PI / 4,
        dx: 0,
        dy: 0,
        firstCollision: true,
        color: getRandomColor()
    };
}

// Get random ball color
function getRandomColor() {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Apply speed to ball
function ballSpeed(ball) {
    ball.dx = ball.speed * Math.cos(ball.angle);
    ball.dy = ball.speed * Math.sin(ball.angle);
}

// Get random column X position
function getRandomXPosition() {
    const randomCol = Math.floor(Math.random() * cols);
    let x = (randomCol % 2 === 0)
        ? randomCol * spacingX + xOffset
        : randomCol * spacingX + offset + xOffset;
    return x;
}

// Draw pegs
function drawPegs() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = (row % 2 === 0)
                ? col * spacingX + xOffset
                : col * spacingX + offset + xOffset;
            let y = row * spacingY + yOffset;

            if (x > pegRadius && x < canvas.width - pegRadius) {
                drawPeg(x, y);
            }
        }
    }

    const multiplierWidth = 50;
    const multiplierHeight = 30;
    const verticalSpacing = -10;

    for (let col = 0; col < cols; col++) {
        const x = col * spacingX + xOffset + spacingX / 2;
        const y = (rows * spacingY) + yOffset + verticalSpacing;
        drawMultiplier(x, y, multipliers[col], multiplierWidth, multiplierHeight, 15);
    }
}

// Draw single peg
function drawPeg(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

// Draw ball
function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// Drop ball movement
function dropBall(ball) {
    ball.dy += gravity;
    ball.y += ball.dy;
    ball.x += ball.dx;
}

// Walls
function drawWall1() {
    ctx.beginPath();
    ctx.rect(20, 20, 75, 760);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
}
function drawWall2() {
    ctx.beginPath();
    ctx.rect(775, 20, 75, 760);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
}

// Multiplier display
function drawMultiplier(x, y, value, width, height, gap = 10) {
    const text = `×${value}`;
    const cornerRadius = 5;
    const rectX = x - width / 2;
    const rectY = y - height / 2 + gap;

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.roundRect(rectX, rectY, width, height, cornerRadius);
    ctx.fill();

    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (value >= 50) ctx.fillStyle = "#d32f2f";
    else if (value >= 5) ctx.fillStyle = "#1976d2";
    else ctx.fillStyle = "#388e3c";

    ctx.fillText(text, x, y + gap);
}

// Check collisions with pegs and walls
function checkCollisions() {
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        if (ball.y > canvas.height + ball.radius) {
            balls.splice(i, 1);
            i--;
            continue;
        }

        const wall1 = 20 + 75;
        const wall2 = 780;

        if (ball.x - ball.radius <= wall1) {
            ball.x = wall1 + ball.radius;
            ball.dx *= -1;
        }

        if (ball.x + ball.radius >= wall2) {
            ball.x = wall2 - ball.radius;
            ball.dx *= -1;
        }

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let x = (row % 2 === 0)
                    ? col * spacingX + xOffset
                    : col * spacingX + offset + xOffset;
                let y = row * spacingY + yOffset;

                const dist = Math.sqrt((ball.x - x) ** 2 + (ball.y - y) ** 2);
                if (dist <= ball.radius + pegRadius) {
                    handleCollision(ball, x, y);
                }
            }
        }
    }
}

// Handle collision with peg
function handleCollision(ball, pegX, pegY) {
    const dx = ball.x - pegX;
    const dy = ball.y - pegY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / distance;
    const ny = dy / distance;

    ball.dx = Math.abs(ball.dx) * alternateX(ball);
    const dotProduct = ball.dx * nx + ball.dy * ny;
    ball.dx -= 2 * dotProduct * nx;
    ball.dy -= 2 * dotProduct * ny;

    const overlap = ball.radius + pegRadius - distance;
    ball.x += nx * overlap;
    ball.y += ny * overlap;

    ball.dx += (Math.random() - 0.5) * 0.5;
    ball.dx *= 0.5;
    ball.dy *= 0.5;
}

// Bounce direction
function alternateX(ball) {
    if (ball.firstCollision) {
        ball.firstCollision = false;
        const direction = Math.random() < 0.5 ? -1 : 1;
        ball.x += direction * 2;
        return direction;
    }
    const direction = Math.random() < 0.5 ? -1 : 1;
    ball.x += direction;
    return direction;
}

// Animate everything
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPegs();
    drawWall1();
    drawWall2();

    for (const ball of balls) {
        dropBall(ball);
        drawBall(ball);
    }

    checkCollisions();
    requestAnimationFrame(animate);
}

// Handle drop button click
drop.addEventListener("click", () => {
    const betValue = parseFloat(betInput.value);

    if (isNaN(betValue) || betValue <= 0 || balance < betValue) return;

    balance -= betValue;
    updateBalanceDisplay();

    const newBall = createBall();
    ballSpeed(newBall);
    balls.push(newBall);
});


// Init
updateBalanceDisplay();
animate();

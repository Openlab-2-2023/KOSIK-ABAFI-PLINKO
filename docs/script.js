const canvas = document.getElementById("defaultcanvas");
const ctx = canvas.getContext("2d");
const scaleFactor = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

// hodnoty pre kolíky
let pegRadius = 5;
const spacingX = 40;
const spacingY = 40;
let rows = 14;
let cols = 16;
const offset = spacingX / 2;
const yOffset = 100;
let xOffset = 120;
let gravity = 0.25;
let layoutMode = "grid";

// nastavitelne pole multiplierov
const multipliers = [
    50, 16, 8, 2, 0.5, 0.2, 0.2, 0.5, 2, 8, 16, 50
];
const multiplierRects = [];
let pegs = [];
// pole pre gulicky
let balls = [];
// Balance system
let balance = 1000;
const balanceDisplay = document.getElementById("balance");
const drop = document.getElementById("drop");
const betInput = document.getElementById("betInput");

// updatovanie balance
function updateBalanceDisplay() {
    balanceDisplay.textContent = "Balance: " + balance;
}

// vytvorenie gulicky, hodnoty gulicky
function createBall() {
    return {
        //x: getRandomXPosition(),
        x: 345,
        y: yOffset - 150,
        speed: 3,
        direction: 1,
        radius: 10,
        angle: Math.PI / 4,
        dx: 0,
        dy: 0,
        firstCollision: true,
        color: getRandomColor()
    };
}

// nahodne farby pre kazdu gulicku
function getRandomColor() {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// rychlost gulicky
function ballSpeed(ball) {
    ball.dx = ball.speed * Math.cos(ball.angle);
    ball.dy = ball.speed * Math.sin(ball.angle);
}

// random X pozicia vramci kolikov
function getRandomXPosition() {
    const randomCol = Math.floor(Math.random() * cols);
    let x;
    if (randomCol % 2 === 0) {
        x = randomCol * spacingX + xOffset;
    } else {
        x = randomCol * spacingX + offset + xOffset;
    }
    return x;
}

// nakreslenie kolikov v canvas
function drawPegs() {
    pegs = []; // vymaze pole s predoslimi pegami
    if (layoutMode === "grid") {
        rows = 14
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let x;
                if (row % 2 === 0) {
                    x = col * spacingX + xOffset;
                } else {
                    x = col * spacingX + offset + xOffset;
                }
                let y = row * spacingY + yOffset;
                if (x > pegRadius && x < canvas.width - pegRadius) {
                    drawPeg(x, y);
                    pegs.push({ x, y });
                }
            }
        }
    } else if (layoutMode === "triangle") {
        rows = 15;
        for (let row = 0; row < rows; row++) {
            const numPegs = row + 1;
            const rowWidth = (numPegs - 1) * spacingX;
            const y = row * spacingY + yOffset;
            for (let i = 0; i < numPegs; i++) {
                const x = canvas.width / 2.45 - rowWidth / 2 + i * spacingX;
                drawPeg(x, y);
                pegs.push({ x, y });
            }
        }
    }
    drawMultipliers();
}

function drawMultipliers() {
    // hodnoty multiplieroch
    const multiplierWidth = 50;
    const multiplierHeight = 30;
    const verticalSpacing = -10;
    const multiplierSpacing = 50; // miesto medzi multipliermi
    multiplierRects.length = 0;
    for (let col = 0; col < multipliers.length; col++) {
        const multiplierWidth = 55;
        const multiplierHeight = 30;
        const verticalSpacing = -10;
        const multiplierSpacing = 55;
        const x = col * multiplierSpacing + xOffset -7 + multiplierSpacing / 2;
        const y = (rows * spacingY) + yOffset + verticalSpacing;
        // kreslenie jedneho multiplieru
        drawMultiplier(x, y, multipliers[col], multiplierWidth, multiplierHeight, 15);
        multiplierRects.push({
            x: x - multiplierWidth / 2,
            y: y - multiplierHeight / 2 + 15,
            width: multiplierWidth,
            height: multiplierHeight
        });
    }
}

// checkovanie kolízií na multiplieroch
function handleMultiplierCollision(ball, index) {
    for (const rect of multiplierRects) {
        const withinX = ball.x + ball.radius > rect.x && 
                       ball.x - ball.radius < rect.x + rect.width;
        const withinY = ball.y + ball.radius > rect.y && 
                       ball.y - ball.radius < rect.y + rect.height;
        
        if (withinX && withinY) {
            // Vypočítaj výhru na základe pozície násobiča
            const multiplierIndex = multiplierRects.indexOf(rect);
            const multiplier = multipliers[multiplierIndex];
            
            // Vypočítaj výhru (použije sa stávka z betInput)
            const betValue = parseFloat(betInput.value);
            const winnings = betValue * multiplier;
            
            // Pridaj výhru k zostатку
            balance += winnings;
            
            // Aktualizuj zobrazenie zostatku
            updateBalanceDisplay();
            
            // Odstráň gulu po dopade
            balls.splice(index, 1);
            return true;
        }
    }
    return false;
}

// kreslenie gulicky
function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// kolíky
function drawPeg(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

// kreslenie stien
function drawWall1() {
    ctx.beginPath();
    ctx.rect(40, 15, 75, 680);
    ctx.fillStyle = "rgba(0, 0, 0, 0)"
    //ctx.fillStyle  = "#000000"
    ctx.fill();
}

function drawWall2() {
    ctx.beginPath();
    ctx.rect(745, 15, 75, 680);
    ctx.fillStyle = "rgba(0, 0, 0, 0)"
    //ctx.fillStyle  = "#000000"
    ctx.fill();
}

// kreslenie multiplieroch
function drawMultiplier(x, y, value, width, height, gap = 10) {
    const text = `×${value}`;
    const cornerRadius = 6;
    const rectX = x - width / 2;
    const rectY = y - height / 2 + gap;
    
    // Nastav farbu podľa hodnoty násobiča
    let color;
    if (value >= 100) color = "#ff7f08";    // oranžová pre 100
    else if (value >= 28) color = "#ffad08"; // tmavšia oranžová pre 28
    else if (value >= 8) color = "#ffc508";  // žltá pre 8
    else if (value >= 2) color = "#388e3c";  // zelená pre 2
    else color = "#ffffff";                   // biela pre 0.6
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(rectX, rectY, width, height, cornerRadius);
    ctx.fill();
    
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    ctx.fillText(text, x, y + gap);
}

//  padanie gulicky
function dropBall(ball) {
    ball.dy += gravity;
    ball.y += ball.dy;
    ball.x += ball.dx;
}

const toggleLayoutBtn = document.getElementById("toggleLayout");
toggleLayoutBtn.addEventListener("click", () => {
    layoutMode = layoutMode === "grid" ? "triangle" : "grid";
});

// kolízie pre gulicky
function checkCollisions() {
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        if (handleMultiplierCollision(ball, i)) {
            i--;
            continue;
        }
        // vymazanie guli ak prejdu canvas
        if (ball.y > canvas.height + ball.radius) {
            balls.splice(i, 1);
            i--;
            continue;
        }
        //kolizie medzi stenami
        const wall1 = 40 + 75;
        const wall2 = 745;
        if (ball.x - ball.radius <= wall1) {
            ball.x = wall1 + ball.radius;
            ball.dx *= -1;
        }
        if (ball.x + ball.radius >= wall2) {
            ball.x = wall2 - ball.radius;
            ball.dx *= -1;
        }
        for (const peg of pegs) {
            const dist = Math.sqrt(Math.pow(ball.x - peg.x, 2) + Math.pow(ball.y - peg.y, 2));
            if (dist <= ball.radius + pegRadius) {
                handleCollision(ball, peg.x, peg.y);
            }
        }
    }
}

// kolizie medzi gulickami a pegami
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

//striedanie osi, prvy odraz = vacsi odraz, druhy = normalny
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

// plynule animacia vsetkeho
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

// zacinanie s prvou gulou
//balls.push(createBall());
//ballSpeed(balls[0]);
updateBalanceDisplay();
animate();
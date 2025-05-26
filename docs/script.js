const canvas = document.getElementById("defaultcanvas");
const ctx = canvas.getContext("2d");
const scaleFactor = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

// hodnoty pre mapu
let pegRadius = 5;
const spacingX = 40;
const spacingY = 40;
let rows = 14;
let cols = 16;
const offset = spacingX / 2;
let yOffset = 100;
let xOffset = 120;
let gravity = 0.15;
let layoutMode = "grid";
let wallstype = "normal";
let wallstype2 = "normal";
let currentBet = 0;
let activeBalls = 0;

// nastavitelne pole multiplierov
let currentRisk = "medium";
let multipliers = [0];
function startMultipliers() {
    if (layoutMode === "grid") {
        multipliers = [18, 6, 2, 1.2, 0.8, 0.3, 0.3, 0.8, 1.2, 2, 6, 18];

    }
    if (layoutMode === "triangle") {
        multipliers = [18, 6, 2, 1.2, 0.75, 0.25, 0.75, 1.2, 2, 6, 18];

    }
}
startMultipliers();
const multiplierRects = [];
let pegs = [];
let balls = [];

function formatNumber(num) {
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + 'T';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(2) + 'k';
    return num.toFixed(2);
}

// Balance system
let balanceDisplay = document.getElementById("balance");
const bet50 = document.getElementById("bet50");
const bet100 = document.getElementById("bet100");
const bet1k = document.getElementById("bet1k");
const bet12 = document.getElementById("bet12");
const betAIN = document.getElementById("betAIN");

document.addEventListener('keydown', function (event) {
    if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        console.log(`${event.code} is blocked`);
    }
});

// sleduje zemny balance na update balancu 
function updateBalanceDisplay(newBalance) {
    balanceDisplay.textContent = "Balance: " + formatNumber(newBalance);
}


document.getElementById('bet12').addEventListener('click', () => {
    const halfBalance = BalanceManager.getBalance() / 2;
    setBet(Math.floor(halfBalance));
});

document.getElementById('betAIN').addEventListener('click', () => {
    const allIn = BalanceManager.getBalance();
    setBet(allIn);
});

// sleduje zmeny balancu
BalanceManager.subscribe(updateBalanceDisplay);

// update UI na loadu
updateBalanceDisplay(BalanceManager.getBalance());


// vytvorenie gulicky, hodnoty gulicky

function createBall() {
    return {
        x: getRandomXPosition(),
        y: yOffset - 150,
        //x: 350,
        speed: 1.5,
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
//random X pozicia vramci stredu

function getRandomXPosition() {
    const minX = 300;
    const maxX = 400;
    return Math.random() * (maxX - minX) + minX;
}


// nakreslenie kolikov v canvas
function drawPegs() {
    pegs = [];

    if (layoutMode === "grid") {
        yOffset = 100;
        xOffset = 120;
        rows = 14;
        wallstype = "normal";
        wallstype2 = "normal";
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
        yOffset = 60;
        xOffset = 145;
        rows = 15;
        wallstype = "angled";
        wallstype2 = "angled";
        for (let row = 0; row < rows; row++) {
            if (row < 2) continue; // skipne dva prve riadky
            const numPegs = row + 1;
            const rowWidth = (numPegs - 1) * spacingX;
            const y = row * spacingY + yOffset;

            for (let i = 0; i < numPegs; i++) {
                const canvasCenterX = canvas.width / scaleFactor / 1.95;
                const x = canvasCenterX - rowWidth / 1.95 + i * spacingX;
                drawPeg(x, y);
                pegs.push({ x, y });
            }
        }
    }


    drawMultipliers();
}
// hodnoty multiplieroch
function drawMultipliers() {
    multiplierRects.length = 0;
    for (let col = 0; col < multipliers.length; col++) {
        const multiplierWidth = 55;
        const multiplierHeight = 30;
        const verticalSpacing = -10;
        const multiplierSpacing = 55;
        const x = col * multiplierSpacing + xOffset - 7 + multiplierSpacing / 2;
        const y = (rows * spacingY) + yOffset + verticalSpacing;
        drawMultiplier(x, y, multipliers[col], multiplierWidth, multiplierHeight, 15);
        multiplierRects.push({
            x: x - multiplierWidth / 2,
            y: y - multiplierHeight / 2 + 15,
            width: multiplierWidth,
            height: multiplierHeight
        });
    }
}

//checkovanie kolízií na multiplieroch
function checkMultiplierCollision(ball, index) {
    for (const rect of multiplierRects) {
        const withinX = ball.x + ball.radius > rect.x &&
            ball.x - ball.radius < rect.x + rect.width;
        const withinY = ball.y + ball.radius > rect.y &&
            ball.y - ball.radius < rect.y + rect.height;
        if (withinX && withinY) {
            const multiplierIndex = multiplierRects.indexOf(rect);
            const baseMultiplier = multipliers[multiplierIndex];
            const ballMultiplier = parseFloat(localStorage.getItem("ballMultiplier")) || 1;
            const winnings = currentBet * baseMultiplier * ballMultiplier;
            
            BalanceManager.add(winnings);

        
            const winMessage = document.getElementById("winMessage");
            winMessage.textContent = `You won ${winnings.toFixed(2)} coins!`;
            winMessage.style.display = "block";
            setTimeout(() => {
                winMessage.style.display = "none";
            }, 2000);

            balls.splice(index, 1);
            activeBalls--;
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

function drawWall1() {
    ctx.save();

    if (layoutMode === "triangle") {
        //ctx.strokeStyle = "black";
        ctx.strokeStyle = "rgba(0, 0, 0, 0)"
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(370, 160);
        ctx.lineTo(190, 525);
        ctx.stroke();
    } else if (wallstype === "normal") {
        ctx.beginPath();
        ctx.rect(40, 15, 75, 680);
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fill();
    } else if (wallstype === "angled") {
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        const centerX = 220 + 75 / 2;
        const centerY = 15 + 680 / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 7);
        ctx.fillRect(-75 / 2, -430 / 2, 75, 430);
    }

    ctx.restore();
}

function drawWall2() {
    ctx.save();

    if (layoutMode === "triangle") {
        //ctx.strokeStyle = "black";
        ctx.strokeStyle = "rgba(0, 0, 0, 0)"
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(520, 160);
        ctx.lineTo(690, 525);
        ctx.stroke();
    } else if (wallstype2 === "normal") {
        ctx.beginPath();
        ctx.rect(745, 15, 75, 685);
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fill();
    } else if (wallstype2 === "angled") {
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        const centerX = 585 + 75 / 2;
        const centerY = 15 + 680 / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 7);
        ctx.fillRect(-75 / 2, -420 / 2, 75, 430);
    }

    ctx.restore();
}

// kreslenie multiplieroch
function drawMultiplier(x, y, value, width, height, gap = 10) {
    const text = `×${value}`;
    const cornerRadius = 6;
    const rectX = x - width / 2;
    const rectY = y - height / 2 + gap;
    let color;
    if (value >= 12) color = "#ff7f08";
    else if (value >= 6) color = "#ffad08";
    else if (value >= 2) color = "#ffc508";
    else if (value >= 1.2) color = "#fff3a3";
    else if (value >= 0.75) color = "#fffbe0";
    else color = "#ffffff";
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

function drawBottomLine() {
    const lineY = (rows * spacingY) + yOffset + 40;
    ctx.beginPath();
    ctx.moveTo(xOffset, lineY);
    ctx.lineTo(canvas.width - xOffset, lineY);
    ctx.strokeStyle = "rgba(0, 0, 0, 0)"
    ctx.lineWidth = 2;
    ctx.stroke();
}

function lowRisk() {
    if (activeBalls > 0) {
        console.warn("Can't change risk while balls are active.");
        return;
    }
    console.log("Low");
    if (layoutMode === "grid") {
        multiType = "grid";
        multipliers = [6, 3, 1.5, 1.2, 0.9, 0.5, 0.5, 0.9, 1.2, 1.5, 3, 6];
    }
    if (layoutMode === "triangle") {
        multiType = "triangle";
        multipliers = [6, 3, 1.5, 1.2, 0.8, 0.4, 0.8, 1.2, 1.5, 3, 6];
    }
    currentRisk = "low";
    drawPegs();
}

function mediumRisk() {
    if (activeBalls > 0) {
        console.warn("Can't change risk while balls are active.");
        return;
    }
    console.log("medium");
    if (layoutMode === "grid") {
        multipliers = [12, 5, 3, 1.1, 0.6, 0.3, 0.3, 0.6, 1.1, 3, 5, 12];
    }
    if (layoutMode === "triangle") {
        multipliers = [12, 5, 3, 1.1, 0.55, 0.25, 0.55, 1.1, 3, 5, 12];
    }
    currentRisk = "medium";
    drawPegs();
}

function highRisk() {
    if (activeBalls > 0) {
        console.warn("Can't change risk while balls are active.");
        return;
    }
    console.log("high");
    if (layoutMode === "grid") {
        multipliers = [27, 8, 1.2, 0.9, 0.4, 0.15, 0.15, 0.4, 0.9, 1.2, 8, 27];
    }
    if (layoutMode === "triangle") {
        multipliers = [27, 8, 1.2, 0.9, 0.35, 0.1, 0.35, 0.9, 1.2, 8, 27];
    }
    currentRisk = "high";
    drawPegs();
}

function switchLayout(newLayout) {
    layoutMode = newLayout;
    // Reapply multipliers for the current risk level on the new layout:
    if (currentRisk === "low") lowRisk();
    else if (currentRisk === "medium") mediumRisk();
    else if (currentRisk === "high") highRisk();
}

document.getElementById("low").addEventListener("click", () => {

    currentRisk = 'low';
    lowRisk();
});
document.getElementById("medium").addEventListener("click", () => {

    currentRisk = 'medium';
    mediumRisk();
});
document.getElementById("high").addEventListener("click", () => {

    currentRisk = 'high';
    highRisk();
});

//  padanie gulicky 
function dropBall(ball) {
    ball.dy += gravity;
    ball.y += ball.dy;
    ball.x += ball.dx;
}

//prepinanie medzi trojuholnikovou mapou a gridovou
const toggleLayoutBtn = document.getElementById("toggleLayout");
toggleLayoutBtn.addEventListener("click", () => {
    if (activeBalls > 0) {
        alert('Nemôžete zmeniť layout počas pohybu guľôčky!');
        return;
    }

    layoutMode = layoutMode === "grid" ? "triangle" : "grid";

    switch (currentRisk) {
        case 'low': lowRisk(); break;
        case 'medium': mediumRisk(); break;
        case 'high': highRisk(); break;
    }
});

drop.addEventListener("click", () => {
    const betValue = parseFloat(betInput.value);

    // Kontroluje hodnotu betu
    if (isNaN(betValue) || betValue < 0.01) {
        alert("Minimálna stávka je 0.01!");
        return;
    }

    const balance = BalanceManager.getBalance();

    // Ak je balance pod 0.01 tak sa setne na 0
    if (balance < 0.01) {
        BalanceManager.setBalance(0);
        updateBalanceDisplay(0);
        alert("Nemáš dostatok balance na to aby si stávkoval.");
        return;
    }

    // Check if bet exceeds balance
    if (betValue > balance) {
        alert("Nemáš dostatok balance na to aby si stávkoval.");
        return;
    }

    // All checks passed, place the bet
    currentBet = betValue;
    BalanceManager.subtract(currentBet);

    const newBall = createBall();
    ballSpeed(newBall);
    balls.push(newBall);
    activeBalls++;
});

if (BalanceManager.getBalance() < 0.01) {
    BalanceManager.setBalance(0);
    updateBalanceDisplay(0);
}

function reflectAgainstLine(ball, x1, y1, x2, y2) {
    const lx = x2 - x1;
    const ly = y2 - y1;
    const length = Math.sqrt(lx * lx + ly * ly);
    const nx = -ly / length;
    const ny = lx / length;
    const dot = ball.dx * nx + ball.dy * ny;
    ball.dx -= 2 * dot * nx;
    ball.dy -= 2 * dot * ny;


    const dampingFactor = 0.5;
    ball.dx *= dampingFactor;
    ball.dy *= dampingFactor;
}
// kolízie pre gulicky

function checkCollisions() {
    let leftWallLine = null;
    let rightWallLine = null;

    if (layoutMode === "triangle") {
        leftWallLine = { x1: 370, y1: 160, x2: 190, y2: 525 };
        rightWallLine = { x1: 520, y1: 130, x2: 690, y2: 525 };
    }

    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        if (checkMultiplierCollision(ball, i)) {
            i--;
            continue;
        }

        const trampolineY = (rows * spacingY) + yOffset + 20;
        if (ball.y + ball.radius >= trampolineY && ball.dy > 0) {
            ball.y = trampolineY - ball.radius;
            ball.dy *= -1;
            ball.dx *= 0.95;
        }

        if (ball.y > canvas.height + ball.radius) {
            balls.splice(i, 1);
            i--;
            continue;
        }

        if (layoutMode === "triangle") {
            handleTriangleWallCollisions(ball, leftWallLine, rightWallLine);
        } else {
            handleGridWallCollisions(ball);
        }

        handlePegCollisions(ball);
    }
}

function handleTriangleWallCollisions(ball, leftWall, rightWall) {
    if (leftWall && !isBallBehindLeftWall(ball, leftWall)) {
        const dx = leftWall.x2 - leftWall.x1;
        const dy = leftWall.y2 - leftWall.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const nx = dy / length;
        const ny = -dx / length;

        const dist = (ball.x - leftWall.x1) * nx +
            (ball.y - leftWall.y1) * ny;

        if (dist < ball.radius) {
            reflectAgainstLine(ball, leftWall.x1, leftWall.y1,
                leftWall.x2, leftWall.y2);

            const overlap = ball.radius - dist;
            ball.x += nx * (overlap + 1);
            ball.y += ny * (overlap + 1);

            const randomAngle = Math.random() * Math.PI / 4 - Math.PI / 8;
            const randomForce = 0.5;
            ball.dx += Math.cos(randomAngle) * randomForce;
            ball.dy += Math.sin(randomAngle) * randomForce;
        }
    }

    if (rightWall && !isBallBehindRightWall(ball, rightWall)) {
        const dx = rightWall.x2 - rightWall.x1;
        const dy = rightWall.y2 - rightWall.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const nx = dy / length;
        const ny = -dx / length;

        const dist = (ball.x - rightWall.x1) * nx +
            (ball.y - rightWall.y1) * ny;

        if (dist > -ball.radius) {
            reflectAgainstLine(ball, rightWall.x1, rightWall.y1,
                rightWall.x2, rightWall.y2);

            const overlap = ball.radius + dist;
            ball.x += nx * (overlap + 1);
            ball.y += ny * (overlap + 1);

            const randomAngle = Math.random() * Math.PI / 4 - Math.PI / 8;
            const randomForce = 0.5;
            ball.dx += Math.cos(randomAngle) * randomForce;
            ball.dy += Math.sin(randomAngle) * randomForce;
        }
    }
}

function handleGridWallCollisions(ball) {
    const wall1 = 40 + 75;
    const wall2 = 745;

    if (ball.x - ball.radius <= wall1) {
        ball.x = wall1 + ball.radius;
        ball.dx *= -0.8;

        const randomOffset = (Math.random() - 0.5) * 2;
        ball.y += randomOffset;

        ball.dx += 1;
    }

    if (ball.x + ball.radius >= wall2) {
        ball.x = wall2 - ball.radius;
        ball.dx *= -0.8;

        const randomOffset = (Math.random() - 0.5) * 2;
        ball.y += randomOffset;

        ball.dx -= 1;
    }
}

function handlePegCollisions(ball) {
    for (const peg of pegs) {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= ball.radius + pegRadius) {
            const nx = dx / distance;
            const ny = dy / distance;

            const dotProduct = ball.dx * nx + ball.dy * ny;
            ball.dx -= 2 * dotProduct * nx;
            ball.dy -= 2 * dotProduct * ny;

            ball.dx *= 0.35;
            ball.dy *= 0.35;

            const overlap = ball.radius + pegRadius - distance;
            ball.x += nx * (overlap + 1);
            ball.y += ny * (overlap + 1);

            const randomAngle = Math.random() * Math.PI * 2;
            const randomForce = 0.3;
            ball.dx += Math.cos(randomAngle) * randomForce;
            ball.dy += Math.sin(randomAngle) * randomForce;

            const centerX = canvas.width / 2;
            const biasStrength = 0.75;
            const bias = (centerX - ball.x) * biasStrength / canvas.width;
            ball.dx += bias;
        }
    }
}

function isBallBehindLeftWall(ball, leftWall) {
    const dx = leftWall.x2 - leftWall.x1;
    const dy = leftWall.y2 - leftWall.y1;
    const normalX = -dy;
    const normalY = dx;

    return (ball.x - leftWall.x1) * normalX +
        (ball.y - leftWall.y1) * normalY > 0;
}

function isBallBehindRightWall(ball, rightWall) {
    const dx = rightWall.x2 - rightWall.x1;
    const dy = rightWall.y2 - rightWall.y1;
    const normalX = -dy;
    const normalY = dx;

    return (ball.x - rightWall.x1) * normalX +
        (ball.y - rightWall.y1) * normalY < 0;
}




// kolizie medzi gulickami a pegami
function handleCollision(ball, pegX, pegY) {
    const dx = ball.x - pegX;
    const dy = ball.y - pegY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / distance;
    const ny = dy / distance;
    const dotProduct = ball.dx * nx + ball.dy * ny;
    ball.dx -= 2 * dotProduct * nx;
    ball.dy -= 2 * dotProduct * ny;
    ball.dx *= 0.5;
    ball.dy *= 0.5;
    const overlap = ball.radius + pegRadius - distance;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    const centerX = canvas.width / 2;
    const biasStrength = 0.75;
    const bias = (centerX - ball.x) * biasStrength / canvas.width;
    ball.dx += bias;
    ball.dx += (Math.random() - 0.5) * 0.2;
}
document.addEventListener('keydown', function(event) {
   
    if (event.ctrlKey && event.code === 'KeyO') {
        event.preventDefault(); 

      
        BalanceManager.add(1000000);

     
        updateBalanceDisplay(BalanceManager.getBalance());

        console.log("Added 1M to balance via Ctrl + O");
    }
});
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.code === 'KeyL') {
        event.preventDefault();

        BalanceManager.setBalance(0);

        updateBalanceDisplay(BalanceManager.getBalance());

        console.log("Balance reset to 0 via Ctrl + L");
    }
});

// plynule animacia vsetkeho
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPegs();
    drawWall1();
    drawWall2();

    drawBottomLine();
    for (const ball of balls) {
        dropBall(ball);
        drawBall(ball);
    }
    checkCollisions();
    requestAnimationFrame(animate);
}

// bet možnosti, a prevencia menenia betov počas padania guličky
function setBet(amount) {
    if (activeBalls > 0) {
        alert('Nemôžete zmeniť stávku počas pohybu guľôčky!');
        betInput.value = currentBet;
        return;
    }

    betInput.value = amount;
    updateBet();
}


function validateBetChange() {
    if (activeBalls > 0) {
        alert('Nemôžete zmeniť stávku počas pohybu guľôčky!');
        betInput.value = currentBet;
    }
}
betInput.addEventListener('input', validateBetChange);

// zacinanie s prvou gulou
//balls.push(createBall());
//ballSpeed(balls[0]);
animate();
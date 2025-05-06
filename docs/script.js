const canvas = document.getElementById("defaultcanvas");
const ctx = canvas.getContext("2d");
;;
const scaleFactor = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

//hodnoty pre mapu
let pegRadius = 5;
const spacingX = 40;
const spacingY = 40;
let rows = 14;
let cols = 16;
const offset = spacingX / 2;
let yOffset = 100;
let xOffset = 120;
let gravity = 0.25;
let layoutMode = "grid";
let wallstype = "normal";
let wallstype2 = "normal";

// nastavitelne pole multiplierov
const multipliers = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

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
updateBalanceDisplay();



// vytvorenie gulicky, hodnoty gulicky
function createBall() {
    return {
        x: getRandomXPosition(),
        //x: 350,
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

//random X pozicia vramci kolikov
function getRandomXPosition() {
    const minX = 300;
    const maxX = 400;
    return Math.random() * (maxX - minX) + minX;
}


// nakreslenie kolikov v canvas
function drawPegs() {
    pegs = []; // vymaze pole s predoslimi pegami 

    if (layoutMode === "grid") {
        yOffset = 100;
        rows = 14
        wallstype = "normal"
        wallstype2 = "normal"
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
        rows = 15;
        wallstype = "angled"
        wallstype2 = "angled"
        for (let row = 0; row < rows; row++) {
            const numPegs = row + 1;
            const rowWidth = (numPegs - 1) * spacingX;
            const y = row * spacingY + yOffset;
        
            for (let i = 0; i < numPegs; i++) {
                if (row === 0 && i === 0) continue; 
        
                const x = canvas.width / 2.45 - rowWidth / 2 + i * spacingX;
                drawPeg(x, y);
                pegs.push({ x, y });
            }
        }
    }

    drawMultipliers();
}
function drawMultipliers() {
    //hodnoty multiplieroch
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

        const x = col * multiplierSpacing + xOffset - 7 + multiplierSpacing / 2;
        const y = (rows * spacingY) + yOffset + verticalSpacing;

        //kreslenie jedneho multiplieru
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
        const withinX = ball.x + ball.radius > rect.x && ball.x - ball.radius < rect.x + rect.width;
        const withinY = ball.y + ball.radius > rect.y && ball.y - ball.radius < rect.y + rect.height;

        if (withinX && withinY) {
            balls.splice(index, 1); // odstrani gulicku po dopade
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

    if (wallstype === "normal") {
        ctx.beginPath();
        ctx.rect(40, 15, 75, 680);
        ctx.fillStyle = "rgba(0, 0, 0, 0)"
        //ctx.fillStyle = "#000000";
        ctx.fill();
    } else if (wallstype === "angled") {
        ctx.fillStyle = "rgba(0, 0, 0, 0)"
        const centerX = 220 + 75 / 2;
        const centerY = 15 + 680 / 2;

        ctx.translate(centerX, centerY);

        ctx.rotate(Math.PI / 7);


        ctx.fillRect(-75 / 2, -430 / 2, 75, 430);
    }

    ctx.restore();
}

function drawWall2() {
    if (wallstype2 === "normal") {
        ctx.beginPath();
        ctx.rect(745, 15, 75, 680);
        ctx.fillStyle = "rgba(0, 0, 0, 0)"
        //ctx.fillStyle = "#000000"
        ctx.fill();
    } else if (wallstype2 === "angled") {

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0)"

        const centerX = 585 + 75 / 2;
        const centerY = 15 + 680 / 2;
        ctx.translate(centerX, centerY);


        ctx.rotate(-Math.PI / 7);


        ctx.fillRect(-75 / 2, -430 / 2, 75, 430);


        ctx.restore();
    }
}






// kreslenie multiplieroch
function drawMultiplier(x, y, value, width, height, gap = 10) {
    const text = `×${value}`;
    const cornerRadius = 6;


    const rectX = x - width / 2;
    const rectY = y - height / 2 + gap;


    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.roundRect(
        rectX,
        rectY,
        width,
        height,
        cornerRadius
    );
    ctx.fill();


    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // rozne farby podla hodnoty
    if (value >= 5) ctx.fillStyle = "#ff7f08";
    else if (value >= 2) ctx.fillStyle = "#ffad08";
    else if (value <= 1) ctx.fillStyle = "#ffc508";
    else ctx.fillStyle = "#388e3c";

    ctx.fillText(text, x, y + gap);
}

//  padanie gulicky 
function dropBall(ball) {
    ball.dy += gravity;
    ball.y += ball.dy;
    ball.x += ball.dx;
}

//prepinanie medzi trojuholnikovou mapou a gridovou
const toggleLayoutBtn = document.getElementById("toggleLayout");
toggleLayoutBtn.addEventListener("click", () => {
    layoutMode = layoutMode === "grid" ? "triangle" : "grid";

    if (layoutMode === "triangle") {
        leftWallLine = { x1: 230, y1: 100, x2: 300, y2: 640 };  // adjust as needed
        rightWallLine = { x1: 610, y1: 100, x2: 540, y2: 640 }; // adjust as needed
    } else {
        leftWallLine = null;
        rightWallLine = null;
    }
});

function reflectAgainstLine(ball, x1, y1, x2, y2) {
    // Line vector
    const lx = x2 - x1;
    const ly = y2 - y1;
    const length = Math.sqrt(lx * lx + ly * ly);
    const nx = -ly / length;
    const ny = lx / length;

    const dot = ball.dx * nx + ball.dy * ny;
    ball.dx -= 2 * dot * nx;
    ball.dy -= 2 * dot * ny;
}

// kolízie pre gulicky
function checkCollisions() {
    let leftWallX = 115;
    let rightWallX = 745;
    let leftWallLine = null;
    let rightWallLine = null;
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        if (checkMultiplierCollision(ball, i)) {
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
        if (layoutMode === "triangle") {
    if (leftWallLine && ball.y >= leftWallLine.y1 && ball.y <= leftWallLine.y2 && ball.x < (leftWallLine.x1 + 10)) {
        reflectAgainstLine(ball, leftWallLine.x1, leftWallLine.y1, leftWallLine.x2, leftWallLine.y2);
        ball.x += 2; // small nudge to avoid getting stuck
    }
    if (rightWallLine && ball.y >= rightWallLine.y1 && ball.y <= rightWallLine.y2 && ball.x > (rightWallLine.x1 - 10)) {
        reflectAgainstLine(ball, rightWallLine.x1, rightWallLine.y1, rightWallLine.x2, rightWallLine.y2);
        ball.x -= 2;
    }
} else {
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

  
    const dotProduct = ball.dx * nx + ball.dy * ny;
    ball.dx -= 2 * dotProduct * nx;
    ball.dy -= 2 * dotProduct * ny;


    ball.dx *= 0.5;
    ball.dy *= 0.5;


    const overlap = ball.radius + pegRadius - distance;
    ball.x += nx * overlap;
    ball.y += ny * overlap;

    // sila posunu k stredu
    const centerX = canvas.width / 2;
    const biasStrength = 0.5; // sila posunu k stredu (0 =nic, 1 = vela)
    const bias = (centerX - ball.x) * biasStrength / canvas.width;

    ball.dx += bias;

   
    ball.dx += (Math.random() - 0.5) * 0.2;
}


// plynule animacia vsetkeho
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawWall1();
    drawWall2();
    drawPegs();

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
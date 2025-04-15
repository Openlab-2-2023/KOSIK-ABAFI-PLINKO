const canvas = document.getElementById("defaultcanvas");
const ctx = canvas.getContext("2d");

const scaleFactor = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

//hodnoty pre kolíky
let pegRadius = 8;
const spacingX = 60;
const spacingY = 60;
let rows = 11;
let cols = 11;
const offset = spacingX / 2;
const yOffset = 100;
const xOffset = 120;
let gravity = 0.25;
const drop = document.getElementById("drop");

// pole pre gulicky 
let balls = [];

// vytvorenie gulicky, hodnoty gulicky
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
            }
        }
    }
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
    ctx.beginPath();
    ctx.rect(20, 20, 75, 760);
    ctx.fillStyle  = "#1a1a1a"
    ctx.fill();
    
}
function drawWall2() {
    ctx.beginPath();
    ctx.rect(780, 20, 75, 760);
    ctx.fillStyle  = "#1a1a1a"
    ctx.fill();
    
}

//  padanie gulicky 
function dropBall(ball) {
    ball.dy += gravity;
    ball.y += ball.dy;
    ball.x += ball.dx;
}

// kolízie pre gulicky
function checkCollisions() {
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        
        // vymazanie guli ak prejdu canvas
        if (ball.y > canvas.height + ball.radius) {
            balls.splice(i, 1);
            i--;
            continue;
        }

        //kolizie medzi stenami
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
                let x;
                if (row % 2 === 0) {
                    x = col * spacingX + xOffset;
                } else {
                    x = col * spacingX + offset + xOffset;
                }

                let y = row * spacingY + yOffset;

                const dist = Math.sqrt(Math.pow(ball.x - x, 2) + Math.pow(ball.y - y, 2));
                if (dist <= ball.radius + pegRadius) {
                    handleCollision(ball, x, y);
                }
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

// drop button
drop.addEventListener("click", function() {
    const newBall = createBall();
    ballSpeed(newBall);
    balls.push(newBall);
});

// zacinanie s prvou gulou
balls.push(createBall());
ballSpeed(balls[0]);


animate();
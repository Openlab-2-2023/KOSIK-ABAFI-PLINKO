
const canvas = document.getElementById("defaultcanvas");
const ctx = canvas.getContext("2d");

const scaleFactor = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

//hodnoty pre kolíky
let pegRadius = 8; //velkosť
const spacingX = 60;  //vzdialenosť medzi X
const spacingY = 60;  // vzialenosť medzi po Y
let rows = 10; // počet riadkov
let cols = 11; //počet stĺpcov
const offset = spacingX / 2; //posunutie každého druhého riadku
const yOffset = 130; // posunutie po X
const xOffset = 100; //posunutie po Y
let gravity = 0.25;


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
//hodnoty gulicky
let ball = { x: getRandomXPosition(), y: yOffset - 150, speed: 6, radius: 15, angle: Math.PI / 4, dx: 0, dy: 0 }


//rychlost gulicky
function ballSpeed() {
    ball.dy = ball.speed * Math.sin(ball.angle);
}

// nakreslenie kolikov v canvas
function drawPegs() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x;

            // kazdy párny riadok + menšie posunutie + posunutie po X
            if (row % 2 === 0) {
                x = col * spacingX + xOffset;
            } else {
                x = col * spacingX + offset + xOffset;
            }

            let y = row * spacingY + yOffset;

            // zaistenie že sa kolíky netresia mimo canvas
            if (x > pegRadius && x < canvas.width - pegRadius) {
                drawPeg(x, y);
            }
        }
    }
}

//kreslenie gulicky
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = "red";
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



// padanie gulicky
function dropBall() {
    ball.dy += gravity;
    ball.y += ball.dy;



}

function checkCollision() {
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
                handleCollision(x, y);
                ball.x += alternateX();
            }
        }
    }
}

function handleCollision(pegX, pegY) {


    const dx = ball.x - pegX;
    const dy = ball.y - pegY;


    const distance = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / distance;
    const ny = dy / distance;


    const dotProduct = ball.dx * nx + ball.dy * ny;
    ball.dx -= 2 * dotProduct * nx;
    ball.dy -= 2 * dotProduct * ny;


    const overlap = ball.radius + pegRadius - distance;
    ball.x += nx * overlap;
    ball.y += ny * overlap;

    ball.dx *= 0.8;
    ball.dy *= 0.8;
}
function alternateX() {

    let rnd = Math.random();
    return rnd < 0.5 ? 1 : -1;
    

}



// plynule animacia vsetkeho
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPegs();
    drawBall();
    dropBall();
    checkCollision();
    requestAnimationFrame(animate)
}



ballSpeed();
animate();





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
let ball = {x: getRandomXPosition(),y: yOffset - 150, speed: 6, radius:15, angle: Math.PI / 4, dx: 0, dy: 0}


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

            let y = row * spacingY + yOffset ;

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
    ball.y += ball.dy;


}

function collisionCheck(pegs) {

    for (let i = 0; i < pegs.length; i++) {
        let peg = pegs[i];
        
        
        if (isColliding(ball, peg)) {
            
        }
    }
}
function isColliding(ball, peg) {
    const dx = ball.x - peg.x;
    const dy = ball.y - peg.y; 
    const distance = Math.sqrt(dx * dx + dy * dy); 
    
 
    return distance <= ball.radius + peg.radius;
}


// plynule animacia vsetkeho
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPegs();
    drawBall();
    dropBall();
    requestAnimationFrame(animate)
}



ballSpeed();
animate();
collisionCheck();



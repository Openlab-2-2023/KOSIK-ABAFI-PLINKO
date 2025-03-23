
const canvas = document.getElementById("defaultcanvas");
const ctx = canvas.getContext("2d");

const scaleFactor = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

//hodnoty pre kolíky
const pegRadius = 8; //velkosť
const spacingX = 60;  //vzdialenosť medzi X
const spacingY = 60;  // vzialenosť medzi po Y
let rows = 10; // počet riadkov
let cols = 11; //počet stĺpcov
const offset = spacingX / 2; //posunutie každého druhého riadku
const yOffset = 130; // posunutie po X
const xOffset = 100; //posunutie po Y

// nakreslenie kolikov v canvas
function drawPegs() {
    for (let row = 0; row < rows; row++) { 
        for (let col = 0; col < cols; col++) {
            let x;

            // kazda párny riadok + menšie posunutie + posunutie po X
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

// kolíky 
function drawPeg(x, y) { 
    ctx.beginPath();
    ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

drawPegs();

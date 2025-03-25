const canvas = document.getElementById("defaultcanvas");
const ctx = canvas.getContext("2d");

const scaleFactor = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

// hodnoty pre kolíky
const pegRadius = 8; // veľkosť
const spacingX = 60;  // vzdialenosť medzi X
const spacingY = 60;  // vzdialenosť medzi Y
let rows = 10; // počet riadkov
let cols = 11; // počet stĺpcov
const offset = spacingX / 2; // posunutie každého druhého riadku
const yOffset = 130; // posunutie po Y
const xOffset = 100; // posunutie po X

// Nasobky pre každý stĺpec (priradíme každý stĺpec k náhodnému nasobku)
const multipliers = [];
for (let col = 0; col < cols; col++) {
    multipliers[col] = Math.floor(Math.random() * 15) + 1;  // Nasobky medzi 1 a 5 pre každý stĺpec
}

// nakreslenie kolíkov a nasobkov na canvas
function drawPegs() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x;

            // každá párna riadok + menšie posunutie + posunutie po X
            if (row % 2 === 0) {
                x = col * spacingX + xOffset;
            } else {
                x = col * spacingX + offset + xOffset;
            }

            let y = row * spacingY + yOffset;

            // zaistenie, že sa kolíky netresia mimo canvas
            if (x > pegRadius && x < canvas.width - pegRadius) {
                drawPeg(x, y);
            }
        }
    }

    // Nakreslenie nasobkov pod každým stĺpcom pegov
    for (let col = 0; col < cols; col++) {
        let multiplierX = col * spacingX + xOffset + spacingX / 2;
        let multiplierY = (rows * spacingY) + yOffset + 20;  // Pod celým poľom pegov
        drawMultiplier(multiplierX, multiplierY, multipliers[col]);  // Zobraziť nasobok pre tento stĺpec
    }
}

// nakreslenie kolíka
function drawPeg(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

// nakreslenie nasobku pod stĺpcom pegov
function drawMultiplier(x, y, multiplier) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`x${multiplier}`, x - 10, y);  // Text nasobku vycentrovaný pod stĺpec
}

// Zobrazenie pegov a nasobkov
drawPegs();

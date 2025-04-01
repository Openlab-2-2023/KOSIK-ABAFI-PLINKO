const canvas = document.getElementById("defaultcanvas");
const ctx = canvas.getContext("2d");

const scaleFactor = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

// Peg values
const pegRadius = 8;
const spacingX = 60;  // Increased from original
const spacingY = 60;
let rows = 11;
let cols = 11;
const offset = spacingX / 2;
const yOffset = 130;
const xOffset = 100;

// Multipliers (now with consistent formatting)
const multipliers = [100, 50, 8, 2, 0.6, 0.6, 0.6, 2, 8, 50, 100];

function drawPegs() {
    // Draw pegs (unchanged)
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

    // NEW: Draw multipliers with uniform size and spacing
    const multiplierWidth = 50;  // Fixed width
    const multiplierHeight = 30; // Fixed height
    const verticalSpacing = 40;  // Increased vertical gap
    
    for (let col = 0; col < cols; col++) {
        const x = col * spacingX + xOffset + spacingX / 2;
        const y = (rows * spacingY) + yOffset + verticalSpacing;
        
        drawMultiplier(
            x, 
            y, 
            multipliers[col], 
            multiplierWidth, 
            multiplierHeight,
            15 // 15px gap - adjust this number as needed
        );
    }
}

function drawPeg(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
}

// Updated multiplier drawing
function drawMultiplier(x, y, value, width, height, gap = 10) {
    const text = `×${value}`;
    const cornerRadius = 5;
    
    // Calculate position with gap
    const rectX = x - width/2;
    const rectY = y - height/2 + gap; // Add vertical gap
    
    // Background with gap
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
    
    // Text (positioned in center of rectangle)
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Different colors based on value
    if (value >= 50) ctx.fillStyle = "#d32f2f";
    else if (value >= 5) ctx.fillStyle = "#1976d2";
    else ctx.fillStyle = "#388e3c";
    
    ctx.fillText(text, x, y + gap); // Adjust text position with gap
}
drawPegs();

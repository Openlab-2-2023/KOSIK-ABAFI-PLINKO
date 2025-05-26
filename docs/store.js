const Store = {
    clickUpgradeCost: 100,

    buyClickUpgrade() {
        const upgradeLevels = [100, 500, 2500, 7500, 15000];
        let currentLevel = parseInt(localStorage.getItem("clickUpgradeLevel")) || 0;

        if (currentLevel >= upgradeLevels.length) {
            return alert("Maximum upgrade level reached!");
        }

        const currentCost = upgradeLevels[currentLevel];
        const currentBalance = BalanceManager.getBalance();

        if (currentBalance >= currentCost) {
            BalanceManager.subtract(currentCost);

            let currentValue = parseFloat(localStorage.getItem("clickValue")) || 25;
            currentValue += 25;
            localStorage.setItem("clickValue", currentValue);

            currentLevel++;
            localStorage.setItem("clickUpgradeLevel", currentLevel);

            alert(`Click upgraded to ${currentValue}! Next upgrade will cost ${upgradeLevels[currentLevel] || "N/A"}`);
        } else {
            alert("Not enough balance!");
        }
    },

    buyBallMultiplierUpgrade() {
        let currentMultiplier = parseFloat(localStorage.getItem("ballMultiplier")) || 1.0;
        let currentUpgradeLevel = parseInt(localStorage.getItem("ballMultiplierLevel")) || 0;

        
        if (currentMultiplier >= 2.0) {
            alert("Maximum ball multiplier reached!");
            return;
        }

        const baseCost = 1250;
        const upgradeCost = baseCost * Math.pow(5, currentUpgradeLevel);
        const balance = BalanceManager.getBalance();

        if (balance >= upgradeCost) {
            BalanceManager.subtract(upgradeCost);

           
            currentMultiplier = parseFloat((currentMultiplier + 0.1).toFixed(1));
            localStorage.setItem("ballMultiplier", currentMultiplier);

            currentUpgradeLevel++;
            localStorage.setItem("ballMultiplierLevel", currentUpgradeLevel);

            alert(`Ball multiplier upgraded to ×${currentMultiplier}! Next upgrade will cost ${formatNumber(baseCost * Math.pow(5, currentUpgradeLevel))}`);
        } else {
            alert("Not enough balance for this multiplier upgrade!");
        }
    }
    
};

function updateMultiplierUpgradeButton() {
    const baseCost = 1250;
    const level = parseInt(localStorage.getItem("ballMultiplierLevel")) || 0;
    const multiplier = parseFloat(localStorage.getItem("ballMultiplier")) || 1.0;

    const button = document.getElementById("ball-multiplier-upgrade-btn");
    if (!button) return;

    if (multiplier >= 2.0) {
        button.textContent = "Ball Multiplier MAXED (x2.0)";
        button.disabled = true;
    } else {
        const cost = baseCost * Math.pow(5, level);
        button.textContent = `Upgrade Ball Multiplier (x${multiplier.toFixed(1)}) – ${formatNumber(cost)} coins`;
        button.disabled = false;
    }
}

function getNextUpgradeCost() {
    const upgradeLevels = [100, 500, 2500, 7500, 15000];
    let currentLevel = parseInt(localStorage.getItem("clickUpgradeLevel")) || 0;
    return upgradeLevels[currentLevel] || null;
}

function updateNextUpgradeCostDisplay() {
    const cost = getNextUpgradeCost();
    const el = document.getElementById("next-upgrade-cost");
    if (el) {
        el.textContent = cost ? `${formatNumber(cost)} coins` : "MAXED";
    }
}

setInterval(() => {
    updateStoreBalanceDisplay();
    updateNextUpgradeCostDisplay();
    updateMultiplierUpgradeButton();
}, 500);



function formatNumber(num) {
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + 'T';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(2) + 'k';
    return num.toFixed(2);
}


function updateStoreBalanceDisplay() {
    const balance = BalanceManager.getBalance();
    const formatted = formatNumber(balance);
    const display = document.getElementById("store-balance");
    if (display) {
        display.textContent = `Balance: ${formatted}`;
    }
}

window.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key.toLowerCase() === "i") {
        if (confirm("Are you sure you want to reset all upgrades?")) {
         
            localStorage.setItem("clickUpgradeLevel", "0");
            localStorage.setItem("clickValue", "25");

            localStorage.setItem("ballMultiplierLevel", "0");
            localStorage.setItem("ballMultiplier", "1.0");

         
            updateNextUpgradeCostDisplay();
            updateMultiplierUpgradeButton();
            alert("All upgrades have been reset!");
        }
    }
});


setInterval(updateStoreBalanceDisplay, 500);
window.addEventListener("load", updateStoreBalanceDisplay);
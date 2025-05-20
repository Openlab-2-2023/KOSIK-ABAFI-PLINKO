function updateBalanceDisplay(newBalance) {
    const balanceDisplay = document.getElementById("balance");
    if (balanceDisplay) {
        balanceDisplay.textContent = "Balance: " + newBalance;
    }
}


BalanceManager.subscribe(updateBalanceDisplay);
updateBalanceDisplay(BalanceManager.getBalance());


const clicker = {
    isVisible: false,
    intervalId: null,

    init() {
        this.startButtonVisibilityCycle();
        document.getElementById('clicker').addEventListener('click', () => this.handleClick());

        // sleduje zmeny balancu 
        BalanceManager.subscribe(this.updateDisplay.bind(this));

        this.updateDisplay(BalanceManager.getBalance());
    },

    getRandomPosition() {
        const rect = document.querySelector('.clicker-section').getBoundingClientRect();
        const maxX = rect.width - 150;
        const maxY = rect.height - 80;

        return {
            x: Math.random() * maxX,
            y: Math.random() * maxY
        };
    },

    moveButton() {
        const pos = this.getRandomPosition();
        const button = document.getElementById('clicker');
        button.style.left = `${pos.x}px`;
        button.style.top = `${pos.y}px`;
    },

    startButtonVisibilityCycle() {
        this.intervalId = setInterval(() => {
            if (!this.isVisible) {
                this.showButton();
                this.moveButton();
            } else {
                this.hideButton();
            }
        }, 4000);
    },

    showButton() {
        this.isVisible = true;
        document.getElementById('clicker').classList.remove('hidden');
        document.getElementById('clicker').classList.add('visible');
    },

    hideButton() {
        this.isVisible = false;
        document.getElementById('clicker').classList.remove('visible');
        document.getElementById('clicker').classList.add('hidden');
    },

    handleClick() {
        if (this.isVisible) {
            BalanceManager.add(25);  // pridavanie na klik balance
            this.hideButton();
            setTimeout(() => {
                this.showButton();
                this.moveButton();
            }, 2000);
        }
    },

    updateDisplay(currentBalance) {
        document.getElementById('balance').textContent = `Balance: ${currentBalance}`;
    }
};

window.onload = () => clicker.init();
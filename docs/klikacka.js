function formatNumber(num) {
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + 'T';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(2) + 'k';
    return num.toFixed(2);
}
const clicker = {
    isVisible: false,
    intervalId: null,
    lastClickTime: 0,
    cooldownDuration: 100,
    clickValue: parseFloat(localStorage.getItem("clickValue")) || 25,
    currentMultiplier: 1.0,

    init() {
        this.startButtonVisibilityCycle();
        document.getElementById('clicker').addEventListener('click', () => this.handleClick());

        window.addEventListener('keydown', (event) => {
            event.preventDefault();
        });

        BalanceManager.subscribe(this.updateDisplay.bind(this));
        this.updateDisplay(BalanceManager.getBalance());
    },

    handleClick() {
        const currentTime = Date.now();
        if (currentTime - this.lastClickTime >= this.cooldownDuration && this.isVisible) {
            const totalGain = this.clickValue * this.currentMultiplier;
            BalanceManager.add(totalGain);
            this.lastClickTime = currentTime;

            this.hideButton();
            setTimeout(() => {
                this.showButton();
                this.moveButton();
            }, 100);
        }
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


    updateDisplay(currentBalance) {
        const formatted = formatNumber(currentBalance);
        document.getElementById('balance').textContent = `Balance: ${formatted} | Click: ${this.clickValue}x`;
    }
};

window.clicker = clicker

window.onload = () => clicker.init();

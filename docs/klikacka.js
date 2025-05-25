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

    init() {
        this.startButtonVisibilityCycle();
        document.getElementById('clicker').addEventListener('click', () => this.handleClick());

        // blokuje vstup všetkych klavies
        window.addEventListener('keydown', (event) => {
            event.preventDefault();
        });

       
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
        const currentTime = Date.now();

        if (currentTime - this.lastClickTime >= this.cooldownDuration && this.isVisible) {
            BalanceManager.add(25);  // pridavanie do celkove balance
            this.lastClickTime = currentTime;

            this.hideButton();
            setTimeout(() => {
                this.showButton();
                this.moveButton();
            }, 100);
        }
    },

    updateDisplay(currentBalance) {
       const formatted = formatNumber(currentBalance);
    document.getElementById('balance').textContent = `Balance: ${formatted}`;
    }
};



window.onload = () => clicker.init();

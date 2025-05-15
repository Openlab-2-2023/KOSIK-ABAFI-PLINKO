 const clicker = {
            balance: 0,
            isVisible: false,
            intervalId: null,
            
            init() {
                this.startButtonVisibilityCycle();
                document.getElementById('clicker').addEventListener('click', () => this.handleClick());
                this.updateDisplay();
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
                }, 4000); // Zvýšené na 4 sekundy
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
                    this.balance += 25;
                    this.updateDisplay();
                    this.hideButton();
                    setTimeout(() => {
                        this.showButton();
                        this.moveButton();
                    }, 2000); // Zvýšené na 2 sekundy
                }
            },
            
            updateDisplay() {
                document.getElementById('balance').textContent = `Balance: ${this.balance}`;
            }
        };


        window.onload = () => clicker.init();
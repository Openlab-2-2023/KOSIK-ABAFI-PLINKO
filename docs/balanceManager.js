const BalanceManager = (function() {
    const STORAGE_KEY = 'gameBalance';

    // ukladá balance do localStorage a loaduje alebo do 1k (zaklad)
    let balance = parseFloat(localStorage.getItem(STORAGE_KEY));
    if (isNaN(balance)) balance = 1000;

    const subscribers = [];

    function getBalance() {
        return balance;
    }

    function setBalance(newBalance) {
        balance = newBalance;
        if (balance < 0) balance = 0; //prevencia zaporneho balancu
        saveBalance();
        notifySubscribers();
    }
    // pripocitavanie
    function add(amount) {
        balance += amount;
        saveBalance();
        notifySubscribers();
    }
    //odpocet
    function subtract(amount) {
        balance -= amount;
        if (balance < 0) balance = 0; //prevencia zaporneho balancu
        saveBalance();
        notifySubscribers();
    }

    function notifySubscribers() {
        subscribers.forEach(fn => fn(balance));
    }

    function subscribe(fn) {
        if (typeof fn === 'function') {
            subscribers.push(fn);
        }
    }

    function saveBalance() {
        localStorage.setItem(STORAGE_KEY, balance);
    }

    return {
        getBalance,
        setBalance,
        add,
        subtract,
        subscribe
    };
})();
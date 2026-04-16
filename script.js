const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const modeToggle = document.getElementById('mode-toggle');
const modeLabel = document.getElementById('mode-label');

const config = {
    personal: { 
        key: 'p_transactions', 
        label: 'Personal Mode', 
        cats: ['🍔 Food', '🏠 Rent', '🎮 Fun', '🛒 Shopping', '💰 Salary'] 
    },
    business: { 
        key: 'b_transactions', 
        label: 'Business Mode', 
        cats: ['📈 Trading/Inv', '🏢 Office Rent', '💻 Software', '📣 Marketing', '💳 Client Pay'] 
    }
};

let currentMode = 'personal';
let transactions = [];

// SWITCH MODE
function switchMode() {
    currentMode = modeToggle.checked ? 'business' : 'personal';
    modeLabel.innerText = config[currentMode].label;
    document.body.className = currentMode + '-mode';

    const saved = localStorage.getItem(config[currentMode].key);
    transactions = saved ? JSON.parse(saved) : [];

    // Populate categories
    categorySelect.innerHTML = '';
    config[currentMode].cats.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.innerText = c;
        categorySelect.appendChild(option);
    });

    init();
}

// ADD TRANSACTION
function addTransaction(e) {
    e.preventDefault();

    if (!text.value || !amount.value) {
        alert('Please fill all fields');
        return;
    }

    const transaction = { 
        id: Date.now(), 
        text: text.value, 
        category: categorySelect.value, 
        amount: Number(amount.value), 
        date: new Date().toISOString().split('T')[0] // safe date
    };

    transactions.push(transaction);
    updateLocalStorage();

    text.value = '';
    amount.value = '';

    init();
}

// UPDATE VALUES
function updateValues() {
    const amounts = transactions.map(t => t.amount);

    const total = amounts.reduce((a, b) => a + b, 0).toFixed(2);

    const income = amounts
        .filter(a => a > 0)
        .reduce((a, b) => a + b, 0)
        .toFixed(2);

    const expense = (
        amounts
            .filter(a => a < 0)
            .reduce((a, b) => a + b, 0) * -1
    ).toFixed(2);

    balance.innerText = `$${total}`;
    money_plus.innerText = `+$${income}`;
    money_minus.innerText = `-$${expense}`;
}

// INIT UI
function init() {
    list.innerHTML = '';

    transactions.forEach(t => {
        const li = document.createElement('li');
        li.classList.add(t.amount < 0 ? 'minus' : 'plus');

        li.innerHTML = `
            <div>
                <strong>${t.text}</strong><br>
                <small>${t.category} | ${t.date}</small>
            </div>
            <span>${t.amount < 0 ? '-' : '+'}$${Math.abs(t.amount).toFixed(2)}</span>
            <button class="delete-btn" onclick="removeTx(${t.id})">Del</button>
        `;

        list.appendChild(li);
    });

    updateValues();
}

// REMOVE TRANSACTION
function removeTx(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

// SAVE
function updateLocalStorage() {
    localStorage.setItem(config[currentMode].key, JSON.stringify(transactions));
}

// EXPORT CSV (SAFE VERSION)
document.getElementById('export-btn').addEventListener('click', () => {
    if (transactions.length === 0) {
        alert("No data to export");
        return;
    }

    let csv = "Date,Description,Category,Amount\n";

    transactions.forEach(t => {
        let cleanText = t.text.replace(/,/g, "");
        
        // simple safe cleaning (no fancy regex)
        let cleanCategory = t.category.replace(/[^\x00-\x7F]/g, "");

        csv += `"${t.date}","${cleanText}","${cleanCategory}","${t.amount}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CashFlow_${currentMode}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// RESET
document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm(`Clear all ${currentMode} data?`)) {
        transactions = [];
        updateLocalStorage();
        init();
    }
});

// EVENTS
modeToggle.addEventListener('change', switchMode);
form.addEventListener('submit', addTransaction);

// START
switchMode();

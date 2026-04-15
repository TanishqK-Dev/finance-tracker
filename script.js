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
    personal: { key: 'p_transactions', label: 'Personal Mode', cats: ['🍔 Food', '🏠 Rent', '🎮 Fun', '🛒 Shopping', '💰 Salary'] },
    business: { key: 'b_transactions', label: 'Business Mode', cats: ['📈 Trading/Inv', '🏢 Office Rent', '💻 Software', '📣 Marketing', '💳 Client Pay'] }
};

let currentMode = 'personal';
let transactions = [];

function switchMode() {
    currentMode = modeToggle.checked ? 'business' : 'personal';
    modeLabel.innerText = config[currentMode].label;
    document.body.className = currentMode + '-mode';
    const saved = JSON.parse(localStorage.getItem(config[currentMode].key));
    transactions = saved || [];
    categorySelect.innerHTML = config[currentMode].cats.map(c => `<option value="${c}">${c}</option>`).join('');
    init();
}

function addTransaction(e) {
    e.preventDefault();
    if (!text.value || !amount.value) return alert('Please fill all fields');
    const transaction = { 
        id: Date.now(), 
        text: text.value, 
        category: categorySelect.value, 
        amount: +amount.value, 
        date: new Date().toLocaleDateString() 
    };
    transactions.push(transaction);
    updateLocalStorage();
    text.value = ''; amount.value = '';
    init();
}

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const inc = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const exp = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);
    balance.innerText = `$${total}`; money_plus.innerText = `+$${inc}`; money_minus.innerText = `-$${exp}`;
}

function init() {
    list.innerHTML = '';
    transactions.forEach(t => {
        const item = document.createElement('li');
        item.classList.add(t.amount < 0 ? 'minus' : 'plus');
        item.innerHTML = `<div><strong>${t.text}</strong><br><small>${t.category} | ${t.date}</small></div><span>${t.amount < 0 ? '-' : '+'}$${Math.abs(t.amount).toFixed(2)}</span><button class="delete-btn" onclick="removeTx(${t.id})">Del</button>`;
        list.appendChild(item);
    });
    updateValues();
}

function removeTx(id) { transactions = transactions.filter(t => t.id !== id); updateLocalStorage(); init(); }
function updateLocalStorage() { localStorage.setItem(config[currentMode].key, JSON.stringify(transactions)); }

// --- FIXED EXPORT ENGINE (BOM INCLUDED FOR EMOJIS) ---
document.getElementById('export-btn').addEventListener('click', () => {
    if (transactions.length === 0) return alert("No data to export");

    // \ufeff is the BOM that tells Excel/Sheets to read emojis correctly
    let csvContent = "\ufeffDate,Description,Category,Amount\r\n";
    transactions.forEach(t => {
        let cleanText = t.text.replace(/,/g, "");
        csvContent += `${t.date},${cleanText},${t.category},${t.amount}\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CashFlow_${currentMode}.csv`);
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 100);
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm(`Clear all ${currentMode} data?`)) { transactions = []; updateLocalStorage(); init(); }
});

modeToggle.addEventListener('change', switchMode);
form.addEventListener('submit', addTransaction);
switchMode();

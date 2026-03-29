document.addEventListener('DOMContentLoaded', () => {
    let transactions = []; 
    let isDark = true;

    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const modal = document.getElementById('chartModal');
    
    // --- GRÁFICAS ---
    const lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }
    });

    const pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'doughnut',
        data: { 
            labels: ['Ingresos Reales', 'Ingresos Teoricos', 'Egresos', 'Mercaderias', 'Inmuebles', 'Gastos Personales'], 
            datasets: [{ data: [0,0,0,0,0,0], backgroundColor: ['#10b981', '#3b82f6', '#f43f5e', '#fbbf24', '#8b5cf6', '#94a3b8'], borderWidth: 0 }] 
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: window.innerWidth < 768 ? 'bottom' : 'right', labels: { color: '#94a3b8' } } } }
    });

    // --- FUNCIONES DE BORRADO ---
    window.deleteTransaction = (index) => {
        transactions.splice(index, 1);
        updateUI();
    };

    function updateUI() {
        let balance = 0, income = 0, expenses = 0;
        let categories = { "Ingresos Reales": 0, "Ingresos Teoricos": 0, "Egresos": 0, "Mercaderias": 0, "Inmuebles": 0, "Gastos Personales": 0 };
        let lineData = [], lineLabels = [];

        listEl.innerHTML = '';

        transactions.forEach((t, index) => {
            const isInc = t.cat.includes('Ingreso');
            if(isInc) { balance += t.amt; income += t.amt; } 
            else { balance -= t.amt; expenses += t.amt; }

            if(categories[t.cat] !== undefined) categories[t.cat] += t.amt;
            lineData.push(balance);
            lineLabels.push(t.desc);

            listEl.innerHTML += `
                <div class="t-item">
                    <div class="t-info">
                        <strong>${t.desc}</strong>
                        <small>${t.cat}</small>
                    </div>
                    <div class="t-amount">
                        <span style="color: ${isInc ? 'var(--success)' : 'var(--danger)'}">
                            ${isInc ? '+' : '-'}$${t.amt.toLocaleString()}
                        </span>
                        <button class="btn-del" onclick="deleteTransaction(${index})">✕</button>
                    </div>
                </div>`;
        });

        document.getElementById('kpi-balance').innerText = `$${balance.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${income.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expenses.toLocaleString()}`;

        lineChart.data.labels = lineLabels;
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();

        pieChart.data.datasets[0].data = Object.values(categories);
        pieChart.update();
    }

    // --- EVENTOS ---
    addBtn.onclick = () => {
        const desc = document.getElementById('desc').value;
        const amt = parseFloat(document.getElementById('amt').value);
        const cat = document.getElementById('cat').value;
        if(!desc || isNaN(amt)) return;
        transactions.push({ desc, amt, cat });
        updateUI();
        document.getElementById('desc').value = '';
        document.getElementById('amt').value = '';
    };

    clearBtn.onclick = () => {
        if(confirm("¿Borrar todo el historial actual?")) {
            transactions = [];
            updateUI();
        }
    };

    themeBtn.onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerText = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
    };

    updateUI();
});

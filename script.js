document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v6_data')) || [];
    let isDark = true;

    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    
    // --- GRÁFICAS ---
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
            labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Personales'], 
            datasets: [{ data: [0,0,0,0], backgroundColor: ['#f43f5e', '#fbbf24', '#8b5cf6', '#ec4899'], borderWidth: 0 }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } } 
        }
    });

    function updateUI() {
        let balance = 0, income = 0, expenses = 0;
        let catStats = { "Egresos": 0, "Gastos de Compra de Mercadería": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0 };
        let lineData = [], lineLabels = [];

        listEl.innerHTML = '';
        transactions.forEach((t) => {
            const isInc = t.cat.toLowerCase().includes("ingresos");
            isInc ? (balance += t.amt, income += t.amt) : (balance -= t.amt, expenses += t.amt, catStats[t.cat] !== undefined && (catStats[t.cat] += t.amt));
            lineData.push(balance); lineLabels.push(t.desc);

            listEl.innerHTML += `
                <div class="t-item">
                    <div>
                        <strong>${t.desc}</strong>
                        <small style="display:block; color:var(--text-muted)">${t.cat}</small>
                    </div>
                    <div style="font-weight:800; color: ${isInc ? 'var(--success)' : 'var(--danger)'}">
                        ${isInc ? '+' : '-'}$${t.amt.toLocaleString()}
                    </div>
                </div>`;
        });

        document.getElementById('kpi-balance').innerText = `$${balance.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${income.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expenses.toLocaleString()}`;

        lineChart.data.labels = lineLabels;
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();

        pieChart.data.datasets[0].data = Object.values(catStats);
        pieChart.update();

        localStorage.setItem('finance_v6_data', JSON.stringify(transactions));
    }

    document.getElementById('addBtn').onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || isNaN(parseFloat(a.value))) return;
        transactions.push({ desc: d.value, amt: parseFloat(a.value), cat: c.value });
        updateUI(); d.value = ''; a.value = '';
    };

    document.getElementById('clearBtn').onclick = () => { if(confirm("¿Borrar todo?")) { transactions = []; updateUI(); }};

    themeBtn.onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerText = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
    };

    updateUI();
});

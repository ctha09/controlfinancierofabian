document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];
    let isDark = true;

    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const balanceEl = document.getElementById('kpi-balance');

    // --- GRÁFICAS ---
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance Acumulado', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4 }] },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } }
        }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
            labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Gastos Pers.', 'Proveedores'], 
            datasets: [{ data: [0,0,0,0,0], backgroundColor: ['#f43f5e', '#fbbf24', '#3b82f6', '#10b981', '#a855f7'], borderWidth: 0 }] 
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
        }
    });

    function updateUI() {
        let balance = 0, income = 0, expenses = 0;
        let catStats = { "Egresos": 0, "Compra de Mercaderia": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0, "Proveedores": 0 };
        let lineData = [], lineLabels = [];

        listEl.innerHTML = '';

        transactions.forEach((t) => {
            const isIncome = (t.cat === 'Ingresos Reales' || t.cat === 'Ingresos Teoricos');
            
            if(isIncome) { 
                balance += t.amt; income += t.amt; 
            } else { 
                balance -= t.amt; expenses += t.amt;
                // Si la categoría no es de las fijas, es un Proveedor
                if(catStats[t.cat] !== undefined) {
                    catStats[t.cat] += t.amt;
                } else {
                    catStats["Proveedores"] += t.amt;
                }
            }
            lineData.push(balance);
            lineLabels.push(t.desc);

            const item = document.createElement('div');
            item.className = 't-item';
            item.innerHTML = `
                <div style="flex-grow:1">
                    <strong style="display:block">${t.desc}</strong>
                    <span class="t-date">${t.date} • ${t.cat}</span>
                </div>
                <div style="text-align:right">
                    <span style="font-weight:800; color: ${isIncome ? 'var(--success)' : 'var(--danger)'}">
                        ${isIncome ? '+' : '-'}$${t.amt.toLocaleString()}
                    </span>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>`;
            listEl.prepend(item);
        });

        balanceEl.innerText = `$${balance.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${income.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expenses.toLocaleString()}`;
        
        lineChart.data.labels = lineLabels;
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();
        
        pieChart.data.datasets[0].data = Object.values(catStats);
        pieChart.update();

        localStorage.setItem('finance_v8_data', JSON.stringify(transactions));
    }

    addBtn.onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || !a.value) return alert("Completa los datos");
        transactions.push({ id: Date.now(), desc: d.value, amt: parseFloat(a.value), cat: c.value, date: new Date().toLocaleDateString() });
        updateUI();
        d.value = ''; a.value = '';
    };

    window.deleteTransaction = (id) => {
        transactions = transactions.filter(t => t.id !== id);
        updateUI();
    };

    clearBtn.onclick = () => { if(confirm("¿Borrar todo?")) { transactions = []; updateUI(); } };

    themeBtn.onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerText = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
    };

    updateUI();
});

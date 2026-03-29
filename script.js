document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v6_elite')) || [];
    let isDark = true;

    // --- GRÁFICAS ---
    const lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Flujo', data: [], borderColor: '#6366f1', fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    const pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'doughnut',
        data: { labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Personales'], datasets: [{ data: [0,0,0,0], backgroundColor: ['#f43f5e', '#fbbf24', '#8b5cf6', '#ec4899'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    });

    function updateUI() {
        let bal = 0, inc = 0, exp = 0;
        let stats = { "Egresos": 0, "Gastos de Compra de Mercadería": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0 };
        const list = document.getElementById('list');
        list.innerHTML = '';

        transactions.forEach(t => {
            const isInc = t.cat.toLowerCase().includes("ingresos");
            isInc ? (bal += t.amt, inc += t.amt) : (bal -= t.amt, exp += t.amt, stats[t.cat] !== undefined && (stats[t.cat] += t.amt));

            list.innerHTML += `
                <div class="t-item">
                    <div><strong>${t.desc}</strong><br><small style="color:var(--text-muted)">${t.cat}</small></div>
                    <div style="font-weight:800; color: ${isInc ? 'var(--success)' : 'var(--danger)'}">
                        ${isInc ? '+' : '-'}$${t.amt.toLocaleString()}
                    </div>
                </div>`;
        });

        document.getElementById('kpi-balance').innerText = `$${bal.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${inc.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${exp.toLocaleString()}`;

        lineChart.data.labels = transactions.map(t => t.desc);
        lineChart.data.datasets[0].data = transactions.reduce((acc, t, i) => {
            acc.push((acc[i-1] || 0) + (t.cat.toLowerCase().includes("ingresos") ? t.amt : -t.amt));
            return acc;
        }, []);
        lineChart.update();

        pieChart.data.datasets[0].data = Object.values(stats);
        pieChart.update();

        localStorage.setItem('finance_v6_elite', JSON.stringify(transactions));
    }

    // --- LOGICA REGISTRO ---
    document.getElementById('addBtn').onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || isNaN(parseFloat(a.value))) return;
        transactions.push({ desc: d.value, amt: parseFloat(a.value), cat: c.value });
        d.value = ''; a.value = ''; updateUI();
    };

    document.getElementById('themeBtn').onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    updateUI();
});

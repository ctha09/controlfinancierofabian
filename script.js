document.addEventListener('DOMContentLoaded', () => {
    let data = JSON.parse(localStorage.getItem('finance_v6')) || [];
    let isDark = true;

    // --- CHARTS ---
    const commonOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    
    const lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: 'rgba(99,102,241,0.1)' }] },
        options: commonOpts
    });

    const pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'doughnut',
        data: { labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Personales'], datasets: [{ data: [0,0,0,0], backgroundColor: ['#f43f5e', '#fbbf24', '#8b5cf6', '#ec4899'], borderWidth: 0 }] },
        options: { ...commonOpts, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } } }
    });

    function update() {
        let bal = 0, inc = 0, exp = 0;
        let stats = { "Egresos": 0, "Gastos de Compra de Mercadería": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0 };
        const list = document.getElementById('list');
        list.innerHTML = '';

        data.forEach(t => {
            const isInc = t.cat.includes("Ingresos");
            isInc ? (bal += t.amt, inc += t.amt) : (bal -= t.amt, exp += t.amt, stats[t.cat] !== undefined && (stats[t.cat] += t.amt));

            list.innerHTML += `
                <div class="t-item">
                    <div class="t-info"><strong>${t.desc}</strong><small>${t.cat}</small></div>
                    <div class="t-amt ${isInc ? 'income-text' : 'expense-text'}">${isInc ? '+' : '-'}$${t.amt.toLocaleString()}</div>
                </div>`;
        });

        document.getElementById('kpi-balance').innerText = `$${bal.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${inc.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${exp.toLocaleString()}`;

        lineChart.data.labels = data.map(t => t.desc);
        lineChart.data.datasets[0].data = data.reduce((acc, t, i) => {
            const val = t.cat.includes("Ingresos") ? t.amt : -t.amt;
            acc.push((acc[i-1] || 0) + val); return acc;
        }, []);
        lineChart.update();

        pieChart.data.datasets[0].data = Object.values(stats);
        pieChart.update();

        localStorage.setItem('finance_v6', JSON.stringify(data));
    }

    document.getElementById('addBtn').onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || !a.value) return;
        data.push({ desc: d.value, amt: parseFloat(a.value), cat: c.value });
        d.value = ''; a.value = ''; update();
    };

    document.getElementById('clearBtn').onclick = () => { if(confirm("¿Borrar todo?")) { data = []; update(); } };
    
    document.getElementById('themeBtn').onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    update();
});

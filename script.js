document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];
    let isDark = true;

    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');

    // Inicializar Gráficos
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.05)' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
            labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Gastos Pers.', 'Proveedores'], 
            datasets: [{ data: [0,0,0,0,0], backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#a855f7'], borderWidth: 0 }] 
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '80%' }
    });

    // Función de Iconos dinámicos
    function getIcon(cat) {
        const icons = {
            "Ingresos Reales": "💰", "Ingresos Teoricos": "📊",
            "Compra de Mercaderia": "📦", "Egresos": "💸",
            "Gastos Personales": "👤", "Compra de Inmuebles": "🏠",
            "Coca cola": "🥤", "Manaos": "🍹", "Arcor": "🍭", 
            "Agronina": "🚜", "Sandro": "🥩", "Cofra": "🐷"
        };
        return icons[cat] || "🏷️";
    }

    function updateUI() {
        let bal = 0, inc = 0, exp = 0, provTotal = 0;
        let stats = { "Egresos": 0, "Compra de Mercaderia": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0, "Proveedores": 0 };
        const mainCats = ["Ingresos Reales", "Ingresos Teoricos", "Egresos", "Compra de Mercaderia", "Compra de Inmuebles", "Gastos Personales"];

        listEl.innerHTML = '';
        transactions.forEach((t) => {
            const isInc = t.cat.includes("Ingresos");
            if(isInc) { bal += t.amt; inc += t.amt; }
            else { 
                bal -= t.amt; exp += t.amt; 
                if(!mainCats.includes(t.cat)) { provTotal += t.amt; stats["Proveedores"] += t.amt; }
                else { stats[t.cat] += t.amt; }
            }

            const item = document.createElement('div');
            item.className = 't-item';
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="font-size:1.5rem; background:rgba(255,255,255,0.05); padding:10px; border-radius:12px;">${getIcon(t.cat)}</div>
                    <div><strong style="display:block">${t.desc}</strong><small style="color:var(--text-muted)">${t.cat}</small></div>
                </div>
                <span style="color:${isInc ? 'var(--success)' : 'var(--danger)'}; font-weight:800; font-size:1.1rem">
                    ${isInc ? '+' : '-'}$${t.amt.toLocaleString()}
                </span>`;
            listEl.prepend(item);
        });

        // Actualizar KPIs
        document.getElementById('kpi-balance').innerText = `$${bal.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${inc.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${exp.toLocaleString()}`;
        document.getElementById('kpi-providers').innerText = `$${provTotal.toLocaleString()}`;

        // Gráficos
        pieChart.data.datasets[0].data = Object.values(stats);
        pieChart.update();
        lineChart.data.labels = transactions.map(t => t.date);
        lineChart.data.datasets[0].data = transactions.map((_, i) => transactions.slice(0,i+1).reduce((a,c)=>a+(c.cat.includes("Ingresos")?c.amt:-c.amt),0));
        lineChart.update();

        localStorage.setItem('finance_v8_data', JSON.stringify(transactions));
    }

    // Botón de Tema
    themeBtn.onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerHTML = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
    };

    // Agregar Operación
    document.getElementById('addBtn').onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || !a.value) return;
        transactions.push({ id: Date.now(), desc: d.value, amt: parseFloat(a.value), cat: c.value, date: new Date().toLocaleDateString() });
        updateUI(); d.value = ''; a.value = '';
    };

    // Limpiar Historial
    document.getElementById('clearBtn').onclick = () => { if(confirm("¿Borrar todo?")) { transactions = []; updateUI(); } };

    updateUI();
});

document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];
    let isDark = true;

    // Elementos
    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const modal = document.getElementById('provModal');
    const bodyList = document.getElementById('modalBodyList');
    const bodyDet = document.getElementById('modalBodyDetail');

    // Inicializar Gráficos con estilos de color mejorados
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ 
            label: 'Flujo de Caja', data: [], 
            borderColor: '#818cf8', borderWidth: 3, tension: 0.4, 
            fill: true, backgroundColor: 'rgba(99, 102, 241, 0.05)',
            pointRadius: 0
        }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { grid: { color: 'rgba(255,255,255,0.05)' } } }
        }
    });

    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
            labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Gastos Pers.', 'Proveedores'], 
            datasets: [{ 
                data: [0,0,0,0,0], 
                backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#a855f7'], 
                borderWidth: 0, hoverOffset: 20 
            }] 
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 20 } } } }
    });

    function updateUI() {
        let bal = 0, inc = 0, exp = 0, provTotal = 0;
        let stats = { "Egresos": 0, "Compra de Mercaderia": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0, "Proveedores": 0 };
        const mainCats = ["Ingresos Reales", "Ingresos Teoricos", "Egresos", "Compra de Mercaderia", "Compra de Inmuebles", "Gastos Personales"];

        listEl.innerHTML = '';
        transactions.forEach((t, index) => {
            const isInc = t.cat.includes("Ingresos");
            if(isInc) { bal += t.amt; inc += t.amt; }
            else { 
                bal -= t.amt; exp += t.amt; 
                if(!mainCats.includes(t.cat)) { provTotal += t.amt; stats["Proveedores"] += t.amt; }
                else { stats[t.cat] += t.amt; }
            }

            // Renderizado de lista con animación de retraso
            const item = document.createElement('div');
            item.className = 't-item';
            item.style.animationDelay = `${index * 0.05}s`;
            item.innerHTML = `
                <div><strong style="display:block">${t.desc}</strong><small style="color:var(--text-muted); font-size:0.75rem">${t.cat} • ${t.date}</small></div>
                <span style="color:${isInc ? 'var(--success)' : 'var(--danger)'}; font-weight:800; font-size:1.1rem">
                    ${isInc ? '+' : '-'}$${t.amt.toLocaleString()}
                </span>`;
            listEl.prepend(item);
        });

        // Contadores animados simples
        document.getElementById('kpi-balance').innerText = `$${bal.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${inc.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${exp.toLocaleString()}`;
        document.getElementById('kpi-providers').innerText = `$${provTotal.toLocaleString()}`;

        pieChart.data.datasets[0].data = Object.values(stats);
        pieChart.update();
        
        lineChart.data.labels = transactions.map(t => t.date);
        lineChart.data.datasets[0].data = transactions.map((_, i) => transactions.slice(0,i+1).reduce((a,c)=>a+(c.cat.includes("Ingresos")?c.amt:-c.amt),0));
        lineChart.update();

        localStorage.setItem('finance_v8_data', JSON.stringify(transactions));
    }

    // Eventos
    themeBtn.onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerHTML = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
    };

    document.getElementById('openProvModal').onclick = () => {
        modal.style.display = "block";
        renderModalList();
    };

    function renderModalList() {
        bodyList.style.display = "block"; bodyDet.style.display = "none";
        bodyList.innerHTML = '';
        const mainCats = ["Ingresos Reales", "Ingresos Teoricos", "Egresos", "Compra de Mercaderia", "Compra de Inmuebles", "Gastos Personales"];
        const pNames = [...new Set(transactions.map(t => t.cat))].filter(c => !mainCats.includes(c));

        pNames.forEach(name => {
            const total = transactions.filter(t => t.cat === name).reduce((a,b)=>a+b.amt, 0);
            const row = document.createElement('div');
            row.className = 'prov-row';
            row.innerHTML = `<span>${name}</span><strong>$${total.toLocaleString()}</strong>`;
            row.onclick = () => renderDetail(name);
            bodyList.appendChild(row);
        });
    }

    function renderDetail(name) {
        bodyList.style.display = "none"; bodyDet.style.display = "block";
        document.getElementById('detName').innerText = name;
        const detList = document.getElementById('detList');
        detList.innerHTML = '';
        transactions.filter(t => t.cat === name).forEach(t => {
            const item = document.createElement('div');
            item.className = 't-item';
            item.innerHTML = `<span>${t.desc}<br><small>${t.date}</small></span><strong>$${t.amt.toLocaleString()}</strong>`;
            detList.appendChild(item);
        });
    }

    document.getElementById('backBtn').onclick = renderModalList;
    document.getElementById('closeBtn').onclick = () => modal.style.display = "none";

    document.getElementById('addBtn').onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || !a.value) return;
        transactions.push({ id: Date.now(), desc: d.value, amt: parseFloat(a.value), cat: c.value, date: new Date().toLocaleDateString() });
        updateUI(); d.value = ''; a.value = '';
    };

    document.getElementById('clearBtn').onclick = () => { if(confirm("¿Borrar historial?")) { transactions = []; updateUI(); } };

    updateUI();
});

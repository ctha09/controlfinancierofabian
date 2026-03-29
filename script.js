document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];
    let isDark = true;

    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const modal = document.getElementById('provModal');
    const bodyList = document.getElementById('modalBodyList');
    const bodyDet = document.getElementById('modalBodyDetail');

    // Gráficos
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Flujo', data: [], borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
            labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Gastos Pers.', 'Proveedores'], 
            datasets: [{ data: [0,0,0,0,0], backgroundColor: ['#f43f5e', '#fbbf24', '#3b82f6', '#10b981', '#a855f7'], borderWidth: 0 }] 
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    function updateUI() {
        let bal = 0, inc = 0, exp = 0, provTotal = 0;
        let stats = { "Egresos": 0, "Compra de Mercaderia": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0, "Proveedores": 0 };
        const mainCats = ["Ingresos Reales", "Ingresos Teoricos", "Egresos", "Compra de Mercaderia", "Compra de Inmuebles", "Gastos Personales"];

        listEl.innerHTML = '';
        transactions.forEach(t => {
            const isInc = t.cat.includes("Ingresos");
            if(isInc) { bal += t.amt; inc += t.amt; }
            else { 
                bal -= t.amt; exp += t.amt; 
                if(!mainCats.includes(t.cat)) { provTotal += t.amt; stats["Proveedores"] += t.amt; }
                else { stats[t.cat] += t.amt; }
            }

            const item = document.createElement('div');
            item.className = 't-item';
            item.innerHTML = `<div><strong>${t.desc}</strong><br><small style="color:var(--text-muted)">${t.cat}</small></div>
                              <span style="color:${isInc ? 'var(--success)' : 'var(--danger)'}; font-weight:800">${isInc ? '+' : '-'}$${t.amt.toLocaleString()}</span>`;
            listEl.prepend(item);
        });

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

    // MODO OSCURO CORREGIDO
    themeBtn.onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerHTML = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
    };

    // LÓGICA MODAL PROVEEDORES
    document.getElementById('openProvModal').onclick = () => {
        modal.style.display = "block";
        renderModalList();
    };

    function renderModalList() {
        bodyList.style.display = "block";
        bodyDet.style.display = "none";
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
        if(pNames.length === 0) bodyList.innerHTML = "<p style='text-align:center; opacity:0.5'>No hay datos.</p>";
    }

    function renderDetail(name) {
        bodyList.style.display = "none";
        bodyDet.style.display = "block";
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

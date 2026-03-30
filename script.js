document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v7_data')) || [];
    let isDark = true;
    let viewDate = new Date(2026, 3, 1); // Abril 2026

    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const addBtn = document.getElementById('addBtn');
    
    // --- GRÁFICAS ---
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Flujo', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
            labels: ["I. Reales", "I. Teoricos", "Egresos", "Mercaderias", "Inmuebles", "Personales"],
            datasets: [{ data: [0,0,0,0,0,0], backgroundColor: ['#10b981', '#34d399', '#f43f5e', '#fbbf24', '#6366f1', '#94a3b8'] }] 
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    window.changeMonth = (delta) => {
        viewDate.setMonth(viewDate.getMonth() + delta);
        updateUI();
    };

    window.showMainView = () => {
        document.getElementById('main-dashboard').style.display = 'grid';
        document.getElementById('main-kpis').style.display = 'grid';
        document.getElementById('view-proveedores').style.display = 'none';
        document.getElementById('view-detalle-proveedor').style.display = 'none';
    };

    window.showProvidersView = () => {
        document.getElementById('main-dashboard').style.display = 'none';
        document.getElementById('main-kpis').style.display = 'none';
        document.getElementById('view-proveedores').style.display = 'block';
        document.getElementById('view-detalle-proveedor').style.display = 'none';
        renderProvidersList();
    };

    window.deleteTransaction = (index) => {
        if(confirm("¿Eliminar este registro?")) {
            transactions.splice(index, 1);
            updateUI();
        }
    };

    function renderProvidersList() {
        const grid = document.getElementById('prov-grid');
        grid.innerHTML = '';
        const providers = [...new Set(transactions.map(t => t.prov))];
        providers.forEach(p => {
            const count = transactions.filter(t => t.prov === p).length;
            grid.innerHTML += `<div class="kpi-card prov-item" onclick="showProviderDetail('${p}')">
                <strong>${p}</strong><br><small>${count} Op.</small>
            </div>`;
        });
    }

    window.showProviderDetail = (name) => {
        document.getElementById('view-proveedores').style.display = 'none';
        document.getElementById('view-detalle-proveedor').style.display = 'block';
        document.getElementById('detalle-nombre-prov').innerText = name;
        const filtered = transactions.filter(t => t.prov === name);
        const list = document.getElementById('prov-history-list');
        list.innerHTML = filtered.map(t => `
            <div class="t-item">
                <div>${t.desc}<br><small>${new Date(t.date).toLocaleDateString()}</small></div>
                <div class="amt-badge ${t.cat.includes('Ingresos')?'inc':'exp'}">$${t.amt.toLocaleString()}</div>
            </div>`).join('');
    };

    function updateUI() {
        document.getElementById('current-month-display').innerText = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
        });

        let bal = 0, inc = 0, exp = 0;
        let cats = { "Ingresos Reales":0, "Ingresos Teoricos":0, "Egresos":0, "Compra Mercaderias":0, "Compra Inmuebles":0, "Gastos Personales":0 };
        let lData = [], lLabels = [];

        listEl.innerHTML = '';
        filtered.forEach((t, i) => {
            const isInc = t.cat.includes('Ingresos');
            if(isInc) { bal += t.amt; inc += t.amt; } else { bal -= t.amt; exp += t.amt; }
            cats[t.cat] += t.amt;
            lData.push(bal); lLabels.push(t.desc);

            listEl.innerHTML = `
                <div class="t-item">
                    <div><strong>${t.desc}</strong><br><small>${t.prov}</small></div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="amt-badge ${isInc?'inc':'exp'}">${isInc?'+':'-'} $${t.amt.toLocaleString()}</div>
                        <button class="delete-btn" onclick="deleteTransaction(${transactions.indexOf(t)})">🗑️</button>
                    </div>
                </div>` + listEl.innerHTML;
        });

        document.getElementById('kpi-balance').innerText = `$${bal.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${inc.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${exp.toLocaleString()}`;
        document.getElementById('kpi-prov-count').innerText = [...new Set(filtered.map(t => t.prov))].length;

        lineChart.data.labels = lLabels; lineChart.data.datasets[0].data = lData; lineChart.update();
        pieChart.data.datasets[0].data = Object.values(cats); pieChart.update();
        localStorage.setItem('finance_v7_data', JSON.stringify(transactions));
    }

    addBtn.addEventListener('click', () => {
        const desc = document.getElementById('desc').value;
        const amt = parseFloat(document.getElementById('amt').value);
        if(!desc || isNaN(amt)) return;
        // Se guarda con el mes actual de la vista
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), 15);
        transactions.push({ desc, amt, cat: document.getElementById('cat').value, prov: document.getElementById('prov').value, date: d });
        updateUI();
        document.getElementById('desc').value = ''; document.getElementById('amt').value = '';
    });

    document.getElementById('themeBtn').onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    document.getElementById('clearBtn').onclick = () => { if(confirm("¿Borrar TODO?")) { transactions = []; updateUI(); } };

    window.exportData = () => {
        const blob = new Blob([JSON.stringify(transactions)], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup_finance_${viewDate.getMonth()}.json`;
        a.click();
    };

    document.getElementById('kpi-prov-card').onclick = showProvidersView;
    updateUI();
});

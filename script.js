document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v7_data')) || [];
    let isDark = true;
    
    // Iniciar en Abril 2026
    let viewDate = new Date(2026, 3, 1); 

    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const addBtn = document.getElementById('addBtn');
    
    // --- GRÁFICAS ---
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
            labels: ["Ingresos Reales", "Ingresos Teoricos", "Egresos", "Compra Mercaderias", "Compra Inmuebles", "Gastos Personales"],
            datasets: [{ data: [0,0,0,0,0,0], backgroundColor: ['#10b981', '#34d399', '#f43f5e', '#fbbf24', '#6366f1', '#94a3b8'] }] 
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // --- LOGICA DE MES ---
    window.changeMonth = (delta) => {
        viewDate.setMonth(viewDate.getMonth() + delta);
        updateUI();
    };

    function getMonthName(date) {
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    // --- NAVEGACIÓN ---
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
        if(confirm("¿Eliminar registro?")) {
            transactions.splice(index, 1);
            updateUI();
        }
    };

    // --- ACTUALIZACIÓN UI ---
    function updateUI() {
        const monthYear = `${viewDate.getMonth()}-${viewDate.getFullYear()}`;
        document.getElementById('current-month-display').innerText = getMonthName(viewDate);

        // FILTRAR TRANSACCIONES POR EL MES SELECCIONADO
        const filtered = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === viewDate.getMonth() && tDate.getFullYear() === viewDate.getFullYear();
        });

        let balance = 0, income = 0, expenses = 0;
        let catsMapping = { "Ingresos Reales":0, "Ingresos Teoricos":0, "Egresos":0, "Compra Mercaderias":0, "Compra Inmuebles":0, "Gastos Personales":0 };
        let lineData = [], lineLabels = [];

        listEl.innerHTML = '';
        
        filtered.forEach((t) => {
            const isInc = t.cat.includes('Ingresos');
            if(isInc) { balance += t.amt; income += t.amt; } 
            else { balance -= t.amt; expenses += t.amt; }
            catsMapping[t.cat] += t.amt;
            
            lineData.push(balance);
            lineLabels.push(t.desc);

            const origIdx = transactions.indexOf(t);
            listEl.innerHTML = `
                <div class="t-item">
                    <div><strong>${t.desc}</strong><small style="display:block">${t.prov}</small></div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="amt-badge ${isInc ? 'inc' : 'exp'}">${isInc ? '+' : '-'} $${t.amt.toLocaleString()}</div>
                        <button class="delete-btn" onclick="deleteTransaction(${origIdx})">🗑️</button>
                    </div>
                </div>` + listEl.innerHTML;
        });

        // Update KPIs
        const balEl = document.getElementById('kpi-balance');
        balEl.innerText = `$${balance.toLocaleString()}`;
        balEl.style.color = balance >= 0 ? 'var(--success)' : 'var(--danger)';
        document.getElementById('kpi-in').innerText = `$${income.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expenses.toLocaleString()}`;
        document.getElementById('kpi-prov-count').innerText = [...new Set(filtered.map(t => t.prov))].length;

        // Update Charts
        lineChart.data.labels = lineLabels;
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();
        pieChart.data.datasets[0].data = Object.values(catsMapping);
        pieChart.update();

        localStorage.setItem('finance_v7_data', JSON.stringify(transactions));
    }

    addBtn.addEventListener('click', () => {
        const desc = document.getElementById('desc').value;
        const amt = parseFloat(document.getElementById('amt').value);
        const cat = document.getElementById('cat').value;
        const prov = document.getElementById('prov').value;
        
        if(!desc || isNaN(amt)) return alert("Completa los datos");

        // Guardar con la fecha del mes que estamos viendo actualmente
        const dateToSave = new Date(viewDate.getFullYear(), viewDate.getMonth(), 15);

        transactions.push({ desc, amt, cat, prov, date: dateToSave });
        updateUI();
        document.getElementById('desc').value = ''; 
        document.getElementById('amt').value = '';
    });

    document.getElementById('kpi-prov-card').onclick = showProvidersView;
    updateUI();
});

document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v7_data')) || [];
    let isDark = true;
    let viewDate = new Date(); 

    const listEl = document.getElementById('list');
    const addBtn = document.getElementById('addBtn');
    
    // --- GRÁFICAS ---
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Flujo de Caja', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.3 }] },
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

    window.changeDay = (delta) => {
        viewDate.setDate(viewDate.getDate() + delta);
        updateUI();
    };

    window.goToDate = (dateStr) => {
        if(!dateStr) return;
        const [year, month, day] = dateStr.split('-');
        viewDate = new Date(year, month - 1, day);
        updateUI();
    };

    function updateUI() {
        const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
        document.getElementById('current-date-display').innerText = viewDate.toLocaleDateString('es-ES', options).toUpperCase();
        document.getElementById('display-date-form').value = viewDate.toLocaleDateString('es-ES');

        let acumuladoHistorico = 0;
        let balanceMensualNeto = 0;
        let incHoy = 0, expHoy = 0;
        
        const currentMonth = viewDate.getMonth();
        const currentYear = viewDate.getFullYear();

        // 1. Recorrido único para cálculos de balance
        transactions.forEach(t => {
            const tDate = new Date(t.date);
            const isInc = t.cat.includes('Ingresos');
            const amount = isInc ? t.amt : -t.amt;

            // Balance acumulado total hasta el inicio del día seleccionado
            if (tDate.setHours(0,0,0,0) < viewDate.setHours(0,0,0,0)) {
                acumuladoHistorico += amount;
            }

            // Balance Neto del MES seleccionado (independiente del día)
            if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
                balanceMensualNeto += amount;
            }
        });

        // 2. Transacciones del día para historial y KPIs diarios
        const hoyFiltered = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getDate() === viewDate.getDate() && 
                   d.getMonth() === viewDate.getMonth() && 
                   d.getFullYear() === viewDate.getFullYear();
        });

        let cats = { "Ingresos Reales":0, "Ingresos Teoricos":0, "Egresos":0, "Compra Mercaderias":0, "Compra Inmuebles":0, "Gastos Personales":0 };
        let lData = [acumuladoHistorico], lLabels = ["Inicio"];
        let runningBalance = acumuladoHistorico;

        listEl.innerHTML = '';
        hoyFiltered.forEach((t) => {
            const isInc = t.cat.includes('Ingresos');
            if(isInc) { incHoy += t.amt; runningBalance += t.amt; } 
            else { expHoy += t.amt; runningBalance -= t.amt; }
            
            cats[t.cat] += t.amt;
            lData.push(runningBalance);
            lLabels.push(t.desc);

            listEl.innerHTML = `
                <div class="t-item">
                    <div><strong>${t.desc}</strong><br><small>${t.prov}</small></div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="amt-badge ${isInc?'inc':'exp'}">${isInc?'+':'-'} $${t.amt.toLocaleString()}</div>
                        <button class="delete-btn" onclick="deleteTransaction(${transactions.indexOf(t)})">🗑️</button>
                    </div>
                </div>` + listEl.innerHTML;
        });

        // Actualizar KPIs
        document.getElementById('kpi-balance').innerText = `$${runningBalance.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${incHoy.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expHoy.toLocaleString()}`;
        document.getElementById('kpi-month-net').innerText = `$${balanceMensualNeto.toLocaleString()}`;

        // Gráficos
        lineChart.data.labels = lLabels;
        lineChart.data.datasets[0].data = lData;
        lineChart.update();
        pieChart.data.datasets[0].data = Object.values(cats);
        pieChart.update();

        localStorage.setItem('finance_v7_data', JSON.stringify(transactions));
    }

    addBtn.addEventListener('click', () => {
        const desc = document.getElementById('desc').value;
        const amt = parseFloat(document.getElementById('amt').value);
        if(!desc || isNaN(amt)) return;
        transactions.push({ desc, amt, cat: document.getElementById('cat').value, prov: document.getElementById('prov').value, date: new Date(viewDate) });
        updateUI();
        document.getElementById('desc').value = ''; document.getElementById('amt').value = '';
    });

    window.deleteTransaction = (index) => { if(confirm("¿Eliminar?")) { transactions.splice(index, 1); updateUI(); } };
    document.getElementById('themeBtn').onclick = () => { isDark = !isDark; document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light'); };
    window.exportData = () => { const blob = new Blob([JSON.stringify(transactions)], {type: 'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `backup_finance.json`; a.click(); };
    document.getElementById('clearBtn').onclick = () => { if(confirm("¿Borrar TODO?")) { transactions = []; updateUI(); } };
    
    updateUI();
});

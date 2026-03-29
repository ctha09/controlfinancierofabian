document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];
    let isDark = true;

    // DOM Elements
    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const balanceEl = document.getElementById('kpi-balance');
    const modal = document.getElementById('chartModal');

    // --- GRÁFICAS (Configuración estándar) ---
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Gastos Pers.'], datasets: [{ data: [0,0,0,0], backgroundColor: ['#f43f5e', '#fbbf24', '#3b82f6', '#10b981'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    });

    // --- CORE FUNCTIONS ---
    function updateUI() {
        let balance = 0, income = 0, expenses = 0;
        let catStats = { "Egresos": 0, "Compra de Mercaderia": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0 };
        let lineData = [], lineLabels = [];
        listEl.innerHTML = '';

        transactions.forEach((t) => {
            const isIncome = (t.cat === 'Ingresos Reales' || t.cat === 'Ingresos Teoricos');
            if(isIncome) { balance += t.amt; income += t.amt; } 
            else { 
                balance -= t.amt; expenses += t.amt;
                if(catStats[t.cat] !== undefined) catStats[t.cat] += t.amt;
            }
            lineData.push(balance);
            lineLabels.push(t.desc);

            const item = document.createElement('div');
            item.className = 't-item';
            item.innerHTML = `
                <div style="flex-grow:1">
                    <strong style="display:block">${escapeHtml(t.desc)}</strong>
                    <span class="t-date">${t.date} • ${t.cat}</span>
                </div>
                <div style="text-align:right">
                    <span style="font-weight:800; color: ${isIncome ? 'var(--success)' : 'var(--danger)'}">
                        ${isIncome ? '+' : '-'}$${t.amt.toLocaleString()}
                    </span>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>`;
            listEl.appendChild(item);
        });

        balanceEl.innerText = `$${balance.toLocaleString()}`;
        balanceEl.classList.toggle('negative-balance', balance < 0);
        document.getElementById('kpi-in').innerText = `$${income.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expenses.toLocaleString()}`;
        document.getElementById('count-msg').innerText = `${transactions.length} registros`;

        lineChart.data.labels = lineLabels;
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();
        pieChart.data.datasets[0].data = Object.values(catStats);
        pieChart.update();

        localStorage.setItem('finance_v8_data', JSON.stringify(transactions));
    }

    // --- EXPORTAR A EXCEL ---
    document.getElementById('exportExcel').addEventListener('click', () => {
        if(transactions.length === 0) return alert("No hay datos para exportar");
        
        const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
            Fecha: t.date,
            Descripción: t.desc,
            Categoría: t.cat,
            Monto: t.amt,
            Tipo: (t.cat.includes('Ingresos')) ? 'Entrada' : 'Salida'
        })));
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Finanzas");
        XLSX.writeFile(workbook, `Reporte_FinanceFlow_${new Date().toLocaleDateString()}.xlsx`);
    });

    // --- EXPORTAR A PDF ---
    document.getElementById('exportPdf').addEventListener('click', () => {
        if(transactions.length === 0) return alert("No hay datos para exportar");
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Reporte de Finanzas - FinanceFlow Elite", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);

        const tableData = transactions.map(t => [
            t.date, 
            t.desc, 
            t.cat, 
            `${t.cat.includes('Ingresos') ? '+' : '-'}$${t.amt.toLocaleString()}`
        ]);

        doc.autoTable({
            head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
            body: tableData,
            startY: 35,
            theme: 'grid',
            headStyles: { fillStyle: '#6366f1' }
        });

        doc.save("Reporte_Finanzas.pdf");
    });

    // --- UTILIDADES Y EVENTOS ---
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    window.deleteTransaction = (id) => {
        if(confirm("¿Eliminar registro?")) {
            transactions = transactions.filter(t => t.id !== id);
            updateUI();
        }
    };

    addBtn.addEventListener('click', () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || isNaN(parseFloat(a.value))) return alert("Datos incompletos");
        
        transactions.push({ id: Date.now(), desc: d.value, amt: parseFloat(a.value), cat: c.value, date: new Date().toLocaleDateString() });
        updateUI();
        d.value = ''; a.value = '';
    });

    clearBtn.addEventListener('click', () => {
        if(confirm("¿Borrar todo?")) { transactions = []; updateUI(); }
    });

    themeBtn.addEventListener('click', () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerText = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
    });

    updateUI();
});

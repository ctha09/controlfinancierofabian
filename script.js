document.addEventListener('DOMContentLoaded', () => {
    // Los datos comienzan vacíos cada vez que abres la página
    let transactions = [];
    let isDark = true;

    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');

    // --- CONFIGURACIÓN DE GRÁFICAS ---
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
    };

    const lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)' }] },
        options: commonOptions
    });

    const pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'doughnut',
        data: { 
            labels: ['Ingresos Reales', 'Ingresos Teoricos', 'Egresos', 'Mercaderias', 'Inmuebles', 'Gastos Personales'],
            datasets: [{ data: [0,0,0,0,0,0], backgroundColor: ['#10b981', '#3b82f6', '#f43f5e', '#fbbf24', '#8b5cf6', '#64748b'], borderWidth: 0 }]
        },
        options: { 
            ...commonOptions, 
            plugins: { 
                legend: { 
                    display: window.innerWidth > 768, 
                    position: 'right',
                    labels: { color: '#94a3b8', font: { size: 10 } }
                } 
            } 
        }
    });

    // --- ACTUALIZACIÓN DE INTERFAZ ---
    function updateUI() {
        let balance = 0, income = 0, expenses = 0;
        let categories = { "Ingresos Reales": 0, "Ingresos Teoricos": 0, "Egresos": 0, "Mercaderias": 0, "Inmuebles": 0, "Gastos Personales": 0 };
        let lineData = [], lineLabels = [];

        listEl.innerHTML = '';

        transactions.forEach((t) => {
            const isInc = t.cat.includes('Ingreso');
            if(isInc) { balance += t.amt; income += t.amt; } 
            else { balance -= t.amt; expenses += t.amt; }

            if(categories[t.cat] !== undefined) categories[t.cat] += t.amt;
            lineData.push(balance);
            lineLabels.push(t.desc);

            listEl.innerHTML += `
                <div class="t-item">
                    <div>
                        <div style="font-weight:700; font-size:0.9rem">${t.desc}</div>
                        <div style="font-size:0.7rem; color:var(--text-muted)">${t.cat}</div>
                    </div>
                    <div style="font-weight:800; color: ${isInc ? 'var(--success)' : 'var(--danger)'}">
                        ${isInc ? '+' : '-'}$${t.amt.toLocaleString()}
                    </div>
                </div>`;
        });

        document.getElementById('kpi-balance').innerText = `$${balance.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${income.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expenses.toLocaleString()}`;

        lineChart.data.labels = lineLabels;
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();

        pieChart.data.datasets[0].data = Object.values(categories);
        pieChart.update();
    }

    // --- BOTONES ---
    document.getElementById('addBtn').onclick = () => {
        const desc = document.getElementById('desc').value;
        const amt = parseFloat(document.getElementById('amt').value);
        const cat = document.getElementById('cat').value;

        if(!desc || isNaN(amt)) return alert("Por favor, ingresa descripción y monto.");

        transactions.push({ desc, amt, cat });
        updateUI();
        
        document.getElementById('desc').value = '';
        document.getElementById('amt').value = '';
    };

    document.getElementById('clearBtn').onclick = () => {
        transactions = [];
        updateUI();
    };

    themeBtn.onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerText = isDark ? '🌙' : '☀️';
    };
});

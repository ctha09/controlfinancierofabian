document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v6_data')) || [];
    let isDark = true;

    // Elementos del DOM
    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const modal = document.getElementById('chartModal');
    
    // --- CONFIGURACIÓN DE GRÁFICAS ---
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4 }] },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.05)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
            }
        }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
            labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Personales'], 
            datasets: [{ 
                data: [0,0,0,0], 
                backgroundColor: ['#f43f5e', '#fbbf24', '#8b5cf6', '#ec4899'], 
                borderWidth: 0 
            }] 
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: window.innerWidth < 768 ? 'bottom' : 'right',
                    labels: { color: '#94a3b8', font: { size: 12 } } 
                } 
            }
        }
    });

    // --- FUNCIONES CORE ---
    function updateUI() {
        let balance = 0, income = 0, expenses = 0;
        let catStats = { "Egresos": 0, "Gastos de Compra de Mercadería": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0 };
        let lineData = [], lineLabels = [];

        listEl.innerHTML = '';

        transactions.forEach((t) => {
            const isIncome = t.cat.toLowerCase().includes("ingresos");

            if(isIncome) {
                balance += t.amt; income += t.amt;
            } else {
                balance -= t.amt; expenses += t.amt;
                if(catStats[t.cat] !== undefined) catStats[t.cat] += t.amt;
            }

            lineData.push(balance);
            lineLabels.push(t.desc);

            listEl.innerHTML += `
                <div class="t-item">
                    <div>
                        <strong style="display:block">${t.desc}</strong>
                        <small style="color:var(--text-muted)">${t.cat}</small>
                    </div>
                    <div style="font-weight:800; color: ${isIncome ? 'var(--success)' : 'var(--danger)'}">
                        ${isIncome ? '+' : '-'}$${t.amt.toLocaleString()}
                    </div>
                </div>`;
        });

        document.getElementById('kpi-balance').innerText = `$${balance.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${income.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expenses.toLocaleString()}`;

        lineChart.data.labels = lineLabels;
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();

        pieChart.data.datasets[0].data = Object.values(catStats);
        pieChart.update();

        localStorage.setItem('finance_v6_data', JSON.stringify(transactions));
    }

    // --- LÓGICA DE PROYECCIÓN URL ---
    function checkURL() {
        const params = new URLSearchParams(window.location.search);
        const desc = params.get('desc');
        const amt = parseFloat(params.get('amt'));
        const cat = params.get('cat');

        if (desc && !isNaN(amt)) {
            transactions.push({ desc: decodeURIComponent(desc), amt, cat: cat || 'Egresos' });
            const notify = document.getElementById('notification-area');
            notify.innerHTML = `<div class="url-alert">✨ Información proyectada cargada</div>`;
            setTimeout(() => notify.innerHTML = '', 4000);
            window.history.replaceState({}, document.title, window.location.pathname);
            updateUI();
        }
    }

    // --- EVENTOS ---
    addBtn.onclick = () => {
        const desc = document.getElementById('desc').value;
        const amt = parseFloat(document.getElementById('amt').value);
        const cat = document.getElementById('cat').value;
        if(!desc || isNaN(amt)) return;
        transactions.push({ desc, amt, cat });
        updateUI();
        document.getElementById('desc').value = '';
        document.getElementById('amt').value = '';
    };

    clearBtn.onclick = () => { if(confirm("¿Borrar todo?")) { transactions = []; updateUI(); }};

    themeBtn.onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerText = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
    };

    // Zoom modal logic
    document.getElementById('lineBox').onclick = () => openZoom(lineChart);
    document.getElementById('pieBox').onclick = () => openZoom(pieChart);
    
    let zoomedChart;
    function openZoom(source) {
        modal.style.display = "block";
        if(zoomedChart) zoomedChart.destroy();
        const ctx = document.getElementById('zoomedChart').getContext('2d');
        zoomedChart = new Chart(ctx, {
            type: source.config.type,
            data: JSON.parse(JSON.stringify(source.data)),
            options: { ...source.options, maintainAspectRatio: false }
        });
    }

    document.querySelector('.close-modal').onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; };

    checkURL();
    updateUI();
});

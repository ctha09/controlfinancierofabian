document.addEventListener('DOMContentLoaded', () => {
    // Carga de datos con nueva versión de almacenamiento
    let transactions = JSON.parse(localStorage.getItem('finance_v7_data')) || [];
    let isDark = true;

    // Elementos del DOM
    const listEl = document.getElementById('list');
    const themeBtn = document.getElementById('themeBtn');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const balanceEl = document.getElementById('kpi-balance');
    const modal = document.getElementById('chartModal');
    
    // --- GRÁFICAS ---
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
        data: { labels: ['Comida', 'Ocio', 'Salud', 'Transporte', 'Otros'], datasets: [{ data: [0,0,0,0,0], backgroundColor: ['#fbbf24', '#3b82f6', '#f87171', '#10b981', '#94a3b8'], borderWidth: 0 }] },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } }
        }
    });

    // --- FUNCIONES ---
    function updateUI() {
        let balance = 0, income = 0, expenses = 0;
        let categories = { "Comida": 0, "Ocio": 0, "Salud": 0, "Transporte": 0, "Otros": 0 };
        let lineData = [], lineLabels = [];

        listEl.innerHTML = '';

        // Procesar transacciones
        transactions.forEach((t) => {
            if(t.cat === 'Ingreso') {
                balance += t.amt; income += t.amt;
            } else {
                balance -= t.amt; expenses += t.amt;
                categories[t.cat] !== undefined ? categories[t.cat] += t.amt : categories["Otros"] += t.amt;
            }

            lineData.push(balance);
            lineLabels.push(t.desc);

            // Crear elemento de lista de forma segura
            const item = document.createElement('div');
            item.className = 't-item';
            item.innerHTML = `
                <div style="flex-grow:1">
                    <strong style="display:block">${escapeHtml(t.desc)}</strong>
                    <span class="t-date">${t.date} • ${t.cat}</span>
                </div>
                <div style="text-align:right">
                    <span style="font-weight:800; color: ${t.cat === 'Ingreso' ? 'var(--success)' : 'var(--danger)'}">
                        ${t.cat === 'Ingreso' ? '+' : '-'}$${t.amt.toLocaleString()}
                    </span>
                    <button class="delete-btn" title="Eliminar" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>`;
            listEl.appendChild(item);
        });

        // Actualizar KPIs y color de alerta (Rojo si el balance < 0)
        balanceEl.innerText = `$${balance.toLocaleString()}`;
        balanceEl.classList.toggle('negative-balance', balance < 0);
        
        document.getElementById('kpi-in').innerText = `$${income.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${expenses.toLocaleString()}`;
        document.getElementById('count-msg').innerText = `${transactions.length} registros`;

        // Actualizar Gráficas
        lineChart.data.labels = lineLabels;
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();

        pieChart.data.datasets[0].data = Object.values(categories);
        pieChart.update();

        // Guardar en LocalStorage
        localStorage.setItem('finance_v7_data', JSON.stringify(transactions));
    }

    // Función para limpiar texto y evitar ataques XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Función global para borrar transacciones
    window.deleteTransaction = (id) => {
        if(confirm("¿Eliminar esta operación?")) {
            transactions = transactions.filter(t => t.id !== id);
            updateUI();
        }
    };

    // --- EVENTOS ---
    addBtn.addEventListener('click', () => {
        const descInput = document.getElementById('desc');
        const amtInput = document.getElementById('amt');
        const catInput = document.getElementById('cat');

        const desc = descInput.value.trim();
        const amt = parseFloat(amtInput.value);
        const cat = catInput.value;

        if(!desc || isNaN(amt) || amt <= 0) return alert("Por favor, ingresa una descripción y un monto válido.");

        const newTransaction = {
            id: Date.now(), // ID único basado en tiempo
            desc,
            amt,
            cat,
            date: new Date().toLocaleDateString() // Fecha automática
        };

        transactions.push(newTransaction);
        updateUI();

        // Limpiar inputs
        descInput.value = '';
        amtInput.value = '';
    });

    clearBtn.addEventListener('click', () => {
        if(confirm("¿Estás completamente seguro de borrar TODO el historial?")) {
            transactions = [];
            updateUI();
        }
    });

    themeBtn.addEventListener('click', () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerText = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
        updateUI();
    });

    // Lógica de Zoom
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

    document.getElementById('lineBox').onclick = () => openZoom(lineChart);
    document.getElementById('pieBox').onclick = () => openZoom(pieChart);
    document.querySelector('.close-modal').onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; };

    // Inicio de la App
    updateUI();
});

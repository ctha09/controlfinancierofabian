document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];
    let isDark = true;

    // Elementos
    const themeBtn = document.getElementById('themeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const addBtn = document.getElementById('addBtn');
    const listEl = document.getElementById('list');

    // CONFIGURACIÓN DE GRÁFICOS
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
            labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Gastos Pers.', 'Proveedores'], 
            datasets: [{ 
                data: [0,0,0,0,0], 
                backgroundColor: ['#f43f5e', '#fbbf24', '#3b82f6', '#10b981', '#a855f7'],
                borderWidth: 0 
            }] 
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    function updateUI() {
        let balance = 0, inc = 0, exp = 0, prov = 0;
        let stats = { "Egresos": 0, "Compra de Mercaderia": 0, "Compra de Inmuebles": 0, "Gastos Personales": 0, "Proveedores": 0 };
        
        listEl.innerHTML = '';
        const mainCats = ["Ingresos Reales", "Ingresos Teoricos", "Egresos", "Compra de Mercaderia", "Compra de Inmuebles", "Gastos Personales"];

        transactions.forEach((t) => {
            const isIncome = (t.cat === 'Ingresos Reales' || t.cat === 'Ingresos Teoricos');
            if (isIncome) {
                balance += t.amt; inc += t.amt;
            } else {
                balance -= t.amt; exp += t.amt;
                if (!mainCats.includes(t.cat)) {
                    prov += t.amt; stats["Proveedores"] += t.amt;
                } else {
                    stats[t.cat] += t.amt;
                }
            }

            // Lista visual
            const item = document.createElement('div');
            item.className = 't-item';
            item.innerHTML = `<span>${t.desc}<br><small>${t.cat}</small></span>
                <span style="color:${isIncome?'#10b981':'#f43f5e'}">${isIncome?'+':'-'}$${t.amt}</span>`;
            listEl.prepend(item);
        });

        // Actualizar Números
        document.getElementById('kpi-balance').innerText = `$${balance.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${inc.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${exp.toLocaleString()}`;
        document.getElementById('kpi-providers').innerText = `$${prov.toLocaleString()}`;

        // Actualizar Gráfico Circular
        pieChart.data.datasets[0].data = [
            stats["Egresos"], 
            stats["Compra de Mercaderia"], 
            stats["Compra de Inmuebles"], 
            stats["Gastos Personales"], 
            stats["Proveedores"]
        ];
        pieChart.update();

        // Actualizar Gráfico de Líneas
        lineChart.data.labels = transactions.map(t => t.date);
        lineChart.data.datasets[0].data = transactions.map((_, i) => {
            return transactions.slice(0, i+1).reduce((acc, curr) => {
                const isInc = curr.cat.includes("Ingresos");
                return acc + (isInc ? curr.amt : -curr.amt);
            }, 0);
        });
        lineChart.update();

        localStorage.setItem('finance_v8_data', JSON.stringify(transactions));
    }

    // EVENTOS DE BOTONES
    addBtn.onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || !a.value) return;
        transactions.push({ id: Date.now(), desc: d.value, amt: parseFloat(a.value), cat: c.value, date: new Date().toLocaleDateString() });
        updateUI();
        d.value = ''; a.value = '';
    };

    clearBtn.onclick = () => {
        if(confirm("¿Estás seguro de borrar todo el historial?")) {
            transactions = [];
            updateUI();
        }
    };

    themeBtn.onclick = () => {
        isDark = !isDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeBtn.innerText = isDark ? '🌙 MODO OSCURO' : '☀️ MODO CLARO';
    };

    updateUI();
});

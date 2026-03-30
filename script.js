document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];

    const listEl = document.getElementById('list');
    const modal = document.getElementById('provModal');

    // Gráficos básicos para estabilizar la vista
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { labels: ['Egresos', 'Mercadería', 'Inmuebles', 'Gastos Pers.', 'Proveedores'], datasets: [{ data: [0,0,0,0,0], backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#a855f7'], borderWidth: 0 }] },
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
            item.innerHTML = `<span><strong>${t.desc}</strong><br><small>${t.cat}</small></span>
                              <span style="color:${isInc?'#10b981':'#f43f5e'}">${isInc?'+':'-'}$${t.amt}</span>`;
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

    // Manejo de Modal
    document.getElementById('openProvModal').onclick = () => { modal.style.display = "block"; };
    document.getElementById('closeBtn').onclick = () => { modal.style.display = "none"; };

    document.getElementById('addBtn').onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || !a.value) return;
        transactions.push({ id: Date.now(), desc: d.value, amt: parseFloat(a.value), cat: c.value, date: new Date().toLocaleDateString() });
        updateUI(); d.value = ''; a.value = '';
    };

    updateUI();
});

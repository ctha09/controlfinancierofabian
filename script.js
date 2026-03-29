document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];

    const listEl = document.getElementById('list');
    const balanceEl = document.getElementById('kpi-balance');
    const incomeEl = document.getElementById('kpi-in');
    const expenseEl = document.getElementById('kpi-out');
    const providerEl = document.getElementById('kpi-providers');

    // Inicialización de Gráficos (Simplicado para este bloque)
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Balance', data: [], borderColor: '#6366f1', tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    function updateUI() {
        let balance = 0, income = 0, totalExpenses = 0, providersSum = 0;
        listEl.innerHTML = '';

        // Definimos cuáles son las categorías que NO son proveedores
        const mainCategories = ["Ingresos Reales", "Ingresos Teoricos", "Egresos", "Compra de Mercaderia", "Compra de Inmuebles", "Gastos Personales"];

        transactions.forEach((t) => {
            const isIncome = (t.cat === 'Ingresos Reales' || t.cat === 'Ingresos Teoricos');
            
            if (isIncome) {
                balance += t.amt;
                income += t.amt;
            } else {
                balance -= t.amt;
                totalExpenses += t.amt;
                
                // Si la categoría NO está en la lista principal, es un Proveedor
                if (!mainCategories.includes(t.cat)) {
                    providersSum += t.amt;
                }
            }

            // Agregar al historial visual
            const item = document.createElement('div');
            item.className = 't-item';
            item.innerHTML = `
                <div><strong>${t.desc}</strong><br><small>${t.date} • ${t.cat}</small></div>
                <div style="text-align:right">
                    <span style="color: ${isIncome ? '#10b981' : '#f43f5e'}; font-weight:800">
                        ${isIncome ? '+' : '-'}$${t.amt.toLocaleString()}
                    </span>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>`;
            listEl.prepend(item);
        });

        // ACTUALIZACIÓN DE LOS 4 CUADROS EN TIEMPO REAL
        balanceEl.innerText = `$${balance.toLocaleString()}`;
        incomeEl.innerText = `$${income.toLocaleString()}`;
        expenseEl.innerText = `$${totalExpenses.toLocaleString()}`;
        providerEl.innerText = `$${providersSum.toLocaleString()}`;

        localStorage.setItem('finance_v8_data', JSON.stringify(transactions));
        
        // Actualizar gráfico de líneas
        lineChart.data.labels = transactions.map(t => t.desc);
        lineChart.data.datasets[0].data = transactions.map((_, i) => {
            let sub = 0;
            for(let j=0; j<=i; j++) {
                const isIn = (transactions[j].cat === 'Ingresos Reales' || transactions[j].cat === 'Ingresos Teoricos');
                sub += isIn ? transactions[j].amt : -transactions[j].amt;
            }
            return sub;
        });
        lineChart.update();
    }

    document.getElementById('addBtn').onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || !a.value) return alert("Por favor, completa descripción y monto.");
        
        transactions.push({ 
            id: Date.now(), 
            desc: d.value, 
            amt: parseFloat(a.value), 
            cat: c.value, 
            date: new Date().toLocaleDateString() 
        });
        
        updateUI();
        d.value = ''; a.value = '';
    };

    window.deleteTransaction = (id) => {
        transactions = transactions.filter(t => t.id !== id);
        updateUI();
    };

    updateUI();
});

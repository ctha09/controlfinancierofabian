document.addEventListener('DOMContentLoaded', () => {

    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];

    const listEl = document.getElementById('list');
    const modal = document.getElementById('provModal');
    const modalList = document.getElementById('modalBodyList');
    const modalDetail = document.getElementById('modalBodyDetail');
    const detList = document.getElementById('detList');
    const detName = document.getElementById('detName');

    let lineChart, pieChart;

    function updateUI() {
        let bal = 0, inc = 0, exp = 0, provTotal = 0;
        listEl.innerHTML = '';

        const providerData = {};

        transactions.forEach(t => {
            const isInc = t.cat.startsWith("Ingresos");

            if (isInc) {
                bal += t.amt;
                inc += t.amt;
            } else {
                bal -= t.amt;
                exp += t.amt;

                if (!t.cat.includes("Egresos")) {
                    provTotal += t.amt;
                    providerData[t.cat] = (providerData[t.cat] || 0) + t.amt;
                }
            }

            const item = document.createElement('div');
            item.className = 't-item';
            item.innerHTML = `
                <div>
                    <strong>${t.desc}</strong><br>
                    <small style="color:var(--text-muted)">
                        ${t.cat} • ${t.date}
                    </small>
                </div>
                <span style="color:${isInc?'var(--success)':'var(--danger)'}; font-weight:800">
                    $${t.amt.toLocaleString()}
                </span>
            `;
            listEl.prepend(item);
        });

        // KPIs
        document.getElementById('kpi-balance').innerText = `$${bal.toLocaleString()}`;
        document.getElementById('kpi-in').innerText = `$${inc.toLocaleString()}`;
        document.getElementById('kpi-out').innerText = `$${exp.toLocaleString()}`;
        document.getElementById('kpi-providers').innerText = `$${provTotal.toLocaleString()}`;

        localStorage.setItem('finance_v8_data', JSON.stringify(transactions));

        renderCharts(inc, exp, providerData);
        renderProviders(providerData);
    }

    // ✅ AGREGAR TRANSACCIÓN
    document.getElementById('addBtn').onclick = () => {
        const d = document.getElementById('desc');
        const a = document.getElementById('amt');
        const c = document.getElementById('cat');

        const amount = parseFloat(a.value);

        if (!d.value || isNaN(amount) || amount <= 0) {
            alert("Datos inválidos");
            return;
        }

        transactions.push({
            desc: d.value,
            amt: amount,
            cat: c.value,
            date: new Date().toLocaleDateString()
        });

        d.value = '';
        a.value = '';
        c.selectedIndex = 0;
        d.focus();

        updateUI();
    };

    // ✅ LIMPIAR
    document.getElementById('clearBtn').onclick = () => {
        if (confirm("¿Borrar todo?")) {
            transactions = [];
            updateUI();
        }
    };

    // ✅ MODO OSCURO
    document.getElementById('themeBtn').onclick = () => {
        const html = document.documentElement;
        const theme = html.getAttribute('data-theme');

        html.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
    };

    // ✅ GRÁFICOS
    function renderCharts(inc, exp, providers) {
        if (lineChart) lineChart.destroy();
        if (pieChart) pieChart.destroy();

        const ctx1 = document.getElementById('lineChart');
        const ctx2 = document.getElementById('pieChart');

        lineChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Egresos'],
                datasets: [{
                    data: [inc, exp]
                }]
            }
        });

        pieChart = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: Object.keys(providers),
                datasets: [{
                    data: Object.values(providers)
                }]
            }
        });
    }

    // ✅ PROVEEDORES
    function renderProviders(providers) {
        modalList.innerHTML = '';

        Object.entries(providers).forEach(([name, total]) => {
            const div = document.createElement('div');
            div.className = 't-item';
            div.innerHTML = `
                <span>${name}</span>
                <strong>$${total.toLocaleString()}</strong>
            `;

            div.onclick = () => showProviderDetail(name);
            modalList.appendChild(div);
        });
    }

    function showProviderDetail(name) {
        modalList.style.display = 'none';
        modalDetail.style.display = 'block';
        detName.innerText = name;
        detList.innerHTML = '';

        transactions
            .filter(t => t.cat === name)
            .forEach(t => {
                const div = document.createElement('div');
                div.className = 't-item';
                div.innerHTML = `${t.desc} - $${t.amt}`;
                detList.appendChild(div);
            });
    }

    // MODAL
    document.getElementById('openProvModal').onclick = () => {
        modal.style.display = 'flex';
    };

    document.getElementById('closeBtn').onclick = () => {
        modal.style.display = 'none';
    };

    document.getElementById('backBtn').onclick = () => {
        modalList.style.display = 'block';
        modalDetail.style.display = 'none';
    };

    updateUI();
});

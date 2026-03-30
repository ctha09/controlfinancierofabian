document.addEventListener('DOMContentLoaded', () => {

    let transactions = JSON.parse(localStorage.getItem('data')) || [];

    const list = document.getElementById('list');
    const modal = document.getElementById('provModal');
    const modalList = document.getElementById('modalBodyList');

    let lineChart, pieChart;

    function updateUI() {
        let bal = 0, inc = 0, exp = 0, providers = {};

        list.innerHTML = '';

        transactions.forEach(t => {
            if (t.cat.includes("Ingresos")) {
                bal += t.amt;
                inc += t.amt;
            } else {
                bal -= t.amt;
                exp += t.amt;

                if (t.cat !== "Egresos") {
                    providers[t.cat] = (providers[t.cat] || 0) + t.amt;
                }
            }

            const div = document.createElement('div');
            div.className = 't-item';
            div.innerHTML = `${t.desc} <b>$${t.amt}</b>`;
            list.prepend(div);
        });

        document.getElementById('kpi-balance').innerText = bal;
        document.getElementById('kpi-in').innerText = inc;
        document.getElementById('kpi-out').innerText = exp;
        document.getElementById('kpi-providers').innerText =
            Object.values(providers).reduce((a,b)=>a+b,0);

        localStorage.setItem('data', JSON.stringify(transactions));

        drawCharts(inc, exp, providers);
        drawProviders(providers);
    }

    document.getElementById('addBtn').onclick = () => {
        const desc = document.getElementById('desc').value;
        const amt = parseFloat(document.getElementById('amt').value);
        const cat = document.getElementById('cat').value;

        if (!desc || !amt) return alert("Completa los datos");

        transactions.push({desc, amt, cat});
        updateUI();
    };

    document.getElementById('clearBtn').onclick = () => {
        transactions = [];
        updateUI();
    };

    document.getElementById('themeBtn').onclick = () => {
        document.body.style.background =
            document.body.style.background === "white" ? "#0f172a" : "white";
    };

    function drawCharts(inc, exp, providers) {
        if (lineChart) lineChart.destroy();
        if (pieChart) pieChart.destroy();

        lineChart = new Chart(document.getElementById('lineChart'), {
            type: 'bar',
            data: {
                labels: ['Ingresos','Egresos'],
                datasets: [{ data: [inc, exp] }]
            }
        });

        pieChart = new Chart(document.getElementById('pieChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(providers),
                datasets: [{ data: Object.values(providers) }]
            }
        });
    }

    function drawProviders(providers) {
        modalList.innerHTML = '';

        Object.entries(providers).forEach(([name,total]) => {
            const div = document.createElement('div');
            div.className = 't-item';
            div.innerHTML = `${name} <b>$${total}</b>`;
            modalList.appendChild(div);
        });
    }

    document.getElementById('openProvModal').onclick = () => {
        modal.style.display = 'flex';
    };

    document.getElementById('closeBtn').onclick = () => {
        modal.style.display = 'none';
    };

    updateUI();
});

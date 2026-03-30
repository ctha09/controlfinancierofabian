document.addEventListener('DOMContentLoaded', () => {
    let transactions = JSON.parse(localStorage.getItem('finance_v8_data')) || [];
    const listEl = document.getElementById('list');

    function updateUI() {
        let bal = 0;
        listEl.innerHTML = '';
        
        transactions.forEach(t => {
            const isInc = t.cat.includes("Ingresos");
            bal += isInc ? t.amt : -t.amt;

            const item = document.createElement('div');
            item.style = "display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05)";
            item.innerHTML = `<span>${t.desc}</span><span style="color:${isInc?'#10b981':'#f43f5e'}">$${t.amt}</span>`;
            listEl.prepend(item);
        });

        document.getElementById('kpi-balance').innerText = `$${bal.toLocaleString()}`;
        localStorage.setItem('finance_v8_data', JSON.stringify(transactions));
    }

    document.getElementById('addBtn').onclick = () => {
        const d = document.getElementById('desc'), a = document.getElementById('amt'), c = document.getElementById('cat');
        if(!d.value || !a.value) return;
        transactions.push({ desc: d.value, amt: parseFloat(a.value), cat: c.value, date: new Date().toLocaleDateString() });
        updateUI(); 
        d.value = ''; a.value = '';
    };

    document.getElementById('clearBtn').onclick = () => {
        if(confirm("¿Seguro quieres borrar todo?")) {
            transactions = [];
            updateUI();
        }
    };

    updateUI();
});

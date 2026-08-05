/**
 * File: pagamenti.js
 * Gestisce la visualizzazione dei saldi e dei pagamenti (Solo debitori > 0€).
 * Include la possibilità di segnare il pagamento ricevuto.
 */

const PAGATI_LOCAL_KEY = 'excel_pagamenti_ricevuti';

function ottieniPagatiLocal() {
  const dati = localStorage.getItem(PAGATI_LOCAL_KEY);
  return dati ? JSON.parse(dati) : [];
}

function togglePagato(nome) {
  let pagati = ottieniPagatiLocal();
  if (pagati.includes(nome)) {
    pagati = pagati.filter(n => n !== nome);
  } else {
    pagati.push(nome);
  }
  localStorage.setItem(PAGATI_LOCAL_KEY, JSON.stringify(pagati));
  apriPagamenti(); // Rinfresca la lista per spostare la riga
}

function apriPagamenti() {
  const modal = document.getElementById('pagamentiModal');
  const listContainer = document.getElementById('pagamentiList');
  const totalRimanenteEl = document.getElementById('totalRimanente');

  if (!modal || !listContainer) return;

  const dati = typeof datiInMemoria !== 'undefined' ? datiInMemoria : [];
  const pagatiSessione = ottieniPagatiLocal();

  let sommaDaIncassare = 0;
  let debitoriTotali = [];

  // 1. Filtriamo e puliamo i dati
  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const saldoTesto = String(riga['SALDO'] || '0').trim();
    const isTotale = !nome || String(riga['PAX']).includes('###');

    if (isTotale || !nome) return;

    const saldoPulito = saldoTesto.replace(/[^\d,.-]/g, '').replace(',', '.');
    const saldoNum = parseFloat(saldoPulito) || 0;

    if (saldoNum >= 1 && !saldoTesto.toUpperCase().includes('SALDATO')) {
      debitoriTotali.push({ nome, saldoTesto, saldoNum });
      // Contiamo nel totale solo quelli NON ancora smarcati come "Pagati" in sessione
      if (!pagatiSessione.includes(nome)) {
        sommaDaIncassare += saldoNum;
      }
    }
  });

  // 2. Ordiniamo: quelli NON pagati in cima, quelli PAGATI in fondo
  debitoriTotali.sort((a, b) => {
    const aPagato = pagatiSessione.includes(a.nome);
    const bPagato = pagatiSessione.includes(b.nome);
    if (!aPagato && bPagato) return -1;
    if (aPagato && !bPagato) return 1;
    return 0;
  });

  // 3. Generiamo l'HTML con il quadratino
  const html = debitoriTotali.map(d => {
    const isPagato = pagatiSessione.includes(d.nome);
    const rowClass = isPagato ? 'pagamento-item pagato-fatto' : 'pagamento-item';

    return `
      <div class="${rowClass}">
        <div class="col-check-pago">
          <button class="btn-segna-pago ${isPagato ? 'is-saldato' : 'is-debito'}" onclick="togglePagato('${d.nome.replace(/'/g, "\\'")}'); event.stopPropagation();">
            ${isPagato ? 'Saldato' : 'Segna'}
          </button>
        </div>
        <div class="pagamento-nome" style="flex:1;">${d.nome}</div>
        <div class="pagamento-saldo ${isPagato ? 'pago-ok' : 'pago-no'}">${d.saldoTesto}</div>
      </div>
    `;
  }).join('');

  if (debitoriTotali.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#059669; font-weight:bold;">Tutti i passeggeri hanno saldato! ✅</p>';
  } else {
    listContainer.innerHTML = html;
  }

  if (totalRimanenteEl) {
    totalRimanenteEl.textContent = `Ancora da incassare: ${sommaDaIncassare.toFixed(2)}€`;
  }

  modal.classList.add('active');
}

function chiudiPagamentiModal() {
  const modal = document.getElementById('pagamentiModal');
  if (modal) modal.classList.remove('active');
}

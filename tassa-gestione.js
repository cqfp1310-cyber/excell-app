/**
 * File: tassa-gestione.js
 * Gestisce la riscossione della Tassa (Rosso: Da pagare, Verde: Pagato)
 */

const TASSA_LOCAL_KEY = 'excel_tassa_pagata';

function ottieniTassaPagata() {
  const dati = localStorage.getItem(TASSA_LOCAL_KEY);
  return dati ? JSON.parse(dati) : [];
}

function toggleTassa(nome) {
  let pagati = ottieniTassaPagata();
  if (pagati.includes(nome)) {
    pagati = pagati.filter(n => n !== nome);
  } else {
    pagati.push(nome);
  }
  localStorage.setItem(TASSA_LOCAL_KEY, JSON.stringify(pagati));
  apriTassaGestione(); // Rinfresca la lista interna
  if (typeof mostraLista === 'function') mostraLista(); // Aggiorna lista principale
}

function apriTassaGestione() {
  const modal = document.getElementById('tassaModal');
  const listContainer = document.getElementById('tassaList');
  const counterBox = document.getElementById('tassaCounter');

  if (!modal || !listContainer) return;

  const dati = window.datiInMemoria || [];
  const pagati = ottieniTassaPagata();

  let contOk = 0;
  let contNo = 0;
  let passeggeriReali = [];

  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nome.toUpperCase().includes('AUTISTA') || nome.toUpperCase().includes('ACCOMPAGNATORE');

    if (nome && !isTotale && !isStaff) {
      passeggeriReali.push(nome);
      if (pagati.includes(nome)) contOk++;
      else contNo++;
    }
  });

  // Ordine: Da pagare (Rosso) in cima, Pagati (Verde) in fondo
  passeggeriReali.sort((a, b) => {
    const aIn = pagati.includes(a);
    const bIn = pagati.includes(b);
    if (!aIn && bIn) return -1;
    if (aIn && !bIn) return 1;
    return a.localeCompare(b);
  });

  const html = passeggeriReali.map(nome => {
    const isDone = pagati.includes(nome);
    return `
      <div class="pagamento-item ${isDone ? 'pagato-fatto' : ''}">
        <div class="col-check-pago">
          <button class="btn-segna-pago ${isDone ? 'is-saldato' : 'is-debito'}" onclick="toggleTassa('${nome.replace(/'/g, "\\'")}'); event.stopPropagation();">
            ${isDone ? 'PAGATA' : 'DA PAGARE'}
          </button>
        </div>
        <div class="pagamento-nome" style="flex:1;">${nome}</div>
      </div>
    `;
  }).join('');

  listContainer.innerHTML = html;

  if (counterBox) {
    counterBox.innerHTML = `
      <div style="display:flex; justify-content:space-around; align-items:center; padding:10px; background:#1e293b; color:white; border-radius:10px; margin-bottom:15px;">
        <div style="text-align:center;"><span style="color:#4ade80; font-size:20px; font-weight:900;">${contOk}</span><br><small>PAGATI</small></div>
        <div style="text-align:center; border-left:1px solid #475569; border-right:1px solid #475569; padding:0 20px;"><span style="color:#94a3b8; font-size:16px;">${passeggeriReali.length}</span><br><small>TOTALE</small></div>
        <div style="text-align:center;"><span style="color:#f87171; font-size:20px; font-weight:900;">${contNo}</span><br><small>DA PAGARE</small></div>
      </div>
    `;
  }
  modal.classList.add('active');
}

function chiudiTassaModal() {
  const modal = document.getElementById('tassaModal');
  if (modal) modal.classList.remove('active');
}

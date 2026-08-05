/**
 * File: postazioni-gestione.js
 * Gestisce le Postazioni (Rosso: Da fare, Verde: Fatto)
 */

const POSTO_LOCAL_KEY = 'excel_postazioni_assegnate';

function ottieniPostazioniAssegnate() {
  const dati = localStorage.getItem(POSTO_LOCAL_KEY);
  return dati ? JSON.parse(dati) : [];
}

function togglePostazione(nome) {
  let assegnati = ottieniPostazioniAssegnate();
  if (assegnati.includes(nome)) {
    assegnati = assegnati.filter(n => n !== nome);
  } else {
    assegnati.push(nome);
  }
  localStorage.setItem(POSTO_LOCAL_KEY, JSON.stringify(assegnati));
  apriPostazioniGestione();
  if (typeof mostraLista === 'function') mostraLista();
}

function apriPostazioniGestione() {
  const modal = document.getElementById('postazioniModal');
  const listContainer = document.getElementById('postazioniList');
  const counterBox = document.getElementById('postazioniCounter');

  if (!modal || !listContainer) return;

  const dati = window.datiInMemoria || [];
  const assegnati = ottieniPostazioniAssegnate();

  let contOk = 0;
  let contNo = 0;
  let passeggeriReali = [];

  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nome.toUpperCase().includes('AUTISTA') || nome.toUpperCase().includes('ACCOMPAGNATORE');

    if (nome && !isTotale && !isStaff) {
      passeggeriReali.push(nome);
      if (assegnati.includes(nome)) contOk++;
      else contNo++;
    }
  });

  passeggeriReali.sort((a, b) => {
    const aIn = assegnati.includes(a);
    const bIn = assegnati.includes(b);
    if (!aIn && bIn) return -1;
    if (aIn && !bIn) return 1;
    return a.localeCompare(b);
  });

  const html = passeggeriReali.map(nome => {
    const isDone = assegnati.includes(nome);
    return `
      <div class="pagamento-item ${isDone ? 'pagato-fatto' : ''}">
        <div class="col-check-pago">
          <button class="btn-segna-pago ${isDone ? 'is-saldato' : 'is-debito'}" onclick="togglePostazione('${nome.replace(/'/g, "\\'")}'); event.stopPropagation();">
            ${isDone ? 'OK' : 'DA FARE'}
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
        <div style="text-align:center;"><span style="color:#4ade80; font-size:20px; font-weight:900;">${contOk}</span><br><small>FATTO</small></div>
        <div style="text-align:center; border-left:1px solid #475569; border-right:1px solid #475569; padding:0 20px;"><span style="color:#94a3b8; font-size:16px;">${passeggeriReali.length}</span><br><small>TOTALE</small></div>
        <div style="text-align:center;"><span style="color:#f87171; font-size:20px; font-weight:900;">${contNo}</span><br><small>DA FARE</small></div>
      </div>
    `;
  }
  modal.classList.add('active');
}

function chiudiPostazioniModal() {
  const modal = document.getElementById('postazioniModal');
  if (modal) modal.classList.remove('active');
}

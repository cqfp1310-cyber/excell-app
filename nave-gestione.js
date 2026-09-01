/**
 * File: nave-gestione.js
 * Gestione Imbarco Nave
 */

const NAVE_LOCAL_KEY = 'excel_nave_checkin';

function ottieniNaveDati() {
  const dati = localStorage.getItem(NAVE_LOCAL_KEY);
  return dati ? JSON.parse(dati) : {};
}

function toggleNave(nome) {
  let naveDati = ottieniNaveDati();

  if (naveDati[nome] !== undefined) {
    // Se è già presente, lo rimuoviamo
    delete naveDati[nome];
  } else {
    // Segniamo come imbarcato (senza chiedere PAX)
    naveDati[nome] = true;
  }

  localStorage.setItem(NAVE_LOCAL_KEY, JSON.stringify(naveDati));
  aggiornaUINave();
}

function apriNaveGestione() {
  aggiornaUINave();
  const modal = document.getElementById('naveModal');
  if (modal) modal.classList.add('active');
}

function aggiornaUINave() {
  const listContainer = document.getElementById('naveList');
  const counterBox = document.getElementById('naveCounter');
  if (!listContainer) return;

  const dati = window.datiInMemoria || [];
  const naveDati = ottieniNaveDati();
  let passeggeriReali = [];

  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const tel = (riga['TELEFONO'] || '').trim();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nome.toUpperCase().includes('AUTISTA') || nome.toUpperCase().includes('ACCOMPAGNATORE');

    // Filtriamo: solo chi è presente (chi "si vede")
    const stati = typeof window.ottieniStatiPersona === 'function' ? window.ottieniStatiPersona(nome) : [];
    const isPresente = stati.includes('Presenza');

    if (nome && !isTotale && !isStaff && isPresente) {
      passeggeriReali.push({ nome, tel });
    }
  });

  let contImbarcati = 0;
  passeggeriReali.forEach(p => {
    if (naveDati[p.nome] !== undefined) {
      contImbarcati++;
    }
  });

  // Ordine: Da imbarcare in cima
  passeggeriReali.sort((a, b) => {
    const aDone = naveDati[a.nome] !== undefined;
    const bDone = naveDati[b.nome] !== undefined;
    if (!aDone && bDone) return -1;
    if (aDone && !bDone) return 1;
    return a.nome.localeCompare(b.nome);
  });

  if (counterBox) {
    counterBox.innerHTML = `
      <div style="display:flex; justify-content:space-around; align-items:center; padding:12px; background:#0f172a; color:white; border-radius:12px; margin-bottom:15px; border: 1px solid #334155;">
        <div style="text-align:center;">
          <span style="color:#22c55e; font-size:20px; font-weight:900;">${contImbarcati}</span><br>
          <small style="color:#94a3b8; font-size:10px; text-transform:uppercase;">IMBARCATI</small>
        </div>
        <div style="text-align:center; border-left:1px solid #334155; padding:0 20px;">
          <span style="color:#e2e8f0; font-size:20px; font-weight:900;">${passeggeriReali.length}</span><br>
          <small style="color:#94a3b8; font-size:10px; text-transform:uppercase;">TOTALI PRESENTI</small>
        </div>
      </div>
    `;
  }

  const html = passeggeriReali.map(p => {
    const isDone = naveDati[p.nome] !== undefined;
    return `
      <div class="pagamento-item ${isDone ? 'pagato-fatto' : ''}">
        <div class="col-check-pago">
          <button class="btn-segna-pago ${isDone ? 'is-saldato' : 'is-debito'}" onclick="toggleNave('${p.nome.replace(/'/g, "\\'")}'); event.stopPropagation();">
            ${isDone ? 'IMBARCATO' : 'DA IMBARC.'}
          </button>
        </div>
        <div class="pagamento-nome" style="flex:1;">
          ${p.nome}
          <div style="font-size:12px; color:#2563eb; font-weight:bold;">${p.tel || 'Senza telefono'}</div>
        </div>
      </div>
    `;
  }).join('');

  listContainer.innerHTML = html || '<p style="text-align:center; padding:20px;">Carica un file per vedere i nomi.</p>';

  // Se vogliamo che la lista principale si aggiorni subito
  if (typeof mostraLista === 'function') mostraLista();
}

function chiudiNaveModal() {
  const modal = document.getElementById('naveModal');
  if (modal) modal.classList.remove('active');
}

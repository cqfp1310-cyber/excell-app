/**
 * File: nave-gestione.js
 * Gestione Imbarco Nave
 */

const NAVE_LOCAL_KEY = 'excel_nave_checkin';

function ottieniNaveDati() {
  const dati = localStorage.getItem(NAVE_LOCAL_KEY);
  return dati ? JSON.parse(dati) : {};
}

function toggleNave(nome, defaultPax) {
  let naveDati = ottieniNaveDati();

  if (naveDati[nome] !== undefined) {
    // Se è già presente, lo rimuoviamo
    delete naveDati[nome];
  } else {
    // Chiediamo il numero di passeggeri
    const input = prompt(`Quanti passeggeri imbarcare per ${nome}?`, defaultPax);
    if (input === null) return;

    const num = parseInt(input);
    if (isNaN(num) || num < 0) {
      alert("Inserisci un numero valido.");
      return;
    }
    naveDati[nome] = num;
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
    const paxPrevisti = parseInt(riga['PAX']) || 0;
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nome.toUpperCase().includes('AUTISTA') || nome.toUpperCase().includes('ACCOMPAGNATORE');

    if (nome && !isTotale && !isStaff) {
      passeggeriReali.push({ nome, paxPrevisti });
    }
  });

  let contImbarcati = 0;
  let paxTotaliPrevisti = 0;
  let paxTotaliEffettivi = 0;

  passeggeriReali.forEach(p => {
    paxTotaliPrevisti += p.paxPrevisti;
    if (naveDati[p.nome] !== undefined) {
      contImbarcati++;
      paxTotaliEffettivi += naveDati[p.nome];
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
          <span style="color:#22c55e; font-size:20px; font-weight:900;">${paxTotaliEffettivi}</span><br>
          <small style="color:#94a3b8; font-size:10px; text-transform:uppercase;">PAX A BORDO</small>
        </div>
        <div style="text-align:center; border-left:1px solid #334155; border-right:1px solid #334155; padding:0 15px;">
          <span style="color:#e2e8f0; font-size:18px; font-weight:700;">${paxTotaliPrevisti}</span><br>
          <small style="color:#94a3b8; font-size:10px; text-transform:uppercase;">PAX PREVISTI</small>
        </div>
        <div style="text-align:center;">
          <span style="color:#38bdf8; font-size:20px; font-weight:900;">${contImbarcati}/${passeggeriReali.length}</span><br>
          <small style="color:#94a3b8; font-size:10px; text-transform:uppercase;">GRUPPI</small>
        </div>
      </div>
    `;
  }

  const html = passeggeriReali.map(p => {
    const numImbarcati = naveDati[p.nome];
    const isDone = numImbarcati !== undefined;
    return `
      <div class="pagamento-item ${isDone ? 'pagato-fatto' : ''}">
        <div class="col-check-pago">
          <button class="btn-segna-pago ${isDone ? 'is-saldato' : 'is-debito'}" onclick="toggleNave('${p.nome.replace(/'/g, "\\'")}', ${p.paxPrevisti}); event.stopPropagation();">
            ${isDone ? 'IMBARCATO' : 'DA IMBARC.'}
          </button>
        </div>
        <div class="pagamento-nome" style="flex:1;">
          ${p.nome} <span style="font-size:12px; color:#64748b;">(${p.paxPrevisti} PAX)</span>
          ${isDone ? `<br><small style="color:#059669;">Confermati: <strong>${numImbarcati}</strong></small>` : ''}
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

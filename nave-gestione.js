/**
 * File: nave-gestione.js
 * Gestisce l'imbarco sulla Nave.
 * Permette di segnare quanti passeggeri effettivamente salgono per ogni gruppo.
 */

const NAVE_LOCAL_KEY = 'excel_nave_checkin';

function ottieniNaveDati() {
  const dati = localStorage.getItem(NAVE_LOCAL_KEY);
  return dati ? JSON.parse(dati) : {};
}

function toggleNave(nome, defaultPax) {
  let naveDati = ottieniNaveDati();

  if (naveDati[nome] !== undefined) {
    // Se è già presente, lo rimuoviamo (toggle off)
    delete naveDati[nome];
  } else {
    // Chiediamo conferma del numero di passeggeri
    const input = prompt(`Quanti passeggeri imbarcare per ${nome}?`, defaultPax);
    if (input === null) return; // Annullato

    const num = parseInt(input);
    if (isNaN(num) || num < 0) {
      alert("Inserisci un numero valido.");
      return;
    }
    naveDati[nome] = num;
  }

  localStorage.setItem(NAVE_LOCAL_KEY, JSON.stringify(naveDati));
  apriNaveGestione(); // Rinfresca la lista interna
  if (typeof mostraLista === 'function') mostraLista(); // Aggiorna lista principale
}

function apriNaveGestione() {
  const modal = document.getElementById('naveModal');
  const listContainer = document.getElementById('naveList');
  const counterBox = document.getElementById('naveCounter');

  if (!modal || !listContainer) return;

  const dati = window.datiInMemoria || [];
  const naveDati = ottieniNaveDati();

  let totaleImbarcati = 0;
  let totalePrevisti = 0;
  let gruppiImbarcati = 0;
  let passeggeriReali = [];

  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const paxPrevisti = parseInt(riga['PAX']) || 0;
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nome.toUpperCase().includes('AUTISTA') || nome.toUpperCase().includes('ACCOMPAGNATORE');

    if (nome && !isTotale && !isStaff) {
      passeggeriReali.push({ nome, paxPrevisti });
      totalePrevisti += paxPrevisti;
      if (naveDati[nome] !== undefined) {
        totaleImbarcati += naveDati[nome];
        gruppiImbarcati++;
      }
    }
  });

  // Ordinamento: Imbarcati (Verde) in fondo, Da imbarcare in cima
  passeggeriReali.sort((a, b) => {
    const aIn = naveDati[a.nome] !== undefined;
    const bIn = naveDati[b.nome] !== undefined;
    if (!aIn && bIn) return -1;
    if (aIn && !bIn) return 1;
    return a.nome.localeCompare(b.nome);
  });

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

  if (counterBox) {
    counterBox.innerHTML = `
      <div style="display:flex; justify-content:space-around; align-items:center; padding:10px; background:#0ea5e9; color:white; border-radius:10px; margin-bottom:15px;">
        <div style="text-align:center;"><span style="color:#ffffff; font-size:20px; font-weight:900;">${totaleImbarcati}</span><br><small>IMBARCATI</small></div>
        <div style="text-align:center; border-left:1px solid #7dd3fc; border-right:1px solid #7dd3fc; padding:0 20px;"><span style="color:#e0f2fe; font-size:16px;">${totalePrevisti}</span><br><small>PREVISTI</small></div>
        <div style="text-align:center;"><span style="color:#ffffff; font-size:20px; font-weight:900;">${gruppiImbarcati}</span><br><small>GRUPPI</small></div>
      </div>
    `;
  }

  modal.classList.add('active');
}

function chiudiNaveModal() {
  const modal = document.getElementById('naveModal');
  if (modal) modal.classList.remove('active');
}

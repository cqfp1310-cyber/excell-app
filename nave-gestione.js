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

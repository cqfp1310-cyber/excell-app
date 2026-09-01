/**
 * File: ristorazione.js
 * Gestisce la visualizzazione di Tavoli e Intolleranze.
 */

function apriSceltaRistorazione() {
  const modal = document.getElementById('ristorazioneChoiceModal');
  if (modal) modal.classList.add('active');
}

function scegliRistorazione(tipo) {
  chiudiRistorazioneChoiceModal();

  if (tipo === 'tavoli') {
    mostraElencoTavoli();
  } else if (tipo === 'intolleranze') {
    mostraElencoIntolleranze();
  }
}

let personeSelezionateTavoli = [];
let modoSpostaAttivo = false;

function mostraElencoTavoli() {
  const modal = document.getElementById('ristorazioneResultModal');
  const title = document.getElementById('ristorazioneResultTitle');
  const listContainer = document.getElementById('ristorazioneResultList');

  if (!modal || !listContainer) return;

  const dati = typeof datiInMemoria !== 'undefined' ? datiInMemoria : [];
  const tavoli = {};

  dati.forEach(riga => {
    const nome = riga['NOMINATIVO'] || riga['PAX'];
    const tavolo = String(riga['TAVOLO'] || 'DA ASSEGNARE').trim();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    if (isTotale) return;

    if (!tavoli[tavolo]) tavoli[tavolo] = [];
    tavoli[tavolo].push(nome);
  });

  const chiaviOrdinate = Object.keys(tavoli).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
    if (isNaN(numA)) return 1;
    if (isNaN(numB)) return -1;
    return numA - numB;
  });

  title.textContent = "Elenco Tavoli";

  const headerAzioniHtml = `
    <div id="areaAzioniTavoli" style="margin-bottom:20px; text-align:center; background:#f1f5f9; padding:10px; border-radius:12px;">
       <button onclick="mostraOpzioniModificaTavoli()" class="btn-choice" style="background:#8b5cf6; color:white; padding:10px; margin-bottom:0; font-size:14px; width:auto; min-width:120px;">Modifica</button>
       <div id="opzioniModificaArea" style="display:${modoSpostaAttivo ? 'flex' : 'none'}; margin-top:10px; gap:10px; justify-content:center; flex-wrap:wrap;">
          <button onclick="attivaModoSposta()" class="btn-choice" style="background:${modoSpostaAttivo ? '#ef4444' : '#f59e0b'}; color:white; padding:8px 15px; margin-bottom:0; font-size:13px; width:auto;">
            ${modoSpostaAttivo ? 'Annulla' : 'Sposta'}
          </button>
          <button class="btn-choice" style="background:#1e293b; color:white; padding:8px 15px; margin-bottom:0; font-size:13px; width:auto;">Switcha</button>

          ${personeSelezionateTavoli.length > 0 ? `
            <button onclick="eseguiSpostamentoTavolo()" class="btn-choice" style="background:#22c55e; color:white; padding:8px 15px; margin-bottom:0; font-size:13px; width:100%; margin-top:10px;">
              Sposta ${personeSelezionateTavoli.length} persone qui...
            </button>
          ` : ''}
       </div>
    </div>
  `;

  const tavoliHtml = chiaviOrdinate.map(t => `
    <div style="margin-bottom:20px; background:#f8fafc; padding:15px; border-radius:12px; border-left:5px solid #2563eb;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="font-weight:900; font-size:18px; color:#1e293b;">TAVOLO ${t}</div>
        <div style="background:#2563eb; color:white; padding:2px 10px; border-radius:20px; font-size:12px; font-weight:bold;">${tavoli[t].length} PERSONE</div>
      </div>
      <div style="display:grid; gap:8px;">
        ${tavoli[t].map(nome => {
          const isSelected = personeSelezionateTavoli.includes(nome);
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:8px 12px; border-radius:8px; border:1px solid ${isSelected ? '#2563eb' : '#e2e8f0'};">
              <div style="font-size:15px; font-weight:500;">• ${nome}</div>
              ${modoSpostaAttivo ? `
                <button onclick="toggleSelezionePersonaTavolo('${nome.replace(/'/g, "\\'")}')"
                        style="width:24px; height:24px; border-radius:6px; border:2px solid ${isSelected ? '#2563eb' : '#cbd5e1'};
                               background:${isSelected ? '#2563eb' : 'white'}; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                  ${isSelected ? '✅' : ''}
                </button>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  listContainer.innerHTML = headerAzioniHtml + tavoliHtml;
  modal.classList.add('active');
}

function attivaModoSposta() {
  modoSpostaAttivo = !modoSpostaAttivo;
  personeSelezionateTavoli = [];
  mostraElencoTavoli();
}

function toggleSelezionePersonaTavolo(nome) {
  if (personeSelezionateTavoli.includes(nome)) {
    personeSelezionateTavoli = personeSelezionateTavoli.filter(n => n !== nome);
  } else {
    personeSelezionateTavoli.push(nome);
  }
  mostraElencoTavoli();
}

function eseguiSpostamentoTavolo() {
  const nuovoTavolo = prompt(`A quale tavolo vuoi spostare le ${personeSelezionateTavoli.length} persone selezionate?`);
  if (nuovoTavolo === null) return;

  const tavoloPulito = nuovoTavolo.trim().toUpperCase();
  if (tavoloPulito === "") return;

  // Aggiorna dati in memoria
  window.datiInMemoria.forEach(riga => {
    const nome = riga['NOMINATIVO'] || riga['PAX'];
    if (personeSelezionateTavoli.includes(nome)) {
      riga['TAVOLO'] = tavoloPulito;
    }
  });

  // Salva e resetta
  localStorage.setItem('excel_data_store', JSON.stringify(window.datiInMemoria));
  modoSpostaAttivo = false;
  personeSelezionateTavoli = [];

  mostraElencoTavoli();
  if (typeof mostraLista === 'function') mostraLista();
}

function mostraOpzioniModificaTavoli() {
  const area = document.getElementById('opzioniModificaArea');
  if (area) {
    area.style.display = (area.style.display === 'none' || area.style.display === '') ? 'flex' : 'none';
  }
}

function mostraElencoIntolleranze() {
  const modal = document.getElementById('ristorazioneResultModal');
  const title = document.getElementById('ristorazioneResultTitle');
  const listContainer = document.getElementById('ristorazioneResultList');

  if (!modal || !listContainer) return;

  const dati = typeof datiInMemoria !== 'undefined' ? datiInMemoria : [];

  const personeConNote = dati.filter(riga => {
    const nome = riga['NOMINATIVO'] || riga['PAX'];
    const note = (riga['ALLERGIE'] || riga['NOTE'] || '').trim();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    return !isTotale && note !== '';
  });

  title.textContent = "Intolleranze e Allergie";

  if (personeConNote.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#64748b;">Nessuna segnalazione trovata. ✅</p>';
  } else {
    listContainer.innerHTML = personeConNote.map(p => `
      <div style="padding:12px; border-bottom:1px solid #eee;">
        <div style="font-weight:bold; font-size:16px;">${p['NOMINATIVO'] || p['PAX']}</div>
        <div style="color:#ef4444; font-weight:bold; font-size:14px; margin-top:4px;">⚠️ ${p['ALLERGIE'] || p['NOTE']}</div>
        <div style="font-size:12px; color:#94a3b8;">Tavolo: ${p['TAVOLO'] || '—'}</div>
      </div>
    `).join('');
  }

  modal.classList.add('active');
}

function chiudiRistorazioneChoiceModal() {
  const modal = document.getElementById('ristorazioneChoiceModal');
  if (modal) modal.classList.remove('active');
}

function chiudiRistorazioneResultModal() {
  const modal = document.getElementById('ristorazioneResultModal');
  if (modal) modal.classList.remove('active');
}

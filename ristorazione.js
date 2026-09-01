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

  // Ordiniamo i numeri di tavolo
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
       <div id="opzioniModificaArea" style="display:none; margin-top:10px; gap:10px; justify-content:center;">
          <button class="btn-choice" style="background:#f59e0b; color:white; padding:8px 15px; margin-bottom:0; font-size:13px; width:auto;">Sposta</button>
          <button class="btn-choice" style="background:#1e293b; color:white; padding:8px 15px; margin-bottom:0; font-size:13px; width:auto;">Switcha</button>
       </div>
    </div>
  `;

  const tavoliHtml = chiaviOrdinate.map(t => `
    <div style="margin-bottom:20px; background:#f8fafc; padding:15px; border-radius:12px; border-left:5px solid #2563eb;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="font-weight:900; font-size:18px; color:#1e293b;">TAVOLO ${t}</div>
        <div style="background:#2563eb; color:white; padding:2px 10px; border-radius:20px; font-size:12px; font-weight:bold;">${tavoli[t].length} PERSONE</div>
      </div>
      <div style="display:grid; gap:5px;">
        ${tavoli[t].map(nome => `<div style="font-size:15px;">• ${nome}</div>`).join('')}
      </div>
    </div>
  `).join('');

  listContainer.innerHTML = headerAzioniHtml + tavoliHtml;
  modal.classList.add('active');
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

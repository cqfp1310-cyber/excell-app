/**
 * File: contatore.js
 * Gestisce i conteggi per punti di raccolta e il riepilogo generale (Escludendo lo Staff).
 * Il contatore di raccolta considera "gestiti" solo i Presenti e gli Assenti.
 */

function aggiornaContatoriRaccolta() {
  const container = document.getElementById('contatoriRaccolta');
  const summaryBox = document.getElementById('riepilogoGenerale');
  if (!container) return;

  const dati = typeof window.datiInMemoria !== 'undefined' ? window.datiInMemoria : [];
  if (!dati.length) {
    if (summaryBox) summaryBox.innerHTML = '';
    container.innerHTML = '';
    return;
  }

  const report = {};
  let globTot = 0;
  let globPres = 0;
  let globAss = 0;
  let globNave = 0;

  const naveDati = typeof ottieniNaveDati === 'function' ? ottieniNaveDati() : JSON.parse(localStorage.getItem('excel_nave_checkin') || '{}');

  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();

    // --- ESCLUSIONE STAFF E TOTALE ---
    const nomeUpper = nome.toUpperCase();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nomeUpper.includes('AUTISTA') || nomeUpper.includes('ACCOMPAGNATORE');

    if (isTotale || isStaff) return;

    globTot++;
    const raccolta = (riga['RACCOLTA'] || 'ALTRO').trim().toUpperCase();
    if (!report[raccolta]) report[raccolta] = { totale: 0, mancano: 0 };
    report[raccolta].totale++;

    const stati = typeof ottieniStatiPersona === 'function' ? ottieniStatiPersona(nome) : [];

    // --- LOGICA RICHIESTA: Conta come "mancante" chi non è né Presente né Assente ---
    // (Ignora Tassa e Postazione per il conteggio di raccolta)
    const gestito = stati.includes('Presenza') || stati.includes('Assenza');
    if (!gestito) {
      report[raccolta].mancano++;
    }

    if (stati.includes('Presenza')) globPres++;
    if (stati.includes('Assenza')) globAss++;

    if (naveDati[nome] !== undefined) {
      globNave += naveDati[nome];
    }
  });

  // Aggiorna il piccolo Riepilogo Generale (Solo Passeggeri)
  if (summaryBox) {
    const totReale = globTot - globAss;
    summaryBox.innerHTML = `
      <span class="summary-item pos" style="background:#22c55e;">+${globPres} Pre.</span>
      <span class="summary-item neg" style="background:#ef4444;">-${globAss} Ass.</span>
      <span class="summary-item nave" style="background:#0ea5e9; color:white; padding:2px 8px; border-radius:5px; margin:0 5px;">🚢 ${globNave} Nave</span>
      <span class="summary-item tot" style="border-left:1px solid #475569; padding-left:10px;">${globPres} / ${totReale} (Tot: ${globTot})</span>
    `;
  }

  // Genera schede punti raccolta
  const html = Object.keys(report).sort().map(punto => {
    const d = report[punto];
    const completato = d.mancano === 0;
    return `
      <div class="counter-card ${completato ? 'raccolta-completata' : ''}" onclick="mostraMancantiRaccolta('${punto.replace(/'/g, "\\'")}')">
        <div class="counter-label">${punto}</div>
        <div class="counter-value">${d.mancano}</div>
        <div class="counter-sub">mancano su ${d.totale}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function mostraMancantiRaccolta(puntoSelezionato) {
  const modal = document.getElementById('mancantiModal');
  const title = document.getElementById('mancantiTitle');
  const listContainer = document.getElementById('mancantiList');
  if (!modal || !listContainer) return;

  const dati = typeof window.datiInMemoria !== 'undefined' ? window.datiInMemoria : [];

  // Filtriamo: Solo chi non è né Presente né Assente per quel punto
  const mancanti = dati.filter(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const nomeUpper = nome.toUpperCase();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nomeUpper.includes('AUTISTA') || nomeUpper.includes('ACCOMPAGNATORE');

    if (isTotale || isStaff) return false;

    const r = (riga['RACCOLTA'] || 'ALTRO').trim().toUpperCase();
    if (r !== puntoSelezionato) return false;

    const stati = typeof ottieniStatiPersona === 'function' ? ottieniStatiPersona(nome) : [];
    const gestito = stati.includes('Presenza') || stati.includes('Assenza');
    return !gestito;
  });

  title.textContent = `Mancanti: ${puntoSelezionato}`;
  if (mancanti.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#64748b;">Tutti i presenti/assenti segnati! ✅</p>';
  } else {
    listContainer.innerHTML = mancanti.map(m => {
      const nome = m['NOMINATIVO'] || m['PAX'] || 'Senza nome';
      const tel = m['TELEFONO'] || m['TEL'] || m['CELLULARE'] || '—';
      return `
        <div class="mancante-item">
          <div class="mancante-nome">${nome}</div>
          <div class="mancante-tel" onclick="event.stopPropagation(); if(typeof apriAzioneTelefono === 'function') apriAzioneTelefono('${tel}', '${nome.replace(/'/g, "\\'")}');">${tel}</div>
        </div>
      `;
    }).join('');
  }
  modal.classList.add('active');
}

function chiudiMancantiModal() {
  const modal = document.getElementById('mancantiModal');
  if (modal) modal.classList.remove('active');
}

window.richiediAggiornamentoContatori = function() {
  aggiornaContatoriRaccolta();
};

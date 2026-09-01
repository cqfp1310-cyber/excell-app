/**
 * File: postazioni-gestione.js
 * Gestione Manuale Postazioni
 */

const POSTO_LOCAL_KEY = 'excel_postazioni_assegnate_v2';

function ottieniPostazioniAssegnate() {
  const dati = localStorage.getItem(POSTO_LOCAL_KEY);
  return dati ? JSON.parse(dati) : [];
}

function aggiungiPostazione() {
  const nome = prompt("Inserisci il Nome (o capogruppo):");
  if (!nome) return;

  const pax = prompt("Numero di persone (PAX):", "1");
  if (pax === null) return;

  const euro = prompt("Euro pagati:");
  if (euro === null) return;

  let assegnati = ottieniPostazioniAssegnate();
  assegnati.push({
    nome: nome.trim(),
    pax: pax.trim(),
    fila: euro.trim(), // Teniamo la chiave 'fila' per compatibilità ma ci salviamo gli euro
    timestamp: Date.now()
  });

  localStorage.setItem(POSTO_LOCAL_KEY, JSON.stringify(assegnati));
  apriPostazioniGestione();
  if (typeof mostraLista === 'function') mostraLista();
}

function rimuoviPostazione(index) {
  if (confirm("Vuoi rimuovere questa assegnazione?")) {
    let assegnati = ottieniPostazioniAssegnate();
    assegnati.splice(index, 1);
    localStorage.setItem(POSTO_LOCAL_KEY, JSON.stringify(assegnati));
    apriPostazioniGestione();
    if (typeof mostraLista === 'function') mostraLista();
  }
}

function apriPostazioniGestione() {
  const modal = document.getElementById('postazioniModal');
  const listContainer = document.getElementById('postazioniList');
  const counterBox = document.getElementById('postazioniCounter');

  if (!modal || !listContainer) return;

  const assegnati = ottieniPostazioniAssegnate();

  if (counterBox) {
    counterBox.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding:15px; background:#0f172a; color:white; border-radius:12px; margin-bottom:15px; border: 1px solid #334155;">
        <div style="text-align:center;">
          <span style="color:#f59e0b; font-size:24px; font-weight:900;">${assegnati.length}</span><br>
          <small style="color:#94a3b8; font-size:10px; text-transform:uppercase; letter-spacing:1px;">Postazioni Totali</small>
        </div>
      </div>
      <button onclick="aggiungiPostazione()" class="btn-choice" style="background:#22c55e; color:white; margin-bottom:20px; font-size:16px;">
        ➕ Aggiungi Postazione
      </button>
    `;
  }

  if (assegnati.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center; padding:30px; color:#64748b; font-style:italic;">Nessuna postazione assegnata.<br>Clicca il tasto "+" per iniziare.</p>';
  } else {
    listContainer.innerHTML = assegnati.map((p, idx) => `
      <div class="pagamento-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #f1f5f9; background:white; border-radius:10px; margin-bottom:8px; border:1px solid #e2e8f0;">
        <div style="flex:1;">
          <div style="font-weight:900; font-size:16px; color:#1e293b;">${p.nome}</div>
          <div style="font-size:13px; color:#64748b; margin-top:3px;">
            <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:bold; color:#f59e0b;">PAX: ${p.pax}</span>
            <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:bold; color:#2563eb; margin-left:5px;">EURO: ${p.fila}</span>
          </div>
        </div>
        <button onclick="rimuoviPostazione(${idx})" style="background:#fee2e2; color:#ef4444; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:12px;">ELIMINA</button>
      </div>
    `).join('');
  }

  modal.classList.add('active');
}

function chiudiPostazioniModal() {
  const modal = document.getElementById('postazioniModal');
  if (modal) modal.classList.remove('active');
}

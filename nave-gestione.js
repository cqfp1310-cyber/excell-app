/**
 * File: nave-gestione.js
 * Gestione avanzata imbarco nave
 */

const NAVE_LOCAL_KEY = 'excel_nave_checkin';
window.filtroNave = '';

function ottieniNaveDati() {
  const dati = localStorage.getItem(NAVE_LOCAL_KEY);
  return dati ? JSON.parse(dati) : {};
}

function confermaRapidaNave(nome, num) {
  let naveDati = ottieniNaveDati();
  naveDati[nome] = num;
  localStorage.setItem(NAVE_LOCAL_KEY, JSON.stringify(naveDati));
  aggiornaUINave();
}

function cancellaNave(nome) {
  let naveDati = ottieniNaveDati();
  delete naveDati[nome];
  localStorage.setItem(NAVE_LOCAL_KEY, JSON.stringify(naveDati));
  aggiornaUINave();
}

function modificaManualeNave(nome, attuale) {
  const input = prompt(`Inserisci numero passeggeri per ${nome}:`, attuale);
  if (input === null) return;
  const num = parseInt(input);
  if (!isNaN(num) && num >= 0) {
    confermaRapidaNave(nome, num);
  }
}

function apriNaveGestione() {
  window.filtroNave = '';
  const searchInput = document.getElementById('naveSearchInput');
  if (searchInput) {
    searchInput.value = '';
    searchInput.oninput = (e) => {
      window.filtroNave = e.target.value.toLowerCase();
      aggiornaUINave();
    };
  }
  aggiornaUINave();
  document.getElementById('naveModal').classList.add('active');
}

function aggiornaUINave() {
  const listContainer = document.getElementById('naveList');
  const counterBox = document.getElementById('naveCounter');
  if (!listContainer) return;

  const dati = window.datiInMemoria || [];
  const naveDati = ottieniNaveDati();

  let totImbarcati = 0;
  let totPrevisti = 0;
  let gruppiImbarcati = 0;
  let passeggeriReali = [];

  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const paxPrevisti = parseInt(riga['PAX']) || 0;
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nome.toUpperCase().includes('AUTISTA') || nome.toUpperCase().includes('ACCOMPAGNATORE');

    if (nome && !isTotale && !isStaff) {
      if (nome.toLowerCase().includes(window.filtroNave)) {
        passeggeriReali.push({ nome, paxPrevisti });
      }
      totPrevisti += paxPrevisti;
      if (naveDati[nome] !== undefined) {
        totImbarcati += naveDati[nome];
        gruppiImbarcati++;
      }
    }
  });

  // Ordine: Da imbarcare in cima
  passeggeriReali.sort((a, b) => {
    const aIn = naveDati[a.nome] !== undefined;
    const bIn = naveDati[b.nome] !== undefined;
    if (!aIn && bIn) return -1;
    if (aIn && !bIn) return 1;
    return a.nome.localeCompare(b.nome);
  });

  listContainer.innerHTML = passeggeriReali.map(p => {
    const numConfermato = naveDati[p.nome];
    const isDone = numConfermato !== undefined;

    return `
      <div class="pagamento-item" style="border-left: 5px solid ${isDone ? '#0ea5e9' : '#e2e8f0'}; margin-bottom:8px; background: ${isDone ? '#f0f9ff' : 'white'};">
        <div style="flex:1;">
          <div style="font-weight:bold; font-size:15px;">${p.nome}</div>
          <div style="font-size:12px; color:#64748b;">Previsti: ${p.paxPrevisti} PAX</div>
          ${isDone ? `<div style="font-weight:bold; color:#0369a1; font-size:13px;">Imbarcati: ${numConfermato}</div>` : ''}
        </div>
        <div style="display:flex; gap:5px;">
          ${!isDone ? `
            <button onclick="confermaRapidaNave('${p.nome.replace(/'/g, "\\")}', ${p.paxPrevisti})" style="background:#0ea5e9; color:white; border:none; padding:8px 12px; border-radius:6px; font-weight:bold; cursor:pointer;">OK ${p.paxPrevisti}</button>
            <button onclick="modificaManualeNave('${p.nome.replace(/'/g, "\\")}', ${p.paxPrevisti})" style="background:#f1f5f9; border:none; padding:8px; border-radius:6px; cursor:pointer;">✏️</button>
          ` : `
            <button onclick="cancellaNave('${p.nome.replace(/'/g, "\\")}')" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; font-weight:bold; cursor:pointer;">ANNULLA</button>
            <button onclick="modificaManualeNave('${p.nome.replace(/'/g, "\\")}', ${numConfermato})" style="background:#f1f5f9; border:none; padding:8px; border-radius:6px; cursor:pointer;">✏️</button>
          `}
        </div>
      </div>
    `;
  }).join('') || '<p style="text-align:center; padding:20px; color:#94a3b8;">Nessun passeggero trovato.</p>';

  if (counterBox) {
    counterBox.innerHTML = `
      <div style="display:flex; justify-content:space-around; align-items:center; padding:12px; background:#0ea5e9; color:white; border-radius:12px; margin-bottom:15px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="text-align:center;"><span style="font-size:22px; font-weight:900;">${totImbarcati}</span><br><small style="text-transform:uppercase; font-size:10px; opacity:0.8;">A Bordo</small></div>
        <div style="height:30px; border-left:1px solid rgba(255,255,255,0.3);"></div>
        <div style="text-align:center;"><span style="font-size:18px; font-weight:600; opacity:0.9;">${totPrevisti}</span><br><small style="text-transform:uppercase; font-size:10px; opacity:0.8;">Totali</small></div>
        <div style="height:30px; border-left:1px solid rgba(255,255,255,0.3);"></div>
        <div style="text-align:center;"><span style="font-size:22px; font-weight:900;">${gruppiImbarcati}</span><br><small style="text-transform:uppercase; font-size:10px; opacity:0.8;">Gruppi</small></div>
      </div>
    `;
  }

  if (typeof mostraLista === 'function') mostraLista();
}

function chiudiNaveModal() {
  document.getElementById('naveModal').classList.remove('active');
}

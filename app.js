const STORAGE_KEY = 'excel_data_store';
window.datiInMemoria = [];
window.filtroRicerca = '';

const fileInput = document.getElementById('fileInput');
const searchInput = document.getElementById('searchInput');
const statusEl = document.getElementById('status');
const listaDatiEl = document.getElementById('listaDati');
const globalSegnaBtn = document.getElementById('globalSegnaBtn');

// Listener Ricerca
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    window.filtroRicerca = e.target.value.toLowerCase();
    mostraLista();
  });
}

// 1. Caricamento File
if (fileInput) {
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    statusEl.textContent = 'Caricamento: ' + file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        processaDatiExcel(rawRows);
      } catch (err) { statusEl.textContent = 'Errore lettura.'; }
      fileInput.value = '';
    };
    reader.readAsBinaryString(file);
  });
}

function processaDatiExcel(rawRows) {
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
    if (rawRows[i].some(cell => String(cell).toUpperCase().includes('NOMINATIVO'))) {
      headerIndex = i; break;
    }
  }
  if (headerIndex === -1) return;

  const headers = rawRows[headerIndex].map(h => String(h).trim().toUpperCase());
  window.datiInMemoria = rawRows.slice(headerIndex + 1)
    .filter(row => row.length > 0 && row.some(cell => String(cell).trim() !== ''))
    .map((row, idx) => {
      const obj = { _idOriginale: idx + 1 };
      headers.forEach((h, idxH) => { if (h) obj[h] = row[idxH] !== undefined ? String(row[idxH]).trim() : ''; });
      return obj;
    });

  if (globalSegnaBtn) globalSegnaBtn.disabled = false;
  salvaEVisualizza();
}

// 2. Ordinamento Intelligente - SOLO PER PRESENZA E ASSENZA
function ordinaListaIntelligente() {
  if (!window.datiInMemoria.length) return;

  window.datiInMemoria.sort((a, b) => {
    const nomeA = (a['NOMINATIVO'] || '').toUpperCase();
    const nomeB = (b['NOMINATIVO'] || '').toUpperCase();
    const paxA = String(a['PAX'] || '');
    const paxB = String(b['PAX'] || '');

    // 1. TOTALE sempre ultimo
    if (nomeA === '' || paxA.includes('###')) return 1;
    if (nomeB === '' || paxB.includes('###')) return -1;

    // 2. STAFF sopra totale
    const isStaffA = nomeA.includes('AUTISTA') || nomeA.includes('ACCOMPAGNATORE');
    const isStaffB = nomeB.includes('AUTISTA') || nomeB.includes('ACCOMPAGNATORE');
    if (isStaffA && !isStaffB) return 1;
    if (!isStaffA && isStaffB) return -1;
    if (isStaffA && isStaffB) return a._idOriginale - b._idOriginale;

    // 3. REGOLE PASSEGGERI (Solo Presenza e Assenza decidono il posto)
    const statiA = window.ottieniStatiPersona(a['NOMINATIVO'] || a['PAX']);
    const statiB = window.ottieniStatiPersona(b['NOMINATIVO'] || b['PAX']);

    const isAssA = statiA.includes('Assenza');
    const isAssB = statiB.includes('Assenza');
    const isPreA = statiA.includes('Presenza');
    const isPreB = statiB.includes('Presenza');

    // A. Assenti in fondo
    if (isAssA && !isAssB) return 1;
    if (!isAssA && isAssB) return -1;

    // B. Presenti sotto i "non visti" (chi non ha né presenza né assenza)
    if (!isPreA && isPreB) return -1;
    if (isPreA && !isPreB) return 1;

    return a._idOriginale - b._idOriginale;
  });
}

// 3. Recupero Stati Sincronizzato
window.ottieniStatiPersona = function(nome) {
  if (!nome) return [];
  let statiSet = new Set();
  const baseStati = JSON.parse(localStorage.getItem('excel_stati_persone_v2') || '{}');
  if (baseStati[nome]) baseStati[nome].forEach(s => statiSet.add(s));
  const pagatiTassa = JSON.parse(localStorage.getItem('excel_tassa_pagata') || '[]');
  if (pagatiTassa.includes(nome)) statiSet.add('Tassa');
  const assegnatiPostoV2 = JSON.parse(localStorage.getItem('excel_postazioni_assegnate_v2') || '[]');
  if (assegnatiPostoV2.some(p => p.nome === nome)) statiSet.add('Postazione');
  const adesioniExtra = JSON.parse(localStorage.getItem('excel_adesioni_evento_extra') || '[]');
  if (adesioniExtra.includes(nome)) statiSet.add('Altro');
  return Array.from(statiSet);
};

function salvaEVisualizza() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.datiInMemoria));
  mostraLista();
}

function mostraLista() {
  if (!listaDatiEl) return;
  ordinaListaIntelligente();

  let toolbarHtml = window.modoAttivo ? `<div class="toolbar-info"><span>Operazione: <strong>${window.modoAttivo}</strong></span><button onclick="terminaModo()" class="btn-fine">Termina</button></div>` : '';
  const headerHtml = `<div class="list-header"><div class="col-num">#</div><div class="col-nome">Nominativo</div><div class="col-raccolta">Raccolta</div><div class="col-tel">Telefono</div><div class="col-saldo">Saldo</div><div class="col-status-end">Stati</div></div>`;

  const datiFiltrati = window.datiInMemoria.filter(riga => {
    const nomeOriginale = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const isTotale = nomeOriginale === '' || String(riga['PAX']).includes('###');
    if (isTotale) return true;
    return nomeOriginale.toLowerCase().includes(window.filtroRicerca);
  });

  const rowsHtml = datiFiltrati.map((riga, index) => {
    const nomeOriginale = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const isTotale = nomeOriginale === '' || String(riga['PAX']).includes('###');
    const stati = window.ottieniStatiPersona(nomeOriginale || riga['PAX']);

    let rowClass = isTotale ? 'list-row riga-totale' : 'list-row';
    stati.forEach(s => { rowClass += ` stato-${s.toLowerCase()}`; });
    const indicatorsHtml = stati.map(s => `<div class="status-indicator-right indicator-${s.toLowerCase()}"></div>`).join('');

    const posto = (riga['FILA BUS'] || '').toUpperCase();
    let postoClass = 'badge-posto' + (posto.includes('1ACC') ? ' posto-rosso' : posto.includes('3ACC') ? ' posto-blu' : '');

    return `
      <div class="${rowClass}" id="row-${index}" onclick="${isTotale ? '' : `gestisciToccoRiga('${nomeOriginale.replace(/'/g, "\\'")}', ${index})`}">
        <div class="status-square"></div>
        <div class="col-num">${isTotale ? 'Σ' : index + 1}</div>
        <div class="col-nome">${isTotale ? '--- TOTALE GENERALE ---' : (nomeOriginale || 'Senza nome')} ${posto && !isTotale ? `<span class="${postoClass}">${posto}</span>` : ''}</div>
        <div class="col-raccolta">${isTotale ? '' : riga['RACCOLTA']}</div>
        <div class="col-tel" onclick="${isTotale ? '' : `event.stopPropagation(); apriAzioneTelefono('${riga['TELEFONO']}', '${nomeOriginale.replace(/'/g, "\\'")}')`}">${isTotale ? '' : riga['TELEFONO']}</div>
        <div class="col-saldo">${riga['SALDO']}</div>
        <div class="col-status-end">${indicatorsHtml}</div>
      </div>
    `;
  }).join('');

  listaDatiEl.innerHTML = toolbarHtml + headerHtml + rowsHtml;
  if (typeof window.richiediAggiornamentoContatori === 'function') window.richiediAggiornamentoContatori();
}

function gestisciToccoRiga(nome, index) {
  if (window.modoAttivo) {
    if (typeof gestisciAzioneRiga === 'function') gestisciAzioneRiga(nome, index);
    salvaEVisualizza();
  }
}

if (globalSegnaBtn) globalSegnaBtn.addEventListener('click', () => { if (typeof apriSceltaStato === 'function') apriSceltaStato(); });
const btnRistorazione = document.getElementById('btnRistorazione');
if (btnRistorazione) btnRistorazione.addEventListener('click', () => { if (typeof apriSceltaRistorazione === 'function') apriSceltaRistorazione(); });
const btnElenchiExtra = document.getElementById('btnElenchiExtra');
if (btnElenchiExtra) {
  btnElenchiExtra.addEventListener('click', () => { document.getElementById('elenchiExtraModal').classList.add('active'); });
}

window.apriDaElenchi = function(tipo) {
  chiudiElenchiExtraModal();
  if (tipo === 'nave' && typeof apriNaveGestione === 'function') apriNaveGestione();
  if (tipo === 'pagamenti' && typeof apriPagamenti === 'function') apriPagamenti();
  if (tipo === 'tassa' && typeof apriTassaGestione === 'function') apriTassaGestione();
  if (tipo === 'postazioni' && typeof apriPostazioniGestione === 'function') apriPostazioniGestione();
  if (tipo === 'altro' && typeof apriAltroEvento === 'function') apriAltroEvento();
};

window.chiudiElenchiExtraModal = function() { document.getElementById('elenchiExtraModal').classList.remove('active'); };

const tempResetBtn = document.getElementById('tempResetBtn');
if (tempResetBtn) tempResetBtn.addEventListener('click', () => { if (confirm('Reset?')) { localStorage.removeItem('excel_stati_persone_v2'); localStorage.removeItem('excel_pagamenti_ricevuti'); localStorage.removeItem('excel_adesioni_evento_extra'); localStorage.removeItem('excel_tassa_pagata'); localStorage.removeItem('excel_postazioni_assegnate_v2'); localStorage.removeItem('excel_nave_checkin'); location.reload(); } });

// Logica Telefono
const phoneModal = document.getElementById('phoneModal');
const modalTitle = document.getElementById('modalTitle');
let numeroSalvato = '';
function apriAzioneTelefono(tel, nome) {
  if (!tel || tel === '—' || tel === '' || tel === 'undefined') return;
  numeroSalvato = String(tel).replace(/\s+/g, '');
  modalTitle.textContent = nome;
  if(phoneModal) phoneModal.classList.add('active');
}
document.getElementById('btnWhatsapp').addEventListener('click', () => { window.open(`https://wa.me/${numeroSalvato}`, '_blank'); chiudiPhoneModal(); });
document.getElementById('btnCall').addEventListener('click', () => { window.location.href = `tel:${numeroSalvato}`; chiudiPhoneModal(); });
document.getElementById('btnCancel').addEventListener('click', chiudiPhoneModal);
function chiudiPhoneModal() { if(phoneModal) phoneModal.classList.remove('active'); }

window.addEventListener('DOMContentLoaded', () => {
  const salvati = localStorage.getItem(STORAGE_KEY);
  if (salvati) {
    window.datiInMemoria = JSON.parse(salvati);
    if (globalSegnaBtn) globalSegnaBtn.disabled = false;
    mostraLista();
  }
});

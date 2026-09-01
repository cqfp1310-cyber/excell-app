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
    delete naveDati[nome];
  } else {
    const input = prompt(`Quanti passeggeri imbarcare per ${nome}?`, "1");
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
  if (typeof mostraLista === 'function') mostraLista();
}

function apriNaveGestione() {
  aggiornaUINave();
  const modal = document.getElementById('naveModal');
  if (modal) modal.classList.add('active');
}

function chiudiNaveModal() {
  const modal = document.getElementById('naveModal');
  if (modal) modal.classList.remove('active');
}

function aggiornaUINave() {
  const listContainer = document.getElementById('naveList');
  if (!listContainer) return;

  const dati = window.datiInMemoria || [];
  const naveDati = ottieniNaveDati();

  let contImbarcati = 0;
  Object.values(naveDati).forEach(val => {
    contImbarcati += (parseInt(val) || 0);
  });

  let passeggeriConTel = [];
  let contTotalePasseggeri = 0;

  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const tel = (riga['TELEFONO'] || riga['TEL'] || '').trim();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nome.toUpperCase().includes('AUTISTA') || nome.toUpperCase().includes('ACCOMPAGNATORE');

    if (nome && !isTotale && !isStaff) {
      contTotalePasseggeri++;
      // Aggiungiamo alla lista visuale SOLO se ha il telefono
      if (tel && tel !== '' && tel !== '—') {
        passeggeriConTel.push({ nome, tel });
      }
    }
  });

  // Ordine: Da imbarcare in cima, poi alfabetico
  passeggeriConTel.sort((a, b) => {
    const aDone = naveDati[a.nome] !== undefined;
    const bDone = naveDati[b.nome] !== undefined;
    if (!aDone && bDone) return -1;
    if (aDone && !bDone) return 1;
    return a.nome.localeCompare(b.nome);
  });

  let counterHtml = `
    <div style="display:flex; justify-content:space-around; align-items:center; padding:12px; background:#0f172a; color:white; border-radius:12px; margin-bottom:15px; border: 1px solid #334155;">
      <div style="text-align:center;">
        <span style="color:#22c55e; font-size:22px; font-weight:900;">${contImbarcati}</span><br>
        <small style="color:#94a3b8; font-size:10px; text-transform:uppercase;">IMBARCATI</small>
      </div>
      <div style="text-align:center; border-left:1px solid #334155; padding-left:20px;">
        <span style="color:#e2e8f0; font-size:22px; font-weight:900;">${contTotalePasseggeri}</span><br>
        <small style="color:#94a3b8; font-size:10px; text-transform:uppercase;">TOT. PASSEGGERI</small>
      </div>
    </div>
  `;

  const listHtml = passeggeriConTel.map(p => {
    const numConfermati = naveDati[p.nome];
    const isDone = numConfermati !== undefined;
    return `
      <div class="pagamento-item ${isDone ? 'pagato-fatto' : ''}">
        <div class="col-check-pago">
          <button class="btn-segna-pago ${isDone ? 'is-saldato' : 'is-debito'}" onclick="toggleNave('${p.nome.replace(/'/g, "\\'")}'); event.stopPropagation();">
            ${isDone ? 'IMBARCATO' : 'DA IMBARC.'}
          </button>
        </div>
        <div class="pagamento-nome" style="flex:1;">
          ${p.nome} ${isDone ? `<span style="color:#059669; font-weight:bold;">(+${numConfermati})</span>` : ''}
          <div style="font-size:12px; color:#2563eb; font-weight:bold;">📞 ${p.tel}</div>
        </div>
      </div>
    `;
  }).join('');

  listContainer.innerHTML = counterHtml + (listHtml || '<p style="text-align:center; padding:20px; color:#64748b;">Nessun passeggero con telefono trovato.</p>');
}

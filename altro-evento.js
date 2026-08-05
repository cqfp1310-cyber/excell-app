/**
 * File: altro-evento.js
 * Gestisce le adesioni per un evento extra (es. Cena aggiuntiva, Escursione, ecc.)
 */

const EVENTO_LOCAL_KEY = 'excel_adesioni_evento_extra';

function ottieniAdesioniExtra() {
  const dati = localStorage.getItem(EVENTO_LOCAL_KEY);
  return dati ? JSON.parse(dati) : [];
}

function toggleAdesioneExtra(nome) {
  let adesioni = ottieniAdesioniExtra();
  if (adesioni.includes(nome)) {
    adesioni = adesioni.filter(n => n !== nome);
  } else {
    adesioni.push(nome);
  }
  localStorage.setItem(EVENTO_LOCAL_KEY, JSON.stringify(adesioni));
  apriAltroEvento(); // Rinfresca la lista
}

function apriAltroEvento() {
  const modal = document.getElementById('eventoExtraModal');
  const listContainer = document.getElementById('eventoExtraList');
  const counterBox = document.getElementById('eventoExtraCounter');

  if (!modal || !listContainer) return;

  const dati = window.datiInMemoria || [];
  const adesioni = ottieniAdesioniExtra();

  let contIn = 0;
  let contOut = 0;
  let passeggeriReali = [];

  // Filtriamo i passeggeri (no staff, no totale)
  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nome.toUpperCase().includes('AUTISTA') || nome.toUpperCase().includes('ACCOMPAGNATORE');

    if (nome && !isTotale && !isStaff) {
      passeggeriReali.push(nome);
      if (adesioni.includes(nome)) contIn++;
      else contOut++;
    }
  });

  // Ordiniamo: Chi è "Fuori" (Rosso) in cima, chi è "Dentro" (Verde) in fondo
  passeggeriReali.sort((a, b) => {
    const aIn = adesioni.includes(a);
    const bIn = adesioni.includes(b);
    if (!aIn && bIn) return -1;
    if (aIn && !bIn) return 1;
    return a.localeCompare(b);
  });

  const html = passeggeriReali.map(nome => {
    const isIn = adesioni.includes(nome);
    return `
      <div class="pagamento-item ${isIn ? 'pagato-fatto' : ''}">
        <div class="col-check-pago">
          <button class="btn-segna-pago ${isIn ? 'is-saldato' : 'is-debito'}" onclick="toggleAdesioneExtra('${nome.replace(/'/g, "\\'")}'); event.stopPropagation();">
            ${isIn ? 'DENTRO' : 'FUORI'}
          </button>
        </div>
        <div class="pagamento-nome" style="flex:1;">${nome}</div>
      </div>
    `;
  }).join('');

  listContainer.innerHTML = html || '<p style="text-align:center; padding:20px;">Carica un file per vedere i nomi.</p>';

  if (counterBox) {
    counterBox.innerHTML = `
      <div style="display:flex; justify-content:space-around; align-items:center; padding:10px; background:#1e293b; color:white; border-radius:10px; margin-bottom:15px;">
        <div style="text-align:center;"><span style="color:#4ade80; font-size:20px; font-weight:900;">${contIn}</span><br><small>DENTRO</small></div>
        <div style="text-align:center; border-left:1px solid #475569; border-right:1px solid #475569; padding:0 20px;"><span style="color:#94a3b8; font-size:16px;">${passeggeriReali.length}</span><br><small>TOTALE</small></div>
        <div style="text-align:center;"><span style="color:#f87171; font-size:20px; font-weight:900;">${contOut}</span><br><small>FUORI</small></div>
      </div>
    `;
  }

  modal.classList.add('active');
}

function chiudiEventoExtraModal() {
  const modal = document.getElementById('eventoExtraModal');
  if (modal) modal.classList.remove('active');
}

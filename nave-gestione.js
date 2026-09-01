/**
 * File: nave-gestione.js
 * Gestione Imbarco Nave
 */

const NAVE_LOCAL_KEY = 'excel_nave_checkin';

function ottieniNaveDati() {
  const dati = localStorage.getItem(NAVE_LOCAL_KEY);
  return dati ? JSON.parse(dati) : {};
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
  let contPasseggeri = 0;

  dati.forEach(riga => {
    const nome = (riga['NOMINATIVO'] || riga['PAX'] || '').trim();
    const isTotale = !nome || String(riga['PAX']).includes('###');
    const isStaff = nome.toUpperCase().includes('AUTISTA') || nome.toUpperCase().includes('ACCOMPAGNATORE');

    if (nome && !isTotale && !isStaff) {
      contPasseggeri++;
    }
  });

  listContainer.innerHTML = `
    <div style="text-align:center; padding:20px;">
      <div style="background:#f1f5f9; padding:15px; border-radius:12px; border:1px solid #e2e8f0;">
        <div style="font-size:12px; color:#64748b; font-weight:bold; text-transform:uppercase;">Passeggeri Totali</div>
        <div style="font-size:32px; font-weight:900; color:#0ea5e9;">${contPasseggeri}</div>
      </div>
      <p style="margin-top:15px; font-size:14px; color:#64748b;">In attesa di istruzioni per la lista...</p>
    </div>
  `;
}

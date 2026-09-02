/**
 * File: rubrica.js
 * Gestione Rubrica Personale Indipendente
 */

const RUBRICA_LOCAL_KEY = 'excel_rubrica_fissa';

function ottieniRubrica() {
  const dati = localStorage.getItem(RUBRICA_LOCAL_KEY);
  return dati ? JSON.parse(dati) : [];
}

function aggiungiContattoRubrica() {
  const nome = prompt("Inserisci il Nome:");
  if (!nome) return;

  const tel = prompt("Inserisci il Numero di Telefono:");
  if (tel === null) return;

  let rubrica = ottieniRubrica();
  rubrica.push({
    nome: nome.trim(),
    tel: tel.trim().replace(/\s+/g, ''),
    id: Date.now()
  });

  localStorage.setItem(RUBRICA_LOCAL_KEY, JSON.stringify(rubrica));
  aggiornaUIRubrica();
}

function rimuoviContattoRubrica(id) {
  if (confirm("Vuoi eliminare definitivamente questo contatto dalla rubrica?")) {
    let rubrica = ottieniRubrica();
    rubrica = rubrica.filter(c => c.id !== id);
    localStorage.setItem(RUBRICA_LOCAL_KEY, JSON.stringify(rubrica));
    aggiornaUIRubrica();
  }
}

function apriRubrica() {
  aggiornaUIRubrica();
  const modal = document.getElementById('rubricaModal');
  if (modal) modal.classList.add('active');
}

function chiudiRubricaModal() {
  const modal = document.getElementById('rubricaModal');
  if (modal) modal.classList.remove('active');
}

function aggiornaUIRubrica() {
  const listContainer = document.getElementById('rubricaList');
  const counterBox = document.getElementById('rubricaCounter');
  if (!listContainer) return;

  const rubrica = ottieniRubrica();

  if (counterBox) {
    counterBox.innerHTML = `
      <div style="background:#0f172a; color:white; padding:10px; border-radius:10px; margin-bottom:15px; text-align:center;">
        <span style="font-size:18px; font-weight:900; color:#38bdf8;">${rubrica.length}</span> Contatti salvati
      </div>
    `;
  }

  if (rubrica.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center; padding:30px; color:#64748b; font-style:italic;">La rubrica è vuota.<br>Aggiungi i tuoi contatti fissi.</p>';
  } else {
    // Ordine alfabetico
    rubrica.sort((a, b) => a.nome.localeCompare(b.nome));

    listContainer.innerHTML = rubrica.map(c => `
      <div class="pagamento-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #f1f5f9; background:white; border-radius:10px; margin-bottom:8px; border:1px solid #e2e8f0;">
        <div style="flex:1;">
          <div style="font-weight:900; font-size:16px; color:#1e293b;">${c.nome}</div>
          <div style="color:#2563eb; font-weight:bold; cursor:pointer; text-decoration:underline; font-size:15px; margin-top:5px; display:inline-block;"
               onclick="event.stopPropagation(); window.apriAzioneTelefono('${c.tel}', '${c.nome.replace(/'/g, "\\'")}');">
            📞 ${c.tel}
          </div>
        </div>
        <button onclick="rimuoviContattoRubrica(${c.id})" style="background:#fee2e2; color:#ef4444; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:11px; margin-left:10px;">ELIMINA</button>
      </div>
    `).join('');
  }
}

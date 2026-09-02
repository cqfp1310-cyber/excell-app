/**
 * File: rubrica.js
 * Gestione Rubrica Personale Indipendente con Modifica
 */

const RUBRICA_LOCAL_KEY = 'excel_rubrica_fissa_v2';
let filtroRubricaAttivo = 'TUTTI';
let contattoInModificaId = null;

function ottieniRubrica() {
  const dati = localStorage.getItem(RUBRICA_LOCAL_KEY);
  return dati ? JSON.parse(dati) : [];
}

function apriSceltaCategoriaRubrica() {
  const modal = document.getElementById('rubricaCategoriaModal');
  if (modal) modal.classList.add('active');
}

function chiudiSceltaCategoriaRubrica() {
  const modal = document.getElementById('rubricaCategoriaModal');
  if (modal) modal.classList.remove('active');
}

function aggiungiContattoConCategoria(categoria) {
  chiudiSceltaCategoriaRubrica();

  const nome = prompt(`Inserisci il Nome per la categoria ${categoria}:`);
  if (!nome) return;

  const tel = prompt(`Inserisci il Numero di Telefono per ${nome}:`);
  if (tel === null) return;

  let rubrica = ottieniRubrica();
  rubrica.push({
    nome: nome.trim(),
    tel: tel.trim().replace(/\s+/g, ''),
    categoria: categoria,
    id: Date.now()
  });

  localStorage.setItem(RUBRICA_LOCAL_KEY, JSON.stringify(rubrica));
  aggiornaUIRubrica();
}

function apriModificaContatto(id) {
  const rubrica = ottieniRubrica();
  const contatto = rubrica.find(c => c.id === id);
  if (!contatto) return;

  contattoInModificaId = id;
  document.getElementById('editRubricaNome').value = contatto.nome;
  document.getElementById('editRubricaTel').value = contatto.tel;
  document.getElementById('editRubricaCat').value = contatto.categoria;

  const modal = document.getElementById('rubricaEditModal');
  if (modal) modal.classList.add('active');
}

function chiudiModificaContatto() {
  contattoInModificaId = null;
  const modal = document.getElementById('rubricaEditModal');
  if (modal) modal.classList.remove('active');
}

function salvaModificaContatto() {
  if (!contattoInModificaId) return;

  const nuovoNome = document.getElementById('editRubricaNome').value.trim();
  const nuovoTel = document.getElementById('editRubricaTel').value.trim().replace(/\s+/g, '');
  const nuovaCat = document.getElementById('editRubricaCat').value;

  if (!nuovoNome) {
    alert("Il nome è obbligatorio.");
    return;
  }

  let rubrica = ottieniRubrica();
  const index = rubrica.findIndex(c => c.id === contattoInModificaId);

  if (index !== -1) {
    rubrica[index].nome = nuovoNome;
    rubrica[index].tel = nuovoTel;
    rubrica[index].categoria = nuovaCat;

    localStorage.setItem(RUBRICA_LOCAL_KEY, JSON.stringify(rubrica));
    aggiornaUIRubrica();
    chiudiModificaContatto();
  }
}

function confermaEliminaRubrica() {
  if (!contattoInModificaId) return;
  if (confirm("Vuoi eliminare definitivamente questo contatto dalla rubrica?")) {
    let rubrica = ottieniRubrica();
    rubrica = rubrica.filter(c => c.id !== contattoInModificaId);
    localStorage.setItem(RUBRICA_LOCAL_KEY, JSON.stringify(rubrica));
    aggiornaUIRubrica();
    chiudiModificaContatto();
  }
}

function impostaFiltroRubrica(cat) {
  filtroRubricaAttivo = cat;
  aggiornaUIRubrica();
}

function apriRubrica() {
  filtroRubricaAttivo = 'TUTTI';
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

  let rubrica = ottieniRubrica();

  if (counterBox) {
    counterBox.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:5px; justify-content:center; margin-bottom:15px;">
        <button onclick="impostaFiltroRubrica('TUTTI')" style="background:${filtroRubricaAttivo === 'TUTTI' ? '#1e293b' : '#94a3b8'}; color:white; border:none; padding:5px 10px; border-radius:15px; font-size:11px; font-weight:bold; cursor:pointer;">TUTTI</button>
        <button onclick="impostaFiltroRubrica('LIDO')" style="background:${filtroRubricaAttivo === 'LIDO' ? '#f59e0b' : '#94a3b8'}; color:white; border:none; padding:5px 10px; border-radius:15px; font-size:11px; font-weight:bold; cursor:pointer;">LIDO</button>
        <button onclick="impostaFiltroRubrica('ALBERGO')" style="background:${filtroRubricaAttivo === 'ALBERGO' ? '#0ea5e9' : '#94a3b8'}; color:white; border:none; padding:5px 10px; border-radius:15px; font-size:11px; font-weight:bold; cursor:pointer;">ALBERGO</button>
        <button onclick="impostaFiltroRubrica('AGENZIA')" style="background:${filtroRubricaAttivo === 'AGENZIA' ? '#10b981' : '#94a3b8'}; color:white; border:none; padding:5px 10px; border-radius:15px; font-size:11px; font-weight:bold; cursor:pointer;">AGENZIA</button>
        <button onclick="impostaFiltroRubrica('SPECIAL')" style="background:${filtroRubricaAttivo === 'SPECIAL' ? '#f97316' : '#94a3b8'}; color:white; border:none; padding:5px 10px; border-radius:15px; font-size:11px; font-weight:bold; cursor:pointer;">SPECIAL</button>
      </div>
    `;
  }

  if (filtroRubricaAttivo !== 'TUTTI') {
    rubrica = rubrica.filter(c => c.categoria === filtroRubricaAttivo);
  }

  if (rubrica.length === 0) {
    listContainer.innerHTML = `<p style="text-align:center; padding:30px; color:#64748b; font-style:italic;">Nessun contatto ${filtroRubricaAttivo === 'TUTTI' ? '' : 'in ' + filtroRubricaAttivo}.</p>`;
  } else {
    rubrica.sort((a, b) => a.nome.localeCompare(b.nome));

    listContainer.innerHTML = rubrica.map(c => {
      let badgeColor = "#f59e0b";
      if (c.categoria === "ALBERGO") badgeColor = "#0ea5e9";
      if (c.categoria === "AGENZIA") badgeColor = "#10b981";
      if (c.categoria === "SPECIAL") badgeColor = "#f97316";

      return `
        <div class="pagamento-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:white; border-radius:10px; margin-bottom:8px; border:1px solid #e2e8f0; border-left:5px solid ${badgeColor};">
          <div style="flex:1; text-align:left;">
            <div style="display:flex; align-items:center; gap:8px;">
               <div style="font-weight:900; font-size:16px; color:#1e293b;">${c.nome}</div>
               <span style="font-size:9px; background:${badgeColor}; color:white; padding:1px 6px; border-radius:10px; font-weight:bold;">${c.categoria}</span>
            </div>
            <div style="color:#2563eb; font-weight:bold; cursor:pointer; text-decoration:underline; font-size:15px; margin-top:5px; display:inline-block;"
                 onclick="event.stopPropagation(); window.apriAzioneTelefono('${c.tel}', '${c.nome.replace(/'/g, "\\'")}');">
              📞 ${c.tel}
            </div>
          </div>
          <button onclick="apriModificaContatto(${c.id})" style="background:#f1f5f9; color:#64748b; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:11px; margin-left:10px;">MODIFICA</button>
        </div>
      `;
    }).join('');
  }
}

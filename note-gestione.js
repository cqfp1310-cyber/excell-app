/**
 * File: note-gestione.js
 * Gestione Blocco Note Personale Indipendente
 */

const NOTE_LOCAL_KEY = 'excel_note_personali';
let notaInModificaId = null;

function ottieniNote() {
  const dati = localStorage.getItem(NOTE_LOCAL_KEY);
  return dati ? JSON.parse(dati) : [];
}

function apriNote() {
  aggiornaUINote();
  const modal = document.getElementById('noteModal');
  if (modal) modal.classList.add('active');
}

function chiudiNoteModal() {
  const modal = document.getElementById('noteModal');
  if (modal) modal.classList.remove('active');
}

function aggiungiNuovaNota() {
  notaInModificaId = null;
  document.getElementById('editNotaTitolo').value = '';
  document.getElementById('editNotaTesto').value = '';
  document.getElementById('noteEditTitle').textContent = 'Nuova Nota';

  const modal = document.getElementById('noteEditModal');
  if (modal) modal.classList.add('active');
}

function apriModificaNota(id) {
  const note = ottieniNote();
  const nota = note.find(n => n.id === id);
  if (!nota) return;

  notaInModificaId = id;
  document.getElementById('editNotaTitolo').value = nota.titolo;
  document.getElementById('editNotaTesto').value = nota.testo;
  document.getElementById('noteEditTitle').textContent = 'Modifica Nota';

  const modal = document.getElementById('noteEditModal');
  if (modal) modal.classList.add('active');
}

function chiudiEditNotaModal() {
  const modal = document.getElementById('noteEditModal');
  if (modal) modal.classList.remove('active');
}

function salvaNota() {
  const titolo = document.getElementById('editNotaTitolo').value.trim();
  const testo = document.getElementById('editNotaTesto').value.trim();

  if (!titolo && !testo) {
    alert("Inserisci almeno un titolo o un testo.");
    return;
  }

  let note = ottieniNote();

  if (notaInModificaId) {
    // Modifica
    const index = note.findIndex(n => n.id === notaInModificaId);
    if (index !== -1) {
      note[index].titolo = titolo;
      note[index].testo = testo;
      note[index].data = new Date().toLocaleString('it-IT');
    }
  } else {
    // Nuovo
    note.push({
      id: Date.now(),
      titolo: titolo || 'Senza titolo',
      testo: testo,
      data: new Date().toLocaleString('it-IT')
    });
  }

  localStorage.setItem(NOTE_LOCAL_KEY, JSON.stringify(note));
  chiudiEditNotaModal();
  aggiornaUINote();
}

function eliminaNota() {
  if (!notaInModificaId) return;
  if (confirm("Vuoi eliminare questa nota definitivamente?")) {
    let note = ottieniNote();
    note = note.filter(n => n.id !== notaInModificaId);
    localStorage.setItem(NOTE_LOCAL_KEY, JSON.stringify(note));
    chiudiEditNotaModal();
    aggiornaUINote();
  }
}

function aggiornaUINote() {
  const listContainer = document.getElementById('noteList');
  if (!listContainer) return;

  const note = ottieniNote();

  if (note.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center; padding:30px; color:#64748b; font-style:italic;">Il tuo blocco note è vuoto. 📝</p>';
  } else {
    // Ordine: le più recenti in alto
    note.sort((a, b) => b.id - a.id);

    listContainer.innerHTML = note.map(n => `
      <div onclick="apriModificaNota(${n.id})" style="background:white; border-radius:12px; padding:15px; margin-bottom:10px; border:1px solid #e2e8f0; cursor:pointer; text-align:left; transition: transform 0.1s;">
        <div style="font-weight:900; font-size:16px; color:#1e293b; margin-bottom:5px;">${n.titolo}</div>
        <div style="font-size:14px; color:#475569; white-space: pre-wrap; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${n.testo}</div>
        <div style="font-size:10px; color:#94a3b8; margin-top:10px; font-weight:bold; text-transform:uppercase;">Ultima modifica: ${n.data}</div>
      </div>
    `).join('');
  }
}

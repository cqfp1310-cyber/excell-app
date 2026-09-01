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

  listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#64748b;">Modulo Nave pronto. In attesa di istruzioni...</p>';
}

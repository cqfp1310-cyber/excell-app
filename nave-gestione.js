/**
 * File: nave-gestione.js
 * [BOZZA] Gestione Nave
 */

function apriNaveGestione() {
  const modal = document.getElementById('naveModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function chiudiNaveModal() {
  const modal = document.getElementById('naveModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

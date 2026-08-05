const STATI_KEY = 'excel_stati_persone_v2';
window.modoAttivo = null;

function ottieniTuttiStati() {
  const dati = localStorage.getItem(STATI_KEY);
  return dati ? JSON.parse(dati) : {};
}

function apriSceltaStato() {
  const modal = document.getElementById('statusModal');
  if (modal) modal.classList.add('active');
}

function impostaStato(statoScelto) {
  window.modoAttivo = statoScelto;
  chiudiStatusModal();

  document.body.classList.remove('modo-segna-presenza', 'modo-segna-assenza', 'modo-segna-postazione', 'modo-segna-tassa');
  document.body.classList.add('modo-segna-attivo');
  document.body.classList.add(`modo-segna-${statoScelto.toLowerCase()}`);

  if (typeof mostraLista === 'function') {
    mostraLista();
  }
}

function gestisciAzioneRiga(nome, index) {
  if (!window.modoAttivo) return;

  const tuttiStati = ottieniTuttiStati();
  let statiPersona = tuttiStati[nome] || [];

  // --- DOPPIO BLOCCO DI SICUREZZA (Gating) ---

  if (window.modoAttivo === 'Assenza') {
    // Se voglio mettere ASSENTE:
    // Controllo se ha già ALTRI stati (Presenza, Postazione o Tassa)
    const haAltro = statiPersona.some(s => s !== 'Assenza');

    if (haAltro) {
      // Se ha già altro, il "rosso" non può entrare.
      // Devi prima annullare gli altri stati.
      return;
    }

    // Se la riga è vuota o ha solo "Assenza", facciamo il normale toggle
    if (statiPersona.includes('Assenza')) {
      statiPersona = [];
    } else {
      statiPersona = ['Assenza'];
    }

  } else {
    // Se voglio mettere ALTRO (Presenza, Postazione, Tassa):
    // Controllo se è già ASSENTE
    if (statiPersona.includes('Assenza')) {
      // Se è rosso, gli altri non possono entrare.
      // Devi prima annullare l'assenza.
      return;
    }

    // Toggle normale per gli altri stati
    if (statiPersona.includes(window.modoAttivo)) {
      statiPersona = statiPersona.filter(s => s !== window.modoAttivo);
    } else {
      statiPersona.push(window.modoAttivo);
    }
  }

  tuttiStati[nome] = statiPersona;
  localStorage.setItem(STATI_KEY, JSON.stringify(tuttiStati));

  if (typeof mostraLista === 'function') {
    mostraLista();
  }
}

function chiudiStatusModal() {
  const modal = document.getElementById('statusModal');
  if (modal) modal.classList.remove('active');
}

function terminaModo() {
  window.modoAttivo = null;
  document.body.classList.remove('modo-segna-attivo', 'modo-segna-presenza', 'modo-segna-assenza', 'modo-segna-postazione', 'modo-segna-tassa');
  if (typeof mostraLista === 'function') {
    mostraLista();
  }
}

function ottieniStatiPersona(nome) {
  const tuttiStati = ottieniTuttiStati();
  return tuttiStati[nome] || [];
}

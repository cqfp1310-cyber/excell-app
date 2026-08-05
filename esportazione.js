/**
 * File: esportazione.js
 * Gestisce la "Memory Card" dell'applicazione: un unico salvataggio che congela tutto il lavoro.
 */

// 1. Funzione "Memory Card": Scarica un unico file con TUTTI i dati e i progressi
function scaricaMemoryCard() {
  const datiCompleti = {
    versione: "2.0",
    dataSalvataggio: new Date().toLocaleString('it-IT'),
    // Salviamo l'elenco dei passeggeri
    passeggeri: window.datiInMemoria || [],
    // Salviamo tutti i "quadratini" e i segni fatti
    stati: JSON.parse(localStorage.getItem('excel_stati_persone_v2') || '{}'),
    pagamenti: JSON.parse(localStorage.getItem('excel_pagamenti_ricevuti') || '[]'),
    tassa: JSON.parse(localStorage.getItem('excel_tassa_pagata') || '[]'),
    postazioni: JSON.parse(localStorage.getItem('excel_postazioni_assegnate') || '[]'),
    extra: JSON.parse(localStorage.getItem('excel_adesioni_evento_extra') || '[]')
  };

  const blob = new Blob([JSON.stringify(datiCompleti)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // Nome file parlante: Salva_Viaggio_DATA.json
  const dataPost = new Date().toISOString().slice(0,10);
  a.download = `MemoryCard_Viaggio_${dataPost}.json`;
  a.click();

  chiudiEsportazioneModal();
}

// 2. Funzione per ricaricare la "Memory Card"
function caricaMemoryCard(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const card = JSON.parse(e.target.result);

      if (card && card.passeggeri) {
        // Ripristiniamo tutto nel database del browser (LocalStorage)
        localStorage.setItem('excel_data_store', JSON.stringify(card.passeggeri));
        localStorage.setItem('excel_stati_persone_v2', JSON.stringify(card.stati || {}));
        localStorage.setItem('excel_pagamenti_ricevuti', JSON.stringify(card.pagamenti || []));
        localStorage.setItem('excel_tassa_pagata', JSON.stringify(card.tassa || []));
        localStorage.setItem('excel_postazioni_assegnate', JSON.stringify(card.postazioni || []));
        localStorage.setItem('excel_adesioni_evento_extra', JSON.stringify(card.extra || []));

        alert('Memory Card caricata! Tutti i progressi sono stati ripristinati. ✅');
        location.reload(); // Ricarica la pagina per vedere i cambiamenti
      } else {
        alert('File non valido. Assicurati di caricare una Memory Card creata da questa app.');
      }
    } catch (err) {
      alert('Errore nel caricamento della Memory Card.');
    }
    event.target.value = ''; // Reset input
  };
  reader.readAsText(file);
}

function apriMenuEsportazione() {
    const modal = document.getElementById('esportazioneModal');
    if (modal) modal.classList.add('active');
}

function chiudiEsportazioneModal() {
    const modal = document.getElementById('esportazioneModal');
    if (modal) modal.classList.remove('active');
}

// Funzione PDF (rimane per chi vuole stampare, ma separata dal concetto di "salvataggio")
function stampaReport() {
    chiudiEsportazioneModal();
    setTimeout(() => { window.print(); }, 500);
}

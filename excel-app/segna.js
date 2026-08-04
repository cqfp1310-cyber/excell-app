const STORAGE_KEY = 'excelAppRows';
let personeSegnate = [];
let contatoreId = 0;

function ottieniNomePersona(riga) {
  return String(riga?.nominativo ?? riga?.Nominativo ?? riga?.['nominativo'] ?? 'Senza nome').trim();
}

function ottieniRaccoltaPersona(riga) {
  return String(riga?.raccolta ?? riga?.Raccolta ?? riga?.['raccolta'] ?? 'Senza raccolta').trim() || 'Senza raccolta';
}

function ottieniTelefonoPersona(riga) {
  return String(riga?.telefono ?? riga?.Telefono ?? riga?.['telefono'] ?? '').trim();
}

function leggiDatiSalvati() {
  try {
    const valore = localStorage.getItem(STORAGE_KEY);
    if (!valore) return [];
    const dati = JSON.parse(valore);
    return Array.isArray(dati) ? dati : [];
  } catch (error) {
    return [];
  }
}

function salvaDatiSegna() {
  localStorage.setItem(`${STORAGE_KEY}:segna`, JSON.stringify(personeSegnate));
}

function creaPersonaSegnata(riga, indice) {
  const nome = ottieniNomePersona(riga);
  const id = `${nome}-${indice}-${contatoreId++}`;

  return {
    id,
    nome,
    riga
  };
}

function aggiungiAllaCoda(riga, indice) {
  const nome = ottieniNomePersona(riga);
  const esiste = personeSegnate.some((item) => item.nome === nome);

  if (esiste) {
    return;
  }

  personeSegnate.push(creaPersonaSegnata(riga, indice));
  salvaDatiSegna();
  renderCoda();
  renderRiepilogoRaccolte();
}

function muoviInBasso(id) {
  const indice = personeSegnate.findIndex((item) => item.id === id);

  if (indice === -1) {
    return;
  }

  const [persona] = personeSegnate.splice(indice, 1);
  personeSegnate.push(persona);
  salvaDatiSegna();
  renderCoda();
  renderRiepilogoRaccolte();
}

function renderRiepilogoRaccolte() {
  const contenitore = document.getElementById('summaryRaccolte');

  if (!contenitore) {
    return;
  }

  const righe = leggiDatiSalvati();

  if (!righe.length) {
    contenitore.innerHTML = '';
    return;
  }

  const gruppi = {};

  righe.forEach((riga) => {
    const raccolta = ottieniRaccoltaPersona(riga);

    if (!gruppi[raccolta]) {
      gruppi[raccolta] = { nome: raccolta, totale: 0, segnati: 0, persone: [] };
    }

    gruppi[raccolta].totale += 1;
    gruppi[raccolta].persone.push(riga);
  });

  personeSegnate.forEach((persona) => {
    const raccolta = ottieniRaccoltaPersona(persona.riga);

    if (gruppi[raccolta]) {
      gruppi[raccolta].segnati += 1;
    }
  });

  const cards = Object.values(gruppi)
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((gruppo) => {
      const mancanti = Math.max(gruppo.totale - gruppo.segnati, 0);
      const stato = mancanti === 0 ? 'complete' : 'pending';

      return `
        <button class="collection-card ${stato}" data-raccolta="${gruppo.nome}">
          <div class="collection-name">${gruppo.nome}</div>
          <div class="collection-missing">${mancanti} mancanti</div>
          <div class="collection-meta">${gruppo.segnati}/${gruppo.totale} segnati</div>
        </button>
      `;
    })
    .join('');

  contenitore.innerHTML = cards;

  contenitore.querySelectorAll('.collection-card').forEach((button) => {
    button.addEventListener('click', () => {
      mostraDettaglioRaccolta(button.dataset.raccolta);
    });
  });
}

function mostraDettaglioRaccolta(raccoltaSelezionata) {
  const contenitore = document.getElementById('dettaglioRaccolta');

  if (!contenitore) {
    return;
  }

  const righe = leggiDatiSalvati();
  const personeMancanti = righe.filter((riga) => {
    const stessaRaccolta = ottieniRaccoltaPersona(riga) === raccoltaSelezionata;
    const giaSegnata = personeSegnate.some((persona) => persona.nome === ottieniNomePersona(riga));
    return stessaRaccolta && !giaSegnata;
  });

  if (!personeMancanti.length) {
    contenitore.innerHTML = '<div class="empty-state">Tutti i nominativi di questa raccolta sono già segnati.</div>';
    return;
  }

  contenitore.innerHTML = `
    <div class="detail-title">${raccoltaSelezionata}</div>
    <div class="detail-list">
      ${personeMancanti.map((riga) => `
        <div class="detail-item">
          <div>
            <div class="detail-name">${ottieniNomePersona(riga)}</div>
            <div class="detail-phone">${ottieniTelefonoPersona(riga) || 'Telefono non presente'}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPersoneDisponibili() {
  const contenitore = document.getElementById('personeDisponibili');
  const status = document.getElementById('segnaStatus');

  if (!contenitore) return;

  const righe = leggiDatiSalvati();

  if (!righe.length) {
    contenitore.innerHTML = '<div class="empty-state">Nessuna persona caricata. Torna alla home e carica un file.</div>';
    if (status) {
      status.textContent = 'Carica un file dalla home per iniziare.';
    }
    return;
  }

  contenitore.innerHTML = righe.slice(0, 40).map((riga, index) => {
    const nome = ottieniNomePersona(riga);
    const raccolta = ottieniRaccoltaPersona(riga);
    return `
      <button class="person-pill" data-index="${index}">
        <span class="person-name">${nome}</span>
        <span class="person-meta">${raccolta}</span>
      </button>
    `;
  }).join('');

  contenitore.querySelectorAll('.person-pill').forEach((button) => {
    button.addEventListener('click', () => {
      const indice = Number(button.dataset.index);
      aggiungiAllaCoda(righe[indice], indice);
      if (status) {
        status.textContent = `Segnata ${ottieniNomePersona(righe[indice])}.`;
      }
    });
  });
}

function renderCoda() {
  const contenitore = document.getElementById('codaSegna');
  const status = document.getElementById('segnaStatus');

  if (!contenitore) return;

  if (!personeSegnate.length) {
    contenitore.innerHTML = '<div class="empty-state">Nessun nome segnato ancora.</div>';
    if (status) {
      status.textContent = 'Clicca una persona a sinistra per creare la coda.';
    }
    return;
  }

  contenitore.innerHTML = personeSegnate.map((persona) => `
    <button class="queue-tile" data-id="${persona.id}">
      <span>${persona.nome}</span>
    </button>
  `).join('');

  contenitore.querySelectorAll('.queue-tile').forEach((button) => {
    button.addEventListener('click', () => {
      muoviInBasso(button.dataset.id);
      if (status) {
        status.textContent = `Hai spostato ${button.textContent.trim()} in fondo alla scala mobile.`;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const datiSalvati = leggiDatiSalvati();

  if (datiSalvati.length) {
    renderPersoneDisponibili();
  } else {
    renderPersoneDisponibili();
  }

  const personeSalvate = JSON.parse(localStorage.getItem(`${STORAGE_KEY}:segna`) || '[]');

  if (Array.isArray(personeSalvate) && personeSalvate.length) {
    personeSegnate = personeSalvate;
    contatoreId = personeSegnate.length + 1;
  }

  renderCoda();
  renderRiepilogoRaccolte();
});

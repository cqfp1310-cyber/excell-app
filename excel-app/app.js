const STORAGE_KEY = 'excelAppRows';
const fileInput = document.getElementById('fileInput');
const loadButton = document.getElementById('loadButton');
const statusEl = document.getElementById('status');
const listaDatiEl = document.getElementById('listaDati');
const filterResultEl = document.getElementById('filterResult');
const filterTavoloBtn = document.getElementById('filterTavoloBtn');
const filterAllergieBtn = document.getElementById('filterAllergieBtn');
const filterSaldoBtn = document.getElementById('filterSaldoBtn');
const filterRaccoltaBtn = document.getElementById('filterRaccoltaBtn');

function salvaDatiInMemoria(dati) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dati));
  } catch (error) {
    console.warn('Impossibile salvare i dati localmente.', error);
  }
}

function mostraDati() {
  if (!ottieniDatiCaricati()) {
    if (listaDatiEl) {
      listaDatiEl.textContent = 'Nessun dato ancora caricato.';
    }
    return;
  }

  const righeOrdinate = ordinaPerSaldo(ottieniDatiCaricati());

  if (listaDatiEl) {
    const righe = righeOrdinate.slice(0, 20).map((riga, index) => {
      const testo = creaTestoRiga(riga, 'saldo');
      return `<div><strong>${index + 1}.</strong> ${testo}</div>`;
    }).join('');
    listaDatiEl.innerHTML = righe;
  }
}

function mostraRisultatoFiltro(tipo) {
  if (!ottieniDatiCaricati() || !filterResultEl) {
    return;
  }

  const righe = ottieniRigheFiltrate(tipo).slice(0, 12);
  const lista = righe.map((riga, index) => `<div><strong>${index + 1}.</strong> ${creaTestoRiga(riga, tipo)}</div>`).join('');
  filterResultEl.innerHTML = lista;
}

function caricaDatiSalvati() {
  try {
    const datiSalvati = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(datiSalvati) && datiSalvati.length) {
      impostaDatiCaricati(datiSalvati);
      if (statusEl) {
        statusEl.textContent = `Dati recuperati. Righe trovate: ${datiSalvati.length}`;
      }
      mostraDati();
    }
  } catch (error) {
    console.warn('Nessun dato salvato trovato.', error);
  }
}

loadButton.addEventListener('click', () => {
  const file = fileInput.files?.[0];

  if (!file) {
    statusEl.textContent = 'Seleziona un file prima.';
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rows.length) {
        statusEl.textContent = 'Il file non contiene dati.';
        return;
      }

      impostaDatiCaricati(rows);
      salvaDatiInMemoria(rows);
      statusEl.textContent = `File caricato correttamente. Righe trovate: ${rows.length}`;
      mostraDati();
    } catch (error) {
      statusEl.textContent = 'Errore: file non leggibile. Prova con .xlsx, .xls o .csv.';
    }
  };

  reader.readAsBinaryString(file);
});

if (filterTavoloBtn) {
  filterTavoloBtn.addEventListener('click', () => mostraRisultatoFiltro('tavolo'));
}
if (filterAllergieBtn) {
  filterAllergieBtn.addEventListener('click', () => mostraRisultatoFiltro('allergie'));
}
if (filterSaldoBtn) {
  filterSaldoBtn.addEventListener('click', () => mostraRisultatoFiltro('saldo'));
}
if (filterRaccoltaBtn) {
  filterRaccoltaBtn.addEventListener('click', () => mostraRisultatoFiltro('raccolta'));
}

caricaDatiSalvati();
mostraDati();

document.addEventListener('DOMContentLoaded', () => {
  const exportButton = document.getElementById('btnExportSegna');
  const exportStatus = document.getElementById('exportStatus');

  if (!exportButton) {
    return;
  }

  exportButton.addEventListener('click', () => {
    const rows = JSON.parse(localStorage.getItem('excelAppRows') || '[]');
    const segnati = JSON.parse(localStorage.getItem('excelAppRows:segna') || '[]');

    const payload = {
      exportDate: new Date().toISOString(),
      totalRows: Array.isArray(rows) ? rows.length : 0,
      segnati: Array.isArray(segnati) ? segnati.map((item) => ({
        nome: item.nome || '',
        raccolta: item.riga?.raccolta || item.riga?.Raccolta || item.riga?.['raccolta'] || '',
        telefono: item.riga?.telefono || item.riga?.Telefono || item.riga?.['telefono'] || ''
      })) : [],
      personeRimanenti: Array.isArray(rows)
        ? rows.filter((riga) => !segnati.some((item) => item.nome === (riga.nominativo || riga.Nominativo || riga['nominativo'] || '')))
            .map((riga) => ({
              nome: riga.nominativo || riga.Nominativo || riga['nominativo'] || 'Senza nome',
              raccolta: riga.raccolta || riga.Raccolta || riga['raccolta'] || '',
              telefono: riga.telefono || riga.Telefono || riga['telefono'] || ''
            }))
        : []
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `segna-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);

    if (exportStatus) {
      exportStatus.textContent = 'File esportato con successo.';
    }
  });
});

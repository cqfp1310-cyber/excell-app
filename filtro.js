let datiCaricati = null;

function normalizzaNumero(value) {
  const numero = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numero) ? numero : 999999;
}

function ordinaPerTavolo(righe) {
  return [...righe].sort((a, b) => {
    const tavoloA = normalizzaNumero(a.tavolo ?? a.Tavolo ?? a['tavolo']);
    const tavoloB = normalizzaNumero(b.tavolo ?? b.Tavolo ?? b['tavolo']);
    return tavoloA - tavoloB;
  });
}

function ordinaPerAllergie(righe) {
  return [...righe].sort((a, b) => {
    const allergiaA = String(a.allergie ?? a.Allergie ?? a['allergie'] ?? '').trim();
    const allergiaB = String(b.allergie ?? b.Allergie ?? b['allergie'] ?? '').trim();
    const hasValueA = allergiaA.length > 0 ? 1 : 0;
    const hasValueB = allergiaB.length > 0 ? 1 : 0;

    if (hasValueA === hasValueB) return 0;
    return hasValueB - hasValueA;
  });
}

function ordinaPerSaldo(righe) {
  return [...righe].sort((a, b) => {
    const saldoA = String(a.saldo ?? a.Saldo ?? a['saldo'] ?? '').trim().toLowerCase();
    const saldoB = String(b.saldo ?? b.Saldo ?? b['saldo'] ?? '').trim().toLowerCase();

    const hasNumberA = /^-?\d+(?:[.,]\d+)?$/.test(saldoA);
    const hasNumberB = /^-?\d+(?:[.,]\d+)?$/.test(saldoB);

    if (hasNumberA && !hasNumberB) return -1;
    if (!hasNumberA && hasNumberB) return 1;
    if (!hasNumberA && !hasNumberB) return 0;

    const numericA = Number(saldoA.replace(',', '.'));
    const numericB = Number(saldoB.replace(',', '.'));
    return numericA - numericB;
  });
}

function ordinaPerRaccolta(righe) {
  return [...righe].sort((a, b) => {
    const raccoltaA = String(a.raccolta ?? a.Raccolta ?? a['raccolta'] ?? '').trim().toLowerCase();
    const raccoltaB = String(b.raccolta ?? b.Raccolta ?? b['raccolta'] ?? '').trim().toLowerCase();

    if (raccoltaA === raccoltaB) return 0;
    if (!raccoltaA) return 1;
    if (!raccoltaB) return -1;
    return raccoltaA.localeCompare(raccoltaB);
  });
}

function impostaDatiCaricati(dati) {
  datiCaricati = dati;
}

function ottieniDatiCaricati() {
  return datiCaricati;
}

function creaTestoRiga(riga, tipo) {
  const nome = riga.nominativo ?? riga.Nominativo ?? riga['nominativo'] ?? 'Senza nome';

  if (tipo === 'tavolo') {
    const tavolo = riga.tavolo ?? riga.Tavolo ?? riga['tavolo'] ?? '—';
    return `${nome} — Tavolo ${tavolo}`;
  }

  if (tipo === 'allergie') {
    const allergie = String(riga.allergie ?? riga.Allergie ?? riga['allergie'] ?? '').trim();
    return allergie ? `${nome} — Allergie: ${allergie}` : `${nome} — Nessuna allergia`;
  }

  if (tipo === 'raccolta') {
    const raccolta = String(riga.raccolta ?? riga.Raccolta ?? riga['raccolta'] ?? '').trim();
    return raccolta ? `${nome} — Raccolta: ${raccolta}` : `${nome} — Raccolta vuota`;
  }

  const saldo = String(riga.saldo ?? riga.Saldo ?? riga['saldo'] ?? '').trim();
  return saldo ? `${nome} — Saldo: ${saldo}` : `${nome} — Saldo vuoto`;
}

function ottieniRigheFiltrate(tipo) {
  if (!datiCaricati) return [];

  if (tipo === 'tavolo') return ordinaPerTavolo(datiCaricati);
  if (tipo === 'allergie') return ordinaPerAllergie(datiCaricati);
  if (tipo === 'raccolta') return ordinaPerRaccolta(datiCaricati);
  return ordinaPerSaldo(datiCaricati);
}

document.addEventListener('DOMContentLoaded', () => {
  const btnSaldo = document.getElementById('btnSegnaSaldo');
  const btnTassa = document.getElementById('btnSegnaTassa');
  const btnPostazione = document.getElementById('btnSegnaPostazione');
  const status = document.getElementById('moneyStatus');

  if (!btnSaldo || !btnTassa || !btnPostazione) {
    return;
  }

  const mostraMessaggio = (tipo) => {
    if (status) {
      status.textContent = `Segna soldi: ${tipo}.`;
    }
  };

  btnSaldo.addEventListener('click', () => mostraMessaggio('Saldo'));
  btnTassa.addEventListener('click', () => mostraMessaggio('Tassa'));
  btnPostazione.addEventListener('click', () => mostraMessaggio('Postazione'));
});

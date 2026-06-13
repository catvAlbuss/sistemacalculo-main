import { datosEspectro, normaVersion } from './index.js';

function exportTXT() {
  if (!datosEspectro.length) return;

  const pasoVal = parseFloat(document.getElementById('paso').value);

  const filtrados = datosEspectro.filter(d => {
    const m = Math.round(d.T / pasoVal);
    return Math.abs(d.T - m * pasoVal) < 1e-9;
  });

  const txt = filtrados.map(d => `${d.T.toFixed(3)} ${d.Sa.toFixed(4)}`).join('\r\n');

  const blob = new Blob([new TextEncoder().encode(txt)], { type: 'text/plain;charset=utf-8' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  const fecha = new Date().toISOString().slice(0, 10);
  a.download = normaVersion === 'puentes'
    ? `Espectro_Puentes-MTC_${fecha}.txt`
    : normaVersion === 'e031'
      ? `Espectro_E031-Aislamiento_${fecha}.txt`
      : `Espectro_E030-${normaVersion}_${fecha}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export { exportTXT };

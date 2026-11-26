// Modal "Revisión del agente (E.030)" en Edge sin pantalla: muestra las verificaciones con su estado y
// acción, y recalcula al cambiar R. Los datos salen del motor real (engine/revisionE030.js) sobre la
// respuesta guardada del motor sísmico.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, mkdtempSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {build} from 'vite';
import {runBrowserFixture, removeTempDir} from './browserFixture.mjs';
import {revisarModelo, revisarResultados, resumirRevision} from '../../resources/js/cad/engine/revisionE030.js';

const browser = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const res = JSON.parse(readFileSync('python-backend/tests/response_seismic.json', 'utf8'));
const puntos = [0, 0.6, 1, 2, 3].map((T) => ({T, Sa: 0.1887 * (T <= 0.6 ? 1 : T <= 2 ? 0.6 / T : 1.2 / (T * T))}));
const revision = (R) => {
  const modelo = revisarModelo({apoyos: 16, barras: 190, sinSeccion: 0, cargas: {muerta: true, viva: true}, masa: true, espectroX: true, espectroY: true});
  const s = revisarResultados({direcciones: {X: {resultado: res, espectro: {puntos, factor: 9.80665}}, Y: {resultado: res, espectro: {puntos, factor: 9.80665}}}, R});
  const verificaciones = [...modelo, ...s.verificaciones];
  return {verificaciones, supuestos: s.supuestos, parametros: s.parametros, hayResultados: true, casos: {X: 'SDX', Y: 'SDY'}, resumen: resumirRevision(verificaciones)};
};

test('revisión del agente: estados, acción y recálculo al cambiar R', {skip: !browser && 'sin Edge'}, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'revision-agente-'));
  try {
    const alpineBuild = await build({configFile: false, logLevel: 'silent', plugins: [{name: 'alpine-fixture', resolveId: (id) => (id === 'rev-alpine-fixture' ? id : null), load: (id) => (id === 'rev-alpine-fixture' ? "import Alpine from 'alpinejs';window.Alpine=Alpine;" : null)}], build: {write: false, minify: true, rollupOptions: {input: 'rev-alpine-fixture', output: {format: 'iife', name: 'AlpineFixture'}}}});
    writeFileSync(join(dir, 'alpine.js'), alpineBuild.output.find((f) => f.type === 'chunk' && f.isEntry).code);
    const markup = readFileSync('resources/views/components/cad/modals/revision-agente-modal.blade.php', 'utf8').replace(/\{\{--[\s\S]*?--\}\}/g, '');
    writeFileSync(join(dir, 'index.html'), `<!doctype html><html><meta charset="utf-8"><body>${markup}<pre id="result"></pre><script>
      const R8 = ${JSON.stringify(revision(8))}, R6 = ${JSON.stringify(revision(6))};
      window.cadSystem = {calcularRevisionAgente: (o) => (Number(o.R) === 6 ? R6 : R8)};
      const fin = (t) => { document.querySelector('#result').textContent = t; };
      const espera = (ms) => new Promise((r) => setTimeout(r, ms));
      const filaDe = (txt) => [...document.querySelectorAll('tbody tr')].find((tr) => tr.textContent.includes('Sismo X') && tr.textContent.includes(txt));
      document.addEventListener('alpine:initialized', async () => {
        try {
          window.dispatchEvent(new CustomEvent('open-revision-agente-modal', {detail: R8}));
          await espera(150);
          const deriva = filaDe('Deriva inelástica máxima');
          if (!deriva) return fin('FAIL sin fila de deriva');
          if (!deriva.textContent.includes('No cumple') || !deriva.textContent.includes('Rigidiza en X')) return fin('FAIL deriva R8: ' + deriva.textContent.replace(/\\s+/g, ' ').slice(0, 200));
          if (!/no cumplen/.test(document.body.textContent)) return fin('FAIL sin resumen');
          const r = document.querySelector('input[type=number]');
          r.value = '6'; r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change'));
          await espera(150);
          const deriva6 = filaDe('Deriva inelástica máxima');
          if (!deriva6.textContent.includes('Cumple') || deriva6.textContent.includes('No cumple')) return fin('FAIL deriva R6: ' + deriva6.textContent.replace(/\\s+/g, ' ').slice(0, 200));
          fin('PASS');
        } catch (e) { fin('FAIL ' + e.message); }
      });
    </script><script src="alpine.js" defer></script><script>document.addEventListener('DOMContentLoaded', () => window.Alpine?.start?.());</script>`);
    assert.equal(await runBrowserFixture(browser, join(dir, 'index.html'), {profile: join(dir, 'perfil'), width: 1300, height: 900}), 'PASS');
  } finally {
    removeTempDir(dir);
  }
});

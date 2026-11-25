// Diseño de vigas del programa de análisis estructural: además de las combinaciones de acero
// predeterminadas, el usuario arma la suya (cantidad de barras por diámetro), como en el programa
// de diseño de vigas. Se prueba el modal real (Blade + Alpine) en Edge sin pantalla.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, mkdtempSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {build} from 'vite';
import {runBrowserFixture, removeTempDir} from './browserFixture.mjs';
import {BAR_SIZES} from '../../resources/js/vigas/utils/steelEditor.js';
import {RC_REBAR_OPTIONS} from '../../resources/js/cad/mixins/analysis/rcBeamDesign.js';

const browser = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);

test('diseño de viga: combinación de acero personalizada aplicada a una celda', {skip: !browser && 'sin Edge'}, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'viga-acero-'));
  try {
    const alpineBuild = await build({configFile: false, logLevel: 'silent', plugins: [{name: 'alpine-fixture', resolveId: (id) => (id === 'viga-alpine-fixture' ? id : null), load: (id) => (id === 'viga-alpine-fixture' ? "import Alpine from 'alpinejs';window.Alpine=Alpine;" : null)}], build: {write: false, minify: true, rollupOptions: {input: 'viga-alpine-fixture', output: {format: 'iife', name: 'AlpineFixture'}}}});
    writeFileSync(join(dir, 'alpine.js'), alpineBuild.output.find((f) => f.type === 'chunk' && f.isEntry).code);
    // El Blade del modal no usa directivas de Blade: basta quitar sus comentarios.
    const markup = readFileSync('resources/views/components/cad/modals/viga-design-modal.blade.php', 'utf8').replace(/\{\{--[\s\S]*?--\}\}/g, '');
    const meta = Array.from({length: 3}, () => ({b: 30, h: 50, fc: 210, fy: 4200, As_max: 20, As_usar: 4}));
    const detail = {
      input: {parametros: {numTramos: 1}, datos: {}},
      results: {flexion: {columnGroups: [{title: 'Tramo 1', columns: ['Izq', 'Centro', 'Der']}], positivo: {title: 'Flexión positiva', data: {meta, As_usar: [4, 4, 4]}}, negativo: {title: 'Flexión negativa', data: {meta, As_usar: [4, 4, 4]}}}},
      rebarState: {negativo: {asReal: [0, 0, 0], phiMn: [0, 0, 0]}, positivo: {asReal: [0, 0, 0], phiMn: [0, 0, 0]}},
      rebarOptions: RC_REBAR_OPTIONS,
      barSizes: BAR_SIZES,
      groupsConfig: {},
    };
    writeFileSync(join(dir, 'index.html'), `<!doctype html><html><meta charset="utf-8"><body>${markup}<pre id="result"></pre><script>
      window.llamadas = [];
      window.cadSystem = {rcBeamDesignSetRebar: (...a) => window.llamadas.push(a)};
      const fin = (t) => { document.querySelector('#result').textContent = t; };
      const espera = (ms) => new Promise((r) => setTimeout(r, ms));
      document.addEventListener('alpine:initialized', async () => {
        try {
          window.dispatchEvent(new CustomEvent('open-viga-design-modal', {detail: ${JSON.stringify(detail)}}));
          await espera(150);
          const selects = [...document.querySelectorAll('select')].filter((s) => s.offsetParent !== null);
          if (selects.length !== 6) return fin('FAIL selects ' + selects.length);
          const sel = selects[4]; // positivo, tramo 1, centro
          if (![...sel.options].some((o) => o.value === 'custom')) return fin('FAIL sin opción personalizada');
          sel.value = 'custom'; sel.dispatchEvent(new Event('change'));
          await espera(100);
          const dialogo = document.querySelector('[aria-labelledby="rc-custom-rebar-title"]');
          if (!dialogo || dialogo.offsetParent === null) return fin('FAIL no se abrió el editor');
          const cant = (d) => [...dialogo.querySelectorAll('input')].find((i) => i.getAttribute('aria-label') === 'Cantidad de barras ' + d);
          cant('5/8"').value = '2'; cant('5/8"').dispatchEvent(new Event('input'));
          cant('1/2"').value = '1'; cant('1/2"').dispatchEvent(new Event('input'));
          await espera(50);
          if (!/Área acumulada: 5\\.2[23] cm²/.test(dialogo.textContent.replace(/\\s+/g, ' ')) || !dialogo.textContent.includes('2Ø5/8"+1Ø1/2"')) return fin('FAIL área ' + dialogo.textContent.replace(/\\s+/g, ' ').slice(-160));
          [...dialogo.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Aplicar').click();
          await espera(100);
          const ultima = window.llamadas.at(-1);
          if (!ultima || ultima.join('|') !== 'positivo|1|1|5.225') return fin('FAIL llamada ' + JSON.stringify(window.llamadas));
          if (dialogo.offsetParent !== null) return fin('FAIL el editor no se cerró');
          if (![...sel.options].some((o) => o.value === '5.225' && o.text.startsWith('2Ø5/8"+1Ø1/2"'))) return fin('FAIL la combinación no quedó en la lista');
          // Una combinación vacía no se aplica.
          sel.value = 'custom'; sel.dispatchEvent(new Event('change'));
          await espera(100);
          [...dialogo.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Aplicar').click();
          await espera(50);
          if (!dialogo.textContent.includes('Agregue al menos una barra.') || window.llamadas.length !== 1) return fin('FAIL vacío');
          fin('PASS');
        } catch (e) { fin('FAIL ' + e.message); }
      });
    </script><script src="alpine.js" defer></script><script>document.addEventListener('DOMContentLoaded', () => window.Alpine?.start?.());</script>`);
    assert.equal(await runBrowserFixture(browser, join(dir, 'index.html'), {profile: join(dir, 'perfil'), width: 1400, height: 900}), 'PASS');
  } finally {
    removeTempDir(dir);
  }
});

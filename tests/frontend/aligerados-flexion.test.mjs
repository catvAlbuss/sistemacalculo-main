import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { build } from 'vite';
import { createFlexionModel } from '../../resources/js/aligerados-flexion.js';

test('automatic reinforcement keeps original thresholds and manual selections survive mutation', () => {
  const mutate = createFlexionModel().mutators.diametro.mutator;
  for (const [area, expected] of [[0.11, '1 \u00d8 3/8"'], [0.95, '1 \u00d8 1/2"'], [2, '1 \u00d8 5/8"'], [6.54, '2 \u00d8 5/8" + 2 \u00d8 1/2"']]) {
    assert.equal(mutate(undefined, { Asd: area }), expected);
  }
  assert.equal(mutate('8 \u00d8 3/4"', { Asd: 1.1 }), '8 \u00d8 3/4"');
});

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
test('real flexion table: edit, independent spans, undo, row updates and recalculation', {
  skip: !existsSync(chrome), timeout: 60000,
}, async () => {
  const entry = `
    import { createSpreeadSheetTable } from './resources/js/tabulator_base/table_factory.js';
    import { createFlexionModel, bindFlexionDiagram } from './resources/js/aligerados-flexion.js';
    const check = (condition, label) => { if (!condition) throw Error(label); };
    (async () => {
      document.body.innerHTML = '<div id="T1"></div><div id="asd"></div>';
      const table = createSpreeadSheetTable(createFlexionModel());
      const spans = [{lti: 4.26}, {lti: 2.5}];
      const diagram = document.getElementById('asd');
      bindFlexionDiagram(table, spans, [63, 37], diagram);
      await new Promise(resolve => table.on('tableBuilt', resolve));
      const values = [1.1, .95, 1.11, 1.11, .11, .13];
      const fresh = () => values.map(Asd => ({Mu: .67, Asd, Asmin: .58}));
      await table.addData(fresh());
      const rows = table.getRows();
      check(diagram.children.length === 2, 'two spans');
      check(diagram.children[0].textContent.includes('L = 1.42m'), 'original lengths');
      const cell = rows[4].getCell('diametro');
      cell.edit();
      const input = cell.getElement().querySelector('input');
      check(input, 'diameter is editable');
      input.value = '1 \u00d8 3/4"';
      input.dispatchEvent(new Event('input', {bubbles: true}));
      input.dispatchEvent(new KeyboardEvent('keyup', {key: '4', bubbles: true}));
      input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', keyCode: 13, bubbles: true}));
      await new Promise(resolve => setTimeout(resolve, 50));
      check(cell.getValue() === '1 \u00d8 3/4"', 'editor commits manual diameter');
      check(diagram.children[1].lastElementChild.textContent.includes(cell.getValue()), 'middle of second span updates');
      check(!diagram.children[0].textContent.includes('3/4'), 'first span unchanged');
      check(table.getData()[4].Asd === .11 && table.getData()[4].Mu === .67, 'calculated quantities unchanged');
      table.undo();
      check(cell.getValue() === '1 \u00d8 3/8"', 'undo restores original diameter');
      check(diagram.children[1].lastElementChild.textContent.includes(cell.getValue()), 'undo updates drawing');
      table.redo();
      check(diagram.children[1].lastElementChild.textContent.includes('3/4'), 'redo updates drawing');
      await rows[0].update({diametro: '8 \u00d8 3/4" + 2 \u00d8 5/8"'});
      check(diagram.children[0].firstElementChild.firstElementChild.textContent.includes('8 \u00d8 3/4"'), 'custom combination stays at left support');
      await rows[5].update({diametro: '<img src=x onerror=alert(1)>'});
      check(!diagram.querySelector('img'), 'manual labels are escaped');
      check(table.getData()[0].diametro.includes('8 \u00d8'), 'PDF data uses edited selection');
      await table.replaceData(fresh());
      check(!diagram.textContent.includes('3/4'), 'recalculation resets suggestions');
      table.destroy();
      const next = createSpreeadSheetTable(createFlexionModel());
      bindFlexionDiagram(next, spans, [63,37], diagram);
      await new Promise(resolve => next.on('tableBuilt', resolve));
      await next.addData(fresh());
      next.getRows()[2].getCell('diametro').setValue('2 \u00d8 5/8"');
      check(diagram.children[0].firstElementChild.lastElementChild.textContent.includes('2 \u00d8 5/8"'), 'edit after new calculation');
      document.body.innerHTML = '<pre id="result">PASS</pre>';
    })().catch(error => { document.body.innerHTML = '<pre id="result">FAIL: ' + error.stack + '</pre>'; });
  `;
  const virtualEntry = resolve('aligerados-browser-test.js').replaceAll('\\', '/');
  const bundle = await build({configFile: false, logLevel: 'error', plugins: [{
    name: 'aligerados-browser-test', enforce: 'pre',
    resolveId: id => id.endsWith('aligerados-browser-test.js') ? virtualEntry : undefined,
    load: id => id.endsWith('aligerados-browser-test.js') ? entry : undefined,
  }], build: {write: false, minify: false, lib: {entry: virtualEntry, formats: ['iife'], name: 'AligeradosTest'}}});
  const dir = mkdtempSync(join(tmpdir(), 'aligerados-flexion-'));
  try {
    const output = Array.isArray(bundle) ? bundle[0].output : bundle.output;
    const code = output.find(item => item.type === 'chunk').code;
    const path = join(dir, 'test.html');
    writeFileSync(path, '<meta charset="utf-8"><body><script>' + code.replaceAll('</script', '<\\/script') + '</script>');
    const result = spawnSync(chrome, ['--headless', '--no-sandbox', '--disable-gpu', '--no-first-run',
      '--disable-background-networking', '--user-data-dir=' + join(dir, 'profile'), '--dump-dom',
      '--virtual-time-budget=5000', pathToFileURL(path).href], {encoding: 'utf8', windowsHide: true, timeout: 45000, maxBuffer: 5*1024*1024});
    assert.ifError(result.error);
    const status = result.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];
    assert.equal(status, 'PASS', status || result.stderr.slice(-2000));
  } finally {
    assert.ok(resolve(dir).startsWith(resolve(tmpdir()) + sep));
    rmSync(dir, {recursive: true, force: true});
  }
});


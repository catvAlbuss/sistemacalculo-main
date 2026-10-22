import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { build } from 'vite';
import { BAR_SIZES, steelArea } from '../../resources/js/vigas/utils/steelEditor.js';
import { GENERAL_STEEL_OPTIONS, SIMPLE_STEEL_OPTIONS } from '../../resources/js/vigas/config/steelOptions.js';

test('permite ocho barras de 3/4 y mezclas personalizadas', () => {
    const counts = BAR_SIZES.map(() => 0);
    counts[6] = 8;
    assert.equal(steelArea(counts), 22.8);
    counts[5] = 2;
    assert.ok(Math.abs(steelArea(counts) - 26.758) < 1e-10);
    counts[8] = 1;
    assert.ok(Math.abs(steelArea(counts) - 36.818) < 1e-10);
    assert.equal(steelArea([]), 0);
    for (const invalid of [-1, 1.5, Infinity, NaN]) {
        assert.throws(() => steelArea([invalid]), RangeError);
    }
});

test('compilan los dos módulos de vigas con Vite', async () => {
    await build({
        configFile: false,
        logLevel: 'error',
        build: {
            write: false,
            rollupOptions: {
                input: ['resources/js/adm_desing_vigas.js', 'resources/js/adm_vigas_general.js'],
            },
        },
    });
});

const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
test('edición real en navegador: capas, posiciones, validación y rediseño', {
    skip: !existsSync(edge),
    timeout: 60000,
}, async () => {
    const simpleSource = readFileSync('resources/js/adm_desing_vigas.js', 'utf8')
        .replace(/^import .*;\r?\n/gm, '');
    const entry = `
        import $ from 'jquery';
        import { createSteelEditor } from './resources/js/vigas/utils/steelEditor.js';
        import { GENERAL_STEEL_OPTIONS, SIMPLE_STEEL_OPTIONS } from './resources/js/vigas/config/steelOptions.js';
        import { renderFlexionResult } from './resources/js/vigas/renderers/flexionResultRenderer.js';
        window.$ = window.jQuery = $;
        const check = (ok, message) => { if (!ok) throw new Error(message); };
        const choose = (editor, value) => {
            const select = editor.querySelector('select');
            select.value = value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const checkOptions = (editor, expected) => {
            const options = [...editor.querySelector('select').options];
            check(JSON.stringify(options.slice(0, -1).map(({value, text}) => ({value, text}))) === JSON.stringify(expected),
                'Conserva todas las combinaciones originales y sus valores');
            check(options.at(-1).value === 'custom', 'Opción adicional de combinación personalizada');
        };
        const edit = (editor, index, value) => {
            if (editor.querySelector('select').value !== 'custom') choose(editor, 'custom');
            const input = editor.querySelectorAll('input[type=number]')[index];
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        };
        (async () => {
            let typesets = 0;
            window.MathJax = { typeset: () => typesets++ };
            document.body.innerHTML = '<button id="desingButton"></button><button id="btn_pdf_predim"></button><button id="btn_captura_resultado"></button>';
            const values = { fc: 210, fy: 4200, altura: 60, base: 30, momentoultimo: 20, vucortante: 10, capas: 1, cuantias: 1 };
            for (const [id, value] of Object.entries(values)) {
                const input = document.createElement('input'); input.id = id; input.value = value;
                document.body.append(input);
            }
            const table = document.createElement('table'); table.id = 'desingcorte';
            table.innerHTML = ['predimenension', 'desingFlexion', 'calcared', 'acerosfinales', 'diseñoCortes', 'aceroscortes']
                .map(id => '<tbody id="' + id + '"></tbody>').join('');
            document.body.append(table);
            new Function('createSteelEditor', 'SIMPLE_STEEL_OPTIONS', ${JSON.stringify(simpleSource)})(createSteelEditor, SIMPLE_STEEL_OPTIONS);
            await new Promise(resolve => $(resolve));
            await new Promise(resolve => setTimeout(resolve, 20));
            document.getElementById('desingButton').click();
            check(typesets === 1, 'Un procesamiento de fórmulas por diseño');
            const simpleEditor = document.getElementById('steel-editor');
            checkOptions(simpleEditor, SIMPLE_STEEL_OPTIONS);
            check(simpleEditor.querySelector('select').nextElementSibling.hidden, 'Editor personalizado oculto al iniciar');
            choose(simpleEditor, '7.96');
            check(document.getElementById('acerosfinales').textContent.includes('7.960'), 'Funciona la combinación original en viga simple');
            edit(document.getElementById('steel-editor'), 6, '8');
            check(document.getElementById('acerosfinales').textContent.includes('22.800'), 'Acero personalizado en viga simple');
            choose(simpleEditor, '5.68');
            check(document.getElementById('acerosfinales').textContent.includes('5.680'), 'Volver a la lista aplica solo el área predefinida');
            choose(simpleEditor, 'custom');
            check(document.getElementById('acerosfinales').textContent.includes('22.800'), 'Conserva las cantidades personalizadas al alternar');
            check(typesets === 1, 'Editar cantidades no procesa fórmulas');
            document.getElementById('desingButton').click();
            check(typesets === 2, 'Rediseño sin procesamiento duplicado');
            check(document.querySelectorAll('#steel-editor input[type=number]').length === 9, 'Un solo editor después de rediseñar');
            edit(document.getElementById('steel-editor'), 6, '8');
            check(document.getElementById('acerosfinales').textContent.includes('22.800'), 'Edición después de rediseño');

            const container = document.createElement('div'); container.id = 'general'; document.body.append(container);
            const meta = { b: 30, h: 60, fc: 210, fy: 4200, As_max: 40, Mu: 2000000 };
            const section = { title: 'Flexión', data: { meta: [meta, meta, meta] }, capas: { tramo1: { a: 2, b: 1, c: 1 } } };
            const updates = {};
            renderFlexionResult('#general', { type: 'FLEXION_INTERACTIVE', numTramos: 1, negativo: section, positivo: section },
                (state, type) => updates[type] = state);
            const negative = document.getElementById('layers_NEGATIVO');
            const editors = [...negative.querySelectorAll('.steel-combination-editor')];
            checkOptions(editors[0], GENERAL_STEEL_OPTIONS);
            choose(editors[0], '7.916');
            check(updates.NEGATIVO.asReal[0] === 7.916, 'Funciona la combinación original de vigas generales');
            edit(editors[0], 6, '8');
            check(updates.NEGATIVO.asReal[0] === 22.8, 'Área en primera posición');
            check(updates.NEGATIVO.asReal[1] === 0, 'Las posiciones son independientes');
            check(!updates.POSITIVO, 'Negativo y positivo son independientes');
            edit(editors[3], 5, '2');
            check(Math.abs(updates.NEGATIVO.asReal[0] - 26.758) < 1e-10, 'Suma de capas');
            check(updates.NEGATIVO.phiMn[0] > 0, 'Actualiza momento resistente');
            edit(editors[0], 6, '-1');
            check(updates.NEGATIVO.asReal[0] === 3.958, 'Dato inválido retira el área anterior');
            check(!editors[0].querySelectorAll('input')[6].checkValidity(), 'Rechaza cantidades negativas');
            choose(editors[0], '7.916');
            check(editors[0].querySelectorAll('input')[6].checkValidity(), 'Datos personalizados inválidos no bloquean la lista');
            check(Math.abs(updates.NEGATIVO.asReal[0] - 11.874) < 1e-10, 'Cambio de modo conserva la otra capa');
            edit(editors[0], 6, '8');
            check(Math.abs(updates.NEGATIVO.asReal[0] - 26.758) < 1e-10, 'Recuperación después de dato inválido');
            const positiveEditor = document.getElementById('layers_POSITIVO').querySelector('.steel-combination-editor');
            checkOptions(positiveEditor, GENERAL_STEEL_OPTIONS);
            edit(positiveEditor, 6, '8');
            check(updates.POSITIVO.asReal[0] === 22.8, 'Acero positivo editable');
            document.body.innerHTML = '<pre id="result">PASS</pre>';
        })().catch(error => { document.body.innerHTML = '<pre id="result">FAIL: ' + error.stack + '</pre>'; });
    `;
    const virtualEntry = resolve('beam-browser-test.js').replaceAll('\\', '/');
    const bundled = await build({
        configFile: false,
        logLevel: 'error',
        plugins: [{
            name: 'beam-browser-test',
            enforce: 'pre',
            resolveId: id => id.endsWith('beam-browser-test.js') ? virtualEntry : undefined,
            load: id => id.endsWith('beam-browser-test.js') ? entry : undefined,
        }],
        build: { write: false, minify: false, lib: { entry: virtualEntry, formats: ['iife'], name: 'BeamTest' } },
    });
    const dir = mkdtempSync(join(tmpdir(), 'beam-steel-test-'));
    try {
        const htmlPath = join(dir, 'test.html');
        const output = Array.isArray(bundled) ? bundled[0].output : bundled.output;
        const js = output.find(item => item.type === 'chunk').code;
        writeFileSync(htmlPath, '<meta charset="utf-8"><body><script>' + js.replaceAll('</script', '<\\/script') + '</script>');
        const browser = spawnSync(edge, [
            '--headless', '--disable-gpu', '--disable-gpu-sandbox', '--no-sandbox',
            '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
            '--user-data-dir=' + join(dir, 'profile'), '--dump-dom', '--virtual-time-budget=3000',
            pathToFileURL(htmlPath).href,
        ], { encoding: 'utf8', timeout: 45000, windowsHide: true, maxBuffer: 5 * 1024 * 1024 });
        assert.ifError(browser.error);
        const result = browser.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];
        assert.equal(result, 'PASS', result || browser.stderr.slice(-2000));
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

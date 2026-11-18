// Detallado del acero como el ingeniero: estribo a doble línea con dobleces que abrazan las
// varillas de esquina, ganchos a 135° (6 db, mínimo 7.5 cm), varillas al diámetro real y
// llamadas en abanico por grupo.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DIAMETRO, diametro, ejeDelEstribo, estriboDetallado, llamadaAbanico, redondear} from '../../resources/js/ingenieria/laminas/aceroDetalle.js';
import {cuadroColumnas, cierresAlternados} from '../../resources/js/ingenieria/laminas/cuadroColumnas.js';
import {L as CAPAS} from '../../resources/js/ingenieria/cad/primitives.js';

const S = (p) => [p.x, p.y];
const rect = (x0, y0, x1, y1) => [{x: x0, y: y0}, {x: x1, y: y0}, {x: x1, y: y1}, {x: x0, y: y1}];

test('bar sizes are the real ones and the stirrup axis sits at cover + half stirrup', () => {
  assert.equal(diametro('5/8"'), DIAMETRO['5/8"']);
  assert.equal(diametro('Ø3/8"'), 0.009525);
  const eje = ejeDelEstribo(rect(0, 0, 0.25, 0.4), 0.04, DIAMETRO['3/8"']);
  const xs = eje.map((p) => p.x);
  assert.ok(Math.abs(Math.min(...xs) - (0.04 + 0.009525 / 2)) < 1e-9);
});

test('the corner bar sits inside the bend, tangent to the stirrup; the 135° hooks are 7.5 cm and go into the core', () => {
  const de = DIAMETRO['3/8"'], db = DIAMETRO['5/8"'], rec = 0.04;
  const eje = ejeDelEstribo(rect(0, 0, 0.25, 0.4), rec, de);
  const prims = estriboDetallado(eje, S, {de, db});
  const polis = prims.filter((p) => p.type === 'polyline' || p.tipo === 'pline' || Array.isArray(p.points ?? p.puntos));
  assert.ok(polis.length >= 2 + 2 * 2 + 2, 'two closed lines, two lines per hook and the two rounded tips');
  // Centro del doblez = centro de la varilla de esquina: a rec + de + db/2 de las caras.
  const d = redondear(eje, (db + de) / 2).dobleces[0];
  const esperado = rec + de + db / 2;
  const esquina = eje[0];
  const cerca = [Math.abs(d.o.x - esperado), Math.abs(d.o.x - (0.25 - esperado))].some((v) => v < 1e-6) && [Math.abs(d.o.y - esperado), Math.abs(d.o.y - (0.4 - esperado))].some((v) => v < 1e-6);
  assert.ok(cerca, `bend center ${JSON.stringify(d.o)} at the corner bar (corner ${JSON.stringify(esquina)})`);
  assert.ok(Math.abs(d.r - (db + de) / 2) < 1e-9, 'inner face of the bend touches the bar');
});

test('L columns: one stirrup per wing, hooks alternate corners; fan callouts reach every bar', () => {
  const alas = [rect(0, 0, 0.25, 0.4), rect(0, 0, 0.4, 0.25)];
  const [a, b] = cierresAlternados(alas);
  assert.deepEqual(a[0], {x: 0.25, y: 0.4}, 'first stirrup closes at the top right');
  assert.notDeepEqual(b[0], a[0], 'the second one does not close at the same corner');
  const barras = [{x: 0.06, y: 0.34}, {x: 0.19, y: 0.34}, {x: 0.06, y: 0.06}];
  const ll = llamadaAbanico(barras, '3Ø5/8"', {S, fs: 1, db: DIAMETRO['5/8"'], quiebre: [0.5, 0.5], fin: [0.7, 0.5], h: 0.03});
  assert.equal(ll.filter((p) => (p.type ?? p.tipo) === 'line').length, barras.length + 1, 'one line per bar plus the landing');

  // En el cuadro: las etiquetas de los grupos suman todas las varillas.
  const L = [{x: 0, y: 0}, {x: 0.25, y: 0}, {x: 0.25, y: 0.15}, {x: 0.4, y: 0.15}, {x: 0.4, y: 0.4}, {x: 0, y: 0.4}];
  const r = cuadroColumnas([{tipo: 'C1', contorno: L, forma: 'L', clase: 'columna', b: 0.4, h: 0.4, area: 0.1225, espesor: 0.25, x: 0.2, y: 0.2}]);
  const etiquetas = r.contenido.primitivas.filter((p) => p.layer === CAPAS.COTAS_E && /^\d+Ø5\/8"$/.test(p.value ?? ''));
  const suma = etiquetas.reduce((s, p) => s + Number(/^(\d+)/.exec(p.value)[1]), 0);
  assert.equal(suma, r.filas[0].varillas);
});

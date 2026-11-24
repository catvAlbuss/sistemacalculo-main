// Niveles de la arquitectura para los pórticos y escalera por tramos (sin planos privados).
import test from 'node:test';
import assert from 'node:assert/strict';
import {alturaDesdeArquitectura, nivelesDesdeArquitectura} from '../../resources/js/ingenieria/planos/porticoPlano.js';
import {predimensionarEscalera, contrapasosPorTramo, detallesEscaleraPorTramo} from '../../resources/js/ingenieria/planos/escaleraPlano.js';
import {cuadroColumnas, cuadroColumnetas} from '../../resources/js/ingenieria/laminas/cuadroColumnas.js';
import {detalleEmpalmesGanchos} from '../../resources/js/ingenieria/laminas/detallesTipicos.js';

const t = (texto) => ({tipo: 'texto', texto});
const veces = (n, texto) => Array.from({length: n}, () => t(texto));

test('pisos: los N.P.T. que se repiten, no un descanso suelto (ilo 01: +2.45 una vez)', () => {
  const items = [...veces(30, 'NPT= +3.65'), ...veces(10, 'NPT=+7.15'), t('NPT= +2.45'), ...veces(2, 'NPT= +5.95')];
  assert.deepEqual(nivelesDesdeArquitectura(items, 2), {entrepisos: [3.65], techo: 7.15, fuente: 'visible'});
});

test('un nivel sobre plataforma: el techo se cuenta desde su N.P.T. (vinchos 11: +3.35 y N.F.T. +8.78)', () => {
  const items = [...veces(20, 'N.P.T: +3.35'), ...veces(14, 'N.F.T: +8.78'), ...veces(14, 'N.T.T: +11.45')];
  assert.equal(Math.round(alturaDesdeArquitectura(items) * 100) / 100, 5.43);
  // Sin N.F.T., el techo terminado; sin nada, 3 m.
  assert.equal(alturaDesdeArquitectura([...veces(12, 'NPT=+0.15'), ...veces(12, 'NTT=+2.65')]), 2.65);
  assert.equal(alturaDesdeArquitectura([]), 3);
});

test('dos niveles sin N.P.T. del techo: el N.F.T. sobre el último piso', () => {
  const items = [...veces(25, 'N.P.T: +3.35'), ...veces(20, 'NPT= +0.15'), ...veces(6, 'N.F.T: +6.73'), ...veces(16, 'N.T.T: +8.89')];
  assert.deepEqual(nivelesDesdeArquitectura(items, 2), {entrepisos: [3.35], techo: 6.73, fuente: 'visible'});
});

test('escalera: tramos de la planta y contrapasos por tramo (ilo: 7, 6 y 7)', () => {
  const dim = predimensionarEscalera({tramos: [{peldanos: 7, huella: 0.3, ancho: 1.7}]}, 3.5);
  assert.equal(dim.nTramos, 3, 'un tramo de 7 peldaños dibujados sube 8 contrapasos: 21 / 8 → 3 tramos');
  assert.deepEqual(contrapasosPorTramo({...dim, contrapasos: 20}, {tramos: [{peldanos: 6}, {peldanos: 5}, {peldanos: 6}]}), [7, 6, 7]);
  const det = detallesEscaleraPorTramo(dim);
  assert.deepEqual(det.map((d) => d.contenido.titulo), ['DETALLE DE ESCALERA TRAMO I', 'DETALLE DE ESCALERA TRAMO II', 'DETALLE DE ESCALERA TRAMO III']);
  const niveles = det.map((d) => d.contenido.primitivas.filter((p) => p.type === 'text' && p.layer === 'E-NIVELES').map((p) => p.value));
  assert.equal(niveles[0][0], 'NPT ±0.00');
  assert.equal(niveles[1][0], `DESCANSO ${niveles[0][1]}`, 'el descanso de llegada es la salida del tramo siguiente');
  assert.equal(niveles[2][1], '+3.50');
});

test('cuadros con el formato del despacho: 1/25, pisos en NIVEL, todas las varillas dibujadas, placas de pie', () => {
  const rect = [{x: 0, y: 0}, {x: 1.4, y: 0}, {x: 1.4, y: 0.3}, {x: 0, y: 0.3}];
  const r = cuadroColumnas([{tipo: 'PL1', b: 1.4, h: 0.3, x: 0.7, y: 0.15, area: 0.42, forma: 'rectangular', clase: 'placa', contorno: rect}], {niveles: 2});
  const textos = r.contenido.primitivas.filter((p) => p.type === 'text').map((p) => p.value);
  assert.ok(textos.includes('1/25') && textos.includes('2° Piso') && textos.includes('CUADRO DE PLACA'));
  assert.equal(r.filas[0].varillas, Number(/^(\d+)/.exec(r.filas[0].refuerzo)[1]), 'el dibujo tiene las varillas que dice el texto');
  const seccion = r.contenido.primitivas.find((p) => p.type === 'pline' && p.layer === 'E-COLUMNAS');
  const xs = seccion.points.map((q) => q[0]), ys = seccion.points.map((q) => q[1]);
  assert.ok(Math.max(...ys) - Math.min(...ys) > Math.max(...xs) - Math.min(...xs), 'la placa alargada va de pie');
  const c = cuadroColumnetas([{codigo: 'pa', b: 0.2, h: 0.13}, {codigo: 'pb', b: 0.65, h: 0.13}], {niveles: 3});
  assert.ok(c.contenido.primitivas.some((p) => p.type === 'text' && p.value === '3° Piso'));
});

test('empalmes y ganchos del despacho: tabla sin escala con los traslapes por diámetro', () => {
  const d = detalleEmpalmesGanchos();
  assert.equal(d.sinEscala, true);
  const textos = d.primitivas.filter((p) => p.type === 'text').map((p) => p.value);
  for (const v of ['3/8"', '0.30', '0.40', '5/8"', '0.75', '1.15']) assert.ok(textos.includes(v), v);
});

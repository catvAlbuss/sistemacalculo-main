// Techo de la arquitectura → pórticos y modelo de análisis con las medidas del plano.
// Caso VILCABAMBA 1: techo a dos aguas asimétrico (50.95 % y 40 %) con la cumbrera sobre el eje C,
// cumbrera NFT +5.91 y una rampa al 10 % que no es el techo.
import test from 'node:test';
import assert from 'node:assert/strict';
import {pendientesDeTecho, picosDeTecho, techoDesdeArquitectura, nivelCumbreraEscrito, cotaDelTecho} from '../../resources/js/ingenieria/lectura/techoArquitectura.js';
import {planoPortico, pendienteDesdeArquitectura} from '../../resources/js/ingenieria/planos/porticoPlano.js';
import {modeloE2k} from '../../resources/js/ingenieria/analisis/modeloE2k.js';
import {verificarContraPlano} from '../../resources/js/ingenieria/analisis/conformidadPlano.js';
import {leerE2k} from '../../scripts/agente/lectorE2k.mjs';

const texto = (t, x, y, capa = 'TEXTOS') => ({tipo: 'texto', capa, texto: t, centro: {x, y}});
const linea = (a, b, capa = '1_LOSA Y TECHO EN CORTE') => ({tipo: 'linea', capa, puntos: [a, b]});
// Corte longitudinal lejos de la planta: alero izquierdo, pico 4.40 m más allá, faldón derecho de 6 m.
const corte = (sIzq = 0.5095, sDer = 0.4) => {
  const pico = {x: 104.4, y: 20};
  return [
    linea({x: pico.x - 4.4, y: pico.y - sIzq * 4.4}, pico), linea(pico, {x: pico.x + 6, y: pico.y - sDer * 6}),
    texto('CORTE LONGITUDINAL B - B MÓDULO I:', 104, 12),
  ];
};
const textosTecho = [
  texto('CUBIERTA: PLANCHA DE ALUZINC TR4 e=0.5 mm PENDIENTE: 50.95% - ∠ 27°', 60, 60, '1_TECHOS'),
  texto('PENDIENTE: 40%', 107, 19, '1_INDICADORES'),
  texto('RAMPA PENDIENTE 10%', 5, -5), texto('pendiente 10%-piso afirmado', 6, -6), texto('S = 1.0%', 2, 2),
  texto('NFT= + 4.59m', 90, 18), texto('NFT= + 5.91m', 112, 20), texto('NPT= +0.45m', 90, 14),
];
// Planta: ejes A (x=0), C (3.82), D (8.0) y 4 (y=0), 6 (3.86); columnas en los seis cruces.
const ejes = [
  {nombre: 'A', p: {x: 0, y: -1}, q: {x: 0, y: 5}}, {nombre: 'C', p: {x: 3.82, y: -1}, q: {x: 3.82, y: 5}}, {nombre: 'D', p: {x: 8, y: -1}, q: {x: 8, y: 5}},
  {nombre: '4', p: {x: -1, y: 0}, q: {x: 9, y: 0}}, {nombre: '6', p: {x: -1, y: 3.86}, q: {x: 9, y: 3.86}},
];
const columna = (ex, ey, x, y) => ({eje: `${ey}/${ex}`, tipo: 'C1', b: 0.3, h: 0.3, nodo: {x, y}, x, y,
  contorno: [{x: x - 0.15, y: y - 0.15}, {x: x + 0.15, y: y - 0.15}, {x: x + 0.15, y: y + 0.15}, {x: x - 0.15, y: y + 0.15}]});
const columnas = [['A', 0], ['C', 3.82], ['D', 8]].flatMap(([ex, x]) => [['4', 0], ['6', 3.86]].map(([ey, y]) => columna(ex, ey, x, y)));
const lectura = {ejes, columnas};
const items = [...corte(), ...textosTecho];

test('la pendiente del techo no es la de la rampa ni la del piso', () => {
  assert.deepEqual(pendientesDeTecho(items), [0.4, 0.5095]);
  assert.equal(pendienteDesdeArquitectura(items), 0.4);
  assert.deepEqual(pendientesDeTecho([texto('RAMPA PENDIENTE 10%', 0, 0), texto('S = 2%', 0, 0)]), []);
});

test('el corte da la cumbrera en el eje C con la pendiente de cada faldón', () => {
  const [pico] = picosDeTecho(items, {pendientes: pendientesDeTecho(items)});
  assert.equal(pico.sIzq, 0.5095);
  assert.equal(pico.sDer, 0.4);
  const t = techoDesdeArquitectura(items, {lectura, u: {x: 1, y: 0}});
  assert.equal(t.eje, 'C');
  assert.equal(t.sentido, 'largo');
  const H = nivelCumbreraEscrito(items);
  assert.equal(H, 5.91);
  // Faldón del lado de A al 50.95 %, del lado de D al 40 %: aleros en los ejes a +3.96 y +4.24.
  assert.equal(Math.round(cotaDelTecho(t, {x: 0, y: 1}, H) * 100) / 100, 3.96);
  assert.equal(Math.round(cotaDelTecho(t, {x: 8, y: 1}, H) * 100) / 100, 4.24);
  assert.equal(cotaDelTecho(t, {x: 3.82, y: 2}, H), 5.91);
});

test('los pórticos siguen el techo de la arquitectura', () => {
  const t = {...techoDesdeArquitectura(items, {lectura, u: {x: 1, y: 0}}), H: 5.91};
  const base = {columnas: [], altura: 5.91, viga: {b: 0.25, h: 0.4}, cimentacion: {tipo: 'zapatas', peralte: 0.6, df: 1.5}, cumbrera: t.linea, techo: t};
  const cruza = planoPortico({...base, eje: ejes[4], columnas: columnas.filter((c) => c.eje.startsWith('6/'))});
  assert.equal(cruza.geometria.cumbrera, 5.91);
  assert.equal(Math.round(cruza.geometria.xCumbrera * 100) / 100, 3.82);
  assert.deepEqual(cruza.geometria.pendientes, [0.5095, 0.4]);
  assert.ok(cruza.contenido.primitivas.some((p) => p.type === 'text' && p.value === 'PTE=50.95%'));
  assert.ok(cruza.contenido.primitivas.some((p) => p.type === 'text' && /^ALERO NFP=/.test(p.value)));
  // Paralelos a la cumbrera: planos a la cota del techo sobre su eje.
  const enA = planoPortico({...base, eje: ejes[0], columnas: columnas.filter((c) => c.eje.endsWith('/A'))});
  const enC = planoPortico({...base, eje: ejes[1], columnas: columnas.filter((c) => c.eje.endsWith('/C'))});
  assert.equal(enA.geometria.cumbrera, null);
  assert.equal(Math.round(enA.geometria.techo * 100) / 100, 3.96);
  assert.equal(enC.geometria.techo, 5.91);
});

const estructura = {escala: 1, columnas, ejesNombrados: ejes};
const modeloTecho = (linea) => ({niveles: 1, techo: 3.96, losa: {espesor: 0.2}, vigas: [],
  cubierta: {linea, pendientes: {neg: 0.4, pos: 0.5095}, nivelCumbrera: 5.91, ejeCumbrera: 'C', fuente: 'cortes de la arquitectura'}});

test('el modelo de análisis tiene los aleros y la cumbrera del plano, con las columnas unidas al techo', async () => {
  const g = modeloE2k({estructura, modelo: modeloTecho({a: {x: 3.82, y: 1.93}, d: {x: 0, y: 1}}), datos: {zona: '3', suelo: 'S2'}});
  assert.deepEqual(g.resumen.elevaciones, [5.91]);
  assert.deepEqual(g.resumen.techo.aleros, [3.9637, 4.238, 5.91]);
  const m = await leerE2k(g.texto);
  // 6 bases + 6 topes: el tope de cada columna es el mismo nudo donde llegan sus vigas.
  assert.equal(m.model.nodes.length, 12);
  const z = [...new Set(m.model.nodes.map((n) => Math.round((n.position?.z ?? n.z) * 100) / 100))].sort((a, b) => a - b);
  assert.deepEqual(z, [0, 3.96, 4.24, 5.91]);
});

test('cumbrera entre ejes: nudos y viga de cumbrera donde cruza las vigas', async () => {
  const g = modeloE2k({estructura, modelo: modeloTecho({a: {x: 2, y: 1.93}, d: {x: 0, y: 1}}), datos: {zona: '3', suelo: 'S2'}});
  assert.ok(g.supuestos.some((s) => /Viga de cumbrera entre ejes: 2 nudos/.test(s)));
  assert.ok(g.texto.includes('5.91'));
  const m = await leerE2k(g.texto);
  assert.equal(m.model.nodes.length, 14); // + los dos nudos de cumbrera
});

test('no se calcula un modelo que no tiene las medidas del plano', () => {
  const cotas = [{a: {x: 0, y: -2}, b: {x: 3.82, y: -2}, direccion: {x: 1, y: 0}, medida: 3.82, valor: 3.82, texto: null},
    {a: {x: 3.82, y: -2}, b: {x: 8, y: -2}, direccion: {x: 1, y: 0}, medida: 4.18, valor: 4.3, texto: '4.30'}];
  const plano = modeloE2k({estructura, modelo: {niveles: 1, techo: 3.96, losa: {espesor: 0.2}, vigas: []}, datos: {}});
  const r = verificarContraPlano({estructura, modelo: {niveles: 1}, resumen: plano.resumen, items, cotas});
  const titulos = r.noCumple.map((x) => x.titulo);
  assert.ok(titulos.includes('Luz C–D'));            // la cota escrita a mano no es lo dibujado
  assert.ok(titulos.includes('Forma del techo'));    // la arquitectura es a dos aguas y el modelo plano
  assert.equal(r.verificaciones.find((x) => x.titulo === 'Luz A–C').estado, 'cumple');
  const bien = modeloE2k({estructura, modelo: modeloTecho({a: {x: 3.82, y: 1.93}, d: {x: 0, y: 1}}), datos: {}});
  const ok = verificarContraPlano({estructura, modelo: {niveles: 1}, resumen: bien.resumen, items, cotas: cotas.slice(0, 1)});
  assert.deepEqual(ok.noCumple, []);
});

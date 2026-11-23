// Reglas de metrado aprendidas de las planillas del despacho (aprender-reglas-metrado.mjs →
// metrado/reglasDespacho.js). Casos con los números de las planillas de varios módulos (sin
// descripciones del cliente: denominaciones genéricas como las del despacho).
import test from 'node:test';
import assert from 'node:assert/strict';
import {muestrasDeHoja, claveModulo} from '../../scripts/agente/aprender-reglas-metrado.mjs';
import {reglasDe, REGLAS_DESPACHO, MUESTRAS_DESPACHO} from '../../resources/js/ingenieria/metrado/reglasDespacho.js';
import {seccionVigaPorLuz, espesorDeApoyo} from '../../resources/js/ingenieria/diseno/estructura.js';

// Fila de la planilla como la devuelve leer-planilla.mjs.
const f = (descripcion, simil, largo, ancho, alto, veces) => ({descripcion, simil, largo, ancho, alto, veces});
const partida = (item, filas, total = 1) => ({item, total, filas});

// Módulo 1 (3 niveles): vigas de eje 0.30x0.40 (corridas) y 0.30x0.60 (las que cargan la losa,
// luz libre 5.63), sobrecimiento 0.13 y 0.24 x 0.45, columnetas de 1.00 y 1.90 de alto.
const modulo1 = [
  partida('02.01.02.01.03', [f('Platea', 1, 7.43, 21.01, 2.1, 1)], 327.82),
  partida('02.01.03.04', [], 179.19),
  partida('02.01.05.02', [], 178.36),
  partida('02.02.03.01', [f('Eje 1', 2, 15.5, 0.4, 0.8, 1), f('Eje A', 2, 6.23, 0.4, 0.8, 1)]),
  partida('02.02.04.01', [f('Eje 1', 1, 13, 0.13, 0.45, 1), f('Eje A', 2, 3.78, 0.24, 0.45, 1)]),
  partida('02.02.04.02', [f('Eje 1', 1, 13, null, 0.45, 2), f('Eje A', 2, 3.78, null, 0.45, 2)]),
  partida('02.03.07.01.01', [f('Eje 1 V-101 (0.30X0.40M)', 2, 15.51, 0.3, 0.4, 2), f('Eje A V-102 (0.30X0.60M)', 2, 5.63, 0.3, 0.6, 6),
    f('Viga Chata (0.20X0.20M)', 1, 23.88, 0.2, 0.2, 1), f('Viga de Borde (0.25X0.26M)', 1, 19.01, 0.2, 0.2, 2)]),
  partida('02.03.07.01.03', [f('Eje 1: 6Ø5/8"', 4, 20.93, 0.6, 1.2, 6), f('Estribos Ø3/8"', 4, 1.08, 0.3, null, 136),
    f('Bastón Ø5/8"', 12, 2.81, 0.25, 0, 4)]),
  partida('02.03.06.01.01', [f('C1', 6, null, null, 12.05, 1)]),
  partida('02.03.08.01', [f('Eje 1 C-pa (0.20x0.13)', 18, 0.2, 0.13, 1, 1), f('Eje 2 C-pa (0.20x0.13)', 9, 0.2, 0.13, 1.9, 1)]),
  partida('02.03.08.03', [f('4Ø3/8"', 18, 1.45, 0.4, 0, 4), f('Estribos Ø1/4"', 18, 0.46, 0.12, null, 10), f('4Ø3/8"', 9, 2.35, 0.4, 0, 4), f('Estribos Ø1/4"', 9, 0.46, 0.12, null, 19)]),
];
// Módulo 10 (2 niveles): vigas que cargan 0.30x0.50 (luces libres 4.27 y 5.40), las demás 0.30x0.40.
const modulo10 = [
  partida('02.01.02.01.03', [], 156.84), partida('02.01.03.04', [], 77.02), partida('02.01.05.02', [], 95.79),
  partida('02.03.07.01.01', [f('Eje 2 V-101 (0.30X0.50M)', 1, 4.27, 0.3, 0.5, 2), f('Eje 3 V-101 (0.30X0.50M)', 1, 5.4, 0.3, 0.5, 2), f('Eje A V-102 (0.30X0.40M)', 1, 9.38, 0.3, 0.4, 2)]),
];
// Módulo 14 (1 nivel, caseta): un solo peralte V(0.25x0.40), luz libre 4.52.
const modulo14 = [
  partida('02.03.07.01.01', [f('Eje 8 V-101 (0.25X0.40M)', 1, 4.52, 0.25, 0.4, 1), f('Eje Y´ V-101 (0.25X0.40M)', 1, 4.13, 0.25, 0.4, 1)]),
];

test('muestras por módulo: solo números, sección de vigas por su luz y armado del despacho', () => {
  const m1 = muestrasDeHoja(modulo1);
  assert.deepEqual(m1.vigas.principal, [[5.63, 0.6]], 'módulo 1: la viga que carga la losa, con su luz libre');
  assert.equal(m1.vigas.secundaria, 0.4);
  assert.deepEqual(m1.vigas.borde, [0.25, 0.26]);
  assert.deepEqual(m1.vigas.chata, [0.2, 0.2]);
  assert.deepEqual(m1.vigaAcero.corridas, [6]);
  assert.equal(m1.vigaAcero.estribosPorMetro[0], Math.round((136 / 20.93) * 1000) / 1000, 'un estribo cada ~0.15 m');
  assert.equal(m1.sobrecimiento.largoSobreCimiento, Math.round(((13 + 2 * 3.78) / (2 * 15.5 + 2 * 6.23)) * 1000) / 1000);
  assert.equal(m1.eliminacion.esponjamiento, 1.2, '(excavación − relleno propio) × 1.2');
  assert.equal(m1.columnas.altura, 12.05);
  assert.ok(Math.abs(m1.columnetas.extraVarilla - 0.45) < 0.01, 'varilla = alto + ~0.45');
  // Nada de texto en las muestras (solo números y listas de números).
  const textos = [];
  JSON.stringify(m1, (k, v) => { if (typeof v === 'string') textos.push(v); return v; });
  assert.deepEqual(textos, [], 'sin textos de la planilla');
  assert.deepEqual(muestrasDeHoja(modulo10).vigas.principal, [[5.4, 0.5]], 'módulo 10: manda la luz mayor');
  assert.deepEqual(muestrasDeHoja(modulo14).vigas.unica, [4.52, 0.4]);
});

test('reglas agregadas: ancho 0.30, luz/peralte de los módulos y evaluación sin el módulo medido', () => {
  const muestras = {a: muestrasDeHoja(modulo1), b: muestrasDeHoja(modulo10), c: muestrasDeHoja(modulo14)};
  const r = reglasDe(muestras);
  assert.equal(r.vigas.ancho, 0.3);
  assert.equal(r.vigas.secundaria, 0.4);
  assert.equal(r.vigas.luzSobrePeralte, Math.round((5.4 / 0.5) * 1000) / 1000, 'mediana de 5.63/0.60, 5.40/0.50, 4.52/0.40');
  // Sin el módulo 10 la regla sale de los otros dos (evaluación honesta); con 2 módulos no llega
  // al mínimo de 3 y queda el criterio, salvo que se baje el mínimo.
  assert.equal(reglasDe(muestras, 'b').vigas.luzSobrePeralte, null);
  assert.equal(reglasDe(muestras, 'b', null, 2).vigas.luzSobrePeralte, Math.round(((5.63 / 0.6 + 4.52 / 0.4) / 2) * 1000) / 1000);
  assert.equal(reglasDe(muestras, 'b').modulos, 2);
  assert.match(claveModulo('grupo', 3), /^[0-9a-f]{6}\/3$/, 'clave anónima');
  // El archivo generado trae reglas de las planillas reales (si se corrió el script).
  if (Object.keys(MUESTRAS_DESPACHO).length) assert.ok(REGLAS_DESPACHO.vigas.luzSobrePeralte > 8 && REGLAS_DESPACHO.vigas.luzSobrePeralte < 14);
});

test('sección de viga por la luz (como el ingeniero) y respaldo sin reglas', () => {
  const reglas = {ancho: 0.3, luzSobrePeralte: 10.8, secundaria: 0.4};
  const placaL = {b: 1.5, h: 1, area: 0.66, forma: 'L'}, columnaL14 = {b: 0.4, h: 0.4, area: 0.14, forma: 'L'};
  assert.ok(Math.abs(espesorDeApoyo(placaL) - 0.3) < 0.005, 'placa L 1.50x1.00 de 0.66 m² → espesor 0.30');
  assert.ok(Math.abs(espesorDeApoyo(columnaL14) - 0.259) < 0.005);
  // Módulo 1: luces libres 4.43 y 6.23 → una sola sección V(0.30x0.60) (manda 6.23).
  assert.deepEqual(seccionVigaPorLuz({luz: 6.23, apoyos: [placaL]}, reglas), {b: 0.3, h: 0.6});
  // Módulo 10: 5.40 → 0.50. Módulo 14: 4.52 con columnas de 0.25 → V(0.25x0.40).
  assert.deepEqual(seccionVigaPorLuz({luz: 5.4}, reglas), {b: 0.3, h: 0.5});
  assert.deepEqual(seccionVigaPorLuz({luz: 4.52, apoyos: [columnaL14, columnaL14]}, reglas), {b: 0.25, h: 0.4});
  // Paralela a las viguetas: 0.40 aunque la luz sea grande (módulos 1, 2 y 5: ejes de 15–17 m).
  assert.deepEqual(seccionVigaPorLuz({luz: 6.23, cargaLosa: false}, reglas), {b: 0.3, h: 0.4});
  // F2: el análisis puede pedir más peralte; la regla nunca da menos.
  assert.deepEqual(seccionVigaPorLuz({luz: 4.52, peralteMinimo: 0.5}, reglas), {b: 0.3, h: 0.5});
  // Sin reglas: 0.25 x L/12 con mínimo 0.40.
  assert.deepEqual(seccionVigaPorLuz({luz: 6}), {b: 0.25, h: 0.5});
});

test('relleno con material propio nunca negativo: con zapatas no se descuenta el cimiento corrido (va en su zanja)', async () => {
  const {metradoEstructuras} = await import('../../resources/js/ingenieria/metrado/metrado.js');
  const modelo = {
    niveles: 1, techo: 3, cimentacion: {tipo: 'zapatas', hz: 0.6, df: 1.5, zapatas: [{B: 1.2, L: 1.2}, {B: 1.2, L: 1.2}]},
    cimientoCorrido: {ancho: 0.4, tramos: [{largo: 12, espesor: 0.15}, {largo: 9, espesor: 0.15}]},
    columnas: [{tipo: 'C1', b: 0.3, h: 0.3, area: 0.09, forma: 'rectangular', clase: 'columna', perimetro: 1.2}],
    vigas: [], losa: null,
  };
  const m = metradoEstructuras(modelo);
  const relleno = m.partidas.find((p) => p.item === '02.01.03.02');
  assert.ok(relleno.total >= 0, `relleno ${relleno.total}`);
  assert.ok(!relleno.filas.some((f) => /cimiento/i.test(f.descripcion)), 'el cimiento corrido no se descuenta de la excavación de zapatas');
  assert.ok(Math.abs(relleno.total - (2 * 1.44 * 0.9 - 0.09 * 0.9)) < 1e-6);
});

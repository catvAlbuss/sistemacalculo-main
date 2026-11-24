// Lo aprendido de los 15 módulos de VINCHOS (arquitectura + estructuras del ingeniero), fijado en
// pruebas: maneras de dibujar ejes y columnas que el lector debe entender, criterios de losa y
// cimentación, y el benchmark real (si los planos están en esta máquina).
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {detectarVistas, leerVista, claseDeSeccion} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {celdasDeGrilla} from '../../resources/js/ingenieria/planos/aligeradoPlano.js';
import {espesorPorLuz} from '../../resources/js/ingenieria/criterios/criteriosEstructurales.js';
import {proponer} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {PLANOS} from '../../scripts/agente/planos.mjs';

const circulo = (x, y, r, extra = {}) => ({tipo: 'circulo', capa: 'EJES', centro: {x, y}, radio: r, ...extra});
const texto = (x, y, t, extra = {}) => ({tipo: 'texto', capa: 'TEXTOS', centro: {x, y}, texto: t, alto: 0.2, ...extra});
const rect = (x0, y0, x1, y1, capa = 'COLUMNAS') => ({tipo: 'poli', capa, cerrada: true, puntos: [{x: x0, y: y0}, {x: x1, y: y0}, {x: x1, y: y1}, {x: x0, y: y1}]});

// Grilla de 2 x 2 ejes solo con burbujas (sin trazos), rótulos FUERA del círculo, a 0.4 (módulo 6).
function grillaSinTrazos({dx = 0} = {}) {
  const r = 0.11, items = [];
  const burbuja = (x, y, nombre, haciaY) => items.push(circulo(x, y, r, {capa: 'TEXTOS', bloque: 'EJE'}), texto(x - 0.1, y + 0.4 * haciaY, nombre));
  for (const [nombre, x] of [['1', dx + 0], ['2', dx + 6]]) { burbuja(x, 5, nombre, 1); burbuja(x, -1, nombre, -1); }
  for (const [nombre, y] of [['A', 0], ['B', 4]]) { items.push(circulo(dx - 1.5, y, r, {capa: 'TEXTOS', bloque: 'EJE'}), texto(dx - 1.9, y, nombre), circulo(dx + 7.5, y, r, {capa: 'TEXTOS', bloque: 'EJE'}), texto(dx + 7.9, y, nombre)); }
  items.push(texto(dx + 3, -2, 'Planta primer nivel', {alto: 0.5}));
  return items;
}

test('axes drawn only as bubbles (no axis lines, label outside the circle, block EJE on a text layer) are read', () => {
  const items = [...grillaSinTrazos(), ...[[0, 0], [6, 0], [0, 4], [6, 4]].map(([x, y]) => rect(x - 0.15, y - 0.15, x + 0.15, y + 0.15))];
  const vistas = detectarVistas(items);
  assert.equal(vistas.length, 1);
  assert.deepEqual(vistas[0].ejes.map((e) => e.nombre).sort(), ['1', '2', 'A', 'B']);
  assert.equal(leerVista(items, vistas[0]).columnas.length, 4);
});

test('two plans side by side without axis lines are not merged through the gap between them', () => {
  const items = [...grillaSinTrazos(), ...grillaSinTrazos({dx: 12})];
  const vistas = detectarVistas(items);
  assert.equal(vistas.length, 2, 'one grid per plan');
  for (const v of vistas) assert.equal(v.ejes.length, 4);
});

test('a column drawn on a wall layer counts only when it sits on the axis crossing', () => {
  const items = [...grillaSinTrazos(),
    // L 1.50 x 1.00 x 0.30 en "muros de cercos" sobre el cruce 1/B (módulo 1).
    {tipo: 'poli', capa: 'muros de cercos', cerrada: true, puntos: [[0.3, -1], [0, -1], [0, 0], [1.5, 0], [1.5, -0.3], [0.3, -0.3]].map(([x, y]) => ({x, y: y + 4}))},
    // Un tramo de muro suelto cerca (no toca el cruce 2/A): no es columna.
    rect(6.25, 0.35, 6.45, 1.2, '01. MUROS.')];
  const [vista] = detectarVistas(items);
  const {columnas} = leerVista(items, vista);
  assert.equal(columnas.length, 1);
  assert.equal(columnas[0].forma, 'L');
});

test('a big square near a crossing (a room or furniture) is not taken as a column', () => {
  const items = [...grillaSinTrazos(), rect(0.05, 0.05, 2.38, 2.25, '0')];
  const [vista] = detectarVistas(items);
  assert.equal(leerVista(items, vista).columnas.length, 0);
});

test('placa or column like the engineer of the 15 modules', () => {
  const L = (b, h, t) => ({forma: 'L', b, h, area: t * (b + h - t)});
  assert.equal(claseDeSeccion(L(1.5, 1.0, 0.3)).prefijo, 'PL', 'PL1 L 1.50x1.00');
  assert.equal(claseDeSeccion(L(1.5, 0.5, 0.25)).prefijo, 'PL', 'PL2 L 1.50x0.50 (long leg 6t)');
  assert.equal(claseDeSeccion(L(1.0, 0.6, 0.3)).prefijo, 'C', 'CL1 L 1.00x0.60 stays a column');
  assert.equal(claseDeSeccion({forma: 'T', b: 1.0, h: 0.6, area: 0.3 * (1.0 + 0.6 - 0.3)}).prefijo, 'CT', 'CT1 T 1.00x0.60');
});

test('slab thickness by clear span, like the office (0.20 up to 5.65 m between axes)', () => {
  assert.equal(espesorPorLuz(2.5), 0.2);
  assert.equal(espesorPorLuz(5.1), 0.2);
  assert.equal(espesorPorLuz(5.65), 0.2);
  assert.equal(espesorPorLuz(6.0), 0.25);
  assert.equal(espesorPorLuz(7.0), 0.3);
});

test('the grid slab: one panel per cell, the stair cell open and the toilets cell solid', () => {
  const ejes = [['3', 0, -1, 0, 14], ['6', 7, -1, 7, 14], ['E', -1, 13, 8, 13], ['J', -1, 9, 8, 9], ['M', -1, 5, 8, 5], ['U', -1, 0, 8, 0]]
    .map(([nombre, x0, y0, x1, y1]) => ({nombre, p: {x: x0, y: y0}, q: {x: x1, y: y1}, inclinado: false}));
  const tramos = ['3', '6', 'E', 'J', 'M', 'U'].map((eje) => ({eje}));
  const losa = [{x: -0.6, y: -0.6}, {x: 7.6, y: -0.6}, {x: 7.6, y: 13.6}, {x: -0.6, y: 13.6}];
  const items = [texto(3, 11, 'AULA 1° PRIMARIA'), texto(3, 7, 'AULA 2° PRIMARIA'), texto(2, 3, 'SS.HH MUJERES'), texto(2, 1, 'ESCALERA')];
  // M–U con los baños arriba y la escalera abajo: se parte en dos celdas con un eje intermedio.
  const ejes2 = [...ejes, {nombre: 'O', p: {x: -1, y: 2}, q: {x: 8, y: 2}, inclinado: false}];
  const celdas = celdasDeGrilla({lectura: {ejes: ejes2}, tramos: [...tramos, {eje: 'O'}], losa, u: {x: 1, y: 0}, v: {x: 0, y: 1}, items});
  assert.equal(celdas.length, 4);
  assert.deepEqual(celdas.map((c) => c.tipo).sort(), ['abertura', 'aligerada', 'aligerada', 'maciza']);
});

test('foundation from the 15 modules: several levels → raft; one level over 60 m² → footings; small → raft', () => {
  const caso = (id, niveles, area, cimentacion) => ({nombre: `vinchos:${id}`, grupo: 'vinchos', rasgos: {niveles, luzLosa: 4.5, area, columnas: 8, techoLiviano: niveles === 1, placas: false, columnetas: 10}, decisiones: {cimentacion}});
  const casos = [caso('m1', 3, 156, 'platea'), caso('m2', 3, 175, 'platea'), caso('m6', 2, 36, 'platea'), caso('m9', 2, 79, 'platea'), caso('m10', 2, 75, 'platea'),
    caso('m7', 1, 797, 'zapatas'), caso('m11', 1, 213, 'zapatas'), caso('m12', 1, 81, 'zapatas'), caso('m13', 1, 84, 'zapatas'), caso('m8', 1, 44, 'platea'), caso('m14', 1, 9, 'platea')];
  const una = proponer({niveles: 1, luzLosa: 5, area: 120, columnas: 6, techoLiviano: true, placas: false, columnetas: 8}, casos).decisiones.cimentacion;
  assert.equal(una.valor, 'zapatas');
  assert.ok(una.confianza >= 0.6, 'drawn as a proposal');
  assert.match(una.ingeniero, /confírmalo/, 'one project only: the engineer confirms it');
  assert.equal(proponer({niveles: 3, luzLosa: 4.5, area: 150, columnas: 12, techoLiviano: false, placas: true, columnetas: 20}, casos).decisiones.cimentacion.valor, 'platea');
  assert.equal(proponer({niveles: 1, luzLosa: 3, area: 20, columnas: 4, techoLiviano: true, placas: false, columnetas: 6}, casos).decisiones.cimentacion.valor, 'platea');
});

// Benchmark real: 15 pares del despacho (fuera de git). Corre con la caché de volcar-planos.mjs.
const pares = join(PLANOS, 'estructuras', 'pares.json');
const hayCache = existsSync(pares) && existsSync(join(PLANOS, 'cache'));
// F1 promedio de columnas de un proyecto del manifiesto (lectura de la arquitectura vs. la estructura).
async function f1DelProyecto(grupo) {
  const {compararPar} = await import('../../scripts/agente/evaluar-lectura.mjs');
  const {leerCache} = await import('../../scripts/agente/volcar-planos.mjs');
  const {paresDelManifiesto} = await import('../../scripts/agente/pares-entrenamiento.mjs');
  const lista = paresDelManifiesto(join(PLANOS, 'estructuras'), JSON.parse(readFileSync(pares, 'utf8')), existsSync).filter((p) => p.grupo === grupo);
  const f1s = [];
  for (const p of lista) {
    const a = leerCache(p.rutaArquitectura), e = leerCache(p.rutaEstructura);
    if (!a || !e) continue;
    // Sin la planta de ese módulo en el expediente de estructuras (ILO 11 trae el módulo I), no se compara.
    const r = compararPar(a.items, e.items);
    if (r) f1s.push(r.f1);
  }
  return {f1s, promedio: f1s.length ? f1s.reduce((s, x) => s + x, 0) / f1s.length : null};
}

test('the 15 office modules: columns read where the engineer put them (F1 ≥ 0.90)', {skip: !hayCache && 'sin los planos de entrenamiento en esta máquina'}, async () => {
  const {f1s, promedio} = await f1DelProyecto('vinchos');
  assert.ok(promedio >= 0.9, `F1 promedio ${promedio?.toFixed(3)} en ${f1s.length} módulos`);
});

// Segundo proyecto, otro arquitecto (burbujas en capas sin "eje", ejes "05"): piso contra
// retrocesos; la meta sigue siendo 0.90.
test('a second project by another architect: its axes and columns are read (F1 ≥ 0.55)', {skip: !hayCache && 'sin los planos de entrenamiento en esta máquina'}, async (t) => {
  const {f1s, promedio} = await f1DelProyecto('ilo');
  if (!f1s.length) return t.skip('sin el segundo proyecto en esta máquina');
  assert.ok(promedio >= 0.55, `F1 promedio ${promedio.toFixed(3)} en ${f1s.length} módulos`);
});

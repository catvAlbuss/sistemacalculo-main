// Detalle completo de las láminas: losas por nivel, tabiquería, volados, escalera (huella y
// detalle) y su metrado, como los planos del despacho (VINCHOS).
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {nivelesDePlantasDeLosa} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {gruposDePeldanos, quitarEscaleras} from '../../resources/js/ingenieria/planos/cimentacionPlano.js';
import {voladosDesdePlanta, celdasDeGrilla} from '../../resources/js/ingenieria/planos/aligeradoPlano.js';
import {predimensionarEscalera, detalleEscalera} from '../../resources/js/ingenieria/planos/escaleraPlano.js';
import {metradoEstructuras} from '../../resources/js/ingenieria/metrado/metrado.js';
import {PLANOS} from '../../scripts/agente/planos.mjs';

test('slab sheets by level are read from any of the office title styles', () => {
  assert.equal(nivelesDePlantasDeLosa(['MODULO I - PLANO DE LOSA ALIGERADA 1°-2° PISO', 'MODULO I - PLANO DE LOSA ALIGERADA TECHO']), 3);
  assert.equal(nivelesDePlantasDeLosa(['PLANO- LOSA ALIGERADA 1° Y 2° PISO', 'PLANO- LOSA ALIGERADA 3° PISO']), 3);
  assert.equal(nivelesDePlantasDeLosa(['PLANO- TECHO 1º PISO', 'PLANO- TECHO 2º PISO']), 2);
  assert.equal(nivelesDePlantasDeLosa(['MODULO XIV - PLANO DE ALIGERADO']), 1);
  assert.equal(nivelesDePlantasDeLosa(['MODULO XII - PLANO DE CIMENTACION', 'PLANO DE TABIQUERIA 2° PISO']), 0);
});

// 10 huellas de 0.30 como rectángulos (módulo 1) y 10 como trazos, en dos tramos de 1.50.
const huella = (x, y, w = 1.5, p = 0.3) => ({pts: [{x, y}, {x: x + w, y}, {x: x + w, y: y + p}, {x, y: y + p}], cerrada: true});
const trazo = (x, y, w = 1.5) => ({pts: [{x, y}, {x: x + w, y}]});

test('stair steps drawn as lines or as tread rectangles are steps, not walls', () => {
  const g = [...Array.from({length: 10}, (_, i) => huella(0, i * 0.3)), ...Array.from({length: 10}, (_, i) => trazo(2, i * 0.3)), {pts: [{x: -1, y: -1}, {x: 6, y: -1}]}];
  const grupos = gruposDePeldanos(g);
  assert.equal(grupos.length, 2, 'two flights');
  assert.equal(quitarEscaleras(g), 20);
  assert.equal(g.length, 1, 'the wall stays');
});

test('a corridor in cantilever is read from the railings of the upper level', () => {
  const contorno = (x, y) => [{x: x - 0.15, y: y - 0.15}, {x: x + 0.15, y: y - 0.15}, {x: x + 0.15, y: y + 0.15}, {x: x - 0.15, y: y + 0.15}];
  const columnas = [[0, 0], [7, 0], [0, 10], [7, 10]].map(([x, y]) => ({contorno: contorno(x, y)}));
  const ejes = [{nombre: 'A', p: {x: -1, y: 0}, q: {x: 8, y: 0}}, {nombre: 'B', p: {x: -1, y: 10}, q: {x: 8, y: 10}}, {nombre: '1', p: {x: 0, y: -1}, q: {x: 0, y: 11}}, {nombre: '2', p: {x: 7, y: -1}, q: {x: 7, y: 11}}];
  const baranda = {tipo: 'linea', capa: '21. BARANDAS METÁLICAS.', puntos: [{x: 9.55, y: 0}, {x: 9.55, y: 10}]};
  const volados = voladosDesdePlanta({lectura: {columnas, ejes}, items: [baranda]});
  assert.equal(volados.length, 1);
  assert.equal(volados[0].ancho, 2.4);
  const losa = [{x: -0.75, y: -0.75}, {x: 9.55, y: -0.75}, {x: 9.55, y: 10.75}, {x: -0.75, y: 10.75}];
  const tramos = ['A', 'B', '1', '2'].map((eje) => ({eje}));
  const celdas = celdasDeGrilla({lectura: {ejes}, tramos, losa, u: {x: 1, y: 0}, v: {x: 0, y: 1}, volados});
  assert.ok(celdas.some((c) => c.motivo === 'volado'), 'the cantilever strip is its own panel');
});

test('stair: risers from the floor height (≤ 0.175), the plan tread, and the waist L/25 ≥ 0.15', () => {
  const dim = predimensionarEscalera({tramos: [{peldanos: 9, huella: 0.3, ancho: 1.5}, {peldanos: 9, huella: 0.3, ancho: 1.6}]}, 3.2);
  assert.equal(dim.contrapasos, 19);
  assert.ok(dim.cp <= 0.175 && dim.cp >= 0.16);
  assert.equal(dim.paso, 0.3);
  assert.equal(dim.porTramo, 10);
  assert.ok(dim.garganta >= 0.15);
  const d = detalleEscalera(dim);
  assert.match(d.contenido.titulo, /DETALLE DE ESCALERA/);
  assert.ok(d.contenido.primitivas.some((p) => p.type === 'text' && /Ø1\/2" @0\.20/.test(p.value)));
  assert.ok(d.modelo.concreto > 0.5 && d.modelo.concreto < 2, `${d.modelo.concreto} m³ per flight`);
});

test('metrado: solid slab and stair get the office items 02.03.12 and 02.03.13; no aligerado where there is none', () => {
  const base = {proyecto: 'P', niveles: 2, entrepisos: [3.2], techo: 6.4, losaTecho: true, cimentacion: {tipo: 'platea', hz: 0.7, df: 2, ancho: 6, largo: 10}, cimientoCorrido: {tramos: []},
    columnas: [], refuerzoColumnas: [], columnetas: [], vsa: [], dinteles: [], vigas: [], losa: {espesor: 0.2, areaBruta: 60, areaPanos: 0, panos: [], maciza: 40, vacios: 0}};
  const sinEscalera = metradoEstructuras(base);
  const items = (m) => m.partidas.filter((p) => !p.titulo).map((p) => p.item);
  assert.ok(items(sinEscalera).includes('02.03.12.01'));
  assert.ok(!items(sinEscalera).includes('02.03.11.01'), 'all solid: no aligerado');
  const conc = sinEscalera.partidas.find((p) => p.item === '02.03.12.01');
  assert.ok(Math.abs(conc.total - 2 * 40 * 0.2) < 0.01, `${conc.total} m³ = 2 levels x 40 m² x 0.20`);
  const dim = predimensionarEscalera({tramos: [{huella: 0.3, ancho: 1.5}, {huella: 0.3, ancho: 1.5}]}, 3.2);
  const conEscalera = metradoEstructuras({...base, escalera: {...dim, tramosPorNivel: 2, niveles: 1, porTramo: detalleEscalera(dim).modelo}});
  assert.ok(items(conEscalera).includes('02.03.13.01') && items(conEscalera).includes('02.03.13.03'));
});

// De punta a punta con el módulo 1 (si los planos están en esta máquina).
const pares = join(PLANOS, 'estructuras', 'pares.json');
const m1 = existsSync(pares) && JSON.parse(readFileSync(pares, 'utf8')).vinchos?.find((p) => p.id === 'modulo-01');
test('module 1: slabs by level, partition walls of 2° and 3° together, cantilever corridor and stair detail', {skip: !m1 && 'sin los planos de entrenamiento'}, async () => {
  const dm = await import('@mlightcad/data-model');
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const {createDrawingContext} = await import('../../resources/js/ingenieria/cad/drawingContext.js');
  const {SKILLS} = await import('../../resources/js/ingenieria/agente/skills/index.js');
  const leer = async (ruta, tipo) => { const db = new dm.AcDbDatabase(); const b = readFileSync(ruta); await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, tipo); return db; };
  const db = await leer(join(PLANOS, 'estructuras', m1.arquitectura), dm.AcDbFileType.DWG);
  const plantilla = existsSync('public/assets/plantillas/estructuras-laminas.dxf') ? {db: await leer('public/assets/plantillas/estructuras-laminas.dxf', dm.AcDbFileType.DXF), config: JSON.parse(readFileSync('public/assets/plantillas/estructuras-laminas.json', 'utf8'))} : {db: null, config: {modo: 'adaptativa', escalaPlanos: 1}};
  const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({}), afterDraw: () => {}});
  const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({vista: 'primer nivel'}, ctx);
  assert.ok(r.ok, r.error);
  const m = ctx.memoria.modeloEstructural;
  assert.ok(m.planos.includes('PLANO DE LOSA ALIGERADA 1° Y 2° PISO'), m.planos.join(' | '));
  assert.ok(m.planos.includes('PLANO DE LOSA ALIGERADA TECHO'));
  assert.ok(m.planos.includes('PLANO DE TABIQUERÍA 2° Y 3° PISO'), 'like the engineer');
  assert.ok(m.planos.some((t) => /DETALLE DE ESCALERA/.test(t)));
  assert.equal(m.losaTecho, true);
  assert.ok(m.vigas.some((v) => v.tipo === 'V VARIABLE') && m.vigas.some((v) => v.tipo === 'VCH'), 'cantilever corridor beams');
  assert.ok(m.escalera?.contrapasos >= 18);
  assert.ok(r.laminas.includes('E-04'));
});

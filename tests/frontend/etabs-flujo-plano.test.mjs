// Flujo del panel: el DWG importado se diagnostica (qué leyó el agente y qué le falta), el plano
// de estructuras se arma con los datos que el personal confirma en el formulario, y cancelar no
// dibuja nada.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {diagnosticarLectura, textoErrorDwg} from '../../resources/js/ingenieria/lectura/diagnostico.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {plano} from '../../scripts/agente/planos.mjs';

const m14 = plano('estructuras', '14.VINCHOS MODULO 14 arquitectura.dwg');
const plano_estructuras = SKILLS.find((s) => s.name === 'plano_estructuras');

async function abrir(path) {
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const db = new dm.AcDbDatabase();
  const b = readFileSync(path);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  return db;
}
async function cargarPlantilla() {
  if (!existsSync('public/assets/plantillas/estructuras-laminas.dxf')) return {db: null, config: {modo: 'adaptativa', escalaPlanos: 1}};
  const db = new dm.AcDbDatabase();
  const d = readFileSync('public/assets/plantillas/estructuras-laminas.dxf');
  await db.read(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength), {readOnly: true}, dm.AcDbFileType.DXF);
  return {db, config: JSON.parse(readFileSync('public/assets/plantillas/estructuras-laminas.json', 'utf8'))};
}
const lista = (xs) => ({newIterator: () => ({toArray: () => xs})});

test('import diagnosis explains what blocks the agent: no named axes, unresolved xrefs and AutoCAD Architecture proxies', () => {
  const xref = {dxfTypeName: 'INSERT', layer: '0', blockName: 'ARQ-BASE', blockTableRecord: {isXref: true, isUnresolvedXref: true, pathName: 'C:/obra/base.dwg', ...lista([])}};
  const database = {insunits: 0, tables: {layerTable: lista([{name: 'MUEBLES', isOff: true}]), blockTable: {modelSpace: lista([
    xref,
    {dxfTypeName: 'ACAD_PROXY_ENTITY', originalDxfName: 'AEC_WALL', layer: 'A-WALL'},
    {dxfTypeName: 'ACAD_PROXY_ENTITY', originalDxfName: 'AEC_WALL', layer: 'A-WALL'},
    {dxfTypeName: 'MLINE', layer: 'MUROS'},
    {dxfTypeName: 'LINE', layer: 'MUEBLES'},
  ])}}};
  const d = diagnosticarLectura({database, items: [], vistas: []});
  assert.equal(d.estado, 'no');
  assert.deepEqual(d.problemas.map((p) => p.codigo), ['xref', 'proxy', 'ejes']);
  assert.match(d.problemas[0].texto, /1 referencia\(s\) externa\(s\) sin su contenido \(ARQ-BASE\)/);
  assert.match(d.problemas[0].arreglo, /BIND/);
  assert.match(d.problemas[1].texto, /2 objeto\(s\).*AEC_WALL ×2/);
  assert.match(d.problemas[1].arreglo, /AECEXPORTTOAUTOCAD/);
  assert.ok(d.avisos.some((a) => /multilínea/.test(a)));
  assert.ok(d.avisos.some((a) => /capas apagadas.*MUEBLES/.test(a)));
  assert.ok(d.avisos.some((a) => /no declara unidades/.test(a)));
  assert.deepEqual(textoErrorDwg(68), ['clases de objetos no soportadas', 'valores fuera de rango']);
});

test('module 14 imports ready to structure; the form decides the data and cancelling draws nothing', {skip: !existsSync(m14)}, async () => {
  const db = await abrir(m14);
  let guardados = {};
  const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: cargarPlantilla, getProjectData: () => guardados, setProjectData: (d) => { guardados = {...guardados, ...d}; }});

  const plan = ctx.readPlan();
  const d = diagnosticarLectura({database: db, items: plan.items, vistas: plan.vistas});
  assert.equal(d.estado, 'lista', d.resumen);
  assert.equal(d.vistas[0].columnas, 4);
  assert.deepEqual(d.vistas[0].ejes, ['8', '10', 'Y´', 'Z´']);
  assert.deepEqual(d.niveles, ['+0.15', '+1.65']);

  // Cancelar el formulario: no se dibuja nada.
  const pedidos = [];
  ctx.pedirDatos = async (p) => { pedidos.push(p); return null; };
  const antes = db.tables.blockTable.modelSpace.newIterator().toArray().length;
  const cancelado = await plano_estructuras.run({}, ctx);
  assert.equal(cancelado.ok, false);
  assert.equal(cancelado.cancelado, true);
  assert.equal(db.tables.blockTable.modelSpace.newIterator().toArray().length, antes);
  // El formulario llega con lo que propone el agente para este módulo.
  assert.deepEqual(pedidos[0].sugeridos, {hz: 0.7, df: 2, niveles: 1});
  assert.ok(pedidos[0].faltan.includes('zona') && pedidos[0].faltan.includes('proyecto'));
  assert.match(pedidos[0].vista, /Primer nivel/i);

  // El personal corrige Hz y completa zona y suelo: el plano sale con esos datos.
  ctx.pedirDatos = async () => ({hz: '0.80', df: '2.00', zona: '3', suelo: 'S3', categoria: 'A2', niveles: '1', proyecto: 'MÓDULO DE PRUEBA'});
  const r = await plano_estructuras.run({}, ctx);
  assert.equal(r.ok, true, r.error);
  assert.match(r.mensaje, /platea \(Hz = 0\.80 m, Df = 2\.00 m\)/);
  assert.match(r.mensaje, /Z=0\.35, U=1\.5, S=1\.2/);
  assert.equal(guardados.zona, '3', 'the confirmed data is kept for the next request');
  assert.ok(ctx.memoria.modeloEstructural, 'the drawn structure is ready for the metrado');
});

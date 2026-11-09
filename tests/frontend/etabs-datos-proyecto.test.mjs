// Datos del proyecto (Hz, Df, zona, suelo, categoría, niveles): son datos del sitio y
// del uso, no reglas del despacho. El panel los manda y las láminas los usan.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {datosTecnicos, parametrosSismicos, textosSismicos, datosParaLaminas, CAMPOS_TECNICOS} from '../../resources/js/ingenieria/criterios/datosProyecto.js';
import {CRITERIOS} from '../../resources/js/ingenieria/criterios/criteriosEstructurales.js';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {plano} from '../../scripts/agente/planos.mjs';

const m03 = plano('estructuras', 'Modulo 3 INICIAL arquitectura.dwg');
const plantillaDxf = 'public/assets/plantillas/estructuras-laminas.dxf';
const plantillaJson = 'public/assets/plantillas/estructuras-laminas.json';

test('E.030 parameters from zone, soil and category (school in zone 2 on soft soil)', () => {
  assert.deepEqual(parametrosSismicos({zona: 2, suelo: 'S3', categoria: 'A2'}),
    {Z: 0.25, U: 1.5, categoria: 'A2', nombreCategoria: 'ESENCIALES', S: 1.4, Tp: 1.0, TL: 1.6, suelo: 'S3', zona: 2});
  assert.equal(parametrosSismicos({zona: 4, suelo: 'S2'}).S, 1.05);
  assert.equal(parametrosSismicos({categoria: 'C'}).U, 1.0);
  assert.deepEqual(parametrosSismicos({}), {});
});

test('panel values are normalized; wrong values are ignored and reported', () => {
  const t = datosTecnicos({hz: '0,60', df: '2.50', zona: 'Zona 3', suelo: 's2', categoria: 'B', niveles: '2'});
  assert.deepEqual({hz: t.hz, df: t.df, zona: t.zona, suelo: t.suelo, categoria: t.categoria, niveles: t.niveles}, {hz: 0.6, df: 2.5, zona: 3, suelo: 'S2', categoria: 'B', niveles: 2});
  const mal = datosTecnicos({hz: '60', df: 'dos', zona: '5', niveles: '1.5'});
  assert.equal(mal.hz, null);
  assert.equal(mal.df, null);
  assert.equal(mal.zona, null);
  assert.equal(mal.niveles, null);
  assert.equal(mal.invalidos.length, 4);
  assert.ok(CAMPOS_TECNICOS.every((c) => c.etiqueta && c.campo));
});

test('the template seismic texts (copied from the reference project) are replaced with the project ones', () => {
  const f = textosSismicos(parametrosSismicos({zona: 2, suelo: 'S3', categoria: 'A2'}));
  const plantilla = ['Z=0.25(ZONA 2)', 'U=1.0 ', 'U=1.0 categoria "C" (EDIFICACIONES COMUNES)', 'categoria "C" EDIFICACIONES COMUNES  ', 'S=2', 'S=1.40(suelo tipo s2)', 'Tp=1.00(suelo S2)', 'TL=2.0(suelo tipo S2)'];
  assert.deepEqual(plantilla.map(f), ['Z=0.25(ZONA 2)', 'U=1.5 ', 'U=1.5 categoria "A2" (EDIFICACIONES ESENCIALES)', 'categoria "A2" EDIFICACIONES ESENCIALES', 'S=3', 'S=1.40(suelo tipo S3)', 'Tp=1.00(suelo S3)', 'TL=1.6(suelo tipo S3)']);
  // Lo demás queda igual.
  for (const t of ['RESUMEN DE PARAMETROS SISMICOS', 'C=2.5(Tp/T)', 'FACTOR DE ZONA', "f'c=100 kg/cm2+30%PG.", 'ZUSC']) assert.equal(f(t), t);
  // Every pattern matches the real template, so no parameter is left from the reference project.
  const dxf = readFileSync(plantillaDxf, 'utf8').split(/\r?\n/);
  for (const t of plantilla) assert.ok(dxf.includes(t), `template text "${t}" not found: update the patterns`);
  assert.equal(textosSismicos({}), null);
});

test('missing soil data falls back to the office criterion with a warning; given data is used', () => {
  const sin = datosParaLaminas({});
  assert.deepEqual(sin.cimentacion, {});
  assert.ok(sin.avisos.some((a) => /Falta Hz y Df/.test(a) && a.includes(CRITERIOS.platea.espesor.toFixed(2))));
  assert.ok(sin.avisos.some((a) => /parámetros sísmicos de la lámina son los de la plantilla/.test(a)));
  const con = datosParaLaminas({hz: '0.60', df: '2.50', zona: '2', suelo: 'S3', categoria: 'A2', niveles: '2'});
  assert.deepEqual(con.cimentacion, {espesorPlatea: 0.6, peralteZapata: 0.6, dfPlatea: 2.5, df: 2.5, pisos: 2});
  assert.ok(!con.avisos.some((a) => /Falta/.test(a)));
  assert.ok(con.avisos.some((a) => /2 niveles/.test(a)), 'two levels are not drawn yet: say so');
});

async function abrir(path) {
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const db = new dm.AcDbDatabase();
  const b = readFileSync(path);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  return db;
}
async function cargarPlantilla() {
  const db = new dm.AcDbDatabase();
  const d = readFileSync(plantillaDxf);
  await db.read(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength), {readOnly: true}, dm.AcDbFileType.DXF);
  return {db, config: JSON.parse(readFileSync(plantillaJson, 'utf8'))};
}

test('module 3 with its soil study and E.030 data: Hz 0.60, Df 2.50 and Z/U/S/Tp of the school on the sheets', {skip: !existsSync(m03)}, async () => {
  const db = await abrir(m03);
  const datos = {hz: '0.60', df: '2.50', zona: '2', suelo: 'S3', categoria: 'A2', niveles: '1'};
  const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: cargarPlantilla, getProjectData: () => datos});
  const antes = db.tables.blockTable.modelSpace.newIterator().toArray().length;
  const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({vista: '1ER NIVEL'}, ctx);
  assert.match(r.mensaje, /platea \(Hz = 0\.60 m, Df = 2\.50 m\)/);
  assert.match(r.mensaje, /parámetros sísmicos Z=0\.25, U=1\.5, S=1\.4, Tp=1/);
  assert.ok(!r.avisos.some((a) => /Falta/.test(a)), r.avisos.join(' | '));
  // Textos nuevos del espacio modelo y de los bloques copiados de la plantilla (los parámetros sísmicos van en un bloque).
  const deBloques = [...db.tables.blockTable.newIterator()].filter((b) => /^PLT_/.test(b.name)).flatMap((b) => b.newIterator().toArray());
  const textos = [...db.tables.blockTable.modelSpace.newIterator().toArray().slice(antes), ...deBloques].map((e) => e.contents ?? e.textString ?? '');
  for (const t of ['Hz = 0.60 m', 'Df = -2.50 m', 'NFZ=-2.50m', 'U=1.5 categoria "A2" (EDIFICACIONES ESENCIALES)', 'S=1.40(suelo tipo S3)', 'Tp=1.00(suelo S3)', 'TL=1.6(suelo tipo S3)']) {
    assert.ok(textos.includes(t) || textos.some((x) => x.includes(t)), `missing "${t}"`);
  }
  for (const t of ['U=1.0 categoria "C" (EDIFICACIONES COMUNES)', 'S=1.40(suelo tipo s2)', 'Hz = 0.70 m']) assert.ok(!textos.some((x) => x.includes(t)), `reference value left: "${t}"`);

  // Otro proyecto en el mismo dibujo (zona 3, suelo S2, vivienda): sus propios valores, no los anteriores.
  datos.zona = '3'; datos.suelo = 'S2'; datos.categoria = 'C';
  const r2 = await SKILLS.find((s) => s.name === 'plano_estructuras').run({vista: '1ER NIVEL'}, ctx);
  assert.match(r2.mensaje, /Z=0\.35, U=1, S=1\.15, Tp=0\.6/);
  const bloques = [...db.tables.blockTable.newIterator()].filter((b) => b.newIterator().toArray().some((e) => /^U=1\.0 categoria "C"/.test(e.contents ?? '')));
  assert.equal(bloques.length, 1, 'the second project gets its own copy of the seismic block');
  assert.ok(bloques[0].newIterator().toArray().some((e) => e.contents === 'Z=0.35(ZONA 3)'));
});

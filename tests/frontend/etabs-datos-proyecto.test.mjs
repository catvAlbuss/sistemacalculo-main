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
  // Especificaciones técnicas (3) SUELO): Df y Z, U del proyecto; R queda (depende del sistema estructural).
  const g = textosSismicos(parametrosSismicos({zona: 3, categoria: 'A2'}), {df: 2.5});
  assert.equal(g('Profundidad de desplante Df=2.00 m desde el nivel de terreno natural'), 'Profundidad de desplante Df=2.50 m desde el nivel de terreno natural');
  assert.equal(g(' Parámetros sísmicos: Z=0.25, U=1.5, Rx=8, Ry=8'), ' Parámetros sísmicos: Z=0.35, U=1.5, Rx=8, Ry=8');
  for (const t of ['Profundidad de desplante Df=2.00 m desde el nivel de terreno natural', ' Parámetros sísmicos: Z=0.25, U=1.5, Rx=8, Ry=8']) assert.ok(dxf.some((l) => l.normalize('NFC') === t.normalize('NFC') || l.includes('desplante Df=2.00') || /metros s.smicos: Z=0\.25/.test(l)), `template line "${t}" not found`);
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

test('chat tool datos_proyecto saves what the engineer dictates into the panel and says what is missing', async () => {
  const panel = {hz: '0.70'};
  const guardados = [];
  const ctx = createDrawingContext({getDatabase: () => null, dm, getProjectData: () => panel, setProjectData: (d) => { guardados.push(d); Object.assign(panel, d); }});
  const skill = SKILLS.find((s) => s.name === 'datos_proyecto');
  const r = await skill.run({hz: 0.6, df: 2.5, zona: 2, suelo: 'S3', categoria: 'A2'}, ctx);
  assert.deepEqual(guardados, [{hz: '0.6', df: '2.5', zona: '2', suelo: 'S3', categoria: 'A2'}]);
  assert.match(r.mensaje, /^Guardé Hz, Df, zona, suelo, categoría en Datos del proyecto\. Datos del proyecto: Hz 0\.60 m, Df 2\.50 m, zona 2, suelo S3, categoría A2 \(Z=0\.25, U=1\.5, S=1\.4, Tp=1, TL=1\.6\)\. Pide "genera el plano de estructuras"/);
  assert.doesNotMatch(r.mensaje, /niveles|pisos/, 'the chat does not ask for floors');
  const mal = await skill.run({hz: 60}, ctx);
  assert.match(mal.avisos[0], /No guardé/);
  assert.equal(panel.hz, '0.6', 'a wrong value does not overwrite a good one');
  const consulta = await skill.run({}, ctx);
  assert.match(consulta.mensaje, /^Datos del proyecto: Hz 0\.60 m/);
});

test('columneta schedule: sections at the largest standard scale that fits, ".20" dimensions and one bar callout per face', async () => {
  const {cuadroColumnetas} = await import('../../resources/js/ingenieria/laminas/cuadroColumnas.js');
  const r = cuadroColumnetas([{codigo: 'pa', b: 0.2, h: 0.13}, {codigo: 'pb', b: 0.65, h: 0.13}, {codigo: 'pc', b: 0.13, h: 0.22}]);
  const textos = r.contenido.primitivas.filter((p) => p.type === 'text').map((p) => p.text ?? p.texto ?? p.value);
  const escala = r.filas[0].escala;
  assert.ok(['1/10', '1/15', '1/20', '1/25'].includes(escala), escala);
  assert.ok(textos.includes(escala), 'header shows the real scale');
  for (const t of ['.20', '.13', '.65', '.22']) assert.ok(textos.includes(t), `missing dimension "${t}"`);
  const llamadas = r.contenido.primitivas.filter((p) => p.type === 'text' && p.align === 'izq' && /Ø3\/8"$/.test(p.value)).map((p) => p.value);
  // Como el ingeniero: una llamada "2Ø3/8"" por cada par de varillas (pa 2, pb 6, pc 3).
  assert.deepEqual(llamadas, Array(11).fill('2Ø3/8"'), 'one "2Ø3/8"" callout per bar pair');
  // Callouts stay inside the section row of the schedule.
  const H = 2.9, yFila = H - (0.36 + 0.3 + 1.5) * H / 2.9;
  assert.ok(r.contenido.primitivas.filter((p) => p.type === 'text' && p.align === 'izq').every((p) => p.at[1] > yFila), 'callouts above the reinforcement row');
  assert.deepEqual(r.filas.map((f) => f.refuerzo), ['4Ø3/8"', '12Ø3/8"', '6Ø3/8"'], 'like the engineer: pa 4Ø, pb 12Ø, pc 6Ø');
  // The widest section stays inside its cell.
  const W = 11.9, c0 = W * 0.075, c1 = W * 0.1, wTipo = (W - c0 - c1) / 3;
  assert.ok(0.65 * 50 / Number(escala.split('/')[1]) <= wTipo * 0.46);
  // Larger than the old fixed 1/25 when there is room.
  assert.notEqual(cuadroColumnetas([{codigo: 'pa', b: 0.2, h: 0.13}]).filas[0].escala, '1/25');
});

test('column schedule: section dimensions and stirrup dimensions like the engineer (C1 L .40/.25, C2 .25x.38)', async () => {
  const {cuadroColumnas} = await import('../../resources/js/ingenieria/laminas/cuadroColumnas.js');
  const Lc = [{x: 0, y: 0}, {x: 0.4, y: 0}, {x: 0.4, y: 0.25}, {x: 0.25, y: 0.25}, {x: 0.25, y: 0.4}, {x: 0, y: 0.4}];
  const rect = [{x: 0, y: 0}, {x: 0.25, y: 0}, {x: 0.25, y: 0.38}, {x: 0, y: 0.38}];
  const r = cuadroColumnas([
    {tipo: 'C1', b: 0.4, h: 0.4, x: 0.2, y: 0.2, area: 0.1375, forma: 'L', espesor: 0.25, clase: 'columna', contorno: Lc},
    {tipo: 'C2', b: 0.25, h: 0.38, x: 0.125, y: 0.19, area: 0.095, forma: 'rectangular', contorno: rect},
  ]);
  const cotas = r.contenido.primitivas.filter((p) => p.type === 'text' && /^\.\d\d$/.test(p.value)).map((p) => p.value);
  // C1: outer legs and thicknesses (not the re-entrant edges) + two stirrups; C2: top and right + its stirrup.
  assert.deepEqual(cotas, ['.40', '.25', '.25', '.40', '.32', '.17', '.17', '.32', '.25', '.38', '.17', '.30']);
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
  for (const t of ['Hz = 0.60 m', 'Df = -2.50 m', 'NFZ=-2.50m', 'Profundidad de desplante Df=2.50 m', 'Parámetros sísmicos: Z=0.25, U=1.5', 'U=1.5 categoria "A2" (EDIFICACIONES ESENCIALES)', 'S=1.40(suelo tipo S3)', 'Tp=1.00(suelo S3)', 'TL=1.6(suelo tipo S3)']) {
    assert.ok(textos.includes(t) || textos.some((x) => x.includes(t)), `missing "${t}"`);
  }
  for (const t of ['U=1.0 categoria "C" (EDIFICACIONES COMUNES)', 'S=1.40(suelo tipo s2)', 'Hz = 0.70 m']) assert.ok(!textos.some((x) => x.includes(t)), `reference value left: "${t}"`);

  // El ingeniero corrige por chat (zona 3, suelo S2, vivienda): el agente guarda los datos y
  // REHACE las láminas en el mismo lugar, sin apilar otra copia debajo.
  const despues1 = db.tables.blockTable.modelSpace.newIterator().toArray().length;
  const r2 = await SKILLS.find((s) => s.name === 'plano_estructuras').run({vista: '1ER NIVEL', zona: 3, suelo: 'S2', categoria: 'C'}, ctx);
  assert.match(r2.mensaje, /^Guardé zona, suelo, categoría en Datos del proyecto\. Reemplacé las láminas anteriores\. Generé las láminas E-01/);
  assert.match(r2.mensaje, /Z=0\.35, U=1, S=1\.15, Tp=0\.6/);
  const despues2 = db.tables.blockTable.modelSpace.newIterator().toArray().length;
  assert.ok(Math.abs(despues2 - despues1) < 0.05 * (despues1 - antes), `sheets replaced, not stacked: ${antes} → ${despues1} → ${despues2}`);
  assert.equal(ctx.datosProyecto().zona, '3', 'chat data kept for the next requests');
  // Con "conservar" se agregan otras láminas debajo.
  const r3 = await SKILLS.find((s) => s.name === 'plano_estructuras').run({vista: '1ER NIVEL', conservar: true}, ctx);
  assert.doesNotMatch(r3.mensaje, /Reemplacé/);
  assert.ok(db.tables.blockTable.modelSpace.newIterator().toArray().length > despues2 + 0.9 * (despues1 - antes));
  const bloques = [...db.tables.blockTable.newIterator()].filter((b) => b.newIterator().toArray().some((e) => /^U=1\.0 categoria "C"/.test(e.contents ?? '')));
  assert.equal(bloques.length, 1, 'the second project gets its own copy of the seismic block');
  assert.ok(bloques[0].newIterator().toArray().some((e) => e.contents === 'Z=0.35(ZONA 3)'));
});

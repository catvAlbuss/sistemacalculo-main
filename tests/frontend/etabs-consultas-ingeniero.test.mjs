// El agente le pregunta al ingeniero lo que no tiene seguro antes de dibujar, dibuja con lo que él
// elige y lo guarda como aprendizaje (confirmación o corrección).
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {consultasDelPlano, aplicarRespuestas, textoConsultas} from '../../resources/js/ingenieria/agente/consultas.js';
import {PLANOS} from '../../scripts/agente/planos.mjs';

const propuesta = {decisiones: {
  cimentacion: {valor: 'zapatas', confianza: 0.75, regla: 'un nivel con más de 60 m² → zapatas', ingeniero: 'confírmalo'},
  losaDeTecho: {valor: false, confianza: 0.9, fuentes: ['vinchos:modulo-02']},
  espesorLosa: {valor: 0.2, confianza: 0.75, regla: 'luz libre', ingeniero: 'confírmalo'},
}};

test('only what the agent is not sure about is asked, with options, its recommendation and why', () => {
  const {consultas, informes} = consultasDelPlano({rasgos: {niveles: 1, luzLosa: 5.6}, propuesta,
    ambientes: [{tipo: 'maciza', motivo: 'baños', ejes: ['3–6', 'M–O´'], area: 20}, {tipo: 'abertura', motivo: 'escalera', ejes: ['3–6', 'O´–U'], area: 30}]});
  assert.deepEqual(consultas.map((c) => c.clave), ['cimentacion', 'losaMaciza', 'espesorLosa'], 'one level: the roof slab is not asked');
  const cim = consultas[0];
  assert.equal(cim.recomendado, 'zapatas');
  assert.ok(cim.opciones.length === 2 && /estudio de suelos/.test(cim.porque));
  assert.match(consultas[1].pregunta, /M–O´/);
  assert.match(informes[0], /escalera entre ejes 3–6 \/ O´–U.*detalle/i);
  assert.match(textoConsultas({consultas, informes}), /^Confírmame/);
});

test('small spans and sure decisions are not asked (no noise for the engineer)', () => {
  const seguro = {decisiones: {cimentacion: {valor: 'platea', confianza: 0.95}, losaDeTecho: {valor: true, confianza: 0.9}, espesorLosa: {valor: 0.2, confianza: 0.75, ingeniero: 'x'}}};
  assert.ok(!consultasDelPlano({rasgos: {niveles: 3, luzLosa: 4}, propuesta: {decisiones: {...seguro.decisiones, losaDeTecho: {valor: false, ingeniero: 'x'}}}}).consultas.length, 'several levels: roof slab is the office criterion, not asked');
  assert.equal(consultasDelPlano({rasgos: {niveles: 1, luzLosa: 3}, propuesta: seguro}).consultas.length, 0);
});

test('answers: chosen values are used; a different choice is a correction, the same one a confirmation', () => {
  const {consultas} = consultasDelPlano({rasgos: {niveles: 1, luzLosa: 4.7}, propuesta: {decisiones: {...propuesta.decisiones, losaDeTecho: {valor: false, confianza: 0.6, ingeniero: 'x'}}},
    ambientes: [{tipo: 'maciza', motivo: 'baños', ejes: ['3–6', 'M–O´'], area: 20}]});
  const {elegido, eventos} = aplicarRespuestas(consultas, {cimentacion: 'platea', losaMaciza: 'false', losaDeTecho: 'false'});
  assert.equal(elegido.cimentacion, 'platea');
  assert.equal(elegido.losaMaciza, false);
  assert.deepEqual(eventos.map((e) => `${e.tipo}:${e.clave}=${e.valor}`).sort(),
    ['confirmacion:losa=aligerada', 'confirmacion:losaDeTecho=false', 'correccion:cimentacion=platea'], 'one level: aligerado in the toilets is what the agent recommends');
  assert.equal(aplicarRespuestas(consultas, {}).eventos.length, 0, 'nothing answered, nothing learned');
});

// De punta a punta con el módulo 1 (si está en esta máquina).
const pares = join(PLANOS, 'estructuras', 'pares.json');
const m1 = existsSync(pares) && JSON.parse(readFileSync(pares, 'utf8')).vinchos?.find((p) => p.id === 'modulo-01');
test('module 1: the engineer answers in the form and the sheets follow his decisions', {skip: !m1 && 'sin los planos de entrenamiento'}, async () => {
  const dm = await import('@mlightcad/data-model');
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const {createDrawingContext} = await import('../../resources/js/ingenieria/cad/drawingContext.js');
  const {SKILLS} = await import('../../resources/js/ingenieria/agente/skills/index.js');
  const leer = async (ruta, tipo) => { const db = new dm.AcDbDatabase(); const b = readFileSync(ruta); await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, tipo); return db; };
  const db = await leer(join(PLANOS, 'estructuras', m1.arquitectura), dm.AcDbFileType.DWG);
  const plantilla = existsSync('public/assets/plantillas/estructuras-laminas.dxf') ? {db: await leer('public/assets/plantillas/estructuras-laminas.dxf', dm.AcDbFileType.DXF), config: JSON.parse(readFileSync('public/assets/plantillas/estructuras-laminas.json', 'utf8'))} : {db: null, config: {modo: 'adaptativa', escalaPlanos: 1}};
  const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({}), afterDraw: () => {}});
  let preguntado = null;
  const guardados = [];
  ctx.pedirDatos = async (pedido) => { preguntado = pedido; return {hz: .7, df: 2, zona: 3, suelo: 'S2', categoria: 'A2', decisiones: {cimentacion: 'zapatas', losaMaciza: 'false'}}; };
  ctx.registrarAprendizaje = async (e) => { guardados.push(e); return {ok: true}; };
  ctx.eventosDeUso = async () => [];
  const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({vista: 'primer nivel'}, ctx);
  assert.ok(r.ok, r.error);
  assert.ok(preguntado.consultas.some((c) => c.clave === 'cimentacion') && preguntado.consultas.some((c) => c.clave === 'losaMaciza'));
  assert.equal(ctx.memoria.modeloEstructural.cimentacion.tipo, 'zapatas', 'the engineer chose footings');
  // Aligerado en los baños (≈ 7.4 x 2.4 m): solo queda maciza la losa alrededor de la escalera (descanso, hall).
  assert.ok(ctx.memoria.modeloEstructural.losa.maciza < 16, `and aligerado in the toilets (${ctx.memoria.modeloEstructural.losa.maciza} m² left around the stair)`);
  assert.ok(r.decidido.some((d) => /Zapatas/.test(d)));
  assert.ok(!r.paraElIngeniero, 'already answered: nothing left to ask');
  assert.deepEqual(guardados.map((e) => `${e.tipo}:${e.clave}`).sort(), ['correccion:cimentacion', 'correccion:losa']);
  assert.ok(guardados.every((e) => e.rasgos && !JSON.stringify(e).includes('VINCHOS')), 'only plan geometry is stored');
});

test('a heavy plan (block libraries nobody uses) is reported with what to do in AutoCAD', async () => {
  const {pesoDelDibujo, diagnosticarLectura} = await import('../../resources/js/ingenieria/lectura/diagnostico.js');
  const it = (xs) => ({newIterator: () => ({toArray: () => xs})});
  const linea = {dxfTypeName: 'LINE', layer: '0'};
  const reg = (name, ents) => ({name, ...it(ents)});
  const modelo = reg('*Model_Space', [{dxfTypeName: 'INSERT', blockName: 'PUERTA', layer: '0', blockTableRecord: reg('PUERTA', [linea])}, linea]);
  const registros = [modelo, reg('*Paper_Space', []), reg('PUERTA', [linea]), ...Array.from({length: 30}, (_, i) => reg(`MUEBLE${i}`, Array(1000).fill(linea)))];
  const database = {tables: {blockTable: {...it(registros), modelSpace: modelo}, layerTable: it([])}, insunits: 6};
  const p = pesoDelDibujo(database);
  assert.equal(p.bloquesSinUso, 30);
  assert.equal(p.entidadesSinUso, 30000);
  const d = diagnosticarLectura({database, items: [], vistas: []});
  assert.ok(d.avisos.some((a) => /Plano pesado/.test(a) && /PURGE/.test(a)));
});

test('soft soil (S3/S4) recommends a raft over the area rule, and says why', () => {
  const {consultas} = consultasDelPlano({rasgos: {niveles: 1, luzLosa: 4}, propuesta, suelo: 'S3'});
  const cim = consultas.find((c) => c.clave === 'cimentacion');
  assert.equal(cim.recomendado, 'platea');
  assert.match(cim.porque, /Suelo S3 \(blando\)/);
  assert.equal(consultasDelPlano({rasgos: {niveles: 1, luzLosa: 4}, propuesta, suelo: 'S2'}).consultas[0].recomendado, 'zapatas');
});

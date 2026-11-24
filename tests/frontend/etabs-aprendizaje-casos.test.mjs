// Aprendizaje por casos (pares arquitectura + estructuras): el agente decide lo que los
// proyectos estudiados respaldan y deja al ingeniero lo que cambia de un proyecto a otro.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {parse, compileTemplate} from '@vue/compiler-sfc';
import * as dm from '@mlightcad/data-model';
import {decisionesDeEstructura, nivelDeTitulo, escalaEntrePlanos, compararColumnas, geometriaDeLecturas, proponer, evaluar, reglasValidas, MIN_CASOS_COSTUMBRE} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {CASOS} from '../../resources/js/ingenieria/aprendizaje/casosAprendidos.js';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import * as estructuraPlano from '../../resources/js/ingenieria/agente/skills/estructuraPlano.js';
import {plano} from '../../scripts/agente/planos.mjs';

test('pending team submissions are not added to in-session shared proposals', async () => {
  const registro = await import('../../resources/js/ingenieria/aprendizaje/registro.js');
  registro.olvidarSesion();
  const r = await registro.registrarEvento({
    tipo: 'correccion', clave: 'losa', valor: 'maciza', rasgos: {niveles: 2},
  });
  assert.equal(r.ok, false);
  assert.deepEqual(await registro.eventosDeUso(), []);
});

test('submission reports pending status only after successful save and makes failures actionable', async () => {
  const registro = await import('../../resources/js/ingenieria/aprendizaje/registro.js');
  const previous = {window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch};
  globalThis.window = {};
  globalThis.document = {querySelector: () => null};
  try {
    globalThis.fetch = async () => ({ok: true, json: async () => ({ok: true, estado: 'pendiente', evento_id: 'event-1'})});
    assert.deepEqual(await registro.registrarEvento({tipo: 'correccion', clave: 'df', valor: 2, rasgos: {}}), {
      ok: true, guardado: true, estado: 'pendiente', evento_id: 'event-1',
    });

    globalThis.fetch = async () => ({ok: false, status: 503});
    const failed = await registro.registrarEvento({tipo: 'correccion', clave: 'df', valor: 2, rasgos: {}});
    assert.equal(failed.ok, false);
    assert.match(failed.error, /enviar/i);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});

test('review API reports non-OK and network errors without treating them as success', async () => {
  const registro = await import('../../resources/js/ingenieria/aprendizaje/registro.js');
  const previous = {window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch};
  globalThis.window = {};
  globalThis.document = {querySelector: () => null};
  try {
    globalThis.fetch = async () => ({ok: false, status: 503});
    const load = await registro.cargarEventosPendientes();
    assert.equal(load.ok, false);
    assert.match(load.error, /cargar/i);

    globalThis.fetch = async () => ({ok: false, status: 500});
    const failedReview = await registro.resolverEventoPendiente('event-1', 'aprobar');
    assert.equal(failedReview.ok, false);
    assert.match(failedReview.error, /aprobar/i);

    globalThis.fetch = async () => { throw new Error('offline'); };
    const action = await registro.resolverEventoPendiente('event-1', 'aprobar');
    assert.equal(action.ok, false);
    assert.match(action.error, /conexión|conectar|intentar/i);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});

test('a failed review action leaves its pending event in the queue', async () => {
  const {eventosTrasRevision} = await import('../../resources/js/ingenieria/aprendizaje/registro.js');
  const pendientes = [{evento_id: 'event-1', clave: 'metrado'}];
  assert.deepEqual(eventosTrasRevision(pendientes, 'event-1', {ok: false}), pendientes);
  assert.deepEqual(eventosTrasRevision(pendientes, 'event-1', {ok: true}), []);
});

test('review panel renders loading, errors, submission status, and sanitized event context', () => {
  const source = readFileSync('resources/js/etabs/components/AgentePredimPanel.vue', 'utf8');
  const parsed = parse(source, {filename: 'AgentePredimPanel.vue'});
  assert.equal(parsed.errors.length, 0);
  const compiled = compileTemplate({
    source: parsed.descriptor.template.content,
    filename: 'AgentePredimPanel.vue',
    id: 'aprendizaje-panel-test',
  });
  assert.deepEqual(compiled.errors, []);
  for (const binding of [
    'revision.cargando', 'revision.error', 'revision.errores[e.evento_id]', 'revision.revisando[e.evento_id]',
    'met.guardado', 'e.motivo', 'e.rasgos', 'e.partida', 'e.fila', 'e.campo', 'e.termino',
  ]) {
    assert.ok(compiled.code.includes(binding), `review panel renders ${binding}`);
  }
  assert.match(source, /Enviada y pendiente de aprobación; todavía no está compartida con el agente/);
  assert.match(source, /ultimoEnvioAprendizaje/);
  assert.match(source, /no se compartirá hasta que se apruebe/i);
});

const eje = (nombre, x0, y0, x1, y1) => ({nombre, p: {x: x0, y: y0}, q: {x: x1, y: y1}});

test('reads what the engineer decided from the structural sheet texts, not from general notes', () => {
  const d = decisionesDeEstructura(['PLANO DE PLATEA CIMENTACION', 'Hz=0.70m', 'Df = -2.00 m', 'LOSA ALIGERADA E=20CM', 'PLANO DE ALIGERADO',
    'En vigas chatas, losas aligeradas y losas macizas será de 2 cm.', 'PLANO DE CIMIENTO CORRIDO']);
  assert.equal(d.cimentacion, 'platea');
  assert.equal(d.cimientoCorrido, true);
  assert.equal(d.hz, 0.7);
  assert.equal(d.df, 2);
  assert.equal(d.losa, 'aligerada', 'a slab named in the notes is not a slab drawn');
  assert.equal(d.espesorLosa, 0.2);
  assert.equal(nivelDeTitulo('MÓDULO IX: PLANTA DE DISTRIBUCIÓN 2DO NIVEL'), 2);
  assert.equal(nivelDeTitulo('Modulo XIV-Techo'), null);
});

test('architecture and structure are aligned by their named axes, also when drawn at another scale', () => {
  const arq = {ejes: [eje('1', 0, 0, 0, 6), eje('2', 4, 0, 4, 6), eje('A', 0, 0, 4, 0), eje('B', 0, 5, 4, 5)],
    columnas: [{eje: '1/A', tipo: 'C1', b: 0.4, h: 0.4}, {eje: '2/B', tipo: 'C2', b: 0.25, h: 0.5}]};
  const est = {ejes: [eje('1', 10, 0, 10, 12), eje('2', 18, 0, 18, 12), eje('A', 10, 0, 18, 0), eje('B', 10, 10, 18, 10)],
    columnas: [{eje: 'A/1', tipo: 'C1', b: 0.8, h: 0.8}, {eje: 'B/2', tipo: 'PL1', b: 0.6, h: 2}]};
  assert.equal(escalaEntrePlanos(arq.ejes, est.ejes), 2);
  const r = compararColumnas(arq, est);
  assert.equal(r.escala, 2);
  assert.deepEqual(r.filas.map((f) => f.igual), [true, false], 'C1 kept (at x2), C2 changed to a wall');
  assert.equal(r.coincidencia, 0.5);
});

test('paired drawing geometry keeps recognized elements per view without source identifiers', () => {
  const geometria = geometriaDeLecturas([
    {titulo: 'CLIENTE CONFIDENCIAL - PLANTA 1ER NIVEL', lectura: {
      ejes: [eje('1', 100, 200, 100, 800)],
      columnas: [{eje: '1/A', x: 100, y: 200, b: 0.4, h: 0.5, forma: 'rectangular', nodo: {x: 100, y: 200}}],
      listaColumnetas: [],
    }},
    {titulo: 'CLIENTE CONFIDENCIAL - PLANTA 2DO NIVEL', lectura: {
      ejes: [eje('1', 100, 200, 100, 800)],
      columnas: [],
      listaColumnetas: [],
    }},
  ]);

  assert.equal(geometria.unidad, 'm');
  assert.equal(geometria.vistas.length, 2);
  assert.deepEqual(geometria.vistas.map((v) => v.nivel), [1, 2]);
  assert.deepEqual(geometria.vistas[0].categorias.columnas, [
    {eje: '1/A', centro: {x: 0, y: 0}, b: 0.4, h: 0.5, forma: 'rectangular'},
  ]);
  assert.equal(geometria.vistas[0].categorias.murosVanos, null);
  assert.equal(geometria.vistas[0].categorias.losas, null);
  assert.doesNotMatch(JSON.stringify(geometria), /CLIENTE CONFIDENCIAL/);
});

test('the agent decides alone only what a validated rule or at least 3 matching projects back', () => {
  const caso = (nombre, luz, niveles, estribos) => ({nombre, rasgos: {niveles, luzLosa: luz, area: 60, columnas: 6, techoLiviano: true, placas: false, columnetas: 10},
    decisiones: {cimentacion: 'platea', espesorLosa: luz > 5 ? 0.25 : 0.2, cimientoCorrido: true, losaDeTecho: niveles === 1, estribos}});
  const casos = [caso('a', 4, 1, '3/8": 1@.05, 12@.10'), caso('b', 5.8, 2, '3/8": 1@.05, 12@.10'), caso('c', 3, 1, '3/8": 1@.05, 9@.10')];
  assert.ok(reglasValidas(casos).find((r) => r.clave === 'espesorLosa').valida);
  const p = proponer({niveles: 2, luzLosa: 6.2, area: 70, columnas: 8, techoLiviano: true, placas: false, columnetas: 12}, casos);
  assert.equal(p.decisiones.espesorLosa.valor, 0.25, 'rule L/25 generalizes to a span no case had');
  assert.equal(p.decisiones.losasDeEntrepiso.valor, 1);
  assert.equal(p.decisiones.losaDeTecho.valor, false);
  assert.ok(p.decide.includes('cimentacion'), `${MIN_CASOS_COSTUMBRE} projects agree on the raft`);
  assert.ok(p.ingeniero.includes('estribos'), 'stirrups change between projects: for the engineer');
  assert.match(p.decisiones.estribos.ingeniero, /Cambia entre proyectos/);
});

test('a thickness override that conflicts with learned cases requires engineer review', () => {
  // 6.2 m entre ejes = 5.95 m libres: el criterio pide 0.25 aunque los casos digan 0.20.
  const rasgos = {niveles: 2, luzLosa: 6.2, area: 100, columnas: 8, techoLiviano: false, placas: false, columnetas: 0};
  const casos = [1, 2, 3].map((n) => ({
    nombre: `caso-${n}`,
    rasgos: {...rasgos},
    decisiones: {losa: 'aligerada', espesorLosa: 0.2},
  }));
  const propuesta = proponer(rasgos, casos);

  assert.equal(propuesta.decisiones.espesorLosa.valor, 0.25);
  assert.match(propuesta.decisiones.espesorLosa.ingeniero, /verificar|ingenier/i);
});

test('modules from one project do not count as independent evidence for learned rules or decisions', () => {
  const rasgos = {niveles: 2, luzLosa: 3, area: 60, columnas: 6, techoLiviano: false, placas: false, columnetas: 0};
  const casos = [1, 2, 3].map((n) => ({
    nombre: `vinchos:modulo-${n}`,
    grupo: 'vinchos',
    rasgos: {...rasgos},
    decisiones: {espesorLosa: 0.2, losaDeTecho: false, cimientoCorrido: false, fcColumnas: 210},
  }));
  const propuesta = proponer(rasgos, casos);

  assert.equal(reglasValidas(casos).some((regla) => regla.valida), false);
  assert.match(propuesta.decisiones.fcColumnas.ingeniero, /independiente/i);
});

test('roof slab: several levels always carry it; one level unconfirmed keeps a review warning', () => {
  // Los 9 edificios de varios niveles del despacho llevan losa en el último nivel.
  assert.deepEqual(estructuraPlano.losaTechoParaGeneracion(3, {valor: false, ingeniero: 'confirmar'}, true), {losaTecho: true, aviso: null});
  const uno = estructuraPlano.losaTechoParaGeneracion(1, {valor: false, ingeniero: 'confirmar'}, true);
  assert.equal(uno.losaTecho, true);
  assert.match(uno.aviso, /revisar|confirmar/i);
  assert.equal(estructuraPlano.losaTechoParaGeneracion(1, {valor: false, confianza: 0.9}, true).losaTecho, false, 'confirmed: light cover only');
});

test('learned cases: when the agent decides alone it is right (leave one out)', () => {
  assert.ok(CASOS.length >= 3);
  for (const c of CASOS) assert.ok(!JSON.stringify(c).match(/BARDALES|101402|2166247|CIP/i), `${c.nombre} has no personal data`);
  const ev = evaluar(CASOS);
  const proyectos = new Set(CASOS.map((c) => String(c.grupo ?? '').trim().toLocaleLowerCase() || c.nombre));
  if (proyectos.size < MIN_CASOS_COSTUMBRE) {
    assert.equal(ev.aciertoAgente, null, JSON.stringify(ev.filas));
    assert.equal(ev.parteAgente, 0);
  } else {
    assert.equal(ev.aciertoAgente, 1, JSON.stringify(ev.filas));
  }
});

const m09 = plano('estructuras', 'Modulo 09 Vilcabamba arquitectura.dwg');
test('module 9 (two levels) through the chat tool: reads 2 levels and proposes the floor slab', {skip: !existsSync(m09)}, async () => {
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const db = new dm.AcDbDatabase();
  const b = readFileSync(m09);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  const ctx = createDrawingContext({getDatabase: () => db, dm});
  ctx.memoria ??= {};
  const r = await SKILLS.find((s) => s.name === 'proponer_estructura').run({}, ctx);
  assert.equal(r.ok, true);
  assert.match(r.mensaje, /^Leí 2 nivel\(es\)/);
  assert.match(r.mensaje, /Losas de entrepiso: 1/);
  assert.match(r.mensaje, /Espesor de losa \(m\): 0\.25/);
  assert.match(r.mensaje, /Para el ingeniero:[\s\S]*Profundidad de desplante/);
});

test('every correction of the engineer teaches the agent: same plan decided, similar plan asked', async () => {
  const {casosDeUso} = await import('../../resources/js/ingenieria/aprendizaje/casos.js');
  const rasgos = {niveles: 2, luzLosa: 5.84, area: 63.6, columnas: 6, techoLiviano: true, placas: true, columnetas: 19};
  const base = proponer(rasgos, CASOS);
  assert.notEqual(base.decisiones.losa.valor, 'maciza');
  const uso = casosDeUso([{tipo: 'correccion', clave: 'losa', valor: 'maciza', propuesto: base.decisiones.losa.valor, motivo: 'escalera', rasgos}]);
  const mismo = proponer(rasgos, [...CASOS, ...uso]);
  assert.equal(mismo.decisiones.losa.valor, 'maciza');
  assert.ok(mismo.decide.includes('losa'), 'same plan: the agent applies the correction without asking');
  const parecido = proponer({...rasgos, luzLosa: 5.5, area: 60}, [...CASOS, ...uso]);
  assert.equal(parecido.decisiones.losa.valor, 'maciza');
  assert.match(parecido.decisiones.losa.ingeniero, /En un plano parecido lo corregiste a maciza/);
  // Una corrección que contradice una regla la invalida: el agente deja de aplicarla solo.
  const contra = casosDeUso([{tipo: 'correccion', clave: 'cimientoCorrido', valor: false, rasgos: {...rasgos, columnetas: 4, area: 20}}]);
  assert.equal(reglasValidas([...CASOS, ...contra]).find((r) => r.clave === 'cimientoCorrido').valida, false);
});

test('module 9 through the chat: the engineer corrects the slab and the next proposal uses it', {skip: !existsSync(m09)}, async () => {
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const db = new dm.AcDbDatabase();
  const b = readFileSync(m09);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  const registrados = [];
  const ctx = createDrawingContext({getDatabase: () => db, dm});
  ctx.memoria ??= {};
  ctx.registrarAprendizaje = async (e) => { registrados.push(e); };
  ctx.eventosDeUso = async () => registrados;
  const run = (n, a = {}) => SKILLS.find((s) => s.name === n).run(a, ctx);
  await run('proponer_estructura');
  const c = await run('corregir_estructura', {decision: 'espesorLosa', valor: '30 cm', motivo: 'sobrecarga de biblioteca'});
  assert.match(c.mensaje, /^Anoté Espesor de losa \(m\): 0\.3 \(yo había propuesto 0\.25\)/);
  assert.equal(registrados.length, 1);
  assert.deepEqual(Object.keys(registrados[0].rasgos).sort(), ['ancho', 'area', 'columnas', 'columnetas', 'largo', 'luzLosa', 'luzMax', 'niveles', 'placas', 'techoLiviano'].sort(), 'only geometry is stored');
  const r = await run('proponer_estructura');
  assert.match(r.mensaje, /Espesor de losa \(m\): 0\.30 \(lo corregiste en este mismo plano\)/);
});

test('project data the model invents is not saved: only what the engineer wrote', async () => {
  const guardados = [];
  const ctx = createDrawingContext({getDatabase: () => null, dm, getProjectData: () => ({}), setProjectData: (d) => guardados.push(d)});
  ctx.memoria ??= {};
  ctx.memoria.ultimoPedido = 'según el estudio de suelos el Df es 2.50 m';
  // Un modelo chico agrega zona, suelo y Hz que nadie dijo.
  const r = await SKILLS.find((s) => s.name === 'datos_proyecto').run({df: 2.5, hz: 0.6, zona: 3, suelo: 'S2'}, ctx);
  assert.deepEqual(guardados, [{df: '2.5'}]);
  assert.ok(r.avisos.some((a) => /El motor propuso Hz = 0\.6, zona = 3, suelo = S2 sin que lo dijeras; no lo apliqué/.test(a)), r.avisos.join(' | '));
});

test('no warning when the model repeats the values already saved in the project data', async () => {
  const ctx = createDrawingContext({getDatabase: () => null, dm, getProjectData: () => ({hz: '0.60', df: '2.50', zona: '3'}), setProjectData: () => {}});
  ctx.memoria ??= {};
  ctx.memoria.ultimoPedido = 'genera el plano de estructuras';
  await SKILLS.find((s) => s.name === 'datos_proyecto').run({hz: 0.6, df: 2.5, zona: 3}, ctx);
  assert.equal(ctx.memoria.avisoInventados, null, 'same values as saved: nothing to warn');
});

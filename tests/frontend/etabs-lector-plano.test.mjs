import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {aplanarModelo, detectarVistas, leerVista} from '../../resources/js/etabs/agente/lectorPlano.js';
import {extensionDibujo, refuerzoMinimo} from '../../resources/js/etabs/agente/laminaEstructuras.js';
import {espesorAligerado, seccionViga} from '../../resources/js/etabs/agente/aligeradoPlano.js';
import {createDrawingContext} from '../../resources/js/etabs/agente/drawingContext.js';
import {plano} from '../../scripts/agente/planos.mjs';
import {SKILLS} from '../../resources/js/etabs/agente/skills/index.js';

// Caso de referencia: la arquitectura es la entrada; la lámina del ingeniero
// (estructuras.dwg) es el resultado esperado.
const arquitectura = plano('estructuras', '14.VINCHOS MODULO 14 arquitectura.dwg');

// Carga el DWG en el mismo modelo de datos que usa el visor (sin worker).
async function abrir(path) {
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const db = new dm.AcDbDatabase();
  const buffer = readFileSync(path);
  await db.read(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  return db;
}

test('the reference architecture plan is in the training folder', {skip: !process.env.AGENTE_EXIGIR_PLANOS}, () => {
  assert.ok(existsSync(arquitectura), `missing ${arquitectura}: the real-plan tests below would be skipped`);
});

test('architecture plan of module 14: views, named axes (one inclined) and the four columns inside nested blocks', {skip: !existsSync(arquitectura)}, async () => {
  const db = await abrir(arquitectura);
  const {items, bloques} = aplanarModelo(db.tables.blockTable.modelSpace.newIterator().toArray());
  assert.ok(bloques.size > 50, 'nested blocks are exploded');
  const vistas = detectarVistas(items);
  const planta = vistas.find((v) => /primer nivel/i.test(v.titulo));
  assert.ok(planta, `views: ${vistas.map((v) => v.titulo).join(' | ')}`);
  const lectura = leerVista(items, planta);
  assert.deepEqual(lectura.ejes.map((e) => e.nombre).sort(), ['10', '8', 'Y´', 'Z´']);
  assert.equal(lectura.ejes.find((e) => e.nombre === 'Z´').inclinado, true);
  // Las cuatro columnas del cuadro del ingeniero, una por cruce de ejes.
  assert.deepEqual(lectura.columnas.map((c) => c.eje).sort(), ['10/Y´', '10/Z´', '8/Y´', '8/Z´']);
  const esquina = lectura.columnas.filter((c) => c.eje.endsWith('Y´'));
  assert.ok(esquina.every((c) => c.forma === 'L' && c.b === 0.4 && c.h === 0.4), 'corner columns C1 0.40x0.40 L');
  assert.equal(new Set(esquina.map((c) => c.tipo)).size, 1, 'mirrored L columns share a type');
  assert.equal(lectura.tipos.length, 3);
  assert.ok(lectura.columnetas >= 4, 'confinement columns are counted apart');
});

test('chat tools: vistas_plano and leer_estructura read the plan by view and tag columns without redrawing axes', {skip: !existsSync(arquitectura)}, async () => {
  const db = await abrir(arquitectura);
  const ctx = createDrawingContext({getDatabase: () => db, dm});
  const vistas = await SKILLS.find((s) => s.name === 'vistas_plano').run({}, ctx);
  assert.match(vistas.mensaje, /Primer nivel: ejes [^;]*; 4 columnas/);
  const lectura = await SKILLS.find((s) => s.name === 'leer_estructura').run({vista: 'primer nivel'}, ctx);
  assert.match(lectura.mensaje, /ejes 8, 10, Y´, Z´ \(inclinado\) y 4 columnas/);
  const todas = db.tables.blockTable.modelSpace.newIterator().toArray();
  assert.equal(todas.filter((e) => e.layer === 'E-COLUMNAS-ID').length, 4);
  assert.equal(todas.filter((e) => e.layer === 'E-EJES').length, 0, 'the plan already has its axes');
});

test('the chat only offers architecture-to-structures tools, nothing that feeds Cimentación 2.0', () => {
  const nombres = SKILLS.map((s) => s.name);
  assert.ok(nombres.includes('plano_estructuras'));
  assert.ok(!nombres.includes('zapatas_desde_plano'));
  const params = Object.keys(SKILLS.find((s) => s.name === 'plano_estructuras').parameters.properties);
  assert.deepEqual(params.sort(), ['cimentacion', 'vista'], 'no floors or loads asked in chat');
});

test('without the template, plano_estructuras draws a simple sheet below the architecture: foundation, slab, column schedule and title block', {skip: !existsSync(arquitectura)}, async () => {
  const db = await abrir(arquitectura);
  const enviados = [];
  const ctx = createDrawingContext({getDatabase: () => db, dm, onFoundation: (p) => enviados.push(p)});
  const skill = SKILLS.find((s) => s.name === 'plano_estructuras');
  const antes = db.tables.blockTable.modelSpace.newIterator().toArray().length;
  const ext = extensionDibujo(ctx.readPlan().items);

  const r = await skill.run({vista: 'primer nivel', cimentacion: 'zapatas'}, ctx);
  assert.equal(r.ok, true);
  assert.equal(r.lamina, 'E-01');
  assert.match(r.mensaje, /esc\. 1\/25/);
  assert.match(r.mensaje, /aligerado e=0\.20 m con \d+ viguetas y 4 vigas/);
  assert.match(r.mensaje, /cuadro de columnas C1 8Ø5\/8"/);
  assert.doesNotMatch(r.mensaje, /piso|Cimentación 2\.0/i);
  assert.equal(enviados.length, 0, 'nothing is sent to Cimentación 2.0');

  const nuevas = db.tables.blockTable.modelSpace.newIterator().toArray().slice(antes);
  const capa = (n) => nuevas.filter((e) => e.layer === n);
  const polilineas = (n) => capa(n).filter((e) => e instanceof dm.AcDbPolyline).length;
  // Cimentación (auto: zapatas, cimiento corrido bajo los 3 muros, VC donde hay puertas).
  assert.equal(polilineas('E-ZAPATAS'), 4);
  assert.equal(polilineas('E-CIMIENTO-CORRIDO'), 3);
  assert.equal(polilineas('E-VIGAS-CIMENTACION'), 1);
  // Aligerado: vigas en los 4 tramos de ejes, paño y viguetas.
  assert.equal(polilineas('E-VIGAS'), 4);
  assert.equal(polilineas('E-ALIGERADO'), 1, 'one slab panel');
  assert.ok(capa('E-VIGUETAS').filter((e) => e instanceof dm.AcDbLine).length >= 6, 'joist symbols every 0.40 m');
  // Dos plantas con sus ejes: 4 ejes x 2 burbujas x 2 planos.
  assert.equal(capa('E-EJES').filter((e) => e instanceof dm.AcDbCircle).length, 16);
  const textos = [...capa('E-LAMINA'), ...capa('E-TEXTO-LOSA')].map((e) => e.contents).join(' | ');
  for (const t of [/PLANO DE CIMENTACIÓN - MODULO XIV PRIMER NIVEL   ESC: 1\/25/, /PLANO DE ALIGERADO - MODULO XIV PRIMER NIVEL/, /CUADRO DE COLUMNAS/, /LÁMINA: E-01/, /LOSA ALIGERADA E=20CM/]) {
    assert.match(textos, t);
  }
  assert.doesNotMatch(textos, /piso\(s\)|Cimentación 2\.0/);
  for (const e of nuevas.filter((x) => x instanceof dm.AcDbPolyline)) {
    assert.ok(e.getPoint3dAt(0).y < ext.y0, 'the whole sheet sits below the architecture drawing');
  }

  // Un segundo pedido (con platea) hace E-02 al lado, sin encimarse.
  const platea = await skill.run({vista: 'primer nivel', cimentacion: 'platea'}, ctx);
  assert.equal(platea.lamina, 'E-02');
  assert.match(platea.mensaje, /cimentación con platea/);
  assert.ok(JSON.stringify(platea).length < 1200, 'compact tool result');
});

test('structural sizing rules used on the sheet', () => {
  // Cuantía mínima 1 % en 5/8": coincide con el cuadro del ingeniero del módulo 14.
  assert.equal(refuerzoMinimo(0.1375).texto, '8Ø5/8"'); // C1 L 0.40x0.40x0.25
  assert.equal(refuerzoMinimo(0.0845).texto, '6Ø5/8"'); // 0.25x0.38
  assert.equal(refuerzoMinimo(0.04).n, 4);
  // Aligerado 0.20 m hasta 5 m de luz; vigas 0.25 x L/12 con mínimo 0.40 (V 0.25x0.40 del ingeniero).
  assert.equal(espesorAligerado(3.0), 0.2);
  assert.equal(espesorAligerado(6), 0.25);
  assert.deepEqual(seccionViga(3.76), {b: 0.25, h: 0.4});
  assert.deepEqual(seccionViga(6), {b: 0.25, h: 0.5});
});

const plantillaDxf = 'public/assets/plantillas/estructuras-laminas.dxf';
const plantillaJson = 'public/assets/plantillas/estructuras-laminas.json';
async function cargarPlantilla() {
  const db = new dm.AcDbDatabase();
  const d = readFileSync(plantillaDxf);
  await db.read(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength), {readOnly: true}, dm.AcDbFileType.DXF);
  return {db, config: JSON.parse(readFileSync(plantillaJson, 'utf8'))};
}

test('the sheet template keeps the standard details but none of the reference project data', () => {
  const dxf = readFileSync(plantillaDxf, 'utf8');
  for (const dato of ['ALDO BARDALES', '101402', '2166247', 'MUNICIPALIDAD DISTRITAL', 'MEJORAMIENTO DE LOS SERVICIOS']) assert.ok(!dxf.includes(dato), `template leaks "${dato}"`);
  for (const detalle of ['DETALLE TIPICO ISOM', 'DETALLE DE LA UBICACION Y LONGITUD', 'Zapatas y cimiento corrido']) assert.ok(dxf.includes(detalle), `template lost "${detalle}"`);
  const config = JSON.parse(readFileSync(plantillaJson, 'utf8'));
  assert.deepEqual(config.laminas.map((l) => l.espacios.map((e) => e.id).sort()), [
    ['aligerado', 'cimentacion', 'cimiento', 'cuadroColumnas', 'cuadroColumnetas'],
    ['cuadroColumnas', 'cuadroColumnetas', 'portico1', 'portico2', 'portico3', 'portico4'],
  ]);
  // Rótulo con casillas con nombre y ancho, para llenarlo con los datos de cualquier proyecto.
  for (const l of config.laminas) {
    const campos = Object.fromEntries(l.rotulo.map((r) => [r.campo, r]));
    for (const c of ['proyecto', 'entidad', 'especialista', 'cip', 'region', 'provincia', 'distrito', 'localidad', 'codigoLocal', 'codigoModular', 'plano', 'escala', 'fecha', 'lamina']) assert.ok(campos[c]?.ancho > 0.2, `${l.codigo}: title block lacks field "${c}"`);
    assert.ok(campos.plano.ancho < 1.8 && campos.especialista.ancho < 2.6, 'fields end at their box, not across the next one');
  }
});

test('template texts are clean for the browser viewer: no ambiguous unicode escapes, paragraph codes or misspellings', () => {
  const dxf = readFileSync(plantillaDxf, 'latin1');
  assert.doesNotMatch(dxf, /\\U\+[0-9A-Fa-f]{4}[0-9A-Fa-f]/, '\\U+XXXX followed by a hex digit is misread ("2Ø3/8" showed "2?/8")');
  assert.doesNotMatch(dxf, /\\p[a-z]*[^;\n]*;/, 'MTEXT paragraph codes (\\pxqc;) left "ESCALA:\\P1/25" literal');
  assert.doesNotMatch(dxf, /%%[cC]|∅/, 'diameter must be Ø');
  for (const mal of ['ESPECILISTA', 'DTOS DE LA', 'Refuerso']) assert.ok(!dxf.includes(mal), `typo "${mal}"`);
  for (const bien of ['ESPECIALISTA', 'DATOS DE LA I.E.', '4Ø1/2"', "f´c= 210kg/cm2"]) assert.ok(dxf.includes(bien), `missing "${bien}"`);
  assert.ok(!dxf.includes('@15cm SUPERIOR'), 'steel callouts of the reference platea are not template material');
});

test('with the template, plano_estructuras builds sheets E-01 and E-02 like the reference file, below the architecture frame', {skip: !existsSync(arquitectura)}, async () => {
  const db = await abrir(arquitectura);
  let zoom = null;
  const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: cargarPlantilla, afterDraw: (z) => { zoom = z; }});
  const antes = db.tables.blockTable.modelSpace.newIterator().toArray().length;
  const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({vista: 'primer nivel'}, ctx);
  assert.deepEqual(r.laminas, ['E-01', 'E-02']);
  assert.match(r.mensaje, /de MÓDULO XIV debajo de la arquitectura, con la plantilla del despacho: cimentación con platea/, 'small module -> platea, like the engineer');
  assert.match(r.mensaje, /pórticos de los ejes Z´, Y´, 10, 8 \(techo a dos aguas PTE 33%, alero \+3\.58, cumbrera \+4\.10\)/, 'roof slope from the architecture; ridge like the engineer (+4.12)');
  assert.doesNotMatch(r.mensaje, /piso|Cimentación 2\.0/i);
  const nuevas = db.tables.blockTable.modelSpace.newIterator().toArray().slice(antes);
  // Detalles estándar copiados como bloques propios del dibujo (no referencias externas).
  const insertos = nuevas.filter((e) => e.dxfTypeName === 'INSERT');
  assert.ok(insertos.length > 20 && insertos.every((e) => db.tables.blockTable.has(e.blockName)), 'standard details inserted as blocks of this drawing');
  const textos = nuevas.filter((e) => e.contents).map((e) => e.contents).join(' | ');
  // Estilo del despacho: capas y colores del expediente, no capas propias del agente.
  const capaDe = (re) => nuevas.filter((e) => re.test(e.contents ?? ''));
  assert.ok(capaDe(/^MÓDULO XIV - PLANO DE/).every((e) => e.layer === '.D1 Texto'), 'titles on the office layer .D1 Texto');
  assert.ok(capaDe(/^Cimiento corrido$/).every((e) => e.layer === 'Texto'), 'strip labels on layer Texto');
  assert.ok(capaDe(/^C[123]$/).some((e) => e.layer === 'COTAS & TEXTOS'), 'column tags on COTAS & TEXTOS');
  assert.ok(nuevas.some((e) => e.layer === '49. EJES.' && e instanceof dm.AcDbCircle), 'axis bubbles on 49. EJES.');
  assert.ok(nuevas.some((e) => e.layer === 'viguetas' && e.color?.colorIndex === 2), 'joists in yellow on layer viguetas');
  assert.ok(nuevas.some((e) => e.layer === '0' && e.color?.colorIndex === 5 && e instanceof dm.AcDbPolyline), 'columns outlined in blue on layer 0');
  assert.ok(nuevas.some((e) => e.dxfTypeName === 'HATCH' && e.patternName === 'AR-CONC'), 'concrete hatch in columns');
  assert.ok(nuevas.some((e) => e.dxfTypeName === 'HATCH' && e.layer === '.N1 muros bajos'), 'low walls hatched like the engineer');
  assert.ok(!nuevas.some((e) => /^E-(EJES|COLUMNAS|COTAS|LAMINA|TEXTO|VIGUETAS)$/.test(e.layer)), 'no agent-only layers on the sheets');
  for (const t of ['ZAPATA CORRIDA', 'V(0.25x0.40)', 'SUPERIOR', 'INFERIOR']) assert.ok(textos.includes(t), `missing "${t}"`);
  for (const t of ['MÓDULO XIV - PLANO DE CIMENTACIÓN', 'MÓDULO XIV - PLANO DE CIMIENTO CORRIDO', 'MÓDULO XIV - PLANO DE ALIGERADO', 'PLANO DE PÓRTICO EJE 8-8', 'PLANO DE PÓRTICO EJE Z´-Z´', 'ESC: 1/25', 'CUADRO DE COLUMNAS', 'ESTRUCTURAS', 'E-01', 'E-02']) {
    assert.ok(textos.includes(t), `missing "${t}"`);
  }
  assert.ok(nuevas.some((e) => e.layer === '0' && e.color?.colorIndex === 6), 'platea mesh in magenta, like the engineer');
  assert.equal(nuevas.filter((e) => e.layer === '.D1 cotas' && /^BASE NPN=\+0\.00m$/.test(e.contents ?? '')).length, 4, 'one level set per frame');
  // Detalles con el criterio del expediente (criteriosEstructurales.js).
  const todo = nuevas.map((e) => e.contents ?? '').join(' | ');
  for (const t of ['NFZ=-2.00m', 'Hz = 0.70 m', 'Df = -2.00 m', 'FALSA ZAPATA', 'ALERO 0.60', 'LOSA ALIGERADA E=20CM', 'Cimiento corrido', 'VCUMBRERA', 'Paño 01', 'Paño 02', 'CANALETA', '1Ø3/8"', 'DESPIECE DE', 'ESC: 1/50', 'CUMBRERA NFP=+4.10m', 'TECHO NFP=+3.58m', 'aluzinc TIPO TR4', 'PTE=33%', 'VSa', 'V-3', 'Muro de soga de ladrillo King Kong', "Concreto ciclópeo f'c=100","SC Concreto f'c=140", 'PLATEA (ZAPATA CORRIDA) Hz = 0.70 m',
    '2 □ 3/8"Ø: 1@0.05, 9@0.10, Rto.@0.20 C/E', '□ 3/8"Ø: 1@0.05, 8@0.10, Rto.@0.20 C/E', 'Recubrimiento: 4 cm', '1° Piso']) {
    assert.ok(todo.includes(t), `missing detail "${t}"`);
  }
  assert.ok(nuevas.filter((e) => e.layer === 'CIMIENTO ARMADO' && e instanceof dm.AcDbCircle).length >= 20, 'bars drawn in the column sections');
  assert.ok(nuevas.filter((e) => e.layer === '.D1 Texto 01' && /^p[a-z]$/.test(e.contents ?? '')).length >= 4, 'confinement columns tagged pa, pb…');
  assert.ok(['1', '2', '3'].every((n) => nuevas.some((e) => e.layer === '.D1 Texto 01' && e.contents === n)), 'section marks 1 (exterior wall with door), 2 (exterior), 3 (interior)');
  // Cimiento corrido sobre los muros de la arquitectura; malla de platea; sin vigas de cimentación bajo platea.
  assert.ok(nuevas.filter((e) => e.layer === '0' && e instanceof dm.AcDbPolyline && e.color?.colorIndex === 7).length >= 20, 'strip footing plan follows the architecture walls');
  assert.ok(nuevas.filter((e) => e.layer === '0' && e instanceof dm.AcDbLine && e.color?.colorIndex === 6).length >= 20, 'platea mesh');
  assert.equal(nuevas.filter((e) => /^VC /.test(e.contents ?? '')).length, 0, 'no foundation beams under a platea');
  // Acero en elevación de los pórticos (varillas y estribos con su distribución).
  assert.ok(nuevas.filter((e) => ['.N1 Acero Estribo', '2_Acero EV'].includes(e.layer) && e instanceof dm.AcDbLine).length >= 150, 'steel drawn in the frame elevations');
  assert.equal(r.resumen?.aligerado?.panos ?? 2, 2);
  assert.ok(nuevas.filter((e) => e.layer === 'SGE_TEXTO-CHICOS-03').length >= 6, 'TR4 cover and gutters on the frames');
  // Todo debajo del marco de la arquitectura (y = 1170 en el módulo 14), sin pisar nada.
  assert.ok(zoom && zoom.y1 < 1170 && zoom.y0 > 1100, JSON.stringify(zoom));
  assert.ok(JSON.stringify(r).length < 1500, 'compact tool result');
});

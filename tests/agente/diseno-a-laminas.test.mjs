// Fase 3: del diseño de columnas de Análisis Estructural de vuelta a las láminas del agente.
// Lo que dice el mensaje es lo que dibuja el cuadro, y el .e2k vuelve a llevar ese mismo acero.
import test from 'node:test';
import assert from 'node:assert/strict';
import {patronColumna, armadosMayores, areaColumna} from '../../resources/js/ingenieria/diseno/patronColumna.js';
import {buscarArmado, disenoPorTipo, paqueteParaAgente, tipoDeSeccion, totalDePatron} from '../../resources/js/cad/engine/disenoAgente.js';
import {cuadroColumnas} from '../../resources/js/ingenieria/laminas/cuadroColumnas.js';
import {modeloE2k} from '../../resources/js/ingenieria/analisis/modeloE2k.js';
import {textoDiseno} from '../../resources/js/ingenieria/agente/skills/analisisEstructural.js';
import {rutaDirecta} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';

test('patrón de ETABS: el total coincide con lo que reparte el motor', () => {
  for (const [forma, n] of [[null, 8], [null, 10], [null, 14], ['L', 12], ['T', 20]]) {
    const p = patronColumna({b: 0.5, h: 0.4, forma, n});
    assert.equal(totalDePatron({shape: forma ? forma.toLowerCase() : 'rect', n2: p.n2, n3: p.n3}), p.total, `${forma} ${n}`);
    assert.ok(p.total >= n);
  }
  assert.equal(areaColumna({b: 0.5, h: 0.5, forma: 'L', espesor: 0.25}), 0.1875);
  // 0.30 x 0.30 con 6Ø5/8": siguientes armados de dos en dos hasta 4 % (36 cm²: 18 varillas).
  const mayores = armadosMayores({b: 0.3, h: 0.3, n: 6, areaBarra: 1.979e-4});
  assert.deepEqual(mayores.map((m) => m.total), [8, 10, 12, 14, 16, 18]);
  assert.ok(mayores.every((m) => m.cuantia <= 0.04 + 1e-9));
});

// Resultados del diseño como los deja rcColumnDesign.js (solo los campos que se usan).
const columna = (label, sectionName, ratio, n2, n3, propuesta = null) => ({label, sectionName, geometry: {shape: 'rect', n2, n3}, check: {base: {ratio}, top: {ratio: ratio * 0.8}}, ...(propuesta ? {propuesta} : {})});
const resultados = [
  columna('C1 (Piso1)', 'C1-30X30', 0.42, 3, 2),
  columna('C2 (Piso1)', 'C2-30X50', 1.12, 2, 4, {n: 12, nAntes: 8, ratio: 0.93, ratioAntes: 1.12, cuantia: 0.0158}),
  columna('C2 (Piso2)', 'C2-30X50', 0.7, 2, 4),
  {label: 'PL1 (Piso1)', sectionName: 'PL1-126X170X27', unsupported: true},
];

test('por tipo: el tipo entero lleva el acero que cumple en todas sus columnas', () => {
  assert.equal(tipoDeSeccion('PL1-126X170X27'), 'PL1');
  const t = disenoPorTipo(resultados);
  assert.deepEqual([t.C1.n, t.C1.ratio, t.C1.aumentado, t.C1.cumple], [6, 0.42, false, true]);
  assert.deepEqual([t.C2.n, t.C2.ratio, t.C2.ratioOriginal, t.C2.aumentado, t.C2.columnas], [12, 0.93, 1.12, true, 2]);
  assert.equal(t.PL1.sinDiseno, 1);
  const lineas = textoDiseno(t);
  assert.match(lineas.find((l) => l.startsWith('C2')), /subo a 12Ø5\/8" \(D\/C 1.12 con el mínimo → 0.93\)/);
  assert.match(lineas.find((l) => l.startsWith('C1')), /cumple \(D\/C máx. 0.42\)/);
  const p = paqueteParaAgente({columnas: resultados, revision: {resumen: {texto: 'Lo revisado cumple.', noCumple: 0}, verificaciones: [{grupo: 'Sismo X', titulo: 'Deriva inelástica máxima', valor: 0.0032, estado: 'cumple'}]}});
  assert.deepEqual(p.derivas, [{grupo: 'Sismo X', valor: 0.0032, estado: 'cumple'}]);
});

test('el cuadro dibuja el armado aumentado y conserva el mínimo del que cumplió', () => {
  const rect = (b, h) => [{x: 0, y: 0}, {x: b, y: 0}, {x: b, y: h}, {x: 0, y: h}];
  const cols = [
    {tipo: 'C1', b: 0.3, h: 0.3, x: 0.15, y: 0.15, area: 0.09, forma: 'rectangular', contorno: rect(0.3, 0.3)},
    {tipo: 'C2', b: 0.3, h: 0.5, x: 0.15, y: 0.25, area: 0.15, forma: 'rectangular', contorno: rect(0.3, 0.5)},
  ];
  const sin = cuadroColumnas(cols);
  const con = cuadroColumnas(cols, {diseno: disenoPorTipo(resultados)});
  const fila = (r, tipo) => r.filas.find((f) => f.tipo === tipo);
  assert.equal(fila(sin, 'C2').refuerzo, '8Ø5/8"');
  assert.equal(fila(con, 'C2').refuerzo, '12Ø5/8"');
  assert.equal(fila(con, 'C2').varillas, 12, 'el dibujo tiene las varillas que dice el texto');
  assert.deepEqual(fila(con, 'C2').verificado, {ratio: 0.93, ratioOriginal: 1.12, aumentado: true, cumple: true, minimo: '8Ø5/8"'});
  assert.equal(fila(con, 'C1').refuerzo, fila(sin, 'C1').refuerzo);
  assert.equal(fila(con, 'C1').verificado.aumentado, false);
  const textos = con.contenido.primitivas.filter((p) => p.type === 'text').map((p) => p.value);
  assert.ok(textos.includes('12Ø5/8"'));
});

test('el .e2k vuelve a llevar el acero que dibuja el cuadro', () => {
  const col = (x, y, tipo, b, h) => ({nodo: {x, y}, x, y, b, h, tipo});
  const estructura = {escala: 1, columnas: [col(0, 0, 'C2', 0.3, 0.5), col(4, 0, 'C2', 0.3, 0.5), col(0, 4, 'C1', 0.3, 0.3), col(4, 4, 'C1', 0.3, 0.3)],
    ejesNombrados: [{nombre: 'A', p: {x: 0, y: -1}, q: {x: 0, y: 5}}, {nombre: 'B', p: {x: 4, y: -1}, q: {x: 4, y: 5}}, {nombre: '1', p: {x: -1, y: 0}, q: {x: 5, y: 0}}, {nombre: '2', p: {x: -1, y: 4}, q: {x: 5, y: 4}}]};
  const modelo = {niveles: 1, techo: 3, losaTecho: true, losa: {espesor: 0.2}, refuerzoColumnas: [{tipo: 'C1', refuerzo: '6Ø5/8"'}, {tipo: 'C2', refuerzo: '12Ø5/8"'}]};
  const g = modeloE2k({estructura, modelo, datos: {zona: '3', suelo: 'S2', categoria: 'A2'}, nombre: 'prueba'});
  assert.equal(g.resumen.armadoColumnas['C2-30X50'].n, 12);
  assert.equal(g.resumen.armadoColumnas['C1-30X30'].n, 6);
  assert.match(g.texto, /CONCRETESECTION {2}"C2-30X50".*PATTERN "R-3-5"/);
});

test('«aplica el diseño» va a la herramienta y sin diseño enviado lo dice', async () => {
  assert.deepEqual(rutaDirecta('aplica el diseño del análisis'), {tool: 'aplicar_diseno', args: {}});
  assert.deepEqual(rutaDirecta('trae el diseño'), {tool: 'aplicar_diseno', args: {}});
  const skill = SKILLS.find((s) => s.name === 'aplicar_diseno');
  const r = await skill.run({}, {memoria: {}});
  assert.equal(r.ok, false);
  assert.match(r.error, /Enviar diseño al agente/);
});

test('búsqueda del armado: pocas llamadas al motor y el menor que cumple', async () => {
  const opciones = [8, 10, 12, 14, 16, 18].map((total) => ({total}));
  // Ratio inversamente proporcional al acero (6 varillas → 1.5).
  const evaluar = async (o) => (6 * 1.5) / o.total;
  const r = await buscarArmado(opciones, evaluar, {nAntes: 6, ratioAntes: 1.5});
  assert.equal(r.opcion.total, 10);           // 9/10 = 0.90 cumple; 9/8 = 1.12 no
  assert.ok(r.llamadas <= 2);
  // El motor pide más de lo proporcional: sube hasta cumplir.
  const duro = await buscarArmado(opciones, async (o) => 14 / o.total, {nAntes: 6, ratioAntes: 1.5});
  assert.equal(duro.opcion.total, 14);
  const imposible = await buscarArmado(opciones, async () => 2, {nAntes: 6, ratioAntes: 2});
  assert.deepEqual([imposible.opcion, imposible.mayor.total], [null, 18]);
});

test('zapatas con las reacciones del análisis y el qadm del EMS', async () => {
  const {asignarReacciones} = await import('../../resources/js/ingenieria/planos/cimentacionPlano.js');
  const {predimensionarZapatas} = await import('../../resources/js/ingenieria/diseno/estructura.js');
  const {datosParaLaminas} = await import('../../resources/js/ingenieria/criterios/datosProyecto.js');
  // Columnas de la lectura (otro origen) y reacciones del modelo (.e2k): se alinean por el centroide.
  const cols = [{x: 10, y: 20, b: 0.3, h: 0.3, at: 9}, {x: 14, y: 20, b: 0.3, h: 0.3, at: 9}, {x: 10, y: 24, b: 0.3, h: 0.3, at: 9}];
  const reac = [{x: 0, y: 0, pd: 20, pl: 5, ps: 4}, {x: 4.05, y: 0, pd: 10, pl: 2, ps: 0}, {x: 0, y: 4, pd: 12, pl: 3, ps: 10}];
  const {columnas, emparejadas} = asignarReacciones(cols, reac);
  assert.equal(emparejadas, 3);
  assert.deepEqual(columnas[0].reaccion, {pd: 20, pl: 5, ps: 4});
  // qadm 1.0 kg/cm² del EMS → 10 t/m².
  const dp = datosParaLaminas({qadm: '1.00'});
  assert.equal(dp.cimentacion.qadm, 10);
  assert.equal(dp.qadmDelEms, true);
  const {zapatas} = predimensionarZapatas(columnas, {qadm: dp.cimentacion.qadm});
  // C1: 1.1·25/10 = 2.75 m² → 1.70 x 1.70 (la del sismo, 1.1·28.2/13 = 2.39, no gobierna).
  assert.deepEqual([zapatas[0].B, zapatas[0].fuente, zapatas[0].ps], [1.7, 'análisis', 4]);
  // C3: con sismo gobierna 1.1·(15 + 8)/13 = 1.95 > 1.1·15/10 = 1.65 → 1.40 x 1.40.
  assert.equal(zapatas[2].B, 1.4);
  // Sin reacción: área tributaria como antes.
  assert.equal(predimensionarZapatas([cols[0]], {qadm: 10}).zapatas[0].fuente, undefined);
});

test('buscar armado: sin solución en una llamada y con bisección cuando hay que subir mucho', async () => {
  const opciones = Array.from({length: 30}, (_, k) => ({total: 8 + 2 * k}));
  const imposible = await buscarArmado(opciones, async () => 3.46, {nAntes: 6, ratioAntes: 3.46});
  assert.equal(imposible.opcion, null);
  assert.equal(imposible.llamadas, 2);              // la propuesta y el mayor
  const duro = await buscarArmado(opciones, async (o) => 60 / o.total, {nAntes: 6, ratioAntes: 1.5});
  assert.equal(duro.opcion.total, 60);              // el menor que cumple
  assert.ok(duro.llamadas <= 8, `llamadas ${duro.llamadas}`);
});

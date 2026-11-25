import test from 'node:test';
import assert from 'node:assert/strict';
import {numeroModulo, referenciaDelDocumento, vistasDelModulo, formatoDeReferencia, memoriaParaModulo} from '../../resources/js/ingenieria/agente/referenciasProyecto.js';
import {componerPaqueteLaminas} from '../../resources/js/ingenieria/laminas/componerPaquete.js';
import {crearSesionDeDocumento, vincularDocumento} from '../../resources/js/etabs/agente/sesionDocumento.js';
import {estadoDeSesion} from '../../resources/js/ingenieria/agente/estadoAgente.js';
import {proyectoDesdeArquitectura, marcoDeVista} from '../../resources/js/ingenieria/laminas/laminasPlantilla.js';

test('current document selects its own reference, including Roman module numbers', () => {
  for (const [numero, romano, hojas] of [[1, 'I', 7], [2, 'II', 7], [7, 'VII', 6], [14, 'XIV', 2], [15, 'XV', 4]]) {
    const r = referenciaDelDocumento(`VINCHOS - MODULO ${romano} - ARQUITECTURA.dwg`);
    assert.equal(r.modulo, numero);
    assert.equal(r.referencia.id, `modulo-${String(numero).padStart(2, '0')}`);
    assert.equal(r.referencia.laminas.length, hojas);
    assert.equal(r.referencia.formato, null, 'missing paper metadata must not be invented');
    assert.equal(r.referencia.cargas, null, 'loads must not be borrowed from an example');
  }
});

test('a module number shared by different projects does not silently select one', () => {
  const r = referenciaDelDocumento('MODULO II.dwg');
  assert.equal(r.referencia, null);
  assert.equal(r.candidatos.length, 2);
  assert.equal(referenciaDelDocumento('ILO - MODULO II.dwg').referencia.grupo, 'ilo');
  assert.equal(referenciaDelDocumento('Proyecto nuevo.dwg').referencia, null);
});

test('selected module title wins over a larger title belonging to module XV', () => {
  const items = [{tipo: 'texto', texto: 'MODULO XV', alto: 20, capa: 'TEXT', centro: {x: 500, y: 500}}];
  assert.equal(proyectoDesdeArquitectura(items, 'MODULO II - PRIMER NIVEL'), 'MÓDULO II');
});

test('sheet frame is local to the current view, rather than the largest global rectangle', () => {
  const rect = (x, y, w, h) => ({tipo: 'poli', puntos: [{x, y}, {x: x + w, y}, {x: x + w, y: y + h}, {x, y: y + h}]});
  const marco = marcoDeVista([rect(-100, -100, 400, 400), rect(0, 0, 42, 30)], {x0: 5, y0: 5, x1: 30, y1: 20});
  assert.deepEqual([marco.x0, marco.y0, marco.x1, marco.y1], [0, 0, 42, 30]);
});

const contenido = (titulo, w = 20, h = 16) => ({titulo, marco: {x0: 0, y0: 0, x1: w, y1: h}, primitivas: []});
// El compositor recibe cajas medidas; el marco del contenido no sustituye esa entrada.
const medido = (id, titulo = id) => ({id, tipo: 'cimentacion', contenido: contenido(titulo), caja: {x0: 0, y0: 0, x1: 20, y1: 16}});
test('sheet count grows with actual content and preserves every plan without empty copies', () => {
  const small = componerPaqueteLaminas({contenidos: [medido('cimentacion', 'CIMENTACION')], marco: {x0: 0, y0: 0, x1: 42, y1: 30}});
  const plans = Array.from({length: 9}, (_, i) => medido('plano' + i, 'PLANO ' + i));
  const large = componerPaqueteLaminas({contenidos: plans, marco: {x0: 0, y0: 0, x1: 42, y1: 30}});
  assert.equal(small.hojas.length, 1);
  assert.ok(large.hojas.length > small.hojas.length);
  assert.equal(large.hojas.flatMap((h) => h.lamina.espacios).length, 9);
  assert.ok(large.hojas.every((h) => h.lamina.espacios.length > 0));
  for (const h of large.hojas) for (const slot of h.lamina.espacios) {
    assert.ok(slot.caja.x >= h.lamina.marco.x && slot.caja.x1 <= h.lamina.marco.x1);
    assert.ok(slot.caja.y > h.lamina.marco.y + 4 && slot.caja.y1 <= h.lamina.marco.y1);
  }
});

test('different source formats remain different; no shared reference frame is imposed', () => {
  const contenidos = [medido('base', 'BASE')];
  const wide = componerPaqueteLaminas({contenidos, marco: {x0: 0, y0: 0, x1: 60, y1: 30}});
  const tall = componerPaqueteLaminas({contenidos, marco: {x0: 0, y0: 0, x1: 30, y1: 60}});
  assert.deepEqual([wide.hojas[0].lamina.marco.x1, wide.hojas[0].lamina.marco.y1], [60, 30]);
  assert.deepEqual([tall.hojas[0].lamina.marco.x1, tall.hojas[0].lamina.marco.y1], [30, 60]);
});

test('different documents with the same filename still invalidate the old module session', () => {
  const session = crearSesionDeDocumento();
  const a = {fileName: 'arquitectura.dwg', database: {}};
  assert.equal(session.cambiar(a), true);
  assert.equal(session.cambiar(a), false);
  assert.equal(session.cambiar({fileName: 'arquitectura.dwg', database: {}}), true);
  assert.equal(session.cambiar(null), true);
});

test('an old CAD context cannot read or write the newly opened document', () => {
  let actual = {fileName: 'arquitectura.dwg', database: {}};
  const bound = vincularDocumento(actual, () => actual);
  assert.equal(bound(), actual.database);
  actual = {fileName: 'arquitectura.dwg', database: {}};
  assert.throws(bound, /documento cambió/);
});

test('module-specific views exclude a cistern view from another module', () => {
  const vistas = [{titulo: 'MODULO II PRIMER NIVEL'}, {titulo: 'MODULO II SEGUNDO NIVEL'}, {titulo: 'MODULO XV CISTERNA'}];
  assert.equal(vistasDelModulo(vistas, 'MODULO II').length, 2);
  assert.equal(vistasDelModulo(vistas, 'MODULO XV').length, 1);
  assert.equal(vistasDelModulo(vistas, 'MODULO VII').length, 0);
  assert.equal(vistasDelModulo([{titulo: 'PISO DE CEMENTO'}, {titulo: 'TECHO MODULO XV'}], 'MODULO XV').length, 2);
  assert.equal(numeroModulo('MODULO lV'), 4);
  assert.equal(numeroModulo('MODULO lX'), 9);
  assert.equal(numeroModulo('MODULO LV'), 55);
});

test('session separates historical inventory from the current generated package', () => {
  const ref = referenciaDelDocumento('VINCHOS MODULO XV.dwg', undefined, 'MODULO II PRIMER NIVEL');
  const text = estadoDeSesion({referenciaActual: () => ref, memoria: {paqueteLaminas: {cantidad: 3, codigos: ['E-01','E-02','E-03'], origen: 'plano actual'}}});
  assert.match(text, /Identidad actual: módulo 2/);
  assert.match(text, /7 láminas inventariadas/);
  assert.match(text, /realmente generado: 3 láminas/);
});

test('module VI and XV keep their different observed drawing frames', () => {
  const vi = formatoDeReferencia(referenciaDelDocumento('VINCHOS MODULO VI.dwg').referencia);
  const xv = formatoDeReferencia(referenciaDelDocumento('VINCHOS MODULO XV.dwg').referencia);
  assert.deepEqual([vi.x1, vi.y1], [29.2, 20.5]);
  assert.deepEqual([xv.x1, xv.y1], [58.4, 41]);
  assert.equal(formatoDeReferencia(null), null);
});

test('switching modules inside one drawing does not reuse the previous quantities or decisions', () => {
  const old = {moduloActivo: 15, ultimoPedido: 'Revisa el modulo II', modeloEstructural: {proyecto: 'MODULO XV'}, metrado: {total: 99}, consultas: {}, respuestasFormulario: {cimentacion: 'platea'}};
  const current = memoriaParaModulo(old, 'MODULO II');
  assert.equal(current.moduloActivo, 2);
  assert.equal(current.ultimoPedido, old.ultimoPedido);
  assert.equal(current.modeloEstructural, undefined);
  assert.equal(current.metrado, undefined);
  assert.equal(current.respuestasFormulario, undefined);
});

test('adaptive generation checks every available module without copying another template', async (t) => {
  const {PLANOS} = await import('../../scripts/agente/planos.mjs');
  const {join, basename} = await import('node:path');
  const {readFileSync, existsSync} = await import('node:fs');
  const manifest = join(PLANOS, 'estructuras', 'pares.json');
  if (!existsSync(manifest)) return t.skip('sin inventarios CAD locales');
  const {paresDelManifiesto} = await import('../../scripts/agente/pares-entrenamiento.mjs');
  const {leerCache} = await import('../../scripts/agente/volcar-planos.mjs');
  const {detectarVistas} = await import('../../resources/js/ingenieria/lectura/lectorPlano.js');
  const {SKILLS} = await import('../../resources/js/ingenieria/agente/skills/index.js');
  const {CASOS} = await import('../../resources/js/ingenieria/aprendizaje/casosAprendidos.js');
  const pairs = paresDelManifiesto(join(PLANOS, 'estructuras'), JSON.parse(readFileSync(manifest)), existsSync);
  const resultados = [];
  for (const pair of pairs) {
    const id = pair.id;
    const cache = leerCache(pair.rutaArquitectura);
    if (!cache) return t.skip('faltan inventarios de arquitectura');
    const vistas = detectarVistas(cache.items);
    const caso = CASOS.find((c) => c.grupo === pair.grupo && c.id === id);
    // Proyectos nuevos (hold-out, p. ej. edificio9) todavía no tienen caso aprendido: esta prueba
    // comprueba la generación de los módulos con caso conocido; los nuevos se miden aparte.
    if (!caso) continue;
    const datos = {hz: 0.7, df: 2, zona: 3, suelo: 'S2', categoria: 'A2', niveles: caso.rasgos.niveles};
    let primitivas = [];
    const ctx = {memoria: {}, nombreDocumento: () => `${pair.grupo} ${basename(pair.rutaArquitectura)}`, readPlan: () => ({items: cache.items, vistas}),
      datosProyecto: () => datos, eventosDeUso: async () => [], loadTemplate: async () => ({db: null, config: {modo: 'adaptativa', escalaPlanos: 1}}),
      draw: (p) => { primitivas.push(...p); return {entidades: p.length}; }, insertTemplate: () => assert.fail('no copiar una plantilla de otro módulo')};
    ctx.referenciaActual = () => referenciaDelDocumento(ctx.nombreDocumento(), undefined, ctx.memoria.estructura?.titulo);
    if (pair.grupo === 'ilo' && id === 'modulo-11') {
      await assert.rejects(SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx), /columnas verificables/);
      assert.equal(primitivas.length, 0, 'open area must not borrow columns from another module');
      resultados.push({id, grupo: pair.grupo, pendiente: 'confirmar estructura del área abierta'});
      continue;
    }
    const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx);
    assert.equal(r.ok, true);
    assert.ok(primitivas.length > 100);
    for (const p of primitivas) for (const point of [p.at, p.a, p.b, p.c, ...(p.points ?? [])].filter(Boolean)) assert.ok(point.every(Number.isFinite));
    assert.equal(r.laminas.length, ctx.memoria.paqueteLaminas.cantidad);
    assert.equal(ctx.referenciaActual().referencia.id, id);
    assert.match(ctx.memoria.paqueteLaminas.origen, /plano actual/);
    if (id !== 'modulo-15') assert.doesNotMatch(ctx.memoria.modeloEstructural.proyecto, /\bXV\b/);
    resultados.push({id, grupo: pair.grupo, hojas: r.laminas.length, columnas: ctx.memoria.modeloEstructural.columnas.length, formato: ctx.memoria.paqueteLaminas.formato});
  }
  assert.ok(new Set(resultados.filter((r) => r.formato).map((r) => r.formato.ancho)).size > 1);
  assert.ok(new Set(resultados.map((r) => r.hojas)).size > 1);
  assert.ok(new Set(resultados.map((r) => r.columnas)).size > 1);
  t.diagnostic(JSON.stringify(resultados));
});

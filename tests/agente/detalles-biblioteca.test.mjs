// Fase 2d: cortes de cimiento corrido, escalera y cuadros adaptados desde la biblioteca de
// detalles del despacho (resources/js/ingenieria/laminas/detalleBiblioteca.js) y su medición
// (scripts/agente/evaluar-detalles.mjs). Las piezas reales son privadas: esas pruebas se saltan si
// la biblioteca no está en esta máquina; el resto usa piezas sintéticas.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {
  analizarCorte, elegirCorte, adaptarCorte, analizarEscalera, elegirEscalera, adaptarEscalera,
  rejillaCuadro, adaptarCuadro, elegirCuadro, entidadesDe, detalleDesdeBiblioteca,
} from '../../resources/js/ingenieria/laminas/detalleBiblioteca.js';
import {cuadroColumnetas} from '../../resources/js/ingenieria/laminas/cuadroColumnas.js';
import {predimensionarEscalera} from '../../resources/js/ingenieria/planos/escaleraPlano.js';
import {comparar, muestrear, puntosDePieza} from '../../scripts/agente/evaluar-detalles.mjs';
import {plano} from '../../scripts/agente/planos.mjs';

const BIB = plano('biblioteca');
const linea = (capa, a, b) => ({tipo: 'linea', capa, puntos: [{x: a[0], y: a[1]}, {x: b[0], y: b[1]}]});
const poli = (capa, pts, cerrada = false) => ({tipo: 'poli', capa, puntos: pts.map(([x, y]) => ({x, y})), ...(cerrada ? {cerrada} : {})});
const texto = (capa, x, y, t, alto = 0.08) => ({tipo: 'texto', capa, centro: {x, y}, texto: t, alto});
const textos = (prims) => prims.filter((p) => p.type === 'text').map((p) => p.value);
const verticales = (prims, capa) => prims.filter((p) => p.type === 'line' && p.layer === capa && Math.abs(p.a[0] - p.b[0]) < 1e-6).map((p) => p.a[0]);

// Corte de muro interior: cimiento 0.40 x 0.80 (x 1.0–1.4) con N.F.C. −0.80, sobrecimiento y muro.
function corteSintetico({interior = true, proyecto = 'p-otro', modulo = 'modulo-02'} = {}) {
  const C = '.N1 Cimiento Corrido';
  return {
    tipo: 'corte_cimiento', proyecto, modulo, titulo: 'CORTE 3-3', archivo: `${proyecto}-${modulo}-1.json`,
    niveles: [{sigla: 'NFC', cota: -0.8, y: -0.8}, {sigla: 'NTN', cota: 0, y: 0}, {sigla: 'NPT', cota: 0.15, y: 0.15}],
    entidades: [
      linea(C, [0, -0.8], [2.4, -0.8]),                       // fondo
      linea(C, [1.0, -0.8], [1.0, 0]), linea(C, [1.4, -0.8], [1.4, 0]), linea(C, [1.0, 0], [1.4, 0]), // cuerpo y tapa
      linea('muro', [1.075, 0], [1.075, 2.0]), linea('muro', [1.325, 0], [1.325, 2.0]),         // muro
      linea('CONCRETO', [0.2, 0.15], [1.0, 0.15]), linea('CONCRETO', [1.4, 0.15], [2.2, 0.15]),         // pisos
      linea('.D1 cotas', [1.0, -1.0], [1.4, -1.0]), texto('.D1 cotas', 1.2, -0.95, '.40'),
      texto('.D1 Texto', 2.0, -0.7, 'N.F.C. = -0.80m'), texto('.D1 Texto', 0.5, 0.3, 'N.P.T. = +0.15m'),
      ...(interior ? [texto('.D1 Texto', 0.5, 0.6, 'INTERIOR'), texto('.D1 Texto', 1.9, 0.6, 'INTERIOR')] : [texto('.D1 Texto', 0.5, 0.6, 'INTERIOR')]),
      texto('.D1 Texto', 1.2, -1.4, 'CORTE 3-3', 0.2),
    ],
  };
}

test('a foundation cut is widened and deepened to the destination, with its levels rewritten', () => {
  const pieza = corteSintetico();
  const a = analizarCorte(pieza);
  assert.ok(a, 'el cuerpo del cimiento se mide');
  assert.equal(Math.round(a.ancho * 100), 40);
  assert.equal(Math.round(a.peralte * 100), 80);
  assert.equal(a.interior, true);
  const {contenido, reemplazos} = adaptarCorte(pieza, {numero: 2, interior: true, ancho: 0.6, peralte: 1.0, cotaFondo: -1.0, npt: 0.15});
  const xs = verticales(contenido.primitivas, '.N1 Cimiento Corrido').sort((p, q) => p - q);
  assert.deepEqual(xs.map((x) => Math.round(x * 100)), [90, 150], 'el cuerpo se ensancha a 0.60 por igual a ambos lados');
  const fondo = contenido.primitivas.find((p) => p.type === 'line' && p.layer === '.N1 Cimiento Corrido' && Math.abs(p.a[1] - p.b[1]) < 1e-6 && p.b[0] - p.a[0] > 2);
  assert.equal(Math.round(fondo.a[1] * 100), -100, 'el fondo baja a −1.00 (N.F.C. del destino)');
  // El muro (encima de la tapa) no se mueve; la tapa queda en 0.00 (−1.00 + 1.00).
  assert.deepEqual(verticales(contenido.primitivas, 'muro').map((x) => Math.round(x * 1000)), [1075, 1325]);
  const t = textos(contenido.primitivas);
  assert.ok(t.includes('N.F.C. = -1.00m'));
  assert.ok(t.includes('CORTE 2-2'));
  assert.ok(t.includes('.60'), 'la cota del ancho se recalcula');
  assert.ok(reemplazos.niveles >= 1 && reemplazos.cotas === 1);
});

test('the cut chosen is of the same kind (interior/exterior) and never from the excluded project', () => {
  const interior = corteSintetico({interior: true, proyecto: 'p-a'});
  const exterior = corteSintetico({interior: false, proyecto: 'p-b'});
  const d = {numero: 1, interior: false, ancho: 0.4, peralte: 0.8, cotaFondo: -0.8};
  assert.equal(elegirCorte(d, [interior, exterior])?.pieza, exterior);
  assert.equal(elegirCorte(d, [interior, exterior], {excluir: {proyecto: 'p-b'}}), null);
  assert.equal(elegirCorte({...d, interior: true}, [interior, exterior])?.pieza, interior);
  // Excluir el módulo deja usar las piezas de otros módulos del mismo proyecto.
  assert.equal(elegirCorte({...d, interior: true}, [interior], {excluir: {proyecto: 'p-a', modulo: 'modulo-09'}})?.pieza, interior);
});

// Tramo de 6 contrapasos de 0.175 y pasos de 0.30 subiendo a la derecha, descanso de 1.00.
function escaleraSintetica() {
  const pts = [[0, 0]];
  let x = 0, y = 0;
  for (let i = 0; i < 6; i++) { y += 0.175; pts.push([x, y]); if (i < 5) { x += 0.3; pts.push([x, y]); } }
  pts.push([x + 1.0, y]);
  return {
    tipo: 'escalera', proyecto: 'p-otro', modulo: 'modulo-03', titulo: 'DETALLE DE ESCALERA TRAMO 01', archivo: 'p-otro-modulo-03-1.json',
    niveles: [],
    entidades: [
      poli('0', pts),
      linea('0', [0.1, -0.2], [x, y - 0.2]), linea('0', [x, y - 0.2], [x + 1.0, y - 0.2]), // garganta y descanso
      poli('0', [[-0.3, -0.2], [0.3, -0.2], [0.3, -0.7], [-0.3, -0.7]], true),            // apoyo
      texto('.D1 Texto', 1.0, -1.2, 'DETALLE DE ESCALERA TRAMO 01', 0.2),
      texto('.D1 Texto', 0.6, 1.3, 'P = 0.30  C.P. = 0.175'),
    ],
  };
}

test('a stair keeps the despacho drawing but takes the destination steps, riser, tread and landing', () => {
  const pieza = escaleraSintetica();
  const a = analizarEscalera(pieza);
  assert.equal(a.n, 6);
  assert.equal(Math.round(a.descanso * 100), 100);
  const destino = {porTramo: 9, paso: 0.28, cp: 0.17, cpExacto: 0.17, nombre: 'TRAMO II', descanso: 1.2};
  const {contenido} = adaptarEscalera(pieza, destino);
  const rampa = contenido.primitivas.filter((p) => p.type === 'pline').map((p) => p.points).find((pts) => pts.length > 10);
  assert.ok(rampa, 'la rampa se rehace');
  const segs = rampa.slice(1).map((q, i) => [q[0] - rampa[i][0], q[1] - rampa[i][1]]);
  const cps = segs.filter(([dx, dy]) => Math.abs(dx) < 1e-6 && dy > 0), ps = segs.filter(([dx, dy]) => Math.abs(dy) < 1e-6 && dx > 0);
  assert.equal(cps.length, 9);
  assert.equal(ps.length, 8);
  assert.ok(cps.every(([, dy]) => Math.abs(dy - 0.17) < 1e-3) && ps.every(([dx]) => Math.abs(dx - 0.28) < 1e-3));
  // El descanso (horizontal que sigue al último contrapaso) mide 1.20.
  const descanso = contenido.primitivas.find((p) => p.type === 'line' && Math.abs(p.a[1] - p.b[1]) < 1e-6 && Math.abs(p.b[0] - p.a[0] - 1.2) < 1e-3);
  assert.ok(descanso, 'el descanso toma el largo del destino');
  const t = textos(contenido.primitivas);
  assert.ok(t.includes('DETALLE DE ESCALERA TRAMO II'));
  assert.ok(t.some((x) => /P = 0\.28/.test(x) && /C\.P\. = 0\.170/.test(x)));
  // Elegible y adaptable desde la entrada única.
  assert.ok(elegirEscalera(destino, [pieza]));
  assert.ok(detalleDesdeBiblioteca('escalera', destino, [pieza])?.biblioteca.pieza);
});

// Cuadro del despacho: rótulos (x 0–2), dos columnas C1 y C2 de 3 de ancho, filas de título,
// códigos, secciones y refuerzo.
function cuadroSintetico() {
  const G = 'CUADRO';
  const W = 8, H = 6;
  return {
    tipo: 'cuadro_columnetas', proyecto: 'p-otro', modulo: 'modulo-05', titulo: 'CUADRO DE COLUMNETAS', archivo: 'p-otro-modulo-05-1.json', dibujo: {factor: 1},
    entidades: [
      poli(G, [[0, 0], [W, 0], [W, H], [0, H]], true),
      linea(G, [0, 5], [W, 5]), linea(G, [2, 4.3], [W, 4.3]), linea(G, [0, 1.5], [W, 1.5]),
      linea(G, [2, 0], [2, 5]), linea(G, [5, 0], [5, 5]),
      texto(G, 4, 5.5, 'CUADRO DE COLUMNAS', 0.3), texto(G, 1, 5.5, 'ESCALA 1/25', 0.15),
      texto(G, 1, 4.6, 'NIVEL', 0.15), texto(G, 1, 3.5, '1° Piso', 0.15), texto(G, 1, 2.5, '210', 0.2), texto(G, 1, 0.7, 'Refuerzo', 0.15),
      texto(G, 3.5, 4.65, 'C1', 0.3), texto(G, 6.5, 4.65, 'C2', 0.3),
      poli('COLUMNAS', [[3.2, 2.5], [3.8, 2.5], [3.8, 3.3], [3.2, 3.3]], true), poli('COLUMNAS', [[6.2, 2.5], [6.8, 2.5], [6.8, 3.3], [6.2, 3.3]], true),
      {tipo: 'circulo', capa: 'ACERO', centro: {x: 3.3, y: 2.6}, radio: 0.03},
      texto(G, 3.5, 0.7, '4Ø5/8" 1@0.05, Rto.@0.20', 0.1), texto(G, 6.5, 0.7, '6Ø5/8" 1@0.05, Rto.@0.20', 0.1),
    ],
  };
}

test('a schedule keeps the despacho grid with one column per destination type and none of the origin values', () => {
  const pieza = cuadroSintetico();
  const rej = rejillaCuadro(pieza.entidades);
  assert.deepEqual(rej.columnas.map((c) => c.codigo), ['C1', 'C2']);
  assert.equal(rej.borde, 2);
  assert.deepEqual(rej.bandas.map((b) => b.papel), ['titulo', 'codigo', 'seccion', 'refuerzo']);
  const gen = cuadroColumnetas([{codigo: 'pa', b: 0.13, h: 0.25}, {codigo: 'pb', b: 0.13, h: 0.4}, {codigo: 'pc', b: 0.15, h: 0.3}]);
  const {contenido, tipos} = adaptarCuadro(pieza, {generado: gen.contenido.primitivas, niveles: 2});
  assert.equal(tipos, 3);
  assert.equal(Math.round(contenido.marco.x1 * 100), 1100, 'rótulos (2) + 3 columnas de 3');
  const t = textos(contenido.primitivas);
  for (const c of ['pa', 'pb', 'pc']) assert.ok(t.includes(c));
  assert.ok(!t.includes('C1') && !t.includes('C2'), 'sin los códigos del origen');
  assert.ok(!t.some((x) => /4Ø5\/8|6Ø5\/8/.test(x)), 'sin el refuerzo del origen');
  assert.ok(!t.includes('210') && t.includes('175'), "f'c del destino (columnetas)");
  assert.ok(t.includes('1° Piso') && t.includes('2° Piso'), 'un renglón por nivel del destino');
  assert.ok(t.includes('CUADRO DE COLUMNETAS'));
  assert.ok(t.includes('NIVEL') && t.includes('Refuerzo'), 'los rótulos del despacho se conservan');
  // Ninguna sección del origen: solo las del generador (capa de columnas del agente).
  assert.ok(!contenido.primitivas.some((p) => p.layer === 'COLUMNAS'));
  assert.ok(elegirCuadro({tipo: 'cuadro_columnetas', generado: gen.contenido.primitivas}, [pieza]));
});

test('the comparison finds the offset and scores identical drawings at 100 % and unrelated ones low', () => {
  const ents = corteSintetico().entidades;
  const a = muestrear(ents, 'corte_cimiento');
  const movido = a.map((p) => ({x: p.x + 0.3, y: p.y - 0.15}));
  const r = comparar(movido, a);
  assert.ok(r.f1 > 0.99, `F1 ${r.f1}`);
  const otro = muestrear(escaleraSintetica().entidades, 'escalera');
  assert.ok(comparar(otro, a).f1 < 0.5);
  // En los cuadros cuenta la rejilla (capa de cuadro); en los cortes no las capas de texto o cotas.
  assert.ok(muestrear(cuadroSintetico().entidades, 'cuadro_columnetas').length > muestrear(cuadroSintetico().entidades, 'corte_cimiento').length);
});

test('without a library (or without a similar piece) nothing is adapted', () => {
  assert.equal(detalleDesdeBiblioteca('corte_cimiento', {numero: 1, interior: false, ancho: 0.4, peralte: 0.8}, []), null);
  assert.equal(detalleDesdeBiblioteca('corte_cimiento', {numero: 1, interior: false, ancho: 0.4, peralte: 0.8}, [corteSintetico({interior: true})]), null);
  assert.equal(detalleDesdeBiblioteca('escalera', {porTramo: 9, paso: 0.28, cp: 0.17}, {piezas: [escaleraSintetica()], excluir: {proyecto: 'p-otro'}}), null);
});

const leerTipo = (t) => (existsSync(join(BIB, t)) ? readdirSync(join(BIB, t)).filter((f) => f.endsWith('.json')).map((f) => ({...JSON.parse(readFileSync(join(BIB, t, f), 'utf8')), archivo: f})) : []);

test('real engineer cuts, stairs and schedules adapt without losing their drawing', {skip: !existsSync(join(BIB, 'corte_cimiento')) && 'biblioteca privada no disponible'}, () => {
  // Cortes: cada uno medible se adapta a sí mismo sin moverse y a un cimiento de 0.60 x 1.00.
  const cortes = leerTipo('corte_cimiento').filter((p) => analizarCorte(p));
  assert.ok(cortes.length >= 5, `cortes medibles: ${cortes.length}`);
  for (const p of cortes) {
    const a = analizarCorte(p);
    const igual = adaptarCorte(p, {numero: 1, ancho: a.ancho, peralte: a.peralte, cotaFondo: a.cotaFondo});
    const r = comparar(muestrear(entidadesDe(igual.contenido.primitivas), 'corte_cimiento'), puntosDePieza(p));
    assert.ok(r.f1 > 0.97, `${p.archivo}: adaptado a sí mismo ${r.f1}`);
    const otro = adaptarCorte(p, {numero: 1, ancho: 0.6, peralte: 1.0, cotaFondo: -1.0});
    assert.ok(textos(otro.contenido.primitivas).some((t) => /N\.?F\.?C.*-1[.,]00/.test(t)), `${p.archivo}: N.F.C. reescrito`);
  }
  // Escaleras: las de un tramo se rehacen con los peldaños del destino.
  const escaleras = leerTipo('escalera').filter((p) => analizarEscalera(p));
  assert.ok(escaleras.length >= 3);
  const dim = predimensionarEscalera({tramos: [{peldanos: 8, huella: 0.28, ancho: 1.2}]}, 2.8);
  for (const p of escaleras) {
    const {contenido, reemplazos} = adaptarEscalera(p, {...dim, nombre: 'TRAMO I'});
    assert.equal(reemplazos.peldanos, dim.porTramo, p.archivo);
    assert.ok(contenido.primitivas.length > 10);
  }
  // Cuadros: toda rejilla legible se llena con las columnetas del destino, sin sus códigos.
  const gen = cuadroColumnetas([{codigo: 'pa', b: 0.13, h: 0.25}, {codigo: 'pb', b: 0.13, h: 0.4}]);
  let adaptados = 0;
  for (const p of leerTipo('cuadro_columnetas')) {
    const k = p.dibujo?.factor ?? 1;
    const rej = rejillaCuadro(p.entidades.map((e) => (k === 1 ? e : {...e})));
    if (!rej || !rej.bandas.some((b) => /seccion/.test(b.papel ?? ''))) continue;
    const {contenido} = adaptarCuadro(p, {generado: gen.contenido.primitivas, niveles: 1});
    const t = textos(contenido.primitivas);
    assert.ok(t.includes('pa') && t.includes('pb'), p.archivo);
    assert.ok(!rej.columnas.some((c) => !['pa', 'pb'].includes(c.codigo) && t.includes(c.codigo)), `${p.archivo}: sin códigos del origen`);
    adaptados++;
  }
  assert.ok(adaptados >= 10, `cuadros adaptados: ${adaptados}`);
});

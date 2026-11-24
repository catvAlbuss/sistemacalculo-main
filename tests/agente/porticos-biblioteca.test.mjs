// Fase 2b: pórticos adaptados desde la biblioteca de detalles del despacho
// (resources/js/ingenieria/planos/porticoBiblioteca.js). Las piezas reales son privadas: la
// prueba con ellas se salta si la biblioteca no está en esta máquina; el resto usa piezas sintéticas.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {elegirPortico, adaptarPortico, porTramos, porticoDesdeBiblioteca, analizarPieza, centroTexto, perfilDestino, transformacion} from '../../resources/js/ingenieria/planos/porticoBiblioteca.js';
import {planoPortico} from '../../resources/js/ingenieria/planos/porticoPlano.js';
import {L} from '../../resources/js/ingenieria/cad/primitives.js';

const linea = (capa, a, b, color) => ({tipo: 'linea', capa, puntos: [{x: a[0], y: a[1]}, {x: b[0], y: b[1]}], ...(color ? {color} : {})});
const texto = (capa, x, y, t, alto = 0.1) => ({tipo: 'texto', capa, centro: {x, y}, texto: t, alto});

// Pórtico de un nivel, ejes A (x=0) y B (x=4), techo plano a +3.00, NFZ -1.50.
function piezaSintetica({luz = 4, techo = 3, proyecto = 'p-otro', modulo = 'modulo-01', ejes = null} = {}) {
  const xs = ejes ?? [0, luz];
  const entidades = [
    ...xs.flatMap((x) => [linea('COLUMNAS Y PLACAS', [x - 0.125, -0.9], [x - 0.125, techo], 5), linea('COLUMNAS Y PLACAS', [x + 0.125, -0.9], [x + 0.125, techo], 5)]),
    linea('CONCRETO', [0, techo - 0.4], [luz, techo - 0.4]), linea('CONCRETO', [0, techo], [luz, techo]),
    linea('.N1 Muros Altos', [luz / 2, 0.3], [luz / 2, techo - 0.4], 3),
    {tipo: 'circulo', capa: '49. EJES.', centro: {x: 0, y: techo + 1.5}, radio: 0.3},
    {tipo: 'circulo', capa: '49. EJES.', centro: {x: luz, y: techo + 1.5}, radio: 0.3},
    texto('0', 0, techo + 1.5, 'A', 0.3), texto('0', luz, techo + 1.5, 'B', 0.3),
    texto('.D1 cotas', -2, 0.1, 'BASE NPN=+/- 0.00m'), texto('.D1 cotas', -2, techo + 0.1, `TECHO NFP=+${techo.toFixed(2)}m`), texto('.D1 cotas', -2, -1.4, 'NFZ= - 1.50m'),
    texto('.D1 Texto', 1, -3, 'MODULO X - PLANO DE PORTICO EJE 1-1', 0.25), linea('.D1 Texto', [-1, -3.2], [3, -3.2]),
    texto('.D1 Texto', 0, 1.5, 'C-1'), texto('.D1 Texto', luz / 2, techo - 0.6, 'V-101 (0.25x0.40)'),
    linea('.D1 cotas', [0, -2.5], [luz, -2.5]), texto('.D1 cotas', luz / 2, -2.4, luz.toFixed(2)),
  ];
  return {
    tipo: 'portico', proyecto, modulo, titulo: 'PLANO DE PORTICO EJE 1-1', archivo: `${proyecto}-${modulo}-1.json`,
    niveles: [{sigla: 'NFZ', cota: -1.5, y: -1.5}, {sigla: 'NPN', etiqueta: 'BASE', cota: 0, y: 0}, {sigla: 'NFP', etiqueta: 'TECHO', cota: techo, y: techo}],
    parametros: {ejes: xs.map((x, i) => ({nombre: 'AB'[i] ?? `E${i}`, x})), luces: xs.slice(1).map((x, i) => x - xs[i]), luzTotal: xs.at(-1)},
    textos: ['Zapata Aislada 01', ...entidades.filter((e) => e.tipo === 'texto').map((e) => e.texto)],
    entidades,
  };
}

const destino = {
  eje: '1',
  ejes: [{nombre: '7', x: 0, s0: -0.15, s1: 0.15, tipo: 'C2'}, {nombre: '9', x: 5, s0: 4.85, s1: 5.15, tipo: 'C2'}],
  pisos: [0], techo: 3.5, cumbrera: null, xCumbrera: null, cimentacion: {tipo: 'zapatas', df: 1.5, hz: 0.6}, viga: {b: 0.25, h: 0.5}, h: 0.2,
};

const xsDe = (prims, capa) => prims.filter((p) => p.type === 'line' && p.layer === capa).flatMap((p) => [p.a[0], p.b[0]]);
const textos = (prims) => prims.filter((p) => p.type === 'text').map((p) => p.value);

test('piecewise stretch keeps rigid zones and maps anchors', () => {
  const f = porTramos([{p: 0, d: 0, l: Infinity, r: 0.2}, {p: 4, d: 5, l: 0.2, r: Infinity}]);
  assert.equal(f(0), 0); assert.equal(f(4), 5);
  assert.ok(Math.abs(f(0.1) - 0.1) < 1e-9); // zona rígida de la primera columna
  assert.ok(Math.abs(f(3.9) - 4.9) < 1e-9); // y de la última
  assert.ok(Math.abs(f(-2) + 2) < 1e-9);  // a la izquierda: traslación
  assert.ok(Math.abs(f(2) - 2.5) < 1e-9); // centro del tramo estirado
  // Zonas que no caben se achican y la función sigue creciente.
  const g = porTramos([{p: 0, d: 0, l: Infinity, r: 1}, {p: 1, d: 0.5, l: 1, r: Infinity}]);
  let prev = -Infinity;
  for (let v = -1; v <= 2; v += 0.05) { assert.ok(g(v) >= prev - 1e-12); prev = g(v); }
});

test('adapting a piece stretches spans and levels with rigid columns, beams and foundation', () => {
  const pieza = piezaSintetica();
  const {contenido, reemplazos} = adaptarPortico(pieza, destino);
  const p = contenido.primitivas;
  // Columnas: caras a ±0.125 de cada eje, trasladadas sin deformarse (eje B: 4 → 5).
  const cols = xsDe(p, 'COLUMNAS Y PLACAS').map((x) => Math.round(x * 1000) / 1000).sort((a, b) => a - b);
  assert.deepEqual([...new Set(cols)], [-0.125, 0.125, 4.875, 5.125]);
  // El muro del centro del tramo queda en el centro del tramo nuevo.
  assert.deepEqual([...new Set(xsDe(p, '.N1 Muros Altos'))], [2.5]);
  // Techo +3.00 → +3.50; el peralte de la viga (0.40) se conserva; el NPN y el NFZ quedan.
  const ysViga = [...new Set(p.filter((q) => q.layer === 'CONCRETO').map((q) => q.a[1]))].sort();
  assert.deepEqual(ysViga, [3.1, 3.5]);
  const colY = p.filter((q) => q.layer === 'COLUMNAS Y PLACAS').map((q) => q.a[1]);
  assert.ok(colY.every((y) => Math.abs(y + 0.9) < 1e-9));
  // Colores y capas del ingeniero.
  assert.ok(p.some((q) => q.layer === 'COLUMNAS Y PLACAS' && q.color === 5));
  // Ejes, niveles, código de columna, sección de viga y cota del destino; sin el título de la pieza.
  const t = textos(p);
  assert.ok(t.includes('7') && t.includes('9') && !t.includes('A') && !t.includes('B'));
  assert.ok(t.includes('TECHO NFP=+3.50m'), t.join(' | '));
  assert.ok(t.includes('BASE NPN=+/- 0.00m') && t.includes('NFZ= - 1.50m'));
  assert.ok(t.includes('C2') && !t.includes('C-1'));
  assert.ok(t.includes('V-101 (0.25x0.50)'));
  assert.ok(t.includes('5.00') && !t.includes('4.00'));
  assert.ok(!t.some((x) => /MODULO|PORTICO/.test(x)));
  assert.ok(!p.some((q) => q.type === 'line' && q.layer === '.D1 Texto'), 'el subrayado del título se quita');
  assert.equal(contenido.titulo, 'PLANO DE PÓRTICO EJE 1-1');
  assert.ok(contenido.ejes.x0 < 0 && contenido.ejes.x1 > 5 && contenido.ejes.y0 > 3.5);
  assert.equal(reemplazos.ejes, 2);
});

test('the most similar piece is chosen; different shape, too much stretch or same project are not', () => {
  const parecida = piezaSintetica({luz: 4.8, modulo: 'modulo-02'});
  const lejana = piezaSintetica({luz: 3.2, modulo: 'modulo-03'});
  const tresEjes = piezaSintetica({ejes: [0, 2.5, 5], modulo: 'modulo-04'});
  const enorme = piezaSintetica({luz: 12, modulo: 'modulo-05'});
  const r = elegirPortico(destino, [lejana, tresEjes, enorme, parecida]);
  assert.equal(r.pieza, parecida);
  assert.ok(r.puntaje > 0.55 && r.porque.length);
  assert.equal(elegirPortico(destino, [tresEjes, enorme]), null);
  // Medir sin trampa: sin las piezas del proyecto (o del módulo) evaluado.
  assert.equal(elegirPortico(destino, [parecida], {excluir: {proyecto: 'p-otro'}}), null);
  assert.equal(elegirPortico(destino, [parecida], {excluir: {proyecto: 'p-otro', modulo: 'modulo-01'}}).pieza, parecida);
  // Techo a dos aguas solo con piezas a dos aguas.
  assert.equal(elegirPortico({...destino, cumbrera: 4.2, xCumbrera: 2.5}, [parecida]), null);
  assert.equal(analizarPieza(parecida).cimentacion, 'zapatas');
});

// Pórtico generado: eje 1 con dos columnas de 0.30 x 0.30 a 5 m.
function generado() {
  const col = (x, n) => ({contorno: [{x: x - 0.15, y: -0.15}, {x: x + 0.15, y: -0.15}, {x: x + 0.15, y: 0.15}, {x: x - 0.15, y: 0.15}], nodo: {x, y: 0}, x, y: 0, eje: `1/${n}`, tipo: 'C2', forma: 'rectangular'});
  return planoPortico({eje: {nombre: '1', p: {x: -1, y: 0}, q: {x: 6, y: 0}}, columnas: [col(0, '7'), col(5, '9')], altura: 3.5, viga: {b: 0.25, h: 0.5}, cimentacion: {tipo: 'zapatas', df: 1.5, peralte: 0.6}});
}

test('without a library (or without a similar piece) the generated portal frame is kept as is', () => {
  const p = generado();
  assert.equal(porticoDesdeBiblioteca(p, null), p);
  assert.equal(porticoDesdeBiblioteca(p, []), p);
  assert.equal(porticoDesdeBiblioteca(p, [piezaSintetica({ejes: [0, 2.5, 5]})]), p);
  // La geometría que expone el generador es el destino de la adaptación.
  assert.deepEqual(p.geometria.ejes.map((e) => [e.nombre, e.x]), [['7', 0], ['9', 5]]);
  assert.equal(p.geometria.techo, 3.5);
  // Con una pieza parecida: dibujo adaptado, mismo modelo (metrado) y el del generador aparte.
  const a = porticoDesdeBiblioteca(p, {piezas: [piezaSintetica({luz: 4.8})]});
  assert.notEqual(a.contenido, p.contenido);
  assert.deepEqual(a.modelo, p.modelo);
  assert.equal(a.generador, p.contenido);
  assert.ok(a.biblioteca.puntaje > 0.55);
  assert.ok(textos(a.contenido.primitivas).includes('9'));
});

const BIB = 'storage/app/private/entrenamiento/biblioteca/portico';
test('a real engineer portal frame adapted to its own spans and levels stays where it was', {skip: !existsSync(BIB) && 'biblioteca privada no disponible'}, () => {
  const archivo = readdirSync(BIB).find((f) => f.startsWith('ilo-modulo-09-'));
  if (!archivo) return;
  const pieza = JSON.parse(readFileSync(join(BIB, archivo), 'utf8'));
  const a = analizarPieza(pieza);
  assert.ok(a && a.pisos.length >= 1);
  const d = {
    eje: 'X', ejes: a.ejes.map((e, i) => ({nombre: e.nombre, x: e.x, s0: a.columnas[i]?.l ?? e.x - 0.15, s1: a.columnas[i]?.r ?? e.x + 0.15})),
    pisos: [0, ...a.pisos.slice(0, -1).map((n) => n.y - a.npn.y)], techo: a.pisos.at(-1).y - a.npn.y, cumbrera: null,
    cimentacion: {tipo: a.cimentacion, df: a.df}, h: 0.2,
  };
  const {contenido} = adaptarPortico(pieza, d);
  const lineas = pieza.entidades.filter((e) => e.tipo === 'linea');
  const adaptadas = contenido.primitivas.filter((p) => p.type === 'line');
  // Cada línea del ingeniero sigue en su lugar (solo bajada a su ±0.00).
  let iguales = 0;
  for (const p of adaptadas.slice(0, 300)) if (lineas.some((e) => Math.abs(e.puntos[0].x - p.a[0]) < 2e-3 && Math.abs(e.puntos[0].y - a.npn.y - p.a[1]) < 2e-3)) iguales++;
  assert.ok(iguales / Math.min(300, adaptadas.length) > 0.98);
});

// Fase 2c: el pórtico adaptado es coherente con el proyecto real.
function generadoConMuro() {
  const col = (x, n) => ({contorno: [{x: x - 0.15, y: -0.15}, {x: x + 0.15, y: -0.15}, {x: x + 0.15, y: 0.15}, {x: x - 0.15, y: 0.15}], nodo: {x, y: 0}, x, y: 0, eje: `1/${n}`, tipo: 'C2', forma: 'rectangular'});
  const cta = {x: 3, y: 0, contorno: [{x: 2.875, y: -0.125}, {x: 3.125, y: -0.125}, {x: 3.125, y: 0.125}, {x: 2.875, y: 0.125}], codigo: 'pb'};
  return planoPortico({
    eje: {nombre: '1', p: {x: -1, y: 0}, q: {x: 6, y: 0}}, columnas: [col(0, '7'), col(5, '9')], altura: 3.5, viga: {b: 0.25, h: 0.5},
    cimentacion: {tipo: 'zapatas', df: 1.5, peralte: 0.6}, columnetas: [cta],
    vanos: [{tipo: 'ventana', nombre: 'V-7', p: {x: 1.5, y: 0}, alcance: 1.2}],
  });
}
// Pieza con lo propio de su módulo en el paño: una columneta "pa", una puerta P-3 con su dintel y
// el rótulo del muro; y un rótulo de estribos girado junto a la columna.
function piezaConMuro() {
  const p = piezaSintetica({luz: 4.8});
  p.entidades.push(
    linea('.N1 Columna amarre', [2.0, 0.3], [2.0, 2.6]), linea('.N1 Columna amarre', [2.25, 0.3], [2.25, 2.6]),
    texto('.N1 Cimiento Corrido', 2.4, 1.4, 'pa'), texto('.D1 Texto', 3.5, 1.0, 'P-3'), texto('.N1 Cimiento Corrido', 3.5, 2.2, 'Dintel 01'),
    linea('CONCRETO', [3.0, 2.1], [4.0, 2.1]), linea('CONCRETO', [3.0, 2.3], [4.0, 2.3]),
    texto('.D1 Texto', 1.2, 1.75, 'Muro de soga de ladrillo King Kong Tipo IV - 23x12.5x9cm', 0.08),
    {tipo: 'texto', capa: '.N1 Acero Long', centro: {x: -0.2, y: 0.4}, texto: '3/8" ∅: 1@0.05, Rst. @0.10 C/E', alto: 0.08, rot: 90, ancla: 1},
  );
  return p;
}

test('wall panels: the piece content of its own module is replaced by the destination openings and columnetas', () => {
  const g = generadoConMuro();
  const r = porticoDesdeBiblioteca(g, {piezas: [piezaConMuro()]});
  assert.ok(r.biblioteca, 'se adapta la pieza');
  const p = r.contenido.primitivas, t = textos(p);
  // Nada del módulo de origen: ni su columneta, ni su puerta, ni su dintel, ni el rótulo del muro.
  assert.ok(!t.some((x) => /^(pa|P-3|Dintel 01)$/.test(x) || /23x12.5x9cm/.test(x)), t.join(' | '));
  assert.ok(!p.some((q) => q.layer === '.N1 Columna amarre'));
  assert.ok(!p.some((q) => q.type === 'line' && q.layer === 'CONCRETO' && Math.abs(q.a[1] - 2.1) < 0.01 && q.a[0] > 3));
  // Lo del destino, en sus capas semánticas (la lámina las lleva a las del despacho).
  assert.ok(t.includes('VSa') && t.includes('V-7') && t.includes('PB'), t.join(' | '));
  assert.ok(p.some((q) => q.layer === L.MUROS_E && q.type === 'pline'));
  // Sin los rótulos de vigas del generador (los pone la pieza).
  assert.ok(!t.some((x) => /^V-101/.test(x) && p.find((q) => q.value === x)?.layer === L.VIGAS));
  // Las columnas de la pieza siguen en su lugar.
  assert.ok(p.some((q) => q.layer === 'COLUMNAS Y PLACAS'));
  // El modelo (metrado) describe lo dibujado: la columneta y la VSa del destino.
  assert.equal(r.modelo.columnetas.length, 1);
  assert.equal(r.modelo.vsa.length, 1);
  assert.equal(r.modelo.columnetas[0], g.modelo.columnetas[0]);
  // El rótulo de estribos conserva su giro y queda junto a la columna (no la cruza).
  const est = p.find((q) => q.type === 'text' && /Rst\. @0\.10/.test(q.value));
  assert.ok(est && est.rot === 90);
  assert.ok(est.at[0] < -0.125 + 0.02, `x ${est.at[0]}`);
  // Sin biblioteca, el mismo pórtico del generador.
  assert.equal(porticoDesdeBiblioteca(g, null), g);
});

test('text anchors: the stored insertion point is turned into the real centre of the text', () => {
  const e = {centro: {x: 0, y: 0}, texto: 'AB', alto: 0.1, ancla: 1};
  const c = centroTexto(e);
  assert.ok(c.x > 0 && c.y < 0); // arriba a la izquierda → el centro va a la derecha y abajo
  const g = centroTexto({...e, rot: 90});
  assert.ok(Math.abs(g.x - 0.05) < 1e-9 && g.y > 0); // girado 90°: a lo largo del texto es hacia arriba
  assert.deepEqual(centroTexto({centro: {x: 1, y: 2}, texto: 'X', alto: 0.1}), {x: 1, y: 2});
});

test('gable roof: the eave keeps its height and only the slope is stretched up to the ridge', () => {
  // Pieza a dos aguas: losa en el alero a +3.00 sobre los ejes y cumbrera a +3.80 (cobertura 6 cm arriba).
  const p = piezaSintetica({luz: 5, techo: 3.8});
  p.entidades = p.entidades.filter((e) => !(e.capa === 'CONCRETO'));
  p.entidades.push(linea('COBERTURA', [-0.6, 2.82], [2.5, 3.86]), linea('COBERTURA', [2.5, 3.86], [5.6, 2.82]));
  const a = analizarPieza(p);
  assert.ok(a.dosAguas && Math.abs(a.alero - (3.02 - 0.06)) < 0.02, JSON.stringify(a.alero));
  const dest = {...destino, ejes: [{nombre: '7', x: 0, s0: -0.15, s1: 0.15}, {nombre: '9', x: 5, s0: 4.85, s1: 5.15}], techo: 3.2, cumbrera: 4.4, xCumbrera: 2.5};
  const {fy} = transformacion(p, dest);
  const aleroD = perfilDestino(dest)(0);
  assert.ok(Math.abs(fy(a.alero) - aleroD) < 1e-6, `${fy(a.alero)} vs ${aleroD}`);
  assert.ok(Math.abs(fy(3.8) - 4.4) < 1e-6);
  // Bajo el alero se traslada rígido (no se estira hacia la cumbrera).
  assert.ok(Math.abs((fy(a.alero) - fy(a.alero - 0.3)) - 0.3) < 1e-6);
});

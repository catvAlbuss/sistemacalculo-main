// Reglas de texto de las láminas, medidas como dibuja el visor (cajasTexto.js): símbolos en un
// hueco de espacios, renglones corridos con espacios, textos dentro de su casilla, encimados.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as dm from '@mlightcad/data-model';
import {cajaTexto, seEncima, huecoDeSimbolo, sangriaConEspacios, escalaParaCasilla} from '../../resources/js/ingenieria/laminas/cajasTexto.js';

const p = (x, y) => new dm.AcGePoint3d(x, y, 0);
const linea = (a, b) => new dm.AcDbLine(p(...a), p(...b));
const mtext = (contenido, x, y, h, att = 1) => { const m = new dm.AcDbMText(); m.contents = contenido; m.location = p(x, y); m.height = h; m.attachmentPoint = att; return m; };
const texto = (t, x, y, h) => { const e = new dm.AcDbText(); e.textString = t; e.position = p(x, y); e.height = h; return e; };

test('a symbol drawn in a gap of spaces ("1 □ 1/4\\"") is found so each part can be anchored to it', () => {
  const t = mtext('1    1/4" Ø: 1@0.05, 4@0.10,', 0, 0.05, 0.05, 1);
  const caja = cajaTexto(t);
  const cx = caja.x0 + 0.12; // el estribo dibujado cae dentro del renglón
  const estribo = new dm.AcDbPolyline();
  [[cx, 0.005], [cx + 0.05, 0.005], [cx + 0.05, 0.045], [cx, 0.045]].forEach(([x, y], i) => estribo.addVertexAt(i, new dm.AcGePoint2d(x, y)));
  estribo.closed = true;
  const r = huecoDeSimbolo(t, [t, estribo, linea([-1, -0.5], [5, -0.5])]); // la línea larga de la tabla no es símbolo
  assert.equal(r.izquierda.trim(), '1');
  assert.equal(r.derecha, '1/4" Ø: 1@0.05, 4@0.10,');
  assert.ok(Math.abs(r.simbolo.x0 - cx) < 1e-9 && Math.abs(r.simbolo.x1 - (cx + 0.05)) < 1e-9);
  assert.equal(huecoDeSimbolo(mtext('sin hueco', 0, 0, 0.05), [estribo]), null);
});

test('a line pushed with leading spaces after another text is tied to that neighbor', () => {
  const vecino = texto('caso con dosificación 1:12 + 30 ', 0, 0, 0.06);
  const corrido = texto('                                %P. G. evitandose', 0.2, 0, 0.06);
  const r = sangriaConEspacios(corrido, [vecino, corrido]);
  assert.equal(r.contenido, '%P. G. evitandose');
  assert.equal(r.vecino, vecino);
  assert.ok(r.x > cajaTexto(vecino).x1, 'if not merged, it starts after the neighbor');
  // Una sangría de párrafo (sin vecino en el renglón) se deja como está.
  assert.equal(sangriaConEspacios(texto('   rras y en un 33% para paquetes', 0, -1, 0.06), [vecino]), null);
});

test('a text crossing the border of its cell shrinks to fit, keeping its anchor', () => {
  const t = texto("f´c= 210kg/cm2", 0, 0, 0.05);
  const c = cajaTexto(t);
  const borde = c.x0 + (c.x1 - c.x0) * 0.85;
  const lineas = [linea([borde, -0.2], [borde, 0.3]), linea([-0.1, -0.2], [-0.1, 0.3])];
  const s = escalaParaCasilla(t, [t, ...lineas]);
  assert.ok(s > 0.7 && s < 0.85, `scale ${s}`);
  // Una línea que termina antes del renglón no es su casilla.
  assert.equal(escalaParaCasilla(t, [t, linea([borde, 0.5], [borde, 1])]), null);
  // Si cabe, nada.
  assert.equal(escalaParaCasilla(t, [t, linea([c.x1 + 1, -0.2], [c.x1 + 1, 0.3])]), null);
});

test('stacked all-caps title lines without accents do not count as overlapping; with descenders they do', () => {
  const a = cajaTexto(texto('DETALLE DE LA UBICACION Y LONGITUD', 0, 0.125, 0.1));
  const b = cajaTexto(texto('DE EMPALMES TRASLAPADOS PARA COLUMNAS', 0, 0, 0.1));
  assert.equal(seEncima(a, b), false);
  const c = cajaTexto(texto('Para la cimentación y agregados', 0, 0.125, 0.1));
  const d = cajaTexto(texto('Ésta es la siguiente línea', 0, 0, 0.1));
  assert.equal(seEncima(c, d), true, 'tails of g/p/y and accents need room');
});

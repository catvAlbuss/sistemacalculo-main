// Fase 2a de la "biblioteca de detalles del despacho": extrae de los DWG de estructuras del
// ingeniero sus piezas típicas (pórticos, cortes de cimiento corrido, escaleras, cuadros de
// columnas y columnetas, detalles de techo y notas) para luego adaptarlas por parámetros a
// proyectos nuevos. Solo extrae e inventaría; no dibuja láminas.
//
//   NODE_OPTIONS=--max-old-space-size=12000 node scripts/agente/extraer-biblioteca.mjs [--grupo=<proyecto>] [modulo-01 …]
//
// Entrada (privada, fuera de git): la caché aplanada de cada DWG (volcar-planos.mjs) y el
// manifiesto storage/app/private/entrenamiento/estructuras/pares.json.
// Salida (privada): storage/app/private/entrenamiento/biblioteca/<tipo>/<grupo>-<modulo>-<n>.json
// e indice.json. El contenido de cada pieza NO lleva datos del cliente: el proyecto va con un
// código anónimo y se descartan los textos del rótulo (proyecto, entidad, profesional, lugar).
//
// Reglas generales (ninguna depende del nombre del proyecto ni de sus capas):
// - Una pieza se reconoce por su título (texto) y su tipo sale de las palabras del título.
// - Su caja: si el título vive dentro de un bloque, la inserción de ese bloque; si no, el grupo
//   de geometría conectada junto al título (sobre él, en pórticos y cortes) y lo que la rodea.
// - Pórticos: las burbujas de eje encima del dibujo dan los ejes; las marcas de nivel
//   (NFP, NPT, NFZ…) a su izquierda dan las cotas y la escala real del dibujo.
// - Coordenadas locales en metros reales: origen en el eje izquierdo y en la cota ±0.00.
import {readFileSync, writeFileSync, mkdirSync, existsSync, rmSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {PLANOS} from './planos.mjs';
import {leerCache} from './volcar-planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';

export const ESQUEMA = {nombre: 'BIBLIOTECA-DETALLES', version: '1.0.0'};
const BASE = join(PLANOS, 'estructuras');
export const BIBLIOTECA = join(PLANOS, 'biblioteca');
export const TIPOS = ['portico', 'corte_cimiento', 'corte_otro', 'escalera', 'cuadro_columnas', 'cuadro_columnetas', 'techo', 'notas', 'estandar'];
// Detalles estándar del despacho: el ingeniero los repite iguales en todos los módulos (no dependen
// del proyecto). Son los que llenan su lámina alrededor de las plantas.
export const ESTANDAR = [
  ['junta', /^JUNTA\s+SISMICA$/],
  ['encuentros', /^DETALLE\s+DE\s+\S+\s+EN\s+CASO\s+DE\s+ENCUENTROS\s+EN\s+PLANTA$/],
  ['empalmes', /^DETALLE\s+DE\s+LA\s+UBICACION\s+Y\s+LONGITUD/],
  ['refuerzo', /^DETALLE\s+DEL\s+REFUERZO$/],
  ['recubrimientos', /^DETALLE\s+DE\s+RECUBRIMIENTOS\s+EN\s+ENCUENTRO\s+VIGA\s+LOSA$/],
  ['isometrico', /^DETALLE\s+(TIPICO\s+)?ISOMETRICO\s+(DE\s+)?LOSA\s+ALIGERADA/],
  ['estribos', /^DETALLE\s+DE\s+ESTRIBOS$/],
  ['leyenda', /^LEYENDA$/],
];
export const claveEstandar = (titulo) => { const t = sinAcentos(tituloLimpio(titulo)).toUpperCase().replace(/\s+/g, ' '); return ESTANDAR.find(([, re]) => re.test(t))?.[0] ?? null; };

const r3 = (v) => Math.round(v * 1000) / 1000;
const mediana = (xs) => { const a = xs.filter(Number.isFinite).sort((p, q) => p - q); if (!a.length) return null; const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const sinAcentos = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ---------------------------------------------------------------- textos y títulos

// Texto plano de un MTEXT: quita subrayados (\L \l), cambios de fuente ({\f…;}), saltos (\P).
export function limpiarTexto(texto) {
  return String(texto ?? '')
    .replace(/\\P/g, ' ')
    .replace(/\\[ACcFfHhQTWp][^;\\]*;/g, '')
    .replace(/\\[LlOoKk]/g, '')
    .replace(/[{}]/g, '')
    .replace(/%%[uUoO]/g, '')
    .replace(/%%[cC]/g, 'Ø')
    .replace(/%%[dD]/g, '°')
    .replace(/%%[pP]/g, '±')
    .replace(/\s+/g, ' ')
    .trim();
}

// Título sin el prefijo del módulo ("MODULO I - ") ni la escala pegada al final.
export function tituloLimpio(texto) {
  return limpiarTexto(texto)
    .replace(/^M[OÓ]DULO\s+[IVXL\d]+[A-Z]?(\s+[A-Z])?\s*[-–:]\s*/i, '')
    .replace(/\s*[-–]?\s*M[OÓ]DULO\s+[IVXLl\d]+\s*$/i, '')
    .replace(/\s*(ESC(ALA)?\.?\s*:?\s*1\s*\/\s*\d+|SIN\s+ESCALA)\s*$/i, '')
    .replace(/[\s:\-–]+$/, '')
    .trim();
}

// Tipo de pieza por las palabras del título (lo que el ingeniero dice que es). null: no es pieza.
export function tipoDePieza(titulo) {
  const t = sinAcentos(tituloLimpio(titulo)).toUpperCase();
  if (!t || t.length > 90) return null;
  if (claveEstandar(titulo)) return 'estandar';
  if (/P[O]RTICO/.test(t)) return 'portico';
  if (/^(PLANO\s+DE\s+)?TECHO\s+DE\s+ESCALERA|PLANO\s+DE\s+TECHO/.test(t)) return null; // planta de techo, no detalle
  if (/[:=]|\bKG\b/.test(t)) return null; // una nota o una carga, no un título
  if (/^(DETALLE|CORTE|SECCION|ELEVACION)\b.*\bESCALERA/.test(t) || /^ESCALERA(\s+(\d+|[IVX]+|TRAMO\b.*|[A-Z]?-?\d{0,2}))?$/.test(t)) return 'escalera';
  if (/^CUADRO\s+DE\s+COLUMNETAS?\b/.test(t)) return 'cuadro_columnetas';
  if (/^CUADRO\s+DE\s+(COLUMNAS?|PLACAS?)\b/.test(t)) return 'cuadro_columnas';
  if (/^(DETALLE|CORTE|SECCION|ELEVACION)\b.*\b(CUMBRERA|CANALETA|TIJERAL|CORREAS?|COBERTURA|CUBIERTA|TECHO|PANEL)\b/.test(t)
    || /^(TIJERAL\s+T?-?\d+|CUMBRERA|CANALETA)$/.test(t)) return 'techo';
  if (/^(ESPECIFICACIONES\s+TECNICAS|NOTAS?(\s+GENERALES)?)$/.test(t)) return 'notas';
  if (/^CORTE\s+[A-Z0-9]{1,3}\s*[-–]\s*[A-Z0-9]{1,3}$/.test(t)) return 'corte';
  return null;
}

// Escala escrita: "ESC: 1/75", "ESCALA 1/20", "ESC.:1/25". 0 = "SIN ESCALA"; null = no dice.
export function escalaDeTexto(texto) {
  const t = sinAcentos(limpiarTexto(texto)).toUpperCase();
  const m = /ESC(?:ALA)?\.?\s*:?\s*1\s*\/\s*(\d{1,4})/.exec(t);
  if (m) return Number(m[1]);
  return /SIN\s+ESCALA/.test(t) ? 0 : null;
}

// Marca de nivel: "Techo NFP=+15.03m", "N.P.T. = +0.15m", "NFZ=+1.20m", "N.T.N. = ±0.00m".
export function nivelDeTexto(texto) {
  const t = sinAcentos(limpiarTexto(texto)).toUpperCase().replace(/−/g, '-').replace(/\+\s*\/\s*-/g, '±');
  const et = /\bN\s*\.?\s*([PFT])\s*\.?\s*([A-Z])\s*\.?(?![A-Z])/.exec(t);
  if (!et) return null;
  const n = /(?:=|:)?\s*([+\-±]?)\s*(\d{1,3}[.,]\d{1,3})/.exec(t.slice(et.index));
  if (!n) return null;
  const valor = (Number(n[2].replace(',', '.')) * (n[1] === '-' ? -1 : 1)) || 0; // nunca "-0"
  if (!Number.isFinite(valor) || Math.abs(valor) > 200) return null;
  return {sigla: `N${et[1]}${et[2]}`, cota: valor, etiqueta: t.slice(0, et.index).replace(/[=:]/g, '').trim() || null};
}

// ---------------------------------------------------------------- datos del cliente

// Señales de rótulo y de datos personales: generales del formato del despacho, no del cliente.
const ANCLA_ROTULO = /^(PROYECTO|UBICACI[OÓ]N|PROPIETARIO|CLIENTE|ESPECIALIDAD|L[AÁ]MINA|FECHA|DISTRITO|PROVINCIA|DEPARTAMENTO|REGI[OÓ]N|COORDINADOR[^:]*|ING\.?|CIP)\s*[:.]?\s*$/i;
// Ojo: "@" sola es el espaciamiento del acero (1@0.05); solo un correo completo es dato personal.
const DATO_PERSONAL = /\b(ING|ARQ|BACH|ABOG)\.\s|\bC\.?I\.?P\.?\s*(N|:|\d)|\bC\.?A\.?P\.?\s*(N|:|\d)|\bD\.?N\.?I\b|\bR\.?U\.?C\b|[\w.-]+@[\w-]+\.[a-z]{2,}|\b9\d{8}\b|MUNICIPALIDAD|GOBIERNO\s+REGIONAL|MEJORAMIENTO\s+DEL|CREACI[OÓ]N\s+DEL|AMPLIACI[OÓ]N\s+DEL|PROPIETARIO|UBICACI[OÓ]N\s*:|LOCALIDAD|DISTRITO\s+DE|PROVINCIA\s+DE|DEPARTAMENTO\s+DE|REGI[OÓ]N\s*:/i;
const palabras = (t) => sinAcentos(limpiarTexto(t)).toUpperCase().match(/[A-Z0-9]{4,}/g) ?? [];

// Cajas del rótulo de un plano: agrupa las anclas ("PROYECTO:", "FECHA:", "CIP"…) que estén a
// pocos metros entre sí; cada grupo de tres o más anclas es un rótulo.
export function cajasDeRotulo(items, k = 1) {
  const anclas = items.filter((i) => i.tipo === 'texto' && ANCLA_ROTULO.test(limpiarTexto(i.texto)));
  const grupos = [];
  for (const a of anclas) {
    const g = grupos.find((x) => Math.abs(x.cx - a.centro.x) < 8 * k && Math.abs(x.cy - a.centro.y) < 8 * k);
    if (g) { g.n++; g.x0 = Math.min(g.x0, a.centro.x); g.x1 = Math.max(g.x1, a.centro.x); g.y0 = Math.min(g.y0, a.centro.y); g.y1 = Math.max(g.y1, a.centro.y); }
    else grupos.push({cx: a.centro.x, cy: a.centro.y, x0: a.centro.x, x1: a.centro.x, y0: a.centro.y, y1: a.centro.y, n: 1});
  }
  const m = 1.5 * k;
  return grupos.filter((g) => g.n >= 3).map((g) => ({x0: g.x0 - m, y0: g.y0 - m, x1: g.x1 + m, y1: g.y1 + m}));
}

// Vocabulario de un plano: palabras de sus rótulos (conjunto) y del resto de sus textos
// (palabra → en cuántos textos aparece).
export function vocabularioDelPlano(items, k = 1) {
  const rotulos = cajasDeRotulo(items, k);
  const enRotulo = (p) => rotulos.some((c) => p.x >= c.x0 && p.x <= c.x1 && p.y >= c.y0 && p.y <= c.y1);
  const rotulo = new Set(), resto = new Map();
  for (const i of items) {
    if (i.tipo !== 'texto') continue;
    const deRotulo = enRotulo(i.centro) || DATO_PERSONAL.test(limpiarTexto(i.texto));
    for (const w of new Set(palabras(i.texto))) deRotulo ? rotulo.add(w) : resto.set(w, (resto.get(w) ?? 0) + 1);
  }
  return {rotulos, rotulo, resto};
}

// Suma vocabularios (de los planos de un mismo proyecto).
export function sumarVocabulario(acumulado, v) {
  const a = acumulado ?? {rotulo: new Set(), resto: new Map()};
  for (const w of v.rotulo) a.rotulo.add(w);
  for (const [w, n] of v.resto) a.resto.set(w, (a.resto.get(w) ?? 0) + n);
  return a;
}

// Palabras prohibidas de un proyecto: las de sus rótulos que no usa ningún otro proyecto fuera
// del rótulo ni el propio proyecto en varios textos de sus dibujos (el vocabulario técnico se
// repite; el nombre del cliente, del lugar o del profesional vive en el rótulo).
export function palabrasDelCliente(rotuloPropio, restoOtros, restoPropio = new Map(), repetida = 3) {
  const fuera = new Set(), comunes = new Set();
  for (const s of restoOtros) for (const w of s.keys()) comunes.add(w);
  for (const w of rotuloPropio) {
    if (/^\d{5,}$/.test(w)) { fuera.add(w); continue; } // códigos, DNI, colegiatura
    if (/^\d+$/.test(w) || /\dX\d/.test(w) || ETIQUETAS_ROTULO.has(w) || comunes.has(w) || (restoPropio.get(w) ?? 0) >= repetida) continue;
    fuera.add(w);
  }
  return fuera;
}

// Las etiquetas del rótulo (no sus valores) son del formato del despacho, no del cliente.
const ETIQUETAS_ROTULO = new Set(['PROYECTO', 'UBICACION', 'PROPIETARIO', 'CLIENTE', 'ESPECIALIDAD', 'ESPECIALISTA', 'LAMINA', 'FECHA', 'DISTRITO', 'PROVINCIA', 'DEPARTAMENTO', 'REGION', 'COORDINADOR', 'ESCALA', 'CODIGO']);

export const esTextoDeCliente = (texto, prohibidas) => DATO_PERSONAL.test(limpiarTexto(texto)) || palabras(texto).some((w) => prohibidas.has(w));

// ---------------------------------------------------------------- geometría

const cajaItem = (i) => {
  if (i.tipo === 'circulo') return {x0: i.centro.x - i.radio, y0: i.centro.y - i.radio, x1: i.centro.x + i.radio, y1: i.centro.y + i.radio};
  if (i.tipo === 'texto') { const w = Math.max(1, limpiarTexto(i.texto).length) * (i.alto ?? 0.1) * 0.55, h = i.alto ?? 0.1; return {x0: i.centro.x - w / 2, y0: i.centro.y - h / 2, x1: i.centro.x + w / 2, y1: i.centro.y + h / 2}; }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of i.puntos ?? []) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
  return {x0, y0, x1, y1};
};
const unir = (a, b) => (a ? {x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1)} : {...b});
const crecer = (c, m) => ({x0: c.x0 - m, y0: c.y0 - m, x1: c.x1 + m, y1: c.y1 + m});
const seCruzan = (a, b) => a.x0 <= b.x1 && b.x0 <= a.x1 && a.y0 <= b.y1 && b.y0 <= a.y1;
const contiene = (c, p) => p.x >= c.x0 && p.x <= c.x1 && p.y >= c.y0 && p.y <= c.y1;
const ancho = (c) => c.x1 - c.x0, alto = (c) => c.y1 - c.y0;

// Unidades del dibujo por metro, por el radio típico de las burbujas de eje (como el inventario).
export function unidadesDelPlano(burbujas) {
  const r = mediana(burbujas.map((b) => b.radio));
  return r == null ? 1 : r >= 40 ? 1000 : r >= 4 ? 100 : 1;
}

// Burbujas de eje: círculo con un nombre corto (1–4 caracteres) en su centro.
export function burbujasDeEje(items) {
  const textos = items.filter((i) => i.tipo === 'texto' && /^[A-Z0-9][A-Z0-9´'`’"]{0,3}$/i.test(limpiarTexto(i.texto)));
  const rejilla = new Map(), C = 1;
  for (const t of textos) { const key = `${Math.floor(t.centro.x / C)},${Math.floor(t.centro.y / C)}`; (rejilla.get(key) ?? rejilla.set(key, []).get(key)).push(t); }
  const res = [];
  for (const c of items) {
    if (c.tipo !== 'circulo' || !(c.radio > 0.08 && c.radio < 0.8 || c.radio > 8 && c.radio < 80 || c.radio > 80 && c.radio < 800)) continue;
    let mejor = null;
    const gx = Math.floor(c.centro.x / C), gy = Math.floor(c.centro.y / C), n = Math.ceil(c.radio / C);
    for (let dx = -n; dx <= n; dx++) for (let dy = -n; dy <= n; dy++) for (const t of rejilla.get(`${gx + dx},${gy + dy}`) ?? []) {
      const d = Math.hypot(t.centro.x - c.centro.x, t.centro.y - c.centro.y);
      if (d < c.radio * 1.5 && (t.alto ?? 0) > c.radio * 0.4 && (!mejor || d < mejor.d)) mejor = {t, d};
    }
    if (mejor) res.push({x: c.centro.x, y: c.centro.y, radio: c.radio, nombre: limpiarTexto(mejor.t.texto).replace(/[`’]/g, '´'), capa: c.capa});
  }
  // Una burbuja dibujada dos veces (círculo y su contorno) cuenta una vez.
  return res.filter((b, i) => !res.slice(0, i).some((o) => o.nombre === b.nombre && Math.hypot(o.x - b.x, o.y - b.y) < b.radio));
}

// Grupos de geometría conectada (las cajas se tocan con una tolerancia). Se omiten los marcos
// de lámina: lo que mide más de `grande` en ambos sentidos o más de 3 veces eso en uno.
export function gruposConectados(items, {tol = 0.03, grande = 20, celda = 1} = {}) {
  const geo = [];
  items.forEach((it, idx) => {
    if (it.tipo === 'texto') return;
    const c = cajaItem(it);
    if (!Number.isFinite(c.x0)) return;
    if ((ancho(c) > grande && alto(c) > grande) || ancho(c) > 3 * grande || alto(c) > 3 * grande) return;
    geo.push({idx, c: crecer(c, tol / 2)});
  });
  const padre = geo.map((_, i) => i);
  const raiz = (i) => { while (padre[i] !== i) { padre[i] = padre[padre[i]]; i = padre[i]; } return i; };
  const rejilla = new Map();
  geo.forEach((g, gi) => {
    for (let x = Math.floor(g.c.x0 / celda); x <= Math.floor(g.c.x1 / celda); x++) for (let y = Math.floor(g.c.y0 / celda); y <= Math.floor(g.c.y1 / celda); y++) {
      const key = `${x},${y}`;
      const lista = rejilla.get(key);
      if (!lista) { rejilla.set(key, [gi]); continue; }
      for (const o of lista) if (raiz(o) !== raiz(gi) && seCruzan(geo[o].c, g.c)) padre[raiz(o)] = raiz(gi);
      lista.push(gi);
    }
  });
  const grupos = new Map();
  geo.forEach((g, gi) => {
    const r = raiz(gi);
    const gr = grupos.get(r) ?? grupos.set(r, {indices: [], caja: null}).get(r);
    gr.indices.push(g.idx); gr.caja = unir(gr.caja, g.c);
  });
  return [...grupos.values()];
}

// ---------------------------------------------------------------- piezas

const prefijoBloque = (it) => (typeof it.id === 'string' && it.id.includes('/') ? it.id.split('/')[0] : null);

// Escala de la pieza: en el título o en el texto "ESC: 1/n" justo debajo (o encima) de él.
function escalaDePieza(titulo, textos, k) {
  const propia = escalaDeTexto(titulo.texto);
  if (propia != null) return propia;
  const h = titulo.alto ?? 0.2 * k, w = limpiarTexto(titulo.texto).length * h * 0.55;
  let mejor = null;
  for (const t of textos) {
    if (t === titulo) continue;
    const dy = titulo.centro.y - t.centro.y, dx = Math.abs(t.centro.x - titulo.centro.x);
    if (dy < -1.5 * h || dy > 4 * h || dx > w / 2 + 3 * h) continue;
    const e = escalaDeTexto(t.texto);
    if (e == null) continue;
    const d = Math.abs(dy) + dx * 0.3;
    if (!mejor || d < mejor.d) mejor = {e, d};
  }
  return mejor ? mejor.e : null;
}

// Cota en el dibujo de una marca de nivel: la punta del triángulo (dos trazos inclinados que se
// juntan abajo, en V) junto al texto. Si no hay triángulo, la línea horizontal más larga bajo él.
function yDeMarca(texto, segmentos, k) {
  const h = texto.alto ?? 0.1 * k;
  const w = limpiarTexto(texto.texto).length * h * 0.55;
  const x0 = texto.centro.x - w / 2 - 2.5 * h, x1 = texto.centro.x + w / 2 + 2.5 * h;
  const y0 = texto.centro.y - 8 * h, y1 = texto.centro.y + h;
  const cerca = segmentos.filter((s) => Math.max(s.a.x, s.b.x) >= x0 && Math.min(s.a.x, s.b.x) <= x1 && Math.max(s.a.y, s.b.y) >= y0 && Math.min(s.a.y, s.b.y) <= y1);
  const inclinados = [];
  for (const s of cerca) {
    const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, L = Math.hypot(dx, dy);
    if (L < 0.3 * h || L > 6 * h || Math.abs(dy) < 0.3 * L || Math.abs(dx) < 0.2 * L) continue;
    const bajo = s.a.y < s.b.y ? s.a : s.b, alto = s.a.y < s.b.y ? s.b : s.a;
    inclinados.push({bajo, lado: Math.sign(alto.x - bajo.x)});
  }
  let punta = null;
  for (let i = 0; i < inclinados.length; i++) for (let j = i + 1; j < inclinados.length; j++) {
    const p = inclinados[i], q = inclinados[j];
    if (p.lado === q.lado || Math.hypot(p.bajo.x - q.bajo.x, p.bajo.y - q.bajo.y) > 0.05 * h) continue;
    const y = (p.bajo.y + q.bajo.y) / 2;
    if (y > texto.centro.y) continue;
    if (!punta || texto.centro.y - y < texto.centro.y - punta) punta = y;
  }
  if (punta != null) return punta;
  let mejor = null;
  for (const s of cerca) {
    if (Math.abs(s.a.y - s.b.y) > 1e-3 * Math.max(1, Math.abs(s.a.x - s.b.x))) continue;
    const y = (s.a.y + s.b.y) / 2, dy = texto.centro.y - y, largo = Math.abs(s.a.x - s.b.x);
    if (dy < 0) continue;
    if (!mejor || largo > mejor.largo * 1.2 || (largo > mejor.largo / 1.2 && dy < mejor.dy)) mejor = {dy, y, largo};
  }
  return mejor?.y ?? null;
}

const segmentosDe = (items) => {
  const ss = [];
  for (const it of items) {
    if (it.tipo !== 'linea' && it.tipo !== 'poli') continue;
    const p = it.puntos ?? [];
    for (let j = 1; j < p.length; j++) ss.push({a: p[j - 1], b: p[j]});
    if (it.cerrada && p.length > 2) ss.push({a: p.at(-1), b: p[0]});
  }
  return ss;
};

// Niveles de la pieza y la relación cota → y del dibujo: y = y0 + cota · u (u = unidades por metro real).
function nivelesDePieza(textos, segmentos, k) {
  const niveles = [];
  for (const t of textos) {
    const n = nivelDeTexto(t.texto);
    if (!n) continue;
    const yLinea = yDeMarca(t, segmentos, k);
    niveles.push({...n, yTexto: t.centro.y, yLinea, x: t.centro.x});
  }
  // Una cota escrita dos veces (texto repetido) cuenta una vez.
  const unicos = [];
  for (const n of niveles.sort((a, b) => a.cota - b.cota)) if (!unicos.some((u) => u.cota === n.cota && u.sigla === n.sigla)) unicos.push(n);
  const desfase = mediana(unicos.filter((n) => n.yLinea != null).map((n) => n.yTexto - n.yLinea)) ?? 0;
  for (const n of unicos) n.y = n.yLinea ?? n.yTexto - desfase;
  let u = null, y0 = null;
  const distintas = [...new Set(unicos.map((n) => n.cota))];
  if (distintas.length >= 2) {
    const mx = unicos.reduce((s, n) => s + n.cota, 0) / unicos.length, my = unicos.reduce((s, n) => s + n.y, 0) / unicos.length;
    const sxx = unicos.reduce((s, n) => s + (n.cota - mx) ** 2, 0), sxy = unicos.reduce((s, n) => s + (n.cota - mx) * (n.y - my), 0);
    u = sxy / sxx; y0 = my - u * mx;
    if (!(u > 0)) { u = null; y0 = null; }
  }
  return {niveles: unicos, u, y0};
}

// Factor del dibujo respecto a metros reales: lo medido con los niveles, ajustado a la razón
// de escalas (escala de la lámina / escala de la pieza) cuando coincide dentro del 15 %.
function factorDeDibujo({uNiveles, escalaPieza, escalaLamina, k}) {
  const porEscala = escalaPieza > 0 && escalaLamina > 0 ? escalaLamina / escalaPieza : null;
  if (uNiveles != null) {
    const f = uNiveles / k;
    if (porEscala && Math.abs(f / porEscala - 1) < 0.15) return {factor: porEscala, fuente: 'niveles+escala'};
    // Razones de escala comunes (1/50 sobre 1/75, 1/25 sobre 1/50…): medidas, no supuestas.
    const comun = [1, 2, 0.5, 2 / 3, 1.5, 4, 0.25, 3, 1 / 3, 4 / 3, 0.75, 2.5, 0.4, 5, 0.2].find((c) => Math.abs(f / c - 1) < 0.03);
    if (comun) return {factor: comun, fuente: 'niveles'};
    return {factor: r3(f), fuente: 'niveles', dudoso: true};
  }
  if (porEscala) return {factor: porEscala, fuente: 'escala', dudoso: porEscala !== 1};
  return {factor: 1, fuente: 'supuesto', dudoso: true};
}

// Componente "ancla" de una pieza sin bloque, según dónde suele estar el dibujo respecto al título.
function anclaJuntoAlTitulo(tipo, titulo, grupos, k, otrosTitulos) {
  const h = titulo.alto ?? 0.2 * k;
  const ct = cajaItem(titulo);
  const lejos = (tipo === 'portico' ? 3 : 2) * k;
  const candidatos = [];
  for (const g of grupos) {
    if (g.indices.length < 4) continue;
    if (ancho(g.caja) > 60 * k || alto(g.caja) > 40 * k) continue;
    // La decoración del título (subrayado, símbolo de escala) no es el dibujo.
    if (alto(g.caja) < 6 * h && g.indices.length <= 20 && g.caja.y0 > titulo.centro.y - 6 * h && g.caja.y1 < titulo.centro.y + 2 * h) continue;
    const dentro = contiene(g.caja, titulo.centro);
    const solapaX = g.caja.x0 <= ct.x1 && g.caja.x1 >= ct.x0;
    const dy = g.caja.y0 - ct.y1; // > 0: el grupo está encima del título
    const dyAbajo = ct.y0 - g.caja.y1; // > 0: debajo
    let d = null;
    if (dentro) d = tipo === 'portico' ? null : 0; // un pórtico nunca encierra su título
    else if (solapaX && dy > -h && dy < lejos) d = Math.max(0, dy);
    else if (solapaX && tipo !== 'portico' && dyAbajo > -h && dyAbajo < lejos) d = Math.max(0, dyAbajo) + 0.5 * k;
    else if (tipo !== 'portico') {
      // Título al costado del dibujo (escaleras, detalles sueltos): distancia entre cajas.
      const gx = Math.max(0, g.caja.x0 - ct.x1, ct.x0 - g.caja.x1), gy = Math.max(0, g.caja.y0 - ct.y1, ct.y0 - g.caja.y1);
      const dist = Math.hypot(gx, gy);
      if (dist < lejos / 2) d = dist + 0.75 * k;
    }
    if (d == null) continue;
    // Un grupo que encierra el título de otra pieza es un marco o una lámina, no esta pieza.
    if (otrosTitulos.some((o) => o !== titulo && contiene(g.caja, o.centro)) && !dentro) continue;
    candidatos.push({g, d, peso: g.indices.length});
  }
  if (!candidatos.length) return null;
  candidatos.sort((a, b) => a.d - b.d || b.peso - a.peso);
  // Entre los cercanos (a un título de distancia del mejor) gana el más grande.
  const cerca = candidatos.filter((c) => c.d <= candidatos[0].d + 1.5 * h);
  return cerca.sort((a, b) => b.peso - a.peso)[0].g;
}

// Crece la caja con los grupos que la tocan (detalles menores, cotas), sin pasar sobre otros títulos.
function crecerCaja(caja, grupos, k, otrosTitulos, titulo, limite) {
  let c = caja;
  for (let paso = 0; paso < 3; paso++) {
    let cambio = false;
    const zona = crecer(c, 0.3 * k);
    for (const g of grupos) {
      if (g.indices.length < 1 || !seCruzan(zona, g.caja)) continue;
      const nueva = unir(c, g.caja);
      if (nueva.x0 === c.x0 && nueva.y0 === c.y0 && nueva.x1 === c.x1 && nueva.y1 === c.y1) continue;
      if (ancho(nueva) > limite.ancho || alto(nueva) > limite.alto) continue;
      if (otrosTitulos.some((o) => o !== titulo && !contiene(c, o.centro) && contiene(nueva, o.centro))) continue;
      c = nueva; cambio = true;
    }
    if (!cambio) break;
  }
  return c;
}

const LIMITES = {
  portico: {ancho: 60, alto: 40}, corte: {ancho: 12, alto: 12}, escalera: {ancho: 20, alto: 12},
  cuadro_columnas: {ancho: 40, alto: 25}, cuadro_columnetas: {ancho: 40, alto: 25}, techo: {ancho: 10, alto: 8}, notas: {ancho: 25, alto: 30},
  estandar: {ancho: 14, alto: 12},
};

// Caja del pórtico: el dibujo conectado sobre el título, sus burbujas de eje encima y las
// marcas de nivel a su izquierda.
function cajaDePortico(titulo, grupos, burbujas, textos, k, otrosTitulos) {
  const ancla = anclaJuntoAlTitulo('portico', titulo, grupos, k, otrosTitulos);
  if (!ancla) return {motivo: 'sin dibujo conectado sobre el título'};
  const a = ancla.caja, r = mediana(burbujas.map((b) => b.radio)) ?? 0.25 * k;
  // Burbujas: la fila más baja sobre el dibujo, dentro del ancho del dibujo.
  const sobre = burbujas.filter((b) => b.y > a.y0 + 0.3 * alto(a) && b.y < a.y1 + 6 * k && b.x >= a.x0 - 2 * r && b.x <= a.x1 + 2 * r);
  if (!sobre.length) return {motivo: 'sin burbujas de eje sobre el dibujo'};
  const yFila = Math.min(...sobre.map((b) => b.y));
  const fila = sobre.filter((b) => b.y - yFila < 3 * r).sort((p, q) => p.x - q.x);
  const ejes = fila.filter((b, i) => !fila.slice(0, i).some((o) => Math.abs(o.x - b.x) < r));
  const x0Ejes = ejes[0].x, x1Ejes = ejes.at(-1).x;
  // Marcas de nivel: columna de textos con cota a la izquierda del dibujo (o, si no, a la derecha).
  const marcas = textos.filter((t) => nivelDeTexto(t.texto) && t.centro.y > Math.min(a.y0, titulo.centro.y) && t.centro.y < yFila + r);
  const izq = marcas.filter((t) => t.centro.x < a.x0 + 0.5 * k && t.centro.x > a.x0 - 6 * k);
  const der = marcas.filter((t) => t.centro.x > a.x1 - 0.5 * k && t.centro.x < a.x1 + 3 * k);
  // Solo la columna más cercana al dibujo (la del pórtico vecino queda fuera).
  const columna = (ms, lado) => { if (!ms.length) return []; const xr = lado < 0 ? Math.max(...ms.map((t) => t.centro.x)) : Math.min(...ms.map((t) => t.centro.x)); return ms.filter((t) => Math.abs(t.centro.x - xr) < 2 * k); };
  const deNivel = izq.length ? columna(izq, -1) : columna(der, 1);
  let caja = unir(a, {x0: x0Ejes - r, y0: a.y0, x1: x1Ejes + r, y1: yFila + r});
  for (const t of deNivel) caja = unir(caja, cajaItem(t));
  caja = unir(caja, cajaItem(titulo));
  // Detalles menores dentro del ancho del pórtico (cortes de viga): los grupos contenidos en la franja.
  const franja = {x0: caja.x0, x1: caja.x1, y0: caja.y0, y1: caja.y1};
  for (const g of grupos) if (g.caja.x0 >= franja.x0 && g.caja.x1 <= franja.x1 + 0.5 * k && g.caja.y0 >= franja.y0 && g.caja.y1 <= franja.y1 && !otrosTitulos.some((o) => o !== titulo && contiene(g.caja, o.centro))) caja = unir(caja, g.caja);
  return {caja: crecer(caja, 0.15 * k), ejes, marcas: deNivel};
}

// Caja de las demás piezas: la inserción del bloque que contiene al título, o el grupo junto al título.
function cajaDeDetalle(tipo, titulo, items, grupos, k, otrosTitulos) {
  const lim = LIMITES[tipo === 'corte_cimiento' || tipo === 'corte_otro' ? 'corte' : tipo] ?? {ancho: 30, alto: 30};
  const limite = {ancho: lim.ancho * k, alto: lim.alto * k};
  const pref = prefijoBloque(titulo);
  if (pref) {
    let caja = null, n = 0, textosOtros = 0;
    for (const it of items) if (prefijoBloque(it) === pref) {
      caja = unir(caja, cajaItem(it));
      if (it.tipo !== 'texto') n++;
      else if (it !== titulo && escalaDeTexto(it.texto) == null && limpiarTexto(it.texto)) textosOtros++;
    }
    // Un bloque que solo es el título (texto, subrayado, símbolo y escala) no es la pieza.
    const soloTitulo = caja && (alto(caja) < 4 * (titulo.alto ?? 0.2 * k) || (textosOtros === 0 && n < 30));
    if (caja && n >= 3 && !soloTitulo && ancho(caja) <= limite.ancho && alto(caja) <= limite.alto && !otrosTitulos.some((o) => o !== titulo && prefijoBloque(o) !== pref && contiene(caja, o.centro) && tipoDePieza(o.texto) === tipoDePieza(titulo.texto)))
      return {caja: crecer(caja, 0.05 * k), fuente: 'bloque'};
  }
  const ancla = anclaJuntoAlTitulo(tipo, titulo, grupos, k, otrosTitulos);
  if (!ancla) return {motivo: 'sin dibujo conectado junto al título'};
  if (ancho(ancla.caja) > limite.ancho || alto(ancla.caja) > limite.alto) return {motivo: /^corte/.test(tipo) ? `corte general del edificio, no un detalle (${r3(ancho(ancla.caja) / k)}×${r3(alto(ancla.caja) / k)} m)` : `el dibujo junto al título es demasiado grande (${r3(ancho(ancla.caja) / k)}×${r3(alto(ancla.caja) / k)} m): parece una lámina o un marco`};
  let caja = unir(ancla.caja, cajaItem(titulo));
  caja = crecerCaja(caja, grupos, k, otrosTitulos, titulo, limite);
  return {caja: crecer(caja, 0.05 * k), fuente: 'geometria'};
}

// ¿El corte es de cimiento corrido? Lo dicen sus textos (cimiento, sobrecimiento, ciclópeo, NFC…).
const ES_CIMIENTO = /CIMIENTO|SOBRECIMIENTO|CICL[OÓ]PEO|\bP\.?\s?G\b|\bP\.?\s?M\b|N\.?\s?F\.?\s?C|N\.?\s?F\.?\s?Z|FALSO\s+PISO|SOLADO|TERRENO/i;

// Ancho y peralte del cimiento: verticales que nacen en el fondo (NFC) y la primera horizontal
// que las cruza; medición geométrica, se marca como heurística.
export function medirCimiento(items, yFondo, u, yPiso = null) {
  const vert = [], hor = [];
  for (const it of items) {
    if (it.tipo !== 'linea' && it.tipo !== 'poli') continue;
    const p = it.puntos ?? [];
    for (let j = 1; j < p.length; j++) {
      const a = p[j - 1], b = p[j];
      if (Math.abs(a.x - b.x) < 0.002 * u && Math.abs(a.y - b.y) > 0.03 * u) vert.push({x: (a.x + b.x) / 2, y0: Math.min(a.y, b.y), y1: Math.max(a.y, b.y)});
      else if (Math.abs(a.y - b.y) < 0.002 * u && Math.abs(a.x - b.x) > 0.1 * u) hor.push({y: (a.y + b.y) / 2, x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x)});
    }
  }
  // Trazos partidos en la misma recta se unen (un borde dibujado en dos tramos sigue siendo uno).
  const fundir = (lista, clave, a0, a1) => {
    const grupos = new Map();
    for (const s of lista) { const kk = Math.round(s[clave] / (0.004 * u)); (grupos.get(kk) ?? grupos.set(kk, []).get(kk)).push(s); }
    const res = [];
    for (const g of grupos.values()) {
      g.sort((p, q) => p[a0] - q[a0]);
      let cur = {...g[0]};
      for (const s of g.slice(1)) { if (s[a0] <= cur[a1] + 0.01 * u) cur[a1] = Math.max(cur[a1], s[a1]); else { res.push(cur); cur = {...s}; } }
      res.push(cur);
    }
    return res;
  };
  vert.splice(0, vert.length, ...fundir(vert, 'x', 'y0', 'y1'));
  hor.splice(0, hor.length, ...fundir(hor, 'y', 'x0', 'x1'));
  const base = vert.filter((v) => Math.abs(v.y0 - yFondo) < 0.06 * u && v.y1 - yFondo > 0.25 * u);
  if (base.length < 2) return null;
  const xs = [...new Set(base.map((v) => Math.round(v.x / (0.005 * u))))].map((x) => x * 0.005 * u).sort((a, b) => a - b);
  // Eje del muro: los trazos verticales que están enteros sobre el piso (ladrillos, sobrecimiento).
  // Es lo más alto del corte: se toman los trazos verticales cuya cima está cerca de la máxima.
  const altos = yPiso != null ? vert.filter((v) => v.y1 > yPiso + 0.2 * u) : [];
  const techo = altos.length ? Math.max(...altos.map((v) => v.y1)) : null;
  const sobre = altos.filter((v) => v.y1 > techo - 0.5 * u);
  const xMuro = sobre.length >= 2 ? (Math.min(...sobre.map((v) => v.x)) + Math.max(...sobre.map((v) => v.x))) / 2 : null;
  // Cuerpo del cimiento: el par de verticales que nacen en el fondo, tapadas por una horizontal,
  // y que contienen el eje del muro (el más angosto); sin muro, el más angosto de todos.
  let mejor = null;
  for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) {
    const w = (xs[j] - xs[i]) / u;
    if (w < 0.2 || w > 2.5) continue;
    if (xMuro != null && !(xs[i] - 0.01 * u <= xMuro && xMuro <= xs[j] + 0.01 * u)) continue;
    // Tapa: la horizontal más baja que cubre al menos la mitad del ancho, sin pasar la cima de
    // las dos verticales (el cimiento termina donde termina su borde más bajo).
    const cima = Math.min(...base.filter((v) => Math.abs(v.x - xs[i]) < 0.005 * u || Math.abs(v.x - xs[j]) < 0.005 * u).map((v) => v.y1));
    const tapa = hor.filter((h) => h.y > yFondo + 0.2 * u && h.y <= cima + 0.01 * u && Math.min(h.x1, xs[j]) - Math.max(h.x0, xs[i]) >= 0.5 * (xs[j] - xs[i])).sort((a, b) => a.y - b.y)[0];
    if (!tapa) continue;
    const peralte = (tapa.y - yFondo) / u;
    if (peralte > 2) continue;
    if (!mejor || w < mejor.ancho) mejor = {ancho: r3(w), peralte: r3(peralte), conMuro: xMuro != null};
  }
  return mejor;
}

// Peldaños de una escalera: contrapasos (verticales) y pasos (horizontales) de tamaño típico.
export function medirPeldanos(items, u) {
  const cps = [], ps = [];
  for (const it of items) {
    if (it.tipo !== 'linea' && it.tipo !== 'poli') continue;
    const p = it.puntos ?? [];
    for (let j = 1; j < p.length; j++) {
      const a = p[j - 1], b = p[j], dx = Math.abs(a.x - b.x) / u, dy = Math.abs(a.y - b.y) / u;
      if (dx < 0.002 && dy >= 0.12 && dy <= 0.22) cps.push(r3(dy));
      else if (dy < 0.002 && dx >= 0.2 && dx <= 0.4) ps.push(r3(dx));
    }
  }
  if (cps.length < 3 || ps.length < 3) return null;
  return {contrapasoDibujado: r3(mediana(cps)), pasoDibujado: r3(mediana(ps)), contrapasosContados: cps.length};
}

// Etiquetas de secciones de un cuadro (PL1, CT1, C-1, pa, pb…): la fila con más etiquetas cortas.
function etiquetasDeCuadro(textos, k) {
  const cand = textos.filter((t) => { const s = limpiarTexto(t.texto); return /^[A-Za-z]{1,3}-?\d{0,2}[A-Za-z]?$/.test(s) && !/^(NIVEL|PISO|TECHO|ESC)$/i.test(s); });
  const filas = [];
  for (const t of cand) {
    const f = filas.find((x) => Math.abs(x.y - t.centro.y) < 0.15 * k);
    if (f) f.t.push(t); else filas.push({y: t.centro.y, t: [t]});
  }
  const fila = filas.sort((a, b) => b.t.length - a.t.length)[0];
  return fila && fila.t.length >= 1 ? [...new Set(fila.t.sort((a, b) => a.centro.x - b.centro.x).map((t) => limpiarTexto(t.texto)))] : [];
}

const resistencias = (textos) => [...new Set(textos.flatMap((t) => [...limpiarTexto(t.texto).matchAll(/f'?\s*[´’']?\s*c\s*=\s*(\d{2,3})/gi)].map((m) => Number(m[1]))))].sort((a, b) => a - b);

// Entidad en coordenadas locales (metros reales).
function local(it, P, esc) {
  const e = {tipo: it.tipo, capa: it.capa};
  if (it.color) e.color = it.color;
  if (it.puntos) { e.puntos = it.puntos.map(P); if (it.cerrada) e.cerrada = true; }
  if (it.tipo === 'circulo') { e.centro = P(it.centro); e.radio = r3(it.radio / esc); }
  if (it.tipo === 'texto') { e.centro = P(it.centro); e.texto = limpiarTexto(it.texto); e.alto = r3((it.alto ?? 0) / esc); if (it.rot) e.rot = it.rot; if (it.ancla) e.ancla = it.ancla; }
  return e;
}

/**
 * Extrae las piezas de un plano de estructuras ya aplanado.
 * @param {object[]} items  elementos de la caché (aplanarModelo)
 * @param {{prohibidas?: Set<string>}} opciones  palabras del cliente a descartar
 * @returns {{piezas: object[], descartes: object[], unidadesPorMetro: number}}
 */
export function extraerPiezas(items, {prohibidas = new Set()} = {}) {
  const burbujas = burbujasDeEje(items);
  const k = unidadesDelPlano(burbujas);
  const textos = items.filter((i) => i.tipo === 'texto' && i.centro);
  const {rotulos} = vocabularioDelPlano(items, k);
  const enRotulo = (p) => rotulos.some((c) => contiene(c, p));
  // Títulos: texto de tamaño de título cuyo contenido dice un tipo de pieza.
  // Tamaño mínimo de un título: la mitad del de los títulos de plano y pórtico del
  // mismo archivo (las etiquetas dentro de un plano, como "CANALETA", son más chicas).
  const altosTitulo = textos.filter((t) => /PLANO|P[OÓ]RTICO|CUADRO\s+DE/i.test(limpiarTexto(t.texto)) && (t.alto ?? 0) >= 0.12 * k).map((t) => t.alto);
  const minimoTitulo = Math.max(0.12 * k, 0.5 * (mediana(altosTitulo) ?? 0));
  const titulos = [];
  for (const t of textos) {
    const tipo = tipoDePieza(t.texto);
    if (!tipo || (t.alto ?? 0) < minimoTitulo || enRotulo(t.centro)) continue;
    titulos.push({t, tipo});
  }
  const todosLosTitulos = textos.filter((t) => (t.alto ?? 0) >= minimoTitulo && tipoDePieza(t.texto));
  // Escala de la lámina: la más común entre pórticos y plantas del mismo plano.
  const escalasLamina = textos.filter((t) => /P[OÓ]RTICO|PLANO\s+DE|CIMENTACI|LOSA/i.test(limpiarTexto(t.texto)) && (t.alto ?? 0) >= 0.12 * k).map((t) => escalaDePieza(t, textos, k)).filter((e) => e > 0);
  const conteo = new Map(); for (const e of escalasLamina) conteo.set(e, (conteo.get(e) ?? 0) + 1);
  const escalaLamina = [...conteo].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const grupos = gruposConectados(items, {tol: 0.03 * k, grande: 20 * k, celda: k});
  const piezas = [], descartes = [];
  for (const {t: titulo, tipo: tipoTitulo} of titulos) {
    const nombre = tituloLimpio(titulo.texto);
    const res = tipoTitulo === 'portico'
      ? cajaDePortico(titulo, grupos, burbujas, textos, k, todosLosTitulos)
      : cajaDeDetalle(tipoTitulo, titulo, items, grupos, k, todosLosTitulos);
    if (!res.caja) { descartes.push({tipo: tipoTitulo, titulo: nombre, motivo: res.motivo}); continue; }
    const caja = res.caja;
    const anclasDentro = textos.filter((x) => contiene(caja, x.centro) && enRotulo(x.centro) && ANCLA_ROTULO.test(limpiarTexto(x.texto)));
    if (anclasDentro.length >= 2) { descartes.push({tipo: tipoTitulo, titulo: nombre, motivo: 'la caja abarca el rótulo de la lámina'}); continue; }
    // Entidades: las de la inserción del bloque (si la pieza es un bloque) y las sueltas dentro de
    // la caja; nunca las del rótulo.
    const pref = res.fuente === 'bloque' ? prefijoBloque(titulo) : null;
    const dentro = items.filter((it) => {
      const pts = it.puntos ?? [it.centro];
      if (!pts.every((p) => p && contiene(caja, p)) || pts.some((p) => enRotulo(p))) return false;
      // En un pórtico, las marcas de nivel que no son de su columna son del pórtico vecino.
      if (tipoTitulo === 'portico' && it.tipo === 'texto' && nivelDeTexto(it.texto) && !res.marcas.includes(it)) return false;
      if (!pref) return true;
      const pb = prefijoBloque(it);
      return pb === pref || (pb == null && tipoTitulo !== 'notas');
    });
    const textosPieza = dentro.filter((i) => i.tipo === 'texto');
    if (tipoTitulo === 'notas' ? textosPieza.length < 4 : dentro.length - textosPieza.length < 8) { descartes.push({tipo: tipoTitulo, titulo: nombre, motivo: 'la caja quedó casi vacía (solo el título)'}); continue; }
    // Corte: de cimiento corrido si sus textos lo dicen.
    let tipo = tipoTitulo;
    if (tipo === 'corte') tipo = textosPieza.some((x) => ES_CIMIENTO.test(limpiarTexto(x.texto))) && !/CISTERNA|TANQUE/i.test(nombre) ? 'corte_cimiento' : 'corte_otro';
    const escala = escalaDePieza(titulo, textos, k);
    const {niveles, u, y0} = nivelesDePieza(tipo === 'portico' ? res.marcas : textosPieza, segmentosDe(dentro), k);
    const f = factorDeDibujo({uNiveles: u, escalaPieza: escala, escalaLamina: tipo === 'portico' ? null : escalaLamina, k});
    const esc = k * f.factor; // unidades del dibujo por metro real
    // Un "corte de cimiento" de varios metros es el corte de otra cosa (cisterna, tanque, edificio).
    if (tipo === 'corte_cimiento' && (ancho(caja) / esc > 5 || alto(caja) / esc > 5)) tipo = 'corte_otro';
    // Origen local: eje izquierdo (o borde izquierdo) y cota ±0.00 (o el borde inferior).
    const ox = tipo === 'portico' ? res.ejes[0].x : caja.x0;
    const oy = y0 != null ? y0 : caja.y0;
    const P = (p) => ({x: r3((p.x - ox) / esc), y: r3((p.y - oy) / esc)});
    const entidades = [], descartadosCliente = [];
    for (const it of dentro) {
      if (it.tipo === 'texto' && esTextoDeCliente(it.texto, prohibidas)) { descartadosCliente.push(it.id); continue; }
      entidades.push(local(it, P, esc));
    }
    const cajaLocal = {x0: r3((caja.x0 - ox) / esc), y0: r3((caja.y0 - oy) / esc), x1: r3((caja.x1 - ox) / esc), y1: r3((caja.y1 - oy) / esc)};
    const nivelesLocales = niveles.map((n) => ({sigla: n.sigla, etiqueta: n.etiqueta, cota: n.cota, y: r3((n.y - oy) / esc)}));
    const parametros = {};
    const dudas = [];
    if (f.dudoso && !['notas', 'cuadro_columnas', 'cuadro_columnetas'].includes(tipo)) dudas.push(`factor de dibujo ${f.factor} por ${f.fuente}`);
    if (tipo === 'portico') {
      const ejes = res.ejes.map((b) => ({nombre: b.nombre, x: r3((b.x - ox) / esc)}));
      parametros.ejes = ejes;
      parametros.luces = ejes.slice(1).map((e, i) => r3(e.x - ejes[i].x));
      parametros.luzTotal = r3(ejes.at(-1).x - ejes[0].x);
      parametros.luzMaxima = parametros.luces.length ? Math.max(...parametros.luces) : null;
      // Losas: NPT/NFP/NPN; dos marcas a menos de 0.20 m son la misma losa (piso y fondo de losa).
      const losas = [];
      for (const n of nivelesLocales.filter((x) => /^N[PF][PTN]$/.test(x.sigla))) if (!losas.length || n.cota - losas.at(-1).cota >= 0.2) losas.push(n);
      parametros.numeroNiveles = losas.length;
      parametros.numeroEntrepisos = Math.max(0, losas.length - 1);
      if (nivelesLocales.length >= 2) {
        parametros.cotaMinima = nivelesLocales[0].cota; parametros.cotaMaxima = nivelesLocales.at(-1).cota;
        parametros.alturaTotal = r3(parametros.cotaMaxima - parametros.cotaMinima);
        if (losas.length >= 2) parametros.alturaEdificacion = r3(losas.at(-1).cota - losas[0].cota);
        if (losas.length >= 2) parametros.alturasDeEntrepiso = losas.slice(1).map((n, i) => r3(n.cota - losas[i].cota));
      } else dudas.push('sin marcas de nivel: alturas sin medir');
      const geo = dentro.filter((i) => i.tipo !== 'texto' && !(i.tipo === 'circulo' && burbujas.some((b) => Math.hypot(b.x - i.centro.x, b.y - i.centro.y) < 1e-6)));
      parametros.alturaDibujo = r3(alto(geo.reduce((c, i) => unir(c, cajaItem(i)), null) ?? caja) / esc);
    } else if (tipo === 'corte_cimiento' || tipo === 'corte_otro') {
      const fondo = nivelesLocales.find((n) => /NF[CZ]/.test(n.sigla)) ?? null;
      const piso = nivelesLocales.filter((n) => /NP[T]|NFP/.test(n.sigla)).sort((a, b) => b.cota - a.cota)[0] ?? null;
      const terreno = nivelesLocales.find((n) => /NT[N]/.test(n.sigla)) ?? null;
      if (fondo) parametros.cotaFondo = fondo.cota;
      if (piso) parametros.cotaPiso = piso.cota;
      if (terreno) parametros.cotaTerreno = terreno.cota;
      if (fondo && piso) parametros.profundidad = r3(piso.cota - fondo.cota);
      if (fondo) {
        const m = medirCimiento(dentro, oy + fondo.y * esc, esc, piso ? oy + piso.y * esc : null);
        if (m) { parametros.anchoCimiento = m.ancho; parametros.peralteCimiento = m.peralte; parametros.medicionCimiento = m.conMuro ? 'geometria bajo el muro' : 'geometria (sin muro, dudosa)'; if (!m.conMuro) dudas.push('ancho de cimiento sin muro de referencia'); }
        else dudas.push('no se pudo medir el ancho y el peralte del cimiento');
      } else dudas.push('sin nivel de fondo (NFC/NFZ)');
      const anchoTexto = textosPieza.map((x) => /\b(?:B|A)\s*=\s*(\d[.,]\d{1,2})/.exec(limpiarTexto(x.texto))).find(Boolean);
      if (anchoTexto) parametros.anchoEscrito = Number(anchoTexto[1].replace(',', '.'));
      parametros.resistencias = resistencias(textosPieza);
    } else if (tipo === 'cuadro_columnas' || tipo === 'cuadro_columnetas') {
      parametros.secciones = etiquetasDeCuadro(textosPieza.filter((x) => !esTextoDeCliente(x.texto, prohibidas)), k);
      parametros.resistencias = resistencias(textosPieza);
      parametros.filasDeNivel = [...new Set(textosPieza.map((x) => limpiarTexto(x.texto)).filter((s) => /^\d+\s*[°º]?\s*(PISO|NIVEL)|^(PRIMER|SEGUNDO|TERCER|CUARTO)\s+(PISO|NIVEL)|^AZOTEA$/i.test(s)))];
    } else if (tipo === 'estandar') {
      parametros.clave = claveEstandar(titulo.texto);
      // Para dibujarlo en otra lámina: unidades de lámina (1 = 1 m a 1/50) = local × factor.
      parametros.factor = r3(f.factor);
      parametros.caja = cajaLocal;
    } else if (tipo === 'notas') {
      parametros.resistencias = resistencias(textosPieza);
      parametros.lineas = textosPieza.length;
    }
    if (tipo === 'escalera' || tipo === 'techo') {
      if (nivelesLocales.length) parametros.cotas = nivelesLocales.map((n) => n.cota);
      const paso = textosPieza.map((x) => /\bP(?:ASO)?\s*=\s*(0[.,]\d{2})/i.exec(limpiarTexto(x.texto))).find(Boolean);
      const cp = textosPieza.map((x) => /\bC\.?\s*P(?:ASO)?\.?\s*=\s*(0[.,]\d{2,3})/i.exec(limpiarTexto(x.texto))).find(Boolean);
      if (paso) parametros.paso = Number(paso[1].replace(',', '.'));
      if (cp) parametros.contrapaso = Number(cp[1].replace(',', '.'));
      if (tipo === 'escalera') {
        // Peldaños dibujados: contrapasos verticales de 0.12–0.22 m y pasos horizontales de 0.20–0.40 m.
        const m = medirPeldanos(dentro, esc);
        if (m) Object.assign(parametros, m);
        else dudas.push('no se pudieron medir los peldaños');
      }
      parametros.resistencias = resistencias(textosPieza);
    }
    if (tipo === 'cuadro_columnas' || tipo === 'cuadro_columnetas') {
      // El f'c suele ir solo en la celda "CONCRETO f'c" del cuadro.
      for (const x of textosPieza) { const v = Number(limpiarTexto(x.texto)); if ([140, 175, 210, 245, 280, 350, 420].includes(v) && !parametros.resistencias.includes(v)) parametros.resistencias.push(v); }
      parametros.resistencias.sort((a, b) => a - b);
    }
    parametros.tamano = {ancho: r3(ancho(caja) / esc), alto: r3(alto(caja) / esc)};
    piezas.push({
      tipo, titulo: nombre, escala: escala || null, sinEscala: escala === 0 || undefined,
      escalaLamina: escalaLamina ?? null,
      dibujo: {unidadesPorMetro: r3(esc), factor: r3(f.factor), fuenteFactor: f.fuente, fuenteCaja: res.fuente ?? 'geometria'},
      caja: cajaLocal,
      niveles: nivelesLocales,
      parametros,
      ...(dudas.length ? {dudas} : {}),
      entidades,
      textos: entidades.filter((e) => e.tipo === 'texto').map((e) => e.texto),
      capas: [...new Set(entidades.map((e) => e.capa))].sort(),
      textosDescartados: descartadosCliente.length,
      _cajaDibujo: caja,
    });
  }
  // Un mismo detalle con dos títulos (texto doble) o una pieza dentro de otra del mismo tipo: queda una.
  const unicas = [];
  for (const p of piezas.sort((a, b) => b.entidades.length - a.entidades.length)) {
    const igual = unicas.find((o) => o.tipo === p.tipo && seCruzan(o._cajaDibujo, p._cajaDibujo) && solape(o._cajaDibujo, p._cajaDibujo) > 0.6);
    if (igual) { descartes.push({tipo: p.tipo, titulo: p.titulo, motivo: `repite la pieza "${igual.titulo}" (misma caja)`}); continue; }
    unicas.push(p);
  }
  return {piezas: unicas, descartes, unidadesPorMetro: k};
}

function solape(a, b) {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  if (w <= 0 || h <= 0) return 0;
  return (w * h) / Math.min(ancho(a) * alto(a), ancho(b) * alto(b));
}

const huella = (p) => createHash('sha1').update(JSON.stringify([p.tipo, [...p.textos].sort()])).digest('hex').slice(0, 12);
export const codigoDeProyecto = (grupo) => `p-${createHash('sha1').update(String(grupo)).digest('hex').slice(0, 6)}`;

// ---------------------------------------------------------------- programa

async function main() {
  const args = process.argv.slice(2);
  const grupoSolo = args.find((a) => a.startsWith('--grupo='))?.slice(8);
  const modulos = args.filter((a) => !a.startsWith('--'));
  const manifiesto = JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8'));
  // Los proyectos marcados `holdout` son solo para medir generalización (evaluar-dibujo): no se
  // extraen a la biblioteca ni se aprende de ellos, así no contaminan la referencia ni filtran datos.
  const pares = paresDelManifiesto(BASE, manifiesto, existsSync)
    .filter((p) => !p.holdout && (!grupoSolo || p.grupo === grupoSolo) && (!modulos.length || modulos.includes(p.id)));
  // Paso 1: vocabulario de rótulo y del resto de textos por proyecto (de TODO el manifiesto).
  const vocab = new Map();
  for (const p of paresDelManifiesto(BASE, manifiesto, existsSync)) {
    const c = leerCache(p.rutaEstructura);
    if (!c) continue;
    const v = vocabularioDelPlano(c.items, unidadesDelPlano(burbujasDeEje(c.items)));
    vocab.set(p.grupo, sumarVocabulario(vocab.get(p.grupo), v));
  }
  const prohibidasDe = new Map([...vocab].map(([g, v]) => [g, palabrasDelCliente(v.rotulo, [...vocab].filter(([o]) => o !== g).map(([, o]) => o.resto), v.resto)]));
  if (vocab.size < 2) console.warn('aviso: con un solo proyecto no se puede separar el vocabulario del cliente; solo se aplican las reglas generales de rótulo.');

  if (!grupoSolo && !modulos.length) for (const t of TIPOS) rmSync(join(BIBLIOTECA, t), {recursive: true, force: true});
  const indice = {esquema: ESQUEMA.nombre, version: ESQUEMA.version, generado: new Date().toISOString(), proyectos: {}, piezas: [], noAisladas: [], duplicadas: 0};
  const vistas = new Set();
  for (const p of pares) {
    const c = leerCache(p.rutaEstructura);
    const codigo = codigoDeProyecto(p.grupo);
    if (!c) { indice.noAisladas.push({proyecto: codigo, modulo: p.id, motivo: 'sin caché (correr volcar-planos.mjs)'}); continue; }
    const t0 = Date.now();
    const {piezas, descartes} = extraerPiezas(c.items, {prohibidas: prohibidasDe.get(p.grupo) ?? new Set()});
    let n = 0;
    for (const pieza of piezas) {
      const h = huella(pieza);
      // Las notas y cuadros se repiten idénticos en cada lámina: se guarda una vez por proyecto.
      if (vistas.has(`${codigo}:${h}`)) { indice.duplicadas++; continue; }
      vistas.add(`${codigo}:${h}`);
      n++;
      const {_cajaDibujo, ...limpia} = pieza;
      const salida = {esquema: ESQUEMA.nombre, version: ESQUEMA.version, proyecto: codigo, modulo: p.id, huella: h, ...limpia};
      const archivo = `${pieza.tipo}/${p.grupo}-${p.id}-${n}.json`;
      mkdirSync(join(BIBLIOTECA, pieza.tipo), {recursive: true});
      writeFileSync(join(BIBLIOTECA, archivo), JSON.stringify(salida));
      indice.piezas.push({archivo, proyecto: codigo, modulo: p.id, tipo: pieza.tipo, titulo: pieza.titulo, escala: pieza.escala, entidades: pieza.entidades.length, parametros: Object.fromEntries(Object.entries(pieza.parametros).filter(([key]) => !['ejes'].includes(key))), ...(pieza.dudas ? {dudas: pieza.dudas} : {})});
    }
    for (const d of descartes) indice.noAisladas.push({proyecto: codigo, modulo: p.id, ...d});
    console.log(`${p.grupo} ${p.id}: ${n} piezas, ${descartes.length} sin aislar (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  }
  // Resumen: piezas por tipo y proyecto y parámetros típicos (medianas).
  const porTipo = {};
  for (const x of indice.piezas) {
    const t = porTipo[x.tipo] ??= {total: 0, porProyecto: {}};
    t.total++; t.porProyecto[x.proyecto] = (t.porProyecto[x.proyecto] ?? 0) + 1;
  }
  const med = (tipo, key) => { const v = mediana(indice.piezas.filter((x) => x.tipo === tipo).map((x) => x.parametros[key])); return v == null ? null : r3(v); };
  const tipicos = {
    portico: {luzMaxima: med('portico', 'luzMaxima'), luzTotal: med('portico', 'luzTotal'), alturaTotal: med('portico', 'alturaTotal'), alturaEdificacion: med('portico', 'alturaEdificacion'), numeroEntrepisos: med('portico', 'numeroEntrepisos'),
      alturaEntrepiso: (() => { const v = mediana(indice.piezas.filter((x) => x.tipo === 'portico').flatMap((x) => x.parametros.alturasDeEntrepiso ?? [])); return v == null ? null : r3(v); })()},
    corte_cimiento: {anchoCimiento: med('corte_cimiento', 'anchoCimiento'), peralteCimiento: med('corte_cimiento', 'peralteCimiento'), profundidad: med('corte_cimiento', 'profundidad'), cotaFondo: med('corte_cimiento', 'cotaFondo')},
    escalera: {contrapaso: med('escalera', 'contrapasoDibujado'), paso: med('escalera', 'pasoDibujado')},
  };
  const escalas = {};
  for (const x of indice.piezas) if (x.escala) { const e = escalas[x.tipo] ??= {}; e[`1/${x.escala}`] = (e[`1/${x.escala}`] ?? 0) + 1; }
  const motivos = {};
  for (const d of indice.noAisladas) { const key = `${d.tipo ?? '-'}: ${d.motivo.replace(/\(.*\)|".*"/g, '').trim()}`; motivos[key] = (motivos[key] ?? 0) + 1; }
  Object.assign(indice, {resumen: {porTipo, tipicos, escalas, motivosNoAisladas: motivos}});
  for (const g of new Set(pares.map((p) => p.grupo))) indice.proyectos[codigoDeProyecto(g)] = {modulos: pares.filter((p) => p.grupo === g).length};
  mkdirSync(BIBLIOTECA, {recursive: true});
  writeFileSync(join(BIBLIOTECA, 'indice.json'), JSON.stringify(indice, null, 1));

  console.log('\nPiezas por tipo y proyecto:');
  for (const [t, v] of Object.entries(porTipo)) console.log(`  ${t.padEnd(18)} ${String(v.total).padStart(4)}   ${Object.entries(v.porProyecto).map(([pr, n]) => `${pr}: ${n}`).join('  ')}`);
  console.log(`  (repetidas idénticas omitidas: ${indice.duplicadas})`);
  console.log('\nParámetros típicos (medianas):');
  for (const [t, v] of Object.entries(tipicos)) console.log(`  ${t}: ${Object.entries(v).map(([key, x]) => `${key}=${x}`).join(', ')}`);
  console.log('\nEscalas por tipo:', JSON.stringify(escalas));
  console.log('\nNo aisladas (por motivo):');
  for (const [m, n] of Object.entries(motivos).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${m}`);
  console.log(`\nSalida: ${BIBLIOTECA}`);
}

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)).toLowerCase() === resolve(process.argv[1]).toLowerCase()) main().catch((e) => { console.error(e); process.exit(1); });

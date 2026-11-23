// Caja que ocupa un texto (TEXT o MTEXT) tal como lo dibuja el visor, y regla "ningún texto
// encima de otro". Es la vista del agente sobre una lámina: con ella se ve qué se encima y
// se corrige achicando la letra, en vez de mirarlo a ojo. La usa el generador de la
// plantilla (detalles del expediente) y sirve para revisar las láminas del agente.
//
// Medida: anchoTexto (calibrada en el visor) con un margen; MTEXT con su ancho de párrafo
// se corta en palabras como lo hace el visor; renglones a 1.667 alturas.

import {anchoTexto} from "./rotulo.js";
import {textoPlano} from "../lectura/lectorPlano.js";

export const HOLGURA = 1.2;
const PASO = 1.667;

// Renglones de un MTEXT como los corta el visor: por \P y, con ancho de párrafo, en palabras.
export function renglonesMtext(contenido, alto, ancho, factor = 1) {
  const medida = (t) => anchoTexto(t, alto) * HOLGURA * factor;
  const salida = [];
  for (const parte of String(contenido ?? "").split(/\\P/)) {
    const t = textoPlano(parte);
    if (!(ancho > 0) || medida(t) <= ancho) { salida.push(t); continue; }
    let actual = "";
    for (const p of t.split(/\s+/).filter(Boolean)) {
      const prueba = actual ? `${actual} ${p}` : p;
      if (actual && medida(prueba) > ancho) { salida.push(actual); actual = p; } else actual = prueba;
    }
    salida.push(actual);
  }
  return salida.map((t) => ({t, w: medida(t)}));
}

// Caja {x0, y0, x1, y1, h} de una entidad de texto en sus coordenadas, o null (rotada o vacía).
// factor: ancho de la letra del estilo (Arial ×0.82 en las angostas). Visto en el visor real:
// solo los TEXT lo respetan; los MTEXT se dibujan a ancho completo.
export function cajaTexto(e, factor = 1) {
  const caja = cajaSinMargen(e, factor);
  if (!caja) return null;
  const crudo = String(e.textString ?? e.contents ?? "");
  const t = textoPlano(crudo);
  // Lo que la letra ocupa fuera de su altura: acentos arriba; colas (g, j, p, q, y, coma,
  // paréntesis) y subrayado abajo. Un renglón solo de mayúsculas sin acentos no sobresale.
  caja.ma = /[ÁÉÍÓÚÑÜáéíóúñü´`^~¨]/.test(t) ? 0.25 : 0.05;
  caja.mb = /[gjpqy,;()_\[\]{}@$|Ç]/.test(t) || /%%U|\\L/i.test(crudo) ? 0.25 : 0.05;
  return caja;
}

function cajaSinMargen(e, factor) {
  const tipo = String(e.dxfTypeName ?? "").toUpperCase();
  if (tipo !== "MTEXT" && tipo !== "TEXT") return null;
  if (Math.abs(e.rotation ?? 0) > 1e-3) return null;
  const h = e.height > 0 ? e.height : 0;
  if (!h) return null;
  if (tipo === "MTEXT") {
    // Factor de ancho propio del texto ("{\W0.82;CUADRO DE VIGUETAS}"): el visor lo aplica.
    const propio = Number(String(e.contents ?? "").match(/\\W([\d.]+);/)?.[1]);
    const lineas = renglonesMtext(e.contents, h, e.width, propio > 0 ? propio : 1);
    if (!lineas.some((l) => l.t)) return null;
    const w = Math.max(...lineas.map((l) => l.w));
    const alto = h + (lineas.length - 1) * PASO * h;
    const p = e.location ?? e.position;
    const att = e.attachmentPoint || 1, col = (att - 1) % 3, fila = Math.ceil(att / 3);
    // Con ancho de párrafo, la alineación es dentro de esa caja; sin él, respecto del punto.
    const base = e.width > 0 ? e.width : w;
    const x0 = p.x - (col === 0 ? 0 : col === 1 ? base / 2 : base) + (col === 1 ? (base - w) / 2 : col === 2 ? base - w : 0);
    const y1 = fila === 1 ? p.y : fila === 2 ? p.y + alto / 2 : p.y + alto;
    return {x0, y0: y1 - alto, x1: x0 + w, y1, h};
  }
  const t = textoPlano(e.textString ?? e.contents);
  if (!t) return null;
  const w = anchoTexto(t, h) * HOLGURA * factor * (e.widthFactor > 0 ? e.widthFactor : 1);
  const alineado = (e.horizontalMode ?? 0) !== 0 || (e.verticalMode ?? 0) !== 0;
  const p = alineado && e.alignmentPoint ? e.alignmentPoint : (e.position ?? e.location);
  const hm = e.horizontalMode ?? 0, vm = e.verticalMode ?? 0;
  const x0 = hm === 2 ? p.x - w : hm === 0 ? p.x : p.x - w / 2;
  const y0 = vm === 3 ? p.y - h : vm === 2 ? p.y - h / 2 : vm === 1 ? p.y : p.y - 0.2 * h;
  return {x0, y0, x1: x0 + w, y1: y0 + (vm === 0 ? 1.2 * h : h), h};
}

// Se encima si comparten más que un roce (fracción del área del más chico). Las letras
// ocupan algo más que su altura (colas de g, y, p; acentos; subrayado): la caja suma un 25 %
// de su altura de letra del lado donde sobresale (5 % si no: un título en mayúsculas sin
// acentos), así dos renglones que se tocan cuentan como encimados. A lo
// ancho, un roce menor a 0.2 alturas de letra no cuenta (un rótulo "a.-" pegado a su nota).
export function seEncima(a, b, minimo = 0.08) {
  const h0 = a.h ?? 0, h1 = b.h ?? 0;
  a = {...a, y0: a.y0 - h0 * (a.mb ?? 0.25), y1: a.y1 + h0 * (a.ma ?? 0.25)};
  b = {...b, y0: b.y0 - h1 * (b.mb ?? 0.25), y1: b.y1 + h1 * (b.ma ?? 0.25)};
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  if (w <= 0.2 * Math.min(a.h ?? 0, b.h ?? 0) || h <= 0) return false;
  const menor = Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (b.x1 - b.x0) * (b.y1 - b.y0));
  return menor > 0 && (w * h) / menor > minimo;
}

// Achica de a poco (hasta el 70 % de su tamaño) los textos que se enciman, hasta separarlos.
// entidades: TEXT/MTEXT de un mismo espacio (un bloque o el modelo). factorDe(e): ancho de su
// estilo. Devuelve cuántos textos se achicaron y cuántos pares quedaron encimados.
export function desencimarTextos(entidades, factorDe = () => 1, {minimo = 0.7, paso = 0.94} = {}) {
  const textos = entidades.map((e) => ({e, h0: e.height})).filter(({e}) => cajaTexto(e, factorDe(e)));
  const achicados = new Set();
  for (let vuelta = 0; vuelta < 12; vuelta++) {
    const cajas = textos.map(({e}) => cajaTexto(e, factorDe(e)));
    let cambio = false;
    for (let i = 0; i < textos.length; i++) {
      for (let j = i + 1; j < textos.length; j++) {
        if (!cajas[i] || !cajas[j] || !seEncima(cajas[i], cajas[j])) continue;
        for (const k of [i, j]) {
          const t = textos[k];
          if (t.e.height > t.h0 * minimo) { t.e.height *= paso; achicados.add(t.e); cambio = true; }
        }
      }
    }
    if (!cambio) break;
  }
  const finales = textos.map(({e}) => cajaTexto(e, factorDe(e)));
  let quedan = 0;
  for (let i = 0; i < finales.length; i++) for (let j = i + 1; j < finales.length; j++) if (finales[i] && finales[j] && seEncima(finales[i], finales[j])) quedan++;
  return {achicados: achicados.size, quedan};
}

// Texto con un hueco de espacios para un símbolo dibujado aparte ("1 □ 1/4\" Ø: 1@0.05…",
// el □ es la polilínea del estribo). El ancho de los espacios cambia con la fuente: en el
// visor el hueco no coincide con el símbolo y este cae sobre el texto. Devuelve las dos
// partes y la caja del símbolo para anclarlas a sus lados, o null.
// texto: MTEXT de un renglón sin rotar; entidades: las del mismo bloque.
const TIPOS_TEXTO = /^(MTEXT|TEXT|ATTRIB|ATTDEF|DIMENSION|HATCH|MULTILEADER|LEADER)$/;
export function huecoDeSimbolo(texto, entidades) {
  if (String(texto.dxfTypeName ?? "").toUpperCase() !== "MTEXT") return null;
  const contenido = String(texto.contents ?? "");
  if (/\\[A-Za-z]|[{}]/.test(contenido)) return null;
  const m = contenido.match(/^(\s*\S.*?)\s{3,}(\S.*)$/);
  if (!m) return null;
  const caja = cajaTexto(texto);
  if (!caja) return null;
  const h = caja.h;
  let s = null;
  for (const e of entidades) {
    if (e === texto || TIPOS_TEXTO.test(String(e.dxfTypeName ?? "").toUpperCase())) continue;
    let b;
    try { b = e.geometricExtents; } catch { continue; }
    if (!b || !Number.isFinite(b.min?.x)) continue;
    const w = b.max.x - b.min.x, alto = b.max.y - b.min.y;
    if (w > 1.5 * h || alto > 1.5 * h || Math.max(w, alto) < 0.2 * h) continue;
    const cx = (b.min.x + b.max.x) / 2, cy = (b.min.y + b.max.y) / 2;
    if (cx < caja.x0 || cx > caja.x1 || cy < caja.y0 - 0.25 * h || cy > caja.y1 + 0.25 * h) continue;
    s = s ? {x0: Math.min(s.x0, b.min.x), y0: Math.min(s.y0, b.min.y), x1: Math.max(s.x1, b.max.x), y1: Math.max(s.y1, b.max.y)}
      : {x0: b.min.x, y0: b.min.y, x1: b.max.x, y1: b.max.y};
  }
  if (!s || s.x1 - s.x0 > 2 * h) return null;
  return {izquierda: m[1], derecha: m[2], simbolo: s, separacion: 0.25 * h};
}

// Renglón que sigue a otro texto en la misma línea y se corrió con espacios iniciales
// ("caso con dosificación 1:12 + 30 " y luego "              %P. G. evitandose"): en el
// visor los espacios miden otro ancho y los dos textos se pisan. Devuelve el texto sin los
// espacios, el vecino y la x donde empezaría después de él, o null. Lo seguro es unirlo al
// vecino (un solo renglón se ve bien con cualquier fuente): la x es solo para cuando no se
// puede (otro estilo o tipo); visto en el visor real, con la fuente BIL el vecino se dibuja
// más ancho que su caja medida y el renglón movido igual lo pisaba.
export function sangriaConEspacios(texto, entidades, factorDe = () => 1) {
  const tipo = String(texto.dxfTypeName ?? "").toUpperCase();
  const crudo = String(tipo === "TEXT" ? texto.textString ?? "" : texto.contents ?? "");
  const m = crudo.match(/^( {3,})(\S.*)$/s);
  if (!m || /\\P/.test(crudo)) return null;
  if (tipo === "TEXT" && ((texto.horizontalMode ?? 0) !== 0 || (texto.verticalMode ?? 0) !== 0)) return null;
  if (tipo === "MTEXT" && ((texto.attachmentPoint || 1) - 1) % 3 !== 0) return null;
  const c = cajaTexto(texto, factorDe(texto));
  if (!c) return null;
  let vecino = null, entidadVecina = null;
  for (const e of entidades) {
    if (e === texto) continue;
    const b = cajaTexto(e, factorDe(e));
    if (!b || Math.abs(b.y0 - c.y0) > 0.3 * c.h || Math.abs(b.h - c.h) > 0.3 * c.h) continue;
    if (b.x0 > c.x0 + 1e-9 || b.x1 <= c.x0) continue; // empieza antes y llega hasta el renglón
    if (!vecino || b.x1 > vecino.x1) { vecino = b; entidadVecina = e; }
  }
  if (!vecino) return null;
  return {contenido: m[2], vecino: entidadVecina, x: vecino.x1 + 0.3 * c.h};
}

// Bordes verticales (líneas y tramos de polilínea) de un bloque: [x, y0, y1].
function bordesVerticales(entidades) {
  const bordes = [];
  const tramo = (a, b) => { if (a && b && Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) > 1e-9) bordes.push([a.x, Math.min(a.y, b.y), Math.max(a.y, b.y)]); };
  for (const e of entidades) {
    const tipo = String(e.dxfTypeName ?? "").toUpperCase();
    if (tipo === "LINE") tramo(e.startPoint, e.endPoint);
    else if (/POLYLINE/.test(tipo) && Number.isInteger(e.numberOfVertices)) {
      const leer = e.getPoint3dAt ?? e.getPointAt;
      if (!leer) continue;
      const pts = Array.from({length: e.numberOfVertices}, (_, i) => leer.call(e, i));
      for (let i = 0; i + 1 < pts.length; i++) tramo(pts[i], pts[i + 1]);
      if (e.closed && pts.length > 2) tramo(pts.at(-1), pts[0]);
    }
  }
  return bordes;
}

// Texto que cruza el borde de su casilla (una línea vertical lo atraviesa: "f´c= 210kg/cm2"
// saliendo de la casilla de VIGA BORDE). Devuelve la escala (0.7–1) para que quepa sin
// mover su anclaje, o null si ya cabe o haría falta achicarlo demasiado.
export function escalaParaCasilla(texto, entidades, factor = 1, {minimo = 0.7, bordes} = {}) {
  const caja = cajaTexto(texto, factor);
  if (!caja) return null;
  const tipo = String(texto.dxfTypeName ?? "").toUpperCase();
  if (tipo === "MTEXT" && /\\P/.test(String(texto.contents ?? ""))) return null;
  // Anclaje: 0 izquierda, 1 centro, 2 derecha.
  const col = tipo === "MTEXT" ? ((texto.attachmentPoint || 1) - 1) % 3
    : (texto.horizontalMode ?? 0) === 0 ? 0 : (texto.horizontalMode ?? 0) === 2 ? 2 : 1;
  // Visto en el visor real: los TEXT se dibujan aun algo más anchos que su caja con holgura
  // ("f´c= 210kg/cm2" seguía rozando el borde: +5 % y 0.4 h de aire); los MTEXT, más angostos
  // (con la holgura entera, títulos que caben se achicaban): a ellos, un 12 % de margen.
  const ancho = tipo === "TEXT" ? (caja.x1 - caja.x0) * 1.05 : ((caja.x1 - caja.x0) / HOLGURA) * 1.12;
  const x0 = col === 0 ? caja.x0 : col === 2 ? caja.x1 - ancho : (caja.x0 + caja.x1 - ancho) / 2;
  const c = {...caja, x0, x1: x0 + ancho};
  const medio = (c.y0 + c.y1) / 2, w = c.x1 - c.x0, cx = (c.x0 + c.x1) / 2, holgura = (tipo === "TEXT" ? 0.4 : 0.15) * c.h;
  let izq = -Infinity, der = Infinity;
  for (const [x, y0, y1] of bordes ?? bordesVerticales(entidades)) {
    if (x <= c.x0 || x >= c.x1 || y0 > medio || y1 < medio) continue;
    if (x >= cx) der = Math.min(der, x - holgura);
    else izq = Math.max(izq, x + holgura);
  }
  if (der === Infinity && izq === -Infinity) return null;
  let s = 1;
  if (col === 0) { if (izq > c.x0) return null; s = (der - c.x0) / w; }
  else if (col === 2) { if (der < c.x1) return null; s = (c.x1 - izq) / w; }
  else s = Math.min((der - cx) * 2 / w, (cx - izq) * 2 / w);
  if (!(s < 1) || s < minimo) return null;
  return s;
}

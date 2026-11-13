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
  const tipo = String(e.dxfTypeName ?? "").toUpperCase();
  if (tipo !== "MTEXT" && tipo !== "TEXT") return null;
  if (Math.abs(e.rotation ?? 0) > 1e-3) return null;
  const h = e.height > 0 ? e.height : 0;
  if (!h) return null;
  if (tipo === "MTEXT") {
    const lineas = renglonesMtext(e.contents, h, e.width, 1);
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
// ocupan algo más que su altura (colas de g, y, p; acentos): cada caja suma un 25 % de su
// altura de letra arriba y abajo, así dos renglones que se tocan cuentan como encimados. A lo
// ancho, un roce menor a 0.2 alturas de letra no cuenta (un rótulo "a.-" pegado a su nota).
export function seEncima(a, b, minimo = 0.08) {
  const ma = (a.h ?? 0) * 0.25, mb = (b.h ?? 0) * 0.25;
  a = {...a, y0: a.y0 - ma, y1: a.y1 + ma};
  b = {...b, y0: b.y0 - mb, y1: b.y1 + mb};
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

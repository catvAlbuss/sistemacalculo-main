// Ubicar rótulos sin encimar: un rótulo móvil (el de un paño de losa, una llamada) busca el
// lugar libre más cercano al preferido dentro de su zona (el paño), y si no cabe achica la
// letra de a poco (hasta el 70 %). Se mide como lo dibuja el visor (cajasTexto.js), así la
// lámina sale ordenada sin que el ingeniero tenga que pedir "corrige los encimados".

import {anchoTexto} from "./rotulo.js";
import {HOLGURA, seEncima} from "./cajasTexto.js";

const PASO_RENGLON = 1.667;

// Caja de una primitiva de texto (centrada por defecto; "izq" ancla a la izquierda).
export function cajaPrimitivaTexto(p) {
  if (p?.type !== "text" || !(p.h > 0)) return null;
  const lineas = String(p.value ?? "").split("\\P");
  const w = Math.max(...lineas.map((t) => anchoTexto(t.replace(/\\[A-Za-z][^;]*;|[{}]/g, ""), p.h))) * HOLGURA;
  const alto = p.h * (1 + (lineas.length - 1) * PASO_RENGLON);
  const vertical = Math.abs(Math.abs(p.rot ?? 0) - 90) < 1;
  const [ancho, altoCaja] = vertical ? [alto, w] : [w, alto];
  const [x, y] = p.at;
  const x0 = p.align === "izq" && !vertical ? x : x - ancho / 2;
  return {x0, y0: y - altoCaja / 2, x1: x0 + ancho, y1: y + altoCaja / 2, h: p.h};
}

export const cajasDeTextos = (primitivas) => primitivas.map(cajaPrimitivaTexto).filter(Boolean);

const dentroPoligono = (p, poli) => {
  let dentro = false;
  for (let i = 0, j = poli.length - 1; i < poli.length; j = i++) {
    const a = poli[i], b = poli[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro;
  }
  return dentro;
};
const cajaDentro = (c, poli) => [[c.x0, c.y0], [c.x1, c.y0], [c.x1, c.y1], [c.x0, c.y1]].every(([x, y]) => dentroPoligono({x, y}, poli));

// valor/h: el rótulo; preferido {x, y}; zona: polígono [{x, y}] donde debe quedar (o null);
// ocupadas: cajas de lo ya dibujado; variantes: rótulos más cortos para cuando el completo no
// cabe ni achicado (paño chico: "Paño 08\PE=25CM (4 VIG.)"). Devuelve {x, y, h, valor, libre}.
export function ubicarSinEncimar({valor, h, preferido, zona = null, ocupadas = [], escalas = [1, 0.9, 0.8, 0.7], variantes = []}) {
  for (const v of [valor, ...variantes]) {
    const r = ubicarUno({valor: v, h, preferido, zona, ocupadas, escalas});
    if (r.libre) return {...r, valor: v};
  }
  return {x: preferido.x, y: preferido.y, h, valor, libre: false};
}

function ubicarUno({valor, h, preferido, zona, ocupadas, escalas}) {
  for (const s of escalas) {
    const hh = h * s;
    const base = cajaPrimitivaTexto({type: "text", value: valor, h: hh, at: [0, 0]});
    const w = base.x1 - base.x0, a = base.y1 - base.y0;
    const paso = Math.max(hh * 0.5, 0.02);
    // Espiral de candidatos alrededor del preferido, del más cercano al más lejano.
    const candidatos = [];
    for (let i = -14; i <= 14; i++) for (let j = -14; j <= 14; j++) candidatos.push({x: preferido.x + i * paso, y: preferido.y + j * paso, d: Math.hypot(i, j * 1.3)});
    candidatos.sort((p, q) => p.d - q.d);
    for (const c of candidatos) {
      const caja = {x0: c.x - w / 2, y0: c.y - a / 2, x1: c.x + w / 2, y1: c.y + a / 2, h: hh};
      if (zona && !cajaDentro(caja, zona)) continue;
      if (ocupadas.some((o) => seEncima(caja, o, 0))) continue;
      return {x: c.x, y: c.y, h: hh, libre: true};
    }
  }
  return {x: preferido.x, y: preferido.y, h, libre: false};
}

// Detalles estándar del despacho: los que el ingeniero repite iguales en todos sus módulos y que
// llenan la lámina alrededor de las plantas (nudo viga-columna, ubicación y longitud de empalmes,
// estribos, recubrimientos viga-losa, encuentros en planta, isométrico del aligerado, leyenda).
// No dependen del proyecto: se copian de su biblioteca (scripts/agente/extraer-biblioteca.mjs, tipo
// "estandar", publicada sin datos del cliente) y solo se reescribe el espesor del aligerado.
//
// Cada pieza viene en coordenadas locales; × parametros.factor da unidades de lámina
// (1 = 1 m a 1/50), el tamaño con el que el ingeniero la dibujó en su lámina.

import {anchoTexto} from "./rotulo.js";

const r4 = (v) => Math.round(v * 10000) / 10000;

// Caja aproximada de un texto según su punto de inserción (1 arriba-izq … 9 abajo-der).
function cajaDeTexto(p) {
  const w = anchoTexto(p.value, p.h), h = p.h, a = Number.isInteger(p.ancla) ? p.ancla : 5;
  const col = (a - 1) % 3, fila = Math.floor((a - 1) / 3);
  const x0 = p.at[0] - (col * w) / 2, y1 = p.at[1] + (fila * h) / 2;
  return {x0, x1: x0 + w, y0: y1 - h, y1};
}
const chocan = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
// En el DWG del ingeniero las notas largas tienen ancho fijo (saltan de línea); copiadas quedan en
// una línea y pueden tocarse: la que choca sube de a media altura hasta quedar libre.
function separarNotas(prim) {
  const textos = prim.filter((p) => p.type === "text" && !p.rot);
  const puestas = [];
  for (const t of textos.sort((a, b) => a.at[1] - b.at[1])) {
    for (let i = 0; i < 12 && puestas.some((c) => chocan(c, cajaDeTexto(t))); i++) t.at = [t.at[0], r4(t.at[1] + t.h * 0.6)];
    puestas.push(cajaDeTexto(t));
  }
  return prim;
}

// Familia de lámina donde va cada detalle (la del ingeniero): los de columna con la cimentación
// (allí va el cuadro de columnas), los de losa con el aligerado.
export const FAMILIA_ESTANDAR = {
  refuerzo: "cimentacion", empalmes: "cimentacion", estribos: "cimentacion", encuentros: "cimentacion",
  leyenda: "cimiento", isometrico: "losa", recubrimientos: "losa", canaleta: "portico",
  aligerado: "losa", ladrillo: "portico",
};
// Orden de prioridad: lo que más aporta primero (si no cabe todo, quedan los primeros).
const ORDEN = ["aligerado", "ladrillo", "refuerzo", "empalmes", "isometrico", "estribos", "recubrimientos", "encuentros", "canaleta", "leyenda"];

const tamano = (p) => {
  const c = p.parametros?.caja, f = p.parametros?.factor;
  return c && f > 0 ? {w: (c.x1 - c.x0) * f, h: (c.y1 - c.y0) * f} : null;
};

// Una pieza por detalle: la versión que más se repite (mismo tamaño en la lámina, al decímetro)
// y, entre ellas, la más completa. Fuera las que no entran en un cuarto de lámina.
// Tamaño máximo por detalle (unidades de lámina): la canaleta es un corte chico; una "canaleta"
// del tamaño de un pórtico es el pórtico donde va anotada.
const MAXIMO = {canaleta: {w: 4, h: 4}};
export function elegirEstandar(piezas, {maxW = 14, maxH = 12} = {}) {
  const porClave = new Map();
  for (const p of piezas ?? []) {
    const clave = p.parametros?.clave, t = tamano(p), m = MAXIMO[clave] ?? {w: maxW, h: maxH};
    if (!clave || !t || t.w > m.w || t.h > m.h || !(p.entidades?.length >= 8)) continue;
    (porClave.get(clave) ?? porClave.set(clave, []).get(clave)).push({p, t, firma: `${Math.round(t.w * 10)}x${Math.round(t.h * 10)}`});
  }
  const elegidas = [];
  for (const clave of ORDEN) {
    const ps = porClave.get(clave);
    if (!ps?.length) continue;
    const veces = new Map();
    for (const x of ps) veces.set(x.firma, (veces.get(x.firma) ?? 0) + 1);
    ps.sort((a, b) => veces.get(b.firma) - veces.get(a.firma) || b.p.entidades.length - a.p.entidades.length);
    elegidas.push({clave, pieza: ps[0].p});
  }
  return elegidas;
}

// Texto del detalle con los datos de este proyecto (espesor del aligerado: "H=0.20").
function reescribir(texto, {espesor} = {}) {
  let t = String(texto ?? "");
  if (espesor > 0) t = t.replace(/\b([Hh]\s*=\s*)0[.,]\d{2}\b/g, (_, a) => `${a}${Number(espesor).toFixed(2)}`);
  return t;
}

// Pieza → contenido de lámina {titulo, primitivas, marco} en unidades de lámina.
export function contenidoEstandar(pieza, datos = {}) {
  const f = pieza.parametros?.factor ?? 1, c = pieza.parametros?.caja;
  if (!c) return null;
  const T = (q) => [r4((q.x - c.x0) * f), r4((q.y - c.y0) * f)];
  // Vértices del dibujo: una letra suelta lejos de todo (> 6 alturas) es un resto de la lámina
  // de origen, no del detalle.
  const vertices = (pieza.entidades ?? []).flatMap((e) => e.puntos ?? (e.tipo === "circulo" && e.centro ? [e.centro] : []));
  const suelto = (e) => String(e.texto).trim().length <= 2 && vertices.length
    && Math.min(...vertices.map((q) => Math.hypot(q.x - e.centro.x, q.y - e.centro.y))) > 6 * (e.alto ?? 0.1);
  const prim = [];
  for (const e of pieza.entidades ?? []) {
    const base = {layer: e.capa ?? "0", ...(Number.isInteger(e.color) ? {color: e.color} : {})};
    if (e.tipo === "texto") {
      const value = reescribir(e.texto, datos);
      if (!value.trim() || !e.centro || suelto(e)) continue;
      prim.push({type: "text", ...base, at: T(e.centro), value, h: r4((e.alto ?? 0.1) * f), rot: e.rot ?? e.rotacion ?? 0, ...(Number.isInteger(e.ancla) ? {ancla: e.ancla} : {})});
    } else if (e.tipo === "achurado" && e.puntos?.length >= 3) {
      // Concreto, relleno, ladrillo… como los dibujó el ingeniero (patrón y escala del suyo).
      prim.push({type: "hatch", ...base, points: e.puntos.map(T), ...(e.solido ? {solido: true} : {patron: e.patron ?? "ANSI31", escala: r4(((e.escalaMil ?? 1000) / 1000) * f), angulo: e.angulo ?? 0})});
    } else if (e.tipo === "circulo" && e.centro) {
      prim.push({type: "circle", ...base, c: T(e.centro), r: r4(e.radio * f)});
    } else if ((e.tipo === "linea" || e.tipo === "poli") && e.puntos?.length >= 2) {
      const pts = e.puntos.map(T);
      if (e.tipo === "linea" && pts.length === 2) prim.push({type: "line", ...base, a: pts[0], b: pts[1]});
      else prim.push({type: "pline", ...base, points: pts, closed: Boolean(e.cerrada)});
    }
  }
  if (!prim.length) return null;
  separarNotas(prim);
  return {titulo: pieza.titulo, primitivas: prim, marco: {x0: 0, y0: 0, x1: r4((c.x1 - c.x0) * f), y1: r4((c.y1 - c.y0) * f)}, sinEscala: true, estandar: true};
}

// Lista para la composición: {id, tipo: 'estandar', familia, contenido}; van al hueco libre
// de su lámina (o de otra) y nunca abren una lámina solos.
// conCanaleta: el techo la lleva (dos aguas o "CANALETA" anotada en la arquitectura).
export function detallesEstandar(piezas, datos = {}, {conLosa = true, conCanaleta = false} = {}) {
  return elegirEstandar(piezas)
    .filter(({clave}) => (conLosa || FAMILIA_ESTANDAR[clave] !== "losa") && (conCanaleta || clave !== "canaleta"))
    .map(({clave, pieza}) => ({id: `estandar-${clave}`, clave, tipo: "estandar", familia: FAMILIA_ESTANDAR[clave] ?? null, contenido: contenidoEstandar(pieza, datos)}))
    .filter((d) => d.contenido);
}

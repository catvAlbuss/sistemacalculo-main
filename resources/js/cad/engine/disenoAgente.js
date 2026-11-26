// engine/disenoAgente.js — del diseño de columnas de Análisis Estructural de vuelta a las láminas del
// agente (NovaCad). Puro: recibe los resultados del diseño (rcColumnDesignResults) y arma, por TIPO
// de columna (C1, C2, PL1… del cuadro de columnas), el armado verificado con su ratio D/C. Lo guarda
// el mixin en localStorage (DISENO_DEL_AGENTE) y lo lee el panel del agente al rehacer las láminas.

export const DISENO_DEL_AGENTE = "novacad:diseno-analisis";
const redondea = (v, d) => Math.round((Number(v) || 0) * 10 ** d) / 10 ** d;

// Varillas de un patrón "R-n2-n3" según la forma (ver ingenieria/diseno/patronColumna.js).
export function totalDePatron({shape, n2, n3}) {
  const s = String(shape || "rect").toLowerCase();
  if (s === "l" || s === "lconc") return 2 * n2 + 2 * n3 - 1;
  if (s === "tee" || s === "t") return 2 * n2 + 2 * n3;
  return 2 * n2 + 2 * n3 - 4;
}

// El menor armado de `opciones` (ordenadas de menos a más acero) con ratio ≤ limite, con pocas
// llamadas al motor (~5 s cada una y, en el servidor, 30 pedidos por minuto): empieza en el que
// pide el acero proporcional al ratio (n·ratio/limite), sube si no cumple y baja mientras cumpla.
// `evaluar(opcion)` devuelve el ratio (o lanza si el motor falla). Devuelve {opcion, ratio, llamadas}
// con opcion = null si ninguna cumple (ratio del mayor probado).
export async function buscarArmado(opciones, evaluar, {nAntes, ratioAntes, limite = 1} = {}) {
  if (!opciones.length) return {opcion: null, ratio: ratioAntes, llamadas: 0};
  const meta = (nAntes * ratioAntes) / limite;
  let i = opciones.findIndex((o) => o.total >= meta);
  if (i < 0) i = opciones.length - 1;
  const ratios = new Map();
  let llamadas = 0;
  const ratioEn = async (k) => {
    if (!ratios.has(k)) { ratios.set(k, await evaluar(opciones[k])); llamadas++; }
    return ratios.get(k);
  };
  if (await ratioEn(i) > limite) {
    while (i + 1 < opciones.length) { i++; if (await ratioEn(i) <= limite) break; }
    if (ratios.get(i) > limite) return {opcion: null, ratio: ratios.get(i), mayor: opciones[i], llamadas};
  }
  while (i > 0 && await ratioEn(i - 1) <= limite) i--;
  return {opcion: opciones[i], ratio: ratios.get(i), llamadas};
}

// Ratio D/C gobernante de una columna diseñada (base o cabeza).
export const ratioDe = (c) => Math.max(Number(c?.check?.base?.ratio) || 0, Number(c?.check?.top?.ratio) || 0);

// Tipo del cuadro desde el nombre de la sección del agente ("C1-43X43" → "C1", "PL1-126X170X27" → "PL1").
export const tipoDeSeccion = (nombre) => {
  const m = /^([A-Za-z]+\d*)-\d+X\d+/i.exec(String(nombre || ""));
  return m ? m[1].toUpperCase() : null;
};

// Por tipo: el armado (varillas) que cumple en TODAS sus columnas y el peor ratio. Si alguna columna
// necesitó más acero (propuesta), el tipo entero lo lleva: el cuadro dibuja un armado por tipo.
export function disenoPorTipo(columnas) {
  const tipos = {};
  for (const c of columnas || []) {
    const tipo = tipoDeSeccion(c.sectionName);
    if (!tipo) continue;
    const t = (tipos[tipo] ??= {tipo, secciones: [], columnas: 0, n: 0, ratio: 0, ratioOriginal: 0, aumentado: false, sinDiseno: 0, sinSolucion: []});
    if (!t.secciones.includes(c.sectionName)) t.secciones.push(c.sectionName);
    t.columnas++;
    if (c.unsupported || !c.geometry) { t.sinDiseno++; continue; }
    const original = totalDePatron(c.geometry);
    const p = c.propuesta;
    const n = p && !p.sinSolucion ? p.n : original;
    const ratio = p && !p.sinSolucion ? p.ratio : ratioDe(c);
    t.n = Math.max(t.n, n);
    t.nOriginal = Math.max(t.nOriginal ?? 0, original);
    t.ratio = Math.max(t.ratio, ratio);
    t.ratioOriginal = Math.max(t.ratioOriginal, ratioDe(c));
    if (p && !p.sinSolucion) t.aumentado = true;
    if (p?.sinSolucion) t.sinSolucion.push(c.label);
    t.barra = c.barra ?? t.barra ?? '5/8"';
    t.cuantia = Math.max(t.cuantia ?? 0, p && !p.sinSolucion ? p.cuantia : 0);
  }
  for (const t of Object.values(tipos)) {
    t.ratio = Math.round(t.ratio * 100) / 100;
    t.ratioOriginal = Math.round(t.ratioOriginal * 100) / 100;
    t.cumple = t.n > 0 && t.ratio <= 1 && !t.sinSolucion.length;
  }
  return tipos;
}

// Lo que viaja al agente: diseño por tipo y el resumen de la revisión E.030 (sin datos del cliente).
// reacciones: [{x, y, pd, pl, ps}] por apoyo, en t y en las coordenadas del modelo (metros).
export function paqueteParaAgente({columnas, revision = null, modelo = "", reacciones = [], fecha = new Date().toISOString()}) {
  const tipos = disenoPorTipo(columnas);
  const r = revision?.resumen;
  return {
    version: 1, fecha, modelo,
    columnas: tipos,
    revision: r ? {texto: r.texto, noCumple: r.noCumple ?? 0, acciones: r.acciones ?? []} : null,
    reacciones: (reacciones || []).map((r) => ({x: redondea(r.x, 3), y: redondea(r.y, 3), pd: redondea(r.pd, 2), pl: redondea(r.pl, 2), ps: redondea(r.ps, 2)})),
    derivas: (revision?.verificaciones || []).filter((v) => /deriva/i.test(v.titulo)).map((v) => ({grupo: v.grupo, valor: v.valor, estado: v.estado})),
  };
}

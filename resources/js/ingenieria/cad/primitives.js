// Primitivas geométricas en metros que producen los skills. Son datos planos:
// se prueban sin CAD y el ejecutor (cadExecutor.js) las convierte en entidades.

// Capas estándar de Predim2 (prefijo A = arquitectura, E = estructuras).
export const L = {
  MUROS: "A-MUROS",
  PUERTAS: "A-PUERTAS",
  VENTANAS: "A-VENTANAS",
  TEXTOS: "A-TEXTOS",
  COTAS: "A-COTAS",
  COTAS_E: "E-COTAS",
  NIVELES: "E-NIVELES",
  ESTRIBOS: "E-ACERO",
  EJES: "E-EJES",
  COLUMNAS: "E-COLUMNAS",
  COLUMNAS_ID: "E-COLUMNAS-ID",
  ZAPATAS: "E-ZAPATAS",
  VIGAS_CIM: "E-VIGAS-CIMENTACION",
  CIMIENTO: "E-CIMIENTO-CORRIDO",
  PLATEA: "E-PLATEA",
  LAMINA: "E-LAMINA",
  VIGAS: "E-VIGAS",
  ALIGERADO: "E-ALIGERADO",
  MALLA: "E-MALLA",          // malla de la platea
  MUROS_E: "E-MUROS",        // muros de la arquitectura sobre el cimiento corrido
  VIGUETAS: "E-VIGUETAS",    // símbolo de viguetas del aligerado
  COBERTURA: "E-COBERTURA",  // cobertura de techo (aluzinc TR4) y canaletas
  // Capas semánticas que el estilo del despacho (estiloLaminas.js) lleva a sus propias capas.
  COLUMNETAS: "E-COLUMNETAS",   // columnetas de confinamiento
  CORTE: "E-CORTE",             // marcas de corte (trazo y flecha)
  CODIGOS: "E-CODIGOS",         // códigos pa, pb… y números de corte
  TEXTO: "E-TEXTO",             // rótulos de elementos (Cimiento corrido, V(0.25x0.40)…)
  TEXTO_LOSA: "E-TEXTO-LOSA",   // LOSA ALIGERADA, Paño 01
  LETRAS: "E-LETRAS",           // CANALETA
  TITULO: "E-TITULO",           // títulos de los planos y rótulos grandes
  CUADROS: "E-CUADROS",         // líneas de los cuadros
  ACERO_LONG: "E-ACERO-LONG",   // varillas longitudinales en elevación
  ACHURADO: "E-ACHURADO",       // achurados (concreto, muros, canaletas)
};

// Color ACI de cada capa.
export const LAYER_COLORS = {
  [L.MUROS]: 7, [L.PUERTAS]: 3, [L.VENTANAS]: 4, [L.TEXTOS]: 2, [L.COTAS]: 1, [L.EJES]: 8, [L.COLUMNAS]: 5, [L.COLUMNAS_ID]: 5, [L.ZAPATAS]: 6, [L.VIGAS_CIM]: 3, [L.CIMIENTO]: 30, [L.PLATEA]: 6, [L.LAMINA]: 2, [L.VIGAS]: 3, [L.ALIGERADO]: 8, [L.COTAS_E]: 1, [L.NIVELES]: 2, [L.ESTRIBOS]: 1,
  [L.MALLA]: 8, [L.MUROS_E]: 7, [L.VIGUETAS]: 4, [L.COBERTURA]: 3,
  [L.COLUMNETAS]: 140, [L.CORTE]: 1, [L.CODIGOS]: 3, [L.TEXTO]: 7, [L.TEXTO_LOSA]: 9, [L.LETRAS]: 7, [L.TITULO]: 7, [L.CUADROS]: 253, [L.ACERO_LONG]: 4, [L.ACHURADO]: 8,
};

export const line = (layer, a, b) => ({type: "line", layer, a, b});
export const pline = (layer, points, closed = false) => ({type: "pline", layer, points, closed});
export const rect = (layer, x0, y0, x1, y1) => pline(layer, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true);
export const circle = (layer, c, r) => ({type: "circle", layer, c, r});
// Ángulos en radianes, sentido antihorario de a0 a a1.
export const arc = (layer, c, r, a0, a1) => ({type: "arc", layer, c, r, a0, a1});
// Texto centrado (o alineado a la izquierda con align "izq", apoyado en su base);
// "\P" separa renglones (MTEXT). rot en grados.
export const text = (layer, at, value, h, rot = 0, align = "centro") => ({type: "text", layer, at, value, h, rot, ...(align === "centro" ? {} : {align})});
// Achurado de un contorno cerrado: patrón del AutoCAD (ANSI31, AR-CONC…) o sólido.
// escala: la del patrón en metros de dibujo; angulo en grados.
export const hatch = (layer, points, {patron = "ANSI31", escala = 0.02, angulo = 0, solido = false} = {}) => ({type: "hatch", layer, points, patron, escala, angulo, solido});

// Cota alineada entre a y b, desplazada `offset` hacia la izquierda del sentido a→b:
// líneas de extensión, línea de cota con marcas a 45° y el valor en metros.
// etiqueta: texto de la cota si el dibujo está a otra escala que la medida real.
export function cota(layer, a, b, offset, h, etiqueta = null) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const n = [(-dy / l) * offset, (dx / l) * offset], u = [dx / l, dy / l];
  const pa = [a[0] + n[0], a[1] + n[1]], pb = [b[0] + n[0], b[1] + n[1]];
  const t = h * 0.35, marca = (p) => line(layer, [p[0] - (u[0] - u[1]) * t, p[1] - (u[1] + u[0]) * t], [p[0] + (u[0] - u[1]) * t, p[1] + (u[1] + u[0]) * t]);
  const sobre = Math.sign(offset || 1) * h * 0.7;
  let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (ang > 90) ang -= 180; else if (ang <= -90) ang += 180;
  return [
    line(layer, a, [pa[0] + (n[0] / (Math.abs(offset) || 1)) * h * 0.4, pa[1] + (n[1] / (Math.abs(offset) || 1)) * h * 0.4]),
    line(layer, b, [pb[0] + (n[0] / (Math.abs(offset) || 1)) * h * 0.4, pb[1] + (n[1] / (Math.abs(offset) || 1)) * h * 0.4]),
    line(layer, pa, pb), marca(pa), marca(pb),
    text(layer, [(pa[0] + pb[0]) / 2 + (-u[1]) * sobre, (pa[1] + pb[1]) / 2 + u[0] * sobre], etiqueta ?? l.toFixed(2), h, Math.round(ang * 10) / 10),
  ];
}

export function bounds(primitivas) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = ([x, y], pad = 0) => { x0 = Math.min(x0, x - pad); y0 = Math.min(y0, y - pad); x1 = Math.max(x1, x + pad); y1 = Math.max(y1, y + pad); };
  for (const p of primitivas) {
    if (p.type === "line") { add(p.a); add(p.b); }
    else if (p.type === "pline" || p.type === "hatch") p.points.forEach((pt) => add(pt));
    else if (p.type === "circle" || p.type === "arc") add(p.c, p.r);
    else if (p.type === "text") add(p.at);
  }
  return {x0, y0, x1, y1};
}

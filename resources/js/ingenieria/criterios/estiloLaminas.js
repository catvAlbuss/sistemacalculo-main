// Estilo de dibujo del despacho: capas y colores con que el ingeniero dibuja cada cosa
// en sus láminas (medido en el expediente de referencia, módulo XIV, por bloque:
// CIMENTACION14, CIMIE-CORR14, ALIGERADO, CUADRO COLUMNAS y pórticos c1…c4).
//
// Los planos se generan con capas semánticas (primitives.js → L); aquí se llevan a la
// capa y al color del despacho según el tipo de plano y de entidad. Para otro despacho
// basta con otra tabla. Color 256 = el de la capa (PorCapa).

import {L} from "../cad/primitives.js";

// Colores ACI de las capas del despacho (para crearlas si el dibujo no las tiene).
export const CAPAS_DESPACHO = {
  "0": 7, "49. EJES.": 152, "COTAS & TEXTOS": 131, "Texto": 7, ".D1 Texto": 7, ".D1 Texto 01": 3, ".D1 cotas": 1, ".D1 Corte": 1,
  ".N1 Columna amarre": 140, ".N1 muros bajos": 40, ".N1 Muros Altos": 220, "viguetas": 4, "TEXT": 9, "Letras": 21, "SGE_0.05": 8,
  "Tierra de chacr": 254, "P-Columnas-existentes": 8, "COLUMNAS Y PLACAS": 255, "CONCRETO": 152, "2_Acero EV": 4, ".N1 Acero Estribo": 254,
  ".N1 Cimiento Corrido": 253, "LADRILLO": 30, ".D1 Ejes": 251, "SGE_TEXTO-CHICOS-03": 3, ".N1 Cuadros": 253, "AC Ø 3 -4": 3, "CIMIENTO ARMADO": 170,
  // Datos del rótulo.
  NCAMINO1: 10, CAPA8: 210, ".": 7,
};

// regla: capa semántica → {geo, texto, circulo, achurado} con {capa, color}.
const C = (capa, color = 256) => ({capa, color});

// Plantas: cimentación/platea, cimiento corrido y aligerado.
const PLANTA = {
  [L.EJES]: {geo: C("49. EJES."), circulo: C("49. EJES."), texto: C("0")},
  [L.COLUMNAS]: {geo: C("0", 5), achurado: C("SGE_0.05", 8), solido: C("0")},
  [L.COLUMNAS_ID]: {texto: C("COTAS & TEXTOS", 7)},
  [L.COLUMNETAS]: {geo: C(".N1 Columna amarre"), achurado: C(".N1 Columna amarre")},
  [L.CODIGOS]: {texto: C(".D1 Texto 01")},
  [L.CORTE]: {geo: C(".D1 Corte"), achurado: C(".D1 Corte")},
  [L.COTAS_E]: {geo: C("0", 142), texto: C("0", 2)},
  [L.PLATEA]: {geo: C("0", 6), texto: C(".D1 Texto")},
  [L.MALLA]: {geo: C("0", 6)},
  [L.ESTRIBOS]: {texto: C(".D1 cotas", 5), geo: C(".D1 cotas", 5)},
  [L.VIGAS_CIM]: {geo: C("0", 4), texto: C("Texto")},
  [L.ZAPATAS]: {geo: C("0", 6), texto: C("Texto")},
  [L.CIMIENTO]: {geo: C("0"), texto: C("Texto"), achurado: C(".N1 muros bajos")},
  [L.MUROS_E]: {geo: C("0"), achurado: C(".N1 muros bajos")},
  [L.VIGAS]: {geo: C("0", 4), texto: C("Texto")},
  [L.VIGUETAS]: {geo: C("viguetas", 2), texto: C(".D1 Texto")},
  [L.ALIGERADO]: {geo: C(".N1 Muros Altos")},
  [L.TEXTO]: {texto: C("Texto")},
  [L.TEXTO_LOSA]: {texto: C("TEXT")},
  [L.LETRAS]: {texto: C("Letras", 7)},
  [L.ACHURADO]: {achurado: C("Tierra de chacr")},
  [L.TITULO]: {texto: C(".D1 Texto"), geo: C(".D1 Texto")},
  [L.LAMINA]: {geo: C("0"), texto: C("Texto")},
};

// Pórticos (elevaciones).
const PORTICO = {
  [L.EJES]: {geo: C(".D1 Ejes"), circulo: C("49. EJES."), texto: C("0")},
  [L.COLUMNAS]: {geo: C("COLUMNAS Y PLACAS"), achurado: C("CONCRETO")},
  [L.COLUMNAS_ID]: {texto: C(".N1 Cimiento Corrido")},
  [L.ESTRIBOS]: {geo: C(".N1 Acero Estribo"), circulo: C("2_Acero EV"), texto: C(".D1 Texto")},
  [L.ACERO_LONG]: {geo: C("2_Acero EV")},
  [L.PLATEA]: {geo: C("CONCRETO"), texto: C(".D1 Texto"), achurado: C("CONCRETO")},
  [L.CIMIENTO]: {geo: C("CONCRETO"), texto: C(".D1 Texto"), achurado: C("CONCRETO")},
  [L.ZAPATAS]: {geo: C("CONCRETO"), texto: C(".D1 Texto")},
  [L.MUROS_E]: {geo: C(".N1 Muros Altos"), texto: C(".D1 Texto"), achurado: C("LADRILLO")},
  [L.VIGAS]: {geo: C("COLUMNAS Y PLACAS"), texto: C(".D1 Texto")},
  [L.ALIGERADO]: {geo: C("CONCRETO")},
  [L.COBERTURA]: {geo: C("SGE_TEXTO-CHICOS-03"), texto: C("SGE_TEXTO-CHICOS-03")},
  [L.NIVELES]: {geo: C(".D1 cotas"), texto: C(".D1 cotas")},
  [L.COTAS_E]: {geo: C("0", 142), texto: C("0", 2)},
  [L.LAMINA]: {geo: C("0"), texto: C(".D1 Texto")},
  [L.TEXTO]: {texto: C(".D1 Texto")},
};

// Cuadros de columnas y columnetas.
const CUADRO = {
  [L.LAMINA]: {geo: C(".N1 Cuadros"), texto: C(".D1 Texto")},
  [L.CUADROS]: {geo: C(".N1 Cuadros")},
  [L.COLUMNAS]: {geo: C("0")},
  [L.ESTRIBOS]: {geo: C("AC Ø 3 -4"), circulo: C("CIMIENTO ARMADO")},
  [L.COTAS_E]: {geo: C(".D1 cotas"), texto: C(".D1 cotas")},
};

export const ESTILOS = {planta: PLANTA, portico: PORTICO, cuadro: CUADRO};

const tipoDe = (p) => (p.type === "text" ? "texto" : p.type === "circle" ? "circulo" : p.type === "hatch" ? "achurado" : "geo");

// Lleva cada primitiva a la capa y al color del despacho. Lo que la tabla no conoce
// queda en su capa semántica (con el color de LAYER_COLORS).
export function aplicarEstilo(primitivas, estilo = "planta") {
  const tabla = ESTILOS[estilo] ?? PLANTA;
  return primitivas.map((p) => {
    const regla = tabla[p.layer];
    const destino = regla && ((p.type === "hatch" && p.solido && regla.solido) || regla[tipoDe(p)] || (p.type === "circle" ? regla.geo : null));
    if (!destino) return p;
    // Color explícito: el del despacho aunque el dibujo del cliente tenga una capa
    // con el mismo nombre en otro color.
    const color = destino.color !== 256 ? destino.color : CAPAS_DESPACHO[destino.capa];
    return {...p, layer: destino.capa, ...(color !== undefined ? {color} : {})};
  });
}

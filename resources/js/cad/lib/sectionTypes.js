// resources/js/cad/lib/sectionTypes.js
//
// El TIPO de una sección se escribe de varias formas según de dónde venga, y
// eso ya causó bugs silenciosos. Acá está la traducción, en un solo lugar.
//
// Las tres grafías que conviven:
//   - `"L"`      — lo que pone el importador de .e2k, el renderer 2D/3D, el
//                  exportador y el diseño RC. Es la CANÓNICA.
//   - `"lconc"`  — el valor del radio del formulario de secciones. Existe para
//                  no chocar con `"angle"`, que es el angular de ACERO.
//   - `"circular"` — alias del importador para `"circle"`.
//
// El bug que destapó esto: `saveSection` guardaba el valor del RADIO tal cual,
// así que una L creada a mano en la app quedaba con `type: "lconc"`. El
// renderer pregunta `type === "l"` y el diseñador de armado pregunta
// `tipoSec === "l"`, de modo que esa L no se dibujaba como L ni se podía armar
// — caía a rectángulo sin decir nada. Las L importadas del .e2k sí funcionaban,
// que es justo lo que hacía difícil verlo.

/** El tipo en su grafía canónica, en minúsculas: "l", "tee", "rect", "circle"... */
export function tipoCanonico(type) {
  const t = String(type || "").trim().toLowerCase();
  if (t === "lconc") return "l";
  if (t === "circular") return "circle";
  return t;
}

/**
 * ¿El diseñador de armado sabe armar esta forma?
 *
 * Rectangular (grilla n2×n3), circular (anillo C-n) y las poligonales L y T
 * (patrón R-n2-n3 repartido pata por pata, igual que el diálogo Reinforcement
 * Data de ETABS — ver `etabsPolygonBarPositions` en lib/sectionPolygon.js).
 * Quedan afuera las de acero y las "general"/Section Designer, que no tienen
 * geometría de armado definida.
 */
export function soportaArmadoColumna(type) {
  return ["rect", "circle", "l", "tee"].includes(tipoCanonico(type));
}

/**
 * ¿El armado de VIGA (As superior/inferior) aplica a esta forma?
 *
 * Solo rectangular. No es una limitación del formulario sino del cálculo que
 * hay detrás: `_beamMprNm` usa el bloque `0.85·f'c·b` y el As_mín se mide sobre
 * `bw`, las dos cosas escritas para una sección rectangular. En una T con el
 * ala comprimida `b` sería el ancho del ala pero el As_mín sigue yendo sobre el
 * alma, y usando un solo ancho para las dos cosas el mínimo sale inflado. Hasta
 * que el diseñador distinga ala de alma, la T no entra.
 *
 * La circular tampoco: un As superior/inferior no significa nada ahí (antes el
 * botón se habilitaba para circulares, que era el error opuesto).
 */
export function soportaArmadoViga(type) {
  return tipoCanonico(type) === "rect";
}

/** Del tipo guardado al valor del radio del formulario. */
export function tipoDeFormulario(type) {
  const t = tipoCanonico(type);
  if (t === "l") return "lconc";
  if (t === "circle") return "circle";
  return type || "wf";
}

/** Del valor del radio del formulario al tipo que se GUARDA. */
export function tipoGuardado(sectionType) {
  const t = String(sectionType || "").trim().toLowerCase();
  if (t === "lconc") return "L";   // como lo escriben el importador y el export
  return sectionType;
}

/** Nombre legible de la forma, para mensajes y tooltips. */
export function nombreDeForma(type) {
  return {
    rect: "rectangular",
    circle: "circular",
    l: "L",
    tee: "T",
  }[tipoCanonico(type)] || String(type || "");
}

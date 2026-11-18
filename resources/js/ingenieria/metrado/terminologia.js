// Terminología del despacho para las filas del metrado: cómo se llama cada elemento en la
// planilla (la que revisa el cliente con su Excel). Los nombres por defecto salen de la planilla
// del ingeniero del módulo de referencia XIV; si el especialista renombra una fila en la vista
// previa, el agente aprende el nombre para ese tipo de elemento y lo usa en todos los planos.
//
// {variables}: n (número), eje, tipo, codigo. Ej.: "Eje {eje}" → "Eje Y´".

export const TERMINOS = {
  platea: {nombre: "Zapata corrida", etiqueta: "Platea (losa de cimentación)"},      // planilla: "Zapata Corrida 1"; plano: "ZAPATA CORRIDA Hz = 0.70 m"
  zapata: {nombre: "Zapata {n}", etiqueta: "Zapata aislada"},
  cimientoEje: {nombre: "Eje {eje}", etiqueta: "Tramo de cimiento corrido sobre un eje"}, // planilla: "Eje Y'", "Eje Z'"
  cimiento: {nombre: "Cimiento corrido {n}", etiqueta: "Tramo de cimiento corrido fuera de los ejes"},
  sobrecimientoEje: {nombre: "Eje {eje}", etiqueta: "Tramo de sobrecimiento sobre un eje"},
  sobrecimiento: {nombre: "Tramo {n}", etiqueta: "Tramo de sobrecimiento fuera de los ejes"},
  columna: {nombre: "Columna {tipo}", etiqueta: "Columna"},
  areaInterior: {nombre: "Área interior", etiqueta: "Área interior (piso)"},
};

const llenar = (plantilla, vars = {}) => String(plantilla).replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? vars[k] === 0 ? String(vars[k]) : m));

// Nombre de un elemento con la terminología aprendida (si la hay) o la del despacho.
export function nombreElemento(termino, vars = {}, aprendidos = {}) {
  return llenar(aprendidos[termino] ?? TERMINOS[termino]?.nombre ?? termino, vars);
}

// Plantilla a partir del nombre que escribió el especialista: los valores de la fila vuelven a
// ser variables ("Eje Y´" con eje = "Y´" → "Eje {eje}"), así sirve para las demás filas.
export function plantillaDesdeEdicion(texto, vars = {}) {
  let t = String(texto ?? "").trim();
  for (const [k, v] of Object.entries(vars).sort((a, b) => String(b[1]).length - String(a[1]).length)) {
    if (v === null || v === undefined || String(v) === "") continue;
    t = t.split(String(v)).join(`{${k}}`);
  }
  return t;
}

// Terminología aprendida: el último nombre que el despacho le dio a cada tipo de elemento.
export function terminosAprendidos(eventos = []) {
  const t = {};
  for (const e of eventos) if (e?.clave === "termino" && e.termino in TERMINOS && typeof e.valor === "string" && e.valor.trim()) t[e.termino] = e.valor.trim();
  return t;
}

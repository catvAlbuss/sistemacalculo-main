// Datos del proyecto que NO son reglas del despacho: cambian con el sitio y el uso.
// Los llena el ingeniero en el panel (▤ Datos del proyecto) y el agente los usa en
// las láminas. Si faltan, se usa el criterio por defecto y se avisa.
//
// - Hz y Df: del estudio de suelos (0.60/2.50 en los módulos 3 y 09; 0.70/2.00 en el 14).
// - Zona, perfil de suelo y categoría: parámetros sísmicos de la E.030 (Z, U, S, Tp, TL).
// - Niveles: número de pisos del edificio.

import {CRITERIOS} from "./criteriosEstructurales.js";

// E.030-2018, tablas 1, 3, 4 y 5.
export const E030 = {
  Z: {1: 0.10, 2: 0.25, 3: 0.35, 4: 0.45},
  S: { // [zona][suelo]
    4: {S0: 0.80, S1: 1.00, S2: 1.05, S3: 1.10},
    3: {S0: 0.80, S1: 1.00, S2: 1.15, S3: 1.20},
    2: {S0: 0.80, S1: 1.00, S2: 1.20, S3: 1.40},
    1: {S0: 0.80, S1: 1.00, S2: 1.60, S3: 2.00},
  },
  periodos: {S0: {Tp: 0.3, TL: 3.0}, S1: {Tp: 0.4, TL: 2.5}, S2: {Tp: 0.6, TL: 2.0}, S3: {Tp: 1.0, TL: 1.6}},
  categorias: {
    A1: {U: 1.5, nombre: "ESENCIALES"},   // sin aislamiento sísmico
    A2: {U: 1.5, nombre: "ESENCIALES"},   // colegios, hospitales, comisarías…
    B: {U: 1.3, nombre: "IMPORTANTES"},
    C: {U: 1.0, nombre: "COMUNES"},
  },
};

// Campos del panel. `opciones` → lista desplegable; si no, número.
export const CAMPOS_TECNICOS = [
  {campo: "hz", etiqueta: "Hz: peralte de platea o zapata (m)", ejemplo: CRITERIOS.platea.espesor.toFixed(2), min: 0.3, max: 2.5},
  {campo: "df", etiqueta: "Df: profundidad de desplante (m)", ejemplo: CRITERIOS.platea.df.toFixed(2), min: 0.5, max: 6},
  {campo: "zona", etiqueta: "Zona sísmica (E.030)", opciones: [["1", "Zona 1"], ["2", "Zona 2"], ["3", "Zona 3"], ["4", "Zona 4"]]},
  {campo: "suelo", etiqueta: "Perfil de suelo", opciones: [["S0", "S0 roca dura"], ["S1", "S1 roca o suelo muy rígido"], ["S2", "S2 suelo intermedio"], ["S3", "S3 suelo blando"]]},
  {campo: "categoria", etiqueta: "Categoría de la edificación", opciones: [["A2", "A2 esencial (colegio, hospital…)"], ["B", "B importante"], ["C", "C común (vivienda, oficina)"]]},
  {campo: "niveles", etiqueta: "Número de niveles", ejemplo: "1", min: 1, max: 10, entero: true},
];

const numero = (v) => {
  const n = Number(String(v ?? "").replace(",", ".").trim());
  return String(v ?? "").trim() !== "" && Number.isFinite(n) ? n : null;
};

// Datos técnicos normalizados. Cada valor es null si falta o no es válido; `invalidos`
// lista lo que vino mal escrito para avisarlo.
export function datosTecnicos(datos = {}) {
  const out = {invalidos: []};
  for (const c of CAMPOS_TECNICOS) {
    const crudo = datos?.[c.campo];
    if (crudo === undefined || crudo === null || String(crudo).trim() === "") { out[c.campo] = null; continue; }
    if (c.opciones) {
      const v = String(crudo).trim().toUpperCase().replace(/^ZONA\s*/, "");
      const ok = c.opciones.some(([valor]) => valor.toUpperCase() === v);
      out[c.campo] = ok ? (c.campo === "zona" ? Number(v) : v) : null;
      if (!ok) out.invalidos.push(c.etiqueta);
      continue;
    }
    const n = numero(crudo);
    const ok = n !== null && n >= c.min && n <= c.max && (!c.entero || Number.isInteger(n));
    out[c.campo] = ok ? n : null;
    if (!ok) out.invalidos.push(`${c.etiqueta} (${crudo})`);
  }
  return out;
}

// Parámetros sísmicos que se pueden calcular con lo indicado (cada uno por separado).
export function parametrosSismicos({zona, suelo, categoria} = {}) {
  const p = {};
  if (zona) p.Z = E030.Z[zona];
  if (categoria) Object.assign(p, {U: E030.categorias[categoria].U, categoria, nombreCategoria: E030.categorias[categoria].nombre});
  if (zona && suelo) p.S = E030.S[zona][suelo];
  if (suelo) Object.assign(p, E030.periodos[suelo], {suelo});
  if (zona) p.zona = zona;
  return p;
}

const f2 = (v) => v.toFixed(2);
const f1 = (v) => v.toFixed(1);

// Reemplazos de los textos del "RESUMEN DE PARÁMETROS SÍSMICOS" de la plantilla, que
// vienen del expediente de referencia (Z=0.25 ZONA 2, U=1.0 categoría C, S=1.40…).
// Devuelve una función texto → texto; los textos que no son parámetros quedan igual.
export function textosSismicos(p) {
  const reglas = [];
  if (p.Z !== undefined) reglas.push([/^\s*Z\s*=\s*[\d.]+\s*\(ZONA\s*\d\)\s*$/i, `Z=${f2(p.Z)}(ZONA ${p.zona})`]);
  if (p.U !== undefined) {
    reglas.push([/^\s*U\s*=\s*[\d.]+\s*categor[ií]a\b.*$/i, `U=${f1(p.U)} categoria "${p.categoria}" (EDIFICACIONES ${p.nombreCategoria})`]);
    reglas.push([/^\s*U\s*=\s*[\d.]+\s*$/i, `U=${f1(p.U)} `]);
    reglas.push([/^\s*categor[ií]a\s*"[^"]*"\s*EDIFICACIONES\b.*$/i, `categoria "${p.categoria}" EDIFICACIONES ${p.nombreCategoria}`]);
  }
  if (p.S !== undefined) reglas.push([/^\s*S\s*=\s*[\d.]+\s*\(suelo\b.*\)\s*$/i, `S=${f2(p.S)}(suelo tipo ${p.suelo})`]);
  if (p.Tp !== undefined) {
    reglas.push([/^\s*S\s*=\s*\d\s*$/i, `S=${p.suelo.slice(1)}`]); // perfil de suelo ("S=2" es S2)
    reglas.push([/^\s*Tp\s*=\s*[\d.]+\s*\(suelo\b.*\)\s*$/i, `Tp=${f2(p.Tp)}(suelo ${p.suelo})`]);
    reglas.push([/^\s*TL\s*=\s*[\d.]+\s*\(suelo\b.*\)\s*$/i, `TL=${f1(p.TL)}(suelo tipo ${p.suelo})`]);
  }
  if (!reglas.length) return null;
  return (texto) => {
    const regla = reglas.find(([re]) => re.test(texto));
    return regla ? regla[1] : texto;
  };
}

// Opciones de cimentación y avisos de lo que falta, para laminasPlantilla.
export function datosParaLaminas(datos = {}) {
  const t = datosTecnicos(datos);
  const sismo = parametrosSismicos(t);
  const avisos = [];
  if (t.invalidos.length) avisos.push(`Datos del proyecto no válidos (se ignoraron): ${t.invalidos.join("; ")}.`);
  if (t.hz === null || t.df === null) {
    avisos.push(`Falta ${[t.hz === null && "Hz", t.df === null && "Df"].filter(Boolean).join(" y ")} del estudio de suelos: usé el criterio del despacho (Hz = ${CRITERIOS.platea.espesor.toFixed(2)} m, Df = ${CRITERIOS.platea.df.toFixed(2)} m). Indícalos en ▤ Datos del proyecto.`);
  }
  const faltaSismo = [!t.zona && "zona", !t.suelo && "perfil de suelo", !t.categoria && "categoría"].filter(Boolean);
  if (faltaSismo.length) avisos.push(`Falta ${faltaSismo.join(", ")}: ${faltaSismo.length === 3 ? "los parámetros sísmicos" : "parte de los parámetros sísmicos"} de la lámina son los de la plantilla y hay que revisarlos.`);
  if (t.niveles > 1) avisos.push(`El proyecto tiene ${t.niveles} niveles: por ahora el agente dibuja la estructura de un nivel (losa de entrepiso y pórticos de varios niveles en desarrollo).`);
  return {
    cimentacion: {
      ...(t.hz !== null ? {espesorPlatea: t.hz, peralteZapata: t.hz} : {}),
      ...(t.df !== null ? {dfPlatea: t.df, df: t.df} : {}),
      ...(t.niveles ? {pisos: t.niveles} : {}),
    },
    sismo, textos: textosSismicos(sismo), niveles: t.niveles ?? 1, avisos,
  };
}

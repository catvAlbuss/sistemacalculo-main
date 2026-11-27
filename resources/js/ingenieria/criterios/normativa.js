// Normativa que rige el diseño: qué norma y qué versión, con su dispositivo legal, y el artículo
// que respalda cada criterio del agente. Fuente: docs/agentes/normativas-estructurales.md
// (investigado el 24/11/2026). Una sola normativa por proyecto; nunca mezclar dos.
//
// Perú (RNE, obligatorio). La E.030 cambió en 2026: los proyectos con licencia en trámite o
// aprobada, o con expediente técnico aprobado en Invierte.pe antes de la RM 183-2026-VIVIENDA,
// siguen con la versión anterior (transitoria modificada por la RM 217-2026-VIVIENDA).

export const NORMAS_RNE = {
  "E.020": {nombre: "Cargas", version: "2006", dispositivo: "DS 011-2006-VIVIENDA"},
  "E.030": {nombre: "Diseño Sismorresistente", vigente: "2026", versiones: {
    "2018": {dispositivo: "RM 355-2018-VIVIENDA", alcance: "solo proyectos en la transitoria de la RM 183-2026-VIVIENDA (licencia o expediente aprobado antes)", tablasCargadas: true},
    "2026": {dispositivo: "RM 183-2026-VIVIENDA (transitoria: RM 217-2026-VIVIENDA)", alcance: "proyectos nuevos", tablasCargadas: false},
  }},
  "E.050": {nombre: "Suelos y Cimentaciones", version: "2018", dispositivo: "RM 406-2018-VIVIENDA"},
  "E.060": {nombre: "Concreto Armado", version: "2009", dispositivo: "DS 010-2009-VIVIENDA", nota: "Propuesta de actualización en curso (RM 066-2025-VIVIENDA, SENCICO); no aprobada."},
  "E.070": {nombre: "Albañilería", version: "2006", dispositivo: "DS 011-2006-VIVIENDA", nota: "Verificar si hay modificación posterior en el portal del MVCS."},
};

// Artículo que respalda cada criterio que el agente aplica o revisa.
export const CITAS = {
  combinaciones: "E.060 9.2",
  recubrimientos: "E.060 7.7.1",
  cuantiaColumnas: "E.060 10.9.1 y 21.6.3.1",
  espesorAligerado: "E.060 9.6",
  desarrollo: "E.060 12.2",
  empalmes: "E.060 12.15",
  ganchos: "E.060 7.1",
  // Pórticos: vigas 21.5.3 y columnas 21.6.4 (el 21.4 es para sistemas de muros y duales tipo I).
  estribosConfinamiento: "E.060 21.5.3 y 21.6.4",
  espectro: "E.030 cap. 4",
  categoriaU: "E.030 tabla de categorías (factor U)",
  deriva: "E.030 límites de distorsión de entrepiso",
  irregularidades: "E.030 3.6",
  ems: "E.050 (estudio de mecánica de suelos)",
  albanileria: "E.070",
  cargas: "E.020",
};

// Versión de la E.030 que rige el proyecto. datos.normaE030: "2018" | "2026" | vacío.
// Devuelve {version, confirmada, aviso, nivel}: el aviso va en las láminas y en la revisión.
export function versionE030(datos = {}) {
  const pedida = String(datos?.normaE030 ?? "").trim();
  const v = NORMAS_RNE["E.030"].versiones;
  if (pedida === "2018") {
    return {version: "2018", confirmada: true, nivel: "info",
      aviso: `Parámetros sísmicos según E.030-2018 (${v["2018"].dispositivo}): válido solo si el proyecto está en la transitoria de la RM 183-2026-VIVIENDA.`};
  }
  if (pedida === "2026") {
    return {version: "2026", confirmada: true, nivel: v["2026"].tablasCargadas ? "info" : "alto",
      aviso: v["2026"].tablasCargadas
        ? `Parámetros sísmicos según E.030-2026 (${v["2026"].dispositivo}).`
        : "Este proyecto se rige por la E.030-2026, pero sus tablas aún no están cargadas en el agente: los parámetros sísmicos mostrados son de la E.030-2018 y deben recalcularse antes de usar las láminas."};
  }
  return {version: "2018", confirmada: false, nivel: "alto",
    aviso: "Confirma qué E.030 rige: si el proyecto no tenía licencia ni expediente aprobado antes de la RM 183-2026-VIVIENDA, corresponde la E.030-2026. Los parámetros mostrados son de la E.030-2018 (provisional)."};
}

// Resumen para la memoria del motor de IA (pocas líneas; sin inventar valores de la 2026).
export function resumenNormativo() {
  const e030 = NORMAS_RNE["E.030"];
  return [
    "### Normativa vigente (Perú, RNE — obligatoria)",
    `- E.030 ${e030.nombre}: vigente la 2026 (${e030.versiones["2026"].dispositivo}); la 2018 (${e030.versiones["2018"].dispositivo}) solo para proyectos en la transitoria. Novedad confirmada: sismo en dos direcciones ortogonales simultáneas y clasificación de suelos más detallada. Tablas 2026 aún no cargadas: no inventes sus valores; pide confirmar la versión (dato normaE030).`,
    ...["E.020", "E.050", "E.060", "E.070"].map((k) => `- ${k} ${NORMAS_RNE[k].nombre}: ${NORMAS_RNE[k].version} (${NORMAS_RNE[k].dispositivo})${NORMAS_RNE[k].nota ? `. ${NORMAS_RNE[k].nota}` : ""}.`),
    "- Una sola normativa por proyecto. ACI 318-25 / ASCE 7-22 / Eurocódigos (2.ª generación, obligatoria desde 30/09/2027) solo como referencia donde el RNE no regula, y diciéndolo.",
    `- Cita el artículo de cada criterio (p. ej. recubrimientos ${CITAS.recubrimientos}, cuantía de columnas ${CITAS.cuantiaColumnas}, combinaciones ${CITAS.combinaciones}).`,
  ].join("\n");
}

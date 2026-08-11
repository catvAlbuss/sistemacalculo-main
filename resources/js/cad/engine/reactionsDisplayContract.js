// resources/js/cad/engine/reactionsDisplayContract.js
//
// Lógica pura (sin `this`) para "Reacciones por Caso" (CM, CVE, SDX, SDY).
// No toca el backend Python ni el pipeline de fuerzas internas del
// compañero — lee directamente lo que el análisis sísmico principal ya
// calcula y guarda en cadSystem.seismicResults / .seismicResultsByCase
// (mismo dato que ya usa "Calcular zapatas", ver foundationContract.js).
//
// CM/CVE salen de un único análisis estático (no dependen de qué caso
// espectral esté activo). SDX/SDY salen de cada Response Spectrum Case
// definido por separado (uno por dirección) — solo están disponibles si
// ese caso corrió y quedó guardado en seismicResultsByCase.

import { newtonToTonf, findStaticField } from "./foundationContract.js";

export const REACTION_CASES = ["CM", "CVE", "SDX", "SDY"];

/** ¿Qué casos tienen datos disponibles ahora mismo para mostrar? */
export function getAvailableReactionCases(cadSystem) {
  const byCase = cadSystem?.seismicResultsByCase || {};

  return {
    CM: Boolean(findStaticField(cadSystem, "static_dead")),
    CVE: Boolean(findStaticField(cadSystem, "static_live")),
    SDX: Boolean(byCase?.SDX?.joint_reactions),
    SDY: Boolean(byCase?.SDY?.joint_reactions),
  };
}

function reactionFromDictCase(staticCase, nodeId) {
  const r = staticCase?.reactions?.[nodeId];
  if (!r) return null;

  return {
    fx: newtonToTonf(r.fx),
    fy: newtonToTonf(r.fy),
    fz: newtonToTonf(r.fz),
    mx: newtonToTonf(r.mx),
    my: newtonToTonf(r.my),
    mz: newtonToTonf(r.mz),
  };
}

function reactionFromArrayCase(jointReactions, nodeId) {
  const r = jointReactions?.[nodeId];
  if (!Array.isArray(r)) return null;

  // [FX, FY, FZ, MX, MY, MZ]
  return {
    fx: newtonToTonf(r[0]),
    fy: newtonToTonf(r[1]),
    fz: newtonToTonf(r[2]),
    mx: newtonToTonf(r[3]),
    my: newtonToTonf(r[4]),
    mz: newtonToTonf(r[5]),
  };
}

/**
 * Reacción de un nodo para un caso base (CM/CVE/SDX/SDY), normalizada a
 * {fx,fy,fz,mx,my,mz} en Tonf/Tonf·m. `null` si el caso no está disponible
 * o el nodo no tiene reacción en él (no es apoyo en ese análisis).
 */
export function getNodeReactionForCase(cadSystem, nodeId, caseId) {
  const id = Number(nodeId);
  const byCase = cadSystem?.seismicResultsByCase || {};

  if (caseId === "CM") return reactionFromDictCase(findStaticField(cadSystem, "static_dead"), id);
  if (caseId === "CVE") return reactionFromDictCase(findStaticField(cadSystem, "static_live"), id);
  if (caseId === "SDX") return reactionFromArrayCase(byCase?.SDX?.joint_reactions, id);
  if (caseId === "SDY") return reactionFromArrayCase(byCase?.SDY?.joint_reactions, id);

  return null;
}

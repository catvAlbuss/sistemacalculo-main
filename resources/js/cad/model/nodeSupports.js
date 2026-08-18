// model/nodeSupports.js
//
// Restricciones de un nudo, en UN solo lugar.
//
// EL PROBLEMA
//   Los apoyos viven en el modelo de dos formas: `restraints`/`constraints`
//   ({ux,uy,uz,rx,ry,rz}) y el campo LEGACY `soporte` ("soporteUno",
//   "soporteDos", ...) que usan el dibujo 2D/3D y los diálogos de asignación.
//
//   El payload sísmico contemplaba las dos (`_soporteToRestraints`), pero el
//   exportador .e2k solo miraba `n.hasRestraints` — así que un modelo cuyos
//   apoyos venían por `soporte` se exportaba SIN NINGÚN `RESTRAINT`, y el .e2k
//   resultante quedaba flotando: ETABS lo abre y no tiene apoyos.
//
//   Se centraliza acá para que exportador y motor no puedan volver a discrepar
//   sobre qué es un apoyo.

const EMPTY = { ux: 0, uy: 0, uz: 0, rx: 0, ry: 0, rz: 0 };

const on = (value) => (Number(value) === 1 || value === true ? 1 : 0);

/** Presets legacy del CAD. Mismo criterio que usaba _buildSeismicPayload. */
export const SOPORTE_PRESETS = {
    // Empotrado: todo restringido.
    soporteUno: { ux: 1, uy: 1, uz: 1, rx: 1, ry: 1, rz: 1 },
    // Articulado: traslaciones restringidas, giros libres.
    soporteDos: { ux: 1, uy: 1, uz: 1, rx: 0, ry: 0, rz: 0 },
    // Apoyo simple (rodillo vertical): solo impide el descenso.
    soporteTres: { ux: 0, uy: 0, uz: 1, rx: 0, ry: 0, rz: 0 },
};

export function restraintsFromSoporte(soporte) {
    const preset = SOPORTE_PRESETS[String(soporte || "").trim()];

    return preset ? { ...preset } : null;
}

/**
 * Restricciones efectivas del nudo, normalizadas a 0/1, o `null` si es libre.
 * Prioridad: `restraints`/`constraints` explícitos; si no hay, el `soporte`.
 */
export function getNodeRestraints(node) {
    if (!node) return null;

    const raw = node.restraints || node.constraints || null;

    if (raw) {
        const r = {
            ux: on(raw.ux), uy: on(raw.uy), uz: on(raw.uz),
            rx: on(raw.rx), ry: on(raw.ry), rz: on(raw.rz),
        };
        // Un objeto con todo en 0 NO es un apoyo: pasa cuando el nudo se tocó
        // en un diálogo y se guardó el objeto vacío.
        if (Object.values(r).some(Boolean)) return r;
    }

    return restraintsFromSoporte(node.soporte || node.supportType);
}

export function nodeHasRestraints(node) {
    return getNodeRestraints(node) !== null;
}

/** Texto RESTRAINT del .e2k ("UX UY UZ RX RY RZ"), o null si el nudo es libre. */
export function e2kRestraintText(node) {
    const r = getNodeRestraints(node);

    if (!r) return null;

    return [
        ["ux", "UX"], ["uy", "UY"], ["uz", "UZ"],
        ["rx", "RX"], ["ry", "RY"], ["rz", "RZ"],
    ]
        .filter(([k]) => r[k])
        .map(([, label]) => label)
        .join(" ") || null;
}

export { EMPTY as NO_RESTRAINTS };

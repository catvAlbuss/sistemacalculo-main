export const FRAME_FORCE_RESULT_TYPE = "jhack_frame_force_results";
export const FRAME_FORCE_RESULT_VERSION = "B-FORCES-01";

export const FRAME_FORCE_COMPONENTS = [
    { id: "P", name: "Axial Force", unitType: "force" },
    { id: "V2", name: "Shear 2-2", unitType: "force" },
    { id: "V3", name: "Shear 3-3", unitType: "force" },
    { id: "T", name: "Torsion", unitType: "moment" },
    { id: "M2", name: "Moment 2-2", unitType: "moment" },
    { id: "M3", name: "Moment 3-3", unitType: "moment" },
];

export const DEFAULT_FRAME_FORCE_UNITS = {
    force: "kN",
    moment: "kN-m",
    length: "m",
    displacement: "m",
    inertia: "m4",
};

export function isValidFrameForceComponent(component) {
    return FRAME_FORCE_COMPONENTS.some((item) => item.id === component);
}

export function getFrameForceComponent(component) {
    return FRAME_FORCE_COMPONENTS.find((item) => item.id === component) || null;
}

export function validateFrameForceResults(results) {
    if (!results || typeof results !== "object") {
        return { ok: false, reason: "Results object is empty." };
    }

    if (results.type !== FRAME_FORCE_RESULT_TYPE) {
        return { ok: false, reason: "Invalid frame force result type." };
    }

    if (!Array.isArray(results.frameForces)) {
        return { ok: false, reason: "frameForces must be an array." };
    }

    return { ok: true, reason: "OK" };
}
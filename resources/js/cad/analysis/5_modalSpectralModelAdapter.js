// resources/js/cad/analysis/5_modalSpectralModelAdapter.js
import {
    buildResponseSpectrumPayloadOptions
} from "./7_responseSpectrumDefinitions.js";

import {
    buildDefaultModalSpectralPayload
} from "./4_modalSpectralPayload.js";

function clonePlain(data) {
    try {
        return JSON.parse(JSON.stringify(data ?? null));
    } catch (error) {
        return null;
    }
}

function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function getNodeId(node, index = 0) {
    return node?.id ?? node?.nodeId ?? node?.name ?? `N${index + 1}`;
}

function getFrameId(frame, index = 0) {
    return frame?.id ?? frame?.frameId ?? frame?.name ?? `F${index + 1}`;
}

function getNodePosition(node) {
    const p = node?.position || node || {};

    return {
        x: toNumber(p.x, 0),
        y: toNumber(p.y, 0),
        z: toNumber(p.z, 0),
    };
}

function hasAnyRestraint(restraints) {
    if (!restraints) return false;

    return (
        restraints.ux === true ||
        restraints.uy === true ||
        restraints.uz === true ||
        restraints.rx === true ||
        restraints.ry === true ||
        restraints.rz === true
    );
}

function normalizeRestraints(node) {
    const restraints =
        node?.restraints ||
        node?.constraints ||
        null;

    if (!restraints) return null;

    return {
        ux: restraints.ux === true,
        uy: restraints.uy === true,
        uz: restraints.uz === true,
        rx: restraints.rx === true,
        ry: restraints.ry === true,
        rz: restraints.rz === true,
        type: restraints.type || restraints.name || "custom",
    };
}

function serializeNode(node, index = 0) {
    const id = getNodeId(node, index);
    const position = getNodePosition(node);
    const restraints = normalizeRestraints(node);

    return {
        id,
        label: String(id),
        position,
        restraints,

        diaphragmId: node?.diaphragmId ?? null,
        diaphragmName: node?.diaphragmName ?? null,

        springs: clonePlain(node?.pointSprings || node?.springs || null),

        pointLoads: clonePlain(
            node?.pointLoads ||
            node?.jointLoads ||
            []
        ),

        mass: clonePlain(node?.mass || node?.jointMass || null),

        groups: clonePlain(
            node?.groupNames ||
            node?.groups ||
            []
        ),

        assignment: clonePlain(node?.assignment || {}),
    };
}

function serializeFrame(frame, index = 0) {
    const id = getFrameId(frame, index);

    const node1Id = frame?.node1
        ? getNodeId(frame.node1)
        : frame?.node1Id ?? null;

    const node2Id = frame?.node2
        ? getNodeId(frame.node2)
        : frame?.node2Id ?? null;

    const section =
        frame?.frameSection ||
        frame?.section ||
        frame?.assignment?.frameSection ||
        null;

    const type = String(
        frame?.elementType ||
        frame?.type ||
        frame?.objectType ||
        "frame"
    );

    return {
        id,
        label: String(id),

        type,
        elementType: type,

        node1Id,
        node2Id,

        sectionId:
            frame?.sectionId ||
            section?.id ||
            section?.name ||
            null,

        sectionName:
            frame?.sectionName ||
            section?.name ||
            frame?.sectionId ||
            null,

        materialId:
            frame?.materialId ||
            section?.materialId ||
            null,

        E: toNumber(frame?.E, null),
        A: toNumber(frame?._A ?? frame?.A ?? section?.A ?? section?.area, null),
        Iz: toNumber(frame?.Iz ?? section?.Iz ?? section?.Izz, null),
        Iy: toNumber(frame?.Iy ?? section?.Iy ?? section?.Iyy, null),
        J: toNumber(frame?.J ?? section?.J, null),

        releases: clonePlain(frame?.releases || frame?.frameReleases || null),
        endOffsets: clonePlain(frame?.endOffsets || frame?.frameEndOffsets || null),

        frameLoads: clonePlain(frame?.frameLoads || frame?.lineLoads || []),

        is3DOnlyFrame:
            frame?.is3DOnlyFrame === true ||
            frame?.isCrossViewFrame === true ||
            frame?.showIn2D === false,

        visible: frame?.visible !== false,

        groups: clonePlain(
            frame?.groupNames ||
            frame?.groups ||
            []
        ),

        assignment: clonePlain(frame?.assignment || {}),
    };
}

function extractNodes(cadSystem) {
    return (cadSystem?.nodes || []).map((node, index) =>
        serializeNode(node, index)
    );
}

function extractFrames(cadSystem) {
    return (cadSystem?.shapes || [])
        .filter((frame) => frame?.node1 && frame?.node2)
        .map((frame, index) => serializeFrame(frame, index));
}

function extractSupportsFromNodes(nodes = []) {
    return nodes
        .filter((node) => hasAnyRestraint(node.restraints))
        .map((node) => ({
            nodeId: node.id,
            restraints: clonePlain(node.restraints),
        }));
}

function extractSections(cadSystem) {
    const sections = [];

    const definedSections = cadSystem?.frameSections?.sections;

    if (Array.isArray(definedSections)) {
        definedSections.forEach((section, index) => {
            sections.push({
                id: section.id || section.name || `SECTION_${index + 1}`,
                name: section.name || section.id || `SECTION_${index + 1}`,
                type: section.type || section.sectionType || "frame",
                A: toNumber(section.A ?? section.area, null),
                Iz: toNumber(section.Iz ?? section.Izz, null),
                Iy: toNumber(section.Iy ?? section.Iyy, null),
                J: toNumber(section.J, null),
                b: toNumber(section.b ?? section.width ?? section.base, null),
                h: toNumber(section.h ?? section.height ?? section.peralte, null),
                materialId: section.materialId ?? null,
                raw: clonePlain(section),
            });
        });
    }

    return sections;
}

function extractMaterials(cadSystem) {
    const materials = [];

    const definedMaterials =
        cadSystem?.materialProperties?.materials ||
        cadSystem?.materials ||
        cadSystem?.materiales ||
        [];

    if (Array.isArray(definedMaterials)) {
        definedMaterials.forEach((material, index) => {
            materials.push({
                id: material.id || material.name || `MAT_${index + 1}`,
                name: material.name || material.nombre || `MAT_${index + 1}`,
                type: material.type || material.materialType || "generic",
                E: toNumber(material.E ?? material.elasticity, null),
                density: toNumber(material.density ?? material.rho, null),
                raw: clonePlain(material),
            });
        });
    }

    return materials;
}

function extractMasses(cadSystem, nodes = []) {
    const masses = [];

    nodes.forEach((node) => {
        if (node.mass) {
            masses.push({
                nodeId: node.id,
                mass: clonePlain(node.mass),
            });
        }
    });

    const massSource = cadSystem?.massSource || null;

    return {
        nodalMasses: masses,
        massSource: clonePlain(massSource),
    };
}

function buildModelSummary(nodes, frames, supports, sections, materials) {
    return {
        nodesCount: nodes.length,
        framesCount: frames.length,
        supportsCount: supports.length,
        sectionsCount: sections.length,
        materialsCount: materials.length,
    };
}

// ============================================================
// BLOQUE 7S-B - Model Calibration payload helper
// ============================================================

function toBoolean(value, fallback = false) {
    if (value === null || value === undefined) return fallback;

    if (typeof value === "boolean") return value;

    const text = String(value).trim().toLowerCase();

    return ["true", "1", "yes", "si", "sí", "on", "enabled"].includes(text);
}

function toPositiveNumber(value, fallback = 1) {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        return fallback;
    }

    return number;
}

function buildModelCalibrationOptions(cadSystem, options = {}) {
    const source =
        options.modelCalibration ||
        options.model_calibration ||
        cadSystem?.modalSpectralModelCalibration ||
        window?.jhackTestModelCalibration ||
        {};

    const enabled = toBoolean(source.enabled, false);

    return {
        enabled,

        globalStiffnessScale: enabled
            ? toPositiveNumber(
                source.globalStiffnessScale ??
                source.global_stiffness_scale ??
                source.stiffnessScale ??
                source.kScale,
                1
            )
            : 1,

        globalMassScale: enabled
            ? toPositiveNumber(
                source.globalMassScale ??
                source.global_mass_scale ??
                source.massScale ??
                source.mScale,
                1
            )
            : 1,

        axialStiffnessScale: enabled
            ? toPositiveNumber(
                source.axialStiffnessScale ??
                source.axial_stiffness_scale,
                1
            )
            : 1,

        bendingStiffnessScale: enabled
            ? toPositiveNumber(
                source.bendingStiffnessScale ??
                source.bending_stiffness_scale,
                1
            )
            : 1,

        torsionStiffnessScale: enabled
            ? toPositiveNumber(
                source.torsionStiffnessScale ??
                source.torsion_stiffness_scale,
                1
            )
            : 1,

        source: enabled
            ? "frontend.modelCalibration"
            : "default.disabled",
    };
}

// ============================================================
// BLOQUE 7T-B - Modal Spectral Analysis Options payload helper
// ============================================================

function normalizeModalCombination(value) {
    const combination = String(value || "CQC").trim().toUpperCase();

    if (["CQC", "SRSS", "ABS"].includes(combination)) {
        return combination;
    }

    return "CQC";
}

function buildModalSpectralAnalysisOptions(cadSystem, options = {}) {
    const defaultOptions = {
        useRigidDiaphragms: true,
        diaphragmMode: "rigid_by_story",
        massSourceMode: "story_mass",
        storyMassDistribution: "by_level",

        modalCombination: "CQC",
        dampingRatio: 0.05,

        numberOfModes: 12,
        useRealModalPeriods: true,
        useModalParticipatingMass: true,
        useCombinedModalResults: true,
    };

    const testOptions =
        typeof window !== "undefined"
            ? window.jhackTestModalSpectralOptions || {}
            : {};

    const source = {
        ...defaultOptions,
        ...(cadSystem?.modalSpectralOptions || {}),
        ...(options?.modalSpectralOptions || {}),
        ...(options?.analysisOptions || {}),
        ...testOptions,
    };

    return {
        useRigidDiaphragms: toBoolean(source.useRigidDiaphragms, true),
        diaphragmMode: source.diaphragmMode || "rigid_by_story",
        massSourceMode: source.massSourceMode || "story_mass",
        storyMassDistribution: source.storyMassDistribution || "by_level",

        modalCombination: normalizeModalCombination(source.modalCombination),
        dampingRatio: toPositiveNumber(source.dampingRatio, 0.05),

        numberOfModes: Math.max(
            1,
            Math.round(toPositiveNumber(source.numberOfModes, 12))
        ),

        useRealModalPeriods: toBoolean(source.useRealModalPeriods, true),
        useModalParticipatingMass: toBoolean(source.useModalParticipatingMass, true),
        useCombinedModalResults: toBoolean(source.useCombinedModalResults, true),

        source: cadSystem?.modalSpectralOptions
            ? "cadSystem.modalSpectralOptions"
            : "default.modalSpectralOptions",
    };
}

/**
 * Construye el payload Modal Spectral usando el modelo real actual del CAD.
 *
 * Por ahora:
 * - Extrae nodos, barras, apoyos, secciones, materiales y fuente de masa.
 * - Mantiene los casos espectrales temporales ya validados contra ETABS.
 *
 * Más adelante:
 * - Los casos SDX/SDY/DER se tomarán desde Define > Response Spectrum Cases.
 */
export function buildModalSpectralPayloadFromCadSystem(cadSystem, options = {}) {
    const nodes = extractNodes(cadSystem);
    const frames = extractFrames(cadSystem);
    const supports = extractSupportsFromNodes(nodes);
    const sections = extractSections(cadSystem);
    const materials = extractMaterials(cadSystem);
    const masses = extractMasses(cadSystem, nodes);

    const modelSummary = buildModelSummary(
        nodes,
        frames,
        supports,
        sections,
        materials
    );

    const responseSpectrumOptions = buildResponseSpectrumPayloadOptions(cadSystem);

    // BLOQUE 7T-B
    const modalSpectralOptions = buildModalSpectralAnalysisOptions(
        cadSystem,
        options
    );

    const modelCalibration = buildModelCalibrationOptions(
        cadSystem,
        options
    );

    const payload = buildDefaultModalSpectralPayload({
        ...responseSpectrumOptions,
        ...options,

        modelName:
            options.modelName ||
            cadSystem?.currentFileName ||
            "JHACK Current Model",

        description:
            options.description ||
            "Payload generado desde el modelo actual de JHACK",

        nodes,
        frames,
        supports,
        sections,
        materials,
        masses,
    });

    // ============================================================
    // BLOQUE 7N-B + 7S-B + 7T-B
    // Diafragmas rígidos, masa por story, opciones modales y calibración real
    // ============================================================
    payload.analysis = {
        ...(payload.analysis || {}),

        // BLOQUE 7N-B
        useRigidDiaphragms: modalSpectralOptions.useRigidDiaphragms,
        diaphragmMode: modalSpectralOptions.diaphragmMode,
        massSourceMode: modalSpectralOptions.massSourceMode,
        storyMassDistribution: modalSpectralOptions.storyMassDistribution,

        // BLOQUE 7T-B
        modalCombination: modalSpectralOptions.modalCombination,
        dampingRatio: modalSpectralOptions.dampingRatio,
        damping: modalSpectralOptions.dampingRatio,

        numberOfModes: modalSpectralOptions.numberOfModes,
        numModes: modalSpectralOptions.numberOfModes,

        useRealModalPeriods: modalSpectralOptions.useRealModalPeriods,
        useModalParticipatingMass: modalSpectralOptions.useModalParticipatingMass,
        useCombinedModalResults: modalSpectralOptions.useCombinedModalResults,

        modalSpectralOptions: clonePlain(modalSpectralOptions),

        // BLOQUE 7S-B
        modelCalibration,
    };

    payload.model = {
        ...payload.model,
        source: "cadSystem",
        generatedAt: new Date().toISOString(),
        summary: modelSummary,
    };

    payload.jhack = {
        version: "modal-spectral-adapter-v1",
        note: "El backend V1 aún usa casos espectrales simplificados, pero el payload ya transporta el modelo real.",
        modelSummary,

        // BLOQUE 7T-B
        modalSpectralOptions: clonePlain(modalSpectralOptions),

        // BLOQUE 7S-B
        modelCalibration: clonePlain(modelCalibration),
    };

    if (
        window?.jhackModalSpectralDebug === true ||
        window?.localStorage?.getItem("jhackModalSpectralDebug") === "true"
    ) {
        console.log("🧪 7T-B Modal Spectral Options enviadas:", {
            modalSpectralOptions,
            modelCalibration,
        });
    }

    // ============================================================
    // BLOQUE 7X-A - Adjuntar soportes explícitos al payload
    // ============================================================

    const explicitSupports = buildModalSpectralSupportsFromCadSystem(cadSystem);

    payload.supports = explicitSupports;

    payload.model = {
        ...(payload.model || {}),
        supports: explicitSupports,
    };

    payload.jhack = {
        ...(payload.jhack || {}),
        supports: explicitSupports,
        supportsSummary: {
            explicitSupports: explicitSupports.length,
            source: "cadSystem.nodes.restraints",
        },
    };

    return payload;
}

// ============================================================
// BLOQUE 7X-A - Soportes / restraints explícitos tipo ETABS
// ============================================================

function normalizeModalSpectralRestraints(source = null) {
    const data =
        source?.restraints ||
        source?.constraints ||
        source?.assignment?.restraints ||
        source?.support ||
        source?.soporte ||
        source ||
        {};

    const readBool = (...keys) => {
        for (const key of keys) {
            if (data?.[key] === true) return true;
            if (data?.[key] === false) return false;
            if (data?.[key] === 1 || data?.[key] === "1") return true;
            if (data?.[key] === 0 || data?.[key] === "0") return false;
        }

        return false;
    };

    return {
        ux: readBool("ux", "u1", "U1", "UX"),
        uy: readBool("uy", "u2", "U2", "UY"),
        uz: readBool("uz", "u3", "U3", "UZ"),
        rx: readBool("rx", "r1", "R1", "RX"),
        ry: readBool("ry", "r2", "R2", "RY"),
        rz: readBool("rz", "r3", "R3", "RZ"),

        type:
            data?.type ||
            data?.name ||
            source?.restraintType ||
            source?.supportType ||
            "custom",

        name:
            data?.name ||
            data?.type ||
            source?.restraintType ||
            source?.supportType ||
            "Custom",
    };
}

function modalSpectralRestraintsHasAny(restraints = null) {
    return (
        restraints?.ux === true ||
        restraints?.uy === true ||
        restraints?.uz === true ||
        restraints?.rx === true ||
        restraints?.ry === true ||
        restraints?.rz === true
    );
}

function buildModalSpectralSupportsFromCadSystem(cadSystem) {
    const nodes = Array.isArray(cadSystem?.nodes) ? cadSystem.nodes : [];

    return nodes
        .map((node, index) => {
            const nodeId =
                node?.id ??
                node?.nodeId ??
                node?.jointId ??
                index + 1;

            const restraints = normalizeModalSpectralRestraints(node);

            const hasRestraints =
                node?.hasRestraints === true ||
                modalSpectralRestraintsHasAny(restraints);

            if (!hasRestraints) return null;

            return {
                id: `SUPPORT_${nodeId}`,

                // Aliases para máxima compatibilidad backend/frontend
                nodeId,
                node_id: nodeId,
                jointId: nodeId,
                joint_id: nodeId,

                type: restraints.type || "custom",
                name: restraints.name || restraints.type || "Custom",
                restraintType: restraints.type || "custom",
                supportType: restraints.type || "custom",

                ux: restraints.ux === true,
                uy: restraints.uy === true,
                uz: restraints.uz === true,
                rx: restraints.rx === true,
                ry: restraints.ry === true,
                rz: restraints.rz === true,

                restraints: {
                    ux: restraints.ux === true,
                    uy: restraints.uy === true,
                    uz: restraints.uz === true,
                    rx: restraints.rx === true,
                    ry: restraints.ry === true,
                    rz: restraints.rz === true,
                },

                source: "cadSystem.nodes.restraints",
            };
        })
        .filter(Boolean);
}
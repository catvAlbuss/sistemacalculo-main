export const FRAME_FORCE_RESULTS_TYPE = "jhack_frame_force_results";
export const FRAME_FORCE_RESULTS_VERSION = "B-FORCES-01";

export function clonePlain(value) {
    try {
        return JSON.parse(JSON.stringify(value ?? null));
    } catch (error) {
        console.warn("No se pudo clonar Frame Force data:", error);
        return null;
    }
}

export function normalizeFrameDiagramDisplayForSave(display = {}) {
    return {
        enabled: Boolean(display.enabled),

        caseId: display.caseId ?? "CM",
        comboId: display.comboId ?? null,
        component: display.component ?? "M3",
        source: display.source ?? "mock",

        showValues: display.showValues !== false,
        showMaxMin: display.showMaxMin !== false,
        filled: display.filled !== false,
        autoScale: display.autoScale !== false,
        scaleFactor: Number(display.scaleFactor ?? 1),

        selectedOnly: Boolean(display.selectedOnly),
        showLocalAxes: Boolean(display.showLocalAxes),
        showTable: false,

        showLegend: display.showLegend !== false,
        showZeroLine: display.showZeroLine !== false,
        showStationLines: display.showStationLines !== false,
        showTorsionSymbols: display.showTorsionSymbols !== false,

        valueLabelMode: display.valueLabelMode ?? "max-min",
        diagramHeightPx: Number(display.diagramHeightPx ?? 42),
        decimals: Number(display.decimals ?? 2),
    };
}

export function validateFrameForceResults(results) {
    const errors = [];

    if (!results) {
        return {
            ok: false,
            errors: ["No existe frameForceResults."],
        };
    }

    if (results.type !== FRAME_FORCE_RESULTS_TYPE) {
        errors.push(`type inválido: ${results.type}`);
    }

    if (results.version !== FRAME_FORCE_RESULTS_VERSION) {
        errors.push(`version inválida: ${results.version}`);
    }

    if (!Array.isArray(results.frameForces)) {
        errors.push("frameForces debe ser un array.");
    }

    if (!results.units) {
        errors.push("units es obligatorio.");
    }

    if (!Array.isArray(results.components)) {
        errors.push("components debe ser un array.");
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}

export function serializeFrameForceModule(CADSystem) {
    const results = CADSystem?.frameForceResults
        ? clonePlain(CADSystem.frameForceResults)
        : null;

    const display = normalizeFrameDiagramDisplayForSave(
        CADSystem?.frameDiagramDisplay || {}
    );

    return {
        type: "jhack_frame_force_module",
        version: "B-DIAG-20",
        savedAt: new Date().toISOString(),

        hasResults: Boolean(results?.frameForces?.length),
        source: results?.source || display.source || "mock",

        frameForceResults: results,
        frameDiagramDisplay: display,
    };
}

export function restoreFrameForceModule(CADSystem, data) {
    if (!CADSystem || !data) {
        return false;
    }

    const moduleData =
        data.frameForceModule ||
        data.frameForcesModule ||
        data.analysisResults?.frameForceModule ||
        null;

    const directResults =
        moduleData?.frameForceResults ||
        data.frameForceResults ||
        data.analysisResults?.frameForceResults ||
        null;

    const directDisplay =
        moduleData?.frameDiagramDisplay ||
        data.frameDiagramDisplay ||
        data.analysisResults?.frameDiagramDisplay ||
        null;

    if (directResults) {
        const validation = validateFrameForceResults(directResults);

        if (validation.ok) {
            CADSystem.frameForceResults = clonePlain(directResults);
        } else {
            console.warn("Frame Force Results no restaurados:", validation.errors);
        }
    }

    if (directDisplay) {
        CADSystem.frameDiagramDisplay =
            normalizeFrameDiagramDisplayForSave(directDisplay);
    }

    console.log("✅ Frame Force Module restaurado desde JSON:", {
        hasResults: Boolean(CADSystem.frameForceResults?.frameForces?.length),
        source: CADSystem.frameForceResults?.source || "none",
        displayEnabled: CADSystem.frameDiagramDisplay?.enabled,
        component: CADSystem.frameDiagramDisplay?.component,
    });

    return true;
}

export function setFrameForceResultsFromBackend(CADSystem, results) {
    if (!CADSystem) {
        console.warn("No existe CADSystem.");
        return false;
    }

    const normalizedResults = clonePlain(results);

    if (!normalizedResults) {
        console.warn("Resultados backend inválidos.");
        return false;
    }

    normalizedResults.type = normalizedResults.type || FRAME_FORCE_RESULTS_TYPE;
    normalizedResults.version =
        normalizedResults.version || FRAME_FORCE_RESULTS_VERSION;
    normalizedResults.source = "backend_real";

    const validation = validateFrameForceResults(normalizedResults);

    if (!validation.ok) {
        console.warn("Resultados backend no cumplen contrato:", validation.errors);
        return false;
    }

    CADSystem.frameForceResults = normalizedResults;

    CADSystem.frameDiagramDisplay = {
        ...(CADSystem.frameDiagramDisplay || {}),
        source: "backend_real",
    };

    CADSystem.redraw?.();
    CADSystem.sync3D?.();

    console.log("✅ Frame Force Results reales cargados desde backend_real.");

    return true;
}

if (typeof window !== "undefined") {
    window.jhackSetBackendFrameForceResults = function (results) {
        const cad = window.cadSystem;

        if (!cad) {
            console.warn("No existe window.cadSystem.");
            return false;
        }

        return setFrameForceResultsFromBackend(cad, results);
    };
}
// resources/js/cad/analysis/3_modalSpectralController.js

import {
    buildModalSpectralPayloadFromCadSystem
} from "./5_modalSpectralModelAdapter.js";

import {
    runModalSpectralAnalysis
} from "./1_modalSpectralClient.js";

import {
    buildModalSpectralResultsPackage
} from "./6_modalSpectralResults.js";

// ============================================================
// BLOQUE 7S-C - Comparación Original vs Calibrado Real
// ============================================================

function clonePlain(data) {
    try {
        return JSON.parse(JSON.stringify(data ?? null));
    } catch (error) {
        console.warn("No se pudo clonar data Modal Spectral:", error);
        return null;
    }
}

function toNumberOrNull(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function isModelCalibrationEnabled(payload) {
    return payload?.analysis?.modelCalibration?.enabled === true;
}

function buildUncalibratedPayloadForComparison(payload) {
    const originalPayload = clonePlain(payload);

    if (!originalPayload.analysis) {
        originalPayload.analysis = {};
    }

    originalPayload.analysis.modelCalibration = {
        ...(originalPayload.analysis.modelCalibration || {}),
        enabled: false,
        globalStiffnessScale: 1,
        globalMassScale: 1,
        axialStiffnessScale: 1,
        bendingStiffnessScale: 1,
        torsionStiffnessScale: 1,
        source: "7S-C.original_unscaled_comparison",
    };

    originalPayload.jhack = {
        ...(originalPayload.jhack || {}),
        realCalibrationComparisonRole: "original_unscaled",
    };

    return originalPayload;
}

function getCaseKey(caseResult) {
    const caseName = String(caseResult?.case_name || caseResult?.case || "").trim();
    const direction = String(caseResult?.direction || caseResult?.dir || "").trim();

    return `${caseName}__${direction}`.toUpperCase();
}

function getCasePeriod(caseResult) {
    return toNumberOrNull(
        caseResult?.modal_results?.period_s ??
        caseResult?.input?.period_for_calculation_s ??
        caseResult?.period_s
    );
}

function getCaseFinalValues(caseResult) {
    const finalResults = caseResult?.final_spectral_results || {};

    return {
        base_shear_tonf: toNumberOrNull(finalResults.equivalent_force_tonf),
        displacement_m: toNumberOrNull(finalResults.spectral_displacement_m),
        drift: toNumberOrNull(finalResults.estimated_drift),
        source: finalResults.source || "-",
    };
}

function percentChange(originalValue, calibratedValue) {
    const original = toNumberOrNull(originalValue);
    const calibrated = toNumberOrNull(calibratedValue);

    if (original === null || calibrated === null || Math.abs(original) <= 1e-18) {
        return null;
    }

    return ((calibrated - original) / Math.abs(original)) * 100.0;
}

function getMaxComparisonError(caseResult) {
    const errors = caseResult?.comparison?.error_percent || {};

    const values = [
        errors.period,
        errors.base_shear,
        errors.max_displacement,
        errors.drift,
    ]
        .map(Number)
        .filter(Number.isFinite);

    return values.length ? Math.max(...values) : null;
}

function buildRealCalibrationComparison(originalResult, calibratedResult) {
    const originalCases = originalResult?.results || [];
    const calibratedCases = calibratedResult?.results || [];

    const originalMap = new Map();

    originalCases.forEach((caseResult) => {
        originalMap.set(getCaseKey(caseResult), caseResult);
    });

    const rows = calibratedCases.map((calibratedCase) => {
        const key = getCaseKey(calibratedCase);
        const originalCase = originalMap.get(key) || null;

        const originalFinal = getCaseFinalValues(originalCase);
        const calibratedFinal = getCaseFinalValues(calibratedCase);

        const originalPeriod = getCasePeriod(originalCase);
        const calibratedPeriod = getCasePeriod(calibratedCase);

        return {
            case_name: calibratedCase?.case_name || originalCase?.case_name || "-",
            direction: calibratedCase?.direction || originalCase?.direction || "-",

            period_original_s: originalPeriod,
            period_calibrated_s: calibratedPeriod,
            period_change_percent: percentChange(originalPeriod, calibratedPeriod),

            base_shear_original_tonf: originalFinal.base_shear_tonf,
            base_shear_calibrated_tonf: calibratedFinal.base_shear_tonf,
            base_shear_change_percent: percentChange(
                originalFinal.base_shear_tonf,
                calibratedFinal.base_shear_tonf
            ),

            displacement_original_m: originalFinal.displacement_m,
            displacement_calibrated_m: calibratedFinal.displacement_m,
            displacement_change_percent: percentChange(
                originalFinal.displacement_m,
                calibratedFinal.displacement_m
            ),

            drift_original: originalFinal.drift,
            drift_calibrated: calibratedFinal.drift,
            drift_change_percent: percentChange(
                originalFinal.drift,
                calibratedFinal.drift
            ),

            error_original_max_percent: getMaxComparisonError(originalCase),
            error_calibrated_max_percent: getMaxComparisonError(calibratedCase),

            original_source: originalFinal.source,
            calibrated_source: calibratedFinal.source,
        };
    });

    const originalErrors = rows
        .map((row) => row.error_original_max_percent)
        .filter((value) => Number.isFinite(Number(value)));

    const calibratedErrors = rows
        .map((row) => row.error_calibrated_max_percent)
        .filter((value) => Number.isFinite(Number(value)));

    const originalMaxError = originalErrors.length ? Math.max(...originalErrors) : null;
    const calibratedMaxError = calibratedErrors.length ? Math.max(...calibratedErrors) : null;

    return {
        attempted: true,
        ok: true,
        mode: "real_calibration_comparison_7S_C",
        source: "frontend.double_run_original_vs_calibrated",

        original_model_calibration:
            originalResult?.opensees_real_model_build?.model_calibration || null,

        calibrated_model_calibration:
            calibratedResult?.opensees_real_model_build?.model_calibration || null,

        summary: {
            total_cases: rows.length,
            original_status: originalResult?.analysis_summary?.status || null,
            calibrated_status: calibratedResult?.analysis_summary?.status || null,
            original_max_error_percent: originalMaxError,
            calibrated_max_error_percent: calibratedMaxError,
            improvement_percent_points:
                originalMaxError !== null && calibratedMaxError !== null
                    ? originalMaxError - calibratedMaxError
                    : null,
        },

        cases: rows,
    };
}

async function runModalSpectralAnalysisWithOptionalRealCalibration(payload, runModalSpectralAnalysis) {
    if (!isModelCalibrationEnabled(payload)) {
        return await runModalSpectralAnalysis(payload);
    }

    console.log("🧪 BLOQUE 7S-C: Ejecutando comparación Original vs Calibrado Real...");

    const originalPayload = buildUncalibratedPayloadForComparison(payload);

    console.log("📤 7S-C análisis original sin calibración...");
    const originalResult = await runModalSpectralAnalysis(originalPayload);

    console.log("📤 7S-C análisis calibrado real...");
    const calibratedResult = await runModalSpectralAnalysis(payload);
    //     const calibratedResult = await runModalSpectralAnalysisWithOptionalRealCalibration(
    //     payload,
    //     runModalSpectralAnalysis
    // );

    const comparison = buildRealCalibrationComparison(
        originalResult,
        calibratedResult
    );

    calibratedResult.real_calibration_comparison = comparison;

    calibratedResult.analysis_summary = {
        ...(calibratedResult.analysis_summary || {}),

        real_calibration_comparison_available: true,
        real_calibration_original_status:
            originalResult?.analysis_summary?.status || null,
        real_calibration_calibrated_status:
            calibratedResult?.analysis_summary?.status || null,
        real_calibration_original_max_error_percent:
            comparison?.summary?.original_max_error_percent ?? null,
        real_calibration_calibrated_max_error_percent:
            comparison?.summary?.calibrated_max_error_percent ?? null,
        real_calibration_improvement_percent_points:
            comparison?.summary?.improvement_percent_points ?? null,
    };

    calibratedResult.original_unscaled_summary = {
        analysis_summary: originalResult?.analysis_summary || null,
        opensees_real_model_build: originalResult?.opensees_real_model_build || null,
        opensees_real_modal_eigen: originalResult?.opensees_real_modal_eigen || null,
    };

    console.log("✅ 7S-C comparación Original vs Calibrado Real:", comparison);

    return calibratedResult;
}

// ============================================================
// BLOQUE 7V-G - Debug opcional Modal Spectral
// ============================================================

function isModalSpectralDebugEnabled() {
    try {
        return (
            window?.jhackModalSpectralDebug === true ||
            window?.localStorage?.getItem("jhackModalSpectralDebug") === "true"
        );
    } catch {
        return false;
    }
}

function modalSpectralDebugLog(...args) {
    if (isModalSpectralDebugEnabled()) {
        console.log(...args);
    }
}

function modalSpectralDebugWarn(...args) {
    if (isModalSpectralDebugEnabled()) {
        console.warn(...args);
    }
}

function modalSpectralDebugTable(data) {
    if (isModalSpectralDebugEnabled() && data) {
        modalSpectralDebugTable(table);
    }
}

// ============================================================
// BLOQUE 7U-A - Validación técnica antes de ejecutar Modal Spectral
// ============================================================

function getFirstArray(...values) {
    for (const value of values) {
        if (Array.isArray(value)) {
            return value;
        }

        if (Array.isArray(value?.items)) {
            return value.items;
        }
    }

    return [];
}

function getPayloadNodes(payload) {
    return getFirstArray(
        payload?.nodes,
        payload?.model?.nodes,
        payload?.geometry?.nodes
    );
}

function getPayloadFrames(payload) {
    return getFirstArray(
        payload?.frames,
        payload?.beams,
        payload?.model?.frames,
        payload?.model?.beams,
        payload?.geometry?.frames,
        payload?.geometry?.beams
    );
}

function getPayloadSupports(payload) {
    return getFirstArray(
        payload?.supports,
        payload?.restraints,
        payload?.model?.supports,
        payload?.model?.restraints
    );
}

function getPayloadResponseSpectrumFunctions(payload) {
    return getFirstArray(
        payload?.responseSpectrumFunctions,
        payload?.responseSpectrumFunctions?.items,
        payload?.definitions?.responseSpectrumFunctions,
        payload?.definitions?.responseSpectrumFunctionsState,
        payload?.definitions?.responseSpectrumFunctionsState?.items,
        payload?.response_spectrum?.functions,
        payload?.responseSpectrum?.functions
    );
}

function getPayloadResponseSpectrumCases(payload) {
    return getFirstArray(
        payload?.responseSpectrumCases,
        payload?.responseSpectrumCases?.items,
        payload?.definitions?.responseSpectrumCases,
        payload?.definitions?.responseSpectrumCasesState,
        payload?.definitions?.responseSpectrumCasesState?.items,
        payload?.response_spectrum?.cases,
        payload?.responseSpectrum?.cases,
        payload?.analysis?.responseSpectrumCases,
        payload?.analysis?.responseSpectrumCases?.items
    );
}

function isPositiveFiniteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0;
}

function normalizeValidationCombination(value) {
    return String(value || "CQC").trim().toUpperCase();
}

function validateModalSpectralOptionsBeforeRun(payload, errors, warnings) {
    const analysis = payload?.analysis || {};
    const modalOptions =
        analysis.modalSpectralOptions ||
        payload?.jhack?.modalSpectralOptions ||
        {};

    const modalCombination = normalizeValidationCombination(
        analysis.modalCombination ||
        modalOptions.modalCombination ||
        "CQC"
    );

    const dampingRatio = Number(
        analysis.dampingRatio ??
        analysis.damping ??
        modalOptions.dampingRatio ??
        0.05
    );

    const numberOfModes = Number(
        analysis.numberOfModes ??
        analysis.numModes ??
        modalOptions.numberOfModes ??
        12
    );

    if (!["CQC", "SRSS", "ABS"].includes(modalCombination)) {
        errors.push(
            `Modal Combination inválido: "${modalCombination}". Debe ser CQC, SRSS o ABS.`
        );
    }

    if (!Number.isFinite(dampingRatio) || dampingRatio <= 0 || dampingRatio > 1) {
        errors.push(
            `Damping Ratio inválido: ${dampingRatio}. Debe ser mayor que 0 y menor o igual que 1.`
        );
    }

    if (!Number.isFinite(numberOfModes) || numberOfModes < 1) {
        errors.push(
            `Number of Modes inválido: ${numberOfModes}. Debe ser mayor o igual que 1.`
        );
    }

    if (analysis.useRigidDiaphragms === true && analysis.diaphragmMode === "none") {
        warnings.push(
            "useRigidDiaphragms está activo, pero diaphragmMode está en 'none'. Se revisará como caso especial."
        );
    }

    return {
        modalCombination,
        dampingRatio,
        numberOfModes,
    };
}

function validateModalSpectralCalibrationBeforeRun(payload, errors, warnings) {
    const calibration =
        payload?.analysis?.modelCalibration ||
        payload?.jhack?.modelCalibration ||
        {};

    const enabled = calibration.enabled === true;

    const factors = {
        globalStiffnessScale: calibration.globalStiffnessScale,
        globalMassScale: calibration.globalMassScale,
        axialStiffnessScale: calibration.axialStiffnessScale,
        bendingStiffnessScale: calibration.bendingStiffnessScale,
        torsionStiffnessScale: calibration.torsionStiffnessScale,
    };

    Object.entries(factors).forEach(([key, value]) => {
        if (enabled && !isPositiveFiniteNumber(value)) {
            errors.push(
                `Calibración inválida: ${key} debe ser mayor que 0. Valor recibido: ${value}`
            );
        }

        if (!enabled && value !== undefined && Number(value) <= 0) {
            warnings.push(
                `Calibración desactivada, pero ${key} tiene valor no positivo: ${value}. El backend debería usar 1.0.`
            );
        }
    });

    return {
        enabled,
        factors,
    };
}

function validateModalSpectralCasesBeforeRun(payload, errors, warnings) {
    const cases = getPayloadResponseSpectrumCases(payload);
    const activeCases = cases.filter((item) => item?.enabled !== false);

    if (!cases.length) {
        errors.push("No existen Response Spectrum Cases en el payload.");
    }

    if (cases.length && !activeCases.length) {
        errors.push("Existen Response Spectrum Cases, pero todos están desactivados.");
    }

    activeCases.forEach((caseItem, index) => {
        const name = caseItem.name || caseItem.id || `case_${index + 1}`;
        const direction = String(caseItem.direction || "").trim().toUpperCase();

        if (!["X", "Y", "Z", "UX", "UY", "UZ"].includes(direction)) {
            errors.push(
                `Caso espectral "${name}" tiene dirección inválida o vacía: "${direction}".`
            );
        }

        if (
            caseItem.scaleFactor !== undefined &&
            !isPositiveFiniteNumber(caseItem.scaleFactor)
        ) {
            errors.push(
                `Caso espectral "${name}" tiene scaleFactor inválido: ${caseItem.scaleFactor}.`
            );
        }

        if (
            caseItem.effectiveMassKg !== undefined &&
            !isPositiveFiniteNumber(caseItem.effectiveMassKg)
        ) {
            warnings.push(
                `Caso espectral "${name}" tiene effectiveMassKg inválido. El backend podría usar masa modal o fallback.`
            );
        }

        if (
            caseItem.targetPeriodS !== undefined &&
            !isPositiveFiniteNumber(caseItem.targetPeriodS)
        ) {
            warnings.push(
                `Caso espectral "${name}" tiene targetPeriodS inválido. Si useRealModalPeriods está activo, se intentará usar periodo real.`
            );
        }
    });

    return {
        totalCases: cases.length,
        activeCases: activeCases.length,
    };
}

// ============================================================
// BLOQUE 7U-E - Sincronizar Response Spectrum Definitions al payload
// ============================================================

// Re-deriva los campos single-direction (direction/scaleFactor) desde el combo
// U1/U2 de un caso, usando la dirección PRIMARIA (la del mayor factor de escala).
// Corrige casos ya guardados con el mapeo viejo (U1 fijo → SDY salía a 0.3 en X).
// Mantiene `spectra` intacto; los casos sin `spectra` (o funciones) pasan igual.
function applyCasePrimaryDirection(item) {
    const s = item?.spectra;
    if (!s) return item;
    const opts = [
        { dir: "X", fn: s.U1?.functionId, sf: Number(s.U1?.scaleFactor) },
        { dir: "Y", fn: s.U2?.functionId, sf: Number(s.U2?.scaleFactor) },
    ].filter((o) => o.fn && Number.isFinite(o.sf));
    if (!opts.length) return item;
    const p = opts.reduce((a, b) => (Math.abs(b.sf) > Math.abs(a.sf) ? b : a));
    return { ...item, functionId: p.fn, direction: p.dir, scaleFactor: p.sf };
}

function normalizeResponseSpectrumStateItems(value) {
    const arr = Array.isArray(value)
        ? value
        : Array.isArray(value?.items)
            ? value.items
            : [];

    return arr.map(applyCasePrimaryDirection);
}

function syncResponseSpectrumDefinitionsIntoPayload(payload, cadSystem = null) {
    if (!payload || typeof payload !== "object") {
        return {
            synced: false,
            reason: "payload_invalid",
            functions: 0,
            cases: 0,
        };
    }

    const currentFunctions = getPayloadResponseSpectrumFunctions(payload);
    const currentCases = getPayloadResponseSpectrumCases(payload);

    const cadFunctions = normalizeResponseSpectrumStateItems(
        cadSystem?.responseSpectrumFunctions
    );

    const cadCases = normalizeResponseSpectrumStateItems(
        cadSystem?.responseSpectrumCases
    );

    const selectedFunction =
        cadSystem?.responseSpectrumFunctions?.selectedFunction ??
        cadFunctions?.[0]?.id ??
        cadFunctions?.[0]?.name ??
        null;

    const selectedCase =
        cadSystem?.responseSpectrumCases?.selectedCase ??
        cadCases?.[0]?.id ??
        cadCases?.[0]?.name ??
        null;

    if (!payload.definitions || typeof payload.definitions !== "object") {
        payload.definitions = {};
    }

    let syncedFunctions = false;
    let syncedCases = false;

    if (!currentFunctions.length && cadFunctions.length) {
        payload.responseSpectrumFunctions = clonePlain(cadFunctions);

        payload.responseSpectrumFunctionsState = {
            items: clonePlain(cadFunctions),
            selectedFunction,
        };

        payload.definitions.responseSpectrumFunctions = clonePlain(cadFunctions);

        payload.definitions.responseSpectrumFunctionsState = {
            items: clonePlain(cadFunctions),
            selectedFunction,
        };

        syncedFunctions = true;
    }

    if (!currentCases.length && cadCases.length) {
        payload.responseSpectrumCases = clonePlain(cadCases);

        payload.responseSpectrumCasesState = {
            items: clonePlain(cadCases),
            selectedCase,
        };

        payload.definitions.responseSpectrumCases = clonePlain(cadCases);

        payload.definitions.responseSpectrumCasesState = {
            items: clonePlain(cadCases),
            selectedCase,
        };

        syncedCases = true;
    }

    return {
        synced: syncedFunctions || syncedCases,
        syncedFunctions,
        syncedCases,

        before: {
            functions: currentFunctions.length,
            cases: currentCases.length,
        },

        fromCadSystem: {
            functions: cadFunctions.length,
            cases: cadCases.length,
            selectedFunction,
            selectedCase,
        },

        after: {
            functions: getPayloadResponseSpectrumFunctions(payload).length,
            cases: getPayloadResponseSpectrumCases(payload).length,
        },
    };
}

function validateModalSpectralPayloadBeforeRun(payload, cadSystem = null) {
    const errors = [];
    const warnings = [];

    if (!payload || typeof payload !== "object") {
        errors.push("Payload Modal Spectral vacío o inválido.");
    }

    const nodes = getPayloadNodes(payload);
    const frames = getPayloadFrames(payload);
    const supports = getPayloadSupports(payload);
    const functions = getPayloadResponseSpectrumFunctions(payload);

    if (!nodes.length) {
        errors.push("El modelo no tiene nodos en el payload.");
    }

    if (!frames.length) {
        errors.push("El modelo no tiene barras/frames en el payload.");
    }

    if (!supports.length) {
        warnings.push(
            "El payload no tiene apoyos/restraints. El backend intentará aplicar fallback en nodos base."
        );
    }

    if (!functions.length) {
        warnings.push(
            "No se detectaron Response Spectrum Functions en el payload. Se verificará si los casos contienen datos suficientes."
        );
    }

    const optionsSummary = validateModalSpectralOptionsBeforeRun(
        payload,
        errors,
        warnings
    );

    const calibrationSummary = validateModalSpectralCalibrationBeforeRun(
        payload,
        errors,
        warnings
    );

    const casesSummary = validateModalSpectralCasesBeforeRun(
        payload,
        errors,
        warnings
    );

    const validation = {
        ok: errors.length === 0,
        errors,
        warnings,
        summary: {
            nodes: nodes.length,
            frames: frames.length,
            supports: supports.length,
            responseSpectrumFunctions: functions.length,
            responseSpectrumCases: casesSummary.totalCases,
            activeResponseSpectrumCases: casesSummary.activeCases,
            modalCombination: optionsSummary.modalCombination,
            dampingRatio: optionsSummary.dampingRatio,
            numberOfModes: optionsSummary.numberOfModes,
            calibrationEnabled: calibrationSummary.enabled,
            checkedAt: new Date().toISOString(),
        },
    };

    cadSystem && (cadSystem.modalSpectralLastValidation = validation);

    return validation;
}

function createModalSpectralValidationError(validation) {
    const message = [
        "Modal Spectral Analysis bloqueado por validación técnica.",
        "",
        "Errores:",
        ...(validation.errors || []).map((item) => `- ${item}`),
        "",
        "Warnings:",
        ...((validation.warnings || []).length
            ? validation.warnings.map((item) => `- ${item}`)
            : ["- Sin warnings."]),
    ].join("\n");

    const error = new Error(message);
    error.name = "ModalSpectralValidationError";
    error.validation = validation;

    return error;
}

/**
 * Ejecuta el análisis modal espectral desde el sistema CAD.
 *
 * Este controlador:
 * - Prepara el payload.
 * - Llama al cliente Flask.
 * - Guarda resultados en cadSystem.
 * - Actualiza analysisResults.
 *
 * cad_sys.js solo debe llamar a esta función.
 */
export async function runModalSpectralAnalysisFromSystem(cadSystem, customPayload = null) {
    if (!cadSystem) {
        throw new Error("No se recibió cadSystem en runModalSpectralAnalysisFromSystem.");
    }

    try {
        console.log("🚀 Ejecutando Modal Spectral Analysis desde controller...");

        cadSystem.modalSpectralStatus = "running";
        cadSystem.modalSpectralLastError = null;

        // ============================================================
        // BLOQUE 7U-E - Asegurar definiciones espectrales antes del payload
        // ============================================================
        cadSystem.ensureResponseSpectrumDefinitions?.();

        const payload = customPayload || buildModalSpectralPayloadFromCadSystem(cadSystem);

        // ============================================================
        // BLOQUE 7U-E - Sincronizar espectros/casos al payload antes de validar
        // ============================================================
        const spectrumSync = syncResponseSpectrumDefinitionsIntoPayload(
            payload,
            cadSystem
        );

        modalSpectralDebugLog("🧪 7U-E Response Spectrum sync:", spectrumSync);

        // ============================================================
        // BLOQUE 7U-B - Validar payload antes de llamar a Flask
        // ============================================================
        const validation = validateModalSpectralPayloadBeforeRun(payload, cadSystem);

        payload.jhack = {
            ...(payload.jhack || {}),
            modalSpectralValidation: clonePlain(validation),
        };

        cadSystem.modalSpectralLastPayload = payload;
        cadSystem.modalSpectralLastValidation = validation;

        modalSpectralDebugLog("📦 Payload Modal Spectral generado desde JHACK:", {
            model: payload.model,
            jhack: payload.jhack,
            nodes: payload.nodes?.length || payload.model?.nodes?.length || 0,
            frames: payload.frames?.length || payload.beams?.length || payload.model?.frames?.length || 0,
            supports: payload.supports?.length || payload.model?.supports?.length || 0,
        });

        if (validation.ok) {
            modalSpectralDebugLog("🧪 7U validación Modal Spectral:", validation);
        } else {
            console.warn("⚠️ 7U validación Modal Spectral bloqueada:", validation);
        }

        if (validation.warnings.length) {
            if (validation.ok) {
                modalSpectralDebugWarn("⚠️ 7U warnings Modal Spectral:", validation.warnings);
            } else {
                console.warn("⚠️ 7U warnings Modal Spectral:", validation.warnings);
            }
        }

        if (!validation.ok) {
            console.warn("⚠️ 7U errores Modal Spectral:", validation.errors);
            throw createModalSpectralValidationError(validation);
        }

        modalSpectralDebugLog("🧪 7S-C modelCalibration recibido:", payload?.analysis?.modelCalibration);

        const data = await runModalSpectralAnalysisWithOptionalRealCalibration(
            payload,
            runModalSpectralAnalysis
        );

        const resultsPackage = buildModalSpectralResultsPackage(data);
        const table = resultsPackage.table;

        cadSystem.modalSpectralLastResult = data;
        cadSystem.modalSpectralLastTable = table;
        cadSystem.modalSpectralStatus = "completed";
        cadSystem.modalSpectralLastRunAt = new Date().toISOString();

        // =====================================================
        // Guardar resultados dentro del contenedor general
        // de análisis del sistema.
        // =====================================================
        cadSystem.analysisResults = {
            ...(cadSystem.analysisResults || {}),

            status: "completed",
            type: "modal-spectral-analysis",
            completedAt: cadSystem.modalSpectralLastRunAt,

            modalSpectral: {
                ...resultsPackage,
                responseSpectrum: data?.response_spectrum || null,
                modelSummary: data?.model_summary || null,
            },
        };

        cadSystem.displayOptions = {
            ...(cadSystem.displayOptions || {}),
            analysisResultsAvailable: true,
            lastAnalysisRun: cadSystem.modalSpectralLastRunAt,
        };

        window.jhackModalSpectralLastResult = data;
        window.jhackModalSpectralLastTable = table;

        console.log("✅ Modal Spectral Analysis completado desde controller");
        modalSpectralDebugTable(table);

        cadSystem.showMessage?.("Modal Spectral Analysis completado correctamente.");

        return data;
    } catch (error) {
        cadSystem.modalSpectralStatus = "failed";
        cadSystem.modalSpectralLastError = error?.message || String(error);

        // ============================================================
        // BLOQUE 7U-D - Consola limpia para validaciones controladas
        // ============================================================
        if (error?.name === "ModalSpectralValidationError") {
            console.warn("⚠️ Modal Spectral bloqueado por validación técnica:", {
                errors: error.validation?.errors || [],
                warnings: error.validation?.warnings || [],
                summary: error.validation?.summary || {},
            });
        } else {
            console.error("❌ Error en runModalSpectralAnalysisFromSystem:", error);
        }

        if (error?.name === "ModalSpectralValidationError") {
            cadSystem.showMessage?.(
                "Modal Spectral bloqueado por validación técnica. Revisa la consola.",
                "warning"
            );
        } else {
            cadSystem.showMessage?.(
                "Error ejecutando Modal Spectral Analysis. Revisa Flask en http://127.0.0.1:5001",
                "warning"
            );
        }

        throw error;
    }
}

// ============================================================
// BLOQUE 7V-I - Diagnóstico final Modal Spectral para prueba integral
// ============================================================

export function buildModalSpectralFinalReadinessReport(cadSystem) {
    const validation = cadSystem?.modalSpectralLastValidation || null;
    const raw = cadSystem?.modalSpectralLastResult?.raw || cadSystem?.modalSpectralLastResult || null;
    const table = Array.isArray(cadSystem?.modalSpectralLastTable)
        ? cadSystem.modalSpectralLastTable
        : [];

    const summary = raw?.analysis_summary || {};
    const modelSummary = raw?.model_summary || {};

    const validationSummary = validation?.summary || {};

    const checks = [
        {
            key: "validation",
            label: "Validación técnica",
            ok: validation?.ok === true,
            detail: validation?.ok === true ? "OK" : "No aprobada o no ejecutada",
        },
        {
            key: "geometry",
            label: "Geometría",
            ok: Number(validationSummary.nodes || 0) > 0 && Number(validationSummary.frames || 0) > 0,
            detail: `${validationSummary.nodes || 0} nodos / ${validationSummary.frames || 0} frames`,
        },
        {
            key: "spectrum",
            label: "Espectro y casos",
            ok: Number(validationSummary.activeResponseSpectrumCases || 0) > 0,
            detail: `${validationSummary.activeResponseSpectrumCases || 0} casos activos`,
        },
        {
            key: "engine",
            label: "Motor OpenSeesPy",
            ok: raw?.engine === "OpenSeesPy" || !!raw?.opensees_real_modal_eigen,
            detail: raw?.engine || "No detectado",
        },
        {
            key: "results",
            label: "Resultados espectrales",
            ok: table.length > 0,
            detail: `${table.length} filas en tabla final`,
        },
        {
            key: "modal_combination",
            label: "Combinación modal",
            ok: table.some((row) =>
                row?.metodo_combinacion ||
                row?.modos_combinados !== undefined ||
                row?.desplazamiento_comb_m !== undefined ||
                row?.deriva_comb !== undefined ||
                row?.cortante_comb_tonf !== undefined
            ),
            detail: summary.modal_combination || summary.modal_response_combination || "Detectado desde tabla",
        },
        {
            key: "supports",
            label: "Soportes",
            ok: true,
            detail:
                Number(validationSummary.supports || 0) > 0
                    ? `${validationSummary.supports} apoyos explícitos`
                    : `Sin apoyos explícitos. Revisión pendiente; el análisis puede usar fallback o configuración posterior.`,
            warning: Number(validationSummary.supports || 0) === 0,
        },
        {
            key: "etabs_comparison",
            label: "Comparación ETABS",
            ok: table.some((row) => row?.caso || row?.case),
            detail: "Casos SDX/SDY/DER disponibles en tabla",
        },
    ];

    const failed = checks.filter((item) => !item.ok);
    const warnings = checks.filter((item) => item.warning);

    const status = failed.length > 0
        ? "CRITICAL"
        : warnings.length > 0
            ? "REVIEW"
            : "OK";

    return {
        status,
        readyForIntegralTest: failed.length === 0,
        generatedAt: new Date().toISOString(),
        checks,
        failed,
        warnings,
        summary: {
            cases: table.length,
            nodes: validationSummary.nodes ?? 0,
            frames: validationSummary.frames ?? 0,
            supports: validationSummary.supports ?? 0,
            activeSpectrumCases: validationSummary.activeResponseSpectrumCases ?? 0,
            modalCombination: summary.modal_combination || summary.modal_response_combination || null,
            engine: raw?.engine || null,
        },
    };
}
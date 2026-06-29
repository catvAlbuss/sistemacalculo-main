// resources/js/cad/analysis/6_modalSpectralResults.js

function toNumber(value, fallback = null) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function safeText(value, fallback = "-") {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
}

function getNestedNumber(value, fallback = 0) {
    return toNumber(value, fallback);
}

function getFinalResults(item) {
    return item?.final_spectral_results || {};
}

function getSingleModeResults(item) {
    return item?.spectral_results || {};
}

function getCombinationResults(item) {
    return item?.modal_combination_results || {};
}

function getCombinedValues(item) {
    return item?.modal_combination_results?.combined || {};
}

/**
 * Convierte la respuesta cruda del backend en una tabla amigable.
 *
 * Desde el BLOQUE 7H:
 * - desplazamiento_m
 * - deriva
 * - cortante_tonf
 *
 * ahora representan el resultado FINAL del caso.
 * Si existe combinación modal CQC/SRSS/ABS, usa final_spectral_results.
 * Si no existe, usa el resultado de 1 modo.
 */
export function summarizeModalSpectralResults(data) {
    if (!data || !Array.isArray(data.results)) {
        return [];
    }

    return data.results.map((item) => {
        const input = item.input || {};
        const modal = item.modal_results || {};
        const comparison = item.comparison || {};

        const single = getSingleModeResults(item);
        const combination = getCombinationResults(item);
        const combined = getCombinedValues(item);
        const final = getFinalResults(item);

        const finalDisplacement = getNestedNumber(
            final.spectral_displacement_m ??
            single.spectral_displacement_m,
            0
        );

        const finalDrift = getNestedNumber(
            final.estimated_drift ??
            single.estimated_drift,
            0
        );

        const finalBaseShear = getNestedNumber(
            final.equivalent_force_tonf ??
            single.equivalent_force_tonf,
            0
        );

        return {
            // ========================================================
            // Datos básicos del caso
            // ========================================================
            caso: safeText(item.case_name),
            direccion: safeText(item.direction),

            // ========================================================
            // Periodo / modo real usado
            // ========================================================
            periodo_s: getNestedNumber(modal.period_s, 0),
            frecuencia_hz: getNestedNumber(modal.frequency_hz, 0),

            periodo_usado_s: getNestedNumber(
                input.period_for_calculation_s ??
                modal.period_s,
                0
            ),

            fuente_periodo: safeText(
                input.period_source ??
                modal.period_source,
                "-"
            ),

            modo_real: input.selected_real_mode ?? modal.selected_real_mode ?? null,

            // ========================================================
            // Masa usada
            // ========================================================
            masa_caso_kg: getNestedNumber(input.effective_mass_kg, 0),

            masa_usada_kg: getNestedNumber(
                input.mass_for_calculation_kg ??
                input.effective_mass_kg,
                0
            ),

            fuente_masa: safeText(input.mass_source, "-"),

            participacion_modal_pct: getNestedNumber(
                input.modal_effective_mass_ratio_percent,
                null
            ),

            participacion_modal_acum_pct: getNestedNumber(
                input.modal_cumulative_mass_ratio_percent,
                null
            ),

            // ========================================================
            // Resultado de 1 modo
            // ========================================================
            desplazamiento_1modo_m: getNestedNumber(
                single.spectral_displacement_m,
                0
            ),

            deriva_1modo: getNestedNumber(
                single.estimated_drift,
                0
            ),

            cortante_1modo_tonf: getNestedNumber(
                single.equivalent_force_tonf,
                0
            ),

            // ========================================================
            // Resultado combinado modal
            // ========================================================
            metodo_combinacion: safeText(
                combination.method ??
                final.modal_combination_method,
                "-"
            ),

            modos_combinados: getNestedNumber(
                combined.modes_combined,
                0
            ),

            desplazamiento_comb_m: getNestedNumber(
                combined.spectral_displacement_m,
                null
            ),

            deriva_comb: getNestedNumber(
                combined.estimated_drift,
                null
            ),

            cortante_comb_tonf: getNestedNumber(
                combined.equivalent_force_tonf,
                null
            ),

            // ========================================================
            // Resultado final del caso
            // Estos campos mantienen compatibilidad con la UI anterior.
            // ========================================================
            fuente_final: safeText(final.source, "single_mode"),

            desplazamiento_m: finalDisplacement,
            deriva: finalDrift,
            cortante_tonf: finalBaseShear,

            desplazamiento_final_m: finalDisplacement,
            deriva_final: finalDrift,
            cortante_final_tonf: finalBaseShear,

            // ========================================================
            // Errores comparativos
            // ========================================================
            error_cortante_pct: getNestedNumber(
                comparison.error_percent?.base_shear,
                0
            ),

            error_desplazamiento_pct: getNestedNumber(
                comparison.error_percent?.max_displacement,
                0
            ),

            error_deriva_pct: getNestedNumber(
                comparison.error_percent?.drift,
                0
            ),

            fuente_comparacion: safeText(
                comparison.calculated_source ??
                final.source,
                "-"
            ),

            raw: item,
        };
    });
}

/**
 * Extrae un resumen general de la respuesta del backend.
 */
export function getModalSpectralSummary(data, table = []) {
    const analysisSummary = data?.analysis_summary || {};
    const modelSummary = data?.model_summary || {};
    const responseSpectrum = data?.response_spectrum || {};

    return {
        status: analysisSummary.status || "OK",

        totalCases:
            analysisSummary.total_cases ??
            table.length,

        successfulCases:
            analysisSummary.successful_cases ??
            table.length,

        failedCases:
            analysisSummary.failed_cases ?? 0,

        numberOfModes:
            analysisSummary.number_of_modes ??
            data?.analysis?.numberOfModes ??
            "-",

        modalCombination:
            analysisSummary.modal_response_combination ||
            analysisSummary.modal_combination ||
            data?.analysis?.modalCombination ||
            "CQC",

        modalDampingRatio:
            analysisSummary.modal_damping_ratio ?? 0.05,

        useRealModalPeriods:
            analysisSummary.use_real_modal_periods ?? false,

        useModalParticipatingMass:
            analysisSummary.use_modal_participating_mass ?? false,

        useCombinedModalResults:
            analysisSummary.use_combined_modal_results ?? false,

        realModalEigenOk:
            analysisSummary.real_modal_eigen_ok ?? false,

        realModalParticipationOk:
            analysisSummary.real_modal_participation_ok ?? false,

        engine:
            data?.engine || "OpenSeesPy",

        modelName:
            modelSummary.name ||
            data?.model_summary?.name ||
            "JHACK Current Model",

        nodesCount:
            modelSummary.nodes_count ??
            modelSummary.nodesCount ??
            0,

        framesCount:
            modelSummary.frames_count ??
            modelSummary.framesCount ??
            0,

        supportsCount:
            modelSummary.supports_count ??
            modelSummary.supportsCount ??
            0,

        sectionsCount:
            modelSummary.sections_count ??
            modelSummary.sectionsCount ??
            0,

        materialsCount:
            modelSummary.materials_count ??
            modelSummary.materialsCount ??
            0,

        responseSpectrumName:
            responseSpectrum.name ||
            data?.response_spectrum?.name ||
            "-",

        importantNote:
            data?.important_note || null,
    };
}

/**
 * Arma un paquete completo de resultados normalizados.
 */
export function buildModalSpectralResultsPackage(data) {
    const table = summarizeModalSpectralResults(data);
    const summary = getModalSpectralSummary(data, table);

    return {
        type: "modal-spectral-results-package",
        createdAt: new Date().toISOString(),
        raw: data,
        table,
        summary,
    };
}

/**
 * Formatos numéricos usados por UI o exportación.
 */
export function formatModalSpectralNumber(value, decimals = 3) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "-";
    }

    return number.toFixed(decimals);
}

export function formatModalSpectralScientific(value, decimals = 3) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "-";
    }

    return number.toExponential(decimals);
}

export function formatModalSpectralPercent(value, decimals = 4) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "-";
    }

    return `${number.toFixed(decimals)}%`;
}
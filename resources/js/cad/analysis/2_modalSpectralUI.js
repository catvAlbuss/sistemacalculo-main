// resources/js/cad/analysis/2_modalSpectralUI.js

import Swal from "sweetalert2";

// ============================================================
// BLOQUE 7T-C - Modal Spectral Options Dialog tipo ETABS
// ============================================================

export async function openModalSpectralOptionsDialog(cadSystem) {
  if (!cadSystem) return null;

  cadSystem.ensureModalSpectralOptions?.();

  const currentOptions = {
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

    ...(cadSystem.modalSpectralOptions || {}),
  };

  const currentCalibration = {
    enabled: false,
    globalStiffnessScale: 1.0,
    globalMassScale: 1.0,
    axialStiffnessScale: 1.0,
    bendingStiffnessScale: 1.0,
    torsionStiffnessScale: 1.0,

    ...(cadSystem.modalSpectralModelCalibration || {}),
  };

  const checked = (value) => value === true ? "checked" : "";

  const selected = (value, expected) => {
    return String(value).toUpperCase() === String(expected).toUpperCase()
      ? "selected"
      : "";
  };

  const result = await Swal.fire({
    title: "Modal Spectral Analysis Options",
    width: 860,
    html: `
      <div style="text-align:left; font-size:13px;">

        <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; background:#0b1220;">
          <b>Analysis Options</b><br>
          <span style="font-size:12px; color:#9ca3af;">
            Configuración persistente tipo ETABS. Estos valores se guardan en cadSystem y viajan en el payload.
          </span>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px;">

          <div style="border:1px solid #555; border-radius:6px; padding:10px;">
            <h4 style="margin:0 0 10px 0;">Modal Combination</h4>

            <label style="display:block; margin-bottom:5px;">Combination Method</label>
            <select id="ms-modal-combination" style="width:100%; padding:7px; margin-bottom:10px;">
              <option value="CQC" ${selected(currentOptions.modalCombination, "CQC")}>CQC</option>
              <option value="SRSS" ${selected(currentOptions.modalCombination, "SRSS")}>SRSS</option>
              <option value="ABS" ${selected(currentOptions.modalCombination, "ABS")}>ABS</option>
            </select>

            <label style="display:block; margin-bottom:5px;">Damping Ratio</label>
            <input
              id="ms-damping-ratio"
              type="number"
              step="0.001"
              min="0.001"
              max="1"
              value="${Number(currentOptions.dampingRatio ?? 0.05)}"
              style="width:100%; padding:7px; margin-bottom:10px;"
            >

            <label style="display:block; margin-bottom:5px;">Number of Modes</label>
            <input
              id="ms-number-of-modes"
              type="number"
              step="1"
              min="1"
              value="${Number(currentOptions.numberOfModes ?? 12)}"
              style="width:100%; padding:7px;"
            >
          </div>

          <div style="border:1px solid #555; border-radius:6px; padding:10px;">
            <h4 style="margin:0 0 10px 0;">Advanced Analysis Flags</h4>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input id="ms-use-real-periods" type="checkbox" ${checked(currentOptions.useRealModalPeriods)}>
              Use Real Modal Periods
            </label>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input id="ms-use-modal-mass" type="checkbox" ${checked(currentOptions.useModalParticipatingMass)}>
              Use Modal Participating Mass
            </label>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input id="ms-use-combined-results" type="checkbox" ${checked(currentOptions.useCombinedModalResults)}>
              Use Combined Modal Results
            </label>

            <div style="margin-top:10px; color:#9ca3af; font-size:12px;">
              Recomendado para flujo actual: los tres activados.
            </div>
          </div>

          <div style="border:1px solid #555; border-radius:6px; padding:10px;">
            <h4 style="margin:0 0 10px 0;">Diaphragms / Mass Source</h4>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
              <input id="ms-use-rigid-diaphragms" type="checkbox" ${checked(currentOptions.useRigidDiaphragms)}>
              Use Rigid Diaphragms by Story
            </label>

            <label style="display:block; margin-bottom:5px;">Diaphragm Mode</label>
            <select id="ms-diaphragm-mode" style="width:100%; padding:7px; margin-bottom:10px;">
              <option value="rigid_by_story" ${selected(currentOptions.diaphragmMode, "rigid_by_story")}>Rigid by Story</option>
              <option value="none" ${selected(currentOptions.diaphragmMode, "none")}>None</option>
            </select>

            <label style="display:block; margin-bottom:5px;">Mass Source Mode</label>
            <select id="ms-mass-source-mode" style="width:100%; padding:7px; margin-bottom:10px;">
              <option value="story_mass" ${selected(currentOptions.massSourceMode, "story_mass")}>Story Mass</option>
              <option value="nodal_mass" ${selected(currentOptions.massSourceMode, "nodal_mass")}>Nodal Mass</option>
              <option value="fallback" ${selected(currentOptions.massSourceMode, "fallback")}>Fallback</option>
            </select>

            <label style="display:block; margin-bottom:5px;">Story Mass Distribution</label>
            <select id="ms-story-mass-distribution" style="width:100%; padding:7px;">
              <option value="by_level" ${selected(currentOptions.storyMassDistribution, "by_level")}>By Level</option>
              <option value="uniform" ${selected(currentOptions.storyMassDistribution, "uniform")}>Uniform</option>
            </select>
          </div>

          <div style="border:1px solid #555; border-radius:6px; padding:10px;">
            <h4 style="margin:0 0 10px 0;">Real Model Calibration</h4>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
              <input id="ms-calibration-enabled" type="checkbox" ${checked(currentCalibration.enabled)}>
              Enable Real Calibration
            </label>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
              <div>
                <label style="display:block; margin-bottom:5px;">Global K Scale</label>
                <input id="ms-global-stiffness-scale" type="number" step="0.001" min="0.001"
                  value="${Number(currentCalibration.globalStiffnessScale ?? 1)}"
                  style="width:100%; padding:7px;">
              </div>

              <div>
                <label style="display:block; margin-bottom:5px;">Global M Scale</label>
                <input id="ms-global-mass-scale" type="number" step="0.001" min="0.001"
                  value="${Number(currentCalibration.globalMassScale ?? 1)}"
                  style="width:100%; padding:7px;">
              </div>

              <div>
                <label style="display:block; margin-bottom:5px;">Axial Scale</label>
                <input id="ms-axial-stiffness-scale" type="number" step="0.001" min="0.001"
                  value="${Number(currentCalibration.axialStiffnessScale ?? 1)}"
                  style="width:100%; padding:7px;">
              </div>

              <div>
                <label style="display:block; margin-bottom:5px;">Bending Scale</label>
                <input id="ms-bending-stiffness-scale" type="number" step="0.001" min="0.001"
                  value="${Number(currentCalibration.bendingStiffnessScale ?? 1)}"
                  style="width:100%; padding:7px;">
              </div>

              <div>
                <label style="display:block; margin-bottom:5px;">Torsion Scale</label>
                <input id="ms-torsion-stiffness-scale" type="number" step="0.001" min="0.001"
                  value="${Number(currentCalibration.torsionStiffnessScale ?? 1)}"
                  style="width:100%; padding:7px;">
              </div>
            </div>

            <div style="margin-top:10px; color:#9ca3af; font-size:12px;">
              Si está desactivado, el backend usará todos los factores en 1.0.
            </div>
          </div>
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#9ca3af; font-size:12px;">
          Recomendación para prueba 7S/7T: activar calibración y usar Global K Scale = 0.25 para verificar que se genere Real Calibration Comparison.
        </div>
      </div>
    `,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "Guardar opciones",
    denyButtonText: "Restaurar defaults",
    cancelButtonText: "Cancelar",

    preConfirm: () => {
      return readModalSpectralOptionsDialogValues();
    },
  });

  if (result.isDenied) {
    cadSystem.modalSpectralOptions = {
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

    cadSystem.modalSpectralModelCalibration = {
      enabled: false,
      globalStiffnessScale: 1.0,
      globalMassScale: 1.0,
      axialStiffnessScale: 1.0,
      bendingStiffnessScale: 1.0,
      torsionStiffnessScale: 1.0,
    };

    cadSystem.ensureModalSpectralOptions?.();

    cadSystem.showMessage?.("Modal Spectral Options restauradas a valores por defecto.");

    console.log("✅ 7T-C Modal Spectral Options restauradas por defecto:", {
      modalSpectralOptions: cadSystem.modalSpectralOptions,
      modalSpectralModelCalibration: cadSystem.modalSpectralModelCalibration,
    });

    return {
      modalSpectralOptions: cadSystem.modalSpectralOptions,
      modalSpectralModelCalibration: cadSystem.modalSpectralModelCalibration,
      restoredDefaults: true,
    };
  }

  if (!result.isConfirmed || !result.value) {
    return null;
  }

  cadSystem.modalSpectralOptions = result.value.modalSpectralOptions;
  cadSystem.modalSpectralModelCalibration = result.value.modalSpectralModelCalibration;

  cadSystem.ensureModalSpectralOptions?.();

  cadSystem.showMessage?.("Modal Spectral Options guardadas correctamente.");

  console.log("✅ 7T-C Modal Spectral Options guardadas:", {
    modalSpectralOptions: cadSystem.modalSpectralOptions,
    modalSpectralModelCalibration: cadSystem.modalSpectralModelCalibration,
  });

  return {
    modalSpectralOptions: cadSystem.modalSpectralOptions,
    modalSpectralModelCalibration: cadSystem.modalSpectralModelCalibration,
  };
}

function readModalSpectralOptionsDialogValues() {
  const readBoolean = (id) => {
    return document.getElementById(id)?.checked === true;
  };

  const readText = (id, fallback = "") => {
    const value = document.getElementById(id)?.value;
    return value === undefined || value === null || value === ""
      ? fallback
      : value;
  };

  const readPositiveNumber = (id, fallback = 1) => {
    const value = Number(document.getElementById(id)?.value ?? fallback);

    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return value;
  };

  const modalCombination = String(
    readText("ms-modal-combination", "CQC")
  ).toUpperCase();

  if (!["CQC", "SRSS", "ABS"].includes(modalCombination)) {
    Swal.showValidationMessage("Modal Combination debe ser CQC, SRSS o ABS.");
    return false;
  }

  const dampingRatio = readPositiveNumber("ms-damping-ratio", 0.05);

  if (dampingRatio === null || dampingRatio > 1) {
    Swal.showValidationMessage("Damping Ratio debe ser mayor que 0 y menor o igual que 1.");
    return false;
  }

  const numberOfModes = readPositiveNumber("ms-number-of-modes", 12);

  if (numberOfModes === null) {
    Swal.showValidationMessage("Number of Modes debe ser mayor que 0.");
    return false;
  }

  const globalStiffnessScale = readPositiveNumber("ms-global-stiffness-scale", 1);
  const globalMassScale = readPositiveNumber("ms-global-mass-scale", 1);
  const axialStiffnessScale = readPositiveNumber("ms-axial-stiffness-scale", 1);
  const bendingStiffnessScale = readPositiveNumber("ms-bending-stiffness-scale", 1);
  const torsionStiffnessScale = readPositiveNumber("ms-torsion-stiffness-scale", 1);

  if (
    globalStiffnessScale === null ||
    globalMassScale === null ||
    axialStiffnessScale === null ||
    bendingStiffnessScale === null ||
    torsionStiffnessScale === null
  ) {
    Swal.showValidationMessage("Todos los factores de calibración deben ser mayores que 0.");
    return false;
  }

  return {
    modalSpectralOptions: {
      useRigidDiaphragms: readBoolean("ms-use-rigid-diaphragms"),
      diaphragmMode: readText("ms-diaphragm-mode", "rigid_by_story"),
      massSourceMode: readText("ms-mass-source-mode", "story_mass"),
      storyMassDistribution: readText("ms-story-mass-distribution", "by_level"),

      modalCombination,
      dampingRatio,

      numberOfModes: Math.max(1, Math.round(numberOfModes)),
      useRealModalPeriods: readBoolean("ms-use-real-periods"),
      useModalParticipatingMass: readBoolean("ms-use-modal-mass"),
      useCombinedModalResults: readBoolean("ms-use-combined-results"),
    },

    modalSpectralModelCalibration: {
      enabled: readBoolean("ms-calibration-enabled"),
      globalStiffnessScale,
      globalMassScale,
      axialStiffnessScale,
      bendingStiffnessScale,
      torsionStiffnessScale,
    },
  };
}

/**
 * Abre una ventana temporal para ejecutar Modal Spectral Analysis.
 */
export async function openModalSpectralAnalysisDialog(cadSystem) {
  if (!cadSystem) return null;

  const currentStatus = cadSystem.modalSpectralStatus || "not_run";

  const result = await Swal.fire({
    title: "Modal Spectral Analysis",
    width: 760,
    html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Se ejecutará el análisis modal espectral usando el backend Flask + OpenSeesPy.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <b>Endpoint:</b><br>
          <code>http://127.0.0.1:5001/api/analyze/modal-spectral</code>
        </div>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <b>Flujo actual:</b>
          <ul style="margin-top:8px; padding-left:18px;">
            <li>Construcción del modelo real desde nodes/frames.</li>
            <li>Eigen real con OpenSeesPy.</li>
            <li>Periodos reales.</li>
            <li>Masa participante modal aproximada.</li>
            <li>Combinación modal CQC / SRSS / ABS.</li>
            <li>Resultado final usando combinación modal cuando esté disponible.</li>
          </ul>
        </div>

        <div style="border:1px solid #555; border-radius:6px; padding:10px;">
          <b>Estado actual:</b> ${escapeHtml(currentStatus)}<br>
          <span style="font-size:12px; color:#777;">
            Recomendado: ejecutar con un modelo que tenga barras/nodos reales dibujados.
          </span>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Ejecutar análisis",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return null;

  return await executeModalSpectralAnalysisWithLoading(cadSystem);
}

/**
 * Ejecuta Modal Spectral mostrando ventana de carga.
 */
export async function executeModalSpectralAnalysisWithLoading(cadSystem) {
  if (!cadSystem) return null;

  try {
    Swal.fire({
      title: "Modal Spectral Analysis",
      html: "Ejecutando análisis con Flask + OpenSeesPy...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const data = await cadSystem.runModalSpectralAnalysisFromMenu();

    await showModalSpectralExecutionResult(cadSystem);

    return data;
  } catch (error) {
    console.error("❌ Error en executeModalSpectralAnalysisWithLoading:", error);

    // ============================================================
    // BLOQUE 7U-C - Mostrar validación técnica en UI
    // ============================================================
    if (error?.name === "ModalSpectralValidationError") {
      const validation = error.validation || {};
      const errors = Array.isArray(validation.errors) ? validation.errors : [];
      const warnings = Array.isArray(validation.warnings) ? validation.warnings : [];
      const summary = validation.summary || {};

      const errorsHtml = errors.length
        ? errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
        : `<li>Sin errores críticos.</li>`;

      const warningsHtml = warnings.length
        ? warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
        : `<li>Sin advertencias.</li>`;

      await Swal.fire({
        icon: "warning",
        title: "Modal Spectral bloqueado por validación",
        width: 760,
        html: `
          <div style="text-align:left; font-size:13px;">
            <p>
              El análisis no se ejecutó porque el modelo o la configuración todavía no cumplen los requisitos mínimos.
            </p>

            <div style="border:1px solid #7f1d1d; border-radius:6px; padding:10px; margin-top:10px;">
              <b>Errores críticos:</b>
              <ul style="margin-top:8px; padding-left:18px;">
                ${errorsHtml}
              </ul>
            </div>

            <div style="border:1px solid #78350f; border-radius:6px; padding:10px; margin-top:10px;">
              <b>Advertencias:</b>
              <ul style="margin-top:8px; padding-left:18px;">
                ${warningsHtml}
              </ul>
            </div>

            <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-top:10px; color:#777;">
              <b>Resumen:</b><br>
              Nodos: ${escapeHtml(summary.nodes ?? "-")}<br>
              Frames: ${escapeHtml(summary.frames ?? "-")}<br>
              Apoyos: ${escapeHtml(summary.supports ?? "-")}<br>
              Casos espectrales activos: ${escapeHtml(summary.activeResponseSpectrumCases ?? "-")}<br>
              Método modal: ${escapeHtml(summary.modalCombination ?? "-")}<br>
              Modos: ${escapeHtml(summary.numberOfModes ?? "-")}
            </div>

            <p style="margin-top:10px; color:#777;">
              Solución: dibuja o carga un modelo con nodos y barras, y verifica que existan Response Spectrum Cases.
            </p>
          </div>
        `,
        confirmButtonText: "Entendido",
      });

      return null;
    }

    await Swal.fire({
      icon: "error",
      title: "Error en Modal Spectral Analysis",
      html: `
        <div style="text-align:left; font-size:13px;">
          <p>No se pudo ejecutar el análisis.</p>
          <p>Verifica que Flask esté corriendo en:</p>
          <code>http://127.0.0.1:5001</code>
          <p style="margin-top:10px; color:#777;">
            Detalle: ${escapeHtml(error?.message || error)}
          </p>
        </div>
      `,
      confirmButtonText: "Entendido",
    });

    throw error;
  }
}

/**
 * Muestra resultado después de ejecutar el análisis.
 */
export async function showModalSpectralExecutionResult(cadSystem) {
  const table = cadSystem?.modalSpectralLastTable || [];
  const raw = cadSystem?.modalSpectralLastResult || null;
  const summary = raw?.analysis_summary || {};

  const rowsHtml = buildModalSpectralRowsHtml(table, false);

  return await Swal.fire({
    icon: "success",
    title: "Modal Spectral Analysis completado",
    width: "95vw",
    html: `
      <div style="text-align:left; font-size:12px;">
        <p style="margin-bottom:10px;">
          El análisis modal espectral se ejecutó correctamente.
        </p>

        ${buildModalSpectralExecutiveSummaryHtml(cadSystem, raw, table)}

        ${buildSummaryCardsHtml(summary, table)}

        ${buildModalSpectralRunConfigSectionHtml(cadSystem, raw)}

        ${buildModalSpectralCompletionChecklistHtml(cadSystem, raw, table)}

        ${buildModalParticipationSectionHtml(raw)}

        ${buildStoryResponseSectionHtml(raw)}

        ${buildEtabsComparisonSummaryHtml(raw)}

        ${buildModalSpectralExportActionsHtml()}

        ${buildModalSpectralReportHistoryHtml()}

        ${buildCalibrationDiagnosticsSectionHtml(raw)}

        ${buildCalibratedEstimateResultsSectionHtml(raw)}

        ${buildRealCalibrationComparisonSectionHtml(raw)}

        ${buildEtabsComparisonSectionHtml(raw)}

        ${buildBasicModalSpectralTableHtml(rowsHtml)}

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
          Resultado guardado en memoria de sesión:
          <br>
          <code>cadSystem.analysisResults.modalSpectral</code>
          <br>
          <code>cadSystem.modalSpectralLastResult</code>
          <br>
          <code>cadSystem.modalSpectralLastValidation</code>
        </div>
      </div>
    `,
    confirmButtonText: "OK",
  });
}

/**
 * Muestra resultados guardados sin volver a ejecutar Flask.
 */
export function openModalSpectralResultsDialog(cadSystem) {
  if (!cadSystem) return;

  const table =
    cadSystem.modalSpectralLastTable ||
    cadSystem.analysisResults?.modalSpectral?.table ||
    [];

  const raw =
    cadSystem.modalSpectralLastResult ||
    cadSystem.analysisResults?.modalSpectral?.raw ||
    null;

  if (!table.length || !raw) {
    Swal.fire({
      icon: "warning",
      title: "Modal Spectral Results",
      html: `
        <div style="text-align:left; font-size:13px;">
          <p>No hay resultados de análisis modal espectral disponibles.</p>
          <p style="margin-top:8px;">Primero ejecuta:</p>
          <code>Analizar &gt; Modal Spectral Analysis...</code>
        </div>
      `,
      confirmButtonText: "Entendido",
    });

    return;
  }

  const summary = raw.analysis_summary || {};
  const rowsHtml = buildModalSpectralRowsHtml(table, true);

  Swal.fire({
    title: "Modal Spectral Results",
    width: "98vw",
    html: `
      <div style="text-align:left; font-size:12px;">

        ${buildModalSpectralExecutiveSummaryHtml(cadSystem, raw, table)}

        ${buildSummaryCardsHtml(summary, table)}

        ${buildModalSpectralRunConfigSectionHtml(cadSystem, raw)}

        ${buildModalSpectralCompletionChecklistHtml(cadSystem, raw, table)}

        ${buildModalParticipationSectionHtml(raw)}

        ${buildStoryResponseSectionHtml(raw)}

        ${buildEtabsComparisonSummaryHtml(raw)}

        ${buildModalSpectralExportActionsHtml()}

        ${buildModalSpectralReportHistoryHtml()}

        ${buildCalibrationDiagnosticsSectionHtml(raw)}

        ${buildCalibratedEstimateResultsSectionHtml(raw)}

        ${buildRealCalibrationComparisonSectionHtml(raw)}

        ${buildEtabsComparisonSectionHtml(raw)}

        ${buildFullModalSpectralTableHtml(rowsHtml)}

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
          Resultado guardado en memoria de sesión:
          <br>
          <code>cadSystem.analysisResults.modalSpectral</code>
          <br>
          <code>cadSystem.modalSpectralLastResult</code>
          <br>
          <code>cadSystem.modalSpectralLastValidation</code>
        </div>
      </div>
    `,
    confirmButtonText: "Cerrar",
  });
}

/**
 * Construye tarjetas de resumen.
 */
function buildSummaryCardsHtml(summary = {}, table = []) {
  const status = summary.status || "OK";
  const successfulCases = summary.successful_cases ?? table.length;
  const totalCases = summary.total_cases ?? table.length;
  const modes = summary.number_of_modes ?? "-";
  const combination =
    summary.modal_response_combination ||
    summary.modal_combination ||
    "CQC";

  const damping = summary.modal_damping_ratio ?? 0.05;

  const realEigen = summary.real_modal_eigen_ok ? "Sí" : "No";
  const participation = summary.real_modal_participation_ok ? "Sí" : "No";
  const finalCombined = summary.use_combined_modal_results ? "Sí" : "No";

  return `
    <div style="display:grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap:8px; margin-bottom:12px;">
      ${buildCardHtml("Status", status)}
      ${buildCardHtml("Casos", `${successfulCases} / ${totalCases}`)}
      ${buildCardHtml("Modos", modes)}
      ${buildCardHtml("Combinación", `${combination} | ξ=${damping}`)}
      ${buildCardHtml("Eigen real", realEigen)}
      ${buildCardHtml("Masa participante", participation)}
      ${buildCardHtml("Resultado combinado", finalCombined)}
      ${buildCardHtml("Motor", "OpenSeesPy")}
    </div>
  `;
}

function buildCardHtml(title, value) {
  return `
    <div style="border:1px solid #555; border-radius:6px; padding:8px;">
      <b>${escapeHtml(title)}</b><br>
      ${escapeHtml(value)}
    </div>
  `;
}

// ============================================================
// BLOQUE 7V-D - Resumen visual de configuración y validación
// ============================================================

function buildModalSpectralRunConfigSectionHtml(cadSystem, raw = null) {
  const summary = raw?.analysis_summary || {};

  const options =
    cadSystem?.modalSpectralOptions ||
    raw?.jhack?.modalSpectralOptions ||
    raw?.analysis?.modalSpectralOptions ||
    {};

  const calibration =
    cadSystem?.modalSpectralModelCalibration ||
    raw?.jhack?.modelCalibration ||
    raw?.analysis?.modelCalibration ||
    {};

  const validation =
    cadSystem?.modalSpectralLastValidation ||
    raw?.jhack?.modalSpectralValidation ||
    raw?.modalSpectralValidation ||
    null;

  const validationSummary = validation?.summary || {};

  const modalCombination =
    options.modalCombination ||
    summary.modal_combination ||
    summary.modal_response_combination ||
    "-";

  const dampingRatio =
    options.dampingRatio ??
    summary.modal_damping_ratio ??
    "-";

  const numberOfModes =
    options.numberOfModes ??
    summary.number_of_modes ??
    "-";

  const calibrationEnabled = calibration.enabled === true;

  const validationOk = validation?.ok === true;

  const validationBadge = validation
    ? validationOk
      ? `<span style="display:inline-block; padding:2px 8px; border-radius:999px; background:#064e3b; color:#d1fae5; font-weight:bold;">OK</span>`
      : `<span style="display:inline-block; padding:2px 8px; border-radius:999px; background:#7f1d1d; color:#fee2e2; font-weight:bold;">BLOCKED</span>`
    : `<span style="display:inline-block; padding:2px 8px; border-radius:999px; background:#374151; color:#e5e7eb;">NO DATA</span>`;

  const calibrationBadge = calibrationEnabled
    ? `<span style="display:inline-block; padding:2px 8px; border-radius:999px; background:#1d4ed8; color:#dbeafe; font-weight:bold;">ON</span>`
    : `<span style="display:inline-block; padding:2px 8px; border-radius:999px; background:#374151; color:#e5e7eb;">OFF</span>`;

  const warnings = Array.isArray(validation?.warnings)
    ? validation.warnings
    : [];

  const errors = Array.isArray(validation?.errors)
    ? validation.errors
    : [];

  const warningHtml = warnings.length
    ? `
      <div style="margin-top:8px; padding:8px; border:1px solid #78350f; border-radius:6px; color:#fef3c7; background:#451a03;">
        <b>Warnings:</b>
        <ul style="margin:6px 0 0 0; padding-left:18px;">
          ${warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    `
    : "";

  const errorHtml = errors.length
    ? `
      <div style="margin-top:8px; padding:8px; border:1px solid #7f1d1d; border-radius:6px; color:#fee2e2; background:#450a0a;">
        <b>Validation errors:</b>
        <ul style="margin:6px 0 0 0; padding-left:18px;">
          ${errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    `
    : "";

  return `
    <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; background:#0b1220;">
      <div style="margin-bottom:8px;">
        <b>Run Configuration / Technical Validation</b>
        <span style="color:#777;">— configuración usada antes de enviar a OpenSeesPy</span>
      </div>

      <div style="display:grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap:8px; margin-bottom:8px;">
        ${buildSummaryMiniCardHtml("Validación", validationBadge)}
        ${buildSummaryMiniCardHtml("Combinación", escapeHtml(modalCombination))}
        ${buildSummaryMiniCardHtml("Damping", escapeHtml(dampingRatio))}
        ${buildSummaryMiniCardHtml("Modos", escapeHtml(numberOfModes))}

        ${buildSummaryMiniCardHtml("Nodos", validationSummary.nodes ?? "-")}
        ${buildSummaryMiniCardHtml("Frames", validationSummary.frames ?? "-")}
        ${buildSummaryMiniCardHtml("Supports", validationSummary.supports ?? "-")}
        ${buildSummaryMiniCardHtml("Casos activos", validationSummary.activeResponseSpectrumCases ?? "-")}

        ${buildSummaryMiniCardHtml("Rigid Diaphragm", options.useRigidDiaphragms === true ? "Sí" : "No")}
        ${buildSummaryMiniCardHtml("Mass Source", escapeHtml(options.massSourceMode || "-"))}
        ${buildSummaryMiniCardHtml("Calibración real", calibrationBadge)}
        ${buildSummaryMiniCardHtml("Global K", escapeHtml(calibration.globalStiffnessScale ?? "-"))}

        ${buildSummaryMiniCardHtml("Global M", escapeHtml(calibration.globalMassScale ?? "-"))}
        ${buildSummaryMiniCardHtml("Axial K", escapeHtml(calibration.axialStiffnessScale ?? "-"))}
        ${buildSummaryMiniCardHtml("Bending K", escapeHtml(calibration.bendingStiffnessScale ?? "-"))}
        ${buildSummaryMiniCardHtml("Torsion K", escapeHtml(calibration.torsionStiffnessScale ?? "-"))}
      </div>

      ${warningHtml}
      ${errorHtml}
    </div>
  `;
}

// ============================================================
// BLOQUE 7V-E - Resumen ejecutivo final Modal Spectral
// ============================================================

function buildModalSpectralExecutiveSummaryHtml(cadSystem, raw = null, table = []) {
  const summary = raw?.analysis_summary || {};
  const validation =
    cadSystem?.modalSpectralLastValidation ||
    raw?.jhack?.modalSpectralValidation ||
    raw?.modalSpectralValidation ||
    null;

  const results = Array.isArray(raw?.results) ? raw.results : [];

  const totalCases = summary.total_cases ?? table.length ?? results.length ?? 0;
  const successfulCases = summary.successful_cases ?? table.length ?? 0;
  const failedCases = summary.failed_cases ?? 0;

  const validationOk = validation?.ok === true;
  const warningsCount = Array.isArray(validation?.warnings)
    ? validation.warnings.length
    : 0;

  const hasEtabsComparison = results.some((item) => item?.comparison);
  const hasCalibrationDiagnostics = results.some((item) => item?.calibration_diagnostics);
  const hasCalibratedEstimate = results.some((item) => item?.calibrated_estimate_results);
  const hasRealCalibrationComparison = raw?.real_calibration_comparison?.ok === true;

  const criticalCases =
    summary.calibration_critical_cases ??
    countModalSpectralCriticalCases(results);

  const reviewCases =
    summary.calibration_review_cases ??
    countModalSpectralReviewCases(results);

  let globalStatus = "OK";

  if (!validationOk || failedCases > 0 || criticalCases > 0) {
    globalStatus = "CRITICAL";
  } else if (warningsCount > 0 || reviewCases > 0) {
    globalStatus = "REVIEW";
  }

  const statusBadge = buildExecutiveStatusBadgeHtml(globalStatus);

  const engine = raw?.engine || "OpenSeesPy";
  const modalCombination =
    summary.modal_combination ||
    summary.modal_response_combination ||
    cadSystem?.modalSpectralOptions?.modalCombination ||
    "-";

  const numberOfModes =
    summary.number_of_modes ??
    cadSystem?.modalSpectralOptions?.numberOfModes ??
    "-";

  const forceUnit = summary.force_output_unit || "tonf";

  const validationText = validation
    ? validationOk
      ? "Validación técnica aprobada antes de ejecutar."
      : "Validación técnica bloqueó el análisis."
    : "Validación técnica no registrada.";

  const comparisonText = hasEtabsComparison
    ? "Comparación JHACK vs ETABS disponible."
    : "Comparación JHACK vs ETABS no disponible.";

  const calibrationText = hasRealCalibrationComparison
    ? "Calibración real Original vs Calibrado disponible."
    : hasCalibratedEstimate
      ? "Estimación calibrada disponible; calibración real no ejecutada."
      : hasCalibrationDiagnostics
        ? "Diagnóstico de calibración disponible."
        : "Sin datos de calibración disponibles.";

  const recommendation = buildModalSpectralExecutiveRecommendation({
    globalStatus,
    validationOk,
    warningsCount,
    criticalCases,
    reviewCases,
    hasRealCalibrationComparison,
    hasCalibratedEstimate,
  });

  return `
    <div style="margin-bottom:12px; padding:12px; border:1px solid #555; border-radius:8px; background:#020617;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:10px;">
        <div>
          <div style="font-size:15px; font-weight:bold; color:white;">
            Modal Spectral Executive Summary
          </div>
          <div style="font-size:12px; color:#9ca3af; margin-top:3px;">
            Resumen técnico del análisis modal espectral tipo ETABS.
          </div>
        </div>

        <div>
          ${statusBadge}
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap:8px; margin-bottom:10px;">
        ${buildSummaryMiniCardHtml("Motor", escapeHtml(engine))}
        ${buildSummaryMiniCardHtml("Casos OK", `${successfulCases} / ${totalCases}`)}
        ${buildSummaryMiniCardHtml("Fallidos", failedCases)}
        ${buildSummaryMiniCardHtml("Warnings", warningsCount)}

        ${buildSummaryMiniCardHtml("Combinación", escapeHtml(modalCombination))}
        ${buildSummaryMiniCardHtml("Modos", escapeHtml(numberOfModes))}
        ${buildSummaryMiniCardHtml("Unidad fuerza", escapeHtml(forceUnit))}
        ${buildSummaryMiniCardHtml("Estado", statusBadge)}
      </div>

      <div style="display:grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap:8px; margin-bottom:10px;">
        <div style="border:1px solid #374151; border-radius:6px; padding:8px; color:#d1d5db;">
          <b>Validación</b><br>
          <span style="font-size:12px; color:#9ca3af;">${escapeHtml(validationText)}</span>
        </div>

        <div style="border:1px solid #374151; border-radius:6px; padding:8px; color:#d1d5db;">
          <b>Comparación</b><br>
          <span style="font-size:12px; color:#9ca3af;">${escapeHtml(comparisonText)}</span>
        </div>

        <div style="border:1px solid #374151; border-radius:6px; padding:8px; color:#d1d5db;">
          <b>Calibración</b><br>
          <span style="font-size:12px; color:#9ca3af;">${escapeHtml(calibrationText)}</span>
        </div>
      </div>

      <div style="padding:9px; border:1px solid #374151; border-radius:6px; background:#0b1220; color:#d1d5db; font-size:12px;">
        <b>Recomendación:</b> ${escapeHtml(recommendation)}
      </div>
    </div>
  `;
}

function countModalSpectralCriticalCases(results = []) {
  return results.filter((item) => {
    const status = item?.calibration_diagnostics?.status;
    return String(status || "").toUpperCase() === "CRITICAL";
  }).length;
}

function countModalSpectralReviewCases(results = []) {
  return results.filter((item) => {
    const status = item?.calibration_diagnostics?.status;
    return String(status || "").toUpperCase() === "REVIEW";
  }).length;
}

function buildExecutiveStatusBadgeHtml(status) {
  const text = String(status || "REVIEW").toUpperCase();

  if (text === "OK") {
    return `
      <span style="display:inline-block; min-width:92px; text-align:center; padding:5px 10px; border-radius:999px; background:#064e3b; color:#d1fae5; font-weight:bold;">
        OK
      </span>
    `;
  }

  if (text === "CRITICAL") {
    return `
      <span style="display:inline-block; min-width:92px; text-align:center; padding:5px 10px; border-radius:999px; background:#7f1d1d; color:#fee2e2; font-weight:bold;">
        CRITICAL
      </span>
    `;
  }

  return `
    <span style="display:inline-block; min-width:92px; text-align:center; padding:5px 10px; border-radius:999px; background:#78350f; color:#fef3c7; font-weight:bold;">
      REVIEW
    </span>
  `;
}

function buildModalSpectralExecutiveRecommendation({
  globalStatus,
  validationOk,
  warningsCount,
  criticalCases,
  reviewCases,
  hasRealCalibrationComparison,
  hasCalibratedEstimate,
}) {
  if (!validationOk) {
    return "Completar los requisitos mínimos del modelo antes de ejecutar: nodos, barras, casos espectrales y opciones válidas.";
  }

  if (globalStatus === "CRITICAL") {
    return "Revisar los casos críticos frente a ETABS. Priorizar rigidez, masa efectiva, diafragmas y soportes antes de validar el modelo.";
  }

  if (hasRealCalibrationComparison) {
    return "Comparar la mejora del modelo calibrado real frente al original y decidir si los factores aplicados deben mantenerse.";
  }

  if (hasCalibratedEstimate) {
    return "Usar la estimación calibrada como guía y, si corresponde, activar Real Model Calibration para ejecutar una corrida real calibrada.";
  }

  if (reviewCases > 0 || warningsCount > 0) {
    return "El análisis es utilizable, pero requiere revisión técnica antes de presentarlo como equivalente a ETABS.";
  }

  return "El análisis modal espectral se ejecutó correctamente y no presenta observaciones críticas en esta etapa.";
}

// ============================================================
// BLOQUE 7V-H - Checklist final de cierre Modal Spectral
// ============================================================

function buildModalSpectralCompletionChecklistHtml(cadSystem, raw = null, table = []) {
  const validation =
    cadSystem?.modalSpectralLastValidation ||
    raw?.jhack?.modalSpectralValidation ||
    raw?.modalSpectralValidation ||
    null;

  const validationSummary = validation?.summary || {};
  const results = Array.isArray(raw?.results) ? raw.results : [];
  const modelSummary = raw?.model_summary || raw?.model?.summary || {};
  const summary = raw?.analysis_summary || {};

  const hasGeometry =
    Number(validationSummary.nodes || 0) > 0 &&
    Number(validationSummary.frames || 0) > 0;

  const hasSupports =
    Number(validationSummary.supports || 0) > 0 ||
    Number(modelSummary.supports_created || 0) > 0 ||
    Number(modelSummary.base_nodes_fixed || 0) > 0;

  const hasFallbackSupports =
    Number(validationSummary.supports || 0) === 0 &&
    (
      Number(modelSummary.supports_created || 0) > 0 ||
      Number(modelSummary.base_nodes_fixed || 0) > 0
    );

  const hasSpectrum =
    Number(validationSummary.responseSpectrumFunctions || 0) > 0 &&
    Number(validationSummary.activeResponseSpectrumCases || 0) > 0;

  const hasModalEigen =
    !!raw?.opensees_real_modal_eigen ||
    !!raw?.modal_eigen ||
    !!raw?.real_modal_eigen;

  const hasModalParticipation =
    !!raw?.modal_participation ||
    results.some((item) => item?.modal_participation);

  const tableRows = Array.isArray(table) ? table : [];

  const hasCombinedResults =
    results.some((item) =>
      item?.combined_modal_result ||
      item?.modal_combination ||
      item?.displacement_comb_m !== undefined ||
      item?.cortante_comb_tonf !== undefined ||
      item?.desplazamiento_comb_m !== undefined ||
      item?.deriva_comb !== undefined ||
      item?.cortante_comb_tonf !== undefined
    ) ||
    tableRows.some((row) =>
      row?.metodo_combinacion ||
      row?.modos_combinados !== undefined ||
      row?.desplazamiento_comb_m !== undefined ||
      row?.deriva_comb !== undefined ||
      row?.cortante_comb_tonf !== undefined
    ) ||
    !!summary.modal_combination ||
    !!summary.modal_response_combination;

  const hasEtabsComparison =
    results.some((item) => item?.comparison) ||
    results.some((item) => item?.etabs_reference);

  const hasStoryResponse =
    Array.isArray(raw?.story_response_results)
      ? raw.story_response_results.length > 0
      : results.some((item) => item?.story_response || item?.story_drift);

  const hasCalibrationDiagnostics =
    results.some((item) => item?.calibration_diagnostics);

  const hasCalibratedEstimate =
    results.some((item) => item?.calibrated_estimate_results);

  const hasReportHistory =
    Array.isArray(cadSystem?.modalSpectralReportHistory) &&
    cadSystem.modalSpectralReportHistory.length > 0;

  const validationOk = validation?.ok === true;
  const casesCount = table.length || results.length || summary.total_cases || 0;

  const supportStatus = hasSupports
    ? hasFallbackSupports
      ? "warning"
      : "ok"
    : "warning";

  const supportText = hasSupports
    ? hasFallbackSupports
      ? "Usando fallback automático"
      : "Apoyos detectados"
    : "Sin apoyos explícitos";

  const items = [
    {
      label: "Geometría estructural",
      detail: `${validationSummary.nodes ?? "-"} nodos / ${validationSummary.frames ?? "-"} frames`,
      status: hasGeometry ? "ok" : "critical",
    },
    {
      label: "Soportes / restricciones",
      detail: supportText,
      status: supportStatus,
    },
    {
      label: "Espectro y casos",
      detail: `${validationSummary.responseSpectrumFunctions ?? "-"} función / ${validationSummary.activeResponseSpectrumCases ?? "-"} casos activos`,
      status: hasSpectrum ? "ok" : "critical",
    },
    {
      label: "Validación técnica",
      detail: validationOk ? "Aprobada antes de ejecutar" : "No aprobada o no registrada",
      status: validationOk ? "ok" : "critical",
    },
    {
      label: "Eigen modal real",
      detail: hasModalEigen ? "OpenSeesPy generó modos reales" : "No detectado",
      status: hasModalEigen ? "ok" : "warning",
    },
    {
      label: "Participación modal",
      detail: hasModalParticipation ? "Disponible" : "No detectada",
      status: hasModalParticipation ? "ok" : "warning",
    },
    {
      label: "Combinación modal",
      detail: hasCombinedResults ? "CQC / SRSS / ABS aplicado" : "No detectada",
      status: hasCombinedResults ? "ok" : "warning",
    },
    {
      label: "Casos analizados",
      detail: `${casesCount} casos procesados`,
      status: casesCount > 0 ? "ok" : "critical",
    },
    {
      label: "Comparación ETABS",
      detail: hasEtabsComparison ? "Disponible" : "No disponible",
      status: hasEtabsComparison ? "ok" : "warning",
    },
    {
      label: "Story Response / Drift",
      detail: hasStoryResponse ? "Disponible" : "No disponible",
      status: hasStoryResponse ? "ok" : "warning",
    },
    {
      label: "Diagnóstico calibración",
      detail: hasCalibrationDiagnostics ? "Disponible" : "No disponible",
      status: hasCalibrationDiagnostics ? "ok" : "warning",
    },
    {
      label: "Estimación calibrada",
      detail: hasCalibratedEstimate ? "Disponible" : "No disponible",
      status: hasCalibratedEstimate ? "ok" : "warning",
    },
    {
      label: "Historial de reportes",
      detail: hasReportHistory ? `${cadSystem.modalSpectralReportHistory.length} registros` : "Aún sin registros",
      status: hasReportHistory ? "ok" : "warning",
    },
  ];

  const okCount = items.filter((item) => item.status === "ok").length;
  const warningCount = items.filter((item) => item.status === "warning").length;
  const criticalCount = items.filter((item) => item.status === "critical").length;

  let globalStatus = "OK";
  if (criticalCount > 0) {
    globalStatus = "CRITICAL";
  } else if (warningCount > 0) {
    globalStatus = "REVIEW";
  }

  return `
    <div style="margin-bottom:12px; padding:12px; border:1px solid #555; border-radius:8px; background:#020617;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:10px;">
        <div>
          <div style="font-size:15px; font-weight:bold; color:white;">
            Modal Spectral Completion Checklist
          </div>
          <div style="font-size:12px; color:#9ca3af; margin-top:3px;">
            Revisión rápida del estado final del módulo antes de la prueba integral.
          </div>
        </div>

        <div>
          ${buildExecutiveStatusBadgeHtml(globalStatus)}
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap:8px; margin-bottom:10px;">
        ${buildSummaryMiniCardHtml("OK", okCount)}
        ${buildSummaryMiniCardHtml("Review", warningCount)}
        ${buildSummaryMiniCardHtml("Critical", criticalCount)}
      </div>

      <div style="display:grid; grid-template-columns: repeat(2, minmax(240px, 1fr)); gap:8px;">
        ${items.map(buildModalSpectralChecklistItemHtml).join("")}
      </div>

      <div style="margin-top:10px; padding:9px; border:1px solid #374151; border-radius:6px; background:#0b1220; color:#d1d5db; font-size:12px;">
        <b>Nota:</b>
        El estado REVIEW no significa que el análisis falló. Significa que todavía hay puntos técnicos para revisar,
        como soportes explícitos, equivalencia con ETABS o calibración final.
      </div>
    </div>
  `;
}

function buildModalSpectralChecklistItemHtml(item) {
  const status = String(item?.status || "warning").toLowerCase();

  const badge = status === "ok"
    ? `<span style="display:inline-block; min-width:70px; text-align:center; padding:2px 8px; border-radius:999px; background:#064e3b; color:#d1fae5; font-weight:bold;">OK</span>`
    : status === "critical"
      ? `<span style="display:inline-block; min-width:70px; text-align:center; padding:2px 8px; border-radius:999px; background:#7f1d1d; color:#fee2e2; font-weight:bold;">CRITICAL</span>`
      : `<span style="display:inline-block; min-width:70px; text-align:center; padding:2px 8px; border-radius:999px; background:#78350f; color:#fef3c7; font-weight:bold;">REVIEW</span>`;

  return `
    <div style="border:1px solid #374151; border-radius:6px; padding:8px; color:#d1d5db;">
      <div style="display:flex; justify-content:space-between; gap:8px; align-items:center;">
        <b>${escapeHtml(item?.label || "-")}</b>
        ${badge}
      </div>
      <div style="margin-top:5px; font-size:12px; color:#9ca3af;">
        ${escapeHtml(item?.detail || "-")}
      </div>
    </div>
  `;
}

/**
 * BLOQUE 7I
 * Tabla de participación modal aproximada tipo ETABS.
 */
function buildModalParticipationSectionHtml(raw) {
  const participation =
    raw?.opensees_real_modal_eigen?.modal_participation || null;

  if (!participation || participation.ok !== true) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>Modal Participating Mass Ratios</b><br>
        No hay participación modal disponible para este análisis.
      </div>
    `;
  }

  const modes = participation.modes || [];

  if (!modes.length) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>Modal Participating Mass Ratios</b><br>
        No se encontraron modos con participación modal.
      </div>
    `;
  }

  const rowsHtml = modes.map((mode) => {
    const x = mode.directions?.x || {};
    const y = mode.directions?.y || {};
    const z = mode.directions?.z || {};

    return `
      <tr>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(mode.mode)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(mode.period_s, 5)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(mode.frequency_hz, 5)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(mode.dominant_direction || "-")}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(x.effective_mass_ratio_percent, 3)}%</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(y.effective_mass_ratio_percent, 3)}%</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(z.effective_mass_ratio_percent, 3)}%</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(x.cumulative_mass_ratio_percent, 3)}%</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(y.cumulative_mass_ratio_percent, 3)}%</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(z.cumulative_mass_ratio_percent, 3)}%</td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin-bottom:12px;">
      <div style="margin-bottom:6px;">
        <b>Modal Participating Mass Ratios</b>
        <span style="color:#777;">— aproximado desde OpenSeesPy</span>
      </div>

      <div style="max-height:280px; overflow:auto; border:1px solid #555;">
        <table style="min-width:950px; width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background:#111827; color:white; position:sticky; top:0;">
              <th style="border:1px solid #555; padding:5px;">Modo</th>
              <th style="border:1px solid #555; padding:5px;">Periodo (s)</th>
              <th style="border:1px solid #555; padding:5px;">Frecuencia (Hz)</th>
              <th style="border:1px solid #555; padding:5px;">Dominante</th>
              <th style="border:1px solid #555; padding:5px;">UX %</th>
              <th style="border:1px solid #555; padding:5px;">UY %</th>
              <th style="border:1px solid #555; padding:5px;">UZ %</th>
              <th style="border:1px solid #555; padding:5px;">Sum UX %</th>
              <th style="border:1px solid #555; padding:5px;">Sum UY %</th>
              <th style="border:1px solid #555; padding:5px;">Sum UZ %</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * BLOQUE 7O-B
 * Tabla Story Response / Story Drift tipo ETABS.
 */
function buildStoryResponseSectionHtml(raw) {
  const results = raw?.results || [];

  const storyRows = [];

  results.forEach((caseResult) => {
    const storyResponse = caseResult?.story_response_results || {};
    const stories = storyResponse?.stories || [];

    stories.forEach((story) => {
      storyRows.push({
        case_name: story.case_name || caseResult.case_name || "-",
        direction: story.direction || caseResult.direction || "-",
        story: story.story || "-",
        level: story.level,
        elevation_m: story.elevation_m,
        story_height_m: story.story_height_m,
        story_mass_kg: story.story_mass_kg,
        displacement_m: story.displacement_m,
        story_displacement_delta_m: story.story_displacement_delta_m,
        story_drift: story.story_drift,
        story_drift_percent: story.story_drift_percent,
        story_shear_tonf: story.story_shear_tonf,
        source: story.source || "-",
      });
    });
  });

  if (!storyRows.length) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>Story Response / Story Drift</b><br>
        No hay resultados por story disponibles para este análisis.
      </div>
    `;
  }

  const rowsHtml = storyRows.map((row) => {
    return `
      <tr>
        <td style="border:1px solid #555; padding:5px; text-align:left;">${escapeHtml(row.case_name)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.direction)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.story)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.level, 3)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.elevation_m, 3)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.story_height_m, 3)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.story_mass_kg, 3)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.displacement_m, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.story_displacement_delta_m, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.story_drift, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.story_drift_percent, 5)}%</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.story_shear_tonf, 5)}</td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin-bottom:12px;">
      <div style="margin-bottom:6px;">
        <b>Story Response / Story Drift</b>
        <span style="color:#777;">— aproximado tipo ETABS</span>
      </div>

      <div style="max-height:280px; overflow:auto; border:1px solid #555;">
        <table style="min-width:1050px; width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background:#111827; color:white; position:sticky; top:0;">
              <th style="border:1px solid #555; padding:5px;">Caso</th>
              <th style="border:1px solid #555; padding:5px;">Dir.</th>
              <th style="border:1px solid #555; padding:5px;">Story</th>
              <th style="border:1px solid #555; padding:5px;">Nivel</th>
              <th style="border:1px solid #555; padding:5px;">Elev. (m)</th>
              <th style="border:1px solid #555; padding:5px;">Altura (m)</th>
              <th style="border:1px solid #555; padding:5px;">Masa (kg)</th>
              <th style="border:1px solid #555; padding:5px;">Desp. (m)</th>
              <th style="border:1px solid #555; padding:5px;">Δ Desp. (m)</th>
              <th style="border:1px solid #555; padding:5px;">Deriva</th>
              <th style="border:1px solid #555; padding:5px;">Drift %</th>
              <th style="border:1px solid #555; padding:5px;">Cort. (tonf)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top:6px; color:#777; font-size:11px;">
        Nota: en esta etapa la deriva se calcula con distribución aproximada por altura usando el desplazamiento final del caso.
      </div>
    </div>
  `;
}

/**
 * BLOQUE 7P-A
 * Comparación automática JHACK vs ETABS.
 */
function buildEtabsComparisonSectionHtml(raw) {
  const results = raw?.results || [];

  const comparisonRows = [];

  results.forEach((caseResult) => {
    const comparison = caseResult?.comparison || {};
    const expected = comparison?.expected || {};
    const errors = comparison?.error_percent || {};
    const finalResults = caseResult?.final_spectral_results || {};
    const modalResults = caseResult?.modal_results || {};
    const input = caseResult?.input || {};

    comparisonRows.push({
      case_name: caseResult?.case_name || "-",
      direction: caseResult?.direction || "-",

      etabs_period_s: expected?.period_s,
      jhack_period_s: modalResults?.period_s || input?.period_for_calculation_s,
      error_period_pct: errors?.period,

      etabs_base_shear_tonf: expected?.base_shear_tonf,
      jhack_base_shear_tonf: finalResults?.equivalent_force_tonf,
      error_base_shear_pct: errors?.base_shear,

      etabs_displacement_m: expected?.max_displacement_m,
      jhack_displacement_m: finalResults?.spectral_displacement_m,
      error_displacement_pct: errors?.max_displacement,

      etabs_drift: expected?.drift,
      jhack_drift: finalResults?.estimated_drift,
      error_drift_pct: errors?.drift,

      source: finalResults?.source || "-",
    });
  });

  if (!comparisonRows.length) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>JHACK vs ETABS Comparison</b><br>
        No hay datos de comparación disponibles.
      </div>
    `;
  }

  const rowsHtml = comparisonRows.map((row) => {
    return `
      <tr>
        <td style="border:1px solid #555; padding:5px; text-align:left;">${escapeHtml(row.case_name)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.direction)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.etabs_period_s, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.jhack_period_s, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.error_period_pct)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.etabs_base_shear_tonf, 5)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.jhack_base_shear_tonf, 5)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.error_base_shear_pct)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.etabs_displacement_m, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.jhack_displacement_m, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.error_displacement_pct)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.etabs_drift, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.jhack_drift, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.error_drift_pct)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.source)}</td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin-bottom:12px;">
      <div style="margin-bottom:6px;">
        <b>JHACK vs ETABS Comparison</b>
        <span style="color:#777;">— comparación automática con valores esperados</span>
      </div>

      <div style="max-height:320px; overflow:auto; border:1px solid #555;">
        <table style="min-width:1450px; width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background:#111827; color:white; position:sticky; top:0;">
              <th style="border:1px solid #555; padding:5px;">Caso</th>
              <th style="border:1px solid #555; padding:5px;">Dir.</th>

              <th style="border:1px solid #555; padding:5px;">T ETABS</th>
              <th style="border:1px solid #555; padding:5px;">T JHACK</th>
              <th style="border:1px solid #555; padding:5px;">Err. T</th>

              <th style="border:1px solid #555; padding:5px;">Cort. ETABS</th>
              <th style="border:1px solid #555; padding:5px;">Cort. JHACK</th>
              <th style="border:1px solid #555; padding:5px;">Err. Cort.</th>

              <th style="border:1px solid #555; padding:5px;">Desp. ETABS</th>
              <th style="border:1px solid #555; padding:5px;">Desp. JHACK</th>
              <th style="border:1px solid #555; padding:5px;">Err. Desp.</th>

              <th style="border:1px solid #555; padding:5px;">Deriva ETABS</th>
              <th style="border:1px solid #555; padding:5px;">Deriva JHACK</th>
              <th style="border:1px solid #555; padding:5px;">Err. Deriva</th>

              <th style="border:1px solid #555; padding:5px;">Fuente</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top:6px; color:#777; font-size:11px;">
        Criterio visual: verde ≤ 5%, amarillo ≤ 15%, rojo &gt; 15%. En modelos aún no calibrados es normal ver errores altos.
      </div>
    </div>
  `;
}

/**
 * BLOQUE 7P-B
 * Resumen general de comparación JHACK vs ETABS.
 */
function buildEtabsComparisonSummaryHtml(raw) {
  const results = raw?.results || [];

  if (!results.length) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>JHACK vs ETABS Summary</b><br>
        No hay resultados disponibles para generar resumen.
      </div>
    `;
  }

  const caseSummaries = results.map((caseResult) => {
    const errors = caseResult?.comparison?.error_percent || {};

    const numericErrors = [
      errors.period,
      errors.base_shear,
      errors.max_displacement,
      errors.drift,
    ]
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    const maxError = numericErrors.length ? Math.max(...numericErrors) : null;
    const status = classifyEtabsComparisonStatus(maxError);

    return {
      case_name: caseResult?.case_name || "-",
      direction: caseResult?.direction || "-",
      source: caseResult?.final_spectral_results?.source || "-",
      max_error_pct: maxError,
      status,
    };
  });

  const totalCases = caseSummaries.length;
  const okCases = caseSummaries.filter((item) => item.status === "OK").length;
  const reviewCases = caseSummaries.filter((item) => item.status === "REVIEW").length;
  const criticalCases = caseSummaries.filter((item) => item.status === "CRITICAL").length;

  const allErrors = caseSummaries
    .map((item) => item.max_error_pct)
    .filter((value) => Number.isFinite(Number(value)));

  const maxGlobalError = allErrors.length ? Math.max(...allErrors) : null;

  let globalStatus = "OK";

  if (criticalCases > 0) {
    globalStatus = "CRITICAL";
  } else if (reviewCases > 0) {
    globalStatus = "REVIEW";
  }

  const rowsHtml = caseSummaries.map((item) => {
    return `
      <tr>
        <td style="border:1px solid #555; padding:5px; text-align:left;">${escapeHtml(item.case_name)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(item.direction)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(item.source)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(item.max_error_pct)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildComparisonStatusBadgeHtml(item.status)}</td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin-bottom:12px;">
      <div style="margin-bottom:6px;">
        <b>JHACK vs ETABS Summary</b>
        <span style="color:#777;">— estado general de validación</span>
      </div>

      <div style="display:grid; grid-template-columns: repeat(6, minmax(110px, 1fr)); gap:8px; margin-bottom:10px;">
        ${buildSummaryMiniCardHtml("Estado general", buildComparisonStatusBadgeHtml(globalStatus))}
        ${buildSummaryMiniCardHtml("Casos", totalCases)}
        ${buildSummaryMiniCardHtml("OK", okCases)}
        ${buildSummaryMiniCardHtml("Revisión", reviewCases)}
        ${buildSummaryMiniCardHtml("Críticos", criticalCases)}
        ${buildSummaryMiniCardHtml("Máx. error", maxGlobalError === null ? "-" : `${fmt(maxGlobalError, 2)}%`)}
      </div>

      <div style="max-height:220px; overflow:auto; border:1px solid #555;">
        <table style="min-width:700px; width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background:#111827; color:white; position:sticky; top:0;">
              <th style="border:1px solid #555; padding:5px;">Caso</th>
              <th style="border:1px solid #555; padding:5px;">Dir.</th>
              <th style="border:1px solid #555; padding:5px;">Fuente</th>
              <th style="border:1px solid #555; padding:5px;">Máx. error</th>
              <th style="border:1px solid #555; padding:5px;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top:6px; color:#777; font-size:11px;">
        Criterio: OK ≤ 5%, REVIEW ≤ 15%, CRITICAL &gt; 15%. Este resumen ayuda a explicar rápidamente qué tan cerca está JHACK respecto a los valores esperados de ETABS.
      </div>
    </div>
  `;
}

/**
 * BLOQUE 7P-D
 * Diagnóstico de calibración JHACK vs ETABS.
 */
function buildCalibrationDiagnosticsSectionHtml(raw) {
  const results = raw?.results || [];

  const rows = results
    .map((caseResult) => {
      const diagnostics = caseResult?.calibration_diagnostics || null;

      if (!diagnostics) {
        return null;
      }

      return {
        case_name: diagnostics.case_name || caseResult.case_name || "-",
        direction: diagnostics.direction || caseResult.direction || "-",
        status: diagnostics.status || "REVIEW",
        max_error_percent: diagnostics.max_error_percent,

        t_etabs: diagnostics.period?.target_period_s,
        t_jhack: diagnostics.period?.jhack_period_s,
        k_factor: diagnostics.period?.stiffness_multiplier_to_match_etabs_period,
        m_factor: diagnostics.period?.mass_multiplier_to_match_etabs_period,

        shear_factor: diagnostics.base_shear?.scale_factor_to_match_etabs,
        displacement_factor: diagnostics.displacement?.scale_factor_to_match_etabs,
        drift_factor: diagnostics.drift?.scale_factor_to_match_etabs,

        recommendations: diagnostics.recommended_adjustments || [],
      };
    })
    .filter(Boolean);

  if (!rows.length) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>Calibration Diagnostics</b><br>
        No hay diagnóstico de calibración disponible.
      </div>
    `;
  }

  const rowsHtml = rows.map((row) => {
    return `
      <tr>
        <td style="border:1px solid #555; padding:5px; text-align:left;">${escapeHtml(row.case_name)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.direction)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildComparisonStatusBadgeHtml(row.status)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.max_error_percent)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.t_etabs, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.t_jhack, 6)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.k_factor, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.m_factor, 4)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.shear_factor, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.displacement_factor, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.drift_factor, 4)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:left; max-width:340px;">
          ${buildCalibrationRecommendationsHtml(row.recommendations)}
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin-bottom:12px;">
      <div style="margin-bottom:6px;">
        <b>Calibration Diagnostics</b>
        <span style="color:#777;">— diagnóstico técnico para acercar JHACK a ETABS</span>
      </div>

      <div style="max-height:320px; overflow:auto; border:1px solid #555;">
        <table style="min-width:1500px; width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background:#111827; color:white; position:sticky; top:0;">
              <th style="border:1px solid #555; padding:5px;">Caso</th>
              <th style="border:1px solid #555; padding:5px;">Dir.</th>
              <th style="border:1px solid #555; padding:5px;">Estado</th>
              <th style="border:1px solid #555; padding:5px;">Máx. error</th>

              <th style="border:1px solid #555; padding:5px;">T ETABS</th>
              <th style="border:1px solid #555; padding:5px;">T JHACK</th>

              <th style="border:1px solid #555; padding:5px;">Factor K</th>
              <th style="border:1px solid #555; padding:5px;">Factor M</th>

              <th style="border:1px solid #555; padding:5px;">Factor Cort.</th>
              <th style="border:1px solid #555; padding:5px;">Factor Desp.</th>
              <th style="border:1px solid #555; padding:5px;">Factor Deriva</th>

              <th style="border:1px solid #555; padding:5px;">Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top:6px; color:#777; font-size:11px;">
        Nota: estos factores son diagnósticos. No modifican automáticamente el análisis. Sirven para saber si el modelo está demasiado rígido, demasiado flexible o con masa efectiva distinta a ETABS.
      </div>
    </div>
  `;
}

/**
 * BLOQUE 7R-B
 * Muestra resultados calibrados estimados.
 * No reemplaza el análisis original; solo muestra una estimación usando factores diagnósticos.
 */
function buildCalibratedEstimateResultsSectionHtml(raw) {
  const results = raw?.results || [];

  const rows = results
    .map((caseResult) => {
      const calibrated = caseResult?.calibrated_estimate_results || null;

      if (!calibrated) {
        return null;
      }

      return {
        case_name: calibrated.case_name || caseResult.case_name || "-",
        direction: calibrated.direction || caseResult.direction || "-",
        status: calibrated.status || "REVIEW",

        period_etabs: calibrated.period?.etabs_target_s,
        period_original: calibrated.period?.jhack_original_s,
        period_factor: calibrated.period?.factor,
        period_calibrated: calibrated.period?.calibrated_estimate_s,
        period_error_after: calibrated.period?.error_after_calibration_percent,

        shear_etabs: calibrated.base_shear?.etabs_target_tonf,
        shear_original: calibrated.base_shear?.jhack_original_tonf,
        shear_factor: calibrated.base_shear?.factor,
        shear_calibrated: calibrated.base_shear?.calibrated_estimate_tonf,
        shear_error_after: calibrated.base_shear?.error_after_calibration_percent,

        displacement_etabs: calibrated.displacement?.etabs_target_m,
        displacement_original: calibrated.displacement?.jhack_original_m,
        displacement_factor: calibrated.displacement?.factor,
        displacement_calibrated: calibrated.displacement?.calibrated_estimate_m,
        displacement_error_after: calibrated.displacement?.error_after_calibration_percent,

        drift_etabs: calibrated.drift?.etabs_target,
        drift_original: calibrated.drift?.jhack_original,
        drift_factor: calibrated.drift?.factor,
        drift_calibrated: calibrated.drift?.calibrated_estimate,
        drift_error_after: calibrated.drift?.error_after_calibration_percent,

        max_error_after: calibrated.max_error_after_calibration_percent,
        source: calibrated.source || "-",
        note: calibrated.note || "",
      };
    })
    .filter(Boolean);

  if (!rows.length) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>Calibrated Estimate Results</b><br>
        No hay resultados calibrados estimados disponibles.
      </div>
    `;
  }

  const okCases = rows.filter((row) => row.status === "OK").length;
  const reviewCases = rows.filter((row) => row.status === "REVIEW").length;
  const criticalCases = rows.filter((row) => row.status === "CRITICAL").length;

  const maxAfterErrors = rows
    .map((row) => Number(row.max_error_after))
    .filter((value) => Number.isFinite(value));

  const maxGlobalAfterError = maxAfterErrors.length
    ? Math.max(...maxAfterErrors)
    : null;

  const rowsHtml = rows.map((row) => {
    return `
      <tr>
        <td style="border:1px solid #555; padding:5px; text-align:left;">${escapeHtml(row.case_name)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.direction)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildComparisonStatusBadgeHtml(row.status)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.max_error_after)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.period_etabs, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.period_original, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.period_factor, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.period_calibrated, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.period_error_after)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.shear_etabs, 5)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.shear_original, 5)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.shear_factor, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.shear_calibrated, 5)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.shear_error_after)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.displacement_etabs, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.displacement_original, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.displacement_factor, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.displacement_calibrated, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.displacement_error_after)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.drift_etabs, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.drift_original, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.drift_factor, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.drift_calibrated, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.drift_error_after)}</td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin-bottom:12px;">
      <div style="margin-bottom:6px;">
        <b>Calibrated Estimate Results</b>
        <span style="color:#777;">— estimación calibrada sin reemplazar el análisis original</span>
      </div>

      <div style="display:grid; grid-template-columns: repeat(5, minmax(120px, 1fr)); gap:8px; margin-bottom:10px;">
        ${buildSummaryMiniCardHtml("Casos", rows.length)}
        ${buildSummaryMiniCardHtml("OK", okCases)}
        ${buildSummaryMiniCardHtml("Revisión", reviewCases)}
        ${buildSummaryMiniCardHtml("Críticos", criticalCases)}
        ${buildSummaryMiniCardHtml("Máx. error calibrado", maxGlobalAfterError === null ? "-" : `${fmt(maxGlobalAfterError, 2)}%`)}
      </div>

      <div style="max-height:340px; overflow:auto; border:1px solid #555;">
        <table style="min-width:2300px; width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background:#111827; color:white; position:sticky; top:0;">
              <th style="border:1px solid #555; padding:5px;">Caso</th>
              <th style="border:1px solid #555; padding:5px;">Dir.</th>
              <th style="border:1px solid #555; padding:5px;">Estado</th>
              <th style="border:1px solid #555; padding:5px;">Máx. error</th>

              <th style="border:1px solid #555; padding:5px;">T ETABS</th>
              <th style="border:1px solid #555; padding:5px;">T Original</th>
              <th style="border:1px solid #555; padding:5px;">Factor T</th>
              <th style="border:1px solid #555; padding:5px;">T Calib.</th>
              <th style="border:1px solid #555; padding:5px;">Err. T Calib.</th>

              <th style="border:1px solid #555; padding:5px;">Cort. ETABS</th>
              <th style="border:1px solid #555; padding:5px;">Cort. Original</th>
              <th style="border:1px solid #555; padding:5px;">Factor Cort.</th>
              <th style="border:1px solid #555; padding:5px;">Cort. Calib.</th>
              <th style="border:1px solid #555; padding:5px;">Err. Cort. Calib.</th>

              <th style="border:1px solid #555; padding:5px;">Desp. ETABS</th>
              <th style="border:1px solid #555; padding:5px;">Desp. Original</th>
              <th style="border:1px solid #555; padding:5px;">Factor Desp.</th>
              <th style="border:1px solid #555; padding:5px;">Desp. Calib.</th>
              <th style="border:1px solid #555; padding:5px;">Err. Desp. Calib.</th>

              <th style="border:1px solid #555; padding:5px;">Deriva ETABS</th>
              <th style="border:1px solid #555; padding:5px;">Deriva Original</th>
              <th style="border:1px solid #555; padding:5px;">Factor Deriva</th>
              <th style="border:1px solid #555; padding:5px;">Deriva Calib.</th>
              <th style="border:1px solid #555; padding:5px;">Err. Deriva Calib.</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top:6px; color:#777; font-size:11px;">
        Nota: esta tabla aplica factores diagnósticos calculados desde la comparación con ETABS. Sirve para calibración y revisión técnica, no reemplaza el resultado original OpenSeesPy.
      </div>
    </div>
  `;
}

/**
 * BLOQUE 7S-D
 * Muestra comparación de dos análisis reales:
 * - modelo original sin calibración
 * - modelo calibrado real con factores K/M
 */
function buildRealCalibrationComparisonSectionHtml(raw) {
  const comparison = raw?.real_calibration_comparison || null;

  if (!comparison || comparison.ok !== true) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>Real Calibration Comparison</b><br>
        No hay comparación real Original vs Calibrado. Activa modelCalibration.enabled = true para ejecutar doble análisis.
      </div>
    `;
  }

  const rows = comparison?.cases || [];
  const summary = comparison?.summary || {};

  if (!rows.length) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>Real Calibration Comparison</b><br>
        La comparación existe, pero no contiene casos para mostrar.
      </div>
    `;
  }

  const improvement = summary.improvement_percent_points;

  const rowsHtml = rows.map((row) => {
    return `
      <tr>
        <td style="border:1px solid #555; padding:5px; text-align:left;">${escapeHtml(row.case_name)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.direction)}</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.period_original_s, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.period_calibrated_s, 6)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.period_change_percent, 3)}%</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.base_shear_original_tonf, 5)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.base_shear_calibrated_tonf, 5)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.base_shear_change_percent, 3)}%</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.displacement_original_m, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.displacement_calibrated_m, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.displacement_change_percent, 3)}%</td>

        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.drift_original, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.drift_calibrated, 4)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.drift_change_percent, 3)}%</td>

        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.error_original_max_percent)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${buildErrorBadgeHtml(row.error_calibrated_max_percent)}</td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin-bottom:12px;">
      <div style="margin-bottom:6px;">
        <b>Real Calibration Comparison</b>
        <span style="color:#777;">— análisis real Original vs Calibrado</span>
      </div>

      <div style="display:grid; grid-template-columns: repeat(5, minmax(120px, 1fr)); gap:8px; margin-bottom:10px;">
        ${buildSummaryMiniCardHtml("Casos", summary.total_cases ?? rows.length)}
        ${buildSummaryMiniCardHtml("Estado original", escapeHtml(summary.original_status || "-"))}
        ${buildSummaryMiniCardHtml("Estado calibrado", escapeHtml(summary.calibrated_status || "-"))}
        ${buildSummaryMiniCardHtml("Error original", summary.original_max_error_percent === null || summary.original_max_error_percent === undefined ? "-" : `${fmt(summary.original_max_error_percent, 2)}%`)}
        ${buildSummaryMiniCardHtml("Mejora", improvement === null || improvement === undefined ? "-" : `${fmt(improvement, 2)} pts`)}
      </div>

      <div style="max-height:340px; overflow:auto; border:1px solid #555;">
        <table style="min-width:1800px; width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background:#111827; color:white; position:sticky; top:0;">
              <th style="border:1px solid #555; padding:5px;">Caso</th>
              <th style="border:1px solid #555; padding:5px;">Dir.</th>

              <th style="border:1px solid #555; padding:5px;">T Original</th>
              <th style="border:1px solid #555; padding:5px;">T Calib. Real</th>
              <th style="border:1px solid #555; padding:5px;">ΔT %</th>

              <th style="border:1px solid #555; padding:5px;">Cort. Original</th>
              <th style="border:1px solid #555; padding:5px;">Cort. Calib. Real</th>
              <th style="border:1px solid #555; padding:5px;">Δ Cort. %</th>

              <th style="border:1px solid #555; padding:5px;">Desp. Original</th>
              <th style="border:1px solid #555; padding:5px;">Desp. Calib. Real</th>
              <th style="border:1px solid #555; padding:5px;">Δ Desp. %</th>

              <th style="border:1px solid #555; padding:5px;">Deriva Original</th>
              <th style="border:1px solid #555; padding:5px;">Deriva Calib. Real</th>
              <th style="border:1px solid #555; padding:5px;">Δ Deriva %</th>

              <th style="border:1px solid #555; padding:5px;">Err. Original</th>
              <th style="border:1px solid #555; padding:5px;">Err. Calib. Real</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top:6px; color:#777; font-size:11px;">
        Nota: esta sección compara dos ejecuciones reales de OpenSeesPy. El modelo original se analiza sin factores y el modelo calibrado se analiza con los factores enviados en modelCalibration.
      </div>
    </div>
  `;
}

// ============================================================
// BLOQUE 7Q-A - Exportar reporte Modal Spectral CSV / Print PDF
// ============================================================

function buildModalSpectralExportActionsHtml() {
  return `
    <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; background:#0b1220;">
      <div style="margin-bottom:8px;">
        <b>Export Report</b>
        <span style="color:#777;">— CSV/Excel y PDF imprimible</span>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button
          onclick="window.jhackExportModalSpectralReportCSV && window.jhackExportModalSpectralReportCSV()"
          style="padding:6px 10px; border-radius:5px; border:1px solid #374151; background:#1f2937; color:white; cursor:pointer;">
          Export Summary CSV
        </button>

        <button
          onclick="window.jhackExportModalSpectralFullCsvPack && window.jhackExportModalSpectralFullCsvPack()"
          style="padding:6px 10px; border-radius:5px; border:1px solid #374151; background:#1f2937; color:white; cursor:pointer;">
          Export Full CSV Pack
        </button>

        <button
          onclick="window.jhackPrintModalSpectralReport && window.jhackPrintModalSpectralReport()"
          style="padding:6px 10px; border-radius:5px; border:1px solid #374151; background:#1f2937; color:white; cursor:pointer;">
          Print Full Report / Save PDF
        </button>
      </div>

      <div style="margin-top:6px; color:#777; font-size:11px;">
        Summary CSV descarga la comparación principal. Full CSV Pack descarga comparación, diagnóstico, estimación calibrada, story drift y participación modal.
      </div>
    </div>
  `;
}

// ============================================================
// BLOQUE 7Q-B - CSV Pack completo
// ============================================================

function buildModalParticipationExportRows(raw) {
  const participation =
    raw?.opensees_real_modal_eigen?.modal_participation || {};

  const modes = participation?.modes || [];

  return modes.map((mode) => {
    const x = mode?.directions?.x || {};
    const y = mode?.directions?.y || {};
    const z = mode?.directions?.z || {};

    return {
      mode: mode.mode ?? "",
      period_s: mode.period_s ?? "",
      frequency_hz: mode.frequency_hz ?? "",
      dominant_direction: mode.dominant_direction ?? "",

      ux_effective_mass_kg: x.effective_modal_mass ?? "",
      ux_ratio_percent: x.effective_mass_ratio_percent ?? "",
      ux_cumulative_percent: x.cumulative_mass_ratio_percent ?? "",

      uy_effective_mass_kg: y.effective_modal_mass ?? "",
      uy_ratio_percent: y.effective_mass_ratio_percent ?? "",
      uy_cumulative_percent: y.cumulative_mass_ratio_percent ?? "",

      uz_effective_mass_kg: z.effective_modal_mass ?? "",
      uz_ratio_percent: z.effective_mass_ratio_percent ?? "",
      uz_cumulative_percent: z.cumulative_mass_ratio_percent ?? "",
    };
  });
}

function buildStoryResponseExportRows(raw) {
  const results = raw?.results || [];
  const rows = [];

  results.forEach((caseResult) => {
    const stories = caseResult?.story_response_results?.stories || [];

    stories.forEach((story) => {
      rows.push({
        case_name: story.case_name || caseResult.case_name || "",
        direction: story.direction || caseResult.direction || "",
        story: story.story || "",
        story_index: story.story_index ?? "",
        level: story.level ?? "",
        elevation_m: story.elevation_m ?? "",
        story_height_m: story.story_height_m ?? "",
        nodes_count: story.nodes_count ?? "",
        story_mass_kg: story.story_mass_kg ?? "",
        mass_above_kg: story.mass_above_kg ?? "",
        displacement_m: story.displacement_m ?? "",
        previous_displacement_m: story.previous_displacement_m ?? "",
        story_displacement_delta_m: story.story_displacement_delta_m ?? "",
        story_drift: story.story_drift ?? "",
        story_drift_percent: story.story_drift_percent ?? "",
        story_shear_tonf: story.story_shear_tonf ?? "",
        source: story.source || "",
      });
    });
  });

  return rows;
}

function buildCalibrationDiagnosticsExportRows(raw) {
  const results = raw?.results || [];

  return results.map((caseResult) => {
    const diag = caseResult?.calibration_diagnostics || {};
    const period = diag?.period || {};
    const baseShear = diag?.base_shear || {};
    const displacement = diag?.displacement || {};
    const drift = diag?.drift || {};

    return {
      case_name: diag.case_name || caseResult.case_name || "",
      direction: diag.direction || caseResult.direction || "",
      status: diag.status || "",
      max_error_percent: diag.max_error_percent ?? "",

      etabs_period_s: period.target_period_s ?? "",
      jhack_period_s: period.jhack_period_s ?? "",
      period_ratio_jhack_to_etabs: period.period_ratio_jhack_to_etabs ?? "",
      period_ratio_etabs_to_jhack: period.period_ratio_etabs_to_jhack ?? "",
      stiffness_factor_k: period.stiffness_multiplier_to_match_etabs_period ?? "",
      mass_factor_m: period.mass_multiplier_to_match_etabs_period ?? "",

      etabs_base_shear_tonf: baseShear.etabs_tonf ?? "",
      jhack_base_shear_tonf: baseShear.jhack_tonf ?? "",
      base_shear_error_percent: baseShear.error_percent ?? "",
      base_shear_scale_factor: baseShear.scale_factor_to_match_etabs ?? "",

      etabs_displacement_m: displacement.etabs_m ?? "",
      jhack_displacement_m: displacement.jhack_m ?? "",
      displacement_error_percent: displacement.error_percent ?? "",
      displacement_scale_factor: displacement.scale_factor_to_match_etabs ?? "",

      etabs_drift: drift.etabs ?? "",
      jhack_drift: drift.jhack ?? "",
      drift_error_percent: drift.error_percent ?? "",
      drift_scale_factor: drift.scale_factor_to_match_etabs ?? "",

      recommendations: Array.isArray(diag.recommended_adjustments)
        ? diag.recommended_adjustments.join(" | ")
        : "",
    };
  });
}

function exportCsvWithSuffix(baseName, suffix, rows, delayMs = 0) {
  if (!rows || !rows.length) {
    console.warn(`No hay filas para exportar: ${suffix}`);
    return;
  }

  const csv = convertRowsToCsv(rows);

  setTimeout(() => {
    downloadTextFile(
      `${baseName}_${suffix}.csv`,
      csv,
      "text/csv;charset=utf-8"
    );
  }, delayMs);
}

function exportModalSpectralFullCsvPack() {
  const raw = getLastModalSpectralRawForExport();

  if (!raw) {
    alert("No hay resultados Modal Spectral para exportar.");
    return;
  }

  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const baseName = `jhack_modal_spectral_full_${stamp}`;

  const comparisonRows = buildModalSpectralExportRows(raw);
  const calibrationRows = buildCalibrationDiagnosticsExportRows(raw);
  const calibratedRows = buildCalibratedEstimateExportRows(raw);
  const storyRows = buildStoryResponseExportRows(raw);
  const participationRows = buildModalParticipationExportRows(raw);

  exportCsvWithSuffix(
    baseName,
    "01_comparison",
    comparisonRows,
    0
  );

  exportCsvWithSuffix(
    baseName,
    "02_calibration_diagnostics",
    calibrationRows,
    300
  );

  exportCsvWithSuffix(
    baseName,
    "03_calibrated_estimate",
    calibratedRows,
    600
  );

  exportCsvWithSuffix(
    baseName,
    "04_story_drift",
    storyRows,
    900
  );

  exportCsvWithSuffix(
    baseName,
    "05_modal_participation",
    participationRows,
    1200
  );

  registerModalSpectralReportHistory("full_csv_pack", {
    label: "Full CSV Pack",
    comparisonRows: comparisonRows.length,
    calibrationRows: calibrationRows.length,
    calibratedRows: calibratedRows.length,
    storyRows: storyRows.length,
    participationRows: participationRows.length,
    note: baseName,
  });
}

window.jhackExportModalSpectralFullCsvPack = exportModalSpectralFullCsvPack;

// ============================================================
// BLOQUE 7R-C - Exportar Calibrated Estimate Results
// ============================================================

function buildCalibratedEstimateExportRows(raw) {
  const results = raw?.results || [];

  return results.map((caseResult) => {
    const calibrated = caseResult?.calibrated_estimate_results || {};
    const period = calibrated?.period || {};
    const shear = calibrated?.base_shear || {};
    const displacement = calibrated?.displacement || {};
    const drift = calibrated?.drift || {};

    return {
      case_name: calibrated.case_name || caseResult.case_name || "",
      direction: calibrated.direction || caseResult.direction || "",
      status: calibrated.status || "",
      max_error_after_calibration_percent:
        calibrated.max_error_after_calibration_percent ?? "",

      period_etabs_s: period.etabs_target_s ?? "",
      period_original_jhack_s: period.jhack_original_s ?? "",
      period_factor: period.factor ?? "",
      period_calibrated_s: period.calibrated_estimate_s ?? "",
      period_error_after_percent:
        period.error_after_calibration_percent ?? "",

      base_shear_etabs_tonf: shear.etabs_target_tonf ?? "",
      base_shear_original_jhack_tonf: shear.jhack_original_tonf ?? "",
      base_shear_factor: shear.factor ?? "",
      base_shear_calibrated_tonf: shear.calibrated_estimate_tonf ?? "",
      base_shear_error_after_percent:
        shear.error_after_calibration_percent ?? "",

      displacement_etabs_m: displacement.etabs_target_m ?? "",
      displacement_original_jhack_m: displacement.jhack_original_m ?? "",
      displacement_factor: displacement.factor ?? "",
      displacement_calibrated_m:
        displacement.calibrated_estimate_m ?? "",
      displacement_error_after_percent:
        displacement.error_after_calibration_percent ?? "",

      drift_etabs: drift.etabs_target ?? "",
      drift_original_jhack: drift.jhack_original ?? "",
      drift_factor: drift.factor ?? "",
      drift_calibrated: drift.calibrated_estimate ?? "",
      drift_error_after_percent:
        drift.error_after_calibration_percent ?? "",

      source: calibrated.source || "",
      note: calibrated.note || "",
    };
  });
}

// ============================================================
// BLOQUE 7Q-C - Historial de reportes Modal Spectral
// ============================================================

function getModalSpectralCadSystemForHistory() {
  return window?.cadSystem || null;
}

function buildModalSpectralReportHistoryEntry(type, details = {}) {
  const raw = getLastModalSpectralRawForExport();
  const summary = raw?.analysis_summary || {};

  return {
    id: `MSR-${Date.now()}`,
    createdAt: new Date().toISOString(),
    type,
    label: details.label || type,

    total_cases: summary.total_cases ?? null,
    successful_cases: summary.successful_cases ?? null,
    failed_cases: summary.failed_cases ?? null,

    calibration_critical_cases: summary.calibration_critical_cases ?? null,
    calibration_review_cases: summary.calibration_review_cases ?? null,
    calibration_ok_cases: summary.calibration_ok_cases ?? null,

    story_response_available: summary.story_response_available === true,
    story_response_cases: summary.story_response_cases ?? null,

    modal_combination:
      summary.modal_combination ||
      summary.modal_response_combination ||
      null,

    number_of_modes: summary.number_of_modes ?? null,
    force_output_unit: summary.force_output_unit || "tonf",

    exported_rows: {
      comparison: details.comparisonRows ?? null,
      calibration: details.calibrationRows ?? null,
      calibrated_estimate: details.calibratedRows ?? null,
      story_drift: details.storyRows ?? null,
      modal_participation: details.participationRows ?? null,
    },

    note: details.note || "",
  };
}

function registerModalSpectralReportHistory(type, details = {}) {
  const cadSystem = getModalSpectralCadSystemForHistory();

  if (!cadSystem) {
    console.warn("No se encontró window.cadSystem para guardar historial Modal Spectral.");
    return null;
  }

  if (!Array.isArray(cadSystem.modalSpectralReportHistory)) {
    cadSystem.modalSpectralReportHistory = [];
  }

  const entry = buildModalSpectralReportHistoryEntry(type, details);

  cadSystem.modalSpectralReportHistory.unshift(entry);

  // Mantener máximo 30 registros para que el JSON no crezca demasiado.
  cadSystem.modalSpectralReportHistory =
    cadSystem.modalSpectralReportHistory.slice(0, 30);

  console.log("🧾 Historial Modal Spectral actualizado:", entry);

  return entry;
}

function buildModalSpectralReportHistoryHtml() {
  const cadSystem = getModalSpectralCadSystemForHistory();
  const history = Array.isArray(cadSystem?.modalSpectralReportHistory)
    ? cadSystem.modalSpectralReportHistory
    : [];

  if (!history.length) {
    return `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
        <b>Report History</b><br>
        Todavía no se exportaron reportes en esta sesión.
      </div>
    `;
  }

  const visibleHistory = history.slice(0, 10);

  const rowsHtml = visibleHistory.map((item) => {
    const dateText = item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "-";

    return `
      <tr>
        <td style="border:1px solid #555; padding:5px; text-align:left;">${escapeHtml(dateText)}</td>
        <td style="border:1px solid #555; padding:5px; text-align:left;">${escapeHtml(item.label || item.type || "-")}</td>

        <td style="border:1px solid #555; padding:5px; text-align:center;">${item.total_cases ?? "-"}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${item.calibration_critical_cases ?? "-"}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${item.exported_rows?.calibrated_estimate ?? "-"}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(item.modal_combination || "-")}</td>
        <td style="border:1px solid #555; padding:5px; text-align:center;">${item.number_of_modes ?? "-"}</td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin-bottom:12px;">
      <div style="margin-bottom:6px;">
        <b>Report History</b>
        <span style="color:#777;">— exportaciones guardadas dentro del JSON</span>
      </div>

      <div style="max-height:180px; overflow:auto; border:1px solid #555;">
        <table style="min-width:840px; width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background:#111827; color:white; position:sticky; top:0;">
              <th style="border:1px solid #555; padding:5px;">Fecha</th>
              <th style="border:1px solid #555; padding:5px;">Reporte</th>
              <th style="border:1px solid #555; padding:5px;">Casos</th>
              <th style="border:1px solid #555; padding:5px;">Críticos</th>
              <th style="border:1px solid #555; padding:5px;">Estim.</th>
              <th style="border:1px solid #555; padding:5px;">Comb.</th>
              <th style="border:1px solid #555; padding:5px;">Modos</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top:6px; color:#777; font-size:11px;">
        Se muestran los últimos 10 registros. En el JSON se guardan hasta 30.
      </div>
    </div>
  `;
}

function getLastModalSpectralRawForExport() {
  return (
    window?.cadSystem?.modalSpectralLastResult ||
    window?.jhackModalSpectralLastResult ||
    null
  );
}

function buildModalSpectralExportRows(raw) {
  const results = raw?.results || [];

  return results.map((r) => {
    const finalResults = r?.final_spectral_results || {};
    const comparison = r?.comparison || {};
    const expected = comparison?.expected || {};
    const errors = comparison?.error_percent || {};
    const diag = r?.calibration_diagnostics || {};
    const periodDiag = diag?.period || {};
    const storyRows = r?.story_response_results?.stories || [];
    const maxStory = storyRows[storyRows.length - 1] || {};

    return {
      case_name: r?.case_name || "",
      direction: r?.direction || "",

      period_etabs_s: expected?.period_s ?? "",
      period_jhack_s: r?.modal_results?.period_s ?? r?.input?.period_for_calculation_s ?? "",
      period_error_percent: errors?.period ?? "",

      base_shear_etabs_tonf: expected?.base_shear_tonf ?? "",
      base_shear_jhack_tonf: finalResults?.equivalent_force_tonf ?? "",
      base_shear_error_percent: errors?.base_shear ?? "",

      displacement_etabs_m: expected?.max_displacement_m ?? "",
      displacement_jhack_m: finalResults?.spectral_displacement_m ?? "",
      displacement_error_percent: errors?.max_displacement ?? "",

      drift_etabs: expected?.drift ?? "",
      drift_jhack: finalResults?.estimated_drift ?? "",
      drift_error_percent: errors?.drift ?? "",

      story: maxStory?.story || "",
      story_elevation_m: maxStory?.elevation_m ?? "",
      story_height_m: maxStory?.story_height_m ?? "",
      story_mass_kg: maxStory?.story_mass_kg ?? "",
      story_drift: maxStory?.story_drift ?? "",
      story_shear_tonf: maxStory?.story_shear_tonf ?? "",

      calibration_status: diag?.status || "",
      calibration_max_error_percent: diag?.max_error_percent ?? "",
      stiffness_factor_k: periodDiag?.stiffness_multiplier_to_match_etabs_period ?? "",
      mass_factor_m: periodDiag?.mass_multiplier_to_match_etabs_period ?? "",

      source: finalResults?.source || "",
      modal_combination: r?.modal_combination_results?.method || "",
      modes_combined: r?.modal_combination_results?.modes_combined ?? "",
    };
  });
}

function convertRowsToCsv(rows) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";

    const text = String(value).replace(/"/g, '""');

    if (text.includes(",") || text.includes("\n") || text.includes('"')) {
      return `"${text}"`;
    }

    return text;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ];

  return lines.join("\n");
}

function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function buildModalSpectralReportFilename(extension = "csv") {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);

  return `jhack_modal_spectral_report_${stamp}.${extension}`;
}

function exportModalSpectralReportCSV() {
  const raw = getLastModalSpectralRawForExport();

  if (!raw) {
    alert("No hay resultados Modal Spectral para exportar.");
    return;
  }

  const rows = buildModalSpectralExportRows(raw);

  if (!rows.length) {
    alert("No hay filas de resultados para exportar.");
    return;
  }

  const csv = convertRowsToCsv(rows);
  const filename = buildModalSpectralReportFilename("csv");

  downloadTextFile(filename, csv, "text/csv;charset=utf-8");

  registerModalSpectralReportHistory("summary_csv", {
    label: "Summary CSV",
    comparisonRows: rows.length,
    note: filename,
  });
}

function buildPrintableModalSpectralReportHtml(raw) {
  const comparisonRows = buildModalSpectralExportRows(raw);
  const calibrationRows = buildCalibrationDiagnosticsExportRows(raw);
  const calibratedRows = buildCalibratedEstimateExportRows(raw);
  const storyRows = buildStoryResponseExportRows(raw);
  const participationRows = buildModalParticipationExportRows(raw);

  const summary = raw?.analysis_summary || {};
  const modelSummary = raw?.model_summary || raw?.model?.summary || {};

  // ============================================================
  // BLOQUE 7V-F - Executive Summary para reporte imprimible
  // ============================================================
  const validation =
    window?.cadSystem?.modalSpectralLastValidation ||
    raw?.jhack?.modalSpectralValidation ||
    raw?.modalSpectralValidation ||
    null;

  const validationSummary = validation?.summary || {};

  const executiveResults = Array.isArray(raw?.results) ? raw.results : [];

  const totalCases =
    summary.total_cases ??
    executiveResults.length ??
    0;

  const successfulCases =
    summary.successful_cases ??
    executiveResults.length ??
    0;

  const failedCases =
    summary.failed_cases ??
    0;

  const warningCount = Array.isArray(validation?.warnings)
    ? validation.warnings.length
    : 0;

  const validationOk = validation?.ok === true;

  const executiveCriticalCases =
    summary.calibration_critical_cases ??
    countModalSpectralCriticalCases(executiveResults);

  const executiveReviewCases =
    summary.calibration_review_cases ??
    countModalSpectralReviewCases(executiveResults);

  let executiveStatus = "OK";

  if (!validationOk || failedCases > 0 || executiveCriticalCases > 0) {
    executiveStatus = "CRITICAL";
  } else if (warningCount > 0 || executiveReviewCases > 0) {
    executiveStatus = "REVIEW";
  }

  const hasRealCalibrationComparison =
    raw?.real_calibration_comparison?.ok === true;

  const hasCalibratedEstimate =
    executiveResults.some((item) => item?.calibrated_estimate_results);

  const executiveRecommendation = buildModalSpectralExecutiveRecommendation({
    globalStatus: executiveStatus,
    validationOk,
    warningsCount: warningCount,
    criticalCases: executiveCriticalCases,
    reviewCases: executiveReviewCases,
    hasRealCalibrationComparison,
    hasCalibratedEstimate,
  });

  const buildRowsHtml = (rows, columns) => {
    if (!rows.length) {
      return `
        <tr>
          <td colspan="${columns.length}" style="text-align:left;">No data available.</td>
        </tr>
      `;
    }

    return rows.map((row) => `
      <tr>
        ${columns.map((col) => {
      const value = row[col.key];

      if (col.type === "exp") {
        return `<td>${fmtExp(value, col.decimals ?? 4)}</td>`;
      }

      if (col.type === "number") {
        return `<td>${fmt(value, col.decimals ?? 4)}</td>`;
      }

      if (col.type === "percent") {
        return `<td>${fmt(value, col.decimals ?? 2)}%</td>`;
      }

      return `<td style="text-align:left;">${escapeHtml(value ?? "")}</td>`;
    }).join("")}
      </tr>
    `).join("");
  };

  const buildTableHtml = (title, rows, columns) => {
    return `
      <h2>${escapeHtml(title)}</h2>
      <table>
        <thead>
          <tr>
            ${columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${buildRowsHtml(rows, columns)}
        </tbody>
      </table>
    `;
  };

  const comparisonColumns = [
    { key: "case_name", label: "Case" },
    { key: "direction", label: "Dir." },
    { key: "period_etabs_s", label: "T ETABS", type: "number", decimals: 6 },
    { key: "period_jhack_s", label: "T JHACK", type: "number", decimals: 6 },
    { key: "period_error_percent", label: "Err. T", type: "percent", decimals: 2 },
    { key: "base_shear_etabs_tonf", label: "Shear ETABS", type: "number", decimals: 5 },
    { key: "base_shear_jhack_tonf", label: "Shear JHACK", type: "number", decimals: 5 },
    { key: "base_shear_error_percent", label: "Err. Shear", type: "percent", decimals: 2 },
    { key: "displacement_jhack_m", label: "Disp. JHACK", type: "exp", decimals: 4 },
    { key: "drift_jhack", label: "Drift JHACK", type: "exp", decimals: 4 },
    { key: "calibration_status", label: "Status" },
    { key: "calibration_max_error_percent", label: "Max Error", type: "percent", decimals: 2 },
  ];

  const calibrationColumns = [
    { key: "case_name", label: "Case" },
    { key: "direction", label: "Dir." },
    { key: "status", label: "Status" },
    { key: "max_error_percent", label: "Max Error", type: "percent", decimals: 2 },
    { key: "etabs_period_s", label: "T ETABS", type: "number", decimals: 6 },
    { key: "jhack_period_s", label: "T JHACK", type: "number", decimals: 6 },
    { key: "stiffness_factor_k", label: "Factor K", type: "exp", decimals: 4 },
    { key: "mass_factor_m", label: "Factor M", type: "exp", decimals: 4 },
    { key: "base_shear_scale_factor", label: "Shear Factor", type: "number", decimals: 6 },
    { key: "displacement_scale_factor", label: "Disp. Factor", type: "exp", decimals: 4 },
    { key: "drift_scale_factor", label: "Drift Factor", type: "exp", decimals: 4 },
  ];

  const calibratedColumns = [
    { key: "case_name", label: "Case" },
    { key: "direction", label: "Dir." },
    { key: "status", label: "Status" },
    {
      key: "max_error_after_calibration_percent",
      label: "Max Err. After",
      type: "percent",
      decimals: 2,
    },

    { key: "period_etabs_s", label: "T ETABS", type: "number", decimals: 6 },
    { key: "period_original_jhack_s", label: "T Orig.", type: "number", decimals: 6 },
    { key: "period_calibrated_s", label: "T Calib.", type: "number", decimals: 6 },
    { key: "period_error_after_percent", label: "Err. T", type: "percent", decimals: 2 },

    { key: "base_shear_etabs_tonf", label: "Shear ETABS", type: "number", decimals: 5 },
    { key: "base_shear_original_jhack_tonf", label: "Shear Orig.", type: "number", decimals: 5 },
    { key: "base_shear_calibrated_tonf", label: "Shear Calib.", type: "number", decimals: 5 },
    { key: "base_shear_error_after_percent", label: "Err. Shear", type: "percent", decimals: 2 },

    { key: "displacement_etabs_m", label: "Disp. ETABS", type: "exp", decimals: 4 },
    { key: "displacement_original_jhack_m", label: "Disp. Orig.", type: "exp", decimals: 4 },
    { key: "displacement_calibrated_m", label: "Disp. Calib.", type: "exp", decimals: 4 },
    { key: "displacement_error_after_percent", label: "Err. Disp.", type: "percent", decimals: 2 },

    { key: "drift_etabs", label: "Drift ETABS", type: "exp", decimals: 4 },
    { key: "drift_original_jhack", label: "Drift Orig.", type: "exp", decimals: 4 },
    { key: "drift_calibrated", label: "Drift Calib.", type: "exp", decimals: 4 },
    { key: "drift_error_after_percent", label: "Err. Drift", type: "percent", decimals: 2 },
  ];

  const storyColumns = [
    { key: "case_name", label: "Case" },
    { key: "direction", label: "Dir." },
    { key: "story", label: "Story" },
    { key: "elevation_m", label: "Elev. m", type: "number", decimals: 3 },
    { key: "story_height_m", label: "Height m", type: "number", decimals: 3 },
    { key: "story_mass_kg", label: "Mass kg", type: "number", decimals: 3 },
    { key: "displacement_m", label: "Disp. m", type: "exp", decimals: 4 },
    { key: "story_displacement_delta_m", label: "Δ Disp. m", type: "exp", decimals: 4 },
    { key: "story_drift", label: "Drift", type: "exp", decimals: 4 },
    { key: "story_drift_percent", label: "Drift %", type: "percent", decimals: 5 },
    { key: "story_shear_tonf", label: "Shear tonf", type: "number", decimals: 5 },
  ];

  const participationColumns = [
    { key: "mode", label: "Mode", type: "number", decimals: 0 },
    { key: "period_s", label: "Period s", type: "number", decimals: 6 },
    { key: "frequency_hz", label: "Freq. Hz", type: "number", decimals: 6 },
    { key: "dominant_direction", label: "Dominant" },
    { key: "ux_ratio_percent", label: "UX %", type: "percent", decimals: 4 },
    { key: "ux_cumulative_percent", label: "Sum UX %", type: "percent", decimals: 4 },
    { key: "uy_ratio_percent", label: "UY %", type: "percent", decimals: 4 },
    { key: "uy_cumulative_percent", label: "Sum UY %", type: "percent", decimals: 4 },
    { key: "uz_ratio_percent", label: "UZ %", type: "percent", decimals: 4 },
    { key: "uz_cumulative_percent", label: "Sum UZ %", type: "percent", decimals: 4 },
  ];

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>JHACK Modal Spectral Full Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 24px;
      color: #111827;
    }

    h1 {
      font-size: 22px;
      margin-bottom: 4px;
    }

    h2 {
      font-size: 16px;
      margin-top: 24px;
      margin-bottom: 8px;
    }

    .muted {
      color: #6b7280;
      font-size: 12px;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 14px 0;
    }

        .executive-box {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 12px;
      margin: 12px 0 18px 0;
      background: #f9fafb;
    }

    .executive-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 10px;
    }

    .executive-title {
      font-size: 16px;
      font-weight: bold;
      color: #111827;
    }

    .executive-status {
      min-width: 90px;
      text-align: center;
      padding: 6px 10px;
      border-radius: 999px;
      font-weight: bold;
      font-size: 12px;
      border: 1px solid #d1d5db;
    }

    .executive-status-ok {
      background: #dcfce7;
      color: #166534;
      border-color: #86efac;
    }

    .executive-status-review {
      background: #fef3c7;
      color: #92400e;
      border-color: #fcd34d;
    }

    .executive-status-critical {
      background: #fee2e2;
      color: #991b1b;
      border-color: #fca5a5;
    }

    .card {
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px;
      min-height: 48px;
    }

    .card-title {
      font-size: 11px;
      color: #6b7280;
    }

    .card-value {
      font-size: 14px;
      font-weight: bold;
      margin-top: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-bottom: 12px;
    }

    th, td {
      border: 1px solid #d1d5db;
      padding: 4px;
      text-align: right;
      vertical-align: top;
    }

    th {
      background: #111827;
      color: white;
    }

    .note {
      margin-top: 16px;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 11px;
      color: #374151;
      background: #f9fafb;
    }

    @media print {
      button {
        display: none;
      }

      body {
        padding: 10px;
      }

      h2 {
        page-break-after: avoid;
      }

      table {
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>
  <button onclick="window.print()" style="margin-bottom:14px; padding:8px 12px;">
    Print / Save PDF
  </button>

  <h1>JHACK Modal Spectral Full Report</h1>
  <div class="muted">
    Generated at: ${escapeHtml(new Date().toLocaleString())}
  </div>

  <h2>Executive Summary</h2>

  <div class="executive-box">
    <div class="executive-header">
      <div>
        <div class="executive-title">Modal Spectral Executive Summary</div>
        <div class="muted">Resumen técnico del análisis modal espectral tipo ETABS.</div>
      </div>
      <div class="executive-status executive-status-${escapeHtml(String(executiveStatus).toLowerCase())}">
        ${escapeHtml(executiveStatus)}
      </div>
    </div>

    <div class="summary">
      <div class="card">
        <div class="card-title">Engine</div>
        <div class="card-value">${escapeHtml(raw?.engine || "OpenSeesPy")}</div>
      </div>

      <div class="card">
        <div class="card-title">Successful cases</div>
        <div class="card-value">${successfulCases} / ${totalCases}</div>
      </div>

      <div class="card">
        <div class="card-title">Failed cases</div>
        <div class="card-value">${failedCases}</div>
      </div>

      <div class="card">
        <div class="card-title">Warnings</div>
        <div class="card-value">${warningCount}</div>
      </div>

      <div class="card">
        <div class="card-title">Validation</div>
        <div class="card-value">${validationOk ? "OK" : "BLOCKED / NO DATA"}</div>
      </div>

      <div class="card">
        <div class="card-title">Nodes / Frames</div>
        <div class="card-value">${validationSummary.nodes ?? "-"} / ${validationSummary.frames ?? "-"}</div>
      </div>

      <div class="card">
        <div class="card-title">Supports</div>
        <div class="card-value">${validationSummary.supports ?? "-"}</div>
      </div>

      <div class="card">
        <div class="card-title">Active spectrum cases</div>
        <div class="card-value">${validationSummary.activeResponseSpectrumCases ?? "-"}</div>
      </div>

      <div class="card">
        <div class="card-title">Modal combination</div>
        <div class="card-value">${escapeHtml(summary.modal_combination || summary.modal_response_combination || "-")}</div>
      </div>

      <div class="card">
        <div class="card-title">Number of modes</div>
        <div class="card-value">${summary.number_of_modes ?? "-"}</div>
      </div>

      <div class="card">
        <div class="card-title">Critical cases</div>
        <div class="card-value">${executiveCriticalCases}</div>
      </div>

      <div class="card">
        <div class="card-title">Review cases</div>
        <div class="card-value">${executiveReviewCases}</div>
      </div>
    </div>

    <div class="note">
      <b>Recommendation:</b> ${escapeHtml(executiveRecommendation)}
    </div>
  </div>

  <h2>Analysis Summary</h2>

  <div class="summary">
    <div class="card">
      <div class="card-title">Status</div>
      <div class="card-value">${escapeHtml(summary.status || "-")}</div>
    </div>

    <div class="card">
      <div class="card-title">Total cases</div>
      <div class="card-value">${summary.total_cases ?? "-"}</div>
    </div>

    <div class="card">
      <div class="card-title">Successful cases</div>
      <div class="card-value">${summary.successful_cases ?? "-"}</div>
    </div>

    <div class="card">
      <div class="card-title">Critical calibration</div>
      <div class="card-value">${summary.calibration_critical_cases ?? "-"}</div>
    </div>

    <div class="card">
      <div class="card-title">Modal combination</div>
      <div class="card-value">${escapeHtml(summary.modal_combination || summary.modal_response_combination || "-")}</div>
    </div>

    <div class="card">
      <div class="card-title">Number of modes</div>
      <div class="card-value">${summary.number_of_modes ?? "-"}</div>
    </div>

    <div class="card">
      <div class="card-title">Force unit</div>
      <div class="card-value">${escapeHtml(summary.force_output_unit || "tonf")}</div>
    </div>

    <div class="card">
      <div class="card-title">Story response</div>
      <div class="card-value">${summary.story_response_available ? "Available" : "No"}</div>
    </div>

    <div class="card">
      <div class="card-title">Nodes</div>
      <div class="card-value">${modelSummary.nodes ?? modelSummary.nodesCount ?? "-"}</div>
    </div>

    <div class="card">
      <div class="card-title">Frames</div>
      <div class="card-value">${modelSummary.frames ?? modelSummary.framesCount ?? "-"}</div>
    </div>

    <div class="card">
      <div class="card-title">Sections</div>
      <div class="card-value">${modelSummary.sections ?? modelSummary.sectionsCount ?? "-"}</div>
    </div>

    <div class="card">
      <div class="card-title">Materials</div>
      <div class="card-value">${modelSummary.materials ?? modelSummary.materialsCount ?? "-"}</div>
    </div>
  </div>

  ${buildTableHtml("1. JHACK vs ETABS Comparison", comparisonRows, comparisonColumns)}

  ${buildTableHtml("2. Calibration Diagnostics", calibrationRows, calibrationColumns)}

  ${buildTableHtml("3. Calibrated Estimate Results", calibratedRows, calibratedColumns)}

  ${buildTableHtml("4. Story Response / Story Drift", storyRows, storyColumns)}

  ${buildTableHtml("5. Modal Participating Mass Ratios", participationRows, participationColumns)}

  <div class="note">
    <b>Technical note:</b>
    Calibration Diagnostics muestra factores recomendados.
    Calibrated Estimate Results muestra una estimación calculada con esos factores, pero no reemplaza el resultado real de OpenSeesPy.
    Si Real Model Calibration está activo, el sistema ejecuta un análisis real adicional usando los factores enviados en modelCalibration.
    Story drift debe revisarse contra ETABS durante la calibración final.
  </div>

</body>
</html>
  `;
}

function printModalSpectralReport() {
  const raw = getLastModalSpectralRawForExport();

  if (!raw) {
    alert("No hay resultados Modal Spectral para imprimir.");
    return;
  }

  const html = buildPrintableModalSpectralReportHtml(raw);
  const printWindow = window.open("", "_blank", "width=1200,height=800");

  if (!printWindow) {
    alert("El navegador bloqueó la ventana emergente. Permite popups para imprimir el reporte.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.focus();

  registerModalSpectralReportHistory("print_pdf", {
    label: "Print / Save PDF",
    comparisonRows: buildModalSpectralExportRows(raw).length,
    calibrationRows: buildCalibrationDiagnosticsExportRows(raw).length,
    calibratedRows: buildCalibratedEstimateExportRows(raw).length,
    storyRows: buildStoryResponseExportRows(raw).length,
    participationRows: buildModalParticipationExportRows(raw).length,
  });
}

// Exponer funciones para botones HTML dentro de SweetAlert.
window.jhackExportModalSpectralReportCSV = exportModalSpectralReportCSV;
window.jhackPrintModalSpectralReport = printModalSpectralReport;

function buildCalibrationRecommendationsHtml(recommendations = []) {
  if (!Array.isArray(recommendations) || !recommendations.length) {
    return `<span style="color:#777;">Sin recomendaciones.</span>`;
  }

  const visible = recommendations.slice(0, 3);

  return `
    <ul style="margin:0; padding-left:16px;">
      ${visible.map((item) => `
        <li style="margin-bottom:3px;">${escapeHtml(item)}</li>
      `).join("")}
    </ul>
  `;
}

function classifyEtabsComparisonStatus(maxErrorPct) {
  if (maxErrorPct === null || maxErrorPct === undefined || Number.isNaN(Number(maxErrorPct))) {
    return "REVIEW";
  }

  const value = Number(maxErrorPct);

  if (value <= 5) {
    return "OK";
  }

  if (value <= 15) {
    return "REVIEW";
  }

  return "CRITICAL";
}

function buildComparisonStatusBadgeHtml(status) {
  const text = String(status || "REVIEW").toUpperCase();

  if (text === "OK") {
    return `
      <span style="display:inline-block; min-width:70px; padding:2px 7px; border-radius:999px; background:#064e3b; color:#d1fae5; font-weight:bold;">
        OK
      </span>
    `;
  }

  if (text === "CRITICAL") {
    return `
      <span style="display:inline-block; min-width:70px; padding:2px 7px; border-radius:999px; background:#7f1d1d; color:#fee2e2; font-weight:bold;">
        CRITICAL
      </span>
    `;
  }

  return `
    <span style="display:inline-block; min-width:70px; padding:2px 7px; border-radius:999px; background:#78350f; color:#fef3c7; font-weight:bold;">
      REVIEW
    </span>
  `;
}

function buildSummaryMiniCardHtml(title, valueHtml) {
  return `
    <div style="border:1px solid #555; border-radius:6px; padding:8px; background:#0b1220;">
      <div style="font-size:10px; color:#9ca3af; margin-bottom:4px;">${escapeHtml(title)}</div>
      <div style="font-size:13px; color:white; font-weight:bold;">${valueHtml}</div>
    </div>
  `;
}

function buildErrorBadgeHtml(errorPct) {
  if (errorPct === null || errorPct === undefined || Number.isNaN(Number(errorPct))) {
    return `<span style="color:#777;">-</span>`;
  }

  const value = Number(errorPct);
  const label = `${fmt(value, 2)}%`;

  if (value <= 5) {
    return `
      <span style="display:inline-block; min-width:58px; padding:2px 6px; border-radius:999px; background:#064e3b; color:#d1fae5;">
        ${label}
      </span>
    `;
  }

  if (value <= 15) {
    return `
      <span style="display:inline-block; min-width:58px; padding:2px 6px; border-radius:999px; background:#78350f; color:#fef3c7;">
        ${label}
      </span>
    `;
  }

  return `
    <span style="display:inline-block; min-width:58px; padding:2px 6px; border-radius:999px; background:#7f1d1d; color:#fee2e2;">
      ${label}
    </span>
  `;
}

/**
 * Construye filas de tabla.
 */
function buildModalSpectralRowsHtml(table = [], includeErrors = false) {
  return table.map((row) => {
    const baseColumns = `
      <td style="border:1px solid #555; padding:5px;">${escapeHtml(row.caso)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.direccion)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.periodo_usado_s ?? row.periodo_s, 4)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.fuente_periodo)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.modo_real ?? "-")}</td>
      <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.masa_usada_kg, 2)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:center;">${shortSource(row.fuente_masa)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.participacion_modal_pct, 2)}%</td>
      <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.cortante_1modo_tonf, 4)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.cortante_comb_tonf, 4)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:right; font-weight:bold;">${fmt(row.cortante_final_tonf ?? row.cortante_tonf, 4)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.desplazamiento_final_m ?? row.desplazamiento_m, 3)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:right;">${fmtExp(row.deriva_final ?? row.deriva, 3)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.metodo_combinacion)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:center;">${escapeHtml(row.fuente_final)}</td>
    `;

    const errorColumns = includeErrors
      ? `
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.error_cortante_pct, 3)}%</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.error_desplazamiento_pct, 3)}%</td>
        <td style="border:1px solid #555; padding:5px; text-align:right;">${fmt(row.error_deriva_pct, 3)}%</td>
      `
      : "";

    return `
      <tr>
        ${baseColumns}
        ${errorColumns}
      </tr>
    `;
  }).join("");
}

/**
 * Tabla básica para resultado inmediato.
 */
function buildBasicModalSpectralTableHtml(rowsHtml) {
  return `
    <div style="max-height:420px; overflow:auto; border:1px solid #555;">
      <table style="min-width:1550px; width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:#1f2937; color:white; position:sticky; top:0;">
            ${buildBaseHeadersHtml()}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Tabla completa para menú Mostrar.
 */
function buildFullModalSpectralTableHtml(rowsHtml) {
  return `
    <div style="max-height:520px; overflow:auto; border:1px solid #555;">
      <table style="min-width:1800px; width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:#1f2937; color:white; position:sticky; top:0;">
            ${buildBaseHeadersHtml()}
            <th style="border:1px solid #555; padding:5px;">Err. Cort.</th>
            <th style="border:1px solid #555; padding:5px;">Err. Desp.</th>
            <th style="border:1px solid #555; padding:5px;">Err. Deriva</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function buildBaseHeadersHtml() {
  return `
    <th style="border:1px solid #555; padding:5px;">Caso</th>
    <th style="border:1px solid #555; padding:5px;">Dir.</th>
    <th style="border:1px solid #555; padding:5px;">T usado (s)</th>
    <th style="border:1px solid #555; padding:5px;">Fuente T</th>
    <th style="border:1px solid #555; padding:5px;">Modo</th>
    <th style="border:1px solid #555; padding:5px;">Masa usada (kg)</th>
    <th style="border:1px solid #555; padding:5px;">Fuente masa</th>
    <th style="border:1px solid #555; padding:5px;">Part. %</th>
    <th style="border:1px solid #555; padding:5px;">Cort. 1 modo</th>
    <th style="border:1px solid #555; padding:5px;">Cort. comb.</th>
    <th style="border:1px solid #555; padding:5px;">Cort. final</th>
    <th style="border:1px solid #555; padding:5px;">Desp. final (m)</th>
    <th style="border:1px solid #555; padding:5px;">Deriva final</th>
    <th style="border:1px solid #555; padding:5px;">Método</th>
    <th style="border:1px solid #555; padding:5px;">Fuente final</th>
  `;
}

function fmt(value, decimals = 3) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "-";
  }

  return number.toFixed(decimals);
}

function fmtExp(value, decimals = 3) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "-";
  }

  return number.toExponential(decimals);
}

function shortSource(value) {
  const text = String(value || "-");

  if (text === "modal_participation.effective_modal_mass") {
    return "Masa modal";
  }

  if (text === "case.effectiveMassKg") {
    return "Caso";
  }

  if (text === "case.effectiveMassKg.fallback_after_invalid_modal_mass") {
    return "Caso fallback";
  }

  return escapeHtml(text);
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "-";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
// resources/js/cad/analysis/7_responseSpectrumDefinitions.js

import Swal from "sweetalert2";

import {
    DEFAULT_RESPONSE_SPECTRUM_POINTS,
    DEFAULT_MODAL_SPECTRAL_CASES
} from "./4_modalSpectralPayload.js";

function clonePlain(data) {
    return JSON.parse(JSON.stringify(data ?? null));
}

function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

/**
 * Asegura que existan contenedores para:
 * - Response Spectrum Functions
 * - Response Spectrum Cases
 */
export function ensureResponseSpectrumDefinitions(cadSystem) {
    if (!cadSystem.responseSpectrumFunctions) {
        cadSystem.responseSpectrumFunctions = {
            items: [],
            selectedFunction: null,
        };
    }

    if (!Array.isArray(cadSystem.responseSpectrumFunctions.items)) {
        cadSystem.responseSpectrumFunctions.items = [];
    }

    if (!cadSystem.responseSpectrumCases) {
        cadSystem.responseSpectrumCases = {
            items: [],
            selectedCase: null,
        };
    }

    if (!Array.isArray(cadSystem.responseSpectrumCases.items)) {
        cadSystem.responseSpectrumCases.items = [];
    }

    // =====================================================
    // Función espectral por defecto validada con el Excel ETABS
    // =====================================================
    const defaultFunctionId = "ESPECTRO_ETABS_XX_YY";

    const hasDefaultFunction = cadSystem.responseSpectrumFunctions.items.some(
        (item) => String(item.id) === defaultFunctionId
    );

    if (!hasDefaultFunction) {
        cadSystem.responseSpectrumFunctions.items.push({
            id: defaultFunctionId,
            name: "ESPECTRO XX / YY - ETABS Excel",
            type: "response-spectrum",
            units: "Sa en g",
            damping: 0.05,
            points: clonePlain(DEFAULT_RESPONSE_SPECTRUM_POINTS),
            source: "validated-etabs-excel",
        });
    }

    if (!cadSystem.responseSpectrumFunctions.selectedFunction) {
        cadSystem.responseSpectrumFunctions.selectedFunction = defaultFunctionId;
    }

    // =====================================================
    // Casos espectrales por defecto validados con ETABS
    // =====================================================
    if (!cadSystem.responseSpectrumCases.items.length) {
        cadSystem.responseSpectrumCases.items = DEFAULT_MODAL_SPECTRAL_CASES.map(
            (item) => ({
                ...clonePlain(item),
                id: item.name.replace(/\s+/g, "_").toUpperCase(),
                functionId: defaultFunctionId,
                modalCombination: "CQC",
                damping: 0.05,
                enabled: true,
            })
        );
    }

    if (!cadSystem.responseSpectrumCases.selectedCase) {
        cadSystem.responseSpectrumCases.selectedCase =
            cadSystem.responseSpectrumCases.items[0]?.id || null;
    }

    return {
        functions: cadSystem.responseSpectrumFunctions.items,
        cases: cadSystem.responseSpectrumCases.items,
    };
}

/**
 * Devuelve la función espectral seleccionada.
 */
export function getSelectedResponseSpectrumFunction(cadSystem) {
    ensureResponseSpectrumDefinitions(cadSystem);

    const selectedId = cadSystem.responseSpectrumFunctions.selectedFunction;

    return (
        cadSystem.responseSpectrumFunctions.items.find(
            (item) => String(item.id) === String(selectedId)
        ) ||
        cadSystem.responseSpectrumFunctions.items[0] ||
        null
    );
}

/**
 * Devuelve casos espectrales activos.
 */
export function getEnabledResponseSpectrumCases(cadSystem) {
    ensureResponseSpectrumDefinitions(cadSystem);

    return cadSystem.responseSpectrumCases.items.filter(
        (item) => item.enabled !== false
    );
}

/**
 * Opciones que se pasan al payload.
 */
export function buildResponseSpectrumPayloadOptions(cadSystem) {
    const selectedFunction = getSelectedResponseSpectrumFunction(cadSystem);
    const enabledCases = getEnabledResponseSpectrumCases(cadSystem);

    return {
        responseSpectrumName:
            selectedFunction?.name || "ESPECTRO XX / YY - ETABS Excel",

        responseSpectrumUnits:
            selectedFunction?.units || "Sa en g",

        responseSpectrumPoints:
            clonePlain(selectedFunction?.points || DEFAULT_RESPONSE_SPECTRUM_POINTS),

        cases:
            clonePlain(enabledCases.length ? enabledCases : DEFAULT_MODAL_SPECTRAL_CASES),

        modalCombination:
            enabledCases[0]?.modalCombination || "CQC",

        numberOfModes:
            toNumber(cadSystem?.analysisOptions?.dynamicParams?.numModes, 3) || 3,
    };
}

/**
 * Ventana Define > Response Spectrum Functions...
 */
export async function openResponseSpectrumFunctionsDialog(cadSystem) {
    ensureResponseSpectrumDefinitions(cadSystem);

    const functions = cadSystem.responseSpectrumFunctions.items;
    const selectedId = cadSystem.responseSpectrumFunctions.selectedFunction;

    const rowsHtml = functions.map((fn) => {
        const selected = String(fn.id) === String(selectedId) ? "checked" : "";

        return `
      <tr>
        <td style="border:1px solid #555; padding:6px; text-align:center;">
          <input type="radio" name="response-spectrum-function" value="${fn.id}" ${selected}>
        </td>
        <td style="border:1px solid #555; padding:6px;">${fn.name}</td>
        <td style="border:1px solid #555; padding:6px; text-align:center;">${fn.units || "-"}</td>
        <td style="border:1px solid #555; padding:6px; text-align:center;">${fn.damping ?? 0.05}</td>
        <td style="border:1px solid #555; padding:6px; text-align:center;">${fn.points?.length || 0}</td>
      </tr>
    `;
    }).join("");

    const selectedFunction = getSelectedResponseSpectrumFunction(cadSystem);
    const pointsRowsHtml = (selectedFunction?.points || []).map((point) => `
    <tr>
      <td style="border:1px solid #555; padding:5px; text-align:right;">${Number(point.T || 0).toFixed(3)}</td>
      <td style="border:1px solid #555; padding:5px; text-align:right;">${Number(point.Sa || 0).toFixed(6)}</td>
    </tr>
  `).join("");

    const result = await Swal.fire({
        title: "Response Spectrum Functions",
        width: 900,
        html: `
      <div style="text-align:left; font-size:12px;">
        <p style="margin-bottom:10px;">
          Define la función espectral que usará el análisis modal espectral.
        </p>

        <div style="display:grid; grid-template-columns: 1.4fr 0.8fr; gap:12px;">
          <div>
            <div style="font-weight:bold; margin-bottom:6px;">Funciones disponibles</div>

            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="background:#1f2937; color:white;">
                  <th style="border:1px solid #555; padding:6px;">Sel.</th>
                  <th style="border:1px solid #555; padding:6px;">Nombre</th>
                  <th style="border:1px solid #555; padding:6px;">Unid.</th>
                  <th style="border:1px solid #555; padding:6px;">Damp.</th>
                  <th style="border:1px solid #555; padding:6px;">Puntos</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <div>
            <div style="font-weight:bold; margin-bottom:6px;">Puntos T - Sa</div>

            <div style="max-height:300px; overflow:auto; border:1px solid #555;">
              <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead>
                  <tr style="background:#1f2937; color:white; position:sticky; top:0;">
                    <th style="border:1px solid #555; padding:5px;">T</th>
                    <th style="border:1px solid #555; padding:5px;">Sa</th>
                  </tr>
                </thead>
                <tbody>
                  ${pointsRowsHtml}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
          Por ahora se carga la función espectral validada con el Excel de ETABS.
          Luego agregaremos edición manual/importación desde tabla.
        </div>
      </div>
    `,
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const selected = document.querySelector(
                'input[name="response-spectrum-function"]:checked'
            );

            return selected?.value || null;
        },
    });

    if (!result.isConfirmed || !result.value) return;

    cadSystem.responseSpectrumFunctions.selectedFunction = result.value;

    cadSystem.showMessage?.(
        `Response Spectrum Function seleccionada: ${result.value}`
    );

    console.log("✅ Response Spectrum Function seleccionada:", {
        selectedFunction: result.value,
        functions: cadSystem.responseSpectrumFunctions.items,
    });
}

/**
 * Ventana Define > Response Spectrum Cases...
 *
 * Versión editable:
 * - Activa/desactiva casos.
 * - Permite editar dirección, periodo, masa, altura, factor y combinación.
 * - Los valores guardados alimentan el payload de Modal Spectral Analysis.
 */
export async function openResponseSpectrumCasesDialog(cadSystem) {
    ensureResponseSpectrumDefinitions(cadSystem);

    const selectedFunction = getSelectedResponseSpectrumFunction(cadSystem);
    const cases = cadSystem.responseSpectrumCases.items;

    const rowsHtml = cases.map((item, index) => {
        const checked = item.enabled !== false ? "checked" : "";

        return `
      <tr>
        <td style="border:1px solid #555; padding:5px; text-align:center;">
          <input 
            type="checkbox" 
            class="rsp-case-enabled" 
            data-index="${index}" 
            ${checked}>
        </td>

        <td style="border:1px solid #555; padding:5px;">
          <input 
            class="rsp-case-name" 
            data-index="${index}" 
            type="text" 
            value="${item.name || ""}"
            style="width:100%; padding:4px;">
        </td>

        <td style="border:1px solid #555; padding:5px;">
          <select 
            class="rsp-case-direction" 
            data-index="${index}" 
            style="width:100%; padding:4px;">
            <option value="X" ${item.direction === "X" ? "selected" : ""}>X</option>
            <option value="Y" ${item.direction === "Y" ? "selected" : ""}>Y</option>
          </select>
        </td>

        <td style="border:1px solid #555; padding:5px;">
          <input 
            class="rsp-case-period" 
            data-index="${index}" 
            type="number" 
            step="0.001" 
            value="${Number(item.targetPeriodS || 0).toFixed(3)}"
            style="width:100%; padding:4px; text-align:right;">
        </td>

        <td style="border:1px solid #555; padding:5px;">
          <input 
            class="rsp-case-mass" 
            data-index="${index}" 
            type="number" 
            step="0.001" 
            value="${Number(item.effectiveMassKg || 0)}"
            style="width:100%; padding:4px; text-align:right;">
        </td>

        <td style="border:1px solid #555; padding:5px;">
          <input 
            class="rsp-case-height" 
            data-index="${index}" 
            type="number" 
            step="0.001" 
            value="${Number(item.heightM || 0)}"
            style="width:100%; padding:4px; text-align:right;">
        </td>

        <td style="border:1px solid #555; padding:5px;">
          <input 
            class="rsp-case-scale" 
            data-index="${index}" 
            type="number" 
            step="0.0001" 
            value="${Number(item.scaleFactor || 0)}"
            style="width:100%; padding:4px; text-align:right;">
        </td>

        <td style="border:1px solid #555; padding:5px;">
          <select 
            class="rsp-case-combination" 
            data-index="${index}" 
            style="width:100%; padding:4px;">
            <option value="CQC" ${(item.modalCombination || "CQC") === "CQC" ? "selected" : ""}>CQC</option>
            <option value="SRSS" ${item.modalCombination === "SRSS" ? "selected" : ""}>SRSS</option>
            <option value="ABS" ${item.modalCombination === "ABS" ? "selected" : ""}>ABS</option>
          </select>
        </td>
      </tr>
    `;
    }).join("");

    const result = await Swal.fire({
        title: "Response Spectrum Cases",
        width: 1200,
        html: `
      <div style="text-align:left; font-size:12px;">
        <p style="margin-bottom:10px;">
          Define los casos espectrales que se enviarán al análisis Modal Spectral.
        </p>

        <div style="margin-bottom:10px; padding:10px; border:1px solid #555; border-radius:6px;">
          <b>Función espectral activa:</b><br>
          ${selectedFunction?.name || "-"}
        </div>

        <div style="max-height:430px; overflow:auto; border:1px solid #555;">
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="background:#1f2937; color:white; position:sticky; top:0;">
                <th style="border:1px solid #555; padding:5px; width:55px;">Activo</th>
                <th style="border:1px solid #555; padding:5px; min-width:150px;">Caso</th>
                <th style="border:1px solid #555; padding:5px; width:70px;">Dir.</th>
                <th style="border:1px solid #555; padding:5px; width:95px;">T objetivo</th>
                <th style="border:1px solid #555; padding:5px; width:115px;">Masa kg</th>
                <th style="border:1px solid #555; padding:5px; width:95px;">Altura m</th>
                <th style="border:1px solid #555; padding:5px; width:115px;">Factor</th>
                <th style="border:1px solid #555; padding:5px; width:95px;">Comb.</th>
              </tr>
            </thead>

            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777;">
          Estos valores serán usados directamente por:
          <br>
          <code>Analizar &gt; Modal Spectral Analysis...</code>
        </div>
      </div>
    `,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Guardar",
        denyButtonText: "Restaurar defaults",
        cancelButtonText: "Cancelar",

        preConfirm: () => {
            const updatedCases = readResponseSpectrumCasesFromDialog(cases);

            const activeCases = updatedCases.filter((item) => item.enabled !== false);

            if (!activeCases.length) {
                Swal.showValidationMessage("Debe quedar al menos un caso activo.");
                return false;
            }

            const invalidCase = updatedCases.find((item) => {
                return (
                    !item.name ||
                    !item.direction ||
                    Number(item.targetPeriodS) <= 0 ||
                    Number(item.effectiveMassKg) <= 0 ||
                    Number(item.heightM) <= 0 ||
                    Number(item.scaleFactor) <= 0
                );
            });

            if (invalidCase) {
                Swal.showValidationMessage(
                    `Revisa el caso "${invalidCase.name || "sin nombre"}". T, masa, altura y factor deben ser mayores que cero.`
                );
                return false;
            }

            return updatedCases;
        },
    });

    if (result.isDenied) {
        restoreDefaultResponseSpectrumCases(cadSystem);
        return;
    }

    if (!result.isConfirmed || !Array.isArray(result.value)) return;

    cadSystem.responseSpectrumCases.items = result.value.map((item) => ({
        ...item,
        functionId: selectedFunction?.id || item.functionId || null,
    }));

    cadSystem.showMessage?.(
        `Response Spectrum Cases guardados: ${cadSystem.responseSpectrumCases.items.filter((item) => item.enabled !== false).length
        } activo(s).`
    );

    console.log("✅ Response Spectrum Cases guardados:", {
        activeCases: getEnabledResponseSpectrumCases(cadSystem),
        allCases: cadSystem.responseSpectrumCases.items,
    });
}

/**
 * Lee los casos editados desde la tabla del SweetAlert.
 */
function readResponseSpectrumCasesFromDialog(previousCases = []) {
    return previousCases.map((oldCase, index) => {
        const enabled = document.querySelector(
            `.rsp-case-enabled[data-index="${index}"]`
        )?.checked === true;

        const name = document.querySelector(
            `.rsp-case-name[data-index="${index}"]`
        )?.value?.trim() || oldCase.name;

        const direction = document.querySelector(
            `.rsp-case-direction[data-index="${index}"]`
        )?.value || oldCase.direction || "X";

        const targetPeriodS = toNumber(
            document.querySelector(`.rsp-case-period[data-index="${index}"]`)?.value,
            oldCase.targetPeriodS || 0
        );

        const effectiveMassKg = toNumber(
            document.querySelector(`.rsp-case-mass[data-index="${index}"]`)?.value,
            oldCase.effectiveMassKg || 0
        );

        const heightM = toNumber(
            document.querySelector(`.rsp-case-height[data-index="${index}"]`)?.value,
            oldCase.heightM || 0
        );

        const scaleFactor = toNumber(
            document.querySelector(`.rsp-case-scale[data-index="${index}"]`)?.value,
            oldCase.scaleFactor || 0
        );

        const modalCombination = document.querySelector(
            `.rsp-case-combination[data-index="${index}"]`
        )?.value || oldCase.modalCombination || "CQC";

        return {
            ...oldCase,
            id:
                oldCase.id ||
                name.replace(/\s+/g, "_").toUpperCase(),

            name,
            direction,
            targetPeriodS,
            effectiveMassKg,
            heightM,
            scaleFactor,
            modalCombination,
            enabled,

            functionId: oldCase.functionId || null,

            expected: {
                ...(oldCase.expected || {}),
            },
        };
    });
}

/**
 * Restaura los casos espectrales validados por defecto.
 */
function restoreDefaultResponseSpectrumCases(cadSystem) {
    const selectedFunction = getSelectedResponseSpectrumFunction(cadSystem);
    const defaultFunctionId = selectedFunction?.id || "ESPECTRO_ETABS_XX_YY";

    cadSystem.responseSpectrumCases.items = DEFAULT_MODAL_SPECTRAL_CASES.map(
        (item) => ({
            ...clonePlain(item),
            id: item.name.replace(/\s+/g, "_").toUpperCase(),
            functionId: defaultFunctionId,
            modalCombination: "CQC",
            damping: 0.05,
            enabled: true,
        })
    );

    cadSystem.responseSpectrumCases.selectedCase =
        cadSystem.responseSpectrumCases.items[0]?.id || null;

    cadSystem.showMessage?.("Response Spectrum Cases restaurados a valores por defecto.");

    console.log("♻️ Response Spectrum Cases restaurados:", {
        cases: cadSystem.responseSpectrumCases.items,
    });
}
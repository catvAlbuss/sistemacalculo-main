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

// ─────────────────────────────────────────────────────────────────────────
//  Parseo local de espectro (filas crudas) — soporta Period o Frequency vs Value
// ─────────────────────────────────────────────────────────────────────────
function parseSpectrumRows(text, headerLines = 0) {
    const lines = String(text).split(/\r?\n/).slice(Math.max(0, headerLines));
    const rows = [];
    for (const raw of lines) {
        const line = raw.trim();
        if (!line || /^[#/%]/.test(line)) continue;
        let parts = null;
        for (const sep of [",", ";", "\t", " "]) {
            const p = line.split(sep).map((s) => s.trim()).filter(Boolean);
            if (p.length >= 2) { parts = p; break; }
        }
        if (!parts) continue;
        const a = parseFloat(parts[0].replace(",", "."));
        const b = parseFloat(parts[1].replace(",", "."));
        if (Number.isFinite(a) && Number.isFinite(b)) rows.push([a, b]);
    }
    return rows;
}

// Convierte filas [col0, Sa] a puntos {T, Sa} según "Values are".
function rowsToPoints(rows, valuesAre) {
    const pts = rows
        .map(([a, b]) => (valuesAre === "frequency" ? (a > 0 ? { T: 1 / a, Sa: b } : null) : { T: a, Sa: b }))
        .filter(Boolean);
    pts.sort((x, y) => x.T - y.T);
    return pts;
}

function genFunctionId(cadSystem) {
    const items = cadSystem.responseSpectrumFunctions.items;
    let n = items.length + 1;
    let id = `FUNC${n}`;
    while (items.some((f) => String(f.id) === id)) { n++; id = `FUNC${n}`; }
    return id;
}

/**
 * Ventana Define > Response Spectrum Functions...  (estilo ETABS)
 * Lista de funciones con Add / Modify / Delete y un segundo modal de definición.
 */
export async function openResponseSpectrumFunctionsDialog(cadSystem) {
    ensureResponseSpectrumDefinitions(cadSystem);

    let keepOpen = true;
    while (keepOpen) {
        const action = await showFunctionsListModal(cadSystem);

        switch (action.type) {
            case "add":
                if (action.addType === "default") {
                    const id = genFunctionId(cadSystem);
                    const points = cadSystem._defaultDesignSpectrum?.() || [];
                    cadSystem.responseSpectrumFunctions.items.push({
                        id, name: id, type: "response-spectrum", units: "Sa en g",
                        damping: 0.05, valuesAre: "period", headerLines: 0,
                        fileName: "(espectro por defecto)", rawText: "", points,
                        source: "default",
                    });
                    cadSystem.responseSpectrumFunctions.selectedFunction = id;
                    cadSystem.showMessage?.(`Función "${id}" creada con el espectro por defecto (${points.length} puntos).`, "success");
                } else {
                    await openResponseSpectrumFunctionDefinitionDialog(cadSystem, null);
                }
                break;

            case "modify": {
                if (!action.id) { cadSystem.showMessage?.("Selecciona una función para modificar.", "warning"); break; }
                const fn = cadSystem.responseSpectrumFunctions.items.find((f) => String(f.id) === String(action.id));
                if (fn) await openResponseSpectrumFunctionDefinitionDialog(cadSystem, fn);
                break;
            }

            case "delete": {
                if (!action.id) { cadSystem.showMessage?.("Selecciona una función para eliminar.", "warning"); break; }
                const items = cadSystem.responseSpectrumFunctions.items;
                const idx = items.findIndex((f) => String(f.id) === String(action.id));
                if (idx !== -1) {
                    const removed = items.splice(idx, 1)[0];
                    if (cadSystem.responseSpectrumFunctions.selectedFunction === action.id) {
                        cadSystem.responseSpectrumFunctions.selectedFunction = items[0]?.id || null;
                    }
                    cadSystem.showMessage?.(`Función "${removed.name}" eliminada.`, "success");
                }
                break;
            }

            case "use": {
                // Puente con NUESTRO flujo: cargar la función seleccionada como espectro X e Y.
                const fn = cadSystem.responseSpectrumFunctions.items.find((f) => String(f.id) === String(action.id));
                if (fn?.points?.length && cadSystem.seismicConfig) {
                    cadSystem.seismicConfig.spectrumX = fn.points.map((p) => ({ ...p }));
                    cadSystem.seismicConfig.spectrumY = fn.points.map((p) => ({ ...p }));
                    cadSystem.responseSpectrumFunctions.selectedFunction = fn.id;
                    cadSystem.showMessage?.(`"${fn.name}" cargada como espectro X e Y para el análisis sísmico.`, "success");
                }
                keepOpen = false;
                break;
            }

            case "ok":
                if (action.id) cadSystem.responseSpectrumFunctions.selectedFunction = action.id;
                keepOpen = false;
                break;

            default: // cancel
                keepOpen = false;
        }
    }
}

/**
 * Modal 1: lista "Define Response Spectrum Functions".
 * Resuelve con {type:'add'|'modify'|'delete'|'use'|'ok'|'cancel', id}.
 */
function showFunctionsListModal(cadSystem) {
    const functions = cadSystem.responseSpectrumFunctions.items;
    const selectedId = cadSystem.responseSpectrumFunctions.selectedFunction;

    const rowsHtml = functions.map((fn) => {
        const sel = String(fn.id) === String(selectedId) ? "checked" : "";
        return `<label style="display:flex; align-items:center; gap:8px; padding:5px 8px; border-bottom:1px solid #334155; cursor:pointer">
            <input type="radio" name="rsf-sel" value="${fn.id}" ${sel}>
            <span style="flex:1; color:#e2e8f0">${fn.name}</span>
            <span style="color:#64748b; font-size:11px">${fn.points?.length || 0} pts</span>
          </label>`;
    }).join("") || `<div style="color:#64748b; padding:14px; text-align:center">Sin funciones definidas</div>`;

    const btn = (id, label, color) =>
        `<button id="${id}" style="width:100%; margin-bottom:6px; padding:6px 10px; border:none; border-radius:4px; color:#fff; cursor:pointer; font-size:12px; background:${color}">${label}</button>`;

    return new Promise((resolve) => {
        let settled = false;
        const done = (v) => { if (!settled) { settled = true; resolve(v); Swal.close(); } };

        Swal.fire({
            title: "Define Response Spectrum Functions",
            width: 760,
            background: "#1a2035",
            color: "#e2e8f0",
            showCancelButton: true,
            confirmButtonText: "OK",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#1d4ed8",
            html: `
              <div style="display:grid; grid-template-columns: 1fr 220px; gap:14px; text-align:left; font-family:monospace">
                <div>
                  <div style="color:#7eb8f7; font-size:12px; font-weight:600; margin-bottom:6px">Response Spectra</div>
                  <div style="border:1px solid #475569; border-radius:6px; max-height:230px; overflow:auto">${rowsHtml}</div>
                  <div id="rsf-graph" style="margin-top:10px; display:flex; justify-content:center"></div>
                </div>
                <div>
                  <div style="color:#7eb8f7; font-size:12px; font-weight:600; margin-bottom:6px">Choose Function Type to Add</div>
                  <select id="rsf-type" style="width:100%; margin-bottom:12px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:6px">
                    <option value="file">Spectrum from File</option>
                    <option value="default">Espectro por defecto</option>
                  </select>
                  <div style="color:#94a3b8; font-size:11px; margin-bottom:6px">Click to:</div>
                  ${btn("rsf-add", "Add New Function...", "#2d5a8e")}
                  ${btn("rsf-modify", "Modify/Show Spectrum...", "#0f766e")}
                  ${btn("rsf-delete", "Delete Spectrum", "#7f1d1d")}
                  <div style="border-top:1px solid #334155; margin:10px 0"></div>
                  ${btn("rsf-use", "Usar en análisis sísmico ▶", "#7c3aed")}
                </div>
              </div>`,
            didOpen: () => {
                const getSel = () => document.querySelector('input[name="rsf-sel"]:checked')?.value || null;
                const renderGraph = () => {
                    const box = document.getElementById("rsf-graph");
                    const fn = functions.find((f) => String(f.id) === String(getSel()));
                    if (!box) return;
                    box.innerHTML = fn?.points?.length
                        ? cadSystem._buildSpectrumSVG?.([{ name: fn.name, color: "#60a5fa", points: fn.points }]) || ""
                        : `<div style="color:#64748b; font-size:11px; padding:14px">Selecciona una función para ver su gráfico</div>`;
                };
                renderGraph();
                document.querySelectorAll('input[name="rsf-sel"]').forEach((r) => r.addEventListener("change", renderGraph));

                document.getElementById("rsf-add")?.addEventListener("click", () => {
                    const type = document.getElementById("rsf-type")?.value || "file";
                    done({ type: "add", addType: type });
                });
                document.getElementById("rsf-modify")?.addEventListener("click", () => done({ type: "modify", id: getSel() }));
                document.getElementById("rsf-delete")?.addEventListener("click", () => done({ type: "delete", id: getSel() }));
                document.getElementById("rsf-use")?.addEventListener("click", () => {
                    const id = getSel();
                    if (!id) { cadSystem.showMessage?.("Selecciona una función primero.", "warning"); return; }
                    done({ type: "use", id });
                });
            },
            preConfirm: () => ({ type: "ok", id: document.querySelector('input[name="rsf-sel"]:checked')?.value || null }),
        }).then((r) => {
            if (settled) return;
            settled = true;
            if (r.isConfirmed) resolve(r.value || { type: "ok" });
            else resolve({ type: "cancel" });
        });
    });
}

/**
 * Modal 2: "Response Spectrum Function Definition" (estilo ETABS).
 * Nombre, damping, archivo (Browse), header lines, Period/Frequency vs Value, gráfico.
 */
async function openResponseSpectrumFunctionDefinitionDialog(cadSystem, existing) {
    const isNew = !existing;
    const draft = {
        id: existing?.id || genFunctionId(cadSystem),
        name: existing?.name || genFunctionId(cadSystem),
        damping: existing?.damping ?? 0.05,
        valuesAre: existing?.valuesAre || "period",
        headerLines: existing?.headerLines ?? 0,
        fileName: existing?.fileName || "",
        rawText: existing?.rawText || "",
        rows: existing?.points ? existing.points.map((p) => [p.T, p.Sa]) : [],
        points: existing?.points ? existing.points.map((p) => ({ ...p })) : [],
    };

    const result = await Swal.fire({
        title: "Response Spectrum Function Definition",
        width: 720,
        background: "#1a2035",
        color: "#e2e8f0",
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#1d4ed8",
        html: `
          <div style="text-align:left; font-family:monospace; font-size:12px">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px">
              <div>
                <label style="color:#cbd5e1">Function Name</label>
                <input id="rsfd-name" value="${draft.name}" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
              </div>
              <div>
                <label style="color:#cbd5e1">Function Damping Ratio</label>
                <input id="rsfd-damp" type="number" step="0.01" min="0" max="1" value="${draft.damping}" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
              </div>
            </div>

            <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px; margin-bottom:10px">
              <legend style="color:#7eb8f7; font-size:11px; padding:0 6px">Function File</legend>
              <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
                <button id="rsfd-browse" style="background:#2d5a8e; color:#fff; border:none; padding:5px 12px; border-radius:4px; cursor:pointer">Browse...</button>
                <span id="rsfd-filename" style="flex:1; color:#94a3b8; font-size:11px">${draft.fileName || "Ningún archivo"}</span>
                <button id="rsfd-viewfile" style="background:#374151; color:#fff; border:none; padding:5px 12px; border-radius:4px; cursor:pointer">View File</button>
              </div>
              <div style="display:flex; gap:14px; align-items:center">
                <label style="color:#cbd5e1">Header Lines to Skip
                  <input id="rsfd-header" type="number" min="0" value="${draft.headerLines}" style="width:60px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px 5px; margin-left:4px">
                </label>
              </div>
            </fieldset>

            <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px; margin-bottom:10px">
              <legend style="color:#7eb8f7; font-size:11px; padding:0 6px">Values are</legend>
              <label style="color:#cbd5e1; margin-right:16px"><input type="radio" name="rsfd-vals" value="frequency" ${draft.valuesAre === "frequency" ? "checked" : ""}> Frequency vs Value</label>
              <label style="color:#cbd5e1"><input type="radio" name="rsfd-vals" value="period" ${draft.valuesAre === "period" ? "checked" : ""}> Period vs Value</label>
            </fieldset>

            <div style="color:#7eb8f7; font-size:11px; margin-bottom:4px">Function Graph <span id="rsfd-count" style="color:#64748b">(${draft.points.length} puntos)</span></div>
            <div id="rsfd-graph" style="display:flex; justify-content:center"></div>
          </div>`,
        didOpen: () => {
            const renderGraph = () => {
                const box = document.getElementById("rsfd-graph");
                const count = document.getElementById("rsfd-count");
                if (count) count.textContent = `(${draft.points.length} puntos)`;
                if (box) {
                    box.innerHTML = draft.points.length
                        ? cadSystem._buildSpectrumSVG?.([{ name: draft.name, color: "#60a5fa", points: draft.points }]) || ""
                        : `<div style="color:#64748b; font-size:11px; padding:18px">Importa un archivo para ver el gráfico</div>`;
                }
            };
            const recompute = () => {
                draft.headerLines = parseInt(document.getElementById("rsfd-header")?.value) || 0;
                draft.valuesAre = document.querySelector('input[name="rsfd-vals"]:checked')?.value || "period";
                draft.rows = draft.rawText ? parseSpectrumRows(draft.rawText, draft.headerLines) : draft.rows;
                draft.points = rowsToPoints(draft.rows, draft.valuesAre);
                renderGraph();
            };
            renderGraph();

            document.querySelectorAll('input[name="rsfd-vals"]').forEach((r) => r.addEventListener("change", recompute));
            document.getElementById("rsfd-header")?.addEventListener("change", recompute);

            document.getElementById("rsfd-browse")?.addEventListener("click", async () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".txt,.csv";
                input.addEventListener("change", async () => {
                    const file = input.files[0];
                    if (!file) return;
                    draft.rawText = await file.text();
                    draft.fileName = file.name;
                    const el = document.getElementById("rsfd-filename");
                    if (el) el.textContent = file.name;
                    recompute();
                });
                input.click();
            });

            document.getElementById("rsfd-viewfile")?.addEventListener("click", () => {
                Swal.fire({
                    title: draft.fileName || "Archivo",
                    html: `<pre style="text-align:left; max-height:340px; overflow:auto; font-size:11px; color:#cbd5e1; background:#0f172a; padding:10px; border-radius:6px">${(draft.rawText || "Sin contenido. Usa Browse para importar.").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]))}</pre>`,
                    width: 560, background: "#1a2035", color: "#e2e8f0", confirmButtonText: "Cerrar", confirmButtonColor: "#1d4ed8",
                });
            });
        },
        preConfirm: () => {
            const name = document.getElementById("rsfd-name")?.value?.trim();
            const damping = parseFloat(document.getElementById("rsfd-damp")?.value);
            if (!name) { Swal.showValidationMessage("El nombre de la función es obligatorio."); return false; }
            const check = cadSystem._validateSpectrum?.(draft.points) || { ok: draft.points.length >= 2 };
            if (!check.ok) { Swal.showValidationMessage(`Espectro inválido: ${check.error || "se necesitan al menos 2 puntos."}`); return false; }
            return {
                id: draft.id,
                name,
                type: "response-spectrum",
                units: "Sa en g",
                damping: Number.isFinite(damping) ? damping : 0.05,
                valuesAre: draft.valuesAre,
                headerLines: draft.headerLines,
                fileName: draft.fileName,
                rawText: draft.rawText,
                points: draft.points,
                source: "user-file",
            };
        },
    });

    if (!result.isConfirmed || !result.value) return;

    const items = cadSystem.responseSpectrumFunctions.items;
    const fn = result.value;
    const idx = items.findIndex((f) => String(f.id) === String(fn.id));
    if (idx !== -1) items[idx] = fn;
    else items.push(fn);
    cadSystem.responseSpectrumFunctions.selectedFunction = fn.id;

    cadSystem.showMessage?.(`Función "${fn.name}" ${isNew ? "creada" : "actualizada"} (${fn.points.length} puntos).`, "success");
}

/**
 * Ventana Define > Response Spectrum Cases...  (estilo ETABS)
 * Lista "Define Response Spectra" + modal "Response Spectrum Case Data".
 */
export async function openResponseSpectrumCasesDialog(cadSystem) {
    ensureResponseSpectrumDefinitions(cadSystem);

    let keepOpen = true;
    while (keepOpen) {
        const action = await showCasesListModal(cadSystem);

        switch (action.type) {
            case "add":
                await openResponseSpectrumCaseDataDialog(cadSystem, null);
                break;

            case "modify": {
                if (!action.id) { cadSystem.showMessage?.("Selecciona un caso para modificar.", "warning"); break; }
                const c = cadSystem.responseSpectrumCases.items.find((x) => String(x.id) === String(action.id));
                if (c) await openResponseSpectrumCaseDataDialog(cadSystem, c);
                break;
            }

            case "delete": {
                if (!action.id) { cadSystem.showMessage?.("Selecciona un caso para eliminar.", "warning"); break; }
                const items = cadSystem.responseSpectrumCases.items;
                const idx = items.findIndex((x) => String(x.id) === String(action.id));
                if (idx !== -1) {
                    const removed = items.splice(idx, 1)[0];
                    if (cadSystem.responseSpectrumCases.selectedCase === action.id) {
                        cadSystem.responseSpectrumCases.selectedCase = items[0]?.id || null;
                    }
                    cadSystem.showMessage?.(`Caso "${removed.name}" eliminado.`, "success");
                }
                break;
            }

            case "restore":
                restoreDefaultResponseSpectrumCases(cadSystem);
                break;

            case "use":
                useCaseInSeismic(cadSystem, action.id);
                keepOpen = false;
                break;

            case "ok":
                if (action.id) cadSystem.responseSpectrumCases.selectedCase = action.id;
                keepOpen = false;
                break;

            default: // cancel
                keepOpen = false;
        }
    }
}

// Carga el caso seleccionado en NUESTRO flujo (seismicConfig): U1→X, U2→Y, con scale factor.
function useCaseInSeismic(cadSystem, caseId) {
    const c = cadSystem.responseSpectrumCases.items.find((x) => String(x.id) === String(caseId));
    if (!c || !cadSystem.seismicConfig) return;
    const functions = cadSystem.responseSpectrumFunctions.items;
    const fnOf = (id) => functions.find((f) => String(f.id) === String(id));
    const scaled = (fn, sf) => (fn?.points || []).map((p) => ({ T: p.T, Sa: p.Sa * (Number(sf) || 1) }));

    const u1 = fnOf(c.spectra?.U1?.functionId);
    const u2 = fnOf(c.spectra?.U2?.functionId);
    if (u1) cadSystem.seismicConfig.spectrumX = scaled(u1, c.spectra.U1.scaleFactor);
    if (u2) cadSystem.seismicConfig.spectrumY = scaled(u2, c.spectra.U2.scaleFactor);

    // Nuestro backend RSA soporta CQC/SRSS; ABS/GMC caen a CQC para el puente.
    cadSystem.seismicConfig.combination = ["CQC", "SRSS"].includes(c.modalCombination) ? c.modalCombination : "CQC";
    if (Number.isFinite(c.damping)) cadSystem.seismicConfig.dampingRatio = c.damping;
    cadSystem.responseSpectrumCases.selectedCase = c.id;

    cadSystem.showMessage?.(`Caso "${c.name}" cargado en el análisis sísmico (U1→X, U2→Y).`, "success");
}

/**
 * Modal 1: "Define Response Spectra" (lista de casos).
 * Resuelve {type:'add'|'modify'|'delete'|'restore'|'use'|'ok'|'cancel', id}.
 */
function showCasesListModal(cadSystem) {
    const cases = cadSystem.responseSpectrumCases.items;
    const selectedId = cadSystem.responseSpectrumCases.selectedCase;

    const rowsHtml = cases.map((c) => {
        const sel = String(c.id) === String(selectedId) ? "checked" : "";
        const comb = c.modalCombination || "CQC";
        return `<label style="display:flex; align-items:center; gap:8px; padding:5px 8px; border-bottom:1px solid #334155; cursor:pointer">
            <input type="radio" name="rsc-sel" value="${c.id}" ${sel}>
            <span style="flex:1; color:#e2e8f0">${c.name}</span>
            <span style="color:#64748b; font-size:11px">${comb}${c.enabled === false ? " · off" : ""}</span>
          </label>`;
    }).join("") || `<div style="color:#64748b; padding:14px; text-align:center">Sin casos definidos</div>`;

    const btn = (id, label, color) =>
        `<button id="${id}" style="width:100%; margin-bottom:6px; padding:6px 10px; border:none; border-radius:4px; color:#fff; cursor:pointer; font-size:12px; background:${color}">${label}</button>`;

    return new Promise((resolve) => {
        let settled = false;
        const done = (v) => { if (!settled) { settled = true; resolve(v); Swal.close(); } };

        Swal.fire({
            title: "Define Response Spectra",
            width: 640,
            background: "#1a2035",
            color: "#e2e8f0",
            showCancelButton: true,
            confirmButtonText: "OK",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#1d4ed8",
            html: `
              <div style="display:grid; grid-template-columns: 1fr 230px; gap:14px; text-align:left; font-family:monospace">
                <div>
                  <div style="color:#7eb8f7; font-size:12px; font-weight:600; margin-bottom:6px">Spectra</div>
                  <div style="border:1px solid #475569; border-radius:6px; max-height:240px; overflow:auto">${rowsHtml}</div>
                </div>
                <div>
                  <div style="color:#94a3b8; font-size:11px; margin-bottom:6px">Click to:</div>
                  ${btn("rsc-add", "Add New Spectrum...", "#2d5a8e")}
                  ${btn("rsc-modify", "Modify/Show Spectrum...", "#0f766e")}
                  ${btn("rsc-delete", "Delete Spectrum", "#7f1d1d")}
                  ${btn("rsc-restore", "Restaurar defaults", "#374151")}
                  <div style="border-top:1px solid #334155; margin:10px 0"></div>
                  ${btn("rsc-use", "Usar en análisis sísmico ▶", "#7c3aed")}
                </div>
              </div>`,
            didOpen: () => {
                const getSel = () => document.querySelector('input[name="rsc-sel"]:checked')?.value || null;
                document.getElementById("rsc-add")?.addEventListener("click", () => done({ type: "add" }));
                document.getElementById("rsc-modify")?.addEventListener("click", () => done({ type: "modify", id: getSel() }));
                document.getElementById("rsc-delete")?.addEventListener("click", () => done({ type: "delete", id: getSel() }));
                document.getElementById("rsc-restore")?.addEventListener("click", () => done({ type: "restore" }));
                document.getElementById("rsc-use")?.addEventListener("click", () => {
                    const id = getSel();
                    if (!id) { cadSystem.showMessage?.("Selecciona un caso primero.", "warning"); return; }
                    done({ type: "use", id });
                });
            },
            preConfirm: () => ({ type: "ok", id: document.querySelector('input[name="rsc-sel"]:checked')?.value || null }),
        }).then((r) => {
            if (settled) return;
            settled = true;
            if (r.isConfirmed) resolve(r.value || { type: "ok" });
            else resolve({ type: "cancel" });
        });
    });
}

/**
 * Modal 2: "Response Spectrum Case Data" (estilo ETABS).
 */
async function openResponseSpectrumCaseDataDialog(cadSystem, existing) {
    const functions = cadSystem.responseSpectrumFunctions.items;
    const isNew = !existing;
    const legacyBase = isNew ? clonePlain(DEFAULT_MODAL_SPECTRAL_CASES[0] || {}) : {};

    const caseId = existing?.id || (() => {
        const items = cadSystem.responseSpectrumCases.items;
        let n = items.length + 1, id = `SPEC${n}`;
        while (items.some((x) => String(x.id) === id)) { n++; id = `SPEC${n}`; }
        return id;
    })();

    const c = {
        ...legacyBase,
        id: caseId,
        name: existing?.name || caseId,
        enabled: existing?.enabled !== false,
        damping: existing?.damping ?? 0.05,
        modalCombination: existing?.modalCombination || "CQC",
        f1: existing?.f1 ?? 0,
        f2: existing?.f2 ?? 0,
        directionalCombination: existing?.directionalCombination || "SRSS",
        orthogonalSF: existing?.orthogonalSF ?? 1.0,
        excitationAngle: existing?.excitationAngle ?? 0,
        eccRatio: existing?.eccRatio ?? 0.05,
        spectra: {
            U1: { functionId: existing?.spectra?.U1?.functionId ?? (functions[0]?.id || ""), scaleFactor: existing?.spectra?.U1?.scaleFactor ?? 1 },
            U2: { functionId: existing?.spectra?.U2?.functionId ?? (functions[0]?.id || ""), scaleFactor: existing?.spectra?.U2?.scaleFactor ?? 1 },
            UZ: { functionId: existing?.spectra?.UZ?.functionId ?? "", scaleFactor: existing?.spectra?.UZ?.scaleFactor ?? 1 },
        },
    };

    const fnOptions = (selId) =>
        `<option value="">None</option>` +
        functions.map((f) => `<option value="${f.id}" ${String(f.id) === String(selId) ? "selected" : ""}>${f.name}</option>`).join("");

    const radio = (name, value, current, label) =>
        `<label style="margin-right:14px; color:#cbd5e1"><input type="radio" name="${name}" value="${value}" ${value === current ? "checked" : ""}> ${label}</label>`;

    const dirRow = (key) => `
      <tr>
        <td style="padding:4px 6px; color:#cbd5e1">${key}</td>
        <td style="padding:4px 6px"><select id="rscd-fn-${key}" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px">${fnOptions(c.spectra[key].functionId)}</select></td>
        <td style="padding:4px 6px"><input id="rscd-sf-${key}" type="number" step="0.0001" value="${c.spectra[key].scaleFactor}" style="width:90px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px; text-align:right"></td>
      </tr>`;

    const result = await Swal.fire({
        title: "Response Spectrum Case Data",
        width: 640,
        background: "#1a2035",
        color: "#e2e8f0",
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#1d4ed8",
        html: `
          <div style="text-align:left; font-family:monospace; font-size:12px">
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px">
              <label style="color:#cbd5e1; font-weight:600">Spectrum Case Name</label>
              <input id="rscd-name" value="${c.name}" style="flex:1; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
            </div>

            <fieldset style="border:1px solid #475569; border-radius:6px; padding:8px 10px; margin-bottom:8px">
              <legend style="color:#7eb8f7; font-size:11px; padding:0 6px">Structural and Function Damping</legend>
              <label style="color:#cbd5e1">Damping <input id="rscd-damp" type="number" step="0.01" min="0" max="1" value="${c.damping}" style="width:80px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px; margin-left:4px"></label>
            </fieldset>

            <fieldset style="border:1px solid #475569; border-radius:6px; padding:8px 10px; margin-bottom:8px">
              <legend style="color:#7eb8f7; font-size:11px; padding:0 6px">Modal Combination</legend>
              <div style="margin-bottom:6px">
                ${radio("rscd-modal", "CQC", c.modalCombination, "CQC")}
                ${radio("rscd-modal", "SRSS", c.modalCombination, "SRSS")}
                ${radio("rscd-modal", "ABS", c.modalCombination, "ABS")}
                ${radio("rscd-modal", "GMC", c.modalCombination, "GMC")}
              </div>
              <label style="color:#94a3b8">f1 <input id="rscd-f1" type="number" step="0.01" value="${c.f1}" style="width:70px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px; margin:0 10px 0 4px"></label>
              <label style="color:#94a3b8">f2 <input id="rscd-f2" type="number" step="0.01" value="${c.f2}" style="width:70px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px; margin-left:4px"></label>
            </fieldset>

            <fieldset style="border:1px solid #475569; border-radius:6px; padding:8px 10px; margin-bottom:8px">
              <legend style="color:#7eb8f7; font-size:11px; padding:0 6px">Directional Combination</legend>
              ${radio("rscd-dir", "SRSS", c.directionalCombination, "SRSS")}
              ${radio("rscd-dir", "ABS", c.directionalCombination, "ABS")}
              ${radio("rscd-dir", "CQC3", c.directionalCombination, "Modified SRSS")}
              <label style="color:#94a3b8; margin-left:8px">Orthogonal SF <input id="rscd-osf" type="number" step="0.01" value="${c.orthogonalSF}" style="width:70px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px; margin-left:4px"></label>
            </fieldset>

            <fieldset style="border:1px solid #475569; border-radius:6px; padding:8px 10px; margin-bottom:8px">
              <legend style="color:#7eb8f7; font-size:11px; padding:0 6px">Input Response Spectra</legend>
              <table style="width:100%; border-collapse:collapse">
                <thead><tr style="color:#94a3b8">
                  <th style="text-align:left; padding:2px 6px">Direction</th>
                  <th style="text-align:left; padding:2px 6px">Function</th>
                  <th style="text-align:left; padding:2px 6px">Scale Factor</th>
                </tr></thead>
                <tbody>${dirRow("U1")}${dirRow("U2")}${dirRow("UZ")}</tbody>
              </table>
              <label style="color:#94a3b8; display:block; margin-top:6px">Excitation angle <input id="rscd-angle" type="number" step="1" value="${c.excitationAngle}" style="width:70px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px; margin-left:4px"></label>
            </fieldset>

            <fieldset style="border:1px solid #475569; border-radius:6px; padding:8px 10px">
              <legend style="color:#7eb8f7; font-size:11px; padding:0 6px">Eccentricity</legend>
              <label style="color:#cbd5e1">Ecc. Ratio (All Diaph.) <input id="rscd-ecc" type="number" step="0.01" value="${c.eccRatio}" style="width:80px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px; margin-left:4px"></label>
            </fieldset>
          </div>`,
        preConfirm: () => {
            const name = document.getElementById("rscd-name")?.value?.trim();
            if (!name) { Swal.showValidationMessage("El nombre del caso es obligatorio."); return false; }
            const num = (id, d) => { const v = parseFloat(document.getElementById(id)?.value); return Number.isFinite(v) ? v : d; };
            const fnVal = (k) => document.getElementById(`rscd-fn-${k}`)?.value || "";
            const sfVal = (k) => num(`rscd-sf-${k}`, 1);
            if (!fnVal("U1") && !fnVal("U2") && !fnVal("UZ")) {
                Swal.showValidationMessage("Asigna al menos una función a U1, U2 o UZ.");
                return false;
            }
            return {
                ...c,
                name,
                damping: num("rscd-damp", 0.05),
                modalCombination: document.querySelector('input[name="rscd-modal"]:checked')?.value || "CQC",
                f1: num("rscd-f1", 0),
                f2: num("rscd-f2", 0),
                directionalCombination: document.querySelector('input[name="rscd-dir"]:checked')?.value || "SRSS",
                orthogonalSF: num("rscd-osf", 1),
                excitationAngle: num("rscd-angle", 0),
                eccRatio: num("rscd-ecc", 0.05),
                spectra: {
                    U1: { functionId: fnVal("U1"), scaleFactor: sfVal("U1") },
                    U2: { functionId: fnVal("U2"), scaleFactor: sfVal("U2") },
                    UZ: { functionId: fnVal("UZ"), scaleFactor: sfVal("UZ") },
                },
                // compatibilidad con el pipeline del colaborador (campos legacy)
                functionId: fnVal("U1") || c.functionId || null,
                direction: fnVal("U1") ? "X" : (fnVal("U2") ? "Y" : (c.direction || "X")),
                scaleFactor: sfVal("U1") || c.scaleFactor || 1,
            };
        },
    });

    if (!result.isConfirmed || !result.value) return;

    const items = cadSystem.responseSpectrumCases.items;
    const fn = result.value;
    const idx = items.findIndex((x) => String(x.id) === String(fn.id));
    if (idx !== -1) items[idx] = fn;
    else items.push(fn);
    cadSystem.responseSpectrumCases.selectedCase = fn.id;

    cadSystem.showMessage?.(`Caso "${fn.name}" ${isNew ? "creado" : "actualizado"}.`, "success");
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
// resources/js/cad/analysis/7_responseSpectrumDefinitions.js

import Swal from "sweetalert2";

import {
    DEFAULT_RESPONSE_SPECTRUM_POINTS,
    DEFAULT_MODAL_SPECTRAL_CASES
} from "./4_modalSpectralPayload.js";

// Matemática normativa compartida con la vista Espectro Sísmico (core puro,
// sin DOM ni ubigeo) — resources/js/espectro-sismico/core.js.
import { computeSpectrum } from "../../espectro-sismico/core.js";

// UBIGEO Perú (Departamento→Provincia→Distrito→{zone, zFactor}) para asignar
// la zona sísmica automáticamente, igual que la vista Espectro Sísmico.
import UBIGEO_DATA from "../../../data/ubigeo.js";

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
                if (action.addType === "generate") {
                    await openGenerateSpectrumDialog(cadSystem);
                } else if (action.addType === "default") {
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
                    <option value="generate">Generar Espectro (E.030)</option>
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
                    // Hover de coordenadas (T, Sa) sobre el gráfico de la función seleccionada.
                    if (fn?.points?.length) cadSystem._attachSpectrumHover?.(box);
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
 * Modal "Generar Espectro de Diseño" (E.030 y normas previas): versión compacta
 * de la vista Espectro Sísmico (resources/views/hcalculo/espectro-sismico.blade.php)
 * — mismos parámetros y misma matemática (espectro-sismico/core.js), pero sin
 * tabla de valores y con el gráfico chico del diálogo de funciones. Al aceptar
 * crea una Response Spectrum Function con los puntos (T, Sa en g).
 */
async function openGenerateSpectrumDialog(cadSystem) {
    const zonasPorVersion = {
        "1977": [[1, "Z = 0.40"], [2, "Z = 0.70"], [3, "Z = 1.00"]],
        "1997": [[1, "Z = 0.15"], [2, "Z = 0.30"], [3, "Z = 0.40"]],
        "2003": [[1, "Z = 0.15"], [2, "Z = 0.30"], [3, "Z = 0.40"]],
        "2016": [[1, "Z = 0.10"], [2, "Z = 0.25"], [3, "Z = 0.35"], [4, "Z = 0.45"]],
        "2018": [[1, "Z = 0.10"], [2, "Z = 0.25"], [3, "Z = 0.35"], [4, "Z = 0.45"]],
        "2026": [[1, "Z = 0.10"], [2, "Z = 0.25"], [3, "Z = 0.35"], [4, "Z = 0.45"]],
    };
    const suelosPorVersion = {
        "1977": ["S1", "S2", "S3"],
        "1997": ["S1", "S2", "S3", "S4"],
        "2003": ["S1", "S2", "S3", "S4"],
        "2016": ["S0", "S1", "S2", "S3"],
        "2018": ["S0", "S1", "S2", "S3"],
        "2026": ["S0", "S1", "S2", "S3", "S4", "S5"],
    };
    const sueloLabel = {
        S0: "Roca dura", S1: "Roca / suelo muy rígido", S2: "Suelos rígidos",
        S3: "Suelos intermedios a blandos", S4: "Suelos blandos", S5: "Excepcional",
    };

    const inp = 'style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px"';
    const lbl = 'style="color:#cbd5e1; display:block; margin-bottom:2px; font-size:11px"';

    let lastResult = null; // {points, meta} del último cálculo válido

    const result = await Swal.fire({
        title: "Generar Espectro de Diseño",
        width: 700,
        background: "#1a2035",
        color: "#e2e8f0",
        showCancelButton: true,
        confirmButtonText: "Agregar Función",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#1d4ed8",
        html: `
          <div style="text-align:left; font-family:monospace; font-size:12px">
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:6px">
              <div>
                <label ${lbl}>Departamento (opcional)</label>
                <select id="gsp-dep" ${inp}></select>
              </div>
              <div>
                <label ${lbl}>Provincia</label>
                <select id="gsp-prov" ${inp} disabled></select>
              </div>
              <div>
                <label ${lbl}>Distrito</label>
                <select id="gsp-dist" ${inp} disabled></select>
              </div>
            </div>
            <div id="gsp-ubigeo-tag" style="display:none; color:#f87171; font-size:11px; margin-bottom:8px"></div>

            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:8px">
              <div style="grid-column:span 2">
                <label ${lbl}>Norma</label>
                <select id="gsp-version" ${inp}>
                  <option value="2026">E.030 — 2026 (RM 183-2026)</option>
                  <option value="2018" selected>E.030 — 2018</option>
                  <option value="2016">E.030 — 2016</option>
                  <option value="2003">E.030 — 2003</option>
                  <option value="1997">E.030 — 1997</option>
                  <option value="1977">RNC — 1977</option>
                </select>
              </div>
              <div>
                <label ${lbl}>Zona</label>
                <select id="gsp-zona" ${inp}></select>
              </div>
              <div>
                <label ${lbl}>Suelo</label>
                <select id="gsp-suelo" ${inp}></select>
              </div>

              <div>
                <label ${lbl}>Uso U</label>
                <select id="gsp-uso" ${inp}>
                  <option value="1">1.0 — C Común</option>
                  <option value="1.3">1.3 — B Importante</option>
                  <option value="1.5">1.5 — A Esencial</option>
                </select>
              </div>
              <div>
                <label ${lbl}>R (básico)</label>
                <input id="gsp-r" type="number" step="0.5" min="1" value="8" ${inp}>
              </div>
              <div>
                <label ${lbl}>Ia</label>
                <input id="gsp-ia" type="number" step="0.05" min="0.5" max="1" value="1" ${inp}>
              </div>
              <div>
                <label ${lbl}>Ip</label>
                <input id="gsp-ip" type="number" step="0.05" min="0.5" max="1" value="1" ${inp}>
              </div>

              <div>
                <label ${lbl}>T máx (s)</label>
                <input id="gsp-tmax" type="number" step="0.5" min="1" value="10" ${inp}>
              </div>
              <div>
                <label ${lbl}>Paso (s)</label>
                <input id="gsp-paso" type="number" step="0.01" min="0.01" value="0.05" ${inp}>
              </div>
              <div id="gsp-ts-box" style="display:none">
                <label ${lbl}>Ts suelo (s)</label>
                <input id="gsp-ts" type="number" step="0.05" min="0" value="0" ${inp}>
              </div>
              <div style="grid-column:span 1">
                <label ${lbl}>Nombre</label>
                <input id="gsp-name" value="" ${inp}>
              </div>
            </div>

            <div id="gsp-summary" style="color:#94a3b8; font-size:11px; margin-bottom:6px; min-height:16px"></div>
            <div id="gsp-error" style="color:#f87171; font-size:11px; margin-bottom:6px; display:none"></div>
            <div id="gsp-graph" style="display:flex; justify-content:center"></div>
          </div>`,
        didOpen: () => {
            const $ = (id) => document.getElementById(id);

            let ubigeoSel = null; // {dep, prov, dist, zone}

            const fillZonaSuelo = () => {
                const v = $("gsp-version").value;
                const zonas = zonasPorVersion[v] || [];
                const suelos = suelosPorVersion[v] || [];
                $("gsp-zona").innerHTML = zonas
                    .map(([z, l]) => `<option value="${z}" ${z === zonas[zonas.length - 1][0] ? "selected" : ""}>Zona ${z} — ${l}</option>`)
                    .join("");
                $("gsp-suelo").innerHTML = suelos
                    .map((s) => `<option value="${s}" ${s === "S2" ? "selected" : ""}>${s} — ${sueloLabel[s] || s}</option>`)
                    .join("");
                $("gsp-ts-box").style.display = v === "2026" ? "block" : "none";
                applyUbigeoZone(); // re-aplicar la zona del distrito al cambiar de norma
            };

            // ── UBIGEO: Departamento → Provincia → Distrito → zona automática ──
            const opt = (v, l, sel = false) => `<option value="${v}" ${sel ? "selected" : ""}>${l}</option>`;
            const cap = (t = "") => t.charAt(0) + t.slice(1).toLowerCase();

            const applyUbigeoZone = () => {
                const tag = $("gsp-ubigeo-tag");
                if (!ubigeoSel) { if (tag) tag.style.display = "none"; return; }
                const v = $("gsp-version").value;
                // Normas viejas solo tienen 3 zonas: la zona 4 moderna mapea a 3.
                const eff = ["1977", "1997", "2003"].includes(v) && ubigeoSel.zone === 4 ? 3 : ubigeoSel.zone;
                if ([...$("gsp-zona").options].some((o) => Number(o.value) === eff)) {
                    $("gsp-zona").value = String(eff);
                }
                if (tag) {
                    tag.style.display = "block";
                    tag.innerHTML = `Zona ${ubigeoSel.zone} asignada — ${cap(ubigeoSel.dist)}, ${cap(ubigeoSel.prov)}, ${cap(ubigeoSel.dep)}`;
                }
            };

            const initUbigeo = () => {
                $("gsp-dep").innerHTML = opt("", "— Departamento —", true) +
                    UBIGEO_DATA.map((d, i) => opt(i, cap(d.name))).join("");
                $("gsp-prov").innerHTML = opt("", "— Provincia —", true);
                $("gsp-dist").innerHTML = opt("", "— Distrito —", true);

                $("gsp-dep").addEventListener("change", () => {
                    const di = Number($("gsp-dep").value);
                    ubigeoSel = null; applyUbigeoZone();
                    $("gsp-dist").innerHTML = opt("", "— Distrito —", true);
                    $("gsp-dist").disabled = true;
                    if (Number.isNaN(di) || $("gsp-dep").value === "") {
                        $("gsp-prov").innerHTML = opt("", "— Provincia —", true);
                        $("gsp-prov").disabled = true;
                        return;
                    }
                    $("gsp-prov").disabled = false;
                    $("gsp-prov").innerHTML = opt("", "— Provincia —", true) +
                        UBIGEO_DATA[di].provinces.map((p, i) => opt(i, cap(p.name))).join("");
                });

                $("gsp-prov").addEventListener("change", () => {
                    const di = Number($("gsp-dep").value), pi = Number($("gsp-prov").value);
                    ubigeoSel = null; applyUbigeoZone();
                    if (Number.isNaN(di) || Number.isNaN(pi) || $("gsp-prov").value === "") {
                        $("gsp-dist").innerHTML = opt("", "— Distrito —", true);
                        $("gsp-dist").disabled = true;
                        return;
                    }
                    $("gsp-dist").disabled = false;
                    $("gsp-dist").innerHTML = opt("", "— Distrito —", true) +
                        UBIGEO_DATA[di].provinces[pi].districts.map((d, i) => opt(i, cap(d.name))).join("");
                });

                $("gsp-dist").addEventListener("change", () => {
                    const di = Number($("gsp-dep").value), pi = Number($("gsp-prov").value), ki = Number($("gsp-dist").value);
                    if (Number.isNaN(di) || Number.isNaN(pi) || Number.isNaN(ki) || $("gsp-dist").value === "") {
                        ubigeoSel = null; applyUbigeoZone(); return;
                    }
                    const dep = UBIGEO_DATA[di], prov = dep.provinces[pi], dist = prov.districts[ki];
                    ubigeoSel = { dep: dep.name, prov: prov.name, dist: dist.name, zone: Number(dist.zone) };
                    applyUbigeoZone();
                    $("gsp-name").value = autoName();
                    recalc();
                });
            };

            const autoName = () =>
                `E030-${$("gsp-version").value} Z${$("gsp-zona").value}${$("gsp-suelo").value} R${$("gsp-r").value}`;

            const recalc = () => {
                const out = computeSpectrum({
                    version: $("gsp-version").value,
                    zona: Number($("gsp-zona").value),
                    suelo: $("gsp-suelo").value,
                    U: parseFloat($("gsp-uso").value) || 1,
                    Rbase: parseFloat($("gsp-r").value) || 0,
                    Ia: parseFloat($("gsp-ia").value) || 1,
                    Ip: parseFloat($("gsp-ip").value) || 1,
                    Ts: parseFloat($("gsp-ts")?.value) || 0,
                    Tmax: parseFloat($("gsp-tmax").value) || 0,
                    paso: parseFloat($("gsp-paso").value) || 0,
                });

                const err = $("gsp-error");
                const graph = $("gsp-graph");
                const summary = $("gsp-summary");

                if (out.error) {
                    lastResult = null;
                    err.textContent = out.error;
                    err.style.display = "block";
                    graph.innerHTML = "";
                    summary.textContent = "";
                    return;
                }

                // Trazabilidad: ubicación elegida (si la hay) viaja en la meta.
                out.meta.ubicacion = ubigeoSel
                    ? { dep: ubigeoSel.dep, prov: ubigeoSel.prov, dist: ubigeoSel.dist, zone: ubigeoSel.zone }
                    : null;
                lastResult = out;
                err.style.display = "none";
                const m = out.meta;
                summary.innerHTML =
                    `Z=${m.Z}  U=${m.U}  S=${m.S}  Tp=${m.Tp ?? "—"}  TL=${m.Tl ?? "—"}  ` +
                    `R=${m.R.toFixed(2)}  →  <b style="color:#4ade80">Sa máx = ${m.SaMax} g</b>` +
                    (m.sueloModificado ? `  <span style="color:#facc15">(suelo degradado a ${m.sueloEfectivo} por Ts)</span>` : "");
                graph.innerHTML = cadSystem._buildSpectrumSVG?.([{
                    name: $("gsp-name").value || autoName(),
                    color: "#4ade80",
                    points: out.points,
                }]) || "";
                cadSystem._attachSpectrumHover?.(graph);
            };

            initUbigeo();
            fillZonaSuelo();
            $("gsp-name").value = autoName();
            recalc();

            ["gsp-zona", "gsp-suelo", "gsp-uso", "gsp-r", "gsp-ia", "gsp-ip", "gsp-ts", "gsp-tmax", "gsp-paso"]
                .forEach((id) => $(id)?.addEventListener("change", () => { $("gsp-name").value = autoName(); recalc(); }));
            $("gsp-version").addEventListener("change", () => { fillZonaSuelo(); $("gsp-name").value = autoName(); recalc(); });
        },
        preConfirm: () => {
            if (!lastResult?.points?.length) {
                Swal.showValidationMessage("Corrige los parámetros: el espectro no se pudo calcular.");
                return false;
            }
            return {
                name: document.getElementById("gsp-name")?.value?.trim() || "",
                computed: lastResult,
            };
        },
    });

    if (!result.isConfirmed || !result.value?.computed) return;

    const { name, computed } = result.value;
    const items = cadSystem.responseSpectrumFunctions.items;
    const id = genFunctionId(cadSystem);
    let finalName = name || id;
    let n = 2;
    while (items.some((f) => String(f.name) === finalName)) finalName = `${name || id} (${n++})`;

    items.push({
        id,
        name: finalName,
        type: "response-spectrum",
        units: "Sa en g",
        damping: 0.05,
        valuesAre: "period",
        headerLines: 0,
        fileName: `(generado E.030 ${computed.meta.version})`,
        rawText: "",
        points: computed.points.map((p) => ({ T: p.T, Sa: p.Sa })),
        source: "generated",
        generatorParams: { ...computed.meta },
    });
    cadSystem.responseSpectrumFunctions.selectedFunction = id;
    cadSystem.showMessage?.(
        `Función "${finalName}" generada (${computed.points.length} puntos, Sa máx ${computed.meta.SaMax} g).`,
        "success",
    );
    cadSystem.saveUndoState?.("Generar espectro de diseño");
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
                    // Activa el hover de coordenadas (T, Sa) sobre el gráfico, igual que el espectro del análisis sísmico.
                    if (draft.points.length) cadSystem._attachSpectrumHover?.(box);
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
// Carga el caso seleccionado en NUESTRO flujo (seismicConfig)
// SDX / SDX ESCALADO / DER XX → X
// SDY / SDY ESCALADO / DER YY → Y
// Limpia scaleFactor heredados peligrosos: 9.81, 44.145, 2943, 9810, etc.
function useCaseInSeismic(cadSystem, caseId) {
    if (!cadSystem?.responseSpectrumCases?.items || !cadSystem?.seismicConfig) return;

    const cases = cadSystem.responseSpectrumCases.items;
    const functions = cadSystem.responseSpectrumFunctions?.items || [];
    const fnOf = (id) => functions.find((f) => String(f.id) === String(id));

    const inferCaseDirection = (responseCase) => {
        const name = String(responseCase?.name || "").toUpperCase();
        const direction = String(responseCase?.direction || "").toUpperCase();

        // Primero manda el nombre, porque algunos JSON viejos tienen SDY guardado como X
        if (name.includes("SDY") || name.includes("DER YY")) return "Y";
        if (name.includes("SDX") || name.includes("DER XX")) return "X";

        if (direction === "Y") return "Y";
        return "X";
    };

    const pickFunctionId = (responseCase, axis) => {
        const axisFunctionId = responseCase?.spectra?.[axis]?.functionId;
        const legacyFunctionId = responseCase?.functionId;

        if (axisFunctionId) return axisFunctionId;
        if (legacyFunctionId) return legacyFunctionId;

        const func2 = functions.find((f) => String(f.id).toUpperCase() === "FUNC2");
        if (func2) return func2.id;

        return functions[0]?.id || null;
    };

    const sanitizeStoredCaseForSeismic = (responseCase) => {
        if (!responseCase) return responseCase;

        const direction = inferCaseDirection(responseCase);
        responseCase.direction = direction;

        if (!responseCase.spectra) responseCase.spectra = {};
        if (!responseCase.spectra.U1) responseCase.spectra.U1 = {};
        if (!responseCase.spectra.U2) responseCase.spectra.U2 = {};

        const u1FunctionId = pickFunctionId(responseCase, "U1");
        const u2FunctionId = pickFunctionId(responseCase, "U2");

        if (direction === "X") {
            responseCase.spectra.U1.functionId = u1FunctionId;
            responseCase.spectra.U1.scaleFactor = 1;

            responseCase.spectra.U2.functionId = null;
            responseCase.spectra.U2.scaleFactor = 1;

            responseCase.scaleFactor = 1;
        }

        if (direction === "Y") {
            responseCase.spectra.U1.functionId = null;
            responseCase.spectra.U1.scaleFactor = 1;

            responseCase.spectra.U2.functionId = u2FunctionId;
            responseCase.spectra.U2.scaleFactor = 1;

            responseCase.scaleFactor = 1;
        }

        return responseCase;
    };

    // Limpia todos los casos conocidos, no solo el seleccionado
    cases.forEach(sanitizeStoredCaseForSeismic);

    const c = cases.find((x) => String(x.id) === String(caseId));
    if (!c) return;

    const normalizeScaleFactorForSeismic = (value) => {
        const sf = Number(value);

        if (!Number.isFinite(sf) || sf <= 0) return 1;

        const saInG = cadSystem.seismicConfig?.saInG !== false;

        if (saInG && sf > 5) {
            console.warn("⚠️ Scale Factor sospechoso para Sa en g. Se usará 1:", sf);
            return 1;
        }

        return sf;
    };

    const scaled = (fn, sf) => {
        const safeScale = normalizeScaleFactorForSeismic(sf);

        return (fn?.points || []).map((p) => ({
            T: Number(p.T),
            Sa: Number(p.Sa) * safeScale,
        }));
    };

    const u1 = fnOf(c.spectra?.U1?.functionId);
    const u2 = fnOf(c.spectra?.U2?.functionId);

    if (c.direction === "X") {
        cadSystem.seismicConfig.spectrumX = u1
            ? scaled(u1, c.spectra?.U1?.scaleFactor)
            : [];

        cadSystem.seismicConfig.spectrumY = [];
    }

    if (c.direction === "Y") {
        cadSystem.seismicConfig.spectrumX = [];

        cadSystem.seismicConfig.spectrumY = u2
            ? scaled(u2, c.spectra?.U2?.scaleFactor)
            : [];
    }

    cadSystem.seismicConfig.combination = ["CQC", "SRSS"].includes(c.modalCombination)
        ? c.modalCombination
        : "CQC";

    if (Number.isFinite(Number(c.damping))) {
        cadSystem.seismicConfig.dampingRatio = Number(c.damping);
    }

    cadSystem.responseSpectrumCases.selectedCase = c.id;

    cadSystem.showMessage?.(
        `Caso "${c.name}" cargado en el análisis sísmico (${c.direction}).`,
        "success"
    );
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
        const on = c.enabled !== false ? "checked" : "";
        return `<div style="display:flex; align-items:center; gap:8px; padding:5px 8px; border-bottom:1px solid #334155">
            <input type="checkbox" class="rsc-on" data-id="${c.id}" ${on} title="Correr este caso en el análisis" style="cursor:pointer">
            <input type="radio" name="rsc-sel" value="${c.id}" ${sel} style="cursor:pointer">
            <span class="rsc-name" data-id="${c.id}" style="flex:1; color:#e2e8f0; cursor:pointer">${c.name}</span>
            <span style="color:#64748b; font-size:11px">${comb}</span>
          </div>`;
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
                  <div style="color:#7eb8f7; font-size:12px; font-weight:600; margin-bottom:6px">Spectra <span style="color:#64748b; font-weight:400; font-size:10px">(☑ = se corre en el análisis)</span></div>
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

                // Checkbox por caso: define cuáles se corren en el análisis (flag enabled).
                document.querySelectorAll(".rsc-on").forEach((cb) => {
                    cb.addEventListener("change", () => {
                        const id = cb.getAttribute("data-id");
                        const item = cadSystem.responseSpectrumCases.items.find((x) => String(x.id) === String(id));
                        if (item) item.enabled = cb.checked;
                    });
                });
                // Click en el nombre selecciona el caso (para Modify / Delete / Usar).
                document.querySelectorAll(".rsc-name").forEach((sp) => {
                    sp.addEventListener("click", () => {
                        const radio = document.querySelector(`input[name="rsc-sel"][value="${sp.getAttribute("data-id")}"]`);
                        if (radio) radio.checked = true;
                    });
                });

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
            U1: { functionId: existing?.spectra?.U1?.functionId ?? (functions[0]?.id || ""), scaleFactor: existing?.spectra?.U1?.scaleFactor ?? 9.81 },
            U2: { functionId: existing?.spectra?.U2?.functionId ?? (functions[0]?.id || ""), scaleFactor: existing?.spectra?.U2?.scaleFactor ?? 2.943 },
            UZ: { functionId: existing?.spectra?.UZ?.functionId ?? "", scaleFactor: existing?.spectra?.UZ?.scaleFactor ?? 6.540 },
        },
    };

    const fnOptions = (selId) =>
        `<option value="">None</option>` +
        functions.map((f) => `<option value="${f.id}" ${String(f.id) === String(selId) ? "selected" : ""}>${f.name}</option>`).join("");

    const radio = (name, value, current, label) =>
        `<label style="margin-right:14px; color:#cbd5e1"><input type="radio" name="${name}" value="${value}" ${value === current ? "checked" : ""}> ${label}</label>`;

    // Valores de escala predefinidos (g, 0.3g, 0.667g del sistema de ETABS).
    const SF_PRESETS = [
        { v: "9.81", label: "9.81 (1.0g)" },
        { v: "2.943", label: "2.943 (0.3g)" },
        { v: "6.54", label: "6.54 (0.667g)" },
    ];
    const sfPresetOptions =
        `<option value="">—</option>` +
        SF_PRESETS.map((p) => `<option value="${p.v}">${p.label}</option>`).join("");

    // Evalúa el Scale Factor: acepta un número o una expresión aritmética con
    // + - * / y paréntesis (estilo ETABS, p.ej. "9.81/3" o "9.81*0.3").
    // Solo permite caracteres seguros; devuelve fallback si la expresión es inválida.
    const evalScaleExpr = (raw, fallback) => {
        const s = String(raw ?? "").trim();
        if (s === "") return fallback;
        if (!/^[0-9+\-*/().\s]+$/.test(s)) {
            const p = parseFloat(s);
            return Number.isFinite(p) ? p : fallback;
        }
        try {
            const v = Function(`"use strict"; return (${s});`)();
            return Number.isFinite(v) ? v : fallback;
        } catch (_e) {
            return fallback;
        }
    };
    const roundSF = (v) => Math.round(v * 1000) / 1000; // hasta 3 decimales

    const dirRow = (key) => `
      <tr>
        <td style="padding:4px 6px; color:#cbd5e1">${key}</td>
        <td style="padding:4px 6px"><select id="rscd-fn-${key}" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px">${fnOptions(c.spectra[key].functionId)}</select></td>
        <td style="padding:4px 6px">
          <div style="display:flex; gap:4px; align-items:center">
            <input id="rscd-sf-${key}" type="text" value="${c.spectra[key].scaleFactor}" title="Acepta operaciones: + - * /  (ej: 9.81/3)" style="width:84px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px; text-align:right">
            <select id="rscd-sfsel-${key}" title="Valores predefinidos" style="width:58px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px">${sfPresetOptions}</select>
          </div>
        </td>
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
        didOpen: () => {
            ["U1", "U2", "UZ"].forEach((k) => {
                const inp = document.getElementById(`rscd-sf-${k}`);
                const sel = document.getElementById(`rscd-sfsel-${k}`);
                // Seleccionar un valor predefinido lo coloca en el input y resetea el select.
                sel?.addEventListener("change", () => {
                    if (sel.value) {
                        inp.value = sel.value;
                        sel.value = "";
                        inp.focus();
                    }
                });
                // Al salir del input, evalúa la expresión y muestra el resultado redondeado.
                inp?.addEventListener("blur", () => {
                    const v = evalScaleExpr(inp.value, null);
                    if (v !== null) inp.value = String(roundSF(v));
                });
            });
        },
        preConfirm: () => {
            const name = document.getElementById("rscd-name")?.value?.trim();
            if (!name) { Swal.showValidationMessage("El nombre del caso es obligatorio."); return false; }
            const num = (id, d) => { const v = parseFloat(document.getElementById(id)?.value); return Number.isFinite(v) ? v : d; };
            const fnVal = (k) => document.getElementById(`rscd-fn-${k}`)?.value || "";
            const sfVal = (k) => roundSF(evalScaleExpr(document.getElementById(`rscd-sf-${k}`)?.value, 1));
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
                // Mapeo al pipeline single-direction del colaborador (1 dirección + 1 factor).
                // El backend NO combina U1+U2, así que se envía la dirección PRIMARIA =
                // la del MAYOR factor de escala (el 100%), no siempre U1.
                // (Bug anterior: tomaba U1 fijo → un caso SDY con U1=0.3/U2=1.0 salía a 0.3 y en X.)
                // El combo completo queda guardado en `spectra` por si el motor lo soporta luego.
                ...(() => {
                    const opts = [
                        { dir: "X", fn: fnVal("U1"), sf: sfVal("U1") },
                        { dir: "Y", fn: fnVal("U2"), sf: sfVal("U2") },
                    ].filter((o) => o.fn); // solo direcciones con función asignada
                    const p = opts.length
                        ? opts.reduce((a, b) => (Math.abs(b.sf) > Math.abs(a.sf) ? b : a))
                        : { dir: c.direction || "X", fn: c.functionId || null, sf: c.scaleFactor || 1 };
                    return { functionId: p.fn, direction: p.dir, scaleFactor: p.sf };
                })(),
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
import { generateMockFrameForceResults } from "../engine/mockFrameForceResults.js";

import {
    addDefaultCombosAndEnvelope,
    getAvailableFrameForceCases,
} from "../engine/frameForceCombinations.js";

import {
    showFrameForceTable,
    hideFrameForceTable,
} from "./frameForceTable.js";

const COMPONENTS = [
    { id: "P", label: "Axial Force P" },
    { id: "V2", label: "Shear Force V2" },
    { id: "V3", label: "Shear Force V3" },
    { id: "T", label: "Torsion T" },
    { id: "M2", label: "Moment M2" },
    { id: "M3", label: "Moment M3" },
];

function getPanelId() {
    return "jhack-frame-force-display-panel";
}

function getBackdropId() {
    return "jhack-frame-force-display-backdrop";
}

function removeExistingPanel() {
    const panel = document.getElementById(getPanelId());

    if (panel?.__jhOnEscape) {
        document.removeEventListener("keydown", panel.__jhOnEscape);
    }

    panel?.remove();
    document.getElementById(getBackdropId())?.remove();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function ensureFrameForceResults(CADSystem) {
    if (!CADSystem) return false;

    if (!CADSystem.frameForceResults?.frameForces?.length) {
        const baseResults = generateMockFrameForceResults(
            CADSystem.shapes || [],
            ["CM", "CVE", "SDX", "SDY"]
        );

        CADSystem.frameForceResults = addDefaultCombosAndEnvelope(baseResults);
        return true;
    }

    const source = CADSystem.frameForceResults?.source || "mock";

    if (
        source === "mock" &&
        (
            !CADSystem.frameForceResults?.combinations?.length ||
            !CADSystem.frameForceResults?.envelopes?.length
        )
    ) {
        CADSystem.frameForceResults = addDefaultCombosAndEnvelope(
            CADSystem.frameForceResults
        );
    }

    return true;
}

function getCurrentDisplay(CADSystem) {
    return {
        enabled: true,
        caseId: "CM",
        comboId: null,
        component: "M3",
        source: "mock",

        showValues: true,
        showMaxMin: true,
        filled: true,
        autoScale: true,
        scaleFactor: 1,

        selectedOnly: false,
        showLocalAxes: false,
        showTable: false,

        showLegend: true,
        showZeroLine: true,
        showStationLines: true,
        showTorsionSymbols: true,

        valueLabelMode: "max-min",
        diagramHeightPx: 42,
        decimals: 2,

        ...(CADSystem.frameDiagramDisplay || {}),
    };
}

function getSelectorValue(display) {
    if (display.comboId) {
        return `combo:${display.comboId}`;
    }

    return `case:${display.caseId || "CM"}`;
}

function parseSelectorValue(value) {
    const [type, id] = String(value || "case:CM").split(":");

    if (type === "combo" || type === "envelope") {
        return {
            caseId: null,
            comboId: id,
        };
    }

    return {
        caseId: id || "CM",
        comboId: null,
    };
}

function buildCaseOptions(CADSystem, display) {
    const available = getAvailableFrameForceCases(CADSystem.frameForceResults);
    const currentValue = getSelectorValue(display);

    const groups = [
        {
            label: "Load Cases",
            items: available.cases.map((item) => ({
                value: `case:${item.id}`,
                label: `${item.id} — ${item.name || item.type || "Case"}`,
            })),
        },
        {
            label: "Load Combinations",
            items: available.combos.map((item) => ({
                value: `combo:${item.id}`,
                label: `${item.id} — ${item.name || item.type || "Combo"}`,
            })),
        },
        {
            label: "Envelope",
            items: available.envelopes.map((item) => ({
                value: `combo:${item.id}`,
                label: `${item.id} — ${item.name || "Envelope"}`,
            })),
        },
    ];

    return groups
        .filter((group) => group.items.length)
        .map((group) => {
            const options = group.items
                .map((item) => {
                    const selected = item.value === currentValue ? "selected" : "";

                    return `
            <option value="${escapeHtml(item.value)}" ${selected}>
              ${escapeHtml(item.label)}
            </option>
          `;
                })
                .join("");

            return `
        <optgroup label="${escapeHtml(group.label)}">
          ${options}
        </optgroup>
      `;
        })
        .join("");
}

function buildComponentOptions(display) {
    return COMPONENTS.map((item) => {
        const selected = item.id === display.component ? "selected" : "";

        return `
      <option value="${escapeHtml(item.id)}" ${selected}>
        ${escapeHtml(item.label)}
      </option>
    `;
    }).join("");
}

function checked(value) {
    return value ? "checked" : "";
}

function buildOptionCheckbox(id, label, isChecked) {
    return `
    <label class="flex cursor-pointer select-none items-center gap-2">
      <input
        id="${id}"
        type="checkbox"
        class="peer sr-only"
        ${checked(isChecked)}
      />

      <span
        class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm
               border border-slate-400 bg-white text-transparent
               transition-colors
               peer-checked:border-cyan-400
               peer-checked:bg-cyan-500
               peer-checked:text-white"
      >
        <svg
          viewBox="0 0 20 20"
          class="h-3 w-3"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
        >
          <path d="M4 10l4 4 8-8"></path>
        </svg>
      </span>

      <span>${label}</span>
    </label>
  `;
}

function buildPanelHtml(CADSystem) {
    const display = getCurrentDisplay(CADSystem);

    return `
    <div class="flex items-center justify-between border-b border-slate-700 px-4 py-3">
      <div>
        <div class="text-sm font-bold text-cyan-200">
          Show Frame Forces / Diagrams
        </div>
        <div class="text-xs text-slate-300">
          Visualización tipo ETABS — P, V2, V3, T, M2, M3
        </div>
      </div>

      <button
        id="jhack-frame-force-panel-close"
        class="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600"
      >
        Close
      </button>
    </div>

    <div class="grid gap-4 p-4 text-xs text-slate-100 md:grid-cols-2">
      <div class="space-y-3">
        <div>
          <label class="mb-1 block font-semibold text-cyan-200">
            Case / Combo / Envelope
          </label>
          <select
            id="jhack-frame-force-case-selector"
            class="w-full rounded border border-slate-600 bg-slate-900 px-2 py-2 text-slate-100 outline-none focus:border-cyan-500"
          >
            ${buildCaseOptions(CADSystem, display)}
          </select>
        </div>

        <div>
          <label class="mb-1 block font-semibold text-cyan-200">
            Component
          </label>
          <select
            id="jhack-frame-force-component-selector"
            class="w-full rounded border border-slate-600 bg-slate-900 px-2 py-2 text-slate-100 outline-none focus:border-cyan-500"
          >
            ${buildComponentOptions(display)}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block font-semibold text-cyan-200">
              Diagram Height
            </label>
            <input
              id="jhack-frame-force-height"
              type="number"
              min="8"
              max="160"
              step="1"
              value="${escapeHtml(display.diagramHeightPx)}"
              class="w-full rounded border border-slate-600 bg-slate-900 px-2 py-2 text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label class="mb-1 block font-semibold text-cyan-200">
              Manual Scale
            </label>
            <input
              id="jhack-frame-force-scale"
              type="number"
              min="0.05"
              max="10"
              step="0.05"
              value="${escapeHtml(display.scaleFactor)}"
              class="w-full rounded border border-slate-600 bg-slate-900 px-2 py-2 text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block font-semibold text-cyan-200">
            Value Labels
          </label>
          <select
            id="jhack-frame-force-label-mode"
            class="w-full rounded border border-slate-600 bg-slate-900 px-2 py-2 text-slate-100 outline-none focus:border-cyan-500"
          >
            <option value="max-min" ${display.valueLabelMode === "max-min" ? "selected" : ""}>Max / Min only</option>
            <option value="all" ${display.valueLabelMode === "all" ? "selected" : ""}>All stations</option>
            <option value="ends" ${display.valueLabelMode === "ends" ? "selected" : ""}>Ends only</option>
            <option value="none" ${display.valueLabelMode === "none" ? "selected" : ""}>None</option>
          </select>
        </div>
      </div>

      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3 rounded border border-slate-700 bg-slate-900/70 p-3">
        ${buildOptionCheckbox(
        "jhack-frame-force-show-values",
        "Show Values",
        display.showValues
    )}

        ${buildOptionCheckbox(
        "jhack-frame-force-show-max-min",
        "Show Max/Min",
        display.showMaxMin
    )}

        ${buildOptionCheckbox(
        "jhack-frame-force-filled",
        "Filled Diagram",
        display.filled
    )}

        ${buildOptionCheckbox(
        "jhack-frame-force-auto-scale",
        "Auto Scale",
        display.autoScale
    )}

        ${buildOptionCheckbox(
        "jhack-frame-force-selected-only",
        "Selected Only",
        display.selectedOnly
    )}

        ${buildOptionCheckbox(
        "jhack-frame-force-local-axes",
        "Local Axes",
        display.showLocalAxes
    )}

        ${buildOptionCheckbox(
        "jhack-frame-force-zero-line",
        "Zero Line",
        display.showZeroLine
    )}

        ${buildOptionCheckbox(
        "jhack-frame-force-station-lines",
        "Station Lines",
        display.showStationLines
    )}

        ${buildOptionCheckbox(
        "jhack-frame-force-torsion-symbols",
        "Torsion Symbols",
        display.showTorsionSymbols
    )}
        </div>

        <div class="rounded border border-slate-700 bg-slate-900/70 p-3 text-slate-300">
          <div class="mb-1 font-semibold text-cyan-200">Notas</div>
          <div>P = axial, V2/V3 = cortantes, T = torsión, M2/M3 = momentos.</div>
          <div>Envelope usa máximo absoluto por estación.</div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap justify-end gap-2 border-t border-slate-700 px-4 py-3">
      <button
        id="jhack-frame-force-apply"
        class="rounded bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500"
      >
        Apply
      </button>

      <button
        id="jhack-frame-force-table"
        class="rounded bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
      >
        Table
      </button>

      <button
        id="jhack-frame-force-clear"
        class="rounded bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
      >
        Clear Diagram
      </button>
    </div>
  `;
}

function readPanelValues(CADSystem) {
    const selectorValue = document.getElementById("jhack-frame-force-case-selector")?.value;
    const component = document.getElementById("jhack-frame-force-component-selector")?.value || "M3";

    const parsed = parseSelectorValue(selectorValue);

    return {
        enabled: true,
        caseId: parsed.caseId,
        comboId: parsed.comboId,
        component,
        source: CADSystem.frameForceResults?.source || "mock",

        showValues: document.getElementById("jhack-frame-force-show-values")?.checked ?? true,
        showMaxMin: document.getElementById("jhack-frame-force-show-max-min")?.checked ?? true,
        filled: document.getElementById("jhack-frame-force-filled")?.checked ?? true,
        autoScale: document.getElementById("jhack-frame-force-auto-scale")?.checked ?? true,

        selectedOnly: document.getElementById("jhack-frame-force-selected-only")?.checked ?? false,
        showLocalAxes: document.getElementById("jhack-frame-force-local-axes")?.checked ?? false,
        showTable: false,

        showLegend: true,
        showZeroLine: document.getElementById("jhack-frame-force-zero-line")?.checked ?? true,
        showStationLines: document.getElementById("jhack-frame-force-station-lines")?.checked ?? true,
        showTorsionSymbols: document.getElementById("jhack-frame-force-torsion-symbols")?.checked ?? true,

        valueLabelMode:
            document.getElementById("jhack-frame-force-label-mode")?.value || "max-min",

        diagramHeightPx:
            Number(document.getElementById("jhack-frame-force-height")?.value || 42),

        scaleFactor:
            Number(document.getElementById("jhack-frame-force-scale")?.value || 1),

        decimals: 2,
    };
}

function clampNumber(value, min, max, fallback) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, number));
}

function getSelectedFrameCount(CADSystem) {
    const selectedIds = new Set();

    [
        ...(CADSystem.selectedBeams || []),
        ...(CADSystem.selectedObjects || []),
        ...(CADSystem.selectedBeamsState?.selectedObjects || []),
        ...(CADSystem.currentState?.selectedObjects || []),
    ].forEach((item) => {
        if (item?.id !== undefined && item?.node1 && item?.node2) {
            selectedIds.add(String(item.id));
        }
    });

    return selectedIds.size;
}

function normalizeFrameDiagramDisplay(display, CADSystem) {
    const normalized = {
        ...display,

        enabled: true,

        diagramHeightPx: clampNumber(
            display.diagramHeightPx,
            8,
            160,
            42
        ),

        scaleFactor: clampNumber(
            display.scaleFactor,
            0.05,
            10,
            1
        ),

        decimals: clampNumber(
            display.decimals,
            0,
            6,
            2
        ),
    };

    if (normalized.valueLabelMode === "none") {
        normalized.showValues = false;
    }

    if (normalized.showValues === false) {
        normalized.showMaxMin = false;
    }

    if (normalized.component !== "T") {
        normalized.showTorsionSymbols = false;
    }

    if (normalized.selectedOnly && getSelectedFrameCount(CADSystem) === 0) {
        CADSystem.showMessage?.(
            "Selected Only está activo, pero no hay barras seleccionadas."
        );

        console.warn(
            "Selected Only está activo, pero no hay frames seleccionados."
        );
    }

    return normalized;
}

function refreshFrameForceViews(CADSystem, reason = "frame force display update") {
    if (!CADSystem) return false;

    CADSystem.redraw?.();

    if (CADSystem.__jhFrameForceSyncTimer) {
        clearTimeout(CADSystem.__jhFrameForceSyncTimer);
    }

    CADSystem.__jhFrameForceSyncTimer = setTimeout(() => {
        try {
            CADSystem.sync3D?.();
        } catch (error) {
            console.warn("No se pudo sincronizar la vista 3D desde Frame Forces:", error);
        }
    }, 80);

    console.log(`✅ Vista 2D/3D sincronizada: ${reason}`);

    return true;
}

function applyFrameForceDisplay(CADSystem) {
    const rawDisplay = readPanelValues(CADSystem);
    const display = normalizeFrameDiagramDisplay(rawDisplay, CADSystem);

    CADSystem.frameDiagramDisplay = display;

    CADSystem.sectionPropertyDisplay = {
        ...(CADSystem.sectionPropertyDisplay || {}),
        enabled: false,
    };

    CADSystem.options.showMaterials = false;
    CADSystem.options.showFAxiales = false;
    CADSystem.options.showFAxialesValues = false;

    refreshFrameForceViews(
        CADSystem,
        `Apply ${display.comboId || display.caseId} / ${display.component}`
    );

    return display;
}

function openTableFromPanel(CADSystem) {
    const display = applyFrameForceDisplay(CADSystem);

    CADSystem.frameDiagramDisplay = {
        ...(CADSystem.frameDiagramDisplay || {}),
        showTable: true,
    };

    return showFrameForceTable(CADSystem, {
        caseId: display.caseId,
        comboId: display.comboId,
        selectedOnly: display.selectedOnly,
    });
}

function clearFrameForceDisplay(CADSystem) {
    CADSystem.frameDiagramDisplay = {
        ...(CADSystem.frameDiagramDisplay || {}),
        enabled: false,
        showTable: false,
        showValues: false,
        showMaxMin: false,
        showLocalAxes: false,
    };

    hideFrameForceTable();

    refreshFrameForceViews(CADSystem, "Clear Diagram");

    CADSystem.showMessage?.("Diagramas de fuerzas internas limpiados.");

    return true;
}

export function showFrameForceDisplayPanel(CADSystem) {
    if (!CADSystem) {
        console.warn("No existe CADSystem.");
        return false;
    }

    ensureFrameForceResults(CADSystem);

    removeExistingPanel();

    const backdrop = document.createElement("div");
    backdrop.id = getBackdropId();
    backdrop.className = "fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[1px]";

    const panel = document.createElement("div");
    panel.id = getPanelId();
    panel.className =
        "fixed inset-0 z-[9999] m-auto h-fit max-h-[92vh] w-[94vw] max-w-[820px] overflow-auto rounded-lg border border-cyan-700 bg-slate-950 shadow-2xl";

    panel.innerHTML = buildPanelHtml(CADSystem);

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    backdrop.addEventListener("click", () => {
        hideFrameForceDisplayPanel();
    });

    const onEscape = (event) => {
        if (event.key === "Escape") {
            hideFrameForceDisplayPanel();
            document.removeEventListener("keydown", onEscape);
        }
    };

    document.addEventListener("keydown", onEscape);

    panel.__jhOnEscape = onEscape;

    document.getElementById("jhack-frame-force-panel-close")?.addEventListener("click", () => {
        hideFrameForceDisplayPanel();
    });

    document.getElementById("jhack-frame-force-apply")?.addEventListener("click", () => {
        applyFrameForceDisplay(CADSystem);
    });

    document.getElementById("jhack-frame-force-table")?.addEventListener("click", () => {
        openTableFromPanel(CADSystem);
    });

    document.getElementById("jhack-frame-force-clear")?.addEventListener("click", () => {
        clearFrameForceDisplay(CADSystem);
    });

    return true;
}

export function hideFrameForceDisplayPanel() {
    removeExistingPanel();
    return true;
}
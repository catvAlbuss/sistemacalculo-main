const COMPONENTS = ["P", "V2", "V3", "T", "M2", "M3"];

function getDisplay(CADSystem) {
    return {
        caseId: "CM",
        comboId: null,
        selectedOnly: false,
        decimals: 3,
        ...(CADSystem.frameDiagramDisplay || {}),
    };
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatNumber(value, decimals = 3) {
    const n = Number(value);

    if (!Number.isFinite(n)) return "0";

    if (Math.abs(n) >= 1000) return n.toExponential(3);

    return n.toFixed(decimals);
}

function getUnitLabel(results, component) {
    const forceComponents = ["P", "V2", "V3"];
    const momentComponents = ["T", "M2", "M3"];

    if (forceComponents.includes(component)) {
        return results?.units?.force || "";
    }

    if (momentComponents.includes(component)) {
        return results?.units?.moment || "";
    }

    return "";
}

function isSelectedFrameId(frameId, CADSystem) {
    const selectedIds = new Set();

    if (Array.isArray(CADSystem.selectedBeams)) {
        CADSystem.selectedBeams.forEach((item) => selectedIds.add(String(item?.id)));
    }

    if (Array.isArray(CADSystem.selectedObjects)) {
        CADSystem.selectedObjects.forEach((item) => selectedIds.add(String(item?.id)));
    }

    if (Array.isArray(CADSystem.selectedBeamsState?.selectedObjects)) {
        CADSystem.selectedBeamsState.selectedObjects.forEach((item) => {
            selectedIds.add(String(item?.id));
        });
    }

    if (Array.isArray(CADSystem.currentState?.selectedObjects)) {
        CADSystem.currentState.selectedObjects.forEach((item) => {
            selectedIds.add(String(item?.id));
        });
    }

    return selectedIds.has(String(frameId));
}

function getFilteredRecords(CADSystem, options = {}) {
    const results = CADSystem.frameForceResults;
    const display = getDisplay(CADSystem);

    if (!results?.frameForces?.length) return [];

    const caseId = options.caseId ?? display.caseId;
    const comboId = options.comboId ?? display.comboId;
    const selectedOnly = options.selectedOnly ?? display.selectedOnly;

    return results.frameForces.filter((record) => {
        if (comboId) {
            if (String(record.comboId) !== String(comboId)) return false;
        } else {
            if (String(record.caseId) !== String(caseId)) return false;
        }

        if (selectedOnly && !isSelectedFrameId(record.frameId, CADSystem)) {
            return false;
        }

        return true;
    });
}

function buildRows(CADSystem, options = {}) {
    const display = getDisplay(CADSystem);
    const decimals = options.decimals ?? display.decimals ?? 3;
    const records = getFilteredRecords(CADSystem, options);

    const rows = [];

    records.forEach((record) => {
        const stations = Array.isArray(record.stations) ? record.stations : [];

        stations.forEach((station) => {
            rows.push({
                frameId: record.frameId,
                caseId: record.comboId || record.caseId,
                station: Number(station.station ?? 0),
                relativeStation: Number(station.relativeStation ?? 0),
                P: formatNumber(station.P, decimals),
                V2: formatNumber(station.V2, decimals),
                V3: formatNumber(station.V3, decimals),
                T: formatNumber(station.T, decimals),
                M2: formatNumber(station.M2, decimals),
                M3: formatNumber(station.M3, decimals),
            });
        });
    });

    return rows;
}

function getPanelId() {
    return "jhack-frame-force-table-panel";
}

function removeExistingPanel() {
    const existing = document.getElementById(getPanelId());

    if (existing) {
        existing.remove();
    }

    const backdrop = document.getElementById("jhack-frame-force-table-backdrop");

    if (backdrop) {
        backdrop.remove();
    }
}

function buildCsv(rows) {
    const headers = [
        "Frame",
        "Case/Combo",
        "Station",
        "Relative Station",
        "P",
        "V2",
        "V3",
        "T",
        "M2",
        "M3",
    ];

    const lines = [headers.join(",")];

    rows.forEach((row) => {
        lines.push(
            [
                row.frameId,
                row.caseId,
                row.station,
                row.relativeStation,
                row.P,
                row.V2,
                row.V3,
                row.T,
                row.M2,
                row.M3,
            ]
                .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
                .join(",")
        );
    });

    return lines.join("\n");
}

function downloadCsv(rows) {
    const csv = buildCsv(rows);
    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "jhack-frame-force-table.csv";
    link.click();

    URL.revokeObjectURL(url);
}

function buildTableHtml(CADSystem, rows, options = {}) {
    const results = CADSystem.frameForceResults;
    const display = getDisplay(CADSystem);

    const caseId = options.comboId || options.caseId || display.comboId || display.caseId || "CM";
    const source = results?.source || display.source || "unknown";

    const units = COMPONENTS.reduce((acc, component) => {
        acc[component] = getUnitLabel(results, component);
        return acc;
    }, {});

    const headerCells = [
        "Frame",
        "Case",
        "Station",
        "Rel.",
        `P ${units.P ? `(${units.P})` : ""}`,
        `V2 ${units.V2 ? `(${units.V2})` : ""}`,
        `V3 ${units.V3 ? `(${units.V3})` : ""}`,
        `T ${units.T ? `(${units.T})` : ""}`,
        `M2 ${units.M2 ? `(${units.M2})` : ""}`,
        `M3 ${units.M3 ? `(${units.M3})` : ""}`,
    ];

    const bodyHtml = rows.length
        ? rows
            .map((row) => {
                return `
            <tr class="hover:bg-slate-700/70">
              <td class="px-2 py-1 border border-slate-700">${escapeHtml(row.frameId)}</td>
              <td class="px-2 py-1 border border-slate-700">${escapeHtml(row.caseId)}</td>
              <td class="px-2 py-1 border border-slate-700 text-right">${escapeHtml(row.station.toFixed(3))}</td>
              <td class="px-2 py-1 border border-slate-700 text-right">${escapeHtml(row.relativeStation.toFixed(3))}</td>
              <td class="px-2 py-1 border border-slate-700 text-right">${escapeHtml(row.P)}</td>
              <td class="px-2 py-1 border border-slate-700 text-right">${escapeHtml(row.V2)}</td>
              <td class="px-2 py-1 border border-slate-700 text-right">${escapeHtml(row.V3)}</td>
              <td class="px-2 py-1 border border-slate-700 text-right">${escapeHtml(row.T)}</td>
              <td class="px-2 py-1 border border-slate-700 text-right">${escapeHtml(row.M2)}</td>
              <td class="px-2 py-1 border border-slate-700 text-right">${escapeHtml(row.M3)}</td>
            </tr>
          `;
            })
            .join("")
        : `
      <tr>
        <td colspan="10" class="px-3 py-6 text-center text-slate-300">
          No hay resultados para mostrar.
        </td>
      </tr>
    `;

    return `
    <div class="flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-3">
      <div>
        <div class="text-sm font-bold text-cyan-200">
          Frame Force Table
        </div>
        <div class="text-xs text-slate-300">
          Case/Combo: <b>${escapeHtml(caseId)}</b> |
          Source: <b>${escapeHtml(source)}</b> |
          Rows: <b>${rows.length}</b>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          id="jhack-frame-force-table-export"
          class="rounded bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500"
        >
          Export CSV
        </button>

        <button
          id="jhack-frame-force-table-close"
          class="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600"
        >
          Close
        </button>
      </div>
    </div>

    <div class="overflow-auto p-3" style="max-height: calc(86vh - 76px);">
      <table class="w-full border-collapse text-xs text-slate-100">
        <thead class="sticky top-0 bg-slate-900 text-cyan-200">
          <tr>
            ${headerCells
            .map((cell) => {
                return `<th class="border border-slate-700 px-2 py-2 text-left">${escapeHtml(cell)}</th>`;
            })
            .join("")}
          </tr>
        </thead>

        <tbody>
          ${bodyHtml}
        </tbody>
      </table>
    </div>
  `;
}

export function showFrameForceTable(CADSystem, options = {}) {
    if (!CADSystem) {
        console.warn("No existe CADSystem para mostrar Frame Force Table.");
        return false;
    }

    if (!CADSystem.frameForceResults?.frameForces?.length) {
        console.warn("No hay frameForceResults cargados.");
        return false;
    }

    removeExistingPanel();

    const rows = buildRows(CADSystem, options);

    const panel = document.createElement("div");

    panel.id = getPanelId();

    const backdrop = document.createElement("div");
    backdrop.id = "jhack-frame-force-table-backdrop";
    backdrop.className = "fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[1px]";
    document.body.appendChild(backdrop);

    backdrop.addEventListener("click", () => {
        hideFrameForceTable();
    });

    panel.className =
        "fixed z-[9999] overflow-hidden rounded-lg border border-cyan-700 bg-slate-950 shadow-2xl";

    panel.style.left = "50%";
    panel.style.top = "50%";
    panel.style.transform = "translate(-50%, -50%)";
    panel.style.width = "min(1150px, 94vw)";
    panel.style.maxHeight = "86vh";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";

    panel.innerHTML = buildTableHtml(CADSystem, rows, options);

    document.body.appendChild(panel);

    const closeButton = document.getElementById("jhack-frame-force-table-close");
    const exportButton = document.getElementById("jhack-frame-force-table-export");

    closeButton?.addEventListener("click", () => {
        hideFrameForceTable();
    });

    exportButton?.addEventListener("click", () => {
        downloadCsv(rows);
    });

    return true;
}

export function hideFrameForceTable() {
    removeExistingPanel();
    return true;
}

export function getFrameForceTableRows(CADSystem, options = {}) {
    return buildRows(CADSystem, options);
}
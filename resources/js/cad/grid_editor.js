function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function uid(prefix = "gen") {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export class GridEditor {
    constructor(cad) {
        this.cad = cad;
        this.draftGrid = null;

        this.modal = document.getElementById("grid-editor-modal");
        this.xBody = document.getElementById("x-grid-body");
        this.yBody = document.getElementById("y-grid-body");
        this.generalBody = document.getElementById("general-grid-body");

        this.modeOrdinatesInput = document.getElementById("grid-mode-ordinates");
        this.modeSpacingInput = document.getElementById("grid-mode-spacing");

        this.displayMode = "ordinates";
        this.xRows = [];
        this.yRows = [];

        this.btnCancel = document.getElementById("btn-grid-editor-cancel");
        this.btnApply = document.getElementById("btn-grid-editor-apply");
        this.btnAddX = document.getElementById("btn-add-x-grid");
        this.btnAddY = document.getElementById("btn-add-y-grid");
        this.btnAddGeneral = document.getElementById("btn-add-general-grid");

        this.bindStaticEvents();
    }

    syncDisplayRowsFromDraft() {
        if (!this.draftGrid) return;

        const xGrids = this.draftGrid.xGrids || [];
        const yGrids = this.draftGrid.yGrids || [];

        if (this.displayMode === "ordinates") {
            this.xRows = xGrids.map((g) => ({
                id: g.id,
                ordinate: Number(g.ordinate ?? 0),
                visible: g.visible !== false,
                bubbleLoc: g.bubbleLoc ?? "End",
            }));

            this.yRows = yGrids.map((g) => ({
                id: g.id,
                ordinate: Number(g.ordinate ?? 0),
                visible: g.visible !== false,
                bubbleLoc: g.bubbleLoc ?? "Start",
            }));
        } else {
            this.xRows = this.cad.buildSpacingRowsFromOrdinates(xGrids).map((g) => ({
                id: g.id,
                spacing: Number(g.spacing ?? 0),
                visible: g.visible !== false,
                bubbleLoc: g.bubbleLoc ?? "End",
            }));

            this.yRows = this.cad.buildSpacingRowsFromOrdinates(yGrids).map((g) => ({
                id: g.id,
                spacing: Number(g.spacing ?? 0),
                visible: g.visible !== false,
                bubbleLoc: g.bubbleLoc ?? "Start",
            }));
        }
    }

    rebuildDraftGridFromDisplayRows() {
        if (!this.draftGrid) return;

        const toOrdinateRows = (rows, defaultBubbleLoc) => {
            let acc = 0;

            return rows.map((r, i) => {
                if (this.displayMode === "spacing") {
                    acc += Number(r.spacing ?? 0);
                } else {
                    acc = Number(r.ordinate ?? 0);
                }

                return {
                    id: String(r.id ?? i + 1),
                    ordinate: acc,
                    visible: r.visible !== false,
                    bubbleLoc: r.bubbleLoc ?? defaultBubbleLoc,
                };
            });
        };

        this.draftGrid.xGrids = toOrdinateRows(this.xRows, "End");
        this.draftGrid.yGrids = toOrdinateRows(this.yRows, "Start");
    }

    setDisplayMode(mode) {
        if (mode !== "ordinates" && mode !== "spacing") return;

        this.displayMode = mode;

        if (this.modeOrdinatesInput) {
            this.modeOrdinatesInput.checked = mode === "ordinates";
        }

        if (this.modeSpacingInput) {
            this.modeSpacingInput.checked = mode === "spacing";
        }

        this.syncDisplayRowsFromDraft();
        this.renderX();
        this.renderY();
    }

    getXValueFieldName() {
        return this.displayMode === "ordinates" ? "ordinate" : "spacing";
    }

    getYValueFieldName() {
        return this.displayMode === "ordinates" ? "ordinate" : "spacing";
    }

    bindStaticEvents() {
        this.btnAddX?.addEventListener("click", () => {
            if (this.displayMode === "ordinates") {
                this.xRows.push({
                    id: `X${this.xRows.length + 1}`,
                    ordinate: 0,
                    visible: true,
                    bubbleLoc: "End"
                });
            } else {
                this.xRows.push({
                    id: `X${this.xRows.length + 1}`,
                    spacing: 0,
                    visible: true,
                    bubbleLoc: "End"
                });
            }
            this.renderX();
        });

        this.btnAddY?.addEventListener("click", () => {
            if (this.displayMode === "ordinates") {
                this.yRows.push({
                    id: `Y${this.yRows.length + 1}`,
                    ordinate: 0,
                    visible: true,
                    bubbleLoc: "Start"
                });
            } else {
                this.yRows.push({
                    id: `Y${this.yRows.length + 1}`,
                    spacing: 0,
                    visible: true,
                    bubbleLoc: "Start"
                });
            }
            this.renderY();
        });

        this.btnAddGeneral?.addEventListener("click", () => {
            this.draftGrid.generalGrids.push({
                id: `G${this.draftGrid.generalGrids.length + 1}`,
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
                visible: true,
                bubbleLoc: "End",
                source: "custom",
            });
            this.renderGeneral();
        });

        this.btnCancel?.addEventListener("click", () => this.close());
        this.btnApply?.addEventListener("click", () => this.apply());

        this.modeOrdinatesInput?.addEventListener("change", () => {
            if (this.modeOrdinatesInput.checked) {
                this.setDisplayMode("ordinates");
            }
        });

        this.modeSpacingInput?.addEventListener("change", () => {
            if (this.modeSpacingInput.checked) {
                this.setDisplayMode("spacing");
            }
        });
    }

    inputClass() {
        return "w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-800 bg-white";
    }

    selectClass() {
        return "w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-800 bg-white";
    }

    checkboxClass() {
        return "h-4 w-4 accent-blue-600";
    }

    deleteButtonClass() {
        return "rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600";
    }

    open() {
        const currentGrid = this.cad.referenceGrid;
        if (!currentGrid) return;

        this.draftGrid = JSON.parse(JSON.stringify(currentGrid));

        this.displayMode = this.cad.gridDisplayMode || "ordinates";

        if (this.modeOrdinatesInput) {
            this.modeOrdinatesInput.checked = this.displayMode === "ordinates";
        }

        if (this.modeSpacingInput) {
            this.modeSpacingInput.checked = this.displayMode === "spacing";
        }

        this.syncDisplayRowsFromDraft();
        this.renderX();
        this.renderY();
        this.renderGeneral();

        if (this.modal) {
            this.modal.hidden = false;
            this.modal.style.display = "flex";
        }
    }

    close() {
        if (this.modal) {
            this.modal.hidden = true;
            this.modal.style.display = "none";
        }
        this.draftGrid = null;
    }

    apply() {
        if (!this.cad?.referenceGrid) return;

        const buildFromRows = (rows, defaultBubbleLoc) => {
            let acc = 0;

            return rows.map((r, i) => {
                const value =
                    this.displayMode === "spacing"
                        ? Number(r.spacing ?? 0)
                        : Number(r.ordinate ?? 0);

                acc = this.displayMode === "spacing" ? acc + value : value;

                return {
                    id: String(r.id ?? i + 1),
                    ordinate: acc,
                    visible: r.visible !== false,
                    bubbleLoc: r.bubbleLoc ?? defaultBubbleLoc,
                };
            });
        };

        const newXGrids = buildFromRows(this.xRows, "End");
        const newYGrids = buildFromRows(this.yRows, "Start");

        console.log("DISPLAY MODE:", this.displayMode);
        console.log("X ROWS:", JSON.parse(JSON.stringify(this.xRows)));
        console.log("NEW X GRIDS:", JSON.parse(JSON.stringify(newXGrids)));

        // copiar directamente al CAD real
        this.cad.referenceGrid.xGrids = JSON.parse(JSON.stringify(newXGrids));
        this.cad.referenceGrid.yGrids = JSON.parse(JSON.stringify(newYGrids));
        this.cad.referenceGrid.generalGrids = JSON.parse(
            JSON.stringify(this.draftGrid?.generalGrids || [])
        );

        this.cad.gridDisplayMode = this.displayMode;

        this.cad.rebuildReferenceGridCaches();
        this.cad.rebuildGeneralGrids();
        this.cad.rebuildViewSetFromReferenceGrid();
        this.cad.rebuildElevationListsFromReferenceGrid();

        this.cad.redraw?.();
        this.cad.sync3D?.();

        console.log(
            "REFERENCE GRID X FINAL:",
            JSON.parse(JSON.stringify(this.cad.referenceGrid.xGrids))
        );

        this.close();
    }

    refreshDraft() {
        if (!this.draftGrid) return;
        this.cad.rebuildGeneralGrids(this.draftGrid);
    }

    renderAll() {
        this.renderX();
        this.renderY();
        this.renderGeneral();
    }

    renderX() {
        if (!this.xBody) return;

        const inputClass = this.inputClass();
        const selectClass = this.selectClass();
        const checkboxClass = this.checkboxClass();
        const deleteButtonClass = this.deleteButtonClass();

        const fieldName = this.getXValueFieldName();
        const headerText = this.displayMode === "ordinates" ? "X Ordinate" : "X Spacing";

        const table = this.xBody.closest("table");
        if (table) {
            const ths = table.querySelectorAll("thead th");
            if (ths[1]) ths[1].textContent = `${headerText} (m)`;
        }

        this.xBody.innerHTML = this.xRows.map((row, index) => `
    <tr class="border-b">
      <td class="p-2">
        <input class="${inputClass}" data-kind="x" data-index="${index}" data-field="id" value="${row.id}">
      </td>
      <td class="p-2">
        <input class="${inputClass}" type="number" step="any" data-kind="x" data-index="${index}" data-field="${fieldName}" value="${row[fieldName] ?? 0}">
      </td>
      <td class="p-2 text-center">
        <input class="${checkboxClass}" type="checkbox" data-kind="x" data-index="${index}" data-field="visible" ${row.visible ? "checked" : ""}>
      </td>
      <td class="p-2">
        <select class="${selectClass}" data-kind="x" data-index="${index}" data-field="bubbleLoc">
          <option value="Start" ${row.bubbleLoc === "Start" ? "selected" : ""}>Start</option>
          <option value="End" ${row.bubbleLoc === "End" ? "selected" : ""}>End</option>
        </select>
      </td>
      <td class="p-2 text-center">
        <button class="${deleteButtonClass}" type="button" data-remove="x" data-index="${index}">Eliminar</button>
      </td>
    </tr>
  `).join("");

        this.bindDynamicEvents(this.xBody);
    }

    renderY() {
        if (!this.yBody) return;

        const inputClass = this.inputClass();
        const selectClass = this.selectClass();
        const checkboxClass = this.checkboxClass();
        const deleteButtonClass = this.deleteButtonClass();

        const fieldName = this.getYValueFieldName();
        const headerText = this.displayMode === "ordinates" ? "Y Ordinate" : "Y Spacing";

        const table = this.yBody.closest("table");
        if (table) {
            const ths = table.querySelectorAll("thead th");
            if (ths[1]) ths[1].textContent = `${headerText} (m)`;
        }

        this.yBody.innerHTML = this.yRows.map((row, index) => `
    <tr class="border-b">
      <td class="p-2">
        <input class="${inputClass}" data-kind="y" data-index="${index}" data-field="id" value="${row.id}">
      </td>
      <td class="p-2">
        <input class="${inputClass}" type="number" step="any" data-kind="y" data-index="${index}" data-field="${fieldName}" value="${row[fieldName] ?? 0}">
      </td>
      <td class="p-2 text-center">
        <input class="${checkboxClass}" type="checkbox" data-kind="y" data-index="${index}" data-field="visible" ${row.visible ? "checked" : ""}>
      </td>
      <td class="p-2">
        <select class="${selectClass}" data-kind="y" data-index="${index}" data-field="bubbleLoc">
          <option value="Start" ${row.bubbleLoc === "Start" ? "selected" : ""}>Start</option>
          <option value="End" ${row.bubbleLoc === "End" ? "selected" : ""}>End</option>
        </select>
      </td>
      <td class="p-2 text-center">
        <button class="${deleteButtonClass}" type="button" data-remove="y" data-index="${index}">Eliminar</button>
      </td>
    </tr>
  `).join("");

        this.bindDynamicEvents(this.yBody);
    }

    renderGeneral() {
        if (!this.generalBody || !this.draftGrid) return;

        const inputClass = this.inputClass();
        const selectClass = this.selectClass();
        const checkboxClass = this.checkboxClass();
        const deleteButtonClass = this.deleteButtonClass();

        this.generalBody.innerHTML = this.draftGrid.generalGrids.map((row, index) => {
            const isCustom = row.source === "custom";
            const disabled = isCustom ? "" : "disabled";
            const disabledClass = isCustom ? "" : "bg-gray-100 cursor-not-allowed";

            return `
      <tr class="border-b">
        <td class="p-2">
          <input class="${inputClass} ${disabledClass}" data-kind="general" data-index="${index}" data-field="id" value="${row.id}" ${disabled}>
        </td>
        <td class="p-2">
          <input class="${inputClass} ${disabledClass}" type="number" step="any" data-kind="general" data-index="${index}" data-field="x1" value="${row.x1}" ${disabled}>
        </td>
        <td class="p-2">
          <input class="${inputClass} ${disabledClass}" type="number" step="any" data-kind="general" data-index="${index}" data-field="y1" value="${row.y1}" ${disabled}>
        </td>
        <td class="p-2">
          <input class="${inputClass} ${disabledClass}" type="number" step="any" data-kind="general" data-index="${index}" data-field="x2" value="${row.x2}" ${disabled}>
        </td>
        <td class="p-2">
          <input class="${inputClass} ${disabledClass}" type="number" step="any" data-kind="general" data-index="${index}" data-field="y2" value="${row.y2}" ${disabled}>
        </td>
        <td class="p-2 text-center">
          <input class="${checkboxClass}" type="checkbox" data-kind="general" data-index="${index}" data-field="visible" ${row.visible ? "checked" : ""} ${disabled}>
        </td>
        <td class="p-2">
          <select class="${selectClass} ${disabledClass}" data-kind="general" data-index="${index}" data-field="bubbleLoc" ${disabled}>
            <option value="Start" ${row.bubbleLoc === "Start" ? "selected" : ""}>Start</option>
            <option value="End" ${row.bubbleLoc === "End" ? "selected" : ""}>End</option>
          </select>
        </td>
        <td class="p-2 text-center font-medium text-gray-700">${row.source}</td>
        <td class="p-2 text-center">
          ${isCustom ? `<button class="${deleteButtonClass}" type="button" data-remove="general" data-index="${index}">Eliminar</button>` : ""}
        </td>
      </tr>
    `;
        }).join("");

        this.bindDynamicEvents(this.generalBody);
    }

    bindDynamicEvents(container) {
        container.querySelectorAll("input, select").forEach((el) => {
            el.addEventListener("input", (event) => {
                const kind = event.target.dataset.kind;
                const index = Number(event.target.dataset.index);
                const field = event.target.dataset.field;

                if (kind === "x" || kind === "y") {
                    const rows = kind === "x" ? this.xRows : this.yRows;
                    if (!rows[index]) return;

                    if (field === "visible") {
                        rows[index][field] = event.target.checked;
                    } else if (field === "ordinate" || field === "spacing") {
                        rows[index][field] = Number(event.target.value);
                    } else {
                        rows[index][field] = event.target.value;
                    }
                }

                if (kind === "general") {
                    if (!this.draftGrid?.generalGrids?.[index]) return;

                    if (field === "visible") {
                        this.draftGrid.generalGrids[index][field] = event.target.checked;
                    } else if (["x1", "y1", "x2", "y2"].includes(field)) {
                        this.draftGrid.generalGrids[index][field] = Number(event.target.value);
                    } else {
                        this.draftGrid.generalGrids[index][field] = event.target.value;
                    }
                }
            });

            el.addEventListener("change", (event) => {
                const kind = event.target.dataset.kind;
                const index = Number(event.target.dataset.index);
                const field = event.target.dataset.field;

                if (kind === "x" || kind === "y") {
                    const rows = kind === "x" ? this.xRows : this.yRows;
                    if (!rows[index]) return;

                    if (field === "visible") {
                        rows[index][field] = event.target.checked;
                    } else if (field === "ordinate" || field === "spacing") {
                        rows[index][field] = Number(event.target.value);
                    } else {
                        rows[index][field] = event.target.value;
                    }
                }

                if (kind === "general") {
                    if (!this.draftGrid?.generalGrids?.[index]) return;

                    if (field === "visible") {
                        this.draftGrid.generalGrids[index][field] = event.target.checked;
                    } else if (["x1", "y1", "x2", "y2"].includes(field)) {
                        this.draftGrid.generalGrids[index][field] = Number(event.target.value);
                    } else {
                        this.draftGrid.generalGrids[index][field] = event.target.value;
                    }
                }
            });
        });

        container.querySelectorAll("[data-remove]").forEach((btn) => {
            btn.addEventListener("click", (event) => {
                const kind = event.target.dataset.remove;
                const index = Number(event.target.dataset.index);

                if (kind === "x") {
                    this.xRows.splice(index, 1);
                    this.renderX();
                } else if (kind === "y") {
                    this.yRows.splice(index, 1);
                    this.renderY();
                } else if (kind === "general") {
                    this.draftGrid.generalGrids.splice(index, 1);
                    this.renderGeneral();
                }
            });
        });
    }

    handleFieldChange(e) {
        if (!this.draftGrid) return;

        const el = e.target;
        const kind = el.dataset.kind;
        const index = Number(el.dataset.index);
        const field = el.dataset.field;

        let collection = null;
        if (kind === "x") collection = this.draftGrid.xGrids;
        if (kind === "y") collection = this.draftGrid.yGrids;
        if (kind === "general") collection = this.draftGrid.generalGrids;

        if (!collection || !collection[index]) return;

        let value;
        if (el.type === "checkbox") {
            value = el.checked;
        } else if (el.type === "number") {
            value = Number(el.value);
        } else {
            value = el.value;
        }

        collection[index][field] = value;

        if (kind === "x" || kind === "y") {
            this.refreshDraft();
            this.renderAll();
            return;
        }

        this.renderGeneral();
    }

    handleRemove(e) {
        if (!this.draftGrid) return;

        const kind = e.currentTarget.dataset.remove;
        const index = Number(e.currentTarget.dataset.index);

        if (kind === "x") {
            this.draftGrid.xGrids.splice(index, 1);
            this.refreshDraft();
            this.renderAll();
            return;
        }

        if (kind === "y") {
            this.draftGrid.yGrids.splice(index, 1);
            this.refreshDraft();
            this.renderAll();
            return;
        }

        if (kind === "general") {
            this.draftGrid.generalGrids.splice(index, 1);
            this.renderGeneral();
        }
    }

    getNextXId() {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const used = new Set((this.draftGrid?.xGrids || []).map(g => String(g.id)));

        for (const ch of letters) {
            if (!used.has(ch)) return ch;
        }

        return `X${(this.draftGrid?.xGrids?.length || 0) + 1}`;
    }

    getNextYId() {
        const used = new Set((this.draftGrid?.yGrids || []).map(g => String(g.id)));
        let i = 1;
        while (used.has(String(i))) i++;
        return String(i);
    }
}
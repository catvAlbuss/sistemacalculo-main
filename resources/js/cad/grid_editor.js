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

        this.btnCancel = document.getElementById("btn-grid-editor-cancel");
        this.btnApply = document.getElementById("btn-grid-editor-apply");
        this.btnAddX = document.getElementById("btn-add-x-grid");
        this.btnAddY = document.getElementById("btn-add-y-grid");
        this.btnAddGeneral = document.getElementById("btn-add-general-grid");

        this.bindStaticEvents();
    }

    bindStaticEvents() {
        this.btnCancel?.addEventListener("click", () => this.close());
        this.btnApply?.addEventListener("click", () => this.apply());

        this.btnAddX?.addEventListener("click", () => {
            if (!this.draftGrid) return;
            this.draftGrid.xGrids.push({
                id: this.getNextXId(),
                ordinate: 0,
                visible: true,
                bubbleLoc: "End",
            });
            this.refreshDraft();
            this.renderAll();
        });

        this.btnAddY?.addEventListener("click", () => {
            if (!this.draftGrid) return;
            this.draftGrid.yGrids.push({
                id: this.getNextYId(),
                ordinate: 0,
                visible: true,
                bubbleLoc: "Start",
            });
            this.refreshDraft();
            this.renderAll();
        });

        this.btnAddGeneral?.addEventListener("click", () => {
            if (!this.draftGrid) return;
            this.draftGrid.generalGrids.push({
                id: uid("custom"),
                x1: 0,
                y1: 0,
                x2: 5,
                y2: 5,
                visible: true,
                bubbleLoc: "End",
                source: "custom",
            });
            this.renderGeneral();
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
        const ref = this.cad.getReferenceGrid?.() || this.cad.referenceGrid;
        if (!ref) return;

        this.draftGrid = deepClone(ref);
        this.refreshDraft();
        this.renderAll();

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
        if (!this.draftGrid) return;

        this.cad.referenceGrid = deepClone(this.draftGrid);
        this.cad.rebuildGeneralGrids();
        this.cad.rebuildViewSetFromReferenceGrid();
        this.cad.rebuildElevationListsFromReferenceGrid();

        if (typeof this.cad.redraw === "function") {
            this.cad.redraw();
        }

        if (typeof this.cad.sync3D === "function") {
            this.cad.sync3D();
        }

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
        if (!this.xBody || !this.draftGrid) return;

        const inputClass = this.inputClass();
        const selectClass = this.selectClass();
        const checkboxClass = this.checkboxClass();
        const deleteButtonClass = this.deleteButtonClass();

        this.xBody.innerHTML = this.draftGrid.xGrids.map((row, index) => `
    <tr class="border-b">
      <td class="p-2">
        <input class="${inputClass}" data-kind="x" data-index="${index}" data-field="id" value="${row.id}">
      </td>
      <td class="p-2">
        <input class="${inputClass}" type="number" step="any" data-kind="x" data-index="${index}" data-field="ordinate" value="${row.ordinate}">
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
        if (!this.yBody || !this.draftGrid) return;

        const inputClass = this.inputClass();
        const selectClass = this.selectClass();
        const checkboxClass = this.checkboxClass();
        const deleteButtonClass = this.deleteButtonClass();

        this.yBody.innerHTML = this.draftGrid.yGrids.map((row, index) => `
    <tr class="border-b">
      <td class="p-2">
        <input class="${inputClass}" data-kind="y" data-index="${index}" data-field="id" value="${row.id}">
      </td>
      <td class="p-2">
        <input class="${inputClass}" type="number" step="any" data-kind="y" data-index="${index}" data-field="ordinate" value="${row.ordinate}">
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
            el.addEventListener("change", (e) => this.handleFieldChange(e));
        });

        container.querySelectorAll("button[data-remove]").forEach((btn) => {
            btn.addEventListener("click", (e) => this.handleRemove(e));
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
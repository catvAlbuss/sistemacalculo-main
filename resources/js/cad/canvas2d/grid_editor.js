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

        // Campos "estilo ETABS" nuevos (Grid System Name / Origin / Story
        // Range / Reference Points-Planes). Ver ARCHITECTURE / plan: Origin
        // es funcional de verdad, Rotation y Story Range quedan marcados
        // como pendientes (no fingen funcionar).
        this.nameInput = document.getElementById("grid-system-name");
        this.originXInput = document.getElementById("grid-origin-x");
        this.originYInput = document.getElementById("grid-origin-y");
        this.storyRangeAllInput = document.getElementById("grid-story-range-all");
        this.storyRangeCustomInput = document.getElementById("grid-story-range-custom");
        this.topStorySelect = document.getElementById("grid-top-story");
        this.bottomStorySelect = document.getElementById("grid-bottom-story");
        this.previewSvg = document.getElementById("grid-preview-svg");
        this.btnReferencePoints = document.getElementById("btn-grid-reference-points");
        this.btnReferencePlanes = document.getElementById("btn-grid-reference-planes");

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
        this.renderPreview();
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
            this.renderPreview();
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
            this.renderPreview();
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
            this.renderPreview();
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

        // System Origin: solo X/Y desplazan de verdad (ver reference-grid.js).
        this.originXInput?.addEventListener("input", () => this.renderPreview());
        this.originYInput?.addEventListener("input", () => this.renderPreview());

        // Story Range: la selección se guarda, pero todavía NO restringe qué
        // pisos muestran la grilla (ver plan/ARCHITECTURE) — por eso solo
        // habilita/deshabilita los selects, sin más efecto.
        const syncStoryRangeInputsState = () => {
            const isCustom = !!this.storyRangeCustomInput?.checked;
            if (this.topStorySelect) this.topStorySelect.disabled = !isCustom;
            if (this.bottomStorySelect) this.bottomStorySelect.disabled = !isCustom;
        };
        this.storyRangeAllInput?.addEventListener("change", syncStoryRangeInputsState);
        this.storyRangeCustomInput?.addEventListener("change", syncStoryRangeInputsState);

        this.btnReferencePoints?.addEventListener("click", () => {
            this.cad.showMessage?.("Reference Points — próximamente.", "info");
        });
        this.btnReferencePlanes?.addEventListener("click", () => {
            this.cad.showMessage?.("Reference Planes — próximamente.", "info");
        });
    }

    inputClass() {
        return "w-full rounded border border-gray-600 bg-gray-700 !important px-2 py-1 text-sm text-white !important";
    }

    selectClass() {
        return "w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    }

    checkboxClass() {
        return "h-4 w-4 accent-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500";
    }

    deleteButtonClass() {
        return "rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500 transition-colors";
    }

    open() {
        const currentGrid = this.cad.referenceGrid;
        if (!currentGrid) return;

        this.draftGrid = JSON.parse(JSON.stringify(currentGrid));

        if (!Array.isArray(this.draftGrid.xGrids)) {
            this.draftGrid.xGrids = [];
        }

        if (!Array.isArray(this.draftGrid.yGrids)) {
            this.draftGrid.yGrids = [];
        }

        if (!Array.isArray(this.draftGrid.generalGrids)) {
            this.draftGrid.generalGrids = [];
        }

        this.displayMode = this.cad.gridDisplayMode || "ordinates";

        if (this.modeOrdinatesInput) {
            this.modeOrdinatesInput.checked = this.displayMode === "ordinates";
        }

        if (this.modeSpacingInput) {
            this.modeSpacingInput.checked = this.displayMode === "spacing";
        }

        // Campos "estilo ETABS": se leen del draftGrid ya normalizado por
        // rebuildReferenceGridCaches() (siempre trae name/originX/originY/
        // storyRangeMode, incluso en modelos guardados antes de que existieran).
        if (this.nameInput) this.nameInput.value = this.draftGrid.name ?? "G1";
        if (this.originXInput) this.originXInput.value = this.draftGrid.originX ?? 0;
        if (this.originYInput) this.originYInput.value = this.draftGrid.originY ?? 0;

        const isCustomRange = this.draftGrid.storyRangeMode === "custom";
        if (this.storyRangeAllInput) this.storyRangeAllInput.checked = !isCustomRange;
        if (this.storyRangeCustomInput) this.storyRangeCustomInput.checked = isCustomRange;

        const storyNames = (this.cad.stories || []).map((s) => s.name).filter(Boolean);
        const storyOptions = storyNames.map((name) => `<option value="${name}">${name}</option>`).join("");
        if (this.topStorySelect) {
            this.topStorySelect.innerHTML = storyOptions;
            this.topStorySelect.value = this.draftGrid.topStory ?? storyNames[0] ?? "";
            this.topStorySelect.disabled = !isCustomRange;
        }
        if (this.bottomStorySelect) {
            this.bottomStorySelect.innerHTML = storyOptions;
            this.bottomStorySelect.value = this.draftGrid.bottomStory ?? storyNames[storyNames.length - 1] ?? "";
            this.bottomStorySelect.disabled = !isCustomRange;
        }

        this.syncDisplayRowsFromDraft();
        this.renderX();
        this.renderY();
        this.renderGeneral();
        this.renderPreview();

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
                    ordinate: Number(acc || 0),
                    visible: r.visible !== false,
                    bubbleLoc: r.bubbleLoc ?? defaultBubbleLoc,
                };
            });
        };

        const newXGrids = buildFromRows(this.xRows, "End");
        const newYGrids = buildFromRows(this.yRows, "Start");

        if (newXGrids.length < 2 || newYGrids.length < 2) {
            this.cad.showMessage?.(
                "Debe existir al menos 2 grillas en X y 2 grillas en Y.",
                "warning"
            );
            return;
        }

        this.cad.saveUndoState?.("Edit Grid Data");

        this.cad.referenceGrid.xGrids = JSON.parse(JSON.stringify(newXGrids));
        this.cad.referenceGrid.yGrids = JSON.parse(JSON.stringify(newYGrids));
        this.cad.referenceGrid.generalGrids = JSON.parse(
            JSON.stringify(this.draftGrid?.generalGrids || [])
        );

        // Campos "estilo ETABS". Origin es lo único que afecta el dibujo real
        // (ver rebuildReferenceGridCaches/rebuildGeneralGrids); name y
        // story-range solo se guardan por ahora.
        this.cad.referenceGrid.name = this.nameInput?.value?.trim() || "G1";
        this.cad.referenceGrid.originX = Number(this.originXInput?.value) || 0;
        this.cad.referenceGrid.originY = Number(this.originYInput?.value) || 0;
        this.cad.referenceGrid.storyRangeMode = this.storyRangeCustomInput?.checked ? "custom" : "all";
        this.cad.referenceGrid.topStory = this.topStorySelect?.value || null;
        this.cad.referenceGrid.bottomStory = this.bottomStorySelect?.value || null;

        this.cad.gridDisplayMode = this.displayMode;

        this.cad.rebuildReferenceGridCaches?.();
        this.cad.rebuildGeneralGrids?.();
        this.cad.rebuildViewSetFromReferenceGrid?.();
        this.cad.rebuildElevationListsFromReferenceGrid?.();

        if (
            Array.isArray(this.cad.viewSet) &&
            this.cad.activeViewIndex >= this.cad.viewSet.length
        ) {
            this.cad.activeViewIndex = 0;
            this.cad.currentViewMode = "plan";
            this.cad.currentElevationX = "none";
            this.cad.currentElevationZ = "none";
        }

        this.cad.activeGridPoint = null;

        this.cad.markAnalysisResultsOutdated?.(
            "Se editó la grilla de referencia."
        );

        this.cad.redraw?.();
        this.cad.sync3D?.();

        this.cad.showMessage?.("Edit Grid Data aplicado correctamente.");

        console.log("✅ EDIT GRID DATA aplicado:", {
            displayMode: this.displayMode,
            xGrids: this.cad.referenceGrid.xGrids,
            yGrids: this.cad.referenceGrid.yGrids,
            generalGrids: this.cad.referenceGrid.generalGrids,
            viewSet: this.cad.viewSet,
        });

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
        const headerText = this.displayMode === "ordinates" ? "Posición X" : "Distancia X";

        const table = this.xBody.closest("table");
        if (table) {
            const ths = table.querySelectorAll("thead th");
            if (ths[1]) ths[1].textContent = `${headerText} (m)`;
        }

        this.xBody.innerHTML = this.xRows.map((row, index) => `
    <tr class="border-b border-gray-700">
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
          <option value="Start" ${row.bubbleLoc === "Start" ? "selected" : ""}>Inicio</option>
          <option value="End" ${row.bubbleLoc === "End" ? "selected" : ""}>Fin</option>
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
        const headerText = this.displayMode === "ordinates" ? "Posición Y" : "Distancia Y";

        const table = this.yBody.closest("table");
        if (table) {
            const ths = table.querySelectorAll("thead th");
            if (ths[1]) ths[1].textContent = `${headerText} (m)`;
        }

        this.yBody.innerHTML = this.yRows.map((row, index) => `
    <tr class="border-b border-gray-700">
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
          <option value="Start" ${row.bubbleLoc === "Start" ? "selected" : ""}>Inicio</option>
          <option value="End" ${row.bubbleLoc === "End" ? "selected" : ""}>Fin</option>
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
            const disabledClass = isCustom ? "" : "bg-gray-700 cursor-not-allowed opacity-60";

            return `
      <tr class="border-b border-gray-700">
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
            <option value="Start" ${row.bubbleLoc === "Start" ? "selected" : ""}>Inicio</option>
            <option value="End" ${row.bubbleLoc === "End" ? "selected" : ""}>Fin</option>
          </select>
        </td>
        <td class="p-2 text-center">
          ${isCustom ? `<button class="${deleteButtonClass}" type="button" data-remove="general" data-index="${index}">Eliminar</button>` : `<span class="text-[10px] text-gray-500">Desde grilla X/Y</span>`}
        </td>
      </tr>
    `;
        }).join("");

        this.bindDynamicEvents(this.generalBody);
    }

    // Vista previa en vivo (SVG) del sistema de grillas, mientras se edita —
    // mismo espíritu que el diagrama de ETABS en "Grid System Data". Lee
    // this.xRows/yRows (conviertiéndolos primero a ordenadas absolutas si el
    // modo activo es "spacing", vía rebuildDraftGridFromDisplayRows) + el
    // origen tecleado en vivo (aunque todavía no se haya aplicado) + las
    // líneas generales "custom" (diagonales). Y se dibuja invertida (mayor Y
    // = más arriba) para que se lea como una planta, no como pantalla.
    renderPreview() {
        if (!this.previewSvg || !this.draftGrid) return;

        this.rebuildDraftGridFromDisplayRows();

        const originX = Number(this.originXInput?.value) || 0;
        const originY = Number(this.originYInput?.value) || 0;
        const toSvgY = (y) => -y;

        const xLines = (this.draftGrid.xGrids || []).filter((g) => g.visible !== false);
        const yLines = (this.draftGrid.yGrids || []).filter((g) => g.visible !== false);
        const customLines = (this.draftGrid.generalGrids || []).filter(
            (g) => g.source === "custom" && g.visible !== false
        );

        if (!xLines.length && !yLines.length && !customLines.length) {
            this.previewSvg.removeAttribute("viewBox");
            this.previewSvg.innerHTML =
                '<text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-size="12">Sin ejes todavía</text>';
            return;
        }

        const xs = [0];
        const ys = [0];
        xLines.forEach((g) => xs.push(Number(g.ordinate) + originX));
        yLines.forEach((g) => ys.push(Number(g.ordinate) + originY));
        customLines.forEach((g) => {
            xs.push(Number(g.x1), Number(g.x2));
            ys.push(Number(g.y1), Number(g.y2));
        });

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs, minX + 1);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys, minY + 1);

        const padX = Math.max((maxX - minX) * 0.18, 1);
        const padY = Math.max((maxY - minY) * 0.18, 1);
        const scale = Math.max(maxX - minX, maxY - minY, 1);
        const strokeW = scale * 0.004;
        const bubbleR = scale * 0.022;
        const fontSize = scale * 0.024;

        const lo = { x: minX - padX, y: minY - padY };
        const hi = { x: maxX + padX, y: maxY + padY };

        const parts = [];

        xLines.forEach((g) => {
            const x = Number(g.ordinate) + originX;
            parts.push(
                `<line x1="${x}" y1="${toSvgY(lo.y)}" x2="${x}" y2="${toSvgY(hi.y)}" stroke="#3b82f6" stroke-width="${strokeW}" />`
            );
            const labelY = g.bubbleLoc === "Start" ? lo.y - padY * 0.35 : hi.y + padY * 0.35;
            parts.push(
                `<circle cx="${x}" cy="${toSvgY(labelY)}" r="${bubbleR}" fill="#111827" stroke="#3b82f6" stroke-width="${strokeW}" />`,
                `<text x="${x}" y="${toSvgY(labelY)}" text-anchor="middle" dominant-baseline="central" fill="#93c5fd" font-size="${fontSize}">${g.id}</text>`
            );
        });

        yLines.forEach((g) => {
            const y = Number(g.ordinate) + originY;
            parts.push(
                `<line x1="${lo.x}" y1="${toSvgY(y)}" x2="${hi.x}" y2="${toSvgY(y)}" stroke="#3b82f6" stroke-width="${strokeW}" />`
            );
            const labelX = g.bubbleLoc === "Start" ? lo.x - padX * 0.35 : hi.x + padX * 0.35;
            parts.push(
                `<circle cx="${labelX}" cy="${toSvgY(y)}" r="${bubbleR}" fill="#111827" stroke="#3b82f6" stroke-width="${strokeW}" />`,
                `<text x="${labelX}" y="${toSvgY(y)}" text-anchor="middle" dominant-baseline="central" fill="#93c5fd" font-size="${fontSize}">${g.id}</text>`
            );
        });

        customLines.forEach((g) => {
            parts.push(
                `<line x1="${g.x1}" y1="${toSvgY(g.y1)}" x2="${g.x2}" y2="${toSvgY(g.y2)}" stroke="#f59e0b" stroke-width="${strokeW}" stroke-dasharray="${scale * 0.012},${scale * 0.008}" />`
            );
        });

        // Marcador del origen del sistema (System Origin).
        parts.push(`<circle cx="${originX}" cy="${toSvgY(originY)}" r="${bubbleR * 0.6}" fill="#22c55e" />`);

        const vbX = lo.x - padX * 0.6;
        const vbY = toSvgY(hi.y) - padY * 0.6;
        const vbW = hi.x - lo.x + padX * 1.2;
        const vbH = hi.y - lo.y + padY * 1.2;

        this.previewSvg.setAttribute("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`);
        this.previewSvg.innerHTML = parts.join("");
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

                this.renderPreview();
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

                this.renderPreview();
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
                this.renderPreview();
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
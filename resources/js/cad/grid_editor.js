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

      // Mostrar opciones para nueva diagonal
      const direction = confirm("¿Dirección? (OK = X (rojo), Cancel = Y (verde))") ? "X" : "Y";
      const defaultColors = { X: "#ff0000", Y: "#00ff00" };

      this.draftGrid.generalGrids.push({
        id: uid(`D_${direction}`),
        x1: 0,
        y1: direction === "X" ? 5 : 0,
        x2: direction === "X" ? 5 : 10,
        y2: direction === "X" ? 0 : direction === "Y" ? 5 : 10,
        visible: true,
        bubbleLoc: "End",
        source: "diagonal",
        direction: direction,
        color: defaultColors[direction],
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

  colorInputClass() {
    return "w-12 h-8 rounded border border-gray-300 cursor-pointer";
  }

  //   open() {
  //     const ref = this.cad.getReferenceGrid?.() || this.cad.referenceGrid;
  //     if (!ref) return;

  //     this.draftGrid = deepClone(ref);
  //     this.refreshDraft();

  //     // CARGAR SOLO DIAGONALES (NO líneas de ejes X/Y)
  //     this.loadDiagonalsOnly();

  //     this.renderAll();

  //     if (this.modal) {
  //       this.modal.hidden = false;
  //       this.modal.style.display = "flex";
  //     }
  //   }

  open() {
    const ref = this.cad.getReferenceGrid?.() || this.cad.referenceGrid;
    if (!ref) return;

    this.draftGrid = deepClone(ref);

    // Cargar diagonales desde cadSystem.diagonalGrids
    const diagonals = this.cad.diagonalGrids;
    const diagonalLines = [];

    if (diagonals.x) {
      diagonals.x.forEach((d) => {
        diagonalLines.push({
          id: d.name,
          x1: d.startX,
          y1: d.startY,
          x2: d.endX,
          y2: d.endY,
          visible: d.visible !== false, // ← CARGAR visible
          bubbleLoc: "End",
          source: "diagonal",
          direction: "X",
          color: d.color || "#ff0000",
        });
      });
    }

    if (diagonals.y) {
      diagonals.y.forEach((d) => {
        diagonalLines.push({
          id: d.name,
          x1: d.startX,
          y1: d.startY,
          x2: d.endX,
          y2: d.endY,
          visible: d.visible !== false, // ← CARGAR visible
          bubbleLoc: "End",
          source: "diagonal",
          direction: "Y",
          color: d.color || "#00ff00",
        });
      });
    }

    const nonDiagonalLines = (this.draftGrid.generalGrids || []).filter((g) => g.source !== "diagonal");
    this.draftGrid.generalGrids = [...nonDiagonalLines, ...diagonalLines];

    this.refreshDraft();
    this.renderAll();

    if (this.modal) {
      this.modal.hidden = false;
      this.modal.style.display = "flex";
    }
  }

  // Cargar SOLO las diagonales (ignorar líneas x/y que ya tienen sus tablas)
  loadDiagonalsOnly() {
    if (!this.draftGrid) return;

    const diagonals = this.cad.diagonalGrids;
    if (!diagonals) return;

    // Convertir diagonales a líneas generales (source: "diagonal")
    const diagonalLines = [
      ...(diagonals.x || []).map((d) => ({
        id: d.name,
        x1: d.startX,
        y1: d.startY,
        x2: d.endX,
        y2: d.endY,
        visible: true,
        bubbleLoc: "End",
        source: "diagonal",
        direction: "X",
        color: d.color || "#ff0000",
      })),
      ...(diagonals.y || []).map((d) => ({
        id: d.name,
        x1: d.startX,
        y1: d.startY,
        x2: d.endX,
        y2: d.endY,
        visible: true,
        bubbleLoc: "End",
        source: "diagonal",
        direction: "Y",
        color: d.color || "#00ff00",
      })),
    ];

    // SOLO GUARDAR DIAGONALES en generalGrids (no líneas de ejes)
    this.draftGrid.generalGrids = diagonalLines;
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

    // EXTRAER DIAGONALES de generalGrids
    const diagonalLines = (this.draftGrid.generalGrids || []).filter((g) => g.source === "diagonal");

    const diagonalX = [];
    const diagonalY = [];

    diagonalLines.forEach((line) => {
      const diag = {
        name: line.id,
        startX: line.x1,
        startY: line.y1,
        endX: line.x2,
        endY: line.y2,
        color: line.color || (line.direction === "X" ? "#ff0000" : "#00ff00"),
        visible: line.visible !== false, // ← AGREGAR visible
      };
      if (line.direction === "X") {
        diagonalX.push(diag);
      } else if (line.direction === "Y") {
        diagonalY.push(diag);
      } else {
        if (line.id.toUpperCase().startsWith("D") || line.direction === "X") {
          diagonalX.push(diag);
        } else {
          diagonalY.push(diag);
        }
      }
    });

    // Actualizar diagonalGrids en cadSystem
    this.cad.diagonalGrids = { x: diagonalX, y: diagonalY };

    // Guardar el resto del grid
    this.cad.referenceGrid = {
      ...deepClone(this.draftGrid),
      generalGrids: [],
    };
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

  //   refreshDraft() {
  //     if (!this.draftGrid) return;
  //     this.cad.rebuildGeneralGrids(this.draftGrid);
  //   }

  refreshDraft() {
    if (!this.draftGrid) return;

    // Guardar las diagonales existentes ANTES de rebuild
    const existingDiagonals = (this.draftGrid.generalGrids || []).filter((g) => g.source === "diagonal");

    // Reconstruir líneas de ejes X e Y
    this.cad.rebuildGeneralGrids(this.draftGrid);

    // Restaurar las diagonales
    const newGeneralGrids = (this.draftGrid.generalGrids || []).filter((g) => g.source !== "diagonal");
    this.draftGrid.generalGrids = [...newGeneralGrids, ...existingDiagonals];
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

    this.xBody.innerHTML = (this.draftGrid.xGrids || [])
      .map(
        (row, index) => `
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
    </table>
  `,
      )
      .join("");

    this.bindDynamicEvents(this.xBody);
  }

  renderY() {
    if (!this.yBody || !this.draftGrid) return;

    const inputClass = this.inputClass();
    const selectClass = this.selectClass();
    const checkboxClass = this.checkboxClass();
    const deleteButtonClass = this.deleteButtonClass();

    this.yBody.innerHTML = (this.draftGrid.yGrids || [])
      .map(
        (row, index) => `
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
  `,
      )
      .join("");

    this.bindDynamicEvents(this.yBody);
  }

  //   renderGeneral() {
  //     if (!this.generalBody || !this.draftGrid) return;

  //     const inputClass = this.inputClass();
  //     const selectClass = this.selectClass();
  //     const checkboxClass = this.checkboxClass();
  //     const deleteButtonClass = this.deleteButtonClass();
  //     const colorInputClass = this.colorInputClass();

  //     const diagonals = (this.draftGrid.generalGrids || []).filter((g) => g.source === "diagonal");

  //     if (diagonals.length === 0) {
  //       this.generalBody.innerHTML = `
  //                 <tr>
  //                     <td colspan="9" class="p-4 text-center text-gray-500">
  //                         No hay diagonales definidas. Haz clic en "Agregar línea general" para crear una.
  //                     </td>
  //                 </tr>
  //             `;
  //       return;
  //     }

  //     this.generalBody.innerHTML = diagonals
  //       .map((row, idx) => {
  //         const colorStyle = row.color
  //           ? `style="background-color: ${row.color}20; border-left: 4px solid ${row.color}"`
  //           : "";
  //         return `
  //       <tr class="border-b" ${colorStyle}>
  //         <td class="p-2">
  //           <input class="${inputClass}" data-kind="general" data-index="${idx}" data-field="id" value="${row.id}">
  //         </td>
  //         <td class="p-2">
  //           <input class="${inputClass}" type="number" step="any" data-kind="general" data-index="${idx}" data-field="x1" value="${row.x1}">
  //         </td>
  //         <td class="p-2">
  //           <input class="${inputClass}" type="number" step="any" data-kind="general" data-index="${idx}" data-field="y1" value="${row.y1}">
  //         </td>
  //         <td class="p-2">
  //           <input class="${inputClass}" type="number" step="any" data-kind="general" data-index="${idx}" data-field="x2" value="${row.x2}">
  //         </td>
  //         <td class="p-2">
  //           <input class="${inputClass}" type="number" step="any" data-kind="general" data-index="${idx}" data-field="y2" value="${row.y2}">
  //         </td>
  //         <td class="p-2 text-center">
  //           <input class="${checkboxClass}" type="checkbox" data-kind="general" data-index="${idx}" data-field="visible" ${row.visible !== false ? "checked" : ""}>
  //         </td>
  //         <td class="p-2">
  //           <select class="${selectClass}" data-kind="general" data-index="${idx}" data-field="bubbleLoc">
  //             <option value="Start" ${row.bubbleLoc === "Start" ? "selected" : ""}>Start</option>
  //             <option value="End" ${row.bubbleLoc === "End" ? "selected" : ""}>End</option>
  //           </select>
  //         </td>
  //         <td class="p-2">
  //           <select class="${selectClass}" data-kind="general" data-index="${idx}" data-field="direction">
  //             <option value="X" ${row.direction === "X" ? "selected" : ""}>X (Rojo)</option>
  //             <option value="Y" ${row.direction === "Y" ? "selected" : ""}>Y (Verde)</option>
  //           </select>
  //         </td>
  //         <td class="p-2">
  //           <input class="${colorInputClass}" type="color" data-kind="general" data-index="${idx}" data-field="color" value="${row.color || (row.direction === "X" ? "#ff0000" : "#00ff00")}">
  //         </td>
  //         <td class="p-2 text-center">
  //           <button class="${deleteButtonClass}" type="button" data-remove="general" data-index="${idx}">Eliminar</button>
  //         </td>
  //       </tr>
  //     `;
  //       })
  //       .join("");

  //     this.bindDynamicEvents(this.generalBody);
  //   }

  renderGeneral() {
    if (!this.generalBody || !this.draftGrid) return;

    const inputClass = this.inputClass();
    const selectClass = this.selectClass();
    const checkboxClass = this.checkboxClass();
    const deleteButtonClass = this.deleteButtonClass();
    const colorInputClass = this.colorInputClass();

    // Obtener SOLO las diagonales
    const diagonals = (this.draftGrid.generalGrids || []).filter((g) => g.source === "diagonal");

    if (diagonals.length === 0) {
      this.generalBody.innerHTML = `
            <tr>
                <td colspan="10" class="p-4 text-center text-gray-500">
                    No hay diagonales definidas. Haz clic en "Agregar línea general" para crear una.
                </td>
            </tr>
        `;
      return;
    }

    this.generalBody.innerHTML = diagonals
      .map((row, idx) => {
        const colorStyle = row.color
          ? `style="background-color: ${row.color}20; border-left: 4px solid ${row.color}"`
          : "";
        return `
            <tr class="border-b" ${colorStyle}>
                <td class="p-2">
                    <input class="${inputClass}" data-kind="general" data-index="${idx}" data-field="id" value="${row.id}">
                </td>
                <td class="p-2">
                    <input class="${inputClass}" type="number" step="any" data-kind="general" data-index="${idx}" data-field="x1" value="${row.x1}">
                </td>
                <td class="p-2">
                    <input class="${inputClass}" type="number" step="any" data-kind="general" data-index="${idx}" data-field="y1" value="${row.y1}">
                </td>
                <td class="p-2">
                    <input class="${inputClass}" type="number" step="any" data-kind="general" data-index="${idx}" data-field="x2" value="${row.x2}">
                </td>
                <td class="p-2">
                    <input class="${inputClass}" type="number" step="any" data-kind="general" data-index="${idx}" data-field="y2" value="${row.y2}">
                </td>
                <td class="p-2 text-center">
                    <input class="${checkboxClass}" type="checkbox" data-kind="general" data-index="${idx}" data-field="visible" ${row.visible !== false ? "checked" : ""}>
                </td>
                <td class="p-2">
                    <select class="${selectClass}" data-kind="general" data-index="${idx}" data-field="bubbleLoc">
                        <option value="Start" ${row.bubbleLoc === "Start" ? "selected" : ""}>Start</option>
                        <option value="End" ${row.bubbleLoc === "End" ? "selected" : ""}>End</option>
                    </select>
                </td>
                <td class="p-2">
                    <input class="${colorInputClass}" type="color" data-kind="general" data-index="${idx}" data-field="color" value="${row.color || (row.direction === "X" ? "#ff0000" : "#00ff00")}">
                </td>
                <td class="p-2 text-center">
                    <button class="${deleteButtonClass}" type="button" data-remove="general" data-index="${idx}">Eliminar</button>
                </td>
            </tr>
        `;
      })
      .join("");

    this.bindDynamicEvents(this.generalBody);
  }

  bindDynamicEvents(container) {
    container.querySelectorAll("input, select").forEach((el) => {
      el.removeEventListener("change", this.handleFieldChange);
      el.addEventListener("change", (e) => this.handleFieldChange(e));
    });

    container.querySelectorAll("button[data-remove]").forEach((btn) => {
      btn.removeEventListener("click", this.handleRemove);
      btn.addEventListener("click", (e) => this.handleRemove(e));
    });
  }

  //   handleFieldChange(e) {
  //     if (!this.draftGrid) return;

  //     const el = e.target;
  //     const kind = el.dataset.kind;

  //     if (kind === "general") {
  //       const index = Number(el.dataset.index);
  //       const field = el.dataset.field;
  //       const diagonals = (this.draftGrid.generalGrids || []).filter((g) => g.source === "diagonal");

  //       if (!diagonals[index]) return;

  //       let value;
  //       if (el.type === "checkbox") {
  //         value = el.checked;
  //       } else if (el.type === "number") {
  //         value = Number(el.value);
  //       } else {
  //         value = el.value;
  //       }

  //       diagonals[index][field] = value;

  //       // Si cambia la visibilidad, actualizar también en el objeto original
  //       const originalIndex = this.draftGrid.generalGrids.findIndex((g) => g.id === diagonals[index].id);
  //       if (originalIndex !== -1) {
  //         this.draftGrid.generalGrids[originalIndex][field] = value;
  //       }

  //       this.renderGeneral();
  //       return;
  //     }

  //     // Para X e Y
  //     let collection = null;
  //     if (kind === "x") collection = this.draftGrid.xGrids;
  //     if (kind === "y") collection = this.draftGrid.yGrids;

  //     const index = Number(el.dataset.index);
  //     const field = el.dataset.field;

  //     if (!collection || !collection[index]) return;

  //     let value;
  //     if (el.type === "checkbox") {
  //       value = el.checked;
  //     } else if (el.type === "number") {
  //       value = Number(el.value);
  //     } else {
  //       value = el.value;
  //     }

  //     collection[index][field] = value;

  //     if (kind === "x" || kind === "y") {
  //       this.refreshDraft();
  //       this.renderX();
  //       this.renderY();
  //     }
  //   }

  handleFieldChange(e) {
    if (!this.draftGrid) return;

    const el = e.target;
    const kind = el.dataset.kind;

    if (kind === "general") {
      const index = Number(el.dataset.index);
      const field = el.dataset.field;
      const diagonals = (this.draftGrid.generalGrids || []).filter((g) => g.source === "diagonal");

      if (!diagonals[index]) return;

      let value;
      if (el.type === "checkbox") {
        value = el.checked;
      } else if (el.type === "number") {
        value = Number(el.value);
      } else {
        value = el.value;
      }

      diagonals[index][field] = value;

      // Si cambia la visibilidad, actualizar también en el objeto original
      const originalIndex = this.draftGrid.generalGrids.findIndex((g) => g.id === diagonals[index].id);
      if (originalIndex !== -1) {
        this.draftGrid.generalGrids[originalIndex][field] = value;
      }

      this.renderGeneral();
      return;
    }

    // Para X e Y
    let collection = null;
    if (kind === "x") collection = this.draftGrid.xGrids;
    if (kind === "y") collection = this.draftGrid.yGrids;

    const index = Number(el.dataset.index);
    const field = el.dataset.field;

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
      this.renderX();
      this.renderY();
    }
  }

  handleRemove(e) {
    if (!this.draftGrid) return;

    const kind = e.currentTarget.dataset.remove;
    const index = Number(e.currentTarget.dataset.index);

    if (kind === "x") {
      this.draftGrid.xGrids.splice(index, 1);
      this.refreshDraft();
      this.renderX();
      return;
    }

    if (kind === "y") {
      this.draftGrid.yGrids.splice(index, 1);
      this.refreshDraft();
      this.renderY();
      return;
    }

    if (kind === "general") {
      const diagonals = (this.draftGrid.generalGrids || []).filter((g) => g.source === "diagonal");
      diagonals.splice(index, 1);
      this.draftGrid.generalGrids = diagonals;
      this.renderGeneral();
    }
  }

  getNextXId() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const used = new Set((this.draftGrid?.xGrids || []).map((g) => String(g.id)));
    for (const ch of letters) {
      if (!used.has(ch)) return ch;
    }
    return `X${(this.draftGrid?.xGrids?.length || 0) + 1}`;
  }

  getNextYId() {
    const used = new Set((this.draftGrid?.yGrids || []).map((g) => String(g.id)));
    let i = 1;
    while (used.has(String(i))) i++;
    return String(i);
  }
}

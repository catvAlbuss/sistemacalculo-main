import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../../model/shapes.js";

/**
 * @mixin storyGridMixin
 *
 * Edición de datos de pisos (stories) y de la grilla de referencia.
 *
 * En el sistema CAD, los "stories" son los niveles de piso (BASE, STORY1,
 * STORY2, ...) que definen la altura Z de cada planta. La grilla de
 * referencia son los ejes X/Y que se ven en la vista de planta.
 *
 * Este mixin abre los diálogos para que el usuario edite esos datos
 * tabulares (alturas de piso, coordenadas de ejes, visibilidad de líneas)
 * y construye o reconstruye los arrays correspondientes en el modelo.
 *
 * Responsabilidades:
 * - editGridData()             → abre el editor de grilla (GridEditor)
 * - editStoryData()            → delega en el editor único de pisos
 *                                (grids/story-editor.js + story-data-modal)
 * - editReferencePlanes()      → diálogo para editar planos de referencia
 * - getActiveStoryZ()          → coordenada Z del piso activo
 * - setActiveStory(index)      → cambia el piso activo y actualiza la vista
 */
export const storyGridMixin = {
  editGridData() {
    if (this.gridEditor) {
      this.gridEditor.open();
    } else {
      this.showMessage("📏 Editar datos de grilla");
    }
  },

  // Editor de pisos UNIFICADO — la tabla vive en
  // modals/story-data-modal.blade.php y la logica en grids/story-editor.js.
  // Antes habia dos dialogos distintos que hacian exactamente lo mismo
  // (este, con Swal, y "Generar Pisos desde la Grilla" del menu Dibujar);
  // ahora los dos entran al mismo modal.
  editStoryData() {
    this.openStoryDataDialog();
  },

  openGenerateStoriesDialog() {
    this.openStoryDataDialog();
  },

  // =========================================
  // ===== EDIT: REFERENCE LINES =============
  // =========================================

  editReferenceLines() {
    if (!this.referenceGrid) {
      this.referenceGrid = {
        xGrids: [],
        yGrids: [],
        generalGrids: [],
        xPositions: [],
        yPositions: [],
        xLabels: [],
        yLabels: [],
        storyCount: 0,
        storyHeight: 0,
      };
    }

    const currentCustomLines = (this.referenceGrid.generalGrids || [])
      .filter((line) => line.source === "custom")
      .map((line, index) => ({
        id: String(line.id ?? `RL${index + 1}`),
        x1: Number(line.x1 ?? 0),
        y1: Number(line.y1 ?? 0),
        x2: Number(line.x2 ?? 0),
        y2: Number(line.y2 ?? 0),
        visible: line.visible !== false,
        bubbleLoc: line.bubbleLoc ?? "End",
        source: "custom",
      }));

    Swal.fire({
      title: "Edit Reference Lines",
      width: 900,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Edita líneas de referencia auxiliares en planta. Estas líneas sirven como guías y puntos de snap.
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <b>Reference Lines</b>
          <button 
            type="button" 
            id="btn-add-reference-line"
            style="padding:6px 10px; border-radius:5px; border:1px solid #2563eb; background:#2563eb; color:white; cursor:pointer;"
          >
            + Add Line
          </button>
        </div>

        <div style="border:1px solid #555; border-radius:6px; max-height:340px; overflow:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#1f2937; color:white;">
                <th style="border:1px solid #555; padding:6px;">ID</th>
                <th style="border:1px solid #555; padding:6px;">X1</th>
                <th style="border:1px solid #555; padding:6px;">Y1</th>
                <th style="border:1px solid #555; padding:6px;">X2</th>
                <th style="border:1px solid #555; padding:6px;">Y2</th>
                <th style="border:1px solid #555; padding:6px;">Visible</th>
                <th style="border:1px solid #555; padding:6px;">Bubble</th>
                <th style="border:1px solid #555; padding:6px;">Remove</th>
              </tr>
            </thead>

            <tbody id="edit-reference-lines-body"></tbody>
          </table>
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Ejemplo: una línea diagonal desde X1=0, Y1=0 hasta X2=10, Y2=8.
          Se mostrará en planta como línea auxiliar personalizada.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const body = document.getElementById("edit-reference-lines-body");
        const addButton = document.getElementById("btn-add-reference-line");

        let rows = JSON.parse(JSON.stringify(currentCustomLines));

        const inputStyle = "width:100%; padding:5px; box-sizing:border-box;";
        const selectStyle = "width:100%; padding:5px; box-sizing:border-box;";

        const renderRows = () => {
          if (!body) return;

          body.innerHTML = rows
            .map(
              (line, index) => `
          <tr>
            <td style="border:1px solid #555; padding:5px;">
              <input 
                data-ref-line-index="${index}" 
                data-ref-line-field="id"
                value="${line.id}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-line-index="${index}" 
                data-ref-line-field="x1"
                value="${line.x1}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-line-index="${index}" 
                data-ref-line-field="y1"
                value="${line.y1}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-line-index="${index}" 
                data-ref-line-field="x2"
                value="${line.x2}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-line-index="${index}" 
                data-ref-line-field="y2"
                value="${line.y2}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <input 
                type="checkbox"
                data-ref-line-index="${index}" 
                data-ref-line-field="visible"
                ${line.visible !== false ? "checked" : ""}
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <select 
                data-ref-line-index="${index}" 
                data-ref-line-field="bubbleLoc"
                style="${selectStyle}"
              >
                <option value="Start" ${line.bubbleLoc === "Start" ? "selected" : ""}>Start</option>
                <option value="End" ${line.bubbleLoc === "End" ? "selected" : ""}>End</option>
              </select>
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <button 
                type="button" 
                data-remove-reference-line="${index}"
                style="padding:5px 8px; border-radius:5px; border:1px solid #dc2626; background:#dc2626; color:white; cursor:pointer;"
              >
                X
              </button>
            </td>
          </tr>
        `,
            )
            .join("");

          body.querySelectorAll("[data-ref-line-field]").forEach((input) => {
            input.addEventListener("input", (event) => {
              const index = Number(event.target.dataset.refLineIndex);
              const field = event.target.dataset.refLineField;

              if (!rows[index]) return;

              if (field === "visible") {
                rows[index][field] = event.target.checked;
              } else if (["x1", "y1", "x2", "y2"].includes(field)) {
                rows[index][field] = Number(event.target.value);
              } else {
                rows[index][field] = event.target.value;
              }
            });

            input.addEventListener("change", (event) => {
              const index = Number(event.target.dataset.refLineIndex);
              const field = event.target.dataset.refLineField;

              if (!rows[index]) return;

              if (field === "visible") {
                rows[index][field] = event.target.checked;
              } else if (["x1", "y1", "x2", "y2"].includes(field)) {
                rows[index][field] = Number(event.target.value);
              } else {
                rows[index][field] = event.target.value;
              }
            });
          });

          body.querySelectorAll("[data-remove-reference-line]").forEach((button) => {
            button.addEventListener("click", (event) => {
              const index = Number(event.target.dataset.removeReferenceLine);
              rows.splice(index, 1);
              renderRows();
            });
          });
        };

        addButton?.addEventListener("click", () => {
          rows.push({
            id: `RL${rows.length + 1}`,
            x1: 0,
            y1: 0,
            x2: 5,
            y2: 5,
            visible: true,
            bubbleLoc: "End",
            source: "custom",
          });

          renderRows();
        });

        window.__editReferenceLinesRows = rows;
        renderRows();
      },

      preConfirm: () => {
        const rows = window.__editReferenceLinesRows || [];

        const cleaned = rows.map((line, index) => ({
          id: String(line.id || `RL${index + 1}`),
          x1: Number(line.x1 || 0),
          y1: Number(line.y1 || 0),
          x2: Number(line.x2 || 0),
          y2: Number(line.y2 || 0),
          visible: line.visible !== false,
          bubbleLoc: line.bubbleLoc || "End",
          source: "custom",
        }));

        for (const line of cleaned) {
          if (
            !Number.isFinite(line.x1) ||
            !Number.isFinite(line.y1) ||
            !Number.isFinite(line.x2) ||
            !Number.isFinite(line.y2)
          ) {
            Swal.showValidationMessage("Hay coordenadas inválidas en una línea de referencia.");
            return false;
          }

          const samePoint = Math.abs(line.x1 - line.x2) < 1e-9 && Math.abs(line.y1 - line.y2) < 1e-9;

          if (samePoint) {
            Swal.showValidationMessage(`La línea ${line.id} tiene el punto inicial y final iguales.`);
            return false;
          }
        }

        return cleaned;
      },

      willClose: () => {
        delete window.__editReferenceLinesRows;
      },
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      this.applyReferenceLinesData(result.value);
    });
  },

  applyReferenceLinesData(lines = []) {
    if (!this.referenceGrid) return;

    this.saveUndoState?.("Edit Reference Lines");

    const existingBaseLines = (this.referenceGrid.generalGrids || []).filter((line) => line.source !== "custom");

    const customLines = lines.map((line, index) => ({
      id: String(line.id || `RL${index + 1}`),
      x1: Number(line.x1 || 0),
      y1: Number(line.y1 || 0),
      x2: Number(line.x2 || 0),
      y2: Number(line.y2 || 0),
      visible: line.visible !== false,
      bubbleLoc: line.bubbleLoc || "End",
      source: "custom",
    }));

    this.referenceGrid.generalGrids = [...existingBaseLines, ...customLines];

    this.rebuildReferenceGridCaches?.();
    this.rebuildGeneralGrids?.();

    this.activeGridPoint = null;

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(`Edit Reference Lines aplicado: ${customLines.length} línea(s) de referencia.`);

    console.log("✅ EDIT REFERENCE LINES aplicado:", {
      customLines,
      generalGrids: this.referenceGrid.generalGrids,
    });
  },

  // =========================================
  // ===== EDIT: REFERENCE PLANES ============
  // =========================================

  editReferencePlanes() {
    if (!Array.isArray(this.referencePlanes)) {
      this.referencePlanes = [];
    }

    const currentPlanes = this.referencePlanes.map((plane, index) => ({
      id: String(plane.id ?? `RP${index + 1}`),
      name: String(plane.name ?? plane.id ?? `RP${index + 1}`),
      planeType: plane.planeType || "XY",
      coordinate: Number(plane.coordinate ?? 0),
      visible: plane.visible !== false,
      showFill: plane.showFill === true,
    }));

    Swal.fire({
      title: "Edit Reference Planes",
      width: 900,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Edita planos auxiliares de referencia. Estos planos sirven como guías visuales para modelar en planta, elevación y 3D.
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <b>Reference Planes</b>
          <button 
            type="button" 
            id="btn-add-reference-plane"
            style="padding:6px 10px; border-radius:5px; border:1px solid #2563eb; background:#2563eb; color:white; cursor:pointer;"
          >
            + Add Plane
          </button>
        </div>

        <div style="border:1px solid #555; border-radius:6px; max-height:340px; overflow:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#1f2937; color:white;">
                <th style="border:1px solid #555; padding:6px;">ID</th>
                <th style="border:1px solid #555; padding:6px;">Name</th>
                <th style="border:1px solid #555; padding:6px;">Plane</th>
                <th style="border:1px solid #555; padding:6px;">Coordinate</th>
                <th style="border:1px solid #555; padding:6px;">Visible</th>
                <th style="border:1px solid #555; padding:6px;">Fill</th>
                <th style="border:1px solid #555; padding:6px;">Remove</th>
              </tr>
            </thead>

            <tbody id="edit-reference-planes-body"></tbody>
          </table>
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          <b>XY</b>: plano horizontal, coordenada Z.<br>
          <b>YZ</b>: plano vertical, coordenada X.<br>
          <b>XZ</b>: plano vertical, coordenada Y.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const body = document.getElementById("edit-reference-planes-body");
        const addButton = document.getElementById("btn-add-reference-plane");

        let rows = JSON.parse(JSON.stringify(currentPlanes));

        const inputStyle = "width:100%; padding:5px; box-sizing:border-box;";
        const selectStyle = "width:100%; padding:5px; box-sizing:border-box;";

        const renderRows = () => {
          if (!body) return;

          body.innerHTML = rows
            .map(
              (plane, index) => `
          <tr>
            <td style="border:1px solid #555; padding:5px;">
              <input 
                data-ref-plane-index="${index}" 
                data-ref-plane-field="id"
                value="${plane.id}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                data-ref-plane-index="${index}" 
                data-ref-plane-field="name"
                value="${plane.name}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <select 
                data-ref-plane-index="${index}" 
                data-ref-plane-field="planeType"
                style="${selectStyle}"
              >
                <option value="XY" ${plane.planeType === "XY" ? "selected" : ""}>XY - Z constant</option>
                <option value="YZ" ${plane.planeType === "YZ" ? "selected" : ""}>YZ - X constant</option>
                <option value="XZ" ${plane.planeType === "XZ" ? "selected" : ""}>XZ - Y constant</option>
              </select>
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-plane-index="${index}" 
                data-ref-plane-field="coordinate"
                value="${plane.coordinate}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <input 
                type="checkbox"
                data-ref-plane-index="${index}" 
                data-ref-plane-field="visible"
                ${plane.visible !== false ? "checked" : ""}
              >
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <input 
                type="checkbox"
                data-ref-plane-index="${index}" 
                data-ref-plane-field="showFill"
                ${plane.showFill === true ? "checked" : ""}
              >
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <button 
                type="button" 
                data-remove-reference-plane="${index}"
                style="padding:5px 8px; border-radius:5px; border:1px solid #dc2626; background:#dc2626; color:white; cursor:pointer;"
              >
                X
              </button>
            </td>
          </tr>
        `,
            )
            .join("");

          body.querySelectorAll("[data-ref-plane-field]").forEach((input) => {
            const updateValue = (event) => {
              const index = Number(event.target.dataset.refPlaneIndex);
              const field = event.target.dataset.refPlaneField;

              if (!rows[index]) return;

              if (field === "visible" || field === "showFill") {
                rows[index][field] = event.target.checked;
              } else if (field === "coordinate") {
                rows[index][field] = Number(event.target.value);
              } else {
                rows[index][field] = event.target.value;
              }
            };

            input.addEventListener("input", updateValue);
            input.addEventListener("change", updateValue);
          });

          body.querySelectorAll("[data-remove-reference-plane]").forEach((button) => {
            button.addEventListener("click", (event) => {
              const index = Number(event.target.dataset.removeReferencePlane);
              rows.splice(index, 1);
              renderRows();
            });
          });
        };

        addButton?.addEventListener("click", () => {
          rows.push({
            id: `RP${rows.length + 1}`,
            name: `Reference Plane ${rows.length + 1}`,
            planeType: "XY",
            coordinate: 0,
            visible: true,
            showFill: false,
          });

          renderRows();
        });

        window.__editReferencePlanesRows = rows;
        renderRows();
      },

      preConfirm: () => {
        const rows = window.__editReferencePlanesRows || [];

        const cleaned = rows.map((plane, index) => ({
          id: String(plane.id || `RP${index + 1}`),
          name: String(plane.name || plane.id || `Reference Plane ${index + 1}`),
          planeType: ["XY", "YZ", "XZ"].includes(plane.planeType) ? plane.planeType : "XY",
          coordinate: Number(plane.coordinate || 0),
          visible: plane.visible !== false,
          showFill: plane.showFill === true,
        }));

        for (const plane of cleaned) {
          if (!Number.isFinite(plane.coordinate)) {
            Swal.showValidationMessage(`El plano ${plane.id} tiene una coordenada inválida.`);
            return false;
          }
        }

        return cleaned;
      },

      willClose: () => {
        delete window.__editReferencePlanesRows;
      },
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      this.applyReferencePlanesData(result.value);
    });
  },

  applyReferencePlanesData(planes = []) {
    this.saveUndoState?.("Edit Reference Planes");

    this.referencePlanes = planes.map((plane, index) => ({
      id: String(plane.id || `RP${index + 1}`),
      name: String(plane.name || plane.id || `Reference Plane ${index + 1}`),
      planeType: ["XY", "YZ", "XZ"].includes(plane.planeType) ? plane.planeType : "XY",
      coordinate: Number(plane.coordinate || 0),
      visible: plane.visible !== false,
      showFill: plane.showFill === true,
    }));

    this.activeGridPoint = null;

    this.redraw?.();
    // this.sync3D?.();

    this.showMessage?.(`Edit Reference Planes aplicado: ${this.referencePlanes.length} plano(s) de referencia.`);

    console.log("✅ EDIT REFERENCE PLANES aplicado:", {
      referencePlanes: this.referencePlanes,
    });
  },

  // Métodos auxiliares para clipboard
  copyToClipboard() {
    if (this.moveObjectState && this.moveObjectState.selectedObject) {
      const obj = this.moveObjectState.selectedObject;
      this.clipboardElements = {
        type: obj.isBeam ? "beam" : "node",
        data: obj.isBeam
          ? {
              id: obj.id,
              node1: { x: obj.node1.position.x, y: obj.node1.position.y, z: obj.node1.position.z },
              node2: { x: obj.node2.position.x, y: obj.node2.position.y, z: obj.node2.position.z },
            }
          : {
              id: obj.id,
              x: obj.position.x,
              y: obj.position.y,
              z: obj.position.z,
            },
      };
    }
  },

  pasteFromClipboard() {
    if (this.clipboardElements) {
      if (this.clipboardElements.type === "node") {
        const newNode = new StructuralNode(
          this.clipboardElements.data.x + 1,
          this.clipboardElements.data.y + 1,
          this.clipboardElements.data.z,
        );
        this.nodes.push(newNode);
      } else if (this.clipboardElements.type === "beam") {
        // Buscar nodos existentes o crear nuevos
        const node1 = new StructuralNode(
          this.clipboardElements.data.node1.x + 1,
          this.clipboardElements.data.node1.y + 1,
          this.clipboardElements.data.node1.z,
        );
        const node2 = new StructuralNode(
          this.clipboardElements.data.node2.x + 1,
          this.clipboardElements.data.node2.y + 1,
          this.clipboardElements.data.node2.z,
        );
        this.nodes.push(node1, node2);
        const newBeam = new Beam(node1, node2);
        this.shapes.push(newBeam);
      }
      this.redraw();
      this.sync3D();
    }
  },


};

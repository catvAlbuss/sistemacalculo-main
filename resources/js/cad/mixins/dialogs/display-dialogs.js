import Swal from "sweetalert2";

/**
 * @mixin displayDialogsMixin
 *
 * Diálogos para configurar la visualización de resultados de análisis.
 *
 * Estos métodos corresponden al menú Display del CAD. Cada diálogo permite
 * al usuario controlar qué se superpone sobre el modelo en el canvas 2D
 * (cargas, forma deformada, fuerzas internas, planos de referencia, etc.).
 *
 * El estado de visualización se guarda en this.displayOptions, que el
 * renderer consulta en cada ciclo de redraw.
 *
 * Responsabilidades:
 * - openShowJointLoadsDialog()        → muestra/oculta cargas en nudos
 * - openShowFrameLoadsDialog()        → muestra/oculta cargas en barras
 * - openShowDeformedShapeDialog()     → configura escala y visualización de deflexiones
 * - openShowModeShapeDialog()         → selecciona modo y escala para forma modal
 * - openShowMemberForcesDialog()      → diagrama de fuerzas internas (axial, corte, momento)
 * - openShowReferencePlanesDialog()   → muestra/oculta planos de referencia
 * - showUndeformedShape()             → alterna entre forma deformada y no deformada
 * - getDefaultFrameSectionsForAssign() → secciones por defecto disponibles
 * - getAvailableFrameSectionsForAssign() → secciones filtradas del modelo actual
 */
export const displayDialogsMixin = {
  openShowJointLoadsDialog() {
    this.ensureDisplayOptions?.();

    Swal.fire({
      title: "Display Joint / Point Loads",
      width: 520,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de cargas asignadas a nodos.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <input 
            id="display-joint-loads" 
            type="checkbox" 
            ${this.displayOptions?.showJointLoads ? "checked" : ""}>
          Show Joint / Point Loads
        </label>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Muestra cargas tipo Force, Ground Displacement y Temperature asignadas desde Assign.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showJointLoads: document.getElementById("display-joint-loads")?.checked === true,
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showJointLoads = result.value.showJointLoads;

      this.redraw?.();

      this.showMessage?.(this.displayOptions.showJointLoads ? "Cargas de nodos visibles." : "Cargas de nodos ocultas.");
    });
  },

  openShowFrameLoadsDialog() {
    this.ensureDisplayOptions();

    Swal.fire({
      title: "Display Frame / Line Loads",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de las cargas asignadas a elementos Frame / Line.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <input 
            id="display-frame-loads" 
            type="checkbox" 
            ${this.displayOptions.showFrameLoads ? "checked" : ""}>
          Show Frame / Line Loads
        </label>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Esta opción muestra u oculta cargas puntuales, distribuidas y de temperatura asignadas desde Assign.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showFrameLoads: document.getElementById("display-frame-loads")?.checked === true,
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showFrameLoads = result.value.showFrameLoads;

      this.redraw?.();

      this.showMessage?.(
        this.displayOptions.showFrameLoads
          ? "Display: cargas de Frame / Line visibles."
          : "Display: cargas de Frame / Line ocultas.",
      );

      console.log("✅ Display > Show Loads > Frame / Line", {
        showFrameLoads: this.displayOptions.showFrameLoads,
      });
    });
  },

  openShowDeformedShapeDialog() {
    this.ensureDisplayOptions();

    if (!this.hasCompletedAnalysisResults()) {
      this.showRunAnalysisRequiredMessage("Display > Show Deformed Shape");
      return;
    }

    Swal.fire({
      title: "Display Deformed Shape",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de la forma deformada del modelo.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input 
            id="display-deformed-shape" 
            type="checkbox" 
            ${this.displayOptions.showDeformedShape ? "checked" : ""}>
          Show Deformed Shape
        </label>

        <label style="display:block; margin-bottom:5px;">Scale Factor</label>
        <input 
          id="display-deformed-scale" 
          type="number" 
          step="0.1" 
          value="${this.displayOptions.deformedScale ?? 1}"
          style="width:100%; padding:7px;">

          <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
                    <input id="display-deformed-animate" type="checkbox">
                    Animate Deformation (smooth transition)
                </label>
        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Esta opción activa la visualización de deflexiones. Para que se note visualmente, el modelo debe tener resultados de desplazamiento o deflexión calculados.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showDeformedShape: document.getElementById("display-deformed-shape")?.checked === true,

          deformedScale: Number(document.getElementById("display-deformed-scale")?.value || 1),

          // retornamos tambien la animacion
          animate: document.getElementById("display-deformed-animate").checked,
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showDeformedShape = result.value.showDeformedShape;
      this.displayOptions.deformedScale = result.value.deformedScale;

      // Si activo deformada, apago otras vistas de resultados incompatibles
      if (result.value.showDeformedShape) {
        this.displayOptions.showUndeformedShape = false;
        this.displayOptions.showModeShape = false;
        this.displayOptions.showMemberForces = false;

        this.options.showDeflection = true;
        this.options.deflectionScale = result.value.deformedScale;

        this.options.showFAxiales = false;
        this.options.showFAxialesValues = false;
      } else {
        this.displayOptions.showUndeformedShape = true;
        this.options.showDeflection = false;
      }

      this.redraw?.();
      this.sync3D?.();

      this.showMessage?.(
        result.value.showDeformedShape ? "Display: forma deformada visible." : "Display: forma deformada oculta.",
      );

      console.log("✅ Display > Show Deformed Shape", {
        showDeformedShape: this.displayOptions.showDeformedShape,
        deformedScale: this.displayOptions.deformedScale,
        showDeflection: this.options.showDeflection,
        deflectionScale: this.options.deflectionScale,
      });
    });
  },

  openShowModeShapeDialog() {
    this.ensureDisplayOptions();

    if (!this.hasCompletedAnalysisResults()) {
      this.showRunAnalysisRequiredMessage("Display > Show Mode Shape");
      return;
    }

    Swal.fire({
      title: "Display Mode Shape",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de una forma modal del modelo.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input 
            id="display-mode-shape" 
            type="checkbox" 
            ${this.displayOptions.showModeShape ? "checked" : ""}>
          Show Mode Shape
        </label>

        <label style="display:block; margin-bottom:5px;">Mode Number</label>
        <input 
          id="display-mode-number" 
          type="number" 
          min="1" 
          step="1" 
          value="${this.displayOptions.modeNumber ?? 1}"
          style="width:100%; padding:7px; margin-bottom:10px;">

        <label style="display:block; margin-bottom:5px;">Scale Factor</label>
        <input 
          id="display-mode-scale" 
          type="number" 
          step="0.1" 
          value="${this.displayOptions.modeScale ?? 1}"
          style="width:100%; padding:7px;">

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Versión inicial: se mostrará una forma modal visual simulada. Luego se conectará con resultados reales del análisis modal.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showModeShape: document.getElementById("display-mode-shape")?.checked === true,

          modeNumber: Number(document.getElementById("display-mode-number")?.value || 1),

          modeScale: Number(document.getElementById("display-mode-scale")?.value || 1),
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showModeShape = result.value.showModeShape;
      this.displayOptions.modeNumber = result.value.modeNumber;
      this.displayOptions.modeScale = result.value.modeScale;

      if (result.value.showModeShape) {
        this.displayOptions.showUndeformedShape = true;
        this.displayOptions.showDeformedShape = false;
        this.displayOptions.showMemberForces = false;

        this.options.showDeflection = false;
        this.options.showFAxiales = false;
        this.options.showFAxialesValues = false;
      } else {
        this.displayOptions.showModeShape = false;
      }

      this.redraw?.();
      this.sync3D?.();

      this.showMessage?.(
        result.value.showModeShape
          ? `Display: forma modal ${result.value.modeNumber} visible.`
          : "Display: forma modal oculta.",
      );

      console.log("✅ Display > Show Mode Shape", {
        showModeShape: this.displayOptions.showModeShape,
        modeNumber: this.displayOptions.modeNumber,
        modeScale: this.displayOptions.modeScale,
      });
    });
  },

  openShowMemberForcesDialog() {
    this.ensureDisplayOptions();

    if (!this.hasCompletedAnalysisResults()) {
      this.showRunAnalysisRequiredMessage("Display > Show Member Forces / Stress Diagram");
      return;
    }

    Swal.fire({
      title: "Display Member Forces / Stress Diagram",
      width: 580,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de diagramas de fuerzas internas en elementos Frame / Line.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <input 
            id="display-member-forces" 
            type="checkbox" 
            ${this.displayOptions.showMemberForces ? "checked" : ""}>
          Show Member Forces / Stress Diagram
        </label>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input 
            id="display-member-force-values" 
            type="checkbox" 
            ${this.displayOptions.showMemberForceValues ? "checked" : ""}>
          Show Values
        </label>

        <label style="display:block; margin-bottom:5px;">Diagram Type</label>
        <select id="display-member-force-type" style="width:100%; padding:7px;">
          <option value="axial">Axial Force</option>
          <option value="shear2">Shear 2</option>
          <option value="shear3">Shear 3</option>
          <option value="moment2">Moment 2</option>
          <option value="moment3">Moment 3</option>
          <option value="torsion">Torsion</option>
        </select>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Versión inicial: se conecta con el diagrama axial existente. Luego se ampliará para cortantes, momentos y torsión.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const select = document.getElementById("display-member-force-type");
        if (select) {
          select.value = this.displayOptions.memberForceType || "axial";
        }
      },

      preConfirm: () => {
        return {
          showMemberForces: document.getElementById("display-member-forces")?.checked === true,

          showMemberForceValues: document.getElementById("display-member-force-values")?.checked === true,

          memberForceType: document.getElementById("display-member-force-type")?.value || "axial",
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showMemberForces = result.value.showMemberForces;
      this.displayOptions.showMemberForceValues = result.value.showMemberForceValues;
      this.displayOptions.memberForceType = result.value.memberForceType;

      if (result.value.showMemberForces) {
        this.displayOptions.showUndeformedShape = true;
        this.displayOptions.showDeformedShape = false;
        this.displayOptions.showModeShape = false;

        this.options.showDeflection = false;

        // Por ahora solo axial está conectado al renderer existente
        this.options.showFAxiales = result.value.memberForceType === "axial";

        this.options.showFAxialesValues =
          result.value.memberForceType === "axial" && result.value.showMemberForceValues;
      } else {
        this.options.showFAxiales = false;
        this.options.showFAxialesValues = false;
      }

      this.redraw?.();
      this.sync3D?.();

      this.showMessage?.(
        result.value.showMemberForces
          ? `Display: diagrama ${result.value.memberForceType} visible.`
          : "Display: diagramas de fuerzas ocultos.",
      );

      console.log("✅ Display > Show Member Forces / Stress Diagram", {
        showMemberForces: this.displayOptions.showMemberForces,
        showMemberForceValues: this.displayOptions.showMemberForceValues,
        memberForceType: this.displayOptions.memberForceType,
        showFAxiales: this.options.showFAxiales,
        showFAxialesValues: this.options.showFAxialesValues,
      });
    });
  },

  openShowReferencePlanesDialog() {
    this.ensureDisplayOptions?.();

    Swal.fire({
      title: "Display Reference Planes",
      width: 520,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de los planos auxiliares de referencia creados desde Edit Reference Planes.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input 
            id="display-reference-planes" 
            type="checkbox" 
            ${this.displayOptions?.showReferencePlanes !== false ? "checked" : ""}>
          Show Reference Planes
        </label>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Los Reference Planes son guías visuales. No son losas, muros ni elementos estructurales de análisis.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showReferencePlanes: document.getElementById("display-reference-planes")?.checked === true,
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showReferencePlanes = result.value.showReferencePlanes;

      this.redraw?.();

      this.showMessage?.(
        this.displayOptions.showReferencePlanes
          ? "Display: Reference Planes visibles."
          : "Display: Reference Planes ocultos.",
      );

      console.log("✅ Display > Show Reference Planes", {
        showReferencePlanes: this.displayOptions.showReferencePlanes,
      });
    });
  },

  showUndeformedShape() {
    this.ensureDisplayOptions();

    // Estado principal Display
    this.displayOptions.showUndeformedShape = true;
    this.displayOptions.showDeformedShape = false;
    this.displayOptions.showModeShape = false;
    this.displayOptions.showMemberForces = false;

    // Apagar resultados/diagramas
    this.options.showDeflection = false;
    this.options.showFAxiales = false;
    this.options.showFAxialesValues = false;

    // También apagamos visualmente valores de diagramas
    this.displayOptions.showMemberForces = false;
    this.displayOptions.showMemberForceValues = false;

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.("Display: mostrando forma no deformada.");

    console.log("✅ Display > Show Undeformed Shape", {
      showDeflection: this.options.showDeflection,
      showFAxiales: this.options.showFAxiales,
      showFAxialesValues: this.options.showFAxialesValues,
      displayOptions: this.displayOptions,
    });
  },

  // ============================================================
  // DISPLAY / SHOW TABLES
  // Tablas tipo ETABS para asignaciones del modelo.
  // Por ahora: Joint Loads Assignments - Force / Ground Displacement / Temperature
  // ============================================================

  _getShowTablesNodeZ(node) {
    return Number(node?.position?.z ?? node?.z ?? 0);
  },

  _getShowTablesStoryName(node) {
    const z = this._getShowTablesNodeZ(node);

    if (Math.abs(z) < 1e-9) {
      return "BASE";
    }

    const stories = Array.isArray(this.stories) ? this.stories : [];

    const found = stories.find((story) => {
      const elev = Number(
        story?.elevation ??
        story?.z ??
        story?.height ??
        story?.level ??
        0
      );

      return Math.abs(elev - z) < 1e-6;
    });

    if (found) {
      return found.name || found.label || found.id || `STORY ${z}`;
    }

    const zLevels = Array.from(
      new Set(
        (this.nodes || [])
          .map((n) => this._getShowTablesNodeZ(n))
          .filter((value) => value > 0)
          .map((value) => Number(value.toFixed(6)))
      )
    ).sort((a, b) => a - b);

    const index = zLevels.findIndex((value) => Math.abs(value - z) < 1e-6);

    return index >= 0 ? `STORY ${index + 1}` : `STORY ${z}`;
  },

  _getShowTablesJointLabel(node) {
    return String(node?.label || node?.name || node?.id || "");
  },

  _getShowTablesJointUniqueName(node) {
    return String(
      node?.uniqueName ||
      node?.unique_name ||
      node?.guid ||
      node?.id ||
      ""
    );
  },

  _getJointPointLoadsForShowTables(node) {
    if (!node) return [];

    const rawLoads = [
      ...(Array.isArray(node.pointLoads) ? node.pointLoads : []),
      ...(Array.isArray(node.jointLoads) ? node.jointLoads : []),
      ...(Array.isArray(node.assignment?.pointLoads) ? node.assignment.pointLoads : []),
      ...(Array.isArray(node.assignment?.jointLoads) ? node.assignment.jointLoads : []),
    ];

    const seen = new Set();
    const result = [];

    rawLoads.forEach((load) => {
      if (!load || typeof load !== "object") return;

      const key =
        load.id ||
        load.guid ||
        load.GUID ||
        [
          load.type,
          load.loadPattern || load.loadCase,
          JSON.stringify(load.forces || {}),
          JSON.stringify(load.displacements || {}),
          JSON.stringify(load.temperature || {}),
        ].join("|");

      if (seen.has(key)) return;

      seen.add(key);
      result.push(load);
    });

    return result;
  },

  _numberForShowTables(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  },

  _formatShowTablesCellValue(value) {
    if (value === null || value === undefined) return "";

    if (typeof value === "number") {
      if (!Number.isFinite(value)) return "";

      const abs = Math.abs(value);

      if (abs !== 0 && abs < 0.000001) {
        return value.toExponential(4);
      }

      return Number(value.toFixed(6)).toString();
    }

    return String(value);
  },

  _escapeShowTablesHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  _getShowTablesSelectedNodeIds() {
    const ids = new Set();

    if (typeof this.getSelectedJointsForAssign === "function") {
      this.getSelectedJointsForAssign().forEach((node) => {
        if (node?.id !== undefined) ids.add(String(node.id));
      });
    }

    if (Array.isArray(this.selectedNodes)) {
      this.selectedNodes.forEach((node) => {
        if (typeof node === "object" && node?.id !== undefined) ids.add(String(node.id));
        else ids.add(String(node));
      });
    }

    if (this.selectedNodeIds instanceof Set) {
      this.selectedNodeIds.forEach((id) => ids.add(String(id)));
    }

    return ids;
  },

  _getShowTablesSourceNodes(options = {}) {
    const nodes = Array.isArray(this.nodes) ? this.nodes : [];

    if (!options.selectionOnly) {
      return nodes;
    }

    const selectedIds = this._getShowTablesSelectedNodeIds();

    if (!selectedIds.size) {
      return [];
    }

    return nodes.filter((node) => selectedIds.has(String(node.id)));
  },

  // ==========================================================
  // JOINT ASSIGNMENTS - RESTRAINTS
  // Normalización de restricciones nodales para Show Tables.
  // ==========================================================

  _normalizeJointRestraintValue(value) {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value !== 0;
    }

    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();

    return [
      "1",
      "true",
      "yes",
      "si",
      "sí",
      "restrained",
      "fixed",
    ].includes(normalized);
  },

  _getJointRestraintsForShowTables(node) {
    if (!node) return null;

    /*
     * El panel Propiedades → Soporte modifica node.soporte.
     * Cuando existe un soporte seleccionado, este debe tener prioridad
     * sobre restraints antiguos que el nodo todavía pueda conservar.
     */
    const supportType = String(
      node.soporte ||
      node.supportType ||
      ""
    ).trim();

    const supportRestraints = {
      soporteUno: {
        ux: true,
        uy: true,
        uz: true,
        rx: true,
        ry: true,
        rz: true,
      },

      fixed: {
        ux: true,
        uy: true,
        uz: true,
        rx: true,
        ry: true,
        rz: true,
      },

      soporteDos: {
        ux: true,
        uy: true,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      pinned: {
        ux: true,
        uy: true,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      soporteTres: {
        ux: false,
        uy: false,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      soporteCuatro: {
        ux: false,
        uy: false,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      rollerZ: {
        ux: false,
        uy: false,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },
    };

    if (supportType && supportRestraints[supportType]) {
      return {
        ...supportRestraints[supportType],
      };
    }

    /*
     * Si no existe un soporte seleccionado desde el panel lateral,
     * se leen las restricciones asignadas desde:
     * Assign → Joint / Point → Restraints / Supports.
     */
    const rawRestraints =
      node.restraints ||
      node.constraints ||
      node.assignment?.restraints ||
      null;

    if (!rawRestraints || typeof rawRestraints !== "object") {
      return null;
    }

    return {
      ux: this._normalizeJointRestraintValue(rawRestraints.ux),
      uy: this._normalizeJointRestraintValue(rawRestraints.uy),
      uz: this._normalizeJointRestraintValue(rawRestraints.uz),
      rx: this._normalizeJointRestraintValue(rawRestraints.rx),
      ry: this._normalizeJointRestraintValue(rawRestraints.ry),
      rz: this._normalizeJointRestraintValue(rawRestraints.rz),
    };
  },

  _jointHasAnyRestraintForShowTables(restraints) {
    if (!restraints) return false;

    return (
      restraints.ux === true ||
      restraints.uy === true ||
      restraints.uz === true ||
      restraints.rx === true ||
      restraints.ry === true ||
      restraints.rz === true
    );
  },

  _formatJointRestraintForShowTables(value) {
    return value === true ? "Yes" : "No";
  },

  _buildJointRestraintAssignmentRows(options = {}) {
    const rows = [];

    this._getShowTablesSourceNodes(options).forEach((node) => {
      const restraints = this._getJointRestraintsForShowTables(node);

      // La tabla muestra solamente nodos que realmente tienen
      // al menos un grado de libertad restringido.
      if (!this._jointHasAnyRestraintForShowTables(restraints)) {
        return;
      }

      rows.push({
        _z: this._getShowTablesNodeZ(node),

        Story: this._getShowTablesStoryName(node),
        Label: this._getShowTablesJointLabel(node),
        UniqueName: this._getShowTablesJointUniqueName(node),

        UX: this._formatJointRestraintForShowTables(restraints.ux),
        UY: this._formatJointRestraintForShowTables(restraints.uy),
        UZ: this._formatJointRestraintForShowTables(restraints.uz),

        RX: this._formatJointRestraintForShowTables(restraints.rx),
        RY: this._formatJointRestraintForShowTables(restraints.ry),
        RZ: this._formatJointRestraintForShowTables(restraints.rz),
      });
    });

    return rows
      .sort((a, b) => {
        if (a._z !== b._z) {
          return b._z - a._z;
        }

        return String(a.Label || "").localeCompare(
          String(b.Label || ""),
          undefined,
          { numeric: true }
        );
      })
      .map(({ _z, ...row }) => row);
  },

  // ==========================================================
  // JOINT ASSIGNMENTS - SUMMARY
  // Lectura neutral de diafragma y restricciones nodales.
  // ==========================================================

  _getJointDiaphragmForShowTables(node) {
    if (!node) return "";

    const diaphragm =
      node.diaphragm ||
      node.assignment?.diaphragm ||
      null;

    const directDiaphragm = String(
      node.diaphragmName ||
      diaphragm?.name ||
      node.diaphragmId ||
      diaphragm?.id ||
      ""
    ).trim();

    const rawMode = String(
      node.diaphragmMode ||
      node.assignment?.diaphragmMode ||
      ""
    )
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");

    // ========================================================
    // NONE / DISCONNECT
    // Tiene prioridad incluso si quedaron campos antiguos.
    // ========================================================
    if (
      rawMode === "none" ||
      rawMode === "disconnect" ||
      rawMode === "disconnected"
    ) {
      return "";
    }

    // ========================================================
    // DIRECT
    // Solo muestra el nombre si existe una asignación válida.
    // ========================================================
    if (rawMode === "direct") {
      return directDiaphragm || "";
    }

    // ========================================================
    // FROM AREA
    // No debe mostrar un diafragma directo residual.
    // ========================================================
    if (
      rawMode === "fromarea" ||
      rawMode === "fromshell" ||
      rawMode === "fromshellobject"
    ) {
      return "FromArea";
    }

    // ========================================================
    // COMPATIBILIDAD CON MODELOS ANTIGUOS
    // Antes de diaphragmMode, un D1 guardado era directo.
    // ========================================================
    if (directDiaphragm) {
      return directDiaphragm;
    }

    // Modelo antiguo sin información explícita.
    return "FromArea";
  },

  _formatJointRestraintSummaryForShowTables(node) {
    const restraints = this._getJointRestraintsForShowTables(node);

    if (!this._jointHasAnyRestraintForShowTables(restraints)) {
      return "";
    }

    const restrainedDegrees = [];

    if (restraints.ux === true) restrainedDegrees.push("UX");
    if (restraints.uy === true) restrainedDegrees.push("UY");
    if (restraints.uz === true) restrainedDegrees.push("UZ");

    if (restraints.rx === true) restrainedDegrees.push("RX");
    if (restraints.ry === true) restrainedDegrees.push("RY");
    if (restraints.rz === true) restrainedDegrees.push("RZ");

    return restrainedDegrees.join(", ");
  },

  _buildJointAssignmentSummaryRows(options = {}) {
    const sourceNodes = this._getShowTablesSourceNodes(options);

    const rows = [];

    sourceNodes.forEach((node) => {
      rows.push({
        _z: this._getShowTablesNodeZ(node),

        Story: this._getShowTablesStoryName(node),
        Label: this._getShowTablesJointLabel(node),
        UniqueName: this._getShowTablesJointUniqueName(node),

        Diaphragm: this._getJointDiaphragmForShowTables(node),

        Restraints:
          this._formatJointRestraintSummaryForShowTables(node),
      });
    });

    return rows
      .sort((a, b) => {
        if (a._z !== b._z) {
          return b._z - a._z;
        }

        return String(a.Label || "").localeCompare(
          String(b.Label || ""),
          undefined,
          { numeric: true }
        );
      })
      .map(({ _z, ...row }) => row);
  },

  _buildJointForceAssignmentRows(options = {}) {
    const rows = [];

    this._getShowTablesSourceNodes(options).forEach((node) => {
      const loads = this._getJointPointLoadsForShowTables(node)
        .filter((load) => String(load?.type || "").trim() === "force");

      loads.forEach((load) => {
        const f = load.forces || {};

        rows.push({
          Story: this._getShowTablesStoryName(node),
          Label: this._getShowTablesJointLabel(node),
          UniqueName: this._getShowTablesJointUniqueName(node),

          "Load Pattern": load.loadPattern || load.loadCase || "CM",

          FX: this._numberForShowTables(load.fx ?? load.FX ?? f.fx ?? f.FX, 0),
          FY: this._numberForShowTables(load.fy ?? load.FY ?? f.fy ?? f.FY, 0),
          FZ: this._numberForShowTables(load.fz ?? load.FZ ?? f.fz ?? f.FZ, 0),

          MX: this._numberForShowTables(
            load.mx ?? load.mxx ?? load.MX ?? load.MXX ?? f.mx ?? f.mxx ?? f.MX,
            0
          ),
          MY: this._numberForShowTables(
            load.my ?? load.myy ?? load.MY ?? load.MYY ?? f.my ?? f.myy ?? f.MY,
            0
          ),
          MZ: this._numberForShowTables(
            load.mz ?? load.mzz ?? load.MZ ?? load.MZZ ?? f.mz ?? f.mzz ?? f.MZ,
            0
          ),

          "X Dimension": this._numberForShowTables(
            load.punchingX ?? load.punching?.x,
            0
          ),
          "Y Dimension": this._numberForShowTables(
            load.punchingY ?? load.punching?.y,
            0
          ),

          GUID: load.guid || load.GUID || load.id || "",
        });
      });
    });

    return this._sortShowTableRowsEtabsStyle(rows);
  },

  _buildJointGroundDisplacementAssignmentRows(options = {}) {
    const rows = [];

    this._getShowTablesSourceNodes(options).forEach((node) => {
      const loads = this._getJointPointLoadsForShowTables(node)
        .filter((load) => String(load?.type || "").trim() === "ground-displacement");

      loads.forEach((load) => {
        const d = load.displacements || {};

        rows.push({
          Story: this._getShowTablesStoryName(node),
          Label: this._getShowTablesJointLabel(node),
          UniqueName: this._getShowTablesJointUniqueName(node),

          "Load Pattern": load.loadPattern || load.loadCase || "CM",

          UX: this._numberForShowTables(d.ux ?? d.UX, 0),
          UY: this._numberForShowTables(d.uy ?? d.UY, 0),
          UZ: this._numberForShowTables(d.uz ?? d.UZ, 0),

          RX: this._numberForShowTables(d.rx ?? d.RX, 0),
          RY: this._numberForShowTables(d.ry ?? d.RY, 0),
          RZ: this._numberForShowTables(d.rz ?? d.RZ, 0),

          GUID: load.guid || load.GUID || load.id || "",
        });
      });
    });

    return this._sortShowTableRowsEtabsStyle(rows);
  },

  _buildJointTemperatureAssignmentRows(options = {}) {
    const rows = [];

    this._getShowTablesSourceNodes(options).forEach((node) => {
      const loads = this._getJointPointLoadsForShowTables(node)
        .filter((load) => String(load?.type || "").trim() === "temperature");

      loads.forEach((load) => {
        const t = load.temperature || {};

        rows.push({
          Story: this._getShowTablesStoryName(node),
          Label: this._getShowTablesJointLabel(node),
          UniqueName: this._getShowTablesJointUniqueName(node),

          "Load Pattern": load.loadPattern || load.loadCase || "CM",

          T: this._numberForShowTables(
            t.value ?? t.deltaT ?? load.value ?? load.temperatureValue,
            0
          ),

          GUID: load.guid || load.GUID || load.id || "",
        });
      });
    });

    return this._sortShowTableRowsEtabsStyle(rows);
  },

  _sortShowTableRowsEtabsStyle(rows = []) {
    return rows.slice().sort((a, b) => {
      const storyA = String(a?.Story || "");
      const storyB = String(b?.Story || "");

      const getStoryRank = (story) => {
        const text = String(story || "").toUpperCase();

        if (text === "BASE") return -1;

        const match = text.match(/STORY\s+(\d+)/i);

        if (match) {
          return Number(match[1]) || 0;
        }

        return 0;
      };

      const rankA = getStoryRank(storyA);
      const rankB = getStoryRank(storyB);

      // ETABS suele listar pisos superiores primero.
      if (rankA !== rankB) {
        return rankB - rankA;
      }

      const patternA = String(a?.["Load Pattern"] || "");
      const patternB = String(b?.["Load Pattern"] || "");

      if (patternA !== patternB) {
        return patternA.localeCompare(patternB, undefined, { numeric: true });
      }

      const labelA = String(a?.Label || "");
      const labelB = String(b?.Label || "");

      return labelA.localeCompare(labelB, undefined, { numeric: true });
    });
  },

  // ==========================================================
  // SHOW TABLES > helpers de piso / unidades para las tablas nuevas
  // ==========================================================
  _showTablesZLevelsAsc() {
    const zs = new Set();
    (this.nodes || []).forEach((n) => {
      zs.add(Number(n?.position?.z ?? n?.z ?? 0));
    });
    return Array.from(zs).sort((a, b) => a - b);
  },

  // Nombre de piso estilo ETABS por Z: base (z mínimo) → "BASE"; niveles
  // superiores → "STORY 1", "STORY 2", ... (mayor Z = número mayor).
  _showTablesStoryNameByZ(z) {
    const levels = this._showTablesZLevelsAsc();
    const idx = levels.indexOf(Number(z) || 0);
    if (idx <= 0) return "BASE";
    return `STORY ${idx}`;
  },

  _showTablesResolveNode(ref) {
    if (ref && typeof ref === "object") return ref;
    return (this.nodes || []).find((n) => String(n?.id) === String(ref)) || null;
  },

  _showTablesFrameTopZ(frame) {
    const n1 = this._showTablesResolveNode(frame?.node1 ?? frame?.nodeI ?? frame?.i);
    const n2 = this._showTablesResolveNode(frame?.node2 ?? frame?.nodeJ ?? frame?.j);
    const z1 = Number(n1?.position?.z ?? n1?.z ?? 0);
    const z2 = Number(n2?.position?.z ?? n2?.z ?? 0);
    return Math.max(z1, z2);
  },

  _showTablesNToTonf(n) {
    return (Number(n) || 0) / 9806.65; // N → tonf
  },

  _showTablesKgToMassDisp(kg) {
    const u = window.cadUnits;
    return u?.massKgToEtabsDisp ? u.massKgToEtabsDisp(Number(kg) || 0) : (Number(kg) || 0) / 9806.65;
  },

  _showTablesMassLabel() {
    return window.cadUnits?.etabsMassLabel?.() || "tonf-s²/m";
  },

  _getShowTablesAnalysisTables() {
    return (
      this.seismicResults?.etabs_results?.tables ||
      this.seismicResults?.tables ||
      null
    );
  },

  // ---- Frame Loads Assignments - Distributed (datos del modelo) ----
  _getFrameDistributedLoadsForShowTables(frame) {
    const buckets = [
      frame?.distributedLoads,
      frame?.frameLoads,
      frame?.lineLoads,
      frame?.loads,
      frame?.assignment?.frameLoads,
    ];
    const seen = new Set();
    const out = [];
    buckets.forEach((arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach((l) => {
        if (!l || String(l.type || "").trim() !== "distributed") return;
        const key =
          l.id || l.guid ||
          JSON.stringify([l.loadCase, l.startValue, l.endValue, l.direction]);
        if (seen.has(key)) return;
        seen.add(key);
        out.push(l);
      });
    });
    return out;
  },

  _buildFrameDistributedAssignmentRows() {
    const rows = [];
    (this.shapes || []).forEach((frame) => {
      const z = this._showTablesFrameTopZ(frame);
      this._getFrameDistributedLoadsForShowTables(frame).forEach((load) => {
        rows.push({
          Story: this._showTablesStoryNameByZ(z),
          Label: frame.label || frame.name || `B${frame.id}`,
          UniqueName: frame.id ?? "",
          "Load Pattern": load.loadCase || load.loadPattern || "CM",
          "Load Type": load.loadType === "moment" ? "Moment" : "Force",
          Direction: load.direction || "Gravity",
          "Distance Type": load.distanceType === "absolute" ? "Absolute" : "Relative",
          "Relative Distance A": this._numberForShowTables(load.startRelativeDistance, 0),
          "Relative Distance B": this._numberForShowTables(load.endRelativeDistance, 0),
          "Absolute Distance A": this._numberForShowTables(load.startAbsoluteDistance, 0),
          "Absolute Distance B": this._numberForShowTables(load.endAbsoluteDistance, 0),
          "Force A": this._numberForShowTables(this._showTablesNToTonf(load.startValue), 0),
          "Force B": this._numberForShowTables(this._showTablesNToTonf(load.endValue), 0),
          GUID: load.guid || load.id || "",
        });
      });
    });
    return this._sortShowTableRowsEtabsStyle(rows);
  },

  // ---- Area Load Assignments - Uniform (datos del modelo) ----
  _buildAreaUniformAssignmentRows() {
    const rows = [];
    (this.areas || []).forEach((area) => {
      const z = Number(area?.z ?? 0);
      const loads = area?.areaLoads || area?.loads || [];
      (Array.isArray(loads) ? loads : []).forEach((load) => {
        if (!load || Number(load.value) === 0) return;
        const kgfm2 = Number(load.value) || 0; // guardado en kgf/m²
        rows.push({
          Story: this._showTablesStoryNameByZ(z),
          Label: area.label || `F${area.id}`,
          UniqueName: area.id ?? "",
          "Load Pattern": load.loadCase || load.case || load.loadPattern || "CM",
          Direction: load.direction || "Gravity",
          Load: this._numberForShowTables(kgfm2 / 1000, 0), // kgf/m² → tonf/m²
          GUID: load.guid || load.id || "",
        });
      });
    });
    return this._sortShowTableRowsEtabsStyle(rows);
  },

  // ---- Mass Summary by Story (resultado del análisis) ----
  _buildMassSummaryByStoryRows() {
    const tables = this._getShowTablesAnalysisTables();
    const src = tables?.story_shears;
    if (!Array.isArray(src) || !src.length) return [];

    const byStory = new Map();
    src.forEach((r) => {
      const story = String(r?.story ?? "");
      if (!story) return;
      if (!byStory.has(story)) {
        byStory.set(story, { _z: Number(r?.z_m) || 0, Story: story, ux: 0, uy: 0, uz: 0 });
      }
      const out = byStory.get(story);
      const mass = Number(r?.mass_kg) || 0;
      const dir = String(r?.direction || "").toUpperCase();
      if (dir === "X") out.ux = mass;
      else if (dir === "Y") out.uy = mass;
      else if (dir === "Z") out.uz = mass;
    });

    return Array.from(byStory.values())
      .sort((a, b) => b._z - a._z) // piso más alto arriba
      .map(({ Story, ux, uy, uz }) => ({
        Story,
        UX: this._numberForShowTables(this._showTablesKgToMassDisp(ux), 0),
        UY: this._numberForShowTables(this._showTablesKgToMassDisp(uy), 0),
        UZ: this._numberForShowTables(this._showTablesKgToMassDisp(uz), 0),
      }));
  },

  // ---- Mass Summary by Group (resultado del análisis) ----
  _buildMassSummaryByGroupRows() {
    const storyRows = this._buildMassSummaryByStoryRows();
    if (!storyRows.length) return [];
    const sum = (k) => storyRows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
    return [
      {
        Group: "All",
        "Self Mass": 0,
        "Mass X": this._numberForShowTables(sum("UX"), 0),
        "Mass Y": this._numberForShowTables(sum("UY"), 0),
        "Mass Z": this._numberForShowTables(sum("UZ"), 0),
      },
    ];
  },

  // Tablas de resultados por caso (SDX, SDY, ...). Devuelve [{caseName, tables}].
  _getShowTablesCasesTables() {
    const out = [];
    const byCase = this.seismicResultsByCase;
    if (byCase && typeof byCase === "object") {
      Object.values(byCase).forEach((res) => {
        const t = res?.etabs_results?.tables;
        if (t) out.push({ caseName: res?._caseName || res?.caseName || "SPEC", tables: t });
      });
    }
    if (!out.length) {
      const t = this._getShowTablesAnalysisTables();
      if (t) out.push({ caseName: this.seismicResults?._caseName || "SPEC", tables: t });
    }
    return out;
  },

  // ---- Modal Periods and Frequencies (independiente del caso) ----
  _buildModalPeriodsAndFreqRows() {
    const src = this._getShowTablesAnalysisTables()?.modal_periods;
    if (!Array.isArray(src) || !src.length) return [];
    return src.map((r) => ({
      Case: r.case || "Modal",
      Mode: r.mode ?? "",
      Period: this._numberForShowTables(r.period_s, 0),
      Frequency: this._numberForShowTables(r.frequency_hz, 0),
      CircFreq: this._numberForShowTables(r.omega_rad_s, 0),
      Eigenvalue: this._numberForShowTables(r.eigenvalue_rad2_s2, 0),
    }));
  },

  // ---- Modal Participating Mass Ratios (independiente del caso) ----
  _buildModalParticipatingMassRows() {
    const src = this._getShowTablesAnalysisTables()?.participating_mass_ratios;
    if (!Array.isArray(src) || !src.length) return [];
    const n = (v) => this._numberForShowTables(v, 0);
    return src.map((r) => ({
      Case: r.case || "Modal",
      Mode: r.mode ?? "",
      Period: n(r.period_s),
      UX: n(r.ux), UY: n(r.uy), UZ: n(r.uz),
      SumUX: n(r.sum_ux), SumUY: n(r.sum_uy), SumUZ: n(r.sum_uz),
      RX: n(r.rx), RY: n(r.ry), RZ: n(r.rz),
      SumRX: n(r.sum_rx), SumRY: n(r.sum_ry), SumRZ: n(r.sum_rz),
    }));
  },

  // ---- Assembled Joint Masses (detalle por nudo; masa del análisis) ----
  _buildAssembledJointMassesRows() {
    const src = this._getShowTablesAnalysisTables()?.effective_mass;
    if (!Array.isArray(src) || !src.length) return [];
    const rows = src.map((r) => {
      const node = this._showTablesResolveNode(r?.node);
      const x = Number(node?.position?.x ?? node?.x ?? 0);
      const y = Number(node?.position?.y ?? node?.y ?? 0);
      const z = Number(node?.position?.z ?? node?.z ?? 0);
      return {
        _z: z,
        Story: this._showTablesStoryNameByZ(z),
        Label: r?.node ?? "",
        "Point Element": r?.node ?? "",
        UX: this._numberForShowTables(this._showTablesKgToMassDisp(r?.effective_mx_kg), 0),
        UY: this._numberForShowTables(this._showTablesKgToMassDisp(r?.effective_my_kg), 0),
        UZ: this._numberForShowTables(this._showTablesKgToMassDisp(r?.effective_mz_kg), 0),
        RX: 0, RY: 0, RZ: 0,
        X: this._numberForShowTables(x, 0),
        Y: this._numberForShowTables(y, 0),
        Z: this._numberForShowTables(z, 0),
      };
    });
    return rows.sort((a, b) => b._z - a._z).map(({ _z, ...row }) => row);
  },

  // ---- Story Drifts (por caso: SDX, SDY) ----
  _buildStoryDriftsShowRows() {
    const rows = [];
    this._getShowTablesCasesTables().forEach(({ caseName, tables }) => {
      const src = tables?.story_drifts;
      if (!Array.isArray(src)) return;
      src.forEach((r) => {
        const ratio = Number(r?.drift_ratio) || 0;
        rows.push({
          _z: Number(r?.z_m) || 0,
          Story: r?.story ?? "",
          "Output Case": caseName,
          "Case Type": "LinRespSpec",
          "Step Type": "Max",
          Direction: String(r?.direction || "").toUpperCase(),
          Drift: this._numberForShowTables(ratio, 0),
          "Drift/": ratio > 0 ? `1/${Math.round(1 / ratio)}` : "",
          Z: this._numberForShowTables(r?.z_m, 0),
        });
      });
    });
    return rows
      .sort(
        (a, b) =>
          b._z - a._z ||
          String(a["Output Case"]).localeCompare(String(b["Output Case"])) ||
          String(a.Direction).localeCompare(String(b.Direction))
      )
      .map(({ _z, ...row }) => row);
  },

  // ---- Base Reactions (por caso). Motor A entrega FX/FY; momentos pendientes. ----
  _buildBaseReactionsShowRows() {
    const rows = [];
    this._getShowTablesCasesTables().forEach(({ caseName, tables }) => {
      const bs = tables?.base_shear;
      if (!Array.isArray(bs) || !bs.length) return;
      const findN = (dir) =>
        Number(bs.find((r) => String(r?.direction || "").toUpperCase() === dir)?.base_shear_N) || 0;
      rows.push({
        "Output Case": caseName,
        "Case Type": "LinRespSpec",
        "Step Type": "Max",
        FX: this._numberForShowTables(this._showTablesNToTonf(findN("X")), 0),
        FY: this._numberForShowTables(this._showTablesNToTonf(findN("Y")), 0),
        FZ: 0,
        MX: 0,
        MY: 0,
        MZ: 0,
      });
    });
    return rows;
  },

  // ---- Joint Reactions / Joint Design Reactions (por caso, del backend) ----
  _buildJointReactionsShowRows() {
    const rows = [];
    this._getShowTablesCasesTables().forEach(({ caseName, tables }) => {
      const src = tables?.joint_reactions;
      if (!Array.isArray(src)) return;
      src.forEach((r) => {
        const node = this._showTablesResolveNode(r?.node);
        const z = Number(node?.position?.z ?? node?.z ?? 0);
        rows.push({
          _z: z,
          Story: this._showTablesStoryNameByZ(z),
          Label: r?.node ?? "",
          "Unique Name": r?.node ?? "",
          "Output Case": caseName,
          "Case Type": "LinRespSpec",
          "Step Type": "Max",
          FX: this._numberForShowTables(this._showTablesNToTonf(r?.fx_N), 0),
          FY: this._numberForShowTables(this._showTablesNToTonf(r?.fy_N), 0),
          FZ: this._numberForShowTables(this._showTablesNToTonf(r?.fz_N), 0),
          MX: this._numberForShowTables(this._showTablesNToTonf(r?.mx_Nm), 0),
          MY: this._numberForShowTables(this._showTablesNToTonf(r?.my_Nm), 0),
          MZ: this._numberForShowTables(this._showTablesNToTonf(r?.mz_Nm), 0),
        });
      });
    });
    return rows
      .sort(
        (a, b) =>
          b._z - a._z ||
          String(a["Output Case"]).localeCompare(String(b["Output Case"])) ||
          (Number(a.Label) || 0) - (Number(b.Label) || 0)
      )
      .map(({ _z, ...row }) => row);
  },

  // ---- Story Accelerations (por caso, del backend; UX/UY, resto 0) ----
  _buildStoryAccelerationsShowRows() {
    const rows = [];
    this._getShowTablesCasesTables().forEach(({ caseName, tables }) => {
      const src = tables?.story_accelerations;
      if (!Array.isArray(src)) return;
      src.forEach((r) => {
        rows.push({
          _z: Number(r?.z_m) || 0,
          Story: r?.story ?? "",
          "Output Case": caseName,
          "Case Type": "LinRespSpec",
          "Step Type": "Max",
          UX: this._numberForShowTables(r?.ux, 0),
          UY: this._numberForShowTables(r?.uy, 0),
          UZ: this._numberForShowTables(r?.uz, 0),
          RX: this._numberForShowTables(r?.rx, 0),
          RY: this._numberForShowTables(r?.ry, 0),
          RZ: this._numberForShowTables(r?.rz, 0),
        });
      });
    });
    return rows
      .sort(
        (a, b) =>
          b._z - a._z || String(a["Output Case"]).localeCompare(String(b["Output Case"]))
      )
      .map(({ _z, ...row }) => row);
  },

  // ---- Centers of Mass and Rigidity (ETABS: Structure Output > Other Output
  // Items). El CM es igual para todos los casos (misma masa) → se toma del
  // primer caso que tenga la tabla. XCR/YCR aún no se calculan (vacíos).
  _buildCentersOfMassRigidityShowRows() {
    const cases = this._getShowTablesCasesTables();
    for (const { tables } of cases) {
      const src = tables?.centers_of_mass_rigidity;
      if (Array.isArray(src) && src.length) {
        return src.map((r) => ({
          Story: r?.story ?? "",
          Diaphragm: r?.diaphragm ?? "",
          "Mass X": this._numberForShowTables(r?.mass_x_kg, 0),
          "Mass Y": this._numberForShowTables(r?.mass_y_kg, 0),
          XCM: this._numberForShowTables(r?.xcm_m, 0),
          YCM: this._numberForShowTables(r?.ycm_m, 0),
          "Cum Mass X": this._numberForShowTables(r?.cum_mass_x_kg, 0),
          "Cum Mass Y": this._numberForShowTables(r?.cum_mass_y_kg, 0),
          XCCM: this._numberForShowTables(r?.xccm_m, 0),
          YCCM: this._numberForShowTables(r?.yccm_m, 0),
          XCR: r?.xcr_m ?? "",
          YCR: r?.ycr_m ?? "",
        }));
      }
    }
    return [];
  },

  _getModelShowTableDefinitions(options = {}) {
    const massLabel = this._showTablesMassLabel();
    const reactionCols = [
      "Story", "Label", "Unique Name", "Output Case", "Case Type", "Step Type",
      "FX", "FY", "FZ", "MX", "MY", "MZ",
    ];
    const reactionUnits = {
      Story: "", Label: "", "Unique Name": "", "Output Case": "", "Case Type": "", "Step Type": "",
      FX: "tonf", FY: "tonf", FZ: "tonf", MX: "tonf-m", MY: "tonf-m", MZ: "tonf-m",
    };

    return [
      {
        id: "joint_assignments_summary",
        label: "Joint Assignments - Summary",

        columns: [
          "Story",
          "Label",
          "UniqueName",
          "Diaphragm",
          "Restraints",
        ],

        units: {
          Story: "",
          Label: "",
          UniqueName: "",
          Diaphragm: "",
          Restraints: "",
        },

        rows: this._buildJointAssignmentSummaryRows(options),
      },
      {
        id: "joint_assignments_restraints",
        label: "Joint Assignments - Restraints",

        columns: [
          "Story",
          "Label",
          "UniqueName",
          "UX",
          "UY",
          "UZ",
          "RX",
          "RY",
          "RZ",
        ],

        units: {
          Story: "",
          Label: "",
          UniqueName: "",
          UX: "",
          UY: "",
          UZ: "",
          RX: "",
          RY: "",
          RZ: "",
        },

        rows: this._buildJointRestraintAssignmentRows(options),
      },
      {
        id: "joint_loads_force",
        label: "Joint Loads Assignments - Force",
        columns: [
          "Story",
          "Label",
          "UniqueName",
          "Load Pattern",
          "FX",
          "FY",
          "FZ",
          "MX",
          "MY",
          "MZ",
          "X Dimension",
          "Y Dimension",
          "GUID",
        ],
        units: {
          Story: "",
          Label: "",
          UniqueName: "",
          "Load Pattern": "",
          FX: "tonf",
          FY: "tonf",
          FZ: "tonf",
          MX: "tonf-m",
          MY: "tonf-m",
          MZ: "tonf-m",
          "X Dimension": "m",
          "Y Dimension": "m",
          GUID: "",
        },
        rows: this._buildJointForceAssignmentRows(options),
      },
      {
        id: "joint_loads_ground_displacement",
        label: "Joint Loads Assignments - Ground Displacement",
        columns: [
          "Story",
          "Label",
          "UniqueName",
          "Load Pattern",
          "UX",
          "UY",
          "UZ",
          "RX",
          "RY",
          "RZ",
          "GUID",
        ],
        units: {
          Story: "",
          Label: "",
          UniqueName: "",
          "Load Pattern": "",
          UX: "m",
          UY: "m",
          UZ: "m",
          RX: "rad",
          RY: "rad",
          RZ: "rad",
          GUID: "",
        },
        rows: this._buildJointGroundDisplacementAssignmentRows(options),
      },
      {
        id: "joint_loads_temperature",
        label: "Joint Loads Assignments - Temperature",
        columns: [
          "Story",
          "Label",
          "UniqueName",
          "Load Pattern",
          "T",
          "GUID",
        ],
        units: {
          Story: "",
          Label: "",
          UniqueName: "",
          "Load Pattern": "",
          T: "C",
          GUID: "",
        },
        rows: this._buildJointTemperatureAssignmentRows(options),
      },
      {
        id: "mass_summary_story",
        label: "Mass Summary by Story",
        columns: ["Story", "UX", "UY", "UZ"],
        units: { Story: "", UX: massLabel, UY: massLabel, UZ: massLabel },
        rows: this._buildMassSummaryByStoryRows(),
      },
      {
        id: "mass_summary_group",
        label: "Mass Summary by Group",
        columns: ["Group", "Self Mass", "Mass X", "Mass Y", "Mass Z"],
        units: {
          Group: "",
          "Self Mass": massLabel,
          "Mass X": massLabel,
          "Mass Y": massLabel,
          "Mass Z": massLabel,
        },
        rows: this._buildMassSummaryByGroupRows(),
      },
      {
        id: "frame_loads_distributed",
        label: "Frame Loads Assignments - Distributed",
        columns: [
          "Story",
          "Label",
          "UniqueName",
          "Load Pattern",
          "Load Type",
          "Direction",
          "Distance Type",
          "Relative Distance A",
          "Relative Distance B",
          "Absolute Distance A",
          "Absolute Distance B",
          "Force A",
          "Force B",
          "GUID",
        ],
        units: {
          Story: "",
          Label: "",
          UniqueName: "",
          "Load Pattern": "",
          "Load Type": "",
          Direction: "",
          "Distance Type": "",
          "Relative Distance A": "",
          "Relative Distance B": "",
          "Absolute Distance A": "m",
          "Absolute Distance B": "m",
          "Force A": "tonf/m",
          "Force B": "tonf/m",
          GUID: "",
        },
        rows: this._buildFrameDistributedAssignmentRows(),
      },
      {
        id: "area_loads_uniform",
        label: "Area Load Assignments - Uniform",
        columns: ["Story", "Label", "UniqueName", "Load Pattern", "Direction", "Load", "GUID"],
        units: {
          Story: "",
          Label: "",
          UniqueName: "",
          "Load Pattern": "",
          Direction: "",
          Load: "tonf/m²",
          GUID: "",
        },
        rows: this._buildAreaUniformAssignmentRows(),
      },
      // ================= ANALYSIS RESULTS =================
      {
        id: "modal_periods_freq",
        label: "Modal Periods And Frequencies",
        columns: ["Case", "Mode", "Period", "Frequency", "CircFreq", "Eigenvalue"],
        units: {
          Case: "", Mode: "", Period: "sec", Frequency: "cyc/sec",
          CircFreq: "rad/sec", Eigenvalue: "rad²/sec²",
        },
        rows: this._buildModalPeriodsAndFreqRows(),
      },
      {
        id: "modal_participating_mass",
        label: "Modal Participating Mass Ratios",
        columns: [
          "Case", "Mode", "Period", "UX", "UY", "UZ",
          "SumUX", "SumUY", "SumUZ", "RX", "RY", "RZ", "SumRX", "SumRY", "SumRZ",
        ],
        units: { Case: "", Mode: "", Period: "sec" },
        rows: this._buildModalParticipatingMassRows(),
      },
      {
        id: "assembled_joint_masses",
        label: "Assembled Joint Masses",
        columns: [
          "Story", "Label", "Point Element", "UX", "UY", "UZ",
          "RX", "RY", "RZ", "X", "Y", "Z",
        ],
        units: {
          Story: "", Label: "", "Point Element": "",
          UX: massLabel, UY: massLabel, UZ: massLabel,
          RX: "tonf-m-s²", RY: "tonf-m-s²", RZ: "tonf-m-s²",
          X: "m", Y: "m", Z: "m",
        },
        rows: this._buildAssembledJointMassesRows(),
      },
      {
        id: "story_drifts_result",
        label: "Story Drifts",
        columns: [
          "Story", "Output Case", "Case Type", "Step Type", "Direction", "Drift", "Drift/", "Z",
        ],
        units: {
          Story: "", "Output Case": "", "Case Type": "", "Step Type": "",
          Direction: "", Drift: "", "Drift/": "", Z: "m",
        },
        rows: this._buildStoryDriftsShowRows(),
      },
      {
        id: "base_reactions_result",
        label: "Base Reactions",
        columns: [
          "Output Case", "Case Type", "Step Type", "FX", "FY", "FZ", "MX", "MY", "MZ",
        ],
        units: {
          "Output Case": "", "Case Type": "", "Step Type": "",
          FX: "tonf", FY: "tonf", FZ: "tonf",
          MX: "tonf-m", MY: "tonf-m", MZ: "tonf-m",
        },
        rows: this._buildBaseReactionsShowRows(),
      },
      {
        id: "joint_reactions_result",
        label: "Joint Reactions",
        columns: reactionCols,
        units: reactionUnits,
        rows: this._buildJointReactionsShowRows(),
      },
      {
        id: "joint_design_reactions_result",
        label: "Joint Design Reactions",
        columns: reactionCols,
        units: reactionUnits,
        rows: this._buildJointReactionsShowRows(),
      },
      {
        id: "story_accelerations_result",
        label: "Story Accelerations",
        columns: [
          "Story", "Output Case", "Case Type", "Step Type", "UX", "UY", "UZ", "RX", "RY", "RZ",
        ],
        units: {
          Story: "", "Output Case": "", "Case Type": "", "Step Type": "",
          UX: "m/sec²", UY: "m/sec²", UZ: "m/sec²",
          RX: "rad/sec²", RY: "rad/sec²", RZ: "rad/sec²",
        },
        rows: this._buildStoryAccelerationsShowRows(),
      },
      {
        id: "centers_mass_rigidity",
        label: "Centers Of Mass And Rigidity",
        columns: [
          "Story", "Diaphragm", "Mass X", "Mass Y", "XCM", "YCM",
          "Cum Mass X", "Cum Mass Y", "XCCM", "YCCM", "XCR", "YCR",
        ],
        units: {
          Story: "", Diaphragm: "",
          "Mass X": "kg", "Mass Y": "kg", XCM: "m", YCM: "m",
          "Cum Mass X": "kg", "Cum Mass Y": "kg", XCCM: "m", YCCM: "m",
          XCR: "m", YCR: "m",
        },
        rows: this._buildCentersOfMassRigidityShowRows(),
      },
    ];
  },

  _buildModelShowTableHtml(tableDef) {
    const columns = tableDef.columns || [];
    const units = tableDef.units || {};
    const rows = tableDef.rows || [];

    const headerHtml = columns
      .map((column) => {
        return `
        <th style="
          position:sticky;
          top:0;
          z-index:3;
          background:#111827;
          color:#e5e7eb;
          border:1px solid #334155;
          padding:6px 8px;
          white-space:nowrap;
          text-align:center;
          font-weight:600;
        ">
          ${this._escapeShowTablesHtml(column)}
        </th>
      `;
      })
      .join("");

    const unitHtml = `
    <tr style="background:#1e293b;">
      ${columns
        .map((column) => {
          return `
            <td style="
              border:1px solid #334155;
              padding:5px 8px;
              white-space:nowrap;
              color:#facc15;
              text-align:center;
              font-size:11px;
              font-weight:600;
            ">
              ${this._escapeShowTablesHtml(units[column] || "")}
            </td>
          `;
        })
        .join("")}
    </tr>
  `;

    const bodyHtml = rows.length
      ? rows
        .map((row, rowIndex) => {
          const bg = rowIndex % 2 === 0 ? "#020617" : "#0f172a";

          return `
            <tr style="background:${bg};">
              ${columns
              .map((column) => {
                const value = row?.[column];

                return `
                    <td style="
                      border:1px solid #334155;
                      padding:5px 8px;
                      white-space:nowrap;
                      color:#dbeafe;
                      text-align:${typeof value === "number" ? "right" : "left"};
                    ">
                      ${this._escapeShowTablesHtml(this._formatShowTablesCellValue(value))}
                    </td>
                  `;
              })
              .join("")}
            </tr>
          `;
        })
        .join("")
      : `
      <tr>
        <td colspan="${columns.length}" style="
          border:1px solid #334155;
          padding:18px;
          color:#94a3b8;
          text-align:center;
        ">
          No hay datos para mostrar en esta tabla.
        </td>
      </tr>
    `;

    return `
    <div style="
      max-height:440px;
      overflow:auto;
      border:1px solid #334155;
      border-radius:6px;
      background:#020617;
    ">
      <table style="
        width:100%;
        border-collapse:collapse;
        font-size:12px;
        font-family:Consolas, monospace;
      ">
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${unitHtml}
          ${bodyHtml}
        </tbody>
      </table>
    </div>
  `;
  },

  getShowTablesTheme() {
    const custom = this.showTablesTheme || {};

    return {
      modalBg: custom.modalBg || "#1a2035",
      modalText: custom.modalText || "#e2e8f0",

      panelBg: custom.panelBg || "#0f172a",
      panelBgAlt: custom.panelBgAlt || "#111827",

      treeBg: custom.treeBg || "#0f172a",
      treeText: custom.treeText || "#e2e8f0",
      treeMuted: custom.treeMuted || "#94a3b8",
      treeBorder: custom.treeBorder || "#475569",

      legendText: custom.legendText || "#7eb8f7",

      buttonBg: custom.buttonBg || "#1e293b",
      buttonDisabledBg: custom.buttonDisabledBg || "#111827",
      buttonDisabledText: custom.buttonDisabledText || "#64748b",

      checkboxAccent: custom.checkboxAccent || "#22c55e",
      checkboxAccentHover: custom.checkboxAccentHover || "#38bdf8",
      checkboxDisabled: custom.checkboxDisabled || "#64748b",

      pendingBg: custom.pendingBg || "#334155",
      pendingText: custom.pendingText || "#cbd5e1",
    };
  },

  _getShowTablesTreeDefinition() {
    return [
      {
        id: "model_definition",
        label: "MODEL DEFINITION",
        type: "group",
        expanded: true,
        children: [
          { id: "system_data", label: "System Data", pending: true },
          { id: "property_definitions", label: "Property Definitions", pending: true },
          { id: "load_pattern_definitions", label: "Load Pattern Definitions", pending: true },
          {
            id: "other_definitions",
            label: "Other Definitions",
            type: "group",
            expanded: true,
            children: [
              { id: "group_data", label: "Group Data", pending: true },
              {
                id: "mass_data",
                label: "Mass Data",
                type: "group",
                expanded: true,
                children: [
                  {
                    id: "mass_summary_story_node",
                    label: "Table: Mass Summary by Story",
                    tableId: "mass_summary_story",
                  },
                  {
                    id: "mass_summary_group_node",
                    label: "Table: Mass Summary by Group",
                    tableId: "mass_summary_group",
                  },
                ],
              },
              { id: "miscellaneous", label: "Miscellaneous", pending: true },
            ],
          },
          { id: "load_case_definitions", label: "Load Case Definitions", pending: true },
          { id: "connectivity_data", label: "Connectivity Data", pending: true },

          {
            id: "joint_assignments",
            label: "Joint Assignments",
            type: "group",
            expanded: true,
            children: [
              {
                id: "joint_item_assignments",
                label: "Joint Item Assignments",
                type: "group",
                expanded: true,
                children: [
                  {
                    id: "joint_assignments_summary_node",
                    label: "Table: Joint Assignments - Summary",
                    tableId: "joint_assignments_summary",
                  },
                  {
                    id: "joint_assignments_restraints_node",
                    label: "Table: Joint Assignments - Restraints",
                    tableId: "joint_assignments_restraints",
                  },
                ],
              },

              {
                id: "joint_load_assignments",
                label: "Joint Load Assignments",
                type: "group",
                expanded: true,
                children: [
                  {
                    id: "joint_loads_force_node",
                    label: "Table: Joint Loads Assignments - Force",
                    tableId: "joint_loads_force",
                  },
                  {
                    id: "joint_loads_ground_displacement_node",
                    label: "Table: Joint Loads Assignments - Ground Displacement",
                    tableId: "joint_loads_ground_displacement",
                  },
                  {
                    id: "joint_loads_temperature_node",
                    label: "Table: Joint Loads Assignments - Temperature",
                    tableId: "joint_loads_temperature",
                  },
                ],
              },
            ],
          },

          {
            id: "frame_assignments",
            label: "Frame Assignments",
            type: "group",
            expanded: true,
            children: [
              { id: "frame_item_assignments", label: "Frame Item Assignments", pending: true },
              {
                id: "frame_load_assignments",
                label: "Frame Load Assignments",
                type: "group",
                expanded: true,
                children: [
                  {
                    id: "frame_loads_distributed_node",
                    label: "Table: Frame Loads Assignments - Distributed",
                    tableId: "frame_loads_distributed",
                  },
                  {
                    id: "frame_loads_wind_node",
                    label: "Table: Frame Loads Assignments - Open Structure Wind Parameters",
                    pending: true,
                  },
                ],
              },
            ],
          },
          {
            id: "area_assignments",
            label: "Area Assignments",
            type: "group",
            expanded: true,
            children: [
              { id: "area_item_assignments", label: "Area Item Assignments", pending: true },
              {
                id: "area_load_assignments",
                label: "Area Load Assignments",
                type: "group",
                expanded: true,
                children: [
                  {
                    id: "area_loads_uniform_node",
                    label: "Table: Area Load Assignments - Uniform",
                    tableId: "area_loads_uniform",
                  },
                ],
              },
            ],
          },
          { id: "options_preferences_data", label: "Options and Preferences Data", pending: true },
          { id: "miscellaneous_data", label: "Miscellaneous Data", pending: true },
        ],
      },

      {
        id: "analysis_results",
        label: "ANALYSIS RESULTS",
        type: "group",
        expanded: true,
        children: [
          { id: "run_information", label: "Run Information", pending: true },
          {
            id: "joint_output",
            label: "Joint Output",
            type: "group",
            expanded: true,
            children: [
              {
                id: "joint_output_displacements",
                label: "Displacements",
                type: "group",
                expanded: true,
                children: [
                  { id: "joint_displacements_node", label: "Table: Joint Displacements", pending: true },
                  { id: "story_drifts_node", label: "Table: Story Drifts", tableId: "story_drifts_result" },
                  { id: "story_max_avg_disp_node", label: "Table: Story Max Over Avg Displacements", pending: true },
                ],
              },
              {
                id: "joint_output_reactions",
                label: "Reactions",
                type: "group",
                expanded: true,
                children: [
                  { id: "joint_reactions_node", label: "Table: Joint Reactions", tableId: "joint_reactions_result" },
                  { id: "joint_design_reactions_node", label: "Table: Joint Design Reactions", tableId: "joint_design_reactions_result" },
                ],
              },
              {
                id: "joint_output_velacc",
                label: "Velocity and Acceleration",
                type: "group",
                expanded: true,
                children: [
                  { id: "story_accelerations_node", label: "Table: Story Accelerations", tableId: "story_accelerations_result" },
                ],
              },
              {
                id: "joint_output_masses",
                label: "Joint Masses",
                type: "group",
                expanded: true,
                children: [
                  { id: "assembled_joint_masses_node", label: "Table: Assembled Joint Masses", tableId: "assembled_joint_masses" },
                ],
              },
            ],
          },
          { id: "element_output", label: "Element Output", pending: true },
          {
            id: "structure_output",
            label: "Structure Output",
            type: "group",
            expanded: true,
            children: [
              {
                id: "base_reactions_group",
                label: "Base Reactions",
                type: "group",
                expanded: true,
                children: [
                  { id: "base_reactions_node", label: "Table: Base Reactions", tableId: "base_reactions_result" },
                ],
              },
              {
                id: "modal_information",
                label: "Modal Information",
                type: "group",
                expanded: true,
                children: [
                  { id: "modal_periods_node", label: "Table: Modal Periods And Frequencies", tableId: "modal_periods_freq" },
                  { id: "modal_participating_node", label: "Table: Modal Participating Mass Ratios", tableId: "modal_participating_mass" },
                  { id: "response_spectrum_modal_info_node", label: "Table: Response Spectrum Modal Info", pending: true },
                ],
              },
              {
                id: "other_output_items",
                label: "Other Output Items",
                type: "group",
                expanded: true,
                children: [
                  {
                    id: "centers_mass_rigidity_node",
                    label: "Table: Centers Of Mass And Rigidity",
                    tableId: "centers_mass_rigidity",
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        id: "design_data",
        label: "DESIGN DATA",
        type: "group",
        expanded: true,
        children: [
          { id: "design_definition_data", label: "Design Definition Data", pending: true },
        ],
      },
    ];
  },

  _getShowTablesTreeTableIds(node) {
    if (!node) return [];

    if (node.tableId) {
      return [node.tableId];
    }

    if (!Array.isArray(node.children)) {
      return [];
    }

    return node.children.flatMap((child) => this._getShowTablesTreeTableIds(child));
  },

  _buildShowTablesTreeHtml(nodes = [], tableById = new Map(), depth = 0) {
    const theme = this.getShowTablesTheme();

    return nodes
      .map((node) => {
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const tableIds = this._getShowTablesTreeTableIds(node);
        const implementedIds = tableIds.filter((id) => tableById.has(id));
        const isGroup = hasChildren;
        const isImplementedLeaf = Boolean(node.tableId && tableById.has(node.tableId));
        const table = node.tableId ? tableById.get(node.tableId) : null;
        const rowCount = table?.rows?.length || 0;

        const disabled = isGroup
          ? implementedIds.length === 0
          : !isImplementedLeaf;

        const checkboxClass = isGroup ? "show-table-group-check" : "show-table-check";
        // Como ETABS: el diálogo abre SIN tablas marcadas — el usuario elige
        // exactamente qué quiere ver.
        const checked = "";
        // Compacto: solo los grupos raíz (MODEL DEFINITION / ANALYSIS RESULTS /
        // DESIGN DATA) abren expandidos; los subgrupos se expanden a demanda.
        const collapsed = node.expanded === false || depth >= 1;
        const pendingBadge = !isGroup && !isImplementedLeaf
          ? `<span style="
             margin-left:6px;
             padding:1px 5px;
             border-radius:4px;
             background:${theme.pendingBg};
             color:${theme.pendingText};
             font-size:10px;
           ">Pendiente</span>`
          : "";

        const rowCounter = isImplementedLeaf
          ? `<span style="
             margin-left:auto;
             color:${rowCount > 0 ? "#15803d" : "#64748b"};
             font-size:11px;
             font-family:Consolas, monospace;
           ">${rowCount} filas</span>`
          : "";

        const expander = hasChildren
          ? `<button
             type="button"
             class="show-table-tree-expander"
             data-target="${node.id}"
             style="
               width:16px;
               height:16px;
               line-height:12px;
               padding:0;
               border:1px solid ${theme.treeBorder};
               background:${theme.panelBgAlt};
               color:${theme.modalText};
               cursor:pointer;
               font-size:11px;
             "
           >${collapsed ? "+" : "−"}</button>`
          : `<span style="width:16px; display:inline-block;"></span>`;

        const checkbox = `
        <input
          type="checkbox"
          class="${checkboxClass}"
          ${isGroup ? `data-group-id="${node.id}"` : `value="${node.tableId || ""}" data-table-id="${node.tableId || ""}"`}
          data-row-count="${rowCount}"
          data-pending="${disabled ? "1" : "0"}"
          ${checked}
          ${disabled ? "disabled" : ""}
        >
      `;

        const childrenHtml = hasChildren
          ? `<div
             class="show-table-tree-children"
             data-parent="${node.id}"
             style="display:${collapsed ? "none" : "block"};"
           >
             ${this._buildShowTablesTreeHtml(node.children, tableById, depth + 1)}
           </div>`
          : "";

        return `
        <div class="show-table-tree-node" data-node="${node.id}">
          <div style="
            display:flex;
            align-items:center;
            gap:4px;
            min-height:16px;
            padding:1px 3px;
            padding-left:${depth * 14 + 3}px;
            color:${disabled ? "#64748b" : theme.treeText};
            font-size:11px;
            white-space:nowrap;
          ">
            ${expander}
            ${checkbox}
            <span style="${depth === 0 ? "font-weight:700;" : ""}">
              ${this._escapeShowTablesHtml(node.label)}
            </span>
            ${pendingBadge}
            ${rowCounter}
          </div>

          ${childrenHtml}
        </div>
      `;
      })
      .join("");
  },

  async openShowTablesDialog() {
    const initialOptions = {
      selectionOnly: false,
      showIfUsedInModel: true,
      showUnformatted: true,
    };

    const tableDefs = this._getModelShowTableDefinitions(initialOptions);
    const tableById = new Map(tableDefs.map((table) => [table.id, table]));
    const tree = this._getShowTablesTreeDefinition();
    const theme = this.getShowTablesTheme();

    const loadPatternsCount =
      typeof this.getAvailableLoadCasesForAssign === "function"
        ? this.getAvailableLoadCasesForAssign().length
        : 0;

    const result = await Swal.fire({
      title: "Choose Tables for Display",
      width: 900,
      background: theme.modalBg,
      color: theme.modalText,
      customClass: {
        popup: "show-tables-dark-popup",
        title: "show-tables-dark-title",
        htmlContainer: "show-tables-dark-html",
        actions: "show-tables-dark-actions",
        confirmButton: "show-tables-dark-confirm",
        cancelButton: "show-tables-dark-cancel",
      },
      html: `
      <style>
        .show-tables-dark-popup {
          background: ${theme.modalBg} !important;
          color: ${theme.modalText} !important;
          border: 1px solid ${theme.treeBorder} !important;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55) !important;
        }

        .show-tables-dark-title {
          color: ${theme.modalText} !important;
          font-weight: 700 !important;
        }

        .show-tables-dark-html {
          color: ${theme.modalText} !important;
        }

        .show-tables-dark-actions {
          background: ${theme.modalBg} !important;
        }

        .show-tables-dark-confirm {
          background: #2563eb !important;
          color: #ffffff !important;
          border-radius: 5px !important;
        }

        .show-tables-dark-cancel {
          background: #64748b !important;
          color: #ffffff !important;
          border-radius: 5px !important;
        }

        .show-table-check,
        .show-table-group-check,
        .show-table-option-check {
          appearance: none !important;
          -webkit-appearance: none !important;
          width: 15px !important;
          height: 15px !important;
          min-width: 15px !important;
          border: 1px solid ${theme.treeBorder} !important;
          background: ${theme.panelBgAlt} !important;
          cursor: pointer !important;
          position: relative !important;
          margin: 0 !important;
          padding: 0 !important;
          vertical-align: middle !important;
        }

        .show-table-check:checked,
        .show-table-group-check:checked,
        .show-table-option-check:checked {
          background: ${theme.checkboxAccent} !important;
          border-color: ${theme.checkboxAccent} !important;
        }

        .show-table-check:checked::after,
        .show-table-group-check:checked::after,
        .show-table-option-check:checked::after {
          content: "✓";
          position: absolute;
          left: 2px;
          top: -3px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          line-height: 15px;
        }

        .show-table-group-check:indeterminate {
          background: ${theme.checkboxAccentHover} !important;
          border-color: ${theme.checkboxAccentHover} !important;
        }

        .show-table-group-check:indeterminate::after {
          content: "–";
          position: absolute;
          left: 3px;
          top: -4px;
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          line-height: 15px;
        }

        .show-table-check:hover:not(:disabled),
        .show-table-group-check:hover:not(:disabled),
        .show-table-option-check:hover:not(:disabled) {
          border-color: ${theme.checkboxAccentHover} !important;
        }

        .show-table-check:disabled,
        .show-table-group-check:disabled,
        .show-table-option-check:disabled {
          background: ${theme.buttonDisabledBg} !important;
          border-color: ${theme.checkboxDisabled} !important;
          cursor: not-allowed !important;
          opacity: 0.75 !important;
        }

        .show-table-tree-node button:hover {
          background: ${theme.buttonHoverBg} !important;
        }
      </style>  

      <div style="
        text-align:left;
        font-family:Arial, sans-serif;
        font-size:12px;
        color:${theme.modalText};
      ">
        <div style="margin-bottom:8px; color:${theme.modalText};">
          <span style="text-decoration:underline; cursor:default;">Edit</span>
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 190px;
          gap:8px;
          min-height:470px;
        ">
          <div style="
            border:1px solid ${theme.treeBorder};
            background:${theme.treeBg};
            overflow:auto;
            padding:4px;
            border-radius:4px;
          ">
            ${this._buildShowTablesTreeHtml(tree, tableById)}
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
              <fieldset style="
                border:1px solid ${theme.treeBorder};
                padding:8px;
                background:${theme.panelBg};
                color:${theme.modalText};
                border-radius:4px;
              ">
              <legend style="color:${theme.legendText}; font-size:12px;">
                Load Patterns (Model Def.)
              </legend>

              <button
                type="button"
                disabled
                style="
                  width:100%;
                  padding:5px 8px;
                  border:1px solid ${theme.treeBorder};
                  border-radius:3px;
                  background:${theme.buttonDisabledBg};
                  color:${theme.buttonDisabledText};
                  cursor:not-allowed;
                  font-size:12px;
                "
              >
                Select Load Patterns...
              </button>

              <div style="margin-top:6px; text-align:center; font-size:11px; color:${theme.modalText};">
                ${loadPatternsCount || 0} of ${loadPatternsCount || 0} Selected
              </div>
            </fieldset>

            <fieldset style="
              border:1px solid ${theme.treeBorder};
              padding:8px;
              background:${theme.panelBg};
              color:${theme.modalText};
              border-radius:4px;
            ">
              <legend style="color:${theme.legendText}; font-size:12px;">
                Options
              </legend>

              <label style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                <input id="show-tables-selection-only" type="checkbox" class="show-table-option-check">
                <span>Selection Only</span>
              </label>

              <label style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                <input id="show-tables-used-only" type="checkbox" class="show-table-option-check" checked>
                <span>Show if Used in Model</span>
              </label>

              <label style="display:flex; align-items:center; gap:6px;">
                <input id="show-tables-unformatted" type="checkbox" class="show-table-option-check" checked>
                <span>Show Unformatted</span>
              </label>
            </fieldset>

            <fieldset style="
              border:1px solid ${theme.treeBorder};
              padding:8px;
              background:${theme.panelBg};
              color:${theme.modalText};
              border-radius:4px;
            ">
              <legend style="color:${theme.legendText}; font-size:12px;">
                Named Sets
              </legend>

              <button
                type="button"
                disabled
                style="
                  width:100%;
                  padding:5px 8px;
                  border:1px solid ${theme.treeBorder};
                  border-radius:3px;
                  background:${theme.buttonDisabledBg};
                  color:${theme.buttonDisabledText};
                  cursor:not-allowed;
                  font-size:12px;
                "
              >
                Show Named Set...
              </button>
            </fieldset>
          </div>
        </div>

        <div style="
          display:flex;
          align-items:center;
          gap:8px;
          margin-top:6px;
          color:${theme.modalText};
        ">
        <button
          type="button"
          disabled
          style="
            padding:5px 12px;
            border:1px solid ${theme.treeBorder};
            border-radius:4px;
            background:${theme.buttonDisabledBg};
            color:${theme.buttonDisabledText};
            cursor:not-allowed;
            font-size:12px;
          "
        >
          Table Format File...
        </button>

          <span>
            Current Table Format File:
            <b>None - Program Default</b>
          </span>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",

      didOpen: () => {
        const popup = Swal.getPopup();

        const leafChecks = () =>
          Array.from(popup?.querySelectorAll(".show-table-check") || []);

        const groupChecks = () =>
          Array.from(popup?.querySelectorAll(".show-table-group-check") || []);

        const applyUsedFilter = () => {
          const usedOnly = popup?.querySelector("#show-tables-used-only")?.checked ?? true;

          leafChecks().forEach((input) => {
            const pending = input.getAttribute("data-pending") === "1";
            const rowCount = Number(input.getAttribute("data-row-count") || 0);

            if (pending) {
              input.disabled = true;
              input.checked = false;
              return;
            }

            if (usedOnly && rowCount <= 0) {
              input.disabled = true;
              input.checked = false;
              return;
            }

            input.disabled = false;
          });

          updateGroupStates();
        };

        const updateGroupStates = () => {
          groupChecks().forEach((groupInput) => {
            const groupId = groupInput.getAttribute("data-group-id");
            const container = popup?.querySelector(`[data-node="${groupId}"]`);
            const descendants = Array.from(
              container?.querySelectorAll(".show-table-check") || []
            );

            const enabled = descendants.filter((item) => !item.disabled);

            if (!enabled.length) {
              groupInput.disabled = true;
              groupInput.checked = false;
              groupInput.indeterminate = false;
              return;
            }

            const checked = enabled.filter((item) => item.checked);

            groupInput.disabled = false;
            groupInput.checked = checked.length === enabled.length;
            groupInput.indeterminate = checked.length > 0 && checked.length < enabled.length;
          });
        };

        popup?.querySelectorAll(".show-table-tree-expander").forEach((button) => {
          button.addEventListener("click", () => {
            const id = button.getAttribute("data-target");
            const children = popup?.querySelector(`[data-parent="${id}"]`);

            if (!children) return;

            const isHidden = children.style.display === "none";
            children.style.display = isHidden ? "block" : "none";
            button.textContent = isHidden ? "−" : "+";
          });
        });

        groupChecks().forEach((groupInput) => {
          groupInput.addEventListener("change", () => {
            const groupId = groupInput.getAttribute("data-group-id");
            const container = popup?.querySelector(`[data-node="${groupId}"]`);
            const descendants = Array.from(
              container?.querySelectorAll(".show-table-check") || []
            ).filter((item) => !item.disabled);

            descendants.forEach((item) => {
              item.checked = groupInput.checked;
            });

            updateGroupStates();
          });
        });

        leafChecks().forEach((input) => {
          input.addEventListener("change", updateGroupStates);
        });

        popup?.querySelector("#show-tables-used-only")?.addEventListener("change", applyUsedFilter);

        applyUsedFilter();
        updateGroupStates();
      },

      preConfirm: () => {
        const popup = Swal.getPopup();

        const selectedIds = Array.from(
          popup?.querySelectorAll(".show-table-check:checked") || []
        )
          .map((item) => item.value)
          .filter(Boolean);

        const options = {
          selectionOnly: popup?.querySelector("#show-tables-selection-only")?.checked ?? false,
          showIfUsedInModel: popup?.querySelector("#show-tables-used-only")?.checked ?? true,
          showUnformatted: popup?.querySelector("#show-tables-unformatted")?.checked ?? true,
        };

        if (!selectedIds.length) {
          Swal.showValidationMessage("Selecciona al menos una tabla disponible.");
          return false;
        }

        return {
          selectedIds,
          options,
        };
      },
    });

    if (!result.isConfirmed) return;

    await this.openEtabsStyleModelTablesDialog(
      result.value.selectedIds,
      result.value.options
    );
  },

  // ============================================================
  // EXPORTACIÓN SHOW TABLES
  // JSON / CSV / PRINT-PDF para tablas del modelo
  // ============================================================

  _buildModelShowTablesPackage(selectedTableIds = [], options = {}) {
    const allTables = this._getModelShowTableDefinitions(options);

    const selectedTables = allTables.filter((table) => {
      return selectedTableIds.includes(table.id);
    });

    return {
      type: "model_show_tables_package",
      version: "JLF-10E",
      status: "ok",
      generated_at: new Date().toISOString(),
      source: "model_definition",
      tables: selectedTables.map((table) => ({
        id: table.id,
        label: table.label,
        columns: table.columns || [],
        units: table.units || {},
        rows: table.rows || [],
        row_count: table.rows?.length || 0,
      })),
      summary: {
        selected_tables: selectedTables.length,
        total_rows: selectedTables.reduce((sum, table) => {
          return sum + (table.rows?.length || 0);
        }, 0),
      },
    };
  },

  _downloadShowTablesTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  },

  _escapeShowTablesCsvCell(value) {
    if (value === null || value === undefined) return "";

    let text = "";

    if (Array.isArray(value)) {
      text = value.join(" | ");
    } else if (typeof value === "object") {
      try {
        text = JSON.stringify(value);
      } catch (error) {
        text = String(value);
      }
    } else {
      text = String(value);
    }

    if (/[",\n\r;]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  },

  _modelShowTableToCsv(table) {
    const columns = table.columns || [];
    const units = table.units || {};
    const rows = table.rows || [];

    const lines = [];

    lines.push(`TABLE: ${this._escapeShowTablesCsvCell(table.label)}`);
    lines.push(columns.map((column) => this._escapeShowTablesCsvCell(column)).join(";"));
    lines.push(columns.map((column) => this._escapeShowTablesCsvCell(units[column] || "")).join(";"));

    if (!rows.length) {
      lines.push("Sin datos");
      return lines.join("\n");
    }

    rows.forEach((row) => {
      lines.push(
        columns
          .map((column) => this._escapeShowTablesCsvCell(row?.[column]))
          .join(";")
      );
    });

    return lines.join("\n");
  },

  _buildModelShowTablesCsv(pkg) {
    const lines = [];

    lines.push("SHOW TABLES MODEL DEFINITION");
    lines.push(`Generated At;${this._escapeShowTablesCsvCell(pkg.generated_at || "")}`);
    lines.push(`Version;${this._escapeShowTablesCsvCell(pkg.version || "")}`);
    lines.push(`Status;${this._escapeShowTablesCsvCell(pkg.status || "")}`);
    lines.push(`Selected Tables;${pkg.summary?.selected_tables || 0}`);
    lines.push(`Total Rows;${pkg.summary?.total_rows || 0}`);
    lines.push("");

    (pkg.tables || []).forEach((table) => {
      lines.push(this._modelShowTableToCsv(table));
      lines.push("");
    });

    return lines.join("\n");
  },

  _sanitizeShowTablesFileName(value = "show_tables") {
    return String(value || "show_tables")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase();
  },

  exportModelShowTablesJson(selectedTableIds = [], options = {}) {
    const pkg = this._buildModelShowTablesPackage(selectedTableIds, options);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `show_tables_model_definition_${timestamp}.json`;

    this._downloadShowTablesTextFile(
      filename,
      JSON.stringify(pkg, null, 2),
      "application/json;charset=utf-8"
    );

    this.showMessage?.("Show Tables JSON descargado.", "success");
  },

  exportModelShowTablesCsv(selectedTableIds = [], options = {}) {
    const pkg = this._buildModelShowTablesPackage(selectedTableIds, options);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `show_tables_model_definition_${timestamp}.csv`;

    this._downloadShowTablesTextFile(
      filename,
      this._buildModelShowTablesCsv(pkg),
      "text/csv;charset=utf-8"
    );

    this.showMessage?.("Show Tables CSV descargado.", "success");
  },

  _buildPrintableModelShowTableHtml(table) {
    const columns = table.columns || [];
    const units = table.units || {};
    const rows = table.rows || [];

    const header = columns
      .map((column) => `<th>${this._escapeShowTablesHtml(column)}</th>`)
      .join("");

    const unitRow = columns
      .map((column) => `<td class="unit">${this._escapeShowTablesHtml(units[column] || "")}</td>`)
      .join("");

    const body = rows.length
      ? rows
        .map((row) => {
          return `
            <tr>
              ${columns
              .map((column) => {
                return `<td>${this._escapeShowTablesHtml(
                  this._formatShowTablesCellValue(row?.[column])
                )}</td>`;
              })
              .join("")}
            </tr>
          `;
        })
        .join("")
      : `<tr><td colspan="${columns.length}" class="empty">Sin datos.</td></tr>`;

    return `
    <h2>TABLE: ${this._escapeShowTablesHtml(table.label)}</h2>

    <table>
      <thead>
        <tr>${header}</tr>
      </thead>
      <tbody>
        <tr>${unitRow}</tr>
        ${body}
      </tbody>
    </table>
  `;
  },

  _buildPrintableModelShowTablesReportHtml(selectedTableIds = [], options = {}) {
    const pkg = this._buildModelShowTablesPackage(selectedTableIds, options);

    return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Show Tables - Model Definition</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          color: #111827;
          margin: 24px;
          font-size: 12px;
        }

        h1 {
          font-size: 20px;
          margin: 0 0 4px 0;
        }

        h2 {
          font-size: 15px;
          margin: 22px 0 8px 0;
          border-bottom: 1px solid #d1d5db;
          padding-bottom: 4px;
        }

        .meta {
          color: #4b5563;
          margin-bottom: 12px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
          page-break-inside: auto;
        }

        th {
          background: #e5e7eb;
          font-weight: bold;
        }

        th, td {
          border: 1px solid #9ca3af;
          padding: 5px 6px;
          text-align: left;
          vertical-align: top;
        }

        .unit {
          color: #92400e;
          font-weight: bold;
          text-align: center;
          background: #fef3c7;
        }

        .empty {
          color: #6b7280;
          font-style: italic;
          text-align: center;
        }

        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        .note {
          margin-top: 20px;
          color: #6b7280;
          font-size: 11px;
        }

        @media print {
          body {
            margin: 12mm;
          }

          .no-print {
            display: none;
          }
        }
      </style>
    </head>

    <body>
      <button class="no-print" onclick="window.print()" style="margin-bottom:12px;">
        Imprimir / Guardar como PDF
      </button>

      <h1>Show Tables - Model Definition</h1>

      <div class="meta">
        Paquete: ${this._escapeShowTablesHtml(pkg.type)} |
        Versión: ${this._escapeShowTablesHtml(pkg.version)} |
        Estado: ${this._escapeShowTablesHtml(pkg.status)}<br>
        Generado: ${this._escapeShowTablesHtml(pkg.generated_at)}<br>
        Tablas: ${pkg.summary.selected_tables} |
        Filas totales: ${pkg.summary.total_rows}
      </div>

      ${(pkg.tables || [])
        .map((table) => this._buildPrintableModelShowTableHtml(table))
        .join("")}

      <div class="note">
        Reporte generado desde las asignaciones guardadas en el modelo actual:
        node.pointLoads / node.jointLoads / node.assignment.
      </div>
    </body>
    </html>
  `;
  },

  printModelShowTablesReport(selectedTableIds = [], options = {}) {
    const html = this._buildPrintableModelShowTablesReportHtml(selectedTableIds, options);
    const win = window.open("", "_blank", "width=1100,height=800");

    if (!win) {
      this.showMessage?.("El navegador bloqueó la ventana de impresión.", "warning");
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();

    win.focus();

    setTimeout(() => {
      win.print();
    }, 300);
  },

  async copyModelShowTablesJson(selectedTableIds = [], options = {}) {
    const pkg = this._buildModelShowTablesPackage(selectedTableIds, options);

    try {
      await navigator.clipboard.writeText(JSON.stringify(pkg, null, 2));
      this.showMessage?.("JSON de Show Tables copiado.", "success");
    } catch (error) {
      console.warn("No se pudo copiar Show Tables JSON:", error);
      this.showMessage?.("No se pudo copiar el JSON.", "warning");
    }
  },

  async openEtabsStyleModelTablesDialog(selectedTableIds = [], options = {}) {
    const allTables = this._getModelShowTableDefinitions(options);

    const tableDefs = allTables.filter((table) => {
      return selectedTableIds.includes(table.id);
    });

    if (!tableDefs.length) {
      this.showMessage?.("No hay tablas seleccionadas para mostrar.", "warning");
      return;
    }

    const tabsHtml = tableDefs
      .map((table, index) => {
        return `
        <button
          type="button"
          class="model-table-tab"
          data-tab="${table.id}"
          style="
            padding:7px 10px;
            border:1px solid ${index === 0 ? "#2563eb" : "#334155"};
            border-radius:5px;
            background:${index === 0 ? "#2563eb" : "#0f172a"};
            color:#e2e8f0;
            cursor:pointer;
            font-size:12px;
            white-space:nowrap;
          "
        >
          ${table.label}
        </button>
      `;
      })
      .join("");

    const panelsHtml = tableDefs
      .map((table, index) => {
        return `
        <div
          class="model-table-panel"
          data-panel="${table.id}"
          style="display:${index === 0 ? "block" : "none"};"
        >
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <div style="font-size:13px; color:#e2e8f0; font-weight:700;">
              TABLE: ${table.label}
            </div>
            <div style="font-size:11px; color:#94a3b8;">
              Filas: ${table.rows.length}
            </div>
          </div>

          ${this._buildModelShowTableHtml(table)}
        </div>
      `;
      })
      .join("");

    await Swal.fire({
      title: "Show Tables - Model Definition",
      width: 1180,
      background: "#020617",
      color: "#e2e8f0",
      html: `
      <div style="text-align:left; font-family:Arial, sans-serif;">

    <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:10px;">
      <div>
        <div style="font-size:12px; color:#94a3b8;">
          Fuente: <b>Modelo actual</b> |
          Tipo: <b>Joint Load Assignments</b>
        </div>
      <div style="font-size:11px; color:#64748b;">
        Tablas generadas desde las asignaciones guardadas en los nodos.
      </div>
    </div>

    <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
      <button
        type="button"
        id="export-model-tables-json"
        style="
          padding:6px 10px;
          border:1px solid #334155;
          border-radius:5px;
          background:#111827;
          color:#e2e8f0;
          cursor:pointer;
          font-size:12px;
        "
      >
        Descargar JSON
      </button>

      <button
        type="button"
        id="export-model-tables-csv"
        style="
          padding:6px 10px;
          border:1px solid #334155;
          border-radius:5px;
          background:#111827;
          color:#e2e8f0;
          cursor:pointer;
          font-size:12px;
        "
      >
        Descargar CSV
      </button>

      <button
        type="button"
        id="print-model-tables-report"
        style="
          padding:6px 10px;
          border:1px solid #334155;
          border-radius:5px;
          background:#111827;
          color:#e2e8f0;
          cursor:pointer;
          font-size:12px;
        "
      >
        Imprimir / PDF
      </button>

      <button
        type="button"
        id="copy-model-tables-json"
        style="
          padding:6px 10px;
          border:1px solid #334155;
          border-radius:5px;
          background:#111827;
          color:#e2e8f0;
          cursor:pointer;
          font-size:12px;
        "
      >
        Copiar JSON
      </button>
    </div>
  </div>

        <div style="
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          margin-bottom:10px;
          border-bottom:1px solid #334155;
          padding-bottom:8px;
        ">
          ${tabsHtml}
        </div>

        <div>
          ${panelsHtml}
        </div>

        <div style="margin-top:10px; color:#facc15; font-size:11px;">
          Valores mostrados desde node.pointLoads / node.jointLoads / node.assignment.
        </div>
      </div>
    `,
      showCancelButton: false,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#2563eb",
      didOpen: () => {
        const popup = Swal.getPopup();

        const showPanel = (id) => {
          popup?.querySelectorAll(".model-table-panel").forEach((panel) => {
            panel.style.display = panel.getAttribute("data-panel") === id ? "block" : "none";
          });
        };

        popup?.querySelectorAll(".model-table-tab").forEach((btn) => {
          btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");

            popup.querySelectorAll(".model-table-tab").forEach((item) => {
              item.style.background = "#0f172a";
              item.style.borderColor = "#334155";
            });

            btn.style.background = "#2563eb";
            btn.style.borderColor = "#2563eb";

            showPanel(tabId);
          });
        });

        popup?.querySelector("#export-model-tables-json")?.addEventListener("click", () => {
          this.exportModelShowTablesJson(selectedTableIds, options);
        });

        popup?.querySelector("#export-model-tables-csv")?.addEventListener("click", () => {
          this.exportModelShowTablesCsv(selectedTableIds, options);
        });

        popup?.querySelector("#print-model-tables-report")?.addEventListener("click", () => {
          this.printModelShowTablesReport(selectedTableIds, options);
        });

        popup?.querySelector("#copy-model-tables-json")?.addEventListener("click", () => {
          this.copyModelShowTablesJson(selectedTableIds, options);
        });
      },
    });
  },

  // ============================================================
};

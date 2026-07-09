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

  _getModelShowTableDefinitions(options = {}) {
    return [
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
          { id: "other_definitions", label: "Other Definitions", pending: true },
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
                    id: "joint_assignments_summary",
                    label: "Table: Joint Assignments - Summary",
                    pending: true,
                  },
                  {
                    id: "joint_assignments_restraints",
                    label: "Table: Joint Assignments - Restraints",
                    pending: true,
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

          { id: "frame_assignments", label: "Frame Assignments", pending: true },
          { id: "area_assignments", label: "Area Assignments", pending: true },
          { id: "options_preferences_data", label: "Options and Preferences Data", pending: true },
          { id: "miscellaneous_data", label: "Miscellaneous Data", pending: true },
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
        const checked = isImplementedLeaf && rowCount > 0 ? "checked" : "";
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
           >${node.expanded === false ? "+" : "−"}</button>`
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
             style="display:${node.expanded === false ? "none" : "block"};"
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
            min-height:20px;
            padding:2px 4px;
            padding-left:${depth * 18 + 4}px;
            color:${disabled ? "#64748b" : theme.treeText};
            font-size:12px;
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
              <legend tyle="color:${theme.legendText}; font-size:12px;">
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

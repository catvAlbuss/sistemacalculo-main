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
};

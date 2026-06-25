import Swal from "sweetalert2";

import {
  ensureResponseSpectrumDefinitions,
  openResponseSpectrumFunctionsDialog,
  openResponseSpectrumCasesDialog,
} from "../analysis/7_responseSpectrumDefinitions.js";

import {
  runModalSpectralAnalysisFromSystem,
} from "../analysis/3_modalSpectralController.js";

import {
  openModalSpectralAnalysisDialog as openModalSpectralAnalysisDialogUI,
  openModalSpectralResultsDialog as openModalSpectralResultsDialogUI,
  openModalSpectralOptionsDialog as openModalSpectralOptionsDialogUI,
} from "../analysis/2_modalSpectralUI.js";

/**
 * @mixin viewportMixin
 *
 * Control de la cámara y las vistas del viewport 2D y 3D.
 *
 * Gestiona el zoom, paneo y las acciones del menú View que cambian cómo
 * se ve el modelo sin modificarlo. El viewport 2D usa this.grid para
 * las transformaciones; el 3D delega en las funciones de camera3d.js.
 *
 * Responsabilidades:
 * - zoomIn / zoomOut()                → zoom del canvas 2D
 * - panLeft / panRight / panUp / panDown() → desplazamiento del canvas 2D
 * - resetView()                       → restaura la vista a la posición inicial
 * - fitView()                         → alias de fitContentToScreen
 * - activateViewPlan()                → vista de planta en el visor 3D
 * - activateViewIso()                 → vista isométrica en el visor 3D
 * - activateViewFront()               → vista frontal en el visor 3D
 * - activateViewSide()                → vista lateral en el visor 3D
 * - toggleRubberBandZoom()            → activa el zoom por ventana de selección
 * - openSetViewByNameDialog()         → diálogo para saltar a una vista por nombre
 */
export const viewportMixin = {
  // ------------------------------------------------------------------
  // 14. MÉTODOS DEL MENÚ VIEW
  // ------------------------------------------------------------------

  async set3DView() {
    const result = await Swal.fire({
      title: "Set 3D View",
      width: 520,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona una orientación para la vista 3D.
        </p>

        <label style="display:block; margin-bottom:6px;">Vista 3D</label>

        <select id="view-3d-type" style="width:100%; padding:7px;">
          <option value="iso">Isometric View</option>
          <option value="plan">Plan View / Top</option>
          <option value="front">Front Elevation</option>
          <option value="side">Side Elevation</option>
          <option value="extents">Zoom Extents 3D</option>
        </select>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Esta opción cambia solo la cámara 3D. No modifica nodos, barras, grillas ni asignaciones.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return document.getElementById("view-3d-type")?.value || "iso";
      },
    });

    if (!result.isConfirmed) return;

    const viewType = result.value;

    if (this.windowLayout === "one") {
      this.singleWindowView = "3d";
      this.setWindowLayout?.("one");
    }

    if (viewType === "iso") {
      this.setViewIso?.();
    }

    if (viewType === "plan") {
      this.setViewPlan?.();
    }

    if (viewType === "front") {
      this.setViewFront?.();
    }

    if (viewType === "side") {
      this.setViewSide?.();
    }

    if (viewType === "extents") {
      this.zoomExtents?.();
    }

    this.redraw?.();

    this.showMessage?.(`🎥 Set 3D View: ${viewType}`);
  },

  async setPlanView() {
    this.ensureViewSetForViewMenu?.();

    const planViews = (this.viewSet || [])
      .map((view, index) => ({ ...view, index }))
      .filter((view) => view.type === "plan");

    if (!planViews.length) {
      this.showMessage?.("No hay vistas de planta disponibles.", "warning");
      return;
    }

    const options = {};

    planViews.forEach((view) => {
      const z = Number(view.elevation ?? 0);
      options[view.index] = `${view.name || "Planta"} | Z = ${z.toFixed(2)} m`;
    });

    const currentPlan = planViews.find((view) => view.index === this.activeViewIndex);
    const defaultValue = currentPlan ? String(currentPlan.index) : String(planViews[0].index);

    const result = await Swal.fire({
      title: "Set Plan View",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona el nivel o planta que deseas visualizar.
        </p>

        <label style="display:block; margin-bottom:6px;">Plan View</label>

        <select id="view-plan-index" style="width:100%; padding:7px;">
          ${planViews
          .map((view) => {
            const z = Number(view.elevation ?? 0);
            const selected = String(view.index) === defaultValue ? "selected" : "";

            return `
              <option value="${view.index}" ${selected}>
                ${view.name || "Planta"} | Z = ${z.toFixed(2)} m
              </option>
            `;
          })
          .join("")}
        </select>

        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input id="view-plan-fit" type="checkbox" checked>
          Restore Full View después de cambiar
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Esta opción cambia la vista activa 2D a una planta. Los objetos seguirán filtrándose por el nivel seleccionado.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          index: Number(document.getElementById("view-plan-index")?.value),
          fit: document.getElementById("view-plan-fit")?.checked === true,
        };
      },
    });

    if (!result.isConfirmed) return;

    const selectedIndex = result.value.index;

    this.saveZoomState?.();
    this.setViewFromSet(selectedIndex);

    const selectedView = this.viewSet?.[selectedIndex];

    if (result.value.fit) {
      this.fitContentToScreen?.();
    }

    this.redraw?.();

    this.showMessage?.(`🗺️ Vista en planta: ${selectedView?.name || selectedIndex}`);
  },

  async setElevationView() {
    this.ensureViewSetForViewMenu?.();

    const elevationViews = (this.viewSet || [])
      .map((view, index) => ({ ...view, index }))
      .filter((view) => view.type === "elevation");

    if (!elevationViews.length) {
      this.showMessage?.("No hay vistas de elevación disponibles.", "warning");
      return;
    }

    const defaultView = elevationViews.find((view) => view.index === this.activeViewIndex) || elevationViews[0];

    const result = await Swal.fire({
      title: "Set Elevation View",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona la elevación que deseas visualizar.
        </p>

        <label style="display:block; margin-bottom:6px;">Elevation View</label>

        <select id="view-elevation-index" style="width:100%; padding:7px;">
          ${elevationViews
          .map((view) => {
            const fixedAxis = view.axis === "X" ? "X fijo" : "Y fijo";
            const plane = view.axis === "X" ? "Plano Y-Z" : "Plano X-Z";
            const value = Number(view.value ?? 0).toFixed(2);
            const selected = view.index === defaultView.index ? "selected" : "";

            return `
              <option value="${view.index}" ${selected}>
                ${view.name || `Elevación ${view.label}`} | ${fixedAxis} = ${value} m | ${plane}
              </option>
            `;
          })
          .join("")}
        </select>

        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input id="view-elevation-fit" type="checkbox" checked>
          Restore Full View después de cambiar
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          En esta versión:
          <br>• Elevaciones A, B, C... trabajan con X fijo y muestran el plano Y-Z.
          <br>• Elevaciones 1, 2, 3... trabajan con Y fijo y muestran el plano X-Z.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          index: Number(document.getElementById("view-elevation-index")?.value),
          fit: document.getElementById("view-elevation-fit")?.checked === true,
        };
      },
    });

    if (!result.isConfirmed) return;

    const selectedIndex = result.value.index;

    this.saveZoomState?.();
    this.setViewFromSet(selectedIndex);

    const selectedView = this.viewSet?.[selectedIndex];

    if (result.value.fit) {
      this.fitContentToScreen?.();
    }

    this.redraw?.();

    this.showMessage?.(`📐 Vista en elevación: ${selectedView?.name || selectedIndex}`);
  },

  ensureViewSetForViewMenu() {
    if (!Array.isArray(this.viewSet)) {
      this.viewSet = [];
    }

    if (this.viewSet.length > 0) {
      return;
    }

    this.rebuildReferenceGridCaches?.();
    this.rebuildViewSetFromReferenceGrid?.();
    this.rebuildElevationListsFromReferenceGrid?.();

    if (!Array.isArray(this.viewSet)) {
      this.viewSet = [];
    }
  },

  rubberBandZoom() {
    if (!this.rubberBandZoomState) {
      this.showMessage?.("No existe RubberBandZoomState", "warning");
      return;
    }

    this.clearAllSelections?.();
    this.setState(this.rubberBandZoomState);

    this.showMessage?.("🔍 Rubber Band Zoom activado. Arrastra un recuadro con clic izquierdo.");
  },

  restoreFullView() {
    this.saveZoomState?.();

    this.fitContentToScreen();

    this.redraw?.();
    this.showMessage?.("🖼️ Vista completa restaurada");
  },

  previousZoom() {
    if (!this.zoomHistory || this.zoomHistory.length === 0) {
      this.showMessage?.("⏪ No hay zoom anterior disponible", "warning");
      return;
    }

    const previousState = this.zoomHistory.pop();

    if (!this.grid?.restoreState) {
      this.showMessage?.("Falta restoreState() en grid.js", "warning");
      return;
    }

    this.grid.restoreState(previousState);

    this.redraw?.();
    this.showMessage?.("⏪ Zoom anterior restaurado");
  },

  zoomInOneStep() {
    if (!this.canvas || !this.grid) return;

    this.saveZoomState?.();

    this.grid.zoomInToScreenPoint({
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    });

    this.redraw?.();
    this.showMessage?.("🔍+ Zoom +1");
  },

  zoomOutOneStep() {
    if (!this.canvas || !this.grid) return;

    this.saveZoomState?.();

    this.grid.zoomOutToScreenPoint({
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    });

    this.redraw?.();
    this.showMessage?.("🔍- Zoom -1");
  },

  panView() {
    if (!this.panAndZoomState) {
      this.showMessage?.("No existe PanAndZoomState", "warning");
      return;
    }

    this.setState(this.panAndZoomState);

    this.showMessage?.("✋ Pan activado: usa el botón central del mouse para mover la vista y la rueda para zoom.");
  },

  saveZoomState() {
    if (!this.grid?.getState) {
      console.warn("Falta getState() en grid.js");
      return;
    }

    if (!Array.isArray(this.zoomHistory)) {
      this.zoomHistory = [];
    }

    this.zoomHistory.push(this.grid.getState());

    if (this.zoomHistory.length > 20) {
      this.zoomHistory.shift();
    }
  },

  // ------------------------------------------------------------------
  // 15. MÉTODOS DEL MENÚ DEFINE
  // ------------------------------------------------------------------

  openMaterialProperties() {
    window.dispatchEvent(new CustomEvent("open-material-properties-modal"));
  },

  openFrameSections() {
    window.dispatchEvent(new CustomEvent("open-frame-sections-modal"));
  },

  openLoadCases() {
    window.dispatchEvent(new CustomEvent("open-static-load-cases-modal"));
  },

  openLoadCombinations() {
    window.dispatchEvent(new CustomEvent("open-load-combinations-modal"));
  },

  // =====================================================
  // DEFINE > MASS SOURCE
  // =====================================================

  getDefaultMassSourceDefinition() {
    return {
      enabled: true,
      name: "MASS_SOURCE_1",

      // Similar a ETABS:
      // masa sísmica desde peso propio + cargas gravitacionales.
      includeSelfWeight: true,
      selfWeightMultiplier: 1.0,

      loadPatterns: [
        {
          name: "DEAD",
          type: "Dead",
          factor: 1.0,
        },
        {
          name: "LIVE",
          type: "Live",
          factor: 0.25,
        },
      ],

      // Por ahora queda como configuración.
      // En el siguiente paso se conectará al payload sísmico y backend.
      convertWeightToMass: true,
      gravity: 9.81,
      distributeToDiaphragms: true,
      distributeToStoryNodes: true,
    };
  },

  ensureMassSourceDefinition() {
    if (!this.massSource) {
      this.massSource = this.getDefaultMassSourceDefinition();
    }

    if (!Array.isArray(this.massSource.loadPatterns)) {
      this.massSource.loadPatterns = [];
    }

    return this.massSource;
  },

  getAvailableLoadPatternsForMassSource() {
    const fromLoadCases = this.loadCases?.cases;
    const fromStaticLoadCases = this.staticLoadCases?.items;
    const fromAvailableLoads = this.availableLoads;

    let source = [];

    if (Array.isArray(fromLoadCases) && fromLoadCases.length > 0) {
      source = fromLoadCases;
    } else if (Array.isArray(fromStaticLoadCases) && fromStaticLoadCases.length > 0) {
      source = fromStaticLoadCases;
    } else if (Array.isArray(fromAvailableLoads) && fromAvailableLoads.length > 0) {
      source = fromAvailableLoads;
    }

    if (!source.length) {
      source = [
        { name: "DEAD", type: "Dead" },
        { name: "LIVE", type: "Live" },
        { name: "ROOF LIVE", type: "Live" },
      ];
    }

    return source.map((item) => ({
      name: item.name || item.id || item.loadCase || "LOAD",
      type: item.type || item.loadType || "Other",
    }));
  },

  massSourceHasPattern(patternName) {
    const cfg = this.ensureMassSourceDefinition();

    return cfg.loadPatterns.some((item) => {
      return String(item.name) === String(patternName);
    });
  },

  getMassSourceFactor(patternName, defaultFactor = 0) {
    const cfg = this.ensureMassSourceDefinition();

    const found = cfg.loadPatterns.find((item) => {
      return String(item.name) === String(patternName);
    });

    if (!found) return defaultFactor;

    const value = Number(found.factor);

    return Number.isFinite(value) ? value : defaultFactor;
  },

  async openMassSourceDialog() {
    const cfg = this.ensureMassSourceDefinition();
    const loadPatterns = this.getAvailableLoadPatternsForMassSource();

    const patternRows = loadPatterns
      .map((pattern, index) => {
        const checked = this.massSourceHasPattern(pattern.name);
        const fallbackFactor = String(pattern.name).toUpperCase().includes("DEAD")
          ? 1.0
          : String(pattern.name).toUpperCase().includes("LIVE")
            ? 0.25
            : 0.0;

        const factor = this.getMassSourceFactor(pattern.name, fallbackFactor);

        return `
          <tr>
            <td style="border:1px solid #475569; padding:6px; text-align:center;">
              <input
                type="checkbox"
                class="mass-source-pattern-enabled"
                data-index="${index}"
                ${checked ? "checked" : ""}
              >
            </td>

            <td style="border:1px solid #475569; padding:6px;">
              ${pattern.name}
              <input type="hidden" id="mass-source-pattern-name-${index}" value="${pattern.name}">
            </td>

            <td style="border:1px solid #475569; padding:6px;">
              ${pattern.type}
              <input type="hidden" id="mass-source-pattern-type-${index}" value="${pattern.type}">
            </td>

            <td style="border:1px solid #475569; padding:6px;">
              <input
                id="mass-source-pattern-factor-${index}"
                type="number"
                step="0.01"
                min="0"
                value="${factor}"
                style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px;"
              >
            </td>
          </tr>
        `;
      })
      .join("");

    const result = await Swal.fire({
      title: "Define Mass Source",
      width: 820,
      background: "#1a2035",
      color: "#e2e8f0",
      html: `
        <div style="text-align:left; font-family:monospace; font-size:13px;">

          <div style="margin-bottom:12px; color:#94a3b8;">
            Define cómo se construirá la masa sísmica del modelo, similar a ETABS.
          </div>

          <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px 14px; margin-bottom:12px;">
            <legend style="padding:0 6px; color:#7eb8f7; font-size:12px; font-weight:600;">
              General
            </legend>

            <div style="display:grid; grid-template-columns:160px 1fr; gap:8px; align-items:center; margin-bottom:8px;">
              <label>Nombre:</label>
              <input
                id="mass-source-name"
                type="text"
                value="${cfg.name || "MASS_SOURCE_1"}"
                style="background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px;"
              >
            </div>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input id="mass-source-enabled" type="checkbox" ${cfg.enabled !== false ? "checked" : ""}>
              Activar Mass Source para análisis sísmico
            </label>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input id="mass-source-self-weight" type="checkbox" ${cfg.includeSelfWeight !== false ? "checked" : ""}>
              Incluir peso propio de elementos
            </label>

            <div style="display:grid; grid-template-columns:160px 1fr; gap:8px; align-items:center; margin-bottom:8px;">
              <label>Factor peso propio:</label>
              <input
                id="mass-source-self-weight-factor"
                type="number"
                step="0.01"
                value="${Number(cfg.selfWeightMultiplier ?? 1)}"
                style="background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px;"
              >
            </div>

            <div style="display:grid; grid-template-columns:160px 1fr; gap:8px; align-items:center;">
              <label>Gravedad:</label>
              <input
                id="mass-source-gravity"
                type="number"
                step="0.01"
                min="1"
                value="${Number(cfg.gravity ?? 9.81)}"
                style="background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px 8px;"
              >
            </div>
          </fieldset>

          <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px 14px; margin-bottom:12px;">
            <legend style="padding:0 6px; color:#7eb8f7; font-size:12px; font-weight:600;">
              Load Patterns
            </legend>

            <table style="width:100%; border-collapse:collapse; font-size:12px;">
              <thead>
                <tr style="background:#0f172a;">
                  <th style="border:1px solid #475569; padding:6px;">Usar</th>
                  <th style="border:1px solid #475569; padding:6px;">Load Pattern</th>
                  <th style="border:1px solid #475569; padding:6px;">Tipo</th>
                  <th style="border:1px solid #475569; padding:6px;">Factor</th>
                </tr>
              </thead>

              <tbody>
                ${patternRows}
              </tbody>
            </table>

            <div style="margin-top:8px; color:#94a3b8; font-size:12px;">
              Recomendación inicial: DEAD = 1.00, LIVE = 0.25.
            </div>
          </fieldset>

          <fieldset style="border:1px solid #475569; border-radius:6px; padding:10px 14px;">
            <legend style="padding:0 6px; color:#7eb8f7; font-size:12px; font-weight:600;">
              Distribución
            </legend>

            <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input id="mass-source-to-diaphragms" type="checkbox" ${cfg.distributeToDiaphragms !== false ? "checked" : ""}>
              Distribuir masa a diafragmas rígidos
            </label>

            <label style="display:flex; align-items:center; gap:8px;">
              <input id="mass-source-to-story-nodes" type="checkbox" ${cfg.distributeToStoryNodes !== false ? "checked" : ""}>
              Distribuir masa a nodos de piso
            </label>
          </fieldset>

          <div style="margin-top:12px; color:#facc15; font-size:12px;">
            Nota: en este paso se guarda la definición. En el siguiente bloque la conectaremos al payload sísmico y al backend.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1d4ed8",
      preConfirm: () => {
        return this.readMassSourceFromDialog(loadPatterns.length);
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.saveMassSourceDefinition(result.value);
  },

  readMassSourceFromDialog(patternCount = 0) {
    const readNumber = (id, fallback = 0) => {
      const value = Number(document.getElementById(id)?.value ?? fallback);
      return Number.isFinite(value) ? value : fallback;
    };

    const loadPatterns = [];

    for (let index = 0; index < patternCount; index++) {
      const enabled = document.querySelector(
        `.mass-source-pattern-enabled[data-index="${index}"]`
      )?.checked === true;

      if (!enabled) continue;

      const name = document.getElementById(`mass-source-pattern-name-${index}`)?.value || "";
      const type = document.getElementById(`mass-source-pattern-type-${index}`)?.value || "Other";
      const factor = readNumber(`mass-source-pattern-factor-${index}`, 0);

      if (!name) continue;

      loadPatterns.push({
        name,
        type,
        factor,
      });
    }

    if (!loadPatterns.length && document.getElementById("mass-source-self-weight")?.checked !== true) {
      Swal.showValidationMessage("Selecciona al menos un Load Pattern o activa el peso propio.");
      return false;
    }

    const gravity = readNumber("mass-source-gravity", 9.81);

    if (gravity <= 0) {
      Swal.showValidationMessage("La gravedad debe ser mayor que cero.");
      return false;
    }

    return {
      enabled: document.getElementById("mass-source-enabled")?.checked !== false,
      name: document.getElementById("mass-source-name")?.value?.trim() || "MASS_SOURCE_1",

      includeSelfWeight: document.getElementById("mass-source-self-weight")?.checked === true,
      selfWeightMultiplier: readNumber("mass-source-self-weight-factor", 1.0),

      loadPatterns,

      convertWeightToMass: true,
      gravity,

      distributeToDiaphragms: document.getElementById("mass-source-to-diaphragms")?.checked === true,
      distributeToStoryNodes: document.getElementById("mass-source-to-story-nodes")?.checked === true,
    };
  },

  saveMassSourceDefinition(massSource) {
    this.massSource = JSON.parse(JSON.stringify(massSource));

    this.markAnalysisResultsOutdated?.("Define Mass Source");

    this.showMessage?.("Mass Source guardado correctamente.", "success");

    console.log("✅ Mass Source definido:", this.massSource);
  },

  openMassSource() {
    // Abre el modal estilo ETABS (lista de fuentes + editor). El diálogo Swal
    // antiguo (openMassSourceDialog) queda obsoleto.
    window.dispatchEvent(new CustomEvent("open-mass-source-modal"));
  },

  openDiaphragms() {
    window.dispatchEvent(new CustomEvent("open-diaphragms-modal"));
  },

  openGroups() {
    window.dispatchEvent(new CustomEvent("open-groups-modal"));
  },

  openSectionCuts() {
    window.dispatchEvent(new CustomEvent("open-section-cuts-modal"));
  },

  ensureResponseSpectrumDefinitions() {
    return ensureResponseSpectrumDefinitions(this);
  },

  openResponseSpectrumFunctions() {
    // window.dispatchEvent(new CustomEvent("open-response-spectrum-functions-modal"));
    return openResponseSpectrumFunctionsDialog(this);
  },

  openResponseSpectrumCases() {
    // Swal.fire({
    //   title: "Response Spectrum Cases",
    //   html: `
    //         <div class="text-left">
    //             <div class="mb-3">
    //                 <label class="block text-xs font-bold">Case Name</label>
    //                 <input type="text" class="w-full px-2 py-1 border rounded text-sm" value="SPEC1">
    //             </div>
    //             <div class="grid grid-cols-2 gap-3">
    //                 <div>
    //                     <label class="text-xs">Function</label>
    //                     <select class="w-full px-2 py-1 border rounded text-sm">
    //                         <option>ACCEL_X</option>
    //                         <option>ACCEL_Y</option>
    //                         <option>ACCEL_Z</option>
    //                     </select>
    //                 </div>
    //                 <div>
    //                     <label class="text-xs">Scale Factor</label>
    //                     <input type="number" step="0.1" class="w-full px-2 py-1 border rounded text-sm" value="1.0">
    //                 </div>
    //                 <div>
    //                     <label class="text-xs">Damping Ratio</label>
    //                     <input type="number" step="0.01" class="w-full px-2 py-1 border rounded text-sm" value="0.05">
    //                 </div>
    //                 <div>
    //                     <label class="text-xs">Modal Combination</label>
    //                     <select class="w-full px-2 py-1 border rounded text-sm">
    //                         <option>CQC</option>
    //                         <option>SRSS</option>
    //                         <option>ABS</option>
    //                     </select>
    //                 </div>
    //             </div>
    //         </div>
    //     `,
    //   confirmButtonText: "OK",
    // });
    return openResponseSpectrumCasesDialog(this);
  },

  // ─── Define: stubs de features ETABS aún no implementadas ───────────────────
  // Evitan el error "is not a function" al hacer clic en el menú Define.
  // Avisan que están en desarrollo en lugar de crashear.
  _defineTodo(nombre) {
    this.showMessage?.(`"${nombre}" está en desarrollo — aún no disponible.`, "info");
  },
  openWallSlabSections() {
    window.dispatchEvent(new CustomEvent("open-slab-sections-modal"));
  },
  openLinkProperties() { this._defineTodo("Link Properties"); },
  openHingeProperties() { this._defineTodo("Frame Nonlinear Hinge Properties"); },
  openTimeHistoryFunctions() { this._defineTodo("Time History Functions"); },
  openTimeHistoryCases() { this._defineTodo("Time History Cases"); },
  openPushoverCases() { this._defineTodo("Static Nonlinear / Pushover Cases"); },
  openSequentialConstruction() { this._defineTodo("Sequential Construction Case"); },
  addDefaultDesignCombos() { this._defineTodo("Add Default Design Combos"); },
  openSeismicEffects() { this._defineTodo("Special Seismic Load Effects"); },

  convertCombosToNonlinear() {
    // 🔧 Verificar que combinations exista y sea un array
    const combinations = this.loadCombinations?.combinations;

    if (!combinations || !Array.isArray(combinations) || combinations.length === 0) {
      this.showMessage("⚠️ No hay combinaciones de carga definidas para convertir", "warning");
      return;
    }

    Swal.fire({
      title: "Convertir Combinaciones a Casos No Lineales",
      html: `
      <div class="text-left">
        <p class="text-sm text-gray-400 mb-3">Seleccione las combinaciones a convertir:</p>
        <div class="max-h-40 overflow-y-auto border rounded p-2">
          ${combinations
          .map(
            (combo, index) => `
            <label class="flex items-center gap-2 py-1">
              <input type="checkbox" value="${combo.name}" class="combo-checkbox" data-index="${index}">
              <span class="text-sm">${combo.name}: ${combo.expression || combo.name}</span>
            </label>
          `,
          )
          .join("")}
        </div>
        <div class="mt-3">
          <label class="text-xs">Prefijo para Casos No Lineales</label>
          <input type="text" id="nl-prefix" class="w-full px-2 py-1 border rounded text-sm" value="NL_">
        </div>
      </div>
    `,
      confirmButtonText: "Convertir",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      preConfirm: () => {
        const selected = [];
        document.querySelectorAll(".combo-checkbox:checked").forEach((cb) => {
          selected.push(cb.value);
        });
        const prefix = document.getElementById("nl-prefix").value;
        return { selected, prefix };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        if (result.value.selected.length === 0) {
          this.showMessage("⚠️ No se seleccionó ninguna combinación", "warning");
          return;
        }
        this.showMessage(
          `🔄 Convertidas ${result.value.selected.length} combinaciones con prefijo "${result.value.prefix}"`,
        );
      }
    });
  },

  // También agrega estos si no existen:

  showForces() {
    this.options.showForces = !this.options.showForces;
    this.redraw();
    this.sync3D();
    this.showMessage(
      this.options.showForces ? "📊 Diagramas de fuerzas activados" : "📊 Diagramas de fuerzas desactivados",
    );
  },

  showReactions() {
    this.options.showReactions = !this.options.showReactions;
    this.redraw();
    this.sync3D(); // ← esto actualiza la vista 3D
    this.showMessage(this.options.showReactions ? "📊 Reacciones activadas" : "📊 Reacciones desactivadas");
  },

  showStresses() {
    this.options.showFAxiales = !this.options.showFAxiales;
    this.redraw();
    this.sync3D();
    this.showMessage(this.options.showFAxiales ? "🎨 Esfuerzos activados" : "🎨 Esfuerzos desactivados");
  },

  showTable(tableType) {
    if (tableType === "nodes") {
      Swal.fire({
        title: "Tabla de Nodos",
        html: `
                <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-xs">
                        <thead class="bg-gray-700 sticky top-0">
                            <tr><th class="p-2">ID</th><th class="p-2">X (m)</th><th class="p-2">Y (m)</th><th class="p-2">Z (m)</th></tr>
                        </thead>
                        <tbody>
                            ${this.nodes
            .map(
              (n) => `
                                <tr class="border-t">
                                    <td class="p-2">${n.id}</td>
                                    <td class="p-2">${n.position.x.toFixed(3)}</td>
                                    <td class="p-2">${n.position.y.toFixed(3)}</td>
                                    <td class="p-2">${(n.position.z || 0).toFixed(3)}</td>
                                </tr>
                            `,
            )
            .join("")}
                            ${this.nodes.length === 0 ? '<tr><td colspan="4" class="p-4 text-center text-gray-400">No hay nodos</td></tr>' : ""}
                        </tbody>
                    </table>
                </div>
            `,
        width: "600px",
      });
    } else if (tableType === "elements") {
      Swal.fire({
        title: "Tabla de Elementos",
        html: `
                <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-xs">
                        <thead class="bg-gray-700 sticky top-0">
                            <tr><th class="p-2">ID</th><th class="p-2">Nodo I</th><th class="p-2">Nodo J</th><th class="p-2">Longitud (m)</th><th class="p-2">Material</th></tr>
                        </thead>
                        <tbody>
                            ${this.shapes
            .map((b) => {
              const dx = b.node1.position.x - b.node2.position.x;
              const dy = b.node1.position.y - b.node2.position.y;
              const length = Math.sqrt(dx * dx + dy * dy).toFixed(3);
              return `
                                    <tr class="border-t">
                                        <td class="p-2">${b.id}</td>
                                        <td class="p-2">${b.node1.id}</td>
                                        <td class="p-2">${b.node2.id}</td>
                                        <td class="p-2">${length}</td>
                                        <td class="p-2">${b.material?.name || "MAT1"}</td>
                                    </tr>
                                `;
            })
            .join("")}
                            ${this.shapes.length === 0 ? '<tr><td colspan="5" class="p-4 text-center text-gray-400">No hay elementos</td></tr>' : ""}
                        </tbody>
                    </table>
                </div>
            `,
        width: "700px",
      });
    } else if (tableType === "reactions") {
      Swal.fire({
        title: "Tabla de Reacciones",
        html: `
                <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-xs">
                        <thead class="bg-gray-700 sticky top-0">
                            <tr><th class="p-2">Nodo</th><th class="p-2">FX (kN)</th><th class="p-2">FY (kN)</th><th class="p-2">MZ (kN-m)</th></tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="4" class="p-4 text-center text-gray-400">Ejecute un análisis para ver reacciones</td></tr>
                        </tbody>
                    </table>
                </div>
            `,
        width: "600px",
      });
    }
  },

  // =================================================
  // ========== MÉTODOS PARA EL MENÚ SELECT ==========
  // ================================================

  selectByPointer() {
    this.showMessage("🖱️ Selección por puntero/ventana");
    // Cambiar al modo de selección por puntero
    // if (this.selectionState) {
    //   this.setState(this.selectionState);
    // }
  },

  selectByGroups() {
    this.showMessage("👥 Selección por grupos - Próximamente");
  },

  // selectByWallSlabSections() {
  //   this.showMessage("🧱 Selección por secciones de losa/muro/deck - Próximamente");
  // },

  // =================================================
  // ========== ANALYZE > RUN ANALYSIS ===============
  // =================================================

  // 17. MÉTODOS DEL MENÚ SELECT
  // ------------------------------------------------------------------

  selectByFrameSections() {
    this.showMessage("📐 Selección por secciones de pórtico - Próximamente");
  },

  selectByLinkProperties() {
    this.showMessage("🔗 Selección por propiedades de enlace - Próximamente");
  },

  selectByLineObjectType() {
    this.showMessage("━━ Selección por tipo de objeto lineal - Próximamente");
  },

  selectByAreaObjectType() {
    this.showMessage("◻️ Selección por tipo de objeto de área - Próximamente");
  },

  selectByPierID() {
    this.showMessage("🏢 Selección por Pier ID - Próximamente");
  },

  selectBySpandrelID() {
    this.showMessage("📊 Selección por Spandrel ID - Próximamente");
  },

  selectByStoryLevel() {
    // Mostrar diálogo para seleccionar nivel de piso
    if (this.stories && this.stories.length > 0) {
      let storyNames = this.stories.map((s) => s.name);
      Swal.fire({
        title: "Seleccionar por Nivel de Piso",
        input: "select",
        inputOptions: storyNames.reduce((acc, story) => {
          acc[story] = story;
          return acc;
        }, {}),
        inputPlaceholder: "Seleccione un nivel",
        showCancelButton: true,
        confirmButtonText: "Seleccionar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          let selectedStory = this.stories.find((s) => s.name === result.value);
          if (selectedStory) {
            this.selectNodesByHeight(selectedStory.elevation - 0.1, selectedStory.elevation + 0.1);
            this.showMessage(`📐 Seleccionados elementos en nivel ${selectedStory.name}`);
          }
        }
      });
    } else {
      this.showMessage("📐 Selección por nivel de piso - No hay niveles definidos");
    }
  },

  deselect() {
    this.clearAllSelections();
    this.redraw();
    this.sync3D();
    this.showMessage("❌ Elementos deseleccionados");
  },

  getPreviousSelection() {
    this.showMessage("⏪ Obtener selección anterior - Próximamente");
  },

  // ------------------------------------------------------------------
  // 18. MÉTODOS DE ANÁLISIS Y PARÁMETROS DINÁMICOS
  // ------------------------------------------------------------------

  checkModel() {
    window.dispatchEvent(new CustomEvent("open-check-model-modal"));
  },

  setAnalysisOptions() {
    window.dispatchEvent(new CustomEvent("open-analysis-options-modal"));
  },

  /**
 * Puente desde cad_sys.js hacia el controlador Modal Spectral.
 *
 * La lógica pesada vive en:
 * resources/js/cad/analysis/3_modalSpectralController.js
 */
  async runModalSpectralAnalysisFromMenu(customPayload = null) {
    return await runModalSpectralAnalysisFromSystem(this, customPayload);
  },

  openModalSpectralAnalysisDialog() {
    return openModalSpectralAnalysisDialogUI(this);
  },

  openModalSpectralOptionsDialog() {
    return openModalSpectralOptionsDialogUI(this);
  },

  openModalSpectralResultsDialog() {
    return openModalSpectralResultsDialogUI(this);
  },
};

import Swal from "sweetalert2";
import * as BABYLON from "@babylonjs/core";
import { getViewer3DState } from "../3d/viewer3d.js";

/**
 * @mixin optionsMixin
 *
 * Preferencias visuales y de configuración del sistema CAD.
 *
 * Gestiona todo lo relacionado con cómo se ve el modelo: tema de colores
 * del canvas (oscuro/claro), colores de cada tipo de elemento, layout de
 * ventanas (2D/3D), y los parámetros de configuración del usuario como
 * tolerancias, decimales de salida y parámetros de diseño.
 *
 * Las preferencias se persisten en localStorage para sobrevivir recargas.
 * Babylon.js se reconfigura cuando cambia el tema o los colores 3D.
 *
 * Responsabilidades:
 * - loadOptionsPreferences()           → carga configuración guardada en localStorage
 * - setWindowLayout(layout)            → alterna entre "two-vertical", "one", etc.
 * - setSingleWindowView(view)          → "2d" o "3d" cuando layout es "one"
 * - setCanvasTheme(themeKey)           → aplica un tema ("dark" o "light") al canvas
 * - openDisplayColorsDialog()          → diálogo para personalizar colores por elemento
 * - openDimensionsTolerancesDialog()   → diálogo para tolerancias y snap del modelo
 * - applyDimensionsTolerances()        → aplica las tolerancias al grid y al snap
 * - getModelTolerance()                → devuelve la tolerancia activa del modelo
 * - openOutputDecimalsDialog()         → decimales para coordenadas, fuerzas, etc.
 * - openSteelFrameDesignDialog()       → parámetros globales de diseño Steel Frame
 * - openReinforcementBarSizesDialog()  → tabla de diámetros de barras de refuerzo
 * - formatOutput(value, type)          → formatea un número según el tipo y decimales
 * - formatCoordinates(x, y, z)         → formatea coordenadas para mostrar en UI
 */
export const optionsMixin = {
  // ------------------------------------------------------------------
  // 3. MÉTODOS DE CARGA DE OPCIONES (preferencias, colores, etc.)
  // ------------------------------------------------------------------

  loadOptionsPreferences() {
    const preferenceData = localStorage.getItem("cad-preferences");
    const outputDecimalsData = localStorage.getItem("cad-output-decimals");
    const steelDesignData = localStorage.getItem("cad-steel-frame-design");
    const barSizesData = localStorage.getItem("cad-reinforcement-bar-sizes");

    if (preferenceData) {
      try {
        this.preferences = {
          ...this.preferences,
          ...JSON.parse(preferenceData),
        };

        this.planGridSnapScreenTolerance = this.preferences.snapScreenTolerance;
        this.planGridSnapTolerance = this.preferences.snapWorldTolerance;
      } catch (error) {
        console.warn("No se pudieron cargar Preferences:", error);
      }
    }

    if (outputDecimalsData) {
      try {
        this.outputDecimals = {
          ...this.outputDecimals,
          ...JSON.parse(outputDecimalsData),
        };
      } catch (error) {
        console.warn("No se pudieron cargar Output Decimals:", error);
      }
    }

    if (steelDesignData) {
      try {
        this.steelFrameDesign = {
          ...this.steelFrameDesign,
          ...JSON.parse(steelDesignData),
        };
      } catch (error) {
        console.warn("No se pudo cargar Steel Frame Design:", error);
      }
    }

    if (barSizesData) {
      try {
        this.reinforcementBarSizes = JSON.parse(barSizesData);
      } catch (error) {
        console.warn("No se pudieron cargar Reinforcement Bar Sizes:", error);
      }
    }
  },

  setWindowLayout(layout) {
    this.windowLayout = layout;

    const workspace = document.getElementById("cad-workspace");
    const panel2D = document.getElementById("cad-panel-2d");
    const panel3D = document.getElementById("cad-panel-3d");

    if (!workspace || !panel2D || !panel3D) {
      this.showMessage?.("No se encontró el contenedor de vistas", "warning");
      return;
    }

    workspace.dataset.layout = layout;

    // Limpiar clases del workspace
    workspace.classList.remove("grid-cols-1", "grid-cols-2", "grid-rows-1", "grid-rows-2");

    // Limpiar clases de paneles
    panel2D.classList.remove("hidden", "border-r", "border-b");

    panel3D.classList.remove("hidden", "border-r", "border-b");

    // ==========================
    // One: solo vista 2D
    // ==========================
    if (layout === "one") {
      workspace.classList.add("grid-cols-1", "grid-rows-1");

      if (this.singleWindowView === "2d") {
        panel2D.classList.remove("hidden");
        panel3D.classList.add("hidden");
      }

      if (this.singleWindowView === "3d") {
        panel2D.classList.add("hidden");
        panel3D.classList.remove("hidden");
      }

      this.showMessage?.(`Windows: One - ${this.singleWindowView.toUpperCase()}`);
    }

    // ==========================
    // Two Tiled Vertically: 2D | 3D
    // ==========================
    else if (layout === "two-vertical") {
      workspace.classList.add("grid-cols-2", "grid-rows-1");

      panel2D.classList.add("border-r");

      this.showMessage?.("Windows: Two Tiled Vertically");
    }

    // ==========================
    // Two Tiled Horizontally:
    // 2D
    // 3D
    // ==========================
    else if (layout === "two-horizontal") {
      workspace.classList.add("grid-cols-1", "grid-rows-2");

      panel2D.classList.add("border-b");

      this.showMessage?.("Windows: Two Tiled Horizontally");
    }

    // ==========================
    // Pendientes
    // ==========================
    else if (layout === "three") {
      workspace.classList.add("grid-cols-2", "grid-rows-1");

      panel2D.classList.add("border-r");

      this.showMessage?.("Windows: Three requiere crear una tercera vista", "warning");
    } else if (layout === "four") {
      workspace.classList.add("grid-cols-2", "grid-rows-1");

      panel2D.classList.add("border-r");

      this.showMessage?.("Windows: Four requiere crear vistas adicionales", "warning");
    }

    setTimeout(() => {
      this.windowResize?.();

      const viewer = getViewer3DState?.();

      if (viewer?.engine) {
        viewer.engine.resize();
      }

      this.redraw?.();
      this.sync3D?.();
    }, 100);
  },

  setSingleWindowView(view) {
    if (view !== "2d" && view !== "3d") return;

    this.singleWindowView = view;

    if (this.windowLayout === "one") {
      this.setWindowLayout("one");
    }

    this.showMessage?.(`Vista activa: ${view.toUpperCase()}`);

    setTimeout(() => {
      this.windowResize?.();

      const viewer = getViewer3DState?.();
      if (viewer?.engine) {
        viewer.engine.resize();
      }

      this.redraw?.();
      this.sync3D?.();
    }, 100);
  },

  setCanvasTheme(themeKey) {
    const theme = this.canvasThemes?.[themeKey];

    if (!theme) {
      this.showMessage?.("Tema de canvas no válido", "warning");
      return;
    }

    this.activeCanvasTheme = themeKey;

    this.displayColors = {
      ...this.displayColors,
      ...theme.displayColors,
    };

    this.canvas2dBackground = theme.canvas2d;

    const panel2D = document.getElementById("cad-panel-2d");

    if (panel2D) {
      panel2D.style.backgroundColor = theme.canvas2d;
    }

    if (this.canvas) {
      this.canvas.style.backgroundColor = theme.canvas2d;
    }

    this.applyThemeToViewer3DCanvas(theme.canvas3d);

    // localStorage.setItem("cad-canvas-theme", themeKey);

    this.showMessage?.(themeKey === "dark" ? "Canvas oscuro activado" : "Canvas claro activado");

    this.redraw?.();
    this.sync3D?.();
  },

  applyThemeToViewer3DCanvas(hexColor) {
    const viewer = getViewer3DState?.();

    if (!viewer?.scene) return;

    const rgb = this.hexToRgb(hexColor);

    if (!rgb) return;

    viewer.scene.clearColor = new BABYLON.Color4(rgb.r / 255, rgb.g / 255, rgb.b / 255, 1);
  },

  hexToRgb(hex) {
    const clean = String(hex || "").replace("#", "");

    if (clean.length !== 6) return null;

    const value = parseInt(clean, 16);

    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  },

  async openDisplayColorsDialog() {
    const c = this.displayColors;

    const { value } = await Swal.fire({
      title: "Display Colors",
      width: 520,
      html: `
      <div style="display:grid; grid-template-columns: 1fr 90px; gap:10px; align-items:center; text-align:left; font-size:13px;">

        <label>Fondo 2D</label>
        <input id="color-background2d" type="color" value="${c.background2d}">

        <label>Grilla secundaria</label>
        <input id="color-gridLine" type="color" value="${c.gridLine}">

        <label>Grilla principal / ejes</label>
        <input id="color-gridMainLine" type="color" value="${c.gridMainLine}">

        <label>Barras / vigas</label>
        <input id="color-beam" type="color" value="${c.beam}">

        <label>Vigas secundarias</label>
        <input id="color-secondaryBeam" type="color" value="${c.secondaryBeam}">

        <label>Columnas</label>
        <input id="color-column" type="color" value="${c.column}">

        <label>Nodos</label>
        <input id="color-node" type="color" value="${c.node}">

        <label>Textos</label>
        <input id="color-text" type="color" value="${c.text}">

        <label>Elemento seleccionado</label>
        <input id="color-selected" type="color" value="${c.selected}">

        <label>Snap</label>
        <input id="color-snap" type="color" value="${c.snap}">
      </div>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Aplicar",
      denyButtonText: "Restaurar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          background2d: document.getElementById("color-background2d").value,
          gridLine: document.getElementById("color-gridLine").value,
          gridMainLine: document.getElementById("color-gridMainLine").value,
          beam: document.getElementById("color-beam").value,
          secondaryBeam: document.getElementById("color-secondaryBeam").value,
          column: document.getElementById("color-column").value,
          node: document.getElementById("color-node").value,
          text: document.getElementById("color-text").value,
          selected: document.getElementById("color-selected").value,
          snap: document.getElementById("color-snap").value,
        };
      },
    });

    if (value) {
      this.setDisplayColors(value);
      return;
    }

    if (value === false) {
      this.resetDisplayColors();
    }
  },

  async openDimensionsTolerancesDialog() {
    const p = this.preferences;

    const { value } = await Swal.fire({
      title: "Dimensions / Tolerances",
      width: 520,
      html: `
      <div style="display:grid; grid-template-columns: 1fr 160px; gap:10px; align-items:center; text-align:left; font-size:13px;">
        <label>Unidad de longitud</label>
        <select id="pref-length-unit" class="swal2-input" style="width:140px;">
          <option value="m">m</option>
          <option value="cm">cm</option>
          <option value="mm">mm</option>
        </select>

        <label>Unidad de fuerza</label>
        <select id="pref-force-unit" class="swal2-input" style="width:140px;">
          <option value="kN">kN</option>
          <option value="N">N</option>
          <option value="tonf">tonf</option>
          <option value="kgf">kgf</option>
        </select>

        <label>Tolerancia del modelo</label>
        <input id="pref-model-tolerance" type="number" step="0.0001" class="swal2-input" value="${p.modelTolerance}">

        <label>Tolerancia Snap en pantalla</label>
        <input id="pref-snap-screen" type="number" step="1" class="swal2-input" value="${p.snapScreenTolerance}">

        <label>Tolerancia Snap en mundo</label>
        <input id="pref-snap-world" type="number" step="0.1" class="swal2-input" value="${p.snapWorldTolerance}">
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      didOpen: () => {
        document.getElementById("pref-length-unit").value = p.lengthUnit;
        document.getElementById("pref-force-unit").value = p.forceUnit;
      },
      preConfirm: () => {
        return {
          lengthUnit: document.getElementById("pref-length-unit").value,
          forceUnit: document.getElementById("pref-force-unit").value,
          modelTolerance: Number(document.getElementById("pref-model-tolerance").value),
          snapScreenTolerance: Number(document.getElementById("pref-snap-screen").value),
          snapWorldTolerance: Number(document.getElementById("pref-snap-world").value),
        };
      },
    });

    if (!value) return;

    this.preferences = {
      ...this.preferences,
      ...value,
    };

    this.planGridSnapScreenTolerance = value.snapScreenTolerance;
    this.planGridSnapTolerance = value.snapWorldTolerance;

    localStorage.setItem("cad-preferences", JSON.stringify(this.preferences));

    this.showMessage?.("Dimensions / Tolerances actualizado");
    this.redraw?.();
  },

  applyDimensionsTolerances() {
    this.planGridSnapScreenTolerance = Number(this.preferences?.snapScreenTolerance ?? 14);

    this.planGridSnapTolerance = Number(this.preferences?.snapWorldTolerance ?? 1.0);
  },

  getModelTolerance() {
    return Number(this.preferences?.modelTolerance ?? 0.001);
  },

  async openOutputDecimalsDialog() {
    const d = this.outputDecimals;

    const { value } = await Swal.fire({
      title: "Output Decimals",
      width: 480,
      html: `
      <div style="display:grid; grid-template-columns: 1fr 120px; gap:10px; align-items:center; text-align:left; font-size:13px;">
        <label>Coordenadas</label>
        <input id="dec-coordinates" type="number" min="0" max="8" class="swal2-input" value="${d.coordinates}">

        <label>Longitudes</label>
        <input id="dec-lengths" type="number" min="0" max="8" class="swal2-input" value="${d.lengths}">

        <label>Fuerzas</label>
        <input id="dec-forces" type="number" min="0" max="8" class="swal2-input" value="${d.forces}">

        <label>Desplazamientos</label>
        <input id="dec-displacements" type="number" min="0" max="8" class="swal2-input" value="${d.displacements}">

        <label>Reacciones</label>
        <input id="dec-reactions" type="number" min="0" max="8" class="swal2-input" value="${d.reactions}">
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          coordinates: Number(document.getElementById("dec-coordinates").value),
          lengths: Number(document.getElementById("dec-lengths").value),
          forces: Number(document.getElementById("dec-forces").value),
          displacements: Number(document.getElementById("dec-displacements").value),
          reactions: Number(document.getElementById("dec-reactions").value),
        };
      },
    });

    if (!value) return;

    this.outputDecimals = {
      ...this.outputDecimals,
      ...value,
    };

    localStorage.setItem("cad-output-decimals", JSON.stringify(this.outputDecimals));

    this.showMessage?.("Output Decimals actualizado");
    this.redraw?.();
  },

  async openSteelFrameDesignDialog() {
    const s = this.steelFrameDesign;

    const result = await Swal.fire({
      title: "Steel Frame Design",
      width: 620,
      html: `
      <div style="display:grid; grid-template-columns: 1fr 180px; gap:10px; align-items:center; text-align:left; font-size:13px;">

        <label>Norma de diseño</label>
        <select id="steel-code" class="swal2-input" style="width:170px;">
          <option value="AISC 360-16">AISC 360-16</option>
          <option value="AISC 360-10">AISC 360-10</option>
          <option value="RNE E.090">RNE E.090</option>
        </select>

        <label>Método de diseño</label>
        <select id="steel-method" class="swal2-input" style="width:170px;">
          <option value="LRFD">LRFD</option>
          <option value="ASD">ASD</option>
        </select>

        <label>ϕ Flexión</label>
        <input id="steel-phi-bending" type="number" step="0.01" min="0" max="1"
          class="swal2-input" value="${s.phiBending}">

        <label>ϕ Compresión</label>
        <input id="steel-phi-compression" type="number" step="0.01" min="0" max="1"
          class="swal2-input" value="${s.phiCompression}">

        <label>ϕ Corte</label>
        <input id="steel-phi-shear" type="number" step="0.01" min="0" max="1"
          class="swal2-input" value="${s.phiShear}">

        <label>Límite deflexión carga viva L/</label>
        <input id="steel-deflection-live" type="number" step="1" min="1"
          class="swal2-input" value="${s.deflectionLimitLive}">

        <label>Límite deflexión total L/</label>
        <input id="steel-deflection-total" type="number" step="1" min="1"
          class="swal2-input" value="${s.deflectionLimitTotal}">

        <label>Verificar deflexión</label>
        <input id="steel-check-deflection" type="checkbox" ${s.checkDeflection ? "checked" : ""}>

        <label>Verificar esbeltez</label>
        <input id="steel-check-slenderness" type="checkbox" ${s.checkSlenderness ? "checked" : ""}>

        <label>Verificar compacidad</label>
        <input id="steel-check-compactness" type="checkbox" ${s.checkCompactness ? "checked" : ""}>
      </div>

      <p style="margin-top:12px; font-size:12px; color:#666; text-align:left;">
        Nota: esta configuración guarda los criterios base. El diseño automático de acero se conectará después al motor de análisis.
      </p>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Guardar",
      denyButtonText: "Restaurar",
      cancelButtonText: "Cancelar",
      didOpen: () => {
        document.getElementById("steel-code").value = s.code;
        document.getElementById("steel-method").value = s.designMethod;
      },
      preConfirm: () => {
        return {
          code: document.getElementById("steel-code").value,
          designMethod: document.getElementById("steel-method").value,

          phiBending: Number(document.getElementById("steel-phi-bending").value),
          phiCompression: Number(document.getElementById("steel-phi-compression").value),
          phiShear: Number(document.getElementById("steel-phi-shear").value),

          deflectionLimitLive: Number(document.getElementById("steel-deflection-live").value),
          deflectionLimitTotal: Number(document.getElementById("steel-deflection-total").value),

          checkDeflection: document.getElementById("steel-check-deflection").checked,
          checkSlenderness: document.getElementById("steel-check-slenderness").checked,
          checkCompactness: document.getElementById("steel-check-compactness").checked,
        };
      },
    });

    if (result.isConfirmed && result.value) {
      this.steelFrameDesign = {
        ...this.steelFrameDesign,
        ...result.value,
      };

      localStorage.setItem("cad-steel-frame-design", JSON.stringify(this.steelFrameDesign));

      this.showMessage?.(`Steel Frame Design: ${this.steelFrameDesign.code} - ${this.steelFrameDesign.designMethod}`);

      return;
    }

    if (result.isDenied) {
      this.resetSteelFrameDesign();
    }
  },

  resetSteelFrameDesign() {
    this.steelFrameDesign = {
      code: "AISC 360-16",
      designMethod: "LRFD",

      checkDeflection: true,
      checkSlenderness: true,
      checkCompactness: true,

      phiBending: 0.9,
      phiCompression: 0.9,
      phiShear: 0.9,

      deflectionLimitLive: 360,
      deflectionLimitTotal: 240,
    };

    localStorage.setItem("cad-steel-frame-design", JSON.stringify(this.steelFrameDesign));

    this.showMessage?.("Steel Frame Design restaurado");
  },

  async openReinforcementBarSizesDialog() {
    const rows = this.reinforcementBarSizes
      .map((bar, index) => {
        return `
        <tr>
          <td style="border:1px solid #666; padding:6px; text-align:center;">
            <input id="bar-enabled-${index}" type="checkbox" ${bar.enabled ? "checked" : ""}>
          </td>

          <td style="border:1px solid #666; padding:6px;">
            <input id="bar-name-${index}" value="${bar.name}" style="width:70px; padding:4px;">
          </td>

          <td style="border:1px solid #666; padding:6px;">
            <input id="bar-diameter-${index}" type="number" step="0.1" value="${bar.diameterMm}" style="width:90px; padding:4px;">
          </td>

          <td style="border:1px solid #666; padding:6px;">
            <input id="bar-area-${index}" type="number" step="1" value="${bar.areaMm2}" style="width:90px; padding:4px;">
          </td>
        </tr>
      `;
      })
      .join("");

    const result = await Swal.fire({
      title: "Reinforcement Bar Sizes",
      width: 650,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:10px;">
          Configura las barras de refuerzo disponibles para futuros diseños de concreto armado.
        </p>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #666; padding:6px;">Usar</th>
              <th style="border:1px solid #666; padding:6px;">Barra</th>
              <th style="border:1px solid #666; padding:6px;">Diámetro (mm)</th>
              <th style="border:1px solid #666; padding:6px;">Área (mm²)</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <p style="margin-top:10px; font-size:12px; color:#666;">
          Nota: esta configuración solo guarda el catálogo. El diseño automático de concreto se conectará después.
        </p>
      </div>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Guardar",
      denyButtonText: "Restaurar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.reinforcementBarSizes.map((bar, index) => ({
          name: document.getElementById(`bar-name-${index}`).value,
          diameterMm: Number(document.getElementById(`bar-diameter-${index}`).value),
          areaMm2: Number(document.getElementById(`bar-area-${index}`).value),
          enabled: document.getElementById(`bar-enabled-${index}`).checked,
        }));
      },
    });

    if (result.isConfirmed && result.value) {
      this.reinforcementBarSizes = result.value;

      localStorage.setItem("cad-reinforcement-bar-sizes", JSON.stringify(this.reinforcementBarSizes));

      const enabledCount = this.reinforcementBarSizes.filter((bar) => bar.enabled).length;

      this.showMessage?.(`Barras de refuerzo activas: ${enabledCount}`);
      return;
    }

    if (result.isDenied) {
      this.resetReinforcementBarSizes();
    }
  },

  resetReinforcementBarSizes() {
    this.reinforcementBarSizes = [
      { name: "#3", diameterMm: 9.5, areaMm2: 71, enabled: true },
      { name: "#4", diameterMm: 12.7, areaMm2: 129, enabled: true },
      { name: "#5", diameterMm: 15.9, areaMm2: 199, enabled: true },
      { name: "#6", diameterMm: 19.1, areaMm2: 284, enabled: true },
      { name: "#8", diameterMm: 25.4, areaMm2: 510, enabled: true },
    ];

    localStorage.setItem("cad-reinforcement-bar-sizes", JSON.stringify(this.reinforcementBarSizes));

    this.showMessage?.("Reinforcement Bar Sizes restaurado");
  },

  setDisplayColors(colors) {
    this.displayColors = {
      ...this.displayColors,
      ...colors,
    };

    this.canvas2dBackground = this.displayColors.background2d;

    const panel2D = document.getElementById("cad-panel-2d");

    if (panel2D) {
      panel2D.style.backgroundColor = this.displayColors.background2d;
    }

    if (this.canvas) {
      this.canvas.style.backgroundColor = this.displayColors.background2d;
    }

    localStorage.setItem("cad-display-colors", JSON.stringify(this.displayColors));

    this.showMessage?.("Colores de visualización actualizados");

    this.redraw?.();
    this.sync3D?.();
  },

  resetDisplayColors() {
    const defaults =
      this.activeCanvasTheme === "light"
        ? {
            background2d: "#e5e7eb",
            gridLine: "#cbd5e1",
            gridMainLine: "#2563eb",
            beam: "#11c9cf",
            secondaryBeam: "#0284c7",
            column: "#16a34a",
            node: "#475569",
            text: "#111827",
            selected: "#ca8a04",
            snap: "#ea580c",
          }
        : {
            background2d: "#36454F",
            gridLine: "#2f5f7f",
            gridMainLine: "#3b82f6",
            beam: "#d1d5db",
            secondaryBeam: "#38bdf8",
            column: "#22c55e",
            node: "#9ca3af",
            text: "#ffffff",
            selected: "#facc15",
            snap: "#f97316",
          };

    this.setDisplayColors(defaults);
  },

  formatOutput(value, type = "coordinates") {
    const decimals = this.outputDecimals?.[type] ?? 2;
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0";
    }

    return number.toFixed(decimals);
  },

  formatCoordinates(x = 0, y = 0, z = 0) {
    return `X ${this.formatOutput(x, "coordinates")}  Y ${this.formatOutput(y, "coordinates")}  Z ${this.formatOutput(z, "coordinates")}`;
  },


};

import Swal from "sweetalert2";

/**
 * @mixin designMixin
 *
 * Diseño y verificación de elementos estructurales de acero.
 *
 * Implementa los flujos de diseño de Steel Frame (vigas/columnas/arriostres)
 * y Steel Joist (viguetas metálicas), siguiendo el patrón ETABS:
 *   Select Combo → View/Revise Overwrites → Start Design/Check → Display Info.
 *
 * Los cálculos son simplificados (ratio demanda/capacidad referencial).
 * La capacidad real depende del código AISC 360-16 configurado en steelFrameDesign.
 *
 * Responsabilidades:
 *
 * Steel Frame Design:
 * - openSteelFrameSelectComboDialog()         → elige combinaciones de diseño
 * - openSteelFrameOverwritesDialog()          → parámetros por elemento (K, longitud, Cb)
 * - startSteelFrameDesignCheck()              → corre el diseño y guarda resultados
 * - openSteelFrameDisplayDesignInfoDialog()   → controla qué se muestra en canvas
 *
 * Steel Joist Design:
 * - openSteelJoistSelectComboDialog()         → elige combinaciones de diseño
 * - openSteelJoistOverwritesDialog()          → parámetros de vigueta (tipo, peralte, espaciado)
 * - startSteelJoistDesignUsingSimilarity()    → diseño agrupado por similitud geométrica
 * - startSteelJoistDesignWithoutSimilarity()  → diseño individual por elemento
 * - openSteelJoistDisplayDesignInfoDialog()   → controla visualización de resultados
 *
 * Auxiliares:
 * - getSelectedFramesForDesign()              → frames seleccionados para diseño
 * - calculateSteelFrameDesignResult(frame, combo) → calcula ratio D/C para un frame
 * - calculateSteelJoistDesignResult(joist, combo) → calcula ratio D/C para un joist
 * - getActiveDesignDisplayMode()              → modo de visualización activo (frame o joist)
 * - formatDesignInfoText(result, infoType)    → formatea el texto a dibujar en canvas
 *
 * Visualización de resultados (desde menú Display):
 * - showLoadsOnJoints()     → diálogo para mostrar cargas en nudos
 * - showLoadsOnFrames()     → diálogo para mostrar cargas en barras
 * - showDeformedShape()     → diálogo para configurar forma deformada
 * - showModeShape()         → diálogo para forma modal
 * - showMemberForces()      → diálogo para diagramas de fuerzas internas
 */
export const designMixin = {
  getSelectedFramesForDesign() {
    if (typeof this.getSelectedFramesForAssign === "function") {
      return this.getSelectedFramesForAssign();
    }

    const selectedObjects = this.getSelectedObjects?.() || [];

    return selectedObjects.filter((obj) => {
      if (!obj) return false;

      const hasFrameGeometry = obj.node1 && obj.node2;

      const type = String(obj.elementType || obj.type || obj.objectType || obj.constructor?.name || "").toLowerCase();

      return (
        hasFrameGeometry ||
        type === "beam" ||
        type === "column" ||
        type === "brace" ||
        type === "frame" ||
        type === "line" ||
        type === "secondary-beam" ||
        type === "secondarybeam"
      );
    });
  },

  getSelectedJoistsForDesign() {
    const selectedFrames = this.getSelectedFramesForDesign();

    return selectedFrames.filter((frame) => {
      const type = String(frame.elementType || frame.type || frame.objectType || "").toLowerCase();

      return (
        type.includes("joist") ||
        type.includes("secondary") ||
        frame.isSteelJoist === true ||
        frame.designType === "steel-joist" ||
        true
      );
    });
  },

  cloneDesignData(data) {
    return JSON.parse(JSON.stringify(data || {}));
  },

  sanitizeDesignResult(result) {
    if (!result) return null;

    const { allCombos, ...baseResult } = result;

    return {
      ...baseResult,

      allCombos: Array.isArray(allCombos)
        ? allCombos.map((combo) => {
            const { allCombos: _ignoredAllCombos, ...cleanCombo } = combo;

            return { ...cleanCombo };
          })
        : [],
    };
  },

  getDefaultDesignCombos() {
    return [
      { id: "COMB1", name: "COMB1", expression: "1.4CM + 1.7CV" },
      { id: "COMB2", name: "COMB2", expression: "1.25CM + 1.25CV + 1.0CVV+" },
      { id: "COMB3", name: "COMB3", expression: "0.9CM + 1.0CVV-" },
    ];
  },

  normalizeDesignCombo(combo, index = 0) {
    const id = combo.id || combo.name || combo.comboName || combo.nombre || `COMBO_${index + 1}`;

    const name = combo.name || combo.comboName || combo.nombre || String(id);

    const expression = combo.expression || combo.formula || combo.descripcion || combo.description || "";

    return {
      ...combo,
      id,
      name,
      expression,
    };
  },

  getAvailableDesignCombos() {
    let combos = [];

    if (Array.isArray(this.loadCombinations?.combinations)) {
      combos = this.loadCombinations.combinations;
    } else if (Array.isArray(this.loadCombinations?.items)) {
      combos = this.loadCombinations.items;
    }

    if (!combos.length) {
      combos = this.getDefaultDesignCombos();
    }

    return combos.map((combo, index) => this.normalizeDesignCombo(combo, index));
  },

  buildDesignComboRows(combos, selectedCombos = []) {
    return combos
      .map((combo) => {
        const checked = selectedCombos.includes(String(combo.id)) ? "checked" : "";

        return `
      <label style="display:grid; grid-template-columns: 34px 110px 1fr; gap:8px; align-items:center; padding:7px; border-bottom:1px solid #444;">
        <input 
          type="checkbox" 
          class="design-combo-checkbox" 
          value="${combo.id}" 
          ${checked}
        >

        <span style="font-weight:bold;">${combo.name}</span>

        <span style="font-size:12px; color:#aaa;">
          ${combo.expression || "Sin expresión"}
        </span>
      </label>
    `;
      })
      .join("");
  },

  readSelectedDesignCombosFromDialog() {
    const selectedCombos = Array.from(document.querySelectorAll(".design-combo-checkbox:checked")).map(
      (item) => item.value,
    );

    if (!selectedCombos.length) {
      Swal.showValidationMessage("Selecciona al menos una combinación de diseño.");
      return false;
    }

    return selectedCombos;
  },

  async openSteelFrameSelectComboDialog() {
    this.ensureDesignOptions();

    const combos = this.getAvailableDesignCombos();
    const selectedCombos = this.designOptions.steelFrame.selectedCombos || [];

    const result = await Swal.fire({
      title: "Steel Frame Design - Select Design Combo",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona las combinaciones de carga que se usarán para el diseño/verificación de elementos Steel Frame.
        </p>

        <div style="border:1px solid #555; border-radius:6px; max-height:320px; overflow:auto;">
          <div style="display:grid; grid-template-columns: 34px 110px 1fr; gap:8px; padding:7px; background:#1f2937; color:white; font-weight:bold;">
            <span></span>
            <span>Combo</span>
            <span>Expresión</span>
          </div>

          ${this.buildDesignComboRows(combos, selectedCombos)}
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Esta selección no ejecuta el diseño todavía. Solo define qué combinaciones usará 
          Start Design/Check of Structure.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readSelectedDesignCombosFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.designOptions.steelFrame.selectedCombos = result.value;

    this.showMessage?.(`Steel Frame Design: ${result.value.length} combinación(es) seleccionada(s).`);

    console.log("✅ Steel Frame Design Combos:", this.designOptions.steelFrame.selectedCombos);
  },

  async openSteelFrameOverwritesDialog() {
    this.ensureDesignOptions();

    const selectedFrames = this.getSelectedFramesForDesign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const current =
      selectedFrames[0]?.steelFrameDesignOverwrites ||
      selectedFrames[0]?.designOverwrites?.steelFrame ||
      this.designOptions.steelFrame.defaultOverwrites;

    const result = await Swal.fire({
      title: "Steel Frame Design - View/Revise Overwrites",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Define parámetros especiales de diseño para los elementos Steel Frame seleccionados.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sf-design-enabled" type="checkbox" ${current.designEnabled !== false ? "checked" : ""}>
          Design this frame object
        </label>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">K Factor Major</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-k-major" type="number" step="0.01" value="${current.kFactorMajor ?? 1}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">K Factor Minor</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-k-minor" type="number" step="0.01" value="${current.kFactorMinor ?? 1}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Unbraced Length Major</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-lb-major" type="number" step="0.001" value="${current.unbracedLengthMajor ?? 0}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Unbraced Length Minor</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-lb-minor" type="number" step="0.001" value="${current.unbracedLengthMinor ?? 0}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Cb Factor</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-cb" type="number" step="0.01" value="${current.cbFactor ?? 1}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Effective Length Factor</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-effective-length" type="number" step="0.01" value="${current.effectiveLengthFactor ?? 1}" style="width:100%; padding:5px;">
              </td>
            </tr>
          </tbody>
        </table>

        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input id="sf-deflection-check" type="checkbox" ${current.deflectionCheck !== false ? "checked" : ""}>
          Check Deflection
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Elementos seleccionados: <b>${selectedFrames.length}</b><br>
          Estos valores se guardan en cada Frame seleccionado y serán usados luego por Start Design/Check.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readSteelFrameOverwritesFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignSteelFrameOverwritesToSelected(result.value);
  },

  readSteelFrameOverwritesFromDialog() {
    const readNumber = (id, fallback = 0) => {
      const value = Number(document.getElementById(id)?.value ?? fallback);
      return Number.isFinite(value) ? value : fallback;
    };

    return {
      designEnabled: document.getElementById("sf-design-enabled")?.checked === true,

      kFactorMajor: readNumber("sf-k-major", 1),
      kFactorMinor: readNumber("sf-k-minor", 1),

      unbracedLengthMajor: readNumber("sf-lb-major", 0),
      unbracedLengthMinor: readNumber("sf-lb-minor", 0),

      cbFactor: readNumber("sf-cb", 1),
      effectiveLengthFactor: readNumber("sf-effective-length", 1),

      deflectionCheck: document.getElementById("sf-deflection-check")?.checked === true,
    };
  },

  assignSteelFrameOverwritesToSelected(overwrites) {
    const selectedFrames = this.getSelectedFramesForDesign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Steel Frame seleccionados.", "warning");
      return;
    }

    selectedFrames.forEach((frame) => {
      if (!frame.designOverwrites) {
        frame.designOverwrites = {};
      }

      frame.designOverwrites.steelFrame = this.cloneDesignData(overwrites);
      frame.steelFrameDesignOverwrites = this.cloneDesignData(overwrites);

      frame.designType = "steel-frame";
      frame.hasSteelFrameDesignOverwrites = true;

      frame.assignment = {
        ...(frame.assignment || {}),
        design: {
          ...(frame.assignment?.design || {}),
          steelFrameOverwrites: this.cloneDesignData(overwrites),
        },
      };
    });

    this.redraw?.();

    this.showMessage?.(`Steel Frame Overwrites asignados a ${selectedFrames.length} elemento(s).`);

    console.log("✅ Steel Frame Overwrites:", {
      overwrites,
      selectedFrames,
    });
  },

  async startSteelFrameDesignCheck() {
    this.ensureDesignOptions();

    const frames = this.getFramesForSteelFrameDesign();
    const combos = this.designOptions.steelFrame.selectedCombos || ["COMB1"];

    if (!frames.length) {
      this.showMessage?.("No hay elementos Steel Frame disponibles para diseñar/verificar.", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Start Design/Check of Structure",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p>
          Se verificará el diseño de los elementos Steel Frame disponibles.
        </p>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          Elementos a verificar: <b>${frames.length}</b><br>
          Combinaciones: <b>${combos.join(", ")}</b>
        </div>

        <p style="margin-top:12px; color:#777; font-size:12px;">
          Versión inicial: se calcula un ratio simplificado usando fuerza axial existente o cargas asignadas.
        </p>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Iniciar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    let okCount = 0;
    let ngCount = 0;

    frames.forEach((frame) => {
      const resultsByCombo = combos.map((comboName) => this.calculateSteelFrameDesignResult(frame, comboName));

      const controllingResult = resultsByCombo.reduce((max, item) => {
        return item.ratio > max.ratio ? item : max;
      }, resultsByCombo[0]);

      controllingResult.allCombos = resultsByCombo;

      this.saveSteelFrameDesignResult(frame, controllingResult);

      if (controllingResult.status === "OK") {
        okCount++;
      } else {
        ngCount++;
      }
    });

    this.designOptions.steelFrame.lastRun = {
      checkedAt: new Date().toISOString(),
      total: frames.length,
      ok: okCount,
      ng: ngCount,
      combos,
    };

    this.redraw?.();
    // No es necesario sync3D aquí porque no se modifican nodos, barras ni geometría 3D.

    this.showMessage?.(`Steel Frame Design completado: ${okCount} OK / ${ngCount} NG.`);

    console.log("✅ Steel Frame Design Results:", {
      frames,
      summary: this.designOptions.steelFrame.lastRun,
    });
  },

  calculateSteelJoistDesignResult(joist, comboName = "COMB1", similarityGroup = null) {
    const overwrites =
      joist.steelJoistDesignOverwrites ||
      joist.designOverwrites?.steelJoist ||
      this.designOptions?.steelJoist?.defaultOverwrites ||
      {};

    const length = this.getFrameLengthForDesign(joist);
    const demand = this.getFrameAxialDemandForDesign(joist);

    const depth = Number(overwrites.joistDepth || 0.45);
    const spacing = Number(overwrites.joistSpacing || 1.2);

    // Capacidad simplificada referencial para joist.
    const capacity = Math.max(depth * spacing * 120, 0.001);

    const ratio = demand / capacity;

    return {
      type: "steel-joist",
      combo: comboName,
      joistType: overwrites.joistType || "K-Series",
      length,
      depth,
      spacing,
      demand,
      capacity,
      ratio,
      status: ratio <= 1 ? "OK" : "NG",
      similarityGroup,
      checkedAt: new Date().toISOString(),
    };
  },

  saveSteelJoistDesignResult(joist, result) {
    if (!joist.designResults) {
      joist.designResults = {};
    }

    const cleanResult = this.sanitizeDesignResult(result);

    joist.designResults.steelJoist = this.cloneDesignData(cleanResult);
    joist.steelJoistDesignResult = this.cloneDesignData(cleanResult);

    joist.designType = "steel-joist";
    joist.isSteelJoist = true;

    joist.assignment = {
      ...(joist.assignment || {}),
      design: {
        ...(joist.assignment?.design || {}),
        steelJoistResult: this.cloneDesignData(cleanResult),
      },
    };
  },

  getJoistSimilarityKey(joist) {
    const length = this.getFrameLengthForDesign(joist);
    const roundedLength = Math.round(length * 10) / 10;

    const overwrites =
      joist.steelJoistDesignOverwrites ||
      joist.designOverwrites?.steelJoist ||
      this.designOptions?.steelJoist?.defaultOverwrites ||
      {};

    const type = overwrites.joistType || "K-Series";
    const depth = Number(overwrites.joistDepth || 0.45).toFixed(2);

    return `${type}_L${roundedLength}_D${depth}`;
  },

  groupJoistsBySimilarity(joists = []) {
    const groups = {};

    joists.forEach((joist) => {
      const key = this.getJoistSimilarityKey(joist);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(joist);
    });

    return groups;
  },

  async openSteelFrameDisplayDesignInfoDialog() {
    this.ensureDesignOptions();

    const current = this.designOptions.steelFrame.displayInfo;

    const designedFrames = this.getAllFramesForDesign().filter((frame) => frame.steelFrameDesignResult);

    const result = await Swal.fire({
      title: "Steel Frame Design - Display Design Info",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de resultados de diseño Steel Frame.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sf-display-show" type="checkbox" ${current.show ? "checked" : ""}>
          Show Steel Frame Design Info
        </label>

        <label style="display:block; margin-bottom:5px;">Design Info Type</label>
        <select id="sf-display-info-type" style="width:100%; padding:7px; margin-bottom:12px;">
          <option value="ratio">Ratio</option>
          <option value="status">Status OK / NG</option>
          <option value="combo">Controlling Combo</option>
          <option value="section">Section</option>
          <option value="demand-capacity">Demand / Capacity</option>
        </select>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sf-display-values" type="checkbox" ${current.showValues !== false ? "checked" : ""}>
          Show Values
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Elementos con resultado Steel Frame: <b>${designedFrames.length}</b><br>
          Si no hay resultados, primero ejecuta Start Design/Check of Structure.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const select = document.getElementById("sf-display-info-type");
        if (select) select.value = current.infoType || "ratio";
      },

      preConfirm: () => {
        return {
          show: document.getElementById("sf-display-show")?.checked === true,
          infoType: document.getElementById("sf-display-info-type")?.value || "ratio",
          showValues: document.getElementById("sf-display-values")?.checked === true,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.designOptions.steelFrame.displayInfo = result.value;

    if (result.value.show) {
      this.designOptions.steelJoist.displayInfo.show = false;
    }

    this.redraw?.();
    // No llamamos sync3D aquí porque Display Design Info solo dibuja etiquetas en el canvas 2D.

    this.showMessage?.(
      result.value.show
        ? `Mostrando Steel Frame Design Info: ${result.value.infoType}`
        : "Steel Frame Design Info oculto.",
    );
  },

  async openSteelJoistSelectComboDialog() {
    this.ensureDesignOptions();

    const combos = this.getAvailableDesignCombos();
    const selectedCombos = this.designOptions.steelJoist.selectedCombos || [];

    const result = await Swal.fire({
      title: "Steel Joist Design - Select Design Combo",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona las combinaciones de carga que se usarán para el diseño/verificación de joists metálicos.
        </p>

        <div style="border:1px solid #555; border-radius:6px; max-height:320px; overflow:auto;">
          <div style="display:grid; grid-template-columns: 34px 110px 1fr; gap:8px; padding:7px; background:#1f2937; color:white; font-weight:bold;">
            <span></span>
            <span>Combo</span>
            <span>Expresión</span>
          </div>

          ${this.buildDesignComboRows(combos, selectedCombos)}
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Esta selección será usada por Start Design Using Similarity y Start Design Without Similarity.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readSelectedDesignCombosFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.designOptions.steelJoist.selectedCombos = result.value;

    this.showMessage?.(`Steel Joist Design: ${result.value.length} combinación(es) seleccionada(s).`);

    console.log("✅ Steel Joist Design Combos:", this.designOptions.steelJoist.selectedCombos);
  },

  async openSteelJoistOverwritesDialog() {
    this.ensureDesignOptions();

    const selectedJoists = this.getSelectedJoistsForDesign();

    if (!selectedJoists.length) {
      this.showMessage?.(
        "Selecciona primero uno o más elementos Frame / Line para tratarlos como Steel Joist.",
        "warning",
      );
      return;
    }

    const current =
      selectedJoists[0]?.steelJoistDesignOverwrites ||
      selectedJoists[0]?.designOverwrites?.steelJoist ||
      this.designOptions.steelJoist.defaultOverwrites;

    const result = await Swal.fire({
      title: "Steel Joist Design - View/Revise Overwrites",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Define parámetros especiales de diseño para los elementos Steel Joist seleccionados.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sj-design-enabled" type="checkbox" ${current.designEnabled !== false ? "checked" : ""}>
          Design this joist object
        </label>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sj-mark-as-joist" type="checkbox" ${current.markAsJoist !== false ? "checked" : ""}>
          Mark selected frames as Steel Joist
        </label>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Joist Type</label>
            <select id="sj-type" style="width:100%; padding:7px;">
              <option value="K-Series">K-Series</option>
              <option value="LH-Series">LH-Series</option>
              <option value="DLH-Series">DLH-Series</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Joist Depth</label>
            <input id="sj-depth" type="number" step="0.001" value="${current.joistDepth ?? 0.45}" style="width:100%; padding:7px;">
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">Joist Spacing</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sj-spacing" type="number" step="0.001" value="${current.joistSpacing ?? 1.2}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Similarity Tolerance</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sj-similarity-tolerance" type="number" step="0.01" value="${current.similarityTolerance ?? 0.05}" style="width:100%; padding:5px;">
              </td>
            </tr>
          </tbody>
        </table>

        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input id="sj-use-similarity" type="checkbox" ${current.useSimilarity !== false ? "checked" : ""}>
          Allow Similarity Design
        </label>

        <label style="display:flex; align-items:center; gap:8px; margin-top:8px;">
          <input id="sj-deflection-check" type="checkbox" ${current.deflectionCheck !== false ? "checked" : ""}>
          Check Deflection
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Elementos seleccionados: <b>${selectedJoists.length}</b><br>
          En esta versión inicial, estos datos permiten diferenciar los joists de las vigas normales.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const typeSelect = document.getElementById("sj-type");
        if (typeSelect) {
          typeSelect.value = current.joistType || "K-Series";
        }
      },

      preConfirm: () => {
        return this.readSteelJoistOverwritesFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignSteelJoistOverwritesToSelected(result.value);
  },

  readSteelJoistOverwritesFromDialog() {
    const readNumber = (id, fallback = 0) => {
      const value = Number(document.getElementById(id)?.value ?? fallback);
      return Number.isFinite(value) ? value : fallback;
    };

    return {
      designEnabled: document.getElementById("sj-design-enabled")?.checked === true,

      markAsJoist: document.getElementById("sj-mark-as-joist")?.checked === true,

      joistType: document.getElementById("sj-type")?.value || "K-Series",

      joistDepth: readNumber("sj-depth", 0.45),

      joistSpacing: readNumber("sj-spacing", 1.2),

      useSimilarity: document.getElementById("sj-use-similarity")?.checked === true,

      similarityTolerance: readNumber("sj-similarity-tolerance", 0.05),

      deflectionCheck: document.getElementById("sj-deflection-check")?.checked === true,
    };
  },

  assignSteelJoistOverwritesToSelected(overwrites) {
    const selectedJoists = this.getSelectedJoistsForDesign();

    if (!selectedJoists.length) {
      this.showMessage?.("No hay elementos Steel Joist seleccionados.", "warning");
      return;
    }

    selectedJoists.forEach((joist) => {
      if (!joist.designOverwrites) {
        joist.designOverwrites = {};
      }

      joist.designOverwrites.steelJoist = this.cloneDesignData(overwrites);
      joist.steelJoistDesignOverwrites = this.cloneDesignData(overwrites);

      joist.designType = "steel-joist";

      if (overwrites.markAsJoist) {
        joist.isSteelJoist = true;
        joist.elementType = joist.elementType || "steel-joist";
      }

      joist.hasSteelJoistDesignOverwrites = true;

      joist.assignment = {
        ...(joist.assignment || {}),
        design: {
          ...(joist.assignment?.design || {}),
          steelJoistOverwrites: this.cloneDesignData(overwrites),
        },
      };
    });

    this.redraw?.();

    this.showMessage?.(`Steel Joist Overwrites asignados a ${selectedJoists.length} elemento(s).`);

    console.log("✅ Steel Joist Overwrites:", {
      overwrites,
      selectedJoists,
    });
  },

  async startSteelJoistDesignUsingSimilarity() {
    this.ensureDesignOptions();

    const joists = this.getFramesForSteelJoistDesign();
    const combos = this.designOptions.steelJoist.selectedCombos || ["COMB1"];

    if (!joists.length) {
      this.showMessage?.(
        "No hay elementos Steel Joist disponibles. Selecciona frames y usa View/Revise Overwrites para marcarlos como joists.",
        "warning",
      );
      return;
    }

    const groups = this.groupJoistsBySimilarity(joists);
    const groupCount = Object.keys(groups).length;

    const result = await Swal.fire({
      title: "Start Design Using Similarity",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p>
          Se diseñarán joists agrupados por similitud.
        </p>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          Joists: <b>${joists.length}</b><br>
          Grupos similares: <b>${groupCount}</b><br>
          Combinaciones: <b>${combos.join(", ")}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Iniciar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    let okCount = 0;
    let ngCount = 0;

    Object.entries(groups).forEach(([groupKey, groupJoists]) => {
      groupJoists.forEach((joist) => {
        const resultsByCombo = combos.map((comboName) =>
          this.calculateSteelJoistDesignResult(joist, comboName, groupKey),
        );

        const controllingResult = resultsByCombo.reduce((max, item) => {
          return item.ratio > max.ratio ? item : max;
        }, resultsByCombo[0]);

        controllingResult.allCombos = resultsByCombo;
        controllingResult.designMode = "using-similarity";

        this.saveSteelJoistDesignResult(joist, controllingResult);

        if (controllingResult.status === "OK") {
          okCount++;
        } else {
          ngCount++;
        }
      });
    });

    this.designOptions.steelJoist.lastRun = {
      checkedAt: new Date().toISOString(),
      mode: "using-similarity",
      total: joists.length,
      groups: groupCount,
      ok: okCount,
      ng: ngCount,
      combos,
    };

    this.redraw?.();
    // No es necesario sync3D aquí porque no se modifican nodos, barras ni geometría 3D.

    this.showMessage?.(`Steel Joist Design con similitud completado: ${okCount} OK / ${ngCount} NG.`);

    console.log("✅ Steel Joist Design Using Similarity:", {
      joists,
      groups,
      summary: this.designOptions.steelJoist.lastRun,
    });
  },

  async startSteelJoistDesignWithoutSimilarity() {
    this.ensureDesignOptions();

    const joists = this.getFramesForSteelJoistDesign();
    const combos = this.designOptions.steelJoist.selectedCombos || ["COMB1"];

    if (!joists.length) {
      this.showMessage?.(
        "No hay elementos Steel Joist disponibles. Selecciona frames y usa View/Revise Overwrites para marcarlos como joists.",
        "warning",
      );
      return;
    }

    const result = await Swal.fire({
      title: "Start Design Without Similarity",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p>
          Se diseñará cada joist individualmente, sin agrupar por similitud.
        </p>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          Joists a verificar: <b>${joists.length}</b><br>
          Combinaciones: <b>${combos.join(", ")}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Iniciar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    let okCount = 0;
    let ngCount = 0;

    joists.forEach((joist) => {
      const resultsByCombo = combos.map((comboName) => this.calculateSteelJoistDesignResult(joist, comboName, null));

      const controllingResult = resultsByCombo.reduce((max, item) => {
        return item.ratio > max.ratio ? item : max;
      }, resultsByCombo[0]);

      controllingResult.allCombos = resultsByCombo;
      controllingResult.designMode = "without-similarity";

      this.saveSteelJoistDesignResult(joist, controllingResult);

      if (controllingResult.status === "OK") {
        okCount++;
      } else {
        ngCount++;
      }
    });

    this.designOptions.steelJoist.lastRun = {
      checkedAt: new Date().toISOString(),
      mode: "without-similarity",
      total: joists.length,
      ok: okCount,
      ng: ngCount,
      combos,
    };

    this.redraw?.();
    // No es necesario sync3D aquí porque no se modifican nodos, barras ni geometría 3D.

    this.showMessage?.(`Steel Joist Design sin similitud completado: ${okCount} OK / ${ngCount} NG.`);

    console.log("✅ Steel Joist Design Without Similarity:", {
      joists,
      summary: this.designOptions.steelJoist.lastRun,
    });
  },

  async openSteelJoistDisplayDesignInfoDialog() {
    this.ensureDesignOptions();

    const current = this.designOptions.steelJoist.displayInfo;

    const designedJoists = this.getAllFramesForDesign().filter((frame) => frame.steelJoistDesignResult);

    const result = await Swal.fire({
      title: "Steel Joist Design - Display Design Info",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de resultados de diseño Steel Joist.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sj-display-show" type="checkbox" ${current.show ? "checked" : ""}>
          Show Steel Joist Design Info
        </label>

        <label style="display:block; margin-bottom:5px;">Design Info Type</label>
        <select id="sj-display-info-type" style="width:100%; padding:7px; margin-bottom:12px;">
          <option value="ratio">Ratio</option>
          <option value="status">Status OK / NG</option>
          <option value="combo">Controlling Combo</option>
          <option value="joist-type">Joist Type</option>
          <option value="similarity-group">Similarity Group</option>
          <option value="demand-capacity">Demand / Capacity</option>
        </select>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sj-display-values" type="checkbox" ${current.showValues !== false ? "checked" : ""}>
          Show Values
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Elementos con resultado Steel Joist: <b>${designedJoists.length}</b><br>
          Si no hay resultados, primero ejecuta Start Design Using Similarity o Without Similarity.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const select = document.getElementById("sj-display-info-type");
        if (select) select.value = current.infoType || "ratio";
      },

      preConfirm: () => {
        return {
          show: document.getElementById("sj-display-show")?.checked === true,
          infoType: document.getElementById("sj-display-info-type")?.value || "ratio",
          showValues: document.getElementById("sj-display-values")?.checked === true,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.designOptions.steelJoist.displayInfo = result.value;

    if (result.value.show) {
      this.designOptions.steelFrame.displayInfo.show = false;
    }

    this.redraw?.();
    // No llamamos sync3D aquí porque Display Design Info solo dibuja etiquetas en el canvas 2D.

    this.showMessage?.(
      result.value.show
        ? `Mostrando Steel Joist Design Info: ${result.value.infoType}`
        : "Steel Joist Design Info oculto.",
    );
  },

  getAllFramesForDesign() {
    return (this.shapes || []).filter((frame) => {
      return frame?.node1 && frame?.node2;
    });
  },

  getFramesForSteelFrameDesign() {
    const selectedFrames = this.getSelectedFramesForDesign?.() || [];

    const sourceFrames = selectedFrames.length ? selectedFrames : this.getAllFramesForDesign();

    return sourceFrames.filter((frame) => {
      const overwrites =
        frame.steelFrameDesignOverwrites ||
        frame.designOverwrites?.steelFrame ||
        this.designOptions?.steelFrame?.defaultOverwrites ||
        {};

      return overwrites.designEnabled !== false;
    });
  },

  getFramesForSteelJoistDesign() {
    const selectedFrames = this.getSelectedFramesForDesign?.() || [];
    const allFrames = this.getAllFramesForDesign();

    let joists = allFrames.filter((frame) => {
      const type = String(frame.elementType || frame.type || frame.designType || "").toLowerCase();

      return (
        frame.isSteelJoist === true ||
        frame.designType === "steel-joist" ||
        type.includes("joist") ||
        type.includes("secondary")
      );
    });

    // Si no hay joists marcados, usamos los seleccionados como joists temporales.
    if (!joists.length && selectedFrames.length) {
      joists = selectedFrames;
    }

    return joists.filter((frame) => {
      const overwrites =
        frame.steelJoistDesignOverwrites ||
        frame.designOverwrites?.steelJoist ||
        this.designOptions?.steelJoist?.defaultOverwrites ||
        {};

      return overwrites.designEnabled !== false;
    });
  },

  getFrameLengthForDesign(frame) {
    if (!frame?.node1?.position || !frame?.node2?.position) return 0;

    const p1 = frame.node1.position;
    const p2 = frame.node2.position;

    const dx = Number(p2.x || 0) - Number(p1.x || 0);
    const dy = Number(p2.y || 0) - Number(p1.y || 0);
    const dz = Number(p2.z || 0) - Number(p1.z || 0);

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  getFrameAreaForDesign(frame) {
    const section = frame.frameSection || frame.section || frame.assignment?.frameSection || null;

    const areaFromSection = Number(section?.A ?? section?.area ?? section?.Area ?? 0);

    if (areaFromSection > 0) return areaFromSection;

    const areaFromFrame = Number(frame.A ?? frame._A ?? 0);

    if (areaFromFrame > 0) return areaFromFrame;

    const sectionId = frame.sectionId || frame.sectionName || section?.id || section?.name;

    const areaFromSectionsList = Number(this.sections?.[sectionId] ?? 0);

    if (areaFromSectionsList > 0) return areaFromSectionsList;

    // Área mínima de respaldo para evitar división entre cero.
    return 0.01;
  },

  getFrameSectionNameForDesign(frame) {
    return (
      frame.sectionName ||
      frame.frameSection?.name ||
      frame.section?.name ||
      frame.sectionId ||
      frame.globalA ||
      "Sin sección"
    );
  },

  getFrameAxialDemandForDesign(frame) {
    const axial = Number(frame.fAxial ?? frame.axialForce ?? 0);

    if (Number.isFinite(axial) && Math.abs(axial) > 0) {
      return Math.abs(axial);
    }

    const loads = frame.frameLoads || frame.lineLoads || [];
    let estimatedDemand = 0;

    loads.forEach((load) => {
      if (load.type === "point") {
        estimatedDemand += Math.abs(Number(load.value || 0));
      }

      if (load.type === "distributed") {
        const length = this.getFrameLengthForDesign(frame) || 1;
        const w1 = Math.abs(Number(load.startValue || 0));
        const w2 = Math.abs(Number(load.endValue || 0));

        estimatedDemand += ((w1 + w2) / 2) * length;
      }

      if (load.type === "temperature") {
        estimatedDemand += 1;
      }
    });

    // Demanda mínima simbólica si todavía no hay análisis ni cargas.
    return estimatedDemand > 0 ? estimatedDemand : 1;
  },

  getSteelFrameCapacityForDesign(frame) {
    const area = this.getFrameAreaForDesign(frame);

    const phi = Number(this.steelFrameDesign?.phiCompression ?? 0.9) || 0.9;

    // Capacidad simplificada referencial.
    // No es cálculo normativo real.
    const fy = 250; // kN/m2 referencial simplificado para versión inicial

    return Math.max(area * fy * phi, 0.001);
  },

  calculateSteelFrameDesignResult(frame, comboName = "COMB1") {
    const demand = this.getFrameAxialDemandForDesign(frame);
    const capacity = this.getSteelFrameCapacityForDesign(frame);
    const ratio = demand / capacity;

    return {
      type: "steel-frame",
      combo: comboName,
      section: this.getFrameSectionNameForDesign(frame),
      length: this.getFrameLengthForDesign(frame),
      area: this.getFrameAreaForDesign(frame),
      demand,
      capacity,
      ratio,
      status: ratio <= 1 ? "OK" : "NG",
      checkedAt: new Date().toISOString(),
    };
  },

  saveSteelFrameDesignResult(frame, result) {
    if (!frame.designResults) {
      frame.designResults = {};
    }

    const cleanResult = this.sanitizeDesignResult(result);

    frame.designResults.steelFrame = this.cloneDesignData(cleanResult);
    frame.steelFrameDesignResult = this.cloneDesignData(cleanResult);

    frame.assignment = {
      ...(frame.assignment || {}),
      design: {
        ...(frame.assignment?.design || {}),
        steelFrameResult: this.cloneDesignData(cleanResult),
      },
    };
  },

  getActiveDesignDisplayMode() {
    this.ensureDesignOptions();

    if (this.designOptions.steelFrame.displayInfo?.show) {
      return {
        type: "steel-frame",
        options: this.designOptions.steelFrame.displayInfo,
      };
    }

    if (this.designOptions.steelJoist.displayInfo?.show) {
      return {
        type: "steel-joist",
        options: this.designOptions.steelJoist.displayInfo,
      };
    }

    return null;
  },

  getDesignResultForDisplay(frame) {
    const mode = this.getActiveDesignDisplayMode();

    if (!mode) return null;

    if (mode.type === "steel-frame") {
      return frame.steelFrameDesignResult || frame.designResults?.steelFrame || null;
    }

    if (mode.type === "steel-joist") {
      return frame.steelJoistDesignResult || frame.designResults?.steelJoist || null;
    }

    return null;
  },

  formatDesignInfoText(result, infoType = "ratio") {
    if (!result) return "";

    const dec = this.outputDecimals?.forces ?? 2;

    if (infoType === "ratio") {
      return `${result.status}  Ratio=${Number(result.ratio || 0).toFixed(2)}`;
    }

    if (infoType === "status") {
      return `${result.status}`;
    }

    if (infoType === "combo") {
      return `${result.combo || "COMBO"}`;
    }

    if (infoType === "section") {
      return `${result.section || "Sin sección"}`;
    }

    if (infoType === "joist-type") {
      return `${result.joistType || "Joist"}`;
    }

    if (infoType === "similarity-group") {
      return `${result.similarityGroup || "Sin grupo"}`;
    }

    if (infoType === "demand-capacity") {
      const demand = Number(result.demand || 0).toFixed(dec);
      const capacity = Number(result.capacity || 0).toFixed(dec);
      return `D/C ${demand}/${capacity}`;
    }

    return `${result.status}  Ratio=${Number(result.ratio || 0).toFixed(2)}`;
  },

  // ==================================================
  // ========== MÉTODOS PARA EL MENÚ DISPLAY ==========
  // ==================================================

  selectDesignCombos() {
    window.dispatchEvent(new CustomEvent("open-select-design-combinations-modal"));
  },

  displayDesignInfo() {
    window.dispatchEvent(new CustomEvent("open-display-design-info-modal"));
  },

  openDesignOverwrites() {
    window.dispatchEvent(new CustomEvent("open-design-overwrites-modal"));
  },

  showLoadsOnJoints() {
    Swal.fire({
      title: "",
      html: `
            <div class="text-left" style="background-color: #1e1e1e; color: #e5e7eb;">
                <div class="border border-gray-700 rounded p-4 mb-4 flex items-center justify-between gap-4" style="background-color: #1e1e1e;">
                    <label class="text-sm font-bold whitespace-nowrap" style="color: #e5e7eb;">Caso de Carga</label>
                    <div class="relative w-full">
                        <select id="loadCaseSelect" class="w-full bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option value="DEAD">DEAD</option>
                            <option value="LIVE">LIVE</option>
                            <option value="WIND">WIND</option>
                            <option value="SNOW">SNOW</option>
                            <option value="EARTHQUAKE">EARTHQUAKE</option>
                        </select>
                        <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                            ▼
                        </div>
                    </div>
                </div>

                <fieldset class="border border-gray-700 rounded p-3 flex flex-col gap-2 mb-4" style="background-color: #1e1e1e;">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Tipo de Carga</legend>

                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Fuerzas
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Desplazamientos
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Valores de Temperatura
                    </label>
                </fieldset>

                <div class="px-1 mb-4">
                    <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors" style="color: #e5e7eb;">
                        <input type="checkbox" id="showLoadValues" checked class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                        Mostrar Valores de Carga
                    </label>
                </div>

                <div class="flex justify-center gap-4 pt-2">
                    <button id="okButton" class="px-8 py-1 text-sm bg-gray-800/50 text-gray-500 border border-gray-700 rounded cursor-not-allowed" disabled>
                        OK
                    </button>
                    <button id="cancelButton" class="px-8 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors shadow-md">
                        Cancelar
                    </button>
                </div>
            </div>
        `,
      width: "380px",
      showConfirmButton: false,
      showCancelButton: false,
      background: "#1e1e1e",
      didOpen: (popup) => {
        popup.style.backgroundColor = "#1e1e1e";
        popup.style.border = "1px solid #374151";
        popup.style.borderRadius = "0.5rem";

        const cancelBtn = popup.querySelector("#cancelButton");
        cancelBtn.addEventListener("click", () => {
          Swal.close();
        });

        const loadCaseSelect = popup.querySelector("#loadCaseSelect");
        const showValuesCheckbox = popup.querySelector("#showLoadValues");

        loadCaseSelect.addEventListener("change", (e) => {
          this.showMessage(`📊 Mostrando cargas en nudos/puntos para caso: ${e.target.value}`);
        });

        showValuesCheckbox.addEventListener("change", (e) => {
          this.options.showFAxialesValues = e.target.checked;
        });
      },
    }).then(() => {
      this.options.showForces = true;
      this.redraw();
      this.sync3D();
      this.showMessage(`📊 Mostrando cargas en nudos/puntos`);
    });
  },

  showLoadsOnFrames() {
    Swal.fire({
      title: "",
      html: `
            <div class="text-left" style="background-color: #1e1e1e; color: #e5e7eb;">
                <div class="border border-gray-700 rounded p-4 mb-4 flex items-center justify-between gap-4" style="background-color: #1e1e1e;">
                    <label class="text-sm font-bold whitespace-nowrap" style="color: #e5e7eb;">Caso de Carga</label>
                    <div class="relative w-full">
                        <select id="loadCaseSelect" class="w-full bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option value="DEAD">DEAD</option>
                            <option value="LIVE">LIVE</option>
                            <option value="WIND">WIND</option>
                            <option value="SNOW">SNOW</option>
                            <option value="EARTHQUAKE">EARTHQUAKE</option>
                        </select>
                        <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                            ▼
                        </div>
                    </div>
                </div>

                <fieldset class="border border-gray-700 rounded p-3 flex flex-col gap-2 mb-4" style="background-color: #1e1e1e;">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Tipo de Carga</legend>

                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Carga en tramo aplicada directamente al objeto (Fuerzas)
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Carga en tramo aplicada directamente al objeto (Momentos)
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Carga total tributaria al objeto de línea (Fuerzas)
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Carga total tributaria al objeto de línea (Momentos)
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Valores de Temperatura
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Cargas de viento en estructura abierta
                    </label>
                </fieldset>

                <div class="px-1 mb-4">
                    <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors" style="color: #e5e7eb;">
                        <input type="checkbox" id="showLoadValues" checked class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                        Incluir Cargas Puntuales
                    </label>
                    <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors" style="color: #e5e7eb;">
                        <input type="checkbox" id="showLoadValues" checked class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                        Mostrar Valores de Carga
                    </label>
                </div>

                <div class="flex justify-center gap-4 pt-2">
                    <button id="okButton" class="px-8 py-1 text-sm bg-gray-800/50 text-gray-500 border border-gray-700 rounded cursor-not-allowed" disabled>
                        OK
                    </button>
                    <button id="cancelButton" class="px-8 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors shadow-md">
                        Cancelar
                    </button>
                </div>
            </div>
        `,
      width: "380px",
      showConfirmButton: false,
      showCancelButton: false,
      background: "#1e1e1e",
      didOpen: (popup) => {
        popup.style.backgroundColor = "#1e1e1e";
        popup.style.border = "1px solid #374151";
        popup.style.borderRadius = "0.5rem";

        const cancelBtn = popup.querySelector("#cancelButton");
        cancelBtn.addEventListener("click", () => {
          Swal.close();
        });

        const loadCaseSelect = popup.querySelector("#loadCaseSelect");
        loadCaseSelect.addEventListener("change", (e) => {
          this.showMessage(`📊 Mostrando cargas en elementos frame/línea para caso: ${e.target.value}`);
        });
      },
    }).then(() => {
      this.options.showForces = true;
      this.redraw();
      this.sync3D();
      this.showMessage(`📊 Mostrando cargas en elementos frame/línea`);
    });
  },

  showDeformedShape() {
    Swal.fire({
      title: "Mostrar Forma Deformada",
      html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Factor de Escala</label>
                    <input type="range" id="deflectionScale" min="1" max="1000" value="100" class="w-full">
                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span><span>100</span><span>200</span><span>500</span><span>1000</span>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="showUndefShape" checked>
                        <span class="text-sm text-gray-300">Mostrar forma no deformada como referencia</span>
                    </label>
                </div>
                <div class="mb-3">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="animateDeformation">
                        <span class="text-sm text-gray-300">Animar deformación</span>
                    </label>
                </div>
            </div>
        `,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      preConfirm: () => {
        return {
          scale: parseInt(document.getElementById("deflectionScale").value),
          showUndefShape: document.getElementById("showUndefShape").checked,
          animate: document.getElementById("animateDeformation").checked,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.options.showDeflection = true;
        this.options.deflectionScale = result.value.scale;

        this.options.showDeflection = !this.options.showDeflection;
        if (this.options.showDeflection) {
          this.currentRenderer = this.deflexionRenderer;
        } else {
          this.currentRenderer = this.diseñoRenderer;
        }
        this.redraw();
        this.sync3D();
        this.showMessage(`📈 Mostrando forma deformada (escala: ${result.value.scale})`);
      }
    });
  },

  showModeShape() {
    Swal.fire({
      title: "Mostrar Forma Modal",
      html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Número de Modo</label>
                    <select id="modeNumber" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="1">Modo 1 - Frecuencia: 2.35 Hz</option>
                        <option value="2">Modo 2 - Frecuencia: 3.12 Hz</option>
                        <option value="3">Modo 3 - Frecuencia: 4.87 Hz</option>
                        <option value="4">Modo 4 - Frecuencia: 5.23 Hz</option>
                        <option value="5">Modo 5 - Frecuencia: 6.78 Hz</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Factor de Escala</label>
                    <input type="range" id="modeScale" min="1" max="500" value="100" class="w-full">
                </div>
                <div class="mb-3">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="animateMode" checked>
                        <span class="text-sm text-gray-300">Animar vibración</span>
                    </label>
                </div>
            </div>
        `,
      confirmButtonText: "Mostrar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.showMessage("🎵 Mostrando forma modal - Próximamente");
      }
    });
  },

  showMemberForces() {
    Swal.fire({
      title: "Diagramas de Fuerzas/Esfuerzos de Elementos",
      html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Tipo de Diagrama</label>
                    <select id="forceType" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="axial">Axial (P)</option>
                        <option value="shear">Corte (V)</option>
                        <option value="moment">Momento (M)</option>
                        <option value="all">Todos</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="showValues">
                        <span class="text-sm text-gray-300">Mostrar valores numéricos</span>
                    </label>
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Combinación de Carga</label>
                    <select id="loadCombo" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="DEAD">DEAD</option>
                        <option value="LIVE">LIVE</option>
                        <option value="COMB1">COMB1</option>
                        <option value="COMB2">COMB2</option>
                    </select>
                </div>
            </div>
        `,
      confirmButtonText: "Mostrar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        var forceType = document.getElementById("forceType").value;
        var showValues = document.getElementById("showValues").checked;

        this.options.showFAxiales = true;
        this.options.showFAxialesValues = showValues;

        this.redraw();
        this.sync3D();
        this.showMessage(`📉 Mostrando diagramas de fuerza ${forceType}`);
      }
    });
  },
};

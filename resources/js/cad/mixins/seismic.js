/**
 * @mixin seismicMixin
 *
 * Análisis sísmico espectral (RSA) integrado con el backend Python/OpenSeesPy.
 *
 * Métodos públicos:
 *   openSeismicAnalysisDialog()   → diálogo principal de configuración y ejecución
 *   importSeismicSpectrum(dir)    → importar espectro desde archivo TXT/XLS
 *   runSeismicAnalysis()          → ejecutar el análisis sísmico completo
 *   showSeismicResults(result)    → mostrar tabla de resultados modales
 */

import Swal from "sweetalert2";
import {
  startBabylonSeismicAnimation,
  stopBabylonSeismicAnimation,
  isBabylonSeismicAnimating,
  setSeismicAnimationSpeed,
  setSeismicAnimationScale,
  showSeismicDisplacementLabels,
  clearSeismicDisplacementLabels,
  isSeismicDisplacementLabelsVisible,
} from "../3d/viewer3d.js";
import {
  createMockSeismicResult,
  validateSeismicContract,
} from "../analysis/seismicContract.js";

const BACKEND_URL = "http://localhost:5001";

// Bandera de origen de datos sísmicos.
//   true  → usa datos SIMULADOS (mock) mientras el motor del compañero no está.
//   false → usa el motor real en /api/seismic/analyze.
// Al integrar el motor, basta poner esto en false (o quitarlo).
const USE_MOCK_SEISMIC = true;

// Límites de deriva de entrepiso por sistema estructural (Perú E.030, Tabla 11).
// drift_ratio admisible (Δ/h, adimensional).
const DRIFT_LIMITS = {
  concreto: 0.007,    // Concreto armado
  acero: 0.010,       // Acero
  albanileria: 0.005, // Albañilería
  madera: 0.010,      // Madera
};

export const seismicMixin = {

  // ─── Estado sísmico ────────────────────────────────────────────────────────
  _initSeismic() {
    if (this.seismicConfig) return;
    this.seismicConfig = {
      spectrumX: [],     // [{T, Sa}]
      spectrumY: [],     // [{T, Sa}] — opcional
      numModes: 6,
      combination: "CQC",
      dampingRatio: 0.05,
      saInG: true,
      g: 9.81,
      direction: "both", // "x", "y", "both"
      animScale: 100,    // factor de escala visual para animación sísmica
      irregular: false,  // estructura irregular → k=0.90 (regular → k=0.80) para el escalado normativo
      driftSystem: "concreto",      // sistema estructural (define el límite de deriva)
      driftLimit: DRIFT_LIMITS.concreto, // deriva admisible Δ/h (E.030)
    };
    this.seismicResults = null;
    this.seismicAnimationActive = false;
  },

  // ─── Dialogo principal ─────────────────────────────────────────────────────
  async openSeismicAnalysisDialog() {
    this._initSeismic();

    const cfg = this.seismicConfig;

    const html = `
      <div style="font-family:monospace; font-size:13px; text-align:left; max-width:500px">

        <!-- Espectros -->
        <fieldset style="border:1px solid #555; border-radius:6px; padding:10px 14px; margin-bottom:12px">
          <legend style="padding:0 6px; color:#7eb8f7; font-size:12px; font-weight:600">Espectros de Diseño</legend>

          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
            <label style="width:90px; color:#ccc">Dirección X:</label>
            <span id="spx-label" style="flex:1; color:${cfg.spectrumX.length ? '#7fc77f' : '#aaa'}">
              ${cfg.spectrumX.length ? `${cfg.spectrumX.length} puntos cargados` : 'Sin espectro'}
            </span>
            <button id="btn-import-x" style="background:#2d5a8e; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px">
              Importar...
            </button>
          </div>

          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
            <label style="width:90px; color:#ccc">Dirección Y:</label>
            <span id="spy-label" style="flex:1; color:${cfg.spectrumY.length ? '#7fc77f' : '#aaa'}">
              ${cfg.spectrumY.length ? `${cfg.spectrumY.length} puntos cargados` : 'Usar mismo que X'}
            </span>
            <button id="btn-import-y" style="background:#2d5a8e; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px">
              Importar...
            </button>
          </div>

          <div style="display:flex; gap:8px; align-items:center; justify-content:flex-end; margin-bottom:8px">
            <button id="btn-default-spectrum" style="background:#0f766e; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:11px">
              Usar espectro por defecto
            </button>
            <button id="btn-clear-spectrum" style="background:#7f1d1d; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:11px">
              Limpiar
            </button>
          </div>

          <!-- Preview del espectro (Sa vs T) -->
          <div id="spectrum-preview" style="margin-top:6px; display:flex; justify-content:center"></div>

          <div style="color:#64748b; font-size:10px; margin-top:4px">
            Formato TXT/CSV: dos columnas <code>T  Sa</code> (separador espacio, coma, tab o ;). Excel requiere el backend.
          </div>
        </fieldset>

        <!-- Parámetros modales -->
        <fieldset style="border:1px solid #555; border-radius:6px; padding:10px 14px; margin-bottom:12px">
          <legend style="padding:0 6px; color:#7eb8f7; font-size:12px; font-weight:600">Parámetros Modales</legend>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px">
            <div>
              <label style="color:#ccc; font-size:12px">Nº de modos:</label>
              <input id="seis-modes" type="number" min="1" max="30" value="${cfg.numModes}"
                style="width:100%; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; margin-top:3px">
            </div>
            <div>
              <label style="color:#ccc; font-size:12px">Amortiguamiento (ζ):</label>
              <input id="seis-damp" type="number" min="0.01" max="0.5" step="0.01" value="${cfg.dampingRatio}"
                style="width:100%; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; margin-top:3px">
            </div>
            <div>
              <label style="color:#ccc; font-size:12px">Combinación modal:</label>
              <select id="seis-combo" style="width:100%; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; margin-top:3px">
                <option value="CQC" ${cfg.combination === 'CQC' ? 'selected' : ''}>CQC</option>
                <option value="SRSS" ${cfg.combination === 'SRSS' ? 'selected' : ''}>SRSS</option>
              </select>
            </div>
            <div>
              <label style="color:#ccc; font-size:12px">Dirección sismo:</label>
              <select id="seis-dir" style="width:100%; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; margin-top:3px">
                <option value="both" ${cfg.direction === 'both' ? 'selected' : ''}>X e Y</option>
                <option value="x"    ${cfg.direction === 'x'    ? 'selected' : ''}>Solo X</option>
                <option value="y"    ${cfg.direction === 'y'    ? 'selected' : ''}>Solo Y</option>
              </select>
            </div>
          </div>

          <div style="margin-top:8px; display:flex; gap:16px; align-items:center">
            <label style="color:#ccc; font-size:12px; display:flex; align-items:center; gap:6px">
              <input id="seis-ing" type="checkbox" ${cfg.saInG ? 'checked' : ''}> Sa en [g]
            </label>
            <label style="color:#ccc; font-size:12px">g =
              <input id="seis-g" type="number" min="1" max="20" step="0.01" value="${cfg.g}"
                style="width:70px; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px 5px">
              m/s²
            </label>
          </div>

          <div style="margin-top:8px">
            <label style="color:#ccc; font-size:12px; display:flex; align-items:center; gap:6px">
              <input id="seis-irregular" type="checkbox" ${cfg.irregular ? 'checked' : ''}>
              Estructura irregular (escalado k=0.90; regular k=0.80)
            </label>
          </div>

          <div style="margin-top:8px">
            <label style="color:#ccc; font-size:12px">Sistema estructural (límite de deriva E.030):</label>
            <select id="seis-drift-system" style="width:100%; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; margin-top:3px">
              <option value="concreto"    ${cfg.driftSystem === 'concreto'    ? 'selected' : ''}>Concreto armado — 0.007</option>
              <option value="acero"       ${cfg.driftSystem === 'acero'       ? 'selected' : ''}>Acero — 0.010</option>
              <option value="albanileria" ${cfg.driftSystem === 'albanileria' ? 'selected' : ''}>Albañilería — 0.005</option>
              <option value="madera"      ${cfg.driftSystem === 'madera'      ? 'selected' : ''}>Madera — 0.010</option>
            </select>
          </div>
        </fieldset>

        <!-- Masas: resumen rápido -->
        <div id="seis-mass-info" style="color:#aaa; font-size:11px; padding:6px 10px; background:#1e293b; border-radius:4px">
          Leyendo masas del modelo...
        </div>
      </div>
    `;

    const result = await Swal.fire({
      title: "Análisis Sísmico Espectral",
      html,
      width: 580,
      background: "#1a2035",
      color: "#e2e8f0",
      showCancelButton: true,
      confirmButtonText: "Ejecutar Análisis",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1d4ed8",
      didOpen: () => {
        // Mostrar resumen de masas
        const massInfo = document.getElementById("seis-mass-info");
        const totalMass = this._getTotalModelMass();
        if (massInfo) {
          massInfo.textContent = totalMass > 0
            ? `Masa total del modelo: ${totalMass.toFixed(2)} kg (${(this.nodes || []).filter(n => (n.mass || n.mass_x || 0) > 0).length} nodos con masa)`
            : "Advertencia: Ningún nodo tiene masa asignada. Asigna masas en Assign > Assign Masses antes de correr el análisis sísmico.";
          massInfo.style.color = totalMass > 0 ? "#86efac" : "#fbbf24";
        }

        // Preview inicial (por si ya había espectros cargados)
        this._renderSpectrumPreview();

        const setLabel = (id, n) => {
          const el = document.getElementById(id);
          if (el) { el.textContent = `${n} puntos cargados`; el.style.color = "#7fc77f"; }
        };

        // Botones de importar espectro
        document.getElementById("btn-import-x")?.addEventListener("click", async (e) => {
          e.preventDefault();
          const data = await this._pickAndParseSpectrum("X");
          if (data) {
            this.seismicConfig.spectrumX = data;
            setLabel("spx-label", data.length);
            this._renderSpectrumPreview();
          }
        });

        document.getElementById("btn-import-y")?.addEventListener("click", async (e) => {
          e.preventDefault();
          const data = await this._pickAndParseSpectrum("Y");
          if (data) {
            this.seismicConfig.spectrumY = data;
            setLabel("spy-label", data.length);
            this._renderSpectrumPreview();
          }
        });

        // Espectro por defecto (para probar sin archivo)
        document.getElementById("btn-default-spectrum")?.addEventListener("click", (e) => {
          e.preventDefault();
          const def = this._defaultDesignSpectrum();
          this.seismicConfig.spectrumX = def.map((p) => ({ ...p }));
          this.seismicConfig.spectrumY = def.map((p) => ({ ...p }));
          setLabel("spx-label", def.length);
          setLabel("spy-label", def.length);
          this._renderSpectrumPreview();
          this.showMessage?.("Espectro de diseño por defecto cargado en X e Y.", "success");
        });

        // Limpiar espectros
        document.getElementById("btn-clear-spectrum")?.addEventListener("click", (e) => {
          e.preventDefault();
          this.seismicConfig.spectrumX = [];
          this.seismicConfig.spectrumY = [];
          const elx = document.getElementById("spx-label");
          const ely = document.getElementById("spy-label");
          if (elx) { elx.textContent = "Sin espectro"; elx.style.color = "#aaa"; }
          if (ely) { ely.textContent = "Usar mismo que X"; ely.style.color = "#aaa"; }
          this._renderSpectrumPreview();
        });
      },
      preConfirm: () => {
        return {
          numModes:     parseInt(document.getElementById("seis-modes")?.value) || 6,
          dampingRatio: parseFloat(document.getElementById("seis-damp")?.value) || 0.05,
          combination:  document.getElementById("seis-combo")?.value || "CQC",
          direction:    document.getElementById("seis-dir")?.value || "both",
          saInG:        document.getElementById("seis-ing")?.checked ?? true,
          g:            parseFloat(document.getElementById("seis-g")?.value) || 9.81,
          irregular:    document.getElementById("seis-irregular")?.checked ?? false,
          driftSystem:  document.getElementById("seis-drift-system")?.value || "concreto",
        };
      },
    });

    if (!result.isConfirmed) return;

    // Guardar config
    Object.assign(this.seismicConfig, result.value);
    // Límite de deriva según el sistema estructural elegido (E.030).
    this.seismicConfig.driftLimit = DRIFT_LIMITS[this.seismicConfig.driftSystem] ?? 0.007;

    // Permitir ejecutar si hay Response Spectrum Cases definidos (Nivel B) o
    // al menos un espectro X en el diálogo.
    const hasCases = this._getSeismicRunCases().some((rc) => rc.id !== "SISMO");
    if (!hasCases && !this.seismicConfig.spectrumX.length) {
      await Swal.fire({
        icon: "warning",
        title: "Falta espectro",
        html: "Importa un espectro X aquí, o define un caso en " +
              "<b>Define → Response Spectrum Cases</b> antes de ejecutar.",
        background: "#1a2035", color: "#e2e8f0",
      });
      return;
    }

    await this.runSeismicAnalysis();
  },

  // ─── Importar espectro desde archivo ──────────────────────────────────────
  // TXT/CSV se parsean en el navegador (funciona SIN backend, modo mock-first).
  // XLS/XLSX requieren el backend Python (openpyxl).
  async _pickAndParseSpectrum(label) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.csv,.xls,.xlsx";

      input.addEventListener("change", async () => {
        const file = input.files[0];
        if (!file) return resolve(null);

        const ext = (file.name.split(".").pop() || "").toLowerCase();

        // ── TXT / CSV → parseo en el cliente ──────────────────────────────
        if (ext === "txt" || ext === "csv") {
          try {
            const text = await file.text();
            const pts = this._parseSpectrumText(text);
            const check = this._validateSpectrum(pts);
            if (!check.ok) {
              this.showMessage?.(`Espectro ${label}: ${check.error}`, "error");
              return resolve(null);
            }
            this.showMessage?.(`Espectro ${label}: ${pts.length} puntos importados desde "${file.name}"`, "success");
            return resolve(pts);
          } catch (err) {
            this.showMessage?.(`Error al leer "${file.name}": ${err.message}`, "error");
            return resolve(null);
          }
        }

        // ── XLS / XLSX → backend Python ───────────────────────────────────
        Swal.showLoading?.();
        try {
          const formData = new FormData();
          formData.append("file", file);
          const resp = await fetch(`${BACKEND_URL}/api/seismic/parse-spectrum`, {
            method: "POST",
            body: formData,
          });
          const json = await resp.json();
          if (json.success) {
            this.showMessage?.(`Espectro ${label}: ${json.count} puntos importados desde "${file.name}"`, "success");
            resolve(json.spectrum);
          } else {
            this.showMessage?.(`Error al leer el espectro: ${json.error}`, "error");
            resolve(null);
          }
        } catch (err) {
          const isOffline = err.message?.includes("Failed to fetch") || err.message?.includes("ERR_CONNECTION_REFUSED");
          Swal.fire({
            icon: "warning",
            title: isOffline ? "Excel requiere el backend" : "Error de conexión",
            html: isOffline
              ? `Los archivos Excel se parsean en el servidor Python (no disponible).<br><br>` +
                `En modo sin backend, exporta tu espectro a <b>.txt</b> o <b>.csv</b> (dos columnas: T, Sa).`
              : `${err.message}`,
            background: "#1a2035", color: "#e2e8f0",
          });
          resolve(null);
        } finally {
          Swal.hideLoading?.();
        }
      });

      input.click();
    });
  },

  // Parseo de espectro en texto (TXT/CSV) — espeja la lógica del backend.
  // Auto-detecta separador, salta comentarios/encabezados, ordena por T.
  _parseSpectrumText(text) {
    const rows = [];
    for (const raw of String(text).split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || /^[#/%]/.test(line)) continue;
      let parts = null;
      for (const sep of [",", ";", "\t", " "]) {
        const p = line.split(sep).map((s) => s.trim()).filter(Boolean);
        if (p.length >= 2) { parts = p; break; }
      }
      if (!parts) continue;
      const T = parseFloat(parts[0].replace(",", "."));
      const Sa = parseFloat(parts[1].replace(",", "."));
      if (Number.isFinite(T) && Number.isFinite(Sa)) rows.push({ T, Sa });
    }
    rows.sort((a, b) => a.T - b.T);
    return rows;
  },

  // Validación básica del espectro importado.
  _validateSpectrum(pts) {
    if (!Array.isArray(pts) || pts.length < 2) {
      return { ok: false, error: "se necesitan al menos 2 puntos (T, Sa)." };
    }
    if (pts.some((p) => p.Sa < 0)) {
      return { ok: false, error: "hay valores de Sa negativos." };
    }
    if (pts.every((p) => p.Sa === 0)) {
      return { ok: false, error: "todos los Sa son cero." };
    }
    return { ok: true };
  },

  // Espectro de diseño por defecto (g) — para probar sin archivo.
  _defaultDesignSpectrum() {
    return [
      { T: 0.0, Sa: 0.40 }, { T: 0.1, Sa: 0.50 }, { T: 0.2, Sa: 0.50 },
      { T: 0.4, Sa: 0.50 }, { T: 0.6, Sa: 0.42 }, { T: 0.8, Sa: 0.34 },
      { T: 1.0, Sa: 0.28 }, { T: 1.5, Sa: 0.19 }, { T: 2.0, Sa: 0.14 },
      { T: 3.0, Sa: 0.094 }, { T: 4.0, Sa: 0.070 }, { T: 5.0, Sa: 0.045 },
    ];
  },

  // Gráfico SVG del espectro (Sa vs T) para el preview del diálogo.
  _buildSpectrumSVG(series) {
    const W = 460, H = 220, ML = 46, MR = 14, MT = 12, MB = 34;
    const plotW = W - ML - MR, plotH = H - MT - MB;
    const allT = series.flatMap((s) => s.points.map((p) => p.T));
    const allSa = series.flatMap((s) => s.points.map((p) => p.Sa));
    if (!allT.length) return "";
    const maxT = Math.max(...allT) || 1;
    const maxSa = (Math.max(...allSa) || 1) * 1.1;
    const sx = (t) => ML + (t / maxT) * plotW;
    const sy = (sa) => MT + plotH - (sa / maxSa) * plotH;

    const xticks = [0, maxT / 2, maxT].map((t) => {
      const x = sx(t);
      return `<line x1="${x}" y1="${MT + plotH}" x2="${x}" y2="${MT + plotH + 4}" stroke="#475569"/>
              <text x="${x}" y="${MT + plotH + 16}" text-anchor="middle" fill="#94a3b8" font-size="9">${t.toFixed(2)}</text>`;
    }).join("");
    const yticks = [0, maxSa / 2, maxSa].map((sa) => {
      const y = sy(sa);
      return `<line x1="${ML - 4}" y1="${y}" x2="${ML}" y2="${y}" stroke="#475569"/>
              <text x="${ML - 7}" y="${y + 3}" text-anchor="end" fill="#94a3b8" font-size="9">${sa.toFixed(2)}</text>`;
    }).join("");

    const lines = series.map((s) => {
      const coords = [...s.points].sort((a, b) => a.T - b.T)
        .map((p) => `${sx(p.T).toFixed(1)},${sy(p.Sa).toFixed(1)}`).join(" ");
      return `<polyline points="${coords}" fill="none" stroke="${s.color}" stroke-width="2"/>`;
    }).join("");

    const legend = series.map((s, i) => `
      <rect x="${ML + plotW - 70}" y="${MT + 4 + i * 15}" width="10" height="10" fill="${s.color}"/>
      <text x="${ML + plotW - 56}" y="${MT + 13 + i * 15}" fill="#e2e8f0" font-size="10">${s.name}</text>`).join("");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="background:#0f172a;border-radius:6px">
        <rect x="${ML}" y="${MT}" width="${plotW}" height="${plotH}" fill="none" stroke="#334155"/>
        ${xticks}${yticks}${lines}${legend}
        <text x="${ML + plotW / 2}" y="${H - 4}" text-anchor="middle" fill="#cbd5e1" font-size="10">Periodo T (s)</text>
        <text x="12" y="${MT + plotH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="10" transform="rotate(-90 12 ${MT + plotH / 2})">Sa</text>
      </svg>`;
  },

  // Inyecta el preview del espectro en el contenedor del diálogo.
  _renderSpectrumPreview() {
    const box = document.getElementById("spectrum-preview");
    if (!box) return;
    const cfg = this.seismicConfig;
    const series = [];
    if (cfg.spectrumX?.length) series.push({ name: "X", color: "#60a5fa", points: cfg.spectrumX });
    if (cfg.spectrumY?.length) series.push({ name: "Y", color: "#34d399", points: cfg.spectrumY });
    if (!series.length) {
      box.innerHTML = `<div style="color:#64748b;font-size:11px;text-align:center;padding:18px">Sin espectro para previsualizar</div>`;
      return;
    }
    box.innerHTML = this._buildSpectrumSVG(series);
  },

  // ─── Ejecutar análisis sísmico ─────────────────────────────────────────────
  async runSeismicAnalysis() {
    this._initSeismic();
    const cfg = this.seismicConfig;

    // Validaciones previas
    const nodes = (this.nodes || []);
    if (nodes.length === 0) {
      this.showMessage?.("El modelo no tiene nodos.", "error");
      return;
    }
    const frames = (this.shapes || []).filter(f => f?.node1 && f?.node2);
    if (frames.length === 0) {
      this.showMessage?.("El modelo no tiene elementos.", "error");
      return;
    }
    const totalMass = this._getTotalModelMass();
    if (totalMass <= 0) {
      const cont = await Swal.fire({
        icon: "warning",
        title: "Sin masas definidas",
        html: "Ningún nodo tiene masa asignada.<br>El análisis sísmico requiere masas.<br><br>¿Continuar de todas formas?",
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
        background: "#1a2035", color: "#e2e8f0",
      });
      if (!cont.isConfirmed) return;
    }

    // Progreso
    Swal.fire({
      title: "Ejecutando Análisis Sísmico...",
      html: "<div style='color:#94a3b8'>Análisis modal + espectro de respuesta (RSA)</div>",
      allowOutsideClick: false,
      background: "#1a2035", color: "#e2e8f0",
      didOpen: () => Swal.showLoading(),
    });

    try {
      // ── NIVEL B: recorrer los Response Spectrum Cases ───────────────────
      // Si hay casos definidos (Define → Response Spectrum Cases), se corre
      // uno por caso y se guarda un resultado por caso. Si no, se corre un
      // único caso con el espectro del diálogo de análisis.
      const runCases = this._getSeismicRunCases();
      const byCase = {};
      const order = [];
      const errors = [];

      for (const rc of runCases) {
        let result;

        if (USE_MOCK_SEISMIC) {
          // ── DATOS SIMULADOS (Bloque C0) ────────────────────────────────
          result = createMockSeismicResult(this, {
            numModes: cfg.numModes,
            combination: rc.combination,
            dampingRatio: rc.dampingRatio,
            saInG: cfg.saInG,
            g: cfg.g,
            spectrum: rc.spectrumX,
            direction: rc.direction,
            driftAllowable: cfg.driftLimit, // límite de deriva del sistema estructural (E.030)
          });
        } else {
          // ── MOTOR REAL ─────────────────────────────────────────────────
          const caseCfg = {
            ...cfg,
            spectrumX: rc.spectrumX,
            spectrumY: rc.spectrumY || [],
            combination: rc.combination,
            dampingRatio: rc.dampingRatio,
          };
          const payload = this._buildSeismicPayload(caseCfg, nodes, frames);
          const resp = await fetch(`${BACKEND_URL}/api/seismic/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          result = await resp.json();

          const check = validateSeismicContract(result);
          if (!check.ok) console.warn(`⚠️ [${rc.name}] backend no cumple el contrato:`, check.missing);
          if (check.warnings?.length) console.info(`ℹ️ [${rc.name}] campos opcionales ausentes:`, check.warnings);
        }

        if (result && result.success) {
          result._caseId = rc.id;
          result._caseName = rc.name;
          // Chequeo normativo de escalado dinámico/estático del cortante basal.
          result.scaling = this._computeBaseShearScaling(result, rc, cfg);
          byCase[rc.id] = result;
          order.push({ id: rc.id, name: rc.name });
        } else {
          errors.push(`${rc.name}: ${result?.error || "error desconocido"}`);
        }
      }

      if (USE_MOCK_SEISMIC) await new Promise((r) => setTimeout(r, 250)); // breve "procesando…"
      Swal.close();

      if (!order.length) {
        await Swal.fire({
          icon: "error",
          title: "Error en análisis sísmico",
          html: errors.join("<br>") || "No se obtuvieron resultados.",
          background: "#1a2035", color: "#e2e8f0",
        });
        return;
      }
      if (errors.length) {
        this.showMessage?.(`${errors.length} caso(s) fallaron: ${errors.join(" | ")}`, "warning");
      }

      // Diagnóstico: casos definidos que NO se pudieron analizar (Problema 1).
      const skips = this._seismicCaseSkips || [];
      if (skips.length) {
        await Swal.fire({
          icon: "warning",
          title: `${skips.length} caso(s) omitido(s)`,
          html: `<div style="text-align:left; font-size:12px">
                   Estos Response Spectrum Cases no se analizaron:
                   <ul style="margin:6px 0 0; padding-left:18px">${skips.map((s) => `<li style="margin:2px 0">${s}</li>`).join("")}</ul>
                   <div style="margin-top:8px; color:#94a3b8">
                     Verifica en <b>Define → Response Spectrum Functions</b> que la función esté importada
                     (con puntos T–Sa) y en <b>Response Spectrum Cases</b> que esté asignada a U1 o U2.
                   </div>
                 </div>`,
          background: "#1a2035", color: "#e2e8f0",
          confirmButtonColor: "#1d4ed8",
        });
      }

      // Guardar resultados por caso y activar el primero.
      this.seismicResultsByCase = byCase;
      this.seismicCaseOrder = order;
      this.seismicActiveCase = order[0].id;
      this.seismicResults = byCase[order[0].id];

      this._applySeismicResultsToModel(this.seismicResults);
      await this.showSeismicResults(this.seismicResults);

    } catch (err) {
      Swal.close();
      const isOffline = err.message?.includes("Failed to fetch") || err.message?.includes("ERR_CONNECTION_REFUSED");
      await Swal.fire({
        icon: "error",
        title: isOffline ? "Backend no disponible" : "Error de conexión",
        html: isOffline
          ? `El servidor Python (localhost:5001) no está corriendo.<br><br>
              <code style="background:#0f172a;padding:6px 10px;border-radius:4px;font-size:12px;display:block;text-align:left">
                cd python-backend<br>
                venv\\Scripts\\python app.py
              </code>`
          : `No se pudo conectar al backend Python.<br><small style="color:#94a3b8">${err.message}</small>`,
        background: "#1a2035", color: "#e2e8f0",
      });
    }
  },

  // ─── NIVEL B: resolver los casos a correr ───────────────────────────────────
  // Devuelve [{id, name, spectrumX, spectrumY, combination, dampingRatio}].
  // Usa los Response Spectrum Cases creados con el diálogo ETABS (los que tienen
  // .spectra). Si no hay ninguno, devuelve un único caso con el espectro del
  // diálogo de análisis (seismicConfig).
  _getSeismicRunCases() {
    const cfg = this.seismicConfig || {};
    const functions = this.responseSpectrumFunctions?.items || [];
    const fnOf = (id) => functions.find((f) => String(f.id) === String(id));
    const scaled = (fn, sf) => (fn?.points || []).map((p) => ({ T: p.T, Sa: p.Sa * (Number(sf) || 1) }));

    const combOf = (c) => (["CQC", "SRSS"].includes(c.modalCombination) ? c.modalCombination : "CQC");
    const dampOf = (c) => (Number.isFinite(c.damping) ? c.damping : 0.05);

    this._seismicCaseSkips = []; // motivos de casos omitidos (para diagnóstico)

    const out = [];
    for (const c of (this.responseSpectrumCases?.items || [])) {
      if (c.enabled === false) continue;

      // Solo casos creados con el diálogo ETABS (formato nuevo, con .spectra).
      // Los casos demo legacy (SDX/SDY/escalado/DER, sin .spectra) NO se corren:
      // sus factores de escala son de validación del colaborador y producen
      // magnitudes irreales (cortante basal > peso). Quedan en Define para el
      // pipeline modal-spectral, pero fuera de nuestro análisis.
      if (!c.spectra) continue;

      const u1 = fnOf(c.spectra.U1?.functionId);
      const u2 = fnOf(c.spectra.U2?.functionId);
      let sx = u1 ? scaled(u1, c.spectra.U1.scaleFactor) : [];
      let sy = u2 ? scaled(u2, c.spectra.U2.scaleFactor) : [];
      let direction = sx.length >= 2 && sy.length >= 2 ? "both" : (sx.length >= 2 ? "x" : (sy.length >= 2 ? "y" : null));
      if (!direction) {
        // El caso existe pero sus funciones U1/U2 no tienen espectro utilizable.
        const u1id = c.spectra.U1?.functionId;
        const u2id = c.spectra.U2?.functionId;
        let motivo;
        if (!u1id && !u2id) motivo = "no tiene función asignada en U1 ni U2";
        else if ((u1id && !u1) || (u2id && !u2)) motivo = "su función no existe (¿se eliminó o renombró?)";
        else motivo = "su función no tiene al menos 2 puntos (T, Sa)";
        this._seismicCaseSkips.push(`"${c.name}" ${motivo}`);
        continue;
      }
      if (sx.length < 2 && sy.length >= 2) { sx = sy; sy = []; } // una sola dir → como X
      out.push({
        id: c.id, name: c.name, direction,
        spectrumX: sx, spectrumY: sy.length >= 2 ? sy : null,
        combination: combOf(c), dampingRatio: dampOf(c),
      });
    }

    if (out.length) return out;

    // Fallback: un solo caso con el espectro del diálogo de análisis.
    return [{
      id: "SISMO",
      name: "Análisis sísmico",
      direction: "both",
      spectrumX: cfg.spectrumX || [],
      spectrumY: (cfg.spectrumY && cfg.spectrumY.length) ? cfg.spectrumY : null,
      combination: cfg.combination || "CQC",
      dampingRatio: cfg.dampingRatio ?? 0.05,
    }];
  },

  // ════════════════════════════════════════════════════════════════════════
  //  Escalado normativo cortante DINÁMICO vs ESTÁTICO (sugerencia #1)
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Interpola linealmente un espectro [{T, Sa}] en el periodo dado.
   * Fuera de rango devuelve el valor del extremo (extrapolación constante).
   *
   * @param {Array<{T:number, Sa:number}>} points  Espectro (no requiere estar ordenado).
   * @param {number} period  Periodo a evaluar, en segundos.
   * @returns {number} Sa interpolado, en las mismas unidades del espectro.
   */
  _interpolateSpectrum(points, period) {
    if (!Array.isArray(points) || !points.length) return 0;
    const pts = [...points].sort((a, b) => (Number(a.T) || 0) - (Number(b.T) || 0));
    const T = Number(period) || 0;
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (T <= (Number(first.T) || 0)) return Number(first.Sa) || 0;
    if (T >= (Number(last.T) || 0)) return Number(last.Sa) || 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const t0 = Number(pts[i].T) || 0;
      const t1 = Number(pts[i + 1].T) || 0;
      if (T >= t0 && T <= t1) {
        const sa0 = Number(pts[i].Sa) || 0;
        const sa1 = Number(pts[i + 1].Sa) || 0;
        const f = t1 > t0 ? (T - t0) / (t1 - t0) : 0;
        return sa0 + f * (sa1 - sa0);
      }
    }
    return Number(last.Sa) || 0;
  },

  /**
   * Chequeo normativo de escalado del cortante basal DINÁMICO (análisis modal
   * espectral) respecto al ESTÁTICO (fuerza lateral equivalente).
   *
   * Las normas sísmicas (Perú E.030, ASCE 7, etc.) exigen que el cortante basal
   * dinámico no sea menor que una fracción k del estático:
   *
   *     V_dinámico  ≥  k · V_estático
   *
   * con k = 0.80 (estructuras regulares) o 0.90 (irregulares) según E.030.
   * Si NO se cumple, todos los resultados sísmicos deben multiplicarse por el
   * factor de escala:   f = (k · V_estático) / V_dinámico   ( > 1 ).
   *
   * El cortante estático se estima por el método de fuerza lateral equivalente:
   *     V_estático = Cs · W      con   Cs = Sa(T₁) [en g]   y   W = masa·g
   *   ⇒ V_estático = Sa(T₁)[m/s²] · masa_total      (en Newton)
   *
   * @param {object} result  Resultado del caso (usa seismic.{x,y}.base_shear, modal, meta).
   * @param {object} rc       Run-case (spectrumX/Y, direction) — provee el espectro y dirección.
   * @param {object} cfg      seismicConfig (g, saInG, irregular).
   * @returns {{k:number, x?:object, y?:object}}  Escalado por dirección física.
   *          Cada dirección: {period, v_static, v_dynamic, ratio, factor, ok}.
   */
  _computeBaseShearScaling(result, rc, cfg) {
    const g = Number(cfg.g) || 9.81;
    const saToMs2 = cfg.saInG ? g : 1;          // pasa Sa (g) → m/s²
    const k = cfg.irregular ? 0.90 : 0.80;      // mínimo exigido por norma
    const modes = result.modal?.modes || [];
    const meta = result.meta || {};

    // Direcciones físicas del caso y su espectro asociado.
    const dirs = rc.direction === "both" ? ["x", "y"] : [rc.direction || "x"];
    // En análisis "X e Y", si no se dio un espectro Y aparte, se usa el de X
    // para la dirección Y (mismo espectro en ambas direcciones).
    const spectrumFor = (d) =>
      rc.direction === "both"
        ? (d === "x" ? rc.spectrumX : (rc.spectrumY || rc.spectrumX))
        : rc.spectrumX;
    const massFor = (d) =>
      Number(d === "x" ? meta.total_mass_x : meta.total_mass_y) || this._getTotalModelMass();

    const out = { k };
    for (const d of dirs) {
      const spectrum = spectrumFor(d);
      const vDyn = Number(result.seismic?.[d]?.base_shear) || 0;
      const mass = massFor(d);
      if (!spectrum?.length || !mass || !vDyn) continue;

      // Periodo fundamental de la dirección = modo con mayor masa participante.
      const pKey = d === "x" ? "mass_participation_x" : "mass_participation_y";
      const dom = modes.reduce((b, m) => ((m[pKey] || 0) > (b?.[pKey] || 0) ? m : b), null);
      const T1 = Number(dom?.period ?? modes[0]?.period ?? 0);

      const SaT1 = this._interpolateSpectrum(spectrum, T1) * saToMs2; // m/s²
      const vStatic = SaT1 * mass;                  // N
      const required = k * vStatic;                 // N mínimo
      const factor = vDyn >= required ? 1 : (vDyn > 0 ? required / vDyn : 1);

      out[d] = {
        period: T1,
        v_static: vStatic,
        v_dynamic: vDyn,
        ratio: vStatic > 0 ? vDyn / vStatic : 0,
        factor,
        ok: factor <= 1.0001,                       // cumple si no requiere escalar
      };
    }
    return out;
  },

  // ─── D1: resolución de propiedades de material ──────────────────────────────
  // Normaliza un módulo a Pa: si viene < 1e7 se asume en MPa y se multiplica ×1e6;
  // si ya es grande (≥1e7) se asume en Pa. null si no es válido.
  _normalizeModulus(raw) {
    const v = Number(raw) || 0;
    if (v <= 0) return null;
    return v >= 1e7 ? v : v * 1e6;
  },

  // Resuelve E y G (en Pa) para una sección: busca su material por nombre en
  // cadSystem.materialProperties.materials. Si la sección no referencia material
  // pero hay exactamente uno definido, lo usa. Cae a acero por defecto.
  _resolveFrameMaterial(sec = {}, frame = {}) {
    const mats = this.materialProperties?.materials || [];
    const name = sec.material || sec.materialName || sec.materialProperty || sec.mat
      || frame.material || frame.materialName;
    let mat = name ? mats.find((m) => String(m.name) === String(name)) : null;
    if (!mat && mats.length === 1) mat = mats[0]; // único material → usarlo

    const E = this._normalizeModulus(mat?.modulusElasticity ?? mat?.E ?? sec.E ?? sec.elasticModulus) ?? 200e9;
    const G = this._normalizeModulus(mat?.shearModulus ?? mat?.G ?? sec.G ?? sec.shearModulus) ?? 77e9;
    return { E, G, materialName: mat?.name || null };
  },

  // ─── Construir payload para el backend ────────────────────────────────────
  _buildSeismicPayload(cfg, nodes, frames) {
    const nodeList = nodes.map(n => ({
      id:     Number(n.id),
      x:      Number(n.position?.x || 0),
      y:      Number(n.position?.y || 0),
      z:      Number(n.position?.z || 0),
      mass_x: Number(n.mass_x ?? n.mass?.x ?? n.mass ?? 0),
      mass_y: Number(n.mass_y ?? n.mass?.y ?? n.mass ?? 0),
      mass_z: Number(n.mass_z ?? n.mass?.z ?? 0),
    }));

    const elemList = frames.map(f => {
      const sec = f.frameSection || f.section || {};
      // D1: E/G se resuelven desde el MATERIAL referenciado por la sección
      // (con conversión MPa→Pa). A/Iz/Iy/J desde la sección si existen.
      const { E, G } = this._resolveFrameMaterial(sec, f);
      const A  = Number(sec.A  || sec.area  || f.A  || 0.01);   // m²
      const Iz = Number(sec.Iz || sec.iz || sec.I33 || f.Iz || 1e-4);  // m⁴
      const Iy = Number(sec.Iy || sec.iy || sec.I22 || f.Iy || 1e-4);  // m⁴
      const J  = Number(sec.J  || sec.torsional || f.J  || 1e-6);      // m⁴
      return {
        id:     Number(f.id),
        node_i: Number(f.node1.id),
        node_j: Number(f.node2.id),
        A, E, G, Iz, Iy, J,
      };
    });

    const _soporteToRestraints = (soporte) => {
      if (soporte === 'soporteUno')  return { ux:1, uy:1, uz:1, rx:1, ry:1, rz:1 }; // fixed (empotrado)
      if (soporte === 'soporteDos')  return { ux:1, uy:1, uz:1, rx:0, ry:0, rz:0 }; // pinned
      if (soporte === 'soporteTres') return { ux:0, uy:0, uz:1, rx:0, ry:0, rz:0 }; // roller Z
      return { ux:0, uy:0, uz:0, rx:0, ry:0, rz:0 };
    };

    const supports = nodes
      .filter(n => n.restraints || n.constraints || n.soporte)
      .map(n => {
        const r = n.restraints || n.constraints || _soporteToRestraints(n.soporte);
        return {
          node: Number(n.id),
          ux: r.ux ? 1 : 0, uy: r.uy ? 1 : 0, uz: r.uz ? 1 : 0,
          rx: r.rx ? 1 : 0, ry: r.ry ? 1 : 0, rz: r.rz ? 1 : 0,
        };
      });

    // Cargas estáticas (gravedad)
    const loads = nodes
      .filter(n => {
        const f = n.force || {};
        return Object.values(f).some(v => Number(v) !== 0);
      })
      .map(n => {
        const f = n.force || {};
        return {
          node: Number(n.id),
          fx: Number(f.fx || f.Fx || 0),
          fy: Number(f.fy || f.Fy || 0),
          fz: Number(f.fz || f.Fz || 0),
          mx: Number(f.mx || f.Mx || 0),
          my: Number(f.my || f.My || 0),
          mz: Number(f.mz || f.Mz || 0),
        };
      });

    const payload = {
      nodes: nodeList,
      elements: elemList,
      supports,
      loads,
      spectrum_x: cfg.spectrumX,
      num_modes:  cfg.numModes,
      combination: cfg.combination,
      damping_ratio: cfg.dampingRatio,
      sa_in_g: cfg.saInG,
      g: cfg.g,
    };

    if (cfg.spectrumY && cfg.spectrumY.length > 0) {
      payload.spectrum_y = cfg.spectrumY;
    }

    return payload;
  },

  // ─── Aplicar resultados al modelo CAD ────────────────────────────────────
  _applySeismicResultsToModel(result, { silent = false } = {}) {
    const envelope = result.envelope?.by_node || {};

    (this.nodes || []).forEach(n => {
      const nid = Number(n.id);
      const env = envelope[nid];
      if (!env) return;

      n.seismicDisplacement = {
        dx: env.dx, dy: env.dy, dz: env.dz,
      };
      // Magnitud para visualización de deflexión
      n.seismicDeflection = Math.sqrt(env.dx**2 + env.dy**2 + env.dz**2);
    });

    this.redraw?.();
    if (!silent) {
      this.showMessage?.("Análisis sísmico completado. Resultados guardados en el modelo.", "success");
    }
  },

  // ─── C2: Clasificación del tipo de modo según participación de masa ────────
  _classifyMode(mpx, mpy) {
    const x = Number(mpx) || 0;
    const y = Number(mpy) || 0;
    const total = x + y;
    if (total < 2)                  return { label: "Rotacional/Vert.", color: "#f59e0b" };
    if (x > 60 && x > 2.5 * y)      return { label: "Traslacional X",   color: "#60a5fa" };
    if (y > 60 && y > 2.5 * x)      return { label: "Traslacional Y",   color: "#34d399" };
    if (x > 40 && y > 40)           return { label: "Acoplado X-Y",     color: "#a78bfa" };
    if (x >= y)                     return { label: "Traslacional X",   color: "#60a5fa" };
    return                                 { label: "Traslacional Y",   color: "#34d399" };
  },

  // ─── C2: Diagnósticos automáticos del análisis ─────────────────────────────
  _buildSeismicDiagnostics(result) {
    const modes = result.modal?.modes || [];
    const meta = result.meta || {};
    const last = modes[modes.length - 1] || {};
    const sumX = Number(meta.sum_participation_x ?? last.cumulative_participation_x ?? 0);
    const sumY = Number(meta.sum_participation_y ?? last.cumulative_participation_y ?? 0);
    const T1 = Number(modes[0]?.period ?? 0);

    const warnings = [];
    if (sumX < 90) warnings.push(`ΣMP-X = ${sumX.toFixed(1)}% &lt; 90% — aumenta el número de modos`);
    if (sumY < 90) warnings.push(`ΣMP-Y = ${sumY.toFixed(1)}% &lt; 90% — aumenta el número de modos`);
    if (T1 > 3)    warnings.push(`T₁ = ${T1.toFixed(2)}s es largo — estructura muy flexible para su altura`);
    if (T1 > 0 && T1 < 0.05) warnings.push(`T₁ = ${T1.toFixed(4)}s parece demasiado corto — verifica secciones y masas`);

    if (warnings.length === 0) {
      return `<div style="background:#064e3b; border:1px solid #059669; color:#a7f3d0;
                  padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11px">
                ✓ Sin observaciones: ΣMP ≥ 90% en ambas direcciones y T₁ en rango razonable.
              </div>`;
    }
    return `<div style="background:#450a0a; border:1px solid #b91c1c; color:#fecaca;
                padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11px">
              <strong>⚠ Observaciones:</strong>
              <ul style="margin:6px 0 0; padding-left:18px">
                ${warnings.map(w => `<li style="margin:2px 0">${w}</li>`).join("")}
              </ul>
            </div>`;
  },

  // ─── Bloque HTML del escalado dinámico/estático (sugerencia #1) ─────────────
  // Muestra, por dirección: V dinámico, V estático, su razón y si cumple
  // V_din ≥ k·V_est; si no, el factor de escala requerido.
  _buildScalingHtml(result) {
    const sc = result.scaling;
    if (!sc || (!sc.x && !sc.y)) return "";
    const kPct = (sc.k * 100).toFixed(0);
    const tipoLabel = sc.k >= 0.9 ? "irregular" : "regular";

    const row = (label, d) => {
      if (!d) return "";
      const color = d.ok ? "#86efac" : "#fca5a5";
      const verdict = d.ok ? "✓ cumple" : `⚠ escalar ×${d.factor.toFixed(2)}`;
      return `<tr style="border-bottom:1px solid #334155">
        <td style="padding:4px 8px; text-align:center">${label}</td>
        <td style="padding:4px 8px; text-align:right">${(d.v_dynamic / 1000).toFixed(2)}</td>
        <td style="padding:4px 8px; text-align:right">${(d.v_static / 1000).toFixed(2)}</td>
        <td style="padding:4px 8px; text-align:right">${(d.ratio * 100).toFixed(0)}%</td>
        <td style="padding:4px 8px; text-align:center; color:${color}; font-weight:600">${verdict}</td>
      </tr>`;
    };

    return `
      <div style="margin-bottom:12px">
        <div style="color:#7eb8f7; font-size:11px; font-weight:600; margin-bottom:4px">
          Escalado V dinámico / estático — mínimo k = ${kPct}% (${tipoLabel})
        </div>
        <table style="width:100%; border-collapse:collapse; color:#e2e8f0; font-size:11px">
          <thead><tr style="background:#1e3a5f; color:#7eb8f7">
            <th style="padding:4px 8px">Dir</th>
            <th style="padding:4px 8px">V dinámico (kN)</th>
            <th style="padding:4px 8px">V estático (kN)</th>
            <th style="padding:4px 8px">V din/V est</th>
            <th style="padding:4px 8px">Estado</th>
          </tr></thead>
          <tbody>${row("X", sc.x)}${row("Y", sc.y)}</tbody>
        </table>
      </div>`;
  },

  // ─── Bloque HTML: peso sísmico total + momento de volteo (sugerencia #3) ────
  _buildWeightOverturningHtml(result) {
    const w = result.weights;
    const ot = result.overturning;
    const parts = [];
    if (w?.total != null) parts.push(`Peso sísmico: <b style="color:#fde68a">${(w.total / 1000).toFixed(1)} kN</b>`);
    if (ot?.x != null) parts.push(`Volteo X: <b style="color:#7dd3fc">${(ot.x / 1000).toFixed(1)} kN·m</b>`);
    if (ot?.y != null) parts.push(`Volteo Y: <b style="color:#86efac">${(ot.y / 1000).toFixed(1)} kN·m</b>`);
    if (!parts.length) return "";
    return `<div style="background:#1e293b; padding:6px 12px; border-radius:6px; margin-bottom:12px; font-size:11px; color:#cbd5e1">
              ${parts.join(" &nbsp;|&nbsp; ")}
            </div>`;
  },

  // ─── C2: Mostrar panel de resultados modales ───────────────────────────────
  async showSeismicResults(result) {
    const modes = result.modal?.modes || [];
    const seisX = result.seismic?.x;
    const seisY = result.seismic?.y;

    const fmt = (v, d = 4) => (v != null ? Number(v).toFixed(d) : "-");

    // Tabla de modos con columna "Tipo"
    const rows = modes.map(m => {
      const tipo = this._classifyMode(m.mass_participation_x, m.mass_participation_y);
      return `
      <tr style="border-bottom:1px solid #334155">
        <td style="padding:5px 8px; text-align:center">${m.mode}</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.period, 4)}</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.frequency, 3)}</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.mass_participation_x, 1)}%</td>
        <td style="padding:5px 8px; text-align:right; color:#7dd3fc">${fmt(m.cumulative_participation_x, 1)}%</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.mass_participation_y, 1)}%</td>
        <td style="padding:5px 8px; text-align:right; color:#7dd3fc">${fmt(m.cumulative_participation_y, 1)}%</td>
        <td style="padding:5px 8px; text-align:center; color:${tipo.color}; font-weight:600">${tipo.label}</td>
      </tr>`;
    }).join("");

    // Cortantes basales
    const Vx = seisX?.base_shear;
    const Vy = seisY?.base_shear;
    const toKN = (v) => (v != null ? `${(v / 1000).toFixed(2)} kN` : "-");

    // Deriva máxima (si el contrato la trae — B1)
    const allDrifts = [...(result.drifts?.x || []), ...(result.drifts?.y || [])];
    const maxDrift = allDrifts.length
      ? Math.max(...allDrifts.map(d => Number(d.drift_ratio) || 0))
      : null;
    const driftOk = allDrifts.length ? allDrifts.every(d => d.ok) : null;

    // Badge de datos simulados
    const mockBadge = result._mock
      ? `<div style="background:#78350f; border:1px solid #d97706; color:#fde68a;
            padding:6px 12px; border-radius:6px; margin-bottom:12px; font-size:11px; text-align:center">
            🧪 <strong>DATOS SIMULADOS</strong> — visualización de prueba (motor real aún no conectado)
         </div>`
      : "";

    const diagnostics = this._buildSeismicDiagnostics(result);

    // Selector de caso (Nivel B) — solo si hay más de un caso corrido.
    const caseOrder = this.seismicCaseOrder || [];
    const activeCase = this.seismicActiveCase;
    const caseSelectorHtml = caseOrder.length > 1
      ? `<div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; background:#1e293b; padding:6px 10px; border-radius:6px">
           <span style="color:#94a3b8; font-size:11px">Caso espectral:</span>
           <select id="seis-case-sel" style="flex:1; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; font-size:12px">
             ${caseOrder.map((c) => `<option value="${c.id}" ${c.id === activeCase ? "selected" : ""}>${c.name}</option>`).join("")}
           </select>
         </div>`
      : "";

    // Tarjetas de resumen
    const card = (label, value, color) => `
      <div style="flex:1; background:#1e293b; border-radius:6px; padding:8px 10px; text-align:center">
        <div style="color:#94a3b8; font-size:10px; text-transform:uppercase">${label}</div>
        <div style="color:${color}; font-size:15px; font-weight:700; margin-top:2px">${value}</div>
      </div>`;

    const summaryCards = `
      <div style="display:flex; gap:8px; margin-bottom:12px">
        ${card("Cortante basal X", toKN(Vx), "#7dd3fc")}
        ${card("Cortante basal Y", toKN(Vy), "#86efac")}
        ${maxDrift != null
          ? card("Deriva máx.", `${(maxDrift * 1000).toFixed(2)}‰`, driftOk ? "#86efac" : "#fca5a5")
          : card("Modos", `${modes.length}`, "#c4b5fd")}
      </div>`;

    const html = `
      <div style="font-family:monospace; font-size:12px; text-align:left">

        ${mockBadge}
        ${caseSelectorHtml}
        ${diagnostics}
        ${summaryCards}
        ${this._buildWeightOverturningHtml(result)}
        ${this._buildScalingHtml(result)}

        <!-- Tabla modal -->
        <div style="overflow-x:auto">
          <table style="width:100%; border-collapse:collapse; color:#e2e8f0">
            <thead>
              <tr style="background:#1e3a5f; color:#7eb8f7">
                <th style="padding:6px 8px">Modo</th>
                <th style="padding:6px 8px">T (s)</th>
                <th style="padding:6px 8px">f (Hz)</th>
                <th style="padding:6px 8px">MP-X%</th>
                <th style="padding:6px 8px">Σ MP-X%</th>
                <th style="padding:6px 8px">MP-Y%</th>
                <th style="padding:6px 8px">Σ MP-Y%</th>
                <th style="padding:6px 8px">Tipo</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div style="color:#94a3b8; font-size:11px; margin-top:10px">
          Combinación: ${result.meta?.combination || this.seismicConfig?.combination || "CQC"} &nbsp;|&nbsp;
          ζ = ${result.meta?.damping_ratio ?? this.seismicConfig?.dampingRatio ?? 0.05} &nbsp;|&nbsp;
          ${(result.meta?.sa_in_g ?? this.seismicConfig?.saInG) ? "Sa en [g]" : "Sa en [m/s²]"} &nbsp;|&nbsp;
          ${modes.length} modos
        </div>
      </div>
    `;

    const hasDrifts = (result.drifts?.x?.length || result.drifts?.y?.length);

    const swalResult = await Swal.fire({
      title: "Resultados: Análisis Sísmico Espectral",
      html,
      width: 780,
      background: "#1a2035",
      color: "#e2e8f0",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#1d4ed8",
      showDenyButton: true,
      denyButtonText: "Animar en 3D",
      denyButtonColor: "#0f766e",
      showCancelButton: !!hasDrifts,
      cancelButtonText: "📐 Derivas",
      cancelButtonColor: "#0891b2",
      didOpen: () => {
        // Selector de caso: cambia el resultado activo y re-renderiza el panel.
        const sel = document.getElementById("seis-case-sel");
        sel?.addEventListener("change", () => {
          const id = sel.value;
          if (!this.seismicResultsByCase?.[id]) return;
          this.seismicActiveCase = id;
          this.seismicResults = this.seismicResultsByCase[id];
          this._applySeismicResultsToModel(this.seismicResults, { silent: true });
          Swal.close();
          this.showSeismicResults(this.seismicResults);
        });
      },
    });

    if (swalResult.isDenied) {
      this.startSeismicAnimation();
    } else if (swalResult.dismiss === Swal.DismissReason.cancel) {
      await this.showStoryDriftDiagram();
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  //  C3 / C4 — Diagramas de respuesta por piso (estilo ETABS Story Response)
  // ════════════════════════════════════════════════════════════════════════

  // Constructor SVG genérico: valor (eje X) vs elevación de piso (eje Y).
  // Reutilizado por derivas (C3) y cortante por piso (C4).
  //   series: [{name, color, points:[{value, z}]}]   value en unidades de display
  //   limit:  {value, color, label}                  línea vertical opcional
  //   baseValue: ancla de la serie en la base —
  //     0       → arranca en 0 (derivas: no hay deriva en el suelo)
  //     "first" → arranca en el valor del piso más bajo (cortante: máximo en base)
  //     null    → sin ancla (solo une los puntos de piso)
  _buildStoryResponseSVG({ series = [], limit = null, xLabel = "", baseZ = 0, baseValue = 0 }) {
    const W = 540, H = 380;
    const ML = 70, MR = 24, MT = 28, MB = 52;
    const plotW = W - ML - MR;
    const plotH = H - MT - MB;

    // Rango de valores (incluye el límite si existe)
    const allVals = series.flatMap((s) => s.points.map((p) => p.value));
    if (limit) allVals.push(limit.value);
    const maxVal = Math.max(1e-9, ...allVals) * 1.15;

    // Rango de elevaciones
    const allZ = series.flatMap((s) => s.points.map((p) => p.z)).concat(baseZ);
    const topZ = Math.max(...allZ);
    const minZ = Math.min(...allZ, baseZ);
    const zSpan = Math.max(1e-9, topZ - minZ);

    const sx = (v) => ML + (v / maxVal) * plotW;
    const sy = (z) => MT + plotH - ((z - minZ) / zSpan) * plotH;

    // Gridlines horizontales por nivel (uniendo todas las cotas presentes)
    const zLevels = [...new Set(allZ.map((z) => Math.round(z * 1000) / 1000))].sort((a, b) => a - b);
    const gridLines = zLevels.map((z) => {
      const y = sy(z);
      return `<line x1="${ML}" y1="${y}" x2="${ML + plotW}" y2="${y}" stroke="#1e293b" stroke-width="1"/>
              <text x="${ML - 8}" y="${y + 3}" text-anchor="end" fill="#94a3b8" font-size="10">${z.toFixed(2)}</text>`;
    }).join("");

    // Ticks del eje X (0, ½, máx)
    const xticks = [0, maxVal / 2, maxVal].map((v) => {
      const x = sx(v);
      return `<line x1="${x}" y1="${MT + plotH}" x2="${x}" y2="${MT + plotH + 5}" stroke="#475569"/>
              <text x="${x}" y="${MT + plotH + 18}" text-anchor="middle" fill="#94a3b8" font-size="10">${v.toFixed(2)}</text>`;
    }).join("");

    // Línea de límite (deriva admisible)
    let limitSvg = "";
    if (limit) {
      const x = sx(limit.value);
      limitSvg = `
        <line x1="${x}" y1="${MT}" x2="${x}" y2="${MT + plotH}" stroke="${limit.color}" stroke-width="1.5" stroke-dasharray="5,4"/>
        <text x="${x}" y="${MT - 6}" text-anchor="middle" fill="${limit.color}" font-size="10">${limit.label}</text>`;
    }

    // Series (polilínea desde la base + marcadores)
    const seriesSvg = series.map((s) => {
      const pts = [...s.points].sort((a, b) => a.z - b.z);
      let anchor = null;
      if (baseValue === "first") anchor = pts.length ? { value: pts[0].value, z: baseZ } : null;
      else if (typeof baseValue === "number") anchor = { value: baseValue, z: baseZ };
      const full = anchor ? [anchor, ...pts] : pts;
      const coords = full
        .map((p) => `${sx(p.value).toFixed(1)},${sy(p.z).toFixed(1)}`)
        .join(" ");
      const markers = pts
        .map((p) => `<circle cx="${sx(p.value).toFixed(1)}" cy="${sy(p.z).toFixed(1)}" r="3.5" fill="${s.color}"/>`)
        .join("");
      return `<polyline points="${coords}" fill="none" stroke="${s.color}" stroke-width="2"/>${markers}`;
    }).join("");

    // Leyenda
    const legend = series.map((s, i) => `
      <rect x="${ML + plotW - 110}" y="${MT + 6 + i * 16}" width="11" height="11" fill="${s.color}"/>
      <text x="${ML + plotW - 94}" y="${MT + 15 + i * 16}" fill="#e2e8f0" font-size="11">${s.name}</text>`).join("");

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="background:#0f172a; border-radius:8px">
        <rect x="0" y="0" width="${W}" height="${H}" fill="#0f172a"/>
        <rect x="${ML}" y="${MT}" width="${plotW}" height="${plotH}" fill="none" stroke="#334155"/>
        ${gridLines}
        ${xticks}
        ${limitSvg}
        ${seriesSvg}
        ${legend}
        <text x="${ML + plotW / 2}" y="${H - 8}" text-anchor="middle" fill="#cbd5e1" font-size="11">${xLabel}</text>
        <text x="14" y="${MT + plotH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="11"
              transform="rotate(-90 14 ${MT + plotH / 2})">Elevación (m)</text>
      </svg>`;
  },

  // C3 — Diagrama de derivas de piso (Story Drifts)
  async showStoryDriftDiagram() {
    const result = this.seismicResults;
    if (!result) {
      this.showMessage?.("Ejecute primero el análisis sísmico para ver las derivas.", "warning");
      return;
    }
    const driftsX = result.drifts?.x || [];
    const driftsY = result.drifts?.y || [];
    if (!driftsX.length && !driftsY.length) {
      await Swal.fire({
        icon: "info",
        title: "Sin datos de deriva",
        html: "El resultado actual no incluye <code>drifts</code> (bloque B1 del motor).<br>" +
              "Con datos simulados deberían aparecer; con el motor real, requiere que el backend los emita.",
        background: "#1a2035", color: "#e2e8f0",
      });
      return;
    }

    const baseZ = result.stories?.[0]?.z ?? 0;
    const allowable = (driftsX[0] || driftsY[0])?.allowable ?? 0.007;

    // SVG en ‰ (drift_ratio × 1000) para legibilidad
    const toSeries = (arr, name, color) => ({
      name, color,
      points: arr.map((d) => ({ value: (Number(d.drift_ratio) || 0) * 1000, z: Number(d.z) || 0 })),
    });
    const series = [];
    if (driftsX.length) series.push(toSeries(driftsX, "Deriva X", "#60a5fa"));
    if (driftsY.length) series.push(toSeries(driftsY, "Deriva Y", "#34d399"));

    const svg = this._buildStoryResponseSVG({
      series,
      limit: { value: allowable * 1000, color: "#f87171", label: `Admisible ${(allowable * 1000).toFixed(1)}‰` },
      xLabel: "Deriva de entrepiso (‰)",
      baseZ,
    });

    // Tabla numérica
    const merged = {};
    driftsX.forEach((d) => { merged[d.story] = { ...merged[d.story], story: d.story, x: d.drift_ratio, okX: d.ok }; });
    driftsY.forEach((d) => { merged[d.story] = { ...merged[d.story], story: d.story, y: d.drift_ratio, okY: d.ok }; });
    const tableRows = Object.values(merged)
      .sort((a, b) => b.story - a.story)
      .map((r) => {
        const cell = (v, ok) =>
          v == null ? "-" :
          `<span style="color:${ok ? "#86efac" : "#fca5a5"}">${(v * 1000).toFixed(2)}‰ ${ok ? "✓" : "✗"}</span>`;
        return `<tr style="border-bottom:1px solid #334155">
          <td style="padding:4px 8px;text-align:center">Piso ${r.story}</td>
          <td style="padding:4px 8px;text-align:right">${cell(r.x, r.okX)}</td>
          <td style="padding:4px 8px;text-align:right">${cell(r.y, r.okY)}</td>
        </tr>`;
      }).join("");

    const anyFail = [...driftsX, ...driftsY].some((d) => !d.ok);
    const verdict = anyFail
      ? `<div style="background:#450a0a;border:1px solid #b91c1c;color:#fecaca;padding:6px 12px;border-radius:6px;margin-top:10px;font-size:11px">⚠ Hay pisos que superan la deriva admisible (${(allowable * 1000).toFixed(1)}‰).</div>`
      : `<div style="background:#064e3b;border:1px solid #059669;color:#a7f3d0;padding:6px 12px;border-radius:6px;margin-top:10px;font-size:11px">✓ Todas las derivas cumplen el límite admisible.</div>`;

    const mockBadge = result._mock
      ? `<div style="background:#78350f;border:1px solid #d97706;color:#fde68a;padding:5px 10px;border-radius:6px;margin-bottom:10px;font-size:11px;text-align:center">🧪 DATOS SIMULADOS</div>`
      : "";

    await Swal.fire({
      title: "Derivas de Piso (Story Drifts)",
      html: `
        <div style="font-family:monospace">
          ${mockBadge}
          <div style="display:flex;justify-content:center">${svg}</div>
          <table style="width:100%;border-collapse:collapse;color:#e2e8f0;margin-top:12px;font-size:12px">
            <thead><tr style="background:#1e3a5f;color:#7eb8f7">
              <th style="padding:5px 8px">Nivel</th>
              <th style="padding:5px 8px">Deriva X</th>
              <th style="padding:5px 8px">Deriva Y</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          ${verdict}
        </div>`,
      width: 620,
      background: "#1a2035",
      color: "#e2e8f0",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#1d4ed8",
      showDenyButton: !!(result.story_shears?.x?.length || result.story_shears?.y?.length),
      denyButtonText: "📊 Cortante",
      denyButtonColor: "#0891b2",
      showCancelButton: true,
      cancelButtonText: "📑 Reporte",
      cancelButtonColor: "#7c3aed",
    }).then((r) => {
      if (r.isDenied) this.showStoryShearDiagram();
      else if (r.dismiss === Swal.DismissReason.cancel) this.generarReporteSismico();
    });
  },

  // C4 — Diagrama de cortante por piso (Story Shears)
  async showStoryShearDiagram() {
    const result = this.seismicResults;
    if (!result) {
      this.showMessage?.("Ejecute primero el análisis sísmico para ver el cortante por piso.", "warning");
      return;
    }
    const shearsX = result.story_shears?.x || [];
    const shearsY = result.story_shears?.y || [];
    if (!shearsX.length && !shearsY.length) {
      await Swal.fire({
        icon: "info",
        title: "Sin datos de cortante por piso",
        html: "El resultado actual no incluye <code>story_shears</code> (bloque B6 del motor).<br>" +
              "Con datos simulados deberían aparecer; con el motor real, requiere que el backend los emita.",
        background: "#1a2035", color: "#e2e8f0",
      });
      return;
    }

    const baseZ = result.stories?.[0]?.z ?? 0;

    // SVG en kN (shear / 1000)
    const toSeries = (arr, name, color) => ({
      name, color,
      points: arr.map((s) => ({ value: (Number(s.shear) || 0) / 1000, z: Number(s.z) || 0 })),
    });
    const series = [];
    if (shearsX.length) series.push(toSeries(shearsX, "Cortante X", "#60a5fa"));
    if (shearsY.length) series.push(toSeries(shearsY, "Cortante Y", "#34d399"));

    const svg = this._buildStoryResponseSVG({
      series,
      xLabel: "Cortante de piso (kN)",
      baseZ,
      baseValue: "first", // el cortante en la base es el máximo (cortante basal)
    });

    // Tabla numérica
    const merged = {};
    shearsX.forEach((s) => { merged[s.story] = { ...merged[s.story], story: s.story, x: s.shear }; });
    shearsY.forEach((s) => { merged[s.story] = { ...merged[s.story], story: s.story, y: s.shear }; });
    const tableRows = Object.values(merged)
      .sort((a, b) => b.story - a.story)
      .map((r) => {
        const cell = (v) => (v == null ? "-" : `${(v / 1000).toFixed(2)} kN`);
        return `<tr style="border-bottom:1px solid #334155">
          <td style="padding:4px 8px;text-align:center">Piso ${r.story}</td>
          <td style="padding:4px 8px;text-align:right;color:#93c5fd">${cell(r.x)}</td>
          <td style="padding:4px 8px;text-align:right;color:#86efac">${cell(r.y)}</td>
        </tr>`;
      }).join("");

    const Vbx = result.seismic?.x?.base_shear;
    const Vby = result.seismic?.y?.base_shear;
    const baseSummary = `<div style="background:#1e293b;padding:6px 12px;border-radius:6px;margin-top:10px;font-size:11px;color:#7dd3fc">
        Cortante basal — X: <strong>${Vbx != null ? (Vbx / 1000).toFixed(2) : "-"} kN</strong>
        &nbsp;|&nbsp; Y: <strong>${Vby != null ? (Vby / 1000).toFixed(2) : "-"} kN</strong>
      </div>`;

    const mockBadge = result._mock
      ? `<div style="background:#78350f;border:1px solid #d97706;color:#fde68a;padding:5px 10px;border-radius:6px;margin-bottom:10px;font-size:11px;text-align:center">🧪 DATOS SIMULADOS</div>`
      : "";

    await Swal.fire({
      title: "Cortante por Piso (Story Shears)",
      html: `
        <div style="font-family:monospace">
          ${mockBadge}
          <div style="display:flex;justify-content:center">${svg}</div>
          <table style="width:100%;border-collapse:collapse;color:#e2e8f0;margin-top:12px;font-size:12px">
            <thead><tr style="background:#1e3a5f;color:#7eb8f7">
              <th style="padding:5px 8px">Nivel</th>
              <th style="padding:5px 8px">Cortante X</th>
              <th style="padding:5px 8px">Cortante Y</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          ${baseSummary}
        </div>`,
      width: 620,
      background: "#1a2035",
      color: "#e2e8f0",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#1d4ed8",
      showDenyButton: !!(result.drifts?.x?.length || result.drifts?.y?.length),
      denyButtonText: "📐 Derivas",
      denyButtonColor: "#0891b2",
      showCancelButton: true,
      cancelButtonText: "📑 Reporte",
      cancelButtonColor: "#7c3aed",
    }).then((r) => {
      if (r.isDenied) this.showStoryDriftDiagram();
      else if (r.dismiss === Swal.DismissReason.cancel) this.generarReporteSismico();
    });
  },

  // ════════════════════════════════════════════════════════════════════════
  //  C5 — Reporte sísmico exportable (PDF vía pdfMake)
  // ════════════════════════════════════════════════════════════════════════

  // Rasteriza un SVG (string) a PNG dataURL para incrustarlo en el PDF.
  _svgToPngDataURL(svgString, width, height) {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve(null);
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
      } catch (_) {
        resolve(null);
      }
    });
  },

  async generarReporteSismico() {
    if (!window.pdfMake) {
      this.showMessage?.("pdfMake no está disponible. No se puede generar el PDF.", "error");
      return;
    }

    // Casos disponibles para incluir en el reporte.
    const byCase = this.seismicResultsByCase || {};
    const order = (this.seismicCaseOrder || []).filter((o) => byCase[o.id]);
    let available = order.slice();
    if (!available.length && this.seismicResults) {
      available = [{ id: "_active", name: this.seismicResults._caseName || "Análisis sísmico" }];
    }
    if (!available.length) {
      this.showMessage?.("Ejecute primero el análisis sísmico para generar el reporte.", "warning");
      return;
    }

    // Selección de casos (solo si hay más de uno).
    let selectedIds = available.map((c) => c.id);
    if (available.length > 1) {
      const checksHtml = available.map((c) => `
        <label style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-bottom:1px solid #334155; cursor:pointer">
          <input type="checkbox" class="rep-case" value="${c.id}" ${c.id === this.seismicActiveCase ? "checked" : "checked"}>
          <span style="color:#e2e8f0">${c.name}</span>
        </label>`).join("");

      const btn = (id, label) => `<button id="${id}" type="button" style="flex:1; padding:5px; border:none; border-radius:4px; background:#374151; color:#fff; cursor:pointer; font-size:11px">${label}</button>`;

      const pick = await Swal.fire({
        title: "Casos a incluir en el reporte",
        width: 480,
        background: "#1a2035",
        color: "#e2e8f0",
        html: `
          <div style="text-align:left; font-family:monospace; font-size:12px">
            <div style="color:#94a3b8; margin-bottom:6px">Marca los casos que quieres en el PDF (un capítulo por caso):</div>
            <div style="border:1px solid #475569; border-radius:6px; max-height:260px; overflow:auto">${checksHtml}</div>
            <div style="display:flex; gap:8px; margin-top:8px">${btn("rep-all", "Todos")}${btn("rep-none", "Ninguno")}</div>
          </div>`,
        showCancelButton: true,
        confirmButtonText: "Generar PDF",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#1d4ed8",
        didOpen: () => {
          document.getElementById("rep-all")?.addEventListener("click", () =>
            document.querySelectorAll(".rep-case").forEach((c) => { c.checked = true; }));
          document.getElementById("rep-none")?.addEventListener("click", () =>
            document.querySelectorAll(".rep-case").forEach((c) => { c.checked = false; }));
        },
        preConfirm: () => {
          const ids = [...document.querySelectorAll(".rep-case:checked")].map((c) => c.value);
          if (!ids.length) { Swal.showValidationMessage("Selecciona al menos un caso."); return false; }
          return ids;
        },
      });
      if (!pick.isConfirmed) return;
      selectedIds = pick.value;
    }

    Swal.fire({
      title: "Generando reporte sísmico...",
      allowOutsideClick: false,
      background: "#1a2035", color: "#e2e8f0",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const firstResult = selectedIds[0] === "_active" ? this.seismicResults : byCase[selectedIds[0]];
      const multi = selectedIds.length > 1;

      const content = [
        { text: "Reporte de Análisis Sísmico Espectral", style: "title" },
        { text: new Date().toLocaleString(), style: "subtle", margin: [0, 0, 0, 2] },
        firstResult?._mock
          ? { text: "⚠ DATOS SIMULADOS — motor de cálculo aún no conectado", style: "mock", margin: [0, 0, 0, 6] }
          : { text: "", margin: [0, 0, 0, 0] },
        multi
          ? { text: `${selectedIds.length} casos incluidos: ${selectedIds.map((id) => (id === "_active" ? (this.seismicResults?._caseName || "Análisis") : (byCase[id]?._caseName || id))).join(", ")}`, style: "subtle", margin: [0, 0, 0, 6] }
          : { text: "", margin: [0, 0, 0, 0] },
      ];

      let idx = 0;
      for (const id of selectedIds) {
        const result = id === "_active" ? this.seismicResults : byCase[id];
        if (!result) continue;
        const blocks = await this._buildCaseReportContent(result, idx, selectedIds.length);
        content.push(...blocks);
        idx++;
      }

      const docDefinition = {
        content,
        styles: {
          title: { fontSize: 18, bold: true, margin: [0, 0, 0, 2] },
          chapter: { fontSize: 16, bold: true, color: "#1d4ed8", margin: [0, 6, 0, 8] },
          header: { fontSize: 14, bold: true, margin: [0, 14, 0, 6] },
          subtle: { fontSize: 9, color: "#666" },
          mock: { fontSize: 10, bold: true, color: "#b45309" },
          table: { margin: [0, 4, 0, 10] },
          th: { bold: true, fontSize: 9, color: "black", fillColor: "#e2e8f0" },
        },
        defaultStyle: { fontSize: 10 },
      };

      Swal.close();
      window.pdfMake.createPdf(docDefinition).download("Reporte_Sismico.pdf");
      this.showMessage?.(`Reporte sísmico generado (${idx} caso${idx === 1 ? "" : "s"}).`, "success");
    } catch (err) {
      Swal.close();
      console.error("Error generando reporte sísmico:", err);
      this.showMessage?.(`Error generando el reporte: ${err.message}`, "error");
    }
  },

  // Construye los bloques pdfMake de UN caso (rasteriza diagramas + tablas).
  async _buildCaseReportContent(result, idx = 0, total = 1) {
    const modes = result.modal?.modes || [];
    const meta = result.meta || {};
    const driftsX = result.drifts?.x || [];
    const driftsY = result.drifts?.y || [];
    const shearsX = result.story_shears?.x || [];
    const shearsY = result.story_shears?.y || [];
    const baseZ = result.stories?.[0]?.z ?? 0;
    const f = (v, d = 2) => (v != null ? Number(v).toFixed(d) : "-");
    const th = (t) => ({ text: t, style: "th", alignment: "center" });
    const td = (t, color) => ({ text: t, alignment: "center", color: color || "black", fontSize: 9 });

    // Rasterizar diagramas
    let driftImg = null;
    let shearImg = null;
    if (driftsX.length || driftsY.length) {
      const allowable = (driftsX[0] || driftsY[0])?.allowable ?? 0.007;
      const series = [];
      if (driftsX.length) series.push({ name: "Deriva X", color: "#60a5fa", points: driftsX.map((d) => ({ value: (Number(d.drift_ratio) || 0) * 1000, z: Number(d.z) || 0 })) });
      if (driftsY.length) series.push({ name: "Deriva Y", color: "#34d399", points: driftsY.map((d) => ({ value: (Number(d.drift_ratio) || 0) * 1000, z: Number(d.z) || 0 })) });
      const svg = this._buildStoryResponseSVG({
        series,
        limit: { value: allowable * 1000, color: "#f87171", label: `Admisible ${(allowable * 1000).toFixed(1)}‰` },
        xLabel: "Deriva de entrepiso (‰)", baseZ, baseValue: 0,
      });
      driftImg = await this._svgToPngDataURL(svg, 540, 380);
    }
    if (shearsX.length || shearsY.length) {
      const series = [];
      if (shearsX.length) series.push({ name: "Cortante X", color: "#60a5fa", points: shearsX.map((s) => ({ value: (Number(s.shear) || 0) / 1000, z: Number(s.z) || 0 })) });
      if (shearsY.length) series.push({ name: "Cortante Y", color: "#34d399", points: shearsY.map((s) => ({ value: (Number(s.shear) || 0) / 1000, z: Number(s.z) || 0 })) });
      const svg = this._buildStoryResponseSVG({ series, xLabel: "Cortante de piso (kN)", baseZ, baseValue: "first" });
      shearImg = await this._svgToPngDataURL(svg, 540, 380);
    }

    const modalBody = [
      [th("Modo"), th("T (s)"), th("f (Hz)"), th("MP-X%"), th("ΣMP-X%"), th("MP-Y%"), th("ΣMP-Y%"), th("Tipo")],
      ...modes.map((m) => {
        const tipo = this._classifyMode(m.mass_participation_x, m.mass_participation_y);
        return [
          td(m.mode), td(f(m.period, 4)), td(f(m.frequency, 3)),
          td(f(m.mass_participation_x, 1)), td(f(m.cumulative_participation_x, 1)),
          td(f(m.mass_participation_y, 1)), td(f(m.cumulative_participation_y, 1)),
          td(tipo.label),
        ];
      }),
    ];

    const driftRows = {};
    driftsX.forEach((d) => { driftRows[d.story] = { ...driftRows[d.story], story: d.story, x: d.drift_ratio, okX: d.ok }; });
    driftsY.forEach((d) => { driftRows[d.story] = { ...driftRows[d.story], story: d.story, y: d.drift_ratio, okY: d.ok }; });
    const driftBody = [
      [th("Nivel"), th("Deriva X (‰)"), th("¿Cumple?"), th("Deriva Y (‰)"), th("¿Cumple?")],
      ...Object.values(driftRows).sort((a, b) => b.story - a.story).map((r) => [
        td(`Piso ${r.story}`),
        td(r.x != null ? f(r.x * 1000, 2) : "-"),
        td(r.x != null ? (r.okX ? "Sí" : "No") : "-", r.okX ? "#15803d" : "#b91c1c"),
        td(r.y != null ? f(r.y * 1000, 2) : "-"),
        td(r.y != null ? (r.okY ? "Sí" : "No") : "-", r.okY ? "#15803d" : "#b91c1c"),
      ]),
    ];

    const shearRows = {};
    shearsX.forEach((s) => { shearRows[s.story] = { ...shearRows[s.story], story: s.story, x: s.shear }; });
    shearsY.forEach((s) => { shearRows[s.story] = { ...shearRows[s.story], story: s.story, y: s.shear }; });
    const shearBody = [
      [th("Nivel"), th("Cortante X (kN)"), th("Cortante Y (kN)")],
      ...Object.values(shearRows).sort((a, b) => b.story - a.story).map((r) => [
        td(`Piso ${r.story}`),
        td(r.x != null ? f(r.x / 1000, 2) : "-"),
        td(r.y != null ? f(r.y / 1000, 2) : "-"),
      ]),
    ];

    const dxMap = result.seismic?.x?.displacements || {};
    const dyMap = result.seismic?.y?.displacements || {};
    const dispStories = (result.stories || []).filter((s) => s.level > 0);
    const dispBody = [
      [th("Nivel"), th("Despl. X (mm)"), th("Despl. Y (mm)")],
      ...dispStories.sort((a, b) => b.level - a.level).map((s) => {
        const ids = s.node_ids || [];
        const mx = Math.max(0, ...ids.map((id) => Math.abs(Number(dxMap[id]?.dx) || 0)));
        const my = Math.max(0, ...ids.map((id) => Math.abs(Number(dyMap[id]?.dy) || 0)));
        return [td(`Piso ${s.level}`), td(f(mx * 1000, 2)), td(f(my * 1000, 2))];
      }),
    ];

    const Vbx = result.seismic?.x?.base_shear;
    const Vby = result.seismic?.y?.base_shear;

    const blocks = [];

    // Encabezado de capítulo (un caso por capítulo si hay varios).
    if (total > 1) {
      blocks.push({ text: `Caso: ${result._caseName || "Análisis"}`, style: "chapter", pageBreak: idx > 0 ? "before" : undefined });
    } else if (result._caseName) {
      blocks.push({ text: `Caso: ${result._caseName}`, style: "subtle", margin: [0, 0, 0, 6] });
    }

    blocks.push(
      { text: "1. Parámetros del análisis", style: "header" },
      {
        style: "table", table: {
          widths: ["*", "*", "*", "*"],
          body: [
            [th("Combinación"), th("Amortiguamiento ζ"), th("Nº de modos"), th("Espectro")],
            [td(meta.combination || this.seismicConfig?.combination || "CQC"),
             td(f(meta.damping_ratio ?? this.seismicConfig?.dampingRatio ?? 0.05, 3)),
             td(modes.length),
             td((meta.sa_in_g ?? this.seismicConfig?.saInG) ? "Sa en [g]" : "Sa en [m/s²]")],
            [th("Masa total X (kg)"), th("Masa total Y (kg)"), th("ΣMP-X (%)"), th("ΣMP-Y (%)")],
            [td(f(meta.total_mass_x, 1)), td(f(meta.total_mass_y, 1)),
             td(f(meta.sum_participation_x, 1)), td(f(meta.sum_participation_y, 1))],
          ],
        }, layout: "lightHorizontalLines",
      },
      { text: "2. Resultados modales", style: "header" },
      { style: "table", table: { headerRows: 1, widths: ["auto", "*", "*", "*", "*", "*", "*", "*"], body: modalBody }, layout: "lightHorizontalLines" },
      { text: "3. Cortante basal", style: "header" },
      {
        style: "table", table: {
          widths: ["*", "*"],
          body: [
            [th("Dirección X (kN)"), th("Dirección Y (kN)")],
            [td(Vbx != null ? f(Vbx / 1000, 2) : "-"), td(Vby != null ? f(Vby / 1000, 2) : "-")],
          ],
        }, layout: "lightHorizontalLines",
      },
    );

    // 3.1 Escalado dinámico/estático del cortante basal (chequeo normativo).
    const sc = result.scaling;
    if (sc && (sc.x || sc.y)) {
      const scRow = (label, d) => d ? [
        td(label),
        td(f(d.v_dynamic / 1000, 2)),
        td(f(d.v_static / 1000, 2)),
        td(`${(d.ratio * 100).toFixed(0)}%`),
        td(d.ok ? "Sí" : `No (×${d.factor.toFixed(2)})`, d.ok ? "#15803d" : "#b91c1c"),
      ] : null;
      const scBody = [
        [th("Dir"), th("V dinám. (kN)"), th("V estát. (kN)"), th("V din/est"), th(`¿Cumple k=${(sc.k * 100).toFixed(0)}%?`)],
        scRow("X", sc.x),
        scRow("Y", sc.y),
      ].filter(Boolean);
      blocks.push({ text: "3.1 Escalado dinámico / estático del cortante basal", style: "header" });
      blocks.push({ style: "table", table: { headerRows: 1, widths: ["*", "*", "*", "*", "*"], body: scBody }, layout: "lightHorizontalLines" });
    }

    // 3.2 Peso sísmico por piso y momento de volteo (#3).
    const wt = result.weights;
    const ot = result.overturning;
    if (wt?.by_story?.length) {
      const wBody = [
        [th("Nivel"), th("Peso sísmico (kN)")],
        ...[...wt.by_story].sort((a, b) => b.story - a.story).map((s) => [td(`Piso ${s.story}`), td(f(s.weight / 1000, 1))]),
        [td("TOTAL", "#1d4ed8"), td(f((wt.total || 0) / 1000, 1), "#1d4ed8")],
      ];
      blocks.push({ text: "3.2 Peso sísmico por piso y momento de volteo", style: "header" });
      blocks.push({ style: "table", table: { headerRows: 1, widths: ["*", "*"], body: wBody }, layout: "lightHorizontalLines" });
      blocks.push({ style: "table", table: { widths: ["*", "*"], body: [
        [th("Momento de volteo X (kN·m)"), th("Momento de volteo Y (kN·m)")],
        [td(ot?.x != null ? f(ot.x / 1000, 1) : "-"), td(ot?.y != null ? f(ot.y / 1000, 1) : "-")],
      ] }, layout: "lightHorizontalLines" });
    }

    if (dispBody.length > 1) {
      blocks.push({ text: "4. Desplazamientos de piso (Story Displacements)", style: "header" });
      blocks.push({ style: "table", table: { headerRows: 1, widths: ["*", "*", "*"], body: dispBody }, layout: "lightHorizontalLines" });
    }
    if (driftImg || driftBody.length > 1) {
      blocks.push({ text: "5. Derivas de piso (Story Drifts)", style: "header", pageBreak: "before" });
      if (driftImg) blocks.push({ image: driftImg, width: 340, alignment: "center", margin: [0, 0, 0, 8] });
      blocks.push({ style: "table", table: { headerRows: 1, widths: ["*", "*", "*", "*", "*"], body: driftBody }, layout: "lightHorizontalLines" });
    }
    if (shearImg || shearBody.length > 1) {
      blocks.push({ text: "6. Cortante por piso (Story Shears)", style: "header", pageBreak: "before" });
      if (shearImg) blocks.push({ image: shearImg, width: 340, alignment: "center", margin: [0, 0, 0, 8] });
      blocks.push({ style: "table", table: { headerRows: 1, widths: ["*", "*", "*"], body: shearBody }, layout: "lightHorizontalLines" });
    }

    return blocks;
  },

  // ─── Animación sísmica 3D (por caso + modo / respuesta combinada) ───────────
  async startSeismicAnimation() {
    this._initSeismic();

    if (!this.seismicResults) {
      this.showMessage?.("Ejecute primero el análisis sísmico para poder animar.", "warning");
      return;
    }

    const cases = this.seismicCaseOrder || [];
    const modes = this.seismicResults.modal?.modes || [];
    const hasShapes = modes.some((m) => m.shape && Object.keys(m.shape).length);

    // ── Diálogo: elegir caso (si hay varios) y qué animar ──────────────────
    const caseSelHtml = cases.length > 1
      ? `<div style="margin-bottom:10px">
           <label style="color:#cbd5e1; display:block; margin-bottom:3px">Caso espectral</label>
           <select id="anim-case" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
             ${cases.map((c) => `<option value="${c.id}" ${c.id === this.seismicActiveCase ? "selected" : ""}>${c.name}</option>`).join("")}
           </select>
         </div>`
      : "";

    const targetOptions = [`<option value="combined">Respuesta combinada (RSA)</option>`]
      .concat(hasShapes
        ? modes.map((m) => {
            const t = this._classifyMode(m.mass_participation_x, m.mass_participation_y);
            return `<option value="mode:${m.mode}">Modo ${m.mode} — T=${Number(m.period).toFixed(3)}s · ${t.label}</option>`;
          })
        : [])
      .join("");

    const pick = await Swal.fire({
      title: "Animar en 3D",
      width: 460,
      background: "#1a2035",
      color: "#e2e8f0",
      html: `
        <div style="text-align:left; font-family:monospace; font-size:12px">
          ${caseSelHtml}
          <label style="color:#cbd5e1; display:block; margin-bottom:3px">¿Qué animar?</label>
          <select id="anim-target" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
            ${targetOptions}
          </select>
          ${hasShapes
            ? `<div style="color:#64748b; font-size:10px; margin-top:6px">La respuesta combinada usa el espectro del caso; los modos muestran la forma modal pura.</div>`
            : `<div style="color:#94a3b8; font-size:10px; margin-top:6px">Las formas modales individuales aparecerán cuando el motor las emita.</div>`}
        </div>`,
      showCancelButton: true,
      confirmButtonText: "Animar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0f766e",
      preConfirm: () => ({
        caseId: document.getElementById("anim-case")?.value || this.seismicActiveCase || null,
        target: document.getElementById("anim-target")?.value || "combined",
      }),
    });
    if (!pick.isConfirmed) return;

    const { caseId, target } = pick.value;

    // Resolver el resultado del caso elegido y activarlo.
    const result = (caseId && this.seismicResultsByCase?.[caseId]) ? this.seismicResultsByCase[caseId] : this.seismicResults;
    if (caseId && this.seismicResultsByCase?.[caseId] && caseId !== this.seismicActiveCase) {
      this.seismicActiveCase = caseId;
      this.seismicResults = result;
      this._applySeismicResultsToModel(result, { silent: true });
    }

    const scale = this.seismicConfig?.animScale ?? 100;
    let dispField = null;
    let animPeriod = 1.0;
    let label = "";

    if (String(target).startsWith("mode:")) {
      // ── Forma modal individual ──────────────────────────────────────────
      const modeNum = Number(target.split(":")[1]);
      const mode = (result.modal?.modes || []).find((m) => m.mode === modeNum);
      if (!mode?.shape) {
        this.showMessage?.("Ese modo no tiene forma modal disponible.", "warning");
        return;
      }
      const amp = 0.004; // amplitud base (m) para que los botones de escala sirvan igual
      dispField = {};
      for (const [id, v] of Object.entries(mode.shape)) {
        dispField[id] = { dx: (v.dx || 0) * amp, dy: (v.dy || 0) * amp, dz: (v.dz || 0) * amp };
      }
      animPeriod = 1.2; // periodo visual cómodo (el T real va en la etiqueta)
      const t = this._classifyMode(mode.mass_participation_x, mode.mass_participation_y);
      label = `Modo ${mode.mode} · T=${Number(mode.period).toFixed(3)}s · ${t.label}`;
    } else {
      // ── Respuesta combinada (dirección dominante del caso) ──────────────
      const Vx = result.seismic?.x?.base_shear ?? 0;
      const Vy = result.seismic?.y?.base_shear ?? 0;
      const primaryDir = Vx >= Vy ? "x" : "y";
      dispField = result.seismic?.[primaryDir]?.displacements || null;
      const pKey = primaryDir === "x" ? "mass_participation_x" : "mass_participation_y";
      const dom = (result.modal?.modes || []).reduce((b, m) => (m[pKey] > (b?.[pKey] ?? 0) ? m : b), null);
      animPeriod = dom?.period ?? 1.0;
      const caseName = result._caseName && cases.length > 1 ? `${result._caseName} · ` : "";
      label = `${caseName}Dir ${primaryDir.toUpperCase()}${dom ? ` · Modo ${dom.mode} T=${animPeriod.toFixed(2)}s` : ""}`;
    }

    if (!dispField || !Object.keys(dispField).length) {
      this.showMessage?.("No hay campo de desplazamientos para animar.", "warning");
      return;
    }

    const ok = startBabylonSeismicAnimation(this, {
      period: animPeriod,
      scale,
      speedFactor: 1,
      displacements: dispField,
    });
    if (!ok) {
      this.showMessage?.("No se pudo iniciar la animación. Verifique que la vista 3D esté activa y el modelo tenga masas.", "error");
      return;
    }

    this.seismicAnimationActive = true;
    this.showMessage?.(`Animación: ${label}`, "success");
    this._showSeismicAnimationToast(label);
  },

  // Toast con controles de velocidad y escala mientras la animación corre.
  _showSeismicAnimationToast(label) {
    let scale = this.seismicConfig?.animScale ?? 100;
    const defaultSpeedFactor = 1;

    const speedOptions = [
      { factor: 0.25, label: "×¼" }, { factor: 0.5, label: "×½" },
      { factor: 1, label: "×1" }, { factor: 2, label: "×2" }, { factor: 3, label: "×3" },
    ];
    const scaleOptions = [
      { value: 50, label: "×50" }, { value: 100, label: "×100" },
      { value: 200, label: "×200" }, { value: 500, label: "×500" },
    ];

    const btnStyle = (active, activeColor = "#1d4ed8") =>
      `padding:3px 10px;border-radius:4px;border:none;color:#fff;cursor:pointer;` +
      `font-size:11px;transition:background .15s;background:${active ? activeColor : "#374151"}`;

    const speedBtnsHtml = speedOptions
      .map((s) => `<button data-sf="${s.factor}" style="${btnStyle(s.factor === defaultSpeedFactor)}">${s.label}</button>`)
      .join("");
    const scaleBtnsHtml = scaleOptions
      .map((s) => `<button data-scale="${s.value}" style="${btnStyle(s.value === scale, "#0f766e")}">${s.label}</button>`)
      .join("");

    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "info",
      title: "Animación sísmica activa",
      html: `
        <div style="font-size:12px;margin-bottom:6px">${label}</div>
        <div style="display:flex;align-items:center;gap:6px;justify-content:center;margin-bottom:5px">
          <span style="font-size:11px;color:#9ca3af;width:62px;text-align:right">Velocidad:</span>
          <div id="seismic-speed-btns" style="display:flex;gap:4px">${speedBtnsHtml}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;justify-content:center">
          <span style="font-size:11px;color:#9ca3af;width:62px;text-align:right">Escala:</span>
          <div id="seismic-scale-btns" style="display:flex;gap:4px">${scaleBtnsHtml}</div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: "⏹ Detener",
      confirmButtonColor: "#dc2626",
      timer: null,
      background: "#1a2035",
      color: "#e2e8f0",
      showClass: { popup: "" },
      didOpen: (popup) => {
        popup.querySelector("#seismic-speed-btns")?.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-sf]");
          if (!btn) return;
          const sf = parseFloat(btn.dataset.sf);
          setSeismicAnimationSpeed(sf);
          popup.querySelectorAll("[data-sf]").forEach((b) => {
            b.style.background = parseFloat(b.dataset.sf) === sf ? "#1d4ed8" : "#374151";
          });
        });

        popup.querySelector("#seismic-scale-btns")?.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-scale]");
          if (!btn) return;
          scale = parseFloat(btn.dataset.scale);
          setSeismicAnimationScale(scale);
          this.seismicConfig.animScale = scale; // recordar para la próxima
          popup.querySelectorAll("[data-scale]").forEach((b) => {
            b.style.background = parseFloat(b.dataset.scale) === scale ? "#0f766e" : "#374151";
          });
        });
      },
    }).then((r) => {
      if (r.isConfirmed) this.stopSeismicAnimation();
    });
  },

  stopSeismicAnimation() {
    if (!this.seismicAnimationActive) return;
    stopBabylonSeismicAnimation();
    this.seismicAnimationActive = false;
    // setTimeout(() => this.sync3D?.(), 80);
    this.showMessage?.("Animación sísmica detenida");
  },

  isSeismicAnimating() {
    return isBabylonSeismicAnimating();
  },

  // ─── Mostrar/ocultar el valor del desplazamiento sísmico en el modelo 3D ────
  toggleSeismicDisplacementLabels() {
    if (!this.seismicResults) {
      this.showMessage?.("Ejecute primero el análisis sísmico para ver los desplazamientos.", "warning");
      return;
    }
    if (isSeismicDisplacementLabelsVisible()) {
      clearSeismicDisplacementLabels();
      this.showMessage?.("Etiquetas de desplazamiento ocultadas.");
      return;
    }
    const n = showSeismicDisplacementLabels(this);
    if (n > 0) {
      this.showMessage?.(`Mostrando desplazamiento (mm) en ${n} nodos.`, "success");
    } else {
      this.showMessage?.("No hay desplazamientos para mostrar. Vuelva a ejecutar el análisis.", "warning");
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  //  Losas → masa sísmica de piso (D — losas en el análisis sísmico)
  // ════════════════════════════════════════════════════════════════════════

  // Área en planta de un polígono (fórmula del zapatero / shoelace) sobre x,y.
  _planArea(points = []) {
    if (!Array.isArray(points) || points.length < 3) return 0;
    let s = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      s += (Number(a.x) || 0) * (Number(b.y) || 0) - (Number(b.x) || 0) * (Number(a.y) || 0);
    }
    return Math.abs(s) / 2;
  },

  // Devuelve el nodo canónico (de this.nodes) referenciado por un frame, tanto
  // si node1/node2 es el objeto nodo como si es solo un id.
  _resolveMassNode(ref) {
    if (ref == null) return null;
    const id = typeof ref === "object" ? ref.id : ref;
    const found = (this.nodes || []).find((n) => String(n.id) === String(id));
    if (found) return found;
    return typeof ref === "object" ? ref : null;
  },

  // Coordenadas {x,y,z} de un nodo (soporta position:{} o x/y/z planos).
  _massNodeCoord(n) {
    const p = n && n.position ? n.position : n;
    return { x: Number(p?.x) || 0, y: Number(p?.y) || 0, z: Number(p?.z) || 0 };
  },

  // Densidad (kg/m³) del material por nombre. Los materiales por defecto
  // (CONC/STEEL) están en unidades kip-in (valores ~1e-7) que NO son kg/m³;
  // en ese caso se usa el fallback. massPerUnitVolume puede venir como string.
  _materialDensityKg(name, fallback) {
    const mats = this.materialProperties?.materials || [];
    const mat = name ? mats.find((m) => String(m.name) === String(name)) : null;
    const rho = Number(mat?.massPerUnitVolume);
    if (!Number.isFinite(rho) || rho < 50) return Number(fallback) || 2400;
    return rho;
  },

  // Densidad de respaldo (kg/m³) por tipo de sección: acero para perfiles
  // metálicos (W, canal, ángulo, tubo), concreto para el resto.
  _fallbackDensityForSection(frame, concreteDensity) {
    const t = String(frame?.frameSection?.type || frame?.frameSection?.sectionType || frame?.section?.type || "").toLowerCase();
    if (t === "wf" || t === "channel" || t === "angle" || t === "tube") return 7850;
    return Number(concreteDensity) || 2400;
  },

  // ¿El nodo está restringido lateralmente en X e Y (apoyo de base)? Su masa no
  // participa en la respuesta sísmica horizontal, así que no se le asigna.
  _isLaterallyRestrained(n) {
    const r = n?.restraints || n?.constraints;
    if (r && typeof r === "object") return !!(r.ux && r.uy);
    const s = n?.soporte;
    return s === "soporteUno" || s === "soporteDos"; // empotrado o articulado
  },

  // Genera masa sísmica a partir de las losas dibujadas y la reparte a los
  // nodos de cada piso (mass_x, mass_y). Es lo que hace que la losa "pese" en
  // el análisis sísmico (su masa es la masa sísmica dominante del piso).
  async generateSlabSeismicMass() {
    const slabs = (this.areas || []).filter(
      (a) => (a.areaType || "slab") === "slab" && Array.isArray(a.points) && a.points.length >= 3,
    );
    const frames = (this.shapes || []).filter((f) => f?.node1 && f?.node2);
    if (!(this.nodes || []).length) {
      this.showMessage?.("El modelo no tiene nodos.", "warning");
      return;
    }
    if (!slabs.length && !frames.length) {
      this.showMessage?.("No hay losas ni elementos. Dibuja la estructura antes de generar masa.", "warning");
      return;
    }

    const cfg = await Swal.fire({
      title: "Masa sísmica automática por piso",
      width: 520,
      background: "#1a2035",
      color: "#e2e8f0",
      html: `
        <div style="text-align:left; font-family:monospace; font-size:12px">
          <div style="color:#94a3b8; margin-bottom:10px">
            ${slabs.length} losa(s) y ${frames.length} elemento(s) detectados.
            Masa = peso propio (vigas/columnas + losas) + cargas sobreimpuestas, repartida a los nodos de cada piso.
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
            <div>
              <label style="color:#cbd5e1; display:block; margin-bottom:3px">Espesor losa (m)</label>
              <input id="slab-th" type="number" step="0.01" min="0" value="0.20" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
            </div>
            <div>
              <label style="color:#cbd5e1; display:block; margin-bottom:3px">Densidad concreto (kg/m³)</label>
              <input id="slab-rho" type="number" step="50" min="1" value="2400" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
            </div>
            <div>
              <label style="color:#cbd5e1; display:block; margin-bottom:3px">CM adicional / acabados (kg/m²)</label>
              <input id="slab-sdl" type="number" step="10" min="0" value="100" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
            </div>
            <div>
              <label style="color:#cbd5e1; display:block; margin-bottom:3px">Sobrecarga CV (kg/m²)</label>
              <input id="slab-cv" type="number" step="10" min="0" value="200" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
            </div>
            <div>
              <label style="color:#cbd5e1; display:block; margin-bottom:3px">Factor masa de CV</label>
              <input id="slab-cvf" type="number" step="0.05" min="0" max="1" value="0.25" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
            </div>
          </div>
          <label style="display:flex; align-items:center; gap:8px; margin-top:12px; color:#cbd5e1">
            <input id="slab-frames" type="checkbox" checked> Incluir peso propio de vigas y columnas
          </label>
          <label style="display:flex; align-items:center; gap:8px; margin-top:8px; color:#cbd5e1">
            <input id="slab-replace" type="checkbox" checked> Reemplazar masas nodales existentes
          </label>
          <div style="color:#64748b; font-size:10px; margin-top:8px">
            Peso propio de vigas/columnas = A×L×densidad del material de su sección. El factor de CV sigue la E.030 (≈0.25 para vivienda/oficina, categoría C).
          </div>
        </div>`,
      showCancelButton: true,
      confirmButtonText: "Generar masa",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0f766e",
      preConfirm: () => ({
        thickness: Math.max(0, parseFloat(document.getElementById("slab-th")?.value) || 0),
        density: Math.max(0, parseFloat(document.getElementById("slab-rho")?.value) || 0),
        sdl: Math.max(0, parseFloat(document.getElementById("slab-sdl")?.value) || 0),
        cv: Math.max(0, parseFloat(document.getElementById("slab-cv")?.value) || 0),
        cvFactor: Math.max(0, parseFloat(document.getElementById("slab-cvf")?.value) || 0),
        includeFrames: document.getElementById("slab-frames")?.checked ?? true,
        replace: document.getElementById("slab-replace")?.checked ?? true,
      }),
    });
    if (!cfg.isConfirmed) return;
    const { thickness, density, sdl, cv, cvFactor, includeFrames, replace } = cfg.value;
    if (density <= 0) {
      this.showMessage?.("La densidad del concreto debe ser mayor que cero.", "warning");
      return;
    }

    // Si se reemplaza, limpiar masas previas de todos los nodos.
    if (replace) {
      (this.nodes || []).forEach((n) => { n.mass_x = 0; n.mass_y = 0; });
    }

    const round2 = (v) => Math.round(v * 100) / 100;

    // ── 1) Peso propio de vigas y columnas: A × L × densidad(material) ──────
    //    Se reparte la mitad de la masa de cada elemento a cada nodo extremo,
    //    así las columnas dejan su masa entre el piso inferior y el superior.
    let frameMass = 0;
    // Suma media masa del elemento a un nodo, salvo que esté restringido
    // lateralmente (apoyo de base) → su masa va a la cimentación y no participa.
    const addHalfMass = (node, half) => {
      if (this._isLaterallyRestrained(node)) return 0;
      node.mass_x = (Number(node.mass_x) || 0) + half;
      node.mass_y = (Number(node.mass_y) || 0) + half;
      return half;
    };
    if (includeFrames) {
      for (const f of frames) {
        const a = this._resolveMassNode(f.node1);
        const b = this._resolveMassNode(f.node2);
        if (!a || !b) continue;
        const pa = this._massNodeCoord(a);
        const pb = this._massNodeCoord(b);
        const L = Math.hypot(pa.x - pb.x, pa.y - pb.y, pa.z - pb.z);
        const A = Number(f.A ?? f.frameSection?.A ?? f.frameSection?.area ?? f._A) || 0;
        if (!(L > 0) || !(A > 0)) continue;
        const matName = f.frameSection?.material || f.material || f.materialName;
        const rho = this._materialDensityKg(matName, this._fallbackDensityForSection(f, density));
        const m = A * L * rho; // kg
        const half = m / 2;
        frameMass += addHalfMass(a, half) + addHalfMass(b, half);
      }
    }

    // ── 2) Masa de losas + cargas sobreimpuestas, repartida por piso ────────
    //    Presión de masa por m²: peso propio de losa + CM adicional + factor·CV.
    const areaPressure = thickness * density + sdl + cvFactor * cv; // kg/m²
    let slabMass = 0;
    const noFloorWarnings = [];
    for (const slab of slabs) {
      const planArea = this._planArea(slab.points);
      const mass = planArea * areaPressure; // kg
      if (mass <= 0) continue;

      const z = slab.z ?? (slab.points.reduce((s, p) => s + (Number(p.z) || 0), 0) / slab.points.length);
      const floorNodes = (this.nodes || []).filter(
        (n) => Math.abs((Number(n.position?.z ?? n.z) || 0) - z) < 0.05 && !this._isLaterallyRestrained(n),
      );
      if (!floorNodes.length) {
        noFloorWarnings.push(`Losa @z=${round2(z)}m (${round2(planArea)} m²) sin nodos en ese piso`);
        continue;
      }
      const per = mass / floorNodes.length;
      floorNodes.forEach((n) => {
        n.mass_x = (Number(n.mass_x) || 0) + per;
        n.mass_y = (Number(n.mass_y) || 0) + per;
      });
      slabMass += mass;
    }

    // ── 3) Resumen de masa final por piso (a partir de la masa nodal) ───────
    const floorMap = new Map();
    (this.nodes || []).forEach((n) => {
      const mx = Number(n.mass_x) || 0;
      if (mx <= 0) return;
      const zKey = round2(Number(n.position?.z ?? n.z) || 0);
      const e = floorMap.get(zKey) || { mass: 0, count: 0 };
      e.mass += mx;
      e.count += 1;
      floorMap.set(zKey, e);
    });
    const floors = [...floorMap.entries()].sort((a, b) => a[0] - b[0]);
    const grandTotal = frameMass + slabMass;

    this.markAnalysisResultsOutdated?.("Se generó masa sísmica automática por piso.");
    this.redraw?.();

    const floorRows = floors.map(([z, e]) =>
      `<tr><td style="padding:2px 8px">z=${z} m</td><td style="padding:2px 8px; text-align:right">${e.count}</td><td style="padding:2px 8px; text-align:right">${round2(e.mass)}</td><td style="padding:2px 8px; text-align:right">${round2(e.mass / 1000)}</td></tr>`,
    ).join("");

    await Swal.fire({
      icon: "success",
      title: "Masa sísmica automática generada",
      width: 600,
      background: "#1a2035",
      color: "#e2e8f0",
      html: `
        <div style="text-align:left; font-family:monospace; font-size:12px">
          <div style="color:#86efac; margin-bottom:8px">
            Masa total: <b>${round2(grandTotal)} kg</b> (${round2(grandTotal / 1000)} t)
            &nbsp;·&nbsp; vigas/columnas: ${round2(frameMass)} kg &nbsp;·&nbsp; losas+cargas: ${round2(slabMass)} kg
          </div>
          <table style="width:100%; border-collapse:collapse; color:#cbd5e1; margin-top:6px">
            <thead><tr style="color:#94a3b8; border-bottom:1px solid #334155">
              <th style="text-align:left; padding:2px 8px">Piso</th>
              <th style="text-align:right; padding:2px 8px">Nodos</th>
              <th style="text-align:right; padding:2px 8px">Masa (kg)</th>
              <th style="text-align:right; padding:2px 8px">Masa (t)</th>
            </tr></thead>
            <tbody>${floorRows || `<tr><td colspan="4" style="padding:6px 8px; color:#fbbf24">Sin masa asignada</td></tr>`}</tbody>
          </table>
          ${noFloorWarnings.length ? `<div style="color:#fbbf24; font-size:11px; margin-top:8px">⚠ ${noFloorWarnings.join("; ")}</div>` : ""}
          <div style="color:#94a3b8; font-size:11px; margin-top:10px">
            Masas asignadas a los nodos (mass_x = mass_y). Corre el <b>Análisis Sísmico Espectral</b> para ver el efecto.
          </div>
        </div>`,
      confirmButtonColor: "#1d4ed8",
    });
  },

  // ─── Utilidades ────────────────────────────────────────────────────────────
  _getTotalModelMass() {
    return (this.nodes || []).reduce((sum, n) => {
      return sum + Number(n.mass_x ?? n.mass?.x ?? n.mass ?? 0);
    }, 0);
  },
};

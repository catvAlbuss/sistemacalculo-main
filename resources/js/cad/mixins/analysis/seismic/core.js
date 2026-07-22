// mixins/analysis/seismic/core.js — parte "core" del análisis sísmico
// (seismic.js se partió en sub-mixins por responsabilidad; barril en seismic.js).
import Swal from "sweetalert2";
import {
  startBabylonSeismicAnimation,
  stopBabylonSeismicAnimation,
  isBabylonSeismicAnimating,
  setSeismicAnimationSpeed,
  setSeismicAnimationScale,
  showBabylonSeismicDeformedShape,
  resetBabylonSeismicPositions,
  showSeismicDisplacementLabels,
  clearSeismicDisplacementLabels,
  isSeismicDisplacementLabelsVisible,
  showSeismicDriftLabels,
  clearSeismicDriftLabels,
  isSeismicDriftLabelsVisible,
} from "../../../3d/viewer3d.js";
import {
  createMockSeismicResult,
  validateSeismicContract,
} from "../../../engine/seismicContract.js";
import { BACKEND_URL, USE_MOCK_SEISMIC, DRIFT_LIMITS } from "./_constants.js";

export const seismicCoreMixin = {

  // ─── Estado sísmico ────────────────────────────────────────────────────────
  _initSeismic() {
    if (this.seismicConfig) return;
    this.seismicConfig = {
      spectrumX: [],     // [{T, Sa}]
      spectrumY: [],     // [{T, Sa}] — opcional
      numModes: 15,      // ≥3×pisos: captura traslación X/Y + torsión por nivel
      combination: "CQC",
      dampingRatio: 0.05,
      saInG: true,
      g: 9.81,
      direction: "both", // "x", "y", "both"
      animScale: 100,    // factor de escala visual para animación sísmica
      irregular: false,  // estructura irregular → k=0.90 (regular → k=0.80) para el escalado normativo
      driftSystem: "concreto",      // sistema estructural (define el límite de deriva)
      driftLimit: DRIFT_LIMITS.concreto, // deriva admisible Δ/h (E.030)
      useRigidDiaphragms: true, // agrupar nodos por piso como diafragma rígido tipo ETABS
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

          <!-- Nota: qué casos se correrán (el gráfico muestra sus espectros) -->
          <div id="seis-runcases-note" style="color:#94a3b8; font-size:11px; margin:6px 0 2px"></div>

          <!-- Preview del espectro (Sa vs T) — casos a correr, o espectro X/Y de respaldo -->
          <div id="spectrum-preview" style="margin-top:4px; display:flex; justify-content:center"></div>

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
                <option value="x"    ${cfg.direction === 'x' ? 'selected' : ''}>Solo X</option>
                <option value="y"    ${cfg.direction === 'y' ? 'selected' : ''}>Solo Y</option>
              </select>
            </div>
          </div>

          <div style="margin-top:8px; display:flex; gap:16px; align-items:center; flex-wrap:wrap">
            <label style="color:#ccc; font-size:12px; display:flex; align-items:center; gap:6px">
              <input id="seis-ing" type="checkbox" ${cfg.saInG ? 'checked' : ''}> Sa en [g]
            </label>

            <label style="color:#ccc; font-size:12px">g =
              <input id="seis-g" type="number" min="1" max="20" step="0.01" value="${cfg.g}"
                style="width:70px; background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px 5px">
              m/s²
            </label>

            <label style="color:#ccc; font-size:12px; display:flex; align-items:center; gap:6px">
              <input id="seis-rigid-diaphragms" type="checkbox" ${cfg.useRigidDiaphragms ? 'checked' : ''}>
              Diafragma rígido por piso
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
              <option value="concreto"    ${cfg.driftSystem === 'concreto' ? 'selected' : ''}>Concreto armado — 0.007</option>
              <option value="acero"       ${cfg.driftSystem === 'acero' ? 'selected' : ''}>Acero — 0.010</option>
              <option value="albanileria" ${cfg.driftSystem === 'albanileria' ? 'selected' : ''}>Albañilería — 0.005</option>
              <option value="madera"      ${cfg.driftSystem === 'madera' ? 'selected' : ''}>Madera — 0.010</option>
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
        if (massInfo) {
          const est = this._estimateSeismicMassKg();
          if (est.total > 0 || est.hasSelfWeight) {
            const parts = [];
            if (est.stored > 0) parts.push(`nodal ${(est.stored / 1000).toFixed(1)} t`);
            if (est.fromLoads > 0) parts.push(`cargas de área ${(est.fromLoads / 1000).toFixed(1)} t`);
            if (est.hasSelfWeight) parts.push(`+ peso propio (lo agrega el motor)`);
            massInfo.textContent = `Masa sísmica estimada: ${(est.total / 1000).toFixed(1)} t  (${parts.join(" + ")})`;
            massInfo.style.color = "#86efac";
          } else {
            massInfo.textContent =
              "Advertencia: no se generará masa. Asigna cargas de área a las losas (Assign → Area/Shell Loads) y activa la Fuente de Masa, o activa 'Masa Propia de Elementos'.";
            massInfo.style.color = "#fbbf24";
          }
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
          numModes: parseInt(document.getElementById("seis-modes")?.value) || 15,
          dampingRatio: parseFloat(document.getElementById("seis-damp")?.value) || 0.05,
          combination: document.getElementById("seis-combo")?.value || "CQC",
          direction: document.getElementById("seis-dir")?.value || "both",
          saInG: document.getElementById("seis-ing")?.checked ?? true,
          g: parseFloat(document.getElementById("seis-g")?.value) || 9.81,
          irregular: document.getElementById("seis-irregular")?.checked ?? false,
          driftSystem: document.getElementById("seis-drift-system")?.value || "concreto",
          useRigidDiaphragms: document.getElementById("seis-rigid-diaphragms")?.checked ?? true,
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
    if (!this._willHaveSeismicMass()) {
      const cont = await Swal.fire({
        icon: "warning",
        title: "Sin masas definidas",
        html: "No se generará masa sísmica.<br>Asigna cargas de área a las losas (Assign → Area/Shell Loads) y define la Fuente de Masa, o activa 'Masa Propia de Elementos'.<br><br>¿Continuar de todas formas?",
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
            saInG: rc.saInG ?? cfg.saInG,
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
            // Excentricidad accidental E.030 del caso (input del diálogo del caso RS).
            eccRatio: rc.eccRatio ?? 0,
            // Casos ETABS: espectro ya pre-escalado a m/s² (saInG=false) → el motor
            // no re-multiplica por g. Fallback: función en g → saInG=cfg.saInG.
            saInG: rc.saInG ?? cfg.saInG,
          };
          const payload = this._buildSeismicPayload(caseCfg, nodes, frames);
          const resp = await fetch(`${BACKEND_URL}/seismic/analyze`, {
            method: "POST",
            // cache:"no-store" → nunca servir una respuesta cacheada. Sin esto el
            // navegador devolvía un análisis viejo (mismo URL/headers) y la tabla
            // de derivas quedaba "congelada" aunque el backend recalculara bien.
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
            },
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

      // El análisis sísmico recién corrió → sus resultados (incl. la tabla de
      // Centers of Mass que reubica el marcador D1 del diafragma al CM real)
      // están FRESCOS. getDiaphragmCMForDraw se auto-bloquea si el estado quedó
      // en "outdated" (p.ej. por un análisis estático previo + cambio de modelo);
      // sin resetearlo acá, el CM correcto se calcula pero el marcador se quedaba
      // en el centroide geométrico. Un cambio de modelo posterior lo vuelve a
      // marcar "outdated" (markAnalysisResultsOutdated), ocultándolo de nuevo.
      if (this.analysisOptions) {
        this.analysisOptions.analysisStatus = "completed";
      }

      this._applySeismicResultsToModel(this.seismicResults);
      await this.showSeismicResults(this.seismicResults);

    } catch (err) {
      Swal.close();
      const isOffline = err.message?.includes("Failed to fetch") || err.message?.includes("ERR_CONNECTION_REFUSED");
      await Swal.fire({
        icon: "error",
        title: isOffline ? "Backend no disponible" : "Error de conexión",
        html: isOffline
          ? `No se pudo conectar con el motor de cálculo.<br><br>
              En local (Windows): abre <b>EJECUTAR_BACKEND_WINDOWS.bat</b> y vuelve a intentar.<br>
              En el servidor: contacta al administrador si el problema persiste.`
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
    const normalizeScaleFactorForRunCase = (value) => {
      const sf = Number(value);

      if (!Number.isFinite(sf) || sf <= 0) return 1;

      // Estos casos ETABS quedan saInG:false: el espectro se convierte a m/s² AQUÍ
      // con este factor (9.81 = 1.0·g, 6.54 = 0.667·g, 2.943 = 0.3·g). Por tanto el
      // factor es LEGÍTIMO y NO se debe capear. El cap previo (sf>5 → 1) miraba el
      // saInG GLOBAL y nukeaba la dirección PRIMARIA (9.81 → 1), dejando el 30%
      // (2.943) dominando → INVERTÍA los casos SDX/SDY. Solo se avisa si es absurdo.
      if (sf > 50) {
        console.warn("⚠️ Scale Factor inusualmente alto en _getSeismicRunCases:", sf);
      }

      return sf;
    };

    const scaled = (fn, sf) => {
      const safeScale = normalizeScaleFactorForRunCase(sf);

      return (fn?.points || []).map((p) => ({
        T: Number(p.T),
        Sa: Number(p.Sa) * safeScale,
      }));
    };

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
        // Excentricidad accidental E.030 del caso (input "Ecc. Ratio (All Diaph.)"
        // del diálogo del caso RS, como ETABS ECCENRATIOTYPICAL). 0 = desactivada.
        eccRatio: Number(c.eccRatio) || 0,
        // El scaleFactor del caso ETABS YA incluye g (p.ej. 9.81 = 1.0·g, igual
        // que ETABS usa 9810 = 1.0·g en mm). Por eso aquí el espectro queda en
        // m/s², y el motor NO debe volver a multiplicar por g → saInG:false.
        // (Sin esto había doble escala: ×9.81 aquí y ×9.81 en run_rsa.)
        saInG: false,
      });
    }

    if (out.length) return out;

    // Fallback: un solo caso con el espectro del diálogo de análisis.
    // Aquí el espectro es la función CRUDA (sin pre-escalar): respeta el
    // checkbox "Sa en [g]" del diálogo → saInG = cfg.saInG (el motor aplica g).
    return [{
      id: "SISMO",
      name: "Análisis sísmico",
      direction: "both",
      spectrumX: cfg.spectrumX || [],
      spectrumY: (cfg.spectrumY && cfg.spectrumY.length) ? cfg.spectrumY : null,
      combination: cfg.combination || "CQC",
      dampingRatio: cfg.dampingRatio ?? 0.05,
      eccRatio: 0, // el diálogo simple no define excentricidad (es por-caso RS)
      saInG: cfg.saInG,
    }];
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
      n.seismicDeflection = Math.sqrt(env.dx ** 2 + env.dy ** 2 + env.dz ** 2);
    });

    this.redraw?.();
    if (!silent) {
      this.showMessage?.("Análisis sísmico completado. Resultados guardados en el modelo.", "success");
    }
  },
};

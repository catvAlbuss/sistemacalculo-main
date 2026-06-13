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
} from "../3d/viewer3d.js";

const BACKEND_URL = "http://localhost:5001";

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

          <div style="display:flex; gap:8px; align-items:center">
            <label style="width:90px; color:#ccc">Dirección Y:</label>
            <span id="spy-label" style="flex:1; color:${cfg.spectrumY.length ? '#7fc77f' : '#aaa'}">
              ${cfg.spectrumY.length ? `${cfg.spectrumY.length} puntos cargados` : 'Usar mismo que X'}
            </span>
            <button id="btn-import-y" style="background:#2d5a8e; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px">
              Importar...
            </button>
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

        // Botones de importar espectro
        document.getElementById("btn-import-x")?.addEventListener("click", async (e) => {
          e.preventDefault();
          const data = await this._pickAndParseSpectrum("X");
          if (data) {
            this.seismicConfig.spectrumX = data;
            const el = document.getElementById("spx-label");
            if (el) { el.textContent = `${data.length} puntos cargados`; el.style.color = "#7fc77f"; }
          }
        });

        document.getElementById("btn-import-y")?.addEventListener("click", async (e) => {
          e.preventDefault();
          const data = await this._pickAndParseSpectrum("Y");
          if (data) {
            this.seismicConfig.spectrumY = data;
            const el = document.getElementById("spy-label");
            if (el) { el.textContent = `${data.length} puntos cargados`; el.style.color = "#7fc77f"; }
          }
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
        };
      },
    });

    if (!result.isConfirmed) return;

    // Guardar config
    Object.assign(this.seismicConfig, result.value);

    if (!this.seismicConfig.spectrumX.length) {
      await Swal.fire({
        icon: "warning",
        title: "Falta espectro X",
        text: "Importa al menos el espectro de dirección X antes de ejecutar.",
        background: "#1a2035", color: "#e2e8f0",
      });
      return;
    }

    await this.runSeismicAnalysis();
  },

  // ─── Importar espectro desde archivo ──────────────────────────────────────
  async _pickAndParseSpectrum(label) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.csv,.xls,.xlsx";

      input.addEventListener("change", async () => {
        const file = input.files[0];
        if (!file) return resolve(null);

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
            resolve(json.spectrum);  // [{T, Sa}]
          } else {
            this.showMessage?.(`Error al leer el espectro: ${json.error}`, "error");
            resolve(null);
          }
        } catch (err) {
          const isOffline = err.message?.includes("Failed to fetch") || err.message?.includes("ERR_CONNECTION_REFUSED");
          if (isOffline) {
            Swal.fire({
              icon: "error",
              title: "Backend no disponible",
              html: `El servidor Python no está corriendo.<br><br>
                <code style="background:#0f172a;padding:6px 10px;border-radius:4px;font-size:12px;display:block;text-align:left">
                  cd python-backend<br>
                  venv\\Scripts\\python app.py
                </code>`,
              background: "#1a2035", color: "#e2e8f0",
            });
          } else {
            this.showMessage?.(`Error de conexión: ${err.message}`, "error");
          }
          resolve(null);
        } finally {
          Swal.hideLoading?.();
        }
      });

      input.click();
    });
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
      const payload = this._buildSeismicPayload(cfg, nodes, frames);
      const resp = await fetch(`${BACKEND_URL}/api/seismic/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await resp.json();

      Swal.close();

      if (!result.success) {
        await Swal.fire({
          icon: "error",
          title: "Error en análisis sísmico",
          text: result.error || "Error desconocido",
          background: "#1a2035", color: "#e2e8f0",
        });
        return;
      }

      this.seismicResults = result;
      this._applySeismicResultsToModel(result);
      await this.showSeismicResults(result);

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
      // Usar || (no ??) para que valores 0 también usen el default SI
      const A  = Number(sec.A  || sec.area  || f.A  || 0.01);   // m²
      const E  = Number(sec.E  || sec.elasticModulus || f.E  || 200e9); // Pa
      const G  = Number(sec.G  || sec.shearModulus   || f.G  || 77e9);  // Pa
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
  _applySeismicResultsToModel(result) {
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
    this.showMessage?.("Análisis sísmico completado. Resultados guardados en el modelo.", "success");
  },

  // ─── Mostrar tabla de resultados modales ──────────────────────────────────
  async showSeismicResults(result) {
    const modes = result.modal?.modes || [];
    const seisX = result.seismic?.x;
    const seisY = result.seismic?.y;

    const fmt = (v, d = 4) => (v != null ? Number(v).toFixed(d) : "-");

    // Tabla de modos
    const rows = modes.map(m => `
      <tr style="border-bottom:1px solid #334155">
        <td style="padding:5px 8px; text-align:center">${m.mode}</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.period, 4)}</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.frequency, 3)}</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.mass_participation_x, 1)}%</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.cumulative_participation_x, 1)}%</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.mass_participation_y, 1)}%</td>
        <td style="padding:5px 8px; text-align:right">${fmt(m.cumulative_participation_y, 1)}%</td>
      </tr>`).join("");

    // Cortantes basales
    const Vx = seisX?.base_shear;
    const Vy = seisY?.base_shear;
    const shearHtml = [
      Vx != null ? `Cortante basal X: <strong>${fmt(Vx, 1)} N</strong>` : null,
      Vy != null ? `Cortante basal Y: <strong>${fmt(Vy, 1)} N</strong>` : null,
    ].filter(Boolean).join("&nbsp;&nbsp;|&nbsp;&nbsp;");

    const html = `
      <div style="font-family:monospace; font-size:12px; text-align:left">

        <!-- Resumen de cortante -->
        <div style="background:#1e293b; padding:8px 12px; border-radius:6px; margin-bottom:12px; color:#7dd3fc">
          ${shearHtml || "No se calculó cortante basal"}
        </div>

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
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div style="color:#94a3b8; font-size:11px; margin-top:10px">
          Combinación: ${result.modal?.modes?.length ? this.seismicConfig?.combination || "CQC" : "-"} &nbsp;|&nbsp;
          ζ = ${this.seismicConfig?.dampingRatio ?? 0.05} &nbsp;|&nbsp;
          ${this.seismicConfig?.saInG ? "Sa en [g]" : "Sa en [m/s²]"}
        </div>
      </div>
    `;

    const swalResult = await Swal.fire({
      title: "Resultados: Análisis Sísmico Espectral",
      html,
      width: 700,
      background: "#1a2035",
      color: "#e2e8f0",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#1d4ed8",
      showDenyButton: true,
      denyButtonText: "Animar en 3D",
      denyButtonColor: "#0f766e",
    });

    if (swalResult.isDenied) {
      this.startSeismicAnimation();
    }
  },

  // ─── Animación sísmica 3D ──────────────────────────────────────────────────
  startSeismicAnimation() {
    this._initSeismic();

    if (!this.seismicResults) {
      this.showMessage?.("Ejecute primero el análisis sísmico para poder animar.", "warning");
      return;
    }

    const hasDisplacements = (this.nodes || []).some((n) => n.seismicDisplacement);
    if (!hasDisplacements) {
      this.showMessage?.("No hay desplazamientos sísmicos en el modelo. Vuelva a ejecutar el análisis.", "warning");
      return;
    }

    // Determinar modo dominante y periodo
    const modes = this.seismicResults.modal?.modes || [];
    const Vx = this.seismicResults.seismic?.x?.base_shear ?? 0;
    const Vy = this.seismicResults.seismic?.y?.base_shear ?? 0;
    const primaryDir = Vx >= Vy ? "x" : "y";
    const participationKey = primaryDir === "x" ? "mass_participation_x" : "mass_participation_y";

    const dominantMode = modes.reduce(
      (best, m) => (m[participationKey] > (best?.[participationKey] ?? 0) ? m : best),
      null,
    );

    const period = dominantMode?.period ?? 1.0;
    const scale = this.seismicConfig?.animScale ?? 100;
    const defaultSpeedFactor = 1;

    const ok = startBabylonSeismicAnimation(this, { period, scale, speedFactor: defaultSpeedFactor });
    if (!ok) {
      this.showMessage?.("No se pudo iniciar la animación. Verifique que la vista 3D esté activa y el modelo tenga masas.", "error");
      return;
    }

    this.seismicAnimationActive = true;

    const modeLabel = dominantMode ? `Modo ${dominantMode.mode} | T=${period.toFixed(2)}s` : "";
    const dirLabel = primaryDir.toUpperCase();
    this.showMessage?.(`Animación sísmica iniciada — Dir ${dirLabel} | ${modeLabel}`, "success");

    const speedOptions = [
      { factor: 0.25, label: "×¼" },
      { factor: 0.5,  label: "×½" },
      { factor: 1,    label: "×1" },
      { factor: 2,    label: "×2" },
      { factor: 3,    label: "×3" },
    ];

    const btnStyle = (active) =>
      `padding:3px 10px;border-radius:4px;border:none;color:#fff;cursor:pointer;` +
      `font-size:11px;transition:background .15s;background:${active ? "#1d4ed8" : "#374151"}`;

    const speedBtnsHtml = speedOptions
      .map((s) => `<button data-sf="${s.factor}" style="${btnStyle(s.factor === defaultSpeedFactor)}">${s.label}</button>`)
      .join("");

    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "info",
      title: "Animación sísmica activa",
      html: `
        <div style="font-size:12px;margin-bottom:6px">Dir. ${dirLabel} · ${modeLabel} · Escala ×${scale}</div>
        <div style="display:flex;align-items:center;gap:6px;justify-content:center">
          <span style="font-size:11px;color:#9ca3af">Velocidad:</span>
          <div id="seismic-speed-btns" style="display:flex;gap:4px">${speedBtnsHtml}</div>
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
      },
    }).then((r) => {
      if (r.isConfirmed) this.stopSeismicAnimation();
    });
  },

  stopSeismicAnimation() {
    if (!this.seismicAnimationActive) return;
    stopBabylonSeismicAnimation();
    this.seismicAnimationActive = false;
    setTimeout(() => this.sync3D?.(), 80);
    this.showMessage?.("Animación sísmica detenida");
  },

  isSeismicAnimating() {
    return isBabylonSeismicAnimating();
  },

  // ─── Utilidades ────────────────────────────────────────────────────────────
  _getTotalModelMass() {
    return (this.nodes || []).reduce((sum, n) => {
      return sum + Number(n.mass_x ?? n.mass?.x ?? n.mass ?? 0);
    }, 0);
  },
};

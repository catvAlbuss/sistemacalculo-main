// mixins/analysis/seismic/spectrum.js — parte "spectrum" del análisis sísmico
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

export const seismicSpectrumMixin = {

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
          const resp = await fetch(`${BACKEND_URL}/seismic/parse-spectrum`, {
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

    // Guardo escalas para el hover (se usan en _attachSpectrumHover).
    this._spectrumScale = { ML, MT, plotW, plotH, maxT, maxSa, W, H, series };

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="background:#0f172a;border-radius:6px">
        <rect x="${ML}" y="${MT}" width="${plotW}" height="${plotH}" fill="none" stroke="#334155"/>
        ${xticks}${yticks}${lines}${legend}
        <g id="spec-cursor"></g>
        <text x="${ML + plotW / 2}" y="${H - 4}" text-anchor="middle" fill="#cbd5e1" font-size="10">Periodo T (s)</text>
        <text x="12" y="${MT + plotH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="10" transform="rotate(-90 12 ${MT + plotH / 2})">Sa</text>
      </svg>`;
  },

  // Hover del cursor sobre el espectro: muestra T y Sa en vivo (como ETABS).
  _attachSpectrumHover(box) {
    const svg = box.querySelector("svg");
    const sc = this._spectrumScale;
    if (!svg || !sc) return;
    const cursor = svg.querySelector("#spec-cursor");
    const pts = [...(sc.series[0]?.points || [])].sort((a, b) => a.T - b.T);
    if (!pts.length) return;
    const sx = (t) => sc.ML + (t / sc.maxT) * sc.plotW;
    const sy = (sa) => sc.MT + sc.plotH - (sa / sc.maxSa) * sc.plotH;
    const saAt = (T) => {
      if (T <= pts[0].T) return pts[0].Sa;
      for (let i = 1; i < pts.length; i++) {
        if (T <= pts[i].T) {
          const a = pts[i - 1], b = pts[i];
          return a.Sa + (T - a.T) / ((b.T - a.T) || 1) * (b.Sa - a.Sa);
        }
      }
      return pts[pts.length - 1].Sa;
    };
    svg.style.cursor = "crosshair";
    svg.addEventListener("mousemove", (e) => {
      const rect = svg.getBoundingClientRect();
      const px = (e.clientX - rect.left) * (sc.W / (rect.width || sc.W));
      let T = (px - sc.ML) / sc.plotW * sc.maxT;
      T = Math.max(0, Math.min(sc.maxT, T));
      if (px < sc.ML || px > sc.ML + sc.plotW) { cursor.innerHTML = ""; return; }
      const Sa = saAt(T), cx = sx(T), cy = sy(Sa);
      const tx = Math.min(cx + 6, sc.ML + sc.plotW - 90);
      cursor.innerHTML =
        `<line x1="${cx}" y1="${sc.MT}" x2="${cx}" y2="${sc.MT + sc.plotH}" stroke="#64748b" stroke-dasharray="3"/>` +
        `<circle cx="${cx}" cy="${cy}" r="3" fill="#ffffff"/>` +
        `<rect x="${tx}" y="${cy - 22}" width="88" height="16" fill="#1e293b" stroke="#475569" rx="3"/>` +
        `<text x="${tx + 4}" y="${cy - 10}" fill="#e2e8f0" font-size="9">T=${T.toFixed(2)}  Sa=${Sa.toFixed(4)}</text>`;
    });
    svg.addEventListener("mouseleave", () => { if (cursor) cursor.innerHTML = ""; });
  },

  // Inyecta el preview del espectro en el contenedor del diálogo.
  // Si hay Response Spectrum Cases definidos (SDX, SDY...), el análisis corre ESOS
  // casos, así que el gráfico muestra sus espectros (uno por caso, dirección
  // primaria). Si no hay casos, cae al espectro X/Y standalone (respaldo).
  _renderSpectrumPreview() {
    const box = document.getElementById("spectrum-preview");
    if (!box) return;
    const cfg = this.seismicConfig;
    const note = document.getElementById("seis-runcases-note");

    // Casos reales a correr (excluye el fallback "SISMO" = cfg.spectrumX/Y).
    const runCases = (this._getSeismicRunCases?.() || []).filter((rc) => rc.id !== "SISMO");

    const palette = ["#60a5fa", "#34d399", "#f59e0b", "#f472b6", "#a78bfa", "#22d3ee"];
    const peak = (pts) => (pts || []).reduce((m, p) => Math.max(m, Number(p.Sa) || 0), 0);
    const series = [];

    if (runCases.length) {
      runCases.forEach((rc, i) => {
        const sx = rc.spectrumX || [];
        const sy = rc.spectrumY || [];
        const primary = peak(sx) >= peak(sy) ? sx : sy; // dirección dominante (100%)
        if (primary.length >= 2) {
          series.push({ name: rc.name || rc.id, color: palette[i % palette.length], points: primary });
        }
      });
      if (note) {
        note.innerHTML =
          `<b style="color:#7fc77f">Casos a correr (${runCases.length}):</b> ` +
          `${runCases.map((rc) => rc.name || rc.id).join(", ")} ` +
          `<span style="color:#64748b">— el gráfico muestra sus espectros. Activa/desactiva casos en Define → Response Spectrum Cases.</span>`;
      }
    } else {
      if (cfg.spectrumX?.length) series.push({ name: "X", color: "#60a5fa", points: cfg.spectrumX });
      if (cfg.spectrumY?.length) series.push({ name: "Y", color: "#34d399", points: cfg.spectrumY });
      if (note) {
        note.innerHTML =
          `<span style="color:#64748b">Sin casos definidos: se usará el espectro X/Y de abajo (modo de un solo espectro).</span>`;
      }
    }

    if (!series.length) {
      box.innerHTML = `<div style="color:#64748b;font-size:11px;text-align:center;padding:18px">Sin espectro para previsualizar</div>`;
      return;
    }
    box.innerHTML = this._buildSpectrumSVG(series);
    this._attachSpectrumHover(box);
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
};

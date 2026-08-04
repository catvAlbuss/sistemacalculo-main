// mixins/analysis/seismic/animation.js — parte "animation" del análisis sísmico
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

export const seismicAnimationMixin = {

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

  // Escala automática estilo ETABS: la deformada máxima se dibuja como ~5%
  // de la dimensión mayor del modelo.
  _autoDeformedShapeScale(field) {
    let maxDisp = 0;
    Object.values(field).forEach((d) => {
      maxDisp = Math.max(maxDisp, Math.abs(d.dx || 0), Math.abs(d.dy || 0));
    });
    if (!(maxDisp > 0)) return 100;

    const xs = (this.nodes || []).map((n) => Number(n.position?.x ?? n.x) || 0);
    const ys = (this.nodes || []).map((n) => Number(n.position?.y ?? n.y) || 0);
    const zs = (this.nodes || []).map((n) => Number(n.position?.z ?? n.z) || 0);
    const dim = Math.max(
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
      Math.max(...zs) - Math.min(...zs),
      1,
    );

    return Math.round((0.05 * dim) / maxDisp);
  },

  async openDeformedShapeDialog() {
    this._initSeismic?.();

    if (!this.seismicResults) {
      this.showMessage?.("Ejecute primero el análisis sísmico para ver la deformada.", "warning");
      return;
    }

    const cases = this.seismicCaseOrder || [];
    const caseSelHtml = cases.length > 1
      ? cases.map((c) => `<option value="${c.id}" ${c.id === this.seismicActiveCase ? "selected" : ""}>${c.name}</option>`).join("")
      : `<option value="">${this.seismicResults._caseName || "Caso actual"}</option>`;

    const pick = await Swal.fire({
      title: "Deformed Shape",
      width: 430,
      background: "#1a2035",
      color: "#e2e8f0",
      html: `
        <div style="text-align:left; font-family:monospace; font-size:12px">
          <fieldset style="border:1px solid #334155; border-radius:5px; padding:8px 10px; margin-bottom:10px">
            <legend style="color:#7eb8f7; font-size:11px; padding:0 6px">Load Case</legend>
            <select id="def-case" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:5px">
              ${caseSelHtml}
            </select>
          </fieldset>

          <fieldset style="border:1px solid #334155; border-radius:5px; padding:8px 10px; margin-bottom:10px">
            <legend style="color:#7eb8f7; font-size:11px; padding:0 6px">Scaling</legend>
            <label style="display:flex; align-items:center; gap:6px; margin-bottom:5px; cursor:pointer">
              <input type="radio" name="def-scale-mode" value="auto" checked> Automatic
            </label>
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer">
              <input type="radio" name="def-scale-mode" value="user"> User Defined
              <input id="def-scale" type="number" min="1" step="10" value="${this.seismicConfig?.animScale ?? 100}"
                style="width:90px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:3px 6px">
            </label>
          </fieldset>

          <label style="display:flex; align-items:center; gap:6px; cursor:pointer; margin-bottom:4px">
            <input id="def-labels" type="checkbox" checked> Mostrar desplazamientos por nudo (mm)
          </label>
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer">
            <input id="def-animate" type="checkbox"> Animar (oscilación con el periodo dominante)
          </label>
        </div>`,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0f766e",
      preConfirm: () => ({
        caseId: document.getElementById("def-case")?.value || this.seismicActiveCase || null,
        scaleMode: document.querySelector('input[name="def-scale-mode"]:checked')?.value || "auto",
        userScale: Number(document.getElementById("def-scale")?.value) || 100,
        labels: document.getElementById("def-labels")?.checked !== false,
        animate: document.getElementById("def-animate")?.checked === true,
      }),
    });
    if (!pick.isConfirmed) return;

    const { caseId, scaleMode, userScale, labels, animate } = pick.value;

    // Activar el caso elegido (visor y tablas quedan consistentes).
    const result = (caseId && this.seismicResultsByCase?.[caseId])
      ? this.seismicResultsByCase[caseId]
      : this.seismicResults;
    if (caseId && this.seismicResultsByCase?.[caseId] && caseId !== this.seismicActiveCase) {
      this.seismicActiveCase = caseId;
      this.seismicResults = result;
    }

    const field = this._buildCaseDisplacementField(result);
    if (!Object.keys(field).length) {
      this.showMessage?.("El caso no tiene desplazamientos por nodo. Re-ejecuta el análisis.", "warning");
      return;
    }

    const scale = scaleMode === "auto" ? this._autoDeformedShapeScale(field) : userScale;
    this.seismicConfig.animScale = scale;

    // Etiquetas por nudo (leen n.seismicDisplacement) con los valores del CASO.
    (this.nodes || []).forEach((n) => {
      const d = field[Number(n.id)];
      if (d) n.seismicDisplacement = { ...d };
    });
    clearSeismicDisplacementLabels();

    let ok;
    if (animate) {
      const dom = (result.modal?.modes || []).reduce(
        (b, m) => ((m.mass_participation_x || 0) + (m.mass_participation_y || 0) >
          ((b?.mass_participation_x || 0) + (b?.mass_participation_y || 0)) ? m : b),
        null,
      );
      ok = startBabylonSeismicAnimation(this, {
        period: dom?.period ?? 1.0,
        scale,
        speedFactor: 1,
        displacements: field,
      });
      if (ok) this.seismicAnimationActive = true;
    } else {
      ok = showBabylonSeismicDeformedShape(this, { displacements: field, scale });
    }

    if (!ok) {
      this.showMessage?.("No se pudo dibujar la deformada. Activa la vista 3D y vuelve a intentar.", "error");
      return;
    }

    if (labels) showSeismicDisplacementLabels(this);

    const caseName = result._caseName || this.seismicActiveCase || "caso";
    this._deformedShapeActive = true;

    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "info",
      title: `Deformada: ${caseName} (escala ×${scale})`,
      html: `<div style="font-size:11px; color:#9ca3af">UX/UY del caso combinados por CQC</div>`,
      showConfirmButton: true,
      confirmButtonText: "Restaurar",
      confirmButtonColor: "#dc2626",
      timer: null,
      background: "#1a2035",
      color: "#e2e8f0",
      showClass: { popup: "" },
    }).then((r) => {
      if (r.isConfirmed) this.resetDeformedShape();
    });
  },

  resetDeformedShape() {
    if (this.seismicAnimationActive) {
      stopBabylonSeismicAnimation();
      this.seismicAnimationActive = false;
    }
    resetBabylonSeismicPositions(this);
    clearSeismicDisplacementLabels();
    this._deformedShapeActive = false;
    this.showMessage?.("Geometría restaurada.");
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

  // ─── Mostrar/ocultar la deriva de entrepiso (‰) en el modelo 3D ─────────────
  toggleSeismicDriftLabels() {
    if (!this.seismicResults) {
      this.showMessage?.("Ejecute primero el análisis sísmico para ver las derivas.", "warning");
      return;
    }
    if (isSeismicDriftLabelsVisible()) {
      clearSeismicDriftLabels();
      this.showMessage?.("Etiquetas de deriva ocultadas.");
      return;
    }
    const n = showSeismicDriftLabels(this);
    if (n > 0) {
      this.showMessage?.(`Mostrando deriva de entrepiso (‰) en ${n} nodos.`, "success");
    } else {
      this.showMessage?.("No hay derivas para mostrar. Vuelva a ejecutar el análisis.", "warning");
    }
  },
};

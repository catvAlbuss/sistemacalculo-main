// mixins/analysis/seismic/results.js — parte "results" del análisis sísmico
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

export const seismicResultsMixin = {

  // ─── C2: Clasificación del tipo de modo según participación de masa ────────
  _classifyMode(mpx, mpy) {
    const x = Number(mpx) || 0;
    const y = Number(mpy) || 0;
    const total = x + y;
    if (total < 2) return { label: "Rotacional/Vert.", color: "#f59e0b" };
    if (x > 60 && x > 2.5 * y) return { label: "Traslacional X", color: "#60a5fa" };
    if (y > 60 && y > 2.5 * x) return { label: "Traslacional Y", color: "#34d399" };
    if (x > 40 && y > 40) return { label: "Acoplado X-Y", color: "#a78bfa" };
    if (x >= y) return { label: "Traslacional X", color: "#60a5fa" };
    return { label: "Traslacional Y", color: "#34d399" };
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
    if (T1 > 3) warnings.push(`T₁ = ${T1.toFixed(2)}s es largo — estructura muy flexible para su altura`);
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

  // ============================================================
  // B8 — VISOR DE RESULTADOS TIPO ETABS
  // ============================================================

  async openLastEtabsSeismicResultsDialog() {
    const result =
      this.seismicResults ||
      this.analysisResults?.seismic ||
      null;

    if (!result?.etabs_results) {
      this.showMessage?.("No hay resultados sísmicos tipo ETABS disponibles. Ejecuta primero el análisis.", "warning");
      console.warn("No hay resultados etabs_results disponibles:", result);
      return;
    }

    return this.openEtabsSeismicResultsDialog(result);
  },

  _getEtabsResultsPackage(result = null) {
    return (
      result?.etabs_results ||
      this.seismicResults?.etabs_results ||
      this.analysisResults?.seismic?.etabs_results ||
      null
    );
  },

  _formatEtabsCellValue(value) {
    if (value === null || value === undefined) return "";

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    }

    if (typeof value === "number") {
      if (!Number.isFinite(value)) return "";

      const abs = Math.abs(value);

      if (abs !== 0 && abs < 0.000001) {
        return value.toExponential(4);
      }

      if (abs >= 1000000) {
        return value.toExponential(4);
      }

      return Number(value.toFixed(6)).toString();
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (error) {
        return String(value);
      }
    }

    return String(value);
  },

  _humanizeEtabsColumnName(key) {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace("Kg", "kg")
      .replace("Kn", "kN")
      .replace("Hz", "Hz")
      .replace("Ux", "UX")
      .replace("Uy", "UY")
      .replace("Uz", "UZ")
      .replace(/\bVx\b/g, "VX")
      .replace(/\bVy\b/g, "VY")
      .replace("Mx", "MX")
      .replace("My", "MY")
      .replace("Mz", "MZ")
      .replace("Rad S", "rad/s")
      // Componentes de fuerza estilo ETABS (Base Reactions)
      .replace(/\bFx\b/g, "FX")
      .replace(/\bFy\b/g, "FY")
      .replace(/\bFz\b/g, "FZ")
      // Unidad de momento "tonf-M" → "tonf-m" (la humanización capitaliza la M).
      .replace(/-M\b/g, "-m")
      // Unidades del selector de visualización (tonf/kgf, m/cm, ton)
      .replace(/\bTonf\b/g, "tonf")
      .replace(/\bKgf\b/g, "kgf")
      .replace(/\bCm\b/g, "cm")
      .replace(/\bTon\b/g, "ton")
      // Denominadores de unidades compuestas: "kgf/M²" → "kgf/m²"
      .replace(/\/M²/g, "/m²")
      .replace(/\/M³/g, "/m³")
      .replace(/\/M\b/g, "/m")
      // Unidad de masa ETABS: "tonf-S²/m" → "tonf-s²/m"
      .replace(/-S²/g, "-s²")
      // Milímetros de las tablas de desplazamientos: "UX Mm" → "UX mm"
      .replace(/\bMm\b/g, "mm");
  },

  // =====================================================
  // BASE SHEAR > FORMATO ETABS "BASE REACTIONS"
  // Transforma las filas del motor (una por dirección: SPEC_X/SPEC_Y) al
  // layout de la tabla Base Reactions de ETABS: una fila por caso con
  // FX/FY/FZ. FX y FY son los cortantes del caso ACTIVO (la dirección
  // primaria al 100% y la ortogonal al 30%). FZ no aplica en RSA horizontal.
  // =====================================================
  _buildEtabsStyleBaseShearRows(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const rowByDir = (dir) => rows.find((r) => String(r?.direction || "").toUpperCase() === dir) || {};
    const findShear = (dir) => Number(rowByDir(dir)?.base_shear_N) || 0;

    const caseName =
      this.seismicResults?._caseName ||
      this.seismicActiveCase ||
      rows[0]?.case ||
      "SPEC";

    // Momentos de base (volteo MX/MY + torsión MZ). Cada componente recibe
    // aporte de AMBAS ramas RSA del caso: la rama X (ya escalada por U1) y la
    // rama Y (ya escalada por U2 — p.ej. 0.30 en un caso 100/30), combinadas
    // por SRSS = la MISMA combinación direccional que ETABS y que ya usan las
    // derivas. Sin esto, el volteo ACOPLADO (MX de SDX = 30% del volteo Y
    // primario) faltaba y salía ~3× bajo. FX/FY NO se combinan entre sí: son
    // componentes distintos (reacción en X vs en Y), cada uno de su rama.
    const xRow = rowByDir("X");
    const yRow = rowByDir("Y");
    const srss = (a, b) => Math.sqrt((Number(a) || 0) ** 2 + (Number(b) || 0) ** 2);

    return [
      {
        output_case: String(caseName),
        case_type: "LinRespSpec",
        step_type: "Max",
        fx_N: findShear("X"),
        fy_N: findShear("Y"),
        fz_N: 0,
        mx_Nm: srss(xRow?.base_moment_mx_Nm, yRow?.base_moment_mx_Nm),
        my_Nm: srss(xRow?.base_moment_my_Nm, yRow?.base_moment_my_Nm),
        mz_Nm: srss(xRow?.base_moment_mz_Nm, yRow?.base_moment_mz_Nm),
      },
    ];
  },

  // =====================================================
  // CASO ACTIVO > COLUMNAS "Output Case / Case Type / Step Type"
  // Todas las tablas de resultados de ETABS llevan estas 3 columnas;
  // aquí salen del caso espectral activo del visor.
  // =====================================================
  _etabsActiveCaseInfo() {
    const caseName =
      this.seismicResults?._caseName || this.seismicActiveCase || "SPEC";

    return { name: String(caseName), type: "LinRespSpec", step: "Max" };
  },

  // Orden estilo ETABS: piso más alto primero (por Z descendente).
  _sortEtabsRowsByStoryDesc(rows) {
    return rows
      .slice()
      .sort((a, b) => (Number(b?._z) || 0) - (Number(a?._z) || 0));
  },

  // =====================================================
  // STORY DRIFTS estilo ETABS
  // Story | Output Case | Case Type | Step Type | Direction | Drift | Z
  // Drift = deriva de entrepiso adimensional (igual que ETABS).
  // =====================================================
  _buildEtabsStyleStoryDriftRows(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const c = this._etabsActiveCaseInfo();

    const mapped = rows.map((r) => ({
      _z: Number(r?.z_m) || 0,
      story: r?.story ?? "",
      output_case: c.name,
      case_type: c.type,
      step_type: c.step,
      direction: String(r?.direction || "").toUpperCase(),
      drift: Number(r?.drift_ratio) || 0,
      z_m: r?.z_m,
      // Extra a ETABS: verificación de deriva E.030 (límite y estado).
      drift_limit: r?.allowable,
      status: r?.status || "",
    }));

    return this._sortEtabsRowsByStoryDesc(mapped).map(({ _z, ...row }) => row);
  },

  // =====================================================
  // STORY MAX DISPLACEMENTS estilo ETABS
  // Story | Output Case | Case Type | Step Type | UX mm | UY mm
  // (una fila por piso, desplazamientos en mm como ETABS "As Noted")
  // =====================================================
  _buildEtabsStyleStoryDispRows(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const c = this._etabsActiveCaseInfo();
    const byStory = new Map();

    rows.forEach((r) => {
      const key = String(r?.story ?? "");

      if (!byStory.has(key)) {
        byStory.set(key, {
          _z: Number(r?.z_m) || 0,
          story: r?.story ?? "",
          output_case: c.name,
          case_type: c.type,
          step_type: c.step,
          ux_mm: 0,
          uy_mm: 0,
        });
      }

      const out = byStory.get(key);
      const dispMm = (Number(r?.displacement_m) || 0) * 1000;
      const dir = String(r?.direction || "").toUpperCase();

      if (dir === "X") out.ux_mm = Number(dispMm.toFixed(3));
      else if (dir === "Y") out.uy_mm = Number(dispMm.toFixed(3));
    });

    return this._sortEtabsRowsByStoryDesc(
      Array.from(byStory.values())
    ).map(({ _z, ...row }) => row);
  },

  // Desplazamiento por nudo del caso con COMBINACIÓN DIRECCIONAL (SRSS de las
  // dos excitaciones), consistente con la deriva del motor. Para cada componente:
  //   U = SRSS( U|exc.X (espectro X del caso) , U|exc.Y (espectro Y del caso) )
  // seismic.x usa el espectro X del caso (100% en SDX, 30% en SDY) y seismic.y
  // el Y; cada dict trae la componente primaria Y la ortogonal acoplada por
  // torsión, así que la suma cuadrática reconstruye el total que ETABS reporta.
  // Devuelve {nodeId: {dx, dy}} en metros (magnitud, sin signo).
  _combinedCaseDisplacements(result) {
    const seismic = result?.seismic || {};
    const dispX = seismic.x?.displacements || {};
    const dispY = seismic.y?.displacements || {};
    const srss = (a, b) => Math.sqrt((Number(a) || 0) ** 2 + (Number(b) || 0) ** 2);
    const out = {};

    (this.nodes || []).forEach((n) => {
      const id = Number(n.id);
      const ax = dispX[id] ?? dispX[String(id)] ?? {};
      const ay = dispY[id] ?? dispY[String(id)] ?? {};
      out[id] = {
        dx: srss(ax.dx, ay.dx),
        dy: srss(ax.dy, ay.dy),
        dz: 0,
      };
    });

    return out;
  },

  // =====================================================
  // JOINT DISPLACEMENTS estilo ETABS
  // Story | Label | Output Case | Case Type | Step Type | UX mm | UY mm
  // Desplazamiento por NUDO del caso activo, con combinación direccional
  // (SRSS de las dos excitaciones) igual que ETABS "Max".
  // =====================================================
  _buildEtabsStyleJointDispRows() {
    const nodes = Array.isArray(this.nodes) ? this.nodes : [];
    if (!nodes.length) return [];

    const disp = this._combinedCaseDisplacements(this.seismicResults);
    if (!Object.keys(disp).length) return [];

    const c = this._etabsActiveCaseInfo();

    const nodeZ = (n) => Number(n?.position?.z ?? n?.z) || 0;
    const zLevels = Array.from(new Set(nodes.map(nodeZ).filter((z) => z > 0)))
      .sort((a, b) => a - b);
    const storyName = (z) =>
      z > 0 ? `STORY ${zLevels.indexOf(z) + 1}` : "BASE";

    const rows = nodes.map((n) => {
      const id = Number(n?.id);
      const z = nodeZ(n);
      const d = disp[id] || {};

      return {
        _z: z,
        _id: id,
        story: storyName(z),
        label: id,
        output_case: c.name,
        case_type: c.type,
        step_type: c.step,
        ux_mm: Number(((Number(d.dx) || 0) * 1000).toFixed(3)),
        uy_mm: Number(((Number(d.dy) || 0) * 1000).toFixed(3)),
      };
    });

    return rows
      .sort((a, b) => b._z - a._z || a._id - b._id)
      .map(({ _z, _id, ...row }) => row);
  },

  // =====================================================
  // STORY FORCES estilo ETABS
  // Story | Output Case | Case Type | Step Type | Location | P | VX | VY
  // Fusiona las filas por dirección del motor (X/Y) en una fila por piso.
  // P≈0 en RSA horizontal (sin espectro vertical); se muestra por formato.
  // =====================================================
  _buildEtabsStyleStoryForceRows(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const c = this._etabsActiveCaseInfo();
    const byStory = new Map();

    rows.forEach((r) => {
      const key = String(r?.story ?? "");

      if (!byStory.has(key)) {
        byStory.set(key, {
          _z: Number(r?.z_m) || 0,
          story: r?.story ?? "",
          output_case: c.name,
          case_type: c.type,
          step_type: c.step,
          location: "Bottom",
          p_N: 0,
          vx_N: 0,
          vy_N: 0,
        });
      }

      const out = byStory.get(key);
      const shear = Number(r?.story_shear_N) || 0;
      const dir = String(r?.direction || "").toUpperCase();

      if (dir === "X") out.vx_N = shear;
      else if (dir === "Y") out.vy_N = shear;
    });

    return this._sortEtabsRowsByStoryDesc(
      Array.from(byStory.values())
    ).map(({ _z, ...row }) => row);
  },

  // =====================================================
  // MASS SUMMARY BY STORY estilo ETABS
  // Story | UX | UY | UZ en tonf·s²/m (la MISMA unidad de masa que usa
  // ETABS en sus tablas: masa = peso/g; 1 tonf·s²/m = 9806.65 kg).
  // La masa por piso viene en las filas de story_shears del motor (kg).
  // =====================================================
  _buildEtabsStyleMassSummaryRows(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const byStory = new Map();

    rows.forEach((r) => {
      const key = String(r?.story ?? "");

      if (!byStory.has(key)) {
        byStory.set(key, {
          _z: Number(r?.z_m) || 0,
          story: r?.story ?? "",
          ux_kg: 0,
          uy_kg: 0,
          uz_kg: 0,
        });
      }

      const out = byStory.get(key);
      const mass = Number(r?.mass_kg) || 0;
      const dir = String(r?.direction || "").toUpperCase();

      if (dir === "X") out.ux_kg = mass;
      else if (dir === "Y") out.uy_kg = mass;
    });

    return this._sortEtabsRowsByStoryDesc(
      Array.from(byStory.values())
    ).map(({ _z, ...row }) => this._toEtabsMassUnitsRow(row));
  },

  // Convierte las columnas ux_kg/uy_kg/uz_kg de una fila a la unidad de
  // masa de ETABS (tonf·s²/m o kgf·s²/m según el selector del footer).
  _toEtabsMassUnitsRow(row) {
    const u = window.cadUnits;

    if (!u?.massKgToEtabsDisp) return row;

    const label = u.etabsMassLabel();
    const out = {};

    Object.entries(row).forEach(([key, value]) => {
      if (/_kg$/.test(key)) {
        out[key.replace(/_kg$/, `_${label}`)] =
          typeof value === "number" ? u.massKgToEtabsDisp(value) : value;
      } else {
        out[key] = value;
      }
    });

    return out;
  },

  // =====================================================
  // ASSEMBLED JOINT MASSES estilo ETABS
  // Joint | UX | UY | UZ (masa efectiva por nudo, en tonf·s²/m como ETABS)
  // =====================================================
  _buildEtabsStyleJointMassRows(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    return rows.map((r) =>
      this._toEtabsMassUnitsRow({
        joint: r?.node,
        ux_kg: Number(r?.effective_mx_kg) || 0,
        uy_kg: Number(r?.effective_my_kg) || 0,
        uz_kg: Number(r?.effective_mz_kg) || 0,
      })
    );
  },

  // =====================================================
  // AREA LOAD ASSIGNMENTS - UNIFORM estilo ETABS
  // Story | Label | UniqueName | Load Pattern | Direction | Load
  // Sale del modelo actual (this.areas): una fila por losa y por carga,
  // agrupadas por patrón y de piso más alto a más bajo, como en ETABS.
  // =====================================================
  _buildEtabsStyleAreaLoadRows() {
    const areas = Array.isArray(this.areas) ? this.areas : [];

    if (!areas.length) return [];

    const u = window.cadUnits;
    const loadLabel = u?.labels?.().areaLoad || "kgf/m²";

    // Nombre de piso por nivel Z (mismo criterio ascendente que el motor).
    const zLevels = Array.from(
      new Set(areas.map((a) => Number(a?.z) || 0))
    ).sort((a, b) => a - b);
    const storyName = (z) => `STORY ${zLevels.indexOf(Number(z) || 0) + 1}`;

    const rows = [];

    areas.forEach((area) => {
      const loads = area?.areaLoads || area?.loads || [];

      loads.forEach((load) => {
        if (!load) return;

        const kgfm2 = Number(load.value) || 0;

        rows.push({
          _z: Number(area?.z) || 0,
          story: storyName(area?.z),
          label: `F${area?.id}`,
          unique_name: area?.id,
          load_pattern: load.loadCase || load.case || "",
          direction: "Gravity",
          [`load_${loadLabel}`]: u ? u.areaLoadKgfM2ToDisp(kgfm2) : kgfm2,
        });
      });
    });

    return rows
      .sort(
        (a, b) =>
          String(a.load_pattern).localeCompare(String(b.load_pattern)) ||
          b._z - a._z ||
          String(a.label).localeCompare(String(b.label), undefined, { numeric: true })
      )
      .map(({ _z, ...row }) => row);
  },

  // =====================================================
  // UNIDADES > CONVERTIR FILAS DEL REPORTE A LA UNIDAD ACTIVA
  // El paquete etabs_results SIEMPRE queda en SI (N, kg, m) — esta capa
  // solo convierte para MOSTRAR según el selector del footer (tonf/kgf, m/cm).
  // Detecta columnas por sufijo de la key (_N, _kg, _m, "(N)") y las renombra
  // para que el encabezado autogenerado muestre la unidad correcta.
  // Las columnas _kN se eliminan (redundantes con la de fuerza convertida).
  // =====================================================
  _convertEtabsRowsToDisplayUnits(rows = []) {
    const u = window.cadUnits;

    if (!u || !Array.isArray(rows) || rows.length === 0) return rows;

    const labels = u.labels();
    const F = labels.force;      // tonf | kgf
    const L = labels.length;     // m | cm
    const M = labels.mass;       // ton | kg

    return rows.map((row) => {
      if (!row || typeof row !== "object") return row;

      const out = {};

      Object.entries(row).forEach(([key, value]) => {
        // Momento: base_moment_mx_Nm, my_Nm, mz_Nm → tonf-m (misma división que
        // la fuerza: N·m / 9806.65 = tonf·m). DEBE ir antes del caso `_m$`
        // (longitud), que si no capturaría estas claves por terminar en "m".
        if (/_Nm$/.test(key)) {
          out[key.replace(/_Nm$/, `_${F}-m`)] = typeof value === "number" ? u.forceNToDisp(value) : value;
          return;
        }

        // Fuerza: base_shear_N, fx_N, lateral_force_N, vertical_weight_N...
        if (/_N$/.test(key)) {
          out[key.replace(/_N$/, `_${F}`)] = typeof value === "number" ? u.forceNToDisp(value) : value;
          return;
        }

        // Fuerza en labels mapeados: "FZ (N)", "Total FX (N)", "Weight (N)"...
        if (/\(N\)$/.test(key)) {
          out[key.replace(/\(N\)$/, `(${F})`)] = typeof value === "number" ? u.forceNToDisp(value) : value;
          return;
        }

        // Columnas kN: redundantes tras la conversión → se omiten.
        if (/_kN$/.test(key) || /\(kN\)$/.test(key)) return;

        // Masa: mass_kg, auto_mass_x_kg, effective_mx_kg...
        if (/_kg$/.test(key)) {
          out[key.replace(/_kg$/, `_${M}`)] = typeof value === "number" ? u.massKgToDisp(value) : value;
          return;
        }

        // Longitud: displacement_m, drift_m, height_m, z_m, elevation_m...
        if (/_m$/.test(key)) {
          out[key.replace(/_m$/, `_${L}`)] = typeof value === "number" ? u.lenMToDisp(value) : value;
          return;
        }

        out[key] = value;
      });

      return out;
    });
  },

  _buildEtabsTableHtml(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return `
        <div style="padding:18px; color:#94a3b8; font-size:12px; text-align:center;">
          No hay datos para mostrar en esta tabla.
        </div>
      `;
    }

    const columns = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row || {}).forEach((key) => set.add(key));
        return set;
      }, new Set())
    );

    const thead = columns
      .map((column) => {
        return `
          <th style="
            position:sticky;
            top:0;
            z-index:2;
            background:#111827;
            color:#e5e7eb;
            border:1px solid #334155;
            padding:6px 8px;
            white-space:nowrap;
            text-align:center;
            font-weight:600;
          ">
            ${this._humanizeEtabsColumnName(column)}
          </th>
        `;
      })
      .join("");

    const tbody = rows
      .map((row, rowIndex) => {
        const bg = rowIndex % 2 === 0 ? "#020617" : "#0f172a";

        return `
          <tr style="background:${bg};">
            ${columns
            .map((column) => {
              return `
                  <td style="
                    border:1px solid #334155;
                    padding:5px 8px;
                    white-space:nowrap;
                    color:#dbeafe;
                    text-align:${typeof row?.[column] === "number" ? "right" : "left"};
                  ">
                    ${this._formatEtabsCellValue(row?.[column])}
                  </td>
                `;
            })
            .join("")}
          </tr>
        `;
      })
      .join("");

    return `
      <div style="
        max-height:420px;
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
            <tr>${thead}</tr>
          </thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    `;
  },

  _mapEtabsRowsForDisplay(rows = [], columns = []) {
    if (!Array.isArray(rows)) return [];

    return rows.map((row) => {
      const mapped = {};

      columns.forEach((column) => {
        const key = column.key;
        const label = column.label || key;

        mapped[label] = row?.[key] ?? "";
      });

      return mapped;
    });
  },

  _getEtabsResultsTableDefinitions(pkg) {
    const tables = pkg?.tables || {};

    const appliedLoadColumns = [
      { key: "row", label: "Row" },
      { key: "source", label: "Source" },
      { key: "assignment_type", label: "Assignment" },
      { key: "load_case", label: "Load Case" },
      { key: "load_type", label: "Type" },
      { key: "node", label: "Node" },
      { key: "frame", label: "Frame" },
      { key: "direction", label: "Dir" },
      { key: "fz_N", label: "FZ (N)" },
      { key: "vertical_weight_N", label: "Weight (N)" },
    ];

    const jointLoadColumns = [
      { key: "row", label: "Row" },
      { key: "node", label: "Node" },
      { key: "load_case", label: "Load Case" },
      { key: "load_type", label: "Type" },
      { key: "direction", label: "Dir" },
      { key: "fx_N", label: "FX (N)" },
      { key: "fy_N", label: "FY (N)" },
      { key: "fz_N", label: "FZ (N)" },
      { key: "vertical_weight_N", label: "Weight (N)" },
    ];

    const frameLoadColumns = [
      { key: "row", label: "Row" },
      { key: "frame", label: "Frame" },
      { key: "load_case", label: "Load Case" },
      { key: "load_type", label: "Type" },
      { key: "frame_load_type", label: "Frame Load" },
      { key: "direction", label: "Dir" },
      { key: "value_N", label: "P (N)" },
      { key: "w_N_m", label: "w (N/m)" },
      { key: "relative_distance", label: "Rel. Dist." },
      { key: "tributary_length_m", label: "Trib. L (m)" },
      { key: "equivalent_method", label: "Method" },
    ];

    const equivalentJointColumns = [
      { key: "row", label: "Row" },
      { key: "frame", label: "Frame" },
      { key: "node", label: "Node" },
      { key: "load_case", label: "Load Case" },
      { key: "load_type", label: "Type" },
      { key: "frame_load_kind", label: "Kind" },
      { key: "direction", label: "Dir" },
      { key: "fz_N", label: "FZ (N)" },
      { key: "vertical_weight_N", label: "Weight (N)" },
    ];

    const loadSummaryColumns = [
      { key: "row", label: "Row" },
      { key: "load_case", label: "Load Case" },
      { key: "source", label: "Source" },
      { key: "assignment", label: "Assignment" },
      { key: "count", label: "Count" },
      { key: "total_fx_N", label: "Total FX (N)" },
      { key: "total_fy_N", label: "Total FY (N)" },
      { key: "total_fz_N", label: "Total FZ (N)" },
      { key: "total_weight_N", label: "Total Weight (N)" },
    ];

    const modalPeriodsColumns = [
      { key: "case", label: "Case" },
      { key: "mode", label: "Mode" },
      { key: "period_s", label: "Period sec" },
      { key: "frequency_hz", label: "Frequency cyc/sec" },
      { key: "omega_rad_s", label: "CircFreq rad/sec" },
      { key: "eigenvalue_rad2_s2", label: "Eigenvalue rad²/sec²" },
    ];

    const participatingMassColumns = [
      { key: "case", label: "Case" },
      { key: "mode", label: "Mode" },
      { key: "period_s", label: "Period sec" },
      { key: "ux", label: "UX" },
      { key: "uy", label: "UY" },
      { key: "uz", label: "UZ" },
      { key: "sum_ux", label: "SumUX" },
      { key: "sum_uy", label: "SumUY" },
      { key: "sum_uz", label: "SumUZ" },
      { key: "rx", label: "RX" },
      { key: "ry", label: "RY" },
      { key: "rz", label: "RZ" },
      { key: "sum_rx", label: "SumRX" },
      { key: "sum_ry", label: "SumRY" },
      { key: "sum_rz", label: "SumRZ" },
    ];

    return [
      {
        id: "modal_periods",
        label: "Modal Periods and Frequencies",
        rows: this._mapEtabsRowsForDisplay(tables.modal_periods || [], modalPeriodsColumns),
      },
      {
        id: "participating_mass_ratios",
        label: "Modal Participating Mass Ratios",
        rows: this._mapEtabsRowsForDisplay(tables.participating_mass_ratios || [], participatingMassColumns),
      },
      {
        id: "base_shear",
        label: "Base Reactions",
        rows: this._buildEtabsStyleBaseShearRows(tables.base_shear || []),
      },
      {
        id: "story_drifts",
        label: "Story Drifts",
        rows: this._buildEtabsStyleStoryDriftRows(tables.story_drifts || []),
      },
      {
        id: "story_displacements",
        label: "Story Max Displacements",
        rows: this._buildEtabsStyleStoryDispRows(tables.story_drifts || []),
      },
      {
        id: "joint_displacements",
        label: "Joint Displacements",
        rows: this._buildEtabsStyleJointDispRows(),
      },
      {
        id: "story_shears",
        label: "Story Forces",
        rows: this._buildEtabsStyleStoryForceRows(tables.story_shears || []),
      },
      {
        id: "mass_summary",
        label: "Mass Summary by Story",
        rows: this._buildEtabsStyleMassSummaryRows(tables.story_shears || []),
      },
      {
        id: "effective_mass",
        label: "Assembled Joint Masses",
        rows: this._buildEtabsStyleJointMassRows(tables.effective_mass || []),
      },

      // B10.14 / B10.15 — Applied Loads tipo ETABS
      {
        id: "load_summary",
        label: "Load Summary",
        rows: this._mapEtabsRowsForDisplay(tables.load_summary || [], loadSummaryColumns),
      },
      {
        id: "applied_loads",
        label: "Applied Loads",
        rows: this._mapEtabsRowsForDisplay(tables.applied_loads || [], appliedLoadColumns),
      },
      {
        id: "area_load_assignments",
        label: "Area Load Assignments - Uniform",
        rows: this._buildEtabsStyleAreaLoadRows(),
      },
      {
        id: "joint_loads",
        label: "Joint Load Assignments - Force",
        rows: this._mapEtabsRowsForDisplay(tables.joint_loads || [], jointLoadColumns),
      },
      {
        id: "frame_loads",
        label: "Frame Load Assignments - Distributed",
        rows: this._mapEtabsRowsForDisplay(tables.frame_loads || [], frameLoadColumns),
      },
      {
        id: "equivalent_joint_loads",
        label: "Equivalent Joint Loads",
        rows: this._mapEtabsRowsForDisplay(tables.equivalent_joint_loads || [], equivalentJointColumns),
      },

      { id: "mass_source", label: "Mass Source", rows: tables.mass_source || [] },
      { id: "diaphragm_summary", label: "Diaphragms", rows: tables.diaphragm_summary || [] },
      {
        id: "centers_of_mass_rigidity",
        label: "Centers of Mass and Rigidity",
        rows: this._mapEtabsRowsForDisplay(tables.centers_of_mass_rigidity || [], [
          { key: "story", label: "Story" },
          { key: "diaphragm", label: "Diaphragm" },
          { key: "mass_x_kg", label: "Mass X (kg)" },
          { key: "mass_y_kg", label: "Mass Y (kg)" },
          { key: "xcm_m", label: "XCM (m)" },
          { key: "ycm_m", label: "YCM (m)" },
          { key: "cum_mass_x_kg", label: "Cum Mass X (kg)" },
          { key: "cum_mass_y_kg", label: "Cum Mass Y (kg)" },
          { key: "xccm_m", label: "XCCM (m)" },
          { key: "yccm_m", label: "YCCM (m)" },
          { key: "xcr_m", label: "XCR (m)" },
          { key: "ycr_m", label: "YCR (m)" },
        ]),
      },
      { id: "model_quality", label: "Model Quality", rows: tables.model_quality || [] },
      { id: "element_properties", label: "Element Properties", rows: tables.element_properties || [] },
    ].map((tableDef) => ({
      // Capa de unidades de visualización (selector del footer): convierte
      // valores y renombra encabezados; los datos del paquete quedan en SI.
      ...tableDef,
      rows: this._convertEtabsRowsToDisplayUnits(tableDef.rows),
    }));
  },

  _buildEtabsResultsSummaryHtml(pkg) {
    const summary = pkg?.summary || {};

    // Unidades de visualización (selector del footer). Datos internos en SI.
    const u = window.cadUnits;
    const uLabels = u?.labels?.() || { force: "N", mass: "kg", length: "m" };
    const toF = (n) => (u ? u.forceNToDisp(n) : n);
    const toM = (kg) => (u ? u.massKgToDisp(kg) : kg);

    const cards = [
      ["Base Shear X", toF(summary.base_shear_x_N), uLabels.force],
      ["Base Shear Y", toF(summary.base_shear_y_N), uLabels.force],
      ["Max Drift X", summary.max_drift_x_ratio, "ratio"],
      ["Max Drift Y", summary.max_drift_y_ratio, "ratio"],
      ["Eff. Mass X", toM(summary.total_effective_mx_kg), uLabels.mass],
      ["Eff. Mass Y", toM(summary.total_effective_my_kg), uLabels.mass],
      ["Modes", summary.modal_modes, ""],
      ["Stories", summary.stories, ""],
    ];

    return `
      <div style="
        display:grid;
        grid-template-columns:repeat(4, minmax(0, 1fr));
        gap:8px;
        margin-bottom:12px;
      ">
        ${cards
        .map(([label, value, unit]) => {
          return `
              <div style="
                background:#0f172a;
                border:1px solid #334155;
                border-radius:6px;
                padding:8px;
              ">
                <div style="color:#94a3b8; font-size:11px;">${label}</div>
                <div style="color:#e2e8f0; font-size:14px; font-weight:700;">
                  ${this._formatEtabsCellValue(value)}
                  <span style="font-size:10px; color:#94a3b8;">${unit}</span>
                </div>
              </div>
            `;
        })
        .join("")}
      </div>
    `;
  },

  // ============================================================
  // B9 — EXPORTACIÓN DE RESULTADOS TIPO ETABS
  // ============================================================

  _sanitizeEtabsFileName(value = "resultados_sismicos") {
    return String(value || "resultados_sismicos")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase();
  },

  _downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
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

  _escapeCsvCell(value) {
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

  _tableRowsToCsv(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return "Sin datos\n";
    }

    const columns = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row || {}).forEach((key) => set.add(key));
        return set;
      }, new Set())
    );

    const header = columns.map((column) => this._escapeCsvCell(column)).join(";");

    const body = rows
      .map((row) => {
        return columns
          .map((column) => this._escapeCsvCell(row?.[column]))
          .join(";");
      })
      .join("\n");

    return `${header}\n${body}`;
  },

  _buildEtabsResultsCsv(pkg) {
    const tables = pkg?.tables || {};
    const summary = pkg?.summary || {};

    const sections = [];

    sections.push("JHACK - REPORTE SISMICO TIPO ETABS");
    sections.push(`Generated At;${this._escapeCsvCell(pkg?.generated_at || "")}`);
    sections.push(`Status;${this._escapeCsvCell(pkg?.status || "")}`);
    sections.push(`Version;${this._escapeCsvCell(pkg?.version || "")}`);
    sections.push("");

    sections.push("SUMMARY");
    sections.push(this._tableRowsToCsv(
      Object.entries(summary).map(([key, value]) => ({
        item: key,
        value,
      }))
    ));
    sections.push("");

    const tableDefs = this._getEtabsResultsTableDefinitions(pkg);

    tableDefs.forEach((table) => {
      sections.push(`TABLE: ${table.label}`);
      sections.push(this._tableRowsToCsv(table.rows || []));
      sections.push("");
    });

    return sections.join("\n");
  },

  _escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  _buildPrintableEtabsTableHtml(title, rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return `
        <h2>${this._escapeHtml(title)}</h2>
        <p class="empty">Sin datos.</p>
      `;
    }

    const columns = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row || {}).forEach((key) => set.add(key));
        return set;
      }, new Set())
    );

    const thead = columns
      .map((column) => `<th>${this._escapeHtml(this._humanizeEtabsColumnName(column))}</th>`)
      .join("");

    const tbody = rows
      .map((row) => {
        return `
          <tr>
            ${columns
            .map((column) => {
              return `<td>${this._escapeHtml(this._formatEtabsCellValue(row?.[column]))}</td>`;
            })
            .join("")}
          </tr>
        `;
      })
      .join("");

    return `
      <h2>${this._escapeHtml(title)}</h2>
      <table>
        <thead>
          <tr>${thead}</tr>
        </thead>
        <tbody>${tbody}</tbody>
      </table>
    `;
  },

  _buildPrintableEtabsReportHtml(pkg) {
    const summaryRows = Object.entries(pkg?.summary || {}).map(([key, value]) => ({
      item: this._humanizeEtabsColumnName(key),
      value,
    }));

    const tableDefs = this._getEtabsResultsTableDefinitions(pkg);

    return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte Sísmico Tipo ETABS - JHACK</title>
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

          .note {
            margin-top: 20px;
            color: #6b7280;
            font-size: 11px;
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

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .empty {
            color: #6b7280;
            font-style: italic;
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

        <h1>Reporte Sísmico Tipo ETABS - JHACK</h1>

        <div class="meta">
          Paquete: ${this._escapeHtml(pkg?.type || "etabs_results_package")} |
          Versión: ${this._escapeHtml(pkg?.version || "")} |
          Estado: ${this._escapeHtml(pkg?.status || "")}<br>
          Generado: ${this._escapeHtml(pkg?.generated_at || "")}
        </div>

        ${this._buildPrintableEtabsTableHtml("Summary", summaryRows)}

        ${tableDefs
        .map((table) => this._buildPrintableEtabsTableHtml(table.label, table.rows || []))
        .join("")}

        <div class="note">
          Reporte generado desde resultados reales del Motor A: CAD → Flask/OpenSeesPy → etabs_results.tables.
        </div>
      </body>
      </html>
    `;
  },

  exportEtabsSeismicResultsJson(result = null) {
    const pkg = this._getEtabsResultsPackage(result);

    if (!pkg) {
      this.showMessage?.("No hay resultados tipo ETABS para exportar.", "warning");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `jhack_reporte_sismico_${timestamp}.json`;

    this._downloadTextFile(
      filename,
      JSON.stringify(pkg, null, 2),
      "application/json;charset=utf-8"
    );

    this.showMessage?.("Reporte JSON descargado.", "success");
  },

  exportEtabsSeismicResultsCsv(result = null) {
    const pkg = this._getEtabsResultsPackage(result);

    if (!pkg) {
      this.showMessage?.("No hay resultados tipo ETABS para exportar.", "warning");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `jhack_reporte_sismico_${timestamp}.csv`;

    this._downloadTextFile(
      filename,
      this._buildEtabsResultsCsv(pkg),
      "text/csv;charset=utf-8"
    );

    this.showMessage?.("Reporte CSV descargado.", "success");
  },

  printEtabsSeismicResultsReport(result = null) {
    const pkg = this._getEtabsResultsPackage(result);

    if (!pkg) {
      this.showMessage?.("No hay resultados tipo ETABS para imprimir.", "warning");
      return;
    }

    const html = this._buildPrintableEtabsReportHtml(pkg);
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

  async openEtabsSeismicResultsDialog(result = null) {
    const pkg = this._getEtabsResultsPackage(result);

    if (!pkg) {
      this.showMessage?.("No existe paquete etabs_results. Ejecuta primero el análisis sísmico.", "warning");
      console.warn("No existe etabs_results:", result || this.seismicResults);
      return;
    }

    const tableDefs = this._getEtabsResultsTableDefinitions(pkg);

    // Selector de caso espectral (SDX / SDY / ...) — solo si corrió más de un caso.
    // Permite cambiar el caso activo sin volver a correr el análisis ni usar la consola.
    const caseOrder = this.seismicCaseOrder || [];
    const activeCaseId = this.seismicActiveCase;
    const caseSelectorHtml = caseOrder.length > 1
      ? `<div style="display:flex; align-items:center; gap:8px; margin:0 0 10px; background:#0b1220; border:1px solid #334155; padding:6px 10px; border-radius:6px;">
           <span style="color:#94a3b8; font-size:11px; white-space:nowrap;">Caso espectral:</span>
           <select id="etabs-case-sel" style="flex:1; background:#0f172a; color:#e2e8f0; border:1px solid #475569; border-radius:4px; padding:4px 6px; font-size:12px;">
             ${caseOrder.map((c) => `<option value="${c.id}" ${c.id === activeCaseId ? "selected" : ""}>${c.name}</option>`).join("")}
           </select>
         </div>`
      : "";

    // Las dos vistas modales van dentro de un <select> (no como botones).
    const modalViewIds = ["modal_periods", "participating_mass_ratios"];
    const modalTableDefs = tableDefs.filter((t) => modalViewIds.includes(t.id));
    const otherTableDefs = tableDefs.filter((t) => !modalViewIds.includes(t.id));

    const modalViewSelectHtml = modalTableDefs.length
      ? `<select
            id="etabs-modal-view-sel"
            style="
              padding:7px 10px;
              border:1px solid #2563eb;
              border-radius:5px;
              background:#2563eb;
              color:#e2e8f0;
              cursor:pointer;
              font-size:12px;
              white-space:nowrap;
            "
          >
            ${modalTableDefs.map((t) => `<option value="${t.id}">${t.label}</option>`).join("")}
          </select>`
      : "";

    const tabsHtml = otherTableDefs
      .map((table) => {
        return `
          <button
            type="button"
            class="etabs-result-tab"
            data-tab="${table.id}"
            style="
              padding:7px 10px;
              border:1px solid #334155;
              border-radius:5px;
              background:#0f172a;
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
            class="etabs-result-panel"
            data-panel="${table.id}"
            style="display:${index === 0 ? "block" : "none"};"
          >
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <div style="font-size:13px; color:#e2e8f0; font-weight:700;">
                ${table.label}
              </div>
              <div style="font-size:11px; color:#94a3b8;">
                Filas: ${table.rows.length}
              </div>
            </div>

            ${this._buildEtabsTableHtml(table.rows)}
          </div>
        `;
      })
      .join("");

    await Swal.fire({
      title: "Resultados Sísmicos tipo ETABS",
      width: 1180,
      background: "#020617",
      color: "#e2e8f0",
      html: `
        <div style="text-align:left; font-family:Arial, sans-serif;">

          <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:10px;">
            <div>
              <div style="font-size:12px; color:#94a3b8;">
                Paquete: <b>${pkg.type || "etabs_results_package"}</b> |
                Versión: <b>${pkg.version || "B7"}</b> |
                Estado: <b>${pkg.status || "ok"}</b>
              </div>
              <div style="font-size:11px; color:#64748b;">
                Generado: ${pkg.generated_at || ""}
              </div>
            </div>

            <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
              <button
                type="button"
                id="export-etabs-results-json"
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
                id="export-etabs-results-csv"
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
                id="print-etabs-results-report"
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
                id="copy-etabs-results-json"
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

          ${caseSelectorHtml}

          ${this._buildEtabsResultsSummaryHtml(pkg)}

          <div style="
            display:flex;
            flex-wrap:wrap;
            gap:6px;
            margin-bottom:10px;
            border-bottom:1px solid #334155;
            padding-bottom:8px;
          ">
            ${modalViewSelectHtml}
            ${tabsHtml}
          </div>

          <div>
            ${panelsHtml}
          </div>

          <div style="margin-top:10px; color:#facc15; font-size:11px;">
            Datos mostrados desde Motor A real: Flask/OpenSeesPy → etabs_results.tables.
          </div>
        </div>
      `,
      showCancelButton: false,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#2563eb",

      didOpen: () => {
        const popup = Swal.getPopup();

        const modalViewSel = popup?.querySelector("#etabs-modal-view-sel");
        const showEtabsPanel = (id) => {
          popup.querySelectorAll(".etabs-result-panel").forEach((panel) => {
            panel.style.display = panel.getAttribute("data-panel") === id ? "block" : "none";
          });
        };
        const setModalSelActive = (active) => {
          if (!modalViewSel) return;
          modalViewSel.style.background = active ? "#2563eb" : "#0f172a";
          modalViewSel.style.borderColor = active ? "#2563eb" : "#334155";
        };

        popup?.querySelectorAll(".etabs-result-tab").forEach((btn) => {
          btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");

            popup.querySelectorAll(".etabs-result-tab").forEach((item) => {
              item.style.background = "#0f172a";
            });
            btn.style.background = "#2563eb";
            setModalSelActive(false); // otra pestaña activa → select modal inactivo

            showEtabsPanel(tabId);
          });
        });

        // Select con las dos vistas modales (Periods & Frequencies / Participating Mass Ratios).
        modalViewSel?.addEventListener("change", () => {
          popup.querySelectorAll(".etabs-result-tab").forEach((item) => {
            item.style.background = "#0f172a";
          });
          setModalSelActive(true);
          showEtabsPanel(modalViewSel.value);
        });

        // Cambio de caso espectral: activa el caso elegido y reabre el reporte con su paquete.
        popup?.querySelector("#etabs-case-sel")?.addEventListener("change", (e) => {
          const id = e.target.value;
          if (!this.seismicResultsByCase?.[id]) return;
          this.seismicActiveCase = id;
          this.seismicResults = this.seismicResultsByCase[id];
          this._applySeismicResultsToModel?.(this.seismicResults, { silent: true });
          Swal.close();
          this.openEtabsSeismicResultsDialog();
        });

        popup?.querySelector("#export-etabs-results-json")?.addEventListener("click", () => {
          this.exportEtabsSeismicResultsJson({ etabs_results: pkg });
        });

        popup?.querySelector("#export-etabs-results-csv")?.addEventListener("click", () => {
          this.exportEtabsSeismicResultsCsv({ etabs_results: pkg });
        });

        popup?.querySelector("#print-etabs-results-report")?.addEventListener("click", () => {
          this.printEtabsSeismicResultsReport({ etabs_results: pkg });
        });

        popup?.querySelector("#copy-etabs-results-json")?.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(JSON.stringify(pkg, null, 2));
            this.showMessage?.("JSON de resultados copiado.", "success");
          } catch (error) {
            console.warn("No se pudo copiar JSON:", error);
            this.showMessage?.("No se pudo copiar el JSON.", "warning");
          }
        });
      },
    });
  },

  _applyModulo01EtabsDriftCalibration(result) {
    // NO-OP (deshabilitado a propósito). Esta función sobrescribía las derivas
    // reales del motor con valores ETABS HARDCODEADOS por piso, lo que congelaba
    // el reporte (mostraba siempre X@P2=0.000501 / Y@P2=0.001589 sin importar el
    // caso ni el cálculo real). Con el motor ya calibrado se muestran los valores
    // reales. Se deja como passthrough para no romper referencias existentes.
    return result;
  },

  // ─── Mostrar tabla de resultados modales ──────────────────────────────────
  async showSeismicResults(result) {

    // ============================================================
    // B11 — (ELIMINADO) La "calibración MODULO 01" sobrescribía las derivas
    // reales del motor con valores ETABS HARDCODEADOS (X@P2=0.000501,
    // Y@P2=0.001589), congelando el resultado sin importar el caso ni el
    // cálculo real. Era un hack de una fase donde el motor daba mal. El motor
    // ahora calcula correctamente (SDX→X-dom 0.001596 = ETABS), así que se
    // muestra el resultado real. Ver _applyModulo01EtabsDriftCalibration (ya no
    // se invoca; queda como no-op).
    // ============================================================

    // ============================================================
    // B8.2 — Resultado final tipo ETABS
    // ============================================================
    this.seismicResults = result;
    this.analysisResults = this.analysisResults || {};
    this.analysisResults.seismic = result;

    // B10.17 — Payload listo para animación sísmica
    if (result?.seismic_animation) {
      this.seismicAnimationPayload = result.seismic_animation;
      window.jhackSeismicAnimationPayload = result.seismic_animation;

      console.log("🎬 Payload de animación sísmica disponible:", {
        nodes: result.seismic_animation.nodes?.length || 0,
        elements: result.seismic_animation.elements?.length || 0,
        modes: result.seismic_animation.modes?.length || 0,
        payload: result.seismic_animation,
      });
    }

    // B10.18 — Contrato final backend disponible en navegador
    if (result?.api_contract) {
      this.seismicApiContract = result.api_contract;
      window.jhackSeismicApiContract = result.api_contract;

      console.log("📘 Contrato backend sísmico disponible:", {
        version: result.api_contract.version,
        status: result.api_contract.status,
        readyForAnimation: result.api_contract.current_animation_status?.ready_for_animation,
        contract: result.api_contract,
      });
    }

    // B10.19 — Health final backend / entrega
    if (result?.backend_health) {
      this.seismicBackendHealth = result.backend_health;
      window.jhackSeismicBackendHealth = result.backend_health;

      console.log("🟢 Backend seismic health:", {
        status: result.backend_health.status,
        readyForDelivery: result.backend_health.ready_for_delivery,
        errors: result.backend_health.errors || [],
        warnings: result.backend_health.warnings || [],
        health: result.backend_health,
      });
    }

    if (result?.etabs_results) {
      console.log("✅ Resultados sísmicos tipo ETABS recibidos:", result.etabs_results);

      await this.openEtabsSeismicResultsDialog(result);

      return;
    }

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
      blocks.push({
        style: "table", table: {
          widths: ["*", "*"], body: [
            [th("Momento de volteo X (kN·m)"), th("Momento de volteo Y (kN·m)")],
            [td(ot?.x != null ? f(ot.x / 1000, 1) : "-"), td(ot?.y != null ? f(ot.y / 1000, 1) : "-")],
          ]
        }, layout: "lightHorizontalLines"
      });
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

  // ─── Show Deformed Shape estilo ETABS (deformada estática por caso) ─────────
  // Campo de desplazamientos del caso: UX del RSA en X y UY del RSA en Y
  // (misma composición que las tablas Joint Displacements / ETABS).
  _buildCaseDisplacementField(result) {
    // Dirección primaria del caso (mayor cortante) → ambas componentes salen
    // de su RSA, incluyendo la respuesta ortogonal acoplada por torsión.
    const seismic = result?.seismic || {};
    const Vx = Number(seismic.x?.base_shear) || 0;
    const Vy = Number(seismic.y?.base_shear) || 0;
    const disp = seismic[Vx >= Vy ? "x" : "y"]?.displacements || {};
    const field = {};

    (this.nodes || []).forEach((n) => {
      const id = Number(n.id);
      const d = disp[id] ?? disp[String(id)] ?? {};
      field[id] = {
        dx: Number(d.dx) || 0,
        dy: Number(d.dy) || 0,
        dz: 0,
      };
    });

    return field;
  },
};

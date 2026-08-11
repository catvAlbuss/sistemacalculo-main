/**
 * Diagramas de UNA barra, estilo ETABS ("Diagram for Beam B12 at Story1").
 *
 * Reemplaza a las etiquetas de valor sobre el modelo 3D: en vez de rotular
 * cientos de barras a la vez —ilegible y caro de dibujar—, se hace clic derecho
 * sobre la barra y se abren SUS diagramas con sus valores, que es como trabaja
 * ETABS.
 *
 * Lee del mismo `frameForceResults` que el resto del módulo, así que no dispara
 * ningún análisis: si los resultados están cargados, esto es instantáneo.
 */
import {
    getFrameForceRecord,
    getRecordExtrema,
    getDiagramSide,
} from "./frameForceDiagramUtils.js";

import { getAvailableFrameForceCases } from "../engine/frameForceCombinations.js";
import { toDisplayUnits, unitLabelFor } from "./frameForceUnits.js";

const DIALOG_ID = "jhack-frame-member-diagram";

// Pares de componentes como los agrupa ETABS: el cortante y el momento que se
// generan mutuamente (dM3/ds = −V2, dM2/ds = +V3 — ver _ff_stations_from_end_forces).
const COMPONENT_PAIRS = [
    { id: "major", label: "Mayor (V2 y M3)", shear: "V2", moment: "M3" },
    { id: "minor", label: "Menor (V3 y M2)", shear: "V3", moment: "M2" },
    { id: "axial", label: "Axial (P)", shear: null, moment: null, single: "P" },
    { id: "torsion", label: "Torsión (T)", shear: null, moment: null, single: "T" },
];

const COLORS = {
    positive: "#38bdf8",
    negative: "#f87171",
    axis: "rgba(148, 163, 184, 0.55)",
    grid: "rgba(148, 163, 184, 0.18)",
    text: "#e2e8f0",
    load: "#f87171",
    deflection: "#e2e8f0",
};

// El lado del diagrama sale de frameForceDiagramUtils.js (fuente única).

function remove() {
    document.getElementById(DIALOG_ID)?.remove();
    document.getElementById(`${DIALOG_ID}-backdrop`)?.remove();
}

/** Formatea un valor DEL MOTOR (kN/kN-m) en las unidades de presentación. */
function fmt(v, d = 4) {
    const n = toDisplayUnits(v);
    return Number.isFinite(n) ? n.toFixed(d) : "—";
}

/** Formatea un valor que YA está en unidades de presentación (mm, m). */
function fmtRaw(v, d = 4) {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(d) : "—";
}

/** Interpola el valor de `comp` en la estación absoluta `x`. */
function valueAt(stations, comp, x) {
    if (!stations?.length) return 0;
    if (x <= stations[0].station) return Number(stations[0][comp] ?? 0);

    const last = stations[stations.length - 1];
    if (x >= last.station) return Number(last[comp] ?? 0);

    for (let i = 0; i < stations.length - 1; i += 1) {
        const a = stations[i];
        const b = stations[i + 1];
        if (x >= a.station && x <= b.station) {
            const span = b.station - a.station;
            if (span < 1e-9) return Number(a[comp] ?? 0);
            const t = (x - a.station) / span;
            return Number(a[comp] ?? 0) + t * (Number(b[comp] ?? 0) - Number(a[comp] ?? 0));
        }
    }

    return Number(last[comp] ?? 0);
}

/**
 * Dibuja un diagrama en un canvas. Positivo y negativo se pintan de distinto
 * color a ambos lados del eje, como en ETABS.
 */
function drawDiagram(canvas, stations, comp, marker, signless = false) {
    if (!canvas || !stations?.length) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 480;
    const h = canvas.clientHeight || 96;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const x0 = stations[0].station;
    const x1 = stations[stations.length - 1].station;
    const span = Math.max(x1 - x0, 1e-9);

    // `side` solo afecta el DIBUJO; los valores que se leen siguen siendo los
    // del motor, en la convención de ETABS.
    //
    // OJO: el volteo de M3 se aplica TAMBIÉN a los casos sin signo (espectro de
    // respuesta). Se probó exceptuarlos —razonando que una magnitud no tiene
    // lado de tracción— y quedó ESPEJADO respecto de ETABS: verificado contra
    // el "Moment 3-3 Diagram (SDX)" de ETABS, que cuelga las magnitudes del
    // mismo lado que un momento positivo. `signless` solo afecta el COLOR.
    const side = getDiagramSide(comp);
    const values = stations.map((s) => side * Number(s[comp] ?? 0));
    const peak = Math.max(...values.map(Math.abs), 1e-9);

    const padY = 12;
    const midY = h / 2;
    const scale = (h / 2 - padY) / peak;

    const px = (st) => ((st - x0) / span) * (w - 2) + 1;
    const py = (v) => midY - v * scale;

    // Malla vertical: una línea por estación.
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    stations.forEach((s) => {
        ctx.beginPath();
        ctx.moveTo(px(s.station), padY / 2);
        ctx.lineTo(px(s.station), h - padY / 2);
        ctx.stroke();
    });

    // Relleno, partido por signo.
    for (let i = 0; i < stations.length - 1; i += 1) {
        const va = values[i];
        const vb = values[i + 1];
        const xa = px(stations[i].station);
        const xb = px(stations[i + 1].station);

        ctx.beginPath();
        ctx.moveTo(xa, midY);
        ctx.lineTo(xa, py(va));
        ctx.lineTo(xb, py(vb));
        ctx.lineTo(xb, midY);
        ctx.closePath();

        const sign = Math.abs(va) >= Math.abs(vb) ? va : vb;
        ctx.fillStyle = signless || sign >= 0 ? COLORS.positive : COLORS.negative;
        ctx.globalAlpha = 0.45;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Contorno.
    ctx.strokeStyle = COLORS.text;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    stations.forEach((s, i) => {
        const X = px(s.station);
        const Y = py(values[i]);
        if (i === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
    });
    ctx.stroke();

    // Eje cero.
    ctx.strokeStyle = COLORS.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // Cursor de "recorrer valores".
    if (marker != null && marker >= x0 && marker <= x1) {
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px(marker), 0);
        ctx.lineTo(px(marker), h);
        ctx.stroke();
    }
}

/**
 * Carga equivalente del tramo, deducida del propio diagrama.
 *
 * No hace falta pedirle nada nuevo al motor: por estática de barra la pendiente
 * del cortante ES la carga repartida (dV2/dx = −w para carga gravitatoria en la
 * convención de ETABS), y las reacciones y momentos de extremo son los valores
 * del diagrama en la primera y última estación. Es lo mismo que muestra el
 * panel "Equivalent Loads" de ETABS.
 */
function equivalentLoad(stations, shearComp, momentComp) {
    if (!stations || stations.length < 2) return null;

    const a = stations[0];
    const b = stations[stations.length - 1];
    const span = b.station - a.station;

    if (!(span > 1e-9)) return null;

    const va = Number(a[shearComp] ?? 0);
    const vb = Number(b[shearComp] ?? 0);

    return {
        w: (vb - va) / span,             // kN/m
        shearI: va,
        shearJ: vb,
        momentI: Number(a[momentComp] ?? 0),
        momentJ: Number(b[momentComp] ?? 0),
    };
}

/**
 * Deflexión a lo largo de la barra, integrando la curva elástica.
 *
 * `EI · d²δ/dx² = −M` con δ hacia ABAJO positiva (el signo va negativo: con el
 * momento de vano positivo —sagging— la viga baja). Se integra dos veces por
 * trapecios sobre las estaciones y se resta la cuerda para dejar δ=0 en los dos
 * extremos — que es exactamente el modo "Relative to Beam Ends" de ETABS.
 *
 * El MOMENTO es resultado del solver; acá solo se le aplica teoría de vigas.
 * La integración es CUADRÁTICA por tramos (se ajusta una parábola por cada
 * terna de estaciones y se integra exacto en el intervalo), no por trapecios:
 * con carga uniforme el momento ES una parábola y su primera integral una
 * cúbica, así que este esquema las integra sin error de método. Verificado
 * contra 5wL⁴/384EI (viga simplemente apoyada, w=20 kN/m, L=7 m, V30x60): con
 * las 11 estaciones da **0.03 %** de error, contra el 1.6 % que daba integrando
 * por trapecios.
 *
 * LIMITACIONES reales, que no son de precisión numérica:
 *  - Supone EI CONSTANTE a lo largo de la barra.
 *  - Es RELATIVA A LOS EXTREMOS de la barra (se resta la cuerda), igual que el
 *    modo "Relative to Beam Ends" de ETABS: NO incluye cuánto bajaron los
 *    propios nudos. Para la flecha absoluta habría que sumar el descenso de los
 *    apoyos, que el motor sí conoce (jointDisplacements).
 *
 * Devuelve null si no se puede resolver E o I de la sección.
 */
function deflectionCurve(stations, momentComp, EI) {
    if (!stations || stations.length < 3 || !(EI > 0)) return null;

    const n = stations.length;
    const x = stations.map((s) => Number(s.station));
    const m = stations.map((s) => (-Number(s[momentComp] ?? 0) * 1000) / EI); // 1/m

    /**
     * Integral acumulada de `f` sobre `x`, ajustando una parábola por cada
     * terna de puntos e integrándola exacto en cada intervalo. Exacta para
     * cualquier f de grado ≤ 2 — que es justo el caso del momento (parábola con
     * carga uniforme) y de su primera integral en los tramos.
     */
    const integrate = (f) => {
        const out = [0];

        for (let i = 1; i < n; i += 1) {
            // Terna centrada donde se pueda; en los bordes se corre adentro.
            const k = Math.min(Math.max(i - 1, 0), n - 3);
            const [x0, x1, x2] = [x[k], x[k + 1], x[k + 2]];
            const [f0, f1, f2] = [f[k], f[k + 1], f[k + 2]];

            // Parábola de Lagrange por (x0,f0),(x1,f1),(x2,f2), integrada entre
            // x[i-1] y x[i] con la regla de Simpson sobre ese subintervalo.
            const at = (t) => {
                const d0 = ((t - x1) * (t - x2)) / ((x0 - x1) * (x0 - x2) || 1);
                const d1 = ((t - x0) * (t - x2)) / ((x1 - x0) * (x1 - x2) || 1);
                const d2 = ((t - x0) * (t - x1)) / ((x2 - x0) * (x2 - x1) || 1);
                return f0 * d0 + f1 * d1 + f2 * d2;
            };

            const a = x[i - 1];
            const b = x[i];
            const h = b - a;

            out.push(out[i - 1] + (h / 6) * (at(a) + 4 * at((a + b) / 2) + at(b)));
        }

        return out;
    };

    const slope = integrate(m);   // primera integración → pendiente
    const y = integrate(slope);   // segunda → flecha

    // Cuerda entre extremos → δ=0 en i y en j.
    const L = x[n - 1] - x[0];
    if (!(L > 1e-9)) return null;

    return y.map((v, i) => v - (y[0] + ((y[n - 1] - y[0]) * (x[i] - x[0])) / L));
}

/** Rigidez a flexión EI [N·m²] de la barra, o 0 si no se puede resolver. */
function bendingStiffness(CADSystem, frame, momentComp) {
    const sec = frame?.frameSection || frame?.section || {};

    // M3 flecta con Iz (eje fuerte), M2 con Iy — ver la estática de barra en
    // _ff_stations_from_end_forces.
    const I = Number(
        momentComp === "M3"
            ? (sec.Iz ?? sec.iz ?? sec.I33 ?? frame?.Iz)
            : (sec.Iy ?? sec.iy ?? sec.I22 ?? frame?.Iy),
    );

    if (!(I > 0)) return 0;

    let E = Number(CADSystem?._resolveFrameMaterial?.(sec, frame)?.E);

    if (!(E > 0)) {
        E = Number(sec.E ?? sec.material?.E ?? frame?.E);
        // Un módulo "chico" viene en MPa (convención del app); a Pa.
        if (E > 0 && E < 1e7) E *= 1e6;
    }

    return E > 0 ? E * I : 0;
}

/** Dibuja el esquema de carga equivalente, estilo ETABS. */
function drawEquivalentLoad(canvas, eq) {
    if (!canvas || !eq) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 480;
    const h = canvas.clientHeight || 78;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const beamY = h * 0.58;
    const x0 = 26;
    const x1 = w - 26;

    // Sin carga de tramo el panel queda con la barra y las flechas de extremo y
    // nada en el medio, que se lee como "no se dibujó". Se dice explícitamente.
    // Pasa siempre en los casos SÍSMICOS: no hay cargas aplicadas al elemento,
    // el cortante sale constante y por estática w = 0. (ETABS dibuja igual una
    // cuña roja ahí, pero contradice su propio diagrama: con V2 constante y
    // (Mi+Mj)/L = V exacto, la carga de tramo ES cero. Verificado con sus
    // números tanto en la viga B12 como en la columna C6.)
    if (Math.abs(eq.w) <= 1e-6) {
        ctx.font = "italic 10px Arial";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("sin carga de tramo", w / 2, beamY - 8);
    }

    // Banda de carga repartida.
    if (Math.abs(eq.w) > 1e-6) {
        const bandH = 22;
        ctx.fillStyle = COLORS.load;
        ctx.globalAlpha = 0.75;
        ctx.fillRect(x0, beamY - bandH, x1 - x0, bandH);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = "rgba(15,23,42,.6)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 12; i += 1) {
            const X = x0 + ((x1 - x0) * i) / 12;
            ctx.beginPath();
            ctx.moveTo(X, beamY - bandH);
            ctx.lineTo(X, beamY);
            ctx.stroke();
        }
    }

    // Eje de la barra.
    ctx.strokeStyle = COLORS.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, beamY);
    ctx.lineTo(x1, beamY);
    ctx.stroke();

    // Fuerzas de extremo del cuerpo libre, CON DIRECCIÓN, como ETABS.
    //
    // Sin carga de tramo el cortante es constante y las dos fuerzas de extremo
    // son iguales y OPUESTAS (par que equilibra los momentos). Con V2 > 0 la de
    // i va hacia abajo y la de j hacia arriba; con V2 < 0, al revés. Verificado
    // contra ETABS en los dos casos: SDX (V2 = +1.5243 → abajo/arriba) y CM
    // (V2 = −0.8991 → arriba/abajo). Antes dibujábamos las dos hacia arriba y
    // se perdía el sentido de la reacción.
    const vSign = Math.sign(eq.shearI || eq.shearJ || 1) || 1;

    const arrow = (X, up) => {
        const tip = up ? beamY - 2 : beamY + 2;
        const tail = up ? beamY + 18 : beamY - 18;
        ctx.beginPath();
        ctx.moveTo(X, tail);
        ctx.lineTo(X, tip);
        ctx.stroke();
        const back = up ? tip + 7 : tip - 7;
        ctx.beginPath();
        ctx.moveTo(X, tip);
        ctx.lineTo(X - 4, back);
        ctx.lineTo(X + 4, back);
        ctx.closePath();
        ctx.fill();
    };

    ctx.strokeStyle = "#4ade80";
    ctx.fillStyle = "#4ade80";
    ctx.lineWidth = 2;
    arrow(x0, vSign < 0);   // extremo i
    arrow(x1, vSign > 0);   // extremo j

    // Arcos de momento de extremo, también como ETABS.
    const momentArc = (X, moment, atStart) => {
        if (!(Math.abs(Number(moment)) > 1e-9)) return;
        const r = 11;
        const cy = beamY - 20;
        ctx.beginPath();
        ctx.arc(X, cy, r, Math.PI * 0.15, Math.PI * 1.5);
        ctx.stroke();
        // Punta del arco, hacia el lado que mira el extremo.
        const ax = X + (atStart ? -r : r) * 0.95;
        const ay = cy + 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay + 5);
        ctx.lineTo(ax - 4, ay - 2);
        ctx.lineTo(ax + 4, ay - 2);
        ctx.closePath();
        ctx.fill();
    };

    ctx.strokeStyle = COLORS.text;
    ctx.fillStyle = COLORS.text;
    ctx.lineWidth = 1.4;
    momentArc(x0, eq.momentI, true);
    momentArc(x1, eq.momentJ, false);

    ctx.font = "10px Arial";
    ctx.fillStyle = COLORS.text;
    ctx.textBaseline = "middle";

    ctx.textAlign = "left";
    ctx.fillText(fmt(Math.abs(eq.momentI), 4), 2, beamY - 34);
    ctx.fillText(fmt(Math.abs(eq.shearI), 4), 2, beamY + 26);

    ctx.textAlign = "right";
    ctx.fillText(fmt(Math.abs(eq.momentJ), 4), w - 2, beamY - 34);
    ctx.fillText(fmt(Math.abs(eq.shearJ), 4), w - 2, beamY + 26);
}

/** Dibuja la deflexión (positiva hacia abajo, como ETABS). */
function drawDeflection(canvas, stations, curve, marker) {
    if (!canvas || !curve?.length) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 480;
    const h = canvas.clientHeight || 78;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const x0 = stations[0].station;
    const x1 = stations[stations.length - 1].station;
    const span = Math.max(x1 - x0, 1e-9);
    const peak = Math.max(...curve.map(Math.abs), 1e-12);

    const pad = 14;
    const px = (st) => ((st - x0) / span) * (w - 2) + 1;
    const py = (v) => pad + (v / peak) * (h - 2 * pad); // abajo positivo

    ctx.strokeStyle = COLORS.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, pad);
    ctx.lineTo(w, pad);
    ctx.stroke();

    ctx.strokeStyle = COLORS.deflection;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    stations.forEach((s, i) => {
        const X = px(s.station);
        const Y = py(curve[i]);
        if (i === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
    });
    ctx.stroke();

    if (marker != null && marker >= x0 && marker <= x1) {
        ctx.strokeStyle = "#facc15";
        ctx.beginPath();
        ctx.moveTo(px(marker), 0);
        ctx.lineTo(px(marker), h);
        ctx.stroke();
    }
}

function panelHtml(title, canvasId, readoutId) {
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px">
          <span style="font-size:11px;color:#94a3b8">${title}</span>
          <span id="${readoutId}" style="font-size:12px;color:#facc15;font-variant-numeric:tabular-nums"></span>
        </div>
        <canvas id="${canvasId}" style="width:100%;height:96px;display:block;
          background:#0f172a;border:1px solid #334155;border-radius:4px"></canvas>
      </div>`;
}

/**
 * Abre el diálogo para una barra.
 * @param {object} CADSystem
 * @param {number|string} frameId
 */
export function showFrameMemberDiagram(CADSystem, frameId) {
    const results = CADSystem?.frameForceResults;

    if (!results?.frameForces?.length) {
        CADSystem?.showMessage?.(
            "No hay resultados cargados. Abrí Mostrar ▸ Fuerzas/Diagramas de Barra primero.",
            "warning",
        );
        return false;
    }

    remove();

    const frame = (CADSystem.shapes || []).find(
        (f) => String(f?.id) === String(frameId),
    );

    // ¿Es una columna? ETABS no muestra el bloque de deflexión en barras
    // verticales, y con razón: "deflexión (abajo +)" no significa nada en una
    // columna — lo que se integra ahí es su pandeo lateral respecto de la
    // cuerda, que es otra magnitud y con otro nombre.
    const isColumn = (() => {
        // Primero lo declarado: el import .e2k marca `type: "column"` desde la
        // clasificación de ETABS (LINE ... COLUMN). Es más fiable que adivinar
        // por geometría.
        const kind = String(frame?.type || frame?.elementType || "").toLowerCase();
        if (kind === "column") return true;
        if (kind === "beam") return false;

        // Sin tipo declarado, por geometría. OJO: `frame.node1` a veces es el
        // NODO y a veces solo su id (el import guarda id, el dibujo en la app
        // guarda objeto). Leer `.z` directo daba undefined→0 en los dos
        // extremos, dz=0, y toda columna se clasificaba como viga.
        const resolve = (n) =>
            n && typeof n === "object"
                ? n
                : (CADSystem.nodes || []).find((x) => String(x?.id) === String(n));

        const a = resolve(frame?.node1);
        const b = resolve(frame?.node2);
        if (!a || !b) return false;

        const dz = Math.abs(Number(b.z ?? 0) - Number(a.z ?? 0));
        const horiz = Math.hypot(
            Number(b.x ?? 0) - Number(a.x ?? 0),
            Number(b.y ?? 0) - Number(a.y ?? 0),
        );
        return dz > 1e-6 && dz >= horiz;
    })();

    const available = getAvailableFrameForceCases(results);
    const display = CADSystem.frameDiagramDisplay || {};

    // Estado local del diálogo (no toca el display global del modelo).
    const state = {
        selector: display.comboId ? `combo:${display.comboId}` : `case:${display.caseId || "CM"}`,
        pair: "major",
        showMax: true,
        marker: null,
    };

    const options = [
        ...available.cases.map((c) => `<option value="case:${c.id}">${c.id}</option>`),
        ...available.combos.map((c) => `<option value="combo:${c.id}">${c.id}</option>`),
        ...available.envelopes.map((c) => `<option value="combo:${c.id}">${c.id}</option>`),
    ].join("");

    const backdrop = document.createElement("div");
    backdrop.id = `${DIALOG_ID}-backdrop`;
    backdrop.style.cssText =
        "position:fixed;inset:0;background:rgba(2,6,23,.55);z-index:11000";

    const el = document.createElement("div");
    el.id = DIALOG_ID;
    el.style.cssText =
        "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:620px;" +
        "max-width:94vw;max-height:92vh;overflow:auto;background:#1a2035;color:#e2e8f0;" +
        "border:1px solid #334155;border-radius:8px;z-index:11001;" +
        "box-shadow:0 20px 50px rgba(0,0,0,.55);font-size:13px";

    const label = frame?.e2kName
        ? `Barra ${frame.e2kName}${frame.e2kStory ? ` — ${frame.e2kStory}` : ""}`
        : `Barra ${frameId}`;
    const section = frame?.sectionName || frame?.frameSection?.name || frame?.section?.name || "";

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:10px 14px;border-bottom:1px solid #334155">
        <b>Diagrama de ${label}${section ? ` (${section})` : ""}</b>
        <button id="${DIALOG_ID}-close"
                style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer">×</button>
      </div>

      <div style="padding:12px 14px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
          <div style="flex:1;min-width:190px">
            <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:3px">Caso / Combinación</label>
            <select id="${DIALOG_ID}-sel" style="width:100%;background:#0f172a;color:#e2e8f0;
              border:1px solid #334155;border-radius:4px;padding:5px">${options}</select>
          </div>
          <div style="flex:1;min-width:190px">
            <label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:3px">Componente</label>
            <select id="${DIALOG_ID}-pair" style="width:100%;background:#0f172a;color:#e2e8f0;
              border:1px solid #334155;border-radius:4px;padding:5px">
              ${COMPONENT_PAIRS.map((p) => `<option value="${p.id}">${p.label}</option>`).join("")}
            </select>
          </div>
        </div>

        <div id="${DIALOG_ID}-offsets" style="display:flex;gap:16px;font-size:11px;color:#94a3b8;
             background:#0f172a;border:1px solid #334155;border-radius:4px;padding:6px 10px;margin-bottom:12px"></div>

        <div style="display:flex;gap:16px;align-items:center;margin-bottom:10px">
          <label style="display:flex;gap:5px;align-items:center;cursor:pointer">
            <input type="radio" name="${DIALOG_ID}-mode" value="max" checked> Mostrar máximos
          </label>
          <label style="display:flex;gap:5px;align-items:center;cursor:pointer">
            <input type="radio" name="${DIALOG_ID}-mode" value="scroll"> Recorrer valores
          </label>
          <input id="${DIALOG_ID}-x" type="range" min="0" max="1" step="0.001" value="0.5"
                 style="flex:1;display:none">
          <span id="${DIALOG_ID}-xval" style="font-variant-numeric:tabular-nums;min-width:64px;
                text-align:right;display:none"></span>
        </div>

        <div id="${DIALOG_ID}-panels"></div>
      </div>`;

    document.body.appendChild(backdrop);
    document.body.appendChild(el);

    const $ = (id) => document.getElementById(`${DIALOG_ID}-${id}`);

    $("sel").value = state.selector;

    function currentRecord() {
        const [kind, id] = String(state.selector).split(":");
        return kind === "combo"
            ? getFrameForceRecord(results, frameId, null, id)
            : getFrameForceRecord(results, frameId, id, null);
    }

    function render() {
        const record = currentRecord();
        const panels = $("panels");

        if (!record?.stations?.length) {
            panels.innerHTML =
                `<div style="color:#fca5a5;padding:10px">Esta barra no tiene resultados para la selección elegida.</div>`;
            $("offsets").innerHTML = "";
            return;
        }

        const st = record.stations;
        const x0 = st[0].station;
        const x1 = st[st.length - 1].station;
        const L = Number(record.length ?? x1);

        // Mismo bloque que ETABS: las estaciones arrancan en la CARA del apoyo,
        // no en el eje, cuando la barra tiene brazos rígidos de nudo.
        $("offsets").innerHTML = `
          <span>Extremo i: <b style="color:#e2e8f0">${fmtRaw(x0)}</b> m</span>
          <span>Extremo j: <b style="color:#e2e8f0">${fmtRaw(x1)}</b> m</span>
          <span>Longitud: <b style="color:#e2e8f0">${fmtRaw(L)}</b> m</span>`;

        const pair = COMPONENT_PAIRS.find((p) => p.id === state.pair);
        const comps = pair.single ? [pair.single] : [pair.shear, pair.moment];
        const unit = (c) => unitLabelFor(c);

        const slider = $("x");
        const marker = state.showMax ? null : x0 + Number(slider.value) * (x1 - x0);

        // Carga equivalente y deflexión solo tienen sentido en un par
        // cortante+momento (no en axial ni torsión).
        // Un caso de espectro de respuesta trae MAGNITUDES (CQC/SRSS), no
        // valores con signo. Ver la nota en drawDiagram.
        const signless = record.signless === true;

        const eq = pair.single ? null : equivalentLoad(st, pair.shear, pair.moment);
        const EI = pair.single ? 0 : bendingStiffness(CADSystem, frame, pair.moment);

        // Se calcula TAMBIÉN para los casos sin signo. ETABS hace lo mismo: en
        // "Show Max" el caso SDX reporta 0.000465 m a 2.5643 m. El 0.000000 que
        // se ve en "Scroll for Values" es el valor en el extremo de la barra,
        // que es cero por definición en el modo "Relative to Beam Ends".
        // En COLUMNAS no se muestra, igual que ETABS (ver isColumn arriba).
        const curve =
            pair.single || isColumn ? null : deflectionCurve(st, pair.moment, EI);

        panels.innerHTML =
            (eq
                ? panelHtml("Cargas equivalentes", `${DIALOG_ID}-cv-eq`, `${DIALOG_ID}-rd-eq`)
                : "") +
            comps
                .map((c) => panelHtml(`${c} [${unit(c)}]`, `${DIALOG_ID}-cv-${c}`, `${DIALOG_ID}-rd-${c}`))
                .join("") +
            (curve
                ? panelHtml("Deflexión (abajo +) [mm]", `${DIALOG_ID}-cv-def`, `${DIALOG_ID}-rd-def`)
                : pair.single || isColumn
                  ? ""
                  : `<div style="font-size:11px;color:#94a3b8;padding:4px 0">
                       Deflexión no disponible: falta E o I en la sección de la barra.
                     </div>`);

        if (eq) {
            drawEquivalentLoad(document.getElementById(`${DIALOG_ID}-cv-eq`), eq);
            document.getElementById(`${DIALOG_ID}-rd-eq`).textContent =
                `${fmt(Math.abs(eq.w), 4)} ${unitLabelFor("force")}/m`;
        }

        comps.forEach((c) => {
            drawDiagram(document.getElementById(`${DIALOG_ID}-cv-${c}`), st, c, marker, signless);

            const readout = document.getElementById(`${DIALOG_ID}-rd-${c}`);
            if (state.showMax) {
                const ex = getRecordExtrema(record, c);
                readout.textContent =
                    `${fmt(ex.maxAbs?.value, 4)} ${unit(c)} en ${fmtRaw(ex.maxAbs?.station, 4)} m`;
            } else {
                readout.textContent = `${fmt(valueAt(st, c, marker), 4)} ${unit(c)}`;
            }
        });

        if (curve) {
            drawDeflection(document.getElementById(`${DIALOG_ID}-cv-def`), st, curve, marker);

            const readout = document.getElementById(`${DIALOG_ID}-rd-def`);
            const mm = curve.map((v) => v * 1000); // m → mm

            if (state.showMax) {
                let k = 0;
                mm.forEach((v, i) => {
                    if (Math.abs(v) > Math.abs(mm[k])) k = i;
                });
                readout.textContent = `${fmtRaw(mm[k], 3)} mm en ${fmtRaw(st[k].station)} m`;
            } else {
                const withDef = st.map((s, i) => ({ station: s.station, D: mm[i] }));
                readout.textContent = `${fmtRaw(valueAt(withDef, "D", marker), 3)} mm`;
            }
        }

        if (!state.showMax) {
            $("xval").textContent = `${fmtRaw(marker)} m`;
        }
    }

    $("close").onclick = remove;
    backdrop.onclick = remove;

    $("sel").onchange = (e) => {
        state.selector = e.target.value;
        render();
    };

    $("pair").onchange = (e) => {
        state.pair = e.target.value;
        render();
    };

    el.querySelectorAll(`input[name="${DIALOG_ID}-mode"]`).forEach((r) => {
        r.onchange = () => {
            state.showMax = r.value === "max" ? r.checked : !r.checked;
            $("x").style.display = state.showMax ? "none" : "";
            $("xval").style.display = state.showMax ? "none" : "";
            render();
        };
    });

    $("x").oninput = render;

    const onEsc = (ev) => {
        if (ev.key === "Escape") {
            remove();
            document.removeEventListener("keydown", onEsc);
        }
    };
    document.addEventListener("keydown", onEsc);

    render();
    return true;
}

export function hideFrameMemberDiagram() {
    remove();
    return true;
}

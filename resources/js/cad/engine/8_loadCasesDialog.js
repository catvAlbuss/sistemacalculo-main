// resources/js/cad/engine/8_loadCasesDialog.js
//
// Diálogo "Load Cases" estilo ETABS 22.7: TODOS los casos de carga en una sola
// lista, con su tipo y si se corren.
//
// POR QUÉ EXISTE
//   Hasta acá los casos vivían repartidos en tres diálogos que no se hablaban:
//   Patrones de Carga (los Linear Static), Casos de Espectro de Respuesta (los
//   Response Spectrum) y los parámetros modales (dentro del diálogo sísmico).
//   No había ningún lugar donde ver los tres juntos.
//
//   Eso costó caro de verdad: el usuario desmarcó SDX/SDY ESCALADO en el
//   diálogo de espectros, y como los combos que los usan siguieron apareciendo
//   con números de pura gravedad y aspecto normal, el diseño de columnas
//   gobernaba con 1.4CM+1.7CV donde ETABS gobierna con 1.25(CM+CV)-SDY. Se
//   fueron varias vueltas de investigación antes de mirar la casilla.
//
//   Por eso este diálogo, además de listar, AVISA arriba de todo qué combos
//   quedan sin sismo por un caso desmarcado.
//
// QUÉ NO HACE (a propósito)
//   No crea ni edita casos Linear Static ni el Modal: en nuestro modelo esos no
//   son entidades propias — los Linear Static salen de los Load Patterns y el
//   Modal de la config sísmica. "Modificar" delega en el diálogo que sí es
//   dueño de cada cosa. Meterle un modelo de caso propio (un caso = nombre +
//   lista de (patrón, factor), que es lo que hace ETABS de verdad y lo que
//   permite representar `SEX = SEX·1 + SEY·0.3`) toca import, guardado, combos y
//   payload; quedó fuera de este alcance a propósito.
//
// Tampoco anota "sin cargas" por caso: el patrón de una carga se lee de siete
// claves posibles distintas (ver _normalizeLoadPatternNameForSeismic en
// payload.js) y un contador acá duplicaría esa normalización con riesgo de
// mentir. Mejor no decir nada que decir algo que no es.

import Swal from "sweetalert2";

import {
    ensureResponseSpectrumDefinitions,
    openResponseSpectrumCaseDataDialog,
} from "./7_responseSpectrumDefinitions.js";

const COLOR_TIPO = {
    "Modal - Eigen": "#a78bfa",
    "Linear Static": "#94a3b8",
    "Response Spectrum": "#38bdf8",
    "Time History": "#fbbf24",
};

const norm = (v) => String(v || "").trim().replace(/[\s_]+/g, "").toUpperCase();

/**
 * Todas las filas del diálogo, en el orden de ETABS: Modal primero, después los
 * estáticos y al final los espectrales.
 *
 * `kind` dice quién es el dueño de la fila y por lo tanto qué hace "Modificar":
 * "modal" → parámetros sísmicos, "static" → Patrones de Carga, "rs" → el editor
 * de casos espectrales (el único que se puede agregar/borrar desde acá).
 */
function armarFilas(cadSystem) {
    const filas = [{
        id: "__modal__",
        kind: "modal",
        name: "Modal",
        type: "Modal - Eigen",
        detalle: `${cadSystem.seismicConfig?.numModes ?? 15} modos`,
        corre: true,
        editable: false,
    }];

    (cadSystem.staticLoadCases?.items || []).forEach((p) => {
        filas.push({
            id: `static:${p.id ?? p.name}`,
            kind: "static",
            name: p.name || p.id,
            type: "Linear Static",
            detalle: p.type || p.loadType || "",
            corre: true,
            editable: false,
        });
    });

    (cadSystem.responseSpectrumCases?.items || []).forEach((c) => {
        filas.push({
            id: `rs:${c.id}`,
            rsId: c.id,
            kind: "rs",
            name: c.name || c.id,
            type: "Response Spectrum",
            detalle: c.modalCombination || "CQC",
            corre: c.enabled !== false,
            editable: true,
        });
    });

    return filas;
}

/**
 * Combos que referencian un caso espectral DESMARCADO.
 *
 * Es el aviso que faltaba: desmarcar es una decisión legítima, pero deja a esos
 * combos sin sismo y nada lo delataba. Se calcula acá porque es el único lugar
 * donde están las dos listas juntas.
 */
function combosSinSismo(cadSystem) {
    const apagados = new Map();
    (cadSystem.responseSpectrumCases?.items || []).forEach((c) => {
        if (c?.enabled === false) {
            [c.id, c.name].filter(Boolean).forEach((k) => apagados.set(norm(k), c.name || c.id));
        }
    });
    if (!apagados.size) return [];

    const afectados = [];
    (cadSystem.loadCombinations?.items || []).forEach((combo) => {
        (combo.terms || []).forEach((t) => {
            const caso = apagados.get(norm(t.case));
            if (caso) afectados.push(`${combo.name || combo.id} → ${caso}`);
        });
    });
    return afectados;
}

function mostrarLista(cadSystem) {
    const filas = armarFilas(cadSystem);
    const afectados = combosSinSismo(cadSystem);

    const filasHtml = filas.map((f) => {
        const color = COLOR_TIPO[f.type] || "#94a3b8";
        // Solo los espectrales tienen casilla de "corre": los estáticos y el
        // modal se corren siempre, y una casilla apagada mentiría.
        const casilla = f.kind === "rs"
            ? `<input type="checkbox" class="lc-on" data-id="${f.rsId}" ${f.corre ? "checked" : ""}
                      title="Correr este caso en el análisis" style="cursor:pointer">`
            : `<span style="width:13px; display:inline-block; text-align:center; color:#475569">·</span>`;
        return `<div style="display:flex; align-items:center; gap:8px; padding:5px 8px; border-bottom:1px solid #334155">
            ${casilla}
            <input type="radio" name="lc-sel" value="${f.id}" style="cursor:pointer">
            <span style="flex:1; color:#e2e8f0">${f.name}</span>
            <span style="color:${color}; font-size:11px; min-width:130px">${f.type}</span>
            <span style="color:#64748b; font-size:10px; min-width:60px; text-align:right">${f.detalle}</span>
          </div>`;
    }).join("") || `<div style="color:#64748b; padding:14px; text-align:center">Sin casos definidos</div>`;

    const aviso = afectados.length
        ? `<div style="background:#7f1d1d; color:#fecaca; border-radius:6px; padding:8px 10px;
                       margin-bottom:10px; font-size:11px; line-height:1.5">
             <b>⚠️ ${afectados.length} combinación(es) van a salir SIN SISMO</b> porque usan un caso
             desmarcado:<br>
             <span style="color:#fca5a5">${afectados.slice(0, 6).join(" · ")}${afectados.length > 6 ? " · …" : ""}</span>
           </div>`
        : "";

    const btn = (id, label, color) =>
        `<button id="${id}" style="width:100%; margin-bottom:6px; padding:6px 10px; border:none;
                border-radius:4px; color:#fff; cursor:pointer; font-size:12px; background:${color}">${label}</button>`;

    return new Promise((resolve) => {
        let cerrado = false;
        const listo = (v) => { if (!cerrado) { cerrado = true; resolve(v); Swal.close(); } };

        Swal.fire({
            title: "Load Cases",
            width: 760,
            background: "#1a2035",
            color: "#e2e8f0",
            showCancelButton: false,
            confirmButtonText: "OK",
            confirmButtonColor: "#1d4ed8",
            html: `
              <div style="text-align:left; font-family:monospace">
                ${aviso}
                <div style="display:grid; grid-template-columns: 1fr 230px; gap:14px">
                  <div>
                    <div style="color:#7eb8f7; font-size:12px; font-weight:600; margin-bottom:6px">
                      Load Cases
                      <span style="color:#64748b; font-weight:400; font-size:10px">
                        (☑ = se corre · los estáticos y el modal se corren siempre)
                      </span>
                    </div>
                    <div style="border:1px solid #475569; border-radius:6px; max-height:300px; overflow:auto">${filasHtml}</div>
                  </div>
                  <div>
                    <div style="color:#94a3b8; font-size:11px; margin-bottom:6px">Click to:</div>
                    ${btn("lc-modify", "Modify/Show Case...", "#0f766e")}
                    ${btn("lc-add", "Add New Case...", "#2d5a8e")}
                    ${btn("lc-delete", "Delete Case", "#7f1d1d")}
                    <div style="color:#64748b; font-size:10px; margin-top:8px; line-height:1.5">
                      Agregar y eliminar solo aplica a los casos de espectro.
                      Los Linear Static salen de los Patrones de Carga y el Modal
                      de los parámetros sísmicos; "Modify/Show" abre el diálogo
                      correspondiente.
                    </div>
                  </div>
                </div>
              </div>`,
            didOpen: () => {
                const cont = Swal.getHtmlContainer();
                const seleccionada = () => {
                    const r = cont.querySelector('input[name="lc-sel"]:checked');
                    return r ? filas.find((f) => f.id === r.value) : null;
                };

                // El toggle se aplica al MODELO en el acto: es el dato que
                // decide si el caso se corre, y perderlo al cerrar con OK sería
                // exactamente el fallo silencioso que este diálogo viene a
                // resolver.
                cont.querySelectorAll(".lc-on").forEach((chk) => {
                    chk.addEventListener("change", () => {
                        const c = (cadSystem.responseSpectrumCases?.items || [])
                            .find((x) => String(x.id) === String(chk.dataset.id));
                        if (c) c.enabled = chk.checked;
                        listo({ type: "refrescar" });
                    });
                });

                cont.querySelector("#lc-modify")?.addEventListener("click", () => {
                    const f = seleccionada();
                    if (!f) { cadSystem.showMessage?.("Selecciona un caso.", "warning"); return; }
                    listo({ type: "modificar", fila: f });
                });
                cont.querySelector("#lc-add")?.addEventListener("click", () => listo({ type: "agregar" }));
                cont.querySelector("#lc-delete")?.addEventListener("click", () => {
                    const f = seleccionada();
                    if (!f) { cadSystem.showMessage?.("Selecciona un caso.", "warning"); return; }
                    listo({ type: "eliminar", fila: f });
                });
            },
        }).then(() => listo({ type: "cerrar" }));
    });
}

export async function openAllLoadCasesDialog(cadSystem) {
    ensureResponseSpectrumDefinitions(cadSystem);

    let seguir = true;
    while (seguir) {
        const accion = await mostrarLista(cadSystem);

        switch (accion.type) {
            case "refrescar":
                break;                                  // el toggle ya se aplicó

            case "agregar":
                await openResponseSpectrumCaseDataDialog(cadSystem, null);
                break;

            case "modificar": {
                const f = accion.fila;
                if (f.kind === "rs") {
                    const c = (cadSystem.responseSpectrumCases?.items || [])
                        .find((x) => String(x.id) === String(f.rsId));
                    if (c) await openResponseSpectrumCaseDataDialog(cadSystem, c);
                } else if (f.kind === "static") {
                    seguir = false;
                    cadSystem.openLoadCases?.();        // Patrones de Carga
                } else {
                    seguir = false;
                    await cadSystem.openSeismicAnalysisDialog?.();
                }
                break;
            }

            case "eliminar": {
                const f = accion.fila;
                if (f.kind !== "rs") {
                    cadSystem.showMessage?.(
                        "Solo se pueden eliminar casos de espectro desde acá. " +
                        "Los Linear Static se borran en Patrones de Carga.",
                        "warning",
                    );
                    break;
                }
                const items = cadSystem.responseSpectrumCases.items;
                const i = items.findIndex((x) => String(x.id) === String(f.rsId));
                if (i !== -1) {
                    items.splice(i, 1);
                    if (String(cadSystem.responseSpectrumCases.selectedCase) === String(f.rsId)) {
                        cadSystem.responseSpectrumCases.selectedCase = items[0]?.id || null;
                    }
                }
                break;
            }

            default:
                seguir = false;
        }
    }
}

// resources/js/cad/mixins/analysis/foundation.js
//
// FEATURE: "Calcular zapatas" — reutiliza el backend /zapatas2 que ya usan
// Safecito (cimentacion-v2) y Cimentación 2.0 (predim2), pero en vez de
// pedir las cargas por columna a mano, las lee del análisis ya calculado en
// este módulo (this.seismicResults). Ver resources/js/cad/engine/
// foundationContract.js para el mapeo de reacciones y la advertencia de
// ingeniería sobre la carga sísmica (envelope SRSS sin signo).
//
// Los gráficos de presión (uno por combinación de carga, estilo
// cimentacion-v2) reusan resources/js/etabs/charts/zapatas2Plot.js tal
// cual — mismo módulo que ya usa Cimentación 2.0 (predim2), sin duplicar
// la lógica de Plotly.

import {
  findSupportNodesInPolygon,
  buildZapataColumnRows,
  normalizeZapatas2Resultados,
  buildZapataPolygonProperties,
} from "../../engine/foundationContract.js";

import {
  classifyFooting,
  getColumnSectionSize,
  computeIsolatedOverhangs,
  computeIsolatedFootingMoment,
  computeCombinedFootingMoments,
  evaluateAxialExpression,
} from "../../engine/footingMoments.js";

import {
  computeFootingFlexuralSteel,
  suggestRebarSpacing,
} from "../../engine/footingSteel.js";

import {
  computePunchingShear,
  computeOneWayShear,
  computeCombinedOneWayShear,
} from "../../engine/footingShear.js";

import {
  requestZapatas2,
  DEFAULT_LOAD_COMBINATIONS,
} from "../../../safecito/zapatas2Core.js";

import {
  renderZapatas2Plot,
  purgeZapatas2Plot,
} from "../../../etabs/charts/zapatas2Plot.js";

import { Shape } from "../../model/shapes.js";

// Mismos valores por defecto que resources/js/etabs/components/DatosGeneralesPanel.vue
// (Cimentación 2.0 / predim2), para quedar consistentes en unidades: todo el
// pipeline /zapatas2 asume Tonf y metros, no SI. Siguen siendo un supuesto
// genérico, no un dato real de tu proyecto — ajustable desde el modal si se
// agrega ese campo más adelante.
const DEFAULT_DF = 2; // m
const DEFAULT_GAMMA_E = 1.8; // Tonf/m3 (peso específico del suelo)

export const foundationMixin = {
  async calculateZapatas() {
    const zapatas = (this.areas || []).filter((area) => area.areaType === "zapata");

    if (!zapatas.length) {
      this.showMessage("Dibuja al menos una zapata antes de calcular (botón Zapata en Dibujar).", "warning");
      return;
    }

    if (!this.seismicResults) {
      this.showMessage("Corre el análisis sísmico/estático antes de calcular zapatas.", "warning");
      return;
    }

    const polygons = [];
    const columnsById = new Map();
    // Paralelo a `polygons` (mismo índice) — clasificación aislada/combinada
    // y, si es aislada, su única columna, para calcular el momento de
    // diseño Mu una vez que tengamos σ (ver footingMoments.js).
    const footingsMeta = [];

    for (const zapata of zapatas) {
      const polygonPoints = zapata.points || [];

      if (polygonPoints.length < 3) {
        continue;
      }

      const supportNodes = findSupportNodesInPolygon(this.nodes || [], polygonPoints);

      if (!supportNodes.length) {
        this.showMessage(
          `La zapata ${zapata.id} no contiene ninguna columna con apoyo asignado. Dibújala alrededor de al menos una.`,
          "warning"
        );
        return;
      }

      supportNodes.forEach((node) => columnsById.set(Number(node.id), node));

      polygons.push({
        closed: true,
        nodes: polygonPoints.map((point) => ({ x: point.x, y: point.y })),
      });

      footingsMeta.push({
        type: classifyFooting(supportNodes),
        column: supportNodes.length === 1 ? supportNodes[0] : null,
        supportNodeIds: supportNodes.map((node) => Number(node.id)),
        polygonPoints,
      });
    }

    if (!polygons.length) {
      this.showMessage("Las zapatas dibujadas no tienen suficientes puntos.", "warning");
      return;
    }

    const columns = buildZapataColumnRows(Array.from(columnsById.values()), this);
    const polygonProperties = buildZapataPolygonProperties(zapatas);

    // Bloque 4: espesor/recubrimiento (de la sección de losa asignada a la
    // zapata, ver assign-dialogs.js `openAssignSlabSectionDialog`) y f'c/fy
    // (del material que esa sección referencia, Define > Propiedades de
    // Material) — datos de entrada para el acero/cortante que siguen
    // (Bloques 5-6), no participan en el cálculo de Mu ya hecho.
    const materials = this.materialProperties?.materials || [];
    polygonProperties.forEach((prop, index) => {
      const section = zapatas[index]?.section;
      const material = section ? materials.find((m) => m.name === section.material) : null;

      prop.designInputs = section
        ? {
            thicknessM: (Number(section.thickness) || 0) / 1000, // mm → m
            recubrimientoM: (Number(section.recubrimiento) || 0) / 1000, // mm → m
            fpc: Number(material?.fpc) || null,
            fy: Number(material?.fy) || null,
          }
        : null;
    });

    try {
      this.showMessage("Calculando zapatas...", "info");

      const response = await requestZapatas2(
        {
          columns,
          polygons,
          loadCombinations: DEFAULT_LOAD_COMBINATIONS,
          df: DEFAULT_DF,
          gammaE: DEFAULT_GAMMA_E,
        },
        {}
      );

      const normalizedPolygons = normalizeZapatas2Resultados(response.resultados);

      // Momento de diseño: Mu = σu×L²/2 (voladizo) para AISLADAS, viga
      // continua por brazos para COMBINADAS. Mismo índice/orden que
      // `polygons`.
      //
      // σ (polygon.max/min) es la presión BRUTA que devuelve /zapatas2,
      // que incluye la sobrecarga del suelo (γe×Df) sumada de forma
      // uniforme (ver calcularZapatas2EnPhp) — correcta para verificar
      // que el suelo aguante, pero NO para calcular la flexión de la
      // propia zapata: esa sobrecarga empuja hacia abajo en el mismo
      // punto donde el suelo empuja hacia arriba (el relleno de tierra
      // sobre la zapata), así que se cancela ahí mismo sin pasar por
      // ninguna columna. Se resta antes de usarla como carga de diseño
      // ("presión neta"), para no inflar Mu con algo que ninguna columna
      // tiene que resistir.
      const overburden = DEFAULT_GAMMA_E * DEFAULT_DF;
      const netSigma = (sigma) => Math.max(0, (Number(sigma) || 0) - overburden);

      // Bloque 5 — Acero por flexión: envuelve Mu (Bloque 3) con f'c/fy/
      // espesor/recubrimiento (Bloque 4, ya en polygonProperties[index].
      // designInputs) para dar el As requerido + Ø/espaciamiento sugerido.
      // Usa el PEOR Mu entre todas las combinaciones (envolvente de diseño)
      // — el refuerzo final de una zapata es UNO solo, no uno por combo.
      const buildSteelResult = (muTonM, designInputs) => {
        if (!designInputs) return null;
        const result = computeFootingFlexuralSteel({
          muTonM,
          fpcMPa: designInputs.fpc,
          fyMPa: designInputs.fy,
          thicknessM: designInputs.thicknessM,
          recubrimientoM: designInputs.recubrimientoM,
        });
        const rebar = result.as ? suggestRebarSpacing(result.as, designInputs.thicknessM) : null;
        return { ...result, rebar };
      };

      // Bloque 6 — Cortante: mismo criterio de envolvente que Bloque 5 (peor
      // caso entre las 11 combinaciones). Pu de una columna se evalúa con la
      // misma expresión (`combo.column1`) que ya usa footingMoments.js para
      // la viga continua — reutiliza pd1/pl1/sismo1 de `columns`, no inventa
      // un nuevo dato.
      const puEnvelope = (columnRow) => {
        if (!columnRow) return 0;
        return Math.max(
          ...DEFAULT_LOAD_COMBINATIONS.map((combo) =>
            evaluateAxialExpression(combo.column1, {
              pm: Number(columnRow.pd1) || 0,
              pv: Number(columnRow.pl1) || 0,
              ps: Number(columnRow.sismo1) || 0,
            })
          )
        );
      };
      const quEnvelope = (polygon) => Math.max(...DEFAULT_LOAD_COMBINATIONS.map((_, i) => netSigma(polygon.max?.[i])));

      normalizedPolygons.forEach((polygon, index) => {
        const meta = footingsMeta[index];
        if (!meta) return;

        // Contorno real de la zapata (no la nube de puntos de σ) — lo usa
        // canvas2d/zapataPressureLayer.js para recortar (clip) el pintado
        // al polígono exacto, sin desbordar el borde.
        polygon.points = meta.polygonPoints;

        // σmin<0 en cualquier combo = el suelo tendría que "jalar" la
        // zapata hacia abajo en esa zona, algo que el suelo no puede
        // hacer (el contacto suelo-zapata solo transmite compresión). En
        // la práctica significa que el área de apoyo REAL es menor que el
        // polígono dibujado (parte de la zapata se despega) — el método
        // lineal P/A±M/I ya no es válido ahí, hay que reposicionar/
        // agrandar la zapata, no solo reforzarla con más acero. Bloques
        // 3/5/6 igual usan σmax (nunca σmin) como envolvente uniforme, así
        // que sus números no quedan corrompidos por esto — pero el diseño
        // de ESTA zapata, tal como está dibujada, no es válido.
        if (polygonProperties[index]) {
          polygonProperties[index].hasNegativePressure = (polygon.min || []).some((v) => (Number(v) || 0) < 0);
        }

        if (meta.type === "isolated" && meta.column) {
          const columnSize = getColumnSectionSize(this.shapes || [], meta.column.id);
          const overhangs = computeIsolatedOverhangs(meta.polygonPoints, meta.column.position, columnSize);

          polygon.designMoments = DEFAULT_LOAD_COMBINATIONS.map((_, comboIndex) => {
            return computeIsolatedFootingMoment(overhangs, netSigma(polygon.max?.[comboIndex]));
          });

          const designInputs = polygonProperties[index]?.designInputs;
          const muXEnvelope = Math.max(...polygon.designMoments.map((m) => m.momentoVoladizoX));
          const muYEnvelope = Math.max(...polygon.designMoments.map((m) => m.momentoVoladizoY));

          if (polygonProperties[index]) {
            polygonProperties[index].steelDesign = designInputs
              ? {
                  type: "isolated",
                  x: buildSteelResult(muXEnvelope, designInputs),
                  y: buildSteelResult(muYEnvelope, designInputs),
                }
              : null;

            const columnRow = columns.find((c) => Number(c.column ?? c.id) === Number(meta.column.id));
            const quEnv = quEnvelope(polygon);

            polygonProperties[index].shearDesign = designInputs
              ? {
                  type: "isolated",
                  punching: computePunchingShear({
                    puTon: puEnvelope(columnRow),
                    quTonM2: quEnv,
                    columnBcm: columnSize.b * 100,
                    columnHcm: columnSize.h * 100,
                    fpcMPa: designInputs.fpc,
                    thicknessM: designInputs.thicknessM,
                    recubrimientoM: designInputs.recubrimientoM,
                  }),
                  oneWayX: computeOneWayShear({
                    overhangM: overhangs.Lx,
                    quTonM2: quEnv,
                    fpcMPa: designInputs.fpc,
                    thicknessM: designInputs.thicknessM,
                    recubrimientoM: designInputs.recubrimientoM,
                  }),
                  oneWayY: computeOneWayShear({
                    overhangM: overhangs.Ly,
                    quTonM2: quEnv,
                    fpcMPa: designInputs.fpc,
                    thicknessM: designInputs.thicknessM,
                    recubrimientoM: designInputs.recubrimientoM,
                  }),
                }
              : null;
          }
          return;
        }

        if (meta.type === "combined") {
          const columnsInPolygon = columns.filter((column) => meta.supportNodeIds.includes(Number(column.column)));
          const netSigmaByCombo = (polygon.max || []).map(netSigma);

          polygon.combinedMoments = computeCombinedFootingMoments(
            meta.polygonPoints,
            columnsInPolygon,
            DEFAULT_LOAD_COMBINATIONS,
            netSigmaByCombo
          );

          if (!polygonProperties[index]) return;

          const combined = polygon.combinedMoments;
          const designInputs = polygonProperties[index]?.designInputs;

          if (combined && !combined.supported) {
            polygonProperties[index].steelDesign = { type: "combined", needsReview: true };
            polygonProperties[index].shearDesign = { type: "combined", needsReview: true };
          } else if (designInputs && combined?.supported) {
            const allMoments = combined.legs.flatMap((leg) => leg.momentsByCombo || []);
            const positivoEnvelope = Math.max(...allMoments.map((m) => m.momentoPositivoMax));
            const negativoEnvelope = Math.min(...allMoments.map((m) => m.momentoNegativoMax));

            polygonProperties[index].steelDesign = {
              type: "combined",
              positivo: buildSteelResult(positivoEnvelope, designInputs),
              negativo: buildSteelResult(Math.abs(negativoEnvelope), designInputs),
            };

            const quEnv = quEnvelope(polygon);

            // El único brazo disponible (combined.supported ya garantiza
            // legs.length===1 — ver footingMoments.js: 2+ brazos vuelve
            // supported:false por ramificación). cortanteMax y width son
            // el mismo valor en cada entrada de momentsByCombo (width es
            // geometría pura, no depende de la combinación) — se toma el
            // envolvente del cortante igual que ya se hace con el momento.
            const legMoments = combined.legs[0]?.momentsByCombo || [];
            const cortanteEnvelope = Math.max(...legMoments.map((m) => m.cortanteMax ?? 0));
            const legWidthCm = (legMoments[0]?.width ?? 0) * 100;

            polygonProperties[index].shearDesign = {
              type: "combined",
              oneWay: computeCombinedOneWayShear({
                vuTon: cortanteEnvelope,
                widthCm: legWidthCm,
                fpcMPa: designInputs.fpc,
                thicknessM: designInputs.thicknessM,
                recubrimientoM: designInputs.recubrimientoM,
              }),
              punchingByColumn: columnsInPolygon.map((columnRow) => {
                const columnSize = getColumnSectionSize(this.shapes || [], columnRow.column ?? columnRow.id);
                return {
                  column: columnRow.column ?? columnRow.id,
                  result: computePunchingShear({
                    puTon: puEnvelope(columnRow),
                    quTonM2: quEnv,
                    columnBcm: columnSize.b * 100,
                    columnHcm: columnSize.h * 100,
                    fpcMPa: designInputs.fpc,
                    thicknessM: designInputs.thicknessM,
                    recubrimientoM: designInputs.recubrimientoM,
                  }),
                };
              }),
            };
          } else {
            polygonProperties[index].steelDesign = null;
            polygonProperties[index].shearDesign = null;
          }
        }
      });

      // Guardado para que el modal pueda pedir cada gráfico (uno por combo)
      // después de abrirse, vía this.renderZapataPlot().
      this._lastZapataCalculationResults = {
        normalizedPolygons,
        columns,
        loadCombinations: DEFAULT_LOAD_COMBINATIONS,
      };

      window.dispatchEvent(
        new CustomEvent("open-zapata-results-modal", {
          detail: {
            loadCombinations: DEFAULT_LOAD_COMBINATIONS,
            polygonProperties,
            df: DEFAULT_DF,
            gammaE: DEFAULT_GAMMA_E,
            columnsCount: columns.length,
          },
        })
      );
    } catch (error) {
      console.error("❌ Error calculando zapatas:", error);
      this.showMessage(error?.message || "No se pudo calcular la cimentación.", "error");
    }
  },

  /**
   * Llamado por zapata-results-modal.blade.php al abrir el modal y cada vez
   * que se cambia de pestaña de combinación. Un solo contenedor fijo:
   * Plotly.react() sobre el mismo elemento actualiza en vez de recrear, así
   * que cambiar de pestaña es barato (no vuelve a montar 11 gráficos).
   */
  renderZapataPlot(targetElementId, comboIndex) {
    const target = document.getElementById(targetElementId);
    if (!target || !this._lastZapataCalculationResults) return;

    renderZapatas2Plot(target, this._lastZapataCalculationResults, comboIndex).catch((error) => {
      console.error("No se pudo renderizar el gráfico de zapatas:", error);
    });
  },

  /** σmin/σmax (y Mu, aislada o combinada) por polígono para la combinación activa (tabla debajo del gráfico). */
  getZapataSummaryRows(comboIndex) {
    const polygons = this._lastZapataCalculationResults?.normalizedPolygons || [];

    return polygons.map((polygon) => {
      const combined = polygon.combinedMoments; // {supported, reason, legs} — ver footingMoments.js

      return {
        polygon: polygon.name,
        min: polygon.min?.[comboIndex] ?? null,
        max: polygon.max?.[comboIndex] ?? null,
        XC: polygon.XC,
        YC: polygon.YC,
        designMoment: polygon.designMoments?.[comboIndex] ?? null,
        // Un brazo por objeto: {momentoPositivoMax, momentoNegativoMax, beamAxis}
        combinedMoments: combined?.supported ? combined.legs.map((leg) => leg.momentsByCombo?.[comboIndex] ?? null) : [],
        combinedNeedsReview: Boolean(combined && !combined.supported),
      };
    });
  },

  /** Limpia el Plotly al cerrar el modal (evita fugas de memoria). */
  purgeZapataPlots(targetElementIds = []) {
    targetElementIds.forEach((id) => purgeZapatas2Plot(document.getElementById(id)));
  },

  /**
   * Centra una zapata ya dibujada sobre su(s) columna(s) — mueve todo el
   * polígono para que su centroide geométrico (el mismo que usa /zapatas2
   * para calcular σ, ver calcularZapatas2EnPhp / zapatas2.m) coincida con
   * la posición real de la columna. Sigue siendo la práctica recomendada
   * (más económico, menos excentricidad real en la zapata) — pero desde
   * la corrección de excentricidad columna-centroide en ambos scripts,
   * una zapata NO centrada ya calcula σ correctamente en vez de dar un
   * resultado optimista sin avisar.
   *
   * Réplica manual de la herramienta "Mover" del editor original del
   * cliente (adm_safecito.js), que alinea el centroide de la forma
   * seleccionada con el punto medio entre dos marcadores clicados — acá
   * se automatiza usando directamente la(s) columna(s) que ya están
   * dentro del polígono, en vez de tener que hacer clic dos veces.
   *
   * Aun con la excentricidad ya corregida en la fórmula, centrar sigue
   * siendo mejor práctica: una zapata descentrada a propósito es un caso
   * de diseño distinto ("zapata excéntrica", típicamente con viga de
   * conexión) que este método rígido simplificado no cubre — acá solo se
   * garantiza que la PRESIÓN se calcule bien si no está centrada, no que
   * el diseño resultante sea el más económico.
   */
  centerZapataOnColumn() {
    // this.selectedArea solo existe DENTRO del estado de edición
    // (ReshapeObjectState en canvas2d/states.js) — no en el sistema CAD en
    // general. getSelectedAreasForAssign() (assign-dialogs.js) ya resuelve
    // esto bien para código de menú/toolbar, revisando todas las fuentes
    // de selección reales; se reutiliza en vez de inventar otra.
    const zapatas = (this.getSelectedAreasForAssign?.() || []).filter((area) => area.areaType === "zapata");

    if (!zapatas.length) {
      this.showMessage("Selecciona una zapata primero.", "warning");
      return;
    }

    let centeredCount = 0;

    zapatas.forEach((zapata) => {
      const supportNodes = findSupportNodesInPolygon(this.nodes || [], zapata.points || []);
      if (!supportNodes.length) return;

      const targetX = supportNodes.reduce((sum, node) => sum + node.position.x, 0) / supportNodes.length;
      const targetY = supportNodes.reduce((sum, node) => sum + node.position.y, 0) / supportNodes.length;

      Shape.prototype.calcularPropiedades.call(zapata);
      const { XC, YC } = zapata.propiedades();

      const dX = targetX - XC;
      const dY = targetY - YC;

      zapata.points.forEach((point) => {
        point.x += dX;
        point.y += dY;
      });

      centeredCount++;
    });

    if (!centeredCount) {
      this.showMessage("La zapata seleccionada no contiene ninguna columna con apoyo asignado.", "warning");
      return;
    }

    this.markAnalysisResultsOutdated?.("Se centró la zapata en su columna.");
    this.showMessage(
      centeredCount === 1 ? "Zapata centrada en su columna." : `${centeredCount} zapatas centradas en sus columnas.`,
      "success"
    );
  },
};

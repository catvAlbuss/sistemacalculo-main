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
  computeIsolatedMomentAtPoint,
  computeCombinedFootingMoments,
  evaluateAxialExpression,
  lookupMomentProfile,
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
  flattenNumeric,
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
        // Referencia al area/zapata original (no solo sus puntos) — para
        // poder guardarle el σmax encima más abajo, y así Assign > Carga
        // Uniforme de Losa lo pueda autocompletar por ID sin tener que
        // buscar por índice (ver conversación: autocompletar Csuelo).
        areaRef: zapata,
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
      //
      // TEMPORAL (ver conversación): el cliente está validando este flujo
      // aplicando σ BRUTA (sin restar el relleno) como carga directa sobre
      // un shell en ETABS — para poder comparar Mu manzana con manzana
      // mientras se corre el flujo completo, se desactiva la resta acá
      // también. La resta sigue siendo lo técnicamente correcto (por eso
      // se deja el mecanismo intacto, no se borra) — cuando se calibre
      // contra el resultado neto, volver `APPLY_OVERBURDEN_DEDUCTION` a
      // `true` reactiva el comportamiento de siempre sin tocar nada más.
      const APPLY_OVERBURDEN_DEDUCTION = false;
      const overburden = DEFAULT_GAMMA_E * DEFAULT_DF;
      const netSigma = (sigma) => {
        const raw = Number(sigma) || 0;
        return Math.max(0, APPLY_OVERBURDEN_DEDUCTION ? raw - overburden : raw);
      };

      // TEMPORAL (ver conversación, mismo criterio de "pendiente de
      // calibrar con el cliente" que APPLY_OVERBURDEN_DEDUCTION): el σmax
      // que se autocompleta en Assign > Carga Uniforme de Losa (Csuelo)
      // usa por ahora SOLO la Combinación 1 (índice 0), no la envolvente
      // de las 11 — para que coincida con la combinación puntual que se ve
      // en la pestaña activa del modal de resultados al validar contra
      // ETABS. Cuando se defina con el cliente si el flujo de Csuelo debe
      // usar el peor caso de diseño en vez de una combinación puntual,
      // volver esto a `true` reactiva la envolvente sin tocar nada más.
      const USE_ENVELOPE_FOR_SIGMA_MAX_AUTOFILL = false;

      // TEMPORAL (ver conversación — confirmado con el papel del ingeniero,
      // no una suposición): su método del voladizo mide L desde el borde
      // de la zapata hasta el CENTRO de la columna, ignorando el ancho de
      // la columna (a diferencia de nuestro método, que resta la mitad del
      // ancho para medir hasta la CARA — la sección crítica que define
      // E.060/ACI). A diferencia de los otros dos toggles de arriba, este
      // arranca EN `true` a propósito — el cliente pidió activarlo ya para
      // la prueba y mostrárselo. Apaga esto (`false`) para volver al
      // método riguroso (a la cara) en cualquier momento.
      //
      // Cómo funciona: getColumnSectionSize ya devuelve {b:0,h:0} cuando
      // una columna no tiene sección asignada, y computeIsolatedOverhangs/
      // computeIsolatedMomentAtPoint YA manejan ese caso correctamente
      // (dan L completo hasta el centro) — no hubo que tocar
      // footingMoments.js, solo forzar ese mismo "sin ancho" para TODAS
      // las columnas acá, no solo las que de verdad no tienen sección.
      // OJO: esto NO debe usarse para punzonamiento (Bloque 6) — ahí el
      // ancho real de la columna sí es físicamente necesario, por eso
      // `columnSize` (la variable real) se sigue usando tal cual en
      // computePunchingShear más abajo, sin pasar por este toggle.
      const MEASURE_L_TO_COLUMN_CENTER = true;

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

        // σmax BRUTA, guardada directo en el area/zapata (no en `polygon`,
        // que se descarta al cerrar el modal) — para que Assign > Carga
        // Uniforme de Losa la pueda autocompletar por ID sin tener que
        // volver a calcular nada. A propósito NO usa netSigma (que hoy está
        // en modo "bruta" por el toggle temporal de calibración) — esto
        // siempre refleja σmax tal cual, sea cual sea el estado de ese
        // toggle, porque es justo lo que pidió el cliente para su Csuelo
        // ("esa presión en sí"). Combinación 1 por ahora, no la envolvente
        // de las 11 — ver USE_ENVELOPE_FOR_SIGMA_MAX_AUTOFILL arriba.
        if (meta.areaRef) {
          const rawMaxima = (polygon.max || []).map((v) => Number(v) || 0);
          meta.areaRef._sigmaMaxTonM2 = !rawMaxima.length
            ? null
            : USE_ENVELOPE_FOR_SIGMA_MAX_AUTOFILL
              ? Math.max(...rawMaxima)
              : rawMaxima[0];
        }

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
          // Ver MEASURE_L_TO_COLUMN_CENTER arriba: {b:0,h:0} hace que
          // computeIsolatedOverhangs/computeIsolatedMomentAtPoint midan L
          // hasta el centro de la columna en vez de su cara — mismo camino
          // que ya usan cuando una columna no tiene sección asignada.
          //
          // A propósito se calculan DOS overhangs distintos: `overhangs`
          // (con momentColumnSize) alimenta SOLO el momento (Mu de este
          // bloque + el mapa 2D) — es lo único que pidió comparar el
          // ingeniero. `overhangsForShear` (con la columna REAL) alimenta
          // el cortante por flexión de Bloque 6 más abajo, que sigue
          // usando la cara real de la columna — el toggle no se pidió para
          // cortante, y cambiarlo ahí también sería un efecto secundario
          // no solicitado (el cortante crítico SÍ depende físicamente de
          // dónde está la cara real de la columna, no es una simplificación
          // razonable ignorarla ahí).
          const momentColumnSize = MEASURE_L_TO_COLUMN_CENTER ? { b: 0, h: 0 } : columnSize;
          const overhangs = computeIsolatedOverhangs(meta.polygonPoints, meta.column.position, momentColumnSize);
          const overhangsForShear = MEASURE_L_TO_COLUMN_CENTER
            ? computeIsolatedOverhangs(meta.polygonPoints, meta.column.position, columnSize)
            : overhangs;

          polygon.designMoments = DEFAULT_LOAD_COMBINATIONS.map((_, comboIndex) => {
            return computeIsolatedFootingMoment(overhangs, netSigma(polygon.max?.[comboIndex]));
          });

          // Mapa de momento 2D: mismo principio que el mapa de presión de
          // Bloque 2 (zapataPressureLayer.js) — se evalúa la MISMA fórmula
          // de voladizo de Mu, punto por punto, sobre la nube de σ que ya
          // trae /zapatas2 (XX/YY), en vez de solo en el borde. Ver
          // computeIsolatedMomentAtPoint (footingMoments.js).
          {
            const xs = flattenNumeric(polygon.XX);
            const ys = flattenNumeric(polygon.YY);
            const mxByCombo = [];
            const myByCombo = [];

            DEFAULT_LOAD_COMBINATIONS.forEach((_, comboIndex) => {
              const sigma = netSigma(polygon.max?.[comboIndex]);
              const mxRow = new Array(xs.length);
              const myRow = new Array(xs.length);

              for (let i = 0; i < xs.length; i++) {
                const point = computeIsolatedMomentAtPoint(xs[i], ys[i], meta.column.position, momentColumnSize, sigma, overhangs.bounds);
                mxRow[i] = point.mx;
                myRow[i] = point.my;
              }

              mxByCombo.push(mxRow);
              myByCombo.push(myRow);
            });

            polygon.momentField = { type: "isolated", mx: mxByCombo, my: myByCombo };
          }

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
                    overhangM: overhangsForShear.Lx,
                    quTonM2: quEnv,
                    fpcMPa: designInputs.fpc,
                    thicknessM: designInputs.thicknessM,
                    recubrimientoM: designInputs.recubrimientoM,
                  }),
                  oneWayY: computeOneWayShear({
                    overhangM: overhangsForShear.Ly,
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

          // Mapa de momento 2D para combinadas: reutiliza el momentProfile
          // que ya trae cada momentsByCombo[i] (footingMoments.js) —
          // proyecta cada punto de la nube de σ sobre el eje de la viga y
          // busca su momento con lookupMomentProfile (vecino más cercano).
          // Constante a lo ancho de la viga (mismo criterio 1D que ya usa
          // el propio cálculo del momento envolvente) — se ve como franjas
          // en vez del patrón concéntrico de las aisladas, y es honesto:
          // así es exactamente la simplificación que ya hacíamos.
          if (polygon.combinedMoments?.supported) {
            const leg = polygon.combinedMoments.legs[0];
            const xs = flattenNumeric(polygon.XX);
            const ys = flattenNumeric(polygon.YY);
            const valueByCombo = DEFAULT_LOAD_COMBINATIONS.map((_, comboIndex) => {
              const combo = leg.momentsByCombo[comboIndex];
              const axis = combo?.beamAxis;
              const origin = Number(combo?.origin) || 0;
              const profile = combo?.momentProfile;

              return xs.map((x, i) => {
                const localPos = (axis === "x" ? x : ys[i]) - origin;
                return lookupMomentProfile(profile, localPos);
              });
            });

            polygon.momentField = { type: "combined", value: valueByCombo };
          }

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

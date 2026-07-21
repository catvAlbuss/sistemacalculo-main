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
  requestZapatas2,
  DEFAULT_LOAD_COMBINATIONS,
} from "../../../safecito/zapatas2Core.js";

import {
  renderZapatas2Plot,
  purgeZapatas2Plot,
} from "../../../etabs/charts/zapatas2Plot.js";

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
    }

    if (!polygons.length) {
      this.showMessage("Las zapatas dibujadas no tienen suficientes puntos.", "warning");
      return;
    }

    const columns = buildZapataColumnRows(Array.from(columnsById.values()), this.seismicResults);
    const polygonProperties = buildZapataPolygonProperties(zapatas);

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

      // Guardado para que el modal pueda pedir cada gráfico (uno por combo)
      // después de abrirse, vía this.renderZapataPlot().
      this._lastZapataCalculationResults = {
        normalizedPolygons: normalizeZapatas2Resultados(response.resultados),
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

  /** σmin/σmax por polígono para la combinación activa (tabla debajo del gráfico). */
  getZapataSummaryRows(comboIndex) {
    const polygons = this._lastZapataCalculationResults?.normalizedPolygons || [];

    return polygons.map((polygon) => ({
      polygon: polygon.name,
      min: polygon.min?.[comboIndex] ?? null,
      max: polygon.max?.[comboIndex] ?? null,
      XC: polygon.XC,
      YC: polygon.YC,
    }));
  },

  /** Limpia el Plotly al cerrar el modal (evita fugas de memoria). */
  purgeZapataPlots(targetElementIds = []) {
    targetElementIds.forEach((id) => purgeZapatas2Plot(document.getElementById(id)));
  },
};

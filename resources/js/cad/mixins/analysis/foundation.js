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

import Swal from "sweetalert2";

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
  computeTrapezoidalFootingGeometry,
  computeLFootingGeometry,
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

import {
  isAxisAlignedRectangularFooting,
  fetchZapataShellDesignReference,
  fetchZapataShellCombinedDesignReference,
  fetchZapataShellTrapezoidalDesignReference,
  fetchZapataShellLDesignReference,
  fetchZapataShellPoligonoDesignReference,
} from "../../engine/zapataShellDesign.js";

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

    // AGREGADO (ver conversación: cimentacion-v2/Safecito ya deja editar
    // Df/γe en su propio formulario — el CAD se había quedado con el valor
    // fijo). `this.zapataDf`/`this.zapataGammaE` se editan desde la barra
    // (grupo "Cimentación") y arrancan en los mismos valores por defecto
    // que ya estaban (2 y 1.8) — si por algún motivo llegan vacíos/0,
    // cae de vuelta a esas mismas constantes, nunca a un valor sin sentido.
    const df = Number(this.zapataDf) || DEFAULT_DF;
    const gammaE = Number(this.zapataGammaE) || DEFAULT_GAMMA_E;

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

      const supportNodes = findSupportNodesInPolygon(this.nodes || [], polygonPoints, zapata.z);

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
            // AGREGADO (ver conversación: modelo real del cliente usa
            // ν=0.15, no el 0.2 que traía por defecto el solver de
            // elementos finitos) — Bloque 3b lo usa si está definido;
            // Bloques 5/6 no lo necesitan, se queda ahí sin usar.
            poissonRatio: Number(material?.poissonRatio) || null,
          }
        : null;
    });

    // AGREGADO (ver conversación): mismo popup de carga (SweetAlert temeado
    // oscuro, background/color fijados) que ya usa "Ejecutar Análisis"
    // (ver mixins/analysis/seismic/core.js) — un solo modal predeterminado
    // en todo el sistema, en vez de un componente Blade nuevo (que además
    // tenía un bug real: x-show de Alpine pisaba el display:flex inline,
    // dejando la tarjeta pegada arriba en vez de centrada — ver
    // conversación). El cálculo ahora incluye llamadas al motor de
    // elementos finitos (Bloque 3b/6b, ~1-2s por zapata aislada
    // rectangular) y puede tardar varios segundos; sin esto parecía que
    // el botón no hacía nada.
    Swal.fire({
      title: "Calculando zapatas...",
      html: "<div style='color:#94a3b8'>Presión, momento y cortante (elementos finitos) — puede tardar unos segundos.</div>",
      allowOutsideClick: false,
      background: "#1a2035", color: "#e2e8f0",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await requestZapatas2(
        {
          columns,
          polygons,
          loadCombinations: DEFAULT_LOAD_COMBINATIONS,
          df,
          gammaE,
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
      const overburden = gammaE * df;
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

      // Bloque 3b/6b — Momento (M11/M22/M12) Y cortante (V13/V23) de
      // referencia (elementos finitos reales, shell/OpenSeesPy) para
      // zapatas aisladas rectangulares: UNA sola llamada por zapata (ver
      // conversación: antes eran 2 llamadas separadas, fusionadas porque
      // el cortante ya necesitaba la malla fina que también sirve para el
      // momento). Se disparan en paralelo dentro del forEach de abajo y se
      // esperan todas juntas antes de abrir el modal (ver zapataShellDesign.js).
      const shellDesignPromises = [];
      // Bloque 3b (combinadas) — mismo principio que shellDesignPromises,
      // pero para zapata combinada tipo viga recta (ver
      // calcular_zapata_shell_combinada en zapata_shell_solver.py).
      const shellCombinedDesignPromises = [];
      // Bloque 3b (combinadas TRAPEZOIDALES) — mismo principio, pero para
      // ancho variable (ver calcular_zapata_shell_trapezoidal_combinada).
      const shellTrapezoidalDesignPromises = [];
      // Bloque 3b (combinadas EN L) — mismo principio, pero con un hueco en
      // el rincón faltante (ver calcular_zapata_shell_L_combinada).
      const shellLDesignPromises = [];

      // AGREGADO (ver conversación, hallazgo del mismo día validando
      // trapezoidal): la malla necesita elementos aproximadamente
      // CUADRADOS para converger bien -- usar `zapataShellMeshN` igual
      // para nx Y ny sin importar la proporción largo/ancho de la zapata
      // da elementos muy alargados en zapatas combinadas típicas (ej. F10,
      // 12x2.5m, alargados ~4.8:1) -- confirmado hoy que eso puede dar
      // valores menos confiables que una malla proporcional (mismo
      // fenómeno, no una singularidad de columna). `longitud`/`ancho` son
      // las dos dimensiones reales de la zapata (no necesariamente X/Y
      // globales -- para trapezoidal es longitud del eje y ancho
      // promedio); se usa `zapataShellMeshN` como resolución del lado
      // LARGO y se deriva el lado corto proporcional, para mantener el
      // aspect ratio de cada elemento cerca de 1:1.
      const mallaProporcional = (longitud, ancho) => {
        const nLargo = this.zapataShellMeshN;
        const dimLarga = Math.max(longitud, ancho) || 1;
        const dimCorta = Math.min(longitud, ancho) || dimLarga;
        const nCorto = Math.max(4, Math.round(nLargo * (dimCorta / dimLarga)));
        return longitud >= ancho ? { nx: nLargo, ny: nCorto } : { nx: nCorto, ny: nLargo };
      };

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

          // Bloque 2b — Capacidad portante del suelo: hasta ahora el sistema
          // calculaba σmax pero nunca decía si el suelo la aguanta (ver
          // conversación con el cliente). sigmaAdmisible es un dato POR
          // ZAPATA (cada una puede caer en una zona distinta del estudio de
          // suelos), se guarda directo en el area (zapata.sigmaAdmisible,
          // editable desde el modal de resultados vía
          // setZapataSigmaAdmisible) — null mientras el ingeniero no lo
          // haya definido, y entonces bearingCheck también queda null (no
          // se inventa un "OK" sin dato real). Usa la misma envolvente
          // (peor combinación de las 11) que ya usa Cortante, no solo la
          // combinación 1 — el chequeo de capacidad portante debe ser
          // contra el peor caso, no uno cualquiera.
          const sigmaAdmisible = Number(zapatas[index]?.sigmaAdmisible) || null;
          const sigmaMaxEnvelope = quEnvelope(polygon);
          polygonProperties[index].sigmaMaxEnvelope = sigmaMaxEnvelope;
          polygonProperties[index].sigmaAdmisible = sigmaAdmisible;
          polygonProperties[index].bearingCheck = sigmaAdmisible
            ? { ok: sigmaMaxEnvelope <= sigmaAdmisible, ratio: sigmaMaxEnvelope / sigmaAdmisible }
            : null;
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
                const point = computeIsolatedMomentAtPoint(xs[i], ys[i], meta.column.position, momentColumnSize, sigma, meta.polygonPoints, overhangs.bounds);
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

          // AGREGADO (ver conversación): envolvente del Mu del método
          // rígido (Bloque 3), expuesta directo en polygonProperties para
          // mostrarla en el modal junto al Bloque 3b (antes solo se usaba
          // internamente para alimentar el acero de Bloque 5, sin quedar
          // accesible como dato propio).
          if (polygonProperties[index]) {
            polygonProperties[index].rigidMoment = { muXEnvelope, muYEnvelope };
          }

          // Bloque 3b — momento de referencia por elementos finitos, SOLO
          // si la zapata es un rectángulo alineado a los ejes (ver
          // isAxisAlignedRectangularFooting): el solver arma su malla en
          // coordenadas globales, así que un polígono rotado/triangular/
          // trapezoidal daría una malla incorrecta si se le pasara igual.
          const polygonArea = Number(polygonProperties[index]?.properties?.A) || 0;
          if (isAxisAlignedRectangularFooting(meta.polygonPoints, overhangs.bounds, polygonArea)) {
            const bounds = overhangs.bounds;
            // A propósito usa `columnSize` (columna REAL), no
            // `momentColumnSize` -- el toggle "medir hasta el centro" solo
            // aplica al método rígido (overhangs de arriba); tanto el
            // momento como el cortante de elementos finitos siempre usan
            // la cara real de la columna.
            shellDesignPromises.push({
              index,
              polygon,
              bounds,
              promise: fetchZapataShellDesignReference({
                Lx: bounds.maxX - bounds.minX,
                Ly: bounds.maxY - bounds.minY,
                columnaX: meta.column.position.x - bounds.minX,
                columnaY: meta.column.position.y - bounds.minY,
                columnaBx: columnSize.b,
                columnaBy: columnSize.h,
                thicknessM: designInputs?.thicknessM,
                recubrimientoM: designInputs?.recubrimientoM,
                fpcMPa: designInputs?.fpc,
                nu: designInputs?.poissonRatio,
                nx: this.zapataShellMeshN,
                ny: this.zapataShellMeshN,
                q: quEnvelope(polygon),
              }),
            });
          } else {
            // AGREGADO (ver conversación): zapata aislada NO rectangular
            // (triangular, trapezoidal, poligono simple) -- el método
            // rígido de arriba (computeIsolatedFootingMoment) asume 2
            // voladizos independientes de ANCHO CONSTANTE, que se
            // confirmó con datos reales que da 49-519% de error cuando el
            // ancho de la zapata varía a lo largo del voladizo (justo
            // estas formas). Este FEM (ShellDKGT, malla en abanico desde
            // el primer vértice -- ver calcular_zapata_shell_poligono_
            // aislado) lo reemplaza, validado 1-16% contra los mismos
            // casos reales. Solo aplica a formas CONVEXAS (el backend
            // devuelve success:false si la columna cae fuera de la
            // triangulación en abanico, ej. una L con vértice reflejo --
            // esa forma sigue sin Bloque 3b, como ya era el caso).
            shellDesignPromises.push({
              index,
              polygon,
              bounds: null,
              promise: fetchZapataShellPoligonoDesignReference({
                puntos: meta.polygonPoints,
                columnaX: meta.column.position.x,
                columnaY: meta.column.position.y,
                columnaBx: columnSize.b,
                columnaBy: columnSize.h,
                thicknessM: designInputs?.thicknessM,
                recubrimientoM: designInputs?.recubrimientoM,
                fpcMPa: designInputs?.fpc,
                nu: designInputs?.poissonRatio,
                q: quEnvelope(polygon),
              }),
            });
          }

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

            // AGREGADO (ver conversación): zapata combinada EN L -- a
            // diferencia de Bloque 5/6 (acero/cortante, que sí necesitan el
            // método rígido y por eso quedan needsReview arriba), el FEM
            // (Bloque 3b) SÍ puede calcular esto con una sola malla sobre
            // el bounding box completo, con un hueco en el rincón faltante
            // (ver calcular_zapata_shell_L_combinada) -- no depende de que
            // el método rígido pueda separar la L en brazos independientes.
            if (combined.reason === "branching") {
              const geo = computeLFootingGeometry(meta.polygonPoints);
              if (geo && geo.Lx > 0 && geo.Ly > 0) {
                const columnasFemL = columnsInPolygon.map((columnRow) => {
                  const columnSize = getColumnSectionSize(this.shapes || [], columnRow.column ?? columnRow.id);
                  return {
                    x: Number(columnRow.x) - geo.originX,
                    y: Number(columnRow.y) - geo.originY,
                    bx: columnSize.b,
                    by: columnSize.h,
                  };
                });

                const mallaL = mallaProporcional(geo.Lx, geo.Ly);

                shellLDesignPromises.push({
                  index,
                  polygon,
                  promise: fetchZapataShellLDesignReference({
                    Lx: geo.Lx,
                    Ly: geo.Ly,
                    notchX: geo.notchX,
                    notchY: geo.notchY,
                    notchEsMaxX: geo.notchEsMaxX,
                    notchEsMaxY: geo.notchEsMaxY,
                    columnas: columnasFemL,
                    thicknessM: polygonProperties[index]?.designInputs?.thicknessM,
                    recubrimientoM: polygonProperties[index]?.designInputs?.recubrimientoM,
                    fpcMPa: polygonProperties[index]?.designInputs?.fpc,
                    nu: polygonProperties[index]?.designInputs?.poissonRatio,
                    nx: mallaL.nx,
                    ny: mallaL.ny,
                    q: quEnvelope(polygon),
                  }),
                });
              }
            }
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

            // Bloque 3b (combinadas) — momento de referencia por elementos
            // finitos, mismo criterio que Bloque 3b de aisladas: SOLO si es
            // un brazo recto (no trapezoidal -- leg:null en ese caso) y el
            // polígono es rectángulo alineado a ejes (el solver arma su
            // malla en coordenadas globales).
            //
            // AGREGADO (ver conversación, caso F12): a propósito NO se
            // sustituye acá ningún valor con el método rígido cuando el FEM
            // marca 'region_d' -- mezclar el signo del momento rígido
            // (convención propia de computeContinuousBeamMoment, pensada
            // para el envolvente sagging/hogging de la viga) con el signo
            // de la placa FEM (Mx/My tipo ETABS) sin una verificación
            // cuidadosa podría introducir un número mal firmado, peor que
            // no mostrar nada. La cara marcada 'region_d' queda en null y
            // el modal ya muestra aparte el momento del método rígido
            // (steelDesign/rigidMoment) para que el ingeniero lo revise ahí.
            const leg = combined.legs[0]?.leg;
            if (
              leg &&
              isAxisAlignedRectangularFooting(meta.polygonPoints, leg, polygonProperties[index]?.properties?.A)
            ) {
              const columnasFem = columnsInPolygon.map((columnRow) => {
                const columnSize = getColumnSectionSize(this.shapes || [], columnRow.column ?? columnRow.id);
                return {
                  x: Number(columnRow.x) - leg.minX,
                  y: Number(columnRow.y) - leg.minY,
                  bx: columnSize.b,
                  by: columnSize.h,
                };
              });

              const mallaRect = mallaProporcional(leg.maxX - leg.minX, leg.maxY - leg.minY);

              shellCombinedDesignPromises.push({
                index,
                polygon,
                promise: fetchZapataShellCombinedDesignReference({
                  Lx: leg.maxX - leg.minX,
                  Ly: leg.maxY - leg.minY,
                  columnas: columnasFem,
                  thicknessM: designInputs.thicknessM,
                  recubrimientoM: designInputs.recubrimientoM,
                  fpcMPa: designInputs.fpc,
                  nu: designInputs.poissonRatio,
                  nx: mallaRect.nx,
                  ny: mallaRect.ny,
                  q: quEnv,
                }),
              });
            } else if (!leg) {
              // AGREGADO (ver conversación): zapata combinada TRAPEZOIDAL
              // (leg:null es la marca que usa computeCombinedFootingMoments
              // para este caso) -- mismo principio que el brazo recto de
              // arriba, pero con calcular_zapata_shell_trapezoidal_combinada
              // (ancho variable). computeTrapezoidalFootingGeometry da el
              // eje/longitud/anchos en cada extremo y la línea central real
              // del trapecio (exacta, no aproximada) para expresar cada
              // columna como OFFSET respecto a esa línea -- el solver de
              // placa espera columnas centradas en y=0 por convención.
              const geo = computeTrapezoidalFootingGeometry(meta.polygonPoints);
              if (geo.length > 0 && geo.B0 > 0 && geo.B1 > 0) {
                const columnasFemTrap = columnsInPolygon.map((columnRow) => {
                  const columnSize = getColumnSectionSize(this.shapes || [], columnRow.column ?? columnRow.id);
                  const pos = (geo.beamAxis === "x" ? Number(columnRow.x) : Number(columnRow.y)) - geo.origin;
                  const perp = geo.beamAxis === "x" ? Number(columnRow.y) : Number(columnRow.x);
                  const centerlineAtPos = geo.center0 + (geo.center1 - geo.center0) * (pos / geo.length);
                  return {
                    x: pos,
                    y: perp - centerlineAtPos,
                    bx: columnSize.b,
                    by: columnSize.h,
                  };
                });

                // El "ancho" de referencia para mantener elementos ~cuadrados
                // es el promedio de B0/B1 (la zapata no tiene un ancho único).
                const mallaTrap = mallaProporcional(geo.length, (geo.B0 + geo.B1) / 2);

                shellTrapezoidalDesignPromises.push({
                  index,
                  polygon,
                  promise: fetchZapataShellTrapezoidalDesignReference({
                    L: geo.length,
                    B0: geo.B0,
                    B1: geo.B1,
                    columnas: columnasFemTrap,
                    thicknessM: designInputs.thicknessM,
                    recubrimientoM: designInputs.recubrimientoM,
                    fpcMPa: designInputs.fpc,
                    nu: designInputs.poissonRatio,
                    nx: mallaTrap.nx,
                    ny: mallaTrap.ny,
                    q: quEnv,
                  }),
                });
              }
            }
          } else {
            polygonProperties[index].steelDesign = null;
            polygonProperties[index].shearDesign = null;
          }
        }
      });

      // Bloque 3b/6b — se esperan todas las llamadas al motor de elementos
      // finitos juntas (en paralelo, ya disparadas dentro del forEach de
      // arriba) antes de abrir el modal. Si alguna falla, no bloquea nada:
      // fetchZapataShellDesignReference() nunca lanza, siempre devuelve
      // { ok:false, error } en ese caso.
      if (shellDesignPromises.length) {
        const results = await Promise.all(shellDesignPromises.map((p) => p.promise));
        results.forEach((result, i) => {
          const { index, polygon: shellPolygon, bounds: shellBounds } = shellDesignPromises[i];
          if (!polygonProperties[index]) return;

          // AGREGADO (ver conversación): el modal (zapata-results-modal.
          // blade.php) sigue esperando 2 objetos separados
          // (shellMomentReference/shellShearReference, mismas claves de
          // siempre) — se derivan los dos de esta ÚNICA respuesta, así no
          // hubo que tocar el modal al fusionar las llamadas.
          polygonProperties[index].shellMomentReference = {
            ok: result.ok,
            momentoDiseno: result.momentoDiseno,
            advertencia: result.advertencia,
            error: result.error,
          };
          // AGREGADO (ver conversación): la zapata poligonal aislada
          // (triangular/trapezoidal) responde ok:true de MOMENTO pero
          // nunca trae cortanteDiseno (Bloque 6 sigue con método rígido
          // para esa forma, a propósito) -- sin este chequeo el modal
          // mostraría "Cortante FEM" como disponible con valores vacíos
          // en vez del mensaje de "no disponible".
          polygonProperties[index].shellShearReference = {
            ok: result.ok && !!result.cortanteDiseno,
            cortanteDiseno: result.cortanteDiseno,
            advertencia: result.advertencia,
            error: result.ok && !result.cortanteDiseno
              ? "esta forma solo tiene FEM de momento por ahora (método rígido para cortante)"
              : result.error,
          };

          // AGREGADO (ver conversación): para el "Diagrama de Resultantes 2D", las
          // zapatas aisladas rectangulares con Bloque 3b/6b exitoso usan
          // el campo REAL de elementos finitos en vez de la aproximación
          // del método rígido — reemplaza momentField solo para ESTA
          // zapata (las demás formas siguen con el método rígido de
          // siempre, ver isAxisAlignedRectangularFooting más arriba).
          // UNA sola grilla para mx/my/mxy/v13/v23 (antes momento y
          // cortante tenían grillas separadas, por venir de mallas
          // distintas — ya no, desde la fusión). Coordenadas LOCALES
          // (0..Lx, 0..Ly) del solver — se suman a bounds.min para
          // volverlas globales, iguales a polygon.points.
          if (result.ok && result.campo && shellPolygon) {
            shellPolygon.momentField = {
              type: "isolated-fem",
              x: result.campo.x.map((x) => x + shellBounds.minX),
              y: result.campo.y.map((y) => y + shellBounds.minY),
              mx: result.campo.Mx,
              my: result.campo.My,
              mxy: result.campo.Mxy,
              v13: result.campo.V13,
              v23: result.campo.V23,
              // AGREGADO (ver conversación): MMax/MMin/VMax -- resultantes
              // derivadas, mismo criterio que el selector "Component" de
              // ETABS (ver zapata_shell_solver.py).
              mmax: result.campo.MMax,
              mmin: result.campo.MMin,
              vmax: result.campo.VMax,
            };
          }

          // Bloque 6 — arma un objeto {vuTon, phiVcTon, ratio, ok} con la
          // MISMA forma que ya produce computeOneWayShear() (footingShear.js,
          // método rígido) — el modal sigue usando el mismo shearLine()
          // sin cambios, solo prefiere este valor (más preciso, ~2.4-4.6%
          // vs ETABS real) cuando está disponible.
          //
          // AGREGADO (ver conversación): X e Y se evalúan INDEPENDIENTES
          // — cd.V13_diseno/V23_diseno pueden venir `null` si el volado
          // neto de ESA dirección es menor que el peralte efectivo d (la
          // sección crítica caería fuera de la zapata; antes esto daba un
          // número sin sentido, ~1417 Tn/m, en vez de nada — ver
          // zapata_shell_solver.py). Cuando viene null, no se pisa
          // oneWayXFem/oneWayYFem — el modal cae de vuelta al método
          // rígido para ESA dirección puntual (que ya da Vu=0 en ese
          // caso, criterio de que ahí gobierna punzonamiento, no cortante
          // de viga), sin afectar la otra dirección si esa sí es válida.
          if (result.ok && result.cortanteDiseno && polygonProperties[index].shearDesign?.type === "isolated") {
            const cd = result.cortanteDiseno;
            if (cd.V13_diseno != null) {
              const vuX = Math.abs(cd.V13_diseno);
              polygonProperties[index].shearDesign.oneWayXFem = {
                vuTon: vuX,
                phiVcTon: cd.phiVcTonM,
                ratio: cd.phiVcTonM > 0 ? vuX / cd.phiVcTonM : Infinity,
                ok: vuX <= cd.phiVcTonM,
              };
            }
            if (cd.V23_diseno != null) {
              const vuY = Math.abs(cd.V23_diseno);
              polygonProperties[index].shearDesign.oneWayYFem = {
                vuTon: vuY,
                phiVcTon: cd.phiVcTonM,
                ratio: cd.phiVcTonM > 0 ? vuY / cd.phiVcTonM : Infinity,
                ok: vuY <= cd.phiVcTonM,
              };
            }
          }
        });
      }

      // Bloque 3b (combinadas) — igual que arriba pero para zapata
      // combinada: momentosPorColumna trae, por columna, Mx_diseno/
      // My_diseno YA con las caras en 'region D' (cerca de borde libre)
      // devueltas en null (ver calcular_zapata_shell_combinada). Acá solo
      // se arma un resumen tipo envolvente (mismo formato {Mx_diseno,
      // My_diseno} que ya espera el Bloque 3b del modal para aisladas, sin
      // tocar el Blade) tomando el peor valor VÁLIDO entre columnas — si
      // todas las columnas quedan en null para un eje, ese eje del resumen
      // también sale null y el modal simplemente no lo muestra.
      // AGREGADO (ver conversación): extraído a función compartida para
      // reutilizarla también con la zapata TRAPEZOIDAL combinada (misma
      // forma de respuesta del backend, mismo criterio de envolvente/BPR/
      // región D) sin duplicar esta lógica dos veces.
      const buildShellMomentReferenceFromCombinedResult = (result) => {
        if (!result.ok) return { ok: false, error: result.error };

        const porColumna = result.momentosPorColumna || [];
        const envolvente = (campo) => {
          const validos = porColumna.map((c) => c[campo]).filter((v) => v != null);
          if (!validos.length) return null;
          return validos.reduce((peor, v) => (Math.abs(v) > Math.abs(peor) ? v : peor));
        };

        const mxResumen = envolvente("Mx_diseno");

        // AGREGADO (ver conversación, método BPR de Bowles "Foundation
        // Analysis and Design" 5ta ed., Cap. 9 -- validado contra ETABS
        // real con el modelo F10: 0.26-5.2% de diferencia en las 3
        // columnas, el mejor resultado de toda esta investigación,
        // incluida la columna a solo 0.75d del borde libre que la
        // región D marca como no confiable). Para My (transversal), en
        // vez de solo la lectura puntual (My_diseno, puede venir null
        // por región D), se prefiere por columna el promedio sobre la
        // franja efectiva (My_bpr_diseno, calculado SIEMPRE en el
        // backend, no depende de región D) -- es la alternativa real al
        // problema, no un respaldo de menor calidad.
        const myPorColumnaPreferido = porColumna.map((c) => (c.My_diseno != null ? c.My_diseno : c.My_bpr_diseno));
        const myResumen = myPorColumnaPreferido.filter((v) => v != null).length
          ? myPorColumnaPreferido
              .filter((v) => v != null)
              .reduce((peor, v) => (Math.abs(v) > Math.abs(peor) ? v : peor))
          : null;

        const mxFueraDeRegionD = porColumna.some((c) => c.Mx_cara_mas_x_region_d || c.Mx_cara_menos_x_region_d);
        const myUsoBpr = porColumna.some((c) => c.My_cara_mas_y_region_d || c.My_cara_menos_y_region_d);
        // AGREGADO (ver conversación, investigación final de "vanos
        // cortos"): a diferencia de región D por borde libre (donde el
        // método rígido de respaldo SÍ es confiable), se investigó a fondo
        // (2 rondas de literatura externa + 5 preguntas a Consensus.app,
        // todas sin resultado) y además se confirmó con datos reales que
        // el método RÍGIDO también falla feo en vano corto (55-80% contra
        // ETABS real en F10, peor que el propio FEM) -- ningún método
        // automático sirve ahí. Bandera separada del backend
        // (Mx_cara_..._vano_corto, distinta de _region_d) para poder
        // avisar esto de forma explícita en vez de sugerir "revisa el
        // método rígido" como si fuera confiable.
        const mxPorVanoCorto = porColumna.some((c) => c.Mx_cara_mas_x_vano_corto || c.Mx_cara_menos_x_vano_corto);

        // AGREGADO (ver conversación, umbral de región D ampliado a 2d y
        // por EJE completo de columna): con el criterio ampliado es común
        // que TODAS las caras Mx de una zapata combinada corta (columnas
        // cerca de borde libre en X) queden en región D -- ahí no hay
        // ningún valor de Mx que mostrar. My ya no cae en este caso
        // porque siempre tiene el respaldo de BPR.
        let advertencia = result.advertencia;
        if (mxPorVanoCorto) {
          advertencia =
            (result.advertencia || "") +
            " Al menos una columna tiene un vano muy corto hacia su vecina (luz al punto medio < 2.5×d) -- para Mx (longitudinal) ahí, NI el FEM NI el método rígido son confiables (investigado a fondo, sin solución automática encontrada). Requiere revisión manual de un ingeniero para esa cara, no uses ninguno de los 2 valores automáticos.";
        } else if (mxResumen == null) {
          advertencia =
            "Esta zapata combinada no tiene ningún valor de Mx (longitudinal) confiable -- todas las caras quedan cerca de un borde libre (región D). Usa el momento del método rígido (más abajo) para Mx. My (transversal) sí está disponible, calculado con el método de franja efectiva de Bowles (validado ~0.3-5% vs. ETABS).";
        } else if (mxFueraDeRegionD) {
          advertencia =
            (result.advertencia || "") +
            " Al menos una cara Mx de columna cerca de un borde libre no tiene valor FEM confiable (región D) -- revisar el momento del método rígido (más abajo) para esa cara.";
        } else if (myUsoBpr) {
          advertencia =
            (result.advertencia || "") +
            " My (transversal) de al menos una columna se calculó con el método de franja efectiva de Bowles (promedio, no punto exacto) por estar cerca de un borde libre -- validado ~0.3-5% vs. ETABS real.";
        }

        return {
          ok: true,
          momentoDiseno: { Mx_diseno: mxResumen, My_diseno: myResumen },
          advertencia,
        };
      };

      if (shellCombinedDesignPromises.length) {
        const results = await Promise.all(shellCombinedDesignPromises.map((p) => p.promise));
        results.forEach((result, i) => {
          const { index, polygon: shellPolygon } = shellCombinedDesignPromises[i];
          if (!polygonProperties[index]) return;

          shellPolygon.combinedShellMoments = result;
          polygonProperties[index].shellMomentReference = buildShellMomentReferenceFromCombinedResult(result);
        });
      }

      // AGREGADO (ver conversación): zapata combinada TRAPEZOIDAL -- misma
      // forma de respuesta y mismo criterio de envolvente/BPR/región D que
      // la rectangular combinada de arriba (calcular_zapata_shell_
      // trapezoidal_combinada, extensión EXPERIMENTAL sin validar todavía
      // contra un caso real de ETABS, ver documentación del proyecto).
      if (shellTrapezoidalDesignPromises.length) {
        const results = await Promise.all(shellTrapezoidalDesignPromises.map((p) => p.promise));
        results.forEach((result, i) => {
          const { index, polygon: shellPolygon } = shellTrapezoidalDesignPromises[i];
          if (!polygonProperties[index]) return;

          shellPolygon.combinedShellMoments = result;
          polygonProperties[index].shellMomentReference = buildShellMomentReferenceFromCombinedResult(result);
        });
      }

      // AGREGADO (ver conversación): zapata combinada EN L -- misma forma
      // de respuesta y mismo criterio de envolvente que las de arriba
      // (calcular_zapata_shell_L_combinada, extensión EXPERIMENTAL, versión
      // BASE sin región D/vanos cortos/BPR todavía -- ver documentación del
      // proyecto). steelDesign/shearDesign siguen en needsReview (Bloque
      // 5/6 sí necesita el método rígido, que no soporta L) — esto solo
      // rellena shellMomentReference (Bloque 3b) cuando el FEM sí pudo.
      if (shellLDesignPromises.length) {
        const results = await Promise.all(shellLDesignPromises.map((p) => p.promise));
        results.forEach((result, i) => {
          const { index, polygon: shellPolygon } = shellLDesignPromises[i];
          if (!polygonProperties[index]) return;

          shellPolygon.combinedShellMoments = result;
          polygonProperties[index].shellMomentReference = buildShellMomentReferenceFromCombinedResult(result);
        });
      }

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
            df,
            gammaE,
            columnsCount: columns.length,
          },
        })
      );
    } catch (error) {
      console.error("❌ Error calculando zapatas:", error);
      this.showMessage(error?.message || "No se pudo calcular la cimentación.", "error");
    } finally {
      Swal.close();
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
        // AGREGADO (ver conversación): momento de elementos finitos (Bloque
        // 3b) para esta tabla -- solo existe en zapatas AISLADAS
        // RECTANGULARES con cálculo exitoso (ver zapataShellDesign.js). Ya
        // es la envolvente de las 11 combinaciones, no depende de
        // comboIndex. El template prefiere este valor sobre designMoment
        // (método rígido) cuando está disponible, por ser más preciso
        // (~5% vs ETABS real, validado) -- designMoment queda como
        // respaldo para combinadas/triangulares/trapezoidales, donde el
        // FEM todavía no aplica.
        femMoment: polygon.shellMomentReference?.ok ? polygon.shellMomentReference.momentoDiseno : null,
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
      const supportNodes = findSupportNodesInPolygon(this.nodes || [], zapata.points || [], zapata.z);
      if (!supportNodes.length) return;

      const targetX = supportNodes.reduce((sum, node) => sum + node.position.x, 0) / supportNodes.length;
      const targetY = supportNodes.reduce((sum, node) => sum + node.position.y, 0) / supportNodes.length;

      Shape.prototype.calcularPropiedades.call(zapata);
      // Mismo motivo que en buildZapataPolygonProperties (foundationContract.js):
      // zapata.propiedades() falla para zapatas importadas de .e2k (objetos
      // planos, sin el método) -- se lee el campo directo.
      const { XC, YC } = zapata._propiedades;

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

  /**
   * Guarda la presión admisible del suelo (Tn/m², del estudio de suelos)
   * directo en la zapata (area.sigmaAdmisible) — un dato POR ZAPATA, no
   * global como Df/γe, porque distintas zapatas de un mismo edificio
   * pueden caer en zonas con distinta capacidad portante. Se llama desde
   * el modal de resultados (input editable junto al chequeo de capacidad
   * portante) — no requiere recalcular σ/Mu/Acero/Cortante (nada de eso
   * depende de sigmaAdmisible), así que NO marca el análisis como
   * desactualizado; solo re-emite el resultado para que el modal actualice
   * el badge OK/EXCEDE al toque, sin tener que volver a correr "Calcular
   * Zapatas".
   */
  setZapataSigmaAdmisible(areaId, value) {
    const area = (this.areas || []).find((a) => Number(a.id) === Number(areaId));
    if (!area) return;

    area.sigmaAdmisible = Number(value) || null;
  },
};

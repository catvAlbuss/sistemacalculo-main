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
  computeEdgeLengths,
  computeRectangularDimensions,
  findOpeningsInPolygon,
  findOverlappingHolePairs,
  polygonSelfIntersects,
  findStraddlingHoles,
} from "../../engine/foundationContract.js";

import { groupConnectedZapatas } from "../../engine/mergeZapataFragments.js";

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
  computeColumnStripMoment,
  detectCircularFooting,
  computeCircularFootingMoment,
  computeZapataCorridaMoment,
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
  fetchZapataShellPoligonoCombinadaDesignReference,
} from "../../engine/zapataShellDesign.js";

import {
  computeEffectiveArea,
  computeBedModulusK,
  computeVesicBearingCapacity,
} from "../../engine/soilCapacity.js";

// Mismos valores por defecto que resources/js/etabs/components/DatosGeneralesPanel.vue
// (Cimentación 2.0 / predim2), para quedar consistentes en unidades: todo el
// pipeline /zapatas2 asume Tonf y metros, no SI. Siguen siendo un supuesto
// genérico, no un dato real de tu proyecto — ajustable desde el modal si se
// agrega ese campo más adelante.
const DEFAULT_DF = 2; // m
const DEFAULT_GAMMA_E = 1.8; // Tonf/m3 (peso específico del suelo)

export const foundationMixin = {
  async calculateZapatas() {
    const zapatasIndividuales = (this.areas || []).filter((area) => area.areaType === "zapata");

    if (!zapatasIndividuales.length) {
      this.showMessage("Dibuja al menos una zapata antes de calcular (botón Zapata en Dibujar).", "warning");
      return;
    }

    // AGREGADO (ver conversación, "zapatas recortadas", Etapa 3): un
    // `opening` dibujado ENCIMA de una zapata (mismo tipo de área que ya
    // usan losas/muros para aberturas, ver cad_sys.js:openingDrawingState)
    // se trata como un hueco de esa zapata -- ver findOpeningsInPolygon.
    // Universo completo de openings del nivel actual; cuál zapata "es
    // dueña" de cuál opening se decide más abajo, por zapata (ya
    // fusionada por grupo, ver groupConnectedZapatas debajo).
    const openings = (this.areas || []).filter((area) => area.areaType === "opening");

    // AGREGADO (ver conversación, "arréglalo -- en ETABS se ven las 21
    // piezas separadas"): el modelo (`this.areas`) mantiene cada AREA de
    // Divide Shells por separado, igual que ETABS -- ya NO se fusionan al
    // importar (ver e2k-import.js). Para el CÁLCULO sí hace falta tratar
    // las piezas conectadas (mismo nivel + misma sección, aristas
    // compartidas) como una sola zapata lógica: si no, cada pieza que no
    // tiene su propia columna adentro (las columnas caen en vértices
    // compartidos ENTRE piezas, no necesariamente dentro de una sola)
    // dispara "zapata sin columna asignada" y frena TODO el cálculo en la
    // primera que encuentre así. `groupConnectedZapatas` arma esos grupos
    // (polígono fusionado + lista de piezas reales) sin tocar el modelo;
    // acá se construye un "zapata" por grupo (objeto plano, con las
    // mismas propiedades que la pieza representativa pero el polígono
    // fusionado) para que el resto de esta función -- pensada para una
    // zapata = un objeto -- seguir funcionando sin cambios. Caso normal
    // (una zapata = un AREA, sin piezas vecinas): cada grupo tiene 1 sola
    // pieza y esto es un no-op total (mismo objeto que antes).
    const grupos = groupConnectedZapatas(zapatasIndividuales);
    const zapatas = grupos.map((grupo) => ({
      ...grupo.areas[0],
      points: grupo.polygon,
      _grupoAreas: grupo.areas,
    }));

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

      // AGREGADO (ver conversación, "¿nuestro método Green sirve para
      // cualquier figura geométrica?" 2026-09-15): el contorno exterior de
      // la zapata tiene que ser un polígono SIMPLE (sin autointersección)
      // para que el shoelace/Green de calcularPropiedadesNetas dé un
      // resultado correcto -- si se cruza a sí mismo, las partes cruzadas
      // se cancelan matemáticamente y el área/inercia salen mal sin aviso.
      // Se detiene ANTES de calcular, mismo patrón que el aviso de cortes
      // superpuestos de abajo.
      if (polygonSelfIntersects(polygonPoints)) {
        this.showMessage(
          `La zapata ${zapata.id} tiene un contorno que se cruza a sí mismo (autointersección). Corrige su geometría antes de calcular — el método de Green no da un resultado válido para un polígono que no es simple.`,
          "warning"
        );
        return;
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

      // AGREGADO (ver conversación, "zapatas recortadas", Etapa 3): huecos
      // de ESTA zapata, en coordenadas GLOBALES (mismo sistema que
      // `polygonPoints`) -- [{x,y}, ...] por hueco. `/zapatas2` (presión)
      // los soporta para CUALQUIER zapata (Etapa 1); el FEM shell solo los
      // soporta para combinada 2+ columnas (Etapa 2) -- ver más abajo,
      // donde se decide si se envían o no al llamar cada endpoint.
      // Vértices planos [{x,y},...] por hueco -- formato que espera el FEM
      // shell combinado (huecos: [[{x,y},...],...], ver zapataShellDesign.js
      // más abajo).
      // AGREGADO (ver conversación, "corte con vértices dentro y fuera de
      // la zapata" 2026-09-15): findOpeningsInPolygon exige TODOS los
      // vértices adentro para reconocer un corte como hueco de esta zapata
      // -- un corte a caballo del borde (parte adentro, parte afuera) hoy
      // se descarta en silencio ahí (falla segura: no se resta), pero sin
      // este aviso el ingeniero no se entera de que ese corte, tal como
      // está dibujado, simplemente NO se está aplicando.
      const straddling = findStraddlingHoles(openings, polygonPoints);
      if (straddling.length) {
        this.showMessage(
          `La zapata ${zapata.id} tiene ${straddling.length} corte(s) con parte de sus vértices dentro y parte fuera de su contorno. Ese corte no se está restando — ajústalo para que quede completamente dentro de la zapata.`,
          "warning"
        );
        return;
      }

      const holePointLists = findOpeningsInPolygon(openings, polygonPoints).map((opening) =>
        opening.points.map((point) => ({ x: point.x, y: point.y }))
      );

      // AGREGADO (ver conversación, "notificar un aviso para que no deje
      // pasar eso al sistema" 2026-09-14): el método de diferencia de
      // áreas resta cada corte por separado -- si dos cortes de ESTA
      // zapata se superponen entre sí (comparten área real, no solo un
      // borde), esa zona compartida se restaría dos veces y el resultado
      // saldría por debajo del valor real, sin ningún aviso (ver
      // findOverlappingHolePairs, foundationContract.js). Se detiene el
      // cálculo aquí, antes de que ese número incorrecto llegue a
      // ninguna parte del sistema.
      const overlapping = findOverlappingHolePairs(holePointLists);
      if (overlapping.length) {
        const pares = overlapping.map(([i, j]) => `Corte ${i + 1} y Corte ${j + 1}`).join(", ");
        this.showMessage(
          `La zapata ${zapata.id} tiene cortes que se superponen entre sí (${pares}). Ajusta su geometría para que no compartan área — el método de resta no admite cortes solapados.`,
          "warning"
        );
        return;
      }

      // AGREGADO (ver conversación, "diferencia de áreas" en Propiedades
      // 2026-09-12): persiste los huecos en el propio objeto `zapata` (no
      // solo en footingsMeta, más abajo) -- buildZapataPolygonProperties
      // (llamado sobre este mismo array `zapatas` un poco después) los
      // necesita para restar el área/inercia de cada corte en vez de
      // reportar solo el contorno exterior. `zapata` es un objeto del
      // array `zapatas` (mutación intencional, mismo patrón que
      // `zapata._propiedades` que ya muta ese objeto en calcularPropiedades()).
      zapata.holes = holePointLists;

      polygons.push({
        closed: true,
        nodes: polygonPoints.map((point) => ({ x: point.x, y: point.y })),
        // buildPoligonosStruct (zapatas2Core.js) espera cada hueco con el
        // MISMO formato { nodes, closed } que un polígono -- ver ahí.
        holes: holePointLists.length
          ? holePointLists.map((nodes) => ({ closed: true, nodes }))
          : undefined,
      });

      footingsMeta.push({
        type: classifyFooting(supportNodes),
        column: supportNodes.length === 1 ? supportNodes[0] : null,
        supportNodeIds: supportNodes.map((node) => Number(node.id)),
        polygonPoints,
        holes: holePointLists,
        // Referencia al area/zapata original (no solo sus puntos) — para
        // poder guardarle el σmax encima más abajo, y así Assign > Carga
        // Uniforme de Losa lo pueda autocompletar por ID sin tener que
        // buscar por índice (ver conversación: autocompletar Csuelo).
        // `zapata` es el objeto plano del GRUPO (ver arriba) -- no es una
        // AREA real del modelo, así que `areaRef` apunta a la pieza
        // representativa real (`_grupoAreas[0]`) y `areaGroupRefs` a
        // TODAS las piezas reales del grupo, para que el autocompletado
        // funcione sin importar cuál pieza seleccione después el
        // ingeniero (relevante solo cuando el grupo tiene 2+ piezas).
        areaRef: zapata._grupoAreas[0],
        areaGroupRefs: zapata._grupoAreas,
      });
    }

    if (!polygons.length) {
      this.showMessage("Las zapatas dibujadas no tienen suficientes puntos.", "warning");
      return;
    }

    // AGREGADO (ver conversación, "zapatas recortadas", Etapa 3, y luego
    // "el hueco no se refleja en el Diagrama de Resultantes -- ¿pasa en
    // ETABS?"): aviso único y honesto en vez de rastrear rama por rama qué
    // cálculo sí refleja el hueco. La presión de contacto (/zapatas2)
    // SIEMPRE lo descuenta (Etapa 1, universal). El momento/cortante lo
    // refleja en CUALQUIER zapata COMBINADA (2+ columnas) -- se fuerza por
    // el camino FEM aunque el método rígido la hubiera resuelto como viga
    // recta simple, ver el forzado de `combinedMoments` más abajo -- el
    // único caso que sigue sin reflejarlo es la zapata AISLADA (1 columna):
    // la malla en abanico exige un polígono convexo, y un hueco lo vuelve
    // no-convexo (límite documentado, Etapa 2). Se avisa una sola vez para
    // todas las zapatas con huecos, no una por una (ruido).
    const zapatasConHuecoAislada = footingsMeta.filter(
      (meta) => meta.holes?.length && meta.type !== "combined"
    ).length;
    if (zapatasConHuecoAislada) {
      this.showMessage(
        `${zapatasConHuecoAislada} zapata(s) aislada(s) (1 columna) tienen un hueco (opening) dibujado. ` +
          "Se descuenta en la presión de contacto, pero el momento/cortante de esa zapata NO lo refleja todavía " +
          "(la malla en abanico exige un polígono convexo) -- revísalo manualmente.",
        "warning"
      );
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

      // Bloque 2c — resultante (P) y excentricidad (ex, ey) de TODAS las
      // columnas de una zapata en un combo dado, referidas al centroide
      // GEOMÉTRICO real de la zapata (cx, cy — XC/YC de
      // Shape.calcularPropiedades) — mismo principio que
      // computeContinuousBeamMoment (footingMoments.js) para el momento
      // propio de columna, pero sumando TODAS las columnas de la zapata en
      // vez de repartirlas por brazo, y trasladando cada carga puntual al
      // centroide con su brazo de palanca (Pᵢ·(xᵢ−cx), Pᵢ·(yᵢ−cy)) para
      // obtener el momento resultante total. ex = My_total/P (excentricidad
      // a lo largo de X), ey = Mx_total/P (a lo largo de Y) — signo real,
      // sin abs() (computeEffectiveArea ya lo aplica).
      const columnsById2 = new Map(columns.map((row) => [String(row.column ?? row.id), row]));
      const resultantAtCombo = (supportNodeIds, combo, cx, cy) => {
        let p = 0;
        let mAroundX = 0;
        let mAroundY = 0;

        (supportNodeIds || []).forEach((id) => {
          const row = columnsById2.get(String(id));
          if (!row) return;

          const pi = evaluateAxialExpression(combo.column1, {
            pm: Number(row.pd1) || 0,
            pv: Number(row.pl1) || 0,
            ps: Number(row.sismo1) || 0,
          });
          const mxi = evaluateAxialExpression(combo.column2, {
            pm: Number(row.pd2) || 0,
            pv: Number(row.pl2) || 0,
            ps: Number(row.sismo2) || 0,
          });
          const myi = evaluateAxialExpression(combo.column3, {
            pm: Number(row.pd3) || 0,
            pv: Number(row.pl3) || 0,
            ps: Number(row.sismo3) || 0,
          });

          p += pi;
          mAroundX += mxi + pi * (Number(row.y) - cy);
          mAroundY += myi + pi * (Number(row.x) - cx);
        });

        return { p, ex: p !== 0 ? mAroundY / p : 0, ey: p !== 0 ? mAroundX / p : 0 };
      };

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
      // Bloque 3b (LOSAS DE CIMENTACIÓN — columnas en cuadrícula 2D sobre
      // un contorno arbitrario, no solo un rincón en L) — FASE 1, ver
      // calcular_zapata_shell_poligono_combinada.
      const shellPoligonoCombinadaDesignPromises = [];

      // AGREGADO (ver conversación, hallazgo del mismo día validando
      // trapezoidal): la malla necesita elementos aproximadamente
      // CUADRADOS para converger bien -- usar un solo N igual para nx Y ny
      // sin importar la proporción largo/ancho de la zapata da elementos
      // muy alargados en zapatas combinadas típicas (ej. F10, 12x2.5m,
      // alargados ~4.8:1) -- confirmado que eso puede dar valores menos
      // confiables que una malla con el aspect ratio de cada elemento
      // cerca de 1:1. `longitud`/`ancho` son las dos dimensiones reales de
      // la zapata (no necesariamente X/Y globales -- para trapezoidal es
      // longitud del eje y ancho promedio).
      //
      // ACTUALIZADO (ver conversación, a pedido de Jack): antes M
      // (resolución del lado corto) se DERIVABA automáticamente a partir
      // de N para forzar 1:1 -- ahora N y M son dos inputs independientes
      // (zapataShellMeshN/M, editables en el modal de suelo), igual que
      // "Mesh Object into N by M Elements" de ETABS, para poder igualar
      // exactamente una malla declarada ahí al comparar resultados. N
      // siempre se asigna al lado LARGO del polígono y M al CORTO (no
      // X/Y fijo, porque un brazo de zapata combinada puede tener
      // cualquier orientación) -- si el ingeniero elige N/M no
      // proporcionales al aspect ratio real, puede volver a caer en el
      // mismo problema de elementos alargados de arriba; es su
      // responsabilidad al declarar la malla, igual que en ETABS.
      const mallaProporcional = (longitud, ancho) => {
        const n = this.zapataShellMeshN;
        const m = this.zapataShellMeshM;
        return longitud >= ancho ? { nx: n, ny: m } : { nx: m, ny: n };
      };

      normalizedPolygons.forEach((polygon, index) => {
        const meta = footingsMeta[index];
        if (!meta) return;

        // Contorno real de la zapata (no la nube de puntos de σ) — lo usa
        // canvas2d/zapataPressureLayer.js para recortar (clip) el pintado
        // al polígono exacto, sin desbordar el borde.
        polygon.points = meta.polygonPoints;

        // AGREGADO (ver conversación, bug real encontrado probando el aviso
        // de "Región D" en el Diagrama de Resultantes): `designInputs`
        // vivía SOLO en `polygonProperties[index]` -- pero
        // `_lastZapataCalculationResults` (lo que ve canvas2d/renderer.js
        // para pintar el mapa 2D) solo guarda `normalizedPolygons`, nunca
        // `polygonProperties`. `polygon?.designInputs` ahí SIEMPRE daba
        // undefined, sin importar si la zapata tenía sección asignada --
        // por eso el aviso de borde no confiable nunca se activaba. Se
        // copia acá mismo, con el mismo índice que ya usa el resto del
        // bloque, para que quede disponible donde realmente se necesita.
        polygon.designInputs = polygonProperties[index]?.designInputs || null;

        // AGREGADO (ver conversación, caso real de columna centrada): el
        // Diagrama de Resultantes necesita saber DÓNDE está cada columna
        // de esta zapata (posición real + tamaño de sección) para avisar
        // que un punto DENTRO del área que ocupa la columna en planta no
        // tiene sentido físico (ahí no hay losa flexionándose, hay
        // concreto de columna) -- misma singularidad matemática que ya
        // documenta zapata_shell_solver.py ("el nodo de CUALQUIER apoyo
        // puntual es una singularidad matemática"), por la que producción
        // siempre evalúa el momento de diseño en la CARA de la columna,
        // nunca en su nodo. Sirve tanto para aisladas (un solo elemento)
        // como combinadas (varios).
        polygon.columns = (meta.supportNodeIds || []).map((id) => {
          const row = columns.find((c) => Number(c.column ?? c.id) === Number(id));
          const size = getColumnSectionSize(this.shapes || [], id);
          return { x: Number(row?.x) || 0, y: Number(row?.y) || 0, bx: size.b, by: size.h };
        });

        // AGREGADO (ver conversación, "Camino 2 -- avisar en vez de
        // perseguir el número"): mismo motivo que polygon.columns de
        // arriba -- el Diagrama de Resultantes necesita saber DÓNDE hay un
        // hueco para avisar que ahí cerca el momento/cortante por
        // diferencias finitas tampoco es confiable (es EXACTAMENTE el
        // mismo fenómeno de borde libre que ya cubre isPointOnMeshEdge/
        // isPointNearFreeEdge para el contorno exterior -- un hueco es un
        // borde libre más, solo que interior). `meta.holes` ya viene en
        // [{x,y},...] por hueco (ver Etapa 3, findOpeningsInPolygon).
        polygon.holes = meta.holes || [];

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
          const sigmaMax = !rawMaxima.length
            ? null
            : USE_ENVELOPE_FOR_SIGMA_MAX_AUTOFILL
              ? Math.max(...rawMaxima)
              : rawMaxima[0];
          // Se escribe en TODAS las piezas reales del grupo (no solo en la
          // representativa) -- si la zapata viene de varias AREA
          // conectadas (Divide Shells), el ingeniero puede abrir "Assign >
          // Carga Uniforme de Losa" desde cualquiera de ellas y debe
          // autocompletar el mismo σmax de la zapata combinada completa.
          (meta.areaGroupRefs || [meta.areaRef]).forEach((area) => {
            if (area) area._sigmaMaxTonM2 = sigmaMax;
          });
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

          // Bloque 2c — Excentricidad de la resultante → área efectiva
          // (Meyerhof) → K de balasto (K30) y capacidad portante última
          // (Vesic/AASHTO LRFD) — ver conversación, Categoría D puntos 1-2,
          // y soilCapacity.js. `zapataK30`/`zapataPhiPrime` son datos
          // GLOBALES (un solo estudio de suelos para toda la cimentación,
          // editables en el ribbon "Cimentación") — a diferencia de
          // sigmaAdmisible, que sí es por zapata. Si quedan vacíos, estos
          // campos salen `null` (no se inventa un resultado sin dato real).
          // OJO: se usa SIEMPRE el bounding box (spanX/spanY, alineado a
          // los ejes globales X/Y) y NO `dimensions.L/B` -- `dimensions`
          // da el lado más largo del polígono sin importar si coincide con
          // X o Y (ver computeRectangularDimensions en foundationContract.js,
          // pensado para mostrar "B x L" en el modal), mientras que
          // `ex`/`ey` de resultantAtCombo SIEMPRE están en X/Y global. Si
          // una zapata está girada y se usara `dimensions.L/B` acá, L' y B'
          // podrían emparejarse con la excentricidad del eje equivocado.
          // Con spanX/spanY no hay ambigüedad: cada uno se resta con su
          // propia excentricidad, sin importar cuál resulte mayor o menor
          // (computeBedModulusK/computeVesicBearingCapacity ya ordenan
          // internamente lado corto/largo donde corresponde).
          const xs = (meta.polygonPoints || []).map((p) => Number(p.x) || 0);
          const ys = (meta.polygonPoints || []).map((p) => Number(p.y) || 0);
          const spanX = Math.max(...xs) - Math.min(...xs);
          const spanY = Math.max(...ys) - Math.min(...ys);
          const cx = Number(polygonProperties[index].properties?.XC) || 0;
          const cy = Number(polygonProperties[index].properties?.YC) || 0;

          const k30 = Number(this.zapataK30) || null;
          const phiPrimeDeg = this.zapataPhiPrime !== null && this.zapataPhiPrime !== "" ? Number(this.zapataPhiPrime) : null;

          const kBalasto = k30 ? computeBedModulusK({ k30, L: spanX, B: spanY, soilType: this.zapataSoilType }) : null;

          // Peor caso entre las 11 combinaciones: para cada una se calcula
          // su propia excentricidad (P, M propios de columna varían por
          // combo) y, con ella, su propia área efectiva y su propia qu
          // (Nγ depende de B'). Se guarda el mayor ratio q_eff/qu — el caso
          // más exigente para el suelo, no uno cualquiera.
          let worstBearing = null;
          DEFAULT_LOAD_COMBINATIONS.forEach((combo) => {
            const { p, ex, ey } = resultantAtCombo(meta.supportNodeIds, combo, cx, cy);
            const { Lp, Bp } = computeEffectiveArea({ L: spanX, B: spanY, ex, ey });
            const qEff = Lp > 0 && Bp > 0 ? Math.abs(p) / (Lp * Bp) : null;

            const vesic =
              phiPrimeDeg !== null && Lp > 0 && Bp > 0
                ? computeVesicBearingCapacity({
                    cPrime: Number(this.zapataCPrime) || 0,
                    phiPrimeDeg,
                    gammaS: gammaE,
                    Df: df,
                    Dw: this.zapataDw !== null && this.zapataDw !== "" ? Number(this.zapataDw) : null,
                    Bp,
                    Lp,
                  })
                : null;

            if (!vesic || qEff === null) return;
            const ratio = vesic.qu > 0 ? qEff / vesic.qu : Infinity;
            if (!worstBearing || ratio > worstBearing.ratio) {
              worstBearing = { comboId: combo.id, p, ex, ey, Lp, Bp, qEff, ...vesic, ratio, ok: ratio <= 1 };
            }
          });

          polygonProperties[index].soilChecks = {
            L: spanX,
            B: spanY,
            kBalasto,
            bearingCapacity: worstBearing,
          };
        }

        if (meta.type === "isolated" && meta.column) {
          const columnSize = getColumnSectionSize(this.shapes || [], meta.column.id);
          const designInputs = polygonProperties[index]?.designInputs;

          // AGREGADO (ver conversación, "zapata con pedestal"): un
          // pedestal es un ensanche REAL entre la columna y la zapata (no
          // una simplificación como MEASURE_L_TO_COLUMN_CENTER de abajo)
          // -- la sección crítica de momento Y cortante se mide desde la
          // cara del PEDESTAL, no de la columna, porque físicamente el
          // pedestal es lo que está pegado a la zapata.
          // `designInputs.pedestalB/pedestalH` (metros) son opcionales --
          // si no están puestos (0/vacío), todo se comporta EXACTAMENTE
          // igual que antes. Falta agregar el campo de captura en el
          // modal Blade -- por ahora se puede setear a mano en
          // designInputs para probar.
          const pedestalSize =
            Number(designInputs?.pedestalB) > 0 && Number(designInputs?.pedestalH) > 0
              ? { b: Number(designInputs.pedestalB), h: Number(designInputs.pedestalH) }
              : null;

          // Ver MEASURE_L_TO_COLUMN_CENTER arriba: {b:0,h:0} hace que
          // computeIsolatedOverhangs/computeIsolatedMomentAtPoint midan L
          // hasta el centro de la columna en vez de su cara — mismo camino
          // que ya usan cuando una columna no tiene sección asignada. Un
          // pedestal (si existe) GANA sobre ese toggle -- es geometría
          // real, no una simplificación a ignorar.
          //
          // A propósito se calculan DOS overhangs distintos: `overhangs`
          // (con momentColumnSize) alimenta SOLO el momento (Mu de este
          // bloque + el mapa 2D) — es lo único que pidió comparar el
          // ingeniero. `overhangsForShear` (con la columna REAL, o el
          // pedestal si existe) alimenta el cortante por flexión de
          // Bloque 6 más abajo — el cortante crítico SÍ depende
          // físicamente de dónde está la cara real, no es una
          // simplificación razonable ignorarla ahí.
          const momentColumnSize = pedestalSize || (MEASURE_L_TO_COLUMN_CENTER ? { b: 0, h: 0 } : columnSize);
          const shearFaceSize = pedestalSize || columnSize;

          // AGREGADO (ver conversación, "zapata circular"): detectada por
          // geometría (ver detectCircularFooting) -- si el polígono es un
          // círculo (dibujado como polígono de muchos lados, que es como
          // lo dibuja el CAD), el criterio de "2 voladizos independientes"
          // (computeIsolatedOverhangs/computeIsolatedFootingMoment) NO
          // aplica -- se usa computeCircularFootingMoment (segmento
          // circular, ver footingMoments.js) en su lugar.
          const circular = detectCircularFooting(meta.polygonPoints);

          const overhangs = computeIsolatedOverhangs(meta.polygonPoints, meta.column.position, momentColumnSize);
          const overhangsForShear = computeIsolatedOverhangs(meta.polygonPoints, meta.column.position, shearFaceSize);

          polygon.designMoments = DEFAULT_LOAD_COMBINATIONS.map((_, comboIndex) => {
            const sigma = netSigma(polygon.max?.[comboIndex]);
            if (circular) {
              return {
                momentoVoladizoX: computeCircularFootingMoment(circular.radius, momentColumnSize.b / 2, sigma),
                momentoVoladizoY: computeCircularFootingMoment(circular.radius, momentColumnSize.h / 2, sigma),
              };
            }
            return computeIsolatedFootingMoment(overhangs, sigma);
          });

          // Mapa de momento 2D: mismo principio que el mapa de presión de
          // Bloque 2 (zapataPressureLayer.js) — se evalúa la MISMA fórmula
          // de voladizo de Mu, punto por punto, sobre la nube de σ que ya
          // trae /zapatas2 (XX/YY), en vez de solo en el borde. Ver
          // computeIsolatedMomentAtPoint (footingMoments.js).
          //
          // PENDIENTE (zapata circular): computeIsolatedMomentAtPoint
          // asume el mismo criterio rectangular -- para no pintar un mapa
          // geométricamente incorrecto en una zapata circular, se omite
          // (momentField queda sin poblar) hasta implementar la versión
          // circular de este mapa punto a punto.
          if (!circular) {
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

          // AGREGADO (ver conversación, "zapata_1_columna", 2026-09-12):
          // NI el camino rectangular (fetchZapataShellDesignReference) NI
          // el poligonal en abanico (fetchZapataShellPoligonoDesignReference,
          // justo abajo) soportan huecos -- gap documentado desde la
          // implementación de la malla conforme (ver project_zapata_hueco_
          // malla_conforme.md, "aislada poligonal (fan mesh, 1 columna)
          // también pendiente"). `calcular_zapata_shell_poligono_combinada`
          // (backend) SÍ soporta huecos vía malla conforme y NO tiene
          // ningún supuesto de "2+ columnas" (itera `for c in
          // columnas_local`, Región D es contra el CONTORNO, no contra
          // otra columna) -- confirmado leyendo el código antes de este
          // cambio. Se reutiliza ese mismo camino con una lista de 1 sola
          // columna en vez de arreglar la malla en abanico (que por
          // diseño exige convexidad estricta desde un vértice, más frágil
          // para agregar huecos que la triangulación restringida ya
          // validada). Bloque 5/6 de esta zapata quedan sobreescritos más
          // abajo (ver `shellPoligonoCombinadaDesignPromises`) con
          // punzonamiento + cortante unidireccional real (`type:
          // "poligono"`) en vez del método rígido de 2 voladizos de ancho
          // constante -- una mejora adicional, no solo el Diagrama de
          // Resultantes.
          if (meta.holes?.length) {
            const bounds = overhangs.bounds;
            const mallaAisladaConHueco = mallaProporcional(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
            shellPoligonoCombinadaDesignPromises.push({
              index,
              polygon,
              columnsInPolygon: [{ x: meta.column.position.x, y: meta.column.position.y, column: meta.column.id }],
              promise: fetchZapataShellPoligonoCombinadaDesignReference({
                puntos: meta.polygonPoints,
                columnas: [
                  {
                    x: meta.column.position.x,
                    y: meta.column.position.y,
                    bx: columnSize.b,
                    by: columnSize.h,
                  },
                ],
                thicknessM: designInputs?.thicknessM,
                recubrimientoM: designInputs?.recubrimientoM,
                fpcMPa: designInputs?.fpc,
                nu: designInputs?.poissonRatio,
                nx: mallaAisladaConHueco.nx,
                ny: mallaAisladaConHueco.ny,
                q: quEnvelope(polygon),
                huecos: meta.holes,
              }),
            });
          } else if (isAxisAlignedRectangularFooting(meta.polygonPoints, overhangs.bounds, polygonArea)) {
            const bounds = overhangs.bounds;
            // A propósito usa `columnSize` (columna REAL), no
            // `momentColumnSize` -- el toggle "medir hasta el centro" solo
            // aplica al método rígido (overhangs de arriba); tanto el
            // momento como el cortante de elementos finitos siempre usan
            // la cara real de la columna.
            // ACTUALIZADO (ver conversación): antes nx/ny usaban el mismo
            // N (malla N×N literal, sin distinguir lado largo/corto) --
            // ahora usa `mallaProporcional` (mismo criterio N=lado largo/
            // M=lado corto que ya tenían las combinadas), para que una
            // zapata aislada rectangular no cuadrada (el caso típico) no
            // termine con elementos alargados por defecto.
            const mallaAislada = mallaProporcional(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
            shellDesignPromises.push({
              index,
              polygon,
              bounds,
              // AGREGADO (ver conversación, "rellenar huecos del FEM con
              // rígido"): datos necesarios para recalcular el momento
              // rígido de RESPALDO exactamente en las coordenadas de la
              // malla FEM (no en la nube de σ, que tiene otra resolución)
              // cuando la promesa resuelva -- ver computeIsolatedMomentAtPoint
              // más abajo. El rígido no tiene el problema de singularidad
              // cerca de columna/borde (se "recorta" en la cara de la
              // columna, ver footingMoments.js), así que sirve de respaldo
              // donde el FEM no es confiable.
              momentColumnSize,
              // AGREGADO (ver conversación, "hueco de aviso en volado
              // corto de cortante", zapata F3): tamaño REAL de columna
              // (no `momentColumnSize`, que puede venir en {b:0,h:0} si
              // "medir hasta el centro" está activo) -- es EXACTAMENTE el
              // mismo `columnSize.b`/`columnSize.h` que se le pasa abajo a
              // `fetchZapataShellDesignReference`, así que decide la
              // ubicación de la cara de columna de forma consistente con
              // lo que el backend usó para decidir `V13_cara_.../
              // V23_cara_...` (null cuando el volado neto < d).
              columnSize,
              columnPosition: meta.column.position,
              polygonPoints: meta.polygonPoints,
              overhangsBounds: overhangs.bounds,
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
                nx: mallaAislada.nx,
                ny: mallaAislada.ny,
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
                  // AGREGADO (ver conversación, pedestal): usa la cara del
                  // pedestal si existe (shearFaceSize = pedestalSize ||
                  // columnSize) -- el perímetro crítico de punzonamiento
                  // se mide desde ahí, no desde la columna real, cuando
                  // hay un ensanche real de por medio.
                  punching: computePunchingShear({
                    puTon: puEnvelope(columnRow),
                    quTonM2: quEnv,
                    columnBcm: shearFaceSize.b * 100,
                    columnHcm: shearFaceSize.h * 100,
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

        // AGREGADO (ver conversación, "zapata corrida bajo muro de
        // carga"): un polígono SIN columnas adentro (meta.type===null,
        // classifyFooting no lo reconoce ni como aislada ni combinada) se
        // trata como zapata corrida SOLO si el ingeniero lo marca
        // explícitamente (zapatas[index].esZapataCorrida) -- no hay forma
        // de detectarlo solo (no existe conexión muro→zapata todavía).
        //
        // A diferencia de lo que se pensó al principio, NO hace falta que
        // el ingeniero escriba la carga del muro a mano: σ (la presión
        // neta de diseño) ya se calcula para CUALQUIER polígono desde
        // /zapatas2 (normalizeZapatas2Resultados, foundationContract.js
        // -- no depende de columnas), exactamente igual que para
        // aislada/combinada -- viene de la reacción REAL del muro en el
        // análisis estructural. Lo único que de verdad falta y no se
        // puede derivar solo es el ESPESOR del muro (necesario para saber
        // dónde cae la cara crítica) -- ese sí lo escribe el ingeniero
        // (`zapatas[index].corridaEspesorMuroM`, editable desde el modal
        // vía setZapataCorrida() más abajo, mismo patrón que sigmaAdmisible).
        //
        // Matemática: mismo Mu=σ·L²/2 de la zapata aislada (voladizo
        // TRANSVERSAL, L=(B-espesorMuro)/2, muro centrado en el ancho B
        // de la zapata) -- válido porque se asume carga del muro UNIFORME
        // a lo largo de su longitud (sin ese supuesto, haría falta una
        // viga continua como en combinadas -- fuera de alcance de esta
        // primera versión, ver conversación).
        if (meta.type === null && zapatas[index]?.esZapataCorrida) {
          const espesorMuroM = Number(zapatas[index]?.corridaEspesorMuroM) || 0;
          const designInputs = polygonProperties[index]?.designInputs;

          const edges = computeEdgeLengths(meta.polygonPoints);
          // Ancho TRANSVERSAL (B, el lado corto) -- solo tiene sentido si
          // el polígono es un rectángulo simple de 4 vértices; si no, no
          // hay una "B" única (mismo criterio que ya usa
          // buildZapataPolygonProperties, que deja `dimensions:null` ahí).
          const anchoZapataM = computeRectangularDimensions(meta.polygonPoints, edges)?.B ?? null;

          if (anchoZapataM != null && polygonProperties[index]) {
            const quEnv = quEnvelope(polygon);
            const { momentoVoladizo: muEnvelope, voladizo } = computeZapataCorridaMoment(
              anchoZapataM,
              espesorMuroM,
              quEnv
            );

            polygonProperties[index].rigidMoment = { muCorridaEnvelope: muEnvelope };

            if (designInputs) {
              polygonProperties[index].steelDesign = {
                type: "corrida",
                transversal: buildSteelResult(muEnvelope, designInputs),
              };

              polygonProperties[index].shearDesign = {
                type: "corrida",
                oneWay: computeOneWayShear({
                  overhangM: voladizo,
                  quTonM2: quEnv,
                  fpcMPa: designInputs.fpc,
                  thicknessM: designInputs.thicknessM,
                  recubrimientoM: designInputs.recubrimientoM,
                }),
              };
            }
          }

          return;
        }

        if (meta.type === "combined") {
          const columnsInPolygon = columns.filter((column) => meta.supportNodeIds.includes(Number(column.column)));
          const netSigmaByCombo = (polygon.max || []).map(netSigma);

          // AGREGADO (ver conversación, "mejorar cortante zapata
          // combinada"): nube real de presión de /zapatas2 (misma que ya
          // pinta zapataPressureLayer.js), con el mismo netSigma que se le
          // aplica al escalar de arriba aplicado punto a punto -- para que
          // computeCombinedFootingMoments pueda usar la distribución REAL
          // en vez de netSigmaByCombo (un solo valor, el máximo de TODA la
          // zapata) repartido uniforme en todo el brazo. Si polygon.ZZ no
          // trae datos utilizables, buildAxialPressureLookup lo detecta y
          // el cálculo cae de vuelta al comportamiento de siempre.
          const pressureCloud = {
            XX: flattenNumeric(polygon.XX),
            YY: flattenNumeric(polygon.YY),
            ZZByCombo: DEFAULT_LOAD_COMBINATIONS.map((_, comboIndex) => {
              const rawForCombo = Array.isArray(polygon.ZZ?.[comboIndex]) ? polygon.ZZ[comboIndex] : polygon.ZZ;
              return flattenNumeric(rawForCombo).map(netSigma);
            }),
          };

          polygon.combinedMoments = computeCombinedFootingMoments(
            meta.polygonPoints,
            columnsInPolygon,
            DEFAULT_LOAD_COMBINATIONS,
            netSigmaByCombo,
            pressureCloud
          );

          // AGREGADO (ver conversación, "el hueco no se refleja en el
          // Diagrama de Resultantes/Mu -- ¿pasa esto en ETABS?"): el método
          // rígido (viga continua, arriba) NO tiene ningún concepto de
          // huecos -- es una fórmula cerrada (2 voladizos + tramos), sin
          // malla de la que excluir nada, a diferencia de ETABS (que
          // SIEMPRE resuelve con elementos finitos reales, así que un
          // opening ahí SÍ distorsiona el campo, en cualquier zapata simple
          // o compleja). Si esta zapata tiene un hueco detectado Y el
          // método rígido la hubiera podido resolver como caso "simple"
          // (columnas alineadas, supported:true), se fuerza por el camino
          // FEM en su lugar -- mismo `reason:"branching"` que ya revisa el
          // bloque de abajo (computeLFootingGeometry: si esta forma NO es
          // una L, cae directo a poligono_combinada, que SÍ excluye el
          // hueco de la malla desde la Etapa 2). Sin esto, "resolverla" por
          // el método rígido sería ignorar el hueco en silencio -- ya se
          // había confirmado en vivo que así pasaba.
          if (meta.holes?.length && polygon.combinedMoments?.supported) {
            polygon.combinedMoments = { supported: false, reason: "branching", legs: null };
          }

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
              // AGREGADO (ver conversación, "zapata en L con corte — no me
              // acepta lo que es el corte" 2026-09-10): calcular_zapata_
              // shell_L_combinada solo conoce el "rincón faltante" de la L
              // (notch), NO huecos internos -- si esta L tiene un opening
              // dibujado, se salta el camino de la L y cae al de polígono
              // combinado (calcular_zapata_shell_poligono_combinada, que SÍ
              // recibe `huecos` y usa la malla conforme + ASDShellQ4). Sin
              // esto el corte se importaba pero el solver lo ignoraba en
              // silencio.
              const geo = meta.holes?.length ? null : computeLFootingGeometry(meta.polygonPoints);
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
                  // AGREGADO (ver conversación, "8 componentes"): origen
                  // del bounding box, para volver globales las coordenadas
                  // locales del campo -- mismo patrón que las demás formas.
                  originX: geo.originX,
                  originY: geo.originY,
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
              } else {
                // AGREGADO (ver conversación, "completa Fase 1" 2026-09-04):
                // la forma NO es un rincón en L simple (computeLFootingGeometry
                // no la reconoció -- ej. varios rincones, columnas en
                // cuadrícula 2D) -- ver calcular_zapata_shell_poligono_combinada
                // (FASE 1), que generaliza la L a un contorno arbitrario con
                // columnas en cualquier posición. Sin esto, esta forma se
                // quedaba en needsReview sin ningún cálculo adicional.
                const columnasFem = columnsInPolygon.map((columnRow) => {
                  const columnSize = getColumnSectionSize(this.shapes || [], columnRow.column ?? columnRow.id);
                  return {
                    x: Number(columnRow.x), y: Number(columnRow.y),
                    bx: columnSize.b, by: columnSize.h,
                  };
                });

                const xsPoligono = meta.polygonPoints.map((p) => p.x);
                const ysPoligono = meta.polygonPoints.map((p) => p.y);
                const mallaPoligono = mallaProporcional(
                  Math.max(...xsPoligono) - Math.min(...xsPoligono),
                  Math.max(...ysPoligono) - Math.min(...ysPoligono)
                );

                // Nube de presión REAL (envolvente puntual: peor combo en
                // CADA punto, no un solo escalar para toda la zapata) --
                // ver docstring de calcular_zapata_shell_poligono_combinada,
                // "CARGA NO UNIFORME": con un único q promedio, el error en
                // puntos lejos de cualquier columna llegó a 33-53% en el
                // único caso real probado; con la nube punto a punto, bajó
                // a menos de 8%. Misma pressureCloud ya armada arriba para
                // computeCombinedFootingMoments, solo se le aplica el
                // envolvente por punto en vez de por zapata completa.
                const qNubeX = pressureCloud.XX;
                const qNubeY = pressureCloud.YY;
                const qNubeQ = qNubeX.map((_, i) =>
                  Math.max(...pressureCloud.ZZByCombo.map((combo) => Math.abs(Number(combo[i]) || 0)))
                );

                // AGREGADO (ver conversación, "investiga" 2026-09-05): la
                // presión rígida automática (qNube arriba) sale casi
                // uniforme cuando la excentricidad real es chica -- contra
                // el mat real, dio 15-25% de error en vez del <8% ya
                // validado. La causa: el cliente le asigna a CADA pieza
                // real (F19-F39, etc.) su propia carga "Csuelo" en ETABS
                // (import de .e2k, `AREALOAD ... LC "csuelo"`, YA guardada
                // en `area.areaLoads[]` por e2k-import.js -- no hace falta
                // pedirle nada nuevo al ingeniero). Una zona EXACTA por
                // pieza real del grupo, con la carga que esa pieza
                // realmente tiene asignada, en vez de la presión rígida
                // derivada -- ver docstring de fetchZapataShellPoligono
                // CombinadaDesignReference para la prioridad completa.
                const qZonas = (meta.areaGroupRefs || [])
                  .map((pieza) => {
                    const puntosZona = (pieza.points || []).map((p) => ({ x: p.x, y: p.y }));
                    if (puntosZona.length < 3) return null;
                    const totalKgfM2 = (pieza.areaLoads || [])
                      .filter((l) => l.type === "uniform")
                      .reduce((suma, l) => suma + (Number(l.value) || 0), 0);
                    if (!totalKgfM2) return null; // pieza sin carga de área asignada -- cae al respaldo (qNube)
                    return { puntos: puntosZona, q: Math.abs(totalKgfM2) / 1000 }; // kgf/m² -> Tonf/m²
                  })
                  .filter(Boolean);

                shellPoligonoCombinadaDesignPromises.push({
                  index,
                  polygon,
                  columnsInPolygon,
                  promise: fetchZapataShellPoligonoCombinadaDesignReference({
                    puntos: meta.polygonPoints,
                    columnas: columnasFem,
                    thicknessM: polygonProperties[index]?.designInputs?.thicknessM,
                    recubrimientoM: polygonProperties[index]?.designInputs?.recubrimientoM,
                    fpcMPa: polygonProperties[index]?.designInputs?.fpc,
                    nu: polygonProperties[index]?.designInputs?.poissonRatio,
                    nx: mallaPoligono.nx,
                    ny: mallaPoligono.ny,
                    q: quEnvelope(polygon),
                    qNube: qNubeX.length ? { x: qNubeX, y: qNubeY, q: qNubeQ } : undefined,
                    qZonas: qZonas.length ? qZonas : undefined,
                    // AGREGADO (ver conversación, "zapatas recortadas",
                    // Etapa 3): huecos GLOBALES (mismo sistema que
                    // `puntos`/`columnas`) -- el FEM de losa 2D (2+
                    // columnas) SÍ los soporta (Etapa 2). La aislada
                    // convexa (Bloque 3b de más arriba) y la rectangular NO
                    // -- ver advertencia agregada más abajo para esos casos.
                    huecos: meta.holes?.length ? meta.holes : undefined,
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

            // AGREGADO (ver conversación, "mejorar cortante zapata
            // combinada"): de qué combo salió el cortante envolvente, para
            // saber si ESE combo específico usó la nube real de presión de
            // /zapatas2 o cayó al fallback uniforme -- expuesto en el modal
            // (badge + advertencia) para que Jack pueda confirmarlo sin
            // abrir la consola del navegador.
            const comboConCortanteMax = legMoments.find((m) => (m.cortanteMax ?? 0) === cortanteEnvelope);
            const usedRealPressureForShear = Boolean(comboConCortanteMax?.usedRealPressure);

            polygonProperties[index].shearDesign = {
              type: "combined",
              usedRealPressure: usedRealPressureForShear,
              oneWay: computeCombinedOneWayShear({
                vuTon: cortanteEnvelope,
                widthCm: legWidthCm,
                fpcMPa: designInputs.fpc,
                thicknessM: designInputs.thicknessM,
                recubrimientoM: designInputs.recubrimientoM,
              }),
              // AGREGADO (ver conversación, investigación de cortante F10/F12
              // contra ETABS real): a diferencia de aisladas (cortante FEM
              // validado 2.44-8.61%, ver zapata_shell_solver.py), el cortante
              // de combinadas usa la viga rígida (E.060/ACI, "cortante de
              // viga ancha") -- no hay FEM de cortante para combinadas (se
              // intentó portar el mismo método de aisladas y salió
              // numéricamente inestable cerca de las columnas, misma
              // singularidad que ya conocemos del momento en vano corto/
              // región D, no un bug corregible). Comparado contra 8 puntos
              // reales de ETABS (F10/F12) ANTES de usar la presión real:
              // 9-44% de diferencia. Desde que se agregó la presión real de
              // /zapatas2 (en vez de sigma máximo uniforme en todo el
              // brazo) como carga de entrada, ese 9-44% queda pendiente de
              // re-confirmar -- el mensaje de abajo indica si ESTE
              // resultado específico ya usa la carga mejorada o no.
              advertencia: usedRealPressureForShear
                ? "El cortante de zapatas combinadas usa el método de viga de ancho completo (norma E.060/ACI), con la presión de contacto REAL (distribución de /zapatas2) como carga de entrada -- mejora reciente, aún sin recomparar contra ETABS con esta carga (el 9-44% de diferencia documentado es de ANTES de este cambio, con presión uniforme). Revisar con criterio de ingeniero para columnas críticas, no darlo por definitivo."
                : "El cortante de zapatas combinadas usa el método de viga de ancho completo (norma E.060/ACI) con presión uniforme (la nube de presión real de /zapatas2 no estaba disponible o no fue utilizable para este cálculo) -- comparado contra ETABS real, difiere 9-44% (investigado a fondo, sin corrección confiable encontrada: un método por elementos finitos resultó numéricamente inestable cerca de las columnas, misma singularidad ya conocida del momento). Revisar con criterio de ingeniero para columnas críticas, no darlo por definitivo.",
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

              // AGREGADO (ver conversación, "Strip Based Design" ACI/SAFE
              // -- validado contra F10 real, ver computeColumnStripMoment
              // en footingMoments.js): posiciones de columna a lo largo de
              // la viga, ORDENADAS, para poder saber el span adyacente de
              // cada una (necesario para el ancho de franja). Mismo eje/
              // origen que ya usa computeContinuousBeamMoment para este
              // mismo brazo (leg) -- se lee de momentsByCombo[0], igual
              // para las 11 combinaciones (la geometría no cambia, solo
              // sigmaUlt). Guardado en polygonProperties para usarlo más
              // abajo, cuando ya se sepa qué caras están en vano_corto
              // (eso lo decide el backend FEM, que llega después).
              const comboRefStrip = combined.legs[0].momentsByCombo[0];
              const beamAxisStrip = comboRefStrip?.beamAxis;
              const originStrip = Number(comboRefStrip?.origin) || 0;
              polygonProperties[index].mxStripInput = {
                momentsByCombo: combined.legs[0].momentsByCombo,
                columnasOrdenadas: columnsInPolygon
                  .map((columnRow, i) => ({
                    position: (beamAxisStrip === "x" ? Number(columnRow.x) : Number(columnRow.y)) - originStrip,
                    sizeAlongBeam: beamAxisStrip === "x" ? columnasFem[i].bx : columnasFem[i].by,
                    indiceOriginal: i,
                  }))
                  .sort((a, b) => a.position - b.position),
              };

              shellCombinedDesignPromises.push({
                index,
                polygon,
                // AGREGADO (ver conversación, "8 componentes en
                // combinadas"): origen local del brazo, para poder sumarlo
                // de vuelta a las coordenadas del campo (locales 0..Lx,
                // 0..Ly) y volverlas globales -- mismo patrón que
                // shellBounds.minX/minY en la aislada.
                originX: leg.minX,
                originY: leg.minY,
                leg,
                // AGREGADO (ver conversación, "componente transversal del
                // rígido de combinadas", Morales ICG/ACI Perú 2016 Cap.12
                // sec.3.2.1 paso g: "diseñar en dirección transversal en
                // forma equivalente al de zapatas aisladas"): posición/
                // tamaño real de cada columna del brazo, en coordenadas
                // LOCALES (mismo sistema que columnasFem que ya arma el
                // payload del FEM) -- se necesita en la resolución para
                // calcular el voladizo transversal equivalente en cada
                // punto de la malla.
                columnasLocales: columnasFem,
                quEnvBrazo: quEnv,
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
              if (geo.length > 0) {
                // AGREGADO (ver conversación, "zapata trapezoidal ancho casi
                // constante" 2026-09-05): 'y' ya NO resta una línea central
                // interpolada linealmente entre center0/center1 (esa
                // aproximación se rompe cuando el ancho no varía lineal en
                // toda la longitud, como el caso real de Jack) -- se envía
                // en el mismo sistema local CRUDO que geo.localPoints, y es
                // el backend (calcular_zapata_shell_trapezoidal_combinada,
                // parámetro `poligono`) el que centra cada columna contra el
                // centro REAL muestreado del polígono en esa posición.
                const columnasFemTrap = columnsInPolygon.map((columnRow) => {
                  const columnSize = getColumnSectionSize(this.shapes || [], columnRow.column ?? columnRow.id);
                  const pos = (geo.beamAxis === "x" ? Number(columnRow.x) : Number(columnRow.y)) - geo.origin;
                  const perp = geo.beamAxis === "x" ? Number(columnRow.y) : Number(columnRow.x);
                  return {
                    x: pos,
                    y: perp,
                    bx: columnSize.b,
                    by: columnSize.h,
                  };
                });

                // El "ancho" de referencia para mantener elementos ~cuadrados
                // es el promedio de B0/B1 (la zapata no tiene un ancho único).
                const mallaTrap = mallaProporcional(geo.length, (geo.B0 + geo.B1) / 2 || geo.length / 4);

                shellTrapezoidalDesignPromises.push({
                  index,
                  polygon,
                  // AGREGADO (ver conversación, "8 componentes"): geometría
                  // del eje, para convertir las coordenadas LOCALES del
                  // campo (x en [0,L], y=perpendicular cruda) a globales --
                  // ver más abajo, en la resolución.
                  geo,
                  promise: fetchZapataShellTrapezoidalDesignReference({
                    L: geo.length,
                    B0: geo.B0,
                    B1: geo.B1,
                    columnas: columnasFemTrap,
                    poligono: geo.localPoints,
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

          // AGREGADO (ver conversación, "zapatas recortadas", Etapa 3): esta
          // rama (rectangular o poligonal aislada, 1 columna) NO soporta
          // huecos todavía (ver Etapa 2 -- la malla en abanico exige un
          // polígono convexo, y un hueco lo vuelve no-convexo). El hueco SÍ
          // se restó de la presión de contacto (/zapatas2, universal), pero
          // el campo de momento/cortante de acá lo ignora -- se avisa en vez
          // de dejar que el usuario asuma que el hueco ya está reflejado en
          // todo.
          const holesUnsupportedNote = footingsMeta[index]?.holes?.length
            ? " ADVERTENCIA: esta zapata tiene un hueco dibujado (opening) que este cálculo de momento/cortante (1 columna) todavía no soporta -- el hueco SÍ se descontó en la presión de contacto, pero NO en este campo."
            : "";

          // AGREGADO (ver conversación): el modal (zapata-results-modal.
          // blade.php) sigue esperando 2 objetos separados
          // (shellMomentReference/shellShearReference, mismas claves de
          // siempre) — se derivan los dos de esta ÚNICA respuesta, así no
          // hubo que tocar el modal al fusionar las llamadas.
          polygonProperties[index].shellMomentReference = {
            ok: result.ok,
            momentoDiseno: result.momentoDiseno,
            advertencia: (result.advertencia || "") + holesUnsupportedNote,
            error: result.error,
            // AGREGADO (ver conversación, badge "✓ Validado vs. ETABS"):
            // mismo flag que buildShellMomentReferenceFromCombinedResult,
            // reenviado tal cual desde el backend en vez de asumir "siempre
            // validado" -- ver ese comentario para el detalle.
            validadoEtabs: result.validadoEtabs !== false,
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
            advertencia: (result.advertencia || "") + holesUnsupportedNote,
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
          //
          // AGREGADO (ver conversación, "8 componentes" 2026-08-31): la
          // zapata poligonal (triangular/trapezoidal, ver más arriba) pasa
          // `bounds: null` -- sus coordenadas YA vienen globales (el
          // backend recibe `meta.polygonPoints` tal cual, sin normalizar a
          // un origen local), así que el offset es 0. Su `campo` tampoco
          // trae V13/V23/VMax a propósito (probados, no confiables en esa
          // malla) -- quedan `undefined`, y getMomentValuesForCombo ya
          // maneja eso devolviendo un array vacío (sin datos que pintar).
          if (result.ok && result.campo && shellPolygon) {
            const offsetX = shellBounds?.minX || 0;
            const offsetY = shellBounds?.minY || 0;
            const globalXs = result.campo.x.map((x) => x + offsetX);
            const globalYs = result.campo.y.map((y) => y + offsetY);

            // AGREGADO (ver conversación, "rellenar huecos del FEM con
            // rígido, para poder revisarlo"): el método rígido de campo
            // (computeIsolatedMomentAtPoint) NO tiene el problema de
            // singularidad cerca de columna/borde -- se evalúa acá, en las
            // MISMAS coordenadas de la malla FEM, tomando el peor caso
            // (mayor valor absoluto) entre las 11 combinaciones -- mismo
            // criterio de envolvente que ya usa el propio campo FEM. Sirve
            // como respaldo visual donde el FEM no es confiable (ver
            // isPointOnMeshEdge/isPointInsideAnyColumn en
            // canvas2d/zapataMomentLayer.js, que deciden CUÁNDO usarlo) --
            // en vez de dejar un vacío con solo un aviso. Costo: 11 combos
            // × hasta ~2500 nodos por zapata, una sola vez al calcular
            // (no en cada frame) -- del orden de milisegundos.
            // Solo existe para la rama RECTANGULAR (fetchZapataShellDesignReference)
            // -- la rama poligonal (fetchZapataShellPoligonoDesignReference,
            // triangular/trapezoidal) comparte este mismo bloque de
            // resolución pero NO trae momentColumnSize/columnPosition/
            // polygonPoints en su push (usa `bounds: null`); sin esta
            // guarda, computeIsolatedMomentAtPoint recibiría columna/
            // polígono `undefined` y podría fallar. Ahí simplemente no
            // hay respaldo rígido (rigidMx/rigidMy quedan vacíos), y el
            // hover se comporta como antes (solo el aviso, sin relleno).
            const { momentColumnSize, columnSize, columnPosition, polygonPoints, overhangsBounds } = shellDesignPromises[i];
            const rigidMx = [];
            const rigidMy = [];
            if (momentColumnSize && columnPosition && polygonPoints) {
              for (let p = 0; p < globalXs.length; p++) {
                let peorMx = 0;
                let peorMy = 0;
                DEFAULT_LOAD_COMBINATIONS.forEach((_, comboIndex) => {
                  const sigma = netSigma(shellPolygon.max?.[comboIndex]);
                  const point = computeIsolatedMomentAtPoint(
                    globalXs[p], globalYs[p], columnPosition, momentColumnSize, sigma, polygonPoints, overhangsBounds
                  );
                  if (Math.abs(point.mx) > Math.abs(peorMx)) peorMx = point.mx;
                  if (Math.abs(point.my) > Math.abs(peorMy)) peorMy = point.my;
                });
                rigidMx.push(peorMx);
                rigidMy.push(peorMy);
              }
            }

            // AGREGADO (ver conversación, "hueco de aviso en volado corto
            // de cortante" -- zapata F3): cuando el volado NETO de una
            // cara (borde libre -> cara de columna) es menor que el
            // peralte efectivo d, el backend ya devuelve null para ESE
            // lado (`V13_cara_.../V23_cara_...`, ver
            // calcular_zapata_shell_completo en zapata_shell_solver.py) --
            // pero el CAMPO CRUDO (usado acá, en el Diagrama de
            // Resultantes) sigue teniendo un número en cada nodo de esa
            // franja, nunca validado (ahí gobierna punzonamiento, no
            // cortante de viga -- la sección crítica cae fuera de la
            // zapata). El aviso genérico de "borde de malla"
            // (isPointOnMeshEdge, 1.5 celdas) no siempre alcanza a cubrir
            // toda la franja si el volado es más angosto que ese margen
            // (confirmado con F3: volado 0.075m, margen de malla 0.0505m
            // -- quedaba un hueco de ~2.4cm sin ningún aviso). Se guarda
            // acá la MISMA decisión que ya tomó el backend (reusando
            // `cortanteDiseno`, no un umbral nuevo) más la posición de
            // cada cara en coordenadas GLOBALES (mismo sistema que x/y de
            // este objeto) para que el hover (canvas2d/renderer.js) pueda
            // cubrir ese hueco con `isPointInShortOverhangShear()`.
            const cd = result.cortanteDiseno;
            const volados = cd && columnPosition && columnSize
              ? {
                  xMenosCorto: cd.V13_cara_menos_x == null,
                  xMasCorto: cd.V13_cara_mas_x == null,
                  yMenosCorto: cd.V23_cara_menos_y == null,
                  yMasCorto: cd.V23_cara_mas_y == null,
                  faceMenosX: columnPosition.x - (columnSize.b || 0) / 2,
                  faceMasX: columnPosition.x + (columnSize.b || 0) / 2,
                  faceMenosY: columnPosition.y - (columnSize.h || 0) / 2,
                  faceMasY: columnPosition.y + (columnSize.h || 0) / 2,
                }
              : null;

            // AGREGADO (ver conversación, "V13/V23 disparado cerca de
            // columna" 2026-09-06): peralte efectivo, para el radio de
            // aviso de isPointNearColumnForShear (ver renderer.js) --
            // ese chequeo es aparte de `columns`, necesita saber qué tan
            // ancho hacer el margen alrededor de cada columna.
            shellPolygon.d = result.d;
            shellPolygon.momentField = {
              type: "isolated-fem",
              // AGREGADO (ver conversación, "hover roto en zapata aislada
              // poligonal" — caso real F2): la rama poligonal (bounds:null
              // en el push, ver más arriba) usa malla en ABANICO, no una
              // cuadrícula -- buildGridIndex (zapataGridIndex.js) necesita
              // saberlo para no asumir un paso de grilla que ahí no existe
              // (sin esto, el hover queda vacío aunque el color sí se pinte
              // bien, porque solo la indexación exacta por celda depende de
              // esa suposición).
              meshType: shellBounds ? "grid" : "fan",
              x: globalXs,
              y: globalYs,
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
              // Respaldo rígido -- SOLO existe para mx/my (el método rígido
              // no tiene torsión ni cortante, así que no hay equivalente
              // para mxy/v13/v23/mmax/mmin/vmax).
              rigidMx,
              rigidMy,
              volados,
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
      // AGREGADO (ver conversación, "Strip Based Design" ACI/SAFE):
      // calcula, para UNA columna (por índice, igual orden que
      // `columnasFem`/`momentosPorColumna`) y UNA cara ('menosX'/'masX'),
      // el momento Mx vía franja de columna, tomando el PEOR caso (mayor
      // valor absoluto) entre las 11 combinaciones -- mismo criterio de
      // envolvente que ya usa `Mx_diseno`. Devuelve null si falta
      // geometría (columna en el extremo sin vecino de ese lado, zapata
      // no rectangular, etc.) -- el llamador ya sabe no usarlo ahí.
      const stripMomentEnvelope = (mxStripInput, indiceOriginal, cara) => {
        if (!mxStripInput) return null;
        const columnaOrdenada = mxStripInput.columnasOrdenadas.find((c) => c.indiceOriginal === indiceOriginal);
        if (!columnaOrdenada) return null;
        const posicionEnOrdenados = mxStripInput.columnasOrdenadas.indexOf(columnaOrdenada);

        let peor = null;
        mxStripInput.momentsByCombo.forEach((momentByCombo) => {
          const resultado = computeColumnStripMoment(
            momentByCombo,
            mxStripInput.columnasOrdenadas,
            posicionEnOrdenados,
            columnaOrdenada.sizeAlongBeam
          )?.[cara];
          if (resultado?.perMetro == null) return;
          if (peor == null || Math.abs(resultado.perMetro) > Math.abs(peor.perMetro)) peor = resultado;
        });
        return peor;
      };

      const buildShellMomentReferenceFromCombinedResult = (result, mxStripInput = null) => {
        if (!result.ok) return { ok: false, error: result.error };

        const porColumna = result.momentosPorColumna || [];
        const envolvente = (campo) => {
          const validos = porColumna.map((c) => c[campo]).filter((v) => v != null);
          if (!validos.length) return null;
          return validos.reduce((peor, v) => (Math.abs(v) > Math.abs(peor) ? v : peor));
        };

        // AGREGADO (ver conversación 2026-08-30, "Strip Based Design" ACI/SAFE
        // -- ver computeColumnStripMoment en footingMoments.js para la
        // fórmula). CONSOLIDADO como método oficial (antes solo aparecía
        // como texto informativo en `advertencia`, "en validación"): el
        // cliente confirmó tolerar hasta 10% de diferencia contra ETABS, y
        // Strip Based ya cumple eso en el único caso real confirmado (F10
        // columna 20: 55-61% de error con el método anterior bajó a 3-11%
        // con franja de columna). Se calcula SOLO para caras `vano_corto`
        // SIN `region_d` -- la combinación validada; contra F12 (columnas
        // ADEMÁS cerca de borde libre) ni el signo salió bien, así que ahí
        // NO se calcula y esa cara sigue sin valor (ver advertencia abajo).
        const mxStripPorCara = [];
        porColumna.forEach((c, i) => {
          [
            ["mas", "Mx_cara_mas_x_vano_corto", "Mx_cara_mas_x_region_d", "masX"],
            ["menos", "Mx_cara_menos_x_vano_corto", "Mx_cara_menos_x_region_d", "menosX"],
          ].forEach(([lado, campoVano, campoRegionD, cara]) => {
            if (!c[campoVano] || c[campoRegionD]) return;
            const strip = stripMomentEnvelope(mxStripInput, i, cara);
            if (strip?.perMetro != null) {
              mxStripPorCara.push({ columna: i, lado, ...strip });
            }
          });
        });
        const stripPorColumnaLado = {};
        mxStripPorCara.forEach((m) => {
          stripPorColumnaLado[m.columna] = stripPorColumnaLado[m.columna] || {};
          stripPorColumnaLado[m.columna][m.lado] = m.perMetro;
        });

        // Mx_diseno por columna: usa el valor FEM normal si existe: si la
        // cara está en `vano_corto` (sin region_d) y por eso el FEM vino en
        // null, se rellena con el valor de franja de columna calculado
        // arriba -- ES el valor de diseño ahora, no solo referencia.
        const mxPorColumnaConStrip = porColumna.map((c, i) => {
          if (c.Mx_diseno != null) return c.Mx_diseno;
          const strip = stripPorColumnaLado[i];
          if (!strip) return null;
          const candidatos = [strip.mas, strip.menos].filter((v) => v != null);
          return candidatos.length ? candidatos.reduce((peor, v) => (Math.abs(v) > Math.abs(peor) ? v : peor)) : null;
        }).filter((v) => v != null);
        const mxResumen = mxPorColumnaConStrip.length
          ? mxPorColumnaConStrip.reduce((peor, v) => (Math.abs(v) > Math.abs(peor) ? v : peor))
          : null;

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
        // AGREGADO (ver conversación 2026-08-30): distingue caras vano_corto
        // que SÍ quedaron cubiertas por Strip Based (arriba) de las que no
        // tienen ningún valor (el caso doblemente marcado, vano_corto Y
        // region_d a la vez -- ej. F10 columna 29 -- donde Strip Based
        // tampoco se calcula, ni tampoco cuando falta geometría de vecino;
        // sigue sin solución conocida).
        const columnasVanoCortoSinStrip = porColumna.some((c, i) => {
          const strip = stripPorColumnaLado[i];
          const masFaltante = c.Mx_cara_mas_x_vano_corto && strip?.mas == null;
          const menosFaltante = c.Mx_cara_menos_x_vano_corto && strip?.menos == null;
          return masFaltante || menosFaltante;
        });

        // AGREGADO (ver conversación, umbral de región D ampliado a 2d y
        // por EJE completo de columna): con el criterio ampliado es común
        // que TODAS las caras Mx de una zapata combinada corta (columnas
        // cerca de borde libre en X) queden en región D -- ahí no hay
        // ningún valor de Mx que mostrar. My ya no cae en este caso
        // porque siempre tiene el respaldo de BPR.
        let advertencia = result.advertencia || "";
        if (mxStripPorCara.length) {
          // CONSOLIDADO (2026-08-30): Strip Based ya es el valor de diseño
          // real para estas caras (ver mxPorColumnaConStrip arriba), no solo
          // referencia informativa -- validado dentro del margen que el
          // cliente confirmó aceptar (10% vs. ETABS; caso real F10 columna
          // 20: 3-11%).
          const detalle = mxStripPorCara
            .map((m) => `columna ${m.columna + 1} cara ${m.lado === "mas" ? "+" : "-"}x: ${m.perMetro.toFixed(2)} Tonf·m/m`)
            .join("; ");
          advertencia =
            (result.advertencia || "") +
            ` Mx (longitudinal) de al menos una columna con vano corto se calculó con el método de franja de columna (ACI/SAFE "Strip Based Design") en vez de la lectura puntual del FEM -- validado contra ETABS real dentro del margen aceptado: ${detalle}.`;
        }
        if (columnasVanoCortoSinStrip) {
          advertencia +=
            " Al menos una cara con vano muy corto (luz al punto medio < 2.5×d) sigue sin ningún valor confiable -- ni FEM, ni método rígido, ni franja de columna (suele coincidir con estar además cerca de un borde libre). Requiere revisión manual de un ingeniero para esa cara específica.";
        }
        if (mxResumen == null) {
          advertencia +=
            " Esta zapata combinada no tiene ningún valor de Mx (longitudinal) confiable -- todas las caras quedan cerca de un borde libre (región D) o en vano corto sin franja aplicable. Usa el momento del método rígido (más abajo) para Mx. My (transversal) sí está disponible, calculado con el método de franja efectiva de Bowles (validado ~0.3-5% vs. ETABS).";
        } else if (mxFueraDeRegionD) {
          advertencia +=
            " Al menos una cara Mx de columna cerca de un borde libre no tiene valor FEM confiable (región D) -- revisar el momento del método rígido (más abajo) para esa cara.";
        }
        if (myUsoBpr) {
          advertencia +=
            " My (transversal) de al menos una columna se calculó con el método de franja efectiva de Bowles (promedio, no punto exacto) por estar cerca de un borde libre -- validado ~0.3-5% vs. ETABS real.";
        }

        return {
          ok: true,
          momentoDiseno: { Mx_diseno: mxResumen, My_diseno: myResumen },
          advertencia,
          // CONSOLIDADO (2026-08-30) -- método de franja de columna (Strip
          // Based), ya usado como el Mx_diseno real para las caras vano_corto
          // que cubre (ver mxPorColumnaConStrip arriba). Se expone también
          // aparte, estructurado, por si se quiere mostrar el detalle por
          // columna en el modal en vez de solo el texto de advertencia.
          mxStripPorCara,
          // AGREGADO (ver conversación, badge "✓ Validado vs. ETABS" del
          // modal): antes el badge se mostraba SIEMPRE igual sin importar la
          // figura, contradiciendo esta misma `advertencia` (p.ej. en L dice
          // "NUNCA contra un caso real de ETABS" pero el badge decía
          // "Validado"). Se reenvía tal cual el flag que ya manda el backend
          // por figura (rectangular/trapezoidal/polígono: true: L: false) en
          // vez de adivinarlo del texto de advertencia (frágil).
          validadoEtabs: result.validadoEtabs !== false,
        };
      };

      if (shellCombinedDesignPromises.length) {
        const results = await Promise.all(shellCombinedDesignPromises.map((p) => p.promise));
        results.forEach((result, i) => {
          const {
            index, polygon: shellPolygon, originX, originY,
            leg: legPromise, columnasLocales, quEnvBrazo,
          } = shellCombinedDesignPromises[i];
          if (!polygonProperties[index]) return;

          shellPolygon.combinedShellMoments = result;
          // mxStripInput (franja de columna, ver más arriba) solo se
          // arma para el brazo rectangular -- trapezoidal/L pasan
          // undefined y buildShellMomentReferenceFromCombinedResult
          // simplemente no calcula nada de esto ahí (sin validar todavía).
          polygonProperties[index].shellMomentReference = buildShellMomentReferenceFromCombinedResult(
            result,
            polygonProperties[index].mxStripInput
          );

          // AGREGADO (ver conversación, "8 componentes en combinadas"
          // 2026-08-31): mismo criterio que ya usan las aisladas más
          // arriba (type:"isolated-fem") -- reemplaza el momentField
          // "combined" (solo Mx, del método rígido) por el campo REAL de
          // elementos finitos (los 8 componentes) cuando el FEM combinado
          // sí pudo calcularse. Coordenadas LOCALES del solver (0..Lx,
          // 0..Ly) + origen del brazo (originX/originY) = globales, igual
          // que las demás coordenadas del polígono.
          if (result.ok && result.campo && shellPolygon) {
            const globalXs = result.campo.x.map((x) => x + originX);
            const globalYs = result.campo.y.map((y) => y + originY);

            // AGREGADO (ver conversación, "conectar el rígido para
            // combinadas, con la misma validación rigurosa que aisladas"):
            // reutiliza `combinedMoments` (computeCombinedFootingMoments),
            // YA calculado más arriba para esta misma zapata -- NO se
            // vuelve a resolver la viga, solo se evalúa `momentAt(x)` (ya
            // cerrado sobre columnas/carga de cada combo) en las MISMAS
            // coordenadas de la malla FEM, tomando el peor caso entre los
            // 11 combos. A diferencia de la aislada, acá el rígido SOLO
            // da UNA componente (la del eje de la viga, `beamAxis`) -- es
            // un modelo 1D (momento constante a través del ancho), no un
            // campo 2D como computeIsolatedMomentAtPoint.
            //
            // OJO -- ADVERTENCIA YA EXISTENTE EN ESTE ARCHIVO (ver el
            // comentario sobre por qué el momento rígido NUNCA se
            // sustituyó automáticamente en Región D para combinadas): la
            // convención de signo de `momentAt` (sagging positivo/hogging
            // negativo, pensada para el envolvente de acero) puede NO
            // coincidir con la convención Mx/My del FEM (tipo ETABS) sin
            // verificar. Por eso este valor se EXPONE (selector "M11/M22
            // (rígido)", para poder validarlo con datos reales) pero NO
            // se usa como relleno automático de los avisos -- ver el
            // chequeo `momentField.type !== "combined-fem"` en
            // canvas2d/renderer.js, que a propósito lo excluye del
            // auto-relleno hasta confirmar el signo con casos reales.
            let rigidMx = null;
            let rigidMy = null;
            const leg = shellPolygon.combinedMoments?.legs?.[0];
            if (leg?.momentsByCombo?.length) {
              const beamAxis = leg.momentsByCombo[0].beamAxis;
              const origin = leg.momentsByCombo[0].origin || 0;
              const rigidAlongBeam = globalXs.map((_, p) => {
                const posLocal = (beamAxis === "x" ? globalXs[p] : globalYs[p]) - origin;
                let peor = 0;
                leg.momentsByCombo.forEach((combo) => {
                  const m = combo.momentAt(posLocal);
                  if (Math.abs(m) > Math.abs(peor)) peor = m;
                });
                return peor;
              });
              if (beamAxis === "x") rigidMx = rigidAlongBeam;
              else rigidMy = rigidAlongBeam;

              // AGREGADO (ver conversación, "componente transversal del
              // rígido de combinadas" -- Morales, Diseño en Concreto
              // Armado ICG/ACI Perú 2016, Cap.12 sec.3.2.1 paso "g":
              // "Diseñar la cimentación en dirección transversal en forma
              // equivalente al de zapatas aisladas"). Para cada punto de
              // la malla, se trata la sección transversal como un
              // voladizo de zapata AISLADA, usando la columna MÁS CERCANA
              // (en la dirección del eje de la viga) como su apoyo --
              // computeIsolatedMomentAtPoint ya da ambas direcciones de
              // un voladizo aislado; solo se toma la componente
              // PERPENDICULAR al eje de la viga (la longitudinal ya sale
              // del bloque de arriba). A diferencia de esa, este método
              // NO tiene el problema de "equilibrio de fuerzas roto con
              // presión uniforme" que sí se encontró en
              // computeContinuousBeamMoment (ver prueba_libro_morales.mjs,
              // Versión A vs B) -- es un voladizo simple apoyado en la
              // columna, no una viga libre-libre que deba autoequilibrarse
              // sobre toda su longitud.
              if (columnasLocales?.length && legPromise) {
                const legPoints = [
                  { x: legPromise.minX, y: legPromise.minY },
                  { x: legPromise.maxX, y: legPromise.minY },
                  { x: legPromise.maxX, y: legPromise.maxY },
                  { x: legPromise.minX, y: legPromise.maxY },
                ];
                // Coordenadas LOCALES (antes del offset originX/originY) --
                // mismo sistema que columnasLocales/legPromise.
                const localXs = result.campo.x;
                const localYs = result.campo.y;

                const transversal = localXs.map((_, p) => {
                  const xL = localXs[p];
                  const yL = localYs[p];
                  let colCercana = columnasLocales[0];
                  let distMin = Infinity;
                  columnasLocales.forEach((col) => {
                    const d = beamAxis === "x" ? Math.abs(col.x - xL) : Math.abs(col.y - yL);
                    if (d < distMin) {
                      distMin = d;
                      colCercana = col;
                    }
                  });
                  const point = computeIsolatedMomentAtPoint(
                    xL, yL,
                    { x: colCercana.x, y: colCercana.y },
                    { b: colCercana.bx, h: colCercana.by },
                    quEnvBrazo, legPoints, legPromise
                  );
                  return beamAxis === "x" ? point.my : point.mx;
                });

                if (beamAxis === "x") rigidMy = transversal;
                else rigidMx = transversal;
              }
            }

            // Ver mismo comentario en el bloque "isolated-fem" arriba.
            shellPolygon.d = result.d;
            shellPolygon.momentField = {
              type: "combined-fem",
              x: globalXs,
              y: globalYs,
              mx: result.campo.Mx,
              my: result.campo.My,
              mxy: result.campo.Mxy,
              v13: result.campo.V13,
              v23: result.campo.V23,
              mmax: result.campo.MMax,
              mmin: result.campo.MMin,
              vmax: result.campo.VMax,
              rigidMx,
              rigidMy,
            };
          }
        });
      }

      // AGREGADO (ver conversación): zapata combinada TRAPEZOIDAL -- misma
      // forma de respuesta y mismo criterio de envolvente/BPR/región D que
      // la rectangular combinada de arriba (calcular_zapata_shell_
      // trapezoidal_combinada). Validada contra un caso real de ETABS
      // (F18: M11/M22/M12 entre -20% y +5% de mediana, ver documentación
      // del proyecto) tras encontrar y corregir un ajuste de signo
      // específico de esta forma.
      if (shellTrapezoidalDesignPromises.length) {
        const results = await Promise.all(shellTrapezoidalDesignPromises.map((p) => p.promise));
        results.forEach((result, i) => {
          const { index, polygon: shellPolygon, geo } = shellTrapezoidalDesignPromises[i];
          if (!polygonProperties[index]) return;

          shellPolygon.combinedShellMoments = result;
          polygonProperties[index].shellMomentReference = buildShellMomentReferenceFromCombinedResult(result);

          // AGREGADO (ver conversación, "8 componentes" 2026-08-31): campo
          // real (M11/M22/M12/MMax/MMin, sin V13/V23/VMax -- cortante no
          // resuelto para esta forma) para el Diagrama de Resultantes.
          // Coordenadas LOCALES del solver (x en [0,L] -- o un sub-rango si
          // el backend recortó la malla cerca de una punta de ancho casi
          // nulo, ver `poligono`/origen_x en zapata_shell_solver.py; y=
          // perpendicular CRUDA, ya no un offset respecto a una línea
          // central interpolada) -- solo hace falta sumar geo.origin/geo.
          // localPoints para volver a coordenadas globales.
          if (result.ok && result.campo && shellPolygon && geo) {
            const toGlobal = (xLocal, yLocal) => {
              const along = geo.origin + xLocal;
              const perp = yLocal;
              return geo.beamAxis === "x" ? { x: along, y: perp } : { x: perp, y: along };
            };
            const globalPts = result.campo.x.map((x, i2) => toGlobal(x, result.campo.y[i2]));
            // Ver mismo comentario en el bloque "isolated-fem" mas arriba.
            shellPolygon.d = result.d;
            shellPolygon.momentField = {
              type: "combined-fem",
              x: globalPts.map((p) => p.x),
              y: globalPts.map((p) => p.y),
              mx: result.campo.Mx,
              my: result.campo.My,
              mxy: result.campo.Mxy,
              mmax: result.campo.MMax,
              mmin: result.campo.MMin,
              // AGREGADO (ver conversación, "completar cortante
              // trapezoidal" 2026-09-06): V13/V23/VMax, recién resueltos
              // en el solver (antes esta forma no los traía). Mismo
              // criterio sin rotación adicional que ya usan mx/my acá
              // (ver esa misma limitación conocida si algún día un caso
              // real usa geo.beamAxis==="y").
              v13: result.campo.V13,
              v23: result.campo.V23,
              vmax: result.campo.VMax,
            };
          }
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
          const { index, polygon: shellPolygon, originX, originY } = shellLDesignPromises[i];
          if (!polygonProperties[index]) return;

          shellPolygon.combinedShellMoments = result;
          polygonProperties[index].shellMomentReference = buildShellMomentReferenceFromCombinedResult(result);

          // AGREGADO (ver conversación, "8 componentes" 2026-08-31): campo
          // real (8 componentes, incluido cortante -- esta forma sí lo
          // resolvió, misma malla rectangular sin transformación que la
          // combinada recta) para el Diagrama de Resultantes. Coordenadas
          // LOCALES del bounding box + origen = globales (offset simple,
          // sin línea central variable como en la trapezoidal).
          if (result.ok && result.campo && shellPolygon) {
            // Ver mismo comentario en el bloque "isolated-fem" mas arriba.
            shellPolygon.d = result.d;
            shellPolygon.momentField = {
              type: "combined-fem",
              x: result.campo.x.map((x) => x + originX),
              y: result.campo.y.map((y) => y + originY),
              mx: result.campo.Mx,
              my: result.campo.My,
              mxy: result.campo.Mxy,
              v13: result.campo.V13,
              v23: result.campo.V23,
              mmax: result.campo.MMax,
              mmin: result.campo.MMin,
              vmax: result.campo.VMax,
            };
          }
        });
      }

      // AGREGADO (ver conversación, "completa Fase 1" 2026-09-04): LOSA DE
      // CIMENTACIÓN (columnas en cuadrícula 2D sobre un contorno
      // arbitrario) -- misma forma de respuesta que la L (calcular_zapata_
      // shell_poligono_combinada, FASE 1: apoyo SIEMPRE rígido, carga real
      // por zona vía qNube, sin cortante de diseño ni respaldo rígido
      // todavía). A diferencia de la L, el backend hace su propia
      // localización interna y devuelve `minX`/`minY` (esta forma no tiene
      // un "origen de bounding box" evidente del lado del llamador como sí
      // tiene el rincón L) -- se usan para volver global el campo.
      if (shellPoligonoCombinadaDesignPromises.length) {
        const results = await Promise.all(shellPoligonoCombinadaDesignPromises.map((p) => p.promise));
        results.forEach((result, i) => {
          const { index, polygon: shellPolygon, columnsInPolygon: columnasDeEsteGrupo } = shellPoligonoCombinadaDesignPromises[i];
          if (!polygonProperties[index]) return;

          shellPolygon.combinedShellMoments = result;
          polygonProperties[index].shellMomentReference = buildShellMomentReferenceFromCombinedResult(result);

          if (result.ok && result.campo && shellPolygon) {
            const originX = Number(result.minX) || 0;
            const originY = Number(result.minY) || 0;
            // Ver mismo comentario en el bloque "isolated-fem" mas arriba.
            shellPolygon.d = result.d;
            shellPolygon.momentField = {
              type: "combined-fem",
              // AGREGADO (ver conversación, "no vota magnitudes al pasar el
              // cursor" -- zapata trapezoidal con 2 cortes, 2026-09-10):
              // con hueco el solver usa malla CONFORME (triangulación
              // restringida) -- puntos DISPERSOS, sin paso de grilla
              // constante, igual que la malla en abanico de la aislada
              // poligonal. Sin marcarlo, buildGridIndex (zapataGridIndex.js)
              // asume un paso de grilla y el hover nunca acierta el punto
              // bajo el cursor (el color SÍ se pinta, solo la indexación
              // exacta se rompe). "conforme" activa el índice de vecino más
              // cercano, igual que "fan".
              meshType: result.metodo === "conforme" ? "conforme" : "grid",
              x: result.campo.x.map((x) => x + originX),
              y: result.campo.y.map((y) => y + originY),
              mx: result.campo.Mx,
              my: result.campo.My,
              mxy: result.campo.Mxy,
              v13: result.campo.V13,
              v23: result.campo.V23,
              mmax: result.campo.MMax,
              mmin: result.campo.MMin,
              vmax: result.campo.VMax,
            };
          }

          // Bloque 5 (acero) — FASE 1: envolvente del momento de diseño (ya
          // con Región D aplicada por columna) entre TODAS las columnas,
          // por eje -- mismo criterio "peor caso" que ya usan aisladas/
          // corridas (buildSteelResult). El reparto positivo/negativo por
          // tramo de la combinada recta no aplica aún a una cuadrícula 2D
          // (no hay un solo eje de viga).
          const designInputs = polygonProperties[index]?.designInputs;
          const porColumna = result.momentosPorColumna || [];
          if (result.ok && designInputs) {
            const envolvente = (campo) => {
              const validos = porColumna.map((c) => c[campo]).filter((v) => v != null);
              return validos.length ? validos.reduce((peor, v) => (Math.abs(v) > Math.abs(peor) ? v : peor)) : null;
            };
            const muX = envolvente("Mx_diseno");
            const muY = envolvente("My_diseno");
            polygonProperties[index].steelDesign = {
              type: "poligono",
              x: muX != null ? buildSteelResult(Math.abs(muX), designInputs) : null,
              y: muY != null ? buildSteelResult(Math.abs(muY), designInputs) : null,
            };
          }

          // Bloque 6 (cortante) — FASE 2 (ver conversación, "empieza la
          // fase 2" 2026-09-04; docstring completo en calcular_zapata_
          // shell_poligono_combinada, sección "CORTANTE DE DISEÑO"):
          // punzonamiento SIEMPRE (chequeo local por columna, no depende
          // de vecinos) + cortante unidireccional SOLO en los volados
          // REALES (dirección sin otra columna alineada más allá -- entre
          // 2 columnas vecinas hay acción de losa en 2 direcciones, ahí
          // gobierna punzonamiento, no cortante de viga en 1 dirección;
          // no hay fórmula validada para ese caso, ver docstring).
          if (result.ok && designInputs && shellPolygon) {
            const quEnv = quEnvelope(shellPolygon);
            const ALIGN_TOL_M = 0.5; // metros -- tolerancia para "misma fila/columna" de la cuadrícula

            const tieneVecinoAlineado = (colX, colY, direccion) =>
              (columnasDeEsteGrupo || []).some((otra) => {
                const ox = Number(otra.x);
                const oy = Number(otra.y);
                if (Math.abs(ox - colX) < 1e-6 && Math.abs(oy - colY) < 1e-6) return false; // la misma columna
                if (direccion === "mas_x") return Math.abs(oy - colY) < ALIGN_TOL_M && ox > colX;
                if (direccion === "menos_x") return Math.abs(oy - colY) < ALIGN_TOL_M && ox < colX;
                if (direccion === "mas_y") return Math.abs(ox - colX) < ALIGN_TOL_M && oy > colY;
                return Math.abs(ox - colX) < ALIGN_TOL_M && oy < colY; // "menos_y"
              });

            const punchingByColumn = [];
            const oneWayByColumn = [];

            porColumna.forEach((c) => {
              const columnRow = (columnasDeEsteGrupo || []).find(
                (row) => Math.abs(Number(row.x) - c.x) < 1e-3 && Math.abs(Number(row.y) - c.y) < 1e-3
              );
              if (!columnRow) return;
              const columnId = columnRow.column ?? columnRow.id;
              const columnSize = getColumnSectionSize(this.shapes || [], columnId);

              punchingByColumn.push({
                column: columnId,
                result: computePunchingShear({
                  puTon: puEnvelope(columnRow),
                  quTonM2: quEnv,
                  columnBcm: columnSize.b * 100,
                  columnHcm: columnSize.h * 100,
                  fpcMPa: designInputs.fpc,
                  thicknessM: designInputs.thicknessM,
                  recubrimientoM: designInputs.recubrimientoM,
                }),
              });

              [
                ["mas_x", "volado_mas_x", "Cortante +X"],
                ["menos_x", "volado_menos_x", "Cortante −X"],
                ["mas_y", "volado_mas_y", "Cortante +Y"],
                ["menos_y", "volado_menos_y", "Cortante −Y"],
              ].forEach(([direccion, campoVolado, etiqueta]) => {
                if (tieneVecinoAlineado(c.x, c.y, direccion)) return; // panel entre 2 columnas -- gobierna punzonamiento
                const volado = c[campoVolado];
                if (volado == null) return;
                oneWayByColumn.push({
                  column: columnId,
                  direccion,
                  etiqueta,
                  result: computeOneWayShear({
                    overhangM: volado,
                    quTonM2: quEnv,
                    fpcMPa: designInputs.fpc,
                    thicknessM: designInputs.thicknessM,
                    recubrimientoM: designInputs.recubrimientoM,
                  }),
                });
              });
            });

            polygonProperties[index].shearDesign = {
              type: "poligono",
              punchingByColumn,
              oneWayByColumn,
              advertencia:
                "Punzonamiento: misma fórmula ya validada de aisladas/combinadas (E.060/ACI) -- en columnas de BORDE u ESQUINA (la mayoría en una losa de cimentación real) sobreestima el perímetro crítico b0 y no considera momento no balanceado (Munb), limitación ya conocida, revisar con criterio de ingeniero. Cortante unidireccional: solo se calcula en los volados reales (sin columna vecina alineada) con la misma fórmula de aisladas -- entre columnas vecinas (acción de losa en 2 direcciones) no hay chequeo de cortante de viga todavía, gobierna punzonamiento ahí.",
            };
          }
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
   * AGREGADO (ver conversación): "Presión 2D" y "Diagrama de Resultantes"
   * (toolbar.blade.php) antes prendían/apagaban su capa con un simple
   * toggle inline (`showZapataPressureLayer = !showZapataPressureLayer`),
   * sin chequear si "Calcular Zapatas" ya corrió — ambas capas leen
   * `this._lastZapataCalculationResults` (ver drawZapataPressureLayer/
   * drawZapataMomentLayer en renderer.js), que solo existe DESPUÉS de un
   * cálculo exitoso (se asigna al final de calculateZapatas()). Sin este
   * chequeo, el botón "prendía" la capa pero no se veía nada, sin ninguna
   * pista de por qué. Solo se avisa al querer ENCENDER la capa (apagar una
   * ya encendida no necesita datos).
   */
  toggleZapataPressureLayer() {
    if (!this.showZapataPressureLayer && !this._lastZapataCalculationResults) {
      this.showMessage("Primero corre \"Calcular Zapatas\".", "warning");
      return;
    }
    this.showZapataPressureLayer = !this.showZapataPressureLayer;
  },

  toggleZapataMomentLayer() {
    if (!this.showZapataMomentLayer && !this._lastZapataCalculationResults) {
      this.showMessage("Primero corre \"Calcular Zapatas\".", "warning");
      return;
    }
    this.showZapataMomentLayer = !this.showZapataMomentLayer;
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

  /**
   * AGREGADO (ver conversación, "zapata corrida bajo muro de carga"):
   * marca una zapata (0 columnas adentro, hoy ignorada por
   * calculateZapatas) como corrida, guarda el espesor del muro
   * (`area.corridaEspesorMuroM`, único dato manual que hace falta -- σ ya
   * viene calculado del análisis real, ver comentario en calculateZapatas)
   * y devuelve el diseño (Mu/Acero/Cortante) YA CALCULADO, para que el
   * modal lo pinte al toque sin tener que volver a correr "Calcular
   * Zapatas" completo -- mismo espíritu que setZapataSigmaAdmisible, pero
   * acá SÍ hay que recalcular (a diferencia de sigmaAdmisible, que es
   * independiente de Mu/Acero/Cortante).
   *
   * `designInputs` los manda el modal (los mismos f'c/fy/espesor/
   * recubrimiento que ya captura para aisladas/combinadas en ese mismo
   * polígono) -- si el ingeniero no los ha llenado todavía, devuelve solo
   * el momento (sin Acero/Cortante), igual que hace Bloque 4/5 para
   * aislada/combinada cuando faltan.
   */
  setZapataCorrida(areaId, { esZapataCorrida, corridaEspesorMuroM, quEnvelope, designInputs } = {}) {
    const area = (this.areas || []).find((a) => Number(a.id) === Number(areaId));
    if (!area) return null;

    area.esZapataCorrida = !!esZapataCorrida;
    area.corridaEspesorMuroM = Number(corridaEspesorMuroM) || 0;

    if (!area.esZapataCorrida) return null;

    const points = area.points || [];
    const edges = computeEdgeLengths(points);
    const anchoZapataM = computeRectangularDimensions(points, edges)?.B ?? null;
    if (anchoZapataM == null) return { error: "not_rectangular" };

    const { momentoVoladizo: muEnvelope, voladizo } = computeZapataCorridaMoment(
      anchoZapataM,
      area.corridaEspesorMuroM,
      Number(quEnvelope) || 0
    );

    const result = { muEnvelope, voladizo, steel: null, shear: null };

    if (designInputs) {
      const steelRaw = computeFootingFlexuralSteel({
        muTonM: muEnvelope,
        fpcMPa: designInputs.fpc,
        fyMPa: designInputs.fy,
        thicknessM: designInputs.thicknessM,
        recubrimientoM: designInputs.recubrimientoM,
      });
      const rebar = steelRaw.as ? suggestRebarSpacing(steelRaw.as, designInputs.thicknessM) : null;
      result.steel = { ...steelRaw, rebar };

      result.shear = computeOneWayShear({
        overhangM: voladizo,
        quTonM2: Number(quEnvelope) || 0,
        fpcMPa: designInputs.fpc,
        thicknessM: designInputs.thicknessM,
        recubrimientoM: designInputs.recubrimientoM,
      });
    }

    return result;
  },
};

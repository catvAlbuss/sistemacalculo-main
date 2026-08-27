// diagrams/frameForceDiagramScale.js
//
// Una sola regla para CUÁNTO se estira un diagrama al dibujarlo.
//
// EL PROBLEMA QUE RESUELVE
//   El valor de un diagrama se dibuja como una distancia perpendicular a la
//   barra:  distancia = valor × FACTOR. Ese FACTOR es la AMPLITUD, y no toca
//   los números: dos programas con el mismo momento lo dibujan distinto si
//   eligen otra amplitud.
//
//   El 2D y el 3D la elegían con reglas DISTINTAS:
//     3D  ->  modelSpan × 0.08, en METROS  (proporcional al edificio)
//     2D  ->  42 PÍXELES fijos             (ni proporcional ni estable al zoom)
//
//   Con eso la misma barra salía con panzas muy distintas en las dos vistas, y
//   en 2D el diagrama crecía/encogía respecto del modelo cada vez que se hacía
//   zoom (el modelo se achica en pantalla, el diagrama sigue midiendo 42 px).
//   Comparado contra la elevación de ETABS, el 2D dibujaba varias veces más
//   grande de lo que corresponde.
//
// LA REGLA
//   La altura del diagrama MÁXIMO es una fracción del tamaño del modelo, en
//   unidades de modelo. El 2D la convierte a píxeles con el zoom actual, así
//   que las dos vistas dibujan lo mismo y el zoom deja de afectar la
//   proporción. Es el criterio de ETABS.

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Altura del diagrama máximo, como fracción del tamaño del modelo. */
export const DIAGRAM_SPAN_FRACTION = 0.08;

/** Piso en metros: en un modelo chiquito el diagrama no puede desaparecer. */
export const DIAGRAM_MIN_HEIGHT_M = 0.2;

/** Techo: nunca más del 40% del modelo, o tapa la estructura. */
export const DIAGRAM_MAX_SPAN_FRACTION = 0.4;

/**
 * `diagramHeightPx` del panel se conserva como CONTROL RELATIVO (42 = 1.0), no
 * como una medida en píxeles: así el slider que ya existe sigue funcionando sin
 * tocar la UI, pero ahora escala una altura en metros.
 */
function heightControl(display) {
    return clamp(Number(display?.diagramHeightPx || 42) / 42, 0.2, 4);
}

function manualFactor(display) {
    return display?.autoScale === false
        ? clamp(Number(display?.scaleFactor || 1), 0.05, 10)
        : 1;
}

/** Tamaño del modelo = la mayor de sus tres dimensiones. */
export function getModelSpanFromPoints(points = []) {
    if (!points.length) return 1;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    points.forEach((p) => {
        const x = Number(p?.x || 0);
        const y = Number(p?.y || 0);
        const z = Number(p?.z || 0);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
    });

    return Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1);
}

/** Igual que arriba, desde los nodos del CAD (`node.position`). */
export function getModelSpanFromNodes(nodes = []) {
    return getModelSpanFromPoints(nodes.map((n) => n?.position || n));
}

/**
 * Altura (en UNIDADES DE MODELO) que debe tener el diagrama del valor máximo.
 * La comparten 2D y 3D — es el único lugar donde vive la amplitud.
 */
export function getDiagramTargetHeightModel(modelSpan, display) {
    const span = Math.max(Number(modelSpan) || 0, 1);

    return clamp(
        span * DIAGRAM_SPAN_FRACTION * heightControl(display) * manualFactor(display),
        DIAGRAM_MIN_HEIGHT_M,
        span * DIAGRAM_MAX_SPAN_FRACTION,
    );
}

/**
 * Píxeles por unidad de modelo en la vista 2D actual.
 *
 * Se mide proyectando dos puntos separados 1 unidad en vez de leer el zoom de
 * la grilla: la proyección es ortográfica (`grid.worldToScreen`, ver
 * `projectPoint` en canvas2d/renderer.js) así que esto da el valor exacto sin
 * depender de cómo se llame internamente el campo del zoom.
 */
export function getPixelsPerModelUnit(CADSystem) {
    const toScreen = CADSystem?.grid?.worldToScreen;

    if (typeof toScreen !== "function") return 1;

    const a = toScreen.call(CADSystem.grid, { x: 0, y: 0 });
    const b = toScreen.call(CADSystem.grid, { x: 1, y: 0 });
    const px = Math.hypot(Number(b?.x || 0) - Number(a?.x || 0),
                          Number(b?.y || 0) - Number(a?.y || 0));

    return px > 1e-9 ? px : 1;
}

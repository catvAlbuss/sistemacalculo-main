// mixins/io/file-io/e2kAreaGeometry.js
//
// Geometría de ÁREAS para el exportador .e2k: muros y elementos inclinados.
//
// QUÉ FALTABA
//   El exportador trataba a todas las áreas igual y plano:
//     - `AREA ... FLOOR` fijo → los muros salían como losa
//     - offsets de vértice fijos en `0` → toda losa inclinada salía HORIZONTAL
//     - `POINT "P" x y` sin el 3er valor → no había forma de bajar un vértice
//     - `SHELLPROP ... PROPTYPE "Slab"` fijo → no existía la sección de muro
//     - el dedup de áreas usaba SOLO la huella en planta, así que un muro
//       (cuya proyección en planta es una línea) chocaba con cualquier otra
//       área sobre esa misma traza
//   Con eso, un modelo con muros o techo inclinado se exportaba y ETABS lo
//   abría plano y sin placas. El IMPORT ya sabía leer todo esto; el export no
//   lo escribía.
//
// LA CONVENCIÓN (la misma que interpreta e2k-import.js, ver areaStoryOffsets)
//   AREA "W14" PANEL 4 "95" "117" "58" "28"   1 0 0 1
//                └ keyword    └ puntos en planta  └ story offset por vértice
//
//   - keyword: FLOOR para losa, PANEL para muro (y para faldones de techo).
//   - story offset: 0 = el piso al que se asigna el área, 1 = un piso abajo…
//     Un muro de un nivel es `1 1 0 0` o `1 0 0 1` según el orden de vértices.
//   - El área se asigna al piso MÁS ALTO de sus vértices, y el resto baja.
//   - `POINT "P" x y z` — el 3er valor es cuánto BAJA ese punto respecto de la
//     elevación de su piso: el import hace `zPt = zStoryPt - c.z`.

/**
 * "wall" o "slab".
 *
 * Manda la etiqueta del modelo (`areaType`/`type`), pero si falta se decide por
 * GEOMETRÍA: un área cuyos vértices caen todos sobre una misma recta en planta
 * es un panel vertical, no una losa. Mismo criterio que ya usa el exportador
 * para columnas ("clasificación geométrica, no por etiqueta").
 *
 * Sin este respaldo, un muro sin `areaType` se escribía como `FLOOR` con dos
 * puntos de planta repetidos y sin caída: superficie NULA. ETABS lo rechaza con
 * "Area Object F6 not correctly defined".
 */
export function classifyArea(area) {
    const etiqueta = String(area?.areaType || area?.type || "").toLowerCase();

    if (etiqueta === "wall") return "wall";
    if (etiqueta === "slab" || etiqueta === "floor" || etiqueta === "deck") return "slab";

    return isVerticalInPlan(area?.points) ? "wall" : "slab";
}

/**
 * ¿Los vértices son colineales en planta? (⇒ el área es un panel vertical)
 * Se mide el área del polígono proyectado: si es despreciable frente a su
 * tamaño, no hay superficie en planta.
 */
export function isVerticalInPlan(points = []) {
    const pts = Array.isArray(points) ? points : [];
    if (pts.length < 3) return false;

    let area2 = 0;
    let escala = 0;

    for (let i = 0; i < pts.length; i += 1) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const ax = Number(a?.x) || 0, ay = Number(a?.y) || 0;
        const bx = Number(b?.x) || 0, by = Number(b?.y) || 0;
        area2 += ax * by - bx * ay;
        escala = Math.max(escala, Math.hypot(bx - ax, by - ay));
    }

    if (escala < 1e-6) return false;

    // Área en planta despreciable comparada con el lado más largo al cuadrado.
    return Math.abs(area2 / 2) < escala * escala * 1e-3;
}

/** Palabra clave del bloque AREA CONNECTIVITIES. */
export function areaKeyword(kind) {
    return kind === "wall" ? "PANEL" : "FLOOR";
}

/** PROPTYPE del bloque SHELL PROPERTIES. */
export function shellPropType(kind) {
    return kind === "wall" ? "Wall" : "Slab";
}

const EPS = 1e-4;

/**
 * Elevaciones de piso ordenadas de menor a mayor, con su nombre.
 * `stories` es la lista del modelo; se acepta `{name, elevation}` o `{name, z}`.
 */
export function buildStoryLevels(stories = []) {
    return (stories || [])
        .map((s) => ({
            name: String(s?.name ?? s?.id ?? "").trim(),
            z: Number(s?.elevation ?? s?.z ?? s?.level ?? 0) || 0,
        }))
        .filter((s) => s.name)
        .sort((a, b) => a.z - b.z);
}

/**
 * Piso "dueño" de un punto SUELTO (nodo de columna/viga, no vértice de área)
 * y cuánto BAJA respecto de ese piso. Mismo criterio de `storyIndexFor` que
 * usa `describeArea` (el punto cuelga del piso en o por ENCIMA, nunca hacia
 * arriba) — sin esto, una columna o viga inclinada (que no llega al nivel
 * pleno de su piso, como un parante o correa de techo a dos aguas) se
 * registraba con drop 0 y salía plana, aunque el import ya sabía leerla así.
 * Validado contra un .e2k real: LINE "C21" COLUMN "13"→"301" 2 (Story1 a
 * Story3), con el punto "301" a 2.7548 m por debajo de Story3 — exactamente
 * lo que devuelve esta función para ese z.
 */
export function describePointDrop(z, levels) {
    if (!levels.length) return { storyName: null, drop: 0 };
    const idx = storyIndexFor(Number(z) || 0, levels);
    const story = levels[idx];
    const d = story.z - (Number(z) || 0);
    return { storyName: story.name, drop: Math.abs(d) < EPS ? 0 : d };
}

/** Índice del piso cuya elevación es la más cercana por ARRIBA de z (o el más cercano). */
function storyIndexFor(z, levels) {
    if (!levels.length) return -1;

    let mejor = 0;
    let dist = Infinity;

    levels.forEach((s, i) => {
        // Se prefiere el piso que está EN o por ENCIMA del punto: en ETABS el
        // vértice cuelga de su piso hacia abajo, nunca hacia arriba.
        const d = s.z >= z - EPS ? s.z - z : Infinity;
        if (d < dist) {
            dist = d;
            mejor = i;
        }
    });

    if (dist === Infinity) {
        // Por encima del último piso (p. ej. una cumbrera modelada sin piso
        // propio): se cuelga del más alto y el residuo sale negativo, que es
        // como ETABS sube un punto sobre su nivel.
        return levels.length - 1;
    }

    return mejor;
}

/**
 * Descompone un área en lo que el .e2k necesita.
 *
 * Devuelve `{ storyName, offsets, drops, kind, keyword }`:
 *   - `storyName`: el piso al que se asigna (el más alto de sus vértices)
 *   - `offsets[i]`: cuántos pisos por debajo del asignado cae el vértice i
 *   - `drops[i]`:   cuánto BAJA el vértice i respecto de la elevación de SU
 *                   piso, en metros (el 3er valor de POINT). 0 si calza justo.
 *
 * Devuelve `null` si no hay pisos o el área no tiene al menos 3 vértices.
 */
export function describeArea(area, levels) {
    const pts = Array.isArray(area?.points) ? area.points : [];
    if (pts.length < 3 || !levels.length) return null;

    const kind = classifyArea(area);
    const zs = pts.map((p) => Number(p?.z ?? 0) || 0);

    // El área pertenece al piso del vértice MÁS ALTO.
    const idxPorVertice = zs.map((z) => storyIndexFor(z, levels));
    const idxArea = Math.max(...idxPorVertice);

    const offsets = idxPorVertice.map((i) => idxArea - i);
    const drops = zs.map((z, i) => {
        const suPiso = levels[idxPorVertice[i]];
        const d = suPiso.z - z;
        return Math.abs(d) < EPS ? 0 : d;
    });

    return {
        kind,
        keyword: areaKeyword(kind),
        storyName: levels[idxArea].name,
        offsets,
        drops,
    };
}

/**
 * Firma vertical de un área, para el dedup del bloque AREA CONNECTIVITIES.
 *
 * Sin esto, el dedup por huella en planta metía en la misma definición a un
 * muro y a la losa que apoya sobre su traza — y peor, a dos faldones de techo
 * con la misma planta y distinta pendiente.
 */
export function verticalSignature(desc) {
    if (!desc) return "flat";
    return `${desc.keyword}|${desc.offsets.join(",")}|${desc.drops.map((d) => d.toFixed(4)).join(",")}`;
}

/**
 * Un muro vertical proyecta en planta una LÍNEA: sus 4 esquinas caen sobre 2
 * puntos de planta repetidos. Eso es correcto y así lo escribe ETABS, pero hay
 * que saberlo para no confundirlo con un área degenerada y descartarla.
 */
export function isDegenerateInPlan(planPointNames = []) {
    return new Set(planPointNames).size < 2;
}

// mixins/analysis/seismic/columnEndOffsets.js
//
// Brazos de nudo de las COLUMNAS, para que el reporte de fuerzas vaya sobre la
// LUZ LIBRE y no de eje a eje, como hace ETABS.
//
// `_buildBeamEndOffsetsForSeismic` (payload.js) resuelve el caso simétrico:
// para una VIGA, el brazo es media huella de la columna que llega al nudo. Pero
// solo lo hace para vigas, así que las columnas quedaban reportando de eje a eje
// — verificado contra ETABS: su modal de la columna C6 dice "J-End 2.4000,
// Length 3.0000" y el nuestro decía "Extremo j 3.0000". Los VALORES estaban
// bien; el rango del reporte no, y por eso los extremos parecían no calzar.
//
// Acá el brazo de cada extremo de columna es **medio peralte de la viga más
// alta que llega a ese nudo**: la parte de la columna que queda dentro del
// paquete de vigas. En la base no llega ninguna viga → brazo 0, igual que
// ETABS ("I-End 0.0000").
//
// NOTA sobre la diferencia que va a quedar contra ETABS: su brazo arriba es el
// peralte COMPLETO (0.60 m para una V30x60), no la mitad, porque el
// `CARDINALPT 8` del .e2k cuelga la viga entera por debajo del nivel. Nosotros
// no modelamos el punto de inserción (ver el registro de cambios), así que en
// NUESTRO modelo la viga está centrada en el nivel y medio peralte es lo
// geométricamente correcto. Reportar 0.6 sería reportar una luz libre que
// nuestro modelo no tiene.

/** ¿La barra es vertical (columna)? Mismo criterio que el resto del payload. */
function isVertical(a, b) {
    const dz = Math.abs(b.z - a.z);
    const horiz = Math.hypot(b.x - a.x, b.y - a.y);
    return dz > 1e-6 && dz >= horiz;
}

/** Peralte de la sección en metros, o 0 si no se puede resolver. */
function sectionDepth(sec) {
    const raw = Number(sec?.h ?? sec?.height);
    if (raw > 0) return raw <= 3 ? raw : raw / 100; // ≤3 ya está en m; si no, cm

    // Sin dimensiones: lado equivalente por área (exacto para cuadradas).
    const A = Number(sec?.A ?? sec?.area) || 0;
    return A > 0 ? Math.sqrt(A) : 0;
}

/**
 * Brazos de nudo de las columnas.
 *
 * @param {object} ctx      el mixin (usa _massNodeCoord/_resolveMassNode y los
 *                          resolutores de sección, igual que payload.js)
 * @param {Array}  frames   todas las barras del modelo
 * @returns {Map<number, {i: number, j: number}>} por id de columna, en metros
 */
export function buildColumnEndOffsets(ctx, frames = []) {
    const out = new Map();
    if (!Array.isArray(frames) || !frames.length) return out;

    const coord = (n) => ctx._massNodeCoord(ctx._resolveMassNode(n));
    const nodeId = (n) => Number(ctx._resolveMassNode(n)?.id ?? n);

    // Peralte de la viga MÁS ALTA que llega a cada nudo.
    const deepestBeamAtNode = new Map();

    frames.forEach((f) => {
        if (!f?.node1 || !f?.node2) return;

        const a = coord(f.node1);
        const b = coord(f.node2);
        if (isVertical(a, b)) return; // las columnas no aportan brazo a otras columnas

        const sec =
            ctx._getSectionDefinitionForSeismic(ctx._getFrameSectionNameForSeismic(f)) || {};
        const h = sectionDepth(sec);
        if (!(h > 0)) return;

        [nodeId(f.node1), nodeId(f.node2)].forEach((nid) => {
            if (!Number.isFinite(nid)) return;
            if (h > (deepestBeamAtNode.get(nid) || 0)) deepestBeamAtNode.set(nid, h);
        });
    });

    if (!deepestBeamAtNode.size) return out;

    frames.forEach((f) => {
        if (!f?.node1 || !f?.node2) return;

        const a = coord(f.node1);
        const b = coord(f.node2);
        if (!isVertical(a, b)) return;

        const L = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
        if (!(L > 0)) return;

        const half = (nid) => (deepestBeamAtNode.get(nid) || 0) / 2;
        let oi = half(nodeId(f.node1));
        let oj = half(nodeId(f.node2));

        // Nunca dejar la columna sin tramo reportable.
        const max = L * 0.45;
        oi = Math.min(oi, max);
        oj = Math.min(oj, max);

        if (oi > 1e-6 || oj > 1e-6) {
            out.set(Number(f.id), { i: oi, j: oj });
        }
    });

    return out;
}

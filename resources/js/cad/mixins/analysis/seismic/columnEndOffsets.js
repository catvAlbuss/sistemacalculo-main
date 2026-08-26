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
// Acá el brazo de cada extremo de columna es el **peralte COMPLETO de la viga
// más alta que llega a ese nudo**: la parte de la columna que queda dentro del
// paquete de vigas. En la base no llega ninguna viga → brazo 0, igual que
// ETABS ("I-End 0.0000"). Ver el comentario junto a `peralte` más abajo para
// por qué es el peralte entero y no la mitad.
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
/**
 * Seccion de una barra, tolerando que ya venga RESUELTA.
 *
 * `_getFrameSectionNameForSeismic` devuelve `frame.section` primero, y en un
 * modelo importado del .e2k eso es un OBJETO, no un nombre. Pasarselo a
 * `_getSectionDefinitionForSeismic` da `String(obj) = "[object Object]"`, que no
 * matchea nada y devuelve vacio.
 *
 * Los demas llamadores del payload sobreviven porque encadenan fallbacks
 * (`?? frame.A ?? frame._A`); este modulo no tenia ninguno, asi que
 * `sectionDepth` daba 0, ninguna viga aportaba peralte y el Map salia VACIO EN
 * SILENCIO: las columnas reportaban de eje a eje (0->3.0) en vez de la luz libre
 * (0->2.4) como ETABS, que es justo lo que este archivo existe para arreglar.
 * Verificado en el payload real de MINI2: las vigas traian endOffset 0.225 y las
 * columnas ninguno.
 */
function seccionDe(ctx, f) {
    const bruto = ctx._getFrameSectionNameForSeismic(f);
    if (bruto && typeof bruto === "object") return bruto;
    return ctx._getSectionDefinitionForSeismic(bruto) || {};
}

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

        const sec = seccionDe(ctx, f);
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

        // Peralte COMPLETO de la viga, no la mitad.
        //
        // La luz libre de una columna (`ln` de ACI 318 / E.060) va desde la cara
        // superior del entrepiso de abajo hasta la CARA INFERIOR de la viga de
        // arriba: se descuenta el peralte entero. Es ademas lo que ya hace
        // `_rcEstimateClearHeight` para el corte por capacidad (2.4 y no 2.7 en
        // un piso de 3.0 con viga de 0.60) — el reporte era el inconsistente.
        //
        // Coincide con ETABS, que ademas cuelga la viga entera bajo el nivel por
        // el `CARDINALPT 8` (top center) que traen los .e2k: sus estaciones de
        // columna van de 0 a 2.4, y medio peralte dejaba las nuestras en 2.7.
        //
        // Medido en `MODELO video.e2k` (C30X40, momento gobernante): con medio
        // peralte el error del TOPE contra el PMM Envelope quedaba en 20.2%
        // mientras la base estaba en 2.5%; toda esa diferencia era la estacion.
        const peralte = (nid) => deepestBeamAtNode.get(nid) || 0;
        let oi = peralte(nodeId(f.node1));
        let oj = peralte(nodeId(f.node2));

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

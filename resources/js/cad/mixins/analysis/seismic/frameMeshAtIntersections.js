// mixins/analysis/seismic/frameMeshAtIntersections.js
//
// Partir las barras en los nudos que caen SOBRE su tramo, como el
// `MESHATINTERSECTIONS "YES"` de ETABS.
//
// POR QUÉ
//   Una viga que corre sobre un muro (o que cruza la malla de una losa)
//   importada del .e2k llegaba como UN elemento atado solo en sus extremos: la
//   viga "flota" sobre el muro en vez de apoyarse en él. Se ve en la FORMA del
//   cortante — ETABS lo da escalonado, nosotros constante.
//
//   Medido en MODULO 1 contra ETABS (2026-08-10, caso SDX, ratio del pico de M3):
//   las vigas que ETABS malló en 2–3 elementos daban 0.31–0.50, mientras que las
//   que malló en 10 (B12–B15) daban ~1.0. El error escalaba con lo GRUESO de
//   nuestra discretización, que es la firma de este problema.
//
// ESTÁ APAGADO POR DEFECTO — leer el comentario de `meshBeamsAtIntersections`
// en payload.js antes de encenderlo. Resumen: arregla Story1 (lo que se buscaba)
// pero degrada Story3, y esa degradación viene de OTRO error todavía abierto
// (la losa Membrane con flexión de placa completa), no del mallado.
//
// LOS NUDOS YA EXISTEN
//   No hay que crear nada: los nudos intermedios vienen del .e2k (son las
//   esquinas de muro y los vértices de la malla de losa) y ya viajan en el
//   payload. Simplemente no los usábamos. Verificado en MODULO 1: 36 de 88
//   elementos tienen nudos interiores, y los cortes calzan EXACTO con los
//   sub-elementos que reporta ETABS (B16 → 1.50 y 5.63 m; B12 → 9 cortes cada
//   0.713 m; B11 → 7 cortes).
//
// QUÉ SE PARTE Y QUÉ NO
//   Solo `elementType === "beam"`. Las COLUMNAS no lo necesitan (sus nudos
//   interiores son de piso, no de malla) y los BRACES el motor los puede modelar
//   como truss pin-pin: una cadena de tramos truss colineales deja los nudos
//   intermedios con rotación libre → matriz singular. Ver
//   [[project_orphan_nodes_singular_matrix]] para el mismo tipo de falla.

/** Distancia máxima de un nudo al eje de la barra para considerarlo "sobre" ella. */
const DEFAULT_TOLERANCE_M = 0.02;

/** Fracción de la luz que se ignora en los extremos (ahí está el nudo propio). */
const END_MARGIN = 0.02;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/**
 * Parte las vigas en los nudos interiores que ya existen en el modelo.
 *
 * @param {object[]} nodeList     nodos del payload ({id,x,y,z})
 * @param {object[]} elemList     elementos del payload
 * @param {object[]} memberLoads  cargas de tramo (se replican a cada sub-tramo)
 * @param {object}   opts         { tolerance }
 * @returns {{elements, memberLoads, mesh, stats}}
 *   mesh  → Map<subElementId, {parentId, index}>, para rearmar los resultados
 *   stats → {split, subElements} para poder avisar en consola
 */
export function splitBeamsAtInteriorNodes(nodeList = [], elemList = [], memberLoads = [], opts = {}) {
    const tol = Number(opts.tolerance) || DEFAULT_TOLERANCE_M;

    const byId = new Map();
    nodeList.forEach((n) => byId.set(Number(n.id), {
        id: Number(n.id), x: Number(n.x) || 0, y: Number(n.y) || 0, z: Number(n.z) || 0,
    }));

    let nextId = elemList.reduce((m, e) => Math.max(m, Number(e.id) || 0), 0) + 1;

    const elements = [];
    const mesh = new Map();
    const loadsByParent = new Map();
    memberLoads.forEach((l) => {
        const k = Number(l.element);
        if (!loadsByParent.has(k)) loadsByParent.set(k, []);
        loadsByParent.get(k).push(l);
    });

    const outLoads = [];
    let splitCount = 0;

    elemList.forEach((el) => {
        const a = byId.get(Number(el.node_i));
        const b = byId.get(Number(el.node_j));
        const parentLoads = loadsByParent.get(Number(el.id)) || [];

        const keep = () => {
            elements.push(el);
            outLoads.push(...parentLoads);
        };

        if ((el.elementType || "") !== "beam" || !a || !b) return keep();

        const L = dist(a, b);
        if (!(L > 1e-6)) return keep();

        // Nudos que caen sobre el eje, con su posición a lo largo de la barra.
        const cuts = [];
        byId.forEach((p) => {
            if (p.id === a.id || p.id === b.id) return;
            const t =
                ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y) + (p.z - a.z) * (b.z - a.z)) /
                (L * L);
            if (!(t > END_MARGIN && t < 1 - END_MARGIN)) return;
            const proj = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y), z: a.z + t * (b.z - a.z) };
            if (dist(p, proj) <= tol) cuts.push({ t, id: p.id });
        });

        if (!cuts.length) return keep();

        cuts.sort((p, q) => p.t - q.t);
        const chain = [a.id, ...cuts.map((c) => c.id), b.id];

        splitCount += 1;
        for (let k = 0; k < chain.length - 1; k += 1) {
            const first = k === 0;
            const last = k === chain.length - 2;
            const id = nextId;
            nextId += 1;

            // Los brazos rígidos son del OBJETO, no del tramo: el de arranque va
            // al primer sub-tramo y el de llegada al último. Si fueran a todos,
            // cada nudo interior recortaría el diagrama.
            const { endOffsetI, endOffsetJ, ...rest } = el;

            elements.push({
                ...rest,
                id,
                node_i: chain[k],
                node_j: chain[k + 1],
                ...(first && endOffsetI != null ? { endOffsetI } : {}),
                ...(last && endOffsetJ != null ? { endOffsetJ } : {}),
            });

            mesh.set(id, { parentId: Number(el.id), index: k });

            // Carga de tramo: todas las que maneja el payload hoy son UNIFORMES
            // (`kind: "uniform"`, peso propio y losa→viga), así que la misma w
            // vale para cada sub-tramo. Si algún día entra una carga puntual o
            // trapezoidal, hay que repartirla por posición — se avisa abajo.
            parentLoads.forEach((l) => outLoads.push({ ...l, element: id }));
        }

        const raras = parentLoads.filter((l) => (l.kind || "uniform") !== "uniform");
        if (raras.length) {
            console.warn(
                `⚠️ Barra ${el.id}: se partió en ${chain.length - 1} tramos pero tiene ` +
                `carga de tramo NO uniforme (${raras.map((l) => l.kind).join(", ")}), ` +
                "que se replicó tal cual y probablemente esté mal repartida.",
            );
        }
    });

    return {
        elements,
        memberLoads: outLoads,
        mesh,
        stats: { split: splitCount, subElements: elements.length - (elemList.length - splitCount) },
    };
}

/**
 * Rearma los resultados de fuerzas: junta los sub-tramos en su barra padre,
 * corriendo la estación de cada uno por lo que miden los anteriores.
 *
 * Se usa el `length` que devuelve el MOTOR (no la geometría) porque ya viene
 * descontado el brazo rígido, así que las estaciones encajan sin recalcular nada.
 *
 * Igual que ETABS, la estación del nudo interior queda DUPLICADA (fin de un
 * tramo y arranque del siguiente): ahí el cortante salta, y colapsar los dos
 * puntos en uno borraría justamente el escalón que se quería representar.
 */
export function mergeMeshedFrameForces(frameForces = [], mesh) {
    if (!mesh || !mesh.size) return frameForces;

    const out = [];
    const grupos = new Map(); // `${parentId}|${caseId}|${comboId}` → [{index, rec}]

    frameForces.forEach((rec) => {
        const info = mesh.get(Number(rec.frameId));
        if (!info) return out.push(rec);
        const key = `${info.parentId}|${rec.caseId ?? ""}|${rec.comboId ?? ""}`;
        if (!grupos.has(key)) grupos.set(key, []);
        grupos.get(key).push({ index: info.index, parentId: info.parentId, rec });
    });

    grupos.forEach((partes) => {
        partes.sort((a, b) => a.index - b.index);
        const stations = [];
        let offset = 0;
        partes.forEach(({ rec }) => {
            (rec.stations || []).forEach((s) => {
                stations.push({ ...s, station: Number(s.station || 0) + offset });
            });
            offset += Number(rec.length) || 0;
        });

        const total = offset || 1;
        stations.forEach((s) => { s.relativeStation = s.station / total; });

        const base = partes[0].rec;
        out.push({
            ...base,
            frameId: partes[0].parentId,
            length: offset,
            stations,
            // Se recalculan aguas arriba (normalizeBackendResults) sobre las
            // estaciones ya unidas; los del sub-tramo serían de un pedazo solo.
            max: undefined,
            min: undefined,
        });
    });

    return out;
}

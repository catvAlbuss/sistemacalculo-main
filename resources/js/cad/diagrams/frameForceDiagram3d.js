import * as BABYLON from "@babylonjs/core";

import {
    getFrameForceIndex,
    getDiagramSide,
} from "./frameForceDiagramUtils.js";
import { toDisplayUnits } from "./frameForceUnits.js";
import { getDiagramTargetHeightModel } from "./frameForceDiagramScale.js";

const LAYER_KEY = "__jhFrameForceDiagram3D";

const COMPONENT_COLORS = {
    P: new BABYLON.Color3(0.20, 0.85, 0.45),
    V2: new BABYLON.Color3(1.00, 0.75, 0.05),
    V3: new BABYLON.Color3(0.05, 0.80, 1.00),
    T: new BABYLON.Color3(1.00, 0.25, 0.80),
    M2: new BABYLON.Color3(0.55, 0.50, 1.00),
    M3: new BABYLON.Color3(1.00, 0.40, 0.05),
};

const ETABS_3D_STYLE = {
    useSignColors: true,

    positiveColor: new BABYLON.Color3(1.0, 0.88, 0.05), // amarillo ETABS
    negativeColor: new BABYLON.Color3(1.0, 0.18, 0.06), // rojo/naranja ETABS
    zeroColor: new BABYLON.Color3(0.05, 0.05, 0.05),    // línea base oscura

    positiveAlpha: 0.55,
    negativeAlpha: 0.58,

    edgeAlpha: 1,
    stationAlpha: 0.82,

    zeroLineAlpha: 0.95,
};

function getLayerState(scene) {
    if (!scene[LAYER_KEY]) {
        scene[LAYER_KEY] = {
            meshes: [],
            summary: null,
        };
    }

    return scene[LAYER_KEY];
}

function mapPointToBabylon(point) {
    return new BABYLON.Vector3(
        Number(point?.x || 0),
        Number(point?.z || 0),
        Number(point?.y || 0),
    );
}

function resolveFrameNodes(frame, nodeMap) {
    const node1 =
        typeof frame?.node1 === "object"
            ? frame.node1
            : nodeMap.get(String(frame?.node1));

    const node2 =
        typeof frame?.node2 === "object"
            ? frame.node2
            : nodeMap.get(String(frame?.node2));

    return { node1, node2 };
}

function isFrameSelected(frame, context) {
    if (
        frame?.selected === true ||
        frame?.isSelected === true ||
        frame?.highlighted3D === true
    ) {
        return true;
    }

    const selected = [
        ...(context?.selectedBeams || []),
        ...(context?.selectedObjects || []),
        ...(context?.selectedBeamsState?.selectedObjects || []),
        ...(context?.currentState?.selectedObjects || []),
    ];

    return selected.some(
        (item) => String(item?.id) === String(frame?.id),
    );
}

// Mismo índice cacheado que usa el renderer 2D: evita un `.find()` sobre todos
// los registros por cada barra del modelo en cada reconstrucción de la escena.
function findFrameForceRecord(results, frameId, display) {
    const index = getFrameForceIndex(
        results,
        display?.caseId || "CM",
        display?.comboId,
    );

    return index ? index.byFrame.get(String(frameId)) : undefined;
}

/**
 * Ejes locales que REPORTÓ EL MOTOR para esa barra, pasados a Babylon.
 *
 * Es la única fuente válida: el motor los deriva del `vecxz` con el que armó el
 * elemento en OpenSees, así que son los ejes en los que están expresados P, V2,
 * V3, T, M2 y M3. `calculateFrameLocalAxes3D` los ADIVINA por geometría y para
 * las COLUMNAS da otra cosa:
 *
 *   columna vertical → motor:  local2 = +X mundo   (vecxz [0,1,0], calibrado
 *                                                   contra ETABS)
 *                    → visor:  local2 = +Y mundo
 *
 * O sea 90° cruzados: el diagrama de M3 de las columnas se dibujaba en el plano
 * equivocado, y según el ángulo de cámara se leía como invertido. Encima la
 * adivinanza geométrica ignora `localAxisAngle` (columnas rotadas), que el
 * motor sí respeta.
 *
 * Mapeo mundo → Babylon: (x, y, z) → (x, z, y), igual que mapPointToBabylon.
 */
function axesFromRecord3D(record, fallback) {
    const a2 = record?.localAxes?.axis2;
    const a3 = record?.localAxes?.axis3;

    if (!Array.isArray(a2) || !Array.isArray(a3) || !fallback) return fallback;

    const toBabylon = (v) =>
        new BABYLON.Vector3(Number(v[0]) || 0, Number(v[2]) || 0, Number(v[1]) || 0);

    const local2 = toBabylon(a2);
    const local3 = toBabylon(a3);

    if (local2.lengthSquared() < 1e-12 || local3.lengthSquared() < 1e-12) {
        return fallback;
    }

    return {
        local1: fallback.local1,
        local2: local2.normalize(),
        local3: local3.normalize(),
    };
}

export function calculateFrameLocalAxes3D(start, end) {
    const local1 = end.subtract(start);

    if (local1.lengthSquared() < 1e-12) {
        return null;
    }

    local1.normalize();

    const globalUp = new BABYLON.Vector3(0, 1, 0);

    const reference =
        Math.abs(BABYLON.Vector3.Dot(local1, globalUp)) > 0.98
            ? new BABYLON.Vector3(0, 0, 1)
            : globalUp;

    const local3 = BABYLON.Vector3.Cross(local1, reference).normalize();
    const local2 = BABYLON.Vector3.Cross(local3, local1).normalize();

    return { local1, local2, local3 };
}

// El lado de cada componente sale de `getDiagramSide` (frameForceDiagramUtils.js),
// que es la fuente ÚNICA para el 2D, el 3D y el diálogo por barra. Vivía
// duplicado acá y el 2D ni la tenía → M3 salía espejado entre las dos vistas.
function getDiagramDirection(component, axes) {
    const axis = component === "V3" || component === "M2" ? axes.local3 : axes.local2;
    const side = getDiagramSide(component);

    return side === 1 ? axis : axis.scale(-1);
}

export function clearFrameForceDiagrams3D(viewerState) {
    const scene = viewerState?.scene;

    if (!scene?.[LAYER_KEY]) {
        return 0;
    }

    const layer = scene[LAYER_KEY];
    let removed = 0;

    layer.meshes.forEach((mesh) => {
        if (mesh && !mesh.isDisposed?.()) {
            // Etiquetas y lotes comparten materiales cacheados en la escena
            // (LABEL_MATERIAL_CACHE / DIAGRAM_MATERIAL_CACHE), así que su
            // material NO se destruye con el mesh: si se destruyera, el resto
            // se quedaría con una textura muerta y habría que recrearla en cada
            // reconstrucción, que es justamente lo que hacía lento esto.
            const sharesMaterial =
                mesh.metadata?.sharedMaterial === true ||
                mesh.metadata?.objectKind === "etabsValueLabel3D";

            mesh.dispose(false, !sharesMaterial);
            removed += 1;
        }
    });

    layer.meshes = [];
    layer.summary = null;

    return removed;
}

/**
 * Libera los materiales de etiqueta cacheados. Solo hace falta al desmontar la
 * escena — mientras se siga mostrando diagramas, conviene que sobrevivan.
 */
export function disposeFrameForceLabelCache3D(viewerState) {
    const scene = viewerState?.scene;

    if (!scene) return 0;

    let removed = 0;

    [LABEL_MATERIAL_CACHE, DIAGRAM_MATERIAL_CACHE].forEach((cacheKey) => {
        const cache = scene[cacheKey];

        if (!cache) return;

        cache.forEach((material) => {
            material?.dispose?.(true, true);
            removed += 1;
        });

        cache.clear();
    });

    return removed;
}

const PLANAR_COMPONENTS = new Set(["V2", "V3", "M2", "M3"]);
const AXIAL_COMPONENTS = new Set(["P"]);
const TORSION_COMPONENTS = new Set(["T"]);

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function getStationRatio(station, record) {
    const relative = Number(station?.relativeStation);

    if (Number.isFinite(relative)) {
        return clamp(relative, 0, 1);
    }

    const distance = Number(station?.station || 0);
    const length = Number(record?.length || 0);

    return length > 0 ? clamp(distance / length, 0, 1) : 0;
}

function getModelSpan(context) {
    const positions = (context.nodes || [])
        .map((node) => node?.position)
        .filter(Boolean);

    if (!positions.length) {
        return 10;
    }

    const xs = positions.map((point) => Number(point.x || 0));
    const ys = positions.map((point) => Number(point.y || 0));
    const zs = positions.map((point) => Number(point.z || 0));

    return Math.max(
        Math.max(...xs) - Math.min(...xs),
        Math.max(...ys) - Math.min(...ys),
        Math.max(...zs) - Math.min(...zs),
        1,
    );
}

// La regla vive en frameForceDiagramScale.js, compartida con el 2D: tenerla
// duplicada fue justo lo que dejó al 2D dibujando con 42 px fijos mientras el
// 3D usaba una fracción del modelo, y las dos vistas mostraban la misma barra
// con panzas distintas.
function getTargetDiagramHeight(context, display) {
    return getDiagramTargetHeightModel(getModelSpan(context), display);
}

function registerDiagramMesh(layer, mesh, metadata) {
    if (!mesh) return null;

    mesh.isPickable = false;
    mesh.metadata = {
        objectType: "frameForceDiagram3D",
        type: "frameForceDiagram3D",
        ...metadata,
    };

    layer.meshes.push(mesh);
    return mesh;
}

// ── Batching estilo ETABS ────────────────────────────────────────────────
//
// Antes se creaba una malla Y UN MATERIAL POR SEGMENTO de diagrama: con 11
// estaciones son 10 segmentos por barra, así que un modelo de 190 barras
// generaba ~4400 mallas y ~1900 materiales — o sea ~4400 draw calls y otros
// tantos cambios de shader en CADA cuadro que dibuja Babylon. De ahí la
// lentitud, no del cálculo.
//
// ETABS dibuja el diagrama completo en unos pocos lotes. Acá se acumula toda
// la geometría del modelo en buckets por (color, alpha) y se emite UNA malla
// por bucket: el diagrama entero queda en ~6 mallas y ~2 materiales,
// independientemente de cuántas barras tenga el modelo.

const DIAGRAM_MATERIAL_CACHE = "__jhDiagramMatCache";

// Tope de barras rotuladas en 3D (ver renderFrameForceDiagramLayer3D).
//
// Las etiquetas sobre el modelo están APAGADAS por defecto
// (`display.showValues`, ver DEFAULT_FRAME_DIAGRAM_DISPLAY): rotular cientos de
// barras a la vez es ilegible y caro (cada etiqueta es un plano con billboard).
// Para leer valores se hace **clic derecho sobre la barra** y se abre el
// diálogo con SUS diagramas, como en ETABS — ver frameForceMemberDialog.js.
// Este tope solo actúa si el usuario las vuelve a encender a mano.
const MAX_LABELED_FRAMES_3D = 60;

function colorKey3D(color) {
    return `${color.r.toFixed(3)}_${color.g.toFixed(3)}_${color.b.toFixed(3)}`;
}

function getCachedDiagramMaterial3D(scene, color, alpha) {
    if (!scene[DIAGRAM_MATERIAL_CACHE]) {
        scene[DIAGRAM_MATERIAL_CACHE] = new Map();
    }

    const cache = scene[DIAGRAM_MATERIAL_CACHE];
    const key = `${colorKey3D(color)}_${alpha.toFixed(3)}`;
    const hit = cache.get(key);

    if (hit) return hit;

    const material = new BABYLON.StandardMaterial(
        `jh_ff_batch_mat_${cache.size}`,
        scene,
    );

    material.diffuseColor = color;
    material.emissiveColor = color.scale(0.35);
    material.specularColor = BABYLON.Color3.Black();
    material.alpha = alpha;
    material.backFaceCulling = false;
    material.disableLighting = true;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    cache.set(key, material);

    return material;
}

function createDiagramBatch() {
    return { fills: new Map(), lines: new Map() };
}

/** Acumula el cuadrilátero de un segmento (2 triángulos) en su bucket de color. */
function pushBatchQuad(batch, color, alpha, a, b, c, d) {
    if (!batch) return false;

    const key = `${colorKey3D(color)}_${alpha.toFixed(3)}`;
    let bucket = batch.fills.get(key);

    if (!bucket) {
        bucket = { color, alpha, positions: [], indices: [], count: 0 };
        batch.fills.set(key, bucket);
    }

    const i0 = bucket.count;

    [a, b, c, d].forEach((p) => bucket.positions.push(p.x, p.y, p.z));
    bucket.count += 4;
    bucket.indices.push(i0, i0 + 1, i0 + 2, i0, i0 + 2, i0 + 3);

    return true;
}

/** Acumula un tramo de línea en su bucket de (color, alpha, grupo de render). */
function pushBatchLine(batch, color, alpha, renderingGroupId, p1, p2) {
    if (!batch) return false;

    const key = `${colorKey3D(color)}_${alpha.toFixed(3)}_${renderingGroupId}`;
    let bucket = batch.lines.get(key);

    if (!bucket) {
        bucket = { color, alpha, renderingGroupId, lines: [] };
        batch.lines.set(key, bucket);
    }

    bucket.lines.push([p1, p2]);

    return true;
}

function pushBatchPolyline(batch, color, alpha, renderingGroupId, points) {
    if (!batch || !points?.length) return false;

    for (let i = 0; i < points.length - 1; i += 1) {
        pushBatchLine(batch, color, alpha, renderingGroupId, points[i], points[i + 1]);
    }

    return true;
}

/** Emite las mallas de los buckets acumulados. Una por bucket. */
function flushDiagramBatch(scene, layer, batch, metadata = {}) {
    if (!batch) return 0;

    let emitted = 0;

    batch.fills.forEach((bucket, key) => {
        if (!bucket.indices.length) return;

        const mesh = new BABYLON.Mesh(`jh_ff_fill_batch_${key}`, scene);
        const data = new BABYLON.VertexData();
        const normals = [];

        BABYLON.VertexData.ComputeNormals(bucket.positions, bucket.indices, normals);

        data.positions = bucket.positions;
        data.indices = bucket.indices;
        data.normals = normals;
        data.applyToMesh(mesh);

        mesh.material = getCachedDiagramMaterial3D(scene, bucket.color, bucket.alpha);
        mesh.renderingGroupId = 1;
        mesh.alphaIndex = 10;
        mesh.isPickable = false;

        registerDiagramMesh(layer, mesh, {
            ...metadata,
            objectKind: "etabsSignedFillBatch",
            sharedMaterial: true,
        });

        emitted += 1;
    });

    batch.lines.forEach((bucket, key) => {
        if (!bucket.lines.length) return;

        const mesh = BABYLON.MeshBuilder.CreateLineSystem(
            `jh_ff_line_batch_${key}`,
            { lines: bucket.lines },
            scene,
        );

        mesh.color = bucket.color;
        mesh.alpha = bucket.alpha;
        mesh.renderingGroupId = bucket.renderingGroupId;
        mesh.isPickable = false;

        registerDiagramMesh(layer, mesh, {
            ...metadata,
            objectKind: "etabsLineBatch",
        });

        emitted += 1;
    });

    return emitted;
}

function getEtabsSignedColor(value, fallbackColor) {
    if (ETABS_3D_STYLE.useSignColors !== true) {
        return fallbackColor;
    }

    const n = Number(value || 0);

    if (n < 0) {
        return ETABS_3D_STYLE.negativeColor;
    }

    return ETABS_3D_STYLE.positiveColor;
}

function getEtabsSegmentAlpha(value) {
    const n = Number(value || 0);

    if (n < 0) {
        return ETABS_3D_STYLE.negativeAlpha;
    }

    return ETABS_3D_STYLE.positiveAlpha;
}

function createEtabsDiagramMaterial(scene, name, color, alpha = 0.55) {
    const material = new BABYLON.StandardMaterial(
        `${name}_${Date.now()}_${Math.random()}`,
        scene
    );

    material.diffuseColor = color;
    material.emissiveColor = color.scale(0.28);
    material.specularColor = BABYLON.Color3.Black();
    material.alpha = alpha;
    material.backFaceCulling = false;
    material.disableLighting = true;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    return material;
}

function createEtabsSegmentRibbon3D({
    scene,
    layer,
    frame,
    baselineA,
    baselineB,
    diagramA,
    diagramB,
    signValue,
    fallbackColor,
    metadata,
}) {
    const color = getEtabsSignedColor(signValue, fallbackColor);
    const alpha = getEtabsSegmentAlpha(signValue);

    const ribbon = BABYLON.MeshBuilder.CreateRibbon(
        `jh_etabs_3d_fill_${metadata.component}_${frame.id}_${Date.now()}_${Math.random()}`,
        {
            pathArray: [
                [baselineA, baselineB],
                [diagramA, diagramB],
            ],
            closeArray: false,
            closePath: false,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        },
        scene
    );

    ribbon.material = createEtabsDiagramMaterial(
        scene,
        `jh_etabs_3d_fill_mat_${metadata.component}_${frame.id}`,
        color,
        alpha
    );

    ribbon.renderingGroupId = 1;
    ribbon.alphaIndex = 10;
    ribbon.isPickable = false;

    registerDiagramMesh(layer, ribbon, {
        ...metadata,
        signValue,
        objectKind: "etabsSignedFill",
    });

    return ribbon;
}

function createEtabsSegmentEdge3D({
    scene,
    layer,
    frame,
    p1,
    p2,
    signValue,
    fallbackColor,
    metadata,
}) {
    const color = getEtabsSignedColor(signValue, fallbackColor);

    const edge = BABYLON.MeshBuilder.CreateLines(
        `jh_etabs_3d_edge_${metadata.component}_${frame.id}_${Date.now()}_${Math.random()}`,
        {
            points: [p1, p2],
        },
        scene
    );

    edge.color = color;
    edge.alpha = ETABS_3D_STYLE.edgeAlpha;
    edge.renderingGroupId = 2;
    edge.isPickable = false;

    registerDiagramMesh(layer, edge, {
        ...metadata,
        signValue,
        objectKind: "etabsSignedEdge",
    });

    return edge;
}

function createEtabsSignedDiagramSegments3D({
    scene,
    layer,
    frame,
    baselinePoints,
    diagramPoints,
    stationValues,
    display,
    fallbackColor,
    metadata,
    batch,
}) {
    if (baselinePoints.length < 2 || diagramPoints.length < 2) {
        return;
    }

    for (let i = 0; i < baselinePoints.length - 1; i += 1) {
        const valueA = Number(stationValues[i] || 0);
        const valueB = Number(stationValues[i + 1] || 0);
        const signValue = Math.abs(valueA) >= Math.abs(valueB) ? valueA : valueB;
        const color = getEtabsSignedColor(signValue, fallbackColor);

        if (display.filled !== false) {
            // Al lote (una malla por color para todo el modelo). Si no hay lote
            // —camino viejo—, se cae a la cinta por segmento.
            const batched = pushBatchQuad(
                batch,
                color,
                getEtabsSegmentAlpha(signValue),
                baselinePoints[i],
                baselinePoints[i + 1],
                diagramPoints[i + 1],
                diagramPoints[i],
            );

            if (!batched) {
                createEtabsSegmentRibbon3D({
                    scene,
                    layer,
                    frame,
                    baselineA: baselinePoints[i],
                    baselineB: baselinePoints[i + 1],
                    diagramA: diagramPoints[i],
                    diagramB: diagramPoints[i + 1],
                    signValue,
                    fallbackColor,
                    metadata,
                });
            }
        }

        const edgeBatched = pushBatchLine(
            batch,
            color,
            ETABS_3D_STYLE.edgeAlpha,
            2,
            diagramPoints[i],
            diagramPoints[i + 1],
        );

        if (!edgeBatched) {
            createEtabsSegmentEdge3D({
                scene,
                layer,
                frame,
                p1: diagramPoints[i],
                p2: diagramPoints[i + 1],
                signValue,
                fallbackColor,
                metadata,
            });
        }
    }
}

function createEtabsStationLines3D({
    scene,
    layer,
    frame,
    baselinePoints,
    diagramPoints,
    stationValues,
    fallbackColor,
    metadata,
    batch,
}) {
    const linesByColor = new Map();

    baselinePoints.forEach((basePoint, index) => {
        const value = Number(stationValues[index] || 0);
        const color = getEtabsSignedColor(value, fallbackColor);

        if (
            pushBatchLine(
                batch,
                color,
                ETABS_3D_STYLE.stationAlpha,
                2,
                basePoint,
                diagramPoints[index],
            )
        ) {
            return;
        }

        const key = `${color.r}-${color.g}-${color.b}`;

        if (!linesByColor.has(key)) {
            linesByColor.set(key, {
                color,
                lines: [],
            });
        }

        linesByColor.get(key).lines.push([
            basePoint,
            diagramPoints[index],
        ]);
    });

    linesByColor.forEach(({ color, lines }) => {
        const mesh = BABYLON.MeshBuilder.CreateLineSystem(
            `jh_etabs_3d_station_${metadata.component}_${frame.id}_${Date.now()}_${Math.random()}`,
            {
                lines,
            },
            scene
        );

        mesh.color = color;
        mesh.alpha = ETABS_3D_STYLE.stationAlpha;
        mesh.renderingGroupId = 2;
        mesh.isPickable = false;

        registerDiagramMesh(layer, mesh, {
            ...metadata,
            objectKind: "etabsStationLines",
        });
    });
}

// Las etiquetas del 3D también van en las unidades de presentación
// (frameForceUnits.js): si no, el mismo valor se leía en kN sobre el modelo y en
// tonf en el diálogo y la tabla.
function formatDiagramValue3D(value, decimals = 2) {
    const number = toDisplayUnits(value);

    if (!Number.isFinite(number)) {
        return "0";
    }

    return number.toFixed(decimals);
}

// Tamaño de la textura de etiqueta. Era 512×160 (327 KB de RGBA por etiqueta):
// con unos cientos de barras eran cientos de texturas creadas y subidas a la
// GPU en CADA reconstrucción de la escena — ahí se congelaba el programa al
// mostrar un diagrama. 160×48 alcanza de sobra para 6-7 dígitos y usa 11 veces
// menos memoria.
const LABEL_TEX_W = 160;
const LABEL_TEX_H = 48;

// Caché de materiales por (texto + color) dentro de una misma escena: las
// etiquetas repetidas (muy comunes: muchas barras con el mismo valor
// redondeado, y sobre todo los "0.00") reusan una sola textura.
const LABEL_MATERIAL_CACHE = "__jhLabelMatCache";

function createDiagramLabelMaterial3D(scene, text, color) {
    const key = `${text}|${color.r.toFixed(3)},${color.g.toFixed(3)},${color.b.toFixed(3)}`;

    if (!scene[LABEL_MATERIAL_CACHE]) {
        scene[LABEL_MATERIAL_CACHE] = new Map();
    }

    const cache = scene[LABEL_MATERIAL_CACHE];
    const hit = cache.get(key);

    // El ciclo de vida lo maneja disposeFrameForceLabelCache3D; los meshes de
    // etiqueta ya no destruyen su material al morir.
    if (hit) return hit;

    const texture = new BABYLON.DynamicTexture(
        `jh_etabs_3d_label_tex_${cache.size}`,
        { width: LABEL_TEX_W, height: LABEL_TEX_H },
        scene,
        false
    );

    texture.hasAlpha = true;

    const ctx = texture.getContext();

    ctx.clearRect(0, 0, LABEL_TEX_W, LABEL_TEX_H);

    ctx.fillStyle = "rgba(5, 8, 15, 0.82)";
    ctx.fillRect(0, 0, LABEL_TEX_W, LABEL_TEX_H);

    ctx.strokeStyle = `rgba(${Math.round(color.r * 255)}, ${Math.round(
        color.g * 255
    )}, ${Math.round(color.b * 255)}, 1)`;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, LABEL_TEX_W - 2, LABEL_TEX_H - 2);

    ctx.font = "bold 26px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(text, LABEL_TEX_W / 2, LABEL_TEX_H / 2 + 1);

    texture.update();

    const material = new BABYLON.StandardMaterial(
        `jh_etabs_3d_label_mat_${cache.size}`,
        scene
    );

    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.opacityTexture = texture;
    material.backFaceCulling = false;
    material.disableLighting = true;
    material.specularColor = BABYLON.Color3.Black();

    cache.set(key, material);

    return material;
}

function createEtabsValueLabel3D({
    scene,
    layer,
    frame,
    position,
    text,
    color,
    metadata,
    size = 0.48,
}) {
    const plane = BABYLON.MeshBuilder.CreatePlane(
        `jh_etabs_3d_value_label_${metadata.component}_${frame.id}_${Date.now()}_${Math.random()}`,
        {
            width: size * 2.8,
            height: size * 0.85,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        },
        scene
    );

    plane.position = position;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    plane.material = createDiagramLabelMaterial3D(scene, text, color);
    plane.renderingGroupId = 3;
    plane.isPickable = false;

    registerDiagramMesh(layer, plane, {
        ...metadata,
        objectKind: "etabsValueLabel3D",
        labelText: text,
    });

    return plane;
}

function getMaxMinIndexes3D(stationValues) {
    let maxIndex = 0;
    let minIndex = 0;

    stationValues.forEach((value, index) => {
        const number = Number(value || 0);

        if (number > Number(stationValues[maxIndex] || 0)) {
            maxIndex = index;
        }

        if (number < Number(stationValues[minIndex] || 0)) {
            minIndex = index;
        }
    });

    return [...new Set([maxIndex, minIndex])];
}

function getLabelIndexes3D(stationValues, display) {
    if (display.showValues === false) {
        return [];
    }

    const mode = display.valueLabelMode || "max-min";

    if (mode === "none") {
        return [];
    }

    if (mode === "all") {
        return stationValues.map((_, index) => index);
    }

    if (mode === "ends") {
        return stationValues.length > 1
            ? [0, stationValues.length - 1]
            : [0];
    }

    return getMaxMinIndexes3D(stationValues);
}

function getLabelPrefix3D(index, stationValues, display, component) {
    const maxMinIndexes = getMaxMinIndexes3D(stationValues);

    if (display.showMaxMin === false) {
        return component;
    }

    if (index === maxMinIndexes[0]) {
        return `${component} max`;
    }

    if (index === maxMinIndexes[1]) {
        return `${component} min`;
    }

    return component;
}

function createEtabsDiagramValueLabels3D({
    scene,
    layer,
    frame,
    display,
    component,
    diagramPoints,
    stationValues,
    axes,
    fallbackColor,
    targetHeight,
    metadata,
}) {
    const indexes = getLabelIndexes3D(stationValues, display);

    if (!indexes.length) {
        return;
    }

    const decimals = Number(display.decimals ?? 2);
    // La etiqueta se aparta hacia el MISMO lado en que se dibujó el diagrama
    // (ver getDiagramSide): si no, en las componentes que van del lado opuesto
    // —M3— quedaba corrida hacia la barra y encima del propio diagrama.
    const labelOffsetA = getDiagramDirection(component, axes).scale(targetHeight * 0.10);
    const labelOffsetB = axes.local3.scale(targetHeight * 0.08);

    indexes.forEach((index) => {
        const value = Number(stationValues[index] || 0);
        const color = getEtabsSignedColor(value, fallbackColor);

        const prefix = getLabelPrefix3D(
            index,
            stationValues,
            display,
            component
        );

        const text = `${prefix} ${formatDiagramValue3D(value, decimals)}`;

        const position = diagramPoints[index]
            .add(labelOffsetA)
            .add(labelOffsetB);

        createEtabsValueLabel3D({
            scene,
            layer,
            frame,
            position,
            text,
            color,
            metadata,
            size: 0.42,
        });
    });
}

function createPlanarFrameDiagram3D({
    scene,
    layer,
    frame,
    record,
    display,
    component,
    color,
    start,
    end,
    axes,
    maxAbs,
    targetHeight,
    batch,
    allowLabels = true,
}) {
    const stations = Array.isArray(record?.stations)
        ? record.stations
        : [];

    if (stations.length < 2) {
        return false;
    }

    const direction = getDiagramDirection(component, axes);
    const separation = 0.035;

    const baselinePoints = [];
    const diagramPoints = [];
    const stationValues = [];

    stations.forEach((station) => {
        const ratio = getStationRatio(station, record);
        const value = Number(station?.[component] || 0);

        const basePoint = BABYLON.Vector3.Lerp(start, end, ratio)
            .add(direction.scale(separation));

        const normalizedValue = maxAbs > 0 ? value / maxAbs : 0;

        baselinePoints.push(basePoint);

        diagramPoints.push(
            basePoint.add(
                direction.scale(normalizedValue * targetHeight)
            )
        );

        stationValues.push(value);
    });

    const metadata = {
        frameId: frame.id,
        caseId: display.caseId || null,
        comboId: display.comboId || null,
        component,
    };

    if (display.showZeroLine !== false) {
        const batched = pushBatchPolyline(
            batch,
            ETABS_3D_STYLE.zeroColor,
            ETABS_3D_STYLE.zeroLineAlpha,
            2,
            baselinePoints,
        );

        if (!batched) {
            const baseline = BABYLON.MeshBuilder.CreateLines(
                `jh_etabs_3d_zero_${component}_${frame.id}`,
                {
                    points: baselinePoints,
                },
                scene
            );

            baseline.color = ETABS_3D_STYLE.zeroColor;
            baseline.alpha = ETABS_3D_STYLE.zeroLineAlpha;
            baseline.renderingGroupId = 2;
            baseline.isPickable = false;

            registerDiagramMesh(layer, baseline, {
                ...metadata,
                objectKind: "zeroLine",
            });
        }
    }

    createEtabsSignedDiagramSegments3D({
        scene,
        layer,
        frame,
        baselinePoints,
        diagramPoints,
        stationValues,
        display,
        fallbackColor: color,
        metadata,
        batch,
    });

    if (display.showStationLines !== false) {
        createEtabsStationLines3D({
            scene,
            layer,
            frame,
            baselinePoints,
            diagramPoints,
            stationValues,
            fallbackColor: color,
            metadata,
            batch,
        });
    }

    if (allowLabels) {
        createEtabsDiagramValueLabels3D({
            scene,
            layer,
            frame,
            display,
            component,
            diagramPoints,
            stationValues,
            axes,
            fallbackColor: color,
            targetHeight,
            metadata,
        });
    }

    return true;
}

// Función para crear un sistema de líneas de diagrama de marco 3D
// Función para crear una curva de diagrama de marco 3D
function createFrameDiagramCurve({
    scene,
    layer,
    name,
    points,
    color,
    alpha = 1,
    metadata = {},
}) {
    if (!points?.length) return null;

    const mesh = BABYLON.MeshBuilder.CreateLines(
        name,
        { points },
        scene
    );

    mesh.color = color;
    mesh.alpha = alpha;
    mesh.renderingGroupId = 2;

    registerDiagramMesh(layer, mesh, metadata);

    return mesh;
}

// Función para crear un material de diagrama de marco 3D
function getFrameDiagramPoints3D({
    start,
    end,
    axes,
    record,
    component,
    direction,
    maxAbs,
    targetHeight,
    separation = 0.025,
}) {
    const stations = Array.isArray(record?.stations)
        ? record.stations
        : [];

    const baselinePoints = [];
    const diagramPoints = [];

    stations.forEach((station) => {
        const ratio = getStationRatio(station, record);
        const value = Number(station?.[component] || 0);

        const basePoint = BABYLON.Vector3.Lerp(start, end, ratio)
            .add(direction.scale(separation));

        const normalizedValue = maxAbs > 0 ? value / maxAbs : 0;

        baselinePoints.push(basePoint);

        diagramPoints.push(
            basePoint.add(direction.scale(normalizedValue * targetHeight))
        );
    });

    return {
        baselinePoints,
        diagramPoints,
    };
}

// Función para crear un diagrama de marco 3D axial
function createAxialFrameDiagram3D({
    scene,
    layer,
    frame,
    record,
    display,
    component,
    color,
    start,
    end,
    axes,
    maxAbs,
    targetHeight,
    batch,
    allowLabels = true,
}) {
    const stations = Array.isArray(record?.stations)
        ? record.stations
        : [];

    if (stations.length < 2) {
        return false;
    }

    // Axial P se muestra como banda longitudinal separada del frame.
    // No es cortante; visualmente se representa como diagrama de compresión/tracción.
    const direction = axes.local2;

    const { baselinePoints, diagramPoints } = getFrameDiagramPoints3D({
        start,
        end,
        axes,
        record,
        component,
        direction,
        maxAbs,
        targetHeight,
        separation: 0.035,
    });

    const metadata = {
        frameId: frame.id,
        caseId: display.caseId || null,
        comboId: display.comboId || null,
        component,
    };

    const stationValues = stations.map((station) => Number(station?.[component] || 0));

    if (display.showZeroLine !== false) {
        const batched = pushBatchPolyline(
            batch,
            ETABS_3D_STYLE.zeroColor,
            ETABS_3D_STYLE.zeroLineAlpha,
            2,
            baselinePoints,
        );

        if (!batched) {
            createFrameDiagramCurve({
                scene,
                layer,
                name: `jh_etabs_3d_p_zero_${frame.id}`,
                points: baselinePoints,
                color: ETABS_3D_STYLE.zeroColor,
                alpha: ETABS_3D_STYLE.zeroLineAlpha,
                metadata: {
                    ...metadata,
                    objectKind: "zeroLine",
                },
            });
        }
    }

    createEtabsSignedDiagramSegments3D({
        scene,
        layer,
        frame,
        baselinePoints,
        diagramPoints,
        stationValues,
        display,
        fallbackColor: color,
        metadata,
        batch,
    });

    if (display.showStationLines !== false) {
        createEtabsStationLines3D({
            scene,
            layer,
            frame,
            baselinePoints,
            diagramPoints,
            stationValues,
            fallbackColor: color,
            metadata,
            batch,
        });

        if (allowLabels) {
            createEtabsDiagramValueLabels3D({
                scene,
                layer,
                frame,
                display,
                component,
                diagramPoints,
                stationValues,
                axes,
                fallbackColor: color,
                targetHeight,
                metadata,
            });
        }
    }

    return true;
}

// Función para crear un material de símbolo de torsión 3D
function createTorsionSymbolMaterial(scene, frameId, color) {
    const material = new BABYLON.StandardMaterial(
        `jh_frame_force_3d_t_symbol_mat_${frameId}_${Date.now()}`,
        scene
    );

    material.diffuseColor = color;
    material.emissiveColor = color.scale(0.55);
    material.specularColor = BABYLON.Color3.Black();
    material.alpha = 0.95;
    material.disableLighting = true;

    return material;
}

// Función para orientar el eje Y de un mesh hacia un vector objetivo
function orientMeshYAxisToVector(mesh, targetVector) {
    const from = new BABYLON.Vector3(0, 1, 0);
    const to = targetVector.clone().normalize();

    const quaternion = new BABYLON.Quaternion();

    BABYLON.Quaternion.FromUnitVectorsToRef(from, to, quaternion);

    mesh.rotationQuaternion = quaternion;
}

// Función para crear un símbolo de torsión 3D en una posición específica
function createTorsionSymbol3D({
    scene,
    layer,
    frame,
    display,
    position,
    axes,
    color,
    radius,
}) {
    const torus = BABYLON.MeshBuilder.CreateTorus(
        `jh_frame_force_3d_t_symbol_${frame.id}_${Date.now()}_${Math.random()}`,
        {
            diameter: radius * 2,
            thickness: radius * 0.13,
            tessellation: 32,
        },
        scene
    );

    torus.position = position;
    orientMeshYAxisToVector(torus, axes.local1);

    torus.material = createTorsionSymbolMaterial(scene, frame.id, color);
    torus.renderingGroupId = 2;
    torus.isPickable = false;

    registerDiagramMesh(layer, torus, {
        frameId: frame.id,
        caseId: display.caseId || null,
        comboId: display.comboId || null,
        component: "T",
        objectKind: "torsionSymbol",
    });

    return torus;
}

// Función para crear un diagrama de torsión 3D
function createTorsionSymbolsForFrame3D({
    scene,
    layer,
    frame,
    record,
    display,
    color,
    start,
    end,
    axes,
    targetHeight,
}) {
    if (display.showTorsionSymbols === false) {
        return;
    }

    const stations = Array.isArray(record?.stations)
        ? record.stations
        : [];

    if (!stations.length) return;

    const candidates = [];

    if (stations[0]) {
        candidates.push(stations[0]);
    }

    if (stations.length >= 3) {
        candidates.push(stations[Math.floor(stations.length / 2)]);
    }

    if (stations.length >= 2) {
        candidates.push(stations[stations.length - 1]);
    }

    const radius = clamp(targetHeight * 0.16, 0.08, 0.35);

    candidates.forEach((station) => {
        const ratio = getStationRatio(station, record);

        const basePoint = BABYLON.Vector3.Lerp(start, end, ratio)
            .add(axes.local2.scale(targetHeight * 0.15));

        createTorsionSymbol3D({
            scene,
            layer,
            frame,
            display,
            position: basePoint,
            axes,
            color,
            radius,
        });
    });
}

// Función para crear un diagrama de torsión 3D
function createTorsionFrameDiagram3D({
    scene,
    layer,
    frame,
    record,
    display,
    component,
    color,
    start,
    end,
    axes,
    maxAbs,
    targetHeight,
    allowLabels = true,
}) {
    const stations = Array.isArray(record?.stations)
        ? record.stations
        : [];

    if (stations.length < 2) {
        return false;
    }

    // Torsion T gira alrededor del eje local 1.
    // La banda ayuda a leer magnitud y los toros indican la naturaleza torsional.
    const direction = axes.local2;

    const { baselinePoints, diagramPoints } = getFrameDiagramPoints3D({
        start,
        end,
        axes,
        record,
        component,
        direction,
        maxAbs,
        targetHeight,
        separation: 0.035,
    });

    const metadata = {
        frameId: frame.id,
        caseId: display.caseId || null,
        comboId: display.comboId || null,
        component,
    };

    const stationValues = stations.map((station) => Number(station?.[component] || 0));

    if (display.showZeroLine !== false) {
        createFrameDiagramCurve({
            scene,
            layer,
            name: `jh_etabs_3d_t_zero_${frame.id}`,
            points: baselinePoints,
            color: ETABS_3D_STYLE.zeroColor,
            alpha: ETABS_3D_STYLE.zeroLineAlpha,
            metadata: {
                ...metadata,
                objectKind: "zeroLine",
            },
        });
    }

    createEtabsSignedDiagramSegments3D({
        scene,
        layer,
        frame,
        baselinePoints,
        diagramPoints,
        stationValues,
        display,
        fallbackColor: color,
        metadata,
    });

    if (display.showStationLines !== false) {
        createEtabsStationLines3D({
            scene,
            layer,
            frame,
            baselinePoints,
            diagramPoints,
            stationValues,
            fallbackColor: color,
            metadata,
        });

        if (allowLabels) {
            createEtabsDiagramValueLabels3D({
                scene,
                layer,
                frame,
                display,
                component,
                diagramPoints,
                stationValues,
                axes,
                fallbackColor: color,
                targetHeight,
                metadata,
            });
        }
    }

    createTorsionSymbolsForFrame3D({
        scene,
        layer,
        frame,
        record,
        display,
        color,
        start,
        end,
        axes,
        targetHeight,
    });

    return true;
}

// Función para crear un diagrama de torsión 3D
export function renderFrameForceDiagramLayer3D(viewerState, context) {
    const scene = viewerState?.scene;

    if (!scene || !context) {
        return { rendered: 0, enabled: false };
    }

    clearFrameForceDiagrams3D(viewerState);

    const display = context.frameDiagramDisplay;
    const results = context.frameForceResults;

    if (
        display?.enabled !== true ||
        !Array.isArray(results?.frameForces) ||
        !results.frameForces.length
    ) {
        return { rendered: 0, enabled: false };
    }

    const layer = getLayerState(scene);
    const component = display.component || "M3";
    const color = COMPONENT_COLORS[component] || COMPONENT_COLORS.M3;

    const nodeMap = new Map(
        (context.nodes || []).map((node) => [String(node.id), node]),
    );

    const renderableFrames = [];

    (context.shapes || []).forEach((frame) => {
        if (!frame?.node1 || !frame?.node2) return;

        if (display.selectedOnly && !isFrameSelected(frame, context)) {
            return;
        }

        const record = findFrameForceRecord(
            results,
            frame.id,
            display,
        );

        if (!record) return;

        const { node1, node2 } = resolveFrameNodes(frame, nodeMap);

        if (!node1?.position || !node2?.position) return;

        const start = mapPointToBabylon(node1.position);
        const end = mapPointToBabylon(node2.position);
        const geomAxes = calculateFrameLocalAxes3D(start, end);

        if (!geomAxes) return;

        // Los ejes del MOTOR mandan; la geometría solo cubre el caso de que el
        // registro no los traiga (datos mock o de una versión vieja).
        const axes = axesFromRecord3D(record, geomAxes);

        renderableFrames.push({
            frame,
            record,
            start,
            end,
            axes,
        });
    });

    let maxAbs = 0;

    renderableFrames.forEach(({ record }) => {
        (record.stations || []).forEach((station) => {
            maxAbs = Math.max(
                maxAbs,
                Math.abs(Number(station?.[component] || 0)),
            );
        });
    });

    // Las etiquetas son el único elemento que NO se puede batchear: cada una es
    // un plano con billboard propio. Se limitan a las barras más solicitadas
    // —igual que ETABS, que no rotula todas las barras del modelo— para que un
    // modelo grande no genere cientos de planos ilegibles y superpuestos.
    const labelFrameIds = new Set(
        renderableFrames
            .map((item) => ({
                id: String(item.frame.id),
                peak: (item.record.stations || []).reduce(
                    (m, st) => Math.max(m, Math.abs(Number(st?.[component] || 0))),
                    0,
                ),
            }))
            .sort((a, b) => b.peak - a.peak)
            .slice(0, MAX_LABELED_FRAMES_3D)
            .map((item) => item.id),
    );

    const targetHeight = getTargetDiagramHeight(context, display);
    let rendered = 0;

    // Acumulador de geometría: relleno y líneas de TODAS las barras se juntan
    // por color y salen en un puñado de mallas al final (flushDiagramBatch).
    const batch = createDiagramBatch();

    renderableFrames.forEach((item) => {
        if (PLANAR_COMPONENTS.has(component)) {
            const created = createPlanarFrameDiagram3D({
                scene,
                layer,
                ...item,
                display,
                component,
                color,
                maxAbs,
                targetHeight,
                batch,
                allowLabels: labelFrameIds.has(String(item.frame.id)),
            });

            if (created) rendered += 1;
            return;
        }

        if (AXIAL_COMPONENTS.has(component)) {
            const created = createAxialFrameDiagram3D({
                scene,
                layer,
                ...item,
                display,
                component,
                color,
                maxAbs,
                targetHeight,
                batch,
                allowLabels: labelFrameIds.has(String(item.frame.id)),
            });

            if (created) rendered += 1;
            return;
        }

        if (TORSION_COMPONENTS.has(component)) {
            const created = createTorsionFrameDiagram3D({
                scene,
                layer,
                ...item,
                display,
                component,
                color,
                maxAbs,
                targetHeight,
                allowLabels: labelFrameIds.has(String(item.frame.id)),
            });

            if (created) rendered += 1;
            return;
        }
    });

    const batchedMeshes = flushDiagramBatch(scene, layer, batch, {
        caseId: display.caseId || null,
        comboId: display.comboId || null,
        component,
    });

    layer.summary = {
        rendered,
        batchedMeshes,
        meshCount: layer.meshes.length,
        component,
        selectorId: display.comboId || display.caseId || "CM",
        maxAbs,
        targetHeight,
    };

    viewerState.frameForceDiagramSummary = layer.summary;

    return {
        enabled: true,
        ...layer.summary,
    };
}
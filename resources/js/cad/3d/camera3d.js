import * as BABYLON from "@babylonjs/core";
import { getViewer3DState } from "./viewer3d.js";

function getCamera() {
    const viewer = getViewer3DState();
    return viewer.camera;
}

// Punto sobre el que orbita la cámara (target del ArcRotateCamera). Estilo
// ETABS: si ya hay una grilla de referencia (ejes X e Y) Y pisos definidos,
// la cámara gira en torno al CENTRO de esa grilla/modelo — no del origen
// (0,0,0) de coordenadas, que es lo que hacía antes siempre. Sin grilla
// completa todavía (recién importaste un plano, por ejemplo, sin haber
// trazado ejes ni generado pisos), se mantiene el comportamiento anterior
// (girar en torno al origen) porque no hay "centro de modelo" real que usar.
export function getModelPivotTarget(context) {
    const ref = context?.referenceGrid;
    const xs = ref?.xPositions;
    const ys = ref?.yPositions;
    const hasXY = Array.isArray(xs) && xs.length > 0 && Array.isArray(ys) && ys.length > 0;

    const stories = context?.stories;
    const hasStories = (Array.isArray(stories) && stories.length > 0) || Number(ref?.storyCount) > 0;

    if (!hasXY || !hasStories) {
        return BABYLON.Vector3.Zero();
    }

    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

    const elevations = Array.isArray(stories) ? stories.map((s) => Number(s.elevation || 0)) : [];
    const minZ = elevations.length ? Math.min(...elevations) : 0;
    const maxZ = elevations.length
        ? Math.max(...elevations)
        : Number(ref.storyCount || 0) * Number(ref.storyHeight || 0);
    const centerZ = (minZ + maxZ) / 2;

    // Conversión lógica del proyecto -> Babylon, misma convención que zoomExtents.
    return new BABYLON.Vector3(centerX, centerZ, centerY);
}

// Recentra el pivote de órbita de la cámara sobre la grilla/modelo — se llama
// cada vez que la grilla de referencia CAMBIA de extensión (nuevo eje
// dibujado, pisos generados/editados), no en cada edición cualquiera del
// modelo (evita que la cámara "salte" mientras dibujás vigas/columnas).
export function recenterCameraOnGrid(context) {
    const camera = getCamera();
    if (!camera) return;
    camera.target = getModelPivotTarget(context);
}

function setCameraView({ alpha, beta, radius, target }) {
    const camera = getCamera();
    if (!camera) return;

    camera.alpha = alpha;
    camera.beta = beta;
    camera.radius = radius;
    camera.target = target ?? BABYLON.Vector3.Zero();
}

export function setViewPlan() {
    setCameraView({
        alpha: 0,
        beta: 0.01,
        radius: 15,
        target: BABYLON.Vector3.Zero(),
    });
}

export function setViewIso() {
    setCameraView({
        alpha: Math.PI / 4,
        beta: Math.PI / 4,
        radius: 18,
        target: BABYLON.Vector3.Zero(),
    });
}

export function setViewFront() {
    setCameraView({
        alpha: Math.PI / 2,
        beta: 0.01,
        radius: 15,
        target: BABYLON.Vector3.Zero(),
    });
}

export function setViewSide() {
    setCameraView({
        alpha: 0,
        beta: Math.PI / 2,
        radius: 15,
        target: BABYLON.Vector3.Zero(),
    });
}

export function zoomExtents(context) {
    const camera = getCamera();
    if (!camera || !context?.nodes?.length) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    context.nodes.forEach((node) => {
        minX = Math.min(minX, node.position.x);
        maxX = Math.max(maxX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxY = Math.max(maxY, node.position.y);
        minZ = Math.min(minZ, node.position.z || 0);
        maxZ = Math.max(maxZ, node.position.z || 0);
    });

    // Conversión lógica del proyecto -> Babylon
    const center = new BABYLON.Vector3(
        (minX + maxX) / 2,
        (minZ + maxZ) / 2,
        (minY + maxY) / 2,
    );

    const maxDim = Math.max(
        maxX - minX,
        maxY - minY,
        maxZ - minZ,
    );

    const radius = Math.max(maxDim * 1.5, 10);

    camera.target = center;
    camera.radius = radius;
}
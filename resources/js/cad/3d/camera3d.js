import * as BABYLON from "@babylonjs/core";
import { getViewer3DState } from "./viewer3d.js";

function getCamera() {
    const viewer = getViewer3DState();
    return viewer.camera;
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
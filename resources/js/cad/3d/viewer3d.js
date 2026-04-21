// js/cad/3d/viewer3d.js
import * as BABYLON from "@babylonjs/core";

const VIEWER_STATE = {
    engine: null,
    scene: null,
    camera: null,
    canvas: null,
    elements: [],
    initialized: false,
    resizeHandler: null,
    cadSystem: null,
};

function getViewerContainer() {
    return document.getElementById("viewer3d-container");
}

function disposeViewer() {
    try {
        VIEWER_STATE.elements.forEach((element) => {
            if (element?.dispose) element.dispose();
        });
        VIEWER_STATE.elements = [];

        if (VIEWER_STATE.resizeHandler) {
            window.removeEventListener("resize", VIEWER_STATE.resizeHandler);
            VIEWER_STATE.resizeHandler = null;
        }

        if (VIEWER_STATE.scene) {
            VIEWER_STATE.scene.dispose();
            VIEWER_STATE.scene = null;
        }

        if (VIEWER_STATE.engine) {
            VIEWER_STATE.engine.dispose();
            VIEWER_STATE.engine = null;
        }

        VIEWER_STATE.camera = null;
        VIEWER_STATE.canvas = null;
        VIEWER_STATE.initialized = false;
        VIEWER_STATE.cadSystem = null;
    } catch (error) {
        console.warn("Error al destruir el visor 3D:", error);
    }
}

function createCanvas(container) {
    const canvas = document.createElement("canvas");
    canvas.id = "babylon-canvas";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width || container.clientWidth || 800;
    canvas.height = rect.height || container.clientHeight || 600;

    container.innerHTML = "";
    container.appendChild(canvas);

    return canvas;
}

function createCamera(scene, canvas) {
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 4,
        Math.PI / 5,
        20,
        BABYLON.Vector3.Zero(),
        scene,
    );

    camera.attachControl(canvas, true);
    camera.panningSensibility = 50;
    camera.zoomSensibility = 50;
    camera.wheelPrecision = 30;
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 200;
    camera.pinchPrecision = 50;

    camera.useBouncingBehavior = true;
    camera.useFramingBehavior = true;

    if (camera.framingBehavior) {
        camera.framingBehavior.elevationReturnTime = 500;
        camera.framingBehavior.zoomOnBoundingInfo = true;
    }

    return camera;
}

function createLights(scene) {
    const hemiLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;
    hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);

    const directionalLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(1, -2, 1), scene);
    directionalLight.intensity = 0.8;
    directionalLight.position = new BABYLON.Vector3(5, 10, 5);

    const backLight = new BABYLON.DirectionalLight("backLight", new BABYLON.Vector3(-1, 0, -1), scene);
    backLight.intensity = 0.3;

    return { hemiLight, directionalLight, backLight };
}

function setupResizeHandler() {
    VIEWER_STATE.resizeHandler = () => {
        if (!VIEWER_STATE.engine) return;
        setTimeout(() => {
            try {
                VIEWER_STATE.engine.resize();
            } catch (error) {
                console.warn("Error al redimensionar el visor 3D:", error);
            }
        }, 100);
    };
    window.addEventListener("resize", VIEWER_STATE.resizeHandler);
}

function mapNodePositionTo3D(node) {
    // Tu sistema: node.position.x, node.position.y, node.position.z (altura)
    // Babylon: X = x, Y = z (altura), Z = y (profundidad)
    return new BABYLON.Vector3(node.position.x, node.position.z || 0, node.position.y);
}

function belongsToActiveView(nodeOrBeam, cadSystem) {
    const isElevationXView = cadSystem.currentElevationX && cadSystem.currentElevationX !== "none";
    const isElevationZView = cadSystem.currentElevationZ && cadSystem.currentElevationZ !== "none";
    const tol = 0.05;

    const checkNode = (node) => {
        const x = node.position.x || 0;
        const y = node.position.y || 0;
        const z = node.position.z || 0;

        if (isElevationXView) {
            const targetY = cadSystem.getCurrentElevationY?.() || 0;
            return Math.abs(y - targetY) <= tol;
        }
        
        if (isElevationZView) {
            const elev = cadSystem.zElevations?.find(e => e.name === cadSystem.currentElevationZ);
            const targetX = elev?.x || 0;
            return Math.abs(x - targetX) <= tol;
        }
        
        // Vista planta
        const targetZ = cadSystem.getCurrentZ?.() || 0;
        return Math.abs(z - targetZ) <= tol;
    };

    if (nodeOrBeam?.position) {
        return checkNode(nodeOrBeam);
    }

    if (nodeOrBeam?.node1 && nodeOrBeam?.node2) {
        return checkNode(nodeOrBeam.node1) && checkNode(nodeOrBeam.node2);
    }

    return true;
}

function isNodeSelected(node, cadSystem) {
    const selectedNodes = cadSystem?.selectedNodesState?.selectedObjects ?? [];
    return selectedNodes.some((n) => n?.id === node?.id);
}

function isBeamSelected(beam, cadSystem) {
    const selectedBeams = cadSystem?.selectedBeamsState?.selectedObjects ?? [];
    return selectedBeams.some((b) => b?.id === beam?.id);
}

function createNodeMesh(node, cadSystem) {
    const sphere = BABYLON.MeshBuilder.CreateSphere(
        `node_${node.id}`,
        { diameter: 0.1, segments: 16 },
        VIEWER_STATE.scene,
    );

    sphere.position = mapNodePositionTo3D(node);

    const material = new BABYLON.StandardMaterial(`nodeMat_${node.id}`, VIEWER_STATE.scene);

    const isActiveView = belongsToActiveView(node, cadSystem);
    const isSelected = isNodeSelected(node, cadSystem);

    if (isSelected) {
        material.diffuseColor = new BABYLON.Color3(0.15, 0.65, 1);
        material.emissiveColor = new BABYLON.Color3(0.08, 0.3, 0.6);
        material.alpha = 1;
        sphere.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
    } else if (isActiveView) {
        material.diffuseColor = new BABYLON.Color3(0.9, 0.4, 0.4);
        material.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.1);
        material.alpha = 1;
    } else {
        material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        material.alpha = 0.15;
    }

    sphere.material = material;
    sphere.metadata = { type: "node", id: node.id };

    VIEWER_STATE.elements.push(sphere);
}

function createBeamMesh(beam, cadSystem) {
    const start = mapNodePositionTo3D(beam.node1);
    const end = mapNodePositionTo3D(beam.node2);

    const lines = BABYLON.MeshBuilder.CreateLines(
        `beam_${beam.id}`,
        { points: [start, end] },
        VIEWER_STATE.scene,
    );

    const isActiveView = belongsToActiveView(beam, cadSystem);
    const isSelected = isBeamSelected(beam, cadSystem);
    const fAxial = beam.fAxial || 0;

    let color;
    if (isSelected) {
        color = new BABYLON.Color3(0.15, 0.65, 1);
    } else if (isActiveView) {
        if (fAxial > 0.001) {
            color = new BABYLON.Color3(0.2, 0.6, 0.9);
        } else if (fAxial < -0.001) {
            color = new BABYLON.Color3(0.9, 0.3, 0.3);
        } else {
            color = new BABYLON.Color3(0.7, 0.7, 0.8);
        }
    } else {
        color = new BABYLON.Color3(0.25, 0.25, 0.25);
    }

    lines.color = color;
    lines.alpha = isActiveView ? 1 : 0.15;
    lines.metadata = { type: "beam", id: beam.id };

    VIEWER_STATE.elements.push(lines);
}

export function initViewer3D(cadSystem, container) {
    if (VIEWER_STATE.initialized) return;

    try {
        VIEWER_STATE.cadSystem = cadSystem;
        
        const canvas = createCanvas(container);
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        const engine = new BABYLON.Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
            adaptToDeviceRatio: true,
        });

        if (!engine) {
            throw new Error("No se pudo crear el motor Babylon.js");
        }

        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);

        const camera = createCamera(scene, canvas);
        createLights(scene);

        VIEWER_STATE.engine = engine;
        VIEWER_STATE.scene = scene;
        VIEWER_STATE.camera = camera;
        VIEWER_STATE.canvas = canvas;
        VIEWER_STATE.initialized = true;

        // Crear grid base
        if (typeof cadSystem.createFull3DGrid === "function") {
            cadSystem.createFull3DGrid(scene);
        }

        // Dibujar grid de referencia
        if (cadSystem.referenceGrid && typeof cadSystem.drawReferenceGrid3D === "function") {
            cadSystem.drawReferenceGrid3D();
        }

        let frameCount = 0;
        let lastTime = performance.now();

        engine.runRenderLoop(() => {
            if (!VIEWER_STATE.scene) return;
            VIEWER_STATE.scene.render();
            frameCount++;

            const now = performance.now();
            if (now - lastTime >= 1000) {
                cadSystem.fps = frameCount;
                frameCount = 0;
                lastTime = now;
            }
        });

        setupResizeHandler();

        setTimeout(() => {
            drawIn3D(cadSystem);
            console.log("🎨 Escena 3D inicializada con contenido existente");
        }, 100);

        console.log("✅ Babylon.js inicializado correctamente");
    } catch (error) {
        console.error("Error inicializando Babylon.js:", error);
        disposeViewer();
    }
}

export function toggleView3D(cadSystem) {
    cadSystem.show3DView = !cadSystem.show3DView;

    if (!cadSystem.show3DView) {
        disposeViewer();
        return;
    }

    setTimeout(() => {
        const container = getViewerContainer();
        if (!container) return;

        disposeViewer();
        initViewer3D(cadSystem, container);
    }, 200);
}

export function clear3D() {
    if (!VIEWER_STATE.scene) return;
    clearModelElements();
}

export function sync3D(cadSystem) {
    if (cadSystem.syncPending) return;
    if (!VIEWER_STATE.initialized || !VIEWER_STATE.scene) return;

    cadSystem.syncPending = true;

    setTimeout(() => {
        try {
            if (cadSystem.referenceGrid && typeof cadSystem.drawReferenceGrid3D === "function") {
                if (typeof cadSystem.grid3Dmanager?.reset === "function") {
                    cadSystem.grid3Dmanager.reset();
                }
                cadSystem.drawReferenceGrid3D();
            }
            drawIn3D(cadSystem);
        } finally {
            cadSystem.syncPending = false;
        }
    }, 50);
}

export function drawIn3D(cadSystem) {
    if (!VIEWER_STATE.scene || !cadSystem.nodes) return;

    clearModelElements();

    cadSystem.nodes.forEach((node) => {
        if (!node?.position) return;
        createNodeMesh(node, cadSystem);
    });

    cadSystem.shapes.forEach((beam) => {
        if (!beam?.node1 || !beam?.node2) return;
        createBeamMesh(beam, cadSystem);
    });
}

export function getViewer3DState() {
    return VIEWER_STATE;
}

function clearModelElements() {
    try {
        VIEWER_STATE.elements = VIEWER_STATE.elements.filter((element) => {
            const type = element?.metadata?.type;

            if (type === "node" || type === "beam") {
                if (element.dispose) element.dispose();
                return false;
            }

            return true;
        });
    } catch (error) {
        console.warn("Error al limpiar elementos del modelo 3D:", error);
    }
}
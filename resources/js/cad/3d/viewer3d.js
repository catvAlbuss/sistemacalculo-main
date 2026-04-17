import * as BABYLON from "@babylonjs/core";

const VIEWER_STATE = {
    engine: null,
    scene: null,
    camera: null,
    canvas: null,
    elements: [],
    initialized: false,
    resizeHandler: null,
};

const COLORS_3D = {
    activeModel: new BABYLON.Color3(1.0, 0.85, 0.15),   // amarillo
    activeModelGlow: new BABYLON.Color3(0.35, 0.28, 0.02),
    inactiveModel: new BABYLON.Color3(0.25, 0.25, 0.25), // gris
    selectedModel: new BABYLON.Color3(1.0, 0.55, 0.1),   // naranja
    selectedGlow: new BABYLON.Color3(0.45, 0.18, 0.02),
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
    const hemiLight = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene,
    );
    hemiLight.intensity = 0.6;
    hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);

    const directionalLight = new BABYLON.DirectionalLight(
        "dirLight",
        new BABYLON.Vector3(1, -2, 1),
        scene,
    );
    directionalLight.intensity = 0.8;
    directionalLight.position = new BABYLON.Vector3(5, 10, 5);

    const backLight = new BABYLON.DirectionalLight(
        "backLight",
        new BABYLON.Vector3(-1, 0, -1),
        scene,
    );
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
    return new BABYLON.Vector3(
        node.position.x,
        node.position.z || 0,
        node.position.y,
    );
}


// HELPER FUNCTIONS
function belongsToActiveView(nodeOrBeam, context) {
    const view = context?.viewSet?.[context?.activeViewIndex];
    if (!view) return true;

    const tol = 0.05;

    const checkNode = (node) => {
        const x = node.position.x || 0;
        const y = node.position.y || 0;
        const z = node.position.z || 0;

        if (view.type === "plan") {
            return Math.abs(z - view.elevation) <= tol;
        }

        if (view.type === "elevation") {
            if (view.axis === "X") {
                return Math.abs(x - view.value) <= tol;
            }

            if (view.axis === "Y") {
                return Math.abs(y - view.value) <= tol;
            }
        }

        return true;
    };

    // Si es nodo
    if (nodeOrBeam?.position) {
        return checkNode(nodeOrBeam);
    }

    // Si es barra
    if (nodeOrBeam?.node1 && nodeOrBeam?.node2) {
        return checkNode(nodeOrBeam.node1) && checkNode(nodeOrBeam.node2);
    }

    return true;
}

function isNodeSelected(node, context) {
    const selectedNodes = context?.selectedNodesState?.selectedObjects ?? [];
    return selectedNodes.some((n) => n?.id === node?.id);
}

function isBeamSelected(beam, context) {
    const selectedBeams = context?.selectedBeamsState?.selectedObjects ?? [];
    return selectedBeams.some((b) => b?.id === beam?.id);
}

function createNodeMesh(node, context) {
    const sphere = BABYLON.MeshBuilder.CreateSphere(
        `node_${node.id}`,
        { diameter: 0.08, segments: 8 },
        VIEWER_STATE.scene,
    );

    sphere.position = mapNodePositionTo3D(node);

    const material = new BABYLON.StandardMaterial(`nodeMat_${node.id}`, VIEWER_STATE.scene);

    const isActiveView = belongsToActiveView(node, context);
    const isSelected = isNodeSelected(node, context);

    if (isSelected) {
        // Selección puntual
        material.diffuseColor = COLORS_3D.selectedModel;
        material.emissiveColor = COLORS_3D.selectedGlow;
        material.alpha = 1;
        sphere.scaling = new BABYLON.Vector3(1.8, 1.8, 1.8);
    } else if (isActiveView) {
        // Lo que estás viendo/editando en 2D
        material.diffuseColor = COLORS_3D.activeModel;
        material.emissiveColor = COLORS_3D.activeModelGlow;
        material.alpha = 1;
    } else {
        // Resto del modelo
        material.diffuseColor = COLORS_3D.inactiveModel;
        material.emissiveColor = new BABYLON.Color3(0.03, 0.03, 0.03);
        material.alpha = 0.12;
    }

    sphere.material = material;
    sphere.metadata = { type: "node", id: node.id };

    VIEWER_STATE.elements.push(sphere);
}

function createBeamMesh(beam, context) {
    const start = mapNodePositionTo3D(beam.node1);
    const end = mapNodePositionTo3D(beam.node2);

    const lines = BABYLON.MeshBuilder.CreateLines(
        `beam_${beam.id}`,
        { points: [start, end] },
        VIEWER_STATE.scene,
    );

    const isActiveView = belongsToActiveView(beam, context);
    const isSelected = isBeamSelected(beam, context);

    if (isSelected) {
        // Selección puntual
        lines.color = COLORS_3D.selectedModel;
        lines.alpha = 1;
    } else if (isActiveView) {
        // Lo que estás viendo/editando en 2D
        lines.color = COLORS_3D.activeModel;
        lines.alpha = 1;
    } else {
        // Resto del modelo
        lines.color = COLORS_3D.inactiveModel;
        lines.alpha = 0.10;
    }

    lines.metadata = { type: "beam", id: beam.id };

    VIEWER_STATE.elements.push(lines);
}

export function initViewer3D(context, container) {
    if (VIEWER_STATE.initialized) return;

    try {
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

        if (typeof context.createFull3DGrid === "function") {
            context.createFull3DGrid(scene);
        }

        if (context.referenceGrid && context.pendingGrid3D) {
            context.grid3DDrawn = false;
            context.drawReferenceGrid3D();
            context.pendingGrid3D = false;
        } else if (context.referenceGrid && typeof context.drawReferenceGrid3D === "function") {
            context.drawReferenceGrid3D();
        }

        let frameCount = 0;
        let lastTime = performance.now();

        engine.runRenderLoop(() => {
            if (!VIEWER_STATE.scene) return;

            VIEWER_STATE.scene.render();
            frameCount++;

            const now = performance.now();
            if (now - lastTime >= 1000) {
                context.fps = frameCount;
                frameCount = 0;
                lastTime = now;
            }
        });

        setupResizeHandler();

        setTimeout(() => {
            drawIn3D(context);
            console.log("🎨 Escena 3D inicializada con contenido existente");
        }, 100);

        console.log("✅ Babylon.js inicializado correctamente");
    } catch (error) {
        console.error("Error inicializando Babylon.js:", error);
        disposeViewer();
    }
}

export function toggleView3D(context) {
    context.show3DView = !context.show3DView;

    if (!context.show3DView) {
        disposeViewer();
        return;
    }

    setTimeout(() => {
        const container = getViewerContainer();
        if (!container) return;

        disposeViewer();
        initViewer3D(context, container);
    }, 200);
}

export function clear3D() {
    if (!VIEWER_STATE.scene) return;
    clearModelElements();
}

export function sync3D(context) {
    if (context.syncPending) return;
    if (!VIEWER_STATE.initialized || !VIEWER_STATE.scene) return;

    context.syncPending = true;

    setTimeout(() => {
        try {
            if (context.referenceGrid && typeof context.drawReferenceGrid3D === "function") {
                context.drawReferenceGrid3D();
            }

            drawIn3D(context);
        } finally {
            context.syncPending = false;
        }
    }, 50);
}

export function drawIn3D(context) {
    if (!VIEWER_STATE.scene || !context.nodes) return;

    clearModelElements();

    context.nodes.forEach((node) => {
        if (!node?.position) return;
        createNodeMesh(node, context);
    });

    context.shapes.forEach((beam) => {
        if (!beam?.node1 || !beam?.node2) return;
        createBeamMesh(beam, context);
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
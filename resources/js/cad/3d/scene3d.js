import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    MeshBuilder,
    Color4,
    Color3,
    PointerEventTypes,
    StandardMaterial,
} from "@babylonjs/core";

export function initScene3D(canvas, callbacks = {}) {
    if (!canvas) {
        console.error("No se encontró el canvas 3D");
        return null;
    }

    const {
        onNodeSelected = null,
        onBeamSelected = null,
        onEmptySpaceClicked = null,
    } = callbacks;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    scene.clearColor = new Color4(0.18, 0.24, 0.29, 1);

    const camera = new ArcRotateCamera(
        "camera3d",
        -Math.PI / 2,
        Math.PI / 3,
        18,
        new Vector3(0, 0, 0),
        scene
    );

    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 200;
    camera.wheelDeltaPercentage = 0.01;

    const light = new HemisphericLight("light3d", new Vector3(0, 1, 0), scene);
    light.intensity = 1.0;

    const ground = MeshBuilder.CreateGround(
        "ground3d",
        { width: 30, height: 30 },
        scene
    );
    ground.position.y = -0.01;
    ground.isPickable = false;

    const groundMaterial = new StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2);
    groundMaterial.specularColor = new Color3(0, 0, 0);

    // 🔥 transparencia
    groundMaterial.alpha = 0.2;

    ground.material = groundMaterial;

    const axisX = MeshBuilder.CreateLines(
        "axisX",
        { points: [new Vector3(0, 0, 0), new Vector3(5, 0, 0)] },
        scene
    );
    axisX.color = new Color3(1, 0, 0);
    axisX.isPickable = false;

    const axisY = MeshBuilder.CreateLines(
        "axisY",
        { points: [new Vector3(0, 0, 0), new Vector3(0, 5, 0)] },
        scene
    );
    axisY.color = new Color3(0, 1, 0);
    axisY.isPickable = false;

    const axisZ = MeshBuilder.CreateLines(
        "axisZ",
        { points: [new Vector3(0, 0, 0), new Vector3(0, 0, 5)] },
        scene
    );
    axisZ.color = new Color3(0, 0.6, 1);
    axisZ.isPickable = false;

    const materials = {
        ground: groundMaterial,
        node: new StandardMaterial("nodeMat", scene),
        nodeSelected: new StandardMaterial("nodeSelectedMat", scene),
        beam: new StandardMaterial("beamMat", scene),
        beamSelected: new StandardMaterial("beamSelectedMat", scene),
    };

    materials.node.diffuseColor = new Color3(0.2, 0.6, 1.0);
    materials.node.specularColor = new Color3(0, 0, 0);

    materials.nodeSelected.diffuseColor = new Color3(1, 1, 0);
    materials.nodeSelected.specularColor = new Color3(0, 0, 0);

    materials.beam.diffuseColor = new Color3(0.75, 0.75, 0.75);
    materials.beam.specularColor = new Color3(0, 0, 0);

    materials.beamSelected.diffuseColor = new Color3(1, 0.7, 0.1);
    materials.beamSelected.specularColor = new Color3(0, 0, 0);

    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type !== PointerEventTypes.POINTERPICK) return;

        const pickInfo = pointerInfo.pickInfo;

        if (!pickInfo || !pickInfo.hit || !pickInfo.pickedMesh) {
            if (onEmptySpaceClicked) onEmptySpaceClicked();
            return;
        }

        const mesh = pickInfo.pickedMesh;
        const meta = mesh.metadata;

        if (!meta) return;

        if (meta.type === "node" && onNodeSelected) {
            onNodeSelected(meta.nodeId, mesh);
            return;
        }

        if (meta.type === "beam" && onBeamSelected) {
            onBeamSelected(meta.beamId, mesh);
        }
    });

    engine.runRenderLoop(() => {
        scene.render();
    });

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return {
        engine,
        scene,
        camera,
        light,
        materials,
        destroy() {
            window.removeEventListener("resize", resize);
            engine.dispose();
        },
    };
}

export function focusCamera(camera, nodes) {
    if (!nodes || nodes.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    nodes.forEach((n) => {
        const x = n.position?.x ?? n.x ?? 0;
        const y = n.position?.y ?? n.y ?? 0;
        const z = n.position?.z ?? n.z ?? 0;

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
    });

    const center = new Vector3(
        (minX + maxX) / 2,
        (minY + maxY) / 2,
        (minZ + maxZ) / 2
    );

    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    const maxSize = Math.max(sizeX, sizeY, sizeZ, 1);

    camera.setTarget(center);
    camera.radius = maxSize * 2.5;
}
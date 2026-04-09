import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    MeshBuilder,
    Color4,
    Color3,
} from "@babylonjs/core";

export function initScene3D(canvas) {
    if (!canvas) {
        console.error("No se encontró el canvas 3D");
        return null;
    }

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    // color de fondo parecido a tu interfaz
    scene.clearColor = new Color4(0.18, 0.24, 0.29, 1);

    // cámara orbital
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

    // luz
    const light = new HemisphericLight("light3d", new Vector3(0, 1, 0), scene);
    light.intensity = 1.0;

    // piso base
    const ground = MeshBuilder.CreateGround(
        "ground3d",
        { width: 30, height: 30 },
        scene
    );
    ground.position.y = -0.01;

    // ejes guía
    const axisX = MeshBuilder.CreateLines(
        "axisX",
        {
            points: [new Vector3(0, 0, 0), new Vector3(5, 0, 0)],
        },
        scene
    );
    axisX.color = new Color3(1, 0, 0);

    const axisY = MeshBuilder.CreateLines(
        "axisY",
        {
            points: [new Vector3(0, 0, 0), new Vector3(0, 5, 0)],
        },
        scene
    );
    axisY.color = new Color3(0, 1, 0);

    const axisZ = MeshBuilder.CreateLines(
        "axisZ",
        {
            points: [new Vector3(0, 0, 0), new Vector3(0, 0, 5)],
        },
        scene
    );
    axisZ.color = new Color3(0, 0.6, 1);

    // render loop
    engine.runRenderLoop(() => {
        scene.render();
    });

    const resize = () => {
        engine.resize();
    };

    window.addEventListener("resize", resize);

    console.log("Babylon 3D cargado correctamente");

    return {
        engine,
        scene,
        camera,
        light,
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
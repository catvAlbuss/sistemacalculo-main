import {
    MeshBuilder,
    StandardMaterial,
    Color3,
    Vector3,
    Mesh,
    VertexData,
    DynamicTexture,
} from "@babylonjs/core";
import earcut from "earcut";

// =====================================================
// CONVENCIÓN ETABS / MODELO:
// Modelo estructural: X-Y = planta, Z = altura
// Babylon: X = X modelo, Y = Z modelo, Z = Y modelo
// =====================================================
function mapPointToBabylon(p = {}) {
    return new Vector3(
        Number(p.x || 0),
        Number(p.z || 0),
        Number(p.y || 0)
    );
}

function getAreaStyle(area) {
    const type = area.areaType || area.type || "slab";

    switch (type) {
        case "wall":
            return {
                color: new Color3(0.2, 0.8, 0.4),
                alpha: 0.35,
            };

        case "opening":
            return {
                color: new Color3(0.95, 0.25, 0.25),
                alpha: 1.0,
            };

        case "area":
            return {
                color: new Color3(0.75, 0.55, 1.0),
                alpha: 0.30,
            };

        case "slab":
        default:
            return {
                color: new Color3(0.25, 0.75, 0.95),
                alpha: 0.35,
            };
    }
}

function getAreaElevation(area) {
    if (typeof area.z === "number") return area.z;
    if (area.points?.length && typeof area.points[0].z === "number") {
        return area.points[0].z;
    }
    return 0;
}

function isHorizontalArea(area, tolerance = 1e-6) {
    if (!area?.points?.length) return true;

    const z0 = Number(area.points[0]?.z || 0);

    return area.points.every((p) => {
        return Math.abs(Number(p.z || 0) - z0) <= tolerance;
    });
}

function toHorizontalPolygonShape(points) {
    // Para losas horizontales:
    // modelo X-Y se dibuja en Babylon X-Z
    return points.map((p) => {
        return new Vector3(
            Number(p.x || 0),
            0,
            Number(p.y || 0)
        );
    });
}

function createMaterial(scene, area) {
    const style = getAreaStyle(area);

    const mat = new StandardMaterial(`areaMat-${area.id}`, scene);

    // =====================================================
    // 3D SELECTION > ÁREA SELECCIONADA
    // Naranja brillante (mismo lenguaje visual que las barras).
    // =====================================================
    const isSelected = area.selected === true || area.isSelected === true;

    if (isSelected) {
        mat.diffuseColor = new Color3(1.0, 0.6, 0.1);
        mat.emissiveColor = new Color3(0.45, 0.25, 0.03);
        mat.alpha = Math.min(0.8, style.alpha + 0.35);
    } else {
        mat.diffuseColor = style.color;
        mat.alpha = style.alpha;
    }

    mat.backFaceCulling = false;
    mat.specularColor = Color3.Black();

    return mat;
}

function getPlaneNormal(points3D = []) {
    if (points3D.length < 3) {
        return new Vector3(0, 1, 0);
    }

    const p0 = points3D[0];

    for (let i = 1; i < points3D.length - 1; i++) {
        const v1 = points3D[i].subtract(p0);
        const v2 = points3D[i + 1].subtract(p0);
        const normal = Vector3.Cross(v1, v2);

        if (normal.length() > 1e-8) {
            return normal.normalize();
        }
    }

    return new Vector3(0, 1, 0);
}

function projectPointTo2DByNormal(point, normal) {
    const ax = Math.abs(normal.x);
    const ay = Math.abs(normal.y);
    const az = Math.abs(normal.z);

    // Se descarta el eje donde la normal es mayor.
    // Esto evita que muros verticales se aplasten al triangular.
    if (ax >= ay && ax >= az) {
        return {
            u: point.y,
            v: point.z,
        };
    }

    if (ay >= ax && ay >= az) {
        return {
            u: point.x,
            v: point.z,
        };
    }

    return {
        u: point.x,
        v: point.y,
    };
}

function createGeneric3DPolygon(scene, area) {
    const points3D = area.points.map(mapPointToBabylon);

    if (points3D.length < 3) return null;

    const normal = getPlaneNormal(points3D);
    const projected = points3D.map((p) => projectPointTo2DByNormal(p, normal));

    const coordinates = [];

    projected.forEach((p) => {
        coordinates.push(p.u, p.v);
    });

    const indices = earcut(coordinates);

    if (!indices || indices.length < 3) {
        // Fallback visual: si por alguna razón no triangula, dibuja contorno.
        return createAreaOutline3D(scene, area);
    }

    const positions = [];

    points3D.forEach((p) => {
        positions.push(p.x, p.y, p.z);
    });

    const normals = [];
    VertexData.ComputeNormals(positions, indices, normals);

    const mesh = new Mesh(`area-${area.id}`, scene);

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.applyToMesh(mesh);

    mesh.material = createMaterial(scene, area);
    mesh.isPickable = true;
    mesh.metadata = {
        type: "area",
        areaId: area.id,
        areaType: area.areaType || area.type || "area",
        plane: "generic-3d",
    };

    return mesh;
}

// Crea una etiqueta de texto (billboard) en el centro de la losa mostrando el
// nombre de la sección asignada (o el tipo si no tiene). Se cuelga como HIJA del
// mesh de la losa para que Babylon la elimine junto con ella; su material/textura
// se liberan en onDisposeObservable para no fugar memoria.
function attachAreaLabel3D(scene, parentMesh, area, elev) {
    const label = area.slabSection || area.section?.name || area.areaType || area.type || "slab";

    // Centroide del polígono en coords del modelo (X-Y de planta).
    const n = area.points.length || 1;
    const cx = area.points.reduce((s, p) => s + Number(p.x || 0), 0) / n;
    const cy = area.points.reduce((s, p) => s + Number(p.y || 0), 0) / n;

    // Textura dinámica con el texto centrado.
    const W = 256, H = 64;
    const texture = new DynamicTexture(`areaLabelTex-${area.id}`, { width: W, height: H }, scene, true);
    texture.hasAlpha = true;
    const ctx = texture.getContext();
    ctx.clearRect(0, 0, W, H);
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(label), W / 2, H / 2);
    texture.update();

    const mat = new StandardMaterial(`areaLabelMat-${area.id}`, scene);
    mat.diffuseTexture = texture;
    mat.opacityTexture = texture;
    mat.emissiveColor = new Color3(1, 1, 1);
    mat.disableLighting = true;
    mat.backFaceCulling = false;

    const plane = MeshBuilder.CreatePlane(
        `areaLabel-${area.id}`,
        { width: 2.4, height: 0.6 },
        scene
    );
    plane.material = mat;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    plane.isPickable = false;
    plane.metadata = { type: "areaLabel", areaId: area.id };

    // Hija del mesh de la losa: el padre está en world (0, elev, 0) con la
    // geometría en y=0, así que la posición LOCAL (cx, offset, cy) queda en el
    // centro de la losa, ligeramente por encima.
    plane.parent = parentMesh;
    plane.position = new Vector3(cx, 0.15, cy);

    // Liberar textura+material cuando la losa se elimina (Babylon dispone el
    // mesh hijo por recursión, pero no su material/textura).
    parentMesh.onDisposeObservable.add(() => {
        try {
            texture.dispose();
            mat.dispose();
        } catch (_) { /* noop */ }
    });

    return plane;
}

// Espesor de la losa en metros. La sección (Datos de Propiedad de Losa) guarda
// el espesor en MM (p.ej. 125 = 0.125 m), por eso se divide entre 1000.
function getSlabThickness(area) {
    const sec = area.section || area.slabSectionObj || {};
    const raw = area.thickness ?? sec.thickness ?? sec.t ?? sec.h ?? sec.depth;
    let v = Number(raw);
    if (!(v > 0)) return 0.2;      // default 20 cm
    if (v > 3) v = v / 1000;       // mm → m (así lo guarda slabSections)
    return v;
}

function createHorizontalArea3D(scene, area, options = {}) {
    const type = area.areaType || area.type || "slab";
    const elev = getAreaElevation(area);

    const shape = toHorizontalPolygonShape(area.points);

    const holesAreas = options.holes || [];

    const holes =
        type === "slab"
            ? holesAreas
                .filter((h) => h?.points?.length >= 3)
                .map((h) => toHorizontalPolygonShape(h.points))
            : [];

    // =====================================================
    // VISTA EXTRUIDA (Extrude View tipo ETABS)
    // La losa se dibuja con espesor real (prisma) colgando bajo el nivel.
    // =====================================================
    const extrude = options.extrude === true && type === "slab";

    // El espesor viene resuelto por renderModel3D (lee la sección/slabSections);
    // si no, se calcula desde la propia área como respaldo.
    const thickness = Number(options.thickness) > 0 ? Number(options.thickness) : getSlabThickness(area);

    const mesh = extrude
        ? MeshBuilder.ExtrudePolygon(
            `area-${area.id}`,
            {
                shape,
                holes,
                depth: thickness,
                sideOrientation: Mesh.DOUBLESIDE,
                updatable: false,
            },
            scene,
            earcut
        )
        : MeshBuilder.CreatePolygon(
            `area-${area.id}`,
            {
                shape,
                holes,
                sideOrientation: Mesh.DOUBLESIDE,
                updatable: false,
            },
            scene,
            earcut
        );

    // Z del modelo pasa a Y de Babylon. ExtrudePolygon deja la cara superior en
    // y=0 y extruye hacia abajo, así que la losa queda justo bajo el nivel.
    mesh.position.y = elev;

    mesh.material = createMaterial(scene, area);
    mesh.isPickable = true;
    mesh.metadata = {
        type: "area",
        areaId: area.id,
        areaType: type,
        holeCount: holes.length,
        plane: "horizontal",
    };

    // Etiqueta con el nombre de la sección asignada (o el tipo). Solo losas.
    if (type === "slab") {
        attachAreaLabel3D(scene, mesh, area, elev);
    }

    // Borde del contorno: sin esto, losas vecinas del mismo tipo/color
    // (p.ej. tras "Dividir Áreas") se ven como un único bloque continuo en
    // 3D — no hay forma de distinguir que en realidad son varias losas
    // separadas. Se dibuja como hijo del mesh (se libera junto con él).
    attachAreaOutline3D(scene, mesh, shape, extrude ? thickness : 0);

    return mesh;
}

// Líneas del contorno de la losa, ligeramente por encima de la cara superior
// para evitar z-fighting con el relleno. En vista extruida se dibuja también
// el contorno de la cara inferior, para que el "bloque" siga leyéndose como
// una pieza independiente desde cualquier ángulo.
function attachAreaOutline3D(scene, parentMesh, shape, depth = 0) {
    if (!shape?.length) return;

    const topPoints = shape.map((p) => new Vector3(p.x, 0.01, p.z));
    topPoints.push(topPoints[0].clone());

    const linesMeshes = [MeshBuilder.CreateLines("area-outline-top", { points: topPoints }, scene)];

    if (depth > 0) {
        const bottomPoints = shape.map((p) => new Vector3(p.x, -depth - 0.01, p.z));
        bottomPoints.push(bottomPoints[0].clone());
        linesMeshes.push(MeshBuilder.CreateLines("area-outline-bottom", { points: bottomPoints }, scene));
    }

    linesMeshes.forEach((lines) => {
        lines.color = new Color3(0.05, 0.05, 0.05);
        lines.alpha = 0.9;
        lines.isPickable = false;
        lines.parent = parentMesh;
    });
}

function createAreaOutline3D(scene, area) {
    const type = area.areaType || area.type || "opening";

    const points = area.points.map(mapPointToBabylon);

    if (points.length) {
        points.push(points[0].clone());
    }

    const mesh = MeshBuilder.CreateLines(
        `area-outline-${area.id}`,
        { points },
        scene
    );

    const style = getAreaStyle(area);
    mesh.color = style.color;
    mesh.alpha = 1;
    mesh.isPickable = true;
    mesh.metadata = {
        type: "area",
        areaId: area.id,
        areaType: type,
        plane: "outline",
    };

    return mesh;
}

export function createArea3D(scene, area, options = {}) {
    if (!scene || !area || !area.points || area.points.length < 3) {
        return null;
    }

    const type = area.areaType || area.type || "slab";

    // Las aberturas se muestran como contorno rojo.
    if (type === "opening") {
        return createAreaOutline3D(scene, area);
    }

    // Losa horizontal: mantiene soporte de openings/holes.
    if (isHorizontalArea(area)) {
        return createHorizontalArea3D(scene, area, options);
    }

    // Muro vertical o área inclinada: usa triangulación 3D real.
    return createGeneric3DPolygon(scene, area);
}

function safeDisposeMeshAfterRender(mesh, scene) {
    if (!mesh || mesh.isDisposed()) return;

    const material = mesh.material || null;

    // Primero lo ocultamos para que ya no se vea ni se pueda seleccionar.
    mesh.setEnabled(false);
    mesh.isPickable = false;

    const disposeNow = () => {
        try {
            if (mesh && !mesh.isDisposed()) {
                mesh.dispose(false, false);
            }

            if (material && !material.isDisposed?.()) {
                material.dispose();
            }
        } catch (error) {
            console.warn("No se pudo liberar mesh/material 3D de área:", error);
        }
    };

    // Evita eliminar recursos justo mientras Babylon está renderizando.
    if (scene?.onAfterRenderObservable) {
        scene.onAfterRenderObservable.addOnce(disposeNow);
    } else {
        setTimeout(disposeNow, 0);
    }
}

export function updateArea3D(oldMesh, scene, area, options = {}) {
    const newMesh = createArea3D(scene, area, options);

    if (oldMesh && oldMesh !== newMesh) {
        safeDisposeMeshAfterRender(oldMesh, scene);
    }

    return newMesh;
}
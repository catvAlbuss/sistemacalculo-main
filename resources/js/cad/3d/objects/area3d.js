import {
    MeshBuilder,
    StandardMaterial,
    Color3,
    Vector3,
    Mesh,
    VertexData,
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
    mat.diffuseColor = style.color;
    mat.alpha = style.alpha;
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

    const mesh = MeshBuilder.CreatePolygon(
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

    // Z del modelo pasa a Y de Babylon.
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

    return mesh;
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
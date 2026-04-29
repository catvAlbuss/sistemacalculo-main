import {
    MeshBuilder,
    StandardMaterial,
    Color3,
    Vector3,
    Mesh,
} from "@babylonjs/core";
import earcut from "earcut";

function getAreaStyle(area) {
    const type = area.areaType || "slab";

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
    if (area.points?.length && typeof area.points[0].z === "number") return area.points[0].z;
    return 0;
}

function toPolygonShape(points) {
    // Babylon polygon horizontal en plano XZ
    return points.map((p) => new Vector3(p.x ?? 0, 0, p.y ?? 0));
}

export function createArea3D(scene, area, options = {}) {
    if (!scene || !area || !area.points || area.points.length < 3) return null;

    const type = area.areaType || "slab";
    const elev = getAreaElevation(area);
    const style = getAreaStyle(area);
    const holesAreas = options.holes || [];

    // Abertura: la seguimos dibujando como contorno rojo
    if (type === "opening") {
        const points = area.points.map((p) => new Vector3(p.x ?? 0, elev + 0.01, p.y ?? 0));
        if (points.length) {
            points.push(points[0].clone());
        }

        const mesh = MeshBuilder.CreateLines(`area-opening-${area.id}`, { points }, scene);
        mesh.color = style.color;
        mesh.isPickable = true;
        mesh.metadata = {
            type: "area",
            areaId: area.id,
            areaType: type,
        };
        return mesh;
    }

    const shape = toPolygonShape(area.points);

    const holes =
        type === "slab"
            ? holesAreas
                .filter((h) => h?.points?.length >= 3)
                .map((h) => toPolygonShape(h.points))
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

    mesh.position.y = elev;

    const mat = new StandardMaterial(`areaMat-${area.id}`, scene);
    mat.diffuseColor = style.color;
    mat.alpha = style.alpha;
    mat.backFaceCulling = false;
    mat.specularColor = Color3.Black();

    mesh.material = mat;
    mesh.isPickable = true;
    mesh.metadata = {
        type: "area",
        areaId: area.id,
        areaType: type,
        holeCount: holes.length,
    };

    return mesh;
}

export function updateArea3D(oldMesh, scene, area, options = {}) {
    if (oldMesh && !oldMesh.isDisposed()) {
        oldMesh.dispose();
    }
    return createArea3D(scene, area, options);
}
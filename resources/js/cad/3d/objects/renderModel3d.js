import { createNode3D, updateNode3D } from "./node3d.js";
import { createBeam3D, updateBeam3D } from "./beam3d.js";
import { createArea3D, updateArea3D } from "./area3d.js";

function getAreaElevation(area) {
  if (typeof area?.z === "number") return area.z;
  if (area?.points?.length && typeof area.points[0]?.z === "number") return area.points[0].z;
  return 0;
}

function pointInPolygon2D(point, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect =
      ((yi > point.y) !== (yj > point.y)) &&
      (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 1e-9) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

function getPolygonCentroid(points = []) {
  if (!points.length) return null;

  let x = 0;
  let y = 0;

  points.forEach((p) => {
    x += p.x ?? 0;
    y += p.y ?? 0;
  });

  return {
    x: x / points.length,
    y: y / points.length,
  };
}

function openingBelongsToSlab(opening, slab) {
  if (!opening?.points?.length || !slab?.points?.length) return false;

  const zOpen = getAreaElevation(opening);
  const zSlab = getAreaElevation(slab);

  if (Math.abs(zOpen - zSlab) > 1e-6) return false;

  const center = getPolygonCentroid(opening.points);
  if (!center) return false;

  return pointInPolygon2D(center, slab.points);
}

export function renderModel3D(viewer3D, nodes = [], shapes = [], areas = []) {
  if (!viewer3D || !viewer3D.scene) return;

  const scene = viewer3D.scene;

  if (!scene.__structuralState) {
    scene.__structuralState = {
      nodeMeshes: new Map(),
      beamMeshes: new Map(),
      areaMeshes: new Map(),
    };
  }

  const { nodeMeshes, beamMeshes, areaMeshes } = scene.__structuralState;

  const nodeIds = new Set();
  const beamIds = new Set();
  const areaIds = new Set();

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // =========================
  // NODOS
  // =========================
  for (const node of nodes) {
    if (!node || node.id == null) continue;

    nodeIds.add(node.id);

    const existingMesh = nodeMeshes.get(node.id);

    if (existingMesh && !existingMesh.isDisposed()) {
      updateNode3D(existingMesh, node);
    } else {
      const nodeMesh = createNode3D(scene, node);
      if (nodeMesh) {
        nodeMeshes.set(node.id, nodeMesh);
      }
    }
  }

  for (const [nodeId, mesh] of nodeMeshes.entries()) {
    if (!nodeIds.has(nodeId)) {
      if (mesh && !mesh.isDisposed()) mesh.dispose();
      nodeMeshes.delete(nodeId);
    }
  }

  // =========================
  // BARRAS
  // =========================
  for (const shape of shapes) {
    if (!shape || shape.id == null) continue;

    beamIds.add(shape.id);

    const existingMesh = beamMeshes.get(shape.id);

    const node1 =
      typeof shape.node1 === "object"
        ? shape.node1
        : nodeMap.get(shape.node1);

    const node2 =
      typeof shape.node2 === "object"
        ? shape.node2
        : nodeMap.get(shape.node2);

    if (!node1 || !node2) continue;

    if (existingMesh && !existingMesh.isDisposed()) {
      const updatedMesh = updateBeam3D(existingMesh, shape, node1, node2);
      if (updatedMesh && updatedMesh !== existingMesh) {
        beamMeshes.set(shape.id, updatedMesh);
      }
    } else {
      const beamMesh = createBeam3D(scene, {
        ...shape,
        node1,
        node2,
      });

      if (beamMesh) {
        beamMeshes.set(shape.id, beamMesh);
      }
    }
  }

  for (const [beamId, mesh] of beamMeshes.entries()) {
    if (!beamIds.has(beamId)) {
      if (mesh && !mesh.isDisposed()) mesh.dispose();
      beamMeshes.delete(beamId);
    }
  }

  // =========================
  // ÁREAS
  // =========================
  const openings = areas.filter((a) => a?.areaType === "opening");
  const nonOpeningAreas = areas.filter((a) => a?.areaType !== "opening");

  for (const area of nonOpeningAreas) {
    if (!area || area.id == null) continue;

    areaIds.add(area.id);

    const existingMesh = areaMeshes.get(area.id);

    const holes =
      area.areaType === "slab"
        ? openings.filter((opening) => openingBelongsToSlab(opening, area))
        : [];

    if (existingMesh && !existingMesh.isDisposed()) {
      const updatedMesh = updateArea3D(existingMesh, scene, area, { holes });
      if (updatedMesh) {
        areaMeshes.set(area.id, updatedMesh);
      }
    } else {
      const areaMesh = createArea3D(scene, area, { holes });
      if (areaMesh) {
        areaMeshes.set(area.id, areaMesh);
      }
    }
  }

  // Renderizar también los contornos de abertura
  for (const opening of openings) {
    if (!opening || opening.id == null) continue;

    const openingMeshId = `opening-${opening.id}`;
    areaIds.add(openingMeshId);

    const existingMesh = areaMeshes.get(openingMeshId);

    if (existingMesh && !existingMesh.isDisposed()) {
      const updatedMesh = updateArea3D(existingMesh, scene, opening);
      if (updatedMesh) {
        areaMeshes.set(openingMeshId, updatedMesh);
      }
    } else {
      const mesh = createArea3D(scene, opening);
      if (mesh) {
        areaMeshes.set(openingMeshId, mesh);
      }
    }
  }

  for (const [areaId, mesh] of areaMeshes.entries()) {
    if (!areaIds.has(areaId)) {
      if (mesh && !mesh.isDisposed()) mesh.dispose();
      areaMeshes.delete(areaId);
    }
  }
}
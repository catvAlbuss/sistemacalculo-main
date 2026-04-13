import { createNode3D, updateNode3D } from "./objects/node3d.js";
import { createBeam3D, updateBeam3D } from "./objects/beam3d.js";

export function renderModel3D(viewer3D, nodes = [], shapes = []) {
  if (!viewer3D || !viewer3D.scene) return;

  const scene = viewer3D.scene;

  if (!scene.__structuralState) {
    scene.__structuralState = {
      nodeMeshes: new Map(),
      beamMeshes: new Map(),
    };
  }

  const { nodeMeshes, beamMeshes } = scene.__structuralState;

  const nodeIds = new Set();
  const beamIds = new Set();

  // ===== NODOS =====
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

  // Eliminar nodos borrados
  for (const [nodeId, mesh] of nodeMeshes.entries()) {
    if (!nodeIds.has(nodeId)) {
      if (mesh && !mesh.isDisposed()) {
        mesh.dispose();
      }
      nodeMeshes.delete(nodeId);
    }
  }

  // Mapa rápido de nodos
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // ===== BARRAS =====
  for (const shape of shapes) {
    if (!shape || shape.id == null) continue;

    beamIds.add(shape.id);

    const existingMesh = beamMeshes.get(shape.id);

    const node1 =
      typeof shape.node1 === "object" ? shape.node1 : nodeMap.get(shape.node1);

    const node2 =
      typeof shape.node2 === "object" ? shape.node2 : nodeMap.get(shape.node2);

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

  // Eliminar barras borradas
  for (const [beamId, mesh] of beamMeshes.entries()) {
    if (!beamIds.has(beamId)) {
      if (mesh && !mesh.isDisposed()) {
        mesh.dispose();
      }
      beamMeshes.delete(beamId);
    }
  }
}
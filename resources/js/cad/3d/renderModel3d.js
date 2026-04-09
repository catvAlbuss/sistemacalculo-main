import { createNode3D } from "./objects/node3d.js";
import { createBeam3D } from "./objects/beam3d.js";

export function renderModel3D(viewer3D, nodes = [], shapes = []) {
  if (!viewer3D || !viewer3D.scene) return;

  const scene = viewer3D.scene;

  if (!scene.__structuralMeshes) {
    scene.__structuralMeshes = [];
  }

  // limpiar mallas previas
  scene.__structuralMeshes.forEach((mesh) => {
    if (mesh && !mesh.isDisposed()) {
      mesh.dispose();
    }
  });

  scene.__structuralMeshes = [];

  // dibujar nodos
  nodes.forEach((node) => {
    const nodeMesh = createNode3D(scene, node);
    scene.__structuralMeshes.push(nodeMesh);
  });

  // dibujar barras
  shapes.forEach((shape) => {
    const beamMesh = createBeam3D(scene, shape);
    scene.__structuralMeshes.push(beamMesh);
  });
}
import { MeshBuilder, StandardMaterial, Color3, Vector3 } from "@babylonjs/core";

export function createNode3D(scene, node) {
  const mesh = MeshBuilder.CreateSphere(
    `node-${node.id ?? Math.random()}`,
    { diameter: 0.2 },
    scene
  );

  const material = new StandardMaterial(`mat-node-${node.id ?? Math.random()}`, scene);
  material.diffuseColor = new Color3(1, 0, 0);

  mesh.material = material;

  const x = node.position?.x ?? node.x ?? 0;
  const y = node.position?.y ?? node.y ?? 0;
  const z = node.position?.z ?? node.z ?? 0;

  mesh.position = new Vector3(x, y, z);
  mesh.metadata = {
    type: "node",
    nodeId: node.id ?? null,
  };

  return mesh;
}
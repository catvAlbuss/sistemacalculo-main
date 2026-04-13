import { MeshBuilder, Vector3 } from "@babylonjs/core";

export function createNode3D(scene, node, material) {
  const x = node.position?.x ?? node.x ?? 0;
  const y = node.position?.y ?? node.y ?? 0;
  const z = node.position?.z ?? node.z ?? 0;

  const mesh = MeshBuilder.CreateSphere(
    `node-${node.id}`,
    {
      diameter: 0.18,
      segments: 16,
    },
    scene
  );

  mesh.position = new Vector3(x, z, y); // 🔥 intercambiar y-z para que z sea altura

  if (material) mesh.material = material;

  mesh.isPickable = true;
  mesh.metadata = {
    type: "node",
    nodeId: node.id,
  };

  return mesh;
}

export function updateNode3D(mesh, node) {
  const x = node.position?.x ?? node.x ?? 0;
  const y = node.position?.y ?? node.y ?? 0;
  const z = node.position?.z ?? node.z ?? 0;

  mesh.position.set(x, y, z);

  mesh.isPickable = true;
  mesh.metadata = {
    type: "node",
    nodeId: node.id,
  };

  return mesh;
}
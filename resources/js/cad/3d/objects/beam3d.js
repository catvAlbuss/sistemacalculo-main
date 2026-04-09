import { MeshBuilder, Color3, Vector3 } from "@babylonjs/core";

export function createBeam3D(scene, beam) {
  const p1 = beam.node1?.position ?? beam.node1;
  const p2 = beam.node2?.position ?? beam.node2;

  const points = [
    new Vector3(p1.x ?? 0, p1.y ?? 0, p1.z ?? 0),
    new Vector3(p2.x ?? 0, p2.y ?? 0, p2.z ?? 0),
  ];

  const line = MeshBuilder.CreateLines(
    `beam-${beam.id ?? Math.random()}`,
    { points },
    scene
  );

  line.color = new Color3(1, 1, 1);
  line.metadata = {
    type: "beam",
    beamId: beam.id ?? null,
  };

  return line;
}
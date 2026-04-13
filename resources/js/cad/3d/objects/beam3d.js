import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Quaternion,
} from "@babylonjs/core";

export function createBeam3D(scene, beam, material = null) {
  const p1 = beam.node1?.position ?? beam.node1;
  const p2 = beam.node2?.position ?? beam.node2;

  if (!p1 || !p2) return null;

  const start = new Vector3(p1.x ?? 0, p1.z ?? 0, p1.y ?? 0);
  const end = new Vector3(p2.x ?? 0, p2.z ?? 0, p2.y ?? 0);

  const direction = end.subtract(start);
  const length = direction.length();

  if (length < 1e-6) return null;

  const mesh = MeshBuilder.CreateCylinder(
    `beam-${beam.id}`,
    {
      height: 1,
      diameter: 0.15,
      tessellation: 12,
    },
    scene
  );

  // material
  if (material) {
    mesh.material = material;
  } else {
    const mat = new StandardMaterial(`beamMat-${beam.id}`, scene);
    mat.diffuseColor = new Color3(0.9, 0.9, 0.9);
    mat.specularColor = new Color3(0, 0, 0);
    mesh.material = mat;
  }

  applyTransform(mesh, start, end, length);

  mesh.isPickable = true;
  mesh.metadata = {
    type: "beam",
    beamId: beam.id,
  };

  return mesh;
}

export function updateBeam3D(mesh, beam, node1, node2) {
  const p1 = node1?.position ?? node1;
  const p2 = node2?.position ?? node2;

  if (!p1 || !p2) return mesh;

  const start = new Vector3(p1.x ?? 0, p1.y ?? 0, p1.z ?? 0);
  const end = new Vector3(p2.x ?? 0, p2.y ?? 0, p2.z ?? 0);

  const direction = end.subtract(start);
  const length = direction.length();

  if (length < 1e-6) return mesh;

  applyTransform(mesh, start, end, length);

  mesh.metadata = {
    type: "beam",
    beamId: beam.id,
  };

  return mesh;
}

// 🔥 función reutilizable para orientación
function applyTransform(mesh, start, end, length) {
  const mid = start.add(end).scale(0.5);
  mesh.position.copyFrom(mid);

  // escala en Y (altura del cilindro)
  mesh.scaling.set(1, length, 1);

  const direction = end.subtract(start).normalize();
  const up = Vector3.Up();

  const dot = Vector3.Dot(up, direction);

  if (dot > 0.999999) {
    mesh.rotationQuaternion = Quaternion.Identity();
  } else if (dot < -0.999999) {
    mesh.rotationQuaternion = Quaternion.RotationAxis(Vector3.Right(), Math.PI);
  } else {
    const axis = Vector3.Cross(up, direction).normalize();
    const angle = Math.acos(dot);
    mesh.rotationQuaternion = Quaternion.RotationAxis(axis, angle);
  }
}
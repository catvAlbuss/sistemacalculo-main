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

  // Mantener el mismo mapeo que ya vienes usando:
  // Babylon: X = x, Y = z, Z = y
  const start = new Vector3(p1.x ?? 0, p1.z ?? 0, p1.y ?? 0);
  const end = new Vector3(p2.x ?? 0, p2.z ?? 0, p2.y ?? 0);

  const direction = end.subtract(start);
  const length = direction.length();

  if (length < 1e-6) return null;

  const elementKind = inferElementKind(beam, p1, p2);
  const style = getElementStyle(elementKind);

  const mesh = MeshBuilder.CreateCylinder(
    `beam-${beam.id}`,
    {
      height: 1,
      diameter: style.diameter,
      tessellation: 12,
    },
    scene
  );

  // material
  if (material) {
    mesh.material = material;
  } else {
    const mat = new StandardMaterial(`beamMat-${beam.id}`, scene);
    mat.diffuseColor = style.color;
    mat.specularColor = new Color3(0, 0, 0);
    mesh.material = mat;
  }

  applyTransform(mesh, start, end, length);

  mesh.isPickable = true;
  mesh.metadata = {
    type: "beam",          // mantener "beam" para no romper tu selección actual
    beamId: beam.id,
    elementKind,           // beam | column | brace
  };

  return mesh;
}

export function updateBeam3D(mesh, beam, node1, node2) {
  const p1 = node1?.position ?? node1;
  const p2 = node2?.position ?? node2;

  if (!p1 || !p2) return mesh;

  // IMPORTANTE:
  // Lo corrijo para que use el MISMO mapeo que createBeam3D
  const start = new Vector3(p1.x ?? 0, p1.z ?? 0, p1.y ?? 0);
  const end = new Vector3(p2.x ?? 0, p2.z ?? 0, p2.y ?? 0);

  const direction = end.subtract(start);
  const length = direction.length();

  if (length < 1e-6) return mesh;

  const elementKind = inferElementKind(beam, p1, p2);
  const style = getElementStyle(elementKind);

  applyTransform(mesh, start, end, length);

  // actualizar grosor si cambia el tipo
  mesh.scaling.x = 1;
  mesh.scaling.z = 1;

  // Si quieres aparentar más grosor por tipo sin recrear el mesh:
  const baseDiameter = 0.15;
  const factor = style.diameter / baseDiameter;
  mesh.scaling.x = factor;
  mesh.scaling.z = factor;

  if (mesh.material) {
    mesh.material.diffuseColor = style.color;
  }

  mesh.metadata = {
    type: "beam",
    beamId: beam.id,
    elementKind,
  };

  return mesh;
}

// ===============================
// Helpers
// ===============================

function inferElementKind(beam, p1, p2) {
  // 1) Si el beam ya trae un tipo explícito, usarlo primero
  const explicitType =
    beam.elementKind ||
    beam.elementType ||
    beam.kind ||
    beam.typeName ||
    beam.objectType ||
    beam.category ||
    beam.role;

  if (explicitType) {
    const normalized = String(explicitType).toLowerCase();

    if (
      normalized.includes("column") ||
      normalized.includes("columna")
    ) {
      return "column";
    }

    if (
      normalized.includes("brace") ||
      normalized.includes("arriostre") ||
      normalized.includes("diagonal")
    ) {
      return "brace";
    }

    if (
      normalized.includes("beam") ||
      normalized.includes("viga")
    ) {
      return "beam";
    }
  }

  // 2) Si no trae tipo, inferir por geometría
  const dx = Math.abs((p2.x ?? 0) - (p1.x ?? 0));
  const dy = Math.abs((p2.y ?? 0) - (p1.y ?? 0));
  const dz = Math.abs((p2.z ?? 0) - (p1.z ?? 0));

  const tol = 1e-6;

  // Vertical puro -> columna
  if (dx < tol && dy < tol && dz > tol) {
    return "column";
  }

  // Horizontal puro -> viga
  if (dz < tol && (dx > tol || dy > tol)) {
    return "beam";
  }

  // Si tiene componente horizontal y vertical -> diagonal / brace
  if (dz > tol && (dx > tol || dy > tol)) {
    return "brace";
  }

  return "beam";
}

function getElementStyle(kind) {
  switch (kind) {
    case "column":
      return {
        color: new Color3(0.2, 0.9, 0.6), // verde-agua
        diameter: 0.18,
      };

    case "brace":
      return {
        color: new Color3(1.0, 0.85, 0.2), // amarillo
        diameter: 0.12,
      };

    case "beam":
    default:
      return {
        color: new Color3(1.0, 0.83, 0.1),
        diameter: 0.1,
      };
  }
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
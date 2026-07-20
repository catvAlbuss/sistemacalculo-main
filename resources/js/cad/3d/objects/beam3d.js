import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Quaternion,
} from "@babylonjs/core";

export function createBeam3D(scene, beam, material = null, opts = {}) {
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

  // =====================================================
  // VISTA EXTRUIDA (Extrude View tipo ETABS)
  // Dibuja el frame como un prisma rectangular b×h de su sección, orientado
  // por el eje del elemento y (en columnas) por su rotación de eje local.
  // =====================================================
  const extrude = opts.extrude === true;

  // Vista ESTÁNDAR: cilindros con grosor VISUAL fijo por tipo (como las líneas
  // de ETABS) — con el diámetro real de la sección ((b+h)/2) los modelos
  // importados (todas las secciones asignadas, p.ej. 30×40 → Ø0.35 m) se veían
  // con el doble de grosor. La proporción REAL b×h la da la vista extruida.
  const mesh = extrude
    ? MeshBuilder.CreateBox(
        `beam-${beam.id}`,
        { width: 1, height: 1, depth: 1 },
        scene
      )
    : MeshBuilder.CreateCylinder(
        `beam-${beam.id}`,
        { height: 1, diameter: style.diameter, tessellation: 12 },
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

  if (extrude) {
    orientExtrudedFrame(mesh, start, end, elementKind, getFrameDims(beam), beam.localAxisAngle);
  } else {
    applyTransform(mesh, start, end, length);
  }

  mesh.isPickable = true;
  mesh.metadata = {
    type: "beam",          // mantener "beam" para no romper tu selección actual
    beamId: beam.id,
    elementKind,           // beam | column | brace
    extruded: extrude,
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

  // Mesh extruido (box b×h): reorientar/redimensionar con su propia lógica.
  if (mesh.metadata?.extruded) {
    orientExtrudedFrame(mesh, start, end, elementKind, getFrameDims(beam), beam.localAxisAngle);

    if (mesh.material) {
      mesh.material.diffuseColor = style.color;
    }

    mesh.metadata = { type: "beam", beamId: beam.id, elementKind, extruded: true };
    return mesh;
  }

  applyTransform(mesh, start, end, length);

  // Actualizar grosor si cambia el tipo (viga↔columna↔brace) sin recrear el
  // mesh (comportamiento original, restaurado tras el cambio de "proporción
  // 3D" que engordaba los modelos importados).
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
// VISTA EXTRUIDA > dimensiones de sección (b×h en metros)
// Reutiliza la misma normalización de unidades que la huella 2D de columnas.
// ===============================
function getFrameDims(beam) {
  const sec = beam.frameSection || beam.section || {};
  const shape = String(sec.shape || sec.type || "").toLowerCase();
  const metallic = ["i", "wf", "w", "channel", "c", "tube", "hss", "angle", "l"].includes(shape);

  const toMeters = (v) => {
    v = Number(v);
    if (!(v > 0)) return 0;
    if (v <= 3) return v;                 // ya en metros
    return metallic ? v / 1000 : v / 100; // perfil: mm ; rectangular: cm
  };

  const b = toMeters(sec.b ?? sec.width ?? sec.base);
  const h = toMeters(sec.h ?? sec.height ?? sec.peralte);

  return { b, h };
}

// ===============================
// VISTA EXTRUIDA > orientar y dimensionar el prisma del frame
// El box unitario se escala a (b, largo, h) y se rota para que su eje local Y
// siga la barra. En columnas la sección respeta la rotación de eje local
// (localAxisAngle); en vigas/diagonales el peralte h queda vertical.
// ===============================
function orientExtrudedFrame(mesh, start, end, kind, dims, rollDeg) {
  const axisVec = end.subtract(start);
  const length = axisVec.length();
  if (length < 1e-6) return;

  const yL = axisVec.normalize(); // eje de extrusión (largo de la barra)

  const b = dims.b > 0 ? dims.b : 0.3;
  const h = dims.h > 0 ? dims.h : (kind === "column" ? 0.3 : 0.5);

  const vertical = Math.abs(yL.y) > 0.9; // Babylon Y = Z del modelo (altura)

  let bDir;
  let hDir;

  if (vertical) {
    // Columna: sección en el plano horizontal (Babylon X-Z).
    // θ=0 → peralte h sobre X del modelo (Babylon X); ancho b sobre Y (Babylon Z).
    const t = (Number(rollDeg || 0) * Math.PI) / 180;
    const c = Math.cos(t);
    const s = Math.sin(t);
    hDir = new Vector3(c, 0, s);
    bDir = new Vector3(-s, 0, c);
  } else {
    // Viga / diagonal: peralte h hacia arriba, ancho b perpendicular horizontal.
    let bd = Vector3.Cross(yL, Vector3.Up());
    if (bd.length() < 1e-6) bd = new Vector3(1, 0, 0);
    bDir = bd.normalize();
    hDir = Vector3.Cross(bDir, yL).normalize();
  }

  mesh.rotationQuaternion = null;
  mesh.rotation = Vector3.RotationFromAxis(bDir, yL, hDir);
  mesh.position.copyFrom(start.add(end).scale(0.5));
  mesh.scaling.set(b, length, h);
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
        // Mismo grosor visual que una barra normal (el usuario dibuja columnas
        // con el botón y deben verse como líneas, no como tubos); el tipo se
        // distingue por color. La sección real b×h la muestra la vista extruida.
        diameter: 0.1,
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
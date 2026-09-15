/**
 * Sólidos de la VISTA EXTRUIDA según la FORMA real de la sección.
 *
 * Antes toda barra se dibujaba como un prisma rectangular b×h, así que una
 * columna circular salía cuadrada y una L o una T salían como su caja
 * envolvente — que en la CL 70x70x30 sobreestima el área un 48 %.
 *
 * La geometría de la L y la T sale de `lib/sectionPolygon.js`, el MISMO módulo
 * que usan la huella en planta y el diseñador de armado. No hay una segunda
 * copia acá: tener la forma duplicada es lo que hizo que la orientación de la L
 * tardara tres intentos en calzar contra ETABS.
 *
 * EJES. El mesh se devuelve con la sección en su plano local X-Z y extruida
 * sobre su Y local, para que `orientExtrudedFrame` lo rote igual que al prisma:
 *   local X → dirección del PERALTE (eje 2 de la sección, `u`)
 *   local Z → dirección del ANCHO   (eje 3 de la sección, `v`)
 *   local Y → eje de la barra
 *
 * El orden importa: la terna (hDir, yL, bDir) es DEXTRÓGIRA y (bDir, yL, hDir)
 * no lo es. `RotationFromAxis` no representa reflexiones, así que con la terna
 * invertida devolvía una rotación que ni siquiera respetaba el `roll`.
 */
import { MeshBuilder, Mesh, Matrix, Quaternion, Vector3 } from "@babylonjs/core";
import earcut from "earcut";
import { lSectionVertices, teeSectionVertices } from "../../lib/sectionPolygon.js";

/** cm → m. Las secciones de concreto del importador vienen en cm. */
function aMetros(v) {
  const n = Number(v);
  if (!(n > 0)) return 0;
  return n <= 3 ? n : n / 100; // <= 3 ya venía en metros
}

/**
 * Normaliza la sección de una barra a lo que necesita el dibujo, en metros.
 * Devuelve `null` si no hay forma especial (el llamador usa el prisma de
 * siempre).
 */
export function perfilDeSeccion(sec) {
  if (!sec) return null;
  const forma = String(sec.shape || sec.type || "").toLowerCase();

  if (forma === "circle" || forma.startsWith("circ")) {
    const d = aMetros(sec.diameter ?? sec.b ?? sec.h);
    return d > 0 ? { kind: "circ", diameter: d } : null;
  }

  if (forma === "l") {
    const p = {
      kind: "l",
      h: aMetros(sec.h),                 // peralte D (eje 2)
      b: aMetros(sec.b),                 // ancho B  (eje 3)
      flange: aMetros(sec.lFlangeThick),
      web: aMetros(sec.lWebThick),
      mirror2: sec.lMirror2 === true,
      mirror3: sec.lMirror3 === true,
    };
    return p.h > 0 && p.b > 0 && p.flange > 0 && p.web > 0 ? p : null;
  }

  if (forma === "tee") {
    // OJO: la T guarda teeDepth/teeWidth, no b/h (ver e2k-import.js).
    const p = {
      kind: "tee",
      h: aMetros(sec.teeDepth ?? sec.h),
      b: aMetros(sec.teeWidth ?? sec.b),
      flange: aMetros(sec.teeFlangeThick),
      web: aMetros(sec.teeWebThick),
    };
    return p.h > 0 && p.b > 0 && p.flange > 0 && p.web > 0 ? p : null;
  }

  return null;
}

/** Vértices [u,v] del contorno, en metros. `[]` si la forma no es poligonal. */
function contorno(p) {
  if (p.kind === "l") {
    return lSectionVertices(p.h, p.b, p.flange, p.web, p.mirror2, p.mirror3);
  }
  if (p.kind === "tee") return teeSectionVertices(p.h, p.b, p.flange, p.web);
  return [];
}

/**
 * Mesh de una barra con la forma real de su sección, de largo `length`,
 * centrado en el origen y con el eje sobre su Y local.
 * Devuelve `null` si la forma no aplica.
 */
export function crearSolidoDeSeccion(scene, nombre, perfil, length) {
  if (!perfil || !(length > 0)) return null;

  if (perfil.kind === "circ") {
    return MeshBuilder.CreateCylinder(
      nombre,
      { height: length, diameter: perfil.diameter, tessellation: 24 },
      scene,
    );
  }

  const vert = contorno(perfil);
  if (vert.length < 3) return null;

  // [u,v] -> (u, 0, v): el peralte va sobre X local y el ancho sobre Z local,
  // que es como `orientExtrudedFrame` espera encontrarlos.
  const shape = vert.map(([u, v]) => new Vector3(u, 0, v));

  const mesh = MeshBuilder.ExtrudePolygon(
    nombre,
    { shape, depth: length, sideOrientation: Mesh.DOUBLESIDE, updatable: false },
    scene,
    earcut,
  );

  // ExtrudePolygon deja la tapa superior en y=0 y extruye hacia ABAJO; el
  // prisma al que reemplaza está centrado en el origen. Se hornea la
  // traslación en los vértices (no en `position`) porque el llamador va a
  // pisar `position` con el punto medio de la barra.
  mesh.bakeTransformIntoVertices(Matrix.Translation(0, length / 2, 0));
  return mesh;
}

/**
 * Rotación que lleva los ejes LOCALES del mesh a los del elemento:
 * local X → `hDir` (peralte), local Y → `yL` (eje de la barra), local Z → `bDir`.
 *
 * Se arma la matriz a mano en vez de usar `Vector3.RotationFromAxis` porque esa
 * devuelve ángulos de Euler y, con la terna en orden especular, entregaba una
 * rotación que ni siquiera respetaba el ángulo de eje local — invisible en un
 * prisma simétrico, no en una L.
 *
 * Si la terna sale levógira (pasa cuando la barra se dibujó de arriba hacia
 * abajo) se invierte `yL`: el sólido es un prisma simétrico respecto de su punto
 * medio, así que el eje da lo mismo, y la sección en planta la fijan `hDir` y
 * `bDir`, que no se tocan.
 */
export function rotacionDesdeEjes(hDir, yL, bDir) {
  let y = yL;
  if (Vector3.Dot(Vector3.Cross(hDir, y), bDir) < 0) y = y.scale(-1);
  return Quaternion.FromRotationMatrix(
    Matrix.FromValues(
      hDir.x, hDir.y, hDir.z, 0,
      y.x, y.y, y.z, 0,
      bDir.x, bDir.y, bDir.z, 0,
      0, 0, 0, 1,
    ),
  );
}

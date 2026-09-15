/**
 * Chequeo de orientación de la vista extruida.  node resources/js/cad/3d/objects/frameSection3d.check.mjs
 *
 * Contrasta el sólido 3D contra la huella 2D en planta (que ya está validada
 * contra ETABS) para las 4 variantes de sección poligonal, 8 ángulos de eje
 * local y las dos direcciones de dibujo de la columna.
 *
 * POR QUÉ EXISTE: la terna de ejes estaba en orden ESPECULAR y
 * `Vector3.RotationFromAxis` devolvía una rotación que ignoraba el ángulo de eje
 * local. En un prisma b×h eso es invisible —es simétrico—, así que el bug vivía
 * escondido hasta que se dibujó la primera L. Sin este chequeo no se detecta.
 */
import { Vector3, Matrix } from "@babylonjs/core/Maths/math.vector.js";
import { lSectionVertices, teeSectionVertices } from "../../lib/sectionPolygon.js";
import { rotacionDesdeEjes } from "./frameSection3d.js";

const casos = [["L mirror3", lSectionVertices(0.70,0.70,0.30,0.30,false,true)],
               ["L base",    lSectionVertices(0.70,0.70,0.30,0.30,false,false)],
               ["L mirror2", lSectionVertices(0.70,0.70,0.30,0.30,true,false)],
               ["T",         teeSectionVertices(0.60,1.00,0.30,0.30)]];

let fallos = 0, total = 0;
for (const [nom, vert] of casos) {
  for (const rollDeg of [0, 30, 45, 90, 135, 180, 270, 330]) {
    for (const [dirNom, yL] of [["arriba", new Vector3(0,1,0)], ["abajo", new Vector3(0,-1,0)]]) {
      const t = (rollDeg*Math.PI)/180, c = Math.cos(t), s = Math.sin(t);
      const hDir = new Vector3(c, 0, s), bDir = new Vector3(-s, 0, c);
      const M = new Matrix();
      rotacionDesdeEjes(hDir, yL, bDir).toRotationMatrix(M);
      let mal = 0;
      for (const [u, v] of vert) {
        const p = Vector3.TransformCoordinates(new Vector3(u, 0, v), M);
        const mx2 = u*c - v*s, my2 = u*s + v*c;   // lo que dibuja la huella 2D
        total++;
        // 1e-5, no 1e-9: Babylon calcula en float32 y cos(45deg) ya trae 1.2e-8 de error
        if (Math.abs(p.x - mx2) > 1e-5 || Math.abs(p.z - my2) > 1e-5) { mal++; fallos++; }
      }
      if (mal) console.log(`  ${nom.padEnd(10)} roll ${String(rollDeg).padStart(3)}deg ${dirNom.padEnd(7)}: ${mal}/${vert.length} NO calzan`);
    }
  }
}
console.log(fallos === 0
  ? `\n  TODO CALZA contra la huella 2D: ${total} vertices (4 secciones x 8 angulos x 2 sentidos), 0 discrepancias`
  : `\n  ${fallos}/${total} discrepancias`);

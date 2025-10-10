import {
  irregularidadRigidezPisoBlandoX,
  irregularidadResistenciaPisoDebilX,
  irregularidadRigidezPisoBlandoXExtrema,
  irregularidadResistenciaPisoDebilXExtrema,
  irregularidadRigidezPisoBlandoY,
  irregularidadResistenciaPisoDebilY,
  irregularidadRigidezPisoBlandoYExtrema,
  irregularidadResistenciaPisoDebilYExtrema,
  irregularidadMasaOPeso,
  irregularidadGeometricaVerticalXY,
  irregularidadGeometricaVerticalXXYY,
  DSV1,
  DSV2,
  irregularidadPlantaGeometricaVerticalXY,
  irregularidadPlantaGeometricaVerticalXYXY,
  IRRPDDA1,
  IRRPDDA2,
  IRRPDDD1,
  IRRPDDD2,
  sistemasNoParalelosXY,
  sistemasNoParalelosXYXY,
  irregularidadTorsionalXX,
  irregularidadTorsionalYY,
} from "./irregularidades/tables.js";
import { createTableIrregularidad } from "./irregularidades/table_factory.js";
import { createTable } from "./irregularidades/table_model.js";

function calculateTorsional() {
  var deriva = parseFloat(document.getElementById("deriva").value);
  var d1 = parseFloat(document.getElementById("d1").value);
  var d2 = parseFloat(document.getElementById("d2").value);

  var dprom = 0.5 * (d1 + d2);
  document.getElementById("dprom").textContent = dprom.toFixed(3);
  document.getElementById("permisible").textContent = (0.5 * deriva).toFixed(3);
  document.getElementById("dmax").textContent = Math.max(d1, d2).toFixed(2);
  document.getElementById("torsional").textContent = (1.3 * dprom).toFixed(3);
}

document.addEventListener("DOMContentLoaded", () => {
  // toggle show / hide
  Array.from(document.getElementsByClassName("collapsible-btn")).forEach((show_btn) => {
    show_btn.addEventListener("click", () => {
      var targetId = show_btn.getAttribute("data-target");
      document.getElementById(targetId)?.classList.toggle("d-none");
    });
  });
  createTableIrregularidad(
    irregularidadRigidezPisoBlandoX,
    irregularidadResistenciaPisoDebilX,
    irregularidadRigidezPisoBlandoXExtrema,
    irregularidadResistenciaPisoDebilXExtrema
  );
  createTableIrregularidad(
    irregularidadRigidezPisoBlandoY,
    irregularidadResistenciaPisoDebilY,
    irregularidadRigidezPisoBlandoYExtrema,
    irregularidadResistenciaPisoDebilYExtrema
  );
  createTable(irregularidadMasaOPeso);
  createTable(irregularidadGeometricaVerticalXY);
  createTable(irregularidadGeometricaVerticalXXYY);
  createTable(DSV1);
  createTable(DSV2);
  createTable(irregularidadPlantaGeometricaVerticalXY);
  createTable(irregularidadPlantaGeometricaVerticalXYXY);
  createTable(IRRPDDA1);
  createTable(IRRPDDD1);
  createTable(IRRPDDA2);
  createTable(IRRPDDD2);
  createTable(sistemasNoParalelosXY);
  createTable(sistemasNoParalelosXYXY);
  createTable(irregularidadTorsionalXX);
  createTable(irregularidadTorsionalYY);
  document.getElementById("deriva").addEventListener("change", calculateTorsional);
  document.getElementById("d1").addEventListener("change", calculateTorsional);
  document.getElementById("d2").addEventListener("change", calculateTorsional);
});

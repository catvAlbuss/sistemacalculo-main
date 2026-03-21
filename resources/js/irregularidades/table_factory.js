import { createTable } from "./table_model.js";

export function createTableIrregularidad(
  tbRigidez,
  tbResitencia,
  tbRigidezE,
  tbResitenciaE
) {
  var show_result = function (tb_irrre, hot_irrri, hot_irrre) {
    return () => {
      document.getElementById(tb_irrre.id)?.classList.remove("d-none");
      hot_irrre.updateData([[]]);
      for (let index = 0; index < hot_irrri.getData().length - 1; index++) {
        hot_irrre.alter("insert_row_below");
      }
      hot_irrre.alter("remove_row");
      hot_irrre.getPlugin("formulas").engine.rebuildAndRecalculate();
    };
  };
  var hot1 = createTable(tbRigidez);
  var hot2 = createTable(tbResitencia);
  var hot1e = createTable(tbRigidezE);
  var hot2e = createTable(tbResitenciaE);
  document.getElementById(tbResitencia.id)?.classList.add("d-none");
  document.getElementById(tbResitenciaE.id)?.classList.add("d-none");
  document
    .getElementById(tbRigidez.id + "Btn")
    .addEventListener("click", show_result(tbResitencia, hot1, hot2));
  document
    .getElementById(tbRigidez.id + "Next")
    .addEventListener("click", function () {
      document.getElementById(tbRigidez.id + "Div").classList.toggle("d-none"); 
      document
        .getElementById(tbRigidez.id + "E" + "Div")
        .classList.toggle("d-none");
      hot1e.updateData([[]]);
      for (let index = 0; index < hot1.getData().length - 1; index++) {
        hot1e.alter("insert_row_below");
      }
      hot1e.alter("remove_row");
      hot1e.getPlugin("formulas").engine.rebuildAndRecalculate();
    });
  document
    .getElementById(tbRigidezE.id + "Next")
    .addEventListener("click", () => {
      document.getElementById(tbRigidez.id + "Div").classList.toggle("d-none");
      document
        .getElementById(tbRigidez.id + "E" + "Div")
        .classList.toggle("d-none");
    });
}

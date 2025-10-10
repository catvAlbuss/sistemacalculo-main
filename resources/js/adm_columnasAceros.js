import { registerFormulas, addData, hf } from "./columnaAcero/formula.js";
import { formas, aceros } from "./columnaAcero/select.js";
import { data } from "./columnaAcero/data.js";
import { formulas } from "./columnaAcero/formulas.js";

import "print-this";

function fillSelects(selects, values) {
  selects.forEach((select) => {
    const selected = select.getAttribute("data-selected") ?? "";
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = option.text = value;
      if (selected === value) {
        option.selected = true;
      }
      select.add(option);
    });
  });
}

$(document).ready(function () {
  fillSelects(document.querySelectorAll("select.formas"), formas);
  fillSelects(document.querySelectorAll("select.aceros"), aceros);
  var tabla = document.getElementById("resultados");
  var innerHTML = tabla.innerHTML;
  document.getElementById("I8").addEventListener("input", calcular);
  document.getElementById("I9").addEventListener("input", calcular);
  document.getElementById("I10").addEventListener("input", calcular);
  document.getElementById("I11").addEventListener("input", calcular);
  document.getElementById("I12").addEventListener("input", calcular);
  document.getElementById("I13").addEventListener("input", calcular);
  document.getElementById("I14").addEventListener("input", calcular);
  document.getElementById("I15").addEventListener("input", calcular);
  document.getElementById("I16").addEventListener("input", calcular);
  document.getElementById("I18").addEventListener("input", calcular);
  document.getElementById("I20").addEventListener("input", calcular);
  document.getElementById("I21").addEventListener("input", calcular);
  document.getElementById("M24").addEventListener("input", calcular);
  document.getElementById("M25").addEventListener("input", calcular);
  document.getElementById("E30").addEventListener("input", calcular);
  document.getElementById("E31").addEventListener("input", calcular);
  document.getElementById("E24").addEventListener("input", calcular);
  document.getElementById("E25").addEventListener("input", calcular);
  document.getElementById("M30").addEventListener("input", calcular);
  document.getElementById("M31").addEventListener("input", calcular);
  document.getElementById("I23").addEventListener("input", calcular);
  //opciones apartes
  document.getElementById("I25").addEventListener("input", calcular);
  //opciones apartes
  document.getElementById("I24").addEventListener("input", calcular);
  document.getElementById("I24").addEventListener("input", calcular);

  calcular();
  function calcular() {
    var I8 = document.getElementById("I8").value;
    var I9 = parseFloat(document.getElementById("I9").value);
    var I10 = parseFloat(document.getElementById("I10").value);
    var I11 = parseFloat(document.getElementById("I11").value);
    var I12 = document.getElementById("I12").value;
    var I13 = document.getElementById("I13").value;
    var I14 = document.getElementById("I14").value;
    var I15 = parseFloat(document.getElementById("I15").value);
    var I16 = parseFloat(document.getElementById("I16").value);
    var I18 = document.getElementById("I18").value;
    var I20 = parseFloat(document.getElementById("I20").value);
    var I21 = parseFloat(document.getElementById("I21").value);
    var M24 = document.getElementById("M24").value;
    var M25 = parseFloat(document.getElementById("M25").value);
    var E30 = document.getElementById("E30").value;
    var E31 = parseFloat(document.getElementById("E31").value);
    var E24 = document.getElementById("E24").value;
    var E25 = parseFloat(document.getElementById("E25").value);
    var M30 = document.getElementById("M30").value;
    var M31 = parseFloat(document.getElementById("M31").value);
    var I23 = document.getElementById("I23").value;
    //otra opcion
    var I25 = document.getElementById("I25").value;
    //otra opcion
    var I24 = parseFloat(document.getElementById("I24").value);
    var suma =
      I8 +
      I9 +
      I10 +
      I11 +
      I12 +
      I13 +
      I14 +
      I15 +
      I16 +
      I18 +
      I20 +
      I21 +
      I25 +
      M24 +
      M25 +
      E30 +
      E31 +
      E24 +
      E25 +
      M30 +
      M31 +
      I23 +
      I24;

    let templae = "";
    templae += `
        <tr class="bg-gray-100 dark:bg-gray-600">
          <td class='py-2 px-8'></td>
          <td class='py-2 px-4'></td>
          <td class='py-2 px-4'></td>
          <td class='py-2 px-4 text-center'>${I8}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
          <td class='py-2 px-8'></td>
          <td class='py-2 px-4'>Pu</td>
          <td class='py-2 px-4'></td>
          <td class='py-2 px-4 text-center'>${I9}Ton</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
          <td class='py-2 px-8'></td>
          <td class='py-2 px-4'>MUX</td>
          <td class='py-2 px-4'></td>
          <td class='py-2 px-4 text-center'>${I10} Ton-m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
          <td class='py-2 px-8'></td>
          <td class='py-2 px-4'>Muy</td>
          <td class='py-2 px-4'></td>
          <td class='py-2 px-4 text-center'>${I11} Ton-m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
          <td class='py-2 px-8'></td>
          <td class='py-2 px-4'>ca</td>
          <td class='py-2 px-4'></td>
          <td class='py-2 px-4 text-center'>${I12}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>dlixx</td>
            <td class='py-2 px-4'>-</>
            <td class='py-2 px-4 text-center'>${I13}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>dliyy</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${I14}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Lx</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${I15} kg/cm2</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Ly</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${I16} m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Ta</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${I18}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Es</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${I20}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>G</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${I21} kg/cm2</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>v1</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${M24}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Lg 1</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${M25} m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>v2</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${E30}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Lg 2</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${E31} m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>v3</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${E24}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Lg 3</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${E25} m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>v4</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${M30}</td>

        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Lg 4</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${M31} m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Col 2</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${I23}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>lx</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${I25}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'>Lg 5</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${I24} m</td>
        </tr>
        
        `;
    var tabla = document.getElementById("resultados");
    tabla.innerHTML = templae;
  }

  Array.from(document.getElementsByClassName("collapsible-btn")).forEach(
    (show_btn) => {
      show_btn.addEventListener("click", () => {
        var targetId = show_btn.getAttribute("data-target");
        document.getElementById(targetId)?.classList.toggle("d-none");
      });
    }
  );

  Object.keys(formulas).forEach((sheetName) => {
    let sheetID = hf.getSheetId(sheetName);
    if (sheetID === undefined) {
      hf.addSheet(sheetName);
    }
  });

  data.forEach((table) => {
    Object.keys(table).forEach((sheetName) => {
      let sheetID = hf.getSheetId(sheetName);
      if (sheetID === undefined) {
        hf.addSheet(sheetName);
      }
    });
  });

  addData();
  registerFormulas("Columna");
  hf.rebuildAndRecalculate();
  for (let index = 0; index < 6; index++) {
    console.log(hf.getSheetName(index));
  }
});

//pdf
$(document).ready(function () {
    document.getElementById('btn_pdf_predim').addEventListener('click', function () {
        // Selecciona el div que quieres imprimir
        $('#columnaAcero_pdf').printThis({
            debug: false,               // Mostrar la ventana de depuración
            importCSS: true,            // Importar estilos CSS
            importStyle: true,          // Importar estilos directamente desde las etiquetas <style>
            loadCSS: "",                // Ruta al CSS adicional si lo necesitas
            pageTitle: "Columnas de Acero",       // Título de la página impresa
            removeInline: false,        // No eliminar los estilos en línea
            printDelay: 333,            // Añadir un pequeño retraso antes de la impresión
            header: null,               // HTML que aparecerá como encabezado en la impresión
            footer: null,               // HTML que aparecerá como pie de página en la impresión
            base: false,                // Usar la URL base para las rutas
            formValues: true,           // Conservar los valores de los formularios
            canvas: true,               // Incluir el contenido de los canvas (gráficos)
            doctypeString: '<!DOCTYPE html>', // Doctype de la impresión
            removeScripts: false,       // No eliminar las etiquetas <script>
            copyTagClasses: false       // No copiar las clases de las etiquetas HTML
        });
    });
});
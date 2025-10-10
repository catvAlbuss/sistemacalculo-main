import "print-this";

$(document).ready(function () {
  var data = [
    ["CM", 0, 0, 0],
    ["CV", 0, 0, 0],
    ["CSX", 0, 0, 0],
    ["CSY", 0, 0, 0],
  ];

  var container = document.getElementById("CargaConServ");
  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: true,
    height: "auto",
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [["Cargas de Servicio", "P (Tonf)", "Mx (Ton-m)", "My (Ton.m)"]],
    collapsibleColumns: [{ row: -1, col: 1, collapsible: false }],
    licenseKey: "non-commercial-and-evaluation",
  });

  // Captura el formulario
  $(document).ready(function () {
    $("#DataZapatageneral").on("submit", function (event) {
      event.preventDefault();
      const dataFromHandsontable = document.querySelector("#dataFromHandsontable");
      const tableData = hot.getData();
      const jsonData = JSON.stringify(tableData);

      dataFromHandsontable.value = jsonData;

      $.ajax({
        url: $(this).attr("action"),
        method: "POST",
        data: $(this).serialize(),
        success: function (response) {
          $("#resultadosZapataGeneral").html(response);
        },
        error: function (xhr, status, error) {
          console.error("Error al enviar la solicitud AJAX", error);
        },
      });
    });
  });

  document.getElementById("btn_pdf_predim").addEventListener("click", function () {
    // Selecciona el div que quieres imprimir
    $("#zapataGeneral_pdf").printThis({
      debug: false, // Mostrar la ventana de depuración
      importCSS: true, // Importar estilos CSS
      importStyle: true, // Importar estilos directamente desde las etiquetas <style>
      loadCSS: "", // Ruta al CSS adicional si lo necesitas
      pageTitle: "Zapata General", // Título de la página impresa
      removeInline: false, // No eliminar los estilos en línea
      printDelay: 333, // Añadir un pequeño retraso antes de la impresión
      header: null, // HTML que aparecerá como encabezado en la impresión
      footer: null, // HTML que aparecerá como pie de página en la impresión
      base: false, // Usar la URL base para las rutas
      formValues: true, // Conservar los valores de los formularios
      canvas: true, // Incluir el contenido de los canvas (gráficos)
      doctypeString: "<!DOCTYPE html>", // Doctype de la impresión
      removeScripts: false, // No eliminar las etiquetas <script>
      copyTagClasses: false, // No copiar las clases de las etiquetas HTML
    });
  });
});

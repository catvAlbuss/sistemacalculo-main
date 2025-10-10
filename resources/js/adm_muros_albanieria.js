import "print-this";

$(document).ready(function () {
  $("#datamurosAlb").submit(function (event) {
    event.preventDefault();
    // var formData = $(this).serialize();
    $.ajax({
      url: $(this).attr("action"),
      method: "POST",
      data: $(this).serialize(),
      success: function (response) {
        console.log(response);
        $("#resultadoMalba").html(response);
      },
    });
  });

  document.getElementById("btn_pdf_predim").addEventListener("click", function () {
    // Selecciona el div que quieres imprimir
    $("#murosalba_pdf").printThis({
      debug: false, // Mostrar la ventana de depuración
      importCSS: true, // Importar estilos CSS
      importStyle: true, // Importar estilos directamente desde las etiquetas <style>
      loadCSS: "", // Ruta al CSS adicional si lo necesitas
      pageTitle: "Muros de albañieria", // Título de la página impresa
      removeInline: false, // No eliminar los estilos en línea
      printDelay: 333, // Añadir un pequeño retraso antes de la impresión
      header: null, // HTML que aparecerá como encabezado en la impresión
      footer: null, // HTML que aparecerá como pie de página en la impresión
      base: false, // Usar la URL base para las rutas
      formValues: true, // Conservar los valores de los formularios
      canvas: true, // Incluir el contenido de los canvas (gráficos)
      loadCSS: "", // Puedes especificar rutas de CSS adicionales si es necesario
      copyTagClasses: false, // No copiar las clases de las etiquetas HTML
      imageTimeout: 15000, // Establecer un timeout para la carga de imágenes
      removeScripts: false, // No eliminar las etiquetas <script>
      doctypeString: "<!DOCTYPE html>", // Doctype de la impresión
      printContainer: true, // Asegurar que el contenedor se imprima con todas las imágenes y gráficos
    });
  });
});

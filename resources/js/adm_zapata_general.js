import html2canvas from "html2canvas";
import "print-this";
import html2canvas from "html2canvas";

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

  // Imagen PNG
  // document.getElementById("btn_pdf_predim").addEventListener("click", function () {
  //   $("#zapataGeneral_pdf").printThis({
  //     importCSS: true,
  //     importStyle: true,
  //     pageTitle: "Zapata General",
  //     formValues: true,
  //     canvas: true,
  //   });
  // });


  document.getElementById("btn_captura_zapata").addEventListener("click", async function () {
    const boton = this;
    const contenedor = document.getElementById("resultadosZapataGeneral");

    if (!contenedor || contenedor.innerHTML.trim() === "") {
      alert("Primero debes generar los resultados.");
      return;
    }

    const textoOriginal = boton.textContent;

    try {
      boton.disabled = true;
      boton.textContent = "Generando...";

      const canvas = await html2canvas(contenedor, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        onclone: (doc) => {
          const el = doc.getElementById("resultadosZapataGeneral");
          if (el) {
            el.style.margin = "0";
            el.style.padding = "0";
            el.style.height = "auto";
            el.style.backgroundColor = "#ffffff";
            el.style.color = "#000000";
          }

          doc.body.style.margin = "0";
          doc.body.style.padding = "0";
          doc.body.style.backgroundColor = "#ffffff";
        },
      });

      // 🔥 AQUÍ HACEMOS LA DIVISIÓN
      const partes = 4;
      const ancho = canvas.width;
      const altoTotal = canvas.height;
      const altoParte = Math.ceil(altoTotal / partes);

      const ahora = new Date();
      const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(

      //   ahora.getDate()
      // ).padStart(2, "0")}_${String(ahora.getHours()).padStart(2, "0")}-${String(
      //   ahora.getMinutes()
      // ).padStart(2, "0")}-${String(ahora.getSeconds()).padStart(2, "0")}`;

        ahora.getDate(),
      ).padStart(2, "0")}_${String(ahora.getHours()).padStart(2, "0")}-${String(ahora.getMinutes()).padStart(
        2,
        "0",
      )}-${String(ahora.getSeconds()).padStart(2, "0")}`;


      for (let i = 0; i < partes; i++) {
        const canvasParte = document.createElement("canvas");
        const ctx = canvasParte.getContext("2d");

        canvasParte.width = ancho;
        canvasParte.height = altoParte;

        ctx.drawImage(
          canvas,
          0, i * altoParte,         // origen en canvas original
          ancho, altoParte,         // tamaño a cortar
          0, 0,                     // destino
          ancho, altoParte
          // 0,
          // i * altoParte, // origen en canvas original
          // ancho,
          // altoParte, // tamaño a cortar
          // 0,
          // 0, // destino
          // ancho,
          // altoParte,
        );

        const dataUrl = canvasParte.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `Diseno_zapata_Parte_${i + 1}.png`;
        // link.download = `Zapata_Parte_${i + 1}_de_4-${fecha}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      console.error("Error al generar la captura:", error);
      alert("Ocurrió un error al generar la imagen.");
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  });

});

import html2canvas from "html2canvas";
import "print-this";

$(document).ready(function () {
  const resultsSelector = "#ObtenerResultados";
  const form = $("#DataZapatageneral");
  const tableContainer = document.getElementById("CargaConServ");
  const tableDataInput = document.getElementById("dataFromHandsontable");
  const printButton = document.getElementById("btn_pdf_predim");
  const captureButton = document.getElementById("btn_captura_zapata");

  if (!form.length || !tableContainer || !tableDataInput) {
    return;
  }

  const hot = new Handsontable(tableContainer, {
    data: [
      ["CM", 0, 0, 0],
      ["CV", 0, 0, 0],
      ["CSX", 0, 0, 0],
      ["CSY", 0, 0, 0],
    ],
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

  form.on("submit", function (event) {
    event.preventDefault();

    tableDataInput.value = JSON.stringify(hot.getData());

    $.ajax({
      url: form.attr("action"),
      method: "POST",
      data: form.serialize(),
      success: function (response) {
        $(resultsSelector).html(response);
      },
      error: function (xhr, status, error) {
        console.error("Error al enviar la solicitud AJAX", error);
        console.error("Status:", status);
        if (xhr?.responseText) {
          console.error(xhr.responseText);
        }

        $(resultsSelector).html(
          '<div class="rounded border border-red-300 bg-red-50 p-4 text-red-700">No se pudo obtener el resultado de zapata general.</div>',
        );
      },
    });
  });

  if (printButton) {
    printButton.addEventListener("click", function () {
      $("#zapataGeneral_pdf").printThis({
        debug: false,
        importCSS: true,
        importStyle: true,
        loadCSS: "",
        pageTitle: "Zapata General",
        removeInline: false,
        printDelay: 333,
        header: null,
        footer: null,
        base: false,
        formValues: true,
        canvas: true,
        doctypeString: "<!DOCTYPE html>",
        removeScripts: false,
        copyTagClasses: false,
      });
    });
  }

  if (captureButton) {
    captureButton.addEventListener("click", async function () {
      const contenedor = document.querySelector(resultsSelector);

      if (!contenedor || contenedor.innerHTML.trim() === "") {
        alert("Primero debes generar los resultados.");
        return;
      }

      const textoOriginal = this.textContent;

      try {
        this.disabled = true;
        this.textContent = "Generando...";

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
            const el = doc.querySelector(resultsSelector);
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

        const partes = 4;
        const ancho = canvas.width;
        const altoTotal = canvas.height;
        const altoParte = Math.ceil(altoTotal / partes);

        for (let i = 0; i < partes; i++) {
          const canvasParte = document.createElement("canvas");
          const ctx = canvasParte.getContext("2d");

          if (!ctx) {
            continue;
          }

          canvasParte.width = ancho;
          canvasParte.height = altoParte;

          ctx.drawImage(canvas, 0, i * altoParte, ancho, altoParte, 0, 0, ancho, altoParte);

          const link = document.createElement("a");
          link.href = canvasParte.toDataURL("image/png");
          link.download = `Diseno_zapata_Parte_${i + 1}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error("Error al generar la captura:", error);
        alert("Ocurrio un error al generar la imagen.");
      } finally {
        this.disabled = false;
        this.textContent = textoOriginal;
      }
    });
  }
});

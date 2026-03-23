import "print-this";
import html2canvas from "html2canvas";
// import { store } from "alpinejs";

$(document).ready(function () {
  const g = 25;
  let fc = document.getElementById("fc");
  let fy = document.getElementById("fy");
  let l1 = document.getElementById("l1"); // Agregar este elemento en el HTML
  let l2 = document.getElementById("l2");

  let acero = document.getElementById("columna");
  let r = document.getElementById("re");
  let esadterr = document.getElementById("esadterr");
  let pdcimt = document.getElementById("pdcimt");
  let yprom = document.getElementById("yprom");
  let sc = document.getElementById("sc");
  let es_muro = document.getElementById("esmuro"); // Agregar este elemento en el HTML

  let CM = document.getElementById("CM"); // Agregar este elemento en el HTML
  let CV = document.getElementById("CV"); // Agregar este elemento en el HTML
  var dom = document.getElementById("main"); // Cambio de 'chart-container' a 'main'
  var myChart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  var app = {};

  var option;

  function calcular() {
    //longitud de desarrollo del acero de columna
    let L1 = parseFloat(l1.value);
    let L2 = parseFloat(l2.value);
    let t = parseFloat(es_muro.value) * 100;
    //----------------------------------------------------------------
    let Ld1 = parseFloat((acero.value * 0.075 * fy.value) / Math.sqrt(fc.value));
    let Ld2 = parseFloat(0.0044 * fy.value * acero.value);
    let H = Math.round(Math.max(Ld1, Ld2) + parseFloat(r.value));

    //calculo de cargas
    const calccua = 1.4 + 1.7;
    const ultCM = 1.4;
    const ultCV = 1.7;
    let cu = parseFloat(CM.value * ultCM + CV.value * ultCV);
    let on =
      Math.round(
        (parseFloat(esadterr.value) * 10 - parseFloat(pdcimt.value) * parseFloat(yprom.value) - parseFloat(sc.value)) *
          100,
      ) / 100;
    let Acim = Math.round((cu / 1000 / on) * 100) / 100;
    let B = Math.round(Acim * 100) / 100;
    let Bplus = B * 100 + 2;
    let H2 = parseFloat(Bplus + 5);

    var data = [
      [0, 0],
      [0.5 * Bplus, 0],
      [0.5 * Bplus, H2],
      [0.5 * t, H2],
      [0.5 * t, L1 + H2],
      [0.5 * t, L1 + H2 + L2],
      [-0.5 * t, L1 + H2 + L2],
      [-0.5 * t, L1 + H2 + L2 - L2],
      [-0.5 * t, L1 + H2 + L2 - L2 - L1],
      [-0.5 * Bplus, L1 + H2 + L2 - L2 - L1],
      [-0.5 * Bplus, 0],
      [0, 0],
    ];
    //varible general para ACEROS 1 Y 2 sobre Columna
    //acero 1
    let corA = -0.5 * t; //x
    let corA2 = H2; //y
    let corB = 0.5 * t; //x
    let corB2 = H2; //y
    //acero 2
    let corC = -0.5 * t; //x
    let corC2 = L1 + H2; //y
    let corD = 0.5 * t; //x
    let corD2 = L1 + H2; //y

    var acero1Coords = [
      [corA + 4, L1 + H2 + L2],
      [corA + 4, corB2],
      [corA + 4, corB2 - H2 + 10],
      [corA + 4 - g, corB2 - H2 + 10],
    ];

    var acero2Coords = [
      [corB - 4, L1 + H2 + L2],
      [corB - 4, corB2],
      [corB - 4, corB2 - H2 + 10],
      [corB - 4 + g, corB2 - H2 + 10],
    ];
    // Obtener el rango de los datos en los ejes x e y
    let xValues = data.map((point) => point[0]);
    let yValues = data.map((point) => point[1]);
    let xMin = Math.min(...xValues);
    let yMin = Math.min(...yValues);
    let xMax = Math.max(...xValues);
    let yMax = Math.max(...yValues);

    // Calcular el ancho y la altura del gráfico
    let xRange = xMax - xMin;
    let yRange = yMax - yMin;

    // Calcular el ancho y la altura máxima que se debe mostrar
    let maxRange = Math.max(xRange, yRange);

    // Calcular el valor medio del rango para centrar los ejes
    let midPoint = (xMax + xMin) / 2;

    var option = {
      xAxis: {
        min: midPoint - maxRange / 1, // Establecer el límite mínimo del eje x
        max: midPoint + maxRange / 1, // Establecer el límite máximo del eje x
        splitNumber: 10, // Establecer la cantidad de divisiones en el eje x
      },
      yAxis: {
        min: yMin, // Establecer el límite mínimo del eje y
        max: yMin + maxRange, // Establecer el límite máximo del eje y
        splitNumber: 10, // Establecer la cantidad de divisiones en el eje y
      },
      series: [
        {
          name: "Acero 1",
          type: "line",
          data: acero1Coords,
          symbolSize: 10,
          lineStyle: {
            color: "red",
          },
        },
        {
          name: "Acero 2",
          type: "line",
          data: acero2Coords,
          symbolSize: 10,
          lineStyle: {
            color: "red",
          },
        },
        {
          name: "cimiento",
          type: "line",
          data: data,
          symbolSize: 10,
          lineStyle: {
            color: "blue",
          },
        },
      ],
    };

    if (option && typeof option === "object") {
      myChart.setOption(option);
    }
  }

  l1.oninput = calcular; // Agregar este evento en el HTML
  l2.oninput = calcular;
  es_muro.oninput = calcular;
  CM.oninput = calcular;
  CV.oninput = calcular;

  // Realizar el cﾃ｡lculo inicial
  calcular();

  window.addEventListener("resize", myChart.resize);

  $("#cimientosControler").on("submit", function (event) {
    event.preventDefault();
    $.ajax({
      url: $(this).attr("action"),
      method: "POST",
      data: $(this).serialize(),
      success: function (response) {
        $("#ObtenerResultadosCimiento").html(response);
      },
      error: function (xhr, status, error) {
        console.error("Error al enviar la solicitud AJAX", error);
      },
    });
  });

  document.getElementById("btn_pdf_predim").addEventListener("click", function () {
    // Selecciona el div que quieres imprimir
    $("#cm_pdf").printThis({
      debug: false, // Mostrar la ventana de depuración
      importCSS: true, // Importar estilos CSS
      importStyle: true, // Importar estilos directamente desde las etiquetas <style>
      loadCSS: "", // Ruta al CSS adicional si lo necesitas
      pageTitle: "Cimiento Corrido", // Título de la página impresa
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

  const capturarTablaSeparado = async () => {
    const btn = document.getElementById("btn_captura_resultado");
    try {
      btn.disabled = true;
      btn.classList.add("opacity-50", "cursor-not-allowed");
      btn.textContent = "Generando...";

      // ============================================
      // PARTE 1: Capturar SOLO el gráfico
      // ============================================
      const chartCanvas = document.querySelector("canvas");
      if (!chartCanvas) {
        throw new Error("No se encontró el canvas del gráfico");
      }

      const chartImage = await html2canvas(chartCanvas, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const ahora = new Date();
      const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(
        ahora.getDate(),
      ).padStart(2, "0")}_${String(ahora.getHours()).padStart(2, "0")}-${String(ahora.getMinutes()).padStart(
        2,
        "0",
      )}-${String(ahora.getSeconds()).padStart(2, "0")}`;

      // DESCARGAR GRÁFICO
      const chartDataUrl = chartImage.toDataURL("image/png");
      const chartLink = document.createElement("a");
      chartLink.href = chartDataUrl;
      chartLink.download = `Grafico_${fecha}.png`;
      document.body.appendChild(chartLink);
      chartLink.click();
      document.body.removeChild(chartLink);

      // ============================================
      // PARTE 2: Capturar resultados (parte superior)
      // ============================================
      const resultadosDiv = document.getElementById("ObtenerResultadosCimiento");
      if (!resultadosDiv) {
        throw new Error("No se encontró el div de resultados");
      }

      // Crear contenedor para resultados
      const contenedorResultados = document.createElement("div");
      contenedorResultados.style.backgroundColor = "#ffffff";
      contenedorResultados.style.padding = "20px";
      contenedorResultados.style.width = "800px";

      const resultadosClone = resultadosDiv.cloneNode(true);
      resultadosClone.style.width = "100%";
      contenedorResultados.appendChild(resultadosClone);

      contenedorResultados.style.position = "absolute";
      contenedorResultados.style.left = "-9999px";
      contenedorResultados.style.top = "-9999px";
      document.body.appendChild(contenedorResultados);

      // Capturar resultados completos
      const resultadosCanvas = await html2canvas(contenedorResultados, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: false,
        useCORS: true,
      });

      document.body.removeChild(contenedorResultados);

      // ============================================
      // Dividir resultados en 2 partes (superior e inferior)
      // ============================================
      const resultadosCompleto = resultadosCanvas.toDataURL("image/png");

      // Crear un canvas temporal para dividir la imagen
      const imgTemp = new Image();
      imgTemp.src = resultadosCompleto;

      await new Promise((resolve) => {
        imgTemp.onload = () => {
          // Calcular la mitad de la altura
          const mitadAltura = Math.floor(imgTemp.height / 2);

          // Canvas para parte superior
          const canvasSuperior = document.createElement("canvas");
          canvasSuperior.width = imgTemp.width;
          canvasSuperior.height = mitadAltura;
          const ctxSuperior = canvasSuperior.getContext("2d");
          ctxSuperior.drawImage(imgTemp, 0, 0, imgTemp.width, mitadAltura, 0, 0, imgTemp.width, mitadAltura);

          // Canvas para parte inferior
          const canvasInferior = document.createElement("canvas");
          canvasInferior.width = imgTemp.width;
          canvasInferior.height = imgTemp.height - mitadAltura;
          const ctxInferior = canvasInferior.getContext("2d");
          ctxInferior.drawImage(
            imgTemp,
            0,
            mitadAltura,
            imgTemp.width,
            imgTemp.height - mitadAltura,
            0,
            0,
            imgTemp.width,
            imgTemp.height - mitadAltura,
          );

          // DESCARGAR PARTE SUPERIOR
          const superiorBase64 = canvasSuperior.toDataURL("image/png");
          const superiorLink = document.createElement("a");
          superiorLink.href = superiorBase64;
          superiorLink.download = `Resultados_Parte_Superior_${fecha}.png`;
          document.body.appendChild(superiorLink);
          superiorLink.click();
          document.body.removeChild(superiorLink);

          // DESCARGAR PARTE INFERIOR
          const inferiorBase64 = canvasInferior.toDataURL("image/png");
          const inferiorLink = document.createElement("a");
          inferiorLink.href = inferiorBase64;
          inferiorLink.download = `Resultados_Parte_Inferior_${fecha}.png`;
          document.body.appendChild(inferiorLink);
          inferiorLink.click();
          document.body.removeChild(inferiorLink);

          console.log("✅ Todas las imágenes descargadas:");
          console.log("   - Gráfico descargado");
          console.log("   - Parte superior descargada");
          console.log("   - Parte inferior descargada");

          resolve();
        };
      });

      alert("✅ Imágenes descargadas exitosamente (3 archivos)");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al generar la imagen: " + error.message);
    } finally {
      btn.disabled = false;
      btn.classList.remove("opacity-50", "cursor-not-allowed");
      btn.textContent = "Generar IMG";
    }
  };

  document.getElementById("btn_captura_resultado").addEventListener("click", capturarTablaSeparado);

  // $("#cimientosControler").submit(function (event) {
  //     event.preventDefault();
  //     var formData = $(this).serialize();
  //     $.ajax({
  //         url: $(this).attr('action'),
  //         method: 'POST',
  //         data: $(this).serialize(),
  //         success: function (response) {
  //             console.log(response);
  //             $("#ObtenerResultadosCimiento").html(response);
  //         }
  //     });
  // });
});

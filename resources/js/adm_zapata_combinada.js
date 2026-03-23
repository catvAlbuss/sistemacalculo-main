var P;
var MX;
var B11;
var G11;
var MY;
var CY;
var LX;
var COL1_O;
var COL2_O;
var O;
var OF;
var PX1
var PX1;
var PX4;
var PX2;
var PX3;
var PX5;
var VC_B32;
var VC_D32;
var VC_H47;
var VC_D58;
var VC_D52;
var PX6;
var PX7;
var PX8;
var VC_J32;
var PX11;
var PX9;
var PX10;
var P_COLF1;
var MX_COLF1;
var MY_COLF1;
var BF;
var LF;
var PF;
var MXF;
var B11;
var G11;
var MYF;
var CYF;
var LXF;
var COL1_OF;
var COL2_OF;
var OF;
var OFF;
var PY1;
var PY2;
var PY3;
var PY4;
var PY5;
var PY6;
var F_J32;
var PY8;
var PY7;
var F_AM47;
var F_AM45;
var PY9;
var F_AM46;
var PY10;
var PY11;
var P_COLF2;
var MX_COLF2;
var MY_COLF2;
var PPX1;
var PPX2;
var PPX3;
var PPX4;
var PPX5;
var PPX6;
var PPX7;
var PPX8;
var PPX9;
var PPX10;
var PPX11;
var PPX12;
var PPX13;
var PPY1;
var PPY2;
var PPY3;
var PPY4;
var PPY5;
var PPY6;
var PPY7;
var PPY8;
var PPY9;
var PPY10;
var PPY11;
var PPY12;
var PPY13;

import html2canvas from "html2canvas";
import "print-this";

$(document).ready(function () {
    //Grafica de predimencionamiento


    // Llama a la función para generar el gráfico

    // Tabla de entrada de datos
    var datacol1 = [
        ["CM", 93.633, 0.07, 0.52],
        ["CV", 30.45, 0.02, 0.24],
        ["CSx", 13.68, 0.42, -3.76],
        ["CSy", 11.46, 3.43, -0.34],
    ];

    var container = document.getElementById("CargaConServ");
    var hot = new Handsontable(container, {
        data: datacol1,
        rowHeaders: true,
        colHeaders: true,
        height: 'auto',
        autoWrapRow: true,
        autoWrapCol: true,
        colWidths: 100,
        nestedHeaders: [["", "Pz (Ton)", "Mx (Ton-m)", "My (Ton-m)"]],
        collapsibleColumns: [
            {
                row: -1,
                col: 1,
                collapsible: false,
            },
        ],
        licenseKey: "non-commercial-and-evaluation",
    });
    var datacol2 = [
        ["CM", 164.05, 0.02, -0.11],
        ["CV", 73.09, 0.01, -0.04],
        ["CSx", 3.26, 0.22, -4.13],
        ["CSy", 2.14, 3.56, -0.38],
    ];

    var containercol2 = document.getElementById("CargaConServcol2");
    var hotcol2 = new Handsontable(containercol2, {
        data: datacol2,
        rowHeaders: true,
        colHeaders: true,
        height: 'auto',
        autoWrapRow: true,
        autoWrapCol: true,
        colWidths: 100,
        nestedHeaders: [["", "Pz (Ton)", "Mx (Ton-m)", "My (Ton-m)"]],
        collapsibleColumns: [
            {
                row: -1,
                col: 1,
                collapsible: false,
            },
        ],
        licenseKey: "non-commercial-and-evaluation",
    });

    $(document).ready(function () {
        $('#DataZapataCombinada').on('submit', function (event) {
            event.preventDefault();
            const dataCargacol1 = document.querySelector("#dataCargacol1");
            const dataCargacol2 = document.querySelector("#dataCargacol2");
            const tableDataCol1 = hot.getData();
            const jsonDataCol1 = JSON.stringify(tableDataCol1);

            dataCargacol1.value = jsonDataCol1;

            const tableDataCol2 = hotcol2.getData();
            const jsonDataCol2 = JSON.stringify(tableDataCol2);

            dataCargacol2.value = jsonDataCol2;

            $.ajax({
                url: $(this).attr('action'),
                method: 'POST',
                data: $(this).serialize(),
                success: function (response) {
                    $('#ObtenerResultadosZComb').html(response);
                    obtenerPuntosCorte("fila1_col1", "fila1_col2");
                    dibujarCortePunzo();
                    vistaPlanta();
                    dibujarZapataIzquierda();
                },
                error: function (xhr, status, error) {
                    console.error('Error al enviar la solicitud AJAX', error);
                }
            });
        });
    });
    
    var selectColumna1 = document.getElementById("selectColumna1");
    var selectColumna2 = document.getElementById("selectColumna2");

    selectColumna1.addEventListener("change", seleccionarOpcion);
    selectColumna2.addEventListener("change", seleccionarOpcion);

    // Función para obtener los valores seleccionados y llamar a otra función
    function seleccionarOpcion() {
        var valorSelect1 =
            selectColumna1.options[selectColumna1.selectedIndex].value;
        var valorSelect2 =
            selectColumna2.options[selectColumna2.selectedIndex].value;

        // Llamar a una función y pasar los valores seleccionados como parámetros
        obtenerPuntosCorte(valorSelect1, valorSelect2);
    }
    
    document.getElementById('btn_pdf_predim').addEventListener('click', function () {
        // Selecciona el div que quieres imprimir
        $('#zapatacomb_pdf').printThis({
            debug: false,               // Mostrar la ventana de depuración
            importCSS: true,            // Importar estilos CSS
            importStyle: true,          // Importar estilos directamente desde las etiquetas <style>
            loadCSS: "",                // Ruta al CSS adicional si lo necesitas
            pageTitle: "Muros Contencion",       // Título de la página impresa
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

const btnCaptura = document.getElementById("btn_captura_zapata_combinada");

const descargarBlob = (blob, nombre) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
};

const dataUrlABlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

const blobAImagen = (blob) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });

const descargarEnPartes = async (blob, nombreBase, partes = 4) => {
  const img = await blobAImagen(blob);

  const ancho = img.width;
  const altoTotal = img.height;
  const altoParte = Math.ceil(altoTotal / partes);
  const margen = 120; // ayuda a no cortar texto justo en la división

  for (let i = 0; i < partes; i++) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const origenY = Math.max(0, i * altoParte - (i === 0 ? 0 : margen));
    const altoReal = Math.min(
      altoParte + (i === 0 ? 0 : margen),
      altoTotal - origenY
    );

    canvas.width = ancho;
    canvas.height = altoReal;

    ctx.drawImage(
      img,
      0, origenY,
      ancho, altoReal,
      0, 0,
      ancho, altoReal
    );

    const parteBlob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    descargarBlob(parteBlob, `Diseno_${nombreBase}_Parte_${i + 1}.png`);
  }
};

if (btnCaptura) {
  btnCaptura.addEventListener("click", async () => {
    const textoOriginal = btnCaptura.textContent;

    try {
      const contenedor = document.getElementById("zapatacomb_pdf");

      if (!contenedor || !contenedor.innerHTML.trim()) {
        alert("Primero debes generar los resultados.");
        return;
      }

      btnCaptura.disabled = true;
      btnCaptura.textContent = "Generando...";

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
          const el = doc.getElementById("zapatacomb_pdf");
          if (el) {
            el.style.margin = "0";
            el.style.padding = "0";
            el.style.height = "auto";
            el.style.minHeight = "auto";
            el.style.overflow = "visible";
            el.style.backgroundColor = "#ffffff";
            el.style.color = "#000000";
          }

          doc.body.style.margin = "0";
          doc.body.style.padding = "0";
          doc.body.style.backgroundColor = "#ffffff";

          // Evitar cortes feos dentro de filas/textos
          doc.querySelectorAll("tr, td, th, p, div").forEach((n) => {
            n.style.breakInside = "avoid";
            n.style.pageBreakInside = "avoid";
          });
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await dataUrlABlob(dataUrl);

      await descargarEnPartes(blob, "zapata_combinada", 4);

    } catch (error) {
      console.error("Error al generar la captura:", error);
      alert("Ocurrió un error al generar la imagen.");
    } finally {
      btnCaptura.disabled = false;
      btnCaptura.textContent = textoOriginal;
    }
  });
}

function dibujarZapataIzquierda() {
    var P_t1_col1 = parseFloat(document.getElementById("t1_col1").value);
    var P_t1_col2 = parseFloat(document.getElementById("t1_col2").value);
    var PLe = parseFloat(document.getElementById("Le").value);
    var PL = PLe - 0.5 * P_t1_col1 - 0.5 * P_t1_col2;
    var P_m2 = parseFloat(document.getElementById("m2").value);
    var P_hz = parseFloat(document.getElementById("hz").value);
    var P_df = parseFloat(document.getElementById("df").value);
    var P_dif = 0.3;
    PPX1 = -0.5 * PL;
    PPX2 = PPX1;
    PPX3 = PPX2 - P_t1_col1;
    PPX4 = PPX3;
    PPX5 = PPX4 + 0;
    PPX6 = PPX1 - P_t1_col1 + PL + P_t1_col1 + P_t1_col2 + P_m2;
    PPX7 = PPX6;
    PPX8 = PPX7 - P_m2;
    PPX9 = PPX8;
    PPX10 = PPX9 - P_t1_col2;
    PPX11 = PPX10;
    PPX12 = PPX2;
    PPX13 = PPX1;

    PPY1 = P_hz;
    PPY2 = P_df + P_dif;
    PPY3 = PPY2;
    PPY4 = 0;
    PPY5 = PPY4;
    PPY6 = PPY5;
    PPY7 = P_hz;
    PPY8 = PPY7;
    PPY9 = PPY2;
    PPY10 = PPY9;
    PPY11 = PPY7;
    PPY12 = PPY11;
    PPY13 = PPY1;

    var data = {
        datasets: [{
            label: 'Mi gráfico de dispersión',
            data: [
                { x: PPX1, y: PPY1 },
                { x: PPX2, y: PPY2 },
                { x: PPX3, y: PPY3 },
                { x: PPX4, y: PPY4 },
                { x: PPX5, y: PPY5 },
                { x: PPX6, y: PPY6 },
                { x: PPX7, y: PPY7 },
                { x: PPX8, y: PPY8 },
                { x: PPX9, y: PPY9 },
                { x: PPX10, y: PPY10 },
                { x: PPX11, y: PPY11 },
                { x: PPX12, y: PPY12 },
                { x: PPX13, y: PPY13 },
            ]
        }]
    };

    // Configurar las opciones
    var options = {
        scales: {
            x: {
                type: "linear",
                position: "bottom",
            },
            y: {
                type: "linear",
                position: "left",
            },
        },
    };
    var ctx = document.getElementById("predimencionamiento").getContext("2d");
    // Crear el gráfico
    var myChart = new Chart(ctx, {
        type: "scatter",
        data: data,
        options: options,
    });
}

function obtenerPuntosCorte(fila_columna1, fila_columna2) {
    // Datos de los puntos (x, y)
    var t1_col1 = document.getElementById("t1_col1").value;
    var Le = document.getElementById("Le").value;
    var m2 = document.getElementById("m2").value;

    var t1_col2 = document.getElementById("t1_col2").value;

    // Convertir los valores a números de punto flotante (float)
    var t1_col1_float = parseFloat(t1_col1);
    var Le_float = parseFloat(Le);
    var m2_float = parseFloat(m2);
    var t1_col2_float = parseFloat(t1_col2);

    // Puntos en X
    var puntoX1 = 0; // Supongamos que calculamos este punto dinámicamente
    var puntoX2 = 0.5 * t1_col1_float;
    var puntoX3 = puntoX2;
    var puntoX4 = 0.5 * t1_col1_float + Le_float;
    var puntoX5 = puntoX4;
    var puntoX6 = puntoX4 + m2_float + 0.5 * t1_col2_float;

    var filaSeleccionada = document.getElementById(fila_columna1);

    // Acceder a las celdas dentro de la fila seleccionada
    var celdasTabla = filaSeleccionada.querySelectorAll("td");

    // Obtener los valores de cada celda
    var P_COL1 = celdasTabla[0].textContent.trim(); // Valor de la primera celda
    var MX_COL1 = celdasTabla[1].textContent.trim(); // Valor de la segunda celda
    var MY_COL1 = celdasTabla[2].textContent.trim(); // Valor de la tercera celda

    P_COL1 = parseFloat(P_COL1);
    MX_COL1 = parseFloat(MX_COL1);
    MY_COL1 = parseFloat(MY_COL1);

    // Obtener la fila seleccionada por su ID
    var filaSeleccionada2 = document.getElementById(fila_columna2);

    // Acceder a las celdas dentro de la fila seleccionada
    var celdasTabla2 = filaSeleccionada2.querySelectorAll("td");

    // Obtener los valores de cada celda
    var P_COL2 = celdasTabla2[0].textContent.trim(); // Valor de la primera celda
    var MX_COL2 = celdasTabla2[1].textContent.trim(); // Valor de la segunda celda
    var MY_COL2 = celdasTabla2[2].textContent.trim(); // Valor de la tercera celda

    P_COL2 = parseFloat(P_COL2);
    MX_COL2 = parseFloat(MX_COL2);
    MY_COL2 = parseFloat(MY_COL2);
    // Obtener el elemento por su ID
    var B = document.getElementById("valor_b").innerHTML;
    var L = document.getElementById("valor_L").innerHTML;
    B = parseFloat(B);
    L = parseFloat(L);
    //CM+CV
    P = P_COL1 + P_COL2;
    MX = MX_COL1 + MX_COL2;

    B11 = 0.5 * L - 0.5 * t1_col1_float;
    G11 = 0.5 * L - (m2_float + 0.5 * t1_col2_float);
    MY = -1 * MY_COL1 - MY_COL2 - P_COL1 * B11 + P_COL2 * G11;

    // Utilizar el valor obtenido
    CY = L / 2;
    LX = (B * L * L * L) / 12;
    COL1_O = P / (B * L) + (MY * CY) / LX;
    COL2_O = P / (B * L) - (MY * CY) / LX;
    O = Math.max(COL1_O, COL2_O);
    OF = O * B;

    var puntoY1 = 0;
    var puntoY2 = parseFloat((0.5 * t1_col1_float * OF).toFixed(2));
    var puntoY3 = parseFloat((puntoY2 - P_COL1).toFixed(2));
    var puntoY5 = parseFloat(
        (-1 * OF * (m2_float + 0.5 * t1_col2_float)).toFixed(2)
    );
    var puntoY4 = parseFloat((puntoY5 + P_COL2).toFixed(2));
    var puntoY6 = 0;

    var data = {
        labels: [puntoX1, puntoX2, puntoX3, puntoX4, puntoX5, puntoX6],
        datasets: [
            {
                label: "VC Corte",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                data: [
                    { x: puntoX1, y: puntoY1 },
                    { x: puntoX2, y: puntoY2 },
                    { x: puntoX3, y: puntoY3 },
                    { x: puntoX4, y: puntoY4 },
                    { x: puntoX5, y: puntoY5 },
                    { x: puntoX6, y: puntoY6 },
                ],
                fill: false, // Deshabilitar el relleno debajo de la línea
            },
        ],
    };

    var options = {
        scales: {
            x: {
                type: "linear",
                position: "bottom",
                min: -1,
                max: 7,
            },
            y: {
                type: "linear",
                position: "left",
                min: -200,
                max: 250,
            },
        },
        elements: {
            line: {
                tension: 0, // Deshabilitar el suavizado de las líneas
            },
        },
    };

    var ctx = document.getElementById("myChart").getContext("2d");
    var lineChart = new Chart(ctx, {
        type: "line", // Tipo de gráfico lineal
        data: data,
        options: options,
    });
    generarGraficoLinealCurvo(puntoY4, puntoY3);
}

function generarGraficoLinealCurvo(puntoY4, puntoY3) {
    var t1_col1F = document.getElementById("t1_col1").value;
    var t1_col1 = document.getElementById("t1_col1").value;
    var Le_F = document.getElementById("Le").value;
    var m2F = document.getElementById("m2").value;

    var t1_col2F = document.getElementById("t1_col2").value;

    // Convertir los valores a números de punto flotante (float)
    var t1_col1F = parseFloat(t1_col1F);
    var Le_F = parseFloat(Le_F);
    var m2F = parseFloat(m2F);
    var t1_col2F = parseFloat(t1_col2F);
    //Puntos X
    PX1 = 0;
    PX4 = 0.5 * t1_col1F;
    PX2 = 0.25 * (PX4 - PX1) + PX1;
    PX3 = 0.25 * (PX4 - PX1) + PX2;
    PX5 = 0.5 * t1_col1F;

    VC_B32 = 0.5 * t1_col1F;
    VC_D32 = Le_F;
    VC_H47 = parseFloat(puntoY4);
    VC_D58 = parseFloat(puntoY3);
    VC_D52 = VC_D32 / (1 + VC_H47 / (-1 * VC_D58));
    PX6 = parseFloat((VC_D52 + VC_B32).toFixed(4));

    PX7 = 0.5 * t1_col1F + VC_D32;
    PX8 = 0.5 * t1_col1F + VC_D32;
    VC_J32 = m2F + 0.5 * t1_col2F;
    PX11 = PX7 + VC_J32;
    PX9 = 0.25 * (PX11 - PX7) + PX7;
    PX10 = 0.5 * (PX11 - PX7) + PX8;

    //

    var filaSelect1 = document.getElementById("selectVFColumna1").value;

    var filaSeleccionadaF = document.getElementById(filaSelect1);
    // Acceder a las celdas dentro de la fila seleccionada
    var celdasTablaF = filaSeleccionadaF.querySelectorAll("td");

    // Obtener los valores de cada celda
    var P_COLF1 = celdasTablaF[0].textContent.trim(); // Valor de la primera celda
    var MX_COLF1 = celdasTablaF[1].textContent.trim(); // Valor de la segunda celda
    var MY_COLF1 = celdasTablaF[2].textContent.trim(); // Valor de la tercera celda

    P_COLF1 = parseFloat(P_COLF1);
    MX_COLF1 = parseFloat(MX_COLF1);
    MY_COLF1 = parseFloat(MY_COLF1);

    var filaSelect2 = document.getElementById("selectVFColumna2").value;

    // Obtener la fila seleccionada por su ID
    var filaSeleccionadaF2 = document.getElementById(filaSelect2);

    // Acceder a las celdas dentro de la fila seleccionada
    var celdasTablaF2 = filaSeleccionadaF2.querySelectorAll("td");

    // Obtener los valores de cada celda
    var P_COLF2 = celdasTablaF2[0].textContent.trim(); // Valor de la primera celda
    var MX_COLF2 = celdasTablaF2[1].textContent.trim(); // Valor de la segunda celda
    var MY_COLF2 = celdasTablaF2[2].textContent.trim(); // Valor de la tercera celda

    P_COLF2 = parseFloat(P_COLF2);
    MX_COLF2 = parseFloat(MX_COLF2);
    MY_COLF2 = parseFloat(MY_COLF2);

    // Obtener el elemento por su ID
    var BF = document.getElementById("valor_b").innerHTML;
    var LF = document.getElementById("valor_L").innerHTML;
    BF = parseFloat(BF);
    LF = parseFloat(LF);
    //CM+CV
    PF = P_COLF1 + P_COLF2;
    MXF = MX_COLF1 + MX_COLF2;

    B11 = 0.5 * LF - 0.5 * t1_col1F;
    G11 = 0.5 * LF - (m2F + 0.5 * t1_col2F);
    MYF = -1 * MY_COLF1 - MY_COLF2 - P_COLF1 * B11 + P_COLF2 * G11;

    // Utilizar el valor obtenido
    CYF = LF / 2;
    LXF = (BF * LF * LF * LF) / 12;
    COL1_OF = PF / (BF * LF) + (MYF * CYF) / LXF;
    COL2_OF = PF / (BF * LF) - (MYF * CYF) / LXF;
    OF = Math.max(COL1_OF, COL2_OF);
    OFF = O * BF;

    //PUNTOS Y
    PY1 = parseFloat((-1 * 0.5 * OFF * PX1 * PX1).toFixed(2));
    PY2 = parseFloat((-1 * 0.5 * OFF * PX2 * PX2).toFixed(2));
    PY3 = parseFloat((-1 * 0.5 * OFF * PX3 * PX3).toFixed(2));
    PY4 = parseFloat((-1 * 0.5 * OFF * PX4 * PX4).toFixed(2));
    PY5 = parseFloat((PY4 - MY_COLF1).toFixed(2));
    PY6 = parseFloat((-1 * (PY5 + (VC_D58 * VC_D52) / 2)).toFixed(2));

    F_J32 = parseFloat((m2F + 0.5 * t1_col2F).toFixed(2));
    PY8 = parseFloat((-1 * OFF * F_J32).toFixed(2));
    PY7 = parseFloat((PY8 - MY_COLF2).toFixed(2));

    F_AM47 = parseFloat((0).toFixed(2));
    F_AM45 = parseFloat((0.25 * (F_AM47 - F_J32) + F_J32).toFixed(2));
    PY9 = parseFloat((-1 * OFF * F_AM45).toFixed(2));
    F_AM46 = parseFloat((0.25 * (F_AM47 - F_J32) + F_AM45).toFixed(2));
    PY10 = parseFloat((-1 * OFF * F_AM46).toFixed(2));
    PY11 = parseFloat((-1 * OFF * F_AM47).toFixed(2));

    // Datos de los puntos
    var data = [
        { x: PX1, y: PY1 },
        { x: PX2, y: PY2 },
        { x: PX3, y: PY3 },
        { x: PX4, y: PY4 },
        { x: PX5, y: PY5 },
        { x: PX6, y: PY6 },
        { x: PX7, y: PY7 },
        { x: PX8, y: PY8 },
        { x: PX9, y: PY9 },
        { x: PX10, y: PY10 },
        { x: PX11, y: PY11 },
    ];

    // Filtrar los puntos para eliminar los duplicados de x
    var uniqueData = data.filter(
        (point, index, self) => index === self.findIndex((p) => p.x === point.x)
    );

    // Obtén el contexto del lienzo
    var ctx = document.getElementById("VC_flexion").getContext("2d");

    // Crea el gráfico de línea
    var curvedLineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: uniqueData.map((point) => point.x), // Usar x como etiquetas
            datasets: [
                {
                    label: "Verificación por flexion",
                    data: uniqueData,
                    tension: 0.4, // Controla la suavidad de la curva
                    fill: false, // No rellenar el área bajo la línea
                    borderColor: "rgba(75, 192, 192, 1)", // Color de la línea
                    borderWidth: 2, // Ancho de la línea
                },
            ],
        },
        options: {
            scales: {
                x: {
                    type: "linear",
                    position: "bottom",
                },
                y: {
                    type: "linear",
                    position: "left",
                },
            },
        },
    });
}

function dibujarCortePunzo() {
    //Datos necesarios
    var CP_t1_col1 = parseFloat(document.getElementById("t1_col1").value);
    var CP_t1_col2 = parseFloat(document.getElementById("t1_col2").value);
    var CP_t2_col1 = parseFloat(document.getElementById("t2_col1").value);
    var CP_t2_col2 = parseFloat(document.getElementById("t2_col2").value);
    var CPLe = parseFloat(document.getElementById("Le").value);
    var CPL = CPLe - 0.5 * CP_t1_col1 - 0.5 * CP_t1_col2;
    var CP_d_col1 = parseFloat(document.getElementById("dvc_col1").value);
    var CP_d_col2 = parseFloat(document.getElementById("dvc_col2").value);
    var CP_m1 = parseFloat(document.getElementById("m1").value);
    var CP_m2 = parseFloat(document.getElementById("m2").value);

    // Puntos X de la columna 1
    var COL1_PX1 = parseFloat((-0.5 * CPL).toFixed(3));
    var COL1_PX2 = parseFloat(COL1_PX1.toFixed(3));
    var COL1_PX3 = parseFloat((COL1_PX2 - CP_t1_col1).toFixed(3));
    var COL1_PX4 = parseFloat(COL1_PX3.toFixed(3));
    var COL1_PX5 = parseFloat(COL1_PX2.toFixed(3));
    var COL1_PX6 = parseFloat(COL1_PX1.toFixed(3));

    // Puntos Y de la columna 1
    var COL1_PY1 = parseFloat((0).toFixed(3));
    var COL1_PY2 = parseFloat((COL1_PY1 + CP_t2_col1 * 0.5).toFixed(3));
    var COL1_PY3 = parseFloat(COL1_PY2.toFixed(3));
    var COL1_PY4 = parseFloat((COL1_PY3 - CP_t2_col1).toFixed(3));
    var COL1_PY5 = parseFloat(COL1_PY4.toFixed(3));
    var COL1_PY6 = parseFloat(COL1_PY1.toFixed(3));

    // Puntos X de la columna 2
    var COL2_PX1 = parseFloat((0.5 * CPL).toFixed(3));
    var COL2_PX2 = parseFloat(COL2_PX1.toFixed(3));
    var COL2_PX3 = parseFloat((COL2_PX2 + CP_t1_col2).toFixed(3));
    var COL2_PX4 = parseFloat(COL2_PX3.toFixed(3));
    var COL2_PX5 = parseFloat(COL2_PX2.toFixed(3));
    var COL2_PX6 = parseFloat(COL2_PX1.toFixed(3));

    // Puntos Y de la columna 2
    var COL2_PY1 = parseFloat((0).toFixed(3));
    var COL2_PY2 = parseFloat((COL2_PY1 + CP_t2_col2 * 0.5).toFixed(3));
    var COL2_PY3 = parseFloat(COL2_PY2.toFixed(3));
    var COL2_PY4 = parseFloat((COL2_PY3 - CP_t2_col2).toFixed(3));
    var COL2_PY5 = parseFloat(COL2_PY4.toFixed(3));
    var COL2_PY6 = parseFloat(COL2_PY1.toFixed(3));

    // Puntos X de la corte columna 1
    var CCOL1_PX1 = COL1_PX4;
    var CCOL1_PX2 = CCOL1_PX1;
    var CCOL1_PX3 = parseFloat((COL1_PX5 + (0.5 * CP_d_col1) / 100).toFixed(3));
    var CCOL1_PX4 = CCOL1_PX3;
    var CCOL1_PX5 = CCOL1_PX2;
    var CCOL1_PX6 = CCOL1_PX1;

    // Puntos Y de la corte columna 1
    var CCOL1_PY1 = COL1_PY4;
    var CCOL1_PY2 = parseFloat((CCOL1_PY1 - (0.5 * CP_d_col1) / 100).toFixed(3));
    var CCOL1_PY3 = CCOL1_PY2;
    var CCOL1_PY4 = parseFloat((COL1_PY2 + (0.5 * CP_d_col1) / 100).toFixed(3));
    var CCOL1_PY5 = CCOL1_PY4;
    var CCOL1_PY6 = CCOL1_PY2;

    // Puntos X de la corte columna 2
    var CCOL2_PX1 = parseFloat((COL2_PX1 - (0.5 * CP_d_col2) / 100).toFixed(3));
    var CCOL2_PX2 = CCOL2_PX1;
    var CCOL2_PX3 = parseFloat((COL2_PX3 + (0.5 * CP_d_col2) / 100).toFixed(3));
    var CCOL2_PX4 = CCOL2_PX3;
    var CCOL2_PX5 = CCOL2_PX1;
    var CCOL2_PX6 = CCOL2_PX1;

    // Puntos Y de la corte columna 2
    var CCOL2_PY1 = COL2_PY1;
    var CCOL2_PY2 = parseFloat((COL2_PY4 - (0.5 * CP_d_col2) / 100).toFixed(3));
    var CCOL2_PY3 = CCOL2_PY2;
    var CCOL2_PY4 = parseFloat((COL2_PY3 + (0.5 * CP_d_col2) / 100).toFixed(3));
    var CCOL2_PY5 = CCOL2_PY4;
    var CCOL2_PY6 = CCOL2_PY1;

    // Puntos X de la Zapata Izquierda
    var Z_PX1 = parseFloat(COL1_PX3.toFixed(3));
    var Z_PX2 = parseFloat(Z_PX1.toFixed(3));
    var Z_PX3 = parseFloat(
        (-0.5 * CPL - CP_t1_col1 + CPL + CP_t1_col1 + CP_t1_col2 + CP_m2).toFixed(3)
    );
    var Z_PX4 = parseFloat(Z_PX3.toFixed(3));
    var Z_PX5 = parseFloat(Z_PX1.toFixed(3));
    var Z_PX6 = parseFloat(Z_PX1.toFixed(3));

    // Puntos Y de la Zapata Izquierda
    var Z_PY1 = 0;
    var Z_PY2 = parseFloat(
        (Z_PY1 - 0.5 * (CP_m1 + CP_t2_col1 + CP_m1)).toFixed(3)
    );
    var Z_PY3 = parseFloat(Z_PY2.toFixed(3));
    var Z_PY4 = parseFloat((Z_PY3 + (CP_m1 + CP_t2_col1 + CP_m1)).toFixed(3));
    var Z_PY5 = parseFloat(Z_PY4.toFixed(3));
    var Z_PY6 = parseFloat(Z_PY1.toFixed(3));

    var data = {
        datasets: [
            {
                label: "Columna 1",
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                data: [
                    { x: COL1_PX1, y: COL1_PY1 },
                    { x: COL1_PX2, y: COL1_PY2 },
                    { x: COL1_PX3, y: COL1_PY3 },
                    { x: COL1_PX4, y: COL1_PY4 },
                    { x: COL1_PX5, y: COL1_PY5 },
                    { x: COL1_PX6, y: COL1_PY6 },
                ],
                type: "scatter",
                showLine: true, // Mostrar líneas conectando los puntos
                fill: false,
                tension: 0, // Esto asegura que las líneas sean rectas
            },
            {
                label: "Columna 2",
                backgroundColor: "rgb(54, 162, 235)",
                borderColor: "rgb(54, 162, 235)",
                data: [
                    { x: COL2_PX1, y: COL2_PY1 },
                    { x: COL2_PX2, y: COL2_PY2 },
                    { x: COL2_PX3, y: COL2_PY3 },
                    { x: COL2_PX4, y: COL2_PY4 },
                    { x: COL2_PX5, y: COL2_PY5 },
                    { x: COL2_PX6, y: COL2_PY6 },
                ],
                type: "scatter",
                showLine: true, // Mostrar líneas conectando los puntos
                fill: false,
                tension: 0, // Esto asegura que las líneas sean rectas
            },
            {
                label: "Corte Columna 1",
                backgroundColor: "rgb(75, 192, 192)",
                borderColor: "rgb(75, 192, 192)",
                data: [
                    { x: CCOL1_PX1, y: CCOL1_PY1 },
                    { x: CCOL1_PX2, y: CCOL1_PY2 },
                    { x: CCOL1_PX3, y: CCOL1_PY3 },
                    { x: CCOL1_PX4, y: CCOL1_PY4 },
                    { x: CCOL1_PX5, y: CCOL1_PY5 },
                    { x: CCOL1_PX6, y: CCOL1_PY6 },
                ],
                type: "scatter",
                showLine: true, // Mostrar líneas conectando los puntos
                fill: false,
                tension: 0, // Esto asegura que las líneas sean rectas
            },
            {
                label: "Corte Columna 2",
                backgroundColor: "rgb(75, 192, 192)",
                borderColor: "rgb(75, 192, 192)",
                data: [
                    { x: CCOL2_PX1, y: CCOL2_PY1 },
                    { x: CCOL2_PX2, y: CCOL2_PY2 },
                    { x: CCOL2_PX3, y: CCOL2_PY3 },
                    { x: CCOL2_PX4, y: CCOL2_PY4 },
                    { x: CCOL2_PX5, y: CCOL2_PY5 },
                    { x: CCOL2_PX6, y: CCOL2_PY6 },
                ],
                type: "scatter",
                showLine: true, // Mostrar líneas conectando los puntos
                fill: false,
                tension: 0, // Esto asegura que las líneas sean rectas
            },
            {
                label: "Zapata",
                backgroundColor: "rgb(75, 192, 192)",
                borderColor: "rgb(75, 192, 192)",
                data: [
                    { x: Z_PX1, y: Z_PY1 },
                    { x: Z_PX2, y: Z_PY2 },
                    { x: Z_PX3, y: Z_PY3 },
                    { x: Z_PX4, y: Z_PY4 },
                    { x: Z_PX5, y: Z_PY5 },
                    { x: Z_PX6, y: Z_PY6 },
                ],
                type: "scatter",
                showLine: true,
                fill: false,
                tension: 0,
            },
        ],
    };

    // Configurar las opciones
    var options = {
        scales: {
            x: {
                type: "linear",
                position: "bottom",
            },
            y: {
                type: "linear",
                position: "left",
            },
        },
    };
    var ctx = document.getElementById("corte_punzonamiento").getContext("2d");
    // Crear el gráfico
    var myChart = new Chart(ctx, {
        type: "scatter",
        data: data,
        options: options,
    });
}
function vistaPlanta() {
    //Datos necesarios
    var VP_t1_col1 = parseFloat(document.getElementById("t1_col1").value);
    var VP_t1_col2 = parseFloat(document.getElementById("t1_col2").value);
    var VP_t2_col1 = parseFloat(document.getElementById("t2_col1").value);
    var VP_t2_col2 = parseFloat(document.getElementById("t2_col2").value);
    var VPLe = parseFloat(document.getElementById("Le").value);
    var VPL = VPLe - 0.5 * VP_t1_col1 - 0.5 * VP_t1_col2;
    var VP_m2 = parseFloat(document.getElementById("m2").value);
    var VP_m1 = parseFloat(document.getElementById("m1").value);

    // Puntos X de la columna 1
    var VP_COL1_PX1 = parseFloat((-0.5 * VPL).toFixed(3));
    var VP_COL1_PX2 = parseFloat(VP_COL1_PX1.toFixed(3));
    var VP_COL1_PX3 = parseFloat((VP_COL1_PX2 - VP_t1_col1).toFixed(3));
    var VP_COL1_PX4 = parseFloat(VP_COL1_PX3.toFixed(3));
    var VP_COL1_PX5 = parseFloat(VP_COL1_PX2.toFixed(3));
    var VP_COL1_PX6 = parseFloat(VP_COL1_PX1.toFixed(3));

    // Puntos Y de la columna 1
    var VP_COL1_PY1 = parseFloat((0).toFixed(3));
    var VP_COL1_PY2 = parseFloat((VP_COL1_PY1 + VP_t2_col1 * 0.5).toFixed(3));
    var VP_COL1_PY3 = parseFloat(VP_COL1_PY2.toFixed(3));
    var VP_COL1_PY4 = parseFloat((VP_COL1_PY3 - VP_t2_col1).toFixed(3));
    var VP_COL1_PY5 = parseFloat(VP_COL1_PY4.toFixed(3));
    var VP_COL1_PY6 = parseFloat(VP_COL1_PY1.toFixed(3));

    // Puntos X de la columna 2
    var VP_COL2_PX1 = parseFloat((0.5 * VPL).toFixed(3));
    var VP_COL2_PX2 = parseFloat(VP_COL2_PX1.toFixed(3));
    var VP_COL2_PX3 = parseFloat((VP_COL2_PX2 + VP_t1_col2).toFixed(3));
    var VP_COL2_PX4 = parseFloat(VP_COL2_PX3.toFixed(3));
    var VP_COL2_PX5 = parseFloat(VP_COL2_PX2.toFixed(3));
    var VP_COL2_PX6 = parseFloat(VP_COL2_PX1.toFixed(3));

    // Puntos Y de la columna 2
    var VP_COL2_PY1 = parseFloat((0).toFixed(3));
    var VP_COL2_PY2 = parseFloat((VP_COL2_PY1 + VP_t2_col2 * 0.5).toFixed(3));
    var VP_COL2_PY3 = parseFloat(VP_COL2_PY2.toFixed(3));
    var VP_COL2_PY4 = parseFloat((VP_COL2_PY3 - VP_t2_col2).toFixed(3));
    var VP_COL2_PY5 = parseFloat(VP_COL2_PY4.toFixed(3));
    var VP_COL2_PY6 = parseFloat(VP_COL2_PY1.toFixed(3));

    // Puntos X de la Zapata Izquierda
    var ZI_PX1 = parseFloat(VP_COL1_PX3.toFixed(3));
    var ZI_PX2 = parseFloat(ZI_PX1.toFixed(3));
    var ZI_PX3 = parseFloat(((-0.5 * VPL) - VP_t1_col1 + VPL + VP_t1_col1 + VP_t1_col2 + VP_m2).toFixed(3));
    var ZI_PX4 = parseFloat(ZI_PX3.toFixed(3));
    var ZI_PX5 = parseFloat(ZI_PX1.toFixed(3));
    var ZI_PX6 = parseFloat(ZI_PX1.toFixed(3));

    // Puntos Y de la Zapata Izquierda
    var ZI_PY1 = 0;
    var ZI_PY2 = parseFloat((ZI_PY1 - 0.5 * (VP_m1 + VP_t2_col1 + VP_m1)).toFixed(3));
    var ZI_PY3 = parseFloat(ZI_PY2.toFixed(3));
    var ZI_PY4 = parseFloat((ZI_PY3 + (VP_m1 + VP_t2_col1 + VP_m1)).toFixed(3));
    var ZI_PY5 = parseFloat(ZI_PY4.toFixed(3));
    var ZI_PY6 = parseFloat(ZI_PY1.toFixed(3));

    var data = {
        datasets: [
            {
                label: "Columna 1",
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                data: [
                    { x: VP_COL1_PX1, y: VP_COL1_PY1 },
                    { x: VP_COL1_PX2, y: VP_COL1_PY2 },
                    { x: VP_COL1_PX3, y: VP_COL1_PY3 },
                    { x: VP_COL1_PX4, y: VP_COL1_PY4 },
                    { x: VP_COL1_PX5, y: VP_COL1_PY5 },
                    { x: VP_COL1_PX6, y: VP_COL1_PY6 },
                ],
                type: "scatter",
                showLine: true,
                fill: false,
                tension: 0,
            },
            {
                label: "Columna 2",
                backgroundColor: "rgb(54, 162, 235)",
                borderColor: "rgb(54, 162, 235)",
                data: [
                    { x: VP_COL2_PX1, y: VP_COL2_PY1 },
                    { x: VP_COL2_PX2, y: VP_COL2_PY2 },
                    { x: VP_COL2_PX3, y: VP_COL2_PY3 },
                    { x: VP_COL2_PX4, y: VP_COL2_PY4 },
                    { x: VP_COL2_PX5, y: VP_COL2_PY5 },
                    { x: VP_COL2_PX6, y: VP_COL2_PY6 },
                ],
                type: "scatter",
                showLine: true,
                fill: false,
                tension: 0,
            },
            {
                label: "Zapata",
                backgroundColor: "rgb(75, 192, 192)",
                borderColor: "rgb(75, 192, 192)",
                data: [
                    { x: ZI_PX1, y: ZI_PY1 },
                    { x: ZI_PX2, y: ZI_PY2 },
                    { x: ZI_PX3, y: ZI_PY3 },
                    { x: ZI_PX4, y: ZI_PY4 },
                    { x: ZI_PX5, y: ZI_PY5 },
                    { x: ZI_PX6, y: ZI_PY6 },
                ],
                type: "scatter",
                showLine: true,
                fill: false,
                tension: 0,
            },
        ],
    };

    var options = {
        scales: {
            x: {
                type: "linear",
                position: "bottom",
            },
            y: {
                type: "linear",
                position: "left",
            },
        },
        plugins: {
            title: {
                display: true,
                text: "Vista Planta",
                font: {
                    size: 18,
                },
            },
        },
    };

    var ctx = document.getElementById("vistaplanta").getContext("2d");
    var myChart = new Chart(ctx, {
        type: "scatter",
        data: data,
        options: options,
    });
}
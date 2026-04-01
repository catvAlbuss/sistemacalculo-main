import html2canvas from "html2canvas";
import "print-this"


$(document).ready(function () {
  /* ----Longitud Arriostrada------ */
  /* ----Dirección X X------ */
  /* datos de las tablas */
  var tablex = [];
  var tabley = [];
  /* --- */
  //var dataLAX = [];
  var h = 3.5;
  var pu = 25489.59;
  var puS = pu;
  var difAbs = 0.0062;
  var difRel = difAbs;
  var vux = 1903.49;
  var q = parseFloat(((puS * difRel) / (vux * h)).toFixed(4));
  var verifArrios = q <= 0.06 ? "Sí hay Arriostramiento" : "No hay Arriostramiento";
  var tipoEs = verifArrios == "Sí hay Arriostramiento" ? "Sin desplazamiento lateral" : "Con desplazamiento lateral";
  //dataLAX.push(['Piso último', h, pu, puS, difAbs, difRel, vux, q, verifArrios, tipoEs]);
  var containerLAX = document.querySelector("#longitudArriostradaX");
  var hot = new Handsontable(containerLAX, {
    data: [["Piso último", "", "", "", "", "", "", "", "", ""]],
    rowHeaders: true,
    colHeaders: true,
    height: "auto",
    autoWrapRow: true,
    autoWrapCol: true,
    nestedHeaders: [
      [
        "Nivel",
        {
          label: "Altura Total",
          colspan: 1,
        },
        {
          label: "Cargas Amplificadas",
          colspan: 1,
        },
        {
          label: "ƩPu",
          colspan: 1,
        },
        {
          label: "Norma E.030 Artículo 31",
          colspan: 2,
          align: "center",
        },
        {
          label: "Vux",
          colspan: 1,
        },
        {
          label: "Índice de Estabilidad",
          colspan: 1,
        },
        {
          label: "Artículo 10.11.3.",
          colspan: 1,
        },
        {
          label: "Artículo 10.11.3.",
          colspan: 1,
        },
      ],
      [
        "",
        '"H" (m)',
        '"Pu" (Ton)',
        "(Ton)",
        {
          label: "Δabsoluto (m)",
          colspan: 1,
          align: "center",
        },
        {
          label: "relativo(m)",
          colspan: 1,
          align: "center",
        },
        "(Ton)",
        '"Q"',
        " Verificación del Arriostramiento",
        "Tipo de Estructura",
      ],
    ],
    columns: [
      {
        type: "text",
        readOnly: true,
      }, // 'Nivel',
      {
        type: "numeric",
      },
      {
        type: "numeric",
      },
      {
        type: "numeric",
        readOnly: true,
      },
      {
        type: "numeric",
      }, // 'hm (m)',
      {
        type: "numeric",
        readOnly: true,
      }, // 'Vua (Ton)',
      {
        type: "numeric",
      },
      {
        type: "numeric",
        readOnly: true,
      },
      {
        type: "text",
        readOnly: true,
      },
      {
        type: "text",
        readOnly: true,
      },
    ],
    minSpareRows: 1,
    afterPaste: function (data, coords) {
      console.log(data); /* array de filas */
      console.log(coords); /* array con coordenadas de inicio y fin (col-row)*/
      data.forEach(function (rowData, i) {
        var startRow = coords[0].startRow;
        /* var endRow = coords[0].endRow; */
        var startCol = coords[0].startCol;
        var endCol = coords[0].endCol;
        let k = 0;
        for (let j = startCol; j <= endCol; j++) {
          //console.log('Fila:', startRow + i);
          //console.log('Columna:', j);
          //console.log('Dato:', rowData[k]);
          //console.log('indice' + k);
          hot.setDataAtCell(startRow + i, j, rowData[k]);
          k++;
        }
      });
    },
    afterChange: function (changes, source) {
      if (source == "edit") {
        var hot = this;
        changes.forEach(function (change) {
          var row = change[0];
          var col = change[1];
          //var oldValue = change[2];
          var newValue = change[3];
          if (col === 1) {
            hot.setDataAtCell(
              row,
              7,
              parseFloat(
                (
                  (hot.getDataAtCell(row, 3) * hot.getDataAtCell(row, 5)) /
                  (hot.getDataAtCell(row, 6) * newValue)
                ).toFixed(4),
              ),
            );
          }
          if (col === 2) {
            if (row === 0) {
              hot.setDataAtCell(row, 3, newValue);
              return;
            }
            //console.log(row, col)
            //console.log(hot.getDataAtCell(row - 1, 3), newValue)
            hot.setDataAtCell(row, 3, newValue + hot.getDataAtCell(row - 1, 3));
          }
          if (col == 3) {
            if (row + 2 < hot.countRows()) {
              hot.setDataAtCell(row + 1, 3, newValue + hot.getDataAtCell(row + 1, 2));
            }
            //hot.setDataAtCell(row + 1, 3, hot.getDataAtCell(row + 1, 2) + newValue)
            hot.setDataAtCell(
              row,
              7,
              parseFloat(
                (
                  (newValue * hot.getDataAtCell(row, 5)) /
                  (hot.getDataAtCell(row, 6) * hot.getDataAtCell(row, 1))
                ).toFixed(4),
              ),
            );
          }
          if (col == 4) {
            if (row + 2 == hot.countRows()) {
              hot.setDataAtCell(row, 5, newValue);
            } else {
              hot.setDataAtCell(row, 5, parseFloat((newValue - hot.getDataAtCell(row + 1, 4)).toFixed(4)));
            }
          }
          if (col == 5) {
            hot.setDataAtCell(
              row,
              7,
              parseFloat(
                (
                  (hot.getDataAtCell(row, 3) * newValue) /
                  (hot.getDataAtCell(row, 6) * hot.getDataAtCell(row, 1))
                ).toFixed(4),
              ),
            );
          }
          if (col == 6) {
            hot.setDataAtCell(
              row,
              7,
              parseFloat(
                (hot.getDataAtCell(row, 3) * hot.getDataAtCell(row, 5)) / (newValue * hot.getDataAtCell(row, 1)),
              ).toFixed(4),
            );
          }
          if (col == 7) {
            hot.setDataAtCell(row, 8, newValue <= 0.06 ? "Si hay Arriostramiento" : "No hay Arriostramiento");
          }
          if (col == 8) {
            hot.setDataAtCell(
              row,
              9,
              newValue == "Si hay Arriostramiento" ? "Sin Desplazamiento Lateral" : "Con Desplazamiento Lateral",
            );
          }
        });
      }
    },
    licenseKey: "non-commercial-and-evaluation",
  });

  document.getElementById("guardarTablaX").addEventListener("click", function (e) {
    tablex = hot.getData();
    alert("Guardado, pase a la tabla dirección Y-Y");
    /* ----Dirección Y Y------ */
    var dataLAY = [];

    for (let i = 0; i < tablex.length - 1; i++) {
      var h = tablex[i][1];
      var pu = tablex[i][2];
      var puS = tablex[i][3];
      var difAbs = 1;
      var difRel = difAbs;
      var vux = 1;
      var q = parseFloat(((puS * difRel) / (vux * h)).toFixed(4));
      var verifArrios = q <= 0.06 ? "Si hay Arriostramiento" : "No hay Arriostramiento";
      var tipoEs =
        verifArrios == "Si hay Arriostramiento" ? "Sin Desplazamiento Lateral" : "Con Desplazamiento Lateral";
      dataLAY.push([`Piso ${tablex.length - 1 - i}`, h, pu, puS, difAbs, difRel, vux, q, verifArrios, tipoEs]);
    }

    var containerLAY = document.querySelector("#longitudArriostradaY");
    var hotLAY = new Handsontable(containerLAY, {
      data: dataLAY,
      rowHeaders: true,
      colHeaders: true,
      height: "auto",
      autoWrapRow: true,
      autoWrapCol: true,
      nestedHeaders: [
        [
          "Nivel",
          {
            label: "Altura Total",
            colspan: 1,
          },
          {
            label: "Cargas Amplificadas",
            colspan: 1,
          },
          {
            label: "ƩPu",
            colspan: 1,
          },
          {
            label: "Norma E.030 Artículo 31",
            colspan: 2,
            align: "center",
          },
          {
            label: "Vux",
            colspan: 1,
          },
          {
            label: "Índice de Estabilidad",
            colspan: 1,
          },
          {
            label: "Artículo 10.11.3.",
            colspan: 1,
          },
          {
            label: "Artículo 10.11.3.",
            colspan: 1,
          },
        ],
        [
          "",
          '"H" (m)',
          '"Pu" (Ton)',
          "(Ton)",
          {
            label: "Δabsoluto (m)",
            colspan: 1,
            align: "center",
          },
          {
            label: "relativo(m)",
            colspan: 1,
            align: "center",
          },
          "(Ton)",
          '"Q"',
          " Verificación del Arriostramiento",
          "Tipo de Estructura",
        ],
      ],
      columns: [
        {
          type: "text",
          readOnly: true,
        }, // 'Nivel',
        {
          type: "numeric",
          readOnly: true,
        },
        {
          type: "numeric",
          readOnly: true,
        },
        {
          type: "numeric",
          readOnly: true,
        },
        {
          type: "numeric",
        }, // 'hm (m)',
        {
          type: "numeric",
          readOnly: true,
        }, // 'Vua (Ton)',
        {
          type: "numeric",
        },
        {
          type: "numeric",
          readOnly: true,
        },
        {
          type: "text",
          readOnly: true,
        },
        {
          type: "text",
          readOnly: true,
        },
      ],
      afterChange: function (changes, source) {
        if (source == "edit") {
          var hot = this;
          changes.forEach(function (change) {
            var row = change[0];
            var col = change[1];
            var newValue = change[3];
            if (col == 4) {
              if (row == hot.countRows() - 2) {
                hot.setDataAtCell(row, 5, newValue);
              } else {
                hot.setDataAtCell(row, 5, newValue - hot.getDataAtCell(row + 1, 4));
              }
            }
            if (col == 5) {
              hot.setDataAtCell(
                row,
                7,
                parseFloat(
                  (
                    (hot.getDataAtCell(row, 3) * newValue) /
                    (hot.getDataAtCell(row, 6) * hot.getDataAtCell(row, 1))
                  ).toFixed(4),
                ),
              );
            }
            if (col == 6) {
              hot.setDataAtCell(
                row,
                7,
                parseFloat(
                  (
                    (hot.getDataAtCell(row, 3) * hot.getDataAtCell(row, 5)) /
                    (newValue * hot.getDataAtCell(row, 1))
                  ).toFixed(4),
                ),
              );
            }
            if (col == 7) {
              hot.setDataAtCell(row, 8, newValue <= 0.06 ? "Si hay Arriostramiento" : "No hay Arriostramiento");
            }
            if (col == 8) {
              hot.setDataAtCell(
                row,
                9,
                newValue == "Sí hay Arriostramiento" ? "Sin desplazamiento lateral" : "Con Desplazamiento Lateral",
              );
            }
          });
        }
      },
      afterPaste: function (data, coords) {
        data.forEach(function (rowData, i) {
          var startRow = coords[0].startRow;
          /* var endRow = coords[0].endRow; */
          var startCol = coords[0].startCol;
          var endCol = coords[0].endCol;
          let k = 0;
          for (let j = startCol; j <= endCol; j++) {
            hotLAY.setDataAtCell(startRow + i, j, rowData[k]);
            k++;
          }
        });
      },
      licenseKey: "non-commercial-and-evaluation",
    });
    document.getElementById("guardarTablaY").addEventListener("click", function (e) {
      tabley = hotLAY.getData();
      alert("Guardado");
    });
  });
  /* ---------------------------------------- */
  var data = [
    ["CL-01", "CM", 0, 0, 0, 0, 0, 0, 0],
    ["", "CV", 0, 0, 0, 0, 0, 0, 0],
    ["", "CSX", 0, 0, 0, 0, 0, 0, 0],
    ["", "CSY", 0, 0, 0, 0, 0, 0, 0],
  ];

  var container = document.querySelector("#Scrga");
  var hot2 = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: true,
    height: "auto",
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [
      [
        {
          label: "Columna",
          rowspan: 2,
        },
        {
          label: "TipoCarga",
          rowspan: 2,
        },
        {
          label: "P (Ton)",
          colspan: 1,
        },
        "V2 (Ton)",
        "V3 (Ton)",
        {
          label: "M2 (Ton.m)",
          colspan: 2,
        },
        {
          label: "M3 (Ton.m)",
          colspan: 2,
        },
      ],
      ["", "", "", "", "", "Top", "Bottom", "Top", "Bottom"],
    ],
    collapsibleColumns: [
      {
        row: -2,
        col: 1,
        collapsible: false,
      },
      {
        row: -1,
        col: 1,
        collapsible: false,
      },
    ],
    licenseKey: "non-commercial-and-evaluation",
  });

  $(document).ready(function () {
    $("#ColumnaF").on("submit", function (event) {
      event.preventDefault();
      const dataFromHandsontable = document.querySelector("#dataFromHandsontable");
      const dataFromHandsontableLAY = document.querySelector("#dataFromHandsontableLAY");
      const dataFromHandsontableLAX = document.querySelector("#dataFromHandsontableLAX");
      const tableData = hot2.getData();
      const tableData2 = tablex;
      const tableData3 = tabley;
      const jsonData = JSON.stringify(tableData);
      const jsonData2 = JSON.stringify(tableData2);
      const jsonData3 = JSON.stringify(tableData3);

      dataFromHandsontable.value = jsonData;
      dataFromHandsontableLAX.value = jsonData2;
      dataFromHandsontableLAY.value = jsonData3;

      $.ajax({
        url: $(this).attr("action"),
        method: "POST",
        data: $(this).serialize(),
        success: function (response) {
          $("#ObtenerResultadosCol").html(response);
        },
        error: function (xhr, status, error) {
          console.error("Error completo:", {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText,
            error: error,
          });

          // Mostrar alerta con el error
          alert("Error del servidor: " + xhr.responseText);
        },
      });
    });
  });
});

var dataFromHandsontable = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

$(document).ready(function () {
  var container = document.getElementById("diagramaxx");
  var ctx = document.getElementById("DIXXs");
  var myChart;

  var hotD = new Handsontable(container, {
    data: dataFromHandsontable,
    rowHeaders: true,
    colHeaders: true,
    height: "auto",
    autoWrapRow: true,
    autoWrapCol: true,
    nestedHeaders: [
      [
        {
          label: 'Diagrama de Interacción (Incluido "Ø") - Dirección X-X',
          colspan: 6,
        },
      ],
      [
        {
          label: "CURVA a 90°",
          colspan: 3,
        },
        {
          label: "CURVA a 270°",
          colspan: 3,
        },
      ],
      ["P (Ton)", "M2 (Ton.m)", "M3 (Ton.m)", "P (Ton)", "M2 (Ton.m)", "M3 (Ton.m)"],
    ],
    collapsibleColumns: [
      {
        row: -3,
        col: 1,
        collapsible: false,
      },
      {
        row: -2,
        col: 1,
        collapsible: false,
      },
      {
        row: -1,
        col: 1,
        collapsible: false,
      },
    ],
    licenseKey: "non-commercial-and-evaluation",
    beforeChange: function (changes, src) {
      if (src !== "loadData") {
        changes.forEach((change) => {
          var row = change[0];
          var column = change[1];
          var value = change[3] === "" ? 0 : parseFloat(change[3]);

          dataFromHandsontable[row][column] = value;
        });

        updateChartData();
      }
    },
  });
  var dataExcluidoX = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];

  var container = document.getElementById("diagramaex");
  var hotDX = new Handsontable(container, {
    data: dataExcluidoX,
    rowHeaders: true,
    colHeaders: true,
    height: "auto",
    autoWrapRow: true,
    autoWrapCol: true,
    nestedHeaders: [
      [
        {
          label: 'Diagrama de Interacción (Excluido "Ø") - Dirección X-X',
          colspan: 6,
        },
      ],
      [
        {
          label: "CURVA a 90°",
          colspan: 3,
        },
        {
          label: "CURVA a 270",
          colspan: 3,
        },
      ],
      ["P", "M2", "M3", "P", "M2", "M3"],
    ],
    collapsibleColumns: [
      {
        row: -3,
        col: 1,
        collapsible: false,
      },
      {
        row: -2,
        col: 1,
        collapsible: false,
      },
      {
        row: -1,
        col: 1,
        collapsible: false,
      },
    ],
    licenseKey: "non-commercial-and-evaluation",
    beforeChange: function (changes, src) {
      if (src !== "loadData") {
        changes.forEach((change) => {
          var row = change[0];
          var column = change[1];
          var value = change[3] === "" ? 0 : parseFloat(change[3]);

          dataExcluidoX[row][column] = value;
        });

        updateChartData();
      }
    },
  });

  function updateChartData() {
    var dataneg = dataFromHandsontable.map(function (row) {
      return {
        x: row[1],
        y: row[0],
        z: row[2],
      };
    });
    var datafi = dataFromHandsontable.map(function (row) {
      return {
        x: row[4],
        y: row[3],
        z: row[5],
      };
    });
    var datanegEX = dataExcluidoX.map(function (row) {
      return {
        x: row[1],
        y: row[0],
        z: row[2],
      };
    });

    var datafiEX = dataExcluidoX.map(function (row) {
      return {
        x: row[4],
        y: row[3],
        z: row[5],
      };
    });

    myChart.data.datasets[0].data = datafi;
    myChart.data.datasets[1].data = dataneg;
    myChart.data.datasets[2].data = datanegEX;
    myChart.data.datasets[3].data = datafiEX;
    // console.log(datafi)
    // console.log(dataneg)
    // console.log(datanegEX)
    // console.log(datafiEX)
    myChart.update();
  }

  var dataneg = dataFromHandsontable.map(function (row) {
    return {
      x: row[1],
      y: row[0],
      z: row[2],
    };
  });
  var datafi = dataFromHandsontable.map(function (row) {
    return {
      x: row[4],
      y: row[3],
      z: row[5],
    };
  });
  var datanegEX = dataExcluidoX.map(function (row) {
    return {
      x: row[1],
      y: row[0],
      z: row[2],
    };
  });

  var datafiEX = dataExcluidoX.map(function (row) {
    return {
      x: row[4],
      y: row[3],
      z: row[5],
    };
  });

  const data = {
    datasets: [
      {
        label: "Diseño",
        data: datafi,
        fill: false,
        borderColor: "red",
        backgroundColor: "red",
        type: "line", // Tipo de gráfico para conectar los puntos con líneas
      },
      {
        label: "Diseño",
        data: dataneg,
        fill: false,
        borderColor: "blue",
        backgroundColor: "blue",
        type: "line", // Tipo de gráfico para conectar los puntos con líneas
      },
      {
        label: "Nominal",
        data: datanegEX,
        fill: false,
        borderColor: "green",
        backgroundColor: "green",
        type: "line", // Tipo de gráfico para conectar los puntos con líneas
      },
      {
        label: "Nominal",
        data: datafiEX,
        fill: false,
        borderColor: "yellow",
        backgroundColor: "yellow",
        type: "line", // Tipo de gráfico para conectar los puntos con líneas
      },
    ],
  };

  const config = {
    type: "scatter",
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Diagrama de Interacción X-X",
        },
      },
      scales: {
        x: {
          min: "auto",
          max: "auto",
          position: "center",
        },
        y: {
          min: "auto",
          max: "auto",
          position: "left",
        },
      },
    },
  };

  myChart = new Chart(ctx, config);
});

var dataFromHandsontableys = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

$(document).ready(function () {
  var container = document.getElementById("diagramayy");
  var ctx = document.getElementById("DIejey");
  var myChart;

  var hotIn = new Handsontable(container, {
    data: dataFromHandsontableys,
    rowHeaders: true,
    colHeaders: true,
    height: "auto",
    autoWrapRow: true,
    autoWrapCol: true,
    nestedHeaders: [
      [
        {
          label: 'Diagrama de Interacción (Incluido "Ø") - Dirección Y-Y',
          colspan: 6,
        },
      ],
      [
        {
          label: "CURVA a 0°",
          colspan: 3,
        },
        {
          label: "CURVA a 180°",
          colspan: 3,
        },
      ],
      ["P (Ton)", "M2 (Ton.m)", "M3 (Ton.m)", "P (Ton)", "M2 (Ton.m)", "M3 (Ton.m)"],
    ],
    collapsibleColumns: [
      {
        row: -3,
        col: 1,
        collapsible: false,
      },
      {
        row: -2,
        col: 1,
        collapsible: false,
      },
      {
        row: -1,
        col: 1,
        collapsible: false,
      },
    ],
    licenseKey: "non-commercial-and-evaluation",
    beforeChange: function (changes, src) {
      if (src !== "loadData") {
        changes.forEach((change) => {
          var row = change[0];
          var column = change[1];
          var value = change[3] === "" ? 0 : parseFloat(change[3]);

          dataFromHandsontableys[row][column] = value;
        });

        updateChartData();
      }
    },
  });
  var dataExcluidoy = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];

  var containerEx = document.getElementById("diagramaexy");
  var hotEx = new Handsontable(containerEx, {
    data: dataExcluidoy,
    rowHeaders: true,
    colHeaders: true,
    height: "auto",
    autoWrapRow: true,
    autoWrapCol: true,
    nestedHeaders: [
      [
        {
          label: 'Diagrama de Interacción (excluido "Ø") - Dirección Y-Y',
          colspan: 6,
        },
      ],
      [
        {
          label: "CURVA a 0°",
          colspan: 3,
        },
        {
          label: "CURVA a 180°",
          colspan: 3,
        },
      ],
      ["P", "M2", "M3", "P", "M2", "M3"],
    ],
    collapsibleColumns: [
      {
        row: -3,
        col: 1,
        collapsible: false,
      },
      {
        row: -2,
        col: 1,
        collapsible: false,
      },
      {
        row: -1,
        col: 1,
        collapsible: false,
      },
    ],
    licenseKey: "non-commercial-and-evaluation",
    beforeChange: function (changes, src) {
      if (src !== "loadData") {
        changes.forEach((change) => {
          var row = change[0];
          var column = change[1];
          var value = change[3] === "" ? 0 : parseFloat(change[3]);

          dataExcluidoy[row][column] = value;
        });

        updateChartData();
      }
    },
  });

  function updateChartData() {
    var datanegy = dataFromHandsontableys.map(function (row) {
      return {
        /* x: row[1], */
        x: row[2],
        y: row[0],
        z: row[2],
      };
    });
    var datafiy = dataFromHandsontableys.map(function (row) {
      return {
        /* x: row[4], */
        x: row[5],
        y: row[3],
        z: row[5],
      };
    });
    var datanegEy = dataExcluidoy.map(function (row) {
      return {
        /* x: row[1], */
        x: row[2],
        y: row[0],
        z: row[2],
      };
    });
    var datafiEy = dataExcluidoy.map(function (row) {
      return {
        /* x: row[4], */
        x: row[5],
        y: row[3],
        z: row[5],
      };
    });

    myChart.data.datasets[0].data = datafiy;
    myChart.data.datasets[1].data = datanegy;
    myChart.data.datasets[2].data = datanegEy;
    myChart.data.datasets[3].data = datafiEy;
    myChart.update();
  }

  var datanegy = dataFromHandsontableys.map(function (row) {
    return {
      /* x: row[1], */
      x: row[2],
      y: row[0],
      //z: row[2]
    };
  });
  var datafiy = dataFromHandsontableys.map(function (row) {
    return {
      /* x: row[4], */
      x: row[5],
      y: row[3],
      //z: row[5]
    };
  });
  var datanegEy = dataExcluidoy.map(function (row) {
    return {
      /* x: row[1], */
      x: row[2],
      y: row[0],
      //z: row[2]
    };
  });

  var datafiEy = dataExcluidoy.map(function (row) {
    return {
      /* x: row[4], */
      x: row[5],
      y: row[3],
      //z: row[5]
    };
  });

  const data = {
    datasets: [
      {
        label: "Diseño",
        data: datafiy,
        fill: false,
        borderColor: "red",
        backgroundColor: "red",
        type: "line", // Tipo de gráfico para conectar los puntos con líneas
      },
      {
        label: "Diseño",
        data: datanegy,
        fill: false,
        borderColor: "blue",
        backgroundColor: "blue",
        type: "line", // Tipo de gráfico para conectar los puntos con líneas
      },
      {
        label: "Nominal",
        data: datanegEy,
        fill: false,
        borderColor: "green",
        backgroundColor: "green",
        type: "line", // Tipo de gráfico para conectar los puntos con líneas
      },
      {
        label: "Nominal",
        data: datafiEy,
        fill: false,
        borderColor: "yellow",
        backgroundColor: "yellow",
        type: "line", // Tipo de gráfico para conectar los puntos con líneas
      },
    ],
  };

  const config = {
    type: "scatter",
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Diagrama de Interacción Y-Y",
        },
      },
      scales: {
        x: {
          min: "auto",
          max: "auto",
          position: "center",
        },
        y: {
          min: "auto",
          max: "auto",
          position: "left",
        },
      },
    },
  };

  myChart = new Chart(ctx, config);
});

//pdf//
$(document).ready(function () {
  document.getElementById("btn_pdf_predim").addEventListener("click", function () {
    // Selecciona el div que quieres imprimir
    $("#columna_pdf").printThis({
      debug: false, // Mostrar la ventana de depuración
      importCSS: true, // Importar estilos CSS
      importStyle: true, // Importar estilos directamente desde las etiquetas <style>
      loadCSS: "", // Ruta al CSS adicional si lo necesitas
      pageTitle: "Diseño Columna", // Título de la página impresa
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

document.addEventListener("DOMContentLoaded", () => {
  const btnCaptura = document.getElementById("btn_captura_columna");

  if (!btnCaptura) return;

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

  const descargarEnPartes = async (blob, nombreBase, partes = 3) => {
    const img = await blobAImagen(blob);

    const ancho = img.width;
    const altoTotal = img.height;
    const altoParte = Math.ceil(altoTotal / partes);
    const margen = 100;

    for (let i = 0; i < partes; i++) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const origenY = Math.max(0, i * altoParte - (i === 0 ? 0 : margen));
      const altoReal = Math.min(altoParte + (i === 0 ? 0 : margen), altoTotal - origenY);

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

      descargarBlob(parteBlob, `${nombreBase}_Parte_${i + 1}.png`);
    }
  };

  btnCaptura.addEventListener("click", async () => {
    const textoOriginal = btnCaptura.textContent;

    try {
      const elemento = document.getElementById("columna_pdf");

      if (!elemento || !elemento.innerHTML.trim()) {
        alert("Primero debes generar los resultados.");
        return;
      }

      btnCaptura.disabled = true;
      btnCaptura.textContent = "Generando...";

      const rect = elemento.getBoundingClientRect();

      const canvas = await html2canvas(elemento, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        onclone: (doc) => {
          const el = doc.getElementById("columna_pdf");
          if (el) {
            el.style.margin = "0";
            el.style.padding = "24px";
            el.style.height = "auto";
            el.style.minHeight = "auto";
            el.style.overflow = "visible";
            el.style.backgroundColor = "#ffffff";
            el.style.color = "#000000";
          }

          // 🔥 OCULTAR BOTONES
          doc.querySelectorAll("button").forEach(btn => {
            btn.style.display = "none";
          });

          doc.body.style.margin = "0";
          doc.body.style.padding = "0";
          doc.body.style.backgroundColor = "#ffffff";
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await dataUrlABlob(dataUrl);

      await descargarEnPartes(blob, "Diseño_Columna", 3);
    } catch (error) {
      console.error("Error al generar la captura:", error);
      alert("Ocurrió un error al generar la imagen.");
    } finally {
      btnCaptura.disabled = false;
      btnCaptura.textContent = textoOriginal;
    }
  });
});
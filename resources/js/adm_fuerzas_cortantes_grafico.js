import { read as readmat } from "mat-for-js";
import { createSpreeadSheetTable } from "./tabulator_base/table_factory.js";
import { makeCreateDeleteColumn } from "./tabulator_base/table.js";
import Plotly from "plotly.js-dist-min";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import logo from "../img/rizabalasociados.png";
import { index } from "mathjs";

function getBase64Image(imgPath, callback) {
  var img = new Image();
  img.crossOrigin = "Anonymous"; // Para evitar problemas con CORS
  img.onload = function () {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    callback(dataURL, img.width, img.height);
  };
  img.src = imgPath;
}

const swalTailwind = Swal.mixin({
  customClass: {
    confirmButton:
      "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
  },
  buttonsStyling: false,
});

document.addEventListener("DOMContentLoaded", () => {
  const pdfButton = document.getElementById("generarPDF");
  pdfButton.disabled = true;
  pdfButton.className = "bg-gray-500 text-white font-bold py-2 px-4 border-b-4 border-gray-700 rounded";
  const propiedadesModel = (id) => {
    return {
      id: id,
      config: {
        layout: "fitDataTable",
        height: 360,
        columns: [
          makeCreateDeleteColumn(id),
          {
            title: "(m)<br>B",
            field: "bi",
            editor: "number",
            formatter: function (cell, formatterParams, onRendered) {
              const value = parseFloat(cell.getValue());
              return isNaN(value) ? "" : value.toFixed(2) + " m";
            },
          },
          {
            title: "(m)<br>T",
            field: "hi",
            editor: "number",
            formatter: function (cell, formatterParams, onRendered) {
              const value = parseFloat(cell.getValue());
              return isNaN(value) ? "" : value.toFixed(2) + " m";
            },
          },
          {
            title: "(m)<br>Lti",
            field: "lti",
            editor: "number",
            formatter: function (cell, formatterParams, onRendered) {
              const value = parseFloat(cell.getValue());
              return isNaN(value) ? "" : value.toFixed(2) + " m";
            },
          },
          {
            title: "(tonf/m<sup>2</sup>)<br>Cm",
            field: "wdi",
            editor: "number",
            formatter: function (cell, formatterParams, onRendered) {
              const value = parseFloat(cell.getValue());
              return isNaN(value) ? "" : value.toFixed(2) + " tonf/m<sup>2</sup>";
            },
          },
          {
            title: "(tonf/m<sup>2</sup>)<br>Cv",
            field: "wvi",
            editor: "number",
            formatter: function (cell, formatterParams, onRendered) {
              const value = parseFloat(cell.getValue());
              return isNaN(value) ? "" : value.toFixed(2) + " tonf/m<sup>2</sup>";
            },
          },
        ],
      },
    };
  };

  const T1Model = {
    id: "#T1",
    mutators: {
      diametro: {
        deps: ["Asd"],
        mutator: function (value, data) {
          const asd = parseFloat(data.Asd);
          if (asd <= 0.71) {
            return '1 Ø 3/8"';
          } else if (asd <= 1.27) {
            return '1 Ø 1/2"';
          } else if (asd <= 2) {
            return '1 Ø 5/8"';
          } else if (asd <= 2.71) {
            return '1 Ø 5/8" + 1 Ø 3/8"';
          } else if (asd <= 3.27) {
            return '1 Ø 5/8" + 1/2"';
          } else if (asd <= 4) {
            return '2 Ø 5/8"';
          } else if (asd <= 4.71) {
            return '2 Ø 5/8" + 1 Ø 3/8"';
          } else if (asd <= 5.27) {
            return '2 Ø 5/8" + 1 Ø 1/2"';
          } else if (asd <= 6) {
            return '3 Ø 5/8"';
          } else if (asd <= 6.54) {
            return '2 Ø 5/8" + 2 Ø 1/2"';
          }
          return "";
        },
      },
    },
    config: {
      layout: "fitDataTable",
      columns: [
        {
          title: "Diseño a Flexión",
          columns: [
            {
              title: "Mu Tn-m",
              field: "Mu",
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value) ? "" : value.toFixed(2) + " Tn-m";
              },
            },
            {
              title: "Asd cm²",
              field: "Asd",
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value)
                  ? `${cell.getValue().r.toFixed(2)}${cell.getValue().i < 0 ? "" : "+"}${cell.getValue().i.toFixed(2)}i`
                  : value.toFixed(2) + " cm²";
              },
            },
            {
              title: "Asmin cm²",
              field: "Asmin",
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value) ? "" : value.toFixed(2) + " cm²";
              },
            },
            {
              title: "Diametro",
              field: "diametro",
            },
          ],
        },
      ],
    },
  };

  const T2Model = {
    id: "#T2",
    config: {
      layout: "fitDataTable",
      columns: [
        {
          title: "Diseño a Cortante",
          columns: [
            {
              title: "Vu Tn",
              field: "Vu",
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value) ? "" : value.toFixed(2) + " Tn";
              },
            },
            {
              title: "Vc Tn",
              field: "Vc",
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value) ? "" : value.toFixed(2) + " Tn";
              },
            },
            {
              title: "Ratio Vu/Vc%",
              field: "Ratio",
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value) ? "" : value.toFixed(2) + " %";
              },
            },
            {
              title: "Longitud de ensanche",
              field: "x",
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value) ? "" : value.toFixed(2) + " m";
              },
            },
            {
              title: "Ancho de ensanche",
              field: "b",
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value) ? "" : value.toFixed(2) + " cm";
              },
            },
          ],
        },
      ],
    },
  };

  const propiedades = createSpreeadSheetTable(propiedadesModel("#propiedades"));

  const octaveVector = (table, name) => {
    return (
      "[" +
      table
        .getData()
        .map((row) => {
          return row[name];
        })
        .join(",") +
      "]"
    );
  };
  let T1;
  let T2;
  document.getElementById("fuerzasCortantesForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const viguetaComponent = (percent, width, b, t, isLast) => {
      return `<div class="text-center text-sm inline-block" style="width: ${percent}%">
        <div>
          <p>Vigueta</p>
          <p>${b.toFixed(2)} m x ${t.toFixed(2)} m</p>
        </div>
        <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}">${width} m</div>
      </div>`;
    };
    const carga = (name, percentX, percentY, width, cm, isLast) => {
      return `<div class="text-center text-sm inline-block" style="width: ${percentX}%">
          <p style="transform: translateY(calc(128px - 128px * ${percentY} / 100))">${name}=${cm.toFixed(2)} tn/m</p>
          <div class="mb-2 h-[128px] relative flex items-center justify-center">
            <div class="absolute bottom-0 border-4 w-full border-indigo-500" style="height: ${percentY}%">
            </div>
          </div>
          <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}">${width} m</div>
        </div>`;
    };
    const asdComponent = (percentX, asd1, d1, asd2, d2, asd3, d3, isLast, L) => {
      const l_div_3 = (L / 3).toFixed(2);
      const l_dot_7 = (0.7 * L).toFixed(2);
      return `<div class="text-center text-xs inline-block" style="width: ${percentX}%">
          <div class="flex justify-between">
            <div class="border-l-4 px-2">L = ${l_div_3}m<br>${parseFloat(asd1).toFixed(2)} cm²<br>${d1}</div>
            <div class="${!isLast ? "" : "border-r-4"} px-2">L = ${l_div_3}m<br>${parseFloat(asd3).toFixed(
        2
      )} cm²<br>${d3}</div>
          </div>
          <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}">${parseFloat(asd2).toFixed(
        2
      )} cm²<br>${d2}<br>L = ${l_dot_7}m</div>
        </div>`;
    };
    const vuComponent = (width, percentX, vu1, x1, vu2, x2, isLast) => {
      return `<div class="text-center text-xs inline-block" style="width: ${percentX}%">
          <div class="flex justify-between">
            <div class="border-l-4 px-2">${parseFloat(vu1).toFixed(2)} Tn<br>${x1.toFixed(2)} m</div>
            <div class="${!isLast ? "" : "border-r-4"} px-2">${parseFloat(vu2).toFixed(2)} Tn<br>${x2.toFixed(
        2
      )} m</div>
          </div>
          <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}">${width} m</div>
        </div>`;
    };

    const total = propiedades
      .getData()
      .map((row) => {
        const value = parseFloat(row.lti);
        return isNaN(value) ? 0 : value;
      })
      .reduce((acc, value) => {
        return acc + value;
      }, 0);
    const topHeigthWdi = Math.max(
      ...propiedades.getData().map((row) => {
        return row.wdi;
      })
    );
    const topHeigthWvi = Math.max(
      ...propiedades.getData().map((row) => {
        return row.wvi;
      })
    );

    const ltis = propiedades.getData();
    const viguetasPercent = propiedades.getData().map((row) => {
      const percent = (parseFloat(row.lti) / total) * 100;
      return percent;
    });
    const minWidth = 10;
    let remainingWidth = 100;
    let remainingSum = total;
    const adjustedWidths = viguetasPercent.reduce((widhts, width, index) => {
      if (width < minWidth) {
        widhts[index] = minWidth;
        remainingWidth -= minWidth;
        remainingSum -= ltis[index].lti;
      }
      return widhts;
    }, {});
    viguetasPercent.forEach((_, index) => {
      adjustedWidths[index] ??= (ltis[index].lti * remainingWidth) / remainingSum;
    });

    document.getElementById("viguetas").innerHTML = propiedades.getData().reduce((html, row, index, data) => {
      /* const percent = (parseFloat(row.lti) / total) * 100; */
      return (
        html +
        viguetaComponent(
          adjustedWidths[index],
          row.lti,
          parseFloat(row.bi),
          parseFloat(row.hi),
          index === data.length - 1
        )
      );
    }, "");
    document.getElementById("cargaMuerta").innerHTML = propiedades.getData().reduce((html, row, index, data) => {
      const percentX = (parseFloat(row.lti) / total) * 100;
      const percentY = (parseFloat(row.wdi) / topHeigthWdi) * 100;
      return (
        html + carga("Cm", adjustedWidths[index], percentY, row.lti, parseFloat(row.wdi), index === data.length - 1)
      );
    }, "");
    document.getElementById("cargaViva").innerHTML = propiedades.getData().reduce((html, row, index, data) => {
      const percentX = (parseFloat(row.lti) / total) * 100;
      const percentY = (parseFloat(row.wvi) / topHeigthWvi) * 100;
      return (
        html + carga("Cv", adjustedWidths[index], percentY, row.lti, parseFloat(row.wvi), index === data.length - 1)
      );
    }, "");

    const formData = new FormData(event.target);
    formData.append("b", octaveVector(propiedades, "bi"));
    formData.append("h", octaveVector(propiedades, "hi"));
    formData.append("Lt", octaveVector(propiedades, "lti"));
    formData.append("WD", octaveVector(propiedades, "wdi"));
    formData.append("WV", octaveVector(propiedades, "wvi"));

    const waitingPopup = swalTailwind.fire({
      title: "Calculando!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    console.log(Object.fromEntries(formData));
    fetch("/fuerzasCortantes", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/octet-stream")) {
          return response.arrayBuffer();
        } else {
          const error = await response.text();
          return Promise.reject(error);
        }
      })
      .then((matData) => {
        waitingPopup.close();
        const aligerados = readmat(matData);
        console.log(aligerados);
        // Loop through each vector in the SHEAR array
        const tracesFC = aligerados.data.SHEART.map((sheari) => ({
          x: aligerados.data.L4,
          y: sheari,
          mode: "lines",
          line: { width: 2 },
        }));

        // Add the axexx vector as another trace
        tracesFC.push({
          x: aligerados.data.L4,
          y: aligerados.data.axexx,
          mode: "lines",
          line: { width: 2 },
        });

        const layoutFC = {
          showlegend: false,
          title: { text: "Diagrama de Fuerzas cortantes (Tn)" },
          xaxis: {
            title: { text: "Longitud (m)" },
          },
          yaxis: {
            title: { text: "Fuerzas cortantes (Tn)" },
          },
        };
        Plotly.newPlot("fuerzasCortantes", tracesFC, layoutFC);

        // Loop through each vector in the SHEAR array
        const tracesMF = aligerados.data.x1n
          .map((x1, index) => ({
            x: x1,
            y: aligerados.data.y1n[index],
            mode: "lines",
            line: { width: 2 },
          }))
          .concat(
            aligerados.data.x2n.map((x2, index) => ({
              x: x2,
              y: aligerados.data.y2n[index],
              mode: "lines",
              line: { width: 2 },
            }))
          );

        // Add the axexx vector as another trace
        tracesMF.push({
          x: aligerados.data.L5,
          y: aligerados.data.L5.map((_) => 0),
          mode: "lines",
          line: { width: 2 },
        });

        const layout = {
          showlegend: false,
          title: { text: "Diagrama de Momentos Flectores (Tn-m)" },
          xaxis: {
            title: { text: "Longitud (m)" },
          },
          yaxis: {
            title: { text: "Momentos flectores (Tn)" },
          },
        };
        Plotly.newPlot("momentosFlectores", tracesMF, layout);
        T1 = createSpreeadSheetTable(T1Model);
        T2 = createSpreeadSheetTable(T2Model);
        setTimeout(() => {
          T1.addData(
            Object.keys(aligerados.data.T1).reduce((acc, key) => {
              aligerados.data.T1[key].forEach((value, index) => {
                acc[index] ??= {};
                acc[index][key] = value;
              });
              return acc;
            }, [])
          );
          T2.addData(
            Object.keys(aligerados.data.T2).reduce((acc, key) => {
              aligerados.data.T2[key].forEach((value, index) => {
                acc[index] ??= {};
                acc[index][key] = value;
              });
              return acc;
            }, [])
          );
          const asdValues = T1.getData();
          document.getElementById("asd").innerHTML = propiedades.getData().reduce((html, row, index, data) => {
            const percentX = (parseFloat(row.lti) / total) * 100;
            return (
              html +
              asdComponent(
                adjustedWidths[index],
                asdValues[index * 3].Asd,
                asdValues[index * 3].diametro,
                asdValues[index * 3 + 1].Asd,
                asdValues[index * 3 + 1].diametro,
                asdValues[index * 3 + 2].Asd,
                asdValues[index * 3 + 2].diametro,
                index === data.length - 1,
                data[index].lti
              )
            );
          }, "");

          const vuValues = T2.getData();
          let dVu, x;
          T2.getData().forEach((row, index, data) => {
            if (index % 2 === 0) {
              dVu = -data[index + 1].Vu - data[index].Vu;
            }
            if (dVu !== 0) {
              const L = propiedades.getData()[Math.floor(index / 2)].lti;
              x = ((row.Vc - row.Vu) * L) / dVu;
            } else {
              x = 0;
            }
            T2.getRow(index + 1).update({ x: row.Ratio < 100 ? 0 : x });
          });
          T2.getData().forEach((row, index, data) => {
            const fc = parseFloat(document.getElementById("fc").value);
            const b =
              (row.Vu * 1000) /
              (0.85 * 0.53 * Math.sqrt(fc) * parseFloat(propiedades.getData()[Math.floor(index / 2)].hi) * 100);
            T2.getRow(index + 1).update({ b: row.Ratio < 100 ? 0 : b });
          });
          document.getElementById("vu").innerHTML = propiedades.getData().reduce((html, row, index, data) => {
            const percentX = (parseFloat(row.lti) / total) * 100;
            const x1 = T2.getData()[2 * index].x;
            const x2 = T2.getData()[2 * index + 1].x;
            return (
              html +
              vuComponent(
                row.lti,
                adjustedWidths[index],
                vuValues[index * 2].Vu,
                x1,
                vuValues[index * 2 + 1].Vu,
                x2,
                index === data.length - 1
              )
            );
          }, "");
        }, 500);
        pdfButton.disabled = false;
        pdfButton.className =
          "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded";
      })
      .catch((error) => {
        console.log(error);
        waitingPopup.hideLoading();
        swalTailwind.fire({
          icon: "error",
          html: `
              ${error}
            `,
          showConfirmButton: true,
        });

        document.getElementById("viguetas").innerHTML = "";
        document.getElementById("cargaMuerta").innerHTML = "";
        document.getElementById("cargaViva").innerHTML = "";
        document.getElementById("asd").innerHTML = "";
        document.getElementById("vu").innerHTML = "";
        Tabulator.findTable(T1Model.id)[0]?.clearData();
        Tabulator.findTable(T2Model.id)[0]?.clearData();
        Plotly.purge("momentosFlectores");
        Plotly.purge("fuerzasCortantes");
        pdfButton.disabled = true;
        pdfButton.className = "bg-gray-500 text-white font-bold py-2 px-4 border-b-4 border-gray-700 rounded";
      });
  });
  document.getElementById("generarPDF").addEventListener("click", async () => {
    const waitingPopup = swalTailwind.fire({
      title: "Generando!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const form = document.getElementById("fuerzasCortantesForm");
      const viguetasElement = document.querySelector("#viguetas");
      const cargaMuertaElement = document.querySelector("#cargaMuerta");
      const cargaVivaElement = document.querySelector("#cargaViva");
      const asdElement = document.querySelector("#asd");
      const vuElement = document.querySelector("#vu");
      const viguetas = await html2canvas(viguetasElement, {
        onclone: (doc) => {
          const viguetasElement = doc.querySelector("#viguetas");
          Array.from(viguetasElement.querySelectorAll("div > div + div")).forEach((node) => {
            node.classList.add("mt-2");
          });
          viguetasElement.style.color = "black";
        },
      });
      const cargaMuerta = await html2canvas(cargaMuertaElement, {
        onclone: (doc) => {
          const cargaMuertaElement = doc.querySelector("#cargaMuerta");
          Array.from(cargaMuertaElement.querySelectorAll("div > p + div")).forEach((node) => {
            node.classList.add("mt-2");
          });
          cargaMuertaElement.style.color = "black";
        },
      });
      const cargaViva = await html2canvas(cargaVivaElement, {
        onclone: (doc) => {
          const cargaVivaElement = doc.querySelector("#cargaViva");
          Array.from(cargaVivaElement.querySelectorAll("div > p + div")).forEach((node) => {
            node.classList.add("mt-2");
          });
          cargaVivaElement.style.color = "black";
        },
      });
      const asd = await html2canvas(asdElement, {
        onclone: (doc) => {
          const asdElement = doc.querySelector("#asd");
          Array.from(asdElement.querySelectorAll("div > div > div")).forEach((node) => {
            node.style.paddingBottom = "8px";
          });
          asdElement.style.color = "black";
        },
      });
      const vu = await html2canvas(vuElement, {
        onclone: (doc) => {
          const vuElement = doc.querySelector("#vu");
          Array.from(vuElement.querySelectorAll("div > div > div")).forEach((node) => {
            node.style.paddingBottom = "8px";
          });
          vuElement.style.color = "black";
        },
      });
      const T1Data = T1.getData();
      const T1Rows = [];
      for (const row of T1Data) {
        const r = [
          { text: row.Mu.toFixed(2) + " Tn-m", alignment: "center" },
          { text: row.Asd.toFixed(2) + " cm²", alignment: "center" },
          { text: row.Asmin.toFixed(2) + " cm²", alignment: "center" },
          { text: row.diametro, alignment: "center" },
        ];
        T1Rows.push(r);
      }
      const T2Data = T2.getData();
      const T2Rows = [];
      for (const row of T2Data) {
        const r = [
          { text: row.Vu.toFixed(2) + " Tn", alignment: "center" },
          { text: row.Vc.toFixed(2) + " Tn", alignment: "center" },
          { text: row.Ratio.toFixed(2) + " %", alignment: "center" },
          { text: row.x.toFixed(2) + " m", alignment: "center" },
          { text: row.b.toFixed(2) + " cm", alignment: "center" },
        ];
        T2Rows.push(r);
      }
      getBase64Image(logo, async (logob64, width, height) => {
        const docDefinition = {
          background: function (currentPage, pageSize) {
            const scale_factor = pageSize.width / width;
            const scaled_height = height * scale_factor;
            return {
              image: logob64, // Aquí va tu imagen en base64
              width: width * scale_factor, // Ajustar el ancho al tamaño de la página
              height: scaled_height, // Ajustar el alto al tamaño de la página
              opacity: 0.1, // Ajustar la transparencia para simular marca de agua
              absolutePosition: { x: 0, y: pageSize.height * 0.5 - scaled_height * 0.5 }, // Colocar en la posición inicial
            };
          },
          header: {
            columns: [
              { image: logob64, width: 210, height: 50, margin: [10, -10, 0, 0] },
              {
                stack: [
                  { text: "Correo: rizabalasociados.estructurales@gmail.com", margin: [0, 0, 0, 5] },
                  { text: "Telefono: 953992277", margin: [0, 0, 0, 5] },
                  { text: "Direccion: jr. bolivar", margin: [0, 0, 0, 5] },
                  { text: "Fecha: 16/08/2024", margin: [0, 0, 0, 5] },
                ],
                alignment: "right",
                fontSize: 10,
                margin: [10, 10, 30, 20],
              },
            ],
          },
          footer: function (currentPage, pageCount) {
            return {
              text: "Página " + currentPage.toString() + " de " + pageCount,
              alignment: "center",
              fontSize: 10,
              margin: [0, 0, 0, 10],
            };
          },
          content: [
            { text: "DISEÑO DE VIGUETAS DE CONCRETO ARMADO", style: "header", alignment: "left", fontSize: 12 },
            {
              style: "tableExample",
              table: {
                headerRows: 2,
                widths: ["*", "*", "*", "*"],
                body: [
                  [{ text: "1.- Datos Generales", style: "tableHeader", colSpan: 4, alignment: "left" }, {}, {}, {}],
                  [
                    { text: "Nombre", style: "tableHeader", alignment: "center" },
                    { text: "Simbolo", style: "tableHeader", alignment: "center" },
                    { text: "Valor", style: "tableHeader", colSpan: 2, alignment: "center" },
                    {},
                  ],
                  [
                    "Resistencia a compresion del concreto",
                    { text: "f'c", alignment: "center" },
                    { text: form.fc.value, alignment: "right" },
                    { text: "Kg/cm2" },
                  ],
                  [
                    "Esfuerzo de fluencia del acero",
                    { text: "fy", alignment: "center" },
                    { text: form.Fy.value, alignment: "right" },
                    { text: "Kg/cm2" },
                  ],
                  [
                    "Factor de amplificación",
                    { text: "ØRM", alignment: "center" },
                    { text: form.frm.value, alignment: "right" },
                    { text: "Kg/cm2" },
                  ],
                  [
                    "Factor de amplificación",
                    { text: "ØRV", alignment: "center" },
                    { text: form.frv.value, alignment: "right" },
                    { text: "Kg/cm2" },
                  ],
                  [
                    "Ancho Tributario",
                    { text: "-", alignment: "center" },
                    { text: form.anchoTributario.value, alignment: "right" },
                    { text: "m" },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            { text: "2.- Modelo matematico", style: "header" },
            {
              text: "El modelo matemático usado será una viga simplemente apoyada y una viga empotrada en sus extremos, para calcular las máximas solicitaciones en todos los apoyos.",
              fontSize: 8,
              margin: [50, 0, 50, 10],
            },
            {
              image: viguetas.toDataURL("image/png"),
              width: 420,
              margin: [50, 0, 50, 10],
            },
            { text: "3.- Metrado de cargas", style: "header" },
            { text: "3.1.- Carga Muerta", fontSize: 8, margin: [60, 0, 50, 10] },
            {
              image: cargaMuerta.toDataURL("image/png"),
              width: 420,
              margin: [50, 0, 50, 10],
            },
            { text: "3.2.- Carga Viva", fontSize: 8, margin: [60, 0, 50, 10] },
            {
              image: cargaViva.toDataURL("image/png"),
              width: 420,
              margin: [50, 0, 50, 10],
            },
            { text: "4.- Analisis Estructural", style: "header", pageBreak: "before" },
            { text: "4.1.- Diagrama de fuerzas cortantes", fontSize: 8, margin: [60, 0, 50, 0] },
            {
              image: await Plotly.toImage("fuerzasCortantes"),
              width: 420,
              margin: [50, 0, 50, 0],
            },
            { text: "4.2.- Diagrama de momentos flectores", fontSize: 8, margin: [60, 0, 50, 10] },
            {
              image: await Plotly.toImage("momentosFlectores"),
              width: 420,
              margin: [50, 0, 50, 0],
            },
            { text: "5.- DISEÑO EN CONCRETO ARMADO", fontSize: 8, style: "header", pageBreak: "before" },
            {
              style: "tableExample",
              table: {
                headerRows: 2,
                widths: ["*", "*", "*", "*"],
                body: [
                  [{ text: "5.1.- Diseño a Flexion", style: "tableHeader", colSpan: 4, alignment: "left" }, {}, {}, {}],
                  [
                    { text: "Mu Tn-m", style: "tableHeader", alignment: "center" },
                    { text: "Asd cm²", style: "tableHeader", alignment: "center" },
                    { text: "Asmin cm²", style: "tableHeader", alignment: "center" },
                    { text: "Diametro", style: "tableHeader", alignment: "center" },
                  ],
                  ...T1Rows,
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              image: asd.toDataURL("image/png"),
              width: 420,
              margin: [50, 0, 50, 0],
            },
            {
              style: "tableExample",
              table: {
                headerRows: 2,
                widths: ["*", "*", "*", "*", "*"],
                body: [
                  [
                    { text: "5.2.- Diseño a Cortante", style: "tableHeader", colSpan: 5, alignment: "left" },
                    {},
                    {},
                    {},
                    {},
                  ],
                  [
                    { text: "Vu Tn", style: "tableHeader", alignment: "center" },
                    { text: "Vc Tn", style: "tableHeader", alignment: "center" },
                    { text: "Ratio Vu/Vc%", style: "tableHeader", alignment: "center" },
                    { text: "Longitud de ensanche", style: "tableHeader", alignment: "center" },
                    { text: "Ancho de ensanche", style: "tableHeader", alignment: "center" },
                  ],
                  ...T2Rows,
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              image: vu.toDataURL("image/png"),
              width: 420,
              margin: [50, 0, 50, 0],
            },
          ],
          styles: {
            header: {
              fontSize: 8,
              bold: true,
              margin: [50, 0, 50, 10],
            },
            subheader: {
              fontSize: 8,
              bold: true,
              margin: [50, 10, 50, 5],
            },
            tableExample: {
              fontSize: 8,
              margin: [50, 5, 50, 15],
            },
            tableHeader: {
              bold: true,
              fontSize: 8,
              color: "black",
            },
          },
        };
        pdfMake.createPdf(docDefinition).download("aligerados.pdf");
      });
      waitingPopup.close();
    } catch (error) {
      waitingPopup.close();
    }
  });
});

import { read as readmat } from "mat-for-js";
import { bold_formatter } from "./tabulator_base/formatters.js";
import { createSpreeadSheetTable } from "./tabulator_base/table_factory.js";
import { makeCreateDeleteColumn } from "./tabulator_base/table.js";
import Plotly from "plotly.js-dist-min";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
  const pdfButton = document.getElementById("generarPDF");
  pdfButton.disabled = true;
  pdfButton.className = "bg-gray-500 text-white font-bold py-2 px-4 border-b-4 border-gray-700 rounded";
  const cargasModel = (id) => {
    return {
      data: [
        { nombres: "P", sismica: 0, muerta: 2909, viva: 0 },
        { nombres: "MX", sismica: 1700, muerta: 3529, viva: 0 },
        { nombres: "MY", sismica: 1320, muerta: 1441, viva: 0 },
      ],
      id: id,
      config: {
        layout: "fitDataTable",
        height: 120,
        columns: [
          {
            title: "Nombres",
            field: "nombres",
            headerSort: false,
            resizable: false,
            ...bold_formatter(1, 2, 3),
          },
          {
            title: "Sísmica",
            field: "sismica",
            editor: "number",
            validator: "numeric",
          },
          {
            title: "Muerta",
            field: "muerta",
            editor: "number",
            validator: "numeric",
          },
          {
            title: "Viva",
            field: "viva",
            editor: "number",
            validator: "numeric",
          },
        ],
      },
    };
  };

  const propiedadesModel = (id) => {
    return {
      data: [
        { nombres: "A", entradas: 343.5 },
        { nombres: "Ixx", entradas: 9193 },
        { nombres: "Iyy", entradas: 35202 },
        { nombres: "Df", entradas: 2 },
      ],
      id: id,
      config: {
        layout: "fitDataTable",
        height: 150,
        columns: [
          {
            title: "Nombres",
            field: "nombres",
            headerSort: false,
            resizable: false,
            ...bold_formatter(1, 2, 3, 4),
          },
          {
            title: "Entradas",
            field: "entradas",
            editor: "number",
            headerSort: false,
            resizable: false,
          },
        ],
      },
    };
  };

  const poligonoModel = (id, title, data = []) => {
    return {
      data: data,
      id: id,
      config: {
        layout: "fitDataTable",
        height: 200,
        columns: [
          {
            title: title,
            columns: [
              makeCreateDeleteColumn(id),
              {
                title: "X",
                field: "xv",
                editor: "number",
              },
              {
                title: "Y",
                field: "yv",
                editor: "number",
              },
            ],
          },
        ],
      },
    };
  };

  const cargas = createSpreeadSheetTable(cargasModel("#cargas"));
  const propiedades = createSpreeadSheetTable(propiedadesModel("#propiedades"));
  const poligonoExterior = createSpreeadSheetTable(poligonoModel("#poligonoExterior", "Poligono Exterior"));
  const poligonoInterior1 = createSpreeadSheetTable(poligonoModel("#poligonoInterior1", "Poligono Interior 1"));
  const poligonoInterior2 = createSpreeadSheetTable(poligonoModel("#poligonoInterior2", "Poligono Interior 2"));
  const poligonoInterior3 = createSpreeadSheetTable(poligonoModel("#poligonoInterior3", "Poligono Interior 3"));
  const poligonoInterior4 = createSpreeadSheetTable(poligonoModel("#poligonoInterior4", "Poligono Interior 4"));
  const poligonoInterior5 = createSpreeadSheetTable(poligonoModel("#poligonoInterior5", "Poligono Interior 5"));

  const octaveVector = (table, name) => {
    const data = table.getData();
    if (data.length === 0) {
      return "1:0";
    } else {
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
    }
  };

  document.getElementById("zapatasForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    propiedades.getData().forEach((row) => {
      formData.append(row.nombres, row.entradas);
    });

    cargas.getData().forEach((row) => {
      formData.append(row.nombres + "S", row.sismica);
      formData.append(row.nombres + "m", row.muerta);
      formData.append(row.nombres + "v", row.viva);
    });
    formData.append(
      "poligonos",
      `struct('poligonoExterior', [${octaveVector(poligonoExterior, "xv")}; ${octaveVector(
        poligonoExterior,
        "yv"
      )}], 'poligonoInterior1', [${octaveVector(poligonoInterior1, "xv")}; ${octaveVector(
        poligonoInterior1,
        "yv"
      )}], 'poligonoInterior2', [${octaveVector(poligonoInterior2, "xv")}; ${octaveVector(
        poligonoInterior2,
        "yv"
      )}], 'poligonoInterior3', [${octaveVector(poligonoInterior3, "xv")}; ${octaveVector(
        poligonoInterior3,
        "yv"
      )}], 'poligonoInterior4', [${octaveVector(poligonoInterior4, "xv")}; ${octaveVector(
        poligonoInterior4,
        "yv"
      )}], 'poligonoInterior5', [${octaveVector(poligonoInterior5, "xv")}; ${octaveVector(poligonoInterior5, "yv")}])`
    );

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
      },
      buttonsStyling: false,
    });
    const waitingPopup = swalTailwind.fire({
      title: "Calculando!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    console.log(Object.fromEntries(formData));
    fetch("/zapatas", {
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
        const zapatas = readmat(matData);
        console.log(zapatas);
        zapatas.data.ZLT.forEach((zl, index) => {
          const trace = {
            x: zapatas.data.XL, // X-axis data
            y: zapatas.data.YL, // Y-axis data
            z: zl, // Z-axis data
            mode: "markers", // Scatter plot mode
            marker: {
              size: 2, // Size of the markers
              color: zl, // Color of the markers, based on Z data
              colorscale: "Viridis", // Color scale
              showscale: true, // Show the color scale
              colorbar: {
                title: {
                  text: "Presion Admisible (Tn/m)",
                  side: "right",
                },
              },
            },
            type: "scattergl", // 3D scatter plot type
            /* type: "pointcloudgl", // 3D scatter plot type */
            scene: `scene${index + 1}`,
          };
          const layout = {
            xaxis: {
              scaleanchor: "y",
              scaleratio: 1,
            },
            yaxis: {
              constrain: "domain",
            },
            height: 500,
            /* width: 400, */
            showlegend: false,
            title: `<b>Comb ${index + 1}<br>σ<sub>min</sub> = ${zapatas.data.mins[index].toFixed(
              2
            )}<br>σ<sub>max</sub> = ${zapatas.data.maxs[index].toFixed(2)}</b>`,
          };
          // Plot the chart using Plotly
          Plotly.react(`zapata${index + 1}`, [trace], layout, { responsive: false });
        });
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

        Array.from(Array(11), (_, index) => index + 1).forEach((index) => {
          Plotly.purge(`zapata${index}`);
        });
        pdfButton.disabled = true;
        pdfButton.className = "bg-gray-500 text-white font-bold py-2 px-4 border-b-4 border-gray-700 rounded";
      });
  });
  
  document.getElementById("generarPDF").addEventListener("click", async () => {
    const cargasData = cargas.getData();
    const propiedadesData = propiedades.getData();
    const docDefinition = {
      content: [
        {
          style: "tableExample",
          table: {
            headerRows: 2,
            widths: ["*", "*", "*", "*"],
            body: [
              [{ text: "Datos Generales", colSpan: 4, style: "tableHeader", alignment: "center" }, {}, {}, {}],
              [
                { text: "Nombre", style: "tableHeader", alignment: "center" },
                { text: "Simbolo", style: "tableHeader", alignment: "center" },
                { text: "Valor", style: "tableHeader", alignment: "center", colSpan: 2 },
                {},
              ],
              [
                "Sismica",
                { text: "P", alignment: "center" },
                { text: cargasData[0].sismica, alignment: "right" },
                { text: "Tn" },
              ],
              [
                "Sismica",
                { text: "MX", alignment: "center" },
                { text: cargasData[1].sismica, alignment: "right" },
                { text: "Tn-m" },
              ],
              [
                "Sismica",
                { text: "MY", alignment: "center" },
                { text: cargasData[2].sismica, alignment: "right" },
                { text: "Tn-m" },
              ],
              [
                "Muerta",
                { text: "P", alignment: "center" },
                { text: cargasData[0].muerta, alignment: "right" },
                { text: "Tn" },
              ],
              [
                "Muerta",
                { text: "MX", alignment: "center" },
                { text: cargasData[1].muerta, alignment: "right" },
                { text: "Tn-m" },
              ],
              [
                "Muerta",
                { text: "MY", alignment: "center" },
                { text: cargasData[2].muerta, alignment: "right" },
                { text: "Tn-m" },
              ],
              [
                "Viva",
                { text: "P", alignment: "center" },
                { text: cargasData[0].viva, alignment: "right" },
                { text: "Tn" },
              ],
              [
                "Viva",
                { text: "MX", alignment: "center" },
                { text: cargasData[1].viva, alignment: "right" },
                { text: "Tn-m" },
              ],
              [
                "Viva",
                { text: "MY", alignment: "center" },
                { text: cargasData[2].viva, alignment: "right" },
                { text: "Tn-m" },
              ],
              [
                "-",
                { text: "A", alignment: "center" },
                { text: propiedadesData[0].entradas, alignment: "right" },
                { text: "Tn" },
              ],
              [
                "-",
                { text: "Ixx", alignment: "center" },
                { text: propiedadesData[1].entradas, alignment: "right" },
                { text: "m⁴" },
              ],
              [
                "-",
                { text: "Iyy", alignment: "center" },
                { text: propiedadesData[2].entradas, alignment: "right" },
                { text: "m⁴" },
              ],
              [
                "-",
                { text: "Df", alignment: "center" },
                { text: propiedadesData[3].entradas, alignment: "right" },
                { text: "m" },
              ],
            ],
          },
          layout: "lightHorizontalLines",
        },
        { text: "1.- Analisis Estructural", style: "header" },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
        },
      },
    };
    for (const id of Array.from(Array(11), (_, index) => index + 1)) {
      const b64_img = await Plotly.toImage(`zapata${id}`);
      docDefinition.content.push({
        image: b64_img,
        width: 500,
      });
    }
    pdfMake.createPdf(docDefinition).download("cimentacion.pdf");
  });
});

import { read as readmat } from "mat-for-js";
import Plotly from "plotly.js-dist-min";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("suelosForm").addEventListener("submit", (ev) => {
    const fetchData = new FormData(ev.target);
    ev.preventDefault();
    fetch("/suelos", {
      method: "POST",
      body: fetchData,
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
        const suelos = readmat(matData);
        console.log(suelos);
        const trace1 = {
          x: suelos.data.Q.reduce((xs, col) => {
            xs.push(col[5]);
            return xs;
          }, []),
          y: suelos.data.Q.reduce((ys, col) => {
            ys.push(-col[0]);
            return ys;
          }, []),
          mode: "lines+markers",
          marker: {
            size: 8,
            symbol: "circle",
            color: "rgba(0,0,0,0)",
            line: {
              width: 2,
              /* color: "blue", */
            },
          },
          line: {
            width: 2,
            color: "blue",
          },
        };
        const dashed = suelos.data.Q.map((col) => {
          return {
            x: [0, col[5]],
            y: [-col[0], -col[0]],
            mode: "lines",
            line: {
              dash: "dot",
              color: "black",
              width: 0.3,
            },
          };
        });
        const layout = {
          showlegend: false,
          title: { text: "Distribución de Esfuerzos con la Profundidad" },
          xaxis: { title: { text: "Incremento de Esfuerzos (t/m^2)" } },
          yaxis: { title: { text: "Profundidad (m)" } },
        };
        const trace2 = {
          x: suelos.data.Q.reduce((xs, col) => {
            xs.push(col[6]);
            return xs;
          }, []),
          y: suelos.data.Q.reduce((ys, col) => {
            ys.push(-col[0]);
            return ys;
          }, []),
          mode: "lines+markers",
          marker: {
            size: 8,
            symbol: "circle",
            color: "rgba(0,0,0,0)",
            line: {
              width: 2,
              /* color: "blue", */
            },
          },
          line: {
            width: 2,
            color: "blue",
          },
        };
        const dashed2 = suelos.data.Q.map((col) => {
          return {
            x: [0, col[6]],
            y: [-col[0], -col[0]],
            mode: "lines",
            line: {
              dash: "dot",
              color: "black",
              width: 0.3,
            },
          };
        });
        const layout2 = {
          showlegend: false,
          title: { text: "Distribución de Esfuerzos con la Profundidad en porcentajes" },
          xaxis: { title: { text: "Incremento de Esfuerzos (t/m^2)" } },
          yaxis: { title: { text: "Profundidad (m)" } },
        };
        Plotly.newPlot("grafico1", [trace1].concat(dashed), layout);
        Plotly.newPlot("grafico2", [trace2].concat(dashed2), layout2);
      });
  });
});

// Original automatic combinations remain available alongside manual selections.
export const FLEXION_STEEL_OPTIONS = [
  '1 Ø 3/8"', '1 Ø 1/2"', '1 Ø 5/8"', '1 Ø 3/4"', '1 Ø 1"',
  '1 Ø 5/8" + 1 Ø 3/8"', '1 Ø 5/8" + 1/2"', '2 Ø 5/8"',
  '2 Ø 5/8" + 1 Ø 3/8"', '2 Ø 5/8" + 1 Ø 1/2"',
  '3 Ø 5/8"', '2 Ø 5/8" + 2 Ø 1/2"',
];

export function createFlexionModel() {
  return {
    id: "#T1",
    mutators: {
      diametro: {
        deps: ["Asd"],
        mutator: function (value, data) {
          if (typeof value === "string" && value.trim()) return value.trim();
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
              headerSort: false,
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value) ? "" : value.toFixed(2) + " Tn-m";
              },
            },
            {
              title: "Asd cm²",
              field: "Asd",
              headerSort: false,
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
              headerSort: false,
              formatter: function (cell, formatterParams, onRendered) {
                const value = parseFloat(cell.getValue());
                return isNaN(value) ? "" : value.toFixed(2) + " cm²";
              },
            },
            {
              title: "Diametro",
              field: "diametro",
              headerSort: false,
              editor: "list",
              editorParams: {
                values: FLEXION_STEEL_OPTIONS,
                autocomplete: true,
                listOnEmpty: true,
                freetext: true,
                selectContents: true,
              },
              formatter: "plaintext",
              minWidth: 170,
            },
          ],
        },
      ],
    },
  };
}

function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

const asdComponent = (percentX, asd1, d1, asd2, d2, asd3, d3, isLast, L) => {
      const l_div_3 = (L / 3).toFixed(2);
      const l_dot_7 = (0.7 * L).toFixed(2);
      return `<div class="text-center text-xs inline-block" style="width: ${percentX}%">
          <div class="flex justify-between">
            <div class="border-l-4 px-2">L = ${l_div_3}m<br>${parseFloat(asd1).toFixed(2)} cm²<br>${escapeText(d1)}</div>
            <div class="${!isLast ? "" : "border-r-4"} px-2">L = ${l_div_3}m<br>${parseFloat(asd3).toFixed(
        2
      )} cm²<br>${escapeText(d3)}</div>
          </div>
          <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}">${parseFloat(asd2).toFixed(
        2
      )} cm²<br>${escapeText(d2)}<br>L = ${l_dot_7}m</div>
        </div>`;
    };

// getData() preserves calculation order: start, middle, end for each span.
export function bindFlexionDiagram(table, spans, widths, container) {
  const refresh = () => {
    const rows = table.getData();
    container.innerHTML = spans.map((span, index) => {
      const [left, middle, right] = rows.slice(index * 3, index * 3 + 3);
      if (!left || !middle || !right) return "";
      return asdComponent(widths[index], left.Asd, left.diametro,
        middle.Asd, middle.diametro, right.Asd, right.diametro,
        index === spans.length - 1, Number(span.lti));
    }).join("");
  };
  table.on("dataChanged", refresh);
  table.on("dataProcessed", refresh);
  table.on("historyUndo", refresh);
  table.on("historyRedo", refresh);
  refresh();
  return refresh;
}

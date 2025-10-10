export function makeRoundRenderer(round) {
  return function (instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.NumericRenderer.apply(this, arguments);
    if (value === "-") {
      cellProperties.valid = true;
    }
    var parsed = parseFloat(td.textContent);
    if (!isNaN(parsed)) {
      td.textContent = parsed.toFixed(round);
    }
  };
}

// create an external HyperFormula instance
var hyperformulaInstance = HyperFormula.buildEmpty({
  // initialize it with the `'internal-use-in-handsontable'` license key
  licenseKey: "internal-use-in-handsontable",
});

// set errors to use "-"
var errors = hyperformulaInstance._config.translationPackage.errors;
Object.keys(errors).forEach((error) => {
  errors[error] = "-";
});

export function createTable(table) {
  var default_config = {
    colWidths: 100,
    colHeaders: true,
    width: "100%",
    height: "auto",
    preventOverflow: "horizontal",
    licenseKey: "non-commercial-and-evaluation",
    data: [[]],
    formulas: {
      engine: hyperformulaInstance,
      sheetName: table.id,
    },
    autoColumnSize: false,
    afterPaste: async function (data, coords) {
      setTimeout(() => {
        data.forEach(function (rowData, i) {
          var startRow = coords[0].startRow;
          var startCol = coords[0].startCol;
          var endCol = coords[0].endCol;
          let k = 0;
          for (let j = startCol; j <= endCol; j++) {
            hot.setDataAtCell(startRow + i, j, rowData[k]);
            k++;
          }
        });
      }, 250);
    },
    afterCreateRow: async function (index, amount, source) {
      var hot = this;
      for (let i = 0; i < amount; i++) {
        Object.keys(table.formulas).forEach((col) => {
          hot.setDataAtCell(
            index + i - 1,
            parseInt(col),
            table.formulas[col](index + i)
          );
        });
      }
    },
  };
  if (table.data !== undefined) {
    table.config.columns = table.config.columns.map((col) => {
      return { ...col, type: "text" };
    });
  }
  var hot = new Handsontable(document.getElementById(table.id), {
    ...default_config,
    ...table.config,
  });
  table.data?.forEach((values, row) => {
    hot.alter("insert_row_below");
    values.forEach((value, col) => {
      hot.setDataAtCell(row, col, `${value}`);
    });
  });
  if (table.config.data === undefined) {
    hot.alter("remove_row");
  }
  return hot;
}

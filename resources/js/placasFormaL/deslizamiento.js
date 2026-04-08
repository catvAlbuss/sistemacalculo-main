/* ------------------------ Análisis en X ------------------------ */
var ddT1XData = [];
export function ddT1X(
  contenedor,
  initialData,
  formData,
  tableData3DC,
  tableData3YDC
) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  if (!tableData3DC || tableData3DC.length === 0) {
    alert('Debe completar el diseño por flexión en X-X primero');
    return;
  }

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var λ = 1;
    var μ = 0.6;

    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      'Peso Normal',
      λ,
      'Caso III',
      μ,
      '',
      '',
      tableData3DC[i][3],
      tableData3DC[i][3] * formData.exDF * 100 * 100,
      '',
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [
      [
        'Nivel',
        'Tipo',
        'λ',
        'Casos según',
        'μ',
        'Pcm',
        'Nu',
        'ρv',
        'Av',
        'ØVn',
      ],
      [
        '',
        'Concreto',
        '',
        ' Artículo 11.7.4.3.',
        '',
        '(Ton)',
        '(Ton)',
        '',
        '(cm²)',
        '(Ton)',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      {
        type: 'dropdown',
        source: ['Peso Normal', 'Liviano - Arena de Peso Normal', 'Liviano'],
      }, // Tipo de concreto
      { type: 'numeric', readOnly: true },
      {
        type: 'dropdown',
        source: ['Caso I', 'Caso II', 'Caso III', 'Caso IV'],
      }, // Casos
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
    ],
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        changes.forEach(function (change) {
          /* console.log(change) Devuelve un array con 4 valores, row, col, oldValue, newValue */
          var row = change[0];
          var col = change[1];
          //var oldValue = change[2];
          var newValue = change[3];

          if (col === 1) {
            // Valor Acero -> newValue
            var tipoConcreto = newValue;
            var λ = 0;
            // Valor D (cm)
            if (tipoConcreto == 'Peso Normal') {
              λ = 1;
            } else if (tipoConcreto == 'Liviano - Arena de Peso Normal') {
              λ = 0.75;
            } else if (tipoConcreto == 'Liviano') {
              λ = 0.85;
            }
            hot.setDataAtCell(row, 2, λ);
          }
          if (col == 2) {
            // λ -> newValue
            var λ = newValue;
            var casoU = hot.getDataAtCell(row, 3);
            var μ = 0;
            // Valor D (cm)
            if (casoU == 'Caso I') {
              μ = 1.4 * λ;
            } else if (casoU == 'Caso II') {
              μ = λ;
            } else if (casoU == 'Caso III') {
              μ = 0.6 * λ;
            } else if (casoU == 'Caso IV') {
              μ = 0.7 * λ;
            }
            hot.setDataAtCell(row, 4, μ);
          }
          if (col == 3) {
            // Caso -> newValue
            var casoU = newValue;
            var μ = 0;
            // Valor D (cm)
            if (casoU == 'Caso I') {
              μ = 1.4 * hot.getDataAtCell(row, 2);
            } else if (casoU == 'Caso II') {
              μ = hot.getDataAtCell(row, 2);
            } else if (casoU == 'Caso III') {
              μ = 0.6 * hot.getDataAtCell(row, 2);
            } else if (casoU == 'Caso IV') {
              μ = 0.7 * hot.getDataAtCell(row, 2);
            }
            hot.setDataAtCell(row, 4, μ);
          }
          if (col == 4) {
            hot.setDataAtCell(
              row,
              9,
              formData.designDC *
                newValue *
                (hot.getDataAtCell(row, 6) +
                  (hot.getDataAtCell(row, 8) * formData.fyDF) / 1000)
            );
          }
          if (col == 5) {
            hot.setDataAtCell(row, 6, 0.9 * newValue);
          }
          if (col == 6) {
            hot.setDataAtCell(
              row,
              9,
              formData.designDC *
                hot.getDataAtCell(row, 4) *
                (newValue + (hot.getDataAtCell(row, 8) * formData.fyDF) / 1000)
            );
          }
          if (col == 8) {
            hot.setDataAtCell(
              row,
              9,
              formData.designDC *
                hot.getDataAtCell(row, 4) *
                (hot.getDataAtCell(row, 6) + (newValue * formData.fyDF) / 1000)
            );
          }
        });
      }
    },
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
          /* console.log('Fila:', startRow + i);
            console.log('Columna:', j);
            console.log('Dato:', rowData[k]);
            console.log('indice' + k); */
          hot.setDataAtCell(startRow + i, j, rowData[k]);
          k++;
        }
      });
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  document
    .getElementById('saveDataBtnDD1X')
    .addEventListener('click', nextTab2);

  function nextTab2() {
    ddT1XData = hot.getData();
    var contenedor = document.getElementById('ddT2X');
    ddT2X(contenedor, initialData, ddT1XData, formData);
    var contenedorY = document.getElementById('ddT1Y');
    ddT1Y(contenedorY, initialData, formData, ddT1XData, tableData3YDC);
  }
}

function ddT2X(contenedor, solicitaciones, tabla1, formData) {
  var container = contenedor;
  var data = [];
  for (let i = 0; i < solicitaciones.length; i++) {
    var ag = formData.agVA;
    var vnMax1 = 0.2 * formData.fcDF * ag * 10;
    var vnMax2 = 55 * ag;
    var vnMax = Math.min(vnMax1, vnMax2);
    var verifVn = vnMax >= tabla1[i][9] ? 'Sí cumple' : 'No cumple, verificar';
    var ØVn = Math.min(tabla1[i][9], vnMax);
    var juntaConstru =
      ØVn >= solicitaciones[i][2]
        ? 'Sí cumple, no hay deslizamiento'
        : 'No cumple, verificar';

    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      ag, // Ac (m²)
      vnMax1,
      vnMax2,
      vnMax,
      verifVn,
      ØVn,
      solicitaciones[i][2],
      juntaConstru, // Verificación de la Compresión Pura
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [
      [
        'Nivel',
        'Ac',
        'Vn máx 1',
        'Vn máx 2',
        'Vn máx',
        'Verificación',
        'ØVn',
        'Vu máx',
        'Juntas',
      ],
      [
        '',
        '(m²)',
        '(Ton)',
        '(Ton)',
        '(Ton)',
        '"Vn" Máximo',
        '(Ton)',
        '(Ton)',
        'Construcción',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });
}

/* ------------------------ Análisis en Y ------------------------ */
var ddT1YData = [];
export function ddT1Y(
  contenedor,
  initialData,
  formData,
  dataT1X,
  tableData3YDC
) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var λ = 1;
    var μ = 0.6;
    var pcm = dataT1X[i][5];
    var nu = 0.9 * dataT1X[i][5];
    var pv = tableData3YDC[i][3];
    var av = pv * formData.eyDF * 100 * 100;
    var vn = formData.designDC * μ * (nu + (av * formData.fyDF) / 1000);

    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      'Peso Normal',
      λ,
      'Caso III',
      μ,
      pcm,
      nu,
      pv,
      av,
      vn,
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [
      ['Nivel', 'Tipo', 'λ', 'Casos', 'μ', 'Pcm', 'Nu', 'ρv', 'Av', 'ØVn'],
      [
        '',
        'Concreto',
        '',
        'Artículo 11.7.4.3.',
        '',
        '(Ton)',
        '(Ton)',
        '',
        '(cm²)',
        '(Ton)',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      {
        type: 'dropdown',
        source: ['Peso Normal', 'Liviano - Arena de Peso Normal', 'Liviano'],
      }, // Tipo de concreto
      { type: 'numeric', readOnly: true },
      {
        type: 'dropdown',
        source: ['Caso I', 'Caso II', 'Caso III', 'Caso IV'],
      }, // Casos
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
    ],
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        changes.forEach(function (change) {
          /* console.log(change) Devuelve un array con 4 valores, row, col, oldValue, newValue */
          var row = change[0];
          var col = change[1];
          //var oldValue = change[2];
          var newValue = change[3];

          if (col === 1) {
            // Valor Acero -> newValue
            var tipoConcreto = newValue;
            var λ = 0;
            // Valor D (cm)
            if (tipoConcreto == 'Peso Normal') {
              λ = 1;
            } else if (tipoConcreto == 'Liviano - Arena de Peso Normal') {
              λ = 0.75;
            } else if (tipoConcreto == 'Liviano') {
              λ = 0.85;
            }
            hot.setDataAtCell(row, 2, λ);
          }
          if (col == 2) {
            // λ -> newValue
            var λ = newValue;
            var casoU = hot.getDataAtCell(row, 3);
            var μ = 0;
            // Valor D (cm)
            if (casoU == 'Caso I') {
              μ = 1.4 * λ;
            } else if (casoU == 'Caso II') {
              μ = λ;
            } else if (casoU == 'Caso III') {
              μ = 0.6 * λ;
            } else if (casoU == 'Caso IV') {
              μ = 0.7 * λ;
            }
            hot.setDataAtCell(row, 4, μ);
          }
          if (col == 3) {
            // Caso -> newValue
            var casoU = newValue;
            var μ = 0;
            // Valor D (cm)
            if (casoU == 'Caso I') {
              μ = 1.4 * hot.getDataAtCell(row, 2);
            } else if (casoU == 'Caso II') {
              μ = hot.getDataAtCell(row, 2);
            } else if (casoU == 'Caso III') {
              μ = 0.6 * hot.getDataAtCell(row, 2);
            } else if (casoU == 'Caso IV') {
              μ = 0.7 * hot.getDataAtCell(row, 2);
            }
            hot.setDataAtCell(row, 4, μ);
          }
          if (col == 4) {
            hot.setDataAtCell(
              row,
              9,
              formData.designDC *
                newValue *
                (hot.getDataAtCell(row, 6) +
                  (hot.getDataAtCell(row, 8) * formData.fyDF) / 1000)
            );
          }
          if (col == 5) {
            hot.setDataAtCell(row, 6, 0.9 * newValue);
          }
          if (col == 6) {
            hot.setDataAtCell(
              row,
              9,
              formData.designDC *
                hot.getDataAtCell(row, 4) *
                (newValue + (hot.getDataAtCell(row, 8) * formData.fyDF) / 1000)
            );
          }
          if (col == 8) {
            hot.setDataAtCell(
              row,
              9,
              formData.designDC *
                hot.getDataAtCell(row, 4) *
                (hot.getDataAtCell(row, 6) + (newValue * formData.fyDF) / 1000)
            );
          }
        });
      }
    },
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
          /* console.log('Fila:', startRow + i);
            console.log('Columna:', j);
            console.log('Dato:', rowData[k]);
            console.log('indice' + k); */
          hot.setDataAtCell(startRow + i, j, rowData[k]);
          k++;
        }
      });
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  document
    .getElementById('saveDataBtnDD1Y')
    .addEventListener('click', nextTab2);

  function nextTab2() {
    ddT1YData = hot.getData();
    var contenedor = document.getElementById('ddT2Y');
    ddT2Y(contenedor, initialData, ddT1YData, formData);
  }
}

function ddT2Y(contenedor, solicitaciones, tabla1, formData) {
  var container = contenedor;
  var data = [];
  for (let i = 0; i < solicitaciones.length; i++) {
    var ag = formData.agVA;
    var vnMax1 = 0.2 * formData.fcDF * ag * 10;
    var vnMax2 = 55 * ag;
    var vnMax = Math.min(vnMax1, vnMax2);
    var verifVn = vnMax >= tabla1[i][9] ? 'Sí cumple' : 'No cumple, verificar';
    var ØVn = Math.min(tabla1[i][9], vnMax);
    var juntaConstru =
      ØVn >= solicitaciones[i][4]
        ? 'Sí cumple, no hay deslizamiento'
        : 'No cumple, verificar';

    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      ag, // Ac (m²)
      vnMax1,
      vnMax2,
      vnMax,
      verifVn,
      ØVn,
      solicitaciones[i][4],
      juntaConstru,
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [
      [
        'Nivel',
        'Ac',
        'Vn máx 1',
        'Vn máx 2',
        'Vn máx',
        'Verificación',
        'ØVn',
        'Vu máx',
        'Juntas',
      ],
      [
        '',
        '(m²)',
        '(Ton)',
        '(Ton)',
        '(Ton)',
        '"Vn" Máximo',
        '(Ton)',
        '(Ton)',
        'Construcción',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });
}
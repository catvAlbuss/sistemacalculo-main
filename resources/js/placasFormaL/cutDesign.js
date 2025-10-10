export var tableData1 = [];
export var tableData2 = [];
export var tableData3 = [];

/* ------------------------ Análsis en X ------------------------ */
export function cutDesignT1X(contenedor, initialData, formData) {
  var container = contenedor;

  var data = [];
  // Tipo sistema Estructural = Muros Estructurales
  var tipoSistema = 6;

  for (let i = 0; i < initialData.length; i++) {
    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      formData.lxDF, // lm
      '', // h i
      '', // hm acumulado
      '', // hm
      initialData[i][2], // Vua
      initialData[i][3], // Mua
      '', // Cociente
      '', // Aplica Criterio
      '', // Mnx i
      '', // Mnx/Mua
      '', // Vux
      '', // hm/lm
      '', // αc
      '', // Vcx máx
      '-', // Nu
      '-', // β
      '', // Vcx
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
        'lm',
        'h',
        'hm acumulado',
        'hm',
        'Vua',
        'Mua',
        'Cociente',
        '¿Aplica criterio?',
        'Mnx',
        'Mnx/Mua',
        'Vux',
        'hm/lm',
        'αc',
        'Vcx máx',
        'Nu',
        'β',
        'Vcx',
      ],
      [
        '',
        '(m)',
        '(m)',
        '(m)',
        '(m)',
        '(Ton)',
        '(Ton.m)',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // 'Nivel',
      { type: 'numeric', readOnly: true }, // 'lm (m)',
      { type: 'numeric' }, // 'h (m)',
      { type: 'numeric', readOnly: true }, // 'hm acumulado (m)',
      { type: 'numeric', readOnly: true }, // 'hm (m)',
      { type: 'numeric', readOnly: true }, // 'Vua (Ton)',
      { type: 'numeric', readOnly: true }, // 'Mua (Ton.m)',
      { type: 'numeric', readOnly: true }, // 'Cociente',
      { type: 'text', readOnly: true }, // '¿Aplica criterio?',
      { type: 'numeric' }, // 'Mnx (Ton.m)',
      { type: 'numeric', readOnly: true }, // 'Mnx/Mua',
      { type: 'numeric', readOnly: true }, // 'Vux (Ton)',
      { type: 'numeric', readOnly: true }, // 'hm/lm',
      { type: 'numeric', readOnly: true }, // 'αc',
      { type: 'numeric', readOnly: true }, // 'Vcx máx (Ton)',
      { type: 'numeric' }, // 'Nu (Ton)',
      { type: 'numeric', readOnly: true }, // 'β',
      { type: 'numeric', readOnly: true }, // 'Vcx (Ton)',
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

          if (col === 2) {
            // Valor h -> newValue
            var h = newValue;
            // Valor hm (m)
            var hm = 0;
            for (let i = 0; i < hot.countRows(); i++) {
              hm += hot.getDataAtCell(i, 2);
            }
            if (row == 0) {
              hot.setDataAtCell(row, 4, hm);
              hot.setDataAtCell(row, 3, h);
            } else {
              hot.setDataAtCell(row, 3, h + hot.getDataAtCell(row - 1, 3));
              hot.setDataAtCell(0, 4, hm);
              hot.setDataAtCell(row, 4, hot.getDataAtCell(row - 1, 3) - h);
            }
            // Cociente
            var cociente = 0;
            if (row == 0) {
              cociente = Math.max(
                hot.getDataAtCell(row, 1),
                newValue + hot.getDataAtCell(1, 2),
                0.25 * (hot.getDataAtCell(0, 6) / hot.getDataAtCell(0, 5))
              );
            }
            if (row == 1) {
              cociente = Math.max(
                hot.getDataAtCell(row, 1),
                hot.getDataAtCell(0, 2) + newValue,
                0.25 * (hot.getDataAtCell(0, 6) / hot.getDataAtCell(0, 5))
                /* 0.25 * (hot.getDataAtCell(row, 6) / hot.getDataAtCell(row, 5)) */
              );
            } else {
              cociente = Math.max(
                hot.getDataAtCell(row, 1),
                hot.getDataAtCell(0, 2) + hot.getDataAtCell(1, 2),
                0.25 * (hot.getDataAtCell(0, 6) / hot.getDataAtCell(0, 5))
                /* 0.25 * (hot.getDataAtCell(row, 6) / hot.getDataAtCell(row, 5)) */
              );
            }
            hot.setDataAtCell(row, 7, cociente);
          }

          if (col === 3) {
            if (row + 1 < hot.countRows()) {
              hot.setDataAtCell(
                row + 1,
                3,
                newValue + hot.getDataAtCell(row + 1, 2)
              );
            }
            // Cociente
            /*var cociente = hot.getDataAtCell(row, 7);
             if (row + 1 < hot.countRows()) {
              cociente = Math.max(
                hot.getDataAtCell(row, 1),
                hot.getDataAtCell(row, 2) + hot.getDataAtCell(row + 1, 2),
                0.25 * (hot.getDataAtCell(row, 6) / hot.getDataAtCell(row, 5))
              );
            } else {
              cociente = Math.max(
                hot.getDataAtCell(row, 1),
                hot.getDataAtCell(row, 2) + 0,
                // hot.getDataAtCell(row, 2) + hot.getDataAtCell(row + 1, 2),
                0.25 * (hot.getDataAtCell(row, 6) / hot.getDataAtCell(row, 5))
              );
            } 
            hot.setDataAtCell(row, 7, cociente);*/
            var fijo = hot.getDataAtCell(0, 3);
            var aplica =
              parseFloat((newValue - fijo).toFixed(2)) <
              hot.getDataAtCell(row, 7)
                ? 'Sí aplica'
                : 'No aplica';
            hot.setDataAtCell(row, 8, aplica);
            //console.log(row,`hmacu ${newValue}  fijo ${fijo}  resta ${newValue - fijo}`,` $cociente ${hot.getDataAtCell(row, 7)}`);
          }

          if (col === 4) {
            if (row + 1 < hot.countRows()) {
              hot.setDataAtCell(
                row + 1,
                4,
                /* hot.getDataAtCell(row, 3) - hot.getDataAtCell(row + 1, 2) */
                newValue - hot.getDataAtCell(row + 1, 2)
              );
            }
            // Valor hm/lm
            var hmlm = newValue / hot.getDataAtCell(row, 1);
            hot.setDataAtCell(row, 12, hmlm);
          }

          if (col == 7) {
            // Valor Tipo de Muro
            var fijo = hot.getDataAtCell(0, 3);
            var hacum = hot.getDataAtCell(row, 3);
            var aplica =
              parseFloat((hacum - fijo).toFixed(2)) < newValue
                ? 'Sí aplica'
                : 'No aplica';
            hot.setDataAtCell(row, 8, aplica);
          }
          // if(col == 5)
          // if(col == 6)
          if (col == 8) {
            hot.setDataAtCell(
              row,
              11,
              newValue == 'Sí aplica'
                ? hot.getDataAtCell(row, 5) * hot.getDataAtCell(row, 10)
                : hot.getDataAtCell(row, 5)
            );
          }
          if (col == 9) {
            hot.setDataAtCell(
              row,
              10,
              newValue == '-'
                ? '-'
                : Math.min(newValue / hot.getDataAtCell(row, 6), tipoSistema)
            );
          }
          if (col == 10) {
            hot.setDataAtCell(
              row,
              11,
              hot.getDataAtCell(row, 8) == 'Sí aplica'
                ? hot.getDataAtCell(row, 5) * newValue
                : hot.getDataAtCell(row, 5)
            );
          }
          if (col == 12) {
            hot.setDataAtCell(
              row,
              13,
              newValue <= 1.5
                ? 0.8
                : newValue >= 2
                ? 0.53
                : 0.53 - ((0.53 - 0.8) * (2 - newValue)) / (2 - 1.5)
            );
          }
          if (col == 13) {
            hot.setDataAtCell(
              row,
              14,
              formData.acwxDC * Math.sqrt(formData.fcDF) * newValue * 10
            );
          }
          if (col == 14) {
            hot.setDataAtCell(
              row,
              17,
              hot.getDataAtCell(row, 15) == '-'
                ? newValue
                : newValue * hot.getDataAtCell(row, 16)
            );
          }
          if (col == 15) {
            hot.setDataAtCell(
              row,
              16,
              newValue == '-'
                ? '-'
                : 1 -
                    newValue /
                      (35 * formData.exDF * hot.getDataAtCell(row, 1) * 10)
            );
            hot.setDataAtCell(
              row,
              17,
              newValue == '-'
                ? hot.getDataAtCell(row, 14)
                : hot.getDataAtCell(row, 14) * hot.getDataAtCell(row, 16)
            );
          }
          if (col == 16) {
            hot.setDataAtCell(
              row,
              17,
              newValue == '-'
                ? hot.getDataAtCell(row, 14)
                : hot.getDataAtCell(row, 14) * newValue
            );
          }
        });
        /* CheckData(); */
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
    .getElementById('saveDataBtnDC1X')
    .addEventListener('click', CheckData);

  function CheckData() {
    var allCellsFilled = true;
    tableData1 = hot.getData();
    for (var i = 0; i < tableData1.length; i++) {
      for (var j = 0; j < tableData1[i].length; j++) {
        if (tableData1[i][j] === null || tableData1[i][j] === '') {
          allCellsFilled = false;
          break;
        }
      }
      if (!allCellsFilled) {
        break;
      }
    }
    if (allCellsFilled) {
      console.log('Datos de la tabla DC T1X:', tableData1);
      var cutDesingT2X = document.getElementById('cutDesingT2X');
      cutDesignT2X(cutDesingT2X, formData);
      //var flexDesingT3X = document.getElementById('flexDesingT3X');
      //flexDesignT3X(flexDesingT3X, tableData, formData);
    } else {
      alert('Hay celdas vacías');
    }
  }
}

//Tabla Análisis en Dirección "2 x"
export function cutDesignT2X(contenedor, formData) {
  var container = contenedor;
  var initialData = tableData1;
  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var vs = Math.max(
      initialData[i][11] / formData.designDC - initialData[i][17],
      0
    );
    var vsMax =
      2.1 * Math.sqrt(formData.fcDF) * formData.exDF * formData.dxDF * 10;
    var acv = formData.acwxDC * Math.pow(100, 2);
    var numCapas =
      initialData[i][11] > (0.53 * acv * Math.sqrt(formData.fcDF)) / 1000
        ? 2
        : formData.exDF > 0.2
        ? 2
        : 1;
    var vuMax =
      0.27 * Math.sqrt(formData.fcDF) * formData.exDF * formData.dxDF * 10;
    var phmin = initialData[i][11] < vuMax ? 0.002 : 0.0025;
    var ph = Math.max(
      phmin,
      vs / (formData.exDF * formData.lxDF * formData.fyDF * 10)
    );
    var vsFinal = formData.exDF * formData.lxDF * ph * formData.fyDF * 10;
    var vn = formData.designDC * (initialData[i][17] + vsFinal);
    var vnMax = formData.acwxDC * Math.sqrt(formData.fcDF) * 2.6 * 10;
    var verifVnMax = vn <= vnMax ? 'Sí cumple' : 'No cumple, verificar';
    var verifResistenciaCortante =
      vn >= initialData[i][11] ? 'Sí cumple' : 'No cumple, verificar';

    var dataRow = [
      `Piso ${i + 1}`,
      vs,
      vsMax,
      vs <= vsMax ? 'Sí cumple' : 'No cumple, verificar',
      acv,
      numCapas,
      vuMax,
      phmin,
      ph,
      vsFinal,
      vn,
      vnMax,
      verifVnMax,
      verifResistenciaCortante,
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
        'Vs',
        'Vs máx',
        'Verificación',
        'Acv',
        'N°',
        'Vu máx',
        'ρh mín',
        'ρh',
        'Vs final',
        'Vn',
        'Vn máx',
        'Verificación',
        'Verificación',
      ],
      [
        '',
        '(Ton)',
        '(Ton)',
        'Cortante del Acero Máximo',
        '(cm²)',
        'Capas',
        '(Ton)',
        '',
        '',
        '(Ton)',
        '(Ton)',
        '(Ton)',
        '(Ton)',
        'Resistencia al Cortante',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'text', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });

  document.getElementById('saveDataBtnDC2X').addEventListener('click', nextTab);

  function nextTab() {
    tableData2 = hot.getData();
    var cutDesingT3X = document.getElementById('cutDesingT3X');
    cutDesignT3X(cutDesingT3X, formData);
  }
}

//Tabla Análisis en Dirección "3 x"
export function cutDesignT3X(contenedor, formData) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < tableData1.length; i++) {
    var pvmin = tableData1[i][11] < tableData2[i][6] ? 0.0015 : 0.0025;
    var pvmax = tableData2[i][8];
    var pv = Math.min(
      Math.max(
        0.0025 + 0.5 * (2.5 - tableData1[i][12]) * (tableData2[i][8] - 0.0025),
        pvmin
      ),
      pvmax
    );
    var verifCuantia = pv <= pvmax ? 'Sí cumple' : 'No cumple, verificar';
    var areaAcero = 0.71;
    var s =
      Math.ceil(
        (tableData2[i][5] * areaAcero) /
          (formData.exDF * 100 * tableData2[i][8]) /
          2.5
      ) * 2.5;
    var s2 =
      Math.ceil(
        (tableData2[i][5] * areaAcero) / (formData.exDF * 100 * pv) / 2.5
      ) * 2.5;
    var smax = Math.min(3 * formData.exDF * 100, 40);
    var verifEspMax = s < smax ? 'Sí cumple' : 'No cumple, verificar';
    var verifEspMax2 = s2 < smax ? 'Sí cumple' : 'No cumple, verificar';
    var dataRow = [
      `Piso ${i + 1}`,
      pvmin,
      pvmax,
      pv,
      verifCuantia,
      'ø3/8"',
      0.95,
      areaAcero,
      s,
      smax,
      verifEspMax,
      'ø3/8"',
      0.95,
      areaAcero,
      s2,
      smax,
      verifEspMax2,
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
        'ρv mín',
        'ρv máx',
        'ρv',
        'Verificación',
        'Acero',
        'D',
        'Área',
        's',
        'smáx',
        'Distribución de Refuerzo',
        'Acero',
        'D',
        'Área',
        's',
        'smáx',
        'Distribución de Refuerzo',
      ],
      [
        '',
        '',
        '',
        '',
        'Cuantía Vertical Máxima',
        '',
        '(cm)',
        '(cm²)',
        '(cm)',
        '(cm)',
        'Inicial en el Núcleo',
        '',
        '(cm)',
        '(cm²)',
        '(cm)',
        '(cm)',
        'Inicial en el Núcleo',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      {
        type: 'dropdown',
        source: [
          '6 mm',
          '8 mm',
          'ø3/8"',
          '12 mm',
          'ø1/2"',
          'ø5/8"',
          'ø3/4"',
          'ø7/8"',
          'ø1"',
          'ø1 3/8"',
        ],
      },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text' },
      {
        type: 'dropdown',
        source: [
          '6 mm',
          '8 mm',
          'ø3/8"',
          '12 mm',
          'ø1/2"',
          'ø5/8"',
          'ø3/4"',
          'ø7/8"',
          'ø1"',
          'ø1 3/8"',
        ],
      },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
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

          if (col === 5) {
            // Valor Acero -> newValue
            var Acero = newValue;
            var D = 0;
            var area = 0;
            // Valor D (cm)
            if (Acero == '6 mm') {
              D = 0.6;
              area = 0.28;
            } else if (Acero == '8 mm') {
              D = 0.8;
              area = 0.5;
            } else if (Acero == 'ø3/8"') {
              D = 0.95;
              area = 0.71;
            } else if (Acero == '12 mm') {
              D = 1.2;
              area = 1.13;
            } else if (Acero == 'ø1/2"') {
              D = 1.27;
              area = 1.29;
            } else if (Acero == 'ø5/8"') {
              D = 1.59;
              area = 2;
            } else if (Acero == 'ø3/4"') {
              D = 1.9;
              area = 2.84;
            } else if (Acero == 'ø7/8"') {
              D = 2.22;
              area = 3.87;
            } else if (Acero == 'ø1"') {
              D = 2.54;
              area = 5.1;
            } else {
              D = 3.49;
              area = 1.01;
            }
            hot.setDataAtCell(row, 6, D);
            hot.setDataAtCell(row, 7, area);
          }
          if (col == 7) {
            hot.setDataAtCell(
              row,
              8,
              Math.ceil(
                (tableData2[row][5] * newValue) /
                  (formData.exDF * 100 * tableData2[row][8]) /
                  2.5
              ) * 2.5
            );
          }
          if (col == 8) {
            hot.setDataAtCell(
              row,
              10,
              newValue <= hot.getDataAtCell(row, 9)
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
          if (col === 11) {
            // Valor Acero -> newValue
            var Acero = newValue;
            var D = 0;
            var area = 0;
            // Valor D (cm)
            if (Acero == '6 mm') {
              D = 0.6;
              area = 0.28;
            } else if (Acero == '8 mm') {
              D = 0.8;
              area = 0.5;
            } else if (Acero == 'ø3/8"') {
              D = 0.95;
              area = 0.71;
            } else if (Acero == '12 mm') {
              D = 1.2;
              area = 1.13;
            } else if (Acero == 'ø1/2"') {
              D = 1.27;
              area = 1.29;
            } else if (Acero == 'ø5/8"') {
              D = 1.59;
              area = 2;
            } else if (Acero == 'ø3/4"') {
              D = 1.9;
              area = 2.84;
            } else if (Acero == 'ø7/8"') {
              D = 2.22;
              area = 3.87;
            } else if (Acero == 'ø1"') {
              D = 2.54;
              area = 5.1;
            } else {
              D = 3.49;
              area = 1.01;
            }
            hot.setDataAtCell(row, 12, D);
            hot.setDataAtCell(row, 13, area);
          }
          if (col == 13) {
            hot.setDataAtCell(
              row,
              14,
              Math.ceil(
                (tableData2[row][5] * newValue) /
                  (formData.exDF * 100 * hot.getDataAtCell(row, 3)) /
                  2.5
              ) * 2.5
            );
          }
          if (col == 14) {
            hot.setDataAtCell(
              row,
              16,
              newValue <= hot.getDataAtCell(row, 15)
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
        });
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  document
    .getElementById('saveDataBtnDC3X')
    .addEventListener('click', nextTab2);

  function nextTab2() {
    tableData3 = hot.getData();
    var cutDesingT4X = document.getElementById('cutDesingT4X');
    cutDesignT4X(cutDesingT4X);
  }
}

//Tabla Análisis en Dirección "4 x"
export function cutDesignT4X(contenedor) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < tableData1.length; i++) {
    var dataRow = [
      `Piso ${i + 1}`,
      tableData2[i][5],
      tableData3[i][5],
      '@',
      tableData3[i][8],
      tableData2[i][5],
      tableData3[i][11],
      '@',
      tableData3[i][14],
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
    colHeaders: [
      'Nivel',
      'Capas',
      'Acero',
      '',
      's (cm)',
      'Capas',
      'Acero',
      '',
      's (cm)',
    ],
    columns: [
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });
}

/* ------------------------ Análsis en Y ------------------------ */
//cutDesignT1Y

export var tableData1Y = [];
var tableData2Y = [];
export var tableData3Y = [];

export function cutDesignT1Y(contenedor, initialData, formData) {
  var container = contenedor;

  var data = [];
  // Tipo sistema Estructural = Muros Estructurales
  var tipoSistema = 6;

  for (let i = 0; i < initialData.length; i++) {
    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      formData.lyDF, // lm
      '', // h i
      '', // hm acumulado
      '', // hm
      initialData[i][4], // Vua
      initialData[i][5], // Mua
      '', // Cociente
      '', // Aplica Criterio
      '', // Mnx i
      '', // Mnx/Mua
      '', // Vux
      '', // hm/lm
      '', // αc
      '', // Vcx máx
      '-', // Nu
      '-', // β
      '', // Vcx
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
        'lm',
        'h',
        'hm acumulado',
        'hm',
        'Vua',
        'Mua',
        'Cociente',
        '¿Aplica criterio?',
        'Mny',
        'Mny/Mua',
        'Vuy',
        'hm/lm',
        'αc',
        'Vcy máx',
        'Nu',
        'β',
        'Vcy',
      ],
      [
        '',
        '(m)',
        '(m)',
        '(m)',
        '(m)',
        '(Ton)',
        '(Ton.m)',
        '',
        '',
        '(Ton.m)',
        '',
        '(Ton)',
        '',
        '',
        '(Ton)',
        '(Ton)',
        '',
        '(Ton)',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // 'Nivel',
      { type: 'numeric', readOnly: true }, // 'lm (m)',
      { type: 'numeric' }, // 'h (m)',
      { type: 'numeric', readOnly: true }, // 'hm acumulado (m)',
      { type: 'numeric', readOnly: true }, // 'hm (m)',
      { type: 'numeric', readOnly: true }, // 'Vua (Ton)',
      { type: 'numeric', readOnly: true }, // 'Mua (Ton.m)',
      { type: 'numeric', readOnly: true }, // 'Cociente',
      { type: 'text', readOnly: true }, // '¿Aplica criterio?',
      { type: 'numeric' }, // 'Mny (Ton.m)',
      { type: 'numeric', readOnly: true }, // 'Mny/Mua',
      { type: 'numeric', readOnly: true }, // 'Vuy (Ton)',
      { type: 'numeric', readOnly: true }, // 'hm/lm',
      { type: 'numeric', readOnly: true }, // 'αc',
      { type: 'numeric', readOnly: true }, // 'Vcy máx (Ton)',
      { type: 'numeric' }, // 'Nu (Ton)',
      { type: 'numeric', readOnly: true }, // 'β',
      { type: 'numeric', readOnly: true }, // 'Vcy (Ton)',
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

          if (col === 2) {
            // Valor h -> newValue
            var h = newValue;
            // Valor hm (m)
            var hm = 0;
            for (let i = 0; i < hot.countRows(); i++) {
              hm += hot.getDataAtCell(i, 2);
            }
            if (row == 0) {
              hot.setDataAtCell(row, 4, hm);
              hot.setDataAtCell(row, 3, h);
            } else {
              hot.setDataAtCell(row, 3, h + hot.getDataAtCell(row - 1, 3));
              hot.setDataAtCell(0, 4, hm);
              hot.setDataAtCell(row, 4, hot.getDataAtCell(row - 1, 3) - h);
            }
            // Cociente
            var cociente = 0;
            if (row == 0) {
              cociente = Math.max(
                hot.getDataAtCell(row, 1),
                newValue + hot.getDataAtCell(1, 2),
                0.25 * (hot.getDataAtCell(0, 6) / hot.getDataAtCell(0, 5))
              );
            }
            if (row == 1) {
              cociente = Math.max(
                hot.getDataAtCell(row, 1),
                hot.getDataAtCell(0, 2) + newValue,
                0.25 * (hot.getDataAtCell(0, 6) / hot.getDataAtCell(0, 5))
                /* 0.25 * (hot.getDataAtCell(row, 6) / hot.getDataAtCell(row, 5)) */
              );
            } else {
              cociente = Math.max(
                hot.getDataAtCell(row, 1),
                hot.getDataAtCell(0, 2) + hot.getDataAtCell(1, 2),
                0.25 * (hot.getDataAtCell(0, 6) / hot.getDataAtCell(0, 5))
                /* 0.25 * (hot.getDataAtCell(row, 6) / hot.getDataAtCell(row, 5)) */
              );
            }
            hot.setDataAtCell(row, 7, cociente);
          }

          if (col === 3) {
            if (row + 1 < hot.countRows()) {
              hot.setDataAtCell(
                row + 1,
                3,
                newValue + hot.getDataAtCell(row + 1, 2)
              );
            }
            var fijo = hot.getDataAtCell(0, 3);
            var aplica =
              parseFloat((newValue - fijo).toFixed(2)) <
              hot.getDataAtCell(row, 7)
                ? 'Sí aplica'
                : 'No aplica';
            hot.setDataAtCell(row, 8, aplica);
          }

          if (col === 4) {
            if (row + 1 < hot.countRows()) {
              hot.setDataAtCell(
                row + 1,
                4,
                /* hot.getDataAtCell(row, 3) - hot.getDataAtCell(row + 1, 2) */
                newValue - hot.getDataAtCell(row + 1, 2)
              );
            }
            // Valor hm/lm
            var hmlm = newValue / hot.getDataAtCell(row, 1);
            hot.setDataAtCell(row, 12, hmlm);
          }

          if (col == 7) {
            // Valor Tipo de Muro
            var fijo = hot.getDataAtCell(0, 3);
            var hacum = hot.getDataAtCell(row, 3);
            var aplica =
              parseFloat((hacum - fijo).toFixed(2)) < newValue
                ? 'Sí aplica'
                : 'No aplica';
            hot.setDataAtCell(row, 8, aplica);
          }
          // if(col == 5)
          // if(col == 6)
          if (col == 8) {
            hot.setDataAtCell(
              row,
              11,
              newValue == 'Sí aplica'
                ? hot.getDataAtCell(row, 5) * hot.getDataAtCell(row, 10)
                : hot.getDataAtCell(row, 5)
            );
          }
          if (col == 9) {
            hot.setDataAtCell(
              row,
              10,
              newValue == '-'
                ? '-'
                : Math.min(newValue / hot.getDataAtCell(row, 6), tipoSistema)
            );
          }
          if (col == 10) {
            hot.setDataAtCell(
              row,
              11,
              hot.getDataAtCell(row, 8) == 'Sí aplica'
                ? hot.getDataAtCell(row, 5) * newValue
                : hot.getDataAtCell(row, 5)
            );
          }
          if (col == 12) {
            hot.setDataAtCell(
              row,
              13,
              newValue <= 1.5
                ? 0.8
                : newValue >= 2
                ? 0.53
                : 0.53 - ((0.53 - 0.8) * (2 - newValue)) / (2 - 1.5)
            );
          }
          if (col == 13) {
            hot.setDataAtCell(
              row,
              14,
              formData.acwyDC * Math.sqrt(formData.fcDF) * newValue * 10
            );
          }
          if (col == 14) {
            hot.setDataAtCell(
              row,
              17,
              hot.getDataAtCell(row, 15) == '-'
                ? newValue
                : newValue * hot.getDataAtCell(row, 16)
            );
          }
          if (col == 15) {
            hot.setDataAtCell(
              row,
              16,
              newValue == '-'
                ? '-'
                : 1 -
                    newValue /
                      (35 * formData.eyDF * hot.getDataAtCell(row, 1) * 10)
            );
            hot.setDataAtCell(
              row,
              17,
              newValue == '-'
                ? hot.getDataAtCell(row, 14)
                : hot.getDataAtCell(row, 14) * hot.getDataAtCell(row, 16)
            );
          }
          if (col == 16) {
            hot.setDataAtCell(
              row,
              17,
              newValue == '-'
                ? hot.getDataAtCell(row, 14)
                : hot.getDataAtCell(row, 14) * newValue
            );
          }
        });
        /* CheckData(); */
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
    .getElementById('saveDataBtnDC1Y')
    .addEventListener('click', CheckData);

  function CheckData() {
    var allCellsFilled = true;
    tableData1Y = hot.getData();
    for (var i = 0; i < tableData1Y.length; i++) {
      for (var j = 0; j < tableData1Y[i].length; j++) {
        if (tableData1Y[i][j] === null || tableData1Y[i][j] === '') {
          allCellsFilled = false;
          break;
        }
      }
      if (!allCellsFilled) {
        break;
      }
    }
    if (allCellsFilled) {
      console.log('Datos de la tabla DC T1X:', tableData1Y);
      var cutDesingT2Y = document.getElementById('cutDesingT2Y');
      cutDesignT2Y(cutDesingT2Y, formData);
      //var flexDesingT3X = document.getElementById('flexDesingT3X');
      //flexDesignT3X(flexDesingT3X, tableData, formData);
    } else {
      alert('Hay celdas vacías');
    }
  }
}

//Tabla Análisis en Dirección "2 Y"
export function cutDesignT2Y(contenedor, formData) {
  var container = contenedor;
  var initialData = tableData1Y;
  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var vs = Math.max(
      initialData[i][11] / formData.designDC - initialData[i][17],
      0
    );
    var vsMax =
      2.1 * Math.sqrt(formData.fcDF) * formData.eyDF * formData.dyDF * 10;
    var acv = formData.acwyDC * Math.pow(100, 2);
    var numCapas =
      initialData[i][11] > (0.53 * acv * Math.sqrt(formData.fcDF)) / 1000
        ? 2
        : formData.eyDF > 0.2
        ? 2
        : 1;
    var vuMax =
      0.27 * Math.sqrt(formData.fcDF) * formData.eyDF * formData.dyDF * 10;
    var phmin = initialData[i][11] < vuMax ? 0.002 : 0.0025;
    var ph = Math.max(
      phmin,
      vs / (formData.eyDF * formData.lyDF * formData.fyDF * 10)
    );
    var vsFinal = formData.eyDF * formData.lyDF * ph * formData.fyDF * 10;
    var vn = formData.designDC * (initialData[i][17] + vsFinal);
    var vnMax = formData.acwyDC * Math.sqrt(formData.fcDF) * 2.6 * 10;
    var verifVnMax = vn <= vnMax ? 'Sí cumple' : 'No cumple, verificar';
    var verifResistenciaCortante =
      vn >= initialData[i][11] ? 'Sí cumple' : 'No cumple, verificar';

    var dataRow = [
      `Piso ${i + 1}`,
      vs,
      vsMax,
      vs <= vsMax ? 'Sí cumple' : 'No cumple, verificar',
      acv,
      numCapas,
      vuMax,
      phmin,
      ph,
      vsFinal,
      vn,
      vnMax,
      verifVnMax,
      verifResistenciaCortante,
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
        'Vs',
        'Vs máx',
        'Verificación',
        'Acv',
        'N°',
        'Vu máx',
        'ρh mín',
        'ρh',
        'Vs final',
        'Vn',
        'Vn máx',
        'Verificación',
        'Verificación',
      ],
      [
        '',
        '(Ton)',
        '(Ton)',
        'Cortante del Acero Máximo',
        '(cm²)',
        'Capas',
        '(Ton)',
        '',
        '',
        '(Ton)',
        '(Ton)',
        '(Ton)',
        '"Vn máx"',
        'Resistencia al Cortante',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'text', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });

  document.getElementById('saveDataBtnDC2Y').addEventListener('click', nextTab);

  function nextTab() {
    tableData2Y = hot.getData();
    var cutDesingT3Y = document.getElementById('cutDesingT3Y');
    cutDesignT3Y(cutDesingT3Y, formData);
  }
}

//Tabla Análisis en Dirección "3 x"
export function cutDesignT3Y(contenedor, formData) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < tableData1Y.length; i++) {
    var pvmin = tableData1Y[i][11] < tableData2Y[i][6] ? 0.0015 : 0.0025;
    var pvmax = tableData2Y[i][8];
    var pv = Math.min(
      Math.max(
        0.0025 +
          0.5 * (2.5 - tableData1Y[i][12]) * (tableData2Y[i][8] - 0.0025),
        pvmin
      ),
      pvmax
    );
    var verifCuantia = pv <= pvmax ? 'Sí cumple' : 'No cumple, verificar';
    var areaAcero = 0.71;
    var s =
      Math.ceil(
        (tableData2Y[i][5] * areaAcero) /
          (formData.eyDF * 100 * tableData2Y[i][8]) /
          2.5
      ) * 2.5;
    var s2 =
      Math.ceil(
        (tableData2Y[i][5] * areaAcero) / (formData.eyDF * 100 * pv) / 2.5
      ) * 2.5;
    var smax = Math.min(3 * formData.eyDF * 100, 40);
    var verifEspMax = s < smax ? 'Sí cumple' : 'No cumple, verificar';
    var verifEspMax2 = s2 < smax ? 'Sí cumple' : 'No cumple, verificar';
    var dataRow = [
      `Piso ${i + 1}`,
      pvmin,
      pvmax,
      pv,
      verifCuantia,
      'ø3/8"',
      0.95,
      areaAcero,
      s,
      smax,
      verifEspMax,
      'ø3/8"',
      0.95,
      areaAcero,
      s2,
      smax,
      verifEspMax2,
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
        'ρv mín',
        'ρv máx',
        'ρv',
        'Verificación',
        'Acero',
        'D',
        'Área',
        's',
        'smáx',
        'Distribución de Refuerzo',
        'Acero',
        'D',
        'Área',
        's',
        'smáx',
        'Distribución de Refuerzo',
      ],
      [
        '',
        '',
        '',
        '',
        'Cuantía Vertical Máxima',
        '',
        '(cm)',
        '(cm²)',
        '(cm)',
        '(cm)',
        'Inicial en el Núcleo',
        '',
        '(cm)',
        '(cm²)',
        '(cm)',
        '(cm)',
        'Inicial en el Núcleo',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      {
        type: 'dropdown',
        source: [
          '6 mm',
          '8 mm',
          'ø3/8"',
          '12 mm',
          'ø1/2"',
          'ø5/8"',
          'ø3/4"',
          'ø7/8"',
          'ø1"',
          'ø1 3/8"',
        ],
      },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text' },
      {
        type: 'dropdown',
        source: [
          '6 mm',
          '8 mm',
          'ø3/8"',
          '12 mm',
          'ø1/2"',
          'ø5/8"',
          'ø3/4"',
          'ø7/8"',
          'ø1"',
          'ø1 3/8"',
        ],
      },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
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

          if (col === 5) {
            // Valor Acero -> newValue
            var Acero = newValue;
            var D = 0;
            var area = 0;
            // Valor D (cm)
            if (Acero == '6 mm') {
              D = 0.6;
              area = 0.28;
            } else if (Acero == '8 mm') {
              D = 0.8;
              area = 0.5;
            } else if (Acero == 'ø3/8"') {
              D = 0.95;
              area = 0.71;
            } else if (Acero == '12 mm') {
              D = 1.2;
              area = 1.13;
            } else if (Acero == 'ø1/2"') {
              D = 1.27;
              area = 1.29;
            } else if (Acero == 'ø5/8"') {
              D = 1.59;
              area = 2;
            } else if (Acero == 'ø3/4"') {
              D = 1.9;
              area = 2.84;
            } else if (Acero == 'ø7/8"') {
              D = 2.22;
              area = 3.87;
            } else if (Acero == 'ø1"') {
              D = 2.54;
              area = 5.1;
            } else {
              D = 3.49;
              area = 1.01;
            }
            hot.setDataAtCell(row, 6, D);
            hot.setDataAtCell(row, 7, area);
          }
          if (col == 7) {
            hot.setDataAtCell(
              row,
              8,
              Math.ceil(
                (tableData2Y[row][5] * newValue) /
                  (formData.eyDF * 100 * tableData2Y[row][8]) /
                  2.5
              ) * 2.5
            );
          }
          if (col == 8) {
            hot.setDataAtCell(
              row,
              10,
              newValue <= hot.getDataAtCell(row, 9)
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
          if (col === 11) {
            // Valor Acero -> newValue
            var Acero = newValue;
            var D = 0;
            var area = 0;
            // Valor D (cm)
            if (Acero == '6 mm') {
              D = 0.6;
              area = 0.28;
            } else if (Acero == '8 mm') {
              D = 0.8;
              area = 0.5;
            } else if (Acero == 'ø3/8"') {
              D = 0.95;
              area = 0.71;
            } else if (Acero == '12 mm') {
              D = 1.2;
              area = 1.13;
            } else if (Acero == 'ø1/2"') {
              D = 1.27;
              area = 1.29;
            } else if (Acero == 'ø5/8"') {
              D = 1.59;
              area = 2;
            } else if (Acero == 'ø3/4"') {
              D = 1.9;
              area = 2.84;
            } else if (Acero == 'ø7/8"') {
              D = 2.22;
              area = 3.87;
            } else if (Acero == 'ø1"') {
              D = 2.54;
              area = 5.1;
            } else {
              D = 3.49;
              area = 1.01;
            }
            hot.setDataAtCell(row, 12, D);
            hot.setDataAtCell(row, 13, area);
          }
          if (col == 13) {
            hot.setDataAtCell(
              row,
              14,
              Math.ceil(
                (tableData2Y[row][5] * newValue) /
                  (formData.eyDF * 100 * hot.getDataAtCell(row, 3)) /
                  2.5
              ) * 2.5
            );
          }
          if (col == 14) {
            hot.setDataAtCell(
              row,
              16,
              newValue <= hot.getDataAtCell(row, 15)
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
        });
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  document
    .getElementById('saveDataBtnDC3Y')
    .addEventListener('click', nextTab2);

  function nextTab2() {
    tableData3Y = hot.getData();
    var cutDesingT4Y = document.getElementById('cutDesingT4Y');
    cutDesignT4Y(cutDesingT4Y);
  }
}

//Tabla Análisis en Dirección "3 x"
export function cutDesignT4Y(contenedor) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < tableData1Y.length; i++) {
    var dataRow = [
      `Piso ${i + 1}`,
      tableData2Y[i][5],
      tableData3Y[i][5],
      '@',
      tableData3Y[i][8],
      tableData2Y[i][5],
      tableData3Y[i][11],
      '@',
      tableData3Y[i][14],
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
    colHeaders: [
      'Nivel',
      'Capas',
      'Acero',
      '',
      's (cm)',
      'Capas',
      'Acero',
      '',
      's (cm)',
    ],
    columns: [
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });
}

/* ------------------Draw graph function----------------------- */
export function dibujarLine(
  canva,
  lineas = [
    [100, 1 * 200 + 25],
    [100 + 1 * 200, 1 * 200 + 25 + (2 / 2) * 200],
  ]
) {
  paper.setup(canva);
  // Dibujamos líneas dentro del cuadrado
  for (var i = 0; i < lineas.length; i++) {
    /* var startPoint = new paper.Point(lineas[i][0][0], lineas[i][0][1]); */
    /* var endPoint = new paper.Point(lineas[i][1][0], lineas[i][1][1]) */
    var startPoint = new paper.Point(0, 0);
    var endPoint = new paper.Point(500, 500);
    var line = new paper.Path.Line(startPoint, endPoint);
    line.strokeColor = 'blue';
  }
  paper.view.draw();
}
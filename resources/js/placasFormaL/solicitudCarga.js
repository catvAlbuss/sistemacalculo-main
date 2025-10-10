export var solicitudCargaDT1 = [];
export var solicitudCargaDT2 = [];
export var solicitudCargaDT3 = [];

export function solicitudCargaT1(contenedor) {
  // Datos iniciales para la tabla
  var data = [
    ['Piso 1', '', '', '', '', '', ''],
    // Continúa con los datos para los 20 pisos
  ];

  var container = contenedor;
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
        'Vx Piso',
        'Vx Elemento',
        'Ratio',
        'Verif. de Redundancia',
        'Vy Piso',
        'Vy Elemento',
        'Ratio',
        'Verif. de Redundancia',
      ],
      ['', '(Ton)', '(Ton)', '(Vx)', '(Vx)', '(Ton)', '(Ton)', '(Vy)', '(Vy)'],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      { type: 'numeric' }, // Vx Piso Ton
      { type: 'numeric' }, // Vx Elemento Ton
      { type: 'numeric', readOnly: true }, // Ratio (Vx)
      { type: 'text', readOnly: true }, // Verificación de Redundancia (Vx)
      { type: 'numeric' }, // Vy Piso Ton
      { type: 'numeric' }, // Vy Elemento Ton
      { type: 'numeric', readOnly: true }, // Ratio (Vy)
      { type: 'text', readOnly: true }, // Verificación de Redundancia (Vy)
    ],
    minSpareRows: 1, // Permite agregar nuevas filas al final
    // enable the plugin with the default configuration
    /* copyPaste: true,
    pasteMode: 'overwrite', */
    beforePaste: function (data, coords) {
      // Determinar el número de filas que se generarán al pegar los datos
      var totalRowsToPaste = data.length + coords[0].startRow;
      if (hot.countRows < totalRowsToPaste) {
        // Agregar las filas necesarias para acomodar los datos pegados
        hot.alter(
          'insert_row_above',
          totalRowsToPaste - hot.countRows(),
          data.length
        );
      }
    },
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        changes.forEach(function (change) {
          /* console.log(change) Devuelve un array con 4 valores, row, col, oldValue, newValue */
          var row = change[0];
          var col = change[1];
          /* var oldValue = change[2];
          var newValue = change[3]; */

          if (col === 1 || col === 2) {
            // Verificar cambios en las columnas de carga
            // Calcular el ratio
            var vxPiso = hot.getDataAtCell(row, 1);
            var vxElemento = hot.getDataAtCell(row, 2);
            var ratioVx = vxElemento !== 0 ? vxElemento / vxPiso : 0; // Evitar división por cero
            hot.setDataAtCell(row, 3, ratioVx.toFixed(2));

            // Verificar la redundancia para Vx
            var redundanciaVx =
              ratioVx >= 0.3
                ? 'Diseñar para el 125% del Sismo'
                : 'No Diseñar para el 125% del Sismo';
            hot.setDataAtCell(row, 4, redundanciaVx);
          }
          if (col === 5 || col === 6) {
            // Calcular el ratio para Vy
            var vyPiso = hot.getDataAtCell(row, 5);
            var vyElemento = hot.getDataAtCell(row, 6);
            var ratioVy = vyElemento !== 0 ? vyElemento / vyPiso : 0; // Evitar división por cero
            hot.setDataAtCell(row, 7, ratioVy.toFixed(2));

            // Verificar la redundancia para Vy
            var redundanciaVy =
              ratioVy >= 0.3
                ? 'Diseñar para el 125% del Sismo'
                : 'No Diseñar para el 125% del Sismo';
            hot.setDataAtCell(row, 8, redundanciaVy);
          }
        });
      }
    },
    afterPaste: function (data, coords) {
      var totalRowsToPaste = data.length + coords[0].startRow;
      var rowAmount = hot.countRows() - 1;
      //console.log(rowAmount)
      if (rowAmount < totalRowsToPaste) {
        for (var i = coords[0].startRow; i < totalRowsToPaste; i++) {
          var floorNumber = i + 1;
          hot.setDataAtCell(i, 0, 'Piso ' + floorNumber);
        }
      }
      console.log(data); /* array de filas */
      console.log(coords); /* array con coordenadas de inicio y fin (col-row)*/
      data.forEach(function (rowData, i) {
        /* console.log(rowData);
        console.log(coords); */
        var startRow = coords[0].startRow;
        var endRow = coords[0].endRow;
        var startCol = coords[0].startCol;
        var endCol = coords[0].endCol;
        // Datos pegado solo en una columna
        var singleColumn = startCol === endCol;

        if (singleColumn) {
          // Columnas Vx
          if (startCol === 1 || startCol === 2) {
            calculateAndSetValues(startRow + i, rowData, startCol);
            // Columnas Vy
          } else if (startCol === 5 || startCol === 6) {
            calculateAndSetValues(startRow + i, rowData, startCol);
          }
        } else {
          calculateAndSetValues(startRow + i, rowData, startCol, endCol);
        }
      });
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  function calculateAndSetValues(row, rowData, startCol, endCol = 0) {
    // No es necesario calcular, al asignar un valor a la celda
    // se detecta como cambio y el hook afterChange realiza las operaciones
    if (endCol === 0) {
      hot.setDataAtCell(row, startCol, rowData[0]);
    } else {
      hot.setDataAtCell(row, startCol, rowData[0]);
      hot.setDataAtCell(row, endCol, rowData[1]);
    }
  }

  document.getElementById('saveDataBtn1').addEventListener('click', saveData);

  function saveData() {
    // Obtener los datos de la tabla
    solicitudCargaDT1 = hot.getData();

    // Aquí puedes realizar alguna acción con los datos, como enviarlos al servidor o guardarlos en el almacenamiento local
    console.log('Datos de la tabla 1:', solicitudCargaDT1);
    if (solicitudCargaDT1.length > 1) {
      var contenedor2 = document.getElementById('solicitudCargaT2');
      solicitudCargaDT1.pop();
      solicitudCargaT2(contenedor2, solicitudCargaDT1.length);
    }
  }
}

export function solicitudCargaT2(contenedor, filas) {
  var container = contenedor;
  var data = [];

  for (let i = 1; i <= filas; i++) {
    var dataRow = [
      [i, 'PL-01', '1.40CM+1.70CV'],
      [i, 'PL-01', '1.25(CM+CV)+CSx Max'],
      [i, 'PL-01', '1.25(CM+CV)+CSx Min'],
      [i, 'PL-01', '1.25(CM+CV)+CSy Max'],
      [i, 'PL-01', '1.25(CM+CV)+CSy Min'],
      [i, 'PL-01', '1.25(CM+CV)-CSx Max'],
      [i, 'PL-01', '1.25(CM+CV)-CSx Min'],
      [i, 'PL-01', '1.25(CM+CV)-CSy Max'],
      [i, 'PL-01', '1.25(CM+CV)-CSy Min'],
      [i, 'PL-01', '0.90CM+CSx Max'],
      [i, 'PL-01', '0.90CM+CSx Min'],
      [i, 'PL-01', '0.90CM+CSy Max'],
      [i, 'PL-01', '0.90CM+CSy Min'],
      [i, 'PL-01', '0.90CM-CSx Max'],
      [i, 'PL-01', '0.90CM-CSx Min'],
      [i, 'PL-01', '0.90CM-CSy Max'],
      [i, 'PL-01', '0.90CM-CSy Min'],
    ];
    dataRow.map((row) => data.push(row));
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
        'Piso',
        'Placa',
        'Combinaciones',
        'Pu',
        'V2',
        'V3',
        'T',
        'M2',
        'M3 ',
        'Pux',
        'Vux',
        'Mux',
        'Puy',
        'Vuy',
        'Muy',
      ],
      [
        '',
        '',
        'Carga',
        '(Ton)',
        '(Ton)',
        '(Ton)',
        '(Ton.m)',
        '(Ton.m)',
        '(Ton.m)',
        '(Ton)',
        '(Ton)',
        '(Ton.m)',
        '(Ton)',
        '(Ton)',
        '(Ton.m)',
      ],
    ],
    columns: [
      { type: 'text' }, // Piso
      { type: 'text', readOnly: true }, // Placa
      { type: 'text' }, // Combinaciones de Carga
      { type: 'numeric' }, // Pu (Ton)
      { type: 'numeric' }, // 'V2 (Ton)'
      { type: 'numeric' }, // 'V3 (Ton)'
      { type: 'numeric' }, // 'T (Ton.m)'
      { type: 'numeric' }, // 'M2 (Ton.m)'
      { type: 'numeric' }, // 'M3 (Ton.m)'
      { type: 'numeric', readOnly: true }, // 'Pux (Ton)'
      { type: 'numeric', readOnly: true }, // 'Vux (Ton)'
      { type: 'numeric', readOnly: true }, // 'Mux (Ton.m)'
      { type: 'numeric', readOnly: true }, // 'Puy (Ton)'
      { type: 'numeric', readOnly: true }, // 'Vuy (Ton)'
      { type: 'numeric', readOnly: true }, // 'Muy (Ton.m)'
    ],
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        changes.forEach(function (change) {
          /* console.log(change) Devuelve un array con 4 valores, row, col, oldValue, newValue */
          var row = change[0];
          var col = change[1];
          /* var oldValue = change[2];
          var newValue = change[3]; */

          if (col === 3) {
            hot.setDataAtCell(row, 9, -hot.getDataAtCell(row, col));
            hot.setDataAtCell(row, 12, -hot.getDataAtCell(row, col));
          }

          if (col === 4) {
            hot.setDataAtCell(row, 10, hot.getDataAtCell(row, col));
          }

          if (col === 5) {
            hot.setDataAtCell(row, 13, hot.getDataAtCell(row, col));
          }

          if (col === 6) {
            //hot.setDataAtCell(row, 13, hot.getDataAtCell(row, col));
          }

          if (col === 7) {
            hot.setDataAtCell(row, 14, hot.getDataAtCell(row, col));
          }

          if (col === 8) {
            hot.setDataAtCell(row, 11, hot.getDataAtCell(row, col));
          }
        });
      }
    },
    afterPaste: function (data, coords) {
      //console.log(data); /* array de filas */
      //console.log(coords); /* array con coordenadas de inicio y fin (col-row)*/
      data.forEach(function (rowData, i) {
        /* console.log(rowData);
        console.log(coords); */
        var startRow = coords[0].startRow;
        var endRow = coords[0].endRow;
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
    licenseKey: 'non-commercial-and-evaluation',
  });

  document.getElementById('saveDataBtn2').addEventListener('click', saveDataT2);

  function saveDataT2() {
    // Obtener los datos de la tabla
    solicitudCargaDT2 = hot.getData();

    solicitudCargaDT2 = solicitudCargaDT2.map((row) => row.slice(-6));
    // extractedValues will contain the values from index 9 to index 14 of the original array

    // Aquí puedes realizar alguna acción con los datos, como enviarlos al servidor o guardarlos en el almacenamiento local
    //console.log('Datos de la tabla 2:', solicitudCargaDT2);
    var contenedor3 = document.getElementById('solicitudCargaT3');

    solicitudCargaT3(contenedor3, solicitudCargaDT2, solicitudCargaDT2.length);
  }
}

export function solicitudCargaT3(contenedor, initialData) {
  var container = contenedor;
  var data = [];
  var puMax = 0;
  var vuxMax = 0;
  var muxMax = 0;
  var vuyMax = 0;
  var muyMax = 0;
  initialData.map((row, i) => {
    puMax = Math.max(puMax, row[0]);
    vuxMax = Math.max(vuxMax, row[1]);
    muxMax = Math.max(muxMax, row[2]);
    vuyMax = Math.max(vuyMax, row[4]);
    muyMax = Math.max(muyMax, row[5]);
    if ((i + 1) % 17 == 0) {
      var dataRow = [];
      dataRow.push('Piso ' + (i + 1) / 17);
      dataRow.push(puMax);
      dataRow.push(vuxMax);
      dataRow.push(muxMax);
      dataRow.push(vuyMax);
      dataRow.push(muyMax);
      console.log(dataRow);
      data.push(dataRow);
      puMax = 0;
      vuxMax = 0;
      muxMax = 0;
      vuyMax = 0;
      muyMax = 0;
    }
  });

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [
      ['Nivel', 'Pu máx', 'Vux máx', 'Mux máx', 'Vuy máx', 'Muy máx'],
      ['', '(Ton)', '(Ton)', '(Ton.m)', '(Ton)', '(Ton.m)'],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      { type: 'numeric', readOnly: true }, // Pu máx (Ton)
      { type: 'numeric', readOnly: true }, // Vux máx (Ton)
      { type: 'numeric', readOnly: true }, // Mux máx (Ton)
      { type: 'numeric', readOnly: true }, // Vuy máx (Ton)
      { type: 'numeric', readOnly: true }, // Muy máx (Ton.m)
    ],

    licenseKey: 'non-commercial-and-evaluation',
  });

  //document.getElementById('saveDataBtn3').addEventListener('click', saveDataT3);

  function saveDataT3() {
    // Obtener los datos de la tabla
    solicitudCargaDT3 = hot.getData();

    // Aquí puedes realizar alguna acción con los datos, como enviarlos al servidor o guardarlos en el almacenamiento local
    console.log('Datos de la tabla 3:', solicitudCargaDT3);
  }
  setTimeout(saveDataT3, 1000);
}
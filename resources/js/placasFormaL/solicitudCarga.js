export var solicitudCargaDT1 = [];
export var solicitudCargaDT2 = [];
export var solicitudCargaDT3 = [];

export function solicitudCargaT1(contenedor) {
  if (!contenedor) return;
  
  var data = [
    ['Piso 1', '', '', '', '', '', ''],
  ];

  var container = contenedor;
  container.innerHTML = '';

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: [90, 90, 90, 90, 150, 90, 90, 90, 150],

    // === OPTIMIZACIONES ===
    renderAllRows: false,
    renderAllColumns: true,
    viewportRowRenderingOffset: 15,
    viewportColumnRenderingOffset: 15,
    sanitizer: (content) => content,
    // ======================

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
      { type: 'text', readOnly: true },   // Nivel
      { type: 'numeric' },                // Vx Piso Ton
      { type: 'numeric' },                // Vx Elemento Ton
      { type: 'numeric', readOnly: true },// Ratio (Vx)
      { type: 'text', readOnly: true },   // Verificación de Redundancia (Vx)
      { type: 'numeric' },                // Vy Piso Ton
      { type: 'numeric' },                // Vy Elemento Ton
      { type: 'numeric', readOnly: true },// Ratio (Vy)
      { type: 'text', readOnly: true },   // Verificación de Redundancia (Vy)
    ],
    minSpareRows: 1,

    beforePaste: function (data, coords) {
      var totalRowsToPaste = data.length + coords[0].startRow;
      if (hot.countRows() < totalRowsToPaste) {
        hot.alter(
          'insert_row_above',
          totalRowsToPaste - hot.countRows(),
          data.length
        );
      }
    },

    afterChange: function (changes, source) {
      if (source === 'edit' || source === 'paste') {
        var hot = this;
        var updates = [];

        changes.forEach(function (change) {
          var row = change[0];
          var col = change[1];

          if (col === 1 || col === 2) {
            var vxPiso     = hot.getDataAtCell(row, 1);
            var vxElemento = hot.getDataAtCell(row, 2);
            var ratioVx    = (vxPiso !== 0 && vxPiso !== null)
              ? vxElemento / vxPiso
              : 0;
            var redundanciaVx = ratioVx >= 0.3
              ? 'Diseñar para el 125% del Sismo'
              : 'No Diseñar para el 125% del Sismo';

            updates.push([row, 3, parseFloat(ratioVx.toFixed(2))]);
            updates.push([row, 4, redundanciaVx]);
          }

          if (col === 5 || col === 6) {
            var vyPiso     = hot.getDataAtCell(row, 5);
            var vyElemento = hot.getDataAtCell(row, 6);
            var ratioVy    = (vyPiso !== 0 && vyPiso !== null)
              ? vyElemento / vyPiso
              : 0;
            var redundanciaVy = ratioVy >= 0.3
              ? 'Diseñar para el 125% del Sismo'
              : 'No Diseñar para el 125% del Sismo';

            updates.push([row, 7, parseFloat(ratioVy.toFixed(2))]);
            updates.push([row, 8, redundanciaVy]);
          }
        });

        if (updates.length > 0) {
          hot.setDataAtCell(updates, 'internal');
        }
      }
    },

    afterPaste: function (data, coords) {
      var hot = this;
      var startRow = coords[0].startRow;
      var startCol = coords[0].startCol;

      hot.suspendRender();
      try {
        hot.populateFromArray(startRow, startCol, data, null, null, 'paste');
        
        var allData = hot.getData();
        var floorUpdates = [];
        
        // Contar solo las filas que tienen datos en la columna 0 (Nivel)
        var dataRowCount = 0;
        for (var i = 0; i < allData.length; i++) {
          // Si la fila tiene al menos un valor en cualquier columna, cuenta como una fila con datos
          var hasData = false;
          for (var j = 0; j < allData[i].length; j++) {
            if (allData[i][j] !== null && allData[i][j] !== '' && allData[i][j] !== undefined) {
              hasData = true;
              break;
            }
          }
          
          if (hasData) {
            floorUpdates.push([i, 0, 'Piso ' + (dataRowCount + 1)]);
            dataRowCount++;
          }
        }
        
        if (floorUpdates.length > 0) {
          hot.setDataAtCell(floorUpdates);
        }
      } finally {
        hot.resumeRender();
      }
    },

    licenseKey: 'non-commercial-and-evaluation',
  });

  setTimeout(() => {
    hot.render();
  }, 100);

  document.getElementById('saveDataBtn1').addEventListener('click', saveData);

  function saveData() {
    var allData = hot.getData();
    console.log('Raw data from table:', allData);
    var pisoData = [];
    for (var i = 0; i < allData.length; i++) {
      if (allData[i] && allData[i][0] && String(allData[i][0]).trim() !== '') {
        pisoData.push(allData[i]);
      }
    }
    console.log('Filtered pisoData:', pisoData);
    console.log('Cantidad de pisos:', pisoData.length);
    if (pisoData.length >= 1) {
      var contenedor2 = document.getElementById('solicitudCargaT2');
      solicitudCargaDT1 = pisoData;
      solicitudCargaT2(contenedor2, pisoData);
    }
  }
}

export function solicitudCargaT2(contenedor, pisoData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';
  var data = [];

  // Usar el pisoData que viene de la tabla 1 para obtener los nombres de los pisos
  for (let i = 0; i < pisoData.length; i++) {
    var pisoName = pisoData[i][0] || ('Piso ' + (i + 1)); // Extraer el nombre del piso de la primera columna
    var dataRow = [
      [pisoName, 'PL-01', '1.40CM+1.70CV'],
      [pisoName, 'PL-01', '1.25(CM+CV)+CSx Max'],
      [pisoName, 'PL-01', '1.25(CM+CV)+CSx Min'],
      [pisoName, 'PL-01', '1.25(CM+CV)+CSy Max'],
      [pisoName, 'PL-01', '1.25(CM+CV)+CSy Min'],
      [pisoName, 'PL-01', '1.25(CM+CV)-CSx Max'],
      [pisoName, 'PL-01', '1.25(CM+CV)-CSx Min'],
      [pisoName, 'PL-01', '1.25(CM+CV)-CSy Max'],
      [pisoName, 'PL-01', '1.25(CM+CV)-CSy Min'],
      [pisoName, 'PL-01', '0.90CM+CSx Max'],
      [pisoName, 'PL-01', '0.90CM+CSx Min'],
      [pisoName, 'PL-01', '0.90CM+CSy Max'],
      [pisoName, 'PL-01', '0.90CM+CSy Min'],
      [pisoName, 'PL-01', '0.90CM-CSx Max'],
      [pisoName, 'PL-01', '0.90CM-CSx Min'],
      [pisoName, 'PL-01', '0.90CM-CSy Max'],
      [pisoName, 'PL-01', '0.90CM-CSy Min'],
    ];
    dataRow.map((row) => data.push(row));
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: [70, 90, 220, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90],

    renderAllRows: false,
    renderAllColumns: true,
    viewportRowRenderingOffset: 15,
    viewportColumnRenderingOffset: 15,
    sanitizer: (content) => content,

    nestedHeaders: [
      [
        'Piso',         // Columna 1
        'Placa',        // Columna 2
        'Combinaciones',// Columna 3
        'Pu',           // Columna 4
        'V2',           // Columna 5
        'V3',           // Columna 6
        'T',            // Columna 7
        'M2',           // Columna 8
        'M3 ',          // Columna 9
        'Pux',          // Columna 10
        'Vux',          // Columna 11
        'Mux',          // Columna 12
        'Puy',          // Columna 13
        'Vuy',          // Columna 14
        'Muy',          // Columna 15
      ],
      [
        '',          // Columna 1
        '',          // Columna 2
        'Carga',     // Columna 3
        '(Ton)',     // Columna 4
        '(Ton)',     // Columna 5
        '(Ton)',     // Columna 6
        '(Ton.m)',   // Columna 7
        '(Ton.m)',   // Columna 8
        '(Ton.m)',   // Columna 9
        '(Ton)',     // Columna 10
        '(Ton)',     // Columna 11
        '(Ton.m)',   // Columna 12
        '(Ton)',     // Columna 13
        '(Ton)',     // Columna 14
        '(Ton.m)',   // Columna 15
      ],
    ],
    columns: [
      { type: 'text' },                   // Piso
      { type: 'text', readOnly: true },   // Placa
      { type: 'text' },                   // Combinaciones de Carga
      { type: 'numeric' },                // Pu (Ton)
      { type: 'numeric' },                // V2 (Ton)
      { type: 'numeric' },                // V3 (Ton)
      { type: 'numeric' },                // T (Ton.m)
      { type: 'numeric' },                // M2 (Ton.m)
      { type: 'numeric' },                // M3 (Ton.m)
      { type: 'numeric', readOnly: true },// Pux (Ton)
      { type: 'numeric', readOnly: true },// Vux (Ton)
      { type: 'numeric', readOnly: true },// Mux (Ton.m)
      { type: 'numeric', readOnly: true },// Puy (Ton)
      { type: 'numeric', readOnly: true },// Vuy (Ton)
      { type: 'numeric', readOnly: true },// Muy (Ton.m)
    ],

    afterChange: function (changes, source) {
      if (source === 'edit' || source === 'paste') {
        var hot = this;
        var updates = [];

        changes.forEach(function (change) {
          var row      = change[0];
          var col      = change[1];
          var newValue = change[3];

          if (col === 3) {
            updates.push([row, 9,  newValue !== null ? -newValue : null]);
            updates.push([row, 12, newValue !== null ? -newValue : null]);
          }
          if (col === 4) {
            updates.push([row, 10, newValue]);
          }
          if (col === 5) {
            updates.push([row, 13, newValue]);
          }
          if (col === 7) {
            updates.push([row, 14, newValue]);
          }
          if (col === 8) {
            updates.push([row, 11, newValue]);
          }
        });

        if (updates.length > 0) {
          hot.setDataAtCell(updates, 'internal');
        }
      }
    },

    afterPaste: function (data, coords) {
      var hot       = this;
      var startRow  = coords[0].startRow;
      var startCol  = coords[0].startCol;

      hot.suspendRender();
      try {
        hot.populateFromArray(
          startRow, startCol, data, null, null, 'paste'
        );
      } finally {
        hot.resumeRender();
      }
    },

    licenseKey: 'non-commercial-and-evaluation',
  });

  document.getElementById('saveDataBtn2').addEventListener('click', saveDataT2);

  function saveDataT2() {
    var allData = hot.getData();
    var pisoData = [];
    for (var i = 0; i < allData.length; i++) {
      if (allData[i] && allData[i][0] && String(allData[i][0]).trim() !== '') {
        pisoData.push(allData[i]);
      }
    }
    console.log('Filtered pisoData T2:', pisoData);
    solicitudCargaDT2 = pisoData.map((row) => row.slice(-6));
    var contenedor3 = document.getElementById('solicitudCargaT3');
    solicitudCargaT3(contenedor3, solicitudCargaDT2, solicitudCargaDT2.length);
  }
}

export function solicitudCargaT3(contenedor, initialData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';
  var data      = [];
  var puMax     = 0;
  var vuxMax    = 0;
  var muxMax    = 0;
  var vuyMax    = 0;
  var muyMax    = 0;
  var pisoCount = 0;
  var rowCount  = 0;

  initialData.map((row, i) => {
    puMax  = Math.max(puMax,  row[0]);
    vuxMax = Math.max(vuxMax, row[1]);
    muxMax = Math.max(muxMax, row[2]);
    vuyMax = Math.max(vuyMax, row[4]);
    muyMax = Math.max(muyMax, row[5]);

    rowCount++;

    // Cada piso tiene 17 combinaciones de carga
    if (rowCount % 17 == 0) {
      pisoCount++;
      var dataRow = [];
      dataRow.push('Piso ' + pisoCount);
      dataRow.push(puMax);
      dataRow.push(vuxMax);
      dataRow.push(muxMax);
      dataRow.push(vuyMax);
      dataRow.push(muyMax);
      console.log(dataRow);
      data.push(dataRow);
      puMax  = 0;
      vuxMax = 0;
      muxMax = 0;
      vuyMax = 0;
      muyMax = 0;
    }
  });

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: [90, 90, 90, 90, 90, 90],

    renderAllRows: false,
    renderAllColumns: true,
    viewportRowRenderingOffset: 15,
    viewportColumnRenderingOffset: 15,
    sanitizer: (content) => content,

    nestedHeaders: [
      ['Nivel', 'Pu máx', 'Vux máx', 'Mux máx', 'Vuy máx', 'Muy máx'],
      ['', '(Ton)', '(Ton)', '(Ton.m)', '(Ton)', '(Ton.m)'],
    ],
    columns: [
      { type: 'text',    readOnly: true }, // Nivel
      { type: 'numeric', readOnly: true }, // Pu máx (Ton)
      { type: 'numeric', readOnly: true }, // Vux máx (Ton)
      { type: 'numeric', readOnly: true }, // Mux máx (Ton)
      { type: 'numeric', readOnly: true }, // Vuy máx (Ton)
      { type: 'numeric', readOnly: true }, // Muy máx (Ton.m)
    ],

    licenseKey: 'non-commercial-and-evaluation',
  });

  function saveDataT3() {
    solicitudCargaDT3 = hot.getData();
    console.log('Datos de la tabla 3:', solicitudCargaDT3);
  }
  setTimeout(saveDataT3, 1000);
}
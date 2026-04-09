export function formDisplay() {
  // Obtener el botón y el contenedor
  const toggleButton = document.getElementById('toggleButton');
  const contenedor_dcc = document.getElementById('contenedor_dcc');
  //obtener el boton de calculos de cargas
  const buttoneyes = document.getElementById('calccargars');
  const contenedorCC = document.getElementById('contenedor_cc');

  // Agregar un evento de clic al botón
  toggleButton.addEventListener('click', function () {
    // Alternar la visibilidad del contenedor
    contenedor_dcc.style.display =
      contenedor_dcc.style.display === 'block' ? 'none' : 'block';

    // Cambiar el ícono del botón
    const icon = toggleButton.querySelector('i');
    if (contenedor_dcc.style.display === 'block') {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    } else {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  });
  // agregar evento de clic al botón calcular cargas
  buttoneyes.addEventListener('click', function () {
    // Alternar la visibilidad del contenedor
    contenedorCC.style.display =
      contenedorCC.style.display === 'block' ? 'none' : 'block';

    // Cambiar el ícono del botón
    const icon = buttoneyes.querySelector('i');
    if (contenedorCC.style.display === 'block') {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    } else {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  });
}

export var dataTable2x = [];
export var dataTable2y = [];

var dataTable1x = [];
/* var allCellsFilledT1X = true; */
//Tabla Análisis en Dirección "x"
export function flexDesignT1X(contenedor, initialData, formData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var dataRow = [
      `Piso ${i + 1}`,
      formData.lxDF,
      '',
      '',
      '',
      '',
      '',
      initialData[i][3],
      '',
      '',
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: [90, 90, 90, 90, 150, 90, 90, 90, 150, 150],
    // === OPTIMIZACIONES ===
    renderAllRows: false,
    viewportRowRenderingOffset: 15,
    // ======================
    nestedHeaders: [
      ['Nivel', 'lm', 'h', 'hm', 'hm/lm', 'Tipo de', 'Tipo de', 'Mu', 'z', 'As'],
      [
        '',
        '(m)',
        '(m)',
        '(m)',
        '',
        'Muro',
        'Falla Muro',
        '(Ton.m)',
        '(m)',
        '(cm²)',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Piso
      { type: 'numeric', readOnly: true }, // lm (m)
      { type: 'numeric' }, // h (m)
      { type: 'numeric', readOnly: true }, // hm
      { type: 'numeric', readOnly: true }, // hm/lm
      { type: 'text', readOnly: true }, // Tipo de Muro
      { type: 'text', readOnly: true }, // Tipo de Falla Muro
      { type: 'numeric', readOnly: true }, // Mu (Ton.m)
      { type: 'numeric', readOnly: true }, // z (m)
      { type: 'numeric', readOnly: true }, // As (cm²)
    ],
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        hot.suspendRender(); // SUSPENDER RENDER PARA EDICIÓN RÁPIDA
        try {
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
                hot.setDataAtCell(row, 3, hm);
              } else {
                hot.setDataAtCell(0, 3, hm);
                hot.setDataAtCell(row, 3, hot.getDataAtCell(row - 1, 3) - h);
              }
            }

            if (col === 3) {
              if (row + 1 < hot.countRows()) {
                hot.setDataAtCell(
                  row + 1,
                  3,
                  hot.getDataAtCell(row, 3) - hot.getDataAtCell(row + 1, 2)
                );
              }
              // Valor hm/lm
              var hmlm = newValue / hot.getDataAtCell(row, 1);
              hot.setDataAtCell(row, 4, hmlm);
            }

            if (col == 4) {
              // Valor Tipo de Muro
              var tipoMuro = newValue > 1 ? 'Muro Esbelto' : 'Muro No Esbelto';
              hot.setDataAtCell(row, 5, tipoMuro);
              // Valor TIpo de Falla Muro
              var tipoFallaMuro = newValue > 1 ? 'Por Flexión' : 'Por Corte';
              hot.setDataAtCell(row, 6, tipoFallaMuro);
              // valor Z
              var z = 0;
              if (newValue > 1) {
                z = 0.9 * hot.getDataAtCell(row, 1);
              } else if (0.5 <= newValue && newValue <= 1) {
                z = 0.4 * hot.getDataAtCell(row, 1) * (1 + newValue);
              } else {
                z = 1.2 * hot.getDataAtCell(row, 2);
              }
              hot.setDataAtCell(row, 8, z);
            }
            // if(col == 5)
            // if(col == 6)
            if (col == 7) {
              // Valor As
              var As =
                (newValue * Math.pow(10, 5)) /
                (formData.designDF *
                  formData.fyDF *
                  hot.getDataAtCell(row, 8) *
                  100);
              hot.setDataAtCell(row, 9, As);
            }
            if (col == 8) {
              // Valor As
              var As =
                (hot.getDataAtCell(row, 7) * Math.pow(10, 5)) /
                (formData.designDF * formData.fyDF * newValue * 100);
              hot.setDataAtCell(row, 9, As);
            }
          });
        } finally {
          hot.resumeRender(); // REANUDAR RENDER
        }
        /* CheckData(); */
      }
    },
    afterPaste: function (data, coords) {
      var hot = this;
      var startRow = coords[0].startRow;
      var startCol = coords[0].startCol;
      hot.suspendRender();
      try {
        hot.populateFromArray(startRow, startCol, data, null, null, 'paste');
      } finally {
        hot.resumeRender();
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  document
    .getElementById('saveDataBtnDF1X')
    .addEventListener('click', CheckData);

  function CheckData() {
    var allCellsFilled = true;
    dataTable1x = hot.getData();
    for (var i = 0; i < dataTable1x.length; i++) {
      for (var j = 0; j < dataTable1x[i].length; j++) {
        if (dataTable1x[i][j] === null || dataTable1x[i][j] === '') {
          allCellsFilled = false;
          break;
        }
      }
      if (!allCellsFilled) {
        break;
      }
    }
    if (allCellsFilled) {
      console.log('Datos de la tabla T1X:', dataTable1x);
      var flexDesingT2X = document.getElementById('flexDesingT2X');
      flexDesignT2X(flexDesingT2X, dataTable1x);
      var flexDesingT3X = document.getElementById('flexDesingT3X');
      flexDesignT3X(flexDesingT3X, dataTable1x, formData);
    } else {
      alert('Hay celdas vacías');
    }
  }
}

//Tabla Análisis en Dirección "2 x"
export function flexDesignT2X(contenedor, initialData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var dataRow = [
      `Piso ${i + 1}`,
      'ø3/4"',
      1.9,
      2.84,
      30,
      0,
      0,
      0,
      0,
      0,
      'No Cumple, verificar',
      '18ø5/8"',
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: [90, 90, 90, 90, 90, 90, 90, 90, 90, 120, 150, 200],
    // === OPTIMIZACIONES ===
    renderAllRows: false,
    viewportRowRenderingOffset: 15,
    // ======================
    nestedHeaders: [
      [
        'Nivel',
        'Acero',
        'D',
        'Área',
        'N°',
        'Ø1/2"',
        'Ø5/8"',
        'Ø3/4"',
        'Ø1"',
        'Ascolocado',
        'Verificación',
        'Distribución de Refuerzo',
      ],
      [
        '',
        '',
        '(cm)',
        '(cm²)',
        'Acero',
        '',
        '',
        '',
        '',
        '(cm²)',
        'Acero Colocado',
        'Final en la Zona de Confinamiento',
      ],
    ],
    columns: [
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
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'text', readOnly: true },
    ],
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        hot.suspendRender();
        try {
          changes.forEach(function (change) {
            /* console.log(change) Devuelve un array con 4 valores, row, col, oldValue, newValue */
            var row = change[0];
            var col = change[1];
            //var oldValue = change[2];
            var newValue = change[3];

            if (col === 1) {
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
              hot.setDataAtCell(row, 2, D);
              hot.setDataAtCell(row, 3, area);
            }
            if (col == 3) {
              var amountIron = Math.ceil(initialData[row][9] / newValue);
              hot.setDataAtCell(row, 4, amountIron);
            }
            if (col == 5) {
              hot.setDataAtCell(
                row,
                9,
                1.267 * newValue +
                1.979 * hot.getDataAtCell(row, 6) +
                2.85 * hot.getDataAtCell(row, 7) +
                5.067 * hot.getDataAtCell(row, 8)
              );
              if (newValue != 0) hot.setDataAtCell(row, 11, `${newValue}Ø1/2"`);
            }
            if (col == 6) {
              hot.setDataAtCell(
                row,
                9,
                1.267 * hot.getDataAtCell(row, 5) +
                1.979 * newValue +
                2.85 * hot.getDataAtCell(row, 7) +
                5.067 * hot.getDataAtCell(row, 8)
              );
              if (newValue != 0) hot.setDataAtCell(row, 11, `${newValue}Ø5/8"`);
            }
            if (col == 7) {
              hot.setDataAtCell(
                row,
                9,
                1.267 * hot.getDataAtCell(row, 5) +
                1.979 * hot.getDataAtCell(row, 6) +
                2.85 * newValue +
                5.067 * hot.getDataAtCell(row, 8)
              );
              if (newValue != 0) hot.setDataAtCell(row, 11, `${newValue}Ø3/4"`);
            }
            if (col == 8) {
              hot.setDataAtCell(
                row,
                9,
                1.267 * hot.getDataAtCell(row, 5) +
                1.979 * hot.getDataAtCell(row, 6) +
                2.85 * hot.getDataAtCell(row, 7) +
                5.067 * newValue
              );
              if (newValue != 0) hot.setDataAtCell(row, 11, `${newValue}Ø1"`);
            }
            if (col == 9) {
              var verifAcero =
                hot.getDataAtCell(row, 9) > initialData[row][9]
                  ? 'Sí cumple'
                  : 'No cumple, verificar';
              hot.setDataAtCell(row, 10, verifAcero);
            }
            // if(col==10)
            // if(col==11)
          });
        } finally {
          hot.resumeRender();
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
      } finally {
        hot.resumeRender();
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  document
    .getElementById('saveDataBtnDF2X')
    .addEventListener('click', CheckData);

  function CheckData() {
    var allCellsFilled = true;
    dataTable2x = hot.getData();
    for (var i = 0; i < dataTable2x.length; i++) {
      for (var j = 0; j < dataTable2x[i].length; j++) {
        if (dataTable2x[i][j] === null || dataTable2x[i][j] === '') {
          allCellsFilled = false;
          break;
        }
      }
      if (!allCellsFilled) {
        break;
      }
    }
    if (allCellsFilled) {
      alert('Guardado');
    }
    /* if (allCellsFilled) {
      console.log('Datos de la tabla T1X:', tableData);
      var flexDesingT2X = document.getElementById('flexDesingT2X');
      flexDesignT2X(flexDesingT2X, tableData);
      var flexDesingT3X = document.getElementById('flexDesingT3X');
      flexDesignT3X(flexDesingT3X, tableData, formData);
    } else {
      alert('Hay celdas vacías');
    } */
  }
}

//Tabla Análisis en Dirección "3 x"
export function flexDesignT3X(contenedor, initialData, formData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var emin = parseFloat(
      (Math.ceil(initialData[i][2] / 25 / 0.05) * 0.05).toFixed(2)
    );
    var maxVal = Math.max(emin, 0.15);
    var cumpleCond =
      formData.exDF > maxVal ? 'Sí cumple' : 'No cumple, verificar';
    var pinicial = 0.0025;
    var numCaps = formData.exDF >= 0.2 ? 2 : 1;
    var asInicial = pinicial * formData.lnucxDF * 100 * formData.exDF * 100;
    var areAcero = 0.71;
    var s =
      Math.ceil(
        (formData.lnucxDF * 100 * areAcero) / (asInicial / numCaps) / 5
      ) * 5;
    var dataRow = [
      `Piso ${i + 1}`,
      emin,
      cumpleCond,
      pinicial,
      numCaps,
      asInicial,
      'ø3/8"',
      0.95,
      0.71,
      s,
      `$ø3/8" @ ${s} cm`,
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 120],
    // === OPTIMIZACIONES ===
    renderAllRows: false,
    viewportRowRenderingOffset: 15,
    // ======================
    nestedHeaders: [
      [
        'Nivel',
        'emín',
        'Verificación',
        'ρinicial',
        'N°',
        'As inicial',
        'Acero',
        'D',
        'Área',
        's',
        'Distribución de Refuerzo',
      ],
      [
        '',
        '(m)',
        'Espesor Mínimo',
        '',
        'Capas',
        '(cm²)',
        '',
        '(cm)',
        '(cm²)',
        '(cm)',
        'Inicial en el Núcleo',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
      { type: 'numeric' },
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
      { type: 'text', readOnly: true },
    ],
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        hot.suspendRender();
        try {
          changes.forEach(function (change) {
            /* console.log(change) Devuelve un array con 4 valores, row, col, oldValue, newValue */
            var row = change[0];
            var col = change[1];
            //var oldValue = change[2];
            var newValue = change[3];

            if (col === 6) {
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
              hot.setDataAtCell(row, 7, D);
              hot.setDataAtCell(row, 8, area);
            }
            if (col == 8) {
              hot.setDataAtCell(
                row,
                9,
                Math.ceil(
                  (formData.lnucxDF * 100 * newValue) /
                  (hot.getDataAtCell(row, 5) / hot.getDataAtCell(row, 4)) /
                  5
                ) * 5
              );
            }
            if (col == 9)
              hot.setDataAtCell(
                row,
                10,
                `${hot.getDataAtCell(row, 6)} @ ${hot.getDataAtCell(row, 9)} cm`
              );
          });
        } finally {
          hot.resumeRender();
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
      } finally {
        hot.resumeRender();
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  //document.getElementById('saveDataBtn2').addEventListener('click', saveDataT2);

  /* function saveDataT2() {
    // Obtener los datos de la tabla
    solicitudCargaDT2 = hot.getData();

    solicitudCargaDT2 = solicitudCargaDT2.map((row) => row.slice(-6));
    // extractedValues will contain the values from index 9 to index 14 of the original array

    // Aquí puedes realizar alguna acción con los datos, como enviarlos al servidor o guardarlos en el almacenamiento local
    console.log('Datos de la tabla 2:', solicitudCargaDT2);
    var contenedor3 = document.getElementById('solicitudCargaT3');

    solicitudCargaT3(contenedor3, solicitudCargaDT2, solicitudCargaDT2.length);
  } */
}

export function flexDesignT1Y(contenedor, initialData, formData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var dataRow = [
      `Piso ${i + 1}`,
      formData.lyDF,
      '',
      '',
      '',
      '',
      '',
      initialData[i][5],
      '',
      '',
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: [90, 90, 90, 90, 150, 90, 90, 90, 150, 150],
    // === OPTIMIZACIONES ===
    renderAllRows: false,
    viewportRowRenderingOffset: 15,
    // ======================
    nestedHeaders: [
      ['Nivel', 'lm', 'h', 'hm', 'hm/lm', 'Tipo', 'Tipo', 'Mu', 'z', 'As'],
      [
        '',
        '(m)',
        '(m)',
        '(m)',
        '',
        'Muro',
        'Falla Muro',
        '(Ton.m)',
        '(m)',
        '(cm²)',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Piso
      { type: 'numeric', readOnly: true }, // lm (m)
      { type: 'numeric' }, // h (m)
      { type: 'numeric', readOnly: true }, // hm
      { type: 'numeric', readOnly: true }, // hm/lm
      { type: 'text', readOnly: true }, // Tipo de Muro
      { type: 'text', readOnly: true }, // Tipo de Falla Muro
      { type: 'numeric', readOnly: true }, // Mu (Ton.m)
      { type: 'numeric', readOnly: true }, // z (m)
      { type: 'numeric', readOnly: true }, // As (cm²)
    ],
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        hot.suspendRender();
        try {
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
                hot.setDataAtCell(row, 3, hm);
              } else {
                hot.setDataAtCell(0, 3, hm);
                hot.setDataAtCell(row, 3, hot.getDataAtCell(row - 1, 3) - h);
              }
            }

            if (col === 3) {
              if (row + 1 < hot.countRows()) {
                hot.setDataAtCell(
                  row + 1,
                  3,
                  hot.getDataAtCell(row, 3) - hot.getDataAtCell(row + 1, 2)
                );
              }
              // Valor hm/lm
              var hmlm = newValue / hot.getDataAtCell(row, 1);
              hot.setDataAtCell(row, 4, hmlm);
            }

            if (col == 4) {
              // Valor Tipo de Muro
              var tipoMuro = newValue > 1 ? 'Muro Esbelto' : 'Muro No Esbelto';
              hot.setDataAtCell(row, 5, tipoMuro);
              // Valor TIpo de Falla Muro
              var tipoFallaMuro = newValue > 1 ? 'Por Flexión' : 'Por Corte';
              hot.setDataAtCell(row, 6, tipoFallaMuro);
              // valor Z
              var z = 0;
              if (newValue > 1) {
                z = 0.9 * hot.getDataAtCell(row, 1);
              } else if (0.5 <= newValue && newValue <= 1) {
                z = 0.4 * hot.getDataAtCell(row, 1) * (1 + newValue);
              } else {
                z = 1.2 * hot.getDataAtCell(row, 2);
              }
              hot.setDataAtCell(row, 8, z);
            }
            // if(col == 5)
            // if(col == 6)
            if (col == 7) {
              // Valor As
              var As =
                (newValue * Math.pow(10, 5)) /
                (formData.designDF *
                  formData.fyDF *
                  hot.getDataAtCell(row, 8) *
                  100);
              hot.setDataAtCell(row, 9, As);
            }
            if (col == 8) {
              // Valor As
              var As =
                (hot.getDataAtCell(row, 7) * Math.pow(10, 5)) /
                (formData.designDF * formData.fyDF * newValue * 100);
              hot.setDataAtCell(row, 9, As);
            }
          });
        } finally {
          hot.resumeRender();
        }
        /* CheckData(); */
      }
    },
    afterPaste: function (data, coords) {
      var hot = this;
      var startRow = coords[0].startRow;
      var startCol = coords[0].startCol;
      hot.suspendRender();
      try {
        hot.populateFromArray(startRow, startCol, data, null, null, 'paste');
      } finally {
        hot.resumeRender();
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  document
    .getElementById('saveDataBtnDF1Y')
    .addEventListener('click', CheckData);

  function CheckData() {
    var allCellsFilled = true;
    var tableData = hot.getData();
    for (var i = 0; i < tableData.length; i++) {
      for (var j = 0; j < tableData[i].length; j++) {
        if (tableData[i][j] === null || tableData[i][j] === '') {
          allCellsFilled = false;
          break;
        }
      }
      if (!allCellsFilled) {
        break;
      }
    }
    if (allCellsFilled) {
      console.log('Datos de la tabla T1Y:', tableData);
      var flexDesingT2Y = document.getElementById('flexDesingT2Y');
      flexDesignT2Y(flexDesingT2Y, tableData);
      var flexDesingT3Y = document.getElementById('flexDesingT3Y');
      flexDesignT3Y(flexDesingT3Y, tableData, formData);
    } else {
      alert('Hay celdas vacías');
    }
  }
}

//Tabla Análisis en Dirección "2 y"
export function flexDesignT2Y(contenedor, initialData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var dataRow = [
      `Piso ${i + 1}`,
      'ø3/4"',
      1.9,
      2.84,
      1,
      0,
      0,
      0,
      0,
      0,
      'No Cumple, verificar',
      '18ø5/8"',
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: [90, 90, 90, 90, 90, 90, 90, 90, 90, 120, 150, 200],
    // === OPTIMIZACIONES ===
    renderAllRows: false,
    viewportRowRenderingOffset: 15,
    // ======================
    nestedHeaders: [
      [
        'Nivel',
        'Acero',
        'D',
        'Área',
        'N°',
        'Ø1/2"',
        'Ø5/8"',
        'Ø3/4"',
        'Ø1"',
        'Ascolocado',
        'Verificación',
        'Distribución de Refuerzo',
      ],
      [
        '',
        '',
        '(cm)',
        '(cm²)',
        'Acero',
        '',
        '',
        '',
        '',
        '(cm²)',
        'Acero Colocado',
        'Final en la Zona de Confinamiento',
      ],
    ],
    columns: [
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
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'text', readOnly: true },
    ],
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        hot.suspendRender();
        try {
          changes.forEach(function (change) {
            /* console.log(change) Devuelve un array con 4 valores, row, col, oldValue, newValue */
            var row = change[0];
            var col = change[1];
            //var oldValue = change[2];
            var newValue = change[3];

            if (col === 1) {
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
              hot.setDataAtCell(row, 2, D);
              hot.setDataAtCell(row, 3, area);
            }
            if (col == 3) {
              var amountIron = Math.ceil(initialData[row][9] / newValue);
              hot.setDataAtCell(row, 4, amountIron);
            }
            if (col == 5) {
              hot.setDataAtCell(
                row,
                9,
                1.267 * newValue +
                1.979 * hot.getDataAtCell(row, 6) +
                2.85 * hot.getDataAtCell(row, 7) +
                5.067 * hot.getDataAtCell(row, 8)
              );
              if (newValue != 0) hot.setDataAtCell(row, 11, `${newValue}Ø1/2"`);
            }
            if (col == 6) {
              hot.setDataAtCell(
                row,
                9,
                1.267 * hot.getDataAtCell(row, 5) +
                1.979 * newValue +
                2.85 * hot.getDataAtCell(row, 7) +
                5.067 * hot.getDataAtCell(row, 8)
              );
              if (newValue != 0) hot.setDataAtCell(row, 11, `${newValue}Ø5/8"`);
            }
            if (col == 7) {
              hot.setDataAtCell(
                row,
                9,
                1.267 * hot.getDataAtCell(row, 5) +
                1.979 * hot.getDataAtCell(row, 6) +
                2.85 * newValue +
                5.067 * hot.getDataAtCell(row, 8)
              );
              if (newValue != 0) hot.setDataAtCell(row, 11, `${newValue}Ø3/4"`);
            }
            if (col == 8) {
              hot.setDataAtCell(
                row,
                9,
                1.267 * hot.getDataAtCell(row, 5) +
                1.979 * hot.getDataAtCell(row, 6) +
                2.85 * hot.getDataAtCell(row, 7) +
                5.067 * newValue
              );
              if (newValue != 0) hot.setDataAtCell(row, 11, `${newValue}Ø1"`);
            }
            if (col == 9) {
              var verifAcero =
                hot.getDataAtCell(row, 9) > initialData[row][9]
                  ? 'Sí cumple'
                  : 'No cumple, verificar';
              hot.setDataAtCell(row, 10, verifAcero);
            }
            // if(col==10)
            // if(col==11)
          });
        } finally {
          hot.resumeRender();
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
      } finally {
        hot.resumeRender();
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  document
    .getElementById('saveDataBtnDF2Y')
    .addEventListener('click', CheckData);

  function CheckData() {
    var allCellsFilled = true;
    dataTable2y = hot.getData();
    for (var i = 0; i < dataTable2y.length; i++) {
      for (var j = 0; j < dataTable2y[i].length; j++) {
        if (dataTable2y[i][j] === null || dataTable2y[i][j] === '') {
          allCellsFilled = false;
          break;
        }
      }
      if (!allCellsFilled) {
        break;
      }
    }
    if (allCellsFilled) {
      alert('Guardado');
    }
    /* if (allCellsFilled) {
      console.log('Datos de la tabla T1X:', tableData);
      var flexDesingT2X = document.getElementById('flexDesingT2X');
      flexDesignT2X(flexDesingT2X, tableData);
      var flexDesingT3X = document.getElementById('flexDesingT3X');
      flexDesignT3X(flexDesingT3X, tableData, formData);
    } else {
      alert('Hay celdas vacías');
    } */
  }
}

//Tabla Análisis en Dirección "3 y"
export function flexDesignT3Y(contenedor, initialData, formData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var emin = parseFloat(
      (Math.ceil(initialData[i][2] / 25 / 0.05) * 0.05).toFixed(2)
    );
    var maxVal = Math.max(emin, 0.15);
    var cumpleCond =
      formData.eyDF > maxVal ? 'Sí cumple' : 'No cumple, verificar';
    var pinicial = 0.0025;
    var numCaps = formData.eyDF >= 0.2 ? 2 : 1;
    var asInicial = pinicial * formData.lnucyDF * 100 * formData.eyDF * 100;
    var areAcero = 0.71;
    var s =
      Math.ceil(
        (formData.lnucyDF * 100 * areAcero) / (asInicial / numCaps) / 5
      ) * 5;
    var dataRow = [
      `Piso ${i + 1}`,
      emin,
      cumpleCond,
      pinicial,
      numCaps,
      asInicial,
      'ø3/8"',
      0.95,
      0.71,
      s,
      `$ø3/8" @ ${s} cm`,
    ];
    data.push(dataRow);
  }

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 120],
    // === OPTIMIZACIONES ===
    renderAllRows: false,
    viewportRowRenderingOffset: 15,
    // ======================
    nestedHeaders: [
      [
        'Nivel',
        'emín',
        'Verificación',
        'ρinicial',
        'N°',
        'As inicial',
        'Acero',
        'D',
        'Área',
        's',
        'Distribución de Refuerzo',
      ],
      [
        '',
        '(m)',
        'Espesor Mínimo',
        '',
        'Capas',
        '(cm²)',
        '',
        '(cm)',
        '(cm²)',
        '(cm)',
        'Inicial en el Núcleo',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
      { type: 'numeric' },
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
      { type: 'text', readOnly: true },
    ],
    afterChange: function (changes, source) {
      if (source === 'edit') {
        var hot = this;
        hot.suspendRender();
        try {
          changes.forEach(function (change) {
            /* console.log(change) Devuelve un array con 4 valores, row, col, oldValue, newValue */
            var row = change[0];
            var col = change[1];
            //var oldValue = change[2];
            var newValue = change[3];

            if (col === 6) {
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
              hot.setDataAtCell(row, 7, D);
              hot.setDataAtCell(row, 8, area);
            }
            if (col == 8) {
              hot.setDataAtCell(
                row,
                9,
                Math.ceil(
                  (formData.lnucyDF * 100 * newValue) /
                  (hot.getDataAtCell(row, 5) / hot.getDataAtCell(row, 4)) /
                  5
                ) * 5
              );
            }
            if (col == 9)
              hot.setDataAtCell(
                row,
                10,
                `${hot.getDataAtCell(row, 6)} @ ${hot.getDataAtCell(row, 9)} cm`
              );
          });
        } finally {
          hot.resumeRender();
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
      } finally {
        hot.resumeRender();
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });
}

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


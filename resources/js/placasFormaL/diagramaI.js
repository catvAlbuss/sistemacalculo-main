/* ------------------------ Análsis en X ------------------------ */
var tableDI1X = [];
var tableDI1Y = [];
var Charts = {};
export function diT1X(
  contenedor,
  solicitaciones,
  tableData1DC,
  dataTable2xDF,
  tableData3DC,
  formData
) {

  var container = contenedor;

  var data = [];
  // Tipo sistema Estructural = Muros Estructurales
  /* var tipoSistema = 6; */

  for (let i = 0; i < 1; i++) {
    var lm = formData.lxDF;
    console.log(dataTable2xDF);
    var hm = tableData1DC[i][4];
    console.log(hm);
    var as = dataTable2xDF[i][9];
    var ads = 0;
    var pu = solicitaciones[i][1];
    var pv = tableData3DC[i][3];
    var c1 =
      (pu * 1000 +
        as * formData.fyDF +
        pv * formData.ezcxDF * 100 * formData.lxDF * 100 * formData.fyDF -
        ads * formData.fyDF) /
      (0.85 * formData.fcDF * formData.ezcxDF * 100 * formData.β1DF +
        2 * pv * formData.ezcxDF * 100 * formData.fyDF);
    var es = 0;
    var c2 = 0;
    var c3 =
      es == 0
        ? 0
        : (formData.ƐcDF * formData.lxDF * 100) / (formData.ƐcDF + es);
    var c = Math.max(c1, c2, c3);
    var gu = 0.2374764;
    var cLimit = (lm / (600 * Math.max(gu / hm, 0.005))) * 100;
    var confinamiento =
      c >= cLimit ? 'Requiere ser confinado' : 'No requiere ser confinado';

    var dataRow = [
      lm, // lm
      hm, // hm
      as,
      ads,
      pu,
      pv,
      c1,
      c2,
      es,
      c3,
      c,
      gu,
      cLimit,
      confinamiento,
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
        'lm',
        'hm',
        'As',
        "A's",
        'Pu',
        'pv',
        'c1',
        'c2',
        'Ɛs',
        'c3',
        'c',
        'δu',
        'C limite',
        'Confinamiento',
      ],
      [
        '(m)',
        '(m)',
        '(cm²)',
        '(cm²)',
        '(Ton)',
        '',
        '(cm)',
        '(cm)',
        '',
        '(cm)',
        '(cm)',
        '(m)',
        '(cm)',
        'elemento de borde',
      ],
    ],
    columns: [
      { type: 'numeric', readOnly: true }, // 'lm (m)',
      { type: 'numeric', readOnly: true }, // 'lm (m)',
      { type: 'numeric', readOnly: true }, // 'hm acumulado (m)',
      { type: 'numeric', readOnly: true }, // 'hm (m)',
      { type: 'numeric', readOnly: true }, // 'Vua (Ton)',
      { type: 'numeric', readOnly: true }, // 'Mua (Ton.m)',
      { type: 'numeric', readOnly: true }, // 'Cociente',
      { type: 'numeric' }, // 'Mnx (Ton.m)',
      { type: 'numeric' }, // 'Mnx (Ton.m)',
      { type: 'numeric', readOnly: true }, // 'Mnx/Mua',
      { type: 'numeric', readOnly: true }, // 'Vux (Ton)',
      { type: 'numeric' }, // 'hm/lm',
      { type: 'numeric', readOnly: true }, // 'αc',
      { type: 'numeric', readOnly: true }, // 'Vcx máx (Ton)',
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

          if (col === 7) {
            hot.setDataAtCell(
              row,
              10,
              Math.max(
                hot.getDataAtCell(row, 6),
                hot.getDataAtCell(row, 7),
                hot.getDataAtCell(row, 9)
              )
            );
          }
          if (col === 8) {
            hot.setDataAtCell(
              row,
              9,
              newValue == 0
                ? 0
                : (formData.ƐcDF * formData.lxDF * 100) /
                (formData.ezcxDF + newValue)
            );
          }
          if (col === 9) {
            hot.setDataAtCell(
              row,
              10,
              Math.max(
                hot.getDataAtCell(row, 6),
                hot.getDataAtCell(row, 7),
                hot.newValue
              )
            );
          }
          if (col === 10) {
            hot.setDataAtCell(
              row,
              13,
              newValue >= hot.getDataAtCell(row, 12)
                ? 'Requiere ser confinado'
                : 'No requiere ser confinado'
            );
          }
          if (col === 11) {
            hot.setDataAtCell(
              row,
              12,
              (hot.getDataAtCell(row, 0) /
                (600 *
                  Math.max(
                    hot.getDataAtCell(row, 11) / hot.getDataAtCell(row, 1),
                    0.005
                  ))) *
              100
            );
          }
          if (col === 12) {
            hot.setDataAtCell(
              row,
              13,
              hot.getDataAtCell(row, 10) >= newValue
                ? 'Requiere ser confinado'
                : 'No requiere ser confinado'
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
    .getElementById('saveDataBtnDI1X')
    .addEventListener('click', CheckData);

  function CheckData() {
    tableDI1X = hot.getData();

    var contenedor = document.getElementById('diT2X');
    diT2X(contenedor, solicitaciones, tableData1DC, dataTable2xDF, formData);
    var contenedor2 = document.getElementById('diT3X');
    diT3X(contenedor2, formData);
  }
}

//Tabla Análisis en Dirección "2 x"
function diT2X(
  contenedor,
  solicitaciones,
  tableData1DC,
  dataTable2xDF,
  formData
) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < 1; i++) {
    var zc = formData.zcxDF;
    var vuMax = tableData1DC[i][11];
    var muMax = solicitaciones[i][3];
    var lomax1 = tableDI1X[i][0];
    var lomax2 = 0.25 * (muMax / vuMax);
    var lomax = Math.max(lomax1, lomax2);
    var zcmax1 = Math.max(tableDI1X[i][10] / 100 - 0.1 * tableDI1X[i][0], 0);
    var zcmax2 = tableDI1X[i][10] / 2 / 100;
    var zcmax = Math.max(zcmax1, zcmax2);
    var verifEspesor = zc > zcmax ? 'Sí cumple' : 'No cumple, verificar';
    var s1 = 10 * dataTable2xDF[i][2];
    var s2 = Math.min(formData.zcxDF, formData.ezcxDF) * 100;
    var s3 = 25;
    var s = Math.floor(Math.min(s1, s3) / 2.5) * 2.5;

    var dataRow = [
      zc,
      vuMax,
      muMax,
      lomax1,
      lomax2,
      lomax,
      zcmax1,
      zcmax2,
      zcmax,
      verifEspesor,
      s1,
      s2,
      s3,
      s,
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
        'zc',
        'Vu máx',
        'Mu máx',
        'Lo máx',
        'Lo máx',
        'Lo máx',
        'zcmáx 1',
        'zcmáx 2',
        'zcmáx',
        'Artículo 21.9.7.6.a. Verificación',
        's1',
        's2',
        's3',
        's',
      ],
      [
        '(m)',
        '(Ton)',
        '(Ton.m)',
        '(m)',
        '(m)',
        '(m)',
        '(m)',
        '(m)',
        '(m)',
        'Espesor de la Zona de Confinamiento',
        '(cm)',
        '(cm)',
        '(cm)',
        '(cm)',
      ],
    ],
    columns: [
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });
}

//Tabla Análisis en Dirección "2 x"
function diT3X(contenedor, formData) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < 1; i++) {
    var ly = formData.lyDF;
    var hm = tableDI1X[i][1];
    var lyCal = 0.1 * hm;
    var verifAncho =
      ly <= lyCal
        ? 'Diseñar con ala completa'
        : 'Diseñar solo con ancho efectivo del ala';
    var dataRow = [ly, hm, lyCal, verifAncho];
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
      ['Ly', 'hm', 'Ly calculado', 'Verificación'],
      ['(m)', '(m)', '(m)', 'ancho efectivo del Ala'],
    ],
    columns: [
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });
}

// Análisis dirección Y
export function diT1Y(
  contenedor,
  solicitaciones,
  tableData1DC,
  dataTable2yDF,
  tableData3DC,
  formData
) {
  var container = contenedor;

  var data = [];
  // Tipo sistema Estructural = Muros Estructurales
  /* var tipoSistema = 6; */

  for (let i = 0; i < 1; i++) {
    var lm = formData.lxDF;
    var hm = tableData1DC[i][4];
    var as = dataTable2yDF[i][9];
    var ads = 0;
    var pu = solicitaciones[i][1];
    var pv = tableData3DC[i][3];
    var c1 =
      (pu * 1000 +
        as * formData.fyDF +
        pv * formData.ezcyDF * 100 * formData.lyDF * 100 * formData.fyDF -
        ads * formData.fyDF) /
      (0.85 * formData.fcDF * formData.ezcyDF * 100 * formData.β1DF +
        2 * pv * formData.ezcyDF * 100 * formData.fyDF);
    var es = 0;
    var c2 = 0;
    var c3 =
      es == 0
        ? 0
        : (formData.ƐcDF * formData.lxDF * 100) / (formData.ƐcDF + es);
    var c = Math.max(c1, c2, c3);
    var gu = 0.2374764;
    var cLimit = (lm / (600 * Math.max(gu / hm, 0.005))) * 100;
    var confinamiento =
      c >= cLimit ? 'Requiere ser confinado' : 'No requiere ser confinado';

    var dataRow = [
      lm, // lm
      hm, // hm
      as,
      ads,
      pu,
      pv,
      c1,
      c2,
      es,
      c3,
      c,
      gu,
      cLimit,
      confinamiento,
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
        'lm',
        'hm',
        'As',
        "A's",
        'Pu',
        'pv',
        'c1',
        'c2',
        'Ɛs',
        'c3',
        'c',
        'δu',
        'C limite',
        'Confinamiento',
      ],
      [
        '(m)',
        '(m)',
        '(cm²)',
        '(cm²)',
        '(Ton)',
        '',
        '(cm)',
        '(cm)',
        '',
        '(cm)',
        '(cm)',
        '(m)',
        '(cm)',
        'elemento de borde',
      ],
    ],
    columns: [
      { type: 'numeric', readOnly: true }, // 'lm (m)',
      { type: 'numeric', readOnly: true }, // 'lm (m)',
      { type: 'numeric', readOnly: true }, // 'hm acumulado (m)',
      { type: 'numeric', readOnly: true }, // 'hm (m)',
      { type: 'numeric', readOnly: true }, // 'Vua (Ton)',
      { type: 'numeric', readOnly: true }, // 'Mua (Ton.m)',
      { type: 'numeric', readOnly: true }, // 'Cociente',
      { type: 'numeric' }, // 'Mnx (Ton.m)',
      { type: 'numeric' }, // 'Mnx (Ton.m)',
      { type: 'numeric', readOnly: true }, // 'Mnx/Mua',
      { type: 'numeric', readOnly: true }, // 'Vux (Ton)',
      { type: 'numeric' }, // 'hm/lm',
      { type: 'numeric', readOnly: true }, // 'αc',
      { type: 'numeric', readOnly: true }, // 'Vcx máx (Ton)',
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

          if (col === 7) {
            hot.setDataAtCell(
              row,
              10,
              Math.max(
                hot.getDataAtCell(row, 6),
                hot.getDataAtCell(row, 7),
                hot.getDataAtCell(row, 9)
              )
            );
          }
          if (col === 8) {
            hot.setDataAtCell(
              row,
              9,
              newValue == 0
                ? 0
                : (formData.ƐcDF * formData.lxDF * 100) /
                (formData.ezcxDF + newValue)
            );
          }
          if (col === 9) {
            hot.setDataAtCell(
              row,
              10,
              Math.max(
                hot.getDataAtCell(row, 6),
                hot.getDataAtCell(row, 7),
                hot.newValue
              )
            );
          }
          if (col === 10) {
            hot.setDataAtCell(
              row,
              13,
              newValue >= hot.getDataAtCell(row, 12)
                ? 'Requiere ser confinado'
                : 'No requiere ser confinado'
            );
          }
          if (col === 11) {
            hot.setDataAtCell(
              row,
              12,
              (hot.getDataAtCell(row, 0) /
                (600 *
                  Math.max(
                    hot.getDataAtCell(row, 11) / hot.getDataAtCell(row, 1),
                    0.005
                  ))) *
              100
            );
          }
          if (col === 12) {
            hot.setDataAtCell(
              row,
              13,
              hot.getDataAtCell(row, 10) >= newValue
                ? 'Requiere ser confinado'
                : 'No requiere ser confinado'
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
    .getElementById('saveDataBtnDI1Y')
    .addEventListener('click', CheckData);

  function CheckData() {
    tableDI1Y = hot.getData();

    var contenedor = document.getElementById('diT2Y');
    diT2Y(contenedor, solicitaciones, tableData1DC, dataTable2yDF, formData);
    var contenedor2 = document.getElementById('diT3Y');
    diT3Y(contenedor2, formData);
  }
}

//Tabla Análisis en Dirección "2 y"
function diT2Y(
  contenedor,
  solicitaciones,
  tableData1DC,
  dataTable2yDF,
  formData
) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < 1; i++) {
    var zc = formData.zcyDF;
    console.log(zc);
    var vuMax = tableData1DC[i][11];
    var muMax = solicitaciones[i][3];
    var lomax1 = tableDI1Y[i][0];
    var lomax2 = 0.25 * (muMax / vuMax);
    var lomax = Math.max(lomax1, lomax2);
    var zcmax1 = Math.max(tableDI1Y[i][10] / 100 - 0.1 * tableDI1Y[i][0], 0);
    var zcmax2 = tableDI1Y[i][10] / 2 / 100;
    var zcmax = Math.max(zcmax1, zcmax2);
    var verifEspesor = zc > zcmax ? 'Sí cumple' : 'No cumple, verificar';
    var s1 = 10 * dataTable2yDF[i][2];
    var s2 = Math.min(formData.zcyDF, formData.ezcyDF) * 100;
    var s3 = 25;
    var s = Math.floor(Math.min(s1, s3) / 2.5) * 2.5;

    var dataRow = [
      zc,
      vuMax,
      muMax,
      lomax1,
      lomax2,
      lomax,
      zcmax1,
      zcmax2,
      zcmax,
      verifEspesor,
      s1,
      s2,
      s3,
      s,
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
        'zc',
        'Vu máx',
        'Mu máx',
        'Lo máx',
        'Lo máx',
        'Lo máx',
        'zcmáx 1',
        'zcmáx 2',
        'zcmáx',
        'Artículo 21.9.7.6.a. Verificación',
        's1',
        's2',
        's3',
        's',
      ],
      [
        '(m)',
        '(Ton)',
        '(Ton.m)',
        '(m)',
        '(m)',
        '(m)',
        '(m)',
        '(m)',
        '(m)',
        'Espesor de la Zona de Confinamiento',
        '(cm)',
        '(cm)',
        '(cm)',
        '(cm)',
      ],
    ],
    columns: [
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });
}

//Tabla Análisis en Dirección "3y"
function diT3Y(contenedor, formData) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < 1; i++) {
    var lx = formData.lxDF;
    var hm = tableDI1Y[i][1];
    var lyCal = 0.1 * hm;
    var verifAncho =
      lx <= lyCal
        ? 'Diseñar con ala completa'
        : 'Diseñar solo con ancho efectivo del ala';
    var dataRow = [lx, hm, lyCal, verifAncho];
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
      ['Lx', 'hm', 'Ly calculado', 'Verificación'],
      ['(m)', '(m)', '(m)', 'ancho efectivo del Ala'],
    ],
    columns: [
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'text', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });
}

// Datos y gráficas
export function diagramI(solicitacionesVarios) {
  var cont = 0;
  var dataSize = solicitacionesVarios.length;
  for (let i = 1; i <= dataSize / 17; i = i + 2) {
    cont++;
    var dataT1SC = solicitacionesVarios.slice(0, 17);
    var dataT2SC = solicitacionesVarios.slice(17, 34);
    solicitacionesVarios = solicitacionesVarios.slice(34);

    // Crear un nuevo elemento div
    var PairContainer = document.createElement('div');
    var rowContainer1 = document.createElement('div');
    var rowContainer2 = document.createElement('div');
    var rowContainer3 = document.createElement('div');

    var tableContainer1SC = document.createElement('div');
    var tableContainer1MDI = document.createElement('div');
    var tableContainer1DI = document.createElement('div');
    var tableContainer1DIE = document.createElement('div');
    var buttonD1 = document.createElement('button');
    buttonD1.textContent = 'Generar gráfico Izquierdo';

    var tableContainer2SC = document.createElement('div');
    var tableContainer2MDI = document.createElement('div');
    var tableContainer2DI = document.createElement('div');
    var tableContainer2DIE = document.createElement('div');
    var buttonD2 = document.createElement('button');
    buttonD2.textContent = 'Generar gráfico Derecho';

    tableContainer1SC.id = `hotTableContainerISC${cont}`;
    tableContainer1SC.classList.add('mr-1');
    tableContainer2SC.id = `hotTableContainerDSC${cont}`;
    tableContainer1DI.id = `hotTableContainerIDI${cont}`;
    buttonD1.id = `buttonIDI${cont}`;
    tableContainer2DI.id = `hotTableContainerDDI${cont}`;
    buttonD2.id = `buttonDDI${cont}`;

    // Agregar clases, estilos o cualquier otro atributo necesario al nuevo div
    PairContainer.classList.add('d-flex', 'flex-column');
    rowContainer1.classList.add('d-flex');
    rowContainer2.classList.add('row');
    rowContainer3.classList.add('d-flex', 'flex-wrap');
    tableContainer1MDI.classList = 'col-md-5';
    tableContainer2MDI.classList = 'col-md-5';

    PairContainer.id = `diagramsContainer${cont}`;

    // Obtener el contenedor donde se agregarán los nuevos divs
    var contenedor = document.getElementById('diagramsContainer');

    // Agregar el nuevo div al contenedor
    contenedor.appendChild(PairContainer);
    PairContainer.appendChild(rowContainer1);
    PairContainer.appendChild(rowContainer2);
    PairContainer.appendChild(rowContainer3);
    rowContainer1.appendChild(tableContainer1SC);
    tableContainer1MDI.appendChild(tableContainer1DI);
    tableContainer1MDI.appendChild(tableContainer1DIE);
    tableContainer1MDI.appendChild(buttonD1);
    rowContainer2.appendChild(tableContainer1MDI);
    rowContainer1.appendChild(tableContainer2SC);
    tableContainer2MDI.appendChild(tableContainer2DI);
    tableContainer2MDI.appendChild(tableContainer2DIE);
    tableContainer2MDI.appendChild(buttonD2);
    rowContainer2.appendChild(tableContainer2MDI);

    soliciTabla(tableContainer1SC, dataT1SC);
    soliciTabla(tableContainer2SC, dataT2SC);
    diagramaHot(
      tableContainer1DI,
      buttonD1,
      rowContainer3,
      dataT1SC,
      dataT2SC,
      cont,
      'Izq',
      tableContainer1DIE
    );
    diagramaHot(
      tableContainer2DI,
      buttonD2,
      rowContainer3,
      dataT1SC,
      dataT2SC,
      cont,
      'Der',
      tableContainer2DIE
    );
  }
}

function soliciTabla(contenedor, solicitaciones) {
  var rowToUse = [
    'Combinación 01',
    'Combinación 02 Max',
    'Combinación 02 Min',
    'Combinación 03 Max',
    'Combinación 03 Min',
    'Combinación 04 Max',
    'Combinación 04 Min',
    'Combinación 05 Max',
    'Combinación 05 Min',
    'Combinación 06 Max',
    'Combinación 06 Min',
    'Combinación 07 Max',
    'Combinación 07 Min',
    'Combinación 08 Max',
    'Combinación 08 Min',
    'Combinación 09 Max',
    'Combinación 09 Min',
  ];
  var dataModified = solicitaciones.map((row, i) => {
    return [rowToUse[i], ...row];
  });

  var hot = Handsontable(contenedor, {
    data: dataModified,
    rowHeaders: true,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [
      ['Combinaciones', 'Pu', 'Mux', 'Muy'],
      ['Carga', '(Ton)', '(Ton.m)', '(Ton.m)'],
    ],
    columns: [
      { type: 'text', readOnly: true }, // 'Nivel',
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
    ],
    licenseKey: 'non-commercial-and-evaluation',
  });
}

function diagramaHot(
  contenedor,
  button,
  PairContainer,
  dataT1SC,
  dataT2SC,
  cont,
  pos,
  contenedorEx
) {
  var title = pos == 'Izq' ? 'Dirección X-X' : 'Dirección Y-Y';
  var dataDI = [
    [1, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0],
    [4, 0, 0, 0, 0, 0, 0],
    [5, 0, 0, 0, 0, 0, 0],
    [6, 0, 0, 0, 0, 0, 0],
    [7, 0, 0, 0, 0, 0, 0],
    [8, 0, 0, 0, 0, 0, 0],
    [9, 0, 0, 0, 0, 0, 0],
    [10, 0, 0, 0, 0, 0, 0],
    [11, 0, 0, 0, 0, 0, 0],
  ];
  var hot = Handsontable(contenedor, {
    data: dataDI,
    rowHeaders: true,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [
      ['Incluido ' + title],
      ['Puntos', 'P', 'M2', 'M3', 'P', 'M2', 'M3'],
      ['', '(Ton)', '(Ton.m)', '(Ton.m)', '(Ton)', '(Ton.m)', '(Ton.m)'],
    ],
    columns: [
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
    ],
    afterPaste: function (data, coords) {
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
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  // Excluido table
  var dataDIEx = [
    [1, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0],
    [4, 0, 0, 0, 0, 0, 0],
    [5, 0, 0, 0, 0, 0, 0],
    [6, 0, 0, 0, 0, 0, 0],
    [7, 0, 0, 0, 0, 0, 0],
    [8, 0, 0, 0, 0, 0, 0],
    [9, 0, 0, 0, 0, 0, 0],
    [10, 0, 0, 0, 0, 0, 0],
    [11, 0, 0, 0, 0, 0, 0],
  ];
  var hotEx = Handsontable(contenedorEx, {
    data: dataDIEx,
    rowHeaders: true,
    colHeaders: true,
    height: 'auto',
    autoWrapRow: true,
    autoWrapCol: true,
    colWidths: 100,
    nestedHeaders: [
      ['Excluido ' + title],
      ['Puntos', 'P', 'M2', 'M3', 'P', 'M2', 'M3'],
      ['', '(Ton)', '(Ton.m)', '(Ton.m)', '(Ton)', '(Ton.m)', '(Ton.m)'],
    ],
    columns: [
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
    ],
    afterPaste: function (data, coords) {
      data.forEach(function (rowData, i) {
        var startRow = coords[0].startRow;
        var startCol = coords[0].startCol;
        var endCol = coords[0].endCol;
        let k = 0;
        for (let j = startCol; j <= endCol; j++) {
          hotEx.setDataAtCell(startRow + i, j, rowData[k]);
          k++;
        }
      });
    },
    licenseKey: 'non-commercial-and-evaluation',
  });

  button.addEventListener('click', CheckData);

  function CheckData() {
    var allCellsFilled = true;
    var tableData = hot.getData();
    var tableDataEx = hotEx.getData();
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
      console.log('Datos de la tabla graph1 HOT:', tableDataEx);
      diagramStart(
        PairContainer,
        dataT1SC,
        dataT2SC,
        tableData,
        cont,
        pos,
        tableDataEx
      );
    } else {
      alert('Hay celdas vacías');
    }
  }
}

function diagramStart(
  container,
  dataIz,
  dataDer,
  tableData,
  cont,
  pos,
  tableDataEx
) {
  /* var rowContainer3 = document.createElement('div'); */
  var graphContainer = document.createElement('div');
  /* rowContainer3.classList.add('d-flex'); */
  var data1 = [];
  var data2 = [];
  if (pos == 'Izq') {
    data1 = dataIz.map((row) => {
      return [row[0], row[1]];
    });

    data2 = dataDer.map((row) => {
      return [row[0], row[1]];
    });
  } else {
    data1 = dataIz.map((row) => {
      return [row[0], row[2]];
    });
    data2 = dataDer.map((row) => {
      return [row[0], row[2]];
    });
  }

  var leftLine = tableData.map((row) => {
    return [row[4], row[6]];
  });
  var rightLine = tableData.map((row) => {
    return [row[1], row[3]];
  });
  var leftLineEx = tableDataEx.map((row) => {
    return [row[4], row[6]];
  });
  var rightLineEx = tableDataEx.map((row) => {
    return [row[1], row[3]];
  });

  var canvaId = `graph${pos}${cont}`;

  if (!document.getElementById(canvaId)) {
    var canva1 = document.createElement('canvas');
    canva1.id = canvaId;
    canva1.width = 400;
    canva1.height = 400;
    graphContainer.appendChild(canva1);
    container.appendChild(graphContainer);
    /* container.appendChild(rowContainer3); */
    createGraph(
      canvaId,
      canva1,
      data1,
      data2,
      leftLine,
      rightLine,
      leftLineEx,
      rightLineEx,
      cont,
      pos
    );
  } else {
    updateGraph(
      canvaId,
      data1,
      data2,
      leftLine,
      rightLine,
      leftLineEx,
      rightLineEx
    );
  }
}

function updateGraph(canvaId, data1, data2, data3, data4, data5, data6) {
  var chart = Charts[canvaId];
  //console.log(data1, data2, data3, data4);
  // Definir los datos de data1 y data2
  if (!chart) {
    return;
  }
  chart.data.datasets[0].data = data1.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  chart.data.datasets[1].data = data2.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  chart.data.datasets[2].data = data3.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  chart.data.datasets[3].data = data4.map(function (row) {
    return { x: row[1], y: row[0] };
  });
  chart.data.datasets[4].data = data5.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  chart.data.datasets[5].data = data6.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  chart.update();
}

function createGraph(
  canvaId,
  canva,
  data1,
  data2,
  data3,
  data4,
  data5,
  data6,
  cont,
  pos
) {
  //console.log(data1, data2, data3, data4);
  // Definir los datos de data1 y data2
  data1 = data1.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  var data2 = data2.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  var data3 = data3.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  var data4 = data4.map(function (row) {
    return { x: row[1], y: row[0] };
  });
  var data5 = data5.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  var data6 = data6.map(function (row) {
    return { x: row[1], y: row[0] };
  });

  // Configurar los datos para el gráfico
  var config = {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: `SC Piso ${cont * 2 - 1} (Mux, Pu)`,
          data: data1,
          borderColor: 'blue', // Color del borde para los puntos de data1
          backgroundColor: 'blue', // Color de fondo para los puntos de data1
          borderWidth: 1, // Ancho del borde
        },
        {
          label: `SC Piso ${cont * 2} (Mux, Pu)`,
          data: data2,
          borderColor: 'green', // Color del borde para los puntos de data2
          backgroundColor: 'green', // Color de fondo para los puntos de data2
          borderWidth: 1, // Ancho del borde
        },
        {
          label: 'DI Incluido X-X',
          data: data3,
          borderColor: pos == 'Izq' ? 'red' : 'blue', // Color del borde para los puntos de data2
          backgroundColor: pos == 'Izq' ? 'red' : 'blue', // Color de fondo para los puntos de data2
          borderWidth: 0, // Establece el ancho del borde en 0 para que no se muestren puntos
          fill: false, // No rellenar el área debajo de la línea
          type: 'line', // Tipo de gráfico para conectar los puntos con líneas
        },
        {
          label: 'DI Incluido Y-Y',
          data: data4,
          borderColor: pos == 'Izq' ? 'red' : 'blue', // Color del borde para los puntos de data2
          backgroundColor: pos == 'Izq' ? 'red' : 'blue', // Color de fondo para los puntos de data2
          borderWidth: 0, // Establece el ancho del borde en 0 para que no se muestren puntos
          fill: false, // No rellenar el área debajo de la línea
          type: 'line', // Tipo de gráfico para conectar los puntos con líneas
        },
        {
          label: 'DI Excluido X-X',
          data: data5,
          borderColor: 'green', // Color del borde para los puntos de data2
          backgroundColor: 'green', // Color de fondo para los puntos de data2
          borderWidth: 0, // Establece el ancho del borde en 0 para que no se muestren puntos
          fill: false, // No rellenar el área debajo de la línea
          type: 'line', // Tipo de gráfico para conectar los puntos con líneas
        },
        {
          label: 'DI Excluido Y-Y',
          data: data6,
          borderColor: 'yellow', // Color del borde para los puntos de data2
          backgroundColor: 'yellow', // Color de fondo para los puntos de data2
          borderWidth: 0, // Establece el ancho del borde en 0 para que no se muestren puntos
          fill: false, // No rellenar el área debajo de la línea
          type: 'line', // Tipo de gráfico para conectar los puntos con líneas
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'DIAGRAMA DE INTERACCIÓN',
        },
      },
      scales: {
        x: {
          type: 'linear',
          min: -6000,
          max: 6000,
          position: 'bottom',
          title: {
            display: true,
            text: 'Eje X',
          },
        },
        y: {
          type: 'linear',
          min: -1500,
          max: 3500,
          position: 'left',
          title: {
            display: true,
            text: 'Eje Y',
          },
        },
      },
    },
  };

  // Crear el gráfico utilizando Chart.js
  var myChart = new Chart(canva, config);
  charts['canvaId'] = myChart;
}
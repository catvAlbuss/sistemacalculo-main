/* ------------------------ Análisis en X ------------------------ */
var elT1Data = [];
export function elT1(contenedor, formData, table1) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < table1.length; i++) {
    var lc = table1[i][2];
    var emuro = 0.3;
    var k = 1;
    var Bviga = 0.3;
    var Befectivo = Bviga + 4 * emuro;
    var ag = Befectivo * emuro;
    var pn =
      (0.55 *
        formData.designCP *
        formData.fcDF *
        ag *
        Math.pow(100, 2) *
        (1 - Math.pow((k * lc) / (32 * emuro), 2))) /
      1000;
    var pu = 118.09;
    var verifEspesor = pn >= pu ? 'Sí cumple' : 'No cumple, verificar';

    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      lc,
      emuro,
      'Muros Arriostrados No Restringidos',
      k,
      Bviga,
      Befectivo,
      ag,
      pn,
      pu,
      verifEspesor,
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
        'lc',
        'emuro',
        'Casos para Definir',
        'k',
        'Bviga',
        'Befectivo',
        'Ag',
        'ØPn',
        'Pu',
        'Verificación',
      ],
      [
        '',
        '(m)',
        '(m)',
        'Factor de Longitud Efectiva "k"',
        '',
        '(m)',
        '(m)',
        '(m²)',
        '(Ton)',
        '(Ton)',
        'Espesor del Muro',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
      {
        type: 'dropdown',
        source: [
          'Muros Arriostrados Restringidos',
          'Muros Arriostrados No Restringidos',
          'Muros No Arriostrados',
        ],
      }, // Casos
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
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

          if (col == 2) {
            hot.setDataAtCell(row, 6, hot.getDataAtCell(row, 5) + 4 * newValue);
          }
          if (col == 3) {
            // Caso -> newValue
            var casoF = newValue;
            var k = 0;
            // Valor D (cm)
            if (casoF == 'Muros Arriostrados Restringidos') {
              k = 0.8;
            } else if (casoF == 'Muros Arriostrados No Restringidos') {
              k = 1;
            } else if (casoF == 'Muros No Arriostrados') {
              k = 2;
            }
            hot.setDataAtCell(row, 4, k);
          }
          if (col == 4) {
            hot.setDataAtCell(
              row,
              8,
              (0.55 *
                formData.designCP *
                formData.fcDF *
                hot.getDataAtCell(row, 7) *
                Math.pow(100, 2) *
                (1 -
                  Math.pow(
                    (newValue * hot.getDataAtCell(row, 1)) /
                      (32 * hot.getDataAtCell(row, 2)),
                    2
                  ))) /
                1000
            );
          }
          if (col == 5) {
            hot.setDataAtCell(row, 6, newValue + 4 * hot.getDataAtCell(row, 2));
          }
          if (col == 6) {
            hot.setDataAtCell(row, 7, newValue * hot.getDataAtCell(row, 2));
          }
          if (col == 7) {
            hot.setDataAtCell(
              row,
              8,
              (0.55 *
                formData.designCP *
                formData.fcDF *
                newValue *
                Math.pow(100, 2) *
                (1 -
                  Math.pow(
                    (hot.getDataAtCell(row, 4) * hot.getDataAtCell(row, 1)) /
                      (32 * hot.getDataAtCell(row, 2)),
                    2
                  ))) /
                1000
            );
          }
          if (col == 8) {
            hot.setDataAtCell(
              row,
              10,
              newValue >= hot.getDataAtCell(row, 9)
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
          if (col == 9) {
            hot.setDataAtCell(
              row,
              10,
              hot.getDataAtCell(row, 8) >= newValue
                ? 'Sí cumple'
                : 'No cumple, verificar'
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
    .getElementById('saveDataBtnEL1X')
    .addEventListener('click', nextTab2);

  function nextTab2() {
    elT1Data = hot.getData();
    var contenedor = document.getElementById('elT2');
    elT2(contenedor, elT1Data);
  }
}

function elT2(contenedor, elT1Data) {
  var container = contenedor;
  var data = [];
  for (let i = 0; i < elT1Data.length; i++) {
    var aplica = 'Sí';
    var Bcol = aplica == 'Sí' ? elT1Data[i][5] + 0.1 : '-';
    var aplicaDesign =
      aplica == 'Sí'
        ? 'Diseña Sección como si Fuera una Columna'
        : 'No Diseñar y/o Verificar';

    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      aplica,
      Bcol,
      aplicaDesign, // Verificación de la Compresión Pura
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
      '¿Se Aplica Diseño?',
      'Bcol (m)',
      'Aplicación del Diseño según Artículo 21.9.3.5.',
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      {
        type: 'dropdown',
        source: ['Sí', 'No'],
      },
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

          if (col == 1) {
            // Caso -> newValue
            var aplica = newValue;
            var bcol = 0;
            var design = '';
            if (aplica == 'Sí') {
              bcol = elT1Data[row][5] + 0.1;
              design = 'Diseña Sección como si Fuera una Columna';
            } else if (aplica == 'No') {
              bcol = '-';
              design = 'No Diseñar y/o Verificar';
            }
            hot.setDataAtCell(row, 2, bcol);
            hot.setDataAtCell(row, 3, design);
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
}

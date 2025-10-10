/* ------------------------ Análisis en X ------------------------ */
export function dcpT1X(contenedor, initialData, formData, tableData1DC) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var lc = tableData1DC[i][2];
    var t = formData.exDF;
    var ag = formData.agVA;
    var k = 1;
    var ØPn =
      0.55 *
      formData.designCP *
      formData.fcDF *
      10 *
      ag *
      (1 - Math.pow((k * lc) / (32 * t), 2));
    var pu = initialData[i][1];
    var verifComPura = ØPn >= pu ? 'Sí cumple' : 'No cumple, verificar';

    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      lc, // lc (m)
      t, // t (m)
      ag, // Ag (m²)
      'Muros Arriostrados No Restringidos', // Casos para Definir el Factor de Longitud Efectiva "k"
      k, // k
      ØPn, // ØPn (Ton)
      pu, // Pu (Ton)
      verifComPura, // Verificación de la Compresión Pura
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
        't',
        'Ag',
        'Casos para Definir',
        'k',
        'ØPn',
        'Pu',
        'Verificación',
      ],
      [
        '',
        '(m)',
        '(m)',
        '(m²)',
        'Factor de Longitud Efectiva "k"',
        '',
        '(Ton)',
        '(Ton)',
        'Compresión Pura',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      { type: 'numeric', readOnly: true }, // lc (m)
      { type: 'numeric', readOnly: true }, // t (m)
      { type: 'numeric', readOnly: true }, // Ag (m²)
      {
        type: 'dropdown',
        source: [
          'Muros Arriostrados Restringidos',
          'Muros Arriostrados No Restringidos',
          'Muros No Arriostrados',
        ],
      }, // Casos para Definir el Factor de Longitud Efectiva "k"
      { type: 'numeric', readOnly: true }, // k
      { type: 'numeric', readOnly: true }, // ØPn (Ton)
      { type: 'numeric', readOnly: true }, // Pu (Ton)
      { type: 'text' }, // Verificación de la Compresión Pura
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

          if (col === 4) {
            // Valor Acero -> newValue
            var casosK = newValue;
            var k = 0;
            // Valor D (cm)
            if (casosK == 'Muros Arriostrados Restringidos') {
              k = 0.8;
            } else if (casosK == 'Muros Arriostrados No Restringidos') {
              k = 1;
            } else if (casosK == 'Muros No Arriostrados') {
              k = 2;
            }
            hot.setDataAtCell(row, 5, k);
          }
          if (col == 5) {
            hot.setDataAtCell(
              row,
              6,
              0.55 *
                formData.designCP *
                formData.fcDF *
                10 *
                hot.getDataAtCell(row, 3) *
                (1 -
                  Math.pow(
                    (newValue * hot.getDataAtCell(row, 1)) /
                      (32 * hot.getDataAtCell(row, 2)),
                    2
                  ))
            );
          }
          if (col == 6) {
            hot.setDataAtCell(
              row,
              8,
              newValue >= hot.getDataAtCell(row, 7)
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
        });
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });
}

/* ------------------------ Análisis en Y ------------------------ */
export function dcpT1Y(contenedor, initialData, formData, tableData1DC) {
  var container = contenedor;

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var lc = tableData1DC[i][2];
    var t = formData.eyDF;
    var ag = formData.agVA;
    var k = 1;
    var ØPn =
      0.55 *
      formData.designCP *
      formData.fcDF *
      10 *
      ag *
      (1 - Math.pow((k * lc) / (32 * t), 2));
    var pu = initialData[i][1];
    var verifComPura = ØPn >= pu ? 'Sí cumple' : 'No cumple, verificar';

    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      lc, // lc (m)
      t, // t (m)
      ag, // Ag (m²)
      'Muros Arriostrados No Restringidos', // Casos para Definir el Factor de Longitud Efectiva "k"
      k, // k
      ØPn, // ØPn (Ton)
      pu, // Pu (Ton)
      verifComPura, // Verificación de la Compresión Pura
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
        't',
        'Ag',
        'Casos para Definir',
        'k',
        'ØPn',
        'Pu',
        'Verificación',
      ],
      [
        '',
        '(m)',
        '(m)',
        '(m²)',
        'Factor de Longitud Efectiva "k"',
        '',
        '(Ton)',
        '(Ton)',
        'Compresión Pura',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      { type: 'numeric', readOnly: true }, // lc (m)
      { type: 'numeric', readOnly: true }, // t (m)
      { type: 'numeric', readOnly: true }, // Ag (m²)
      {
        type: 'dropdown',
        source: [
          'Muros Arriostrados Restringidos',
          'Muros Arriostrados No Restringidos',
          'Muros No Arriostrados',
        ],
      }, // Casos para Definir el Factor de Longitud Efectiva "k"
      ,
      { type: 'numeric', readOnly: true }, // k
      { type: 'numeric', readOnly: true }, // ØPn (Ton)
      { type: 'numeric', readOnly: true }, // Pu (Ton)
      { type: 'text' }, // Verificación de la Compresión Pura
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

          if (col === 4) {
            // Valor Acero -> newValue
            var casosK = newValue;
            var k = 0;
            // Valor D (cm)
            if (casosK == 'Muros Arriostrados Restringidos') {
              k = 0.8;
            } else if (casosK == 'Muros Arriostrados No Restringidos') {
              k = 1;
            } else if (casosK == 'Muros No Arriostrados') {
              k = 2;
            }
            hot.setDataAtCell(row, 5, k);
          }
          if (col == 5) {
            hot.setDataAtCell(
              row,
              6,
              0.55 *
                formData.designCP *
                formData.fcDF *
                10 *
                hot.getDataAtCell(row, 3) *
                (1 -
                  Math.pow(
                    (newValue * hot.getDataAtCell(row, 1)) /
                      (32 * hot.getDataAtCell(row, 2)),
                    2
                  ))
            );
          }
          if (col == 6) {
            hot.setDataAtCell(
              row,
              8,
              newValue >= hot.getDataAtCell(row, 7)
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
        });
      }
    },
    licenseKey: 'non-commercial-and-evaluation',
  });
}
/* ------------------------ Análisis en X ------------------------ */
export function vaT1X(contenedor, initialData, formData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var ag = formData.agVA;
    var lgx = formData.lgxVA;
    var ycg = 3;
    var pu = initialData[i][1];
    var mcr = (lgx / ycg) * (2 * Math.sqrt(formData.fcDF * 10) + pu / ag);
    var mcr12 = 1.2 * mcr;
    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      ag, // Ag (m²)
      lgx, // Lgx (m4)
      ycg, // Ycg (m)
      pu, // Pu (Ton)
      mcr, // Mcr (Ton.m)
      mcr12, // 1.2 x Mucr (Ton.m)
      '', // Mnx (Ton.m)
      '', // Mn/Mcr
      '', // Verificación del Agrietamiento
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
        'Ag',
        'Lgx',
        'Ycg',
        'Pu',
        'Mcr',
        '1.2 x Mucr',
        'Mnx',
        'Mn/Mcr',
        'Verificación',
      ],
      [
        '',
        '(m²)',
        '(m4)',
        '(m)',
        '(Ton)',
        '(Ton.m)',
        '(Ton.m)',
        '(Ton.m)',
        '',
        'Agrietamiento',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      { type: 'numeric', readOnly: true }, // Ag (m²)
      { type: 'numeric', readOnly: true }, // Lgx (m4)
      { type: 'numeric' }, // Ycg (m)
      { type: 'numeric', readOnly: true }, // Pu (Ton)
      { type: 'numeric', readOnly: true }, // Mcr (Ton.m)
      { type: 'numeric', readOnly: true }, // 1.2 x Mucr (Ton.m)
      { type: 'numeric', readOnly: true }, // Mnx (Ton.m)
      { type: 'numeric' }, // Mn/Mcr
      { type: 'text', readOnly: true }, // Verificación del Agrietamiento
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

          if (col === 3) {
            hot.setDataAtCell(
              row,
              5,
              (hot.getDataAtCell(row, 2) / newValue) *
                (2 * Math.sqrt(formData.fcDF * 10) +
                  hot.getDataAtCell(row, 4) / hot.getDataAtCell(row, 1))
            );
          }
          if (col == 5) {
            hot.setDataAtCell(row, 6, 1.2 * newValue);
          }
          if (col == 6) {
            hot.setDataAtCell(
              row,
              9,
              hot.getDataAtCell(row, 7) >= newValue
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
          if (col === 7) {
            hot.setDataAtCell(row, 8, newValue / hot.getDataAtCell(row, 5));
            hot.setDataAtCell(
              row,
              9,
              newValue >= hot.getDataAtCell(row, 6)
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
        });
      }
    },
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
}

/* ------------------------ Análisis en Y ------------------------ */
export function vaT1Y(contenedor, initialData, formData) {
  if (!contenedor) return;
  
  var container = contenedor;
  container.innerHTML = '';

  var data = [];

  for (let i = 0; i < initialData.length; i++) {
    var ag = formData.agVA;
    var lgy = formData.lgyVA;
    var xcg = 3;
    var pu = initialData[i][1];
    var mcr = (lgy / xcg) * (2 * Math.sqrt(formData.fcDF * 10) + pu / ag);
    var mcr12 = 1.2 * mcr;
    var dataRow = [
      `Piso ${i + 1}`, //  Nivel
      ag, // Ag (m²)
      lgy, // Lgy (m4)
      xcg, // Xcg (m)
      pu, // Pu (Ton)
      mcr, // Mcr (Ton.m)
      mcr12, // 1.2 x Mucr (Ton.m)
      '', // Mny (Ton.m)
      '', // Mn/Mcr
      '', // Verificación del Agrietamiento
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
        'Ag',
        'Lgy',
        'Xcg',
        'Pu',
        'Mcr',
        '1.2 x Mucr',
        'Mny',
        'Mn/Mcr',
        'Verificación',
      ],
      [
        '',
        '(m²)',
        '(m4)',
        '(m)',
        '(Ton)',
        '(Ton.m)',
        '(Ton.m)',
        '(Ton.m)',
        '',
        'Agrietamiento',
      ],
    ],
    columns: [
      { type: 'text', readOnly: true }, // Nivel
      { type: 'numeric', readOnly: true }, // Ag (m²)
      { type: 'numeric', readOnly: true }, // Lgy (m4)
      { type: 'numeric' }, // Xcg (m)
      { type: 'numeric', readOnly: true }, // Pu (Ton)
      { type: 'numeric', readOnly: true }, // Mcr (Ton.m)
      { type: 'numeric', readOnly: true }, // 1.2 x Mucr (Ton.m)
      { type: 'numeric', readOnly: true }, // Mny (Ton.m)
      { type: 'numeric' }, // Mn/Mcr
      { type: 'text', readOnly: true }, // Verificación del Agrietamiento
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

          if (col === 3) {
            hot.setDataAtCell(
              row,
              5,
              (hot.getDataAtCell(row, 2) / newValue) *
                (2 * Math.sqrt(formData.fcDF * 10) +
                  hot.getDataAtCell(row, 4) / hot.getDataAtCell(row, 1))
            );
          }
          if (col == 5) {
            hot.setDataAtCell(row, 6, 1.2 * newValue);
          }
          if (col == 6) {
            hot.setDataAtCell(
              row,
              9,
              hot.getDataAtCell(row, 7) >= newValue
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
          if (col === 7) {
            hot.setDataAtCell(row, 8, newValue / hot.getDataAtCell(row, 5));
            hot.setDataAtCell(
              row,
              9,
              newValue >= hot.getDataAtCell(row, 6)
                ? 'Sí cumple'
                : 'No cumple, verificar'
            );
          }
        });
      }
    },
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
}
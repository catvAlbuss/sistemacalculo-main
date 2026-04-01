import html2canvas from "html2canvas";
import { makeRoundRenderer } from "./table_model.js";

var irregularidadRigidezPisoBlando = (tb_id) => {
  return {
    id: tb_id,
    formulas: {
      0: (row) => {
        return `${row}`;
      },
      2: (row) => {
        return `=B${row}-B${row + 1}`;
      },
      4: (row) => {
        return `=ABS(D${row}/C${row})`;
      },
      5: (row) => {
        return `=E${row}/E${row - 1}`;
      },
      6: (row) => {
        return `=E${row}/AVERAGE(E${row - 3}:E${row - 1})`;
      },
      7: (row) => {
        return `=+IF(F${row}<0.7,"Si Presenta Irregularida","No presenta Irregularidad")`;
      },
      8: (row) => {
        return `=+IF(G${row}<0.8,"Si Presenta Irregularida","No presenta Irregularidad")`;
      },
    },
    config: {
      data: [[]],
      nestedHeaders: [
        [{ label: "Irregularidad de Rigidez - Piso Blando", colspan: 9 }],
        [
          "Story",
          "∆ Absoluto",
          "∆ Relativo",
          "Vx",
          'Rígidez Lateral "Ki"',
          "Caso I",
          "Caso II",
          { label: "Verificación", colspan: 2 },
        ],
        ["-", "(m)", "(m)", "(Tonf)", "(Tonf/m)", "-", "-", "Caso I", "Caso II"],
      ],
      colWidths: [100, 100, 100, 100, 100, 80, 80, 200, 200],
      columns: [
        // Story
        { type: "numeric", readOnly: false },
        // Absoluto(m)
        { type: "numeric" },
        // Relativo(m)
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(5) },
        // Vx
        { type: "numeric" },
        // Rigidez Lateral
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Caso I
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Caso II
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Caso I
        { type: "text", readOnly: true },
        // Caso II
        { type: "text", readOnly: true },
      ],
      minSpareRows: 1,
      minRows: 1,
      // rowHeaders: true,
      contextMenu: true,
      manualRowMove: true,
    },
  };
};
var irregularidadRigidezPisoBlandoExtrema = (tb_id, tb_irrrpb) => {
  return {
    id: tb_id,
    formulas: {
      0: (row) => {
        return `${row}`;
      },
      1: (row) => {
        return `=${tb_irrrpb.id}!B${row}`;
      },
      2: (row) => {
        return `=B${row}-B${row + 1}`;
      },
      3: (row) => {
        return `=${tb_irrrpb.id}!D${row}`;
      },
      4: (row) => {
        return `=ABS(D${row}/C${row})`;
      },
      5: (row) => {
        return `=E${row}/E${row - 1}`;
      },
      6: (row) => {
        return `=E${row}/AVERAGE(E${row - 3}:E${row - 1})`;
      },
      7: (row) => {
        return `=+IF(F${row}<0.6,"Si Presenta Irregularida","No presenta Irregularidad")`;
      },
      8: (row) => {
        return `=+IF(G${row}<0.7,"Si Presenta Irregularida","No presenta Irregularidad")`;
      },
    },
    config: {
      data: [[]],
      nestedHeaders: [
        [
          {
            label: "Irregularidad de Rigidez - Piso Blando (Extrema)",
            colspan: 9,
          },
        ],
        [
          "Story",
          "∆ Absoluto",
          "∆ Relativo",
          "Vx",
          'Riguidez Latera "Ki"',
          "Caso I",
          "Caso II",
          { label: "Verificación", colspan: 2 },
        ],
        ["-", "(m)", "(m)", "(Tonf)", "(Tonf/m)", "-", "-", "Caso I", "Caso II"],
      ],
      colWidths: [100, 100, 100, 100, 100, 80, 80, 200, 200],
      columns: [
        // Story
        { type: "numeric", readOnly: false },
        // Absoluto(m)
        { type: "numeric", readOnly: true },
        // Relativo(m)
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(5) },
        // Vx
        { type: "numeric", readOnly: true },
        // Rigidez Lateral
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Caso I
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Caso II
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Caso I
        { type: "text", readOnly: true },
        // Caso II
        { type: "text", readOnly: true },
      ],
      minSpareRows: 1,
      minRows: 1,
      // rowHeaders: true,
      contextMenu: true,
      manualRowMove: true,
    },
  };
};
var irregularidadResistenciaPisoDebil = (tb_id, tb_irrrpb) => {
  return {
    id: tb_id,
    formulas: {
      0: (row) => {
        return `${row}`;
      },
      1: (_) => {
        return "SE_X";
      },
      2: (_) => {
        return "Bottom";
      },
      3: (row) => {
        return `=${tb_irrrpb.id}!D${row}+0`;
      },
      4: (row) => {
        return `=D${row}/D${row - 1}`;
      },
      5: (row) => {
        return `=+IF(E${row}<0.8,"Si Presenta Irregularida","No presenta Irregularidad")`;
      },
    },
    config: {
      data: [[]],
      nestedHeaders: [
        [{ label: "Irregularidad de Resistencia - Piso Debil", colspan: 6 }],
        ["Story", "Carga", "Ubicación", "Vx", "Caso I", "VERIFICACIÓN"],
        ["-", "-", "-", "(Tonf)", "-", "-"],
      ],
      colWidths: [100, 100, 100, 100, 100, 200],
      columns: [
        // Story
        { type: "numeric", readOnly: false },
        // Carga
        { type: "text", readOnly: true },
        // Ubicación
        { type: "text", readOnly: true },
        // Vx
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Caso I
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Verificación
        { type: "text", readOnly: true },
      ],
    },
  };
};
var irregularidadResistenciaPisoDebilExtrema = (tb_id, tb_irrrpbe) => {
  return {
    id: tb_id,
    formulas: {
      0: (row) => {
        return `${row}`;
      },
      1: (_) => {
        return "SE_X";
      },
      2: (_) => {
        return "Bottom";
      },
      3: (row) => {
        return `=${tb_irrrpbe.id}!D${row}+0`;
      },
      4: (row) => {
        return `=D${row}/D${row - 1}`;
      },
      5: (row) => {
        return `=+IF(E${row}<0.65,"Si Presenta Irregularida","No presenta Irregularidad")`;
      },
    },
    config: {
      data: [[]],
      nestedHeaders: [
        [
          {
            label: "Irregularidad de Resistencia - Piso Debil (Extrema)",
            colspan: 6,
          },
        ],
        ["Story", "Carga", "Ubicación", "Vx", "Caso I", "VERIFICACIÓN"],
        ["-", "-", "-", "(Tonf)", "-", "-"],
      ],
      colWidths: [100, 100, 100, 100, 100, 200],
      columns: [
        // Story
        { type: "numeric", readOnly: false },
        // Carga
        { type: "text", readOnly: true },
        // Ubicación
        { type: "text", readOnly: true },
        // Vx
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Caso I
        { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
        // Verificación
        { type: "text", readOnly: true },
      ],
    },
  };
};

export var irregularidadRigidezPisoBlandoX =
  irregularidadRigidezPisoBlando("IRRRIPBX");
irregularidadRigidezPisoBlandoX.data = [
  [, 0.037261, , 1.113, , , , ,],
  [, 0.037326, , 45.2289, , , , ,],
  [, 0.034357, , 87.3591, , , , ,],
  [, 0.030983, , 117.2163, , , , ,],
  [, 0.027259, , 139.7958, , , , ,],
  [, 0.023316, , 159.6082, , , , ,],
  [, 0.019114, , 178.005, , , , ,],
  [, 0.014761, , 195.0325, , , , ,],
  [, 0.010041, , 212.2757, , , , ,],
  [, 0.005844, , 226.9524, , , , ,],
  [, 0.002289, , 236.3597, , , , ,],
  [, 0.000134, , 272.4913, , , , ,],
];
export var irregularidadResistenciaPisoDebilX =
  irregularidadResistenciaPisoDebil(
    "IRRREPBX",
    irregularidadRigidezPisoBlandoX
  );
export var irregularidadRigidezPisoBlandoXExtrema =
  irregularidadRigidezPisoBlandoExtrema(
    "IRRRIPBXE",
    irregularidadRigidezPisoBlandoX
  );
export var irregularidadResistenciaPisoDebilXExtrema =
  irregularidadRigidezPisoBlandoExtrema(
    "IRRREPBXE",
    irregularidadRigidezPisoBlandoXExtrema
  );
export var irregularidadRigidezPisoBlandoY =
  irregularidadRigidezPisoBlando("IRRRIPBY");
irregularidadRigidezPisoBlandoY.data = [
  [, 0.036798, , 1.2873, , , , ,],
  [, 0.031771, , 44.6278, , , , ,],
  [, 0.029336, , 88.0183, , , , ,],
  [, 0.026829, , 120.9629, , , , ,],
  [, 0.023871, , 147.1584, , , , ,],
  [, 0.020627, , 170.0573, , , , ,],
  [, 0.017095, , 190.5846, , , , ,],
  [, 0.013362, , 208.5841, , , , ,],
  [, 0.009531, , 226.1575, , , , ,],
  [, 0.005824, , 240.9046, , , , ,],
  [, 0.002474, , 249.9153, , , , ,],
  [, 0.000379, , 272.5106, , , , ,],
];
export var irregularidadResistenciaPisoDebilY =
  irregularidadResistenciaPisoDebil(
    "IRRREPBY",
    irregularidadRigidezPisoBlandoY
  );
export var irregularidadRigidezPisoBlandoYExtrema =
  irregularidadRigidezPisoBlandoExtrema(
    "IRRRIPBYE",
    irregularidadRigidezPisoBlandoY
  );
export var irregularidadResistenciaPisoDebilYExtrema =
  irregularidadResistenciaPisoDebilExtrema(
    "IRRREPBYE",
    irregularidadRigidezPisoBlandoYExtrema
  );
export var irregularidadMasaOPeso = {
  id: "IRRMP",
  formulas: {
    0: (row) => {
      return `Story_${row}`;
    },
    1: (_) => {
      return "PESO: 100%CM+25%CV";
    },
    2: (_) => {
      return "Bottom";
    },
    4: (row) => {
      return `=D${row}-D${row - 1}`;
    },
    5: (row) => {
      return `=E${row - 1}/E${row}`;
    },
    6: (row) => {
      return `=+IF(F${row}>1.5,"Si Presenta Irregularida","No presenta Irregularidad")`;
    },
  },
  config: {
    data: [[]],
    nestedHeaders: [
      [{ label: "Irregularidad de Masa o Peso", colspan: 7 }],
      [
        "Story",
        "Output Case",
        "Location",
        "P",
        "P_Piso",
        "Caso I",
        "VERIFICACIÓN",
      ],
      ["-", "-", "-", "(Tonf)", "(Tonf)", "-", "-"],
    ],
    colWidths: [100, 220, 90, 110, 110, 100, 200],
    // rowHeights: [50, 50, 50, 50, 50, 50, 50, 50],
    columns: [
      // Story
      { type: "text", readOnly: false },
      // Output Case
      { type: "text", readOnly: true },
      // Location
      { type: "text", readOnly: true },
      // P
      { type: "numeric" },
      // P_Piso
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
      // Caso I
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(2) },
      // Verificación
      { type: "text", readOnly: true },
    ],
    minSpareRows: 1,
    minRows: 1,
    // rowHeaders: true,
    contextMenu: true,
    manualRowMove: true,
  },
};
irregularidadMasaOPeso.data = [
  [, , , 2.8549, , ,],
  [, , , 259.0868, , ,],
  [, , , 640.0391, , ,],
  [, , , 1029.9617, , ,],
  [, , , 1419.3893, , ,],
  [, , , 1814.5769, , ,],
  [, , , 2209.7645, , ,],
  [, , , 2604.9521, , ,],
  [, , , 3044.5186, , ,],
  [, , , 3502.6535, , ,],
  [, , , 3973.6687, , ,],
  [, , , 4412.3883, , ,],
];

// function actualizarStoryInvertidoIRRMP(hot) {
//   if (!hot) return;

//   const data = hot.getData();

//   const filasConDatos = data.filter(row =>
//     row.some(cell => cell !== null && cell !== "")
//   ).length;

//   for (let r = 0; r < hot.countRows(); r++) {
//     if (r < filasConDatos) {
//       hot.setDataAtCell(r, 0, `Story_${filasConDatos - r}`, "story");
//     } else {
//       hot.setDataAtCell(r, 0, "", "story");
//     }
//   }

//   hot.render();
// }

export var irregularidadGeometricaVerticalXY = {
  id: "IRRGVXY",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>1.3,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    ["D_X", 32.2, 25.83, ,],
    ["D_Y", 14.6, 5.93, ,],
  ],
  config: {
    nestedHeaders: [
      ["D", "L1", "L2", "L1/L2", "VERIFICACIÓN"],
      ["-", "m", "m", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      // Story
      { type: "text", readOnly: true },
      // Output Case
      { type: "numeric" },
      // Location
      { type: "numeric" },
      // P
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      // P_Piso
      { type: "text", readOnly: true },
    ],
  },
};
export var irregularidadGeometricaVerticalXXYY = {
  id: "IRRGVXXYY",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>1.3,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    ["D_X", 25, 15.9, ,],
    ["D_X", 0, 1, ,],
    ["D_Y", 20, 20, ,],
    ["D_Y", 0, 1, ,],
  ],
  config: {
    nestedHeaders: [
      ["D", "L1", "L2", "L1/L2", "VERIFICACIÓN"],
      ["-", "m", "m", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      // Story
      { type: "text", readOnly: true },
      // Output Case
      { type: "numeric" },
      // Location
      { type: "numeric" },
      // P
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      // P_Piso
      { type: "text", readOnly: true },
    ],
  },
};
export var DSV1 = {
  id: "DSV1",
  formulas: {
    0: (row) => {
      return `PL${row}`;
    },
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    5: (row) => {
      return `=+IF(E${row}>0.1,IF(D${row}>0.25,"Si Presenta Irregularidad","No presenta Irregularidad"),"No presenta Irregularidad")`;
    },
    6: (row) => {
      return `=+IF(E${row}>0.1,IF(D${row}>0.25,"Si Presenta Irregularidad","No presenta Irregularidad"),"No presenta Irregularidad")`;
    },
  },
  data: [
    [, 6.62, 55.45, , 0.5, ,],
    [, 5.2, 55.45, , 0.3, ,],
    [, 1.2, 55.45, , 0.65, ,],
  ],
  config: {
    nestedHeaders: [
      ["Elem", "Vpl", "Vsis", "Vpl/Vsis", "e", "VERIFICACIÓN", "VERIFICACIÓN"],
      ["-", "(PL, C)", "Tonf", "-", "-", "-", "Irregularidad Extrema"],
    ],
    colWidths: [100, 100, 100, 100, 100, 200, 200],
    columns: [
      { type: "text", readOnly: true },
      { type: "numeric" },
      { type: "numeric" },
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      { type: "numeric" },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
    ],
  },
};
export var DSV2 = {
  id: "DSV2",
  formulas: {
    0: (row) => {
      return `PL${row}`;
    },
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    5: (row) => {
      return `=+IF(E${row}>0.1,IF(D${row}>0.25,"Si Presenta Irregularidad","No presenta Irregularidad"),"No presenta Irregularidad")`;
    },
    6: (row) => {
      return `=+IF(E${row}>0.1,IF(D${row}>0.25,"Si Presenta Irregularidad","No presenta Irregularidad"),"No presenta Irregularidad")`;
    },
  },
  data: [
    [, 31.71, "=IRRRIPBY!D11", , 0.0, ,],
    [, 5.2, 55.45, , 0.3, ,],
    [, 1.2, 55.45, , 0.65, ,],
  ],
  config: {
    nestedHeaders: [
      ["Elem", "Vpl", "Vsis", "Vpl/Vsis", "e", "VERIFICACIÓN", "VERIFICACIÓN"],
      ["-", "(PL, C)", "Tonf", "-", "-", "-", "Irregularidad Extrema"],
    ],
    colWidths: [100, 100, 100, 100, 100, 200, 200],
    columns: [
      { type: "text", readOnly: true },
      { type: "numeric" },
      { type: "numeric" },
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      { type: "numeric" },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
    ],
  },
};
export var irregularidadPlantaGeometricaVerticalXY = {
  id: "IRRPGVXY",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>0.2,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    ["D_X", 25.83, 32.2, ,],
    ["D_Y", 5.93, 14.6, ,],
  ],
  config: {
    nestedHeaders: [
      ["D", "Le", "LT", "Le/LT", "VERIFICACION"],
      ["-", "(a,b)", "(A,B)", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      // Story
      { type: "text", readOnly: true },
      // Output Case
      { type: "numeric" },
      // Location
      { type: "numeric" },
      // P
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      // P_Piso
      { type: "text", readOnly: true },
    ],
  },
};
export var irregularidadPlantaGeometricaVerticalXYXY = {
  id: "IRRPGVXYXY",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>0.2,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    ["D_X", 9.5, 25, ,],
    ["D_X", 7.5, 15, ,],
    ["D_Y", 6, 25, ,],
    ["D_Y", 3.5, 15, ,],
  ],
  config: {
    nestedHeaders: [
      ["D", "Le", "LT", "Le/LT", "VERIFICACION"],
      ["-", "(a,b)", "(A,B)", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      // Story
      { type: "text", readOnly: false },
      // Output Case
      { type: "numeric" },
      // Location
      { type: "numeric" },
      // P
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      // P_Piso
      { type: "text", readOnly: true },
    ],
  },
};
export var IRRPDDA1 = {
  id: "IRRPDDA1",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>0.5,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    [1, 45, 375, ,],
    ["-", 0, 1, ,],
  ],
  config: {
    nestedHeaders: [
      ["Area", "A'", "A", `A'/A`, "VERIFICACIÓN"],
      ["-", "(Abertura)", "(Bruta)", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      { type: "text", readOnly: true },
      { type: "numeric" },
      { type: "numeric" },
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      { type: "text", readOnly: true },
    ],
  },
};
export var IRRPDDD1 = {
  id: "IRRPDDD1",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>0.25,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    ["D_X", 6.9, 25, ,],
    ["D_Y", 5, 10, ,],
  ],
  config: {
    nestedHeaders: [
      ["D", "Lr", "L2", `L1/L2`, "VERIFICACIÓN"],
      ["-", "cm", "m", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      { type: "text", readOnly: true },
      { type: "numeric" },
      { type: "numeric" },
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      { type: "text", readOnly: true },
    ],
  },
};
export var IRRPDDA2 = {
  id: "IRRPDDA2",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>0.5,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    [1, 87.44, 478, ,],
    ["-", 0, 1, ,],
  ],
  config: {
    nestedHeaders: [
      ["Area", "A'", "A", `A'/A`, "VERIFICACIÓN"],
      ["-", "(Abertura)", "(Bruta)", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      { type: "text", readOnly: true },
      { type: "numeric" },
      { type: "numeric" },
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      { type: "text", readOnly: true },
    ],
  },
};
export var IRRPDDD2 = {
  id: "IRRPDDD2",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>0.25,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    ["D_X", 25.83, 32.2, ,],
    ["D_Y", 5.93, 14.6, ,],
  ],
  config: {
    nestedHeaders: [
      ["D", "Lr", "L2", `L1/L2`, "VERIFICACIÓN"],
      ["-", "cm", "m", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      { type: "text", readOnly: true },
      { type: "numeric" },
      { type: "numeric" },
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      { type: "text", readOnly: true },
    ],
  },
};
export var sistemasNoParalelosXY = {
  id: "SNPXY",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>0.1,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    ["D_X", 5.85, 55.45, ,],
    ["D_Y", 7.5, 75.82, ,],
  ],
  config: {
    nestedHeaders: [
      ["D", "Vpl", "Vpiso", "Vpl/Vp", "VERIFICACIÓN"],
      ["-", "(Muro)", "Tonf", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      // Story
      { type: "text", readOnly: false },
      // Output Case
      { type: "numeric" },
      // Location
      { type: "numeric" },
      // P
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      // P_Piso
      { type: "text", readOnly: true },
    ],
  },
};
export var sistemasNoParalelosXYXY = {
  id: "SNPXYXY",
  formulas: {
    3: (row) => {
      return `=B${row}/C${row}`;
    },
    4: (row) => {
      return `=+IF(D${row}>0.2,"Si Presenta Irregularidad","No presenta Irregularidad")`;
    },
  },
  data: [
    ["D_X", 6, 25, ,],
    ["D_X", 1.5, 15, ,],
    ["D_Y", 6, 25, ,],
    ["D_Y", 3.5, 15, ,],
  ],
  config: {
    nestedHeaders: [
      ["D", "Le", "LT", "Le/LT", "VERIFICACIÓN"],
      ["-", "(a,b)", "(A,B)", "-", "-"],
    ],
    colWidths: [100, 100, 100, 100, 200],
    columns: [
      // Story
      { type: "text", readOnly: false },
      // Output Case
      { type: "numeric" },
      // Location
      { type: "numeric" },
      // P
      { type: "numeric", readOnly: true, renderer: makeRoundRenderer(3) },
      // P_Piso
      { type: "text", readOnly: true },
    ],
  },
};
export var irregularidadTorsionalXX = {
  id: "IRRTXX",
  formulas: {
    0: (row) => {
      return `${row}`;
    },
    1: (row) => {
      return `DERIVA_XX`;
    },
    2: (row) => {
      return `Combination`;
    },
    3: (row) => {
      return `Max`;
    },
    4: (row) => {
      return `Diaph D${row} X`;
    },
    8: (row) => {
      return `=+IF(H${row}>1.3,"Si Presenta Irregularida","No presenta Irregularidad")`;
    },
    9: (row) => {
      return `=+IF(H${row}>1.5,"Si Presenta Irregularida","No presenta Irregularidad")`;
    },
  },
  config: {
    data: [[]],
    nestedHeaders: [
      [{ label: "Irregularidad Torsional _ XX", colspan: 10 }],
      [
        "Story",
        "Output",
        "Step Type",
        "Step Type",
        "Item",
        "Max Drift",
        "Avg Drift",
        "Ratio",
        "VERIFICACIÓN",
        "VERIFICACIÓN",
      ],
      ["-", "Case", "-", "-", "-", "-", "-", "-", "-", "Irregularidad Extrema"],
    ],
    colWidths: [50, 100, 130, 100, 130, 100, 100, 100, 200, 200],
    columns: [
      { type: "numeric", readOnly: true },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
      { type: "numeric", renderer: makeRoundRenderer(6) },
      { type: "numeric", renderer: makeRoundRenderer(6) },
      { type: "numeric", renderer: makeRoundRenderer(3) },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
    ],
    minSpareRows: 1,
    minRows: 1,
    // rowHeaders: true,
    contextMenu: true,
    manualRowMove: true,
  },
};
irregularidadTorsionalXX.data = [
  [, , , , , 0.000879, 0.000878, 1.001, ,],
  [, , , , , 0.000966, 0.000912, 1.059, ,],
  [, , , , , 0.0, 0.001008, 1.061, ,],
  [, , , , , 0.0, 0.001104, 1.065, ,],
  [, , , , , 0.0, 0.001153, 1.071, ,],
  [, , , , , 0.0, 0.001212, 1.075, ,],
  [, , , , , 0.0, 0.001242, 1.079, ,],
  [, , , , , 0.0, 0.001239, 1.08, ,],
  [, , , , , 0.0, 0.001117, 1.081, ,],
  [, , , , , 0.0, 0.000955, 1.071, ,],
  [, , , , , 0.0, 0.000622, 1.048, ,],
  [, , , , , 0.0, 5.7e-5, 1.064, ,],
];
export var irregularidadTorsionalYY = {
  id: "IRRTYY",
  formulas: {
    0: (row) => {
      return `${row}`;
    },
    1: (row) => {
      return `DERIVA_YY`;
    },
    2: (row) => {
      return `Combination`;
    },
    3: (row) => {
      return `Max`;
    },
    4: (row) => {
      return `Diaph D${row} X`;
    },
    8: (row) => {
      return `=+IF(H${row}>1.3,"Si Presenta Irregularida","No presenta Irregularidad")`;
    },
    9: (row) => {
      return `=+IF(H${row}>1.5,"Si Presenta Irregularida","No presenta Irregularidad")`;
    },
  },
  config: {
    data: [[]],
    nestedHeaders: [
      [{ label: "Irregularidad Torsional _ YY", colspan: 10 }],
      [
        "Story",
        "Output",
        "Step Type",
        "Step Type",
        "Item",
        "Max Drift",
        "Avg Drift",
        "Ratio",
        "VERIFICACIÓN",
        "VERIFICACIÓN",
      ],
      ["-", "Case", "-", "-", "-", "-", "-", "-", "-", "Irregularidad Extrema"],
    ],
    colWidths: [50, 100, 130, 100, 130, 100, 100, 100, 200, 200],
    columns: [
      { type: "numeric", readOnly: true },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
      { type: "numeric", renderer: makeRoundRenderer(6) },
      { type: "numeric", renderer: makeRoundRenderer(6) },
      { type: "numeric", renderer: makeRoundRenderer(3) },
      { type: "text", readOnly: true },
      { type: "text", readOnly: true },
    ],
    minSpareRows: 1,
    minRows: 1,
    // rowHeaders: true,
    contextMenu: true,
    manualRowMove: true,
  },
};
irregularidadTorsionalYY.data = [
  [, , , , , 0.000807, 0.0008, 1.008, ,],
  [, , , , , 0.000938, 0.000775, 1.21, ,],
  [, , , , , 0.0, 0.000886, 1.207, ,],
  [, , , , , 0.0, 0.001002, 1.199, ,],
  [, , , , , 0.0, 0.001083, 1.19, ,],
  [, , , , , 0.0, 0.001164, 1.179, ,],
  [, , , , , 0.0, 0.001214, 1.167, ,],
  [, , , , , 0.0, 0.001221, 1.15, ,],
  [, , , , , 0.0, 0.001117, 1.12, ,],
  [, , , , , 0.0, 0.000965, 1.135, ,],
  [, , , , , 0.0, 0.00064, 1.178, ,],
  [, , , , , 0.0, 0.000124, 1.139, ,],
];

// CAPTURA DE IMAGENES
document.addEventListener("DOMContentLoaded", () => {
  inicializarCapturasGenerales();
});

function inicializarCapturasGenerales() {
  const botones = document.querySelectorAll("[data-capture]");

  botones.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const tableId = btn.dataset.capture;
      const wrapperId = `wrap-${tableId}`;

      const nombreArchivo = obtenerNombreTabla(tableId);

      await capturarTablaGeneral(wrapperId, nombreArchivo);
    });
  });
}

function obtenerNombreTabla(id) {
  const nombres = {
    // SECCION IRREGULARIDAD EN ALTURA | IA. "K", "V"
    IRRRIPBX: "Irregularidad_De_Rigidez-Piso_Blando_X",
    IRRREPBX: "Irregularidad_De_Resistencia-Piso_Débil_X",
    IRRRIPBY: "Irregularidad_De_Rigidez-Piso_Blando_Y",
    IRRREPBY: "Irregularidad_De_Resistencia-Piso_Débil_Y",

    IRRRIPBXE: "Irregularidad_De_Rigidez-Piso_Blando_X_Extrema",
    IRRREPBYE: "Irregularidad_De_Resistencia-Piso_Débil_Y_Extrema",

    // SECCION IRREGULARIDAD EN ALTURA | MASA O PESO
    IRRMP: "Irregularidad_De_Masa_O_Peso",

    // SECCION IRREGULARIDAD EN ALTURA | IGV, DSR
    IRRGV: "Altura_Irregularidad_Geometrica_Vertical",
    DSV: "Altura_Discontinuidad_En_Los_Sistemas_Resistentes",

    // SECCION IRREGULARIDAD EN PLANTA | IGV, DSR
    IRRPGVXY: "Planta_Irregularidad_Geometrica_Vertical",
    IRRPDD: "Planta_Discontinuidad_En_Los_Sistemas_Resistentes",

    // SECCION IRREGULARIDAD EN PLANTA | Sistemas No Paralelos
    SNPXY: "Sistemas_No_Paralelos",

    // SECCION IRREGULARIDAD EN PLANTA | Irregularidad Torsional
    IRRTXX: "Irregularidad_Torsional_XX",
    IRRTYY: "Irregularidad_Torsional_YY",

    // SECCION IRREGULARIDAD TORSIONAL
    D: "Irregularidad_Torsional",
  };

  return nombres[id] || id;
}

function limpiarHeadersSobrantes(tablaClon) {
  const filasHeader = tablaClon.querySelectorAll("thead tr");

  filasHeader.forEach((fila) => {
    const celdas = Array.from(fila.children);

    for (let i = celdas.length - 1; i >= 0; i--) {
      const celda = celdas[i];
      const texto = (celda.textContent || "").trim();
      const colspan = Number(celda.getAttribute("colspan") || "1");
      const rowspan = Number(celda.getAttribute("rowspan") || "1");

      const estaVacia = texto === "" || texto === "\u00A0";

      if (estaVacia && colspan === 1 && rowspan === 1) {
        celda.remove();
      } else {
        break;
      }
    }
  });
}

function estilizarTablaClon(tablaClon) {
  tablaClon.style.borderCollapse = "collapse";
  tablaClon.style.background = "#ffffff";
  tablaClon.style.color = "#111827";
  tablaClon.style.fontSize = "14px";
  tablaClon.style.fontFamily = "Arial, sans-serif";
  tablaClon.style.tableLayout = "auto";
  tablaClon.style.width = "auto";
  tablaClon.style.maxWidth = "none";

  tablaClon.querySelectorAll("th, td").forEach((cell) => {
    cell.style.border = "1px solid #d1d5db";
    cell.style.padding = "10px 12px";
    cell.style.lineHeight = "1.4";
    cell.style.height = "auto";
    cell.style.minHeight = "34px";
    cell.style.verticalAlign = "middle";
    cell.style.whiteSpace = "normal";
    cell.style.overflow = "visible";
    cell.style.textOverflow = "clip";
    cell.style.boxSizing = "border-box";
  });

  tablaClon.querySelectorAll("th").forEach((th) => {
    th.style.fontWeight = "700";
    th.style.background = "#f8fafc";
    th.style.textAlign = "center";
    th.style.paddingTop = "12px";
    th.style.paddingBottom = "12px";
  });
}

async function capturarTablaGeneral(wrapperId, nombreArchivo = "tabla") {
  const elemento = document.getElementById(wrapperId);

  if (!elemento) {
    console.error(`No se encontró el wrapper con id: ${wrapperId}`);
    return;
  }

  try {
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 500));

    // SOLO tablas principales de Handsontable, evita duplicados
    const tablasRenderizadas = elemento.querySelectorAll(".ht_master .htCore");

    // Si no encuentra ninguna tabla principal, captura el wrapper normal
    if (!tablasRenderizadas.length) {
      const canvas = await html2canvas(elemento, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = `${nombreArchivo}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      return;
    }

    // Contenedor temporal
    const clonWrapper = document.createElement("div");
    clonWrapper.style.position = "fixed";
    clonWrapper.style.left = "-99999px";
    clonWrapper.style.top = "0";
    clonWrapper.style.background = "#ffffff";
    clonWrapper.style.padding = "24px";
    clonWrapper.style.width = "max-content";
    clonWrapper.style.maxWidth = "none";
    clonWrapper.style.zIndex = "999999";
    clonWrapper.style.display = "flex";
    clonWrapper.style.flexDirection = "column";
    clonWrapper.style.gap = "16px";
    clonWrapper.style.alignItems = "flex-start";

    tablasRenderizadas.forEach((tablaRenderizada) => {
      const tablaClon = tablaRenderizada.cloneNode(true);

      limpiarHeadersSobrantes(tablaClon);
      estilizarTablaClon(tablaClon);

      clonWrapper.appendChild(tablaClon);
    });

    document.body.appendChild(clonWrapper);

    const canvas = await html2canvas(clonWrapper, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: clonWrapper.scrollWidth,
      windowHeight: clonWrapper.scrollHeight,
    });

    const link = document.createElement("a");
    link.download = `${nombreArchivo}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    document.body.removeChild(clonWrapper);
  } catch (error) {
    console.error("Error al capturar la tabla:", error);
  }
}

// MOSTRAR RESULTADO DE IRREGULARIDAD DE RIGIDEZ - PISO BLANDO EN X
document.addEventListener("DOMContentLoaded", () => {
  const btnVerificarX = document.getElementById("IRRRIPBXBtn");
  const resultadoX = document.getElementById("result-IRRREPBX");

  if (btnVerificarX && resultadoX) {
    btnVerificarX.addEventListener("click", () => {
      resultadoX.classList.remove("hidden");
    });
  }
});

// MOSTRAR RESULTADO DE IRREGULARIDAD DE RIGIDEZ - PISO BLANDO EN Y
document.addEventListener("DOMContentLoaded", () => {
  const btnVerificarX = document.getElementById("IRRRIPBYBtn");
  const resultadoX = document.getElementById("result-IRRREPBY");

  if (btnVerificarX && resultadoX) {
    btnVerificarX.addEventListener("click", () => {
      resultadoX.classList.remove("hidden");
    });
  }
});

// OCULTAR RESULTADO DE IRREGULARIDAD DE RIGIDEZ - PISO BLANDO
// const btnExtremaX = document.getElementById("IRRRIPBXNext");

// if (btnExtremaX && resultadoX) {
//     btnExtremaX.addEventListener("click", () => {
//         resultadoX.classList.add("hidden");
//     });
// }

// const content = document.getElementById("content-ia-masa");
// content.classList.remove("hidden");

// setTimeout(() => {
//     if (window.irregularidadMasaPeso?.render) {
//         window.irregularidadMasaPeso.render();
//         window.irregularidadMasaPeso.refreshDimensions();
//     }
// }, 100);
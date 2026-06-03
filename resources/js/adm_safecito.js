import { Grid } from "./safecito/grid.js";
import { Shape, Marker, Point } from "./safecito/shapes.js";
import { pointDistance, formatCoordinate, getMousePos } from "./safecito/utils.js";
import { matlabColorScale } from "./matlab/color_scale.js";
import { read as readmat } from "mat-for-js";
import { createSpreeadSheetTable } from "./tabulator_base/table_factory.js";
import { makeCreateDeleteColumn } from "./tabulator_base/table.js";
import Plotly from "plotly.js-dist-min";
import Swal from "sweetalert2";
import logo from "../img/rizabalasociados.png";

function getBase64Image(imgPath, callback) {
  var img = new Image();
  img.crossOrigin = "Anonymous"; // Para evitar problemas con CORS
  img.onload = function () {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    callback(dataURL, img.width, img.height);
  };
  img.src = imgPath;
}

const swalTailwind = Swal.mixin({
  customClass: {
    confirmButton:
      "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
  },
  buttonsStyling: false,
});

("use strict");

document.addEventListener("DOMContentLoaded", () => {
  const datosGeneralesColumns = (headers = ["PD", "PL", "SISMO"]) => [
    makeCreateDeleteColumn("#datosGenerales"),
    {
      title: "Columna",
      field: "column",
      editor: "number",
    },
    {
      title: "X",
      field: "x",
      editor: "number",
    },
    {
      title: "Y",
      field: "y",
      editor: "number",
    },
    {
      title: headers[0] ?? "PD",
      columns: [
        {
          title: "F2",
          field: "pd1",
          editor: "number",
        },
        {
          title: "MX",
          field: "pd2",
          editor: "number",
        },
        {
          title: "MY",
          field: "pd3",
          editor: "number",
        },
      ],
    },
    {
      title: headers[1] ?? "PL",
      columns: [
        {
          title: "F2",
          field: "pl1",
          editor: "number",
        },
        {
          title: "MX",
          field: "pl2",
          editor: "number",
        },
        {
          title: "MY",
          field: "pl3",
          editor: "number",
        },
      ],
    },
    {
      title: headers[2] ?? "SISMO",
      columns: [
        {
          title: "F2",
          field: "sismo1",
          editor: "number",
        },
        {
          title: "MX",
          field: "sismo2",
          editor: "number",
        },
        {
          title: "MY",
          field: "sismo3",
          editor: "number",
        },
      ],
    },
  ];

  const datosGeneralesModel = (id) => {
    return {
      id: id,
      data: [
        {
          id: 1,
          column: 27,
          x: 0,
          y: 0,
          pd1: 5.1319,
          pd2: -0.0348,
          pd3: 0.0803,
          pl1: 0.0912,
          pl2: -0.0009,
          pl3: 0.0001,
          sismo1: 6.0318,
          sismo2: 3.0391,
          sismo3: 0.1554,
        },
        {
          id: 2,
          column: 1,
          x: 0,
          y: 14.13,
          pd1: 10.2057,
          pd2: 0.1979,
          pd3: 0.1814,
          pl1: 1.5233,
          pl2: 0.1312,
          pl3: 0.0191,
          sismo1: 2.5603,
          sismo2: 3.2251,
          sismo3: 0.8937,
        },
        {
          id: 3,
          column: 3,
          x: 4.8,
          y: 14.13,
          pd1: 9.8239,
          pd2: 0.2463,
          pd3: 0.0002,
          pl1: 1.4297,
          pl2: 0.1277,
          pl3: 0.0185,
          sismo1: 2.5856,
          sismo2: 2.7967,
          sismo3: 0.8873,
        },
        {
          id: 4,
          column: 5,
          x: 0,
          y: 10.87,
          pd1: 13.3251,
          pd2: -0.0238,
          pd3: 0.1576,
          pl1: 2.5238,
          pl2: -0.0266,
          pl3: 0.0146,
          sismo1: 1.8216,
          sismo2: 3.6588,
          sismo3: 0.4599,
        },
        {
          id: 5,
          column: 7,
          x: 4.8,
          y: 10.87,
          pd1: 18.7931,
          pd2: 0.1901,
          pd3: 0.0595,
          pl1: 3.0877,
          pl2: 0.0709,
          pl3: 0.0257,
          sismo1: 32.1112,
          sismo2: 4.5443,
          sismo3: 2.4735,
        },
        {
          id: 6,
          column: 12,
          x: 0,
          y: 7.23,
          pd1: 14.7282,
          pd2: -0.1881,
          pd3: 0.1981,
          pl1: 1.6038,
          pl2: -0.1404,
          pl3: 0.0089,
          sismo1: 1.9516,
          sismo2: 3.593,
          sismo3: 0.419,
        },
        {
          id: 7,
          column: 13,
          x: 4.8,
          y: 7.23,
          pd1: 14.7224,
          pd2: -0.3165,
          pd3: -0.1065,
          pl1: 1.8861,
          pl2: -0.2279,
          pl3: 0.0054,
          sismo1: 0.4018,
          sismo2: 2.9011,
          sismo3: 0.4681,
        },
        {
          id: 8,
          column: 15,
          x: 6.72,
          y: 7.23,
          pd1: 9.9749,
          pd2: 0.0000408,
          pd3: -0.0061,
          pl1: 0.807,
          pl2: -0.0716,
          pl3: 0.0027,
          sismo1: 1.4632,
          sismo2: 3.4036,
          sismo3: 0.4395,
        },
        {
          id: 9,
          column: 17,
          x: 0,
          y: 2.73,
          pd1: 9.4622,
          pd2: -0.0227,
          pd3: 0.0391,
          pl1: -0.1035,
          pl2: 0.0068,
          pl3: 0.0023,
          sismo1: 3.794,
          sismo2: 3.6411,
          sismo3: 0.2977,
        },
        {
          id: 10,
          column: 19,
          x: 4.8,
          y: 2.73,
          pd1: 10.763,
          pd2: -0.2191,
          pd3: 0.0164,
          pl1: 0.0193,
          pl2: -0.0092,
          pl3: 0.0033,
          sismo1: 2.1638,
          sismo2: 1.7708,
          sismo3: 0.2303,
        },
        {
          id: 11,
          column: 21,
          x: 6.72,
          y: 2.73,
          pd1: 6.3618,
          pd2: 0.0513,
          pd3: 0.0301,
          pl1: -0.0489,
          pl2: 0.0162,
          pl3: 0.0047,
          sismo1: 3.8355,
          sismo2: 3.4022,
          sismo3: 0.2552,
        },
        {
          id: 12,
          column: 23,
          x: 4.8,
          y: 0,
          pd1: 8.2016,
          pd2: -0.0442,
          pd3: 0.0308,
          pl1: 0.0553,
          pl2: 0.0009,
          pl3: 0.0035,
          sismo1: 10.7601,
          sismo2: 3.3956,
          sismo3: 1.0017,
        },
        {
          id: 13,
          column: 25,
          x: 6.72,
          y: 0,
          pd1: 5.4082,
          pd2: 0.0524,
          pd3: 0.0285,
          pl1: -0.0155,
          pl2: 0.0127,
          pl3: 0.0034,
          sismo1: 16.1751,
          sismo2: 3.8987,
          sismo3: 0.9936,
        },
        {
          id: 14,
          column: 166,
          x: 6.72,
          y: 10.87,
          pd1: 10.6504,
          pd2: 0.2522,
          pd3: 0.05,
          pl1: 0.9954,
          pl2: 0.1076,
          pl3: 0.0182,
          sismo1: 32.9814,
          sismo2: 4.4079,
          sismo3: 2.3816,
        },
      ],
      config: {
        /* layout: "fitDataTable", */
        height: 480,
        columns: datosGeneralesColumns(),
      },
    };
  };

  const combinacionDeCargasModel = (id) => {
    return {
      id: id,
      data: [
        { id: 1, column1: "Pm + Pv", column2: "MXm + MXv", column3: "MYm + MYv" },
        { id: 2, column1: "Pm + 0.7 * PS", column2: "MXm + 0.7 * MXS", column3: "MYm" },
        { id: 3, column1: "Pm + 0.7 * PS", column2: "MXm - 0.7 * MXS", column3: "MYm" },
        { id: 4, column1: "Pm + 0.7 * PS", column2: "MXm", column3: "MYm + 0.7 * MYS" },
        { id: 5, column1: "Pm + 0.7 * PS", column2: "MXm", column3: "MYm - 0.7 * MYS" },
        {
          id: 6,
          column1: "Pm + 0.75 * Pv + 0.7 * 0.75 * PS",
          column2: "MXm + 0.75 * MXv + 0.7 * 0.75 * MXS",
          column3: "MYm + 0.75 * MYv",
        },
        {
          id: 7,
          column1: "Pm + 0.75 * Pv + 0.7 * 0.75 * PS",
          column2: "MXm + 0.75 * MXv - 0.7 * 0.75 * MXS",
          column3: "MYm + 0.75 * MYv",
        },
        {
          id: 8,
          column1: "Pm + 0.75 * Pv + 0.7 * 0.75 * PS",
          column2: "MXm + 0.75 * MXv",
          column3: "MYm + 0.75 * MYv + 0.7 * 0.75 * MYS",
        },
        {
          id: 9,
          column1: "Pm + 0.75 * Pv + 0.7 * 0.75 * PS",
          column2: "MXm + 0.75 * MXv",
          column3: "MYm + 0.75 * MYv - 0.7 * 0.75 * MYS",
        },
        { id: 10, column1: "0.6 * Pm + 0.7 * PS", column2: "0.6 * MXm", column3: "0.6 * MYm + 0.7 * MYS" },
        { id: 11, column1: "0.6 * Pm + 0.7 * PS", column2: "0.6 * MXm", column3: "0.6 * MYm - 0.7 * MYS" },
      ],
      config: {
        height: 480,
        columns: [
          makeCreateDeleteColumn(id),
          {
            title: "Combinacion de Cargas",
            columns: [
              {
                title: "",
                field: "column1",
                editor: "input",
              },
              {
                title: "",
                field: "column2",
                editor: "input",
              },
              {
                title: "",
                field: "column3",
                editor: "input",
              },
            ],
          },
        ],
      },
    };
  };

  let combinaciones;
  const datosGenerales = createSpreeadSheetTable(datosGeneralesModel("#datosGenerales"));
  const combinacionDeCargas = createSpreeadSheetTable(combinacionDeCargasModel("#combinacionDeCargas"));
  const excelFileInput = document.getElementById("excelFile");
  const importarExcelButton = document.getElementById("importarExcel");
  const connectivityExcelFileInput = document.getElementById("connectivityExcelFile");
  const importarConnectivityExcelButton = document.getElementById("importarConnectivityExcel");
  const connectivityExcelContainer = document.getElementById("connectivityExcelContainer");
  const excelCombosContainer = document.getElementById("excelCombosContainer");
  const excelCombosList = document.getElementById("excelCombosList");
  const excelCombosStatus = document.getElementById("excelCombosStatus");
  const reactionExcelConfig = document.getElementById("reactionExcelConfig");
  const reactionSheetInput = document.getElementById("reactionSheet");
  const reactionStartRowInput = document.getElementById("reactionStartRow");
  const reactionPointColumnInput = document.getElementById("reactionPointColumn");
  const reactionComboColumnInput = document.getElementById("reactionComboColumn");
  const reactionF2ColumnInput = document.getElementById("reactionF2Column");
  const reactionMxColumnInput = document.getElementById("reactionMxColumn");
  const reactionMyColumnInput = document.getElementById("reactionMyColumn");
  const coordinateExcelConfig = document.getElementById("coordinateExcelConfig");
  const coordinateSheetInput = document.getElementById("coordinateSheet");
  const coordinateStartRowInput = document.getElementById("coordinateStartRow");
  const coordinatePointColumnInput = document.getElementById("coordinatePointColumn");
  const coordinateXColumnInput = document.getElementById("coordinateXColumn");
  const coordinateYColumnInput = document.getElementById("coordinateYColumn");
  const propiedadesSection = document.getElementById("propiedadesSection");
  const calculoActions = document.getElementById("calculoActions");
  let reactionWorkbook = null;
  let reactionWorkbookFile = null;
  let coordinateWorkbook = null;
  let coordinateWorkbookFile = null;
  let jointReactionsRows = [];
  let pendingSelectedCombos = [];
  let pendingDatosGeneralesRows = [];
  let selectedComboOrder = [];

  const readCellText = (row, columnNumber) => {
    const cellValue = row.getCell(columnNumber).value;
    if (cellValue === null || cellValue === undefined) {
      return "";
    }
    if (typeof cellValue === "object") {
      if (cellValue.text !== undefined) {
        return String(cellValue.text).trim();
      }
      if (cellValue.result !== undefined) {
        return String(cellValue.result).trim();
      }
      if (Array.isArray(cellValue.richText)) {
        return cellValue.richText.map((item) => item.text).join("").trim();
      }
    }
    return String(cellValue).trim();
  };

  const readCellNumber = (row, columnNumber) => {
    const value = row.getCell(columnNumber).value;
    if (value === null || value === undefined || value === "") {
      return "";
    }
    if (typeof value === "object" && value.result !== undefined) {
      return value.result;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const setExcelCombosStatus = (message, isError = false) => {
    excelCombosStatus.textContent = message;
    excelCombosStatus.classList.toggle("text-red-600", isError);
    excelCombosStatus.classList.toggle("dark:text-red-400", isError);
    excelCombosStatus.classList.toggle("text-gray-600", !isError);
    excelCombosStatus.classList.toggle("dark:text-gray-400", !isError);
  };

  const columnLabelToNumber = (label) => {
    const cleanLabel = String(label ?? "")
      .trim()
      .toUpperCase();

    if (/^\d+$/.test(cleanLabel)) {
      const columnNumber = Number(cleanLabel);
      if (columnNumber > 0) {
        return columnNumber;
      }
    }

    if (!/^[A-Z]+$/.test(cleanLabel)) {
      throw new Error(`La columna "${label}" no es valida. Usa letras de Excel, por ejemplo A, C o AA.`);
    }

    return cleanLabel.split("").reduce((columnNumber, letter) => {
      return columnNumber * 26 + letter.charCodeAt(0) - 64;
    }, 0);
  };

  const getStartRow = (input, fallback = 5) => {
    const startRow = Number(input.value);
    return Number.isInteger(startRow) && startRow > 0 ? startRow : fallback;
  };

  const populateSheetSelect = (select, workbook, preferredSheetName) => {
    const sheets = workbook.worksheets ?? [];
    select.innerHTML = sheets
      .map((worksheet) => `<option value="${escapeHtml(worksheet.name)}">${escapeHtml(worksheet.name)}</option>`)
      .join("");

    const preferredWorksheet = workbook.getWorksheet(preferredSheetName);
    if (preferredWorksheet) {
      select.value = preferredWorksheet.name;
      return;
    }

    if (sheets[0]) {
      select.value = sheets[0].name;
    }
  };

  const validateExcelFile = (file, label) => {
    if (!file) {
      throw new Error(`Selecciona el Excel de ${label} antes de importar.`);
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      throw new Error(`El archivo de ${label} debe estar en formato .xlsx.`);
    }
    if (!window.ExcelJS) {
      throw new Error("La libreria ExcelJS no esta disponible en esta pantalla.");
    }
  };

  const loadWorkbook = async (file, label) => {
    validateExcelFile(file, label);
    const workbook = new window.ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    return workbook;
  };

  const resetImportedData = () => {
    selectedComboOrder = [];
    pendingSelectedCombos = [];
    pendingDatosGeneralesRows = [];
    jointReactionsRows = [];
    excelCombosList.innerHTML = "";
    excelCombosContainer.classList.add("hidden");
    connectivityExcelFileInput.value = "";
    connectivityExcelContainer.classList.add("hidden");
    connectivityExcelFileInput.disabled = true;
    importarConnectivityExcelButton.disabled = true;
    coordinateExcelConfig.classList.add("hidden");
    propiedadesSection.classList.add("hidden");
    calculoActions.classList.add("hidden");
  };

  const resetCoordinateStep = () => {
    pendingSelectedCombos = [];
    pendingDatosGeneralesRows = [];
    connectivityExcelFileInput.value = "";
    connectivityExcelContainer.classList.add("hidden");
    connectivityExcelFileInput.disabled = true;
    importarConnectivityExcelButton.disabled = true;
    coordinateExcelConfig.classList.add("hidden");
    propiedadesSection.classList.add("hidden");
    calculoActions.classList.add("hidden");
  };

  const getReactionImportConfig = () => {
    return {
      sheetName: reactionSheetInput.value || "Joint Reactions",
      startRow: getStartRow(reactionStartRowInput),
      pointColumn: columnLabelToNumber(reactionPointColumnInput.value || "C"),
      comboColumn: columnLabelToNumber(reactionComboColumnInput.value || "D"),
      f2Column: columnLabelToNumber(reactionF2ColumnInput.value || "K"),
      mxColumn: columnLabelToNumber(reactionMxColumnInput.value || "L"),
      myColumn: columnLabelToNumber(reactionMyColumnInput.value || "M"),
    };
  };

  const getCoordinateImportConfig = () => {
    return {
      sheetName: coordinateSheetInput.value || "Point Object Connectivity",
      startRow: getStartRow(coordinateStartRowInput),
      pointColumn: columnLabelToNumber(coordinatePointColumnInput.value || "A"),
      xColumn: columnLabelToNumber(coordinateXColumnInput.value || "F"),
      yColumn: columnLabelToNumber(coordinateYColumnInput.value || "G"),
    };
  };

  const buildDatosGeneralesRows = (selectedCombos, coordinatesByColumn = new Map()) => {
    const comboFields = [
      ["pd1", "pd2", "pd3"],
      ["pl1", "pl2", "pl3"],
      ["sismo1", "sismo2", "sismo3"],
    ];
    const rowsByColumn = new Map();

    jointReactionsRows.forEach((sourceRow) => {
      const comboIndex = selectedCombos.indexOf(sourceRow.combo);
      if (comboIndex === -1 || !sourceRow.column) {
        return;
      }

      if (!rowsByColumn.has(sourceRow.column)) {
        const coordinates = coordinatesByColumn.get(sourceRow.column) ?? {};
        rowsByColumn.set(sourceRow.column, {
          id: rowsByColumn.size + 1,
          column: sourceRow.column,
          x: coordinates.x ?? "",
          y: coordinates.y ?? "",
          pd1: "",
          pd2: "",
          pd3: "",
          pl1: "",
          pl2: "",
          pl3: "",
          sismo1: "",
          sismo2: "",
          sismo3: "",
        });
      }

      const targetRow = rowsByColumn.get(sourceRow.column);
      const [f2Field, mxField, myField] = comboFields[comboIndex];
      targetRow[f2Field] = sourceRow.f2;
      targetRow[mxField] = sourceRow.mx;
      targetRow[myField] = sourceRow.my;
    });

    return [...rowsByColumn.values()];
  };

  const renderDatosGeneralesRows = async (selectedCombos, rows, successMessage) => {
    await datosGenerales.setColumns(datosGeneralesColumns(selectedCombos));
    await datosGenerales.setData(rows);
    datosGenerales.clearHistory();
    datosGenerales.redraw();
    setExcelCombosStatus(successMessage);
  };

  const applyJointReactionSelection = async (selectedCombos) => {
    pendingSelectedCombos = selectedCombos;
    pendingDatosGeneralesRows = buildDatosGeneralesRows(selectedCombos);
    connectivityExcelContainer.classList.remove("hidden");
    connectivityExcelFileInput.disabled = false;
    importarConnectivityExcelButton.disabled = false;
    await renderDatosGeneralesRows(
      selectedCombos,
      pendingDatosGeneralesRows,
      `${pendingDatosGeneralesRows.length} columnas importadas. Ahora importa el Excel de coordenadas.`
    );
    swalTailwind.fire({
      icon: "info",
      title: "Reacciones importadas",
      text: `Se importaron ${pendingDatosGeneralesRows.length} filas. Falta importar el Excel de coordenadas.`,
    });
  };

  const readPointObjectConnectivity = async (file) => {
    if (!coordinateWorkbook || coordinateWorkbookFile !== file) {
      coordinateWorkbook = await loadWorkbook(file, "coordenadas");
      coordinateWorkbookFile = file;
      populateSheetSelect(coordinateSheetInput, coordinateWorkbook, "Point Object Connectivity");
      coordinateExcelConfig.classList.remove("hidden");
    }

    const config = getCoordinateImportConfig();
    const worksheet = coordinateWorkbook.getWorksheet(config.sheetName);

    if (!worksheet) {
      throw new Error(`No se encontro la hoja ${config.sheetName}.`);
    }

    const coordinatesByColumn = new Map();
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < config.startRow) {
        return;
      }

      const pointName = readCellText(row, config.pointColumn);
      if (!pointName || coordinatesByColumn.has(pointName)) {
        return;
      }

      coordinatesByColumn.set(pointName, {
        x: readCellNumber(row, config.xColumn),
        y: readCellNumber(row, config.yColumn),
      });
    });

    if (!coordinatesByColumn.size) {
      throw new Error(
        `No se encontraron coordenadas desde la hoja ${config.sheetName}, fila ${config.startRow}.`
      );
    }

    return coordinatesByColumn;
  };

  const renderJointReactionCombos = (combos) => {
    selectedComboOrder = [];
    pendingSelectedCombos = [];
    pendingDatosGeneralesRows = [];
    connectivityExcelFileInput.value = "";
    connectivityExcelContainer.classList.add("hidden");
    connectivityExcelFileInput.disabled = true;
    importarConnectivityExcelButton.disabled = true;
    coordinateExcelConfig.classList.add("hidden");
    propiedadesSection.classList.add("hidden");
    calculoActions.classList.add("hidden");
    excelCombosList.innerHTML = combos
      .map(
        (combo, index) => `
          <label class="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <input class="excel-combo-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" type="checkbox" value="${index}">
            <span>${escapeHtml(combo)}</span>
          </label>`
      )
      .join("");
    excelCombosContainer.classList.remove("hidden");
    setExcelCombosStatus("Selecciona 3 combinaciones.");

    excelCombosList.querySelectorAll(".excel-combo-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", async () => {
        const combo = combos[Number(checkbox.value)];

        if (checkbox.checked && selectedComboOrder.length === 3) {
          checkbox.checked = false;
          setExcelCombosStatus("Solo puedes seleccionar 3 combinaciones.", true);
          return;
        }

        if (checkbox.checked) {
          selectedComboOrder.push(combo);
        } else {
          selectedComboOrder = selectedComboOrder.filter((selectedCombo) => selectedCombo !== combo);
        }

        excelCombosList.querySelectorAll(".excel-combo-checkbox:not(:checked)").forEach((item) => {
          item.disabled = selectedComboOrder.length === 3;
        });

        if (selectedComboOrder.length === 3) {
          await applyJointReactionSelection([...selectedComboOrder]);
        } else {
          resetCoordinateStep();
          setExcelCombosStatus(`Selecciona ${3 - selectedComboOrder.length} combinacion(es) mas.`);
        }
      });
    });
  };

  excelFileInput.addEventListener("change", async () => {
    resetImportedData();
    reactionWorkbook = null;
    reactionWorkbookFile = null;
    reactionExcelConfig.classList.add("hidden");

    const file = excelFileInput.files?.[0];
    if (!file) {
      return;
    }

    try {
      reactionWorkbook = await loadWorkbook(file, "reacciones");
      reactionWorkbookFile = file;
      populateSheetSelect(reactionSheetInput, reactionWorkbook, "Joint Reactions");
      reactionExcelConfig.classList.remove("hidden");
      excelCombosContainer.classList.remove("hidden");
      setExcelCombosStatus("Configura hoja y columnas, luego importa las combinaciones.");
    } catch (error) {
      excelCombosContainer.classList.remove("hidden");
      setExcelCombosStatus(error.message || "No se pudo leer el Excel de reacciones.", true);
    }
  });

  connectivityExcelFileInput.addEventListener("change", async () => {
    coordinateWorkbook = null;
    coordinateWorkbookFile = null;
    coordinateExcelConfig.classList.add("hidden");
    propiedadesSection.classList.add("hidden");
    calculoActions.classList.add("hidden");

    const file = connectivityExcelFileInput.files?.[0];
    if (!file) {
      return;
    }

    try {
      coordinateWorkbook = await loadWorkbook(file, "coordenadas");
      coordinateWorkbookFile = file;
      populateSheetSelect(coordinateSheetInput, coordinateWorkbook, "Point Object Connectivity");
      coordinateExcelConfig.classList.remove("hidden");
      setExcelCombosStatus("Configura hoja y columnas de coordenadas, luego importa coordenadas.");
    } catch (error) {
      setExcelCombosStatus(error.message || "No se pudo leer el Excel de coordenadas.", true);
    }
  });

  [
    reactionSheetInput,
    reactionStartRowInput,
    reactionPointColumnInput,
    reactionComboColumnInput,
    reactionF2ColumnInput,
    reactionMxColumnInput,
    reactionMyColumnInput,
  ].forEach((input) => {
    input.addEventListener("change", () => {
      if (jointReactionsRows.length || selectedComboOrder.length) {
        selectedComboOrder = [];
        jointReactionsRows = [];
        excelCombosList.innerHTML = "";
        resetCoordinateStep();
        setExcelCombosStatus("La configuracion cambio. Importa nuevamente las combinaciones.");
      }
    });
  });

  [coordinateSheetInput, coordinateStartRowInput, coordinatePointColumnInput, coordinateXColumnInput, coordinateYColumnInput].forEach(
    (input) => {
      input.addEventListener("change", () => {
        propiedadesSection.classList.add("hidden");
        calculoActions.classList.add("hidden");
        if (pendingSelectedCombos.length === 3) {
          pendingDatosGeneralesRows = buildDatosGeneralesRows(pendingSelectedCombos);
          renderDatosGeneralesRows(
            pendingSelectedCombos,
            pendingDatosGeneralesRows,
            "La configuracion de coordenadas cambio. Importa coordenadas nuevamente."
          );
        }
      });
    }
  );

  importarConnectivityExcelButton.addEventListener("click", async () => {
    if (pendingSelectedCombos.length !== 3) {
      setExcelCombosStatus("Selecciona primero 3 combinaciones del Excel de reacciones.", true);
      excelCombosContainer.classList.remove("hidden");
      return;
    }

    try {
      setExcelCombosStatus("Leyendo Excel de coordenadas...");
      const coordinatesByColumn = await readPointObjectConnectivity(connectivityExcelFileInput.files?.[0]);
      const rows = buildDatosGeneralesRows(pendingSelectedCombos, coordinatesByColumn);
      const rowsWithCoordinates = rows.filter((row) => row.x !== "" || row.y !== "").length;
      const rowsWithoutCoordinates = rows.length - rowsWithCoordinates;
      pendingDatosGeneralesRows = rows;

      await renderDatosGeneralesRows(
        pendingSelectedCombos,
        rows,
        `${rows.length} columnas importadas con ${rowsWithCoordinates} coordenadas encontradas.`
      );
      propiedadesSection.classList.remove("hidden");
      calculoActions.classList.remove("hidden");

      swalTailwind.fire({
        icon: rowsWithoutCoordinates ? "warning" : "success",
        title: "Coordenadas importadas",
        text: rowsWithoutCoordinates
          ? `Se rellenaron ${rowsWithCoordinates} filas. ${rowsWithoutCoordinates} no tuvieron coincidencia en Point Object Connectivity.`
          : `Se rellenaron X/Y para ${rowsWithCoordinates} filas.`,
      });
    } catch (error) {
      setExcelCombosStatus(error.message || "No se pudo importar el Excel de coordenadas.", true);
      swalTailwind.fire({
        icon: "error",
        title: "Importacion fallida",
        text: error.message || "No se pudo importar el Excel de coordenadas.",
      });
    }
  });

  importarExcelButton.addEventListener("click", async () => {
    const file = excelFileInput.files?.[0];

    try {
      setExcelCombosStatus("Leyendo archivo Excel...");
      excelCombosContainer.classList.remove("hidden");
      if (!reactionWorkbook || reactionWorkbookFile !== file) {
        reactionWorkbook = await loadWorkbook(file, "reacciones");
        reactionWorkbookFile = file;
        populateSheetSelect(reactionSheetInput, reactionWorkbook, "Joint Reactions");
        reactionExcelConfig.classList.remove("hidden");
      }

      const config = getReactionImportConfig();
      const worksheet = reactionWorkbook.getWorksheet(config.sheetName);

      if (!worksheet) {
        throw new Error(`No se encontro la hoja ${config.sheetName}.`);
      }

      const combos = [];
      const seenCombos = new Set();
      jointReactionsRows = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber < config.startRow) {
          return;
        }

        const combo = readCellText(row, config.comboColumn);
        if (!combo) {
          return;
        }

        const column = readCellText(row, config.pointColumn);
        jointReactionsRows.push({
          column,
          combo,
          f2: readCellNumber(row, config.f2Column),
          mx: readCellNumber(row, config.mxColumn),
          my: readCellNumber(row, config.myColumn),
        });

        if (!seenCombos.has(combo)) {
          seenCombos.add(combo);
          combos.push(combo);
        }
      });

      if (!combos.length) {
        throw new Error(`No se encontraron combinaciones desde la hoja ${config.sheetName}, fila ${config.startRow}.`);
      }

      renderJointReactionCombos(combos);
    } catch (error) {
      excelCombosList.innerHTML = "";
      setExcelCombosStatus(error.message || "No se pudo importar el archivo Excel.", true);
      swalTailwind.fire({
        icon: "error",
        title: "Importacion fallida",
        text: error.message || "No se pudo importar el archivo Excel.",
      });
    }
  });
  // Init GUI Components
  const canvas = document.querySelector("#plot canvas");

  const form = document.querySelector("#plot form");
  const ctx = canvas.getContext("2d");
  const editor = document.getElementById("editor");
  const input = document.createElement("input");

  input.type = "number";
  input.style.color = "black";
  input.style.position = "absolute";
  input.style.width = "100px";
  input.style.top = 0;
  input.style.left = 0;
  input.style.transform = "translate(-50%,-50%)";

  // Global vars
  const Tools = {
    MOVE: 0,
    LINE: 1,
    ADD: 2,
    CUT: 3,
    ORIGIN: 4,
    VISIBILITY: 5,
    COLORIZE: 6,
    SELECT: 7,
    NONE: 8,
    EDIT: 9,
    COPY: 10,
  };
  const shapes = [];
  let markers = [];

  let selectedPoint = null;
  let selectedMarker = null;
  const xIn = document.getElementById("x");
  const yIn = document.getElementById("y");

  xIn.addEventListener("input", () => {
    const value = parseFloat(xIn.value);
    if (!isNaN(value) && selectedPoint) {
      selectedPoint.x = value;
    }
    redraw();
  });

  yIn.addEventListener("input", () => {
    const value = parseFloat(yIn.value);
    if (!isNaN(value) && selectedPoint) {
      selectedPoint.y = value;
    }
    redraw();
  });

  var shape,
    isDragging = false,
    dragStart,
    grid,
    currentTool = Tools.LINE,
    mousePos = { x: 0, y: 0 },
    snap_enabled = true;
  input.addEventListener("keyup", (ev) => {
    if (ev.which === 13) {
      const last_point = shape.getLastPoint();
      const unitVec = {
        x: (mousePos.x - last_point.x) / pointDistance(last_point, mousePos),
        y: (mousePos.y - last_point.y) / pointDistance(last_point, mousePos),
      };
      const distance = parseFloat(input.value);
      const newPoint = { x: last_point.x + unitVec.x * distance, y: last_point.y + unitVec.y * distance };
      const collided = markers.find((marker) => {
        return pointDistance(grid.worldToScreen(marker.point), grid.worldToScreen(newPoint)) < 5;
      });
      const isDone = shape.addPointToEnd(grid.worldToScreen(collided?.point ?? newPoint), grid);
      if (isDone) {
        shape.calcularPropiedades();
        shapes.push(shape);
        editor.removeChild(input);
        shape = new Shape(true);
      }
    }
  });

  document.getElementById("snap").addEventListener("change", (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      grid.gridSpacing = value;
    }
  });

  let handleIsSelected = false;
  let selectedHandleIndex = 0;
  let polygonsHtmlCache = "";
  // Functions
  function windowResize() {
    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    canvas.width = parseFloat(getComputedStyle(canvas).width) * scale;
    canvas.height = parseFloat(getComputedStyle(canvas).height) * scale;
    grid.set(parseInt(form.zoom.value), canvas);
    redraw();
  }
  function closestMarker(searchPoint) {
    // Returns null if there are 0 points in the shape
    var shortestDistance = 5;
    for (let index = 0; index < markers.length; index++) {
      const p = markers[index].point;
      const distance = pointDistance(searchPoint, grid.worldToScreen(p));
      if (distance <= shortestDistance) {
        return markers[index];
      }
    }
  }
  function closestPoint(searchPoint) {
    // Returns null if there are 0 points in the shape
    var shortestDistance = 5;
    for (let index = 0; index < shapes.length; index++) {
      const collided = shapes[index].points.find((p, index, points) => {
        const distance = pointDistance(searchPoint, grid.worldToScreen(p));
        return distance <= shortestDistance;
      });
      if (collided) {
        return collided;
      }
    }
  }
  function closestNode(searchPoint) {
    var shortestDistance = 5;
    let node = null;
    const s = shapes.find((s) => {
      return s.points.find((p) => {
        node = p;
        return pointDistance(searchPoint, grid.worldToScreen(p)) <= shortestDistance;
      });
    });
    return s ? { shape: s, node: node } : null;
  }
  function closestLine(searchPoint) {
    var shortestDistance = 10;
    return shapes.find((s) => {
      for (let index = 0; index < s.points.length; index++) {
        const lineLength = pointDistance(
          grid.worldToScreen(s.points[index % s.points.length]),
          grid.worldToScreen(s.points[(index + 1) % s.points.length])
        );
        const d1 = pointDistance(grid.worldToScreen(s.points[index % s.points.length]), searchPoint);
        const d2 = pointDistance(grid.worldToScreen(s.points[(index + 1) % s.points.length]), searchPoint);
        if (d1 + d2 >= lineLength - shortestDistance && d1 + d2 <= lineLength + shortestDistance) {
          return true;
        }
      }
    });
  }
  function undo() {
    redraw();
  }
  function redo() {
    redraw();
  }
  function switchTool(newTool) {
    currentTool = newTool;
    redraw();
  }
  function drawFinishedShape(s) {
    var i, p, color, line_color;
    ctx.save();
    // Draw lines
    if (s.points.length >= 2) {
      line_color = "white";
      ctx.strokeStyle = line_color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i < s.points.length; i++) {
        p = grid.worldToScreen(s.points[i]);
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
          continue;
        }
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.strokeStyle = line_color;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
      }
      if (s.points.length > 2) {
        const begin = grid.worldToScreen(s.points[0]);
        ctx.lineTo(begin.x, begin.y);
        ctx.stroke();
      }
      ctx.stroke();
    }

    // Draw vertex handles
    for (i = 0; i < s.points.length; i++) {
      if (handleIsSelected && i === selectedHandleIndex) {
        color = "red";
      } else if (i == s.points.length - 1) {
        color = "blue";
      } else if (i == 0) {
        color = "cyan";
      } else {
        color = "red";
      }
      p = grid.worldToScreen(s.points[i]);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, grid.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
  function redraw() {
    var x_pos = 10;
    var y_pos = 15;
    var y_step = 15;
    grid.draw(ctx);
    markers.forEach((m) => {
      m.draw(grid, ctx);
    });
    shapes.forEach((s) => {
      drawFinishedShape(s);
    });
    shape.draw(grid, ctx);

    ctx.save();
    ctx.font = "12px Helvetica";

    // Show snap mode
    ctx.fillStyle = snap_enabled ? "white" : "red";
    ctx.fillText(snap_enabled ? "Snap Enabled" : "Snap Disabled", x_pos, y_pos);
    y_pos += y_step;

    // Show mouse coordinates
    ctx.fillStyle = "white";
    ctx.fillText("(" + formatCoordinate(mousePos.x) + ", " + formatCoordinate(mousePos.y) + ")", x_pos, y_pos);
    y_pos += y_step;

    // Show current tool
    var modeText = "";
    switch (currentTool) {
      case Tools.MOVE:
        modeText = "Move";
        break;
      case Tools.LINE:
        modeText = "Line";
        var last_point = shape.getLastPoint();
        if (last_point) {
          var c = grid.worldToScreen(last_point);
          const mouse = grid.worldToScreen(mousePos);
          ctx.setLineDash([]);
          ctx.strokeStyle = "gray";
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
        break;
      case Tools.ADD:
        modeText = "Add";
        break;
      case Tools.CUT:
        modeText = "Cut";
        break;
      case Tools.COPY:
        modeText = "Clonar";
        break;
      case Tools.EDIT:
        modeText = "Editar Punto";
        break;
    }
    ctx.fillText(modeText, x_pos, y_pos);
    ctx.restore();

    const polygonsHtml = `
         ${shapes.reduce((body, shape, index) => {
           const propiedades = shape.propiedades();
           return (
             body +
             `<tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="p-0" colspan="4">
                      <div class="relative inline-block">
                          <table class="inline-block text-gray-800 dark:text-white">
                              <tbody id="polygons">
                                  <tr
                                      class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                      <th class="text-xl py-2 px-4 text-left" colspan="4">
                                          Propiedades
                                      </th>
                                  </tr>
                                  <tr
                                      class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                      <th class="text-lg py-2 px-8" scope="col"
                                          colspan="2">P</th>
                                      <td class="py-2 px-4">${propiedades.P.toFixed(2)}</td>
                                  </tr>
                                  <tr
                                      class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                      <th class="text-lg py-2 px-8" scope="col"
                                          colspan="2">A</th>
                                      <td class="py-2 px-4">${propiedades.A.toFixed(2)}</td>
                                  </tr>
                                  <tr
                                      class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                      <th class="text-lg py-2 px-8" scope="col"
                                          colspan="2">IX</th>
                                      <td class="py-2 px-4">${propiedades.IX.toFixed(2)}</td>
                                  </tr>
                                  <tr
                                      class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                      <th class="text-lg py-2 px-8" scope="col"
                                          colspan="2">
                                          IY</th>
                                      <td class="py-2 px-4">${propiedades.IY.toFixed(2)}</td>
                                  </tr>
                                  <tr
                                      class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                      <th class="text-lg py-2 px-8" scope="col"
                                          colspan="2">
                                          XC</th>
                                      <td class="py-2 px-4">${propiedades.XC.toFixed(2)}</td>
                                  </tr>
                                  <tr
                                      class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                      <th class="text-lg py-2 px-8" scope="col"
                                          colspan="2">
                                          YC</th>
                                      <td class="py-2 px-4">${propiedades.YC.toFixed(2)}</td>
                                  </tr>
                                  <tr
                                      class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                      <th class="text-lg py-2 px-8" scope="col"
                                          colspan="2">
                                          MX</th>
                                      <td class="py-2 px-4">${propiedades.MX.toFixed(2)}</td>
                                  </tr>
                                  <tr
                                      class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                      <th class="text-lg py-2 px-8" scope="col"
                                          colspan="2">
                                          MY</th>
                                      <td class="py-2 px-4">${propiedades.MY.toFixed(2)}</td>
                                  </tr>
                                  <tr
                                      class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                      <th class="text-lg py-2 px-8" scope="col"
                                          colspan="2">
                                          IXY</th>
                                      <td class="py-2 px-4">${propiedades.IXY.toFixed(2)}</td>
                                  </tr>
                              </tbody>
                          </table><table
                              class="inline-block text-gray-800 dark:text-white absolute overflow-y-auto top-0 bottom-0">
                              <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                <th class="text-xl py-2 px-4 text-left" colspan="4">Poligono ${index + 1}
                                </th>
                              </tr>
                              <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                <th class="text-lg py-2 px-8" scope="col">X
                                </th>
                                <th class="text-lg py-2 px-4" scope="col">Y</th>
                              </tr>
                              ${shape.points.reduce((body, p) => {
                                return (
                                  body +
                                  `
                                  <tr class="bg-gray-100 dark:bg-gray-600">
                                    <td class="py-2 px-4">${p.x.toFixed(2)}</td>
                                    <td class="py-2 px-4">${p.y.toFixed(2)}</td>
                                  </tr>`
                                );
                              }, "")}
                          </table>
                      </div>
                  </td>
              </tr>`
           );
         }, "")}
          `;
    if (polygonsHtml !== polygonsHtmlCache) {
      document.getElementById("polygons").innerHTML = polygonsHtml;
      polygonsHtmlCache = polygonsHtml;
    }
  }
  shape = new Shape(true);
  grid = new Grid();
  windowResize();
  redraw();
  window.onresize = windowResize;
  form.zoom.oninput = function () {
    // Responds during slide Firefox, Safari, Chrome
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.set(parseInt(this.value), canvas);
    redraw();
  };
  form.zoom.onchange = function () {
    // IE10 support (IE10 does not support oninput)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.set(parseInt(this.value), canvas);
    redraw();
  };
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const { x, y } = getMousePos(canvas, e);
      const prevMouse = grid.screenToWorld({ x: x, y: y });
      if (e.deltaY < 0) {
        grid.scaleX *= 1.1;
        grid.scaleY *= 1.1;
      } else {
        grid.scaleX *= 0.9;
        grid.scaleY *= 0.9;
      }
      const translatedMouse = grid.screenToWorld({ x: x, y: y });
      grid.offestX += prevMouse.x - translatedMouse.x;
      grid.offestY += prevMouse.y - translatedMouse.y;
      redraw();
    },
    { passive: false }
  );
  canvas.onmousedown = function (evt) {
    evt.preventDefault();
    const { x, y } = getMousePos(canvas, evt);
    switch (currentTool) {
      case Tools.LINE:
        const collided = markers.find((marker) => {
          const d = pointDistance(grid.worldToScreen(marker.point), { x: x, y: y });
          return d < 5;
        });
        const isDone = shape.addPointToEnd(grid.worldToScreen(collided?.point ?? mousePos), grid);
        if (shape.points.length >= 1) {
          editor.appendChild(input);
        }
        if (isDone) {
          shape.calcularPropiedades();
          shapes.push(shape);
          editor.removeChild(input);
          shape = new Shape(true);
        }
        break;
      case Tools.MOVE:
        if (evt.button == 1 || 1 == (evt.button & 2)) {
          isDragging = true;
          dragStart = { x: x, y: y };
          return;
        }
        if (selectedHandleIndex?.node) {
          let marker = closestMarker({ x: x, y: y });
          if (marker) {
            const dX = marker.point.x - selectedHandleIndex.node.x;
            const dY = marker.point.y - selectedHandleIndex.node.y;
            selectedHandleIndex.shape.points.forEach((point) => {
              point.x += dX;
              point.y += dY;
            });
          }
          selectedMarker = null;
          selectedPoint = null;
          selectedHandleIndex = null;
          handleIsSelected = false;
        } else if (handleIsSelected || selectedMarker) {
          handleIsSelected = false;
          let marker = closestMarker({ x: x, y: y });
          if (marker && !selectedMarker) {
            selectedMarker = marker;
          } else if (marker && selectedMarker) {
            selectedHandleIndex.calcularPropiedades();
            const { XC: xc, YC: yc } = selectedHandleIndex.propiedades();
            const midPoints = {
              x: (marker.point.x + selectedMarker.point.x) * 0.5,
              y: (marker.point.y + selectedMarker.point.y) * 0.5,
            };
            const dX = midPoints.x - xc;
            const dY = midPoints.y - yc;
            selectedHandleIndex.points.forEach((point) => {
              point.x += dX;
              point.y += dY;
            });
            selectedMarker = null;
            selectedPoint = null;
            selectedHandleIndex = null;
            handleIsSelected = false;
            switchTool(-1);
            canvas.style.cursor = "default";
          }
        } else {
          /* let index = closestPoint({ x: x, y: y }); */
          let index;
          const closest = closestNode({ x: x, y: y });
          if (closest) {
            handleIsSelected = true;
            selectedHandleIndex = closest;
          } else if ((index = closestLine({ x: x, y: y }))) {
            handleIsSelected = true;
            selectedHandleIndex = index;
          }
        }
        break;
      case Tools.CUT:
        const deleteShape = closestLine({ x: x, y: y });
        const index = shapes.indexOf(deleteShape);
        if (index !== -1) {
          shapes.splice(index, 1);
        }
        break;
      case Tools.COPY:
        const cloneShape = closestLine({ x: x, y: y });
        if (cloneShape) {
          handleIsSelected = true;
          shape = structuredClone(cloneShape);
          shape = Object.assign(Object.create(Object.getPrototypeOf(cloneShape)), shape);
          shapes.push(shape);
          selectedHandleIndex = shape;
          shape = new Shape(true);
          switchTool(Tools.MOVE);
          canvas.style.cursor = "move";
        }
        break;
      case Tools.EDIT:
        selectedPoint = closestPoint({ x: x, y: y });
        if (selectedPoint) {
          xIn.value = selectedPoint.x;
          yIn.value = selectedPoint.y;
        }
        break;
    }
    redraw();
  };
  canvas.onmouseup = (evt) => {
    if (evt.button == 1 || 1 == (evt.button & 2)) {
      isDragging = false;
    }
  };
  canvas.onmouseleave = () => {
    isDragging = false;
  };
  canvas.onmousemove = function (evt) {
    const { x, y } = getMousePos(canvas, evt);
    mousePos = grid.screenToWorld({ x: x, y: y });
    if (snap_enabled) {
      mousePos.x = Math.round(mousePos.x / grid.gridSpacing) * grid.gridSpacing;
      mousePos.y = Math.round(mousePos.y / grid.gridSpacing) * grid.gridSpacing;
    }
    if (currentTool === Tools.LINE && shape) {
      const last_point = shape.getLastPoint();
      if (last_point) {
        const lp = grid.worldToScreen(last_point);
        const unitVec = {
          x: (x - lp.x) / pointDistance(lp, { x: x, y: y }),
          y: (y - lp.y) / pointDistance(lp, { x: x, y: y }),
        };
        const perpUnitVec = { x: -unitVec.y, y: unitVec.x };
        const midPoint = { x: (lp.x + x) * 0.5, y: (lp.y + y) * 0.5 };
        const mid = { x: midPoint.x + perpUnitVec.x * 100, y: midPoint.y + perpUnitVec.y * 100 };
        input.style.top = mid.y + "px";
        input.style.left = mid.x + "px";
        input.value = pointDistance(last_point, mousePos).toFixed(2);
        input.focus();
        input.select();
      }
    } else if (currentTool === Tools.MOVE) {
      if (isDragging) {
        grid.offestX -= (x - dragStart.x) / grid.scaleX;
        grid.offestY += (y - dragStart.y) / grid.scaleY;
        dragStart = { x: x, y: y };
      }
      if (handleIsSelected) {
        if (selectedHandleIndex instanceof Shape) {
          selectedHandleIndex.calcularPropiedades();
          const { XC: xc, YC: yc } = selectedHandleIndex.propiedades();
          const dX = mousePos.x - xc;
          const dY = mousePos.y - yc;
          selectedHandleIndex.points.forEach((point) => {
            point.x += dX;
            point.y += dY;
          });
        } else if (selectedHandleIndex?.shape) {
          const dX = mousePos.x - selectedHandleIndex.node.x;
          const dY = mousePos.y - selectedHandleIndex.node.y;
          selectedHandleIndex.shape.points.forEach((point) => {
            point.x += dX;
            point.y += dY;
          });
        }
      }
    }
    redraw();
  };
  // Button
  document.getElementById("pencil").onclick = function () {
    switchTool(Tools.LINE);
    canvas.style.cursor = "crosshair";
  };
  document.getElementById("arrows").onclick = function () {
    switchTool(Tools.MOVE);
    canvas.style.cursor = "move";
  };
  document.getElementById("plus").onclick = function () {
    switchTool(Tools.ADD);
  };
  document.getElementById("scissors").onclick = function () {
    switchTool(Tools.CUT);
    canvas.style.cursor = "crosshair";
  };
  document.getElementById("anchor").onclick = function () {
    snap_enabled = !snap_enabled;
    redraw();
  };
  document.getElementById("copy").onclick = function () {
    switchTool(Tools.COPY);
    canvas.style.cursor = "copy";
  };
  document.getElementById("crosshairs").onclick = function () {
    switchTool(Tools.EDIT);
    canvas.style.cursor = "cell";
  };
  var color_index;
  for (color_index = 1; color_index <= 16; color_index++) {
    (function (_color_index) {
      document.getElementById("color:" + _color_index).onclick = function () {
        switchTool(Tools.COLORIZE);
        current_selected_color = _color_index;
      };
    })(color_index);
  }
  // Keyboard handler
  document.addEventListener("keydown", function (evt) {
    switch (evt.keyCode) {
      case 77: // "M"
      case 27: // <escape>
        editor.removeChild(input);
        if (shape.points.length >= 2) {
          shape.calcularPropiedades();
          shapes.push(shape);
        }
        shape = new Shape(true);
        selectedMarker = null;
        selectedPoint = null;
        selectedHandleIndex = null;
        handleIsSelected = false;
        switchTool(-1);
        canvas.style.cursor = "default";
        redraw();
        break;
        /*       case 76: // "L"
        switchTool(Tools.LINE);
        break;
      case 65: // "A"
        switchTool(Tools.ADD);
        break;
      case 67: // "C"
        switchTool(Tools.CUT);
        break;
      case 79: // "O"
        switchTool(Tools.ORIGIN);
        break;
      case 86: // "V"
        switchTool(Tools.VISIBILITY);
        break;
      case 85: // "U"
        undo();
        break;
      case 82: // "R"
        redo();
        break;
      case 83: // "S" */
        snap_enabled = !snap_enabled;
        redraw();
        break;
    }
  });

  document.getElementById("zapatas2Form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = datosGenerales.getData();
    markers = data.map((row) => {
      return new Marker({ x: parseFloat(row.x), y: parseFloat(row.y) }, row.column);
    });
    const xx = markers.map((m) => m.point.x);
    const yy = markers.map((m) => m.point.y);
    const cminx = Math.min(...xx);
    const cmaxx = Math.max(...xx);

    const cminy = Math.min(...yy);
    const cmaxy = Math.max(...yy);

    const dX = Math.abs(cminx - cmaxx);
    const scaleX = canvas.width / dX;
    grid.scaleX = scaleX;
    grid.scaleY = scaleX;

    const dY = Math.abs(cminy - cmaxy);
    const scaleY = canvas.height / dY;
    grid.scaleY = grid.scaleX = scaleX < scaleY ? scaleX * 0.9 : scaleY * 0.9;

    grid.offestX = 0;
    grid.offestY = 0;
    const range = grid.screenToWorld({ x: canvas.width * 0.5, y: canvas.height * 0.5 });

    grid.offestX = (cminx + cmaxx) * 0.5 - range.x;
    grid.offestY = (cminy + cmaxy) * 0.5 - range.y;
    redraw();
  });

  document.getElementById("generarPDF").addEventListener("click", async (event) => {
    const waitingPopup = swalTailwind.fire({
      title: "Generando!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const form = document.getElementById("zapatas2Form");
    try {
      getBase64Image(logo, async (logob64, width, height) => {
        const docDefinition = {
          background: function (currentPage, pageSize) {
            const scale_factor = pageSize.width / width;
            const scaled_height = height * scale_factor;
            return {
              image: logob64, // Aquí va tu imagen en base64
              width: width * scale_factor, // Ajustar el ancho al tamaño de la página
              height: scaled_height, // Ajustar el alto al tamaño de la página
              opacity: 0.1, // Ajustar la transparencia para simular marca de agua
              absolutePosition: { x: 0, y: pageSize.height * 0.5 - scaled_height * 0.5 }, // Colocar en la posición inicial
            };
          },
          header: {
            columns: [
              { image: logob64, width: 210, height: 50, margin: [10, -10, 0, 0] },
              {
                stack: [
                  { text: "Correo: rizabalasociados.estructurales@gmail.com", margin: [0, 0, 0, 5] },
                  { text: "Telefono: 953992277", margin: [0, 0, 0, 5] },
                  { text: "Direccion: jr. bolivar", margin: [0, 0, 0, 5] },
                  { text: "Fecha: 16/08/2024", margin: [0, 0, 0, 5] },
                ],
                alignment: "right",
                fontSize: 10,
                margin: [10, 10, 30, 20],
              },
            ],
          },
          footer: function (currentPage, pageCount) {
            return {
              text: "Página " + currentPage.toString() + " de " + pageCount,
              alignment: "center",
              fontSize: 10,
              margin: [0, 0, 0, 10],
            };
          },
          content: [
            { text: "DISEÑO DE CIMENTACIÓN", style: "header", alignment: "left", fontSize: 12 },
            {
              style: "tableExample",
              table: {
                headerRows: 2,
                widths: ["*", "*", "*", "*"],
                body: [
                  [{ text: "1.- Datos Generales", style: "tableHeader", colSpan: 4, alignment: "left" }, {}, {}, {}],
                  [
                    { text: "Nombre", style: "tableHeader", alignment: "center" },
                    { text: "Simbolo", style: "tableHeader", alignment: "center" },
                    { text: "Valor", style: "tableHeader", colSpan: 2, alignment: "center" },
                    {},
                  ],
                  ["", { text: "Df", alignment: "center" }, { text: form.dF.value, alignment: "right" }, { text: "" }],
                  [
                    "Peso Especifico",
                    { text: "Ye", alignment: "center" },
                    { text: form.pesoEspecifico.value, alignment: "right" },
                    { text: "" },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              style: "tableExample",
              table: {
                headerRows: 1,
                widths: [
                  "10.3%",
                  "7.3%",
                  "7.3%",
                  "8.3%",
                  "8.3%",
                  "8.3%",
                  "8.3%",
                  "8.3%",
                  "8.3%",
                  "8.3%",
                  "8.3%",
                  "8.3%",
                ],
                body: [
                  [
                    { text: "1.1.- Propiedades", style: "tableHeader", colSpan: 12, alignment: "left" },
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                  ],
                  [
                    { text: "Columna", style: "tableHeader", alignment: "center" },
                    { text: "X", style: "tableHeader", alignment: "center" },
                    { text: "Y", style: "tableHeader", alignment: "center" },
                    { text: "PD", style: "tableHeader", colSpan: 3, alignment: "center" },
                    {},
                    {},
                    { text: "PL", style: "tableHeader", colSpan: 3, alignment: "center" },
                    {},
                    {},
                    { text: "SISMO", style: "tableHeader", colSpan: 3, alignment: "center" },
                    {},
                    {},
                  ],
                  ...datosGenerales.getData().map((row) => {
                    return [
                      { text: row.column, alignment: "center", fontSize: 4 },
                      { text: row.x, alignment: "center", fontSize: 4 },
                      { text: row.y, alignment: "center", fontSize: 4 },
                      { text: row.pd1, alignment: "center", fontSize: 4 },
                      { text: row.pd2, alignment: "center", fontSize: 4 },
                      { text: row.pd3, alignment: "center", fontSize: 4 },
                      { text: row.pl1, alignment: "center", fontSize: 4 },
                      { text: row.pl2, alignment: "center", fontSize: 4 },
                      { text: row.pl3, alignment: "center", fontSize: 4 },
                      { text: row.sismo1, alignment: "center", fontSize: 4 },
                      { text: row.sismo2, alignment: "center", fontSize: 4 },
                      { text: row.sismo3, alignment: "center", fontSize: 4 },
                    ];
                  }),
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              style: "tableExample",
              table: {
                headerRows: 1,
                widths: ["*", "*", "*"],
                body: [
                  [
                    { text: "1.2.- Combinación de Cargas", style: "tableHeader", colSpan: 2, alignment: "left" },
                    {},
                    {},
                  ],
                  ...combinacionDeCargas.getData().map((row) => {
                    return [
                      { text: row.column1, alignment: "center" },
                      { text: row.column2, alignment: "center" },
                      { text: row.column3, alignment: "center" },
                    ];
                  }),
                ],
              },
              layout: "lightHorizontalLines",
            },
            combinacionDeCargas.getData().map((row, index) => {
              return {
                style: "tableExample",
                table: {
                  headerRows: 2,
                  widths: ["*", "*", "*"],
                  body: [
                    [
                      {
                        text: `Comb: [${row.column1} ${row.column2} ${row.column3}]`,
                        style: "tableHeader",
                        alignment: "center",
                        colSpan: 3,
                      },
                      {},
                      {},
                    ],
                    [
                      { text: "nombre", style: "tableHeader", alignment: "center" },
                      { text: "σmin", style: "tableHeader", alignment: "center" },
                      { text: "σmax", style: "tableHeader", alignment: "center" },
                    ],
                    ...combinaciones.map(({ min, max, polygon }) => {
                      return [
                        { text: polygon, alignment: "center" },
                        { text: min[index].toFixed(3), alignment: "center" },
                        { text: max[index].toFixed(3), alignment: "center" },
                      ];
                    }),
                  ],
                },
                layout: "lightHorizontalLines",
              };
            }),
            ...(await Promise.all(
              combinacionDeCargas.getData().map(async (_, index) => {
                return {
                  image: await Plotly.toImage(`zapata${index + 1}`),
                  width: 420,
                  margin: [50, 0, 50, 0],
                };
              })
            )),
          ],
          styles: {
            header: {
              fontSize: 8,
              bold: true,
              margin: [50, 0, 50, 10],
            },
            subheader: {
              fontSize: 8,
              bold: true,
              margin: [50, 10, 50, 5],
            },
            tableExample: {
              fontSize: 8,
              margin: [50, 5, 50, 15],
            },
            tableHeader: {
              bold: true,
              fontSize: 8,
              color: "black",
            },
          },
        };
        pdfMake.createPdf(docDefinition).download("aligerados.pdf");
        waitingPopup.hideLoading();
      });
    } catch (error) {
      waitingPopup.hideLoading();
    }
  });

  document.getElementById("calcularZapatas2").addEventListener("submit", (event) => {
    const waitingPopup = swalTailwind.fire({
      title: "Calculando!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    event.preventDefault();
    const octaveMatrix = (table, ...fields) => {
      return (
        "[" +
        table
          .map((row) => {
            return fields.map((field) => row[field]).join(",");
          })
          .join(";") +
        "]"
      );
    };
    const columns = datosGenerales.getData();
    const formData = new FormData(event.target);
    formData.append("column", octaveMatrix(columns, "column", "x", "y"));
    formData.append("PD", octaveMatrix(columns, "column", "pd1", "pd2", "pd3"));
    formData.append("PL", octaveMatrix(columns, "column", "pl1", "pl2", "pl3"));
    formData.append("SISMO", octaveMatrix(columns, "column", "sismo1", "sismo2", "sismo3"));
    formData.append("dF", document.getElementById("dF").value);
    formData.append("pesoEspecifico", document.getElementById("pesoEspecifico").value);
    formData.append(
      "Co",
      octaveMatrix(
        combinacionDeCargas.getData().map((row) => {
          return {
            ...row,
            column1: row.column1.toLowerCase(),
            column2: row.column2.toLowerCase(),
            column3: row.column3.toLowerCase(),
          };
        }),
        "column1",
        "column2",
        "column3"
      )
    );
    formData.append(
      "poligonos",
      `struct(${shapes
        .map((shape, index) => {
          return `'poligono${index + 1}', [${[...shape.points, shape.points[0]]
            .map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`)
            .join(";")}]`;
        })
        .join(",")})`
    );
    const graficos = document.getElementById("graficos");
    graficos.innerHTML = combinacionDeCargas
      .getData()
      .map((_, index) => {
        return `
        <tr class="bg-gray-100 dark:bg-gray-600">
          <td class="py-2 px-4" colspan="4">
              <div id="zapata${index + 1}"></div>
          </td>
        </tr>`;
      })
      .join("");

    console.log(Object.fromEntries(formData));
    fetch("/zapatas2", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/octet-stream")) {
          return response.arrayBuffer();
        } else {
          const error = await response.text();
          return Promise.reject(error);
        }
      })
      .then((matData) => {
        waitingPopup.hideLoading();
        const zapatas2 = readmat(matData);
        console.log(zapatas2);
        combinacionDeCargas.getData().forEach((title, index) => {
          combinaciones = Object.values(zapatas2.data.resultados).map(({ XX, YY, ZZ, max, min }, poligonoN) => {
            return {
              max: max,
              min: min,
              polygon: `Poligono ${poligonoN + 1}`,
            };
          });
          const traces = Object.values(zapatas2.data.resultados).map(({ XX, YY, ZZ, max, min }, poligonoN) => {
            const ZEscale = ZZ[index].length ? ZZ[index] : ZZ;
            return {
              x: XX, // X-axis data
              y: YY, // Y-axis data
              z: ZEscale,
              mode: "markers", // Scatter plot mode
              marker: {
                size: 2, // Size of the markers
                color: ZEscale, // Color of the markers, based on Z data
                //colorscale: "Viridis", // Color scale
                //colorscale: "Jet", // Color scale
                /* showscale: true, // Show the color scale */
                coloraxis: "coloraxis",
              },
              name: `<b>Poligono ${poligonoN + 1}<br>σ<sub>min</sub> = ${min[index].toFixed(
                3
              )}<br>σ<sub>max</sub> = ${max[index].toFixed(3)}</b><br>`,
              hovertemplate:
                "<b>x</b>: %{x}<br>" + "<b>y</b>: %{y}<br>" + "<b>z</b>: %{marker.color:.4f}" + "<extra></extra>",
              type: "scattergl", // 3D scatter plot type
              /* type: "pointcloudgl", // 3D scatter plot type */
            };
          });
          const markers = columns.map((row) => {
            return {
              x: [row.x],
              y: [row.y],
              text: [`${row.column}`],
              mode: "markers+text",
              type: "scattergl",
              textposition: "top right",
              textfont: {
                family: "Arial",
                size: 10,
                color: "lightgrey",
              },
              showlegend: false,
            };
          });
          const layout = {
            xaxis: {
              scaleanchor: "y",
              scaleratio: 1,
            },
            yaxis: {
              constrain: "domain",
            },
            coloraxis: {
              colorscale: matlabColorScale, // Color scale
              colorbar: {
                title: {
                  text: "Presion Admisible (Tn/m)",
                  side: "right",
                },
              },
            },
            showlegend: true,
            legend: { x: 0, y: 0.5 },
            annotations: Object.values(zapatas2.data.resultados).map(({ XC: [xc], YC: [yc] }, index) => {
              return {
                x: xc,
                y: yc,
                xref: "x",
                yref: "y",
                text: `P${index + 1}`,
                font: {
                  color: "lightgrey",
                  size: 10,
                },
                align: "left",
                showarrow: false,
              };
            }),
            title: {
              text: `<b>Comb: [${title.column1}, ${title.column2}, ${title.column3}]</b>`,
              font: {
                family: "Arial",
                size: 12,
              },
            },
          };
          Plotly.react(`zapata${index + 1}`, [...traces, ...markers], layout, { responsive: false });
        });
      })
      .catch((error) => {
        waitingPopup.hideLoading();
        swalTailwind.fire({
          icon: "error",
          html: `
              ${error}
            `,
          showConfirmButton: true,
        });
      });
  });
});

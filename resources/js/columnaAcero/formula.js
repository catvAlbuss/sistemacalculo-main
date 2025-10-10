import { formulas } from "./formulas.js";
import { data } from "./data.js";

// Create a HyperFormula instance
export var hf = HyperFormula.buildEmpty({
  licenseKey: "gpl-v3",
  chooseAddressMappingPolicy: HyperFormula.AlwaysSparse,
  useColumnIndex: true,
});

export function addData() {
  data.forEach((table) => {
    Object.keys(table).forEach((sheetName) => {
      let sheetID = hf.getSheetId(sheetName);
      hf.suspendEvaluation();
      Object.entries(table[sheetName]).forEach(([id, value]) => {
        hf.setCellContents(hf.simpleCellAddressFromString(id, sheetID), value);
      });
      hf.resumeEvaluation();
    });
  });
}

function highligthCell(cell) {
  cell.classList.toggle(
    "highligth",
    highligths.find((value) => value.id == cell.id)
  );
  const handle = setTimeout(() => {
    cell.classList.remove("highligth");
  }, 2000);
  highligths.push({ id: cell.id, handle: handle });
}

const highligths = [];

export function registerFormulas(sheetName) {
  const sheetID = hf.getSheetId(sheetName);
  hf.suspendEvaluation();
  Array.from(document.querySelectorAll(".xlsx-cell")).forEach((cell) => {
    if (cell.tagName.toLowerCase() === "input" || cell.tagName.toLowerCase() === "select") {
      hf.setCellContents(
        hf.simpleCellAddressFromString(cell.id, sheetID),
        cell.value
      );
    } else {
      hf.setCellContents(
        hf.simpleCellAddressFromString(cell.id, sheetID),
        formulas[sheetName][cell.id]
      );
    }
  });
  hf.resumeEvaluation();
  Array.from(
    document.querySelectorAll("input.xlsx-cell, select.xlsx-cell")
  ).forEach((input) => {
    input.addEventListener("change", () => {
      const result = hf.setCellContents(
        hf.simpleCellAddressFromString(input.id, sheetID),
        input.value
      );
      console.log(result);
      result
        .filter(
          (update) =>
            hf.simpleCellAddressToString(update.address, sheetID) != input.id
        )
        .forEach((update) => {
          const id = hf.simpleCellAddressToString(update.address, sheetID);
          const result = document.getElementById(id);
          if (id === "M134") {
            console.log("debug");
          }
          //highligthCell(result);
          if (result !== null) {
            if (!isNaN(update.newValue)) {
              let round = result.getAttribute("data-round") ?? "";
              round = parseFloat(round);
              result.textContent = update.newValue.toFixed(
                isNaN(round) ? 2 : round
              );
            } else {
              result.textContent = update.newValue;
            }
          }
        });
    });
  });
}

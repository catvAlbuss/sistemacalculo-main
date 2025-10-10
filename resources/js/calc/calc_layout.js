export function updateCalcs(calcs, calcFormatters, calculate) {
  calculate();
  Object.entries(calcs).forEach(([id, value]) => {
    document
      .getElementById("resultados")
      .querySelectorAll(`#${id}:not(select,input)`)
      .forEach((calc) => {
        if (calcFormatters[id]) {
          calc.textContent = calcFormatters[id](value);
        } else {
          calc.textContent = isNaN(value) ? value : Number.isInteger(value) ? value : value.toFixed(2);
        }
      });
  });
}

export function doCalcs(calcs, calcFormatters, calculate) {
  updateCalcs(calcs, calcFormatters, calculate);
  document.getElementById("calcular")?.addEventListener("click", () => {
    updateCalcs(calcs, calcFormatters, calculate);
  });
}

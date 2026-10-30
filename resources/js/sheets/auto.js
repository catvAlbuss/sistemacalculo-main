// Estado de resultados para hojas cuyo motor no usa createSheetState directamente.
// El motor sigue escribiendo sus resultados como antes; aquí solo se observa el destino
// ([data-sheet-results]) para habilitar las exportaciones. Al editar los datos,
// createSheetState marca los resultados como desactualizados.
import { createSheetState } from "./state.js";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-sheet-auto]").forEach((root) => {
    const state = createSheetState(root);
    const results = root.querySelector("[data-sheet-results]");
    if (!results) return;
    const announceReady = () => state.ready("Cálculo actualizado · revisa los resultados antes de exportarlos.");
    if (results.hasAttribute("data-sheet-ready")) announceReady();
    new MutationObserver(() => {
      if (results.querySelector("[data-sheet-empty]") || results.textContent.trim() === "") return;
      announceReady();
    }).observe(results, { childList: true, subtree: true, characterData: true });
  });
});

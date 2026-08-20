// resources/js/cad/mixins/analysis/seismic/reactions-display.js
//
// "Reacciones por Caso" (botón en toolbar.blade.php, grupo Resultados):
// overlay en el canvas 2D con las reacciones de apoyo (Fx..Mz) de un caso
// base (CM/CVE/SDX/SDY) elegido en reactions-display-modal.blade.php.
// Lee datos ya calculados por el análisis sísmico principal — ver
// resources/js/cad/engine/reactionsDisplayContract.js — sin tocar el
// backend Python ni el pipeline de fuerzas internas del compañero.

import { getAvailableReactionCases } from "../../../engine/reactionsDisplayContract.js";

export const reactionsDisplayMixin = {
  // Inicializado aca (no solo asignado dentro de applyReactionsDisplay/
  // toggleReactionsDisplay) para que exista como propiedad reactiva desde
  // el arranque -- el boton "Reacciones por Caso..." del toolbar lee
  // reactionsDisplay?.enabled apenas se monta el componente, antes de que
  // el usuario haya usado el boton ni una vez.
  reactionsDisplay: null,

  openReactionsDisplay() {
    if (!this.seismicResults) {
      this.showMessage("Corre el análisis sísmico primero.", "warning");
      return;
    }

    window.dispatchEvent(
      new CustomEvent("open-reactions-display-modal", {
        detail: { available: getAvailableReactionCases(this) },
      })
    );
  },

  /** Confirmado desde reactions-display-modal.blade.php (OK/Apply). */
  applyReactionsDisplay(caseId, components) {
    this.reactionsDisplay = { enabled: true, caseId, components };
    this.redraw?.();
  },

  toggleReactionsDisplay(enabled) {
    this.reactionsDisplay = {
      ...(this.reactionsDisplay || { caseId: "CM", components: {} }),
      enabled: enabled ?? !this.reactionsDisplay?.enabled,
    };
    this.redraw?.();
  },
};

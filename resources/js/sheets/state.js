// Calculation engines own their formulas. This module only tracks presentation.
export function createSheetState(root) {
  const status = root.querySelector('[data-sheet-status]');
  const buttons = [...root.querySelectorAll('[data-sheet-export]')];
  let current = false;
  const busy = new Set();
  const updateButtons = () => buttons.forEach(button => { button.disabled = !current || busy.has(button); });
  const announce = (state, message) => { if (status) { status.dataset.state = state; status.textContent = message; } };
  const markStale = () => {
    if (!current) return;
    current = false;
    announce('stale','Datos modificados · vuelve a calcular para actualizar los resultados y exportarlos.');
    updateButtons();
  };
  const inputs = root.querySelector('[data-sheet-inputs]');
  inputs?.addEventListener('input',markStale);
  inputs?.addEventListener('change',markStale);
  updateButtons();
  return {
    markStale,
    isCurrent: () => current,
    ready(message = 'Cálculo actualizado · revisa las verificaciones y selecciona el refuerzo.') {
      current = true; announce('ready',message); updateButtons();
    },
    setBusy(button,value) { value ? busy.add(button) : busy.delete(button); updateButtons(); },
    error(message) { announce('error',message); },
    validate() {
      const invalid = [...(inputs?.querySelectorAll('input,select,textarea') || [])].find(input => !input.checkValidity());
      invalid?.reportValidity(); return !invalid;
    },
  };
}

// js/cad/dialogs/mass-source-dialog.js
import Swal from 'sweetalert2';

export const openMassSourceDialog = async (cadSystem) => {
    const result = await Swal.fire({
        title: 'Mass Source',
        html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="flex items-center gap-2">
                        <input type="radio" name="mass-source" value="loads" ${cadSystem.massSource.sources.fromLoads ? 'checked' : ''}>
                        <span>From Loads (CM, CV, etc.)</span>
                    </label>
                    <label class="flex items-center gap-2 mt-1">
                        <input type="radio" name="mass-source" value="elements" ${!cadSystem.massSource.sources.fromLoads ? 'checked' : ''}>
                        <span>From Elements + Loads</span>
                    </label>
                </div>
                <div class="mt-3">
                    <label class="block text-xs">Mass Multiplier</label>
                    <input id="mass-mult" type="number" step="0.1" class="w-full px-2 py-1 border rounded" value="${cadSystem.massSource.sources.multiplier}">
                </div>
            </div>
        `,
        confirmButtonText: 'OK',
        didOpen: (popup) => {
            popup.querySelectorAll('input[name="mass-source"]').forEach(radio => {
                radio.onchange = (e) => {
                    cadSystem.massSource.sources.fromLoads = e.target.value === 'loads';
                    cadSystem.massSource.sources.fromElements = e.target.value === 'elements';
                };
            });
        },
    });
    
    if (result.isConfirmed) {
        const mult = parseFloat(document.getElementById('mass-mult')?.value || 1);
        cadSystem.massSource.sources.multiplier = mult;
        cadSystem.showMessage(`✅ Fuente de masa actualizada (multiplicador: ${mult})`);
    }
};
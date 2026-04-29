// js/cad/dialogs/material-dialog.js


import Swal from 'sweetalert2';

export const openMaterialDialog = async (cadSystem) => {
    // Si no hay materiales, cargar algunos por defecto
    if (cadSystem.materialProperties.materials.length === 0) {
        cadSystem.materialProperties.materials = getDefaultMaterials();
    }

    const result = await Swal.fire({
        title: 'Material Property Data',
        html: getMaterialDialogHTML(cadSystem),
        width: '750px',
        showConfirmButton: true,
        confirmButtonText: 'OK',
        showCancelButton: true,
        didOpen: (popup) => {
            setupMaterialDialogEvents(popup, cadSystem);
        },
    });

    if (result.isConfirmed) {
        cadSystem.showMessage(`✅ Materiales actualizados: ${cadSystem.materialProperties.materials.length} materiales`);
        cadSystem.sync3D();
    }
};

const getDefaultMaterials = () => {
    return [
        {
            name: "MAT1",
            type: "Isotropic",
            massPerUnitVolume: 2.246e-7,
            weightPerUnitVolume: 8.680e-5,
            modulusElasticity: 3600,
            poissonRatio: 0.2,
            thermalExpansion: 5.5e-6,
            shearModulus: 1500,
            designType: "Concrete",
            fpc: 4.0,
            fy: 60.0,
            fys: 60.0,
            color: "#888888",
        },
        {
            name: "ACERO",
            type: "Isotropic",
            massPerUnitVolume: 7.85e-9,
            weightPerUnitVolume: 7.85e-5,
            modulusElasticity: 210000,
            poissonRatio: 0.3,
            thermalExpansion: 1.2e-5,
            shearModulus: 81000,
            designType: "Steel",
            fy: 250,
            fu: 400,
            color: "#ff8888",
        },
    ];
};

const getMaterialDialogHTML = (cadSystem) => {
    return `
        <div class="text-left">
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium">Material Name</label>
                    <input id="mat-name" class="w-full px-2 py-1 border rounded text-sm" value="MAT1">
                </div>
                <div>
                    <label class="block text-sm font-medium">Type of Material</label>
                    <select id="mat-type" class="w-full px-2 py-1 border rounded text-sm">
                        <option value="Isotropic">Isotropic</option>
                        <option value="Orthotropic">Orthotropic</option>
                    </select>
                </div>
            </div>
            
            <div class="border-t pt-3 mb-3">
                <h4 class="font-semibold text-sm mb-2">Analysis Property Data</h4>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="text-xs">Mass per unit Volume</label><input id="mat-mass" class="w-full px-2 py-1 border rounded text-xs" value="2.246E-07"></div>
                    <div><label class="text-xs">Weight per unit Volume</label><input id="mat-weight" class="w-full px-2 py-1 border rounded text-xs" value="8.680E-05"></div>
                    <div><label class="text-xs">Modulus of Elasticity</label><input id="mat-e" class="w-full px-2 py-1 border rounded text-xs" value="3600"></div>
                    <div><label class="text-xs">Poisson's Ratio</label><input id="mat-nu" class="w-full px-2 py-1 border rounded text-xs" value="0.2"></div>
                    <div><label class="text-xs">Coeff of Thermal Expansion</label><input id="mat-alpha" class="w-full px-2 py-1 border rounded text-xs" value="5.500E-06"></div>
                    <div><label class="text-xs">Shear Modulus</label><input id="mat-g" class="w-full px-2 py-1 border rounded text-xs" value="1500"></div>
                </div>
            </div>
            
            <div class="border-t pt-3">
                <h4 class="font-semibold text-sm mb-2">Design Property Data [ACI 318-05/IBC 2003]</h4>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="text-xs">Specified Conc Comp Strength, f'c</label><input id="mat-fpc" class="w-full px-2 py-1 border rounded text-xs" value="4"></div>
                    <div><label class="text-xs">Bending Reinf. Yield Stress, fy</label><input id="mat-fy" class="w-full px-2 py-1 border rounded text-xs" value="60"></div>
                    <div><label class="text-xs">Shear Reinf. Yield Stress, fys</label><input id="mat-fys" class="w-full px-2 py-1 border rounded text-xs" value="60"></div>
                </div>
                <div class="mt-2 flex items-center gap-4">
                    <label><input type="checkbox" id="mat-lightweight"> Lightweight Concrete</label>
                    <label><input type="checkbox" id="mat-shear-reduce"> Shear Strength Reduce. Factor</label>
                </div>
            </div>
            
            <div class="mt-3 flex justify-end gap-2">
                <button type="button" id="btn-add-material" class="bg-green-600 text-white px-3 py-1 rounded text-sm">+ Add</button>
            </div>
            
            <div class="mt-3 max-h-40 overflow-y-auto border rounded">
                <table class="w-full text-xs">
                    <thead class="bg-gray-700">
                        <tr><th class="p-1">Name</th><th class="p-1">E</th><th class="p-1">f'c</th><th class="p-1">fy</th><th class="p-1"></th></tr>
                    </thead>
                    <tbody id="material-list-body">
                        ${cadSystem.materialProperties.materials.map(mat => `
                            <tr class="border-t">
                                <td class="p-1">${mat.name}</td>
                                <td class="p-1">${mat.modulusElasticity}</td>
                                <td class="p-1">${mat.fpc || '-'}</td>
                                <td class="p-1">${mat.fy || '-'}</td>
                                <td class="p-1"><button class="text-red-500 delete-material" data-name="${mat.name}">✕</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

const setupMaterialDialogEvents = (popup, cadSystem) => {
    // Agregar material
    popup.querySelector('#btn-add-material').onclick = () => {
        const newMaterial = {
            name: popup.querySelector('#mat-name').value,
            type: popup.querySelector('#mat-type').value,
            massPerUnitVolume: parseFloat(popup.querySelector('#mat-mass').value),
            weightPerUnitVolume: parseFloat(popup.querySelector('#mat-weight').value),
            modulusElasticity: parseFloat(popup.querySelector('#mat-e').value),
            poissonRatio: parseFloat(popup.querySelector('#mat-nu').value),
            thermalExpansion: parseFloat(popup.querySelector('#mat-alpha').value),
            shearModulus: parseFloat(popup.querySelector('#mat-g').value),
            fpc: parseFloat(popup.querySelector('#mat-fpc').value),
            fy: parseFloat(popup.querySelector('#mat-fy').value),
            fys: parseFloat(popup.querySelector('#mat-fys').value),
            lightweight: popup.querySelector('#mat-lightweight').checked,
        };
        
        cadSystem.materialProperties.materials.push(newMaterial);
        refreshMaterialTable(popup, cadSystem);
    };
    
    // Eliminar materiales
    popup.querySelectorAll('.delete-material').forEach(btn => {
        btn.onclick = (e) => {
            const name = btn.getAttribute('data-name');
            cadSystem.materialProperties.materials = cadSystem.materialProperties.materials.filter(m => m.name !== name);
            refreshMaterialTable(popup, cadSystem);
        };
    });
};

const refreshMaterialTable = (popup, cadSystem) => {
    const tbody = popup.querySelector('#material-list-body');
    tbody.innerHTML = cadSystem.materialProperties.materials.map(mat => `
        <tr class="border-t">
            <td class="p-1">${mat.name}</td>
            <td class="p-1">${mat.modulusElasticity}</td>
            <td class="p-1">${mat.fpc || '-'}</td>
            <td class="p-1">${mat.fy || '-'}</td>
            <td class="p-1"><button class="text-red-500 delete-material" data-name="${mat.name}">✕</button></td>
        </tr>
    `).join('');
    
    // Re-asignar eventos de eliminar
    tbody.querySelectorAll('.delete-material').forEach(btn => {
        btn.onclick = (e) => {
            const name = btn.getAttribute('data-name');
            cadSystem.materialProperties.materials = cadSystem.materialProperties.materials.filter(m => m.name !== name);
            refreshMaterialTable(popup, cadSystem);
        };
    });
};
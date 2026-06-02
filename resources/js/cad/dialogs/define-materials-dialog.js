// js/cad/dialogs/define-materials-dialog.js
import Swal from 'sweetalert2';

export const openDefineMaterialsDialog = async (cadSystem) => {
    // Materiales predefinidos estilo ETABS en español
    const defaultMaterials = [
        { name: "CONC", type: "Isotropic", fc: 4.0, fy: 60.0, E: 3600, weight: 8.68e-5, poisson: 0.2, color: "#888888", descripcion: "Concreto" },
        { name: "OTHER", type: "Isotropic", fc: 0, fy: 0, E: 2000, weight: 7.85e-5, poisson: 0.3, color: "#888888", descripcion: "Otro Material" },
        { name: "STEEL", type: "Isotropic", fc: 0, fy: 250, E: 210000, weight: 7.85e-5, poisson: 0.3, color: "#ff8888", descripcion: "Acero" },
    ];

    if (cadSystem.materialProperties.materials.length === 0) {
        cadSystem.materialProperties.materials = defaultMaterials;
    }

    let currentSelectedMaterialName = null;

    // Función para renderizar la lista de materiales
    const renderMaterialList = (container) => {
        if (!container) return;
        
        container.innerHTML = cadSystem.materialProperties.materials.map(mat => `
            <div class="material-item flex items-center justify-between px-3 py-2 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${currentSelectedMaterialName === mat.name ? 'bg-blue-900 border-l-4 border-blue-500' : ''}" data-material-name="${mat.name}">
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full" style="background-color: ${mat.color || '#888888'}"></div>
                    <span class="text-sm text-gray-300 font-medium">${mat.name}</span>
                    <span class="text-xs text-gray-500">${mat.descripcion || ''}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">${mat.type === 'Isotropic' ? 'Isótropo' : 'Ortótropo'}</span>
                </div>
            </div>
        `).join('');

        // Agregar eventos SOLO para selección (no para editar)
        document.querySelectorAll('.material-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const materialName = item.getAttribute('data-material-name');
                currentSelectedMaterialName = materialName;
                
                // Actualizar visualmente la selección
                document.querySelectorAll('.material-item').forEach(el => {
                    if (el.getAttribute('data-material-name') === materialName) {
                        el.classList.add('bg-blue-900', 'border-l-4', 'border-blue-500');
                    } else {
                        el.classList.remove('bg-blue-900', 'border-l-4', 'border-blue-500');
                    }
                });
            });
        });
    };

    // Función para actualizar la lista sin recrear el Swal
    const refreshMaterialList = () => {
        const container = document.getElementById('materials-list-container');
        if (container) {
            renderMaterialList(container);
        }
    };

    // Mostrar el diálogo principal
    const result = await Swal.fire({
        title: 'Definir Materiales',
        html: `
            <div class="text-left">
                <div class="mb-2 text-xs text-gray-400">Materiales</div>
                <div id="materials-list-container" class="border border-gray-700 rounded-md bg-gray-900 max-h-64 overflow-y-auto">
                    <!-- Lista dinámica -->
                </div>
                <div class="mt-3 text-xs text-gray-400">Haga clic para:</div>
                <div class="mt-2 space-y-1">
                    <button id="btn-add-material" type="button" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Nuevo Material...
                    </button>
                    <button id="btn-modify-material" type="button" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modificar/Mostrar Material...
                    </button>
                    <button id="btn-delete-material" type="button" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar Material
                    </button>
                </div>
            </div>
        `,
        width: '500px',
        showConfirmButton: true,
        confirmButtonText: 'OK',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
        didOpen: (popup) => {
            const container = document.getElementById('materials-list-container');
            renderMaterialList(container);

            // Add New Material
            popup.querySelector('#btn-add-material').onclick = async () => {
                const newMaterial = await openMaterialPropertyDialog(cadSystem, null, true);
                if (newMaterial) {
                    cadSystem.materialProperties.materials.push(newMaterial);
                    refreshMaterialList();
                    currentSelectedMaterialName = newMaterial.name;
                }
            };

            // Modify/Show Material
            popup.querySelector('#btn-modify-material').onclick = async () => {
                if (!currentSelectedMaterialName) {
                    Swal.fire({
                        title: 'Sin Selección',
                        text: 'Por favor seleccione un material para modificar',
                        icon: 'warning',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    return;
                }
                const material = cadSystem.materialProperties.materials.find(m => m.name === currentSelectedMaterialName);
                if (material) {
                    const modified = await openMaterialPropertyDialog(cadSystem, material, false);
                    if (modified) {
                        Object.assign(material, modified);
                        refreshMaterialList();
                    }
                }
            };

            // Delete Material
            popup.querySelector('#btn-delete-material').onclick = async () => {
                if (!currentSelectedMaterialName) {
                    Swal.fire({
                        title: 'Sin Selección',
                        text: 'Por favor seleccione un material para eliminar',
                        icon: 'warning',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    return;
                }
                
                const confirmResult = await Swal.fire({
                    title: 'Eliminar Material',
                    text: `¿Está seguro de eliminar "${currentSelectedMaterialName}"?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, Eliminar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#ef4444'
                });
                
                if (confirmResult.isConfirmed) {
                    cadSystem.materialProperties.materials = cadSystem.materialProperties.materials.filter(m => m.name !== currentSelectedMaterialName);
                    currentSelectedMaterialName = null;
                    refreshMaterialList();
                }
            };
        }
    });

    if (result.isConfirmed) {
        cadSystem.showMessage(`✅ Materiales actualizados: ${cadSystem.materialProperties.materials.length} materiales`);
        cadSystem.sync3D();
    }
};

// Diálogo de propiedades del material (traducido al español)
const openMaterialPropertyDialog = async (cadSystem, material = null, isNew = true) => {
    const defaultMaterial = {
        name: 'MAT1',
        type: 'Isotropic',
        massPerUnitVolume: 2.246e-7,
        weightPerUnitVolume: 8.680e-5,
        modulusElasticity: 3600,
        poissonRatio: 0.2,
        thermalExpansion: 5.5e-6,
        shearModulus: 1500,
        designType: 'Concrete',
        fpc: 4.0,
        fy: 60.0,
        fys: 60.0,
        lightweight: false,
        shearReduce: false,
        color: '#888888',
        descripcion: ''
    };

    const current = material || defaultMaterial;

    return new Promise((resolve) => {
        Swal.fire({
            title: 'Datos de Propiedad del Material',
            html: `
                <div class="text-left">
                    <!-- Material Name -->
                    <div class="mb-4">
                        <label class="block text-xs font-semibold text-gray-400">Nombre del Material</label>
                        <input id="mat-name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.name}">
                    </div>

                    <!-- Type of Material -->
                    <div class="mb-4">
                        <label class="block text-xs font-semibold text-gray-400 mb-2">Tipo de Material</label>
                        <div class="space-y-1">
                            <label class="flex items-center gap-2">
                                <input type="radio" name="mat-type" value="Isotropic" ${current.type === 'Isotropic' ? 'checked' : ''}>
                                <span class="text-sm">Isótropo</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="radio" name="mat-type" value="Orthotropic" ${current.type === 'Orthotropic' ? 'checked' : ''}>
                                <span class="text-sm">Ortótropo</span>
                            </label>
                        </div>
                    </div>

                    <!-- Analysis Property Data -->
                    <div class="border-t border-gray-700 pt-3 mb-4">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Datos de Propiedad de Análisis</label>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400">Masa por unidad de Volumen</label>
                                <input id="mat-mass" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.massPerUnitVolume || defaultMaterial.massPerUnitVolume}">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Peso por unidad de Volumen</label>
                                <input id="mat-weight" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.weightPerUnitVolume || defaultMaterial.weightPerUnitVolume}">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Módulo de Elasticidad</label>
                                <input id="mat-e" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.modulusElasticity || defaultMaterial.modulusElasticity}">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Relación de Poisson</label>
                                <input id="mat-nu" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.poissonRatio || defaultMaterial.poissonRatio}">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Coef. de Expansión Térmica</label>
                                <input id="mat-alpha" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.thermalExpansion || defaultMaterial.thermalExpansion}">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Módulo de Corte</label>
                                <input id="mat-g" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.shearModulus || defaultMaterial.shearModulus}">
                            </div>
                        </div>
                    </div>

                    <!-- Display Color -->
                    <div class="mb-4">
                        <label class="block text-xs font-semibold text-gray-400">Color de Visualización</label>
                        <div class="flex items-center gap-2">
                            <input type="color" id="mat-color" class="w-10 h-8 rounded border border-gray-600" value="${current.color || '#888888'}">
                            <span class="text-xs text-gray-400">Color</span>
                        </div>
                    </div>

                    <!-- Type of Design -->
                    <div class="mb-4">
                        <label class="block text-xs font-semibold text-gray-400 mb-2">Tipo de Diseño</label>
                        <select id="mat-design-type" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            <option value="Concrete" ${current.designType === 'Concrete' ? 'selected' : ''}>Concreto</option>
                            <option value="Steel" ${current.designType === 'Steel' ? 'selected' : ''}>Acero</option>
                            <option value="No Design" ${current.designType === 'No Design' ? 'selected' : ''}>Sin Diseño</option>
                        </select>
                    </div>

                    <!-- Design Property Data -->
                    <div class="border-t border-gray-700 pt-3">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Datos de Propiedad de Diseño [ACI 318-05/IBC 2003]</label>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400">Resistencia del Concreto, f'c</label>
                                <input id="mat-fpc" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.fpc || defaultMaterial.fpc}">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Esfuerzo Fluencia Acero, fy</label>
                                <input id="mat-fy" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.fy || defaultMaterial.fy}">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Esfuerzo Fluencia Acero Corte, fys</label>
                                <input id="mat-fys" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" value="${current.fys || defaultMaterial.fys}">
                            </div>
                        </div>
                        <div class="mt-3 space-y-1">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="mat-lightweight" ${current.lightweight ? 'checked' : ''}>
                                <span class="text-sm">Concreto Ligero</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="mat-shear-reduce" ${current.shearReduce ? 'checked' : ''}>
                                <span class="text-sm">Factor de Reducción de Corte</span>
                            </label>
                        </div>
                    </div>
                </div>
            `,
            width: '700px',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false,
            preConfirm: () => {
                const name = document.getElementById('mat-name').value;
                if (!name) {
                    Swal.showValidationMessage('El nombre del material es requerido');
                    return false;
                }

                // Verificar nombre duplicado si es nuevo
                if (isNew && cadSystem.materialProperties.materials.some(m => m.name === name)) {
                    Swal.showValidationMessage(`El material "${name}" ya existe`);
                    return false;
                }

                const type = document.querySelector('input[name="mat-type"]:checked').value;
                const designType = document.getElementById('mat-design-type').value;
                
                let descripcion = '';
                if (designType === 'Concrete') descripcion = 'Concreto';
                else if (designType === 'Steel') descripcion = 'Acero';
                else descripcion = 'Otro';
                
                return {
                    name: name,
                    type: type,
                    massPerUnitVolume: parseFloat(document.getElementById('mat-mass').value),
                    weightPerUnitVolume: parseFloat(document.getElementById('mat-weight').value),
                    modulusElasticity: parseFloat(document.getElementById('mat-e').value),
                    poissonRatio: parseFloat(document.getElementById('mat-nu').value),
                    thermalExpansion: parseFloat(document.getElementById('mat-alpha').value),
                    shearModulus: parseFloat(document.getElementById('mat-g').value),
                    color: document.getElementById('mat-color').value,
                    designType: designType,
                    fpc: parseFloat(document.getElementById('mat-fpc').value),
                    fy: parseFloat(document.getElementById('mat-fy').value),
                    fys: parseFloat(document.getElementById('mat-fys').value),
                    lightweight: document.getElementById('mat-lightweight').checked,
                    shearReduce: document.getElementById('mat-shear-reduce').checked,
                    descripcion: descripcion
                };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                resolve(result.value);
            } else {
                resolve(null);
            }
        });
    });
};
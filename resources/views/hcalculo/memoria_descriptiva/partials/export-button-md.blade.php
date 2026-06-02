{{-- partials/export-button-md.blade.php - Botón de exportación con modal --}}

{{-- MODAL DE ERRORES --}}
<div x-show="showErrorModal" 
     x-transition.opacity.duration.300ms
     class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
     @click.away="closeErrorModal()">
    
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
         x-transition.scale.origin.center.duration.300ms>
        
        {{-- Header del Modal --}}
        <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="text-xl font-bold text-white">No se puede exportar</h3>
                </div>
                <button @click="closeErrorModal()" class="text-white hover:text-gray-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
        
        {{-- Body del Modal --}}
        <div class="p-6">
            <p class="text-gray-600 dark:text-gray-300 mb-4">
                Por favor completa los siguientes campos obligatorios antes de exportar:
            </p>
            
            <div class="max-h-96 overflow-y-auto space-y-3">
                <template x-for="(error, index) in validationErrors" :key="index">
                    <div class="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <div class="flex-1">
                            <p class="font-semibold text-red-700 dark:text-red-400 text-sm" x-text="error.field || 'Campo requerido'"></p>
                            <p class="text-red-600 dark:text-red-300 text-sm" x-text="error.message"></p>
                        </div>
                    </div>
                </template>
            </div>
            
            <div class="mt-6 flex gap-3 justify-end">
                <button @click="closeErrorModal()"
                        class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    Aceptar
                </button>
            </div>
        </div>
    </div>
</div>
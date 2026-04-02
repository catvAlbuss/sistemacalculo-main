{{-- partials/export-button.blade.php - Botón de exportación con modal --}}
<!-- <div class="mt-8 flex justify-center">
    <button @click="showValidationModal()" :disabled="isExporting"
        class="group px-8 py-4 rounded-2xl font-bold text-white
        text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50
        disabled:cursor-not-allowed disabled:hover:scale-100"
        :class="isExporting ? 'bg-gray-400 cursor-not-allowed' :
            'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/50'">
        <div class="flex items-center gap-3">
            <template x-if="!isExporting">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0
                        01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
            </template>
            <template x-if="isExporting">
                <svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24
                    24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                        stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
                        5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
            </template>
            <span x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
        </div>
    </button>
</div> -->

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
                            <p class="font-semibold text-red-700 dark:text-red-400 text-sm" x-text="error.section"></p>
                            <p class="text-red-600 dark:text-red-300 text-sm" x-text="error.field + ': ' + error.message"></p>
                        </div>
                    </div>
                </template>
            </div>
            
            <div class="mt-6 flex gap-3 justify-end">
                <button @click="closeErrorModal()"
                        class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    Cancelar
                </button>
                <button @click="retryExport()"
                        class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                </button>
            </div>
        </div>
    </div>
</div>

{{-- Mensaje de éxito (opcional) --}}
<div x-show="!showErrorModal && isExporting === false && exportSuccess" 
     x-transition 
     class="mt-6"
     x-init="exportSuccess = false">
    <div class="max-w-4xl mx-auto p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
        <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-bold text-green-600 dark:text-green-400">✅ Documento exportado correctamente</span>
        </div>
    </div>
</div>
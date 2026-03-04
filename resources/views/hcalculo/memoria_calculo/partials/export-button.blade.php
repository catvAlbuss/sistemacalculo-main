{{-- partials/export-button.blade.php - Botón de exportación --}}
<div class="mt-8 flex justify-center">
    <button @click="exportWord()" :disabled="isExporting"
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
</div>

{{-- Mensajes de error --}}
<div x-show="errors.length > 0" x-transition class="mt-6">
    <div
        class="max-w-4xl mx-auto p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200
        dark:border-red-800">
        <div class="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9
                    9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-bold text-lg text-red-600 dark:text-red-400">Se encontraron errores:</span>
        </div>
        <template x-for="(error, index) in errors" :key="index">
            <p class="text-sm text-red-600 dark:text-red-400 pl-10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <span x-text="error.message || error"></span>
            </p>
        </template>
    </div>
</div>

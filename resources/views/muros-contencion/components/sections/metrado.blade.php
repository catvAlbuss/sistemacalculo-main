<!-- Metrados -->
            <div x-show="activeTab === 'metrado'">
                <div x-data="metrado" class="cuaderno max-w-full mx-auto">
                    <!-- HEADER -->
                    <div class="flex justify-between items-center mb-6 p-4">
                        <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                            <i class="fas fa-calculator mr-3 text-blue-500"></i>
                            Metrados
                        </h2>
                        <div class="flex items-center space-x-4">
                            <button @click="exportData"
                                class="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                                <i class="fas fa-download mr-2"></i>
                                descargar metrados
                            </button>
                            <button @click="guardarData"
                                class="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                                <i class="fas fa-download mr-2"></i>
                                guardar metrados
                            </button>
                        </div>
                    </div>

                    <!-- ERROR MESSAGES -->
                    <div x-show="hasErrors" class="mb-4">
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div class="flex">
                                <i class="fas fa-exclamation-triangle text-red-400 mr-3 mt-0.5"></i>
                                <div>
                                    <h3 class="text-sm font-medium text-red-800">Se encontraron errores:</h3>
                                    <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                                        <template x-for="error in errors" :key="error.id">
                                            <li x-text="error.message"></li>
                                        </template>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TABLA PRINCIPAL -->
                    <section class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        <div class="w-full text-sm">
                            <div id="metrados-table" class="w-full"></div>
                        </div>
                    </section>
                </div>
            </div>

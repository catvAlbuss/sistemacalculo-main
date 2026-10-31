<!-- Memoria de calculo -->
            <div x-show="activeTab === 'memoriacalculo'">
                <div x-data="memoriacalculo" class="cuaderno max-w-full mx-auto">
                    <div class="glass-card rounded-2xl p-6 mb-1">
                        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div class="flex items-center space-x-4">
                                <div class="bg-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                                    <i class="fa-solid fa-calculator"></i>
                                </div>
                                <div>
                                    <h2 class="text-sm font-bold gradient-text">Memoria de Cálculo</h2>
                                    <p class="text-gray-600 text-xs mt-1">Configuración y documentación del proyecto
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ESTADO DEL DOCUMENTO -->
                    <div class="glass-card rounded-2xl p-6 mb-1">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg mr-3">
                                    <i class="fas fa-chart-line text-white"></i>
                                </div>
                                <div>
                                    <h3 class="text-sm font-semibold text-gray-800">Estado del Documento</h3>
                                    <p class="text-xs text-gray-600">Progreso de configuración</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-emerald-600" x-text="completionPercentage + '%'">
                                    0%</div>
                                <div class="text-xs text-gray-500">Completado</div>
                            </div>
                        </div>

                        <div class="mt-2">
                            <div class="bg-gray-200 rounded-full h-2">
                                <div class="bg-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
                                    :style="`width: ${completionPercentage}%`"></div>
                            </div>
                        </div>

                        <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="text-center">
                                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
                                    :class="datosdim.C94 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                                    <i class="fas fa-project-diagram text-xs"></i>
                                </div>
                                <p class="text-xs text-gray-600">Proyecto</p>
                            </div>
                            <div class="text-center">
                                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
                                    :class="hasImages ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                                    <i class="fas fa-images text-xs"></i>
                                </div>
                                <p class="text-xs text-gray-600">Imágenes</p>
                            </div>
                            <div class="text-center">
                                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
                                    :class="hasCalculations ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                                    <i class="fas fa-calculator text-xs"></i>
                                </div>
                                <p class="text-xs text-gray-600">Cálculos</p>
                            </div>
                            <div class="text-center">
                                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
                                    :class="isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                                    <i class="fas fa-check text-xs"></i>
                                </div>
                                <p class="text-xs text-gray-600">Completo</p>
                            </div>
                        </div>
                    </div>

                    <!-- DATOS DEL PROYECTO -->
                    <div class="glass-card rounded-2xl p-6 mb-1">
                        <div class="flex items-center mb-6">
                            <div class="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-lg mr-3">
                                <i class="fas fa-project-diagram text-white"></i>
                            </div>
                            <h3 class="text-sm font-semibold text-gray-800">Información del Proyecto</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
                                <input x-model="datosdim.proyecto"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Ingrese el nombre del proyecto">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Código del Proyecto</label>
                                <input x-model="datosdim.codigo"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Ej: PROJ-2024-001">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Fecha</label>
                                <input type="date" x-model="datosdim.fecha"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Entidad / Cliente</label>
                                <input x-model="datosdim.cliente"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nombre del cliente">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Ubicación</label>
                                <input x-model="datosdim.ubicacion"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Ubicación del proyecto">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Ingeniero Responsable</label>
                                <input x-model="datosdim.ingeniero"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nombre del ingeniero">
                            </div>
                        </div>
                    </div>

                    <div class="section-divider"></div>

                    <!-- IMÁGENES PARA EL ENCABEZADO -->
                    <div class="glass-card rounded-2xl p-6 mb-1">
                        <div class="flex items-center mb-6">
                            <div class="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg mr-3">
                                <i class="fas fa-images text-white"></i>
                            </div>
                            <h3 class="text-sm font-semibold text-gray-800">Imágenes para el Documento</h3>
                            <div class="ml-auto text-sm text-gray-500">
                                <i class="fas fa-info-circle mr-1"></i>
                                Formatos: PNG, JPG (Max: 5MB)
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <!-- Logo 1 logo entidad -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-building mr-2 text-blue-500"></i>
                                    Logo Institucional
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.logoFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-blue-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Subir Logo 1</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="logoFile" x-ref="logoFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'logoPreview', 'logoFile')">

                                    <div id="logoFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="logoPreview" class="mt-4"></div>
                            </div>

                            <!-- Logo 2 escudo nacional -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-shield-alt mr-2 text-green-500"></i>
                                    Escudo Nacional
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-green-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.escudoFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-green-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Subir Logo 2</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="escudoFile" x-ref="escudoFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'escudoPreview', 'escudoFile')">

                                    <div id="escudoFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="escudoPreview" class="mt-4"></div>
                            </div>

                            <!-- Logo portada -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-star mr-2 text-yellow-500"></i>
                                    Logo portada
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-yellow-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.logoPrinFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-yellow-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Logo Principal</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="logoPrinFile" x-ref="logoPrinFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'logoPrinPreview', 'logoPrinFile')">

                                    <div id="logoPrinFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="logoPrinPreview" class="mt-4"></div>
                            </div>

                            <!-- logo Planos  -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-star mr-2 text-yellow-500"></i>
                                    Planos
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-yellow-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.logoPlanFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-yellow-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Planos</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="logoPlanFile" x-ref="logoPlanFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'logoPlanPreview', 'logoPlanFile')">

                                    <div id="logoPlanFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="logoPlanPreview" class="mt-4"></div>
                            </div>

                            <!-- Firma -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-signature mr-2 text-purple-500"></i>
                                    Firma Digital
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-purple-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.firmaFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-purple-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Subir Firma</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="firmaFile" x-ref="firmaFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'firmaPreview', 'firmaFile')">

                                    <div id="firmaFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="firmaPreview" class="mt-4"></div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3 -mt-5">
                        <button @click="exportData"
                            class="bg-blue-500 text-white">
                            <i class="fas fa-download mr-2"></i>
                            Exportar WORD
                        </button>
                    </div>

                    <!-- ERROR MESSAGES MEJORADO -->
                    <div x-show="hasErrors" x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform scale-95"
                        x-transition:enter-end="opacity-100 transform scale-100" class="mb-6">
                        <div
                            class="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
                            <div class="flex items-start">
                                <div class="bg-red-100 p-2 rounded-lg mr-4">
                                    <i class="fas fa-exclamation-triangle text-red-500"></i>
                                </div>
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-red-800 mb-2">Errores Encontrados</h3>
                                    <div class="space-y-2">
                                        <template x-for="error in errors" :key="error.id">
                                            <div
                                                class="flex items-center p-3 bg-white rounded-lg border border-red-100">
                                                <i class="fas fa-times-circle text-red-400 mr-3"></i>
                                                <span class="text-red-700 text-sm" x-text="error.message"></span>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

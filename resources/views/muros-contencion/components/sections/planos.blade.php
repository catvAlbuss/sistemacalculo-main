<!-- Dibujo -->
            <div x-show="activeTab === 'dibujo'">
                <div x-data="dibujo" class="cuaderno p-2 w-full mx-auto font-mono">
                    <button @click="exportardwg" :disabled="isExporting"
                        class="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                        <i class="fas mr-2" :class="isExporting ? 'fa-spinner fa-spin' : 'fa-download'"></i>
                        <span x-text="isExporting ? exportStatus : 'descargar plano calculado'"></span>
                    </button>
                    <p class="mt-3 text-xs text-gray-500" x-show="escalaPlano" x-text="'Lámina A1, escala 1:' + escalaPlano + '. Vista previa del archivo DXF.'"></p>
                    <div id="plano-vista" class="wall-drawing mt-3" x-show="vistaPlano" x-html="vistaPlano"></div>
                    <div class="mt-6" x-show="planos.length">
                        <h2 class="text-lg font-semibold mb-2 text-gray-700">Planos descargados</h2>
                        <template x-if="planos.length === 0">
                            <p class="text-gray-500 italic">No hay planos disponibles.</p>
                        </template>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <template x-for="plano in planos" :key="plano.name">
                                <div class="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between">
                                    <div>
                                        <p class="font-semibold text-sm text-gray-700 truncate" x-text="plano.name">
                                        </p>
                                        <p class="text-xs text-gray-400"
                                            x-text="new Date(plano.timestamp).toLocaleString()"></p>
                                    </div>
                                    <div class="flex gap-2 mt-3">
                                        <button @click="abrirPlano(plano.name)"
                                            class="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                                            Abrir
                                        </button>
                                        <button @click="eliminarPlano(plano.name)"
                                            class="flex-1 text-sm bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                </div>
            </div>

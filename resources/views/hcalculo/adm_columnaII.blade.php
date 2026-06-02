<x-app-layout>
    <x-header title="Diseño de Columnas II"></x-header>

<div class="min-h-screen w-full bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 flex overflow-hidden font-sans selection:bg-blue-500/30">
    <!-- Sidebar -->
    <aside class="w-1/4 h-screen bg-white dark:bg-gray-800 p-6 overflow-y-auto shadow z-10 flex flex-col border-r border-gray-200 dark:border-gray-700">
        <form action="#" class="space-y-8 flex-1 mt-2">
            <!-- Requisitos de Diseño -->
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center dark:border-gray-700 dark:bg-gray-700/60">
                    <div class="w-1.5 h-1.5 bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                    <h3 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Requisitos de Diseño</h3>
                </div>
                <div id="in-grid-a" class="grid grid-cols-2 gap-3 p-4"></div>
            </div>
            <!-- INPUT FORCE -->
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center dark:border-gray-700 dark:bg-gray-700/60">
                    <div class="w-1.5 h-1.5 bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                    <h3 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">INPUT FORCE</h3>
                </div>
                <div class="space-y-3 p-4">
                    <div class="border border-gray-200 bg-gray-50 p-3 shadow-inner flex justify-between items-center rounded dark:border-gray-700 dark:bg-gray-900/70">
                        <span class="text-[10px] text-gray-700 dark:text-gray-300 font-mono tracking-widest uppercase">Tabla 1</span>
                        <button type="button" id="btn-fuerzas" onclick="abrirModalFuerzas()" class="rounded border border-gray-300 bg-white px-4 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"><i class="fas fa-edit mr-1"></i> Ingresar</button>
                    </div>
                    <div class="border border-gray-200 bg-gray-50 p-3 shadow-inner flex justify-between items-center rounded dark:border-gray-700 dark:bg-gray-900/70">
                        <span class="text-[10px] text-gray-700 dark:text-gray-300 font-mono tracking-widest uppercase">Tabla 2</span>
                        <button type="button" id="btn-sismo" onclick="abrirModalSismo()" class="rounded border border-gray-300 bg-white px-4 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"><i class="fas fa-edit mr-1"></i> Ingresar</button>
                    </div>
                </div>
            </div>
            <!-- CAPACIDAD A MOMENTO FLECTOR -->
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center dark:border-gray-700 dark:bg-gray-700/60">
                    <div class="w-1.5 h-1.5 bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                    <h3 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">CAPACIDAD A MOMENTO FLECTOR</h3>
                </div>
                <div class="space-y-3 p-4">
                    <div class="border border-gray-200 bg-gray-50 p-3 shadow-inner flex justify-between items-center rounded dark:border-gray-700 dark:bg-gray-900/70">
                        <span class="text-[10px] text-gray-700 dark:text-gray-300 font-mono tracking-widest uppercase">Reducido</span>
                        <button type="button" id="btn-flector-Reducido" onclick="abrirModalC('Reducido')" class="rounded border border-gray-300 bg-white px-4 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"><i class="fas fa-edit mr-1"></i> Ingresar</button>
                    </div>
                    <div class="border border-gray-200 bg-gray-50 p-3 shadow-inner flex justify-between items-center rounded dark:border-gray-700 dark:bg-gray-900/70">
                        <span class="text-[10px] text-gray-700 dark:text-gray-300 font-mono tracking-widest uppercase">Nominal</span>
                        <button type="button" id="btn-flector-Nominal" onclick="abrirModalC('Nominal')" class="rounded border border-gray-300 bg-white px-4 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"><i class="fas fa-edit mr-1"></i> Ingresar</button>
                    </div>
                </div>
            </div>
            <!-- CAPACIDAD A CORTANTE -->
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center dark:border-gray-700 dark:bg-gray-700/60">
                    <div class="w-1.5 h-1.5 bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                    <h3 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">CAPACIDAD A CORTANTE</h3>
                </div>
                <div id="in-grid-d" class="grid grid-cols-2 gap-3 p-4"></div>
            </div>
        </form>
    </aside>
    <!-- Main Content -->
    <main class="w-3/4 h-full p-6 overflow-y-auto bg-gray-50 relative dark:bg-gray-900">
        <div class="space-y-8 relative z-10 mt-2">
            <!-- REQUISITOS DE DISEÑO OUTPUT -->
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm relative border-l-4 border-l-blue-500 dark:border-gray-700 dark:bg-gray-800">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center dark:border-gray-700 dark:bg-gray-700/60">
                    <h3 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">REQUISITOS DE DISEÑO</h3>
                </div>
                <div id="out-grid-a" class="w-full"></div>
            </div>
            <!-- OUTPUT FORCE -->
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm relative border-l-4 border-l-blue-500 dark:border-gray-700 dark:bg-gray-800">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center dark:border-gray-700 dark:bg-gray-700/60">
                    <h3 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">OUTPUT FORCE</h3>
                </div>
                <div class="w-full">
                    <div id="tabulator-salida" class="tabulator-table-wrapper w-full"></div>
                </div>
            </div>
            <!-- CAPACIDAD A MOMENTO FLECTOR OUTPUT -->
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm relative border-l-4 border-l-blue-500 dark:border-gray-700 dark:bg-gray-800">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center dark:border-gray-700 dark:bg-gray-700/60">
                    <h3 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">CAPACIDAD A MOMENTO FLECTOR</h3>
                </div>
                <div class="space-y-10 p-4">
                    <!-- Nominal -->
                    <div>
                        <h4 class="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4 flex items-center">
                            <i class="fas fa-cube text-blue-500 mr-2"></i>Output Di Nominal
                        </h4>
                        <div class="grid grid-cols-2 gap-6">
                            <div class="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
                                <div class="h-80" id="chart-nom-1"></div>
                            </div>
                            <div class="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
                                <div class="h-80" id="chart-nom-2"></div>
                            </div>
                        </div>
                        <div class="mt-6">
                            <div id="tabulator-salida-nominal" class="tabulator-table-wrapper w-full"></div>
                        </div>
                    </div>
                    <!-- Reducido -->
                    <div>
                        <h4 class="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4 flex items-center">
                            <i class="fas fa-cube text-purple-500 mr-2"></i>Output Di Reducido
                        </h4>
                        <div class="grid grid-cols-2 gap-6">
                            <div class="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
                                <div class="h-80" id="chart-red-1"></div>
                            </div>
                            <div class="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
                                <div class="h-80" id="chart-red-2"></div>
                            </div>
                        </div>
                        <div class="mt-6">
                            <div id="tabulator-salida-reducida" class="tabulator-table-wrapper w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- CAPACIDAD A CORTANTE OUTPUT -->
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm relative border-l-4 border-l-blue-500 dark:border-gray-700 dark:bg-gray-800">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center dark:border-gray-700 dark:bg-gray-700/60">
                    <h3 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">CAPACIDAD A CORTANTE</h3>
                </div>
                <div id="out-grid-d" class="w-full p-4"></div>
            </div>
        </div>
    </main>
</div>

<!-- Modals -->

<!-- Modal Fuerzas -->
<div id="modal-fuerzas" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div class="w-11/12 h-5/6 flex flex-col rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center dark:border-gray-700 dark:bg-gray-700/60">
            <h2 class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Ingreso de Fuerzas</h2>
            <button type="button" onclick="cerrarModalFuerzas()" class="text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
            <div id="tabulator-ingreso"></div>
        </div>
        <div class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3 dark:border-gray-700 dark:bg-gray-700/60">
            <button type="button" onclick="limpiarTabla()" class="bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 border border-gray-600 rounded transition-all font-semibold text-sm uppercase">
                <i class="fas fa-trash mr-2"></i>Limpiar
            </button>
            <button type="button" onclick="guardarFuerzas()" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 border border-blue-500 rounded transition-all font-semibold text-sm uppercase">
                <i class="fas fa-save mr-2"></i>Guardar
            </button>
        </div>
    </div>
</div>

<!-- Modal Sismo -->
<div id="modal-sismo" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div class="w-11/12 h-5/6 flex flex-col rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center dark:border-gray-700 dark:bg-gray-700/60">
            <h2 class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Ingreso de Sismo</h2>
            <button type="button" onclick="cerrarModalSismo()" class="text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
            <div id="tabulator-sismo-ingreso"></div>
        </div>
        <div class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3 dark:border-gray-700 dark:bg-gray-700/60">
            <button type="button" onclick="limpiarSismo()" class="bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 border border-gray-600 rounded transition-all font-semibold text-sm uppercase">
                <i class="fas fa-trash mr-2"></i>Limpiar
            </button>
            <button type="button" onclick="guardarSismo()" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 border border-blue-500 rounded transition-all font-semibold text-sm uppercase">
                <i class="fas fa-save mr-2"></i>Guardar
            </button>
        </div>
    </div>
</div>

<!-- Modal Flector -->
<div id="modal-flector" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div class="w-11/12 h-5/6 flex flex-col rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center dark:border-gray-700 dark:bg-gray-700/60">
            <h2 id="titulo-modal-flector" class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Matriz Flector</h2>
            <button type="button" onclick="cerrarModalC()" class="text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
        <div class="border-b border-gray-200 bg-white px-6 py-3 flex justify-between items-center dark:border-gray-700 dark:bg-gray-800">
            <span id="texto-curva-actual" class="text-xs text-gray-500 dark:text-gray-400 font-mono">CURVA 1 DE 24</span>
            <div class="flex gap-2">
                <button type="button" onclick="cambiarCurva(-1)" class="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button type="button" onclick="cambiarCurva(1)" class="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
            <div id="tabulator-flector-ingreso"></div>
        </div>
        <div class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3 dark:border-gray-700 dark:bg-gray-700/60">
            <button type="button" onclick="limpiarFlector()" class="bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 border border-gray-600 rounded transition-all font-semibold text-sm uppercase">
                <i class="fas fa-trash mr-2"></i>Limpiar
            </button>
            <button type="button" onclick="guardarFlector()" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 border border-blue-500 rounded transition-all font-semibold text-sm uppercase">
                <i class="fas fa-save mr-2"></i>Guardar
            </button>
        </div>
    </div>
</div>

@push('styles')
    <link rel="stylesheet" href="https://unpkg.com/tabulator-tables@5.5.2/dist/css/tabulator.min.css">
    @vite('resources/css/columnaII.css')
@endpush

@push('scripts')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
    <script src="https://unpkg.com/tabulator-tables@5.5.2/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.plot.ly/plotly-2.32.0.min.js"></script>
    @vite('resources/js/columnav2/adm_columnav2.js')
@endpush

</x-app-layout>

{{-- resources/views/hcalculo/memoria_descriptiva/sections/generalidades-md.blade.php --}}
<x-calc-layout title="Memoria Descriptiva - Generalidades">
    <div class="py-4" x-data="memoriaDescriptiva" x-init="init()">
        <div class="container mx-auto px-4 max-w-7xl">

            {{-- ══════════════ BARRA DE NAVEGACIÓN ══════════════ --}}
            <nav class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.portada') }}"
                   class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    📄 Portada
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.generalidades') }}"
                   class="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md text-sm font-medium">
                    📋 1. GENERALIDADES
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.consideraciones') }}"
                   class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    ⚙️ 2. CONSIDERACIONES
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.predimensionamiento') }}"
                   class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    📐 3. PREDIMENSIONAMIENTO
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.demolicion') }}"
                   class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    💥 4. DEMOLICIÓN
                </a>
            </nav>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">

                {{-- HEADER --}}
                <div class="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-white">1. GENERALIDADES</h2>
                            <p class="text-green-100 text-sm">Antecedentes, datos del proyecto, objetivos y marco normativo</p>
                        </div>
                    </div>
                </div>

                <div class="p-6 space-y-8">

                    {{-- ══════════════════════════════════════
                         1.1. ANTECEDENTES
                    ══════════════════════════════════════ --}}
                    <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                1.1. ANTECEDENTES
                            </h3>
                        </div>
                        <div class="p-4 space-y-4">
                            <div>
                                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Historia de la Institución</label>
                                <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.antecedentes.history"
                                          rows="10"
                                          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                                          placeholder="Describa la historia de la institución educativa..."></textarea>
                                <p class="text-xs text-gray-400 mt-1">💡 Este texto aparecerá en el Word exactamente como lo escribas</p>
                            </div>

                            {{-- Vias de Acceso --}}
                            <div>
                                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">VIAS DE ACCESO</p>
                                <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                                    <table class="w-full border-collapse text-sm">
                                        <thead>
                                            <tr class="bg-gray-100 dark:bg-gray-700">
                                                <th class="border border-gray-200 dark:border-gray-600 p-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">TRAMO</th>
                                                <th class="border border-gray-200 dark:border-gray-600 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">DISTANCIA (km)</th>
                                                <th class="border border-gray-200 dark:border-gray-600 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">TIEMPO</th>
                                                <th class="border border-gray-200 dark:border-gray-600 p-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">CARRETERA</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white dark:bg-gray-800">
                                            @foreach([
                                                ['key'=>'limaHuanuco'],
                                                ['key'=>'huanucoTingo'],
                                                ['key'=>'tingoPucallpa'],
                                                ['key'=>'pucallpaContamana'],
                                            ] as $tramo)
                                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td class="border border-gray-200 dark:border-gray-600 p-2">
                                                    <input type="text"
                                                           x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.{{ $tramo['key'] }}.tramo"
                                                           class="w-full min-w-48 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                </td>
                                                <td class="border border-gray-200 dark:border-gray-600 p-2 text-center">
                                                    <input type="text"
                                                           x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.{{ $tramo['key'] }}.distancia"
                                                           class="w-20 border border-gray-300 dark:border-gray-600 rounded p-1 text-center text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                </td>
                                                <td class="border border-gray-200 dark:border-gray-600 p-2 text-center">
                                                    <input type="text"
                                                           x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.{{ $tramo['key'] }}.tiempo"
                                                           class="w-28 border border-gray-300 dark:border-gray-600 rounded p-1 text-center text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                </td>
                                                <td class="border border-gray-200 dark:border-gray-600 p-2">
                                                    <input type="text"
                                                           x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.{{ $tramo['key'] }}.tipo"
                                                           class="w-full min-w-32 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                </td>
                                            </tr>
                                            @endforeach
                                            <tr class="bg-green-50 dark:bg-green-900/20 font-bold">
                                                <td class="border border-gray-200 dark:border-gray-600 p-2">
                                                    <input type="text"
                                                           x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.total.tramo"
                                                           class="w-full min-w-48 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm font-bold bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                </td>
                                                <td class="border border-gray-200 dark:border-gray-600 p-2 text-center">
                                                    <input type="text"
                                                           x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.total.distancia"
                                                           class="w-20 border border-gray-300 dark:border-gray-600 rounded p-1 text-center text-sm font-bold bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                </td>
                                                <td class="border border-gray-200 dark:border-gray-600 p-2 text-center">
                                                    <input type="text"
                                                           x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.total.tiempo"
                                                           class="w-28 border border-gray-300 dark:border-gray-600 rounded p-1 text-center text-sm font-bold bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                </td>
                                                <td class="border border-gray-200 dark:border-gray-600 p-2">
                                                    <input type="text"
                                                           x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.total.tipo"
                                                           class="w-full min-w-32 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm font-bold bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {{-- Demanda Educativa --}}
                            <div>
                                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">DEMANDA EDUCATIVA</p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    @foreach([
                                        ['key'=>'demandaInicialImage',  'label'=>'DEMANDA INICIAL',  'caption'=>'Cuadro 1: Demanda de Inicial Ciclo II'],
                                        ['key'=>'demandaPrimariaImage', 'label'=>'DEMANDA PRIMARIA', 'caption'=>'Cuadro 2: Demanda de Primaria'],
                                    ] as $img)
                                    <div class="text-center">
                                        <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{{ $img['label'] }}</p>
                                        {{-- Con imagen --}}
                                        <div x-show="$store.memoriaDescriptiva.previews['{{ $img['key'] }}']" class="relative inline-block">
                                            <img :src="$store.memoriaDescriptiva.previews['{{ $img['key'] }}'] || ''"
                                                 class="max-h-40 object-contain border border-gray-200 dark:border-gray-600 rounded-lg mx-auto">
                                            <button type="button"
                                                    @click="$store.memoriaDescriptiva.removeImage('{{ $img['key'] }}')"
                                                    class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow">✕</button>
                                        </div>
                                        {{-- Sin imagen --}}
                                        <label x-show="!$store.memoriaDescriptiva.previews['{{ $img['key'] }}']"
                                               class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                                            <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                            <span class="text-xs text-gray-500">Subir imagen</span>
                                            <input type="file" accept="image/*"
                                                   @change="$store.memoriaDescriptiva.handleImageChange('{{ $img['key'] }}', $event)"
                                                   class="hidden">
                                        </label>
                                        <p class="text-xs text-gray-400 mt-1">{{ $img['caption'] }}</p>
                                    </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         1.2. DATOS DEL PROYECTO
                    ══════════════════════════════════════ --}}
                    <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                </svg>
                                1.2. DATOS DEL PROYECTO
                            </h3>
                        </div>
                        <div class="p-4 space-y-4">
                            <div>
                                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Nombre del Proyecto</label>
                                <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.nombre"
                                          rows="3"
                                          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"></textarea>
                            </div>
                            <div>
                                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Nombre de la UEI</label>
                                <input type="text"
                                       x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.uei"
                                       class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                                    <p class="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">Ubicación Política</p>
                                    @foreach([
                                        ['key'=>'localidad', 'label'=>'Localidad'],
                                        ['key'=>'distrito',  'label'=>'Distrito'],
                                        ['key'=>'provincia', 'label'=>'Provincia'],
                                        ['key'=>'region',    'label'=>'Región'],
                                    ] as $f)
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="text-green-500 text-sm flex-shrink-0">•</span>
                                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{{ $f['label'] }}:</span>
                                        <input type="text"
                                               x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.{{ $f['key'] }}"
                                               class="flex-1 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-green-500">
                                    </div>
                                    @endforeach
                                </div>

                                <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                                    <p class="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">Coordenadas UTM</p>
                                    @foreach([
                                        ['key'=>'este',    'label'=>'Este'],
                                        ['key'=>'norte',   'label'=>'Norte'],
                                        ['key'=>'altitud', 'label'=>'Altitud'],
                                    ] as $f)
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="text-green-500 text-sm flex-shrink-0">•</span>
                                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{{ $f['label'] }}:</span>
                                        <input type="text"
                                               x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.{{ $f['key'] }}"
                                               class="flex-1 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-green-500">
                                    </div>
                                    @endforeach
                                </div>

                                <div class="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                                    <p class="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">Colindancias</p>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        @foreach([
                                            ['key'=>'colindanciaNorte', 'label'=>'Norte'],
                                            ['key'=>'colindanciaSur',   'label'=>'Sur'],
                                            ['key'=>'colindanciaEste',  'label'=>'Este'],
                                            ['key'=>'colindanciaOeste', 'label'=>'Oeste'],
                                        ] as $f)
                                        <div class="flex items-center gap-2">
                                            <span class="text-green-500 text-sm flex-shrink-0">•</span>
                                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400 w-14 flex-shrink-0">{{ $f['label'] }}:</span>
                                            <input type="text"
                                                   x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.{{ $f['key'] }}"
                                                   class="flex-1 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-green-500">
                                        </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>

                            {{-- Figuras --}}
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                @foreach([
                                    ['key'=>'ubicacionImage1', 'label'=>'Figura 1: Ubicación del área'],
                                    ['key'=>'ubicacionImage2', 'label'=>'Figura 2: Plano de Ubicación'],
                                ] as $img)
                                <div>
                                    <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">{{ $img['label'] }}</label>
                                    <div x-show="$store.memoriaDescriptiva.previews['{{ $img['key'] }}']" class="relative inline-block w-full">
                                        <img :src="$store.memoriaDescriptiva.previews['{{ $img['key'] }}'] || ''"
                                             class="max-h-48 object-contain border border-gray-200 dark:border-gray-600 rounded-lg w-full">
                                        <button type="button"
                                                @click="$store.memoriaDescriptiva.removeImage('{{ $img['key'] }}')"
                                                class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow">✕</button>
                                    </div>
                                    <label x-show="!$store.memoriaDescriptiva.previews['{{ $img['key'] }}']"
                                           class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                                        <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        <span class="text-xs text-gray-500">Subir imagen</span>
                                        <input type="file" accept="image/*"
                                               @change="$store.memoriaDescriptiva.handleImageChange('{{ $img['key'] }}', $event)"
                                               class="hidden">
                                    </label>
                                </div>
                                @endforeach
                            </div>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         1.3. DOCUMENTOS Y PLANOS
                    ══════════════════════════════════════ --}}
                    <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                1.3. RELACIÓN DE DOCUMENTOS Y PLANOS
                            </h3>
                        </div>
                        <div class="p-4 space-y-6">
                            <div>
                                <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">1.3.1 DOCUMENTOS DEL PROYECTO</h4>
                                <textarea
                                    :value="($store.memoriaDescriptiva.sections.documentosPlanos.documentos ?? []).join('\n')"
                                    @input="$store.memoriaDescriptiva.sections.documentosPlanos.documentos = $event.target.value.split('\n').filter(l => l.trim() !== '')"
                                    rows="8"
                                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                                    placeholder="Escriba cada documento en una línea nueva..."></textarea>
                                <p class="text-xs text-gray-400 mt-1">💡 Cada línea se convertirá en una viñeta en el Word</p>
                            </div>

                            <div>
                                <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">1.3.2 PLANOS DEL PROYECTO</h4>
                                <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                                    <table class="w-full border-collapse text-sm">
                                        <thead>
                                            <tr class="bg-gray-100 dark:bg-gray-700">
                                                <th class="border border-gray-200 dark:border-gray-600 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 w-10">N°</th>
                                                <th class="border border-gray-200 dark:border-gray-600 p-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">DESCRIPCIÓN</th>
                                                <th class="border border-gray-200 dark:border-gray-600 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 w-28">LÁMINA</th>
                                                <th class="border border-gray-200 dark:border-gray-600 p-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white dark:bg-gray-800">
                                            <template x-for="(plano, idx) in ($store.memoriaDescriptiva.sections.documentosPlanos.planos ?? [])" :key="idx">
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                    :class="plano.esEncabezado ? 'bg-green-50 dark:bg-green-900/20' : ''">
                                                    <td class="border border-gray-200 dark:border-gray-600 p-2 text-center text-gray-500 dark:text-gray-400 text-xs"
                                                        x-text="plano.esEncabezado ? '' : (idx + 1)"></td>
                                                    <td class="border border-gray-200 dark:border-gray-600 p-2">
                                                        <input type="text" x-model="plano.descripcion"
                                                               :class="plano.esEncabezado ? 'font-bold text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'"
                                                               class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 focus:ring-1 focus:ring-green-500">
                                                    </td>
                                                    <td class="border border-gray-200 dark:border-gray-600 p-2 text-center">
                                                        <input type="text" x-model="plano.lamina"
                                                               class="w-24 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm text-center bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-green-500">
                                                    </td>
                                                    <td class="border border-gray-200 dark:border-gray-600 p-2 text-center">
                                                        <button type="button"
                                                                @click="$store.memoriaDescriptiva.sections.documentosPlanos.planos.splice(idx, 1)"
                                                                class="text-red-400 hover:text-red-600 transition">✕</button>
                                                    </td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </div>
                                <button type="button"
                                        @click="$store.memoriaDescriptiva.sections.documentosPlanos.planos.push({ descripcion: '', lamina: '' })"
                                        class="text-green-600 hover:text-green-700 text-sm mt-3 flex items-center gap-1 transition">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Agregar plano
                                </button>
                            </div>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         1.4. OBJETIVOS
                    ══════════════════════════════════════ --}}
                    <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300">🎯 1.4. OBJETIVOS</h3>
                        </div>
                        <div class="p-4 space-y-4">
                            <div>
                                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Objetivo General</label>
                                <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.objetivos.general"
                                          rows="3"
                                          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"></textarea>
                            </div>
                            <div>
                                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">Objetivos Específicos</label>
                                <template x-for="(item, idx) in ($store.memoriaDescriptiva.sections.generalidades.objetivos.especificos ?? [])" :key="idx">
                                    <div class="flex gap-2 mt-2">
                                        <span class="text-green-500 text-sm mt-2 flex-shrink-0" x-text="(idx + 1) + '.'"></span>
                                        <input type="text"
                                               :value="item"
                                               @input="$store.memoriaDescriptiva.sections.generalidades.objetivos.especificos[idx] = $event.target.value"
                                               class="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        <button type="button"
                                                @click="$store.memoriaDescriptiva.sections.generalidades.objetivos.especificos.splice(idx, 1)"
                                                class="text-red-400 hover:text-red-600 transition flex-shrink-0">✕</button>
                                    </div>
                                </template>
                                <button type="button"
                                        @click="$store.memoriaDescriptiva.sections.generalidades.objetivos.especificos.push('')"
                                        class="text-green-600 hover:text-green-700 text-sm mt-3 flex items-center gap-1 transition">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Agregar objetivo
                                </button>
                            </div>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         1.5. MARCO NORMATIVO
                    ══════════════════════════════════════ --}}
                    <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300">📜 1.5. MARCO NORMATIVO</h3>
                        </div>
                        <div class="p-4">
                            <template x-for="(item, idx) in ($store.memoriaDescriptiva.sections.generalidades.marcoNormativo ?? [])" :key="idx">
                                <div class="flex gap-2 mt-2">
                                    <span class="text-green-500 text-sm mt-2 flex-shrink-0">•</span>
                                    <input type="text"
                                           :value="item"
                                           @input="$store.memoriaDescriptiva.sections.generalidades.marcoNormativo[idx] = $event.target.value"
                                           class="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                    <button type="button"
                                            @click="$store.memoriaDescriptiva.sections.generalidades.marcoNormativo.splice(idx, 1)"
                                            class="text-red-400 hover:text-red-600 transition flex-shrink-0">✕</button>
                                </div>
                            </template>
                            <button type="button"
                                    @click="$store.memoriaDescriptiva.sections.generalidades.marcoNormativo.push('')"
                                    class="text-green-600 hover:text-green-700 text-sm mt-3 flex items-center gap-1 transition">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                Agregar norma
                            </button>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         1.6. DESCRIPCIÓN DE BLOQUES / MÓDULOS
                         FIX PRINCIPAL: componente externo x-data por módulo
                         para evitar x-for anidados con x-if que rompen Alpine
                    ══════════════════════════════════════ --}}
                    <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div class="flex justify-between items-center">
                                <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                    </svg>
                                    1.6. DESCRIPCIÓN DE BLOQUES O EDIFICACIONES
                                </h3>
                                <button type="button"
                                        @click="$store.memoriaDescriptiva.addModulo()"
                                        class="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm">
                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Agregar Módulo
                                </button>
                            </div>
                        </div>

                        <div class="p-4">
                            <p class="text-xs text-gray-400 mb-4">💡 Complete los datos estructurales de cada módulo del proyecto</p>

                            {{--
                                FIX: El x-for de módulos NO tiene x-if ni x-for anidados con <template>.
                                Las imágenes se renderizan mediante un sub-componente x-data independiente
                                dentro de cada iteración, usando x-show en vez de x-if anidado.
                            --}}
                            <template x-for="(modulo, idx) in ($store.memoriaDescriptiva?.sections?.descripcionModulos?.modulos ?? [])" :key="'modulo-key-' + idx + '-' + ($store.memoriaDescriptiva?.sections?.descripcionModulos?.modulos?.length)">

                                <div class="mb-4 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">

                                    {{-- Cabecera módulo --}}
                                    <div class="bg-gradient-to-r from-green-50 to-gray-50 dark:from-green-900/20 dark:to-gray-800/50 px-4 py-2 flex justify-between items-center">
                                        <div class="flex items-center gap-3 min-w-0">
                                            <span class="text-green-600 dark:text-green-400 font-bold text-sm flex-shrink-0"
                                                  x-text="modulo.nombre || ('MÓDULO ' + String(idx + 1).padStart(2, '0'))"></span>
                                            <span class="text-xs text-gray-400 truncate"
                                                  x-text="(modulo.uso || 'Sin uso asignado').substring(0, 60)"></span>
                                        </div>
                                       <button type="button"
        @click="$store.memoriaDescriptiva.removeModulo(idx)"
        class="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 transition flex-shrink-0 ml-2">
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
    Eliminar
</button>
                                    </div>

                                    {{-- Campos del módulo --}}
                                    <div class="p-4 bg-white dark:bg-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Nombre del Módulo</label>
                                            <input type="text" x-model="modulo.nombre"
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                   placeholder="Ej: MÓDULO 01">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Número de Pisos</label>
                                            <input type="number"
                                                   :value="parseInt(modulo.pisos) || 1"
                                                   @change.debounce.200ms="modulo.pisos = Math.max(1, parseInt($event.target.value) || 1); $store.memoriaDescriptiva.sincronizarImagenesPorPisos(idx)"
                                                   min="1" max="10"
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                            <p class="text-xs text-gray-400 mt-1">📐 Define cuántas imágenes tendrá este módulo</p>
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Uso / Descripción</label>
                                            <input type="text" x-model="modulo.uso"
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                   placeholder="Ej: Aulas, comedor, SS.HH, etc.">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Sistema Estructural en X</label>
                                            <input type="text" x-model="modulo.sistemaX"
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                   placeholder="Ej: Sistema Dual">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Sistema Estructural en Y</label>
                                            <input type="text" x-model="modulo.sistemaY"
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                   placeholder="Ej: Albañilería confinada">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Elementos Verticales</label>
                                            <textarea x-model="modulo.elementosVerticales" rows="2"
                                                      class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                                                      placeholder="Ej: Placas, Columnas, Muros de albañilería"></textarea>
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Elementos Horizontales</label>
                                            <textarea x-model="modulo.elementosHorizontales" rows="2"
                                                      class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                                                      placeholder="Ej: Vigas en X de V30x50 cm"></textarea>
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Tipo de Techo</label>
                                            <textarea x-model="modulo.techo" rows="2"
                                                      class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                                                      placeholder="Ej: Losa aligerada e=20cm, Cobertura metálica"></textarea>
                                        </div>

                                        {{--
                                            ─────────────────────────────────────────────────
                                            BLOQUE DE IMÁGENES — FIX DEFINITIVO
                                            Usamos x-data propio + JS puro para renderizar
                                            las celdas de imagen sin x-for ni x-if anidados.
                                            Esto elimina el crash de Alpine en el DOM.
                                            ─────────────────────────────────────────────────
                                        --}}
                                        <div class="md:col-span-2"
                                             x-data="{
                                                get pisos() { return Math.max(1, parseInt(modulo.pisos) || 1); },
                                                 get mapeo() {
                                                     const numero = $store.memoriaDescriptiva.extraerNumeroModulo?.(modulo.nombre) || modulo.id || (idx + 1);
                                                     return $store.memoriaDescriptiva.sections.descripcionModulos.mapeoImagenes[numero] || null;
                                                 },
                                                tieneOriginal(n) {
    // Verificación más directa
    if (!this.mapeo) return false;
    if (!this.mapeo.archivos) return false;
    if (!this.mapeo.archivos[n]) return false;
    return true;
},
                                                srcOriginal(n) {
                                                    return this.mapeo ? ('/assets/img/memoria_decriptiva/modulos/' + this.mapeo.archivos[n]) : '';
                                                },
                                                figuraOriginal(n) {
                                                    return this.mapeo ? (this.mapeo.figuras[n] || '') : '';
                                                },
                                                subtituloOriginal(n) {
                                                    return this.mapeo ? (this.mapeo.subtitulos[n] || '') : '';
                                                },
                                                tieneSubida(n) {
                                                    return modulo.imagenes && modulo.imagenes[n];
                                                },
                                                srcSubida(n) {
                                                    return (modulo.imagenes && modulo.imagenes[n]) ? modulo.imagenes[n] : '';
                                                },
                                                subtituloSubida(n) {
                                                    return (modulo.subtitulosImagenes && modulo.subtitulosImagenes[n]) ? modulo.subtitulosImagenes[n] : '';
                                                },
                                                setSubtitulo(n, val) {
                                                    if (!modulo.subtitulosImagenes) modulo.subtitulosImagenes = [];
                                                    modulo.subtitulosImagenes[n] = val;
                                                },
                                                etiqueta(n) {
                                                    return ['🏠 Planta','📐 Elevación','✂️ Sección','📄 Detalle'][n] || ('Nivel ' + (n+1));
                                                }
                                             }">
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">📸 Imágenes del Módulo</label>

                                            {{--
                                                Render de celdas: iteramos con JS sobre un array
                                                generado en x-data, sin x-for de template anidado.
                                                Cada celda usa x-show en lugar de x-if para no
                                                destruir nodos del DOM (evita el error .after).
                                            --}}
                                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {{-- Generamos hasta 10 slots estáticos; los que sobran quedan ocultos --}}
                                                @for($n = 0; $n < 10; $n++)
                                                <div x-show="{{ $n }} < pisos"
                                                     class="border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-center bg-gray-50 dark:bg-gray-800/50">

                                                    <div class="relative inline-block w-full">
                                                        <img x-show="tieneSubida({{ $n }})"
                                                             :src="srcSubida({{ $n }})"
                                                             class="h-28 mx-auto object-contain border border-gray-200 dark:border-gray-600 rounded"
                                                             loading="lazy">
                                                        <img x-show="!tieneSubida({{ $n }}) && tieneOriginal({{ $n }})"
     :src="srcOriginal({{ $n }})"
     class="h-28 mx-auto object-contain rounded"
     loading="lazy">

                                                        <button type="button"
                                                                x-show="tieneSubida({{ $n }})"
                                                                @click="$store.memoriaDescriptiva.eliminarImagenModulo(idx, {{ $n }})"
                                                                class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow">x</button>
                                                    </div>

                                                    <label x-show="!tieneSubida({{ $n }}) && !tieneOriginal({{ $n }})"
                                                           class="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                                                        <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                        </svg>
                                                        <span class="text-xs text-gray-500 mt-1">Subir nivel {{ $n + 1 }}</span>
                                                        <input type="file" accept="image/*"
                                                               @change="$store.memoriaDescriptiva.subirImagenModulo(idx, {{ $n }}, $event)"
                                                               class="hidden">
                                                    </label>

                                                    <p class="text-xs text-gray-500 mt-1">
                                                        <span x-show="tieneSubida({{ $n }})">Imagen personalizada</span>
                                                        <span x-show="!tieneSubida({{ $n }}) && tieneOriginal({{ $n }})">
                                                            Original - Figura <span x-text="figuraOriginal({{ $n }})"></span><span x-text="subtituloOriginal({{ $n }})"></span>
                                                        </span>
                                                    </p>

                                                    <label class="inline-flex items-center justify-center mt-2 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition">
                                                        <span x-text="tieneSubida({{ $n }}) || tieneOriginal({{ $n }}) ? 'Cambiar imagen' : 'Subir imagen'"></span>
                                                        <input type="file" accept="image/*"
                                                               @change="$store.memoriaDescriptiva.subirImagenModulo(idx, {{ $n }}, $event)"
                                                               class="hidden">
                                                    </label>

                                                    <input type="text"
                                                           :value="subtituloSubida({{ $n }})"
                                                           @input="setSubtitulo({{ $n }}, $event.target.value)"
                                                           class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-xs mt-2 text-center bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-green-500"
                                                           placeholder="Subtitulo opcional">

                                                    <p class="text-xs font-semibold text-gray-400 mt-1" x-text="etiqueta({{ $n }})"></p>
                                                </div>
                                                @endfor
                                            </div>
                                            <p class="text-xs text-gray-400 mt-2">💡 Las imágenes originales del Word se muestran automáticamente. Aumenta los pisos para agregar más.</p>
                                        </div>
                                    </div>{{-- /grid campos --}}
                                </div>{{-- /card módulo --}}
                            </template>

                            {{-- Estado vacío --}}
                            <div x-show="($store.memoriaDescriptiva?.sections?.descripcionModulos?.modulos ?? []).length === 0"
                                 class="text-center py-12 text-gray-400">
                                <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                </svg>
                                <p class="text-sm">No hay módulos registrados</p>
                                <p class="text-xs mt-1">Haga clic en "Agregar Módulo" para comenzar</p>
                            </div>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         BOTONES DE NAVEGACIÓN
                    ══════════════════════════════════════ --}}
                    <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a href="{{ route('calculadora.asistente.memoria-descriptiva.portada') }}"
                           class="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                            Anterior
                        </a>

                        <button type="button"
                                @click="exportWord()"
                                :disabled="isExporting"
                                class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
                        </button>

                        <a href="{{ route('calculadora.asistente.memoria-descriptiva.consideraciones') }}"
                           class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium">
                            Siguiente
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </a>
                    </div>

                </div>{{-- /p-6 --}}
            </div>{{-- /card --}}
        </div>{{-- /container --}}
    </div>{{-- /x-data --}}

    @pushOnce('initscripts')
        <script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        @vite('resources/js/documentos/memoria_descriptiva/index-refactored-md.js')
    @endPushOnce
</x-calc-layout>
    
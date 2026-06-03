
<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => 'Memoria Descriptiva - Generalidades']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Memoria Descriptiva - Generalidades']); ?>
    <div class="py-4" x-data="memoriaDescriptiva" x-init="init()">
        <div class="container mx-auto px-4 max-w-7xl">

            
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.portada')); ?>" 
                   class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📄 Portada</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.generalidades')); ?>" 
                   class="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md">📋 1. GENERALIDADES</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.consideraciones')); ?>" 
                   class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">⚙️ 2. CONSIDERACIONES</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.predimensionamiento')); ?>" 
                   class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📐 3. PREDIMENSIONAMIENTO</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.demolicion')); ?>" 
                   class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">💥 4. DEMOLICIÓN</a>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                
                
                <div class="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-white">1. GENERALIDADES</h2>
                            <p class="text-green-100 text-sm">Antecedentes, datos del proyecto, objetivos y marco normativo</p>
                        </div>
                    </div>
                </div>

                <div class="p-6 space-y-8">

                    
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                1.1. ANTECEDENTES
                            </h3>
                        </div>
                        <div class="p-4">
                            <label class="text-xs font-semibold text-gray-500 block mb-1">Historia de la Institución</label>
                            <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.antecedentes.history" 
                                      rows="10" class="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500"></textarea>
                            <p class="text-xs text-gray-400 mt-2">💡 Este texto aparecerá en el Word exactamente como lo escribas</p>
                        </div>
                    </div>

                    
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                VÍAS DE ACCESO
                            </h3>
                        </div>
                        <div class="p-4">
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse border border-gray-300 text-sm">
                                    <thead>
                                        <tr class="bg-gray-100 dark:bg-gray-700">
                                            <th class="border p-2">TRAMO</th>
                                            <th class="border p-2">DISTANCIA (km)</th>
                                            <th class="border p-2">TIEMPO</th>
                                            <th class="border p-2">CARRETERA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td class="border p-2 font-medium">Lima - Huánuco</td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.limaHuanuco.distancia" class="w-20 border rounded p-1 text-center"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.limaHuanuco.tiempo" class="w-28 border rounded p-1 text-center"></td>
                                            <td class="border p-2">Asfaltada</td></tr>
                                        <tr><td class="border p-2 font-medium">Huánuco - Tingo María</td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.huanucoTingo.distancia" class="w-20 border rounded p-1 text-center"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.huanucoTingo.tiempo" class="w-28 border rounded p-1 text-center"></td>
                                            <td class="border p-2">Asfaltada</td></tr>
                                        <tr><td class="border p-2 font-medium">Tingo María - Pucallpa</td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.tingoPucallpa.distancia" class="w-20 border rounded p-1 text-center"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.tingoPucallpa.tiempo" class="w-28 border rounded p-1 text-center"></td>
                                            <td class="border p-2">Asfaltada</td></tr>
                                        <tr><td class="border p-2 font-medium">Pucallpa - Contamana</td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.pucallpaContamana.distancia" class="w-20 border rounded p-1 text-center"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.pucallpaContamana.tiempo" class="w-28 border rounded p-1 text-center"></td>
                                            <td class="border p-2">Rápido (Barco)</td></tr>
                                        <tr class="bg-gray-100 font-bold"><td class="border p-2">Total</td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.total.distancia" class="w-20 border rounded p-1 text-center"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.acceso.total.tiempo" class="w-28 border rounded p-1 text-center"></td>
                                            <td class="border p-2"></td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                DEMANDA EDUCATIVA
                            </h3>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="text-xs font-semibold text-gray-500 block mb-2">DEMANDA INICIAL</label>
                                    <div class="relative">
                                        <template x-if="$store.memoriaDescriptiva.previews.demandaInicialImage">
                                            <div class="relative inline-block">
                                                <img :src="$store.memoriaDescriptiva.previews.demandaInicialImage" class="max-h-40 object-contain border rounded-lg">
                                                <button @click="$store.memoriaDescriptiva.removeImage('demandaInicialImage')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                                            </div>
                                        </template>
                                        <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100" x-show="!$store.memoriaDescriptiva.previews.demandaInicialImage">
                                            <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span class="text-xs text-gray-500">Subir imagen</span>
                                            <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('demandaInicialImage', $event)" class="hidden">
                                        </label>
                                    </div>
                                    <p class="text-xs text-gray-400 text-center mt-1">Cuadro 1: Demanda de Inicial Ciclo II</p>
                                </div>
                                <div>
                                    <label class="text-xs font-semibold text-gray-500 block mb-2">DEMANDA PRIMARIA</label>
                                    <div class="relative">
                                        <template x-if="$store.memoriaDescriptiva.previews.demandaPrimariaImage">
                                            <div class="relative inline-block">
                                                <img :src="$store.memoriaDescriptiva.previews.demandaPrimariaImage" class="max-h-40 object-contain border rounded-lg">
                                                <button @click="$store.memoriaDescriptiva.removeImage('demandaPrimariaImage')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                                            </div>
                                        </template>
                                        <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100" x-show="!$store.memoriaDescriptiva.previews.demandaPrimariaImage">
                                            <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span class="text-xs text-gray-500">Subir imagen</span>
                                            <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('demandaPrimariaImage', $event)" class="hidden">
                                        </label>
                                    </div>
                                    <p class="text-xs text-gray-400 text-center mt-1">Cuadro 2: Demanda de Primaria</p>
                                </div>
                            </div>
                        </div>
                    </div>

           
<div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            1.2. DATOS DEL PROYECTO
        </h3>
    </div>
    <div class="p-4">
        
        
        <div class="mb-4">
            <label class="text-xs font-semibold text-gray-500 block mb-1">Nombre del Proyecto</label>
            <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.nombre" rows="3" class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"></textarea>
        </div>

        
        <div class="mb-4">
            <label class="text-xs font-semibold text-gray-500 block mb-1">Nombre de la UEI</label>
            <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.uei" class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500">
        </div>

        
        <div class="mb-4">
            <label class="text-xs font-semibold text-gray-500 block mb-1">Ubicación Política</label>
            <div class="space-y-1 pl-4">
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Localidad:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.localidad" class="flex-1 border rounded p-1 text-sm"></div>
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Distrito:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.distrito" class="flex-1 border rounded p-1 text-sm"></div>
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Provincia:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.provincia" class="flex-1 border rounded p-1 text-sm"></div>
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Región:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.region" class="flex-1 border rounded p-1 text-sm"></div>
            </div>
        </div>

        
        <div class="mb-4">
            <label class="text-xs font-semibold text-gray-500 block mb-1">Ubicación Geográfica coordenadas UTM</label>
            <div class="space-y-1 pl-4">
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Este :</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.este" class="flex-1 border rounded p-1 text-sm"></div>
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Norte :</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.norte" class="flex-1 border rounded p-1 text-sm"></div>
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Altitud :</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.altitud" class="flex-1 border rounded p-1 text-sm"></div>
            </div>
        </div>

        
        <div class="mb-4">
            <label class="text-xs font-semibold text-gray-500 block mb-1">Ubicación contextual</label>
            <div class="text-sm text-gray-600 mb-2">Actualmente el colegio tiene las siguientes colindantes</div>
            <div class="space-y-1 pl-4">
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Norte:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.colindanciaNorte" class="flex-1 border rounded p-1 text-sm"></div>
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Sur:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.colindanciaSur" class="flex-1 border rounded p-1 text-sm"></div>
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Este:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.colindanciaEste" class="flex-1 border rounded p-1 text-sm"></div>
                <div class="flex items-center gap-2"><span class="text-green-600">•</span> <span class="text-sm font-medium">Oeste:</span> <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.datosProyecto.colindanciaOeste" class="flex-1 border rounded p-1 text-sm"></div>
            </div>
        </div>

        
        <div class="mt-4">
            <label class="text-xs font-semibold text-gray-500 block mb-2">Figura: Ubicación del área (ocupa toda una página)</label>
            <div class="relative">
                <template x-if="$store.memoriaDescriptiva.previews.ubicacionImage1">
                    <div class="relative inline-block">
                        <img :src="$store.memoriaDescriptiva.previews.ubicacionImage1" class="max-h-48 object-contain border rounded-lg">
                        <button @click="$store.memoriaDescriptiva.removeImage('ubicacionImage1')" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                    </div>
                </template>
                <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100" x-show="!$store.memoriaDescriptiva.previews.ubicacionImage1">
                    <span class="text-xs text-gray-500">Subir imagen (Figura 1)</span>
                    <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('ubicacionImage1', $event)" class="hidden">
                </label>
            </div>
            <p class="text-xs text-gray-400 mt-1">⚠️ Esta imagen aparecerá en el Word ocupando una página completa</p>
        </div>

        <div class="mt-4">
            <label class="text-xs font-semibold text-gray-500 block mb-2">Figura: Plano de Ubicación</label>
            <div class="relative">
                <template x-if="$store.memoriaDescriptiva.previews.ubicacionImage2">
                    <div class="relative inline-block">
                        <img :src="$store.memoriaDescriptiva.previews.ubicacionImage2" class="max-h-48 object-contain border rounded-lg">
                        <button @click="$store.memoriaDescriptiva.removeImage('ubicacionImage2')" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                    </div>
                </template>
                <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100" x-show="!$store.memoriaDescriptiva.previews.ubicacionImage2">
                    <span class="text-xs text-gray-500">Subir imagen (Figura 2)</span>
                    <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('ubicacionImage2', $event)" class="hidden">
                </label>
            </div>
        </div>

    </div>
</div>
                   
<div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            1.3. RELACIÓN DE DOCUMENTOS Y PLANOS
        </h3>
    </div>
    <div class="p-4">
        
      
<div class="mb-6">
    <h4 class="text-md font-bold mb-3 text-gray-700">1.3.1 DOCUMENTOS DEL PROYECTO</h4>
    <div x-data="{ 
        items: $store.memoriaDescriptiva.sections.documentosPlanos.documentos,
        textoCompleto: $store.memoriaDescriptiva.sections.documentosPlanos.documentos.join('\n'),
        actualizar() {
            this.items = this.textoCompleto.split('\n').filter(l => l.trim());
            $store.memoriaDescriptiva.sections.documentosPlanos.documentos = this.items;
        }
    }">
        <textarea x-model="textoCompleto" @blur="actualizar()" rows="8" 
            class="w-full border rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-green-500"
            placeholder="Escriba cada documento en una línea nueva:&#10;- Memoria descriptiva general&#10;- Especificaciones Técnicas Estructuras&#10;- Especificaciones Técnicas Obras Provisionales&#10;..."></textarea>
        <p class="text-xs text-gray-400 mt-2">💡 Cada línea se convertirá en una viñeta en el Word</p>
    </div>
</div>

        
        <div class="mb-6">
            <h4 class="text-md font-bold mb-3 text-gray-700">1.3.2 PLANOS DEL PROYECTO</h4>
            <div x-data="{ planos: $store.memoriaDescriptiva.sections.documentosPlanos.planos }">
                <table class="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr class="bg-gray-100 dark:bg-gray-700">
                            <th class="border p-2">N°</th>
                            <th class="border p-2">DESCRIPCIÓN</th>
                            <th class="border p-2">LÁMINA</th>
                            <th class="border p-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="(plano, idx) in planos" :key="idx">
                            <tr>
                                <td class="border p-2 text-center" x-text="idx + 1"></td>
                                <td class="border p-2"><input type="text" x-model="plano.descripcion" class="w-full border rounded p-1 text-sm"></td>
                                <td class="border p-2"><input type="text" x-model="plano.lamina" class="w-24 border rounded p-1 text-sm"></td>
                                <td class="border p-2 text-center"><button @click="planos.splice(idx,1)" class="text-red-500">✕</button></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <button @click="planos.push({ descripcion: '', lamina: '' })" class="text-green-600 text-sm mt-3 hover:underline flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    Agregar plano
                </button>
                <p class="text-xs text-gray-400 mt-2">💡 Los planos aparecerán en una tabla en el Word</p>
            </div>
        </div>

    </div>
</div>

                    
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">🎯 1.4. OBJETIVOS</h3>
                        </div>
                        <div class="p-4">
                            <div class="mb-4">
                                <label class="text-xs font-semibold text-gray-500 block mb-1">Objetivo General</label>
                                <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.objetivos.general" rows="3" class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"></textarea>
                            </div>
                            <div>
                                <label class="text-xs font-semibold text-gray-500 block mb-1">Objetivos Específicos</label>
                                <div x-data="{ items: $store.memoriaDescriptiva.sections.generalidades.objetivos.especificos }">
                                    <template x-for="(item, idx) in items" :key="idx">
                                        <div class="flex gap-2 mt-2"><input type="text" x-model="items[idx]" class="flex-1 border rounded-lg p-2 text-sm"><button @click="items.splice(idx,1)" class="text-red-500">✕</button></div>
                                    </template>
                                    <button @click="items.push('')" class="text-green-600 text-sm mt-2">+ Agregar objetivo</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">📜 1.5. MARCO NORMATIVO</h3>
                        </div>
                        <div class="p-4">
                            <div x-data="{ items: $store.memoriaDescriptiva.sections.generalidades.marcoNormativo }">
                                <template x-for="(item, idx) in items" :key="idx">
                                    <div class="flex gap-2 mt-2"><input type="text" x-model="items[idx]" class="flex-1 border rounded-lg p-2 text-sm"><button @click="items.splice(idx,1)" class="text-red-500">✕</button></div>
                                </template>
                                <button @click="items.push('')" class="text-green-600 text-sm mt-2">+ Agregar norma</button>
                            </div>
                        </div>
                    </div>


                                        
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div class="flex justify-between items-center">
                                <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    1.6. DESCRIPCIÓN DE BLOQUES O EDIFICACIONES
                                </h3>
                                <button type="button" @click="$store.memoriaDescriptiva.addModulo()" 
                                        class="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                    Agregar Módulo
                                </button>
                            </div>
                        </div>
                        <div class="p-4">
                            
                            
                            <p class="text-xs text-gray-400 mb-4">💡 Complete los datos estructurales de cada módulo del proyecto</p>

                            
                            <template x-for="(modulo, idx) in $store.memoriaDescriptiva.sections.descripcionModulos.modulos" :key="modulo.id">
                                <div class="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    
                                    
                                    <div class="bg-gradient-to-r from-green-50 to-gray-50 dark:from-green-900/20 dark:to-gray-800/50 px-4 py-2 flex justify-between items-center">
                                        <div class="flex items-center gap-3">
                                            <span class="text-green-600 font-bold text-sm" x-text="modulo.nombre || `MÓDULO ${String(idx + 1).padStart(2, '0')}`"></span>
                                            <span class="text-xs text-gray-400" x-text="modulo.uso ? modulo.uso.substring(0, 50) + '...' : 'Sin uso asignado'"></span>
                                        </div>
                                        <button @click="$store.memoriaDescriptiva.removeModulo(idx)" class="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Eliminar
                                        </button>
                                    </div>
                                    
                                    
                                    <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Nombre del Módulo</label>
                                            <input type="text" x-model="modulo.nombre" class="w-full border rounded-lg p-2 text-sm" placeholder="Ej: MÓDULO 01">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Número de Pisos</label>
                                            <input type="number" x-model="modulo.pisos" class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Uso / Descripción</label>
                                            <input type="text" x-model="modulo.uso" class="w-full border rounded-lg p-2 text-sm" placeholder="Ej: Grupo electrógeno, cuarto de tablero, maestranza, etc.">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Sistema Estructural en X</label>
                                            <input type="text" x-model="modulo.sistemaX" class="w-full border rounded-lg p-2 text-sm" placeholder="Ej: Sistema Dual">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Sistema Estructural en Y</label>
                                            <input type="text" x-model="modulo.sistemaY" class="w-full border rounded-lg p-2 text-sm" placeholder="Ej: Sistema de Albañilería confinada">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Elementos Verticales</label>
                                            <textarea x-model="modulo.elementosVerticales" rows="2" class="w-full border rounded-lg p-2 text-sm" placeholder="Ej: Placas, Columnas, Muros de albañilería"></textarea>
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Elementos Horizontales</label>
                                            <textarea x-model="modulo.elementosHorizontales" rows="2" class="w-full border rounded-lg p-2 text-sm" placeholder="Ej: Vigas en X de V30x50 cm, Vigas en Y de V30x60cm"></textarea>
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Tipo de Techo</label>
                                            <textarea x-model="modulo.techo" rows="2" class="w-full border rounded-lg p-2 text-sm" placeholder="Ej: Losa aligerada e=20cm, Cobertura metálica"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            
                            
                            <div x-show="!$store.memoriaDescriptiva.sections.descripcionModulos.modulos.length" class="text-center py-12 text-gray-400">
                                <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                <p class="text-sm">No hay módulos registrados</p>
                                <p class="text-xs mt-1">Haga clic en "Agregar Módulo" para comenzar a describir los módulos del proyecto</p>
                            </div>
                            
                        </div>
                    </div>

                    
                    <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.portada')); ?>" class="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                            Anterior
                        </a>
                        <div class="flex gap-3">
                            <button @click="exportWord()" :disabled="isExporting" 
                                class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 shadow-md">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
                            </button>
                        </div>
                        <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.consideraciones')); ?>" class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                            Siguiente
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <?php if (! $__env->hasRenderedOnce('a36ba91e-0bac-4a1e-ad92-8f9055eca977')): $__env->markAsRenderedOnce('a36ba91e-0bac-4a1e-ad92-8f9055eca977');
$__env->startPush('initscripts'); ?>
        <script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        <?php echo app('Illuminate\Foundation\Vite')('resources/js/documentos/memoria_descriptiva/index-refactored-md.js'); ?>
    <?php $__env->stopPush(); endif; ?>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald56ab98830c2b53982542500711782ee)): ?>
<?php $attributes = $__attributesOriginald56ab98830c2b53982542500711782ee; ?>
<?php unset($__attributesOriginald56ab98830c2b53982542500711782ee); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald56ab98830c2b53982542500711782ee)): ?>
<?php $component = $__componentOriginald56ab98830c2b53982542500711782ee; ?>
<?php unset($__componentOriginald56ab98830c2b53982542500711782ee); ?>
<?php endif; ?><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/hcalculo/memoria_descriptiva/sections/generalidades-md.blade.php ENDPATH**/ ?>
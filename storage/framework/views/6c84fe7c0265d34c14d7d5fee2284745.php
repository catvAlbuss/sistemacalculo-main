
<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => 'Memoria Descriptiva - Consideraciones de Diseño']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Memoria Descriptiva - Consideraciones de Diseño']); ?>
    <div class="py-4" x-data="memoriaDescriptiva" x-init="init(); moduloActual = 1">
        <div class="container mx-auto px-4 max-w-7xl">

            
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.portada')); ?>" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📄 Portada</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.generalidades')); ?>" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📋 1. GENERALIDADES</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.consideraciones')); ?>" class="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md">⚙️ 2. CONSIDERACIONES</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.predimensionamiento')); ?>" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📐 3. PREDIMENSIONAMIENTO</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.demolicion')); ?>" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">💥 4. DEMOLICIÓN</a>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                
                
                <div class="bg-gradient-to-r from-amber-600 to-amber-800 px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-white">2. CONSIDERACIONES GENERALES DE DISEÑO</h2>
                            <p class="text-amber-100 text-sm">Condiciones geotécnicas, parámetros sísmicos y método de diseño por módulo</p>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    
                    
                    <div class="mb-8">
                        <div class="flex items-center justify-between mb-3">
                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                SELECCIONAR MÓDULO
                            </label>
                            <span class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">16 módulos</span>
                        </div>
                        <div class="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
                            <template x-for="i in 16" :key="i">
                                <button @click="moduloActual = i" 
                                    :class="moduloActual === i ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                                    class="px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200">
                                    <span class="block text-center">M-<span x-text="String(i).padStart(2, '0')"></span></span>
                                </button>
                            </template>
                        </div>
                    </div>

                    
                    <template x-if="moduloActual">
                        <div>
                            
                            <div class="mb-6 flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <div class="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                                        <span class="text-green-600 font-bold text-sm" x-text="'M' + String(moduloActual).padStart(2, '0')"></span>
                                    </div>
                                    <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">MÓDULO <span x-text="String(moduloActual).padStart(2, '0')"></span></h3>
                                </div>
                                <div class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Editando...</div>
                            </div>
                            
                            
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                        CONDICIONES GEOTÉCNICAS
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Perfil del suelo</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.perfilSuelo" 
                                                   class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Capacidad Portante (kg/cm²)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.capacidadPortante" 
                                                   class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Profundidad de cimentación (m)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.profundidad" 
                                                   class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Agresividad de sulfatos</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.agresividadSulfatos" 
                                                   class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Profundidad del N.F.</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.profNF" 
                                                   class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        PARÁMETROS SÍSMICOS (Norma E.030)
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Zona sísmica</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.zona" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Factor Z</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorZ" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Perfil de suelo</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.perfilSuelo" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Factor S</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorS" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Tp (s)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.tp" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Tl (s)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.tl" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Categoría</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.categoria" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Factor U</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorU" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Coeficiente R₀</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.coeficienteR" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7h-4.18A3 3 0 0016 5.18V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v1.18A3 3 0 008.18 7H4a2 2 0 00-2 2v2a2 2 0 002 2h1v6a2 2 0 002 2h10a2 2 0 002-2v-6h1a2 2 0 002-2V9a2 2 0 00-2-2z" /></svg>
                                        SOBRECARGAS EMPLEADAS
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sobrecargas" 
                                              rows="5" class="w-full border rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-amber-500"
                                              placeholder="- Sobrecarga en Aulas: 250 kg/m2&#10;- Sobrecarga en corredores: 400 kg/m2&#10;- Sobrecarga en techos: 50 kg/m2"></textarea>
                                    <p class="text-xs text-gray-400 mt-2">💡 Cada línea representa una sobrecarga diferente</p>
                                </div>
                            </div>

                            
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        MÉTODO DE DISEÑO - CONCRETO ARMADO
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Recubrimientos</label>
                                            <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].recubrimientos" 
                                                      rows="4" class="w-full border rounded-lg p-3 text-sm font-mono"></textarea>
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Materiales</label>
                                            <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].materiales" 
                                                      rows="4" class="w-full border rounded-lg p-3 text-sm font-mono"></textarea>
                                        </div>
                                    </div>

                                    <div class="mt-4">
                                        <label class="text-xs font-semibold text-gray-500 block mb-2">Combinaciones de Carga</label>
                                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                            <label class="flex items-center gap-2 text-sm"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb1"> 1.4D + 1.7L</label>
                                            <label class="flex items-center gap-2 text-sm"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb2"> 1.25(D+L)+SX</label>
                                            <label class="flex items-center gap-2 text-sm"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb3"> 1.25(D+L)-SX</label>
                                            <label class="flex items-center gap-2 text-sm"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb4"> 1.25(D+L)+SY</label>
                                            <label class="flex items-center gap-2 text-sm"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb5"> 1.25(D+L)-SY</label>
                                            <label class="flex items-center gap-2 text-sm"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb6"> 0.9D+SX</label>
                                            <label class="flex items-center gap-2 text-sm"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb7"> 0.9D-SX</label>
                                            <label class="flex items-center gap-2 text-sm"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb8"> 0.9D+SY</label>
                                            <label class="flex items-center gap-2 text-sm"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb9"> 0.9D-SY</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <div x-show="!moduloActual" class="text-center py-16 text-gray-400">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <p>Seleccione un módulo para ver y editar sus consideraciones de diseño</p>
                    </div>

                    
                    <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.generalidades')); ?>" class="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                            Anterior
                        </a>
                        <div class="flex gap-3">
                            <button @click="moduloActual = moduloActual > 1 ? moduloActual - 1 : 16" class="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition">◀ Módulo anterior</button>
                            <button @click="moduloActual = moduloActual < 16 ? moduloActual + 1 : 1" class="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition">Módulo siguiente ▶</button>
                            <button @click="exportWord()" :disabled="isExporting" 
                                class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 shadow-md">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
                            </button>
                        </div>
                        <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.predimensionamiento')); ?>" class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                            Siguiente
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <?php if (! $__env->hasRenderedOnce('1bf252ab-06bc-4ae2-ad55-cc587e9ac515')): $__env->markAsRenderedOnce('1bf252ab-06bc-4ae2-ad55-cc587e9ac515');
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
<?php endif; ?><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/hcalculo/memoria_descriptiva/sections/consideraciones.blade.php ENDPATH**/ ?>
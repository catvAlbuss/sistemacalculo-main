
<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => 'Memoria Descriptiva - Predimensionamiento']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Memoria Descriptiva - Predimensionamiento']); ?>
    <div class="py-4" x-data="{
        moduloActual: 1,
        isExporting: false,
        
        // Inicializar datos de predimensionamiento para todos los módulos
        initPredimensionamiento() {
            const store = $store.memoriaDescriptiva;
            if (!store.sections.predimensionamiento) {
                store.sections.predimensionamiento = {};
            }
            
            // Datos por defecto para cada módulo (1-16)
            const defaultTechos = {
                tipo: 'Losa aligerada e=20cm',
                luz: '5.00',
                espesor: '0.20'
            };
            
            const defaultVigas = {
                principal: {
                    ejeA: { b: '25', h: '45', luz: '5.00' },
                    ejeB: { b: '25', h: '45', luz: '5.00' },
                    ejeC: { b: '25', h: '45', luz: '5.00' }
                }
            };
            
            const defaultColumnas = {
                c1: { b: '25', h: '25', obs: 'ok' },
                c2: { b: '25', h: '45', obs: 'ok' },
                c3: { b: '30', h: '50', obs: 'ok' }
            };
            
            // Valores específicos por módulo (según tu archivo original)
            const techosPorModulo = {
                1: { tipo: 'Losa aligerada e=20cm', luz: '5.20', espesor: '0.20' },
                2: { tipo: 'Losa aligerada e=20cm (1° Nivel) / Losa aligerada a dos aguas e=20cm (Techo)', luz: '6.00', espesor: '0.20' },
                3: { tipo: 'Losa aligerada e=20cm (1° Nivel) / Losa aligerada a dos aguas e=20cm (Techo)', luz: '6.00', espesor: '0.20' },
                4: { tipo: 'Losa aligerada e=20cm', luz: '4.50', espesor: '0.20' },
                5: { tipo: 'Losa aligerada e=20cm', luz: '5.50', espesor: '0.20' },
                6: { tipo: 'Losa aligerada e=20cm', luz: '5.50', espesor: '0.20' },
                7: { tipo: 'Losa aligerada a una sola agua e=20cm', luz: '4.00', espesor: '0.20' },
                8: { tipo: 'Losa aligerada e=20cm (1° Nivel) / Losa aligerada a dos aguas e=20cm (Techo)', luz: '5.50', espesor: '0.20' },
                9: { tipo: 'Losa aligerada a dos aguas e=20cm', luz: '5.00', espesor: '0.20' },
                10: { tipo: 'Losa aligerada a dos aguas e=20cm', luz: '5.00', espesor: '0.20' },
                11: { tipo: 'Cobertura parabólica de Aluzinc tipo TR4', luz: '8.00', espesor: '0.00' },
                12: { tipo: 'Losa maciza e=20cm', luz: '4.00', espesor: '0.20' },
                13: { tipo: 'Losa en rampa de 15cm / Losa aligerada e=20cm (Techo)', luz: '6.00', espesor: '0.15' },
                14: { tipo: 'Losa aligerada a un agua e=20cm', luz: '3.50', espesor: '0.20' },
                15: { tipo: 'Losa maciza e=20cm (1° y 2° Nivel) / Losa aligerada dos aguas e=20cm (Techo)', luz: '5.00', espesor: '0.20' },
                16: { tipo: 'Cobertura parabólica de Aluzinc tipo TR4', luz: '8.00', espesor: '0.00' }
            };
            
            const vigasPorModulo = {
                1: { ejeA: { b: '25', h: '45', luz: '5.00' }, ejeB: { b: '25', h: '45', luz: '5.00' }, ejeC: { b: '25', h: '45', luz: '5.00' } },
                2: { ejeA: { b: '30', h: '50', luz: '6.00' }, ejeB: { b: '30', h: '50', luz: '6.00' }, ejeC: { b: '30', h: '50', luz: '6.00' } },
                3: { ejeA: { b: '30', h: '50', luz: '6.00' }, ejeB: { b: '30', h: '50', luz: '6.00' }, ejeC: { b: '30', h: '50', luz: '6.00' } },
                4: { ejeA: { b: '25', h: '40', luz: '4.50' }, ejeB: { b: '25', h: '40', luz: '4.50' }, ejeC: { b: '25', h: '40', luz: '4.50' } },
                5: { ejeA: { b: '25', h: '50', luz: '5.50' }, ejeB: { b: '25', h: '50', luz: '5.50' }, ejeC: { b: '25', h: '50', luz: '5.50' } },
                6: { ejeA: { b: '25', h: '50', luz: '5.50' }, ejeB: { b: '25', h: '50', luz: '5.50' }, ejeC: { b: '25', h: '50', luz: '5.50' } },
                7: { ejeA: { b: '25', h: '35', luz: '4.00' }, ejeB: { b: '25', h: '35', luz: '4.00' }, ejeC: { b: '25', h: '35', luz: '4.00' } },
                8: { ejeA: { b: '30', h: '50', luz: '5.50' }, ejeB: { b: '30', h: '50', luz: '5.50' }, ejeC: { b: '30', h: '50', luz: '5.50' } },
                9: { ejeA: { b: '25', h: '45', luz: '5.00' }, ejeB: { b: '25', h: '45', luz: '5.00' }, ejeC: { b: '25', h: '45', luz: '5.00' } },
                10: { ejeA: { b: '25', h: '45', luz: '5.00' }, ejeB: { b: '25', h: '45', luz: '5.00' }, ejeC: { b: '25', h: '45', luz: '5.00' } },
                11: { ejeA: { b: 'W10x45', h: '25.4', luz: '8.00' }, ejeB: { b: 'W10x45', h: '25.4', luz: '8.00' }, ejeC: { b: 'W10x45', h: '25.4', luz: '8.00' } },
                12: { ejeA: { b: '25', h: '60', luz: '4.00' }, ejeB: { b: '25', h: '60', luz: '4.00' }, ejeC: { b: '25', h: '60', luz: '4.00' } },
                13: { ejeA: { b: '30', h: '60', luz: '6.00' }, ejeB: { b: '30', h: '60', luz: '6.00' }, ejeC: { b: '30', h: '60', luz: '6.00' } },
                14: { ejeA: { b: '25', h: '35', luz: '3.50' }, ejeB: { b: '25', h: '35', luz: '3.50' }, ejeC: { b: '25', h: '35', luz: '3.50' } },
                15: { ejeA: { b: '30', h: '50', luz: '5.00' }, ejeB: { b: '30', h: '50', luz: '5.00' }, ejeC: { b: '30', h: '50', luz: '5.00' } },
                16: { ejeA: { b: 'W10x45', h: '25.4', luz: '8.00' }, ejeB: { b: 'W10x45', h: '25.4', luz: '8.00' }, ejeC: { b: 'W10x45', h: '25.4', luz: '8.00' } }
            };
            
            const columnasPorModulo = {
                1: { c1: { b: '25', h: '25', obs: 'ok' }, c2: { b: '25', h: '45', obs: 'ok' }, c3: { b: '30', h: '50', obs: 'ok' } },
                2: { c1: { b: '30', h: '30', obs: 'ok' }, c2: { b: '30', h: '50', obs: 'ok' }, c3: { b: '35', h: '55', obs: 'ok' } },
                3: { c1: { b: '30', h: '30', obs: 'ok' }, c2: { b: '30', h: '50', obs: 'ok' }, c3: { b: '35', h: '55', obs: 'ok' } },
                4: { c1: { b: '25', h: '25', obs: 'ok' }, c2: { b: '25', h: '40', obs: 'ok' }, c3: { b: '30', h: '45', obs: 'ok' } },
                5: { c1: { b: '25', h: '25', obs: 'ok' }, c2: { b: '25', h: '50', obs: 'ok' }, c3: { b: '30', h: '55', obs: 'ok' } },
                6: { c1: { b: '25', h: '25', obs: 'ok' }, c2: { b: '25', h: '50', obs: 'ok' }, c3: { b: '30', h: '55', obs: 'ok' } },
                7: { c1: { b: '25', h: '25', obs: 'ok' }, c2: { b: '25', h: '35', obs: 'ok' }, c3: { b: '25', h: '40', obs: 'ok' } },
                8: { c1: { b: '30', h: '30', obs: 'ok' }, c2: { b: '30', h: '50', obs: 'ok' }, c3: { b: '35', h: '55', obs: 'ok' } },
                9: { c1: { b: '25', h: '25', obs: 'ok' }, c2: { b: '25', h: '45', obs: 'ok' }, c3: { b: '30', h: '50', obs: 'ok' } },
                10: { c1: { b: '25', h: '25', obs: 'ok' }, c2: { b: '25', h: '45', obs: 'ok' }, c3: { b: '30', h: '50', obs: 'ok' } },
                11: { c1: { b: '30', h: '30', obs: 'metálica' }, c2: { b: '30', h: '30', obs: 'metálica' }, c3: { b: '30', h: '30', obs: 'metálica' } },
                12: { c1: { b: '25', h: '25', obs: 'ok' }, c2: { b: '60', h: '60', obs: 'para tanque' }, c3: { b: '60', h: '60', obs: 'para tanque' } },
                13: { c1: { b: '30', h: '40', obs: 'ok' }, c2: { b: '30', h: '40', obs: 'ok' }, c3: { b: '30', h: '40', obs: 'ok' } },
                14: { c1: { b: '25', h: '25', obs: 'ok' }, c2: { b: '25', h: '35', obs: 'ok' }, c3: { b: '25', h: '35', obs: 'ok' } },
                15: { c1: { b: '30', h: '30', obs: 'ok' }, c2: { b: '30', h: '50', obs: 'ok' }, c3: { b: '35', h: '55', obs: 'ok' } },
                16: { c1: { b: '30', h: '30', obs: 'metálica' }, c2: { b: '30', h: '30', obs: 'metálica' }, c3: { b: '30', h: '30', obs: 'metálica' } }
            };
            
            const observacionesPorModulo = {
                1: 'El espesor de losa aligerada no debe permitir deflexiones fuera de los límites establecidos. La relación b/h debe estar entre 0.4 y 0.6 para vigas principales.',
                2: 'Para luces de 6m, se recomienda vigas de 30x50cm. Columnas centrales de 35x55cm para cumplir con requisitos de rigidez.',
                3: 'Similar al Módulo II, con luces de 6m.',
                4: 'Módulo de escaleras, luces más pequeñas. Vigas de 25x40cm suficientes.',
                5: 'Módulo de aulas de 3 pisos. Vigas de 25x50cm.',
                6: 'Módulo de aulas con escalera integrada.',
                7: 'Módulo de cocina y almacenes. Luces pequeñas, vigas de 25x35cm.',
                8: 'Módulo administrativo de 2 pisos.',
                9: 'Módulo de aulas de 1 piso.',
                10: 'Módulo de cocina y comedor de 1 piso.',
                11: 'Estructura metálica para área de juegos. Columnas tubulares C30x30x8mm.',
                12: 'Módulo de cisterna y tanque elevado de 4 niveles. Vigas de 25x60cm reforzadas.',
                13: 'Módulo de rampa vehicular/peatonal. Vigas de 30x60cm para soportar cargas dinámicas.',
                14: 'Módulo de guardianía, luces pequeñas. Vigas de 25x35cm.',
                15: 'Módulo de SS.HH. de 3 pisos. Vigas de 30x50cm.',
                16: 'Estructura metálica para SUM exterior. Vigas de concreto 30x40cm y tijerales metálicos.'
            };
            
            // Crear módulos faltantes (1-16)
            for (let i = 1; i <= 16; i++) {
                if (!store.sections.predimensionamiento[i]) {
                    store.sections.predimensionamiento[i] = {
                        techos: techosPorModulo[i] || defaultTechos,
                        vigas: { principal: vigasPorModulo[i] || defaultVigas.principal },
                        columnas: columnasPorModulo[i] || defaultColumnas,
                        observaciones: observacionesPorModulo[i] || ''
                    };
                }
            }
            
            // Inicializar previews de imágenes si no existen
            if (!store.previews.predimLosaImage) store.previews.predimLosaImage = {};
            if (!store.previews.predimVigaImage) store.previews.predimVigaImage = {};
            if (!store.previews.predimColumnaImage) store.previews.predimColumnaImage = {};
            
            store.save();
        },
        
        async exportWord() {
            this.isExporting = true;
            try {
                if ($store.memoriaDescriptiva?.exportToWord) {
                    await $store.memoriaDescriptiva.exportToWord();
                } else {
                    console.warn('Función exportToWord no disponible en el store');
                    alert('La función de exportación aún no está disponible');
                }
            } catch (error) {
                console.error('Error al exportar:', error);
                alert('Error al exportar el documento');
            } finally {
                this.isExporting = false;
            }
        }
    }" x-init="initPredimensionamiento()">
        <div class="container mx-auto px-4 max-w-7xl">

            
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.portada')); ?>" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📄 Portada</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.generalidades')); ?>" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📋 1. GENERALIDADES</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.consideraciones')); ?>" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">⚙️ 2. CONSIDERACIONES</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.predimensionamiento')); ?>" class="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md">📐 3. PREDIMENSIONAMIENTO</a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.demolicion')); ?>" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">💥 4. DEMOLICIÓN</a>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                
                
                <div class="bg-gradient-to-r from-cyan-600 to-cyan-800 px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-white">3. PREDIMENSIONAMIENTO DE ELEMENTOS ESTRUCTURALES</h2>
                            <p class="text-cyan-100 text-sm">Dimensiones preliminares de los elementos estructurales por módulo</p>
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
                                    :class="moduloActual === i ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                                    class="px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200">
                                    <span class="block text-center">M-<span x-text="String(i).padStart(2, '0')"></span></span>
                                </button>
                            </template>
                        </div>
                    </div>

                    
                    <div class="text-center mb-6">
                        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Módulo actual: <strong x-text="'M-' + String(moduloActual).padStart(2, '0')"></strong>
                        </span>
                    </div>

                    
                    <template x-if="$store.memoriaDescriptiva?.sections?.predimensionamiento?.[moduloActual]">
                        <div>
                            
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                        PREDIMENSIONAMIENTO DE TECHOS
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Tipo de techo</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].techos.tipo" 
                                                   class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-cyan-500">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Luz mayor (m)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].techos.luz" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 block mb-1">Espesor propuesto (m)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].techos.espesor" 
                                                   class="w-full border rounded-lg p-2 text-sm">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                        PREDIMENSIONAMIENTO DE VIGAS
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <div class="overflow-x-auto">
                                        <table class="w-full border-collapse border border-gray-300 text-sm">
                                            <thead>
                                                <tr class="bg-gray-100 dark:bg-gray-700">
                                                    <th class="border p-2">Eje</th>
                                                    <th class="border p-2">b (cm)</th>
                                                    <th class="border p-2">h (cm)</th>
                                                    <th class="border p-2">Luz (m)</th>
                                                    <th class="border p-2">b/h</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td class="border p-2 font-semibold text-center">A</td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.b" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.h" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.luz" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2 text-center" x-text="($store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.b / $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.h).toFixed(2)"></td>
                                                </tr>
                                                <tr>
                                                    <td class="border p-2 font-semibold text-center">B</td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.b" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.h" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.luz" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2 text-center" x-text="($store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.b / $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.h).toFixed(2)"></td>
                                                </tr>
                                                <tr>
                                                    <td class="border p-2 font-semibold text-center">C</td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.b" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.h" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.luz" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2 text-center" x-text="($store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.b / $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.h).toFixed(2)"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        PREDIMENSIONAMIENTO DE COLUMNAS
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <div class="overflow-x-auto">
                                        <table class="w-full border-collapse border border-gray-300 text-sm">
                                            <thead>
                                                <tr class="bg-gray-100 dark:bg-gray-700">
                                                    <th class="border p-2">Columna</th>
                                                    <th class="border p-2">b (cm)</th>
                                                    <th class="border p-2">h (cm)</th>
                                                    <th class="border p-2">Área (cm²)</th>
                                                    <th class="border p-2">Observación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td class="border p-2 font-semibold">C1 (esquina)</td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.b" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.h" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2 text-center" x-text="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.b * $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.h"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.obs" class="w-full border rounded p-1"></td>
                                                </tr>
                                                <tr>
                                                    <td class="border p-2 font-semibold">C2 (borde)</td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.b" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.h" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2 text-center" x-text="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.b * $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.h"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.obs" class="w-full border rounded p-1"></td>
                                                </tr>
                                                <tr>
                                                    <td class="border p-2 font-semibold">C3 (central)</td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.b" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.h" class="w-20 border rounded p-1 text-center"></td>
                                                    <td class="border p-2 text-center" x-text="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.b * $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.h"></td>
                                                    <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.obs" class="w-full border rounded p-1"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        OBSERVACIONES
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <textarea x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].observaciones" 
                                              rows="4" class="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500"></textarea>
                                </div>
                            </div>
                        </div>
                    </template>

                    
                    <div x-show="!$store.memoriaDescriptiva?.sections?.predimensionamiento?.[moduloActual]" class="text-center py-16 text-gray-400">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        <p>Cargando datos del módulo <span x-text="'M-' + String(moduloActual).padStart(2, '0')"></span>...</p>
                    </div>

                    
                    <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.consideraciones')); ?>" class="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                            Anterior
                        </a>
                        <div class="flex gap-3">
                            <button @click="moduloActual = moduloActual > 1 ? moduloActual - 1 : 16" class="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition">◀ Módulo anterior</button>
                            <button @click="moduloActual = moduloActual < 16 ? moduloActual + 1 : 1" class="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition">Módulo siguiente ▶</button>
                            <button @click="exportWord()" :disabled="isExporting" 
                                class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 shadow-md disabled:opacity-50">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
                            </button>
                        </div>
                        <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.demolicion')); ?>" class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                            Siguiente
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <?php if (! $__env->hasRenderedOnce('78e7cbfa-4b7f-4e8d-929a-383a6c6c07f6')): $__env->markAsRenderedOnce('78e7cbfa-4b7f-4e8d-929a-383a6c6c07f6');
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
<?php endif; ?><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\hcalculo\memoria_descriptiva\sections\predimensionamiento.blade.php ENDPATH**/ ?>
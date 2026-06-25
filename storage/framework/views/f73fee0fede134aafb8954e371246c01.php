
<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => 'Memoria Descriptiva - Portada']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Memoria Descriptiva - Portada']); ?>
    <div class="py-4" x-data="memoriaDescriptiva" x-init="init()">
        <div class="container mx-auto px-4 max-w-7xl">

            
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.portada')); ?>" 
                   class="px-4 py-2 rounded-lg bg-green-600 text-white">
                    📄 Portada
                </a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.generalidades')); ?>" 
                   class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                    📋 1. GENERALIDADES
                </a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.consideraciones')); ?>" 
                   class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                    ⚙️ 2. CONSIDERACIONES
                </a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.predimensionamiento')); ?>" 
                   class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                    📐 3. PREDIMENSIONAMIENTO
                </a>
                <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.demolicion')); ?>" 
                   class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                    💥 4. DEMOLICIÓN
                </a>
            </div>

            
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                
                <div class="flex items-center gap-3 mb-6">
                    <div class="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">Portada del Proyecto</h2>
                </div>

                
                <div class="mb-4">
                    <label class="text-xs font-semibold text-gray-500 block mb-1">Título</label>
                    <input type="text" x-model="$store.memoriaDescriptiva.cover.title" 
                           class="w-full border rounded-lg p-2 text-sm">
                </div>

                
                <div class="mb-4">
                    <label class="text-xs font-semibold text-gray-500 block mb-1">Subtítulo</label>
                    <input type="text" x-model="$store.memoriaDescriptiva.cover.subtitle" 
                           class="w-full border rounded-lg p-2 text-sm">
                </div>

                
                <div class="mb-4">
                    <label class="text-xs font-semibold text-gray-500 block mb-1">Nombre del Proyecto</label>
                    <textarea x-model="$store.memoriaDescriptiva.cover.project" rows="3" 
                              class="w-full border rounded-lg p-2 text-sm"></textarea>
                </div>

                
                <div class="mb-6">
                    <label class="text-sm font-semibold block mb-2">Imagen del Proyecto</label>
                    <div class="relative">
                        <template x-if="$store.memoriaDescriptiva.previews.coverImage">
                            <div class="relative inline-block">
                                <img :src="$store.memoriaDescriptiva.previews.coverImage" class="max-h-48 object-contain border rounded-lg">
                                <button @click="$store.memoriaDescriptiva.removeImage('coverImage')" 
                                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                            </div>
                        </template>
                        <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50" 
                               x-show="!$store.memoriaDescriptiva.previews.coverImage">
                            <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="text-xs text-gray-500">Click para subir imagen</span>
                            <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleImageChange('coverImage', $event)" class="hidden">
                        </label>
                    </div>
                </div>

                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                        <label class="text-xs font-semibold text-gray-500 block mb-1">UEI (Unidad Ejecutora)</label>
                        <input type="text" x-model="$store.memoriaDescriptiva.cover.uei" class="w-full border rounded-lg p-2 text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-500 block mb-1">Código Unificado</label>
                        <input type="text" x-model="$store.memoriaDescriptiva.cover.unifiedCode" class="w-full border rounded-lg p-2 text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-500 block mb-1">Nombre de la IE</label>
                        <input type="text" x-model="$store.memoriaDescriptiva.cover.ieName" class="w-full border rounded-lg p-2 text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-500 block mb-1">Código de Local</label>
                        <input type="text" x-model="$store.memoriaDescriptiva.cover.localCode" class="w-full border rounded-lg p-2 text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-500 block mb-1">Códigos Modulares</label>
                        <input type="text" x-model="$store.memoriaDescriptiva.cover.modularCodes" class="w-full border rounded-lg p-2 text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-500 block mb-1">Región</label>
                        <input type="text" x-model="$store.memoriaDescriptiva.cover.region" class="w-full border rounded-lg p-2 text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-500 block mb-1">Provincia</label>
                        <input type="text" x-model="$store.memoriaDescriptiva.cover.province" class="w-full border rounded-lg p-2 text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-500 block mb-1">Distrito</label>
                        <input type="text" x-model="$store.memoriaDescriptiva.cover.district" class="w-full border rounded-lg p-2 text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-500 block mb-1">Centro Poblado</label>
                        <input type="text" x-model="$store.memoriaDescriptiva.cover.centerTown" class="w-full border rounded-lg p-2 text-sm">
                    </div>
                </div>

                
                <div class="flex justify-between mt-6 pt-4 border-t">
                    <div></div>
                    <a href="<?php echo e(route('calculadora.asistente.memoria-descriptiva.generalidades')); ?>" 
                       class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Siguiente →
                    </a>
                    <button @click="exportWord()" :disabled="isExporting" 
                        class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto">
                        📄 Exportar a Word
                    </button>
                </div>

            </div>
        </div>
    </div>

    <?php if (! $__env->hasRenderedOnce('edaedc08-ac3d-42c5-bc20-0369ce78deb9')): $__env->markAsRenderedOnce('edaedc08-ac3d-42c5-bc20-0369ce78deb9');
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
<?php endif; ?><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/hcalculo/memoria_descriptiva/sections/portada.blade.php ENDPATH**/ ?>
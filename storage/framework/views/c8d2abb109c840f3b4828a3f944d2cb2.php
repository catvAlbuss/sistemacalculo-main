<div class="form-panel bg-white dark:bg-gray-800 shadow-lg text-gray-980 dark:text-gray-50 rounded-lg">
    <!-- Acordeón con Alpine.js -->
    <div x-data="{ activeAccordion: 'materiales' }">
        <!-- Sección Materiales -->
        <div class="accordion-section">
            <button @click="activeAccordion = activeAccordion === 'materiales' ? '' : 'materiales'"
                class="accordion-header">
                <span>MATERIALES</span>
                <svg class="accordion-icon" :class="{ 'rotate-180': activeAccordion === 'materiales' }">
                    <!-- Icono -->
                </svg>
            </button>
            <div x-show="activeAccordion === 'materiales'" x-collapse class="accordion-content">
                
                <h2 class="text-gray-950 dark:text-gray-50 font-bold text-sm py-1">Concreto</h2>
                <?php if (isset($component)) { $__componentOriginal351dd57715bcd28b042962d85ec77683 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal351dd57715bcd28b042962d85ec77683 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.inputmuros','data' => ['label' => 'gc','id' => 'gc','name' => 'gc','type' => 'text','value' => '2.4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inputmuros'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'gc','id' => 'gc','name' => 'gc','type' => 'text','value' => '2.4']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $attributes = $__attributesOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__attributesOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $component = $__componentOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__componentOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal351dd57715bcd28b042962d85ec77683 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal351dd57715bcd28b042962d85ec77683 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.inputmuros','data' => ['label' => 'Fy','id' => 'fy','name' => 'fy','type' => 'number','value' => '4200']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inputmuros'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Fy','id' => 'fy','name' => 'fy','type' => 'number','value' => '4200']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $attributes = $__attributesOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__attributesOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $component = $__componentOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__componentOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal351dd57715bcd28b042962d85ec77683 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal351dd57715bcd28b042962d85ec77683 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.inputmuros','data' => ['label' => 'f\'c','id' => 'fc','name' => 'fc','type' => 'number','value' => '210']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inputmuros'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'f\'c','id' => 'fc','name' => 'fc','type' => 'number','value' => '210']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $attributes = $__attributesOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__attributesOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $component = $__componentOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__componentOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>

                
                <h2 class="text-gray-950 dark:text-gray-50 font-bold text-sm py-1">Suelos</h2>
                <?php if (isset($component)) { $__componentOriginal351dd57715bcd28b042962d85ec77683 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal351dd57715bcd28b042962d85ec77683 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.inputmuros','data' => ['label' => 'SADM','id' => 'sadm','name' => 'sadm','type' => 'number','value' => '20']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inputmuros'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'SADM','id' => 'sadm','name' => 'sadm','type' => 'number','value' => '20']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $attributes = $__attributesOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__attributesOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $component = $__componentOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__componentOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal351dd57715bcd28b042962d85ec77683 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal351dd57715bcd28b042962d85ec77683 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.inputmuros','data' => ['label' => 'gs','id' => 'gs','name' => 'gs','type' => 'text','value' => '1.83']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inputmuros'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'gs','id' => 'gs','name' => 'gs','type' => 'text','value' => '1.83']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $attributes = $__attributesOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__attributesOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $component = $__componentOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__componentOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal351dd57715bcd28b042962d85ec77683 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal351dd57715bcd28b042962d85ec77683 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.inputmuros','data' => ['label' => 'Ø','id' => 'teta','name' => 'teta','type' => 'text','value' => '26.9']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inputmuros'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Ø','id' => 'teta','name' => 'teta','type' => 'text','value' => '26.9']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $attributes = $__attributesOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__attributesOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $component = $__componentOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__componentOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal351dd57715bcd28b042962d85ec77683 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal351dd57715bcd28b042962d85ec77683 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.inputmuros','data' => ['label' => 'z','id' => 'z','name' => 'z','type' => 'text','value' => '0.00']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inputmuros'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'z','id' => 'z','name' => 'z','type' => 'text','value' => '0.00']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $attributes = $__attributesOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__attributesOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $component = $__componentOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__componentOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal351dd57715bcd28b042962d85ec77683 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal351dd57715bcd28b042962d85ec77683 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.inputmuros','data' => ['label' => 'u','id' => 'u','name' => 'u','type' => 'text','value' => '0.51']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inputmuros'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'u','id' => 'u','name' => 'u','type' => 'text','value' => '0.51']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $attributes = $__attributesOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__attributesOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $component = $__componentOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__componentOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal351dd57715bcd28b042962d85ec77683 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal351dd57715bcd28b042962d85ec77683 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.inputmuros','data' => ['label' => '1.3sADM','id' => 'treesadm','name' => 'treesadm','type' => 'text','value' => '26']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inputmuros'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => '1.3sADM','id' => 'treesadm','name' => 'treesadm','type' => 'text','value' => '26']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $attributes = $__attributesOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__attributesOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal351dd57715bcd28b042962d85ec77683)): ?>
<?php $component = $__componentOriginal351dd57715bcd28b042962d85ec77683; ?>
<?php unset($__componentOriginal351dd57715bcd28b042962d85ec77683); ?>
<?php endif; ?>
            </div>
        </div>

        <!-- Más secciones del acordeón -->
    </div>

    <!-- Botones de Acción -->
    <div class="form-actions">
        <button @click="calculateAll()" :disabled="ui.loading" class="btn btn-primary">
            <span x-show="!ui.loading">Generar</span>
            <span x-show="ui.loading">Calculando...</span>
        </button>

        
    </div>
</div>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\muros-contencion\components\form-panel.blade.php ENDPATH**/ ?>
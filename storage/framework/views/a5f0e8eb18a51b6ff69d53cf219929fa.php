<?php

use App\Livewire\Actions\Logout;

?>

<?php if (! $__env->hasRenderedOnce('1ba46aa9-e126-4b7c-9cf2-741b111a85d5')): $__env->markAsRenderedOnce('1ba46aa9-e126-4b7c-9cf2-741b111a85d5');
$__env->startPush('initscripts'); ?>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/navigation.js'); ?>
<?php $__env->stopPush(); endif; ?>

<?php if (! $__env->hasRenderedOnce('1a16dee1-d4c4-43c9-9071-932527cf2c5d')): $__env->markAsRenderedOnce('1a16dee1-d4c4-43c9-9071-932527cf2c5d');
$__env->startPush('scripts'); ?>
    <script type="text/javascript" src="https://www.geogebra.org/apps/deployggb.js"></script>
<?php $__env->stopPush(); endif; ?>

<nav class="z-50 border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800" x-data="scientific_calculator_applet"
    x-init="initComponent($refs.calculator_dialog, $refs.applet_container)">
    <!-- Primary Navigation Menu -->
    <div class="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
            <div class="flex">
                <!-- Logo -->
                <div class="flex shrink-0 items-center">
                    <a href="<?php echo e(route('dashboard')); ?>" >
                        <?php if (isset($component)) { $__componentOriginal8892e718f3d0d7a916180885c6f012e7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8892e718f3d0d7a916180885c6f012e7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.application-logo','data' => ['class' => 'flex h-9 w-auto flex-row gap-2 fill-current text-gray-800 dark:text-gray-200']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('application-logo'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'flex h-9 w-auto flex-row gap-2 fill-current text-gray-800 dark:text-gray-200']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8892e718f3d0d7a916180885c6f012e7)): ?>
<?php $attributes = $__attributesOriginal8892e718f3d0d7a916180885c6f012e7; ?>
<?php unset($__attributesOriginal8892e718f3d0d7a916180885c6f012e7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8892e718f3d0d7a916180885c6f012e7)): ?>
<?php $component = $__componentOriginal8892e718f3d0d7a916180885c6f012e7; ?>
<?php unset($__componentOriginal8892e718f3d0d7a916180885c6f012e7); ?>
<?php endif; ?>
                    </a>
                </div>

                <!-- Navigation Links -->
                <div class="hidden space-x-2 sm:-my-px sm:ms-10 sm:flex">
                    <?php if (isset($component)) { $__componentOriginalc295f12dca9d42f28a259237a5724830 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc295f12dca9d42f28a259237a5724830 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.nav-link','data' => ['href' => route('dashboard'),'active' => request()->routeIs('dashboard')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('nav-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('dashboard')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('dashboard'))]); ?>
                        <?php echo e(__('Inicio')); ?>

                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc295f12dca9d42f28a259237a5724830)): ?>
<?php $attributes = $__attributesOriginalc295f12dca9d42f28a259237a5724830; ?>
<?php unset($__attributesOriginalc295f12dca9d42f28a259237a5724830); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc295f12dca9d42f28a259237a5724830)): ?>
<?php $component = $__componentOriginalc295f12dca9d42f28a259237a5724830; ?>
<?php unset($__componentOriginalc295f12dca9d42f28a259237a5724830); ?>
<?php endif; ?>
                </div>
                <?php
                    $user = auth()->user();
                    $memoryRoutes = [
                        'calculadora.asistente.memoria-calculo',
                        'calculadora.asistente.memoria-descriptiva*',
                    ];
                    $reviewerRoutes = [
                        'software.anclaje-v1',
                        'software.base-dinamica-v1',
                        'software.estribo-columna-placa-v1',
                        'software.estribo-placa-v1',
                        'software.predim-viga-v1',
                        'software.verificacion-viga-v1',
                        'calculadora.estudiante.cav2.hoja2',
                    ];
                    $designerRoutes = [
                        'software.suelos.*',
                        'software.aligerados-v1',
                        'software.aligerados-v2',
                        'software.cimentacion-v1',
                        'software.cimentacion-v2',
                        'software.analisis-estructural-de-armaduras',
                        'software.etabs2',
                        'software.predimv2',
                        'calculadora.estudiante.arco_techo',
                    ];
                    $isMemoryActive = request()->routeIs($memoryRoutes);
                    $isReviewerActive = request()->routeIs($reviewerRoutes);
                    $isDesignerActive = request()->routeIs($designerRoutes);
                    $isStudentActive = request()->routeIs('calculadora.estudiante.*')
                        && !request()->routeIs(['calculadora.estudiante.arco_techo', 'calculadora.estudiante.cav2.hoja2']);
                    $isAssistantActive = request()->routeIs('calculadora.asistente.*') && ! $isMemoryActive;
                    $canManagePlans = $user?->hasRole(['root', 'gerencia']) ?? false;
                ?>

                <!--[if BLOCK]><![endif]--><?php if($canManagePlans): ?>
                    <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                        <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Planes')).'','active' => request()->routeIs(['planUser.*', 'suscripciones.*'])]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Planes')).'','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs(['planUser.*', 'suscripciones.*']))]); ?>
                            <?php if (isset($component)) { $__componentOriginalc295f12dca9d42f28a259237a5724830 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc295f12dca9d42f28a259237a5724830 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.nav-link','data' => ['href' => route('planUser.index'),'active' => request()->routeIs('planUser.index')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('nav-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('planUser.index')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('planUser.index'))]); ?>
                                <?php echo e(__('Gestion de Usuario')); ?>

                             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc295f12dca9d42f28a259237a5724830)): ?>
<?php $attributes = $__attributesOriginalc295f12dca9d42f28a259237a5724830; ?>
<?php unset($__attributesOriginalc295f12dca9d42f28a259237a5724830); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc295f12dca9d42f28a259237a5724830)): ?>
<?php $component = $__componentOriginalc295f12dca9d42f28a259237a5724830; ?>
<?php unset($__componentOriginalc295f12dca9d42f28a259237a5724830); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginalc295f12dca9d42f28a259237a5724830 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc295f12dca9d42f28a259237a5724830 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.nav-link','data' => ['href' => route('suscripciones.index'),'active' => request()->routeIs('suscripciones.index')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('nav-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('suscripciones.index')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('suscripciones.index'))]); ?>
                                <?php echo e(__('Gestion de planes')); ?>

                             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc295f12dca9d42f28a259237a5724830)): ?>
<?php $attributes = $__attributesOriginalc295f12dca9d42f28a259237a5724830; ?>
<?php unset($__attributesOriginalc295f12dca9d42f28a259237a5724830); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc295f12dca9d42f28a259237a5724830)): ?>
<?php $component = $__componentOriginalc295f12dca9d42f28a259237a5724830; ?>
<?php unset($__componentOriginalc295f12dca9d42f28a259237a5724830); ?>
<?php endif; ?>
                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
                    </div>
                <?php endif; ?><!--[if ENDBLOCK]><![endif]-->

                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Memoria')).'','active' => $isMemoryActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Memoria')).'','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isMemoryActive)]); ?>
                        <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.memoria-calculo'),'active' => request()->routeIs('calculadora.asistente.memoria-calculo')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.memoria-calculo')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.memoria-calculo'))]); ?>
                            <?php echo e(__('Memoria Calculo')); ?>

                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.memoria-descriptiva'),'active' => request()->routeIs('calculadora.asistente.memoria-descriptiva*')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.memoria-descriptiva')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.memoria-descriptiva*'))]); ?>
                            <?php echo e(__('Memoria Descriptiva')); ?>

                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
                </div>
                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Estudiante')).'','active' => $isStudentActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Estudiante')).'','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isStudentActive)]); ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Concreto Armado')).'','links' => [
                            [
                                'url' => route('calculadora.estudiante.cav2.metrados'),
                                'label' => 'Metrados',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.escaleras'),
                                'label' => 'Escaleras',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.zapatas'),
                                'label' => 'Zapatas',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.combinacion-de-cargas'),
                                'label' => 'Combinacion de Cargas',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.viguetas'),
                                'label' => 'Viguetas',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.voladitos'),
                                'label' => 'Voladitos',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.verificacion-de-deflexiones'),
                                'label' => 'Verificacion de Deflexiones',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.aligerados'),
                                'label' => 'Aligerados',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.distribucion-del-acero'),
                                'label' => 'Distribución del Acero',
                            ],
                             [
                                 'url' => route('calculadora.estudiante.cav2.vigas-continuas'),
                                 'label' => 'Vigas Continuas',
                             ],
                             [
                                 'url' => route('calculadora.estudiante.cav2.viga-t'),
                                 'label' => 'Viga T',
                             ],
                         ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Concreto Armado')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            [
                                'url' => route('calculadora.estudiante.cav2.metrados'),
                                'label' => 'Metrados',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.escaleras'),
                                'label' => 'Escaleras',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.zapatas'),
                                'label' => 'Zapatas',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.combinacion-de-cargas'),
                                'label' => 'Combinacion de Cargas',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.viguetas'),
                                'label' => 'Viguetas',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.voladitos'),
                                'label' => 'Voladitos',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.verificacion-de-deflexiones'),
                                'label' => 'Verificacion de Deflexiones',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.aligerados'),
                                'label' => 'Aligerados',
                            ],
                            [
                                'url' => route('calculadora.estudiante.cav2.distribucion-del-acero'),
                                'label' => 'Distribución del Acero',
                            ],
                             [
                                 'url' => route('calculadora.estudiante.cav2.vigas-continuas'),
                                 'label' => 'Vigas Continuas',
                             ],
                             [
                                 'url' => route('calculadora.estudiante.cav2.viga-t'),
                                 'label' => 'Viga T',
                             ],
                         ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
                </div>
                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Asistente')).'','active' => $isAssistantActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Asistente')).'','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isAssistantActive)]); ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Vigas')).'','links' => [
                            ['url' => route('calculadora.asistente.vigas'), 'label' => 'Diseño de Vigas'],
                            [
                                'url' => route('calculadora.asistente.vigas-general'),
                                'label' => 'Diseño de Vigas General',
                            ],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Vigas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            ['url' => route('calculadora.asistente.vigas'), 'label' => 'Diseño de Vigas'],
                            [
                                'url' => route('calculadora.asistente.vigas-general'),
                                'label' => 'Diseño de Vigas General',
                            ],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.escaleras'),'active' => request()->routeIs('calculadora.asistente.escaleras')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.escaleras')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.escaleras'))]); ?>
                            <?php echo e(__('Escaleras')); ?>

                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Losas')).'','links' => [
                            [
                                'url' => route('calculadora.asistente.losas-macizas'),
                                'label' => 'Diseño de Losas Macizas',
                            ],
                            [
                                'url' => route('calculadora.asistente.losas-aligeradas'),
                                'label' => 'Diseño de Losas Aligeradas',
                            ],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Losas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            [
                                'url' => route('calculadora.asistente.losas-macizas'),
                                'label' => 'Diseño de Losas Macizas',
                            ],
                            [
                                'url' => route('calculadora.asistente.losas-aligeradas'),
                                'label' => 'Diseño de Losas Aligeradas',
                            ],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Muros')).'','links' => [
                            [
                                'url' => route('calculadora.asistente.muros-de-contencion'),
                                'label' => 'Diseño de Muros de Contención',
                            ],
                            [
                                'url' => route('calculadora.asistente.muros-de-albanieria'),
                                'label' => 'Diseño de Muros de Albañieria',
                            ],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Muros')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            [
                                'url' => route('calculadora.asistente.muros-de-contencion'),
                                'label' => 'Diseño de Muros de Contención',
                            ],
                            [
                                'url' => route('calculadora.asistente.muros-de-albanieria'),
                                'label' => 'Diseño de Muros de Albañieria',
                            ],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.cimiento-corrido'),'active' => request()->routeIs('calculadora.asistente.cimiento-corrido')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.cimiento-corrido')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.cimiento-corrido'))]); ?>
                            <?php echo e(__('Cimiento Corrido')); ?>

                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Columnas')).'','links' => [
                            [
                                'url' => route('calculadora.asistente.columna-de-acero'),
                                'label' => 'Diseño de Columnas de Acero',
                            ],
                            [
                                'url' => route('calculadora.asistente.columna'),
                                'label' => 'Diseño de Columnas',
                            ],
                            [
                                'url' => route('calculadora.asistente.columna-ii'),
                                'label' => 'Diseño de Columnas II',
                            ],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Columnas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            [
                                'url' => route('calculadora.asistente.columna-de-acero'),
                                'label' => 'Diseño de Columnas de Acero',
                            ],
                            [
                                'url' => route('calculadora.asistente.columna'),
                                'label' => 'Diseño de Columnas',
                            ],
                            [
                                'url' => route('calculadora.asistente.columna-ii'),
                                'label' => 'Diseño de Columnas II',
                            ],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Zapatas')).'','links' => [
                            [
                                'url' => route('calculadora.asistente.zapata-combinada'),
                                'label' => 'Diseño de Zapata Combinada',
                            ],
                            [
                                'url' => route('calculadora.asistente.zapata-conectada'),
                                'label' => 'Diseño de Zapata Conectada',
                            ],
                            [
                                'url' => route('calculadora.asistente.zapata-general'),
                                'label' => 'Diseño de Zapata General',
                            ],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Zapatas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            [
                                'url' => route('calculadora.asistente.zapata-combinada'),
                                'label' => 'Diseño de Zapata Combinada',
                            ],
                            [
                                'url' => route('calculadora.asistente.zapata-conectada'),
                                'label' => 'Diseño de Zapata Conectada',
                            ],
                            [
                                'url' => route('calculadora.asistente.zapata-general'),
                                'label' => 'Diseño de Zapata General',
                            ],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Placas')).'','links' => [
                            [
                                'url' => route('calculadora.asistente.placas-L'),
                                'label' => 'Diseño de Placas L',
                            ],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Placas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            [
                                'url' => route('calculadora.asistente.placas-L'),
                                'label' => 'Diseño de Placas L',
                            ],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.cerco-perimetrico'),'active' => request()->routeIs('calculadora.asistente.cerco-perimetrico')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.cerco-perimetrico')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.cerco-perimetrico'))]); ?>
                            <?php echo e(__('Diseño de Cerco Perimetrico')); ?>

                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.irregularidades'),'active' => request()->routeIs('calculadora.asistente.irregularidades')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.irregularidades')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.irregularidades'))]); ?>
                            <?php echo e(__('Irregularidades')); ?>

                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.espectro-sismico'),'active' => request()->routeIs('calculadora.asistente.espectro-sismico')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.espectro-sismico')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.espectro-sismico'))]); ?>
                            <?php echo e(__('Epectro Simico')); ?>

                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Diseño En Madera')).'','links' => [
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.correas'),
                                'label' => 'Diseño de Correas',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.flexo-compresion'),
                                'label' => 'Flexocompresion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.compresion'),
                                'label' => 'Compresion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.traccion'),
                                'label' => 'Traccion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.flexo-traccion'),
                                'label' => 'Flexotraccion',
                            ],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Diseño En Madera')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.correas'),
                                'label' => 'Diseño de Correas',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.flexo-compresion'),
                                'label' => 'Flexocompresion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.compresion'),
                                'label' => 'Compresion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.traccion'),
                                'label' => 'Traccion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-madera.flexo-traccion'),
                                'label' => 'Flexotraccion',
                            ],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Diseño En Acero')).'','links' => [
                            [
                                'url' => route('calculadora.asistente.diseno-en-acero.compresion'),
                                'label' => 'Compresion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-acero.traccion'),
                                'label' => 'Traccion',
                            ],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Diseño En Acero')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            [
                                'url' => route('calculadora.asistente.diseno-en-acero.compresion'),
                                'label' => 'Compresion',
                            ],
                            [
                                'url' => route('calculadora.asistente.diseno-en-acero.traccion'),
                                'label' => 'Traccion',
                            ],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
                </div>
                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Diseñador')).'','active' => $isDesignerActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Diseñador')).'','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isDesignerActive)]); ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Suelos')).'','links' => [
                            [
                                'url' => route('software.suelos.distribucion-de-esfuerzos'),
                                'label' => 'Distribucion de Esfuerzos',
                            ],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Suelos')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            [
                                'url' => route('software.suelos.distribucion-de-esfuerzos'),
                                'label' => 'Distribucion de Esfuerzos',
                            ],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Programas')).'','links' => [
                            ['url' => route('software.aligerados-v1'), 'label' => 'Aligerados v1.0'],
                            ['url' => route('software.aligerados-v2'), 'label' => 'Aligerados v2.0'],
                            ['url' => route('software.cimentacion-v1'), 'label' => 'Cimentacion v1.0'],
                            ['url' => route('software.cimentacion-v2'), 'label' => 'Cimentacion v2.0'],
                            [
                                'url' => route('software.analisis-estructural-de-armaduras'),
                                'label' => 'Analisis Estructural',
                            ],
                            ['url' => route('software.etabs2'), 'label' => 'Etabs 2'],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Programas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            ['url' => route('software.aligerados-v1'), 'label' => 'Aligerados v1.0'],
                            ['url' => route('software.aligerados-v2'), 'label' => 'Aligerados v2.0'],
                            ['url' => route('software.cimentacion-v1'), 'label' => 'Cimentacion v1.0'],
                            ['url' => route('software.cimentacion-v2'), 'label' => 'Cimentacion v2.0'],
                            [
                                'url' => route('software.analisis-estructural-de-armaduras'),
                                'label' => 'Analisis Estructural',
                            ],
                            ['url' => route('software.etabs2'), 'label' => 'Etabs 2'],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>

                        <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('software.predimv2'),'active' => request()->routeIs('software.predimv2')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('software.predimv2')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('software.predimv2'))]); ?>
                            <?php echo e(__('Predim')); ?>

                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.estudiante.arco_techo'),'active' => request()->routeIs('calculadora.estudiante.arco_techo')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.estudiante.arco_techo')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.estudiante.arco_techo'))]); ?>
                            <?php echo e(__('Arco Techo')); ?>

                         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
                </div>
                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Revisor')).'','active' => $isReviewerActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Revisor')).'','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isReviewerActive)]); ?>

                        <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Verificacion')).'','links' => [
                            ['url' => route('software.anclaje-v1'), 'label' => 'Anclaje'],
                            ['url' => route('software.base-dinamica-v1'), 'label' => 'Bases Dinamicas'],
                            ['url' => route('software.estribo-columna-placa-v1'), 'label' => 'Estribo Columna Placa'],
                            ['url' => route('software.estribo-placa-v1'), 'label' => 'Estribo de Placas'],
                            ['url' => route('software.predim-viga-v1'), 'label' => 'Predim Viga'],
                            ['url' => route('software.verificacion-viga-v1'), 'label' => 'Viga Verifica'],
                            ['url' => route('calculadora.estudiante.cav2.hoja2'), 'label' => 'VRD-ALIG'],
                        ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Verificacion')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                            ['url' => route('software.anclaje-v1'), 'label' => 'Anclaje'],
                            ['url' => route('software.base-dinamica-v1'), 'label' => 'Bases Dinamicas'],
                            ['url' => route('software.estribo-columna-placa-v1'), 'label' => 'Estribo Columna Placa'],
                            ['url' => route('software.estribo-placa-v1'), 'label' => 'Estribo de Placas'],
                            ['url' => route('software.predim-viga-v1'), 'label' => 'Predim Viga'],
                            ['url' => route('software.verificacion-viga-v1'), 'label' => 'Viga Verifica'],
                            ['url' => route('calculadora.estudiante.cav2.hoja2'), 'label' => 'VRD-ALIG'],
                        ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>

                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
                </div>

                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <?php if (isset($component)) { $__componentOriginal6cced52613a484e7295a90162a92d81b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6cced52613a484e7295a90162a92d81b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.nav-item','data' => ['@click' => 'toggle()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'toggle()']); ?><?php if (isset($component)) { $__componentOriginal6aca4e55c24dbdda73e90558093d8e26 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6aca4e55c24dbdda73e90558093d8e26 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.svg.calculator','data' => ['class' => 'h-5']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('svg.calculator'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'h-5']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6aca4e55c24dbdda73e90558093d8e26)): ?>
<?php $attributes = $__attributesOriginal6aca4e55c24dbdda73e90558093d8e26; ?>
<?php unset($__attributesOriginal6aca4e55c24dbdda73e90558093d8e26); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6aca4e55c24dbdda73e90558093d8e26)): ?>
<?php $component = $__componentOriginal6aca4e55c24dbdda73e90558093d8e26; ?>
<?php unset($__componentOriginal6aca4e55c24dbdda73e90558093d8e26); ?>
<?php endif; ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6cced52613a484e7295a90162a92d81b)): ?>
<?php $attributes = $__attributesOriginal6cced52613a484e7295a90162a92d81b; ?>
<?php unset($__attributesOriginal6cced52613a484e7295a90162a92d81b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6cced52613a484e7295a90162a92d81b)): ?>
<?php $component = $__componentOriginal6cced52613a484e7295a90162a92d81b; ?>
<?php unset($__componentOriginal6cced52613a484e7295a90162a92d81b); ?>
<?php endif; ?>
                </div>
            </div>

            <!-- Settings Dropdown -->
            <!--[if BLOCK]><![endif]--><?php if(auth()->guard()->check()): ?>
                <div class="hidden sm:flex sm:items-center sm:ms-6">
                    <?php if (isset($component)) { $__componentOriginaldf8083d4a852c446488d8d384bbc7cbe = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginaldf8083d4a852c446488d8d384bbc7cbe = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown','data' => ['align' => 'right','width' => '48']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['align' => 'right','width' => '48']); ?>
                        
                         <?php $__env->slot('trigger', null, []); ?> 
                            <button
                                class="flex items-center gap-3 rounded-full focus:outline-none transition duration-150 ease-in-out group"
                                aria-label="User menu" aria-haspopup="true">

                                
                                <div
                                    class="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold group-hover:scale-105 transition">
                                    <?php echo e(strtoupper(substr(auth()->user()->name, 0, 2))); ?>

                                </div>
                            </button>
                         <?php $__env->endSlot(); ?>

                        
                         <?php $__env->slot('content', null, []); ?> 
                            <div
                                class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <span x-data="{ name: '<?php echo e(auth()->user()->name); ?>' }" x-text="name"
                                    x-on:profile-updated.window="name = $event.detail.name"></span>
                            </div>

                            
                            <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('profile')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('profile'))]); ?>
                                <?php echo e(__('Perfil')); ?>

                             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>

                            
                            <button class="w-full text-start" wire:click="logout"> <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo e(__('Log Out')); ?>

                                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?> </button>
                         <?php $__env->endSlot(); ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginaldf8083d4a852c446488d8d384bbc7cbe)): ?>
<?php $attributes = $__attributesOriginaldf8083d4a852c446488d8d384bbc7cbe; ?>
<?php unset($__attributesOriginaldf8083d4a852c446488d8d384bbc7cbe); ?>
<?php endif; ?>
<?php if (isset($__componentOriginaldf8083d4a852c446488d8d384bbc7cbe)): ?>
<?php $component = $__componentOriginaldf8083d4a852c446488d8d384bbc7cbe; ?>
<?php unset($__componentOriginaldf8083d4a852c446488d8d384bbc7cbe); ?>
<?php endif; ?>
                </div>
            <?php endif; ?><!--[if ENDBLOCK]><![endif]-->

            <!-- Hamburger -->
            <div class="-me-2 flex items-center sm:hidden">
                <button
                    class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                    @click="open = ! open">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path class="inline-flex" :class="{ 'hidden': open, 'inline-flex': !open }"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                        <path class="hidden" :class="{ 'hidden': !open, 'inline-flex': open }" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Responsive Navigation Menu -->
    <div class="hidden sm:hidden" :class="{ 'block': open, 'hidden': !open }">
        <div class="space-y-1 pb-3 pt-2">
            <?php if (isset($component)) { $__componentOriginald69b52d99510f1e7cd3d80070b28ca18 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald69b52d99510f1e7cd3d80070b28ca18 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.responsive-nav-link','data' => ['component' => 'responsive-nav-item','href' => route('dashboard'),'active' => request()->routeIs('dashboard')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('responsive-nav-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['component' => 'responsive-nav-item','href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('dashboard')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('dashboard'))]); ?>
                <?php echo e(__('Inicio')); ?>

             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald69b52d99510f1e7cd3d80070b28ca18)): ?>
<?php $attributes = $__attributesOriginald69b52d99510f1e7cd3d80070b28ca18; ?>
<?php unset($__attributesOriginald69b52d99510f1e7cd3d80070b28ca18); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald69b52d99510f1e7cd3d80070b28ca18)): ?>
<?php $component = $__componentOriginald69b52d99510f1e7cd3d80070b28ca18; ?>
<?php unset($__componentOriginald69b52d99510f1e7cd3d80070b28ca18); ?>
<?php endif; ?>
        </div>
        <!--[if BLOCK]><![endif]--><?php if($canManagePlans): ?>
            <div class="space-y-1 pb-3 pt-2">
                <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Planes')).'','component' => 'responsive-nav-item','active' => request()->routeIs(['planUser.*', 'suscripciones.*'])]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Planes')).'','component' => 'responsive-nav-item','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs(['planUser.*', 'suscripciones.*']))]); ?>
                    <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('planUser.index'),'active' => request()->routeIs('planUser.index')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('planUser.index')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('planUser.index'))]); ?>
                        <?php echo e(__('Gestion de Usuario')); ?>

                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('suscripciones.index'),'active' => request()->routeIs('suscripciones.index')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('suscripciones.index')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('suscripciones.index'))]); ?>
                        <?php echo e(__('Gestion de planes')); ?>

                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
            </div>
        <?php endif; ?><!--[if ENDBLOCK]><![endif]-->
        <div class="space-y-1 pb-3 pt-2">
            <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Memoria')).'','component' => 'responsive-nav-item','active' => $isMemoryActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Memoria')).'','component' => 'responsive-nav-item','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isMemoryActive)]); ?>
                <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.memoria-calculo'),'active' => request()->routeIs('calculadora.asistente.memoria-calculo')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.memoria-calculo')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.memoria-calculo'))]); ?>
                    <?php echo e(__('Memoria Calculo')); ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.memoria-descriptiva'),'active' => request()->routeIs('calculadora.asistente.memoria-descriptiva*')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.memoria-descriptiva')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.memoria-descriptiva*'))]); ?>
                    <?php echo e(__('Memoria Descriptiva')); ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Estudiante')).'','component' => 'responsive-nav-item','active' => $isStudentActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Estudiante')).'','component' => 'responsive-nav-item','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isStudentActive)]); ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Concreto Armado')).'','links' => [
                    [
                        'url' => route('calculadora.estudiante.cav2.metrados'),
                        'label' => 'Metrados',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.escaleras'),
                        'label' => 'Escaleras',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.zapatas'),
                        'label' => 'Zapatas',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.combinacion-de-cargas'),
                        'label' => 'Combinacion de Cargas',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.viguetas'),
                        'label' => 'Viguetas',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.voladitos'),
                        'label' => 'Voladitos',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.verificacion-de-deflexiones'),
                        'label' => 'Verificacion de Deflexiones',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.aligerados'),
                        'label' => 'Aligerados',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.distribucion-del-acero'),
                        'label' => 'Distribución del Acero',
                    ],
                     [
                         'url' => route('calculadora.estudiante.cav2.vigas-continuas'),
                         'label' => 'Vigas Continuas',
                     ],
                     [
                         'url' => route('calculadora.estudiante.cav2.viga-t'),
                         'label' => 'Viga T',
                     ],
                 ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Concreto Armado')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    [
                        'url' => route('calculadora.estudiante.cav2.metrados'),
                        'label' => 'Metrados',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.escaleras'),
                        'label' => 'Escaleras',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.zapatas'),
                        'label' => 'Zapatas',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.combinacion-de-cargas'),
                        'label' => 'Combinacion de Cargas',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.viguetas'),
                        'label' => 'Viguetas',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.voladitos'),
                        'label' => 'Voladitos',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.verificacion-de-deflexiones'),
                        'label' => 'Verificacion de Deflexiones',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.aligerados'),
                        'label' => 'Aligerados',
                    ],
                    [
                        'url' => route('calculadora.estudiante.cav2.distribucion-del-acero'),
                        'label' => 'Distribución del Acero',
                    ],
                     [
                         'url' => route('calculadora.estudiante.cav2.vigas-continuas'),
                         'label' => 'Vigas Continuas',
                     ],
                     [
                         'url' => route('calculadora.estudiante.cav2.viga-t'),
                         'label' => 'Viga T',
                     ],
                 ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Asistente')).'','component' => 'responsive-nav-item','active' => $isAssistantActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Asistente')).'','component' => 'responsive-nav-item','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isAssistantActive)]); ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Vigas')).'','links' => [
                    ['url' => route('calculadora.asistente.vigas'), 'label' => 'Diseño de Vigas'],
                    ['url' => route('calculadora.asistente.vigas-general'), 'label' => 'Diseño de Vigas General'],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Vigas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    ['url' => route('calculadora.asistente.vigas'), 'label' => 'Diseño de Vigas'],
                    ['url' => route('calculadora.asistente.vigas-general'), 'label' => 'Diseño de Vigas General'],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Losas')).'','links' => [
                    ['url' => route('calculadora.asistente.losas-macizas'), 'label' => 'Diseño de Losas Macizas'],
                    ['url' => route('calculadora.asistente.losas-aligeradas'), 'label' => 'Diseño de Losas Aligeradas'],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Losas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    ['url' => route('calculadora.asistente.losas-macizas'), 'label' => 'Diseño de Losas Macizas'],
                    ['url' => route('calculadora.asistente.losas-aligeradas'), 'label' => 'Diseño de Losas Aligeradas'],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Muros')).'','links' => [
                    [
                        'url' => route('calculadora.asistente.muros-de-contencion'),
                        'label' => 'Diseño de Muros de Contención',
                    ],
                    [
                        'url' => route('calculadora.asistente.muros-de-albanieria'),
                        'label' => 'Diseño de Muros de Albañieria',
                    ],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Muros')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    [
                        'url' => route('calculadora.asistente.muros-de-contencion'),
                        'label' => 'Diseño de Muros de Contención',
                    ],
                    [
                        'url' => route('calculadora.asistente.muros-de-albanieria'),
                        'label' => 'Diseño de Muros de Albañieria',
                    ],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.cimiento-corrido'),'active' => request()->routeIs('calculadora.asistente.cimiento-corrido')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.cimiento-corrido')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.cimiento-corrido'))]); ?>
                    <?php echo e(__('Cimiento Corrido')); ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Columnas')).'','links' => [
                    [
                        'url' => route('calculadora.asistente.columna-de-acero'),
                        'label' => 'Diseño de Columnas de Acero',
                    ],
                    [
                        'url' => route('calculadora.asistente.columna'),
                        'label' => 'Diseño de Columnas',
                    ],
                    [
                        'url' => route('calculadora.asistente.columna-ii'),
                        'label' => 'Diseño de Columnas II',
                    ],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Columnas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    [
                        'url' => route('calculadora.asistente.columna-de-acero'),
                        'label' => 'Diseño de Columnas de Acero',
                    ],
                    [
                        'url' => route('calculadora.asistente.columna'),
                        'label' => 'Diseño de Columnas',
                    ],
                    [
                        'url' => route('calculadora.asistente.columna-ii'),
                        'label' => 'Diseño de Columnas II',
                    ],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Zapatas')).'','links' => [
                    [
                        'url' => route('calculadora.asistente.zapata-combinada'),
                        'label' => 'Diseño de Zapata Combinada',
                    ],
                    [
                        'url' => route('calculadora.asistente.zapata-conectada'),
                        'label' => 'Diseño de Zapata Conectada',
                    ],
                    [
                        'url' => route('calculadora.asistente.zapata-general'),
                        'label' => 'Diseño de Zapata General',
                    ],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Zapatas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    [
                        'url' => route('calculadora.asistente.zapata-combinada'),
                        'label' => 'Diseño de Zapata Combinada',
                    ],
                    [
                        'url' => route('calculadora.asistente.zapata-conectada'),
                        'label' => 'Diseño de Zapata Conectada',
                    ],
                    [
                        'url' => route('calculadora.asistente.zapata-general'),
                        'label' => 'Diseño de Zapata General',
                    ],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Placas')).'','links' => [
                    [
                        'url' => route('calculadora.asistente.placas-L'),
                        'label' => 'Diseño de Placas L',
                    ],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Placas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    [
                        'url' => route('calculadora.asistente.placas-L'),
                        'label' => 'Diseño de Placas L',
                    ],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.cerco-perimetrico'),'active' => request()->routeIs('calculadora.asistente.cerco-perimetrico')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.cerco-perimetrico')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.cerco-perimetrico'))]); ?>
                    <?php echo e(__('Diseño de Cerco Perimetrico')); ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.irregularidades'),'active' => request()->routeIs('calculadora.asistente.irregularidades')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.irregularidades')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.irregularidades'))]); ?>
                    <?php echo e(__('Irregularidades')); ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.asistente.espectro-sismico'),'active' => request()->routeIs('calculadora.asistente.espectro-sismico')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.asistente.espectro-sismico')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.asistente.espectro-sismico'))]); ?>
                    <?php echo e(__('Epectro Simico')); ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Diseño En Madera')).'','links' => [
                    ['url' => route('calculadora.asistente.diseno-en-madera.correas'), 'label' => 'Diseño de Correas'],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.flexo-compresion'),
                        'label' => 'Flexocompresion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.compresion'),
                        'label' => 'Compresion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.traccion'),
                        'label' => 'Traccion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.flexo-traccion'),
                        'label' => 'Flexotraccion',
                    ],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Diseño En Madera')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    ['url' => route('calculadora.asistente.diseno-en-madera.correas'), 'label' => 'Diseño de Correas'],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.flexo-compresion'),
                        'label' => 'Flexocompresion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.compresion'),
                        'label' => 'Compresion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.traccion'),
                        'label' => 'Traccion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-madera.flexo-traccion'),
                        'label' => 'Flexotraccion',
                    ],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Diseño En Acero')).'','links' => [
                    [
                        'url' => route('calculadora.asistente.diseno-en-acero.compresion'),
                        'label' => 'Compresion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-acero.traccion'),
                        'label' => 'Traccion',
                    ],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Diseño En Acero')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    [
                        'url' => route('calculadora.asistente.diseno-en-acero.compresion'),
                        'label' => 'Compresion',
                    ],
                    [
                        'url' => route('calculadora.asistente.diseno-en-acero.traccion'),
                        'label' => 'Traccion',
                    ],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Diseñador')).'','component' => 'responsive-nav-item','active' => $isDesignerActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Diseñador')).'','component' => 'responsive-nav-item','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isDesignerActive)]); ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Suelos')).'','links' => [
                    [
                        'url' => route('software.suelos.distribucion-de-esfuerzos'),
                        'label' => 'Distribucion de Esfuerzos',
                    ],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Suelos')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    [
                        'url' => route('software.suelos.distribucion-de-esfuerzos'),
                        'label' => 'Distribucion de Esfuerzos',
                    ],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Programas')).'','links' => [
                    ['url' => route('software.aligerados-v1'), 'label' => 'Aligerados v1.0'],
                    ['url' => route('software.aligerados-v2'), 'label' => 'Aligerados v2.0'],
                    ['url' => route('software.cimentacion-v1'), 'label' => 'Cimentacion v1.0'],
                    ['url' => route('software.cimentacion-v2'), 'label' => 'Cimentacion v2.0'],
                    ['url' => route('software.analisis-estructural-de-armaduras'), 'label' => 'Analisis Estructural'],
                    ['url' => route('software.etabs2'), 'label' => 'Etabs 2'],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Programas')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    ['url' => route('software.aligerados-v1'), 'label' => 'Aligerados v1.0'],
                    ['url' => route('software.aligerados-v2'), 'label' => 'Aligerados v2.0'],
                    ['url' => route('software.cimentacion-v1'), 'label' => 'Cimentacion v1.0'],
                    ['url' => route('software.cimentacion-v2'), 'label' => 'Cimentacion v2.0'],
                    ['url' => route('software.analisis-estructural-de-armaduras'), 'label' => 'Analisis Estructural'],
                    ['url' => route('software.etabs2'), 'label' => 'Etabs 2'],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('software.predimv2'),'active' => request()->routeIs('software.predimv2')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('software.predimv2')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('software.predimv2'))]); ?>
                    <?php echo e(__('Predim')); ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal68cb1971a2b92c9735f83359058f7108 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal68cb1971a2b92c9735f83359058f7108 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-link','data' => ['href' => route('calculadora.estudiante.arco_techo'),'active' => request()->routeIs('calculadora.estudiante.arco_techo')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('calculadora.estudiante.arco_techo')),'active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(request()->routeIs('calculadora.estudiante.arco_techo'))]); ?>
                    <?php echo e(__('Arco Techo')); ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $attributes = $__attributesOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__attributesOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal68cb1971a2b92c9735f83359058f7108)): ?>
<?php $component = $__componentOriginal68cb1971a2b92c9735f83359058f7108; ?>
<?php unset($__componentOriginal68cb1971a2b92c9735f83359058f7108); ?>
<?php endif; ?>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <?php if (isset($component)) { $__componentOriginala12a407a418a1f3d31022e577562078b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala12a407a418a1f3d31022e577562078b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-nav-item','data' => ['name' => ''.e(__('Revisor')).'','component' => 'responsive-nav-item','active' => $isReviewerActive]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e(__('Revisor')).'','component' => 'responsive-nav-item','active' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($isReviewerActive)]); ?>
                <?php if (isset($component)) { $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-sub','data' => ['label' => ''.e(__('Verificacion')).'','links' => [
                    ['url' => route('software.anclaje-v1'), 'label' => 'Anclaje'],
                    ['url' => route('software.base-dinamica-v1'), 'label' => 'Bases Dinamicas'],
                    ['url' => route('software.estribo-columna-placa-v1'), 'label' => 'Estribo Columna Placa'],
                    ['url' => route('software.estribo-placa-v1'), 'label' => 'Estribo de Placas'],
                    ['url' => route('software.predim-viga-v1'), 'label' => 'Predim Viga'],
                    ['url' => route('software.verificacion-viga-v1'), 'label' => 'Viga Verifica'],
                    ['url' => route('calculadora.estudiante.cav2.hoja2'), 'label' => 'VRD-ALIG'],
                ]]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('dropdown-sub'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => ''.e(__('Verificacion')).'','links' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute([
                    ['url' => route('software.anclaje-v1'), 'label' => 'Anclaje'],
                    ['url' => route('software.base-dinamica-v1'), 'label' => 'Bases Dinamicas'],
                    ['url' => route('software.estribo-columna-placa-v1'), 'label' => 'Estribo Columna Placa'],
                    ['url' => route('software.estribo-placa-v1'), 'label' => 'Estribo de Placas'],
                    ['url' => route('software.predim-viga-v1'), 'label' => 'Predim Viga'],
                    ['url' => route('software.verificacion-viga-v1'), 'label' => 'Viga Verifica'],
                    ['url' => route('calculadora.estudiante.cav2.hoja2'), 'label' => 'VRD-ALIG'],
                ])]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $attributes = $__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__attributesOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96)): ?>
<?php $component = $__componentOriginal811a1e27e202fca2f58dcc131dfb2e96; ?>
<?php unset($__componentOriginal811a1e27e202fca2f58dcc131dfb2e96); ?>
<?php endif; ?>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $attributes = $__attributesOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__attributesOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala12a407a418a1f3d31022e577562078b)): ?>
<?php $component = $__componentOriginala12a407a418a1f3d31022e577562078b; ?>
<?php unset($__componentOriginala12a407a418a1f3d31022e577562078b); ?>
<?php endif; ?>
        </div>
        <div class="space-y-1 pb-3 pt-2">
            <?php if (isset($component)) { $__componentOriginalcda88838beaa77f9b60ceac100923444 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcda88838beaa77f9b60ceac100923444 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.responsive-nav-item','data' => ['@click' => 'toggle()']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('responsive-nav-item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'toggle()']); ?><?php if (isset($component)) { $__componentOriginal6aca4e55c24dbdda73e90558093d8e26 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6aca4e55c24dbdda73e90558093d8e26 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.svg.calculator','data' => ['class' => 'h-5']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('svg.calculator'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'h-5']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6aca4e55c24dbdda73e90558093d8e26)): ?>
<?php $attributes = $__attributesOriginal6aca4e55c24dbdda73e90558093d8e26; ?>
<?php unset($__attributesOriginal6aca4e55c24dbdda73e90558093d8e26); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6aca4e55c24dbdda73e90558093d8e26)): ?>
<?php $component = $__componentOriginal6aca4e55c24dbdda73e90558093d8e26; ?>
<?php unset($__componentOriginal6aca4e55c24dbdda73e90558093d8e26); ?>
<?php endif; ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcda88838beaa77f9b60ceac100923444)): ?>
<?php $attributes = $__attributesOriginalcda88838beaa77f9b60ceac100923444; ?>
<?php unset($__attributesOriginalcda88838beaa77f9b60ceac100923444); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcda88838beaa77f9b60ceac100923444)): ?>
<?php $component = $__componentOriginalcda88838beaa77f9b60ceac100923444; ?>
<?php unset($__componentOriginalcda88838beaa77f9b60ceac100923444); ?>
<?php endif; ?>
        </div>

        <!-- Responsive Settings Options -->
        <div class="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
            <!--[if BLOCK]><![endif]--><?php if(auth()->guard()->check()): ?>
                <div class="px-4">
                    <div class="text-base font-medium text-gray-800 dark:text-gray-200" x-data="<?php echo e(json_encode(['name' => auth()->user()->name])); ?>"
                        x-text="name" x-on:profile-updated.window="name = $event.detail.name"></div>
                    <div class="text-sm font-medium text-gray-500"><?php echo e(auth()->user()->email); ?></div>
                </div>
            <?php endif; ?><!--[if ENDBLOCK]><![endif]-->
            <div class="mt-3 space-y-1">
                <?php if (isset($component)) { $__componentOriginald69b52d99510f1e7cd3d80070b28ca18 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald69b52d99510f1e7cd3d80070b28ca18 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.responsive-nav-link','data' => ['href' => route('profile')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('responsive-nav-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('profile'))]); ?>
                    <?php echo e(__('Profile')); ?>

                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald69b52d99510f1e7cd3d80070b28ca18)): ?>
<?php $attributes = $__attributesOriginald69b52d99510f1e7cd3d80070b28ca18; ?>
<?php unset($__attributesOriginald69b52d99510f1e7cd3d80070b28ca18); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald69b52d99510f1e7cd3d80070b28ca18)): ?>
<?php $component = $__componentOriginald69b52d99510f1e7cd3d80070b28ca18; ?>
<?php unset($__componentOriginald69b52d99510f1e7cd3d80070b28ca18); ?>
<?php endif; ?>

                <!-- Authentication -->
                <button class="w-full text-start" wire:click="logout">
                    <?php if (isset($component)) { $__componentOriginald69b52d99510f1e7cd3d80070b28ca18 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald69b52d99510f1e7cd3d80070b28ca18 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.responsive-nav-link','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('responsive-nav-link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                        <?php echo e(__('Log Out')); ?>

                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald69b52d99510f1e7cd3d80070b28ca18)): ?>
<?php $attributes = $__attributesOriginald69b52d99510f1e7cd3d80070b28ca18; ?>
<?php unset($__attributesOriginald69b52d99510f1e7cd3d80070b28ca18); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald69b52d99510f1e7cd3d80070b28ca18)): ?>
<?php $component = $__componentOriginald69b52d99510f1e7cd3d80070b28ca18; ?>
<?php unset($__componentOriginald69b52d99510f1e7cd3d80070b28ca18); ?>
<?php endif; ?>
                </button>
            </div>
        </div>
    </div>

    <div x-ref="calculator_dialog">
        <div style="min-width:800px;min-height:600px" x-ref="applet_container"></div>
    </div>
</nav><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views\livewire/layout/navigation.blade.php ENDPATH**/ ?>
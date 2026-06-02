<?php if (isset($component)) { $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54 = $attributes; } ?>
<?php $component = App\View\Components\AppLayout::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('app-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\AppLayout::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
    <div class="py-2">
        <div class="container mx-auto px-4">
             <?php if(session('success')): ?>
                <div class="mb-4 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <?php echo e(session('success')); ?>

                </div>
            <?php endif; ?>

            <?php if(session('error')): ?>
                <div class="mb-4 rounded-xl bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    <?php echo e(session('error')); ?>

                </div>
            <?php endif; ?>

            <div class="mb-6 flex justify-end">
                <a href="<?php echo e(route('suscripciones.create')); ?>"
                    class="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700">
                    Crear Plan
                </a>
            </div>

            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <?php $__empty_1 = true; $__currentLoopData = $suscripciones; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $plan): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <div
                        class="group relative overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-800 <?php echo e(!$plan['is_active'] ? 'opacity-60' : ''); ?>">
                        <div class="absolute right-4 top-4 z-10">
                            <span
                                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold
                            <?php if($plan['type'] === 'trial'): ?> bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400
                            <?php elseif($plan['type'] === 'monthly'): ?> bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400
                            <?php elseif($plan['type'] === 'yearly'): ?> bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400
                            <?php else: ?> bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 <?php endif; ?>">
                                <?php echo e(ucfirst($plan['type'])); ?>

                            </span>
                        </div>

                        <div class="p-6">
                            <h3 class="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                                <?php echo e($plan['name']); ?>

                            </h3>

                            <?php if($plan['description']): ?>
                                <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">
                                    <?php echo e($plan['description']); ?>

                                </p>
                            <?php endif; ?>

                            <div class="mb-4 border-b border-slate-200 pb-4 dark:border-slate-700">
                                <div class="flex items-baseline gap-2">
                                    <span class="text-4xl font-bold text-slate-900 dark:text-white">
                                        <?php echo e($plan['formatted_price']); ?>

                                    </span>
                                    <?php if(!$plan['is_lifetime'] && $plan['price'] > 0): ?>
                                        <span class="text-slate-600 dark:text-slate-400">
                                            / <?php echo e($plan['duration_text']); ?>

                                        </span>
                                    <?php endif; ?>
                                </div>
                                <?php if($plan['is_lifetime']): ?>
                                    <p class="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                                        Acceso de por vida
                                    </p>
                                <?php else: ?>
                                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        <?php echo e($plan['duration_text']); ?> de acceso
                                    </p>
                                <?php endif; ?>
                            </div>

                            <?php if(!empty($plan['features'])): ?>
                                <div class="mb-4">
                                    <h4 class="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                                        Características:
                                    </h4>
                                    <ul class="space-y-2">
                                        <?php $__currentLoopData = $plan['features']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $feature): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <li
                                                class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="none"
                                                    stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span><?php echo e($feature); ?></span>
                                            </li>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </ul>
                                </div>
                            <?php endif; ?>

                            <div class="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-slate-600 dark:text-slate-400">Suscripciones activas:</span>
                                    <span class="font-semibold text-slate-900 dark:text-white">
                                        <?php echo e($plan['active_subscriptions_count']); ?>

                                    </span>
                                </div>
                            </div>

                            <div class="mb-4">
                                <form action="<?php echo e(route('suscripciones.toggle-status', $plan['id'])); ?>" method="POST">
                                    <?php echo csrf_field(); ?>
                                    <?php echo method_field('PATCH'); ?>
                                    <button type="submit"
                                        class="w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors
                                    <?php if($plan['is_active']): ?> bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400
                                    <?php else: ?> bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 <?php endif; ?>">
                                        <?php echo e($plan['is_active'] ? '✓ Activo' : '✗ Inactivo'); ?>

                                    </button>
                                </form>
                            </div>

                            <!--<div class="flex gap-2">
                                <a href="<?php echo e(route('suscripciones.edit', $plan['id'])); ?>"
                                    class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700">
                                    Editar
                                </a>
                                <form action="<?php echo e(route('suscripciones.destroy', $plan['id'])); ?>" method="POST"
                                    onsubmit="return confirm('¿Estás seguro de eliminar este plan?')">
                                    <?php echo csrf_field(); ?>
                                    <?php echo method_field('DELETE'); ?>
                                    <button type="submit"
                                        class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700">
                                        Eliminar
                                    </button>
                                </form>
                            </div>-->
                        </div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <div class="col-span-full rounded-xl bg-white p-12 text-center shadow-lg dark:bg-slate-800">
                        <svg class="mx-auto h-16 w-16 text-slate-400" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p class="mt-4 text-lg text-slate-600 dark:text-slate-400">No se encontraron planes</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $attributes = $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $component = $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\planesUser\subscription-plans\index.blade.php ENDPATH**/ ?>
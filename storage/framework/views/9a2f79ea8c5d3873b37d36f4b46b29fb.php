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
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8" x-data="userManagement()">

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-50">Gestión de Usuarios y Planes</h1>
                <p class="text-sm text-gray-50 mt-1">Administra usuarios, roles y suscripciones</p>
            </div>
            <button @click="openCreateModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition duration-300 flex items-center">
                <i class="fas fa-plus mr-2"></i> Crear Usuario
            </button>
        </div>

        <!-- Alertas -->
        <?php if(session('success')): ?>
            <div class="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-4 rounded-lg shadow-sm"
                role="alert">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-3"></i>
                    <p class="font-medium"><?php echo e(session('success')); ?></p>
                </div>
            </div>
        <?php endif; ?>
        <?php if(session('error')): ?>
            <div class="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-4 rounded-lg shadow-sm" role="alert">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
                    <p class="font-medium"><?php echo e(session('error')); ?></p>
                </div>
            </div>
        <?php endif; ?>

        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
            <!-- Buscador -->
            <div class="p-4 bg-gray-50 border-b">
                <form method="GET" action="<?php echo e(route('planUser.index')); ?>" class="flex gap-2">
                    <div class="flex-1 relative">
                        <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                        <input type="text" name="search" placeholder="Buscar por nombre o email..."
                            value="<?php echo e(request('search')); ?>"
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <button type="submit"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
                        Buscar
                    </button>
                    <?php if(request('search')): ?>
                        <a href="<?php echo e(route('planUser.index')); ?>"
                            class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition">
                            Limpiar
                        </a>
                    <?php endif; ?>
                </form>
            </div>

            <!-- Tabla -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <i class="fas fa-user mr-1"></i> Usuario
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <i class="fas fa-user-tag mr-1"></i> Rol
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <i class="fas fa-crown mr-1"></i> Suscripción
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <i class="fas fa-toggle-on mr-1"></i> Estado
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <i class="fas fa-mobile-alt mr-1"></i> Disp.
                            </th>
                            <th
                                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <i class="fas fa-cog mr-1"></i> Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <?php $__empty_1 = true; $__currentLoopData = $users; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $user): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                            <tr class="hover:bg-gray-50 transition">
                                <td class="px-6 py-4">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <div
                                                class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                                <?php echo e(strtoupper(substr($user->name, 0, 2))); ?>

                                            </div>
                                        </div>
                                        <div class="ml-4">
                                            <div class="font-medium text-gray-900"><?php echo e($user->name); ?></div>
                                            <div class="text-sm text-gray-500"><?php echo e($user->email); ?></div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-wrap gap-1">
                                        <?php $__empty_2 = true; $__currentLoopData = $user->getRoleNames(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $role): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_2 = false; ?>
                                            <span
                                                class="px-2 py-1 text-xs font-semibold rounded-full 
                                                <?php echo e($role === 'root'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : ($role === 'gerencia'
                                                        ? 'bg-indigo-100 text-indigo-800'
                                                        : ($role === 'asistente'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'))); ?>">
                                                <?php echo e($role); ?>

                                            </span>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_2): ?>
                                            <span
                                                class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
                                                Sin rol
                                            </span>
                                        <?php endif; ?>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <?php if($user->hasActiveSubscription()): ?>
                                        <div class="flex items-center">
                                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                            <div>
                                                <span
                                                    class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    <?php echo e($user->currentSubscription->plan->name); ?>

                                                </span>
                                                <p class="text-xs text-gray-500 mt-1">
                                                    <?php if($user->subscription_ends_at): ?>
                                                        <?php
                                                            $daysRemaining = now()->diffInDays(
                                                                $user->subscription_ends_at,
                                                                false,
                                                            );
                                                            $isExpiringSoon = $daysRemaining <= 7 && $daysRemaining > 0;
                                                        ?>
                                                        <span
                                                            class="<?php echo e($isExpiringSoon ? 'text-orange-600 font-semibold' : ''); ?>">
                                                            Expira: <?php echo e($user->subscription_ends_at->format('d/m/Y')); ?>

                                                            <?php if($isExpiringSoon): ?>
                                                                <i class="fas fa-exclamation-triangle ml-1"></i>
                                                            <?php endif; ?>
                                                        </span>
                                                    <?php else: ?>
                                                        <span class="text-blue-600 font-semibold">
                                                            <i class="fas fa-infinity mr-1"></i> Vitalicio
                                                        </span>
                                                    <?php endif; ?>
                                                </p>
                                            </div>
                                        </div>
                                    <?php else: ?>
                                        <div class="flex items-center">
                                            <i class="fas fa-times-circle text-red-500 mr-2"></i>
                                            <span
                                                class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                Sin suscripción
                                            </span>
                                        </div>
                                    <?php endif; ?>
                                </td>
                                <td class="px-6 py-4">
                                    <?php if($user->is_active): ?>
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <i class="fas fa-circle text-green-500 mr-1 text-[8px]"></i> Activo
                                        </span>
                                    <?php else: ?>
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <i class="fas fa-circle text-gray-500 mr-1 text-[8px]"></i> Inactivo
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-6 py-4"><?php echo e($user->active_sessions_count); ?> dispositivo(s) activos</td>

                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-center gap-2">
                                        <button @click="openEditModal(<?php echo e(json_encode($user->load('roles'))); ?>)"
                                            class="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition"
                                            title="Editar usuario">
                                            <i class="fas fa-edit"></i> Editar
                                        </button>

                                        <button
                                            @click="openSubscriptionModal(<?php echo e(json_encode($user->load('currentSubscription.plan'))); ?>)"
                                            class="text-green-600 hover:text-green-900 text-sm font-medium transition"
                                            title="Gestionar suscripción">
                                            <i class="fas fa-crown"></i> Plan
                                        </button>

                                        <form action="<?php echo e(route('planUser.destroy', $user)); ?>" method="POST"
                                            class="inline-block"
                                            onsubmit="return confirm('¿Estás seguro de que quieres eliminar a este usuario?\n\nEsta acción no se puede deshacer y se cancelarán todas sus suscripciones.');">
                                            <?php echo csrf_field(); ?>
                                            <?php echo method_field('DELETE'); ?>
                                            <button type="submit"
                                                class="text-red-600 hover:text-red-900 text-sm font-medium transition"
                                                title="Eliminar usuario">
                                                <i class="fas fa-trash"></i> Eliminar
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                            <tr>
                                <td colspan="5" class="px-6 py-12 text-center">
                                    <div class="flex flex-col items-center">
                                        <i class="fas fa-users text-gray-300 text-5xl mb-3"></i>
                                        <p class="text-gray-500 text-lg font-medium">No se encontraron usuarios</p>
                                        <?php if(request('search')): ?>
                                            <p class="text-gray-400 text-sm mt-1">
                                                No hay resultados para "<?php echo e(request('search')); ?>"
                                            </p>
                                            <a href="<?php echo e(route('planUser.index')); ?>"
                                                class="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                Ver todos los usuarios
                                            </a>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <!-- Paginación -->
            <?php if($users->hasPages()): ?>
                <div class="px-4 py-3 bg-gray-50 border-t">
                    <?php echo e($users->links()); ?>

                </div>
            <?php endif; ?>
        </div>

        <!-- Modales -->
        <?php echo $__env->make('planesUser.usersus.modal-create-edit', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
        <?php echo $__env->make('planesUser.usersus.modal-subscription', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
    </div>

    <script>
        function userManagement() {
            return {
                showUserModal: false,
                showSubscriptionModal: false,
                showExtendForm: false,
                isEditMode: false,
                modalTitle: '',
                formAction: '',
                userData: {},
                subscriptionData: {},

                openCreateModal() {
                    this.isEditMode = false;
                    this.modalTitle = 'Crear Nuevo Usuario';
                    this.formAction = '<?php echo e(route('planUser.store')); ?>';
                    this.userData = {
                        name: '',
                        email: '',
                        roles: []
                    };
                    this.showUserModal = true;
                },

                openEditModal(user) {
                    this.isEditMode = true;
                    this.modalTitle = 'Editar Usuario';
                    this.formAction = '<?php echo e(url('planUser')); ?>/' + user.id;
                    this.userData = {
                        ...user,
                        roles: user.roles.map(role => role.name)
                    };
                    this.showUserModal = true;
                },

                openSubscriptionModal(user) {
                    this.subscriptionData = user;
                    this.showExtendForm = false;
                    this.showSubscriptionModal = true;
                },

                closeModals() {
                    this.showUserModal = false;
                    this.showSubscriptionModal = false;
                    this.showExtendForm = false;
                }
            }
        }

        // Auto-cerrar alertas después de 5 segundos
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                const alerts = document.querySelectorAll('[role="alert"]');
                alerts.forEach(alert => {
                    alert.style.transition = 'opacity 0.5s';
                    alert.style.opacity = '0';
                    setTimeout(() => alert.remove(), 500);
                });
            }, 5000);
        });
    </script>
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
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views/planesUser/usersus/index.blade.php ENDPATH**/ ?>
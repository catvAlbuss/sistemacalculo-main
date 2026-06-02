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
     <?php $__env->slot('header', null, []); ?> 
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            <?php echo e(__('Editar blog')); ?>

        </h2>
     <?php $__env->endSlot(); ?>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <!-- Formulario para editar un blog -->
                    <form action="<?php echo e(route('blogs.update', $blog)); ?>" method="POST" enctype="multipart/form-data">
                        <?php echo csrf_field(); ?>
                        <?php echo method_field('PUT'); ?>

                        <!-- Campo: Título -->
                        <div class="mb-6">
                            <label for="titulo" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Título
                            </label>
                            <input type="text" id="titulo" name="titulo" value="<?php echo e(old('titulo', $blog->titulo)); ?>"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Ingrese el título" required>
                        </div>

                        <!-- Campo: Descripción -->
                        <div class="mb-6">
                            <label for="descripcion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Descripción
                            </label>
                            <textarea id="descripcion" name="descripcion" rows="4"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Ingrese la descripción" required><?php echo e(old('descripcion', $blog->descripcion)); ?></textarea>
                        </div>

                        <!-- Campo: Ubicación -->
                        <div class="mb-6">
                            <label for="ubicacion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Ubicación
                            </label>
                            <input type="text" id="ubicacion" name="ubicacion" value="<?php echo e(old('ubicacion', $blog->ubicacion)); ?>"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Ingrese la ubicación" required>
                        </div>

                        <!-- Campo: Imagen -->
                        <div class="mb-6">
                            <label for="imagenref" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Imagen
                            </label>
                            <input type="file" id="imagenref" name="imagenref"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                accept="image/*">
                            <?php if($blog->imagenref): ?>
                                <div class="mt-4">
                                    <img src="<?php echo e(url('/assets/img/blog/' . $blog->imagenref)); ?>" alt="Imagen actual" class="w-32 h-32 object-cover rounded-lg">
                                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Imagen actual</p>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- Botón de Enviar -->
                        <button type="submit"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Actualizar Blog
                        </button>
                    </form>
                </div>
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
<?php endif; ?><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\blogs\editar.blade.php ENDPATH**/ ?>
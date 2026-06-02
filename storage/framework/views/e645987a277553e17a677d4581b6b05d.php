<nav class="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
  <div class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
    <a class="flex items-center space-x-3 rtl:space-x-reverse" href="<?php echo e(route('landing.home')); ?>">
      <img class="h-8 dark:invert" src="<?php echo e(Vite::asset('resources/img/logo_rizabalAsociados.png')); ?>" alt="Logo" />
      <span class="self-center whitespace-nowrap text-lg dark:text-white">Rizabal & Asociados</span>
    </a>
    <div class="flex space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
      <div>
        <button
          class="inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          id="dropdownDefaultButton" data-dropdown-toggle="dropdown" type="button">Prueba Gratis<svg
            class="ms-3 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="m1 1 4 4 4-4" />
          </svg>
        </button>
        <div class="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:bg-gray-700"
          id="dropdown">
          <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
            <li>
              <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                href="<?php echo e(route('landing.info.predim')); ?>">Predim
                v1.0</a>
            </li>
            <li>
              <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                href="<?php echo e(route('landing.info.arco_techo')); ?>">Techo
                Arco</a>
            </li>
          </ul>
        </div>
      </div>
      <button
        class="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        data-collapse-toggle="navbar-multi-level" type="button" aria-controls="navbar-multi-level"
        aria-expanded="false">
        <span class="sr-only">Open main menu</span>
        <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M1 1h15M1 7h15M1 13h15" />
        </svg>
      </button>
    </div>
    <div class="hidden w-full md:block md:w-auto" id="navbar-multi-level">
      <ul
        class="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 rtl:space-x-reverse dark:border-gray-700 dark:bg-gray-800 md:dark:bg-gray-900">
        <li>
          <?php if (isset($component)) { $__componentOriginalc32b8d04c7b44c4bd996067098b8a30e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e = $attributes; } ?>
<?php $component = App\View\Components\NavLinkLanding::resolve(['active' => request()->routeIs('landing.home')] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('nav-link-landing'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\NavLinkLanding::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('landing.home'))]); ?><?php echo e(__('Inicio')); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e)): ?>
<?php $attributes = $__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e; ?>
<?php unset($__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc32b8d04c7b44c4bd996067098b8a30e)): ?>
<?php $component = $__componentOriginalc32b8d04c7b44c4bd996067098b8a30e; ?>
<?php unset($__componentOriginalc32b8d04c7b44c4bd996067098b8a30e); ?>
<?php endif; ?>
        </li>
        <li>
          <?php if (isset($component)) { $__componentOriginal744c8a98fed2f0c18a23ac040269da85 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal744c8a98fed2f0c18a23ac040269da85 = $attributes; } ?>
<?php $component = App\View\Components\NavLinkSubLanding::resolve(['name' => ''.e(__('Servicios')).'','active' => request()->routeIs('landing.services.*')] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('nav-link-sub-landing'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\NavLinkSubLanding::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownNavbarLink">
              <li>
                <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  href="<?php echo e(route('landing.services.structural_design')); ?>"><?php echo e(__('Diseño Estructural')); ?></a>
              </li>
              <li>
                <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  href="<?php echo e(route('landing.services.structural_software')); ?>"><?php echo e(__('Desarrollo de Software Estructural')); ?></a>
              </li>
              <li>
                <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  href="<?php echo e(route('landing.services.structural_blueprint')); ?>"><?php echo e(__('Elaboración de Planos Estructurales')); ?></a>
              </li>
              <li>
                <a class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  href="<?php echo e(route('landing.services.metrados')); ?>"><?php echo e(__('Elaboración de Metrados')); ?></a>
              </li>
            </ul>
           <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal744c8a98fed2f0c18a23ac040269da85)): ?>
<?php $attributes = $__attributesOriginal744c8a98fed2f0c18a23ac040269da85; ?>
<?php unset($__attributesOriginal744c8a98fed2f0c18a23ac040269da85); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal744c8a98fed2f0c18a23ac040269da85)): ?>
<?php $component = $__componentOriginal744c8a98fed2f0c18a23ac040269da85; ?>
<?php unset($__componentOriginal744c8a98fed2f0c18a23ac040269da85); ?>
<?php endif; ?>
        </li>
        <li>
          <?php if (isset($component)) { $__componentOriginalc32b8d04c7b44c4bd996067098b8a30e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e = $attributes; } ?>
<?php $component = App\View\Components\NavLinkLanding::resolve(['active' => request()->routeIs('contacto.index')] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('nav-link-landing'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\NavLinkLanding::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('contacto.index'))]); ?><?php echo e(__('Contáctanos')); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e)): ?>
<?php $attributes = $__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e; ?>
<?php unset($__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc32b8d04c7b44c4bd996067098b8a30e)): ?>
<?php $component = $__componentOriginalc32b8d04c7b44c4bd996067098b8a30e; ?>
<?php unset($__componentOriginalc32b8d04c7b44c4bd996067098b8a30e); ?>
<?php endif; ?>
        </li>
        <li>
          <?php if (isset($component)) { $__componentOriginalc32b8d04c7b44c4bd996067098b8a30e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e = $attributes; } ?>
<?php $component = App\View\Components\NavLinkLanding::resolve(['active' => request()->routeIs('blogs')] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('nav-link-landing'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\NavLinkLanding::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?><?php echo e(__('Blog')); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e)): ?>
<?php $attributes = $__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e; ?>
<?php unset($__attributesOriginalc32b8d04c7b44c4bd996067098b8a30e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc32b8d04c7b44c4bd996067098b8a30e)): ?>
<?php $component = $__componentOriginalc32b8d04c7b44c4bd996067098b8a30e; ?>
<?php unset($__componentOriginalc32b8d04c7b44c4bd996067098b8a30e); ?>
<?php endif; ?>
        </li>
      </ul>
    </div>
  </div>
</nav>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\navigation-landing.blade.php ENDPATH**/ ?>